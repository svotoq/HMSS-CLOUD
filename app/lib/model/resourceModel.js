sap.ui.define([
    "sap/ui/model/resource/ResourceModel"
], function(ResourceModel) {
    "use strict";

    var oResourceModel = (function() {
        var oModel = new ResourceModel({
            bundleName: "bstu.hmss.lib.i18n.i18n"
        });
        return oModel;
    }());

    return oResourceModel;
});
