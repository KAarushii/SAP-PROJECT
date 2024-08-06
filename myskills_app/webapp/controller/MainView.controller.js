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
    'sap/ui/model/odata/v2/ODataModel'
],
function (Controller,MessageBox, Filter, FilterOperator, Sorter, JSONModel,
    MessageToast, MockServer, exportLibrary, Spreadsheet, ODataModel) {
    "use strict";
    
    return Controller.extend("myskillsapp.controller.MainView", {
        onInit: function () {

          this._onReadEmpData();  
          this.linearWizard = this.byId("wizardContentPage");
          this._initializeAsync();
         
        },
        
        _initializeAsync: async function () {

            try {
                await this._onReadEmpData();
                await this._setTreeTableData();
                this.onExpandFirstLevel();
            }
            catch (error) {
                console.error("Error Occured in  function calls", error);
            }
        },

        _onReadEmpData: function () {

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
        onCollapseExpandPress() {
			const oSideNavigation = this.byId("sideNavigation"),
				bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},

        _setTreeTableData: function () {

            return new Promise((resolve, reject) => {

                var oModel = this.getView().getModel("EmployeeModel");
                let oEmpl_skill_fetched_data = oModel.getProperty("/employee_skill_detail/results");

                let bClusterNotPresent = true;

                var oJSONData = {
                    "cluster_array": []
                };

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

                var oTreeTable = this.getView().byId("TreeTableBasic");
                oTreeTable.setModel(oTreeModel);
                oTreeTable.bindRows({
                    path: "/cluster_array"
                });
                resolve();

            });

        },

        onMenuButtonPress : function() {
			var toolPage = this.byId("toolPage");

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
        onRowClick: function () {             // add skills button
            var oView = this.getView();

            // Show the appropriate action buttons
            
        },
        oncancel: function () {
            var oView = this.getView();

            // Show the appropriate action buttons
           
            var a = this.byId("leafSkill");
            a.setValue("");
            var b = this.byId("rateSkill");
            b.setValue("");
            var c = this.byId("handsOnExp");
            c.setValue("");
            
        },
        onAdd: function () {
           
           

            if (!this.oDialog) {
                this.loadFragment({
                    name: "myskillsapp.fragment.Dialog"
                }).then(function (odialog) {
                    this.oDialog = odialog;
                    this.oDialog.open();

                }.bind(this))
            } else {
                this.oDialog.open();
            }
           
        },

        // Filter and searching the data for skills selection
        handleSearch: function (oEvent) {
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

            //var oFilter = new Filter("JSC", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([InputFilter]);
        },


         // Saving the skills selected through the select screen onto the exisiting model
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

            var aContexts = oEvent.getParameter("selectedContexts");
            let aLeaf_data = aContexts.map(function (oContext) { return oContext.getObject(); });


            if (aLeaf_data.length > 0) {

                // loop for matching and adding the selected skills
                for (let i = 0; i < aLeaf_data.length; i++, bSkillNotPresent = true) {
                    // loop for checking presence of cluster and skill
                    for (let j = 0; j < oEmpl_skill_fetched_data.length; j++) {
                        if (aLeaf_data[i].JSC === oEmpl_skill_fetched_data[j].JSC) {
                            if (aLeaf_data[i].leaf_skills === oEmpl_skill_fetched_data[j].skill) {

                                aSelected_skill_present.push(aLeaf_data[i].leaf_skills);
                                bSkillNotPresent = false;
                                alreadypresent = true;
                                break;
                            }
                        }
                    }

                    if (bSkillNotPresent) {

                        iPS_NO = parseInt(iPS_NO);
                        sJSC = encodeURIComponent(aLeaf_data[i].JSC);
                        sSkill = encodeURIComponent(aLeaf_data[i].leaf_skills);

                        oAdd_Skills_Payload =
                        {
                            "empl_PS_NO": iPS_NO,
                            "JSC": aLeaf_data[i].JSC,
                            "skill": aLeaf_data[i].leaf_skills,
                            "rating": 0,
                            "exp_years": false,
                            "exp_months": false
                        }

                        sBatchPath = "/Employee_Skill_Detail(empl_PS_NO=" + iPS_NO + ",JSC='" + sJSC + "',skill='" + sSkill + "')";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oAdd_Skills_Payload));
                        changesmade = true;
                    }

                }

            }
            if (alreadypresent) {
                MessageBox.alert(" Selected skill(s): " + aSelected_skill_present.join(", ") + " already present");
            }
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
        // Permission for deleting existing skills from the skill table
        onDelete: function () {

            var that = this;
            var oModel = this.getView().getModel("EmployeeModel");
            var iPS_NO = oModel.getProperty("/PS_NO");

            var oTable = this.getView().byId("TreeTableBasic");
            var aIndices = oTable.getSelectedIndices();

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

        // deleting existing skills from the skill table
        handleDeleteskill: function (aIndices, PS_NO, oTable) {

            var sBatchPath = "", aBatchChanges = [];
            var iPS_NO = parseInt(PS_NO);
            
            var that= this; 

            var url = this.getOwnerComponent().getModel().sServiceUrl;
            var oRequestModel = new sap.ui.model.odata.ODataModel(url);

            // loop for finding and deleting that specific skill in the resoective cluster
            for (var i = aIndices.length - 1; i >= 0; i--) {

                var tableContext = oTable.getContextByIndex(aIndices[i]);

                var sSkillPath = tableContext.getPath();
                if (sSkillPath.length > 20) {
                    var sSkill = oTable.getModel().getProperty(sSkillPath).skill;

                    var sClusterPath = tableContext.getPath().slice(0, -17);
                    var sJSC = oTable.getModel().getProperty(sClusterPath).clust_JSC;

                    sJSC = encodeURIComponent(sJSC);
                    sSkill = encodeURIComponent(sSkill);

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

        onEdit: function () {

            var that = this;
            var oModel = this.getView().getModel("EmployeeModel");

            var oTable = this.getView().byId("TreeTableBasic");
            var aIndices = oTable.getSelectedIndices();

            oModel.setProperty("/isEditable", true);

            if (aIndices.length > 0) {
                
                var hold = that.byId("exp_yrs");
                hold.setEditable(true); 
               
            }
            else {
                MessageBox.information("No record(s) selected, please select the record(s) that you want to edit.");
            }
        },

        onEdit2:function() {
            sap.ui.table.Table.extend('TreeTableBasic', {
                renderer: function(oRm, oControl) {
                    sap.ui.table.TableRenderer.render(oRm, oControl);
                },
                setRowEditable: function(edit, rowindex) {
                    var model = this.getModel();
                    var rowPath = this.getBindingInfo('rows').path;
                    var rows = model.getProperty(rowPath);
                    for (i = 0; i < rows.length; i++) {
                        row = rows[i];
                        if (i == rowindex) {
                            row[edit] = true; // make the selected row editable and rest non editable
                        } else {
                            row[edit] = false;
                        }
                    }
                    this.invalidate();
                }
            })
        },

        

         
        

        onCollapseAll: function() {
			const oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.collapseAll();
		},

		onCollapseSelection: function() {
			const oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.collapse(oTreeTable.getSelectedIndices());
		},

		onExpandFirstLevel: function() {
			const oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.expandToLevel(1);
		},

		onExpandSelection: function() {
			const oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.expand(oTreeTable.getSelectedIndices());
		},

       onEditInd: function(){
              
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
        
        oDataSelect: function () {

            var oTable = this.getView().byId("TreeTableBasic");
            var aIndices = oTable.getSelectedIndices();
            let oModel = oTable.getModel();
           
                //loop for finding and deleting that specific skill/cluster
                for (var i = 0 ; i < aIndices.length ; i++) {

                    var tableContext = oTable.getContextByIndex(aIndices[i]);

                    var sPath = tableContext.getPath() + "/bEditable";
                    if (sPath.length > 30) {
                        oModel.setProperty(sPath,true);
                    }
                }
        },

        // Updating all the changes made into the skill table to the database
        onSaveChanges: function () {

            var oTable = this.getView().byId("TreeTableBasic");
            var aIndices = oTable.getSelectedIndices();
            let oModel = oTable.getModel();

            var oMainModel = this.getView().getModel("EmployeeModel");
            console.log(oMainModel);
            var iPS_NO = oMainModel.getData().PS_NO;

            var sBatchPath = "", aBatchChanges = [];
            var url = this.getOwnerComponent().getModel().sServiceUrl;
            var oRequestModel = new sap.ui.model.odata.ODataModel(url);
                
            
            var oUpdate_Skills_Payload =
                        {
                            "empl_PS_NO": iPS_NO,
                            "JSC":"",
                            "skill": "",
                            "rating": 0,
                            "exp_years": 0,
                            "exp_months": 0,
                            "bEditable": false,
                            "btnEditable": false
                        }

            for (var i = 0 ; i < aIndices.length ; i++) {

                var tableContext = oTable.getContextByIndex(aIndices[i]);
                var sEditPath = tableContext.getPath() + "/bEditable";
                var sSkillPath =  tableContext.getPath();

                var sClusterPath = sSkillPath.slice(0, -17);
                
                if (sSkillPath.length > 30) {
                    oModel.setProperty(sEditPath,false);
                    var oData = oModel.getProperty(sSkillPath);
                    var sJSC = oModel.getProperty(sClusterPath).clust_JSC;

                    oUpdate_Skills_Payload =
                        {
                            "empl_PS_NO": iPS_NO,
                            "JSC":oData.JSC,
                            "skill": oData.skill,
                            "rating": oData.rating,
                            "exp_years": oData.exp_years,
                            "exp_months": oData.exp_months,
                            "bEditable": false,
                            "btnEditable": false
                        }

                        sJSC = encodeURIComponent(sJSC);
                        var sSkill = encodeURIComponent(oData.skill);

                    sBatchPath = "/Employee_Skill_Detail(empl_PS_NO=" + iPS_NO + ",JSC='" + sJSC + "',skill='" + sSkill + "')";
                    aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Skills_Payload));

                }
            }

            oRequestModel.addBatchChangeOperations(aBatchChanges);
            oRequestModel.submitBatch(function (oData, oResponse) {
                // Success callback function
                if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                    sap.m.MessageBox.success("Skills Updated Successfully");
                    oTable.clearSelection();
                    this._initializeAsync();
                }
                // Handle the response data
            }, function (oError) {
                // Error callback function
                sap.m.MessageBox.waning("failed");
                // Handle the error
            });

            
        },

        onPress0: function (oEvent) {
			
            var id= this.getView().byId("exp0");
            var id1= this.getView().byId("exp1"); 
             id.setVisible(true); 
             id1.setVisible(false);

		},

        onPress1: function (oEvent) {
			
            var id= this.getView().byId("exp0");
            var id1= this.getView().byId("exp1"); 
            id.setVisible(false); 
             id1.setVisible(true);
		},
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

