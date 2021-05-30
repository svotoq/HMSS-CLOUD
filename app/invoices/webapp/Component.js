sap.ui.define([
    "bstu/hmss/lib/base/BaseComponent"
], function (BaseComponent) {
    "use strict";

    return BaseComponent.extend("bstu.hmss.manageinvoices.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * In this function, the FLP and device models are set and the router is initialized.
         * @public
         * @override
         */
        init: function () {
            // call the base component's init function
            BaseComponent.prototype.init.apply(this, arguments);

            // create the views based on the url/hash
            this.getRouter().initialize();
        },

        /**
         * The component is destroyed by UI5 automatically.
         * @public
         * @override
         */
        destroy: function () {
            // call the base component's destroy function
            BaseComponent.prototype.destroy.apply(this, arguments);
        },

        getComponentEventPrefix: function () {
            return "hmssmanageinvoices-";
        }
    });
});