var app = new App();

app.settings.dim.main_container = tools.getScreenDim().width - 18;
app.stubs.doItLabel = "Attach";

app.windowResize = function() {
				
	var	that = this,
			resizeId,
			doneResizing = function() {
				app.settings.dim.main_container = tools.getScreenDim().width - 9;
				that.resizeElements();
			};
			
	$(window).on(	'resize',
		function() {
			clearTimeout(resizeId);
			resizeId = setTimeout(doneResizing, 500);	
		}
	);
};

app.doWithRenderedPNG = function( url ) {
	
	app.settings.secret = 'thisisthesecret';
	
	hsp.composeMessage( '', { shortenLinks: true } );
	
	var timestamp = new Date().getTime() / 1000;
	var new_time = parseInt(timestamp, 10);
	var token = app.stubs.partner_userId + '' + new_time + url + app.settings.secret;

	console.log('url:' + url);
	console.log('partner_userId: ' + app.stubs.partner_userId);
	console.log('new_time: ' + new_time);
	console.log('token: ' + token);
	console.log('SHA512: ' + tools.SHA512(token));

	var obj = {
		url: url,
		name: 'logo',
		extension: 'png',
		timestamp: new_time,
		token: tools.SHA512(token)
	}
	
	hsp.attachFileToMessage(obj);
	
};

app.afterpaint = function() {

}

app.streamPictoFiles = function() {
	var that = this;
	$('body').load('stream_body.html', function() {
		app.bind.newdesign();
		that.getFiles();
	});
};

app.getPermissionToLink = function() {
	
	var that = this;
	$('body').load('getPermissionToLink.html', function() {
		
		console.log('getPermissionToLink.html');
		
		$('#linkPictoUserToPartner').click( function(e) {
			
			e.preventDefault();
			
			var postObj = { 
				partner_userId: app.stubs.partner_userId,
				partner_id: app.stubs.partner_id
			};
			
			tools.ajax(	
				'/auth/linkPictoUserToPartner', 
				postObj,
				'post', 
				function(obj) {
					
					console.log(JSON.stringify(  obj   , null, 2 ));
					
					location.reload();
					
				}
			);
			
		});
			
	});
};

app.bind.newdesign = function() {
	console.log('binding new design !!');
  $('#new_design').unbind('click').bind('click', function(e){
  	e.preventDefault();
  	tools.openInNewTab('https://pictographr.com/app?opener_reload=true&new_width=1200&new_height=1200&state=%7B%22newSerial%22:%20%22' + Math.random() + '%22,%20%22action%22:%22create%22,%22userId%22:%22' + app.stubs.google_id + '%22%7D');
  });	
		    			
};
		
app.giveUserAccountOnPictographr = function() {

	var that = this;
	
	$('body').load('../giveUserAccountOnPictographr.php', function() {
		
		console.log('giveUserAccountOnPictographr.php');
		
		$('#connect_pictographr').click( function(e) {
			e.preventDefault();
			tools.openInNewTab('https://pictographr.com?new_width=1200&new_height=1200&opener_reload=true&market_id=15&partner_id=1&partner_userId=' + app.stubs.partner_userId);
		});
			
	});
};

app.setUserId = function( callback )	{
			
	hsp.getMemberInfo(function(info){
		
		app.stubs.partner_userId = info.userId;
		app.stubs.partner_id = 1;
		
		callback();
		
	});					
};

app.init = function() {
	
	var that = this;
	
	$('body').height( tools.getScreenDim().height );
	
	app.stubs.apiKey = 'dw6rh5otra8gkwok8c00k8wkc3ie1e2pfdj';

  var hsp_params = {
  			apiKey: app.stubs.apiKey,
  			useTheme: true,
  			callBack: function( data ) {

					that.setUserId( function() {
						
						var postObj = { 
							partner_userId: app.stubs.partner_userId,
							partner_id: app.stubs.partner_id,
						};
						
						// pictoUser linked with hootsuite?
						console.log('asking server .... is pictoUser linked with hootsuite?');							
						app.getGoogleIdFromPartner( postObj, function( response ) {
							
							if( response.status == 'success'){
								
								console.log('is pictoUser linked with hootsuite?  YES');
								console.log('Session_p stored');
								console.log('isGoogleConnected: ' + app.stubs.isGoogleConnected);
								app.stubs.google_id = response.google_id;
								app.stubs.isPictoUserLinkedToHootSuite = true;
								app.streamPictoFiles();
								
							}else{

								app.stubs.isPictoUserLinkedToHootSuite = false;
								
								console.log('is pictoUser linked with hootsuite?  NO');
								console.log('hootsuite user: ' + app.stubs.partner_userId +  ' is not linked to Pictographr');
								console.log('isGoogleConnected: ' + app.stubs.isGoogleConnected);								
								console.log('isPictoUserLinkedToHootSuite: ' + app.stubs.isPictoUserLinkedToHootSuite);								
								
								if( app.stubs.isGoogleConnected ){ // get permission to link
									app.getPermissionToLink();
								}else{
									app.giveUserAccountOnPictographr();
								};
								
							};
							
						});	

					});

  			}
      };
      
	hsp.init(hsp_params);
	
	hsp.bind('refresh', function () {
		if( app.stubs.isPictoUserLinkedToHootSuite ){
			app.streamPictoFiles();
		}else{
			
			console.log('is pictoUser linked with hootsuite?  NO');
			console.log('hootsuite user: ' + app.stubs.partner_userId +  ' is not linked to Pictographr');
			console.log('isGoogleConnected: ' + app.stubs.isGoogleConnected);								
			console.log('isPictoUserLinkedToHootSuite: ' + app.stubs.isPictoUserLinkedToHootSuite);		
			
			if( app.stubs.isGoogleConnected ){ // get permission to link
				app.getPermissionToLink();
			}else{
				app.giveUserAccountOnPictographr();
			};
		};
	});

};

		