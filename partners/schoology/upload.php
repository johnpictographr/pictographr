<?php 
	
ini_set('display_errors', 1);
session_start();
require_once(__dir__.'/plugin.php');

class Upload extends Plugin{
	
  public function __construct() {
  	
  	$filepath = '/var/www/pictographr/temp/' . $_GET['filename'];
  	
  	$this->__setup();
  	
  	$this->__configSchoology();
  	
		$import_id =  $this->schoology->importFile( $filepath );
		
		$return_url = 'https://pictographr.com/partners/schoology/home.php?skipPluginPhp=true';
		 
		$import_url = $this->schoology->buildImportUrl($import_id, $return_url);
		
		if( file_exists( $filepath )){ unlink( $filepath ); }
		
		header('Location: ' . $import_url);
		
	}
}

$upload = new Upload();