/* eslint-disable max-params */
sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./StudentProfileBO",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/managestudents/model/formatter",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Utility",
    "sap/m/MessageBox",
    "bstu/hmss/lib/message/Message",
    "sap/ui/core/MessageType"
], function (BaseController, JSONModel, StudentProfileBO, Constants, formatter, merge, Utility,
             MessageBox, Message, MessageType) {
    /* eslint-enable max-params */
    "use strict";

    return BaseController.extend("bstu.hmss.managestudents.object.tabs.profile.StudentProfile", merge({

        formatter: formatter,
        PROFILE_SECTION_ID: "StudentProfile",
        STUDENT_PHONE_ID: "StudentPhones",

        /**
         * Called when the StudentProfile controller is instantiated.
         * @public
         */
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);

            this.setModel(new JSONModel({}), "this");

            this.attachAppEvent("BStudentHeaderChange", this._handleBStudentHeaderChange, this);
            this.attachAppEvent("viewModeChange", this._handleViewModeChange, this);
            this.attachAppEvent("displayStudent", this._handleDisplayStudent, this);
        },

        /**
         * Event handler "Add" Phone for unregistered customer
         * Adds a new row to the table if there is no row with an empty phone number
         */
        onPressAddStudentPhone: function () {
            var oStudentProfile = this.getSectionData(this.PROFILE_SECTION_ID),
                aPhones = oStudentProfile.Phones;

            var oEmptyPhone = aPhones.find(function (oPhone) {
                return !oPhone.PhoneNumber || !oPhone.PhoneType;
            });

            if (!oEmptyPhone) {
                var oNewPhone = {
                    ActionIndicator: Constants.ODATA_ACTIONS.CREATE,
                    PhoneType: Constants.PHONE_TYPES.MOBILE,
                    PhoneNumber: "",
                    PhoneNote: ""
                };
                aPhones.unshift(oNewPhone);
                oStudentProfile.Phones = aPhones;
                this.setSectionData(this.PROFILE_SECTION_ID, oStudentProfile);
            }
        },

        /**
         * Event handler "Delete" Phone for unregistered customer
         */
        onPressDeleteStudentPhone: function () {
            var oStudentProfile = this.getSectionData(this.PROFILE_SECTION_ID),
                aPhones = oStudentProfile.Phones;

            if (aPhones.length === 1) {
                MessageBox.error(this.i18n("MessageBox.OnePhoneIsRequired"));
            } else {
                var iIndex = this.getViewModel().getProperty("/SelectedStudentPhoneIndex"),
                    oPhoneTable = this.getStudentPhonesTable();

                this.showConfirmDeleteItemMessageBox(iIndex, oPhoneTable, this.STUDENT_PHONE_ID);
            }
        },

        /**
         * Shows a message box to confirm the deletion of the Item from table
         * @param {number} iIndex - index of the item in the SectionData array of the corresponding section
         * @param {sap.ui.table.Table} oTable - table control
         * @param {string} sSectionID - section id
         */
        showConfirmDeleteItemMessageBox: function (iIndex, oTable, sSectionID) {
            MessageBox.confirm(this.i18n("MessageBox.RemoveStudentPhone"), {
                title: this.i18n("MessageBox.ConfirmActionTitle"),
                initialFocus: MessageBox.Action.OK,
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this._deleteItemFromTable(iIndex, sSectionID);
                        oTable.clearSelection();
                    }
                }.bind(this)
            });
        },

        /**
         * Marks an item as deleted.
         * If the element has the "Create" action indicator, then it is completely deleted
         * @param {number} iIndex - index of the item in the SectionData array
         * @param {string} sSectionID - section id
         * @private
         */
        _deleteItemFromTable: function (iIndex, sSectionID) {
            if (sSectionID === this.STUDENT_PHONE_ID) {
                var oSectionData = this.getSectionData(this.PROFILE_SECTION_ID);
                oSectionData.Phones.splice(iIndex, 1);
                this.setSectionData(this.PROFILE_SECTION_ID, oSectionData);
            } 
        },

        /**
         * Sets index of the selected unregistered customer phone
         * @param {sap.ui.base.Event} oEvent - rowSelectionChange event
         */
        onRowSelectionChangeStudentPhone: function (oEvent) {
            var iIndex = this._getSelectedItemIndex(oEvent);
            this.getViewModel().setProperty("/SelectedStudentPhoneIndex", iIndex);
        },

        getStudentPhonesTable: function () {
            return this.byId("idStudentPhonesTable");
        },

        /**
         * Gets the customer student form
         * @returns {sap.ui.layout.form.Form} - form control
         */
        getStudentProfileForm: function () {
            return this.byId("idStudentProfileForm");
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
         * @returns {bstu.hmss.managestudents.object.tabs.profile.StudentProfileBO} BO instance
         * @public
         */
        getBO: function () {
            var oStudentProfileBO = new StudentProfileBO({
                component: this.getOwnerComponent(),
                odataModel: this.getModel(),
                viewModel: this.getViewModel()
            });

            this.getBO = function () {
                return oStudentProfileBO;
            };
            return oStudentProfileBO;
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

            var aSectionsToCheck = [this.PROFILE_SECTION_ID];

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
            this._setSectionData(this.PROFILE_SECTION_ID, oTabData);
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
            var oStudentProfile = this.getSectionData(this.PROFILE_SECTION_ID);
            oStudentProfile.Phones = oStudentProfile.Phones.map(function (oPhone) {
                delete oPhone.ActionIndicator;
                return oPhone;
            });
            return oStudentProfile;
        },

        /**
         * Gets the index of an element in the model
         * If the index of the selected row in the table is "-1", then this value is returned
         * @param {sap.ui.base.Event} oEvent - rowSelectionChange table event
         * @returns {number} selected item index
         * @private
         */
        _getSelectedItemIndex: function (oEvent) {
            var nSelectedIndex = oEvent.getSource().getSelectedIndex();
            if (!~nSelectedIndex) {
                return nSelectedIndex;
            }

            var oRowContext = oEvent.getParameter("rowContext");
            return Utility.getIndexFromPath(oRowContext.getPath());
        },

        /**
         * Gets an array with phone types
         * @returns {array} - phone types
         * @private
         */
        _getStudentPhoneTypes: function () {
            var aPhoneTypeKeys = Object.keys(Constants.PHONE_TYPES);
            return aPhoneTypeKeys.reduce(function (aAcc, sPhoneType) {
                aAcc.push({Type: sPhoneType});
                return aAcc;
            }, []);
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
                CurrViewMode: Constants.VIEW_MODES.DISPLAY,
                PhoneTypesVH: this._getStudentPhoneTypes()
            });
        }
    }));
});