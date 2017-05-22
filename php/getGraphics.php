<?php 

function object_to_array($data){
  if(is_array($data) || is_object($data)){
    $result = array(); 
    foreach($data as $key => $value)
    { 
      $result[$key] = object_to_array($value); 
    }
    return $result;
  }
  return $data;
}

$allArrJson = file_get_contents("http://core-project-files.s3-website-us-east-1.amazonaws.com/graphics/graphics.js");
$allArr = object_to_array(json_decode($allArrJson));

foreach( $allArr as $idx => $record){

	if(
	
		$record['type'] != 'clipart' &&
		$record['type'] != 'images' &&
		$record['type'] != 'videos' &&
		$record['category'] != 'backgrounds' &&
		$record['category'] != 'backgrounds' 
	){
		$texts[] = array(
								'type' => 	$record['type'],
								'category' => 	$record['category'],
								'html' => 	$record['html'],
								'textedit_content' => 	$record['textedit_content'],
								'textedit_style' => 	$record['textedit_style'],
								'name' => 	(isset($record['name']) ? $record['name']:''),
								'json' => 	(isset($record['json']) ? $record['json']:'')
							);
	}
	
};

echo '<pre>';print_r(  $texts  );echo '</pre>'; 

file_put_contents("misc.json", json_encode($texts));
