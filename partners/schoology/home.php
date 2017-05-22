<?php
 
	ini_set('display_errors', 1);
	session_start();
	
	if ( !isset(  $_GET['skipPluginPhp'] )  ){  // will skip if redirected from upload screen
		
		require_once(__dir__.'/plugin.php');
		$plugin = new Plugin();		
		
	}


	function generateRandomString($length = 10) {
			    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
			    $randomString = '';
			    for ($i = 0; $i < $length; $i++) {
			        $randomString .= $characters[rand(0, strlen($characters) - 1)];
			    }
			    return $randomString;
	}
	
	$version = generateRandomString(100);
	$version = 123;

?>
		
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Pictographr Addon Schoology</title>
				<link rel="stylesheet" type="text/css" href="../../js/lib/bootstrap/bootstrap.min.css"/>
				<link rel="stylesheet" type="text/css" href="../plugin.css"/>
				<link rel="stylesheet" type="text/css" href="plugin_extend.css?v=<?php echo $version; ?>"/>
				<script>
					window.xorg_id = "<?php echo $_SESSION['schoology']['school_nid']; ?>";	
					window.xuser_id = "<?php echo $_SESSION['schoology']['uid']; ?>";	
					window.organization_name = "<?php echo $_SESSION['schoology']['school_title']; ?>";	
					window.isOrgAdmin = "<?php echo ( $_SESSION['schoology']['is_admin'] == 1 ? 'true': 'false' ) ?>";	
				</script>
    </head>
			
    <body>
    <div  id="main_container_wrapper" >
    </div>
		<div id="modal-screen">
			<div  id="modal-box" >
			</div>
		</div>
    <iframe id="iframe_messaging_conduit"></iframe>
    </body>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<script src="../../js/lib/bootstrap/bootstrap.min.js"></script>
		<script src="../../js/lib/popconfirm/popconfirm_adapted_delete.js"></script>
		<script src="../popchoice.js?v=<?php echo $version; ?>"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.2/underscore-min.js"></script>
		<script src="../plugin.js?v=<?php echo $version; ?>"></script>
		<script src="plugin_extend.js?v=<?php echo $version; ?>"></script>		
</html>
	