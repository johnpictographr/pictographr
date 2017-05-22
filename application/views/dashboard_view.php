<!DOCTYPE	html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="../js/lib/bootstrap/bootstrap3.0.2.css"/>
	<style>
			#main img{
				width: 200px;
				margin-right: 20px;
				cursor:pointer;	
			}
	</style>
</head>	
<body>

<div  id="main" class="container">
</div>
<div class="modal fade" id="theModal" tabindex="-1" role="dialog" aria-labelledby="theModalLabel">
  <div class="modal-dialog" role="document">
    <div id="modal-wrapper" class="modal-content">
    </div>
  </div>
</div>
</body>
</html>
<script>
	var version = '<?php echo $version; ?>';
</script>
<script	src="../js/lib/jquery/jquery.2.0.0.min.js"></script>
<script	type="text/javascript" language="Javascript" src="../js/lib/bootstrap/bootstrap3.3.4.min.js"></script>
<script	type="text/javascript" language="Javascript" src="../js/core/tools.js?v=<?php echo $version; ?>"></script>
<script	type="text/javascript" language="Javascript" src="../js/core/dashboard.js?v=<?php echo $version; ?>"></script>

