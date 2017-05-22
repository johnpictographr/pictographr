'use strict';

var cc = function() {
	console.log(JSON.stringify(  app.records    , null, 2 ));
}

var cp = function() {
	console.log(JSON.stringify(  app.post    , null, 2 ));
}
	
var App = function(){

  return function() {
		
		var app = this;
		
		this.init = function()	{
			var that = this;
			app.render.get( function() {
				app.bind.add();
				app.bind.jsonButton();		
			});	

		};				
		
		this.render = {
			
			get: function(callback) {
				var that = this;
				
				app.post.url = 'get';
				app.post.clear_postobj();
				app.post.now();
				
				if( typeof( callback ) != 'undefined') callback();

			},
			
			fill_records_obj: function( obj, callback) {
				
				app.records = {};
				
				for( var idx in obj.results ){
					
					var record = obj.results[idx];
					
					app.records[record['id']] = jQuery.extend(true, {}, record);
					
				};
				
				
				this.paint.table(callback);
				
			},
			
			paint: {
				
				form: function() {
					
					$('#form-records').empty();
					
					var records = jQuery.extend(true, {}, app.records),
							formgroups = '';
									
					for( var id in records){
						var record = records[id];		
						for( var key in record){
							if(key == 'id' || key == 'count') continue;
							formgroups += '\
			          <div class="form-group">\
			            <label for="' + key + '" class="control-label">' + tools.capitalizeFirstLetter(key) + ':</label>\
			            <textarea id="' + key + '" class="form-control"></textarea>\
			          </div>\
							';
							
						}
						$('#form-records').append(formgroups);
						formgroups = '';
						break;	
					}

				},
				
				table: function(callback) {
					
					var records = jQuery.extend(true, {}, app.records),
							theads = ''; 
					
					for( var id in records){
						var record = records[id];
						for( var key in record){
							if( key == 'count') continue;
							theads += '<th>' + tools.capitalizeFirstLetter(key) + '</th>';
						}
						break;
					}
					
					$('#table-head').empty();
					
					$('#table-head').append('\
						 <tr>\
		            '+ theads + '\
		            <th class="text-right">Action</th>\
		        </tr>\
		      ');
		       
					$('#table-body').empty();
					
					var tds = '';
									
					for( var id in records){
						var record = records[id];		
						for( var key in record){
							if( key == 'count') continue;
							tds += '<td>' + record[key] + '</td>';
						}
						
						var expand = ( typeof( child_table ) != 'undefined' ? 
								'<a class="expand btn btn-warning" href="#"  record_id=' + record['id'] + '>' + tools.capitalizeFirstLetter(child_table) + '</a>' : 
								'' );
						
						var disable = ( typeof( records[id]['count'] ) != 'undefined' && records[id]['count'] != 0  ? 'disable': '' ); 
								
						$('#table-body').append('\
		            <tr>\
		            		' + tds + '\
		                <td class="text-right">\
		                		<a class="edit btn btn-info" href="#"  record_id=' + record['id'] + '>Edit</a>\
		                		' + expand + '\
		                		<a class="delete btn btn-danger ' + disable + '" href="#"  record_id=' + record['id'] + '>Delete</a>\
		                </td>\
		            </tr>\
						');
						
						tds = '';
					}
					
					callback();					
				},
				
			},
			
			clear_form: function() {
				
				$('#modal-wrapper').html( this.modalContent.update );
				
				this.paint.form();
				
				var records = jQuery.extend(true, {}, app.records); 
				
				for( var id in records){
					var record = records[id];
					for( var key in record){
						if(key == 'id') continue;
						$('#' + key ).val('');
					}
					break;
				}
				
				app.bind.modalUpdateButton();	
				
			},
			
			modalContent: {
				
				update: '\
		      <div class="modal-header">\
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
		        <h4 class="modal-title" id="theModalLabel"><span  class="action">Edit</span> Record</h4>\
		      </div>\
		      <div  id="modal-body-wrapper" class="modal-body">\
		        <form  id="form-records" >\
		        </form>\
		      </div>\
		      <div class="modal-footer">\
		        <button  id="update-button" type="button" class="btn btn-primary action">Update</button>\
		      </div>\
      	',

				json: '\
		      <div class="modal-header">\
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
		        <h4 class="modal-title" id="theModalLabel">JSON</h4>\
		      </div>\
		      <div  id="modal-body-wrapper" class="modal-body">\
		      </div>\
      	',
				
			}
			
		}
		
		this.bind = {
			
			init: function() {
				this.edit.call( this );
				this.delete.call( this );
				if( typeof( child_table ) != 'undefined') this.expand.call( this );
			},
			
			jsonButton: function() {
				$('#json-button').on('click', function() {

					$('#modal-wrapper').html( app.render.modalContent.json );
					$('#theModal').modal('show');
					
					app.post.url = 'getJson';
					app.post.clear_postobj();
					
					app.post.now( function(obj) {
						
						$('#modal-body-wrapper').html('<pre>' + JSON.stringify( obj.results  , null, 2 ) + '</pre>');
					});
					
				});
			},
			
			modalUpdateButton: function() {
				
				$('#update-button').on('click', function() {

					app.post.getValuesFromFormToPostObj();
					app.post.now();

				});
			},

			add: function() {
				
				$('#add-button').on('click', function() {
					
					app.render.clear_form();
					
					$('.action').text('Add');
					
					app.post.clear_postobj();
					
					$('#theModal').modal('show');

					app.post.url = 'add';
					
				});
				
			},
			
			edit: function() {
				
				var fill_form = function(this_id) {
					
					app.render.clear_form();
					
					var records = jQuery.extend(true, {}, app.records); 
					
					for( var id in records){
						var record = records[id];
						for( var key in record){
							if(key == 'id') continue;
							$('#' + key ).val(records[ this_id ][key]);
						}
						break;
					}
					
				};
				
				
				$('.edit').unbind('click').bind('click', function() {
					
					app.post.url = 'update';	
									
					app.post.clear_postobj();
					
					var this_id = app.post.obj['id'] = $(this).attr('record_id');
					
					$('.action').text('Update');
					
					fill_form(this_id);
					
					$('#theModal').modal('show');

				});
			},
			
			delete: function() {
				
				var that = this;
				
				$('.delete').unbind('click').bind('click', function() {
					
					app.post.clear_postobj();
					
					app.post.url = 'delete';
					
					app.post.obj['id'] = $(this).attr('record_id');
					
					app.post.now();
					
				});
				
			},
			
			expand: function() {
				
				var that = this;
				$('.expand').unbind('click').bind('click', function() {
					
					window.location.assign( '../' + child_table + '/crud?parent_id=' + $(this).attr('record_id') + ( !parent_id ? '': '&grandparent_id=' + parent_id ));
					
				});
								
			}
			
		};
				
		this.post = {
			
			obj: {},
			
			clear_postobj: function() {
			
				app.post.obj = {};
				if( typeof( parent_table ) != 'undefined' ) app.post.obj[ parent_table +'_id'] = parent_id;
				
			},
			
			getValuesFromFormToPostObj: function() {
				var records = jQuery.extend(true, {}, app.records); 
			
				for( var id in records){
					var record = records[id];
					for( var key in record){
						if(key == 'id') continue;
						app.post.obj[key] = $('#' + key ).val();
					}
					break;
				}			
			},
			
			now: function( callback ) {
				
				console.log('postObj: ' + JSON.stringify( app.post.obj    , null, 2 ));
			
				tools.ajax(app.post.url, app.post.obj, 'post', function(obj) {
					
					console.log('responseObj: ' + JSON.stringify(  obj   , null, 2 ));
					
					if( typeof( callback ) != 'undefined') callback(obj);
					if( app.post.url == 'getJson') return;
					
					$('#theModal').modal('hide');
					
					app.render.fill_records_obj(obj, function() {
						app.bind.init();			
					});
					
				});
				
			}
			
		};
		
	};
			
}();

var	p	=	App.prototype;

var app = new App();


if( table == 'templates'){
	
	app.bind.init = function() {
		this.edit.call( this );
		this.delete.call( this );
		this.launch.call( this );
	};
	
	app.bind.launch = function() {
		
		var that = this;
		
		$('.launchImg').unbind('click').bind('click', function() {
			
			var template_id = $(this).attr('template_id'),
					url = '../app?state=%7B"template_id":%5B"' + template_id + '"%5D,"action":"open","userId":"' + tools.cookies.getCookie('google_id') + '"%7D';
			
			window.open( url, '_blank');
			
		});
		
	};
	
	app.render.paint.form =function() {
					
					$('#form-records').empty();
					
					var records = jQuery.extend(true, {}, app.records),
							formgroups = '';
									
					for( var id in records){
						var record = records[id];		
						for( var key in record){
							if(key == 'id' || key == 'count') continue;
							if( key == 'set_id') continue;
							formgroups += '\
			          <div class="form-group">\
			            <label for="' + key + '" class="control-label">' + tools.capitalizeFirstLetter(key) + ':</label>\
			            <textarea id="' + key + '" class="form-control"></textarea>\
			          </div>\
							';
							
						}
						$('#form-records').append(formgroups);
						formgroups = '';
						break;	
					}

	}
	
	app.render.paint.table = function(callback) {
		
		var records = jQuery.extend(true, {}, app.records),
				theads = ''; 
		
		for( var id in records){
			var record = records[id];
			for( var key in record){
				if( key == 'count') continue;
				if( key == 'set_id') continue;
				theads += '<th>' + tools.capitalizeFirstLetter(key) + '</th>';
			}
			break;
		}
		
		$('#table-head').empty();
		
		$('#table-head').append('\
			 <tr>\
          '+ theads + '\
          <th class="text-right">Action</th>\
      </tr>\
    ');
     
		$('#table-body').empty();
		
		var tds = '';
						
		for( var id in records){
			var record = records[id];		
			for( var key in record){
				
				if( key == 'count') continue;
				if( key == 'set_id') continue;
				
				if( key == 'google_image_id' ){
					tds += '<td   style="width:30px"><img  class="launchImg" template_id=' + id + ' style="cursor:pointer;width:100%" src="' + id + '.png"></td>';
				}else{
					tds += '<td> n/a </td>';
				};
				
			}
			
			var expand = ( typeof( child_table ) != 'undefined' ? 
					'<a class="expand btn btn-warning" href="#"  record_id=' + record['id'] + '>' + tools.capitalizeFirstLetter(child_table) + '</a>' : 
					'' );
			
			var disable = ( typeof( records[id]['count'] ) != 'undefined' && records[id]['count'] != 0  ? 'disable': '' ); 
					
			$('#table-body').append('\
          <tr>\
          		' + tds + '\
              <td class="text-right">\
              		<a class="edit btn btn-info" href="#"  record_id=' + record['id'] + '>Edit</a>\
              		' + expand + '\
              		<a class="delete btn btn-danger ' + disable + '" href="#"  record_id=' + record['id'] + '>Delete</a>\
              </td>\
          </tr>\
			');
			
			tds = '';
		}
		
		callback();		
			
	}
	
	app.post.getValuesFromFormToPostObj =  function() {
				var records = jQuery.extend(true, {}, app.records); 
			
				for( var id in records){
					var record = records[id];
					for( var key in record){
						if(key == 'id') continue;
						if( key == 'set_id') continue;
						app.post.obj[key] = $('#' + key ).val();
					}
					break;
				}			
	}
	
};


app.init();