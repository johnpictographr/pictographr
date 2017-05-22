(function(){
	
	var page = require('webpage').create(), system = require('system'), address, output, size;
	
  address = system.args[1];
  output = system.args[2];
  
  page.open(address, function (status) {
      if (status !== 'success') {
          console.log('Unable to load the address!');
          phantom.exit();
      } else {
          window.setTimeout(function () {
              page.render(output);
              phantom.exit();
          }, 2500);
      }
  });  
	    
})();


