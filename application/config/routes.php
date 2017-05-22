<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	http://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There area two reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router what URI segments to use if those provided
| in the URL cannot be matched to a valid route.
|
*/


$route['default_controller'] = "landing";
$route['404_override'] = '';
$route['app'] = "app";
$route['app/(.*)'] = "app/$1";
$route['more/(.*)'] = "more/$1";
$route['image/(.*)'] = "image/$1";
$route['auth/(.*)'] = "auth/$1";
$route['landing/(.*)'] = "landing/$1";
$route['credit/(.*)'] = "credit/$1";
$route['payment/(.*)'] = "payment/$1";
$route['stripe/(.*)'] = "stripe/$1";
$route['test/(.*)'] = "test/$1";
$route['eventfarm/(.*)'] = "eventfarm/$1";
$route['admin/(.*)'] = "admin/$1";
$route['sites/(.*)'] = "sites/$1";
$route['organization/(.*)'] = "organization/$1";
 
$route['sectors/(.*)'] = "sectors/$1";
$route['collections/(.*)'] = "collections/$1";
$route['groups/(.*)'] = "groups/$1";
$route['sets/(.*)'] = "sets/$1";
$route['templates/(.*)'] = "templates/$1";

$route['faqs/(.*)'] = "faqs/$1";
$route['showmehows/(.*)'] = "showmehows/$1";
$route['terms/(.*)'] = "terms/$1";
$route['privacy/(.*)'] = "privacy/$1";

$route['(.*)'] = 'app/base/$1';



//if($handle = opendir(APPPATH.'/controllers')){
//	while(false !== ($controller = readdir($handle))){
//		if($controller != '.' && $controller != '..' && strstr($controller, '.') == '.php'){
//		$route[strstr($controller, '.', true)] = strstr($controller, '.', true);
//		$route[strstr($controller, '.', true).'/(:any)'] = strstr($controller, '.', true).'/$1';
//		}
//	}
//	closedir($handle);
//}
//

//$route['app/:any'] = "app/$1";
//$route['app'] = "app";

//$route['([a-zA-Z0-9_-]+)'] = 'app/$1';
//$route['app/(.*)/(.*)'] = "app/$1/$2";
//$route['app/(.*)/(.*)/(.*)'] = "app/$1/$2/$3";
//$route['app/(.*)/(.*)/(.*)/(.*)'] = "app/$1/$2/$3/$4";
//$route['app/(.*)/(.*)/(.*)/(.*)/(.*)'] = "app/$1/$2/$3/$4/$5";

// $route['(.*)'] = 'vanity/index/$1';



