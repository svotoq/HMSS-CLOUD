sap.ui.define([
    "bstu/hmss/lib/base/BaseBO",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/lib/util/Utility",
], function (BaseBO, merge, Constants, Utility) {
    "use strict";
    return BaseBO.extend("bstu.hmss.managerooms.list.RoomListBO", merge({

        createRoom: function (oRoom) {
            var oRoomPayload = this._getCreateRoomPayload(oRoom);

            return Utility.odataCreate(this.getODataModel(), "Rooms", oRoom);
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
            }
        }
    }));
});