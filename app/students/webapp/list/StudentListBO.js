sap.ui.define([
    "bstu/hmss/lib/base/BaseBO",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/lib/util/Utility",
    "sap/ui/core/format/DateFormat"
], function (BaseBO, merge, Constants, Utility, DateFormat) {
    "use strict";
    return BaseBO.extend("bstu.hmss.managestudents.list.StudentListBO", merge({

        createStudent: function (oStudent) {
            var oStudentPayload = this._getCreateStudentPayload(oStudent);

            return Utility.odataCreate(this.getODataModel(), "Students", oStudentPayload)
                .then(function (oResponse) {
                    if (oResponse.Room_RoomNumber) {
                        return Utility.odataRead(this.getODataModel(), "Rooms/" + oResponse.Room_RoomNumber)
                            .then(function (oRoom) {
                                return Utility.odataUpdate(this.getODataModel(), "Rooms/" + oStudentPayload.Room_RoomNumber, {
                                    EmptyPlaces: Number(oRoom.EmptyPlaces) - 1
                                }).then(function (oBRoomResponse) {
                                    return oResponse;
                                })
                            }.bind(this));
                    } else {
                        return oResponse;
                    }
                }.bind(this));
        },

        _getCreateStudentPayload: function (oStudent) {
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd"});
            return {
                FirstName: oStudent.FirstName,
                LastName: oStudent.LastName,
                Patronymic: oStudent.Patronymic,
                Email: oStudent.Email,
                Room_RoomNumber: oStudent.Room_RoomNumber,
                CountryText: oStudent.CountryText,
                Country_code: oStudent.Country_code,
                City: oStudent.City,
                AddressLine: oStudent.AddressLine,
                ZipCode: oStudent.ZipCode,
                CheckIn: oDateFormat.format(oDateFormat.parse(oStudent.CheckIn)) || null,
                CheckOut: oDateFormat.format(oDateFormat.parse(oStudent.CheckOut)) || null,
                ActionIndicator: "",
                Phones: this.getStudentPhones(oStudent)
            };
        },

        getStudentPhones: function (oStudent) {
            var aPhoneTypes = ["MobilePhone", "HomePhone", "ParentPhone"];

            return aPhoneTypes.reduce(function (aAcc, sType) {
                if (oStudent[sType].PhoneNumber) {
                    aAcc.push(oStudent[sType]);
                }
                return aAcc;
            }, []);
        }
    }));
});