sap.ui.define(["sap/ui/core/Control", "sap/m/VBox", "sap/m/Label", "sap/m/ObjectNumber"], function(
  Control,
  VBox,
  Label,
  ObjectNumber
) {
  "use strict";

  return Control.extend("bstu.hmss.lib.control.facet.NumberFacet", {
    metadata: {
      properties: {
        label: { type: "string", defaultValue: "" },
        number: { type: "string", defaultValue: "" },
        unit: { type: "string", defaultValue: "" },
        dataPoint: { type: "boolean", defaultValue: false},
        visible: { type: "boolean", defaultValue: true }
      },
      aggregations: {
        _box: {
          type: "sap.ui.core.Control",
          multiple: false,
          visibility: "hidden"
        }
      },
      events: {}
    },

    init: function() {
      var oLabel = new Label();
      var oNumber = new ObjectNumber({ number: "", unit: "" });
      var oBox = new VBox({
        items: [oLabel, oNumber]
      });
      oLabel.addStyleClass("sapUiTinyMarginEnd sapUiTinyMarginBottom");
      oBox.addStyleClass("sapIdpOmssLibNumberFacet");
      this.setAggregation("_box", oBox);
    },

    _getLabel: function() {
      return this.getAggregation("_box").getItems()[0];
    },

    _getNumber: function() {
      return this.getAggregation("_box").getItems()[1];
    },

    setLabel: function(sValue) {
      this._getLabel().setText(sValue);
    },

    setNumber: function(sValue) {
      this._getNumber().setNumber(sValue);
    },

    setUnit: function(sValue) {
      this._getNumber().setUnit(sValue);
    },

    setVisible: function(bValue) {
      var oBox = this.getAggregation("_box");
      oBox.setVisible(bValue);
    },

    getLabel: function() {
      return this._getLabel().getText();
    },

    getNumber: function() {
      return this._getNumber().getNumber();
    },

    getUnit: function() {
      return this._getNumber().getUnit();
    },

    isVisible: function() {
      var oBox = this.getAggregation("_box");
      return oBox.isVisible();
    },

    setDataPoint: function(bValue) {
      if (typeof bValue !== "undefined") {
        this._getNumber().toggleStyleClass("sapMObjectNumberLarge", bValue);
      }
      this.setProperty("dataPoint", bValue);
      return this;
    },

    isDataPoint: function() {
      return this.getProperty("dataPoint");
    },

    renderer: function(oRM, oControl) {
      var oLayout = oControl.getAggregation("_box");
      oRM.renderControl(oLayout);
    }
  });
});
