sap.ui.define([], function () {
    "use strict";

    return [
        {
            Id: "PROFILE",
            Sections: [],
            IsDefault: true,
            ViewName: "bstu.hmss.managestudents.object.tabs.profile.StudentProfile",
            DependentTab: [],
            PrerequisiteTab: []
        },
        {
            Id: "NOTES",
            Sections: [],
            IsDefault: false,
            ViewName: "bstu.hmss.managestudents.object.tabs.notes.StudentNotes",
            DependentTab: [],
            PrerequisiteTab: []
        }
    ];
});