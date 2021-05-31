sap.ui.define([
    "bstu/hmss/lib/library",
    "sap/m/Wizard",
    "sap/ui/core/Core",
    "bstu/hmss/lib/util/ResponsivePaddingsEnablement",
    "sap/ui/core/CustomData"
], function(library, mWizard, Core, ResponsivePaddingsEnablement, CustomData) {
    "use strict";

    var aVersionInfo = sap.ui.version.split(".");
    var iVersion = parseFloat(aVersionInfo[0] + "." + aVersionInfo[1]);
    var oMetadata = {
        library: "bstu.hmss.lib",
        events: {

            /**
             * This event is fired when the current step changes.
             */
            stepChanged: {
                parameters: {
                    /**
                    * The number of the current step. One-based.
                    */
                    current: {type: "int"}
                }
            }
        }
    };

    var fnPublishStepChanged = function (oControl) {
        /**
         * Handler for the stepChanged event. The event comes from the WizardProgressNavigator.
         * @param {jQuery.Event} event The event object
         * @private
         */
         oControl.prototype._handleStepChanged = function (event) {
            var iCurrent = ((typeof event === "number") ? event : event.getParameter("current"));//oEvent.getParameter("current");
            mWizard.prototype._handleStepChanged.apply(this, arguments);
            this.fireStepChanged({current: iCurrent});
        };
    };

    if (iVersion >= 1.84) {
        var Wizard = mWizard.extend("bstu.hmss.lib.control.m.Wizard",{
            metadata: oMetadata,
            renderer: {}
        });
        fnPublishStepChanged(Wizard);
        return Wizard;
    }

    var WizardRenderMode = library.WizardRenderMode;

    oMetadata.properties = {
        /**
         * Defines how the steps of the Wizard would be visualized.
         * @experimental since 1.83
         */
        renderMode: {
            type: "bstu.hmss.lib.WizardRenderMode",
            group: "Appearance",
            defaultValue: WizardRenderMode.Scroll
        }
    };

    var Wizard =  mWizard.extend("bstu.hmss.lib.control.m.Wizard", {
        metadata: oMetadata,
        renderer: "bstu.hmss.lib.control.m.WizardRenderer"
    });

    fnPublishStepChanged(Wizard);

    if (iVersion < 1.72) {
        ResponsivePaddingsEnablement.call(Wizard.prototype, {
			header: {suffix: "progressNavigator"},
			content: {suffix: "step-container"}
		});

        Wizard.prototype.init = function () {
            mWizard.prototype.init.apply(this, arguments);
            this._initResponsivePaddingsEnablement();
        };
    }

    if (iVersion < 1.74) {

        /**************************************** INTERFACE METHODS ***************************************/

		/**
		 * Gets the sticky content of the Wizard.
		 *
		 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance.
		 * @private
		 */
		Wizard.prototype._getStickyContent = function () {
			return this._getProgressNavigator();
		};

		/**
		 * Places back the sticky content in the Wizard.
		 *
		 * @private
		 */
		Wizard.prototype._returnStickyContent = function () {
			// Place back the progress navigator in the Wizard
			if (this.bIsDestroyed) {
				return;
			}

			this._getStickyContent().$().prependTo(this.$());
		};

		/**
		 * Sets if the sticky content is stuck in the DynamicPage's header.
		 *
		 * @param {boolean} bIsInStickyContainer True if the sticky content is stuck in the DynamicPage's header.
		 * @private
		 */
		Wizard.prototype._setStickySubheaderSticked = function (bIsInStickyContainer) {
			this._bStickyContentSticked = bIsInStickyContainer;
		};

		/**
		 * Gets if the sticky content is stuck in the DynamicPage's header.
		 *
		 * @returns {boolean} True if the sticky content is stuck in the DynamicPage's header.
		 * @private
		 */
		Wizard.prototype._getStickySubheaderSticked = function () {
			return this._bStickyContentSticked;
		};
    }

    Wizard.prototype.onAfterRendering = function () {
        mWizard.prototype.onAfterRendering.apply(this, arguments);
        this._renderPageMode();
    };

    /**
     * Goes to the given step. The step must already be activated and visible. You can't use this method on steps
     * that haven't been reached yet.
     * @param {sap.m.WizardStep} oStep The step to go to.
     * @param {boolean} bFocusFirstStepElement Defines whether the focus should be changed to the first element.
     * @returns {this} Pointer to the control instance for chaining.
     * @public
     */
    Wizard.prototype.goToStep = function (oStep, bFocusFirstStepElement) {
        //variables were changed to hungarian notation in 1.72
        var aStepsPath = this._stepPath || this._aStepPath;
        var fnUpdateProgressNavigator = function () {
            var oProgressNavigator = this._getProgressNavigator();
            if (oProgressNavigator) {
                oProgressNavigator._updateCurrentStep(aStepsPath.indexOf(oStep) + 1);
            }
        };
        if (!this.getVisible() || aStepsPath.indexOf(oStep) < 0) {
            return this;
        } else if (this.getRenderMode() === WizardRenderMode.Page) {
            fnUpdateProgressNavigator.call(this);
            this._renderPageMode(oStep);
            return this;
        }
        oStep._setNumberInvisibleText(this.getProgress());
        var that = this,
            mScrollProps = {
                scrollTop: this._getStepScrollOffset(oStep)
            },
            mAnimProps = {
                queue: false,
                duration: Wizard.CONSTANTS.ANIMATION_TIME,
                start: function () {
                    //variables were changed to hungarian notation in 1.72
                    if (typeof that._scrollLocked !== "undefined") {
                        that._scrollLocked = true;
                    } else {
                        that._bScrollLocked = true;
                    }
                },
                complete: function () {
                    //variables were changed to hungarian notation in 1.72
                    if (typeof that._scrollLocked !== "undefined") {
                        that._scrollLocked = false;
                    } else {
                        that._bScrollLocked = false;
                    }
                    fnUpdateProgressNavigator.call(that);
                    if (bFocusFirstStepElement || bFocusFirstStepElement === undefined) {
                        that._focusFirstStepElement(oStep);
                    }
                }
            };
        jQuery(this.getDomRef("step-container")).animate(mScrollProps, mAnimProps);
        return this;
    };

    /**
     * Renders Wizard in Page mode. The rendering is manual.
     *
     * @param {sap.m.WizardStep} oStep [optional] The step to be rendered.
     * @private
     */
    Wizard.prototype._renderPageMode = function (oStep) {
        var iCurrentStepIndex, oCurrentStep, oRenderManager;

        if (this.getRenderMode() !== WizardRenderMode.Page) {
            return;
        }

        //variables were changed to hungarian notation in 1.72
        var aStepsPath = this._stepPath || this._aStepPath;
        if (oStep) {
            iCurrentStepIndex = aStepsPath.indexOf(oStep) + 1;
            oCurrentStep = oStep;
        } else {
            iCurrentStepIndex = this._getProgressNavigator().getCurrentStep();
            oCurrentStep = aStepsPath[iCurrentStepIndex - 1];
        }

        oRenderManager = Core.createRenderManager();
        oRenderManager.renderControl(
            this._updateStepTitleNumber(oCurrentStep, iCurrentStepIndex));
        oRenderManager.flush(this.getDomRef("step-container"));
        oRenderManager.destroy();
    };

    /**
     * Adds custom data with the current order of the step.
     *
     * @param {Object} oStep - Step object
     * @param {Number} iStepIndex - Index of the Step
     * @returns {*} - Return Step object with a custom data.
     * @private
     */
    Wizard.prototype._updateStepTitleNumber = function (oStep, iStepIndex) {
        var oData = oStep.getCustomData()
            .filter(function (oCustomData) {
                return oCustomData.getKey() === "stepIndex";
            })[0];

        if (oData) {
            oData.setValue(iStepIndex);
        } else {
            oStep.addCustomData(new CustomData({key: "stepIndex", value: iStepIndex}));
        }

        return oStep;
    };
    
    return Wizard;
});