<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Templates extends Base_Controller {

	public function __construct() {
		
		parent::__construct();
		
		$this->google_id = '104384554224634036843';  // from pictographr account in google
		$this->__setTemplatesModel();
		$this->__setSetsModel();
		
		
	}
	
	public function crud(){   
		
		$where_array['id'] = $_GET['parent_id'];
		$results = $this->sets_model->getSetWhere($where_array);
		
		$obj['version'] = $this->version;
		$obj['table'] = 'templates';
		$obj['parent_name'] = $results['name'];
		$obj['grandparent_id'] = $results['group_id'];
		$obj['parent_table'] = 'set';  //sets
		$this->load->view('crud_view', $obj);
	}
	
	public function get(){ 
		
		$this->__paramIntoProperties($this->input->post('arrData'));
		$results = $this->templates_model->getTemplatesFromLeftJoinedTracks($this->set_id);

		if( $results == 0 ){
			$this->response['error'] = 'No records';
			if( !isset( $this->response['delete_what'] ) ) $this->add();
		} else{
			$this->response['success'] = true;
			$this->response['results'] = $results;
			
			echo json_encode($this->response);
		}
		
	}
	
	public function add(){
		
		$this->__connect();
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$insert_what[$k] = $v;
		}
		
		$set_id = $insert_what['set_id'];
		
		unset($insert_what['set_id']);
		
		$this->response['insert_what'] = $insert_what;
		
		
		// CHECK IF TEMPLATE FOR THIS FILE_ID ALREADY EXIST
		
		$check_array['google_file_id'] = $insert_what['google_file_id'];
		
		$exist_array = $this->templates_model->getTemplateWhere( $check_array );

		if( $exist_array  == 0){

			if( !isset($insert_what['title']) ) $insert_what['title'] = 'Add title';
						
			$template_id = $this->templates_id = $this->templates_model->insertTemplate($insert_what);
			
			if(  $insert_what['google_file_id'] != '' ){
				
				$this->fileId = $insert_what['google_file_id'];		
				
				$this->__saveDriveDataFile();
				
				$this->fileId = $insert_what['google_image_id'];		
				
				$this->__saveDriveImgFile();	
				
				$this->fileId = $insert_what['google_pdf_id'];		
				
				$this->__saveDrivePDFFile();	
							
			};

								
		}else{
			
			$template_id = $exist_array[0]['id'];	
						
		};
		
		
		// CHECK IN SETS TEMPLATES AS WELL
		
		$check_again['template_id'] = $template_id;
		
		$check_again['set_id'] = $set_id;
		
		$exist_again = $this->templates_model->getSetTemplateWhere( $check_again );

		if( $exist_again  == 0){		
		
			$insert_join['template_id'] = $template_id;
			
			$insert_join['set_id'] = $set_id;
			
			$this->templates_model->insertSetTemplate($insert_join);
			
			$this->response['insert_join'] = $insert_join;
	
			
			
		} else {
			
			$this->response['more'] = 'Already in sets templates';
			
		}
		
		$this->get();	
		
	}
	
	public function delete(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$delete_what[$k] = $v;
		}
		
		unset($delete_what['set_id']);
		
		$this->response['delete_what'] = $delete_what;
		
		$this->templates_model->deleteTemplate($delete_what);
		
		$delete_what_join['template_id'] = $delete_what['id'];
		
		// check to see if there are other existing set_templates files for this template_id
		
		$this->templates_model->deleteSetTemplate($delete_what_join);
		
		$this->__unlink($this->template_path . "/" . $delete_what['id'] . '.js');	
		$this->__unlink($this->template_path . "/" . $delete_what['id'] . '.png');	
		$this->__unlink($this->template_path . "/" . $delete_what['id'] . '_thumb.png');	
		$this->__unlink($this->template_path . "/" . $delete_what['id'] . '.pdf');	
			
		$this->get();
		
	}
	
		private function __unlink( $filename ){
			if( file_exists($filename)){ unlink($filename); }	
		}

	public function update(){
		
		$this->__connect();

		foreach ($this->input->post('arrData') as $k => $v) {
			$update_what[$k] = $v;
		}				
		
		$record_id = $update_what['id'];
		
		unset($update_what['id']);
		unset($update_what['set_id']);
		
		$this->response['update_what'] = $update_what;		
		
		$this->response['record_id'] = $this->templates_id = $record_id;		
		
		$this->templates_model->updateTemplate($record_id, $update_what);
		
		$this->fileId = $update_what['google_file_id'];		
		
		$this->__saveDriveDataFile();
		
		$this->fileId = $update_what['google_image_id'];		
		
		$this->__saveDriveImgFile();	
		
		$this->fileId = $update_what['google_pdf_id'];		
		
		$this->__saveDrivePDFFile();			
			
		$this->get();
		
	}	
	
		private function __saveDriveDataFile(){
				
			$this->data = $this->__openFromGoogleDrive();
			
			$filename = $this->template_path . "/" . $this->templates_id . '.js';
	
			file_put_contents( $filename, $this->data);			
			
		}		
	
	
		private function __saveDriveImgFile(){
				
			$this->__getBinaryFromDrive();
			
			$x = getimagesizefromstring($this->binary);
			$width  = $x['0'];
			$height = $x['1'];
			
			$max_width = 300;
			
			if(  $width >  $max_width){
				
				$this->new_width = $max_width;
				$this->rawImg = $this->__shrinkIntoPng($this->binary);

				ob_start();  // http://stackoverflow.com/questions/1206884/php-gd-how-to-get-imagedata-as-binary-string
				imagepng($this->rawImg);
				$this->rawImg = ob_get_contents(); 
				ob_end_clean(); 
								
				$filename = $this->template_path . "/" . $this->templates_id . '.png';
		
				file_put_contents( $filename, $this->rawImg);			
			
			}	
			
		}		
	
		private function __saveDrivePDFFile(){
				
			$this->__getBinaryFromDrive();
			
			$filename = $this->template_path . "/" . $this->templates_id . '.pdf';
	
			file_put_contents( $filename, $this->binary);			
			
		}	
					
}
