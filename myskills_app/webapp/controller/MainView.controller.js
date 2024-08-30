sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/Sorter',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    'sap/ui/core/util/MockServer',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/ui/model/odata/v2/ODataModel',
    "sap/ui/unified/library",
    "sap/ui/unified/DateTypeRange",
    "sap/ui/core/date/UI5Date",
    'sap/ushell/services/UserInfo'
],
function (Controller,MessageBox, Filter, FilterOperator, Sorter, JSONModel,UserInfo,
    MessageToast, MockServer, exportLibrary, Spreadsheet, ODataModel, CoreLibrary,UnifiedLibrary, DateTypeRange, UI5Date) {
    "use strict";
    
    return Controller.extend("myskillsapp.controller.MainView", {
        onInit: function () {

          this._onReadEmpData();  
          this.linearWizard = this.byId("wizardContentPage");
          this._initializeAsync();
        
          this.initRichTextEditor(false);

          var oViewModel=new JSONModel();
          var oCvData = {
            bEdit : false
          }
          this.getView().setModel(oViewModel,"oViewModel");
          oViewModel.setData(oCvData);
          oViewModel.refresh();
         
        },
        
        _initializeAsync: async function () {

            try {
                await this._onReadEmpData();
                await this._setTreeTableDataSkills();
                await this._setTreeTableDataIndustries();
                this.onExpandAll();
                await this.workExperienceList();
                await this.profSummaryDetails();
                await this.educationQualificationList();
               
                
                
            }
            catch (error) {
                console.error("Error Occured in  function calls", error);
            }
        },

        _onReadEmpData: function () {

            var oModel = this.getOwnerComponent().getModel();
            var oJSONModel = new sap.ui.model.json.JSONModel();
 
            var oUserInfoService = sap.ushell.Container.getService("UserInfo");
                var sEmailId = oUserInfoService.getUser().getEmail();
               
 
                // var sEmailId = "aarushi.kushwaha@ltimindtree.com"
                var oUrlParameters = {
                    "$expand": "employee_skill_detail,employee_industries_experience,employee_customer_experience,employee_cv_experience_data,employee_education_detail,employee_professional_summary,employee_product_experience,employee_language_experience,employee_country_experience",
                    "$filter" : "email eq '"+sEmailId+"'"
                }

            return new Promise((resolve, reject) => {
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait..."
                });
                oBusyDialog.open();
                oModel.read("/Employees", {
                    urlParameters:oUrlParameters,
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







//----------------------------------------------------------------------------------------------------------------------//
//                                               SKILLS TAB
//----------------------------------------------------------------------------------------------------------------------//

            // reading employee_skill_detail data from database and setting in tree table format
            _setTreeTableDataSkills: function () {

                return new Promise((resolve, reject) => {

                    var oModel = this.getView().getModel("EmployeeModel");
                    let oEmpl_skill_fetched_data = oModel.getProperty("/employee_skill_detail/results");

                    let bClusterNotPresent = true;

                    // tree table JSON Payload
                    var oJSONData = {
                        "cluster_array": []
                    };

                    // cluster_array Payload
                    let oJSONData_clust_array_element =
                    {
                        "clust_JSC": "",
                        "employee_skill": [
                            {
                                "skill": "",
                                "rating": 0,
                                "exp_years": 0,
                                "exp_months": 0,
                                "bEditable": false,
                                "btnEditable": false
                            }
                        ]
                    };

                    var oJSONData_skill_array_element;

                    // looping for setting data from the employee_skill_detail  into respective cluster and skills
                    for (let i = 0; i < oEmpl_skill_fetched_data.length; i++, bClusterNotPresent = true) {

                        for (let j = 0; j < oJSONData.cluster_array.length && i > 0; j++) {

                            if (oEmpl_skill_fetched_data[i].JSC === oJSONData.cluster_array[j].clust_JSC) {

                                oJSONData_skill_array_element =
                                {
                                    "skill": oEmpl_skill_fetched_data[i].skill,
                                    "rating": oEmpl_skill_fetched_data[i].rating,
                                    "exp_years": oEmpl_skill_fetched_data[i].exp_years,
                                    "exp_months": oEmpl_skill_fetched_data[i].exp_months,
                                    "bEditable": false,
                                    "btnEditable": false
                                }


                                oJSONData.cluster_array[j].employee_skill.push(oJSONData_skill_array_element);
                                bClusterNotPresent = false;
                                break;
                            }
                        }

                        if (bClusterNotPresent) {
                            oJSONData_clust_array_element =
                            {
                                "clust_JSC": oEmpl_skill_fetched_data[i].JSC,
                                "employee_skill": [
                                    {
                                        "skill": oEmpl_skill_fetched_data[i].skill,
                                        "rating": oEmpl_skill_fetched_data[i].rating,
                                        "exp_years": oEmpl_skill_fetched_data[i].exp_years,
                                        "exp_months": oEmpl_skill_fetched_data[i].exp_months,
                                        "bEditable": false,
                                        "btnEditable": false
                                    }
                                ]
                            };

                            oJSONData.cluster_array.push(oJSONData_clust_array_element);
                        }


                    }

                    var oTreeModel = new sap.ui.model.json.JSONModel(oJSONData);

                    // setting the treetable model with created JSONModel
                    var oTreeTable = this.getView().byId("TreeTableBasic");
                    oTreeTable.setModel(oTreeModel);
                    oTreeTable.bindRows({
                        path: "/cluster_array"
                    });
                    resolve();

                });

            },

            // collapse all cluster on the tree table
            onCollapseAll: function () {
                const oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.collapseAll();
            },

            // collapse the selected cluster on the tree table
            onCollapseSelection: function () {
                const oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.collapse(oTreeTable.getSelectedIndices());
            },

            //Expand all cluster on the tree table
            onExpandAll: function () {

                let oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.expandToLevel(1);
    
                oTreeTable = this.byId("TreeTableIndustries");
                oTreeTable.expandToLevel(1);
            },
            

            // Expand the selected cluster on the tree table
            onExpandSelection: function () {
                const oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.expand(oTreeTable.getSelectedIndices());
            },

           


            // button event for triggering the skills select dialog
            onAddSkillsDialog: function () {

                if (!this.oDialog) {
                    this.loadFragment({
                        name: "myskillsapp.fragment.AddSkills"
                    }).then(function (odialog) {
                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },

            // Filter for Searching the skills in the select dialog
            handleSearchSkill: function (oEvent) {
                var sValue = oEvent.getParameter("value");

                var InputFilter = new Filter({
                    filters: [

                        new Filter({
                            path: 'practice',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        }),
                        new Filter({
                            path: 'JSC',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        }),
                        new Filter({
                            path: 'leaf_skills',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        })

                    ],
                    and: false
                });

                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([InputFilter]);
            },

            handleClose: function () {
                this.oDialog.destroy();
                this.oDialog = null;
            },


            // Saving the skill selected through the select dialog into database
            handleSaveSkill: function (oEvent) {

                var oModel = this.getView().getModel("EmployeeModel");
                let oEmpl_skill_fetched_data = oModel.getProperty("/employee_skill_detail/results");

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                var iPS_NO, sJSC, sSkill, sBatchPath;
                var that = this;
                let oAdd_Skills_Payload = {};
                var aBatchChanges = [];
                let aSelected_skill_present = [];
                let bSkillNotPresent = true;
                let changesmade = false;
                let alreadypresent = false;

                iPS_NO = oModel.getData().PS_NO;

                // data of skills selected from the skills select dialog
                var aContexts = oEvent.getParameter("selectedContexts");
                let aLeaf_data = aContexts.map(function (oContext) { return oContext.getObject(); });


                if (aLeaf_data.length > 0) {

                    // loop for checking as well as adding the skills selected from the select dialog
                    for (let i = 0; i < aLeaf_data.length; i++, bSkillNotPresent = true) {

                        // loop for checking presence of cluster and skill
                        for (let j = 0; j < oEmpl_skill_fetched_data.length; j++) {
                            // if seleced skill's cluster is already present
                            if (aLeaf_data[i].JSC === oEmpl_skill_fetched_data[j].JSC) {
                                // if seleced skill is already present
                                if (aLeaf_data[i].leaf_skills === oEmpl_skill_fetched_data[j].skill) {

                                    aSelected_skill_present.push(aLeaf_data[i].leaf_skills);
                                    bSkillNotPresent = false;
                                    alreadypresent = true;
                                    break;
                                }
                            }
                        }

                        // if selected skill not present
                        if (bSkillNotPresent) {

                            iPS_NO = parseInt(iPS_NO);
                            sJSC = encodeURIComponent(aLeaf_data[i].JSC);
                            sSkill = encodeURIComponent(aLeaf_data[i].leaf_skills);

                            //payload for posting new skill into the employee_skill_detail
                            oAdd_Skills_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "JSC": aLeaf_data[i].JSC,
                                "skill": aLeaf_data[i].leaf_skills,
                                "rating": 0,
                                "exp_years": false,
                                "exp_months": false
                            }

                            // pushing element into batchchange array along with the POST operation
                            sBatchPath = "/Employee_Skill_Detail(empl_PS_NO=" + iPS_NO + ",JSC='" + sJSC + "',skill='" + sSkill + "')";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oAdd_Skills_Payload));
                            changesmade = true;
                        }

                    }

                }
                // if selected skill already present
                if (alreadypresent) {
                    MessageBox.alert(" Selected skill(s): " + aSelected_skill_present.join(", ") + " already present");
                }
                // if skills are added
                if (changesmade) {

                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Skills Added Successfully");
                            that._initializeAsync();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                //if no skills were selected from the skills select dialog
                else {

                    MessageBox.information(" No skill(s) selected, Please select some skills", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.onAdd();
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }


            },

            // Permission for deleting existing skills from the database
            onDeleteSkill: function () {

                var that = this;
                var oModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oModel.getProperty("/PS_NO");

                var oTable = this.getView().byId("TreeTableBasic");
                var aIndices = oTable.getSelectedIndices();            //array indices of the selected records


                if (aIndices.length > 0) {

                    MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.handleDeleteskill(aIndices, iPS_NO, oTable);
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }
                else {
                    MessageBox.information("No record(s) selected");
                }
            },

            // deleting the selected existing skills from the database
            handleDeleteskill: function (aIndices, PS_NO, oTable) {

                var sBatchPath = "", aBatchChanges = [];
                var iPS_NO = parseInt(PS_NO);

                var that = this;

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                // loop for finding that specific skill in the respective cluster
                for (var i = aIndices.length - 1; i >= 0; i--) {

                    var tableContext = oTable.getContextByIndex(aIndices[i]);

                    var sSkillPath = tableContext.getPath();
                    if (sSkillPath.length > 20) {

                        // fetching the skill from the selected record
                        var sSkill = oTable.getModel().getProperty(sSkillPath).skill;

                        // fetching the cluster of the selected skill
                        var sClusterPath = tableContext.getPath().slice(0, -17);
                        var sJSC = oTable.getModel().getProperty(sClusterPath).clust_JSC;

                        sJSC = encodeURIComponent(sJSC);
                        sSkill = encodeURIComponent(sSkill);

                        // pushing element into batchchange array along with the delete operation
                        sBatchPath = "/Employee_Skill_Detail(empl_PS_NO=" + iPS_NO + ",JSC='" + sJSC + "',skill='" + sSkill + "')";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));
                    }

                }
                oRequestModel.addBatchChangeOperations(aBatchChanges);
                oRequestModel.submitBatch(function (oData, oResponse) {
                    // Success callback function
                    if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                        sap.m.MessageBox.success("Skills Deleted Successfully");
                        that._initializeAsync();
                    }
                    // Handle the response data
                }, function (oError) {
                    // Error callback function
                    sap.m.MessageBox.waning("failed");
                    // Handle the error
                });

            },

            //the properties of the selected row from the tree table are set into editable mode
            onRowSkillSelect: function () {

                var oTable = this.getView().byId("TreeTableBasic");
                var aIndices = oTable.getSelectedIndices();
                let oModel = oTable.getModel();
                let oTreeTable_fetched_data = oModel.getProperty("/cluster_array");

                // for initially setting all the tree table rows to non-editable mode
                for (let i = 0; i < oTreeTable_fetched_data.length; i++) {
                    for (let j = 0; j < oTreeTable_fetched_data[i].employee_skill.length; j++) {
                        var sPath = "/cluster_array/" + i + "/employee_skill/" + j + "/bEditable";
                        oModel.setProperty(sPath, false);
                    }
                }


                //loop for finding and settting editable true to that specific skill
                for (let i = 0; i < aIndices.length; i++) {

                    var tableContext = oTable.getContextByIndex(aIndices[i]);

                    var sPath = tableContext.getPath() + "/bEditable";
                    if (sPath.length > 30) {
                        oModel.setProperty(sPath, true);
                    }
                }
            },

            // Updating all the changes made in the skill tree table to the database
            onSaveSkillChanges: function () {

                var oTable = this.getView().byId("TreeTableBasic");
                var aIndices = oTable.getSelectedIndices();

                if (aIndices.length !== 0) {
                    let oTableModel = oTable.getModel();
                    var that = this;

                    var oMainModel = this.getView().getModel("EmployeeModel");
                    var iPS_NO = oMainModel.getData().PS_NO;

                    var sBatchPath = "", aBatchChanges = [];

                    var url = this.getOwnerComponent().getModel().sServiceUrl;
                    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                    // payload for updation into the employee_skill_detail
                    var oUpdate_Skills_Payload =
                    {
                        "empl_PS_NO": iPS_NO,
                        "JSC": "",
                        "skill": "",
                        "rating": 0,
                        "exp_years": 0,
                        "exp_months": 0,
                        "bEditable": false,
                        "btnEditable": false
                    }

                    // loop for capturing the selected records from table  
                    for (var i = 0; i < aIndices.length; i++) {

                        var tableContext = oTable.getContextByIndex(aIndices[i]);
                        var sSkillPath = tableContext.getPath();

                        var sClusterPath = sSkillPath.slice(0, -17);

                        if (sSkillPath.length > 30) {

                            var oData = oTableModel.getProperty(sSkillPath);
                            var sJSC = oTableModel.getProperty(sClusterPath).clust_JSC;

                            oUpdate_Skills_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "JSC": sJSC,
                                "skill": oData.skill,
                                "rating": oData.rating,
                                "exp_years": oData.exp_years,
                                "exp_months": oData.exp_months,
                                "bEditable": false,
                                "btnEditable": false
                            }

                            sJSC = encodeURIComponent(sJSC);
                            var sSkill = encodeURIComponent(oData.skill);

                            // pushing element into batchchange array along with the update operation
                            sBatchPath = "/Employee_Skill_Detail(empl_PS_NO=" + iPS_NO + ",JSC='" + sJSC + "',skill='" + sSkill + "')";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Skills_Payload));

                        }
                    }

                    // Update Database Call
                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function - changes saved to database
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Skills Updated Successfully");
                            oTable.clearSelection();
                            that._initializeAsync();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                else {
                    MessageBox.information(" No skill(s) selected, Please select some skills");
                }

            },

            // canceling the changes we made, can be done only before saving it to the database
            onCancelSkillChanges: function () {

                var that = this;

                MessageBox.warning("Are you sure you want to discard the changes?", {
                    title: "Discard Record(s)",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            that._initializeAsync();
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                });

            },




//----------------------------------------------------------------------------------------------------------------------//
//                                               EXPERIENCE TAB
//----------------------------------------------------------------------------------------------------------------------//




//  --------------------------------------------Industry Experience-------------------------------------------------//

        // Edit Industry experience 
    onAddIndustryExperience: function () {

        if (!this.oDialog) {
            this.loadFragment({
                name: "myskillsapp.fragment.Industry"
            }).then(function (odialog) {
                this.oDialog = odialog;
                this.oDialog.open();

            }.bind(this))
        } else {
            this.oDialog.open();
        }

    },
       _setTreeTableDataIndustries: function () {

        return new Promise((resolve, reject) => {

            var oModel = this.getView().getModel("EmployeeModel");
            let oEmpl_Industry_fetched_data = oModel.getProperty("/employee_industries_experience/results");
             

            let bClusterNotPresent = true;

            // tree table JSON Payload
            var oJSONData = {
                "industry_cluster_array": []
            };

            // industry_cluster_array Payload
            let oJSONData_clust_array_element =
            {
                "clust_industry": "",
                "employee_industries": [
                    {
                        "ID": "",
                        "industry_type": "",
                        "exp_years": 0,
                        "exp_months": 0,
                        "bEditable": false,
                    }
                ]
            };

            var oJSONData_industries_array_element;

            // looping for setting data from the employee_skill_detail  into respective cluster and skills
            for (let i = 0; i < oEmpl_Industry_fetched_data.length; i++, bClusterNotPresent = true) {

                for (let j = 0; j < oJSONData.industry_cluster_array.length && i > 0; j++) {

                    if (oEmpl_Industry_fetched_data[i].industry_cluster === oJSONData.industry_cluster_array[j].clust_industry) {

                        oJSONData_industries_array_element =
                        {
                            "ID": oEmpl_Industry_fetched_data[i].ID,
                            "industry_type": oEmpl_Industry_fetched_data[i].industry_type,
                            "exp_years": oEmpl_Industry_fetched_data[i].exp_years,
                            "exp_months": oEmpl_Industry_fetched_data[i].exp_months,
                            "bEditable": false,
                        }


                        oJSONData.industry_cluster_array[j].employee_industries.push(oJSONData_industries_array_element);
                        bClusterNotPresent = false;
                        break;
                    }
                }

                if (bClusterNotPresent) {
                    oJSONData_clust_array_element =
                    {
                        "clust_industry": oEmpl_Industry_fetched_data[i].industry_cluster,
                        "employee_industries": [
                            {
                                "ID": oEmpl_Industry_fetched_data[i].ID,
                                "industry_type": oEmpl_Industry_fetched_data[i].industry_type,
                                "exp_years": oEmpl_Industry_fetched_data[i].exp_years,
                                "exp_months": oEmpl_Industry_fetched_data[i].exp_months,
                                "bEditable": false,
                            }
                        ]
                    };

                    oJSONData.industry_cluster_array.push(oJSONData_clust_array_element);
                }


            }

            var oTreeModel = new sap.ui.model.json.JSONModel(oJSONData);

            // setting the treetable model with created JSONModel
            var oTreeTable = this.getView().byId("TreeTableIndustries");
            oTreeTable.setModel(oTreeModel);
            oTreeTable.bindRows({
                path: "/industry_cluster_array"
            });
            resolve();

        });

    },

   

    // Filter for Searching the Industry Type in the select dialog
    handleSearchIndustry: function (oEvent) {
        var sValue = oEvent.getParameter("value");

        var InputFilter = new Filter({
            filters: [

                new Filter({
                    path: 'industry_cluster',
                    operator: FilterOperator.Contains,
                    value1: sValue,
                    caseSensitive: false
                }),
                new Filter({
                    path: 'industry_type',
                    operator: FilterOperator.Contains,
                    value1: sValue,
                    caseSensitive: false
                })
            ],
            and: false
        });

        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter([InputFilter]);
    },


    // Saving the Industry Type selected through the select dialog into database
    handleSaveIndustryExperience: function (oEvent) {

        var oModel = this.getView().getModel("EmployeeModel");
        let oEmpl_skill_fetched_data = oModel.getProperty("/employee_industries_experience/results");

        var url = this.getOwnerComponent().getModel().sServiceUrl;
        var oRequestModel = new sap.ui.model.odata.ODataModel(url);

        var iPS_NO, sIndustry_Cluster, sIndustry_Type, sBatchPath;
        var that = this;
        let oAdd_Industry_Payload = {};
        var aBatchChanges = [];
        let aSelected_Industry_present = [];
        let bIndustryNotPresent = true;
        let changesmade = false;
        let alreadypresent = false;

        iPS_NO = oModel.getData().PS_NO;

        // data of skills selected from the skills select dialog
        var aContexts = oEvent.getParameter("selectedContexts");
        let aSelected_data = aContexts.map(function (oContext) { return oContext.getObject(); });


        if (aSelected_data.length > 0) {

            // loop for checking as well as adding the skills selected from the select dialog
            for (let i = 0; i < aSelected_data.length; i++, bIndustryNotPresent = true) {

                // loop for checking presence of cluster and skill
                for (let j = 0; j < oEmpl_skill_fetched_data.length; j++) {
                    // if seleced skill's cluster is already present
                    if (aSelected_data[i].industry_cluster === oEmpl_skill_fetched_data[j].industry_cluster) {
                        // if seleced skill is already present
                        if (aSelected_data[i].industry_type === oEmpl_skill_fetched_data[j].industry_type) {

                            aSelected_Industry_present.push(aSelected_data[i].industry_type);
                            bIndustryNotPresent = false;
                            alreadypresent = true;
                            break;
                        }
                    }
                }

                // if selected skill not present
                if (bIndustryNotPresent) {

                    iPS_NO = parseInt(iPS_NO);

                    //payload for posting new skill into the employee_skill_detail
                    oAdd_Industry_Payload =
                    {
                        "empl_PS_NO": iPS_NO,
                        "industry_cluster": aSelected_data[i].industry_cluster,
                        "industry_type": aSelected_data[i].industry_type,
                        "exp_years": 0,
                        "exp_months": 0
                    }

                    // pushing element into batchchange array along with the POST operation
                    sBatchPath = "/Employee_Industries_Experience";
                    aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Industry_Payload));
                    changesmade = true;
                }

            }

        }
        // if selected skill already present
        if (alreadypresent) {
            MessageBox.alert(" Selected skill(s): " + aSelected_Industry_present.join(", ") + " already present");
        }
        // if skills are added
        if (changesmade) {

            oRequestModel.addBatchChangeOperations(aBatchChanges);
            oRequestModel.submitBatch(function (oData, oResponse) {
                // Success callback function
                if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                    sap.m.MessageBox.success("Skills Added Successfully");
                    that._initializeAsync();
                }
                // Handle the response data
            }, function (oError) {
                // Error callback function
                sap.m.MessageBox.waning("failed");
                // Handle the error
            });
        }
        //if no skills were selected from the skills select dialog
        else {

            MessageBox.information(" No skill(s) selected, Please select some skills", {
                title: "Delete Record(s)",
                onClose: function (sAction) {
                    if (sAction === 'OK') {
                        that.onAdd();
                    }
                }.bind(this),
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
            });
        }


    },

    onDeleteIndustry: function () {

        var that = this;
        var oModel = this.getView().getModel("EmployeeModel");
        var iPS_NO = oModel.getProperty("/PS_NO");

        var oTable = this.getView().byId("TreeTableIndustries");
        var aIndices = oTable.getSelectedIndices();            //array indices of the selected records


        if (aIndices.length > 0) {

            MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                title: "Delete Record(s)",
                onClose: function (sAction) {
                    if (sAction === 'OK') {
                        that.handleDeleteIndustry(aIndices, iPS_NO, oTable);
                    }
                }.bind(this),
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
            });
        }
        else {
            MessageBox.information("No record(s) selected");
        }
    },

    // deleting the selected existing skills from the database
    handleDeleteIndustry: function (aIndices, PS_NO, oTable) {

        var sBatchPath = "", aBatchChanges = [];
        var iPS_NO = parseInt(PS_NO);

        var that = this;

        var url = this.getOwnerComponent().getModel().sServiceUrl;
        var oRequestModel = new sap.ui.model.odata.ODataModel(url);

        // loop for finding that specific skill in the respective cluster
        for (var i = aIndices.length - 1; i >= 0; i--) {

            var tableContext = oTable.getContextByIndex(aIndices[i]);
            var sIndustryPath = tableContext.getPath();

            if (sIndustryPath.length > 20) {

                // fetching the UUID of the selected record
                var sID = oTable.getModel().getProperty(sIndustryPath).ID;

                sID = encodeURIComponent(sID);

                // pushing element into batchchange array along with the delete operation
                sBatchPath = "/Employee_Industries_Experience("+ sID + ")";
                aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));
            }

        }
        oRequestModel.addBatchChangeOperations(aBatchChanges);
        oRequestModel.submitBatch(function (oData, oResponse) {
            // Success callback function
            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                sap.m.MessageBox.success("Skills Deleted Successfully");
                that._initializeAsync();
            }
            // Handle the response data
        }, function (oError) {
            // Error callback function
            sap.m.MessageBox.waning("failed");
            // Handle the error
        });


    },

    
    //the properties of the selected row from the tree table are set into editable mode
    onRowIndustrySelect: function () {

        var oTable = this.getView().byId("TreeTableIndustries");
        var aIndices = oTable.getSelectedIndices();
        let oModel = oTable.getModel();
        let oTreeTable_fetched_data = oModel.getProperty("/industry_cluster_array");

        // for initially setting all the tree table rows to non-editable mode
        for (let i = 0; i < oTreeTable_fetched_data.length; i++) {
            for (let j = 0; j < oTreeTable_fetched_data[i].employee_industries.length; j++) {
                var sPath = "/industry_cluster_array/" + i + "/employee_industries/" + j + "/bEditable";
                oModel.setProperty(sPath, false);
            }
        }

        //loop for finding and settting editable true to that specific skill
        for (let i = 0; i < aIndices.length; i++) {

            var tableContext = oTable.getContextByIndex(aIndices[i]);

            var sPath = tableContext.getPath() + "/bEditable";
            if (sPath.length > 30) {
                oModel.setProperty(sPath, true);
            }
        }
    },

    // Updating all the changes made in the skill tree table to the database
    onSaveIndustryChanges: function () {

        var oTable = this.getView().byId("TreeTableIndustries");
        var aIndices = oTable.getSelectedIndices();

        if (aIndices.length !== 0) {
            let oTableModel = oTable.getModel();
            var that = this;

            var oMainModel = this.getView().getModel("EmployeeModel");
            var iPS_NO = oMainModel.getData().PS_NO;

            var sBatchPath = "", aBatchChanges = [];

            var url = this.getOwnerComponent().getModel().sServiceUrl;
            var oRequestModel = new sap.ui.model.odata.ODataModel(url);

            // payload for updation into the employee_skill_detail
            var oUpdate_Industries_Payload =
            {
                "empl_PS_NO": iPS_NO,
                "industry_cluster": "",
                "industry_type": "",
                "exp_years": 0,
                "exp_months": 0,
                "bEditable": false,
            }

            // loop for capturing the selected records from table  
            for (var i = 0; i < aIndices.length; i++) {

                var tableContext = oTable.getContextByIndex(aIndices[i]);

                var sIndustryPath = tableContext.getPath();
                var sClusterPath = sIndustryPath.slice(0, -22);

                if (sIndustryPath.length > 30) {
                    
                    var oData = oTableModel.getProperty(sIndustryPath);
                    var sIndustry_Cluster = oTableModel.getProperty(sClusterPath).clust_industry;

                    oUpdate_Industries_Payload =
                    {
                        "empl_PS_NO": iPS_NO,
                        "industry_cluster": sIndustry_Cluster,
                        "industry_type": oData.industry_type,
                        "exp_years": oData.exp_years,
                        "exp_months": oData.exp_months,
                        "bEditable": false,
                    }

                    var sID = encodeURIComponent(oData.ID);

                    //pushing element into batchchange array along with the update operation
                    sBatchPath = "/Employee_Industries_Experience(" + sID + ")";
                    aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Industries_Payload));

                }
            }

            // Update Database Call
            oRequestModel.addBatchChangeOperations(aBatchChanges);
            oRequestModel.submitBatch(function (oData, oResponse) {
                // Success callback function - changes saved to database
                if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                    sap.m.MessageBox.success("Skills Updated Successfully");
                    oTable.clearSelection();
                    that._initializeAsync();
                }
                // Handle the response data
            }, function (oError) {
                // Error callback function
                sap.m.MessageBox.waning("failed");
                // Handle the error
            });
        }
        else {
            MessageBox.information(" No skill(s) selected, Please select some skills");
        }

    },

    // canceling the changes we made, can be done only before saving it to the database
    onCancelIndustryChanges: function () {

        var that = this;

        MessageBox.warning("Are you sure you want to discard the changes?", {
            title: "Discard Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that._initializeAsync();
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });

    },
//---------------------------------------------------------------------------------------------------------------------//



//----------------------------------------------Customer Experience----------------------------------------------------------//


onAddCustomerExperience: function () {

    if (!this.oDialog) {
        this.loadFragment({
            name: "myskillsapp.fragment.Customer"
        }).then(function (odialog) {
            this.oDialog = odialog;
            this.oDialog.open();

        }.bind(this))
    } else {
        this.oDialog.open();
    }

},

handleSaveCustomerExperience: function (oEvent) {

    var oModel = this.getView().getModel("EmployeeModel");
    let oEmpl_customer_fetched_data = oModel.getProperty("/employee_customer_experience/results");

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    var iPS_NO, sBatchPath;
    var that = this;
    let oAdd_Customer_Payload = {};
    var aBatchChanges = [];
    let bCustomerNotPresent = true;
    let changesmade = false;

    iPS_NO = oModel.getData().PS_NO;

    // data of skills selected from the skills select dialog  //
    var oComboBox = this.getView().byId("comboBoxCustomer");
    var sCustomer_name = oComboBox.getValue();


    if (sCustomer_name) {

        for (let j = 0; j < oEmpl_customer_fetched_data.length; j++) {
            // if selected product is already present
            if (sCustomer_name === oEmpl_customer_fetched_data[j].customer_name) {

                bCustomerNotPresent = false;
                break;
            }
        }

        // if selected skill not present
        if (bCustomerNotPresent) {

            iPS_NO = parseInt(iPS_NO);

            //payload for posting new skill into the employee_skill_detail
            oAdd_Customer_Payload =
            {
                "empl_PS_NO": iPS_NO,
                "customer_name": sCustomer_name,
                "exp_years": 0,
                "exp_months": 0,
                "bEditable": false
            }

            // pushing element into batchchange array along with the POST operation
            sBatchPath = "/Employee_Customer_Experience";
            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Customer_Payload));
            changesmade = true;
        }
        // if selected skill already present
        else {
            MessageBox.alert(" Selected product(s): " + sCustomer_name + " already present");
        }

        // if skills are added
        if (changesmade) {

            oRequestModel.addBatchChangeOperations(aBatchChanges);
            oRequestModel.submitBatch(function (oData, oResponse) {
                // Success callback function
                if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                    sap.m.MessageBox.success("Customer experience added successfully");
                    that._initializeAsync();
                }
                // Handle the response data
            }, function (oError) {
                // Error callback function
                sap.m.MessageBox.waning("failed");
                // Handle the error
            });
        }

    }

    //if no skills were selected from the skills select dialog
    else {

        MessageBox.information(" No Customer selected, Please select One", {
            title: "Select Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that.onAddCustomerExperience();
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });
    }


},

onDeleteCustomer: function () {

    var that = this;
    var oModel = this.getView().getModel("EmployeeModel");
    var iPS_NO = oModel.getProperty("/PS_NO");

    var oTable = this.getView().byId("tableCustomerExperience");
    var aIndices = oTable.getSelectedItems();            //array indices of the selected records


    if (aIndices.length > 0) {

        MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
            title: "Delete Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that.handleDeleteCustomer(aIndices);
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });
    }
    else {
        MessageBox.information("No record(s) selected");
    }
},

// deleting the selected existing skills from the database
handleDeleteCustomer: function (aIndices) {

    var sBatchPath = "", aBatchChanges = [];

    var that = this;

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    // loop for finding that specific skill in the respective cluster
    for (var i = aIndices.length - 1; i >= 0; i--) {

        // fetching the UUID of the selected record
        var sID = aIndices[i].getBindingContext("EmployeeModel").getProperty("ID");

        sID = encodeURIComponent(sID);

        // pushing element into batchchange array along with the delete operation
        sBatchPath = "/Employee_Customer_Experience(" + sID + ")";
        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));

    }
    oRequestModel.addBatchChangeOperations(aBatchChanges);
    oRequestModel.submitBatch(function (oData, oResponse) {
        // Success callback function
        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
            sap.m.MessageBox.success("Customer experience removed successfully");
            that._initializeAsync();
        }
        // Handle the response data
    }, function (oError) {
        // Error callback function
        sap.m.MessageBox.waning("failed");
        // Handle the error
    });


},


//the properties of the selected row from the tree table are set into editable mode
onRowCustomerSelect: function (oEvent) {

    var oTable = this.getView().byId("tableCustomerExperience");
    var aIndices = oTable.getSelectedItems();

    let oModel = this.getView().getModel("EmployeeModel");
    let oTable_fetched_data = oModel.getProperty("/employee_customer_experience/results");

    // for initially setting all the table rows to non-editable mode
    for (let i = 0; i < oTable_fetched_data.length; i++) {
        var sPath = "/employee_customer_experience/results/" + i + "/bEditable";
        oModel.setProperty(sPath, false);
    }

    //loop for finding and settting editable true to that specific skill
    for (let i = 0; i < aIndices.length; i++) {
        aIndices[i].getBindingContext("EmployeeModel").setProperty("bEditable", true);
    }
},

// Updating all the changes made in the skill tree table to the database
onSaveCustomerChanges: function () {

    var oTable = this.getView().byId("tableCustomerExperience");
    var aIndices = oTable.getSelectedItems();

    var that = this;

    var oMainModel = this.getView().getModel("EmployeeModel");
    var iPS_NO = oMainModel.getData().PS_NO;

    var sBatchPath = "", aBatchChanges = [];

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    // payload for updation into the employee_skill_detail
    var oUpdate_Customer_Payload =
    {
        "empl_PS_NO": iPS_NO,
        "customer_name": "",
        "exp_years": 0,
        "exp_months": 0,
        "bEditable": false,
    }

    if (aIndices.length !== 0) {

        // loop for capturing the selected records from table  
        for (var i = 0; i < aIndices.length; i++) {

            var oData = aIndices[i].getBindingContext("EmployeeModel").getObject();

            oUpdate_Customer_Payload =
            {
                "empl_PS_NO": iPS_NO,
                "customer_name": oData.customer_name,
                "exp_years": oData.exp_years,
                "exp_months": oData.exp_months,
                "bEditable": false,
            }

            var sID = encodeURIComponent(oData.ID);

            //pushing element into batchchange array along with the update operation
            sBatchPath = "/Employee_Customer_Experience(" + sID + ")";
            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Customer_Payload));

        }

        // Update Database Call
        oRequestModel.addBatchChangeOperations(aBatchChanges);
        oRequestModel.submitBatch(function (oData, oResponse) {
            // Success callback function - changes saved to database
            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                sap.m.MessageBox.success("Customer(s) experience updated successfully");
                oTable.removeSelections();
                that._initializeAsync();
                that.handleClose();
            }
            // Handle the response data
        }, function (oError) {
            // Error callback function
            sap.m.MessageBox.waning("failed");
            // Handle the error
        });

    }
    else {
        MessageBox.information("No Customer(s) selected, Please select some if you want to Update");
    }

},

// canceling the changes we made, can be done only before saving it to the database
onCancelCustomerChanges: function () {

    var that = this;

    MessageBox.warning("Are you sure you want to discard the changes?", {
        title: "Discard Record(s)",
        onClose: function (sAction) {
            if (sAction === 'OK') {
                that._initializeAsync();
                that.handleClose();
            }
        }.bind(this),
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        emphasizedAction: sap.m.MessageBox.Action.OK,
    });

},

//---------------------------------------------------------------------------------------------------------------------//



//  --------------------------------------------------------Product Experience-------------------------------------------------------------------//


/////////////////////////////////////////////////////////////// PRODUCT TAB ////////////////////////////////////////////////////////////


onAddProductExperience: function () {

    if (!this.oDialog) {
        this.loadFragment({
            name: "myskillsapp.fragment.AddProductExperience"
        }).then(function (odialog) {
            this.oDialog = odialog;
            this.oDialog.open();

        }.bind(this))
    } else {
        this.oDialog.open();
    }

},

// Filter for Searching the Industry Type in the select dialog
handleSearchProduct: function (oEvent) {
    var sValue = oEvent.getParameter("value");

    var InputFilter = new Filter({
        filters: [

            new Filter({
                path: 'product_name',
                operator: FilterOperator.Contains,
                value1: sValue,
                caseSensitive: false
            })
        ],
        and: false
    });

    var oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([InputFilter]);
},


// Saving the Industry Type selected through the select dialog into database
handleSaveProductExperience: function (oEvent) {

    var oModel = this.getView().getModel("EmployeeModel");
    let oEmpl_product_fetched_data = oModel.getProperty("/employee_product_experience/results");

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    var iPS_NO, sBatchPath;
    var that = this;
    let oAdd_Product_Payload = {};
    var aBatchChanges = [];
    let aSelected_Product_present = [];
    let bProductNotPresent = true;
    let changesmade = false;
    let alreadypresent = false;

    iPS_NO = oModel.getData().PS_NO;

    // data of skills selected from the skills select dialog
    var aContexts = oEvent.getParameter("selectedContexts");
    let aSelected_data = aContexts.map(function (oContext) { return oContext.getObject(); });


    if (aSelected_data.length > 0) {

        // loop for checking as well as adding the skills selected from the select dialog
        for (let i = 0; i < aSelected_data.length; i++, bProductNotPresent = true) {

            // loop for checking presence of cluster and skill
            for (let j = 0; j < oEmpl_product_fetched_data.length; j++) {
                // if selected product is already present
                if (aSelected_data[i].product_name === oEmpl_product_fetched_data[j].product_name) {

                    aSelected_Product_present.push(aSelected_data[i].product_name);
                    bProductNotPresent = false;
                    alreadypresent = true;
                    break;

                }
            }

            // if selected skill not present
            if (bProductNotPresent) {

                iPS_NO = parseInt(iPS_NO);

                //payload for posting new skill into the employee_skill_detail
                oAdd_Product_Payload =
                {
                    "empl_PS_NO": iPS_NO,
                    "product_name": aSelected_data[i].product_name,
                    "exp_years": 0,
                    "exp_months": 0,
                    "bEditable": false
                }

                // pushing element into batchchange array along with the POST operation
                sBatchPath = "/Employee_Product_Experience";
                aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Product_Payload));
                changesmade = true;
            }

        }

    }
    // if selected skill already present
    if (alreadypresent) {
        MessageBox.alert(" Selected product(s): " + aSelected_Product_present.join(", ") + " already present");
    }
    // if skills are added
    if (changesmade) {

        oRequestModel.addBatchChangeOperations(aBatchChanges);
        oRequestModel.submitBatch(function (oData, oResponse) {
            // Success callback function
            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                sap.m.MessageBox.success("Product experience added successfully");
                that._initializeAsync();
                that.handleClosehandle();
            }
            // Handle the response data
        }, function (oError) {
            // Error callback function
            sap.m.MessageBox.waning("failed");
            // Handle the error
        });
    }
    //if no skills were selected from the skills select dialog
    else {

        MessageBox.information(" No product(s) selected, Please select some skills", {
            title: "Select Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that.onAddProductExperience();
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });
    }


},

onDeleteProduct: function () {

    var that = this;
    var oModel = this.getView().getModel("EmployeeModel");
    var iPS_NO = oModel.getProperty("/PS_NO");

    var oTable = this.getView().byId("tableProductExperience");
    var aIndices = oTable.getSelectedItems();            //array indices of the selected records


    if (aIndices.length > 0) {

        MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
            title: "Delete Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that.handleDeleteProduct(aIndices, iPS_NO);
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });
    }
    else {
        MessageBox.information("No record(s) selected");
    }
},

// deleting the selected existing skills from the database
handleDeleteProduct: function (aIndices, PS_NO) {

    var sBatchPath = "", aBatchChanges = [];
    var iPS_NO = parseInt(PS_NO);

    var that = this;

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    // loop for finding that specific skill in the respective cluster
    for (var i = aIndices.length - 1; i >= 0; i--) {

        // fetching the UUID of the selected record
        var sID = aIndices[i].getBindingContext("EmployeeModel").getProperty("ID");

        sID = encodeURIComponent(sID);

        // pushing element into batchchange array along with the delete operation
        sBatchPath = "/Employee_Product_Experience(" + sID + ")";
        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));

    }
    oRequestModel.addBatchChangeOperations(aBatchChanges);
    oRequestModel.submitBatch(function (oData, oResponse) {
        // Success callback function
        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
            sap.m.MessageBox.success("Product experience removed successfully");
            that._initializeAsync();
        }
        // Handle the response data
    }, function (oError) {
        // Error callback function
        sap.m.MessageBox.waning("failed");
        // Handle the error
    });


},


//the properties of the selected row from the tree table are set into editable mode
onRowProductSelect: function (oEvent) {

    var oTable = this.getView().byId("tableProductExperience");
    var aIndices = oTable.getSelectedItems();

    let oModel = this.getView().getModel("EmployeeModel");
    let oTable_fetched_data = oModel.getProperty("/employee_product_experience/results");

    // for initially setting all the table rows to non-editable mode
    for (let i = 0; i < oTable_fetched_data.length; i++) {
        var sPath = "/employee_product_experience/results/" + i + "/bEditable";
        oModel.setProperty(sPath, false);
    }

    //loop for finding and settting editable true to that specific skill
    for (let i = 0; i < aIndices.length; i++) {
        aIndices[i].getBindingContext("EmployeeModel").setProperty("bEditable", true);
    }
},

// Updating all the changes made in the skill tree table to the database
onSaveProductChanges: function () {

    var oTable = this.getView().byId("tableProductExperience");
    var aIndices = oTable.getSelectedItems();

    if (aIndices.length !== 0) {
        var that = this;

        var oMainModel = this.getView().getModel("EmployeeModel");
        var iPS_NO = oMainModel.getData().PS_NO;

        var sBatchPath = "", aBatchChanges = [];

        var url = this.getOwnerComponent().getModel().sServiceUrl;
        var oRequestModel = new sap.ui.model.odata.ODataModel(url);

        // payload for updation into the employee_skill_detail
        var oUpdate_Product_Payload =
        {
            "empl_PS_NO": iPS_NO,
            "product_name": "",
            "exp_years": 0,
            "exp_months": 0,
            "bEditable": false,
        }

        // loop for capturing the selected records from table  
        for (var i = 0; i < aIndices.length; i++) {

            var oData = aIndices[i].getBindingContext("EmployeeModel").getObject();

            oUpdate_Product_Payload =
            {
                "empl_PS_NO": iPS_NO,
                "product_name": oData.product_name,
                "exp_years": oData.exp_years,
                "exp_months": oData.exp_months,
                "bEditable": false,
            }

            var sID = encodeURIComponent(oData.ID);

            //pushing element into batchchange array along with the update operation
            sBatchPath = "/Employee_Product_Experience(" + sID + ")";
            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Product_Payload));

        }

        // Update Database Call
        oRequestModel.addBatchChangeOperations(aBatchChanges);
        oRequestModel.submitBatch(function (oData, oResponse) {
            // Success callback function - changes saved to database
            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                sap.m.MessageBox.success("Product(s) experience updated successfully");
                oTable.removeSelections();
                that._initializeAsync();
            }
            // Handle the response data
        }, function (oError) {
            // Error callback function
            sap.m.MessageBox.waning("failed");
            // Handle the error
        });
    }
    else {
        MessageBox.information(" No Product(s) selected, Please select some skills");
    }

},

// canceling the changes we made, can be done only before saving it to the database
onCancelProductChanges: function () {

    var that = this;

    MessageBox.warning("Are you sure you want to discard the changes?", {
        title: "Discard Record(s)",
        onClose: function (sAction) {
            if (sAction === 'OK') {
                that._initializeAsync();
            }
        }.bind(this),
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        emphasizedAction: sap.m.MessageBox.Action.OK,
    });

},



//  -------------------------------------------------------------------------------------------------------------------//



//  ------------------------------Language Experience-------------------------------------------------------------------//


/////////////////////////////////////////////////////////// LANGUAGE TAB ////////////////////////////////////////////////////////////


onAddlanguageExperience: function () {

    if (!this.oDialog) {
        this.loadFragment({
            name: "myskillsapp.fragment.AddLanguageExperience"
        }).then(function (odialog) {
            this.oDialog = odialog;
            this.oDialog.open();

        }.bind(this))
    } else {
        this.oDialog.open();
    }

},

// Filter for Searching the Industry Type in the select dialog
handleSearchLanguage: function (oEvent) {
    var sValue = oEvent.getParameter("value");

    var InputFilter = new Filter({
        filters: [

            new Filter({
                path: 'language',
                operator: FilterOperator.Contains,
                value1: sValue,
                caseSensitive: false
            })
        ],
        and: false
    });

    var oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([InputFilter]);
},


// Saving the Industry Type selected through the select dialog into database
handleSaveLanguageExperience: function (oEvent) {

    var oModel = this.getView().getModel("EmployeeModel");
    let oEmpl_language_fetched_data = oModel.getProperty("/employee_language_experience/results");

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    var iPS_NO, sBatchPath;
    var that = this;
    let oAdd_Language_Payload = {};
    var aBatchChanges = [];
    let aSelected_Language_present = [];
    let bLanguageNotPresent = true;
    let changesmade = false;
    let alreadypresent = false;

    iPS_NO = oModel.getData().PS_NO;

    // data of skills selected from the skills select dialog
    var aContexts = oEvent.getParameter("selectedContexts");
    let aSelected_data = aContexts.map(function (oContext) { return oContext.getObject(); });


    if (aSelected_data.length > 0) {

        // loop for checking as well as adding the skills selected from the select dialog
        for (let i = 0; i < aSelected_data.length; i++, bLanguageNotPresent = true) {

            if (oEmpl_language_fetched_data) {

                // loop for checking presence of cluster and skill
                for (let j = 0; j < oEmpl_language_fetched_data.length; j++) {

                    // if selected product is already present
                    if (aSelected_data[i].language === oEmpl_language_fetched_data[j].language) {

                        aSelected_Language_present.push(aSelected_data[i].language);
                        bLanguageNotPresent = false;
                        alreadypresent = true;
                        break;

                    }
                }
            }

            // if selected skill not present
            if (bLanguageNotPresent) {

                iPS_NO = parseInt(iPS_NO);

                //payload for posting new skill into the employee_skill_detail
                oAdd_Language_Payload =
                {
                    "empl_PS_NO": iPS_NO,
                    "language": aSelected_data[i].language,
                    "proficiency_rating": 0,
                    "bEditable": false
                }

                // pushing element into batchchange array along with the POST operation
                sBatchPath = "/Employee_Language_Experience";
                aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Language_Payload));
                changesmade = true;
            }

        }

    }
    // if selected skill already present
    if (alreadypresent) {
        MessageBox.alert(" Selected Language(s): " + aSelected_Language_present.join(", ") + " already present");
    }
    // if skills are added
    if (changesmade) {

        oRequestModel.addBatchChangeOperations(aBatchChanges);
        oRequestModel.submitBatch(function (oData, oResponse) {
            // Success callback function
            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                sap.m.MessageBox.success("Language Added Successfully");
                that._initializeAsync();
                that.handleClose();
            }
            // Handle the response data
        }, function (oError) {
            // Error callback function
            sap.m.MessageBox.waning("failed");
            // Handle the error
        });
    }
    //if no skills were selected from the skills select dialog
    else {

        MessageBox.information(" No Language(s) selected, Please select some skills", {
            title: "Select Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that.onAddlanguageExperience();
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });
    }


},

onDeletelanguage: function () {

    var that = this;

    var oTable = this.getView().byId("tableLanguageProfeciency");
    var aIndices = oTable.getSelectedItems();            //array indices of the selected records

    if (aIndices.length > 0) {

        MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
            title: "Delete Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that.handleDeleteLanguage(aIndices);
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });
    }
    else {
        MessageBox.information("No record(s) selected");
    }
},

// deleting the selected existing skills from the database
handleDeleteLanguage: function (aIndices) {

    var sBatchPath = "", aBatchChanges = [];

    var that = this;

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    // loop for finding that specific skill in the respective cluster
    for (var i = aIndices.length - 1; i >= 0; i--) {

        // fetching the UUID of the selected record
        var sID = aIndices[i].getBindingContext("EmployeeModel").getProperty("ID");

        sID = encodeURIComponent(sID);

        // pushing element into batchchange array along with the delete operation
        sBatchPath = "/Employee_Language_Experience(" + sID + ")";
        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));

    }
    oRequestModel.addBatchChangeOperations(aBatchChanges);
    oRequestModel.submitBatch(function (oData, oResponse) {
        // Success callback function
        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
            sap.m.MessageBox.success("Language removed successfully");
            that._initializeAsync();
        }
        // Handle the response data
    }, function (oError) {
        // Error callback function
        sap.m.MessageBox.waning("failed");
        // Handle the error
    });


},


//the properties of the selected row from the tree table are set into editable mode
onRowlanguageSelect: function (oEvent) {

    var oTable = this.getView().byId("tableLanguageProfeciency");
    var aIndices = oTable.getSelectedItems();

    let oModel = this.getView().getModel("EmployeeModel");
    let oTable_fetched_data = oModel.getProperty("/employee_language_experience/results");

    // for initially setting all the table rows to non-editable mode
    for (let i = 0; i < oTable_fetched_data.length; i++) {
        var sPath = "/employee_language_experience/results/" + i + "/bEditable";
        oModel.setProperty(sPath, false);
    }

    //loop for finding and settting editable true to that specific skill
    for (let i = 0; i < aIndices.length; i++) {
        aIndices[i].getBindingContext("EmployeeModel").setProperty("bEditable", true);
    }
},

// Updating all the changes made in the skill tree table to the database
onSavelanguageChanges: function () {

    var oTable = this.getView().byId("tableLanguageProfeciency");
    var aIndices = oTable.getSelectedItems();

    if (aIndices.length !== 0) {
        var that = this;

        var oMainModel = this.getView().getModel("EmployeeModel");
        var iPS_NO = oMainModel.getData().PS_NO;

        var sBatchPath = "", aBatchChanges = [];

        var url = this.getOwnerComponent().getModel().sServiceUrl;
        var oRequestModel = new sap.ui.model.odata.ODataModel(url);

        // payload for updation into the employee_skill_detail
        var oUpdate_Product_Payload =
        {
            "empl_PS_NO": iPS_NO,
            "language": "",
            "proficiency_rating":0,
            "bEditable": false,
        }

        // loop for capturing the selected records from table  
        for (var i = 0; i < aIndices.length; i++) {

            var oData = aIndices[i].getBindingContext("EmployeeModel").getObject();

            oUpdate_Product_Payload =
            {
                "empl_PS_NO": iPS_NO,
                "language": oData.language,
                "proficiency_rating": oData.proficiency_rating,
                "bEditable": false,
            }

            var sID = encodeURIComponent(oData.ID);

            //pushing element into batchchange array along with the update operation
            sBatchPath = "/Employee_Language_Experience(" + sID + ")";
            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Product_Payload));

        }

        // Update Database Call
        oRequestModel.addBatchChangeOperations(aBatchChanges);
        oRequestModel.submitBatch(function (oData, oResponse) {
            // Success callback function - changes saved to database
            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                sap.m.MessageBox.success("Language(s) experience updated successfully");
                oTable.removeSelections();
                that._initializeAsync();
            }
            // Handle the response data
        }, function (oError) {
            // Error callback function
            sap.m.MessageBox.waning("failed");
            // Handle the error
        });
    }
    else {
        MessageBox.information(" No Language(s) selected, Please select some skills");
    }

},

// canceling the changes we made, can be done only before saving it to the database
onCancelLanguageChanges: function () {

    var that = this;

    MessageBox.warning("Are you sure you want to discard the changes?", {
        title: "Discard Record(s)",
        onClose: function (sAction) {
            if (sAction === 'OK') {
                that._initializeAsync();
            }
        }.bind(this),
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        emphasizedAction: sap.m.MessageBox.Action.OK,
    });

},


//  --------------------------------------------------------------------------------------------------------------------//




//  ------------------------------Country Experience-------------------------------------------------------------------//



/////////////////////////////////////////////////////////// COUNTRY TAB ////////////////////////////////////////////////////////////


onAddCountryExperience: function () {

    if (!this.oDialog) {
        this.loadFragment({
            name: "myskillsapp.fragment.AddCountryExperience"
        }).then(function (odialog) {
            this.oDialog = odialog;
            this.oDialog.open();

        }.bind(this))
    } else {
        this.oDialog.open();
    }

},

// Filter for Searching the Industry Type in the select dialog
handleSearchCountry: function (oEvent) {
    var sValue = oEvent.getParameter("value");

    var InputFilter = new Filter({
        filters: [

            new Filter({
                path: 'country_name',
                operator: FilterOperator.Contains,
                value1: sValue,
                caseSensitive: false
            })
        ],
        and: false
    });

    var oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([InputFilter]);
},


// Saving the Industry Type selected through the select dialog into database
handleSaveCountryExperience: function (oEvent) {

    var oModel = this.getView().getModel("EmployeeModel");
    let oEmpl_country_fetched_data = oModel.getProperty("/employee_country_experience/results");

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    var iPS_NO, sBatchPath;
    var that = this;
    let oAdd_Country_Payload = {};
    var aBatchChanges = [];
    let aSelected_Country_present = [];
    let bCountryNotPresent = true;
    let changesmade = false;
    let alreadypresent = false;

    iPS_NO = oModel.getData().PS_NO;

    // data of skills selected from the skills select dialog
    var aContexts = oEvent.getParameter("selectedContexts");
    let aSelected_data = aContexts.map(function (oContext) { return oContext.getObject(); });


    if (aSelected_data.length > 0) {

        // loop for checking as well as adding the skills selected from the select dialog
        for (let i = 0; i < aSelected_data.length; i++, bCountryNotPresent = true) {

            if (oEmpl_country_fetched_data) {

                // loop for checking presence of cluster and skill
                for (let j = 0; j < oEmpl_country_fetched_data.length; j++) {

                    // if selected product is already present
                    if (aSelected_data[i].country_name === oEmpl_country_fetched_data[j].country_name) {

                        aSelected_Country_present.push(aSelected_data[i].country_name);
                        bCountryNotPresent = false;
                        alreadypresent = true;
                        break;

                    }
                }
            }

            // if selected skill not present
            if (bCountryNotPresent) {

                iPS_NO = parseInt(iPS_NO);

                //payload for posting new skill into the employee_skill_detail
                oAdd_Country_Payload =
                {
                    "empl_PS_NO": iPS_NO,
                    "country_name": aSelected_data[i].country_name,
                    "country_flag": aSelected_data[i].country_flag,
                    "exp_years": 0,
                    "exp_months": 0,
                    "bEditable": false
                }

                // pushing element into batchchange array along with the POST operation
                sBatchPath = "/Employee_Country_Experience";
                aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Country_Payload));
                changesmade = true;
            }

        }

    }
    // if selected skill already present
    if (alreadypresent) {
        MessageBox.alert(" Selected Country(s): " + aSelected_Country_present.join(", ") + " already present");
    }
    // if skills are added
    if (changesmade) {

        oRequestModel.addBatchChangeOperations(aBatchChanges);
        oRequestModel.submitBatch(function (oData, oResponse) {
            // Success callback function
            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                sap.m.MessageBox.success("Country Added Successfully");
                that._initializeAsync();
                that.handleClose();
            }
            // Handle the response data
        }, function (oError) {
            // Error callback function
            sap.m.MessageBox.waning("failed");
            // Handle the error
        });
    }
    //if no skills were selected from the skills select dialog
    else {

        MessageBox.information(" No Country(s) selected, Please select some skills", {
            title: "Select Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that.onAddProductExperience();
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });
    }


},

onDeleteCountry: function () {

    var that = this;

    var oTable = this.getView().byId("tableCountryExperience");
    var aIndices = oTable.getSelectedItems();            //array indices of the selected records


    if (aIndices.length > 0) {

        MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
            title: "Delete Record(s)",
            onClose: function (sAction) {
                if (sAction === 'OK') {
                    that.handleDeleteCountry(aIndices);
                }
            }.bind(this),
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            emphasizedAction: sap.m.MessageBox.Action.OK,
        });
    }
    else {
        MessageBox.information("No record(s) selected");
    }
},

// deleting the selected existing skills from the database
handleDeleteCountry: function (aIndices) {

    var sBatchPath = "", aBatchChanges = [];

    var that = this;

    var url = this.getOwnerComponent().getModel().sServiceUrl;
    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

    // loop for finding that specific skill in the respective cluster
    for (var i = aIndices.length - 1; i >= 0; i--) {

        // fetching the UUID of the selected record
        var sID = aIndices[i].getBindingContext("EmployeeModel").getProperty("ID");

        sID = encodeURIComponent(sID);

        // pushing element into batchchange array along with the delete operation
        sBatchPath = "/Employee_Country_Experience(" + sID + ")";
        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));

    }
    oRequestModel.addBatchChangeOperations(aBatchChanges);
    oRequestModel.submitBatch(function (oData, oResponse) {
        // Success callback function
        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
            sap.m.MessageBox.success("Country experience removed successfully");
            that._initializeAsync();
        }
        // Handle the response data
    }, function (oError) {
        // Error callback function
        sap.m.MessageBox.waning("failed");
        // Handle the error
    });


},


//the properties of the selected row from the tree table are set into editable mode
onRowCountrySelect: function (oEvent) {

    var oTable = this.getView().byId("tableCountryExperience");
    var aIndices = oTable.getSelectedItems();

    let oModel = this.getView().getModel("EmployeeModel");
    let oTable_fetched_data = oModel.getProperty("/employee_country_experience/results");

    // for initially setting all the table rows to non-editable mode
    for (let i = 0; i < oTable_fetched_data.length; i++) {
        var sPath = "/employee_country_experience/results/" + i + "/bEditable";
        oModel.setProperty(sPath, false);
    }

    //loop for finding and settting editable true to that specific skill
    for (let i = 0; i < aIndices.length; i++) {
        aIndices[i].getBindingContext("EmployeeModel").setProperty("bEditable", true);
    }
},

// Updating all the changes made in the skill tree table to the database
onSaveCountryChanges: function () {

    var oTable = this.getView().byId("tableCountryExperience");
    var aIndices = oTable.getSelectedItems();

    if (aIndices.length !== 0) {
        var that = this;

        var oMainModel = this.getView().getModel("EmployeeModel");
        var iPS_NO = oMainModel.getData().PS_NO;

        var sBatchPath = "", aBatchChanges = [];

        var url = this.getOwnerComponent().getModel().sServiceUrl;
        var oRequestModel = new sap.ui.model.odata.ODataModel(url);

        // payload for updation into the employee_skill_detail
        var oUpdate_Product_Payload =
        {
            "empl_PS_NO": iPS_NO,
            "country_name": "",
            "country_flag":"",
            "exp_years": 0,
            "exp_months": 0,
            "bEditable": false,
        }

        // loop for capturing the selected records from table  
        for (var i = 0; i < aIndices.length; i++) {

            var oData = aIndices[i].getBindingContext("EmployeeModel").getObject();

            oUpdate_Product_Payload =
            {
                "empl_PS_NO": iPS_NO,
                "country_name": oData.country_name,
                "country_flag": oData.country_flag,
                "exp_years": oData.exp_years,
                "exp_months": oData.exp_months,
                "bEditable": false,
            }

            var sID = encodeURIComponent(oData.ID);

            //pushing element into batchchange array along with the update operation
            sBatchPath = "/Employee_Country_Experience(" + sID + ")";
            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Product_Payload));

        }

        // Update Database Call
        oRequestModel.addBatchChangeOperations(aBatchChanges);
        oRequestModel.submitBatch(function (oData, oResponse) {
            // Success callback function - changes saved to database
            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                sap.m.MessageBox.success("Country(s) experience updated successfully");
                oTable.removeSelections();
                that._initializeAsync();
            }
            // Handle the response data
        }, function (oError) {
            // Error callback function
            sap.m.MessageBox.waning("failed");
            // Handle the error
        });
    }
    else {
        MessageBox.information(" No Country(s) selected, Please select some skills");
    }

},

// canceling the changes we made, can be done only before saving it to the database
onCancelCountryChanges: function () {

    var that = this;

    MessageBox.warning("Are you sure you want to discard the changes?", {
        title: "Discard Record(s)",
        onClose: function (sAction) {
            if (sAction === 'OK') {
                that._initializeAsync();
            }
        }.bind(this),
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        emphasizedAction: sap.m.MessageBox.Action.OK,
    });

},

//  -------------------------------------------------------------------------------------------------------------------//





//----------------------------------------------------------------------------------------------------------------------//
//                                               CV TAB
//----------------------------------------------------------------------------------------------------------------------//
    

   
workExperienceList: function(){
    return new Promise((resolve, reject) => {
        var oWorkModel = this.getView().getModel("EmployeeModel");
        let oEmpl_Wrk_data = oWorkModel.getProperty("/employee_cv_experience_data");
        let WrkexpData=oEmpl_Wrk_data.results;
        console.log('employee work experience ',WrkexpData);

        var oWorkJSONdata={
            "workListArray":[]
        } 
        
        WrkexpData.forEach(function (item) {
                //console.log('cv item 1',item)
                let exRow={
                    'id':item.ID,
                    'company_name':item.company_name,
                    'role':item.role,
                    'domain':item.domain,
                    'startDate':item.startDate,//
                    'endDate':(item.endDate !="")?item.endDate: "Still Working",//
                    'bEditable':false
                   
                }
                oWorkJSONdata.workListArray.push(exRow);
                
            });
            console.log('experienceData data',oWorkJSONdata);
            var oWrkTreeModel = new sap.ui.model.json.JSONModel(oWorkJSONdata);

                // setting the treetable model with created JSONModel
                var oWrkTreeTable = this.getView().byId("workTreeTable");
                oWrkTreeTable.setModel(oWrkTreeModel);
                oWrkTreeTable.bindRows({
                    path: "/workListArray"
                });
        resolve();
    })
   },

   onAddWorkExpDialog: function () {
    
    var dialogwrkID = this.getView().byId("wrkadd");
    if (!this.oDialog && dialogwrkID) {
        this.loadFragment({
            name: "myskillsapp.fragment.AddWorkExp"
        }).then(function (odialog) {
            
            this.oDialog = odialog;
            this.oDialog.open();

        }.bind(this))
    } else {
        this.oDialog.open();
    }

},
onEditWorkExpDialog:function(){
  
    var dialogwrkID = this.getView().byId("wrkedit");
    if (!this.oDialog && dialogwrkID) {
        this.loadFragment({
            name: "myskillsapp.fragment.EditWorkExp"
        }).then(function (odialog) {
           
           
            var oModel = this.getView().getModel("EmployeeModel");
              
            var owrkTable = this.getView().byId("workTreeTable");
            var aIndices = owrkTable.getSelectedIndices();
       
            var owrkSelectItem=owrkTable.getContextByIndex(aIndices[0]);
            var owrkObjShow = owrkSelectItem.getObject();
            console.log('owrkObjShow ==>',owrkObjShow);
            var editJobId=this.getView().byId("orgid");
            editJobId.setValue(owrkObjShow.id)
            var orgName=this.getView().byId("editorg");
            orgName.setValue(owrkObjShow.company_name);
            var desigName=this.getView().byId("editdesig");//role domain startDate endDate
            desigName.setValue(owrkObjShow.role);
            var profileDetail=this.getView().byId("editjobprofile");
            profileDetail.setValue(owrkObjShow.domain);
            var editJobStart=this.getView().byId("DP2");
            editJobStart.setValue(owrkObjShow.startDate);
            var editJobEnd=this.getView().byId("DP5");
            if(owrkObjShow.endDate == "Still Working"){
                editJobEnd.setValue('');
            }else{
                editJobEnd.setValue(owrkObjShow.endDate);
            }
            


            this.oDialog = odialog;
            this.oDialog.open();

        }.bind(this))
    } else {
        this.oDialog.open();
    }

},


educationQualificationList: function(){
    return new Promise((resolve, reject) => {
        var oEducationModel = this.getView().getModel("EmployeeModel");
        let oEducationData = oEducationModel.getProperty("/employee_education_detail");
        let qualificationData=oEducationData.results;
        console.log('qualificationData ==>',qualificationData);
        var oQualificationJSONdata={
            "educationListArray":[]
        } 
 
    qualificationData.forEach(function (item) {
        //console.log('cv item 1',item)
        let exRow={
            'id':item.ID,
            'degree':item.degree,
            'specialization':item.specialization,
            'institute_name':item.institute_name,
            'startDate':item.startDate,//item.startDate
            'endDate':item.endDate
        }
        oQualificationJSONdata.educationListArray.push(exRow);
        
    });
    console.log('educationListArray table data',oQualificationJSONdata);
    var oEducTreeModel = new sap.ui.model.json.JSONModel(oQualificationJSONdata);

    // setting the treetable model with created JSONModel
    var oEduTreeTable = this.getView().byId("educationTreeTable");
    oEduTreeTable.setModel(oEducTreeModel);
    oEduTreeTable.bindRows({
        path: "/educationListArray"
    });
    resolve();
})
},

onEditProfsummary:function(){
    
    var oView = this.getView();
    oView.byId("profSummAdd").setVisible(true);
    oView.byId("profsumm").setVisible(false);
    oView.byId("profileEdit").setVisible(false);
    oView.byId("saveProfileSumm").setVisible(true);
    oView.byId("cancel_Profilebtn").setVisible(true);
    
},
onProfSummarynotadd:function(){
  
    var oView = this.getView();
    oView.byId("profSummAdd").setVisible(false);
    oView.byId("profsumm").setVisible(true);
    oView.byId("profileEdit").setVisible(true);
    oView.byId("saveProfileSumm").setVisible(false);
    oView.byId("cancel_Profilebtn").setVisible(false);
    
},
     
handleEditPress : function () {

   
    var oView = this.getView();
    oView.byId("showCVdata").setVisible(false);
    oView.byId("editCVdata").setVisible(true);
    oView.byId('editSummary').setVisible(true);
    oView.byId('wrkexp').setVisible(true);
    oView.byId('education').setVisible(true);
   // oView.byId('skills').setVisible(true);

 },

 initRichTextEditor: function (bIsTinyMCE5) {
  
	var sHtmlValue ='';
    
        var that = this;
	sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/library"],
		function (RTE, library) {
			var EditorType = library.EditorType;
			that.oRichTextEditor = new RTE("myRTE", {
				//editorType: bIsTinyMCE5 ? EditorType.TinyMCE5 : EditorType.TinyMCE6,
                editorType:EditorType.TinyMCE6,
				width: "100%",
				height: "200px",
                position:"center",
				customToolbar: true,
				showGroupFont: true,
				showGroupLink: true,
				showGroupInsert: true,
				value: sHtmlValue,
				ready: function () {
					bIsTinyMCE5 ? this.addButtonGroup("styleselect").addButtonGroup("table") : this.addButtonGroup("styles").addButtonGroup("table");
				}
			});

			that.getView().byId("idVerticalLayout").addContent(that.oRichTextEditor);

            //console.log('summary data 1=>',sHtmlValue,that.oRichTextEditor);
	});
},

onSaveWorkexp: function () {

     var orgVal = this.getView().byId("org");   
     var orgData = orgVal.getValue();
     var desigVal = this.getView().byId("desig");
     var desigData = desigVal.getValue();
     var jobProfileVal = this.getView().byId("jobprofile");
     var jobProfileData = jobProfileVal.getValue();
     var jobStartDate = this.getView().byId("DP2");
     var jobStartData = jobStartDate.getValue();
     var endDateVal = this.getView().byId("DP5");
     var endDateData = endDateVal.getValue();
     var oMainModel = this.getView().getModel("EmployeeModel");
     var iPS_NO = oMainModel.getData().PS_NO;
    let workExpData={
            'empl_PS_NO':iPS_NO,
            'company_name':orgData,
            'role':desigData,
            'domain':jobProfileData,
            'startDate':jobStartData,
            'endDate':endDateData
    }
   // 
   console.log('work exp data',workExpData);
  // 
  
  var oDataModel=this.getView().getModel();
  

       var that = this;
       let path="/Employee_CV_Experience_Data";
        oDataModel.create(path, workExpData, {
            success: function (data, response) {
                MessageBox.success("Data Successfully Saved");
            // that.onEditCancel();
                //that._onReadEmpData();
                that.oDialog.destroy();
                that.oDialog =null;
                that._initializeAsync();
                orgVal.setValue('');
                desigVal.setValue('');
                jobProfileVal.setValue('');
                jobStartDate.setValue('');
                endDateVal.setValue('');
                oDataModel.refresh();
                oDataModel.updateBindings();
                // window.location.reload()
            },
            error: function (error) {
                oView.byId("page").setBusy(false);
                MessageBox.error("Error while updating the data" + err.responseText);
            }
        });
        
},
onUpdateWorkexp:function(){
    var orgid = this.getView().byId("orgid");   
     var orgIdData = orgid.getValue();
    var orgVal = this.getView().byId("editorg");   
     var orgData = orgVal.getValue();
     var desigVal = this.getView().byId("editdesig");
     var desigData = desigVal.getValue();
     var jobProfileVal = this.getView().byId("editjobprofile");
     var jobProfileData = jobProfileVal.getValue();
     var jobStartDate = this.getView().byId("DP2");
     var jobStartData = jobStartDate.getValue();
     var endDateVal = this.getView().byId("DP5");
     var endDateData = endDateVal.getValue();
     var oMainModel = this.getView().getModel("EmployeeModel");
     var iPS_NO = oMainModel.getData().PS_NO;
    let workExpData={
            
            'empl_PS_NO':iPS_NO,
            'company_name':orgData,
            'role':desigData,
            'domain':jobProfileData,
            'startDate':jobStartData,
            'endDate':endDateData
    }
   // 
   console.log('work exp data',workExpData);
  // 
  var oDataModel=this.getView().getModel();
  

       var that = this;
       let path="/Employee_CV_Experience_Data("+ orgIdData + ")";
        oDataModel.update(path, workExpData, {
            success: function (data, response) {
                MessageBox.success("Data Successfully Updated");
            // that.onEditCancel();
                //that._onReadEmpData();
                that.oDialog.destroy();
                that.oDialog =null;
                that._initializeAsync();
                orgVal.setValue('');
                desigVal.setValue('');
                jobProfileVal.setValue('');
                jobStartDate.setValue('');
                endDateVal.setValue('');
                oDataModel.refresh();
                oDataModel.updateBindings();

            },
            error: function (error) {
                oView.byId("page").setBusy(false);
                MessageBox.error("Error while updating the data" + err.responseText);
            }
        });
},
onCurrentCompanySelection:function(){
  var oCheckBox = this.getView().byId('iscurrentcompany').getSelected();
  console.log('oCheckBox ==>',oCheckBox)
  var oView = this.getView();
  if(oCheckBox == true){
    
    oView.byId("_IDGendeLabel3endate").setVisible(false);
    oView.byId("DP5").setVisible(false);
  }else{
    
    oView.byId("_IDGendeLabel3endate").setVisible(true);
    oView.byId("DP5").setVisible(true);
  }
},
oCancelFragment:function(){
    var that = this;
    var oDataModel=this.getView().getModel();
    that.oDialog.destroy();
    this.oDialog =null;
    that._initializeAsync();
    //byId("org").
   
    oDataModel.refresh(true);
},
onSaveEducation:function(){
    var steamVal = this.getView().byId("eduSteam");   
     var steamData = steamVal.getValue();
     var specializationVal = this.getView().byId("specialization");   
     var specializationData = specializationVal.getValue();
     var instVal = this.getView().byId("institute");   
     var instData = instVal.getValue();
     var eduStartDate = this.getView().byId("DP8");
     var eduStartData = eduStartDate.getValue();
     var eduEndDateVal = this.getView().byId("DP6");
     var eduEndDateData = eduEndDateVal.getValue();
     var oMainModel = this.getView().getModel("EmployeeModel");
     var iPS_NO = oMainModel.getData().PS_NO;

     
     let educationData={
        'empl_PS_NO':iPS_NO,
        'degree':steamData,
        'specialization':specializationData,
        'institute_name':instData,
        'startDate':eduStartData,
        'endDate':eduEndDateData
    };
    console.log('Education data',educationData);
    var oDataModel=this.getView().getModel();

        var that = this;
        let path ="/Employee_Education_Detail";
        oDataModel.create(path, educationData, {
            success: function (data, response) {
                MessageBox.success("Education Qualification Added Successfully");
            // that.onEditCancel();
                //that._onReadEmpData();
                that.oDialog.destroy();
                that.oDialog =null;
                oDataModel.refresh();
                that._initializeAsync();
                steamVal.setValue('');
                specializationVal.setValue('');
                instVal.setValue('');
                eduStartDate.setValue('');
                eduEndDateVal.setValue('');
                oDataModel.updateBindings();
            },
            error: function (error) {
                oView.byId("page").setBusy(false);
                oDataModel.refresh();
                MessageBox.error("Error while updating the data" + err.responseText);
            }
        });
},
onAddEducationDialog:function(){
    console.log('onAddEducationDialog');
    var dialogID = this.getView().byId("eduadd");
    if (!this.oDialog && dialogID) {
        this.loadFragment({
            name: "myskillsapp.fragment.AddEduQualification"
        }).then(function (odialog) {
            console.log('onAddWorkExpDialog AddEduQualification');
            this.oDialog = odialog;
            this.oDialog.open();

        }.bind(this))
    } else {
        this.oDialog.open();
    }
},
onEditEducation:function(){
    console.log('onEditEducationDialog');
    var dialogID = this.getView().byId("eduedit");
    if (!this.oDialog && dialogID) {
        this.loadFragment({
            name: "myskillsapp.fragment.EditEduQualification"
        }).then(function (odialog) {
            console.log('onEditEducationDialog onEditEducationDialog');
            var oModel = this.getView().getModel("EmployeeModel");
              
            var oEduTable = this.getView().byId("educationTreeTable");
            var aIndices = oEduTable.getSelectedIndices();
       
            var oEduSelectItem=oEduTable.getContextByIndex(aIndices[0]);
            var oeduObjShow = oEduSelectItem.getObject();
            console.log('oEduObjShow ==>',oeduObjShow);
            var editEduId=this.getView().byId("eduId");
            editEduId.setValue(oeduObjShow.id)
            var degreeName=this.getView().byId("editeduSteam");
            degreeName.setValue(oeduObjShow.degree);
            var subName=this.getView().byId("editspecialization");//role domain startDate endDate
            subName.setValue(oeduObjShow.specialization);
            var instituteName=this.getView().byId("editinstitute");
            instituteName.setValue(oeduObjShow.institute_name);
            var editEduStart=this.getView().byId("DP8");
            editEduStart.setValue(oeduObjShow.startDate);
            var editEduEnd=this.getView().byId("DP6");
            editEduEnd.setValue(oeduObjShow.endDate)


            this.oDialog = odialog;
            this.oDialog.open();

        }.bind(this))
    } else {
        this.oDialog.open();
    }
},
onUpdateEducation:function(){
    var steamId = this.getView().byId("eduId");   
     var steamIdData = steamId.getValue();
    var steamVal = this.getView().byId("editeduSteam");   
     var steamData = steamVal.getValue();
     var specializationVal = this.getView().byId("editspecialization");   
     var specializationData = specializationVal.getValue();
     var instVal = this.getView().byId("editinstitute");   
     var instData = instVal.getValue();
     var eduStartDate = this.getView().byId("DP8");
     var eduStartData = eduStartDate.getValue();
     var eduEndDateVal = this.getView().byId("DP6");
     var eduEndDateData = eduEndDateVal.getValue();
     var oMainModel = this.getView().getModel("EmployeeModel");
     var iPS_NO = oMainModel.getData().PS_NO;

     
     let educationData={
        'empl_PS_NO':iPS_NO,
        'degree':steamData,
        'specialization':specializationData,
        'institute_name':instData,
        'startDate':eduStartData,
        'endDate':eduEndDateData
    };
    console.log('Education update data',educationData);
    var oDataModel=this.getView().getModel();

        var that = this;
        let path ="/Employee_Education_Detail("+ steamIdData + ")";
        oDataModel.update(path, educationData, {
            success: function (data, response) {
                MessageBox.success("Education Qualification Updated Successfully");
                that.oDialog.destroy();
                that.oDialog =null;
                oDataModel.refresh();
                that._initializeAsync();
                steamVal.setValue('');
                specializationVal.setValue('');
                instVal.setValue('');
                eduStartDate.setValue('');
                eduEndDateVal.setValue('');
                oDataModel.updateBindings();
            },
            error: function (error) {
                oView.byId("page").setBusy(false);
                oDataModel.refresh();
                MessageBox.error("Error while updating the data" + err.responseText);
            }
        });
}
,
onProfSummary:function(){
    
    var summaryVal = this.getView().byId("idVerticalLayout");   
    var summaryData = this.oRichTextEditor.getValue();
   // summaryData=summaryData.replace(/<[^>]*>?/gm, '');
  
   console.log('summaryData =>',summaryData)
  
   var oMainModel = this.getView().getModel("EmployeeModel");
   var iPS_NO = oMainModel.getData().PS_NO;
   var oView = this.getView();
    

   var oDataModel=this.getView().getModel();
   
   
   let oEmpl_Professional = oMainModel.getProperty("/employee_professional_summary");
   let professionalData =oEmpl_Professional.results;
   var that = this;
   console.log('Professional data ==>',professionalData);
   let profSummaryData={
    'empl_PS_NO':iPS_NO,
    'professional_desc':summaryData,
    }
   if(professionalData.length == 0){
    let path ="/Employee_Professional_Summary";
    oDataModel.create(path, profSummaryData, {
        success: function (data, response) {
            MessageBox.success("Data Successfully Updated");
           
            that.oRichTextEditor.destroy();
            that._initializeAsync();
            that.onProfSummarynotadd();
            oDataModel.refresh(true);
            oDataModel.updateBindings()
           
        },
        error: function (error) {
            oView.byId("page").setBusy(false);
            MessageBox.error("Error while updating the data" + err.responseText);
        }
    });
   }else{
    console.log('summaryData updated=>',profSummaryData);
    let summaryID=professionalData[0].ID;
    let path ="/Employee_Professional_Summary("+ summaryID + ")";
       oDataModel.update(path, profSummaryData, {
        success: function (data, response) {
            MessageBox.success("Data Successfully Updated");
           
            that.oRichTextEditor.destroy();
            that._initializeAsync();
           /// summaryVal.setValue('');
           that.onProfSummarynotadd();
           // var oDataModel=this.getView().getModel();
            oDataModel.refresh(true);
            oDataModel.updateBindings()
           // oView.byId("saveProfileSumm").setVisible(false);
            //oView.byId("profileEdit").setVisible(true);
        },
        error: function (error) {
            console.log(error);
            oView.byId("page").setBusy(false);
            MessageBox.error("Error while updating the data" + err.responseText);
        }
    });
   }



    
},
profSummaryDetails: function(){
    return new Promise((resolve, reject) => {
     var oprofSummaryModel = this.getView().getModel("EmployeeModel");
 
     let oEmpl_Professional = oprofSummaryModel.getProperty("/employee_professional_summary");
 
     let professionalData =oEmpl_Professional.results;
    // var wrkcareerData ="Test data";
     var wrkcareerData ="";
     console.log('careerData 1==>',wrkcareerData, typeof(wrkcareerData));
        if(professionalData.length == 0){
             wrkcareerData="Not updated";
             console.log('careerData 2==>',wrkcareerData)
         }else{
             wrkcareerData = professionalData[0].professional_desc.replace(/<[^>]*>?/gm, '');
             console.log('careerData 3==>',wrkcareerData)
         }
         var oViewCVModel=new JSONModel();
         var oCvData = {
           profSummaryData : wrkcareerData
         }
         this.getView().setModel(oViewCVModel,"oViewCVModel");
         oViewCVModel.setData(oCvData);
         oViewCVModel.refresh();
         //{oViewCVModel>/profSummaryData}
    
         
         resolve();
      })
 },

onDeleteWork:function(){
  //  alert('hi');
     var that = this;
     var oModel = this.getView().getModel("EmployeeModel");
    

     var oTable = this.getView().byId("workTreeTable");
     var aIndices = oTable.getSelectedIndices();

     var owrkSelectData=oTable.getContextByIndex(aIndices[0]);
     var owrkObj = owrkSelectData.getObject();
     var owrkID=owrkObj.id;
    
     console.log('workTreeTable',owrkObj);
    // console.log('oSelected is',oSelected);
     console.log('workTreeTable is',owrkID);
   
     var oDataModel=this.getView().getModel();
    
    let path="/Employee_CV_Experience_Data("+ owrkID + ")";
    let owrkProperty = oModel.getProperty("/employee_cv_experience_data");

        oDataModel.remove(path, {
            success: function (data, response) {
                MessageBox.success("Data Successfully Deleted");
            
                
                that._initializeAsync();
               
            },
            error: function (error) {
                oView.byId("page").setBusy(false);
                MessageBox.error("Error while updating the data" + err.responseText);
            }
        });

        
},
onDeleteEducation:function(){
   // alert('hi')
    var that = this;
     var oModel = this.getView().getModel("EmployeeModel");
     

     var oTable = this.getView().byId("educationTreeTable");
     var aIndices = oTable.getSelectedIndices();

     var oEduSelectData=oTable.getContextByIndex(aIndices[0]);
     var oEduObj = oEduSelectData.getObject();
     var oEduID=oEduObj.id;
    
     console.log('EduTreeTable',oEduObj);
    // console.log('oSelected is',oSelected);
     console.log('EduTreeTable is',oEduID);
   
     var oDataModel=this.getView().getModel();
    
    let path="/Employee_Education_Detail("+ oEduID + ")";
    let oEduProperty = oModel.getProperty("/employee_education_detail");

        oDataModel.remove(path, {
            success: function (data, response) {
                MessageBox.success("Data Successfully Deleted");
            
                
                that._initializeAsync();
               
            },
            error: function (error) {
                console.log(error);
                oView.byId("page").setBusy(false);
                MessageBox.error("Error while updating the data" + err.responseText);
            }
        });

},

handlePDF: function(){
    
    
     var oModel = this.getView().getModel("EmployeeModel");
     // oMainModel = this.getView().getModel("EmployeeModel");
     var employee_name = oModel.getData().employee_name;
    console.log('employee_name CV pdf ',employee_name);
     let oEmpl_CV_payload = oModel.getProperty("/employee_cv_experience_data");
     let oEmpl_EDUcation_payload = oModel.getProperty("/employee_education_detail");
     let oEmpl_Professional_payload = oModel.getProperty("/employee_professional_summary");
     let oEmpl_Skill_payload = oModel.getProperty("/employee_skill_detail"); 
     let experienceData=oEmpl_CV_payload.results;
     let qualificationData=oEmpl_EDUcation_payload.results;
     let professionalData =oEmpl_Professional_payload.results;
     let skillsData=oEmpl_Skill_payload.results;
     console.log('oEmpl_CV_payload ==>',experienceData);
     console.log('qualificationData ==>',qualificationData);
     console.log('PRofessionalData ==>',professionalData);
     console.log('skillsData ==>',skillsData);
   
    var expcustomizeArray=[];
    experienceData.forEach(function (item) {
        //console.log('cv item 1',item)
        let exRow={
            'company_name':item.company_name,
            'role':item.role,
            'domain':item.domain,
            'startDate':item.startDate,//
            'endDate':item.endDate //
        }
        expcustomizeArray.push(exRow);
        
    });
    console.log('experienceData data',expcustomizeArray);
    var expArray= [];
    expcustomizeArray.forEach(function (item) {
        var expDataArray = [];
        // console.log('cv item 2',item)
                      
        Object.keys(item).forEach(function (key) {
                                                      
                expDataArray.push(item[key]);
            
            
        });
       expArray.push(expDataArray);
    });
  
    var educustomizeArray=[];
    qualificationData.forEach(function (item) {
        //console.log('cv item 1',item)
        let exRow={
            'degree':item.degree,
            'specialization':item.specialization,
            'institute_name':item.institute_name,
            'startDate':item.startDate,//item.startDate
            'endDate':item.endDate
        }
        educustomizeArray.push(exRow);
        
    });
    console.log('table data',educustomizeArray);
    var eductArray=[];
    educustomizeArray.forEach(function (item) {
        var eduQualiArray = [];
        Object.keys(item).forEach(function (key) {
           // console.log('table data',item[key]);
            eduQualiArray.push(item[key]);
        });
        eductArray.push(eduQualiArray);
    });
    console.log('education data',eductArray);
    var careerData =professionalData[0].professional_desc;
    console.log('careerData ==>',careerData);
  
    var skillcustomizeArray=[];
    skillsData.forEach(function (item) {
        //console.log('cv item 1',item)
        let exRow={
            'Technology':item.JSC,
            'Skill':item.skill,
            'Rating':item.rating,
            'Exeperience in Years':item.exp_years,//item.startDate
            'Experience in Months':item.exp_months //item.endDate
        }
        skillcustomizeArray.push(exRow);
        
    });
    var clusterJSCData=[];
    skillcustomizeArray.forEach(function (item) {
         var skillsArray = [];
         Object.keys(item).forEach(function (key) {
             console.log('table data',item[key]);
             skillsArray.push(item[key]);
         });
         clusterJSCData.push(skillsArray);
     });
     console.log('clusterJSCData data',clusterJSCData);
//https://community.sap.com/t5/technology-blogs-by-members/pdf-download-in-sap-ui5-application/ba-p/13574901
// var rows = ['Roami','Good'];
    
    
var docDefinition = {
   
 content: [
   
     {
         style: "header",
         alignment: "center",
         text: employee_name,
         fontSize:15
     },
     {
        text:'john.doe@gmail.com', alignment:'center',fontSize:12
     }
     , 
     
      {text:careerData, margin: [ 5, 5, 5, 5 ], fontSize:10}  
     ,
     { text: 'Work Experience', margin: [ 5, 5, 5, 5 ],fontSize:15 },
      {
         table: {
             headerRows: 1,
             widths: ["*", "*", "*", "*", "*"],
             body: [
                 ["Company", "Role","Domain","Start Date", "End Date"], 
                 ...expArray
             ]
         }
      },
      { text: 'Educational Qualification', margin: [ 5, 5, 5, 5 ],fontSize:15 },
      {
        table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*"],
            body: [
                ["Degree", "Specialization" ,"Institute Name","Start Date", "End Date"], 
                ...eductArray
            ]
        }
     },
     { text: 'Skills', margin: [ 5, 5, 5, 5 ],fontSize:15 },
     {
         table: {
             headerRows: 1,
             widths: ["*", "*", "*", "*", "*"],
             body: [
                 ["Technology","Skill", "Rating","Experience in Years","Experience in Months"], 
                 ...clusterJSCData
             ]
         }
      },
 ]
};



  var pdfDocGenerator = pdfMake.createPdf(docDefinition);
     pdfDocGenerator.download("designcheck.pdf");


 
},
     








                             
//----------------------------------------------------------------------------------------------------------------------//

     


        selectRelatedRowsInTable: function(e) {
            var oTreeTable = this.getView().byId("TreeTableBasic");
            var totalrowcount= this.getView().byId("TreeTableBasic").getBinding("rows").getLength();
            var s = e.getSource();
            var n = e.getParameters().rowIndex;
            // var oTableContext = oTreeTable.getContextByIndex(n);
            var hierarchyLevel = oTreeTable.getContextByIndex(n)._mProxyInfo.level;
            // var a = s.getModel().getProperty("HierarchyLevel", s.getContextByIndex(n));
            if (hierarchyLevel === 1) {
                var b = n + 1; 
                while (s.getContextByIndex(b) && oTreeTable.getContextByIndex(b)._mProxyInfo.level !== 1) {
                    if (s.isIndexSelected(n)) {
                        if (!s.isIndexSelected(b)) {
                            // var k = s.getModel().getProperty("PurchaseOrder", s.getContextByIndex(b));
                            // this.aSelectedItems.push(k);
                            s.detachRowSelectionChange(this.onSelectSelectPOTable, this);
                            s.addSelectionInterval(b, b);
                            s.attachRowSelectionChange(this.onSelectSelectPOTable, this);
                            this.nItemSelectionCount += 1;
                        }
                    } else {
                        if (s.isIndexSelected(b)) {
                            // k = s.getModel().getProperty("PurchaseOrder", s.getContextByIndex(b));
                            // var i = this.aSelectedItems.indexOf(k);
                            // if (i !== -1) {
                            //     this.aSelectedItems.splice(i, 1);
                            // }
                            s.detachRowSelectionChange(this.onSelectSelectPOTable, this);
                            s.removeSelectionInterval(b, b);
                            s.attachRowSelectionChange(this.onSelectSelectPOTable, this);
                            this.nItemSelectionCount -= 1;
                        }
                    }
                    b += 1;
                }
            } else {
                if (!s.isIndexSelected(n)) {
                    b = n - 1;
                    while (s.getContextByIndex(b)._mProxyInfo.level !== 1) {
                        b -= 1;
                    }
                    s.detachRowSelectionChange(this.onSelectSelectPOTable, this);
                    s.removeSelectionInterval(b, b);
                    s.attachRowSelectionChange(this.onSelectSelectPOTable, this);
                    this.nHeaderSelectionCount += 1;
                }
                if (s.isIndexSelected(n)){
                    var flag1 = [];
                    var flag2 = [];
                    b = n - 1;
                    var c = n+1;
                    if(c === totalrowcount){
                        c = n;
                    }
                    if (s.getContextByIndex(c)._mProxyInfo.level == 1){
                        flag1.push(true);
                    };
                    while(s.getContextByIndex(c)._mProxyInfo.level !== 1){
                        // flag1.push(false);
                        if(s.isIndexSelected(c)){
                            flag1.push(true);
                        }else{
                            flag1.push(false);
                        };
                        c += 1;
                        if(c===totalrowcount){
                            break;
                        }
                    };
                    if (s.getContextByIndex(b)._mProxyInfo.level == 1){
                        flag1.push(true);
                    };
                    while (s.getContextByIndex(b)._mProxyInfo.level !== 1) {
                        // flag1.push(false);
                        if(s.isIndexSelected(b)){
                            flag1.push(true);
                        }else{
                            flag1.push(false);
                        }
                        b -= 1;
                    }
                    const andofFlags = flag1.every(Boolean);
                    if(andofFlags){
                        s.detachRowSelectionChange(this.onSelectSelectPOTable, this);
                        s.addSelectionInterval(b, b);
                        s.attachRowSelectionChange(this.onSelectSelectPOTable, this);
                    }
                }
            }
            var selectedrows = s.getSelectedIndices();
            if(selectedrows.length > 0){
                this.getView().byId("calstockbutton").setEnabled(true);
            }else{
                this.getView().byId("calstockbutton").setEnabled(false);
            }
        },
        onSelectSelectPOTable: function(e) {
            var s = this.getView().byId("TreeTableBasic");
            if (e.getParameters().selectAll === true) {
                this.bSelectAll = true;
                this.nHeaderSelectionCount = this.countSelectedHeaders(s, s.getSelectedIndices());
                // this.getView().byId("calstockbutton").setEnabled(true);
                // this.getView().byId("CreateDeliveryButton").setEnabled(false);
                // this.getView().byId("CalculateStockBalanceButton").setEnabled(false);
                // this.getView().byId("StockRequirementButton").setEnabled(false);
            } else {
                if (e.getParameters().rowContext === null) {
                    this.bSelectAll = false;
                    // this.getView().byId("calstockbutton").setEnabled(false);
                    // this.getView().byId("CreateDeliveryButton").setEnabled(false);
                    // this.getView().byId("CalculateStockBalanceButton").setEnabled(false);
                    // this.getView().byId("StockRequirementButton").setEnabled(false);
                    this.nHeaderSelectionCount = 0;
                    this.nItemSelectionCount = 0;
                    // this.aSelectedItems = [];
                } else {
                    // this.getView().byId("calstockbutton").setEnabled(true);
                    var p = e.getParameters().rowContext.sPath;
                    var n = e.getParameters().rowIndex;
                    var hierarchyLevel = e.getSource().getContextByIndex(n)._mProxyInfo.level;
                    // var l = this.getView().getModel().getProperty(p).HierarchyNodeLevel;
                    if (s.isIndexSelected(n)) {
                        if (hierarchyLevel === "1") {
                            this.nHeaderSelectionCount += 1;
                            if (this.nHeaderSelectionCount > 0) {
                                if (this._StockReqIntentAvailable) {
                                    // this.getView().byId("StockRequirementButton").setEnabled(true);
                                } else {
                                    // this.getView().byId("StockRequirementButton").setEnabled(false);
                                }
                                // this.getView().byId("calstockbutton").setEnabled(true);
                            } else {
                                // this.getView().byId("calstockbutton").setEnabled(false);
                                // this.getView().byId("StockRequirementButton").setEnabled(false);
                            }
                        } else {
                            // this.aSelectedItems.push(this.getView().getModel().getProperty(p).ProdPlntSupplierConcatenatedID);
                            this.nItemSelectionCount += 1;
                            
                        }
                    } else {
                        if (hierarchyLevel === "2") {
                            this.nHeaderSelectionCount -= 1;
                            if (this.nHeaderSelectionCount > 0) {
                                // if (this._StockReqIntentAvailable) {
                                //     this.getView().byId("StockRequirementButton").setEnabled(true);
                                // } else {
                                //     this.getView().byId("StockRequirementButton").setEnabled(false);
                                // }
                                // this.getView().byId("calstockbutton").setEnabled(true);
                            } else {
                                // this.getView().byId("calstockbutton").setEnabled(false);
                                // this.getView().byId("StockRequirementButton").setEnabled(false);
                            }
                        } else {
                            // var i = this.aSelectedItems.indexOf(this.getView().getModel().getProperty(p).ProdPlntSupplierConcatenatedID);
                            // if (i !== -1) {
                            //     this.aSelectedItems.splice(i, 1);
                            // }
                            this.nItemSelectionCount -= 1;
                        }
                    }
                    this.selectRelatedRowsInTable(e);
                }
            }
            if (s.getSelectedIndices().length > 0 && this.nItemSelectionCount > 0) {
                // this.getView().byId("ActionC_PROCMTDOCSUBCONTRG0button").setEnabled(true);
                // this.getView().byId("CreateDeliveryButton").setEnabled(true);
            } else {
                // this.getView().byId("ActionC_PROCMTDOCSUBCONTRG0button").setEnabled(false);
                // this.getView().byId("CreateDeliveryButton").setEnabled(false);
            }
            if (s.getSelectedIndices().length > 0 && this.nHeaderSelectionCount > 0) {
                // if (this._StockReqIntentAvailable) {
                //     this.getView().byId("StockRequirementButton").setEnabled(true);
                // } else {
                //     this.getView().byId("StockRequirementButton").setEnabled(false);
                // }
                // this.getView().byId("calstockbutton").setEnabled(true);
            } else {
                // this.getView().byId("calstockbutton").setEnabled(false);
                // this.getView().byId("StockRequirementButton").setEnabled(false);
            }
        },



    });
});

