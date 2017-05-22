$(document).ready(function($) {
	
	var getScreenDim = function() {
		  var myWidth = 0, myHeight = 0;
		  if( typeof( window.innerWidth ) == 'number' ) {
		    //Non-IE
		    myWidth = window.innerWidth;
		    myHeight = window.innerHeight;
		  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		    //IE 6+ in 'standards compliant mode'
		    myWidth = document.documentElement.clientWidth;
		    myHeight = document.documentElement.clientHeight;
		  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		    //IE 4 compatible
		    myWidth = document.body.clientWidth;
		    myHeight = document.body.clientHeight;
		  }
		  return {
		  	width: myWidth,
		  	height: myHeight 
		  };
	};
	
	var popupwindow = function(url, title, w, h, l, t) {
			var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
			var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
			
			width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
			height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
			
			var left = ( typeof( l ) != 'undefined' ? l: ((width / 2) - (w / 2)) + dualScreenLeft);
			var top = ( typeof( t ) != 'undefined' ? t: ((height / 2) - (h / 2)) + dualScreenTop);
			var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
			
			// Puts focus on the newWindow
			if (window.focus) {
				if(typeof(newWindow)!='undefined') newWindow.focus();
			}
	};
		
	var ajax = function(	url, arrDataObj, type, callback	)	{
			$.ajax({
				url: url + '?v=' + Math.random(),
				type:	type,
		    data: {
		        arrData : arrDataObj
		    },
				dataType:'json',
				success: function(data){
					callback(data);
				},
				error:	function(data){
					callback(data);
				},
				async:true
			});
	}
	
	var escapeRegExp = function(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}
	
	var replaceAll = function(string, find, replace) {
	  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
	}
	
	$('#description').bind('click',  function() {
		$(this).val('');
	})
	
	$('#company').bind('click',  function() {
		$(this).val('');
	})
			
	$('#contact').bind('click',  function() {
		$(this).val('');
	})
			
	$('#twitter_username').bind('click',  function() {
		
		$(this).val('');
		
	}).bind('blur',  function() {
		
		$(this).val(replaceAll( $(this).val(), 'http://twitter.com/', '' ) );
		$(this).val(replaceAll( $(this).val(), 'https://twitter.com/', '' ) );
		$(this).val(replaceAll( $(this).val(), 'http://www.twitter.com/', '' ) );
		$(this).val(replaceAll( $(this).val(), 'https://www.twitter.com/', '' ) );
		
	});
	
	$('form#leads input[type=submit]').click(	function(event) {
		
			event.preventDefault();

			var data = {};
			$('form#leads input:not([type=submit]').each(function() {
				data[$(this).attr('id')] = $(this).val();
			})
			
			data['description'] = $('#description').val();
			
			ajax('../app/market_leads', data, 'post',  function( response) {
				
				console.log(JSON.stringify(    response  , null, 2 ));

				var url = 'http://twitter.com/share?url=?&text=' + response.tweeted;
				$('#tweeted').val(response.tweeted);
				$('#emailed').val(response.emailed);
				$('#tweet_button').attr('href', url);
				$('#shortUrl').attr('href', response.shortUrl);
				$('#emailed_shortUrl').attr('href', response.emailed_shortUrl);
				
				var left = undefined,
						top = 90;
				
				//popupwindow(url, "_blank", getScreenDim().width - 300, getScreenDim().height - 70, left, top);

			})
			
	});

});

      