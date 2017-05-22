<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Landing extends App {
	
	protected $dbGroup;
	
	public function __construct() { 
		
		
		parent::__construct();
	}
	
	public function index(){ //  
		
		$this->isFrom = __FUNCTION__;

		$obj = array();
		
		if( base_url() == 'foreign_domain/' ){
			
			$this->base();
			
		} elseif( base_url() == 'http://socialcampaigner.com/' ){
			$this->__saveGeoLocation(5, 'socialcampaigner');
			$this->load->view('service_view', $obj);
			
		} elseif( base_url() == 'http://www.socialcampaigner.com/' ){
			$this->__saveGeoLocation(5, 'socialcampaigner');
			$this->load->view('service_view', $obj);
			
		} elseif( base_url() == 'http://support.pictographr.com/' ){
			
			header("Location: " . 'https://sites.google.com/a/pictographr.com/support/');
			
		} else{
			
			if( isset($_GET['track_id'])){
				
				//IE https://pictographr.com/?track_id=2
				
				$this->__setTracksModel();
				$this->tracksArray = $this->tracks_model->getMarketFromLeftJoinedTracks($_GET['track_id']);	
				
				if( $this->tracksArray != 0 ){
					$this->__saveGeoLocationWithTracking($this->tracksArray[0]['market_id'], $this->tracksArray[0]['market_name'],  $this->tracksArray[0]['track_id']);
				}else{
					$this->__saveGeoLocation(1, 'pictographr');
				};
				
				$this->load->view('landing_view', array(
					 'track_id' => $_GET['track_id'],
					 'market_name' => $this->tracksArray[0]['market_name'],
					 'market_id' => $this->tracksArray[0]['market_id']
				));
				
			}else{
				
				/*
					THIS IS FOUND IN applications/config/routes.php
					$route['(.*)'] = 'app/base/$1';
				*/
				
				$market_id = 1; // PICTOGRAPHR
				
				$this->session->sess_destroy();
				
				$this->__setSubscriptionModel();
				$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($market_id);
				
				$subscription_monthly = $this->subscriptionsArray[0]['subscription_monthly'];
				$subscription_yearly = $this->subscriptionsArray[0]['subscription_yearly'];
				
				// IE https://pictographr.com/
				$this->__saveGeoLocation(1, 'pictographr');
				$this->load->view('landing_view', array(
					 'market_name' => 'pictographr',
					 'market_id' => $market_id,
					 'subscription_monthly' => $subscription_monthly,
					 'subscription_yearly' => $subscription_yearly,
				));		
						
			};
			

			
		}

		
	}
	
		private function __saveGeoLocationWithTracking($market_id, $market_name, $track_id){
			if( !isset($_GET['out'])){
				$this->__getGeoLocation();
				$this->__setVisitsModel();
				$this->visits_model->insertVisit( 			
					array(
						 'market_id' => $market_id,
						 'market_name' => $market_name,
						 'track_id' => $track_id,
						 'geo_location' =>  substr($this->geo_location,0, 120),
						 'HTTP_REFERER' =>  isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
						 'ip' => $_SERVER['REMOTE_ADDR']
					)
				);				
			}
		}	
	
		private function __saveGeoLocation($market_id, $market_name){
			if( !isset($_GET['out'])){
				$this->__getGeoLocation();
				$this->__setVisitsModel();
				$this->visits_model->insertVisit( 			
					array(
						 'market_id' => $market_id,
						 'market_name' => $market_name,
						 'geo_location' =>  substr($this->geo_location,0, 120),
						 'HTTP_REFERER' =>  isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
						 'ip' => $_SERVER['REMOTE_ADDR']
					)
				);				
			}
		}	

	public function sample(){ // http:/fandesignr.com/landing/sample
		
		$obj = array();

		$this->load->view('sample_view', $obj);
	}

	public function seeCookie(){
		
		echo 	 $_COOKIE['market_name'];
		
	}
}
