<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Pictographr Addon</title>
				<link rel="stylesheet" type="text/css" href="../../js/lib/bootstrap/bootstrap.min.css"/>
				<link rel="stylesheet" type="text/css" href="../plugin.css"/>
				<link rel="stylesheet" type="text/css" href="plugin_extend.css"/>
				<script>
					window.pid   = '<?php echo $_REQUEST['pid']?>';
					window.secret_sncrypted   = '<?php echo hash("sha512", "thisisthesecret");   ?>';
				</script>
				<?php
				
				$version = 1;
				 
				/*
				
					window.userId   = '<?php echo $_REQUEST['i']?>';
					window.timestamp = '<?php echo $_REQUEST['ts']?>';
					window.token     = '<?php echo $_REQUEST['token']?>';				
				
				*/
				
				//	$secret = 'thisisthesecret';
				//	$user_id   = $_REQUEST['i'];
				//	$timestamp = $_REQUEST['ts'];
				//	$token     = $_REQUEST['token'];
				//	if (hash('sha512', $user_id . $timestamp . $secret) ==  $token){
				//	    echo "Successful login!";
				//	}
				//	echo hash('sha512', $user_id . $timestamp . $secret);
				
				?>
					
    </head>

    <body>
    	<iframe id="iframe_messaging_conduit"></iframe>
    </body>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<script src="../../js/lib/bootstrap/bootstrap.min.js"></script>
		<script src="../../js/lib/popconfirm/popconfirm_adapted.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.2/underscore-min.js"></script>
    <script src="https://d2l6uygi1pgnys.cloudfront.net/jsapi/2-0/hsp.js"></script>
    <script src="./asset/template.js"></script>
		<script src="../plugin.js?v=<?php echo $version; ?>"></script>
		<script src="plugin_extend.js?v=<?php echo $version; ?>&random=<?php echo rand(1, 9999999999999); ?>"></script>
</html>