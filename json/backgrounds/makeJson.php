<?php

require("../tools.php");

class Make extends Tools{
	
	function __construct() {
		
		$this->collection = "backgrounds";
		$this->web_root = "http://localhost/pictographr/";
		$this->original_folder = "imgs";
		$this->collection_path = $this->web_root . "/json/" . $this->collection . "/" . $this->original_folder . "/";
		$this->jsonFile = $this->collection . ".json";
		$this->new_width = 800;	
		ini_set("memory_limit", "256M");
		
	}
	
	function init(){
		
		$files = scandir($this->original_folder);
		
		foreach( $files as $idx => $file){
			
			if( $file == "." || 
					$file == ".." 
					) continue;
					
				$this->originalpath = $this->collection_path . $file;
				
				$listArray[] = $this->__getItemObj($file);
			
		}
				
		echo "<pre>";print_r(  $listArray );echo "</pre>";
		
		$JSON = json_encode( $listArray );
		file_put_contents($this->jsonFile, $JSON);	
	
	}
	
	private function __getItemObj($file){
				
		$dim = $this->getImgDim( $this->originalpath );

		$obj["collection"] = $this->collection;
		$obj["json"] = array(
			"style" => array(
				"element" => array(
					"width" => $dim["width"] . "px",
					"height" => $dim["height"] . "px"
				),
				"background" => array(
					"width" => "100%",
					"height" => "100%",
					"opacity" => 1,
					"background-image" => "url('json/" . $this->collection . "/" . $this->original_folder . "/" . $file . "')",
					"background-repeat" => "repeat"
				)
			),
			"data" => array(
				"rotation" => "0",
				"src" => "json/" . $this->collection . "/" . $this->original_folder . "/" . $file,
				"width" => $dim["width"],
				"height" => $dim["height"]
			) 
		);
		
		return $obj;
			
	}	


};

$make = new Make();
$make->init();


