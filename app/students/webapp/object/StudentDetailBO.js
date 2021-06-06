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
    return BaseBO.extend("bstu.hmss.managestudents.object.StudentDetailBO", merge({

        /**
         * Load Student
         * @param {string} aDependentSections - List of all dependent sections
         * @param {string[]} aPrerequisiteSections - EntityTypes of dependent sections of prerequisite tab
         * @returns {jQuery.Deferred} Deferred loading of existing Student data
         * @public
         */
        loadExistingStudent: function () {
            return this._loadExistingStudent();
        },

        /**
         * Sets ID of current student
         * @param {string} sID - ID
         * @public
         */
        setID: function (sID) {
            this.getViewModel().setProperty("/ObjectHeaderEntityKey/ID", sID);
        },

        /**
         * Gets ID of current student
         * @returns {string} sID
         * @public
         */
        getID: function () {
            return this.getViewModel().getProperty("/ObjectHeaderEntityKey/ID");
        },

        /**
         * Get Student header data from the whole object
         * @param {object} oBStudent - Student data
         * @param {string[]} aDependentSections - All Student dependents
         * @returns {object} Student header
         * @public
         */
        getBStudentHeader: function (oBStudent, aDependentSections) {
            var oBStudentHeader = merge({}, oBStudent);

            aDependentSections.forEach(function (sSectionName) {
                delete oBStudentHeader[sSectionName];
            });

            return oBStudentHeader;
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
            var sStudentPath = oOdataModel.createKey(sHeaderSet, {
                ID: this.getID()
            });

            var aDependentSections = [];

            return Utility.odataRead(oOdataModel, sStudentPath, {
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
         * Save initialized student data on the backend side
         * @param {Object} oDependentsData - Dependents data to be saved
         * @returns {jQuery.Deferred} Deferred saving of a student
         * @public
         */
        save: function (oDependentsData) {
            var oStudentPayload = this._getCreateStudentPayload(oDependentsData);

            return Utility.odataUpdate(this.getODataModel(), "Students(" + oStudentPayload.ID + ")", oStudentPayload);
        },


        _getCreateStudentPayload: function (oData) {
            var oStudent = oData.Profile;
            oStudent.ActionIndicator = "";
            oStudent.Notes = oData.Notes;
            delete oStudent.HeaderPhone;
            return Utility.removeMetadata(oStudent);
        },

        /**
         * Load Student
         * @param {string} aDependentSections - List of all dependent sections
         * @param {string[]} aPrerequisiteSections - EntityTypes of dependent sections of prerequisite tab
         * @returns {jQuery.Deferred} Deferred loading of existing Student data
         * @public
         */
        _loadExistingStudent: function () {
            var sViewMode = this.getViewModel().getProperty("/CurrViewMode");

            return this.loadTabData(sViewMode);
        },

        /**
         * Get payload for SAVE BStudent call
         * @param {Object} oDependentsData - Dependents data to be saved
         * @returns {Object} Configured payload object
         * @private
         */
        _getSavingCallPayload: function (oDependentsData) {
            return this._getUpdateCallBasePayload(oDependentsData);
        },

        /**
         * Get generic payload for UPDATE BStudent calls
         * @param {Object} oDependentsData - Dependents data to be saved
         * @returns {Object} Configured base payload object
         * @private
         */
        _getUpdateCallBasePayload: function (oDependentsData) {
            var oViewModel = this.getViewModel();
            var oRawBStudent = oViewModel.getProperty("/BStudent");
            var oBStudent = merge({}, oRawBStudent);

            Object.keys(oBStudent).forEach(function (sKey) {
                var vValue = oBStudent[sKey];
                // Data from dependent tab has higher priority
                if (vValue === null || oDependentsData[sKey]) {
                    delete oBStudent[sKey];
                }
            });

            merge(oBStudent, oDependentsData);

            return Utility.removeMetadata(oBStudent);
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
            var oCurrentStudentData = oViewModel.getProperty("/BStudent");
            var oRequiredStudentData = this._addSectionDataPlaceholders(
                oCurrentStudentData, aDependentSections.concat(aPrerequisiteSections)
            );

            var oNewStudentData = merge({}, oRequiredStudentData, oDependentData);

            return Utility.removeMetadata(oNewStudentData);
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