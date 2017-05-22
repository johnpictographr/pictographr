<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Auth extends Payment {

	public function __construct() {
		parent::__construct();
	}

	/* ----------------------------------------------------------------------------------------------------------*/
	
	public function yo(){
		$this->__emailmyself(' using ' . $_SERVER['HTTP_USER_AGENT']);
			
	}
	
	public function whatsInSessionp() {
	
		echo '<pre>';print_r( $this->session->all_userdata() );echo '</pre>' . "<br /><br />";	
		
	}
	
	public function destroySessionP(){
		
		$this->session->sess_destroy();
		$response['status'] = 'destroyed sessionp';
		
		echo json_encode($response);	
		
	}
	
	public function sessiontest(){
		
		$this->__setUsersModel();
		$this->isFrom = __FUNCTION__; 
		$this->__getUserIdAndSessionIdWithSessionId();
		
		echo '<pre>';print_r( $this->session->all_userdata() );echo '</pre>' . "<br /><br />"; 
		
		if( isset( $_COOKIE['promo_code'] ) ) echo  "promo_code  :" . $_COOKIE['promo_code']. "<br />";
		if( isset( $_COOKIE['track_id'] ) ) echo  "track_id  :" . $_COOKIE['track_id']. "<br />";
		if( isset( $_COOKIE['market_id'] ) ) echo  "market_id  :" . $_COOKIE['market_id']. "<br />";
		if( isset( $_COOKIE['market_name'] ) ) echo  "market_name  :" . $_COOKIE['market_name']. "<br />";
	
		echo "encrypted google_id: " . $this->session->userdata('google_id') . "<br />";
		
		echo "dencrypted google_id: " .  $this->encrypt->decode($this->session->userdata('google_id')) . "<br /><br /><br /><br />";
		
		// $this->session->sess_destroy();
		
		echo "User is: " . $this->user_email . "<br />";
		
		return;
		

		$this->session->set_userdata('mytest', $this->encrypt->encode('123456789'));		
		if( $this->session->userdata('mytest') ){
			echo "test exist."."<br />";
		}else{
			echo "test Does not exist."."<br />";
		};
				
	}	
	
	/* FACEBOOK */
		
	public function facebook_login(){
		
		$this->__setUsersModel();
		
		$this->fbId = $this->input->post('arrData')['fbId'];
		
		if( ! $this->__fbUserExist() ){
			$this->__createNewFacebookUser();
		};
		
		$obj = array(
					'fbId' => $this->fbId
		);
		
		echo json_encode($obj);
	
	}		
		
		private function __fbUserExist(){
			
			$whereArray = array(
					'fbId' => $this->fbId
				);
						
			$resultArray = $this->users_model->getUserWhere( $whereArray );
			
			if( $resultArray != 0){
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}	
		
		private function __createNewFacebookUser(){
			
			$insert_array = array(
				'fbId' => $this->fbId
			);

			$this->user_id = $this->users_model->insertUser( $insert_array );				

			$insert_array = array(
				'user_id' => $this->user_id
			);
			
			$this->session_id = $this->sessions_model->insertSession( $insert_array );
			
			$set_what_array = array(
				'session_id' => $this->session_id
			);
			
			$this->users_model->updateUser( 
				$this->user_id, 
				$set_what_array 
			);
			
		}
		
	
	/* GOOGLE DRIVE */

	public function isAppRegisteredWithUser(){  //  localhost/pictographr/html/auth/isAppRegisteredWithUser
		
		$google_id = $this->input->get('arrData')['google_id'];

		if($google_id == ''){
			$response = 'false';
			echo json_encode($response);
			return;
		}
		
		$this->__setUsersModel();


		$whereArray = array(
						'google_id' => $google_id
					);
					
		$resultArray = $this->users_model->getUserWhere( $whereArray );		
		
		if( $resultArray != 0){
			
			$this->user_id = $resultArray['id'];
		
			$this->__connectGAPI();
			$this->__connectOAuth();
			
			$error = false;
						
			try {

				$this->client->setAccessToken( $resultArray['google_token_pictographr'] );
	
				$this->google_user = $this->oAuth->userinfo->get();
				
				$this->google_id = $this->google_user['id'];
				$this->user_email = $this->google_user['email'];	
				
			} catch (Google_ServiceException $e) {
			  $error = $e->getCode();
			} catch (Google_Exception $e) {
				
				
			  $error = $e->getCode();
			  
			  echo $error;
			}
			
			if( !$error){
				
				$response = 'true';
				
			} else{
				
				$response = 'false';
				
			}
		
		} else {
			$response = 'false';
		};	
			
		echo json_encode($response);	

	}		

	public function getAuthUrl(){ //  localhost/pictographr/html/auth/getAuthUrl
		
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
	
	public function registerWithGoogle(){ //  localhost/pictographr/html/auth/registerWithGoogle

		// THIS IS PASSED FROM AFTER USER ACCEPTS PICTOGRAPHR INTO DRIVE

		$this->__connectGAPI();
		$this->__connectDriveServices();
		$this->__connectOAuth();
		$this->__setUsersModel();
		$this->__setSessionsModel();
		
		if (isset($_GET['code'])) { 
		
				$this->__getGoogleUserTokenFromGAPI();
 
				if( $this->__googleUserExist() ){

					$this->__continueAfterRegister();
					
				}else{
					
						if( $this->__emailExist()){
							
							$this->__continueAfterRegister();
							
						}else{
							
							$this->__createNewGoogleUser();
							
							$this->__continueAfterRegister();
														
						};
					
				};

		} else{
			
			if( $this->session->userdata('selfclose') ){
				$this->session->unset_userdata('selfclose');
				$this->__selfWindowClose();
			}else{
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
	}

//	public function linkPictoUserToPartner(){
//		
//		$this->__paramIntoProperties($this->input->post('arrData'));
//		$this->__setUsersModel();
//		$this->__getUserIdAndSessionIdWithSessionId();
//		
//		$this->__insertNewUserPartner();
//		
//		$this->server_response['userPartner_id'] = $this->userPartner_id;	
//		$this->server_response['status'] = 'success';	
//		
//		echo json_encode($this->server_response);	
//		
//	}	
	
		private function __continueAfterRegister(){
			
			$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
			$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));
			
			// PLACEHOLDER-USERS.ORGANIZATION_ID=SOMETHING if ( $this->google_org_domain != '' )( this-> )does domain exit - > this->orgaanization_id ... update user set origaizatio_id = this->organization_id

			$this->__setOrCreateOrganization();
			
			if( isset( $_COOKIE['partner_id'] ) ){
				$this->partner_id = $_COOKIE['partner_id'];
				$this->partner_userId = $_COOKIE['partner_userId'];
				$this->__insertNewUserPartner();				
			};

			$this->__storeTokenGoogleUser();
			
			$this->__insertUserPartnerRecord();
			
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
		
//		protected function __insertNewUserPartner(){
//			$this->__setUsersPartnersModel();
//			if( !$this->__doesUserExistForPartner(  $this->partner_id, $this->partner_userId ) ){
//				$insert_array['partner_id'] = $this->partner_id;			
//				$insert_array['partner_userId'] = $this->partner_userId;		
//				$insert_array['google_id'] = $this->google_id;
//				$insert_array['user_id'] = $this->user_id;
//				$this->userPartner_id = $this->userspartners_model->insertUserPartner( $insert_array );
//			};
//
//		}
	
		protected function __selfWindowClose(){
			?>

				<script>
					
					(function(){

						setTimeout(function(){
						 window.close();
						}, 500);
						
									
					})();
				
				</script>
				
			<?php
		}
				
		protected function __insertUserPartnerRecord(){
			
			if( $this->session->userdata('partner_id') ){
			
				$this->__setUsersPartnersModel();
				$this->partner_id = $this->session->userdata('partner_id');
				if( ! $this->__userIdInPartnerExist(  $this->partner_id, $this->user_id ) ){
					$insert_array['partner_id'] = $this->partner_id;			
					$insert_array['google_id'] = $this->google_id;
					$insert_array['user_id'] = $this->user_id;
					
					if( $this->session->userdata('xuser_id') ) $insert_array['xuser_id'] = $this->session->userdata('xuser_id');
					
					$this->userPartner_id = $this->userspartners_model->insertUserPartner( $insert_array );
				};
				$this->session->unset_userdata('partner_id');
				
			};
		}
//
//	public function getGoogleIdFromPartner(){
//		
//		$this->__paramIntoProperties($this->input->post('arrData'));
//		$this->__setUsersPartnersModel();
//		
//		if( $this->__doesUserExistForPartner(  $this->partner_id, $this->partner_userId ) ){
//			
//			$this->server_response['google_id'] = $this->google_id;
//			$this->server_response['user_id'] = $this->user_id;
//			
//			$this->server_response['status'] = 'success';
//			echo json_encode($this->server_response);					
//		} else{
//			$this->server_response['status'] = 'error';
//			echo json_encode($this->server_response);					
//		};
//		
//	}
//			
	public function getGoogleIdFromEmail(){
		
		$this->__setUsersModel();
		$this->user_email = $this->input->post('arrData')['user_email'];

		if( $this->__emailExist()){
			
			$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
			$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));		
				
			$this->server_response['status'] = 'success';
			$this->server_response['google_id'] = $this->google_id;

			
		}else{
			
			$this->server_response['status'] = 'error';
			
		};
		
		header('Access-Control-Allow-Origin: *');
		echo json_encode($this->server_response);
		
	}
	
		private function __userIdInPartnerExist( $partner_id, $user_id ){

			$whereArray = array(
					'partner_id' => $partner_id,
					'user_id' => $user_id,
				);
						
			$resultArray = $this->userspartners_model->getUsersPartnerWhere( $whereArray );
			
			if( $resultArray != 0){

				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
			
		private function __doesUserExistForPartner( $partner_id, $partner_userId ){

			$whereArray = array(
					'partner_id' => $partner_id,
					'partner_userId' => $partner_userId,
				);
						
			$resultArray = $this->userspartners_model->getUsersPartnerWhere( $whereArray );
			
			if( $resultArray != 0){
				
				$this->google_id = $resultArray['google_id'];
				$this->user_id = $resultArray['user_id'];
				
				$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
				$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));

				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}	

		protected function __getGoogleUserTokenFromGAPI(){

			$this->client->authenticate( $_GET['code'] );
			
			$NUM_OF_ATTEMPTS = 25;
			$attempts = 0;
			
			do {
			
			    try
			    {
			        $this->accessToken = $this->client->getAccessToken();
			    } catch (Exception $e) {
			        $attempts++;
			        sleep(1);
			        continue;
			    }
			
			    break;
			
			} while($attempts < $NUM_OF_ATTEMPTS);
			
			
			

			$this->google_user = $this->oAuth->userinfo->get();
//			echo '<pre>';print_r($this->google_user);echo '</pre>';  exit;
			$this->google_id = $this->google_user['id'];
			$this->user_email = $this->google_user['email'];				
			$this->given_name = $this->google_user['given_name'];				
			$this->google_org_domain = ( isset($this->google_user['hd'])  ? $this->google_user['hd']: '' );				
			$this->family_name = $this->google_user['family_name'];				
			$this->name = $this->google_user['name'];				
			$this->picture = $this->google_user['picture'];				
			$this->locale = $this->google_user['locale'];				
			
		}

	public function googleUserExist(){
		
		$this->__setUsersModel();
		
		if( $this->input->post() ) $this->__paramIntoProperties($this->input->post('arrData'));
		
		$whereArray = array(
				'google_id' => $this->google_id
			);
					
		$resultArray = $this->users_model->getUserWhere( $whereArray );
		
		if( $resultArray != 0){
			
			$this->user_id = $resultArray['id'];
			$this->session_id = $resultArray['session_id'];
			
			$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
			$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));		
			
			$response['exist'] = 'true';
			$response['name'] = $resultArray['name'];
			$response['organization_id'] = $resultArray['organization_id'];
			$response['isOrgAdmin'] = $resultArray['isOrgAdmin'];
			$response['isSuper'] = $resultArray['isSuper'];
			$response['isStudent'] = $resultArray['isStudent'];
			$response['isTeacher'] = $resultArray['isTeacher'];
			$response['subdomain_id'] = $resultArray['subdomain_id'];
			$this->server_response['google_id'] = $this->google_id;
			
		} else {
			
			$response['exist'] = 'false';
			
		}
		
		$this->__settingSessionP('domain'); // PLACEHOLDER-USERS.ORGANIZATION_ID=SOMETHING
		
		header('Access-Control-Allow-Origin: *');
		echo json_encode($response);	
		
	}
		
		protected function __googleUserExist(){
			
			$whereArray = array(
					'google_id' => $this->google_id
				);
				
			$resultArray = $this->users_model->getUserWhere( $whereArray );
			
			if( $resultArray != 0){
				
				$this->user_id = $resultArray['id'];
				$this->session_id = $resultArray['session_id'];
				$this->organization_id = $resultArray['organization_id']; 
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}	
		
		protected function __storeToken(){
			
			$set_what_array = array(
				'google_token_pictographr' => $this->accessToken
			);
			
			if( $this->session->userdata('isOrgAdmin')){
				$set_what_array['isOrgAdmin'] = 1;
			};
			
			$this->users_model->updateUser( 
				$this->user_id, 
				$set_what_array 
			);
			
		}

		protected function __emailExist(){
			
//			echo "__emailExist "."<br />";
			
			$whereArray = array(
					'email' => $this->user_email 
			);

			$resultArray = $this->users_model->getUserWhere( $whereArray );
			
			if( $resultArray != 0 ){
				
				$this->user_id = $resultArray['id'];
				$this->google_id = $resultArray['google_id'];
				$this->organization_id = $resultArray['organization_id']; 
			
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}
			
		}
	
		protected function __storeTokenGoogleUser(){

			$set_what_array = array(
				'google_id' => $this->google_id,
				'given_name' => $this->given_name,
				'family_name' => $this->family_name,
				'name' => $this->name,
				'picture' => $this->picture,
				'locale' => $this->locale
			);

			$set_what_array['google_token_pictographr'] = $this->accessToken;
			
			if( $this->session->userdata('isOrgAdmin')){
				$set_what_array['isOrgAdmin'] = 1;
			};
			
			if( isset(  $this->organization_id ) ){
				$set_what_array['organization_id'] = $this->organization_id;
			}
			
			$this->users_model->updateUser( 
				$this->user_id, 
				$set_what_array 
			);	
			
		}
	
		protected function __createNewGoogleUser(){
			
			$this->__setMarketsModel();
			
//			$this->marketsArray = $this->markets_model->getMarketWhere( array(
//					'id' => ( isset(  $_COOKIE['market_id'] ) ? $_COOKIE['market_id'] : 1)
//			));

			$this->marketsArray = $this->markets_model->getMarketWhere( array(
					'id' => $this->market_id 
			));
						
			$this->message_id = 1; // Making obsolete

			//$this->__getGeoLocation();
			
			$this->trial_start = date('Y-m-d');
			
			$insert_array = array(
				'allowEmailPromotion' => 1,
				'email' => $this->user_email,
				'google_id' => $this->google_id,
				'given_name' => $this->given_name,
				'family_name' => $this->family_name,
				'name' => $this->name,
				'picture' => $this->picture,
				'locale' => $this->locale,
				'promotion_credits' => $this->marketsArray['initial_credits'],
				'market_initial_credits' => $this->marketsArray['initial_credits'],
				'message_id' => $this->message_id,
				'market_id' => $this->market_id,
				'market_name' => $this->marketsArray['name'],
				'market_max_promo' => $this->marketsArray['max_promo'],
				//'geo_location' =>  substr($this->geo_location,0, 120),
				'ip' => $_SERVER['REMOTE_ADDR'],
				'status_id' => 1, // initial
				'trial_start' => $this->trial_start,
				'trial_end' => $this->__calcTimeLeftInTrial(date('Y-m-d'), $this->marketsArray['initial_credits'])['endDate']
			);
			
			$insert_array['google_token_pictographr'] = $this->accessToken;

			if( $this->session->userdata('subdomain_id') ){
				$this->__email_subdomain();
				$insert_array['subdomain_id'] = $this->session->userdata('subdomain_id');
			};

			if( $this->session->userdata('isStudent') ){
				$insert_array['isStudent'] = $this->session->userdata('isStudent');
			};

			if( $this->session->userdata('isTeacher') ){
				$insert_array['isTeacher'] = $this->session->userdata('isTeacher');
			};
			
			$emailIt = $this->given_name . ' ' . $this->family_name . ' is being created using ' . $_SERVER['HTTP_USER_AGENT'];
			
			if( $this->session->userdata('partner_id') ){
				$emailIt .= ' -- PARTNER: ' . $this->session->userdata('partner_id');
			} 
			
			$this-> __logToFile($emailIt);
			
			
			if( isset( $_COOKIE['track_id'] ) ){
				$insert_array['track_id'] = $_COOKIE['track_id'];
			};
			
			if(  isset(  $_COOKIE['market_id'] ) && $_COOKIE['market_id'] == 13){ // free users
				
			 $insert_array['status_id'] = 10;
				
			};

			$this->user_id = $this->users_model->insertUser( $insert_array );
			
			if( $this->marketsArray['auto_promo'] == 1 ){
				$this->__genOnePromoCode();
			};
			
			$this->__insertUserPartnerRecord();
			
			$this->__createRequiredFolders();	
				
//			if( isset( $_COOKIE['partner_id'] ) ){
//				
//				$this->partner_id = $_COOKIE['partner_id'];
//				$this->partner_userId = $_COOKIE['partner_userId'];
//				$this->__insertNewUserPartner();
//				
//				$set_what_array = array(
//					'partner_id' => $this->partner_id
//				);
//				
//				$this->users_model->updateUser( 
//					$this->user_id, 
//					$set_what_array 
//				);
//			}

			$this->__email_welcome();

		}
		
		protected function __email_subdomain(){	
				
			$this->__setSubdomainsModel();
			
			$whereArray = array(
				'id' => $this->session->userdata('subdomain_id')
			);
			
			$this->subdomainArray = $this->subdomains_model->getsubdomainWhere( $whereArray);
			$viewsNow = $this->subdomainArray['views'] + 1;
			$district = $this->subdomainArray['district'];
			$student_size = $this->subdomainArray['student_size'];
			$city = $this->subdomainArray['city'];
			$state = $this->subdomainArray['state'];
			$website = $this->subdomainArray['website'];
			$tel = $this->subdomainArray['tel'];

			$message = $this->name . 
								 ' from ' .
								 $student_size . ' ' .
								 $district .
								 ' just registered. ' .
								 $this->user_email . ' ' .
								 $this->given_name . ' ' .
								 $this->family_name . ' ' .
								 $website . ' ' .
								 $tel . ' ' .
								 ' Views: ' . $viewsNow;
								 
			$this->__emailmyself($message);
			
		}		
		
		protected function __email_welcome(){
			
			if( isset( $this->promoDoesExist ) ){
				
				$this->__setTracksModel();
				$this->tracksArray = $this->tracks_model->getMarketFromLeftJoinedTracks($this->track_id);
				$email_text = $this->tracksArray[0]['track_welcome_email'];
				$email_text =  str_replace('-weeksfree-', $this->combinedCredits, $email_text);	
				
			}else{
				
				$this->__setMarketsModel();
				$this->marketsArray = $this->markets_model->getMarketWhere( array( 'id' => $this->market_id));
				
				$email_text = $this->marketsArray['welcome_email'];		
						
			};

			$email_text =  str_replace('-given_name-', $this->given_name, $email_text);					
			
			$this->setHtml = $email_text;
			$this->setText = $email_text;
			$this->setSubject = "Welcome to Pictographr.";
			
			$this->addTo = $this->user_email;
			$this->setFrom = "admin@pictographr.com";
			$this->__sendgrid();
			
		}		
		
		public function generate_folders(){ //http://pictographr.com/auth/generate_folders
			
			$this->google_id = '105870981217629422585';
			if( !$this->connected ) $this->__connect();
			$this->__createRequiredFolders();

		}
		
		protected function __callWindowOpenerFunction(){
			
			?>

				<script>
					
					(function(){
						
						window.opener.callbackFromWindowOpener('<?php echo $this->google_id; ?>' );

						setTimeout(function(){
						 window.close();
						}, 500);
						
									
					})();
				
				</script>
				
			<?php

		}
		
	public function setPSession(){	
		
			$this->__paramIntoProperties($this->input->post('arrData'));
			$this->__setUsersModel();
			$this->isFrom = __FUNCTION__; 
			$this->__getUserIdAndSessionIdWithSessionId();
			
			$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
			$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));
			
			$data['status'] =  'google_id is now stored in p_session';
			$data['google_id_from_encryption'] =  $this->__getSessionGoogleId();
			
			header('Access-Control-Allow-Origin: *');
			echo json_encode($data);
			
	}

	public function setSessionIframe(){	
		
			$this->__paramIntoProperties($this->input->get());
			$this->__setUsersModel();
			$this->isFrom = __FUNCTION__; 
			$this->__getUserIdAndSessionIdWithSessionId();
			
			$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
			$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));
			
	}
	
	public function authWithGoogle(){ //  localhost/pictographr/html/auth/authWithGoogle
		
		$this->__setUsersModel();
		$this->__setSessionsModel();	
			
		$this->google_id = $this->input->post('arrData')['google_id'];
		$this->isFrom = __FUNCTION__; 
		$this->__getUserIdAndSessionIdWithSessionId();


		if( $this->userResultArray != 0){
			
			$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
			$this->session->set_userdata(array('user_id'  => $this->encrypt->encode($this->user_id)));			
			
			$this->__isUserActive();

			if( isset($this->input->post('arrData')['refer']) ){
				$refer = $this->input->post('arrData')['refer'];
				$this->redeemReferral($refer);
			};				
			
			if( isset($this->input->post('arrData')['market_id']) ){
				
				$this->__saveGeoLocationUserMarket( $this->input->post('arrData')['market_id'], $this->input->post('arrData')['market_name']);

			} else{
				
				$this->__saveGeoLocationUserMarket( 1, 'pictographr');
				
			};

			$data['test'] =  'this is good test';
			$data['google_id_from_encryption'] =  $this->__getSessionGoogleId();
			
			echo json_encode($data);

			
		}else{
			echo "false";
		};
	}
	
		private function __isUserActive(){
			
			$today = date("Y-m-d");
			
			if( in_array($this->status_id, array(1, 2, 4))){ // initial or extended or trial expired

				$endDate = $this->__calcTimeLeftInTrial($this->userResultArray['trial_start'], $this->totalCredits)['endDate'];

				$set_what_array['trial_end'] = $endDate;

				// $endDate = $this->userResultArray['trial_end'];
				
				$new_status_id = 4; // trial expired
				
			} elseif($this->status_id == 7) { // limited
				
				$endDate = $this->userResultArray['subscription_end'];
				
				$new_status_id = 8; // subscribtion expired
				
			} else{
				
				return;
					
			};
			
			if ($endDate < $today) {
			
					$set_what_array['status_id'] = $new_status_id;
				
			}
			
			
			if( isset($set_what_array) ){
				
				$this->users_model->updateUser( 
					$this->user_id, 
					$set_what_array 
				);					
				
			};

			
		}		
		
		private function __saveGeoLocationUserMarket($market_id, $market_name){
			
			//$this->__getGeoLocation();
			$this->__setUsersMarketsModel();
			
			
			$insert_array = array(
					 'market_id' => $market_id,
					 'market_name' => $market_name,
					 'ip' =>  $_SERVER['REMOTE_ADDR'],
					 //'geo_location' =>  substr($this->geo_location,0, 120),
					 'user_id' => $this->user_id
			);
			
			if( isset( $_COOKIE['track_id'] ) ){
				$insert_array['track_id'] = $_COOKIE['track_id'];
			};
			
			$this->usersmarkets_model->insertUsersMarket($insert_array	);	
		}
		
		private function __draftAlreadyExist(){
			$this->__setDraftsModel();			
					
			$whereArray = array(
				'fileId' => $this->fileId
			);
			
			$resultsArray = $this->drafts_model->getDraftWhere( $whereArray );
			
			if( $resultsArray != 0){
				
				$this->draft_id = $resultsArray[0]['id'];
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
		}

		private function __redirectToStoreSessionInCookieHtml(){

			$url = base_url() . "storeSessionInCookie.html?session=" . 
							$this->session_id . 
							"&key=" . $this->key . 
							"&launchHow=" . $this->launchHow . 
							
							( isset($this->draft_id) ? "&draft_id=" . $this->draft_id : "" ) .
							
							( $this->launchWithDriveImage ? 
							
								"&launchWithDriveImage=1" .
								"&width=" . $this->width .
								"&height=" . $this->height .
								"&imgSrc=" . $this->imgSrc .
								"&fileId=" . $this->fileId
								
								: "&launchWithDriveImage=0" );
		
			?>
			
				<script>
					
					(function(){
						
						window.location.assign('<?php echo $url; ?>');
						
					})();
				
				</script>
				
			<?php

		}
		
	
	public function router(){
			$this->obj['version'] = $this->version;
			$this->load->view('router_view', $this->obj );
	}
		
	public function welcome(){ //  localhost/pictographr/html/auth/welcome

		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		
		$this->__setTermsModel();
		$this->__setPrivacyModel();
/*		
		if( $this->user_track_id != 0 ){
			
			$this->__setTracksModel();
			$this->tracksArray = $this->tracks_model->getMarketFromLeftJoinedTracks($this->user_track_id);
			$modal_text = $this->tracksArray[0]['track_welcome_modal'];
			$email_text = $this->tracksArray[0]['track_welcome_email'];
			$promo_message = $this->tracksArray[0]['market_promo_message'];
			
		}else{
			
			$this->__setMarketsModel();
			$this->marketsArray = $this->markets_model->getMarketWhere( array( 'id' => $this->user_market_id));
			
			$modal_text = $this->marketsArray['welcome_modal'];
			$promo_message = $this->marketsArray['promo_message'];			
					
		};
		
*/

		$this->__setMarketsModel();
		$this->marketsArray = $this->markets_model->getMarketWhere( array( 'id' => $this->user_market_id));
		
		$modal_text = $this->marketsArray['welcome_modal'];
		$promo_message = $this->marketsArray['promo_message'];
		
		if( $this->__promoCodeExistfor( $this->user_id ) ){
			$promocode = $this->promoArray['code'];
			$promoexpires = $this->promoArray['reserve_expiration_date'];
			$promoexpiresDate = new DateTime($promoexpires);
			$nicePromoExpiresDate = $promoexpiresDate->format('M d, Y');	
		}else{
			$promocode = 'None';
			$nicePromoExpiresDate = 'Future';
		};

		$modal_text =  str_replace('-given_name-', $this->user_given_name, $modal_text);		
		$modal_text =  str_replace('-weeksfree-', $this->user_promotion_credits, $modal_text);	
		$promo_message =  str_replace('-promo-code-', $promocode, $promo_message);	
		$promo_message =  str_replace('-expires-', $nicePromoExpiresDate, $promo_message);
		
		$this->__getFirstAddon();

		$response = array(
			'track_id' => $this->user_track_id,
			'market_id' => $this->user_market_id,
			'welcome_text' => $modal_text,
			'first_partners_id' => $this->firstPartnerId,
			'promo_message' => $promo_message,
			'terms' => $this->terms_model->getTermWhere( array('id' => 1))['content']
		);

		
		$response['user_name'] = $this->user_name;
		$emailIt = $this->user_name  . " was welcomed.";
		$this-> __logToFile($emailIt);
		
		
		echo json_encode($response);
		
	}
	
	
		protected function __getFirstAddon(){
			
			$this->__setUsersPartnersModel();
			
			$what_array['user_id'] = $this->user_id;
			
			if( $this->userspartners_model->getAllUsersPartnersWhere( $what_array ) == 0 ){
				$this->firstPartnerId = 0;
			}else{
				$this->firstPartnerId = $this->userspartners_model->getAllUsersPartnersWhere( $what_array )['results'][0]['partner_id'];
			};
			
			
			
			
		}
	
	public function faq(){
		$response = array(
			'status' => 'success'
		);	
			
		echo json_encode($response);
	}	
	
	public function contactus(){
		$response = array(
			'status' => 'success'
		);	
			
		echo json_encode($response);
	}			
	
	public function showmehow(){
		$response = array(
			'status' => 'success'
		);	
			
		echo json_encode($response);
	}	
	
	public function preferences(){ //  localhost/pictographr/html/auth/preferences
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		$this->__setMarketsModel();

		$this->marketsArray = $this->markets_model->getMarketWhere( array( 'id' => $this->user_market_id));
		$promo_message = $this->marketsArray['promo_message'];
		
		$response = array(
			'promo_message' => $promo_message,
			'allowEmailPromotion' => $this->allowEmailPromotion
		);	
			
		echo json_encode($response);
		
	}	
	
	public function toggleAccept() {
		
		//		$this->__setUsersModel();
		//		$this->__paramIntoProperties($this->input->post('arrData'));
		//		$where_array['session_id'] = $_COOKIE['session_id'];
		// 		$updated = $this->users_model->update_table_where( $where_array, $set_what_array  );

		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		
    $emailIt = $this->user_name . " has accempted Terms.  ";
    foreach( $this->os  as  $key => $value){
    	$emailIt = $emailIt . $key . " " . $value . " - ";
    }
    $this-> __logToFile($emailIt);
		
		$set_what_array[$this->field] = $this->value; 
		$updated = $this->users_model->updateUser( $this->user_id, $set_what_array  );
		
		$response['success'] = true;
		$response['updated'] = $updated;
		$response['set_what_array'] = $set_what_array;
		$response['market_name'] = $this->user_market_name;
		$response['session_id'] = isset($_COOKIE['session_id']) ? $_COOKIE['session_id']: '' ;
		
		echo json_encode($response);
		
	}
	
		
	public function unsubscribe(){   
		
		$this->__paramIntoProperties($this->input->get());
		$this->field = 'allowEmailPromotion';
		$this->value = 0;
		$this->user_id = $this->ilmyu;
		$this->toggleAccept();
		// https://pictographr.com/auth/unsubscribe?ilmyu=-ilmyu-
		
	}
	
	public function emailLocalPromo(){//http://pictographr.com/auth/emailLocalPromo
		
			$this->message_id = 8;
			$this->user_id = 1;
		
			$this->addTo = 'josephming@yopmail.com';
			$this->setFrom = 'jamesming@gmail.com';
			$this->setSubject = 'test subject';
			$this->setHtml = $this->setText = 'This is a test';

			$this->subs = array (
			    "-ilmyu-" => array (
			        $this->user_id
			    )
			);

			$this->__sendgrid();
		
	}
	
	public function testWelcome() {
		
		$this->isFrom = __FUNCTION__; 
		$this->__setAndConnectToGoogle();

		
		$this->__setMarketsModel();
		$this->__setTermsModel();
		$this->__setPoliciesModel();
		$this->__setMessagesModel();
		$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );

		$modal_text = $this->messageArray['modal_text'];
		
		$modal_text =  str_replace('-market_name-', $this->market_name, $modal_text);

		$response = array(
			'modal_text' => $modal_text
		);
		
		echo '<pre>';print_r(  $response  );echo '</pre>';  exit;
		
		
	}
	
	public function testTrack() {

				$this->__setTracksModel();
				$this->tracksArray = $this->tracks_model->getMarketFromLeftJoinedTracks($_GET['track_id']);	
				
				echo '<pre>';print_r( $this->tracksArray  );echo '</pre>';  exit;
	}
	
	public function test() {
				echo "test";
				echo '<pre>';print_r( $this->input->get()  );echo '</pre>';  exit;
	}

}
