<!DOCTYPE	html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<title>Pictographr</title>
	
<link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-touch-icon-57x57.png?v=E669WPdJYb">
<link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-touch-icon-60x60.png?v=E669WPdJYb">
<link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-touch-icon-72x72.png?v=E669WPdJYb">
<link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-touch-icon-76x76.png?v=E669WPdJYb">
<link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-touch-icon-114x114.png?v=E669WPdJYb">
<link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-touch-icon-120x120.png?v=E669WPdJYb">
<link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-touch-icon-144x144.png?v=E669WPdJYb">
<link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-touch-icon-152x152.png?v=E669WPdJYb">
<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon-180x180.png?v=E669WPdJYb">
<link rel="icon" type="image/png" href="/favicons/favicon-32x32.png?v=E669WPdJYb" sizes="32x32">
<link rel="icon" type="image/png" href="/favicons/android-chrome-192x192.png?v=E669WPdJYb" sizes="192x192">
<link rel="icon" type="image/png" href="/favicons/favicon-96x96.png?v=E669WPdJYb" sizes="96x96">
<link rel="icon" type="image/png" href="/favicons/favicon-16x16.png?v=E669WPdJYb" sizes="16x16">
<link rel="manifest" href="/favicons/manifest.json?v=E669WPdJYb">
<link rel="mask-icon" href="/favicons/safari-pinned-tab.svg?v=E669WPdJYb" color="#5bbad5">
<link rel="shortcut icon" href="/favicons/favicon.ico?v=E669WPdJYb">
<meta name="apple-mobile-web-app-title" content="Pictographr">
<meta name="application-name" content="Pictographr">
<meta name="msapplication-TileColor" content="#da532c">
<meta name="msapplication-TileImage" content="/favicons/mstile-144x144.png?v=E669WPdJYb">
<meta name="msapplication-config" content="/favicons/browserconfig.xml?v=E669WPdJYb">
<meta name="theme-color" content="#ffffff">

	
	

<link rel="stylesheet" href="js/lib/wysiwyg/custom.css?v=<?php echo $version; ?>">
<link rel="stylesheet" type="text/css"  href="js/lib/toast/jquery.toast.min.css" rel="stylesheet">
<?php  if( $_SERVER['HTTP_HOST'] == 'localhost' ){ $this->load->view('localCSS_view.php'); }else{ 	$this->load->view('remoteCSS_view.php'); } ?>
<link rel="stylesheet" type="text/css" href="js/lib/jcrop/jcrop.css"/>
<!-- https://cdnjs.cloudflare.com/ajax/libs/jquery-jcrop/0.9.12/css/jquery.Jcrop.css  -->
<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto" media="all">
<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=RobotoDraft:regular,bold,italic,thin,light,bolditalic,black,medium&lang=en" media="all">

	<link href="https://cdnjs.cloudflare.com/ajax/libs/winjs/4.4.0/css/ui-light.css" rel="stylesheet" />
	<script src="https://cdnjs.cloudflare.com/ajax/libs/winjs/4.4.0/js/base.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/winjs/4.4.0/js/ui.js"></script>

</head>
<body>
</body>
</html>

<?php  	if( $_SERVER['HTTP_HOST'] == 'localhost' ){ 	$this->load->view('localJS_view.php'); 	}else{ 	$this->load->view('remoteJS_view.php');	} ?>


<script	src="js/lib/jcrop/jcrop.js"></script>
<!--  https://cdnjs.cloudflare.com/ajax/libs/jquery-jcrop/0.9.12/js/jquery.Jcrop.min.js
<script src="//cdn.jsdelivr.net/lining.js/0.3.2/lining.min.js"></script>
<script	src="js/lib/lineWrapDetector/lineWrapDetector.js"></script>
--><script	src="js/lib/lining/lining.js"></script>

<script	src="js/core/tools.js?v=<?php echo $version; ?>"></script>
<script	src="js/lib/is/is.min.js"></script>
<script src="js/lib/toast/jquery.toast.min.js"></script>
<script	src="js/lib/woodmark/woodmark.js"></script>
<script	src="js/lib/wysiwyg/wysiwyg.js"></script>
<script	src="js/lib/html2canvas/html2canvas_modified.js?v=<?php echo $version; ?>"></script>
<script	src="js/lib/stepper/jquery.input-stepper_modified.js"></script>
<script src="js/lib/handsontable/handsontable_custom.js?v=<?php echo $version; ?>"></script>
<script src="js/lib/payments/jquery.payment.js"></script>
<script>
	var version = '<?php echo $version; ?>',
			acceptTerms = <?php echo $acceptTerms; ?>,
			showAddOnDocInstructions = <?php echo ( isset($showAddOnDocInstructions) ? $showAddOnDocInstructions: 'undefined' ); ?>,
			base_url = '<?php echo base_url(); ?>',
			serverhost = '<?php echo $_SERVER['HTTP_HOST']; ?>',
			fileId = '<?php echo $fileId; ?>',
			newSerial = '<?php echo ( isset($newSerial) ? $newSerial:'' ); ?>',
			google_id = '<?php echo $google_id; ?>',
			pow = <?php echo $pow; ?>,
			developerKey = '<?php echo $developerKey; ?>',
    	clientId = '<?php echo $clientId; ?>',
    	pictoFolderId = '<?php echo ( isset($pictoFolderId) ? $pictoFolderId: '' ); ?>',
    	isTemplate = <?php echo ( isset($isTemplate) ? 'true': 'false' ); ?>,
    	template_id = <?php echo ( isset($template_id) ? $template_id: 'undefined' ); ?>,
    	orgAcceptTerms = <?php echo ( isset($orgAcceptTerms) ? $orgAcceptTerms: 'undefined' ); ?>,
    	hasDomain = <?php echo ( isset($hasDomain) ? $hasDomain: 'undefined' ); ?>,
    	accountActive = <?php echo $accountActive; ?>,
    	subscription_interval = <?php echo $subscription_interval; ?>,
    	plan = '<?php echo $plan; ?>',
    	howManyDaysLeft = <?php echo $howManyDaysLeft; ?>,
    	status_id = <?php echo $status_id; ?>,
    	market_id = <?php echo $market_id; ?>,
    	message_id = <?php echo $message_id; ?>,
    	isOrgAdmin = <?php echo $isOrgAdmin; ?>,
    	isInOrganization = <?php echo $isInOrganization; ?>,
    	showPromoForm = <?php echo ( $showPromoForm == 1 ? 'true': 'false' ); ?>,
    	isSocial = <?php echo ( $isSocial == 1 ? 'true': 'false' ); ?>,
  		scope = ['https://www.googleapis.com/auth/photos'],
  		pickerApiLoaded = false,
  		isNewPictographReload = false,
  		saidConnectionOk = true,
  		oauthToken;
  		
	 window.bugmuncher_options = {
	    label_text: "Report Bugs",
	    background_color: "#4285f4",
			prefill_email: '<?php echo $user_email; ?>',
	    api_key: "345c82ab778fce6ea598"
	  };
	  
</script>
<script	type="text/javascript" language="Javascript" src="js/lib/dropzone/dropzone.js"></script>
<script src="js/lib/offline/offline_adapted.js"></script>
<script	src="js/core/core.js?v=<?php echo $version; ?>"></script>
<script	src="js/core/edit.js?v=<?php echo $version; ?>"></script>
<script	src="js/core/common.js?v=<?php echo $version; ?>"></script>
<script	src="js/core/organization.js?v=<?php echo $version; ?>"></script>
<script	src="js/core/iepatch.js?v=<?php echo $version; ?>"></script>
<script	src="js/core/uwp.js?v=<?php echo $version; ?>"></script>
<?php 

if( $isSocial == 1){
	?>
	<script	src="js/core/share.js?v=<?php echo $version; ?>"></script>
	<?php 
};

?>



<script	src="js/core/debug.js?v=<?php echo $version; ?>"></script>
<!-- <script type="text/javascript" src="http://feather.aviary.com/imaging/v2/editor.js"></script> -->
<script	src="js/lib/aviary/aviary.js"></script>

<?php
if( $_SERVER['HTTP_HOST'] == 'localhost' ){ 	
?>

	<script type="text/javascript" src="https://www.google.com/jsapi"></script>
	<script type="text/javascript">
		google.load('visualization', '1', {packages: ['corechart', 'line','timeline']});
	</script>

	<script>
		app.init();
	</script>
 <script	src="js/core/admin.js?v=<?php echo $version; ?>"></script>
<?php	
} else {
?>
	<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
  <script type="text/javascript">
    function onApiLoad() {
    	gapi.load('auth', {'callback': function() {
    		google.charts.load('current', {'packages':['corechart']});
    		app.init();
    		
    	}});
    	gapi.load('picker', {'callback': function() {
    		pickerApiLoaded = true;
    	}});
    }
	</script>	
	<script type="text/javascript" src="https://apis.google.com/js/api.js?onload=onApiLoad"></script>

<?php	
} 
?>
<script type="text/javascript" src="https://js.stripe.com/v2/"></script>

