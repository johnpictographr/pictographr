<?php
class Models_Db_Templates_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'templates';
  }
	
	public function doesTemplateExistWhere( $where_array ){
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id", 
				$where_array );
				
		if( count($results) > 0) return 1;
		else return 0;
	}
	
	public function getTemplateWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array );
		if( count($results) > 0){
			return $this->object_to_array( $results );
		}
		else {
			return 0;
		}		
	}	
	
	public function getSetTemplateWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = 'sets_templates', 
				$select_what = "*", 
				$where_array );
		if( count($results) > 0){
			return $this->object_to_array( $results );
		}
		else {
			return 0;
		}		
	}	
	
	public function insertSetTemplate( $insert_array ){
		return $this->insert_table(
		$table = 'sets_templates', 
		$insert_array);
	}
	
	public function insertTemplate( $insert_array ){
		return $this->insert_table(
		$table = $this->table, 
		$insert_array);
	}	
	
	public function getAllTemplates(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array());
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateTemplate( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	public function deleteTemplate( $where_array ){
		$this->delete_from_table($table = $this->table, $where_array);
	}

	
	public function deleteSetTemplate($where_array ){

		$this->delete_from_table(
				$table = 'sets_templates', 
				$where_array 
		);
		
	}	
	public function getTemplatesFromSetOfIds($setOfTemplateIds){
		
		if( count($setOfTemplateIds) == 0) return array();
		
		$results = $this->select_where_in(
			$table = $this->table, 
			$select_what = "id, name, json, graphicsSet",
			$field_selector = "id",
			$where_in_array = $setOfTemplateIds 
		);		

		if( count($results) > 0){
			return $this->object_to_array( $results );
		};		
	}
	
	
	public function insertTags( $insert_array ){
		return $this->insert_table(
		$table = 'templates_tags', 
		$insert_array);
	}
	
	public function doesTagsExistWhere( $where_array ){
		$results = $this->select_from_table( 
				$table = 'tags', 
				$select_what = "id", 
				$where_array );
				
		if( count($results) > 0) return 1;
		else return 0;
	}
	
	public function doesTemplateTagsExistWhere( $where_array ){
		$results = $this->select_from_table( 
				$table = 'templates_tags', 
				$select_what = "id", 
				$where_array );
				
		if( count($results) > 0) return 1;
		else return 0;
	}
	
	public function delete_template_tag($where_array ){

		$this->delete_from_table(
				$table = templates_tags, 
				$where_array 
		);
		
	}


	public function getTemplatesFromLeftJoinedTracks($set_id){  
		
		$results =  $this->select_from_table_left_join( 
			$table = 'sets_templates',
			$select_what = '
				templates.id as id,
				templates.title as title,
				templates.description as description,
				templates.google_file_id as google_file_id,
				templates.google_image_id as google_image_id,
				templates.google_pdf_id as google_pdf_id,
				templates.youtube_id as youtube_id,
				sets_templates.set_id as set_id
			', 
			$where_array  = array(
				'sets_templates.set_id' => $set_id
			),
			$use_order = TRUE,
			$order_field = 'sets_templates.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'templates' => 'templates.id = sets_templates.template_id'
			), 
			$group_by_array = array(),
			$or_where_array = array(),
			$where_in_array = array(),
			$whereFieldIsSame = array()
			);
					
		if( count($results) > 0) return $this->object_to_array($results);
		else return 0;		
	}
	
}
