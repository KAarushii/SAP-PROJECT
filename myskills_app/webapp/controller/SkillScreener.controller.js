sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/core/Fragment',
    "sap/ui/model/odata/v4/ODataModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, Fragment, ODataModel) {
        "use strict";

        return Controller.extend("myskillsapp.controller.SkillScreener", {

            onInit: function () {

                

                this._initializeAsync();

                this.comboBoxGenericSearch("comboBoxSkill");
                this.comboBoxGenericSearch("comboBoxStatus");
                this.comboBoxGenericSearch("comboBoxPractice");

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

                var fPage = this.byId("filteringPage");
                fPage.setVisible(true);
                var oPage = this.byId("overviewPage");
                oPage.setVisible(false);
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
                    await this._readUniqueDataForFilter();
                }
                catch (error) {
                    console.error("Error Occured in  function calls", error);
                }
            },

            _onReadEmployeeData: function () {

                var fPage = this.byId("filteringPage");
                fPage.setVisible(true);

                var oPage = this.byId("overviewPage");
                oPage.setVisible(false);

                return new Promise((resolve, reject) => {

                    var oBusyDialog = new sap.m.BusyDialog({
                        title: "Loading",
                        text: "Please wait..."
                    });
                    oBusyDialog.open();
                    var oModel = this.getOwnerComponent().getModel("main1");

                    // Use the requestBinding method to fetch data from the /Employees endpoint
                    oModel.bindList("/Employees", undefined, undefined, undefined, {

                        $expand: "employee_skill_detail,employee_customer_experience,employee_industries_experience,employee_product_experience,employee_project_summary,employee_cv_experience_data"

                    }).requestContexts().then(function (aContexts) {

                        var aData = aContexts.map(function (oContext) {
                            return oContext.getObject();  // Extract the object from each context
                        });

                        // Create a JSON model and set the fetched data to it
                        var oJSONModel = new sap.ui.model.json.JSONModel(aData);
                        this.getView().setModel(oJSONModel, "EmployeeModel");  // Set the JSON model to the view
                        oBusyDialog.close();
                        resolve();

                    }.bind(this)).catch(function (oError) {
                        console.error("Error while fetching employees data: ", oError);
                        oBusyDialog.close();
                        reject(error); // Reject the promise on error

                    });

                    oModel.bindList("/Employee_Skill_Detail").requestContexts().then(function (aContexts) {

                        var aData = aContexts.map(function (oContext) {
                            return oContext.getObject();  // Extract the object from each context
                        });

                        // Create a JSON model and set the fetched data to it
                        var oJSONModel = new sap.ui.model.json.JSONModel(aData);
                        this.getView().setModel(oJSONModel, "EmployeeSkillModel");  // Set the JSON model to the view
                        oBusyDialog.close();
                        resolve();

                    }.bind(this)).catch(function (oError) {
                        console.error("Error while fetching employees data: ", oError);
                        oBusyDialog.close();
                        reject(error); // Reject the promise on error

                    });

                });

            },

            _readUniqueDataForFilter: function () {

                return new Promise((resolve, reject) => {

                    var oModel = this.getOwnerComponent().getModel("main1");
                    var sFunctionPath = "/uniqueDataForFilter()";

                    oModel.bindContext(sFunctionPath).requestObject().then(function (oData) {

                        // Use oData or oData.value based on what the structure is
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        this.getView().setModel(oJSONModel, "UniqueModel");
                        resolve();

                    }.bind(this)).catch(function (oError) {
                        console.error("Error executing function: ", oError);
                        reject();
                    });


                });

            },

            //---------------------------------------------------------------------------------------------------------

            onSearch: function (oEvent) {


                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait..."
                });
                oBusyDialog.open();

                var aFilterSkills = [], aFilterBillingStatus = [], aFilterPractice = [];

                var oFilterBar = this.byId("filterBar");
                var aFilterGroupItems = oFilterBar.getFilterGroupItems();
                var oModel = this.getOwnerComponent().getModel("main1");
                var that = this;

                aFilterGroupItems.forEach(function (oFilterGroupItem) {
                    var sName = oFilterGroupItem.getName();
                    var oControl = oFilterGroupItem.getControl();
                    var aSelectedItems = oControl.getSelectedItems();

                    if (aSelectedItems.length > 0) {

                        switch (sName) {
                            case "employee_skill_detail/skill":

                                aFilterSkills = aSelectedItems.map(item => item.getKey());
                                break;

                            case "billing_status":

                                aFilterBillingStatus = aSelectedItems.map(item => item.getKey());
                                break;

                            case "practice":

                                aFilterPractice = aSelectedItems.map(item => item.getKey());
                                break;

                            default:
                                console.log("unidentified filter component name");
                                break;
                        }
                    }

                });

                // Construct the function call URL with parameters 
                var sFunctionPath = "/skillFilter(filterSkill='" + aFilterSkills.join(",")
                    + "',filterStatus='" + aFilterBillingStatus.join(",")
                    + "',filterPractice='" + aFilterPractice.join(",") + "')";

                oModel.bindList(sFunctionPath, undefined, undefined, undefined, {

                    $expand: "employee_skill_detail,employee_customer_experience,employee_industries_experience,employee_product_experience,employee_project_summary,employee_cv_experience_data"

                }).requestContexts().then(function (aContexts) {

                    var aData = aContexts.map(function (oContext) {
                        return oContext.getObject();  // Extract the object from each context
                    });

                    // Create a JSON model and set the fetched data to it
                    var oJSONModel = new sap.ui.model.json.JSONModel(aData);
                    that.getView().setModel(oJSONModel, "EmployeeModel");  // Set the JSON model to the view
                    oBusyDialog.close();

                }.bind(this)).catch(function (oError) {
                    console.error("Error while fetching employees data: ", oError);
                    oBusyDialog.close();

                });

            },

            comboBoxGenericSearch: function (id) {

                var oComboBox = this.byId(id);
                oComboBox.setFilterFunction(function (sTerm, oItem) {
                    return oItem.getText().toLowerCase().includes(sTerm.toLowerCase());
                });

            },

            //////////////////////////////////////////// OVERVIEW PAGE ///////////////////////////////////////////////////////////////////

            onNavToDetails: function (oEvent) {

                var fPage = this.byId("filteringPage");
                fPage.setVisible(false);

                var oPage = this.byId("overviewPage");
                oPage.setVisible(true);

                var oSelectedItem = oEvent.getSource();

                // Get the binding context of the selected item
                var oContext = oSelectedItem.getBindingContext("EmployeeModel");

                // Get the data of the selected item
                var oSelectedData = oContext.getObject();

                var oOverviewModel = new sap.ui.model.json.JSONModel(oSelectedData);
                this.getView().setModel(oOverviewModel, "OverviewModel");

                //this._setTreeTableDataSkills(oEmpl_skill_fetched_data);

            },

            onNavBack: function () {

                var fPage = this.byId("filteringPage");
                fPage.setVisible(true);

                var oPage = this.byId("overviewPage");
                oPage.setVisible(false);

            },


        });
    });