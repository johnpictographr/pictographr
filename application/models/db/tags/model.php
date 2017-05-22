<?php
class Models_Db_Tags_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'tags';
  }
	
	public function doesTagExistWhere( $where_array ){
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id", 
				$where_array );
				
		if( count($results) > 0) return 1;
		else return 0;
	}
	
	public function getTagWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id, name, json", 
				$where_array );
		if( count($results) > 0){
			return $this->object_to_array( $results );
		}
		else {
			return 0;
		}		
	}
	public function insertTag( $insert_array ){
		return $this->insert_table(
		$table = $this->table, 
		$insert_array);
	}
	
	public function getAllTags(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id, name", 
				$where_array = array());
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateTag( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	
	public function remove_from_table($where_array ){

		$this->delete_from_table(
				$table = $this->table, 
				$where_array 
		);
		
	}
	
	
	
	
}
