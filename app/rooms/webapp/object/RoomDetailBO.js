sap.ui.define([
    "bstu/hmss/lib/base/BaseBO",
    "../Configuration",
    "sap/base/util/uid",
    "sap/base/strings/formatMessage",
    "sap/base/util/merge",
    "bstu/hmss/lib/util/Utility",
    "bstu/hmss/lib/util/Constants",
    "sap/ui/core/format/DateFormat"
], function (BaseBO, aInitialTabConfigs, uid, formatMessage, merge, Utility, Constants, DateFormat) {
    "use strict";
    return BaseBO.extend("bstu.hmss.managerooms.object.RoomDetailBO", merge({

        /**
         * Load Room
         * @param {string} aDependentSections - List of all dependent sections
         * @param {string[]} aPrerequisiteSections - EntityTypes of dependent sections of prerequisite tab
         * @returns {jQuery.Deferred} Deferred loading of existing Room data
         * @public
         */
        loadExistingRoom: function () {
            return this._loadExistingRoom();
        },

        /**
         * Sets RoomNumber of current room
         * @param {string} sRoomNumber - Room Number
         * @public
         */
        setRoomNumber: function (sRoomNumber) {
            this.getViewModel().setProperty("/ObjectHeaderEntityKey/RoomNumber", sRoomNumber);
        },

        /**
         * Gets RoomNumber of current room
         * @returns {string} sRoomNumber
         * @public
         */
        getRoomNumber: function () {
            return this.getViewModel().getProperty("/ObjectHeaderEntityKey/RoomNumber");
        },

        /**
         * Get Room header data from the whole object
         * @param {object} oBRoom - Room data
         * @param {string[]} aDependentSections - All Room dependents
         * @returns {object} Room header
         * @public
         */
        getBRoomHeader: function (oBRoom, aDependentSections) {
            var oBRoomHeader = merge({}, oBRoom);

            aDependentSections.forEach(function (sSectionName) {
                delete oBRoomHeader[sSectionName];
            });

            return oBRoomHeader;
        },

        /**
         * Convenience method to Header Entity Set
         * @returns {string} Header Entity Set name
         * @public
         */
        getHeaderSet: function () {
            return this.getViewModel().getProperty("/ObjectHeaderEntitySet");
        },

        getViewMode: function () {
            return this.getViewModel().getProperty("/CurrViewMode");
        },

        /**
         * Load tab data based on event ID and dependent sections
         * @param {string} sNewViewMode - Expected view mode for the tab
         * @param {string[]} aDependentSections - EntityTypes of dependent sections
         * @param {string[]} aPrerequisiteSections - EntityTypes of dependent sections of prerequisite tab
         * @param {object} oDependentData - Dependent section data
         * @returns {jQuery.Deferred} Deferred loading of tab data
         * @public
         */
        loadTabData: function (sNewViewMode) {
            return this.loadMetaModelDeferred().then(function () {
                return this.fetchDisplayModeData();
            }.bind(this));
        },

        /**
         * Load tab data based on event ID and dependent sections in Display Mode
         * @param {string} aDependentSections - EntityTypes of dependent sections
         * @returns {jQuery.Deferred} Deferred loading tab data
         * @public
         */
        fetchDisplayModeData: function () {
            var oOdataModel = this.getODataModel();
            var sHeaderSet = this.getHeaderSet();
            var sRoomPath = oOdataModel.createKey(sHeaderSet, {
                RoomNumber: this.getRoomNumber()
            });

            var aDependentSections = ["Students"];
            return Utility.odataRead(oOdataModel, sRoomPath, {
                urlParameters: {
                    $expand: aDependentSections.join(",")
                }
            });
        },

        /**
         * Load tab data based on event ID and dependent sections in Edit mode
         * @param {string[]} aDependentSections - EntityTypes of dependent sections
         * @param {string[]} aPrerequisiteSections - EntityTypes of dependent sections of prerequisite tab
         * @param {object} oDependentData - Dependent section data
         * @returns {jQuery.Deferred} Deferred loading of tab data
         * @public
         */
        fetchEditModeData: function (aDependentSections, aPrerequisiteSections, oDependentData) {
            var sCurrViewMode = this.getViewModel().getProperty("/CurrViewMode");
            var bEnterEditMode = sCurrViewMode === Constants.VIEW_MODES.DISPLAY;
            var oModifiedData = this._getEditCallPayload(aDependentSections, aPrerequisiteSections, oDependentData,
                bEnterEditMode);

            return Utility.odataCreate(
                this.getODataModel(),
                this.getHeaderSet(),
                oModifiedData
            );
        },

        /**
         * Save initialized room data on the backend side
         * @param {Object} oDependentsData - Dependents data to be saved
         * @returns {jQuery.Deferred} Deferred saving of a room
         * @public
         */
        save: function (oDependentsData) {
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd"});
            var aStudents = merge([], oDependentsData.Students)
                .map(function (oStudent) {
                    oStudent.CheckIn = oDateFormat.format(oStudent.CheckIn);
                    oStudent.CheckOut = oDateFormat.format(oStudent.CheckOut);
                    return Utility.removeMetadata(oStudent);
                });

            var aStudentsToDeleteFromRoom = merge([], aStudents
                .filter(function (oStudent) {
                    return oStudent.ActionIndicator === "DELETE";
                }));

            var aDeletePromises = aStudentsToDeleteFromRoom.reduce(function (aAcc, oStudent) {
                oStudent.Room_RoomNumber = null;
                oStudent.ActionIndicator = "";
                oStudent.CheckIn = null;
                oStudent.CheckOut = null;
                var pResult = Utility.odataUpdate(this.getODataModel(), "Students/" + oStudent.ID, oStudent);
                aAcc.push(pResult);
                return aAcc;
            }.bind(this), []);

            var oRoom = oDependentsData.RoomInfo,
                aNotes = oDependentsData.Notes.map(function (oNote) {
                    oNote.CreatedAt = oDateFormat.format(oNote.CreatedAt);
                    return oNote;
                });
            var oRoomPayload = this._getCreateRoomPayload(oRoom, aStudents, aNotes)
            return Promise.all(aDeletePromises)
                .then(function () {
                    var aLiveStudents = merge([], aStudents
                        .filter(function (oStudent) {
                            return oStudent.ActionIndicator !== "DELETE";
                        }));

                    oRoomPayload.EmptyPlaces = oRoomPayload.Capacity - aLiveStudents.length;
                    return Utility.odataUpdate(this.getODataModel(), "Rooms/" + oRoomPayload.RoomNumber, oRoomPayload)
                        .then(function (oResponse) {
                            var aStudentsToInsertInRoom = merge([], aStudents
                                .filter(function (oStudent) {
                                    return oStudent.ActionIndicator === "UPDATE";
                                }));

                            aStudentsToInsertInRoom.forEach(function (oStudent) {
                                oStudent.Room_RoomNumber = oResponse.RoomNumber;
                                oStudent.ActionIndicator = "";
                                Utility.odataUpdate(this.getODataModel(), "Students/" + oStudent.ID, oStudent);
                            }.bind(this));

                            return oResponse;
                        }.bind(this));
                }.bind(this))
        },

        _getCreateRoomPayload: function (oRoom, aStudents, aNotes) {
            var aRoomPayloadStudents = this._formatStudentsDate(aStudents);
            return {
                RoomNumber: oRoom.RoomNumber,
                Capacity: Number(oRoom.Capacity) || 0,
                Tables: Number(oRoom.Tables) || 0,
                Beds: Number(oRoom.Beds) || 0,
                ActionIndicator: "",
                EmptyPlaces: Number(oRoom.EmptyPlaces) || 0,
                Students: aRoomPayloadStudents || [],
                Notes: aNotes || []
            };
        },

        _formatStudentsDate: function (aStudents) {
            return merge([], aStudents
                .filter(function (oStudent) {
                    return oStudent.ActionIndicator === "" ||
                        oStudent.ActionIndicator === "CREATE";
                }))
                .map(function (oStudent) {
                    oStudent.ActionIndicator = "";
                    return oStudent;
                });
        },

        /**
         * Load Room
         * @param {string} aDependentSections - List of all dependent sections
         * @param {string[]} aPrerequisiteSections - EntityTypes of dependent sections of prerequisite tab
         * @returns {jQuery.Deferred} Deferred loading of existing Room data
         * @public
         */
        _loadExistingRoom: function () {
            var sViewMode = this.getViewModel().getProperty("/CurrViewMode");

            return this.loadTabData(sViewMode);
        },

        /**
         * Get payload for SAVE BRoom call
         * @param {Object} oDependentsData - Dependents data to be saved
         * @returns {Object} Configured payload object
         * @private
         */
        _getSavingCallPayload: function (oDependentsData) {
            return this._getUpdateCallBasePayload(oDependentsData);
        },

        /**
         * Get generic payload for UPDATE BRoom calls
         * @param {Object} oDependentsData - Dependents data to be saved
         * @returns {Object} Configured base payload object
         * @private
         */
        _getUpdateCallBasePayload: function (oDependentsData) {
            var oViewModel = this.getViewModel();
            var oRawBRoom = oViewModel.getProperty("/BRoom");
            var oBRoom = merge({}, oRawBRoom);

            Object.keys(oBRoom).forEach(function (sKey) {
                var vValue = oBRoom[sKey];
                // Data from dependent tab has higher priority
                if (vValue === null || oDependentsData[sKey]) {
                    delete oBRoom[sKey];
                }
            });

            merge(oBRoom, oDependentsData);

            return Utility.removeMetadata(oBRoom);
        },

        /**
         * Prepare event data payload for fetch edit data call
         * @param {string} aDependentSections - EntityTypes of dependent sections
         * @param {string[]} aPrerequisiteSections - EntityTypes of dependent sections of prerequisite tab
         * @param {object} oDependentData - Dependent section data
         * @param {boolean} bEnterEditMode - true if app was just switched to Edit mode
         * @returns {Object} Modified event data object w/o unnecessary properties
         * @public
         */
        _getEditCallPayload: function (aDependentSections, aPrerequisiteSections, oDependentData, bEnterEditMode) {
            var oViewModel = this.getViewModel();
            var oCurrentRoomData = oViewModel.getProperty("/BRoom");
            var oRequiredRoomData = this._addSectionDataPlaceholders(
                oCurrentRoomData, aDependentSections.concat(aPrerequisiteSections)
            );

            var oNewRoomData = merge({}, oRequiredRoomData, oDependentData);

            return Utility.removeMetadata(oNewRoomData);
        },

        /**
         * Add section placeholders to a given target copy
         * @param {object} oTarget - Source object
         * @param {string[]} aSections - Section ids
         * @returns {object} Target with attached placeholders
         * @private
         */
        _addSectionDataPlaceholders: function (oTarget, aSections) {
            var oTargetCopy = merge({}, oTarget);

            aSections.forEach(function (sSectionName) {
                oTargetCopy[sSectionName] = this.getSectionBlankData(sSectionName);
            }, this);

            return oTargetCopy;
        }
    }));
});