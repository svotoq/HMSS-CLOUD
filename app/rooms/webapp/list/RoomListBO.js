sap.ui.define([
    "bstu/hmss/lib/base/BaseBO",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/lib/util/Utility",
], function (BaseBO, merge, Constants, Utility) {
    "use strict";
    return BaseBO.extend("bstu.hmss.managerooms.list.RoomListBO", merge({

        createRoom: function (oRoom) {
            return Utility.odataCreate(this.getODataModel(), "Rooms", oRoom);
        }
    }));
});