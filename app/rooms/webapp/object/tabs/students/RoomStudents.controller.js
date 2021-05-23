/* eslint-disable max-params */
sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./RoomStudentsBO",
    "bstu/hmss/lib/util/Constants",
    "sap/base/util/merge",
    "bstu/hmss/managerooms/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "./AddStudentsSub"
], function (BaseController, JSONModel, RoomStudentsBO, Constants, merge, formatter, Filter, FilterOperator, AddStudentsSub) {
    /* eslint-enable max-params */
    "use strict";

    return BaseController.extend("bstu.hmss.managerooms.object.tabs.students.RoomStudents", 
        merge({

        formatter: formatter,
        STUDENTS_SECTION_ID: "Students",

        /**
         * Called when the RoomStudents controller is instantiated.
         * @public
         */
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);

            this.setModel(new JSONModel({}), "this");

            this.attachAppEvent("BRoomHeaderChange", this._handleBRoomHeaderChange, this);
            this.attachAppEvent("viewModeChange", this._handleViewModeChange, this);
            this.attachAppEvent("displayRoom", this._handleDisplayRoom, this);
        },

        /**
         * Handler for table row action press event. It triggers cross app navigation to order detail page.
         * @param {sap.ui.base.Event} oEvent Event object for press event on row action for navigation
         */
        onPressStudentDetail: function (oEvent) {
            var sStudentID = oEvent.getSource().getBindingContext().getProperty("ID");
            // var oOutbound = this.getOwnerComponent().getManifestEntry("/sap.app/crossNavigation/outbounds/displayOrder");
            // this.oCrossAppNavigator.toExternal({
            //     target: oOutbound,
            //     params: { "OrderNumber": sOrderNumber}
            // });
        },
        
        onPressAddStudent: function () {
            this.openAddStudentsDialog();
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
         * Gets RoomStudentsBO instance
         * @returns {bstu.hmss.managerooms.object.tabs.students.RoomStudentsBO} BO instance
         * @public
         */
        getBO: function () {
            var oRoomStudentsBO = new RoomStudentsBO({
                component: this.getOwnerComponent(),
                odataModel: this.getModel(),
                viewModel: this.getViewModel()
            });

            this.getBO = function () {
                return oRoomStudentsBO;
            };
            return oRoomStudentsBO;
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

            var aSectionsToCheck = [this.STUDENTS_SECTION_ID];

            return aSectionsToCheck.every(function (sSectionToCheck) {
                return BaseController.prototype.compareServerClientData.call(this, sSectionToCheck);
            }.bind(this));
        },

        /**
         * Sets data for room students tab
         * @param {object} oTabData - Related data with this tab
         * @public
         */
        setTabData: function (oTabData) {
            this._setSectionData(this.STUDENTS_SECTION_ID, oTabData);
        },

        /**
         * Sets data for form
         * @param {string} sSectionId - Section name
         * @param {array} aRawSectionData - Section data
         * @private
         */
        _setSectionData: function (sSectionId, aRawSectionData) {
            var aSectionData = (aRawSectionData && aRawSectionData.Students.results) || [];

            this.extendSectionProperty(sSectionId, {
                data: aSectionData
            });

            this._oServerData[sSectionId] = merge({}, aSectionData);
        },

        /**
         * Gets section data in backend-friendly format
         * @param {string} sSectionId - Id of a section
         * @returns {object | array} Section data in backend-friendly format
         * @private
         */
        _getSectionDataForSave: function (sSectionId) {
            return this.getSectionData(sSectionId);
        },

        /**
         * Handle Room header change: save its data locally and update form
         * @param {sap.ui.base.Event} oEvent - "BRoomHeaderChange" application event
         * @private
         */
        _handleBRoomHeaderChange: function (oEvent) {
            var oBRoom = oEvent.getParameter("BRoom");
            this.getViewModel().setProperty("/BRoom", oBRoom);
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
         * @param {sap.ui.base.Event} oEvent - "displayRoom" application Event
         * @private
         */
        _handleDisplayRoom: function (oEvent) {
            this._initThisModel();
        },

        /**
         * Initialise view model ("this") with default values.
         */
        _initThisModel: function () {
            this.getViewModel().setProperty("/", {
                ObjectHeaderEntitySet: "Rooms",
                CurrViewMode: Constants.VIEW_MODES.DISPLAY
            });
        }
    }, AddStudentsSub));
});