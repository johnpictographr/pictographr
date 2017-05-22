<?php
class Models_Db_Sessions_Model extends Database {

	public function __construct(){
		    
//	 parent::__construct();ini_set('memory_limit', '-1');
	    
	}

  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'sessions';
  }
	
	public function doesSessionExistWhere( $where_array ){
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id, email, password, vanityUrl", 
				$where_array );
				
		if( count($results) > 0) return 1;
		else return 0;
	}
	public function getSessionWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "user_id, key, duration", 
				$where_array );
		if( count($results) > 0){
			return $this->object_to_array( $results );
		}
		else {
			return 0;
		}		
	}
	public function insertSession( $insert_array ){
		return $this->insert_table(
		$table = $this->table, 
		$insert_array);
	}
	
	public function getAllSessions(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id, email, password, vanityUrl", 
				$where_array = array());
		
		return $this->object_to_array( $results);
		
				
	}
	
	public function delete_from_table($where_array ){

		$this->delete_from_table(
				$table = $this->table, 
				$where_array 
		);
		
	}
	
	public function updateSession( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
}
