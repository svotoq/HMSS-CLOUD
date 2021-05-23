sap.ui.define([], function () {
    "use strict";

    return [
        {
            Id: "ROOMINFO",
            Sections: [
                "Students"
            ],
            IsDefault: true,
            ViewName: "bstu.hmss.managerooms.object.tabs.roomInfo.RoomInfo",
            DependentTab: [],
            PrerequisiteTab: []
        }, {
            Id: "ROOMSTUDENTS",
            Sections: [
                "Students"
            ],
            IsDefault: false,
            ViewName: "bstu.hmss.managerooms.object.tabs.students.RoomStudents",
            DependentTab: [],
            PrerequisiteTab: [{
                Id: "ROOMINFO"
            }]
        }
    ];
});