<style>
	.oh,.ot,.tt{float:left;padding:0 2% 2% 0;width:48%}.ot{width:31%}.tt{width:65%}.cl{clear:both}
	input{
		width: 400;
		height: 50px;
		padding: 10px;	
	}
	iframe{
		width: 1100px;
		height: 400px;	
	}
</style>
<div >
	<div  class="tt">
		<form  id="parseForm" action="writeBackgrounds.php?" method="GET"  target="my_iframe">
			<input  id="url" name="url"/ value=""><br />
			<input  id="tag" name="tag" value="paper"/>
			<input type="submit" />
		</form>
	</div>
	<div class="ot" >
		<div  id="past" >
		</div>
	</div>
</div>
<iframe name="my_iframe" src=""></iframe>
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
<script>
$('#tag').on('blur', function() {
	$('#url').val("http://subtlepatterns.com/?s=" + $(this).val());
})
$('#parseForm').on('submit',
	function() {
		$('#past').append('\
			<div>' + $('#tag').val() + '</div>\
		');
	}
)
</script>
