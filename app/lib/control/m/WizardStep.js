sap.ui.define([
    "sap/m/WizardStep"
], function(mWizardStep) {
    "use strict";

    var aVersionInfo = sap.ui.version.split(".");
    if (parseFloat(aVersionInfo[0] + "." + aVersionInfo[1]) >= 1.84) {
        return mWizardStep.extend("bstu.hmss.lib.control.m.WizardStep",{
            renderer: {}
        });
    }

    var WizardStep =  mWizardStep.extend("bstu.hmss.lib.control.m.WizardStep", {
        renderer: "bstu.hmss.lib.control.m.WizardStepRenderer"
    });

    return WizardStep;
});