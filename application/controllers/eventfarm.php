<?php class Eventfarm {
		
	public function __construct() {
		$this->dir = 'eventfarm/';
	}

	public function seedir(){
				
				echo "Content of Directory: <br />";

				$files = scandir($this->dir);
	
				foreach( $files as $idx => $file){
					
					echo $file."<br />"; 
				
				}
	}
	
	public function upload(){
		
		 $destination_path = getcwd().DIRECTORY_SEPARATOR;
	 
	   $success = 0;
	 
	   $target_path = $destination_path . $this->dir . basename( $_FILES['myfile']['name']);
	 
	   if(@move_uploaded_file($_FILES['myfile']['tmp_name'], $target_path)) {
	      $success = 1;
	   }
	 
	   sleep(1);
	
			?>
	
				<script language="javascript" type="text/javascript">
				   window.top.app.uploaded(<?php echo $success; ?>);
				</script>
	
			<?php 		
			
	}
	
	public function form(){
		
		?>
			<head>
				<script src="../js/lib/jquery/jquery.min.js"></script>
			</head>
			<style>
				.oh,.ot,.tt{float:left;padding:0 2% 2% 0;width:48%}.ot{width:31%}.tt{width:65%}.cl{clear:both}
				#loader{
				   visibility:hidden;
				}
				form{
				   text-align:center;
				   width:390px;
				   padding:5px;
				   border:1px solid #ccc;
				 
				}	
			</style>
			
			
			<body>

			<div>
				<div  class="oh">
					
					<form  id="myform" action="upload" method="post" enctype="multipart/form-data" target="upload_iframe" >
					    File: <input id="myfile" name="myfile" type="file" />
					          <input type="submit" name="submitBtn" value="Upload" />
					</form>
					<span id="result"></span><img id="loader" src="../img/loader.gif" />
				</div>
				<div  class="oh">
					<iframe id="dir_iframe" name="dir_iframe" src="seedir" style="width:100%;height:600;border:1px"></iframe>
				</div>
				
			</div>
			<iframe id="upload_iframe" name="upload_iframe" src="" style="width:0;height:0;border:0px"></iframe>    
	
			<script>
	
					
				var app = {
					
					init: function() {
						this.bind.submit();
						this.bind.uploadSelecter();
					},			
							
					max: 300,
					
					fileok: false,
					
					filesize: 0,
					
					message: function( content) {
						document.getElementById('result').innerHTML =
			           '<span class="msg">' + content + '<\/span><br/><br/>';
					},
					
					loader:{
						on: function() {
							document.getElementById('loader').style.visibility = 'visible';
						},
						off: function() {
							document.getElementById('loader').style.visibility = 'hidden';
						}
					},

					
					bind: {
						submit: function() {
							$('#myform').bind('submit',  function(event) {
								
					    	
					    	setTimeout(function(){
					    		$('#myfile').val('');
					    	}, 1000);
					    	
					    	if( $('#myfile').val() == '' )	{
					    		app.message('Please find a file to upload.');
					    		return false;	
					    	}				
								
								
								var that = this;
								if( app.fileok ){
									app.loader.on();
									document.getElementById('loader').style.visibility = 'visible';
						    	app.fileok = false;
	
						    	
									return true;
									
								}else{
									
									app.message('THE FILE SIZE IS ' +  app.filesize + 'K.  I SAID IT WAS TOO LARGE!');
									$('#myfile').val('');
									return false;
									
								};
						    
						    
							});
						},
						uploadSelecter: function() {
	
							$('#myfile').bind('change', function() {
								app.fileok = false;
							  app.filesize = parseInt(this.files[0].size/ 1024) ;
							  if( app.filesize > app.max){
							  	app.message('The file size is ' +  app.filesize + 'KB.  That is too large!');
							  }else{
							  	app.message('The file size is ' +  app.filesize + 'KB.  Go ahead and upload.');
							  	app.fileok = true;
							  };
							
							});											
						}
						
					},
					 
					uploaded: function( success ) {
						
			      var result = '';
			      
			      if (success == 1){
			      	
			         app.message('The file was uploaded successfully!');
			         
			         document.getElementById('dir_iframe').contentWindow.location.reload();
			      }
			      else {
			      	
			      	app.message('There was an error during file upload!');
			      	
			      }
			      
			      app.loader.off();
			      						
					},
					
				}
				
				app.init();	    
	
	
			</script>	             
			</body>
	
	
		<?php 
	}
	
}

?>


