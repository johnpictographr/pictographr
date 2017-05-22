<?php

abstract class Models_Form extends Models_Generic {
	
	public static function factory($type, $data = array()) {

		$class = 'Models_Form_' . $type;
		return new $class($data);
	}
}