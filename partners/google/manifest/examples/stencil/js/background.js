
/**
 * Help
 * 
 * @see http://talks.codegram.com/creating-basic-chrome-extensions#/basic_example_3
 */

/**
 * send
 * 
 * @access public
 * @param  Object tab
 * @param  String type
 * @param  Object params
 * @return void
 */
function send(tab, type, params) {
    chrome.tabs.sendMessage(
        tab.id,
        {
            action: 'toggle',
            type: type,
            params: params
        }
    );
}

/**
 * handler
 * 
 * @note   I trim here (if a string is found; can't remember what the property
 *         type is when nothing highlighted), as sometimes newlines were being
 *         captured, and other times they were not.
 * @param  Object info
 * @param  Object tab
 * @return void
 */
function handler(info, tab) {
    var image = false,
        selection = false;
    if (info.menuItemId === 'imageContext') {
        image = info.srcUrl;
    } else if (info.menuItemId === 'selectionContext') {
        selection = info.selectionText;
        if (typeof selection === 'string') {
            selection = selection.trim();
        }
    }
    send(tab, 'contextMenu', {
        image: image,
        selection: selection
    });
}
chrome.contextMenus.onClicked.addListener(handler);

/**
 * Adds the context menu actions to Chrome, currently including:
 * - Right clicking anywhere on the page
 * - Highlighting text and right clicking
 * - Right clicking on an image
 * 
 * @see http://developer.chrome.com/extensions/examples/api/contextMenus/event_page/sample.js
 * @see http://stackoverflow.com/questions/28954811/chrome-extension-context-menu-not-showing-up
 * @see https://developer.chrome.com/extensions/event_pages
 */
// chrome.runtime.onInstalled.addListener(function() {

    /**
     * Right clicking anywhere on page
     */
    chrome.contextMenus.create({
        title: 'Stencil',
        contexts: ['page'],
        id: 'pageContext'
    });

    /**
     * Have highlighted text, and then right click
     */
    chrome.contextMenus.create({
        title: 'Stencil',
        contexts: ['selection'],
        id: 'selectionContext'
    });

    /**
     * Right clicking on an image
     */
    chrome.contextMenus.create({
        title: 'Stencil',
        contexts: ['image'],
        id: 'imageContext'
    });
// });

/**
 * Browser action
 * 
 */
chrome.browserAction.onClicked.addListener(
    function(tab) {
        chrome.tabs.getSelected(
            null,
            function(tab) {
                send(tab, 'browserAction', {
                    image: false,
                    selection: false
                });
            }
        );
    }
);
