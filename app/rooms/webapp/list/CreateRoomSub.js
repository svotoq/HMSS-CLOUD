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
         * Creates instance of Create Room dialog
         */
        openCreateRoomDialog: function () {
            if (!this._oCreateRoomDialog) {
                var oView = this.getView();

                this._oCreateRoomDialog = Fragment.load({
                    id: oView.getId(),
                    name: "bstu.hmss.managerooms.list.fragments.CreateRoom",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._oCreateRoomDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        /**
         * Event handler for 'beforeOpen' of create Room dialog
         */
        onBeforeOpenCreateRoomDialog: function () {
            this.getOwnerComponent().removeAllMessages();
            this.getViewModel().setProperty("/CreateRoomDialog", this._getCreateRoomInitialData());
        },

        /**
        * Event handler for 'beforeOpen' of create Room dialog
        */
        onAfterOpenCreateRoomDialog: function () {
            this._oWizard = this.byId("idCreateRoomWizard");

            this.handleButtonsVisibility();
        },

        handleButtonsVisibility: function () {
            var oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/CreateRoomDialog");
            switch (this._oWizard.getProgress()) {
                case 1: {
                    oDialogData.WizardNextVisible = true;
                    oDialogData.WizardBackVisible = false;
                    oDialogData.WizardReviewVisible = false;
                    oDialogData.WizardFinishVisible = false;
                    oDialogData.CreateWithoutStudentsVisible = true;

                    if (oDialogData.Room.RoomNumber) {
                        oDialogData.CreateWithoutStudentsEnabled = true;
                        oDialogData.WizardNextEnabled = true;
                    } else {
                        oDialogData.CreateWithoutStudentsEnabled = false;
                        oDialogData.WizardNextEnabled = false;
                    }
                    break;
                }
                case 2: {
                    oDialogData.WizardBackVisible = true;
                    oDialogData.CreateWithoutStudentsVisible = false;
                    oDialogData.WizardReviewVisible = false;
                    oDialogData.WizardNextVisible = true;

                    if (oDialogData.SelectedStudents.length > 0) {
                        oDialogData.WizardNextEnabled = true;
                    } else {
                        oDialogData.WizardNextEnabled = false;
                    }
                    break;
                }
                case 3: {
                    oDialogData.WizardBackVisible = true;
                    oDialogData.WizardNextVisible = false;
                    oDialogData.WizardReviewVisible = true;
                    oDialogData.WizardFinishVisible = false;

                    this._validateLiveDatesStep()
                    break;
                }
                case 4: {
                    oDialogData.WizardBackVisible = true;
                    oDialogData.WizardReviewVisible = false;
                    oDialogData.WizardFinishVisible = true;
                    break;
                }
            }

            oViewModel.setProperty("/CreateRoomDialog", oDialogData);
        },

        onPressCreateRoomNextStep: function () {
            if (this._oWizard.getProgressStep().getValidated()) {
                this._oWizard.nextStep();
            }
            this.handleButtonsVisibility();
        },

        onPressCreateRoomBack: function () {
            this._oWizard.previousStep();
            this.handleButtonsVisibility();
        },

        onLiveChangeRoomNumber: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
                oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/CreateRoomDialog");
            if (sValue) {
                oDialogData.WizardNextEnabled = true;
                oDialogData.CreateWithoutStudentsEnabled = true;
            } else {
                oDialogData.WizardNextEnabled = false;
                oDialogData.CreateWithoutStudentsEnabled = false;
            }

            oViewModel.setProperty("/CreateRoomDialog", oDialogData);
        },

        /**
         * Event handler for 'submit' of create Room dialog
         */
        onPressCreateRoomDialog: function () {
            this.getOwnerComponent().removeErrorMessages(false, true, true, true);
            if (this._validateDialog()) {
                this._saveData();
            } else {
                this._showCreateRoomMessagePopover();
            }
        },

        onPressCreateWithoutStudents: function () {
            this.getOwnerComponent().removeErrorMessages(false, true, true, true);
            if (this._validateDialog()) {
                this._createRoomWithoutStudents();
            } else {
                this._showCreateRoomMessagePopover();
            }
        },

        /**
         * Calls a method to save data
         * @private
         */
        _createRoomWithoutStudents: function () {
            var oDialog = this._getCreateRoomDialog();
            oDialog.setBusy(true);

            var oNewRoom = this.getViewModel().getProperty("/CreateRoomDialog/Room");
            
            this.getBO().createRoom(oNewRoom)
                .then(function (oRoom) {
                    oDialog.setBusy(false);
                    oDialog.close();
                    this.navigateToRoomDetails(oRoom.RoomNumber);
                }.bind(this))
                .fail(function (oError) {
                    oDialog.setBusy(false);
                    this.handleError(oError, this.byId("idCreateRoomMessagePopover"));
                }.bind(this));
        },

        /**
         * Event handler for 'cancel' of create Room dialog
         */
        onPressCancelRoomDialog: function () {
            this._getCreateRoomDialog().close();
        },

        /**
         * Event handler for 'afterClose' of create Room dialog
         */
        onAfterCloseCreateRoomDialog: function () {
            this.getOwnerComponent().removeAllMessages();
            this._getCreateRoomDialog().destroy();
            this._oCreateRoomDialog = null;
        },

        /**
         * Event handler for 'press' of show message popover button
         */
        onPressShowCreateRoomMessagePopover: function () {
            this._showCreateRoomMessagePopover();
        },

        /**
         * Show create customer message popover
         * @private
         */
        _showCreateRoomMessagePopover: function () {
            this.showMessagePopover(this.byId("idCreateRoomMessagePopover"));
        },

        /**
         * Sets initial data for Create Room dialog
         * @returns {object} initial customer data
         * @private
         */
        _getCreateRoomInitialData: function () {
            return {
                Room: {
                    RoomNumber: "",
                    Capacity: 0,
                    Beds: 0,
                    Tables: 0,
                    EmptyPlaces: 0
                },
                SelectedStudents: [],
                WizardBackVisible: false,
                WizardNextEnabled: false,
                WizardNextVisible: true,
                WizardReviewVisible: false,
                WizardReviewEnabled: false,
                WizardFinishVisible: false,
                CreateWithoutStudentsVisible: true,
                CreateWithoutStudentsEnabled: false
            };
        },

        /**
         * Validated Room Profile and Vehicles fields
         * @returns {boolean} is customer information valid
         * @private
         */
        _validateDialog: function () {
            return this.validateCreateRoomDataConsistency();
        },

        /**
         * Validates create customer form fields
         * @returns {boolean} validation result
         */
        validateCreateRoomDataConsistency: function () {
            var aFormElements = Utility.getFormElements(this.byId("idCreateRoomForm"));
            var aRequiredFormElements = aFormElements.filter(function (oFE) {
                return oFE.getLabel().getRequired();
            });
            var aGroupedFormFields = aRequiredFormElements.map(function (oFE) {
                return oFE.getFields();
            });
            var aRequiredFields = [].concat.apply([], aGroupedFormFields);

            var aInvalidFields = aRequiredFields.filter(function (oField) {
                return !FieldValidations.isRequiredValueFieldValid(oField);
            }, this);

            aInvalidFields.forEach(function (oField) {
                var oFormElement = oField.getParent();
                var sFieldLabel = oFormElement.getLabel().getText();

                FieldValidations.setFieldValid(oField, false, {
                    property: "required",
                    element: oFormElement,
                    message: this.i18n("requiredFieldValidationError", sFieldLabel)
                }, false);
            }, this);

            return !aInvalidFields.length;
        },

        /**
         * Convenience method to get Create Room dialog control
         * @returns {sap.m.Dialog} Room dialog
         * @private
         */
        _getCreateRoomDialog: function () {
            return this.byId("idCreateRoomDialog");
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
                this._showCreateRoomMessagePopover();
            }
        },

        onPressSelectStudent: function (oEvent) {
            var oContext = oEvent.getParameter("row").getBindingContext(),
                oSelectedStudent = oContext.getObject(),
                oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/CreateRoomDialog");

            if (oDialogData.SelectedStudents.length === Number(oDialogData.Room.Capacity)) {
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
                oViewModel.setProperty("/CreateRoomDialog", oDialogData);
            } else {
                MessageBox.alert(this.i18n("MessageBox.StudentIsAlreadySelected"));
            }
        },

        onPressRemoveSelectedStudent: function (oEvent) {
            var oContext = oEvent.getParameter("row").getBindingContext("this"),
                oSelectedStudent = oContext.getObject(),
                oViewModel = this.getViewModel(),
                oDialogData = oViewModel.getProperty("/CreateRoomDialog");

            oDialogData.SelectedStudents = oDialogData.SelectedStudents.filter(function (oStudent) {
                return oStudent.ID !== oSelectedStudent.ID;
            });

            if (oDialogData.SelectedStudents.length === 0) {
                oDialogData.WizardNextEnabled = false;
                this._oWizard.invalidateStep(this.getAddStudentsStep());
            }
            oViewModel.setProperty("/CreateRoomDialog", oDialogData);
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
                oDialogData = oViewModel.getProperty("/CreateRoomDialog");

            oDialogData.SelectedStudents = oDialogData.SelectedStudents.map(function (oStudent) {
                oStudent.CheckIn = sCheckInDate;
                return oStudent;
            });

            oViewModel.setProperty("/CreateRoomDialog", oDialogData);
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
                oDialogData = oViewModel.getProperty("/CreateRoomDialog");

            oDialogData.SelectedStudents = oDialogData.SelectedStudents.map(function (oStudent) {
                oStudent.CheckOut = sCheckOutDate;
                return oStudent;
            });
            oViewModel.setProperty("/CreateRoomDialog", oDialogData);
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
                oDialogData = oViewModel.getProperty("/CreateRoomDialog");

            var oStudentWithoutDates = oDialogData.SelectedStudents.find(function (oStudent) {
                return !oStudent.CheckIn || !oStudent.CheckOut;
            });

            if (!oStudentWithoutDates) {
                oDialogData.WizardReviewEnabled = true;
            } else {
                oDialogData.WizardReviewEnabled = false;
            }

            oViewModel.setProperty("/CreateRoomDialog", oDialogData);
        }

    };
});