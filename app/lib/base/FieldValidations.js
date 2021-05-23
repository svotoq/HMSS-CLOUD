/*eslint-disable no-use-before-define */
sap.ui.define([
    "bstu/hmss/lib/util/Utility",
    "sap/ui/core/ValueState",
    "sap/ui/model/ParseException",
    "bstu/hmss/lib/message/Message",
    "sap/ui/core/MessageType",
    "sap/ui/model/odata/type/Decimal",
    "sap/m/CheckBox"
], function (
    Utility,
    ValueState,
    ParseException,
    Message,
    MessageType,
    DecimalType
) {
    "use strict";


    /**
     * @summary Provides generic functionality for validating fields.
     *
     * @description Validation errors raised by this module are called "inner":
     * these can be safely removed upon user interactions. Validation errors raised
     * by other parties (e.g. DataType validations, custom business validations)
     * are called "outside". These errors not should be removed from this module.
     *
     * Please note that this can be used both as a "sub" for class composition and
     * as a standalone module
     *
     * @module bstu.hmss.lib.base.FieldValidations
     */
    var FieldValidations = {

        /**
         * Check whether field can be validated or not
         * @param {sap.ui.core.Control} oField - Field to check
         * @returns {boolean} True if can be validated
         * @public
         */
        isFieldValidatable: function (oField) {
            return !!oField.getValueState && oField.getProperty("enabled");
        },

        /**
         * Check whether date field value is valid
         * @param {sap.m.DatePicker} oDateField - Field to check
         * @returns {boolean} True if valid
         * @public
         */
        isDateFieldValid: function (oDateField) {
            var dDate = oDateField.getDateValue();

            if (!dDate) {
                return true;
            }

            var iYear = dDate.getFullYear();
            var MIN_ALLOWED_YEAR = 1;
            var MAX_ALLOWED_YEAR = 9999;

            return (MIN_ALLOWED_YEAR <= iYear) && (iYear <= MAX_ALLOWED_YEAR);
        },

        /**
         * Check whether required field with regular value is valid
         * @param {sap.ui.core.Control} oValueField - Value field to check
         * @returns {boolean} True if valid
         * @public
         */
        isRequiredValueFieldValid: function (oValueField) {
            var bFieldValidatable = FieldValidations.isFieldValidatable(oValueField);

            jQuery.sap.assert(
                bFieldValidatable,
                "Field " + oValueField.getId() + " should not be validated"
            );

            if (!bFieldValidatable) {
                return true;
            }

            var sValueState = oValueField.getValueState();
            var bOutsideValidationFailed = sValueState === ValueState.Error;

            if (bOutsideValidationFailed) {
                return false;
            }

            return isFieldPopulated(oValueField);
        },

        /**
         * Check whether optional unit of measure field is valid
         * @param {sap.ui.core.Control} oUoMField - Optional UoM field to check
         * @returns {boolean} True if valid
         * @public
         */
        isOptionalUoMFieldValid: function (oUoMField) {
            var sValueState = oUoMField.getValueState();
            var bOutsideValidationFailed = sValueState === ValueState.Error &&
                !oUoMField.data("removeValidationError");

            if (bOutsideValidationFailed) {
                return false;
            }

            // UoM field is expected to be in pair with value field
            var oValueField = oUoMField.getParent().getFields()[0];
            var vValue = parseFloat(oValueField.getValue());
            var bValuePopulated = !isNaN(vValue) && vValue !== 0;

            var bUoMPopulated = isFieldPopulated(oUoMField);
            if (bValuePopulated && !bUoMPopulated) {
                return false;
            }

            return true;
        },

        /**
         * Check whether required unit of measure field is valid
         * @param {sap.ui.core.Control} oUoMField - Required UoM field to check
         * @returns {boolean} True if valid
         * @public
         */
        isRequiredUoMFieldValid: function (oUoMField) {
            if (!isFieldPopulated(oUoMField)) {
                return false;
            }

            return FieldValidations.isOptionalUoMFieldValid(oUoMField);
        },

        /**
         * Wait until all provided fields are validated
         * @param {sap.ui.core.Control[]} aFields - Fields with potential validations
         * @returns {Deferred.Promise} Deferred Object
         * @public
         */
        waitForPendingFieldValidations: function (aFields) {
            var aBusyFields = aFields.filter(function (oField) {
                return oField.getBusy();
            });

            if (!aBusyFields.length) {
                return jQuery.Deferred().resolve();
            }

            var aValidationDefers = aBusyFields.map(function (oField) {
                return oField.validate();
            });

            return jQuery.when.apply(jQuery, aValidationDefers);
        },

        /**
         * Set new validity state for a given field and notify all interested parties
         *
         * @param {sap.ui.core.Control} oField - Form field reference
         * @param {boolean} bValid - New validity state
         * @param {object} mParameters - Additional validation parameters
         * @param {boolean} bValidatorGenerated - Generated by Valero validation methods
         * @see sap.ui.base.ManagedObject "fireValidationError" for mParameters interface details
         *
         * @public
         */
        setFieldValid: function (oField, bValid, mParameters, bValidatorGenerated) {
            // Check if error is validatorGenerated, the UI5 control validation
            // error methods should not be called
            // Add own message in message generator
            // else trigger UI5 control validation events
            if (bValidatorGenerated) {
                var oMessageManager = sap.ui.getCore().getMessageManager();
                var oMessage = new Message({
                    message: mParameters.message,
                    type: MessageType.Error,
                    target: mParameters.element.getId() + "/" + mParameters.property,
                    validatorGenerated: true
                });
                oMessageManager.addMessages(oMessage);
            } else {
                var fnEventEmitter = bValid ?
                    oField.fireValidationSuccess : oField.fireValidationError;

                // Safe to call since emitters are inherited from sap.ui.core.Control
                fnEventEmitter.call(oField, mParameters);
            }

            if (oField.setValueState) {
                oField.setValueState(bValid ? ValueState.None : ValueState.Error);
            }

            if (oField.setValueStateText) {
                oField.setValueStateText(bValid ? null : mParameters.message);
            }

            if (bValid) {
                detachChangeEventListeners(oField);
            } else {
                attachChangeEventListeners(oField, mParameters);
            }
        },

        /**
         * Check if decimal places of value field and selected UoM item are equal
         * If no, update number of decimal places for value field and fire validation error
         * @param {sap.ui.core.Control} oField - Form value field reference
         * @param {number} iUoMScale - Decimal places number of selected UoM
         * @param {object} oParameters - Additional validation parameters
         * @returns {boolean} true if field scale is valid
         * @public
         */
        validateFieldScale: function (oField, iUoMScale, oParameters) {
            var oValueBinding = oField.getBinding("value");
            // If binding is composite, get value type using getBindings() method
            var oPropertyBinding = oValueBinding.getBindings ?
                oValueBinding.getBindings()[0] : oValueBinding;
            var oBoundType = oPropertyBinding.getType();
            var oValidationParams = {
                element: oField,
                property: "value"
            };

            // Get decimal places number for current field value
            var fnGetValueScale = function () {
                var sDecimalSeparator = oBoundType.oFormat.oFormatOptions.decimalSeparator;
                var sValue = oField.getValue();
                var aParsedValue = sValue.split(sDecimalSeparator);

                return aParsedValue.length > 1 ? aParsedValue[1].length : 0;
            };

            var fnIsInteger = function () {
                try {
                    var sParsedValue = oBoundType.parseValue(oField.getValue(), "string");
                    var iValue = Number(sParsedValue);
                    return iValue === (iValue | 0);

                } catch (oError) {
                    if (oError instanceof ParseException) {
                        return false;
                    }
                    throw oError;
                }
            };

            var iPrecision = oBoundType.oConstraints.precision;
            var sMaxValue = Utility.calcDecimalFieldMaxValue(iPrecision, iUoMScale);

            var oDecimalType = new DecimalType({
                emptyString: null,
                minFractionDigits: 0
            }, {
                minimum: oBoundType.oConstraints.minimum,
                maximum: sMaxValue,
                maximumExclusive: true,
                scale: iUoMScale,
                precision: iPrecision
            });

            oPropertyBinding.setType(oDecimalType, "string");

            if (!fnIsInteger() && fnGetValueScale() > iUoMScale) {
                oField.fireValidationError(jQuery.extend(true, oValidationParams, oParameters));
                return false;
            } else {
                oField.fireValidationSuccess(oValidationParams);
                // Auto-update visible value
                oValueBinding.checkUpdate(true);
                return true;
            }
        },

        /**
         * Method to validate start and end date
         * @param {object} oStartDate Start date
         * @param {object} oEndDate End date
         * @returns {boolean} true if Start Date not greater than End Date
         */
        isStartEndDateValid: function (oStartDate, oEndDate) {
            var oValidFromDate, oValidToDate;
            if (oStartDate) {
                oValidFromDate = oStartDate.getTime();
            }
            if (oEndDate) {
                oValidToDate = oEndDate.getTime();
            }
            if (oValidFromDate && oValidToDate && oValidFromDate > oValidToDate) {
                return false;
            }
            return true;
        }
    };

    var CHANGE_EVENTS = [
        "change",
        "liveChange",
        "itemsSelect",
        "selectionChange",
        "tokenUpdate"
    ];

    /**
     * Check whether the field is populated
     * @param {sap.ui.core.Control} oField - Field to check
     * @returns {boolean} True if populated
     * @private
     */
    function isFieldPopulated(oField) {
        if (typeof oField.getTokens === "function") {
            return !!oField.getTokens().length;
        }

        var sFieldMainProperty = Utility.getControlMainProperty(oField),
            oFieldMainProperty = oField.getProperty(sFieldMainProperty);

        return !!oFieldMainProperty && !!oFieldMainProperty.toString().trim();
    }

    /**
     * Attach change event listeners so that field auto-restores its validity state
     * @param {sap.ui.core.Control} oField - Field reference
     * @param {object} mParameters - Validation event parameters
     * @private
     */
    function attachChangeEventListeners(oField, mParameters) {
        if (oField.data("removeValidationError")) {
            return;
        }

        var fnChangeHandler = function (oEvent) {
            var oChangedField = oEvent.getSource();
            FieldValidations.setFieldValid(oChangedField, true, mParameters);
        };

        CHANGE_EVENTS.forEach(function (sEventName) {
            var sFnName = "attach" + sEventName[0].toUpperCase() + sEventName.substr(1);
            if (typeof oField[sFnName] === "function") {
                oField[sFnName](fnChangeHandler);
            }
        });

        oField.data("removeValidationError", fnChangeHandler);
    }

    /**
     * Detach all validation-applied event handlers
     * @param {sap.ui.core.Control} oField - Field reference
     * @private
     */
    function detachChangeEventListeners(oField) {
        var fnRemoveValidationError = oField.data("removeValidationError");

        if (!fnRemoveValidationError) {
            return;
        }

        CHANGE_EVENTS.forEach(function (sEventName) {
            var sFnName = "detach" + sEventName[0].toUpperCase() + sEventName.substr(1);
            if (typeof oField[sFnName] === "function") {
                oField[sFnName](fnRemoveValidationError);
            }
        });

        oField.data("removeValidationError", null);
    }

    return FieldValidations;
});
