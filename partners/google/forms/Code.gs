function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  FormApp.getUi().createAddonMenu()
      .addItem('Launch', 'showSidebar')
      .addToUi();
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('plugin')
      .setTitle('Pictographr')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  FormApp.getUi().showSidebar(ui);
}

function getUser() {

  return Session.getActiveUser().getEmail();
  
}

function insertImage(url) {
  
  var form = FormApp.getActiveForm(),
  		img = UrlFetchApp.fetch(url);
  
	form.addImageItem()  // https://developers.google.com/apps-script/reference/forms/image-item
	     .setTitle('')
	     .setHelpText('') 
	     .setImage(img);
  
}

function confirmDelete() {
  var ui = FormApp.getUi();

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

