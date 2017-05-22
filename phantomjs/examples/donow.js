var page = require('webpage').create(), system = require('system'), address, output, size;

if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    phantom.exit(1);
} else {
    address = system.args[1];
    output = system.args[2];
    if (system.args.length > 3 && system.args[2].substr(-4) === ".pdf") {
        size = system.args[3].split('*');
        page.paperSize = size.length === 2 ? {
            width : size[0],
            height : size[1],
            margin : '0px'
        } : {
            format : system.args[3],
            orientation : 'portrait',
            margin : {
                left : "5mm",
                top : "8mm",
                right : "5mm",
                bottom : "9mm"
            }
        };
    }
    if (system.args.length > 4) {
        page.zoomFactor = system.args[4];
    }
    var resources = [];
    page.onResourceRequested = function(request) {
        resources[request.id] = request.stage;
    };
    page.onResourceReceived = function(response) {
        resources[response.id] = response.stage;
    };
    page.open(address, function(status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        } else {
            waitFor(function() {
                // Check in the page if a specific element is now visible
                for ( var i = 1; i < resources.length; ++i) {
                    if (resources[i] != 'end') {
                        return false;
                    }
                }
                return true;
            }, function() {
               page.render(output);
               phantom.exit();
            }, 10000);
        }
    });
}