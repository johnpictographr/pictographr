<?php

require_once '../base.php';

class Oauth extends Base{
	
	public function __construct() { 
		
		parent::__construct();
		if($_SERVER && array_key_exists('REQUEST_URI', $_SERVER)) {
		  $this->process_incoming_requests($_SERVER['REQUEST_URI'], $this->set_options());
		}
	}
			
	
}

new Oauth();