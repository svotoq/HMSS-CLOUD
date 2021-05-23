sap.ui.define([
    "sap/ui/base/Object",
	"../util/Utility"
], function(UI5Object, Utility) {
	"use strict";

	var oBaseValidatorPrototype = {

		/**
		 * Constructor for application Validator
		 * @param {Object} mParameters - Initializing parameters
		 * @param {sap.ui.model.json.JSONModel} mParameters.viewModel - Application JSON model
		 * @param {sap.ui.model.json.JSONModel} mParameters.constantModel - Constant JSON model
		 * @param {sap.ui.model.resource.ResourceModel} mParameters.i18nModel - Application i18n model
		 * @param {sap.ui.model.odata.v2.ODataModel} mParameters.odataModel - Application ODATA model
		 * @public
		 */
		constructor: function(mParameters) {
			UI5Object.prototype.constructor.apply(this, arguments);
            this._mParameters = mParameters;
			this._oMessageManager = sap.ui.getCore().getMessageManager();
		},

		/**
		 * Convenience method to get view JSON model
		 * @returns {sap.ui.model.json.JSONModel} JSON model reference
		 * @public
		 */
		getViewModel: function() {
			return this._mParameters.viewModel;
		},

		/**
		 * Convenience method to get constant JSON model
		 * @returns {sap.ui.model.json.JSONModel} JSON model reference
		 * @public
		 */
		getConstantModel: function() {
			return this._mParameters.constantModel;
		},

		/**
		 * Convenience method to get application resource model
		 * @returns {sap.ui.model.resource.ResourceModel} i18n model reference
		 */
		getResourceBundle: function() {
			return this._mParameters.i18nModel.getResourceBundle();
		},
		
		/**
		 * Get i18n text based on resource bundle property name
		 * @param {string} sResourceBundleProperty - Name of the property
		 * @param {string[]} [aPlaceholderValues] - Values to be incerted into placeholders
		 * @example this.i18n("SEARCH_VH_PH", ["Deals"]) // returns Search Deals
		 * @returns {string} Text of the property
		 */
		i18n: function(sResourceBundleProperty, aPlaceholderValues) {
			if (!aPlaceholderValues) {
				aPlaceholderValues = [];
			}
			return this.getResourceBundle()
				.getText(sResourceBundleProperty, aPlaceholderValues);
		},

		/**
		 * Convenience method to get provided ODATA model
		 * @returns {sap.ui.model.odata.v2.ODataModel} ODATA model reference
		 * @public
		 */
		getODataModel: function() {
			return this._mParameters.odataModel;
		},

		/**
		 * Function to add message to Message Manager Instance
		 * @public
		 * @param {Object} oMessage Message Object of type sap.ui.core.message.Message
		 */
		addSingleMessage: function(oMessage) {
			this._oMessageManager.addMessages(oMessage);
		},

		/**
		 * Function to add list of messages to Message Manager Instance
		 * @public
		 * @param {Array} aMessages Array of sap.ui.core.message.Message
		 */
		addMessages: function(aMessages) {
			this._oMessageManager.addMessages(aMessages);
		},

		/**
		 * Function to remove message from Message Manager Instance
		 * @param {String} sTarget Absolute model binding path of respective field
		 * @public
		 */
		removeMessageByContextPath: function(sTarget) {
			var aMessages = this._oMessageManager.getMessageModel().getData();
			for (var intI = 0; intI < aMessages.length; intI++) {
				//Remove Error message
				if (aMessages[intI].validatorGenerated && aMessages[intI].target ===
					sTarget) {
					this._oMessageManager.removeMessages(aMessages[intI]);
				}
			}
		},

		/**
		 * Get sap:label annotaton value for sProperty in sEntityType from OData model
		 * @param {string} sEntityType OData entity type name
		 * @param {string} sProperty OData entity property name
		 * @returns {string} sap:label annotation value
		 */
		getLabelForProperty: function (sEntityType, sProperty) {
			return Utility.getLabelForProperty(this.getODataModel(), sEntityType, sProperty);
		},

		/**
		 * Function to remove list of messages from Message Manager Instance
		 * @public
		 * @param {Array} aMessages Array of sap.ui.core.message.Message
		 */
		removeMessages: function(aMessages) {
			this._oMessageManager.removeMessages(aMessages);
		}
	};

	return UI5Object.extend(
		"bstu.hmss.lib.base.BaseValidator",
		oBaseValidatorPrototype
	);
});