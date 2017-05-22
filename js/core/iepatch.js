	if( tools.detectIE() ){
		// console.log('IE');
    var node = document.createElement("script"); 
    node.setAttribute("type", "text/javascript"); 
    node.setAttribute("src", "js/lib/es6promises/es6-promises.min.js"); 
    document.getElementsByTagName("head")[0].appendChild(node);
    setTimeout(function(){	
    		
    	ES6Promise.polyfill();
    	$('.colorsAlreadyPickedWrapper .btn-color, .colorpaletteDiv .btn-color').css('margin-top', '-2px');
    	

    }, 700);
	} else{
		console.log('not ie');
	};