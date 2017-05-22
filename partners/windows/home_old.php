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

		handleAuthResult = function(authResult){
								
			$('#out-button').bind('click',  function() {
				
				$('iframe').attr('src', 'https://accounts.google.com/Logout').load(function () {
					$('iframe').attr('src', 'https://pictographr.com/auth/destroySessionP').unbind('load').load(function () {
						window.location.reload();
					});					
				});	
			})			
								
			$('#reload-button').bind('click',  function() {
				window.location.reload();
			})	
								
			$('#toast').bind('click',  function() {
				toast('Hello world!');
			})
								
			$('#pdf').bind('click',  function() {
				pdfLaunch();
			})	
								
			$('#savepng').bind('click',  function() {
				savefile();
			})	
								
			if(authResult && !authResult.error) {

				$('body').css('background', 'lightgreen');
				
				$('#textbox1').html(JSON.stringify( authResult , null, 2 ));
				
				gapi.client.load('plus', 'v1', function() {
	
				  var request = gapi.client.plus.people.get({
				      		'userId': 'me'
				        });
				        
					request.execute(function(resp) {
						
						$('#textbox2').html(JSON.stringify( resp    , null, 2 ));

						var google_id = resp.id;
						
						if( typeof( resp.domain ) != 'undefined'){
						
							domain = resp.domain;
						
						}
						
						tools.ajax(	
							'https://pictographr.com/auth/googleUserExist',  // ALSO SETS SESSIONP
							{google_id: google_id },
							'post', 
							function(responseObj) {
								
								responseObj['os'] = tools.whatIs();
								responseObj['Edge'] = tools.detectEdge();
								
								$('#textbox3').html(JSON.stringify( responseObj, null, 2 ));
								console.log('Hello');
								
								$('#cont-button').bind('click',  function() {
									window.location.assign('https://pictographr.com/app');
								})
						});
						
					});
				}); 
				
			} else{
				
				$('body').css('background', 'pink');
				
				$('#cont-button').text('Sign in');
				
				$('#textbox1').html( JSON.stringify( tools.whatIs(), null, 2 ));
				
				tools.ajax(	
					base_url +  'auth/getAuthUrl', {'os': tools.whatIs()},
					'post', 
						function( response ) {
						
						$('#textbox2').html( JSON.stringify( response, null, 2 ));
						
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
								
								responseObj['Edge'] = tools.detectEdge();
								
								$('#textbox3').html( JSON.stringify(responseObj, null, 2 ));
								
								$('#cont-button').bind('click',  function() {
									// tools.popupwindow(response.authUrl, "_blank", 500, 550);
									window.location.assign(response.authUrl);
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
		},
		SdkSample = {},
		
		
		savefile = function() {
			
				var url = 'https://pictographr.com/image/streamDriveImage?google_id=105870981217629422585&fileId=0B5ptY5tUIebjd09HS2FmTjVLNFk&max_width=1366';
				
        Windows.Storage.KnownFolders.getFolderForUserAsync(
        	null, Windows.Storage.KnownFolderId.picturesLibrary
        ).then(function (picturesLibrary) {
            return picturesLibrary.createFileAsync("pictographr.png", Windows.Storage.CreationCollisionOption.replaceExisting);
        }).done(
        function (file) {

					WinJS.xhr({
					    url: url,
					    responseType: "arraybuffer"
					}).then(
					    function completed(result) {
						    var fileName = "image.png";
						    var buffer = new Uint8Array(result.response);
						    Windows.Storage.FileIO.writeBytesAsync(file, buffer);
					
					}).then(
							function createFileSuccess() {
							    var msgtext = "File has downloaded successfully!";
							    var msg = new Windows.UI.Popups.MessageDialog(msgtext);
							    msg.showAsync();
					});

        },
        function (error) {
        		toast("error in create");
        });
        
		},
		
		
		createFile = function() {
			
        Windows.Storage.KnownFolders.getFolderForUserAsync(null /* current user */, Windows.Storage.KnownFolderId.picturesLibrary).then(function (picturesLibrary) {
            return picturesLibrary.createFileAsync("pictographr.png", Windows.Storage.CreationCollisionOption.replaceExisting);
        }).done(
        function (file) {
            SdkSample.sampleFile = file;
            writeToStream();
            
        },
        function (error) {
        		toast("error in create");
        		//$('#textbox3').html(JSON.stringify( error, null, 2 ));
            //WinJS.log && WinJS.log(error, "sample", "error");
            
        });
    },
    writeToStream = function() {  
    	
        if (SdkSample.sampleFile !== null) {
        				
					var url = 'https://pictographr.com/image/streamDriveImage?google_id=105870981217629422585&fileId=0B5ptY5tUIebjd09HS2FmTjVLNFk&max_width=1366';
								
					WinJS.xhr({
					    url: url,
					    responseType: "arraybuffer"
					}).then(
					    function completed(result) {
					    var fileName = "image.png";
					    var buffer = new Uint8Array(result.response);
					    Windows.Storage.FileIO.writeBytesAsync(SdkSample.sampleFile, buffer);
					
					}).then(
					function createFileSuccess() {
					    var msgtext = "File has downloaded successfully!";
					    var msg = new Windows.UI.Popups.MessageDialog(msgtext);
					    msg.showAsync();
					    
					    
							var printManager = Windows.Graphics.Printing.PrintManager.getForCurrentView();
							
							printManager.addEventListener("printtaskrequested", function( printEvent ) {
								
						    printEvent.request.createPrintTask("Print Sample", function (args) {
						    	
			            var deferral = args.getDeferral();
			
			            // Choose the printer options to be shown.
			            // The order in which the options are appended determines the order in which they appear in the UI
			            printTask.options.displayedOptions.clear();
			            printTask.options.displayedOptions.push(
			                Windows.Graphics.Printing.StandardPrintTaskOptions.copies,
			                Windows.Graphics.Printing.StandardPrintTaskOptions.mediaSize,
			                Windows.Graphics.Printing.StandardPrintTaskOptions.orientation,
			                Windows.Graphics.Printing.StandardPrintTaskOptions.duplex);
			
			            // Preset the default value of the printer option
			            printTask.options.mediaSize = Windows.Graphics.Printing.PrintMediaSize.northAmericaLetter;
			
			            // Register the handler for print task completion event
			            printTask.addEventListener("completed", function() {
						        if (printTaskCompletionEvent.completion === Windows.Graphics.Printing.PrintTaskCompletion.failed) {
						           popMessage("Failed to print.");
						        }
			            });

			            MSApp.getHtmlPrintDocumentSourceAsync(SdkSample.sampleFile).then(function (source) {
			                args.setSource(source);
			                deferral.complete();
			            });
				
						    });
							});
							
							Windows.Graphics.Printing.PrintManager.showPrintUIAsync();	
					    
					    
					});
								
				}
				
    },
    pdfLaunch = function() {

					var url = 'https://pictographr.com/app/streamPDF?google_id=105870981217629422585&fileId=0B5ptY5tUIebjWi1oOG1ETE9LQzQ';
			    	
			    	
			
					// Create a Uri object from a URI string 
					var uri = new Windows.Foundation.Uri(url);
					
					// Launch the URI with a warning prompt
					var options = new Windows.System.LauncherOptions();
					options.treatAsUntrusted = false;
					
					Windows.System.Launcher.launchUriAsync(uri, options).then(
					   function (success) {
					      if (success) {
					         // URI launched
					      } else {
					         // URI launch failed
					      }
					   });

			    	
			    return;
			    
			    
			    
			    
			    
					var printManager = Windows.Graphics.Printing.PrintManager.getForCurrentView();
					
					printManager.addEventListener("printtaskrequested", function( printEvent ) {
						
				    printEvent.request.createPrintTask("Print Sample", function (args) {
				    	
	            var deferral = args.getDeferral();
	
	            // Choose the printer options to be shown.
	            // The order in which the options are appended determines the order in which they appear in the UI
	            printTask.options.displayedOptions.clear();
	            printTask.options.displayedOptions.push(
	                Windows.Graphics.Printing.StandardPrintTaskOptions.copies,
	                Windows.Graphics.Printing.StandardPrintTaskOptions.mediaSize,
	                Windows.Graphics.Printing.StandardPrintTaskOptions.orientation,
	                Windows.Graphics.Printing.StandardPrintTaskOptions.duplex);
	
	            // Preset the default value of the printer option
	            printTask.options.mediaSize = Windows.Graphics.Printing.PrintMediaSize.northAmericaLetter;
	
	            // Register the handler for print task completion event
	            printTask.addEventListener("completed", function() {
				        if (printTaskCompletionEvent.completion === Windows.Graphics.Printing.PrintTaskCompletion.failed) {
				           popMessage("Failed to print.");
				        }
	            });
	            
	            console.log(SdkSample.sampleFile);
	            
			        args.setSource(SdkSample.sampleFile);
			        deferral.complete();
		            
		
				    });
					});
					
					Windows.Graphics.Printing.PrintManager.showPrintUIAsync();	 
					
					return;
					
					   	
			//var url = 'http://www.adobe.com/content/dam/Adobe/en/accessibility/products/acrobat/pdfs/acrobat-x-accessible-pdf-from-word.pdf';
			var url = 'https://pictographr.com/app/streamPDF?google_id=105870981217629422585&fileId=0B5ptY5tUIebjWi1oOG1ETE9LQzQ';

			WinJS.xhr({
			    url: url,
			    responseType: "arraybuffer"
			}).then(
			
		    function completed(result) {
		    	
			    popMessage('A');	
			    	
			    var buffer = new Uint8Array(result.response);
	
					var printManager = Windows.Graphics.Printing.PrintManager.getForCurrentView();
					
					printManager.addEventListener("printtaskrequested", function( printEvent ) {
						
				    printEvent.request.createPrintTask("Print Sample", function (args) {
				    	
	            var deferral = args.getDeferral();
	
	            // Choose the printer options to be shown.
	            // The order in which the options are appended determines the order in which they appear in the UI
	            printTask.options.displayedOptions.clear();
	            printTask.options.displayedOptions.push(
	                Windows.Graphics.Printing.StandardPrintTaskOptions.copies,
	                Windows.Graphics.Printing.StandardPrintTaskOptions.mediaSize,
	                Windows.Graphics.Printing.StandardPrintTaskOptions.orientation,
	                Windows.Graphics.Printing.StandardPrintTaskOptions.duplex);
	
	            // Preset the default value of the printer option
	            printTask.options.mediaSize = Windows.Graphics.Printing.PrintMediaSize.northAmericaLetter;
	
	            // Register the handler for print task completion event
	            printTask.addEventListener("completed", function() {
				        if (printTaskCompletionEvent.completion === Windows.Graphics.Printing.PrintTaskCompletion.failed) {
				           popMessage("Failed to print.");
				        }
	            });
	            
	            
			        args.setSource(buffer);
			        deferral.complete();
		            
		
				    });
					});
					
					Windows.Graphics.Printing.PrintManager.showPrintUIAsync();	
						
			});


    },
    mytest = function() {
    	toast('my test');
    },
		systemAlertCommandInvokedHandler = function() {
			console.log ("OUTPUT: The " + command.label + " was selected");
		};
		createGoogleScriptTag();
		</script>
		<style>
			.theTextarea, iframe{
				width: 500px; 
				height: 307px; 
				overflow: scroll;
				border: 1px solid black;
				padding: 25px;
				background: white;
			}
		</style>
</head>
<body>
	<button id="cont-button" >Continue</button>
	<button id="reload-button" >Reload</button>
	<button id="out-button" >Logout</button>
	<button  id="toast" class="btn" >Toast</button>
	<button  id="pdf" class="btn" >PDF</button>
	<button  id="savepng" class="btn" >Save PNG</button>
	<button  id="test" class="btn" >Test</button>
	<img  id="testimg" src=''/><br />
	<textarea  id="textbox1"   class="theTextarea" >
	</textarea>
	<textarea  id="textbox2"    class="theTextarea"  >
	</textarea>
	<textarea  id="textbox3"    class="theTextarea"  >
	</textarea>
	<iframe src="https://pictographr.com/auth/whatsInSessionp" ></iframe>
	
</body>
    