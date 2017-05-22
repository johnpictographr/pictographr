<?php 
	
	$version = 1234;

?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	
	<link href="https://cdnjs.cloudflare.com/ajax/libs/winjs/4.4.0/css/ui-light.css" rel="stylesheet" />
	<script src="https://cdnjs.cloudflare.com/ajax/libs/winjs/4.4.0/js/base.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/winjs/4.4.0/js/ui.js"></script>
	<script	src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
	<script	src="https://pictographr.com/js/core/tools.js?v=<?php echo $version; ?>"></script>
	<script>
		var 
		base_url = 'https://pictographr.com/',    
		scopes = [
			    		'https://www.googleapis.com/auth/drive',
							'https://www.googleapis.com/auth/drive.file', 
							'https://www.googleapis.com/auth/drive.install',
							'https://www.googleapis.com/auth/photos',
							'https://www.googleapis.com/auth/userinfo.profile',
							'https://www.googleapis.com/auth/userinfo.email'
						 ],
		
		createGoogleScriptTag = function() {

			var script = document.createElement('script'),
					src = 'https://apis.google.com/js/client.js?onload=handleClientLoad';
			
			script.setAttribute('src', src);
			
			document.head.appendChild(script);
		},
		
		handleClientLoad = function() {	
      window.setTimeout(checkAuth, 1);
    },
    
		checkAuth = function(){
      gapi.auth.authorize({
        		'client_id': '971250203842-rbjl54u2ui93ccb0b2ctkfkonqvmrnsp.apps.googleusercontent.com', 
        		'scope': scopes, 
        		'immediate': true
          },
          handleAuthResult);
		},
		
		google_id = undefined,
		domain = undefined,
		
		continueWebAuthentication = function(args) {
			
        var result = args[0].webAuthenticationResult;

        if (result.responseStatus === Windows.Security.Authentication.Web.WebAuthenticationStatus.success) {
            popMessage(result.responseData);
        }
        else if (result.responseStatus === Windows.Security.Authentication.Web.WebAuthenticationStatus.errorHttp) {
            popMessage("Error returned: " + result.responseErrorDetail);
        }
        else {
            popMessage("Status returned by WebAuth broker: " + result.responseStatus);
        }
        authzInProgress = false;

    },

		handleAuthResult = function(authResult){
								
			if(authResult && !authResult.error) {

				
				gapi.client.load('plus', 'v1', function() {
	
				  var request = gapi.client.plus.people.get({
				      		'userId': 'me'
				        });
				        
					request.execute(function(resp) {
						
						var google_id = resp.id;
						
						if( typeof( resp.domain ) != 'undefined'){
						
							domain = resp.domain;
						
						}
						
						tools.ajax(	
							'https://pictographr.com/auth/googleUserExist',  // ALSO SETS SESSIONP
							{google_id: google_id },
							'post', 
							function(responseObj) {
								
								window.location.assign('https://pictographr.com/app');
								
						});
						
					});
				}); 
				
			} else{
				
				
				tools.ajax(	
					base_url +  'auth/getAuthUrl', {'os': tools.whatIs()},
					'post', 
						function( response ) {
						
						var postObj = { 
							redirect: 'true',
							'os': tools.whatIs(),
							'partner_id': 16,
							'isUWP': 'true'
						}
						
						tools.ajax(	
							base_url + 'organization/setPSession', 
							postObj,
							'post', 
							function(responseObj) {
								
								$('.content').show();
								
								$('#signup').bind('click',  function() {
										window.location.href = response.authUrl ;
								})
								
								
						}); // --
						
				}); // --
				
			}

				
		},
		popMessage = function( message ) {
	    var msg = new Windows.UI.Popups.MessageDialog(  message );
	    msg.showAsync();
		},
		toast = function( message ) {
	   if(typeof( Windows) != 'undefined') {
	     var notifications = Windows.UI.Notifications;
	     var template = notifications.ToastTemplateType.toastImageAndText01;
	     var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);
	     var toastTextElements = toastXml.getElementsByTagName("text");
	     toastTextElements[0].appendChild(toastXml.createTextNode(message));
	     var toastImageElements = toastXml.getElementsByTagName("image");
	     toastImageElements[0].setAttribute("src", "http://assets.codepen.io/assets/social/facebook-default.png");
	     toastImageElements[0].setAttribute("alt", "red graphic");
	     var toast = new notifications.ToastNotification(toastXml);
	     var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
	     toastNotifier.show(toast);
	     console.log('This is a UWP');
	   } else{
	   	 console.log('This is not UWP');	
	   }
		};

		
		createGoogleScriptTag();
		
		</script>
		<style>
			.content {
				//display: none;
        width: 500px;
        height: 481px;

        position:absolute;
        left:0; right:0;
        top:0; bottom:0;
        margin:auto;

        max-width:100%;
        max-height:100%;
        overflow:auto;
			}
			#designpic{
				width: 400px;
			}
			#signup{
				cursor: pointer;
				margin-top: -14px;
				width: 240px;	
			}
		</style>
</head>
<body>
	<div  class="content">
		<div>
			<center><img  id="designpic" src="http://pictographr.com/img/splash4uwp.png" /></center>
			<center><img  id="signup" src="http://pictographr.com/img/loginGoogle.png" /></center>
		</div>
	</div>
	
	<form name="ignore_me">
	    <input type="hidden" id="page_is_dirty" name="page_is_dirty" value="0" />
	</form>
<script>
		
		//http://stackoverflow.com/questions/829046/how-do-i-detect-if-a-user-has-got-to-a-page-using-the-back-button

    function pageShown(evt){
        if (evt.persisted) {
            //popMessage("A");
        } else {
        	
          	// USER HAS ARRIVED FROM CLICKING BACK BUTTON  
						var dirty_bit = document.getElementById('page_is_dirty');
						
						if (dirty_bit.value == '1') window.location.reload();
						var mark_page_dirty = function () {
						    dirty_bit.value = '1';
						}
						mark_page_dirty();
					
					 /*
							history.pushState(null, null, document.URL);
							window.addEventListener('popstate', function () {
							    history.pushState(null, null, document.URL);
							});
					 */            
        }
    }

    function pageHidden(evt){
        if (evt.persisted) {
            //popMessage("C");
        } else {
            //popMessage("D");
        }
    }

    window.addEventListener("pageshow", pageShown, false);
    window.addEventListener("pagehide", pageHidden, false);
</script>
</body>
    