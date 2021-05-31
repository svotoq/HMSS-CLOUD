sap.ui.define(["sap/ui/core/Control", "sap/m/HBox", "sap/m/Label", "sap/m/Text"], function(
  Control,
  HBox,
  Label,
  Text
) {
  "use strict";

  return Control.extend("bstu.hmss.lib.control.facet.FormFacetText", {
    metadata: {
      properties: {
        label: { type: "string", defaultValue: "" },
        text: { type: "string", defaultValue: "" }
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
            new Text({})
        ]
      }).addStyleClass("sapIdpOmssLibFormFacetField");
      this.setAggregation("_box", oBox);
    },

    _getLabel: function() {
      return this.getAggregation("_box").getItems()[0];
    },

	_getText: function() {
      return this.getAggregation("_box").getItems()[1];
    },

    getLabel: function() {
      return this._getLabel().getText();
    },

    setLabel: function(sValue) {
      this._getLabel().setText(sValue);
    },

    getText: function() {
		return this._getText().getText();
	},

    setText: function(sValue) {
      this._getText().setText(sValue);
    },

    renderer: function(oRM, oControl) {
      var oLayout = oControl.getAggregation("_box");
      oRM.renderControl(oLayout);
    }

  });
});
