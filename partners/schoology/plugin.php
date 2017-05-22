<?php 

class Plugin{

  public function __construct() {

		$this->__setup();

		if( !isset(  $_GET['oauth_token'] ) ){

			$this->__verifyUserHasAccessToken();
			
		}else{
			
			$this->__saveAccessTokenToDB( $initialRequestoken = $_GET['oauth_token']);
			
		};
		
	}
	
		protected function __setup() {	

			define('SCHOOLOGY_CONSUMER_KEY', '9697684a0eeac84b329c0c2a8e7119460573cb441');
			define('SCHOOLOGY_CONSUMER_SECRET', 'f3dadb8beb92ef26ec77c6618c47f85a'); 
			define('DB_HOSTNAME', 'localhost'); 
			define('DB_USERNAME', 'root');
			define('DB_PASSWORD', 'Pr0spac3');
			define('DB_DATABASE', 'pictographr_db');
			
			require_once('sdk/SchoologyContentApi.class.php');
			require_once('sdk/App_OauthStorage.class.php');		
			$this->__setStorageModel();	
				
		}	
	
		protected function __configSchoology() {	
			$this->__setSiteBase();
			$this->schoology = new SchoologyContentApi(SCHOOLOGY_CONSUMER_KEY, SCHOOLOGY_CONSUMER_SECRET, $this->site_base, '','', TRUE);
			$this->tokenArray = $this->storage->getAccessTokens($_SESSION['schoology']['uid']);
			$this->schoology->setToken($this->tokenArray['token_key'], $this->tokenArray['token_secret']);	
				
		}

		private function __verifyUserHasAccessToken(){
			$this->schoology = new SchoologyContentApi(SCHOOLOGY_CONSUMER_KEY, SCHOOLOGY_CONSUMER_SECRET, '', '','', TRUE);
			$this->__setUserSessionFromSAML2();
			$this->__setSiteBase();
			if( ! $this->__accessTokenExistInDB() ){
				$this->__getInitialTokenAndAuthorization();
			};
		}
	
		private function __getInitialTokenAndAuthorization(){
			$this->__saveInitialRequestTokenToDB();
			$this->__showAuthorizeAppScreen();
		}

		private function __saveAccessTokenToDB( $initialRequestoken ){
			if( ! $this->__initialTokenMatchWithDbVersion( $initialRequestoken )) {
				echo "someone's tampering with requests. shit!";
			} else {
				$this->__setSiteBase();
				$this->schoology = new SchoologyContentApi(SCHOOLOGY_CONSUMER_KEY, SCHOOLOGY_CONSUMER_SECRET, $this->site_base, '','', TRUE);
				$this->__exchangeRequestTokenFromDBForAccessToken();
			}
		}
	
		private function __accessTokenExistInDB(){
			
			$this->tokenArray = $this->storage->getAccessTokens($_SESSION['schoology']['uid']);

			if( $this->tokenArray){
				$this->schoology->setToken($this->tokenArray['token_key'], $this->tokenArray['token_secret']);
				return true;
			}else{
				return false;
			};
			
		}
						
		private function __initialTokenMatchWithDbVersion( $initialRequestoken ) {

	    $this->initial_request_tokens = $this->storage->getRequestTokens($_SESSION['schoology']['uid']);
	    
	    if( $initialRequestoken === $this->initial_request_tokens['token_key'] ){
	    	return true;
	    }else{
	    	return false;
	    };
	    
		}					

		private function __exchangeRequestTokenFromDBForAccessToken() {	
			
    	$this->schoology->setToken($this->initial_request_tokens['token_key'], $this->initial_request_tokens['token_secret']);
			
      $api_result = $this->schoology->api('/oauth/access_token');
      $result = array();
      parse_str($api_result->result, $result);

		  $this->storage->requestToAccessTokens($_SESSION['schoology']['uid'], $result['oauth_token'], $result['oauth_token_secret']);
		  
		  $this->schoology->unsetToken();
		  
		}	
	
		protected function __setStorageModel(){
			if( !isset( $this->storage ) ){
				$db = new PDO('mysql:dbname='.DB_DATABASE.';host='.DB_HOSTNAME, DB_USERNAME, DB_PASSWORD);
				$this->storage = new App_OauthStorage($db);				
			}
		}
		
		private function __setUserSessionFromSAML2(){
	  	
	  	$this->login = $this->schoology->validateLogin();
	  	
			if(!$this->login){
			  print 'No login information was received. Try loading this application again from within Schoology.'; 
			  exit;
			}

			// If our session already has a stored ID but it's
			// different from what we received, restart the session.
			if(isset($_SESSION['schoology']['uid']) && $_SESSION['schoology']['uid'] != $this->login['uid']){
			  session_destroy();
			  session_start();
			}
			 
			// The session might already be set if the user is accessing
			// this application again without logging out of Schoology.
			// Only set the session information if not already present
			if(!isset($_SESSION['schoology']['uid'])){
			  $_SESSION['schoology'] = $this->login;
			  $_SESSION['session_created'] = time();
			}
			 
			$q_params = parse_url($_REQUEST['RelayState'], PHP_URL_QUERY);
			parse_str($q_params, $app_state);
			 
			$_SESSION['app_state'] = array();
			foreach($app_state as $key => $param){
			  $_SESSION['app_state'][$key] = $param;
			}
//echo '<pre>';print_r(  $_SESSION );echo '</pre>';  exit;
	
		}
		
		private function __setSiteBase(){
			$this->site_base = ($_SESSION['app_state']['is_ssl'] ? 'https://' : 'http://') . $_SESSION['schoology']['domain'];
		}
		
		private function __saveInitialRequestTokenToDB(){
					
		 	$api_result = $this->schoology->api('/oauth/request_token');
		  $result = array();
		  parse_str($api_result->result, $result);
		  
		  $this->storage->saveRequestTokens($_SESSION['schoology']['uid'], $result['oauth_token'], $result['oauth_token_secret']);
			$this->oauth_token = $result['oauth_token'];
		}
		
		private function __showAuthorizeAppScreen(){

			$params = array(
			        'return_url=' . urlencode('https://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI']),
			        'oauth_token=' . urlencode($this->oauth_token),
			);
			
			$query_string = implode('&', $params);
			header('Location: ' . $this->site_base . '/oauth/authorize?'  . $query_string);

		}
}

