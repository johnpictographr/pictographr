
/**
 * Frame
 * 
 * @access public
 * @var    Object
 */
var Frame = Class.extend({

    /**
     * _element
     * 
     * @access private
     * @var    HTMLIFrameElement (default: null)
     */
    _element: null,

    /**
     * init
     * 
     * @access public
     * @return void
     */
    init: function() {
    },

    /**
     * _draw
     * 
     * @access private
     * @param  Boolean invisible
     * @return HTMLIFrameElement
     */
    _draw: function(invisible) {
        var element = document.createElement('iframe'),
            styles = this._getStylesString(invisible);
        element.setAttribute('name', 'Stencil');
        element.setAttribute('frameborder', '0');
        element.setAttribute('allowtransparency', 'true');
        element.setAttribute('style', styles);
        return element;
    },

    /**
     * _getStyles
     * 
     * @access protected
     * @param  Boolean invisible
     * @return Object
     */
    _getStyles: function(invisible) {
        var styles = {
            'z-index': '2147483647',
            'display': 'none',
            'border': '0px none transparent',
            'overflow-x': 'hidden',
            'overflow-y': 'auto',
            'visibility': 'visible',
            'margin': '0px',
            'padding': '0px',
            '-webkit-tap-highlight-color': 'transparent',
            'position': 'fixed',
            'top': '0',
            // 'right': '0',
            // 'bottom': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'background': 'rgba(0, 0, 0, 0.00392157);'
        };
        if (invisible === true) {
            styles = {
                'position': 'absolute',
                'left': '-10000px',
                'top': '-10000px'
            };
        }
        return styles;
    },

    /**
     * _getStylesString
     * 
     * @access protected
     * @param  Boolean invisible
     * @return String
     */
    _getStylesString: function(invisible) {
        var styles = this._getStyles(invisible),
            str = '';
        for (var property in styles) {
            str += (property) + ': ' + (styles[property]) + ';';
        }
        return str;
    },

    /**
     * getElement
     * 
     * @access public
     * @return Object
     */
    getElement: function() {
        return this._element;
    },

    /**
     * hide
     * 
     * @access public
     * @return void
     */
    hide: function() {
        this._element.style.display = 'none';
    },

    /**
     * remove
     * 
     * @access public
     * @return void
     */
    remove: function() {
        this._element.parentNode.removeChild(this._element);
    },

    /**
     * setIFrame
     * 
     * @access public
     * @param  String src
     * @param  HTMLElement parent
     * @param  Boolean invisible
     * @return void
     */
    setIFrame: function(src, parent, invisible) {
        this._element = this._draw(invisible);
        parent.appendChild(this._element);
        this._element.setAttribute('src', src);
    },

    /**
     * show
     * 
     * @access public
     * @return void
     */
    show: function() {
        this._element.style.display = 'block';
    }
});
