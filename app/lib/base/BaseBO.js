sap.ui.define([
	"sap/ui/base/Object",
	"../util/Constants",
	"sap/base/assert"
], function (UI5Object, Constants, Assert) {
    "use strict";

    return UI5Object.extend("bstu.hmss.lib.base.BaseBO", {


        /**
		 * Constructor for Events application BO
		 * @param {Object} mParameters - Initializing parameters
		 * @param {sap.ui.core.UIComponent} mParameters.component - Parent component instance
		 * @param {sap.ui.model.odata.v2.ODATAModel} mParameters.odataModel - Application ODATA model
		 * @param {sap.ui.model.json.JSONModel} mParameters.viewModel - Application JSON model
		 * @public
		 */
		constructor: function(mParameters) {
			UI5Object.prototype.constructor.apply(this, arguments);
			this._mParameters = mParameters;
		},

		/**
		 * Convenience method to get owner component
		 * @returns {sap.cdp.attt.lib.base.BaseComponent}  Application UI component
		 * @public
		 */
		getOwnerComponent: function() {
			return this._mParameters.component;
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
			return this.getOwnerComponent().getModel("constant");
		},
		
		/**
		 * Get ODATA save action based on whether the data has been changed
		 * @param {boolean} bDataChanged - True if data has been changed
		 * @returns {string} Save action
		 * @public
		 */
		getSaveAction: function(bDataChanged) {
			Assert(
				bDataChanged !== void 0,
				"BaseBO 'getSaveAction' can't be called w/o parameters!"
			);
			
			var sCurrViewMode = this.getViewModel().getProperty("/CurrViewMode");

			Assert(
				typeof sCurrViewMode === "string",
				"Can't determine current view mode"
			);

			if (sCurrViewMode === Constants.VIEW_MODES.CREATE) {
				return Constants.ODATA_ACTIONS.CREATE;
			}

			if (bDataChanged) {
				return Constants.ODATA_ACTIONS.UPDATE;
			}

			return "";
		},

        /**
		 * Check whether section corresponds to entity set or not
		 * @param {string} sSectionId - Section ID to check
		 * @returns {boolean} True if corresponds
		 * @public
		 */
		isEntitySet: function(sSectionId) {
			var oMetaModel = this.getODataModel().getMetaModel();
			return !!oMetaModel.getODataEntitySet(sSectionId);
		},

		/**
		 * Get blank data for a section
		 * @param {string} sSectionName - Name of section
		 * @returns {object|array} Blank data
		 * @public
		 */
		getSectionBlankData: function(sSectionName) {
			return this.isEntitySet(sSectionName) ? [] : {};
		},

		/**
		 * Wait until metadata gets loaded
		 * @returns {jQuery.Deferred} Deferred metadata loading
		 * @public
		 */
		loadMetaModelDeferred: function() {
			var oOdataModel = this.getODataModel();
			var oMetaLoaded = oOdataModel.getMetaModel().loaded();

			var oDeferredMetaLoading = jQuery.Deferred();
			oMetaLoaded.then(oDeferredMetaLoading.resolve);

			return oDeferredMetaLoading;
		},

		/**
		 * Get service URL for ODATA model
		 * @param {sap.ui.model.odata.ODataModel} oODataModel - ODATA model reference
		 * @returns {string} ODATA service URL
		 * @public
		 */
		getServiceUrlForModel: function(oODataModel) {
			if (oODataModel && oODataModel.sServiceUrl) {
				return oODataModel.sServiceUrl;
			}
			return "";
		},
		
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		}

    });
});