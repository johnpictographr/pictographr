<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Sites extends Admin {

	public function __construct() {
		parent::__construct();
				
		$this->google_id = '104384554224634036843'; // Pictographr Account	
			
		$this->__paramIntoProperties($this->input->get());
		
		$this->siteroot = 'sites/';
		$this->subdomainSegment = '/';
		if( $_SERVER['HTTP_HOST'] != 'localhost' ) $this->siteroot = '/var/www/pictographr/sites/';
		if( isset($this->subdomain) ) {
			$this->subdomainSegment = '/subdomains/' . $this->subdomain . '/';
		}	

		$this->folder_mimetype = 'application/vnd.google-apps.folder';
		$this->file_mimetype = 'application/vnd.google.drive.ext-type.pgr';		
		
		if( isset($this->site) ) $this->pngPdfAssetsJson =  $this->siteroot . $this->site . $this->subdomainSegment . 'templates/' . 'json' . '/' . 'assets.json';		

	}			
	
	public function testtest(){	
			$this->__setSubdomainsModel();
			$whereArray = array(
				'id' => 62
			);
			
			$this->subdomainArray = $this->subdomains_model->getsubdomainWhere( $whereArray);
			
			
			echo '<pre>';print_r(  $this->subdomainArray  );echo '</pre>';  exit;
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
								 $disrict .
								 ' just registered. ' .
								 $this->user_email . ' ' .
								 $this->given_name . ' ' .
								 $this->family_name . ' ' .
								 $website . ' ' .
								 $tel . ' ' .
								 ' Views: ' . $viewsNow;
								 
			echo $message;
	}		
		
	public function addview(){	//https://pictographr.com/sites/addview?subdomain_id=2	
		header('Access-Control-Allow-Origin: *');
				
		$whereArray = array(
			'id' => $this->subdomain_id
		);
		$this->subdomainArray = $this->subdomains_model->getsubdomainWhere( $whereArray);
		$viewsNow = $this->subdomainArray['views'] + 1;
		$setWhat['views'] = $viewsNow;
		$this->subdomains_model->updatesubdomain($this->subdomain_id, $setWhat);
	}		
		
	public function getMenuJson(){ //https://pictographr.com/sites/getMenuJson?site=teachingstash
	
		$this->JSON = file_get_contents('sites'. '/' . $this->site . $this->subdomainSegment . 'templates/' . 'json' . '/' . 'menu.json'); 
		header('Access-Control-Allow-Origin: *');
		echo $this->JSON ;
	
	}

	public function generateMenu(){  // https://pictographr.com/sites/generateMenu?site=teachingstash&parentFolderId=0B1nKK3UKG5hjbk5Ba2dLNE9zUW8
		
		$this->physicalAssets = [];
		$this->dir   = $this->siteroot . $this->site . $this->subdomainSegment . 'templates/thumbs/';
		$files = scandir($this->dir);
		
		foreach( $files as $idx => $file){
			
			if( $file == "." || 
					$file == ".."  || 
					$file == ".htaccess"  || 
					$file == "index.php" 
					) continue;
				
			$this->physicalAssets[] = $file;

		}
		
		unset($file);
		
		$this->assetsDir = 'templates';
		
		$this->__setAndConnectToGoogle();
		$useThisFolderId = $_GET['parentFolderId'];

    $parameters['q'] = "'"  .  $useThisFolderId . "' in parents and trashed = false and mimeType = '" . $this->folder_mimetype . "'";
    
		$count = 0;
		$data = [];
		
		$folders_drive = $this->service->files->listFiles($parameters);
	
		$folders = [];
		
    foreach( $folders_drive['items']  as  $folder_label => $folder_item){

			$folder['id'] = $folder_item['id'];
			$folder['title'] = $folder_item['title'];
			
			$parameters['q'] = "'"  .  $folder['id'] . "' in parents and trashed = false and mimeType = '" . $this->folder_mimetype . "'";
			$sub_folders_drive = $this->service->files->listFiles($parameters);
			
			$files = [];
			$sub_folders = [];
			$this->realAssetsList = [];
			
			if( count( $sub_folders_drive['items'] ) > 0 ){
				
				foreach( $sub_folders_drive['items']  as  $sub_folder_label => $sub_folder_item){
					
					$sub_folder['id'] = $sub_folder_item['id'];
					$sub_folder['title'] = $sub_folder_item['title'];		
					
					$parameters['q'] = "'"  .  $sub_folder['id'] . "' in parents and trashed = false and mimeType = '" . $this->file_mimetype . "'";
					$files_drive = $this->service->files->listFiles($parameters);
					
					foreach( $files_drive['items']  as  $file_label => $file_item){
					
						$file['id'] = $file_item['id'];
						$file['title'] = $file_item['title'];
						$this->realAssetsList[] = $file_item['id'];
					
						if( isset($file_item['thumbnailLink']) ){
							$file['thumb'] = $file_item['thumbnailLink'];
							if ( isset($this->physicalAssets) && !in_array($file['id'] . '.png', $this->physicalAssets)) {
								$this->__copyThumbFromDrive($file['id'], $file['thumb']);
							}
							
							$this->jsonDeclaredAssets[] = $file['id'] . '.png';
							$files[] = $file;						
						} else {

							$this->fileId = $file['id'];
							$existsInFolderId = $sub_folder['id'];
							$this->__saveWithThumb( $existsInFolderId );
							$files[] = $file;			
							
						}
						
						
					
					}
					
					$sub_folder['files'] = $files;
					$sub_folders[] = $sub_folder;
					$files = [];
				};
				
				unset( $folder['files'] );
				usort($sub_folders, function($a, $b) {
					return strcmp($a['title'], $b['title']);
				});
				
			 	$folder['sub_folders'] = $sub_folders;
			 	
			}else{
				
				$parameters['q'] = "'"  .  $folder['id'] . "' in parents and trashed = false and mimeType = '" . $this->file_mimetype . "'";
				$files_drive = $this->service->files->listFiles($parameters);
				
				foreach( $files_drive['items']  as  $file_label => $file_item){
				
					$file['id'] = $file_item['id'];
					$file['title'] = $file_item['title'];
					$this->realAssetsList[] = $file_item['id'];
					
					if( isset($file_item['thumbnailLink']) ){
						$file['thumb'] = $file_item['thumbnailLink'];
						
						if ( isset($this->physicalAssets) && !in_array($file['id'] . '.png', $this->physicalAssets)) {
							$this->__copyThumbFromDrive($file['id'], $file['thumb']);
						};
						
						$this->jsonDeclaredAssets[] = $file['id'] . '.png';
						$files[] = $file;	
											
					} else {

						$this->fileId = $file['id'];
						$existsInFolderId = $folder['id'];
						$this->__saveWithThumb( $existsInFolderId );
						$files[] = $file;	
							
					}
				
				}	
				
				$folder['files'] = $files;
				unset( $folder['sub_folders'] );
							
			};
			 
			$folders[] = $folder;
			usort($folders, function($a, $b) {
				return strcmp($a['title'], $b['title']);
			});
	    $menu['folders'] = $folders;
	    $menu['parentFolderId'] = $this->parentFolderId;
    }
   
   $this->menuJson =  json_encode( $menu );
   
	 file_put_contents( 'sites'. '/' . $this->site . $this->subdomainSegment .  $this->assetsDir . '/' . 'json' . '/menu.json', $this->menuJson);	
	 $this->__pruneMenu();
	 $this->__pruneAssetList();
	 $this->getMenuJson();
		
	}
	
		private function __pruneAssetList(){
			$pathToJsonFile = 'sites'. '/' . $this->site . $this->subdomainSegment . 'templates/json/' . 'assets.json';
			$this->JSON = file_get_contents($pathToJsonFile);
			$assetsObj = $this->__object_to_array(json_decode($this->JSON));
			foreach( $assetsObj  as  $key => $value){
				$assetList[] = $key;
			}
			
			if( isset($assetList) ) {
				$fileIdTobeDeleteFromList = array_diff($assetList, $this->realAssetsList);
				foreach( $fileIdTobeDeleteFromList  as  $idx => $fileId){
					unset($assetsObj[$fileId]);
				}				
			}
			
			file_put_contents( $pathToJsonFile,  json_encode( $assetsObj));
		}			

		private function __saveWithThumb( $existsInFolderId ){
		
			$this->__getBinaryFromDrive();
			$this->data = $this->binary;
			
	    $this->__setTempFileNames();
	    $this->READ_JSON = $this->data;
	    $this->stripForReadJson();
	
			$tempData = $this->__object_to_array(json_decode($this->READ_JSON));
	
			$this->width =  isset ( $tempData['width'] ) ? $tempData['width']: 0;
			$this->height =  isset ($tempData['height'] ) ? $tempData['height']: 0;
			
	    file_put_contents($this->temp_read_path, $this->READ_JSON);
	    
			$this->service->files->trash($this->fileId);
			$this->__waitForAvailableSwitch();
			$this->__requestSwitch();
			$this->__connectPhantom();
			$this->__sshPhantomRender('renderThumbWithAlert.js', '.png');	
				
			ssh2_scp_recv($this->connection, $this->remote_tempPath, $this->local_tempPath);
			$this->__includeThumb();
			$this->server_responseobj['status'] = 'success';
			$this->parent = new Google_ParentReference();
			$this->parent->setId( $existsInFolderId );
			
			if( !$this->__saveOntoGoogleDrive()){
				
				$this->server_responseobj['status'] = 'problem';
	
			};
	
			$this->__copyThumbFromDrive($this->fileId, $this->local_tempPath);
			
	    $this->__removeTempFileNames();
			$this->__sshPhantomClearTempFile();
			$this->__releaseSwitch();			
			
		}
	
		private function __pruneMenu(){  // https://pictographr.com/sites/pruneMenu?site=teachingstash&parentFolderId=0B1nKK3UKG5hjbk5Ba2dLNE9zUW8	

			if( isset($this->physicalAssets) ) $assetsToBeDeleted = array_diff($this->physicalAssets, $this->jsonDeclaredAssets);
			else $assetsToBeDeleted = [];
			//echo 'Diff: <pre>';print_r(  $assetsToBeDeleted  );echo '</pre>';		


			foreach( $assetsToBeDeleted as  $idx => $obj){
				unlink($this->dir . $obj);	
				//echo "Removed: " . $dir . $obj."<br />";
			}
		}			
		
		private function __copyThumbFromDrive($fileId, $url) {
		
				$this->__setGraphicsToolsForm();
			
				// $url = 'https://lh6.googleusercontent.com/YWQ2hJKS_n-_0Pj4G8-t0RU7GuuCLOrOlSyAwfkMMdXw3RbJYaXQZytl4pLtBrGg7gRxFA=s220';
			
				$this->rawImg = file_get_contents($url);
				
				file_put_contents( 'sites'. '/' . $this->site . $this->subdomainSegment . 'templates/' . 'thumbs' . '/' . $fileId . '.png', $this->rawImg);
				
				$this->thumbsJsonArray[] = 'thumbs' . '/' . $fileId . '.png';
		}	
		
	public function getCarouselJson(){  //https://pictographr.com/sites/getCarouselJson?site=teachingstash
	
		$this->JSON = file_get_contents('sites'. '/' . $this->site . $this->subdomainSegment . 'carousel' . '/json/' . 'data.json'); 
		header('Access-Control-Allow-Origin: *');
		echo $this->JSON ;
	
	}
		
	public function getLogoJson(){  //https://pictographr.com/sites/getLogoJson?site=teachingstash&fileId=0B1nKK3UKG5hjRHctX0k5bk1ES0k
		$logoPathJson = 'sites'. '/' . $this->site . $this->subdomainSegment . 'img' . '/logo/' . 'logo.json';
		$this->JSON = file_get_contents($logoPathJson); 
		header('Access-Control-Allow-Origin: *');
		echo $this->JSON ;
	
	}
	
	public function renderLogo(){ //https://pictographr.com/sites/renderLogo?site=teachingstash&fileId=0B1nKK3UKG5hjNUFSUWRFT1ZjbjQ
		
		$this->logoPathJson = 'sites'. '/' . $this->site . $this->subdomainSegment . 'img' . '/logo/' . 'logo.json';
		$this->wherePath = $this->siteroot .  $this->site . $this->subdomainSegment  . 'img/logo/';		
		$this->__renderLogo();

		header('Access-Control-Allow-Origin: *');
		echo $this->JSON ;	
			
	}	
	
		private function __renderLogo(){		
			exec('rm -f '  . $this->wherePath . '*.png 2>&1',$output,$retval);
	//		var_dump($output,$retval);

			$this->createPng($this->fileId, $this->wherePath . $this->fileId . '.png');
			$this->logo['fileId'] = $this->fileId;
			   
	   	$this->JSON =  json_encode( $this->logo );
			
			
			file_put_contents($this->logoPathJson, $this->JSON); 			
		}
		
	public function generateCarousel(){ //https://pictographr.com/sites/generateCarousel?site=teachingstash&parentFolderId=0B1nKK3UKG5hjYXRZbXhsbDliVWM
		
		$this->__setAndConnectToGoogle();
		
		$this->physicalAssets = [];
			
		$this->assetsDir = 'carousel';
		$this->format = 'png';
		$this->jsonFileName = 'data';

		$this->dir   = $this->siteroot . $this->site . $this->subdomainSegment .  $this->assetsDir .  '/' . $this->format . 's/';
		$files = scandir($this->dir);

		foreach( $files as $idx => $file){
			
			if( $file == "." || 
					$file == ".."  || 
					$file == ".htaccess"  || 
					$file == "index.php" 
					) continue;
				
			$this->physicalAssets[] = $file;

		}
		
		unset($file);
		
		$useThisFolderId = $_GET['parentFolderId'];			
		$parameters['q'] = "'"  .  $useThisFolderId . "' in parents and trashed = false and mimeType = '" . $this->file_mimetype . "'";
		$files_drive = $this->service->files->listFiles($parameters);
		
		$files = [];
		
		foreach( $files_drive['items']  as  $file_label => $file_item){
		
			$file['id'] = $file_item['id'];
			$file['title'] = $file_item['title'];
			
			if ( isset($this->physicalAssets) && !in_array($file['id'] . '.png', $this->physicalAssets)) {
				$wherePath = $this->siteroot .  $this->site . $this->subdomainSegment  . 'carousel' . '/pngs/' . $file['id'] . '.png';
				$this->createPng( $file['id'], $wherePath );
			};
			$files[] = $file;
			usort($files, function($a, $b) {
				return strcmp($a['title'], $b['title']);
			});
			
		}
		
		$data['files'] = $files;
		$data['parentFolderId'] = $this->parentFolderId;
		
		$this->carouselJson =  json_encode( $data );
		
		file_put_contents( 'sites'. '/' . $this->site . $this->subdomainSegment  . 'carousel' . '/json/' . 'data.json', $this->carouselJson);	
		
		$this->__pruneCarousel();
		$this->getCarouselJson();

	}

	
	public function createPng($fileId, $wherePath) {

		$this->fileId = $fileId;
		$this->__getBinaryFromDrive();
		$this->data = $this->binary;
		
    $this->__setTempFileNames();
    $this->READ_JSON = $this->data;
    $this->stripForReadJson();
    file_put_contents($this->temp_read_path, $this->READ_JSON);
    
		$this->__waitForAvailableSwitch();
		$this->__requestSwitch();
		$this->__connectPhantom();

		$this->width = 0;
		$this->height = 0;
		$this->__getCustomWidthHeight();
	
		$this->__sshPhantomRender('renderWithAlert.js', '.png' );
		ssh2_scp_recv($this->connection, $this->remote_tempPath, $wherePath );
		$this->__removeTempFileNames();
		$this->__sshPhantomClearTempFile();
		$this->__releaseSwitch();

	}
		
		private function __pruneCarousel() {  //https://pictographr.com/sites/pruneCarousel?site=teachingstash

			//echo 'Physical: <pre>';print_r( $this->physicalAssets );echo '</pre>';  
		
			$pathToJson = $this->siteroot . $this->site . $this->subdomainSegment  . 'carousel' . '/json/' . 'data.json';
							
			$jsonAssetsArray = $this->__object_to_array(json_decode((file_get_contents( $pathToJson ))));
			$jsonDeclaredAssets = [];

			foreach( $jsonAssetsArray['files'] as  $idx => $obj){
				$jsonDeclaredAssets[] = $obj['id'] . '.png';		
			}
			
			//echo 'jsonDeclaredAssets: <pre>';print_r(  $jsonDeclaredAssets );echo '</pre>'; 
		
			if( isset($this->physicalAssets) ) $assetsToBeDeleted = array_diff($this->physicalAssets, $jsonDeclaredAssets);
			else $assetsToBeDeleted = [];
			//echo 'Diff: <pre>';print_r(  $assetsToBeDeleted  );echo '</pre>';		


			foreach( $assetsToBeDeleted as  $idx => $obj){
				unlink($this->dir . $obj);	
				//echo "Removed: " . $dir . $obj."<br />";
			}
		}
				
	public function getAssetsJson(){   //https://pictographr.com/sites/getAssetsJson?site=teachingstash&subsite=swsd

	 	$this->resetAssetsJson();
		$this->JSON = file_get_contents('sites'. '/' . $this->site . $this->subdomainSegment . 'templates/json/' . 'assets.json'); 
		header('Access-Control-Allow-Origin: *');
		echo $this->JSON ;
	
	}	

	public function createAssets() { // https://pictographr.com/sites/createAssets?site=teachingstash&format=pdf&fileId=0B1nKK3UKG5hjTFNWckE0R3JYUm8

		ignore_user_abort(TRUE);
		// $this->format png or pdf
		
		$this->__connect();		
		$this->__getBinaryFromDrive();
		$this->data = $this->binary;
		
    $this->__setTempFileNames();
    $this->READ_JSON = $this->data;
    $this->stripForReadJson();
    file_put_contents($this->temp_read_path, $this->READ_JSON);
    
		$this->__waitForAvailableSwitch();
		$this->__requestSwitch();
		$this->__connectPhantom();

		$tempData = $this->__object_to_array(json_decode($this->READ_JSON));

		$this->width = 0;
		$this->height = 0;
		$this->__getCustomWidthHeight();

		if($this->format == 'png'){
			$this->__sshPhantomRender('renderWithAlert.js', '.' . $this->format );
		} else{
			$this->__sshPhantomRender('renderPDFWithAlert.js', '.' . $this->format );
		}
		
		$localpath = $this->siteroot .  $this->site . $this->subdomainSegment . 'templates/' . $this->format . 's/' . $this->fileId .  '.' . $this->format;

		ssh2_scp_recv($this->connection, $this->remote_tempPath, $localpath);

		//$this->__removeTempFileNames();
		$this->__sshPhantomClearTempFile();
		$this->__releaseSwitch();
		
		$this->__ammendAssetsJson($this->format);
		
		if(file_exists($localpath)){
			header('Access-Control-Allow-Origin: *'); 
			echo $this->JSON;			
		}
	
	}

		protected function __ammendAssetsJson( $format ){
			
			$this->JSON  = file_get_contents($this->pngPdfAssetsJson);	 
			
			$dataObj = json_decode($this->JSON );
			
			$dataArr = $this->__object_to_array($dataObj);
			
			if( !isset($dataArr[$this->fileId]) ) $dataArr[$this->fileId] = [];
			$dataArr[$this->fileId][$format] = 'true';	
			
			$this->JSON = json_encode($dataArr);
			
			file_put_contents($this->pngPdfAssetsJson, $this->JSON);	
		}
	
	public function resetAssetsJson() { // staging.pictographr.com/sites/resetAssetsJson?site=teachingstash
			$this->jsonFileName = 'assets';
			$this->assetsDir = 'templates';
			$this->format  = 'png';
			$this->__pruneAssets();		
			$this->format  = 'pdf';
			$this->__pruneAssets();	
	}
	
		private function __pruneAssets() { // staging.pictographr.com/sites/pruneAssets?site=teachingstash&parentFolderId=0B1nKK3UKG5hjYXRZbXhsbDliVWM

			$dir   = $this->siteroot . $this->site . $this->subdomainSegment .  $this->assetsDir .  '/' . $this->format . 's/';
			$files = scandir($dir);
	
			foreach( $files as $idx => $file){
				
				if( $file == "." || 
						$file == ".."  || 
						$file == ".htaccess"  || 
						$file == "index.php" 
						) continue;
					
				$physicalAssets[] = $file;
				
			}
			
			//echo 'Physical: <pre>';print_r( $physicalAssets );echo '</pre>';  
			
			$pathToJson = 'sites'. '/' . $this->site . $this->subdomainSegment  . $this->assetsDir . '/' . 'json' . '/' . $this->jsonFileName .'.json';
			
			//echo $pathToJson."<br />";
			
			$jsonAssetsArray = $this->__object_to_array(json_decode((file_get_contents( $pathToJson ))));
			//echo '$jsonAssetsArray: <pre>';print_r( $jsonAssetsArray );echo '</pre>';  
			$jsonDeclaredAssets = [];
			$count = 0;
			foreach( $jsonAssetsArray as  $idx => $obj){
				$count++;
				if( isset($obj[$this->format]) && $obj[$this->format] == true) {
					$asset = $idx . "." . $this->format;
//					echo $count . ") " .$asset."<br />";
					if (isset($physicalAssets) && in_array($asset, $physicalAssets)) {
						$jsonDeclaredAssets[] = $asset;
					} else {
						$removeListOfDeclaredAssets[] = $idx;
					};				
				}
			}
			
			//echo 'jsonDeclaredAssets: <pre>';print_r(  $jsonDeclaredAssets );echo '</pre>'; 
			if( isset($physicalAssets)){
				$assetsToBeDeleted = array_diff($physicalAssets, $jsonDeclaredAssets);
				
				//echo 'Diff: <pre>';print_r(  $assetsToBeDeleted  );echo '</pre>';		
				foreach( $assetsToBeDeleted as  $idx => $obj){
					unlink($dir . $obj);	
					//echo "Removed: " . $dir . $obj."<br />";
				}
			};
			
			if( isset($removeListOfDeclaredAssets)){
				
				//echo '<pre>';print_r(  $removeListOfDeclaredAssets   );echo '</pre>'; 
				
				foreach( $removeListOfDeclaredAssets  as  $idx => $fileId){
					unset($jsonAssetsArray[$fileId][$this->format]);
				}				
				
			}

			//echo '$jsonAssetsArray: <pre>';print_r( $jsonAssetsArray );echo '</pre>'; 
			
			$pathToJsonFile = 'sites'. '/' . $this->site . $this->subdomainSegment  . 'templates/json/' . 'assets.json';
			
			//echo "path: " . $pathToJsonFile."<br />";

			file_put_contents( $pathToJsonFile,  json_encode( $jsonAssetsArray ));	
			
		}
		
	public function reset(){ //https://pictographr.com/sites/reset		

		$this->__setSubdomainsModel();	
		$whereArray = array(
				'skip' => 0,
				'done' => 0,
		);

		$this->subdomainArray = $this->subdomains_model->getSubdomainsWhere( $whereArray, $use_order = TRUE, $order_field = "district", $order_direction = "asc", $count = -1);
		
		
		if( $this->subdomainArray == 0 ){
			echo "No subdomains need to be created.";
			return;	
		}
		
		$this->sites = ['templatesforteachers', 'templatesforstudents', 'templatesforschools'];
		
		foreach( $this->sites  as  $site){
			$this->site = $site;
			$this->resetsubdomains();
		}
    
    /***********************/ 

    $ch = curl_init(); 
		$urlPath = "https://templatesforteachers.com/sites.php?do=reset&site=templatesforteachers";
		echo $urlPath."<br />";
    curl_setopt($ch, CURLOPT_URL, $urlPath); 

curl_setopt($ch, CURLOPT_VERBOSE, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

    $output = curl_exec($ch); 

    /***********************/ 

		$urlPath = "https://templatesforstudents.com/sites.php?do=reset&site=templatesforstudents";
		echo $urlPath."<br />";
    curl_setopt($ch, CURLOPT_URL, $urlPath); 

curl_setopt($ch, CURLOPT_VERBOSE, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

    $output = curl_exec($ch); 

    /***********************/ 
 
    $ch = curl_init(); 
		$urlPath = "http://templatesforschools.com/sites.php?do=reset&site=templatesforschools";
		echo $urlPath."<br />";
    curl_setopt($ch, CURLOPT_URL, $urlPath); 

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

    $output = curl_exec($ch); 

    curl_close($ch); 	    	    
		
		
		// MARK DONE

		foreach( $this->subdomainArray  as  $idx => $record){
			$setWhat['done'] = 1;
			$this->subdomains_model->updatesubdomain($record['id'], $setWhat);
		}
			
	}
				
	public function resetsubdomains(){ //https://pictographr.com/sites/resetsubdomains?site=templatesforstudents
	
		foreach( $this->subdomainArray  as  $idx => $record){
			
			$newCustomerSite = $this->siteroot . $this->site .'/subdomains/' . $record['name'];

			$command = 'rm -f -R ' . $newCustomerSite;
			echo "Executing: " . $command."<br />";
			exec($command .  ' 2>&1',$output,$retval);			
			
			$command = 'cp -f -R ' . $this->siteroot .  'teachingstash/subdomains/_ ' . $newCustomerSite;
			echo "Executing: " . $command."<br />";
			exec($command .  ' 2>&1',$output,$retval);
			//var_dump($output,$retval);
			$this->fileId =  $record[ $this->site. 'FileId'];
			echo 'Rendering ' .$record['name'] . ' ' . $this->fileId . "<br />";
			$this->wherePath = 'sites'. '/' . $this->site . '/subdomains/' . $record['name'] . '/' . 'img' . '/logo/';
			$this->logoPathJson = $this->wherePath . 'logo.json';			
			$this->__renderLogo();
			echo $this->logoPathJson."<br />";
			
			$website = "http://" . $record['name'] . "." . $this->site . ".com";
			
			echo "<a target='_blank' href='" . $website ."'>" . $website ."</a></br>";
			echo "----------------------------------------------"."<br />";

		}


	}

	public function seesubdomains(){ //https://pictographr.com/sites/seesubdomains
		
		$this->__setSubdomainsModel();	
		
		$whereArray = array();

		$this->subdomainArray = $this->subdomains_model->getSubdomainsWhere( $whereArray, $use_order = TRUE, $order_field = "district", $order_direction = "asc", $count = -1);

		?>
			<style>
					img{
						width:120px;	
					}
					td{
						border: 1px solid gray;	
					}
			</style>
			<table>

		<?php 		
		$count = 0;
		foreach( $this->subdomainArray  as  $idx => $record){
			$count++;
			echo "
			<tr>
				<td>".
					$count
				."</td>
				<td>".
					$record['district']
				."</td>
				<td>".
					$record['views']
				."</td>
				<td>".
					"<a target='_blank' href='http://" . $record['name'] . ".templatesforschools.com'><img src='http://pictographr.com/sites/templatesforschools/subdomains/" . $record['name'] . "/img/logo/" . $record['templatesforschoolsFileId'] . ".png'></a>"
				."</td>
				<td>".
					"<a target='_blank' href='http://" . $record['name'] . ".templatesforteachers.com'><img src='http://pictographr.com/sites/templatesforteachers/subdomains/" . $record['name'] . "/img/logo/" . $record['templatesforteachersFileId'] . ".png'></a>"
				."</td>
				<td>".
					"<a target='_blank' href='http://" . $record['name'] . ".templatesforstudents.com'><img src='http://pictographr.com/sites/templatesforstudents/subdomains/" . $record['name'] . "/img/logo/" . $record['templatesforstudentsFileId'] . ".png'></a>"
				."</td>
			</tr>
			";				
			
		}
		
		?>
				</tr>
			</table>
		<?php 		
		
		
//		echo '<pre>';print_r( $records );echo '</pre>';  exit;
	}
		
	public function listsubdomains(){ //https://pictographr.com/sites/listdomains

		$this->__setSubdomainsModel();	
		
		$whereArray = array(
				'skip' => 0,
				'done' => 0,
		);

		$this->subdomainArray = $this->subdomains_model->getSubdomainsWhere( $whereArray, $use_order = TRUE, $order_field = "district", $order_direction = "asc", $count = -1);
		
		
		foreach( $this->subdomainArray  as  $idx => $record){
			
			$records[] = $record;
			
		}
		
		header('Access-Control-Allow-Origin: *');
		echo json_encode($records);	
	}


}