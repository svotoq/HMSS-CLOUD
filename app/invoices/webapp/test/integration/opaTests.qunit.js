/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"bstu/hmss/manageinvoices/invoices/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});