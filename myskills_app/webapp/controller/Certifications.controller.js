sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("myskillsapp.controller.Certifications", {
            onInit: function () {
                this.onReadEmpData();
            },
            onReadEmpData: function(){
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
                            oJSONModel.setData(response.results[0]);
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
//                                               NAVIGATION
//----------------------------------------------------------------------------------------------------------------------//

      // Expand and collapse the side navigation
        onExpandSideNavigation: function(){
            const oSideNavigation = this.byId("sideNavigation"),
                bExpanded = oSideNavigation.getExpanded();

            oSideNavigation.setExpanded(!bExpanded);
        },

        onNavToMyProfile: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
            oRouter.navTo("MyProfile");
        },

        onNavToSkillScreener: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
            oRouter.navTo("SkillScreener");
        }, 

        onNavToTraining: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
            oRouter.navTo("Training");
        },

        onNavToCertifications: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
            oRouter.navTo("Certifications");
        },
        
        onNavToCertificationReport: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
            oRouter.navTo("CertificationReport");
        },

        onNavToTrainingCourseMaster: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
            oRouter.navTo("TrainingCourseMaster");
        },

        onNavToPanelSlotBooking: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
            oRouter.navTo("PanelSlotBooking");
        },

        onNavToAdoptionStatus: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
            oRouter.navTo("AdoptionStatus");
        },

       
//----------------------------------------------------------------------------------------------------------------------//

           
        });
    });