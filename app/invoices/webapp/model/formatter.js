sap.ui.define([
    "bstu/hmss/lib/util/formatter",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Constants"
], function (formatter, merge, Constants) {
    "use strict";
    var oCustomerFormatter = {
        /**
         * Sets the number of visible rows in a table based on the number of visible items
         * @param {array} aItems - table data
         * @returns {number} visible row count
         */
        visibleRowCount: function (aItems) {
            var aRows = aItems || [];

            return aRows.length === 0 ? 1 : aRows.length;
        },

        /**
         * Gets phone type text
         * @param {string} sType - phone type
         * @returns {string} phone type text
         */
        getPhoneTypeText: function (sType) {
            switch (sType) {
                case Constants.PHONE_TYPES.MOBILE: {
                    return this.i18n("Invoice.PhoneTypeMobile");
                }
                case Constants.PHONE_TYPES.HOME: {
                    return this.i18n("Invoice.PhoneTypeHome");
                }
                case Constants.PHONE_TYPES.PARENT: {
                    return this.i18n("Invoice.PhoneTypeParent");
                }
            }
        }
    }

    return merge({}, formatter, oCustomerFormatter);
});