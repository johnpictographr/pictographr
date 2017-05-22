(function () {
	
  "use strict";
  
  var item;

  Office.initialize = function (reason) {
  	
  	item = Office.context.mailbox.item;
							
		var whatType = typeof( Office.context.mailbox.displayNewAppointmentForm );
		
    $(document).ready(function () {
    	
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
						
						app.bind.activate = function() {
							
							$('.thumbs').bind('click', function() {
												
								$('.thumbs').removeClass('active');
								$(this).addClass('active');						
								var fileId = $(this).attr('fileId');
								
								if( whatType == 'function'){ // DETECTS READ MODE
		
									$('#edit-button, #delete-button').removeClass('disabled');
									$('#edit-button, #delete-button').attr('fileId', fileId);
									
								}else{
		
									$('.ifactive').removeClass('disabled');
									$('#edit-button, #insert-button, #delete-button').attr('fileId', fileId);
																	
								};
								
		
							});
						}
						
						$('#console-container').html(whatType);
		
						app.bind.doit = function() {
							
							if( whatType == 'function'){
											
								$('#insert-button').removeClass('action').unbind('click').bind('click', function(e) {
									
									$('#console-container').html('Insert is disabled in read mode.');
									
							  	e.preventDefault();
							  	
								}).css('opacity',  '.2');	
								
							}else{
								
								$('#insert-button').unbind('click').bind('click', function(e) {
									
							  	e.preventDefault();
							  	
							  	if( $(this).hasClass('disabled') ) return;
							  	
									app.renderFilePngForPost( this );
								})	
																
							};
						
						};
						
						app.bind.activate();
						
					});		
					
				};    	
    	
				app.doWithRenderedPNG = function( url ) {
					
					item.body.getTypeAsync(
					function (result) {
					  if (result.status === Office.AsyncResultStatus.Failed) {
					    console.error(result.error.message);
					  } else {

					    if (result.value === Office.MailboxEnums.BodyType.Html) {
					      
					      item.body.setSelectedDataAsync(
					        '<img src="' + url + '" style="height: 200px;"></img>',
					        { coercionType: Office.CoercionType.Html,
              		asyncContext: { var3: 1, var4: 2 } },
					        function (asyncResult) {
					          if (asyncResult.status ===
					            Office.AsyncResultStatus.Failed) {
					            console.error(asyncResult.error.message);
					          } else {
					          	
									  	/*
									  		DO NOT REMOVE IMG FROM DRIVE AS IT IS NEEDED AFTER USER SENDS EMAIL WITH PNG ATTACHED
									  	*/
					          	
					            console.log('Successfully set data in item body.');
					          }
					        });

					    }
					  }
					});
					
				};

				app.renderFilePngForPost = function( that ) {
					
					app.progress.start( that );
					
					var fileId = $(that).attr('fileId'),
							url = 'https://pictographr.com/more/renderFromDrive',
							postObj = {
								'google_id': app.stubs.google_id,
								'fileId': fileId,
								'fileType': 'png',
								'useShareFolder': 'true'
							};
				
					tools.ajax(url, postObj, 'post', function(data) {
						
						app.progress.stop( that );
						
						app.stubs.imageId = data.imageId;
						
						var url = 'https://pictographr.com/image/streamDriveImage?google_id=' + app.stubs.google_id + '&fileId=' + data.imageId + '&max_width=40000';
						app.doWithRenderedPNG(url);
				
					});	
					
				};

				app.showClickToInstall = function() {
					
						this.paintLoginWithGoogleButton();

						$('#get-started-button').unbind('click').click( function(e) {
							e.preventDefault();
							
							var paramObj = {};
							paramObj['partner_id'] = 5;
							app.createNewPictographrUser( paramObj );

						});
							
						$('#greet-container').css('height', tools.getScreenDim().height - 40 + 'px');
						
				};

				app.settings.dim.thumb_container = 315;
				
				app.resizeElements = function() {
					
					$('#main_container').css('width', '315px');
					
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
					
					$('#greet-container').css('height', tools.getScreenDim().height - 40 + 'px');
					
				};
				
				app.init();
    });
  };


})();