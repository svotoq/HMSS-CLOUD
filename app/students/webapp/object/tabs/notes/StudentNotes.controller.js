sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./StudentNotesBO",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/managestudents/model/formatter",
    "sap/base/util/merge",
    "sap/ui/core/format/DateFormat"
], function (BaseController, JSONModel, StudentNotesBO, Constants, formatter, merge, DateFormat) {
    "use strict";

    return BaseController.extend("bstu.hmss.managestudents.object.tabs.notes.StudentNotes", {

        formatter: formatter,
        NOTE_SECTION_ID: "StudentNotes",

        /**
         * Called when the CustomerNotes controller is instantiated.
         * @public
         */
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);

            this._mContexts = {};
            this.setModel(new JSONModel({}), "this");

            this.attachAppEvent("BStudentHeaderChange", this._handleBStudentHeaderChange, this);
            this.attachAppEvent("viewModeChange", this._handleViewModeChange, this);
            this.attachAppEvent("displayStudent", this._handleDisplayStudent, this);
        },

        onPostFeedInput: function (oEvent) {
            var aStudentNotes = this.getSectionData(this.NOTE_SECTION_ID);
            // create new entry
            var sValue = oEvent.getParameter("value");
            var oNote = {
                Text: sValue,
                CreatedAt: new Date().toISOString().substring(0,10),
                CreatedBy: this.getCurrentUserName()
            };

            aStudentNotes.push(oNote);

            this.setSectionData(this.NOTE_SECTION_ID, aStudentNotes);
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
         * Gets StudentProfile instance
         * @returns {bstu.hmss.managestudents.object.tabs.notes.StudentNotesBO} BO instance
         * @public
         */
        getBO: function () {
            var oStudentNotesBO = new StudentNotesBO({
                component: this.getOwnerComponent(),
                odataModel: this.getModel(),
                viewModel: this.getViewModel()
            });

            this.getBO = function () {
                return StudentNotesBO;
            };
            return StudentNotesBO;
        },

        /**
         * Get data that needs to be saved for a specific section
         * @param {string} sSectionId - Section to get save data for
         * @returns {Array} Data to be saved
         * @public
         */
        getDataForSave: function (sSectionId) {
            return this._getSectionDataForSave(sSectionId);
        },

        /**
         * Check whether client-side data and server-side data is the same
         * @returns {Boolean} True if data is the same
         * @public
         */
        compareServerClientData: function () {
            if (this.getSectionInitialLoad()) {
                return true;
            }

            var aSectionsToCheck = [this.NOTE_SECTION_ID];

            return aSectionsToCheck.every(function (sSectionToCheck) {
                return BaseController.prototype.compareServerClientData.call(this, sSectionToCheck);
            }.bind(this));
        },

        /**
         * Sets data for student tab
         * @param {object} oTabData - Related data with this tab
         * @public
         */
        setTabData: function (oTabData) {
            this._setSectionData(this.NOTE_SECTION_ID, oTabData.Notes);
        },

        /**
         * Sets data for form
         * @param {string} sSectionId - Section name
         * @param {object} oSectionData - Section data
         * @private
         */
        _setSectionData: function (sSectionId, oSectionData) {
            this.extendSectionProperty(sSectionId, {
                data: oSectionData
            });

            this._oServerData[sSectionId] = merge({}, oSectionData);
        },

        /**
         * Gets section data in backend-friendly format
         * @param {string} sSectionId - Id of a section
         * @returns {object | array} Section data in backend-friendly format
         * @private
         */
        _getSectionDataForSave: function (sSectionId) {
            return this.getSectionData(this.NOTE_SECTION_ID);
        },

        /**
         * Handle Student header change: save its data locally and update form
         * @param {sap.ui.base.Event} oEvent - "BStudentHeaderChange" application event
         * @private
         */
        _handleBStudentHeaderChange: function (oEvent) {
            var oBStudent = oEvent.getParameter("BStudent");
            this.getViewModel().setProperty("/BStudent", oBStudent);
        },

        /**
         * Set View Mode into view model
         * @param {sap.ui.base.Event} oEvent - "viewModeChange" application Event
         * @private
         */
        _handleViewModeChange: function (oEvent) {
            var sNewMode = oEvent.getParameter("newMode");
            this.getViewModel().setProperty("/CurrViewMode", sNewMode);
        },

        /**
         * Initialize view model "this"
         * @param {sap.ui.base.Event} oEvent - "displayStudent" application Event
         * @private
         */
        _handleDisplayStudent: function (oEvent) {
            this._initThisModel();
        },

        /**
         * Initialise view model ("this") with default values.
         */
        _initThisModel: function () {
            this.getViewModel().setProperty("/", {
                ObjectHeaderEntitySet: "Students",
                CurrViewMode: Constants.VIEW_MODES.DISPLAY
            });
        }
    });
});