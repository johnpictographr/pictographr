var tools={
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
			inArray: function(needle,	haystack)	{
				var	length = haystack.length;
				for(var	i	=	0; i < length; i++)	{
					if(haystack[i] ==	needle)	return true;
				}
				return false;
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
			popupwindow: function(url, title, w, h) {
				var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
				var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
				
				width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
				height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
				
				var left = ((width / 2) - (w / 2)) + dualScreenLeft;
				var top = ((height / 2) - (h / 2)) + dualScreenTop;
				var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
				
				// Puts focus on the newWindow
				if (window.focus) {
					if(typeof(newWindow)!='undefined') newWindow.focus();
				}
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
			Doit: function( ) {
				
				var that = this;
				
				this.doo = function() {
						
				    that.iterations++;
				    
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
			animate: function( $element, how, numTimes) {
				
				var doitQueue =[];
				
				var miliSecsTillNext = 1500,
						what = function() {
					
							$element.addClass('animated ' + how);
							
							setTimeout(function(){

								$element.removeClass('animated ' + how);
								
							}, miliSecsTillNext/2);
							
						},
						doit = new tools.Doit();
						
					what();
						
					doit.iterations = 1;	
						
					doit.who = $element.attr('id');
					
					doit.what = what;
	
					doit.numTimes = numTimes;

					doit.interval = setInterval(doit.doo, miliSecsTillNext);
				
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
			}
		},
    /************************************************************/
    
		client_id = ( base_url == 'http://localhost/pictographr/html/' ? 
		
		'263278840546-tmtsiam1i9all659akv8s4l20fgmslvj.apps.googleusercontent.com' : 
		'971250203842-rbjl54u2ui93ccb0b2ctkfkonqvmrnsp.apps.googleusercontent.com'   // jamesming#pictographr.com developer
		
		),
		
		scopes = [
			    		'https://www.googleapis.com/auth/drive',
							'https://www.googleapis.com/auth/drive.file', 
							'https://www.googleapis.com/auth/drive.install',
							'https://www.googleapis.com/auth/photos',
							'https://www.googleapis.com/auth/userinfo.profile',
							'https://www.googleapis.com/auth/userinfo.email'
						 ],
		
		googleRefresh = false,  // redirect from google authentication pop up screen
		
		isAppRegisteredWithUser = false,

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
        		'client_id': client_id, 
        		'scope': scopes, 
        		'immediate': true
          },
          handleAuthResult);
		},
		
		google_id = undefined,
		
		controller = 'auth',
		
		handleAuthResult = function(authResult){
			
			// console.log(JSON.stringify(   authResult  , null, 2 ));
			
      if ( typeof( urlGet('refer') ) == 'string' || 
       		 typeof( urlGet('partner_id') ) == 'string' 
      ){
      	
      	tools.cookies.deleteCookie('pi_session');
      	main();
      	
      } else if(authResult && !authResult.error) {
			
					gapi.client.load('plus', 'v1', function() {

					  var request = gapi.client.plus.people.get({
					      'userId': 'me'
					        });
					        
						request.execute(function(resp) {
							
							//console.log(JSON.stringify( resp    , null, 2 ));
							
							if( resp.code == '403' ){  //"reason": "insufficientPermissions"
								
							}else{
								
									google_id = resp.id;
									
									var postObj = {google_id: google_id };
									
									if( typeof( resp.domain ) != 'undefined') { // PLACEHOLDER-USERS.ORGANIZATION_ID=SOMETHING
										postObj['domain'] = resp.domain;
										controller = 'organization';
									}	
									
									tools.ajax(	
										'https://pictographr.com/auth/googleUserExist',  // ALSO SETS SESSIONP
										postObj,
										'post', 
										function(responseObj) {
											
											// console.log(JSON.stringify(  responseObj   , null, 2 ));
											
											if( responseObj.exist == 'false'){
													google_id = undefined;
											};
											
											main();
											
										}
										
									);
							};
							
						});
					}); 
	        
	        
	        
      } else{
      	main();
      }
			
		},
		authUrl = undefined,
		main = function() {
			
			if(typeof(google_id) != 'undefined'){
				
				$('.loginGoogle').find('img').css('opacity', 1).unbind('click').bind('click',  function(e) {
					
					window.location.assign(base_url + "app");
					
				});		
				
			}	else {

				tools.ajax(	
					base_url + controller + '/getAuthUrl', 
					{},
					'post', 
					function( response ) {
						
							console.log(JSON.stringify(  response   , null, 2 ));
							authUrl = response.authUrl;
							
							$('.loginGoogle').find('img').css('opacity', 1).unbind('click').bind('click',  function(e) { 
								e.preventDefault();
								promo.closeToggle();
								$(this).css('cursor', 'pointer');
								tools.popupwindow(authUrl, "_blank", 800, 650);
								
							});												
							
					});				
				
			}	
		
		},
		callbackFromWindowOpener = function(new_google_id) {
			
			console.log('new_google_id: ' + new_google_id);
			
			
			console.log( 'A: ' + typeof( urlGet('partner_id') ) );
			
			console.log( 'B: ' + urlGet('skip_insert'));
			
			console.log( 'C: ' + typeof(urlGet('skip_insert') ) != 'undefined');
			
			// ** refreshes hootsuite channel bar
			if( typeof( urlGet('partner_id') ) == 'string' &&
					typeof( urlGet('opener_reload') ) == 'string' 
			){
				
				console.log('reloading top.opener');
				opener.location.reload();
					
			} else {
				
				console.log('skipping reload of  top.opener');
				
			}

			google_id = new_google_id;
			logInNow();
			
		},
		logInNow = function() {
			
			console.log('google_id: ' + google_id);
			
			var url = base_url + 'auth/authWithGoogle',
					typeOf = 'post',
					arrDataObj={
						google_id: google_id,
						refer: typeof( urlGet('refer') ) == 'string' ? urlGet('refer'): undefined,
						market_id: typeof( window.market_id ) != 'undefined' ? window.market_id: undefined,
						market_name: typeof( window.market_name ) != 'undefined' ? window.market_name: undefined
					},
					callback = function( sessionObj	)	{
						
						var new_width = '';
						var new_height = '';
						var opener_reload = '';
						if( typeof( urlGet('new_width') ) == 'string' )  new_width = 'new_width=' + urlGet('new_width')  + '&';
						if( typeof( urlGet('new_height') ) == 'string' )  new_height = 'new_height=' + urlGet('new_height')  + '&';
						if( typeof( urlGet('opener_reload') ) == 'string' )  opener_reload = 'opener_reload=true&';

						if(	sessionObj	!= false){
							window.location.assign(
								'https://pictographr.com/' + 
								'app' + '?' + 
								new_width + 
								new_height + 
								opener_reload + 
								'state=%7B"newSerial":%20"' + Math.random() + '",%20"action":"create","userId":"' + google_id + '"%7D'
							);
						}else{
							gapi.auth.authorize(
								{'client_id': client_id, 'scope': scopes, 'immediate': false},
								handleAuthResult
							);
						};
					};
					
			console.log(JSON.stringify(  arrDataObj   , null, 2 ));
					
			tools.ajax(	
				url, 
				arrDataObj,
				typeOf, 
				callback
				);

		},
		logOutNow = function() {
			tools.cookies.deleteCookie('pi_session');
		},
		Promo = function() {
			this.show = false;
			this.init = function() {
				
				tools.cookies.deleteCookie('promo_code');
				tools.cookies.deleteCookie('promo_modal_appeared');
				
				if( typeof( window.market_id ) != 'undefined' && tools.inArray( window.market_id, [12, 19, 16, 17] ) && //free
						!tools.cookies.getCookie('promo_modal_appeared') &&
						typeof( urlGet('refer') ) != 'string' 		
				){
					this.doToggle();	
				};
				this.bind();			
			};
			this.bind = function() {
				var that = this;
				$( document ).on('click', '.promoButton, #promo-cancel', function() {
					that.doToggle();
				});
				$( document ).on('click', '#promo-code-button', function() {
					that.process();
				})	
			}
			this.doToggle = function() {
				$('#promo-modal-wrapper').css('top', $('body').scrollTop() + 100 + 'px');
				$('#refer-modal-wrapper').removeClass('bounceInDown').addClass('animated bounceOutUp');
				if( this.show ){
					$('#promo-modal-wrapper').removeClass('bounceInDown').addClass('animated bounceOutUp');
					this.show = false;
				}else{
					$('#promo-modal-wrapper').show().removeClass('bounceOutUp').addClass('animated bounceInDown');
					$('#promo-modal').html('\
						<input  id="promo-code" type="text" class="form-control" placeholder="Promo code">\
						<button id="promo-code-button"  class="btn btn-primary">Try</button>\
						<div  id="needcode_wrapper" >\
							<a id="needcode" href="https://sites.google.com/a/pictographr.com/support/promotions/promo-codes-locations" target="_blank">Need code?</a>\
							<a  id="promo-cancel" >Cancel</a>\
						</div>\
					');
					tools.cookies.deleteCookie('promo_code');
					tools.cookies.deleteCookie('promo_modal_appeared');
					this.show = true;
				};
			}
			
			this.closeToggle = function() {
					$('#promo-modal-wrapper').removeClass('bounceInDown').addClass('animated bounceOutUp');
					this.show = false;
			};
			
			this.process = function() {
				
				var that = this;
				
				if( $('#promo-code').val() == '') {
					tools.animate( $('#promo-modal'), 'shake', 1);
					return;	
				}

				var url = base_url + 'credit/doesPromoExist',
						promoCode = $('#promo-code').val(),
				arrDataObj={
					promo: promoCode
				},
				typeOf = 'post',
				callback = function( response ) {

					console.log(JSON.stringify(   response  , null, 2 ));

					switch(	response.status ){
						
						case 'success': {
							
								tools.cookies.setCookie('promo_code',$('#promo-code').val(), tools.cookies.expires);
								tools.cookies.setCookie('promo_modal_appeared', true, tools.cookies.expires);
								$('#promo-modal').html('\
									<div  id="happyface_wrapper" >\
										<div  class="ot">\
											<img  id="happyface" src="img/md-png/48/ic_insert_emoticon_48.png">\
										</div>\
										<div  class="tt">\
										</div>Yup.&nbsp;&nbsp;It worked!&nbsp;&nbsp;Now click, "Sign in with Google."\
									</div>\
								');
								$('#promo-modal').css('font-size', '15px');
								tools.animate( $('#promo-modal'), 'bounce', 2);
								
								$('.monthly').text(response.monthly);
								$('.yearly').text(response.yearly);
								$('.weeksfree').text(response.weeksfree);
								
								setTimeout(function(){
									$('#pricinglink').click();
									$('.pricespan, .weeksfree').css({'color': 'lightgreen', 'font-weight': 'bold'});
								}, 2000);
								
							break;
							
						}
						
						case 'redeemed': {
								tools.animate( $('#promo-modal'), 'shake', 1);
								$('#promo-code').val('Already redeemed');
						
								setTimeout(function(){
									$('#promo-code').val('');
								}, 3000);		
								
							break;
							
						}
						
						case 'empty': {
								tools.animate( $('#promo-modal'), 'shake', 1);
								
						
								setTimeout(function(){
									$('#promo-code').val('');
								}, 3000);		
								
							break;
							
						}
				
						
					}
				};
					
				tools.ajax(	
					url, 
					arrDataObj,
					typeOf, 
					callback
				);
			}
		},
		promo = new Promo(),
		urlGet = function(name) {
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var	regexS ="[\\?&]"+name+"=([^&#]*)";
			var	regex	=	new	RegExp(	regexS );
			var	results	=	regex.exec(location.href);
			if(	results	== null	)
				return false;
			else
				return results[1];			
		},
		refer = function() {
			
			if( typeof( urlGet('refer') ) == 'string' ){
				
				var url = base_url + 'credit/getRefer',
				arrDataObj={
					refer: urlGet('refer')
				},
				typeOf = 'post',
				callback = function( response ) {
					
					console.log(JSON.stringify( response    , null, 2 ));
					
					if( response.status == 'success'){
						
						setTimeout(function(){
							$('#refer-modal-wrapper').show().removeClass('bounceOutUp').addClass('animated bounceInDown');
							$('#refer-modal').append('\
								Hi,&nbsp;&nbsp;' + response.email + ',<br><br>\
								Your friend,&nbsp;&nbsp;' + response.given_name + ',&nbsp;&nbsp;suggest you try Pictographr, the easy and fun graphic design tools that works with Google Docs.<br><br>\
								Click the&nbsp;&nbsp;"Sign in with Google"&nbsp;&nbsp;button to start.<br><br>\
								<img   style="margin-left:157px"  src="img/md-png/48/ic_insert_emoticon_48.png">\
							');
							
//							setTimeout(function(){
//								tools.animate( $('.loginGoogle'), 'tada', 20);
//							}, 2000);
							
							
							$('.monthly').text(response.monthly);
							$('.yearly').text(response.yearly);
							
							setTimeout(function(){
								//$('#pricinglink').click();
								$('.pricespan').css({'color': 'lightgreen', 'font-weight': 'bold'});
							}, 10000);
							
							
							
						}, 2000);		
										
					} else{
						
						setTimeout(function(){
							$('#refer-modal-wrapper').show().removeClass('bounceOutUp').addClass('animated bounceInDown');
							$('#refer-modal').css('height', '70px').css('width', '450px').append('\
								<img src="img/md-png/24/ic_error_24.png">&nbsp;&nbsp;\
								Darn!&nbsp;&nbsp;&nbsp;The referral code <b>' + urlGet('refer') + '</b> is invalid.\
							');
						}, 2000);		
						
					};
					

				};
					
				tools.ajax(	
					url, 
					arrDataObj,
					typeOf, 
					callback
				);

			};
		},
		partner = function() {
				
			if( urlGet('skip_insert') == 'true' ||
					!urlGet('partner_id')
			){
				
				tools.cookies.deleteCookie('partner_id');
				tools.cookies.deleteCookie('partner_userId');						
				
			} else{
				
				if( typeof( urlGet('partner_id') ) == 'string' ) tools.cookies.setCookie('partner_id', urlGet('partner_id'), tools.cookies.expires);
				if( typeof( urlGet('partner_userId') ) == 'string' ) tools.cookies.setCookie('partner_userId', urlGet('partner_userId'), tools.cookies.expires);
				
			};
			
			if( typeof( urlGet('partner_id') ) == 'string' ){

				setTimeout(function(){
					
					$('#refer-modal-wrapper').show().removeClass('bounceOutUp').addClass('animated bounceInDown');
					
					$('#refer-modal').css('height', '270px').css('width', '450px').load(
							'partners/partnerWelcome.html?version=' + Math.random(), function() {
								$('#partner_logo').attr('src', 'partners/logos/' + urlGet('partner_id') + '.png');
								$('#welcome_msg').load('partners/welcome_messages/' + urlGet('partner_id') + '.html');
								$('#signupGoogle').bind('click',  function(e) {

									e.preventDefault();
									promo.closeToggle();
									$(this).css('cursor', 'pointer');
									tools.popupwindow(authUrl, "_blank", 800, 650);

								})
							});

				}, 2000);		

			};
		},
		otherStuff = function() {
			
			refer();
			
			partner();
			
			if( typeof( window.market_name ) != 'undefined' ){
				tools.cookies.setCookie('market_name', window.market_name, tools.cookies.expires);
				tools.cookies.setCookie('market_id', window.market_id, tools.cookies.expires);
				console.log(tools.cookies.getCookie('market_id'));
			}

			if( typeof( window.track_id ) != 'undefined' ){
				tools.cookies.setCookie('track_id', window.track_id, tools.cookies.expires);
			} else{
				tools.cookies.deleteCookie('track_id');
			};
			
			if( typeof( urlGet('track_id') ) == 'string' ){
				tools.cookies.setCookie('track_id', urlGet('track_id'), tools.cookies.expires);
			};

			if( tools.cookies.getCookie('active_id') ){
				tools.cookies.deleteCookie('active_id');
			};			

			if( tools.cookies.getCookie('launch_id') ){
				tools.cookies.deleteCookie('launch_id');
			};			
			
			promo.init();
			
			//setIsAppRegisteredWithUser();
			createGoogleScriptTag();

      // Mobile Navi Click
      $('nav a').on('click', function(){ 
       if($('.navbar-toggle').css('display') !='none'){
           $(".navbar-toggle").trigger( "click" );
       }
      });
	
			// sticky top
			$(".top-bar").before($(".top-bar").clone().addClass("slidedown"));
			$(window).on("scroll", function () {
			   $("body").toggleClass("slide-menu", ($(window).scrollTop() > 200));
			});
			
			// Scroll Navigation
		  $.scrollIt({	   
		    scrollTime: 1400,
		    easing: 'easeInOutExpo',
		    topOffset: -20,
		  });	
		  
			$('.scrollup, .logoPictographr').click(function(){
			  $("html, body").animate({ scrollTop: 0 }, 1200, 'easeInOutExpo');
			  return false;
			});
			
			/*
			Now you need to do a simple calculation to figure out how many seconds into the video you want it to start. 
			Multiple the number of minutes by 60, then add the seconds. 6*60 + 39 = 399.
			*/
			
			var videos = {
				'1':{
					'title': 'Graphics for Social Media',
					'videoId': 'iU2yCxrrFxk',
					'start':'39'
				},
				'2':{
					'title': 'Infographics',
					'videoId': 'WQP2OumpF9s',
					'start':'0'
				},
				'3':{
					'title': 'Advertising Mailers',
					'videoId': 'AT37Sr9eQqc',
					'start':'0'
				},
				'4':{
					'title': 'Annotated Diagrams',
					'videoId': 'j5oEZNkyosc',
					'start':'426'
				}
			};
			
			for( var video_slide in videos){
				var shortUrl = videos[video_slide]['short-url'];	
				var file_image_fileId = videos[video_slide]['file_image_fileId'];	
				var start = videos[video_slide]['start'];	
				var videoId = videos[video_slide]['videoId'];	
				$('.swiper-wrapper').append('\
			     <div slide_num="' + video_slide + '" class="swiper-slide">\
			     		<iframe frameBorder="0" src=""></iframe>\
			     </div>\
				');
			}

		  var mySwiper = $('.swiper-container').swiper({
		  	 effect: 'slide',
		     mode:'horizontal',
		     loop: true,
		     speed: 950,
		     slidesPerView:  1,
		     grabCursor: true,
		     nextButton: '.arrow-right',
		     prevButton: '.arrow-left',
		     onSlideChangeStart: function(swiper) {
		     	
		     		var slide_num = ( swiper.activeIndex > 4 ? 1: swiper.activeIndex);
		     		
		     		var src = 'https://www.youtube.com/embed/' + videos[slide_num].videoId + '?modestbranding=1&controls=0&showinfo=0&playlist=' + videos[slide_num].videoId + '&start=' + videos[slide_num].start + ' &autoplay=1&loop=1';
		     		
		     		$('div[slide_num=' + slide_num + ']').find('iframe').attr('src', src);
		     	
		     		$('#video-title').text(videos[slide_num].title).addClass('animated bounceInRight');
		     		
		     		$('#video-title').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
		     			$('#video-title').removeClass('animated bounceInRight');
		     		});
		     		
		     },
		     onSlideChangeEnd: function(swiper) {
		     		
		     		return;
		     		
		     		$('#video-title').addClass('animated rotateOutUpLeft');
		     		
		     		$('#video-title').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
		     			$('#video-title').removeClass('animated rotateOutUpLeft');
		     			$('#video-title').text('');
		     		});
		     		
		     		
		     }
		  });
		  
		  // socialdimensions slider
      $("#carousel-gallery").owlCarousel({
				navigation : true, // Show next and prev buttons
				slideSpeed : 300,
				paginationSpeed : 400,
				singleItem:true
      });
      
      
      $('.launchPolicy').click( function() {
      	
      	var which = $(this).attr('which');
				$('.modal-body').load(
					'html/' + which + '.html', function() {
					
					});      	
      });

		  
		  
		  var runThisOnWindowWidth = function() {
			  	var titleIs = 'SOCIAL MEDIA GRAPHICS';
			  	var width = tools.getScreenDim().width;
			  	if( width >= 991){
			  		console.log('A');
			  		$('.fast-address').css({
			  			'left': '',
			  			'float': 'right',
			  		})
			  	} else if(  width >= 768 ){
			  		console.log('B');
			  		$('#video-title').text(titleIs);
			  		$('.fast-address').css({
			  			'left': '',
			  			'float': 'right',
			  		})
			  	} else if (  width >= 600 ){
			  		console.log('C');
			  		$('#video-title').text(titleIs);
			  		var left = (width - $('.fast-address').width()) / 2;
			  		$('.fast-address').css({
			  			'left': left +'px',
			  			'float': 'left',
			  		})
			  	} else{
			  		console.log('D');
			  		var left = (width - $('.fast-address').width()) / 2;
			  		$('.fast-address').css({
			  			'left': left +'px',
			  			'float': 'left',
			  		})	  		
			  		$('#video-title').text(titleIs);
			  	};
		  };
		  
		  
			var doWhenResizeStops;
			window.onresize = function(){
			  clearTimeout(doWhenResizeStops);
			  doWhenResizeStops = setTimeout( runThisOnWindowWidth(), 100);
			};
			   
			runThisOnWindowWidth();

			
		};
		
if(urlGet('out')=='true') logOutNow();

otherStuff();


		
		
		
		