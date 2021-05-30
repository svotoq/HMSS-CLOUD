/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"bstu/hmss/managestudents/students/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});