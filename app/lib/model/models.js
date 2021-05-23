sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"../util/Constants"
], function(JSONModel, Device, Constants) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel: function() {
			var fnGetUser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetUser ? fnGetUser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive: bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createConstantModel: function() {
			var oConstantData = jQuery.extend(true, {}, Constants, {
				VH: {}
			});
			var oModel = new JSONModel(oConstantData);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createAppModel: function() {
			var oModel = new JSONModel({});
			return oModel;
		}
	};
});