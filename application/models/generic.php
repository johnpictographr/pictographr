<?php

abstract class Models_Generic {
	
	protected $_errors;
	
	public function __construct($input = array()) {
		
		$this->reset_errors();
		$this->values($input);
	}
	
	public function values($input) {
		
		
		foreach ($input as $k => $v) {

			$this->{$k} = $v;
			
		}

		return $this;
	}
	
	public function validate() { return count($this->_errors) == 0; }
	
	public function save() {}
	
	public function errors(){
		return $this->_errors;
	}
	
	public function reset_errors() {
		$this->_errors = array();
	}
	
	public function has_errors() {
		return count($this->_errors) == 0;
	}
	
	public function errorsAsJson() {
		return json_encode($this->_errors);
	}
	
	public function error($msg) {
		$this->_errors[] = $msg;
	}
}