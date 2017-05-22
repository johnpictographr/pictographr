<style>
body{
	width: <?php echo $width; ?>px;
	height: <?php echo $height; ?>px;
}	
</style>
<div>
	<iframe src="https://pictographr.com/index.php/app/base?param=<?php echo $google_id; ?>@<?php echo $fileId; ?>@useRead@isPDF@<?php echo $width; ?>@<?php echo $height; ?>" frameborder="0"   style='height: 50px; width:50px; overflow:hidden;'  ></iframe>
</div>