<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Test extends More {
		
	public function __construct() {
		parent::__construct();
	}

	public function it(){
		
		$this->__setAndConnectToGoogle();
		$exist = $this->__fileIdExist("0B1nKK3UKG5hjZkFSVjRNLTcxdDg");
		
		if( $exist){
			echo "Yes!";
		}else{
			echo "No!";
		};
		
	}
	

	
	
	public function fileinfo(){  //https://pictographr.com/test/fileinfo?fileId=
		
		$this->__setAndConnectToGoogle();
		
		$fileId = $_GET['fileId'];
		
		echo  "<br />---------------------------------------------------------------<br />";
		
		echo $this->__getParentFolderId( $fileId );
		
		echo  "<br />---------------------------------------------------------------<br />";
		

		
		$this->file_data = $this->service->files->get( $fileId );
				
		echo '<pre>';print_r( $this->file_data  );echo '</pre>';
	}
	
	public function folderinfo(){  //https://pictographr.com/test/folderinfo?parentFolderId=
		
		$this->__setAndConnectToGoogle();
		$fileId = $_GET['parentFolderId'];
		$this->file_data = $this->service->files->get( $fileId );
		if( $this->file_data['shared'] == 1 ){
			echo "folder is shared.";
		}else{
			echo "folder is not shared.";
		};
		echo  "<br />---------------------------------------------------------------<br />";		
		echo $this->__getFolderOwnerEmail( $fileId );
		echo  "<br />---------------------------------------------------------------<br />";		
		if( $this->__isFolderOwnedByMe( $fileId ) ){
			echo "folder is mine.";
		}else{
			echo "folder is not mine.";
		};		
		
		echo  "<br />---------------------------------------------------------------<br />";
		echo '<pre>';print_r( $this->file_data  );echo '</pre>';
	}
	
	public function getTemplatesFromDrive(){ //http://localhost/pictographr/test/getTemplatesFromDrive?parentFolderId=0B1nKK3UKG5hjZkFSVjRNLTcxdDg
		
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
    
   echo '<pre>';print_r(  $folders );echo '</pre>';  exit;
		
		
	}
	

    	//$file['thumbnailLink'] = $item['thumbnailLink'];
    	//$file['width'] =  imagesx($im);
    	//$file['height'] = imagesy($im);	
	public function seedir(){
		
			?>
			
			<style>
			img{
				width: 200px;
			}
			</style>
			<?php
				$dir   = 'test/';
				$files = scandir($dir);
	
				foreach( $files as $idx => $file){
					
					?>
					
					<?php echo $file."<br />"; ?>
					
					<!-- <img src="https://pictographr.com/temp/pngs/<?php echo $file; ?>" /> -->
						 
					<?php 
				
				}
	}
	
	public function uploadnow(){
		
		 $destination_path = getcwd().DIRECTORY_SEPARATOR;
	 
	   $result = 0;
	 
	   $target_path = $destination_path . 'test/' . basename( $_FILES['myfile']['name']);
	 
	   if(@move_uploaded_file($_FILES['myfile']['tmp_name'], $target_path)) {
	      $result = 1;
	   }
	 
	   sleep(1);
	
			?>
	
			
				<script language="javascript" type="text/javascript">
				   window.top.app.stopUpload(<?php echo $result; ?>);
				</script>
	
			<?php 		
			
	}
	
	public function eventfarmtest(){
		
		?>
			<head>
				<script src="../js/lib/jquery/jquery.min.js"></script>
			</head>
			<style>
				#f1_upload_process{
				   z-index:100;
				   position:absolute;
				   visibility:hidden;
				   text-align:center;
				   width:400px;
				   margin:0px;
				   padding:0px;
				   background-color:#fff;
				   border:1px solid #ccc;
				}
				 
				form{
				   text-align:center;
				   width:390px;
				   margin:0px;
				   padding:5px;
				   background-color:#fff;
				   border:1px solid #ccc;
				 
				}	
			</style>
			
			
			<body>
			<p id="f1_upload_process">Loading...<br/><img src="../img/loader.gif" /></p>
			<p id="result"></p>
			<form action="uploadnow" method="post" enctype="multipart/form-data" target="upload_target" onsubmit="app.startUpload();" >
			    File: <input id="myfile" name="myfile" type="file" />
			          <input type="submit" name="submitBtn" value="Upload" />
			</form>
			 
			<iframe id="upload_target" name="upload_target" src="" style="width:500;height:400;border:1px solid #fff;"></iframe>    
	
			<script>
	
					
				var app = {
					init: function() {
						
						console.log('s');
							
						$('#myfile').bind('change', function() {
							console.log('test');
						  alert(this.files[0].size);
						
						});							
					},
					stopUpload: function(success) {
			      var result = '';
			      if (success == 1){
			         document.getElementById('result').innerHTML =
			           '<span class="msg">The file was uploaded successfully!<\/span><br/><br/>';
			      }
			      else {
			         document.getElementById('result').innerHTML = 
			           '<span class="emsg">There was an error during file upload!<\/span><br/><br/>';
			      }
			      document.getElementById('f1_upload_process').style.visibility = 'hidden';
			      return true;  						
					},
					startUpload: function() {
				    document.getElementById('f1_upload_process').style.visibility = 'visible';
				    return true;						
					},
					
				}
				
				app.init();	    
	
	
			</script>	             
			</body>
	
	
		<?php 
	}
	

}


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
?>


