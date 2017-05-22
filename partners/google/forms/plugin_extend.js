var nameOfThisFile = 'plugin_extend.js';

var app = new App();

app.settings.dim.thumb_container = 255;
app.stubs.doItLabel = "Insert";

app.resizeElements = function() {
	
	$('#main_container').css('width', '300px');
	
	var shrinkByRatio = (app.settings.dim.thumb_container / app.settings.dim.thumb_container);  // ideal
		
	$('.boxes').width( (app.settings.dim.thumb_container / 2) - 2);
	$('.boxes').height( (app.settings.dim.thumb_container / 2) - 2 );
	
	var marginSpacingformula = ($('.buttons_wrapper').width() - app.settings.dim.action_buttons.width * 2) / 4 ;

	$('.thumbs').css({	
		'max-width':  ((app.settings.dim.thumb_container/2) * shrinkByRatio  - 2) + 'px',	
		'max-height':  ((app.settings.dim.thumb_container/2) * shrinkByRatio  - 2) + 'px'
	});
	
	var diff = tools.getScreenDim().height - 130;
	
	$('#thumb-container').css('height', diff + 'px');
	
	$('#greet-container').css('height', tools.getScreenDim().height - 78 + 'px');
	
};

app.doWithRenderedPNG = function( url ) {
	
	// console.log(url);
	
  google.script.run.withSuccessHandler(function( data ) {
  	
		app.deleteRenderedPNGForeverFromDriveTempFolder();
    
  })
  .withFailureHandler(app.showError).insertImage(url);		


};


app.deleteRenderedPNGForeverFromDriveTempFolder = function() {
	
	var msgObj = {};
	msgObj['msgFrom'] = 'plugin_extend.js';
	msgObj['purpose'] = 'deleteForever';			
	msgObj['google_id'] = app.stubs.google_id;			
	msgObj['imageId'] = app.stubs.imageId;	
	
	console.log(JSON.stringify(  msgObj   , null, 2 ));
			
	tools.crossdom.send(msgObj);

};

app.showError = function(msg, element) {
	// console.log(msg);
}

app.renderFilePngForPost = function( that ) {
	
	app.progress.start( that );
	
	var fileId = $(that).attr('fileId');
	
	var url = 'https://pictographr.com/more/renderFromDrive',
			postObj = {
				'google_id': app.stubs.google_id,
				'fileId': fileId,
				'fileType': 'png'
			};

	tools.ajax(url, postObj, 'post', function(data) {
		
		app.progress.stop( that );
		
		app.stubs.imageId = data.imageId;
		
		var url = 'https://pictographr.com/image/streamDriveImage?google_id=' + app.stubs.google_id + '&fileId=' + data.imageId + '&max_width=40000';
		app.doWithRenderedPNG(url);

	});	
	
};

app.create_the_buttons = function() {
	
	$('#main_container').find('#greet-container').remove();
	
	$('#main_container').find('#top-buttons-container').remove();

	$('#main_container').prepend('\
		<div   id="top-buttons-container" class="block buttons-container">\
			<div  class="top-right">\
				<button id="refresh-button"   class="button"><div class="refresh-icon"></div></button>\
				<button  id="new_design" class="button create">Create</button>\
			</div>\
		</div>\
		<div  id="thumb-container"    class="block">\
		</div>\
		<div   id="bottom-buttons-container" class="block buttons-container">\
			<div  class="top-right">\
				<button  id="insert-button"  class="button ifactive action disabled">Insert</button>\
				<button  id="edit-button"  class="button ifactive disabled">Edit</button>\
				<button  id="delete-button"  class="button ifactive disabled">Delete</button>\
			</div>\
		</div>\
	');
	

	app.bind.newdesign();
	app.bind.reloadIt();
	app.bind.edit();		
	app.bind.doit();
	app.bind.delete();

};

app.getFiles = function()	{
	
	var url = 'https://pictographr.com/app/getFileList',
			postObj = {
				'google_id': app.stubs.google_id,
				'whichFolder': 'files'
			};

	console.log('getfiles from docs extend.js');
	
	console.log(JSON.stringify(  postObj  , null, 2 ));

	tools.ajax(url, postObj, 'post', function(data) {
		
		app.stubs.data = data;
		app.paint();
		app.labelDoItButton();
		
		$('.ifactive').addClass('disabled');
		app.bind.activate();
		
	});		
	
};

app.paint = function() {
	
	var placement = 'left';
		
	$('#thumb-container').html('');
	
	if( app.stubs.data.length == 0){
		
		$('#thumb-container').append('\
			<img  id="nofilesyetImg" src="https://pictographr.com/partners/assets/startdesign.png" />\
		');
		
	};
					
	for( var idx in app.stubs.data){
		
		var obj = app.stubs.data[idx];
		var thumbLink = obj.thumbnailLink;
		var fileId = obj.fileId;
		
		if( placement == 'right') placement = 'left';
		 else placement = 'right';
		
		var box = '\
			<div  class="boxes">\
				<span class="helper"></span>\
				<img fileId=' + fileId + ' class="thumbs" src="' + thumbLink + '">\
			</div>\
		';						
		
		$('#thumb-container').append(box);
		
	}
	
 	this.resizeElements();
 	this.windowResize();
	
	if( typeof( this.afterpaint ) != 'undefined') this.afterpaint();
					
};

app.bind = {
			
	activate: function() {
		$('.thumbs').bind('click', function() {
			
			$('.thumbs').removeClass('active');
			$(this).addClass('active');
			$('.ifactive').removeClass('disabled');
						
			var fileId = $(this).attr('fileId');
			$('#edit-button, #insert-button, #delete-button').attr('fileId', fileId);
			
		});
	},
	
	delete: function() {
		
    $('#delete-button').click(function(e){
    	
    	var that = this;
    	
    	if( $(this).hasClass('disabled') ) return;
    	
	    $( "#dialog-confirm" ).dialog({
	      resizable: false,
	      height:140,
	      modal: true,
	      buttons: {
	        "Yes": function() {
	        	
	          $( this ).dialog( "close" );
	          
				  	var msgObj = {};
						msgObj.msgFrom = nameOfThisFile;
						msgObj['purpose'] = 'delete';			
						msgObj['google_id'] = app.stubs.google_id;			
						msgObj['fileId'] = $(that).attr('fileId');			
						tools.crossdom.send(msgObj);
		 					
	        },
	        Cancel: function() {
	          $( this ).dialog( "close" );
	        }
	      }
	    });
			
		});
		
	},
	
	newdesign: function() {
		
	  $('#new_design').unbind('click').click(function(e){
	  	e.preventDefault();
	  	
	  	var msgObj = {};
			msgObj.msgFrom = nameOfThisFile;
			msgObj['purpose'] = 'newdesign';
			msgObj['google_id'] = app.stubs.google_id;			
			tools.crossdom.send(msgObj);
	  	  	
	  });		
	},

	edit: function() {
		
	  $('#edit-button').unbind('click').click(function(e){
	  	
	  	e.preventDefault();
	  	
	  	if( $(this).hasClass('disabled') ) return;
	  	
	  	var fileId = $(this).attr('fileId');
	  	var msgObj = {};
			msgObj.msgFrom = nameOfThisFile;
			msgObj['purpose'] = 'edit';			
			msgObj['google_id'] = app.stubs.google_id;			
			msgObj['fileId'] = fileId;			
			tools.crossdom.send(msgObj);  	
	
	  });
						
	},
	
	doit: function() {
		
		$('#insert-button').bind('click', function(e) {
			
	  	e.preventDefault();
	  	
	  	if( $(this).hasClass('disabled') ) return;
	  	
			app.renderFilePngForPost( this );
		})				
	},
	
	reloadIt: function() {
		// console.log('binding reload it');
	  $('#refresh-button').click(function(e){
	  	e.preventDefault();
	  	// console.log('reloading');
	  	app.getFiles();
	  	return false;
	  });	
			    			
	}
	
};

app.progress = {
	start: function(that) {
		$(that).addClass('waiting').html('\
			<img src="https://pictographr.com/img/smallloading.gif" />\
		');
	},
	stop: function( that ) {
		$(that).removeClass('waiting').html(app.stubs.doItLabel);
	}
};

app.refreshSidebarFiles = function() {
	 app.getFiles();
}

app.whenUserHasAccountThen = function(obj) {

	app.stubs.google_id = obj.google_id;
	app.create_the_buttons();
  app.getFiles();

};

app.stubs.email = undefined;

app.showClickToInstall = function() {
	
		$('body').find('#greet-container').remove();
	
		$('#main_container').append('\
			<div  id="greet-container"  class="block">\
				<div>\
					<img  id="logo" src="https://pictographr.com/favicons/apple-touch-icon-114x114.png">\
				</div>\
				<div>\
					Click below to get started.\
				</div>\
				<div>\
					<button id="get-started-button"  class="button action">Get Started!</button>\
				</div>\
			</div>\
		');
		
		$('#get-started-button').click( function(e) {
			e.preventDefault();
			var paramObj = {};
			paramObj['partner_id'] = 11;
			app.createNewPictographrUser( paramObj );
		});
			
		$('#greet-container').css('height', tools.getScreenDim().height - 78 + 'px');
		
};

app.init = function() {

	
	this.windowResize();
	
	tools.crossdom.receive = function(msg) {
		
		var msgObj = this.unserialize(msg.data.split(','));
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'retrieveGoogleIdDomain' ){ // ONLY LISTEN FOR MSG FROM PICTOGRAPHR
			
			console.log(JSON.stringify(  msgObj   , null, 2 ));
			
			if( typeof( msgObj.google_id ) != 'undefined')   app.stubs.google_id = msgObj.google_id;
			
			if( msgObj.appInstalled == 'true'){
				
					if( msgObj.exist == 'true'){  // user is in database
						
					  app.stubs.isGoogleConnected = true;
						app.create_the_buttons();
					  app.getFiles();
	
					}else{
						
						// console.log('not in pictographr DB');
						
						app.showClickToInstall();
						
					};
				
			} else{
				
					app.showClickToInstall();

			};
			
		};
		
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'testPostRegister' ){
			
			// console.log(JSON.stringify( msgObj    , null, 2 ));
				
			// console.log('Message was boomeranged.');
				
		};
		
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'whenUserHasAccountThen' ){
			clearInterval(app.poll.polling);
			app.whenUserHasAccountThen(msgObj);			
			
		};		
		
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'refreshSidebarFiles' ){
			// console.log(JSON.stringify( msgObj    , null, 2 ));
			app.refreshSidebarFiles();			
			
		};
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'clearPolling' ){
			
			clearInterval( app.poll.polling );
			app.showClickToInstall();		
			
		};
		
									
	}
	
	tools.crossdom.init('iframe_messaging_conduit', 'https://pictographr.com/partners/iframeSrcPostMsgConduit.html?v=4');

	
};

app.init();