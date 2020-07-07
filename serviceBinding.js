function initModel() {
	var sUrl = "/Northwind_Demo/V2/(S(k4turpq0yhxorxifcqjkusgz))/OData/OData.svc/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}