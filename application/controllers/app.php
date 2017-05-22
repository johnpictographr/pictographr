<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class App extends Organization {
		
	public function __construct() {
		parent::__construct();
		$this->localFileId = '0B5ptY5tUIebjdWhmTHA4Smh5em8';
	}
	
	public function dashboard(){
		
		$obj['version'] = $this->version;
		$this->load->view('dashboard_view', $obj);
		
	}

	public function index(){   //  localhost/pictographr/app
		
		$this->isFrom = __FUNCTION__;
		
		$today = date("Y-m-d");	
					
		if( $_SERVER['HTTP_HOST'] == 'localhost' ){
			
				$this->obj['fileId'] =  $this->localFileId;
				//$this->obj['fileId'] =  'false';
				$this->obj['google_id'] =  $this->localhost_google_id;
								
				if( !$this->connected ) $this->__connect();	
				
				$this->__buildEditViewObj();
				
				
		} else{
			
				
				if( isset($_GET['state'])){
					
					$state = json_decode(stripslashes($_GET['state']));
					
					if( isset( $state->ids )){ 
						
						$this->obj['fileId'] = $state->ids[0];
						
					} elseif (  isset( $state->template_id )){
						
						$this->obj['template_id'] = $state->template_id[0];
						$this->obj['fileId'] =  'false';
						
					} else {
						$this->obj['fileId'] =  'false';
					}
	
					if( $this->session->userdata('google_id') ){
						$this->obj['google_id'] = $this->google_id =  $this->__getSessionGoogleId();  //$_GET['userId']
					}
					
					if( isset( $state->userId )){
						$this->obj['google_id'] = $this->google_id = $state->userId;
						$this->session->set_userdata(array('google_id'  => $this->encrypt->encode($this->google_id)));
					}					
					
					if( !$this->connected ) $this->__connect();		
							
					if( isset( $state->newSerial )){
						
						$this->obj['newSerial'] = $state->newSerial;
						
					} else{
						
						$this->obj['newSerial'] = 'false';
						
//						if( $this->__isTemplate($state->ids[0]) ){
//							$this->obj['isTemplate'] = 'true';
//						}						
						
					}
					
					$this->__buildEditViewObj(); 	

									
				} else {  // redirect from logInNow method in landing.js
					
					if( isset( $_GET['out'])){
						
							
							$this->session->sess_destroy();
						
							?>	
							 
							<script>
									var url = 'https://pictographr.com?out=true';
									window.location.assign(url);	
							</script>
							<?php
						
					}else{

							?>
							
							<script>
								
									// <?php if(isset($_GET["newuser"])) echo "newuser=1&"; ?>
								
									var url = 'https://pictographr.com/app?';
									url += '<?php if( $this->session->userdata('popSetupModal')/* || isset($_GET['popSetupModal']) */ ) echo "popSetupModal=true&"; ?>';
									url += '<?php if( $this->session->userdata('whenUserHasAccountThen')  ) echo "whenUserHasAccountThen=true&new_width=620&new_height=500&"; ?>';
									url += '<?php if( $this->session->userdata('refreshSidebarFiles')  ) echo "refreshSidebarFiles=true&"; ?>';
									url += 'state=%7B';
									url += '"newSerial": "' +  Math.random();
									url += '", "action":"create","userId":"<?php echo $this->__getSessionGoogleId(); ?>';
									url += '"%7D';
									
									window.location.assign(url);	
									
							</script>
							<?php
							
							exit;			
											
					};
					
					// header("Location: http://drive.google.com/drive/#folders/" . $this->pictoFolderId);
					
				};
				

		}

		$this->load->view('edit_view', $this->obj);
		
	}
	
		private function __buildEditViewObj(){
			
			$this->__setGoogleDevConfiguration();
			
			$this->pictoFolderId = $this->obj['pictoFolderId'] = $this->userResultArray['pictoFolderId'];
			
			if( $this->userActive ){
				$this->obj['accountActive'] = 'true';
			}else{
				$this->obj['accountActive'] = 'false';
			};
			
			if( $this->user_promotion_credits == 2){
				$this->obj['showPromoForm'] = 1;
			}else{
				$this->obj['showPromoForm'] = 0;
			};
			
			$this->obj['status_id'] = $this->status_id;
			$this->obj['market_id'] = $this->user_market_id;
			$this->obj['howManyDaysLeft'] = $this->howManyDaysLeft;	
			
			if(
		
				$this->organization_id != 0 &&
				in_array($this->status_id, array(1, 2, 4, 8))
				
			){
					$this->__takeSeat();
			};
			
			if( $this->organization_id != 0 ) {
				$this->obj['isInOrganization'] = 'true';
				if( $this->domain != '') {
					$this->obj['hasDomain'] = 'true';
					$this->hasDomain = true;
				}
			}
			else {
				$this->obj['isInOrganization'] = 'false';
			}
			
			$date = new DateTime("now");
			if( isset( $this->insert_or_update_array ) ){
				$this->insert_or_update_array['last'] = $date->format('Y-m-d H:i:s');
				$this->users_model->updateUser( $this->user_id, $this->insert_or_update_array  );
					$this->obj['status_id'] = $this->insert_or_update_array['status_id'];
					$this->obj['accountActive'] = 'true';
					$this->obj['howManyDaysLeft'] = $this->howManyDaysLeft;
			} else{
			
				$update_array['last'] = $date->format('Y-m-d H:i:s');
				$this->users_model->updateUser( $this->user_id, $update_array  );
			}	
			
			if( $this->isOrgAdmin == 1 && $this->orgAcceptTerms == 1){
				$this->obj['orgAcceptTerms'] = 1;
			};						
						
			$this->obj['isOrgAdmin'] = $this->isOrgAdmin;
			$this->obj['subscription_interval'] = $this->subscription_interval;
			$this->obj['plan'] = ( $this->subscription_interval == 1 ? 'monthly': 'yearly' );

			$this->obj['message_id'] = $this->user_message_id;
			$this->obj['isSocial'] = $this->isSocial;
			$this->obj['version'] = $this->version;	
			
			$this->obj['clientId'] = $this->_google_client_id;
			$this->obj['developerKey'] = $this->_developerKey;
			$this->obj['project'] = $this->project;
			$this->obj['acceptTerms'] = $this->acceptTerms;
			
			
			if( $this->acceptTerms == 0){
				if( $this->__showAddOnDocInstructions() ){
					$this->obj['showAddOnDocInstructions'] = 'true';
				};
				
			};							
			
			$this->obj['pow'] = ( $this->google_id == '104384554224634036843' ? 'true' : 'false' ); // POWER USER WILL BE jamesming@pictographr.com	
			$this->obj['user_email'] = $this->user_email;
			
		}	
	
	public function base(){
		
		$this->isFrom = __FUNCTION__;
		
		$this->__paramIntoProperties($this->input->get());
		
		if( isset($this->param) ){
			
			$paramArr =  explode('@', $this->param);
			
			$obj = array(
				 'google_id' => $paramArr[0],
				 'fileId' => $paramArr[1],
				 'project' => $this->project
			);
			
			if( isset($paramArr[2]) ){
				$obj['useWhat'] = $paramArr[2];
			}
			
			if( isset($paramArr[3]) ){  //PHANTOM PDF
				
				$obj['isPDF'] = "true";
				$obj['width'] = $paramArr[4];
				$obj['height'] = $paramArr[5];
				
				if( isset($paramArr[6]) ) $obj['useFrame'] = "true";
				
			}			
			
		} else{ 

				//			echo "The base URL is: ". base_url()."<br />";
				//			echo "The vanity name is [" . $this->uri->segment(1)."]<br />";  // referred by line 72 in config/routes.php  .. $route['(.*)'] = 'app/base/$1';
				//			echo "The domain name is: ".$_SERVER['HTTP_HOST']."<br />"; 


			if( isset( $this->dmz) ){ // when user comes in from shortURL or http://pictographr.com/app/base?dmz=
				
				$this->__setDomainsModel();
				
				$httpPrefix = "http://";				
				
				if( isset($this->dmz) && $this->__domainIDexist() || $this->__fileIdAndGoogle_idExist() ){
					
					foreach( $this->domainArray  as  $key => $value){
						$obj[$key] = $value;
					}
					$obj['domain_id'] = $this->domainArray['id'];
					$obj['fileId'] = $this->domainArray['share_fileId'];
					$obj['share_url'] = "http://socialcampaigner.com/app/base?" .  (isset($this->dmz) ? "dmz=" . $this->dmz: "");
					
				};
				
				if( isset($this->lead_id) ){
					$obj['lead_id'] = $this->lead_id;
				};
				
				if( isset($this->w) ){
					$obj['way'] = $this->w;
				};
				
				$obj['drive'] = 'true';	
				$obj['useWhat'] = 'useRead';
				
			} else{
				
				// IE https://pictographr.com/UCLA?refer=
				// IE https://pictographr.com/free

				$this->market_name = $this->uri->segment(1);

				if(	$this->__marketExistJoinSubscription() ){

					if( !isset($_GET['out'])){
						$this->__getGeoLocation();
						$this->__setVisitsModel();
						$this->visits_model->insertVisit( 			
							array(
								 'market_id' => $this->subscriptionArray[0]['market_id'],
								 'market_name' => $this->market_name,
						 		 'HTTP_REFERER' =>  isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
								 'geo_location' =>  substr($this->geo_location,0, 120),
								 'ip' => $_SERVER['REMOTE_ADDR']
							)
						);
					};
					
					$this->load->view('landing_view', 
						array(
							 'market_name' => $this->market_name,
							 'market_id' => $this->subscriptionArray[0]['market_id'],
							 'market_img' => $this->subscriptionArray[0]['market_img'],
							 'subscription_monthly' => $this->subscriptionArray[0]['subscription_monthly'],
							 'subscription_yearly' => $this->subscriptionArray[0]['subscription_yearly']
						)
					);
					return;
					
				} else{
					
					// IE https://pictographr.com/clinton-underwood
					
						$this->__setDomainsModel();
						$this->domain_name = $_SERVER['HTTP_HOST'];
						$this->vanity = $this->uri->segment(1);
						$this->project = 'pictographr';
						$httpPrefix = "http://";
						
						if(	$this->__domainURLExist() ){
							
							foreach( $this->domainArray  as  $key => $value){
								$obj[$key] = $value;
							}
							
							$obj['domain_id'] = $this->domainArray['id'];
							$obj['fileId'] = $this->domainArray['share_fileId'];
							$obj['drive'] = 'true';
							$obj['share_url'] = $httpPrefix  . $_SERVER['HTTP_HOST'] . '/' . $this->uri->segment(1);		
						}
						
						$obj['useWhat'] = 'useRead';							
				}
				
				
				
		
				
			}
			
		}
		
		$obj['version'] = $this->version;
		
		if( isset($obj['useFrame'])){
			$this->load->view('frame_view', $obj);
		}else{
			$this->load->view('read_view', $obj);
		};
		
		
	}
	
	public function start(){
		
			$this->obj = array();
			$this->load->view('start_view', $this->obj);	
			
	}

	public function save(){
		
		$obj = array();

    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
  
    if( $this->__doTrash() ) $this->service->files->trash($this->fileId);
    
    if( $this->fileId == 'false'){  
    	$this->fileId = $this->__generateRandomString(10);
    };
    
    $this->__setTempFileNames();
		
		$this->ENCODED_JSON = json_encode($this->data);
		
		if( isset($this->publish) ) {
			
			$this->share = $this->__getPropertiesFromDataPgr('share' , $this->ENCODED_JSON);

			if( $this->__fileIdExist( $this->share['fileIds']['google']['mainfolder_fileId'] ) ) $this->service->files->trash($this->share['fileIds']['google']['mainfolder_fileId']);
						
			$this->parent = new Google_ParentReference();
			$this->parent->setId($this->pictoShareFolderId);
			$this->top_folder = $this->parent;
			
			$this->title = $this->share['content']['title'];
			$this->__createFolder($this->title);
			$this->share['fileIds']['google']['mainfolder_fileId'] = $this->parentId; 
			
			$this->parent->setId($this->share['fileIds']['google']['mainfolder_fileId']);
			
    	$this->copyPDFCTA();
    	
		}
		
    $this->READ_JSON = $this->ENCODED_JSON; // HAS natural_BASE64 NO shrunken_base64 NO share['images'] -- also for PDF
		$this->stripForReadJson();   
    file_put_contents($this->temp_read_path, $this->READ_JSON);
    
    $this->LITE_JSON = $this->ENCODED_JSON; // HAS shrunken_base64 NO natural_base64 NO share -- also for building thumbs		
		$this->stripForLiteJson();   
		file_put_contents($this->temp_lite_path, $this->LITE_JSON);
		
		if( isset($this->publish) ) {
	    $this->TINY_JSON = $this->ENCODED_JSON; // ONLY TINY_base64 NO shrunken_base64 NO natural_base64 NO share -- also for building thumbs		
			$this->stripForTinyJson();
			file_put_contents($this->temp_tiny_path, $this->TINY_JSON);
		}
		 	
    $this->EDIT_JSON = $this->ENCODED_JSON; // HAS natural_BASE64 NO shrunken_base64 HAS share
		$this->stripForEditJson();
		
		if( isset($this->spotify) || 
				isset($this->generateSharePic) ||
				isset($this->copy) || 
				isset($this->renderAsPng) ||
				isset($this->print) ||
				isset($this->asTemplate)
		) {
			$this->__createPng('useRead');
			$obj['createPng1'] = TRUE;
		}
		
		if( isset($this->generateSharePic) || 
				isset($this->copy) || 
				isset($this->renderAsPng) ||
				isset($this->print) ||
				isset($this->asTemplate)
		) {
			$this->EDIT_JSON = $this->__setPropertiesToDataPgr('quickSaveCount', 1, $this->EDIT_JSON);	
		}		
		
		// RENDERING A THUMB FOR THE FILE
		$max_quicksaves = 5;
		if( isset($this->justSave)
		) {
			
			if ( !$this->__getPropertiesFromDataPgr('temp_image_id', $this->EDIT_JSON) ||
					 !$this->__getPropertiesFromDataPgr('quickSaveCount', $this->EDIT_JSON) ||
					 $this->__getPropertiesFromDataPgr('quickSaveCount', $this->EDIT_JSON) == 1
			){
				$this->__createPng('useRead');
				$obj['createPng2'] = TRUE;
				$alsoMoveImageToDriveTempImageFolder = 'true';
				$this->EDIT_JSON = $this->__setPropertiesToDataPgr('quickSaveCount', 1, $this->EDIT_JSON);
			} else {
				
				if( $this->__fileIdExist( $this->__getPropertiesFromDataPgr('temp_image_id', $this->EDIT_JSON) ) ){
					$this->fileId = $this->__getPropertiesFromDataPgr('temp_image_id', $this->EDIT_JSON);	
					$this->rawImg = $this->__openFromGoogleDrive();
					file_put_contents($this->temp_shrunk_path, $this->rawImg);					
				} else{
					$this->__createPng('useRead');
					$obj['createPng3'] = TRUE;
					$alsoMoveImageToDriveTempImageFolder = 'true';
					$this->EDIT_JSON = $this->__setPropertiesToDataPgr('quickSaveCount', 1, $this->EDIT_JSON);
				}
				
			}
			
			$quickSaveCount = $this->__getPropertiesFromDataPgr('quickSaveCount', $this->EDIT_JSON) + 1;
			if( $quickSaveCount > $max_quicksaves ) $quickSaveCount = 1;
			
			$this->EDIT_JSON = $this->__setPropertiesToDataPgr('quickSaveCount', $quickSaveCount, $this->EDIT_JSON);
			$obj['quickSaveCount'] = $quickSaveCount;			
			
		}
		
		// MOVING TO TEMP IMAGE FOLDER
		if( isset($this->generateSharePic) || 
				isset($this->renderAsPng)  ||
				isset($this->print) ||
				isset($this->copy) ||
				isset($this->asTemplate) ||
				isset( $alsoMoveImageToDriveTempImageFolder )
			) {
			
			if( !$this->__getPropertiesFromDataPgr('temp_image_id', $this->EDIT_JSON) ||
					isset($this->copy) ||
					isset($this->asTemplate)
			){
				// DO NOT TRASH OLD TEMP IMAGE
			} else {
				$temp_image_id = $this->__getPropertiesFromDataPgr('temp_image_id', $this->EDIT_JSON);
				if( $this->__fileIdExist( $temp_image_id ) ) $this->__trash( $temp_image_id );
			}
			 
			$this->imgTitle = "temp image";
			$this->imgDescription = "Temporary image";
			$this->parent = new Google_ParentReference();
	    $this->parent->setId($this->__getFolderId('pictoTempFolderId'));
			$this->__createImgInDrive();
			$obj['temp_image_id'] = $this->imageId;
			$this->EDIT_JSON = $this->__setPropertiesToDataPgr('temp_image_id', $this->imageId, $this->EDIT_JSON);	
		}	
		
		if( isset($this->publish) ) {

				$this->imgTitle = "shared published";
				
				$imagesArray = array();
				$imagesArray[0] = 'file';
				$imagesArray[1] = 'facebook';
//				$imagesArray[2] = 'twitter';
//				$imagesArray[3] = 'pinterest';
//				$imagesArray[4] = 'googleplus';
				
				for( $idx = 0; $idx <= 1; $idx++){
					$this->base64 = $this->share['images'][$imagesArray[$idx]];
					$this->imgDescription = $imagesArray[$idx] ." image";
					$this->__createImgInDrive();
					$this->share['fileIds']['google'][$imagesArray[$idx] . '_image_fileId'] = $this->imageId;
				}
							
				if( $this->share['content']['pdf'] == 'true') {			
					$this->__createPDF();
					$this->__savePDFtoGoogleDrive();
					$this->EDIT_JSON = $this->__setPropertiesToDataPgr('PDFId', $this->PDFId, $this->EDIT_JSON);
					$this->share['fileIds']['google']['PDFId'] = $this->PDFId;
				} else{
					$this->share['fileIds']['google']['PDFId'] = '';
				}

				$this->READ_JSON = $this->__setPropertiesToDataPgr('share', $this->share, $this->READ_JSON);
				$this->LITE_JSON = $this->__setPropertiesToDataPgr('share', $this->share, $this->LITE_JSON);
				$this->EDIT_JSON = $this->__setPropertiesToDataPgr('share', $this->share, $this->EDIT_JSON);
				
		}

		if( isset( $this->print ) ) { // PRINT
			$obj['createPDF1'] = TRUE;	
			$this->__createPDF();
			$this->__setParentFolder( $this->project . '_pdf' );
			$this->__savePDFtoGoogleDrive();
			$this->EDIT_JSON = $this->__setPropertiesToDataPgr('PDFId', $this->PDFId, $this->EDIT_JSON);
		}
		
		if( isset($this->isTemplate) && !isset($this->asTemplate)) { // template -> file 
			$this->EDIT_JSON = $this->__removePropertiesFromDataPgr('isTemplate', $this->EDIT_JSON); 
		}
		
    if( !isset($this->isTemplate) && isset($this->asTemplate) ) { // file -> template 
			$this->EDIT_JSON = $this->__setPropertiesToDataPgr('isTemplate', 'true', $this->EDIT_JSON);   	 
		}

    if( isset($this->asTemplate) ){

			$this->createThumbFromShrunkImgPath = TRUE;
			$this->__includeThumb();
			$this->__setParentFolder( $this->project . '_template' );
			
    } elseif( isset($this->publish) ){  // PUBLISH
    	
			$this->createThumbFromBase64 = TRUE;
			$this->base64 = $this->share['images']['facebook'];
			$this->__includeThumb();
			
			$this->parent = new Google_ParentReference();
			$this->parent->setId($this->share['fileIds']['google']['mainfolder_fileId']);
			
			// $this->stripForLiteJson();    // WHY DO THIS AGAIN?  REFACTOR
			$this->__saveOntoGoogleDrive( $this->LITE_JSON );
			$this->share['fileIds']['google']['share_lite_fileId'] = $this->fileId;
			
			$this->__saveOntoGoogleDrive( $this->TINY_JSON );
			$this->share['fileIds']['google']['share_tiny_fileId'] = $this->fileId;
			
			$this->READ_JSON = $this->__setPropertiesToDataPgr('share', $this->share, $this->READ_JSON);
			//$this->stripForReadJson();   // WHY DO THIS AGAIN?  REFACTOR
			$this->__saveOntoGoogleDrive( $this->READ_JSON );
			
			$this->share['needNewOriginalFileImage'] = 'false';
			
			if( $this->share['fileIds']['pictograph_db']['domain_id'] == 0){
				$this->domain_id = $this->share['fileIds']['pictograph_db']['domain_id'] = $this->__createNewDomain();
			}else{
				$this->domain_id = $this->share['fileIds']['pictograph_db']['domain_id'];
			}
			
			$this->share['fileIds']['google']['share_fileId'] = $this->fileId;
			$this->longUrl = "http://socialcampaigner.com/app/base?dmz=" . $this->domain_id;
			$this->share['content']['shortUrl'] = $this->__getShortenedURL();	
			
			$this->__updateDomain();
			
			$this->EDIT_JSON = $this->__setPropertiesToDataPgr('share', $this->share, $this->EDIT_JSON);

			$this->createThumbFromBase64 = TRUE;
			$this->base64 = $this->share['images']['file'];
			$this->__includeThumb();
			
			$this->__setParentFolder( $this->project . '_folder' );
			
    } else{ // ALL ELSE

			$this->createThumbFromShrunkImgPath = TRUE;
			$this->__includeThumb();    	
			$this->__setParentFolder( $this->project . '_folder' );
			
    }    
    
    /* SAVE */
    if( !isset($this->spotify)) {
    	
    	$this->__saveOntoGoogleDrive( $this->EDIT_JSON );
    	
    	if(!isset($this->asTemplate)) {
    		$obj['fileId'] = $this->fileId;
    	}
    	
    } 
    
		$this->__removeTempFileNames();

		if( isset($this->imgObj) ) {
    	$obj['base64'] = $this->imgObj['base64Data'];
    	$obj['width'] = $this->imgObj['width'];
    	$obj['height'] = $this->imgObj['height'];
		}
		
		if( isset( $this->print ) &&  isset( $this->PDFId )){
			$obj['PDFId'] = $this->PDFId;
		}
		
		if( isset($this->share ) ){
			$obj['share'] = $this->share;
		}		   
		 
    if( isset( $this->print ) ){
    	$obj['PDFId'] = $this->PDFId;
    }
		
		echo json_encode($obj);
		
	}
	
		protected function __createPng( $useWhat ){
			
			$this->load->library('tools');
			
			// NOTE OF CAUTION.  Phantomjs does not accept & when sending in two $_GET parameters
			$this->phantomUrl = $this->web_server_path . 'phantomjs/bin/phantomjs ' . $this->web_server_path . 'phantomjs/renderWithAlert.js ' . base_url() . 'index.php/app/base?param=' . $this->google_id . '@' .  $this->fileId . '@' . $useWhat . ' ' . $this->web_server_path .  $this->temp_img_path . ' ' . $this->width . ' '  . $this->height;

			$this->last_line = system( $this->phantomUrl, $retval);
			
//			$cropped_raw = $this->__cropMarginsHackForPhantom();
//			
//			ob_start();
//			imagepng($cropped_raw);
//			$cropped_raw = ob_get_contents(); 
//			ob_end_clean(); 
//			
//			file_put_contents($this->temp_img_path, $cropped_raw);
			
			// Shrink the PNG file size
			$this->pngquant_url = '/usr/local/bin/pngquant ' . $this->web_server_path  . $this->temp_img_path;
			system( $this->pngquant_url, $retval);
			
			$this->__setGraphicsToolsForm();
			$this->imgObj = $this->graphics_tools->convertToBase64( $this->temp_shrunk_path, 'false');
			$this->base64 = $this->imgObj['base64Data'];

		}		
		
		protected function __createPDF(){
			
			$this->load->library('tools');
			
			$this->phantomUrl = $this->web_server_path . 'phantomjs/bin/phantomjs ' . $this->web_server_path . 'phantomjs/renderPDFWithAlert.js ' . base_url() . 'index.php/app/base?param=' . $this->google_id .'@' . $this->fileId . '@useRead' . '@isPDF=true' . ' ' . $this->web_server_path .  $this->temp_pdf_path . ' ' . $this->width . ' '  . $this->height;

			$this->last_line = system( $this->phantomUrl, $retval);

		}
			
	public function login(){
		
		$this->load->view('landing_view', array());
		
	}
	
	public function save_local(){
		
		$this->server_response['post'] = $this->input->post('arrData');

		$this->google_id = $this->input->post('arrData')['google_id'];
		$this->fileId = $this->input->post('arrData')['fileId'];
    $this->__setTempFileNames();
		
    $this->READ_JSON = json_encode($this->input->post('arrData')['data']); // HAS natural_BASE64 NO shrunken_base64 NO share.images -- also for PDF
		$this->stripForReadJson();    
    
    $this->LITE_JSON = json_encode($this->input->post('arrData')['data']); // HAS shrunken_base64 NO natural_base64 NO share -- also for building thumbs		
		$this->stripForLiteJson();
    
    $this->TINY_JSON = json_encode($this->input->post('arrData')['data']); // ONLY TINY_base64 NO shrunken_base64 NO natural_base64 NO share -- also for building thumbs		
		$this->stripForTinyJson();
		    
    $this->EDIT_JSON = json_encode($this->input->post('arrData')['data']); // HAS natural_base64 HAS share NO shrunken_base64
		$this->stripForEditJson();

		file_put_contents($this->temp_read_path, $this->READ_JSON);		
		file_put_contents($this->temp_lite_path, $this->LITE_JSON);
		file_put_contents($this->temp_data_path, $this->EDIT_JSON);
		file_put_contents($this->temp_tiny_path, $this->TINY_JSON);
		
		$this->server_response['fileId'] =  $this->localFileId ;
		$this->server_response['google_id'] =  $this->google_id;
		$this->server_response['sizeOf'] =  sizeof($this->elements);
		
		echo json_encode($this->server_response);	
		
	}
	
	public function open_local(){

$good = 'https://pictographr.com/temp/good/';
$bad = 'https://pictographr.com/temp/bad/';
$saves = 'https://pictographr.com/temp/saves/';


//		$url = $good . 'data_XBpEsVgGWq_110646699089856958504_read.js';  // cube
//		$url = $good . 'data_UCyyjjBgFC_114485975963923406634_read.js';  // children

//		$url = $good . 'data_0B0f7VJXbePvNaGJYaVdNZjY5LTQ_118206160888825852810_read.js';  // children
//		$url = $good . 'data_DTl9ssbCTH_101523308245425443731_read.js';  // sdis
// 		$url = $good . 'data_0B6ucBWooFo4pTTM4Y3pIejBEbE0_112067060251601495270_read.js';  // NP
//		$url = $good . 'data_0B0R6vxnoxo7JNjZyVE5DblVXaHc_111428435731698456347_read.js';  // OTIS
//		$url = $good . 'data_0B_iJlfw0SEj8eVRSa2YtclVtZzQ_101523308245425443731_read.js';  // FBLA

//$url = $good . 'data_8Lpqh25HZG_118051937877392563718_read.js'; // 	 clap studios
// 		 $url = $good . 'data_0B4PW9ktTEVxkbXZLSG1zdmpPMUk_118051937877392563718_read.js';  	
//		$url = $good . 'data_XBpEsVgGWq_110646699089856958504_read.js';  // cube
// $url = $good . 'data_0B0hmukuR7mp4VGNULUF2VDljbFk_117485518963643517160_read.js';  // jonathan swift
// $url = $good . 'data_BBbpCG0Puz_116520789562281996521_read.js'; // #D
//$url = $good . 'data_0B4PW9ktTEVxkRjR0YUVqcmVyOU0_118051937877392563718_read.js'; // clap studios
//$url = $good . 'data_0B2fAhrIVoM9Ja3ZSNTZqd3ctRDQ_109081805523519920753_read.js'; // chart
//$url = $good . 'data_Uul74FqZXa_104572285411174477150_read.js'; // twitter
//$url = $good . 'data_SSbCPtteWf_101704756073504047349_read.js'; // bake
//$url = $good . 'data_0B-ruCuk_Sr29elZxWFNJS2JZU2s_111476796053247506051_read.js'; //graphic organizer
//$url = $good . 'data_0B6ucBWooFo4pS2t1OTN0cUVRR2c_112067060251601495270_read.js'; //soap
//$url = $saves . 'data_0B0XaIf5UUI5sckxSSW5KUUhXN0U_105846431707398487404_read.js'; 
		if( isset( $url )){
			echo json_encode( file_get_contents($url) );
		}else{
			$this->google_id = $this->localhost_google_id;
			$this->fileId = '0B5ptY5tUIebjdWhmTHA4Smh5em8';
			$this->temp_data_path = $this->upload_path . '/data_' . $this->fileId . '_' . $this->google_id . '.js';
			echo json_encode( file_get_contents( $this->temp_data_path ) );			
		};
		
	}	

	public function open_test_local(){
		
		//echo file_get_contents( $this->upload_path . '/data.zip'  );
		 	
		$this->google_id = '105870981217629422585';
		$this->fileId = '0B5ptY5tUIebjdWhmTHA4Smh5em8';
		$this->__setTempFileNames();
		
		$this->EDIT_JSON = $this->__openFromTempDrive();

		if ( !$this->__getPropertiesFromDataPgr('temp_image_id', $this->EDIT_JSON) ){
			echo "No temp image id";
		} else {
			echo  $temp_image_id = $this->__getPropertiesFromDataPgr('temp_image_id', $this->EDIT_JSON);
		}
		
		if ( !$this->__getPropertiesFromDataPgr('quickSaveCount', $this->EDIT_JSON) ){
			$quickSaveCount = 1;
		} else {
			$quickSaveCount = $this->__getPropertiesFromDataPgr('quickSaveCount', $this->EDIT_JSON) + 1;
			
			if( $quickSaveCount > 4 ) $quickSaveCount = 1;
			
		}
		
		echo "<br />" . $quickSaveCount;
		
		$this->EDIT_JSON = $this->__setPropertiesToDataPgr('quickSaveCount', $quickSaveCount, $this->EDIT_JSON);
		
		file_put_contents($this->temp_data_path, $this->EDIT_JSON);		
	}

	public function seeDataFromDrive(){ // http://pictographr.com/app/seeDataFromDrive?fileId=0B5ptY5tUIebjN19PdEFEMEszTG8
		
		$this->__paramIntoProperties($this->input->get());
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		$this->__getBinaryFromDrive();
		
		header('Content-Type: text/plain');
		echo $this->binary;	
		
	}
	
	public function newfile(){
		
		echo '<pre>';print_r(  $_GET  );echo '</pre>';  exit;
		
		$state = json_decode(stripslashes($_GET['state']));
		
		$google_id = $state->userId;
		
		$this->__setUsersModel();
		$whereArray = array(
				'google_id' => $google_id
			);
			
		$resultArray = $this->users_model->getUserWhere( $whereArray );
		$this->pictoFolderId = $resultArray['pictoFolderId'];
		
		$url = 'http://pictographr.com/app?state=%7B"folderId":%5B"' . $this->pictoFolderId .
							'"%5D, "newSerial": "' .  $this->__get_random_string(50) . '", "action":"create","userId":"' . $google_id . '"%7D';
							
		header("Location: " . $url);
		
	}
	
	public function stripForEditJson(){
	
		$this->elements = $this->__getPropertiesFromDataPgr('elements', $this->EDIT_JSON);
		
		for( $count = 0; $count < sizeof($this->elements); $count++ ){
			if( isset( $this->elements[$count]['data']['shrunken_base64']) ){
				unset($this->elements[$count]['data']['shrunken_base64']);
			}
		}
		
		$this->EDIT_JSON = $this->__setPropertiesToDataPgr('elements', $this->elements, $this->EDIT_JSON);
		
	}
	
	public function stripForReadJson(){
	
		$this->elements = $this->__getPropertiesFromDataPgr('elements', $this->READ_JSON);
		
		for( $count = 0; $count < sizeof($this->elements); $count++ ){
			if( isset( $this->elements[$count]['data']['shrunken_base64']) ){
				unset($this->elements[$count]['data']['shrunken_base64']);
			}
		}
		
		$this->READ_JSON = $this->__setPropertiesToDataPgr('elements', $this->elements, $this->READ_JSON);
		
		$share = $this->__getPropertiesFromDataPgr('share', $this->READ_JSON);
		
		unset($share['images']);
		
		$this->READ_JSON = $this->__setPropertiesToDataPgr('share', $share, $this->READ_JSON);
		
	}
		
	public function stripForLiteJson(){
	
		$this->elements = $this->__getPropertiesFromDataPgr('elements', $this->LITE_JSON);
		
		for( $count = 0; $count < sizeof($this->elements); $count++ ){
			if( isset( $this->elements[$count]['data']['base64']) ){
				unset($this->elements[$count]['data']['base64']);
				unset($this->elements[$count]['data']['width']);
				unset($this->elements[$count]['data']['height']);
			}
		}
		
		$this->LITE_JSON = $this->__setPropertiesToDataPgr('elements', $this->elements, $this->LITE_JSON);
		
		$this->LITE_JSON = $this->__removePropertiesFromDataPgr('share', $this->LITE_JSON);
		
	}
		
	public function stripForTinyJson(){
	
		$this->elements = $this->__getPropertiesFromDataPgr('elements', $this->TINY_JSON);
		
		for( $count = 0; $count < sizeof($this->elements); $count++ ){
			if( isset( $this->elements[$count]['data']['base64']) ){
				unset($this->elements[$count]['data']['base64']);
				unset($this->elements[$count]['data']['width']);
				unset($this->elements[$count]['data']['height']);
			}
		}
		
		for( $count = 0; $count < sizeof($this->elements); $count++ ){
			if( isset( $this->elements[$count]['data']['shrunken_base64']) ){
				unset($this->elements[$count]['data']['shrunken_base64']);
			}
		}
		
		$this->TINY_JSON = $this->__setPropertiesToDataPgr('elements', $this->elements, $this->TINY_JSON);
		
		$this->TINY_JSON = $this->__removePropertiesFromDataPgr('share', $this->TINY_JSON);
		
	}
	
		protected function __setTempFileNames(){
			
			$image_filename = 'image_' . $this->fileId . '_' . $this->google_id . '.' . 'png';
			$thumb_filename = 'image_thumb_' . $this->fileId . '_' . $this->google_id . '.' . 'png';
			$pdf_filename = 'pdf_' . $this->fileId . '_' . $this->google_id . '.' . 'pdf';
			$suffix = '-fs8';
			$shrunk_filename = 'image_' . $this->fileId . '_' . $this->google_id . $suffix. '.' . 'png';
			$this->temp_data_path = $this->upload_path . '/data_' . $this->fileId . '_' . $this->google_id . '.js';
			$this->temp_lite_path = $this->upload_path . '/data_' . $this->fileId . '_' . $this->google_id . '_lite.js';
			$this->temp_tiny_path = $this->upload_path . '/data_' . $this->fileId . '_' . $this->google_id . '_tiny.js';
			$this->temp_edit_path = $this->upload_path . '/data_' . $this->fileId . '_' . $this->google_id . '_edit.js';
			$this->temp_read_path = $this->upload_path . '/data_' . $this->fileId . '_' . $this->google_id . '_read.js';
			$this->temp_img_path = $this->upload_path . '/' . $image_filename;
			$this->temp_thumb_path = $this->upload_path . '/' . $thumb_filename;
			$this->temp_pdf_path = $this->upload_path . '/' . $pdf_filename;
			$this->temp_shrunk_path = $this->upload_path . '/' . $shrunk_filename;			
		}
		
		protected function __removeTempFileNames(){
			
			if( file_exists($this->temp_data_path)){ unlink($this->temp_data_path); }
			if( file_exists($this->temp_lite_path)){ unlink($this->temp_lite_path); }
			if( file_exists($this->temp_tiny_path)){ unlink($this->temp_tiny_path); }
			if( file_exists($this->temp_edit_path)){ unlink($this->temp_edit_path); }
			if( file_exists($this->temp_read_path)){ unlink($this->temp_read_path); }
			if( file_exists($this->temp_img_path)){ unlink($this->temp_img_path); }
			if( file_exists($this->temp_thumb_path)){ unlink($this->temp_thumb_path); }
			if( file_exists($this->temp_shrunk_path)){ unlink($this->temp_shrunk_path); }
			if( file_exists($this->temp_pdf_path)){ unlink($this->temp_pdf_path); }
		}
		
		protected function __setPropertiesToDataPgr($key, $value, $jsonData){ 
			
			$dataObj = json_decode( $jsonData );
			
			$dataArr = $this->__object_to_array($dataObj);
			
			$dataArr[$key] = $value;	
			
			return json_encode($dataArr);		
		}
	
		protected function __addPropertiesToDataPgr($key, $value){ 
			
			$dataObj = json_decode($this->JSON );
			
			$dataArr = $this->__object_to_array($dataObj);
			
			$dataArr[$key] = $value;	
			
			$this->JSON = json_encode($dataArr);		
		}
		
		protected function __getPropertiesFromDataPgr($key, $jsonData){
			
//			ini_set("memory_limit", "1024M");  // solving Allowed memory size of 134217728 bytes exhausted (tried to allocate 32199053 bytes) when tried to send a data file that was huge
			
			$dataObj = json_decode( $jsonData );
			
			$dataArr = $this->__object_to_array($dataObj);
			
			if( !isset($dataArr[$key])) return false;
			
			return $dataArr[$key];		
		}

		protected function __removePropertiesFromDataPgr($key, $jsonData){ 
			
			$dataObj = json_decode( $jsonData );
			
			$dataArr = $this->__object_to_array($dataObj);
			
			unset($dataArr[$key]);	
			
			return json_encode($dataArr);
			
		}
	
	public function open_badfile(){

		$this->badfile_path = 'bad';
		$this->temp_data_path = $this->badfile_path . '/badfile.js';
		echo json_encode( file_get_contents( $this->temp_data_path ) );
		
	}
	
	public function open_template(){
		
		$this->google_id = $this->input->post('arrData')['google_id'];
		$this->template_id = $this->input->post('arrData')['template_id'];
		echo json_encode($this->__openFromTemplates());
	}
	
	public function spotToDrive(){
		
		$this->imgObj = array();
		$this->obj = array();
    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();

		if( isset( $this->pinterest ) ||  isset( $this->social )){
		
			$this->__setParentFolder( $this->project . '_share' );
		
			$this->parent = new Google_ParentReference();
			$this->parent->setId($this->pictoShareFolderId);
			$this->imgTitle = "shared published";
			$this->imgDescription = "Social Shared Image";		
				
		} else {
			
			$this->__setParentFolder( $this->project . '_image' );
		
		}
		
		$this->__createImgInDrive();
    $obj['image_fileId'] = $this->imageId;

		$this->longUrl = "http://pictographr.com/image/socialImage/" . $this->google_id . "/" . $this->imageId;
		$obj['shortenedURL'] = $this->__getShortenedURL();
		$obj['longUrl'] = $this->longUrl;

		
		echo json_encode($obj);
	}
	
	public function spotToTempFile(){
		
		$this->fileId = 'facebook';
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		$this->__setTempFileNames();	

		$rawImg = base64_decode($this->base64);
		
		$mimeType = 'image/png';

		file_put_contents($this->temp_img_path, $rawImg);
					
	}
	
	public function removeSpotToTempFile(){
		
		$this->fileId = 'facebook';
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		$this->__setTempFileNames();	

		$this->__removeTempFileNames();
					
	}

	public function open(){ // http://pictographr.com/app/open
		
    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
			
			switch ( $this->openFrom ) {
				
			  case 'temp_image':
			  	$this->__setGraphicsToolsForm();
					$this->rawImg = $this->__openFromGoogleDrive();
					$this->imgObj = $this->graphics_tools->convertToBase64('false', $this->rawImg);
					echo json_encode($this->imgObj);
				break;
	
			  case 'drive':
					
					$this->JSON = $this->__openFromGoogleDrive();
					$this->__addPropertiesToDataPgr('parentFolderId', $this->parentFolderId);
					$this->__addPropertiesToDataPgr('fileTitle', $this->fileTitle);
					
					if( $this->__isFolderOwnedByMe( $this->parentFolderId ) ){
						
						$this->__addPropertiesToDataPgr('isFolderOwnedByMe', 'true');
						
					} else{
						
						$this->__addPropertiesToDataPgr('isFolderOwnedByMe', 'false');
						
					};
					
					echo json_encode($this->JSON);
					
				break;
				
			  case 'temp':
					echo json_encode($this->__openFromTempDrive());
				break;
				
			  case 'template':
					echo json_encode($this->__openFromTemplate());
				break;
				
			  case 'useLite':
					echo json_encode($this->__openFromLiteDrive());
				break;		
						
			  case 'useTiny':
					echo json_encode($this->__openFromTinyDrive());
				break;		
						
			  case 'useRead':
					echo json_encode($this->__openFromReadDrive());
				break;	
							
			}

	}
	
	public function doesDriveFileIdExist(){
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
    $obj = array(
    	'itDoesExist' => 'false'
    );
    
		if( $this->__fileIdExist( $this->fileId ) ){
				$obj['itDoesExist'] = 'true';
		}
		echo json_encode($obj);
	}
	
	public function streamDataJs(){ //http://pictographr.com/app/streamDataJs?google_id=105870981217629422585&fileId=0B5ptY5tUIebjX1BwcHBpdlp0M1E
		
		$this->__paramIntoProperties($this->input->post('arrData'));
		
		if( !isset($this->google_id) ) $this->google_id = '105870981217629422585';
		
		$this->__getBinaryFromDrive();
		
		header('Content-Type: text/plain');
		echo $this->binary;		
	}
	
	public function streamPDF(){  //http://pictographr.com/app/streamPDF?google_id=105870981217629422585&fileId=0B5ptY5tUIebjd196aUJwak5YcUU
		
		$this->__getBinaryFromDrive();
		
		header('Content-Type: application/pdf');
		echo $this->binary;
		
	}
	
	public function getPDFList() {//http://pictographr.com/app/getPDFList
		
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();

    $parameters = array();
    
    $parameters['q'] = "'"  .   $this->pictoPdfFolderId . "' in parents and trashed = false and mimeType = 'application/pdf'";
    
		$count = 0;

    $files = $this->service->files->listFiles($parameters);
    
    $data = [];
    
    foreach( $files['items']  as  $label => $item){
    	if( !isset($item['thumbnailLink'])) continue;
    	$file = [];
    	$file['fileId'] = $item['id'];
    	$file['thumbnailLink'] = $item['thumbnailLink'];
    	$data[] = $file;
    }
    
    echo json_encode($data);
/*

$mime_types= array(
    "xls" =>'application/vnd.ms-excel',
    "xlsx" =>'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    "xml" =>'text/xml',
    "ods"=>'application/vnd.oasis.opendocument.spreadsheet',
    "csv"=>'text/plain',
    "tmpl"=>'text/plain',
    "pdf"=> 'application/pdf',
    "php"=>'application/x-httpd-php',
    "jpg"=>'image/jpeg',
    "png"=>'image/png',
    "gif"=>'image/gif',
    "bmp"=>'image/bmp',
    "txt"=>'text/plain',
    "doc"=>'application/msword',
    "js"=>'text/js',
    "swf"=>'application/x-shockwave-flash',
    "mp3"=>'audio/mpeg',
    "zip"=>'application/zip',
    "rar"=>'application/rar',
    "tar"=>'application/tar',
    "arj"=>'application/arj',
    "cab"=>'application/cab',
    "html"=>'text/html',
    "htm"=>'text/html',
    "default"=>'application/octet-stream',
    "folder"=>'application/vnd.google-apps.folder'
);
*/
	}
	
	public function seeFile(){  //http://pictographr.com/app/seeFile
		
		$this->__setUsersModel();
		
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		
		$this->__getUserIdAndSessionIdWithSessionId();
		$this->__connectGAPI();
		$this->__connectDriveServices();
		$this->client->setAccessToken( $this->google_token_pictographr );
		
		$this->fileId = '0B5ptY5tUIebjYkczTjFLT1prQkU';

		$file_data = $this->service->files->get( $this->fileId );
		$thumbnailLink = $file_data['thumbnailLink'];

    $request = new Google_HttpRequest($thumbnailLink, 'GET', null, null);
    $httpRequest = Google_Client::$io->authenticatedRequest($request);
    
    
    echo '<pre>';print_r(  $httpRequest );echo '</pre>';  exit;
    
	}
	
	public function copyPDFCTA() { 
		
		$this->elements = $this->__getPropertiesFromDataPgr('elements', $this->ENCODED_JSON);
		
		for( $count = 0; $count < sizeof($this->elements); $count++ ){
			if( isset( $this->elements[$count]['data']['cta_pdfId']) ){
				$this->fileId_to_copy = $this->elements[$count]['data']['cta_pdfId'];
				$this->__copyFile();
				$this->elements[$count]['data']['cta_pdfId'] = $this->newFileId;
			}
		}
		
		$this->ENCODED_JSON = $this->__setPropertiesToDataPgr('elements', $this->elements, $this->ENCODED_JSON);
		
	}
	
	public function copyFile() {	
			
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
			
			$this->__copyFile();
			
	    $obj = array(
	    	'fileId' => $this->newFileId
	    );	    
			echo json_encode($obj);
	}
		
		protected function __copyFile() {  //http://pictographr.com/app/copyFile

			$this->__setGraphicsToolsForm();
			
		  $copiedFile = new Google_DriveFile();
		  $copiedFile->setTitle('Pictographr File');
		  
				$file_data = $this->service->files->get( $this->fileId_to_copy );
				$thumbnailLink = $file_data['thumbnailLink'];
	
		    $request = new Google_HttpRequest($thumbnailLink, 'GET', null, null);
		    $httpRequest = Google_Client::$io->authenticatedRequest($request);
				$this->rawImg =  $httpRequest->getResponseBody();
				$imageBlackWhiteBinary = $this->graphics_tools->blackWhite($this->rawImg);
				
				ob_start();
				imagepng($imageBlackWhiteBinary);
				$imageBlackWhite = ob_get_clean();
				
				$img = rtrim(strtr(base64_encode($imageBlackWhite), '+/', '-_'), '=');
				imagedestroy($imageBlackWhiteBinary);
				
				//ob_end_clean(); // delete buffer   failed to delete buffer. No buffer to delete
	
				$this->thumbnail = new Google_DriveFileThumbnail();
				$this->thumbnail->setImage($img);
				$this->thumbnail->setMimeType('image/png');
		  
			$copiedFile->setThumbnail($this->thumbnail);
			
			if( isset($this->parent) ){
				$copiedFile->setParents(array($this->parent));	
			}
		  
			try {
				
			  $this->google_data = $this->service->files->copy($this->fileId_to_copy, $copiedFile);
			  
				$this->newFileId = $this->google_data['id'];
	
			} catch (Exception $e) {
			  print "An error occurred: " . $e->getMessage();
			}
			return NULL;
			
		}
		
	public function getFileList() { //http://pictographr.com/app/getFileList
		 // https://developers.google.com/drive/web/search-parameters
		 
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();

		if( $this->whichFolder == 'files') $useThisFolderId = $this->pictoFolderId;
		if( $this->whichFolder == 'templates') $useThisFolderId = $this->pictoTemplateFolderId;

    $parameters = array();
    
    $parameters['q'] = "'"  .  $useThisFolderId . "' in parents and trashed = false and mimeType = 'application/vnd.google.drive.ext-type.pgr'";
    
		$count = 0;
		$data = [];
		
		try {
		  $files = $this->service->files->listFiles($parameters);
		} catch (Exception $e) {
	    header('Access-Control-Allow-Origin: *'); 
	    echo json_encode($data);
	    return;
		}

    // $files = $this->service->files->listFiles($parameters);
    
    foreach( $files['items']  as  $label => $item){
    	
    	//$raw = $this->__ranger('https://lh4.googleusercontent.com/Jcb8ENnchj0lVubKwHtJRBu6KBybJEzKS8wqNxXY1MIF_YxEVLt8SHJZ9wcTVFXaAyPo4Q=s220');
    	//$raw = $this->__ranger( $item['thumbnailLink']);
			//$im = imagecreatefromstring($raw);
    	
    	$file = [];
    	$file['place'] = $this->place;
    	$file['fileId'] = $item['id'];
    	
			if( isset($item['thumbnailLink']) ){
				$file['thumbnailLink'] = $item['thumbnailLink'];
			} else {
				$file['thumbnailLink'] = 'https://pictographr.com/img/resave.png';
			}
			
    	//$file['width'] =  imagesx($im);
    	//$file['height'] = imagesy($im);
    	$data[] = $file;
    }
    
    header('Access-Control-Allow-Origin: *'); 
    echo json_encode($data);

	}
	
		
	public function getMoreFiles() { //http://pictographr.com/app/getMoreFiles
		 
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();

		if( isset( $this->nextPageToken )){
			$parameters['pageToken'] = $this->nextPageToken;
		};
    
    $parameters['q'] = "'"  .  $this->pictoFolderId . "' in parents and trashed = false and mimeType = 'application/vnd.google.drive.ext-type.pgr'";
    $parameters['maxResults'] = $this->boxesPerMainContainer;
    
		$count = 0;
		
		try {
		  $files = $this->service->files->listFiles($parameters);
		} catch (Exception $e) {
	    header('Access-Control-Allow-Origin: *');
	    $response['status'] = 'error';
	    echo json_encode($response);
	    return;
		}
		
		$data = [];
		$files = $this->service->files->listFiles($parameters);
    
    foreach( $files['items']  as  $label => $item){

    	$file = [];
    	$file['place'] = $this->place;
    	$file['fileId'] = $item['id'];
    	$file['thumbnailLink'] = $item['thumbnailLink'];
    	$data[] = $file;
    }
    
    $response['data'] = $data;
    $response['fullname'] = $this->user_name;
    $response['status'] = 'success';
    if( isset( $files['nextPageToken']) ) $response['nextPageToken'] = $files['nextPageToken'];
    
    
    header('Access-Control-Allow-Origin: *'); 
    echo json_encode($response);

	}
	
	public function doit(){
		
		$url = "https://lh4.googleusercontent.com/Jcb8ENnchj0lVubKwHtJRBu6KBybJEzKS8wqNxXY1MIF_YxEVLt8SHJZ9wcTVFXaAyPo4Q=s220";

		$raw = $this->__ranger($url);
		$im = imagecreatefromstring($raw);
		
		$width = imagesx($im);
		$height = imagesy($im);
		
		echo $width;

	}

		private function __ranger($url){
	    $headers = array(
	    	"Range: bytes=0-32768"
	    );
	
	    $curl = curl_init($url);
		  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		  curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
		  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
		  curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
		  $data = curl_exec($curl);
		  curl_close($curl);
		  return $data;
		}
		
	public function getFileIdOfFolder(){ // http://pictographr.com/app/getFileIdOfFolder
		
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		
		$parameters = array();
		
    $parameters['q']  = "name = 'Files'";

		$count = 0;

    $files = $this->service->files->listFiles($parameters);
    
    $data = [];
    
    foreach( $files['items']  as  $label => $item){
    	
    	if( !isset($item['thumbnailLink'])) continue;
    	
    	$file = [];
    	$file['fileId'] = $item['id'];
    	$file['thumbnailLink'] = $item['thumbnailLink'];
    	$file['width'] = $item['imageMediaMetadata']['width'];
    	$file['height'] = $item['imageMediaMetadata']['height'];
    	
    	$data[] = $file;
    }

    echo '<pre>';print_r(  $data );echo '</pre>';  exit;
	}
	
	public function getImgFileList() { // http://pictographr.com/app/getImgFileList
		// https://developers.google.com/drive/web/search-parameters
		
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		
    $parameters = array();
    
    $mimeTypePNG = 'image/png';
    $mimeTypeJPG = 'image/jpeg';
    
    $parameters['q']  = "'"  .  $this->pictoImageFolderId . "' in parents and trashed = false  ";
    $parameters['q'] .= " and mimeType = '" . $mimeTypePNG . "' and trashed = false  ";
    $parameters['q'] .= " and not title contains 'shared published'  ";
    $parameters['q'] .= " and not title contains 'temp image'  ";
    $parameters['q'] .= " or ";
    $parameters['q'] .= "'"  .  $this->pictoImageFolderId . "' in parents and trashed = false  ";
    $parameters['q'] .= " and mimeType = '" . $mimeTypeJPG . "' and trashed = false ";

		$count = 0;

    $files = $this->service->files->listFiles($parameters);
    
    $data = [];
    
    foreach( $files['items']  as  $label => $item){
    	
    	if( !isset($item['thumbnailLink'])) continue;
    	
    	$file = [];
    	$file['fileId'] = $item['id'];
    	$file['thumbnailLink'] = $item['thumbnailLink'];
    	$file['width'] = $item['imageMediaMetadata']['width'];
    	$file['height'] = $item['imageMediaMetadata']['height'];
    	
    	$data[] = $file;
    }

    echo json_encode($data);

	}	
	
	public function listFiles() { //  http://pictographr.com/app/listFiles
		
		$this->google_id = '105870981217629422585';

		if( !$this->connected ) $this->__connect();

    $parameters = array();
    
    $parameters['q'] = "'"  .$this->pictoFolderId . "' in parents and trashed = false and mimeType = 'application/vnd.google.drive.ext-type.pgr'";
    
		$count = 0;

    $files = $this->service->files->listFiles($parameters);
    
    foreach( $files['items']  as  $label => $item){
    	
//    	echo '<pre>';print_r( $item );echo '</pre>';
   		$count++;
    	$fileId = $item['id'];
    	echo $count . ") " . $fileId . "<img src='" . $item['thumbnailLink'] . "'/><br />";
    }

	}
	
		protected function __isTemplate($fileId){
			
			$this->__setUsersModel();
			$this->__getUserIdAndSessionIdWithSessionId();
			
		 	return $this->__isFileInFolder($fileId, $this->pictoTemplateFolderId);
		 	
		}
		
		protected function __cropMarginsHackForPhantom(){
			
			$rawImg = file_get_contents( $this->temp_img_path );		
			
			$image = imagecreatefromstring($rawImg);
			
			$x = getimagesizefromstring($rawImg);
			$this->width  = $x['0'];
			$this->height = $x['1'];
			
			$new_image = imagecreatetruecolor($this->width, $this->height);
			
			imagecolortransparent($new_image, imagecolorallocatealpha($new_image, 0, 0, 0, 127));
			
			imagealphablending($new_image, false);
			
			imagesavealpha($new_image, true);
			
			imageCopyResampled($new_image, $image, 0, 0, 0, 0, $this->width + 9, $this->height + 9, $this->width, $this->height);

			imagedestroy($image);

			return $new_image;
			
		}
	
		protected function __doTrash(){
			
			if(!isset($this->fileId)){
				return FALSE;
			}
						
			if($this->fileId == 'false'){
				return FALSE;
			}
			
			if(isset($this->spotify)){
				return FALSE;
			}
			
			if(isset($this->renderAsPng)){
				return TRUE;
			}
								
			if(isset($this->publish)){
				return TRUE;
			}
					
			if(isset($this->copy)){
				return FALSE;
			}		
							
	    if( !isset($this->isTemplate) && isset($this->asTemplate) ) { // file -> template 
				return FALSE;
			}
			
	    if( isset($this->isTemplate) && !isset($this->asTemplate) ) { // template -> file 
				return FALSE;
			}
			
			if( isset($this->generateSharePic) ) {
				return TRUE;
			}
			
			return TRUE;
			
		}

		protected function __saveOntoGoogleDrive( $data ){

			$mimeType = 'application/vnd.google.drive.ext-type.pgr';
	
			$file = new Google_DriveFile();
			$file->setTitle( 'Saved ' . date("n-d-Y") . ' at ' . date("g:ia"));
			$file->setDescription('A ' .  ucfirst($this->project) .  ' data file');
			$file->setMimeType($mimeType);		
				
			if( isset($this->parent) ){
				$file->setParents(array($this->parent));	
			}
			if( isset($this->thumbnail) ){
				$file->setThumbnail($this->thumbnail);		
			}
			  
		  try {
		    
				$this->google_data = $this->service->files->insert($file, array(
				      'data' => $data,
				      'mimeType' => $mimeType,
				    ));
				    
				$this->fileId = $this->google_data['id'];
				
		  } catch (Exception $e) {
		  	
		    print "An error occurred: " . $e->getMessage();
		    
		  }				
									
		}
		
		protected function __savePDFtoGoogleDrive(){
			
			if( isset( $this->template_pdf ) ){
				$data = $this->template_pdf;
			} elseif( isset($this->temp_pdf_path ) ){
				$data = file_get_contents( $this->temp_pdf_path );
			};			
			
			$mimeType = 'application/pdf';
			
			$file = new Google_DriveFile();
			$file->setTitle('PDF');
			$file->setDescription('PDF');
			$file->setParents(array($this->parent));
			$file->setMimeType($mimeType);

		  try {
		  	
				$this->google_data = $this->service->files->insert($file, array(
				      'data' => $data,
				      'mimeType' => $mimeType,
				    ));
				    
			$this->PDFId = $this->google_data['id'];
				
		  } catch (Exception $e) {
		  	
		    print "An error occurred: " . $e->getMessage();
		    
		  }		
									
		}

		protected function __openFromTempDrive(){ 
			$this->__setTempFileNames();
			$data = file_get_contents( $this->temp_data_path );
			return $data;
				
		}	
		
		protected function __openFromTemplates(){
			
			$this->isFrom = __FUNCTION__;
			$this->__setAndConnectToGoogle();
			
			$path_to_template_file = $this->template_path . '/' . $this->template_id . '.js';
			$this->template_data = file_get_contents( $path_to_template_file );

			$this->template_data = $this->__removePropertiesFromDataPgr('PDFId', $this->template_data);
			$this->template_data = $this->__removePropertiesFromDataPgr('temp_image_id', $this->template_data);
			
			$this->template_data = $this->__setPropertiesToDataPgr('fileId', 'false', $this->template_data);

			return $this->template_data;
			
		}
				

		protected function __openFromTemplatesXXX(){
			
			$this->isFrom = __FUNCTION__;
			$this->__setAndConnectToGoogle();
			
			$path_to_template_file = $this->template_path . '/' . $this->template_id . '.js';
			$path_to_template_img = $this->template_path . '/' . $this->template_id . '.png';
			$path_to_template_pdf = $this->template_path . '/' . $this->template_id . '.pdf';
			
			$this->template_data = file_get_contents( $path_to_template_file );
			$this->template_img = file_get_contents( $path_to_template_img );
			$this->template_pdf = file_get_contents( $path_to_template_pdf );
			
			$this->imgTitle = "temp image";
			$this->imgDescription = "Temporary image";
			$this->parent = new Google_ParentReference();
	    $this->parent->setId($this->pictoTempFolderId);
			$this->__createImgInDrive();
			$this->template_data = $this->__setPropertiesToDataPgr('temp_image_id', $this->imageId, $this->template_data);	

			$this->parent = new Google_ParentReference();
	    $this->parent->setId($this->pictoPdfFolderId);
			$this->__savePDFtoGoogleDrive();
			$this->template_data = $this->__setPropertiesToDataPgr('PDFId', $this->PDFId, $this->template_data);
			
			$this->createThumbFromShrunkTemplateImgPath = TRUE; // need shrinking to thumbsize
			$this->template_img_shrunk_path = $path_to_template_img;
			$this->__includeThumb();
			
			$this->parent = new Google_ParentReference();
			$this->parent->setId($this->pictoFolderId);
			
			$this->__saveOntoGoogleDrive( $this->template_data );
			$this->template_data = $this->__setPropertiesToDataPgr('fileId', $this->fileId, $this->template_data);
			
			return $this->__openFromGoogleDrive();
			
		}
				
		protected function __openFromLiteDrive(){ 
			$this->__setTempFileNames();
			$data = file_get_contents( $this->temp_lite_path );
			return $data;
				
		}

		protected function __openFromTinyDrive(){ 
			$this->__setTempFileNames();
			$data = file_get_contents( $this->temp_tiny_path );
			return $data;
		}		
		
		protected function __openFromReadDrive(){ 
			$this->__setTempFileNames();
			$data = file_get_contents( $this->temp_read_path );
			return $data;
				
		}			
			
		protected function __includeThumb(){ // http://pictographr.com/app/includeThumb

			$this->graphics_tools = new Models_Form_Graphics_Tools;
			
//			$this->url4ImgNhiddenAppFolder = base_url(). "image/streamDriveImage?google_id=" . $this->google_id . "&fileId=" . $this->fileId_of_created_jpg;  //			$this->url4ImgNhiddenAppFolder = 'http://design.ubuntu.com/wp-content/uploads/ubuntu-logo32.png';
//			$this->url4ImgNhiddenAppFolder = 'http://design.ubuntu.com/wp-content/uploads/ubuntu-logo32.png';
			
			if( isset($this->createThumbFromImgNhiddenAppFolder)){
//				$url4ImgNhiddenAppFolder = base_url(). "image/streamDriveImage?google_id=" . $this->google_id . "&fileId=" . $this->fileId4tImgNhiddenAppFolder;
//				$this->rawImg =  file_get_contents( $url4ImgNhiddenAppFolder );
			} elseif( isset($this->createThumbFromBase64) ){
				$this->rawImg =  base64_decode($this->base64);
			} elseif( isset($this->createThumbFromShrunkTemplateImgPath) ) {
				$this->rawImg =  file_get_contents( $this->template_img_shrunk_path );
			} elseif( isset($this->createThumbFromShrunkImgPath) ) {
				$this->rawImg =  file_get_contents( $this->temp_shrunk_path );
			}
			
			$imageBlackWhiteBinary = $this->graphics_tools->blackWhite($this->rawImg);// disabling BW
			
			ob_start();
			imagepng($imageBlackWhiteBinary);// disabling BW
			// imagepng($this->rawImg); // disabling BW
			$imageBlackWhite = ob_get_clean();
			// ob_end_clean(); // delete buffer
			
			$img = rtrim(strtr(base64_encode($imageBlackWhite), '+/', '-_'), '=');
			imagedestroy($imageBlackWhiteBinary);				


			$this->thumbnail = new Google_DriveFileThumbnail();
			$this->thumbnail->setImage($img);
			$this->thumbnail->setMimeType('image/png');
	
				
		}

		protected function __publishDomain(){
			
			if($this->__domainURLExist()){
				$this->__updateDomain();
			} else {
				$this->__createNewDomain();
			}
			
		}
		
		protected function __setWhatArray(){
			
			$this->set_array = array(
			
				'user_id' => $this->user_id,
				'google_id' => $this->google_id,
				
				'shortUrl' => $this->share['content']['shortUrl'],
				'share_fileId' => $this->share['fileIds']['google']['share_fileId'],
				'share_lite_fileId' => $this->share['fileIds']['google']['share_lite_fileId'],
				'share_tiny_fileId' => $this->share['fileIds']['google']['share_tiny_fileId'],
				'PDFId' => $this->share['fileIds']['google']['PDFId'],
				'mainfolder_fileId' => $this->share['fileIds']['google']['mainfolder_fileId'],
				'facebook_image_fileId' => $this->share['fileIds']['google']['facebook_image_fileId'],
				'twitter_image_fileId' => $this->share['fileIds']['google']['twitter_image_fileId'],
				'pinterest_image_fileId' => $this->share['fileIds']['google']['pinterest_image_fileId'],
				'googleplus_image_fileId' => $this->share['fileIds']['google']['googleplus_image_fileId'],
				'instagram_image_fileId' => $this->share['fileIds']['google']['instagram_image_fileId'],
				'stumbleupon_image_fileId' => $this->share['fileIds']['google']['stumbleupon_image_fileId'],
				'linkedin_image_fileId' => $this->share['fileIds']['google']['linkedin_image_fileId'],
				'file_image_fileId' => $this->share['fileIds']['google']['file_image_fileId'],
				
				'pdf' => ( $this->share['content']['pdf'] == 'true' ? true: false),
				'custom_domain' => ( $this->share['content']['custom_domain'] == 'true' ? true: false),
				'discussion' => ( $this->share['content']['discussion'] == 'true' ? true: false),
				
				'vanity' => $this->share['content']['vanity'],
				'adsense' => $this->share['content']['adsense'],
				'caption' => $this->share['content']['caption'],
				'title' => $this->share['content']['title'],
				'description' => $this->share['content']['description'],
				'keywords' => $this->share['content']['keywords'],
				'tracking' => $this->share['content']['tracking'],
				'hash' => $this->share['content']['hash']
			);
			
			if( $this->share['content']['custom_domain'] == 'true') {	
				$this->set_array['name'] = $this->share['content']['ownedbythem_domain'];
			} else{
				$this->set_array['name'] = $this->share['content']['choice_domain'].'.com';
			};
			
			
			return $this->set_array;
		}
		
		protected function __createNewDomain(){

			return $this->domain_id = $this->domains_model->insertDomain( $this->__setWhatArray() );	

		}
		
		protected function __updateDomain(){
			
			$this->domains_model->updateDomain( 
				$this->domain_id, 
				$this->__setWhatArray()
			);	
			
			return;
			
			if( $this->__confirmDomain() ){
				
			}

		}	
		
		protected function __fileIdAndGoogle_idExist(){
			
			$whereArray = array(
					'google_id' => $this->google_id,
					'share_fileId' => $this->share_fileId
				);
				
						
			$this->domainArray = $this->domains_model->getDomainWhere( $whereArray );
			
			if( $this->domainArray != 0){
				
				$this->domain_id = $this->domainArray['id'];
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
				
		protected function __domainIDexist(){
			
			$whereArray = array(
					'id' => $this->dmz
				);
				
						
			$this->domainArray = $this->domains_model->getDomainWhere( $whereArray );
			
			if( $this->domainArray != 0){
				
				$this->domain_id = $this->domainArray['id'];
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
				
		protected function __domainURLExist(){
			
			$whereArray = array(
					'name' => $this->domain_name,
					'vanity' => $this->vanity
				);
				
						
			$this->domainArray = $this->domains_model->getDomainWhere( $whereArray );
			
			if( $this->domainArray != 0){
				
				$this->domain_id = $this->domainArray['id'];
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
		
		protected function __confirmDomain(){
			
			if( $this->share['fileIds']['google']['share_fileId'] == $this->fileId){
				return 	TRUE;
			} else {
				return 	FALSE;
			}	
			
		}

		protected function __getShortenedURL(){  
			
			$postData = array('longUrl' => $this->longUrl);
			
			$jsonData = json_encode($postData);
			
			$curlObj = curl_init();
			
			curl_setopt($curlObj, CURLOPT_URL, 'https://www.googleapis.com/urlshortener/v1/url?key=' . $this->_developerKey);
			curl_setopt($curlObj, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curlObj, CURLOPT_SSL_VERIFYPEER, 0);
			curl_setopt($curlObj, CURLOPT_HEADER, 0);
			curl_setopt($curlObj, CURLOPT_HTTPHEADER, array('Content-type:application/json'));
			curl_setopt($curlObj, CURLOPT_POST, 1);
			curl_setopt($curlObj, CURLOPT_POSTFIELDS, $jsonData);
			
			$response =  $this->__object_to_array(json_decode(curl_exec($curlObj)));

			$shortUrl = $response['id'];
			
			curl_close($curlObj);
			
			return $shortUrl;
			
		}
		
	public function ensureFoldersExist(){
		
		if( !$this->connected ) $this->__connect();
		
		$this->__createRequiredFolders();
		
		echo "completed.";
		
		exit;
		
		if( $this->userResultArray['pictoFolderId'] == '' ){ // blank found in field pictoFolderId
		
		  	$this->__createRequiredFolders();
		
		}else{
		
			if( !$this->__fileIdExist( $this->userResultArray['pictoTopFolderId'] ) ){
				
				$this->__createRequiredFolders();
				
			} else {
				
				if( $this->__fileIdTrashed( $this->userResultArray['pictoTopFolderId'] )){
		
					$this->__unTrashfileId( $this->userResultArray['pictoTopFolderId']  );
					
				};
		
			}
			
			if( $this->userResultArray['pictoTempFolderId']  == '' ){ // blank found in field pictoTempFolderId
	
		    	$this->__createTempFolder();
	
			};						
			
		
		};

	
	}
	
		
	public function recordClick(){ // http://pictographr.com/app/recordClick
		
		$this->__paramIntoProperties($this->input->post('arrData'));
		
		$this->set_array = array(
			'domain_id' => $this->domain_id,
			'cta' => $this->cta,
			'cta_num' => $this->cta_num,
			'refer' => $this->refer,
			'ip_address' => $_SERVER['REMOTE_ADDR']
		);

		$referArr =  explode('/', $this->refer);

		if( 
				isset( $this->lead_id ) && isset($this->way) && 
		 		isset($referArr[2]) &&  $referArr[2] == 't.co'
		||
		 		isset( $this->lead_id ) && isset($this->way) &&
				$this->refer == ''
		) {
			
			echo "emailing"."<br />";
		
			$this->__setLeadsModel();
			
			$whereArray = array(
					'id' => $this->lead_id
			);
						
			$this->leadArray = $this->leads_model->getLeadWhere( $whereArray );

			$curlObj = curl_init();
			
			$url = 'http://jamesming.whsites.net/myresume/index.php/home/marketed?ip=' 
			. urlencode ( $_SERVER['REMOTE_ADDR']) 
			. '&candidate=' . urlencode ( $this->leadArray['candidate'])
			. '&company=' . urlencode ( $this->leadArray['company'])
			. '&contact=' . urlencode ( $this->leadArray['contact']) 
			. '&description=' . urlencode ( $this->leadArray['description']) 
			. '&created=' . urlencode ( $this->leadArray['created'])  
			. '&way=' . $this->way 
			. '&tweeted=' . urlencode ( $this->leadArray['tweeted']);
			
			echo $url."<br />";
			
			curl_setopt($curlObj, CURLOPT_URL, $url);
			curl_setopt($curlObj, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curlObj, CURLOPT_SSL_VERIFYPEER, 0);
			curl_setopt($curlObj, CURLOPT_HEADER, 0);
			curl_setopt($curlObj, CURLOPT_HTTPHEADER, array('Content-type:application/json'));
			curl_setopt($curlObj, CURLOPT_POST, 1);
			
			$response =  $this->__object_to_array(json_decode(curl_exec($curlObj)));

			echo $response."<br />";
			
			curl_close($curlObj);
			
			$this->set_array['lead_id'] = $this->lead_id;
			$this->set_array['way'] = $this->way;
			
		}
		
		$this->__setClicksModel();			
		echo  $this->leads_model->insertClick($this->set_array );			

	}	
	
	public function market_leads(){ //  
		
		$this->__setLeadsModel();
		
		$this->set_array = array();

		foreach ($this->input->post('arrData') as $k => $v) {
			$this->set_array[$k] = $v;
		}	
		
		$this->lead_id = $this->leads_model->insertLead($this->set_array );

		$this->_developerKey 	= 'AIzaSyDED4ZlBGLGC2sS6VIGryEV5FuUwcQNs5Q';
		
		$this->longUrl = 'http://www.socialcampaigner.com/app/base?dmz=' . $this->set_array['domain_id'] . '&lead_id=' . $this->lead_id . '&w=t';
		$this->set_array['shortUrl'] = $this->__getShortenedURL();

		$this->longUrl = 'http://www.socialcampaigner.com/app/base?dmz=' . $this->set_array['domain_id'] . '&lead_id=' . $this->lead_id . '&w=e';
		$emailed_shortUrl = $this->__getShortenedURL();

		$this->set_array['tweeted'] = "@" . $this->set_array["twitter_username"] . 
		" New LA start-up backs " 
		. $this->set_array["candidate"] . 
		" win by designing " 
		. $this->set_array["shortUrl"] . 
		". Your social needs compelling content. We R for hire.";		
		
		$this->leads_model->updateLead( 
			$this->lead_id, 
			$this->set_array
		);	
		
		$obj = array();
		
		$obj['tweeted'] = $this->set_array['tweeted'];
		$obj['shortUrl'] = $this->set_array['shortUrl'];
		
$emailed = "Dear Sir,\n
We are seeking the right contact in your organization to present our unique approach of boosting Hillary's message in social media.   Leveraging the latest hot issues, we can design compelling content that can sway young voters in this election.   I trust this link, " . $emailed_shortUrl . " will fully demonstrate what we offer.\n
Your reference is greatly appreciated.
\n
Sincerely,\n
James Ming, \nFounder\nSocial Campaigner
\n
Phone: 213-267-2879\n
Email: jamesming@socialcampaigner.com";

		
		$obj['emailed'] = $emailed;
		
		$obj['emailed_shortUrl'] = $emailed_shortUrl;
		
		echo json_encode($obj);
	}
	
	public function marketing(){ //  

		$this->load->view('marketing_view', array());
		
	}
	
	public function grableads(){ // http://pictographr.com/app/grableads
		
		$this->__setLeadsModel();
		
		$this->__paramIntoProperties($this->input->post('arrData'));
		
			$whereArray = array(
					'email'  => $this->email
			);
						
			$resultArray = $this->leads_model->getLeadWhere( $whereArray );
			
			if( $resultArray == 0){
		
				$this->set_array = array(
					'company' => $this->company,
					'contact' => $this->contact,
					'email' => $this->email,
					'phone' => $this->phone
				);
						
				echo  $this->leads_model->insertLead($this->set_array );	

			
			$curlObj = curl_init();
			
			$url = 'http://jamesming.whsites.net/myresume/index.php/home/emaillead?contact=' . urlencode ( $this->contact ) . '&company=' . urlencode ( $this->company ) . '&email=' . urlencode ( $this->email ) . '&phone=' . urlencode ( $this->phone );
			
			echo $url."<br />";
			
			curl_setopt($curlObj, CURLOPT_URL, $url);
			curl_setopt($curlObj, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curlObj, CURLOPT_SSL_VERIFYPEER, 0);
			curl_setopt($curlObj, CURLOPT_HEADER, 0);
			curl_setopt($curlObj, CURLOPT_HTTPHEADER, array('Content-type:application/json'));
			curl_setopt($curlObj, CURLOPT_POST, 1);
			
			$response =  $this->__object_to_array(json_decode(curl_exec($curlObj)));

			echo $response."<br />";

			curl_close($curlObj);


			} else {
				
				echo 'duplucate found';
				
			}	

		
	}	
			
	public function curlGoogleFont(){

		$font = $this->input->post('arrData')['font'];

    $ch = curl_init(); 

    curl_setopt($ch, CURLOPT_URL, "https://fonts.googleapis.com/css?family=" . urlencode ($font)); 

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

    $output = curl_exec($ch); 

    curl_close($ch); 

		echo json_encode(array(
				'data' => $output
		));

	}
				
		protected function __marketExist(){
			
			$whereArray = array(
					'name' => $this->market_name
				);
				
						
			$this->marketArray = $this->markets_model->getMarketWhere( $whereArray );
			
			if( $this->marketArray != 0){
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
				
		protected function __marketExistJoinSubscription(){
			
			$this->__setSubscriptionModel();
			
			$this->subscriptionArray = $this->subscriptions_model->getSubscriptionFromLeftJoinedMarketsByName( $this->market_name );
			
			if( $this->subscriptionArray != 0){
				
				return 	TRUE;
				
			} else {
				
				return 	FALSE;
				
			}	
			
		}
		
	public function deleteFile(){
		
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		
		$response['fileId'] = $this->fileId;
		$response['google_id'] = $this->google_id;
		
		$exist = $this->__fileIdExist($this->fileId);
		if( $exist ){
			$this->__trash($this->fileId );
			$response['success'] = TRUE;
			$response['status'] = 'success';
		}else{
			$response['status'] = 'file does not exist in Google or is in the trash';

		}
		$response['exist'] = $exist;
		echo json_encode($response); 		
		
	}	

	public function nag(){
		
		$this->__setUsersModel();
		$usersArray = $this->users_model->getAllUsers();
		
		
		foreach( $usersArray  as   $userArray){
			 
			$userArray['daysLeft'] = $this->__getTimeLeftInTrialPeriod($userArray)['days'];
			
//			echo date('M j Y g:i A', strtotime($userArray['trial_start']))."<br />";
//			echo $userArray['referral_credits']."<br />";
//			echo $userArray['promotion_credits']."<br />";
//			echo $userArray['name']."<br />";
//			echo $userArray['given_name']."<br />";
//			echo $userArray['family_name']."<br />";
//			echo $userArray['email']."<br />";
//			echo $userArray['daysLeft']."<br />";
//			echo "*******************"."<br />";
			
			if( $userArray['daysLeft'] < 1){
				$nagArray[] = $userArray;
			};
			
		}
		
		echo '<pre>';print_r( $nagArray);echo '</pre>';  exit;
		
	}
		
		
	/* ------------------------------------------------------------------------------ */
	public  function uploadimage(){
		$uploaddir = 'uploads';
		$uploadfile = $uploaddir . basename($_FILES['file']['name']);
		move_uploaded_file($_FILES['file']['tmp_name'], $uploaddir . "/" . $uploadfile);
	}		
	
	public function testing(){ 
		$this->server_response['test'] =  'hello';
		echo json_encode($this->server_response);
	}
		
	public  function tryit(){ //localhost/pictographr/app/tryit
		
		
		$this->google_id = '105870981217629422585';
		if( !$this->connected ) $this->__connect();
		
		if( $this->__doesThisExist( 'pictoFolderId', '' ) ){
			echo 'this is blank';
		}else{
			echo 'it does exist';
		};
			
	}

	public function testX(){ // http://pictographr.com/app/test1
		echo "hello world";
	}
	
	public function test5() { // http://pictographr.com/app/test5
	
		$this->load->library('email');
	
		$this->email->from('jamesming@gmail.com', '');
		$this->email->to('jamesming@gmail.com');
		$this->email->subject('Message from Interactive Resume Jamesming.com');
		$this->email->message('test');
		
		$this->email->send();

	}
		
	public function test1(){ // http://pictographr.com/app/test1
		$this->__setGoogleDevConfiguration();
		echo $this->__getShortenedURL('http://www.clinton-underwood2016.com/123openhouse');
	}	
	
	public function test() {
	
		$this->google_id = '105870981217629422585';
		if( !$this->connected ) $this->__connect();

		echo '<pre>';print_r( $this->__getTokenFromDB() );echo '</pre>';  exit;


	}
	
	public function test3() {
	
		echo 'HELLO WORLD';  exit;


	}
	
	public function test2() { // http://pictographr.com/app/test2
		
		$this->google_id = '105870981217629422585';
		$this->fileId = '0B5ptY5tUIebjd3hnR3Z3RHFwYVE';
		$this->__setUsersModel();
		$this->__getUserIdAndSessionIdWithSessionId();
		
		if( !$this->connected ) $this->__connect();

		echo $this->__isFileInFolder();

	}
	
	public function get_temp_files(){
		
		$this->__setTempFileNames();
		
		$data = file_get_contents( $this->temp_data_path );
		
		echo json_encode($data);			
		
	}
	
	public function promo_test(){
	?>
	<style>
		input[type="text"]:focus {
			outline: none;
		}
		#promo-code-div{
			width: 600px; 
			margin: 30 auto;
		}
		#promo-code-div input{
			width: 200px;
			margin-right: 10px;
		}
		#promo-code-div button{
			width: 75px;
			padding: 4px 7px;
			background-color: #4285f4;
			transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
			outline: none !important;
			border: 0;
			margin: 10px 1px;
			cursor: pointer;
			border-radius: 2px;
		}
		#promo-code-div input, #promo-code-div button{
			float:left;
			position:relative;
		}
	</style>
	<link type="text/css" href="../js/lib/bootstrap/bootstrap3.0.2.css" rel="stylesheet" media="screen" />
	<link rel="stylesheet" type="text/css" href="../js/lib/material/material-wfont.css"/>
	<link rel="stylesheet" type="text/css" href="../js/lib/material/material.css"/>
	<script	src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
	<script type="text/javascript" src="../js/lib/bootstrap/bootstrap3.3.4.min.js "></script>
	
	<div  id="promo-code-div"  >
		<input  id="promo-code" type="text" class="form-control" placeholder="label">
		<button id="promo-code-button"  class="btn btn-primary">Try</button>		
	</div>


	<script>
	$(document).ready(function() { 
		$(document).on('click', '#promo-code-button', function() {
			console.log($('#promo-code').val());
		})
	});
	</script>
	<?php 	
		
		
	}
	
	public function rotatedrag(){?>

	<!DOCTYPE	html>
	<html>
	<head>
		<style>
			#rect{
				width: 200px;
				height: 200px;
				background: red;
				position: absolute;
				top: 200px;
				left: 200px;
				transform: rotate(-43.2667deg);
				cursor: pointer;
			}	
		</style>
	</head>	
	<body>
		<div   style='position: relative'  >
			<div  id="rect" >
			</div>			
		</div>
	</body>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.2.1/jquery.min.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
		<script>
			$('#rect').draggable({
        start: function (event, ui) {
            var left = parseInt($(this).css('left'),10);
            left = isNaN(left) ? 0 : left;
            var top = parseInt($(this).css('top'),10);
            top = isNaN(top) ? 0 : top;
            recoupLeft = left - ui.position.left;
            recoupTop = top - ui.position.top;
        },
        drag: function (event, ui) {
            ui.position.left += recoupLeft;
            ui.position.top += recoupTop;
        }
    	});
		</script>
	</html>
	<?php 	
	}
	
}
