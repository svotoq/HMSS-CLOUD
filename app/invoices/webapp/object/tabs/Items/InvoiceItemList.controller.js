/* eslint-disable max-params */
sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./InvoiceItemListBO",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/lib/util/Utility",
    "bstu/hmss/manageinvoices/model/formatter",
    "sap/base/Log",
    "sap/base/util/merge",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, InvoiceItemListBO, Constants, Utility, formatter, Log, merge, MessageBox) {
    /* eslint-enable max-params */
    "use strict";

    return BaseController.extend("bstu.hmss.manageinvoices.object.tabs.items.InvoiceItemList", {

        formatter: formatter,

        /**
         * Called when the InvoiceItemList controller is instantiated.
         * @public
         */
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);
            this.setModel(new JSONModel({}), "this");

            this.attachAppEvent("BInvoiceItemsChange", this._handleBInvoiceItemsChange, this);
        },

        /**
         * Get GeneralInfo model instance
         * @returns {sap.ui.model.json.JSONModel} GeneralData model
         * @public
         */
        getViewModel: function () {
            return this.getModel("this");
        },

        /**
         * Get MasterData instance
         * @returns {sap.cdp.attt.cases.object.tabs.masterdata.MasterDataBO} BO instance
         * @public
         */
        getBO: function () {
            var oInvoiceItemListBO = new InvoiceItemListBO({
                component: this.getOwnerComponent(),
                odataModel: this.getModel(),
                viewModel: this.getViewModel()
            });

            this.getBO = function () {
                return oInvoiceItemListBO;
            };
            return oInvoiceItemListBO;
        },

        /**
         * Handle invoice selection
         * @param {string} sInvoiceNumber - Invoice Number
         * @param {boolean} bSelected - checkbox checked/unchecked
         * @public
         */
        onSelectInvoice: function (sInvoiceNumber, bSelected) {
            var aSelectedTableItems = this.getViewModel().getProperty("/SelectedTableItems");

            if (bSelected) {
                aSelectedTableItems = aSelectedTableItems.concat(sInvoiceNumber);
            } else {
                aSelectedTableItems = aSelectedTableItems.filter(function (sSelectedTableItemKey) {
                    return sSelectedTableItemKey !== sInvoiceNumber;
                });
            }

            this.getViewModel().setProperty("/SelectedTableItems", aSelectedTableItems);
        },

        /**
         * Handle case BInvoice data changes
         * @param {sap.ui.base.Event} oEvent - "BInvoiceItemsChange" application event
         * @private
         */
        _handleBInvoiceItemsChange: function (oEvent) {
            var aInvoiceItems = oEvent.getParameter("InvoiceItems");

            this.getViewModel().setProperty("/", {
                InvoiceItems: aInvoiceItems,
                SelectedTableItems: []
            });
        }
    });
});
