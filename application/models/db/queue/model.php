<?php
class Models_Db_Queue_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'queue';
  }


	public function getQueueWhere($where_array ){
		
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

	
	public function getFirstIn(){
		
		$results = $this->select_from_table( 
			$table = $this->table, 
			'id, fileId, done', 
			array(
				'done' => 0
			), 
			$use_order = TRUE, 
			$order_field = 'id', 
			$order_direction = 'asc', 
			$limit = 1
		);
		
		return $this->object_to_array( $results);
		
	}

	public function getAllQueueWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array );
				
		if( count($results) > 0){;
			return array(
				'results' => $this->object_to_array( $results ),
				'count' => count($results)
			);
		}
		else {
			return 0;
		}		
	}
	
	public function insertQueue( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllQueue(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateQueue( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	public function deleteQueue( $where_array ){
		$this->delete_from_table($table =$this->table, $where_array);
	}
		

	
	
	
		
}
