(function(){
	
	var page = require('webpage').create(), 
			system = require('system'), 
			address = system.args[1],
			output = system.args[2],
			width = system.args[3],
			height = system.args[4];

	page.onAlert = function(request) { 
  
      window.setTimeout(function () {

				page.paperSize = {
				  width: width + 'px',
				  height: height + 'px',
				  margin: {
				    left: '12px',
				    top: '12px'
				  }
				};

    		page.viewportSize = { width:  width, height: height};
    		page.zoomFactor = .75;
        page.render(output);
        page.close();
        phantom.exit();
          
      }, 0);
      
      
  };

  page.open(address);	    
	    
})();