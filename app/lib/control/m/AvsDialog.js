sap.ui.define([
    "sap/m/Dialog"
], function (Dialog) {
    "use strict";
    
    var AvsDialog = Dialog.extend("bstu.hmss.lib.control.m.AvsDialog", {
        metadata: {
            library: "bstu.hmss.lib",
            events: {
                avsVerified: {
                    parameters: {
                        address: {type: "object"},
                        addressType: {type: "string"}
                    }
                },
                avsContinue: {}
            }
        },
        renderer: {}
    });
    return AvsDialog;
});