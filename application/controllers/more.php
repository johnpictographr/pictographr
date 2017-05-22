<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class More extends App {
		
	public function __construct() {
		parent::__construct();
		$this->remote_web_root_path = "/var/www/phantomjs/";
		$this->__setSwitchModel();	
		$this->timeout = 80; // Time before phantomjs will stop.  Means phantomjs hanged.
	}

		private function __save_attempt(){
			
			$this->__waitForAvailableSwitch();
			$this->__requestSwitch();
			$this->__connectPhantom();
			$this->__sshPhantomRender('renderThumbWithAlert.js', '.png');			
			
		}

		private function __somethingwentwrong(){
			
				$filesize = $this->__fileSizeConvert( filesize($this->temp_read_path) );
				$this->server_responseobj['status'] = 'problem';
				$this->server_responseobj['message'] = 'Something went wrong. Please help us determine what it was by describing what you did in the Contact Pictographr interface located in the Account Settings Menu.  Meanwhile we recovered your file and placed it in your Temp folder within the main Pictographr Folder in Drive.';

				$this->__emailmyself('User ' . $this->google_id . ' phantomjs quit using switch ' .  $this->switch_name . '. The filesize was ' . $filesize . '.');

				$this->__sshPhantomClearTempFile();
				ssh2_exec($this->connection, 'pkill -f phant*');
				$this->__releaseSwitch();
				system( 'cp -f ' . $this->temp_read_path . ' ' . $this->upload_path . '/bad/' . 'data_' . $this->fileId . '_' . $this->google_id . '.js');

				
				$this->__setParentFolder( 'pictographr_temp' );
				unset( $this->thumbnail );
				$this->__saveOntoGoogleDrive();

	
				// $this->__removeTempFileNames();
				// system( 'cp -f ' . $this->temp_read_path . ' ' . $this->upload_path . '/bad/' . 'data_' . $this->fileId . '_' . $this->google_id . '.js');
				// file_put_contents($this->temp_read_path, $this->READ_JSON);		
		}
		
	public function fontwidth(){	
		$fontwidth = json_encode($this->input->post('arrData')['fontwidth']);
		file_put_contents('fontwidths.js', $fontwidth);	
	}			
	
	public function save(){
		
		ignore_user_abort(TRUE);
	  $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
	  
		if( !isset( $this->fileId ) ){
			
			$this->__notSupported('SAVE');
				
		}else{
			
			$this->__createTempReadFile();
			$filesize = $this->__fileSizeConvert( filesize($this->temp_read_path) );
			$this->server_responseobj['filesize'] = 'The size of this file: ' . $filesize;
			
		};
		
		$this->fileTitle = $this->__getPropertiesFromDataPgr('fileTitle' , $this->READ_JSON);
		$this->parentFolderId = $this->__getPropertiesFromDataPgr('parentFolderId' , $this->READ_JSON);
		
		if( $this->__isFolderOwnedByMe( $this->parentFolderId ) ){
			$this->server_responseobj['isFolderOwnedByMe'] = 'TRUE';
		}else{
			$this->server_responseobj['isFolderOwnedByMe'] = 'FALSE';
		};
	  
		if( !isset($this->copy) && 
				$this->fileId != 'false' && 
				$this->__fileIdExist( $this->fileId ) &&
				$this->__isFolderOwnedByMe( $this->parentFolderId )	
			) {
			
		  try {
		  	
		  	$this->server_responseobj['fileIsTrashed'] = 'TRUE';

		  	$this->service->files->trash($this->fileId);
				
		  } catch (Exception $e) {
				$this->server_responseobj['trash_response'] = $e;
		    
		  }
			
		}

		$this->__save_attempt();
		
		if( !$this->__doesRenderedFileExist() ){
			
			ssh2_exec($this->connection, 'rm -f -r ' . $this->remote_web_root_path . 'temp/*'); 
			ssh2_exec($this->connection, 'pkill -f phant*');
			$this->__releaseSwitch();
			$this->__emailmyself('Revised. User ' . $this->google_id . ' save session with phantomjs hanged.  Trying again.');
			$this->__save_attempt();
						
		}
		
		if( !$this->__doesRenderedFileExist() ){
			$this->__somethingwentwrong();
		} else{
			
			ssh2_scp_recv($this->connection, $this->remote_tempPath, $this->local_tempPath);
			$this->__includeThumb();
			$this->server_responseobj['status'] = 'success';

			if( $this->parentFolderId == false ){
				$this->server_responseobj['Saved in'] = 'my pictographr folder';
				$this->parentFolderId = $this->pictoFolderId;
				$this->__setParentFolder( 'pictographr_folder' );
			} else{
				$this->server_responseobj['Saved in'] = 'orginal folder';
				$this->parent = new Google_ParentReference();
				$this->parent->setId( $this->parentFolderId );
			}
			
			$this->server_responseobj['parentFolderId'] = $this->parentFolderId;
			
			if( !$this->__saveOntoGoogleDrive()){
				
				$this->server_responseobj['status'] = 'problem';
				$this->server_responseobj['message'] = 'Google Drive was unable to save your file.  Please contact support';
				$this->__emailmyself('User ' . $this->google_id . ' Google Drive was unable to save file. The filesize was ' . $filesize . '.');
				
			};
			
			if( file_exists($this->local_tempPath)){
				system( 'cp -f ' . $this->local_tempPath . ' ' . $this->upload_path . '/pngs/' . $this->filename);
				unlink($this->local_tempPath); 
			}
			
			system( 'cp -f ' . $this->temp_read_path . ' ' . $this->upload_path . '/saves/data_' . $this->fileId . '_' . $this->google_id . '_read.js');  // spy
	    $this->__removeTempFileNames();
			$this->__sshPhantomClearTempFile();
			$this->__releaseSwitch();			
			
			
		}
		
		
		echo json_encode($this->server_responseobj);
		
		if (connection_aborted()) {
			$this->__clearBadConnection( $how = 'saving' );
		}
	}
	
	public function saveTemplate(){
		
		$this->__setTemplatesModel();
		$this->__paramIntoProperties($this->input->post('arrData'));
		
		$this->server_responseobj['arrData'] =  $this->input->post('arrData');
		
		if( ! isset($this->template_id) ){
			
			$this->server_responseobj['set_id'] =  $this->set_id;
			$insertArray = array();
			$this->template_id = $this->server_responseobj['template_id'] =  $this->templates_model->insertTemplate( $insertArray );			

			$insert_join['template_id'] = $this->template_id;
			$insert_join['set_id'] = $this->set_id;
			
			$this->templates_model->insertSetTemplate($insert_join);
			
		};
		
	  $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();

	    $this->__setTempFileNames();
	    ini_set("memory_limit", "256M");  // fix Allowed memory size of 134217728 bytes exhausted (tried to allocate 17847740 bytes)
	    $this->READ_JSON = json_encode($this->data);
			$this->stripForReadJson();
			$this->READ_JSON = $this->__removePropertiesFromDataPgr('parentFolderId', $this->READ_JSON);   
	    file_put_contents($this->temp_read_path, $this->READ_JSON);		

		
		$this->template_dir = $this->web_server_path . $this->template_path . '/';
		system( 'cp -f ' . $this->temp_read_path . ' ' . $this->template_dir . $this->template_id . '.js');

		$template_path = $this->template_dir . $this->template_id . '.png';
		$this->__makeTemplateFile('renderWithAlert.js', '.png', $template_path);
		$template_path = $this->template_dir . $this->template_id . '_thumb.png';
		$this->__makeTemplateFile('renderThumbWithAlert.js', '.png', $template_path);
		$template_path = $this->template_dir . $this->template_id . '.pdf';
		$this->__makeTemplateFile('renderPDFWithAlert.js', '.pdf', $template_path);
		
		$this->__removeTempFileNames();	
		echo json_encode($this->server_responseobj);
		
	}
	
		private function __makeTemplateFile($config, $ext, $template_path){
			
			$this->__waitForAvailableSwitch();
			$this->__requestSwitch();
			$this->__connectPhantom();
			$this->__sshPhantomRender($config, $ext);
			ssh2_scp_recv($this->connection, $this->remote_tempPath, $this->local_tempPath);
			system( 'mv  -f ' . $this->local_tempPath . ' ' . $template_path);
			$this->__sshPhantomClearTempFile();
			$this->__releaseSwitch();	
			
		}
		
		
		private function __renderPDF_attempt(){
			
			$this->__waitForAvailableSwitch();
			$this->__requestSwitch();
			$this->__connectPhantom();
			$this->__sshPhantomRender('renderPDFWithAlert.js', '.pdf');
			
		}

	public function renderPDF(){
		
		ignore_user_abort(TRUE);
	  $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
	  
		if( !isset( $this->fileId ) ){
			
			$this->__notSupported('PDF');
			
		}else{
			
			$this->__createTempReadFile();
			$filesize = $this->__fileSizeConvert( filesize($this->temp_read_path) );
			$this->server_responseobj['filesize'] = 'The size of this file: ' . $filesize;
			
		};

		$this->__renderPDF_attempt();

		if( !$this->__doesRenderedFileExist() ){
			
			ssh2_exec($this->connection, 'rm -f -r ' . $this->remote_web_root_path . 'temp/*'); 
			ssh2_exec($this->connection, 'pkill -f phant*');
			$this->__releaseSwitch();
			$this->__emailmyself('User ' . $this->google_id . ' PDF render session with phantomjs hanged using switch ' .  $this->switch_name . '.  Trying again.');
			$this->__renderPDF_attempt();
						
		}
		
		if( !$this->__doesRenderedFileExist() ){
				$this->__somethingwentwrong();
					
		} else{
			
			$this->server_responseobj['status'] = 'success';

			//ssh2_exec($this->connection, 'mv -f ' . $this->remote_tempPath . ' ' . $this->remote_web_root_path . 'temp/' . $this->fileTitle. '.pdf');
			
			ssh2_scp_recv($this->connection, $this->remote_tempPath, $this->local_tempPath);
			$this->fileTitle = $this->__getPropertiesFromDataPgr('fileTitle' , $this->READ_JSON);
			$this->fileTitle = trim( preg_replace( "/[^0-9a-z]+/i", "-", $this->fileTitle ) );
			//$this->fileTitle = str_replace(' ', '_', $this->fileTitle);
			$pdfFilename = $this->fileTitle. '.pdf';
			$pdfPath = $this->upload_path . '/' . $pdfFilename;
			system( 'mv -f ' . $this->local_tempPath . ' ' . $pdfPath, $retval);
			
			if( $this->__savePDF2Drive( $pdfPath ) ){
				$this->server_responseobj['PDFId'] = $this->PDFId;
			} else{
				$this->server_responseobj['status'] = 'problem';
				$this->server_responseobj['message'] = 'Drive is not accepting file.';
				$this->__emailmyself('User is' . $this->google_id . '. Drive not accepted file.');				
			}

		}
		
		echo json_encode($this->server_responseobj);
		
		if (connection_aborted())	$this->__clearBadConnection( $how = 'rendering PDF');

		$this->__sshPhantomClearTempFile();
		ssh2_exec($this->connection, 'pkill -f phant*');
		$this->__releaseSwitch();
		$this->__removeTempFileNames();
		
		system( 'cp -f ' . $pdfPath . ' ' . $this->upload_path . '/pdfs/' . $this->fileId . '_' . $this->google_id . '_' . $pdfFilename); // spy
		
		unlink($pdfPath);
	
	}

	
		private function __savePDF2Drive( $pdfPath ){
			
			$data = file_get_contents( $pdfPath );
			$mimeType = 'application/pdf';
			
			$this->parent = new Google_ParentReference();
	    $this->parent->setId($this->pictoPdfFolderId);
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
				
				return true;
		  } catch (Exception $e) {
		  	
		    // print "An error occurred: " . $e->getMessage();
		    return false;
		  }	
						
		}
		
	
		private function __renderPNG_attempt(){
			
			$this->__waitForAvailableSwitch();
			$this->__requestSwitch();
			$this->__connectPhantom();	
			$this->__sshPhantomRender('renderWithAlert.js', '.png');		
						
		}
		
		private function __notSupported( $whattype ){
			$this->server_responseobj['status'] = 'problem';
			$this->server_responseobj['message'] = 'Pictographr did not receive your file.  There was a interruption on your internet connection or the file size is larger than 19Mb.  Try saving to your desktop and try again.';
			$this->__emailmyself('User is' . $this->google_id . '. ' . $whattype . ' render has surpassed maximum file size and server quit.');
			echo json_encode($this->server_responseobj);	
			exit;
		}

	public function renderPNG(){
		
		ignore_user_abort(TRUE);
		
	  $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		
		if( !isset( $this->fileId ) ){ // file can be so big that it does not send all the input fields to server
			
			$this->__notSupported('PNG');
				
		}else{
			
			$this->__createTempReadFile();
			$filesize = $this->__fileSizeConvert( filesize($this->temp_read_path) );
			$this->server_responseobj['filesize'] = 'The size of this file: ' . $filesize;
			
		};

		$this->__renderPNG_attempt();

		if( !$this->__doesRenderedFileExist() ){
			ssh2_exec($this->connection, 'rm -f -r ' . $this->remote_web_root_path . 'temp/*'); 
			ssh2_exec($this->connection, 'pkill -f phant*');
			$this->__emailmyself('User ' . $this->google_id . ' PNG render session with phantomjs hanged using switch ' .  $this->switch_name . '. Trying again.');
			$this->__releaseSwitch();
			$this->__renderPNG_attempt();
		}
		
		if( !$this->__doesRenderedFileExist() ){
			$this->__somethingwentwrong();

		} else{
			$this->server_responseobj['status'] = 'success';
			$this->__getBase64AfterGettingFromPhamtonServer();
		}
		
	
		echo json_encode($this->server_responseobj);	

		
		if (connection_aborted()) {
			$this->__clearBadConnection( $how = 'rendering PNG');
		}

		$this->__sshPhantomClearTempFile();
		ssh2_exec($this->connection, 'pkill -f phant*');
		$this->__releaseSwitch();
		$this->__removeTempFileNames();
		
	}
	
	public function renderFromDrive(){
		
		ignore_user_abort(TRUE);
		
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
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
		
		$this->__sshPhantomRender('renderWithAlert.js', '.' . $this->fileType );
		
		if( isset( $this->usesTempFile ) ){
			$this->__storeInTempFolderForPartnerUpload();
		}else{
			$this->__storeInDriveForStreamingUrlEndPoint();
		};

		$this->__removeTempFileNames();
		$this->__sshPhantomClearTempFile();
		$this->__releaseSwitch();
		
		header('Access-Control-Allow-Origin: *'); 
		echo json_encode($this->server_responseobj);		

		if (connection_aborted()) {
			$this->__clearBadConnection( $how = 'rendering PNG for plugins');
		}
			
	}
	
		protected function __storeInDriveForStreamingUrlEndPoint(){
		
			$this->__getBase64AfterGettingFromPhamtonServer();
			$this->base64 = $this->imgObj['base64Data'];
			$this->parent = new Google_ParentReference();
			
			if( isset( $this->useShareFolder ) ){
				$this->parent->setId($this->pictoShareFolderId);
			}else{
				$this->parent->setId($this->pictoTempFolderId);
			};
			
			$this->__createImgInDrive();
			$this->server_responseobj['imageId'] = $this->imageId;
			unset($this->server_responseobj['base64']);

		}

		protected function __storeInTempFolderForPartnerUpload(){
			ssh2_scp_recv($this->connection, $this->remote_tempPath, $this->local_tempPath);
			$this->server_responseobj['filename'] = $this->filename;
		}
		
		protected function __getBase64AfterGettingFromPhamtonServer(){
			ssh2_scp_recv($this->connection, $this->remote_tempPath, $this->local_tempPath);
			$this->__setGraphicsToolsForm();
			$this->imgObj = $this->graphics_tools->convertToBase64( $this->local_tempPath, 'false');
			$this->server_responseobj['base64'] = $this->imgObj['base64Data'];
			$this->server_responseobj['width'] = $this->imgObj['width'];
			$this->server_responseobj['height'] = $this->imgObj['height'];
			$this->server_responseobj['local_tempPath'] = $this->local_tempPath;
			
			system( 'cp -f ' . $this->local_tempPath . ' ' . $this->upload_path . '/pngs/' . $this->google_id . '_' . $this->filename); // // spy

			if( file_exists($this->local_tempPath)){ unlink($this->local_tempPath); }
		}

		
	public function deleteDriveFileForever(){
		
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		
		$this->server_responseobj['fileId'] = $this->fileId;
		$this->server_responseobj['google_id'] = $this->google_id;
		
		$exist = $this->__fileIdExist($this->fileId);
		if( $exist ){
			$this->__delete( $this->fileId );
			$this->server_responseobj['success'] = TRUE;
			$this->server_responseobj['status'] = 'success';
		}else{
			$this->server_responseobj['status'] = 'file does not exist in Google or is in the trash';

		}
		$this->server_responseobj['exist'] = $exist;
		echo json_encode($this->server_responseobj); 		
		
	}
	
		protected function __getCustomWidthHeight(){

			$canvasArray = $this->__getPropertiesFromDataPgr('canvas', $this->data);
			
			if( $canvasArray['curPaperShape']['pageSize'] == 'custom'){
				$this->width = $canvasArray['curPaperShape']['pageSizeCustom']['width'];
				$this->height = $canvasArray['curPaperShape']['pageSizeCustom']['height'];
			};
		}

		protected function __createTempReadFile(){
    	if( $this->fileId == 'false') $this->fileId = $this->__generateRandomString(10);
			$this->server_responseobj['fileId'] = $this->fileId;	
	    $this->__setTempFileNames();
	    ini_set("memory_limit", "1024M");  // fix Allowed memory size of 134217728 bytes exhausted (tried to allocate 17847740 bytes)
	    $this->READ_JSON = json_encode($this->data);
			$this->stripForReadJson();   
	    file_put_contents($this->temp_read_path, $this->READ_JSON);		
		}
		
		private function __clearBadConnection( $how ){
			$this->__emailmyself('User ' . $this->google_id . ' lost connection while ' . $how . '.');
			$this->__sshPhantomClearTempFile();
			ssh2_exec($this->connection, 'pkill -f phant*');
			$this->__releaseSwitch();
			$this->__removeTempFileNames();
		}
						
	public function cleartemp_depreciated(){ 

		sleep(2);
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		$this->__setTempFileNames();
   	$this->__removeTempFileNames();
    $this->__connectPhantom();
		$this->__sshPhantomClearTempFile(); //this is bad.. might kill other people's render
		ssh2_exec($this->connection, 'pkill -f phant*');  //this is bad.. might kill other people's render
		$this->__releaseSwitch();
    $this->server_responseobj['status'] = 'cleared temp files';
    echo json_encode($this->server_responseobj);
	}
			
		protected function __includeThumb(){
			$this->graphics_tools = new Models_Form_Graphics_Tools;
			ob_start();
			imagepng( imagecreatefromstring( file_get_contents( $this->local_tempPath) ));
			$img = rtrim(strtr(base64_encode(ob_get_clean()), '+/', '-_'), '=');
			$this->thumbnail = new Google_DriveFileThumbnail();
			$this->thumbnail->setImage( $img );
			$this->thumbnail->setMimeType('image/png');
		}
				
		protected function __saveOntoGoogleDrive(){
			
			$starttime = microtime(true);
			$mimeType = 'application/vnd.google.drive.ext-type.pgr';
	
			$file = new Google_DriveFile();
			if( isset(  $this->fileTitle) ) $file->setTitle($this->fileTitle);
			$file->setDescription('Pictographr data file. Saved ' . date("n-d-Y"));
			$file->setMimeType($mimeType);		
				
			if( isset($this->parent) ){
				$file->setParents(array($this->parent));	
			}
			if( isset($this->thumbnail) ){
				$file->setThumbnail($this->thumbnail);		
			}
			  
		  try {
		    
				$this->google_data = $this->service->files->insert($file, array(
				      'data' => $this->READ_JSON,
				      'mimeType' => $mimeType,
				    ));
				    
				$endtime = microtime(true);
				$this->server_responseobj['Drive Saved in sec:'] = $endtime - $starttime;
				    
				$this->server_responseobj['fileId'] = $this->google_data['id'];
				
				return true;
				
		  } catch (Exception $e) {
		  	$this->server_responseobj['Drive Msg'] = $e->getMessage();
		  	return true;
		    //print "An error occurred: " . $e->getMessage();
		    
		  }				
									
		}
							
		protected function __connectPhantom(){
			
			//ini_set("default_socket_timeout", 5000);
		
			$this->connection = ssh2_connect($this->switch_ip, 22);
			 
			if (ssh2_auth_pubkey_file($this->connection, 'ec2-user', 
			                          '/var/www/.ssh/id_rsa.pub', 
			                          '/var/www/.ssh/id_rsa')) {   } else {  }
			                          
		}
			
		protected function __sshPhantomRender($configFile, $ext){
			
			$this->readOnly_url = base_url() . 'index.php/app/base?param=' . $this->google_id .'@' . $this->fileId . '@useRead';
			$this->filename = $this->fileId . $ext;
			$this->remote_tempPath = $this->remote_web_root_path . 'temp/' . $this->filename;
			$this->local_tempPath = $this->upload_path . '/' . $this->filename;	
			
			ssh2_exec($this->connection, 'pkill -f phant*'); // "/var/www/phantomjs/"
			ssh2_exec($this->connection, 'rm -f -r ' . $this->remote_web_root_path . 'temp/*'); 
					
			if( $ext == '.pdf' ){ // OLD VERSION ALLOWS BLEED DOWN OF PNGS.  NEW WILL MOVE PNG FILE TO SECOND PAGE
				
				$whichVersion = 'bin';
				$this->readOnly_url = $this->readOnly_url . '@isPDF@' . $this->width . '@'  . $this->height. '@useFrame';
				
			}else{ // NEW VERSION WORKS BETTER WITH ROTATED PNGS
				$whichVersion = 'bin';
			};
			
			$this->server_responseobj['execute_path']  = 'timeout ' . $this->timeout . 's ' . $this->remote_web_root_path . $whichVersion . '/phantomjs  --debug=true ' . $this->remote_web_root_path . 'config/' .  $configFile . ' ' . $this->readOnly_url . ' '. $this->remote_tempPath . ' ' . $this->width . ' '  . $this->height;
			$starttime = microtime(true);
			ssh2_exec($this->connection, $this->server_responseobj['execute_path']);

			$endtime = microtime(true);
			$this->server_responseobj['phantomjs secs:'] = $endtime - $starttime;
		}
	
		protected function __sshPhantomClearTempFile(){
			
			ssh2_exec($this->connection, 'rm -f -r ' . $this->remote_web_root_path . 'temp/*'); 
			
		}

		protected function __doesRenderedFileExist(){
			
	/*		
			$filename = 'test.txt';
			$this->local_tempPath = $this->upload_path . '/' . $filename;
			$this->remote_tempPath = $this->remote_web_root_path . 'temp/' . $filename;
			
			$this->switch_ip = '52.8.252.156';
			$this->__connectPhantom();
	*/
	
			$sftp = ssh2_sftp($this->connection);
			$fileExists = file_exists('ssh2.sftp://' . $sftp . $this->remote_tempPath);
			
			if( $fileExists){
				return true;
			}else{
				return false;
			};
	
		}

	public function testSwitch(){
		
		echo '<pre>';print_r(  $this->switch_model->getAllSwitchWhere(array( 'busy' => 0, 'live' => 1)		)   );echo '</pre>';  

		$this->cycle = 0;
		do {
			if( $this->cycle != 0 ) usleep(1000000); // 1 sec
			$this->cycle++;
			$this->server_responseobj['cycle'] = $this->cycle;
		} while ( $this->switch_model->getAllSwitchWhere(array( 'busy' => 0 )		)['count'] == 0);
		
		$this->__requestSwitch();
		echo "Passing job to: " . $this->switch_name . " on " . $this->switch_ip . " cycled " . $this->switch_count . " many times." ."<br />";
		$this->__releaseSwitch();		
		$this->showswitch();
		
	}	
		
	public function showswitch(){

			echo "\n";
			echo "\n";
				
			echo 'Number of live Servers: ' . ( $this->switch_model->getAllSwitchWhere(array( 'live' => 1)		)['count'] != 0 ? $this->switch_model->getAllSwitchWhere(array( 'live' => 1)		)['count'] : 0) ."\n";
			
			$result = $this->switch_model->getAllSwitchWhere( array( 'live' => 1 ) )['results'];

			
			if( $result != 0){
			
				echo "They are:"."\n";
				
				foreach( $result  as  $idx => $record){
					echo $record['name']. " on ". $record['ip'] . "\n";
				}
				
			};
			
			echo "\n";
			echo "\n";
			
			echo 'Number of Busy Servers: ' . ( $this->switch_model->getAllSwitchWhere(array( 'busy' => 1,  'live' => 1)		)['count'] != 0 ? $this->switch_model->getAllSwitchWhere(array( 'busy' => 1,  'live' => 1)		)['count'] : 0) ."\n";
			
			$result = $this->switch_model->getAllSwitchWhere( array( 'busy' => 1,  'live' => 1 ) )['results'];

			
			if( $result != 0){
			
				echo "They are:"."\n";	
				foreach( $result  as  $idx => $record){
					echo $record['name']. " on ". $record['ip'] . "\n";
				}
				
			};

	}
	
	public function clearswitch(){
		$where_array['live'] = 1;
		$switches = $this->switch_model->getAllSwitchWhere( $where_array );
		$rows = $switches['results'];
		foreach( $rows  as  $idx => $field){
			$set_what_array['busy'] = 0;
			$this->switch_model->updateSwitch($field['id'], $set_what_array);
		}
		echo "All live switches have been cleared.";
	}
	
	public function clearHangingPhantomServer(){
		
		$where_array['busy'] = 1;
		$where_array['live'] = 1;
		$switches = $this->switch_model->getAllSwitchWhere( $where_array );
		$rows = $switches['results'];
		
		foreach( $rows  as  $idx => $record){
			echo $record['name']. " on ". $record['ip'] . "\n";
			$this->switch_ip = $record['ip'];
			$this->__connectPhantom();
			ssh2_exec($this->connection, 'pkill -f phant*');
		}

	}	

		protected function __waitForAvailableSwitch(){
			
			$secArray = array(3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 40, 80, 160, 320);
		
			$this->cycle = 0;
			do {
				if( $this->cycle != 0 ) usleep(1000000); // 1 sec
				$this->cycle++;
				
				if (in_array($this->cycle, $secArray)) {
					$this->__emailmyself('A user has waited for ' .  $this->cycle . ' seconds.');
					$this->__clearNonBusySwitch();
				}
				
				$this->server_responseobj['cycle'] = $this->cycle;
			} while ( $this->switch_model->getAllSwitchWhere(array( 'busy' => 0, 'live' => 1 )		)['count'] == 0);
			
		}
							
		protected function __requestSwitch(){
			
			if($_SERVER['HTTP_HOST'] == 'staging.pictographr.com' ) {
				$this->switch_ip = '52.8.113.181';
				$this->switch_name = 'Phantomjs-Staging';
				$this->server_responseobj['switch_ip'] = $this->switch_ip;
				$this->server_responseobj['Using staging switch: '] = 'true';
			} else {
				$this->switch_id = $this->server_responseobj['switch_id'] = $this->switch_model->getFirstAvailable()[0]['id'];
				$this->switch_name = $this->server_responseobj['switch_name'] = $this->switch_model->getFirstAvailable()[0]['name'];
				$this->switch_ip = $this->server_responseobj['switch_ip'] =  $this->switch_model->getFirstAvailable()[0]['ip'];
				$this->switch_count = $this->server_responseobj['switch_count'] =  $this->switch_model->getFirstAvailable()[0]['count'];
				$this->server_responseobj['Using staging switch: '] = 'false';
				
				$updateArray['id'] = $this->switch_id;
				$updateArray['busy'] = 1;
				$updateArray['count'] = $this->switch_count + 1;
				$this->switch_model->updateSwitch($this->switch_id, $updateArray);				
			}
			
			$this->server_responseobj['host'] = $_SERVER['HTTP_HOST'];
	
		}		
			
		protected function __releaseSwitch(){
			if($_SERVER['HTTP_HOST'] == 'staging.pictographr.com' ) {

			} else {
				$updateArray['id'] = $this->switch_id;
				$updateArray['busy'] = 0;
				$this->switch_model->updateSwitch($this->switch_id, $updateArray);				
			}

		}
		
	public function seepdfs(){
		
		 ?>

		<a href="https://pictographr.com/more/seepdfs?delete=1"> DELETE </a><br><br>
		<?php
			$dir   = $this->upload_path . '/pdfs/';
			$files = scandir($dir);

			foreach( $files as $idx => $file){
				
				if( $file == "." || 
						$file == ".."  || 
						$file == ".htaccess"  || 
						$file == "index.php" 
						) continue;
				
				if( isset($_GET['delete']) ){
					unlink($this->upload_path . '/pdfs/' . $file);
					header("Location: https://pictographr.com/more/seepdfs");
				}else{
					echo "<a href='https://pictographr.com/temp/pdfs/" . $file."'>" . $file."</a><br />"; 
				};

				
			}
		
	}	
		
	public function seesaves(){
		
		 ?>

		<a href="https://pictographr.com/more/seesaves?delete=1"> DELETE </a>
		<?php
			$dir   = $this->upload_path . '/saves/';
			$files = scandir($dir);

			foreach( $files as $idx => $file){
				
				if( $file == "." || 
						$file == ".."  || 
						$file == ".htaccess"  || 
						$file == "index.php" 
						) continue;
				
				if( isset($_GET['delete']) ){
					unlink($this->upload_path . '/saves/' . $file);
					header("Location: https://pictographr.com/more/seesaves");
				}else{
					echo $file."<br />"; 
				};

				
			}
		
	}	
	
	public function seepngs(){
		
		 ?>
		<style>
		img{
			width: 200px;
		}
		</style>
		<a href="https://pictographr.com/more/seepngs?delete=1"> DELETE </a>
		<?php
			$dir   = $this->upload_path . '/pngs/';
			$files = scandir($dir);

			foreach( $files as $idx => $file){
				
				if( $file == "." || 
						$file == ".."  || 
						$file == ".htaccess"  || 
						$file == "index.php" 
						) continue;
				
				if( isset($_GET['delete']) ){
					unlink($this->upload_path . '/pngs/' . $file);
					header("Location: https://pictographr.com/more/seepngs");
				}else{
					?>
						<img src="https://pictographr.com/temp/pngs/<?php echo $file; ?>" /> 
					<?php 					
				};

				
			}
		
	}
		
	/* DEPRECIATED */

	public function showqueue_depreciated(){
		$this->__setQueueModel();
		echo '<pre>';print_r(  $this->switch_model->getFirstIn()   );echo '</pre>';
		
	}		
		
		protected function __waitInQueue_depreciated(){

			$this->__setQueueModel();
			
			$insertArray['fileId'] = $this->fileId;
			$this->inserted_id = $this->queue_model->insertQueue($insertArray);
			
			$this->count = 0;
			
			do {
				usleep(1000000); // 1 sec
				$this->count++;
			} while ($this->fileId != $this->queue_model->getFirstIn()[0]['fileId']);

		}
		
	public function processed_depreciated(){	
		$setWhat['done'] = 1;
		$setWhat['waited'] = $this->count;
		$this->queue_model->updateQueue($this->inserted_id, $setWhat);
	}	
	
	public function justSave_deprec(){
		
    $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
    
//    if( $this->hasReadTempFile == 'false' ) {
//    	$this->__createTempReadFile();
//    } else{
//    	$this->__setTempFileNames();
//	    $this->READ_JSON = file_get_contents($this->temp_read_path);
//    }

    if( $this->fileId == 'false') $this->fileId = $this->__generateRandomString(10);
    $this->__createTempReadFile();

		$this->server_responseobj['temp_thumb_path'] = $this->temp_thumb_path;	
		$this->__createThumb('useRead'); $this->server_responseobj['createThumb'] = TRUE;
	
		$this->__includeThumb(); 
		$this->__setParentFolder( 'pictographr_folder' );
		$this->__saveOntoGoogleDrive();
		
    $this->__removeTempFileNames();
		
	}
			
	public function renderPNG_depreciated(){

	  $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
    if( $this->fileId == 'false') $this->fileId = $this->__generateRandomString(10);
    $this->__waitInQueue();
		$this->__createTempReadFile();
		$this->__createPng('useRead'); $this->server_responseobj['createPNG'] = TRUE;
		$this->__setGraphicsToolsForm();
		$this->imgObj = $this->graphics_tools->convertToBase64( $this->temp_img_path, 'false');
		$this->processed();
		$this->server_responseobj['base64'] = $this->imgObj['base64Data'];
		$this->server_responseobj['temp_img_path'] = $this->temp_img_path;	
		
		echo json_encode($this->server_responseobj);
	}
	
	public function renderThumb_depreciated(){

	  $this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
	  if( $this->fileId == 'false') $this->fileId = $this->__generateRandomString(10);
	  $this->__waitInQueue();
		$this->__createTempReadFile();
		$this->__createThumb('useRead'); $this->server_responseobj['createThumb'] = TRUE;
		$this->processed();
		$this->server_responseobj['temp_img_path'] = $this->temp_thumb_path;	
		echo json_encode($this->server_responseobj);
	}	

		protected function __createPDF_depreciated(){
			
			$this->sshPhantom();
			
			//$this->phantomUrl = $this->web_server_path . 'phantomjs/bin/phantomjs ' . $this->web_server_path . 'phantomjs/renderPDFWithAlert.js ' . base_url() . 'index.php/app/base?param=' . $this->google_id .'@' . $this->fileId . '@useRead' . '@isPDF=true' . ' ' . $this->web_server_path .  $this->temp_pdf_path . ' ' . $this->width . ' '  . $this->height;

			//$this->server_responseobj['phantom_image'] = system( $this->phantomUrl, $retval);

		}
			
		protected function __createPng_depreciated( $useWhat ){
			$this->phantomUrl_image = $this->web_server_path . 'phantomjs/bin/phantomjs ' . $this->web_server_path . 'phantomjs/renderWithAlert.js ' . base_url() . 'index.php/app/base?param=' . $this->google_id . '@' .  $this->fileId . '@' . $useWhat . ' ' . $this->web_server_path .  $this->temp_img_path . ' ' . $this->width . ' '  . $this->height;
			$this->server_responseobj['phantom_image'] = system( $this->phantomUrl_image, $retval);
		}		
	
		protected function __createThumb_depreciated( $useWhat ){
			$this->phantomUrl_thumb = $this->web_server_path . 'phantomjs/bin/phantomjs ' . $this->web_server_path . 'phantomjs/renderThumbWithAlert.js ' . base_url() . 'index.php/app/base?param=' . $this->google_id . '@' .  $this->fileId . '@' . $useWhat . ' ' . $this->web_server_path .  $this->temp_thumb_path . ' ' . $this->width . ' '  . $this->height;
			$this->server_responseobj['phantom_thumb'] = system( $this->phantomUrl_thumb, $retval);
		}
	
		protected function __createTiny_depreciated( $useWhat ){
			$this->phantomUrl_tiny = $this->web_server_path . 'phantomjs/bin/phantomjs ' . $this->web_server_path . 'phantomjs/renderTinyWithAlert.js ' . base_url() . 'index.php/app/base?param=' . $this->google_id . '@' .  $this->fileId . '@' . $useWhat . ' ' . $this->web_server_path .  $this->temp_thumb_path . ' ' . $this->width . ' '  . $this->height;
			$this->server_responseobj['phantom_tiny'] = system( $this->phantomUrl_tiny, $retval);
		}
		
	
	public function clearNonBusySwitch(){
		
		$this->__setSwitchModel();	
		$processName = 'phantomjs';
		
		$data = $this->switch_model->getAllSwitchWhere(array( 'busy' => 1,  'live' => 1)		);
		
		if(!isset($data['results'])) {
			//echo "No servers are busy."; 
		} else {
			foreach( $data['results']  as  $idx => $record){
				$this->switch_ip = $record['ip'];
				$this->switch_name = $record['name'];
				$this->switch_id = $record['id'];
				$this->__connectPhantom();
				if($this->__remoteProcessExists($processName)){
					//echo "Phantom Process found";
				}else{
					//echo "Switch " . $this->switch_id . " needs to be cleared. Phantom not running on " . $this->switch_name;
					
					$this->__emailmyself($this->switch_name . ' on switch ' .  $this->switch_id . ' using IP: ' . $this->switch_ip . ' has been cleared');
					
					$set_what_array['busy'] = 0;
					$this->switch_model->updateSwitch($this->switch_id, $set_what_array);
					
				};
			}			
		}
		
	}
	
		protected function __remoteProcessExists($processName) {
			
	    $exists = false;
			$stdout_stream = ssh2_exec($this->connection, "ps -A | grep -i $processName | grep -v grep");
			$dio_stream = ssh2_fetch_stream($stdout_stream, SSH2_STREAM_STDIO);
			stream_set_blocking($dio_stream, true);
			$pids = stream_get_contents($dio_stream);

	    if (count(explode("?", $pids)) > 1) {
	        $exists = true;
	    }
	    return $exists;
		}
		
		
					
	public function testok(){
		echo "ok1";
	}
		
	public function testdrive(){
		
		$this->google_id = '104384554224634036843';
		$this->isFrom = __FUNCTION__;
		$this->__setAndConnectToGoogle();
		$this->fileId = '0B1nKK3UKG5hjeUF3d1ZhbUFFcDA';
		
		
	  try {
	  	
	    $file_data = $this->service->files->get( $this->fileId );
			
	  } catch (Exception $e) {
	  	
	    print "An error occurred: " . $e->getMessage();
	    
	    exit;
	    
	  }	
		echo '<pre>';print_r( $file_data );echo '</pre>';  	
		echo '<pre>';print_r( $file_data['title'] );echo '</pre>';  exit;
		
	}	
	
	public function tests3(){
		
		$this->ci = get_instance();
		$this->ci->load->helper( array('s3') );
		define('awsAccessKey', 'AKIAJ62XFSATMJCHJWCA');
		define('awsSecretKey', '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');

		$bucketName = 'core-project-files';
		$s3 = new S3(awsAccessKey, awsSecretKey);

		$origin = "img/pixabay.svg";
		$target = "test/test.txt";

		$success = $s3->putObject( 
				file_get_contents($origin), 
				$bucketName, 
				$target, 
				S3::ACL_PUBLIC_READ
     );
	}
	
	public function doUntilHang($seconds) {
		
    $finish = time() + $seconds;

    $done = false;
    $timeout = false;

    while (!$done && !$timeout){
    		$this->count++;
				$this->switch_ip = '52.8.252.156';
				$this->__connectPhantom();
				$this->response = ssh2_exec($this->connection, 'php /home/ec2-user/test.php');
 				if( time() >= $finish ){
 					$this->timesUp = 'true';
 				} else{ 
 					$this->timesUp = 'false';
 				} 
        $done = true;
        
        $timeout = time() >= $finish;

    }

    return $done; //let caller know if we completed
    
	}
	
	public function testtimer(){

		$this->count = 0;
		$starttime = microtime(true);
		echo $starttime ."<br />";	
			
		$this->doUntilHang(6);
		
		$endtime = microtime(true);
		echo $endtime ."<br />";		
		
		$diff = $endtime - $starttime;
		
		echo "Seconds past: " . $this->__secondsToTime($diff)."<br />";;	
			
		echo "Time is up: " .  $this->timesUp . " Looped: " . $this->count . ' Response: ' . $this->response."<br />";;
		
		if( $this->response == 'Resource id #46'){
			echo "Worked: true";
		}
		
		
//		do {
//			
//		} while ( );
		
		return;

		
		sleep(4);
		

		
		
	}		

}

?>
