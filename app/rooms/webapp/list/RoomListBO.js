sap.ui.define([
    "bstu/hmss/lib/base/BaseBO",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/lib/util/Utility",
    "sap/ui/core/format/DateFormat"
], function (BaseBO, merge, Constants, Utility, DateFormat) {
    "use strict";
    return BaseBO.extend("bstu.hmss.managerooms.list.RoomListBO", merge({

        createRoom: function (oRoom) {
            var oRoomPayload = this._getCreateRoomPayload(oRoom),
                aRoomStudents = [];
            if (oRoom.Students) {
                aRoomStudents = this._getStudentsPayload(oRoom.Students);
                oRoomPayload.EmptyPlaces = oRoomPayload.Capacity - oRoom.Students.length;
            }
            return Utility.odataCreate(this.getODataModel(), "Rooms", oRoomPayload)
                .then(function (oResponse) {
                    aRoomStudents.forEach(function (oStudent) {
                        oStudent.Room_RoomNumber = oResponse.RoomNumber;
                        oStudent.ActionIndicator = "";
                        Utility.odataUpdate(this.getODataModel(), "Students/" + oStudent.ID, oStudent);
                    }.bind(this));

                    return oResponse;
                }.bind(this));
        },

        _getCreateRoomPayload: function (oRoom) {
            return {
                RoomNumber: oRoom.RoomNumber,
                Capacity: Number(oRoom.Capacity) || 0,
                Tables: Number(oRoom.Tables) || 0,
                Beds: Number(oRoom.Beds) || 0,
                ActionIndicator: "",
                EmptyPlaces: Number(oRoom.Capacity) || 0,
                Students: [],
                Notes: oRoom.Notes || []
            };
        },

        _getStudentsPayload: function (aStudents) {
            return aStudents.map(function (oStudent) {
                return Utility.removeMetadata(oStudent);
            });
        }

    }));
});