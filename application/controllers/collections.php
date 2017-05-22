<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Collections extends Base_Controller {

	public function __construct() {
		
		parent::__construct();
		$this->__setsectorsModel();
		$this->__setcollectionsModel();
		
	}
	
	public function getJson(){
		
		$this->__setGroupsModel();
		$this->__setTemplatesModel();
		$this->__setSetsModel();
		
		if( !isset($this->where_array) ){
			foreach ($this->input->post('arrData') as $k => $v) {
				$collections_where_array[$k] = $v;
			}			
		}
		
		$final_results = [];
		
		$collection_obj = $this->collections_model->getAllCollectionsWhere($collections_where_array);

		foreach( $collection_obj['results']  as  $collection){
			
			$groups_where_array['collection_id'] = $collection['id'];
	
			$group_obj = $this->groups_model->getAllGroupsWhere($groups_where_array);
			
			$groups = [];
			
			if( $group_obj != 0) {
	
				foreach( $group_obj['results']  as  $group){
					
					$sets_where_array['group_id'] = $group['id'];
					
					$set_obj = $this->sets_model->getAllSetsWhere($sets_where_array);
					
					$sets = [];
					if( $set_obj != 0 ){
						foreach( $set_obj['results']  as  $set){
							$template_obj = $this->templates_model->getTemplatesFromLeftJoinedTracks($set['id']);
							$sets[$set['name']] = $template_obj;
						}
					};
					
					$groups[$group['name']] = $sets;
		
				}
			}
			
			$final_results[$collection['name']] = $groups;
			
		}

		if( count($final_results) == 0 ){
			$this->response['error'] = 'No records';
		} else{
			$this->response['success'] = true;
			$this->response['results'] = $final_results;			
		}

		echo json_encode($this->response);
		
	}
	
	public function crud(){
		
		$where_array['id'] = $_GET['parent_id'];
		$results = $this->sectors_model->getSectorWhere($where_array);
		   
		$obj['version'] = $this->version;
		$obj['table'] = 'collections';
		$obj['parent_name'] = $results['name'];
		$obj['parent_table'] = 'sector';  //sectors
		$obj['child_table'] = 'groups'; 
		$this->load->view('crud_view', $obj);
	}
	
	public function get(){
		
		$this->__setgroupsModel();
		
		if( !isset($this->where_array) ){
			foreach ($this->input->post('arrData') as $k => $v) {
				$this->where_array[$k] = $v;
			}			
		}
		
		$collections_obj = $this->collections_model->getAllCollectionsWhere($this->where_array);
		
		if( $collections_obj != 0 ){
			$idx = 0;
			foreach( $collections_obj['results']  as  $collection){
				$groups_where_array['collection_id'] = $collection['id'];
				$group_obj = $this->groups_model->getAllGroupsWhere($groups_where_array);
				$collections_obj['results'][$idx]['count'] = ( isset($group_obj['count']) ? $group_obj['count'] : 0);
				$idx++;
			}
		};
		
		if( $collections_obj == 0 ){
			$this->response['error'] = 'No records';
			if( !isset( $this->response['delete_what'] ) )$this->add();
		} else{
			$this->response['success'] = true;
			$this->response['count'] = $collections_obj['count'];
			$this->response['results'] = $collections_obj['results'];			
			echo json_encode($this->response);
		}
		
	}	
	
	public function add(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$insert_what[$k] = $v;
		}
		
		$this->where_array['sector_id'] =  $insert_what['sector_id'];

		if( !isset($insert_what['name']) ) $insert_what['name'] = 'Add name';
				
		$this->response['insert_what'] = $insert_what;
		
		$this->response['insert_id'] = $this->collections_model->insertCollection($insert_what);
		
		$this->get();
		
	}


	public function delete(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$delete_what[$k] = $v;
		}
		
		$this->where_array['sector_id'] = $delete_what['sector_id'];
		
		unset($delete_what['sector_id']);
		
		$this->response['delete_what'] = $delete_what;
		
		$this->collections_model->deleteCollection($delete_what);
		
		$this->get();
		
	}	

	public function update(){

		foreach ($this->input->post('arrData') as $k => $v) {
			$update_what[$k] = $v;
		}				
		
		$record_id = $update_what['id'];
		
		$this->where_array['sector_id'] = $update_what['sector_id'];
		
		unset($update_what['id']);
		unset($update_what['sector_id']);
		
		$this->response['update_what'] = $update_what;		
		
		$this->response['record_id'] = $record_id;		
		
		$this->collections_model->updateCollection($record_id, $update_what);
		
		$this->get();
		
	}		
}
