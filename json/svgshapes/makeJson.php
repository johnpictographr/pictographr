<?php

require("../tools.php");

class Make extends Tools{
	
	function __construct() {
		
		$this->collection = "svgshapes";
		$this->web_root = "http://localhost/pictographr/";
		$this->original_folder = "svgs";
		$this->collection_path = $this->web_root . "/json/" . $this->collection . "/" . $this->original_folder . "/";
		//$this->jsonFile = $this->collection . ".json";
		//$this->new_width = 800;	
		$this->svgmap = [];
		ini_set("memory_limit", "256M");
		
	}
	
	function init(){
		
		$files = scandir($this->original_folder);
		
		foreach( $files as $idx => $file){
			
			if( $file == "." || 
					$file == ".." 
					) continue;
					
			$directories[] = $file;
			
		}		
		
		foreach( $directories as $idx => $directory){
			
			$files = scandir($this->original_folder . '/' . $directory);
			
			$listArray = [];
			
			foreach( $files as $idx => $file){
				
				if( $file == "." || 
						$file == ".." 
						) continue;
						
					$this->originalpath = $this->collection_path . '/' . $directory . '/' . $file;
					
					$listArray[] = $this->__getItemObj($file, $directory);
				
			}
			
			$this->jsonFile = $this->collection . "_" . $directory . ".json";
							
			$JSON = json_encode( $listArray );
			file_put_contents($this->jsonFile, $JSON);	
							
		}
		
		
		$svgmapJson = json_encode( $this->svgmap );
		file_put_contents("svgmap.json", $svgmapJson);
	
	}
	
	private function __getItemObj($file, $directory){
				
		$dim = $this->getImgDim( $this->originalpath );
		$src = "json/" . $this->collection . "/" . $this->original_folder . "/" . $directory. "/" . $file;
		
		
		if( isset( $this->svgmap[$file] ) ) echo "Duplicate:" . $file . " in directory: " . $directory;
		$this->svgmap[$file] = $src;
		
		$obj["collection"] = $this->collection . "_" . $directory;
		$obj["json"] = array(
			"style" => array(
				"element" => array(
					"width" => "300px",
					"height" => "300px"
				),
				"svg" => array(
					"width" => "100%",
					"height" => "100%",
					"opacity" => 1,
				)
			),
			"data" => array(
				"rotation" => "0",
				"src" => $src,
				"file" => $file,
				"width" => 300,
				"height" => 300,
				"aspectratio" => "1"
			) 
		);
		
		if( $file == 'explorer.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#00BCF2";	
		}
				
		if( $file == 'opera.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#FF0000";		
		}		
		
		if( $file == 'reddit.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#FF4500";
		}				
		
		if( $file == 'firefox.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#E85D0C";		
		}
		
		if( $file == 'github.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#0D2636";		
		}
						
		if( $file == 'pinterest.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#CC2127";		
		}		
		
		if( $file == 'slideshare.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#42C0FB";		
		}				
		
		if( $file == 'twitter.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#1DA1F2";		
		}
				
		if( $file == 'linkedin.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#0077B5";		
		}
		
		if( $file == 'facebook.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#3B5998";		
		}	
			
		if( $directory == 'nature' || $directory == 'social' || $directory == 'symbol' || $directory == 'music' || $directory == 'business') {
			$obj["json"]["style"]["svg"]["stroke-width"] = "0px";
		}

		if( $directory == 'speech' ) {
			$obj["json"]["style"]["svg"]["fill"] = "#FFFFFF";		
			$obj["json"]["style"]["svg"]["stroke-width"] = "1.5px";
		}

		/*     -------------------------------      */

		
		if( $file == 'snapchat.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#FFFFFF";		
			$obj["json"]["style"]["svg"]["stroke-width"] = "2px";
		}
		
		if( $file == '_fullstar.svg' || $file == '_halfstar.svg' || $file == '_emptystar.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#FFD663";		
			$obj["json"]["style"]["svg"]["stroke-width"] = "0px";
		}
				
		if( $file == 'speech20.svg') {
			$obj["json"]["style"]["svg"]["fill"] = "#000000";		
			$obj["json"]["style"]["svg"]["stroke-width"] = "0px";
		}		
		
		
		return $obj;
			
	}	
	

};

$make = new Make();
$make->init();


