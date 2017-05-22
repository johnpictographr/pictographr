<?php
class Models_Db_Subscriptionsorgs_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'subscriptionsorgs';
  }

	public function getSubscriptionsorgWhere($where_array ){
		
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
	
	public function getManySubscriptionsorgsWhere($where_array){


		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array, 
				$use_order = TRUE, 
				$order_field = 'count', 
				$order_direction = 'asc'
		);
		
		return $this->object_to_array( $results);
				
	}
	
	
	public function insertSubscriptionsorg( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllSubscriptionsorgs(){


		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array(), 
				$use_order = TRUE, 
				$order_field = 'count', 
				$order_direction = 'asc'
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateSubscriptionsorg( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}

		
}
