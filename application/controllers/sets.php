<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Sets extends Admin {

	public function __construct() {
		
		parent::__construct();
		$this->__setSetsModel();
		$this->__setGroupsModel();
		
	}
	
	public function getJson(){

		$this->__setTemplatesModel();		
		
		if( !isset($this->where_array) ){
			foreach ($this->input->post('arrData') as $k => $v) {
				$sets_where_array[$k] = $v;
			}			
		}
		
		$final_results = [];
		
		$set_obj = $this->sets_model->getAllSetsWhere($sets_where_array);
		
		if( $set_obj != 0 ){
			$sets = [];
			foreach( $set_obj['results']  as  $set){
				$template_obj = $this->templates_model->getTemplatesFromLeftJoinedTracks($set['id']);
				$final_results[$set['name']] = $template_obj;
			}
		};
		
		if( count($final_results) == 0 ){
			$this->response['error'] = 'No records';
		} else{
			$this->response['success'] = true;
			$this->response['results'] = $final_results;			
		}

		echo json_encode($this->response);
		
	}
	
	public function get(){ 
		
		$this->__setTemplatesModel();
		
		if( !isset($this->where_array) ){
			foreach ($this->input->post('arrData') as $k => $v) {
				$this->where_array[$k] = $v;
			}			
		}

		$set_objs = $this->sets_model->getAllSetsWhere($this->where_array);
		
		if( $set_objs != 0 ){
			$idx = 0;
			foreach( $set_objs['results']  as  $set){
				$template_obj = $this->templates_model->getTemplatesFromLeftJoinedTracks($set['id']);
				$set_objs['results'][$idx]['count'] = $template_obj;
				$idx++;
			}
		};
		
		if( $set_objs == 0 ){
			$this->response['error'] = 'No records';
			$this->response['original_where_array']  =  $this->where_array;
			if( !isset( $this->response['delete_what'] ) ) $this->add();
		} else{
			$this->response['success'] = true;
			$this->response['count'] = $set_objs['count'];
			$this->response['results'] = $set_objs['results'];			
			echo json_encode($this->response);
		}
		
	}	
		
	public function crud(){   
		
		$where_array['id'] = $_GET['parent_id'];
		$results = $this->groups_model->getGroupWhere($where_array);
		
		$obj['version'] = $this->version;
		$obj['table'] = 'sets';
		$obj['parent_name'] = $results['name'];
		$obj['grandparent_id'] = $results['collection_id'];
		$obj['parent_table'] = 'group';  //groups
		$obj['child_table'] = 'templates'; 
		$this->load->view('crud_view', $obj);
	}

	
	public function add(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$insert_what[$k] = $v;
		}
		
		$this->where_array['group_id'] =  $insert_what['group_id'];
		
		$this->response['insert_what'] = $insert_what;
		
		if( !isset($insert_what['name']) ) $insert_what['name'] = 'Add name';
		
		$this->response['insert_id'] = $this->sets_model->insertSet($insert_what);
		
		$this->get();
		
	}


	public function delete(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$delete_what[$k] = $v;
		}
		
		$this->where_array['group_id'] = $delete_what['group_id'];
		
		unset($delete_what['group_id']);
		
		$this->response['delete_what'] = $delete_what;
		
		$this->sets_model->deleteSet($delete_what);
		
		$this->get();
		
	}	

	public function update(){

		foreach ($this->input->post('arrData') as $k => $v) {
			$update_what[$k] = $v;
		}				
		
		$record_id = $update_what['id'];
		
		$this->where_array['group_id'] = $update_what['group_id'];
		
		unset($update_what['id']);
		unset($update_what['group_id']);
		
		$this->response['update_what'] = $update_what;		
		
		$this->response['record_id'] = $record_id;		
		
		$this->sets_model->updateSet($record_id, $update_what);
		
		$this->get();
		
	}		
}
