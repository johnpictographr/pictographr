<?php 


	function generateRandomString($length = 10) {
			    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
			    $randomString = '';
			    for ($i = 0; $i < $length; $i++) {
			        $randomString .= $characters[rand(0, strlen($characters) - 1)];
			    }
			    return $randomString;
	}
	$version = generateRandomString(100);


?>

<style>
	#iframe_test{
		width: 830px;
		height: 573px;	
	}
</style>
<iframe id="iframe_test" src="http://localhost/pictographr/partners/schoology/home.php?v=<?php echo $version; ?>"></iframe>