<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Payment extends Credit {
	
	public function __construct() {
		parent::__construct();
	}

	public function subscribe() {
		
		$this->emailmyself_content = '';

    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
    $this->__setMessagesModel();		
    $this->__requireStripLibrary();		
		$this->__setSubscriptionModel();
		$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($this->user_market_id);
		
		$stripe_monthly_plan = $this->subscriptionsArray[0]['stripe_monthly_plan'];
		$stripe_yearly_plan = $this->subscriptionsArray[0]['stripe_yearly_plan'];
		$this->subscription_id = $this->subscriptionsArray[0]['subscription_id'];
		
		if( $this->request_interval == 1){
			$this->subscription_interval = 1;
			$this->plan = $stripe_monthly_plan;
		}else{
			$this->subscription_interval = 2;
			$this->plan = $stripe_yearly_plan;
		};

		if( $this->stripe_customer_id == '') {
			if( ! $this->__createStripeCustomer() ){
				
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);
				
				exit;
			}
			$this->emailmyself_content .= $this->user_email.  ' is a new Stripe Account. ';
			
		};
		
		if( isset( $this->stripeCustomerCreated ) ){
			$this->users_model->updateUser( 
				$this->user_id, 
				$this->set_what_array 
			);
		};
		
		if( isset( $this->token ) && !isset( $this->stripeCustomerCreated ) ){
			
			if( ! $this->__updateStripeCustomer() ){
				
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);
	
				exit;	
			};			
		};

		
		if( $this->__userTrialExpired() ){  // CHARGE NOW
			
			if( ! $this->__subscriptionStripeCharge() ){
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);				
				exit;
			}

			$this->server_response['action'] = 'subscriptionStripeCharge';
			$this->server_response['snack'] = 'You are now subscribed to Pictographr.  Thank you.';
			// sendgrid  receipt				
			
		} else {  // CHARGE LATER
			
			$this->__addToStartsQueue($this->trial_end, $this->subscription_id, $this->subscription_interval);
			$this->typeOfPlan = ( $this->subscription_interval == 1 ? 'monthly': 'yearly');
			$this->server_response['action'] = 'addToStartsQueue';
			$this->server_response['snack'] = 'Your ' . $this->typeOfPlan . ' subscription will start on ' . $this->nice_start_date;
																	
			$this->message_id = 11; 
			$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
			$this->server_response['welcome'] =  $this->messageArray['modal_text'];

			$this->set_what_array['subscription_id'] = $this->subscription_id;
			$this->set_what_array['subscription_interval'] = $this->subscription_interval;
			$this->set_what_array['stripe_plan'] = $this->plan;

			$this->emailmyself_content .= $this->user_email.  ' is set to subscribe for ' . (  $this->subscription_interval == 1 ? 'monthly': 'yearly' ) . ' account on ' . $this->nice_start_date;										
			
		};
		
		$this->users_model->updateUser( 
			$this->user_id, 
			$this->set_what_array 
		);

		
		$this->server_response['status'] = 'succeeded';
		$this->server_response['status_id'] = $this->status_id;

		echo json_encode($this->server_response);
		
		unset(  $this->server_response );
		
		if( isset( $this->justStriped ) ) $this->__sendInvoice();
		if ( $this->emailmyself_content != '' ) $this->__emailmyself( $this->emailmyself_content  );
	}
	  	  
	  protected function __stripe_error($e){
		    $e_json = $e->getJsonBody();
		    $error = $e_json['error'];
		    $this->server_response['error_message'] = $error['message'];
		    $this->server_response['decline_code'] = ( isset( $error['decline_code'] ) ? $error['decline_code'] : '' );    
		    $this->server_response['status'] = 'failed';
		    $this->server_response['full_error'] = $error;
	  }

	  private function __sendInvoice(){
	  	
	  	$this->__setMessagesModel();
   		$this->__setSubscriptionModel();
	  	
			$whereArray['id'] = $this->user_id;
			$userResultArray = $this->users_model->getUserWhere( $whereArray );
			$whereArray['id'] = $userResultArray['subscription_id'];
			$subscriptionsArray = $this->subscriptions_model->getSubscriptionWhere($whereArray);
	  	
			$this->message_id = 17; // email about subscription
			$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
			$this->template_id = $this->messageArray['sendgrid_template_id'];
			
			$this->addTo = $userResultArray['email'];
			$this->setFrom = "admin@pictographr.com";
			
			if( $userResultArray['subscription_interval'] == 1 ){
				$subscription_interval_nice = "monthly";
				$charge = $subscriptionsArray['monthly'];
				$nextBillingDateNice = $this->__getTimeLeftInMonthlySubscription($userResultArray)['nextStartBillNiceDate'];
			} else {
				$subscription_interval_nice = "annual";
				$charge = $subscriptionsArray['yearly'];
				$nextBillingDateNice =  $this->__getTimeLeftInYearlySubscription($userResultArray)['nextStartBillNiceDate'];
			}
			
			$replace_whats['-given_name-'] = $userResultArray['given_name'];
			$replace_whats['-charge-amount-'] = $charge;
			$replace_whats['-subscription_interval_nice-'] = $subscription_interval_nice;
			$replace_whats['-next-billing-date-'] = $nextBillingDateNice;
			$this->setSubject = $this->messageArray['email_subject'];
			$this->setText = $this->__customizeMessage( $this->messageArray['email_text'], $replace_whats );
			$this->setHtml = $this->__customizeMessage( $this->messageArray['email_html'], $replace_whats );

			$this->__sendgrid();
			
			if( isset($this->emailmyself_content) ) $this->emailmyself_content .= $this->user_email.  ' was just charged '. $charge . ' for a '. $subscription_interval_nice;
	  	
	  }
	  
	public function testSendInvoice(){
		//$this->__emailmyself('teset');
		$this->__setUsersModel();
		$this->user_id = 825;
		$this->__sendInvoice();	
		
	}
	  
	  private function __addToStartsQueue($when, $subscription_id, $subscription_interval){

			$this->__setStartsModel();
	
			$resultArray = $this->starts_model->getStartWhere( array(
				'user_id' => $this->user_id,
				'processed' => 0
			));
			
			if( $resultArray == 0){
	  	
				$this->__setSubscriptionModel();
				$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionWhere(array(
					'id' => $subscription_id
				));
				
				$date = new DateTime($when);
				$date->modify("+1 day");
				$when = $date->format('Y-m-d');
				$this->nice_start_date = $date->format('F d, Y');
		  				
				$insert_array = array(
					'user_id' => $this->user_id,
					'when' => $when,
					'name' => $this->user_name,
					'email' => $this->user_email,
					'market_id' => $this->user_market_id,
					'market_name' => $this->user_market_name,
					'stripe_customer_id' => $this->stripe_customer_id,
					'stripe_plan' => ( $subscription_interval == 1 ? $this->subscriptionsArray['stripe_monthly_plan']: $this->subscriptionsArray['stripe_yearly_plan']),
					'subscription_id' => $subscription_id,
					'subscription_interval' => $subscription_interval,
					'price' => ( $subscription_interval == 1 ? $this->subscriptionsArray['monthly']: $this->subscriptionsArray['yearly'])
				);
				
				$this->start_id = $this->starts_model->insertStart( $insert_array );
				
				$this->set_what_array['subscription_start'] = $when;
				$this->set_what_array['status_id'] = $this->status_id = 5;
				$this->set_what_array['start_id'] = $this->start_id;
				
				$this->server_response['insert_array'] = $insert_array;

			}
			
	  }

	  
	  protected function __createStripeCustomer(){
	  	
			try {
				
				$metaData = array(
				  	"user_id" => $this->user_id,
				  	"user_name" => $this->user_name,
				  	"user_family_name" => $this->user_family_name,
				  	"user_given_name" => $this->user_given_name,
				  	"market_name" => $this->user_market_name,
				  	"market_id" => $this->user_market_id
				  );
				  
				if(  isset(  $this->domain )  ) $metaData['domain'] = $this->domain;
				if(  isset(  $this->organization_name )  ) $metaData['organization_name'] =  $this->organization_name;
	
				$this->customer = Stripe\Customer::create(array(
				  "source" => $this->token,
				  "description" => $this->user_name . " from " . $this->user_market_name . ' started ' . date('M j Y g:i A', strtotime(date('Y-m-d'))),
				  "email" => $this->user_email,
				  "metadata" => $metaData )
				);
				
				$this->set_what_array['stripe_customer_id'] = $this->stripe_customer_id = $this->customer->id;
				$this->server_response['customer'] = $this->customer;
				$this->server_response['status'] = 'success';
				$this->stripeCustomerCreated = true;
				
				return true;

			} catch (\Stripe\Error\ApiConnection $e) {
			    // Network problem, perhaps try again.
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\InvalidRequest $e) {
			    // You screwed up in your programming. Shouldn't happen!
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\Api $e) {
			    // Stripe's servers are down!
				$this->__stripe_error( $e );
				
				return false;
			} catch( Stripe\Error\Card $e) {
				$this->__stripe_error( $e );
		    
				
				return false;
			}
	  }

		private function __subscriptionStripeCharge(){
			
			try {
				
				$customer = Stripe\Customer::retrieve($this->stripe_customer_id);
				$this->stripe_subscription = $customer->subscriptions->create(array("plan" => $this->plan ));
				
				$this->set_what_array['subscription_id'] = $this->subscription_id;
				$this->set_what_array['subscription_interval'] = $this->subscription_interval;
				$this->set_what_array['stripe_subscription_id'] = $this->stripe_subscription->id;
				$this->set_what_array['stripe_plan'] = $this->plan;
				$this->set_what_array['status_id'] = $this->status_id = 6;  // subscribed
				$this->set_what_array['subscription_start'] = date('Y-m-d');
				$this->set_what_array['subscription_end'] = 0;
				$this->set_what_array['subscription_end_request'] = 0;
				
				$this->justStriped = true;
				
//				$this->server_response['stripe_subscription'] = $this->stripe_subscription;

				
				$this->server_response['status'] = 'success';
				
			  return true;
			  
			} catch (\Stripe\Error\ApiConnection $e) {
			    // Network problem, perhaps try again.
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\InvalidRequest $e) {
			    // You screwed up in your programming. Shouldn't happen!
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\Api $e) {
			    // Stripe's servers are down!
				$this->__stripe_error( $e );
				
				return false;
			} catch( Stripe\Error\Card $e) {
				$this->__stripe_error( $e );
				
				return false;
			}
		}	
	
	public function unsubscribe() {
		
    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();		
    $this->__requireStripLibrary();
    
    if( $this->status_id == 6){ // if user is subscribed
    	
			$this->status_id = 7; // limited   Cancel until the subscription runs out
			
			if( ! $this->__cancelSubscriptionStripeCharge( $this->status_id) ){
				
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);

				exit;
			}
			
			$this->server_response['snack'] = 'Your recurring ' . $this->typeOfPlan . ' subscription has been canceled.  Your last day of access will be ' . $this->nice_end_date;

			  	
    }elseif( $this->status_id == 5){ // starts
    	
    	$this->__deleteStarts();
    	
			$totalCredits = $this->userResultArray['promotion_credits'] +
											$this->userResultArray['paid_credits'] +
											$this->userResultArray['referral_credits'];
											
			$this->set_what_array['status_id'] = $this->status_id = ($totalCredits > $this->initialPromoCredits ? 2: 1);					
			$this->set_what_array['subscription_id'] = 0;
			$this->set_what_array['subscription_interval'] =  0;
			$this->set_what_array['stripe_plan'] = "";
			
			$this->server_response['snack'] = 'Sorry to see you go. Pending ' . $this->typeOfPlan . ' subscription charges have been canceled.';
		
			$this->server_response['hasCreditCardOnFile'] = $this->hasCreditCardOnFile;
			
			$this->server_response['creditArray'] = $this->__getList();		
			
    }elseif( $this->status_id == 9){ // transition
    	
    	$this->__deleteTransitions();
			$this->set_what_array['status_id'] = $this->status_id = 7;		
			
			$this->server_response['snack'] = 'Sorry to see you go. Pending transition to new ' . $this->typeOfPlan . ' plan has been canceled.';
			
    };
  	
		$this->users_model->updateUser( 
			$this->user_id, 
			$this->set_what_array 
		);

		$this->server_response['welcome'] =  $this->__getModalText(); 		
		$this->server_response['status'] = 'succeeded';
		$this->server_response['status_id'] = $this->status_id;
		
		if( isset( $this->stripe_subscription )){		
			$this->server_response['subscription'] = $this->stripe_subscription;
		};
		
		echo json_encode($this->server_response);
		
		$this->__emailmyself( $this->user_email . ' just canceled his subscription. User saw this: ' .  $this->server_response['snack'] );

	}
		 
		private function __cancelSubscriptionStripeCharge( $status ){

			try {
				
				$customer = Stripe\Customer::retrieve($this->stripe_customer_id);
				$this->stripe_subscription = $customer->subscriptions->retrieve($this->stripe_subscription_id)->cancel(array("at_period_end" => true ));

				$this->set_what_array['subscription_end_request'] = date('Y-m-d');
				$this->set_what_array['status_id'] = $status;
				
				if( $this->subscription_interval == 1 ){  // monthly
					
					$this->set_what_array['subscription_end'] = $this->subscription_end = $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['endDate'];
					$this->nice_end_date = $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['niceEndDate'];
					$this->nextStartBillDate = $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['nextStartBillDate'];
					$this->nextStartBillNiceDate = $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['nextStartBillNiceDate'];
					
					if( $status == 9){  // RELEVANT ONLY TO TRANSITION
						$this->from_interval = 1;	
						$this->to_interval = 2;
					}
					
				}else{  // yearly
					
					$this->set_what_array['subscription_end'] = $this->subscription_end = $this->__getTimeLeftInYearlySubscription($this->userResultArray)['endDate'];
					$this->nice_end_date = $this->__getTimeLeftInYearlySubscription($this->userResultArray)['niceEndDate'];
					$this->nextStartBillDate = $this->__getTimeLeftInYearlySubscription($this->userResultArray)['nextStartBillDate'];
					$this->nextStartBillNiceDate = $this->__getTimeLeftInYearlySubscription($this->userResultArray)['nextStartBillNiceDate'];
					
					if( $status == 9){ // RELEVANT ONLY TO TRANSITION
						$this->from_interval = 2;
						$this->to_interval = 1;
					}
					
				};
				
				
				$this->server_response['status'] = 'success';
				
				return true;

			} catch (\Stripe\Error\ApiConnection $e) {
			    // Network problem, perhaps try again.
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\InvalidRequest $e) {
			    // You screwed up in your programming. Shouldn't happen!
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\Api $e) {
			    // Stripe's servers are down!
				$this->__stripe_error( $e );
				
				return false;
			} catch( Stripe\Error\Card $e) {
				$this->__stripe_error( $e );
				
				return false;
			}
		}
  	
	  private function __deleteStarts(){
			$this->__setStartsModel();
				$where_array = array(
					'id' => $this->user_start_id
				);
			$this->starts_model->deleteStart( $where_array );
			$this->set_what_array['start_id'] = 0;
			$this->set_what_array['subscription_start'] = 0;
			
		}
  	
	  private function __updateStarts(){
	  	
			$this->__setStartsModel();
			
			$where_array = array(
				'stripe_plan' => $this->new_stripe_plan,
				'subscription_interval' => $this->new_subscription_interval,
				'price' => $this->new_price
			);

			$this->starts_model->updateStart( $primary_key = $this->user_start_id, $where_array );	
			
		}
		
	public function switchPlan() {

    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();		
    $this->__requireStripLibrary();
    $this->__setSubscriptionModel();

		$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionWhere(array(
			'id' => $this->user_subscription_id
		));    
		    
    if( $this->status_id == 6){	// subscribed
			
			$this->server_response['array'] = $this->subscriptionsArray;    	
    	
	    $this->server_response['status_id'] = $this->status_id = 9; // transition
			
			if( ! $this->__cancelSubscriptionStripeCharge( $this->status_id) ){
				
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);

				exit;
			}
			
			$this->__addToTransitionQueue();
			
			$from = ( $this->to_interval == 1 ? 'yearly' :  'monthly');
			$to = ( $this->to_interval == 1 ? 'monthly' : 'yearly' );
			$this->server_response['snack'] = 'Your subscription plan will be changed from '. $from .' to ' . $to . ' on ' . $this->nextStartBillNiceDate;    	
			$this->server_response['switchPrice'] = ( $this->subscription_interval == 1 ? $this->subscriptionsArray['yearly']: $this->subscriptionsArray['monthly']);
			$this->server_response['subscription_interval'] = $this->subscription_interval;
			
    } elseif( $this->status_id == 9 ){ // transition
    	
    	
			if( ! $this->__resubscribeSubscriptionStripeCharge() ){
				
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);

				exit;
			}
    	
    	$this->__deleteTransitions();
    	$this->server_response['status_id'] = $this->status_id = 6;
			$typeOfplan = ( $this->subscription_interval == 1 ? 'monthly' : 'yearly' );
			$this->server_response['switchPrice'] = ( $this->subscription_interval == 1 ? $this->subscriptionsArray[0]['subscription_monthly']: $this->subscriptionsArray[0]['subscription_yearly']);
    	$this->server_response['snack'] = 'You are now back on a ' . $typeOfplan . ' plan.';	
    	$this->server_response['subscription_interval'] = $this->subscription_interval;	
    	
    } elseif( $this->status_id == 5 ){ // starts
    	
			$this->new_subscription_interval 
				= $this->server_response['subscription_interval'] 
				= $this->subscription_interval 
				= $this->set_what_array['subscription_interval']
				= ( $this->subscription_interval == 1 ? 2 : 1 );

			$this->new_stripe_plan = $this->set_what_array['stripe_plan'] = ( $this->new_subscription_interval == 1 ? $this->subscriptionsArray['stripe_monthly_plan']: $this->subscriptionsArray['stripe_yearly_plan']);
			$this->new_price = $this->server_response['new_price'] = ( $this->new_subscription_interval == 1 ? $this->subscriptionsArray['monthly']: $this->subscriptionsArray['yearly']);
			$this->server_response['switchPrice'] = ( $this->new_subscription_interval == 1 ? $this->subscriptionsArray['yearly']: $this->subscriptionsArray['monthly']);
			$this->server_response['typeOfplan'] = $typeOfplan  = ( $this->new_subscription_interval == 1 ? 'monthly': 'yearly');

    	$this->__updateStarts();
    	
    	$this->server_response['status_id'] = $this->status_id = 5;
    	$this->server_response['snack'] = 'You will switch to a new ' . $typeOfplan . ' plan on ' . $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['nextStartBillNiceDate'];	
  
    		
    };
    
		$this->users_model->updateUser( 
			$this->user_id, 
			$this->set_what_array 
		);

		$this->server_response['status'] = 'succeeded';
		if( isset($this->stripe_subscription)) $this->server_response['subscription'] = $this->stripe_subscription;
		$this->server_response['welcome'] =  $this->__getModalText(); 
		
		sleep(1);
		
		echo json_encode($this->server_response);

	}

	public function processStartsQueue() {
		
		$this->__requireStripLibrary();	
		$this->__setStartsModel();
		$this->__setUsersModel();
		
		$today = date("Y-m-d");
		
		$email_content = 'today is: '. $today . '<br>';

		$this->startsArray = $this->starts_model->getAllStartsWhere( array(
			'when =' =>  $today,
			'processed' => 0
		));
		
		if( $this->startsArray == 0 ) {
			echo "None today but these are pending: <br />";
			echo '<pre>';print_r(  
			$this->pendingArray = $this->starts_model->getAllStartsWhere( array(
					'when >' =>  $today,
					'processed' => 0
				))
			 );echo '</pre>'; 
			 
			$email_content  .= '<br>' . 'Pending transactions : ' . $this->pendingArray['count'];
			 
			echo "These were processed: <br />";
			echo '<pre>';print_r(  
			$this->starts_model->getAllStartsWhere( array(
					'processed' => 1
				))
			 );echo '</pre>';
			  
		} else{
			echo "Starts: This following will be processed today, " . $today . ":";
			echo '<pre>';print_r(  $this->startsArray['results'] );echo '</pre>'; 
			$email_content  .= '<br>' . 'Starts transactions were attempted today: ' . $this->startsArray['count'];
		}
		
		if( isset( $this->startsArray['results'] ) ){
			foreach( $this->startsArray['results'] as $start){
	
				$this->stripe_customer_id = $start['stripe_customer_id'];
				$this->user_id = $start['user_id'];
				$this->plan = $start['stripe_plan'];
				$this->subscription_id = $start['subscription_id'];
				$this->subscription_interval = $start['subscription_interval'];
				
				
				if( $this->__subscriptionStripeCharge()){
					
					$this->starts_model->updateStart( $start['id'], array(
						'processed' => 1
					));
					
					$this->users_model->updateUser( 
						$this->user_id, 
						$this->set_what_array
					);
		
					$this->__sendInvoice();
					$email_content  .= '<br>' . $this->addTo .' User_id: ' . $this->user_id . ' charged for ' . $this->plan;
							
								
				}else{
					$email_content  .= '<br>' . 'XXX Stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Error is: ' . $this->server_response['error_message'] . ' Decline is: ' . $this->server_response['decline_code'];
					$declined_ids[] = $this->user_id;
				}
				
			}
		}
		
		$email_content .= '<br>-----------------------------------------------------------';
		
		
		
		$this->__setMessagesModel();
		$this->__setUsersModel();
		if( isset($declined_ids) ){
			foreach( $declined_ids  as  $idx => $id ){
	
				$whereArray =array(
						'id' => $id
				);
				
				$this->resultArray = $this->users_model->getUserWhere( $whereArray );	
				
				$this->message_id = 22; // email about bad credit card
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				$this->template_id = $this->messageArray['sendgrid_template_id'];
				
				$this->addTo = $this->resultArray['email'];
				$this->setFrom = "admin@pictographr.com";
				$this->setSubject = $this->messageArray['email_subject'];
				$email_html = $this->messageArray['email_html'];
				$email_html =  str_replace('-given_name-', $this->resultArray['given_name'], $email_html);
				$email_html =  str_replace('-subcription_interval-', ( $this->resultArray['subscription_interval'] == 1 ? 'monthly' : 'yearly' ) , $email_html);
				
				$this->setHtml = $this->setText = $email_html;
			
				$this->__sendgrid();
				
				$email_content .= '<br>' . $this->resultArray['email'].  ' had a credit problem during Starts.  Stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $id;
	
			}
		}
		
		
		$this->__emailmyself($email_content, 'Starts Transactions today' );

	}	
	
	public function processTransitionsQueue() {
		
		$this->__requireStripLibrary();	
		$this->__setTransitionsModel();
		$this->__setUsersModel();
		
		$today = date("Y-m-d");
		
		$email_content = 'today is: '. $today . '<br>';

		$this->transitionsArray = $this->transitions_model->getAllTransitionsWhere( array(
			'when =' =>  $today,
			'processed' => 0
		));
		
		if( $this->transitionsArray == 0 ) {
			echo "None today but these are pending: <br />";
			echo '<pre>';print_r(  
			$this->pendingArray = $this->transitions_model->getAllTransitionsWhere( array(
					'when >' =>  $today,
					'processed' => 0
				))
			 );echo '</pre>'; 
			 
			$email_content  .= '<br>' . 'Pending transactions : ' . $this->pendingArray['count'];
			 
			echo "These were processed: <br />";
			echo '<pre>';print_r(  
			$this->transitions_model->getAllTransitionsWhere( array(
					'processed' => 1
				))
			 );echo '</pre>';
			 
			   
		} else{
			echo "Transitions: This following will be processed today, " . $today . ":";
			echo '<pre>';print_r(  $this->transitionsArray['results'] );echo '</pre>'; 
			$email_content  .= '<br>' . 'Transitions transactions were attempted today: ' . $this->transitionsArray['count'];
		}
		
		if( isset( $this->transitionsArray['results'] ) ){
			foreach( $this->transitionsArray['results'] as $transition){
	
				$this->stripe_customer_id = $transition['stripe_customer_id'];
				$this->user_id = $transition['user_id'];
				$this->plan = $transition['stripe_plan'];
				$this->subscription_id = $transition['subscription_id'];
				$this->subscription_interval = $transition['to_interval'];
	
				if( $this->__subscriptionStripeCharge()){
					
					$this->transitions_model->updateTransition( $transition['id'], array(
						'processed' => 1
					));
					
					$this->users_model->updateUser( 
						$this->user_id, 
						$this->set_what_array
					);
					
					$this->__sendInvoice();	
					$email_content  .= '<br>' . $this->addTo .' User_id: ' . $this->user_id . ' charged for ' . $this->plan;
				}else{
					$email_content  .= '<br>' . 'XXX Stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Error is: ' . $this->server_response['error_message'] . ' Decline is: ' . $this->server_response['decline_code'];
					$declined_ids[] = $this->user_id;
				}
	
				
			}
		}
		
		$email_content .= '<br>-----------------------------------------------------------';
		
		$this->__setMessagesModel();
		$this->__setUsersModel();
		
		if( isset($declined_ids) ){
			foreach( $declined_ids  as  $idx => $id ){
	
				$whereArray =array(
						'id' => $id
				);
				
				$this->resultArray = $this->users_model->getUserWhere( $whereArray );	
				
				$this->message_id = 22; // email about bad credit card
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				$this->template_id = $this->messageArray['sendgrid_template_id'];
				
				$this->addTo = $this->resultArray['email'];
				$this->setFrom = "admin@pictographr.com";
				$this->setSubject = $this->messageArray['email_subject'];
				$email_html = $this->messageArray['email_html'];
				$email_html =  str_replace('-given_name-', $this->resultArray['given_name'], $email_html);
				$email_html =  str_replace('-subcription_interval-', ( $this->resultArray['subscription_interval'] == 1 ? 'yearly' : 'monthly'  ) , $email_html);
				
				$this->setHtml = $this->setText = $email_html;
				$this->__sendgrid();
				$email_content .= '<br>' . $this->resultArray['email'].  ' had a credit problem during Transitions.  Stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $id;
	
			}			
		};

		
		$this->__emailmyself($email_content, 'Transitions Transactions today' );
		
	}	  	
	  	
	  private function __deleteTransitions(){
			$this->__setTransitionsModel();
				$where_array = array(
					'id' => $this->user_transition_id
				);
			$this->transitions_model->deleteTransition( $where_array );
    	
			$this->set_what_array['transition_id'] = 0;

		}
	
	  private function __addToTransitionQueue(){
	  	
			$this->__setTransitionsModel();
			$this->__setSubscriptionModel();
			
			$resultArray = $this->transitions_model->getTransitionWhere( array(
				'user_id' => $this->user_id,
				'processed' => 0
			));
			
			if( $resultArray == 0){
			
				$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionWhere(array(
					'id' => $this->user_subscription_id
				));
				
				$when = $this->nextStartBillDate;  // START NEW PLAN WITH THE OLD ONE ENDS
	
				$insert_array = array(
					'user_id' => $this->user_id,
					'when' => $when,
					'name' => $this->user_name,
					'email' => $this->user_email,
					'market_id' => $this->user_market_id,
					'market_name' => $this->user_market_name,
					'stripe_customer_id' => $this->stripe_customer_id,
					'stripe_plan' => ( $this->to_interval == 1 ? $this->subscriptionsArray['stripe_monthly_plan']: $this->subscriptionsArray['stripe_yearly_plan']),
					'subscription_id' => $this->user_subscription_id,
					'from_interval' => $this->from_interval,
					'to_interval' => $this->to_interval
				);
					
				$this->transition_id = $this->transitions_model->insertTransition( $insert_array );
				
				$this->set_what_array['subscription_end'] = $when;
				$this->set_what_array['status_id'] = $this->status_id = 9; // transition
				$this->set_what_array['transition_id'] = $this->transition_id;
				
				$this->server_response['insert_array'] = $insert_array;
				
			}
	  }
	  
	  
	public function remindExpireDate(){ // hello
		
		// 40 1 * * *  /usr/bin/php /var/www/pictographr/index.php payment remindExpireDate trial_end 1 >/dev/null 2>&1
		// 50 1 * * *  /usr/bin/php /var/www/pictographr/index.php payment remindExpireDate subscription_end 1 >/dev/null 2>&1
		
		$this->__setMessagesModel();
		
		$this->whichReminder = $this->uri->segment(3);
		$this->daysBeforeEnd = $this->uri->segment(4);
		
		$date = new DateTime("now");
		$date->modify("+" . $this->daysBeforeEnd ." day");
		
		$this->__setUsersModel();

		$whereArray[$this->whichReminder] = $date->format('Y-m-d');
		$whereArray['unsubscribe'] = 0;

		$users = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "id", "asc", -1 );
		
		if( $users == 0 )  {
			echo "There is no records.";
			return;
		}
		
		foreach( $users as $user){
			
			$this->user_email = $user['email'];
			$this->user_given_name = $user['given_name'];
			$this->theEnd = $user[$this->whichReminder];
			$date = new DateTime($this->theEnd);
			$this->niceEndDate = $date->format('F d, Y');
			
			switch ( $this->whichReminder ) {
				
			  case 'trial_end':
			  	$this->message_id = 19;
			  	$this->whatIsExpiring = 'trial';
				break;
	
			  case 'subscription_end':
			  	$this->message_id = 20;
			  	$this->whatIsExpiring = 'subscription';
				break;
				
			}
			
			$this->__sendFriendlyNotice();
			
			//$this->__emailmyself( 'sent expiration ' . $this->whichReminder . ' to : ' . $this->user_given_name );

		}	
		
	}
	
	  private function __sendFriendlyNotice(){

			$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
			$this->template_id = $this->messageArray['sendgrid_template_id'];
			
			$this->addTo = $this->user_email;
			$this->setFrom = "admin@pictographr.com";
			
			$replace_whats['-niceEndDate-'] =  $this->niceEndDate;
			$replace_whats['-given_name-'] = $this->user_given_name;
			$replace_whats['-daysBeforeEnd-'] = $this->daysBeforeEnd;
			$replace_whats['-whatIsExpiring-'] = $this->whatIsExpiring;


			$this->setSubject = $this->__customizeMessage( $this->messageArray['email_subject'], $replace_whats );
			$this->setText = $this->__customizeMessage( $this->messageArray['email_text'], $replace_whats );
			$this->setHtml = $this->__customizeMessage( $this->messageArray['email_html'], $replace_whats );
			
			//echo $this->whichReminder."<br />";
			//echo $this->niceEndDate."<br />";
			//echo $this->setSubject."<br />";
			// echo $this->setHtml."<br />";
			//echo $this->user_email."<br />";
			//echo "-----------------------------------------------------------"."<br />";;
	
			$this->__sendgrid();
			
//			$this->__emailmyself( 
//				$this->__customizeMessage( $this->messageArray['email_html'], $replace_whats ),   
//				$this->__customizeMessage( $this->messageArray['email_subject'], $replace_whats )
//			);
			
			
		}

	
	public function processStartsTest() {
		
		$this->__requireStripLibrary();	
		$this->__setStartsModel();
		$this->__setUsersModel();
		
		date_default_timezone_set('America/Los_Angeles');
		$time = time();
		echo date('m/d/y h:i a', $time). "<br />";
		
		$today = date("Y-m-d");
		
		echo "today is: " . $today . "<br />";

		$this->startsArray = $this->starts_model->getAllStartsWhere( array(
			'when =' =>  $today,
			'processed' => 0
		));
		
		if( $this->startsArray == 0 ) {
			echo "None today but these are pending: <br />";
			echo '<pre>';print_r(  
			$this->starts_model->getAllStartsWhere( array(
					'when >' =>  $today,
					'processed' => 0
				))
			 );echo '</pre>'; 
			 
			echo "These were processed: <br />";
			echo '<pre>';print_r(  
			$this->starts_model->getAllStartsWhere( array(
					'processed' => 1
				))
			 );echo '</pre>';
			 exit;  
		} else{
			echo "Starts: This following were processed today, " . $today . ":";
			echo '<pre>';print_r(  $this->startsArray['results'] );echo '</pre>'; 
		}

	}		  	
	  	  	
	public function update() {	
		
    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();		
    $this->__requireStripLibrary();
		
		if( $this->__updateStripeCustomer() ){
			$this->server_response['snack'] = 'Your payment information has been updated.';
			$this->server_response['status_id'] = $this->status_id;
			$this->server_response['status'] = 'succeeded';			
		}else{
			
			echo json_encode($this->server_response);
			$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);

			exit;	
		};

		echo json_encode($this->server_response);
		
	}
		
	  protected function __updateStripeCustomer(){
	  	
			try {
	
				$this->customer = Stripe\Customer::retrieve($this->stripe_customer_id);
				
				$this->customer->source = $this->token;
				
				$this->customer->save();
				
				$this->server_response['customer'] = $this->customer;
				
				$this->server_response['status'] = 'success';
				
				return true;

			} catch (\Stripe\Error\ApiConnection $e) {
			    // Network problem, perhaps try again.
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\InvalidRequest $e) {
			    // You screwed up in your programming. Shouldn't happen!
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\Api $e) {
			    // Stripe's servers are down!
				$this->__stripe_error( $e );
				
				return false;
			} catch( Stripe\Error\Card $e) {
				$this->__stripe_error( $e );
				
				return false;
			}
	  }

	public function resubscribe() {

    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();		
    $this->__requireStripLibrary();		

		if( ! $this->__resubscribeSubscriptionStripeCharge() ){
			
			echo json_encode($this->server_response);
			exit;
		}
		
		$this->users_model->updateUser( 
			$this->user_id, 
			$this->set_what_array 
		);	
		
		$this->server_response['status_id'] = $this->status_id;
		$this->server_response['status'] = 'succeeded';
		$this->server_response['subscription'] = $this->stripe_subscription;
		$this->server_response['stripe_subscription_id'] = $this->stripe_subscription_id ;
		$this->server_response['snack'] = 'Your recurring subscription has been reactivated.  Thank you.';
		$this->server_response['welcome'] =  $this->__getModalText(); 
		
		echo json_encode($this->server_response);
		
		$this->__emailmyself( $this->user_email . ' just resubscribed his subscription. User saw this: ' .  $this->server_response['snack'] );

	}
	
		private function __resubscribeSubscriptionStripeCharge(){

					try {
						
						$customer = Stripe\Customer::retrieve($this->stripe_customer_id);
						$this->stripe_subscription = $customer->subscriptions->retrieve($this->stripe_subscription_id);
						
						$this->__setSubscriptionModel();
						$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($this->user_market_id);
						
						$stripe_monthly_plan = $this->subscriptionsArray[0]['stripe_monthly_plan'];
						$stripe_yearly_plan = $this->subscriptionsArray[0]['stripe_yearly_plan'];
						
						if( $this->subscription_interval == 1){
							$this->plan = $stripe_monthly_plan;
						}else{
							$this->plan = $stripe_yearly_plan;
						};
						
						$this->stripe_subscription->plan = $this->plan;
						$this->stripe_subscription->save();
						
						$this->set_what_array['status_id'] = $this->server_response['status_id'] = $this->status_id = 6; // subscribed again
						$this->set_what_array['subscription_end'] = '0000-00-00 00:00:00';
						$this->set_what_array['subscription_end_request'] = '0000-00-00 00:00:00';
						
						$this->server_response['status'] = 'success';
						
						return true;

					} catch (\Stripe\Error\ApiConnection $e) {
					    // Network problem, perhaps try again.
				    $e_json = $e->getJsonBody();
				    $error = $e_json['error'];
				    $this->server_response['error_message'] = $error['message'];
		    		$this->server_response['decline_code'] = ( isset( $error['decline_code'] ) ? $error['decline_code'] : '' );
						
						return false;
					} catch (\Stripe\Error\InvalidRequest $e) {
					    // You screwed up in your programming. Shouldn't happen!
				    $e_json = $e->getJsonBody();
				    $error = $e_json['error'];
				    $this->server_response['error_message'] = $error['message'];
		    		$this->server_response['decline_code'] = ( isset( $error['decline_code'] ) ? $error['decline_code'] : '' );
						
						return false;
					} catch (\Stripe\Error\Api $e) {
					    // Stripe's servers are down!
				    $e_json = $e->getJsonBody();
				    $error = $e_json['error'];
				    $this->server_response['error_message'] = $error['message'];
		    		$this->server_response['decline_code'] = ( isset( $error['decline_code'] ) ? $error['decline_code'] : '' );
						
						return false;
					} catch( Stripe\Error\Card $e) {
				    $e_json = $e->getJsonBody();
				    $error = $e_json['error'];
				    $this->server_response['error_message'] = $error['message'];
		    		$this->server_response['decline_code'] = ( isset( $error['decline_code'] ) ? $error['decline_code'] : '' );
						
						return false;
					}
		}			
		
		private function __oneTimeStripeCharge(){
			
			try {
	
				$charge = Stripe\Charge::create(array(
				  "amount" => 1000, # amount in cents
				  "currency" => "usd",
				  "customer" => $this->stripe_customer_id)
				);
				
				
				$this->server_response['status'] = 'success';
				
				return true;
			  
			} catch (\Stripe\Error\ApiConnection $e) {
			    // Network problem, perhaps try again.
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\InvalidRequest $e) {
			    // You screwed up in your programming. Shouldn't happen!
				$this->__stripe_error( $e );
				
				return false;
			} catch (\Stripe\Error\Api $e) {
			    // Stripe's servers are down!
				$this->__stripe_error( $e );
				
				return false;
			} catch( Stripe\Error\Card $e) {
				$this->__stripe_error( $e );
				
				return false;
			}
		}

	public function creditform(){
		
	?>
	<head>
		<link rel="stylesheet" type="text/css" href="../js/lib/bootstrap/bootstrap.min.css"/>
		<link rel="stylesheet" type="text/css" href="../js/lib/material/material-wfont.css"/>
		<link rel="stylesheet" type="text/css" href="../js/lib/material/material.css"/>
	  <link rel="stylesheet" href="../js/lib/fontawesome/font-awesome.min.css">
		<link rel="stylesheet" type="text/css" href="https://netdna.bootstrapcdn.com/font-awesome/3.0.2/css/font-awesome.css"/>
		<script src="../js/lib/jquery/jquery.min.js"></script>
		<script src="../js/lib/bootstrap/bootstrap.min.js"></script>
		<script src="../js/lib/material/ripples.min.js"></script>
		<script src="../js/lib/material/material.min.js"></script>
		<script type="text/javascript" src="https://js.stripe.com/v2/"></script>	
		
		<style>	
		.oh,.ot,.tt{float:left;padding:0 2% 2% 0;width:48%}.ot{width:31%}.tt{width:65%}.cl{clear:both}
		#cc_form_wrapper{
			color: gray;	
		}
		#cc_form_wrapper label{
			font-weight: 300;
		}	
		#cc_form_wrapper > div{
			margin: 10px 0;
			min-height: 34px;
		}
		#cc_form_wrapper #cc-title{
			font-weight: 300;
			font-size:24px; 
		}
		#cc_form_wrapper #addcc{
		width:216px;
		position:relative;
		float: right;
		}
		#cc_form_wrapper #cc_logo{
			position: absolute;
			top: 32px;
			right: 1px;	
		}
		#cc_form_wrapper #cc_cvc{
			position: absolute;
			top: 80px;
			right: 1px;
		}
		#cc_form_wrapper table{
			    margin: 0px 0 18px;
		}	
		#cc_form_wrapper #cc_submit{
			position: relative;
		}
		#cc_form_wrapper #cc-button-wrapper button{
			width: auto;
			margin: 0 auto;
			height: auto;
			display: block;
		}

		</style>		
	</head>
	<body>
		<div   style='padding: 25px;background: ivory; margin:100px; width: 400px; height: 320px'  >
			<form action="" method="POST" id="payment-form">
				<div  id="cc_form_wrapper" class="form-control-wrapper">
					<div>
						<span  id="cc-title" >Payment</span><img  id="addcc"  src="../img/allcc.png">
					</div>
					<div>
						<input class="form-control empty" placeholder="Full Name"   value="John Doe">
					</div>
					<div>
						<input class="form-control empty" placeholder="Credit Card Number"   data-stripe="number" value="4242424242424242">
					</div>
					<div>
						<table>
							<tr>
								<td>
									<div class="oh">
										<input class="form-control empty" placeholder="Month"   data-stripe="exp-month" value="12">
									</div>
									<div class="oh">
										<input class="form-control empty" placeholder="Year"   data-stripe="exp-year"  value="2018">
									</div>	
								</td>
								<td   style="padding: 0 0 5px 0"  >
									<input class="form-control empty" placeholder="CVC"  data-stripe="cvc"    value="123">
								</td>
							</tr>
						</table>
					</div>
				  <div>
				  	<div  class="ot">
					    <label style='float:right'  >
					      <span>Plan&nbsp;&nbsp;&nbsp;</span>
					     </label>
				  	</div>
				  	<div  class="tt">
						  <input type='radio' id='interval_1' checked name='interval' value='1' />&nbsp;Monthly&nbsp;&nbsp;
						  <input type='radio' id='interval_2' name='interval' value='2' />&nbsp;Yearly
				  	</div>
				  </div>
					<div  id="cc-button-wrapper"  >
						<button  id="cc_submit"  type="submit"  class="btn btn-primary ">Subscribe</button>
					</div>
				</div>
			</form>
		</div>		
	</body>
	<script>
		
		var tools = {
					ajax:	function(	url, arrDataObj, type, callback	)	{
						
						$.ajax({
							url: url + '?v=' + Math.random(),
							type:	type,
					    data: {
					     arrData : arrDataObj
					    },
							dataType:'json',
							success: function(data){
								//console.log('success');
								//console.log(JSON.stringify(  data   , null, 2 ));
								callback(data);
							},
							error:	function(data){
								console.log('error');
								console.log(JSON.stringify(  data   , null, 2 ));
								callback(data);
							},
							async:true
						});
					}
				},
				stripeResponseHandler = function(status, response) {
		
					console.log(JSON.stringify(  response   , null, 2 ));
					
					if( typeof( response.error ) != 'undefined'){
					}else{
					
						var postObj = {
									'token': response.id
								},
								url = 'createCustomer';
							
						tools.ajax(url, postObj, 'post', function(obj) {

							if( obj.status == 'succeeded'){
								console.log(JSON.stringify(  obj   , null, 2 ));
							} else{
								
								$('#payment-form').find('button').prop('disabled', false);
								$('#payment-form').find('button').removeAttr("disabled");
								app.methods.loading.off('C');
								app.methods.progressBar.stop('subscribe2');
								app.methods.modal.canDisable = true;
								
								toast(obj.error_message, 'keep', false, 'error', 'Something went wrong.');
								
							};

						});
											
					};
					
				};
		
		Stripe.setPublishableKey('pk_test_Lu4B8GHyOrFcVL5DmxA5EXwc');

		$('#payment-form').submit(function(e) {
		
		 var $form = $(this);
		 $form.find('button').prop('disabled', true);
		 $form.find('button').attr("disabled", "disabled");
		 Stripe.card.createToken($form, stripeResponseHandler);
		 return false;
		 
		});
		
	</script>
	
	<?php 	
	}
	
	public function testit(){

			$date = new DateTime("now");
			$endDate = $date->format('Y-m-d');
			echo $endDate."<br />";
	 
	}
	
	public function tryit(){
		if($this->__emailmyself('hello world') ){
			
		}else{
			
		};
		echo '<pre>';print_r( $this->server_responseobj );echo '</pre>';  exit;
		
	}
	
	
}
