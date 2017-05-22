<?php
class Models_Db_Tracks_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'tracks';
  }


	public function getTrackWhere($where_array ){
		
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


	public function getAllTracksWhere($where_array ){
		
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
	
	public function insertTrack( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllTracks(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateTrack( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	
	
	
	public function getMarketFromLeftJoinedTracks($track_id){  
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
				markets.id as market_id,
				markets.name as market_name,
				markets.initial_credits as market_initial_credits,
				markets.credits as market_credits,
				markets.max_promo as market_max_promo,
				markets.promo_message as market_promo_message,
				tracks.name as track_name,
				tracks.id as track_id,
				tracks.welcome_modal as track_welcome_modal,
				tracks.welcome_email as track_welcome_email
			', 
			$where_array  = array(
				'tracks.id' => $track_id
			),
			$use_order = TRUE,
			$order_field = 'tracks.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'markets' => 'markets.id = tracks.market_id'
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
