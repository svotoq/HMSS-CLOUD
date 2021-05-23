/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"bstu/hmss/managerooms/rooms/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
