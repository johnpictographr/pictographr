<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Stripe extends Credit {
	
	public function __construct() {
		parent::__construct();
	}
	
	public function testing(){
		
		echo "test";	
		
	}
	
	public function seeplans(){
		$this->__setSubscriptionModel();
		$this->subscriptionsArray = $this->subscriptions_model->getAllSubscriptions();
		echo '<pre>';print_r(  $this->subscriptionsArray  );echo '</pre>';  exit;
		
	}

	public function insertplans(){
		
	    $this->__requireStripLibrary();
	    
		$this->__setSubscriptionsorgsModel();
		$this->subscriptionsArray = $this->subscriptionsorgs_model->getAllSubscriptionsorgs();
		
		foreach( $this->subscriptionsArray  as  $index => $record){
			echo $record['stripe_monthly_plan']."<br />";
			echo $record['stripe_yearly_plan']."<br />";
			echo $record['monthly']."<br />";
			echo $record['yearly']."<br />";
			echo $record['onbillmonthly']."<br />";
			echo $record['onbillyearly']."<br />";
			
		    $results = Stripe\Plan::create(array(
		    	"id" => $record['stripe_monthly_plan'],
				  "amount" => $record['monthly'],
				  "interval" => "day",
				  "interval_count" => "30",
				  "name" => $record['stripe_monthly_plan'],
				  "statement_descriptor" => $record['onbillmonthly'],
				  "currency" => "usd"
				  )			
				);
				
		    $results = Stripe\Plan::create(array(
		    	"id" => $record['stripe_yearly_plan'],
				  "amount" => $record['yearly'],
				  "interval" => "year",
				  "name" => $record['stripe_yearly_plan'],
				  "statement_descriptor" => $record['onbillyearly'],
				  "currency" => "usd"
				  )
				);
				
//			
//			try {
//				
//		    // $results = Stripe\Plan::retrieve("O-B-M-5000-25000");
//		    
//		    $results = Stripe\Plan::create(array(
//		    	"id" => $record['stripe_monthly_plan'],
//				  "amount" => $record['monthly'],
//				  "interval" => "day",
//				  "interval_count" => "30",
//				  "name" => $record['stripe_monthly_plan'],
//				  "statement_descriptor" => $record['onbillmonthly'],
//				  "currency" => "usd"
//				  )
//				);
//				
//				return true;
//
//			} catch (\Stripe\Error\ApiConnection $e) {
//			  echo '<pre>';print_r(  $e  );echo '</pre>';
//				
//				return false;
//			} catch (\Stripe\Error\InvalidRequest $e) {
//			  echo '<pre>';print_r(  $e  );echo '</pre>';
//				
//				return false;
//			} catch (\Stripe\Error\Api $e) {
//			   
//				echo '<pre>';print_r(  $e  );echo '</pre>';
//				
//				return false;
//			} catch( Stripe\Error\Card $e) {
//				echo '<pre>';print_r(  $e  );echo '</pre>';
//				
//				return false;
//			}
			
//			try {
//				
//		    // $results = Stripe\Plan::retrieve("O-B-M-5000-25000");
//		    
//		    $results = Stripe\Plan::create(array(
//		    	"id" => $record['stripe_yearly_plan'],
//				  "amount" => $record['yearly'],
//				  "interval" => "year",
//				  "name" => $record['stripe_yearly_plan'],
//				  "statement_descriptor" => $record['onbillyearly'],
//				  "currency" => "usd"
//				  )
//				);
//				
//				return true;
//
//			} catch (\Stripe\Error\ApiConnection $e) {
//			  echo '<pre>';print_r(  $e  );echo '</pre>';
//				
//				return false;
//			} catch (\Stripe\Error\InvalidRequest $e) {
//			  echo '<pre>';print_r(  $e  );echo '</pre>';
//				
//				return false;
//			} catch (\Stripe\Error\Api $e) {
//			   
//				echo '<pre>';print_r(  $e  );echo '</pre>';
//				
//				return false;
//			} catch( Stripe\Error\Card $e) {
//				echo '<pre>';print_r(  $e  );echo '</pre>';
//				
//				return false;
//			}		



		}
		
		

		
	}
	  
	
	public function testplan(){
		
	    $this->__requireStripLibrary();
	    
	    
			try {
				
		    // $results = Stripe\Plan::retrieve("O-B-M-5000-25000");
		    
		    $results = Stripe\Plan::create(array(
				  "amount" => 2500000,
				  "interval" => "day",
				  "interval_count" => "30",
				  "name" => "O-B-M-5000-25000",
				  "statement_descriptor" => "PICT-MON-5000",
				  "statement_descriptor" => "PICT-MON-5000",
				  "currency" => "usd",
				  "id" => "O-B-M-5000-25000")
				);
				
				return true;

			} catch (\Stripe\Error\ApiConnection $e) {
			  echo '<pre>';print_r(  $e  );echo '</pre>';
				
				return false;
			} catch (\Stripe\Error\InvalidRequest $e) {
			  echo '<pre>';print_r(  $e  );echo '</pre>';
				
				return false;
			} catch (\Stripe\Error\Api $e) {
			   
				echo '<pre>';print_r(  $e  );echo '</pre>';
				
				return false;
			} catch( Stripe\Error\Card $e) {
				echo '<pre>';print_r(  $e  );echo '</pre>';
				
				return false;
			}

		
	}
	  
	
}
