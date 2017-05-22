<!DOCTYPE	html>
<html   style='overflow: hidden; ' >
<head>

		<meta	name="viewport"	content="width=device-width, initial-scale=1,	maximum-scale=1, minimum-scale=1,	user-scalable=0" />
<?php 	if(isset($drive)  || $_SERVER['HTTP_HOST'] == "localhost"){ ?>	

		<meta property="fb:app_id" content="1503228929961401" />
		<meta property="og:type"   content="website" />
		<meta property="og:url"    content="<?php echo ( isset($share_url) ? $share_url:'' ); ?>" />
		<meta property="og:image:width" content="1200"/>
		<meta property="og:image:height" content="630"/>
		<meta property="og:image"  content="https://pictographr.com/image/streamDriveImage?google_id=<?php echo $google_id; ?>&fileId=<?php echo ( isset($facebook_image_fileId) ? $facebook_image_fileId:'' ); ?>" />
		<meta property="og:title"  content="<?php echo ( isset($title) ? $title:'' ); ?>" />
		<meta property="og:site_name" content="Designed in Pictographr"/>
		<meta property="og:description" content="<?php echo ( isset($description) ? $description:'' ); ?>" />
		

		<meta name="twitter:card" content="summary_large_image">
		<meta name="twitter:site" content="@pictographr">
		<meta name="twitter:creator" content="@jm02jm67">
		<meta name="twitter:title" content="<?php echo ( isset($title) ? $title:'' ); ?>">
		<meta name="twitter:description" content="<?php echo ( isset($description) ? $description:'' ); ?>">
		<meta name="twitter:image" content="https://pictographr.com/image/streamDriveImage?google_id=<?php echo $google_id; ?>&fileId=<?php echo ( isset($facebook_image_fileId) ? $facebook_image_fileId:'' ); ?>">
		<meta name="twitter:url" content="<?php echo ( isset($share_url) ? $share_url:'' ) ?>">
		<meta name="twitter:width" value="1000">
		<meta name="twitter:height" value="1000">


		<link rel="stylesheet" type="text/css" href="../../js/lib/bootstrap/bootstrap.min.css"/>
		<link rel="stylesheet" type="text/css" href="../../js/lib/material/material-wfont.css"/>
		<link rel="stylesheet" type="text/css" href="../../js/lib/material/material.css"/>
		<link rel="stylesheet" type="text/css" href="../../js/lib/material/ripples.css"/>

		
<?php 	}  ?>

		
		<script src="../../js/lib/jquery/jquery.min.js"></script>
		<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto" media="all">
	  <link rel="stylesheet" href="../../css/dynolines.css?v=<?php echo $version; ?>">
	  <link rel="stylesheet" href="../../css/clipart.css?v=<?php echo $version; ?>">
	  <link rel="stylesheet" href="../../css/app.css?v=<?php echo $version; ?>">


</head>

<body   style='overflow: hidden;'  >
</body>

</html>

<script	type="text/javascript" language="Javascript" src="../../js/lib/underscore/underscore-min.js"></script>
<script	type="text/javascript" language="Javascript" src="../../js/lib/backbone/backbone-min.js"></script>
<script	src="../../js/lib/fontdetect/fontdetect.js"></script>


<?php 	if(isset($drive) || $_SERVER['HTTP_HOST'] == "localhost"){ ?>
	
	<script type="text/javascript" src="https://www.google.com/jsapi"></script>
	<script type="text/javascript">
	  google.load('visualization', '1', {packages: ['corechart', 'line','timeline']});
	</script>
	<script	src="../../js/lib/lining/lining.min.js"></script>
	<script src="../../js/lib/bootstrap/bootstrap.min.js"></script>
	<script src="../../js/lib/material/ripples.min.js"></script>
	<script src="../../js/lib/material/material.min.js"></script>
<?php 	}  ?>


<script>
	var base_url = '<?php echo ( base_url() == "foreign_domain/" ? "https://pictographr.com/": base_url()); ?>',
			serverhost = '<?php echo $_SERVER['HTTP_HOST']; ?>',
			fileId = '<?php echo $fileId; ?>',
			google_id = '<?php echo $google_id; ?>',
			drive = <?php echo ( isset($drive) ? $drive: 'undefined' ); ?>,
			isPDF = <?php echo ( isset($isPDF) ? $isPDF: 'undefined' ); ?>,
			useWhat = <?php echo ( isset($useWhat) ?  "'". $useWhat . "'" : 'undefined'); ?>;
	
	var isRead = true;
	
<?php 	if(isset($drive)){ ?>	
			
			var shortUrl = <?php echo (  isset($shortUrl) && $shortUrl != '' ? "'" . $shortUrl  . "'": 'undefined' ); ?>;
			var file_image_fileId = <?php echo (  isset($file_image_fileId) && $file_image_fileId != '' ? "'" . $file_image_fileId  . "'": 'undefined' ); ?>;
			var share_lite_fileId = <?php echo (  isset($share_lite_fileId) && $share_lite_fileId != '' ? "'" . $share_lite_fileId  . "'": 'undefined' ); ?>;
			var share_tiny_fileId = <?php echo (  isset($share_tiny_fileId) && $share_tiny_fileId != '' ? "'" . $share_tiny_fileId  . "'": 'undefined' ); ?>;
			var PDFId = <?php echo (  isset($PDFId) && $PDFId != '' ? "'" . $PDFId  . "'": 'undefined' ); ?>;
			var description = ""; //"<?php echo ( isset($description) ? $description:'' ); ?>";
			var title = "<?php echo ( isset($title) ? $title:'' ); ?>";
			var domain_id = <?php echo ( isset($domain_id) ? $domain_id:'' ); ?>;
			var lead_id = <?php echo (  isset($lead_id) && $lead_id != '' ? "'" . $lead_id  . "'": 'undefined' ); ?>;
			var way = <?php echo (  isset($way) && $way != '' ? "'" . $way  . "'": 'undefined' ); ?>;
			
<?php 	}  ?>


</script>
<script	src="../../js/core/tools.js?v=<?php echo $version; ?>"></script>
<script	src="../../js/core/core.js?v=<?php echo $version; ?>"></script>
<script	src="../../js/core/read.js?v=<?php echo $version; ?>"></script>
<script	src="../../js/core/common.js?v=<?php echo $version; ?>"></script>
<script	src="../../js/core/debug.js?v=<?php echo $version; ?>"></script>
<script>
	app.init();
</script>


<!--  
	<html   style='overflow: hidden;' >
	::-webkit-scrollbar { // http://stackoverflow.com/questions/3296644/hiding-the-scrollbar-on-an-html-page
	    display: none; 
	}
	<body   style='overflow: hidden;'  >
-->