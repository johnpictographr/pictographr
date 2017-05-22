<?php
class Models_Db_Sectors_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'sectors';
  }


	public function getSectorWhere($where_array ){
		
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


	public function getAllSectorsWhere($where_array ){
		
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
	
	public function insertSector( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllSectors(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id, name", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateSector( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	
	public function deleteSector( $where_array ){
		$this->delete_from_table($table = $this->table, $where_array);
	}
	
	public function getMarketFromLeftJoinedSectors($sector_id){  
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
				markets.id as market_id,
				markets.name as market_name,
				sectors.name as sector_name,
				sectors.id as sector_id,
			', 
			$where_array  = array(
				'sectors.id' => $sector_id
			),
			$use_order = TRUE,
			$order_field = 'sectors.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'markets' => 'markets.id = sectors.market_id'
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
