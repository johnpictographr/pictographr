var tabwin = undefined,
		nameOfThisFile = 'plugin.js',
		popupwindow = undefined,
		tools = {
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
						//console.log('error');
						//console.log(JSON.stringify(  data   , null, 2 ));
						callback(data);
					},
					async:true
				});
			},
			randomIntFromInterval: function(min,max) {
		    return Math.floor(Math.random()*(max-min+1)+min);
			},
			openInNewTab: function(url) {
			  tabwin = window.open(url, 'tabwin');
			  tabwin.focus();
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
			whatIs: function() {
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
	
			},
			popupwindow: function(url, title, w, h, l, t) {
				var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
				var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
				
				width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
				height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
				
				var left = ( typeof( l ) != 'undefined' ? l: ((width / 2) - (w / 2)) + dualScreenLeft);
				var top = ( typeof( t ) != 'undefined' ? t: ((height / 2) - (h / 2)) + dualScreenTop);
				popupwindow = window.open(url, 'popupwindow', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

//				var closePopupIfOpen = function(popupName){
//				  if(typeof(window[popupName]) != 'undefined' && !window[popupName].closed){
//				  	console.log('closing popup.');
//				    window[popupName].close();
//				  } else{
//				  	console.log('pop was never opened.');	
//				  }
//				}
//				
//				closePopupIfOpen('popupwindow');
				
				console.log('ready to pop window.');
				// Puts focus on the newWindow
				if (popupwindow.focus) {
					console.log('popupwindow.focus is defined');
					setTimeout(function(){
						console.log('popping window.');
						popupwindow.focus();
					}, 1000);
				}
			},
			crossdom:{ 
				
				init: function( iframe_id, src) {
					this.setIframeTarget(iframe_id, src);
					this.bind();
					
				},
				
				setIframeTarget: function(iframe_id, src) {
					var that = this;
					$('#' + iframe_id).attr('src', src).load(function () {
						that.iframeTarget = document.getElementById(iframe_id).contentWindow;
					});
					
				},
				
				bind: function() {
					
					var that = this;
					var callback = function(msg) {
						that.receive(msg);
					}
					
					if (window.attachEvent) { // IE9...
						window.attachEvent("onmessage", callback);
					} else if (document.attachEvent) { // IE8...
						doc.attachEvent("onmessage", callback);
					} else if (window.addEventListener) { // Everyone else...
						window.addEventListener("message", callback, false);
					}
		
				},
				send: function(obj){
					var msg = this.serialize(obj);
					this.iframeTarget.postMessage(msg, '*');						
				},
				receive: function(msg) {
					if( typeof( msg.data.split ) != 'function') return;
					var obj = this.unserialize(msg.data.split(','));
					//console.log(obj);
				},
		
				serialize: function(obj){
					var str = '';
					for(var key in obj){
						str += key + ':' + obj[key] + ',';
					};
					return str.substr(0,str.length-1)
				},
		        
				unserialize: function(strArray){
					var strLen = strArray.length,
						row,
						obj={};			
					for(var i=0;i<strLen;i++){
						row = strArray[i].split(':');
						obj[row[0]]=row[1];
					}
					return obj;
				}
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
			isEven: function(value) {
				if (value%2 == 0)
					return true;
				else
					return false;
			},
			doWhenReady: function( condition, callback, fromWhere ){
				if( typeof( fromWhere ) != 'undefined'){
					console.log(' waiting from:' + fromWhere);
				};
				if( !condition() ){
					app.stubs.doWhenSetter = setTimeout(function(){
						tools.doWhenReady(condition, callback);
						console.log('... waiting for ready for: ' + fromWhere);
					}, 500);
				}else{
				  callback();
				};
			}
		};

var App = function(){

  return function() {
  	
		var app = this;

		this.stubs = {};

		this.settings = {
			dim:{
				buttons_wrappers: {
					width: 190, // ideal
					height: 113, // ideal
					left: 5	 // ideal
				},
				action_buttons: {
					width: 62,
					height: 30	
				}
			},
			backcolor: {
				action_buttons:{
					doit: '#2196F3'	
				}	
			}
		};

		this.getFiles = function()	{
			
			var url = '/app/getFileList',
					postObj = {
						'google_id': app.stubs.google_id,
						'whichFolder': 'files'
					};

			tools.ajax(url, postObj, 'post', function(data) {
				
				app.stubs.data = data;
				app.paint();
				app.labelDoItButton();
				
			});		
			
		};

		this.resizeElements = function() {
			
			var mainContainerHeight = tools.getScreenDim().height; 
			
			$('#main_container')
				.width( app.settings.dim.main_container )
				.height( mainContainerHeight );
				
			$('body').height( tools.getScreenDim().height );
			
			var shrinkByRatio = (app.settings.dim.main_container / 400);  // ideal
			var boxSideSize = (app.settings.dim.main_container / 2) - 14;
			$('.boxes').width( boxSideSize );
			$('.boxes').height( boxSideSize );
			
			app.stubs.boxesPerMainContainer = Math.ceil(mainContainerHeight / boxSideSize)  * 2;
			
			// console.log('app.stubs.boxesPerMainContainer: ' + app.stubs.boxesPerMainContainer);
			
			$('.buttons_wrapper')
			.width( Math.ceil(app.settings.dim.buttons_wrappers.width * shrinkByRatio)  )
			.height( app.settings.dim.buttons_wrappers.height * shrinkByRatio  )
			.css('left', (app.settings.dim.buttons_wrappers.left * shrinkByRatio) + 'px')
			.css('top', ($('.boxes').height() - app.settings.dim.buttons_wrappers.height)  /2 + 'px');
			
			var marginSpacingformula = ($('.buttons_wrapper').width() - app.settings.dim.action_buttons.width * 2) / 4 ;
			
/*
			$('.action_buttons').css({
				'padding':  '0px',	
				'margin-left':  marginSpacingformula + 'px',	
				'margin-right':  marginSpacingformula  + 'px',
				'width' : app.settings.dim.action_buttons.width
			});
*/
			
			$('.thumbs').css({	
				'max-width':  186 * shrinkByRatio + 'px',	
				'max-height':  186 * shrinkByRatio + 'px'
			});
			
		};

		this.paint = function() {
			
			//"http://placehold.it/200x200"
			// "http://placehold.it/' + tools.randomIntFromInterval(75,450) + 'x' + tools.randomIntFromInterval(75,450) + '"
			// "' + thumbLink + '"\

			var placement = 'left';
			
			if( typeof( app.stubs.painted  ) == 'undefined' &&
					typeof( app.stubs.nextPageToken )  == 'undefined' &&
					typeof( app.stubs.data ) != 'undefined'
			){
				
				$('#main_container').html('');
				
				if( app.stubs.data.length == 0){
					// console.log('No files are present in Pictographr.');
					$('#main_container').html('\
						<img  id="nofilesyetImg" src="https://pictographr.com/partners/assets/startdesign.png" />\
					');
					
				};		
						
			};

			for( var idx in app.stubs.data){

				var obj = app.stubs.data[idx];
				
				var thumbLink = obj.thumbnailLink;
				var fileId = obj.fileId;
				if( placement == 'right') placement = 'left';
				 else placement = 'right';

				var box = '\
					<div  class="boxes">\
						<div  class="buttons_wrapper">\
							<div class="action_buttons doit" thumbLink="' +  thumbLink + '" fileId="' + fileId + '" >\
							</div >\
							<div  class="action_buttons edit" thumbLink="' +  thumbLink + '" fileId="' + fileId + '" >Edit\
							</div >\
							<div    placement="' + placement + '"  class="action_buttons delete" thumbLink="' +  thumbLink + '" fileId="' + fileId + '" >Delete\
							</div >\
						</div>\
						<span class="helper"></span>\
						<img  class="thumbs" src="' + thumbLink + '">\
					</div>\
				';						
				
				$('#main_container').append(box);
			
				app.stubs.painted = true;				
			}

			
		 	this.resizeElements();
		 	this.windowResize();
			this.bind.init.call( this );
			
			if( typeof( this.afterpaint ) != 'undefined') this.afterpaint();
					
		};

		this.bind = {
			
			init: function() {

				this.bind.edit();
				this.bind.doit();
				this.bind.delete();
				
			},
			
			delete: function() {
				
		    $('.delete').unbind('click').click(function(e){
		    	
					var url = 'https://pictographr.com/app/deleteFile',
							postObj = {
								'google_id': app.stubs.google_id,
								'fileId': $(this).attr('fileId')
							};
		
					tools.ajax(url, postObj, 'post', function( response ) {
						// console.log(JSON.stringify(  response   , null, 2 ));
						app.getFiles();
					});		
						
						
				}).popConfirmDelete({
				    title: "Confirmation",
				    content: "Are you sure?"
				})
		    .click(function(e){
		    	e.preventDefault();
		    	var that = this;
		    	$(this).parent().parent().addClass('deleting');
					$('.boxes:not(.deleting)').addClass('disabled');
		    	$('.action_buttons').not(this).addClass('disabled');
					$(this).css({
						'background-color': '#d9534f',
						'border-color': '#d9534f',
						'color': 'white'	
					});
		    });
        
        var doWhenClose = function( that ) {
					$('.delete').parent().parent().removeClass('deleting');
					$('.delete').css({
						'background-color': '#f5f5f5',
						'border-color': '#f5f5f5',
						'color': '#333'	
					});							
					
					$('.boxes:not(.loading) .action_buttons, .boxes').removeClass('disabled');
					
        };		    
		    
        $('.boxes').unbind('click').on('click', function () {
          	doWhenClose();
            $('.action_buttons.delete').popover('hide').removeClass('popconfirm-active');
        });
        

				
			},

			edit: function() {

				$('.edit').unbind('click').click(function(e){
			  	var fileId = $(this).attr('fileId');
			  	var msgObj = {};
					msgObj.msgFrom = nameOfThisFile;
					msgObj['purpose'] = 'edit';	
					msgObj['pollrefresh'] = true;		
					msgObj['google_id'] = app.stubs.google_id;			
					msgObj['fileId'] = fileId;
					tools.crossdom.send(msgObj);  	
			  	e.preventDefault();
			  });			
								
			},
			
			doit: function() {
				
				$('.doit').unbind('click').bind('click', function() {
					app.renderFilePngForPost( this );
				})
								
			}
			
		};
		
		this.progress = {
			
			start: function(that) {
				$(that).parent().parent().addClass('loading');
				$(that).css({'background': 'white', 'border-color': 'white'}).html('\
					<img src="https://pictographr.com/img/smallloading.gif" />\
				');
				$('.action_buttons.edit, .action_buttons.delete').addClass('disabled');
			},
			stop: function( that ) {
				$('.boxes').removeClass('disabled');
				$('.action_buttons.edit, .action_buttons.delete').removeClass('disabled');
				$(that).parent().parent().removeClass('loading');
				$(that).css({'background': app.settings.backcolor.action_buttons.doit , 'border-color': '#5cb85c'}).html(app.stubs.doItLabel);
			}
		};
		
		this.renderFilePngForPost = function( that ) {
			
			app.progress.start( that );
			
			var fileId = $(that).attr('fileId');
			
			var url = '/more/renderFromDrive',
					postObj = {
						'google_id': app.stubs.google_id,
						'fileId': fileId,
						'fileType': 'png'
					};

			tools.ajax(url, postObj, 'post', function(data) {
				
				app.progress.stop( that );
				
				app.stubs.imageId = data.imageId;
				
				var url = 'https://pictographr.com/image/streamDriveImage?google_id=' + app.stubs.google_id + '&fileId=' + data.imageId + '&max_width=40000';
				//console.log(url);
				app.doWithRenderedPNG(url);

			});	
			
		};
		
		this.paintLoginWithGoogleButton = function() {
			
				$('body').find('#main_container').remove();
			
				$('#main_container_wrapper').append('\
					<div  id="main_container" >\
						<div  id="greet-container"  class="block">\
							<div>\
								<img  id="logo" src="https://pictographr.com/favicons/apple-touch-icon-114x114.png">\
							</div>\
							<div>\
								Click below to get started...\
							</div>\
							<div>\
								<img   style="cursor:pointer;width:220px" id="get-started-button"  src="https://pictographr.com/img/loginGoogle.png"/>\
							</div>\
						</div>\
					</div>\
				');
		}
		
		this.deleteRenderedPNGForeverFromDriveTempFolder = function() {
			
			var obj = { 
				fileId: app.stubs.imageId,
				google_id: app.stubs.google_id
			};
			
			tools.ajax( '/more/deleteDriveFileForever', obj, 'post', function( obj ) {
				 // console.log(JSON.stringify(   obj  , null, 2 ));
			});				
			
			return;			
			
			
    	var msgObj = {};
			msgObj['msgFrom'] = 'plugin_extend.js';
			msgObj['purpose'] = 'deleteForever';			
			msgObj['google_id'] = app.stubs.google_id;			
			msgObj['imageId'] = app.stubs.imageId;	
			
			console.log(JSON.stringify(  msgObj   , null, 2 ));
					
			tools.crossdom.send(msgObj);

		};
		
		this.labelDoItButton = function(fileId) {
			$('.doit').html(app.stubs.doItLabel);
		};
		
		this.windowResize = function() {
						
			var	that = this,
					resizeId,
					doneResizing = function() {
						app.settings.dim.main_container = tools.getScreenDim().width;
						that.resizeElements();
					};
					
			$(window).unbind('resize').on(	'resize',
				function() {
					clearTimeout(resizeId);
					resizeId = setTimeout(doneResizing, 500);	
				}
			);
		};
		
		this.createNewPictographrUser  = function( paramObj ){
			
			var url = 'https://pictographr.com/auth/router?selfclose=true&redirect=newfile&refreshSidebarFiles=true&whenUserHasAccountThen=true';
			
			for( var key in paramObj){
				url += '&' + key + '=' + paramObj[key];
			}

			tools.popupwindow(url, "_blank", 800, 650);
			
			this.poll.byAuth();
			
		};

		this.poll = {
			
			init: function() {
				
				$('#main_container').find('#waitingWords').remove();
				$('#main_container').find('#loading').remove();
				$('#greet-container').html('');
				
				$('#greet-container').append('\
					<div  id="waitingWords" > Waiting for Connection\
					<div>\
					<img id="loading" src="https://pictographr.com/img/smallloading.gif">\
				');
			},
			
			polling: undefined,
			
			byAuth: function() {
				
				this.init();
		
				app.poll.polling = setInterval( function() {
					
						tools.crossdom.send({
							msgFrom: nameOfThisFile,
							purpose: 'waitForUserReadyFromPict'	
						})
		
			
				}, 3000);
 
		
			},
			
			byGoogleId: function() {
				var that = this;
				this.init();
			},
			
			byEmail: function() {
				this.init();
			  google.script.run.withSuccessHandler(function( email ) {
			  	
			    // console.log(JSON.stringify(  email   , null, 2 ));
			    app.stubs.email = email;
			    
					var polling = setInterval( function() {
						
						tools.ajax(	
							'https://pictographr.com/auth/getGoogleIdFromEmail', 
							{user_email: app.stubs.email },
							'post', 
							function(obj) {
								
								// console.log(JSON.stringify(  obj   , null, 2 ));
								
								if( obj.status == 'success'){
									clearInterval(polling);
									app.whenUserHasAccountThen(obj);
				
								}else{
									
								};
								
							}
						);
				
					}, 3000); 
			    
			  })
			  .withFailureHandler(app.showError).getUser();	
			}
				
		};



	}
}();