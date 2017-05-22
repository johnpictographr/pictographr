	<head>
		<link rel="stylesheet" type="text/css" href="../js/lib/bootstrap/bootstrap.min.css"/>
		<link rel="stylesheet" type="text/css" href="../js/lib/material/material.css"/>
	  <link rel="stylesheet" href="../js/lib/fontawesome/font-awesome.min.css">
		<link rel="stylesheet" type="text/css" href="https://netdna.bootstrapcdn.com/font-awesome/3.0.2/css/font-awesome.css"/>
		<script src="../js/lib/jquery/jquery.min.js"></script>
		<script src="../js/lib/bootstrap/bootstrap.min.js"></script>
		<script src="../js/lib/material/ripples.min.js"></script>
		<script src="../js/lib/material/material.min.js"></script>
	</head>
	<body>
		<div  class="container">

		</div>		
	</body>		
	<script	src="../js/core/tools.js"></script>
	<script>
	
	(function(){
		
			var postObj = {
						'results': 10,
						'seed': 'foobar'
					};
					
			console.log(JSON.stringify(  postObj   , null, 2 ));
			
			tools.ajax('https://randomuser.me/api/', postObj, 'json', function(obj) {
				
				console.log(JSON.stringify(  obj   , null, 2 ));
				
			});
		    
	})();
	
	</script>