/* eslint-disable max-params */
sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "./RoomDetailBO",
    "../Configuration",
    "bstu/hmss/lib/util/Utility",
    "bstu/hmss/lib/util/Constants",
    "bstu/hmss/managerooms/model/formatter",
    "sap/base/util/merge",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, RoomDetailBO, aInitialTabConfigs, Utility,
             Constants, formatter, merge, MessageBox, MessageToast) {
    /* eslint-enable max-params */
    "use strict";

    /**
     * Array with tab IDs
     * @private
     */
    var _aSectionIds = [
        "ROOMINFO",
        "ROOMSTUDENTS",
    ];

    /**
     * Is navTo called only to change tab
     * @private
     */
    var _bTabChanged = false;

    return BaseController.extend("bstu.hmss.managerooms.object.RoomDetail", {

        formatter: formatter,

        /**
         * Called when the RoomDetail controller is instantiated.
         * @public
         */
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);

            this.getOwnerComponent().initializeMessagePopover(
                this.getView(), this.getMessageIndicatorButton()
            );
            this.setModel(new JSONModel({}), "this");
            this.getRouter().getRoute("roomdetail").attachPatternMatched(this._onPatternMatchedRoomDetail, this);
        },

        /**
         * Event handler when 'Create Order' button gets pressed
         * @public
         * @param {sap.ui.base.Event} oEvent - application event
         */
        onPressCreateOrder: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("this");
            var sRoomNumber = oContext.getProperty("RoomNumber");
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
            this.getRouter().navTo("roomdetail", {
                RoomNumber: this.getBO().getRoomNumber(),
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
         * Event handler for 'edit' Room details
         * Sets the current tab as already open
         */
        onPressEdit: function () {
            this._resetSectionInitialLoadFlag();
            this.getOwnerComponent().removeAllMessages();
            this.setAppBusy(true);

            this.loadTabData(Constants.VIEW_MODES.EDIT)
                .then(function(oResponse) {
                    var aDependentSections = this._getSelectedTabDependentSections();
                    var aPrerequisiteSections = this._getDependentSectionsOfPrerequisiteTabs(this._getSelectedTabId());
                    var oBRoomHeader = this.getBO().getBRoomHeader(oResponse, aDependentSections.concat(aPrerequisiteSections));
                    this._bindViewToBRoom(oBRoomHeader);
                    this.setAppBusy(false);
                }.bind(this))
                .fail(function(oError) {
                    this.setAppBusy(false);
                }.bind(this));
        },

        /**
         * Event handler for 'save' edited Room details
         */
        onPressSave: function () {
            this.validate().then(function (bValidData) {
                if (bValidData && this._checkPendingChanges()) {
                    this._updateRoom();
                } else if (bValidData) {
                    MessageBox.show(this.i18n("saveNothing"));
                }
            }.bind(this));
        },

        /**
         * Event handler for 'cancel' editing Room details
         */
        onPressCancel: function () {
            if (this._checkPendingChanges()) {
                MessageBox.confirm(this.i18n("cancelActionText"), {
                    title: this.i18n("confirmActionTitle"),
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
            var oDependentTabSectionData = oDependentData || {};
            var oTabView = this._getTabView(oSection);
            var aDependents = this._getDependentSectionsForTab(oTabView);
            var aPrerequisiteSections = this._getDependentSectionsOfPrerequisiteTabsToLoad(this.getLocalId(oSection));

            this.setAppBusy(true);

            return this.getBO()
                .loadTabData(sNewViewMode,
                    aDependents,
                    aPrerequisiteSections,
                    oDependentTabSectionData)
                .then(this._handleTabDataLoadSuccess.bind(this, oSection, sNewViewMode))
                .fail(this._handleTabDataLoadError.bind(this));
        },

        /**
         * Convenience method to get RoomDetail BO instance
         * @returns {bstu.hmss.managerooms.object.RoomDetailBO} BO instance
         * @public
         */
        getBO: function () {
            var oRoomDetailBO = new RoomDetailBO({
                component: this.getOwnerComponent(),
                odataModel: this.getComponentModel(),
                viewModel: this.getViewModel()
            });

            this.getBO = function () {
                return oRoomDetailBO;
            };

            return oRoomDetailBO;
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
            return aInitialTabConfigs
                .map(function (oTabConfig) {
                    return this.byId(oTabConfig.Id);
                }, this)
                .filter(Boolean)
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
            this.getObjectPageLayout().setSelectedSection(this.getRoomInfoSection());
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
            var oObjectPageLayout = this.byId("idRoomDetailPage");

            this.getObjectPageLayout = function () {
                return oObjectPageLayout;
            };

            return oObjectPageLayout;
        },

        /**
         * Returns instance of room profile section
         * @returns {sap.uxap.ObjectPageSection} Room profile section instance
         * @public
         */
        getRoomInfoSection: function () {
            return this.byId("ROOMINFO");
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
         * Cancel editing existing room: reset all changes and enter display mode
         * @public
         */
        cancelEditingRoom: function () {
            this.getOwnerComponent().removeAllMessages();

            this._resetSectionInitialLoadFlag();
            this._removeDependentsData();
            this.loadTabData(Constants.VIEW_MODES.DISPLAY)
                .then(function (oResponse) {
                    var aDependentSections = this._getSelectedTabDependentSections();
                    var oBRoomHeader = this.getBO().getBRoomHeader(oResponse, aDependentSections);
                    this._bindViewToBRoom(oBRoomHeader);
                }.bind(this));
        },

        /**
         * Handler fired when the current URL hash matches the pattern of the route
         * @param {sap.ui.base.Event} oEvent - route matched event
         * @private
         */
        _onPatternMatchedRoomDetail: function (oEvent) {
            if (_bTabChanged) {
                _bTabChanged = false;
                return;
            }

            var mArguments = oEvent.getParameter("arguments");
            var sRoomNumber = mArguments.RoomNumber;
            var oQuery = mArguments["?query"];
            var sSectionId = oQuery && _aSectionIds[oQuery.sectionIndex];

            this._initThisModel();
            this.setDefaultSectionSelected();
            this.loadMetaModelDeferred().then(function () {
                this.setAppBusy(true);
                this.setViewMode(Constants.VIEW_MODES.DISPLAY);
                this.getBO().setRoomNumber(sRoomNumber);
                this._resetSectionInitialLoadFlag();
                this._removeDependentsData();
                this.getOwnerComponent().removeAllMessages();
                this._loadExistingRoom().then(function () {
                    //First, you need to load the room's header and profile,
                    //and only then recently opened tab
                    if (sSectionId) {
                        var oSection = this.byId(sSectionId);
                        this.getObjectPageLayout().setSelectedSection(oSection);
                        this.setSectionData(oSection);
                    }
                }.bind(this));
            }.bind(this));

            this.fireAppEvent("displayRoom", {
                RoomNumber: sRoomNumber
            });
        },

        /**
         * Initialize view model "this"
         * @private
         */
        _initThisModel: function () {
            this.getViewModel().setProperty("/", {
                ObjectHeaderEntitySet: "Rooms",
                IsInitialLoadComplete: false,
                IsGlobalActionsAvailable: true,
                BRoom: {},
                CurrViewMode: Constants.VIEW_MODES.DISPLAY,
                ObjectHeaderEntityKey: {
                    RoomNumber: ""
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
         * Initialize application in Existing Room mode
         * @private
         */
        _loadExistingRoom: function () {
            var aPrerequisiteSections = this._getDependentSectionsOfPrerequisiteTabsToLoad(this._getSelectedTabId());
            var aDependentSections = this._getSelectedTabDependentSections();
            return this.getBO()
                .loadExistingRoom(aDependentSections, aPrerequisiteSections)
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
         * Handler for successful room initial load
         * @param {Object} oResponse - UIConfig call response
         * @param {Object[]} oResponse.config - List of section UIConfigs
         * @param {Object[]} oResponse.header - Event Header data
         * @private
         */
        _handleInitCallSuccess: function (oResponse) {
            var oViewModel = this.getViewModel();
            oViewModel.setProperty("/defaultData", oResponse.defaultData);

            this._bindViewToBRoom(oResponse.header);
            this.setAppBusy(false);
            this._initDefaultTabView(this.byId(this._getSelectedTabId()));
        },

        /**
         * Initialize default tab view upon launching an application
         * @param {sap.uxap.ObjectPageSection} oSection - Default section
         * @private
         */
        _initDefaultTabView: function (oSection) {
            var oViewModel = this.getViewModel(),
                oDefaultData = oViewModel.getProperty("/defaultData");
            oViewModel.setProperty("/defaultData", null);

            this._handleTabDataLoadSuccess(oSection, this.getViewMode(), oDefaultData);
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

                var aDependents = this._getDependentSectionsForTab(oTabView),
                    mTabData = Utility.pick(oResponse, aDependents);

                if (oTabController.setTabData) {
                    if (sTabId === "ROOMINFO") {
                        oTabController.setTabData(oResponse);
                    } else {
                        oTabController.setTabData(mTabData);
                    }
                }
            }.bind(this));

            //Show Global Actions buttons
            this.getViewModel().setProperty("/IsGlobalActionsAvailable", true);
            this.setAppBusy(false);

            return oResponse;
        },

        /**
         * Handler for event data loading success
         * @param {Object} oBRoom - room data
         * @private
         */
        _bindViewToBRoom: function (oBRoom) {
            var oViewModel = this.getViewModel();
            oViewModel.setProperty("/BRoom", oBRoom);

            if (!oBRoom.RoomNumber) {
                var oODataModel = this.getComponentModel(),
                    sNewRoomIndicator = Utility.generateTemporaryId(
                        oODataModel, this.getBO().getHeaderSet(), "RoomNumber", 1
                    );

                oViewModel.setProperty("/BRoom/RoomNumber", sNewRoomIndicator);
            }

            this.fireAppEvent("BRoomHeaderChange", {
                BRoom: oBRoom
            });

            this.getView().bindObject({
                path: "/BRoom",
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
            return this._getConfigForTab(sTabId).PrerequisiteTab.reduce(function (arr, oConfig) {
                var oSection = this.byId(oConfig.Id);
                var oTabView = this._getTabView(oSection);
                if (this._checkViewInitialLoad(oTabView)) {
                    arr.push(oSection);
                }
                return arr;
            }.bind(this), []);
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
         * Update already initialized Room
         * @private
         */
        _updateRoom: function () {
            this.setAppBusy(true);

            // Remove all messages except messages with flag validation=true
            this.getOwnerComponent().removeErrorMessages(false, true, true, true);

            var oDependentsData = this._getDependentsSaveData();

            this.getBO().save(oDependentsData)
                .then(function (oUpdatedRoom) {
                    var aUpdatedSections = Object.keys(oDependentsData);

                    this.getBO().setRoomNumber(oUpdatedRoom.RoomNumber);
                    this._handleRoomUpdateSuccess(oUpdatedRoom, aUpdatedSections, Constants.VIEW_MODES.DISPLAY);
                    MessageToast.show(this.i18n("saveActionSuccess"));
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
                var aDependentSections = this._getDependentSectionsForTabSave(oController.getView());
                if (oController.getView().data("TabId") === "ROOMINFO") {
                    aDependentSections = ["RoomInfo"];
                }
                return aDependentSections.reduce(function (oAccumulator, sSection) {

                    if (!oController.getSectionInitialLoad()) {
                        oAccumulator[sSection] = oController.getDataForSave(sSection);
                    }

                    return oAccumulator;
                }, {});
            }.bind(this));

            return aControllersData.reduce(function (oAccumulator, oNextData) {
                return merge(oAccumulator, oNextData);
            }, {});
        },

        _handleRoomUpdateSuccess: function (oUpdatedBRoom, aUpdatedSections, sNewViewMode) {
            sap.ushell.Container.setDirtyFlag(false);

            this._resetSectionInitialLoadFlag();
            this.setViewMode(sNewViewMode);

            var aDependentSections = this.getDependentSections();
            var oBRoomHeader = this.getBO().getBRoomHeader(oUpdatedBRoom, aDependentSections);

            this._bindViewToBRoom(oBRoomHeader);
            this._applyUpdatedBRoomToSections(oUpdatedBRoom, aUpdatedSections);
            this.setAppBusy(false);
        },

        /**
         * Apply data of updated business event to corresponding sections
         * @param {object} oUpdatedBRoom - Updated business event data
         * @param {string[]} aUpdatedSections - Ids of sections that were updated
         * @private
         */
        _applyUpdatedBRoomToSections: function (oUpdatedBRoom, aUpdatedSections) {
            var aUpdatedViews = this.getDependentViews().filter(function (oView) {
                return this._getDependentSectionsForTabSave(oView).some(function (sViewSection) {
                    return ~aUpdatedSections.indexOf(sViewSection);
                });
            }.bind(this));

            var oUpdatedSectionsData = Utility.pick(oUpdatedBRoom, aUpdatedSections);
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
            this.cancelEditingRoom();
            // Reset Dirty flag on cancel
            sap.ushell.Container.setDirtyFlag(false);
        }
    });
});
