/**=========================================
 * CONFIGURATION
 =========================================*/

// Add manifest access to the extension
chrome.manifest = chrome.app.getDetails();

// Plugin configuration
var config = {};
config.plugin = {
  // label: "Buffer This Page",
  version: chrome.manifest.version,
  pablo_url: chrome.manifest.homepage_url,
  // guide: 'https://buffer.com/guides/chrome/installed',
  menu: {
    // page: {
    //   label: "Buffer This Page"
    // },
    selection: {
      label: "Pablo Selected Text"
    },
    image: {
      label: "Open Image With Pablo"
    }
  },
};

/**=========================================
 * OVERLAY & TAB MANAGEMENT
 =========================================*/
//Open Pablo from the extension
var openPablo = function (data) {
  var url = config.plugin.pablo_url + '?utm_campaign=' + data.utm_campaign;

  if (data.text) url += '&text='+encodeURIComponent(data.text);
  if (data.image) url += '&image='+encodeURIComponent(data.image);

  chrome.tabs.create({
    url: url,
    active: true
  });
};

/**=========================================
 * CONTENT SCRIPT PORT
 =========================================*/

// Listen for embedded events
chrome.extension.onConnect.addListener(function(rawPort) {

  // Ignore anything that doesn't begin with Pablo
  if( ! rawPort.name.match(/^pablo/) ) { return; }

  var port = PortWrapper(rawPort),
    tab = rawPort.sender.tab;

  // Send the user's options to content scripts
  port.emit('pablo_options', {});

  // Listen for embedded triggers
  port.on("pablo_hover_button_click", function (embed) {
    _bmq.trackAction(['pablo', 'extension', 'hover_image_button'], {url: tab.url, host: getHost(tab.url)});
    openPablo({image: embed.picture, utm_campaign: 'pablo_extension_hover_image_button'});
  });

  // Listen for embedded triggers
  port.on("pablo_seletect_text", function (text) {
    var data = {utm_campaign: 'pablo_extension_browser_bar'};
    if (text) data.text = text;
    openPablo(data);
  });
});

/**=========================================
 * INITIAL SETUP
 =========================================*/

// Inject code from the first element of the content script list
var injectButtonCode = function (id) {
  var scripts = chrome.manifest.content_scripts[0].js;
  // Programmatically inject each script
  scripts.forEach(function (script) {
    chrome.tabs.executeScript(id, {
      file: script
    });
  });
};

var getHost = function(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.host;
}

chrome.runtime.onInstalled.addListener(function(details){
  if (details.reason == "install"){
    chrome.windows.getAll({
      populate: true
    }, function (windows) {
      windows.forEach(function (currentWindow) {
        currentWindow.tabs.forEach(function (currentTab) {
          // Skip chrome:// and https:// pages
          if( ! currentTab.url.match(/(chrome|https):\/\//gi) ) {
            injectButtonCode(currentTab.id);
          }
        });
      });
    });
  } else if (details.reason == "update"){
    // Nothing to do here, yet...
  }
});

/**=========================================
 * TRIGGERS
 =========================================*/

// Fire the overlay when the browser action button is clicked
chrome.browserAction.onClicked.addListener(function(tab) {
  _bmq.trackAction(['pablo', 'extension', 'browser_bar'], {url: tab.url, host: getHost(tab.url)});

  // frameId is supported since Chrome 41, and it apparently throws in prev. versions.
  // frameId fixes an issue that appeared in 45 where Chrome sends a message to all tabs
  // sharing a same opener tab and that opener tab itself (e.g. when using window.open)
  try {
    var rawPort = chrome.tabs.connect(tab.id, { name: 'pablo', frameId: 0 });
  } catch(e) {
    var rawPort = chrome.tabs.connect(tab.id, { name: 'pablo' });
  }
  var port = PortWrapper(rawPort);

  // Inform overlay that click has occurred
  port.emit("pablo_browser_bar_click");
});

// Context menus

// Selection
chrome.contextMenus.create({
  title: config.plugin.menu.selection.label,
  contexts: ["selection"],
  onclick: function (info, tab) {
    _bmq.trackAction(['pablo', 'extension', 'context_menu_text'], {url: tab.url, host: getHost(tab.url)});
    openPablo({text: info.selectionText, utm_campaign: 'pablo_extension_context_menu_text'});
  }
});

// Selection
chrome.contextMenus.create({
  title: config.plugin.menu.image.label,
  contexts: ["image"],
  onclick: function (info, tab) {
    _bmq.trackAction(['pablo', 'extension', 'context_menu_image'], {url: tab.url, host: getHost(tab.url)});
    openPablo({image: info.srcUrl, utm_campaign: 'pablo_extension_context_menu_image'});
  }
});
