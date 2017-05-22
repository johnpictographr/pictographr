<?php
/**
* See SchoologyApi.class.php for the structure of this class.
* You can modify the class below to use the same database used in
* your application, or to store oauth credentials in a completely
* different datastore.
*
* This example class uses the PHP PDO class to interact with a
* MySQL table with the given structure:
*
*  CREATE TABLE  `oauth_tokens` (
*    `uid` int(10) unsigned NOT NULL,
*    `token_key` varchar(64) CHARACTER SET utf8 NOT NULL,
*    `token_secret` varchar(64) CHARACTER SET utf8 NOT NULL,
*    `token_is_access` tinyint(3) unsigned NOT NULL,
*    PRIMARY KEY (`uid`)
*  ) DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
*
*/
class App_OauthStorage implements SchoologyApi_OauthStorage
{
  private $db;
 
  // Constructor
  public function __construct($db)
  {
  	
  	date_default_timezone_set('America/Los_Angeles');
		
    $this->db = $db;
 
    // Test query
    $query = $this->db->prepare("SELECT 1=1");
    $query_status = $query->execute();
    if(!$query_status || $query->fetchColumn() != 1){
      throw new Exception('The database did not respond as expected. Please check your database and try again.');
    }
  }
  

  public function getAllUsers(){
    $query = $this->db->prepare("SELECT * FROM schoology_oauth_tokens");
    return $query->fetch(PDO::FETCH_ASSOC);
  }
 
 
  // Retrieve access tokens for a given user ID
  public function getAccessTokens($uid){
    // Check to see if we have oauth tokens for this user
    $query = $this->db->prepare("SELECT uid, token_key, token_secret FROM schoology_oauth_tokens WHERE uid = :uid AND token_is_access = 1 LIMIT 1");
    $query->execute(array(':uid' => $uid));
    return $query->fetch(PDO::FETCH_ASSOC);
  }
 
  // Store request tokens for a given user ID
  public function saveRequestTokens($uid, $token_key, $token_secret){
    $query = $this->db->prepare("REPLACE INTO schoology_oauth_tokens (uid, token_key, token_secret, token_is_access, created) VALUES (:uid, :key, :secret, 0, now())");
    $query->execute(array(
              ':uid' => $uid,
              ':key' => $token_key,
              ':secret' => $token_secret,
    ));
  }
 
  // Get request tokens for a given ID
  public function getRequestTokens($uid){
    $query = $this->db->prepare("SELECT uid, token_key, token_secret FROM schoology_oauth_tokens WHERE uid = :uid AND token_is_access = 0");
    $query->execute(array(':uid' => $uid));
    return $query->fetch(PDO::FETCH_ASSOC);
  }
 
  // Replace request tokens with authorized access tokens for a given ID
  public function requestToAccessTokens($uid, $token_key, $token_secret){
    $query = $this->db->prepare("UPDATE schoology_oauth_tokens SET token_key = :key, token_secret = :secret, token_is_access = 1, updated = now() WHERE uid = :uid");
    $query->execute(array(
              ':key' => $token_key,
              ':secret' => $token_secret,
              ':uid' => $uid,
    ));
  }
 
  // Revoke tokens for a specific user
  public function revokeAccessTokens($uid){
    $query = $this->db->prepare("DELETE FROM schoology_oauth_tokens WHERE uid = :uid");
    $query->execute(array(
      ':uid' => $uid,
    ));
  }
}