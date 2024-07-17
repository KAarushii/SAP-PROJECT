
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

    return Controller.extend("test01.controller.View1", {
        onInit: function () {

          this._onReadEmpData();
       
          var that = this;
            // var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
            $.get({
                // url: sServiceUrl + "/POHeader?"+"&$expand=To_PurchaseOrderItem,To_SubconComponents",
                success: function (data) {
                    
                    var oModel = new sap.ui.model.json.JSONModel();
                    var treetable = that.getView().byId("TreeTableBasic");
                    treetable.setModel(oModel);
                    treetable.bindRows("Employees>/cluster_array");
                    treetable.setEnableGrouping("true");

                }.bind(this),
                error: function (error) {
                    console.log("g");
                }
            }) 
          
        },

        getGroup: function (oContext) {
            return oContext.getProperty('SortAs');
        },

        getGroupHeader: function (oGroup) {
            debugger;
            return new sap.m.GroupHeaderListItem({
                title: oGroup.key
            })
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
                    oJSONModel.setData(response.results);
                    this.getView().setModel(oJSONModel, "Employees");
                    
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
        onvEdit: function () {                     //display skills 
            var oView = this.getView();
           
            // Show the appropriate action buttons
            // oView.byId("table1").setVisible(true);  //displaying skills
            // oView.byId("evbox").setVisible(true); 
            if(!this.oDialog){
                this.loadFragment({
                    name:"myskillsapp.fragment.Dialog"
                }).then(function(odialog){
                    this.oDialog = odialog;
                    this.oDialog.open();
                   
                }.bind(this))
            }else{
                this.oDialog.open();
               
                } //editing editing
            
        },
        

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
                        path: 'skills_list',
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

        // onRowClick: function(oEvent){
        //     //var oPath = oEvent.getSource().getBindingContext('Emp').getPath();
        // if(!this.oDialog){
        //     this.loadFragment({
        //         name:"projectemployee.fragment.dialog"
        //     }).then(function(odialog){
        //         this.oDialog = odialog;
        //         this.oDialog.open();
               
        //     }.bind(this))
        // }else{
        //     this.oDialog.open();
           
        //     }
        // },

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

        
       


        onvEditBack: function () {               //back function on editing employee details
            var oView = this.getView();

            oView.byId("table1").setVisible(true); // Show the appropriate action buttons
            oView.byId("evbox").setVisible(false);
        },


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


