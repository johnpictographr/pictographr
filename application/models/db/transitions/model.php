<?php
class Models_Db_Transitions_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'transitions';
  }


	public function getTransitionWhere($where_array ){
		
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


	public function getAllTransitionsWhere($where_array ){
		
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
	
	public function insertTransition( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllTransitions(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateTransition( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	public function deleteTransition( $where_array ){
		$this->delete_from_table($table =$this->table, $where_array);
	}
		
	public function getMarketFromLeftJoinedTransitions($transition_id){  
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
				markets.id as market_id,
				markets.name as market_name,
				transitions.name as transition_name,
				transitions.id as transition_id,
			', 
			$where_array  = array(
				'transitions.id' => $transition_id
			),
			$use_order = TRUE,
			$order_field = 'transitions.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'markets' => 'markets.id = transitions.market_id'
			), 
			$group_by_array = array(),
			$or_where_array = array(),
			$where_in_array = array(),
			$whereFieldIsSame = array()
			);
					
		if( count($results) > 0) return $this->object_to_array($results);
		else return 0;		
	}
	
	
	
		
}
