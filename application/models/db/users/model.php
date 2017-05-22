<?php
class Models_Db_Users_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'users';
  }

	public function getUserWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = 'users', 
				$select_what = "*", 
				$where_array );
		if( count($results) > 0){;
			return $this->object_to_array( $results[0] );
		}
		else {
			return 0;
		}		
	}
	

	public function getUsersWhere($where_array, $use_order,$order_field, $order_direction, $count, $where_in_array = array()){

		$results = $this->select_from_table( 
				$table = 'users', 
				$select_what = "*", 
				$where_array, 
				$use_order, 
				$order_field, 
				$order_direction, 
				$limit = $count, 
			$use_join = FALSE, 
			$join_array = array(), 
			$group_by_array = array(),
			$or_where_array = array(),
			$where_in_array
			);
			
		if( count($results) > 0){;
			return $this->object_to_array( $results );
		}
		else {
			return 0;
		}		
	}	
	
	
	public function insertUser( $insert_array ){
		return $this->insert_table(
		$table = $this->table, 
		$insert_array);
	}
	
	public function getAllUsers(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateUser( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	public function update_table_where( $where_array, $set_what_array  ){
		
		return $this->update_table_where( 
				$table = $this->table,
				$where_array,
				$set_what_array 
		);
	}	

	public function deleteUser( $where_array ){
		$this->delete_from_table($table = $this->table, $where_array);
	}
	
	public function getCount($where_array ){
		
		return $this->count_records( $this->table,  $where_array );
		
	}
		
}
