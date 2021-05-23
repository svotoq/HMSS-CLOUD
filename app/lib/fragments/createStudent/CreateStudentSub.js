/* eslint-disable max-params */
sap.ui.define([], function () {
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
            this._getCreateStudentDialog().open();
        },

        _getCreateStudentDialog: function () {
            if (!this._oDialogCreateStudent) {
                this._oDialogCreateStudent = sap.ui.xmlfragment(
                    this.getId(),
                    "bstu.hmss.lib.fragments.createStudent.CreateStudent",
                    this
                );
                this.addDependent(this._oDialogCreateStudent);
                this._oDialogCreateStudent.setBindingContext(null);
            }
            return this._oDialogCreateStudent;
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
