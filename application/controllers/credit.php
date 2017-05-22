<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Credit extends Base_Controller {
	
	protected $dbGroup;
	
	public function __construct() { 
		
		parent::__construct();
	}
			
	public function getAccountData(){
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		$this->__setSubscriptionModel();
		$this->__setMarketsModel();
		$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($this->user_market_id);

		$subscription_monthly = $this->subscriptionsArray[0]['subscription_monthly'];
		$subscription_yearly = $this->subscriptionsArray[0]['subscription_yearly'];
		
		$this->accountsData['subscription_interval'] = $this->subscription_interval;
		$this->accountsData['status_id'] = $this->status_id;
		$this->accountsData['niceTrialEndDate'] = $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['niceEndDate'];

		$this->accountsData['pricing'] = array(
				'monthly' => $subscription_monthly,
				'yearly' => $subscription_yearly,
			);
			
		$this->accountsData['curPrice'] = $this->curPrice = ( $this->subscription_interval == 1 ? $this->subscriptionsArray[0]['subscription_monthly']: $this->subscriptionsArray[0]['subscription_yearly']);
		$this->accountsData['switchPrice'] = ( $this->subscription_interval == 1 ? $this->subscriptionsArray[0]['subscription_yearly']: $this->subscriptionsArray[0]['subscription_monthly']);
			
		if( in_array($this->status_id, array(1, 2, 4, 5))){
			$this->accountsData['marketsArray'] = $this->markets_model->getMarketWhere( array( 'id' => $this->user_market_id));
			$this->accountsData['creditArray'] = $this->__getList();				
		};
		
		$this->accountsData['hasCreditCardOnFile'] = $this->hasCreditCardOnFile;
		
		$modal_text = $this->__getModalText();
		$this->accountsData['welcome'] = $modal_text;

		if( $this->__promoCodeExistfor( $this->user_id ) ){
			$promocode = $this->promoArray['code'];
			$promoexpires = $this->promoArray['reserve_expiration_date'];
			$promoexpiresDate = new DateTime($promoexpires);
			$nicePromoExpiresDate = $promoexpiresDate->format('M d, Y');	
		}else{
			$promocode = 'None';
			$nicePromoExpiresDate = 'Future';
		};
		
		$this->marketsArray = $this->markets_model->getMarketWhere( array( 'id' => $this->user_market_id));
		$promo_message2 = $this->marketsArray['promo_message2'];
		$promo_message2 =  str_replace('-promo-code-', $promocode, $promo_message2);
		$promo_message2 =  str_replace('-expires-', $nicePromoExpiresDate, $promo_message2);
		
			
		$this->accountsData['promo_message2'] = $promo_message2;
		
		
		
		
		$this->accountsData['message_id'] = $this->message_id;
		
		
		$this->accountsData['timeLeftArr'] =  $this->__getTimeLeftInMonthlySubscription($this->userResultArray);
		
		$this->accountsData['google_id from encryption'] =  $this->__getSessionGoogleId();
		
		if( !$this->__getSessionGoogleId() ){
			$this->accountsData['booling'] =  'no google id';
		}else{
			$this->accountsData['booling'] =  'there is a google id';
			$this->accountsData['google_id from encryption'] =  $this->__getSessionGoogleId();
		};
		
		echo json_encode( $this->accountsData );
			
	}
		
		protected function __getModalText(){	
			$this->__setMessagesModel();			
			if(  in_array($this->status_id, array(1, 2)) ){
				$this->message_id = 9; //Left in trial
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				
				$modal_text = $this->messageArray['modal_text'];
				$date = new DateTime($this->trial_start);
				$trial_start = $date->format('F d, Y');
				
				$date = new DateTime($this->trial_end);
				$trial_end = $date->format('F d, Y');			
				
				$daysFromToday = ( $this->howManyDaysLeft > 1 ? " in " . $this->howManyDaysLeft . " days": "today");
				
				if( $this->howManyDaysLeft == 1 ){
					$daysFromToday = "tomorrow";					
				};
	
				$modal_text =  str_replace('-given_name-', $this->user_given_name, $modal_text);
				$modal_text =  str_replace('-days_from_today-', $daysFromToday, $modal_text);
				$modal_text =  str_replace('-trial_start-', $trial_start, $modal_text);
				$modal_text =  str_replace('-trial_end-', $trial_end, $modal_text);
								
			}elseif( $this->status_id == 5){
				
				$this->message_id = 11; //transition
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				
				$modal_text = $this->messageArray['modal_text'];
				$niceStartDate =  $this->subscription_interval == 1 ? 
															$this->__getTimeLeftInMonthlySubscription($this->userResultArray)['niceStartDate'] : 
															$this->__getTimeLeftInYearlySubscription($this->userResultArray)['niceStartDate'];
															
				$subscriptionIntervalName  = ($this->subscription_interval == 1 ? "monthly": "yearly");

				$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($this->user_market_id);				
				$this->curPrice = ( $this->subscription_interval == 1 ? $this->subscriptionsArray[0]['subscription_monthly']: $this->subscriptionsArray[0]['subscription_yearly']);
				
				$modal_text =  str_replace('-curPrice-', '$' . $this->curPrice, $modal_text);
				$modal_text =  str_replace('-given_name-', $this->user_given_name, $modal_text);
				$modal_text =  str_replace('-subscription-interval-name-', $subscriptionIntervalName, $modal_text);
				$modal_text =  str_replace('-subscription-start-date-', $niceStartDate, $modal_text);
						
			}elseif( $this->status_id == 6 || $this->status_id == 10 || $this->status_id == 11){
				
				$this->message_id = 10; //Good standing
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				
				$modal_text = $this->messageArray['modal_text'];
				$nextBillingCycle =  $this->subscription_interval == 1 ? 
															$this->__getTimeLeftInMonthlySubscription($this->userResultArray)['nextStartBillNiceDate'] : 
															$this->__getTimeLeftInYearlySubscription($this->userResultArray)['nextStartBillNiceDate'];
															
				$subscriptionIntervalName  = ($this->subscription_interval == 1 ? "monthly": "yearly");
				$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($this->user_market_id);				
				$this->curPrice = ( $this->subscription_interval == 1 ? $this->subscriptionsArray[0]['subscription_monthly']: $this->subscriptionsArray[0]['subscription_yearly']);
				
				$modal_text =  str_replace('-curPrice-', '$' . $this->curPrice, $modal_text);
				$modal_text =  str_replace('-given_name-', $this->user_given_name, $modal_text);
				$modal_text =  str_replace('-subscription-interval-name-', $subscriptionIntervalName, $modal_text);
				$modal_text =  str_replace('-next-billing-cycle-', $nextBillingCycle, $modal_text);
						
			}elseif( $this->status_id == 4){
				
				$this->message_id = 12; // Trial has expired
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				
				$modal_text = $this->messageArray['modal_text'];
				
				$date = new DateTime($this->trial_start);
				$trial_start = $date->format('F d, Y');
				$date = new DateTime($this->trial_end);
				$trial_end = $date->format('F d, Y');			
															
				$modal_text =  str_replace('-given_name-', $this->user_given_name, $modal_text);
				$modal_text =  str_replace('-nice-end-date-', $trial_end, $modal_text);
				$modal_text =  str_replace('-nice-start-date-', $trial_start, $modal_text);
						
			}elseif( $this->status_id == 7){
				
				$this->message_id = 13; // Limited cancel 
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				
				$modal_text = $this->messageArray['modal_text'];
				
				$date = new DateTime($this->subscription_start);
				$subscription_start = $date->format('F d, Y');
				$date = new DateTime($this->subscription_end);
				$subscription_end = $date->format('F d, Y');			
															
				$modal_text =  str_replace('-given_name-', $this->user_given_name, $modal_text);
				$modal_text =  str_replace('-nice-end-date-', $subscription_end, $modal_text);
				$modal_text =  str_replace('-nice-start-date-', $subscription_start, $modal_text);
						
			}elseif( $this->status_id == 8){
				
				$this->message_id = 14; // Limited cancel 
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				
				$modal_text = $this->messageArray['modal_text'];
				
				$date = new DateTime($this->subscription_start);
				$subscription_start = $date->format('F d, Y');
				$date = new DateTime($this->subscription_end);
				$subscription_end = $date->format('F d, Y');			
															
				$modal_text =  str_replace('-given_name-', $this->user_given_name, $modal_text);
				$modal_text =  str_replace('-nice-end-date-', $subscription_end, $modal_text);
				$modal_text =  str_replace('-nice-start-date-', $subscription_start, $modal_text);
						
			}elseif( $this->status_id == 9){
				
				$this->message_id = 15; // Transition
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				
				$modal_text = $this->messageArray['modal_text'];

				$date = new DateTime($this->subscription_end);
				$date->modify("+1 day");
				$subscription_end = $date->format('F d, Y');
				
				$fromPlan = ( $this->subscription_interval == 1 ? 'monthly' : 'yearly' );			
				$toPlan = ( $this->subscription_interval == 1 ? 'yearly' :  'monthly' );	
				
				$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($this->user_market_id);				
				$this->curPrice = ( $this->subscription_interval == 1 ? $this->subscriptionsArray[0]['subscription_monthly']: $this->subscriptionsArray[0]['subscription_yearly']);
				$this->switchPrice = ( $this->subscription_interval == 1 ? $this->subscriptionsArray[0]['subscription_yearly']: $this->subscriptionsArray[0]['subscription_monthly']);
				
				$modal_text =  str_replace('-curPrice-', '$' . $this->curPrice, $modal_text);		
				$modal_text =  str_replace('-switchPrice-', '$' . $this->switchPrice, $modal_text);		
				
				$modal_text =  str_replace('-from-plan-', $fromPlan, $modal_text);
				$modal_text =  str_replace('-to-plan-', $toPlan, $modal_text);
				$modal_text =  str_replace('-subscription-end-', $subscription_end, $modal_text);

						
			};
			
			return $modal_text;
		}
		
    /**
     * https://github.com/neo22s/emailvalidator/
     * gets the array of not allowed domains for emails, reads from json stores file for 1 week
     * @return array 
     * @see banned domains https://github.com/ivolo/disposable-email-domains/blob/master/index.json
     * @return array
     */
    private static function get_banned_domains(){
        //where we store the banned domains
        $file = 'banned_domains.json';
        //if the json file is not in local or the file exists but is older than 1 week, regenerate the json
        if (!file_exists($file) OR (file_exists($file) AND filemtime($file) < strtotime('-1 week')) )
        {
            $banned_domains = file_get_contents("https://rawgit.com/ivolo/disposable-email-domains/master/index.json");
            if ($banned_domains !== FALSE)
                file_put_contents($file,$banned_domains,LOCK_EX);
        }
        else//get the domains from the file
            $banned_domains = file_get_contents($file);
        return json_decode($banned_domains);
    }

		private function __referEach(){
			
				$response['email'] = $this->friend_email;
				
				if (!filter_var($this->friend_email, FILTER_VALIDATE_EMAIL)) {
				
					$response['status'] = 'notValidEmail';
					return $response;
					
				}
			
				if ( $this->friend_email == $this->user_email) {
				
					$response['status'] = 'isYourownEmail';
					return $response;
					
				}	
							
				$emailArray = explode("@", $this->friend_email);
				$domain = $emailArray[1];
				
				if( $domain != 'gmail.com'){
					
					$response['status'] = 'mustBeGmail';
					return $response;
					
				} elseif( $this->__referralexist(array(
						'user_id' => $this->user_id,
						'email' => $this->friend_email
				)) ){
								
					$response['status'] = 'alreadySent';
					return $response;
					
				} elseif( $this->__referreeRegistered(array(
						'email' => $this->friend_email
				))){
					
					$response['status'] = 'alreadyRegisterd';
					return $response;
					
				}

				$this->__addReferral();
		
				$this->message_id = 6; //refer a friend
				$this->__setMessagesModel();
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				
				/* THE FOLLOWING IS PULLED FROM THE HTML FORM*/
				//$this->setSubject = $_POST['setSubject']
	
				$this->addTo = $this->friend_email;
				$this->setFrom = $this->user_email;
				
				/*
					if there referrer is coming from https://pictographr.com/<some market> then include market in the link
					if referrer is coming from ad campaign https://pictographr.com/? track_id=X then only include the track_id in the link
				*/
				
				$email_html = $this->messageArray['email_html'];
				$email_html =  str_replace('-market_name-', !isset($_COOKIE['track_id']) && isset($_COOKIE['market_name']) && $_COOKIE['market_id'] != 1 ? '/' . $_COOKIE['market_name']: '', $email_html);
				$email_html =  str_replace('-&track_id=-', isset($_COOKIE['track_id']) ? '&track_id=' . $_COOKIE['track_id']:'', $email_html);
				
				$this->setHtml = $this->setText = $this->bodyText . $email_html;
	
				$this->subs = array (
				    "-myuser_name-" => array (
				        $this->user_name
				    ),
				    "-refer-" => array (
				        $this->code
				    )
				);
	
				$this->__sendgrid();
	
	
				$this->message_id = 5;  // We sent an email on your behalf
				$this->addTo = $this->user_email;
				$this->setFrom = "admin@pictographr.com";
				$this->subs = array (
				    "-friend_email-" => array (
				        $this->friend_email
				    ),
				    "-user_given_name-" => array (
				        $this->user_given_name
				    )
				);
	
				$this->__sendgrid();

				$response['status'] = 'successOneFriend';
				return $response;


				/*
				
						elseif (!checkdnsrr($domain, 'MX')) {  // http://stackoverflow.com/questions/12026842/how-to-validate-an-email-address-in-php
						    // domain is not valid
						
						} else
						
				*/		
		
		}
			
	public function refer(){ // http://pictographr.com/credit/refer
		
		// friend@yahoo.com,  friend2@yahoo.com, jm2015@yopmail.com, nguyenkim092990@gmail.com
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		$this->__setReferralsModel();
			
		$this->friend_email = str_replace(' ', '', $this->friend_email);
		
		if (strpos($this->friend_email, ',') !== false) {
			
			$this->friend_email_array = explode(",", $this->friend_email);
			
			foreach( $this->friend_email_array  as  $email){
				$this->friend_email = $email;
				$this->setSubject = $_POST['arrData']['setSubject'];
				$responses[] = $this->__referEach();
			}
			
			foreach( $responses  as $response){
				if( $response['status'] != 'successOneFriend'){
					$problem['email'] = $response['email'];
					$problem['status'] = $response['status'];
					$problems[] = $problem;
				}else{
					$goodEmails[] = $response['email'];
				};
			}
			
			if( isset($goodEmails) &&  isset( $problem )){
				echo json_encode(
						array(
							'problems' => $problems,
							'goodEmails' => $goodEmails,
							'status' => 'someGoodSomeBad'
						)		
				);		
			} elseif(  isset( $problem ) && count( $problems ) > 0){
				echo json_encode(
						array(
							'problems' => $problems,
							'status' => 'someBad'
						)		
				);						
			} else{
				echo json_encode(
						array(
							'status' => 'successManyFriends'
						)		
				);				
			};
			

							
		} else{
		
			echo json_encode($this->__referEach());	
				
		};
		
	}

		protected function __getList(){ // http://pictographr.com/credit/getList
		
			$this->__setReferralsModel();
			$this->__setPromosModel();
		
			$whereArray = array(
					'user_id' => $this->user_id
			);
		
			$this->referralArray = $this->referrals_model->getAllReferralsWhere( $whereArray )['results'];	
			$this->referralCount = $this->referrals_model->getAllReferralsWhere( $whereArray )['count'];	
	
			if( $this->referralArray == 0 ){
				$this->referralArray = [];
			}else{
				foreach( $this->referralArray as $key => $refer){
					if( $refer['registered'] != 0){
						$date = new DateTime($refer['registered']);
						$nicedate = $date->format('M d, Y');
						$this->referralArray[$key]['nicedate'] = $nicedate;						
					} else{
						$this->referralArray[$key]['nicedate'] = '--';
					};

				}				
			};
			
			$promo_array = $this->promos_model->getTrackFromLeftJoinedPromosForUser($this->user_id);
	
			if( $promo_array == 0){
				$promo_array = [];
			}else{
				foreach( $promo_array as $key => $promo){
					$date = new DateTime($promo['promo_when']);
					$nicedate = $date->format('M d, Y');
					$promo_array[$key]['nicedate'] = $nicedate;
				}						
			};
			
			if( $this->user_promo_bonus == 1){
				
				$promo_array[0]['merchant_name'] = '10-FRIEND-SIGNUP';
				$promo_array[0]['promo_code'] = '1YRPROMO';
				$promo_array[0]['nicedate'] = '------';
				
			};

	
			$whereArray = array(
					'user_id' => $this->user_id,
					'redeemed' => 1,
			);
		
			$this->creditedCount = $this->referrals_model->getAllReferralsWhere( $whereArray )['count'];	
		
			return array(
				'refer' => array(
						'list' => $this->referralArray,
						'count' => $this->referralCount,
						'earned' => $this->user_referral_credits
				),
				'promo'  => array(
						'list' => $promo_array,
						'earned' => $this->user_promotion_credits,
						'disablePromoButton' => ( $this->user_promotion_credits >= $this->user_market_max_promo ? true : false )
				),
				'total' => $this->user_referral_credits + $this->user_promotion_credits,
				'days' => ($this->user_referral_credits + $this->user_promotion_credits) * 7
			);
			
		}

		private function __referralexist($whereArray){
			
			$this->__setReferralsModel();
			
			$this->referralArray = $this->referrals_model->getReferralWhere( $whereArray );
			
			if( $this->referralArray != 0){
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}	
		
		private function __referreeRegistered($whereArray){
			
			$this->__setUsersModel();
			
			$this->resultArray = $this->users_model->getUserWhere( $whereArray );
			
			if( $this->resultArray != 0){
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
				
		private function __addReferral(){ // http://pictographr.com/credit/addReferral
		
			$this->__setReferralsModel();
			
			$this->code = $this->__get_random_string(8);
			
			$this->set_array = array(
				'user_id' => $this->user_id,
				'email' => $this->friend_email,
				'code' => $this->code
			);
					
			$this->referrals_model->insertReferral($this->set_array );	
			
		}

	protected function redeemReferral($refer){
		
		$whereArray = array(
				'code' => $refer,
				'redeemed' => 0
			);

		if( $this->__referralexist($whereArray) ){
			
			if( !$this->__isStillOnTrial( $this->referralArray['user_id'] ) ) return;

			$this->__updateReferral();
			$this->__giveReferralCredit();
			$this->__grantPromoBonus();			
			
		};
		
	}
	
		private function __updateReferral(){ 
					
			$set_what_array = array(
				'redeemed' =>  1,
				'registered' =>  date('Y-m-d'),
				'newuser_id' =>  $this->userResultArray['id']
				
			);
			
			$this->referrals_model->updateReferral( 
				$this->referralArray['id'], 
				$set_what_array 
			);	
			
		}	
		
		private function __giveReferralCredit(){ 
			
			$credit = 1; // WEEKS ADDED TO TRIAL FOR REFERRER
			
			// CREDIT THE PERSON WHO REFERRED THE FRIEND
    	$who_id = $this->referralArray['user_id'];
    	$this->__adjustCredit( 'referral', 'add', $credit,  $who_id, $multi_redeemed = -1);
    	
			// THANK THE PERSON FOR THE REFERRAL
			$this->message_id = 2; // Friend has signed up
			$whereArray = array(
					'id' => $this->referralArray['user_id']
				);
			$requesterArray = $this->users_model->getUserWhere( $whereArray );			
			$this->addTo = $requesterArray['email'];
			$this->setFrom = "admin@pictographr.com";
			$this->subs = array (
				"-requester-" => array ( $requesterArray['given_name'] ), 
				"-newuser_name-" => array ($this->userResultArray['name'])
			);
			$this->__sendgrid();


			// EMAIL NEW USER YOU ARE CREDITING FRIEND FOR THE REFERRAL SUGGESTION
			$this->message_id = 3;  // New user signed up from refer code.
			$set_what_array = array(
				'message_id' => $this->message_id,
				'market_id' =>  $requesterArray['market_id'],
				'market_name' =>  $requesterArray['market_name'],
				'market_max_promo' =>  $requesterArray['market_max_promo']
			);
			
			$this->users_model->updateUser( 
				$this->userResultArray['id'], 
				$set_what_array 
			);
			
			$this->addTo = $this->userResultArray['email'];
			$this->setFrom = "admin@pictographr.com";
			$this->subs = array (
				"-requester-" => array ( $requesterArray['name'] ), 
				"-newuser_name-" => array ($this->userResultArray['name'])
			);
			
			$this->__sendgrid();

		}

		private function __grantPromoBonus(){
			
			$whereArray = array(
				'id' => $this->referralArray['user_id']
			);
			
			$this->bonusUserArray = $this->users_model->getUserWhere( $whereArray ); 
		
			$this->referralsForBonus = 10;
			$this->weeksTillReachYear = 42;

			
			if( $this->bonusUserArray['referral_credits'] >= $this->referralsForBonus &&
					$this->bonusUserArray['promo_bonus'] == 0
			){
				
				$set_what_array = array(
					'promo_bonus' => 1,
					'promotion_credits' => $this->bonusUserArray['promotion_credits'] + $this->weeksTillReachYear  // 52 weeks - 10 weeks from 10 referrals
				);
				
				$this->users_model->updateUser( 
					$this->bonusUserArray['id'], 
					$set_what_array 
				);
				
				$this->message_id = 21; // email about subscription
				$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
				$this->template_id = $this->messageArray['sendgrid_template_id'];
				
				$this->addTo = $this->bonusUserArray['email'];
				$this->setFrom = "admin@pictographr.com";
				$this->setSubject = 'Free Pictographr Year';
				
				$replace_whats['-given_name-'] = $this->bonusUserArray['given_name'];
				$this->setText = $this->__customizeMessage( $this->messageArray['email_text'], $replace_whats );
				$this->setHtml = $this->__customizeMessage( $this->messageArray['email_html'], $replace_whats );
				$this->__sendgrid();
				
				$this->__emailmyself('User : ' . $this->bonusUserArray['given_name'] . ' given Free Pictographr Year.'); //. substr($this->geo_location,0, 120);

			};

		}
		
	public function testsend(){
		
		$this->__setMessagesModel();
		$this->message_id = 21; // email about subscription
		$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
		$this->template_id = $this->messageArray['sendgrid_template_id'];
		
		$this->addTo = 'joanpictographr@gmail.com';
		$this->setFrom = "admin@pictographr.com";
		$this->setSubject = 'Free Pictographr Year';
		
		$replace_whats['-given_name-'] = 'John Berlin';
		
		$this->setText = $this->__customizeMessage( $this->messageArray['email_text'], $replace_whats );
		$this->setHtml = $this->__customizeMessage( $this->messageArray['email_html'], $replace_whats );
		$this->__sendgrid();
		
		echo '<pre>';print_r( $this->server_response  );echo '</pre>';  exit;
		
	}		

		private function __isStillOnTrial($user_id){
		
			$this->__setUsersModel();
			
			$whereArray['id'] = $user_id;
					
			$resultArray = $this->users_model->getUserWhere( $whereArray );
			
			if( in_array($resultArray['status_id'], array(1, 2))){
				return true;
			}else{
				return false;
			}
		}	

	public function getReferrals(){ // http://pictographr.com/credit/getReferrals
		
		$this->__setReferralsModel();
		
		echo '<pre>';print_r(  $this->referrals_model->getAllReferrals() );echo '</pre>';  exit;
		
	}

	public function getRefer(){ // http://pictographr.com/credit/getRefer
		
		$this->__paramIntoProperties($this->input->post('arrData'));
		$this->__setReferralsModel();
		$this->__setUsersModel();
		$this->__setSubscriptionModel();
		
		$whereArray = array(
				'code' => $this->refer,
				'redeemed' => 0
			);

		$this->referralArray = $this->referrals_model->getReferralWhere( $whereArray );
		
		if( $this->referralArray == 0 ) {
			$response['status'] = 'none'; 
			echo json_encode($response);
			return;
		}
		
		$whereArray = array(
				'id' => $this->referralArray['user_id']
			);
			
		$requesterArray = $this->users_model->getUserWhere( $whereArray );
		
		if( $requesterArray == 0 ){
			$response['status'] = 'none';
		}else{
			$subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($requesterArray['market_id']);	
			$response['email'] = $this->referralArray['email'];
			$response['given_name'] = $requesterArray['given_name'];
			$response['monthly'] = $subscriptionsArray[0]['subscription_monthly'];
			$response['yearly'] = $subscriptionsArray[0]['subscription_yearly'];
			$response['status'] = 'success';
		};
		
		echo json_encode($response);
		
		
	}	
	
	public function getPromosForUser(){
		
		$this->__setPromosModel();
		$this->user_id = 139;
		
		if($this->__promoAllowedForUserOnTrack('tm8a89l3', $this->user_id) ){
			echo "yes";
		}else{
			echo "no";
			echo '<pre>';print_r( $this->promoArray_2 );echo '</pre>'; 
		};
		
		
		$promos = $this->promos_model->getTrackFromLeftJoinedPromosForUser($this->user_id);
		
		echo '<pre>';print_r(  $promos );echo '</pre>';  exit;
		
	}
		
		private function __promoAllowedForUserOnTrack($promo_code, $user_id){
			
			$this->__setPromosModel();
			
			$whereArray_1['code'] = $promo_code;
			
			$this->promoArray_1 = $this->promos_model->getPromoWhere( array(
				'code' => $promo_code
			));
			
			$this->promoArray_2 = $this->promos_model->getTrackFromLeftJoinedPromosForUserOnTrack( $user_id, $this->promoArray_1['track_id']);
			
			if( $this->promoArray_2 == 0 ){
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
		
	public function getPromos(){ // http://pictographr.com/credit/getPromos
		
		$this->__setPromosModel();
		
		echo '<pre>';print_r(  $this->promos_model->getAllPromos() );echo '</pre>';  exit;
		
	}	
		
		private function __promoRedeemed(){
			
			$this->__setPromosModel();
			
			$whereArray = array(
					'code' => $this->code,
					'redeemed' => 1
				);
				
						
			$this->promoArray = $this->promos_model->getPromoWhere( $whereArray );
			
			$this->promo_id = $this->promoArray['id'];
			
			if( $this->promoArray != 0){
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}	

	public function doesPromoExist(){
		
			$this->__setSubscriptionModel();
		
		$this->__paramIntoProperties($this->input->post('arrData'));
		$this->__setPromosModel();
		
		$this->promoArray = $this->promos_model->getPromoWhere( array(
			'code' => $this->promo
		));
		
		$combinedCredits = $this->promoArray['market_initial_credits'] + $this->promoArray['credits'];
		
		$this->subscriptionsArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarkets($this->promoArray['market_id']);

		if( $this->promoArray  != 0 && $this->promoArray['redeemed'] == 0){
			$response['monthly'] = $this->subscriptionsArray[0]['subscription_monthly'];
			$response['yearly'] = $this->subscriptionsArray[0]['subscription_yearly'];
			$response['weeksfree'] = $combinedCredits;
			$response['status'] = 'success';
		} elseif( $this->promoArray  != 0 && $this->promoArray['redeemed'] == 1){
			$response['status'] = 'redeemed';
		} else {
			$response['status'] = 'empty';
		};
		
		echo json_encode($response);
		
	}

		protected function __promoexist($whereArray){
			
			$this->__setPromosModel();
			
			$this->promoArray = $this->promos_model->getPromoWhere( $whereArray );
			
			if( $this->promoArray != 0){
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
		
		protected function __updateMultiPromo(){ 
			
			$this->__setPromosModel();
					
			$set_what_array = array(
				'multi_left_count' => $this->promoArray['multi_left_count'] - 1
			);
			
			$this->promos_model->updatePromo( 
				$this->promoArray['id'], 
				$set_what_array 
			);
			
			$insert_array['user_id'] = $this->user_id;
			$insert_array['promo_id'] = $this->promoArray['id'];
			$insert_array['promo_type_id'] = $this->promoArray['promo_type_id'];
			$this->promosusers_model->insertPromosMarket( $insert_array );	
			
		}
	
	public function updatePromo(){ // http://pictographr.com/credit/updatePromo
		
		$this->__setPromosModel();
				
		$set_what_array = array(
			'redeemed' =>  1,
			'when' =>  date('Y-m-d'),
			'user_id' =>  $this->user_id
		);
		
		$this->promos_model->updatePromo( 
			$this->promoArray['id'], 
			$set_what_array 
		);	
		
	}
	
		protected function __promo_user_redeemed() {	
			
			$this->__setPromosUsersModel();
			
			$where_array['user_id'] = $this->user_id;
			$where_array['promo_id'] = $this->promoArray['id'];
			
			if( $this->promosusers_model->getPromosMarketWhere($where_array) ){
				return true;
			}else{
				return false;
			};
			
		}	
		
				
		protected function __redeemMulti() {
			
	    if( $this->__promo_user_redeemed() ) {
					
				echo json_encode(
						array(
							'code' => $this->code,
							'status' => 'used'
						)		
				);	
				
				return;
				
	    }				
								
	    if( $this->__promoexist(array(
					'code' => $this->code,
					'multi_left_count >' => 0
				)) ){
					
	    	$who_id = $this->user_id;
	    	$this->__adjustCredit( 'promotion', 'add', $this->promoArray['credits'],  $who_id, $multi_redeemed = 1);
				$this->__updateMultiPromo();
				$this->howManyDaysLeft = $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['days'];
	    	
	    	$response = 
						array(
							'code' => $this->code,
							'status' => 'success',
							'credits' => $this->promoArray['credits'],
							'howManyDaysLeft' => $this->howManyDaysLeft,
							'totalWeeks' => ($this->user_referral_credits + $this->user_promotion_credits),
							'welcome' => $this->__getModalText(),
							'user_name' => $this->user_name,
							'creditArray' => $this->__getList()
						);
							    	
	    	if( $this->promoArray['promo_type_id'] == 1 ) $response['status'] = 'promoDiscountWorked';
	    	
				echo json_encode($response);					
					
				
	    } else{
	    	
				echo json_encode(
						array(
							'code' => $this->code,
							'status' => 'multi-maxed',
							'credits' => $this->promoArray['credits'],
							'howManyDaysLeft' => $this->howManyDaysLeft,
							'totalWeeks' => ($this->user_referral_credits + $this->user_promotion_credits),
							'welcome' => $this->__getModalText(),
							'user_name' => $this->user_name,
							'creditArray' => $this->__getList()
						)		
				);	    	
	    	
	    }		
				

		}	
	
	public function grantPromotionCredit() {
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

    
    $emailIt = $this->user_name . " has submitted Promo Credit by ";
    
    foreach( $this->os  as  $key => $value){
    	$emailIt = $emailIt . $key . " " . $value . " - ";
    }
    
    $this-> __logToFile($emailIt);
    
    // THIS IS A MULTI PROMO REDEMPTION
    if( $this->__promoexist(array(
				'code' => $this->code,
				'multi' => 1
			)) ){
			$this->__redeemMulti();
			return;
    } 
			    
    // ALREADY USED THIS PROMO CODE
    if( $this->__promoexist(array(
				'code' => $this->code,
				'user_id' => $this->user_id
			)) ){

			echo json_encode(
					array(
						'code' => $this->code,
						'status' => 'used',
						'credits' => $this->user_promotion_credits
					)		
			);
			return;
    } 
       
    // REACHED MAX PROMO
    if( $this->user_promotion_credits >= $this->user_market_max_promo){
			echo json_encode(
					array(
						'code' => $this->code,
						'status' => 'maxed',
						'credits' => $this->user_promotion_credits,
						'howManyDaysLeft' => $this->howManyDaysLeft
					)		
			);	
    	return;
    	
    };

  	// PROMO ALREADY USED FOR THIS MERCHANT
    if( ! $this->__promoAllowedForUserOnTrack($this->code, $this->user_id) ){
			echo json_encode(
					array(
						'code' => $this->code,
						'status' => 'applied',
						'user_promotion_credits' => $this->user_promotion_credits,
						'credits' => $this->user_promotion_credits,
						'user_market_max_promo' => $this->user_market_max_promo,
					)		
			);
			return;
    };

    
    if( $this->__promoexist(array(
				'code' => $this->code,
				'redeemed' => 0
			)) ){
    	
    	$who_id = $this->user_id;
    	$this->__adjustCredit( 'promotion', 'add', $this->promoArray['credits'],  $who_id, $multi_redeemed = -1);
			$this->updatePromo();

			$this->howManyDaysLeft = $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['days'];
    	
			echo json_encode(
					array(
						'code' => $this->code,
						'status' => 'success',
						'credits' => $this->promoArray['credits'],
						'howManyDaysLeft' => $this->howManyDaysLeft,
						'totalWeeks' => ($this->user_referral_credits + $this->user_promotion_credits),
						'welcome' => $this->__getModalText(),
						'user_name' => $this->user_name,
						'creditArray' => $this->__getList()
					)		
			);	
    	
    } else{
    	
    	
    	if( $this->__promoRedeemed() ){
				echo json_encode(
						array(
							'code' => $this->code,
							'status' => 'redeemed'
						)		
				);	
    	}else{
				echo json_encode(
						array(
							'code' => $this->code,
							'status' => 'error'
						)		
				);	
    	};

    };
    
	}
	
		protected function __adjustCredit( $forWhat, $how, $credit, $who_id, $multi_redeemed ) {
	
			$this->__setUsersModel();
			$this->__setStartsModel();
			
			$whereArray = array(
					'id' => $who_id
				);
				
			$resultArray = $this->users_model->getUserWhere( $whereArray );
			
			$promotion_credits = $resultArray['promotion_credits'];
			$paid_credits = $resultArray['paid_credits'];
			$status_id = $resultArray['status_id'];
			$referral_credits = $resultArray['referral_credits'];
			$start_id = $resultArray['start_id'];
			$trial_start = $resultArray['trial_start'];
			$start_id = $resultArray['start_id'];
			
			$forWhat_credits = $resultArray[$forWhat . '_credits'];
			
			$set_what_array = array();
			
			if( $how == 'add' ){
				
				$this->totalCredits = $promotion_credits + $paid_credits + $referral_credits + $credit;
				
				$set_what_array[$forWhat . '_credits'] =  $forWhat_credits + $credit;
				if( $status_id == 1 ) $set_what_array['status_id'] = 2; // extended if not beginner user

			}else{
				
				$this->totalCredits = $promotion_credits + $paid_credits + $referral_credits - $credit;
				
				$set_what_array[$forWhat . '_credits'] =  $forWhat_credits - $credit;
				
			};
			
			if( $start_id != 0){
				$when = $this->__calcTimeLeftInTrial($trial_start, $this->totalCredits)['endDate'];
				$updateWhat = array( 'when' => $when );
				$this->starts_model->updateStart(
					$start_id,
					$updateWhat
				);
				$set_what_array['subscription_start'] = $when;
			};

			if( isset( $this->promoArray ) &&
					$this->promoArray['multi'] == 1 &&
					$this->promoArray['promo_type_id'] == 1  // price discount
			){
				$set_what_array['track_id'] =  $this->promoArray['track_id'];
				$set_what_array['market_id'] =  $this->promoArray['market_id'];
				$set_what_array['market_name'] =  $this->promoArray['market_name'];
			};

			if( isset( $this->promoArray ) ){
				$this->user_promotion_credits += $credit;
			};
			
			$set_what_array['trial_end'] = $this->__calcTimeLeftInTrial($resultArray['trial_start'], $this->totalCredits)['endDate'];
			
			if( $status_id == 4 ){
			
				$daysAgo = 7 * $referral_credits;
				$date = new DateTime("now");
				$date->modify("-" . $daysAgo ." day");
				$new_trial_start = $date->format('Y-m-d');
				
				$set_what_array['trial_start'] = $this->trial_start = $new_trial_start;
				$set_what_array['trial_end'] = $this->__calcTimeLeftInTrial(date('Y-m-d'), $this->totalCredits)['endDate'];
				$set_what_array['status_id'] = 2;
				
			};

			$this->users_model->updateUser( 
				$who_id, 
				$set_what_array 
			);	

		}
					

	public function yo(){
	 
	 	if( $this->__promoCodeExistfor( 1083 )){
	 		echo $this->promoArray['code'];
		}else{
			echo "";
		};
		
		
	 $this->__emailmyself('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
	 
	}
		
		protected function __promoCodeExistfor( $user_id ){
			
			$this->__setPromosModel();
			
			$whereArray['reserved_user_id'] = $user_id;
			
			$this->promoArray = $this->promos_model->getPromoWhere( $whereArray );
			
			if( $this->promoArray == 0 ){
				return false;
			}else{
				return true;
			};
			
		}
	
		protected function __genOnePromoCode(){ // localhost/pictographr/credit/genOnePromoCode
			
			$this->__setPromosModel();
			$this->__setTracksModel();
			
			$date = new DateTime("now");
			$date->modify("+180 days");
			$reserve_expiration_date = $date->format('Y-m-d');

			$this->tracksArray = $this->tracks_model->getMarketFromLeftJoinedTracks($this->track_id);
			
			if( !$this->__promoCodeExistfor($this->user_id) ){
				
				$this->set_array = array(
					'track_id' => $this->track_id,
					'market_id' => $this->tracksArray[0]['market_id'],
					'market_name' => $this->tracksArray[0]['market_name'],
					'market_max_promo' =>  $this->tracksArray[0]['market_max_promo'],
					'market_initial_credits' =>  $this->tracksArray[0]['market_initial_credits'],
					'name' =>  $this->tracksArray[0]['track_name'],
					'credits' => $this->tracksArray[0]['market_credits'],
					'code' => $this->__get_random_string(6)
				);
				
				$this->set_array['reserved_user_id'] = $this->user_id;
				$this->set_array['reserved_email'] = $this->user_email;
				$this->set_array['reserve_expiration_date'] = $reserve_expiration_date;
				
				$this->promos_model->insertPromo($this->set_array );	
							
			} else{
				
				// echo "Already generated.";
			}
			

		}
		
	public function listExpiredUsers(){
		// SELECT * FROM `users` WHERE `trial_start`  between '2012-03-11 00:00:00' and '2016-08-27 00:00:00' order by trial_start desc;
		$this->__setUsersModel();
		
		$whereArray = array(
				'id' => $who_id
			);
			
		$resultArray = $this->users_model->getUserWhere( $whereArray );
		
		echo '<pre>';print_r(  $resultArray );echo '</pre>';  exit;
		
//			$this->trial_end = $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['endDate'];
//			if( $this->trial_end < $this->today ) return TRUE;
//			else return FALSE;
	}
	
	public function addFreePromos(){  http://pictographr.com/credit/addFreePromos?count=60
		
		
		$this->__setPromosModel();
		$this->__setTracksModel();
		
		$count = $_GET['count'];
		
		$track_id = 13;

		$this->tracksArray = $this->tracks_model->getMarketFromLeftJoinedTracks($track_id);	
	
		$cycle = 1;
		for ($i = 1; $i <= $count; $i++) {
			$this->set_array = array(
				'track_id' => $track_id,
				'location_id' => 0,
				'market_id' => $this->tracksArray[0]['market_id'],
				'market_name' => $this->tracksArray[0]['market_name'],
				'market_max_promo' =>  $this->tracksArray[0]['market_max_promo'],
				'market_initial_credits' =>  $this->tracksArray[0]['market_initial_credits'],
				'name' =>  $this->tracksArray[0]['track_name'],
				'credits' => $this->tracksArray[0]['market_initial_credits'],
				'code' => $this->__get_random_string(6)
			);
			
			echo $cycle . '<pre>';print_r(  $this->set_array );echo '</pre>';  
					
			$this->promos_model->insertPromo($this->set_array );

		};
		
		echo "Completed.";
		
	}

	public function addPromos(){ 
		// SELECT count(*)  FROM `promos`;  latest count = 5701
		// SELECT location_id, track_id,  count(*)  FROM `promos` group by location_id order by location_id desc
		// SELECT code, location_id FROM `promos` WHERE location_id >=  153
		// SELECT code, market_id, track_id, redeemed  FROM `promos` WHERE market_id =  13
		
		// SELECT market_id, location_id, code FROM `promos` WHERE  code = '66dbfd'
		// SELECT * FROM `promos` WHERE  code = '66dbfd'
		
		// http://pictographr.com/credit/addPromos?count=300&track_id=14&location_id=?   UCLA
		// http://pictographr.com/credit/addPromos?count=300&track_id=12&location_id=?   USC
		// http://pictographr.com/credit/addPromos?count=300&track_id=11&location_id=153   RANDOM HANDOUTS
		
		$this->__setPromosModel();
		$this->__setTracksModel();
		
		$count = $_GET['count'];
		$track_id = $_GET['track_id'];
		$location_id = $_GET['location_id'];

		$this->tracksArray = $this->tracks_model->getMarketFromLeftJoinedTracks($track_id);	
	
		$cycle = 1;
		for ($i = 1; $i <= $count; $i++) {
			$this->set_array = array(
				'track_id' => $track_id,
				'location_id' => $location_id,
				'market_id' => $this->tracksArray[0]['market_id'],
				'market_name' => $this->tracksArray[0]['market_name'],
				'market_max_promo' =>  $this->tracksArray[0]['market_max_promo'],
				'market_initial_credits' =>  $this->tracksArray[0]['market_initial_credits'],
				'name' =>  $this->tracksArray[0]['track_name'],
				'credits' => $this->tracksArray[0]['market_initial_credits'],
				'code' => $this->__get_random_string(6)
			);
			
			echo $cycle . '<pre>';print_r(  $this->set_array );echo '</pre>';  
					
			$this->promos_model->insertPromo($this->set_array );
			$cycle++;
			if( $cycle == 31){
				$cycle = 1;
				$location_id++;
			};
			
		};
		
		echo "Completed.";
		
	}
	
	// SELECT `redeemed`, `market_name`, `code` FROM `promos` WHERE `track_id` = 13 and `redeemed` = 0

}
