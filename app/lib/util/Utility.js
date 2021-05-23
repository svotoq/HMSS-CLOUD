sap.ui.define([
	"sap/ui/core/MessageType",
	"sap/ui/core/format/DateFormat",
	"sap/base/Log",
	"sap/ui/model/Context",
	"sap/ui/model/odata/AnnotationHelper",
	"sap/ui/generic/app/navigation/service/SelectionVariant",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (MessageType, DateFormat, Log, Context, ODataAnnotationHelper, SelectionVariant, Filter, FilterOperator) {
    "use strict";
    return {

        
        /**
		 * Function to remove metadata from a object
		 * @public 
		 * @param	{Object} oObject Object from which metadata is to be removed
		 * @return	{Object} oObject Object with deleted metadata
		 */
		removeMetadata: function(oObject) {

			// Delete metadata from Object directly
			if (oObject) {
				if (oObject.constructor === Array) {
					oObject.map(this.removeMetadata.bind(this));
				} else if (oObject.constructor === Object) {
					delete oObject.__metadata;
				}

				// Loop through all properties of the object
				for (var oProperty in oObject) {
					if (oObject.hasOwnProperty(oProperty) && typeof oObject[oProperty] === "object" && oObject[oProperty]) {
						if (oObject[oProperty].hasOwnProperty("__deferred")) {
							delete oObject[oProperty];
						} else {
							// Remove metadata tag
							// Call method recursively
							this.removeMetadata(oObject[oProperty]);
						}
					}
				}
			}

			return oObject;
		},
        
        /**
		 * Perform promisifyed Odata Read request
		 * @param {sap.ui.model.odata.ODataModel} oModel - Odata Model reference
		 * @param {string} sPath - Path to be read
		 * @param {Object} mParameters - Additional request parameters
		 * @returns {Promise} A promise to read an entity type 
		 * @public
		 */
        odataRead: function (oModel, sPath, mParameters) {
            var oReadDeferred = jQuery.Deferred(),
                mRequestProps = jQuery.extend(true, {
					success: oReadDeferred.resolve,
					error: oReadDeferred.reject
				}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sPath) ? "" : "/";
			oModel.read(sPathPrefix + sPath, mRequestProps);
			
			return oReadDeferred.promise();
		},

		/**
		 * 
		 * @param {*} oModel - odata model instance
		 * @param {*} sPath - request path
		 * @param {*} mParameters - parameters map
		 * @returns {Promise} A promise to call ODATA Function Import
		 */
		odataCallFunction: function(oModel, sPath, mParameters) {
			var oCallFunctionDeferred = jQuery.Deferred(),
			mRequestProps = jQuery.extend(true, {
				success: oCallFunctionDeferred.resolve,
				error: oCallFunctionDeferred.reject
			}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sPath) ? "" : "/";
			oModel.callFunction(sPathPrefix + sPath, mRequestProps);

			return oCallFunctionDeferred.promise();
		},

        /**
		 * Perform promisifyed Odata Create request
		 * @param {sap.ui.model.odata.ODataModel} oModel - Odata Model reference
		 * @param {string} sEntitySet - Entity set containing new enitity
		 * @param {Object} oEntityData - Data to be sent as a new entity
		 * @param {Object} mParameters - Additional request parameters
		 * @returns {Promise} A promise to create ODATA entity
		 * @public
		 */
		odataCreate: function(oModel, sEntitySet, oEntityData, mParameters) {
			var oCreateDeferred = jQuery.Deferred(),
				mRequestProps = jQuery.extend(true, {
					success: function (oData, oResponse) {
                        oCreateDeferred.resolve(oData, oResponse);
                    },
					error: oCreateDeferred.reject
				}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sEntitySet) ? "" : "/";
			oModel.create(sPathPrefix + sEntitySet, oEntityData,
				mRequestProps);
			
			return oCreateDeferred.promise();
		},

		/**
		 * Perform deferred ODATA update request
		 * @param {sap.ui.model.odata.ODataModel} oODataModel - Odata Model reference
		 * @param {string} sEntitySet - Entity set containing updated entity
		 * @param {Object} oUpdatedData - Entity data to be updated
		 * @param {Object} mParameters - Additional request parameters
		 * @returns {jQuery.Deferred.Promise} Deferred update call
		 * @public
		 */
		odataUpdate: function(oODataModel, sEntitySet, oUpdatedData, mParameters) {
			var oUpdateDeferred = jQuery.Deferred();
			var mRequestProps = jQuery.extend(true, {
				success: oUpdateDeferred.resolve,
				error: oUpdateDeferred.reject
			}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sEntitySet) ? "" : "/";
			oODataModel.update(sPathPrefix + sEntitySet, oUpdatedData, mRequestProps);

			return oUpdateDeferred.promise();
		},

		/**
		 * Perform deferred ODATA Remove request
		 * @param {sap.ui.model.odata.ODataModel} oODataModel - Odata Model reference
		 * @param {string} sEntitySet - Entity set containing Removed entity
		 * @param {Object} mParameters - Additional request parameters
		 * @returns {jQuery.Deferred.Promise} Deferred Remove call
		 * @public
		 */
		odataRemove: function(oODataModel, sEntitySet, mParameters) {
			var oRemoveDeferred = jQuery.Deferred();
			var mRequestProps = jQuery.extend(true, {
				success: oRemoveDeferred.resolve,
				error: oRemoveDeferred.reject
			}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sEntitySet) ? "" : "/";
			oODataModel.remove(sPathPrefix + sEntitySet, mRequestProps);

			return oRemoveDeferred.promise();
		},

		/**
		 * Function to get Date object from String value
		 * @public
		 * @param {string} sValue string Date in format ("10.03.2018")
		 * @param {object} oFormatOptions Object which defines the format options
		 * @example
		 * // returns date object "Sat Mar 10 2018 00:00:00 GMT+0300" if
		 * // user DateSettings dd.MM.yyyy
		 * getDateObjectFromString("10.03.2018");
		 * @returns {Date} Date object
		 */
		getDateObjectFromString: function(sValue, oFormatOptions) {
			if (!sValue || typeof sValue !== "string") {
				return null;
			}
			
			var mFormatOptions,
				oDateInstance;

			if (oFormatOptions) {
				mFormatOptions = oFormatOptions;
			} else {
				mFormatOptions = {};
			}

			oDateInstance = DateFormat.getDateInstance(mFormatOptions);
			return oDateInstance.parse(sValue);
		},

		/**
		 * Function to format a date according to given format options
		 * @public
		 * @param {Date} oDate date value to format
		 * @param {object} oFormatOptions Object which defines the format options
		 * @returns {string} the formatted output value. If an invalid date is given, an empty string is returned.
		 */
		getStringFromDateObject: function(oDate, oFormatOptions) {
			if (!oDate || typeof oDate !== "object") {
				return null;
			}

			var mFormatOptions,
				oDateInstance;

			if (!oDate) {
				return "";
			}

			if (oFormatOptions) {
				mFormatOptions = oFormatOptions;
			} else {
				mFormatOptions = {};
			}

			oDateInstance = DateFormat.getDateInstance(mFormatOptions);
			return oDateInstance.format(oDate);
		},

		/**
		 * Get a subset of properties from an object. Similar to lodash.pick
		 * @param {Object} oSrcObject - Object to pick props from
		 * @param {string[]} aProperties - Properties to pick from object
		 * @returns {Object} Object with a subset of properties
		 * @public
		 */
		pick: function(oSrcObject, aProperties) {
			return aProperties.reduce(function(oAccumulator, sProperty) {
				var vNextProp = oSrcObject[sProperty];
				if (typeof vNextProp === "undefined") {
					return oAccumulator;
				}

				oAccumulator[sProperty] = vNextProp;
				return oAccumulator;
			}, {});
		},

		/**
		 * Generate temporary ID for new object (Site/Deal/Event) in given format (starting with '$')
		 * (Objects, created using a number range, are shown with a temporary ID before saving)
		 * @param {sap.ui.model.odata.ODataModel} oODataModel - Odata Model reference
		 * @param {string} sEntityType - Entity type name
		 * @param {Object} sProperty - Name of property in entityType
		 * @param {number} iRawIdValue - raw ID value
		 * @returns {string} temporary id in defined format
		 */
		generateTemporaryId: function (oODataModel, sEntityType, sProperty, iRawIdValue) {
			var sPath = "/#" + sEntityType + "/" + sProperty + "/@maxLength",
				iMaxLength = parseInt(oODataModel.getProperty(sPath), 10),
				sTemporaryId = iRawIdValue.toString().padStart(iMaxLength - 1, "0");

			return "$" + sTemporaryId;
		},

		getODataEntitySetFromEntityName: function(oDataMetaModel, sEntityType) {
			var oEntityContainer = oDataMetaModel.getODataEntityContainer();

			var oEntitySet = this.getObjectWithAttr(oEntityContainer.entitySet, 
				"entityType", oEntityContainer.namespace + "." + sEntityType);

			return oEntitySet.name;
		},

		/**
		 * Get detailed info about entity type based on corresponding entity set
		 * @param {sap.ui.model.odata.v2.ODataModel} oOdataModel - ODATA model reference
		 * @param {string} sEntitySet - Name of the corresponding entity set
		 * @returns {Object} Detailed info about entity type
		 * @private
		 */
		 getEntityTypeBySetName: function(oOdataModel, sEntitySet) {
			var oMetaModel = oOdataModel.getMetaModel();
			var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);

			return oEntitySet ? oMetaModel.getODataEntityType(oEntitySet.entityType) : {};
		},

		/**
		 * Get source array element with a given attribute (property) value
		 * @param {Array} aSourceArray - Search source
		 * @param {string} sAttribute - Attribute name
		 * @param {*} vValue - Attribute value to find
		 * @returns {object} Element or empty object, if search failed
		 * @public
		 */
		getObjectWithAttr: function(aSourceArray, sAttribute, vValue) {
			if (!Array.isArray(aSourceArray)) {
				return {};
			}

			return aSourceArray.find(function(oSourceElement) {
				return oSourceElement[sAttribute] === vValue;
			}) || {};
		},

		/**
		 * oUtility function generates a random GUID
		 * @private
		 * @returns {String} guid
		 */
		generateGuid: function() {
			function r() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(
					1);
			}
			return r() + r() + "-" + r() + "-" + r() + "-" + r() + "-" + r() + r() +
				r();
		},
		/**
		 * Function which does the conversion exit of Array Input
		 * into JSON string
		 * e.g: Array of ["1", "2"] will be converted into JSON
		 * string "["1","2"]"
		 * @public
		 * @param {Array}	aConvData	Array for Conversion
		 * @param {String}	sObjectKey	ObjectKey for Array of Objects
		 * @returns {String} JSON string format data
		 */
		arrayToCustomJSONString: function(aConvData, sObjectKey) {
		
			var sOutputJSONString, aInputData, aDataItemsStrArr = [];
		
			aInputData = jQuery.extend(true, [], aConvData);
		
			if (jQuery.isArray(aInputData) && aInputData.length > 0) {
		
				// Check type of Array elements,
				// if its not of type Object, sObjectKey is not required
				// for data mapping, we can directly stringfy the array
				// As Array has length > 0, we can check type by 0th index 
				// element
				if (typeof(aInputData[0]) === "object") {
					for (var intI = 0; intI < aInputData.length; intI++) {
						aDataItemsStrArr.push(aInputData[intI][sObjectKey]);
					}
				} else {
					aDataItemsStrArr = aInputData;
				}
				sOutputJSONString = JSON.stringify(aDataItemsStrArr);
			} else {
				sOutputJSONString = aInputData.toString();
			}
			return sOutputJSONString;
		},
		
		/**
		 * oUtility function generates a random GUID
		 * @private
		 * @param {string} sPath - entityset path
		 * @returns {string} guid
		 */
		getIndexFromPath: function(sPath) {
			return parseInt(sPath.substring(sPath.lastIndexOf("/") + 1), 10);
		},

		/**
		 * Parse ODATA entity to be correctly used with multi-value fields
		 * @param {Object} oRawEntity - Entity data to parse
		 * @param {string[]} aMultiValueFields - Fields with multiple values
		 * @returns {Object} Parsed entity
		 */
		parseMultiValueEntity: function(oRawEntity, aMultiValueFields) {
			var oEntity = jQuery.extend(true, {}, oRawEntity);

			Object.keys(oEntity).forEach(function(sField) {
				var bMultiValue = aMultiValueFields.some(function(sMultiValueField) {
					return sField === sMultiValueField;
				});

				var sRawValues = oEntity[sField];
				if (bMultiValue && sRawValues !== void 0) {
					oEntity[sField] = this.parseMultiValueString(sRawValues);
				}
			}, this);

			return oEntity;
		},

		/**
		 * Parse ODATA entity to be correctly used with multi-value fields
		 * @param {Object[]} aRawEntity - Entity data to parse
		 * @param {string[]} aMultiValueFields - Fields with multiple values
		 * @returns {Object} Parsed entity
		 */
		parseMultiValueEntitySet: function(aRawEntity, aMultiValueFields) {
			var aEntity = aRawEntity.map(function(oRawEntity) {
				return this.parseMultiValueEntity(oRawEntity, aMultiValueFields);
			}.bind(this));

			return aEntity;
		},

		formatMultiValueEntity: function(oEntity, aMultiValueFields) {
			var oRawEntity = jQuery.extend(true, {}, oEntity);

			Object.keys(oRawEntity).forEach(function(sField) {
				var bMultiValue = aMultiValueFields.some(function(sMultiValueField) {
					return sField === sMultiValueField;
				});

				var aValues = oRawEntity[sField];
				if (bMultiValue && aValues !== void 0) {
					oRawEntity[sField] = this.formatMultiValueArray(aValues);
				}
			}, this);

			return oRawEntity;
		},

		formatMultiValueEntitySet: function(aEntity, aMultiValueFields) {
			var aRawEntity = aEntity.map(function(oEntity) {
				return this.formatMultiValueEntity(oEntity, aMultiValueFields);
			}.bind(this));

			return aRawEntity;
		},

		/**
		 * Parse multi-value strings into arrays
		 * @param {string} sRawValues - Raw values in custom format
		 * @example "["10","12"]" => ["10", "12"]
		 * @returns {string[]} Parsed values
		 * @private
		 */
		parseMultiValueString: function(sRawValues) {
			if (!sRawValues) {
				return [];
			}

			try {
				return JSON.parse(sRawValues);
			} catch (oError) {
				Log.error(oError);
				return [];
			}
		},

		/**
		 * Format string array into multi-value string
		 * @param {string[]} aValues - Array of string
		 * @example ["10", "12"] => "["10","12"]"
		 * @returns {string} - Raw values in custom format
		 */
		formatMultiValueArray: function(aValues) {
			if (aValues.length === 0) {
				return "";
			}

			try {
				return JSON.stringify(aValues);
			} catch (oError) {
				Log.error(oError);
				return "";
			}
		},

		/**
		 * Promisifyed method to refresh ODATA security token
		 * @param {sap.ui.model.odata.v2.ODataModel} oODataModel - ODATA model reference
		 * @returns {Promise} A promise to refresh security token
		 * @public
		 */
		refreshedSecurityToken: function(oODataModel) {
			var oSecurityTokenDeferred = jQuery.Deferred();

			oODataModel.refreshSecurityToken(
				oSecurityTokenDeferred.resolve,
				oSecurityTokenDeferred.reject,
				true // use async call
			);
			
			return oSecurityTokenDeferred.promise();
		},

		/**
		 * Get MessageType enum from message severity status
		 * @param {string} sSeverity - Message severity from backend
		 * @returns {sap.m.MessageType} Corresponding MessageType
		 * @public
		 */
		messageSeverityToType: function(sSeverity) {
			switch (sSeverity) {
				case "warning":
					return MessageType.Warning;
				case "info":
					return MessageType.Information;
				case "success":
					return MessageType.Success;
				default:
				case "error":
					return MessageType.Error;
			}
		},

		/**
		 * Check if the given object is empty or not
		 * @param {object} obj Object to be checked
		 * @returns {boolean} returns true if empty object otherwise false
		 * @public
		 */
		isEmptyObject: function(obj) {
			for(var key in obj) {
				if (obj.hasOwnProperty(key)) {
					return false;
				}
			}
			return true;
		},

		/**
		 * Get the name of fields main (displayed) property
		 * @param {sap.ui.core.Control} oControl - Field to check
		 * @returns {string} Main property name
		 * @public
		 */
		getControlMainProperty: function(oControl) {
			var sElementName = oControl.getMetadata().getElementName();
			switch (sElementName) {
				case "sap.m.CheckBox": return "selected";
				case "sap.m.Text": return "text";
				case "sap.m.MultiComboBox": return "selectedKeys";
				case "sap.m.ComboBox": return "selectedKey";
				default: return "value";
			}
		},

		/**
		 * Extract description from descriptionAndId behaviour.
		 * @param {string} sFormattedText Formatted string for descriptionAndId behaviour.
		 * @param {string} sCode Code value
		 * @returns {string} Description text or Code in case description is blank
		 */
        getTextFromDescriptionIdText: function(sFormattedText, sCode) {
			var sRegEx = "^(.*)\\s\\(" + sCode + "\\)$";
			var oRegEx = new RegExp(sRegEx);
			if (sFormattedText) {
				var aResult = oRegEx.exec(sFormattedText);
				if (aResult !== null) {
					return aResult[1];
				} else {
					return sFormattedText;
				}
			}
			return "";
		},

		/**
		 * Get all the Form Elements that are present in a form
		 * @param {sap.ui.layout.form.Form} oForm - Target form
		 * @returns {sap.ui.core.Control[]} Form Elements
		 * @public
		 */
		getFormElements: function(oForm) {
			var aFormContainers = oForm.getFormContainers();
			var aGroupedFormElements = aFormContainers.map(function(oFormContainer) {
				return oFormContainer.getFormElements();
			});

			return Array.prototype.concat.apply([], aGroupedFormElements);
		},

		/**
		 * Gets formatted tire size
		 * @param {string} sCrossSection - cross section
		 * @param {string} sAspectRatio - aspect ratio
		 * @param {string} sRimDiameter - rim diameter
		 * @returns {string} formatted tire size
		 */
		formatTireSize: function(sCrossSection, sAspectRatio, sRimDiameter) {
			return sCrossSection + "/" + sAspectRatio + "-" + sRimDiameter;
		},

		/**
		 * Get attribute value for OData property
		 * @param {object} mParameters - Parameters object
		 * @param {sap.ui.model.odata.v2.ODataModel} mParameters.ODataModel OData model of the app
		 * @param {string} mParameters.entityType OData entity type name
		 * @param {string} mParameters.property OData property name
		 * @param {string} mParameters.attribute OData attribute name
		 * @returns {string} Attribute value
		 * @public
		 */
		 getODataPropertyAttribute: function(mParameters) {
			var oODataModel = mParameters.ODataModel;
			var sEntityType = mParameters.entityType;
			var sProperty = mParameters.property;
			var sAttribute = mParameters.attribute;

			var sPath = "/#" + sEntityType + "/" + sProperty + "/@" + sAttribute;
			return oODataModel.getProperty(sPath);
		},

		/**
		 * Get Label attribute value for ODATA property
		 * @param {sap.ui.model.odata.v2.ODataModel} oODataModel OData model of the app
		 * @param {string} sEntityType OData entity type name
		 * @param {string} sProperty OData property name
		 * @returns {string} Label
		 * @public
		 */
		getLabelForProperty: function (oODataModel, sEntityType, sProperty) {
			return this.getODataPropertyAttribute({
				ODataModel: oODataModel,
				entityType: sEntityType,
				property: sProperty,
				attribute: "sap:label"
			});
		},

		/**
		 * Get the SelectionVariant annotation object for an entity set with given qualifier.
		 * @param {string} sEntitySet Entity set name
		 * @param {sap.ui.model.odata.v2.ODataModel} oODataModel OData model instance
		 * @param {string} sQualifier Selection Variant
		 * @returns {object} Selection variant annotation object
		 * @public
		 */
		createSVAnnotation: function (sEntitySet, oODataModel, sQualifier) {
			var oMetaModel = oODataModel && oODataModel.getMetaModel();
			var oEntityType = this.getEntityTypeBySetName(oODataModel, sEntitySet);
			var sAnnotationPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.SelectionVariant" + (sQualifier ? "#" + sQualifier : "");
			var oSelectionVariant = oMetaModel.getObject(sAnnotationPath);
			return oSelectionVariant;
		},

		/**
		 * Converts a SelectionVariant annotation object to UI5 navigation service selection variant object
		 * @param {object} oSelectionVariantFromAnnotation Selection variant annotation object.
		 * @returns {sap.ui.generic.app.navigation.service.SelectionVariant} SelectionVariant object
		 * @public
		 */
		createSVObject: function (oSelectionVariantFromAnnotation) {
			if (!oSelectionVariantFromAnnotation) {
				return new SelectionVariant();
			}
			
			var oSelectOptions = oSelectionVariantFromAnnotation.SelectOptions;
			var oDummyContext = new Context(null, "/");
			var oDefaultSV = {};

			if (oSelectOptions) {
				oSelectOptions.forEach(function(selectOption) {
					selectOption.PropertyName = selectOption.PropertyName.PropertyPath;
					selectOption.Ranges.forEach(function(range) {
						range.Sign = range.Sign.EnumMember.split("/")[1];
						range.Option = range.Option.EnumMember.split("/")[1];
						// AnnotationHelper can do the conversion
						range.Low = this.resolveSelectOptionValue(oDummyContext, range.Low);
						range.High = this.resolveSelectOptionValue(oDummyContext, range.High);
					}.bind(this));
				}.bind(this));
				oDefaultSV.SelectOptions = oSelectOptions;
			}
			return new SelectionVariant(oDefaultSV);
		},

		/**
		 * Formats a range value to corresponding odata type format.
		 * @param {sap.ui.model.Context} oDummyContext Dummy context object
		 * @param {any} oRangeValue Value
		 * @returns {any} OData type formatted value
		 */
		resolveSelectOptionValue: function(oDummyContext, oRangeValue) {
			//If Low value or High Value for SelectOption Ranges is not defined, then return null
			//Else return the resolved value
			if (oRangeValue === undefined || oRangeValue === null) {
				return null;
			} else {
				return (ODataAnnotationHelper.format(oDummyContext, oRangeValue));
			}
		},

        /**
         * Merge custom filters with original filters
         * @param {object} oCustomFilters - custom filters object
         * @param {sap.ui.model.Filter[]} aTableFilters - original table filters
         * @returns {sap.ui.model.Filter[]} merged filter object
         */
		 mergeCustomFilters: function (oCustomFilters, aTableFilters) {
            var aCustomFilters = Object.keys(oCustomFilters).reduce(function (result, sKey) {
                var vValue = oCustomFilters[sKey];

                if ((typeof vValue === "string" && vValue) || typeof vValue === "boolean") {
                    result.push(new Filter(sKey, FilterOperator.EQ, vValue));
                }

                return result;
            }, []);

            if (Array.isArray(aTableFilters) && aTableFilters.length) {
                aCustomFilters = aCustomFilters.concat(aTableFilters);
            }

            return [new Filter(aCustomFilters, true)];
        }
    };
});
