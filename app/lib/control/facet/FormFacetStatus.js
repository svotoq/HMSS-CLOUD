sap.ui.define(["sap/ui/core/Control", "sap/m/HBox", "sap/m/Label", "sap/m/ObjectStatus"], function(
  Control,
  HBox,
  Label,
  ObjectStatus
) {
  "use strict";

  return Control.extend("bstu.hmss.lib.control.facet.FormFacetStatus", {
    metadata: {
      properties: {
        label: { type: "string", defaultValue: "" },
        text: { type: "string", defaultValue: "" },
        state: { type: "string", defaultValue: "None" },
        icon: { type: "string", defaultValue: "" }
      },
      aggregations: {
        _box: {
          type: "sap.ui.core.Control", // there were sporadic errors in UI5 1.52 with a more concrete type
          multiple: false,
          visibility: "hidden"
        }
      },
      events: {}
    },

    init: function() {
      var oBox = new HBox({
        items: [
            new Label({}),
            new ObjectStatus({})
        ]
      }).addStyleClass("sapIdpOmssLibFormFacetField");
      this.setAggregation("_box", oBox);
    },

    _getLabel: function() {
      return this.getAggregation("_box").getItems()[0];
    },

	_getObjectStatus: function() {
      return this.getAggregation("_box").getItems()[1];
    },

    getLabel: function() {
      return this._getLabel().getText();
    },

    setLabel: function(sValue) {
      this._getLabel().setText(sValue);
    },

    getText: function() {
      return this._getObjectStatus().getText();
    },

    setText: function(sValue) {
      this._getObjectStatus().setText(sValue);
    },

    getState: function() {
        return this._getObjectStatus().getState();
    },

    setState: function(sValue) {
        this._getObjectStatus().setState(sValue);
    },

    getIcon: function() {
        return this._getObjectStatus().getIcon();
    },

    setIcon: function(sValue) {
        this._getObjectStatus().setIcon(sValue);
    },

    renderer: function(oRM, oControl) {
      var oLayout = oControl.getAggregation("_box");
      oRM.renderControl(oLayout);
    }
  });
});
