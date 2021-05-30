sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./InvoiceDetailBO",
    "bstu/hmss/manageinvoices/model/formatter"
], function (BaseController, JSONModel, InvoiceDetailBO, formatter) {
    return BaseController.extend("bstu.hmss.manageinvoices.object.InvoiceDetail", {

        formatter: formatter,

        /**
         * Called when the InvoiceDetail controller is instantiated
         * @public
         */
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);

            this.setModel(new JSONModel({}), "this");
            this._initThisModel();

            this.getRouter().getRoute("invoicedetail").attachPatternMatched(this._onPatternMatchedInvoiceDetail, this);
        },

        /**
         * Convenience method to get InvoiceDetail BO instance
         * @returns {bstu.hmss.manageinvoices.object.InvoiceDetailBO} BO instance
         * @public
         */
        getBO: function () {
            var oInvoiceDetailBO = new InvoiceDetailBO({
                component: this.getOwnerComponent(),
                odataModel: this.getComponentModel(),
                viewModel: this.getViewModel()
            });

            this.getBO = function () {
                return oInvoiceDetailBO;
            };

            return oInvoiceDetailBO;
        },

        /**
         * Get Main view view model
         * @returns {sap.ui.model.json.JSONModel} View model instance
         * @public
         */
        getViewModel: function () {
            return this.getModel("this");
        },

        /**
         * Handler fired when order number link pressed
         * @param {string} sOrderNumber - Order number
         * @public
         */
        onPressOrderNumberLink: function (sOrderNumber) {
            this.crossAppNav("Order", "display", {
                OrderNumber: sOrderNumber
            });
        },

        _initThisModel: function () {
            this.getViewModel().setProperty("/", {
                ObjectHeaderEntitySet: "Invoices",
                BInvoice: {},
                ObjectHeaderEntityKey: {
                    InvoiceNumber: null
                }
            });
        },

        /**
         * Handler fired when the current URL hash matches the pattern of the route
         * @param {sap.ui.base.Event} oEvent - route matched event
         * @private
         */
        _onPatternMatchedInvoiceDetail: function (oEvent) {
            var mArguments = oEvent.getParameter("arguments");
            var sInvoiceNumber = mArguments.InvoiceNumber;

            this.loadMetaModelDeferred().then(function () {
                this._loadExistingInvoice(sInvoiceNumber);
            }.bind(this));
        },

        /**
         * Initialize application in Existing Invoice mode
         * @param {string} sInvoiceNumber - Invoice Number to load
         * @private
         */
        _loadExistingInvoice: function (sInvoiceNumber) {
            this.setAppBusy(true);

            this.getBO().setInvoiceNumber(sInvoiceNumber);
            this.getBO()
                .loadExistingInvoice()
                .then(function (oBInvoice) {
                    this._handleInitCallSuccess(oBInvoice);
                }.bind(this))
                .fail(function (oError) {
                    this.handleError(oError);
                }.bind(this))
                .always(function () {
                    this.setAppBusy(false);
                }.bind(this));
        },

        /**
         * Handler for successful case initial load
         * @param {Object} oBInvoice - Invoice Detail object
         * @private
         */
        _handleInitCallSuccess: function (oBInvoice) {
            var oViewModel = this.getViewModel();
            oViewModel.setProperty("/BInvoice", oBInvoice);

            this.fireAppEvent("BInvoiceItemsChange", {
                InvoiceItems: oBInvoice.InvoiceItems.results || []
            });

            this.getView().bindObject({
                path: "/BInvoice",
                model: "this"
            });
        }
    });
});
