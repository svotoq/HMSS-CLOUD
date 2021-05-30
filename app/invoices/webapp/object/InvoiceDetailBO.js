sap.ui.define([
    "bstu/hmss/lib/base/BaseBO",
    "bstu/hmss/lib/util/Utility"
], function (BaseBO, Utility) {
    "use strict";
    return BaseBO.extend("bstu.hmss.managecustomers.object.InvoiceDetailBO", {

        /**
         * Load Existing Invoice
         * @returns {jQuery.Deferred} Deferred loading of existing Inoivce data
         * @public
         */
        loadExistingInvoice: function () {
            return this._fetchInvoiceData();
        },

        setInvoiceNumber: function (sInvoiceNumber) {
            this.getViewModel().setProperty("/ObjectHeaderEntityKey/InvoiceNumber", sInvoiceNumber);
        },

        /**
         * Get current InvoiceBO Number
         * @returns {string} Event GUID
         * @public
         */
        getInvoiceNumber: function () {
            return this.getViewModel().getProperty("/ObjectHeaderEntityKey/InvoiceNumber");
        },

        /**
         * Convenience method to Header Entity Set
         * @returns {string} Header Entity Set name
         * @public
         */
        getHeaderSet: function () {
            return this.getViewModel().getProperty("/ObjectHeaderEntitySet");
        },

        /**
         * Load existing invoice
         * @returns {jQuery.Deferred} Deferred loading invoice data
         * @private
         */
        _fetchInvoiceData: function () {
            var oOdataModel = this.getODataModel();
            var sHeaderSet = this.getHeaderSet();

            var sInvoicePath = oOdataModel.createKey(sHeaderSet, {
                InvoiceNumber: this.getInvoiceNumber()
            });

            return Utility.odataRead(oOdataModel, sInvoicePath, {
                urlParameters: {
                    $expand: "InvoiceItems"
                }
            });
        }

    });
});