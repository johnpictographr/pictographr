<?php
class Models_Db_Subscriptions_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'subscriptions';
  }


	public function getSubscriptionWhere($where_array ){
		
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


	public function getAllSubscriptionsWhere($where_array ){
		
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
	
	public function insertSubscription( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllSubscriptions(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "*", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateSubscription( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	
	
	
	public function getSubscriptionFromLeftJoinedMarkets($market_id){  
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
				subscriptions.id as subscription_id,
				subscriptions.monthly as subscription_monthly,
				subscriptions.yearly as subscription_yearly,
				subscriptions.stripe_monthly_plan as stripe_monthly_plan,
				subscriptions.stripe_yearly_plan as stripe_yearly_plan,
			', 
			$where_array  = array(
				'markets.id' => $market_id
			),
			$use_order = TRUE,
			$order_field = 'markets.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'markets' => 'subscriptions.id = markets.subscription_id'
			), 
			$group_by_array = array(),
			$or_where_array = array(),
			$where_in_array = array(),
			$whereFieldIsSame = array()
			);
					
		if( count($results) > 0) return $this->object_to_array($results);
		else return 0;		
	}
	


	public function getSubscriptionFromLeftJoinedMarketsByName($market_name){  
		
		$results =  $this->select_from_table_left_join( 
			$table = $this->table,
			$select_what = '
				subscriptions.id as subscription_id,
				subscriptions.monthly as subscription_monthly,
				subscriptions.yearly as subscription_yearly,
				subscriptions.stripe_monthly_plan as stripe_monthly_plan,
				subscriptions.stripe_yearly_plan as stripe_yearly_plan,
				markets.id as market_id,
				markets.img as market_img,
			', 
			$where_array  = array(
				'markets.name' => $market_name
			),
			$use_order = TRUE,
			$order_field = 'markets.id',
			$order_direction = '',
			$limit = -1,
			$use_join = TRUE,
			$join_array  = array(
				'markets' => 'subscriptions.id = markets.subscription_id'
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
