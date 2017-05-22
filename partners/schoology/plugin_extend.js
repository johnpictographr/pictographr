var app = new App(),
		subtractWidth = 35,
		nameOfThisFile = 'plugin_extend.js';

app.settings.dim.main_container = tools.getScreenDim().width - subtractWidth;
app.stubs.doItLabel = "Import";

app.windowResize = function() {
				
	var	that = this,
			resizeId,
			doneResizing = function() {
				app.settings.dim.main_container = tools.getScreenDim().width - subtractWidth;
				that.resizeElements();
			};
			
	$(window).on(	'resize',
		function() {
			clearTimeout(resizeId);
			resizeId = setTimeout(doneResizing, 500);	
		}
	);
};

app.resizeElements = function() {
	console.log('resizing elements');
	$('#main_container')
		.width( app.settings.dim.main_container )
		.height( tools.getScreenDim().height );
		
	$('body').height( tools.getScreenDim().height );
	
	var shrinkByRatio = (app.settings.dim.main_container / 425);  // ideal
		
	$('.boxes').width( (app.settings.dim.main_container / 2) - 2);
	$('.boxes').height( (app.settings.dim.main_container / 2) - 2 );
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
		'max-width':  196 * shrinkByRatio + 'px',	
		'max-height':  196 * shrinkByRatio + 'px'
	});
	
};

app.renderFilePngForPost = function( doItThat, fileType ) {
	
	console.log('format: ' + fileType);	
	app.progress.start( doItThat );
	
	var fileId = $(doItThat).attr('fileId'),
			url = '/more/renderFromDrive',
			postObj = {
				'google_id': app.stubs.google_id,
				'fileId': fileId,
				'fileType': fileType,
				'usesTempFile': true
			};

	tools.ajax(url, postObj, 'post', function(data) {
		
		app.progress.stop( doItThat );
		
		var url = 'https://pictographr.com/image/streamDriveImage?google_id=' + app.stubs.google_id + '&fileId=' + data.imageId + '&max_width=40000';
		
		window.location.assign('https://pictographr.com/partners/schoology/upload.php?filename=' + data.filename);
		
		
	});	
	
};

/*

			$('#modal-box').css('padding', '50px').width(620).height(400);
			
			app.modal.on( 'true' );	
			var that = this;
			
			$('#modal-box').append('\
				<div >\
					<div  class="close-button-wrapper" >\
						<span class="close-button">x</span>\
					</div>\
					<div>\
						<iframe src=""/>\
					</div>\
				</div>\
			');
*/

app.doWithRenderedPNG = function( url ) {

		tools.convertImgToBase64(url, 'image/png', function(base64Img, width,  height) { 
			
			var baseArray  = base64Img.split(',');
			//baseArray[1]
			$('.action_buttons').show();

		});
	
};

app.bind.newdesign = function() {

  $('#new_design_button').unbind('click').bind('click', function(e){
	  	var msgObj = {};
			msgObj.msgFrom = nameOfThisFile;
			msgObj['purpose'] = 'newdesign';
			msgObj['usePaperSizeDefault'] = true;	
			msgObj['pollrefresh'] = true;								
			msgObj['google_id'] = app.stubs.google_id;			
			tools.crossdom.send(msgObj);
			e.preventDefault();
  });		
		    			
};

app.whenUserHasAccountThen = function(msgObj) {
	
	app.stubs.google_id = msgObj.google_id;
	
  app.stubs.isGoogleConnected = true;
  
  $('body').find('#greet-container').remove();
  
	this.mainContainerToWrapper();
   
  this.getFiles();
  
};

app.mainContainerToWrapper = function() {
	
	$('#main_container_wrapper').append('\
			<div  class="new_design_wrapper">\
				<div  id="new_design_button" class="action_buttons new_design"> New Design</div>\
				<button id="refresh-button"   class="button"><div class="refresh-icon"></div></button>\
			</div>\
      <div  id="main_container" >\
      </div>\
   ');
   
   app.bind.newdesign();
   app.bind.reloadIt();
};

app.bind.reloadIt = function() {
		// console.log('binding reload it');
	  $('#refresh-button').click(function(e){
	  	e.preventDefault();
	  	// console.log('reloading');
	  	app.getFiles();
	  	return false;
	  });	
}

app.modal = {

	canDisable: true,
					
	init: function() {
		
		var that = this;
		
		$('#modal-screen').on( 'mousedown', function() {
			if( that.canDisable ) that.off();
			return false;
		})
										
		$('#modal-box').on( 'mousedown', function(event) {
			event.stopPropagation();
		});	
		
		$('#modal-box').dblclick( function(event) {
			event.stopPropagation();
			event.preventDefault(); 
		});			
								
		$('#modal-box').on( 'click', '.close-button', function() {
			that.off();
		});
						
	},
	
	on: function(canDisable) {	
		
		this.canDisable = canDisable;

		if( !canDisable ) $('.close-button').hide();
		else $('.close-button').show();
		
		$('#modal-screen').show();

	},
	
	off: function( where ) {
		
			this.canDisable = true;

			$('#modal-box').empty();
			$('#modal-screen').hide(); 
					
			$('.action_buttons, .boxes').removeClass('disabled');

	}
						
}

app.bind.doit = function() {
	
  $('.doit').click(function(e){

		}).popChoice({
        title: 'Please choose.',
        content: 'Which format?',
		})
    .click(function(e){
    	e.preventDefault();
    	var that = this;
    	$(this).parent().parent().addClass('choosing');
			$('.boxes:not(.choosing)').addClass('disabled');
    	$('.action_buttons').not(this).addClass('disabled');

    });
    
    var doWhenClose = function( that ) {
			$('.doit').parent().parent().removeClass('choosing');
			$('.doit').css({
				'background-color': '#4285F4',
				'color': 'white'	
			});							
			
			$('.action_buttons, .boxes').removeClass('disabled');
			
    };		    
    
    $('.boxes').on('click', function () {
      	doWhenClose();
        $('.action_buttons.doit').popover('hide').removeClass('popconfirm-active');
    });
};


app.showClickToInstall = function() {

		$('body').find('#greet-container').remove();
	
		this.paintLoginWithGoogleButton();

		$('#get-started-button').click( function(e) {
			e.preventDefault();
			var msgObj = {
				msgFrom: nameOfThisFile,
				purpose: 'createNewPictographrUser',
				xorg_id: window.xorg_id,
				xuser_id: window.xuser_id,
				isOrgAdmin: window.isOrgAdmin,
				org_type: 'E',
				organization_name: window.organization_name,
				partner_id: 6	
			};
			console.log(JSON.stringify(  msgObj   , null, 2 ));
			tools.crossdom.send(msgObj);
			app.poll.byAuth();
		});
			
		$('#greet-container').css('height', tools.getScreenDim().height - 30 + 'px');
		
		this.resizeElements();
		
};

app.init = function() {
	
	tools.crossdom.init('iframe_messaging_conduit', 'https://pictographr.com/partners/iframeSrcPostMsgConduit.html');
	
	/* -------------------------------------*/
	
//	this.modal.init();
//	
//	this.stubs.data = [
//		{thumbnailLink: 'http://localhost/pictographr/img/driveCloud.png'	},
//		{thumbnailLink: 'http://localhost/pictographr/img/facebook.png'	},
//		{thumbnailLink: 'http://localhost/pictographr/img/laptop_transparent.png'	},
//		{thumbnailLink: 'http://localhost/pictographr/img/drive.png'	}
//	];
//
//	this.mainContainerToWrapper();
//	
//	this.paint();
//	app.labelDoItButton();
	
	/* -------------------------------------*/
	
	var that = this;
	
	$('body').height( tools.getScreenDim().height );
	
	this.windowResize();
	
	tools.crossdom.receive = function(msg) {
		
		if( typeof( msg.data.split ) != 'function') return;
		
		var msgObj = this.unserialize(msg.data.split(','));
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'retrieveGoogleIdDomain' ){ // ONLY LISTEN FOR MSG FROM PICTOGRAPHR
			
			console.log(JSON.stringify(  msgObj   , null, 2 ));
			
			if( typeof( msgObj.google_id ) != 'undefined')   app.stubs.google_id = msgObj.google_id;
			
			if( msgObj.appInstalled == 'true'){
				
					if( msgObj.exist == 'true'){  // user is in database
						
						app.stubs.isGoogleConnected = true;
						 
						that.mainContainerToWrapper();
						
						that.getFiles();
	
					}else{
						
						// console.log('not in pictographr DB');
						
						app.showClickToInstall();
						
					};
				
			} else{
				
					app.showClickToInstall();

			};
			
		};
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'whenUserHasAccountThen' ){
			
			console.log(JSON.stringify( msgObj    , null, 2 ));
			clearInterval(app.poll.polling);
			app.whenUserHasAccountThen(msgObj);			
			
		};		
		
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'refreshSidebarFiles' ){
				console.log(JSON.stringify(  msgObj   , null, 2 ));
				app.getFiles();
			
		};
		
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'clearPolling' ){
			
			clearInterval( app.poll.polling );
			app.showClickToInstall();		
			
		};
									
	}

	
};

app.init();

refreshSidebarFiles = function() {
	
};

		