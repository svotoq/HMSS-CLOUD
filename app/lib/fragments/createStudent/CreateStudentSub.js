/* eslint-disable max-params */
sap.ui.define([
    "sap/ui/core/Fragment",
    "bstu/hmss/lib/util/Constants",
    "sap/base/util/merge",
    "./SelectRoomDialogSub",
    "sap/ui/model/json/JSONModel",
    "bstu/hmss/lib/model/messageBundle",
    "bstu/hmss/lib/util/Utility",
    "bstu/hmss/lib/base/FieldValidations",
    "sap/ui/core/ValueState",
    "../../model/resourceModel",
    "./StudentProfileValidator"
], function (Fragment, Constants, merge, SelectRoomDialogSub, JSONModel, messageBundle, Utility,
             FieldValidations, ValueState, resourceModel, CreateStudentValidator) {
    /* eslint-enable max-params */
    "use strict";
    //ViewMode = STUDENT || ROOM
    var oCreateRoomDialog = {

        ROOM_NUMBER: "",
        VIEW_MODE: "STUDENT",

        onPressShowSelectRoomDialog: function () {
            this.showSelectRoomDialog();
        },

        _initStudentData: function () {
            return {
                NewStudent: {
                    FirstName: "",
                    LastName: "",
                    Patronymic: "",
                    Email: "",
                    CountryText: "",
                    Country_code: "",
                    Room_RoomNumber: this.ROOM_NUMBER,
                    City: "",
                    AddressLine: "",
                    ZipCode: "",
                    CheckIn: "",
                    CheckOut: "",
                    MobilePhone: {
                        PhoneNumber: "",
                        PhoneType: "MOBILE"
                    },
                    HomePhone: {
                        PhoneNumber: "",
                        PhoneType: "HOME"
                    },
                    ParentPhone: {
                        PhoneNumber: "",
                        PhoneType: "PARENT"
                    }
                },
                ViewMode: this.VIEW_MODE
            };
        },

        openCreateStudentDialogForRoom: function () {
            this.ROOM_NUMBER = this.getViewModel().getProperty("/BRoom/RoomNumber");
            this.VIEW_MODE = "ROOM";
            this._loadCreateStudentDialog();
        },

        openCreateStudentDialog: function () {
            this.VIEW_MODE = "STUDENT";
            this.ROOM_NUMBER = "";
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
                }.bind(this));
            }
            this._oDialogCreateStudent.then(function (oDialog) {
                oDialog.open();
            });
        },

        onBeforeOpenCreateStudentDialog: function () {
            var oModel = new JSONModel(this._initStudentData());
            this.getCreateStudentDialog().setModel(oModel, "_createStudent");
        },

        getCreateStudentDialogModel() {
            return this.getCreateStudentDialog().getModel("_createStudent");
        },
        _onAfterOpenCreateStudentDialog: function () {
            this.setAppBusy(false);
        },

        /**
         * Event handler for 'afterClose' of create student dialog
         */
        _onAfterCloseCreateStudentDialog: function () {
            this.getOwnerComponent().removeAllMessages();
            this.getCreateStudentDialog().destroy();
            this._oDialogCreateStudent = null;
        },

        /**
         * Close create student dialog
         */
        _onPressCancelCreateStudentDialog: function () {
            this.getCreateStudentDialog().close();
        },

        /**
         * Event handler for 'selectionChange' of country combobox
         * @param {sap.ui.base.Event} oEvent - "selectionChange" application Event
         * @private
         */
        onSelectionChangeCountry: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var sText = "";

            if (oSelectedItem) {
                sText = oSelectedItem.data("countryCode");
            }

            this.getCreateStudentDialogModel().setProperty("/NewStudent/Country_code", sText);
        },

        onChangeStudentEmail: function (oEvent) {
            var sEmail = oEvent.getParameter("value"),
                bValid = true;

            if (sEmail) {
                var sSearch = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                bValid = !!~sEmail.search(sSearch);
            }
            if (!bValid) {
                var oField = oEvent.getSource();
                FieldValidations.setFieldValid(oField, false, {
                    element: oField,
                    message: messageBundle.getText("Validation.EnterCorrectEmail")
                }, false);
            }
        },

        /**
         * Convenience method to get Create AddStudents dialog control
         * @returns {sap.m.Dialog} AddStudents dialog
         * @private
         */
        getCreateStudentDialog: function () {
            return this.byId("idCreateStudentDialog");
        },

        _onPressSubmitCreateStudentDialog: function () {
            this.getOwnerComponent().removeAllMessages();
            if (this._validateDialog()) {
                var oDialogModel = this.getCreateStudentDialogModel();
                var oDialogData = oDialogModel.getProperty("/"),
                    oNewStudent = oDialogData.NewStudent;

                oNewStudent.ActionIndicator = Constants.ODATA_ACTIONS.CREATE;
                if (!oNewStudent.Room_RoomNumber) {
                    oNewStudent.CheckIn = "";
                    oNewStudent.CheckOut = "";
                    oDialogModel.setProperty("/NewStudent", oNewStudent);
                }
                if (oDialogData.ViewMode === "STUDENT") {
                    this.getCreateStudentDialog().setBusy(true);
                    this.saveNewStudent(oNewStudent)
                        .fail(function (oError) {
                            this.getCreateStudentDialog().setBusy(false);
                            this.handleError(oError, this.byId("idCreateRoomMessagePopover"));
                        }.bind(this));
                } else {
                    this.saveNewStudent(oNewStudent)
                    this.getCreateStudentDialog().close();
                }
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
            var bValidCheckInCheckOut = this.validateLiveDates(),
                bValidPhoneNumbers = this._validateStudentPhones(),
                bValidRequiredFormFields = this._validateRequiredFormFields();

            return bValidCheckInCheckOut && bValidPhoneNumbers && bValidRequiredFormFields;
        },

        /**
         * Validates required form fields
         * @returns {boolean} validation result
         */
        _validateRequiredFormFields: function () {
            var aFormElements = Utility.getFormElements(this.byId("idCreateStudentForm"));
            var aInvalidFields = aFormElements
                .filter(function (oFE) {
                    var oLabel = oFE.getLabel();
                    return oLabel.getRequired ? oFE.getVisible() && oLabel.getRequired() : false;
                })
                .map(function (oFE) {
                    return oFE.getFields();
                })
                .flat()
                .filter(function (oField) {
                    return !FieldValidations.isRequiredValueFieldValid(oField);
                }, this);

            aInvalidFields
                .forEach(function (oField) {
                    var oFormElement = oField.getParent();
                    var sFieldLabel = oFormElement.getLabel().getText();

                    FieldValidations.setFieldValid(oField, false, {
                        property: "required",
                        element: oFormElement,
                        message: messageBundle.getText("Validation.RequiredFieldValidationError", sFieldLabel)
                    }, true);
                }, this);

            return !aInvalidFields.length;
        },

        validateLiveDates: function () {
            var oNewStudent = this.getCreateStudentDialogModel().getProperty("/NewStudent");
            var bValid = true,
                sErrorMessage = "";
            if (oNewStudent.Room_RoomNumber) {
                var oDateFormat = sap.ui.core.format.DateFormat.getInstance();
                var oCheckInDatePicker = this.byId("idDatePickerCreateStudentCheckIn"),
                    oCheckOutDatePicker = this.byId("idDatePickerCreateStudentCheckOut");

                if (oDateFormat.parse(oNewStudent.CheckIn) && oDateFormat.parse(oNewStudent.CheckOut)) {
                    bValid = oDateFormat.parse(oNewStudent.CheckOut) > oDateFormat.parse(oNewStudent.CheckIn);
                    sErrorMessage = messageBundle.getText("Validation.CheckInGreaterCheckOut");
                } else {
                    bValid = false;
                    sErrorMessage = messageBundle.getText("Validation.CheckInAndCheckOutIsRequired");
                }

                oCheckInDatePicker.setValueState(bValid ? ValueState.None : ValueState.Error);
                oCheckInDatePicker.setValueStateText(bValid ? "" : sErrorMessage);

                oCheckOutDatePicker.setValueState(bValid ? ValueState.None : ValueState.Error);
                oCheckOutDatePicker.setValueStateText(bValid ? "" : sErrorMessage);
            }
            return bValid;
        },

        /**
         * Validates customer phones
         * @returns {boolean} validation result
         */
        _validateStudentPhones: function () {
            var oDialogData = this.getCreateStudentDialogModel().getProperty("/NewStudent"),
                aPhoneFields = this.getOwnerComponent().byFieldGroupId("idCreateStudentValidationGroupPhones"),
                sTarget = this.byId("idFormContainerCreateStudentPhone").getId();

            aPhoneFields = aPhoneFields.filter(function (oPhoneField) {
                return oPhoneField.getValue;
            });

            return this.getValidator().validateStudentPhones(oDialogData, aPhoneFields, sTarget);
        },

        onChangeLiveDates: function (oEvent) {
            this.validateLiveDates();
        },

        onChangeStudentPhone: function () {
            this._validateStudentPhones();
        },
        /**
         * Convenience method to get validator
         * @returns {sap.idp.omss.lib.base.BaseValidator} Validator reference
         * @public
         */
        getValidator: function () {
            var oCreateStudentValidator = new CreateStudentValidator({
                viewModel: this.getViewModel(),
                i18nModel: resourceModel,
                odataModel: this.getModel()
            });

            this.getValidator = function () {
                return oCreateStudentValidator;
            };

            return oCreateStudentValidator;
        }
    };

    return merge(oCreateRoomDialog, SelectRoomDialogSub);
});
