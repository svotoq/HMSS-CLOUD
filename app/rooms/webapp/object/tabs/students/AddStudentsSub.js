sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Fragment",
    "bstu/hmss/lib/base/FieldValidations",
    "sap/ui/core/syncStyleClass",
    "bstu/hmss/lib/util/Utility",
    "bstu/hmss/lib/util/Constants",
    "sap/ui/core/ValueState",
    "sap/base/util/merge",
    "sap/m/MessageBox"
], function (Log, Fragment, FieldValidations, syncStyleClass, Utility, Constants, ValueState, merge, MessageBox) {
    "use strict";

    return {

        /**
         * Creates instance of add students dialog
         */
        openAddStudentsDialog: function () {
            if (!this._oAddStudentsDialog) {
                var oView = this.getView();

                this._oAddStudentsDialog = Fragment.load({
                    id: oView.getId(),
                    name: "bstu.hmss.managerooms.object.tabs.students.fragments.AddStudents",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._oAddStudentsDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        /**
         * Event handler for 'beforeOpen' of add Students dialog
         */
        onBeforeOpenAddStudentsDialog: function () {
            this.getOwnerComponent().removeAllMessages();
            this.getViewModel().setProperty("/AddStudentsDialog", this._getAddStudentsInitialData());
        },

        /**
         * Sets initial data for add students dialog
         * @returns {object} initial students dialog data
         * @private
         */
        _getAddStudentsInitialData: function () {
            return {
                Room: this.getViewModel().getProperty("/BRoom"),
                SelectedStudents: [],
                WizardBackVisible: false,
                WizardNextEnabled: false,
                WizardNextVisible: true,
                WizardReviewVisible: false,
                WizardReviewEnabled: false,
                WizardFinishVisible: false
            };
        },
        
        /**
        * Event handler for 'beforeOpen' of add students dialog
        */
        onAfterOpenAddStudentsDialog: function () {
            this._oWizard = this.byId("idAddStudentsWizard");

            this.handleButtonsVisibility();
        },

        handleButtonsVisibility: function () {
            var oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/AddStudentsDialog");
            switch (this._oWizard.getProgress()) {
                case 1: {
                    oDialogData.WizardNextVisible = true;
                    oDialogData.WizardBackVisible = false;
                    oDialogData.WizardReviewVisible = false;
                    oDialogData.WizardFinishVisible = false;
                    
                    oDialogData.WizardNextEnabled = oDialogData.SelectedStudents.length > 0;
                    break;
                }
                case 2: {
                    oDialogData.WizardBackVisible = true;
                    oDialogData.WizardNextVisible = false;
                    oDialogData.WizardReviewVisible = true;
                    oDialogData.WizardFinishVisible = false;

                    this._validateLiveDatesStep()
                    break;
                }
                case 3: {
                    oDialogData.WizardBackVisible = true;
                    oDialogData.WizardReviewVisible = false;
                    oDialogData.WizardFinishVisible = true;
                    break;
                }
            }

            oViewModel.setProperty("/AddStudentsDialog", oDialogData);
        },

        onPressAddStudentsNextStep: function () {
            if (this._oWizard.getProgressStep().getValidated()) {
                this._oWizard.nextStep();
            }
            this.handleButtonsVisibility();
        },

        onPressAddStudentsBack: function () {
            this._oWizard.previousStep();
            this.handleButtonsVisibility();
        },

        /**
         * Event handler for 'submit' of add students dialog
         */
        onPressSaveStudentsDialog: function () {
            this.getOwnerComponent().removeErrorMessages(false, true, true, true);
            if (this._validateDialog()) {
                this._addStudents();
            } else {
                this._showAddStudentsMessagePopover();
            }
        },

        /**
         * Calls a method to save data
         * @private
         */
        _addStudents: function () {
            var oViewModel = this.getViewModel(),
                aSelectedStudents = oViewModel.getProperty("/AddStudentsDialog/SelectedStudents"),
                aRoomStudents = oViewModel.getProperty("/Students/data");
            
            aRoomStudents = aRoomStudents.concat(aSelectedStudents);
            oViewModel.setProperty("/Students/data", aRoomStudents);
            this._getAddStudentsDialog().close();
        },

        /**
         * Event handler for 'cancel' of add students dialog
         */
        onPressCancelAddStudentsDialog: function () {
            this._getAddStudentsDialog().close();
        },

        /**
         * Event handler for 'afterClose' of add students dialog
         */
        onAfterCloseAddStudentsDialog: function () {
            this.getOwnerComponent().removeAllMessages();
            this._getAddStudentsDialog().destroy();
            this._oAddStudentsDialog = null;
        },

        /**
         * Event handler for 'press' of show message popover button
         */
        onPressShowAddStudentsMessagePopover: function () {
            this._showAddStudentsMessagePopover();
        },

        /**
         * Show create customer message popover
         * @private
         */
        _showAddStudentsMessagePopover: function () {
            this.showMessagePopover(this.byId("idAddStudentsMessagePopover"));
        },

        /**
         * Validated add students dialog
         * @returns {boolean} is information valid
         * @private
         */
        _validateDialog: function () {
            return true
        },

        /**
         * Convenience method to get Create AddStudents dialog control
         * @returns {sap.m.Dialog} AddStudents dialog
         * @private
         */
        _getAddStudentsDialog: function () {
            return this.byId("idAddStudentsDialog");
        },

        // Students

        /**
         * Event handler for beforeRebind event of smart table
         * @param {sap.ui.base.Event} oEvent - event object
         */
        onBeforeRebindStudentsTable: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");

            oBindingParams.events = {
                dataReceived: this.onStudentsDataTableRecieved.bind(this)
            };
        },

        /**
         * This is called method from onBeforeRebindTable event handler
         * @param {sap.ui.base.Event} oEvent  - data received event
         */
        onStudentsDataTableRecieved: function (oEvent) {
            if (typeof oEvent.getParameter("data") === "undefined") {
                this._showAddStudentsMessagePopover();
            }
        },

        onPressSelectStudent: function (oEvent) {
            var oContext = oEvent.getParameter("row").getBindingContext(),
                oSelectedStudent = oContext.getObject(),
                oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/AddStudentsDialog");

            if (oDialogData.SelectedStudents.length === Number(oDialogData.Room.EmptyPlaces)) {
                MessageBox.error(this.i18n("MessageBox.RoomIsFull"));
                return;
            }

            var isStudentSelected = !!oDialogData.SelectedStudents.find(function (oStudent) {
                return oStudent.ID === oSelectedStudent.ID
            });
            if (!isStudentSelected) {
                oDialogData.SelectedStudents.push(oSelectedStudent);
                oDialogData.WizardNextEnabled = true;
                this._oWizard.validateStep(this.getAddStudentsStep());
                oViewModel.setProperty("/AddStudentsDialog", oDialogData);
            } else {
                MessageBox.alert(this.i18n("MessageBox.StudentIsAlreadySelected"));
            }
        },

        onPressRemoveSelectedStudent: function (oEvent) {
            var oContext = oEvent.getParameter("row").getBindingContext("this"),
                oSelectedStudent = oContext.getObject(),
                oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/AddStudentsDialog");

            oDialogData.SelectedStudents = oDialogData.SelectedStudents.filter(function (oStudent) {
                return oStudent.ID !== oSelectedStudent.ID;
            });

            if (oDialogData.SelectedStudents.length === 0) {
                oDialogData.WizardNextEnabled = false;
                this._oWizard.invalidateStep(this.getAddStudentsStep());
            }
            oViewModel.setProperty("/AddStudentsDialog", oDialogData);
        },

        getAddStudentsStep: function () {
            return this.byId("idAddStudentsStep");
        },


        ///Students live dates
        onSelectCheckInLiveDateForAll: function (oEvent) {
            var oStudent = oEvent.getSource().getBindingContext("this").getObject(),
                sCheckInDate = oStudent.CheckIn;

            if (!sCheckInDate) {
                oEvent.getSource().setSelected(false);
                return;
            }

            var oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/AddStudentsDialog");

            oDialogData.SelectedStudents = oDialogData.SelectedStudents.map(function (oStudent) {
                oStudent.CheckIn = sCheckInDate;
                return oStudent;
            });

            oViewModel.setProperty("/AddStudentsDialog", oDialogData);
            this._validateLiveDatesStep();
        },
        onSelectCheckOutLiveDateForAll: function (oEvent) {
            var oStudent = oEvent.getSource().getBindingContext("this").getObject(),
                sCheckOutDate = oStudent.CheckOut;

            if (!sCheckOutDate) {
                oEvent.getSource().setSelected(false);
                return;
            }

            var oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/AddStudentsDialog");

            oDialogData.SelectedStudents = oDialogData.SelectedStudents.map(function (oStudent) {
                oStudent.CheckOut = sCheckOutDate;
                return oStudent;
            });
            oViewModel.setProperty("/AddStudentsDialog", oDialogData);
            this._validateLiveDatesStep();
        },

        onChangeCheckInLiveDate: function () {
            this._validateLiveDatesStep();

        },
        onChangeCheckOutLiveDate: function () {
            this._validateLiveDatesStep();

        },

        _validateLiveDatesStep: function () {
            var oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/AddStudentsDialog");

            var oStudentWithoutDates = oDialogData.SelectedStudents.find(function (oStudent) {
                return !oStudent.CheckIn || !oStudent.CheckOut;
            });

            if (!oStudentWithoutDates) {
                oDialogData.WizardReviewEnabled = true;
            } else {
                oDialogData.WizardReviewEnabled = false;
            }

            oViewModel.setProperty("/AddStudentsDialog", oDialogData);
        }

    };
});