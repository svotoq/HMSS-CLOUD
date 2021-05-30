sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ushell/services/Container"
], function (ObjectPath) {
    "use strict";

    // define ushell config
    ObjectPath.set(["sap-ushell-config"], {
        defaultRenderer: "fiori2",
        bootstrapPlugins: {
            "RuntimeAuthoringPlugin": {
                component: "sap.ushell.plugins.rta",
                config: {
                    validateAppVersion: false
                }
            },
            "PersonalizePlugin": {
                component: "sap.ushell.plugins.rta-personalize",
                config: {
                    validateAppVersion: false
                }
            }
        },
        renderers: {
            fiori2: {
                componentData: {
                    config: {
                        enableSearch: false,
                        rootIntent: "Shell-home"
                    }
                }
            }
        },
        services: {
            "LaunchPage": {
                "adapter": {
                    "config": {
                        "groups": [{
                            "tiles": [{
                                "tileType": "sap.ushell.ui.tile.StaticTile",
                                "properties": {
                                    "title": "Комнаты",
                                    "targetURL": "#Room-manage"
                                }
                            }, {
                                "tileType": "sap.ushell.ui.tile.StaticTile",
                                "properties": {
                                    "title": "Студенты",
                                    "targetURL": "#Student-manage"
                                }
                            }]
                        }]
                    }
                }
            },
            "ClientSideTargetResolution": {
                "adapter": {
                    "config": {
                        "inbounds": {
                            "Room-manage": {
                                "semanticObject": "Room",
                                "action": "manage",
                                "description": "Управление комнатами",
                                "title": "Управление комнатами",
                                "signature": {
                                    "parameters": {},
                                    "additionalParameters": "allowed"
                                },
                                "resolutionResult": {
                                    "applicationType": "SAPUI5",
                                    "additionalInformation": "SAPUI5.Component=bstu.hmss.managerooms",
                                    "url": "/rooms/webapp"
                                }
                            },
                            "Room-display": {
                                "semanticObject": "Room",
                                "action": "display",
                                "description": "Display Room",
                                "title": "Display Room",
                                "signature": {
                                    "parameters": {
                                        "RoomNumber": {
                                            "defaultValue": {"value": "", "format": "plain"},
                                            "required": true
                                        }
                                    },
                                    "additionalParameters": "ignored"
                                },
                                "resolutionResult": {
                                    "applicationType": "SAPUI5",
                                    "additionalInformation": "SAPUI5.Component=bstu.hmss.managerooms",
                                    "url": "/rooms/webapp"
                                }
                            },
                            "Student-manage": {
                                "semanticObject": "Student",
                                "action": "manage",
                                "description": "Управление студентами",
                                "title": "Управление студентами",
                                "signature": {
                                    "parameters": {},
                                    "additionalParameters": "allowed"
                                },
                                "resolutionResult": {
                                    "applicationType": "SAPUI5",
                                    "additionalInformation": "SAPUI5.Component=bstu.hmss.managestudents",
                                    "url": "/students/webapp"
                                }
                            },
                            "Student-display": {
                                "semanticObject": "Student",
                                "action": "display",
                                "description": "Display Student",
                                "title": "Display Student",
                                "signature": {
                                    "parameters": {
                                        "ID": {
                                            "defaultValue": {"value": "", "format": "plain"},
                                            "required": true
                                        }
                                    },
                                    "additionalParameters": "ignored"
                                },
                                "resolutionResult": {
                                    "applicationType": "SAPUI5",
                                    "additionalInformation": "SAPUI5.Component=bstu.hmss.managestudents",
                                    "url": "/students/webapp"
                                }
                            },
                        }
                    }
                }
            },
            NavTargetResolution: {
                config: {
                    "enableClientSideTargetResolution": true
                }
            }
        }
    });

    var oFlpSandbox = {
        init: function () {
            /**
             * Initializes the FLP sandbox
             * @returns {Promise} a promise that is resolved when the sandbox bootstrap has finshed
             */

            // sandbox is a singleton, so we can start it only once
            if (!this._oBootstrapFinished) {
                this._oBootstrapFinished = sap.ushell.bootstrap("local");
                this._oBootstrapFinished.then(function () {
                    sap.ushell.Container.createRenderer().placeAt("content");
                });
            }

            return this._oBootstrapFinished;
        }
    };

    return oFlpSandbox;
});