/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library bstu.hmss.lib.
 */
sap.ui.define(["sap/ui/core/library"], // library dependency
	function () {

		"use strict";

		/**
		 * Agent UI Reuse Library
		 *
		 * @namespace
		 * @name bstu.hmss.lib
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 */

		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "bstu.hmss.lib",
			version: "${version}",
			dependencies: ["sap.ui.core"],
			types: [],
			interfaces: [],
			controls: [],
			elements: ["bstu.hmss.lib.model.type.Email"]
		});

		var thisLib = bstu.hmss.lib;

		return thisLib;

	}, /* bExport= */ false);