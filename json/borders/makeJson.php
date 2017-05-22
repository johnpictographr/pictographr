<?php

require("../tools.php");

class Make extends Tools{
	
	function __construct() {
		
		$this->collection = "borders";
		$this->web_root = "http://localhost/pictographr/";
		$this->original_folder = "originals";
		$this->target_folder = "imgs";
		$this->collection_path = "http://localhost/pictographr/json/" . $this->collection . "/" . $this->original_folder . "/";
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
				$this->targetpath = $this->target_folder . "/" . $file;
				
				$this->__createSmallerVersion();
				$listArray[] = $this->__getItemObj();
			
		}
				
		echo "<pre>";print_r(  $listArray );echo "</pre>";
		
		$JSON = json_encode( $listArray );
		file_put_contents($this->jsonFile, $JSON);	
	
	}
	
	private function __getItemObj(){
				
		$dim = $this->getImgDim( $this->originalpath );
		
		$obj["collection"] = $this->collection;
		$obj["json"] = array(
			"style" => array(
				"element" => array(
					"width" => $dim["width"] . "px",
					"height" => $dim["height"] . "px"
				),
			),
			"data" => array(
				"src" => "json/" . $this->collection . "/" .$this->targetpath,
				"width" => $dim["width"],
				"height" => $dim["height"]
			) 
		);
		
		return $obj;
			
	}

	

};

$make = new Make();
$make->init();


