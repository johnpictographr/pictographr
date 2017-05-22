<style>
img{
	width: 48px;
	height: 48px;	
}
</style>
<?php
$dir    = './';
$files = scandir($dir);
foreach( $files as $idx => $file){
	
	if( $file == "." || 
			$file == ".."  || 
			$file == "index.php" 
			) continue;
	
	?>
	
		<img src="<?php echo $file?>" /> 
	
	<?php 
	
}
?>