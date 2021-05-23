sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("bstu.hmss.lib.base.BaseAppController", {

        onInit : function () {
            BaseController.prototype.onInit.apply(this, arguments);
            var oModel = this.getComponentModel();
			var fnSetAppNotBusy = function() {
				this.setAppBusy(false);
            }.bind(this);
            
            this.setAppBusy(true);
			oModel.metadataLoaded().then(fnSetAppNotBusy);
			oModel.attachMetadataFailed(fnSetAppNotBusy);
			
			// apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });
});