	var tools = {
		lengthInUtf8Bytes: function(str) {
		  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
		  var m = encodeURIComponent(str).match(/%[89ABab]/g);
		  return str.length + (m ? m.length : 0);
		},
		elasped:{ // http://stackoverflow.com/questions/1210701/compute-elapsed-time
			start: function() {	
				this.startTime = new Date();
			},
			stop: function() {
				this.endTime = new Date();
			},
			get: function() {
				// time difference in ms
				var timeDiff = this.endTime - this.startTime;
				
				// strip the ms
				timeDiff /= 1000;
				
				// get seconds (Original had 'round' which incorrectly counts 0:28, 0:29, 1:30 ... 1:59, 1:0)
				var seconds = Math.round(timeDiff % 60);

				// remove seconds from the date
				timeDiff = Math.floor(timeDiff / 60);
				
				// get minutes
				var minutes = Math.round(timeDiff % 60);
				
				// remove minutes from the date
				timeDiff = Math.floor(timeDiff / 60);
				
				// get hours
				var hours = Math.round(timeDiff % 24);
				
				// remove hours from the date
				timeDiff = Math.floor(timeDiff / 24);
				
				// the rest of timeDiff is number of days
				var days = timeDiff;	
				
				return seconds;
			}
		},
		
		toCamelCase: function(str) {
		    return str.replace(/(\-[a-z])/g, function(match){
		        return match.toUpperCase().replace('-','');
		    })
		},
		dashToCamel_depreciated: function (str) {
		   return str.replace(/\W+(.)/g, function (x, chr) {
		                    return chr.toUpperCase();
		   })
		},			
		LoopTimer: function(render, interval) {
		    var timeout;
		    var lastTime;
		
		    this.start = startLoop;
		    this.stop = stopLoop;
		
		    // Start Loop
		    function startLoop() {
		        timeout = setTimeout(createLoop, 0);
		        lastTime = Date.now();
		        return lastTime;
		    }
		    
		    // Stop Loop
		    function stopLoop() {
		        clearTimeout(timeout);
		        return lastTime;
		    }
		    
		    // The actual loop
		    function createLoop() {
		        var thisTime = Date.now();
		        var loopTime = thisTime - lastTime;
		        var delay = Math.max(interval - loopTime, 0);
		        timeout = setTimeout(createLoop, delay);
		        lastTime = thisTime + delay;
		        render(thisTime);
		    }
		},

		validateEmail: function(email) {  // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
		    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		    return re.test(email);
		},
		
		isOdd: function(num) { return num % 2;},
		
		mobilecheck: function() {
		  var check = false;
		  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		  return check;
		},
		
		detectIE: function()  {
	    var ua = window.navigator.userAgent;
	
	    var msie = ua.indexOf('MSIE ');
	    if (msie > 0) {
	        // IE 10 or older => return version number
	        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	    }
	
	    var trident = ua.indexOf('Trident/');
	    if (trident > 0) {
	        // IE 11 => return version number
	        var rv = ua.indexOf('rv:');
	        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	    }
	
	    var edge = ua.indexOf('Edge/');
	    if (edge > 0) {
	       // Edge (IE 12+) => return version number
	       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	    }
	
	    // other browser
	    return false;
		},
		
		detectEdge: function() { // http://stackoverflow.com/questions/31757852/how-can-i-detect-internet-explorer-ie-and-microsoft-edge-using-javascript
			if (/Edge\/\d./i.test(navigator.userAgent)){
			   return true;	
			} else{
				return false;	
			}
		},
		
		isBrowser: { // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
			opera: function() {
				return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
			},
			firefox: function() {
				return typeof InstallTrigger !== 'undefined';
			},
			safari: function() {
				return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
			},
			ie: function() {
				return false || !!document.documentMode;
			},
			edge: function() {
				return !isIE && !!window.StyleMedia;
			},
			chrome: function() {
				return !!window.chrome && !!window.chrome.webstore;
			},
			blink: function() {
				return (isChrome || isOpera) && !!window.CSS;
			}
		},
		
		isEmpty: function(obj) {
		    for(var prop in obj) {
		        if(obj.hasOwnProperty(prop))
		            return false;
		    }
		
		    return true;
		},
		
		getDateTime: function() {
		    var now     = new Date(); 
		    var year    = now.getFullYear();
		    var month   = now.getMonth()+1; 
		    var day     = now.getDate();
		    var hour    = now.getHours();
		    var minute  = now.getMinutes();
		    var second  = now.getSeconds(); 
		    if(month.toString().length == 1) {
		        var month = '0'+month;
		    }
		    if(day.toString().length == 1) {
		        var day = '0'+day;
		    }   
		    if(hour.toString().length == 1) {
		        var hour = '0'+hour;
		    }
		    if(minute.toString().length == 1) {
		        var minute = '0'+minute;
		    }
		    if(second.toString().length == 1) {
		        var second = '0'+second;
		    }   
		    var dateTime = month+'/'+day+'/' + year + ' - '+hour+':'+minute+':'+second;   
		     return dateTime;
		},
		
		getCurDate: function() {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			
			if(dd<10) {
			    dd='0'+dd
			} 
			
			if(mm<10) {
			    mm='0'+mm
			} 
			
			return mm+'/'+dd+'/'+yyyy;
		},
		
		closest: function (arr, closestTo){
	    
	    var closest = Math.max.apply(null, arr);
	    
	    for(var i = 0; i < arr.length; i++){
	        if(arr[i] >= closestTo && arr[i] < closest) closest = arr[i];
	    }
	    
	    return closest;
		},
		between: function (x, min, max) {
		  return x >= min && x <= max;
		},
		redirectURL: function( url ) {
	    var a = document.createElement('a');
	    if (a.click) {
	      a.href = url;
	      a.target = '_blank';
	      (document.body || document.documentElement).appendChild(a);
	      a.click();
	      a.parentNode.removeChild(a);
			}
		},
		saveToDesktop: function(obj, name) {
			var json = JSON.stringify(obj);
	    var a = document.createElement("a");
	    var file = new Blob([json], {type: 'text/plain'});
	    a.href = URL.createObjectURL(file);
	    a.download = name;
	    a.click();
		},
		readFile: function(filePath) { // http://stackoverflow.com/questions/13709482/how-to-read-text-file-in-javascript
			
			var proceed = true;
			if(app.stubs.recentlySaved == false){
		    if (confirm("You have not saved.  Are you sure you want to proceed?") == true) {
		        proceed = true;
		    } else {
		        proceed = false;
		    }
			}

			if( !proceed ) {
				toast('Request cancelled');
				return;
			}

      if (window.File && window.FileReader && window.FileList && window.Blob) {
          var reader = new FileReader();
      } else {
          toast('Can not access desktop', 'keep', 5000, 'error', 'The File APIs are not fully supported by your browser.');
      }

			var output = ""; //placeholder for text output
			
      if(filePath.files && filePath.files[0]) {           
          reader.onload = function (e) {
              output = e.target.result;
              
							try {
							    output = JSON.parse(output);
							}
							catch(err) {
							    toast('Improper file type', 'keep', 5000, 'error', 'This is not a Pictographr file.');
							    return;
							}

              if( typeof(output) != 'object' ||
              		typeof(output.data) != 'object'
              ){
              	toast('Improper file type', 'keep', 5000, 'error', 'This is not a Pictographr file.');
              	return;
              };
              
              dataFromDesktop = JSON.stringify( output.data ); 
              app.data.import(function(){}, dataFromDesktop);
          };//end onload()
          reader.readAsText(filePath.files[0]);
      } //end if html5 filelist support
      else if(ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
          try {
              reader = new ActiveXObject("Scripting.FileSystemObject");
              var file = reader.OpenTextFile(filePath, 1); //ActiveX File Object
              output = file.ReadAll(); //text contents of file
              file.Close(); //close file "input stream"
              output = JSON.parse(output);
              dataFromDesktop = JSON.stringify( output.data ); 
              app.data.import(function(){}, dataFromDesktop);
          } catch (e) {
              if (e.number == -2146827859) {
                  alert('Unable to access local files due to browser security settings. ' + 
                   'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' + 
                   'Find the setting for "Initialize and script ActiveX controls not marked as safe" and change it to "Enable" or "Prompt"'); 
              }
          }       
      }
      else { //this is where you could fallback to Java Applet, Flash or similar
          return false;
      }       
      return true;
    },
		download: function (blobUrl, filename) { // http://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
	    var a = document.createElement('a');
	    if (a.click) {
	      // Use a.click() if available. Otherwise, Chrome might show
	      // "Unsafe JavaScript attempt to initiate a navigation change
	      //  for frame with URL" and not open the PDF at all.
	      // Supported by (not mentioned = untested):
	      // - Firefox 6 - 19 (4- does not support a.click, 5 ignores a.click)
	      // - Chrome 19 - 26 (18- does not support a.click)
	      // - Opera 9 - 12.15
	      // - Internet Explorer 6 - 10
	      // - Safari 6 (5.1- does not support a.click)
	      a.href = blobUrl;
	      a.target = '_parent';
	      // Use a.download if available. This increases the likelihood that
	      // the file is downloaded instead of opened by another PDF plugin.
	      if ('download' in a) {
	        a.download = filename;
	        // console.log('1');
	      }
	      // <a> must be in the document for IE and recent Firefox versions.
	      // (otherwise .click() is ignored)
	      (document.body || document.documentElement).appendChild(a);
	      a.click();
//	      console.log('2');
//	      console.log(a);
	      a.parentNode.removeChild(a);
	    } else {
	    	
	      if (window.top === window &&
	          blobUrl.split('#')[0] === window.location.href.split('#')[0]) {
	        // If _parent == self, then opening an identical URL with different
	        // location hash will only cause a navigation, not a download.
	        var padCharacter = blobUrl.indexOf('?') === -1 ? '?' : '&';
	        blobUrl = blobUrl.replace(/#|$/, padCharacter + '$&');
	      }
	      window.open(blobUrl, '_parent');
	    }
	  },
		openInNewTab: function(url) {
		  var win = window.open(url, '_blank');
		  win.focus();
		},
		popupwindow: function(url, title, w, h, l, t) {
			var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
			var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
			
			width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
			height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
			
			var left = ( typeof( l ) != 'undefined' ? l: ((width / 2) - (w / 2)) + dualScreenLeft);
			var top = ( typeof( t ) != 'undefined' ? t: ((height / 2) - (h / 2)) + dualScreenTop);
			var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
			
			// Puts focus on the newWindow
			if (window.focus) {
				if(typeof(newWindow)!='undefined') newWindow.focus();
			}
		},
		getCssProperty: function(elmId, property){
		   var elem = document.getElementById(elmId);
		   return window.getComputedStyle(elem,null).getPropertyValue(property);
		},
		urlGet:	function(name) {
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var	regexS ="[\\?&]"+name+"=([^&#]*)";
			var	regex	=	new	RegExp(	regexS );
			var	results	=	regex.exec(location.href);
			if(	results	== null	)
				return false;
			else
				return results[1];			
		},
		Doit: function( ) {
			
			var that = this;
			
			this.doo = function() {
					
		    that.iterations++;
		    
//			 console.log('doing: ' + that.who + ' iteration: ' + that.iterations + ' numTimes: ' + that.numTimes);
		    
		    if (that.iterations >= that.numTimes){
		    	clearInterval(that.interval);
		    } else{
		    	that.what();
		    }
			    
			}
			
			this.clear = function() {
				clearInterval(this.interval);
			}
			
		},
		capitalizeFirstLetter: function(string) {
    	return string.charAt(0).toUpperCase() + string.slice(1);
		},
		containsAtoZaTOz: function(str) {
			return /^[a-zA-Z]+$/.test(str);
		},
		containsSpecialCharacters: function(string) {
			var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
			 for(i = 0; i < specialChars.length;i++){
			   if(string.indexOf(specialChars[i]) > -1){
			       return true
			    }
			 }
			 return false;
		},
		convertImgToBase64: function(url, outputFormat, callback){  //http://jsfiddle.net/daqe97oz/
			var canvas = document.createElement('CANVAS');
			var ctx = canvas.getContext('2d');
			var img = new Image;
			img.crossOrigin = 'Anonymous';
			img.onload = function(){
				
				canvas.height = img.height;
				canvas.width = img.width;
			  	ctx.drawImage(img,0,0);
			  	var dataURL = canvas.toDataURL(outputFormat || 'image/png');
			  	callback.call(this, dataURL, img.width, img.height);
		        // Clean up
			  	canvas = null; 
			};
			img.src = url;
		},
		crop: function( target, coor ) {
			var crop_canvas = document.createElement('canvas');
			
			/*
			The following snippet fixes IE IndexSizeError
			http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
			begin.
			*/			
			
			coor.x = ( coor.x == 0  ? 1 : coor.x);
			coor.y = ( coor.y == 0  ? 1 : coor.y);
			coor.w = ( coor.w == 0  ? 1 : coor.w);
			coor.h = ( coor.h == 0  ? 1 : coor.h);
			
			/*
			end
			*/

			crop_canvas.width = coor.w;
			crop_canvas.height = coor.h;
			
			crop_canvas.getContext('2d').drawImage(
				target, 
				coor.x, 
				coor.y,
				coor.w,
				coor.h,
				0,
				0,
				coor.w,
				coor.h
			);

			var dataURL = crop_canvas.toDataURL("image/png"),
					baseArray  = dataURL.split(',');
					
			return {
				base64: baseArray[1],
				width: coor.w,
				height:	coor.h
			}
		},
		resizeToRect: function( target, coor ) {
			var crop_canvas = document.createElement('canvas');
			
			crop_canvas.width = coor.w;
			crop_canvas.height = coor.h;
			
			crop_canvas.getContext('2d').drawImage(
				target, 
				coor.x, 
				coor.y,
				coor.x2,
				coor.y2,
				0,
				0,
				coor.w,
				coor.h
			);

			var dataURL = crop_canvas.toDataURL("image/png"),
					baseArray  = dataURL.split(',');
					
			return {
				base64: baseArray[1],
				width: coor.w,
				height:	coor.h
			}
		},
		cropToRect: function( target, coor ) {
			
			var crop_canvas = document.createElement('canvas');

			crop_canvas.width = coor.destWidth;
			crop_canvas.height = coor.destHeight;
						
			crop_canvas.getContext('2d').drawImage(
				target, 
				coor.sourceX, 
				coor.sourceY,
				coor.sourceWidth,
				coor.sourceHeight,
				coor.destX,
				coor.destY,
				coor.destWidth,
				coor.destHeight
			);

			var dataURL = crop_canvas.toDataURL("image/png"),
					baseArray  = dataURL.split(',');
					
			return {
				base64: baseArray[1],
				width: coor.sourceWidth,
				height:	coor.sourceHeight
			}
		},
		containsNumbers: function(string) {
			return /\d/.test(string)
		},
		isNumeric: function(value) {
		    return /^\d+$/.test(value);
		},
		isFloatOrNumber: function(n) {
		  return !isNaN(parseFloat(n)) && isFinite(n);
		},
		camelToDash: function (str) {
			return str.replace(/\W+/g, '-')
		          .replace(/([a-z\d])([A-Z])/g, '$1-$2');
		},

		randomIntFromInterval: function(min,max) {
	    return Math.floor(Math.random()*(max-min+1)+min);
		},
		doWhenReady: function( condition, callback, fromWhere ){
			if( typeof( fromWhere ) != 'undefined'){
				//console.log(' waiting from:' + fromWhere);
			};
			if( !condition() ){
				app.stubs.doWhenSetter = setTimeout(function(){
					tools.doWhenReady(condition, callback);
					//console.log('... waiting for ready for: ' + fromWhere);
				}, 500);
			}else{
			  callback();
			};
		},
		ajax:	function(	url, arrDataObj, type, callback	)	{
			
			$.ajax({
				url: url + '?v=' + Math.random(),
				type:	type,
		    data: {
		        arrData : arrDataObj
		    },
				dataType:'json',
				success: function(data){
					//console.log('success');
					//console.log(JSON.stringify(  data   , null, 2 ));
					callback(data);
				},
				error:	function(data){
					if(typeof( toast ) != 'undefined') toast('There was a server error', 'keep', false, 'error', 'Something went wrong.');
					console.log(JSON.stringify(  data   , null, 2 ));
					callback(data);
				},
				async:true
			});
		},
		sortObject:	function(obj) {
			
				var sorted = {},
		    key, keysArray = [];
		
		    for (key in obj) {
		    	if (obj.hasOwnProperty(key)) {
		    		keysArray .push(key);
		    	}
		    }
		
		    keysArray.sort();
		
		    for (key = 0; key < keysArray.length; key++) {
		    	sorted[keysArray[key]] = obj[keysArray[key]];
		    }
		    
		    return sorted;
		},
		beginsWith: function(needle, haystack){
			return (haystack.substr(0, needle.length) == needle);
		},
		capitaliseFirstLetter: function(string){
		  return string.charAt(0).toUpperCase() + string.slice(1);
		},
		inArray: function(needle,	haystack)	{
			var	length = haystack.length;
			for(var	i	=	0; i < length; i++)	{
				if(haystack[i] ==	needle)	return true;
			}
			return false;
		},
		findIndexInArrayOfObjects: function(array, callback	){
				
			var	matchingIndices	=	[],
					lengthArray	=	 array.length;
			
			for(var	i	=	0;i	<	lengthArray; i++){
					if(	callback(	array[i] ) )
						 matchingIndices.push(i);
			}
	
			return matchingIndices;
		},
		getRandomColor: function() {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
		},
		useThisFormat: function(valueIs) {
			
			if( valueIs == null || 
					typeof( valueIs ) == 'undefined' ||
					typeof( valueIs ) == 'NaN') return ''; 
					
			if(typeof( valueIs.substr ) != 'function') return '';
			
			var lastTwo = valueIs.substr(valueIs.length - 2),
					lastChar = valueIs.substr(valueIs.length - 1);
			if(lastTwo == 'px') return 'px';
			if(lastChar == '%') return '%';
		},
		getSizeOfObj:	function(obj)	{
			var	size = 0,	key;
			for	(var key in	obj) {
				if (obj.hasOwnProperty(key)) size++;
			}
			return size;
		},
		deepCopy: function(obj) {
		    if (Object.prototype.toString.call(obj) === '[object Array]') {
		        var out = [], i = 0, len = obj.length;
		        for ( ; i < len; i++ ) {
		            out[i] = arguments.callee(obj[i]);
		        }
		        return out;
		    }
		    if (typeof obj === 'object') {
		        var out = {}, i;
		        for ( i in obj ) {
		            out[i] = arguments.callee(obj[i]);
		        }
		        return out;
		    }
		    return obj;
		},
		getScreenDim: function() {
		  var myWidth = 0, myHeight = 0;
		  if( typeof( window.innerWidth ) == 'number' ) {
		    //Non-IE
		    myWidth = window.innerWidth;
		    myHeight = window.innerHeight;
		  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		    //IE 6+ in 'standards compliant mode'
		    myWidth = document.documentElement.clientWidth;
		    myHeight = document.documentElement.clientHeight;
		  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		    //IE 4 compatible
		    myWidth = document.body.clientWidth;
		    myHeight = document.body.clientHeight;
		  }
		  return {
		  	width: myWidth,
		  	height: myHeight 
		  };
		},
		cookies: {

			getCookie: function(name) {
			  var nameEQ = name + "=";
			  var ca = document.cookie.split(';');
			  for(var i=0;i < ca.length;i++) {
			      var c = ca[i];
			      while (c.charAt(0)==' ') c = c.substring(1,c.length);
			      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			  }
			  return undefined;					
			},
			
			setCookie: function(c_name,value,exdays) {
			  var exdate=new Date();
			  exdate.setDate(exdate.getDate() + exdays);
			  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
			  document.cookie=c_name + "=" + c_value;				
			},
			
			deleteCookie: function(c_name) {
				document.cookie = c_name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			},
			
			expires: 365,				
		
		},
		trimFrontAndBackOf: function(str) {
	    str = str.replace(/^\s+/, '');
	    for (var i = str.length - 1; i >= 0; i--) {
	        if (/\S/.test(str.charAt(i))) {
	            str = str.substring(0, i + 1);
	            break;
	        }
	    }
	    return str;
		},
		addEvent: function(delement, eventName, callback) {
		    if (element.addEventListener) {
		        element.addEventListener(eventName, callback, false);
		    } else if (element.attachEvent) {
		        element.attachEvent("on" + eventName, callback);
		    } else {
		        element["on" + eventName] = callback;
		    }
		},
		SHA512: function SHA512(str) {  //http://coursesweb.net/javascript/sha512-encrypt-hash_cs
		  function int64(msint_32, lsint_32) {
		    this.highOrder = msint_32;
		    this.lowOrder = lsint_32;
		  }
		
		  var H = [new int64(0x6a09e667, 0xf3bcc908), new int64(0xbb67ae85, 0x84caa73b),
		      new int64(0x3c6ef372, 0xfe94f82b), new int64(0xa54ff53a, 0x5f1d36f1),
		      new int64(0x510e527f, 0xade682d1), new int64(0x9b05688c, 0x2b3e6c1f),
		      new int64(0x1f83d9ab, 0xfb41bd6b), new int64(0x5be0cd19, 0x137e2179)];
		
		  var K = [new int64(0x428a2f98, 0xd728ae22), new int64(0x71374491, 0x23ef65cd),
		      new int64(0xb5c0fbcf, 0xec4d3b2f), new int64(0xe9b5dba5, 0x8189dbbc),
		      new int64(0x3956c25b, 0xf348b538), new int64(0x59f111f1, 0xb605d019),
		      new int64(0x923f82a4, 0xaf194f9b), new int64(0xab1c5ed5, 0xda6d8118),
		      new int64(0xd807aa98, 0xa3030242), new int64(0x12835b01, 0x45706fbe),
		      new int64(0x243185be, 0x4ee4b28c), new int64(0x550c7dc3, 0xd5ffb4e2),
		      new int64(0x72be5d74, 0xf27b896f), new int64(0x80deb1fe, 0x3b1696b1),
		      new int64(0x9bdc06a7, 0x25c71235), new int64(0xc19bf174, 0xcf692694),
		      new int64(0xe49b69c1, 0x9ef14ad2), new int64(0xefbe4786, 0x384f25e3),
		      new int64(0x0fc19dc6, 0x8b8cd5b5), new int64(0x240ca1cc, 0x77ac9c65),
		      new int64(0x2de92c6f, 0x592b0275), new int64(0x4a7484aa, 0x6ea6e483),
		      new int64(0x5cb0a9dc, 0xbd41fbd4), new int64(0x76f988da, 0x831153b5),
		      new int64(0x983e5152, 0xee66dfab), new int64(0xa831c66d, 0x2db43210),
		      new int64(0xb00327c8, 0x98fb213f), new int64(0xbf597fc7, 0xbeef0ee4),
		      new int64(0xc6e00bf3, 0x3da88fc2), new int64(0xd5a79147, 0x930aa725),
		      new int64(0x06ca6351, 0xe003826f), new int64(0x14292967, 0x0a0e6e70),
		      new int64(0x27b70a85, 0x46d22ffc), new int64(0x2e1b2138, 0x5c26c926),
		      new int64(0x4d2c6dfc, 0x5ac42aed), new int64(0x53380d13, 0x9d95b3df),
		      new int64(0x650a7354, 0x8baf63de), new int64(0x766a0abb, 0x3c77b2a8),
		      new int64(0x81c2c92e, 0x47edaee6), new int64(0x92722c85, 0x1482353b),
		      new int64(0xa2bfe8a1, 0x4cf10364), new int64(0xa81a664b, 0xbc423001),
		      new int64(0xc24b8b70, 0xd0f89791), new int64(0xc76c51a3, 0x0654be30),
		      new int64(0xd192e819, 0xd6ef5218), new int64(0xd6990624, 0x5565a910),
		      new int64(0xf40e3585, 0x5771202a), new int64(0x106aa070, 0x32bbd1b8),
		      new int64(0x19a4c116, 0xb8d2d0c8), new int64(0x1e376c08, 0x5141ab53),
		      new int64(0x2748774c, 0xdf8eeb99), new int64(0x34b0bcb5, 0xe19b48a8),
		      new int64(0x391c0cb3, 0xc5c95a63), new int64(0x4ed8aa4a, 0xe3418acb),
		      new int64(0x5b9cca4f, 0x7763e373), new int64(0x682e6ff3, 0xd6b2b8a3),
		      new int64(0x748f82ee, 0x5defb2fc), new int64(0x78a5636f, 0x43172f60),
		      new int64(0x84c87814, 0xa1f0ab72), new int64(0x8cc70208, 0x1a6439ec),
		      new int64(0x90befffa, 0x23631e28), new int64(0xa4506ceb, 0xde82bde9),
		      new int64(0xbef9a3f7, 0xb2c67915), new int64(0xc67178f2, 0xe372532b),
		      new int64(0xca273ece, 0xea26619c), new int64(0xd186b8c7, 0x21c0c207),
		      new int64(0xeada7dd6, 0xcde0eb1e), new int64(0xf57d4f7f, 0xee6ed178),
		      new int64(0x06f067aa, 0x72176fba), new int64(0x0a637dc5, 0xa2c898a6),
		      new int64(0x113f9804, 0xbef90dae), new int64(0x1b710b35, 0x131c471b),
		      new int64(0x28db77f5, 0x23047d84), new int64(0x32caab7b, 0x40c72493),
		      new int64(0x3c9ebe0a, 0x15c9bebc), new int64(0x431d67c4, 0x9c100d4c),
		      new int64(0x4cc5d4be, 0xcb3e42b6), new int64(0x597f299c, 0xfc657e2a),
		      new int64(0x5fcb6fab, 0x3ad6faec), new int64(0x6c44198c, 0x4a475817)];
		
		  var W = new Array(64);
		  var a, b, c, d, e, f, g, h, i, j;
		  var T1, T2;
		  var charsize = 8;
		
		  function utf8_encode(str) {
		    return unescape(encodeURIComponent(str));
		  }
		
		  function str2binb(str) {
		    var bin = [];
		    var mask = (1 << charsize) - 1;
		    var len = str.length * charsize;
		
		    for (var i = 0; i < len; i += charsize) {
		      bin[i >> 5] |= (str.charCodeAt(i / charsize) & mask) << (32 - charsize - (i % 32));
		    }
		
		    return bin;
		  }
		
		  function binb2hex(binarray) {
		    var hex_tab = "0123456789abcdef";
		    var str = "";
		    var length = binarray.length * 4;
		    var srcByte;
		
		    for (var i = 0; i < length; i += 1) {
		      srcByte = binarray[i >> 2] >> ((3 - (i % 4)) * 8);
		      str += hex_tab.charAt((srcByte >> 4) & 0xF) + hex_tab.charAt(srcByte & 0xF);
		    }
		
		    return str;
		  }
		
		  function safe_add_2(x, y) {
		    var lsw, msw, lowOrder, highOrder;
		
		    lsw = (x.lowOrder & 0xFFFF) + (y.lowOrder & 0xFFFF);
		    msw = (x.lowOrder >>> 16) + (y.lowOrder >>> 16) + (lsw >>> 16);
		    lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
		
		    lsw = (x.highOrder & 0xFFFF) + (y.highOrder & 0xFFFF) + (msw >>> 16);
		    msw = (x.highOrder >>> 16) + (y.highOrder >>> 16) + (lsw >>> 16);
		    highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
		
		    return new int64(highOrder, lowOrder);
		  }
		
		  function safe_add_4(a, b, c, d) {
		    var lsw, msw, lowOrder, highOrder;
		
		    lsw = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) + (c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF);
		    msw = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) + (c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (lsw >>> 16);
		    lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
		
		    lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) + (c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) + (msw >>> 16);
		    msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) + (c.highOrder >>> 16) + (d.highOrder >>> 16) + (lsw >>> 16);
		    highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
		
		    return new int64(highOrder, lowOrder);
		  }
		
		  function safe_add_5(a, b, c, d, e) {
		    var lsw, msw, lowOrder, highOrder;
		
		    lsw = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) + (c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF) + (e.lowOrder & 0xFFFF);
		    msw = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) + (c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (e.lowOrder >>> 16) + (lsw >>> 16);
		    lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
		
		    lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) + (c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) + (e.highOrder & 0xFFFF) + (msw >>> 16);
		    msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) + (c.highOrder >>> 16) + (d.highOrder >>> 16) + (e.highOrder >>> 16) + (lsw >>> 16);
		    highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
		
		    return new int64(highOrder, lowOrder);
		  }
		
		  function maj(x, y, z) {
		    return new int64(
		      (x.highOrder & y.highOrder) ^ (x.highOrder & z.highOrder) ^ (y.highOrder & z.highOrder),
		      (x.lowOrder & y.lowOrder) ^ (x.lowOrder & z.lowOrder) ^ (y.lowOrder & z.lowOrder)
		    );
		  }
		
		  function ch(x, y, z) {
		    return new int64(
		      (x.highOrder & y.highOrder) ^ (~x.highOrder & z.highOrder),
		      (x.lowOrder & y.lowOrder) ^ (~x.lowOrder & z.lowOrder)
		    );
		  }
		
		  function rotr(x, n) {
		    if (n <= 32) {
		      return new int64(
		       (x.highOrder >>> n) | (x.lowOrder << (32 - n)),
		       (x.lowOrder >>> n) | (x.highOrder << (32 - n))
		      );
		    } else {
		      return new int64(
		       (x.lowOrder >>> n) | (x.highOrder << (32 - n)),
		       (x.highOrder >>> n) | (x.lowOrder << (32 - n))
		      );
		    }
		  }
		
		  function sigma0(x) {
		    var rotr28 = rotr(x, 28);
		    var rotr34 = rotr(x, 34);
		    var rotr39 = rotr(x, 39);
		
		    return new int64(
		      rotr28.highOrder ^ rotr34.highOrder ^ rotr39.highOrder,
		      rotr28.lowOrder ^ rotr34.lowOrder ^ rotr39.lowOrder
		    );
		  }
		
		  function sigma1(x) {
		    var rotr14 = rotr(x, 14);
		    var rotr18 = rotr(x, 18);
		    var rotr41 = rotr(x, 41);
		
		    return new int64(
		      rotr14.highOrder ^ rotr18.highOrder ^ rotr41.highOrder,
		      rotr14.lowOrder ^ rotr18.lowOrder ^ rotr41.lowOrder
		    );
		  }
		
		  function gamma0(x) {
		    var rotr1 = rotr(x, 1), rotr8 = rotr(x, 8), shr7 = shr(x, 7);
		
		    return new int64(
		      rotr1.highOrder ^ rotr8.highOrder ^ shr7.highOrder,
		      rotr1.lowOrder ^ rotr8.lowOrder ^ shr7.lowOrder
		    );
		  }
		
		  function gamma1(x) {
		    var rotr19 = rotr(x, 19);
		    var rotr61 = rotr(x, 61);
		    var shr6 = shr(x, 6);
		
		    return new int64(
		      rotr19.highOrder ^ rotr61.highOrder ^ shr6.highOrder,
		      rotr19.lowOrder ^ rotr61.lowOrder ^ shr6.lowOrder
		    );
		  }
		
		  function shr(x, n) {
		    if (n <= 32) {
		      return new int64(
		       x.highOrder >>> n,
		       x.lowOrder >>> n | (x.highOrder << (32 - n))
		      );
		    } else {
		      return new int64(
		       0,
		       x.highOrder << (32 - n)
		      );
		    }
		  }
		
		  str = utf8_encode(str);
		  strlen = str.length*charsize;
		  str = str2binb(str);
		
		  str[strlen >> 5] |= 0x80 << (24 - strlen % 32);
		  str[(((strlen + 128) >> 10) << 5) + 31] = strlen;
		
		  for (var i = 0; i < str.length; i += 32) {
		    a = H[0];
		    b = H[1];
		    c = H[2];
		    d = H[3];
		    e = H[4];
		    f = H[5];
		    g = H[6];
		    h = H[7];
		
		    for (var j = 0; j < 80; j++) {
		      if (j < 16) {
		       W[j] = new int64(str[j*2 + i], str[j*2 + i + 1]);
		      } else {
		       W[j] = safe_add_4(gamma1(W[j - 2]), W[j - 7], gamma0(W[j - 15]), W[j - 16]);
		      }
		
		      T1 = safe_add_5(h, sigma1(e), ch(e, f, g), K[j], W[j]);
		      T2 = safe_add_2(sigma0(a), maj(a, b, c));
		      h = g;
		      g = f;
		      f = e;
		      e = safe_add_2(d, T1);
		      d = c;
		      c = b;
		      b = a;
		      a = safe_add_2(T1, T2);
		    }
		
		    H[0] = safe_add_2(a, H[0]);
		    H[1] = safe_add_2(b, H[1]);
		    H[2] = safe_add_2(c, H[2]);
		    H[3] = safe_add_2(d, H[3]);
		    H[4] = safe_add_2(e, H[4]);
		    H[5] = safe_add_2(f, H[5]);
		    H[6] = safe_add_2(g, H[6]);
		    H[7] = safe_add_2(h, H[7]);
		  }
		
		  var binarray = [];
		  for (var i = 0; i < H.length; i++) {
		    binarray.push(H[i].highOrder);
		    binarray.push(H[i].lowOrder);
		  }
		  return binb2hex(binarray);
		},
		extractParamsFromURIFragment: function() {
		  var fragmentParams = {};
		  var e,
		      a = /\+/g,  // Regex for replacing addition symbol with a space
		      r = /([^&;=]+)=?([^&;]*)/g,
		      d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
		      q = window.location.hash.substring(1);
		
		  while (e = r.exec(q)) {
		    fragmentParams[d(e[1])] = d(e[2]);
		  }
		  return fragmentParams;
		},
		isEven: function(value) {
			if (value%2 == 0)
				return true;
			else
				return false;
		},
		whatIs: function() { // http://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-version-using-javascript
     	var unknown = '-';

      // screen
      var screenSize = '';
      if (screen.width) {
          width = (screen.width) ? screen.width : '';
          height = (screen.height) ? screen.height : '';
          screenSize += '' + width + " x " + height;
      }

      // browser
      var nVer = navigator.appVersion;
      var nAgt = navigator.userAgent;
      var browser = navigator.appName;
      var version = '' + parseFloat(navigator.appVersion);
      var majorVersion = parseInt(navigator.appVersion, 10);
      var nameOffset, verOffset, ix;

      // Opera
      if ((verOffset = nAgt.indexOf('Opera')) != -1) {
          browser = 'Opera';
          version = nAgt.substring(verOffset + 6);
          if ((verOffset = nAgt.indexOf('Version')) != -1) {
              version = nAgt.substring(verOffset + 8);
          }
      }
      // Opera Next
      if ((verOffset = nAgt.indexOf('OPR')) != -1) {
          browser = 'Opera';
          version = nAgt.substring(verOffset + 4);
      }
      // MSIE
      else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
          browser = 'Microsoft Internet Explorer';
          version = nAgt.substring(verOffset + 5);
      }
      // Chrome
      else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
          browser = 'Chrome';
          version = nAgt.substring(verOffset + 7);
      }
      // Safari
      else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
          browser = 'Safari';
          version = nAgt.substring(verOffset + 7);
          if ((verOffset = nAgt.indexOf('Version')) != -1) {
              version = nAgt.substring(verOffset + 8);
          }
      }
      // Firefox
      else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
          browser = 'Firefox';
          version = nAgt.substring(verOffset + 8);
      }
      // MSIE 11+
      else if (nAgt.indexOf('Trident/') != -1) {
          browser = 'Microsoft Internet Explorer';
          version = nAgt.substring(nAgt.indexOf('rv:') + 3);
      }
      // Other browsers
      else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
          browser = nAgt.substring(nameOffset, verOffset);
          version = nAgt.substring(verOffset + 1);
          if (browser.toLowerCase() == browser.toUpperCase()) {
              browser = navigator.appName;
          }
      }
      // trim the version string
      if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
      if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
      if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

      majorVersion = parseInt('' + version, 10);
      if (isNaN(majorVersion)) {
          version = '' + parseFloat(navigator.appVersion);
          majorVersion = parseInt(navigator.appVersion, 10);
      }

      // mobile version
      var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

      // cookie
      var cookieEnabled = (navigator.cookieEnabled) ? true : false;

      if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
          document.cookie = 'testcookie';
          cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
      }

      // system
      var os = unknown;
      var clientStrings = [
          {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
          {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
          {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
          {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
          {s:'Windows Vista', r:/Windows NT 6.0/},
          {s:'Windows Server 2003', r:/Windows NT 5.2/},
          {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
          {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
          {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
          {s:'Windows 98', r:/(Windows 98|Win98)/},
          {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
          {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
          {s:'Windows CE', r:/Windows CE/},
          {s:'Windows 3.11', r:/Win16/},
          {s:'Android', r:/Android/},
          {s:'Open BSD', r:/OpenBSD/},
          {s:'Sun OS', r:/SunOS/},
          {s:'Linux', r:/(Linux|X11)/},
          {s:'iOS', r:/(iPhone|iPad|iPod)/},
          {s:'Mac OS X', r:/Mac OS X/},
          {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
          {s:'QNX', r:/QNX/},
          {s:'UNIX', r:/UNIX/},
          {s:'BeOS', r:/BeOS/},
          {s:'OS/2', r:/OS\/2/},
          {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
      ];
      for (var id in clientStrings) {
          var cs = clientStrings[id];
          if (cs.r.test(nAgt)) {
              os = cs.s;
              break;
          }
      }

      var osVersion = unknown;

      if (/Windows/.test(os)) {
          osVersion = /Windows (.*)/.exec(os)[1];
          os = 'Windows';
      }

      switch (os) {
          case 'Mac OS X':
              osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
              break;

          case 'Android':
              osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
              break;

          case 'iOS':
              osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
              osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
              break;
      }

      // flash (you'll need to include swfobject)
      /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
      var flashVersion = 'no check';
      if (typeof swfobject != 'undefined') {
          var fv = swfobject.getFlashPlayerVersion();
          if (fv.major > 0) {
              flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
          }
          else  {
              flashVersion = unknown;
          }
      }

		  return {
		        screen: screenSize,
		        browser: browser,
		        browserVersion: version,
		        browserMajorVersion: majorVersion,
		        mobile: mobile,
		        os: os,
		        osVersion: osVersion,
		        cookies: cookieEnabled,
		        flashVersion: flashVersion
		  };
		  
		  /*
	
				var obj = tools.whatIs();
				for( var key in obj){
					console.log(key + ' : ' + obj[key]);	
				}
				
		  */

		}

	}


		
	/*
window.addEventListener('error', function (e) {
    var stack = e.error.stack;
    var message = e.error.toString();
    if (stack) {
        message += '\n' + stack;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/log', true);
    xhr.send(message);
});

	*/