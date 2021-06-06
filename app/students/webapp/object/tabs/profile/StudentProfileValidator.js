sap.ui.define([
    "bstu/hmss/lib/base/BaseValidator",
    "bstu/hmss/lib/message/Message",
    "sap/ui/core/MessageType",
    "bstu/hmss/lib/model/messageBundle",
    "sap/ui/core/ValueState",
    "bstu/hmss/lib/base/FieldValidations"
], function (BaseValidator, Message, MessageType, messageBundle, ValueState, FieldValidations) {
    "use strict";
    return BaseValidator.extend("sap.idp.omss.lib.customer.createCustomer.CreateCustomerValidator",
        {

            /**
             * Adds validation error message into message manager
             * @param {string} sErrorMessage - Error message
             * @param {string} sTarget - Element id
             */
            addValidationErrorMessage: function (sErrorMessage, sTarget) {
                this.addSingleMessage(new Message({
                    message: sErrorMessage,
                    type: MessageType.Error,
                    target: sTarget || "",
                    processor: this.getViewModel(),
                    validatorGenerated: true
                }));
            },

            /**
             * Validates student phones
             * @param {object} oCustomer - Customer with phones
             * @param {array} aPhoneFields - Phone inputs
             * @param {string} sTarget - Validation target
             * @returns {boolean} - Validation result
             */
            validateStudentPhones: function (oCustomer, aPhoneFields, sTarget) {
                this.removeMessageByContextPath(sTarget);

                var oBusinessValidationResult = this._getCustomerPhonesBusinessValidationResult(oCustomer);
                if (!oBusinessValidationResult.Valid) {
                    this.addValidationErrorMessage(oBusinessValidationResult.ErrorMessage, sTarget);
                }
                this._setFieldsValidationState(aPhoneFields, oBusinessValidationResult.Valid, oBusinessValidationResult.ErrorMessage);

                var bValidPhoneNumbers = this._validateCustomerPhoneNumbers(aPhoneFields);

                return oBusinessValidationResult.Valid && bValidPhoneNumbers;
            },

            /**
             * Gets customer phones business validation result
             * @param {object} oCustomer - Customer with phones
             * @returns {object} Validation result
             * @private
             */
            _getCustomerPhonesBusinessValidationResult: function (oCustomer) {
                var aPhoneTypes = ["MobilePhone", "HomePhone", "ParentPhone"];

                var aPhones = aPhoneTypes.reduce(function (aAcc, sPhoneType) {
                    aAcc.push([oCustomer[sPhoneType].PhoneNumber]);
                    return aAcc;
                }, []);

                var sErrorMessage = messageBundle.getText("Validation.PhoneRequiredFieldValidationError");
                return this._getAtLeastOneIsRequiredValidationResult(aPhones, sErrorMessage);
            },

            /**
             * Validates customer phone numbers
             * @param {array} aPhoneFields - Phone inputs
             * @returns {boolean} - validation result
             * @private
             */
            _validateCustomerPhoneNumbers: function (aPhoneFields) {
                return aPhoneFields.reduce(function (bValid, oPhoneField) {
                    var sPhoneNumber = oPhoneField.getValue();
                    var bPhoneNumberValidationResult = this._getCustomerPhoneNumberValidationResult(sPhoneNumber);

                    if (!bPhoneNumberValidationResult.Valid) {
                        bValid = false;

                        FieldValidations.setFieldValid(oPhoneField, false, {
                            element: oPhoneField,
                            message: bPhoneNumberValidationResult.ErrorMessage
                        }, false);
                    }

                    return bValid;
                }.bind(this), true);
            },

            /**
             * Performs validation on given array of values.
             * It check at least one element of the array should have some data, otherwise raise validation message.
             * @param {array} aValues - Array of values to be checked for
             * @param {string} sErrorMessage - Error message
             * @returns {object} validation result
             */
            _getAtLeastOneIsRequiredValidationResult: function (aValues, sErrorMessage) {
                var oValidationResult = {
                    Valid: false,
                    ErrorMessage: sErrorMessage || ""
                };
                oValidationResult.Valid = aValues.some(function (aValue) {
                    return aValue.every(function (sValue) {
                        return !!sValue;
                    });
                });

                return oValidationResult;
            },

            /**
             * Gets customer phone number validation result
             * @param {string} sPhoneNumber - Phone number
             * @returns {object} Validation result
             * @private
             */
            _getCustomerPhoneNumberValidationResult: function (sPhoneNumber) {
                var oValidationResult = {
                    Valid: true,
                    ErrorMessage: messageBundle.getText("Validation.EnterValidPhoneNumber")
                };
                if(sPhoneNumber) {
                    oValidationResult.Valid = !!~sPhoneNumber.search(/^([+]?\d{1,2}[-\s]?|)\d{3}[-\s]?\d{3}[-\s]?\d{4}$/);
                }

                return oValidationResult;
            },

            /**
             * Sets fields validation state
             * @param {array} aFields - Fields
             * @param {boolean} bValid - Validation indicator
             * @param {string} sErrorMessage - Error message
             * @private
             */
            _setFieldsValidationState: function (aFields, bValid, sErrorMessage) {
                aFields.forEach(function (oField) {
                    var sValueState = bValid ? ValueState.None : ValueState.Error;
                    oField.setValueState(sValueState);
                    oField.setValueStateText(sErrorMessage);
                });
            }
        });
});
