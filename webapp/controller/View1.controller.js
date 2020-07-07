sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	// "../utility/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, Fragment, Filter, FilterOperator, Sorter, MessageBox) {
	"use strict";
	var arr = [];

	return Controller.extend("com.incture.ZBILLING_SYSTEM.controller.View1", {
		onInit: function () {
			var that = this;
			var oModel = this.getOwnerComponent().getModel("oNWModel");
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oTableModel = new JSONModel();
			this.getView().setModel(oTableModel, "oTableModel");
			this.getView().getModel("oTableModel").setProperty("/sSelectedItems");
			oModel.read("/Products", {
				success: function (oData) {
					oJsonModel.setData(oData);
					that.getView().setModel(oJsonModel, "fetchedOdataModel");

				},
				error: function (error) {
					MessageToast.show("error");
				}
			});

		},
		onChange: function (oEvent) {
			var oTableModel = this.getView().getModel("oTableModel");
			var val = oEvent.getSource().getValue();
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			if (val == 0) {
				var removeIndex = arr.map(function (item) {
					return item.ID;
				}).indexOf(oTableModel.getProperty(sPath + "/ID"));
				console.log(removeIndex);
				arr.splice(removeIndex, 1);
				this.getView().getModel("oTableModel").setProperty("/sSelectedItems", arr);
				this.computeTotal();
			} else {
				var price = oTableModel.getProperty(sPath + "/Price");
				var amount = val * price;
				console.log(amount);
				oTableModel.setProperty(sPath + "/Amount", amount);
				this.computeTotal();
			}

		},
		onSearch: function (oEvent) {
			var fetchedOdataModel = this.getView().getModel("fetchedOdataModel");
			var oTableModel = this.getView().getModel("oTableModel");
			var svalue = oEvent.getSource().getValue();
			var itemPresentInGlobalModel = this.isItemPresentInGlobalModel(svalue);
			var itemPresentInArr = this.isItemPresentInArr(svalue);
			if (itemPresentInGlobalModel) {
				if (itemPresentInArr) {
					if (!this._oDialog) {
						this._oDialog = sap.ui.xmlfragment("idAddItemFrag", "com.incture.ZBILLING_SYSTEM.fragment.warningDialog", this);
					}
					this.getView().getModel("oTableModel").setProperty("/dialogBoxId", svalue);
					var index = arr.map(function (item) {
						return item.ID;
					}).indexOf(parseInt(svalue));
					var selectedVal = oTableModel.getData().sSelectedItems[index].Value;
					Fragment.byId("idAddItemFrag", "dialogStepInput").setValue(selectedVal);
					this.getView().addDependent(this._oDialog);
					this._oDialog.open();

				} else {

					fetchedOdataModel.getData().results.forEach(function (element) {
						element.Amount = element.Price;
					});
					fetchedOdataModel.getData().results.forEach(function (element) {
						element.Value = 1;
					});
					console.log(fetchedOdataModel);
					arr.push(fetchedOdataModel.getData().results[svalue]);
					this.getView().getModel("oTableModel").setProperty("/sSelectedItems", arr);
					// this.getView().getModel("fetchedOdataModel").setProperty("/sSelectedKey", svalue);
					this.getView().getModel("oTableModel").setProperty("/sTotalAmount", 0);
					// console.log(oTableModel);
					this.computeTotal();

				}
			} else {
				MessageToast.show("This item is not present!!");
			}
		},
		isItemPresentInArr: function (svalue) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].ID == svalue) {
					return true;
				}
			}
			return false;
		},
		isItemPresentInGlobalModel: function (svalue) {
			var fetchedOdataModel = this.getView().getModel("fetchedOdataModel");
			for (var i = 0; i < fetchedOdataModel.getData().results.length; i++) {
				if (fetchedOdataModel.getData().results[i].ID == svalue) {
					return true;
				}

			}
			return false;
		},
		computeTotal: function () {
			var oTableModel = this.getView().getModel("oTableModel");
			var a = 0;
			var p;
			for (var i = 0; i < oTableModel.getData().sSelectedItems.length; i++) {
				a = a + parseFloat(oTableModel.getData().sSelectedItems[i].Amount);
				p = a.toFixed(2);
			}
			this.getView().getModel("oTableModel").setProperty("/sTotalAmount", p);
		},
		onSave: function () {
			var oTableModel = this.getView().getModel("oTableModel");
			var sID = this.getView().getModel("oTableModel").getProperty("/dialogBoxId");
			var indexOfId = arr.map(function (item) {
				return item.ID;
			}).indexOf(parseInt(sID));
			var price = oTableModel.getProperty("/sSelectedItems" + "/" + indexOfId + "/Price");
			var sval = Fragment.byId("idAddItemFrag", "dialogStepInput").getValue();
			oTableModel.setProperty("/sSelectedItems" + "/" + indexOfId + "/Value", sval);
			var amount = parseFloat(price) * parseFloat(sval);
			oTableModel.setProperty("/sSelectedItems" + "/" + indexOfId + "/Amount", amount);
			this.computeTotal();
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null
		},
		onCancel: function () {
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null
		},
		onClear: function () {
			var oTableModel = this.getView().getModel("oTableModel");
			arr = [];
			this.getView().getModel("oTableModel").setProperty("/sSelectedItems", arr);
			this.getView().getModel("oTableModel").setProperty("/sTotalAmount", 0);
		}

	});
});