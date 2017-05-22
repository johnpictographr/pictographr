	//if( window.isInOrganization ){
	if( window.isOrgAdmin ){
		
		app.methods.welcome = {
							
				widthModal: 680,
				heightModal: 450,
				marginAndBorder: 5,
				noSlides: 0,
				slideSeen: 1,
				
				init: function() {
					
					console.log(' User is in an organization.');
					$.extend(	true,	this, app.methods.payment);	
					this.launchModal();
				},
				
				launchModal: function() {
					
						var that = this;
								
						$('#modal-box')
							.width(this.widthModal)
							.height(this.heightModal);
						var canDisable = false;
						app.methods.modal.on( canDisable );	
						
						$('#modal-box').load('html/welcome_modal.html?version=' + version,
							function() {
								
								tools.ajax('auth/welcome', {google_id: app.stubs.google_id}, 'post', function(obj) {
									
									/*		
									if( typeof( window.showAddOnDocInstructions ) != 'undefined'  ) {
										
										var linkToDocsAddon = 'https://chrome.google.com/webstore/detail/pictographr/caciecpbeplbnhidenfjgkhihenbfegn';
										var linkToSheetsAddon = 'https://chrome.google.com/webstore/detail/pictographr/jomkekoebpcpibnhagmiicljcjakihpa';
										var linkToFormsAddon = 'https://chrome.google.com/webstore/detail/pictographr/cinkoikokhobnbpbmjfkpnjnccdbhebd';
										
										$('#welcome-breadcrumb-container li:nth-child(2)').after('\
											<li  class="addonDocInstructions"><span>Install Add-ons</span></li>\
										');
										
										$('#welcome-slide-container .slide-panel:nth-child(2)').after('\
											<div  class="slide-panel addonDocInstructions" >\
												<div>\
													<div  id="addonDocInstructions-title">\
														Install Add-ons for Google Apps.&nbsp;&nbsp;Click on each to install.<br />\
													</div>\
												</div>\
												<div  id="addonDocInstructions-div"  >\
													<a href="' +  linkToDocsAddon + '" target="_blank">\
														<img src="img/addonDocs.png">\
													</a>\
													<a href="' +  linkToSheetsAddon + '" target="_blank">\
														<img src="img/addonSheets.png">\
													</a>\
													<a href="' +  linkToFormsAddon + '" target="_blank">\
														<img src="img/addonForms.png">\
													</a>\
												</div>\
											</div>\
										');
									}
									*/
									
									that.layout.call(that, obj);
									that.bind.init.call(that);
									that.promotion();
									that.refer.init();
									
								});

							}
						);
				},
				
				layout: function(obj) {
					
//					console.log(JSON.stringify(  obj   , null, 2 ));
					
					var countSlides = function() {
								return $('#long-wrapper').find('.slide-panel').length;
							};
							
					this.noSlides = countSlides();

					$('#long-wrapper').css({
					 width: (this.widthModal + this.marginAndBorder) * this.noSlides + 'px'	
					});
					$('#share-container, .slide-panel').css({
					 width: this.widthModal + 'px'	
					});
					
					$('#welcome-message-div').html(obj.welcome_text);
					$('#why-allow-email-is-good-div').html(obj.promo_message);
					$('#welcome-terms-div').html(obj.terms);
				},
				
				bind: {
					
					init: function() {	

						this.bind.nav.call( this );
						this.bind.allowEmailPromotion.call( this );
						this.bind.acceptTerms.call( this );
						
					},
					
					nav: function() {
		
						var that = this,
								slideAllowed = 1,
								curSlide = 1,
								changeButton = function() {
									if( that.slideSeen == that.noSlides ){
										$('#continue-button').text('Get Started');
									}
									else{
										$('#continue-button').text('Continue');
									}
								},
								highlightBreadCrumbUpToslideSeen = function(){
									
									$('.breadcrumb-steps li a').css({		
										background: '#C6DBFC'
									});
										
									$('#welcome-breadcrumb-container').find('style').remove();
					
									var styleIs = '<style>';
					
									for( var idx = 1; idx <= that.noSlides; idx++){
										styleIs += '\
											.breadcrumb-steps li:nth-child(' + idx + ') span:after{border-left-color: #C6DBFC;}\
										';
									}
									
									for( var idx = 1; idx <= that.slideSeen; idx++){
										
										$('.breadcrumb-steps li:nth-child(' + idx + ') span').css({		
											background: '#4285F7',
											cursor: 'pointer'
										});					
										
										styleIs += '\
											.breadcrumb-steps li:nth-child(' + idx + ') span:after{border-left-color: #4285F7;}\
										';
									}
									
									styleIs += '</style>';
									
									styleIs =  styleIs.replace(/[\n\r]+/g, '');
									styleIs =  styleIs.replace(/\s{2,10}/g, ' ');	
											
									$('#welcome-breadcrumb-container').prepend(styleIs);	
																		
								};
						
						$('.breadcrumb-steps li').on('click', function() {
							
							var gotoSlide = $(this).index() + 1;
							if( gotoSlide > slideAllowed) return;
							if( gotoSlide > that.slideSeen) {
//										console.log('gotoSlide :' + gotoSlide);
//										console.log('slideSeen :' + that.slideSeen);
//										console.log('clicked');
								highlightBreadCrumbUpToslideSeen();
							}
							curSlide = $(this).index() + 1;
//									console.log('curSlide' + curSlide);
							$('#welcome-slide-container').scrollTo($('#welcome-slide-container .slide-panel:nth-child(' + curSlide + ')'), 300, function(){
								changeButton();
							});
							return false;
						});
		
						app.methods.buttonDo.pressdown($('#continue-button'));
				
						$('#continue-button').on('click', function() {

							if( that.slideSeen == that.noSlides){
								
								if( $('#acceptTerms').is(":checked") ){
									
									$('#modal-box').addClass('animated bounceOutUp');

									
									$('#modal-box').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
										$('#modal-box').removeClass('animated bounceOutUp');
										app.methods.modal.off('A4');
										$('#modal-box').unbind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');											
									});
									
								}else{
									toast('Please accept "Terms and Conditions" to continue', 'keep', 5000, 'info', 'Note.');
								};

							} else{
								
								curSlide++;
						
								if( curSlide == 3 && $('#friend-email').val() != ''){
									
									toast( 'You forgot to click the send button. Or try clearing out the email field.', 'keep', 10000, 'error', 'Opps');
									curSlide--;
									return false;
								};
								
								that.slideSeen++;
								slideAllowed++;
								$('#foo').append('slide seen: ' + that.slideSeen);
								
								highlightBreadCrumbUpToslideSeen();
								//console.log($('#welcome-slide-container .slide-panel:nth-child(' + that.slideSeen + ')'));
								$('#welcome-slide-container').scrollTo($('#welcome-slide-container .slide-panel:nth-child(' + that.slideSeen + ')'), 300, function(){
									changeButton();
								});
							}
						return false;
						});
					},
					
					allowEmailPromotion: function() {
						
						$(document).on('click', '#allowEmailPromotion', function() {
							
							var postObj = {
										field: 'allowEmailPromotion',
										google_id: app.stubs.google_id,
										value: ( $('#allowEmailPromotion').is(":checked") ? 1: 0 ),
										'os': tools.whatIs()
									};

							var url = 'auth/toggleAccept';
									
							tools.ajax(url, postObj, 'post', function(obj) {
								
								console.log(JSON.stringify(  obj   , null, 2 ));
								
							});
								
							
						})								
					},
					
					acceptTerms: function() {
						
						$(document).on('click', '#acceptTerms', function() {
							
							var postObj = {
										'field': 'acceptTerms',
										'value': ( $('#acceptTerms').is(":checked") ? 1: 0 ),
										'google_id': app.stubs.google_id,
										'os': tools.whatIs()
									};

							var url = 'auth/toggleAccept';
							
							console.log(JSON.stringify(  postObj   , null, 2 ));	
								
							tools.ajax(url, postObj, 'post', function(obj) {
								
								$('#welcomeLink').parent().hide();
								console.log(JSON.stringify(  obj   , null, 2 ));
								
								
								if( typeof( tools.urlGet('whenUserHasAccountThen') ) == 'string' ) {
									if( opener ) opener.whenUserHasAccountThen(app.stubs.google_id);
								}
								console.log( typeof( tools.urlGet('whenUserHasAccountThen') ));
								console.log(opener);
								
							});		
						})	
					}
					
				}
							
		};
		
		app.methods.account = {

				widthModal: 500,
				heightModal: 175,
				
				getAccountData: function() {
					
					var that = this;
					
					var url = 'organization/getOrgUserData';
							
					tools.ajax(url, { google_id: app.stubs.google_id}, 'post', function(obj) {

						console.log(JSON.stringify( obj    , null, 2 ));
						
						app.stubs.status_id = obj.status_id;
						app.stubs.niceTrialEndDate = obj.niceTrialEndDate;
						$('#top-message').html(obj.welcome);
						
						if( tools.inArray(window.status_id, [1, 2])){
							
							that.fillCreditTables(obj);
							that.refer.init();
							that.promotion();
						}
						
					});
				},												
				
				init: function() {
					$.extend(	true,	this, app.methods.payment);
					this.launchModal();
				},
				
				launchModal: function() {
						var that = this;
						
						if( tools.inArray(window.status_id, [1, 2])){
							this.widthModal = 600;
							this.heightModal = 590;							
						};
		
						$('#modal-box')
							.width(this.widthModal)
							.height(this.heightModal);
							
						if( !window.accountActive){
							var canDisable = false;
						} else{
							var canDisable = true;
						};
						
						app.methods.modal.on( canDisable );	
						
						$('#modal-box').load('html/account_organization_modal.html?version=' + version,
							function() {
								
								if( !window.accountActive){
									$('.close-button-wrapper').hide();
								};
								
								if( tools.inArray(window.status_id, [1, 2])){
									
									$('#top-message').css('height', '79px');
									
									$('#accountPickerWrapper .nav, .account-content').show();
									
									that.tailorSize();
									
									that.bindSlider();
									
								};
												
								that.getAccountData();
								
							}
						);
				},
				
				fillCreditTables: function(obj) {
					
					
					$('.myreferral-list').empty();
	  	  	$('#promo-count').text(obj.creditArray.promo.earned - 1);
	  	  	$('#credit-count').text(obj.creditArray.total - 1);
	  	  	$('#adddays-count').text(obj.creditArray.days);		
	  	  	
	  	  	$('.referral-list').empty();
	  	  						
	  	  	for( var idx in obj.creditArray.refer.list){
	  	  		var referral = '<tr  class="' + 
	  	  			( tools.isOdd(idx) ? 'normalRow': 'alternateRow' ) + 
	  	  			'" ><td>' + obj.creditArray.refer.list[idx].email + 
	  	  			'</td><td>' + obj.creditArray.refer.list[idx].redeemed + 
	  	  			'</td><td>' + obj.creditArray.refer.list[idx].nicedate + 
	  	  			'</td></tr>';
	  	  		$('.referral-list').append(referral);
	  	  	}
	  	  	
	  	  	$('.promo-list').empty();
	  	  	
	  	  	for( var idx in obj.creditArray.promo.list){
	  	  		var promo = '<tr  class="' + 
	  	  			( tools.isOdd(idx) ? 'normalRow': 'alternateRow' ) + 
	  	  			'" ><td>' + obj.creditArray.promo.list[idx].merchant_name + 
	  	  			'</td><td>' + obj.creditArray.promo.list[idx].promo_code + 
	  	  			'</td><td>' + obj.creditArray.promo.list[idx].nicedate + 
	  	  			'</td></tr>';
	  	  		$('.promo-list').append(promo);
	  	  	}
	  	  	

				},						
				
				isTrialStatus: function() {
					return tools.inArray(app.stubs.status_id, [1, 2]);
				},
				
				isSubscriptionStatus: function() {
					return tools.inArray( app.stubs.status_id, [5, 6, 7, 9] );
				},
				
				isStatusCanceled: function() {
					return tools.inArray( app.stubs.status_id, [4, 8] );
				},

				disablePromoButton: function() {
					$('#promotion-button').addClass('isDisabled');
					$('#promotion-button').css({
						'-webkit-box-shadow': 'none',
						'-moz-box-shadow': 'none',
						'box-shadow': 'none'
					});
				},

				showCanceledStuff: function() {
					
					$('.refer-stuff, .subscription-stuff, .trial-stuff').hide();
					$('#link-name-1').text('Subscribe');
					
					$('button[type=button].subscription').each( function() {
						$(this).appendTo($('#subscription-button-wrapper'));
					});
				},
				
				showTrialStuff: function() {
					
					$('.subscription-stuff').hide();
				},
				
				showTrialStuffHasCreditCardOnFile: function() {
					
					$('.trial-stuff').show();
					app.methods.account.tailorSize();

					$('#link-name-1').text('Card');
					$('#link-name-2').text('Subscribe');
					
					$('#link-name-2').click();

					var $divElem = $(document.createElement("div"));
					$divElem.attr('id', 'subscribe-message');
					$divElem.html('To continue using Pictographr beyond your trial period,&nbsp;&nbsp;please choose a plan and subscribe.');
					$divElem.addClass('button-message');
					
					$divElem.appendTo($('#subscription-button-wrapper'));
					
					$('#plan_wrapper').appendTo($('#subscription-button-wrapper'));
												
					$('#subscribe-button').appendTo($('#subscription-button-wrapper'));
					
				},
				
				getSwitchMessage: function() {
					if( app.stubs.status_id == 9 ){ // transition
						var oldPlan = ( app.stubs.subscription_interval == 1  ? 'monthly' : 'yearly');
						var message = 'You can still decide to keep your $' + app.stubs.pricing[oldPlan] +  ' ' + oldPlan + ' plan.&nbsp;&nbsp;If you do, you will continue on the ' + oldPlan + ' plan.';
					}else if( app.stubs.status_id == 6 ){ // subscribed
						var newPlan = ( app.stubs.subscription_interval == 1  ? 'yearly':  'monthly');
						var message = 'You can switch to a $' + app.stubs.pricing[newPlan] +  ' ' + newPlan + ' plan.&nbsp;&nbsp;If you do, you will be switched and billed for the new ' + newPlan + ' plan at the end of this billing cycle.';
					}else if( app.stubs.status_id == 5 ){ // starts
						var newPlan = ( app.stubs.subscription_interval == 1  ? 'yearly':  'monthly');
						var message = 'You can switch to a $' + app.stubs.pricing[newPlan] +  ' ' + newPlan + ' plan when your subscription begins on ' +  app.stubs.niceTrialEndDate +  '.';
					};
					return message;
				},
				
				getUnsubscribeMessage: function() {
					if( app.stubs.status_id == 5 ){ // starts
						var message = 'You can end your future subscription to Pictographr.&nbsp;&nbsp;If you do, you can still continue your trial period until ' + app.stubs.niceTrialEndDate + '.';
					}else if( app.stubs.status_id == 6 ) { // subscribed
						var message = 'You can end your subscription to Pictographr.&nbsp;&nbsp;If you do,&nbsp;&nbsp;you will continue to have access to this service until your next billing cycle.';
					}else if( app.stubs.status_id == 9 ) { // subscribed
						var message = 'You can end your subscription to Pictographr.&nbsp;&nbsp;If you do, future plan transitions will be canceled and you will still continue to have access to this service until your next billing cycle.';
					};
					return message;
				},						
				
				showSubscriptionStuff: function() {
					
					$('.refer-stuff, .subscription-stuff').show();
					
					$('.trial-stuff').hide();
					$('#link-name-1').text('Credit Card');
					$('#link-name-2').text('Subscription');

					var messages = {
						'unsubscribe': app.methods.account.getUnsubscribeMessage(),
						'switch': app.methods.account.getSwitchMessage(),
						'resubscribe': 'You can resubscribe and avoid interrurption to this service at the end this next billing cycle.'
					};
					
					$('button[type=button].subscription').each( function() {
						
			    	var buttonNameArray = $(this).attr('id').split('-'),
								buttonName = buttonNameArray[0];
						var $divElem = $(document.createElement("div"));
						$divElem.attr('id', buttonName + '-message');
						$divElem.html(messages[buttonName]);
						$divElem.addClass('button-message');
						
						$divElem.appendTo($('#subscription-button-wrapper'));
						$(this).appendTo($('#subscription-button-wrapper'));
					});
				},
				
				displayPlanwrapper: function() {
						
						$('#plan_wrapper').hide();
						
						if( tools.inArray( app.stubs.status_id, [1, 2, 3, 4, 8] )){
							$('#plan_wrapper').show();
						}
						
						return;
						
						$('#plan_wrapper').css('visibility', 'hidden');
						
						if( tools.inArray( app.stubs.status_id, [1, 2, 3, 4, 8] )){
							$('#plan_wrapper').css('visibility', 'visible');
						}
				},
				
				displayButtons: function() {
					
						console.log('displaying buttons');
					
						switch(	app.stubs.status_id  ){
							case 1:
				  	  case '1': { // initial
				  	  	
				  	  	if( app.stubs.hasCreditCardOnFile){
				  	  		var buttons2Show = ['update', 'subscribe'];
				  	  	}else{
				  	  		var buttons2Show = ['subscribe'];
				  	  	};
								
				  	  	break;
				  	  }
				  	  case 2:
				  	  case '2': { // trial is extended
				  	  	
				  	  	if( app.stubs.hasCreditCardOnFile){
				  	  		var buttons2Show = ['update', 'subscribe'];
				  	  	}else{
				  	  		var buttons2Show = ['subscribe'];
				  	  	};
				  	  	
				  	  	break;
				  	  }
				  	  case 3:
				  	  case '3': { // pending subscription is canceled by user
								var buttons2Show = ['subscribe'];
				  	  	break;
				  	  }
				  	  case 4:
				  	  case '4': { // trial expired
								var buttons2Show = ['subscribe'];
				  	  	break;
				  	  }
				  	  case 5:
				  	  case '5': { // start
								var buttons2Show = ['update', 'unsubscribe', 'switch'];
				  	  	break;
				  	  }
				  	  case 6:
				  	  case '6': { // subscribed
								var buttons2Show = ['update', 'unsubscribe', 'switch'];
				  	  	break;
				  	  }
				  	  case 7:
				  	  case '7': { // limited - will cancel when subscription cycle ends
								var buttons2Show = ['update', 'resubscribe'];
				  	  	break;
				  	  }
				  	  case 8:
				  	  case '8': {  // subscription canceled by user
								var buttons2Show = ['subscribe'];
				  	  	break;
				  	  }
				  	  case 9:
				  	  case '9': { // transition between plans
								var buttons2Show = ['update', 'unsubscribe', 'switch'];
				  	  	break;
				  	  }
						}
						
						$('.subscription, .button-message').hide();

						for( var idx in buttons2Show){
							$('#' + buttons2Show[idx]+ '-button').show();
							$('#' + buttons2Show[idx]+ '-message').show();
						}
						  	  	
	  	  		if( app.stubs.status_id == 9){ // transition
	  	  			$('#switch-button').html('SWITCH BACK');
	  	  		}else{
	  	  			$('#switch-button').html('SWITCH PLAN');
	  	  		};
	  	  	
				},
				
				tailorSize: function() {
					
					
					var modalWidth = $('#accountPickerWrapper').width(),
							countTabs = $('#accountPickerWrapper').find('.account-tab-panel:visible').length;
							
					this.tabWidth = modalWidth / countTabs;
					
					$('#accountPickerWrapper .nav li, #accountPickerWrapper .moving-line').width(this.tabWidth);
					$('.account-stretched-wrapper').width(modalWidth * countTabs);		
				},
				
				bindSlider: function() {
					
					var that = this;
					
					$('#accountPickerWrapper a')
						.not($('a#amabassador_program'))
						.not($('a.addonImages'))
						.not($('a.unlicenced-count'))
						.not($('a.launchAddon'))
						.unbind('click').click(function (e) {
						
						var idx = $(this).parent('li:visible').index();
						
						that.slideToPanel(idx, 400);
						
						var timeoutID = window.setTimeout(function(){
							$('.ripple-wrapper').empty();
						}, 5000);
						
					})
				},
				
				slideToPanel: function( idx, speed ) {
					
					if( idx == 3 && this.isSubscriptionStatus(app.stubs.status_id)){
						var tabLeft = this.tabWidth;
					}else if(  idx == 4 && this.isSubscriptionStatus(app.stubs.status_id) ){
						var tabLeft = this.tabWidth * 2;
					}else{
						var tabLeft = idx * this.tabWidth;
					};

					$('#accountPickerWrapper').find('.moving-line').css({'left': tabLeft + 'px'});
					
					var $selected = $('#accountPickerWrapper').find('.account-tab-panel:eq( ' + (idx)+ ' )');
					
					$('#accountPickerWrapper').find('.account-content').scrollTo($selected, speed);
					
				}
		}
		
	};

	if( window.isOrgAdmin ){
		
		$('#welcomeLink').parent().hide();
		
		var state = {
			initial: {},
			active: {}	
		};
		
		var sharedMethods = {
			
			widthModal: 800,
			heightModal: 520,		
				
			init: function() {
				Stripe.setPublishableKey('pk_live_TLEYccungtKOtiCXgreaNrjq');
				this.getAccountData();
			},
			
			getAccountData: function() {
				
				var that = this;
				
				var url = 'organization/getAccountData';
						
				tools.ajax(url, { google_id: app.stubs.google_id}, 'post', function(obj) {
					
					that.launchModal(obj);

				});
			},
			
			buildAddSeatsInputTable: function() {
				tools.ajax('organization/getSubscriptionsorgs', {google_id: app.stubs.google_id}, 'post', function( response ) {	
					
					console.log(JSON.stringify(   response  , null, 2 ));
					
					var whichRow;
					
					$('#add_blocks_table').append('\
						<thead  class="fixedHeader">\
							<tr>\
								<th>License Count\
								</th>\
								<th>Monthly Cost\
								</th>\
								<th>Annual Cost\
								</th>\
							</tr>\
						</thead>\
						<tbody  id="add_blocks_table_plans"  class="scrollContent">\
						</tbody>\
					');
					
					var count = 0;
					
					var plans = response.plans;
					app.stubs.unlicencedCount = response.unlicencedCount;
					app.stubs.availableLicensesCount = response.availableLicensesCount;
					
					$('.unlicenced-count').text(app.stubs.unlicencedCount);
					$('.unassigned-license-count').text(app.stubs.availableLicensesCount);
					
					for( var idx in plans){
						
						count++;
						
						if( tools.isOdd( count )) whichRow = 'normalRow';
						else whichRow = 'alternateRow';
						
						$('#add_blocks_table_plans').append('\
							<tr  class="' + whichRow + '">\
								<td>&nbsp;&nbsp;' + plans[idx]['count'] + ' seats</td>\
								<td><input addSeatCount=' + plans[idx]['count'] + ' cost=' + plans[idx]['monthly'] + '  new_subscription_interval="1" name="stripe_plan" type="radio" value="' + plans[idx]['stripe_monthly_plan'] + '">&nbsp;&nbsp;$' + plans[idx]['monthly'] + '</input></td>\
								<td><input addSeatCount=' + plans[idx]['count'] + ' cost=' + plans[idx]['yearly'] + '  new_subscription_interval="2" name="stripe_plan" type="radio" value="' + plans[idx]['stripe_yearly_plan'] + '">&nbsp;&nbsp;$' + plans[idx]['yearly'] + '</input></td>\
							</tr>\
						');
					}
					
					$('input[name=stripe_plan]').bind('click',  function() {
						
						var new_subscription_interval = $(this).attr('new_subscription_interval');
						$('#new_subscription_interval').val(new_subscription_interval);
		
						var addSeatCount = $(this).attr('addSeatCount');
						$('#addSeatCount').val(addSeatCount);
						
						var cost = $(this).attr('cost');
						$('#cost').val(cost);						
						
					})
					
					app.stubs.isOrgCreditOnFile = response.isOrgCreditOnFile
					if( !app.stubs.isOrgCreditOnFile ){							
						$('#update-button').text('BUY LICENSES');			
					};
					
				});					
			},			
			
			tailorSize: function() {
				
				var modalWidth = $('#accountPickerWrapper').width(),
						countTabs = $('#accountPickerWrapper').find('.account-tab-panel:visible').length;
						
				this.tabWidth = modalWidth / countTabs;
				
				$('#accountPickerWrapper .nav li, #accountPickerWrapper .moving-line').width(this.tabWidth);
				$('.account-stretched-wrapper').width(modalWidth * countTabs);		
				
				//console.log($('.account-stretched-wrapper').width()/countTabs);
				
				$('.account-tab-panel').css('width', this.widthModal + 'px');
						
			},
			
			bindSlider: function() {
				
				var that = this;
				
				$('#accountPickerWrapper a')
				.not($('a#amabassador_program'))
				.not($('a.addonImages'))
				.not($('a#contactus'))
				.not($('a.unlicenced-count'))
				.not($('a.launchAddon'))
				.unbind('click').click(function (e) {
					
					var idx = $(this).parent('li:visible').index();
					
					that.slideToPanel(idx, 400);
					
					var timeoutID = window.setTimeout(function(){
						$('.ripple-wrapper').empty();
					}, 5000);
					
				})
			},
			
			slideToPanel: function( idx, speed ) {
				
				var tabLeft = idx * this.tabWidth;
				
				$('#accountPickerWrapper').find('.moving-line').css({'left': tabLeft + 'px'});
				
				var $selected = $('#accountPickerWrapper').find('.account-tab-panel:eq( ' + (idx)+ ' )');
				
				$('#accountPickerWrapper').find('.account-content').scrollTo($selected, speed);
				
			},
		}
		
		state['welcome'] = $.extend(	true,	{
			
			launchModal: function(obj) {
				
					var that = this;
							
					$('#modal-box')
						.width(this.widthModal)
						.height(this.heightModal);
					
					$('#modal-box').load('html/organization_welcome_modal.html?version=' + version,
						function() {

							
							if( !window.isInOrganization ) {
								$('.addonDocInstructions').show();
							} else{
								$('.addonDocInstructions').hide();
							};
							
							var canDisable = false;
							app.methods.modal.on( canDisable );	
							that.present();
							that.bindSlider();
							
							that.tailorSize();
	
							that.bindButtons();
							
						}
					);
			},
														
			present: function() {
				
				tools.ajax('organization/getTerms', {}, 'post', function(obj) {
					
					$('#welcome-terms-div').html(obj.terms);
					
				});

			},
			
			bindButtons: function() {
				
				console.log('displaying buttons');
				
				$('#launchMarketPlace').unbind('click');
			
				$('.continue').on('click', function(e) {
					$('#' + $(this).attr('next') ).click();
				});
				
				
				$(document).on('click', '#acceptTerms', function() {
					
					var postObj = {
								'field': 'acceptTerms',
								'value': ( $('#acceptTerms').is(":checked") ? 1: 0 ),
								'google_id': app.stubs.google_id,
								'os': tools.whatIs()
							};

					var url = 'organization/toggleAccept';
					
					console.log(JSON.stringify(  postObj   , null, 2 ));	
						
					tools.ajax(url, postObj, 'post', function(obj) {
						
						window.orgAcceptTerms = ( $('#acceptTerms').is(":checked") ? 1: 0 );
						console.log(JSON.stringify( obj    , null, 2 ));
						
					});		
				})	

				$('.launching').on('click', function(e) {
					
					if( $('#acceptTerms').is(":checked") ){
						
						if( $(this).attr('id') == 'subscribe-button'){
							var $selected = $('#accountPickerWrapper').find('.account-tab-panel:eq(0)');
							$('#accountPickerWrapper').find('.account-content').scrollTo($selected, 400, function() {
								app.methods.account = state['account'];
								app.methods.account.init();	
							});		     
						}else{
							$('.close-button').click();
						};
						
						app.methods.account = state['account'];
						
					}else{
						toast('Please accept "Terms and Conditions" to continue', 'keep', 5000, 'info', 'Note.');
					};
					
				});
				
			},
			

		}, sharedMethods);
		
		state['initial'] = $.extend(	true,	{
			
			launchModal: function(obj) {
				
					var that = this;
							
					$('#modal-box')
						.width(this.widthModal)
						.height(this.heightModal);
						
					$('#modal-box').load('html/organization_intial_modal.html?version=' + version,
						function() {
							
							var canDisable = true;
							app.methods.modal.on( canDisable );	
							
							that.present();
							that.bindSlider();
							
							that.tailorSize();
	
							that.bindButtons();

							that.bindStripeSubmit.call( that );
							
						}
					);
			},
														
			present: function() {
				
				$('#link-name-1').text('Credit Card');
				$('#link-name-2').text('Subscriptions');
				
				this.buildAddSeatsInputTable();

				setTimeout(function(){
					$('#link-name-3').click();
				}, 1000);

			},
			
			bindButtons: function() {
				
				console.log('displaying buttons');
			
				$('#organization-container').on('click', 'button#continue-button', function(e) {
					
					$('#link-name-2').click();
					
				});
				
				$('#organization-container').on('click', 'button#cc_submit', function(e) {
					
					 if( typeof( $('input[name=stripe_plan]:checked').val() ) == 'undefined' ) {
					 	toast('Please check a plan.', 'keep', 5000, 'info', 'Note.');
					 	return false;
					 }
					
					app.methods.loading.on();
					app.methods.progressBar.start();
				});

			},
			
			bindStripeSubmit: function() { 
				
				 var that = this;

		     $('#subscribe-form').submit(function(e) {

		       var $form = $(this);
		       $form.find('button').prop('disabled', true);
		       $form.find('button').attr("disabled", "disabled");
		       Stripe.card.createToken($form, that.stripeResponseHandler);
		       return false;	
		       
			   });								   
			   									
			},
			
			stripeResponseHandler: function(status, response) {

				console.log(JSON.stringify(  response   , null, 2 ));
				var $form = $('#payment-form');
				
				if( typeof( response.error ) != 'undefined'){
					
					$form.find('.payment-errors').text(response.error.message);
					$form.find('button').prop('disabled', false);									
					app.methods.progressBar.stop();
					toast(response.error.message, 'keep', 5000, 'error', 'Something went wrong.');
					
				}else{
					
					var addSeatCount = $('#addSeatCount').val();

					var postObj = {
								'token': response.id,
								'google_id': app.stubs.google_id,
								'cost': $('#cost').val(),
								'stripe_plan': $('input[name=stripe_plan]:checked').val(),
								'addSeatCount': addSeatCount,
								'new_subscription_interval': $('#new_subscription_interval').val()
							};

					tools.ajax('organization/subscribe', postObj, 'post', function(obj) {
						
						console.log(JSON.stringify(  obj   , null, 2 ));
						
						if( obj.status == 'succeeded' ){
	
							app.methods.loading.off();
							app.methods.progressBar.stop();
							$form.find('button').prop('disabled', false);
							
							toast('Block for ' + addSeatCount + ' seats is now licenced', 'keep', false, 'success', 'Thank you.');
	
	
							var $selected = $('#accountPickerWrapper').find('.account-tab-panel:eq(0)');
							$('#accountPickerWrapper').find('.account-content').scrollTo($selected, 400, function() {
								app.methods.account = state['account'];
								app.methods.account.init();	
							});		     	

	
						}else{
										
							$('#update-form').find('button').prop('disabled', false);
							$('#update-form').find('button').removeAttr("disabled");
							$('#link-name-4').click();
							app.methods.loading.off('xxxx123');
							app.methods.progressBar.stop('xxxxx123');
							app.methods.modal.canDisable = true;
							
							toast(obj.error_message, 'keep', false, 'error', 'Something went wrong.');

						};
						

						
					});	
										
				};
				
			}

		}, sharedMethods);
		
		state['account'] = $.extend(	true,	{
			
			launchModal: function(obj) {
				
					var that = this;
							
					$('#modal-box')
						.width(this.widthModal)
						.height(this.heightModal);
						
					$('#modal-box').load('html/organization_account_modal.html?version=' + version,
						function() {
							
							var canDisable = true;
							app.methods.modal.on( canDisable );
							$('#top-message').html(obj.welcome);
	
							that.present();
							that.bindSlider();
							
							that.tailorSize();
	
							that.bindButtons();

							that.bindStripeSubmit();
							
							$('#update-form input').bind('focus', function() {
								app.methods.progressBar.stop('input field');
							});
							
						}
					);
			},
														
			present: function() {
				
				this.buildAddSeatsInputTable();
				this.buildRemoveSeatsInputTable();
				this.buildUnlicensedTable();
				
//				setTimeout(function(){
//					$('#link-name-3').click();
//				}, 1000);

			},
			
			bindButtons: function() {
				
				var that = this;
				
				$('.unlicenced-count').on('click', function(e) {
						e.preventDefault();
						$('#link-name-3').click();
				});
				
				$('#addseats-form').on('click', 'button#addsseats-button', function(e) {

					if( typeof( $('input[name=stripe_plan]:checked').val() ) == 'undefined' ) {
						toast('Please check a plan.', 'keep', 5000, 'info', 'Note.');
						return false;
					}
					
					if( !app.stubs.isOrgCreditOnFile ){	
							$('#link-name-4').click();
							return;	
					}

					app.methods.loading.on();
					app.methods.progressBar.start();

					var $form = $('#addseats-form');
					$form.find('button').prop('disabled', true);
					var addSeatCount = parseInt($('#addSeatCount').val()),
							postObj = {
								'google_id': app.stubs.google_id,
								'cost': $('#cost').val(),
								'stripe_plan': $('input[name=stripe_plan]:checked').val(),
								'addSeatCount': addSeatCount,
								'new_subscription_interval': $('#new_subscription_interval').val()
							};
							
					that.subscribe( postObj );
			
				});
								
				$('#update-form').on('click', 'button#update-button', function(e) {
					
					
					if( !app.stubs.isOrgCreditOnFile ){	
					 if( typeof( $('input[name=stripe_plan]:checked').val() ) == 'undefined' ) {
					 	toast('Please check a plan.', 'keep', 5000, 'info', 'Note.');
					 	$('#link-name-1').click();
					 	return false;
					 }
					}					
					
					
					app.methods.loading.on();
					app.methods.progressBar.start();
					
				});

			},
			
			subscribe: function( postObj ) {
				
					var that = this;

					tools.ajax('organization/subscribe', postObj, 'post', function( obj ) {
						
						console.log(JSON.stringify( obj    , null, 2 ));
						
						if( obj.status == 'succeeded' ){
						
							app.methods.loading.off();
							app.methods.progressBar.stop();
							
							var addSeatCount = $('#addSeatCount').val();		
											
							app.stubs.unlicencedCount = ( app.stubs.unlicencedCount - addSeatCount < 0 ? 0 : app.stubs.unlicencedCount - addSeatCount );
							
							$('.unlicenced-count').text(app.stubs.unlicencedCount);
							
							app.stubs.availableLicensesCount = obj.availableLicensesCount;
							$('.unassigned-license-count').text(app.stubs.availableLicensesCount);
							
							
							that.buildRemoveSeatsInputTable();
							that.buildUnlicensedTable();
							toast('Licence seats added.', 'keep', false, 'success', 'Thank you.');
							
							$('#link-name-2').click();	
							
							$('#update-button').text('UPDATE').prop('disabled', false);
							app.stubs.isOrgCreditOnFile = true;
							
	
						}else{
										
							$('#update-form').find('button').prop('disabled', false);
							$('#link-name-4').click();
							$('#cc_number_input').select();
							app.methods.loading.off('loading.offsubscribexxx');
							app.methods.progressBar.stop('loading.offsubscribexxx');
							app.methods.modal.canDisable = true;
							
							toast(obj.error_message, 'keep', false, 'error', 'Something went wrong.');

						};
						
						$('#addseats-form').find('button').prop('disabled', false);

					});	
			},
			
			bindStripeSubmit: function() { 
				
			 	var that = this;
			 
				$('[data-numeric]').payment('restrictNumeric');
				$('.cc-number').payment('formatCardNumber');
				$('.cc-exp').payment('formatCardExpiry');
				$('.cc-cvc').payment('formatCardCVC');
				
				$.fn.toggleInputError = function(erred) {
				  this.parent('.form-group').toggleClass('has-error', erred);
				  return this;
				};								 	

	     	$('#update-form').submit(function(e) {
		     	
					e.preventDefault();
					
					var cardType = $.payment.cardType($('.cc-number').val());
					$('.cc-number').toggleInputError(!$.payment.validateCardNumber($('.cc-number').val()));
					$('.cc-exp').toggleInputError(!$.payment.validateCardExpiry($('.cc-exp').payment('cardExpiryVal')));
					$('.cc-cvc').toggleInputError(!$.payment.validateCardCVC($('.cc-cvc').val(), cardType));
					$('.cc-brand').text(cardType);
					
					$('.validation').removeClass('text-danger text-success');
					$('.validation').addClass($('.has-error').length ? 'text-danger' : 'text-success');
					
					var expiration = $("#cc-exp").payment("cardExpiryVal");
					$("#stripe-card-exp-month").val(expiration.month || 0);
					$("#stripe-card-exp-year").val(expiration.year || 0);

					var $form = $(this);
					$form.find('button').prop('disabled', true);
					$form.find('button').attr("disabled", "disabled");
					Stripe.card.createToken($form, that.stripeResponseHandler);
					return false;	
		       
				});								   
			   									
			},
			
			stripeResponseHandler: function(status, response) {
				
				var that = this;

				console.log(JSON.stringify(  response   , null, 2 ));
				
				var $form = $('#update-form');
				
				if( typeof( response.error ) != 'undefined'){
					
					$form.find('.payment-errors').text(response.error.message);
					$form.find('button').prop('disabled', false);									
					app.methods.progressBar.stop();
					toast(response.error.message, 'keep', 5000, 'error', 'Something went wrong.');
					
				}else{
					
					
					if( !app.stubs.isOrgCreditOnFile ){	
								
						var postObj = {
									'token': response.id,
									'google_id': app.stubs.google_id,
									'cost': $('#cost').val(),
									'stripe_plan': $('input[name=stripe_plan]:checked').val(),
									'addSeatCount': $('#addSeatCount').val(),
									'new_subscription_interval': $('#new_subscription_interval').val()
								};
								
							app.methods.account.subscribe( postObj );

							return;	
							
					} else {
						
						var postObj = {
									'token': response.id,
								};
	
								
						console.log(JSON.stringify(  postObj   , null, 2 ));
	
						tools.ajax('organization/updatePaymentInformation', postObj, 'post', function(obj) {
							
							console.log(JSON.stringify(  obj   , null, 2 ));
							
							if( obj.status == 'succeeded'){
								
								app.methods.loading.off();
								app.methods.progressBar.stop();
								$form.find('button').prop('disabled', false);
								
								toast(obj.snack, 'keep', 5000, 'info', 'Note.');
								
								if( typeof( obj.gotoNewLicense ) != 'undefined' ){
									$('#link-name-1').click();
									
								};
							} else{
								
								$('#update-form').find('button').prop('disabled', false);
								$('#update-form').find('button').removeAttr("disabled");
								$('#cc_number_input').select();
								app.methods.loading.off('updatePaymentInformation');
								app.methods.progressBar.stop('updatePaymentInformation');
								app.methods.modal.canDisable = true;
								
								toast(obj.error_message, 'keep', false, 'error', 'Something went wrong.');
								
							};

							
						});	
														
					}
			
				};
				
			},
			
			buildUnlicensedTable: function() {
				
				tools.ajax('organization/getUnlicensedUsers', 
					{google_id: app.stubs.google_id},
					'post', function( response ) {
						
						var whichRow;
						
						$('#unlicenced_table').children().remove();
						
						$('#unlicenced_table').append('\
							<thead  class="fixedHeader">\
								<tr>\
									<th>Name\
									</th>\
									<th>First Login\
									</th>\
									<th>Last Login\
									</th>\
								</tr>\
							</thead>\
							<tbody  id="unlicenced_table_data"  class="scrollContent">\
							</tbody>\
						');
						
						var count = 0;
						
						var users = response.users;
						
						if( users.length == 0){
							
							$('#unlicenced_table_data').append('\
								<tr >\
									<td><div class="emptyTable" >No users requiring licenses</div></td>\
								</tr>\
							');
							
							$('#unlicensed-explainer').empty();
							
							return;	
						}
						
						for( var idx in users){
								
							if( tools.isOdd( count )) whichRow = 'normalRow';
							else whichRow = 'alternateRow';
								
							$('#unlicenced_table_data').append('\
								<tr  class="' + whichRow + '" >\
									<td>' + users[idx]['family_name'] + ', ' + users[idx]['given_name'] +  '</td>\
									<td>' + users[idx]['created'] + '</td>\
									<td>' + users[idx]['last'] + '</td>\
								</tr>\
							');
						}
				});
				
			},			
			
			buildRemoveSeatsInputTable: function() {
				
				var that = this;
				
				tools.ajax('organization/getBlocks', 
					{google_id: app.stubs.google_id},
					'post', function( response ) {
						
						console.log(JSON.stringify(  response   , null, 2 ));
							
						var whichRow;
						
						$('#renew_blocks_table').children().remove();
						
						$('#renew_blocks_table').append('\
							<thead  class="fixedHeader">\
								<tr>\
									<th>Renew\
									</th>\
									<th>Name\
									</th>\
									<th>Assigned\
									</th>\
									<th>Cost\
									</th>\
									<th>Time Segment\
									</th>\
								</tr>\
							</thead>\
							<tbody  id="renew_blocks_table_data"  class="scrollContent">\
							</tbody>\
						');
						
						var count = 0;
						
						var blocks = response.blocks;
						
						if( blocks.length == 0 ){
							
							$('#renew_blocks_table_data').append('\
								<tr >\
									<td><div class="emptyTable" >No licenses found</div></td>\
								</tr>\
							');
							
							return;	
						}
						
						for( var idx in blocks){
							
							if( blocks[idx]['subscription_interval'] == '1') easyinterval = 'month';
							else easyinterval = 'year';
								
							if( tools.isOdd( count )) whichRow = 'normalRow';
							else whichRow = 'alternateRow';
								
							var ischecked = ( blocks[idx]['expire'] == '0' ?  'checked': ''  ),
									isExpired = ( typeof( blocks[idx]['isExpired'] ) != 'undefined' ? 'isExpired' : '' ),
									timesegment = ( typeof( blocks[idx]["isExpired"] ) != "undefined" ? blocks[idx]["expiredSegmentBeginDateNice"] + "&nbsp;&nbsp;to&nbsp;&nbsp;" + blocks[idx]["expiredSegmentEndDateNice"] : blocks[idx]["niceSegmentStartDate"] + "&nbsp;&nbsp;to&nbsp;&nbsp;" + blocks[idx]["niceEndDate"] );
								
							$('#renew_blocks_table_data').append('\
								<tr  block_id=' + blocks[idx]['id'] + '  class="' + whichRow + ' ' + isExpired + '" toggle=0 >\
									<td><input ' + ( typeof( blocks[idx]["isExpired"] ) != "undefined" ? " disabled='disabled' ": "" ) + ' block_id=' + blocks[idx]['id'] + '  class="renew_inputbox" type="checkbox" ' + ischecked + ' value="' + blocks[idx]['id'] + '"></input></td>\
									<td><a block_id=' + blocks[idx]['id'] + ' href="#"  class="toggleUsersView">' + blocks[idx]['paid'] + ' User Block</a></td>\
									<td><a block_id=' + blocks[idx]['id'] + ' href="#"  class="toggleUsersView livecount">' + blocks[idx]['count'] + '</a></td>\
									<td>$' + blocks[idx]['cost'] + '/' + easyinterval + '</td>\
									<td>' + timesegment + '.</td>\
								</tr>\
							');
						}
						
						$('#renew_blocks_table').on('click', 'tr:not(.isExpired) .renew_inputbox', function(e) {					
						
							var block_id = $(this).val(),
									actionIs,
									postObj = { google_id: app.stubs.google_id};
									
							postObj['block_id'] = block_id;
							
							if($(this).is(':checked')){
								actionIs  = 'unexpire';
							}else{
								actionIs = 'expire';
							}
		
							tools.ajax('organization/' + actionIs + 'Block', 
								postObj,
								'post', function( obj ) {	
									
									if( obj.status == 'succeeded'){	

										app.methods.loading.off();
										app.methods.progressBar.stop();
										
										if( typeof( obj.gotoNewLicense ) != 'undefined' ){
											$('#link-name-1').click();
										};
										
										console.log(JSON.stringify( obj  , null, 2 ));
										toast('The license block is set for ' + ( actionIs == 'unexpire' ? 'renewal' : ' to expire ' + obj['niceEndDate']), 'keep', 5000, 'info', 'Note.');
														
									} else{
										
										app.methods.loading.off('C');
										app.methods.progressBar.stop('subscribe2');
										app.methods.modal.canDisable = true;
										
										toast(obj.error_message, 'keep', false, 'error', 'Something went wrong.');
										
									};

							});	
						
						});					
						
						$('#renew_blocks_table').on('click', 'tr:not(.isExpired) .toggleUsersView', function(e) {
							
							$('#renew_blocks_table').find('.users-row').remove();
							
							var $row = $(this).parent().parent(),
									block_id = $(this).attr('block_id');
							
							if( $row.attr('toggle') == 1){
								$row.attr('toggle', 0);
								$('#renew_blocks_table_data').find('tr').not($row).attr('toggle', 1);
							}else{
								$row.attr('toggle', 1);
								$('#renew_blocks_table_data').find('tr').not($row).attr('toggle', 0);
								
								tools.ajax('organization/getUsersByBlock', 
									{block_id: block_id},
									'post', function( data ) {	
										
										if( data.count == 0 ) return;
										
										var count = data.users.length;
		
										for( var idx in data.users){
											$row.after('\
												<tr class="users-row"><td>&nbsp;</td><td colspan=2>&nbsp;&nbsp;' + data.users[idx]['family_name']+ ', ' + data.users[idx]['given_name']+ '</td><td colspan=2><a href="#" class="unassign_user" user_id=' + data.users[idx]['id']+ '>Unassign license</a></td></tr>\
											');
										};
										
										$('.unassign_user').bind('click', function() {
											
											$rowUser = $(this).parent().parent();
											
											var user_id = $(this).attr('user_id'),
													postObj = {
														user_id: user_id,
														block_id: block_id,
													};
													
									    if (confirm("Are you sure?")) {
									    	
												tools.ajax('organization/unassignUser', 
													postObj,
													'post', function( obj ) {
														
														console.log(JSON.stringify( obj    , null, 2 ));	
														
														$rowUser.remove();
														
														count--;
														app.stubs.unlicencedCount++;
														app.stubs.availableLicensesCount++
														
														$('a.livecount[block_id=' + block_id + ']').text(count);
														
														$('.unlicenced-count').text(app.stubs.unlicencedCount);
														$('.unassigned-license-count').text(app.stubs.availableLicensesCount);
														
														that.buildUnlicensedTable();
														$('#link-name-3').click();	
														
												});
									    	
									    }	
											
										});
										
								});							
							};
								
							return false;
		
		
						});
														
			
					
				});
					
			
			}

		}, sharedMethods);	

		var whichState = ( typeof( window.orgAcceptTerms ) != 'undefined' && window.orgAcceptTerms == 1 ? 'account' : 'welcome');
		app.methods.account = state[whichState];

	};

/*
												
						app.methods.account = state['account'];
						app.methods.account.init();

*/


