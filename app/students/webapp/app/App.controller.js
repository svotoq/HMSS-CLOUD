sap.ui.define([
    "bstu/hmss/lib/base/BaseAppController",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/generic/app/navigation/service/NavigationHandler"
], function (BaseAppController, HashChanger, NavigationHandler) {
    "use strict";

    return BaseAppController.extend("bstu.hmss.managestudents.app.App", {

        onInit: function () {
            BaseAppController.prototype.onInit.apply(this, arguments);

            this.oNavigationHandler = new NavigationHandler(this);

            var oComponent = this.getOwnerComponent();
            var oParsedHash = oComponent.getParsedShellHash();
            var oStartupParams = oComponent.getStartupParameters();

            var oInbounds = oComponent.getManifestEntry("/sap.app/crossNavigation/inbounds");
            var oRouter = this.getRouter();
            var oHashChanger = HashChanger.getInstance();
            var sUrl;

            switch (oParsedHash.action) {
                case oInbounds.displayStudent.action:
                    sUrl = oRouter.getURL("studentdetail", {
                        ID: oStartupParams.ID
                    });
                    oHashChanger.replaceHash(sUrl);
                    this.getRouter().initialize();
                    break;
                default:
                    this.getRouter().initialize();
            }
        }
    });

});