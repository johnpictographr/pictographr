<?php
class Models_Db_Faqs_Model extends Database {
  
  public function setDatabaseGroup( $db_group ){
		$this->db = $this->load->database($db_group, TRUE);
		$this->table = 'faqs';
  }


	public function getFaqWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id, question, answer", 
				$where_array );
		if( count($results) > 0){;
			return $this->object_to_array( $results[0] );
		}
		else {
			return 0;
		}		
	}


	public function getAllFaqsWhere($where_array ){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id, question, answer", 
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
	
	public function insertFaq( $insert_array ){
		return $this->insert_table( $table = $this->table,  $insert_array);
	}
	
	public function getAllFaqs(){
		
		$results = $this->select_from_table( 
				$table = $this->table, 
				$select_what = "id, question, answer", 
				$where_array = array()
		);
		
		return $this->object_to_array( $results);
				
	}
	
	public function updateFaq( $primary_key, $set_what_array ){
		
		return $this->update_table( 
				$table = $this->table,
				$primary_key,
				$set_what_array 
		);
	}
	
	
	public function deleteFaq( $where_array ){
		$this->delete_from_table($table = $this->table, $where_array);
	}
	
		
}
