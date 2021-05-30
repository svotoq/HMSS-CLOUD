/* eslint-disable max-params */
sap.ui.define([
    "sap/ui/core/Fragment",
    "bstu/hmss/lib/util/Constants"
], function (Fragment, Constants) {
    /* eslint-enable max-params */
    "use strict";
    //ViewMode = STUDENT || ROOM
    return {

        _initStudentModel: function () {
            var sRoomNumber = this.getViewModel().getProperty("/BRoom/RoomNumber");
            var oDialogData = {
                NewStudent: {
                    FirstName: "",
                    LastName: "",
                    Patronymic: "",
                    Email: "",
                    Room_RoomNumber: sRoomNumber,
                    City: "",
                    AddressLine: "",
                    ZipCode: ""
                },
                ViewMode: "STUDENT"
            };
            this.getViewModel().setProperty("/CreateStudentDialog", oDialogData);
        },

        openCreateStudentDialogForRoom: function () {
            this._initStudentModel();
            this.getViewModel().setProperty("/CreateStudentDialog/ViewMode", "ROOM");
            this._loadCreateStudentDialog();
        },

        openCreateStudentDialog: function () {
            this._initStudentModel();
            this._loadCreateStudentDialog();
        },

        _loadCreateStudentDialog: function () {
            this.setAppBusy(true);
            if (!this._oDialogCreateStudent) {
                var oView = this.getView();

                this._oDialogCreateStudent = Fragment.load({
                    id: oView.getId(),
                    name: "bstu.hmss.lib.fragments.createStudent.CreateStudent",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._oDialogCreateStudent.then(function (oDialog) {
                oDialog.open();
            });
        },

        _onAfterOpenCreateStudentDialog: function () {
            this.setAppBusy(false);
        },

        /**
         * Event handler for 'afterClose' of create student dialog
         */
        _onAfterCloseCreateStudentDialog: function () {
            this._getCreateStudentDialog().destroy();
            this._oDialogCreateStudent = null;
        },

        /**
         * Close create student dialog
         */
        _onPressCancelCreateStudentDialog: function () {
            this._getCreateStudentDialog().close();
        },

        /**
         * Convenience method to get Create AddStudents dialog control
         * @returns {sap.m.Dialog} AddStudents dialog
         * @private
         */
        _getCreateStudentDialog: function () {
            return this.byId("idCreateStudentDialog");
        },

        _onPressSubmitCreateStudentDialog: function () {
            if (this._validateDialog()) {
                var oNewStudent = this.getViewModel().getProperty("/CreateStudentDialog/NewStudent");
                oNewStudent.ActionIndicator = Constants.ODATA_ACTIONS.CREATE;
                this.saveNewStudent(oNewStudent);
                this._getCreateStudentDialog().close();
            } else {
                this._showCreateStudentMessagePopover();
            }
        },

        /**
         * Show create customer message popover
         * @private
         */
        _showCreateStudentMessagePopover: function () {
            this.showMessagePopover(this.byId("idCreateStudentDialogMessagePopover"));
        },

        _onPressShowCreateStudentMessagePopover: function () {
            this._showCreateStudentMessagePopover();
        },

        _validateDialog: function () {
            return true;
        },

        onChangeLiveDates: function () {
            var oNewStudent = this.getViewModel().getProperty("/CreateStudentDialog/NewStudent");
            if (oNewStudent.CheckIn && oNewStudent.CheckOut) {
                //error checkIn > CheckOut
            }
        }
    };
});
