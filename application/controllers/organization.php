<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Organization extends Auth {

	public function __construct() {
		parent::__construct();
		if( $this->input->get() ) $this->__paramIntoProperties($this->input->get());
		if( $this->input->post() ) $this->__paramIntoProperties($this->input->post('arrData'));
		$this->_google_redirect_url 	= 'https://pictographr.com/organization/registerWithGoogle';		
	}

	public function subscribe() {
		
		$this->emailmyself_content = '';
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

    $this->__setOrganizationsModel();	
    $this->__requireStripLibrary();		
		$this->__setSubscriptionsorgsModel();
		$this->__setBlocksModel();
		$this->plan = $this->stripe_plan;
		
		if( $this->stripe_customer_id == ''){

			if( ! $this->__createStripeCustomer() ){
				$this->server_response['status'] = 'failed';
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);
				
				exit;
			}
			$this->emailmyself_content .= $this->user_email.  ' is a new Stripe Account. for an Organization';
		}

		if( isset( $this->stripeCustomerCreated ) ){
			$this->organizations_model->updateOrganization($this->organization_id, $this->set_what_array);
		};
		
			
		if( isset( $this->token ) && !isset( $this->stripeCustomerCreated ) ){
			
			if( ! $this->__updateStripeCustomer() ){
				
				$this->server_response['status'] = 'failed';
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);

				exit;	
				
			};
							
		};


		if( ! $this->__subscriptionStripeCharge()){
			$this->server_response['status'] = 'failed';
			echo json_encode($this->server_response);
			$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);
				
			exit;
		};
		
		if( isset( $this->subscriptionStripeCharged ) ){
			
			$this->insert_block_what_array['paid'] = $this->addSeatCount;
			$this->insert_block_what_array['stripe_plan'] = $this->plan;
			$this->insert_block_what_array['cost'] = $this->cost;
			$this->insert_block_what_array['subscription_interval'] = $this->new_subscription_interval;
			$this->insert_block_what_array['stripe_subscription_id'] = $this->stripe_subscription->id;
			$this->insert_block_what_array['subscription_start'] = $this->subscription_start = date('Y-m-d');
			$this->insert_block_what_array['organization_id'] = $this->organization_id;
			
			$block_id = $this->blocks_model->insertBlock($this->insert_block_what_array);
			
			$this->__giveSeats(  $this->addSeatCount, $block_id);
				
			$this->server_response['snack'] = 'Licence seats added.  Thank you.';
			$this->server_response['availableLicensesCount'] = $this->__getAvailableLicensesCount();	
						
		};

		echo json_encode($this->server_response);
		
		unset( $this->server_response  );
		
		$this->__sendInvoice( $block_id );

		if ( $this->emailmyself_content != '' ) $this->__emailmyself( $this->emailmyself_content  );
	}
	  
	public function removefake(){
		
		$this->__setUsersModel();
		
		$whereArray['fake'] = 1;
		$users = $this->users_model->deleteUser( $whereArray);	
		
	}
	
	public function fake(){	
		
		$this->__setUsersModel();
		$date = new DateTime("now");
		
		$whereArray = array(
				'isOrgAdmin' => 1
			);
					
		$resultArray = $this->users_model->getUserWhere( $whereArray );
		
		$this->organization_id = $resultArray['organization_id'];
				
		for( $i = 0 ; $i <= 10; $i++){
			
			$this->insert_or_update_array = array(
				'email' => $this->__get_random_string(20) . "@gmail.com",
				'fake' => 1,
				'organization_id' => 0,
				'given_name' => $this->__get_random_string(10),
				'family_name' => $this->__get_random_string(10),
				'name' => $this->__get_random_string(10),
				'status_id' => 1,
				'orgpaid' => 0,
				'block_id' => 0,
				'last' =>  $date->format('Y-m-d H:i:s')
			);
			
//			$this->__takeSeat();

			$this->user_id = $this->users_model->insertUser( $this->insert_or_update_array );
		}
		
		//$this->load->view('fake_view', []);

	}
	
	public function removeOrgAdmin(){
		
		$this->__setUsersModel();
		
		$whereArray['isOrgAdmin'] = 1;
		$users = $this->users_model->deleteUser( $whereArray);	
		
	}
	
	public function removeOrganization(){
		
		$this->__setOrganizationsModel();
		
		$whereArray['id'] = $this->organization_id;
		$users = $this->organizations_model->deleteOrganization( $whereArray);	
		
	}
	
	public function makeOrgUsers(){
		
		$this->__setUsersModel();
		
		$whereArray = array(
				'isOrgAdmin' => 1
			);
					
		$resultArray = $this->users_model->getUserWhere( $whereArray );
		
		$this->organization_id = $resultArray['organization_id'];
		
		$users = $this->users_model->getAllUsers();
		
		foreach( $users as  $user){
			
			$user_id = $user['id'];
			$set_what_array['orgpaid'] = 0;  
			$set_what_array['status_id'] = 1; 
			$set_what_array['block_id'] = 0; 
			$set_what_array['subscription_end'] = '';
			$set_what_array['organization_id'] = $this->organization_id;
			echo "--------------"."<br />";
			echo $user_id."<br />";
			echo '<pre>';print_r( $set_what_array  );echo '</pre>';
			echo  $this->users_model->updateUser( $user_id, $set_what_array )."<br />";

		}		
		
	}
	
	public function reset(){	
		echo "Starting... "."<br />";		
		$this->__setOrganizationsModel();
		$this->__setUsersModel();
		
		$whereArray = array(
				'isOrgAdmin' => 1
			);
					
		$resultArray = $this->users_model->getUserWhere( $whereArray );
		
		$this->organization_id = $resultArray['organization_id'];
		
		$this->removefake();
		
		$users = $this->users_model->getAllUsers();
		
		foreach( $users as  $user){
			
			$user_id = $user['id'];
			$set_what_array['orgpaid'] = 0;  
			$set_what_array['status_id'] = 1; 
			$set_what_array['block_id'] = 0; 
			$set_what_array['subscription_end'] = '';
			$set_what_array['organization_id'] = 0; // $this->organization_id;
			echo "--------------"."<br />";
			echo $user_id."<br />";
			echo '<pre>';print_r( $set_what_array  );echo '</pre>';
			echo  $this->users_model->updateUser( $user_id, $set_what_array )."<br />";

		}		
		
		$this->fake();		
		$this->removeOrgAdmin();
		$this->removeOrganization();
			
		$blocks = $this->__getBlocks($this->organization_id, $expire = -1);
		
		echo '<pre>';print_r(  $blocks );echo '</pre>'; 
		
		if( $blocks == 0) return;

		foreach( $blocks  as $block){
			
			$block_id = $block['id'];

			echo "deleted block: " . $block_id . "<br />";
			echo "----------------------------------------------"."<br />";
			
			$whereBlockArray['id'] = $block_id;
			$this->blocks_model->deleteBlock( $whereBlockArray);
							
		}


		
	}
	
	public function setPSession(){	
		
		$this->__settingSessionP('selfclose');
		$this->__settingSessionP('org_type');
		$this->__settingSessionP('xorg_id');
		$this->__settingSessionP('xuser_id');
		$this->__settingSessionP('organization_name');
		$this->__settingSessionP('domain');
		$this->__settingSessionP('partner_id');
		$this->__settingSessionP('subdomain_id');
		$this->__settingSessionP('isStudent');
		$this->__settingSessionP('isTeacher');
		$this->__settingSessionP('redirect');
		$this->__settingSessionP('isOrgAdmin');
		$this->__settingSessionP('popSetupModal');
		$this->__settingSessionP('refreshSidebarFiles');
		$this->__settingSessionP('whenUserHasAccountThen');
		$this->__settingSessionP('isUWP');
		
		$response['status'] = 'stored';
		echo json_encode($response);	
		
	}
		
	public function getOrgUserData(){ //
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		$this->__getUserIdAndSessionIdWithSessionId();
		
		$date = new DateTime($this->subscription_end);
		$subscription_end = $date->format('F d, Y');
		
		$this->accountsData['status_id'] = $this->status_id;
		

		if( in_array($this->status_id, array(1, 2))){
			
			$this->accountsData['welcome'] = "Your trial subscription began " . $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['niceStartDate'] . " and will end on " . $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['niceEndDate'] . ".&nbsp;&nbsp;&nbsp;Please contact your organization's administrator to add you to a group subscription."; 
			$this->accountsData['creditArray'] = $this->__getList();

		} elseif( in_array($this->status_id, array(4)) ){
					
			$this->accountsData['welcome'] = "Your trial subscription has ended.&nbsp;&nbsp;Please contact your organization's administrator for continued access.";
			
		} elseif( in_array($this->status_id, array(6, 7)) ){
			
			$this->accountsData['welcome'] = "Your subscription will end on " . $subscription_end . ".&nbsp;&nbsp;Please contact your organization's administrator for continued access past this date.";
			
		} elseif( in_array($this->status_id, array(8)) ){
			
			$this->accountsData['welcome'] = "Your subscription has ended on " . $subscription_end . ".&nbsp;&nbsp;Please contact your organization's administrator for continued access.";
			
		};
		
		echo json_encode( $this->accountsData );
			
	}
			
	public function getAccountData(){
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		$this->__getUserIdAndSessionIdWithSessionId();
		$this->accountsData['stripe_customer_id'] = $this->stripe_customer_id;
		echo json_encode( $this->accountsData );
			
	}

	public function getAuthUrl(){ 
		
		$this->__paramIntoProperties($this->input->post('arrData'));
		
		if( isset($this->os) ){
	    $emailIt = "Browser has ";
	    foreach( $this->os  as  $key => $value){
	    	$emailIt = $emailIt . $key . " " . $value . " - ";
	    }
	    $this-> __logToFile($emailIt);			
		}
		
		$this->client = $this->__connectGAPI();
		$response['authUrl'] = $this->client->createAuthUrl();
		echo json_encode($response);	
	}

	public function registerWithGoogle(){ 
		
		$this->__connectGAPI();
		$this->__connectDriveServices();
		$this->__connectOAuth();
		$this->__setUsersModel();
		$this->__setOrganizationsModel();
		
		if (isset($_GET['code'])) { 
		
				$this->__getGoogleUserTokenFromGAPI();
 
				if( $this->__googleUserExist() ){
					
					$this->__continueAfterRegister();
					
				}else{
					
						if( $this->__emailExist()){
							
							$this->__continueAfterRegister();
							
						}else{
							
							$this->__createNewGoogleUser();
							$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
							$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));							
							$this->__proceedTo();
							
						};
					
				};

		} else{
		
				?>
				
				<!DOCTYPE html>
				<head>
					<style>
					.content {
						//display: none;
		        width: 500px;
		        height: 481px;
		
		        position:absolute;
		        left:0; right:0;
		        top:0; bottom:0;
		        margin:auto;
		
		        max-width:100%;
		        max-height:100%;
		        overflow:auto;
					}
					#designpic{
						width: 400px;
					}
					#signup{
						cursor: pointer;
						margin-top: -14px;
						width: 240px;	
					}
					</style>
			</head>
			<body>
				<div  class="content">
					<div>
						<center><img  id="designpic" src="https://pictographr.com/img/splash4uwp.png" /></center>
						<center><a class="login" href="<?php echo $this->client->createAuthUrl(); ?>"><img  id="signup" src="https://pictographr.com/img/loginGoogle.png" /></center>
					</div>
				</div>
			</body>
			
			
				<?php 
				
			
		}
		
	}
	
		private function __continueAfterRegister(){
			
			$this->__insertUserPartnerRecord();			
			$this->__setOrCreateOrganization();
			$this->__designateAsAdminInOrganizationTable();
			$this->__reestablishOrganizationLink();
			$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
			$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));	
			$this->__storeTokenGoogleUser();
			$this->__proceedTo();	
					
		}
					
		private function __proceedTo(){
			
			if( $this->session->userdata('selfclose') ){
				$this->session->unset_userdata('selfclose');
				$this->__selfWindowClose();
			} elseif ( $this->session->userdata('redirect') ){
				$this->session->unset_userdata('redirect');
				header("Location: https://pictographr.com/app");
			} else {
				$this->__callWindowOpenerFunction();
			};
			
		}

		protected function __createNewGoogleUser(){
						
			
			$this->__setOrCreateOrganization();
			
			$this->__setMarketsModel();
			$this->marketsArray = $this->markets_model->getMarketWhere( array(
					'id' => $this->market_id 
			));
			
			$this->message_id = 1;
			
			//$this->__getGeoLocation();
			
			$this->trial_start = date('Y-m-d');
			
			$this->insert_or_update_array = array(
				'allowEmailPromotion' => 1,
				'email' => $this->user_email,
				'google_id' => $this->google_id,
				'organization_id' => $this->organization_id,
				'given_name' => $this->given_name,
				'family_name' => $this->family_name,
				'name' => $this->name,
				'picture' => $this->picture,
				'locale' => $this->locale,
				'promotion_credits' => $this->marketsArray['initial_credits'],
				'market_initial_credits' => $this->marketsArray['initial_credits'],
				'market_id' => $this->market_id,
				'market_name' => $this->marketsArray['name'],
				'market_max_promo' => $this->marketsArray['max_promo'],
				//'geo_location' =>  substr($this->geo_location,0, 120),
				'ip' => $_SERVER['REMOTE_ADDR'],
				'status_id' => 1,
				'trial_start' => $this->trial_start,
				'orgpaid' => 0,
				'trial_start' => $this->trial_start,
				'trial_end' => $this->__calcTimeLeftInTrial(date('Y-m-d'), $this->marketsArray['initial_credits'])['endDate']
			);
			
			$this->insert_or_update_array['google_token_pictographr'] = $this->accessToken;

			$emailIt = $this->given_name . ' ' . $this->family_name . ' is being created from an Organization using ' . $_SERVER['HTTP_USER_AGENT'];
			$this-> __logToFile($emailIt);

			$this->__takeSeat();

			if( $this->session->userdata('isOrgAdmin')){
					$this->insert_or_update_array['isOrgAdmin'] = 1;
					$this->__emailmyself($emailIt);
			};

			$this->user_id = $this->users_model->insertUser( $this->insert_or_update_array );
			
			if( $this->marketsArray['auto_promo'] == 1 ){
				$this->__genOnePromoCode();
			};
			
			$this->__insertUserPartnerRecord();
			
			$this->__designateAsAdminInOrganizationTable();
			
			$this->__createRequiredFolders();	

			$this->__email_welcome();

		}
		
		private function __increaseUsedCountOnBlock($block_id){
			$this->__setBlocksModel();
			$this->userCountByBlock++;
			$setWhat['used'] = $this->userCountByBlock;
			$this->blocks_model->updateBlock( $block_id, $setWhat );
		}	
		
		protected function __takeSeat(){
			
			$blocks = $this->__getBlocks($this->organization_id, $expire = -1);
			
			if( $blocks == 0) return;

			foreach( $blocks  as $block){
				
				$block_id = $block['id'];
				$paidCount = $block['paid'];
				$this->userCountByBlock = $this->__getUserCountByBlock( $block_id );
				
				if( $this->userCountByBlock < $paidCount ){
					
					$this->insert_or_update_array['block_id'] = $block_id;
					$this->insert_or_update_array['orgpaid'] = 1;
					$this->insert_or_update_array['status_id']  = ( $block['expire'] == 1 ? 7 : 6);
					$this->insert_or_update_array['subscription_end_request']  = $block['subscription_end_request'];
					$this->insert_or_update_array['subscription_start'] = $block['subscription_start'];
					$this->insert_or_update_array['subscription_interval'] = $block['subscription_interval'];
					$this->insert_or_update_array['subscription_end'] = ( $block['expire'] == 1 ? $block['endDate'] : '');
					
					$this->howManyDaysLeft  = ( $block['expire'] == 1 ? $block['days']: -1);
					
					$this->__increaseUsedCountOnBlock($block_id);
					break;					
				};
				
			}

		}


	public function unassignUser(){
			
			$this->__setUsersModel();
			$this->__setBlocksModel();
			
			$update_array['orgpaid'] = 0;  
			$update_array['status_id'] = 1; 
			$update_array['block_id'] = 0;  
			$this->users_model->updateUser( $this->user_id, $update_array  );
			
			$setWhat['used'] = $this->__getUserCountByBlock( $this->block_id );
			$this->blocks_model->updateBlock( $this->block_id, $setWhat );	
			
			$this->server_response['update_array'] = $update_array;
			$this->server_response['status'] = 'unassigned';
			$this->server_response['user_id'] = $this->user_id;
			echo json_encode($this->server_response);		
	}		
		
	public function resetPaid(){
		
		$this->organization_id = 2;
		$this->__setUsersModel();
		$this->__setOrganizationsModel();
		$whereArray['organization_id']  = 2;
		$this->usersArray = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", -1 );
		foreach( $this->usersArray  as  $idx => $value){
			$user_id = $this->usersArray[$idx]['id'];
			$set_what_array['orgpaid'] = 0;
			$set_what_array['organization_id'] = $this->organization_id;
			$set_what_array['block_id'] = 0;
			$this->users_model->updateUser( $user_id, $set_what_array );
			echo "resetting ". $user_id ."<br />";
		}
		
	}
	
	public function createCustomer(){	

		$this->__setUsersModel();
		$this->google_id = '104384554224634036843';
		$this->isFrom = __FUNCTION__;
		$this->__getUserIdAndSessionIdWithSessionId();
			
		$this->__setOrganizationsModel();
		$whereArray = array(	'user_id' => $this->user_id);
		$this->organizationArray = $this->organizations_model->getOrganizationWhere($whereArray);
		
		$this->domain = $this->organizationArray['domain'];
		$paid = $this->organizationArray['paid'];
		$this->organization_name = $this->organizationArray['name'];
		
		if( ! $this->__createStripeCustomer() ){
			$this->server_response['status'] = 'failed';
			echo json_encode($this->server_response);
			$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);
				
			exit;
		}
 		
	}
	
	public function updatePaymentInformation() {	
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();
		
    $this->__requireStripLibrary();
    
		if( $this->stripe_customer_id == '') {
			
			if( ! $this->__createStripeCustomer() ){
				$this->server_response['status'] = 'failed';
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);
				
				exit;
			}
			
			if( isset( $this->stripeCustomerCreated ) ){
				$this->set_what_array['stripe_customer_id'] = $this->stripe_customer_id;
				$this->organizations_model->updateOrganization($this->organization_id, $this->set_what_array);
			};
			$this->server_response['snack'] = 'Your payment information is now on file.';			
			$this->server_response['gotoNewLicense'] = 'true';			
		} else{
			
			if( $this->__updateStripeCustomer() ){
				$this->server_response['snack'] = 'Your payment information has been updated.';
				$this->server_response['status_id'] = $this->status_id;
				$this->server_response['status'] = 'succeeded';			
			}else{
				$this->server_response['status'] = 'failed';
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);

				exit;	
			};

		} 
		
		$this->server_response['status'] = "succeeded";
		echo json_encode($this->server_response);
		
	}

		private function __expireSeats( $block_id ){
			
			$this->__setUsersModel();

			$whereArray['block_id'] = $block_id;
			$users = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1);
			
			if( $users != 0){
				
				foreach( $users as  $user){
					
					$user_id = $user['id'];
					$set_what_array['orgpaid'] = 1;  
					$set_what_array['status_id'] = 7;  // limited
					$set_what_array['subscription_end'] = $this->blockArray['endDate'];
					$set_what_array['subscription_end_request'] = date("Y-m-d"); 
					$this->users_model->updateUser( $user_id, $set_what_array );

				}
								
			}
						
		}
		
	public function expireBlock(){
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

			$this->__requireStripLibrary();

			$this->blockArray = $this->__getBlock($this->block_id);			
			
			$this->__setBlocksModel();
			$setWhat['subscription_end_request'] = date('Y-m-d');
			$setWhat['subscription_end'] = $this->blockArray['endDate'];
			$setWhat['expire'] = 1;
			$this->blocks_model->updateBlock( $this->block_id, $setWhat );
			
			$this->__expireSeats( $this->block_id );

			$this->stripe_subscription_id = $this->blockArray['stripe_subscription_id'];
			
			if( ! $this->__cancelSubscriptionStripeCharge()){
				
				$this->server_response['status'] = 'failed';
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);
				
				exit;
				
			};	

			
			$this->server_response['action'] = 'expireBlock';
			$this->server_response['stripe_customer_id'] = $this->stripe_customer_id;
			$this->server_response['stripe_subscription_id'] = $this->stripe_subscription_id;
			$this->server_response['niceEndDate'] = $this->blockArray['niceEndDate'];
			echo json_encode($this->server_response);	
			
			$this->__emailmyself( $this->user_email . ' of ' . $this->domain . ' just expired his block subscription to end ' .  $this->server_response['niceEndDate'] );		

	}
		 
		private function __cancelSubscriptionStripeCharge(){

			try {
				
				$customer = Stripe\Customer::retrieve($this->stripe_customer_id);
				$this->server_response['stripe_response'] = $customer->subscriptions->retrieve($this->stripe_subscription_id)->cancel(array("at_period_end" => true ));
				$this->server_response['status'] = 'succeeded';
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
		
		private function __resubscribeSubscriptionStripeCharge(){

			try {
				
				$customer = Stripe\Customer::retrieve($this->stripe_customer_id);
				$this->stripe_subscription = $customer->subscriptions->retrieve($this->stripe_subscription_id);
				
				$this->stripe_subscription->plan = $this->plan;
				$this->server_response['stripe_response'] = $this->stripe_subscription->save();
				$this->server_response['status'] = 'succeeded';
				
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
		
	public function unexpireBlock(){
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

			$this->__requireStripLibrary();

			$this->__setBlocksModel();
			$setWhat['subscription_end_request'] = '';
			$setWhat['subscription_end'] = '';
			$setWhat['expire'] = 0;
			$this->blocks_model->updateBlock( $this->block_id, $setWhat );
			$this->__unexpireSeats($this->block_id);
			
			
			$this->blockArray = $this->__getBlock($this->block_id);
			$this->stripe_subscription_id = $this->blockArray['stripe_subscription_id'];
			$this->plan = $this->blockArray['stripe_plan'];
			
			if( ! $this->__resubscribeSubscriptionStripeCharge()){
				$this->server_response['status'] = 'failed';
				echo json_encode($this->server_response);
				$this->__emailmyself($this->user_email.  ' had a credit problem.  Error is: ' . $this->server_response['error_message'] . '  for stripe customer: ' . $this->stripe_customer_id . ' : User_id: ' . $this->user_id . ' Reason: ' . $this->server_response['decline_code']);
				
				exit;
			};
					
			$this->server_response['action'] = 'unexpireBlock';
			$this->server_response['stripe_subscription_id'] = $this->stripe_subscription_id;
			$this->server_response['plan'] = $this->plan;
			echo json_encode($this->server_response);	

			$this->__emailmyself( $this->user_email . ' of ' . $this->domain . ' just resubscribed his block subscription: ' .  $this->plan );
	}
	
		private function __unexpireSeats($block_id){	
			
			$this->__setUsersModel();

			$whereArray['block_id'] = $block_id;
			$users = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1);
			
			if( $users != 0){
				
				foreach( $users as  $user){
					
					$user_id = $user['id'];
					$set_what_array['orgpaid'] = 1;  
					$set_what_array['status_id'] = 6;
					$set_what_array['subscription_end'] = ''; 
					$set_what_array['subscription_end_request'] = ''; 
					$this->users_model->updateUser( $user_id, $set_what_array );

				}
								
			}

			
		}
		
		private function __getBlock($block_id){
			
			$this->__setBlocksModel();
			$where_array['id'] = $block_id;
			$blockArray = $this->blocks_model->getBlockWhere($where_array);
			$extendedBlockArray = $blockArray;
			if( $blockArray['subscription_interval'] == 1){
				$extendedBlockArray['days'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['days'];
				$extendedBlockArray['endDate'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['endDate'];
				$extendedBlockArray['niceEndDate'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['niceEndDate'];
			}else{
				$extendedBlockArray['days'] = $this->__getTimeLeftInYearlySubscription($blockArray)['days'];
				$extendedBlockArray['endDate'] = $this->__getTimeLeftInYearlySubscription($blockArray)['endDate'];
				$extendedBlockArray['niceEndDate'] = $this->__getTimeLeftInYearlySubscription($blockArray)['niceEndDate'];
			};
			
			return $extendedBlockArray;

		}
				
		private function __getBlocks($organization_id, $expire){
			
			$this->__setBlocksModel();
			
			$where_array['organization_id'] = $organization_id;

			$blocksArray = $this->blocks_model->getAllBlocksWhere($where_array);

			
			if( $blocksArray == 0 ) return 0;
			
			foreach( $blocksArray  as $blockArray){
				$extendedBlockArray = $blockArray;
				if( $blockArray['subscription_interval'] == '1'){ // Monthly
					$extendedBlockArray['paidDays'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['paidDays'];
					$extendedBlockArray['daysSinceTimerStart'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['daysSinceTimerStart'];
					$extendedBlockArray['days'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['days'];
					$extendedBlockArray['monthsSoFar'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['monthsSoFar'];
					$extendedBlockArray['endDate'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['endDate'];
					$extendedBlockArray['niceEndDate'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['niceEndDate'];
					$extendedBlockArray['niceStartDate'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['niceStartDate'];
					$extendedBlockArray['segmentStartDate'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['segmentStartDate'];
					$extendedBlockArray['niceSegmentStartDate'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['niceSegmentStartDate'];
					
					$extendedBlockArray['expiredSegmentBeginDateNice'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['expiredSegmentBeginDateNice'];
					$extendedBlockArray['expiredSegmentEndDateNice'] = $this->__getTimeLeftInMonthlySubscription($blockArray)['expiredSegmentEndDateNice'];

				}else{
					$extendedBlockArray['days'] = $this->__getTimeLeftInYearlySubscription($blockArray)['days'];
					$extendedBlockArray['endDate'] = $this->__getTimeLeftInYearlySubscription($blockArray)['endDate'];
					$extendedBlockArray['niceEndDate'] = $this->__getTimeLeftInYearlySubscription($blockArray)['niceEndDate'];
					$extendedBlockArray['niceStartDate'] = $this->__getTimeLeftInYearlySubscription($blockArray)['niceStartDate'];
					$extendedBlockArray['segmentStartDate'] = $this->__getTimeLeftInYearlySubscription($blockArray)['segmentStartDate'];
					$extendedBlockArray['niceSegmentStartDate'] = $this->__getTimeLeftInYearlySubscription($blockArray)['niceSegmentStartDate'];
					
					$extendedBlockArray['expiredSegmentBeginDateNice'] = $this->__getTimeLeftInYearlySubscription($blockArray)['expiredSegmentBeginDateNice'];
					$extendedBlockArray['expiredSegmentEndDateNice'] = $this->__getTimeLeftInYearlySubscription($blockArray)['expiredSegmentEndDateNice'];
					
				};
				
				$extendedBlockArray['count'] = $this->__getUsersCountByBlock($blockArray['id']);
				$extendedBlockArray['today'] = date("Y-m-d");
				
				if( $expire ==  -1)  {
					
					if( date("Y-m-d") > $extendedBlockArray['subscription_end'] && 
							$blockArray['expire'] == 1
					) {
						continue;  // dont show it
					}					
					
				} else {
					
					if( date("Y-m-d") > $extendedBlockArray['subscription_end'] && 
							$blockArray['expire'] == 1
					) {
						$extendedBlockArray['isExpired'] = true;
					}								
				}

				
				$extendedBlocksArray[] = $extendedBlockArray;
			}
			
			if( isset($extendedBlocksArray) ) return $extendedBlocksArray;
			else return;			

		}
	
	public function getBlocks(){
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();


		$blocksArray = 	$this->__getBlocks($this->organization_id, $expire = 1);	
		
		if(  $blocksArray == 0 ){
			$this->server_response['status'] = 'no records';
			$this->server_response['blocks'] = [];				
		}else{
			$this->server_response['status'] = 'success';
			$this->server_response['blocks'] = $blocksArray;			
		};
		
		echo json_encode($this->server_response);		

	}
			
		private function __getTotalPaidLicensesCount(){
			
			$blocksArray = 	$this->__getBlocks($this->organization_id, $expire = -1);	
			
			if( $blocksArray == 0) return 0;
			
			$count = 0;
	
			foreach( $blocksArray  as $block){
				
				$paid = $block['paid'];
				
				$count = $count + $paid;
	
			}
			
			
			return $count;
	
		}
			
	public function toggleAccept() {

    $this->__setOrganizationsModel();	
		$this->isFrom = "organization - " . __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		
		$set_what_array[$this->field] = $this->value; 		
		$this->server_response['updatetime'] = $this->organizations_model->updateOrganization( 
			$this->organization_id, $set_what_array 
		);
		
		echo json_encode($this->server_response);		
	}
	
	public function getTerms(){
		
		$this->__setTermsModel();
		$this->__setPrivacyModel();	
		
		$this->server_response['terms'] = $this->terms_model->getTermWhere( array('id' => 1))['content'];
		 
		echo json_encode($this->server_response);		

	}
		
		private function __getUsersCountByBlock($block_id){
		
			$this->__setUsersModel();	
					
			$whereArray['block_id'] = $block_id;
			
			if( $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1, $or_where_array = array() ) == 0 ){
				return 0;
			}else{
				return count($this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1, $or_where_array = array() ));
			};
		
		}
		
	public function getUsersByBlock(){
		
		$this->__setUsersModel();	
				
		$whereArray['block_id'] = $this->block_id;
		
		$users = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "desc", $count = -1 );
		
		if(  $users == 0 ){
			$this->server_response['count'] = 0;
		}else{
			$this->server_response['count'] = count($users);
			$this->server_response['users'] = $users;
		};
		
		echo json_encode($this->server_response);
		
	}
		
	public function getUnlicensedUsers(){
		
		$today = date("Y-m-d");	
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();
		
		$this->__setUsersModel();	
				
		$whereArray['organization_id'] = $this->organization_id;
		
		$where_in_array = array(
			'field' => 'status_id',
			'ids' => array( 1, 2, 4, 8)	
		);

		$usersArray1 = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1, $where_in_array);
		$usersArray1 = ( $usersArray1 == 0  ? []: $usersArray1);
		
			$whereArray['organization_id'] = $this->organization_id;
			$whereArray['status_id'] = 7;
			$whereArray['subscription_end <'] = $today;
			
			$usersArray2 = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1);
		
		if( $usersArray2 != 0 ){
			$usersArray = array_merge($usersArray1, $usersArray2);
		}else{
			$usersArray = $usersArray1;
		};

		if( count($usersArray) == 0 ){
			$this->server_response['users'] = [];
		}else{
			foreach( $usersArray  as $userArray){
				$extendedArray = $userArray;
				$extendedArray['created'] = $this->__getNiceDate($userArray['created'])['niceDate'];
				$extendedArray['last'] = $this->__getNiceDate($userArray['last'])['niceDate'];
				$extendedsArray[] = $extendedArray;
			}
			
			$this->server_response['users'] = $extendedsArray;
			
		};
		
		if( isset( $this->getUnlicensedUsersCount )) return count($usersArray);
		else echo json_encode($this->server_response);
				
	}
	
		private function __getAvailableLicensesCount(){
		
			return $this->__getTotalPaidLicensesCount() - $this->__getLicensedUserCount();
				
		}
					
		private function __getUnlicensedUserCount_depreciated(){
			
			$this->__setUsersModel();	
					
			$whereArray['organization_id'] = $this->organization_id;
			
			$where_in_array = array(
				'field' => 'status_id',
				'ids' => array( 1, 4, 8)	
			);
	
			$usersArray = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1, $where_in_array);
				
				
				
				
				
				
				
				
			if( $usersArray == 0 ){
				return 0;
			}else{
				return count($usersArray);
			};
			
		}
		
		private function __getLicensedUserCount(){
			
			$this->__setUsersModel();	
					
			$whereArray['organization_id'] = $this->organization_id;
			$whereArray['orgpaid'] = 1;

			$where_in_array = array(
				'field' => 'status_id',
				'ids' => array( 6)	
			);

			$usersArray = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1, $where_in_array);
				
			if( $usersArray == 0 ){
				return 0;
			}else{
				return count($usersArray);
			};
			
		}
			
		private function __getUserCountByBlock( $block_id ){
			
			$this->__setUsersModel();	
					
			$whereArray['block_id'] = $block_id;
			$whereArray['orgpaid'] = 1;
			
			$usersArray = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1 );
			
			if( $usersArray == 0 ){
				return 0;
			}else{
				return count($usersArray);
			};
			
		}	
			
		private function __getUserCountByOrganization(){
			
			$this->__setUsersModel();	
					
			$whereArray = array(
				'orgpaid' => 1,
				'organization_id' => $this->organization_id
			);
			
			$usersArray = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1 );
			
			if( $usersArray == 0 ){
				return 0;
			}else{
				return count($usersArray);
			};
			
		}
			
	public function getSubscriptionsorgs(){
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		
		$this->__setSubscriptionsorgsModel();

		$where_array['org_type'] = $this->org_type;
//		$where_array['count <='] = 150;

		$this->server_response['availableLicensesCount'] = $this->__getAvailableLicensesCount();		
		$this->getUnlicensedUsersCount = true; 
		$this->server_response['isOrgCreditOnFile'] = $this->__isOrgCreditOnFile();		
		$this->server_response['unlicencedCount'] = $this->getUnlicensedUsers();		
		$this->server_response['plans'] = $this->subscriptionsorgs_model->getManySubscriptionsorgsWhere($where_array);		
		echo json_encode($this->server_response);
		
	}
	
		private function __isOrgCreditOnFile(){
	    $this->__setOrganizationsModel();
			$whereArray = array(	'id' => $this->organization_id);
			$this->organizationArray = $this->organizations_model->getOrganizationWhere( $whereArray );
			return ( $this->organizationArray['stripe_customer_id'] == '' ? false: true);
		}

	  private function __sendInvoice($block_id){
	  	
	  	$blockArray = $this->__getBlock($block_id);
	  	
	  	$this->__setMessagesModel();
	  	
			if( $blockArray['subscription_interval'] == 1 ){
				$subscription_interval_nice = "a monthly";
				$nextBillingDateNice = $this->__getTimeLeftInMonthlySubscription($blockArray)['nextStartBillNiceDate'];
			} else {
				$subscription_interval_nice = "an annual";
				$nextBillingDateNice =  $this->__getTimeLeftInYearlySubscription($blockArray)['nextStartBillNiceDate'];
			}
	  	
			$this->message_id = 18; // email about subscription
			$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
			$this->template_id = $this->messageArray['sendgrid_template_id'];
			
			$this->addTo = $this->user_email;
			$this->setFrom = "admin@pictographr.com";
			
			$replace_whats['-usercount-'] =  $blockArray['paid'];
			$replace_whats['-domain-'] = $this->domain;
			$replace_whats['-given_name-'] = $this->user_given_name;
			$replace_whats['-charge-amount-'] = $blockArray['cost'];
			$replace_whats['-subscription_interval_nice-'] = $subscription_interval_nice;
			$replace_whats['-next-billing-date-'] = $nextBillingDateNice;
			
			$this->setSubject = $this->messageArray['email_subject'];
			
			$this->setText = $this->__customizeMessage( $this->messageArray['email_text'], $replace_whats );
			$this->setHtml = $this->__customizeMessage( $this->messageArray['email_html'], $replace_whats );

			$this->__sendgrid();
			
			$this->emailmyself_content .= $this->user_email . ' , ' . $this->user_given_name . ' from ' . $this->domain . ' was just charged '. $blockArray['cost'] . ' for a '. $subscription_interval_nice;

	  }
	  
	public function testSendInvoice(){
		
		//$this->__emailmyself('test');
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		$this->__sendInvoice(65);
		
	}
						
		private function __subscriptionStripeCharge(){
			
			try {
				
				$customer = Stripe\Customer::retrieve($this->stripe_customer_id);
				$this->stripe_subscription = $customer->subscriptions->create(array("plan" => $this->plan ));
				$this->server_response['status'] = 'succeeded';
				$this->subscriptionStripeCharged = true;
				
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
			
		private function __giveSeats( $addSeatCount, $block_id ){
			
			$today = date("Y-m-d");	
			$this->__setUsersModel();	
			
			$whereArray['organization_id'] = $this->organization_id;
			$where_in_array = array(
				'field' => 'status_id',
				'ids' => array( 1, 2, 4, 8)	
			);
			$usersArray = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "isOrgAdmin", $order_direction = "desc", $addSeatCount, $where_in_array );
			$this->userCountByBlock = 0;
			
			if( $usersArray > 0){
				
				foreach( $usersArray as $user){
					
					$user_id = $user['id'];
					$set_what_array['orgpaid'] = 1;
					$set_what_array['block_id'] = $block_id;
					$set_what_array['status_id'] = 6;
					$set_what_array['subscription_start'] = $this->subscription_start;
					$set_what_array['subscription_interval'] = $this->new_subscription_interval;
					$set_what_array['subscription_end'] = '';
					
					$this->users_model->updateUser( $user_id, $set_what_array );
					$this->userCountByBlock++;
				}
								
			}
			
			$setWhat['used'] = $this->userCountByBlock;
			$this->blocks_model->updateBlock( $block_id, $setWhat );
			
		}
	
	public function pickone(){
				
		$this->__setUsersModel();
		$this->isFrom = __FUNCTION__;
    $this->__getUserIdAndSessionIdWithSessionId();
    $this->__setOrganizationsModel();
    
		$whereArray = array(	'id' => $this->organization_id);
		$this->organizationArray = $this->organizations_model->getOrganizationWhere( $whereArray );
    
		$obj['stripe_customer_id'] = $this->organizationArray['stripe_customer_id'];
		$this->load->view('pickone_view', $obj);
		
	}
	
	public function credit(){
		
		$this->creditform();

	}
	
	public function seeUnlicensedUsers(){
		$this->google_id = 104384554224634036843;
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();
		
		$this->__setUsersModel();
		
		$today = date("Y-m-d");	
				
		$whereArray['organization_id'] = $this->organization_id;
		$whereArray['orgpaid'] = 0;
		
		$where_in_array = array(
			'field' => 'status_id',
			'ids' => array( 1, 4)	
		);

		$usersArray1 = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1, $where_in_array);


		//****
				
		$whereArray['organization_id'] = $this->organization_id;
		$whereArray['orgpaid'] = 1;
		$whereArray['status_id'] = 7;
		$whereArray['subscription_end <'] = $today;
		
		$usersArray2 = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "family_name", $order_direction = "asc", $count = -1);
		
		if( $usersArray2 != 0 ){
			echo '<pre>';print_r( count(array_merge($usersArray1, $usersArray2)));echo '</pre>';  exit;
		}else{
			echo '<pre>';print_r( count($usersArray1));echo '</pre>';  exit;
		};

		
		
		
		if( $usersArray == 0 ){
			$this->server_response['users'] = [];
		}else{
			foreach( $usersArray  as $userArray){
				$extendedArray = $userArray;
				$extendedArray['created'] = $this->__getNiceDate($userArray['created'])['niceDate'];
				$extendedArray['last'] = $this->__getNiceDate($userArray['last'])['niceDate'];
				$extendedsArray[] = $extendedArray;
			}
			
			$this->server_response['users'] = $extendedsArray;
			
		};
		
		echo json_encode($this->server_response);
				
	}
	
	public function checkUser(){
		$this->__setUsersModel();
		$this->isFrom = __FUNCTION__;	
		$this->__getUserIdAndSessionIdWithSessionId();
		echo "test";
	}
	
	public function checkUsers(){
			$this->google_id = 104384554224634036843;
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

			$this->__setUsersModel();	
			
			echo $this->organization_id."<br />";
			
			$whereArray['organization_id'] = $this->organization_id;
			$where_in_array = array(
				'field' => 'status_id',
				'ids' => array( 1, 4, 8)	
			);
			$usersArray = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "isOrgAdmin", $order_direction = "desc", -1, $where_in_array );

			echo '<pre>';print_r(  $usersArray );echo '</pre>';  exit;

	}
	
	public function checkBlocks(){
		
		echo "test"."<br />";
		
			$this->google_id = '104384554224634036843';
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

			$this->__setUsersModel();	
			
			$blocksArray = 	$this->__getBlocks($this->organization_id, $expire = -1);
			
			echo '<pre>hello';print_r(  $blocksArray  );echo '</pre>';  exit;

	}	

		
	public function test(){

		echo "test";
	}						
}
