sap.ui.define([
    "bstu/hmss/lib/base/BaseAppController",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/generic/app/navigation/service/NavigationHandler",
], function (BaseAppController, HashChanger, NavigationHandler) {
    "use strict";

    return BaseAppController.extend("bstu.hmss.managerooms.app.App", {

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
                case oInbounds.displayRoom.action:
                    sUrl = oRouter.getURL("roomdetail", {
                        RoomNumber: oStartupParams.RoomNumber
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