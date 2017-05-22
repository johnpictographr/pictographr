<?php

class Models_Form_Graphics_Thumbs extends Models_Form {

	protected $filename;
	protected $upload_path;
	protected $smallsize_prefix;

	public function save() {
	
		$this->ci = get_instance();
		$this->filename = 'thumb.jpg';
		$this->upload_path = 'uploads';
		$this->smallsize_prefix	= 'smaller_';
		$this->delete( $this->filepath() );
		$this->delete( $this->thumb_path() );
		
		$this->ci->load->library('upload', array(
			'file_name' => $this->filename,
			'upload_path' => $this->upload_path,
			'allowed_types' => 'jpg|jpeg|png',
			'max_size' => '1000000',
			'max_width' => '2000',
			'max_height' => '2000',
		));
		
		if ( ! $this->ci->upload->do_upload('filename')) {
			echo  $this->ci->upload->display_errors();
		}

		$image = new Image($this->upload_path.'/'.$this->filename);
		$target = $this->thumb_path();
		$copy = $image->copy($target);
		$copy->resize(215, 214);

		return TRUE;
	}

	public function delete( $file_path ){
		if( file_exists($file_path)){ @unlink($file_path); }
	}
	
	public function thumb_path() {
		return $this->upload_path . "/" . $this->smallsize_prefix . $this->filename;
	}

	public function filepath() {
		return $this->upload_path ."/" . $this->filename;
	}

	public function deploy_to_S3(){

		$this->ci = get_instance();
		$this->ci->load->helper( array('s3') );
		define('awsAccessKey', 'AKIAJ62XFSATMJCHJWCA');
		define('awsSecretKey', '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');

		$bucketName = 'core-project-files';
		$s3 = new S3(awsAccessKey, awsSecretKey);
		
		$origin = $this->thumb_path();
		$target = "graphics/imgs/" . $this->external_id .  "/" . $this->filename;

		$success = $s3->putObject( 
				file_get_contents($origin), 
				$bucketName, 
				$target, 
				S3::ACL_PUBLIC_READ
     );
        
     return $success;
	}


}
