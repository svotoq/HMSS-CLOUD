sap.ui.define([
    "bstu/hmss/lib/base/BaseAppController"
], function (BaseAppController) {
    "use strict";

    return BaseAppController.extend("bstu.hmss.managestudents.app.App", {

        onInit: function () {
            BaseAppController.prototype.onInit.apply(this, arguments);
        }
    });

});