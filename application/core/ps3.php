<?php
get_instance()->load->helper('S3');

class PS3 extends S3 {
	public function __construct() {
		parent::__construct();
		
		$this->setAuth(
			$accessKey = "AKIAJ62XFSATMJCHJWCA", 
			$secretKey = "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"
		);
		
	}
	
	
	public function writeStringToFile( $input, $bucket, $uri){
		
		$this->putObject(
			$input, 
			$bucket, 
			$uri, 
			$acl = self::ACL_PRIVATE, 
			$metaHeaders = array(), 
			$requestHeaders = array(), 
			$storageClass = self::STORAGE_CLASS_STANDARD, 
			$serverSideEncryption = self::SSE_NONE);
		
	}
	
	public function deployFiles( $bucketName, $vanityUrl ) {
		
		// http://stackoverflow.com/questions/6105209/tutorial-for-php-amazon-simple-storage-service

		$filename = 'index.html';
		$fromPath = 'vanity_files/' . $filename;
		$toPath = $vanityUrl . '/' . $filename;
				
		$this->putObjectFile($fromPath, $bucketName, $toPath, S3::ACL_PUBLIC_READ);
		
		
		$filename = 'data.js';
		$fromPath = 'vanity_files/' . $filename;
		$toPath = $vanityUrl . '/' . $filename;
				
		$this->putObjectFile($fromPath, $bucketName, $toPath, S3::ACL_PUBLIC_READ);		
				
	}
	public function deployVanity( $bucketName, $vanityUrl ) {
		
		// http://stackoverflow.com/questions/6105209/tutorial-for-php-amazon-simple-storage-service

		$filename = 'index.html';
		$fromPath = 'vanity_files/' . $filename;
		$toPath = $vanityUrl . '/' . $filename;
				
		$this->putObjectFile($fromPath, $bucketName, $toPath, S3::ACL_PUBLIC_READ);
	}
	
	public function copyFile( $bucketName, $source, $target ) {
		
		$this->copyObject(
			$srcBucket = $bucketName, 
			$srcUri = $source, 
			$bucket = $bucketName, 
			$uri = $target, 
			$acl = S3::ACL_PUBLIC_READ, 
			$metaHeaders = array(), 
			$requestHeaders = array(), 
			$storageClass = S3::STORAGE_CLASS_STANDARD);


	}	
	
	public function deleteFile( $bucketName, $target ) {
		
		$this->deleteObject($bucketName, $target);


	}
	
	public function createUniqueFilename( $bucketName, $source ) {
		
		$sourceArray = explode(".", $source);
		
		$uniqueName = $sourceArray[0] . "_" . $this->generateRandomString() . "." . $sourceArray[1];
		
		$this->copyObject(
			$srcBucket = $bucketName, 
			$srcUri = $source, 
			$bucket = $bucketName, 
			$uri = $uniqueName, 
			$acl = S3::ACL_PUBLIC_READ, 
			$metaHeaders = array(), 
			$requestHeaders = array(), 
			$storageClass = S3::STORAGE_CLASS_STANDARD);
			
		$this->deleteObject($bucketName, $source);
		
		return $uniqueName;


	}
	
	private function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $randomString;
	}
			
}