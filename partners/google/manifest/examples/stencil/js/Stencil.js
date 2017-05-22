
/**
 * Stencil
 * 
 * @todo   Prevent extension from running on pages that don't have valid html
 *         markup (eg. svgs). See:
 *         https://s3-us-west-2.amazonaws.com/app.local.getstencil.com/asstad3fb823.svg
 *         https://i.imgur.com/ddghHrM.png
 * @access public
 * @var    Object
 */
var Stencil = (function() {

    /**
     * _app
     * 
     * Reference to the open Frame instance, so that it can be hidden, shown, or
     * removed.
     * 
     * @access private
     * @var    Frame (default: undefined)
     */
    var _app;

    /**
     * _config
     * 
     * @access private
     * @var    Object
     */
    var _config = {};

    /**
     * _hosts
     * 
     * Role based hosts, for message posting security.
     * 
     * @access private
     * @var    Object
     */
    var _hosts = {
        dev: {
            app: 'dev.getstencil.com'
        },
        local: {
            app: 'local.getstencil.com'
        },
        prod: {
            app: 'getstencil.com'
        }
    };

    /**
     * _image
     * 
     * Tracks the last image value (from params) that was passed, but does not
     * overwrite the value when a false is passed in.
     * 
     * @access private
     * @var    Boolean|String (default: false)
     */
    var _image = false;

    /**
     * _init
     * 
     * Tracks whether the loaded iframe has been initiated via a postMessage
     * call.
     * 
     * @access private
     * @var    Boolean (default: false)
     */
    var _init = false;

    /**
     * _loaded
     * 
     * Tracks whether the app iframe has triggered the onload event. This is
     * used for ensuring that the app is ready for sliding down, especially with
     * respect to right-clicking on images.
     * 
     * @access private
     * @var    Boolean (default: false)
     */
    var _loaded = false;

    /**
     * _params
     * 
     * Object that tracks the params that were used when interacting with the
     * Chrome Extension.
     * 
     * @access private
     * @var    Object
     */
    var _params = {
        image: false,
        selection: false
    };

    /**
     * _pre
     * 
     * Reference to the pre loaded iframe, so that it can be removed from the
     * DOM after it's served it's purpose.
     * 
     * @access private
     * @var    HTMLIFrameElement (default: undefined)
     */
    var _pre;

    /**
     * _role
     * 
     * @access private
     * @var    String (default: 'prod')
     */
    var _role = 'prod';

    /**
     * _selection
     * 
     * Tracks the last _selection value was passed in to determine when a new
     * app should be drawn.
     * 
     * @access private
     * @var    Boolean|String (default: false)
     */
    var _selection = false;

    /**
     * _showing
     * 
     * Keeps track whether or not the app is currently visible.
     * 
     * @access private
     * @return Boolean
     */
    var _showing = false;

    /**
     * _addNativeListeners
     * 
     * @note   I trim here because sometimes highlighting was capturing
     *         newlines, and other times it was not.
     * @access private
     * @return void
     */
    var _addNativeListeners = function() {
        chrome.extension.onMessage.addListener(
            function(message, sender, sendResponse) {
                if (message.action === 'toggle') {
                    var params = message.params;
                    if (params.selection === false) {
                        var selection = window.getSelection().toString();
                        if (selection !== '') {
                            params.selection = selection.trim();
                        }
                    }
                    Stencil.toggle(params);
                }
            }
        );
    };

    /**
     * _addPostMessageListeners
     * 
     * @note   I check the origin against both the app and static server, since
     *         the pre loaded iframe will (likely) be coming from the static
     *         server. So I need this in order to properly remove it from the
     *         DOM.
     * @note   { check below is to ensure json is being sent. This is sometimes
     *         not the case when the user has extensions installed. They can
     *         call parent frames with string-data that will break the below
     *         parsing.
     * @access private
     * @return void
     */
    var _addPostMessageListeners = function() {
        $(window).on('message', function(event) {
            if (_run() === true) {
                var original = event.originalEvent,
                    hosts = _hosts[_role];
                if (original.origin === 'https://' + (hosts.app)) {
                    if (original.data[0] === '{') {
                        var data = JSON.parse(original.data);
                        if (data.action === 'message.app.hide') {
                            _showing = false;
                            _app.hide();
                        } else if (data.action === 'message.app.logout') {
                            _loaded = false;
                            _app.remove();
                            _draw();
                            _init = false;
                        } else if (data.action === 'message.app.opened') {
                            _params.parent = {
                                location: JSON.parse(
                                    JSON.stringify(window.location)
                                )
                            };
                            var message = {
                                action: 'message.app.params.store',
                                params: _params
                            };
                            _app.getElement().contentWindow.postMessage(
                                JSON.stringify(message),
                                'https://' + (hosts.app)
                            );
                        } else if (data.action === 'message.app.pre.loaded') {
                            // _pre.remove();
                        }
                    }
                }
            }
        });
    };

    /**
     * _addScrollPauseListener
     * 
     * Adds a scroll listener to the parent page of the extension, checking to
     * see if a scroll event is happening within Stencil or on the parent page.
     * If the former, it's prevented.
     * 
     * @access private
     * @var    Object
     */
    var _addScrollPauseListener = function() {
        var wheel = function(event) {
            if (_app && event.target === _app.getElement()) {
                event.preventDefault();
            }
        };
        $('body').on({
            'mousewheel DOMMouseScroll': wheel
        });
    };

    /**
     * _draw
     * 
     * @access private
     * @return void
     */
    var _draw = function() {
        var url = _config.urls.external.extensions.chrome,
            $body = $('body').first()[0];
        _app = new Frame();
        _app.setIFrame(url, $body);
        _app.getElement().onload = function() {
            _loaded = true;
        };
    };

    /**
     * _preload
     * 
     * @access private
     * @return void
     */
    var _preload = function() {
        var url = _config.urls.pre,
            $body = $('body').first()[0];
        _pre = new Frame();
        _pre.setIFrame(url, $body, true);
    };

    /**
     * _randomString
     * 
     * @access private
     * @param  undefined|Number length
     * @return String
     */
    var _randomString = function(length) {
        var str = '',
            range = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123' +
                '456789',
            i = 0,
            l = length || 10;
        for (i; i < l; i++) {
            str += range.charAt(Math.floor(Math.random() * range.length));
        }
        return str;
    };

    /**
     * _redraw
     * 
     * @access private
     * @return void
     */
    var _redraw = function() {
        _loaded = false;
        _app.remove();
        _draw();
        _init = false;
    };

    /**
     * _run
     * 
     * Returns whether or not the app should be run, which at the moment, is
     * dependent only on whether the current page is the app itself.
     * 
     * @access private
     * @return Boolean
     */
    var _run = function() {
        var url = window.location.href;
        if (
            url.match(/^https:\/\/local\.getstencil\.com\/app/) === null
            && url.match(/^https:\/\/dev\.getstencil\.com\/app/) === null
            && url.match(/^https:\/\/getstencil\.com\/app/) === null
        ) {
            return true;
        }
        return false;
    };

    /**
     * _xhr
     * 
     * @access protected
     * @param  String url
     * @param  Function success
     * @param  Function error
     * @return void
     */
    var _xhr = function(url, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            success.call(this, JSON.parse(this.responseText));
        };
        xhr.onreadystatechange = function (event) {
            if (xhr.readyState === 4) {
                if (xhr.status !== 200) {
                    error();
                }
            }
        };
        xhr.open('get', url, true);
        xhr.send();
    };

    /**
     * _urls
     * 
     * Closure that returns a hash of the urls used in the Chrome extension. It
     * can get pretty complicated below with caching, since I want to ensure
     * that the app-server gets hit at most once an hour. To do that, I ensure a
     * UTC formatted timestamp, by the hour (not minutes and seconds) is
     * appended to the static-server request (currently powered by CloudFlare).
     * 
     * @note   While this code acts to set a variable, I include it after the
     *         singleton private methods to ensure it has access to the 
     *         _randomString method
     * @access private
     * @var    Object
     */
    var _urls = (function() {

        /**
         * _minute
         * 
         * @access private
         * @return String
         */
        function _minute() {
            var now = new Date(),
                year = now.getUTCFullYear(),
                month = now.getUTCMonth(),
                date = now.getUTCDate(),
                hours = now.getUTCHours(),
                minutes = now.getUTCMinutes(),
                formatted = year;
            month += 1;
            if (month < 10) {
                month = '0' + (month);
            }
            if (date < 10) {
                date = '0' + (date);
            }
            if (hours < 10) {
                hours = '0' + (hours);
            }
            if (minutes < 10) {
                minutes = '0' + (minutes);
            }
            formatted += '-' + (month) + '-' + (date);
            formatted += '_' + (hours) + ':' + (minutes) + ':00';
            return formatted;
        };

        // Full urls hash
        var minute = _minute();

        // Unique query param
        var unixTimestamp = Math.floor(Date.now() / 1000),
            query = (unixTimestamp) + '&' + _randomString();

        // Return paths
        return {
            local: {
                config: 'https://local.getstencil.com/config?' + (query)
            },
            dev: {
                // config: 'https://dev.getstencil.com/app/static/compiled/config.json'//?minute=' + (minute)
                // config: 'https://d1cjlaezbj18n8.cloudfront.net/app/static/compiled/config.json'
                config: 'https://d34nsunniglnoy.cloudfront.net/config.json?' + (query)
            },
            prod: {
                // config: 'https://getstencil.com/app/static/compiled/config.json?minute=' + (minute)
                // config: 'https://d3b1ak9ylguumf.cloudfront.net/app/static/compiled/config.json'
                config: 'https://d3dn9aki07x737.cloudfront.net/config.json?' + (query)
            }
        };
    })();

    /**
     * Public methods
     */
    return {

        /**
         * init
         * 
         * @todo   Modal-alert them if they try using the extension from within
         *         the app, perhaps showing them the video.
         * @access public
         * @return void
         */
        init: function() {
            if (_run() === true) {
                var url = _urls[_role].config;
                _xhr(
                    url,
                    function(response) {
                        _config = response;
                        _addScrollPauseListener();
                        _addNativeListeners();
                        _addPostMessageListeners();
                        // _preload();
                        _draw();
                    },
                    function() {
                        var msg = 'Stencil: Could not load config';
                        console && console.log(msg);
                    }
                );
            } else {
                // var msg = 'Stencil: Cannot load Chrome Extension within app';
                // console && console.log(msg);
            }
        },

        /**
         * hide
         * 
         * @access public
         * @return void
         */
        hide: function() {
            var host = _hosts[_role].app;
            _showing = false;
            _app.getElement().contentWindow.postMessage(
                JSON.stringify({
                    action: 'message.app.hide'
                }),
                'https://' + (host)
            );
        },

        /**
         * show
         * 
         * Checks whether the app is loaded, currently every 10ms, to ensure it
         * can be shown. This is useful with respect to right-clicking on more
         * than one image within one page/tab-load.
         * 
         * @access public
         * @return void
         */
        show: function() {
            // _image = _params.image;
            // _selection = _params.selection;
            _showing = true;
            var interval,
                show = function() {
                    var host = _hosts[_role].app,
                        action = 'message.app.show';
                    if (_init === false) {
                        _init = true;
                        action = 'message.app.init';
                    }
                    _app.show();
                    _app.getElement().contentWindow.postMessage(
                        JSON.stringify({
                            action: action
                        }),
                        'https://' + (host)
                    );
                };
            interval = setInterval(function() {
                if (_loaded === true) {
                    clearInterval(interval);
                    show();
                }
            }, 10);
        },

        /**
         * toggle
         * 
         * Take note of the 500ms delay. That is to allow time for the app to
         * reinit. Look into whether this can be detected programtically.
         * 
         * @todo!! See note above
         * @notes  Wild logic that, with the exception of the showing / hide
         *         call, follows the following diagram:
         *         https://i.imgur.com/PEYUFvn.jpg
         * @access public
         * @parma  Object params
         * @return void
         */
        toggle: function(params) {
            if (_showing === true) {
                Stencil.hide();
            } else {
                _params = params;
                if (params.selection === false) {
                    if (params.image === false) {
                        Stencil.show();
                    } else {
                        if (params.image !== _image) {
                            _image = params.image;
                            _selection = params.selection;
                            if (_init === true) {
                                _redraw();
                                setTimeout(function() {
                                    Stencil.show();
                                }, 500);
                            } else {
                                Stencil.show();
                            }
                        } else {
                            Stencil.show();
                        }
                    }
                } else {
                    if (params.selection !== _selection) {
                        _image = params.image;
                        _selection = params.selection;
                        if (_init === true) {
                            _redraw();
                            setTimeout(function() {
                                Stencil.show();
                            }, 500);
                        } else {
                            Stencil.show();
                        }
                    } else {
                        if (params.image === false) {
                            Stencil.show();
                        } else {
                            if (params.image !== _image) {
                                _image = params.image;
                                _selection = params.selection;
                                if (_init === true) {
                                    _redraw();
                                    setTimeout(function() {
                                        Stencil.show();
                                    }, 500);
                                } else {
                                    Stencil.show();
                                }
                            } else {
                                Stencil.show();
                            }
                        }
                    }
                }
            }
        }
    };
})();

// Let's do this
Stencil.init();
