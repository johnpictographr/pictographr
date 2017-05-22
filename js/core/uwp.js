	   
	   if(typeof( Windows) != 'undefined') {
	   	
				console.log('This is UWP');
				isUWP = true;
				
				app.methods.autosave = {
					
					tempfile: undefined,
					
					filename: "pictographr.json",
					
					init: function() {
						
						var that = this;
						
						if( typeof( app.methods.autosave.tempfile ) != 'undefined' ){
					    this.save();
						}else{
							this.createfile( function() {
								that.save();
							});
						};
	
					},
					
					delete: function() {
            app.methods.autosave.tempfile.deleteAsync().done(function () {
                app.methods.autosave.tempfile = undefined;
            },
            function (error) {
					    var msg = new Windows.UI.Popups.MessageDialog(  'error' );
					    msg.showAsync();
            });
					},
					
					retrieve: function( callback ) {
						
						var that = this;
					
		        Windows.Storage.KnownFolders.getFolderForUserAsync(null, Windows.Storage.KnownFolderId.picturesLibrary).then(function (picturesLibrary) {
		            return picturesLibrary.tryGetItemAsync( app.methods.autosave.filename);
		        }).done(function ( file ) {
		        	
		            if ( file ) {
		            	
		            	app.methods.autosave.tempfile = file;	
		            	
			            Windows.Storage.FileIO.readTextAsync(file).done(function (data) {
										that.import(data, callback );			                
			            },
			            function (error) {
								    var msg = new Windows.UI.Popups.MessageDialog(  'error' );
								    msg.showAsync();
			            });
									
		            }else {
		            	callback();
		            }
		        });
		        
			    },
					
					createfile: function( callback ) {
						
						var that = this;

		        Windows.Storage.KnownFolders.getFolderForUserAsync(
		        	null, Windows.Storage.KnownFolderId.picturesLibrary
		        ).then(function (picturesLibrary) {
		            return picturesLibrary.createFileAsync(app.methods.autosave.filename, Windows.Storage.CreationCollisionOption.replaceExisting);
		        }).done(
		        function (file) {
	        	
		            app.methods.autosave.tempfile = file;
		            callback();
		            
		        });	    

					},
					
					save: function() {
						
							app.stubs.data.os = tools.whatIs();
							app.stubs.data.elements = [];
							app.stubs.data.panels = [];
							app.stubs.data.canvas = {};
							app.stubs.data.guides = [];
							app.stubs.data.spot = undefined;
						
							for( var idx in app.stubs.collections.elements.models){
								var model = app.stubs.collections.elements.models[idx];
								
								if( model.get('disabled')) continue;
								
								if( typeof( model.get('json').data.base64) == 'undefined' && 
										model.get('json').collection == 'web'
								) {
									continue;
								}

								var json = model.get('json');

								if( tools.inArray(json.collection, app.settings.charts)) {
									var view = app.stubs.views.elements[model.cid];
									view.renderChartHi()
								};
								
								app.stubs.data.elements.push(json);
								
							}
							
							app.stubs.data.canvas.curPaperShape = app.stubs.curPaperShape;
							app.stubs.data.isTemplate = app.stubs.isTemplate;
							
							for( var idx in app.stubs.collections.guides.models){
								var model = app.stubs.collections.guides.models[idx],
										json = model.get('json');
								app.stubs.data.guides.push(json);
							}
							
							app.stubs.data.share = app.stubs.share;
							
							app.stubs.data.version = 'v1-1-25-216';
							
							app.stubs.data.os = tools.whatIs();
							
							app.stubs.data.parentFolderId = app.stubs.parentFolderId;
							
							app.stubs.data.fileTitle = app.stubs.fileTitle;

              Windows.Storage.FileIO.writeTextAsync(app.methods.autosave.tempfile,  JSON.stringify( app.stubs.data    , null, 2 ) ).done(
              function () {
								// do nothing	
              },
              function (error) {
						    var msg = new Windows.UI.Popups.MessageDialog(  'error' );
						    msg.showAsync();
              });						

					},
					
					import: function( data, callback ) {
					
							app.stubs.saveHistoryEnabled = false;
							
							var panelView = app.stubs.views.panels['panel_0'],
									data = $.parseJSON( data);
							
							app.stubs.version = data.version;
							
							//console.log(JSON.stringify(  data   , null, 2 ));

							if(data == null) return;
							
							app.stubs.folderOwnedByMe = data.isFolderOwnedByMe;
							
							if( data.isFolderOwnedByMe == 'true'){
								app.stubs.parentFolderId = data.parentFolderId;
							};
							
							if( typeof( data.fileTitle) != 'undefined') app.stubs.fileTitle = data.fileTitle;
							
							$('#fileTitleInput').val(app.stubs.fileTitle);
							$('#fileTitleLabel').text(app.stubs.fileTitle);
							
							var elements = data.elements;
							
//								console.log(' share is: ' + JSON.stringify( data.share));
							
							if(isSocial && typeof( data.share) != 'undefined'){
								
								app.stubs.share = data.share;
								app.methods.convertShareBool();
								app.stubs.share.justpulledOriginalImage = false;
								
								var socialNetworks_fileIds = [];
								for(var socialNetwork_fileId in app.stubs.share.fileIds.google) socialNetworks_fileIds.push(socialNetwork_fileId);
								
								for( var idx in socialNetworks_fileIds){
									var socialNetwork_fileId = socialNetworks_fileIds[idx];
									if( typeof( app.stubs.share.fileIds.google[socialNetwork_fileId] ) == 'undefined'){
										app.stubs.share.fileIds.google[socialNetwork_fileId] = '';	
									}											
								}
								
							}
							//console.log(data);
							app.stubs.curPaperShape = data.canvas.curPaperShape;
							
							app.stubs.isTemplate = window.isTemplate = ( typeof( data.isTemplate) != 'undefined' &&  data.isTemplate == 'true' ? true : false );
							
							app.stubs.PDFId = ( typeof( data.PDFId) != 'undefined' ? data.PDFId: undefined ); 
							app.stubs.imageId = ( typeof( data.imageId) != 'undefined' ? data.imageId: undefined );
							app.stubs.temp_image_id = ( typeof( data.temp_image_id) != 'undefined' ? data.temp_image_id: undefined );
							app.stubs.quickSaveCount = ( typeof( data.quickSaveCount) != 'undefined' ? data.quickSaveCount: undefined );
							
							app.methods.activate.canvas();
							
							if( typeof( data.guides  ) != 'undefined'){
								
								for( var idx in data.guides){
									
									var json = data.guides[idx];
									panelView.bind.guideLines.addModelAndRender.call( panelView, json);
										
								}
													
							}
						
							for( var idx in elements){
								
								var json = elements[idx];
							
								if( typeof( json.data.coordinates) != 'undefined' ){
									
									for( var key in json.data.coordinates.desktop){
										json.data.coordinates[key] = json.data.coordinates.desktop[key];
									}
									
									delete json.data.coordinates.desktop;
									delete json.data.coordinates.mobileLandscape;
									delete json.data.coordinates.mobilePortrait;
									delete json.data.coordinates.tabletPortrait;														
									
								};
								
								for( var key in json.style.desktop){
									json.style[key] = json.style.desktop[key];
								}
								
								delete json.style.desktop;
								
								if( app.methods.hasFont(json.collection)){
									var family = json.style.textedit['font-family'];
									if(!tools.inArray( family, app.stubs.fonts2Get)) app.stubs.fonts2Get.push(family);
								}
							}

							
							var getColors = function( json ) {
								
								var collection = json.collection,
										morecolors = [];

								switch( collection ){
									
								  case 'headers': {
								  	morecolors.push( json.style.textedit.color);
							  		break;
							  	}
							  	
								  case 'paragraphs': {
								  	morecolors.push( json.style.textedit.color);
							  		break;
							  	}
							  	
								  case 'dynolines': {
								  	morecolors.push( json.style.line['border-color']);
							  		break;
							  	}
							  	case 'mask':
							  	case 'polygon':
							  	case 'shapeone':
							  	case 'shapetwo':
							  	case 'shapethree':
								  case 'shapefour': {
								  	morecolors.push( json.style.shape['border-color']);
								  	morecolors.push( json.style.shape['background-color']);
							  		break;
							  	}			
								}
									
								if( tools.inArray( collection, app.settings.hasSvgshapes) ){ // working get used colors
									
									morecolors.push( json.style.svgshape['fill']);
									
								}
								
								if( collection == 'columns' ||
										collection == 'bars'
								){
									var version = json.version;
						  		if(version > 1){
				  	  			for( var idx in json.data.charts.options.colors){
			  	  	  			var onecolor = json.data.charts.options.colors[idx];
			  	  	  				morecolors.push( onecolor );
			  	  	  		}
						  		} else{
				  	  			for( var idx in json.data.colorsInChart){
			  	  	  			var onecolor = json.data.colorsInChart[idx];
			  	  	  				morecolors.push( onecolor );
			  	  	  		}
						  		}
								}
								
								if( collection == 'pies' ||
										collection == 'lines' || 
										collection == 'scatter'  || 
										collection == 'stepped'  || 
										collection == 'area'  
								){
			  	  			for( var idx in json.data.charts.options.colors){
		  	  	  			var onecolor = json.data.charts.options.colors[idx];
		  	  	  				morecolors.push( onecolor );
		  	  	  		}
								}	
								
								return morecolors;									
							};
							
								
							app.methods.fonts.getOneFontAtATime.call( this,
								function() {
									
									for( var idx in elements){
										
										var json = elements[idx],
												morecolors = getColors(json);

										for( var idx in morecolors){
											var color = morecolors[idx];
											if ( !tools.inArray(color, app.stubs.usedColors) &&
													 color != 'transparent' &&
													 color != 'black' &&
													 color != 'white' 
											) {
												app.stubs.usedColors.push(color);
											};
										}
												
										panelView.drop.createAndAddModel.call( panelView, json, undefined, 'JJJ');	
										
									}
									
									app.stubs.saveHistoryEnabled = true;
									app.methods.revert.saveHistory('pulled from server');
									window.onbeforeunload = app.methods.cleanUpOnExit												
									
									if( typeof( template_id ) != 'undefined'){
										app.stubs.fileId = 'false';
									} else{
										app.stubs.recentlySaved = true;
									};
						
								}
							);

							callback();
					}
				};

	   } else{
	   
				//console.log('This is not UWP');
				isUWP = false;	
	   	 
	   }