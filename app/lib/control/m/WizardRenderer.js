sap.ui.define([
    "bstu/hmss/lib/library",
    "sap/m/WizardRenderer",
	"sap/ui/core/Renderer"
], function(library, mWizardRenderer, Renderer) {
    "use strict";
    
    var WizardRenderer = Renderer.extend.call(mWizardRenderer, "bstu.hmss.lib.control.m.WizardRenderer", {
        
        startWizard: function (oRm, oWizard) {
            var sWizardLabelText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("WIZARD_LABEL");
    
            oRm.write("<div");
            oRm.writeControlData(oWizard);
            oRm.addClass("sapMWizard");
            oRm.addClass("sapIdpOmssLibWizardMode" + oWizard.getRenderMode());
            oRm.writeClasses();
            oRm.addStyle("width", oWizard.getWidth());
            oRm.addStyle("height", oWizard.getHeight());
            oRm.writeAccessibilityState({
                "label": sWizardLabelText
            });
            oRm.writeStyles();
            oRm.write(">");
        },
        
        renderWizardSteps: function (oRm, oWizard) {
            oRm.write("<section class='sapMWizardStepContainer'");
            oRm.writeAttributeEscaped("id", oWizard.getId() + "-step-container");
            oRm.write(">");

            // Page rendering mode would be handled manually
		    if (oWizard.getRenderMode() === library.WizardRenderMode.Scroll) {
                var aRenderingOrder = this._getStepsRenderingOrder(oWizard);
                aRenderingOrder.forEach(oRm.renderControl, oRm);
            }

		    oRm.write("</section>");
        }
    });

    return WizardRenderer;
});