sap.ui.define(["sap/m/Text"], function(Text) {
  "use strict";

  return Text.extend("bstu.hmss.lib.control.facet.FormFacetTitle", {

    init: function() {
      Text.prototype.init.apply(this, arguments);
      this.addStyleClass("sapIdpOmssLibFormFacetTitle");
    },

    renderer: {}

  });
});
