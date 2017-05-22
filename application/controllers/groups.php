<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Groups extends Base_Controller {

	public function __construct() {
		
		parent::__construct();
		$this->__setgroupsModel();
		$this->__setcollectionsModel();
		
	}
	
	public function getJson(){

		$this->__setSetsModel();
		$this->__setTemplatesModel();		
		
		if( !isset($this->where_array) ){
			foreach ($this->input->post('arrData') as $k => $v) {
				$groups_where_array[$k] = $v;
			}			
		}
		
		$final_results = [];
		
		$group_obj = $this->groups_model->getAllGroupsWhere($groups_where_array);

		foreach( $group_obj['results']  as  $group){
			
			$sets_where_array['group_id'] = $group['id'];
			
			$set_obj = $this->sets_model->getAllSetsWhere($sets_where_array);
			
			$sets = [];
			
			if( $set_obj != 0 ){
				foreach( $set_obj['results']  as  $set){
					$template_obj = $this->templates_model->getTemplatesFromLeftJoinedTracks($set['id']);
					//$template_obj['group_id'] = $group['id'];
					$sets[$set['name']] = $template_obj;
				}
			};
			
			$final_results[$group['name']] = $sets;

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
		$results = $this->collections_model->getCollectionWhere($where_array);
		
		$obj['version'] = $this->version;
		$obj['table'] = 'groups';
		$obj['parent_name'] = $results['name'];
		$obj['grandparent_id'] = $results['sector_id'];
		$obj['parent_table'] = 'collection';  //collections
		$obj['child_table'] = 'sets'; 
		$this->load->view('crud_view', $obj);
	}

	public function get(){ 
		
		$this->__setSetsModel();
		
		if( !isset($this->where_array) ){
			foreach ($this->input->post('arrData') as $k => $v) {
				$this->where_array[$k] = $v;
			}			
		}
		
		$groups_obj = $this->groups_model->getAllGroupsWhere($this->where_array);
		
		if( $groups_obj != 0 ){
			$idx = 0;
			foreach( $groups_obj['results']  as  $group){
				$sets_where_array['group_id'] = $group['id'];
				$set_obj = $this->sets_model->getAllSetsWhere($sets_where_array);
				$groups_obj['results'][$idx]['count'] = ( isset($set_obj['count']) ? $set_obj['count'] : 0);
				$idx++;
			}
		};
		
		if( $groups_obj == 0 ){
			$this->response['error'] = 'No records';
			if( !isset( $this->response['delete_what'] ) ) $this->add();
		} else{
			$this->response['success'] = true;
			$this->response['count'] = $groups_obj['count'];
			$this->response['results'] = $groups_obj['results'];			
			echo json_encode($this->response);
		}
		
	}	
	
	public function add(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$insert_what[$k] = $v;
		}
		
		$this->where_array['collection_id'] =  $insert_what['collection_id'];
		
		$this->response['insert_what'] = $insert_what;
		
		if( !isset($insert_what['name']) ) $insert_what['name'] = 'Add name';
		
		$this->response['insert_id'] = $this->groups_model->insertGroup($insert_what);
		
		$this->get();
		
	}
	
	public function delete(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$delete_what[$k] = $v;
		}
		
		$this->where_array['collection_id'] = $delete_what['collection_id'];
		
		unset($delete_what['collection_id']);
		
		$this->response['delete_what'] = $delete_what;
		
		$this->groups_model->deleteGroup($delete_what);
		
		$this->get();
		
	}	

	public function update(){

		foreach ($this->input->post('arrData') as $k => $v) {
			$update_what[$k] = $v;
		}				
		
		$record_id = $update_what['id'];
		
		$this->where_array['collection_id'] = $update_what['collection_id'];
		
		unset($update_what['id']);
		unset($update_what['collection_id']);
		
		$this->response['update_what'] = $update_what;		
		
		$this->response['record_id'] = $record_id;		
		
		$this->groups_model->updateGroup($record_id, $update_what);
		
		$this->get();
		
	}		
}
