<?php
class Base_Controller extends CI_Controller {

	protected $_data;
	protected $_google_client_id;
	protected $_google_client_secret;
	protected $_google_redirect_url;
	protected $_developerKey;
		
	
	function __construct() {
		
		parent::__construct();
		
		/*
		
			SELECT * FROM `users` WHERE email = 'simonpictographr@gmail.com'
			SELECT * FROM `users` WHERE email = 'joanpictographr@gmail.com'
			SELECT * FROM `users` WHERE email = 'johnpictographr@gmail.com'
			SELECT * FROM `users` WHERE email = 'jamesming@pictographr.com'
		
		*/
		
		//This is a test
		
		//$this->localhost_google_id = '105870981217629422585';// jamesming@gmail.com	
		//$this->localhost_google_id = '116349291978455119856';// simonpictographr@gmail.com	
		//$this->localhost_google_id = '109665946167772463485';// gamer13027@gmail.com
		//$this->localhost_google_id = '103837443642163318978'; // BRUCE BANNER
		//$this->localhost_google_id = '104384554224634036843';  // jamesming@pictographr.com	
		//$this->localhost_google_id = '111733626762695299600';  // joanpictographr@gmail.com
		$this->localhost_google_id = '104530712385857206971';  // johnpictographr@gmail.com
		
		$this->version = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 1000);
		//$this->version = '100000000001';
		
		ini_set('display_errors', 1);
		
		if( isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] == 'www.pictographr.com'){
			
			header('Location: https://pictographr.com');
			exit;	
		}

		$this->connected = false;	
		$this->dbGroup = 'pictographr';
		$this->web_server_path = '/var/www/pictographr/';
		$this->upload_path = 'temp';
		$this->template_path = 'templates';
		
		if( isset($_SERVER['HTTP_HOST']) ){
			if( $_SERVER['HTTP_HOST'] == 'www.pictographr.com' || $_SERVER['HTTP_HOST'] == 'pictographr.com' ) $this->project = 'pictographr';
			if( $_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == 'beta.pictographr.com' ) $this->project = 'pictographr';
		};

		date_default_timezone_set('America/Los_Angeles');

		$this->project = 'pictographr';
		$this->_google_client_id 		= '971250203842-rbjl54u2ui93ccb0b2ctkfkonqvmrnsp.apps.googleusercontent.com';
		$this->_google_client_secret 	= 'dNAdLdRw9rQy3hhfba5hX0H0';
		$this->_developerKey 	= 'AIzaSyBHPj7mLukBankt5SE1Vu-fPfn5v24_zAU';
		$this->_google_redirect_url 	= 'https://pictographr.com/auth/registerWithGoogle';
					
		$this->market_id = 25;
		$this->track_id = 18; 

		$this->load->library('encrypt');

	}
	
		protected function __connect(){

			$this->__setUsersModel();
			$this->__setDomainsModel();
			$this->__getUserIdAndSessionIdWithSessionId();
			$this->__connectGAPI();
			$this->__connectDriveServices();
			$this->client->setAccessToken( $this->google_token_pictographr );				
			$this->connected = true;	
		}
	
		protected function __getSessionGoogleId(){	

			return $this->encrypt->decode($this->session->userdata('google_id'));
			
		}
	
		protected function __setAndConnectToGoogle(){
			
			$this->__paramIntoProperties($this->input->post('arrData'));
			
			$this->place = '0';
			
			if( $_SERVER['HTTP_HOST'] == 'localhost' ) {
				
				$this->google_id = $this->localhost_google_id;
				
			} elseif( !isset( $this->google_id ) && !$this->__getSessionGoogleId() == FALSE ){
				
				$this->place = '1';
				
				$this->google_id = $this->__getSessionGoogleId();
				
			} elseif( !isset( $this->google_id ) ) {
				
				$this->place = '2';
				
				header('Location: https://pictographr.com/fail/3.html');
				
			}
			
	    if( !$this->connected ) $this->__connect();
	    
		}	
					
		protected function __getUserIdAndSessionIdWithSessionId(){

			if( isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] == 'localhost' ){
				
				$whereArray = array(
					'google_id' => $this->localhost_google_id 
				);	
									
			} elseif(( !isset( $this->google_id ) && !$this->__getSessionGoogleId() == FALSE ) ){


				$this->place = '5';

				$whereArray = array(
					'google_id' => $this->__getSessionGoogleId()
				);	
				
//				echo "A"."<br />";
				
			} elseif(  isset( $this->google_id ) &&  $this->google_id != ''){
				
				$this->place = '6';				
				
				$whereArray = array(
					'google_id' => $this->google_id
				);
				
//				echo "B"."<br />";	
								
			} else{
				
				$this->place = '7';
				
				echo "Augh. Our bad. Please help us determine what went wrong by describing what you did in the Contact Pictographr interface located in the Account Settings Menu.";
				
				if(  isset( $this->google_id ) ){
					$this->__emailmyself('FAILED with google_id' . $this->google_id);
				}else{
					
					if( isset( $this->isFrom ) ){
						
						$emailIt = '************  FAILED place 7. No google_id set. Coming from' . $this->isFrom;

					} else{
						
						$emailIt = '************  FAILED place 7. No google_id set. Coming from Coming from who knows';

					}
						
					$this-> __logToFile($emailIt);
					$this->__emailmyself($emailIt);
					
				};
				
				

				//header('Location: https://pictographr.com/fail/1.html');
				exit;
			}
			
			$this->userResultArray = $this->users_model->getUserWhere( $whereArray );

			if( $this->userResultArray == 0) {
				
				//echo "Google User: " . $this->google_id . " does not have an account in pictographr_db.<br /><br /><br />" ;	
				//header('Location: https://pictographr.com?failed=112');
				
				echo '<pre>$whereArray';print_r(  $whereArray );echo '</pre>';  exit;

				header('Location: https://pictographr.com/fail/2.html');
				
			}

			$this->user_id = $this->userResultArray['id'];
			$this->acceptTerms = $this->userResultArray['acceptTerms'];
			$this->google_id = $this->userResultArray['google_id'];
			$this->google_token_pictographr = $this->userResultArray['google_token_pictographr'];
			$this->user_email = $this->userResultArray['email'];
			$this->isOrgAdmin = $this->userResultArray['isOrgAdmin'];
			$this->orgpaid = $this->userResultArray['orgpaid'];
			$this->user_block_id = $this->userResultArray['block_id'];
			$this->user_name = $this->userResultArray['name'];
			$this->user_family_name = $this->userResultArray['family_name'];
			$this->user_given_name = $this->userResultArray['given_name'];
			$this->session_id = $this->userResultArray['session_id'];
			$this->pictoTempFolderId = $this->userResultArray['pictoTempFolderId'];
			$this->pictoTopFolderId = $this->userResultArray['pictoTopFolderId'];
			$this->pictoFolderId = $this->userResultArray['pictoFolderId'];
			$this->pictoImageFolderId = $this->userResultArray['pictoImageFolderId'];
			$this->pictoTemplateFolderId = $this->userResultArray['pictoTemplateFolderId'];
			$this->pictoPdfFolderId = $this->userResultArray['pictoPdfFolderId'];
			$this->pictoShareFolderId = $this->userResultArray['pictoShareFolderId'];
			$this->message_id = $this->userResultArray['message_id'];
			$this->user_track_id = $this->userResultArray['track_id'];
			$this->user_referral_credits = $this->userResultArray['referral_credits'];
			$this->user_promotion_credits = $this->userResultArray['promotion_credits'];
			$this->user_promo_bonus = $this->userResultArray['promo_bonus'];
			$this->user_paid_credits = $this->userResultArray['paid_credits'];
			$this->user_message_id = $this->userResultArray['message_id'];
			$this->user_start_id = $this->userResultArray['start_id'];
			$this->user_transition_id = $this->userResultArray['transition_id'];
			$this->user_market_name = $this->userResultArray['market_name'];
			$this->user_market_id = $this->userResultArray['market_id'];
			$this->user_market_max_promo = $this->userResultArray['market_max_promo'];
			$this->isSocial = $this->userResultArray['isSocial'];
			$this->allowEmailPromotion = $this->userResultArray['allowEmailPromotion'];
			$this->google_token_pictographr = $this->userResultArray['google_token_pictographr'];
			$this->stripe_customer_id = $this->userResultArray['stripe_customer_id'];
			$this->stripe_subscription_id = $this->userResultArray['stripe_subscription_id'];
			$this->subscription_start = $this->userResultArray['subscription_start'];
			$this->subscription_end = $this->userResultArray['subscription_end'];
			$this->subscription_interval = $this->userResultArray['subscription_interval'];
			$this->user_subscription_id = $this->userResultArray['subscription_id'];
			$this->trial_start = $this->userResultArray['trial_start'];
			$this->status_id = $this->userResultArray['status_id'];
			$this->hasCreditCardOnFile = ( $this->userResultArray['stripe_customer_id'] != '' ? TRUE : FALSE);
			$this->typeOfPlan = ( $this->subscription_interval == 1 ? 'monthly': 'yearly');
			$this->initialPromoCredits = $this->userResultArray['market_initial_credits'];
		
			$this->totalCredits = $this->user_promotion_credits + $this->user_paid_credits + $this->user_referral_credits;
			$this->today = date("Y-m-d");
			
			$this->organization_id = $this->userResultArray['organization_id'];
			if( $this->organization_id != 0 ){
		    $this->__setOrganizationsModel();
				$whereArray = array(	'id' => $this->organization_id );
				$this->organizationArray = $this->organizations_model->getOrganizationWhere($whereArray);
				$this->domain = $this->organizationArray['domain'];
				$this->organization_name = $this->organizationArray['name'];
				$this->org_type = $this->organizationArray['org_type'];
				$this->stripe_customer_id = $this->organizationArray['stripe_customer_id'];
				$this->orgAcceptTerms = $this->organizationArray['acceptTerms'];
			};
			
			$this->userActive = true;

			if( in_array($this->status_id, array(1, 2, 4, 5))){ // initial and extended and trial expired and starts
				
				$set_what_array['trial_end'] = $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['endDate'];
				$this->howManyDaysLeft = $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['days'];
				
				if( $this->__userTrialExpired() ){
					
					$set_what_array['status_id'] = $this->status_id = 4;
					$this->userActive = false;
					
				} else{
					
					if( $this->status_id  !=  5 ){
						$set_what_array['status_id'] =  ( $this->totalCredits > $this->initialPromoCredits ? 2: 1);
					};
					
				};
				
				$this->users_model->updateUser( 
					$this->user_id, 
					$set_what_array 
				);					
				
			} elseif( in_array($this->status_id, array(7, 8))) { 

				if( $this->__userSubscriptionExpired() ){

					$set_what_array['status_id'] = $this->status_id = 8;
					$this->howManyDaysLeft = -1;
					$this->userActive = false;
					
				} else {
					
					$set_what_array['status_id'] = $this->status_id = 7;
					
					if( $this->subscription_interval == 1 ){
						$this->howManyDaysLeft = $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['days'];
						$set_what_array['subscription_end'] =  $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['endDate'];
					} else {
						$set_what_array['subscription_end'] =  $this->__getTimeLeftInYearlySubscription($this->userResultArray)['endDate'];
						$this->howManyDaysLeft = $this->__getTimeLeftInYearlySubscription($this->userResultArray)['days'];
					}
					
				};

				
				
			} elseif( in_array($this->status_id, array(9))) { 
				
				if( $this->__userSubscriptionExpired() ){
					$this->accountsData['userSubscriptionExpired'] = 'yes';
					$set_what_array['status_id'] = $this->status_id = 8;
					$this->howManyDaysLeft = -1;
					$this->userActive = false;
					
					$this->users_model->updateUser( 
						$this->user_id, 
						$set_what_array 
					);						
					
				} else {
					$this->accountsData['userSubscriptionExpired'] = 'no';
					if( $this->subscription_interval == 1 ){
						$this->howManyDaysLeft = $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['days'];
						$set_what_array['subscription_end'] =  $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['endDate'];
					} else {
						$set_what_array['subscription_end'] =  $this->__getTimeLeftInYearlySubscription($this->userResultArray)['endDate'];
						$this->howManyDaysLeft = $this->__getTimeLeftInYearlySubscription($this->userResultArray)['days'];
					}
				};

				
			} elseif( in_array($this->status_id, array(10, 11))) { // limited, subscription, transition canceled
				
				$this->howManyDaysLeft = 99999;	
				
			} else { // ongoing
				
				$this->howManyDaysLeft = 99999;	
				
			};
			
		}	

	/* ----------------------------------------------------------------------------------------------------------*/
	
	/* S3 */	
		protected function __connectS3(){
	
			$this->s3 = new PS3;		
			$this->bucketName = 'core-project-files';
			
		}
		
	/* ----------------------------------------------------------------------------------------------------------*/
	
	
	/* LZ */	
		protected function __connectLZ(){
	
			$this->lz = new LZ;		
			
			
		}
		
	/* ----------------------------------------------------------------------------------------------------------*/
	
	
	/* DATABASE */
	
		protected function __setSectorsModel(){
			if( !isset($this->sectors_model)){
				$this->sectors_model = new Models_Db_Sectors_Model;
				$this->sectors_model->setDatabaseGroup( $this->dbGroup );
			}
		}	
		
		protected function __setFaqsModel(){
			if( !isset($this->faqs_model)){
				$this->faqs_model = new Models_Db_Faqs_Model;
				$this->faqs_model->setDatabaseGroup( $this->dbGroup );
			}
		}	
		
		protected function __setShowmehowsModel(){
			if( !isset($this->showmehows_model)){
				$this->showmehows_model = new Models_Db_Showmehows_Model;
				$this->showmehows_model->setDatabaseGroup( $this->dbGroup );
			}
		}		
		protected function __setCollectionsModel(){
			if( !isset($this->collections_model)){
				$this->collections_model = new Models_Db_Collections_Model;
				$this->collections_model->setDatabaseGroup( $this->dbGroup );
			}
		}	

		protected function __setGroupsModel(){
			if( !isset($this->groups_model)){
				$this->groups_model = new Models_Db_Groups_Model;
				$this->groups_model->setDatabaseGroup( $this->dbGroup );
			}
		}	
		
	
		protected function __setSetsModel(){
			if( !isset($this->sets_model)){
				$this->sets_model = new Models_Db_Sets_Model;
				$this->sets_model->setDatabaseGroup( $this->dbGroup );
			}
		}	
	
		protected function __setTemplatesModel(){
			if( !isset($this->templates_model)){
				$this->templates_model = new Models_Db_Templates_Model;
				$this->templates_model->setDatabaseGroup( $this->dbGroup );
			}
		}

		protected function __setUsersModel(){
			if( !isset($this->users_model)){
				$this->users_model = new Models_Db_Users_Model;
				$this->users_model->setDatabaseGroup( $this->dbGroup );
			}
		}

		protected function __setClicksModel(){
			
			$this->leads_model = new Models_Db_Clicks_Model;
			$this->leads_model->setDatabaseGroup( $this->dbGroup );
			
		}
		
		protected function __setLeadsModel(){
			
			$this->leads_model = new Models_Db_Leads_Model;
			$this->leads_model->setDatabaseGroup( $this->dbGroup );
			
		}
		
		protected function __setPromosModel(){
			if( !isset($this->promos_model)){
				$this->promos_model = new Models_Db_Promos_Model;
				$this->promos_model->setDatabaseGroup( $this->dbGroup );
			};			
		}		
		
		protected function __setVisitsModel(){
			
			$this->visits_model = new Models_Db_Visits_Model;
			$this->visits_model->setDatabaseGroup( $this->dbGroup );
			
		}	
		
		protected function __setTracksModel(){
			
			$this->tracks_model = new Models_Db_Tracks_Model;
			$this->tracks_model->setDatabaseGroup( $this->dbGroup );
			
		}	
		
		protected function __setTransitionsModel(){
			if( !isset($this->transitions_model)){
				$this->transitions_model = new Models_Db_Transitions_Model;
				$this->transitions_model->setDatabaseGroup( $this->dbGroup );
			}
		}
		
		protected function __setStartsModel(){
			if( !isset($this->transitions_model)){
				$this->starts_model = new Models_Db_Starts_Model;
				$this->starts_model->setDatabaseGroup( $this->dbGroup );
			}
		}
					
		protected function __setSubscriptionModel(){
			if( !isset($this->subscriptions_model)){
				$this->subscriptions_model = new Models_Db_Subscriptions_Model;
				$this->subscriptions_model->setDatabaseGroup( $this->dbGroup );
			}
		}	
					
		protected function __setSubscriptionsorgsModel(){
			if( !isset($this->subscriptionsorgs_model)){
				$this->subscriptionsorgs_model = new Models_Db_Subscriptionsorgs_Model;
				$this->subscriptionsorgs_model->setDatabaseGroup( $this->dbGroup );
			}
		}
							
		protected function __setMarketsModel(){
			if( !isset($this->markets_model)){
				$this->markets_model = new Models_Db_Markets_Model;
				$this->markets_model->setDatabaseGroup( $this->dbGroup );
			}
		}
			
		protected function __setPromosUsersModel(){
			if( !isset($this->promosusers_model)){
				$this->promosusers_model = new Models_Db_PromosUsers_Model;
				$this->promosusers_model->setDatabaseGroup( $this->dbGroup );
			}
		}
						
		protected function __setUsersMarketsModel(){
			if( !isset($this->usersmarkets_model)){
				$this->usersmarkets_model = new Models_Db_UsersMarkets_Model;
				$this->usersmarkets_model->setDatabaseGroup( $this->dbGroup );
			}
		}		
		
		protected function __setUsersPartnersModel(){
			if( !isset($this->userspartners_model)){
				$this->userspartners_model = new Models_Db_UsersPartners_Model;
				$this->userspartners_model->setDatabaseGroup( $this->dbGroup );
			}
		}		
					
		protected function __setPartnersModel(){
			if( !isset($this->partners_model)){			
				$this->partners_model = new Models_Db_Partners_Model;
				$this->partners_model->setDatabaseGroup( $this->dbGroup );
			}					
		}		
		
					
		protected function __setOrganizationsModel(){
			if( !isset($this->organizations_model)){					
				$this->organizations_model = new Models_Db_Organizations_Model;
				$this->organizations_model->setDatabaseGroup( $this->dbGroup );
			}			
		}				
		
					
		protected function __setBlocksModel(){
			if( !isset($this->blocks_model)){			
				$this->blocks_model = new Models_Db_Blocks_Model;
				$this->blocks_model->setDatabaseGroup( $this->dbGroup );
			}					
		}		
		
					
		protected function __setReferralsModel(){
			if( !isset($this->referrals_model)){
				$this->referrals_model = new Models_Db_Referrals_Model;
				$this->referrals_model->setDatabaseGroup( $this->dbGroup );
			}
		}		
		
		protected function __setMessagesModel(){
			if( !isset($this->messages_model)){
				$this->messages_model = new Models_Db_Messages_Model;
				$this->messages_model->setDatabaseGroup( $this->dbGroup );
			};
		}
		
		protected function __setTermsModel(){
			if( !isset($this->terms_model)){
				$this->terms_model = new Models_Db_Terms_Model;
				$this->terms_model->setDatabaseGroup( $this->dbGroup );
			};

			
		}		
		
		protected function __setPrivacyModel(){
			if( !isset($this->privacy_model)){
				$this->privacy_model = new Models_Db_Privacy_Model;
				$this->privacy_model->setDatabaseGroup( $this->dbGroup );
			};

			
		}		
				
		protected function __setDomainsModel(){
			
			$this->domains_model = new Models_Db_Domains_Model;
			$this->domains_model->setDatabaseGroup( $this->dbGroup );
			
		}	
					
		protected function __setSubdomainsModel(){
			
			$this->subdomains_model = new Models_Db_Subdomains_Model;
			$this->subdomains_model->setDatabaseGroup( $this->dbGroup );
			
		}
		
		protected function __setSessionsModel(){
			
			$this->sessions_model = new Models_Db_Sessions_Model;
			$this->sessions_model->setDatabaseGroup( $this->dbGroup );	
			
		}

		protected function __setDraftsModel(){
			
			$this->drafts_model = new Models_Db_Drafts_Model;
			$this->drafts_model->setDatabaseGroup( $this->dbGroup );	
			
		}	

		protected function __setTagsModel(){
			
			$this->tags_model = new Models_Db_Tags_Model;
			$this->tags_model->setDatabaseGroup( $this->dbGroup );	
			
		}
		
		protected function __setTemplatesTagsModel(){
			
			$this->templatesTags_model = new Models_Db_Templatestags_Model;
			$this->templatesTags_model->setDatabaseGroup( $this->dbGroup );	
			
		}
				
		protected function __setGraphicsModel(){
			
			$this->graphics_model = new Models_Db_Graphics_Model;
			$this->graphics_model->setDatabaseGroup( $this->dbGroup );	
			
		}
				
		protected function __setBackupsModel(){
			
			$this->backups_model = new Models_Db_Backups_Model;
			$this->backups_model->setDatabaseGroup( $this->dbGroup );	
			
		}
		
		protected function __setQueueModel(){
			if( !isset($this->queue_model)){
				$this->queue_model = new Models_Db_Queue_Model;
				$this->queue_model->setDatabaseGroup( $this->dbGroup );	
			}
		}
		
		protected function __setSwitchModel(){
			if( !isset($this->switch_model)){
				$this->switch_model = new Models_Db_Switch_Model;
				$this->switch_model->setDatabaseGroup( $this->dbGroup );	
			}
		}
		
	/* GRAPHICS */
	
		protected function __setGraphicsToolsForm(){
			$this->graphics_tools = new Models_Form_Graphics_Tools;
		}
		
			protected function __setFileNames(){
				$this->google_id = $this->input->post('arrData')['google_id'];
				$this->fileId = $this->input->post('arrData')['fileId'];
				$image_filename = 'image_' . $this->fileId . '_' . $this->google_id . '.' . 'png';
				$pdf_filename = 'pdf_' . $this->fileId . '_' . $this->google_id . '.' . 'pdf';
				$suffix = '-fs8';
				$shrunk_filename = 'image_' . $this->fileId . '_' . $this->google_id . $suffix. '.' . 'png';
				$this->temp_data_path = $this->upload_path . '/data_' . $this->fileId . '_' . $this->google_id . '.js';
				$this->temp_img_path = $this->upload_path . '/' . $image_filename;
				$this->temp_pdf_path = $this->upload_path . '/' . $pdf_filename;
				$this->temp_shrunk_path = $this->upload_path . '/' . $shrunk_filename;			
			}
			
			protected function __removeTempFiles(){
				
				if( isset($this->img_path) && file_exists($this->img_path)){
					unlink($this->img_path);
				}
				
				if(  isset($this->shrunk_path) && file_exists($this->shrunk_path)){
					unlink($this->shrunk_path);	
				}
					
			}
			
		protected function __shrinkImgFileSize(){
			
			$this->img_path = $this->upload_path . '/SOS.png';
			$this->shrunk_path = $this->upload_path . '/SOS-fs8.png';	

			file_put_contents($this->img_path, $this->rawImg);
	
			$pngquant = '/usr/local/bin/pngquant ' . $this->web_server_path. $this->img_path;
			
			system( $pngquant, $retval);
			
			if( file_exists($this->shrunk_path))	{	
				
		    $this->rawImg = file_get_contents($this->shrunk_path);
		    return true;	
		    
			}else{
				
				return false;
				
			};
			
		}

	
	/* GOOGLE */

		protected function __setGoogleDevConfiguration(){

		}
	
		protected function __connectGAPI(){

			$this->__setGoogleDevConfiguration();
			
			require_once 'google-api-php-client/src/Google_Client.php';
			
			$this->client = new Google_Client();
			
			$this->client->setClientId($this->_google_client_id);
			$this->client->setClientSecret($this->_google_client_secret);
			$this->client->setRedirectUri($this->_google_redirect_url);
			$this->client->setScopes(
				array(
					'https://www.googleapis.com/auth/drive', 
					'https://www.googleapis.com/auth/drive.file', 
					'https://www.googleapis.com/auth/drive.install', 
					'https://www.googleapis.com/auth/drive.appdata', 
					'https://www.googleapis.com/auth/userinfo.email', 
					'https://www.googleapis.com/auth/userinfo.profile',
					'https://www.googleapis.com/auth/photos'
				));
			$this->client->setAccessType('offline');
			
			return $this->client;
			
		}
				
		protected function __connectOAuth(){

			require_once 'google-api-php-client/src/contrib/Google_Oauth2Service.php';
			$this->oAuth = new Google_Oauth2Service($this->client);
			
		}
		
		protected function __connectDriveServices(){
			
			require_once 'google-api-php-client/src/contrib/Google_DriveService.php';	
			$this->service = new Google_DriveService($this->client);
		}
		
		protected function __setParentFolder( $how ){
			
			$this->parent = new Google_ParentReference();
			switch ($how) {
			  case 'pictographr_folder':
				    if( $this->__fileIdExist( $this->pictoFolderId ) ){
				    	
				    	$this->parent->setId($this->pictoFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('Files');
				    	
							$set_what_array = array(
								'pictoFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;
			  
			  case 'pictographr_pdf':
				    if( $this->__fileIdExist( $this->pictoPdfFolderId ) ){
				    	
				    	$this->parent->setId($this->pictoPdfFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('PDFs');
				    	
							$set_what_array = array(
								'pictoPdfFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;	
			  			  
			  case 'pictographr_share':
				    if( $this->__fileIdExist( $this->pictoShareFolderId ) ){
				    	
				    	$this->parent->setId($this->pictoShareFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('Share');
				    	
							$set_what_array = array(
								'pictoShareFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;			  
			  
			  case 'pictographr_image':
				    if( $this->__fileIdExist( $this->pictoImageFolderId ) ){
				    	
				    	$this->parent->setId($this->pictoImageFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('Images');
				    	
							$set_what_array = array(
								'pictoImageFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;			  
			  case 'pictographr_template':
				    if( $this->__fileIdExist( $this->pictoTemplateFolderId ) ){
				    	
				    	$this->parent->setId($this->pictoTemplateFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('Templates');
				    	
							$set_what_array = array(
								'pictoTemplateFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;
			  case 'pictographr_temp':
				    if( $this->__fileIdExist( $this->pictoTempFolderId ) ){
				    	
				    	$this->parent->setId($this->pictoTempFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('Temp');
				    	
							$set_what_array = array(
								'pictoTempFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;			  
			  case 'prospace_folder':
				    if( $this->__fileIdExist( $this->prospaceFolderId ) ){
				    	
				    	$this->parent->setId($this->prospaceFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('Prospace Files');
				    	
							$set_what_array = array(
								'prospaceFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;
			  case 'prospace_image':
				    if( $this->__fileIdExist( $this->prospaceImageFolderId ) ){
				    	
				    	$this->parent->setId($this->prospaceImageFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('Prospace Images');
				    	
							$set_what_array = array(
								'prospaceImageFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;			  
			  case 'prospace_template':
				    if( $this->__fileIdExist( $this->prospaceTemplateFolderId ) ){
				    	
				    	$this->parent->setId($this->prospaceTemplateFolderId);
				    	
				    } else{
				    	
				    	$this->__createFolder('Prospace Templates');
				    	
							$set_what_array = array(
								'prospaceTemplateFolderId' => $this->parentId
							);
							
							$this->users_model->updateUser( 
								$this->user_id, 
								$set_what_array 
							);	
				    	
				    }
				   	
			  break;
			  
			  case 'appFolder':
						$this->parent->setId("appdata");	
			  break;
			  
			  case 'custom':
			    	$this->__createFolder($this->folderTitle);
			  break;
			  default:
			    
			}

		}
		
		protected function __createTempFolder(){	
			
			$this->parent = new Google_ParentReference();
			
	    $this->parent->setId($this->__getFolderId('pictoTopFolderId'));
			
    	$this->top_folder = $this->parent;
    	
    	$this->__createFolder('Temp');
    	
    	$this->pictoTempFolderId = $this->parentId; 
    	 
			$set_what_array = array(
				'pictoTempFolderId' => $this->pictoTempFolderId,
			);
			
			$this->users_model->updateUser( 
				$this->user_id, 
				$set_what_array 
			);
			
		}

		protected function __createRequiredFolders(){	
			
    	$this->__createFolder('Pictographr');
    	
    	$this->pictoTopFolderId = $this->parentId;
    	
    	$this->top_folder = $this->parent;

    	$this->__createFolder('Share');
    	
    	$this->pictoShareFolderId = $this->parentId;    
    	
    	$this->__createFolder('Templates');
    	
    	$this->pictoTemplateFolderId = $this->parentId;  
    	
    	$this->__createFolder('Temp');
    	
    	$this->pictoTempFolderId = $this->parentId;  
    	    	 
    	$this->__createFolder('PDFs');
    	
    	$this->pictoPdfFolderId = $this->parentId;
    	    	
    	$this->__createFolder('Images');
    	
    	$this->pictoImageFolderId = $this->parentId;
    	
    	$this->__createFolder('Files');
    	
    	$this->pictoFolderId = $this->parentId;   
    		 	
			$set_what_array = array(
				'pictoTopFolderId' => $this->pictoTopFolderId,
				'pictoFolderId' => $this->pictoFolderId,
				'pictoImageFolderId' => $this->pictoImageFolderId,
				'pictoTemplateFolderId' => $this->pictoTemplateFolderId,
				'pictoTempFolderId' => $this->pictoTempFolderId,
				'pictoShareFolderId' => $this->pictoShareFolderId,
				'pictoPdfFolderId' => $this->pictoPdfFolderId,
			);
			
			$this->users_model->updateUser( 
				$this->user_id, 
				$set_what_array 
			);
			
		}
	
		protected function __createFolder( $title ){ 
			
			$mimeType ='application/vnd.google-apps.folder';
			
			$file = new Google_DriveFile();
			$file->setTitle($title);
			$file->setDescription('Pictographr ' . $title . ' Folder');
			$file->setMimeType($mimeType);
			//$file->setFolderColorRgb('#FF9C00');
			if( isset( $this->top_folder ) )$file->setParents(array($this->top_folder));	
			
			$this->google_data = $this->service->files->insert($file, array(
			      'mimeType' => $mimeType,
			    ));
			    
			$this->parentId = $this->google_data['id'];
			
			$this->parent = new Google_ParentReference();
			
	    $this->parent->setId($this->parentId);
	    
	    
		}
		
		protected function __getFolderId( $which ){
			
			$whereArray = array(
					'google_id' => $this->google_id
				);
						
			$resultArray = $this->users_model->getUserWhere( $whereArray );
			return $resultArray[$which];
					
		}		

		protected function __fileIdExist( $fileId ){
			
			$this->server_responseobj['fileId'] = $fileId;
			
			if( $fileId == '' ) return false;
			
		  try {
		  	
		    $this->file_data = $this->service->files->get( $fileId );

		    return true;
				
		  } catch (Exception $e) {
				$this->server_responseobj['response'] = $e;
		    return false;
		    
		  }
		}
		
		protected function __getFolderOwnerEmail( $fileId ){
			
		  try {
		  	$this->file_data = $this->service->files->get( $fileId );
		  	
		  	if( isset( $this->file_data['owners'] )){
		  		return $this->file_data['owners'][0]['emailAddress'];
		  	}else{
		  		return false;
		  	};
		  	
				
				
		  } catch (Exception $e) {
				$this->server_responseobj['response'] = $e;
		    return false;
		    
		  }
		}		
		
		protected function __isFolderOwnedByMe( $fileId ){
			
		  try {
		  	$this->file_data = $this->service->files->get( $fileId );
				return $this->__getFolderOwnerEmail(  $this->parentFolderId  ) == $this->user_email;
				
		  } catch (Exception $e) {
				$this->server_responseobj['response'] = $e;
		    return false;
		    
		  }
		}	
		
		protected function __isFolderShared( $fileId ){
			
		  try {
		  	
				$this->file_data = $this->service->files->get( $fileId );
				if( $this->file_data['shared'] == 1 ){
					return true;
				}else{
					return false;
				};
				
		  } catch (Exception $e) {
				$this->server_responseobj['response'] = $e;
		    return false;
		    
		  }
		}
		
		protected function __fileIdTrashed( $fileId ){
			
			if( $fileId == '' ) return false;
			
		  if( $this->service->files->get( $fileId )['labels']['trashed'] == 1){
		  	return true;
		  }else{
		  	return false;
		  };
		}
		
		protected function __unTrashfileId( $fileId ){
			
			return $this->service->files->untrash($fileId);
			
		}		
		
		protected function __trash( $fileId ){
			
			if( $fileId == '' ) return false;
			
			try {
				
				return $this->service->files->trash($fileId);
				
			} catch (Exception $e) {
				
				print "An error occurred: " . $e->getMessage();
				
			}
			
			return NULL;
  
		}
				
		protected function __delete( $fileId ){
			
			if( $fileId == '' ) return false;
			
			try {
				
				return $this->service->files->delete($fileId);
				
			} catch (Exception $e) {
				
				print "An error occurred: " . $e->getMessage();
				
			}
			
			return NULL;
  
		}	
		
		protected function __isFileInFolder($fileId, $folderId) {
			
			
		  try {
		    $this->service->parents->get($fileId, $folderId);
		  } catch (apiServiceException $e) {
		    return false;
		  } catch (Exception $e) {
		    return false;
		  }
		  return true;
			
			
			
		  try {
		    $this->service->parents->get($fileId, $folderId);
		  } catch (apiServiceException $e) {
		    if ($e->getCode() == 404) {
		      return false;
		    } else {
		      print "An error occurred: " . $e->getMessage();
		      throw $e;
		    }
		  } catch (Exception $e) {
		    print "An error occurred: " . $e->getMessage();
		    throw $e;
		  }
		  return true;
		}
		
		protected function __getBinaryFromDrive(){
			
			$this->__setUsersModel();
			
			$this->__paramIntoProperties($this->input->get());
			
			$this->__getUserIdAndSessionIdWithSessionId();
			$this->__connectGAPI();
			$this->__connectDriveServices();
			$this->client->setAccessToken( $this->google_token_pictographr );

			$file_data = $this->service->files->get( $this->fileId );
			$downloadUrl = $file_data['downloadUrl'];
	
	    $request = new Google_HttpRequest($downloadUrl, 'GET', null, null);
	    $httpRequest = Google_Client::$io->authenticatedRequest($request);
	    
	    $this->binary = $httpRequest->getResponseBody();
		}
	
		protected function __createImgInDrive(){
			
			if( isset( $this->base64 ) ){
				$rawImg = base64_decode($this->base64);
			}elseif ( isset( $this->template_img ) ){
				$rawImg = $this->template_img;
			};
			
			$mimeType = 'image/png';
			
			$file = new Google_DriveFile();
			$file->setTitle(( isset( $this->imgTitle ) ? $this->imgTitle :'Image'));
			$file->setDescription(( isset( $this->imgDescription ) ? $this->imgDescription :'An Image.'));
			$file->setParents(array($this->parent));
			$file->setMimeType($mimeType);

		  try {
		  	
				$this->google_image_data = $this->service->files->insert($file, array(
				      'data' => $rawImg,
				      'mimeType' => $mimeType,
				    ));
				    
				$this->imageId = $this->google_image_data['id'];
				    
			//	 echo json_encode($this->google_image_data);
				
		  } catch (Exception $e) {
		  	
		    print "An error occurred: " . $e->getMessage();
		    
		  }

		}	

		protected function __getThisFromDataPgrShareDirStreamedGoogleDrive( $branch, $stem, $leaf ){
			
			if( !isset($this->dataArr) ){
				$dataObj = json_decode($this->__openFromGoogleDrive());
				$this->dataArr = $this->__object_to_array($dataObj);				
			};

			
			if( $leaf != ''){
				if(isset($this->dataArr['share'][$branch][$stem][ $leaf])){
					return $this->dataArr['share'][$branch][$stem][ $leaf];
				} else{
					return '';	
				}				
				
			} else {
				if(isset($this->dataArr['share'][$branch][$stem])){
					return $this->dataArr['share'][$branch][$stem];
				} else{
					return '';	
				}
				
			}
				  
		}
	
		protected function __getParentFolderId($fileId){ 
			
		  try {
		  	
		    $file_data = $this->service->files->get( $fileId );
				return $file_data['parents'][0]['id'];	
		  } catch (Exception $e) {
		  	
		    print "An error occurred: " . $e->getMessage();
		    
		    exit;
		    
		  }

				
		}
			
		protected function __openFromGoogleDrive(){ 
			
		  try {
		  	
		    $file_data = $this->service->files->get( $this->fileId );
				
		  } catch (Exception $e) {
		  	
		    print "An error occurred: " . $e->getMessage();
		    
		    exit;
		    
		  }
		  
		  $this->parentFolderId  = $file_data['parents'][0]['id'];	
		  $this->fileTitle  = $file_data['title'];	
			
			$downloadUrl = $file_data['downloadUrl'];
	
	    $request = new Google_HttpRequest($downloadUrl, 'GET', null, null);
	    $httpRequest = Google_Client::$io->authenticatedRequest($request);
	    
	    $data = $httpRequest->getResponseBody();

			return $data;
				
		}

		
	/* DB */		

		protected function __userTrialExpired(){
			$this->trial_end = $this->__calcTimeLeftInTrial($this->trial_start, $this->totalCredits)['endDate'];
			if( $this->trial_end < $this->today ) return TRUE;
			else return FALSE;
			
		}

		protected function __userSubscriptionExpired(){
			
			$secInDay = (24*60*60);
			$subscription_end_request = $this->userResultArray['subscription_end_request'];
			$subscription_end_request_secs = strtotime($subscription_end_request);			
			
			if( $this->subscription_interval == 1 ){  // monthly
				
				$subscription_end =  $this->__getTimeLeftInMonthlySubscription($this->userResultArray)['endDate'];
				$subscription_end_secs = strtotime($subscription_end);
				$daysBeforeEndRequest = floor(($subscription_end_secs - $subscription_end_request_secs) / $secInDay);
	
				if( $daysBeforeEndRequest > 30 ) {
					return TRUE;
				} else{
					
				}
				
				
			}else{  // yearly
				
				$subscription_end = $this->__getTimeLeftInYearlySubscription($this->userResultArray)['endDate'];
				$subscription_end_secs = strtotime($subscription_end);
				$daysBeforeEndRequest = floor(($subscription_end_secs - $subscription_end_request_secs) / $secInDay);
				
				if( $daysBeforeEndRequest > 365 ) return TRUE;
				else return FALSE;
				
			};
			
			if( $subscription_end < $this->today ) return TRUE;
			else return FALSE;
			
		}		
		
		
		protected function __getGoogleIdFromDB(){
			
			$this->__setUsersModel();
	
			$whereArray = array(
					'id' => $this->user_id 
				);
						
			$resultArray = $this->users_model->getUserWhere( $whereArray );	
			
			return $resultArray['google_id'];
	
		}

		protected function __getTokenFromDB(){
			
			$this->__setUsersModel();
	
			$whereArray = array(
					'id' => $this->user_id 
				);
						
			$resultArray = $this->users_model->getUserWhere( $whereArray );	
			
			return $resultArray['google_token_pictographr'];
	
		}

		protected function __setAppDataDriveFolder(){
			
			$this->user_id=1;
			$this->__connectGAPI();
			$this->__connectDriveServices();
			
			$this->client->setAccessToken( $this->__getTokenFromDB() );	
			
			$this->parent = new Google_ParentReference();
			$this->parent->setId("appdata");	
			
		}
		
		protected function __calcTimeLeftInTrial($trial_start, $totalCredits){
			
			/*  http://agichevski.com/2013/11/10/php-calculate-time-elapsed-and-time-remaining/
    	$values = array( 
                365*24*60*60  =>  'year',
                30*24*60*60     =>  'month',
                7*24*60*60     	=>  'week',
                24*60*60        =>  'day',
                60*60           =>  'hr',
                60              =>  'min',
                1               =>  'second'
        );
			*/	

			$secInWeek = (7*24*60*60);
			
			$totalSecsInWeeks = $secInWeek * $totalCredits;
			
			$secInDay = (24*60*60);
			
			$now = microtime(true);
			
			$then = strtotime($this->trial_start);
			
			$secPast = ($now - $then);
			
			$daysSinceTimerStart = ($secPast / $secInDay);
			
			$weeksSinceTimerStart = ($secPast / $secInWeek);
			
			$totalDaysInCredits = ($totalSecsInWeeks / $secInDay);
			
			$totalWeeksInCredits = ($totalSecsInWeeks / $secInWeek);
			
			$daysLeftInTrial = floor($totalDaysInCredits - $daysSinceTimerStart);
			
			$weeksLeftInTrial = ceil($totalWeeksInCredits - $weeksSinceTimerStart);

			$date = new DateTime($this->trial_start);
			$niceStartDate = $date->format('M d, Y');	
			
			$date = new DateTime("now");
			$date->modify("+" . $daysLeftInTrial ." day");
			$endDate = $date->format('Y-m-d');
			$niceEndDate = $date->format('F d, Y');
			$date->modify("+1 day");
			$nextStartBillDate = $date->format('Y-m-d');
			$nextStartBillNiceDate = $date->format('M d, Y');
			
			return array(
				'niceStartDate' => $niceStartDate,
				'days' => $daysLeftInTrial,
				'weeks' => $weeksLeftInTrial,
				'endDate' => $endDate,
				'niceEndDate' => $niceEndDate,
				'nextStartBillDate' => $nextStartBillDate,
				'nextStartBillNiceDate' => $nextStartBillNiceDate
			);
		}
		
		protected function __getTimeLeftInYearlySubscription($resultArray){
			
			$subscription_start = $resultArray['subscription_start'];
			
			$daysInOneMonth = 30;
			
			$secInDay = (24*60*60);
			
			$secInYear = (365 * $secInDay);
			
			$now = microtime(true);
			
			$then = strtotime($subscription_start);
			
			$secPast = ($now - $then);
			
			$subscription_end_request = $resultArray['subscription_end_request'];
			$subscription_end_request_secs = strtotime($subscription_end_request);	
			$secsFromStartToEndRequest = $subscription_end_request_secs - $then;
			$startYears = floor($secsFromStartToEndRequest / $secInYear);
			$endYears = ceil($secsFromStartToEndRequest / $secInYear);
			$endYears = ( $endYears == 0 ? 1 : $endYears );
			$expiredBeginSegmentFromStartInDays = $startYears * 365;
			$expiredEndSegmentFromStartInDays = ($endYears * 365)  - 1;
			$date = new DateTime($subscription_start);
			$date->modify("+" . $expiredBeginSegmentFromStartInDays . " day");
				$expiredSegmentBeginDate = $date->format('Y-m-d');
				$expiredSegmentBeginDateNice = $date->format('M d, Y');
			$date = new DateTime($subscription_start);
			$date->modify("+" . $expiredEndSegmentFromStartInDays . " day");
				$expiredSegmentEndDate = $date->format('Y-m-d');
				$expiredSegmentEndDateNice = $date->format('M d, Y');
			
			$daysSinceTimerStart = ceil($secPast / $secInDay);
			
			$yearsSoFar = ceil($daysSinceTimerStart / 365);
			
			$paidDays = $yearsSoFar * 365;
			
			$daysLeftInYearlySubscription = $paidDays - $daysSinceTimerStart;
			
			$date = new DateTime($subscription_start);
			$niceStartDate = $date->format('M d, Y');			
			
			// $daysLeftInYearlySubscription = ( $daysLeftInYearlySubscription == 0  ? 365 : $daysLeftInYearlySubscription);
			
			$date = new DateTime("now");
			$date->modify("+" . ($daysLeftInYearlySubscription) ." day");
			$endDate = $date->format('Y-m-d');
			$niceEndDate = $date->format('M d, Y');
			$date->modify("+1 day");
			$nextStartBillDate = $date->format('Y-m-d');
			$nextStartBillNiceDate = $date->format('M d, Y');
			
			$date = new DateTime($endDate);
			$date->modify("-365 day");
			$segmentStartDate = $date->format('Y-m-d');
			$niceSegmentStartDate = $date->format('M d, Y');

			
			return array(
				'days' => $daysLeftInYearlySubscription,
				'endDate' => $endDate,
				'daysSinceTimerStart' => $daysSinceTimerStart,
				'niceStartDate' => $niceStartDate,
				'niceEndDate' => $niceEndDate,
				'nextStartBillDate' => $nextStartBillDate,
				'nextStartBillNiceDate' => $nextStartBillNiceDate,
				'segmentStartDate' => $segmentStartDate,
				'niceSegmentStartDate' => $niceSegmentStartDate,
				'expiredSegmentBeginDate' => $expiredSegmentBeginDate,
				'expiredSegmentBeginDateNice' => $expiredSegmentBeginDateNice,
				'expiredSegmentEndDate' => $expiredSegmentEndDate,
				'expiredSegmentEndDateNice' => $expiredSegmentEndDateNice
			);			
		}
		
		protected function __getTimeLeftInMonthlySubscription($resultArray){
			
			$subscription_start = $resultArray['subscription_start'];

			$daysInOneMonth = 30;
			
			$secInDay = (24*60*60);
			
			$secInMonth = ($daysInOneMonth * $secInDay);
			
			$now = microtime(true);
			
			$then = strtotime($subscription_start);
			
			$secPast = ($now - $then);
			
			$subscription_end_request = $resultArray['subscription_end_request'];
			$subscription_end_request_secs = strtotime($subscription_end_request);	
			$secsFromStartToEndRequest = $subscription_end_request_secs - $then;
			$startMonths = floor($secsFromStartToEndRequest / $secInMonth);
			$endMonths = ceil($secsFromStartToEndRequest / $secInMonth);
			$endMonths = ( $endMonths == 0 ? 1 : $endMonths );
			$expiredBeginSegmentFromStartInDays = $startMonths * $daysInOneMonth;
			$expiredEndSegmentFromStartInDays = ($endMonths * $daysInOneMonth) - 1;
			$date = new DateTime($subscription_start);
			$date->modify("+" . $expiredBeginSegmentFromStartInDays . " day");
				$expiredSegmentBeginDate = $date->format('Y-m-d');
				$expiredSegmentBeginDateNice = $date->format('M d, Y');
			$date = new DateTime($subscription_start);
			$date->modify("+" . $expiredEndSegmentFromStartInDays . " day");
				$expiredSegmentEndDate = $date->format('Y-m-d');
				$expiredSegmentEndDateNice = $date->format('M d, Y');
			
			$daysSinceTimerStart = ceil($secPast / $secInDay);
			
			$monthsSoFar = ceil($daysSinceTimerStart / $daysInOneMonth);
			
			$paidDays = $monthsSoFar * $daysInOneMonth;
			
			$daysLeftInMonthlySubscription = $paidDays - $daysSinceTimerStart;
			
			// $daysLeftInMonthlySubscription = ( $daysLeftInMonthlySubscription == 0  ? $daysInOneMonth : $daysLeftInMonthlySubscription);
			
			$date = new DateTime("now");
			$date->modify("+" . $daysLeftInMonthlySubscription . " day");
			$endDate = $date->format('Y-m-d');
			$niceEndDate = $date->format('M d, Y');
			$date->modify("+1 day");
			$nextStartBillDate = $date->format('Y-m-d');
			$nextStartBillNiceDate = $date->format('M d, Y');

			$date = new DateTime($endDate);
			$date->modify("-" . ($daysInOneMonth - 1) ." day");
			$segmentStartDate = $date->format('Y-m-d');
			$niceSegmentStartDate = $date->format('M d, Y');

			$date = new DateTime($subscription_start);
			$niceStartDate = $date->format('F d, Y');
			
			$this->checking = array(
				'subscription_start' => $subscription_start,
				'now' => $now,
				'then' => $then,
				'secPast' => $secPast,
				'monthsSoFar' => $monthsSoFar,
				'paidDays' => $paidDays,
				'daysSinceTimerStart' => $daysSinceTimerStart,
				'days' => $daysLeftInMonthlySubscription,
				'endDate' => $endDate,
				'niceStartDate' => $niceStartDate,
				'niceEndDate' => $niceEndDate,
				'nextStartBillDate' => $nextStartBillDate,
				'nextStartBillNiceDate' => $nextStartBillNiceDate,
				'segmentStartDate' => $segmentStartDate,
				'niceSegmentStartDate' => $niceSegmentStartDate,
				'expiredSegmentBeginDate' => $expiredSegmentBeginDate,
				'expiredSegmentBeginDateNice' => $expiredSegmentBeginDateNice,
				'expiredSegmentEndDate' => $expiredSegmentEndDate,
				'expiredSegmentEndDateNice' => $expiredSegmentEndDateNice
			);
			
			// echo '<pre>';print_r($this->checking);echo '</pre>';
			
			return $this->checking;
			
		}
		
		protected function __restartTimer() { // http://pictographr.com/app/restartTimer
	
			$this->__setUsersModel();
			$this->__getUserIdAndSessionIdWithSessionId();
	
			$set_what_array = array(
				'trial_start' => date('Y-m-d')
			);
	
			$this->users_model->updateUser( 
				$this->user_id, 
				$set_what_array 
			);	
	
		}
		
		protected function __getNiceDate($baddate){
			$date = new DateTime($baddate);
			//$date->modify("+365 day");
			$view['okDate'] = $date->format('Y-m-d');
			$view['niceDate'] = $date->format('M d, Y');
			return $view;
		}


	/* MISC */
	
		protected function __logToFile($txt){
			
			$logPath = $this->upload_path . '/logs.txt';
			
			$date = new DateTime("now");
			$timestamp = $date->format('Y-m-d H:i:s');
			
			$txt = "------------------------------------------------------<br />" . $txt;
			$txt .= ' at ' . $timestamp . "<br />";
 			file_put_contents($logPath, $txt.PHP_EOL , FILE_APPEND | LOCK_EX);
 			
 			file_get_contents($logPath)."<br />";
 			
		}	
		
		protected function __seelog(){
			
			$logPath = $this->upload_path . '/logs.txt';
			
			if( isset($_GET['delete']) && file_exists($logPath)){ 
				unlink($logPath);
			}
			

 			if(file_exists($logPath)) echo file_get_contents($logPath)."<br />";
 			
 			echo "<a href='seelog?delete=true'>Delete Log</a>";
 			
		}	
		
		
		protected function __secondsToTime($s){
	    $h = floor(round($s) / 3600);
	    $s -= $h * 3600;
	    $m = floor($s / 60);
	    $s -= $m * 60;
	    return sprintf('%02d', $s);
		}
	
		private function __hasPartnerGoogleDocs(){
			
			$this->__setUsersPartnersModel();
			
			$whereArray = array(
					'partner_id' => 9,
					'user_id' => $this->user_id,
				);
						
			$resultArray = $this->userspartners_model->getUsersPartnerWhere( $whereArray );
			
			if( $resultArray != 0){

				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
		}		
	
		protected function __showAddOnDocInstructions(){
			return true;
			if( isset( $this->hasDomain )){
				return false;
			} elseif( $this->__hasPartnerGoogleDocs()){
				return false;
			} else {
				return true;
			};
		}

		protected function __setOrCreateOrganization(){
						
			$this->__setOrganizationsModel();
			
			if($this->session->userdata('xorg_id')){
				
				$this->xorg_id = $this->session->userdata('xorg_id');
				$this->partner_id = $this->session->userdata('partner_id');
				
				if( ! $this->__xorg_idExist($this->xorg_id, $this->partner_id) ){
					
					$insert_organization_array['xorg_id'] = $this->xorg_id;
					$insert_organization_array['partner_id'] = $this->partner_id;
					
					if( $this->google_org_domain != '' ){
						$insert_organization_array['domain'] = $this->google_org_domain;
					}
					
					if($this->session->userdata('organization_name')){
						$insert_organization_array['name'] = urldecode ($this->session->userdata('organization_name'));
					}
					
					if($this->session->userdata('org_type')){
						$insert_organization_array['org_type'] = $this->session->userdata('org_type');
					}
					
					$this->organization_id = $this->organizations_model->insertOrganization( $insert_organization_array );
				};

				return;
				
			} elseif( $this->google_org_domain != '' ){
				$this->domain = $this->google_org_domain;
			} elseif($this->session->userdata('domain')) {
				$this->domain = $this->session->userdata('domain');
			}
					
			if($this->session->userdata('org_type')){
				$insert_organization_array['org_type'] = $this->session->userdata('org_type');
			}
			
			if( isset( $this->domain )  &&  !$this->__domainExist($this->domain) ){
				$insert_organization_array['domain'] = $this->domain;
				$this->organization_id = $this->organizations_model->insertOrganization( $insert_organization_array );
			};
		}		
		
		protected function __designateAsAdminInOrganizationTable(){
			
			$this->__setOrganizationsModel();
			if(  $this->session->userdata('isOrgAdmin') && $this->organization_id != 0){
				$set_what_array['user_id'] = $this->user_id;			
				$set_what_array['partner_id'] = $this->partner_id;	
				
				if($this->session->userdata('org_type')){
					$set_what_array['org_type'] = $this->session->userdata('org_type');
				}
						
				$this->organizations_model->updateOrganization( 
					$this->organization_id, $set_what_array 
				);
			};
			
		}
		
		protected function __reestablishOrganizationLink(){
			
			$whereArray['xorg_id'] = $this->xorg_id;
						
			$this->organizationArray = $this->organizations_model->getOrganizationWhere( $whereArray );
			
			if( $this->organizationArray != 0){
				
				$this->organization_id = $this->organizationArray['id'];
				
			}	
			
		}		
		
		
		protected function __xorg_idExist($xorg_id, $partner_id){
			
			$whereArray['xorg_id'] = $xorg_id;
			$whereArray['partner_id'] = $partner_id;
						
			$this->organizationArray = $this->organizations_model->getOrganizationWhere( $whereArray );
			
			if( $this->organizationArray != 0){
				
				$this->organization_id = $this->organizationArray['id'];
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
		
		protected function __domainExist($domain){
			
			$whereArray = array(	'domain' => $domain);
						
			$this->organizationArray = $this->organizations_model->getOrganizationWhere( $whereArray );
			
			if( $this->organizationArray != 0){
				
				$this->organization_id = $this->organizationArray['id'];
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
	
		protected function __settingSessionP(  $what ){
			
			if( isset( $this->{$what} )  ) {
				$obj[$what] = $this->{$what};
				$this->session->set_userdata($obj);
			} else{
				$this->session->unset_userdata($what);
			}			
			
		}		
	
		protected function __shrinkIntoPng($rawImg){

			$image = imagecreatefromstring($rawImg);
			
			/*
		    function getimagesizefromstring($data){
		        $uri = 'data://application/octet-stream;base64,' . base64_encode($data);
		        return getimagesize($uri);
		    }
		  */
		    
			$x = getimagesizefromstring($rawImg);
			$width  = $x['0'];
			$height = $x['1'];
			
			$percent = $this->new_width/$width;
	
			$this->new_height  = $height * $percent;
			
			$new_image = imagecreatetruecolor($this->new_width, $this->new_height);
			
			imagecolortransparent($new_image, imagecolorallocatealpha($new_image, 0, 0, 0, 127));
			
			imagealphablending($new_image, false);
			
			imagesavealpha($new_image, true);
			
			imageCopyResampled($new_image, $image, 0, 0, 0, 0, $this->new_width, $this->new_height, $width, $height);

			imagedestroy($image);

			return $new_image;
			
		}

		protected function __sha512($stringIs){
			return hash('sha512', $stringIs);
		}

	
		protected function __customizeMessage( $message, $replace_whats ){
			
			foreach($replace_whats as $replace_pattern => $replace_value) {
				$message =  str_replace( $replace_pattern, $replace_value, $message);
			};
			
			return $message;
			
		}
		
		protected function __emailmyself( $what = null, $subject = null){
		
			if( !isset($what) ){
				
				$what = $_GET['what'];
				
			};
			
			$this->template_id = '4cb74229-f5f7-4b81-b768-cc32638c346c';
			$this->addTo = 'jamesming@gmail.com';
			$this->setFrom = 'jamesming@gmail.com';
			$this->setSubject = ( isset( $subject) ? $subject : $what);
			$this->setHtml = $this->setText = $what;
		
			$this->__requireSendgridLibrary();

			$sg_username = "jamesming";
			$sg_password = "Pr0spac3";

			$sendgrid = new SendGrid( $sg_username, $sg_password );
			$mail = new SendGrid\Email();

			
			$mail->setFrom(  $this->setFrom )
					->addTo( $this->addTo )
					->setSubject($this->setSubject)
					->setText($this->setText)
					->setHtml($this->setHtml);	
					
		  try {
		  	
		  	
		    $this->server_response = $sendgrid->send( $mail );
				$this->server_responseobj['sendgrid'] = 'success';
				return true;
				
		  } catch (Exception $e) {
		  	
				$this->server_responseobj['sendgrid'] = 'failed';
				$this->server_responseobj['explain'] = $e;
		    return false;
		  }
			
	    
	    
		}
		
		protected function __sendgrid() {
			
			$this->__setMessagesModel();
			$this->messageArray = $this->messages_model->getMessageWhere( array(	'id' => $this->message_id) );
			$this->template_id = ( isset( $this->template_id ) ? $this->template_id: $this->messageArray['sendgrid_template_id']);
			$this->setSubject = ( isset( $this->setSubject ) ? $this->setSubject: $this->messageArray['email_subject']);
			$this->setText =  ( isset( $this->setText ) ? $this->setText: $this->messageArray['email_text']);
			$this->setHtml = ( isset( $this->setHtml ) ? $this->setHtml: $this->messageArray['email_html']);
			
			$this->__requireSendgridLibrary();

			$sg_username = "jamesming";
			$sg_password = "Pr0spac3";

			$sendgrid = new SendGrid( $sg_username, $sg_password );
			$mail = new SendGrid\Email();

			if( isset( $this->subs ) ){
				foreach($this->subs as $tag => $replacements) {
				    $mail->addSubstitution($tag, $replacements);
				}
			};

			$filters = array (
			    "templates" => array (
			        "settings" => array (
			            "enable" => "1",
			            "template_id" => $this->template_id
			        )
			    )
			);
			
			foreach($filters as $filter => $contents) {
			    $settings = $contents['settings'];
			    foreach($settings as $key => $value) {
			        $mail->addFilterSetting($filter, $key, $value);
			    }
			}

			
			$mail->setFrom(  $this->setFrom )
					->addTo( $this->addTo )
					->setSubject($this->setSubject)
					->setText($this->setText)
					->setHtml($this->setHtml);	
			
			
		  try {
		  	
		    $sendgrid->send( $mail );
		    
	//	    echo '<pre>';print_r(  $filters  );echo '</pre>';
	//	    echo '<pre>';print_r(  $mail );echo '</pre>';  
	//	    echo '<pre>';print_r( $this->server_response );echo '</pre>'; 
		    
				unset($this->setSubject);
				unset($this->setText);
				unset($this->setHtml);
				return true;
				
		  } catch (Exception $e) {
		  	
				$this->sendgrid_error = $e;
		    return false;
		    
		  }
			
		}
	
		protected function __requireSendgridLibrary(){
			require_once('application/libraries/sendgrid-php/vendor/autoload.php');	
			require_once('application/libraries/sendgrid-php/lib/SendGrid.php');	
		}
		
		protected function __configStrip(){
		// sk_live_77l2sHp19I8H5dNBebcZ5wCi
		// sk_test_cqoXxmfj8FF1pjHQemV7C8aZ
			Stripe\Stripe::setApiKey("sk_live_77l2sHp19I8H5dNBebcZ5wCi");	
		}
		
		
		protected function __requireStripLibrary(){
			// Stripe singleton
			require('application/libraries/stripe/Stripe.php');
			
			// Utilities
			require('application/libraries/stripe/Util/RequestOptions.php');
			require('application/libraries/stripe/Util/Set.php');
			require('application/libraries/stripe/Util/Util.php');
			
			// HttpClient
			require('application/libraries/stripe/HttpClient/ClientInterface.php');
			require('application/libraries/stripe/HttpClient/CurlClient.php');
			
			// Errors
			require('application/libraries/stripe/Error/Base.php');
			require('application/libraries/stripe/Error/Api.php');
			require('application/libraries/stripe/Error/ApiConnection.php');
			require('application/libraries/stripe/Error/Authentication.php');
			require('application/libraries/stripe/Error/Card.php');
			require('application/libraries/stripe/Error/InvalidRequest.php');
			require('application/libraries/stripe/Error/RateLimit.php');
			
			// Plumbing
			require('application/libraries/stripe/JsonSerializable.php');
			require('application/libraries/stripe/StripeObject.php');
			require('application/libraries/stripe/ApiRequestor.php');
			require('application/libraries/stripe/ApiResource.php');
			require('application/libraries/stripe/SingletonApiResource.php');
			require('application/libraries/stripe/AttachedObject.php');
			require('application/libraries/stripe/ExternalAccount.php');
			
			// Stripe API Resources
			require('application/libraries/stripe/Account.php');
			require('application/libraries/stripe/AlipayAccount.php');
			require('application/libraries/stripe/ApplicationFee.php');
			require('application/libraries/stripe/ApplicationFeeRefund.php');
			require('application/libraries/stripe/Balance.php');
			require('application/libraries/stripe/BalanceTransaction.php');
			require('application/libraries/stripe/BankAccount.php');
			require('application/libraries/stripe/BitcoinReceiver.php');
			require('application/libraries/stripe/BitcoinTransaction.php');
			require('application/libraries/stripe/Card.php');
			require('application/libraries/stripe/Charge.php');
			require('application/libraries/stripe/Collection.php');
			require('application/libraries/stripe/Coupon.php');
			require('application/libraries/stripe/Customer.php');
			require('application/libraries/stripe/Dispute.php');
			require('application/libraries/stripe/Event.php');
			require('application/libraries/stripe/FileUpload.php');
			require('application/libraries/stripe/Invoice.php');
			require('application/libraries/stripe/InvoiceItem.php');
			require('application/libraries/stripe/Order.php');
			require('application/libraries/stripe/Plan.php');
			require('application/libraries/stripe/Product.php');
			require('application/libraries/stripe/Recipient.php');
			require('application/libraries/stripe/Refund.php');
			require('application/libraries/stripe/SKU.php');
			require('application/libraries/stripe/Subscription.php');
			require('application/libraries/stripe/Token.php');
			require('application/libraries/stripe/Transfer.php');
			require('application/libraries/stripe/TransferReversal.php');
			
			
			$this->__configStrip();
		}	

		protected function __object_to_array($data){
		  if(is_array($data) || is_object($data)){
		    $result = array(); 
		    foreach($data as $key => $value)
		    { 
		      $result[$key] = $this->__object_to_array($value); 
		    }
		    return $result;
		  }
		  return $data;
		}
		
		protected function __get_random_string( $length){
	    // start with an empty random string
	    $random_string = "";
	    
	    $valid_chars = 'abcdefghijklmnopqrstvwxyz1234567890';
	
	    // count the number of chars in the valid chars string so we know how many choices we have
	    $num_valid_chars = strlen($valid_chars);
	
	    // repeat the steps until we've created a string of the right length
	    for ($i = 0; $i < $length; $i++){
        // pick a random number from 1 up to the number of valid chars
        $random_pick = mt_rand(1, $num_valid_chars);

        // take the random character out of the string of valid chars
        // subtract 1 from $random_pick because strings are indexed starting at 0, and we started picking at 1
        $random_char = $valid_chars[$random_pick-1];

        // add the randomly-chosen char onto the end of our string so far
        $random_string .= $random_char;
	    }
	
	    // return our finished random string
	    return $random_string;
		}
		
		protected function __paramIntoProperties($input) {
			
			if( isset( $input ) && $input != ''){
				foreach ($input as $k => $v) {
					$this->{$k} = $v;
				}				
				return $this;
			}
		}

		protected function __generateRandomString($length = 10) {
		    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		    $randomString = '';
		    for ($i = 0; $i < $length; $i++) {
		        $randomString .= $characters[rand(0, strlen($characters) - 1)];
		    }
		    return $randomString;
		}
		
		
		protected function __getGeoLocation() {
					$curlObj = curl_init();
					$url = 'http://api.ipinfodb.com/v3/ip-city/?key=a644434b1b3c5ccc56d42931601df57c3ca668e40cb5bcc81be426e87ca10f51&ip=' . $_SERVER['REMOTE_ADDR'];
					curl_setopt($curlObj, CURLOPT_URL, $url);
					
					ob_start(); 
						curl_exec($curlObj);
						$this->geo_location = ob_get_contents(); 
					ob_end_clean();
				
		}
		
		
		protected function __fileSizeConvert($bytes) {
	    $bytes = floatval($bytes);
	        $arBytes = array(
	            0 => array(
	                "UNIT" => "TB",
	                "VALUE" => pow(1024, 4)
	            ),
	            1 => array(
	                "UNIT" => "GB",
	                "VALUE" => pow(1024, 3)
	            ),
	            2 => array(
	                "UNIT" => "MB",
	                "VALUE" => pow(1024, 2)
	            ),
	            3 => array(
	                "UNIT" => "KB",
	                "VALUE" => 1024
	            ),
	            4 => array(
	                "UNIT" => "B",
	                "VALUE" => 1
	            ),
	        );
	
	    foreach($arBytes as $arItem)
	    {
	        if($bytes >= $arItem["VALUE"])
	        {
	            $result = $bytes / $arItem["VALUE"];
	            $result = str_replace(".", "." , strval(round($result, 2)))." ".$arItem["UNIT"];
	            break;
	        }
	    }
	    return $result;
		}		
}