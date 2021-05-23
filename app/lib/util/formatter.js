sap.ui.define([
    "sap/base/strings/formatMessage"
], function (formatMessage) {
    "use strict";

    var mCriticalityToState = {
        0: "None",
        1: "Error",
        2: "Warning",
        3: "Success"
    };

    return {

        formatMessage: formatMessage,

        /**
         * Concatenates price and currency
         * @param {string} sPrice - price value
         * @param {string} sCurrency - currency value
         * @returns {string} concatenated text
         */
        getPriceWithCurrencyText: function (sPrice, sCurrency) {
            if (!sPrice && !sCurrency) {
                return "";
            }
            return formatMessage("{0} {1}", [sPrice, sCurrency]);
        },

        /**
         * Concatenates Text and Unit
         * @param {string} sText - Text
         * @param {string} sUnit - Unit
         * @returns {string} concatenated text
         */
        getFormattedTextWithUnit: function (sText, sUnit) {
            if (!sText && !sUnit) {
                return "";
            }
            return formatMessage("{0} {1}", [sText, sUnit]);
        },

        getCriticalityState: function (iCriticality) {
            return mCriticalityToState[iCriticality];
        },

        getFormattedDescriptionIdText: function (sId, sDescription) {
            return sDescription ? sDescription + "(" + sId + ")" : sId;
        },

        formatMeasureValue: function (sValue) {
            if (sValue === undefined || sValue === null) {
                return "";
            }
            return sValue + "\u2007";
        },

        /**
         * Gets visible row count for tables.
         * If no data, table should have 1 row, otherwise - no more than 5 rows
         * @param {object[]} aItems - table data array
         * @returns {number} visible row count
         */
        getTableVisibleRowCount: function (aItems) {
            if (!aItems || !aItems.length) {
                return 1;
            }

            return aItems.length < 5 ? aItems.length : 5;
        },

        /**
		 * Concatenates customer first & last name & [patronymic]
		 * @param {string} sFirstName - customer first name
		 * @param {string} sLastName - customer last name
		 * @param {string} [sPatronymic] - customer patronymic
		 * @returns {string} concatenated customer name
		 */
        getStudentFullName: function (sFirstName, sLastName, sPatronymic) {
            if (!sFirstName && !sLastName) {
                return "";
            } else if (!sPatronymic) {
                return formatMessage("{0} {1}", [sLastName, sFirstName]);
            }
            return formatMessage("{0} {1} {2}", [sLastName, sFirstName, sPatronymic]);
        },
    };
});
