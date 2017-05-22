// support number 800-636-7914
// 800-636-7914

var nameOfThisFile = 'plugin_extend.js';

var app = new App();

app.stubs.doItLabel = "Insert";

app.stubs.loggedin = false;

app.settings.dim.widthMain = tools.getScreenDim().width - 5;

app.showError = function(msg, element) {
	console.log(msg);
}

app.renderFilePngForPost = function( that ) {
	
	app.progress.start( that );
	
	var fileId = $(that).attr('fileId'),
			url = 'https://pictographr.com/more/renderFromDrive',
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
	
	//app.stubs.popLarge = ( tools.whatIs()['browser'] == 'Netscape' ? true: undefined );
	app.stubs.isChrome = tools.isBrowser.chrome();
	
		$('#main_container').find('#top-buttons-container').remove();
	
		$('#main_container').prepend('\
			<div   id="console-container" class="block">\
			</div>\
			<div   id="top-buttons-container" class="block buttons-container">\
				<div  class="top-right">\
					<button id="setup-button"   class="ms-Button button top-buttons"><div class="setup-icon top-icons"></div></button>\
					<button id="refresh-button"   class="ms-Button button top-buttons"><div class="refresh-icon top-icons"></div></button>\
					<button  id="new_design" class="ms-Button button create">Create</button>\
				</div>\
			</div>\
			<div  id="thumb-container"    class="block">\
			</div>\
			<div   id="bottom-buttons-container" class="block buttons-container">\
				<div  class="top-right">\
					<button  id="insert-button"  class="ms-Button button ifactive action disabled">Insert</button>\
					<button  id="edit-button"  class="ms-Button button ifactive disabled">Edit</button>\
					<button  id="delete-button"  class="ms-Button button ifactive disabled">Delete</button>\
				</div>\
			</div>\
		');
		
		app.bind.newdesign();
		app.bind.reloadIt();
		app.bind.logout();
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
	
	//console.log(JSON.stringify(  postObj  , null, 2 ));

	tools.ajax(url, postObj, 'post', function(data) {
		
		//console.log(JSON.stringify( data, null, 2 ));
		
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
	
	$('#main_container').removeClass('noscrolls');
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
	
	pollRefresh: function() {
		
		polling = setInterval( function() {
			
			if( tabwin.closed || tools.cookies.getCookie('stopPollRefresh') ) {
				if( tools.cookies.getCookie('stopPollRefresh') ){
					console.log('cookie: stopPollRefresh.');
				}else{
					console.log('tab window closed.');
				};
				console.log(tabWindow.closed);
				clearInterval(polling);
			}
			
			console.log('pollRefresh.');
			
			if( tools.cookies.getCookie('pollRefresh')){
				console.log('pollRefresh cookie found.  Refreshing side panel');
				app.refreshSidebarFiles();
			};
			
		}, 2000); 
			
		
	},
	
	newdesign: function() {
		
	  $('#new_design').unbind('click').click(function(e){
	  	
	  	e.preventDefault();
	  	
			var url = 'https://pictographr.com/app?';
			
			url += 'new_width=620&new_height=500&'; 

			url += 'state=%7B%22newSerial%22:%20%22' + Math.random() + '%22,%20%22action%22:%22create%22,%22userId%22:%22' + app.stubs.google_id + '%22%7D';
			
			window.open(url, 'popupwindow', 'resizable=yes,menubar=yes,toolbar=yes,location=yes,directories=yes,status=yes');
	  	  	
	  });		
	},

	edit: function() {
		
	  $('#edit-button').unbind('click').click(function(e){
	  	
	  	e.preventDefault();
	  	
	  	if( $(this).hasClass('disabled') ) return;
	  	
	  	var fileId = $(this).attr('fileId');	  	
			var url = 'https://pictographr.com/app?new_width=620&new_height=500&pollrefresh=true&state=%7B%22ids%22:%5B%22' + fileId + '%22%5D,%22action%22:%22open%22,%22userId%22:%22' + app.stubs.google_id + '%22%7D';

			window.open(url, 'popupwindow', 'resizable=yes,menubar=yes,toolbar=yes,location=yes,directories=yes,status=yes');
			
	  });
						
	},
	
	doit: function() {
		
		$('#insert-button').unbind('click').bind('click', function(e) {
			
	  	e.preventDefault();
	  	
	  	if( $(this).hasClass('disabled') ) return;
	  	
			app.renderFilePngForPost( this );
		})				
	},
	
	reloadIt: function() {
		console.log('binding reload it');
	  $('#refresh-button').unbind('click').click(function(e){
	  	e.preventDefault();
	  	console.log('reloading');
	  	app.getFiles();
	  	return false;
	  });	
			    			
	},

	logout: function() {
		
	  $('#setup-button').unbind('click').click(function(e){
	  	
	  	e.preventDefault();
	  	
	    $( "#dialog-logout" ).dialog({
	      resizable: false,
	      height:140,
	      modal: true,
	      buttons: {
	        "Yes": function() {
	        	
	          $( this ).dialog( "close" );
	          
						var src = 'https://accounts.google.com/Logout';
						
						$('#iframe_logout').attr('src', 'https://accounts.google.com/Logout').load(function () {
							$('#iframe_logout').attr('src', 'https://pictographr.com/auth/destroySessionP').unbind('load').load(function () {
								app.stubs.google_id = undefined;
								app.stubs.loggedin = false;
								app.showClickToInstall();
							});					
						});	
		 					
	        },
	        Cancel: function() {
	          $( this ).dialog( "close" );
	        }
	      }
	    });
	  	


	  });
						
	},	
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

app.giveUserAccountOnPictographr = function() {

	var that = this;

	$('#main_container').load('https://pictographr.com/partners/giveUserAccountOnPictographr.php', function() {

		console.log('giveUserAccountOnPictographr.html');
		
		$('#connect_pictographr').click( function(e) {
			e.preventDefault();
			app.poll();
			tools.openInNewTab('https://pictographr.com?new_width=620&new_height=500&partner_id=2&skip_insert=true&market_id=14');
		});
			
	});
};

app.refreshSidebarFiles = function() {
	 app.getFiles();
}

app.whenUserHasAccountThen = function(obj) {
	app.stubs.loggedin = true;
	app.stubs.google_id = obj.google_id;
	app.create_the_buttons();
	$('#greet-container').remove();
  app.getFiles();

};

app.stubs.email = undefined;


app.paintLoginWithGoogleButton = function() {
		$('#main_container').css('width', (app.settings.dim.widthMain) + 'px');
		$('#main_container').addClass('noscrolls');
		$('#main_container').empty();
		$('#main_container').append('\
			<div  id="greet-container"  class="block">\
				<div  id="carousel-gallery" class="owl-carousel owl-theme" >\
		        <div class="item"><img alt="" src="https://pictographr.com/img/showme.png"></div>\
		        <div class="item"><img alt="" src="https://pictographr.com/img/create2.png"></div>\
		        <div class="item"><img alt="" src="https://pictographr.com/img/design2.png"></div>\
		        <div class="item"><img alt="" src="https://pictographr.com/img/select2.png"></div>\
		        <div class="item"><img alt="" src="https://pictographr.com/img/insert2.png"></div>\
		    </div>\
				<div>\
					<div>\
						Click below to get started...\
					</div>\
					<div>\
						<img   style="margin-top:5px; cursor:pointer; width:220px" id="get-started-button"  src="https://pictographr.com/img/loginGoogle.png"/>\
					</div>\
				</div>\
			</div>\
		');
		
		tools.doWhenReady(
			function() {
				return $('#greet-container').length == 1;
			},
			function() {
				$('#greet-container').css('width', ( app.settings.dim.widthMain - 15 ) + 'px');
				
				app.settings.dim.heightOfGreetContainer = tools.getScreenDim().height - 40;	
				$('#greet-container').css('height', app.settings.dim.heightOfGreetContainer + 'px');
				$('#greet-container').css('padding-top', ((tools.getScreenDim().height /2) - ( app.settings.dim.heightOfGreetContainer /2 ) - 15) + 'px');
				
	      $("#carousel-gallery").owlCarousel({
					navigation : true, // Show next and prev buttons
					slideSpeed : 300,
					paginationSpeed : 400,
					singleItem:true,
					autoPlay: true
	      });
			},
			'method: paintLoginWithGoogleButton '
		);

}

app.resizeElements = function() {
	
	console.log('resizing');
	
	$('#main_container').css('width', (app.settings.dim.widthMain) + 'px');
	
	var shrinkByRatio = (app.settings.dim.thumb_container / app.settings.dim.thumb_container);  // ideal
	
	console.log(shrinkByRatio);
		
	$('.boxes').width( (app.settings.dim.thumb_container / 2) - 20);
	$('.boxes').height( (app.settings.dim.thumb_container / 2) - 20 );
	
	$('.thumbs').css({	
		'max-width':  ((app.settings.dim.thumb_container/2) * shrinkByRatio  - 20) + 'px',	
		'max-height':  ((app.settings.dim.thumb_container/2) * shrinkByRatio  - 20) + 'px'
	});
	
	var diff = tools.getScreenDim().height - 126;
	
	$('#thumb-container').css('height', diff + 'px');
	
	if( app.stubs.loggedin ){
		$('#greet-container').css('height', tools.getScreenDim().height - 103 + 'px');
	} else{
		app.settings.dim.heightOfGreetContainer = tools.getScreenDim().height - 40;	
		$('#greet-container').css('height', app.settings.dim.heightOfGreetContainer + 'px');
		$('#greet-container').css('padding-top', ((tools.getScreenDim().height /2) - ( app.settings.dim.heightOfGreetContainer /2 ) - 15) + 'px');
	} 
	
};

app.init = function() {

	var content = '';		
	var obj = tools.whatIs();
	for( var key in obj){
		content += key + ' : ' + obj[key];
	}

	// $('#console_container').empty().html(content);

	
	this.windowResize();
	
	tools.crossdom.receive = function(msg) {
		
		var msgObj = this.unserialize(msg.data.split(','));
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'retrieveGoogleIdDomain' ){ // ONLY LISTEN FOR MSG FROM PICTOGRAPHR
			
			console.log(JSON.stringify(  msgObj   , null, 2 ));
			
			if( typeof( msgObj.google_id ) != 'undefined')   app.stubs.google_id = msgObj.google_id;
			
			if( msgObj.appInstalled == 'true'){
				
					if( msgObj.exist == 'true'){  // user is in database
						
					  app.stubs.loggedin = true;
						app.create_the_buttons();
					  app.getFiles();
					  
/*					CHECK TO SEE WHAT IS SUPPORTED
 						http://stackoverflow.com/questions/39142442/what-versions-of-office-2016-support-office-context-reqirements-issetsupported
 						
 						
            var sets = Office.context.requirements._setMap._sets;       
            for (var set in sets){
            		var oneSet = "Set type: " + set + " value " +sets[set];
                console.log(oneSet);
                $('#console-container').show().append( oneSet + '<br />');
            }

						if (Office.context.requirements.isSetSupported('ExcelApi', '1.3') &&  // Excel Desktop - Yes Insert
								Office.context.requirements.isSetSupported('ImageCoercion', '1.1')
						) {
							$('#console-container').show().prepend('Excel Desktop - Yes Insert'  + '<br />');				
						} else if 
							 (Office.context.requirements.isSetSupported('ExcelApi', '1.3') &&  // Excel Online - No Insert
								!Office.context.requirements.isSetSupported('ImageCoercion', '1.1') )
						{
							$('#console-container').show().prepend('Excel Online - No Insert'  + '<br />');			
						} else{  // other than Excel host
							$('#console-container').show().prepend('Not Excel. Insert will work'  + '<br />');
						}           
*/

						if (Office.context.requirements.isSetSupported('ExcelApi', '1.3') &&  // Excel Online - No Insert
								!Office.context.requirements.isSetSupported('ImageCoercion', '1.1') )
						{
							$('#insert-button').unbind('click').bind('click', function(e) {
								
						  	e.preventDefault();
						  	
						  	$('#console-container').show().empty().html('This insert feature is only supported on desktop version.');

			    			setTimeout(function(){
			    				$('#console-container').hide();
			    			}, 7000);

							})
						};

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
				
			console.log('Message was boomeranged.');
				
		};
		
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'whenUserHasAccountThen' ){
			
			console.log(JSON.stringify( msgObj    , null, 2 ));
			clearInterval(app.poll.polling);
			app.whenUserHasAccountThen(msgObj);			
			
		};		
		
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'refreshSidebarFiles' ){
			
			app.refreshSidebarFiles();
			
		
		};
		
		if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'clearPolling' ){
			
			
			console.log(JSON.stringify(   msgObj  , null, 2 ));
			
			clearInterval( app.poll.polling );
			app.showClickToInstall();		
			
		};
		
									
	}
	
	tools.crossdom.init('iframe_messaging_conduit', 'https://pictographr.com/partners/iframeSrcPostMsgConduit.html');
	
};
	