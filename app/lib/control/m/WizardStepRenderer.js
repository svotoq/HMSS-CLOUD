sap.ui.define([
    "sap/m/WizardStepRenderer",
	"sap/ui/core/Renderer"
], function(mWizardStepRenderer, Renderer) {
    "use strict";

    var mWizardStepRendererExtension = {
        
        renderWizardStepTitle: function (oRm, oStep) {
            oRm.write("<h3 class='sapMWizardStepTitle'");
            oRm.writeAttributeEscaped("id", this.getTitleId(oStep));
            oRm.write(">");
            oRm.writeEscaped(this._resolveOrder(oStep) + oStep.getTitle());
            oRm.write("</h3>");
        },

        _resolveOrder: function (oStep) {
            var oData = oStep.getCustomData()
                .filter(function (oCustomData) {
                    return oCustomData.getKey() === "stepIndex";
                })[0];
    
            return oData ? (oData.getValue() + ". ") : "";
        }
    };

    if (typeof mWizardStepRenderer.getTitleId !== "function") {
        mWizardStepRenderer.getTitleId = function (oStep) {
            return oStep.getId() + "-Title";
        };
    }
    
    var WizardStepRenderer = Renderer.extend.call(mWizardStepRenderer, "bstu.hmss.lib.control.m.WizardStepRenderer", mWizardStepRendererExtension);

    return WizardStepRenderer;
});