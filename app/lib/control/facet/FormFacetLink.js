sap.ui.define(["sap/ui/core/Control", "sap/m/HBox", "sap/m/Label", "sap/m/Link"], function(
  Control,
  HBox,
  Label,
  Link
) {
  "use strict";

  return Control.extend("bstu.hmss.lib.control.facet.FormFacetLink", {
    metadata: {
      properties: {
        label: { type: "string", defaultValue: "" },
        text: { type: "string", defaultValue: "" },
		    enabled: { type: "string", defaultValue: true }
      },
      aggregations: {
        _box: {
		  type: "sap.ui.core.Control", // there were sporadic errors in UI5 1.52 with a more concrete type
          multiple: false,
          visibility: "hidden"
        }
      },
      events: {
        press: {
          parameters: {
            domRef: {
              type: "sap.m.Link"
            }
          }
        }
      }
    },

    init: function() {
      var oBox = new HBox({
        items: [
            new Label({}),
            new Link({ press: this._press.bind(this) })
        ]
      }).addStyleClass("sapIdpOmssLibFormFacetField");
      this.setAggregation("_box", oBox);
    },

    _press: function () {
        this.fireEvent("press", { domRef: this._getLink().getDomRef() });
    },

    _getLabel: function() {
        return this.getAggregation("_box").getItems()[0];
    },

    _getLink: function() {
        return this.getAggregation("_box").getItems()[1];
    },

    getLabel: function() {
      return this._getLabel().getText();
    },

    setLabel: function(sValue) {
      this._getLabel().setText(sValue);
    },

    getText: function() {
      return this._getLink().getText();
    },

    setText: function(sValue) {
      this._getLink().setText(sValue);
    },

	isEnabled: function() {
	  return this._getLink().isEnabled();
	},

    setEnabled: function(bValue) {
      this._getLink().setEnabled(bValue);
    },

    renderer: function(oRM, oControl) {
      var oLayout = oControl.getAggregation("_box");
      oRM.renderControl(oLayout);
    }
  });
});
