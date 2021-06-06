sap.ui.define([
    "sap/ui/model/type/String"
], function(StringType) {
    "use strict";
    
    return StringType.extend("bstu.hmss.lib.model.type.Email", {

        constructor: function(oFormatOptions, oConstraints) {
            debugger;
            var oEmailTypeConstraints = oConstraints || {};
            oEmailTypeConstraints.search = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            StringType.apply(this,[oFormatOptions, oEmailTypeConstraints]);
        },

        validateValue: function(sValue) {
            if (sValue) {
                StringType.prototype.validateValue.apply(this, arguments);
            }
        }
    });
});