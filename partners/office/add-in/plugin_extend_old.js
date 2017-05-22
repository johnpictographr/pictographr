(function () {
	
  "use strict";

  Office.initialize = function (reason) {
    $(document).ready(function () {
    	
				app.doWithRenderedPNG = function( url ) {
					
					tools.convertImgToBase64(url, 'image/png', function(base64Img, width,  height) { 
						
						var baseArray  = base64Img.split(',');
						
				   	Excel.run(function (context) {
				    	
				    	var sheet = context.workbook.worksheets.getActiveWorksheet();
				    	
				      sheet.insertInlinePictureFromBase64(baseArray[1],"start");
				
				      return context.sync().then(function () {
				          console.log('Successfully inserted Pic');
				      });
				        
				    })
				    .catch(function (error) {
				      console.log('Error: ' + JSON.stringify(error));
				    });
						
						return;

            Office.context.document.setSelectedDataAsync(baseArray[1], {
                coercionType: Office.CoercionType.Image,
                imageLeft: 50,
                imageTop: 50,
                imageWidth: width/4,
                imageHeight: height/4
            }, function (asyncResult) {               
            });

					});
					
				};
				
				app.showClickToInstall = function() {
					
						this.paintLoginWithGoogleButton();
				
						$('#get-started-button').click( function(e) {
							e.preventDefault();
							tools.crossdom.send({
								msgFrom: nameOfThisFile,
								purpose: 'createNewPictographrUser',
								partner_id: 12	
							});
							app.poll.byAuth();
						});
							
						$('#greet-container').css('height', tools.getScreenDim().height - 100 + 'px');
						
				};
				
				app.settings.dim.thumb_container = 347;
				app.stubs.doItLabel = "Insert";
				
				app.resizeElements = function() {
					
					$('#main_container').css('width', '347px');
					
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
					
					$('#greet-container').css('height', tools.getScreenDim().height - 100 + 'px');
					
				};
				
				app.init();
				
				return;
				
    });
  };


})();