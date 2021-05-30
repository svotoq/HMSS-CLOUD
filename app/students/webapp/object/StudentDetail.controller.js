/* eslint-disable max-params */
sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./StudentDetailBO",
    "../Configuration",
    "bstu/hmss/lib/util/Utility",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/managestudents/model/formatter",
    "sap/base/util/merge",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, StudentDetailBO, aInitialTabConfigs, Utility,
             Constants, formatter, merge, MessageBox, MessageToast) {
    /* eslint-enable max-params */
    "use strict";

    /**
     * Array with tab IDs
     * @private
     */
    var _aSectionIds = [
        "PROFILE",
        "NOTES",
    ];

    /**
     * Is navTo called only to change tab
     * @private
     */
    var _bTabChanged = false;

    return BaseController.extend("bstu.hmss.managestudents.object.StudentDetail", {

        formatter: formatter,

        /**
         * Called when the StudentDetail controller is instantiated.
         * @public
         */
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);

            this.getOwnerComponent().initializeMessagePopover(
                this.getView(), this.getMessageIndicatorButton()
            );
            if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
            }
            this.setModel(new JSONModel({}), "this");
            this.getRouter().getRoute("studentdetail").attachPatternMatched(this._onPatternMatchedStudentDetail, this);
        },

        /**
         * Event handler when 'Create Order' button gets pressed
         * @public
         * @param {sap.ui.base.Event} oEvent - application event
         */
        onPressOpenRoom: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("this");
            var sRoomNumber = oContext.getProperty("Room_RoomNumber");
            var oOutbound = this.getOwnerComponent().getManifestEntry("/sap.app/crossNavigation/outbounds/displayRoom");
            this.oCrossAppNavigator.toExternal({
                target: oOutbound,
                params: {"RoomNumber": sRoomNumber}
            });
        },

        /**
         * Handler fired when a tab is selected
         * @param {sap.ui.base.Event} oEvent - selected tab event
         * @public
         */
        onTabSelected: function (oEvent) {
            var oSelectedTab = oEvent.getParameter("section");

            //Checks if there is a viewId and view for this tab
            if (!(oSelectedTab.data && this._getTabView(oSelectedTab))) {
                return;
            }

            this.navToSelectedSection();

            this.setSectionData(oSelectedTab);
        },

        /**
         * Navigates to the selected section
         */
        navToSelectedSection: function () {
            var oSelectedSection = this.byId(this._getSelectedTabId());

            var sSectionId = this.getLocalId(oSelectedSection);
            var sSectionIndex = _aSectionIds.findIndex(function (sId) {
                return sId === sSectionId;
            });

            _bTabChanged = true;
            this.getRouter().navTo("studentdetail", {
                ID: this.getBO().getID(),
                query: {
                    sectionIndex: sSectionIndex
                }
            }, true /*without history*/);
        },

        /**
         * Sets data for section
         * @param {sap.uxap.ObjectPageSection} oSection - selected section
         * @private
         */
        setSectionData: function (oSection) {
            var oTabView = this._getTabView(oSection);
            if (!this._checkViewInitialLoad(oTabView)) {
                return;
            }
            this.loadTabData(this.getViewMode(), {});
        },

        /**
         * Event handler for 'edit' Student details
         * Sets the current tab as already open
         */
        onPressEdit: function () {
            this._resetSectionInitialLoadFlag();
            this.getOwnerComponent().removeAllMessages();
            this.setAppBusy(true);

            this.loadTabData(Constants.VIEW_MODES.EDIT)
                .then(function (oResponse) {
                    this._bindViewToBStudent(oResponse);
                    this.setAppBusy(false);
                }.bind(this))
                .fail(function (oError) {
                    this.setAppBusy(false);
                }.bind(this));
        },

        /**
         * Event handler for 'save' edited Student details
         */
        onPressSave: function () {
            this.validate().then(function (bValidData) {
                if (bValidData && this._checkPendingChanges()) {
                    this._updateStudent();
                } else if (bValidData) {
                    MessageBox.show(this.i18n("saveNothing"));
                }
            }.bind(this));
        },

        /**
         * Event handler for 'cancel' editing Student details
         */
        onPressCancel: function () {
            if (this._checkPendingChanges()) {
                MessageBox.confirm(this.i18n("cancelActionText"), {
                    title: this.i18n("MessageBox.ConfirmActionTitle"),
                    initialFocus: MessageBox.Action.OK,
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            this._cancelUserChanges();
                        }
                    }.bind(this)
                });
            } else {
                this._cancelUserChanges();
            }
        },

        /**
         * Handle Messages button press
         * @public
         */
        onMessagesButtonPress: function () {
            this.showMessagePopover(this.getMessageIndicatorButton());
        },

        /**
         * Load data for selected tab
         * @param {string} sNewViewMode - New view mode to set after the data is loaded
         * @param {object} oDependentData - Dependent tab section data
         * @returns {jQuery.Deferred} Deferred loading of tab data
         * @public
         */
        loadTabData: function (sNewViewMode, oDependentData) {
            var sDefaultedTabId = this._getSelectedTabId();
            var oSection = this.byId(sDefaultedTabId);
            var oTabView = this._getTabView(oSection);

            this.setAppBusy(true);

            return this.getBO()
                .loadTabData(sNewViewMode)
                .then(this._handleTabDataLoadSuccess.bind(this, oSection, sNewViewMode))
                .fail(this._handleTabDataLoadError.bind(this));
        },

        /**
         * Convenience method to get StudentDetail BO instance
         * @returns {bstu.hmss.managestudents.object.StudentDetailBO} BO instance
         * @public
         */
        getBO: function () {
            var oStudentDetailBO = new StudentDetailBO({
                component: this.getOwnerComponent(),
                odataModel: this.getComponentModel(),
                viewModel: this.getViewModel()
            });

            this.getBO = function () {
                return oStudentDetailBO;
            };

            return oStudentDetailBO;
        },

        /**
         * Get Main view view model
         * @returns {sap.ui.model.json.JSONModel} View model instance
         * @public
         */
        getViewModel: function () {
            return this.getModel("this");
        },

        /**
         * Get all dependent section Views
         * @returns {sap.ui.core.mvc.View[]} Dependent Views
         * @public
         */
        getDependentViews: function () {
            return [
                this.byId("PROFILE"),
                this.byId("NOTES")
            ]
                .map(this._getTabView.bind(this));
        },

        /**
         * Get all dependent section controllers
         * @returns {sap.ui.core.mvc.Controller[]} Dependent controllers
         * @public
         */
        getDependentControllers: function () {
            return this.getDependentViews().map(function (oView) {
                return oView.getController();
            });
        },

        /**
         * Gets dependent sections
         * @returns {string} Comma-separated dependent sections
         * @public
         */
        getDependentSections: function () {
            var aGroupedSections = aInitialTabConfigs.map(function (oTabConfig) {
                return oTabConfig.Sections;
            });

            return Array.prototype.concat.apply([], aGroupedSections);
        },

        /**
         * Sets default tab
         * @public
         */
        setDefaultSectionSelected: function () {
            this.getObjectPageLayout().setSelectedSection(this.getStudentInfoSection());
        },

        /**
         * Convenience method to get view mode
         * @returns {string} Current view mode
         * @public
         */
        getViewMode: function () {
            return this.getViewModel().getProperty("/CurrViewMode");
        },

        /**
         * Convenience method to set new view mode
         * @param {string} sNewMode - New view mode
         * @public
         */
        setViewMode: function (sNewMode) {
            var oViewModel = this.getViewModel();
            var sCurrentMode = oViewModel.getProperty("/CurrViewMode");

            if (sCurrentMode === sNewMode) {
                return;
            }

            oViewModel.setProperty("/CurrViewMode", sNewMode);
            this.fireAppEvent("viewModeChange", {
                newMode: sNewMode
            });
        },

        /**
         * Gets the control defined in the view
         * @returns {sap.uxap.ObjectPageLayout} Object page layout instance
         * @public
         */
        getObjectPageLayout: function () {
            var oObjectPageLayout = this.byId("idStudentDetailPage");

            this.getObjectPageLayout = function () {
                return oObjectPageLayout;
            };

            return oObjectPageLayout;
        },

        /**
         * Returns instance of student profile section
         * @returns {sap.uxap.ObjectPageSection} Student profile section instance
         * @public
         */
        getStudentInfoSection: function () {
            return this.byId("PROFILE");
        },

        /**
         * Getter for Message popover button
         * In Main View
         * @public
         * @returns {sap.m.Button} - message popover button
         */
        getMessageIndicatorButton: function () {
            return this.byId("idMessagePopoverButton");
        },

        validate: function () {
            var oComponent = this.getOwnerComponent();

            oComponent.removeSuccessMessages();
            oComponent.removeErrorMessages(false, true, true, true);

            return this._validateDependents().then(function (bDependentsValid) {
                if (!bDependentsValid) {
                    this.showMessagePopover(this.getMessageIndicatorButton());
                }

                return bDependentsValid;
            }.bind(this));
        },

        /**
         * Cancel editing existing student: reset all changes and enter display mode
         * @public
         */
        cancelEditingStudent: function () {
            this.getOwnerComponent().removeAllMessages();

            this._resetSectionInitialLoadFlag();
            this._removeDependentsData();
            this.loadTabData(Constants.VIEW_MODES.DISPLAY)
                .then(function (oResponse) {
                    var aDependentSections = this._getSelectedTabDependentSections();
                    var oBStudentHeader = this.getBO().getBStudentHeader(oResponse, aDependentSections);
                    this._bindViewToBStudent(oBStudentHeader);
                }.bind(this));
        },

        /**
         * Handler fired when the current URL hash matches the pattern of the route
         * @param {sap.ui.base.Event} oEvent - route matched event
         * @private
         */
        _onPatternMatchedStudentDetail: function (oEvent) {
            if (_bTabChanged) {
                _bTabChanged = false;
                return;
            }

            var mArguments = oEvent.getParameter("arguments");
            var sID = mArguments.ID;
            var oQuery = mArguments["?query"];
            var sSectionId = oQuery && _aSectionIds[oQuery.sectionIndex];

            this._initThisModel();
            this.setDefaultSectionSelected();
            this.loadMetaModelDeferred().then(function () {
                this.setAppBusy(true);
                this.setViewMode(Constants.VIEW_MODES.DISPLAY);
                this.getBO().setID(sID);
                // this._resetSectionInitialLoadFlag();
                // this._removeDependentsData();
                this.getOwnerComponent().removeAllMessages();
                this._loadExistingStudent().then(function () {
                    //First, you need to load the student's header and profile,
                    //and only then recently opened tab
                    if (sSectionId) {
                        var oSection = this.byId(sSectionId);
                        this.getObjectPageLayout().setSelectedSection(oSection);
                        this.setSectionData(oSection);
                    }
                }.bind(this));
            }.bind(this));

            this.fireAppEvent("displayStudent", {
                ID: sID
            });
        },

        /**
         * Initialize view model "this"
         * @private
         */
        _initThisModel: function () {
            this.getViewModel().setProperty("/", {
                ObjectHeaderEntitySet: "Students",
                IsInitialLoadComplete: false,
                IsGlobalActionsAvailable: true,
                BStudent: {},
                CurrViewMode: Constants.VIEW_MODES.DISPLAY,
                ObjectHeaderEntityKey: {
                    ID: ""
                }
            });
        },

        /**
         * Reset Tab initial load flag
         * @private
         */
        _resetSectionInitialLoadFlag: function () {
            this.getDependentControllers().forEach(function (oController) {
                if (oController.setSectionInitialLoad) {
                    oController.setSectionInitialLoad(true);
                }
            });
        },

        /**
         * Remove all dependent sections data so that these are rendered blank
         * @private
         */
        _removeDependentsData: function () {
            var aDependentControllers = this.getDependentControllers();
            var aControllersToModify = aDependentControllers.filter(function (oController) {
                return oController.setTabData;
            });

            aControllersToModify.forEach(function (oController) {
                var oTabView = oController.getView();
                var aTabSections = this._getDependentSectionsForTab(oTabView);
                var oTabBlankData = aTabSections.reduce(function (oAccumulator, sSection) {
                    oAccumulator[sSection] = this.getBO().getSectionBlankData(sSection);
                    return oAccumulator;
                }.bind(this), {});

                oController.setTabData(oTabBlankData);
            }, this);
        },

        /**
         * Initialize application in Existing Student mode
         * @private
         */
        _loadExistingStudent: function () {
            // var aPrerequisiteSections = this._getDependentSectionsOfPrerequisiteTabsToLoad(this._getSelectedTabId());
            // var aDependentSections = this._getSelectedTabDependentSections();
            return this.getBO()
                .loadExistingStudent()
                .then(function () {
                    // Reset Dirty flag as well
                    sap.ushell.Container.setDirtyFlag(false);
                    this._handleInitCallSuccess.apply(this, arguments);
                    this.setViewMode(Constants.VIEW_MODES.DISPLAY);
                    this._initialLoadCompleted();
                    return arguments;
                }.bind(this))
                .fail(function (oError) {
                    this._handleTabDataLoadError(oError);
                }.bind(this));
        },

        /**
         * Handler for errors
         * @param {object} oError - error description
         * @private
         */
        _handleTabDataLoadError: function (oError) {
            this.setAppBusy(false);
            this.handleError(oError);
            //Hide Global Actions buttons
            this.getViewModel().setProperty("/IsGlobalActionsAvailable", false);
        },

        /**
         * Handler for successful student initial load
         * @param {Object} oResponse - UIConfig call response
         * @param {Object[]} oResponse.config - List of section UIConfigs
         * @param {Object[]} oResponse.header - Event Header data
         * @private
         */
        _handleInitCallSuccess: function (oResponse) {
            this._bindViewToBStudent(oResponse);
            this.setAppBusy(false);
            this._initDefaultTabView(this.byId(this._getSelectedTabId()), oResponse);
        },

        /**
         * Initialize default tab view upon launching an application
         * @param {sap.uxap.ObjectPageSection} oSection - Default section
         * @private
         */
        _initDefaultTabView: function (oSection, oResponse) {

            this._handleTabDataLoadSuccess(oSection, this.getViewMode(), oResponse);
        },

        /**
         * Sets tab data to the nested controller
         * @param {sap.uxap.ObjectPageSection} oSection - ObjectPageSection reference
         * @param {string} sViewMode - View mode
         * @param {Object} oResponse - Tab data response
         * @private
         * @returns {object} - Tab data response
         */
        _handleTabDataLoadSuccess: function (oSection, sViewMode, oResponse) {
            var sTabId = this.getLocalId(oSection);
            var aLoadedSections = [oSection];
            aLoadedSections = aLoadedSections.concat(this._getPrerequisiteTabsToLoad(sTabId));

            this.setViewMode(sViewMode);
            aLoadedSections.forEach(function (oLoadedSection) {
                var oTabView = this._getTabView(oLoadedSection),
                    oTabController = oTabView.getController();

                if (oTabController.setSectionInitialLoad) {
                    oTabController.setSectionInitialLoad(false);
                }

                // var aDependents = this._getDependentSectionsForTab(oTabView),
                //     mTabData = Utility.pick(oResponse, aDependents);

                if (oTabController.setTabData) {
                    oTabController.setTabData(oResponse);
                }
            }.bind(this));

            //Show Global Actions buttons
            this.getViewModel().setProperty("/IsGlobalActionsAvailable", true);
            this.setAppBusy(false);

            return oResponse;
        },

        /**
         * Handler for event data loading success
         * @param {Object} oBStudent - student data
         * @private
         */
        _bindViewToBStudent: function (oBStudent) {
            var oViewModel = this.getViewModel();
            oViewModel.setProperty("/BStudent", oBStudent);

            if (!oBStudent.ID) {
                var oODataModel = this.getComponentModel(),
                    sNewStudentIndicator = Utility.generateTemporaryId(
                        oODataModel, this.getBO().getHeaderSet(), "ID", 1
                    );

                oViewModel.setProperty("/BStudent/ID", sNewStudentIndicator);
            }

            this.fireAppEvent("BStudentHeaderChange", {
                BStudent: oBStudent
            });

            this.getView().bindObject({
                path: "/BStudent",
                model: "this"
            });
        },

        /**
         * Mark view model property "IsInitialLoadComplete" to true.
         * This property is used to control the visibility of global action button in
         * object page header.
         * @private
         */
        _initialLoadCompleted: function () {
            this.getViewModel().setProperty("/IsInitialLoadComplete", true);
        },

        /**
         * Get currently selected tab ID
         * @returns {string} Tab ID
         * @private
         */
        _getSelectedTabId: function () {
            return this.getLocalId(this.byId(this.getObjectPageLayout().getSelectedSection()));
        },

        /**
         * Get selected tab dependent sections
         * @returns {array} Array of sections
         * @private
         */
        _getSelectedTabDependentSections: function () {
            return this._getDependentSectionsForTab(
                this._getTabView(
                    this.byId(this._getSelectedTabId())
                ));
        },

        /**
         * Check whether the view is loaded for the first time
         * @param {sap.ui.core.mvc.View} oView - View to check
         * @returns {boolean} True if loaded for the first time
         * @private
         */
        _checkViewInitialLoad: function (oView) {
            var oTabController = oView.getController();
            // "SectionInitialLoad" is a legacy name. Should be "TabInitialLoad"
            return oTabController.getSectionInitialLoad ?
                oTabController.getSectionInitialLoad() : true;
        },

        /**
         * Get view for a tab control
         * @param {sap.uxap.ObjectPageSection} oSection ObjectPageSection control
         * @returns {sap.ui.core.mvc.View} Dependent view
         * @private
         */
        _getTabView: function (oSection) {
            return this.byId(oSection.data("viewId"));
        },

        /**
         * Convenience method to get configuration object of given Tab id
         * @param {string} sTabId Tab Id
         * @returns {object} - tab configuration object
         * @private
         */
        _getConfigForTab: function (sTabId) {
            return merge({}, Utility.getObjectWithAttr(
                aInitialTabConfigs, "Id", sTabId
            ));
        },

        /**
         * Convenience method to return array of dependent sections (navigation properties)
         * including sections of dependent tab sections
         * @param {sap.ui.core.mvc.View} oView Tab view reference
         * @returns {array} Array of sections
         * @private
         */
        _getDependentSectionsForTab: function (oView) {
            var aDependents = this._getDependentSectionsForTabSave(oView);
            var sTabId = oView.data("TabId");
            var oTabConfig = this._getConfigForTab(sTabId);

            if (oTabConfig.DependentTab.length > 0) {
                aDependents = oTabConfig.DependentTab.reduce(function (aTabs, oConfig) {
                    return oConfig.Sections.length > 0 ?
                        aTabs.concat(oConfig.Sections) : aTabs;
                }, aDependents);
            }

            return aDependents;
        },

        /**
         * Convenience method to return array of dependent sections (navigation properties)
         * of given tab which are valid for save payload creation
         * @param {sap.ui.core.mvc.View} oView Tab view reference
         * @returns {array} Array of sections
         * @private
         */
        _getDependentSectionsForTabSave: function (oView) {
            var sDependents = oView.data("Sections");
            return JSON.parse(sDependents);
        },

        /**
         * Convenience method to return array of dependent sections (navigation properties)
         * of unloaded prerequisite tabs for given tab.
         * @param {string} sTabId Tab id
         * @returns {array} Array of sections
         * @private
         */
        _getDependentSectionsOfPrerequisiteTabsToLoad: function (sTabId) {
            return this._getPrerequisiteTabsToLoad(sTabId).reduce(function (aDependents, oSection) {
                return aDependents.concat(this._getDependentSectionsForTab(this._getTabView(oSection)));
            }.bind(this), []);
        },

        /**
         * Convenience method to return array of Tabs which are not loaded
         * and prerequiste for the given tab.
         * @param {string} sTabId Tab Id
         * @returns {sap.uxap.ObjectPageSection[]} Array of sections
         * @private
         */
        _getPrerequisiteTabsToLoad: function (sTabId) {
            return [
                this.byId("NOTES")
            ];
        },

        /**
         * Convenience method to return array of dependent sections (navigation properties)
         * of prerequisite tabs for given tab.
         * @param {string} sTabId Tab id
         * @returns {array} Array of sections
         * @private
         */
        _getDependentSectionsOfPrerequisiteTabs: function (sTabId) {
            return this._getConfigForTab(sTabId).PrerequisiteTab.reduce(function (aDependents, oConfig) {
                return aDependents.concat(this._getDependentSectionsForTab(
                    this._getTabView(this.byId(oConfig.Id))
                ));
            }.bind(this), []);
        },

        /**
         * Validate dependent views
         * @returns {boolean} True if all views are valid
         * @private
         */
        _validateDependents: function () {
            var aDependentControllers = this.getDependentControllers();
            var aDeferredValidations = aDependentControllers.filter(function (oController) {
                return !oController.getSectionInitialLoad();
            }).map(function (oController) {
                var vValidityOutput = oController.validate();
                return typeof vValidityOutput === "boolean" ?
                    jQuery.Deferred().resolve(vValidityOutput) :
                    vValidityOutput;
            });

            return jQuery.when.apply(jQuery, aDeferredValidations)
                .then(function () {
                    var aValidationResults = jQuery.makeArray(arguments);
                    return aValidationResults.every(Boolean);
                });
        },

        /**
         * Check whether user did any changes to the business event
         * @returns {Boolean} True if changes exist
         * @private
         */
        _checkPendingChanges: function () {
            var aControllersToSave = this.getDependentControllers()
                .filter(function (oController) {
                    return !!oController.getDataForSave;
                });

            return !aControllersToSave.every(function (oController) {
                return oController.compareServerClientData();
            });
        },

        /**
         * Update already initialized Student
         * @private
         */
        _updateStudent: function () {
            this.setAppBusy(true);

            // Remove all messages except messages with flag validation=true
            this.getOwnerComponent().removeErrorMessages(false, true, true, true);

            var oDependentsData = this._getDependentsSaveData();

            this.getBO().save(oDependentsData)
                .then(function (oUpdatedStudent) {
                    MessageToast.show(this.i18n("saveActionSuccess"));
                    this.setAppBusy(false);
                    this.cancelEditingStudent();
                }.bind(this))
                .fail(function (oError) {
                    this.setAppBusy(false);
                    this.handleError(oError);
                }.bind(this));
        },

        /**
         * Get save data from dependent sections
         * @returns {Object} Data for save from dependent sections
         * @private
         */
        _getDependentsSaveData: function () {
            var aDependentControllers = this.getDependentControllers();
            var aControllersToSave = aDependentControllers
                .filter(function (oController) {
                    return !!oController.getDataForSave;
                });

            var aControllersData = aControllersToSave.map(function (oController) {
                if (oController.getView().data("TabId") === "PROFILE") {
                    return {Profile: oController.getDataForSave("StudentProfile")};
                } else if (oController.getView().data("TabId") === "NOTES") {
                    return {Notes: oController.getDataForSave("StudentNotes")};
                }
            }.bind(this));

            return aControllersData.reduce(function (oAccumulator, oNextData) {
                return merge(oAccumulator, oNextData);
            }, {});
        },

        _handleStudentUpdateSuccess: function (oUpdatedBStudent, aUpdatedSections, sNewViewMode) {
            sap.ushell.Container.setDirtyFlag(false);

            this._resetSectionInitialLoadFlag();
            this.setViewMode(sNewViewMode);

            var aDependentSections = this.getDependentSections();
            var oBStudentHeader = this.getBO().getBStudentHeader(oUpdatedBStudent, aDependentSections);

            this._bindViewToBStudent(oBStudentHeader);
            this._applyUpdatedBStudentToSections(oUpdatedBStudent, aUpdatedSections);
            this.setAppBusy(false);
        },

        /**
         * Apply data of updated business event to corresponding sections
         * @param {object} oUpdatedBStudent - Updated business event data
         * @param {string[]} aUpdatedSections - Ids of sections that were updated
         * @private
         */
        _applyUpdatedBStudentToSections: function (oUpdatedBStudent, aUpdatedSections) {
            var aUpdatedViews = this.getDependentViews().filter(function (oView) {
                return this._getDependentSectionsForTabSave(oView).some(function (sViewSection) {
                    return ~aUpdatedSections.indexOf(sViewSection);
                });
            }.bind(this));

            var oUpdatedSectionsData = Utility.pick(oUpdatedBStudent, aUpdatedSections);
            aUpdatedViews.forEach(function (oUpdatedView) {
                this._handleTabDataLoadSuccess(
                    this.byId(oUpdatedView.data("TabId")), this.getViewMode(), oUpdatedSectionsData
                );
            }, this);
        },

        /**
         * Function to handle switching to Display mode on Cancel press
         * @private
         */
        _cancelUserChanges: function () {
            //Clear AttachmentGenerated messages which can exist after attachments upload
            this.getOwnerComponent().removeErrorMessages(false, false, false, true);
            this.cancelEditingStudent();
            // Reset Dirty flag on cancel
            sap.ushell.Container.setDirtyFlag(false);
        }
    });
});
