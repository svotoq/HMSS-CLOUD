/* eslint-disable max-params */
sap.ui.define([
    "sap/ui/core/Fragment"
], function (Fragment) {
    /* eslint-enable max-params */
    "use strict";
    //ViewMode = STUDENT || ROOM
    return {

        _resetStudentModel: function () {
            var oEmptyStudent = {
                FirstName: "",
                LastName: "",
                Patronymic: "",
                Email: "",
                Room_RoomNumber: "",
                Country: "",
                City: "",
                AddressLine: "",
                ZipCode: ""
            };
            this.getModel("this").setProperty("/CreateStudentDialog", oEmptyStudent);
        },


        openCreateStudentDialog: function () {
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

        /**
         * Event handler for 'afterClose' of create student dialog
         */
        _onAfterCloseCreateStudentDialog: function () {
            this._resetStudentModel();
            this._oAddVehicleDialog.destroy();
            this._oAddVehicleDialog = null;
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
                var oNewStudent = this.getModel("this").getProperty("/NewStudent");
                // this.fireStudentCreated({newStudent: oNewStudent});
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
        }
    };
});
