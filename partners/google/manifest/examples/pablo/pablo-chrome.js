;(function() {
  chrome.extension.onConnect.addListener(function(rawPort) {
    // PortWrapper(port) exposes an on/emit API for Chrome ports.
    // We are waiting for a trigger, buffer_click, to create the overlay.
    var port = PortWrapper(rawPort);
    port.on("pablo_browser_bar_click", function() {
      PabloData();
    });
  });
}());
