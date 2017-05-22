<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Pictographr</title>
				<link rel="stylesheet" type="text/css" href="../../js/lib/bootstrap/bootstrap.min.css"/>
				<link rel="stylesheet" type="text/css" href="../plugin.css"/>
        <style>
        .hideThis{
        	display:none !important;	
        }
        #new_design{
					width: 67px;
					padding-top: 10px;
					background-repeat: no-repeat;
					height: 9px;
					padding-left: 23px;
					font-size: 12px;	
        }
        </style>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
				<script src="js/lib/bootstrap/bootstrap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.2/underscore-min.js"></script>
        <script src="https://d2l6uygi1pgnys.cloudfront.net/jsapi/2-0/hsp.js"></script>
        
        <script src="./asset/template.js"></script>
        <script src="./asset/app.js"></script>
				<script>
					window.userId   = '<?php echo $_REQUEST['i']?>';
					window.timestamp = '<?php echo $_REQUEST['ts']?>';
					window.token     = '<?php echo $_REQUEST['token']?>';
				</script>

		<?php 
		
		//	$secret = 'thisisthesecret';
		//	$user_id   = $_REQUEST['i'];
		//	$timestamp = $_REQUEST['ts'];
		//	$token     = $_REQUEST['token'];
		//	if (hash('sha512', $user_id . $timestamp . $secret) ==  $token){
		//	    echo "Successful login!";
		//	}
		//	echo hash('sha512', $user_id . $timestamp . $secret);
		
		?>
					
    </head>

    <body>
      <div class="hs_stream">

        <div class="hs_topBar">
            <div class="hs_topBarContent">
                <!--Right-Side Controls-->
                <ul class="hs_topBarControls">
                  <li class="hideThis hs_topBarControlsBtn" data-dropdown="WriteMessage" title="Write Message">
                      <span class="icon-app-dir x-compose"></span>
                  </li>
                  <li class="hideThis hs_topBarControlsBtn" data-dropdown="Search" title="Search">
                      <span class="icon-app-dir x-search"></span>
                  </li>
                  <li class="hideThis hs_topBarControlsBtn" data-dropdown="Settings" title="Settings">
                      <span class="icon-app-dir x-settings"></span>
                  </li>
                  <li class="hideThis hs_topBarControlsBtn" data-dropdown="MenuList" title="More">
                      <span class="icon-app-dir x-ellipsis"></span>
                  </li>
                  <li class="hs_topBarControlsBtn" title="New Design">
                    <span  id="new_design" class="icon-app-dir x-plus">New Design</span>
                  </li>
                </ul>

                <!--Left-Side Title-->
                <h1 class="hs_topBarTitle"></h1>
            </div>

            <!--Drop Downs-->
            <!--Write Message-->
            <div class="hideThis hs_topBarDropdown hs_dropdownWriteMessage" data-dropdown="WriteMessage" style="display: none;">
                <button class="hs_btnCtaSml hs_btnTypeSubmit _message_send">Send</button>
                <div class="hs_searchWrapper">
                    <label class="hs_isVisuallyHidden" for="hs_writeMessageInputExample">Search:</label>
                    <input id="hs_writeMessageInputExample" class="_message_text" type="text" placeholder="write something...">
                </div>
            </div>

            <!--Search-->
            <div class="hideThis hs_topBarDropdown hs_dropdownSearch" data-dropdown="Search">
                <button class="hs_btnCtaSml hs_btnTypeSubmit _user_search">Search</button>
                <div class="hs_searchWrapper">
                    <label class="hs_isVisuallyHidden" for="hs_searchInputExample">Search:</label>
                    <input id="hs_searchInputExample" class="_user_text" type="text" placeholder="e.g. Hootsuite">
                </div>
            </div>

            <div class="hideThis hs_topBarDropdown hs_dropdownSettings" data-dropdown="Settings">
                <li class="hs_dropdownMenuListItem"><a href="#">Setting 1</a></li>
                <li class="hs_dropdownMenuListItem"><a href="#">Setting 2</a></li>
                <li class="hs_dropdownMenuListItem"><a href="#">Setting 3</a></li>
            </div>

            <!--Menu List-->
            <ul class="hs_topBarDropdown hs_dropdownMenuList" data-dropdown="MenuList">
                <li class="hs_dropdownMenuListItem _showModal"><a href="#">Launch modal</a></li>
                <li class="hs_dropdownMenuListItem _writeMessage"><a href="#">Write Message</a></li>
                <li class="hs_dropdownMenuListItem "><a target="_blank" href="https://pictographr.com/app?state=%7B%22newSerial%22:%20%220.6974779665800683%22,%20%22action%22:%22create%22,%22userId%22:%22%22%7D">Create Design</a></li>
            </ul>
        </div>

        <div  id="main_container" class="hs_message row">
        </div>
    </body>
</html>