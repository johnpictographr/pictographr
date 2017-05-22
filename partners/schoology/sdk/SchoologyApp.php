<?php
/* Sample Resource App
 * 
 * Getting started:
 *  - Define DB_* CONSTANTS
 *  - Define SCHOOLOGY_* CONSTANTS
 * 
 *  - Include the SchoologyContentApi class
 *  - Include the App_OauthStorage class (see comments for CREATE SQL for the mysql oauth table store
 * 
 *  - @ schoology_login()
 *    Example: Authentication with SAML 2.0
 * 
 *  - @ schoology_import()
 *    Exmaple: Importing content into Schoology
 * 
 *  - @ schoology_get_sample_content
 *    Example: Get content; In this sample application, this function is responsible for getting our content data.
 */
define('DB_HOSTNAME', ''); // Database hostname
define('DB_USERNAME', ''); // Database username
define('DB_PASSWORD', ''); // Database password
define('DB_DATABASE', ''); // Database name

define('SCHOOLOGY_CONSUMER_KEY', '16c07c628c50c4c55712b531f4319c110573da541'); // Your apps schoology consumer key
define('SCHOOLOGY_CONSUMER_SECRET', '2c4a9e749804ee74bbccc6d56e2f1219'); // Your apps schoology consumer secret

require_once 'SchoologyContentApi.class.php';
require_once 'App_OauthStorage.class.php';

/**
 * Authentication with SAML 2.0
 */
function schoology_login() {
  if(!$_GET['login']) {
    return;
  }
  
  // Initialize the Schoology class
  $schoology = new SchoologyContentApi(SCHOOLOGY_CONSUMER_KEY, SCHOOLOGY_CONSUMER_SECRET);
  
  // Read the incoming login information.
  $login = $schoology->validateLogin();

  // If the last step failed, then either no information
  // was received or it was invalid.
  if(!$login){
    // Stop script execution
    print 'No login information was received. Try loading this application again from within Schoology.'; exit;
  }

  // If our session already has a stored ID but it's
  // different from what we received, restart the session.
  if(isset($_SESSION['schoology']['uid']) && $_SESSION['schoology']['uid'] != $login['uid']){
    session_destroy();
    session_start();
  }
  
  // The session might already be set if the user is accessing
  // this application again without logging out of Schoology.
  // Only set the session information if not already present
  if(!isset($_SESSION['schoology']['uid'])){
    $_SESSION['schoology'] = $login;
    $_SESSION['session_created'] = time();
  }
  
  $q_params = parse_url($_REQUEST['RelayState'], PHP_URL_QUERY);
  parse_str($q_params, $app_state);
  
  $_SESSION['app_state'] = array();
  foreach($app_state as $key => $param){
    $_SESSION['app_state'][$key] = $param;
  }
  
  header('Location: ' . $_REQUEST['RelayState']); exit;
}

/**
 * Import content into Schoology
 */
function schoology_import(SchoologyContentApi $schoology) {
  if(!$_GET['import']) {
    return;
  }
  
  $content = schoology_get_sample_content();
  $return_url = 'https://sample_content_app.subdomain.psmith.dev.schoologize.com/index.php';
  
  try {
    switch($_GET['import']) {
      case 'link':
        $import_id = $schoology->importLink($content['link']['title'], $content['link']['url']);
        $import_url = $schoology->buildImportUrl($import_id, $return_url);
        break;
      
      case 'embed':
        $import_id = $schoology->importLink($content['embed']['title'], $content['embed']['embed']);
        $import_url = $schoology->buildImportUrl($import_id, $return_url);
        break;

      case 'file':
        $import_id = $schoology->importFile($content['file']['filepath']);
        $import_url = $schoology->buildImportUrl($import_id, $return_url);
        break;

      case 'bulk':
        $body = array(
          'link' => array(
            array('title' => $content['link']['title'], 'url' => $content['link']['url']),
          ),

          'embed' => $embeds = array(
            array('title' => $content['embed']['title'], 'embed' => $content['embed']['embed']),
          ),

          'file-attachment' => array('id' => array(
            $schoology->apiFileUpload($content['file']['filepath']),
          )),
        );
        $result = $schoology->importBulk($body);

        $import_ids = array();
        foreach($result as $i) {
          $import_ids[] = $i->import_id;
        }
        $import_url = $schoology->buildImportUrl($import_ids, $return_url);
        break;
    }
    
  } catch (Exception $e) {
    print $e->getMessage(); exit;
  }
  
  // Redirct user to schoology import form
  header('Location: ' . $import_url); exit;    
}

/**
 * Sample content
 */
function schoology_get_sample_content() {
  $content = array();
  $content['link'] = array(
    'title' => 'Schoology Developers', 
    'url' => 'https://developers.schoology.com/'
  );
  $content['embed'] = array(
    'title' => 'Schoology Introduction', 
    'embed' => '<iframe width="560" height="315" src="//www.youtube.com/embed/uqc1xE2H9Wg" frameborder="0" allowfullscreen></iframe>'
  );
  $content['file'] = array(
    'filepath' => 'schoology-logo.gif'
  );
  return $content;
}