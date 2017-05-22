<?php
$dir    = './';
$files = scandir($dir);
foreach( $files as $idx => $file){
	?>
	
		<img src="<?php echo $file?>" /> 
	
	<?php 
	
}
?>