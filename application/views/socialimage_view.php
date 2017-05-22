<!DOCTYPE	html>
<html>
<head>
		<link href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css" rel="stylesheet">
		<meta	name="viewport"	content="width=device-width, initial-scale=1,	maximum-scale=1, minimum-scale=1,	user-scalable=0" />
		<meta property="og:type"   content="website" />
		<meta property="og:url"    content="https://pictographr.com/image/socialImage/<?php echo $this->google_id; ?>/<?php echo $this->fileId; ?>" />
		<meta property="og:image:width" content="1200"/>
		<meta property="og:image:height" content="630"/>
		<meta property="og:image"  content="https://pictographr.com/image/streamDriveImage?google_id=<?php echo $this->google_id; ?>&fileId=<?php echo $this->fileId; ?>" />
		<meta property="og:title"  content="Pictographr Share" />
		<meta property="og:site_name" content="Designed in Pictographr"/>
		<meta property="og:description" content="" />

		<meta name="twitter:card" content="summary_large_image">
		<meta name="twitter:site" content="@pictographr">
		<meta name="twitter:creator" content="@jm02jm67">
		<meta name="twitter:title" content="Pictographr Share">
		<meta name="twitter:description" content="Pictographr Share">
		<meta name="twitter:image" content="https://pictographr.com/image/streamDriveImage?google_id=<?php echo $this->google_id; ?>&fileId=<?php echo $this->fileId; ?>">
		<meta name="twitter:url" content="https://pictographr.com/image/socialImage/<?php echo $this->google_id; ?>/<?php echo $this->fileId; ?>">
		<meta name="twitter:width" value="1000">
		<meta name="twitter:height" value="1000">

		<script	src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
		<script	src="/js/core/tools.js"></script>

</head>

<style>
	#poweredby-container{
		background: #3AA9FB;
		position: fixed;
		top: 0px;
		left: 0px;
		right: 0px;
		height: 50px;
	}
		#logo-column{
			position: absolute;
			width: 239px;
			height: 100%;
			top: 0px;
			right: 0px;
			margin-right: 50px;
		}
			#logo-wrapper {
				position: relative;
				float: right;
			}
			
				#logo-wrapper span{
					position: relative;
					color: white;
					font-style: italic;
				}			
			
				#logo-wrapper img{
					position: relative;
					top: 9px;
					width: 123px;
				}						
	#asset-wrapper{
		margin: 100px auto 0;
	}
				#asset-wrapper img{
					margin-bottom: 50px;
				}						
</style>

<body>
	<div  id="poweredby-container" >
		<div  id="logo-column" >
			<a href="https://pictographr.com?track_id=3" target="_blank">
				<div  id="logo-wrapper" >
					<span>Designed Using&nbsp;&nbsp;</span>
					<img src="https://pictographr.com/img/simpleLogoPictographr2.png"/>
				</div>
			</a>

		</div>
	</div>
	<div  id="asset-wrapper" >
		<img  id="asset_img" src="" />
	</div>
</body>
<script>
	
	var buffer = 100,
			src = 'https://pictographr.com/image/streamDriveImage?google_id=<?php echo $this->google_id; ?>&fileId=<?php echo $this->fileId; ?>&max_width=' + tools.getScreenDim().width; 

	$('#asset-wrapper')
		.width(tools.getScreenDim().width - buffer)
		.height(tools.getScreenDim().height - buffer);

	$('#asset_img').attr('src', src).width(tools.getScreenDim().width - buffer);
	
	var	that = this;
	$(window).on(	'resize',
		function() {
			$('#asset-wrapper')
				.width(tools.getScreenDim().width - buffer)
				.height(tools.getScreenDim().height - buffer);
		
			var src = 'https://pictographr.com/image/streamDriveImage?google_id=<?php echo $this->google_id; ?>&fileId=<?php echo $this->fileId; ?>&max_width=' + tools.getScreenDim().width; 
		
			$('#asset_img').width(tools.getScreenDim().width - buffer);
		}
	);

</script>
</html> 