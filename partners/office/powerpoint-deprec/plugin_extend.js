(function () {
	
  "use strict";

  Office.initialize = function (reason) {
    $(document).ready(function () {
				app.doWithRenderedPNG = function( url ) {
					
					tools.convertImgToBase64(url, 'image/png', function(base64Img, width,  height) { 
						
						var baseArray  = base64Img.split(',');

            Office.context.document.setSelectedDataAsync(baseArray[1], {
                coercionType: Office.CoercionType.Image,
                imageLeft: 50,
                imageTop: 50,
                imageWidth: width/2,
                imageHeight: height/2
            }, function (asyncResult) { 
            	
						  	app.deleteRenderedPNGForeverFromDriveTempFolder();
            	              
            });

					});
					
				};

				app.showClickToInstall = function() {
					
						this.paintLoginWithGoogleButton();
				
						$('#get-started-button').unbind('click').click( function(e) {
							e.preventDefault();
							
							var paramObj = {};
							paramObj['partner_id'] = 4;
							app.createNewPictographrUser( paramObj );

						});

				};
				
				
				app.settings.dim.thumb_container = app.settings.dim.widthMain;

				
				app.init();
    });
  };


})();