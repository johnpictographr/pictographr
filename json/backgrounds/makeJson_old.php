<?php

$jsonFile = 'backgrounds.json';
file_put_contents($jsonFile, '');

$backgroundlist = array();

$dir    = 'imgs';
$files = scandir($dir);

foreach( $files as $idx => $file){
	
	if( $file == "." || 
			$file == ".." 
			) continue;
		
		
		echo "file: " . $file."<br />"; 
		$obj['collection'] = "backgrounds";
		$obj['json'] = array(
			"style" => array(
				"element" => array(
					"width" => "350px",
					"height" => "200px"
				),
				"background" => array(
					"width" => "100%",
					"height" => "100%",
					"opacity" => 1,
					"background-image" => "url('json/backgrounds/imgs/" . $file . "')",
					"background-repeat" => "repeat"
				)
			),
			"data" => array(
				"rotation" => "0",
				"src" => "json/backgrounds/imgs/" . $file
			) 
		);
		
		$backgroundlist[] = $obj;

	
}
		
echo '<pre>';print_r(  $backgroundlist );echo '</pre>';

$JSON = json_encode($backgroundlist);
file_put_contents($jsonFile, $JSON);	



/*
[{
    "collection": "backgrounds",
    "type": "x",
    "category": "x",
    "json": {
      "style": {
    		"element": {
    			"width": "350px",
    			"height": "200px"
    		},
        "background": {
          "width": "100%",
          "height": "100%",
          "opacity": 1,
          "background-image": "url('json/backgrounds/imgs/concrete_seamless.png')",
          "background-repeat": "background-repeat"        
        }
      },
      "data":{
      	"rotation": 0,
				"src": "json/backgrounds/imgs/concrete_seamless.png"
      }
    }
}
]

*/