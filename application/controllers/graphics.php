<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Graphics extends Base_Controller {
	function __construct() {
		parent::__construct();
		
		$this->_data = new stdClass;
		
		$this->_data->title = "Prospace";
		$this->_data->company_name = "Prospace LLC";
		$this->_data->GA_account = "UA-XXXXX-X";

		$this->_data->header = "header/header";
		$this->_data->nav = "nav/nav";
		$this->_data->company = "footer/company";			
		$this->_data->footer = "footer/footer";
		
		$this->_data->loggedIn = false;
		$this->_data->body = "body/graphics/view";		
		
	}	
	public function index(){
		
    $this->_data->upload_data = "";
    
		$this->load->view('index', $this->_data);		
	}
	
	public function upload() {
		
		$form = Models_Form::factory('graphics_thumbs', $this->input->post());
		
		if ( $form->save() && $form->deploy_to_S3() ) {
			
			echo '
			SUCCESS!
			<script type="text/javascript" language="Javascript">
				parent.app.methods.refreshTemplateThumb();
			</script>
			
			';

		}
	}

}
