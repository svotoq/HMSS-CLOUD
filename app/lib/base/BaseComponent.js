/* eslint-disable max-params */
sap.ui.define([
    "sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
    "../util/ErrorHandler",
    "../model/models",
    "sap/ui/Device",
    "../util/Polyfills",
    "sap/ui/core/MessageType",
    "sap/base/Log",
    "sap/ui/core/syncStyleClass"
], function (UIComponent, View, ErrorHandler, Models, Device, Polyfills, MessageType, Log, SyncStyleClass) {
    /* eslint-enable max-params */
    "use strict";
    
    var _iAppBusyCounter = 0;

    return UIComponent.extend("bstu.hmss.lib.base.BaseComponent", {

        constructor: function () {
            /**
			 * List of controllers
			 * @private
			 */
            this._aControllers = [];
            
            // Call Super
			UIComponent.prototype.constructor.apply(this, arguments);
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * In this function, the FLP and device models are set and the router is initialized.
         * @public
         * @param {sap.ui.model.Model} oModelForErrorHandler If error handler should be bound with
         * any other model other than default Component Model with blank name, provide that model
         * here
         * @override
         */
        init: function (oModelForErrorHandler) {
            UIComponent.prototype.init.apply(this, arguments);
            _iAppBusyCounter = 0;
            // Get the Message Manager
            this._oMessageManager = sap.ui.getCore().getMessageManager();

            // Register the Current OData Model as the Message Processor
            this._oMessageManager.registerMessageProcessor(this.getModel());

            // Get the Global Message Model and Set as Model in this Component
            this.setModel(
                sap.ui.getCore().getMessageManager().getMessageModel(),
                "message");

            // Initialize the error handler with the component
            this._oErrorHandler = new ErrorHandler(this, true, oModelForErrorHandler);
            
            // Set the device model
		    this.setModel(Models.createDeviceModel(), "device");

            // Set the FLP model
            this.setModel(Models.createFLPModel(), "FLP");

            this.setModel(Models.createConstantModel(), "constant");

            this.setModel(Models.createAppModel(), "app");

            this._enhanceReusei18nBundle();
            
            // Set Dirty flag as false for save or initial data load
		    sap.ushell.Container.setDirtyFlag(false);
        },

        destroy: function () {
            // Destroy Error handler
            this._oErrorHandler.destroy();

            // Clean all messages
            sap.ui.getCore().getMessageManager().removeAllMessages();

            // call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass : function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				/* eslint-disable sap-no-proprietary-browser-api */
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
				/* eslint-enable sap-no-proprietary-browser-api */
                    this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

        /**
         * Function to register the controller instance reference to component 
         * Map maintained at component Level
         * @param { Object } oControllerInstance Controller Instance/Object
         * @param { String } sControllerName     Controller Name/Key
         */
        registerControllerToComponent: function(oControllerInstance, sControllerName) {
            this._aControllers[sControllerName] = oControllerInstance;
        },

        /**
         * Function to unregister the controller instance reference from component 
         * @param   {String}    sControllerName controller NameSpace
         */
        unregisterControllerFromComponent: function(sControllerName) {
            delete this._aControllers[sControllerName];
        },

        /**
         * Function to get the controller instance from component by controller NameSpace
         * @param   {String}    sControllerName controller NameSpace
         * @return  {Object}    controller Instance Reference
         */
        getController: function(sControllerName) {
            return this._aControllers[sControllerName];
        },

        /**
         * Function to get the all controller instance array from component
         * @return	{Array} controller Instance Reference Array
         */
        getAllControllers: function() {
            return this._aControllers;
        },

        /**
         * Uses the error handler instance to open error message box if not already open for another error
         * @param  {string} sTitle          Title
         * @param  {string} sErrorMessage   Message Text
         * @param  {string} sMessageDetails Description text
         * @param {function} fCallback Function callback when click on a button
         */
        displayErrorMessage: function(sTitle,
            sErrorMessage, sMessageDetails,
            fCallback) {
            this._oErrorHandler.showServiceError(sTitle, sErrorMessage,
                sMessageDetails, fCallback);
        },

        /**
         * Handles Fatal Error case by case
         * @param  {string} sStatusCode HTTP Status Code
         * @param  {string} sResponseText Response Body
         * @param  {string} sStatusText HTTP Status Code Text
         * @return {boolean} handleFatalError whether error was handled or not
         */
        handleFatalError: function(sStatusCode,
            sResponseText, sStatusText) {
            return this._oErrorHandler.handleFatalError(sStatusCode, sResponseText,
                sStatusText);
        },

        /**
         * Remove exception messages
         * ODATA forces exception to be added as a message, therefore we remove it from
         * the model as it's clutters the Message notification popup
         */
        deleteExceptionMsg: function() {
            this._oErrorHandler._deleteExceptionMsg();
        },

        /**
         * Get component message model instance
         * @returns {sap.ui.model.message.MessageModel} message model instance
         * @public
         */
        getMessageModel: function() {
            return this._oMessageManager.getMessageModel();
        },

        /**
         * Function to return the Error Handler
         * @return {sap.cdp.doe.hcm.reuselib.util.ErrorHandler} Property Value
         * @public
         */
        getErrorHandler: function() {
            return this._oErrorHandler;
        },

        /**
         * Initialize the Message Popover
         * @param {sap.ui.core.mvc.View} oView - Consuming application view
         * @param {sap.m.Button} [oButton] - Message button reference
         * @public
         */
        initializeMessagePopover: function(oView, oButton) {
            if ( !(oView instanceof View) ) {
                throw new Error("Consuming app view reference is mandatory");
            }

            this._oMessageButton = oButton;

            this._oMessagePopover = sap.ui.xmlfragment(
                oView.getId(),
                "bstu.hmss.lib.fragments.MessagePopover",
                this
            );

            var oMessageModel = this._oMessageManager.getMessageModel();
            this._oMessagePopover.setModel(oMessageModel, "message");
            oView.addDependent(this._oMessagePopover);
        },

        /**
         * Open message popover in reference to the given control.
         * "initializeMessagePopover" should have been called before invoking "showMessagePopover"
         * @param {sap.m.Button} [oMessageButton] Notification button reference
         * @public
         */
        showMessagePopover: function(oMessageButton) {
            var oButton = oMessageButton || this._oMessageButton,
                aMessages = this._oMessageManager.getMessageModel().getData();

            if (oButton.getDomRef()) {
                if(aMessages.length > 0) {
                    this._openMessagePopover(oButton);
                } else {
                    Log.info("No messages found");
                }
            } else {
                var oRenderingDelegate = {
                    onAfterRendering: function() {
                        // UI5 fires onAfterRendering before focus of the last focused element is restored
                        // One has to wait for focus to restore so that the the last element is still focused after closing a popover
                        setTimeout(this._openMessagePopover.bind(this), 0, oButton);
                        oButton.removeEventDelegate(oRenderingDelegate);
                    }
                };

                oButton.addEventDelegate(oRenderingDelegate, this);
            }
        },

        /**
		 * Get component startup parameters normalized
		 * @returns {Object} Events component startup parameters
		 * @public
		 */
		getStartupParameters: function () {
			var aStartupParameters = this.getComponentData().startupParameters;

			return Object.keys(aStartupParameters).reduce(function (oNewParameters, sKey) {
				oNewParameters[sKey] = aStartupParameters[sKey][0];
				return oNewParameters;
			}, {});
		},

		getParsedShellHash: function () {
			var oUrlParsing = sap.ushell.Container.getService("URLParsing");
			var sShellHash = oUrlParsing.getShellHash(location.hash);
			return oUrlParsing.parseShellHash(sShellHash);
		},

        getComponentEventPrefix: function () {
			throw new Error("No getter for component event prefix defined");
        },

        /**
         * Function to remove all messages which are manually generated on UI or raised by Backened
         * @public
         */
        removeAllMessages: function() {
            this._oMessageManager.removeAllMessages();
        },



        /**
         * Function to remove all messages which are manually generated on UI
         * @public
         */
        removeAllValidatorMessages: function() {
            var aMessages = this._oMessageManager.getMessageModel().getData(),
                aValidatorMessages = aMessages.filter(function(oMessage) {
                    return oMessage.validatorGenerated === true;
                });

            this._removeMessages(aValidatorMessages);
        },

        /**
         * Function to remove success messages
         * @public
         */
        removeSuccessMessages: function() {
            var aMessages = this._oMessageManager.getMessageModel().getData(),
                aMessagesToRemove = aMessages.filter(function(oMessage) {
                    return oMessage.type === MessageType.Success 
                        || oMessage.type === MessageType.Information
                        || oMessage.type === MessageType.Warning;
                });

            this._removeMessages(aMessagesToRemove);
        },

        /**
         * Function to remove error messages
         * @param {boolean} bControlGenerated flag to delete messages with flag validation=true
         * @param {boolean} bODataGenerated flag to delete OData generated messages
         * @param {boolean} bValidatorGenerated flag to delete messages with flag validatorGenerated=true
         * @param {boolean} bAttachmentGenerated flag to delete messages with flag attachmentGenerated=true
         * @public
         */
        removeErrorMessages: function(bControlGenerated, bODataGenerated, bValidatorGenerated, bAttachmentGenerated) {
            var aMessages = this._oMessageManager.getMessageModel().getData(),
                aMessagesToRemove = aMessages.filter(function(oMessage) {
                    return  (bControlGenerated && !!oMessage.validation) ||
                            (bODataGenerated && !!oMessage.technical) ||
                            (bValidatorGenerated && !!oMessage.validatorGenerated) ||
                            (bAttachmentGenerated && !!oMessage.attachmentGenerated);
                });

            this._removeMessages(aMessagesToRemove);
        },
	
        /**
         * Check application's message model if it has any UI5 or Validator generated error messages
         * If yes, return true else return false
         * @returns {boolean} true if validation errors exist
         */
        isValidationErrorExists: function() {
            //get Message data
            var aMessages = this._oMessageManager.getMessageModel().getData();

            return aMessages.some(function(oMsg, iIndex) {
                if ((oMsg.validation === true || oMsg.validatorGenerated === true) &&
                    oMsg.type === MessageType.Error) {
                    return true;
                }
            });
        },

        /**
         * Conveniece method to remove AttachmentGenerated messages from the message model
         * @private
         */
        removeAttachmentGeneratedMessages: function() {
            var aMessages = this._oMessageManager.getMessageModel().getData(),
                aAttachmentMessages = aMessages.filter(function(oMessage) {
                    return oMessage.attachmentGenerated === true;
                });
    
            this._removeMessages(aAttachmentMessages);
        },

        /**
         * Returns a list of all controls with a field group ID.
         * 
         * @param {string|string[]} [vFieldGroupIds] ID of the field group or an array of field group IDs to match
         * @return {sap.ui.core.Control[]} The list of controls with matching field group IDs
         * @public
         */
        byFieldGroupId: function(vFieldGroupIds) {
            return sap.ui.getCore().byFieldGroupId(vFieldGroupIds);
        },

        /**
         * Finds all dialogs and closes them
         */
        closeAllDialogs: function () {
            var aControllers = this.getAllControllers();
            var fnCloseDialog = function (oDependent) {
                if (oDependent.getMetadata().getElementName() === "sap.m.Dialog" && oDependent.isOpen()) {
                    oDependent.close();
                }
            };

            for (var sKey in aControllers) {
                if (aControllers.hasOwnProperty(sKey)) {
                    var oView = aControllers[sKey].getView();
                    var aDependents = oView.getDependents();
                    aDependents.forEach(fnCloseDialog);
                }
            }
        },

        /**
		 * Set new application busy state
		 * @param {boolean} bBusy - Busy state for application
		 * @public
		 */
		setAppBusy: function(bBusy) {
			if (bBusy === true) {
				_iAppBusyCounter++;
			} else if (_iAppBusyCounter > 0) {
				_iAppBusyCounter--;
			}

			if (_iAppBusyCounter === 0) {
				this.getModel("app").setProperty("/busy", false);
			} else {
				this.getModel("app").setProperty("/busy", true);
            }
        },

        /**
         * Open Message Popover by notification button
         * @param {sap.m.Button} oMessageButton - Button reference
         * @private
         */
        _openMessagePopover: function(oMessageButton) {
            // Sync the style class for mobiles & desktops as Popovers don't auto inherit it
            SyncStyleClass(
                this.getContentDensityClass(),
                oMessageButton,
                this._oMessagePopover
            );
            this._oMessagePopover.openBy(oMessageButton);
        },

        /**
         * Helper, which enhances the reusable i18n bundle.
         *
         * @private
         */
        _enhanceReusei18nBundle: function() {
            var sI18nPath = jQuery.sap.getModulePath("bstu/hmss/lib") +
                "/i18n/i18n.properties";
            this._enhanceI18n(sI18nPath);
        },

        /**
         * Helper for enhancing i18n model with new bundle urls (new i18n files).
         *
         * @param {string} sI18nPath path to i18n file
         */
        _enhanceI18n: function(sI18nPath) {
            this.getModel("i18n").enhance({
                bundleUrl: sI18nPath
            });
        },

        /**
         * Remove given messages
         * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages The message(s) to be removed
         */
        _removeMessages: function(vMessages) {
            this._oMessageManager.removeMessages(vMessages);
        }
    });
});
