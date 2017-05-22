/**
 * Pablo share buttons visible on hover
 */
;(function(){

  /**
   * Prevent from being inserted in certain situations
   */
  // Do not insert for iframes
  if (window !== window.parent) return;
  // Do no insert for content editing windows
  if (!document.body || document.body.hasAttribute('contenteditable')) return;


  /**
   * Site detection
   */
  var domain = window.location.hostname.replace('www.','');
  var site = {
    isGmail: /mail.google.com/.test(domain),
    isInstagram: /instagram.com/.test(domain)
  };

  // List of sites to disable this on:
  var disabledDomains = [
    'buffer.com',
    'bufferapp.com',
    'twitter.com',
    'facebook.com'
  ];
  if (disabledDomains.indexOf(domain) > -1) {
    return;
  }

  /**
   * Create a single global button
   */
  var currentImageUrl = null;
  var buttonWidth = 66;
  var buttonHeight = 25;
  var dpr = window.devicePixelRatio;
  var backgroundImage = (dpr && dpr > 1) ?
    xt.data.get('data/shared/img/pablo-hover-icon@2x.png') :
    xt.data.get('data/shared/img/pablo-hover-icon@1x.png');

  var button = document.createElement('span');
  button.id = 'pablo-extension-hover-button';

  button.setAttribute('style', [
    'display: none;',
    'position: absolute;',
    'z-index: 8675309;',
    'width: ' + buttonWidth + 'px;',
    'height: ' + buttonHeight + 'px;',
    'background-image: url(' + backgroundImage +');',
    'background-size: ' + buttonWidth +'px ' + buttonHeight + 'px;',
    'opacity: 0.9;',
    'cursor: pointer;'
  ].join(''));

  var offset = 5;
  var image;

  var locateButton = function(e) {
    image = e.target;

    var box = image.getBoundingClientRect();

    if (box.height < 250 || box.width < 350) return;

    // Use image.width and height if available
    var width = image.width || box.width,
        height = image.height || box.height,
        extraXOffset = 0,
        extraYOffset = 0;

    // In Gmail, we slide over the button for inline images to not block g+ sharing
    if (site.isGmail &&
        window.getComputedStyle(image).getPropertyValue('position') !== 'absolute') {
      extraXOffset = 72;
      extraYOffset = 4;
    }

    var x = window.pageXOffset + box.left + width - buttonWidth - offset - extraXOffset;
    var y = window.pageYOffset + box.top + height - buttonHeight - offset - extraYOffset;

    if (isBufferExtensionInstalled()) {
      x = x - 100 - offset;
    }

    button.style.top = y + 'px';
    button.style.left = x + 'px';
    button.style.display = 'block';

    currentImageUrl = getImageUrl(image);
  };

  var hoverButton = function() {
    button.style.opacity = '1.0';
    button.style.display = 'block';
    setBufferButtonVisibilityState(true);
  };

  var hideButton = function(e) {
    button.style.display = 'none';
    button.style.opacity = '0.9';
  };

  var onMouseleaveButton = function() {
    setBufferButtonVisibilityState(false);
    hideButton();
  };

  // If the Buffer extension is active on that page, manage its visibility state
  // by dispatching events to the underlying image
  var setBufferButtonVisibilityState = function(shouldMakeVisible) {
    // Check if the Buffer extension is active on that page
    var bufferHoverButton = document.getElementById('buffer-extension-hover-button');
    if (!bufferHoverButton) return;

    // jQuery listens to mouseover to emulate mouseenter, and mouseout to emulate mouseleave
    var eventName = shouldMakeVisible ? 'mouseover' : 'mouseout';
    var event = new Event(eventName, { bubbles: true });
    image.dispatchEvent(event);
  };

  var pabloImage = function(e) {
    if (!currentImageUrl) return;

    e.preventDefault();

    xt.port.emit('pablo_hover_button_click', {
      picture: currentImageUrl,
      placement: 'hover_button_image'
    });
  };

  $(button)
    .on('click', pabloImage)
    .on('mouseenter', hoverButton)
    .on('mouseleave', onMouseleaveButton);


  var getImageUrl = (function(domain){

    if ( site.isInstagram ) {
      return function(el) {
        return el.style.backgroundImage
          .replace('url(','')
          .replace(')','');
      };
    }

    return function(el) {
      return el.src;
    };

  }(domain));

  var addPabloImageOverlays = function() {
    var selector = 'img';

    if ( site.isInstagram ) {
      selector = '.Image.timelinePhoto, .Image.Frame';
    }

    document.body.appendChild(button);

    $(document)
      .on('mouseenter', selector, locateButton)
      .on('mouseleave', selector, hideButton);
  };

  // The Buffer button is inserted in the DOM on load, so polling the DOM and
  // caching positive matches will give us accurate results
  var isBufferExtensionInstalled = (function() {
    var isInstalled;

    return function() {
      if (isInstalled) return true;

      var bufferHoverButton = document.getElementById('buffer-extension-hover-button');
      if (bufferHoverButton) return isInstalled = true;
        else return false;
    };
  })();

  (function check() {
    if (!xt.options) {
      return setTimeout(check, 50);
    }
    // if (typeof xt.options['buffer.op.image-overlays'] === 'undefined' ||
    //     xt.options['buffer.op.image-overlays'] === 'image-overlays') {
      addPabloImageOverlays();
    // }
  }());
}());

var PabloData = function () {
  xt.port.emit('pablo_seletect_text', document.getSelection().toString());
};
