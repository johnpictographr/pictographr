	app.methods.tagIcons = function() {

		var AssignTags = Backbone.View.extend({
			
				initialize: function(options) {
					this.injectDom();
				},
				
				injectDom: function() {
					var that = this;
					$('#panel_0').empty().load('html/tag_icons.html',
						function() {
							that.render.icons();
							that.bind.init.call(that);
						}
					);
				},
				
				bind: {
					
					init: function() {
						this.bind.icons.call(this);
						this.bind.delete.call(this);
						this.bind.add.call(this);
					},
					
					icons: function() {
						
						var that = this;

						$('#iconImgs').on('click', 'img',  function() { // CLICKING ICON
							
							$('#iconImgs').children('img').removeClass('active');
							$(this).addClass('active');
							var cid = $(this).attr('cid');
							that.render.tags.call( that, cid);
	
						})
			
					},
					
					delete: function() {
						
						var that = this;
			
						$('#tagsForm').on('click', 'img',  function() {		
						
							var cid= $(this).attr('cid'),
									model = app.stubs.collections.graphics.icons.get(cid),
									tags = model.get('tags'),
									tag = $(this).attr('tag'),
									removeIdx	=	_.indexOf(tags,	tag),
									newTags = [];
							
							$(this).remove();
							
							for( var idx in tags){
								if( idx == removeIdx) continue;
								newTags.push( tags[idx]);
							}
							
							model.set('tags', newTags);
							that.render.tags.call( that, cid);
							
						})
						
					},
					
					add: function() {
						
						var that = this;

						$('#tagsForm').on('keydown', '.addTag', 
						
							function(event) {
								
								var keyIs = event.which,
										cid = $(this).attr('cid'),
										model = app.stubs.collections.graphics.icons.get($(this).attr('cid')),
										tags = ( model.get('tags').length > 0 ? model.get('tags'): []),
										tag = $(this).val();
								
								if(keyIs == 13){ //enter
											
									tags.push(tag);
									model.set('tags', tags);
									that.render.tags.call( that, cid);
									
								}
								
								if(keyIs == 9){ // tab
									
									var $nextImg = $('#iconImgs').children('img[cid=' + cid + ']').next(),
											nextCid = $nextImg.attr('cid');
									
									$('#iconImgs').children('img').removeClass('active');
									$nextImg.addClass('active');
									
									that.render.tags.call( that, nextCid);
								}
								
								event.stopPropagation();
								
							}
						)	
					}
				},
				
				render: {
					
					icons: function() {
						
						$('#iconImgs').empty();
					
						for( var idx in app.stubs.collections.graphics.icons.models ){
							var model = 	app.stubs.collections.graphics.icons.models[idx],
									numTags = model.get('tags').length;
									
							if( numTags > 0 ) var hasTags = 'hasTags';
							else  var hasTags = '';
									
							$('#iconImgs').append('\
								<img  idx="' + idx + '" class="' + hasTags + '" cid="' + model.cid + '" src="'+ model.get('imgSrc') + '" />\
							');
							
							
						}

					},
					
					tags: function(cid) {
						
						var that = this,
								model = app.stubs.collections.graphics.icons.get(cid),
								tags = model.get('tags'),
								numTags = model.get('tags').length;
						
						$('#tagsForm').empty();
						
						$('#tagsForm').append('\
							<img  class="iconLarge" src="' + model.get('imgSrc')+ '"/><br /><br />\
						');
						
						for( var idx in tags){
							var tag = tags[idx];
							$('#tagsForm').append('\
								<input value="' + tag + '"/><img tag="' + tag + '" cid="' + model.cid + '" class="deleteTag" src="img/md-color-svg/ic_clear_24px.svg"><br />\
							');
						}
						
						$('#tagsForm').append('\
							<input  cid="' + model.cid + '"  class="addTag" value=""/>\
						');
						
						$img = $('#iconImgs').children('img[cid=' + cid + ']');
						if( numTags == 0 ) $img.removeClass('hasTags');
						else $img.addClass('hasTags');
							
						setTimeout(function(){
							$('.addTag').select();
							that.export();
						}, 1000);
						
					}
					
				},
				
				export: function() {
					
					var iconsArray = [],
							models = app.stubs.collections.graphics.icons.models;
					
					for( var idx in models){
						
						var model = models[idx],
								src = model.get('imgSrc'),
								tags = model.get('tags'),
								source = model.get('source');

						iconsArray.push({
								src: src,
								tags: tags,
								source: source
							});
						
					}

					console.log('models: ' + tools.getSizeOfObj(app.stubs.collections.graphics.icons.models));
					console.log('iconsArray: ' + iconsArray.length);
					
					var url = 'index.php/admin/save_icon_tags';
//					var url = 'php/save_icon_tags.php';

								
					var	postObj = {
								'data': JSON.stringify( iconsArray)
							};
						
					tools.ajax(url, postObj, 'post', function( data ) {
						
						// console.log(data);
						
						console.log('jsonResponse: ' + data.length);
						
					});


					/*
					
					var callback = function(data) {
						
						var jsonResponse = $.parseJSON(data);
						
						for( var idx in jsonResponse){
							var obj =	jsonResponse[idx];
							console.log(obj);
						}
						
						console.log('jsonResponse: ' + jsonResponse.length);
						
					};
					
					$.ajax({
						url: url + '?v=' + Math.random(),
						type:	'post',
				    data: {
				        arrData : {
				        	data: JSON.stringify( iconsArray)	
				        }
				    },
						success: function(data){
							callback(data);
						},
						error:	function(data){
							callback(data);
						},
						async:true
					});
					
					
					return;
					
					*/

				}
		})
								
		tools.doWhenReady( 
			function() {
				if( tools.getSizeOfObj(app.stubs.collections.graphics.icons) > 0)
					return true
					else return false
			},
			function() {
				new AssignTags();
			});
	};

	app.customInit = function() {
		
		
		setTimeout(function(){
			
			var collections = [];
			
//		collections.push('icons');
//		collections.push('headers');
//		collections.push('paragraphs');
//		collections.push('dynolines');

//				$('#graphics-card').click();
//				$('#graphics-vectorart-subcard').click();	
				
//				$('#lines-card').click();
//				$('#liness-straight-subcard').click();		
			
			return;		
			
				
			$('#debug').load('html/debug.html',
				function() {
					
				}
			);	
			
				
			
			setTimeout(function(){
				app.stubs.zoom.idx = 9;
				app.menu.resize.setGlobalScale();
				app.menu.resize.makeChange();	
				
				$('#main').scrollLeft(50);
				
			}, 500);

			
			//$('.navbar').hide();
			
			var json = {
			    "style": {
			        "element": {
			            "desktop": {
			                "left": "160px",
			                "top": "160px"
			            }
			        },
			        "textedit": {
			            "desktop": {
			                "color": "black",
			                "background-color": "transparent",
			                "font-size": "21px",
			                "left": "-2px",
			                "top": "0px"
			            }
			        },
			        "resizeWrapper": {
			            "desktop": {}
			        }
			    },
			    "data": {
			        "text": "1",
			        "fontname": "roboto",
			        "rotation": 0
			    },
			    "collection": "numbers",
			    "justDropped": true
			};
			
			var	 collection = 'web',
					left = app.stubs.placement.leftPlace,
					top = app.stubs.placement.topPlace,
					panelView = app.stubs.views.panels['panel_0'];
						
				panelView.drop.createAndAddModel.call( panelView, json);
				
				setTimeout(function(){
					$('.elements').addClass('see-handles ontop');
					
					app.stubs.zoom.idx = 16;
					app.menu.resize.setGlobalScale();
					app.menu.resize.makeChange();	
					
					$('#main').scrollLeft(550);
					
				}, 500);
				
						
			setTimeout(function(){
				$('#c1242 .custom-handle.edit-handle').click();
				 //$('#background-sample').click();
			}, 900);				
			
					
			
			setTimeout(function(){

				var	cid = 'c283',
						collection = 'web',
						left = app.stubs.placement.leftPlace,
						top = app.stubs.placement.topPlace,
						panelView = app.stubs.views.panels['panel_0'],
						json = panelView.drop.generateJsonFromGraphicModel( collection, left, top, false, cid);
						json.justDropped = true;
						
				panelView.drop.createAndAddModel.call( panelView, json);
			
			}, 1000);	
			

			setTimeout(function(){
				$('#openButton').click();
			}, 900);			
			

			
			setTimeout(function(){
				$('#printButton').click();
			}, 900);
			

			
		}, 100);
		
	};


	app.customInit();
	
//	app.methods.tagIcons();