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

        },
        
        _onReadEmpData: function () {

            var oModel = this.getOwnerComponent().getModel();
            var oJSONModel = new sap.ui.model.json.JSONModel();
            var oBusyDialog = new sap.m.BusyDialog({
                title: "Loading",
                text: "Please wait..."
            });
            oBusyDialog.open();
            oModel.read("/Employees", {
                urlParameters: {
                     "$expand": "employee_cluster"
                },
                success: function (response) {
                    oBusyDialog.close();
                    oJSONModel.setData(response.results[0]);
                    this.getView().setModel(oJSONModel, "EmployeeModel");
                }.bind(this),
                error: function (error) {
                    oBusyDialog.close();
                }
            });

        },
        onMenuButtonPress : function() {
			var toolPage = this.byId("toolPage");

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
        onRowClick: function () {             // add skills button
            var oView = this.getView();

            // Show the appropriate action buttons
            oView.byId("table1").setVisible(false);
            oView.byId("Form").setVisible(true);
        },
        oncancel: function () {
            var oView = this.getView();

            // Show the appropriate action buttons
            oView.byId("table1").setVisible(true);
            oView.byId("Form").setVisible(false);
            var a = this.byId("leafSkill");
            a.setValue("");
            var b = this.byId("rateSkill");
            b.setValue("");
            var c = this.byId("handsOnExp");
            c.setValue("");
            
        },
        onAdd: function () {
            var oView = this.getView();

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

            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([]);

            var that = this;

            var oModel = this.getView().getModel("EmployeeModel");

            let oEmpl_clust_fetched_data = oModel.getProperty("/employee_cluster/results/0");
            let oEmpl_clust_payload = oEmpl_clust_fetched_data;
            let aSelected_skill_present = [];

            let skillnotpresent = true;
            let clusternotpresent = true;
            let changesmade = false;
            let alreadypresent = false;

            let skill_payload = {};

            var aContexts = oEvent.getParameter("selectedContexts");
            let aLeaf_data = aContexts.map(function (oContext) { return oContext.getObject(); });
            //Sort according to practice

            if (aLeaf_data.length > 0) {
                // loop for matching and adding the selected skills
                for (let i = 0; i < aLeaf_data.length; i++, clusternotpresent = true) {

                    // loop for checking presence of cluster
                    for (let j = 0; j < oEmpl_clust_fetched_data.cluster_array.length; j++, skillnotpresent = true) {
                        if (aLeaf_data[i].JSC === oEmpl_clust_fetched_data.cluster_array[j].clust_JSC) {

                            // loop for checking presence of leaf skill
                            for (let k = 0; k < oEmpl_clust_fetched_data.cluster_array[j].employee_skill.length; k++) {
                                if (aLeaf_data[i].leaf_skills === oEmpl_clust_fetched_data.cluster_array[j].employee_skill[k].skill) {
                                    aSelected_skill_present.push(aLeaf_data[i].leaf_skills);
                                    skillnotpresent = false;
                                    alreadypresent = true;
                                    break;
                                }
                            }

                            if (skillnotpresent) {
                                skill_payload = {
                                    "skill": aLeaf_data[i].leaf_skills,
                                    "rating": 0,
                                    "exp_years": 0,
                                    "exp_months": 0
                                };

                                oEmpl_clust_payload.cluster_array[j].employee_skill.push(skill_payload);
                                changesmade = true;

                            }

                            clusternotpresent = false;
                        }
                    }

                    if (clusternotpresent) {

                        let hold_cluster = aLeaf_data[i].JSC;

                        let cluster_payload =
                        {
                            "clust_JSC": hold_cluster,
                            "employee_skill": [
                                {
                                    "skill": aLeaf_data[i].leaf_skills,
                                    "rating": 0,
                                    "exp_years": 0,
                                    "exp_months": 0
                                }
                            ]
                        };


                        // loop for checking skills having the same newely added cluster
                        for (let l = i + 1; l < aLeaf_data.length + 1; l++) {
                            if (l !== aLeaf_data.length) {
                                if (aLeaf_data[l].JSC === hold_cluster) {
                                    skill_payload = {
                                        "skill": aLeaf_data[l].leaf_skills,
                                        "rating": 0,
                                        "exp_years": 0,
                                        "exp_months": 0
                                    };
                                    cluster_payload.employee_skill.push(skill_payload);
                                }
                                else {
                                    i = l - 1;
                                    break;
                                }
                            }
                            else {
                                i = l - 1;
                            }
                        }

                        oEmpl_clust_payload.cluster_array.push(cluster_payload);
                        changesmade = true;

                    }
                }
                
                if (alreadypresent) {
                    MessageBox.alert(" Selected skill(s): " + aSelected_skill_present.join(", ") + " already present");
                }
                // Finally Adding the the skills to the existing model
                if (changesmade) {
                    oModel.setProperty("/employee_cluster/results/0", oEmpl_clust_payload);
                    MessageBox.success("Skills added");

                }
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

            var oTable = this.getView().byId("TreeTableBasic");
            var aIndices = oTable.getSelectedIndices();

            var oModel = this.getView().getModel("EmployeeModel");

            if (aIndices.length > 0) {

                MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                    title: "Delete Record(s)",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            that.handleDeleteskill(aIndices, oModel, oTable);
                            MessageBox.success("Skills Deleted");
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
        handleDeleteskill: function (aIndices, oModel, oTable) {

            let oEmpl_clust_payload = oModel.getProperty("/employee_cluster/results/0");

            // loop for finding and deleting that specific skill/cluster
            for (var i = aIndices.length - 1; i >= 0; i--) {

                var tableContext = oTable.getContextByIndex(aIndices[i]);
                var aClusterArray = tableContext.getPath().split('/');

                var iClust_array_index = parseInt(aClusterArray[5]);
                var iEmployee_skill_index = parseInt(aClusterArray[7]);

                if (aClusterArray.length === 8) {

                    oEmpl_clust_payload.cluster_array[iClust_array_index].employee_skill.splice(iEmployee_skill_index, 1);
                }
                else if (aClusterArray.length === 6) {
                    oEmpl_clust_payload.cluster_array.splice(iClust_array_index, 1);
                }

            }
            oModel.setProperty("/employee_cluster/results/0", oEmpl_clust_payload);
        },

         // Updating all the changes made into the skill table to the database
         onSaveChanges: function () {

            var that = this;

            var oModel = this.getView().getModel("EmployeeModel");
            let oEmpl_clust_payload = oModel.getProperty("/employee_cluster/results/0");


            var path = "/Employee2Cluster(" + oEmpl_clust_payload.empl_PS_NO + ")";
            var oRequestModel = this.getView().getModel();

            oRequestModel.update(path, oEmpl_clust_payload, {
                success: function (data, response) {
                    MessageBox.success("Changes saved successfully!", {
                        title: "Sucess",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that._onReadEmpData();
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                },
                error: function (error) {
                    MessageBox.error("Error while updating the Changes" + error.responseText);
                }
            });

        },

         //Canceling the added changes
         onCancel: function () {

            var that = this;

            MessageBox.warning("Are you sure you want to discard changes?", {
                title: "Discard Changes",
                onClose: function (sAction) {
                    if (sAction === 'YES') {
                        that._onReadEmpData();
                    }
                }.bind(this),
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: sap.m.MessageBox.Action.NO,
            });

        },













       

        savedata: function () {
            var that = this;
            const myUniversallyUniqueID = globalThis.crypto.randomUUID();
            var a = this.getView().byId("leafSkill").getValue();
            var b = this.getView().byId("RI_M").getValue();
            var c = this.getView().byId("exp").getValue();
          
            var data = {
                "ID": myUniversallyUniqueID,
                "name": a,
                "email_id": b,
                "manager": c,
               
            };

            var odataModel = this.getView().getModel();
            odataModel.create("/Employees", data, {
                success: function (data, response) {
                    MessageBox.success("Data successfully created");
                    that.oncancel();
                    that._onReadEmpData();
                },
                error: function (error) {
                    MessageBox.error("Error while creating the data");
                }
            });

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
		}

        
       


        // onvEditBack: function () {               //back function on editing employee details
        //     var oView = this.getView();

        //     oView.byId("table1").setVisible(true); // Show the appropriate action buttons
        //     oView.byId("evbox").setVisible(false);
        // },


        // onvSave: function () {                    //  updating exiting employee details                 

        //     var d = this.byId("ID");
        //     var uid = d.getValue();
        //     console.log(uid);
        //     var a = this.byId("name");
        //     var uname = a.getValue();
        //     var b = this.byId("eemail");
        //     var uemail = b.getValue();
        //     var c = this.byId("emanager");
        //     var umanager = c.getValue();
        //     var d = this.byId("edepartment");
        //     var udepartment = d.getSelectedKey();

        //     var urecord = {
        //         "ID": uid,
        //         "name": uname,
        //         "email_id": uemail,
        //         "manager": umanager,
        //         "department_ID": udepartment
        //     }

        //     var that = this;


        //     var path = "/Employees(" + uid + ")";
        //     var odataModel = this.getView().getModel();

        //     odataModel.update(path, urecord, {
        //         success: function (data) {
        //             MessageBox.success("Successfully Updated");
        //             that._onReadEmpData();
        //             that.onvEditBack();
        //             windows.log.reload();
        //         },
        //         error: function (error) {
        //             MessageBox.error("Error while updating the data");
        //         }

        //     });

        // }



    });
});

