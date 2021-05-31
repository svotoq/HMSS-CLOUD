/* eslint-disable max-params */
sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./RoomStudentsBO",
    "bstu/hmss/lib/util/Constants",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Utility",
    "bstu/hmss/managerooms/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "./AddStudentsSub",
    "sap/m/MessageBox",
    "bstu/hmss/lib/fragments/createStudent/CreateStudentSub"
], function (BaseController, JSONModel, RoomStudentsBO, Constants, merge, Utility,
             formatter, Filter, FilterOperator, AddStudentsSub, MessageBox, CreateStudentSub) {
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
                
                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                }
                this.attachAppEvent("BRoomHeaderChange", this._handleBRoomHeaderChange, this);
                this.attachAppEvent("viewModeChange", this._handleViewModeChange, this);
                this.attachAppEvent("displayRoom", this._handleDisplayRoom, this);
            },

            /**
             * Handler for table row action press event. It triggers cross app navigation to order detail page.
             * @param {sap.ui.base.Event} oEvent Event object for press event on row action for navigation
             */
            onPressStudentDetail: function (oEvent) {
                var sStudentID = oEvent.getSource().getBindingContext("this").getProperty("ID");
                var oOutbound = this.getOwnerComponent().getManifestEntry("/sap.app/crossNavigation/outbounds/displayStudent");
                this.oCrossAppNavigator.toExternal({
                    target: oOutbound,
                    params: {"ID": sStudentID}
                });
            },

            onRowSelectionRoomStudents: function (oEvent) {
                var iIndex = this._getSelectedItemIndex(oEvent);
                this.getViewModel().setProperty("/SelectedRoomStudentIndex", iIndex);
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

            onPressAddStudent: function () {
                this.openAddStudentsDialog();
            },

            onPressCreateNewStudent: function () {
                this.openCreateStudentDialogForRoom();
            },

            saveNewStudent: function (oNewStudent) {
                var oViewModel = this.getViewModel(),
                    aRoomStudents = oViewModel.getProperty("/Students/data");

                aRoomStudents.push(oNewStudent);

                oViewModel.setProperty("/Students/data", aRoomStudents);
            },

            onPressDeleteStudent: function () {
                var iIndex = this.getViewModel().getProperty("/SelectedRoomStudentIndex"),
                    oAddressTable = this.getRoomStudentsTable();

                this.showConfirmDeleteItemMessageBox(iIndex, oAddressTable, this.STUDENTS_SECTION_ID);
            },
            /**
             * Shows a message box to confirm the deletion of the Item from table
             * @param {number} iIndex - index of the item in the SectionData array of the corresponding section
             * @param {sap.ui.table.Table} oTable - table control
             * @param {string} sSectionID - section id
             */
            showConfirmDeleteItemMessageBox: function (iIndex, oTable, sSectionID) {
                MessageBox.confirm(this.i18n("MessageBox.RemoveStudentFromRoom"), {
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
                var aSectionData = this.getSectionData(sSectionID);

                if (aSectionData[iIndex].ActionIndicator === Constants.ODATA_ACTIONS.CREATE
                    || aSectionData[iIndex].ActionIndicator === Constants.ODATA_ACTIONS.UPDATE) {
                    aSectionData.splice(iIndex, 1);
                } else {
                    aSectionData[iIndex].ActionIndicator = Constants.ODATA_ACTIONS.DELETE;
                }
                
                this.setSectionData(sSectionID, aSectionData);
            },
            /**
             * Gets the customer primary address table
             * @returns {sap.ui.table.Table} - table control
             */
            getRoomStudentsTable: function () {
                return this.byId("idRoomStudentsTable");
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
                    CurrViewMode: Constants.VIEW_MODES.DISPLAY,
                    SelectedRoomStudentIndex: -1
                });
            }
        }, AddStudentsSub, CreateStudentSub));
});