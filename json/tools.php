<?php 

class Tools{

	protected $binaryString;

	function __construct() {
		ini_set("memory_limit", "256M");
	}
	
	public function curlIntoBinaryString($url) {
		$ch = curl_init ($url);
	  curl_setopt($ch, CURLOPT_HEADER, 0);
	  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	  curl_setopt($ch, CURLOPT_BINARYTRANSFER,1);
	  $binaryString = curl_exec($ch);
	  curl_close ($ch);
		return $binaryString;
	}
	
	public function convertToPng($rawImg){
		ob_start();  // http://stackoverflow.com/questions/1206884/php-gd-how-to-get-imagedata-as-binary-string
		imagepng($rawImg);
		$rawString = ob_get_contents(); 
		ob_end_clean();
		return $rawString;
	}
	
		
		protected function __createSmallerVersion(){
			
				$dim = $this->getImgDim($this->originalpath);
				
				$orig_width = $dim['width'];
				
				if( $orig_width > $this->new_width){
					$imageBinaryString = $this->convertToPng($this->resizeImg($this->originalpath, $this->new_width) );
				}else{
					$imageBinaryString = file_get_contents($this->originalpath);
				};
				
				
				file_put_contents($this->targetpath, $imageBinaryString);	
					
		}
	
	public function resizeImg($path, $new_width){

		$imageBinaryString = file_get_contents($path);

		$image = imagecreatefromstring($imageBinaryString);
		
		$x = getimagesizefromstring($imageBinaryString);
		$width  = $x['0'];
		$height = $x['1'];
		
		$percent = $new_width/$width;

		$new_height  = $height * $percent;
		
		$new_image = imagecreatetruecolor($new_width, $new_height);
		
//imagecolortransparent($new_image, imagecolorallocatealpha($new_image, 0, 0, 0, 127));
// F3F7F8 F6F7F9

		$white = imagecolorallocate($image, 255,255,255);
		imagecolortransparent($new_image, $white);


		imagealphablending($new_image, false);
		
		imagesavealpha($new_image, true);
		
		imageCopyResampled($new_image, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);


		imagedestroy($image);

		return $new_image;
		
	}

	public function stripHTTPS($url){

		$urlArr = explode('://', $url);
		
		if($urlArr[0] == 'https'){
			$url =  'http://' . $urlArr[1];
		}
		
		return $url;
	}
	
	public function blackWhite($imageBinaryString){

		$image = imagecreatefromstring($imageBinaryString);
		
		imagefilter($image, IMG_FILTER_GRAYSCALE);
		imagefilter($image, IMG_FILTER_CONTRAST, -1000);
		
		return $image;
			
	}
	
	public function convertToBase64($path){
		
		$im = file_get_contents($path);
		
		$x = getimagesizefromstring($im);
		$width  = $x['0'];
		$height = $x['1'];
		
		return array(
			'base64Data' => base64_encode($im),
			'width' => $width,
			'height' => $height
		);
		
	}
	
	public function getImgDim($path){
		
		$im = file_get_contents($path);
		
		$x = getimagesizefromstring($im);
		$width  = $x['0'];
		$height = $x['1'];
		
		return array(
			'width' => $width,
			'height' => $height
		);
		
	}
	
	
	public function convertWhiteToTransparent( $im ){ //http://stackoverflow.com/questions/16660729/php-change-background-color-to-transparent
		
//		$image = imagecreatetruecolor(105, 75);
//		$im     = imagecreatefrompng("https://chart.googleapis.com/chart?cht=lxy&chd=e:AACIERGZIiKqMzO7RETMVVXdZmbud3f.iIkQmZohqqsyu7xDzM1U3d5l7u92,hhiIivfFmZZmcCY.YYZmTgdQjWd3kk6g880asfu7r4sf4E22tGtGsfzzmZj9&chds=0.0,1.0&chs=105x75&chma=1,0,1,1&chco=42b6c9ff&chls=2.5,1.0,0.0&chxl=0:%7C%7C1:%7C%7C2:%7C");
//		$img = imagecreatetruecolor(105,75);
		
// 		$black = imagecolorallocate($im, 250, 250, 250);
//		$bg_color = imagecolorat($im,1,1);

		$white = imagecolorallocate($image, 255, 255, 255);
		imagecolortransparent($im, $white);
		imagepng($im);
		imagedestroy($im);
		
	}
	
}

$tools = new Tools();
