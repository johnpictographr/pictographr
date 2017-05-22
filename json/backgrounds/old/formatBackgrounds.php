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

$allArrJson = file_get_contents("backgroundsRaw.json");
$allArr = object_to_array(json_decode($allArrJson));

foreach( $allArr as $url => $tags){
	$obj = array(
		"src" => $url
	);
	$tagSet = [];
	foreach( $tags as $key => $tag){
		
		foreach( $tag as $name => $value){
			$tagSet[] = $name;
		}
		
		$obj['tags'] = $tagSet;
	}
	
	$svtleUrls[] = $obj;
	
}

// echo '<pre>';print_r(  $svtleUrls );echo '</pre>';  exit;
//echo json_encode($svtleUrls);
file_put_contents("backgrounds.json", json_encode($svtleUrls));
