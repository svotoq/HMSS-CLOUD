sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/base/Log",
	"sap/base/util/ObjectPath"
], function (Controller, History, UIComponent, Log, ObjectPath) {
    "use strict";

    return Controller.extend("bstu.hmss.lib.base.BaseController", {
        
        /**
         * Convenience method called on Initialization of controller.
         * @public
         */
        onInit: function () {
            this.getOwnerComponent()
				.registerControllerToComponent(this, this.getView().getControllerName());
			
			this._oServerData = {};
        },

        /**
		 * Facade to fire component events. Auto-prefixes event names to prevent
		 * collision with other apps
		 * @param {string} sEvent - Event to be fired
		 * @param {Object} oPayload - Event payload
		 * @public
		 */
		fireAppEvent: function(sEvent, oPayload) {
			var sPrefixedEvent = this.getComponentEventPrefix() + sEvent;
			this.getOwnerComponent().fireEvent(sPrefixedEvent, oPayload);
		},

		/**
		 * Facade to attach to component events. Auto-prefixes event names to prevent
		 * collision with other apps
		 * @param {string} sEvent - Event to attach to
		 * @param {Function} fnCallback - Callback to be executed
		 * @param {Object} oListener - Callback application context
		 * @public
		 */
		attachAppEvent: function(sEvent, fnCallback, oListener) {
			var sPrefixedEvent = this.getComponentEventPrefix() + sEvent;
			var oComponent = this.getOwnerComponent();
			oComponent.attachEvent(sPrefixedEvent, fnCallback, oListener);
		},

		/**
		 * Facade to detach from component events. Auto-prefixes event names to prevent
		 * collision with other apps
		 * @param {string} sEvent - Event to detach from
		 * @param {Function} fnCallback - Callback to detach
		 * @param {Object} oListener - Callback application context
		 * @public
		 */
		detachAppEvent: function(sEvent, fnCallback, oListener) {
			var sPrefixedEvent = this.getComponentEventPrefix() + sEvent;
			var oComponent = this.getOwnerComponent();
			oComponent.detachEvent(sPrefixedEvent, fnCallback, oListener);
		},

		/**
		 * Method to check if controller is validated or not
		 * @returns {boolean} 	is controller validated or not
		 */
		validate: function() {
			return true;
		},

        /**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Single method for handling all caught exceptions
		 * @param {Error} oError - Error to process
		 * @param {sap.m.Button} [oMessageButton] - Button used to open message popover
		 *
		 * @param {mParameters} [mParameters] - Additional error handling parameters
		 * @param {sap.ui.core.UIComponent} [mParameters.component] - Component to delegate handling to
		 * @param {boolean} [mParameters.autoOpenPopover=true] - Whether message popover should auto-open on error
		 *
		 * @returns {boolean} True if handled error is fatal
		 */
		handleError: function(oError, oMessageButton, mParameters) {
			mParameters = Object(mParameters);

			this._logError(oError);

			var oComponent = mParameters.component || this.getOwnerComponent();

			var bFatalError = oComponent.handleFatalError(
				oError.statusCode,
				oError.responseText,
				oError.statusText
			);

			var bBusinessError = !bFatalError;

			if (bBusinessError && mParameters.autoOpenPopover !== false) {
				oComponent.showMessagePopover(oMessageButton);
			}

			return bFatalError;
		},

		/**
		 * Log error into console
		 * @param {*} vError - Error to log
		 * @private
		 */
		_logError: function(vError) {
			var sMessage = vError && typeof vError === "object" ?
				vError.stack || vError.message :
				String(vError);

				Log.error(sMessage);
		},

		/**
		 * Performs cross-app navigation
		 * @param {string} sSemanticObject semantic object
		 * @param {string} sAction action
		 * @param {Object} oParams navigation params
		 * @public
		 */
		crossAppNav: function (sSemanticObject, sAction, oParams) {
			var oCrossAppNavigator = sap.ushell && sap.ushell.Container
				&& sap.ushell.Container.getService("CrossApplicationNavigation");
			var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: sSemanticObject,
					action: sAction
				},
				params: oParams
			}));
			oCrossAppNavigator.toExternal({ target: { shellHash: hashUrl }});
		},

		/**
		 * Method to nav back
		 * @param {Object} oTarget contains CrossApplicationNavigation
		 * target properties
		 * @public
		 */
		navBack: function(oTarget) {
			var oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash(),
				oWindowHistory = ObjectPath.get("window").history;

			if (sPreviousHash !== undefined || oWindowHistory.length) {
				oWindowHistory.go(-1);
			} else {
				/* eslint-disable sap-cross-application-navigation */
				sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
					target: oTarget || {
						semanticObject: "#"
					}
				});
				/* eslint-enable sap-cross-application-navigation */
			}
		},
		
		/**
		 * Get i18n text based on resource bundle property name
		 * @param {string} sResourceBundleProperty - Name of the property
		 * @param {string[]} [aPlaceholderValues] - Values to be incerted into placeholders
		 * @example this.i18n("SEARCH_VH_PH", ["Deals"]) // returns Search Deals
		 * @returns {string} Text of the property
		 */
		i18n: function(sResourceBundleProperty, aPlaceholderValues) {
			return this.getResourceBundle()
				.getText(sResourceBundleProperty, aPlaceholderValues || []);
		},

		/**
		 * Show message popover
		 * @param {sap.m.core.Control} [oControl] - Where to open popover
		 * @param {object} mParameters - Additional execution parameters
		 * @param {sap.ui.core.UIComponent} mParameters.component - Component to delegate handling to
		 * @public
		 */
		showMessagePopover: function(oControl, mParameters) {
			var oComponent = Object(mParameters).component || this.getOwnerComponent();
			oComponent.showMessagePopover(oControl);
		},
        
        /**
         * Get local id for a control
         * @param {sap.ui.core.Control} oControl - Control to get local id for
         * @returns {string} Local id
         * @public
         */
        getLocalId: function(oControl) {
            return this.getView().getLocalId(oControl.getId());
        },

        getComponentEventPrefix: function() {
            return this.getOwnerComponent().getComponentEventPrefix();
		},
		
		/**
		 * Convenience method for getting current user ID.
		 * @public
		 * @returns {string} current userId
		 */
		getCurrentUserId: function() {
			return sap.ushell.Container.getService("UserInfo").getId();
		},

		/**
		 * Convenience method for getting current user ID.
		 * @public
		 * @returns {string} current userId
		 */
		getCurrentUserName: function() {
			return sap.ushell.Container.getUser().getFullName();
		},

        /**
		 * Set new application busy state
		 * @param {boolean} bBusy - Busy state for application
		 * @public
		 */
		setAppBusy: function(bBusy) {
			this.getOwnerComponent().setAppBusy(bBusy);
        },

		/**
		 * Check if tab is being loaded for the first time
		 * @returns {Boolean} True if loaded for the first time
		 * @public
		 */
		getSectionInitialLoad: function() {
			return !this._bLoadedOnce;
		},

		/**
		 * Set new initial load status
		 * @param {boolean} bInitialLoad - Whether the tab should be considered
		 * as loaded for the first time
		 * @public
		 */
		setSectionInitialLoad: function(bInitialLoad) {
			this._bLoadedOnce = !bInitialLoad;
		},

        /**
         * Convenience method for getting the component model by name.
         * @public
         * @param {string} sName The model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getComponentModel: function(sName) {
            return this.getOwnerComponent().getModel(sName);
        },

        /**
         * Convenience method for setting component model.
         * @param {sap.ui.model.Model} oModel - Model instance
         * @param {string} sName - Model name
         * @public
         */
        setComponentModel: function(oModel, sName) {
            this.getOwnerComponent().setModel(oModel, sName);
        },

        /**
         * Convenience method called on Exit of controller.
         * @public
         */
        onExit: function () {
            this.getOwnerComponent()
                .unregisterControllerFromComponent(this.getView().getControllerName());
        },

        /**
		 * Wait until metadata gets loaded
		 * @returns {jQuery.Deferred} Deferred metadata loading
		 * @public
		 */
		loadMetaModelDeferred: function() {
			var oOdataModel = this.getComponentModel();
			var oMetaLoaded = oOdataModel.getMetaModel().loaded();

			var oDeferredMetaLoading = jQuery.Deferred();
			oMetaLoaded.then(oDeferredMetaLoading.resolve);

			return oDeferredMetaLoading;
		},

        /**
		 * Extend JSON model property corresponding to a section with data
		 * @param {string} sSectionId - Id of a section to extend
		 * @param {Object} oData - Data to extend with
		 * @public
		 */
		extendSectionProperty: function(sSectionId, oData) {
			var oTabModel = this.getViewModel();
            var oCurrentData = oTabModel.getProperty("/" + sSectionId) || {};
            var oUpdatedData = jQuery.extend(oCurrentData, oData);
            
            oTabModel.setProperty("/" + sSectionId, oUpdatedData);
		},

		/**
		 * Get data for a specific section
		 * @param {string} sSectionId - Id of a section
		 * @returns {Object} Section data
		 * @private
		 */
		getSectionData: function(sSectionId) {
			var oTabModel = this.getViewModel();
			var vRawSectionData = oTabModel.getProperty("/" + sSectionId + "/data");
			return jQuery.extend(
				true,
				Array.isArray(vRawSectionData) ? [] : {},
				vRawSectionData
			);
		},

		/**
		 * Get data for a specific section
		 * @param {string} sSectionId - Id of a section
		 * @param {object|array} vSectionData - Section data
		 * @private
		 */
		setSectionData: function(sSectionId, vSectionData) {
			var oTabModel = this.getViewModel();
			oTabModel.setProperty("/" + sSectionId + "/data", vSectionData);
		},

		/**
		 * Check whether client-side data and server-side data is the same
		 * @param {string} [sSectionId] - Id of section to check. Checks all sections if omitted
		 * @returns {Boolean} True if data is the same
		 * @public
		 */
		compareServerClientData: function (sSectionId) {
			if (this.getSectionInitialLoad()) {
				return true;
			}

			var aSectionsToCheck = sSectionId ?
				[sSectionId] :
				JSON.parse(this.getView().data("Sections"));

			return aSectionsToCheck.every(function (sSectionToCheck) {
				var aServerData = this._oServerData[sSectionToCheck];
				if (!aServerData) {
					return true;
				}

				var aClientData = this.getSectionData(sSectionToCheck);
				return jQuery.sap.equal(aServerData, aClientData);
			}, this);
		}
    });
});
