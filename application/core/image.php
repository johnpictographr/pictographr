<?php

class Image{
	
	protected $dir_path;
	protected $image_file;
	protected $full_path;
	protected $info;
	protected $width;
	protected $height;
	protected $mimetype;
		
	public function __construct( $source ){
		$this->dir_path = dirname($source);
		$this->image_file = basename($source);
		$this->full_path = $source;
		$this->info = getimagesize($this->full_path);
		$this->width = $this->info[0];  
		$this->height = $this->info[1];  
		$this->mimetype = $this->info['mime'];
	}
	
	public static function download($url) {
		$buffer = file_get_contents($url);
		$temp_file = tempnam(sys_get_temp_dir(), 'rp.image.');
		file_put_contents($temp_file, $buffer);
		return new Image($temp_file);
	}

	public function get_dir(){
		return $this->dir_path;
	}
	
	public function get_basename(){
		return $this->image_file;
	}

	public function get_width(){
		return $this->width;
	}

	public function get_height(){
		return $this->height;
	}
	
	public function copy($dest) {
		copy($this->full_path, $dest);
		return new Image($dest);
	}	
	
	public function crop($width, $height, $x_axis, $y_axis) {
		self::_do_gd_op('crop', array(
			'source_image' => $this->full_path,
			'new_image' => $this->full_path,
			'thumb_marker' => '',
			'maintain_ratio' =>  FALSE,
			'width' => $width,
			'height' => $height,
			'x_axis' => $x_axis,
			'y_axis' => $y_axis,
		));
	}

	public function resize($width, $height ){
		self::_do_gd_op('resize', array(
			'source_image' => $this->full_path,
			'create_thumb' => FALSE,
			'maintain_ratio' =>  TRUE,
			'width' => $width,
			'height' => $height,
		));
	}
	
	public function resize_with_height($height ){
		self::_do_gd_op('resize', array(
			'source_image' => $this->full_path,
			'create_thumb' => FALSE,
			'maintain_ratio' =>  TRUE,
			'height' => $height,
		));
	}
	
	protected static function _do_gd_op($op, $config) {
		$config['image_library'] = 'gd2';
		$ci = get_instance();
		$ci->load->library('image_lib');
		
		$ci->image_lib->initialize($config);
		switch ($op) {
			case 'resize':
				$ci->image_lib->resize();
				break;
			case 'crop':
				$ci->image_lib->crop();
				break;
		}
		$ci->image_lib->clear();
	}
}