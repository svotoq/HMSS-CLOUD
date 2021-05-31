sap.ui.define(["sap/ui/core/Control", "sap/m/VBox", "sap/m/Label", "sap/m/Text"], function(
    Control,
    VBox,
    Label,
    Text
  ) {
    "use strict";
  
    return Control.extend("bstu.hmss.lib.control.facet.AddressFacet", {
      metadata: {
        properties: {
          label: { type: "string", defaultValue: "" },
          address: { type: "string", defaultValue: "" }
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
        oLabel.addStyleClass("sapUiTinyMarginBottom");
        var oText = new Text();
        var oBox = new VBox({
          items: [oLabel, oText]
        });
        oBox.addStyleClass("sapIdpOmssLibAddressFacet");
        this.setAggregation("_box", oBox);
      },
  
      _getLabel: function() {
        return this.getAggregation("_box").getItems()[0];
      },
  
      _getText: function() {
        return this.getAggregation("_box").getItems()[1];
      },
  
      setLabel: function(sValue) {
        this._getLabel().setText(sValue);
      },
  
      setAddress: function(sValue) {
        this._getText().setText(sValue);
      },
  
      getLabel: function() {
        return this._getLabel().getText();
      },
  
      getAddress: function() {
        return this._getText().getText();
      },
  
      renderer: function(oRM, oControl) {
        var oLayout = oControl.getAggregation("_box");
        oRM.renderControl(oLayout);
      }
    });
  });
