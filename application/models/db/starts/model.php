<?php
class Models_Db_Starts_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'starts';
  }


	public function getStartWhere($where_array ){
		
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


	public function getAllStartsWhere($where_array ){
		
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
	
	public function insertStart( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllStarts(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateStart( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	public function deleteStart( $where_array ){
		$this->delete_from_table($table =$this->table, $where_array);
	}
		
	public function getMarketFromLeftJoinedStarts($start_id){  
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
				markets.id as market_id,
				markets.name as market_name,
				starts.name as start_name,
				starts.id as start_id,
			', 
			$where_array  = array(
				'starts.id' => $start_id
			),
			$use_order = TRUE,
			$order_field = 'starts.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'markets' => 'markets.id = starts.market_id'
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
