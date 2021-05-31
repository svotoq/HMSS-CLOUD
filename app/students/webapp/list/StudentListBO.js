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

            return Utility.odataCreate(this.getODataModel(), "Students", oStudentPayload);
        },

        _getCreateStudentPayload: function (oStudent) {
            return {
                FirstName: oStudent.FirstName,
                LastName: oStudent.LastName,
                Patronymic: oStudent.Patronymic,
                Email: oStudent.Email,
                Room_RoomNumber: oStudent.Room_RoomNumber,
                City: oStudent.City,
                AddressLine: oStudent.AddressLine,
                ZipCode: oStudent.ZipCode,
                CheckIn: oStudent.CheckIn,
                CheckOut: oStudent.CheckOut,
                ActionIndicator: ""
            };
        }
    }));
});