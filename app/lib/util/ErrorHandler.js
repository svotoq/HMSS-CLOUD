
sap.ui.define([
	"sap/ui/base/Object",
	"bstu/hmss/lib/model/messageBundle",
	"bstu/hmss/lib/util/Constants",
	"sap/m/MessageBox",
	"sap/base/Log"
], function(UI5Object, messageBundle, Constants, MessageBox, Log) {
	"use strict";

	var oErrorHandler = UI5Object.extend(
		"bstu.hmss.lib.util.ErrorHandler", {

			/**
			 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
			 * @class
			 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
			 * @param {boolean} [bIsMessageManagerAvailable=true] This flag will be true if message manager is available
			 * @param {sap.ui.model.Model} [oModel] reference to the app's component
			 * @public
			 */
			constructor: function(oComponent, bIsMessageManagerAvailable, oModel) {
				this._oComponent = oComponent;
				this._bMessageOpen = false;
				this._bIsMessageManagerAvailable = bIsMessageManagerAvailable === false ?
					false : true;

				if (oModel || oComponent.getModel()) {
					this._oModel = oModel ? oModel : oComponent.getModel();
					// Handler for metadata load failure
					this._oModel.attachMetadataFailed(function(oEvent) {
						var bErrorhandled;
						var oParams = oEvent.getParameters().response;

						// Handle error with standard handler
						bErrorhandled = this.handleFatalError(oParams.statusCode, oParams.responseText,
							oParams.statusText);

						// Either User Logged out or connection lost
						if (!bErrorhandled) {
							this.showServiceError("", this.getResourceText(
								"LOGGED_OUT_LOST_CONNECTION"));
						}
					}, this);
				}
			}
		});

	/**
	 * Handles Fatal Error case by case
	 * @public
	 * @param  {string} sStatusCode HTTP Status Code
	 * @param  {string} sResponseText Response Body
	 * @param  {string} sStatusText HTTP Status Code Text
	 * @return {boolean} whether error was handled or not
	 * 
	 */
	oErrorHandler.prototype.handleFatalError = function(sStatusCode,
		sResponseText, sStatusText) {
		// Handle errors based on HTTP Status code
		switch (parseInt(sStatusCode, 10)) {
			case 200:
				// Either User Logged out or connection lost because 200 status code comes up
				// with a login screen
				this.showServiceError("", this.getResourceText("USER_LOGGED_OUT"));
				break;
			case 401:
			case 403:
			case 407:
				// User logged out
				this.showServiceError("", this.getResourceText("USER_LOGGED_OUT"));
				break;
			case 404:
				// User most probably lost connection
				this.showServiceError("", this.getResourceText("404_RESOURCE_NOT_FOUND"));
				break;

			case 405:
			case 406:
			case 409:
			case 410:
			case 412:
			case 415:
			case 428:
			case 400: // Case where /IWBEP/CX_MGW_BUSI_EXCEPTION is raised from the backend
				var oResponse;
				try {
					oResponse = JSON.parse(sResponseText);
				} catch (oError) {
					oResponse = null;
				}

				// if JSON is parsed successfully, then we know that it's an odata exception.
				// If exception is from OData we don't want to show a popup, rather the messages
				// are automatically added by UI5 to the message manager notification area.
				// If message manager is not there, then show the error message in a pop up
				if (oResponse && this._bIsMessageManagerAvailable) {
					this._deleteExceptionMsg();
					return false;
				}

				// Server error dump in service
				this.showServiceError("", this.getResourceText("SERVER_ERROR_TEXT"), {
					"StatusCode": sStatusCode,
					"StatusText": sStatusText,
					"ResponseText": sResponseText
				});
				break;
			case 500: // Case where /IWBEP/CX_MGW_TECH_EXCEPTION is raised from the backend
			case 501:
			case 503:
				// Server error dump in service
				this.showServiceError("", this.getResourceText("SERVER_ERROR_TEXT"), {
					"StatusCode": sStatusCode,
					"StatusText": sStatusText,
					"ResponseText": sResponseText
				});
				break;
			case 504:
				// Service Timeout
				this.showServiceError("", this.getResourceText("OPERATION_TIMEOUT"));
				break;
			default:
				return false;
		}
		return true;
	};

	/**
	 * Message Change handler for Odata Model.
	 */
	oErrorHandler.prototype._deleteExceptionMsg = function() {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oMessageModel = oMessageManager.getMessageModel();
		var aMessages = oMessageModel.getData();

		var aMessagesToDelete = aMessages.filter(this._isExceptionMessage);
		oMessageManager.removeMessages(aMessagesToDelete);
	};

	/**
	 * Check whether BE message is a generic "Exception raised" message
	 * @param {object} oMessage - Message to check
	 * @returns {boolean} True if exception message
	 * @private
	 */
	oErrorHandler.prototype._isExceptionMessage = function(oMessage) {
		return oMessage.code === Constants.ODATA_EXCEPTION_MSG_CODE || oMessage.code === "SY/530";
	};

	/**
	 * Get BE messages from a response
	 * @param {object} oResponse - Response to examine
	 * @param {object} [mParameters] - Optional parameters
	 * @param {boolean} [mParameters.ignoreExceptionMessages=false] - Whether generic exception messages should be ignored
	 * @returns {string[]} Response messages
	 * @public
	 */
	oErrorHandler.prototype.getResponseMessages = function(oResponse, mParameters) {
		mParameters = Object(mParameters);

		try {
			var oResponseContent = JSON.parse(oResponse.responseText);
			var aErrors = oResponseContent.error.innererror.errordetails || [];

			if (mParameters.ignoreExceptionMessages) {
				aErrors = aErrors.filter(function(oError) {
					return !this._isExceptionMessage(oError);
				}, this);
			}

			return aErrors.map(function(oErrorMessage) {
				return oErrorMessage.message;
			});

		} catch (oError) {
			Log.error(oError.message);
			return [];
		}
	};

	/**
	 * Getter for the resource bundle.
	 * @public
	 * @param {String} sCode Error code string 
	 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
	 */
	oErrorHandler.prototype.getResourceText = function(sCode) {
		return messageBundle.getText(sCode);
	};

	/**
	 * Shows a {@link sap.m.MessageBox} when a service call has failed.
	 * Only the first error message will be display.
	 * @param {string} sTitle MessageBox title text
	 * @param {string} sErrorMessage error message text
	 * @param {string} sDetails a technical error to be displayed on request
	 * @param {Function} fCallback callback on closing of MessageBox
	 * @public
	 */
	oErrorHandler.prototype.showServiceError = function(sTitle, sErrorMessage,
		sDetails, fCallback) {
		// Log this trace in the console
		Log.error(this.getStackTrace());

		if (this._bMessageOpen) {
			return;
		}
		this._bMessageOpen = true;

		// Set title in case invoking controller does not
		if (!sTitle) {
			sTitle = this.getResourceText("ERROR");
		}

		MessageBox.show(
			sErrorMessage, {
				icon: MessageBox.Icon.ERROR,
				title: sTitle,
				details: sDetails,
				styleClass: this._oComponent.getContentDensityClass(),
				actions: [MessageBox.Action.CLOSE],
				onClose: function(fnCallback, oEvent) {
					this._bMessageOpen = false;

					// check for callback and execute
					if (fnCallback) {
						fnCallback(oEvent);
					}
				}.bind(this, fCallback)
			}
		);
	};

	/**
	 * Generate the stack trace
	 * @return {string} stack trace of error
	 * @public
	 */
	oErrorHandler.prototype.getStackTrace = function() {
		var oError = new Error();
		return oError.stack;
	};

	/**
	 * Returns the error text based on status code
	 * @param {string} sStatusCode    The HTTP response header code
	 * @param {string} sTechnicalBody Additional response text that need to be merged
	 * @public
	 * @returns {string} error text
	 */
	oErrorHandler.prototype.getErrorTextByStatusCode = function(sStatusCode,
		sTechnicalBody) {
		var sMsg;

		switch (sStatusCode) {
			case 401:
			case 403:
			case 407:
				// User logged out
				sMsg = this.getResourceText("USER_LOGGED_OUT");
				break;
			case 404:
				// User most probably lost connection
				sMsg = this.getResourceText("404_RESOURCE_NOT_FOUND");
				break;
			case 400:
			case 500:
				// Server error dump in service
				sMsg = this.getResourceText("SERVER_ERROR_TEXT_WITH_BODY",
					sTechnicalBody);
				break;
			case 504:
				// Service Timeout
				sMsg = this.getResourceText("OPERATION_TIMEOUT");
				break;
		}

		return sMsg;
	};

	/* =========================================================== */
	/* Static Methods                                              */
	/* =========================================================== */

	/**
	 * Check if status code is corresponding to the success case
	 * @param {integer} iStatus Status code to be evaluated
	 * @returns {boolean} True if corresponding to success case
	 * @static
	 */
	oErrorHandler.statusCodeIsSuccess = function(iStatus) {
		return iStatus >= Constants.HTTP_CODES.OK
			&& iStatus < Constants.HTTP_CODES.BAD_REQUEST;
	};

	return oErrorHandler;
});