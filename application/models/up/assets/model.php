<?php

class Models_Up_Assets_Model extends Models_Up {

	public function saveXXX($post_array){
		
		$this->_create_directories($post_array);
		
		get_instance()->load->library('qquploadedfilexhr');
		
		$allowedExtensions = array("jpg", "JPG", "mp4");
		
		$sizeLimit = 10000 * 1024 * 1024; // max file size in bytes
		
		$uploader = new qqFileUploader($allowedExtensions, $sizeLimit);
		
		$result = $uploader->handleUpload(  $this->upload_path( $post_array )  );
		
		echo '<pre>';print_r(  $result  );echo '</pre>';
		
	}
	
	
	public function saveNow( $post_array ) {
		/*
		
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }
		*/

		get_instance()->load->library('upload', array(
			'upload_path' =>"uploads/",
			'allowed_types' => '*',//			'allowed_types' => ( $post_array['target_folder'] == 'thumb' ? 'jpg|jpeg':'m4v|mp4|avi|mpeg|3gp'),
			'max_size' => '1000000000000000'/*,
			'max_width' => '2000',
			'max_height' => '2000',*/
		));
		
		echo '<pre>';print_r(  $post_array    );echo '</pre>'; 

		if ( ! get_instance()->upload->do_upload('imagefile')) {
			echo 'BAD';
			echo get_instance()->upload->display_errors();
		}else{
			echo 'GOOD';
		}
	}
	
	public function save( $post_array ) {

		if( $post_array['target_folder'] == 'thumb' &&
			is_file("uploads/".$post_array['asset_id']."/thumb/image.jpg") ){
 				@unlink("uploads/".$post_array['asset_id']."/thumb/image.jpg");
		}elseif(
		 	$post_array['target_folder'] == 'video' &&
		 	is_file("uploads/".$post_array['asset_id']."/video/video.mp4") 
		){
 				@unlink("uploads/".$post_array['asset_id']."/video/video.mp4");
		};

		$this->_create_directories($post_array);
		
		$uploadpath = $this->upload_path( $post_array );
		$filename = $post_array['target_name'];
		$fullpath =$uploadpath.$filename;
		
		get_instance()->load->library('upload', array(
			'file_name' => $filename,
			'upload_path' => $uploadpath,
			'allowed_types' => '*',//			'allowed_types' => ( $post_array['target_folder'] == 'thumb' ? 'jpg|jpeg':'m4v|mp4|avi|mpeg|3gp'),
			'max_size' => '1000000000000000'/*,
			'max_width' => '2000',
			'max_height' => '2000',*/
		));
		
		if ( ! get_instance()->upload->do_upload('filename')) {
			?>
			<script type="text/javascript" language="Javascript">
				alert('<?php echo get_instance()->upload->display_errors()    ?>');	
			</script>
			<?php     
		}else{
			
			
			if( $post_array['target_folder'] == 'thumb' ){
				

				?>
			
					<script type="text/javascript" language="Javascript">
						var img_src = '<?php  echo base_url() . $fullpath; ?>'
						window.parent.$('#zoom_content .thumb_img').attr('src', img_src);
						window.parent.core.bindElements.upload.jcrop.init(<?php echo  $post_array['asset_id'];    ?>);
					</script>			
			
			
			<?php }else{?>
			
					<script type="text/javascript" language="Javascript">
						var img_src = '<?php  echo base_url() . $this->upload_path( $post_array );   ?>/image.jpg';
						window.parent.$('#zoom_content .video_input_field').val('').css({background:'lightgreen'})
						
					</script>				
			
			<?php } 
			
				
			
		}

		return TRUE;
	}
	

	
	public function upload_path( $post_array ) {
		return "uploads/" . $post_array['asset_id'] ."/".$post_array['target_folder']."/";
	}
	
	public function crop( $post_array ){
		
		$uploadpath = $this->upload_path( $post_array );
		$filename = 'image.jpg';
		$fullpath = $uploadpath.$filename;
		
		$width = $post_array['x2'] - $post_array['x'];
		$height = $post_array['y2'] -  $post_array['y'];

		$this->crop_and_name_it(
			$new_name = 'image.jpg',
			$fullpath, 
			$uploadpath,
			$post_array['x'], 
			$post_array['y'], 
			$width, 
			$height
		  );
		  
		$new_width  = $post_array['cropped_width'];
		$new_height = $this->get_new_size_of ($what = 'height', $based_on_new = $new_width, $width, $height );

		$this->resize_this(  $fullpath, $new_width, $new_height);

	}
	
/*	public function filepath() {
		return $this->upload_path()."/$this->filename";
	}
	
	public function file_url() {
		return base_url().$this->filepath();
	}
	
	public function file_exists() {
		return file_exists($this->filepath());
	}*/
	
	protected function _create_directories($post_array) {
		
			@mkdir("uploads/".$post_array['asset_id']."/thumb/", 0755, TRUE);
			@mkdir("uploads/".$post_array['asset_id']."/video/", 0755, TRUE);

	}
	
	
}
