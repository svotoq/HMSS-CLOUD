sap.ui.define(["sap/ui/core/Control", "sap/m/VBox", "sap/m/Label", "sap/m/ObjectStatus"], function(
  Control,
  VBox,
  Label,
  ObjectStatus
) {
  "use strict";

  return Control.extend("bstu.hmss.lib.control.facet.StatusFacet", {
    metadata: {
      properties: {
        label: { type: "string", defaultValue: "" },
        text: { type: "string", defaultValue: "" },
        icon: { type: "string", defaultValue: "" },
        state: { type: "string", defaultValue: "None" },
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
      oLabel.addStyleClass("sapUiTinyMarginEnd sapUiTinyMarginBottom");
      var oStatus = new ObjectStatus({ state: "None", icon: "" });
      var oBox = new VBox({
        items: [oLabel, oStatus]
      });
      oBox.addStyleClass("sapIdpOmssLibStatusFacet");
      this.setAggregation("_box", oBox);
    },

    _getLabel: function() {
      var oBox = this.getAggregation("_box");
      return oBox.getItems()[0];
    },

    _getStatus: function() {
      var oBox = this.getAggregation("_box");
      return oBox.getItems()[1];
    },

    setLabel: function(sValue) {
      this._getLabel().setText(sValue);
    },

    setText: function(sValue) {
      this._getStatus().setText(sValue);
    },

    setIcon: function(sValue) {
      this._getStatus().setIcon(sValue);
    },

    setState: function(sValue) {
      this._getStatus().setState(sValue);
    },

    setVisible: function(bValue) {
      var oBox = this.getAggregation("_box");
      oBox.setVisible(bValue);
    },

    getLabel: function() {
      return this._getLabel().getText();
    },

    getText: function() {
      return this._getStatus().getText();
    },

    getIcon: function() {
      return this._getStatus().getIcon();
    },

    getState: function() {
      return this._getStatus().getState();
    },

    isVisible: function() {
      var oBox = this.getAggregation("_box");
      return oBox.isVisible();
    },

    setDataPoint: function(bValue) {
      if (typeof bValue !== "undefined") {
        this._getStatus().toggleStyleClass("sapMObjectStatusLarge", bValue);
      }
      this.setProperty("dataPoint", bValue);
      return this;
    },

    isDataPoint: function() {
      return this.getProperty("dataPoint");
    },

    renderer: function(oRM, oControl) {
      // i just found no easier or more public way to pass the style classes
      // (i overwrote addStyleClass but it was called only once for the template of an aggregation)
      var oBox = oControl.getAggregation("_box");
      // render
      oRM.renderControl(oBox);
    }
  });
});
