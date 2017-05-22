<!DOCTYPE	html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="../js/lib/bootstrap/bootstrap3.0.2.css"/>
	<style>
		#main{
			margin-top: 20px;	
		}
		#table-title{
			text-transform: capitalize;	
		}
		.disable{
			opacity: .2;
			pointer-events: none;	
		}
	</style>
</head>	
<body>
<div  id="main" class="container">
    <div class="row col-md-12">
    	<h1  id="table-title" ><?php echo $table; ?><?php

    	if( isset($parent_name)) echo " in " . "<a href='../" . $parent_table. "s/crud" . ( isset($grandparent_id) ? "?parent_id=" . $grandparent_id: "" ) . "'> " . $parent_name . "</a> " . $parent_table;
    		
    	?></h1>
    </div>
</div>
<div class="container">
    <div class="row col-md-12">
    <a  id="add-button" href="#" class="btn btn-primary">Add</a>
    
    <?php 
    if( isset( $child_table )){?>
	     <a  id="json-button" href="#" class="btn btn-success">JSON</a>
    <?php 	
    };
    ?>
    
    <table class="table table-striped custab">
	    <thead  id="table-head" >
	    </thead>
	    <tbody  id="table-body" >
	  	</tbody>	
    </table>
    </div>
</div>
<div class="modal fade" id="theModal" tabindex="-1" role="dialog" aria-labelledby="theModalLabel">
  <div class="modal-dialog" role="document">
    <div id="modal-wrapper" class="modal-content">
    </div>
  </div>
</div>
</body>
</html>

<script	src="../js/lib/jquery/jquery.2.0.0.min.js"></script>
<script	type="text/javascript" language="Javascript" src="../js/lib/bootstrap/bootstrap3.3.4.min.js"></script>
<script	type="text/javascript" language="Javascript" src="../js/core/tools.js?v=<?php echo $version; ?>"></script>
<script>
	var table = '<?php echo $table; ?>';
	var parent_id = tools.urlGet('parent_id');
	var parent_table = <?php echo ( isset($parent_table) ?'"' . $parent_table . '"' : 'undefined' ); ?>; 
	var child_table = <?php echo ( isset($child_table) ?'"' . $child_table . '"' : 'undefined' ); ?>; 
</script>
<script	type="text/javascript" language="Javascript" src="../js/core/crud.js?v=<?php echo $version; ?>"></script>
