<!doctype html>
<html>
<?php $this->load->view($header); ?>
<body>
	<?php if( $loggedIn){};?>
	
	<div  class='container' >
			<?php $this->load->view($body); ?>
	</div>
	
	<?php $this->load->view($company); ?>
	<?php $this->load->view($footer); ?>
</body>
</html>