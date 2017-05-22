(function () {
	
  "use strict";

  Office.initialize = function (reason) {
    $(document).ready(function () {
    	
				app.doWithRenderedPNG = function( url ) {
					
						tools.convertImgToBase64(url, 'image/png', function(base64Img, width,  height) { 
							
							var baseArray  = base64Img.split(',');		

//							if (Office.context.requirements.isSetSupported('ImageCoercion', '1.1')) {
								
							if (     Office.context.document.setSelectedDataAsync   ) {
									
							    Office.context.document.setSelectedDataAsync(baseArray[1], {
							        coercionType: Office.CoercionType.Image,
							        imageLeft: 0,
							        imageTop: 0,
							        imageWidth: width/2,
							        imageHeight: height/2
							    }, function (asyncResult) { 
							    	
									  	app.deleteRenderedPNGForeverFromDriveTempFolder();	
									  							    		
							    		if( typeof( asyncResult.error ) != 'undefined' && asyncResult.error.code == '5007'){ // asyncResult.error.code == 5007 unsupported
							    			$('#console-container').show().empty().html('The insert feature is only supported on desktop version.');
							    			
							    			setTimeout(function(){
							    				$('#console-container').hide();
							    			}, 7000);
							    			
							    		};

							    	              
							    });
							    
							} else{
								$('#console-container').empty().html('unsupported');
							}
							
						});
				};

				app.showClickToInstall = function() {
					
						this.paintLoginWithGoogleButton();
				
						$('#get-started-button').unbind('click').click( function(e) {
							e.preventDefault();
							
							var paramObj = {};
							paramObj['partner_id'] = 15;
							app.createNewPictographrUser( paramObj );

						});

				};
				
				
				app.settings.dim.thumb_container = app.settings.dim.widthMain;

				
				app.init();


				
    });
  };


})();

/*

Base64 encoded image stream  (Office.CoercionType.Image) 
- Applies to 
Excel, 
PowerPoint, 
Word and Word Online only.
see http://dev.office.com/reference/add-ins/shared/document.setselecteddataasync


<Requirements>
  <Sets DefaultMinVersion="1.1">
    <Set Name="ImageCoercion"/>
  </Sets>
</Requirements>

<Requirements>
   <Sets DefaultMinVersion="1.1">
      <Set Name="TableBindings" MinVersion="1.1"/>
      <Set Name="OOXML" MinVersion="1.1"/>
   </Sets>
   <Methods>
      <Method Name="Document.getSelectedDataAsync"/>
   </Methods>
</Requirements> // http://dev.office.com/docs/add-ins/overview/specify-office-hosts-and-api-requirements


*/