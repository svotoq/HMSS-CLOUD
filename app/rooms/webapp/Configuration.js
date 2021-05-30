sap.ui.define([], function () {
    "use strict";

    return [
        {
            Id: "ROOMINFO",
            Sections: [],
            IsDefault: true,
            ViewName: "bstu.hmss.managerooms.object.tabs.roomInfo.RoomInfo",
            DependentTab: [],
            PrerequisiteTab: []
        }, {
            Id: "ROOMSTUDENTS",
            Sections: [],
            IsDefault: false,
            ViewName: "bstu.hmss.managerooms.object.tabs.students.RoomStudents",
            DependentTab: [],
            PrerequisiteTab: []
        },
        {
            Id: "NOTES",
            Sections: [],
            IsDefault: false,
            ViewName: "bstu.hmss.managerooms.object.tabs.notes.RoomNotes",
            DependentTab: [],
            PrerequisiteTab: []
        }
    ];
});