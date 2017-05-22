<?php
class Models_Db_Promos_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'promos';
  }

	public function getPromoWhere($where_array ){
		
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
	public function insertPromo( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllPromos(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updatePromo( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	public function getTrackFromLeftJoinedPromosForUser($user_id){  
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
				tracks.id as track_id,
				tracks.name as track_name,
				tracks.merchant_name as merchant_name,
				promos.when as promo_when,
				promos.code as promo_code,
				promos.name as promo_name,
				promos.id as promo_id,
			', 
			$where_array  = array(
				'promos.user_id' => $user_id
			),
			$use_order = TRUE,
			$order_field = 'promos.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'tracks' => 'tracks.id = promos.track_id'
			), 
			$group_by_array = array(),
			$or_where_array = array(),
			$where_in_array = array(),
			$whereFieldIsSame = array()
			);
					
		if( count($results) > 0) return $this->object_to_array($results);
		else return 0;		
	}


	public function getTrackFromLeftJoinedPromosForUserOnTrack($user_id, $track_id){  
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
				tracks.id as track_id,
				tracks.name as track_name,
				promos.when as promo_when,
				promos.code as promo_code,
				promos.name as promo_name,
				promos.id as promo_id,
			', 
			$where_array  = array(
				'promos.user_id' => $user_id,
				'promos.track_id' => $track_id
			),
			$use_order = TRUE,
			$order_field = 'promos.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'tracks' => 'tracks.id = promos.track_id'
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
