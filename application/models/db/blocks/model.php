<?php
class Models_Db_Blocks_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'blocks';
  }


	public function getBlockWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array );
		if( count($results) > 0){;
			return $this->object_to_array( $results[0] );
		}
		else {
			return 0;
		}		
	}


	public function getAllBlocksWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array );
				
		if( count($results) > 0){;
			return $this->object_to_array( $results );
		}
		else {
			return 0;
		}			
	}
	
	public function insertBlock( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllBlocks(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateBlock( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	
	public function deleteBlock( $where_array ){
		$this->delete_from_table($table = $this->table, $where_array);
	}
	
		
}
