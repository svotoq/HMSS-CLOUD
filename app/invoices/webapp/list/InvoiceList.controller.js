/*global location history */
sap.ui.define([
    "bstu/hmss/lib/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/comp/state/UIState",
    "sap/ui/generic/app/navigation/service/NavigationHandler",
    "sap/ui/generic/app/navigation/service/SelectionVariant",
    "sap/base/util/merge",
    "./InvoiceListBO",
    "bstu/hmss/lib/fragments/createInvoice/CreateInvoiceSub",
    "bstu/hmss/lib/util/Utility",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, UIState, NavigationHandler, SelectionVariant, merge,
             InvoiceListBO, CreateInvoiceSub, Utility, MessageBox) {
    "use strict";

    return BaseController.extend("bstu.hmss.manageinvoices.list.InvoiceList",
        merge({

            formatter: formatter,
            bOnInitFinished: false,
            bFilterBarInitialized: false,

            /* =========================================================== */
            /* lifecycle methods                                           */
            /* =========================================================== */

            /**
             * Called when the InvoiceList controller is instantiated.
             * @public
             */
            onInit: function () {
                BaseController.prototype.onInit.apply(this, arguments);

                this.oSmartFilterBar = this.byId("idInvoiceListFilterBar");
                this.oSmartTable = this.byId("idInvoiceListSmartTable");

                this.setModel(new JSONModel({}), "this");

                // Set named OData model as default model for this view
                this.setModel(this.getComponentModel());

                this.oNavigationHandler = new NavigationHandler(this);
                this.getOwnerComponent().initializeMessagePopover(
                    this.getView(), this.getMessageIndicatorButton()
                );
                this.getRouter().getRoute("invoicelist").attachPatternMatched(this._onPatternMatchedInvoiceList, this);
                this.getRouter().getRoute("localstate").attachPatternMatched(this._onPatternMatchedInvoiceList, this);

                this.bOnInitFinished = true;
                this.initAppState();

                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                }
            },

            /**
             * Event handler when 'Create Order' button gets pressed
             * @public
             * @param {sap.ui.base.Event} oEvent - application event
             */
            onPressOpenInvoice: function () {
                var sInvoiceNumber = this.getViewModel().getProperty("/SelectedInvoiceInvoiceNumber");

                var oOutbound = this.getOwnerComponent().getManifestEntry("/sap.app/crossNavigation/outbounds/displayInvoice");
                this.oCrossAppNavigator.toExternal({
                    target: oOutbound,
                    params: {"InvoiceNumber": sInvoiceNumber}
                });
            },

            /**
             * Event handler when a navigation icon gets pressed
             * @public
             * @param {sap.ui.base.Event} oEvent - press event
             */
            onInvoiceDetailPress: function (oEvent) {
                var oBindingContext = oEvent.getSource().getBindingContext(),
                    sID = oBindingContext.getProperty("ID");
                this.navigateToInvoiceDetails(sID);
            },

            /**
             * Navigates to Invoice details
             * @param {string} sID - Invoice Number
             * @private
             */
            navigateToInvoiceDetails: function (sID) {
                this.setAppBusy(true);
                this.getRouter().navTo("invoicedetail", {
                    ID: sID
                });
            },

            /**
             * Show create invoice dialog
             */
            onCreateInvoicePress: function () {
                this.openCreateInvoiceDialog();
            },

            saveNewInvoice: function (oNewInvoice) {
                return this.getBO().createInvoice(oNewInvoice)
                    .then(function (oInvoice) {
                        this.navigateToInvoiceDetails(oInvoice.ID);
                        return oInvoice;
                    }.bind(this));
            },


            /**
             * Sets index of the selected customer
             * @param {sap.ui.base.Event} oEvent - rowSelectionChange event
             */
            onRowSelectionChangeInvoice: function (oEvent) {
                var iSelectedIndex = oEvent.getSource().getSelectedIndex();
                this.getViewModel().setProperty("/InvoiceListSelectedIndex", iSelectedIndex);
                var sInvoiceNumber = "";
                if (iSelectedIndex > -1) {
                    var oContext = this.byId("idInvoiceListTable").getContextByIndex(iSelectedIndex);
                    sInvoiceNumber = oContext.getProperty("Invoice_InvoiceNumber");
                }

                this.getViewModel().setProperty("/SelectedInvoiceInvoiceNumber", sInvoiceNumber);
            },

            /**
             * Handler for assignedFiltersChanged event. It updates filter text to be shown when
             * user collapses the header area of dynamic page.
             * @param {sap.ui.base.Event} oEvent Event object for assignedFiltersChanged event of smart filter bar
             */
            onAssignedFiltersChanged: function (oEvent) {
                this.byId("idFilterText").setText(this.oSmartFilterBar.retrieveFiltersWithValuesAsText());
            },

            /**
             * Handle Messages button press
             * @public
             */
            onMessagesButtonPress: function () {
                this.showMessagePopover(this.getMessageIndicatorButton());
            },

            /**
             * Handler for beforeRebindTable event. It calls this handler before
             * data binding with smart table.It is used to display backend's validation and error
             * messages in message popover.
             * @param {sap.ui.base.Event} oEvent Event object for beforeRebindTable event of smart table
             */
            onBeforeRebindTable: function (oEvent) {
                var oInvoiceFilters = this.getViewModel().getProperty("/InvoiceFilters");
                var oBindingParam = oEvent.getParameter("bindingParams");

                oBindingParam.filters = Utility.mergeCustomFilters(oInvoiceFilters, oBindingParam.filters);
                oBindingParam.events = {
                    dataReceived: this.onDataReceivedTable.bind(this)
                };
            },

            /**
             * This is called method from onBeforeRebindTable event handler
             * @param {sap.ui.base.Event} oEvent  - data received event
             */
            onDataReceivedTable: function (oEvent) {
                if (typeof oEvent.getParameter("data") === "undefined") {
                    this.showMessagePopover(this.getMessageIndicatorButton());
                }
            },

            /**
             * Event handler for initialise event of smart filter bar
             * @param {sap.ui.base.Event} oEvent - event object
             */
            onInitSmartFilterBar: function (oEvent) {
                this.bFilterBarInitialized = true;
                this.initAppState();
            },

            /**
             * Event handler for search event of smart filter bar
             */
            onSearch: function () {
                // write inner app state
                this.storeCurrentAppState();
            },

            /**
             * Inits app state
             */
            initAppState: function () {
                // check if both init events for the controller and the SmartFilterBar have finished
                if (!(this.bFilterBarInitialized && this.bOnInitFinished)) {
                    return;
                }

                var oParseNavigationPromise = this.oNavigationHandler.parseNavigation();

                oParseNavigationPromise.done(this.restoreInitAppState.bind(this));
                oParseNavigationPromise.fail(function (oError) {
                    this._handleError(oError);
                }.bind(this));
            },

            /**
             * Method to restore the app state on first load of application
             * @param {object} oAppData - app data object
             * @param {object} oURLParameters - url params object
             * @param {sap.ui.generic.app.navigation.service.NavType} sNavType - navigation type
             */
            restoreInitAppState: function (oAppData, oURLParameters, sNavType) {
                if (sNavType !== sap.ui.generic.app.navigation.service.NavType.initial) {
                    var bHasOnlyDefaults = oAppData && oAppData.bNavSelVarHasDefaultsOnly;
                    var oSelectionVariant = new SelectionVariant(oAppData.selectionVariant);
                    var aSelectionVariantProperties = oSelectionVariant.getParameterNames().concat(oSelectionVariant.getSelectOptionsPropertyNames());
                    var mUIStateProperties = {
                        replace: true,
                        strictMode: false
                    };
                    var oUiState = new UIState({
                        selectionVariant: JSON.parse(oAppData.selectionVariant)//,
                        //valueTexts: oAppData.valueTexts
                    });
                    for (var i = 0; i < aSelectionVariantProperties.length; i++) {
                        this.oSmartFilterBar.addFieldToAdvancedArea(aSelectionVariantProperties[i]);
                    }
                    if (!bHasOnlyDefaults || this.oSmartFilterBar.getCurrentVariantId() === "") {
                        this.oSmartFilterBar.clearVariantSelection();
                        this.oSmartFilterBar.clear();
                        this.oSmartFilterBar.setUiState(oUiState, mUIStateProperties);
                    }
                    if (oAppData.tableVariantId) {
                        this.oSmartTable.setCurrentVariantId(oAppData.tableVariantId);
                    }
                    this.restoreCustomAppStateData(oAppData.customData);
                    if (!bHasOnlyDefaults) {
                        this.oSmartFilterBar.search();
                    }
                }
            },

            /**
             * @returns {object} the current app state consisting of the selection variant,
             * the table variant and additional custom data
             */
            getCurrentAppState: function () {
                var oSelectionVariant = new SelectionVariant(JSON.stringify(this.oSmartFilterBar.getUiState().getSelectionVariant()));
                return {
                    selectionVariant: oSelectionVariant.toJSONString(),
                    tableVariantId: this.oSmartTable.getCurrentVariantId(),
                    customData: this.getCustomAppStateData()//,
                    //valueTexts: this.oSmartFilterBar.getUiState().getValueTexts()
                };
            },

            /**
             * @returns {object} an object of additional custom fields defining the app state
             * (apart from the selection variant and the table variant)
             */
            getCustomAppStateData: function () {
                return {
                    // add custom data for back navigation if necessary
                };
            },

            /**
             * Restores the custom data of the app state
             * @param {object} oCustomData - custom data
             */
            restoreCustomAppStateData: function (oCustomData) {
                // perform custom logic for restoring the custom data of the app state
            },

            /**
             * Changes the URL according to the current app state and stores the app state for later retrieval.
             * @returns {jQuery.Deferred} Deferred saving app state
             */
            storeCurrentAppState: function () {
                var oAppStatePromise = this.oNavigationHandler.storeInnerAppState(this.getCurrentAppState());
                oAppStatePromise.done(function (sAppStateKey) {
                    //your inner app state is saved now; sAppStateKey was added to URL
                    //perform actions that must run after save
                });
                oAppStatePromise.fail(function (oError) {
                    this._handleError(oError);
                }.bind(this));
                return oAppStatePromise;
            },

            /**
             * This is called method. It returns the message popover button id
             * @returns {sap.m.Button} - message popover button
             */
            getMessageIndicatorButton: function () {
                return this.byId("idMessagePopoverButton");
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
             * Gets InvoiceListBO instance
             * @returns {bstu.hmss.manageinvoices.list.InvoiceListBO} BO instance
             * @public
             */
            getBO: function () {
                var oInvoiceListBO = new InvoiceListBO({
                    component: this.getOwnerComponent(),
                    odataModel: this.getModel(),
                    viewModel: this.getViewModel()
                });

                this.getBO = function () {
                    return oInvoiceListBO;
                };
                return oInvoiceListBO;
            },

            /**
             * Event handler for pattern matched event of router
             */
            _onPatternMatchedInvoiceList: function () {
                this._initThisModel();
            },

            /**
             * Reset's the content of view model with initial values
             */
            _initThisModel: function () {
                this.getViewModel().setProperty("/", {
                    CreateInvoiceDialog: {},
                    InvoiceListSelectedIndex: -1,
                    SelectedInvoiceInvoiceNumber: "",
                    InvoiceFilters: {}
                });
            },

            /**
             * Handles errors from BE
             * @param {object} oError - error data object
             */
            _handleError: function (oError) {
                // Implement an appropriate error handling
            }
        }, CreateInvoiceSub));
});
