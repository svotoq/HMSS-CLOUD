sap.ui.define([
    "sap/ui/core/message/Message"
], function (Message) {
    "use strict";

    var oMessage = Message.extend(
        "bstu.hmss.lib.message.Message", {
            constructor: function (mParameters) {
                Message.apply(this, arguments);
                this.attachmentGenerated = mParameters.attachmentGenerated || false;
                this.validatorGenerated = mParameters.validatorGenerated || false;
            }
        });

    return oMessage;
});