		var popWindow = undefined,
				tools={
				ajax:	function(	url, arrDataObj, type, callback	)	{
					$.ajax({
						url: url + '?v=' + Math.random(),
						type:	type,
				    data: {
				        arrData : arrDataObj
				    },
						dataType:'json',
						success: function(data){
							callback(data);
						},
						error:	function(data){
							callback(data);
						},
						async:false
					});
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
					  return null;					
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
				doWhenReady: function( condition, callback, fromWhere ){
					if( typeof( fromWhere ) != 'undefined'){
						console.log('from:' + fromWhere);
					};
					if( !condition() ){
						setTimeout(function(){
							tools.doWhenReady(condition, callback);
							//console.log('... waiting for ready for: ' + fromWhere);
						}, 500);
					}else{
					  callback();
					};
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
				
				popupwindow: function(url, title, w, h, shift) {
					var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
					var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
					
					width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
					height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
					
					var left = ((width / 2) - (w / 2)) + dualScreenLeft + ( typeof( shift ) != 'undefined' ? shift: 0);
					var top = ((height / 2) - (h / 2)) + dualScreenTop;
					popWindow = window.open(url, 'popWindow', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
					
					// Puts focus on the newWindow
					if (window.focus) {
						if(typeof(popWindow)!='undefined') popWindow.focus();
					}
				},
				openInNewTab: function(url) {
				  win = window.open(url, 'win');
				  console.log(win);
				  win.focus();
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
			},
			
			polling = undefined,
			showedLoginWithGoogleScreen = false,
			showLoginWithGoogleScreen = function(authUrl) {
				
				/*
				URL: https://pictographr.com/auth/router?redirect=newfile&selfclose=1&showLaunchChoice=1&showLoginWithGoogleScreen=1&partner_id=6
				*/
				
				$('body').find('#greet-container').remove();
				
				$('body').append('\
					<div  id="greet-container"  class="block">\
						<div  id="siginWrapper" >\
							<div>\
								<img  id="logo" src="https://pictographr.com/favicons/mstile-144x144.png">\
							</div>\
							<div>\
								Click below to get started...\
							</div>\
							<div>\
								<img   style="cursor:pointer;width:220px" id="get-started-button"  src="https://pictographr.com/img/loginGoogle.png"/>\
							</div>\
						</div>\
						<div  id="waitingWrapper" >\
							<div  id="waitingWords" > Waiting for Connection\
							</div>\
							<div  id="loaderWrapper" >\
								<img id="loading" src="https://pictographr.com/img/smallloading.gif">\
							</div>\
					</div>\
				');

				$('#waitingWrapper').hide();
				$('#siginWrapper').show();
				
				$('#get-started-button').click( function(e) {
					e.preventDefault();
					polling = setInterval( function() {
						
						if( popWindow.closed ) {
							console.log(popWindow.closed);
							$('#waitingWrapper').hide();
							$('#siginWrapper').show();
							clearInterval(polling);
						}
						
			      gapi.auth.authorize({
			        		'client_id': '971250203842-rbjl54u2ui93ccb0b2ctkfkonqvmrnsp.apps.googleusercontent.com', 
			        		'scope': scopes, 
			        		'immediate': true
			          },
			          handleAuthResult);
					}, 3000);
					
					$('#waitingWrapper').show();
					$('#siginWrapper').hide();
					
					tools.popupwindow(authUrl, "_blank", 800, 650, 200);
					
				});
				
				showedLoginWithGoogleScreen = true;
				
			},
			
			killSessionP = function( callback ) {
				tools.ajax(	
					base_url + 'organization/setPSession', // removing stored session because no postobj
					{},
					'post', 
					function( response ) { callback(); }
				);
			},
			
			showLaunchChoice = function() {
				
				$('body').find('#greet-container').remove();
				
				$('body').append('\
					<div  id="choice-container"  class="block">\
						<div>\
							Launch\
						</div>\
						<div  class="choiceWrapper">\
							<div  class="oh">\
								<img  id="logoLaunchIn"  class="picLogo" src="https://pictographr.com/favicons/mstile-144x144.png">\
								<div>Inside</div>\
							</div>\
							<div  class="oh">\
								<img  id="logoLaunchOut"  class="picLogo"  src="https://pictographr.com/partners/assets/launchPicto.png">\
								<div>New window</div>\
							</div>\
						</div>\
					</div>\
				');
				
				var url = 'https://pictographr.com/app';
				
				$('#logoLaunchOut').click( function(e) {
					e.preventDefault();
					killSessionP( function() {
						tools.openInNewTab(url);
					});
				});				

				$('#logoLaunchIn').click( function(e) {
					e.preventDefault();
					killSessionP( function() {
						window.location.assign(url);
					});
				});		
	
			},
	    /************************************************************/
			base_url = 'https://pictographr.com/',    
			scopes = [
				    		'https://www.googleapis.com/auth/drive',
								'https://www.googleapis.com/auth/drive.file', 
								'https://www.googleapis.com/auth/drive.install',
								'https://www.googleapis.com/auth/photos',
								'https://www.googleapis.com/auth/userinfo.profile',
								'https://www.googleapis.com/auth/userinfo.email'
							 ],
			
			createGoogleScriptTag = function() {
				var script = document.createElement('script'),
						src = 'https://apis.google.com/js/client.js?onload=handleClientLoad';
				
				script.setAttribute('src', src);
				
				document.head.appendChild(script);
			},
			
			handleClientLoad = function() {	
	      window.setTimeout(checkAuth, 1);
	    },
	    
			checkAuth = function(){
	      gapi.auth.authorize({
	        		'client_id': '971250203842-rbjl54u2ui93ccb0b2ctkfkonqvmrnsp.apps.googleusercontent.com', 
	        		'scope': scopes, 
	        		'immediate': true
	          },
	          handleAuthResult);
			},
			
			google_id = undefined,
			domain = undefined,
			whichController = 'organization',
			passOnToAppIfUserExist = function( callback ) {
				
				tools.ajax(	// checking if this is existing user for quick passthru
						base_url + "auth/googleUserExist", 
						{google_id: google_id},
						'post', 
						function( response ) {
							
							if( response.exist == 'true'){
								
								// GREEN ROOM

								switch(	tools.urlGet('redirect') ){
									
									case 'newfile': {
										
										console.log(' .... newfile');

										if( typeof( tools.urlGet('showLaunchChoice') ) == 'string' ){
											if( typeof( polling ) != 'undefined' ) clearInterval( polling );
											showLaunchChoice();
										} else{
											proceedTo('app');
											
										}
										
										break;
									}
								}
								
							} else {
								
								// BRAND NEW USER
								
								console.log('This is a brand new user.');
								
								callback( response );
								
							}
							
							
						}
				);
				
			},
			handleAuthResult = function(authResult){
				
//				console.log(JSON.stringify(   authResult  , null, 2 ));
				
				if( typeof( authResult.error ) != 'undefined' && 
					authResult.error == 'immediate_failed'){
						
					// RED ROOM  -- BRAND NEW USER
					console.log('authResult.error = immediate_failed ');
					console.log('RED ROOM');	
					
					if( typeof( tools.urlGet('setUpOrganization') ) == 'string' ) {
						
						// ADMIN
						console.log('admin');
						whichController = 'organization';
						register();
						
						
						return;
						var url = 'https://chrome.google.com/webstore/detail/pictographr/ieeebahbbkmegdegplnlilelieebkldm';
						window.location.assign(url);

						return;
					
					} else if(  typeof( tools.urlGet('setUpMember') ) == 'string' ) {
						
						// MEMBER
						console.log('member');
						whichController = 'organization';
						register();	
						return;							
						
					} else{
						
						// CONSUMER -- ARRIVING FROM ADDON / GETTING STARTED
						console.log('consumer');
						whichController = 'auth';
						register();	
						return;							
						
					}
	
				}
				
				gapi.client.load('plus', 'v1', function() {
	
				  var request = gapi.client.plus.people.get({
				      'userId': 'me'
				        });
				        
					request.execute(function(resp) {
						
						// BLUE ROOM  -- ADDED TO GOOGLE DRIVE
						//console.log(JSON.stringify( resp    , null, 2 ));
						console.log(tools.urlGet('redirect'));
						console.log(resp.id);
						console.log('BLUE ROOM');
						
						google_id = resp.id;
				
						if( typeof( resp.domain ) != 'undefined'){
							
							// ORGANIZATION
							domain = resp.domain;
							console.log(resp.domain);
							
							if( typeof( tools.urlGet('setUpOrganization') ) == 'string' ) {
								
								// ADMIN -- ARRIVING FROM GOOGLE ADMIN / PICTOGRAPHR / SETUP 
								console.log('setUpOrganization');
								console.log('admin');
								console.log('ARRIVING FROM GOOGLE ADMIN / PICTOGRAPHR / SETUP');
								whichController = 'organization';
								register();
								return;	
								
							}
							
							passOnToAppIfUserExist( function( response ) {
								
								// MEMBER -- ARRIVING FROM ADDON / GETTING STARTED
								console.log('member');
								console.log('ARRIVING FROM ADDON / GETTING STARTED');
								whichController = 'organization';
								register();
								return;
									
							});
							
							console.log('end blue room organization. Nothing routed');

						} else{
							
							console.log('Not in an organization.');
							
							// CONSUMER
							passOnToAppIfUserExist( function( response ) {
								
								// NEVER REACH HERE?
								console.log('CONSUMER');
								console.log('never reach');
								whichController = 'auth';
								register();
								return;
								
								if( typeof( tools.urlGet('mustBeInGoogleOrg') ) == 'string' ) {
									
									alert('mustBeInGoogleOrg');
									return;
									
								} else{
								
									console.log('resp.domain is undefined');
									whichController = 'auth';
									register();
									return;
									
								}
								
							});

						}
	
					});
				}); 
				
			},
			authUrl = undefined,
			proceedTo = function(where) {
				
				var parm  = '?';
				
				// if( typeof( tools.urlGet('popSetupModal') ) == 'string' ) parm += 'popSetupModal=true&'
				
				var postObj = {};
				
				if( typeof( tools.urlGet('isOrgAdmin') ) == 'string' ) postObj['isOrgAdmin'] = tools.urlGet('isOrgAdmin');
				
				tools.ajax(	
					base_url + 'organization/setPSession', // removing stored session because no postobj
					postObj,
					'post', 
					function( response ) {
						
						console.log(JSON.stringify(  response  , null, 2 ));

							tools.ajax(	
								base_url + 'auth/setPSession', 
								{ google_id: google_id },
								'post', 
								function(obj) {
									
									console.log(JSON.stringify( obj   , null, 2 ));
									
									console.log(base_url + where + parm);
									
									if( typeof( tools.urlGet('disable') ) == 'string' ) {
										console.log(JSON.stringify(  tools.urlGet()   , null, 2 ));
										console.log('disabled');
										return;
									}
									
									window.location.assign(base_url + where + parm);
									
								}
							);

					}
				);

				
			},
			
			register = function() {
				
				console.log(base_url +  whichController  + '/getAuthUrl');
				
				tools.ajax(	
					base_url +  whichController  + '/getAuthUrl', {'os': tools.whatIs()},
					'post', 
					function( response ) {
						
						var postObj = { 
								domain: domain, 
								redirect: tools.urlGet('redirect')
							}
						
						if( typeof( tools.urlGet('selfclose') ) == 'string' ) postObj['selfclose'] = tools.urlGet('selfclose');
						if( typeof( tools.urlGet('org_type') ) == 'string' ) postObj['org_type'] = tools.urlGet('org_type');
						if( typeof( tools.urlGet('xorg_id') ) == 'string' ) postObj['xorg_id'] = tools.urlGet('xorg_id');
						if( typeof( tools.urlGet('xuser_id') ) == 'string' ) postObj['xuser_id'] = tools.urlGet('xuser_id');
						if( typeof( tools.urlGet('organization_name') ) == 'string' ) postObj['organization_name'] = tools.urlGet('organization_name');
						if( typeof( tools.urlGet('partner_id') ) == 'string' ) postObj['partner_id'] = tools.urlGet('partner_id');
						if( typeof( tools.urlGet('subdomain_id') ) == 'string' ) postObj['subdomain_id'] = tools.urlGet('subdomain_id');
						if( typeof( tools.urlGet('isStudent') ) == 'string' ) postObj['isStudent'] = tools.urlGet('isStudent');
						if( typeof( tools.urlGet('isTeacher') ) == 'string' ) postObj['isTeacher'] = tools.urlGet('isTeacher');
						if( typeof( tools.urlGet('isOrgAdmin') ) == 'string' ) postObj['isOrgAdmin'] = tools.urlGet('isOrgAdmin');
						if( typeof( tools.urlGet('whenUserHasAccountThen') ) == 'string' ) postObj['whenUserHasAccountThen'] = tools.urlGet('whenUserHasAccountThen');
						if( typeof( tools.urlGet('refreshSidebarFiles') ) == 'string' ) postObj['refreshSidebarFiles'] = tools.urlGet('refreshSidebarFiles');
						if( typeof( tools.urlGet('popSetupModal') ) == 'string' ) postObj['popSetupModal'] = tools.urlGet('popSetupModal');
						
						
						console.log(JSON.stringify( postObj    , null, 2 ));
						tools.ajax(	
							base_url + 'organization/setPSession', 
							postObj,
							'post', 
							function() {
									
								if( typeof( tools.urlGet('disable') ) == 'string' ) {
									console.log('disabled');
									return;
								}
								if( typeof( tools.urlGet('showLoginWithGoogleScreen') ) == 'string' ){
									
										if( ! showedLoginWithGoogleScreen ){
											showLoginWithGoogleScreen(response.authUrl);
										}
										
								} else{
									
									if( typeof( tools.urlGet('showLaunchChoice') ) == 'string' ){
										if( typeof( polling ) != 'undefined' ) clearInterval( polling );
										showLaunchChoice();
									} else{
										
										window.location.assign(response.authUrl);
										
									}
									
								}
								
							}
						);
						

					}
				);		
			
			};