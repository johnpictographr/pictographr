<?php

function spriter($folder, $object) {
	
		$category = array();
	
		$dir = '../../img/fonts/categories/' . $folder . '/*.png';
		$target = '../../img/fonts/sprites/' . $folder . '.png';
		
		$icon_width = 400;
		$icon_height = 64;
		$new_width = 200;
		$new_height = 32;
		$height = count(glob($dir)) * $new_height;
		
		$img = imagecreatetruecolor($icon_width, $height);
		$background = imagecolorallocatealpha($img, 255, 255, 255, 127);
		imagefill($img, 0, 0, $background);
		imagealphablending($img, false);
		imagesavealpha($img, true);
		
		$pos = 0;
		
		$fonts = array();

		foreach (glob($dir) as $file) {
			
			$font = array();
			
			$tmp = imagecreatefrompng($file);
			
			$new_image = imagecreatetruecolor($new_width, $new_height);
			
			imagecolortransparent($new_image, imagecolorallocatealpha($new_image, 0, 0, 0, 127));
			
			imagealphablending($new_image, false);
			
			imagesavealpha($new_image, true);
			
			imageCopyResampled($new_image, $tmp, 0, 0, 0, 0, $new_width, $new_height, $icon_width, $icon_height);

			imagecopy($img, $new_image, 0, $pos, 0, 0, $new_width, $new_height);
			
			imagedestroy($new_image);
			
			imagedestroy($tmp);
			
			$filename = explode("/", $file)[6];
			
			$font['filename'] = $filename;
			
			$font['fontname'] = explode("-regular.png", $filename)[0];
			
			$font['label'] = $object[$font['fontname']]->label;
			
			$font['family'] = $object[$font['fontname']]->family;
			
			$font['pos'] = $pos;
			
			$pos += $new_height;
			
			$fonts[] = $font;
			
		}
		
		imagepng($img, $target);
		
		return  $fonts;
}

function object_to_array($data){
  if(is_array($data) || is_object($data)){
    $result = array(); 
    foreach($data as $key => $value) { 
      $result[$key] = object_to_array($value); 
    }
  	return $result;
	};
}
		 


$file = '../../uploads/output/fonts_naming.json'; 
$json = json_decode(file_get_contents($file));
$object = array();
foreach( $json  as  $fontname => $subgroup){
	$object[$fontname] = $subgroup;
}


$jsonFile = '../../uploads/output/fonts.json';
file_put_contents($jsonFile, '');

$fontlist = array();

$dir    = '../../img/fonts/categories';
$files = scandir($dir);

foreach( $files as $idx => $folder){
	
	if( $folder == "." || 
			$folder == ".."  || 
			$folder == "*.png" 
			) continue;
		
		if( count(explode(".png", $folder)) > 1) continue;
		
		echo "folder name: " . $folder."<br />"; 
		
		$fontlist[$folder] = spriter($folder, $object); 
		
		?>
	
	<?php 
	
}
		
echo '<pre>';print_r(  $fontlist );echo '</pre>';

$JSON = json_encode($fontlist);
file_put_contents($jsonFile, $JSON);	