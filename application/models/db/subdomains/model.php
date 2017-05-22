<?php
class Models_Db_Subdomains_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'subdomains';
  }

	public function getsubdomainWhere($where_array ){
		
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
	
	public function getSubdomainsWhere($where_array, $use_order,$order_field, $order_direction, $count, $where_in_array = array()){

		$results = $this->select_from_table( 
				$table = $this->table, 
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
	
	
	public function insertdomain( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllSubdomains(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updatesubdomain( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
		
}
