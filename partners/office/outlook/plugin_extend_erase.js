(function () {
	
  "use strict";
  
	var item;
	
	var _mailbox;
	var _xhr;
	
	function readyStateChange() {
	    if (_xhr.readyState == 4 && _xhr.status == 200) {
	
	        var response = JSON.parse(_xhr.responseText);
	
	        if (undefined == response.error) {
	        	
	        	console.log(JSON.stringify(  response   , null, 2 ));
	        	
	            document.getElementById("msexchuid").value = response.token.msexchuid;
	            document.getElementById("amurl").value = response.token.amurl;
	            document.getElementById("uniqueID").value = response.token.uniqueID;
	            document.getElementById("iss").value = response.token.iss;
	            document.getElementById("x5t").value = response.token.x5t;
	            document.getElementById("nbf").value = response.token.nbf;
	            document.getElementById("exp").value = response.token.exp;
	        }
	        else {
	        	console.log('BAD');
	        	console.log(JSON.stringify(  response   , null, 2 ));
	        	
	            document.getElementById("error").value = response.error;
	        }
	    }
	}
  
	function getUserIdentityTokenCallback(asyncResult) {
	  var token = asyncResult.value;
	
	  _xhr = new XMLHttpRequest();
	  _xhr.open("POST", "https://localhost:44300/IdentityTestService/UnpackTokenJSON");
	  _xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	  _xhr.onreadystatechange = readyStateChange;
	
	  var request = new Object();
	  request.token = token;
	  //request.phoneNumbers = _mailbox.item.getEntities().phoneNumbers;
	
	  _xhr.send(JSON.stringify(request));
	}

  Office.initialize = function (reason) {
  	
    // Checks for the DOM to load using the jQuery ready function.
    $(document).ready(function () {
    // After the DOM is loaded, app-specific code can run.
        _mailbox = Office.context.mailbox;
    _mailbox.getUserIdentityTokenAsync(getUserIdentityTokenCallback);
    });
  	
  	return;
  	
  	item = Office.context.mailbox.item;
  	
    $(document).ready(function () {
    	
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
					          	
									  	app.deleteRenderedPNGForeverFromDriveTempFolder();
					          	
					            console.log('Successfully set data in item body.');
					          }
					        });

					    }
					  }
					});
					
				};
				

				app.showClickToInstall = function() {
					
						this.paintLoginWithGoogleButton();
				
						$('#get-started-button').click( function(e) {
							e.preventDefault();
							tools.crossdom.send({
								msgFrom: nameOfThisFile,
								purpose: 'createNewPictographrUser',
								partner_id: 5	
							});
							app.poll.byAuth();
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