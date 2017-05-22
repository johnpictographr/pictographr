
	'use strict';
	
	var cc = function(idx) {
				console.log(JSON.stringify( app.stubs.collections.elements.models[idx].attributes.json   , null, 2 ));
				return  app.stubs.collections.elements.models[idx].cid + ' - ' + app.stubs.collections.elements.models[idx].attributes.json.collection;
			}
	var cv = function(idx) {
				var cid = app.stubs.collections.elements.models[idx].cid;
				console.log(JSON.stringify( app.stubs.views.elements[cid].templateObj   , null, 2 ));
				return app.stubs.views.elements[cid].model.cid + ' - ' + app.stubs.views.elements[cid].model.get('json').collection;
			}
	
	var scale = 1,
			multiple = 1,
			spotify,
			spot;	

	var collections = {
		GraphicsCollection:	Backbone.Collection.extend({
			model: models.GraphicModel
		}),
		ElementsCollection:	Backbone.Collection.extend({
			model: models.ElementModel,
			getBase64: function() {
				
			}
		}),
	};
	
	var ElementReadBase = ElementBase.extend({
		setTemplateObj: function() {
			
				app.methods.doTempateObjFor.call( this, 'elementStyle', 'element', scale);
				app.methods.doTempateObjFor.call( this, 'imageStyle', 'image', scale);
				
				if( typeof(this.model.get('json').style.resizeWrapper) != 'undefined'){
					app.methods.doTempateObjFor.call( this, 'resizeStyle', 'resizeWrapper', scale);
				}
				
				if( this.collection == 'headers' || 
						this.collection == 'paragraphs' || 
						this.collection == 'richtext'  || 
						this.collection == 'numbers' 
				){
					this.templateObj['textedit_content'] = this.model.get('json').data.text;
					app.methods.doTempateObjFor.call( this, 'texteditStyle', 'textedit', scale);
				}
				
				if( this.collection == 'numbers' ){
					app.methods.doTempateObjFor.call( this, 'texteditWrapperStyle', 'texteditWrapper');
				}				
				 
				if( tools.inArray( this.collection, app.settings.hasShapes)){
					app.methods.doTempateObjFor.call( this, 'shapeStyle', 'shape');
				}
				
				if( this.collection == 'straights' ){
					app.methods.doTempateObjFor.call( this, 'lineStyle', 'line');
				}
					
				if( typeof(this.model.get('json').justDropped) != 'undefined' ) delete this.model.get('json').justDropped
		},
	});
		
	var TextBase = ElementReadBase.extend({
	
		setRootTextEdit: function() {
			
			this.texteditStyle = this.model.get('json').style.textedit;
			this.texteditData = this.model.get('json').data;
			this.$textEdit = this.$resizeWrapper.find('.textedit');
		},
		
	});
	
	TextBase = TextBase.extend( shared.text );
	
	var ImageBase = ElementReadBase.extend({
		custom: function() {
				if( typeof( this.model.get('json').style.shape) != 'undefined' ){
					this.$shape.css('opacity', this.model.get('json').style.shape.opacity)
				}				
				
				if( typeof( this.model.get('json').style.image) != 'undefined' ){
					this.$img.css('opacity', this.model.get('json').style.image.opacity)
				}			
				
				return;
				if( useWhat == 'useTiny' || typeof( drive ) != 'undefined'
					|| serverhost == 'localhost'
				){
					
					var json = this.model.get('json');
					if( typeof( json.style.image['border-radius'] ) != 'undefined'){
						
						this.$img.remove();
						this.$resizeWrapper.append("\
							<div   style='background: url(\"" + app.settings.base64Prefix + json.data.base64 + "\");\
							width: " + parseFloat(json.style.element.width) * scale + 'px' + "; \
							height: " + parseFloat(json.style.element.height) * scale + 'px'  + ";\
							background-size: " + parseFloat(json.style.element.width) * scale + 'px' + ";\
							background-repeat: no-repeat;\
							border-radius: " + json.style.image['border-radius'] + " ;\
							box-shadow: " + json.style.image['box-shadow'] + " ;\
							'  ></div>\
						");					
						
					}
					
	
				}
								
				
		},					

		setCustomTemplateObj: function() {
			
			var json = this.model.get('json');
			
			if( tools.inArray( json.collection, app.settings.hasSvgshapes) ){ // working
				
				var imgSrc = base_url + json.data.svgSrc;
				
			} else if(json.collection == 'icons'){
				
				var imgSrc = base_url + json.data.imgSrc;
				
			}else{
				
				var prefix = ( this.collection == 'icons' ? '../../' :'' );
				
				if( useWhat == 'useTiny' || typeof( drive ) != 'undefined'){
						var whichbase64 = 'tiny_base64';	
				} else{
					var whichbase64 = 'base64';	
				}
				
				var imgSrc = app.settings.base64Prefix + json.data[whichbase64];				
			}
			
			this.templateObj['imgSrc'] = imgSrc;
		}
	});

	var HeadBase = TextBase.extend();
	
	var LineBase  = ElementReadBase.extend({

		setCustomTemplateObj: function() {
			
			this.templateObj['html'] = this.model.get('json').data.html;	
			
		},
					
		scaleLine: function() {
			
			var that = this,
					borderWidth = ( 1 * scale >= 1 ? 1 * scale : 1);
			this.$clipartDiv.css('border-width', borderWidth + 'px');
		}

	});
			
	var ParagraphBase = TextBase.extend({

		custom: function() {
			
			var that = this;
			
			this.setRootTextEdit();
			
			this.textedit = this.$resizeWrapper.children('.textedit')[0];
			
		},

		templates:{

			paragraphs: '\
						<div id="<%= id %>" class="elements " collection="<%= collection %>" style="<%= elementStyle %>">\
							<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
								<div  data-lining class="textedit" style="<%= texteditStyle %>"><%= textedit_content  %></div>\
							</div>\
						</div>\
					'
		},
		
		setCustomTemplateObj: function() {
			
			app.methods.doTempateObjFor.call( this, 'texteditStyle', 'textedit');
			
			this.writeEachLineFromDataLineArray();
			
		},
		
		writeEachLineFromDataLineArray: function() {
			
			var json = this.model.get('json'),
					domLines = "";
			
			for( var idx in json.data.lines){
				var line = 	json.data.lines[idx],
						domLine = "<div  class='pre-lining-wrapper'><p  class='pre-lining'>" + line + "</p></div>";
				domLines += domLine;
			}
			
			this.templateObj['text'] = domLines;
		}
		
		
	})
	
	HeadBase = HeadBase.extend( shared.head );
	ParagraphBase = ParagraphBase.extend( shared.paragraph );
	
	var App = function(){

		var views = {
			elements: {
				
				Headers: HeadBase.extend({
					
					custom: function() {
						
						var that = this;
						
						this.setRootTextEdit();
						
					},

					setTemplateObj: function() {
						
						app.methods.doTempateObjFor.call( this, 'elementStyle', 'element', scale);
						
						if( typeof(this.model.get('json').style.resizeWrapper) != 'undefined'){
							app.methods.doTempateObjFor.call( this, 'resizeStyle', 'resizeWrapper', scale);
						}
						
						app.methods.doTempateObjFor.call( this, 'texteditStyle', 'textedit');

						if( typeof( this.model.get('json').data.htmlAsPng) != 'undefined' ){
							
							var resolution = this.model.get('json').data.resolution;
							var dataCropped = this.model.get('json').data.dataCropped;
							
							this.templateObj['textedit_content'] =  '\
								<img style="margin-left: -' + ( dataCropped.width / 4) / resolution + 'px;'
								+ 'width:' + dataCropped.width / resolution +  'px;' 
								+ '" src="' + this.model.get('json').data.htmlAsPng + '"/>\
							';
							
						}
													
					},
		
					templates:{
						
						headers: '\
									<div id="<%= id %>" class="elements " collection="<%= collection %>" style="<%= elementStyle %>;">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="textedit" style="<%= texteditStyle %>"><%= textedit_content %></div>\
										</div>\
									</div>\
								'
						
					},						
				}),				
				
				Image: ImageBase.extend({
					templates:{
						images: '\
									<div id="<%= id %>" class="elements "  collection="<%= collection %>" style="<%= elementStyle %>;">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img  style="<%= typeof(imageStyle)!== "undefined" ?  imageStyle : "" %>" src="<%= imgSrc %>"/>\
										</div>\
									</div>\
								'
					}
				}),
				
				Icons: ImageBase.extend({
					
					templates:{
		
						icons: '\
									<div id="<%= id %>" class="elements noselect"  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img style="<%= typeof(imageStyle)!== "undefined" ?  imageStyle : "" %>" src="<%= imgSrc %>"/>\
										</div>\
									</div>\
								'
					}
					
				}),
				
				Shapes: ImageBase.extend({
					
					initialize: function(options) {
						
						this.addOptions(options);
						this.setUp();
						this.setTemplate();
						this.setTemplateObj();
						
						if( typeof(this.setCustomTemplateObj) != 'undefined') this.setCustomTemplateObj();
						this.render();
					},
					
					setTemplateObj: function() {
						
							app.methods.doTempateObjFor.call( this, 'elementStyle', 'element', scale);
							app.methods.doTempateObjFor.call( this, 'resizeStyle', 'resizeWrapper', scale);
							
							var styleIs = '',
									showSide = this.model.get('json').data.show,
									shapeStyles = this.model.get('json').style.shape;
							
							for( var side in showSide){
										
								var isTrue = showSide[side];
			
								if( typeof( isTrue) == 'string' && isTrue === 'true' ||
										typeof( isTrue) == 'boolean' && isTrue
								){
									styleIs += 'border-' +  side + '-width: ' + this.model.get('json').data['border-width'] +'px;';	
									styleIs += 'border-' +  side + '-style: ' + this.model.get('json').data['border-style'] + ';';	
								}
									
							};
							
							for( var key in shapeStyles){
								styleIs += key + ': ' + shapeStyles[key]  + ';';
							}
							
							this.templateObj['shapeStyle'] = styleIs;
							
					},
					
					setTemplate: function() {
						this.templates = {};
						for( var idx in app.settings.hasShapes){
							this.templates[app.settings.hasShapes[idx]]	= '\
									<div id="<%= id %>" class="elements "  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="shape" style="<%= typeof(shapeStyle)!== "undefined" ?  shapeStyle : "" %>"></div>\
										</div>\
									</div>\
							';
						}
					},
					
					scaleCustom: function( customScale ) {
						
						for( var idx in app.settings.sides){
							var side =	app.settings.sides[idx];
							var adjustedScale = ( typeof( customScale) != 'undefined' ? customScale: scale),
									borderWidthOnDom = parseFloat(this.model.get('json').style.shape['border-'+ side + '-width']) * adjustedScale;
	
							if ( borderWidthOnDom > 0 && borderWidthOnDom < 1  ) {
								borderWidthOnDom = 1;
							}
	
							var isTrue = this.model.get('json').data.show[side];							
							if( typeof( isTrue) == 'string' && isTrue === 'false' ||
									typeof( isTrue) == 'boolean' && !isTrue ){
								borderWidthOnDom = 0;
							}			
							
							this.$shape.css('border-'+ side + '-width', borderWidthOnDom + 'px');
						}
						
					},
					
				}),
				
				Backgrounds: ImageBase.extend({
					
					initialize: function(options) {
						
						this.addOptions(options);
						this.setUp();
						this.setTemplateObj();
						
						if( typeof(this.setCustomTemplateObj) != 'undefined') this.setCustomTemplateObj();
						this.render();
					},
					
					setTemplateObj: function() {
						
							app.methods.doTempateObjFor.call( this, 'elementStyle', 'element', scale);
							app.methods.doTempateObjFor.call( this, 'resizeStyle', 'resizeWrapper', scale);
							
							var styleIs = '',
									backgroundStyles = this.model.get('json').style.background;
							
							for( var key in backgroundStyles){
								styleIs += key + ': ' + backgroundStyles[key]  + ';';
							}
							
							this.templateObj['backgroundStyle'] = styleIs;
								
							if( typeof(this.model.get('json').justDropped) != 'undefined' ) delete this.model.get('json').justDropped;
							
					},
					
					templates: {
						
						backgrounds: '\
									<div id="<%= id %>" class="elements noselect"  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="background" style="<%= typeof(backgroundStyle)!== "undefined" ?  backgroundStyle : "" %>"></div>\
											<div  class="custom-handle rotate-handle">&nbsp;</div>\
											<div  class="custom-handle zoom-handle"></div>\
											<div  class="custom-handle delete-handle">&nbsp;</div>\
											<div  class="custom-handle edit-handle">&nbsp;</div>\
											<div  class="custom-handle clone-handle">&nbsp;</div>\
										</div>\
									</div>\
							'
					},
	
					custom: function() {
						
						this.$background.css('opacity', this.model.get('json').style.background.opacity)
						
					},		
								
					scaleCustom: function( customScale ) {
						

						
					},
					
				}),
				
				Charts: ImageBase.extend({
					
					initialize: function(options) {
						
						this.addOptions(options);
						this.setUp();
						this.createTemplates(); 
						this.setTemplateObj();
						this.setCustomTemplateObj();
						this.render();
						
					},
					
					custom: function() {
//						this.renderChart();
//		        this.$el.find('img').remove();
//		        this.$el.find('.resize-wrapper').prepend(this.model.get('json').data.svg);
					},

					createTemplates: function() {
						
						this.templates = {};
						
						for( var idx in app.settings.charts){
							var chart = app.settings.charts[idx];
							
							
							this.templates[chart] = '\
									<div id="<%= id %>" class="elements charts" collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img  class="chart-area-img" src="<%= imgSrc %>"/>\
											<div  class="custom-handle rotate-handle"></div>\
											<div  class="custom-handle delete-handle"></div>\
											<div  class="custom-handle edit-handle"></div>\
											<div  class="custom-handle clone-handle"></div>\
										</div>\
									</div>\
								';
						}
						
						
						return;
							// used for having google render the chart
							this.templates[chart] = '\
									<div id="<%= id %>" class="elements charts" collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img  class="chart-area-img" src="#"/>\
											<div  class="custom-handle rotate-handle"></div>\
											<div  class="custom-handle delete-handle"></div>\
											<div  class="custom-handle edit-handle"></div>\
											<div  class="custom-handle clone-handle"></div>\
										</div>\
									</div>\
								';						
						
					}
				}),
				
				Web: ImageBase.extend({
					templates:{
						web: '\
									<div id="<%= id %>" class="elements "  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img  style="<%= typeof(imageStyle)!== "undefined" ?  imageStyle : "" %>" src="<%= imgSrc %>"/>\
										</div>\
									</div>\
								'
					}
				}),
				
				Svg: ImageBase.extend({

					templates:{
		
						svg: '\
									<div id="<%= id %>" class="elements noselect"  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img style="<%= typeof(imageStyle)!== "undefined" ?  imageStyle : "" %>" src="<%= imgSrc %>"/>\
											<div  class="custom-handle rotate-handle">&nbsp;</div>\
											<div  class="custom-handle delete-handle">&nbsp;</div>\
											<div  class="custom-handle edit-handle">&nbsp;</div>\
											<div  class="custom-handle clone-handle">&nbsp;</div>\
										</div>\
									</div>\
								'
					},
					setCustomTemplateObj: function() {
						var json = this.model.get('json');
						this.templateObj['imgSrc'] = app.settings.baseSvgPrefix + json.data.svg;
						
					}
					
				}),
				
				Svgshapes: ImageBase.extend({  // working
					
					initialize: function(options) {
						
						this.addOptions(options);
						this.setUp();
						this.setTemplate();
						this.setTemplateObj();
						this.setCustomTemplateObj();
						
						this.render();
					},
					
					custom: function() {
						
						this.swapIMG4SVG();
					},
					
					swapIMG4SVG: function(){
						
						app.stubs.svgNeedRendering++;  // working
						
						var that = this,
								file = this.model.get('json').data.file,
								thePath = '../../'  +  app.stubs.svgmap[file];

				    $.get(thePath, null, function(data){
				    	
				    		app.stubs.svgNeedRendering--;
				    	
				        var svgNode = $("svg", data),
				        		docNode = document.adoptNode(svgNode[0]);
				        
								that.$img.replaceWith(docNode);	
											    		
				    		var json = that.model.get('json'),
				    				style = json.style,
				    				width = parseFloat(style.element.width) * scale,
				    				height = parseFloat(style.element.height) * scale,
				    				fill = style['svgshape']['fill'],
				    				stroke = style['svgshape']['stroke'],
				    				opacity = style['svgshape']['opacity'],
				    				strikeWidth = style['svgshape']['stroke-width'],
				    				svgshadow = json.data.svgshadow,
										theStyle = 'drop-shadow(' + svgshadow * scale + 'px ' + svgshadow * scale + 'px ' + svgshadow * scale * 2 + 'px rgba(0,0,0,0.4)  )';
								
								that.$svgshape = that.$el.find('svg');
								
								var cssObj = {
									fill: fill,
									stroke: stroke,
									'stroke-width': strikeWidth,
									width: width + 'px',
									height: height + 'px',
									opacity: opacity
								};
								
								if( parseInt( svgshadow ) > 0 ) {
									cssObj['-webkit-filter'] = theStyle;	
									cssObj['filter'] = theStyle;	
								}
								
								that.$svgshape.css(cssObj);
								
				    }, 'xml');
				    
					},
					
					setTemplate: function() {
						this.templates = {};
						for( var idx in app.settings.hasSvgshapes){
							this.templates[app.settings.hasSvgshapes[idx]]	= '\
									<div id="<%= id %>" class="elements noselect"  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img style="<%= typeof(imageStyle)!== "undefined" ?  imageStyle : "" %>" src="<%= imgSrc %>"/>\
											<div  class="custom-handle rotate-handle">&nbsp;</div>\
											<div  class="custom-handle zoom-handle"></div>\
											<div  class="custom-handle delete-handle">&nbsp;</div>\
											<div  class="custom-handle edit-handle">&nbsp;</div>\
											<div  class="custom-handle clone-handle">&nbsp;</div>\
										</div>\
									</div>\
							';
						}
					}
					
				}),	
				
				Googledrive: ImageBase.extend({
					templates:{
						googledrive: '\
									<div id="<%= id %>" class="elements noselect"  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img   style="<%= typeof(imageStyle)!== "undefined" ?  imageStyle : "" %>" src="<%= imgSrc %>"/>\
											<div  class="custom-handle rotate-handle">&nbsp;</div>\
											<div  class="custom-handle delete-handle">&nbsp;</div>\
											<div  class="custom-handle edit-handle">&nbsp;</div>\
											<div  class="custom-handle clone-handle">&nbsp;</div>\
										</div>\
									</div>\
								'
					}
				}),

				
				Numbers: HeadBase.extend({
					
					custom: function() {
						
						var that = this;
						
						this.setRootTextEdit();
						
						this.$resizeWrapper.width(this.$el.width());
						this.$resizeWrapper.height(this.$el.height());
						
					},
					setRootTextEdit: function() {
						
						this.texteditStyle = this.model.get('json').style.textedit;
						this.texteditData = this.model.get('json').data;
						this.$textEdit = this.$resizeWrapper.find('.textedit');
						this.$texteditWrapper = this.$resizeWrapper.find('.textedit-wrapper');
						
					},
					templates:{
						
						numbers: '\
							<div id="<%= id %>" class="elements noselect" collection="<%= collection %>" style="<%= elementStyle %>">\
								<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
									<div  class="textedit-wrapper <%= texteditWrapperClass %>" style="<%= texteditWrapperStyle %>">\
										<div  class="textedit" style="<%= texteditStyle %>"><%= textedit_content  %></div>\
									</div>\
									<div  class="custom-handle rotate-handle"></div>\
									<div  class="custom-handle delete-handle"></div>\
									<div  class="custom-handle edit-handle"></div>\
									<div  class="custom-handle clone-handle"></div>\
								</div>\
							</div>\
						'
						
					},
					
					setCustomTemplateObj: function() {
						
						var json = this.model.get('json');		
						
						var str = json.data.class,
								classArr = str.split(','),
								classStr = '';
								
						for( var idx in classArr){
							classStr += ' ' +classArr[idx];
						}
										
						this.templateObj['texteditWrapperClass'] = classStr;
						
					}
											
				}),	
					
				ZagLines: LineBase.extend({
					
					templates:{
			
						zagLines: '\
									<div id="<%= id %>" class="elements noselect" collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<%= html %>\
											<div  class="custom-handle rotate-handle"></div>\
											<div  class="custom-handle delete-handle"></div>\
											<div  class="custom-handle edit-handle"></div>\
											<div  class="custom-handle clone-handle"></div>\
										</div>\
									</div>\
								'
					},
					
					custom: function() {
						this.$zag = this.$resizeWrapper.find('.zag');
						this.$zagA = this.$resizeWrapper.find('.zagA');
						this.$zagB = this.$resizeWrapper.find('.zagB');
						var midLine = this.model.get('json').data.midLine;
						this.$zagA.css('right', 100 - midLine + '%');						
						this.$zagB.css('left', midLine + '%');
						this.$zag.css('border-color', this.model.get('json').style.line['border-color']);
						this.scaleLine();
					}
					
				}),	
									
				Paragraphs: ParagraphBase.extend({}),
				
				Richtext: ParagraphBase.extend({
		
					templates:{
			
						richtext: '\
									<div id="<%= id %>" class="elements " collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="textedit" style="<%= texteditStyle %>"><%= textedit_content  %></div>\
										</div>\
									</div>\
								'
					}				


				}),
				
				Dynolines: DynoBase.extend({
					initialize: function(options) {
						
						this.addOptions(options);

						this.collection = this.model.get('json').collection;
						
						this.coordinates = this.model.get('json').data.coordinates;
						
						this.setTemplateObj();
						
						this.createHTML.init.call( this );
						
					},
					custom: function() {
						this.setPosition();
						this.colorLine();
						/* HACK -- FOLLOWING HAS TO BE TWICE*/
						this.renderLine();
						this.renderLine();
						
						this.scale();
						
						
						if( spotify ) this.$el.css({
							left: parseFloat(this.$el.css('left')) - parseFloat(spot.diff.left) + 'px',
							top: parseFloat(this.$el.css('top')) - parseFloat(spot.diff.top) + 'px'
						});

					},
					createPseudoForStyleFor: function( which, $dom ){
						
						var width = parseFloat(this.getPseudoProp(which, 'width', $dom))  * scale;
						var height = parseFloat(this.getPseudoProp(which, 'height', $dom))  * scale;
						var borderTop = parseFloat(this.getPseudoProp(which, 'border-top', $dom))  * scale;
						var borderBottom = parseFloat(this.getPseudoProp(which, 'border-bottom', $dom))  * scale;
						var top = parseFloat(this.getPseudoProp(which, 'top', $dom))  * scale;
						var bottom = parseFloat(this.getPseudoProp(which, 'bottom', $dom))  * scale;
						var left = parseFloat(this.getPseudoProp(which, 'left', $dom))  * scale;
						var right = parseFloat(this.getPseudoProp(which, 'right', $dom))  * scale;
						var borderLeft = parseFloat(this.getPseudoProp(which, 'border-left', $dom))  * scale;
						var borderRight = parseFloat(this.getPseudoProp(which, 'border-right', $dom))  * scale;
						var borderColor = $dom.css('border-color');
					
						var str = '\
									width: ' + width + 'px   !important;\
									height: ' + height + 'px   !important;\
									border-top: ' + borderTop + 'px solid !important;\
									border-bottom: ' + borderBottom + 'px solid !important;\
									border-left: ' + borderLeft + 'px solid !important;\
									border-right: ' + borderRight + 'px solid !important;\
									border-color: ' + borderColor + ' !important;\
						';
					
						str += ( this.getPseudoProp(which, 'top', $dom) != 'auto'  ? 'top: ' + top + 'px !important;' : '' );
						str += ( this.getPseudoProp(which, 'bottom', $dom) != 'auto'  ? 'bottom: ' + bottom + 'px !important;' : '' );
				
						var styleIs = '\
							<style>\
							.line_' + this.model.cid + ':' + which + '{' + str + '}' +'\
							</style>\
						';
						
						styleIs =  styleIs.replace(/[\n\r]+/g, '');
						styleIs =  styleIs.replace(/\s{2,10}/g, ' ');
					
						this.$el.prepend(styleIs);										
					},
					setHandlePositions: function() {
						var that = this;
						for(var	idx	in app.settings.keysInLayout){
							that.$line.find('.custom-handle').css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  -1 * this.angle +	'deg)');
						}
						
						this.$line.find('.custom-handle.left.clone-handle').css({
							'left': -20 + this.lineWidth + 'px',
							'top': 45 * scale + 'px'
						});
						
						this.$line.find('.custom-handle.left.edit-handle').css('left', 40 * scale + this.lineWidth + 'px');
						
						this.$line.find('.custom-handle.left.delete-handle').css({
							'left': -20 + this.lineWidth + 'px',
							'bottom': (40 * scale) + 'px'
						});						
						

						
						this.$line.find('.custom-handle.right.clone-handle').css({
							'top': 45 * scale + 'px'
						});						
						
						
						this.$line.find('.custom-handle.right.edit-handle').css({
							'right': 40 * scale + this.lineWidth + 'px'
						});
												

						this.$line.find('.custom-handle.right.delete-handle').css({
							'right': (-10 * scale) + this.lineWidth + 'px',
							'bottom': (40 * scale) + 'px'
						});						
						
						
						
						
						this.$line.find('.custom-handle.right.clone-handle').css({
							'top': 45 * scale + 'px'
						});
					}

				})
			},
			Panel:  PanelBase.extend({
				drop:{
					
					createAndAddModel: function(json, makeClone) {
						
						var model = new models.ElementModel();
						model.set('json', json);
						
						app.stubs.collections.elements.add(model);
						
						if( typeof( makeClone ) != 'undefined' ){
							app.stubs.cloned.push( model.cid );
						}
						 
						this.drop.renderAndAppend.call( this, model );
							
					},
						
					renderAndAppend: function( model ) {

						var whichView = app.methods.getWhichView( model ),
								view = this.view = app.stubs.views.elements[ model.cid ] = new views.elements[whichView]({'model': model}),
								html = view.getHtml();
						
						
						if(typeof( model.get('json').data.isLocked) != 'undefined'){
							app.stubs.locked.push(model.cid);
							this.$el.parent().append(html);
						} else {
							this.$el.append(html);
						}
						
						view.setEl();

						if(typeof(view.setRotation ) != 'undefined')	view.setRotation();
					
						view.custom();
						
					}
				},
				
				template: '\
					<div  class="panel-wrapper">\
						<div  id="<%= id %>"  class="panels" panel_idx="<%= panel_idx %>">\
						</div>\
					</div>\
				',
					
				initialize: function(options) {

					this.addOptions(options);
					
					this.id = 0;
					this.setEl();					
					
					this.render();
				}
			})	

		};
		
		views.elements.Richtext = views.elements.Richtext.extend( shared.richtext );
		views.elements.Numbers = views.elements.Numbers.extend( shared.numbers );
		
	    return function() {
				
				var app = this;
				
				this.init = function()	{
					
					if( typeof( drive ) == 'undefined' && serverhost != 'localhost'){
						
						$('body').append('\
							<style>\
								::-webkit-scrollbar {\
								    display: none;\
								}\
								#canvas-wrapper{\
									padding: 0px 0px 0px 0px;\
									position:relative;\
									top:0px;\
									bottom:0px;\
									margin: 0px 0px 0px 0px;\
									box-sizing: initial;\
								}\
								#canvas{\
									box-shadow: none;\
									margin: 0px 0px 0px 0px;\
									position: relative;\
									background: transparent;\
								}\
							</style>\
							<div  id="main"  class="read">\
									<div  id="canvas" >\
									</div>\
							</div>\
						');						
						
					} else{
						
						$('body').append('\
							<div id="modal-screen"  class="dark">\
								<div  id="modal-box" >\
								</div>\
							</div>\
							<div  id="buttons-container" >\
								<img  id="pdf-image" src="../img/pdf2.png">\
								<img  id="fb-image"  class="social-button" src="../img/social/facebook_32.png">\
								<img  id="tw-image"  class="social-button" src="../img/social/twitter_32.png">\
								<img  id="li-image"  class="social-button" src="../img/social/linkedin_32.png">\
								<img  id="gp-image"  class="social-button" src="../img/social/google_plus_32.png">\
								<img  id="pi-image"  class="social-button" src="../img/social/pinterest_32.png">\
								<img  id="em-image"  class="social-button" src="../img/social/email_32.png">\
							</div>\
							<div  id="left-column-banner-container"  class="adspot">\
								<img  id="left-column-banner-image" src="https://placehold.it/160x600">\
							</div>\
							<div  id="right-column-banner-container"  class="adspot">\
								<img  id="right-column-banner-image" src="https://placehold.it/160x600">\
							</div>\
							<div  id="main"   class="read drive">\
								<div  id="canvas-wrapper" >\
									<div  id="mobile-banner-container-row"  class="adspot">\
										<div  id="mobile-banner-container" >\
											<img  id="mobile-banner-image" src="https://placehold.it/300x60">\
										</div>\
									</div>\
									<div  id="canvas" >\
									</div>\
								</div>\
							</div>\
							<div  class="resize-container" >\
								<div><a  id="resize-larger" class="btn btn-danger btn-fab btn-raised mdi-content-add withripple"><div class="ripple-wrapper"></div></a>\
								</div>\
								<div><a id="resize-smaller" class="btn btn-danger btn-fab btn-raised mdi-content-remove withripple"><div class="ripple-wrapper"></div></a>\
								</div>\
							</div>\
						');						
						
					}

					tools.ajax(	'../../json/svgshapes/svgmap.json', {}, 'get', function( jsonObj ) {
						app.stubs.svgmap = jsonObj;
					});  // working svgmap

					app.stubs.collections.elements = new collections.ElementsCollection();
					
					if( typeof( drive ) != 'undefined'  || serverhost == 'localhost'){
						
						if( tools.mobilecheck() ){
							$('#canvas').css({
								'padding': '0px',
								'box-shadow': '0px	0px 0px white'
							}).unwrap();
							$('#panel_0').css({
							}).unwrap();
						}

						
					} else{

						app.stubs.zoom.idx = 9;
						
						$('#panel_0').unwrap();

						$('#canvas').css({
							'padding': '0px',
							'box-shadow': '0px	0px 0px white'
						});
						
					};


					app.menu.resize.setGlobalScale();
					app.methods.activate.init();
					app.methods.setGlobals();
					app.data.import();
					
					//app.methods.recordClick( '', 0, document.referrer);
					
					if(serverhost == 'localhost'){
						//app.methods.debug();
					}
					
				};				
				
				this.methods = {
					
					activate:{
						init: function() {
							
							var that = this;
							this.panel();
							
						},
						panel: function() {
							
							var name = 'panel_0',
									panel_idx = 0;
							app.stubs.views.panels[name] = new views.Panel({
								id: name,
								panel_idx: panel_idx
							});
							
						}							
					},						
					
					setGlobals: function() {
						
					},
					
					changeCanvasShape: function() {
						
						if( app.stubs.curPaperShape.pageSize == 'custom'){
							var width = app.stubs.curCanvasSize.width = app.stubs.curPaperShape.pageSizeCustom.width;
							var height = app.stubs.curCanvasSize.height = app.stubs.curPaperShape.pageSizeCustom.height;
						}else{
							var width = app.stubs.curCanvasSize.width = app.settings.paperSizes[app.stubs.curPaperShape.pageSize][app.stubs.curPaperShape.layout].width;
							var height = app.stubs.curCanvasSize.height = app.settings.paperSizes[app.stubs.curPaperShape.pageSize][app.stubs.curPaperShape.layout].height;
						};

						$('#canvas, #panel_0').width(width  * app.stubs.zoom.scale );
						$('#canvas, #panel_0').height(height  * app.stubs.zoom.scale );

					},
					
					fonts: {
					
						getOneFontAtATime: function(callback) {
							
							var fontsGotten = 0,
									fonts2GetLength = app.stubs.fonts2Get.length,
									duration = 100,
								  repeatingFunction = setInterval(
								  
										function(){
											
											if(fontsGotten == fonts2GetLength){
												clearInterval(repeatingFunction);
												callback();
											} 
											
											if( app.stubs.readyForNextFont && app.stubs.fonts2Get.length > 0 ) {
												
												app.stubs.readyForNextFont = false;
												
												var family = app.stubs.fonts2Get.shift(),
														that = this,
														url = '../../index.php/app/curlGoogleFont';
														
														console.log(family);
														
												tools.ajax(url, {'font': family}, 'post', function(obj) {
													
													console.log(JSON.stringify(  obj   , null, 2 ));
													
													//if( typeof( obj.data.match ) != 'function') return;
													
													var notFound = obj.data.match( /Not Found/g );
													
													if( notFound != null && notFound.length > 0) return;
												
											    var urls  = obj.data.match( /url\(.*?\)/g );
											    url =  urls[0];
											    
											    var fontFamilies = obj.data.match( /font-family\:.*?\;/g ),
											   	    fontFamily =  fontFamilies[0];
											   	
											    var fontStyles = obj.data.match( /font-style\:.*?\;/g ),
											   			fontStyle =  fontStyles[0];
											   	
											    var fontWeights = obj.data.match( /font-weight\:.*?\;/g ),
											   			fontWeight =  fontWeights[0];				   	
											    
											    var styleTag = "\
											    <style>\
											    	@font-face {\
												    " + fontFamily + ";\
												    " + fontStyle + ";\
												    " + fontWeight + ";\
												    src: " + url + ";\
											    }\
											    </style>";		
											    		
													$('body').append(styleTag);
													
													FontDetect.onFontLoaded (family, function() {
														fontsGotten++;
														app.stubs.readyForNextFont = true;
														
														app.stubs.fontsLoaded.push(family);
														
													},function() {
														// fail
													}, {msTimeout: 3000});
													
													
												});
											}
											
										},
										
										duration
										
									);
						}
						
					},
					
					widgets:{
						charts:{
							
						}	
					},
					
					interactive: function() {
						
						app.methods.modal.init();
						
						for( var idx in app.stubs.collections.elements.models){
							
							var model = app.stubs.collections.elements.models[idx];
							
							if(typeof( model.get('json').data.cta ) != 'undefined') {
								
								var getRefType = function() {
									
									var patt = /youtube/g;
									var isYoutube = patt.test(model.get('json').data.cta);
									
									if(isYoutube) return 'youtube';
									
									var patt = /pdfDownload/g;
									var pdfDownload = patt.test(model.get('json').data.cta);
									
									if(pdfDownload) return 'pdfDownload';	
									
									return 'redirect';
									
								}
								
								$('#' + model.cid).find('img, .shape, .textedit').wrap("<a ref_type='" +  getRefType() + "' target='_blank'  cta_num='" + model.get('json').data.cta_num + "'  href='" + model.get('json').data.cta + "'  pdfId='" + ( typeof( model.get('json').data.cta_pdfId) != 'undefined' ? model.get('json').data.cta_pdfId: "" ) + "' ></a>");	
								
								$('#' + model.cid).find('img').addClass('solidonhover');
								
							}
							
						}
						
			      var youtubeTrigger = $('body').find('a[ref_type^="youtube"]');
			      
			      youtubeTrigger.click(function (e) {
			      	
		      		e.preventDefault();
		      	
		          var href = $(this).attr('href'),
			      			cta_num = $(this).attr('cta_num'),
		          		hrefArray = href.split('?'),
		          		paramArray = hrefArray[1].split('&'),
		          		firstParamArray = paramArray[0].split('='),
		          		video_id = firstParamArray[1],
		          		src = 'https://www.youtube.com/embed/' + video_id + '?autoplay=1',
		          		width = tools.getScreenDim().width - 50,
		          		height = tools.getScreenDim().height - 100;
							
							$('#modal-box').css('padding', '0px').width(width).height(height).html('\
									<iframe width="100%" height="' + height + '" src="' + src + '"></iframe>\
							');
							
							app.methods.recordClick( href, cta_num);
		          
							app.methods.modal.on();
							
			      });
			      
						
			      var redirectTrigger = $('body').find('a[ref_type^="redirect"]');
			      
			      redirectTrigger.click(function (e) {
			      	
			      	var href = $(this).attr('href'),
			      			cta_num = $(this).attr('cta_num');
			      			
			      	app.methods.recordClick( href, cta_num);
							
			      });

			      
						
			      var pdfDownloadTrigger = $('body').find('a[ref_type^="pdfDownload"]');
			      
			      pdfDownloadTrigger.click(function (e) {
			      	
			      	e.preventDefault();
			      	
			      	var pdfId = $(this).attr('pdfId');
			      	
			      	var href = $(this).attr('href'),
			      			cta_num = $(this).attr('cta_num');
			      			
			      	app.methods.recordClick( href, cta_num);
			      	
							var url = 'streamPDF?google_id=' + google_id + '&fileId=' + pdfId;
							tools.download(url, 'pictographr.pdf');			
							
			      });	
			      
			      $('#buttons-container').show();		
			      
						tools.doWhenReady(
						
							function() {
								console.log('checking');
								return $('#buttons-container').length > 0;
							},
							
							 
							
							function() {
								
								var pinSiteUrl = 'pictographr.com/app/base?dmz=' + domain_id;
								var pinImageUrl = 'https://pictographr.com/image/pinDriveImage/' + google_id + '/' + file_image_fileId;
								
								$('#fb-image').wrap("<a href='" + "https://www.facebook.com/sharer/sharer.php?u=" + shortUrl + "&t=" + description + "' target='_blank'></a>");	
								$('#tw-image').wrap("<a href='" + "https://twitter.com/share?url=" + shortUrl + "&text=" + description + "' target='_blank'></a>");	
								$('#li-image').wrap("<a href='" + "https://www.linkedin.com/shareArticle?mini=true&url=" + shortUrl + "&title=" + title + "&summary=" + description + "' target='_blank'></a>");	
								$('#pi-image').wrap("<a href='" + "https://www.pinterest.com/pin/create/button/?url=" + pinSiteUrl + "&media=" + pinImageUrl + "' target='_blank'></a>");	
								$('#gp-image').wrap("<a href='" + "https://plus.google.com/share?url=" + shortUrl + "' target='_blank'></a>");	
								$('#em-image').wrap("<a href='" + "mailto:?subject=" + title + "&body=Check this out - " + shortUrl + "' target='_blank'></a>");	

	
							},
						'dowhen sharethis'
						);

			      	
						if( typeof( PDFId ) != 'undefined'){
							
							$('#pdf-image').wrap("<a href='https://pictographr.com/app/streamPDF?google_id=" + google_id + "&amp;fileId=" + PDFId + "' target='_parent' download='pictographr.pdf'></a>");	

							
							return;
/*							
							var that = this;
							
							tools.doWhenReady(
								function() {
									return $('#sthoverbuttons').length > 0;
								},
								function() {
									$('#buttons-container').show();
									$('#buttons-container').offset({	top: $('#sthoverbuttons').offset().top	- 50 })
									
									$('#buttons-container').wrap("<a href='https://pictographr.com/app/streamPDF?google_id=" + google_id + "&amp;fileId=" + PDFId + "' target='_parent' download='pictographr.pdf'></a>");	


									return;

									$('#buttons-container').on('click', function() {
											var url = 'streamPDF?google_id=' + google_id + '&fileId=' + PDFId;
											console.log(url);
											tools.download(url, 'pictographr.pdf');								
									});		
		
								},
							'dowhen sharethis'
							);
									
									*/
							

						};


						
						if( typeof( adspot ) != 'undefined'){
							
							$('#left-column-banner-container').css({
								left: ($('#panel_0').offset().left - 210) + 'px',	
								top: $('#panel_0').offset().top + 'px',	
							});
							
							$('#right-column-banner-container').css({
								left: ($('#panel_0').offset().left + $('#panel_0').width() + 10) + 'px',	
								top: $('#panel_0').offset().top + 'px',	
							});	
							
							$('#mobile-banner-container').css('width', $('#panel_0').width() + 'px');
							$('#mobile-banner-image').attr('src', 'https://placehold.it/' +  $('#panel_0').width() + 'x75');									
							
							$('.adspot').show();
							
						};
						
						$.material.init();
						
					},
					
					getHigherResImages: function() {
							var url = '../../index.php/app/open',
									obj = { 
										google_id: window.google_id,
										fileId: ( tools.mobilecheck() ? window.share_lite_fileId : window.fileId ),
										openFrom: 'drive'
									};
									
							tools.ajax(url, obj, 'post', function( data) {
								var data = $.parseJSON(data),
										elements = data.elements;
										
								for( var idx in elements){
									var json = elements[idx];
									
									if( tools.inArray(json.collection, app.settings.canSaveImageToCloudDrive)) {
										
										var match = json.data.match;
										
										if( tools.mobilecheck() ){
											var whichbase64 = 'shrunken_base64';
										} else{
											var whichbase64 = 'base64';
										}
										
										var imgSrc = app.settings.base64Prefix + json.data[whichbase64];
										
										for( var idx in app.stubs.collections.elements.models){
											var model = app.stubs.collections.elements.models[idx];
											if(model.get('json').data.match == match ) {
												$('#' + model.cid).find('img').attr('src', imgSrc);	
											}
										}
														
									}
									
								}
								
							});
					},
					
					recordClick: function( href, cta_num, refer) {
						
						if( typeof( cta_num) == 'undefined' || serverhost == 'localhost') return;
						
						var url = '../../index.php/app/recordClick',
								obj = { 
									domain_id: window.domain_id,
									cta: href,
									cta_num: cta_num,
									refer: ( typeof( refer) != 'undefined' ? refer:'' )
								};

								if( typeof( window.lead_id ) != 'undefined' ) {
									obj['lead_id'] = window.lead_id;	
								}
								
								if( typeof( window.way ) != 'undefined' ) {
									obj['way'] = window.way;	
								}		
														
						tools.ajax(url, obj, 'post', function( data) {
							console.log(JSON.stringify(   data  , null, 2 ));
						});
						
					},
					
					setCanvasTop: function() {
						var canvasTop = ($('#main').height() - $('#canvas').height()) / 5; 
						
						if(canvasTop < 20) canvasTop = 20;
					
						$('#canvas').css('top', canvasTop + 'px');	
					}
				};
				
				this.menu = {
				
					init: function() {	
						this.resize.init();;
					}
				};				
				
				this.data = {
					import: function() {
						
							var data = [],
									url = '../../index.php/app/open',
									obj = { 
										google_id: window.google_id,
										fileId: ( typeof( drive ) != 'undefined' ? window.share_tiny_fileId : window.fileId ),
										openFrom: ( typeof( drive ) != 'undefined' && serverhost != 'localhost' ? 'drive' : useWhat )
									};
									
							tools.ajax(url, obj, 'post', function( data) {
								
								
								if( typeof(data) != 'string') return;
								
								var panelView = app.stubs.views.panels['panel_0'],
										data = $.parseJSON( data),
										elements = data.elements;
								
								//console.log(JSON.stringify(  data   , null, 2 ));
								if( typeof( data.spot ) != 'undefined' ) {
									
									spot = data.spot;
									spotify = true;
									
									$('html, body, #canvas, #panel_0').width(spot.frame.width);
									$('html, body, #canvas, #panel_0').height(spot.frame.height);
									
								} else {
									
									app.stubs.curPaperShape = data.canvas.curPaperShape;
									
									app.methods.changeCanvasShape();
									
									if( !tools.mobilecheck() ){
										
										$('body').width( $('#panel_0').width()); 
										$('body').height( $('#panel_0').height()); 
										
									}
									
									$('body').css({
										'background': 'white'
									});
																				
									//$('#canvas').css('zoom', '70%');
									
									spotify = false;									
								}
								
								app.stubs.imageId = ( typeof( data.imageId) != 'undefined' ? data.imageId: undefined );
								
								// var lengthElements = 0;
								
								if( serverhost == 'localhost'){
									
									for( var idx in elements){
										var json = elements[idx];
										panelView.drop.createAndAddModel.call( panelView, json);	
									}
									
								} else {
									
									for( var idx in elements){
										var json = elements[idx];
										
										if( typeof( json.style.desktop) != 'undefined'){
											for( var key in json.style.desktop){
												json.style[key] = json.style.desktop[key];
											}										
										};
										
										if( app.methods.hasFont(json.collection)){
											var family = json.style.textedit['font-family'];
											if(!tools.inArray( family, app.stubs.fonts2Get)) app.stubs.fonts2Get.push(family);
										}
										
									}
									
									app.methods.fonts.getOneFontAtATime.call( this,
										function() {
											
											for( var idx in elements){
												
												var json = elements[idx];
												
												if( spotify ) {
	
													json.style.element.left = parseFloat(json.style.element.left) - parseFloat(spot.diff.left) + 'px';
													json.style.element.top = parseFloat(json.style.element.top) - parseFloat(spot.diff.top) + 'px';
													
												}
												
												panelView.drop.createAndAddModel.call( panelView, json);	
												
											}
										}
									);									
								}
								
								if( typeof( drive ) != 'undefined'  || serverhost == 'localhost' && 1 == 2 ){ // TESTING
			
									app.stubs.zoom.idx = app.menu.resize.getBestIdx();
									app.menu.resize.init();
									app.menu.resize.makeChange();
								}

								tools.doWhenReady( function() {
									if( typeof( elements) != 'undefined' && 
											elements != null && 
											elements.length == $('.elements').length &&
											app.stubs.svgNeedRendering == 0 ) {
										
										return true	
									}
									else {
										return false
									}
								},
								function() {
									if( serverhost == 'localhost'){
										
										//app.methods.interactive();
										
									}else{
										if( typeof( window.drive ) == 'undefined' ){
											alert('ready for renderWithAlert.js');
										} else{
											
											app.methods.getHigherResImages();
											app.methods.interactive();
											
											
										}
									};
										
								}, 'XX');
								
								
							});	
							
					
					}
				};
								
			};
				
	}();

	var	p	=	App.prototype;

	var app = new App();
