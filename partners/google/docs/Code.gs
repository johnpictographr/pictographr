function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Launch', 'showSidebar')
      .addToUi();
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('plugin')
      .setTitle('Pictographr')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  DocumentApp.getUi().showSidebar(ui);
}

function getUser() {

  return Session.getActiveUser().getEmail();
  
}

function insertImage(url) {
  
  var image = url;
  var blob = UrlFetchApp.fetch(image).getBlob();
  
  var doc = DocumentApp.getActiveDocument();
  var cursor = doc.getCursor();
  
  if (cursor) {    
    cursor.insertInlineImage(blob);
  } else {
    doc.getBody().insertImage(0, image);
  }
  
}

function confirmDelete() {
  var ui = DocumentApp.getUi();

  var result = ui.alert(
     'Please confirm',
     'Are you sure you want to delete?',
      ui.ButtonSet.YES_NO);

  if (result == ui.Button.YES) {
    return true;
  } else {
    return false;
  }
}

