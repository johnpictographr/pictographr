<?php 

    $JSON = json_encode($_POST['arrData']['data']);
		$file = '../uploads/output/icon.js'; 
		file_put_contents($file, $JSON);		
		echo $_POST['arrData']['data'];