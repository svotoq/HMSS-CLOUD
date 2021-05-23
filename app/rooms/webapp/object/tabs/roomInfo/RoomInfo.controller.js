/* eslint-disable max-params */
sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./RoomInfoBO",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/managerooms/model/formatter",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Utility",
    "sap/m/MessageBox",
    "bstu/hmss/lib/message/Message",
    "sap/ui/core/MessageType"
], function (BaseController, JSONModel, RoomInfoBO, Constants, formatter, merge, Utility,
             MessageBox, Message, MessageType) {
    /* eslint-enable max-params */
    "use strict";

    return BaseController.extend("bstu.hmss.managerooms.object.tabs.roomInfo.RoomInfo", merge({

        formatter: formatter,
        ROOM_SECTION_ID: "RoomInfo",

        /**
         * Called when the RoomInfo controller is instantiated.
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
         * Gets the customer room form
         * @returns {sap.ui.layout.form.Form} - form control
         */
        getRoomInfoForm: function () {
            return this.byId("idRoomInfoForm");
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
         * Gets RoomInfo instance
         * @returns {bstu.hmss.managerooms.object.tabs.room.RoomInfoBO} BO instance
         * @public
         */
        getBO: function () {
            var oRoomInfoBO = new RoomInfoBO({
                component: this.getOwnerComponent(),
                odataModel: this.getModel(),
                viewModel: this.getViewModel()
            });

            this.getBO = function () {
                return oRoomInfoBO;
            };
            return oRoomInfoBO;
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

            var aSectionsToCheck = [this.ROOM_SECTION_ID];

            return aSectionsToCheck.every(function (sSectionToCheck) {
                return BaseController.prototype.compareServerClientData.call(this, sSectionToCheck);
            }.bind(this));
        },

        /**
         * Sets data for room tab
         * @param {object} oTabData - Related data with this tab
         * @public
         */
        setTabData: function (oTabData) {
            this._setSectionData(this.ROOM_SECTION_ID, oTabData);
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
    }));
});