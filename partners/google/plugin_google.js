var nameOfThisFile = 'plugin_goggle.js';

var app = new App();


app.showClickToInstall = function() {
	
		$('body').find('#greet-container').remove();
	
		$('#main_container').append('\
			<div  id="greet-container"  class="block">\
				<div  id="carousel-gallery" class="owl-carousel owl-theme" >\
		        <div class="item"><img alt="" src="https://pictographr.com/img/showme.png"></div>\
		        <div class="item"><img alt="" src="https://pictographr.com/img/create2.png"></div>\
		        <div class="item"><img alt="" src="https://pictographr.com/img/design2.png"></div>\
		        <div class="item"><img alt="" src="https://pictographr.com/img/select2.png"></div>\
		        <div class="item"><img alt="" src="https://pictographr.com/img/insert2.png"></div>\
		    </div>\
				<div>\
					<img  id="logo" src="https://pictographr.com/favicons/apple-touch-icon-114x114.png">\
				</div>\
				<div>\
					Click below to get started.\
				</div>\
				<div>\
					<button id="get-started-button"  class="button action">Get Started!</button>\
				</div>\
			</div>\
		');

		tools.doWhenReady(
			function() {
				return $('#greet-container').length == 1;
			},
			function() {
				
				app.afterShowClickToInstall();

			},
			'method: showClickToInstall '
		);

};

