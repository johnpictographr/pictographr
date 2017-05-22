<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Admin extends More {

	public function __construct() {
		parent::__construct();
	}
	
	public function spyUserList(){ // http://pictographr.com/admin/spyUserList?google_id=107635473183947129758
		// 102017038997425893246
		//  = '113796646601314256524';

		$this->google_id = $_GET['google_id']; 
		$this->__connect();

    $parameters = array();
    
    $parameters['q'] = "'"  .  $this->pictoFolderId. "' in parents and trashed = false and mimeType = 'application/vnd.google.drive.ext-type.pgr'";
    
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
    	$file['thumbnailLink'] = $item['thumbnailLink'];
    	//$file['width'] =  imagesx($im);
    	//$file['height'] = imagesy($im);
    	$data[] = $file;
    }
    
    header('Access-Control-Allow-Origin: *'); 
    echo json_encode($data);
	}

	public function spyfile(){ // http://pictographr.com/admin/spyfile?fileId=&google_id=
		
		$this->google_id = $_GET['google_id']; 
		$this->fileId = $_GET['fileId']; 
		
		$this->__connect();

		$this->READ_JSON = $this->__openFromGoogleDrive();
		
		/* STORE IN JAMES MING FOLDER  */
		
		$this->google_id = '105870981217629422585';	
		$this->__connect();			

		$this->fileTitle = $this->__getPropertiesFromDataPgr('fileTitle' , $this->READ_JSON);	
		
		$this->READ_JSON = $this->__object_to_array( json_decode(  $this->READ_JSON  )  );	
		
		unset( $this->READ_JSON['parentFolderId'] );
		
		$this->READ_JSON = json_encode( $this->READ_JSON );
		
		$this->__setParentFolder( 'pictographr_folder' );
			
		$this->__saveOntoGoogleDrive();
		
		echo "completed.";
	}

	public function index(){   //  localhost/pictographr-design/html/app
		
	}
		
	public function storeTemplatesJsonInFile(){ 
		
		//http://localhost/pictographr/admin/storeTemplatesJsonInFile?parentFolderId=0B1nKK3UKG5hjZkFSVjRNLTcxdDg
		//https://pictographr.com/admin/storeTemplatesJsonInFile?parentFolderId=0B1nKK3UKG5hjZkFSVjRNLTcxdDg
		
		$this->__setAndConnectToGoogle();
		$useThisFolderId = $_GET['parentFolderId'];
		
		$folder_mimetype = 'application/vnd.google-apps.folder';
		$file_mimetype = 'application/vnd.google.drive.ext-type.pgr';		
		
    $parameters['q'] = "'"  .  $useThisFolderId . "' in parents and trashed = false and mimeType = '" . $folder_mimetype . "'";
    
		$count = 0;
		$data = [];
		
		$folders_drive = $this->service->files->listFiles($parameters);
		
		
		$folders = [];
		
    foreach( $folders_drive['items']  as  $folder_label => $folder_item){

			$folder['id'] = $folder_item['id'];
			$folder['title'] = $folder_item['title'];
			
			$parameters['q'] = "'"  .  $folder['id'] . "' in parents and trashed = false and mimeType = '" . $folder_mimetype . "'";
			$sub_folders_drive = $this->service->files->listFiles($parameters);
			
			$files = [];
			$sub_folders = [];
			
			if( count( $sub_folders_drive['items'] ) > 0 ){
				
				foreach( $sub_folders_drive['items']  as  $sub_folder_label => $sub_folder_item){
					
					$sub_folder['id'] = $sub_folder_item['id'];
					$sub_folder['title'] = $sub_folder_item['title'];		
					
					$parameters['q'] = "'"  .  $sub_folder['id'] . "' in parents and trashed = false and mimeType = '" . $file_mimetype . "'";
					$files_drive = $this->service->files->listFiles($parameters);
					
					foreach( $files_drive['items']  as  $file_label => $file_item){
					
						$file['id'] = $file_item['id'];
						$file['title'] = $file_item['title'];
						$file['thumb'] = $file_item['thumbnailLink'];
						$this->__putThumbInTempTemplateFolder( $file['id'], $file['thumb'] );
						$files[] = $file;
					
					}
					
					$sub_folder['files'] = $files;
					$sub_folders[] = $sub_folder;
					$files = [];
				};
				
				unset( $folder['files'] );
			 	$folder['sub_folders'] = $sub_folders;
			 	
			}else{
				
				$parameters['q'] = "'"  .  $folder['id'] . "' in parents and trashed = false and mimeType = '" . $file_mimetype . "'";
				$files_drive = $this->service->files->listFiles($parameters);
				
				foreach( $files_drive['items']  as  $file_label => $file_item){
				
					$file['id'] = $file_item['id'];
					$file['title'] = $file_item['title'];
					$file['thumb'] = $file_item['thumbnailLink'];
					$this->__putThumbInTempTemplateFolder($file['id'], $file['thumb']);
					$files[] = $file;
				
				}	
				
				$folder['files'] = $files;
				unset( $folder['sub_folders'] );
							
			};
			 
			$folders[] = $folder;
	    
    }
    
   //echo '<pre>';print_r(  $folders );echo '</pre>';  exit;
   
   $this->TEMPLATE_JSON =  json_encode( $folders );
   
	 file_put_contents( $this->upload_path . '/templates/templates.json', $this->TEMPLATE_JSON);	
		
	}		
	
	public function getTemplatesFromDrive(){ //http://localhost/pictographr/admin/getTemplatesFromDrive?parentFolderId=0B1nKK3UKG5hjZkFSVjRNLTcxdDg
		
		$this->__setAndConnectToGoogle();
		$useThisFolderId = $_GET['parentFolderId'];
		
		$folder_mimetype = 'application/vnd.google-apps.folder';
		$file_mimetype = 'application/vnd.google.drive.ext-type.pgr';		
		
    $parameters['q'] = "'"  .  $useThisFolderId . "' in parents and trashed = false and mimeType = '" . $folder_mimetype . "'";
    
		$count = 0;
		$data = [];
		
		$folders_drive = $this->service->files->listFiles($parameters);
		
		$folders = [];
		
    foreach( $folders_drive['items']  as  $folder_label => $folder_item){

			$folder['id'] = $folder_item['id'];
			$folder['title'] = $folder_item['title'];
			
			$parameters['q'] = "'"  .  $folder['id'] . "' in parents and trashed = false and mimeType = '" . $folder_mimetype . "'";
			$sub_folders_drive = $this->service->files->listFiles($parameters);
			
			$files = [];
			$sub_folders = [];
			
			if( count( $sub_folders_drive['items'] ) > 0 ){
				
				foreach( $sub_folders_drive['items']  as  $sub_folder_label => $sub_folder_item){
					
					$sub_folder['id'] = $sub_folder_item['id'];
					$sub_folder['title'] = $sub_folder_item['title'];		
					
					$parameters['q'] = "'"  .  $sub_folder['id'] . "' in parents and trashed = false and mimeType = '" . $file_mimetype . "'";
					$files_drive = $this->service->files->listFiles($parameters);
					
					foreach( $files_drive['items']  as  $file_label => $file_item){
					
						$file['id'] = $file_item['id'];
						$file['title'] = $file_item['title'];
						$file['thumb'] = $file_item['thumbnailLink'];
						$files[] = $file;
					
					}
					
					$sub_folder['files'] = $files;
					$sub_folders[] = $sub_folder;
					$files = [];
				};
				
			 	$folder['sub_folders'] = $sub_folders;
			 	
			}else{
				
				$parameters['q'] = "'"  .  $folder['id'] . "' in parents and trashed = false and mimeType = '" . $file_mimetype . "'";
				$files_drive = $this->service->files->listFiles($parameters);
				
				foreach( $files_drive['items']  as  $file_label => $file_item){
				
					$file['id'] = $file_item['id'];
					$file['title'] = $file_item['title'];
					$file['thumb'] = $file_item['thumbnailLink'];
					$files[] = $file;
				
				}	
				
				$folder['files'] = $files;
				unset( $folder['sub_folders'] );
							
			};
			 
			$folders[] = $folder;
	    
    }
    
   //echo '<pre>';print_r(  $folders );echo '</pre>';  exit;
   
   echo json_encode( $folders );
		
		
	}
	
	public function getTemplatesJsonFile(){ // http://localhost/pictographr/admin/getTemplatesJsonFile
   
		$this->TEMPLATE_JSON = file_get_contents($this->upload_path . '/templates/templates.json'); 
		header('Access-Control-Allow-Origin: *');
		echo $this->TEMPLATE_JSON ;
		
	}
	
		private function __putThumbInTempTemplateFolder( $fileId, $url ){
		
				$this->__setGraphicsToolsForm();
			
				// $url = 'https://lh6.googleusercontent.com/YWQ2hJKS_n-_0Pj4G8-t0RU7GuuCLOrOlSyAwfkMMdXw3RbJYaXQZytl4pLtBrGg7gRxFA=s220';
			
				$this->rawImg = file_get_contents($url);
				
				file_put_contents($this->upload_path . '/templates/' . $fileId . '.png', $this->rawImg);
				
				
				
				return;
				
				
				$x = getimagesizefromstring($this->rawImg);
				$width  = $x['0'];
				$height = $x['1'];
	
				$this->new_width = $width;
				$this->new_height = $height;
			
				$this->imgObj = $this->graphics_tools->convertToBase64('false', $this->rawImg);
		
				$this->obj['status'] = 'success';
				$this->obj['width'] = $this->new_width;
				$this->obj['height'] = $this->new_height;
				$this->obj['base64Data'] = $this->imgObj['base64Data'];
				
				?>
				<img src='data:image/png;base64, <?php echo $this->obj['base64Data'];?>' />
				<?php 

		}

	public function save_icon_tags(){
		
    $this->JSON = json_encode($this->input->post('arrData')['data']);
		$file = $this->upload_path . '/icon.js'; 
		file_put_contents($file, $this->JSON);
		echo $this->input->post('arrData')['data'];
		
	}
	
	public function save_font_label_names(){
		
    $this->JSON = $this->input->post('arrData')['data'];
		$file = $this->upload_path . '/fonts_naming.json';
		file_put_contents($file, $this->JSON);
		echo $this->input->post('arrData')['data'];
		
	}
	
	public function get(){
		
		$data = $this->__getDataFromTempDataJSfile();
		
		echo json_encode($data);			
	}
	
		protected function __getDataFromTempDataJSfile(){
			$file = $this->upload_path . '/data.js'; 
			return file_get_contents($file);	
		}
		
	public function seeTest(){
		
		$file = 'uploads/output/fonts_naming.json'; 
		$json = json_decode(file_get_contents($file));
		$object = array();
		foreach( $json  as  $fontname => $subgroup){
			$object[$fontname] = $subgroup;
		}
		
		echo '<pre>';print_r(  $object  );echo '</pre>';  exit;
		
		$dir    = 'img/fonts/categories';
		$files = scandir($dir);
		
		foreach( $files as $idx => $folder){
			
			if( $folder == "." || 
					$folder == ".."  || 
					$folder == "*.png" 
					) continue;
				
			if( count(explode(".png", $folder)) > 1) continue;
				
				echo $folder."<br />";
			
		}
		
	}	
	
	public function maintain_fonts(){
		
		$file = 'uploads/output/fonts_naming.json'; 
		$json = json_decode(file_get_contents($file));
		$object = array();
		foreach( $json  as  $fontname => $subgroup){
			$object[$fontname] = $subgroup;
		}
		
		$fontlist = array();
		
		$dir    = 'img/fonts/categories';
		$files = scandir($dir);
		
		foreach( $files as $idx => $folder){
			
			if( $folder == "." || 
					$folder == ".."  || 
					$folder == "*.png" 
					) continue;
				
			if( count(explode(".png", $folder)) > 1) continue;
				
				$fontlist[$folder] = $this->spriter($folder, $object); 
			
		}	
		
		echo '<pre>';print_r(  $fontlist  );echo '</pre>';  exit;
	}	
		
	private function spriter($folder, $object) {
		
			$category = array();
		
			$dir = 'img/fonts/categories/' . $folder . '/*.png';
			$target = 'img/fonts/sprites/' . $folder . '.png';

			
			$icon_width = 400;
			$icon_height = 64;
			$new_width = 200;
			$new_height = 32;
			$height = count(glob($dir)) * $new_height;
			
			$img = imagecreatetruecolor($icon_width, $height);
			$background = imagecolorallocatealpha($img, 255, 255, 255, 127);
			imagefill($img, 0, 0, $background);
			imagealphablending($img, false);
			imagesavealpha($img, true);
			
			$pos = 0;
			
			$fonts = array();
	
			foreach (glob($dir) as $file) {
				
				$font = array();
				
				$tmp = imagecreatefrompng($file);
				
				$new_image = imagecreatetruecolor($new_width, $new_height);
				
				imagecolortransparent($new_image, imagecolorallocatealpha($new_image, 0, 0, 0, 127));
				
				imagealphablending($new_image, false);
				
				imagesavealpha($new_image, true);
				
				imageCopyResampled($new_image, $tmp, 0, 0, 0, 0, $new_width, $new_height, $icon_width, $icon_height);
	
				imagecopy($img, $new_image, 0, $pos, 0, 0, $new_width, $new_height);
				
				imagedestroy($new_image);
				
				imagedestroy($tmp);
	
				
				$filename = explode("/", $file)[4];
				
				$font['filename'] = $filename;
				
				$font['fontname'] = explode("-regular.png", $filename)[0];
				
				$font['label'] = $object[$font['fontname']]->label;
				
				$font['family'] = $object[$font['fontname']]->family;
				
				$font['pos'] = $pos;
				
				$pos += $new_height;
				
				$fonts[] = $font;
				
			}
			
			imagepng($img, $target);
			
			return  $fonts;
	}
	
	public function test(){
		
		$this->__setUsersModel();
	}			

	public function deleteOldBackups(){
		
		$this->google_id = '105870981217629422585';// jamesming@gmail.com
		
		if( !$this->connected ) $this->__connect();
		$this->__setBackupsModel();

			$date = new DateTime("now");
			$date->modify("-1 day");
			$yesterday = $date->format("Y-m-d H:i:s");

		$this->backupsArray = $this->backups_model->getAllBackupsWhere( array(
			'created <=' =>  $yesterday
		));

		if( $this->backupsArray['results'] == 0 ) {
			echo "No files found before: " . $yesterday;
			return;	
		}

		foreach( $this->backupsArray['results'] as $backup){
			
			$when = new DateTime($backup['created']);
			$niceEndDate = $when->format('F d, Y H:i:s');
			echo "Attempting to trash " . $backup['db_fileId']. ' - '.  $niceEndDate ."<br />";
			
			if( $this->__fileIdExist($backup['db_fileId'])){
				$this->__delete( $backup['db_fileId'] );
				echo "Success.</br>";
			} else{
				echo "Not found.</br>";
			};
			
			echo "Attempting to trash " . $backup['templateszipfileId']. ' - '.  $niceEndDate ."<br />";
			
			if( $this->__fileIdExist($backup['templateszipfileId'])){
				$this->__delete( $backup['templateszipfileId'] );
				echo "Success.</br>";
			} else{
				echo "Not found.</br>";
			};
			
			$whereArray['id'] = $backup['id'];
			$this->backups_model->deleteBackup($whereArray);
			
		}
	}
		
	public function saveDBToDrive(){ //https://pictographr.com/admin/saveDBToDrive
		
		ini_set('memory_limit', '500M');
		// $this->__setAndConnectToGoogle();
		
		$this->google_id = '105870981217629422585';// jamesming@gmail.com
		
		if( !$this->connected ) $this->__connect();
		$this->__setBackupsModel();
		
//			$mimeType ='application/vnd.google-apps.folder';
//			
//			$file = new Google_DriveFile();
//			$file->setTitle('Mysqldump Folder');
//			$file->setDescription('Mysqldump Folder');
//			$file->setMimeType($mimeType);
//
//			$this->google_data = $this->service->files->insert($file, array(
//			      'mimeType' => $mimeType,
//			    ));
//			    
//			    
//			echo $this->google_data['id']."<br />";
//			
//
//			    
//			$this->parentId = $this->google_data['id'];
//			exit;			

			$this->parent = new Google_ParentReference();
			
	    $this->parent->setId('0B5ptY5tUIebjWXlrT0lOcm1EUGs');
		
		$mysqldump = file_get_contents( $this->web_server_path . "backup/pictographr_db.sql" );
		$mimeType = 'text/plain';

		$file = new Google_DriveFile();
		$file->setTitle( date("g:ia") . '|' . date("n-d-Y"));
		$file->setDescription('mysqldump file');
		$file->setMimeType($mimeType);		
		$file->setParents(array($this->parent));

		$this->google_data = $this->service->files->insert($file, array(
		      'data' => $mysqldump,
		      'mimeType' => $mimeType,
		    ));
		    
		$this->db_fileId = $this->google_data['id'];
		
		echo "dumped fileId: " . $this->db_fileId."<br />";
		
		
//		$mysqldump = file_get_contents( $this->web_server_path . "backup/templates.zip" );
//		$mimeType = 'application/zip';
//
//		$file = new Google_DriveFile();
//		$file->setTitle( date("g:ia") . '|' . date("n-d-Y"));
//		$file->setDescription('templates file');
//		$file->setMimeType($mimeType);		
//		$file->setParents(array($this->parent));
//
//		$this->google_data = $this->service->files->insert($file, array(
//		      'data' => $mysqldump,
//		      'mimeType' => $mimeType,
//		    ));
//		    
//		$this->templateszipfileId = $this->google_data['id'];
		
//		echo "dumped fileId: " . $this->templateszipfileId."<br />";
		
		$backup_id = $this->backups_model->insertBackup( array(
			'db_fileId' => $this->db_fileId/*,
			'templateszipfileId' => $this->templateszipfileId*/
		));	
					

	}

	public function createTable(){
		
		$this->__setUsersModel();
		
		$table = $this->input->get('table');

		$fields_array = array(
		    'id' => array(
           'type' => 'INT',
           'unsigned' => TRUE,
           'auto_increment' => TRUE
		    ),
		    'name' => array(
           'type' => 'varchar(45)'
		    ),
		    'created' => array(
		       'type' => 'DATETIME'
		    ),
		    'updated' => array(
		       'type' => 'DATETIME'
		    )  
		);
		
		$this->users_model->create_table_with_fields($table, $primary_key = 'id', $fields_array);
		
		if( $this->input->get('foreign') != '' ){
			$foreign = $this->input->get('foreign');
			$fields_array = array(
	      $foreign . '_id' => array(
	         'type' => 'INT',
	         'unsigned' => TRUE
	      )
	    );			
		};
		
		$this->users_model->add_column_to_table_if_not_exist($table, $fields_array);

	}
	
	public function gethelp(){  // https://pictographr.com/admin/gethelp
		
		$this->__setUsersModel();
		
		$date = new DateTime("now");
		
		$whereArray = array(
				'acceptTerms' => 0,
				'isOrgAdmin' => 0,
				'created >' => date('Y-m-d', strtotime($date->format('Y-m-d'))),
				'flag' => 0
			);
					
		$users = $this->users_model->getUsersWhere( $whereArray, $use_order = TRUE, $order_field = "created", $order_direction = "desc", $count = -1);
		 

		if( $users == 0 ) exit;
		foreach( $users as  $user){
			
			$user_id = $user['id'];
			
			$subject = "Would you kindly give me some feedback?";
			
			$email = "Dear " . ucfirst ($user['given_name'])  . ",<br><br>

I am the founder of Pictographr, the graphic design add-on you installed today.  There is a flaw in the program where it may have stopped you from continuing the setup procedure.  This bug has been stopping half of my potential users from registering.  Its so hard to debug without seeing the issue firsthand.

Would you be so kind and help me resolve this problem?  I would gladly compensate you for your time with free lifetime membership on Pictographr.  I am a solo entrepreneur in Los Angeles and have worked on this design tool for the last three years.  I would be tremendously indebted to you for any feedback you can offer.
<br><br><br>
Humbled,
<br><br>
James Ming<br>
CTO Pictographr Inc.";


		$this->message_id = 8;
		
		$this->addTo = $user['email'];
		$this->setFrom = "jamesming@pictographr.com";
		$this->setSubject = $subject;

		$this->setText = $email;
		$this->setHtml = $email;
		$this->__sendgrid();
			
			echo "<img width='200' src='" . $user['picture'] . "'/>"."<br /><br /><br />";		
			echo $subject."<br /><br>";
			echo $email."<br /><br>";
			echo "<br /><br>";
			echo " ========================================";
			echo "<br /><br>";
			
			$set_what_array['flag'] = 1;  
			$this->users_model->updateUser( $user_id, $set_what_array );

		}
		
		echo "Sent " . count($users) . " emails";
		
	}
	
	public function testlog(){
		
		$this-> __logToFile('testing');
	
	}	
	
	public function seelog(){
		
		$this-> __seelog();
	
	}
	
	public function testhelpme(){
		
			$myemail = "jamesming@gmail.com";
			
			$given_name = "James";
		
			$subject = "Would you kindly give me some feedback?";
			
			$email = "Dear " . ucfirst ( $given_name ) . ",<br><br>

I am the founder of Pictographr, the graphic design add-on you installed today.  There is a flaw in the program where it may have stopped you from continuing the setup procedure.  This bug has been stopping half of my potential users from registering.  Its so hard to debug without seeing the issue firsthand.

Would you be so kind and help me resolve this problem?  I would gladly compensate you for your time with free lifetime membership on Pictographr.  I am a solo entrepreneur in Los Angeles and have worked on this design tool for the last three years.  I would be tremendously indebted to you for any feedback you can offer.
<br><br><br>
Humbled,
<br><br>
James Ming<br>
CTO Pictographr Inc.";
		
		$this->message_id = 8;
		
		$this->addTo = $myemail;
		$this->setFrom = "jamesming@pictographr.com";
		$this->setSubject = $subject;

		$this->setText = $email;
		$this->setHtml = $email;
		$this->__sendgrid();
		
	}
	
	public function recover(){ //https://pictographr.com/admin/recover?which=bad&file=data_0qZ4iHq9Em_101095087360020950087_read.js
		
		$this->google_id = '105870981217629422585';// jamesming@gmail.com	
		$this->__setAndConnectToGoogle();

		$good = 'https://pictographr.com/temp/good/';
		$bad = 'https://pictographr.com/temp/bad/';
		$saves = 'https://pictographr.com/temp/saves/';
		
		if( isset($_GET['file']) ) $file = $_GET['file'];
		if( isset($_GET['which']) ) $which = $_GET['which'];
		
		$url = 'https://pictographr.com/temp/' . $which . '/' . $file;
		
		echo $url."<br />";
	
		$this->READ_JSON = file_get_contents($url);

		$this->fileTitle = $this->__getPropertiesFromDataPgr('fileTitle' , $this->READ_JSON);	
		
		$this->READ_JSON = $this->__object_to_array( json_decode(  $this->READ_JSON  )  );	
		
		unset( $this->READ_JSON['parentFolderId'] );
		
		$this->READ_JSON = json_encode( $this->READ_JSON );
		
		$this->__setParentFolder( 'pictographr_folder' );
			
		$this->__saveOntoGoogleDrive();

	}	

	public function count(){ //http://localhost/pictographr/admin/count
		//https://pictographr.com/admin/countNewUsersToday
		
		// SELECT * FROM `users` WHERE `trial_start` = '2016-11-07'
		
		$this->__setUsersModel();
		$this->__setUsersPartnersModel();

		
		
		$date = new DateTime("now");
		$today = $date->format('Y-m-d');
		
		
		$where_array['trial_start'] = $today;
		$where_array['acceptTerms'] = 1;
		
		//echo '<pre>';print_r(  $where_array  );echo '</pre>';  exit;
		
		$users = $this->users_model->getUsersWhere( $where_array, $use_order = TRUE, $order_field = "id", $order_direction = "asc", $count = -1 );

		// echo '<pre>';print_r( $users );echo '</pre>'; exit;

		foreach( $users  as  $idx => $value){
			$user = $users[$idx];
			
		
			$what_array['user_id'] = $user['id'];
			$results = $this->userspartners_model->getAllUsersPartnersWhere( $what_array );
			
			$partner_id = $results['results'][0]['partner_id'];

			switch ( $partner_id ) {
					
			  case '':
			  	$partner = 'None';
				break;	
					
			  case '1':
			  	$partner = 'HootSuite';
				break;					
					
			  case '5':
			  	$partner = 'Microsoft Outlook';
				break;	
										
			  case '9':
			  	$partner = 'Google Docs';
				break;
				
			  case '11':
			  	$partner = 'Google Forms';
				break;
				
			  case '13':
			  	$partner = 'Google Sheets';
				break;	
								
			  case '15':
			  	$partner = 'Microsoft Office';
				break;		
								
			  case '16':
			  	$partner = 'Windows 10';
				break;
												
			  case '17':
			  	$partner = 'Prospace';
				break;
								
			  case '18':
			  	$partner = 'Shortpost';
				break;
								
			  case '19':
			  	$partner = 'Teachingstash';
				break;
								
			  case '20':
			  	$partner = 'Templatesforstudents';
				break;
								
			  case '21':
			  	$partner = 'Templatesforteachers';
				break;
								
			  case '22':
			  	$partner = 'Templatesforeducation';
				break;
								
			  case '23':
			  	$partner = 'Templatesforschools';
				break;
								
			  case '24':
			  	$partner = 'Templatesforbusiness';
				break;											
			}
			
			$user['partner'] = $partner;

			$usersObj[] = 	$user;
			
		}

		$countToday = $this->users_model->getCount( $where_array );
		
		$date = new DateTime("now");
		$date->modify("-1 day");
		$yesterday = $date->format('Y-m-d');
		
		$where_array['trial_start'] = $yesterday;
		
		$countYesterday = $this->users_model->getCount( $where_array );
		
		?>
		<style>
			div{
				font-size:20px;	
			}
			.user{
				position: relative;
				float: left;
				padding: 5px;
			}
			.user div{
				font-size:14px;
			}
			.user img{
				width:70px;
				height:70px;
			}		
		</style>
		<div>
			Users created yesterday:  <?php echo $countYesterday  . "<br />"; ?>
		</div>
		<div>
			Users created today:  <?php echo $countToday."<br />"; ?>
		</div>		
		<div>
			<?php 
			
			foreach( $usersObj  as  $idx => $user){ ?>
				
				<div  class="user">
					<img src="<?php echo $user['picture']; ?>" />
					<div>
						<?php echo $user['id'] . ')' .substr($user['name'],0,15);?>
					</div>
					<div>
						<?php echo $user['email'];?>
					</div>
					<div>
						<?php echo $user['google_id'];?>
					</div>
					<div>
						<?php echo $user['locale'];?> | <?php echo $user['partner'];?>
					</div>
					</div>
				</div>
				
				
				
				<?php
				
			}
			
			?>
		</div>
		<?php
		
		
	}
	
	
	public function unsubscribe(){ //https://pictographr.com/admin/unsubscribe
		
		//$this->google_id = '105870981217629422585';// jamesming@gmail.com	
//		$this->__setAndConnectToGoogle();
		
		$this->__setUsersModel();
		$this->__getUserIdAndSessionIdWithSessionId();

		$set_what_array = [ 'unsubscribe' => 1 ];

		$this->users_model->updateUser( 
			$this->user_id, 
			$set_what_array 
		);
		
		$whereArray['id'] =  $this->user_id;
		
		$this->userResultArray = $this->users_model->getUserWhere( $whereArray );
		
		//$this->emailmyself_content = $this->userResultArray['email'] . ' - ' . $this->userResultArray['name'] . ' had just requested to be unsubscribed.' ;
		
		//$this->__emailmyself( $this->emailmyself_content  );
		
		?>
		<center>
			<br><br>
			<img width="550" src="../img/unsubscribe.png"/><br><br><br><br>
			<?php echo $this->userResultArray['name'] . ' had just been unsubscribed.'; ?>
		</center>
		
		<?php 

	}
	
	public function emailrequestforchat(){ //https://pictographr.com/admin/emailrequestforchat
		
		//$this->google_id = $_GET['google_id'];
		$this->google_id = '101490082966548772829';
		$this->__setUsersModel();
		$this->__getUserIdAndSessionIdWithSessionId();
		
		$whereArray['id'] =  $this->user_id;
		
		$this->userResultArray = $this->users_model->getUserWhere( $whereArray );
		
		
		echo '<pre>';print_r(  $this->userResultArray );echo '</pre>';  exit;			

	}

	
	public function sendnotification(){
		
			$this->__paramIntoProperties($this->input->post('arrData'));
		
			$myemail = "jamesming@gmail.com";
			
			$given_name = "James";
		
			$subject = "Server Alert!";
		
		$this->message_id = 8;
		
		$this->addTo = $myemail;
		$this->setFrom = "jamesming@pictographr.com";
		$this->setSubject = $subject;

		$this->setText = $this->email;
		$this->setHtml = $this->email;
		$this->__sendgrid();
		
	}

}
