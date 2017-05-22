<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Faqs extends Admin {

	public function __construct() {
		
		parent::__construct();
		$this->__setfaqsModel();
		
	}
	
	public function crud(){   
		$obj['version'] = $this->version;
		$obj['table'] = 'faqs';
		$this->load->view('crud_view', $obj);
	}
	
	public function get(){ 
		
		$results = $this->faqs_model->getAllFaqs();
		$this->response['success'] = true;
		$this->response['results'] = $results;
		
		echo json_encode($this->response);
		
	}	
	
	public function add(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$insert_what[$k] = $v;
		}
		
		$this->response['insert_what'] = $insert_what;
		
		$this->faqs_model->insertFaq($insert_what);
		
		$this->get();
		
	}


	public function delete(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$delete_what[$k] = $v;
		}
		
		$this->response['delete_what'] = $delete_what;
		
		$this->faqs_model->deleteFaq($delete_what);
		
		$this->get();
		
	}	

	public function update(){

		foreach ($this->input->post('arrData') as $k => $v) {
			$update_what[$k] = $v;
		}				
		
		$record_id = $update_what['id'];
		
		unset($update_what['id']);
		
		$this->response['update_what'] = $update_what;		
		
		$this->response['record_id'] = $record_id;		
		
		$this->faqs_model->updateFaq($record_id, $update_what);
		
		$this->get();
		
	}		
}
