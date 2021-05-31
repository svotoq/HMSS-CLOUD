sap.ui.define(["sap/ui/core/Control", "sap/m/HBox", "sap/m/Label", "sap/m/CheckBox"], function(
  Control,
  HBox,
  Label,
  CheckBox
) {
  "use strict";

  return Control.extend("bstu.hmss.lib.control.facet.FormFacetCheckBox", {
    metadata: {
      properties: {
        label: { type: "string", defaultValue: "" },
        selected: { type: "boolean", defaultValue: false }
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
            new CheckBox({ displayOnly: true })
        ]
      }).addStyleClass("sapIdpOmssLibFormFacetField");
      this.setAggregation("_box", oBox);
    },

    _getLabel: function() {
        return this.getAggregation("_box").getItems()[0];
    },

    _getCheckBox: function() {
        return this.getAggregation("_box").getItems()[1];
    },

    getLabel: function() {
      return this._getLabel().getText();
    },

    setLabel: function(sValue) {
      this._getLabel().setText(sValue);
    },

    getSelected: function() {
      return this._getCheckBox().getSelected();
    },

    setSelected: function(bValue) {
      this._getCheckBox().setSelected(bValue);
    },

    renderer: function(oRM, oControl) {
      var oLayout = oControl.getAggregation("_box");
      oRM.renderControl(oLayout);
    }
  });
});
