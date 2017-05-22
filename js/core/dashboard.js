'use strict';

var cd = function() {
	console.log(JSON.stringify(  app.data    , null, 2 ));
}

var cp = function() {
	console.log(JSON.stringify(  app.post    , null, 2 ));
}
	
var App = function(){

  return function() {
		
		var app = this;
		
		this.init = function()	{
			var that = this;
			app.render.get();	

		};				
		
		this.render = {
			
			get: function() {
				
				app.post.clear_postobj();
				app.post.now( this.fill );
				
			},
			
			fill: function( data ) {
				
				app.data = data;
				app.render.paint();
				app.bind.init();
			},

			paint: function() {
				
				var sets = app.data,
						html = '';
				
				for( var set_name in sets){
					var set = sets[set_name];
					html += '\
					  <div class="row col-md-12">\
					  	<div>\
					  		<h2>' + set_name + '</h2>\
					  	</div>\
					  	<div>\
						';
					for( var idx in set){
						var template = set[idx];
						html += '\
						  <img class="launchImg" template_id=' + template['id'] + ' src="../templates/' + template['id'] + '.png">\
						';						
					}
					html += '\
					  	</div>\
					  </div>\
						';
					$('#main').append(html);
					html = '';
				}
			}
		}
		
		this.bind = {
			
			init: function() {
				this.launch();
			},
			
			launch: function() {
				$('.launchImg').unbind('click').bind('click', function() {
					
					var template_id = $(this).attr('template_id'),
							url = '../app?state=%7B"template_id":%5B"' + template_id + '"%5D,"action":"open","userId":"' + tools.cookies.getCookie('google_id') + '"%7D';
					
					window.open( url, '_blank');
					
				});
			}
			
		};
				
		this.post = {
			
			obj: {},
			
			clear_postobj: function() {
			
				app.post.obj = {};
				
			},
			
			now: function( callback ) {
				
				console.log('postObj: ' + JSON.stringify( app.post.obj    , null, 2 ));
				
				var that = this,
						url = '../json/templates/templates.js?version=' + version;
				
				tools.ajax(url, app.post.obj, 'get', function( data) {
						callback(data);
				})
						
			}
			
		};
		
	};
			
}();

var	p	=	App.prototype;

var app = new App();
app.data = {};
app.init();