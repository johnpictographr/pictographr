<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Sectors extends Base_Controller {

	public function __construct() {
		
		parent::__construct();
		$this->__setsectorsModel();
		
	}

	public function getJson(){
		
		$this->__setcollectionsModel();
		$this->__setGroupsModel();
		$this->__setTemplatesModel();
		$this->__setSetsModel();

		$final_results = [];
		
		$sector_obj = $this->sectors_model->getAllSectors();
		
		foreach( $sector_obj  as  $sector){
			
			$collections_where_array['sector_id'] = $sector['id'];
		
			$collection_obj = $this->collections_model->getAllCollectionsWhere($collections_where_array);
			
			$collections = [];
			
			if( $collection_obj != 0) {
	
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
					
					$collections[$collection['name']] = $groups;
					
				}
				
			$final_results[$sector['name']] = $collections;	
			
			}
			
		}

		if( count($final_results) == 0 ){
			$this->response['error'] = 'No records';
		} else{
			$this->response['success'] = true;
			$this->response['results'] = $final_results;			
		}

		echo json_encode($this->response);
		
	}
	
	public function get(){ 

		$this->__setcollectionsModel();
		
		$sectors_obj = $this->sectors_model->getAllSectors();
		
		
		if( count($sectors_obj) != 0 ){
			$idx = 0;
			foreach( $sectors_obj  as  $sector){
				$collections_where_array['sector_id'] = $sector['id'];
				$collections_obj = $this->collections_model->getAllCollectionsWhere($collections_where_array);
				$sectors_obj[$idx]['count'] = ( isset($collections_obj['count']) ? $collections_obj['count'] : 0);
				$idx++;
			}
		};
		
		
		$this->response['success'] = true;
		$this->response['results'] = $sectors_obj;
		
		echo json_encode($this->response);
		
	}	
		
	public function crud(){   
		$obj['version'] = $this->version;
		$obj['table'] = 'sectors';
		$obj['child_table'] = 'collections'; 
		$this->load->view('crud_view', $obj);
	}

	public function add(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$insert_what[$k] = $v;
		}
		
		$this->response['insert_what'] = $insert_what;
		
		$this->sectors_model->insertSector($insert_what);
		
		$this->get();
		
	}


	public function delete(){
		
		foreach ($this->input->post('arrData') as $k => $v) {
			$delete_what[$k] = $v;
		}
		
		$this->response['delete_what'] = $delete_what;
		
		$this->sectors_model->deleteSector($delete_what);
		
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
		
		$this->sectors_model->updateSector($record_id, $update_what);
		
		$this->get();
		
	}		
}
