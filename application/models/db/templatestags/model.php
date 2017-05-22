<?php
class Models_Db_Templatestags_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'templates_tags';
  }
	
	public function insertTemplatesTag( $insert_array ){
		return $this->insert_table(
		$table = $this->table, 
		$insert_array);
	}	


	public function getTemplatesWithTags( $setOfTags ){
		
		$results = $this->select_where_in(
			$table = 'templates_tags', 
			$select_what = "template_id",
			$field_selector = "tag_id",
			$setOfTags 
		);		

		if( count($results) > 0){
			return $this->object_to_array( $results );
		}
		else {
			return array();
		}		
	}
	
	public function getTemplatesTagWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "tag_id", 
				$where_array );
		if( count($results) > 0){
			return $this->object_to_array( $results );
		}
		else {
			return array();
		}		
	}
	
	public function getTemplatesWhereAllTagsAreIncluded( $tagsString ){  // DEPRECIATED
		
		$join_array = array(
			'templates' => 'templates_tags.template_id = templates.id'
		);	
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
					templates.id as template_id,
					templates_tags.tag_id as tag_id,
					templates.name as name,  
					templates.graphicsSet as graphicsSet,  
					templates.json as json', 
			$where_array  = array(),
			$use_order = TRUE,
			$order_field = 'templates.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array, 
			$group_by_array = array(),
			$or_where_array = array(),
			$where_in_array = array(
				'field' => 'templates_tags.tag_id',
				'ids' => $tagsString
			),
			$whereFieldIsSame = array()
			);
					
		if( count($results) > 0) return $this->object_to_array($results);
		else return 0;		
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
				$table = $this->table, 
				$select_what = "id", 
				$where_array );
				
		if( count($results) > 0) return 1;
		else return 0;
	}
	
	public function delete_template_tag($where_array ){

		$this->delete_from_table(
				$table = $this->table, 
				$where_array 
		);
		
	}
	
	
}
