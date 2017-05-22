<head>
<link rel="stylesheet" href="css/app.css">
<link rel="stylesheet" type="text/css" href="js/lib/bootstrap/bootstrap.min.css"/>
<link rel="stylesheet" type="text/css" href="js/lib/material/material-wfont.css"/>
<link rel="stylesheet" type="text/css" href="js/lib/material/material.css"/>
<link rel="stylesheet" type="text/css" href="js/lib/material/ripples.css"/>
<link rel="stylesheet" type="text/css" href="css/app.css?v=<?php echo substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 1000);?>"/>
<script src="js/lib/jquery/jquery.min.js"></script>
<script	src="js/lib/jcrop/jcrop.js"></script>
<script	src="js/lib/scrollto/jquery.scrollto-min.js"></script>
<script src="js/lib/bootstrap/bootstrap.min.js"></script>
<script src="js/lib/material/material.min.js"></script>
<script src="js/core/tools.js"></script>
<style>
body {
background-color: #FFFFFF;
}
#shareBubble{
	margin: 70px 330px;	
}
</style>
</head>
<body>


<div id="modal-screen">
	<div  id="modal-box" >
	</div>
</div>
<div  id="shareBubble" >
</div>
</body>
<script>
	var app = {
		menu:{
			top:{
				bind:{
					
				}	
			}	
		},
		stubs:{},
		settings:{
			base64Prefix: 'data:image/png;base64, '
		},
		methods:{
			modal:{
				
				init: function() {
					
					var that = this;
					
					$('#modal-screen').click( function() {
						
						that.off();
						
					}).on('mousedown',	function(event)	{
						event.stopPropagation();
					});
													
					$('#modal-box').click( function() {
						return false;
					});	
					
					$('#modal-box').dblclick( function(event) {
						event.stopPropagation();
						event.preventDefault(); 
					});			
											
					$('#modal-box').on( 'click', '.close-button', function() {
						that.off();
					});
									
				},
				
				on: function() {	
					
					$('#modal-screen').show();
					$('#main, #left-menu, #nav-top, #resize-larger, #resize-smaller').addClass('make-blur');

				},
				off: function() {
					
						$('#modal-box').empty();
						$('#modal-screen').hide();
						$('#main, #left-menu, #nav-top, #resize-larger, #resize-smaller').removeClass('make-blur');


				}
				
			}
		}
	};
</script>	
<script	src="js/core/share.js?v=<?php echo substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 1000);?>"></script>

<script>
$(function() {
	
	app.menu.top.bind.share.initB();
 
});
</script>

