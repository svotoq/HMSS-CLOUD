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
            var oRoomPayload = this._getCreateRoomPayload(oRoom);

            if (oRoom.Students) {
                oRoomPayload.Students = this._formatStudentsDate(oRoom.Students);
            }
            return Utility.odataUpdate(this.getODataModel(), "Rooms('" + oRoomPayload.RoomNumber + "')", oRoomPayload);
        },

        _getCreateRoomPayload: function (oRoom) {
            return {
                RoomNumber: oRoom.RoomNumber,
                Capacity: oRoom.Capacity || 0,
                Rating: oRoom.Rating || 0,
                Tables: oRoom.Tables || 0,
                Beds: oRoom.Beds || 0,
                ActionIndicator: Constants.ODATA_ACTIONS.CREATE,
                EmptyPlaces: oRoom.EmptyPlaces || 0,
                Students: oRoom.Students || [],
                Notes: oRoom.Notes || []
            };
        },

        _formatStudentsDate: function (aStudents) {
            var oDateFormat = DateFormat.getDateInstance({pattern: "YYYY-MM-DD"});
            return aStudents.map(function (oStudent) {
                oStudent.CheckIn = oDateFormat.parse(oStudent.CheckIn);
                oStudent.CheckOut = oDateFormat.parse(oStudent.CheckOut);
                return Utility.removeMetadata(oStudent);
            });
        }

    }));
});