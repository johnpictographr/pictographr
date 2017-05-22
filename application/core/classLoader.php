<?php
class ClassLoader {
	
	public static $caching 	= FALSE;
	
	protected static $_paths = array(
								 APPPATH
								,'application/core/'
								,'application/controllers/'
								,'application/libraries/'
								//,'google-api-php-client-new/src/'
						 );
																		 
	protected static $_files 			= array();
	protected static $_files_changed 	= FALSE;
	
	public static function auto_load($class) {
		$file = str_replace('_', '/', strtolower($class));

		if ($path = ClassLoader::find_file($file)) {

			require $path;
			return TRUE;
		}


		return FALSE;
	}
	
	public static function find_file($file, $ext = NULL) {
		if ($ext === NULL) {

			$ext = EXT;
		} elseif ($ext) {

			$ext = ".{$ext}";
		} else {

			$ext = '';
		}


		$path = $file.$ext;
		if (ClassLoader::$caching === TRUE AND isset(ClassLoader::$_files[$path])) {

			return ClassLoader::$_files[$path];
		}

		$found = FALSE;
		foreach (ClassLoader::$_paths as $dir) {
			
			if( $path =='db.php'){
				echo "<script>
					console.log('* php: " . $dir.$path . "');
				</script>";				
				
			};

			
			
			
			if (is_file($dir.$path)) {
				$found = $dir.$path;
				break;
			}
		}

		if (ClassLoader::$caching === TRUE) {

			ClassLoader::$_files[$path] = $found;


			ClassLoader::$_files_changed = TRUE;
		}
		
		return $found;
	}
}