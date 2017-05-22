	;
$(document).ready(function($) {
	
	var doWhenReady = function( condition, callback, fromWhere ){
				if( !condition() ){
					setTimeout(function(){
						doWhenReady(condition, callback);
						console.log('... waiting for ready for');
					}, 500);
				}else{
				  callback();
				};
	}

	var popWindow;
	
	var popupwindow = function(url, title, w, h) {
		var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
		
		width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		
		var left = ((width / 2) - (w / 2)) + dualScreenLeft;
		var top = ((height / 2) - (h / 2)) + dualScreenTop;
		popWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
		
		// Puts focus on the popWindow
		if (window.focus) {
			if(typeof(popWindow)!='undefined') popWindow.focus();
		}
	};
	
	var closepopup = function (){
    if( typeof(popWindow ) != 'undefined' && popWindow.closed == false){
       popWindow.close();
    }
	}
	 
  $( window ).unload(function() {
	  closepopup();
	});
  
	$('.swiper-container').on('click', '.img-responsive', function() {
		popupwindow( $(this).attr('short-url'), 'Pictographr', 700, 710);
	});
                         	
	var campaigns = {
		'bay':{
			'short-url': 'http://goo.gl/PkImKC',
			'file_image_fileId': '0B5ptY5tUIebjWTRzQzFvek9vWTA'
		},
		'jfk':{
			'short-url': 'http://goo.gl/5hwfTq',
			'file_image_fileId': '0B5ptY5tUIebjLUFVaUFER3U5LVk'
		},
		'jeb':{
			'short-url': 'http://goo.gl/Niz45U',
			'file_image_fileId': '0B5ptY5tUIebjZ3g0OTVNd3d2UWM'
		},
		'clinton':{			
			'short-url': 'http://goo.gl/ul23SX',
			'file_image_fileId': '0B5ptY5tUIebjc3BkVWhOMHhPSW8'
		},
		'Flyby':{
			'short-url': 'http://goo.gl/gu4nWC',
			'file_image_fileId': '0B5ptY5tUIebjekIwdFY2akYwVkU'
		},
		'Perry':{
			'short-url': 'http://goo.gl/9uuDBe',
			'file_image_fileId': '0B5ptY5tUIebjRmx0ZWRvUjZvRm8'
		},
		'Antman':{
			'short-url': 'http://goo.gl/2nArjG',
			'file_image_fileId': '0B5ptY5tUIebjX3NVMmQ0cG9oUGM'
		}
	};
	var carouselImages = 0;
	for( var campaign in campaigns){
		var shortUrl = campaigns[campaign]['short-url'];	
		var file_image_fileId = campaigns[campaign]['file_image_fileId'];	
		$('.swiper-wrapper').append('\
	     <div class="swiper-slide">\
	     		<div  class="img-responsive" short-url="' + shortUrl + '"   style="background-image: url(http://pictographr.com/image/streamDriveImage?google_id=105870981217629422585&fileId=' + file_image_fileId + '&max_width=400)"  >\
	     		</div>\
	     </div>\
		');
		var img = new Image();
		img.onload = function() {
		    carouselImages--;
		}
		img.src = 'http://pictographr.com/image/streamDriveImage?google_id=105870981217629422585&fileId=' + file_image_fileId + '&max_width=400';
		if (img.complete) img.onload();
		carouselImages++;
	}
	
  var nrOfImages = $("img.wow").length;
  $("img.wow").each( function() {
	  $(this).load(function() {
			console.log( $(this).attr('src') + '************************nrOfImages - ' + nrOfImages);
			nrOfImages--;
	  });
  });
  
  doWhenReady( function() {
	  	return carouselImages == 0 && nrOfImages == 0;
	  },
	  function() {
	  	$('#load-screen').hide();
	  }
  );

  // Scroll Up
  $('.scrollup').click(function(){
      $("html, body").animate({ scrollTop: 0 }, 1200, 'easeInOutExpo');
      return false;
  });
  
  // Animation on Scroll
  var wow = new WOW({
      boxClass:     'wow',      // animated element css class (default is wow)
      animateClass: 'animated', // animation css class (default is animated)
      offset:       0,          // distance to the element when triggering the animation (default is 0)
      mobile:       false,       // trigger animations on mobile devices (default is true)
      live:         false        // act on asynchronously loaded content (default is true)
  });
  
  wow.init();

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

	$('#leads input[type=submit]').click(	function(event) {
			event.preventDefault();
			var data = {};
			$('#leads input:not([type=submit]').each(function() {
				data[$(this).attr('id')] = $(this).val();
			})
			
			ajax('app/grableads', data, 'post',  function( response) {
				console.log(JSON.stringify( response   , null, 2 ));
				alert('Thank you.');
			})
			
		});

  // Sticky Navabr
  $("header").before($(".top-bar").clone().addClass("slidedown"));
  $(window).on("scroll", function () {
  		closepopup();
     $("body").toggleClass("slide-menu", ($(window).scrollTop() > 600));
  });
           
  var mySwiper = $('.swiper-container').swiper({
     mode:'horizontal',
     loop: true,
     speed: 950,
     effect: 'coverflow',
     slidesPerView:  getSlide(),
     grabCursor: true,
     nextButton: '.arrow-right',
     prevButton: '.arrow-left',
     coverflow: {
          rotate: -30,
          stretch: 10,
          depth: 120,
          modifier: 1,
          slideShadows: false
      }
     
  });    
  
  // Set number of slide based on device width
  $(window).resize(function() {
       var wW = $(window).width();
       if (wW < 601) {
           mySwiper.params.slidesPerView = 1;
       } else {
           mySwiper.params.slidesPerView = 3;
       }
       //mySwiper.reInit();
  });
  
  // One Page Navigation	   
  $.scrollIt({	   
    scrollTime: 1400,
    easing: 'easeInOutExpo',
    topOffset: -20,
  });

function getSlide() {
var wW = $(window).width();
if (wW < 601) {
    return 1;
}
return 3;
}
    
});

      