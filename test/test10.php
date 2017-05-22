<head>
	<link rel="stylesheet" href="https://ssl.gstatic.com/docs/script/css/add-ons1.css">
	<style>
		button:focus { outline:0 !important; }
		#main_container{
			position: absolute;
			width: 300px;
			border-right: 1px solid lightgray;
		}
		.boxes{
			position:relative;
			float: left;
			margin-right: 2px;
			margin-bottom: 2px;
			width: 196px;
			height: 196px;
//			background: ivory;
			white-space: nowrap;
			text-align: center;
		}
		.boxes:hover .buttons_wrapper,
		.boxes.loading .buttons_wrapper,
		.boxes.deleting .buttons_wrapper{		
			display: block;	
		}

		.boxes.disabled .buttons_wrapper,
		.boxes.loading .buttons_wrapper .action_buttons.disabled{		
			display: none;	
		}

		.boxes.deleting .buttons_wrapper .action_buttons.disabled{		
			visibility: hidden;	
		}

		.buttons_wrapper{
			position:absolute;
			width: 190px;
			left: 5px;
			top: 80px;
//			background: orange;
			display: none;
		}
		.action_buttons{
			outline: 0;
			position: relative;
			opacity: 1;
			width: 60px;
			height: 30px;
			cursor: pointer;
			font-family: arial;
//			box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
			font-weight: bold;
			font-size: 13px;
			border-radius: 2px;
//			float: left;
			display: block;
    	margin: 5px auto;
	    color: #fff;
	    padding-top: 6px;
	    border-radius: 3px;
		}

		.action_buttons.edit{
	    background-color: #FF9800;
	    border-color: #FF9800;
		}
		
		.action_buttons.delete{
		background-color: #f5f5f5;
		border-color: #f5f5f5;
		color: #333;
		}		
		
		
		.action_buttons.doit{
	    background-color: #2196F3;
	    border-color: #2196F3;
		}	
		
		.action_buttons.doit img{
	     margin-top: 4px;
		}				
		
		.helper {
			display: inline-block;
			height: 100%;
			vertical-align: middle;
		}
		.boxes .thumbs{
	    vertical-align: middle;
	    max-height: 196px;
	    max-width: 196px;
	    margin: 0px;
		}
		#loadingImg{
			width: 29px;
			margin: 2px auto;	
		}
	</style>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<script src="js/lib/popconfirm/popconfirm_adapted.js"></script>
	<script>
	var data = [
	  {
	    "fileId": "0B5ptY5tUIebjelNCSlhRMTFSb3M",
	    "thumbnailLink": "https://lh3.googleusercontent.com/uZ0tDIEea3RCoCCYKFYHOpwLROM3fQgJGNytqcy0vuX0G_Zt2u54qmL4WA0DE5DGyMldCg=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjcENSYi1pRUlubUk",
	    "thumbnailLink": "https://lh4.googleusercontent.com/77iWYsetbpSSNIa9_QEZnOadcBoEMd8xb8kT2mLf0awJTk7nRpgyaFx-jDi6bzI6Jt_ppA=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjMy1PR3BaUklJTzg",
	    "thumbnailLink": "https://lh4.googleusercontent.com/jOOzF8fWgcsYYxJZnDZakySS0fDfx4EBOPd2F9Ai1Y3YrIGZURrCh_sNoHXvIIZeoyMAGg=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjdFNoNE5SZVV6LXc",
	    "thumbnailLink": "https://lh6.googleusercontent.com/2VVDOI5r8qswVfHZz7hmWF1Ivgi9UoF8wBKyaPmB7ffxt8RwQU9HbB47VAvj3H9MW3CEGA=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjeVRWVUotY1BqYTQ",
	    "thumbnailLink": "https://lh6.googleusercontent.com/wK3IX8mwNI-vz4726jPFAPau68iWnVy5L2O0e2OOscRbtI4pEGZhmv-K1A_0ovLkco-Izw=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjMy1PR3BaUklJTzg",
	    "thumbnailLink": "https://lh4.googleusercontent.com/jOOzF8fWgcsYYxJZnDZakySS0fDfx4EBOPd2F9Ai1Y3YrIGZURrCh_sNoHXvIIZeoyMAGg=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjdFNoNE5SZVV6LXc",
	    "thumbnailLink": "https://lh6.googleusercontent.com/2VVDOI5r8qswVfHZz7hmWF1Ivgi9UoF8wBKyaPmB7ffxt8RwQU9HbB47VAvj3H9MW3CEGA=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjeVRWVUotY1BqYTQ",
	    "thumbnailLink": "https://lh6.googleusercontent.com/wK3IX8mwNI-vz4726jPFAPau68iWnVy5L2O0e2OOscRbtI4pEGZhmv-K1A_0ovLkco-Izw=s220"
	  }
	]
	</script>
	<script>
		
	$(document).ready(function() {
			
			var tools = {
				ajax:	function(	url, arrDataObj, type, callback	)	{
					
					$.ajax({
						url: url + '?v=' + Math.random(),
						type:	type,
				    data: {
				        arrData : arrDataObj
				    },
						dataType:'json',
						success: function(data){
							//console.log('success');
							//console.log(JSON.stringify(  data   , null, 2 ));
							callback(data);
						},
						error:	function(data){
							console.log('error');
							console.log(JSON.stringify(  data   , null, 2 ));
							callback(data);
						},
						async:true
					});
				},
				randomIntFromInterval: function(min,max) {
			    return Math.floor(Math.random()*(max-min+1)+min);
				},
				openInNewTab: function(url) {
				  var win = window.open(url, '_blank');
				  win.focus();
				}
			};
		
			var App = function(){
		
		    return function() {
		    	
					var app = this;
	
					this.stubs = {};
	
					this.settings = {
						dim:{
							buttons_wrappers: {
								width: 190, // ideal
								height: 136, // ideal
								left: 5	 // ideal
							},
							action_buttons: {
								width: 62,
								height: 30	
							}
						}	
					};
	
					this.getFiles = function()	{
						
						var url = '/app/getFileList',
								postObj = {
									'google_id': '105870981217629422585',
									'whichFolder': 'files'
								};
	
						tools.ajax(url, postObj, 'post', function(data) {
							
							console.log(JSON.stringify(  data   , null, 2 ));
							
							app.stubs.data = data;
							app.paint();
						});		
						
					};
		
					this.resizeElements = function() {
						
						$('#main_container').width( app.settings.dim.main_container );
						
						var shrinkByRatio = (app.settings.dim.main_container / app.settings.dim.main_container);  // ideal
							
						$('.boxes').width( (app.settings.dim.main_container / 2) - 2);
						$('.boxes').height( (app.settings.dim.main_container / 2) - 2 );
						
						var marginSpacingformula = ($('.buttons_wrapper').width() - app.settings.dim.action_buttons.width * 2) / 4 ;

						$('.thumbs').css({	
							'max-width':  ((app.settings.dim.main_container/2) * shrinkByRatio  - 2) + 'px',	
							'max-height':  ((app.settings.dim.main_container/2) * shrinkByRatio  - 2) + 'px'
						});
						
					};
		
					this.paint = function() {
						
						var placement = 'left';
						
						// https://www.placebear.com/200/300
						//"http://placehold.it/200x200"
						// "http://placebear.com/' + tools.randomIntFromInterval(75,450) + '/' + tools.randomIntFromInterval(75,450) + '"
						// "http://placehold.it/' + tools.randomIntFromInterval(75,450) + 'x' + tools.randomIntFromInterval(75,450) + '"
						for( var idx in data){
							
							var obj = data[idx];
							var thumbLink = obj.thumbnailLink;
							var fileId = obj.fileId;
							
							if( placement == 'right') placement = 'left';
							 else placement = 'right';
							
							var box = '\
								<div  class="boxes">\
									<span class="helper"></span>\
									<img  class="thumbs" src="http://placebear.com/' + tools.randomIntFromInterval(75,450) + '/' + tools.randomIntFromInterval(75,450) + '">\
								</div>\
							';						
							
							$('#thumb-container').append(box);
							
						}
					 	this.resizeElements();	
						this.bind();				
					};
					
					this.bind = function() {
						
				    $('#new_design').click(function(e){
				    	e.preventDefault();
				    	tools.openInNewTab('https://pictographr.com/app?state=%7B%22newSerial%22:%20%220.6974779665800683%22,%20%22action%22:%22create%22,%22userId%22:%22%22%7D');
				    });
	
				    $('.delete').click(function(e){
								console.log('server delete');
						}).popConfirm({
						    title: "Confirmation",
						    content: "Are you sure?"
						})
				    .click(function(e){
				    	e.preventDefault();
				    	var that = this;
				    	$(this).parent().parent().addClass('deleting');
							$('.boxes:not(.deleting)').addClass('disabled');
				    	$('.action_buttons').not(this).addClass('disabled');
							$(this).css({
								'background-color': '#d9534f',
								'border-color': '#d9534f',
								'color': 'white'	
							});
				    });
	
		        var doWhenClose = function( that ) {
							$('.delete').parent().parent().removeClass('deleting');
							$('.delete').css({
								'background-color': '#f5f5f5',
								'border-color': '#f5f5f5',
								'color': '#333'	
							});							
							
							$('.action_buttons, .boxes').removeClass('disabled');
							
		        };		    
				    
		        $('.boxes').on('click', function () {
		          	console.log('x');
		          	doWhenClose();
		            $('.action_buttons.delete').popover('hide').removeClass('popconfirm-active');
		        });
						
				    $('.edit').click(function(e){
				    	e.preventDefault();
				    	tools.openInNewTab('https://pictographr.com/app?state=%7B%22newSerial%22:%20%220.6974779665800683%22,%20%22action%22:%22create%22,%22userId%22:%22%22%7D');
				    });
				    					
						$('.doit').bind('click', function() {
							
							var that = this;
							
							app.progress.start( this );
	
							setTimeout(function(){
								
									app.progress.stop( that );
								
							}, 3000);
							
						})
						
					};
					
					this.progress = {
						start: function(that) {
							$(that).parent().parent().addClass('loading');
							$(that).css({'background': 'white', 'border-color': 'white'}).html('\
								<img src="img/smallloading.gif" />\
							');
							$('.boxes:not(.loading)').addClass('disabled');
							$('.action_buttons.edit, .action_buttons.delete').addClass('disabled');
						},
						stop: function( that ) {
							$('.boxes').removeClass('disabled');
							$('.action_buttons.edit, .action_buttons.delete').removeClass('disabled');
							$(that).parent().parent().removeClass('loading');
							$(that).css({'background': '#2196F3', 'border-color': '#5cb85c'}).html(app.stubs.doItLabel);
						}
					};
					
					this.renderFilePngForPost = function(fileId) {
						
						var url = '/more/renderPNGFromDrive',
								postObj = {
									'google_id': app.stubs.google_id,
									'fileId': fileId
								};
	
						tools.ajax(url, postObj, 'post', function(data) {
							
							var url = 'https://pictographr.com/image/streamDriveImage?google_id=' + app.stubs.google_id + '&fileId=' + data.imageId + '&max_width=40000';
							console.log(url);
							app.doWithRenderedPNG(url);
	
						});	
						
					};
					
				}}();
				
			var app = new App();
			
			/* CUSTOM */
			app.settings.dim.main_container = 255;
	
			app.setUserId = function()	{
						
				hsp.getMemberInfo(function(info){
					app.stubs.userId = info.userId;
					app.stubs.google_id = '105870981217629422585';
				});					
			};
			
			app.doWithRenderedPNG = function( url ) {
				
				hsp.composeMessage( 'Check out this file.', { shortenLinks: true } );
				
				var timestamp = new Date().getTime() / 1000;
				var new_time = parseInt(timestamp, 10);
				
				var token = app.stubs.userId + '' + new_time + url + app.settings.secret;
				
				console.log('userId: ' + app.stubs.userId);
				console.log('new_time: ' + new_time);
				console.log('token: ' + token);
				console.log('SHA512: ' + tools.SHA512(token));
				
				var obj = {
					url: url,
					name: 'logo',
					extension: 'png',
					timestamp: new_time,
					token: tools.SHA512(token)
				}
				
				hsp.attachFileToMessage(obj);
				
			};
			
			app.stubs.doItLabel = "Attach";
			
			app.labelDoItButton = function() {
				$('.doit').html(app.stubs.doItLabel);
			};
			
			app.init = function() {
				
	//	    var hsp_params = {
	//	    			apiKey: 'dw6rh5otra8gkwok8c00k8wkc3ie1e2pfdj',
	//	    			useTheme: true,
	//	    			callBack: function( data ) {}
	//	        };
	//	        
	//			hsp.init(hsp_params);
	//			
	//			this.setUserId();
	//			this.getFiles();
				
				this.paint();
				this.labelDoItButton();
				
			};
			
			app.init();
			
	});
		
	
	</script>		

</head>
<style>
.sidebar{
	width: 300px;	
}
#logo{
	display: block;
	margin:auto;
	width:114px;
}

#greet-container{
	border: 1px solid darkgray;
	height: 400px;
	display: none;
}
#greet-container div{
	margin: 40px auto;
	font-size: 16px;
	color: black;
	text-align:center;
}
#thumb-container{
	padding-top: 5px;
	border: 1px solid darkgray;
	height: 500px;
	font-size: 17px;
	color: gray;
	overflow-x: hidden;
	overflow-y: auto;
}
.buttons-container{
	height: 32px;
	position: relative;
}
#get-started-button{
	height: 45px;
	width: 250px;
	font-size: 17px;
}
#refresh-button{
	height: 26px;
	width: 26px;
	min-width: 0;
	padding: 0px 0px 0px 2px;
	border-top-right-radius: 0;
	top: 8px;
	position: relative;
}
.refresh-icon{
	background: no-repeat url(https://ssl.gstatic.com/ui/v1/icons/mail/sprite_black2.png) -63px -21px;
	height: 21px;
	width: 21px;
	opacity: .55;
}
</style>
<body>
	<div class="sidebar">
		<div  class="block buttons-container">

			<div  class="top-right">
				<button  class="button" id="refresh-button" ><div class="refresh-icon"></div></button>
				<button  class="button create">Create</button>
			</div>

		</div>
		<div  id="thumb-container"    class="block">
		</div>		
		<div  id="greet-container"  class="block">
			<div>
				<img  id="logo" src="favicons/apple-touch-icon-114x114.png">
			</div>
			<div>
				Sign in with Google to get started.
			</div>
			<div>
				<button id="get-started-button"  class="button action">Get Started!</button>
			</div>
		</div>
		<div  class="block buttons-container">
			<div  class="top-right">
				<button  class="button action">Insert</button>
				<button  class="button">Edit</button>
				<button  class="button">Delete</button>
			</div>
		</div>
	</div>

</body>
