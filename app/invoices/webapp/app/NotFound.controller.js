sap.ui.define([
	"bstu/hmss/lib/base/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("bstu.hmss.manageinvoices.app.NotFound", {

		/**
		 * Navigates to the worklist when the link is pressed
		 * @public
		 */
		onLinkPressed : function () {
			this.getRouter().navTo("invoicelist");
		}

	});

});