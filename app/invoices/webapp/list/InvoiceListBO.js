sap.ui.define([
    "bstu/hmss/lib/base/BaseBO",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/lib/util/Utility",
    "sap/ui/core/format/DateFormat"
], function (BaseBO, merge, Constants, Utility, DateFormat) {
    "use strict";
    return BaseBO.extend("bstu.hmss.manageinvoices.list.InvoiceListBO", merge({

        createInvoice: function (oInvoice) {
            var oInvoicePayload = this._getCreateInvoicePayload(oInvoice);

            return Utility.odataCreate(this.getODataModel(), "Invoices", oInvoicePayload);
        },

        _getCreateInvoicePayload: function (oInvoice) {
            var oDateFormat = DateFormat.getDateInstance({pattern: "YYYY-MM-DD"});

            return {
                FirstName: oInvoice.FirstName,
                LastName: oInvoice.LastName,
                Patronymic: oInvoice.Patronymic,
                Email: oInvoice.Email,
                Invoice_InvoiceNumber: oInvoice.Invoice_InvoiceNumber,
                City: oInvoice.City,
                AddressLine: oInvoice.AddressLine,
                ZipCode: oInvoice.ZipCode,
                CheckIn: oDateFormat.parse(oInvoice.CheckIn),
                CheckOut: oDateFormat.parse(oInvoice.CheckOut),
                ActionIndicator: "CREATE"
            };
        }
    }));
});