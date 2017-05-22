<?php
class Models_Db_Graphics_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'graphics';
  }
	
	public function doesGraphicExistWhere( $where_array ){
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id", 
				$where_array );
				
		if( count($results) > 0) return 1;
		else return 0;
	}
	
	public function getGraphicWhere($where_array ){
		
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

	public function getGraphicsFromSetOfIds($setOfGraphicExternalIds, $select_what){
		
		if( count($setOfGraphicExternalIds) == 0) return array();
		
		$results = $this->select_where_in(
			$table = $this->table, 
			$select_what,
			$field_selector = "external_id",
			$whereInArray = $setOfGraphicExternalIds 
		);		

		if( count($results) > 0){
			return $this->object_to_array( $results );
		};		
	}
	
	public function insertGraphic( $insert_array ){
		return $this->insert_table(
		$table = $this->table, 
		$insert_array);
	}
	
	public function getAllGraphics(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array());
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateGraphic( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	
	public function delete_from_table($where_array ){

		$this->delete_from_table(
				$table = $this->table, 
				$where_array 
		);
		
	}
}
