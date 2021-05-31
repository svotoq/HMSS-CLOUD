sap.ui.define(
  ["sap/m/VBox"], function(VBox) {
  "use strict";

  return VBox.extend("bstu.hmss.lib.control.facet.FormFacet", {

    init: function() {
      VBox.prototype.init.apply(this, arguments);
      this.addStyleClass("sapIdpOmssLibFormFacet");
    },

    renderer: {}
  });
});
