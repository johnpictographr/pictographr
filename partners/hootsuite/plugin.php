<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Pictographr Addon Hootsuite</title>
				<link rel="stylesheet" type="text/css" href="../../js/lib/bootstrap/bootstrap.min.css"/>
				<link type="text/css" href="../../js/lib/owl.carousel/owl.carousel.css" rel="stylesheet" media="screen" />
				<link type="text/css" href="../../js/lib/owl.carousel/owl.theme.css" rel="stylesheet" media="screen" />
				<link rel="stylesheet" type="text/css" href="../../css/chappi/style-blue.css"/>
				<link rel="stylesheet" type="text/css" href="ad_default.css"/>
				<link rel="stylesheet" type="text/css" href="../plugin.css"/>
				<link rel="stylesheet" type="text/css" href="plugin.css"/>
				<link rel="stylesheet" type="text/css" href="plugin_extend.css"/>
				<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"/>

				<?php
				
				/*
				
				
				<script>
					window.pid   = '<?php echo $_REQUEST['pid']?>';
					window.secret_sncrypted   = '<?php echo hash("sha512", "thisisthesecret");   ?>';
				</script>
				
				
				*/
				
				$version = 2;

				?>
					
    </head>

    <body>
    <div  id="main_container_wrapper" >
    </div>
    <iframe id="iframe_messaging_conduit"></iframe>
    <iframe id="iframe_logout"></iframe>
    </body>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<script src="../../js/lib/owl.carousel/owl.carousel.js"></script>
		<script src="../../js/lib/bootstrap/bootstrap.min.js"></script>
		<script src="../../js/lib/popconfirm/popconfirm_adapted_delete.js"></script>
		<script src="../../js/lib/endlessscroll/endlessscroll.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.2/underscore-min.js"></script>
    <script src="https://d2l6uygi1pgnys.cloudfront.net/jsapi/2-0/hsp.js"></script>
    <script src="./asset/template.js"></script>
		<script src="../plugin.js?v=<?php echo $version; ?>"></script>
		<script src="plugin_extend.js?v=<?php echo $version; ?>&random=<?php echo rand(1, 9999999999999); ?>"></script>
		
</html>

    