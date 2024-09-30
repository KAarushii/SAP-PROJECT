sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Filter,FilterOperator) {
        "use strict";

        return Controller.extend("myskillsapp.controller.SkillScreener", {

            onInit: function () {

                // this.applyData = this.applyData.bind(this);
                // this.fetchData = this.fetchData.bind(this);
                // this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

                // this.oFilterBar = this.getView().byId("filterbar");
                // this.oTable = this.getView().byId("skillscreenertable");

                // this.oFilterBar.registerFetchData(this.fetchData);
                // this.oFilterBar.registerApplyData(this.applyData);
                // this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

                this._initializeAsync();

            },

            //----------------------------------------------------------------------------------------------------------------------//
            //                                               NAVIGATION
            //----------------------------------------------------------------------------------------------------------------------//

            // Expand and collapse the side navigation
            onExpandSideNavigation: function () {
                const oSideNavigation = this.byId("sideNavigation_skillscreener"),
                    bExpanded = oSideNavigation.getExpanded();

                oSideNavigation.setExpanded(!bExpanded);
            },

            onNavToMyProfile: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("MyProfile");
            },

            onNavToSkillScreener: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("SkillScreener");
            },

            onNavToTraining: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("Training");
            },

            onNavToCertifications: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("Certifications");
            },

            onNavToCertificationReport: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("CertificationReport");
            },

            onNavToTrainingCourseMaster: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("TrainingCourseMaster");
            },

            onNavToPanelSlotBooking: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("PanelSlotBooking");
            },

            onNavToAdoptionStatus: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("AdoptionStatus");
            },

//----------------------------------------------------------------------------------------------------------------------//

            _initializeAsync: async function () {

                try {
                    await this._onReadEmployeeData();
                }
                catch (error) {
                    console.error("Error Occured in  function calls", error);
                }
            },

            _onReadEmployeeData: function () {

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();

                return new Promise((resolve, reject) => {
                    var oBusyDialog = new sap.m.BusyDialog({
                        title: "Loading",
                        text: "Please wait..."
                    });
                    oBusyDialog.open();
                    oModel.read("/Employees", {
                        urlParameters: {
                            "$expand": "employee_skill_detail"
                        },
                        success: function (response) {
                            oJSONModel.setData(response.results);
                            this.getView().setModel(oJSONModel, "EmployeeModel");
                            oBusyDialog.close();
                            resolve();
                        }.bind(this),
                        error: function (error) {
                            oBusyDialog.close();
                        }
                    });
                });

            },


            //----------------------------------------------------------------------------------------------------------------------//

           








            //     


            onExit: function () {
                this.oModel = null;
                this.oFilterBar = null;
                this.oTable = null;
            },

            fetchData: function () {
                var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                    aResult.push({
                        groupName: oFilterItem.getGroupName(),
                        fieldName: oFilterItem.getName(),
                        fieldData: oFilterItem.getControl().getSelectedKeys()
                    });

                    return aResult;
                }, []);

                return aData;
            },

            applyData: function (aData) {
                aData.forEach(function (oDataObject) {
                    var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                    oControl.setSelectedKeys(oDataObject.fieldData);
                }, this);
            },

            getFiltersWithValues: function () {
                var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl();

                    if (oControl && oControl.getSelectedKeys && oControl.getSelectedKeys().length > 0) {
                        aResult.push(oFilterGroupItem);
                    }

                    return aResult;
                }, []);

                return aFiltersWithValue;
            },

            onSelectionChange: function (oEvent) {

                this.oFilterBar.fireFilterChange(oEvent);
            },

            onSearch: function () {
                var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl(),
                        aSelectedKeys = oControl.getSelectedKeys(),
                        aFilters = aSelectedKeys.map(function (sSelectedKey) {
                            return new Filter({
                                path: oFilterGroupItem.getName(),
                                operator: FilterOperator.Contains,
                                value1: sSelectedKey
                            });
                        });

                    if (aSelectedKeys.length > 0) {
                        aResult.push(new Filter({
                            filters: aFilters,
                            and: false
                        }));
                    }

                    return aResult;
                }, []);

                this.oTable.getBinding("items").filter(aTableFilters);
                this.oTable.setShowOverlay(false);
            },

            onFilterChange: function () {
                this._updateLabelsAndTable();
            },

            onAfterVariantLoad: function () {
                this._updateLabelsAndTable();
            },

            getFormattedSummaryText: function () {
                var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

                if (aFiltersWithValues.length === 0) {
                    return "No filters active";
                }

                if (aFiltersWithValues.length === 1) {
                    return aFiltersWithValues.length + " filter active: " + aFiltersWithValues.join(", ");
                }

                return aFiltersWithValues.length + " filters active: " + aFiltersWithValues.join(", ");
            },

            getFormattedSummaryTextExpanded: function () {
                var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

                if (aFiltersWithValues.length === 0) {
                    return "No filters active";
                }

                var sText = aFiltersWithValues.length + " filters active",
                    aNonVisibleFiltersWithValues = this.oFilterBar.retrieveNonVisibleFiltersWithValues();

                if (aFiltersWithValues.length === 1) {
                    sText = aFiltersWithValues.length + " filter active";
                }

                if (aNonVisibleFiltersWithValues && aNonVisibleFiltersWithValues.length > 0) {
                    sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
                }

                return sText;
            },

            _updateLabelsAndTable: function () {
                this.oTable.setShowOverlay(true);
            },


        });
    });