/* eslint-disable max-params */
sap.ui.define([
    "sap/ui/core/Fragment",
    "bstu/hmss/lib/util/Constants",
    "sap/m/MessageBox"
], function (Fragment, Constants, MessageBox) {
    /* eslint-enable max-params */
    "use strict";
    return {

        showSelectRoomDialog: function () {
            this.getCreateStudentDialog().setBusy(true);

            if (!this._oSelectRoomDialog) {
                var oView = this.getView();

                this._oSelectRoomDialog = Fragment.load({
                    id: oView.getId(),
                    name: "bstu.hmss.lib.fragments.createStudent.SelectRoomDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this._oSelectRoomDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onBeforeOpenSelectRoomDialogDialog: function () {
            // var oDialog = this._getSelectRoomDialog();
            // oDialog.setBusy(true);
            // oDialog.getModel().attachEventOnce("requestCompleted", function () {
            //     oDialog.setBusy(false);
            // });
        },

        onAfterOpenSelectRoomDialogDialog: function () {
            this.getCreateStudentDialog().setBusy(false);
        },

        /**
         * Event handler for 'afterClose' of create student dialog
         */
        onAfterCloseSelectRoomDialogDialog: function () {
            this._getSelectRoomDialog().destroy();
            this._oSelectRoomDialog = null;
        },

        onSelectRoomDialogSelect: function (oEvent) {
            var oRoom = oEvent.getSource().getBindingContext().getObject();
            if (oRoom.EmptyPlaces < 1) {
                MessageBox.error(this.i18n("MessageBox.RoomIsFull"));
                return;
            }
            this.getCreateStudentDialogModel().setProperty("/NewStudent/Room_RoomNumber", oRoom.RoomNumber);
            this._getSelectRoomDialog().close();
        },

        onSelectRoomProceedWithoutRoom: function() {
            this.getCreateStudentDialogModel().setProperty("/NewStudent/Room_RoomNumber", "");
            this._getSelectRoomDialog().close();
        },
        
        /**
         * Close create student dialog
         */
        onSelectRoomDialogCancel: function () {
            this._getSelectRoomDialog().close();
        },

        onSelectRoomAssignedFiltersChanged: function () {

        },

        /**
         * Handler for beforeRebindTable event. It calls this handler before
         * data binding with smart table.It is used to display backend's validation and error
         * messages in message popover.
         * @param {sap.ui.base.Event} oEvent Event object for beforeRebindTable event of smart table
         */
        onBeforeRebindSelectRoomTable: function (oEvent) {
            // var oRoomFilters = this.getViewModel().getProperty("/RoomFilters");
            var oBindingParam = oEvent.getParameter("bindingParams");

            // oBindingParam.filters = Utility.mergeCustomFilters(oRoomFilters, oBindingParam.filters);
            oBindingParam.events = {
                dataReceived: this.onDataReceivedTable.bind(this)
            };
        },

        /**
         * This is called method from onBeforeRebindTable event handler
         * @param {sap.ui.base.Event} oEvent  - data received event
         */
        onDataReceivedSelectRoomTable: function (oEvent) {
            if (typeof oEvent.getParameter("data") === "undefined") {
                this._showSelectRoomMessagePopover();
            }
        },

        /**
         * Convenience method to get Create AddStudents dialog control
         * @returns {sap.m.Dialog} AddStudents dialog
         * @private
         */
        _getSelectRoomDialog: function () {
            return this.byId("idSelectRoomDialogDialog");
        },

        /**
         * Show create customer message popover
         * @private
         */
        _showSelectRoomMessagePopover: function () {
            this.showMessagePopover(this.byId("idSelectRoomDialogMessagePopover"));
        },

        onPressShowSelectRoomMessagePopover: function () {
            this._showSelectRoomMessagePopover();
        }
    };
});
