app.methods.debug = function() {

	
/*
$('#shareButton').click();

$('#main').addClass('test');


$('#lock2Button').click();
$($('.elements')[0]).dblclick();
		
$('#gridButton').click();

*/ 

$('#debug').load('html/debug.html');
//$('#openOldFileButton').click();
//$($('.elements')[0]).find('.custom-handle.edit-handle').click();

//$($('.openPictographrTemplates')[0]).click();

return	
for(var key in app.stubs.views.elements ){
	var view = app.stubs.views.elements[key];
	if( typeof( view.textedit2String ) == 'function') view.textedit2String();
	if( typeof( view.adaptUL ) == 'function') view.adaptUL();
	view.adaptHeightToTextedit()
	view.renderPngFromTextedit('debug', function() {
		app.methods.progressBar.stop('rich text rendered');
	});

};	



	setTimeout(function(){

		
	}, 1000);

$('#imgButton').click();







	
		setTimeout(function(){
			
			$($('.elements')[0]).click();
			$($('.elements')[0]).find('.custom-handle.edit-handle').click();
			
			console.log('test');
			return;						

			var miliSecsTillNext = 500,
					numTimes = 5,
					what = function() {
						console.log('test');
					};
					
			tools.doIt( what, miliSecsTillNext, numTimes);		

			$('#color-sample').click();			
			

			
			var json = app.methods.generateJsonFromGraphicModel( 'columns', 100, 100, false, 'c680');
						app.methods.widgets.route(json);
							
						
							
						
						
						
			/* colorwrapper in chart */
			
			$($('.elements')[0]).dblclick();
			setTimeout(function(){
				$('.handsontable.ht_clone_left tr:nth-child(13) th').click();	
			}, 1000);										
											
		}, 2000);
}