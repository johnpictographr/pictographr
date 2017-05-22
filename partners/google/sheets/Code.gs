function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Launch', 'showSidebar')
      .addToUi();
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('plugin')
      .setTitle('Pictographr')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(ui);
}

function getUser() {

  return Session.getActiveUser().getEmail();
  
}

function insertImage(url) {

  var image = url;
  var blob = UrlFetchApp.fetch(image).getBlob();


  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var cell = sheet.getActiveCell();

  sheet.insertImage(url, cell.getColumn(), cell.getRow());
  
  
  return;
  
  
	var image = url;
	var blob = UrlFetchApp.fetch(image).getBlob();
	
	
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getSheets()[0];
	var cell = sheet.getActiveCell();
	
	sheet.insertImage(url, 1, 1);

/*



https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#insertimageblob-column-row

https://developers.google.com/apps-script/reference/spreadsheet/range#methods

var blob = Utilities.newBlob(binaryData, 'image/png', 'MyImageName');
sheet.insertImage(blob, 1, 1);
 --------------------------
//https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#insertimageurl-column-row-offsetx-offsety

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  sheet.insertImage(url, 1, 1, 10, 10);
  

*/

  
  var image = url;
  var blob = UrlFetchApp.fetch(image).getBlob();


  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
	sheet.insertImage(url, 1, 1, 620, 5000);

return;


  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var cell = sheet.getActiveRange();

  if (cell) {  
  	sheet.insertImage(url, cell.getColumn(), cell.getRow());
  } else {
 		sheet.insertImage(url, 1, 1, 620, 5000);
  }

  
}

