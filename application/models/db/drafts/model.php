<?php
class Models_Db_Drafts_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'drafts';
  }
	
	public function doesDraftExistWhere( $where_array ){
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id", 
				$where_array );
				
		if( count($results) > 0) return true;
		else return false;
	}
	
	public function getDraftWhere( $where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "name, id, user_id, google_id, fileId4thumb", 
				$where_array );
		
		return $this->object_to_array( $results);
	}
	

	public function insertDraft( $insert_array ){
		return $this->insert_table(
		$table = $this->table, 
		$insert_array);
	}
	
	public function getAllDrafts(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id", 
				$where_array = array());
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateDraft( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	
	public function removeFromTable($where_array ){

		$this->delete_from_table(
				$table = $this->table, 
				$where_array 
		);
		
	}
}
