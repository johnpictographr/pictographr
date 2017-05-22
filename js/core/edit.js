	'use strict';
	
	var his = function(idx) {
		console.log(JSON.stringify( app.stubs.history[idx].elements   , null, 2 ));
	}
	
	var cs = function() {
		console.log(app.stubs);
	}
	
	var cf = function(idx) {
				var foo = [ app.stubs.fileId, app.stubs.temp_image_id, app.stubs.PDFId];
				console.log(JSON.stringify( foo , null, 2 ));
	}
	
	var cc = function(idx) {
		
		var obj = tools.deepCopy(app.stubs.collections.elements.models[idx].attributes.json);
		
		delete obj.data.base64;
		delete obj.data.htmlAsPng;
		if( typeof( obj.style.background ) != 'undefined') delete obj.style.background['background-image'];
		console.log(JSON.stringify( obj   , null, 2 ));
		
	}
	var cv = function(idx) {
				var cid = app.stubs.collections.elements.models[idx].cid;
				console.log('templateObj: ' + JSON.stringify( app.stubs.views.elements[cid].templateObj   , null, 2 ));
				console.log(app.stubs.views.elements[cid]);
				console.log('aspie: ' + app.stubs.views.elements[cid].resize.options.aspectRatio);
	}

	var scale = 1,
			multiple = 1,
			editbox,
			saveHistory = null,
			snack,
			toast,
			domReady = false;	

	var collections = {
		tags:{
			Clipart: TagsCollection.extend({
				localStorage:	new	Backbone.LocalStorage("pictographr-tags-clipart")
			}),
			Photos: TagsCollection.extend({
				localStorage:	new	Backbone.LocalStorage("pictographr-tags-photos")
			}),
			Vectors:	TagsCollection.extend({
				localStorage:	new	Backbone.LocalStorage("pictographr-tags-vectors")
			}),
			Illustrations: TagsCollection.extend({
				localStorage:	new	Backbone.LocalStorage("pictographr-tags-illustrations")
			})
		},		
		GraphicsCollection:	Backbone.Collection.extend({
			model: models.GraphicModel
		}),
		ElementsCollection:	Backbone.Collection.extend({
			model: models.ElementModel,
			getBase64: function() { }
		}),
		GuidesCollection:	Backbone.Collection.extend({
			model: models.GuideModel
		})
	};

	var App = function(){
	
		var EditBoxView = Backbone.View.extend({
			
			initialize: function() {
				
				this.setEl();
				
				this.render.wrapper.call( this);
				
				this.bind.drag.call( this );
				
				this.bind.close.call( this );
				
				this.$el.click( function(event) {
						app.methods.clearActive(['shrinkFontList', 'hideColorPicker'], 'include', 'edit-box click');
						return false;
				})

				this.$el.on('mousedown',	function(event)	{
					event.stopPropagation();
				});

			},
			
			richTextColorChanged: false,

			setEl: function() {
				this.$el = $('#edit-box');
			},
			
			components: function() {
				
				var standard = [ 'lock', 'fonts', 'moretext', 'textAlign', 'layers', 'image', 'imgTools', 'colors', 'letterspace', 'opacity', 'textshadow', 'svgshadow', 'stroke', 'backgroundSize', 'blur', 'grayscale', 'customBorders', 'glow', 'align', 'text', 'zag', 'charts', 'borderstyle', 'rotate', 'bordershow', 'aspect'];
				
				if( isSocial ) standard.push('cta');
				 
				return standard;
			}(),
				
			render:{
				
				wrapper: function() {
					
					$('#edit-box').append('\
						<div id="edit-box-close-wrapper" >\
							<button type="button" class="close" <small><sup>&times;</sup></small></button>\
						</div>\
					');					
					
					for( var idx in this.components){
						var component = this.components[idx];
						$('#edit-box').append('\
							<div  id="edit-' + component + '" component="' + component + '" class="edit-row"></div>\
						');
						
						this.render.components[component].getHTML.call( this, function( component ) {
							
							var $component = $('#edit-' + component);
							
							$component.find('.edit-layer').css({
								'text-decoration': 'underline',
								'color': 'blue',
								'cursor': 'pointer',
							}).bind('click',  function() {
								$(this).parent().parent().find('.slider-wrapper').toggle();
								$(this).parent().parent().find('.stepper-wrapper').toggle();
							});
							
							$component.find('.slider-row').each( function() {
								
								var propFeature = $(this).attr('name');
								var maxValue = editbox.methods[component].values[tools.toCamelCase(propFeature)].length  - 1;
								
								$(this).append('\
									<div  class="oh stepper-wrapper "   style="display:none"  >\
										<div class="decrease" data-input-stepper-decrease></div>\
										<input  readonly name="' + propFeature + '" id="input-' + propFeature + '" type="text"  value="10" min="0" max="' + maxValue + '" >\
										<div class="increase"  data-input-stepper-increase></div>\
									</div>\
								');
							});
							
							$component.find('.slider-row').each( function() {
														
								var propFeature = $(this).attr('name');
								$(this).find('.stepper-wrapper').inputStepper();
								
								var plugin = $(this).find('.stepper-wrapper').data('pluginInputStepper');
								
								editbox.methods[component].stepperPlugin[tools.toCamelCase(propFeature)] = plugin;
								
							});
							
							$component.find('.decrease, .increase').on('click', function() {
								return false;
							});
							
							$component.find('input').on('decrease', function (e, amount, plugin) {
									var value = $(this).val();
									var propFeature = $(this).attr('name');
									var renderPng = true;
							    editbox.methods[component].save[tools.toCamelCase(propFeature)]( value, propFeature,  renderPng);
							    
							});
														
							
							$component.find('input').on('increase', function (e, amount, plugin) {
									var value = $(this).val();
									var propFeature = $(this).attr('name');
									var renderPng = true;
							    editbox.methods[component].save[tools.toCamelCase(propFeature)]( value, propFeature,  renderPng );
							});

						});
						
					}

				},
				
				components:{
					
					textAlign: {

						getHTML: function() {
							var that = this;
							$('#edit-textAlign').load(
							'html/editbox/textalign.html?version=' + version, function() {
								editbox.methods.textAlign.bind.init();
							});
						}
						
					},					
					
					moretext: {

						getHTML: function() {
							var that = this;
							$('#edit-moretext').load(
							'html/editbox/moretext.html?version=' + version, function() {
								editbox.methods.moretext.bind.init();
							});
						}
						
					},
					
					borderstyle: {

						getHTML: function(callback) {
							var that = this;
							$('#edit-borderstyle').height(45).load(
							'html/editbox/borderstyle.html?version=' + version, function() {
								editbox.methods.borderstyle.bind.init();
								callback( 'customBorders' );
							});
						}
						
					},
					
					bordershow: {

						getHTML: function() {
							var that = this;
							$('#edit-bordershow').height(108).load(
							'html/editbox/bordershow.html?version=' + version, function() {
								editbox.methods.showborder.bind.init();
							});
						}
						
					},
					
					fonts: {

						getHTML: function() {
							var that = this;
							$('#edit-fonts').height(55).load(
							'html/editbox/fonts.html?version=' + version, function() {
								var url = 'json/fonts/fonts.json?version=' + version;
								$.ajax({
										url: url,
										type:	'post',
										dataType:'json',
										success: function(data){
											app.stubs.fontlist = data;
											editbox.render.components.fonts.list();
											editbox.methods.fonts.bind.init();
										},
										error:	function(data){
										},
										async:true
								});
							});
						},
						
						list: function() {
							
							var tinyapp = {
								
								measureText: function(textvalue, fontSizeIs, fontFamily) {
									
									textvalue = tools.trimFrontAndBackOf(textvalue);
									
							    var divIs = document.createElement('div');
							
							    document.body.appendChild(divIs);
						
							    divIs.style.fontFamily = fontFamily;
							    divIs.style.fontSize = fontSizeIs + "px";
							    divIs.style.position = "absolute";
							    divIs.style.left = -1000;
							    divIs.style.top = -1000;
							
							    divIs.innerHTML = textvalue;
							
							    var result = {
						        width: divIs.clientWidth,
						        height: divIs.clientHeight
							    };
									
									document.body.removeChild(divIs);
							
							    divIs = null;
							    
							    return result;
								}
							};
							
							
							app.stubs.fontwidth = {};
							
							for( var category in app.stubs.fontlist){
								
									var fonts = app.stubs.fontlist[category],
											html = '',
											numfonts = 0;
								
									for( var idx in fonts){
										
										if( tools.inArray(fonts[idx]['family'], ["Open Sans Condensed-300.png", "Benchnine", "Ptsansnarrow", "Yanonek Affeesatz", "Ralewaydots", "Abeezee", "Im Fell English SC", "Im Fell English", "Medievalsharp", "Unifraktur Cook", "Unifraktur Maguntia", "Coda Caption", "Changaone", "Carterone", "Concertone", "Doppioone", "Paytoneone", "Buda-300.png", "Portlligatsans", "Robotoslab", "Aguafinascript", "Molle-italic.png", "Alikeangular", "Donegalone", "Imfelldwpicasc", "Cutivemono", "Pt Mono", "Vt323"])){
											//console.log('skipping:' + fonts[idx]['family']);
											continue;	
										}
										
										var font = fonts[idx];
										html += '\
											<div  class="font-wrapper">\
												<div family="' + font['family'] + '"   fontname="' + font['fontname'] + '" class="fontname" style="background: url(img/fonts/sprites/' + category + '.png); background-position: 0 -' +  font['pos']+ 'px"  >\
												</div>\
											</div>\
										';
										numfonts++;
									}
								
									$('#list').append('\
										<div  class="category" category="' + category + '" >\
											<div class="category-name" category="' + category + '" >\
												' + category + ' \
											</div>\
											<div class="fonts trans4s" category="' + category + '"  numfonts="' + numfonts + '">\
												' + html + '\
											</div>\
										</div> \
									');
							}

						}
						
					},
					
					layers: {

						getHTML: function() {
							var that = this;
							$('#edit-layers').height(59).load(
							'html/editbox/layers.html?version=' + version, function() {
								editbox.methods.layers.bind.init();
							});
						}	
					},
					
					align: {

						getHTML: function() {
							var that = this;
							$('#edit-align').load(
							'html/editbox/align.html?version=' + version, function() {
								editbox.methods.align.bind.init();
							});
						}	
					},
					
					text: {

						getHTML: function(callback) {
							var that = this;
									
							$('#edit-text').height(this.settings.textrow.richtext).load(
							'html/editbox/text.html?version=' + version, function() {
								editbox.methods.text.bind.init();
								callback( 'text' );
							});
						}	
					},
					
					zag: {

						getHTML: function() {
							var that = this;
									
							$('#edit-zag').load(
							'html/editbox/zag.html?version=' + version, function() {
								editbox.methods.zag.bind.init();
							});
						}	
					},
					
					charts:{

						getHTML: function() {
							var that = this;
							
							$('#edit-charts').height(this.settings.heightOfChartRow).load(
							'html/editbox/charts.html?version=' + version, function() {
								editbox.methods.charts.bind.init();
							});
						}	
					},
					
					customBorders:{

						getHTML: function() {
							var that = this;
							
							$('#edit-customBorders').height(150).load(
							'html/editbox/customborders.html?version=' + version, function() {
								editbox.methods.customBorders.bind.init();
							});
						}	
					},
					
					glow:{

						getHTML: function( callback ) {
							var that = this;
							
							$('#edit-glow').height(this.settings.opacityRow).load(
							'html/editbox/glow.html?version=' + version, function() {
								editbox.methods.glow.bind.init();
								callback( 'glow' );
							});
						}	
					},
					
					letterspace:{

						getHTML: function() {
							var that = this;
							
							$('#edit-letterspace').height(this.settings.opacityRow).load(
							'html/editbox/letterspace.html?version=' + version, function() {
								editbox.methods.letterspace.bind.init();
							});
						}	
					},	
									
					backgroundSize:{

						getHTML: function( callback ) {
							var that = this;
							
							$('#edit-backgroundSize').height(this.settings.opacityRow).load(
							'html/editbox/backgroundsize.html?version=' + version, function() {
								editbox.methods.backgroundSize.bind.init();
								callback( 'backgroundSize' );
							});
						}	
					},
					
					opacity:{

						getHTML: function( callback ) {
							var that = this;
							
							$('#edit-opacity').height(this.settings.opacityRow).load(
							'html/editbox/opacity.html?version=' + version, function() {
								editbox.methods.opacity.bind.init();
								callback( 'opacity' );
							});
						}	
					},
					
					svgshadow:{

						getHTML: function( callback ) {
							var that = this;
							
							$('#edit-svgshadow').height(this.settings.opacityRow).load(
							'html/editbox/svgshadow.html?version=' + version, function() {
								editbox.methods.svgshadow.bind.init();
								callback( 'svgshadow' );
							});
						}	
					},
					
					textshadow:{

						getHTML: function( callback ) {
							var that = this;
							
							$('#edit-textshadow').height(this.settings.opacityRow).load(
							'html/editbox/textshadow.html?version=' + version, function() {
								editbox.methods.textshadow.bind.init();
								callback( 'textshadow' );
							});
						}	
					},
					
					stroke:{

						getHTML: function( callback ) {
							var that = this;
							
							$('#edit-stroke').height(this.settings.opacityRow).load(
							'html/editbox/stroke.html?version=' + version, function() {
								editbox.methods.stroke.bind.init();
								callback( 'stroke' );
							});
						}	
					},
									
					grayscale:{

						getHTML: function(callback) {
							var that = this;
							
							$('#edit-grayscale').height(this.settings.opacityRow).load(
							'html/editbox/grayscale.html?version=' + version, function() {
								editbox.methods.grayscale.bind.init();
								callback( 'grayscale' );
								
							});
							
							
						}	
					},	
									
					blur:{

						getHTML: function(callback) {
							var that = this;
							
							$('#edit-blur').height(this.settings.opacityRow).load(
							'html/editbox/blur.html?version=' + version, function() {
								editbox.methods.blur.bind.init();
								callback( 'blur' );
							});
							
							
						}	
					},
					
					image:{

						getHTML: function() {
							var that = this;
							
							$('#edit-image').height(this.settings.heightOfImageRow).load(
							'html/editbox/image.html?version=' + version, function() {
								editbox.methods.image.bind.init();
							});
						}	
					},
					
					imgTools:{

						getHTML: function() {
							var that = this;
							
							$('#edit-imgTools').height(this.settings.heightOfImgToolsRow).load(
							'html/editbox/imgTools.html?version=' + version, function() {
								editbox.methods.imgTools.bind.init();
							});
						}	
					},
					
					cta:{

						getHTML: function() {
							var that = this;
							
							$('#edit-cta').height(this.settings.heightOfCTARow).load(
							'html/editbox/cta.html?version=' + version, function() {
								editbox.methods.cta.bind.init();
							});
						}	
					},
					
					aspect:{

						getHTML: function() {
							var that = this;
							
							$('#edit-aspect').height(60).load(
							'html/editbox/aspect.html?version=' + version, function() {
								editbox.methods.aspect.bind.init();
							});
						}	
					},
										
					rotate:{

						getHTML: function() {
							var that = this;
							
							$('#edit-rotate').height(this.settings.heightOfImgToolsRow).load(
							'html/editbox/rotate.html?version=' + version, function() {
								editbox.methods.rotate.bind.init();
							});
						}	
					},
					
					lock:{

						getHTML: function() {
							var that = this;
							
							$('#edit-lock').height(this.settings.heightOfLockRow).load(
							'html/editbox/lock.html?version=' + version, function() {
								editbox.methods.lock.bind();
							});
						}	
					},
					
					colors: {

						getHTML: function() {
							var that = this;
							$('#edit-colors').load(
							'html/editbox/colors.html?version=' + version, function() {
								
								editbox.methods.colors = {};
									
								var whichArray = [{ 
									'name': 'one',
									'dom': '#color-sample'
								},{
									'name': 'two',
									'dom': '#background-sample',
								}];

								for( var idx in whichArray){
									
									var whichbox = whichArray[idx].name;	
		
									editbox.methods.colors[whichbox] = new Colors();
									
									editbox.methods.colors[whichbox].launchFrom = 'editbox';
									
									editbox.methods.colors[whichbox].$sampleBox = $(whichArray[idx].dom);
									
									editbox.methods.colors[whichbox].$parent = $('#color-wheel-container').find('.' + whichArray[idx].name);
						
									editbox.methods.colors[whichbox].setColor = function( color, saveToUsed) {	
										
										if( typeof( editbox.view.setColor) != 'undefined' ) editbox.view.setColor( color, saveToUsed);
				
										if( app.methods.hasFont(editbox.view.collection)){
											
											if( editbox.view.collection == 'richtext'){
												
												if( !app.stubs.blockRenderPng) {
													
													editbox.view.$textEdit.css('color', color);
													editbox.view.model.get('json').style.textedit.color = color;
													
													app.stubs.blockRenderPng = true;
													editbox.view.$textEdit.html(editbox.view.model.get('json').data.text);
													editbox.view.adaptHeightToTextedit('adaptHeightToTextedit from setColor');
													console.log(saveToUsed);
													if(saveToUsed) {
														editbox.view.renderPngFromTextedit('editbox text set color', function() {
															app.stubs.blockRenderPng = false;
															saveHistory('editbox paragraphs headers color change');	
														});																	
													} else{
														app.stubs.blockRenderPng = false;
													}
											
												}
												
											} else{
												
												
												whichArray[0].targetStyle = 'color';
												whichArray[1].targetStyle = '-webkit-text-fill-color';
												
												var whichboxName = this.$parent.attr('class'),
														idx	=	tools.findIndexInArrayOfObjects( whichArray,	function(	obj	){
															if(	obj.name ==	whichboxName ) return	true;
														});
														
												editbox.view.$textEdit.css(whichArray[idx].targetStyle, color);
												editbox.view.model.get('json').style.textedit[whichArray[idx].targetStyle] = color;
												
												if( idx == 1 ){ // fill
													editbox.view.model.get('json').data.strokefill = color;
												}
												
												if( editbox.view.collection == 'headers' ) editbox.view.model.get('json').data.needFreshPNG = true;
												if( editbox.view.collection == 'numbers' ) editbox.view.model.get('json').data.needFreshPNG = true;
												
											}
											 	
											if( saveToUsed && editbox.view.collection != 'richtext') saveHistory('editbox paragraphs headers color change');	
												
										} else if( tools.inArray(editbox.view.collection, app.settings.canSaveImageToCloudDrive)){
											
												editbox.view.$el.find('img').css('border-color', color);
												editbox.view.model.get('json').style.image['border-color'] = color;
												
												if( saveToUsed ) saveHistory('editbox  cansave to drive color change');
												
										} else if( editbox.view.collection == 'backgrounds' ){
											
												editbox.view.$el.find('.background').css('border-color', color);
												editbox.view.model.get('json').style['background']['border-color'] = color;
												
												if( saveToUsed ) saveHistory('editbox background  cansave to drive color change');
												
										// } else if( editbox.view.collection == 'svgshapes' ){ 
										} else if( tools.inArray(editbox.view.collection, app.settings.hasSvgshapes) ){ // working  color saves
											
												whichArray[0].targetStyle = 'stroke';
												whichArray[1].targetStyle = 'fill';
													
												var whichboxName = this.$parent.attr('class'),
														idx	=	tools.findIndexInArrayOfObjects( whichArray,	function(	obj	){
															if(	obj.name ==	whichboxName ) return	true;
														});

												editbox.view.$svgshape.css(whichArray[idx].targetStyle, color);
												editbox.view.model.get('json').style['svgshape'][whichArray[idx].targetStyle] = color;
												
												if( saveToUsed ) saveHistory('editbox svgshapes cansave to drive color change');
												
										}  else{
											
											switch(	editbox.view.collection ){
												
												case 'mask': 
												case 'polygon': 
												case 'shapes': 
												case 'shapeone': 	
												case 'shapetwo': 	
												case 'shapefour': 	
												case 'shapethree': {	
													
													whichArray[0].targetStyle = 'border-color';
													whichArray[1].targetStyle = 'background-color';
													
													var whichboxName = this.$parent.attr('class'),
															idx	=	tools.findIndexInArrayOfObjects( whichArray,	function(	obj	){
																if(	obj.name ==	whichboxName ) return	true;
															});
												
													editbox.view.$el.find('.shape').css(whichArray[idx].targetStyle, color);
													editbox.view.model.get('json').style.shape[whichArray[idx].targetStyle] = color;
													
													if( saveToUsed ) saveHistory('editbox shapes color change');
													
													
													break;
													
												}
												
												case 'straights': {

														editbox.view.$line.css('border-top-color', color);
														editbox.view.model.get('json').style.line['border-top-color'] = color;
														if( saveToUsed ) saveHistory('editbox straight eLines headers color change');

													break;
													
												}
				
												case 'dynolines': {
													
													editbox.view.$el.find('.line').css('border-color', color);
													editbox.view.$el.find('.line').css('background-color', color);
													
													editbox.view.$el.find('style').remove();
													editbox.view.createPseudoForStyleFor('before', editbox.view.$line);
													editbox.view.createPseudoForStyleFor('after', editbox.view.$line);	
													
													editbox.view.model.get('json').style.line['border-color'] = color;
													
													if( saveToUsed ) saveHistory('editbox dynoline color change');								
													
													break;
												}
												
												case 'zagLines': {
														
														editbox.view.$el.find('.zag').css('border-color', color);
														editbox.view.model.get('json').style.line['border-color'] = color;
														if( saveToUsed ) saveHistory('editbox zagLines headers color change');
														
													break;
												}
												
												case 'angleLines': {
													
														editbox.view.$el.find('.angle').css('border-color', color);
														editbox.view.model.get('json').style.line['border-color'] = color;
														if( saveToUsed ) saveHistory('editbox angleLines headers color change');
														
													break;
												}
												
											}
										}
										
										if(editbox.view.collection == 'dynolines'){}
	
										this.farbtastic.setColor(color);

										if( color.toUpperCase() == 'TRANSPARENT'){
											this.$sampleBox.css('background', this.transparent);
											this.farbtastic.setColor('#FFFFFF');
										} else{
											this.$sampleBox.css('background', color);
											this.farbtastic.setColor(color);
											if( saveToUsed )this.addColorToUsed(color);
										}
										
									};
						
									editbox.methods.colors[whichbox].label = function( view ) {
										
										var $rowBackgroundSample = $('#background-sample').parent().parent();
										
										$('#color-sample, #color-label').show();	
										$rowBackgroundSample.show();	
										
										if( typeof( editbox.view.setLabel) != 'undefined' ) editbox.view.setLabel();

										if( app.methods.hasFont(editbox.view.collection)){
											
											var eleLayer = 'textedit',
													color = view.model.get('json').style.textedit.color;
													
													$('#color-sample').css({
														'background': color	
													});
											
											if( tools.detectIE() ) return; 

											if(editbox.view.collection == 'headers'){
												
												var strokewidth = view.model.get('json').data.strokewidth;
												
												if( typeof( strokewidth ) != 'undefined' && parseFloat(strokewidth) > 0 ){
													$rowBackgroundSample.show();
												} else {
													$rowBackgroundSample.hide();
												};
												
												var strokefill = view.model.get('json').data.strokefill;
												var transparentUrl = 'url(' + 'img/transparent.png)';
												
												if(	strokefill == 'TRANSPARENT') strokefill = transparentUrl;

												if( typeof( strokefill ) != 'undefined'){
													$('#background-sample').css({ 'background': strokefill });					
												} else{
													$('#background-sample').css({ 'background': 'transparent' });
												}
												
											} else{
												$rowBackgroundSample.hide();
											} 
													
										} else if( tools.inArray(editbox.view.collection, app.settings.canSaveImageToCloudDrive) ){
											
											var color = view.model.get('json').style.image['border-color'];
													
													$('#color-sample').css({
														'background': color	
													});
												
										} else{
											
											switch(	editbox.view.collection ){
												
												case 'icons': {
														var backgroundColor = 	view.model.get('json').style.element['background-color'],
																borderColor = view.model.get('json').style.element['border-color'];
																
														$('#background-sample').css({
															'background-color': backgroundColor	
														});
							
														$('#border-sample').css({
															'background': borderColor	
														});	
													break;
												}
												
												case 'dynolines': {
													
														var borderColor = view.model.get('json').style.line['border-color'];
				
														$('#color-sample').css({
															'background': borderColor	
														});
														
													break;
												}
												case 'zagLines': {
													
														var borderColor = view.model.get('json').style.line['border-color'];
				
														$('#color-sample').css({
															'background': borderColor	
														});
														
													break;
												}
												case 'angleLines': {
													
														var borderColor = view.model.get('json').style.line['border-color'];
				
														$('#color-sample').css({
															'background': borderColor	
														});
														
													break;
												}
											}
											
											if(  tools.inArray( view.model.get('json').collection, app.settings.hasSvgshapes) ){   
												// working color labels
												
												var color = view.model.get('json').style.svgshape['fill'];
												var stroke = view.model.get('json').style.svgshape['stroke'];
														
												$('#background-sample').css({
													'background':color
												});
												
												$('#color-sample').css({
													'background': stroke
												});
												
											}
										}
										
									};
									
									editbox.methods.colors[whichbox].init();
									
								}

							});
						}
					}
					
				},

			},
			
			methods: {
				
				textAlign: {	
						
					bind: {
						
						init: function() {

							$('.alignicon').on('click', function(e) {
								
								app.methods.clearActive( ['hideColorPicker'], 'include', 'show border');
								
								e.stopPropagation();
								
								editbox.view.$textEdit.html( editbox.view.model.get('json').data.text);	
								editbox.view.adaptHeightToTextedit('text-align for richtext editbox');
								var how = $(this).attr('how');
								
								editbox.view.model.get('json').style.textedit['text-align'] = how;
								editbox.view.$textEdit.css('text-align', how);

								editbox.view.renderPngFromTextedit('text-align for richtext', function() {
									saveHistory('text-align richtext');	
								});

							})
														
						}
					},
					
					label: function() {
						
						if( typeof( editbox.view.model.get('json').style.textedit['font-weight'] ) != 'undefined' && 
								editbox.view.model.get('json').style.textedit['font-weight'] == 'bold' ){
							var boldIt = true;
						}else{
							var boldIt = false;
						};
				
						
					}
				},
				
				moretext: {	
						
					bind: {
						
						init: function() {
							

							$('#make-bold').on('click', function(e) {
								
								if(  editbox.view.collection == 'richtext' ){
									if(app.stubs.blockRenderPng) {
										if( $(this).is(':checked')) {
											$('.myCheckbox').prop('checked', false);
										} else{
											$('.myCheckbox').prop('checked', true);
										}
										return;	
									} else{
										app.stubs.blockRenderPng = true;
									}
								};
								
								app.methods.clearActive( ['hideColorPicker'], 'include', 'show border');
								
								e.stopPropagation();
								
								if( editbox.view.collection == 'richtext') {
									editbox.view.$textEdit.html( editbox.view.model.get('json').data.text);	
								}
								
								if( $(this).is(':checked')) {
									
									editbox.view.model.get('json').style.textedit['font-weight'] = 'bold';
									editbox.view.$textEdit.css('font-weight', 'bold');

								} else{
									
									editbox.view.model.get('json').style.textedit['font-weight'] = 'normal';
									editbox.view.$textEdit.css('font-weight', 'normal');
									
								}
								
								if( editbox.view.collection == 'richtext'){
									editbox.view.adaptHeightToTextedit();
									editbox.view.renderPngFromTextedit('making bold change to richtext', function() {
										saveHistory('bold change to richtext');
										app.stubs.blockRenderPng = false;	
									});
								}else{
									// editbox.view.redoAspectRatioAndSize('moretext bold');
									saveHistory('moretext bold');
									editbox.view.model.get('json').data.needFreshPNG = true;
								};
								
								
							})
							
							$('#make-italic').prop( "checked", true ).on('click', function(e) {
								
								if(  editbox.view.collection == 'richtext' ){
									if(app.stubs.blockRenderPng) {
										if( $(this).is(':checked')) {
											$('.myCheckbox').prop('checked', false);
										} else{
											$('.myCheckbox').prop('checked', true);
										}
										return;	
									} else{
										app.stubs.blockRenderPng = true;
									}
								};
								
								app.methods.clearActive( ['hideColorPicker'], 'include', 'show border');
								
								e.stopPropagation();
								
								if( editbox.view.collection == 'richtext') {
									editbox.view.$textEdit.html( editbox.view.model.get('json').data.text);	
								}
								
								if( $(this).is(':checked')) {
									
									editbox.view.model.get('json').style.textedit['font-style'] = 'italic';
									editbox.view.$textEdit.css('font-style', 'italic');

								} else{
									
									editbox.view.model.get('json').style.textedit['font-style'] = 'normal';
									editbox.view.$textEdit.css('font-style', 'normal');
								}
								
								if( editbox.view.collection == 'richtext'){
									editbox.view.adaptHeightToTextedit();
									editbox.view.renderPngFromTextedit('making italic change to richtext', function() {
										saveHistory('italic change to richtext');
										app.stubs.blockRenderPng = false;
									});
								}else{
									editbox.view.redoAspectRatioAndSize('moretext italic');
									saveHistory('moretext italic');
									editbox.view.model.get('json').data.needFreshPNG = true;
								};

							})
							
							$('#make-uppercase').prop( "checked", true ).on('click', function(e) {
								if(  editbox.view.collection == 'richtext' ){
									if(app.stubs.blockRenderPng) {
										if( $(this).is(':checked')) {
											$('.myCheckbox').prop('checked', false);
										} else{
											$('.myCheckbox').prop('checked', true);
										}
										return;	
									} else{
										app.stubs.blockRenderPng = true;
									}
								};
								
								app.methods.clearActive( ['hideColorPicker'], 'include', 'show border');
								
								e.stopPropagation();
								
								if( editbox.view.collection == 'richtext') {
									editbox.view.$textEdit.html( editbox.view.model.get('json').data.text);	
								}
								
								if( $(this).is(':checked')) {
									
									editbox.view.model.get('json').style.textedit['text-transform'] = 'uppercase';
									editbox.view.$textEdit.css('text-transform', 'uppercase');

								} else{
									
									editbox.view.model.get('json').style.textedit['text-transform'] = 'none';
									editbox.view.$textEdit.css('text-transform', 'none');
								}
								
								if( editbox.view.collection == 'richtext'){
									editbox.view.adaptHeightToTextedit();
									editbox.view.renderPngFromTextedit('making uppercase change to richtext', function() {
										saveHistory('uppercase change to richtext');
										app.stubs.blockRenderPng = false;
									});
								}else{
									editbox.view.redoAspectRatioAndSize('uppercase');
									saveHistory('moretext uppercase');
									editbox.view.model.get('json').data.needFreshPNG = true;
								};

							})
											
						}
					},
					
					label: function() {
						
						if( typeof( editbox.view.model.get('json').style.textedit['font-weight'] ) != 'undefined' && 
								editbox.view.model.get('json').style.textedit['font-weight'] == 'bold' ){
							var boldIt = true;
						}else{
							var boldIt = false;
						};
						
						$('#make-bold').prop( "checked", boldIt );	
						
						if( typeof( editbox.view.model.get('json').style.textedit['font-style'] ) != 'undefined' && 
								editbox.view.model.get('json').style.textedit['font-style'] == 'italic' ){
							var italicIt = true;
						}else{
							var italicIt = false;
						};
						
						$('#make-italic').prop( "checked", italicIt );	
						
						
						if( typeof( editbox.view.model.get('json').style.textedit['text-transform'] ) != 'undefined' && 
								editbox.view.model.get('json').style.textedit['text-transform'] == 'uppercase' ){
							var uppercaseIt = true;
						}else{
							var uppercaseIt = false;
						};
						
						$('#make-uppercase').prop( "checked", uppercaseIt );							
						
						
					}
				},
								
				borderstyle: {		
					bind: {
						init: function() {
							
							$('#border-style-wrapper input').on('click', function(e) {
								
								e.stopPropagation();
								
								var borderStyle = $(this).val();
								
								console.log(borderStyle);
								
								editbox.view.$shape.css('border-style', borderStyle);
								
								editbox.view.model.get('json').data['border-style'] = borderStyle;
							
								saveHistory('image showborder');
							})
						}
					}
				},
				
				showborder: {		
					bind: {
						init: function() {
							
							$('#showborder input').on('click', function(e) {
								
								app.methods.clearActive( ['hideColorPicker'], 'include', 'show border');
								
								e.stopPropagation();
								
								var side = $(this).attr('side')
								
								if( $(this).is(':checked')) {
									
									editbox.view.model.get('json').data.show[side] = true;
									var borderWidthOnDom = editbox.view.model.get('json').data['border-width'] * scale;

									if ( borderWidthOnDom > 0 && borderWidthOnDom < 1  ) {
										borderWidthOnDom = 1;
									}

									editbox.view.$shape.css('border-' + side + '-width', borderWidthOnDom + 'px');
									editbox.view.$shape.css('border-' + side + '-style', editbox.view.model.get('json').data['border-style']);
									
								} else{
									editbox.view.model.get('json').data.show[side] = false;
									editbox.view.$shape.css('border-' + side + '-width', '0');
								}
								
								saveHistory('image showborder');
							})
						}
					}
				},
								
				aspect: {		
					bind: {
						init: function() {
							
							$('#set2free').click( function(event) {
								event.preventDefault();
								$('#aspectratio-shape-field').val(0);
								$('#aspect-shape-button').click();
								toast('Element is now resizable to any dimension.')
							});
							
							$('#set2square').click( function(event) {
								event.preventDefault();
								$('#aspectratio-shape-field').val(1);
								$('#aspect-shape-button').click();
								toast('Element is now resizable to square.')
							});							
							
							$('#set2canvas').click( function(event) {
								event.preventDefault();
								$('#aspectratio-shape-field').val(app.stubs.canvasAspectRatio);
								$('#aspect-shape-button').click();
								toast('Element is now resizable to match canvas.')
							});							
							
							$('#aspect-shape-button').on('mousedown', function() {	
								$(this).addClass('pressdown');
							}).on('mouseup', function() {	
								$(this).removeClass('pressdown');
							});		
							
							$('#aspect-shape-button').on('click', function() {
								
								var newAspect = $('#aspectratio-shape-field').val();
								
								if( $('#aspectratio-shape-field').val() == '' || $('#aspectratio-shape-field').val() == 0 ){
									editbox.view.model.get('json').data.aspectratio = false;
									editbox.view.resize.options.aspectRatio = false;
									if( typeof( editbox.view.setDblClick ) != 'undefined' ) editbox.view.setDblClick();
								} else{
									editbox.view.resize.options.aspectRatio = newAspect;
									editbox.view.model.get('json').data.aspectratio = newAspect;
									var width = parseFloat(editbox.view.model.get('json').style.element.width);
									var newHeight = width / newAspect;
									editbox.view.model.get('json').style.element.height = newHeight + 'px';
									editbox.view.$el.height(newHeight * scale);
									editbox.view.$resizeWrapper.height(newHeight * scale);

									if( tools.inArray(editbox.view.collection, app.settings.hasSvgshapes) ){  // working aspect
										editbox.view.$svgshape.css({
											height: newHeight * scale + 'px'
										});
									}

								}
								editbox.view.$resizeWrapper.resizable('destroy').resizable( editbox.view.resize.options );
								
								saveHistory('aspie');
								
							})
						}
					},
					label: function() { // working label aspect
						var width = parseFloat(editbox.view.model.get('json').style.element.width),
								height = parseFloat(editbox.view.model.get('json').style.element.height);
						$('#aspectratio-shape-field').val( width/height)
					}
				},
				
				rotate: {		
					bind: {
						init: function() {
							
							$('#rotate-button-wrapper').on('click', '.angle',  function() {
								
								var angle = $(this).attr('angle'),
										rotateAngle = 'rotate(' + angle + 'deg)',
										reverseRotate = ( angle < 0 ? Math.abs(angle) : '-' + Math.abs(angle));

								if( app.stubs.grouped.length > 0 ){  

									var rotateIt = app.methods.groupyBox.rotateIt;
									rotateIt.init( $('#rotate-wrapper') );
									var rotating = rotateIt.rotating = rotateIt.rotation = angle;
										
									if($('#groupy').is('.ui-resizable') ) $('#groupy').resizable('destroy');
									rotateIt.custom.groupy.cloneIntoGroupy.call( rotateIt );
									
									for( var idx in	app.settings.keysInLayout){
										rotateIt.$container.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(' + rotating	+	'deg)');
									};

									var reverseRotate = ( rotating < 0 ? Math.abs(rotating) : '-' + Math.abs(rotating));

									rotateIt.$container.find('.custom-handle').css('transform', 'rotate(' +  reverseRotate + 'deg)');

									$('#groupy').find('.rotate-handle').css('visibility', 'hidden');
									
									saveHistory('rotate-button');
									app.stubs.stillRotating = true;
									
									return;	// WORKING
								}
								
								if( typeof( editbox.view.model.get('json').style.resizeWrapper ) == 'undefined') {
									
									for(var	idx	in app.settings.keysInLayout){
										editbox.view.model.get('json').style.resizeWrapper[app.settings.keysInLayout[idx] + 'transform'] = 'rotate(0deg) scaleX(1)';
									}
									
									editbox.view.model.get('json').data.mirror = 1;
									
								}
								
								var mirror = ( typeof( editbox.view.model.get('json').data.mirror ) != 'undefined' ? editbox.view.model.get('json').data.mirror: 1);
										
								for( var idx in	app.settings.keysInLayout){
									editbox.view.$el.css(app.settings.keysInLayout[idx]  + app.settings.keysInLayout[idx] + 'transform', rotateAngle + ' ' +  'scaleX(' + mirror + ')');
									editbox.view.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(0deg)'  + ' ' +  'scaleX(' + mirror + ')');
									editbox.view.model.get('json').style.element[app.settings.keysInLayout[idx]  + 'transform'] = rotateAngle;
									editbox.view.model.get('json').style.resizeWrapper[app.settings.keysInLayout[idx]  + 'transform'] = 'rotate(0deg)' + ' ' +  'scaleX(' + mirror + ')';
									editbox.view.$el.find('.custom-handle').css('transform', 'rotate(' + reverseRotate * mirror + 'deg)');
								}
								
								editbox.view.rotateIt.custom.elements.changeDirectionOfResizeHandlesFromRotation.call( editbox.view.rotateIt, angle );
								
								editbox.view.model.get('json').data.rotation = angle;

								if( angle != 0){
									editbox.view.$el.addClass('rotated');
								} else{
									editbox.view.$el.removeClass('rotated');
								};
								
								editbox.view.reviseDimOfElement();
								
								saveHistory('angle1');
								
							})
						}
					}
				},
				
				cta: {		
					bind: {
						
						init: function() {
							
							this.callToAction();
							this.pdfToAction();
						},
						
						callToAction: function() {

							$('#callToActionButton').on('click', function() {
								
								$('#modal-box').css('padding', '50px').width(620).height(23);
								
								app.methods.modal.on( 'true' );	
								var that = this;
								
								$('#modal-box').load('html/submit_url.html?version=' + version,
									function() {
										
										if( typeof( editbox.view.model.get('json').data.cta ) != 'undefined'){
											$('#submit-url-input').val(editbox.view.model.get('json').data.cta);
										}

										$('#submit-url-button').click(
											function(e) {
												
												e.preventDefault();

												var cta = $('#submit-url-input').val();
												
												editbox.view.model.get('json').data.cta_num = app.methods.nextCTACount();
												editbox.view.model.get('json').data.cta = cta;
												
												app.methods.modal.off('Al');
												
											}
											
										);
										
										
									}
								);
								
							})

						},
						
						pdfToAction: function() {

							$('#ctaPDFButton').on('click', function(event) {
								
									event.preventDefault();
									
									app.methods.progressBar.start();
										
									if( app.stubs.saving ){
										toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
										return;
									}
									app.stubs.saving = true;
									app.stubs.savingWhat = 'Retrieving files';
									
									var url = 'app/getPDFList',
											postObj = {
												'google_id': app.stubs.google_id
											};
						
									tools.ajax(url, postObj, 'post', function(data) {
										
										app.stubs.saving = false;
						
										app.methods.progressBar.stop('pdf cta');
										if( data.length == 0){
											toast('There are no files found.  Try creating one first.', 'keep', 5000, 'info', 'Note.');
											return;
										};
										
										app.methods.modal.on( 'true' );	
										
										$('#modal-box').css('padding', '0px').width(800).height(400);
										
										$('#modal-box').load('html/open_pdf.html?version=' + version,
											function() {
												
												var len = data.length,
														count = 0,
														imgCount = 0;
														
												for( var idx in data){
													count++;
													var file = data[idx],
															src = file['thumbnailLink'],
															fileId = file['fileId'];
															
													$('#pdf-files-container').append('\
														<img class="old-thumb transition2s" count="'+ count +'" fileId="' + fileId  + '" src="' + src + '">\
													');																
												}
												
												$('#pdf-files-container img').each( function() {
													$(this).on('load', function() {
														
														imgCount++;
														
													});													
												});
												
												tools.doWhenReady( function() {
													if( imgCount ==  len) return true
													else return false
												},
												function() {
												
													$('#pdf-files-container').wookmark();
													
													$('#pdf-files-container').on('click', 'img', function() {
														
														$(this).unbind('click');
														
														app.methods.modal.off('AB');
														
														var fileId = $(this).attr('fileId');
														
														editbox.view.model.get('json').data.cta_num = app.methods.nextCTACount();
														editbox.view.model.get('json').data.cta = 'pdfDownload';
														editbox.view.model.get('json').data.cta_pdfId = fileId;
														
														return false;
						
													})
												},
												'placefinder fgdfggdf'
												);
												
						
												
											});
						
									});	
										
							});
							
						}
						
					}
				},
				
				imgTools: {		
					bind: {
						
						init: function() {
							
							this.mirror();
							this.crop();
						},
						
						crop: function() {
							
							$('#cropButton').on('click', function() {
								
								app.methods.crop( editbox.view.model.get('json').data, undefined, function( newlyCropped ) {

									var dataCropped = tools.crop( $('#crop-target')[0], newlyCropped),
											model = editbox.view.model;
									
									model.get('json').data.base64 = dataCropped.base64;
									model.get('json').style.element.height = dataCropped.height + 'px';
									model.get('json').style.element.width = dataCropped.width + 'px';
									model.get('json').data.width = dataCropped.width;
									model.get('json').data.height = dataCropped.height;
									model.get('json').data.aspectratio = dataCropped.width/dataCropped.height;
									editbox.view.$img.attr('src', app.settings.base64Prefix + dataCropped.base64);
									editbox.view.$el.css({
										width: dataCropped.width * scale + 'px',
										height: dataCropped.height * scale  + 'px'	
									});
									editbox.view.$resizeWrapper.css({
										width: dataCropped.width * scale  + 'px',
										height: dataCropped.height * scale  + 'px'	
									});
									editbox.view.rotateIt.centerRotateHandle();											
									editbox.view.resize.options.aspectRatio = parseFloat(model.get('json').style.element.width) / parseFloat(model.get('json').style.element.height);
									editbox.view.$resizeWrapper.resizable('destroy').resizable( editbox.view.resize.options );


									app.methods.clearActive(undefined, undefined, 'crop tool');

								}, editbox.view)
								
							})
						},
						
						
						mirror: function() {

							$('#mirrorButton').on('click', function() {
								
								if( typeof( editbox.view.model.get('json').style.resizeWrapper ) == 'undefined') editbox.view.model.get('json').style.resizeWrapper = {};
								
								var angle = editbox.view.model.get('json').data.rotation,
										reverseRotate = ( angle < 0 ? Math.abs(angle) : '-' + Math.abs(angle)),
										mirror = ( typeof( editbox.view.model.get('json').data.mirror ) != 'undefined' ? editbox.view.model.get('json').data.mirror: 1);
								
								if(mirror == 1 ){
									mirror = -1;
									reverseRotate = angle;
								} else{
									mirror = 1;
									reverseRotate = angle * -1;
								} 
								
								for( var idx in	app.settings.keysInLayout){
									editbox.view.$resizeWrapper.css('transform', 'rotate(' +  angle + 'deg) scaleX(' + mirror + ')');
									editbox.view.$el.find('.custom-handle').css('transform', 'rotate(' + reverseRotate + 'deg) scaleX(' + mirror + ')');
									editbox.view.model.get('json').style.resizeWrapper[app.settings.keysInLayout[idx] + 'transform']  =  'rotate(' +  angle + 'deg) scaleX(' + mirror + ')';
								}
								
								
								editbox.view.model.get('json').data.mirror = mirror;	
								// working mirror
								editbox.view.rotateIt.custom.elements.changeDirectionOfResizeHandlesFromRotation.call( editbox.view.rotateIt, angle); 
								
								
								
								saveHistory('mirror');				
								
							})

						}
						
					}
				},
								
				lock: {

					locking: function( view ) {
						
						var curView = ( typeof( view ) != 'undefined' ? view : editbox.view);
						
						console.log(curView.collection);
						
						curView.model.get('json').data.isLocked = true;
						app.stubs.locked.push(curView.model.cid);
						curView.$el.appendTo('.panel-wrapper');
						if( curView.collection != 'dynolines') curView.$el.draggable( 'disable' ).addClass('locked'); 
						app.stubs.recentlySaved = false;
						window.onbeforeunload = app.methods.confirmOnPageExit;
						this.reorderLockedItems();
						editbox.methods.layers.redoLayers();
						this.checkZ();
						
					},
					
					unlocking: function( cid ) {
						
						$('#panel_0').append($('#' + cid));
						if( app.stubs.views.elements[cid].collection != 'dynolines') $('#' + cid).draggable( 'enable' ).removeClass('locked');
						var idx	=	_.indexOf( app.stubs.locked, cid);
						app.stubs.locked.splice(idx, 1);
						delete app.stubs.collections.elements.get(cid).get('json').data.isLocked;
						app.stubs.collections.elements.get(cid).get('json').style.element['z-index'] = -1;
						app.stubs.recentlySaved = false;
						window.onbeforeunload = app.methods.confirmOnPageExit;
						this.reorderLockedItems();
						editbox.methods.layers.redoLayers();
						this.checkZ();
						
					},
					
					reorderLockedItems: function() {
						
						for( var idx in app.stubs.locked){
							
							var zIndex = parseInt(idx) + 1,
									cid = app.stubs.locked[idx];
							app.stubs.collections.elements.get(cid).get('json').style.element['z-index'] = zIndex;
							app.stubs.views.elements[cid].$el.css('z-index', zIndex);
							
							
						}
					},
					
					ghostFlyToLockedButton: function( $element, disableFlash ) {
						var speed = 500,
								$lockButton = $('#lock2Button');
						
						$element
									.clone()
				          .appendTo($('body'))
						      .offset({
					          'top': $element.offset().top,
					          'left': $element.offset().left
						      })
						      .css({
			              'position': 'absolute',
					          'opacity': .6,
					          'z-index': '9999'
						      })
						     	.animate({
			              'left': $lockButton.offset().left,
					          'top': $lockButton.offset().top
						      }, speed, 'easeInCirc', function() {
						      	
						      	$(this).remove();

						      	if(typeof( disableFlash ) == 'undefined') {
						      		app.methods.animate( $lockButton, 'flash', 1);
						      	}
						      	
						     	})
				          .find('div').each( function() {
						     		$(this).animate({
						          'width': 0,
						          'height': 0,
						          'font-size': 0
							      }, speed, 'easeInCirc')
						     	})
					},

					bind: function() {		
						
						var that = this;
								
						$('#lockThisElement').click( function() {
							
							if( app.stubs.grouped.length == 0 ){

								app.methods.clearActive( ['hideColorPicker'], 'include', 'show border');
	
								that.locking();
								
								that.ghostFlyToLockedButton( editbox.view.$el );
								
								app.methods.clearActive(['doitQueue', 'previewOn'], 'exclude', ' locked groupy  clearx');	
								
							}else{

									var count = 0,
											toBeFlown = [],
											disableFlash = true;
									
									for( var idx in app.stubs.grouped){
										var cid = app.stubs.grouped[idx],
												view = app.stubs.views.elements[cid];
										editbox.methods.lock.locking( view );
										toBeFlown.push(cid);
									}
									
									for( var idx in toBeFlown){
										count += 100;
										setTimeout(function(){
											editbox.methods.lock.ghostFlyToLockedButton( $('#' + toBeFlown.pop() ), disableFlash );
										}, count);
										
									}									

									app.methods.animate( $('#lock2Button'), 'flash', 1);									
									app.methods.clearActive(['doitQueue'], 'exclude', ' locked groupy  clearx');
									$('.tooltip').hide();
									saveHistory('groupy lock');
										
							};
							
							return false;

							
						});
						
						$('#disable-align-input').click( function(e) {
							
							if( app.stubs.grouped.length == 0 ){	
														
								app.methods.clearActive( ['hideColorPicker'], 'include', 'show border');
							
								e.stopPropagation();
							
								if( $(this).is(':checked')) {
									
									editbox.view.alignIsDisabled = true;

								} else{
									
									editbox.view.alignIsDisabled = false;
									 
								}
								
							}else{		
								
								if( $(this).is(':checked')) {
									app.methods.groupyBox.disableAlign = true;
								} else{
									app.methods.groupyBox.disableAlign = false;
								}
								
								e.stopPropagation();	
									
							};
														
								
						});
						
					},
					
					cloneElementToLockedContainer: function( origModel ) {

						var that = this,
								boxSize = 100,
								origCid = origModel.cid,
								origView = app.stubs.views.elements[origCid];		

						
						if( origView.collection == 'dynolines'){
							
							var	leftEdge = new app.methods.GetEdge( 'left', [origCid]	),
									topEdge	=	new	app.methods.GetEdge(	'top', [origCid]	),
									rightEdge	=	new	app.methods.GetEdge(	'right', [origCid]	),
									bottomEdge = new app.methods.GetEdge( 'bottom', [origCid]	),
									panelLeft = $('#panel_0').offset().left,
									panelTop =  $('#panel_0').offset().top,
									edgeContainerOffsetLeft = leftEdge.furthest() + panelLeft,
									edgeContainerOffsetTop = topEdge.furthest() + panelTop,
									box1Left = (origView.$box1.offset().left - edgeContainerOffsetLeft) * multiple,
									box1Top = (origView.$box1.offset().top - edgeContainerOffsetTop) * multiple,
									box2Left = (origView.$box2.offset().left - edgeContainerOffsetLeft) * multiple,
									box2Top = (origView.$box2.offset().top - edgeContainerOffsetTop) * multiple,
									elementLeft	=	leftEdge.furthest() * multiple,
									elementTop = topEdge.furthest() * multiple,
									elementRight = rightEdge.furthest() * multiple,
									elementBottom	=	bottomEdge.furthest() * multiple,
									width = elementRight - elementLeft,
									height = elementBottom - elementTop,
									shrinkBy = ( height > width  ? boxSize/height : boxSize/width),
									origBoxSize = 70,
									newBoxSize = origBoxSize * shrinkBy,
									cloneJson	=	$.extend(	true,	{},	origModel.get('json')),
									model = new models.ElementModel();
									
							model.set('json', cloneJson);
							
							var cid = model.cid,
									View = views.elements.Dynolines.extend({
										'model': model,
										'renderLine': function() {
				
											var	x1 = this.$box1.offset().left	+	this.centerOffset * shrinkBy;
											var	x2 = this.$box2.offset().left	+	this.centerOffset * shrinkBy;
											var	y1 = this.$box1.offset().top + this.centerOffset * shrinkBy;
											var	y2 = this.$box2.offset().top + this.centerOffset * shrinkBy;
											
								
											var	hypotenuse = this.lineWidth = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
											var	angle	=	this.angle = Math.atan2((y1-y2),	(x1-x2)) * (180/Math.PI);
											
											
											if(angle >=	90 &&	angle	<	180){
												y1 = y1	-	(y1-y2);
											}
											if(angle > 0 &&	angle	<	90){
												x1 = x1	-	(x1-x2);
												y1 = y1	-	(y1-y2);
											}
											if(angle <=	0	&& angle > -90){
												x1 = x1	-	(x1-x2);
											}
								
											var	rotateAngle = 'rotate(' + angle + 'deg)';
								
											var that = this;
								
											this.$line.queue(function(){
												$(this).offset({top: y1, left: x1});
												$(this).dequeue();
												
											}).queue(function(){
												
												$(this).width(hypotenuse);
												$(this).dequeue();
												
											}).queue(function(){
												for( var idx in	app.settings.keysInLayout){
													$(this).css(app.settings.keysInLayout[idx] + 'transform', rotateAngle);
												}
												$(this).dequeue();
											});
								
										},
										'createHTML': {
											init:	function() {
												this.createHTML.buildClassStringFromKinds.call(	this );
												this.createHTML.paint.call(	this );
											},
											buildClassStringFromKinds: function()	{
												this.classString =	'';
												var kindStr = this.model.get('json').data.kinds;
												for( var idx in kindStr){
													this.classString	+= ' ' + kindStr[idx];
												}
												
											},
											paint: function()	{
												
												var	html = _.template(	this.createHTML.templates.elements,	{
														id:	this.model.cid,
														origCid:	origCid,
														elementStyle: this.templateObj.elementStyle,
														classString: this.classString,
														collection: this.collection,
													});
								
												this.html = html;
												
											},
											templates:	{
												elements:'\
													<div class="box-wrapper" origcid="<%= origCid %>" >\
														<div   id="<%= id %>"  collection="<%= collection %>"  style="<%= elementStyle %>"  class="elements dynoline"	>\
															<div where="left" class="box"></div>\
															<div where="right"  class="box"></div>\
															<div class="line <%= classString %>"></div>\
														</div>\
													</div>\
												'
											}
										},
										'scaleLine': function() {
						
											var that = this;
											this.$el.find('style').remove();						
											this.createPseudoForStyleFor('before', this.$line);
											this.createPseudoForStyleFor('after', this.$line);
											
											this.$line.addClass('line_' + this.model.cid);
											
											if( typeof(this.$line.data('height')) == 'undefined' ){
												this.$line.data('height', parseFloat(window.getComputedStyle( this.$el.find('.line')[0]).getPropertyValue('height')));
											}
											
											var height = this.$line.data('height');
											
											var scaledHeight = ( 1 * shrinkBy >= 1 ? 1 * shrinkBy : 1);
											
											this.$line.css('height', scaledHeight + 'px');
										
											var borderWidth = ( 1 * shrinkBy >= .5 ? 1 * shrinkBy : .5);
											
											this.$line.css('border-width', '0px');
											

										},
										'createPseudoForStyleFor': function( which, $dom ){
											
											var shrinkBy = .5;
						
											var width = parseFloat(this.getPseudoProp(which, 'width', $dom))  * shrinkBy;
											var height = parseFloat(this.getPseudoProp(which, 'height', $dom))  * shrinkBy;
											var borderTop = parseFloat(this.getPseudoProp(which, 'border-top', $dom))  * shrinkBy;
											var borderBottom = parseFloat(this.getPseudoProp(which, 'border-bottom', $dom))  * shrinkBy;
											var top = parseFloat(this.getPseudoProp(which, 'top', $dom))  * shrinkBy;
											var bottom = parseFloat(this.getPseudoProp(which, 'bottom', $dom))  * shrinkBy;
											var left = parseFloat(this.getPseudoProp(which, 'left', $dom))  * shrinkBy;
											var right = parseFloat(this.getPseudoProp(which, 'right', $dom))  * shrinkBy;
											var borderLeft = parseFloat(this.getPseudoProp(which, 'border-left', $dom))  * shrinkBy;
											var borderRight = parseFloat(this.getPseudoProp(which, 'border-right', $dom))  * shrinkBy;
											var borderColor = $dom.css('border-color');
										
											var str = '\
														border-top: ' + borderTop + 'px solid !important;\
														border-bottom: ' + borderBottom + 'px solid !important;\
														border-left: ' + borderLeft + 'px solid !important;\
														border-right: ' + borderRight + 'px solid !important;\
														border-color: ' + borderColor + ' !important;\
														width: ' + width + 'px !important;\
														height: ' + height + 'px !important;\
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
										}
									}),
									view = new View(),
									html = view.getHtml();
							
							$('#locked-group-container').prepend(html);
							
							view.setEl();
							view.$el.css('visibility', 'hidden');
							
							var shrunkWidth = width * shrinkBy,
									shrunkHeight = height * shrinkBy;
							
							var cssObj = {
								'width':  shrunkWidth + 'px',
								'height':	shrunkHeight + 'px'
							};
							
							if( height  <  width  ){
								cssObj['margin-top'] = (boxSize - shrunkHeight)  / 2  + 'px';
							} else{
								cssObj['margin-left'] = (boxSize - shrunkWidth)  / 2  + 'px';
							}
							
							view.$el.css(cssObj);
							
							view.$boxes.css({
								width: newBoxSize + 'px',
								height: newBoxSize + 'px'	
							});
							
							view.$box1.css({
								left: box1Left * shrinkBy + 'px',
								top: box1Top  * shrinkBy + 'px'	
							});
							
							view.$box2.css({
								left: box2Left * shrinkBy + 'px',
								top: box2Top * shrinkBy + 'px'	
							});
							
							setTimeout(function(){
								view.renderLine();
								view.renderLine();
								view.colorLine();
								view.scaleLine();
								view.$el.css('visibility', 'visible');
							}, 1000);
							
							
						
						} else{
							
								var left = parseFloat(origModel.get('json').style.element.left),
										top = parseFloat(origModel.get('json').style.element.top),
										width = parseFloat(origModel.get('json').style.element.width),
										height = parseFloat(origModel.get('json').style.element.height),
										shrinkBy = ( height > width  ? boxSize/height : boxSize/width),
										cloneJson	=	$.extend(	true,	{},	origModel.get('json')),
										model = new models.ElementModel(),
										origcid = origModel.cid;
								
								cloneJson.style.element.top = '0px';
								cloneJson.style.element.left = '0px';
										
								model.set('json', cloneJson);
								
								var whichView = app.methods.getWhichView( model ),
										View = views.elements[whichView].extend({
											'model': model,
											'setTemplateObj': function() {
												
													app.methods.doTempateObjFor.call( this, 'elementStyle', 'element', shrinkBy);
													
													if( typeof(this.model.get('json').style.resizeWrapper) != 'undefined'){
														app.methods.doTempateObjFor.call( this, 'resizeStyle', 'resizeWrapper', shrinkBy);
													}
																								 
													if( this.collection == 'headers' || 
															this.collection == 'paragraphs' || 
															this.collection == 'richtext'  || 
															this.collection == 'numbers' 
													){
														this.templateObj['textedit_content'] = this.model.get('json').data.text;
													}
													
													if(tools.inArray( this.collection, app.settings.areImages)){
														app.methods.doTempateObjFor.call( this, 'imageStyle', 'image', shrinkBy);
													}
													 
													if( tools.inArray( this.collection, app.settings.hasShapes)){
														
														app.methods.doTempateObjFor.call( this, 'shapeStyle', 'shape', shrinkBy);
														
														if( typeof(  this.model.get('json').data.show ) != 'undefined'){
															
															var showSide = this.model.get('json').data.show,
																	shapeStyleStr = this.templateObj['shapeStyle'],
																	shapeStyles = this.model.get('json').style.shape;
															
															for( var side in showSide){
																		
																var isTrue = showSide[side];
														
																if( typeof( isTrue) == 'string' && isTrue === 'true' ||
																		typeof( isTrue) == 'boolean' && isTrue
																){
																	shapeStyleStr += 'border-' +  side + '-width: ' + this.model.get('json').data['border-width'] +'px;';	
																	shapeStyleStr += 'border-' +  side + '-style: ' + 'solid;';
																	shapeStyleStr += 'border-' +  side + '-style: ' + this.model.get('json').data['border-style'] + ';';	
																}
																	
															};
															
															for( var key in shapeStyles){
																shapeStyleStr += key + ': ' + shapeStyles[key]  + ';';
															}
															
															this.templateObj['shapeStyle'] += shapeStyleStr;															
															
														}
														
													}

													if( this.collection == 'backgrounds' ){
														app.methods.doTempateObjFor.call( this, 'backgroundStyle', 'background', shrinkBy);
													}
													
													if( this.collection == 'straights' ){
														app.methods.doTempateObjFor.call( this, 'lineStyle', 'line', shrinkBy);
													}
													
													if( typeof(this.model.get('json').justDropped) != 'undefined' ) delete this.model.get('json').justDropped
											},
											'adaptStyle': function( styleKey, formatIs ) {
						
												var curValue = parseFloat(this.model.get('json').style.textedit[styleKey]),
														newValue = shrinkBy * curValue;
								
												this.$textEdit.css(styleKey, newValue + formatIs);
								
												this.$el.find('.textFitted').css(styleKey, newValue + formatIs);
												
												$('#theTextarea').css(styleKey, newValue + formatIs);
												
											}
										}),
										view = new View(),
										html = view.getHtml(),
										boxWrapper = '\
											<div class="box-wrapper" origcid="' + origcid + '" >' + html + '</div>\
										';
								
								$('#locked-group-container').prepend(boxWrapper);								
		
								view.setEl();
								view.$el.removeClass('elements');
								view.$el.addClass('locked-clone');
								view.$el.attr('origcid', origcid);
								
								if( view.collection == 'paragraphs' || view.collection == 'richtext'){
									
									view.adaptStyle( 'font-size', 'px');
									view.adaptStyle( 'letter-spacing', 'px' );
									view.adaptStyle( 'word-spacing', 'px' );
									// var curLineHeight = parseFloat(view.model.get('json').style.textedit['line-height']);			
									view.$textEdit.css('line-height', shrinkBy * 100 + '%');			
									var textEditHeight = view.$textEdit.height();
									view.$el.height(textEditHeight);
									view.$resizeWrapper.height(textEditHeight);
													
								}
								
								if( tools.inArray( view.collection, app.settings.hasShapes)){
										view.scaleCustom( shrinkBy );
								}
								
																		
								if( view.collection == 'richtext'){
									
									view.adaptListCSS = function( styleKey, setValue) {
											var newValue = shrinkBy * setValue;
											this.$textEdit.find('ul').css(styleKey, newValue + 'px');
											this.$textEdit.find('ol').css(styleKey, newValue + 'px');
									};
					
									var defaultMarginBottom = 10,
											defaultPaddingLeft = 40;
								
									view.adaptListCSS('margin-bottom', defaultMarginBottom);
									view.adaptListCSS('padding-left', defaultPaddingLeft);
													
								}								
								
								if( view.collection == 'headers' || view.collection == 'numbers'){
									
									view.adaptStyle( 'font-size', 'px');	
									var dim = view.getWidthOfTextAreaWithContent();
									
									var newWidth = dim.width,
											newHeight  = dim.height;
									
									view.$el.width(newWidth).height(newHeight);
									view.$resizeWrapper.width(newWidth).height(newHeight);
									view.$textEdit.width(newWidth).height(newHeight);												
								}
								
								if( tools.inArray( view.collection, app.settings.hasSvgshapes)) {
									view.swapIMG4SVG(  function() {
										view.$el.find('svg').css({
											width: '',
											height: ''
										});  // working view locked											
									});
								}
								
								
								if( view.collection == 'numbers'){
									
									view.setSizeForResizeWrapper = function() {
						
										var that = this;
										
										this.adaptStyle('font-size', 'px');
										
										var dim = this.getWidthOfTextAreaWithContent();
										
										dim.width = dim.height;
										
										this.$el.css({
											width: dim.width+ 'px',
											height: dim.height  + 'px'
										});
										
										this.$resizeWrapper.css({
											width: dim.width  + 'px',
											height: dim.height  + 'px'
										});
										
										this.$textEdit.css({
											width: dim.width  + 'px',
											height: dim.height  + 'px'
										});
										
									}
									
									view.setSizeForResizeWrapper();
									
								}
								
								var cssObj = {};
								
								if( view.$el.height() < view.$el.width() ){
									cssObj['margin-top'] = (boxSize - view.$el.height())  / 2    + 'px';
								} else{
									cssObj['margin-left'] = (boxSize - view.$el.width())  / 2  + 'px';
								}
								
								view.$el.css( cssObj );		
						}
						
						view.$el.parent().bind('click', function() {

							var origcid = $(this).attr('origcid'),
									$element = $('#' + origcid);
							
							that.unlocking(origcid);

							var $lockedClone = $(this);
							
							$(this).find('div, img').animate({
			          'width': 0,
			          'height': 0,
			          'font-size': 0
				      }, 300, 'easeInCirc')
				      
				      $lockedClone.remove();
				      app.methods.animate( $element, 'flash', 2);
				      if(app.stubs.locked.length == 0 ){
				      	app.methods.clearActive(['doitQueue', 'previewOn'], 'exclude', ' locked clearx');
				      }
						})

					},
					
					checkZ: function() {
						return;
						console.log('*************************************************');
						for( var idx in app.stubs.collections.elements.models){
							var model = app.stubs.collections.elements.models[idx];
							console.log(model.cid + ': ' +model.get('json').style.element['z-index']);
						}
					},
										
				},
				
				layers: {
					buildArrayOfElements:	function() {
						
						var that = this;
	
						this.elementsInPanel	=	[];
						
						for( var idx in app.stubs.collections.elements.models){
							
							var model = app.stubs.collections.elements.models[idx];
							
							if( model.get('disabled')) continue;
							if( typeof( model.get('json') ) == 'undefined' ) continue;
							if( typeof( model.get('json').data.isLocked ) != 'undefined' ) continue;
							this.elementsInPanel.push({
								cid:	model.cid,
								'z-index': parseInt(model.get('json').style.element['z-index'])
							});
							
							// console.log('cid: ' + model.cid +  ' - z: ' + parseInt(model.get('json').style.element['z-index']));
						}

						this.sortElementsInPanel();
						
					},
					sortElementsInPanel: function()	{
	
						this.elementsInPanel.sort(function	(a,b)	{
							if (a['z-index'] < b['z-index'])
								 return	-1;
							if (a['z-index'] > b['z-index'])
								return 1;
							return 0;
						});
	
						var	count	=	0;
						for( var key in	this.elementsInPanel	){
							count++;
							this.elementsInPanel[key]['z-index']	=	count;
						}
	
					},	
					saveReorderedElements: function()	{
	
						var	cid,	zIndex,	model, json;
						
						for( var idx in editbox.methods.layers.elementsInPanel	){
							cid = editbox.methods.layers.elementsInPanel[idx]['cid'];
							zIndex = editbox.methods.layers.elementsInPanel[idx]['z-index']
							$('#'	+	cid).css('z-index', zIndex);
							app.stubs.collections.elements.get( cid	).get('json').style.element['z-index'] =	zIndex;
								
						}
						
					},					
					bind: {
						
						init: function() {
							
							//$('.edit-button').tooltip();
							
							$('#bring-button-wrapper').on('click', '.edit-button', function() {
								
								var layers = editbox.methods.layers,
										direction = $(this).attr('direction');
										
								app.methods.animate( $(this), 'tada', 2);
								app.methods.animate( editbox.view.$el, 'tada', 2);
								
								var pos = {
									'top': '99999999',
									'bottom': '-1',
									'foward': parseInt(layers.elementsInPanel[layers.currentIdx]['z-index'])	+	2,
									'backward': parseInt(layers.elementsInPanel[layers.currentIdx]['z-index']) -	2
								};
								
								editbox.methods.layers.put(pos[direction]);
								
								saveHistory('editbox saveReorderedElements');
								
								//app.methods.clearActive(['removeOntop', 'editBox'], 'exclude', 'bring-button-wrapper');	
								app.methods.clearActive(['previewOn'], 'exclude', 'bring-button-wrapper');	
								
								return false;
								
							})
							
						},
					},
					currentIdx: 0,
					elementsInPanel: [],
					put: function( layerPosition ) {
						
							this.elementsInPanel[this.currentIdx]['z-index'] = parseInt(layerPosition);
							
							this.sortElementsInPanel();
	
							this.saveReorderedElements();
							
							this.setIdxForThisElement();
					},
					setIdxForThisElement: function() {
						
						var cid = editbox.view.model.cid;
						
						this.currentIdx	=	tools.findIndexInArrayOfObjects( editbox.methods.layers.elementsInPanel,	function(	obj	){
							if(	obj.cid ==	cid ) return	true;
						});
						
					},
					redoLayers: function() {
						app.stubs.views.editbox.methods.layers.buildArrayOfElements();
						app.stubs.views.editbox.methods.layers.sortElementsInPanel();
						app.stubs.views.editbox.methods.layers.saveReorderedElements();	
					}
				},
										
				zag: {
					
					bind: {
						
						init: function() {
							
							this.midLine();
							
						},
						
						midLine: function() {
							var minValue = 0,
									maxValue = 100,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.zag.values.midLine.push(i);
							}
							
							
							$('#mid-line-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {
									
								},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									var	newValue = editbox.methods.zag.values.midLine[ui.value];
									editbox.methods.zag.save(newValue);
								},
								stop:	function(event, ui) {
									
									var	newValue = editbox.methods.zag.values.midLine[ui.value];
									editbox.methods.zag.save(newValue);
									
									saveHistory('editbox font values');	
									
								}
							}).find('.ui-slider-handle').append(editbox.slider.tear);
						}
						
					},
					
					values: {
						midLine: []
					},

					label: function(view) {
						
							var midLine = parseFloat(view.model.get('json').data.midLine);
							
							var idx	=	_.indexOf( this.values.midLine, midLine);	
							$('#mid-line-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(midLine);
							
					},
					
					save: function( midLine) {
						$('#mid-line-slider').find('.arrow_box').text(midLine);
						editbox.view.model.get('json').data.midLine = midLine;
						editbox.view.$zagA.css('right', 100 - midLine + '%');						
						editbox.view.$zagB.css('left', midLine + '%');						
					}
				},
				
				fonts: {
					
					heightOfFontPng: 32,
					speed: 0,

					bind: {
						
						init: function() {
							
							app.stubs.problemfonts = [];
							this.list();
							this.category();
							this.picked();
							this.font();
						},
						
						list: function() {
							
							$('#edit-box').on('mouseover', function(event) {
								
								if( typeof( editbox.view.model ) != 'undefined'  && 
										typeof( editbox.view.model.get('json').style.textedit ) != 'undefined' && 
										editbox.view.model.get('json').style.textedit['font-family'] != editbox.view.$textEdit.css('font-family').replace(/['"]+/g, ''))
									{
										var pickedFamily = $('#picked-font').attr('family');
										var $textedit = editbox.view.$el.find('.textedit');
										$textedit.css('font-family', pickedFamily);
										if( editbox.view.collection == 'headers' ) {
											editbox.view.redoAspectRatioAndSize('change font');	
										} else{
											editbox.view.adaptHeightToTextedit('change font');
										}
								}

							})						
						},
						
						category: function() {
							
							var that = this;

							$('#list').on('click', '.category-name', function(event) {
									editbox.methods.fonts.expandCategory.call( editbox, $(this));
									return false;
							});
								
						},
						
						font: function() {
							
							$('.fonts').on('click', '.fontname', function(event) {		
									
									editbox.methods.fonts.selectThisFont.call( editbox, $(this));
									
									return false;
	
							}).on('mouseover', '.fontname', function(event) {		
								
								editbox.methods.fonts.highlight.call( editbox, $(this));
								
								return false;
							});
							
						},
						
						picked: function() {
							
							var that = this;
							$('#picked-font').on('click', function(event) {
								app.methods.clearActive(['hideColorPicker'], 'include', 'picked-fonts click');
								editbox.methods.fonts.launchListWithThisFont.call( editbox, $(this));
								if( editbox.view.collection == 'richtext') editbox.view.$textEdit.html( editbox.view.model.get('json').data.text);
								return false;
							});	
							
						}
						
					},
					
					postSelect: function() {
						
						if( this.view.collection == 'headers'){
							this.view.redoAspectRatioAndSize('select font');
							this.view.rotateIt.centerRotateHandle();
						}

						if( this.view.collection == 'paragraphs'){

							this.view.lineTheThing.undo.call( this.view );
							this.view.adaptHeightToTextedit('E');
						}
						
						if( this.view.collection == 'richtext'){
							
							this.view.adaptHeightToTextedit('F');
						}
					},
					
					selectThisFont: function($this) {
						
						var fontname = $this.attr('fontname'),
								family = $this.attr('family'),
								label = this.methods.fonts.getLabelOfThisFont(fontname);

						
						app.methods.fonts.loadGoogleFontCss( family);
						
						var $fontWrapper = $this.parent();
						$('.font-wrapper').removeClass('selected');
						$fontWrapper.addClass('selected');
						
						$('#picked-font')
							.attr('family', family).attr('fontname', fontname).text(label);
						$('#listwrapper').hide();
						this.methods.fonts.speed = 0;
						
//						this.view.$el.addClass('see-handles');
						
						this.view.model.get('json').data.fontname = fontname;
						this.view.model.get('json').style.textedit['font-family'] = family;
						
						var that = this;
						
						FontDetect.onFontLoaded (family, function() {

							that.view.$el.find('.textedit').css('font-family', family);
															
							that.methods.fonts.postSelect.call( that );

							if( editbox.view.collection == 'headers' ) editbox.view.model.get('json').data.needFreshPNG = true;
							if( editbox.view.collection == 'numbers' ) editbox.view.model.get('json').data.needFreshPNG = true;
							if( editbox.view.collection == 'richtext')  that.view.renderPngFromTextedit('changeing font for richtext', function() {
								saveHistory('selectThisFont');	
							});
							
						},function() {
							
							console.log(family + ' not loaded. Timed out 3 secs');		
							
						}, {msTimeout: 3000});
						
						
						
						if( editbox.view.collection != 'richtext') saveHistory('selectThisFont');	

					},	
												
					highlight: function($this) {
						
						$('#list .font-wrapper').removeClass('selected');
						$this.closest('.font-wrapper').addClass('selected');

						var that = this,
								family = $this.attr('family');
								
						//this.view.$el.removeClass('see-handles');
						app.methods.fonts.loadGoogleFontCss( family );
						
						
						
						
						FontDetect.onFontLoaded (family, function() {
							
							var $textedit = that.view.$el.find('.textedit');
							$textedit.css('font-family', family);
														
							that.methods.fonts.postSelect.call( that );

						},function() {
							
							if (! tools.inArray(family, app.stubs.problemfonts)) app.stubs.problemfonts.push(family);
							
							console.log(family + ' not loaded. Timed out 3 secs');		
							
						}, {msTimeout: 3000});
						

						

						
					},
					
					expandCategory: function($this) {
						
						var that = this,
								category = $this.attr('category'),
								fonts = app.stubs.fontlist[category],
								$fonts = $this.next();
								
						$('.fonts:not(.fonts[category=' + category + '])').removeClass('active')
								.height(0);			
	
						if( $fonts.hasClass('active')){
							
							$fonts.removeClass('active').height(0);
							
						} else {
							
							var maxHeight = $fonts.attr('numfonts') * this.methods.fonts.heightOfFontPng;
							$fonts.addClass('active').height(maxHeight);	
								
							tools.doWhenReady(
								function() {
									return $fonts.height() == maxHeight;
								},
								function() {
									var $selectedCategory = $('.category[category=' + category + ']');

									
									$('#listwrapper').scrollTo($selectedCategory,	that.methods.fonts.speed, function(){
									},
									'dowhen fontlist fonts height'
									);
								}
							);
														
						}
					},
					
					launchListWithThisFont: function() {
						
						$('#listwrapper').show().height(( editbox.view.collection == 'richtext' ? 370 : 220));
				
						$('#listwrapper').unbind('mousedown').mousedown( function(event)	{
							return false;
						});
						
						var fontname = this.view.model.get('json').data.fontname,
								catgeoryName = app.methods.fonts.findCategoryContainingThisFont(fontname),
								$categoryName = $('.category-name[category=' + catgeoryName + ']'),
								$fonts = $categoryName.next(),
								maxHeight = $fonts.attr('numfonts') * this.methods.fonts.heightOfFontPng,
								$selectedFont = $('.fontname[fontname=' + fontname + ']');
									
								$fonts.addClass('active').height(maxHeight);
															
								var that = this;
								
								tools.doWhenReady(
									function() {
										return $fonts.height() == maxHeight;
									},
									function() {
										
										$('.fonts:not(.fonts[category=' + catgeoryName + '])').removeClass('active').height(0);		
										
										$('#listwrapper').scrollTo($selectedFont,	that.methods.fonts.speed, function(){
											var $fontWrapper = $selectedFont.parent();
											$fontWrapper.addClass('selected');
										});
										that.methods.fonts.speed = 400;
									},
									'dowhen fontlist again'
									);

					},
					
					label: function( view ) {
						var fontname = view.model.get('json').data.fontname,
								family = app.methods.fonts.getFamilyOfThisFont(fontname);
								
						$('#picked-font')
							.attr('family', family).attr('fontname', fontname)
							.text(this.getLabelOfThisFont(fontname ));

					},

					getLabelOfThisFont: function( fontname ){
						
							var category = app.methods.fonts.findCategoryContainingThisFont(fontname);
							var fonts = app.stubs.fontlist[category];
							var idx = tools.findIndexInArrayOfObjects( fonts,	function(	obj	){
													if(	obj.fontname === fontname)	return true;
												});
							
							return app.stubs.fontlist[category][idx]['label'];
							
					}					
					
				},

				align: {
					
					bind: {
						
						init: function() {
							
							$('#align-button-wrapper .edit-button').on('click', function() {
								
								var textAlignDirection = $(this).attr('send');
								
								console.log(textAlignDirection);
								
								editbox.view.$textEdit.css('text-align', textAlignDirection);
								editbox.view.model.get('json').style.textedit['text-align'] = textAlignDirection;
								
								saveHistory('textAlignDirection');	
								
								return false;
								
							})
						},

					}
				},
				
				image: {
					
					bind: {
						
						init: function() {
							
							this.googleDrive();
							this.aviary.init();
							
						},
						
						aviary: {
							
							init: function() {	
								
								this.bind();
							},
							
							bind: function() {
								
								var that = this;
								
								this.featherEditor = new Aviary.Feather({
									apiKey: 'be26958c26a446a7850bafe4deec3e14',
									theme: 'dark', 
									tools: [
									'enhance',
									'effects', 
									'lighting', 
									'color', 
									'sharpness',
									'focus', 
									'vignette',
									'blemish',
									'whiten', 
									'redeye', 
									'draw',
									'colorsplash'/*,
									'crop',*/
									],
									
									appendTo: '',
									
									onClose: function(isDirty){
										$(that.tempImg).remove();
									},
									
									onSave: function(imageID, newURL) {
												
										app.methods.loading.on();
												
										tools.convertImgToBase64(newURL, 'image/png', function(base64Img, width,  height) { 
											
											app.methods.loading.off('xx');
											
											var baseArray  = base64Img.split(','),
													json = editbox.view.model.get('json');
			
											json.data.base64 = baseArray[1];
											json.data.width = width;
											json.data.height = height;
											json.data.imgSrc = newURL;

											editbox.view.$img.attr('src',  app.settings.base64Prefix + baseArray[1]);
											that.featherEditor.close();
											$(that.tempImg).remove();
											
											saveHistory('aviary edit');

										});
										
										return;
										
										var url = 'image/getSrcFromThisImage',
												postObj = {
													'google_id': app.stubs.google_id,
													'url' : newURL
												};
										
										tools.ajax(url, postObj, 'post', function(obj) {
											
											app.methods.loading.off('xx');
											
											var json = editbox.view.model.get('json');
			
											json.data.base64 = obj.base64Data;
											json.data.width = obj.width;
											json.data.height = obj.height;
											json.data.imgSrc = newURL;
											json.style.element.width = obj.width + 'px';
											json.style.element.height = obj.height + 'px';
											
											editbox.view.$img.attr('src',  app.settings.base64Prefix + obj.base64Data);
											that.featherEditor.close();
											$(that.tempImg).remove();
											
										});
										
									},
									onError: function(errorObj) {
										alert(errorObj.message);
									}
								});
								
								$('#aviaryButton').click( function() {
									
									var idRandom = 'img-' + tools.randomIntFromInterval(1, 999999999999);
									
									that.tempImg = new Image();
											
									that.tempImg.id = idRandom;
									that.tempImg.style.width = editbox.view.model.get('json').data.width +'px';
									that.tempImg.style.height = editbox.view.model.get('json').data.height +'px';
									that.tempImg.src = app.settings.base64Prefix + editbox.view.model.get('json').data.base64;
									
									$('body').append(that.tempImg);
									
									that.launch(idRandom, that.tempImg.src );
									
								});
																	
							},
							
							launch: function(id, src) {
								this.featherEditor.launch({
									image: id,
									url: src
								});
								return false;
							}
						},
						
						googleDrive: function() {
							
							$('#sendToGoogleDrive').click( function() {
								
								app.methods.progressBar.start();
												
								var url = 'app/spotToDrive',
										obj = {
											base64: editbox.view.model.get('json').data.base64,
											google_id: app.stubs.google_id
										};
										
								tools.ajax(url, obj, 'post', function( data ) {
									app.methods.progressBar.stop('google drive');
									toast('This image is now saved in your image folder under the main Pictographr folder.', 'keep', false, 'success', 'Success');	
								});			
								
							});
							
						}
					}					
				},
				
				charts: {
					
					values: {
						width: [],
						height: [],
						left: [],
						top: [],
						titleFontSize: [],
						sliceFontSize: [],
						subTitleFontSize: [],
						axisSubTitleFontSize: [],
						legendSubTitleFontSize: [],
						rotate: []
					},
					
					bind: {
						
						init: function() {

							this.width();
							this.height();
							this.left();
							this.top();
							this.titleFontSize();
							this.sliceFontSize();
							this.axisSubTitleFontSize();
							this.legendSubTitleFontSize();
							this.subTitleFontSize();
							this.rotate();
						},
						
						width: function() {
							var minValue = 1,
									maxValue = 100,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.width.push(i);
							}
							
							
							$('#width-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									editbox.view.model.get('json').data.charts.options.chartArea.width = ui.value + '%';
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
						},
						
						height: function() {
							
							var minValue = 1,
									maxValue = 100,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.height.push(i);
							}
							
							
							$('#height-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									editbox.view.model.get('json').data.charts.options.chartArea.height = ui.value + '%';
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},
						
						left: function() {
							
							var minValue = 1,
									maxValue = 400,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.left.push(i);
							}
							
							
							$('#left-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									editbox.view.model.get('json').data.charts.options.chartArea.left = ui.value;
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},
						
						top: function() {
							
							var minValue = 1,
									maxValue = 400,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.top.push(i);
							}
							
							
							$('#top-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									editbox.view.model.get('json').data.charts.options.chartArea.top = ui.value;
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},
						
						sliceFontSize: function() {
							var minValue = 1,
									maxValue = 150,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.sliceFontSize.push(i);
							}
							
							
							$('#slice-font-size-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									editbox.view.model.get('json').data.charts.options.pieSliceTextStyle.fontSize = ui.value;
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
						},
						
						titleFontSize: function() {
							
							var minValue = 1,
									maxValue = 150,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.titleFontSize.push(i);
							}
							
							$('#title-font-size-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									if(ui.value == 0 ){
										editbox.view.model.get('json').data.charts.options.titleTextStyle.color = 'transparent';
									} else{
										editbox.view.model.get('json').data.charts.options.titleTextStyle.color = '#424242';
										editbox.view.model.get('json').data.charts.options.titleTextStyle.fontSize = ui.value;
									}
									
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},
						
						axisSubTitleFontSize: function() {
							
							var minValue = 1,
									maxValue = 400,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.axisSubTitleFontSize.push(i);
							}
							
							
							$('#axis-subtitle-font-size-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									if(ui.value == 0 ){
										
										editbox.view.model.get('json').data.charts.options.hAxis.textStyle.color = 'transparent';
										editbox.view.model.get('json').data.charts.options.vAxis.textStyle.color = 'transparent';
									

									} else{
										
										editbox.view.model.get('json').data.charts.options.hAxis.textStyle.color = '#424242';
										editbox.view.model.get('json').data.charts.options.vAxis.textStyle.color = '#424242';

										editbox.view.model.get('json').data.charts.options.hAxis.textStyle.fontSize = ui.value;
										editbox.view.model.get('json').data.charts.options.vAxis.textStyle.fontSize = ui.value;
									
									}
									
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
									
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},
						
						legendSubTitleFontSize: function() {
							
							var minValue = 1,
									maxValue = 160,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.legendSubTitleFontSize.push(i);
							}
							
							
							$('#legend-subtitle-font-size-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									if(ui.value == 0 ){
										editbox.view.model.get('json').data.charts.options.legend.position = 'none';
									} else{
										editbox.view.model.get('json').data.charts.options.legend.position = 'right';
										editbox.view.model.get('json').data.charts.options.legend.textStyle.fontSize = ui.value;
									}
									
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},							
						
						subTitleFontSize: function() {
							
							var minValue = 0,
									maxValue = 400,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.subTitleFontSize.push(i);
							}
							
							
							$('#subtitle-font-size-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									if(ui.value == 0 ){
										
										editbox.view.model.get('json').data.charts.options.hAxis.titleTextStyle.color = 'transparent';
										editbox.view.model.get('json').data.charts.options.vAxis.titleTextStyle.color = 'transparent';
									

									} else{
										
										editbox.view.model.get('json').data.charts.options.hAxis.titleTextStyle.color = '#424242';
										editbox.view.model.get('json').data.charts.options.vAxis.titleTextStyle.color = '#424242';

										editbox.view.model.get('json').data.charts.options.hAxis.titleTextStyle.fontSize = ui.value;
										editbox.view.model.get('json').data.charts.options.vAxis.titleTextStyle.fontSize = ui.value;
									
									}
									
									

									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},						
						
						rotate: function() {
							var minValue = 0,
									maxValue = 360,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.charts.values.rotate.push(i);
							}
							
							
							$('#rotate-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									if(ui.value == 0 || ui.value == 180 || ui.value == 360){
										editbox.view.model.get('json').data.charts.options.hAxis.slantedText = false;
									} else{
										editbox.view.model.get('json').data.charts.options.hAxis.slantedText = true;
										editbox.view.model.get('json').data.charts.options.hAxis.slantedTextAngle = ui.value;
									}
										
									$(this).find('.arrow_box').text( ui.value );
									editbox.view.renderChart();
								},
								stop:	function(event, ui) {saveHistory('editbox chart values');}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
						},
					},
					
					label: function(view) {
						
							var width = parseInt(view.model.get('json').data.charts.options.chartArea.width);
							
							var idx	=	_.indexOf( this.values.width, width);	
							$('#width-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(width);
								
							/* --------------------------------------------- */
								
							var height = parseInt(view.model.get('json').data.charts.options.chartArea.height);
							
							var idx	=	_.indexOf( this.values.height, height);	
							$('#height-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(height);
								
							/* --------------------------------------------- */
								
							var left = parseInt(view.model.get('json').data.charts.options.chartArea.left);
							
							var idx	=	_.indexOf( this.values.left, left);	
							$('#left-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(left);
								
							/* --------------------------------------------- */
								
							var top = parseInt(view.model.get('json').data.charts.options.chartArea.top);
							
							var idx	=	_.indexOf( this.values.top, top);	
							$('#top-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(top);
								
							/* --------------------------------------------- */
								
							var titleFontSize = parseInt(view.model.get('json').data.charts.options.titleTextStyle.fontSize);
							
							var idx	=	_.indexOf( this.values.titleFontSize, titleFontSize);	
							$('#title-font-size-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(titleFontSize);

								
							/* --------------------------------------------- */
							
							
							if( typeof( view.model.get('json').data.charts.options.legend.textStyle ) != 'undefined'){
								
								var legendSubTitleFontSize = parseInt(view.model.get('json').data.charts.options.legend.textStyle.fontSize);
								
								var idx	=	_.indexOf( this.values.legendSubTitleFontSize, legendSubTitleFontSize);	
								$('#legend-subtitle-font-size-slider').slider('option', 'value', idx)
									.find('.arrow_box').text(legendSubTitleFontSize);											
								
							}
							
							if( view.collection == 'pies' ){
								
									
								/* --------------------------------------------- */
									
								var sliceFontSize = parseInt(view.model.get('json').data.charts.options.pieSliceTextStyle.fontSize);
								
								var idx	=	_.indexOf( this.values.sliceFontSize, sliceFontSize);	
								$('#slice-font-size-slider').slider('option', 'value', idx)
									.find('.arrow_box').text(sliceFontSize);								
																	
								
								return;  // ****************************************************
							} 
							
							/* --------------------------------------------- */
								
							var subTitleFontSize = parseInt(view.model.get('json').data.charts.options.hAxis.titleTextStyle.fontSize);
							
							var idx	=	_.indexOf( this.values.subTitleFontSize, subTitleFontSize);	
							$('#subtitle-font-size-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(subTitleFontSize);

								
							/* --------------------------------------------- */
								
							var axisSubTitleFontSize = parseInt(view.model.get('json').data.charts.options.hAxis.textStyle.fontSize);
							
							var idx	=	_.indexOf( this.values.axisSubTitleFontSize, axisSubTitleFontSize);	
							$('#axis-subtitle-font-size-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(axisSubTitleFontSize);
								

							/* --------------------------------------------- */
								
							var rotate = parseFloat(view.model.get('json').data.charts.options.hAxis.slantedTextAngle);
							
							var idx	=	_.indexOf( this.values.rotate, rotate);	
							$('#rotate-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(rotate);
							
					}
				},
				
				backgroundSize: {
					
					values: {
						backgroundSize: []
					},
					
					stepperPlugin: {
						backgroundSize: undefined,
					},
					
					bind: {
						
						init: function() {

							this.backgroundresize();
							
						},
						
						backgroundresize: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 3500,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.backgroundSize.values.backgroundSize.push(i);
							}
							
							$('#backgroundSize-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								},
								step:	1,
								slide: function(event, ui) { 

									editbox.methods.backgroundSize.save.backgroundSize(ui.value);
									
								},
								stop:	function(event, ui) {
									
									editbox.methods.backgroundSize.save.backgroundSize(ui.value);
									saveHistory('editbox backgroundSize values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
					},
					
					save: {
						backgroundSize: function( value ) {
																
							editbox.view.model.get('json').style.background['background-size'] = value + 'px';
							editbox.view.$background.css('background-size', value * scale + 'px');
							
							$(this).find('.arrow_box').text( value );
							
							var idx	=	_.indexOf( editbox.methods.backgroundSize.values.backgroundSize, parseInt(value));	
							
							$('#backgroundSize-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(value);										
							
							editbox.methods.backgroundSize.stepperPlugin.backgroundSize.setValue(value, true);
						}
					},
					
					label: function(view) {
							
							editbox.domToUse = 'background';
							editbox.$domToUse = editbox.view.$background;

							var backgroundSize = parseInt(editbox.view.model.get('json').style.background['background-size']);
							
							var idx	=	_.indexOf( this.values.backgroundSize, backgroundSize);	
							
							$('#backgroundSize-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(backgroundSize);			
								
							editbox.methods.backgroundSize.stepperPlugin.backgroundSize.setValue(backgroundSize, true);					
				
					}
				},
				
				glow: {
					
					values: {
						glow: []
					},
					
					stepperPlugin: {
						glow: undefined,
					},
					
					bind: {
						
						init: function() {

							this.glow();
							
						},
						
						glow: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 99,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.glow.values.glow.push(i);
							}
							
							$('#glow-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								step:	1,
								start: function(event, ui) {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								},
								slide: function(event, ui) { 
									
									editbox.methods.glow.save.glow(ui.value);
									
								},
								stop:	function(event, ui) {
									
									editbox.methods.glow.save.glow(ui.value);
									saveHistory('editbox glow values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
					},
					
					label: function(view) {
						
							if( typeof( editbox.view.model.get('json').data.glow ) == 'undefined' ){		
								var glow = 5;
							}else{
								var glow = parseInt(editbox.view.model.get('json').data.glow);
							};

							var idx	=	_.indexOf( editbox.methods.glow.values.glow, parseInt(glow));
							$('#glow-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(glow);
							
							editbox.methods.glow.stepperPlugin.glow.setValue(glow, true);					
				
					},
						
					save: {
						glow: function( value ) {
							
									
							for(var	idx	in app.settings.keysInLayout){
								
								var glowMaskValue = ( value < 10 ? '0' + value: value);

								if( editbox.view.model.get('json').data.whereglow == 'inner' ){

									var glowMask = '-webkit-radial-gradient(center center, ellipse cover, rgba(255,255,255,0.2) 0%,rgba(0,0,0,0.' + glowMaskValue + ') 100%)';									
									
								}else{

									var glowMask = '-webkit-radial-gradient(center center, ellipse cover, rgba(255,255,255,0.' + glowMaskValue + ') 0%,rgba(0,0,0,0.2) 100%)';
								};

								editbox.view.model.get('json').style.shape[app.settings.keysInLayout[idx]  + 'mask-image'] = glowMask;
								editbox.view.$shape.css(app.settings.keysInLayout[idx]  + 'mask-image', glowMask);
								editbox.view.model.get('json').data.glow = value;
							}
							

							var idx	=	_.indexOf( editbox.methods.glow.values.glow, parseInt(value));
							$('#glow-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							editbox.methods.glow.stepperPlugin.glow.setValue(value, true);
													
						}
					}
				},
				
				opacity: {
					
					values: {
						opacity: []
					},
					
					bind: {
						
						init: function() {

							this.opacity();
							
						},
						
						opacity: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 10,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.opacity.values.opacity.push(i);
							}
							
							
							$('#opacity-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								step:	1,
								
								start: function() {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								}, 
								
								slide: function(event, ui) { 
									
									editbox.methods.opacity.save.opacity( ui.value );
									
								},
								stop:	function(event, ui) {
									
									editbox.methods.opacity.save.opacity( ui.value );
									
									saveHistory('editbox opacity values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
						
					},
					
					stepperPlugin: {
						opacity: undefined,
					},
						
					save: {
						opacity: function( value ) {
							editbox.view.model.get('json').style[editbox.domToUse].opacity = value * .1;
							editbox.$domToUse.css('opacity', value * .1);
							
							var idx	=	_.indexOf( editbox.methods.opacity.values.opacity, parseInt(value));
								
							$('#opacity-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							editbox.methods.opacity.stepperPlugin.opacity.setValue(value, true);
														
						}
					},
					
					label: function() {
						
						if( tools.inArray( editbox.view.collection, app.settings.hasShapes)) {
							editbox.domToUse = 'shape';
							editbox.$domToUse = editbox.view.$shape;
						}
						
						if( editbox.view.collection == 'backgrounds') {
							editbox.domToUse = 'background';
							editbox.$domToUse = editbox.view.$background;
						}							
						
						if( tools.inArray(editbox.view.collection, app.settings.canSaveImageToCloudDrive) ||
								editbox.view.collection == 'icons'
						) {
							editbox.domToUse = 'image';
							editbox.$domToUse = editbox.view.$img;
						}
						
						if( tools.inArray(editbox.view.collection, app.settings.hasSvgshapes) ) {  // working  opacity label
							editbox.domToUse = 'svgshape'; 
							editbox.$domToUse = editbox.view.$svgshape;
						}
						
						if( tools.inArray(editbox.view.collection, app.settings.hasFont)) {
							editbox.domToUse = 'textedit';
							editbox.$domToUse = editbox.view.$textEdit;
						}		

						if( typeof( editbox.view.model.get('json').style[editbox.domToUse] ) == 'undefined' ){
							editbox.view.model.get('json').style[editbox.domToUse] = {
								opacity: 1
							}
						}

						var opacity = parseInt(editbox.view.model.get('json').style[editbox.domToUse].opacity * 10);
						
						var idx	=	_.indexOf( this.values.opacity, opacity);	
						$('#opacity-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(opacity);	
							
							
						editbox.methods.opacity.stepperPlugin.opacity.setValue(opacity, true);						
				
					}
				},	
							
				blur: {
					
					values: {
						blur: []
					},
					
					stepperPlugin: {
						blur: undefined,
					},
					
					bind: {
						
						init: function() {

							this.blur();
							
						},
						
						blur: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 100,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.blur.values.blur.push(i);
							}
							
							$('#blur-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								
								step:	1,
								start: function() {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								},
								slide: function(event, ui) { 
									
									editbox.methods.blur.save.blur(ui.value);
									
								},
								stop:	function(event, ui) {
									
									editbox.methods.blur.save.blur(ui.value);
									
									saveHistory('editbox fade values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
					},
					
					label: function(view) {
						
							if( typeof( editbox.view.model.get('json').data.blur ) == 'undefined' ){		
								var blur = 0;
							}else{
								var blur = parseInt(editbox.view.model.get('json').data.blur);
							};
							
							var idx	=	_.indexOf( editbox.methods.blur.values.blur, blur);	
							$('#blur-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(blur);							
							editbox.methods.blur.stepperPlugin.blur.setValue(blur, true);
					},
						
					save: {
						blur: function( value ) {
									
							var grayscale = ( typeof( editbox.view.model.get('json').data.grayscale) != 'undefined' ? editbox.view.model.get('json').data.grayscale: 0);
							
							editbox.view.model.get('json').data.blur = value;
							
							var filter = '';
							filter += 'blur(' + value + 'px) grayscale(' + grayscale + '%)';
							
							for(var	idx	in app.settings.keysInLayout){
								editbox.view.model.get('json').style.image[app.settings.keysInLayout[idx]  + 'filter'] = filter;
								editbox.view.$img.css(app.settings.keysInLayout[idx]  + 'filter', filter);
							}
							
							var idx	=	_.indexOf( editbox.methods.blur.values.blur, parseInt(value));
							$('#blur-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							$(this).find('.arrow_box').text( value );
							
							editbox.methods.blur.stepperPlugin.blur.setValue(value, true);
													
						}
					}
				},	
							
				grayscale: {
					
					values: {
						grayscale: []
					},
					
					stepperPlugin: {
						grayscale: undefined,
					},
					
					bind: {
						
						init: function() {

							this.grayscale();
							
						},
						
						grayscale: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 100,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.grayscale.values.grayscale.push(i);
							}
							
							
							
							$('#grayscale-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								step:	1,
								start: function() {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								},
								slide: function(event, ui) { 
									
										editbox.methods.grayscale.save.grayscale(ui.value);
									
								},
								stop:	function(event, ui) {
									
									editbox.methods.grayscale.save.grayscale(ui.value);
									saveHistory('editbox fade values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
					},
					
					label: function(view) {
						
							if( typeof( editbox.view.model.get('json').data.grayscale ) == 'undefined' ){		
								var grayscale = 0;
							}else{
								var grayscale = parseInt(editbox.view.model.get('json').data.grayscale);
							};
							
							var idx	=	_.indexOf( this.values.grayscale, grayscale);	
							$('#grayscale-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(grayscale);		
								
							editbox.methods.grayscale.stepperPlugin.grayscale.setValue(grayscale, true);					
				
					},
						
					save: {
						grayscale: function( value ) {
							
							var blur = ( typeof( editbox.view.model.get('json').data.blur) != 'undefined' ? editbox.view.model.get('json').data.blur : 0);
							
							editbox.view.model.get('json').data.grayscale = value;
							
							var filter = '';
							filter += 'blur(' + blur + 'px) grayscale(' + value + '%)';
							
							for(var	idx	in app.settings.keysInLayout){
								editbox.view.model.get('json').style.image[app.settings.keysInLayout[idx]  + 'filter'] = filter;
								editbox.view.$img.css(app.settings.keysInLayout[idx]  + 'filter', filter);
							}
							
							var idx	=	_.indexOf( editbox.methods.grayscale.values.grayscale, parseInt(value));
							
							$('#grayscale-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							$(this).find('.arrow_box').text( value );
							
							editbox.methods.grayscale.stepperPlugin.grayscale.setValue(value, true);	
														
						}
					}
				},	
							
				letterspace: {
					
					values: {
						letterspace: []
					},
					
					bind: {
						
						init: function() {

							this.letterspace();
							
						},
						
						letterspace: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 150,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.letterspace.values.letterspace.push(i);
							}
							
							$('#letterspace-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {},
								step:	1,
								slide: function(event, ui) { 
									
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
						
									var endFormat = 'px';
						
									editbox.view.model.get('json').style.textedit['letter-spacing'] = ui.value + endFormat;	
																	
									editbox.view.$textEdit.css('letter-spacing', ui.value * app.stubs.zoom.scale  + endFormat);
									
//									if( typeof( renderPng) != 'undefined'){
//										editbox.view.renderPngFromTextedit('making style change to letterspacing', function() {
//											//saveHistory('line-height and other changes');	
//										});
//									}
									
									$(this).find('.arrow_box').text( ui.value );
									
									editbox.view.redoAspectRatioAndSize('letterspacing');
									
								},
								stop:	function(event, ui) {
									
									editbox.view.redoAspectRatioAndSize('letterspacing');
									
									editbox.view.model.get('json').data.needFreshPNG = true;
									
									saveHistory('editbox fade values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
					},
					
					label: function(view) {
						
							if( typeof( editbox.view.model.get('json').style.textedit['letter-spacing'] ) == 'undefined' ){		
								var letterspace = 0;
							}else{
								var letterspace = parseInt(editbox.view.model.get('json').style.textedit['letter-spacing']);
							};
							
							var idx	=	_.indexOf( this.values.letterspace, letterspace);	
							$('#letterspace-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(letterspace);							
				
					}
				},
				
				customBorders: {
					
					values: {
						borderWidth: [],
						radius: [],
						shadow: []
					},
					
					bind: {
						
						init: function() {

							this.borderWidth();
							this.shadow();
							this.radius();
							
						},
						
						borderWidth: function() {
							var that = this,
									minValue = ( editbox.domToUse == 'shape' ?  1: 0),
									maxValue = 320,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.customBorders.values.borderWidth.push(i);
							}
							
							$('#border-width-slider').slider({
								value: 0,
								min: 0,
								max: maxSteps,
								
								step:	1,
								
								start: function() {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								},
								
								slide: function(event, ui) { 
									editbox.methods.customBorders.save.borderWidth(ui.value);

								},
								stop:	function(event, ui) {
									editbox.methods.customBorders.save.borderWidth(ui.value);
									saveHistory('editbox border width values');
									
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},
						
						shadow: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 20,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.customBorders.values.shadow.push(i);
							}
							
							$('#shadow-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									editbox.methods.customBorders.save.shadow(ui.value);
								},
								stop:	function(event, ui) {
									editbox.methods.customBorders.save.shadow(ui.value);
									saveHistory('editbox shadow values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						},

						radius: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 100,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.customBorders.values.radius.push(i);
							}
							
							$('#radius-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								start: function(event, ui) {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								},
								step:	1,
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									editbox.methods.customBorders.save.radius(ui.value);
								},
								stop:	function(event, ui) {
									editbox.methods.customBorders.save.radius(ui.value);
									saveHistory('editbox radius values');
									
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
						
					},
					
					save: {
						
						borderWidth:  function(value) {
							
							var borderWidth = value,
									borderWidthOnDom = value * app.stubs.zoom.scale;
									
							if( editbox.domToUse == 'shape'){
								
								if ( borderWidthOnDom > 0 && borderWidthOnDom < 1) {
									borderWidthOnDom = 1;
								}
								
								var showSide = editbox.view.model.get('json').data.show;
								
								for( var side in showSide){
									var isTrue = showSide[side];
									if( typeof( isTrue) == 'string' && isTrue === 'true' ||
											typeof( isTrue) == 'boolean' && isTrue ){
										var cssStyleSide = 'border-' + side + '-width';
										editbox.$domToUse.css(cssStyleSide,  borderWidthOnDom + 'px');					
										editbox.view.model.get('json').style[editbox.domToUse][cssStyleSide] = borderWidth + 'px';
									}
								};
								editbox.view.model.get('json').data['border-width'] = borderWidth;
								
							} else{
								console.log(editbox.borderWidthStyleToUse);
								editbox.$domToUse.css(editbox.borderWidthStyleToUse,  borderWidthOnDom + 'px');					
								editbox.view.model.get('json').style[editbox.domToUse][editbox.borderWidthStyleToUse] = borderWidth + 'px';
								
							};
							
							var idx	=	_.indexOf( editbox.methods.customBorders.values.borderWidth, parseInt(value));
											
							$('#border-width-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);							
							
							editbox.methods.customBorders.stepperPlugin.borderWidth.setValue(value, true);
							
							editbox.methods.customBorders.label();
							
							
						},
						radius: function(value) {
									
							var widthElement = parseInt(editbox.view.model.get('json').style.element.width),
									heightElement =  parseInt(editbox.view.model.get('json').style.element.height),
									halfWidth = widthElement/2,
									pxPercentWidth = halfWidth * value / 100;
									
							editbox.view.model.get('json').style[editbox.domToUse]['border-radius'] = (pxPercentWidth)  + 'px';
							editbox.$domToUse.css('border-radius', pxPercentWidth * scale + 'px');
							
							var idx	=	_.indexOf( editbox.methods.customBorders.values.radius, parseInt(value));
							
							$('#radius-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							editbox.methods.customBorders.stepperPlugin.radius.setValue(value, true);
							
							editbox.methods.customBorders.label();
							
						},
						shadow: function(value) {
							
							for(var	idx	in app.settings.keysInLayout){
								var prefix = app.settings.keysInLayout[idx];
								editbox.view.model.get('json').data.shadow = value;
								editbox.view.model.get('json').style[editbox.domToUse][prefix + 'box-shadow'] = value + 'px ' + value + 'px ' + value * 2 + 'px rgba(0,0,0,0.4)';
								editbox.$domToUse.css( prefix + 'box-shadow', value + 'px ' + value + 'px ' + value * 2 + 'px rgba(0,0,0,0.4)');
							}
							
							var idx	=	_.indexOf( editbox.methods.customBorders.values.shadow, parseInt(value));
							
							$('#shadow-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							editbox.methods.customBorders.stepperPlugin.shadow.setValue(value, true);
							
							editbox.methods.customBorders.label();							
						}
					},
					
					label: function() {
						
							if( tools.inArray( editbox.view.collection, app.settings.hasShapes) || 
									tools.inArray(editbox.view.collection, app.settings.canSaveImageToCloudDrive)||
									 editbox.view.collection == 'backgrounds'
									) {

								if( tools.inArray(editbox.view.collection, app.settings.canSaveImageToCloudDrive)){
									editbox.domToUse = 'image';
								}else if( tools.inArray( editbox.view.collection, app.settings.hasShapes)) {
									editbox.domToUse = 'shape';
								}else if( editbox.view.collection == 'backgrounds') {
									editbox.domToUse = 'background';
									editbox.$domToUse = editbox.view.$background;
								};
								
								/* RADIUS */
								var borderRadius = editbox.view.model.get('json').style[editbox.domToUse]['border-radius'],
										widthElement = parseInt(editbox.view.model.get('json').style.element.width);
								
								borderRadius = Math.round(parseFloat(( typeof( borderRadius) != 'undefined' ? borderRadius: 0)));

								var sliderValue = Math.round((borderRadius / (widthElement/2)) * 100);
								
								if( sliderValue > 100 ) sliderValue = 100;
								
								var idx	=	_.indexOf( this.values.radius, sliderValue);

								if( idx == -1 ) {
									idx = 0;
									sliderValue = 0;
								}
								
								
								if( typeof( editbox.methods.customBorders.stepperPlugin.radius ) != 'undefined'){
									$('#radius-slider').slider('option', 'value', idx)
										.find('.arrow_box').text(idx);	
									editbox.methods.customBorders.stepperPlugin.radius.setValue(sliderValue, true);	
								} else {
									console.log('avoided bug for: ' + editbox.view.collection);	
								}

								/* SHADOW */
								var shadow = parseInt(editbox.view.model.get('json').data.shadow),
										idx	=	_.indexOf( this.values.shadow, shadow);	
								$('#shadow-slider').slider('option', 'value', idx)
									.find('.arrow_box').text(shadow);
								
								
								/* BORDERWIDTH */
								editbox.borderWidthStyleToUse = 'border-width';
								if( tools.inArray(editbox.view.collection, app.settings.canSaveImageToCloudDrive) ||
								 		editbox.view.collection == 'backgrounds'
								){
									var borderWidth = parseInt(editbox.view.model.get('json').style[editbox.domToUse]['border-width']),
											idx	=	_.indexOf( this.values.borderWidth, borderWidth);	

									$('#border-width-slider').slider('option', 'value', idx)
										.find('.arrow_box').text(borderWidth);
										
									editbox.methods.customBorders.stepperPlugin.borderWidth.setValue(borderWidth, true);										
								}
								
								if( tools.inArray( editbox.view.collection, app.settings.hasShapes)){
									var borderWidth = parseInt(editbox.view.model.get('json').data['border-width']),
											idx	=	_.indexOf( this.values.borderWidth, borderWidth);	

									$('#border-width-slider').slider('option', 'value', idx)
										.find('.arrow_box').text(borderWidth);
									
									if( typeof( editbox.methods.customBorders.stepperPlugin.borderWidth ) != 'undefined' ) {
										editbox.methods.customBorders.stepperPlugin.borderWidth.setValue(borderWidth, true);										
									}
								}
								
							}

							if( tools.inArray(editbox.view.collection, app.settings.canSaveImageToCloudDrive)  || editbox.view.collection == 'icons' || editbox.view.collection == 'svg') {
								editbox.domToUse = 'image';
								editbox.$domToUse = editbox.view.$img;
							}
							
					},
					
					stepperPlugin: {
						borderWidth: undefined,
						radius: undefined,
						shadow: undefined,
					}
					
				},
				
				text: {
					
					stepperPlugin: {
						fontSize: undefined,
						letterSpacing: undefined,
						lineHeight: undefined,
					},
										
					values: {
						fontSize: [],	
						letterSpacing: [],	
						wordSpacing: [],
						lineHeight: []
					},

					bind: {
						
						init: function() {
							
							this.letterSpacing();
							this.wordSpacing();
							this.lineHeight();
							
						},
						
						fontsize: function(maxValue) {
							
							var minValue = 7,
									maxSteps = maxValue - minValue;
							
							editbox.methods.text.values.fontSize = [];
							
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.text.values.fontSize.push(i);
							}
							
							var options  = {
								value:0,
								min: 0,
								max: maxSteps,
								step:	1,
								start: function(event, ui) {
									editbox.view.textedit2String();
									editbox.view.adaptUL();
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
								},
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									var	newValue = editbox.methods.text.values.fontSize[ui.value];
									
									editbox.methods.text.save.fontSize(newValue, 'font-size');
									
									editbox.view.adaptUL();
									
									
								},
								stop:	function(event, ui) {
									
									var	newValue = editbox.methods.text.values.fontSize[ui.value],
											renderPng = true;
										
									editbox.methods.text.save.fontSize(newValue, 'font-size', renderPng);
									
									
								}
							};
							
							$('#font-size-slider').slider(options).find('.ui-slider-handle').empty().append(editbox.slider.tear);
							
						},
						
						letterSpacing: function() {
							
							var minValue = 0,
									maxValue = 399,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.text.values.letterSpacing.push(i);
							}
							
							$('#letter-spacing-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								step:	1,
								start: function(event, ui) {
									
									editbox.view.textedit2String();
									editbox.view.adaptUL();
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
								},
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									var	newValue = editbox.methods.text.values.letterSpacing[ui.value];
									
									editbox.methods.text.save.letterSpacing(newValue, 'letter-spacing');
									
									
								},
								stop:	function(event, ui) {
									
									var	newValue = editbox.methods.text.values.letterSpacing[ui.value],
											renderPng = true;
										
									editbox.methods.text.save.letterSpacing(newValue, 'letter-spacing', renderPng);
									
									
								}
							}).find('.ui-slider-handle').append(editbox.slider.tear);	
							
								
						},
						
						wordSpacing: function() {
							
							var minValue = 0,
									maxValue = 90,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.text.values.wordSpacing.push(i);
							}
							
							$('#word-spacing-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								step:	1,
								
								start: function(event, ui) {
									
									editbox.view.textedit2String();
									editbox.view.adaptUL();
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
								},
								
								slide: function(event, ui) { 
									
									var	newValue = editbox.methods.text.values.wordSpacing[ui.value];
									
									editbox.methods.text.save.wordSpacing(newValue, 'word-spacing');
									
								},
								
								stop:	function(event, ui) {
									
									var	newValue = editbox.methods.text.values.wordSpacing[ui.value],
											renderPng = true;
										
									editbox.methods.text.save.wordSpacing(newValue, 'word-spacing', renderPng);
									
									
								}
							}).find('.ui-slider-handle').append(editbox.slider.tear);	
						},
						
						lineHeight: function() {
							
							var minValue = 70,
									maxValue = 300,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.text.values.lineHeight.push(i);
							}
							
							$('#line-height-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								step:	1,
								start: function(event, ui) {
									
									editbox.view.textedit2String();
									editbox.view.adaptUL();
							
									var textTransform = editbox.view.model.get('json').style.textedit['text-transform'];
									editbox.view.$textEdit.css('text-transform', textTransform);
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
								},
								slide: function(event, ui) { app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
									
									var	newValue = editbox.methods.text.values.lineHeight[ui.value];
									
									editbox.methods.text.save.lineHeight(newValue, 'line-height');
									
								},
								stop:	function(event, ui) {
									
									var	newValue = editbox.methods.text.values.lineHeight[ui.value],
											renderPng = true;
										
									editbox.methods.text.save.lineHeight(newValue, 'line-height',  renderPng);
									
									
									
								}
							}).find('.ui-slider-handle').append(editbox.slider.tear);										
						}
						
					},

					label: function() {
						
						if( editbox.view.collection == 'headers'){
							var max = 300;
							editbox.methods.text.bind.fontsize(max); // MAX FONT SIZE
							editbox.methods.text.stepperPlugin.fontSize.max = max;
						}else{
							var max = 140;
							editbox.methods.text.bind.fontsize(max);
							editbox.methods.text.stepperPlugin.fontSize.max = max;
						};
						
						var styleObj = editbox.view.model.get('json').style.textedit;
						
						for( var styleKey in styleObj){
							
							var styleKeyCameled = tools.toCamelCase(styleKey);
							
							if( !tools.inArray(styleKeyCameled, _.keys(this.values)) ) continue;
							
							var styleValueStr = styleObj[styleKey],
									styleValue = Math.floor(parseInt(styleValueStr));
									
							var idx	=	_.indexOf( this.values[styleKeyCameled], styleValue);	
							
							$('#' + styleKey + '-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(styleValue);
							
							editbox.methods.text.stepperPlugin[styleKeyCameled].setValue(styleValue, true);		
							
						}
						
						if( !_.has(styleObj, 'letter-spacing')) {
							$('#letter-spacing-slider').find('.arrow_box').text(0);
						}

					},
										
					save: {
						
						saveStyle: function( styleValue, styleKey, renderPng ) {
							
							editbox.view.model.get('json').style.textedit[styleKey] = styleValue +  'px';
							$('#' + styleKey + '-slider').find('.arrow_box').text(styleValue);
							var scaledStyleValue = styleValue * app.stubs.zoom.scale;
							editbox.view.$textEdit.css(styleKey, scaledStyleValue  +  'px');
							
							
							editbox.methods.text.label();
							
							if( typeof( renderPng) != 'undefined') 	{
								
								if( typeof( editbox.view.textedit2String ) == 'function' ) {
									editbox.view.textedit2String();
									editbox.view.adaptUL();
								}
								
								saveHistory('editbox letterspacing');
							}
														
							if( editbox.view.collection == 'richtext')  {
								editbox.view.adaptHeightToTextedit('M');
								if( typeof( renderPng) != 'undefined') editbox.methods.text.renderPng();	
							} else{
								editbox.view.model.get('json').data.needFreshPNG = true;
								editbox.view.redoAspectRatioAndSize('text editbox changes');
							}
													
						},
						
						fontSize: function( styleValue, styleKey, renderPng ) {	
							this.saveStyle( styleValue, styleKey, renderPng );
						},
						
						letterSpacing:  function( styleValue, styleKey, renderPng ) {	
							this.saveStyle( styleValue, styleKey, renderPng );
						},
						
						wordSpacing:  function( styleValue, styleKey, renderPng ) {
							this.saveStyle( styleValue, styleKey, renderPng );
						},
						
						lineHeight:  function( styleValue, styleKey, renderPng ) {

							
							$('#' + styleKey + '-slider').find('.arrow_box').text(styleValue);
							editbox.view.$textEdit.css(styleKey, styleValue  + '%');
							editbox.view.model.get('json').style.textedit[styleKey] = styleValue + '%';
							editbox.methods.text.label();
							
							editbox.view.adaptHeightToTextedit('M');
							
							if( typeof( renderPng) != 'undefined') {
								editbox.view.textedit2String();
								editbox.view.adaptUL();
								saveHistory('editbox lineHeight');
							}									
							
							if( typeof( renderPng) != 'undefined') editbox.methods.text.renderPng();
						}
					},
					
					renderPng: function() {
						
						var that = this,
								renderPng = function() {
									app.stubs.renderPNGIsBusy = true;
									editbox.view.renderPngFromTextedit('making style change to richtext', function() {
										saveHistory('making style change to richtext');	
										app.stubs.renderPNGIsBusy = false;
									});											
								};
						
						if( ! app.stubs.renderPNGIsBusy ) renderPng();
					}
				},
				
				textshadow: {
					
					values: {
						textshadow: []
					},
					
					bind: {
						
						init: function() {

							this.textshadow();
							
						},
						
						textshadow: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 50,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.textshadow.values.textshadow.push(i);
							}
							
							
							$('#textshadow-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								
								step:	1,
								
								start: function() {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								}, 
								
								slide: function(event, ui) { 
									
									editbox.methods.textshadow.save.textshadow( ui.value );
									
								},
								stop:	function(event, ui) {
									
									editbox.methods.textshadow.save.textshadow( ui.value, true );
									
									saveHistory('editbox textshadow values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
						
					},
					
					stepperPlugin: {
						textshadow: undefined,
					},
					
					renderPng: function() {
						
						var that = this,
								renderPng = function() {
									app.stubs.renderPNGIsBusy = true;
									editbox.view.renderPngFromTextedit('making style change to richtext', function() {
										saveHistory('making style change to richtext');	
										app.stubs.renderPNGIsBusy = false;
									});											
								};
						
						if( ! app.stubs.renderPNGIsBusy ) renderPng();
					},
						
					save: {
						
						textshadow: function( value, renderPngFromTextedit ) {
							
							if( editbox.view.collection == 'richtext' ) editbox.view.$textEdit.html( editbox.view.model.get('json').data.text);
							
							editbox.view.model.get('json').data.textshadow = value;
						
							var theStyle = value + 'px ' + value + 'px ' + value * 2 + 'px rgba(0,0,0,0.4)';
						
							editbox.view.model.get('json').style.textedit['text-shadow'] = theStyle;
							
							editbox.view.$textEdit.css( 'text-shadow', theStyle );

							var idx	=	_.indexOf( editbox.methods.textshadow.values.textshadow, parseInt(value));
								
							$('#textshadow-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							editbox.methods.textshadow.stepperPlugin.textshadow.setValue(value, true);
							
							editbox.view.scaleCustom();
									
							if( renderPngFromTextedit && 
									editbox.view.collection == 'richtext'
							) {
								setTimeout(function(){
									editbox.view.adaptHeightToTextedit('M');
									editbox.methods.textshadow.renderPng();
								}, 100);
								
							}
														
						}
					},
					
					label: function() {
							
							if( typeof( editbox.view.model.get('json').data.textshadow ) == 'undefined' ){		
								var textshadow = 0;
							}else{
								var textshadow = parseInt(editbox.view.model.get('json').data.textshadow);
							};
							
							var idx	=	_.indexOf( editbox.methods.textshadow.values.textshadow, parseInt(textshadow));
							
							$('#textshadow-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(textshadow);
							
							editbox.methods.textshadow.stepperPlugin.textshadow.setValue(textshadow, true);

							var idx	=	_.indexOf( this.values.textshadow, textshadow);	
							$('#textshadow-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(textshadow);	
				
				
					}
				},
				
				svgshadow: {  // working svg shadows
					
					values: {
						svgshadow: []
					},
					
					bind: {
						
						init: function() {

							this.svgshadow();
							
						},
						
						svgshadow: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 50,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.svgshadow.values.svgshadow.push(i);
							}
							
							
							$('#svgshadow-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								
								step:	1,
								
								start: function() {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'svgshadow');
								}, 
								
								slide: function(event, ui) { 
									
									editbox.methods.svgshadow.save.svgshadow( ui.value );
									
								},
								stop:	function(event, ui) {
									
									editbox.methods.svgshadow.save.svgshadow( ui.value, true );
									
									saveHistory('editbox svgshadow values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
						
					},
					
					stepperPlugin: {
						svgshadow: undefined,
					},
						
					save: {
						
						svgshadow: function( value, renderPngFromTextedit ) {
							
							editbox.view.model.get('json').data.svgshadow = value;
						
							var theStyle = 'drop-shadow(' + value + 'px ' + value + 'px ' + value * 2 + 'px rgba(0,0,0,0.4) )';
						
							editbox.view.model.get('json').style.svgshape['filter'] = theStyle;
							
							editbox.view.$svgshape.css('filter', theStyle );

							var idx	=	_.indexOf( editbox.methods.svgshadow.values.svgshadow, parseInt(value));
								
							$('#svgshadow-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							editbox.methods.svgshadow.stepperPlugin.svgshadow.setValue(value, true);
							
							editbox.view.scaleCustom();
														
						}
					},
					
					label: function() {
							
							if( typeof( editbox.view.model.get('json').data.svgshadow ) == 'undefined' ){		
								var svgshadow = 0;
							}else{
								var svgshadow = parseInt(editbox.view.model.get('json').data.svgshadow);
							};
							
							var idx	=	_.indexOf( editbox.methods.svgshadow.values.svgshadow, parseInt(svgshadow));
							
							$('#svgshadow-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(svgshadow);
							
							editbox.methods.svgshadow.stepperPlugin.svgshadow.setValue(svgshadow, true);

							var idx	=	_.indexOf( this.values.svgshadow, svgshadow);	
							$('#svgshadow-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(svgshadow);	
				
				
					}
				},
				
				stroke: {  // working  methods stroke
					
					values: {
						stroke: []
					},
					
					bind: {
						
						init: function() {

							this.stroke();
							
						},
						
						stroke: function() {
							
							var that = this,
									minValue = 0,
									maxValue = 50,
									maxSteps = maxValue - minValue;
									
							for( var i = minValue; i <= maxValue; i++){
								editbox.methods.stroke.values.stroke.push(i);
							}
							
							
							$('#stroke-slider').slider({
								value:0,
								min: 0,
								max: maxSteps,
								
								step:	1,
								
								start: function() {
									app.methods.clearActive( ['hideColorPicker'], 'include', 'slider');
								}, 
								
								slide: function(event, ui) { 
									
									editbox.methods.stroke.save.stroke( ui.value );
									
								},
								stop:	function(event, ui) {
									
									editbox.methods.stroke.save.stroke( ui.value, true );
									
									saveHistory('editbox stroke values');
								}	
							}).find('.ui-slider-handle').append(editbox.slider.tear);
							
						}
						
					},
					
					stepperPlugin: {
						stroke: undefined,
					},
					
					renderPng: function() {
						
						var that = this,
								renderPng = function() {
									app.stubs.renderPNGIsBusy = true;
									editbox.view.renderPngFromTextedit('making style change to richtext', function() {
										saveHistory('making style change to richtext');	
										app.stubs.renderPNGIsBusy = false;
									});											
								};
						
						if( ! app.stubs.renderPNGIsBusy ) renderPng();
					},
						
					save: {
						
						stroke: function( value, render ) {
							
							editbox.view.model.get('json').data.strokewidth = value;
							
							switch(	editbox.view.collection	){
								
								case 'headers': {
								
									var theStyle = value + 'px ';
								
									editbox.view.model.get('json').style.textedit['-webkit-text-stroke-width'] = theStyle;
									
									editbox.view.$textEdit.css( '-webkit-text-stroke-width', theStyle );
									
									var strokefill = editbox.view.model.get('json').data.strokefill;
									
									if( typeof( strokefill ) == 'undefined') {
										var transparentUrl = 'url(' + 'img/transparent.png)';
										$('#background-sample').css({ 'background': transparentUrl});
										var strokefill = 'TRANSPARENT';
										editbox.view.model.get('json').data.strokefill = strokefill;
									}
									
									if( value > 0 ) editbox.view.$textEdit.css( '-webkit-text-fill-color', strokefill);
									else  editbox.view.$textEdit.css( '-webkit-text-fill-color', '' );	
																		
									break;
								}

							}
							
							// working stroke save
							if(  tools.inArray( editbox.view.model.get('json').collection, app.settings.hasSvgshapes) ){

									var strokeWidthvalue = value / 10;
									
									var theStyle = strokeWidthvalue + 'px ';
							
									editbox.view.model.get('json').style.svgshape['stroke-width'] = theStyle;
									editbox.view.$svgshape.css( 'stroke-width', strokeWidthvalue + 'px');
									
//										if( typeof( editbox.view.model.get('json').data.new ) != 'undefined' ){
//											
//											delete editbox.view.model.get('json').data.new;
//											
//											var transparentUrl = 'url(' + 'img/transparent.png)';
//											$('#background-sample').css({ 'background': transparentUrl});
//											editbox.view.model.get('json').style.svgshape['fill'] = 'TRANSPARENT';
//											editbox.view.$svgshape.css( 'fill', 'TRANSPARENT');
//																	
//										}
							}

							var idx	=	_.indexOf( editbox.methods.stroke.values.stroke, parseInt(value));
								
							$('#stroke-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(value);
							
							editbox.methods.stroke.stepperPlugin.stroke.setValue(value, true);
							
							editbox.view.scaleCustom();
							
							
							return;
							
							if( render ){
								setTimeout(function(){
									editbox.methods.stroke.renderPng();
								}, 100);								
							};

									
						}
					},
					
					label: function() {
						
							if( tools.detectIE() && !tools.inArray( editbox.view.model.get('json').collection, app.settings.hasSvgshapes)){  // working unhide color
								var $rowBackgroundSample = $('#background-sample').parent().parent();
								$rowBackgroundSample.hide();								
								return;	
							}
							
							
							switch(	editbox.view.collection	){
								
								case 'headers':
									
									if( typeof( editbox.view.model.get('json').data.strokewidth ) == 'undefined' ){		
										var strokewidth = 0;
									}else{
										var strokewidth = parseInt(editbox.view.model.get('json').data.strokewidth);  
									};
																		
								break;

							}
							
							if( tools.inArray( editbox.view.model.get('json').collection, app.settings.hasSvgshapes) ){ // working label stroke width

									if( typeof( editbox.view.model.get('json').style.svgshape['stroke-width'] ) == 'undefined' ){		
										var strokewidth = 0;
									}else{
										var strokewidth = parseFloat(editbox.view.model.get('json').style.svgshape['stroke-width']);  
									};
									
									strokewidth *= 10;
							}
							
							var idx	=	_.indexOf( editbox.methods.stroke.values.stroke, parseInt(strokewidth));
							
							$('#stroke-slider').slider('option', 'value', idx)
							.find('.arrow_box').text(strokewidth);
							
							editbox.methods.stroke.stepperPlugin.stroke.setValue(strokewidth, true);

							var idx	=	_.indexOf( this.values.stroke, strokewidth);	
							$('#stroke-slider').slider('option', 'value', idx)
								.find('.arrow_box').text(strokewidth);	
				
				
					}
				}		
			},	
					
			bind:{
				drag: function() {				
					this.$el.draggable({
						cursor:	"move",
						start: function(event,	ui)	{
							$('.edit-row').addClass('grabbing');
						
						},
						drag:	function(event,	ui) {
						
						
						},
						stop:	function(event,	ui) {
							$('.edit-row').removeClass('grabbing');
						
						}
					});				
				},
				close: function() {				
					$('#edit-box-close-wrapper button.close').click( function() {
						app.methods.clearActive(undefined, undefined, 'close button edit box');
						return false;
					});
				}
			},
			
			slider: {
					tear: '\
										<div  class="handle-wrapper">\
											<div  class="tear-handle trans" >\
											  <div class="arrow_box">\
											  </div>\
											</div>\
											<div  class="ball-handle trans" >\
											</div>\
										</div>\
									',

			},			
			
			view: {},
			
			stubs:{
				totalRowHeight: 0
			},
			
			settings:{
				textrow:{
					paragraph: 165,
					richtext: 157
				},
				heightOfChartRow: 430,
				heightOfcustomBorderRow: 183,
				heightOfChartForPiesRow: 330,
				heightOfImageRow: 67,
				opacityRow: 50,
				heightOfShapesRow: 165,
				heightOfImgToolsRow: 66,
				heightOfCTARow: 74,
				heightOfLockRow: 33,
				heightOfCloseWrapper: 15,
				heightOfRow: 33
			},

			adjustSizeOfEditbox: function() {
				
				var imageHeightBox = 740,
						paraHeightBox = 620,
						chartHeight = 550,
						shapeHeight = 740;

				var heightObj = {
					'headers': 620,	
					'paragraphs': paraHeightBox,	
					'richtext': paraHeightBox,	
					'numbers': 195,	
					'icons': 320,	
					'svg': 230,	
					'backgrounds': 500,	
					'googledrive': imageHeightBox,	
					'banners': imageHeightBox,	
					'speech': imageHeightBox,	
					'arrows': imageHeightBox,	
					'borders': imageHeightBox,	
					'clipart': imageHeightBox,	
					'shapes': shapeHeight,	
					'shapeone': shapeHeight,	
					'shapetwo': shapeHeight,	
					'mask': shapeHeight,	
					'polygon': shapeHeight,	
					'shapethree': shapeHeight,	
					'shapefour': shapeHeight,	
					'straights': 270,	
					'vectors': imageHeightBox,	
					'photos': imageHeightBox,	
					'web': imageHeightBox,	
					'angleLines': 200,	
					'dynolines': 200,	
					'zagLines': 240,	
					'pies': 473,	
					'lines': chartHeight,	
					'bars': chartHeight,	
					'area': chartHeight,	
					'stepped': 568,	
					'scatter': chartHeight,	
					'columns': chartHeight,	
				}
				
				for( var idx in app.settings.hasSvgshapes){ // working height of edit box
					var svgshape = app.settings.hasSvgshapes[idx];
					heightObj[svgshape] = 560;
					if( tools.detectIE() && !tools.detectEdge() &&
							tools.inArray( editbox.view.collection, app.settings.hasSvgshapes)
					){
						heightObj[svgshape] = 520;
					}
					// heightObj[svgshape] = 520; // BUG FIXING
				}
				
				if( !tools.detectIE() )  heightObj['headers'] = 680;
				
				var heightIs = heightObj[this.view.collection];
				
				var fooArray = app.settings.canSaveImageToCloudDrive.concat(['headers', 'richtext']);
				var fooArray = fooArray.concat(app.settings.hasShapes);
				
				if( !isSocial && tools.inArray(this.view.collection, fooArray )) heightIs -= 50;
				
				if( typeof( editbox.view.model.get('json').data.glow ) != 'undefined') heightIs += 50;

				if( tools.inArray(editbox.view.model.get('json').collection, app.settings.charts)){
					
					var version  = editbox.view.model.get('json').version,
							collection = editbox.view.model.get('json').collection,
							graphicModel = app.stubs.collections.graphics[collection].findWhere({version: parseInt(version)}),
							defaultChartOptions = graphicModel.get('json').data.charts.options;
			
					if( defaultChartOptions.legend.position == 'none') heightIs = heightIs - 34;
					
				}

				this.$el.css({
					'height':  heightIs + 'px'	
				});
				
			},
			
			showWhichRows: function() {
				
				this.$el.find('.edit-row').hide();
				
				for( var idx in this.view.editBoxComponents){
					var component = this.view.editBoxComponents[idx];
					this.$el.find('.edit-row[component=' + component + ']').show();
				}
				
				if( editbox.view.collection != 'mask') this.$el.find('.edit-row[component=glow]').hide();
				
				if( editbox.view.collection == 'richtext') {
					$('#line-height-row').show();
					$('#word-spacing-row').show();
				} 
				
				if( editbox.view.collection == 'straights') {
					var hideWhat = [
						'shadow',
						'radius',
						'rotate'
					];	
					for( var idx in hideWhat){
						var name = hideWhat[idx];
							$('.slider-row[name=' + name + ']').hide();
					}
				}
				
				if( editbox.view.collection == 'paragraphs') {
					this.$el.find('.edit-row[component=align]').show();
					
				} else {
					this.$el.find('.edit-row[component=align]').hide();
				}
				
				
				if( editbox.view.collection == 'headers') {
					$('#line-height-row').hide();
					$('#word-spacing-row').hide();
					$('#edit-text').height(106);
				} 
				
				if( tools.detectIE() && !tools.inArray( editbox.view.collection, app.settings.hasSvgshapes)) $('#edit-stroke').hide();  // working editbox show stroke

				if( tools.detectIE() && !tools.detectEdge() &&
						tools.inArray( editbox.view.collection, app.settings.hasSvgshapes)
				){
					$('#edit-svgshadow').hide();
				}
				
				//  $('#edit-svgshadow').hide(); // BUG FIXING
				
				if( editbox.view.collection == 'icons' ||  
						editbox.view.collection == 'svg' ||
						tools.inArray( editbox.view.collection, app.settings.hasSvgshapes) // working editbox show which
						) {
					$('.crop-column').hide();
				} else{
					$('.crop-column').show();
				}
				
				if(tools.inArray(this.view.collection, app.settings.canSaveImageToCloudDrive)){
					this.$el.find('.edit-row[component=image]').show();
				} else {
					this.$el.find('.edit-row[component=image]').hide();
				}
				
				
				if( editbox.view.collection == 'straights' || 
						tools.inArray( editbox.view.collection, app.settings.hasShapes)
				) {		
					this.$el.find('.slider-row[name=border-width]').show();
				}		
				
				if( tools.inArray( editbox.view.collection, app.settings.hasShapes)||
						tools.inArray(this.view.collection, app.settings.canSaveImageToCloudDrive)
				) {
					var showWhat = [
						'shadow',
						'radius',
						'rotate'
					];			
					for( var idx in showWhat){
						var name = showWhat[idx];
							$('.slider-row[name=' + name + ']').show();
					}
				}				
							
				var hideWhat = [
					'subtitle-font-size',
					'axis-subtitle-font-size',
					'rotate'
				];				
				
				if( editbox.view.collection == 'pies') {
					
					for( var idx in hideWhat){
						var name = hideWhat[idx];
							$('.slider-row[name=' + name + ']').hide();
					}
					
					$('.slider-row[name=slice-font-size]').show();
					
				} else {
					
					for( var idx in hideWhat){
						var name = hideWhat[idx];
							$('.slider-row[name=' + name + ']').show();
					}
					
					$('.slider-row[name=slice-font-size]').hide();
					
				}
				
				if( ! tools.inArray(editbox.view.model.get('json').collection, app.settings.charts)) return;
				
				var version  = editbox.view.model.get('json').version,
						collection = editbox.view.model.get('json').collection,
						graphicModel = app.stubs.collections.graphics[collection].findWhere({version: parseInt(version)}),
						defaultChartOptions = graphicModel.get('json').data.charts.options;
		
				if( defaultChartOptions.legend.position == 'none'){
					
					$('.slider-row[name=legend-subtitle-font-size]').hide();
					
				}else{
					
					$('.slider-row[name=legend-subtitle-font-size]').show();
					
				}		

			},
			
			positionEditBox: function( event, isGroup ) {
				
				var $selector = ( typeof( isGroup ) != 'undefined' ? $('#groupy') : this.view.$el),
						left, top,
						buffer = 45,
						$window = $(window),
						windowWidth = $window.width(),
						element_id = this.view.cid,
						elementWidth = $selector.width(),
						elementOffSetLeft = $selector.offset().left,
						elementOffSetRight = $selector.offset().left + elementWidth,
						elementOffSetTop = $selector.offset().top,
						editElementBoxWidth = this.$el.width(),
						clickedSpotX = event.clientX,
						$panel = $('#panel_0'),
						panelOffSetLeft = $panel.offset().left,
						clickedSpotXSubLeftOfPanel = clickedSpotX - panelOffSetLeft,
						bufferWithWidthOfElementBox = editElementBoxWidth + buffer,
						panelHalfwayPoint = $panel.width()/2,
						whichHalfPanel = ( clickedSpotXSubLeftOfPanel > panelHalfwayPoint	?	2	:	1	);
	
				if(	whichHalfPanel ==	2	){

					left = elementOffSetLeft - bufferWithWidthOfElementBox;

					if(	$selector.hasClass('dynoline')){
						left = clickedSpotX + buffer;
						if( left > windowWidth - editElementBoxWidth){
								left = clickedSpotX - bufferWithWidthOfElementBox - buffer;
						}
					}

				}else{

					left = elementOffSetRight + buffer;

					if( left > windowWidth - editElementBoxWidth){
							left = elementOffSetLeft - bufferWithWidthOfElementBox + buffer;
					}

					if(	$selector.hasClass('dynoline')){
						left = clickedSpotX + buffer;
					}

				};

				var	top	=	(event.clientY - 15),
						mouseY = event.clientY,
						boxHeight	=	this.$el.height(),
						windowHeight = $(window).height();

				if(	(mouseY	+	boxHeight) > windowHeight){
					top	=	windowHeight - boxHeight - 30;
					// top	=	94; // debug
				};
				
				var cssObj = {
						left: ( left <= 0  ? 5: left) + 'px',
						top: ( top <= 0  ? 0: top) + 'px'	
				};
				
				this.$el.show().css(cssObj);
				
				return;
				this.$el.show().css({  // debug
						left: left + 'px',
						top: '200px'	
				});
			},
					
			whenEditClicked: function(event) {
				
				var that = this;
				
				var $rowBackgroundSample = $('#background-sample').parent().parent();
				
				this.view.$el.addClass('editting');
				
				if( tools.inArray( this.view.collection, app.settings.hasShapes)|| 
						tools.inArray( this.view.collection, app.settings.canSaveImageToCloudDrive ) ||
						this.view.collection == 'backgrounds'
				) $('#color-label').text('Border'); // ref
				else if( tools.inArray( this.view.collection, app.settings.hasFont )) $('#color-label').text('Text');
				else if( tools.inArray( this.view.collection, app.settings.hasLines )) $('#color-label').text('Line');
				else if( tools.inArray( this.view.collection, app.settings.hasSvgshapes) ) $('#color-label').text('Stroke');  // working labeling color
				else $('#color-label').text('Color');
				
				if( tools.inArray( this.view.collection, app.settings.hasShapes)){
					$rowBackgroundSample.show();
				} else{
					//$rowBackgroundSample.hide();	
				}
				
				this.adjustSizeOfEditbox();	
							
				this.showWhichRows();
				
				this.positionEditBox(event);
				
				$('#disable-align-input').prop('checked', ( this.view.alignIsDisabled ? true: false));
				
			},

		});
				
		var RotateIt = function(){
		
	    return function() {
	    
				var rotateIt = this;
				
				this.init = function( $container )	{

					this.$container = $container;
					this.$rotateHandler = this.$container.find('.rotate-handle');
					
					this.centerRotateHandle();
					
					if( $container.hasClass('resize-wrapper')){
						this.custom.elements.start.call(this);
						
					} else {
						this.custom.groupy.start.call(this);
					}
					
					this.bind();
					
				};
				
				this.centerRotateHandle = function() {
					this.$rotateHandler.css('left', (this.$container.width()/2) -  ( this.$rotateHandler.width() /2)+ 'px');
				};
				
				this.custom = {
					'elements': {
						start: function() {
							this.cid = this.$container.parent().attr('id');
							this.view = app.stubs.views.elements[this.cid];
							this.custom.elements.applyRotation.call( this );
							this.is = 'elements';
						},
						applyRotation: function() {
							
							if(  typeof( this.view.model.get('json').data ) == 'undefined'  ) return;

							this.rotation = this.rotating = parseFloat(this.view.model.get('json').data.rotation);
							var mirror = this.mirror = ( typeof( this.view.model.get('json').data.mirror ) != 'undefined' ? this.view.model.get('json').data.mirror: 1);
							
							for(var	idx	in app.settings.keysInLayout){
								
								this.view.$resizeWrapper.find('.custom-handle').css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  (-1 * mirror) * this.rotation +	'deg)');
								this.view.$el.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(' + this.rotation	+	'deg)'  );
								this.view.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(' + this.rotation + ' deg)'  + ' ' +  'scaleX(' + mirror + ')');
								
							}
							
							if( this.rotation != 0){
								this.view.$el.addClass('rotated');
							} else{
								this.view.$el.removeClass('rotated');
							};
																
							var that = this;
							
						  setTimeout(function(){
					  		that.custom.elements.changeDirectionOfResizeHandlesFromRotation.call( that, that.rotating );
					  	}, 1000);
					  	
						},
						
						changeDirectionOfResizeHandlesFromRotation: function(rotation) {
 							
							this.dirHandles = ['n', 'e', 'se', 's', 'w'];
			
							this.cursorArray = [
																	['ns-resize', 
																	'ew-resize',
																	'se-resize',
																	'ns-resize',
																	'ew-resize'
																	],
																	['nw-resize',
																	'sw-resize',
																	'ew-resize',
																	'se-resize',
																	'ne-resize'
																	],
																	['ew-resize',
																	'ns-resize',
																	'ne-resize',
																	'ew-resize',
																	'ns-resize'
																	],
																	['sw-resize',
																	'se-resize',
																	'ns-resize',
																	'ne-resize',
																	'nw-resize'
																	]
																];
																
								var useIdx = 0,
										absRotating = Math.abs(rotation);
										
								if(absRotating > 195) absRotating -= 180;
								
								if( rotation < 0 ){
									
									if(absRotating > 0) useIdx = 0;
									if(absRotating > 15) useIdx = 1;
									if(absRotating > 60) useIdx = 2;
									if(absRotating > 105) useIdx = 3;
									if(absRotating > 150) useIdx = 0;			
									
									this.reverseRotate = Math.abs(rotation);
															
								} else {
									
									if(absRotating > 0) useIdx = 0;
									if(absRotating > 15) useIdx = 3;
									if(absRotating > 60) useIdx = 2;
									if(absRotating > 105) useIdx = 1;
									if(absRotating > 150) useIdx = 0;	
									
									this.reverseRotate = '-' + Math.abs(rotation);
										
								}

								for( var idx in this.dirHandles){
									
									var handle = this.dirHandles[idx];

									if( handle == 'se' &&
											this.view.model.get('json').data.mirror == '-1'
									) {
										var	cursor = this.cursorArray[2][idx];		// working mirror resize handle
									} else{
										var cursor = this.cursorArray[useIdx][idx];										
									}								

									this.view.$el.find('.ui-resizable-' + handle).css('cursor', cursor);
									
								}
						}
					},
					'groupy': {
							start: function() {
								
								this.is = 'groupy';
								this.rotation = this.rotating = 0;
								for(var	idx	in app.settings.keysInLayout){
									$('#groupy').find('.custom-handle').css( app.settings.keysInLayout[idx] + 'transform', 'rotate(0deg)');
								}
							},
							cloneIntoGroupy: function() {
								
								if( $('#groupy').find('.resize-wrapper').length > 0 ) return;
								
								for( var idx in app.stubs.grouped){

									var cid = app.stubs.grouped[idx],
											view = app.stubs.views.elements[cid];
											
									if(view.collection == 'dynolines') continue;

									$( "#" + cid )
										.css('visibility', 'hidden')
										.clone()
										.css('visibility', 'visible')
										.attr('id', 'clone_' + cid)
										.appendTo( "#rotate-wrapper" );
										
									var $clone = $('#clone_'+ cid );
									
									$clone.removeClass('grouped')
										.offset({	left:	$('#'+ cid ).offset().left,	top: $('#'+ cid ).offset().top	})
										.find('.resize-wrapper')
										.children('.ui-resizable-handle, .custom-handle').remove();
										
									$clone.find('.line').children().remove();
										
								}
							},
							transferClonedStylesToElements: function(line) {  // new rotate transfer
								
								/* 
									Return clones to before rotated angle
									Copy clones offset coordinates to original
									Rotate original to its adding previous saved angle to groupy rotated angle
									Set rotation on clones to match groupy rotation  
								*/
								
								console.log('transferClonedStylesToElements:' + line);
								
								for(var	idx	in app.settings.keysInLayout){
									$('#groupy').find('.resize-wrapper').css(app.settings.keysInLayout[idx]  + 'transform', 'rotate('+ -1 *  this.rotation + 'deg)');
								}	
								for( var idx in app.stubs.grouped){
									var cid = app.stubs.grouped[idx],
											view = app.stubs.views.elements[cid];
											
									if(view.collection == 'dynolines') continue;

									var $clone = $('#clone_'+ cid );
											
										var curRotation = parseFloat(view.model.get('json').data.rotation),
												mirror = ( typeof( view.model.get('json').data.mirror ) != 'undefined' ? view.model.get('json').data.mirror: 1);
												
										if(typeof( $clone.data('originalRotation')) == 'undefined'){
											$clone.data('originalRotation', 0);
											$clone.data('originalMirror', mirror);
										} else{
											curRotation = $clone.data('originalRotation');
										}
												console.log('this.rotation', this.rotation);
										curRotation += parseFloat(this.rotation);
						
										view.$el.offset({	
											left:	$clone.find('.resize-wrapper').offset().left,	
											top: $clone.find('.resize-wrapper').offset().top	});
										
										for(var	idx	in app.settings.keysInLayout){
											view.$el.css('visibility', 'hidden');
											view.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  curRotation +	'deg)');
											view.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg) scaleX(' + mirror + ')' );
											view.$resizeWrapper.find('.custom-handle').css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  -1 * mirror * curRotation +	'deg)');
										}
										
										view.storeOffset();
										view.rotateIt.custom.elements.changeDirectionOfResizeHandlesFromRotation.call( view.rotateIt, curRotation );
										
										view.model.get('json').data.rotation = view.rotation = curRotation;
										
										view.model.get('json').style.element.left = parseFloat( view.$el.css('left'))  * multiple + 'px';
										view.model.get('json').style.element.top 	= parseFloat( view.$el.css('top'))   * multiple + 'px';
									if(typeof( view.model.get('json').style.resizeWrapper) == 'undefined'){
										view.model.get('json').style.resizeWrapper = {};
									}
									
									for(var	idx	in app.settings.keysInLayout){
										view.model.get('json').style.element[app.settings.keysInLayout[idx]  + 'transform'] = 'rotate(' + curRotation + 'deg)';
									}	
								}

								for(var	idx	in app.settings.keysInLayout){
									$('#groupy').find('.resize-wrapper').each( function() {
										$(this).css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(' + 
										$(this).parent().data('originalRotation')
										+ 'deg)  scaleX(' +  $(this).parent().data('originalMirror') + ')');
									});
								}	
								
							}
					}
				};

	    	this.bind = function() {
	    		
					var that = this;
					
					this.$container.find('.rotate-handle')
							.bind('click', function(event) {
								event.preventDefault();
							})
							.unbind('mousedown').mousedown( function(event)	{
								
								if( event.shiftKey ) return;
								
								if(app.stubs.stillRotating == false) app.methods.clearActive(['editBox'], 'include', 'rotate-handle mousedown');
								
								if( that.is == 'groupy'){
									if(app.stubs.stillRotating == false &&
										 $('#groupy').find('.resize-wrapper').length == 0
									) {
										
										if($('#groupy').is('.ui-resizable') ) $('#groupy').resizable('destroy');
										
										
										that.custom.groupy.cloneIntoGroupy.call( that );
									} 
								} else {
									app.stubs.$every.addClass('rotate-cursor');
									that.custom.elements.applyRotation.call( that );
								}
								
								that.$container.centerX = that.$container.offset().left	+	that.$container.width()/2;
								that.$container.centerY =	that.$container.offset().top	+	that.$container.height()/2;
								
								var	offset = Math.atan2(
											that.$container.centerY - event.pageY,	
											event.pageX	-	that.$container.centerX
										);
										
								$('#main').mousemove(function(e) {
									
									var	newOffset	=	Math.atan2(
																			that.$container.centerY	-	e.pageY, 
																			e.pageX - that.$container.centerX
																	);
																	
									var	rotating = that.rotation	+ (offset	-	newOffset) * app.settings.RAD2DEG;
									
									var mirror = 1;
									if( that.is == 'elements') {
										 mirror =( typeof( that.view.model.get('json').data.mirror ) != 'undefined' ? that.view.model.get('json').data.mirror: 1);
									}
									
									for(var	idx	in app.settings.keysInLayout){
										if( that.is == 'elements') {
											
											that.view.$el.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(0deg)'  );
											that.$container.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(' + rotating	+	'deg)'  + ' ' +  'scaleX(' + mirror + ')');

										} else{  // ROTATING HANDLE
											that.$container.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(' + rotating	+	'deg)');
										}
										
										// that.model.get('json').data.rotation = rotating;
									}
						
									that.rotating = rotating;
									
									if( that.is == 'elements') that.custom.elements.changeDirectionOfResizeHandlesFromRotation.call( that, that.rotating );

									var reverseRotate = ( rotating < 0 ? Math.abs(rotating) : '-' + Math.abs(rotating));
									
									//console.log(mirror);
									
									that.$container.find('.custom-handle').css('transform', 'rotate(' + mirror * reverseRotate + 'deg)');

									return false;
									
								})
						
								$('#main').mouseup(function(event)	{
									console.log('mouse up');
									
									$('#main').unbind('mousemove');
									$('#main').unbind('mouseup');
									
									that.rotation = that.rotating;
									
									if( that.is == 'groupy') {
										app.stubs.stillRotating = true;
										app.methods.clearActive('groupy mouseup');
										return false;	
										
									} else{
										
										app.stubs.$every.removeClass('rotate-cursor');
										that.view.model.get('json').data.rotation = that.rotation;
										
										if(typeof( that.view.model.get('json').style.resizeWrapper) == 'undefined'){
											that.view.model.get('json').style.resizeWrapper = {};
										}
										
										var mirror = ( typeof( that.view.model.get('json').data.mirror ) != 'undefined' ? that.view.model.get('json').data.mirror: 1);
										
										for(var	idx	in app.settings.keysInLayout){
											that.view.model.get('json').style.element[app.settings.keysInLayout[idx]  + 'transform'] = 'rotate(' + that.rotation + 'deg)';
											that.view.model.get('json').style.resizeWrapper[app.settings.keysInLayout[idx]  + 'transform'] = 'rotate(0deg)' + ' ' +  'scaleX(' + mirror + ')';
											that.view.$el.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(' + that.rotation	+	'deg)'  );
											that.$container.css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(0deg)'  + ' ' +  'scaleX(' + mirror + ')');
										}
										
										if( that.rotation != 0){
											that.view.$el.addClass('rotated');
										} else{
											that.view.$el.removeClass('rotated');
										};	
										
										app.methods.clearActive(['removeOntop', 'hideHandles'], 'exclude', 'clear rotate element');
										saveHistory('XXXX rotate');
									}
									
									return false;
									
								})
								
								return false;
							}
					)
	    	};
	    
			};
					
		}();
		
		var Colors = function(){
			
			this.init = function() {
				this.render();
				this.bind.init.call( this );
			};
			
			this.render = function() {
				
				this.$parent.append( tools.deepCopy(this.template) );
				
				if( typeof( this.makeDraggable ) != 'undefined' ){
					this.$parent.find('.colorPickerWrapper').draggable({});
				}
			};
							
			this.bind = {
				
				init: function() {
					
					var that = this;
					
					this.$parent.find('.colorPickerWrapper').on( 'mousedown', function(event) {
						event.stopPropagation();
					});	

					this.$parent.find('.colorPickerWrapper').click(function (event) {
						
						event.stopPropagation();
						
					  return false;
					});
					
					this.bind.sampleBox.call( this );
					this.bind.tabs.call( this );
					this.bind.swatches.call( this );
					this.bind.colorwheel.call( this );
					this.bind.colorsAlreadyPicked.call( this );
					this.bind.custom.call( this );
					//console.log('check this.  Happening twice in color');
				},

				sampleBox: function() {
					
					var that = this;
					
					this.$sampleBox.on('click', 
						function() {
							
							that.buildUsedSwatch();
								
							if( editbox.view.collection == 'richtext') {
								editbox.view.$textEdit.html( editbox.view.model.get('json').data.text);
								editbox.richTextColorChanged = true;
							}
								
							that.positionColorWrapper();
							
							var backgroundColor = $(this).css('background-color');
							
							if(backgroundColor != 'rgba(0, 0, 0, 0)'){ // not equal transparent
								that.farbtastic.setColor(that.rgbToHex(backgroundColor).toUpperCase());
								$('.custom-color-desired').val(that.rgbToHex(backgroundColor).toUpperCase());
							}
							
							$('.colorPickerWrapper').hide();
							
							that.$parent.find('.colorPickerWrapper').show();
							
							that.slideToPanel(0, 0);
							
							return false;
						}
					)
																
				},
				
				tabs: function() {
					
					var that = this;
					
					this.$parent.find('.colorPickerWrapper a').click(function (e) {
						
						var idx = $(this).parent().index();
						
						that.slideToPanel(idx, 400);
						
						if( idx == 3 ){
							$('.custom-color-desired').focus();
						}
						
						var timeoutID = window.setTimeout(function(){
							$('.ripple-wrapper').empty();
						}, 5000);
						
						// window.clearTimeout(timeoutID);

					  return false;
					})
																
				},
				
				swatches: function() {
					
					var that = this,
							saveToUsed = true;
			
					this.$parent.find('.colorpaletteDiv')
					.on('click', function() {return false;})
					.colorPalette()
					.on('selectColor', function(e) {
						$('.custom-color-desired').val(e.color.toUpperCase());
						that.setColor( e.color.toUpperCase(), saveToUsed );
					});

				},
				
				colorwheel: function() {
					
					var that = this;
					
					tools.doWhenReady(
						function() {
							return that.$parent.find('.colorwheelDiv').length > 0;
						},
						function() {

							that.farbtastic = $.farbtastic(
		
								that.$parent.find('.colorwheelDiv'),
		
								function(color, action) {
									
									that.color = color;
									
									var saveToUsed = false;
		
									switch(	action	){
										case 'mousedown':
											this.paintSelector(saveToUsed);
										break;
										case 'mousemove':
											this.paintSelector(saveToUsed);
										break;
										case 'mouseup':
											saveToUsed = true;
											this.paintSelector(saveToUsed);
										break;
									}
								}
		
							);
							
							that.farbtastic.setColor('#28eb72');
							
							that.farbtastic.paintSelector = function( saveToUsed ) {
								$('.custom-color-desired').val(that.color.toUpperCase());
								that.setColor( that.color.toUpperCase(), saveToUsed);
							};
							

						},
					'dowhen .colorwheelDiv appears in DOM -- should check this one.  only do once'
					);
					
					

				},
				
				colorsAlreadyPicked: function() {
					
					var that = this,
					saveToUsed = true;
					
					this.$parent.find('.colorsAlreadyPickedWrapper').on('click', 'button', function() {
						var color = $(this).css('background-color'),
								hexColor = that.rgbToHex(color);
						that.setColor( hexColor.toUpperCase(), saveToUsed);
						$('.custom-color-desired').val(hexColor.toUpperCase());
					});	
											
				},
				
				custom: function() {
					
					var that = this,
							verifyColor = function($this) {
								var desiredColor = $this.val();
								
								if( desiredColor.charAt(0) != '#'){
									desiredColor = '#' + desiredColor;
									$this.val(desiredColor);
								};
								
								var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(desiredColor);
								
								if( isOk ){
									var saveToUsed = true;
									that.setColor( desiredColor , saveToUsed);
								}else{
									toast('Please use a correct hex color format. (i.e. #FFF000)', 'keep', 5000, 'error', 'Something went wrong.');
								};
							};
					
					$('.custom-color-desired').unbind('keydown keypress').bind('keydown keypress', function(e){
				   if ( e.keyCode == 13 ) {
				   	verifyColor($(this));
				     e.preventDefault();
				   }
					}).unbind('change').bind('change', function() {
						verifyColor($(this));
					})
				}
			};
			
			this.buildUsedSwatch = function() {
				
				var template = '\
					<button class="btn-color" title="<%=	color	%>" style="background-color:<%=	color	%>">\
					</button>\
				';
				
				$('.colorsAlreadyPickedWrapper').empty();
				
				for( var idx in app.stubs.usedColors){
					var color = app.stubs.usedColors[idx];
					if( color == 'transparent') continue;
					$('.colorsAlreadyPickedWrapper').append(_.template(template,{ 'color': color}));
				}
					
			};

			this.slideToPanel = function( idx, speed ) {
				
				var widthTab = 63,
						tabLeft = idx * widthTab;
				
				this.$parent.find('.moving-line').css({'left': tabLeft + 'px'});
				
				var $selected = this.$parent.find('.color-tab-panel:eq( ' + (idx)+ ' )');
				
				this.$parent.find('.color-content').scrollTo($selected, speed);
				
				
				return;
				
				if( idx == 3 ){
					$('.elements').addClass('dropper');
					
					var getPixelColor = function(x, y) {
					    var pxData = ctx.getImageData(x, y, 1, 1);
					    return ("rgb(" + pxData.data[0] + "," + pxData.data[1] + "," + pxData.data[2] + ")");
					}
					
					var handleMouseMove = function (e) {
					
					    var mouseX = parseInt(e.clientX - offsetX);
					    var mouseY = parseInt(e.clientY - offsetY);
					
					    // Put your mousemove stuff here
					    var eyedropColor = getPixelColor(mouseX, mouseY);
					    console.log(getPixelColor(mouseX, mouseY));
					
					}
					
					var canva = document.getElementById("canvas");
					var ctx = canva.getContext("2d");
					var canvasOffset = $("#canvas").offset();
					var offsetX = canvasOffset.left;
					var offsetY = canvasOffset.top;
					
					$("#canvas").mousemove(function (e) {
					    handleMouseMove(e);
					});
					
				}else{
					$('.elements').removeClass('dropper');
				};
				
			};
			
			this.addColorToUsed = function( color ) {
				app.stubs.addUsedPlaceholder = color;
			};
			
			this.rgbToHex = function(rgbColor) {

				if (rgbColor.substr(0, 1) === '#') {
				    return rgbColor;
				}

				rgbColor = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

				return "#" +
				("0" + parseInt(rgbColor[1],10).toString(16)).slice(-2) +
				("0" + parseInt(rgbColor[2],10).toString(16)).slice(-2) +
				("0" + parseInt(rgbColor[3],10).toString(16)).slice(-2);
			};

			this.hexToRgb = function(hex, transparency){

				if( hex == 'transparent') return 'transparent';
				if( typeof(hex) == 'undefined') return;

				// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")  -- http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
				var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
				hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				    return r + r + g + g + b + b;
				});

				var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				
				if( typeof( transparency ) == 'undefined') transparency = 0;

				var spellItOut = function(obj) {
					return "rgba(" + obj.r + ', ' + obj.g + ', ' + obj.b + ", " + transparency + ")"
				};

				return result ? spellItOut({
					  r: parseInt(result[1], 16),
					  g: parseInt(result[2], 16),
					  b: parseInt(result[3], 16)
				}) : null;
			};
			
			this.getContrastColorFromHex = function(hex) {  // http://stackoverflow.com/questions/11867545/change-text-color-based-on-brightness-of-the-covered-background-area
				var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
				hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				    return r + r + g + g + b + b;
				});

				var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
				 		contrast = Math.round(((parseInt(result[1], 16) * 299) + (parseInt(result[2], 16) * 587) + (parseInt(result[3], 16) * 114)) /1000);

		    if(contrast > 125) {
		        return 'black';
		    }else{ 
		        return 'white';
		    }
			};
			
			this.positionColorWrapper = function() {

					var topOfSampleBox = this.$sampleBox.offset().top,
							$colorPickerWrapper = this.$parent.find('.colorPickerWrapper'),
							colorPickerWrapperHeight = $colorPickerWrapper.height(),
							bottomOfColorPickerWrapper = topOfSampleBox + colorPickerWrapperHeight,
							windowHeight = $(window).height(),
							bottomReached = bottomOfColorPickerWrapper > windowHeight,
							adjustedHeight = windowHeight - colorPickerWrapperHeight,
							whereObj = {
								'charts': {
									'parent': '#modal-screen',
									'class': '.row',
									'addThisClass' : '',
									'distanceFromSampleBox': 115
								},	
								'editbox': {
									'parent': '#color-wheel-container',
									'class': '',
									'addThisClass' : 'bottomReached',
									'distanceFromSampleBox': 33
								}
							};
							
							
					$colorPickerWrapper.show()
					.offset({
			  		'left': this.$sampleBox.offset().left + whereObj[this.launchFrom].distanceFromSampleBox,
			  		'top': ( bottomReached  ? adjustedHeight : this.$sampleBox.offset().top)
					});
					
					
					var pseudoTop = ( bottomReached ? this.$sampleBox.offset().top - adjustedHeight + 8: 7);
					
					$colorPickerWrapper.find('style').remove();

					
					if(  bottomReached ){
						var doClass = 'addClass';	
					}
					
					var doClass = ( bottomReached  ? 'addClass' : 'removeClass' );
					
					$colorPickerWrapper[doClass]( whereObj[this.launchFrom].addThisClass).prepend('\
						<style>\
							' + whereObj[this.launchFrom].parent + ' .colorPickerWrapper' + whereObj[this.launchFrom].class + '::before{\
							top: ' + pseudoTop + 'px;\
							}\
						</style>\
					');
			};
			
			this.transparent = 'url(img/transparent.png)';
			
			this.template = '\
				<div  class="colorPickerWrapper">\
					<ul class="nav nav-tabs">\
					  <li ><a>Swatch</a></li>\
					  <li ><a>Wheel</a></li>\
					  <li ><a>Used</a></li>\
					  <li ><a>Custom</a></li>\
						<div  class="moving-line-wrapper" >\
							<div  class="moving-line">\
							</div>\
						</div>\
					</ul>\
					<div class="color-content">\
						<div  class="color-stretched-wrapper" >\
							<div  class="colorpaletteDiv color-tab-panel"></div>\
							<div  class="colorwheelDiv color-tab-panel " ></div>\
							<div  class="colorsAlreadyPickedWrapper color-tab-panel"></div>\
							<div  class="colorsDropper color-tab-panel">\
							Hex color&nbsp;&nbsp;<input class="custom-color-desired"  />\
							</div>\
						</div>\
					</div>\
				</div>\
			';			
		};
		
		var SubcardsBackView = BackView.extend({
			initialize: function(options) {
				this.addOptions(options);
				this.render();
			},
			render: function() {
				this.html = _.template( this.template, this.options);
				return this;
			},
			getHtml: function() {
				return this.html;
			}
		});

		var ElementView = ElementBase.extend({
		
			templates:{

				web: '\
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
						',

				numbers: '\
							<div id="<%= id %>" class="elements noselect" collection="<%= collection %>" style="<%= elementStyle %>">\
								<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
									<div  class="textedit-wrapper light isSmall" style="<%= texteditWrapperStyle %>">\
										<div  class="textedit" style="<%= texteditStyle %>"><%= text %></div>\
									</div>\
									<div  class="custom-handle rotate-handle"></div>\
									<div  class="custom-handle zoom-handle"></div>\
									<div  class="custom-handle delete-handle"></div>\
									<div  class="custom-handle edit-handle"></div>\
									<div  class="custom-handle clone-handle"></div>\
								</div>\
							</div>\
						',
				paragraphs: '\
							<div id="<%= id %>" class="elements " collection="<%= collection %>" style="<%= elementStyle %>">\
								<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
									<div  id="testdom2"  data-lining class="textedit" style="<%= texteditStyle %>"><%= text %></div>\
									<div  class="custom-handle zoom-handle"></div>\
									<div  class="custom-handle delete-handle"></div>\
									<div  class="custom-handle edit-handle"></div>\
									<div  class="custom-handle clone-handle"></div>\
								</div>\
							</div>\
						'
			},
						
			custom: function() {
						
				this.drag();
				
				this.resize.init.call( this.view );
				
				this.rotate.init.call( this);
				
				this.click();
				
			},
			
			delete: function( groupDelete ) {
				
				var that = this,
						layers = app.stubs.views.editbox.methods.layers;
						
				app.stubs.collections.elements.get(this.cid).set('disabled', true);
				this.$el.hide();
				
				if( typeof(groupDelete) == 'undefined'){
					layers.redoLayers();
					saveHistory('element delete');					
				}

				
			},
			
			snapToGuide_depreciated: function( ui ) {
					
				var buffer = 5,
						panelView = app.stubs.views.panels['panel_0'],
						xs = panelView.bind.guideLines.get.xArr(),
						leftLeast = this.getBoundingBox().leftLeast;	

				for( var idx in xs) {
					
					var x = parseFloat(xs[idx]* scale );
					
					if ( tools.between(parseFloat(leftLeast), x - buffer, x + buffer)) {
						var leanLeft = x - ( parseFloat(leftLeast) - ui.position.left );
						this.$el.css('left',  leanLeft + 'px');
						ui.position.left = leanLeft;
					}

				}
			},
			
			canClick: true,

			drag: function() {

				var that = this,
						panelView = app.stubs.views.panels['panel_0'],
						xs,
						ys,
						panelWidth,
						halfPanelWidth,
						panelHeight,
						halfPanelHeight,
						quarterPanelWidth,
						quarterPanelHeight,
						elementWidth,
						halfElementWidth,
						resizeableElementWidth,
						halfresizeableElementWidth,
						elementHeight,
						halfElementHeight,
						resizeableElementHeight,
						halfresizeableElementHeight,
						dynamicElementWidth,
						dynamicElementHeight,
						leftOfHalfwayWidth,
						topOfHalfwayHeight,
						leftOutSideCenter,
						topOutSideCenter,
						colWidthForHalfsies,
						colHeightForHalfsies,
						halfColWidthForHalfsies,
						halfColHeightForHalfsies,
						halfsiesSecondPanelLeft,
						halfsiesSecondPanelTop,
						
						leftHalfsies,
						rightHalfsies,
						topHalfsies,
						bottomHalfsies,
						
						doAlign;
						
				var recoupLeft, recoupTop;
						
				this.$el.on('mousedown', 
					function(event) {
						
						event.stopPropagation();
						
						app.stubs.clickedMousPosX = event.pageX;
						app.stubs.clickedMousPosY = event.pageY;
						
						app.stubs.mainCurScollX = $('#main').scrollLeft();
						app.stubs.mainCurScollY = $('#main').scrollTop();
						
						app.stubs.mainCanScroll = true;
						
						if( event.button == 2 || event.ctrlKey) {
							
							that.canClick = false;
							 
							that.$el.draggable({ disabled: true });
							
							that.$el.on('mousemove', 
							
								function(e) {
									app.methods.scrollMain($(this), e.pageX, e.pageY);
								}
							)		

							var killMouseMove = function() {
									that.$el.off('mousemove');
									that.$el.off('mouseup');
									that.$el.draggable({ disabled: false });
									that.$el.css('cursor',	'');
									that.canClick = true;							
							};
				
							that.$el.on('mouseup', 
							
								function(event) {
									
									app.stubs.mainCanScroll = false;
									
									setTimeout(function(){
										killMouseMove();
									}, 200);

								}
							);	
							
							that.$el.on('mouseleave', 
							
								function(event) {
									
									app.stubs.mainCanScroll = false;
									
									setTimeout(function(){
										killMouseMove();
									}, 200);

								}
							);
								
				      return false; 
				      
				    }
				    return;

					}
				)
				.draggable({
					
					snap: '.guide-line',
					snapTolerance: 10,
					
					/*	
					grid: [ 
						app.settings.gridSpacing, 
						app.settings.gridSpacing 
					],	*/
					
					start: function(event,	ui) {
						
						if( tools.inArray( that.collection, app.settings.hasShapes) && that.isBorderLess() )  that.$el.addClass('moving');
						
						that.boundingboxElement =  that.getBoundingBox();
						
						xs = panelView.bind.guideLines.get.xArr();
						ys = panelView.bind.guideLines.get.yArr();
						panelWidth = panelView.$el.width();
						halfPanelWidth = panelView.$el.width()/2;
						panelHeight = panelView.$el.height();
						halfPanelHeight = panelHeight/2;
						quarterPanelWidth = panelWidth / 4;
						quarterPanelHeight = panelHeight / 4;
						elementWidth = that.$el.width();
						halfElementWidth = elementWidth / 2;
						resizeableElementWidth = that.boundingboxElement.width;
						halfresizeableElementWidth = resizeableElementWidth/2;
						elementHeight = that.$el.height();
						halfElementHeight = elementHeight / 2;
						resizeableElementHeight = that.boundingboxElement.height;
						halfresizeableElementHeight = resizeableElementHeight/2;
						dynamicElementWidth = halfresizeableElementWidth + halfElementWidth;
						dynamicElementHeight = halfresizeableElementHeight + halfElementHeight;
//						leftOfHalfwayWidth = halfPanelWidth - halfresizeableElementWidth;
//						topOfHalfwayHeight = halfPanelHeight - halfresizeableElementHeight;
						leftOutSideCenter = halfPanelWidth - resizeableElementWidth;
						topOutSideCenter = halfPanelHeight - resizeableElementHeight;
						colWidthForHalfsies = (panelWidth - (resizeableElementWidth * 2)) / 3;
						colHeightForHalfsies = (panelHeight - (resizeableElementHeight * 2)) / 3;
						halfColWidthForHalfsies  = colWidthForHalfsies / 2;
						halfColHeightForHalfsies  = colHeightForHalfsies / 2;
						halfsiesSecondPanelLeft = halfPanelWidth + halfColWidthForHalfsies;
						halfsiesSecondPanelTop = halfPanelHeight + halfColHeightForHalfsies;
						
						leftHalfsies = leftOutSideCenter - (leftOutSideCenter / 2 );
						rightHalfsies = halfPanelWidth + leftHalfsies;
						topHalfsies = topOutSideCenter - (topOutSideCenter / 2 );
						bottomHalfsies = halfPanelHeight + topHalfsies;
						
						app.methods.alignToGuide.buildArray.init.call(  app.methods.alignToGuide, that.cid );
						
						app.stubs.placement.topPlace = 120;
						app.stubs.placement.leftPlace = 120;
						app.methods.clearActive(['previewOn'], 'exclude', 'element drag start');
						that.$panel.addClass('dragging-within');
						
						
						
						
						// http://stackoverflow.com/questions/3523747/webkit-and-jquery-draggable-jumping  by Liao San-Kai
            var elLeft = parseInt($(this).css('left'),10);
            elLeft = isNaN(elLeft) ? 0 : elLeft;
            var elTop = parseInt($(this).css('top'),10);
            elTop = isNaN(elTop) ? 0 : elTop;
            recoupLeft = elLeft - ui.position.left;
            recoupTop = elTop - ui.position.top;
						
						
					},
					drag:	function(event,	ui)	{
						
						// http://stackoverflow.com/questions/3523747/webkit-and-jquery-draggable-jumping  by Liao San-Kai
						ui.position.left += recoupLeft;
            ui.position.top += recoupTop;
	
						//that.snapToGuide( ui );
						
						// app.methods.alignToGuide.hitWhenDrag(ui, 'left', colWidthForHalfsies, colWidthForHalfsies + halfresizeableElementWidth, 'horizontal-left-half-outside');
						// app.methods.alignToGuide.hitWhenDrag(ui, 'top', colHeightForHalfsies, colHeightForHalfsies + halfresizeableElementHeight, 'vertical-top-half-outside');
						
						/* CENTER OF FIRST HALF PANEL 
						app.methods.alignToGuide.hitWhenDrag(ui, 'left', leftHalfsies, leftHalfsies + halfresizeableElementWidth, 'horizontal-left-half-outside');
						app.methods.alignToGuide.hitWhenDrag(ui, 'top', topHalfsies, topHalfsies + halfresizeableElementHeight, 'vertical-top-half-outside');
						*/
						if( that.alignIsDisabled == false ) {
							
						 	app.methods.alignToGuide.hitWhenDrag(ui, 'left', 0 + (dynamicElementWidth - elementWidth), 0, 'horizontal-left-edge');
							app.methods.alignToGuide.hitWhenDrag(ui, 'top', 0 + (dynamicElementHeight - elementHeight), 0, 'vertical-top-edge');
							
							/* NEAR EDGE OF CENTER */
						 	app.methods.alignToGuide.hitWhenDrag(ui, 'left', halfPanelWidth - dynamicElementWidth, halfPanelWidth, 'horizontal-left-outside');
							app.methods.alignToGuide.hitWhenDrag(ui, 'top', halfPanelHeight - dynamicElementHeight, halfPanelHeight, 'vertical-top-outside');
	
							/* CENTER OF PANEL */
							app.methods.alignToGuide.hitWhenDrag(ui, 'left', halfPanelWidth - halfElementWidth, halfPanelWidth, 'horizontal-center');
							app.methods.alignToGuide.hitWhenDrag(ui, 'top', halfPanelHeight - halfElementHeight, halfPanelHeight, 'vertical-middle');
	
							/* FAR EDGE OF CENTER */
							app.methods.alignToGuide.hitWhenDrag(ui, 'left', halfPanelWidth - ( halfElementWidth - halfresizeableElementWidth ), halfPanelWidth, 'horizontal-right-outside');
							app.methods.alignToGuide.hitWhenDrag(ui, 'top', halfPanelHeight - ( halfElementHeight - halfresizeableElementHeight ), 'vertical-bottom-outside');
							
						 	app.methods.alignToGuide.hitWhenDrag(ui, 'left', panelWidth - dynamicElementWidth, panelWidth, 'horizontal-right-edge');
							app.methods.alignToGuide.hitWhenDrag(ui, 'top', (panelHeight - dynamicElementHeight) , panelHeight, 'vertical-bottom-edge');
							
						}
						
						// app.methods.alignToGuide.hitWhenDrag(ui, 'left', halfsiesSecondPanelLeft, halfsiesSecondPanelLeft + halfresizeableElementWidth, 'horizontal-right-half-outside');
						// app.methods.alignToGuide.hitWhenDrag(ui, 'top', halfsiesSecondPanelTop, halfsiesSecondPanelTop + halfresizeableElementHeight, 'verticall-bottom-half-outside');
						
						/* CENTER OF SECOND HALF PANEL 
						app.methods.alignToGuide.hitWhenDrag(ui, 'left', rightHalfsies, rightHalfsies + halfresizeableElementWidth, 'horizontal-right-half-outside');
						app.methods.alignToGuide.hitWhenDrag(ui, 'top', bottomHalfsies, bottomHalfsies + halfresizeableElementHeight, 'verticall-bottom-half-outside');
						*/
						
						for( var side in app.methods.alignToGuide.arrays){
							for( var idx in app.methods.alignToGuide.arrays[side]){
								var obj = app.methods.alignToGuide.arrays[side][idx];
								app.methods.alignToGuide.hitWhenDrag(ui, side, obj.hitPos, obj.linePos, obj.hitPos);
							}							
						}

					},
					stop: function(event,	ui) {
						
						if( tools.inArray( that.collection, app.settings.hasShapes) && that.isBorderLess() ) that.$el.removeClass('moving');
						
						app.methods.alignToGuide.hideIt();
						
						//that.snapToGuide( ui );
						
						var jsonLeft = ui.position.left * multiple,
								jsonTop = ui.position.top * multiple;
						
						that.model.get('json').style.element.left  = jsonLeft + 'px';
						that.model.get('json').style.element.top  = jsonTop + 'px';
						that.$panel.removeClass('dragging-within');
						$(this).addClass('deactivateClick');
						
						that.storeOffset();
						
						saveHistory('element drag');
						
					}
				});
			},
			
			once: false,
			
			reviseDimOfElement: function() {
				return;
				var obj = this.getBoundingBox(),
						newTop = obj.topLeast,
						newHeight = (obj.topMost - obj.topLeast),
						newLeft = obj.leftLeast,
						newWidth = (obj.leftMost - obj.leftLeast);
						
/*				if( !this.once) {
					this.once = true;
					return;
				}*/
				
				this.$el.css({
					left: newLeft + 'px',	
					top: newTop + 'px',	
					width: newWidth + 'px',	
					height: newHeight + 'px'
				});
				
				var diff = (Math.abs( newWidth - newHeight)/2);
				
				this.$resizeWrapper.css({
					left: diff  * -1 + 'px',	
					top: diff + 'px'
				});
				
				
				
				this.model.get('json').style.element.left = newLeft * multiple + 'px';
				this.model.get('json').style.element.top = newTop * multiple + 'px';
				this.model.get('json').style.element.width = newWidth * multiple + 'px';
				this.model.get('json').style.element.height = newHeight * multiple + 'px';
				
				
				
				this.model.get('json').style.resizeWrapper.left = diff  * -1 * multiple + 'px';
				this.model.get('json').style.resizeWrapper.top = diff * multiple + 'px';
				
				this.model.get('json').style.resizeWrapper.width = newWidth * multiple + 'px';
				this.model.get('json').style.resizeWrapper.height = newHeight * multiple + 'px';
				
			},
			
			click: function() {
				
				var that = this,
						grabmove = false;
				
				this.bindHandles.init.call( this );
				
				this.$el.dblclick(	function(event)	{
					return false;
				});
				
				this.$el.on('click', 
					function(event) {
						
						if( !that.canClick ) return;
						
/*						var	elRealWidth = parseFloat(that.model.get('json').style.element.width),
								elRealHeight = parseFloat(that.model.get('json').style.element.height), //  - ( $(this).width()/2) - ( $(this).height()/2)
								elLeftShouldBe = parseFloat($(this).css('left')) - (( tools.getScreenDim().width * multiple)/2) + 50,
								elTopShouldBe = parseFloat($(this).css('top')) - (( tools.getScreenDim().height * multiple)/2) + 50,
								
								

						var elLeftShouldBe = parseFloat($('.ontop').css('top')) - 50,
								elTopShouldBe = parseFloat($('.ontop').css('top')) - 50,
								
						var	elLeftShouldBe = parseFloat($(this).css('left')) - (( tools.getScreenDim().width * multiple)/2) + $(this).width()/4,
								elTopShouldBe = parseFloat($(this).css('top')) - (( tools.getScreenDim().height * multiple)/2) + $(this).height()/4,								
								scrollLeft = ( elLeftShouldBe > 0 ? elLeftShouldBe: 0),
								scrollTop = ( elTopShouldBe > 0 ? elTopShouldBe: 0)

						$('#main').scrollTo( {left: scrollLeft, top: scrollTop}, 300, function(){});*/
						
//						$('#main').scrollTop(parseFloat($(this).css('top'))- 50);
//						$('#main').scrollLeft(parseFloat($(this).css('left'))- 50);
						
						if( $(this).hasClass('locked') ) {
							
							return;

						};
						
						if($(this).hasClass('deactivateClick')) {
							$(this).removeClass('deactivateClick');
							return;
						}
						
						if( event.shiftKey ) {
							
							app.methods.clearActive(['disableGroupy', 'emptyGrouped', 'previewOn'], 'exclude', 'element shiftKey');

							app.methods.groupyBox.addForeignElement(that.cid)

							return false;
							
						}
						
						app.stubs.activeCid = that.cid;

						app.methods.clearActive(['previewOn', 'removeSnack', 'clearActiveCid', 'removeToast'], 'exclude', 'element xxx bum hey');
						
						if( !app.stubs.previewIsOn ) $(this).addClass('ontop');
						
						$('.tooltip').hide();
						
						$('.elements').removeClass('see-handles');
						$(this).addClass('see-handles');	
						
						$(this).find('.resize-wrapper').removeClass('hovering');
			    	$(this).removeClass('hovering');					
						
						return false;	
					}
				);

				this.$el.on('mouseenter', function(){
						if( !that.$el.hasClass('rotated')) return;
						if( that.$el.hasClass('ontop')) return;
			    	$(this).find('.resize-wrapper').addClass('hovering');
			    	$(this).addClass('hovering');
			    	return false;	
				}).on('mouseleave', function(){
						grabmove = false;
			    	$(this).find('.resize-wrapper').removeClass('hovering');
			    	$(this).removeClass('hovering');
			    	return false;	
				});
				
				return;

				/*				
				this.$el.on('mouseup', 
					function(event) {
						
						console.log('mouseup');
					}
				)						
				*/
				
			},

			bindHandles: {
				
				init: function() {
					this.bindHandles.edit.call(this);
					this.bindHandles.delete.call(this);
					this.bindHandles.zoom.call(this);
					this.bindHandles.clone.call(this);
				},
				
				zoom: function() {
					var that = this;	
					this.$el.on('click', '.zoom-handle', 
						function(event) {
							var whichTarget = ($(this).hasClass('zoomHandleGlassShowsOut') ? 'main': 'element');
							app.menu.resize.matchZoomTargetSize(whichTarget);
							event.stopPropagation();
							return false;
						}
					);
				},
				
				edit: function() {
					// stub.. replaced with instantiated 
				},
				
				delete: function() {
					var that = this;	
							
					this.$el.on('click', '.custom-handle.delete-handle', 
						function() {
							app.methods.clearActive(['previewOn'], 'exclude', 'element clone');
							that.delete();
							return false;
						}
					);
				},
				
				clone: function() {
					
					var that = this;
					
					this.$el.on('click', '.custom-handle.clone-handle', 
						function(event) {

							event.stopPropagation();
							
							app.stubs.cloned = [];
							app.methods.clone(that.model, 'element');
							
							app.methods.clearActive(['previewOn'], 'exclude', 'element clone 2');
							var clonedView = app.stubs.views.elements[ app.stubs.cloned[0] ];
							
							if( clonedView.collection == 'headers'){
								clonedView.redoAspectRatioAndSize('clone changes');	// change
							}
						}
					);					
				}

			},
	
			setSizeForResizeWrapper: function() {
								
				var that = this,
						width = parseFloat(this.model.get('json').style.element.width),
						height = parseFloat(this.model.get('json').style.element.height);
						
				this.$el.css({
					width: width * scale + 'px',
					height: height * scale + 'px'
				});
				
				this.$resizeWrapper.width( width * scale)
				this.$resizeWrapper.height( height * scale )
				
				this.resizeWrapperWidth = width;
				this.resizeWrapperHeight = height;
				
			},
					
			resizeToGuide: function( ui ) {
					
				var leftLeast = this.getBoundingBox().leftLeast,
						topLeast  = this.getBoundingBox().topLeast,
						shapingRight = parseInt(leftLeast + ui.size.width),
						shapingBottom  = parseInt(topLeast + ui.size.height)
						
				if( this.$el.hasClass('rotated') ) return;
				
				if( this.alignIsDisabled == true ) return;
				
				if( app.methods.isDynamicAlign() ){
					
					var halfPanelWidth = $('#panel_0').width()/2,
							halfPanelHeight = $('#panel_0').height()/2;

					var boundBox = {
						left: parseFloat(this.$el.css('left')),
						top: parseFloat(this.$el.css('top')),
						right: shapingRight,
						bottom:	shapingBottom,
						width: shapingRight - parseFloat(this.$el.css('left')),
						height: shapingBottom - parseFloat(this.$el.css('top')),
						aspectRatio: ( this.resize.options.aspectRatio != false && typeof( this.resize.options.aspectRatio ) != 'undefined' ? this.resize.options.aspectRatio: false )
					}										
						
					app.methods.alignToGuide.hitWhenResize.call( this, ui, 'left', halfPanelWidth, boundBox, 'horizontal-center');
					app.methods.alignToGuide.hitWhenResize.call( this, ui, 'top', halfPanelHeight, boundBox, 'vertical-middle');
					
					app.methods.alignToGuide.hitWhenResize.call( this, ui, 'left', $('#panel_0').width(), boundBox, 'horizontal-right-edge');
//					app.methods.alignToGuide.hitWhenResize.call( this, ui, 'left', $('#panel_0').width() - (  boundBox.width - this.$el.width()) , boundBox, 'horizontal-right-edge');
					app.methods.alignToGuide.hitWhenResize.call( this, ui, 'top', $('#panel_0').height(), boundBox, 'vertical-bottom-edge');
//					app.methods.alignToGuide.hitWhenResize.call( this, ui, 'top', $('#panel_0').height() - (  boundBox.height - this.$el.height()), boundBox, 'vertical-bottom-edge');
					
					for( var side in app.methods.alignToGuide.arrays){
						for( var idx in app.methods.alignToGuide.arrays[side]){
							var obj = app.methods.alignToGuide.arrays[side][idx];
							app.methods.alignToGuide.hitWhenResize.call( this, ui, side, obj.linePos, boundBox, obj.linePos);
						}							
					}
					
				} else{

					if( !app.stubs.resizeGuide) return;
					
					var buffer = 10 * scale,
							panelView = app.stubs.views.panels['panel_0'],
							xs = panelView.bind.guideLines.get.xArr(),
							ys = panelView.bind.guideLines.get.yArr();
							
					for( var idx in xs) {
						
						var x = xs[idx] * scale,
								xInt = parseInt(xs[idx] * scale );
						
						if ( tools.between(shapingRight, parseInt(xInt - buffer), parseInt(xInt + buffer))) {
							
							var newWidth = x - leftLeast + ( 1 * scale);
							
							this.$resizeWrapper.width(newWidth);
							
							if( this.resize.options.aspectRatio != false && typeof( this.resize.options.aspectRatio ) != 'undefined'){
								var newHeight = newWidth / this.resize.options.aspectRatio;
								this.$resizeWrapper.height(newHeight);
								ui.size.height = newHeight;
							}
							
							ui.size.width = newWidth;

						}
	
					}
					
					for( var idx in ys) {
						
						var y = ys[idx] * scale,
								yInt = parseInt(ys[idx]* scale );
						
						if ( tools.between(shapingBottom, parseInt(yInt - buffer), parseInt(yInt + buffer))) {
							
							var newHeight = y - topLeast + ( 1 * scale);
							this.$resizeWrapper.height(newHeight);
							
							if( this.resize.options.aspectRatio != false && typeof( this.resize.options.aspectRatio ) != 'undefined'){
								var newWidth = newHeight * this.resize.options.aspectRatio;
								this.$resizeWrapper.width(newWidth);
								ui.size.width = newWidth;
							}
							
							ui.size.height = newHeight;
						}
	
					}
				}
				
			},
			
			getBoundingBox: function() {
							
				var panelLeft = this.$panel.offset().left,
						panelRight = panelLeft + this.$panel.width(),
						panelTop = this.$panel.offset().top,
						panelBottom = panelTop + $('#panel_0').height(),
						resizeWrapper = this.$resizeWrapper[0],
						boundingBox = resizeWrapper.getBoundingClientRect(),
						resizeWrapperLeft	=	 boundingBox.left - panelLeft,
						resizeWrapperTop = boundingBox.top - panelTop,
						resizeWrapperWidth = boundingBox.width,
						resizeWrapperHeight	=	boundingBox.height,
						resizeWrapperRight = resizeWrapperLeft + resizeWrapperWidth,
						resizeWrapperBottom	=	resizeWrapperTop + resizeWrapperHeight,
						corners = {
							ne: {
								x: resizeWrapperRight,
								y:resizeWrapperTop	
							},
							se: {
								x: resizeWrapperRight,
								y:resizeWrapperBottom	
							},
							sw: {
								x: resizeWrapperLeft,
								y: resizeWrapperBottom	
							},
							nw: {
								x: resizeWrapperLeft,
								y:resizeWrapperTop	
							}
						};
						
						var xs = [];
						var ys = [];
						
						for( var key in corners) {
							var corner = corners[key];
							xs.push(corner.x);
							ys.push(corner.y);
						}
						
						var leftLeast = Math.min.apply(null, xs),
								leftMost = Math.max.apply(null, xs),
								topLeast = Math.min.apply(null, ys),
								topMost = Math.max.apply(null, ys);
						
				return {
					leftLeast: leftLeast,
					leftMost: leftMost,
					topLeast: topLeast,
					topMost: topMost,
					width: leftMost - leftLeast,
					height: topMost - topLeast
				}
			}
		});
		
		var TextView = ElementView.extend({
			
			textedit2String: function() {},
			
			adaptUL: function() {},
			
			renderPngFromTextedit: function( fromwhere, callback, usequeue) {
				
				var that = this,
						doWhat = function( doIsNotBusyCallback ) {
							
							$('.clone4render').remove();
							
							if( that.collection == 'richtext'){
								
								that.resolution = 3;
								//that.resolution = 1;
								
							}else{
								
/*								var fontSize = parseInt(that.model.get('json').style.textedit['font-size']),
										resMap = {
											200: 2,
											1000: 3	
										};
															
								for( var key in resMap ){
									if( fontSize <= key ) {
										that.resolution = resMap[key];
										console.log('key: ' + key);
										break;	
									};
								}*/
								
								var fontSize = parseInt(that.model.get('json').style.textedit['font-size']);
								
//								
//								if ( fontSize <= 25 ){
//									that.resolution = 9;
//								} else if ( fontSize <= 50 ){
//									that.resolution = 7;
//								} else if ( fontSize <= 100 ){
//									that.resolution = 6;
//								} else if ( fontSize <= 200 ){
//									that.resolution = 5;
//								} else if ( fontSize <= 300 ){
//									that.resolution = 3;
//								} else if ( fontSize <= 450 ){
//									that.resolution = 2;
//								} else{  // anything above 450 font-size
//									that.resolution = 1;
//								};
//								
//								if( tools.detectIE() ){
//									
////									var realWidth = parseFloat(that.model.get('json').style.element.width);
////									var maxEnlargedWidth = 2700;
////									var enlargedRealWidth = realWidth * that.resolution;
////									
////									if ( enlargedRealWidth > maxEnlargedWidth ) that.resolution = maxEnlargedWidth / realWidth;
//									
//								} else{
//									
//									var realWidth = parseFloat(that.model.get('json').style.element.width);
//									var maxEnlargedWidth = 5000;
//									var enlargedRealWidth = realWidth * that.resolution;
//									var maxCroppedWidth = 0;
//									var sourceWidth = enlargedRealWidth + (app.stubs.shiftit * that.resolution) * app.stubs.expandit;
//									
//									that.resolution = maxEnlargedWidth / realWidth;									
//									
//									var maxResolution = 8;
//									that.resolution = ( that.resolution > maxResolution ? maxResolution : that.resolution);
//								}
								
								
								that.resolution = 1;
								
								if ( fontSize <= 10 ){
									that.resolution = 10;
								} else if ( fontSize <= 300 ){
									that.resolution = 2;
								}
								
								if( tools.detectIE() ){
									
									var realWidth = parseFloat(that.model.get('json').style.element.width);
									var maxEnlargedWidth = 2700;
									var enlargedRealWidth = realWidth * that.resolution;
									
									if ( enlargedRealWidth > maxEnlargedWidth ) that.resolution = maxEnlargedWidth / realWidth;
									
								}


//console.log('Header: ' + that.model.get('json').data.text);
//console.log('fontsize: ' + that.model.get('json').style.textedit['font-size']);
//console.log('that.resolution: ' + that.resolution );
								
								
							};
							
							// console.log(that.model.get('json').data.text + ': resolution ' + that.resolution);
							// console.log('that.resolution: ' + that.resolution);
							
							var $clone = that.$el.clone(),
									$cloneResizeWrapper = $clone.find('.resize-wrapper'),
									realWidth = parseFloat(that.model.get('json').style.element.width),
									enlargedRealWidth = realWidth * that.resolution,
									realHeight = parseFloat(that.model.get('json').style.element.height),
									enlargedRealHeight = realHeight * that.resolution,
									buffer = 0;
									
//							console.log('enlargedRealWidth: ' + enlargedRealWidth);	

							$clone.css('transform', '');
								
							$clone.removeClass('ontop');
							
							$clone.appendTo('body')
							.attr('id', 'clone_of_' +  that.model.cid )
							.addClass('clone4render');
							
							var cssObj = {
								'z-index': '-1', 
								//'z-index': '99999999', // unrem
								'left': '',
								'top': '0px',
								//'top': '200px', // unrem
								'visibility': 'visible',
							 'width': enlargedRealWidth + 'px',
							 'height': enlargedRealHeight + 'px'
							};
							
							var resizeWrapperCssObj = {
							 'width' : enlargedRealWidth + 'px',
							 'height': enlargedRealHeight + 'px'
							};
							
//							console.log(JSON.stringify(  cssObj   , null, 2 ));
//							console.log(JSON.stringify(   rcssObj  , null, 2 ));

							$clone.css( cssObj );
							$cloneResizeWrapper.css( resizeWrapperCssObj );
							
							$cloneResizeWrapper.css('transform', '');
							
							if( that.collection == 'headers' ) {
								$clone.css('width', enlargedRealWidth * 2 + 'px');
								$clone.css('width', enlargedRealHeight * 1.2 + 'px');
								$cloneResizeWrapper.css('padding-left', enlargedRealWidth / 2 +  'px');
								$cloneResizeWrapper.css('padding-right', enlargedRealWidth  / 2 +  'px');
								$cloneResizeWrapper.css('width', enlargedRealWidth * 2 + 'px');
								$cloneResizeWrapper.css('height', enlargedRealHeight  * 1.2 + 'px');
																						
							} else{

								var $cloneUL = $clone.find('ul');
								$cloneUL.css('padding-right', ( 25 * that.resolution)  + 'px');
								
								//console.log(enlargedRealWidth/enlargedRealHeight );
								
								var widthToHeightRatio = enlargedRealWidth/enlargedRealHeight;
								var heightToWidthRatio = enlargedRealHeight/enlargedRealWidth;

								var bottomPadding = ( widthToHeightRatio < .5 ? heightToWidthRatio  * 90: 40)
								
								// console.log('bottomPadding: ' + bottomPadding);
								
								
								
								$cloneResizeWrapper.css('height', enlargedRealHeight + ( bottomPadding * that.resolution )  + 'px');
																														
							}
							
							var textshadow = that.model.get('json').data.textshadow;
							
							if( typeof( textshadow) != 'undefined' ){
								var theStyle  = textshadow * that.resolution  + 'px ' 
															+ textshadow * that.resolution   + 'px ' 
															+ textshadow * that.resolution  * 2
															+ 'px rgba(0,0,0,0.4)';	
															
								$clone.find('.textedit').css( 'text-shadow', theStyle );								
							}

							var enlargeClonedText = function( styleKey ) {
								var curValue = parseFloat(that.model.get('json').style.textedit[styleKey]),
										newValue = that.resolution * curValue;
								// console.log(that.model.get('json').data.text + ': '+ styleKey + ' ' + newValue);
								$clone.find('.textedit').css(styleKey, newValue + 'px');
							};
							
							enlargeClonedText( 'font-size');
							enlargeClonedText( 'letter-spacing');
							enlargeClonedText( 'word-spacing');
							enlargeClonedText( '-webkit-text-stroke-width');

							//$cloneResizeWrapper.css('background', '#FDEDFD');  // unrem
							
							// work
							// console.log('fromwhere: ' + fromwhere);
							html2canvas($clone.find('.resize-wrapper')[0], { 
							
								onrendered: function(canvas) {
									
									// console.log('html2canvas rendered');

									if( that.collection == 'headers'){
										toast('Rendering: ' + that.model.get('json').data.text);
									}else{
										toast('Rendering paragraph.', 'wait', 500);
									};
									
									var htmlAsPng = canvas.toDataURL("image/png");
									
									if( that.collection == 'richtext' ) {
										
											that.$textEdit.html('<img src="' + htmlAsPng + '"   />');
											that.model.get('json').data.htmlAsPng = htmlAsPng;
											that.adaptHeightToTextedit('adaptHeightToTextedit from post renderPngFromTextedit');

									} else{
										
										var img4Crop = document.createElement('img'),
												src4Crop = document.createAttribute("src");
												
										src4Crop.value = htmlAsPng;
										img4Crop.setAttributeNode(src4Crop);
										
										$(img4Crop).appendTo('body');
										
										$(img4Crop).attr('id', 'here');

										$(img4Crop).load( function() {
											//console.log('img4Crop loaded');
												var obj = {
													sourceX: 0, 
													sourceY: 0,
													sourceWidth:$(img4Crop)[0].clientWidth,
													sourceHeight:$(img4Crop)[0].clientHeight,
													destX: 0,
													destY:0, 
													destWidth: enlargedRealWidth +  enlargedRealWidth, 
													destHeight: $(img4Crop)[0].clientHeight
												};			

											var dataCropped = tools.cropToRect( $(img4Crop)[0], obj);
											
											// console.log('dataCropped reached');
											
											that.model.get('json').data.resolution = that.resolution;
											that.model.get('json').data.dataCropped = {
												width: dataCropped.width,
												height: dataCropped.height
											};
											
											var base64cropped = app.settings.base64Prefix + dataCropped.base64;
											
											that.model.get('json').data.htmlAsPng = base64cropped;
											// work

//										 	that.$textEdit.html('<img src="' + 
//												base64cropped + 
//												'" style = "margin-left: -' + 
//												(( dataCropped.width/ 4) * scale) / that.resolution + 'px;'  + 
//												'width:' + dataCropped.width  * scale   / that.resolution + 'px;' + 
//												'height:' + dataCropped.height * scale  / that.resolution + 'px;"/>');

//											that.$textEdit.css('line-height', 1);	
											
											$(img4Crop).remove();											// change  rem
											
										});
										
									}
										
									if( typeof( callback ) != 'undefined') callback();
									// console.log('6675 type for doIsNotBusyCallback: ' + typeof( doIsNotBusyCallback ));
									if( typeof( doIsNotBusyCallback ) != 'undefined') doIsNotBusyCallback();	

									$clone.remove();  // unrem
									
								}
								
							});
						};
				
				if( typeof( usequeue ) != 'undefined' ){
					app.methods.loadToDoQueue( doWhat );
				}else{
					doWhat();
				};
				
			},
			
			bindEditHandle: function() {
				
				this.bindHandles.edit = function() {
					
					var that = this;
						
					this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
					
						function(event) {
							// work 
							// that.renderPngFromTextedit('resize stop for header');return;
							
							editbox.view = that;
							
							editbox.whenEditClicked(event);
							
							editbox.methods.fonts.label( that );
							
							editbox.methods.colors['one'].label( that );
							
							editbox.methods.text.label( that );
							
							editbox.methods.layers.setIdxForThisElement();
							
							editbox.methods.opacity.label( that );
							
							editbox.methods.moretext.label( that );
							
							editbox.methods.letterspace.label( that ); // TAKE OUT
							
							editbox.methods.textshadow.label( that );
							
							if( that.collection == 'headers') editbox.methods.stroke.label( that );
							
							return false;
							
						}
					);
									
				}

			},
			
			increaseWrapperSizeMultiple: 1,		
						
			setCustomTemplateObj: function() {
				
				var json = this.model.get('json'),
						texteditStyle = '';
						
				for( var key in json.style.textedit){
					var value = json.style.textedit[key];
					texteditStyle += key + ': ' + value + ';'
				}
				
				this.templateObj['texteditStyle'] = texteditStyle;
				
				this.templateObj['text'] = json.data.text;
				
			},
			
			setRootTextEdit_depreciated: function() {
				console.log('setting root text edit');
				this.texteditStyle = this.model.get('json').style.textedit;
				this.texteditData = this.model.get('json').data;
				this.$textEdit = this.$resizeWrapper.find('.textedit');
				
			},
			
			setFont: function() {	
				
				var fontname = this.model.get('json').data.fontname,
						family = app.methods.fonts.getFamilyOfThisFont(fontname);
						
				app.methods.fonts.loadGoogleFontCss( family);
				
				this.$textEdit.css('font-family', family);
				
			},

			edit: function() {
										
				var	that = this;
				this.$textEdit.dblclick(	function(event)	{
					that.whenTextIsDblclicked.call(that, event);
					return false;
				});		
				
			},
			
		});
		
		TextView = TextView.extend( shared.text );

		var TextHeaderView = TextView.extend({
			
			editBoxComponents: ['fonts', 'stroke', 'moretext', 'cta', 'colors', 'layers' ,'lock', 'align', 'opacity', 'textshadow', 'rotate', 'text'],
			
			setResizeOptions: function() {
				
				var that = this,
						startWidth;
				// take out
				//this.resize.options.maxHeight = app.stubs.curCanvasSize.height * scale * app.settings.resizeMaxRatio;
				//this.resize.options.maxWidth =  app.stubs.curCanvasSize.width * scale * app.settings.resizeMaxRatio;

				this.resize.options.aspectRatio = this.resizeWrapperWidth /  this.resizeWrapperHeight;					

				this.resize.options.start = function() {
					
					startWidth = $(this).width();
					
					for(var	idx	in app.settings.keysInLayout){
						that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg)');
						that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg) scaleX(' + that.model.get('json').data.mirror + ')' );
					}
					
/*					
					if( app.methods.isDynamicAlign() ) {
						that.boundingboxElement =  that.getBoundingBox();
						app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
					}
*/					
					app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for headers');
				};

				this.resize.options.resize = function( event, ui ) {
					
					var percentScaled =  $(this).width() / startWidth;
					
					that.rotateIt.centerRotateHandle();
					// that.resizeToGuide( ui );
					that.$textEdit.css('width', $(this).width() + 'px');
					that.$textEdit.css('height', $(this).height() + 'px');
					that.$textEdit.css('font-size', percentScaled *  scale *  parseFloat(that.model.get('json').style.textedit['font-size'])  + 'px')
					that.$textEdit.css('letter-spacing', percentScaled *  scale *  parseFloat(that.model.get('json').style.textedit['letter-spacing'])  + 'px')
					
					
//					that.$textEdit.css('padding-left', percentScaled *  parseFloat(that.model.get('json').style.textedit['padding-left'])  + 'px')
//					that.$textEdit.css('padding-right', percentScaled * parseFloat(that.model.get('json').style.textedit['padding-right'])  + 'px')
					
					// that.adaptHeightToTextedit('HEADER');
					
					//that.textFitWord();
					
				};

				this.resize.options.stop = function(event, ui) {
					
					for(var	idx	in app.settings.keysInLayout){
						that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg)');
						that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg) scaleX(' + that.model.get('json').data.mirror + ')' );
					}
					
					
					//that.resizeToGuide( ui );
					
					if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();
					

					that.model.get('json').style.textedit['font-size'] = multiple * parseFloat( that.$textEdit.css('font-size') ) + 'px';
					that.model.get('json').style.textedit['letter-spacing'] = multiple * parseFloat( that.$textEdit.css('letter-spacing') ) + 'px';
					that.model.get('json').style.textedit['padding-left'] =  parseFloat( that.$textEdit.css('padding-left') ) + 'px';
					that.model.get('json').style.textedit['padding-right'] =  parseFloat( that.$textEdit.css('padding-right') ) + 'px';
					
					var newWidth = ui.size.width,
							newHeight = ui.size.height,
							newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
							newTop = parseFloat(that.$el.css('top')) + ui.position.top;

					that.resizeWrapperWidth = newWidth * multiple;
					that.resizeWrapperHeight = newHeight * multiple;

					that.model.get('json').style.element.left = newLeft * multiple + 'px';
					that.model.get('json').style.element.top = newTop * multiple + 'px';
					that.model.get('json').style.element.width = newWidth * multiple + 'px';
					that.model.get('json').style.element.height = newHeight * multiple + 'px';
					
					that.$el.css({
						width: newWidth + 'px',
						height: newHeight + 'px',
						left: newLeft + 'px',
						top: newTop + 'px'
					});
					
					that.$resizeWrapper.css({
						left: '0px',
						top: '0px'
					});
					
					
					//that.renderPngFromTextedit('resize stop for header');  // unrem
					
					that.model.get('json').data.needFreshPNG = true;
					
					// that.redoAspectRatioAndSize('resize stop');
					
					saveHistory('header resize');
				
				};

			},	
								
			adaptHeightToTextedit_depreciated: function( fromwhere ) {
				
				console.log('adapt for header: ' + fromwhere);
			
				var textEditHeight = this.$textEdit.height(),
						multipliedHeight = textEditHeight * multiple;
						
				this.$el.height(textEditHeight);
				this.$el.width($this.$textEdit.width());
				this.$resizeWrapper.height(textEditHeight);
				this.$resizeWrapper.width(this.$textEdit.width());
				
				this.model.get('json').style.element.height = multipliedHeight + 'px';
				this.resizeWrapperHeight = multipliedHeight;
				
			},
			
			leaveEditText: function() {

			 	var that = this,
			 			content	=	$('#theTextarea').val().trim();	
													 			
			 	if( content == ''){
			 		toast('Header can not be empty. But you can remove this element with the trash icon', 'keep', 8000, 'error', 'Something went wrong.');
			 		this.$textEdit.html(this.model.get('json').data.text).removeClass('active');
			 	} else{
			 		this.model.get('json').data.text = content;
			 		this.model.get('json').data.needFreshPNG = true;
					this.$textEdit.html(content).removeClass('active');
			 		saveHistory('leaveEditText TextHeader text');	
			 	};

				$('#theTextarea').remove();
				this.$el.removeClass('editing');
				
				this.redoAspectRatioAndSize('leave text edit');
				
				this.$textEdit.dblclick(function(event)	{
					that.whenTextIsDblclicked(event);
					return false;
				});	
				this.rotateIt.custom.elements.changeDirectionOfResizeHandlesFromRotation.call( this.rotateIt, this.model.get('json').data.rotation );
				this.rotateIt.centerRotateHandle();

					
				app.stubs.viewBeingEdited = undefined;
				
				// this.redoAspectRatioAndSize('leave text edit 2');	

			},	

			templates:{
				
				headers: '\
							<div id="<%= id %>" class="elements noselect" collection="<%= collection %>" style="<%= elementStyle %>">\
								<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
									<div  class="textedit" style="<%= texteditStyle %>"><%= text %></div>\
									<div  class="custom-handle rotate-handle"></div>\
									<div  class="custom-handle zoom-handle"></div>\
									<div  class="custom-handle delete-handle"></div>\
									<div  class="custom-handle edit-handle"></div>\
									<div  class="custom-handle clone-handle"></div>\
								</div>\
							</div>\
						'
			},	
							
			custom: function() {
				
				var that = this;
				
				this.bindEditHandle();
				this.edit();

				this.adaptStyle('font-size', 'px');
				this.adaptStyle('letter-spacing', 'px');

				this.drag();
				
				this.setResizeOptions();
				this.resize.init.call( this );

				this.rotateIt = new RotateIt();
				this.rotateIt.init( this.$resizeWrapper );
				
				this.click();
				
				if( typeof( this.model.get('json').data.needFreshPNG ) == 'undefined') {
					this.model.get('json').data.needFreshPNG = true;
				}
				
				if( this.model.get('json').data.needFreshPNG == 'false' ) {
					this.model.get('json').data.needFreshPNG = false;
				}
				
				if( typeof( app.stubs.version ) == 'undefined' ){
					this.model.get('json').data.needFreshPNG = true;
					app.stubs.recentlySaved = false;
					window.onbeforeunload = app.methods.confirmOnPageExit;
				}
				
				this.redoAspectRatioAndSize('custom'); 
				
				this.scaleCustom();
				
			},
			
			scaleCustom: function() {

				var textshadow = this.model.get('json').data.textshadow;
				
				var theStyle = textshadow * scale + 'px ' + textshadow * scale + 'px ' + textshadow * scale * 2 + 'px rgba(0,0,0,0.4)';
				
				this.$textEdit.css( 'text-shadow', theStyle );
				
				
				if( tools.detectIE() ) return;
				
				var strokewidth = this.model.get('json').data.strokewidth;
				var $rowBackgroundSample = $('#background-sample').parent().parent();
				
				if( typeof( strokewidth ) != 'undefined' && parseFloat(strokewidth) > 0 ){
					this.$textEdit.css( '-webkit-text-stroke-width', strokewidth * scale * .33 + 'px' );
					this.$textEdit.css( '-webkit-text-fill-color', this.model.get('json').data.strokefill);
					$rowBackgroundSample.show();					
				} else {
					$rowBackgroundSample.hide();
					this.$textEdit.css( '-webkit-text-stroke-width', '' );	
					this.$textEdit.css( '-webkit-text-fill-color', '' );	
				};
				
			},
			
			redoAspectRatioAndSize: function( fromwhere ) {

				// console.log('redoAspectRatioAndSize: ' + fromwhere);  // change
				
				var dim = this.getWidthOfTextAreaWithContent();
				
//		    console.log(this.$textEdit.width());
//	    	console.log(JSON.stringify(  dim   , null, 2 ));
//
//				dim.width = this.$textEdit.width();
//				dim.height = this.$textEdit.height();

				this.resize.options.aspectRatio = dim.width / dim.height;

				$('#' + this.model.cid ).find('.resize-wrapper').resizable('destroy').resizable( this.resize.options );	
				
				var angle = this.model.get('json').data.rotation;
				this.rotateIt.custom.elements.changeDirectionOfResizeHandlesFromRotation.call( this.rotateIt, angle );
				
				this.$resizeWrapper.width(dim.width);
				this.$resizeWrapper.height(dim.height);
				this.$textEdit.width(dim.width);
				this.$textEdit.height(dim.height);
				this.$el.width(dim.width);
				this.$el.height(dim.height);
				
				this.model.get('json').style.element.width = dim.width * multiple + 'px';
				this.model.get('json').style.element.height = dim.height * multiple + 'px';
				
				this.rotateIt.centerRotateHandle();
				
			},

			redraw: function() {
				
				var that = this;
				
				this.$el.addClass('transition1s');
				this.$resizeWrapper.addClass('transition1s');
				
				this.model.set('json', app.methods.revert.getRevertElement( this.cid ));

				this.rotateIt.custom.elements.applyRotation.call( this.rotateIt );

				this.setFont();
				this.scale();
				this.reColor();
				
				this.$textEdit.text( this.model.get('json').data.text );
				
				
				console.log('redrawing');
				
				setTimeout(function(){
					that.$el.removeClass('transition1s');
					that.$resizeWrapper.removeClass('transition1s');					
					that.storeOffset();
					that.rotateIt.centerRotateHandle();
					that.redoAspectRatioAndSize('redraw');
				}, 500);
								
				return;

			},
			
			reColor: function() {
				this.$el.find('.textedit').css({
					'color': this.model.get('json').style.textedit.color	
				}).text( this.model.get('json').data.text );
			},
			
			increaseWrapperSizeMultiple: 1.2,

			setSizeForResizeWrapper_depreciated: function() {
								
				var that = this;
				
				this.adaptStyle('font-size', 'px');
				this.adaptStyle('letter-spacing', 'px');

				var dim = this.getWidthOfTextAreaWithContent(); 
				
				this.$el.css({
					width: dim.width+ 'px',
					height: dim.height  + 'px'
				});
				
				this.$resizeWrapper.css({
					width: dim.width  + 'px',
					height: dim.height  + 'px'
				});

				this.resizeWrapperWidth = dim.width;
				this.resizeWrapperHeight = dim.height;
				
			},
			
			whenTextIsDblclicked: function(event) {
				
				event.stopPropagation();
				app.stubs.viewBeingEdited = this;
									
				var that = this,
						contentText	=	this.$textEdit.text(),
						json = this.model.get('json'),
						collection = json.collection,
						widthIs = this.$resizeWrapper.width() * this.increaseWrapperSizeMultiple,
						heightIs = this.$resizeWrapper.height();
						
				json.data.needFreshPNG = true;
						
				this.$el.addClass('editing');		
				
				this.$textEdit.html('')
				.addClass('active')
				.append('<textarea id="theTextarea"></textarea>')
				.unbind('dblclick')
				.unbind('click')
				.css({
					height: heightIs + 'px'
				});
				
				$('#theTextarea').text(contentText);

				this.$el.removeClass('see-handles');
				
				// this.$resizeWrapper.resizable('disable').removeClass('ui-state-disabled');;
				
				this.adaptStyle('font-size', 'px');
				this.adaptStyle('letter-spacing', 'px');
				
				var $theTextarea = $('#theTextarea');
				
				$theTextarea.select().css({
					 width: widthIs + 'px',
					 height: heightIs + 'px',
					 'text-transform': 'inherit'
				}).on('click', function(event) {
					event.stopPropagation();
					return false;
				}).on('keydown',
					function(event) {
						
						event.stopPropagation();
						
						var backed = true,
								keyIs = event.which;
								
						if(keyIs != 8){ // backspace
							that.widenArea();
						}else if(keyIs != 13){
							that.widenArea(backed);
						}
														
						if(keyIs == 13){ // Carriage return
							if(typeof(app.stubs.viewBeingEdited) != 'undefined'){
								var view = app.stubs.viewBeingEdited;
								view.leaveEditText.call(view);
							}
							// toast('Carriage returns are disabled in headers.');
							event.preventDefault();
						}	
						
						// work
						
						app.stubs.maxchar4header = 90;;
						
						if( $theTextarea.val().length > app.stubs.maxchar4header	
							&& keyIs != 8  // backspace
							&& keyIs != 37 // left
							&& keyIs != 39 // right
							&& keyIs != 35 // end
						){
							
							event.preventDefault();
							toast('Please use the paragraph element instead', 'keep', 5000, 'error', 'Maximum characters reached for header element.');
						
						}
						
						if( $theTextarea.width() >= tools.getScreenDim().width){
							
							event.preventDefault();
							toast('Maximum length reached. Please zoom out to edit further.', 'keep', 5000, 'info', 'In order to continue.');

						}

					}
				);
				
			},

			reRender_depreciated: function(newWidth, newHeight){
				
				var that = this;
				this.textFitWord( function() {
					that.model.get('json').style.textedit['font-size'] = parseFloat(that.$textEdit.css('font-size'))+ 'px';
				});
				
			},
						
			textFitWord_depreciated: function( callback ) {
				
				var that = this,
					widthIs = this.$resizeWrapper.width(),
					heightIs = this.$resizeWrapper.height();

				this.$textEdit.css({
					width: widthIs +'px',
					height:	heightIs +'px'
				});
				
				setTimeout(function(){
				
					textFit(that.$textEdit[0], {
						maxFontSize: 99999999,
						alignHoriz: false, 
						alignVert: false,
						multiLine: false, 
						detectMultiLine: true
					});
					
					var $textFitted = that.$textEdit.find('.textFitted');
					
					that.$textEdit.css('font-size',
						parseFloat($textFitted.css('font-size')) + 'px'
					);
					
					if( typeof( callback ) != 'undefined') callback();
					
				
				}, 0);
			
			}	
		});
		
		var ParagraphView = TextView.extend({
			
			redraw: function() {
				
				var that = this;
				
				this.$el.addClass('transition1s');
				this.$resizeWrapper.addClass('transition1s');
				
				this.model.set('json', app.methods.revert.getRevertElement( this.cid ));
				
				this.rotateIt.custom.elements.applyRotation.call( this.rotateIt );
				
				this.setRootTextEdit();
				
				this.setSizeForResizeWrapper();
				
				this.scale();
				
				this.setFont();
				
				var domLines = this.lineTheThing.getDomLines.call( this );

				this.$textEdit.css({
					'color': this.texteditStyle.color,
					'text-align': this.texteditStyle['text-align'],
					'line-height': this.texteditStyle['line-height'] 
				}).html(  domLines );
				
				
				this.$el.removeClass('transition1s');
				this.$resizeWrapper.removeClass('transition1s');					
				this.storeOffset();
				
			},
			
			editBoxComponents: ['fonts', 'textAlign', 'cta', 'colors', 'layers' ,'lock', 'align', 'text', 'opacity'],
					
			preRender: function() {		
				this.lineTheThing.undo.call( this );	
			},
					
			reRender: function(newWidth, newHeight){
				this.lineTheThing.redo.call( this );
				this.adaptHeightToTextedit('A');
			},
			
			setResizeOptions: function() {
				var that = this;
				
				this.resize.options.aspectRatio = false;
				
				this.resize.options.start = function() {
					
					if( app.methods.isDynamicAlign() ) {
						that.boundingboxElement =  that.getBoundingBox();
						app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
					}
					
					app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for paragraphs');
					
					that.lineTheThing.undo.call( that );	
				};
				
				this.resize.options.resize = function( event, ui ) {
					that.rotateIt.centerRotateHandle();
					that.resizeToGuide( ui );
					that.adaptHeightToTextedit('B');
				};
				
				this.resize.options.stop = function(event, ui) {
					that.rotateIt.centerRotateHandle(); 
					that.resizeToGuide( ui );
					
					if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();
					
					// that.lineTheThing.redo.call( that );													
					
					var newWidth = ui.size.width,
							newHeight = ui.size.height,
							newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
							newTop = parseFloat(that.$el.css('top')) + ui.position.top;

					that.resizeWrapperWidth = newWidth * multiple;
					that.resizeWrapperHeight = newHeight * multiple;

					that.model.get('json').style.element.left = newLeft * multiple + 'px';
					that.model.get('json').style.element.top = newTop * multiple + 'px';
					that.model.get('json').style.element.width = newWidth * multiple + 'px';
					that.model.get('json').style.element.height = newHeight * multiple + 'px';

					that.$el.css({
						width: newWidth + 'px',
						height: newHeight + 'px',
						left: newLeft + 'px',
						top: newTop + 'px'
					});
					
					that.$resizeWrapper.css({
						left: '0px',
						top: '0px'
					});
					
					that.adaptHeightToTextedit();
					
					saveHistory('resize paragraph change');	

				};
				
				this.resize.init.call( this );						
			},
			
			custom: function() {

				var that = this;

				this.setRootTextEdit();
				
				this.bindEditHandle();
				
				this.edit();
								
				this.drag();

				this.setResizeOptions();
				
				this.rotateIt = new RotateIt();
				this.rotateIt.init( this.$resizeWrapper );
				
				this.click();
				
				this.textedit = this.$resizeWrapper.children('.textedit')[0];
				
				this.textedit.addEventListener('afterlining', function () {
					var lines = [];
					that.$textEdit.find('text-line').each( function() {
						lines.push($(this).text());
					});
					that.model.get('json').data.lines = lines;
				
				}, false);			
				
				this.setSizeForResizeWrapper();	

				this.adaptHeightToTextedit('D');
				
				this.scaleCustom();
					
//				$('body').append('\
//					<div  id="testdom" >Lpsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor \
//					</div>\
//				');
//
//				
				return;
				
				this.lineTheThing.undo.call( this );

			},
			
			lineTheThing:{
				
				undo: function() {
					
						var that = this;
						
						this.$textEdit.html(this.model.get('json').data.text);

						this.lining = lining(this.textedit);

						//this.lining = lining(document.getElementById('testdom2'));
						
						this.lining.unlining();
						
						
/*					
					
					
					if( typeof( this.lining ) == 'undefined' ){
						
						this.$textEdit.html(this.model.get('json').data.text);
						this.lining = lining(this.textedit);
						
						console.log('undo undefined lining collection:' + this.collection);
						
						this.lining.unlining();
					} else {
						
						console.log('undo defined lining collection:' + this.collection);
						
						this.lining.unlining();
					}
*/
				},
				
				redo: function() {
					
					if( typeof( this.lining ) == 'undefined' ){
						console.log('redo undefined lining collection:' + this.collection);
						this.lining = lining(this.textedit);
						
					} else {
						console.log('redo defined lining collection:' + this.collection);
						this.lining.relining();	
					}	
				},
				
				getDomLines: function() {
					var domLines = "";
					
					for( var idx in this.model.get('json').data.lines){
						var line = 	this.model.get('json').data.lines[idx],
								domLine = "<div  class='pre-lining-wrapper'><p  class='pre-lining'>" + line + "</p></div>";
						domLines += domLine;
					}
					
					return domLines;
				},
				
				eraseThis: function() {
				
/*
				lining.util.on(textedit, 'beforeunlining', function () {
				    console.log('beforeunlining');
				    console.log($(textedit).html());
				}, false);
				
				lining.util.on(textedit, 'afterunlining', function () {
				    console.log('afterlining');
				    console.log($(textedit).html());
				}, false);
				
				lining.util.on(textedit, 'afterlining', function () {
				    console.log('afterlining');
				    console.log($(textedit).text());
				}, false);
*/												
				}
				
			},
			
			whenTextIsDblclicked: function(event) {

				event.stopPropagation();
				app.stubs.viewBeingEdited = this;
									
				var contentText	=	this.$textEdit.text(),
						json = this.model.get('json'),
						collection = json.collection,
						widthIs = this.$resizeWrapper.width() * this.increaseWrapperSizeMultiple,
						heightIs = this.$resizeWrapper.height(),
						buffer = 40; 
						
				this.$el.addClass('editing');
				
				this.lineTheThing.undo.call( this );
				this.$textEdit.html('')
				.addClass('active')
				.append('<textarea id="theTextarea"></textarea>')
				.unbind('dblclick')
				.unbind('click');
				
				$('#theTextarea').text(contentText);

				this.$el.removeClass('see-handles');
				
				this.adaptStyle('font-size', 'px');
				
				var $theTextarea = $('#theTextarea');
				
				$theTextarea.css({
					 width: widthIs + 'px',
					 height: heightIs + buffer + 'px'
				}).addClass('txtstuff').on('click', function(event) {
					event.stopPropagation();
				});

				var $hiddenDiv = $(document.createElement('div')),
				    content = null;
				
				$hiddenDiv.addClass('hiddendiv');
				
				this.$textEdit.append($hiddenDiv);

				$theTextarea.on('keydown', function (event) {
					
					var keyIs = event.which;
					
					if(keyIs == 13){
						toast('Carriage returns are disabled in paragraphs.');
						event.preventDefault();
					}							
					
			    content = $(this).val();
			
			    content = content.replace(/\n/g, '<br>');
			    $hiddenDiv.html(content + '<br class="lbr">');
			
			    $(this).height(  $hiddenDiv.height() + buffer );
			    
				});

			},
	
			setSizeForResizeWrapper: function() {
								
				var that = this,
						width = parseFloat(this.model.get('json').style.element.width),
						height = parseFloat(this.model.get('json').style.element.height);

				this.$el.width( width * app.stubs.zoom.scale);
				this.$el.height( height * app.stubs.zoom.scale);				
				this.$resizeWrapper.width( width * app.stubs.zoom.scale);
				this.$resizeWrapper.height( height * app.stubs.zoom.scale);
				
				this.resizeWrapperWidth = width;
				this.resizeWrapperHeight = height;

				this.adaptStyle('font-size', 'px');
				
			},
			
			setCustomTemplateObj: function() {

				app.methods.doTempateObjFor.call( this, 'texteditStyle', 'textedit');
				
				this.templateObj['text'] = this.lineTheThing.getDomLines.call( this );
				
			}
		});
		
		var LinesView = ElementView.extend({

				editBoxComponents: ['colors', 'layers' ,'lock'],
				
				bindEditHandle: function() {
					
					this.bindHandles.edit = function() {
						
						var that = this;
							
						this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
						
							function(event) {
								
								editbox.view = that;
								
								editbox.whenEditClicked(event);
								
								editbox.methods.colors['one'].label( that );
								
								editbox.methods.layers.setIdxForThisElement();
	
								return false;
								
							}
						);
										
					}
	
				},
				
				config: function() {

					var that = this;
					
					this.$clipartDiv = this.$resizeWrapper.find('.clipartDiv');
					
					this.$clipartDiv.parent().attr('id', 'clipart-div-wrapper');
					
					this.bindEditHandle();
					
					this.setSizeForResizeWrapper();
					
					this.resize.options.start = function() {
						if( app.methods.isDynamicAlign() ) {
							that.boundingboxElement =  that.getBoundingBox();
							app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
						}
						app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for image');
					};
						
					this.resize.options.resize = function(event, ui) {
						that.rotateIt.centerRotateHandle();
						that.resizeToGuide( ui );
									
					};
					
					this.resize.options.stop = function(event, ui) {
						that.rotateIt.centerRotateHandle();
						
						that.resizeToGuide( ui );
						
						if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();
						
						var newWidth = ui.size.width,
								newHeight = ui.size.height,
								newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
								newTop = parseFloat(that.$el.css('top')) + ui.position.top;

						that.resizeWrapperWidth = newWidth  * multiple;
						that.resizeWrapperHeight = newHeight * multiple;

						that.model.get('json').style.element.width = newWidth * multiple + 'px';
						that.model.get('json').style.element.height = newHeight * multiple + 'px';
						that.model.get('json').style.element.left = newLeft * multiple + 'px';
						that.model.get('json').style.element.top = newTop * multiple + 'px';
						
						that.$el.css({
							width: newWidth + 'px',
							height: newHeight + 'px',
							left: newLeft + 'px',
							top: newTop + 'px'
						});
						
						that.$resizeWrapper.css({
							left: '0px',
							top: '0px'
						});
						
						saveHistory('angle Line resize');
						
					};
					
					this.drag();
					
					this.resize.init.call( this );
					
					this.rotateIt = new RotateIt();
					
					this.rotateIt.init( this.$resizeWrapper );
					
					this.click();	
				},		

				setSizeForResizeWrapper: function() {
									
					var that = this,
							width = parseFloat(this.model.get('json').style.element.width),
							height = parseFloat(this.model.get('json').style.element.height);
					
					this.$resizeWrapper.width( width * app.stubs.zoom.scale)
					this.$resizeWrapper.height( height * app.stubs.zoom.scale )
					
					this.resizeWrapperWidth = width;
					this.resizeWrapperHeight = height;
					
				},

				setCustomTemplateObj: function() {
					
					var json = this.model.get('json');
							
					this.templateObj['html'] = json.data.html;		
					
					
				},
				
				templates:{
		
					angleLines: '\
								<div id="<%= id %>" class="elements noselect" collection="<%= collection %>" style="<%= elementStyle %>">\
									<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
										<%= html %>\
										<div  class="custom-handle rotate-handle"></div>\
										<div  class="custom-handle zoom-handle"></div>\
										<div  class="custom-handle delete-handle"></div>\
										<div  class="custom-handle edit-handle"></div>\
										<div  class="custom-handle clone-handle"></div>\
									</div>\
								</div>\
							'
				},
				
				scaleCustom: function() {
					this.scaleLine();
				},
			
				scaleLine: function() {
					
					this.$clipartDiv.css('border-width', 2 * scale + 'px');
					var that = this;
					this.$el.find('style').remove();						
					this.createPseudoForStyleFor('before', this.$clipartDiv);
					this.createPseudoForStyleFor('after', this.$clipartDiv);
					
					this.$clipartDiv.addClass('line_' + this.model.cid);

				},
				
				redraw: function() {
					
					var that = this;
					
					this.$el.addClass('transition1s');
					this.$resizeWrapper.addClass('transition1s');
					
					var historicalJson = app.methods.revert.getRevertElement( this.cid );
					
					this.model.get('json').style = historicalJson.style;
					this.model.get('json').data.rotation = historicalJson.data.rotation;
					
					this.rotateIt.custom.elements.applyRotation.call( this.rotateIt );
					this.setSizeForResizeWrapper();
					this.scale();
					
					setTimeout(function(){
						that.$el.removeClass('transition1s');
						that.$resizeWrapper.removeClass('transition1s');					
						that.storeOffset();
						that.rotateIt.centerRotateHandle();
					}, 500);
									
					return;
	
				},
				
		});
		
		var ImageView = ElementView.extend({
					
			redraw: function() {
				
				var that = this;
				
				this.$el.addClass('transition1s');
				this.$resizeWrapper.addClass('transition1s');
				
				this.model.set('json', app.methods.revert.getRevertElement( this.cid ));
				
				if(  typeof( this.model.get('json')  ) == 'undefined' )  return;
				
				if( typeof( this.model.get('json').data.base64) != 'undefined'){
					this.$img.attr('src', app.settings.base64Prefix + this.model.get('json').data.base64);
				}else{
					this.$img.attr('src',  this.model.get('json').data.imgSrc);
				};
				
				
				this.$el.css({
					width: this.model.get('json').data.width * scale + 'px',
					height: this.model.get('json').data.height * scale  + 'px'	
				});
				
				this.$resizeWrapper.css({
					width: this.model.get('json').data.width * scale  + 'px',
					height: this.model.get('json').data.height * scale  + 'px'	
				});	
				
				if( typeof( this.model.get('json').data.aspectratio) == 'undefined' ){
					this.model.get('json').data.aspectratio = false;
				}
				
				console.log(this.model.get('json').data.aspectratio);
				console.log(typeof(this.model.get('json').data.aspectratio));
				
				if( JSON.parse(this.model.get('json').data.aspectratio)){  // working redraw aspect
					this.resize.options.aspectRatio = parseFloat(this.model.get('json').style.element.width) / parseFloat(this.model.get('json').style.element.height);
				} else{
					this.resize.options.aspectRatio = false;
				};
				
				if( typeof( this.model.get('json').style.shape) != 'undefined' ){
					
					this.$shape.css('opacity', this.model.get('json').style.shape.opacity);
					this.$shape.css('border-style', this.model.get('json').style.shape['border-style']);
					this.$shape.css('border-radius', this.model.get('json').style.shape['border-radius']);
					this.$shape.css('border-color', this.model.get('json').style.shape['border-color']);
					this.$shape.css('background-color', this.model.get('json').style.shape['background-color']);

					for(var	idx	in app.settings.keysInLayout){
						var preFix = app.settings.keysInLayout[idx];
						var shadowValue = ( typeof( this.model.get('json').style.shape[preFix + 'box-shadow']) != 'undefined' ? this.model.get('json').style.shape[preFix + 'box-shadow']: '0px 0px 0px rgba(0,0,0,0.4)');
						this.$shape.css(preFix + 'box-shadow', shadowValue);
					}
					
					this.setDblClick();
					
				}				
				
				if( typeof( this.model.get('json').style.image) != 'undefined' ){
					
					this.$img.css('opacity', this.model.get('json').style.image.opacity);

					var grayscale = ( typeof( this.model.get('json').data.grayscale) != 'undefined' ? this.model.get('json').data.grayscale: 0);
					var blur = ( typeof( this.model.get('json').data.blur) != 'undefined' ? this.model.get('json').data.blur : 0);
					
					var filter = 'blur(' + blur + 'px) grayscale(' + grayscale + '%)';
					
					for(var	idx	in app.settings.keysInLayout){
						this.$img.css(app.settings.keysInLayout[idx]  + 'filter', filter);
					}
					
					var borderWidth = parseFloat(this.model.get('json').style.image['border-width']),
							scaledValue = borderWidth * scale;
					if( scaledValue < 1 && scaledValue != 0) scaledValue = 1;
					this.$img.css('border-width', scaledValue + 'px');
					this.$img.css('border-radius', ( typeof( this.model.get('json').style.image['border-radius']) != 'undefined' ? this.model.get('json').style.image['border-radius']: '0%' ));
					this.$img.css('border-color', this.model.get('json').style.image['border-color']);
					for(var	idx	in app.settings.keysInLayout){
						var preFix = app.settings.keysInLayout[idx];
						var shadowValue = ( typeof( this.model.get('json').style.image[preFix + 'box-shadow']) != 'undefined' ? this.model.get('json').style.image[preFix + 'box-shadow']: '0px 0px 0px rgba(0,0,0,0.4)');
						this.$img.css(preFix + 'box-shadow', shadowValue);
					}
				}				
				
				if( typeof( this.model.get('json').style.svgshape) != 'undefined' ){  // working redraw
					
					var shapeStyle = this.model.get('json').style.svgshape;
					
					var obj = {
						fill: typeof( shapeStyle.fill) != 'undefined' ? shapeStyle.fill : '',
						stroke: typeof( shapeStyle.stroke) != 'undefined' ? shapeStyle.stroke : '',
						'stroke-width': typeof( shapeStyle['stroke-width']) != 'undefined' ?  shapeStyle['stroke-width'] : '',
						width: typeof( shapeStyle.width) != 'undefined' ? shapeStyle.width : '',
						height: typeof( shapeStyle.height) != 'undefined' ? shapeStyle.height : ''
					};
					
					this.$svgshape.css(obj);
				}	
										
				this.$resizeWrapper.resizable('destroy').resizable( this.resize.options );

				this.rotateIt.custom.elements.applyRotation.call( this.rotateIt );
				this.setSizeForResizeWrapper();
				this.scale();
				
				setTimeout(function(){
					that.$el.removeClass('transition1s');
					that.$resizeWrapper.removeClass('transition1s');					
					that.storeOffset();
					that.rotateIt.centerRotateHandle();
				}, 500);
								
				return;

			},
			
			custom: function() {

				var that = this,
						startWidth;
				
				this.bindEditHandle();
				
				this.setSizeForResizeWrapper();

				this.resize.options.aspectRatio = this.model.get('json').data.aspectratio = parseFloat(this.model.get('json').style.element.width) / parseFloat(this.model.get('json').style.element.height);
				
				this.resize.options.start = function() {
					
					for(var	idx	in app.settings.keysInLayout){
						that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg)');
						that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg) scaleX(' + that.model.get('json').data.mirror + ')' );
					}

					if( app.methods.isDynamicAlign() ) {
						that.boundingboxElement =  that.getBoundingBox();
						app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
					}
					startWidth = $(this).width();
					app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for image');
					
				};
						
				this.resize.options.resize = function( event, ui ) {
					that.rotateIt.centerRotateHandle();
					that.resizeToGuide( ui );
					
					var percentScaled =  $(this).width() / startWidth;

					that.resizeToGuide( ui );
					
					that.$el.find('img').css({
						'border-width': parseFloat(that.model.get('json').style.image['border-width']) * percentScaled * scale + 'px'
					});
					
					if( typeof( that.model.get('json').style.image['border-radius'] ) != 'undefined'){	
			
						var borderRadius = parseFloat(that.model.get('json').style.image['border-radius']),
								resizedRadius = borderRadius * percentScaled;
								
						//console.log(resizedRadius);
						
						that.$el.find('img').css({
							'border-radius': resizedRadius * scale + 'px'
						});
					}
						
				};
				
				this.resize.options.stop = function(event, ui) {
					
					var percentScaled =  $(this).width() / startWidth;
					
					for(var	idx	in app.settings.keysInLayout){
						that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg)');
						that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg) scaleX(' + that.model.get('json').data.mirror + ')' );
					}
					
					that.rotateIt.centerRotateHandle();
					
					if( typeof( that.model.get('json').style.image['border-radius'] ) != 'undefined'){

						var percentScaled =  $(this).width() / startWidth,
								borderRadius = parseFloat(that.model.get('json').style.image['border-radius']),
								resizedRadius = borderRadius * percentScaled;
								
						//console.log(resizedRadius);
						
						that.$el.find('img').css({
							'border-radius': resizedRadius * scale + 'px'
						});	
												
					};

					that.model.get('json').style.image['border-radius'] = resizedRadius  + 'px';
					
					that.resizeToGuide( ui );
					
					if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();
					
					var newWidth = ui.size.width,
							newHeight = ui.size.height,
							newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
							newTop = parseFloat(that.$el.css('top')) + ui.position.top;

					that.resizeWrapperWidth = newWidth  * multiple;
					that.resizeWrapperHeight = newHeight * multiple;

					that.model.get('json').style.element.width = newWidth * multiple + 'px';
					that.model.get('json').style.element.height = newHeight * multiple + 'px';
					that.model.get('json').style.element.left = newLeft * multiple + 'px';
					that.model.get('json').style.element.top = newTop * multiple + 'px';
					
					that.model.get('json').style.image['border-width'] =  parseFloat(that.model.get('json').style.image['border-width']) * percentScaled + 'px'
					
					that.$el.css({
						width: newWidth + 'px',
						height: newHeight + 'px',
						left: newLeft + 'px',
						top: newTop + 'px'
					});
					
					that.$resizeWrapper.css({
						left: '0px',
						top: '0px'
					});
					
					if( tools.detectEdge() ) { // edge hack
						that.$el.css('visibility', 'hidden');
						
						setTimeout(function(){
					    
							that.$el.css('visibility', 'visible');
														
						}, 1);
	
					}
					
					saveHistory('image resize');
					
				};
				
				this.drag();
				
				this.resize.init.call( this );
				
				this.rotateIt = new RotateIt();
				this.rotateIt.init( this.$resizeWrapper );
				
				this.click();
				
				if( tools.inArray( this.collection, app.settings.areImages) || 
					  this.collection == 'googledrive'  || 
					  this.collection == 'borders'
				){
					if( typeof( this.model.get('json').data.base64 ) == 'undefined' && 
							typeof( this.model.get('json').data.svg ) == 'undefined'
					) this.getBase64();
				} else if( this.collection == 'icons' ) {
					this.getSVG();
				}
				
				this.$img.css('opacity', this.model.get('json').style.image.opacity);
				
				
				this.$el.dblclick(function(event)	{
					
					that.$el.css({
						top: '0px',
						left:	'0px'
					});
					
					that.model.get('json').style.element.top = '0px';
					that.model.get('json').style.element.left = '0px';

					if( parseInt( that.model.get('json').style.element.width ) > 
							parseInt( that.model.get('json').style.element.height ) ||
							that.model.get('json').data.aspectratio > app.stubs.canvasAspectRatio
					){
						
						var adaptedPercent = app.stubs.curCanvasSize.width/ parseFloat( that.model.get('json').style.element.width) ;
						that.$el.width(app.stubs.curCanvasSize.width * scale);
						that.$resizeWrapper.width(app.stubs.curCanvasSize.width * scale);
						that.model.get('json').style.element.width = app.stubs.curCanvasSize.width + 'px';
						
						var newHeight = adaptedPercent * parseFloat( that.model.get('json').style.element.height);
						
						that.$el.height(newHeight * scale);
						that.$resizeWrapper.height(newHeight * scale);
						that.model.get('json').style.element.height = newHeight + 'px';						
						that.model.get('json').data.height = newHeight;
												
					}else{
						
						var adaptedPercent = app.stubs.curCanvasSize.height / parseFloat( that.model.get('json').style.element.height) ;
						that.$el.height(app.stubs.curCanvasSize.height * scale);
						that.$resizeWrapper.height(app.stubs.curCanvasSize.height * scale);
						that.model.get('json').style.element.height = app.stubs.curCanvasSize.height + 'px';
						var newWidth = adaptedPercent * parseFloat( that.model.get('json').style.element.width);
						
						that.$el.width(newWidth * scale);
						that.$resizeWrapper.width(newWidth * scale);
						that.model.get('json').style.element.width = newWidth + 'px';						
						that.model.get('json').data.width = newWidth;
						
					};
					
					var borderRadius = parseFloat(that.model.get('json').style.image['border-radius']),
							resizedRadius = borderRadius * adaptedPercent;
					
					that.$el.find('img').css({
						'border-radius': resizedRadius * scale + 'px'
					});	
					
					that.model.get('json').style.image['border-radius'] = resizedRadius  + 'px';
					
					that.rotateIt.centerRotateHandle();
					
					saveHistory('stretch background');
					
				});
				
				
				
			},				
				
			scaleCustom: function( customScale ) {
				
				if( typeof(this.model.get('json').style.image ) != 'undefined' && 
						typeof(this.model.get('json').style.image['border-radius'] ) != 'undefined' 
				){
					var borderRadius = scale * parseFloat(this.model.get('json').style.image['border-radius']);
					this.$img.css('border-radius', borderRadius + 'px');
				};
				
				var grayscale = ( typeof( this.model.get('json').data.grayscale) != 'undefined' ? this.model.get('json').data.grayscale : 0);
				var blur = ( typeof( this.model.get('json').data.blur) != 'undefined' ? this.model.get('json').data.blur* scale : 0);
				
				var filter = 'blur(' + blur + 'px) grayscale(' + grayscale + '%)';
				
				for(var	idx	in app.settings.keysInLayout){
					this.$img.css(app.settings.keysInLayout[idx]  + 'filter', filter);
				}
								
				if(typeof(this.model.get('json').style.image ) == 'undefined' || this.model.get('json').style.image['border-width'] == '0px') return;
				
				var adjustedScale = ( typeof( customScale) != 'undefined' ? customScale: scale),
						borderWidth = parseFloat(this.model.get('json').style.image['border-width']) * adjustedScale;
				
				if( borderWidth < 1) borderWidth = 1;
				this.$img.css('border-width', borderWidth + 'px');
				
			},
			
			editBoxComponents: ['colors', 'rotate', 'imgTools', 'cta', 'image', 'layers' , 'lock', 'opacity', 'blur' , 'grayscale', 'customBorders' ],
			
			bindEditHandle: function() {
				
				this.bindHandles.edit = function() {
					
					var that = this;
						
					this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
					
						function(event) {
							
							editbox.view = that;
							
							editbox.whenEditClicked(event);
							
							editbox.methods.colors['one'].label( that );
							
							editbox.methods.layers.setIdxForThisElement();
							
							editbox.methods.customBorders.label( that );
							
							editbox.methods.opacity.label( that );
							editbox.methods.blur.label( that );
							editbox.methods.grayscale.label( that );

							return false;
							
						}
					);
									
				}

			},
	
			setCustomTemplateObj: function() {

				var json = this.model.get('json'),
						imgSrc = ( typeof( json.data.base64) != 'undefined' ? app.settings.base64Prefix + json.data.base64: json.data.imgSrc);
				
				this.templateObj['imgSrc'] = imgSrc;
				
			},
			
			getBase64: function() {
				
					var that = this,
							outputFormat = 'image/png',
							url = ( typeof( this.model.get('json').data.picserver) != 'undefined' ? this.model.get('json').data.picserver.webformatURL: this.model.get('json').data.imgSrc);
							
					tools.convertImgToBase64(url, outputFormat, function(base64Img, width,  height) { 
						
						var baseArray  = base64Img.split(',');
						that.model.get('json').data.base64 = baseArray[1];
						that.model.get('json').data.width = width;
						that.model.get('json').data.height = height;
						that.$img.attr('src', app.settings.base64Prefix + baseArray[1]);
						
						saveHistory('getBase64');
						
					});
				
					return;
					
					/*
						if( serverhost == 'localhost' ||
								typeof(this.model.get('json').data.base64) !=  'undefined'){
							return;
						} 
						
						
					
						var that = this,
								webformatURL = this.model.get('json').data.picserver.webformatURL,
								url ='index.php/image/getSrcFromThisImage'  + '?url=' + webformatURL + '&google_id=' +  app.stubs.google_id + '&v=' + Math.random(),
								callback = function(data) {
									
									that.$img.attr('src', app.settings.base64Prefix + data.base64Data);
									
									that.model.get('json').data.base64 = data.base64Data;
									that.model.get('json').data.width = data.width;
									that.model.get('json').data.height = data.height;
									
									console.log('getting base64 ');
									
								};
						
						$.ajax({
							url: url,
							type:	'get',
							dataType:'json',
							success: function(data){
								callback(data);
							},
							error:	function(data){
								callback(data);
							},
							async:true
						});
					*/
			},
			
			templates:{
				images: '\
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
				'	
			},
		});

		TextHeaderView = TextHeaderView.extend( shared.head );
		ParagraphView = ParagraphView.extend( shared.paragraph );
				
		var views = {
			
			elements: {
								
				Charts: ImageView.extend({

					editBoxComponents: ['lock', 'charts', 'layers'],
					
					bindEditHandle: function() {
						
						this.bindHandles.edit = function() {
							
							var that = this;
								
							this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
							
								function(event) {
									
									editbox.view = that;
									
									editbox.whenEditClicked(event);
									
									editbox.methods.layers.setIdxForThisElement();
									
									editbox.methods.charts.label( that );
		
									return false;
									
								}
							);
											
						}
		
					},
					
					redraw: function() {
						
						var that = this;
						
						this.$el.addClass('transition1s');
						this.$resizeWrapper.addClass('transition1s');
						
						var historicalJson = app.methods.revert.getRevertElement( this.cid );
						
						this.model.get('json').style = historicalJson.style;
						
						if( typeof( this.rotateIt ) != 'undefined' ) this.rotateIt.custom.elements.applyRotation.call( this.rotateIt );
						
						this.setSizeForResizeWrapper();
						this.scale();
						
						this.model.get('json').data = historicalJson.data;
						
						that.renderChart();
						
						setTimeout(function(){
							
							that.$el.removeClass('transition1s');
							that.$resizeWrapper.removeClass('transition1s');					
							that.storeOffset();
							
						}, 500);
										
						return;
		
					},
								
					custom: function() {
		
						var that = this;
						
						this.bindEditHandle();
						
						this.setSizeForResizeWrapper();
		
						//this.resize.options.aspectRatio = parseFloat(this.model.get('json').style.element.width) / parseFloat(this.model.get('json').style.element.height);

						if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);

						this.resize.options.start = function() {
							
							if( app.methods.isDynamicAlign() ) {
								that.boundingboxElement =  that.getBoundingBox();
								app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
							}
							
							app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for image');
						};
						
						this.resize.options.resize = function( event, ui ) {
							
							
							that.resizeToGuide( ui );
							
							var newWidth = ui.size.width,
									newHeight = ui.size.height;
									
							that.model.get('json').data.charts.options.width = that.model.get('json').data.resolution.width = newWidth * multiple;
							that.model.get('json').data.charts.options.height = that.model.get('json').data.resolution.height = newHeight * multiple;

							that.renderChart();	
							
						};
						
						this.resize.options.stop = function(event, ui) {
							
							that.resizeToGuide( ui );
							
							if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();
		
							var newWidth = ui.size.width,
									newHeight = ui.size.height,
									newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
									newTop = parseFloat(that.$el.css('top')) + ui.position.top;
		
							that.resizeWrapperWidth = newWidth * multiple;
							that.resizeWrapperHeight = newHeight * multiple;
		
							that.model.get('json').style.element.width = newWidth * multiple + 'px';
							that.model.get('json').style.element.height = newHeight * multiple + 'px';
							that.model.get('json').style.element.left = newLeft * multiple + 'px';
							that.model.get('json').style.element.top = newTop * multiple + 'px';
							
							that.$el.css({
								width: newWidth + 'px',
								height: newHeight + 'px',
								left: newLeft + 'px',
								top: newTop + 'px'
							});
							
							that.$resizeWrapper.css({
								left: '0px',
								top: '0px'
							});

							that.renderChart();	
							
							saveHistory('chart resize');
							
						};
						
						this.drag();
						
						this.resize.init.call( this );
						
						//this.rotateIt = new RotateIt();
						//this.rotateIt.init( this.$resizeWrapper );
						
						this.click();
						this.dblclick();
						
						this.renderChart();
						
					},
					
					reRender: function(newWidth, newHeight){
						
						this.model.get('json').data.charts.options.width = this.model.get('json').data.resolution.width = newWidth;
						this.model.get('json').data.charts.options.height = this.model.get('json').data.resolution.height = newHeight;
							
						this.renderChart();
					},
									
					initialize: function(options) {
						
						this.addOptions(options);
						this.setUp();
						this.createTemplates();
						this.setTemplateObj();
						this.setCustomTemplateObj();
						this.render();
						
					},

					dblclick: function() {
						
						var that = this;
						
						this.$el.dblclick(	function(event)	{
							app.methods.widgets.charts.launch(that.model.get('json'), that);
							return false;
						});
					},

					createTemplates: function() {
						for( var idx in app.settings.charts){
							var chart = app.settings.charts[idx];
							this.templates[chart] = '\
									<div id="<%= id %>" class="elements charts" collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<img  class="chart-area-img" src="<%= imgSrc %>"/>\
											<div  class="custom-handle zoom-handle"></div>\
											<div  class="custom-handle delete-handle"></div>\
											<div  class="custom-handle edit-handle"></div>\
											<div  class="custom-handle clone-handle"></div>\
										</div>\
									</div>\
								';
						}
					},				

				}),			
								
				Richtext: ParagraphView.extend({
					
					editBoxComponents: ['fonts', 'moretext', 'textAlign', 'cta', 'colors', 'layers' ,'lock', 'align', 'text', 'textshadow'],
					
					setSizeForResizeWrapper: function() {
						
					},
					
					adaptHeightToTextedit: function( fromwhere ) {
						
						//console.log('adaptHeightToTextedit-fromwhere: ' + fromwhere);
						
						var that = this,
								$richtextImg = this.$textEdit.find('img');
						
						var adapt = function( what ) {
							
							// console.log(what); 
							
							var textEditHeight = that.$textEdit.height(),
									multipliedHeight = textEditHeight * multiple;
									
							that.$el.height(textEditHeight);
							that.$el.width(that.$textEdit.width());
							that.$resizeWrapper.height(textEditHeight);
							that.$resizeWrapper.width(that.$textEdit.width());
							
							that.model.get('json').style.element.height = multipliedHeight + 'px';		
							
						};
						
						
						
						if( $richtextImg.length == 0 ){
							adapt('measuring with height of HTML text');
						}else{
							$richtextImg.load( function() {
								adapt('measuring with height of PNG');
							});
							
						};

					},
					
					textedit2String: function() {
						
						this.$textEdit.html( this.model.get('json').data.text);				
				
					},
					
					adaptUL: function() {
						
						var fontSize = parseFloat( this.model.get('json').style.textedit['font-size'] );
						var paddingLeft = fontSize  * scale;
						paddingLeft = (paddingLeft <= 10 ? 10: paddingLeft);
						var obj = {
					    'padding-left':  paddingLeft + 'px',
					    'padding-right':  '0px'
						};

						this.$textEdit.find('ul').css( obj );		
											
					},

					setResizeOptions: function() {
						
						var that = this;
						
						this.resize.options.aspectRatio = false;
						
						this.resize.options.start = function() {
							
							if( app.methods.isDynamicAlign() ) {
								that.boundingboxElement =  that.getBoundingBox();
								app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
							}
							
							app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for paragraphs');
							
							that.textedit2String();
							that.adaptUL();
							
							that.adaptHeightToTextedit('adaptHeightToTextedit from resizing');
						};
						
						this.resize.options.resize = function( event, ui ) {
							that.rotateIt.centerRotateHandle();
							that.resizeToGuide( ui );
							
							that.adaptHeightToTextedit('adaptHeightToTextedit from resizing');
						};
						
						this.resize.options.stop = function(event, ui) {
							that.rotateIt.centerRotateHandle();
							
							that.resizeToGuide( ui );
							if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();
							
							var newWidth = ui.size.width,
									newHeight = ui.size.height,
									newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
									newTop = parseFloat(that.$el.css('top')) + ui.position.top;
		
							that.resizeWrapperWidth = newWidth * multiple;
							that.resizeWrapperHeight = newHeight * multiple;
		
							that.model.get('json').style.element.left = newLeft * multiple + 'px';
							that.model.get('json').style.element.top = newTop * multiple + 'px';
							that.model.get('json').style.element.width = newWidth * multiple + 'px';
							that.model.get('json').style.element.height = newHeight * multiple + 'px';
		
							that.$el.css({
								width: newWidth + 'px',
								height: newHeight + 'px',
								left: newLeft + 'px',
								top: newTop + 'px'
							});
							
							that.$resizeWrapper.css({
								left: '0px',
								top: '0px'
							});
							
							app.methods.progressBar.start();
							
							that.adaptHeightToTextedit('adaptHeightToTextedit from resize stop');
							
							that.renderPngFromTextedit('richtext resize stop', function() {
								app.methods.progressBar.stop('rich text rendered');
								saveHistory('resize rich text change');	
							});
		
						};
						
						this.resize.init.call( this );						
					},	
							
					custom: function() {
		
						var that = this;
		
						this.bindEditHandle();
						
						this.edit();
										
						this.drag();
		
						this.setResizeOptions();
						
						this.rotateIt = new RotateIt();
						this.rotateIt.init( this.$resizeWrapper );
						
						this.click();
						
						this.textedit = this.$resizeWrapper.children('.textedit')[0];
						
						this.setSizeForResizeWrapper();	
		
						this.adaptHeightToTextedit('custom rich text');
						
						if( typeof( this.model.get('json').data.htmlAsPng ) == 'undefined') {
							this.renderPngFromTextedit('richtext when there is no data.htmlAsPng', function() {
								that.scale();	
							});
						} else {
							this.scaleCustom();
						}
		
					},

					redraw: function() {
						
						var that = this;
						
						this.$el.addClass('transition1s');
						this.$resizeWrapper.addClass('transition1s');
						
						this.model.set('json', app.methods.revert.getRevertElement( this.cid ));
						
						this.rotateIt.custom.elements.applyRotation.call( this.rotateIt );
						
						this.scale();
						
						this.setFont();
						
						var cssObj = {}; // HERE
						cssObj['color'] = this.model.get('json').style.textedit.color;
						cssObj['text-align'] = this.model.get('json').style.textedit['text-align'];
						cssObj['line-height'] = this.model.get('json').style.textedit['line-height'];
						cssObj['text-transform'] = this.model.get('json').style.textedit['text-transform'];
						
						this.$textEdit.css(cssObj);

						//console.log('rich text redraw');
						this.$textEdit.html('<img src="' + this.model.get('json').data.htmlAsPng + '"/>');
						
						this.adaptHeightToTextedit('custom rich text');
						
						this.$el.removeClass('transition1s');
						this.$resizeWrapper.removeClass('transition1s');					
						this.storeOffset();
						
					},
			
					whenTextIsDblclicked: function(event) {
		
						event.stopPropagation();
						app.methods.widgets.richtext.launch( this.model.get('json'), this);
		
					},
					
					leaveEditText: function(content) {
		
						this.$textEdit.html(content).removeClass('active');
						this.$el.removeClass('editing');

						this.model.get('json').data.text = content;
						this.scaleCustom();
						this.adaptHeightToTextedit();
						
						this.renderPngFromTextedit( 'rich text leaveEditText', function() {
							saveHistory('leaveEditText rich text');
						});
		
					},
					
					templates:{
			
						richtext: '\
									<div id="<%= id %>" class="elements " collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="textedit" style="<%= texteditStyle %>"><%= textedit_content  %></div>\
											<div  class="custom-handle zoom-handle"></div>\
											<div  class="custom-handle delete-handle"></div>\
											<div  class="custom-handle edit-handle"></div>\
											<div  class="custom-handle clone-handle"></div>\
										</div>\
									</div>\
								'
					}				
				}),	
							
				Headers: TextHeaderView.extend({
				}),	
				
				Backgrounds: ImageView.extend({
					
					initialize: function(options) {
						
						this.addOptions(options);
						this.setUp();
						this.setTemplateObj();
						
						if( typeof(this.setCustomTemplateObj) != 'undefined') this.setCustomTemplateObj();
						this.render();
					},

					getBase64: function() {
						
						// this.getBase64();
						
						var that = this,
								outputFormat = 'image/png',
								url = this.model.get('json').data.src;
								
								// console.log(this.model.get('json').style.background['background-image']);
								
									
							tools.convertImgToBase64(url, outputFormat, function(base64Img, width,  height) { 
								
								var baseArray  = base64Img.split(','),
										backgroundImage = 'url(\'' +  app.settings.base64Prefix + baseArray[1]  + '\')';
								
								that.model.get('json').style.background['background-image'] = backgroundImage;
								that.model.get('json').style.background['background-size'] = width + 'px';
								that.model.get('json').data.base64 = baseArray[1];
								
								that.$background.css({
									'background-image': backgroundImage,
									'background-size': width * scale + 'px'
								});
								
								
							});
						
					},
					
					setTemplateObj: function() {
						
							app.methods.doTempateObjFor.call( this, 'elementStyle', 'element', scale);
							app.methods.doTempateObjFor.call( this, 'resizeStyle', 'resizeWrapper', scale);
							
							var styleIs = '',
									backgroundStyles = this.model.get('json').style.background;
							
							for( var key in backgroundStyles){
								
								if( tools.inArray(key, ['border-radius', 'border-width', 'background-size'])) {
									styleIs += key + ': ' + parseFloat(backgroundStyles[key]) * scale + 'px;';
								} else {
									styleIs += key + ': ' + backgroundStyles[key]  + ';';
								}
							}
							
							this.templateObj['backgroundStyle'] = styleIs;
								
							if( typeof(this.model.get('json').justDropped) != 'undefined' ) {
								toast('Stretch background to fit entire canvas by double clicking it.', 'keep', 5000, 'info', 'Tip.');
								delete this.model.get('json').justDropped;
							}
							
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

						var that = this,
								startWidth;
						
						this.bindEditHandle();
						
						this.setSizeForResizeWrapper();
						this.resize.options.aspectRatio = false;

						this.resize.options.start = function(event, ui) {
							
							
							for(var	idx	in app.settings.keysInLayout){
								that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg)');
								that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg) scaleX(' + that.model.get('json').data.mirror + ')' );
							}

							
							that.$el.addClass('seethru');
							app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for background');
							startWidth = $(this).width();
							
							if( app.methods.isDynamicAlign() ) {
								that.boundingboxElement =  that.getBoundingBox();
								app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
							}
						};
						
						this.resize.options.resize = function(event, ui) {
							
							that.rotateIt.centerRotateHandle();
							that.resizeToGuide( ui );
	
						};
						
						this.resize.options.stop = function(event, ui) {
							
							for(var	idx	in app.settings.keysInLayout){
								that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg)');
								that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg) scaleX(' + that.model.get('json').data.mirror + ')' );
							}
							
							that.rotateIt.centerRotateHandle();
							
							that.$el.removeClass('seethru');
							that.resizeToGuide( ui );
							
							if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();

							var newWidth = ui.size.width,
									newHeight = ui.size.height,
									newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
									newTop = parseFloat(that.$el.css('top')) + ui.position.top;
		
							that.model.get('json').style.element.width = newWidth * multiple + 'px';
							that.model.get('json').style.element.height = newHeight * multiple + 'px';
							that.model.get('json').style.element.left = newLeft * multiple + 'px';
							that.model.get('json').style.element.top = newTop * multiple + 'px';
							
							that.$el.css({
								width: newWidth + 'px',
								height: newHeight + 'px',
								left: newLeft + 'px',
								top: newTop + 'px'
							});
							
							that.$resizeWrapper.css({
								left: '0px',
								top: '0px'
							});
							
							saveHistory('background resize');
							
						};

						this.resize.init.call( this );
						
						this.drag();	
											
						this.rotateIt = new RotateIt();
						this.rotateIt.init( this.$resizeWrapper );
						
						this.click();
						
						this.$el.dblclick(function(event)	{
							
							that.$el.css({
								top: '0px',
								left:	'0px'
							});
							
							that.model.get('json').style.element.top = '0px';
							that.model.get('json').style.element.left = '0px';
							
							that.$el.width(app.stubs.curCanvasSize.width * scale);
							that.$resizeWrapper.width(app.stubs.curCanvasSize.width * scale);
							that.model.get('json').style.element.width = app.stubs.curCanvasSize.width + 'px';
							
							that.$el.height(app.stubs.curCanvasSize.height * scale);
							that.$resizeWrapper.height(app.stubs.curCanvasSize.height * scale);
							that.model.get('json').style.element.height = app.stubs.curCanvasSize.height + 'px';
							
							that.rotateIt.centerRotateHandle();
							
							saveHistory('stretch background');
							
						});
						
						this.scaleCustom();
						
						this.$background.css('opacity', this.model.get('json').style.background.opacity);
						
						if( typeof( this.model.get('json').data.base64 ) == 'undefined'){
							that.getBase64();
						} 

					},		
								
					scaleCustom: function() {
						
						this.$background.css('background-size', scale * parseFloat(this.model.get('json').style.background['background-size']) + 'px');
						
						if( typeof(this.model.get('json').style.background ) != 'undefined' ){
							var borderRadius = scale * parseFloat(this.model.get('json').style.background['border-radius']);
							this.$background.css('border-radius', borderRadius + 'px');
						};
						
						
						if(typeof(this.model.get('json').style.background ) == 'undefined' || this.model.get('json').style.background['border-width'] == '0px') return;
						
						var borderWidth = parseFloat(this.model.get('json').style.background['border-width']) * scale;
						this.$background.css('border-width', borderWidth + 'px');
					},
										
					bindEditHandle: function() {
						
						this.bindHandles.edit = function() {
							
							var that = this;
								
							this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
							
								function(event) {
									
									editbox.view = that;
									
									editbox.whenEditClicked(event);
									
									that.setLabel();
									editbox.methods.colors['one'].label( that );
									editbox.methods.customBorders.label( that );
									
									editbox.methods.backgroundSize.label( that );
									editbox.methods.opacity.label( that );
									
									editbox.methods.layers.setIdxForThisElement();
		
									return false;
									
								}
							);
											
						}
		
					},
					
					editBoxComponents: ['layers', 'lock','colors', 'rotate' , 'customBorders', 'opacity', 'backgroundSize'],
					
					setLabel: function() {
						
						var borderColor = this.model.get('json').style['background']['border-color'].toUpperCase(),
								transparentUrl = 'url(' + 'img/transparent.png)';
		
						if( borderColor == 'TRANSPARENT' ){
							$('#color-sample').css({
								'background-image': transparentUrl
							});
						} else{
							$('#color-sample').css({
								'background-color': borderColor
							});							
						}		
					}		
				}),
				
				Shapes: ImageView.extend({
					
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
						
						if( typeof(this.model.get('json').justDropped) != 'undefined' ) {
							
							if( typeof( this.model.get('json').data.aspectratio) != 'undefined' &&
									!this.model.get('json').data.aspectratio ||
									typeof( this.model.get('json').data.aspectratio) != 'undefined' &&
									this.model.get('json').data.aspectratio == 'false'
							){
								toast('Stretch this element to fit entire canvas by double clicking it.', 'keep', 5000, 'info', 'Tip.');
							}
							
							delete this.model.get('json').justDropped;
						}
								
					},
					
					setTemplate: function() {
						this.templates = {};
						for( var idx in app.settings.hasShapes){
							this.templates[app.settings.hasShapes[idx]]	= '\
									<div id="<%= id %>" class="elements noselect"  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="shape" style="<%= typeof(shapeStyle)!== "undefined" ?  shapeStyle : "" %>"></div>\
											<div  class="custom-handle rotate-handle">&nbsp;</div>\
											<div  class="custom-handle zoom-handle"></div>\
											<div  class="custom-handle delete-handle">&nbsp;</div>\
											<div  class="custom-handle edit-handle">&nbsp;</div>\
											<div  class="custom-handle clone-handle">&nbsp;</div>\
										</div>\
									</div>\
							';
						}
					},
	
					custom: function() {

						var that = this,
								startWidth;
								
						if( typeof( this.model.get('json').data.glow ) != 'undefined'){
							this.hasGlow = true;
							this.editBoxComponents.push('glow');
							
							var value = this.model.get('json').data.glow;
							for(var	idx	in app.settings.keysInLayout){
								var glowMaskValue = ( value < 10 ? '0' + value: value);
								
								if( this.model.get('json').data.whereglow == 'inner' ){
									var glowMask = '-webkit-radial-gradient(center center, ellipse cover, rgba(255,255,255,0.2) 0%,rgba(0,0,0,0.' + glowMaskValue + ') 100%)';									
								}else{
									var glowMask = '-webkit-radial-gradient(center center, ellipse cover, rgba(255,255,255,0.' + glowMaskValue + ') 0%,rgba(0,0,0,0.2) 100%)';
								};
								
								this.model.get('json').style.shape[app.settings.keysInLayout[idx]  + 'mask-image'] = glowMask;
								this.$shape.css(app.settings.keysInLayout[idx]  + 'mask-image', glowMask);
							}
						};
						
						this.bindEditHandle();
						
						this.setSizeForResizeWrapper();
						
						switch(	this.model.get('json').data.aspectratio ){
							
							case 'true':
							case true:
								this.resize.options.aspectRatio = true;
							break;
							
							case 'false':
							case false:
								this.resize.options.aspectRatio = false;
							break;
							
							default:
							this.resize.options.aspectRatio = parseFloat(this.model.get('json').style.element.width) / parseFloat(this.model.get('json').style.element.height);
						}
					
						//console.log(this.resize.options.aspectRatio);

						this.resize.options.start = function(event, ui) {
							
							for(var	idx	in app.settings.keysInLayout){
								that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg)');
								that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg) scaleX(' + that.model.get('json').data.mirror + ')' );
							}

							that.$el.addClass('seethru');
							app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for image');
							startWidth = $(this).width();
							
							if( app.methods.isDynamicAlign() ) {
								that.boundingboxElement =  that.getBoundingBox();
								app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
							}
						};
						
						this.resize.options.resize = function(event, ui) {
							
							that.rotateIt.centerRotateHandle();
							
							
							if( typeof( that.model.get('json').style.shape['border-radius'] ) != 'undefined'){
								var percentScaled =  $(this).width() / startWidth,
										borderRadius = parseFloat(that.model.get('json').style.shape['border-radius']),
										resizedRadius = borderRadius * percentScaled;
								
								that.$el.find('.shape').css({
									'border-radius': resizedRadius * scale + 'px'
								});	
								
							};

							that.resizeToGuide( ui );
							
//							if( that.model.get('json').data.aspectratio == true || that.model.get('json').data.aspectratio == 'true'){
//								
//								that.$el.find('.shape').css({
//									'border-width': parseFloat(that.model.get('json').style.shape['border-width']) * percentScaled * scale + 'px'
//								});	
//							}
										
						};
						
						this.resize.options.stop = function(event, ui) {
							
							for(var	idx	in app.settings.keysInLayout){
								that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg)');
								that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg) scaleX(' + that.model.get('json').data.mirror + ')' );
							}
							
							that.rotateIt.centerRotateHandle();
							
							var percentScaled =  $(this).width() / startWidth,
									borderRadius = parseFloat(that.model.get('json').style.shape['border-radius']),
									resizedRadius = borderRadius * percentScaled;
							
							that.$el.find('.shape').css({
								'border-radius': resizedRadius * scale + 'px'
							});
							
							that.model.get('json').style.shape['border-radius'] = resizedRadius  + 'px';
							
							that.$el.removeClass('seethru');
							that.resizeToGuide( ui );
							
							if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();

							
							var newWidth = ui.size.width, //that.$shape.width(),
									newHeight = ui.size.height, //that.$shape.height(),
									newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
									newTop = parseFloat(that.$el.css('top')) + ui.position.top;

							that.model.get('json').style.element.width = newWidth * multiple + 'px';
							that.model.get('json').style.element.height = newHeight * multiple + 'px';
							that.model.get('json').style.element.left = newLeft * multiple + 'px';
							that.model.get('json').style.element.top = newTop * multiple + 'px';
							
							//console.log(JSON.stringify(  that.model.get('json').style.element   , null, 2 ));

							that.$el.css({
								width: newWidth + 'px',
								height: newHeight + 'px',
								left: newLeft + 'px',
								top: newTop + 'px'
							});
							
							that.$resizeWrapper.css({
								left: '0px',
								top: '0px'
							});
							
							saveHistory('image resize');
							
						};

//						if( typeof( this.model.get('json').data.aspectratio) != 'undefined') {
//							this.resize.options.aspectRatio = parseFloat(this.model.get('json').data.aspectratio);	
//						}
						
						this.resize.init.call( this );
						
						this.drag();	
											
						this.rotateIt = new RotateIt();
						this.rotateIt.init( this.$resizeWrapper );
						
						this.click();
						
						this.scaleCustom();
						
						this.$shape.css('opacity', this.model.get('json').style.shape.opacity);
						this.setDblClick();

					},
					
					setDblClick: function() {
						
							var that = this;
							
							this.$el.unbind('dblclick').dblclick(function(event)	{
								
								console.log('AA');
								
								that.$el.css({
									top: '0px',
									left:	'0px'
								});
								
								that.model.get('json').style.element.top = '0px';
								that.model.get('json').style.element.left = '0px';
								
								that.$el.width(app.stubs.curCanvasSize.width * scale);
								that.$resizeWrapper.width(app.stubs.curCanvasSize.width * scale);
								that.model.get('json').style.element.width = app.stubs.curCanvasSize.width + 'px';
								
								that.$el.height(app.stubs.curCanvasSize.height * scale);
								that.$resizeWrapper.height(app.stubs.curCanvasSize.height * scale);
								that.model.get('json').style.element.height = app.stubs.curCanvasSize.height + 'px';
								
								that.rotateIt.centerRotateHandle();
								
								that.model.get('json').data.aspectratio = app.stubs.curCanvasSize.width / app.stubs.curCanvasSize.height;
								
								saveHistory('shape background');
							});	

					
					},
								
					scaleCustom: function( customScale ) {
						
						var borderRadius = scale * parseFloat(this.model.get('json').style.shape['border-radius']);
						this.$shape.css('border-radius', borderRadius + 'px');
						
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
										
					setLabel: function() {
					
						var borderColor = this.model.get('json').style.shape['border-color'].toUpperCase(),
								backgroundColor = this.model.get('json').style.shape['background-color'].toUpperCase(),
								transparentUrl = 'url(' + 'img/transparent.png)';
									
						$('#color-sample').css({
							'background-color': borderColor	
						});
						
						$('#background-sample').css({
							'background-color': backgroundColor	
						});
												
						if( borderColor == 'TRANSPARENT' ){
							$('#color-sample').css({
								'background-image': transparentUrl
							});
						} else{
							$('#color-sample').css({
								'background-image': 'initial'
							});							
						}
						
						if( backgroundColor == 'TRANSPARENT' ){
							$('#background-sample').css({
								'background-image': transparentUrl
							});
						} else{
							$('#background-sample').css({
								'background-image': 'initial'
							});							
						}
						
						var showSide = this.model.get('json').data.show;
						
						for( var side in showSide){
							
							var isTrue = showSide[side];
		
							if( typeof( isTrue) == 'string' && isTrue === 'true' ||
									typeof( isTrue) == 'boolean' && isTrue
							){
								$('#showborder input[side=' + side + ']').prop('checked', true);
							} else{
								$('#showborder input[side=' + side + ']').prop('checked', false);
							}
						};

						var borderStyle = this.model.get('json').data['border-style']
						$('#border-style-wrapper input[value=' + borderStyle  + ']').prop('checked', true);
						
						//label
						var aspectRatio = parseFloat(editbox.view.model.get('json').style.element.width)/parseFloat(editbox.view.model.get('json').style.element.height);
						$('#aspectratio-shape-field').val( aspectRatio );
						
					},
					
					bindEditHandle: function() {
						
						this.bindHandles.edit = function() {
							
							var that = this;
								
							this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
							
								function(event) {
									
									editbox.view = that;
									
									editbox.whenEditClicked(event);
									
									that.setLabel();
									editbox.methods.customBorders.label( that );
									editbox.methods.opacity.label( that );
									editbox.methods.glow.label( that );
									editbox.methods.aspect.label( that ); 
									
									editbox.methods.layers.setIdxForThisElement();
		
									return false;
									
								}
							);
											
						}
		
					},
					
					editBoxComponents: ['colors', 'bordershow', 'layers', 'aspect' , 'borderstyle', 'cta' ,'lock', 'rotate', 'customBorders', 'opacity'],
					
					isBorderLess: function() {
						
						var show = this.model.get('json').data.show;
						for( var key in this.model.get('json').data.show){
							var value = show[key];
							if( !value || value == 'false') return true;	
						}
						return false;
						
					}
					
				}),
				
				Image: ImageView.extend({
				}),
				
				Web: ImageView.extend({
					templates:{
		
						web: '\
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
								',
						}
				}),
				
				Icons: ImageView.extend({
					
					editBoxComponents: [ 'cta', 'imgTools', 'image', 'layers' , 'lock', 'opacity', 'rotate'],
					
					getSVG: function() {
					
						return;
							
						var that = this,
								thePath = this.model.get('json').data.imgSrc;
							
				    $.get(thePath, null, function(data){
				    	
				        var svgNode = $("svg", data);
				        
				        var docNode = document.adoptNode(svgNode[0]);
				        
				        
				        //var dataUrl = 'data:image/svg+xml;base64,' +  btoa(docNode);
				        var dataUrl = 'data:image/svg+xml;utf8,' + svgNode;
				        console.log( dataUrl );
				        
				        that.$el.find('img').attr('src', dataUrl);
				        
				        //var pageNode = $("#element-to-hold-svg");
				        //pageNode.html(docNode);
				    }, 'xml');
						
					},
					
					templates:{
		
						icons: '\
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
								'
					}
					
				}),	
				
				Svgshapes: ImageView.extend({  // http://stackoverflow.com/questions/24933430/img-src-svg-changing-the-fill-color
					
					initialize: function(options) {
						
						this.addOptions(options);
						this.setUp();
						this.setTemplate();
						this.setTemplateObj();
						this.setCustomTemplateObj();
						
						this.render();
					},
					
					editBoxComponents: [ 'aspect', 'svgshadow', 'imgTools', 'stroke', 'cta', 'colors', 'image', 'layers' , 'lock', 'opacity', 'rotate'],
			
					bindEditHandle: function() {
						
						this.bindHandles.edit = function() {
							
							var that = this;
								
							this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
							
								function(event) { // working  clicked edit button
									
									editbox.view = that;
									
									editbox.whenEditClicked(event);
									
									editbox.methods.colors['one'].label( that );
									
									editbox.methods.opacity.label( that );
									
									editbox.methods.stroke.label( that );
									
									editbox.methods.aspect.label( that );  // working label aspect
									
									editbox.methods.svgshadow.label( that );
		
									return false;
									
								}
							);
											
						}
		
					},
			
					custom: function() {
		
						var that = this,
								startWidth;
						
						this.bindEditHandle();
						
						this.setSizeForResizeWrapper();
		
						// working aspect
						if( typeof( this.model.get('json').data.aspectratio ) != 'undefined' && JSON.parse(this.model.get('json').data.aspectratio)){  // working redraw aspect
							this.resize.options.aspectRatio = parseFloat(this.model.get('json').style.element.width) / parseFloat(this.model.get('json').style.element.height);
						} else{
							this.resize.options.aspectRatio = false;
						};
						
						this.resize.options.start = function() {
							
							for(var	idx	in app.settings.keysInLayout){
								that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg)');
								that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg) scaleX(' + that.model.get('json').data.mirror + ')' );
							}
		
							if( app.methods.isDynamicAlign() ) {
								that.boundingboxElement =  that.getBoundingBox();
								app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
							}
							startWidth = $(this).width();
							app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for image');
							
						};
								
						this.resize.options.resize = function( event, ui ) {
							that.rotateIt.centerRotateHandle();
							that.resizeToGuide( ui );
							
							var percentScaled =  $(this).width() / startWidth;
		
							that.resizeToGuide( ui );

							that.$el.find('svg').css({
								width: $(this).width() + 'px',
								height: $(this).height() + 'px'
							});

								
						};
						
						this.resize.options.stop = function(event, ui) {
							
							var percentScaled =  $(this).width() / startWidth;
							
							for(var	idx	in app.settings.keysInLayout){
								that.$el.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' +  that.model.get('json').data.rotation +	'deg)');
								that.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(0deg) scaleX(' + that.model.get('json').data.mirror + ')' );
							}
							
							that.rotateIt.centerRotateHandle();
							
							that.resizeToGuide( ui );
							
							if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();
							
							var newWidth = ui.size.width,
									newHeight = ui.size.height,
									newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
									newTop = parseFloat(that.$el.css('top')) + ui.position.top;
		
							that.resizeWrapperWidth = newWidth  * multiple;
							that.resizeWrapperHeight = newHeight * multiple;
		
							that.model.get('json').style.element.width = newWidth * multiple + 'px';
							that.model.get('json').style.element.height = newHeight * multiple + 'px';
							that.model.get('json').style.element.left = newLeft * multiple + 'px';
							that.model.get('json').style.element.top = newTop * multiple + 'px';
							
							that.$el.css({
								width: newWidth + 'px',
								height: newHeight + 'px',
								left: newLeft + 'px',
								top: newTop + 'px'
							});
							
							that.$el.find('svg').css({
								width: newWidth + 'px',
								height: newHeight + 'px'
							});
							
							that.$resizeWrapper.css({
								left: '0px',
								top: '0px'
							});
							
							if( tools.detectEdge() ) { // edge hack
								that.$el.css('visibility', 'hidden');
								
								setTimeout(function(){
							    
									that.$el.css('visibility', 'visible');
																
								}, 1);
			
							}
							
							saveHistory('image resize');
							
						};
						
						this.drag();
						
						this.resize.init.call( this );
						
						this.rotateIt = new RotateIt();
						this.rotateIt.init( this.$resizeWrapper );
						
						this.click();
						
						this.swapIMG4SVG();
						
					},
								
					scaleCustom: function() {

			    		var json = this.model.get('json'),
			    				style = json.style,
			    				width = parseFloat(style.element.width) * scale,
			    				height = parseFloat(style.element.height) * scale,
			    				svgshadow = this.model.get('json').data.svgshadow,
									theStyle = 'drop-shadow(' + svgshadow * scale + 'px ' + svgshadow * scale + 'px ' + svgshadow * scale * 2 + 'px rgba(0,0,0,0.4)  )';
							
							this.$svgshape.css({
								width: width + 'px',
								height: height + 'px',
								'-webkit-filter': theStyle,
								filter: theStyle
							});
						
					},
					
					swapIMG4SVG: function( callback ){
						
						var that = this,
								file = this.model.get('json').data.file,
								thePath = app.stubs.svgmap[file];
						
						$.get(thePath).done( function(data){// working swapIMG4SVG
							
				        var svgNode = $("svg", data),
				        		docNode = document.adoptNode(svgNode[0]);
				        
								that.$img.replaceWith(docNode);	
								
								//that.model.get('json').data.svg = docNode;
											    		
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
								
								if( typeof( callback ) != 'undefined') callback();
								
				    }).fail( function() {
				    	console.log('file not found.');
				    });
						
						return;
				    $.get(thePath, null, function(data){// working swapIMG4SVG
				    	
				        var svgNode = $("svg", data),
				        		docNode = document.adoptNode(svgNode[0]);
				        
								that.$img.replaceWith(docNode);	
								
								//that.model.get('json').data.svg = docNode;
											    		
				    		var json = that.model.get('json'),
				    				style = json.style,
				    				width = parseFloat(style.element.width) * scale,
				    				height = parseFloat(style.element.height) * scale,
				    				fill = style['svgshape']['fill'],
				    				stroke = style['svgshape']['stroke'],
				    				strikeWidth = style['svgshape']['stroke-width'];
								
								that.$svgshape = that.$el.find('svg');
								
								that.$svgshape.css({
									fill: fill,
									stroke: stroke,
									'stroke-width': strikeWidth,
									width: width + 'px',
									height: height + 'px'
								});
								
								if( typeof( callback ) != 'undefined') callback();
								
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
								
				Svg: ImageView.extend({
					
					editBoxComponents: [ 'cta', 'image', 'layers' , 'lock', 'opacity'],
					
					templates:{
		
						svg: '\
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
								'
					},
					setCustomTemplateObj: function() {
						var json = this.model.get('json');
						this.templateObj['imgSrc'] = app.settings.baseSvgPrefix + json.data.svg;
						
					}
					
				}),	
							
				Googledrive: ImageView.extend({
					
					templates:{
						googledrive: '\
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
								'
					},
			
					getBase64: function() {
						
							var that = this;
						
							if( serverhost == 'localhost' ||
									typeof(this.model.get('json').data.base64) !=  'undefined'){
								return;
							}
							
							

							var that = this,
									url = 'image/getSrcFromThisImage',
									postObj = {
										'google_id': app.stubs.google_id,
										'fileId': this.model.get('json').data.fileId
									};

							tools.ajax(url, postObj, 'post', function(data) {

									that.$img.attr('src', app.settings.base64Prefix + data.base64Data);
									that.model.get('json').data.base64 = data.base64Data;
									that.model.get('json').data.width = data.width;
									that.model.get('json').data.height = data.height;
									
									saveHistory('panel drop google image');
									
							});
							
					}
					
				}),
				
				Paragraphs: ParagraphView.extend({}),

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
						this.scaleLine();
						/* HACK -- FOLLOWING HAS TO BE TWICE*/
						this.renderLine();
						this.renderLine();
						this.drag();
						this.boxesclick();
						this.bindEditHandle();
						this.bindHandles.init.call( this );
						this.setHandlePositions();
						this.$boxes.on('mousedown',	function(event)	{
							event.stopPropagation();
						});
						
						this.$el.on('click',
							function(event) {
								event.stopPropagation();
							}
						)	
						
					},
					delete: function( groupDelete ) {
						
						var that = this,
								layers = app.stubs.views.editbox.methods.layers;
								
						app.stubs.collections.elements.get(this.cid).set('disabled', true);
						this.$el.hide();
						
						if( typeof(groupDelete) == 'undefined'){
							layers.redoLayers();
							saveHistory('Dynoline delete');					
						}
		
					},									
					redraw: function() {
						this.model.set('json', app.methods.revert.getRevertElement( this.cid ));
						this.coordinates = this.model.get('json').data.coordinates;
						this.colorLine();
						this.scale();
						
						var that = this;
						setTimeout(function(){
							that.storeOffset();
						}, 500);
					},
					bindEditHandle: function() {
						
						var that = this;
						
						this.bindHandles.edit = function() {
								
							that.$line.on('click', '.custom-handle.edit-handle', 
							
								function(event) {
									
									editbox.view = that;
									
									editbox.whenEditClicked(event);
									
									editbox.methods.colors['one'].label( that );
									
									editbox.methods.layers.setIdxForThisElement();
		
									return false;
									
								}
							);
											
						}
		
					},
					editBoxComponents: ['colors', 'layers' ,'lock'],

					boxesclick: function() {
						var that = this;
						this.$boxes.on('click', 
							function(event) {
								
								if( event.shiftKey ) {
									return false;
									app.methods.groupyBox.addForeignElement(that.cid)
								}
								
								var where = $(this).attr('where');

								app.methods.clearActive(['previewOn'], 'exclude', 'element clicked 3');
								
								that.$el.addClass('ontop');								
								
								$(this).addClass('active');
								that.$line.find('.custom-handle').removeClass('active');
								that.$line.find('.custom-handle.' + where ).addClass('active');
								
							}
						)
					},
					bindHandles: {
						init: function() {
							this.bindHandles.edit.call(this);
							this.bindHandles.delete.call(this);
							this.bindHandles.clone.call(this);
							
							this.$line.on('mousedown', '.custom-handle', 
								function(event) {
									return false;
								}
							);
						},
						delete: function() {
							var that = this;	
									
							this.$el.on('click', '.custom-handle.delete-handle', 
								function() {
									that.delete();
									return false;
								}
							);
						},
						clone: function() {
							
							var that = this;
							
							this.$el.on('click', '.custom-handle.clone-handle', 
								function(event) {
		
									app.stubs.cloned = [];
									app.methods.clone(that.model, 'element');
									app.methods.clearActive(['previewOn'], 'exclude', 'dynoline clone button click');
									
									return false;
									
									
									app.methods.clearActive(['hideHandles'], 'include', 'element clone 3');
									var clonedView = app.stubs.views.elements[ app.stubs.cloned[0] ];
									// clonedView.$el.click();
									
									return false;
								}
							);					
						}
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
					},
					drag: function()	{
		
						var	that = this,
								$el	=	this.$el,
								$panel = this.$el.parent(),
								guides = [],
								innerOffsetX, innerOffsetY;
		
						$el.find(".box").draggable({
							snap: '.guide-line',
							snapTolerance: 10,
							start: function(event,	ui)	{
								app.stubs.placement.topPlace = 120;
								app.stubs.placement.leftPlace = 120;
								app.methods.clearActive(['previewOn'], 'exclude', 'dynoline box drag');
								
								that.$el.addClass('ontop');
								
								app.methods.alignToGuide.dynoline['left'] = parseFloat(that.$el.css('left'));
								app.methods.alignToGuide.dynoline['top'] = parseFloat(that.$el.css('top'));
								app.methods.alignToGuide.buildArray.init.call(  app.methods.alignToGuide, that.cid );
								

							},
							drag:	function(event,	ui){
	
								that.renderLine();
								that.setHandlePositions();
								for( var side in app.methods.alignToGuide.arrays){
									for( var idx in app.methods.alignToGuide.arrays[side]){
										var obj = app.methods.alignToGuide.arrays[side][idx];
										app.methods.alignToGuide.hitWhenDrag(ui, side, obj.hitPos, obj.linePos, obj.hitPos, that);
									}							
								}
		
							},
							stop:	function() {
								
								that.$el.removeClass('ontop');
//								
//								console.log(parseInt(that.$box1.css('left')));
//								console.log(typeof( that.$box1.css('left')));
//								
//								var box1Left = ( typeof( that.$box1.css('left')) == 'string' ? 0 : parseFloat(  that.$box1.css('left') ));
//								var box1Top = ( typeof( that.$box1.css('top')) == 'string' ? 0 : parseFloat(  that.$box1.css('top') ));
//								
//								var	coordinates	=	{
//									box1:{
//										x: parseFloat(that.$el.css('left'))	 * multiple +	box1Left * multiple,
//										y: parseFloat(that.$el.css('top'))  * multiple + box1Top * multiple
//									},
//									box2:{
//										x: parseFloat(that.$el.css('left'))	 * multiple +	parseFloat(that.$box2.css('left')) * multiple,
//										y: parseFloat(that.$el.css('top'))  * multiple + parseFloat(that.$box2.css('top')) * multiple
//									}
//									
//								};
//								
								
								var	coordinates	=	{
									box1:{
										x: parseFloat(that.$el.css('left'))	 * multiple +	parseFloat(  that.$box1.css('left')) * multiple,
										y: parseFloat(that.$el.css('top'))  * multiple + parseFloat(  that.$box1.css('top')) * multiple
									},
									box2:{
										x: parseFloat(that.$el.css('left'))	 * multiple +	parseFloat(that.$box2.css('left')) * multiple,
										y: parseFloat(that.$el.css('top'))  * multiple + parseFloat(that.$box2.css('top')) * multiple
									}
									
								};								

								that.coordinates = that.model.get('json').data.coordinates =	coordinates;
								
								app.methods.alignToGuide.hideIt();
								
								saveHistory('box drag');
								
							}
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
									border-top: ' + borderTop + 'px solid !important;\
									border-bottom: ' + borderBottom + 'px solid !important;\
									border-left: ' + borderLeft + 'px solid !important;\
									border-right: ' + borderRight + 'px solid !important;\
									border-color: ' + borderColor + ' !important;\
									width: ' + width + 'px !important;\
									height: ' + height + 'px !important;\
						';
					
						str += ( this.getPseudoProp(which, 'top', $dom) != 'auto'  ? 'top: ' + top + 'px !important;' : '' );
						str += ( this.getPseudoProp(which, 'bottom', $dom) != 'auto'  ? 'bottom: ' + bottom + 'px !important;' : '' );
//						str += ( this.getPseudoProp(which, 'left', $dom) != 'auto'  ? 'left: ' + left + 'px !important;' : '' );
//						str += ( this.getPseudoProp(which, 'right', $dom) != 'auto'  ? 'right: ' + right + 'px !important;' : '' );
				
						var styleIs = '\
							<style>\
							.line_' + this.model.cid + ':' + which + '{' + str + '}' +'\
							</style>\
						';
						
						styleIs =  styleIs.replace(/[\n\r]+/g, '');
						styleIs =  styleIs.replace(/\s{2,10}/g, ' ');
					
						this.$el.prepend(styleIs);										
					},
					getPseudoPropX: function( which, property, $dom){
						return window.getComputedStyle(
										$dom[0], ':'+ which
									).getPropertyValue(property);
					},
					
					changeWithGroupyAsResize: function(obj) {
						

						
//						var that = this,
//								preceivedPercentScaled = obj.percentScaled * scale;
//						
//						var left = parseFloat(this.model.get('json').data.coordinates.box1.x),
//								top = parseFloat(this.model.get('json').data.coordinates.box1.y);
//			
//						this.$el.css({
//							left: obj.groupyLeft + ((left * scale - obj.groupyLeft) * obj.percentScaled) + 'px',
//							top: obj.groupyTop + ((top * scale - obj.groupyTop) * obj.percentScaled) + 'px'
//						});
//
//
//						this.$box1.css({
//							left: obj.groupyLeft + ((left * scale - obj.groupyLeft) * obj.percentScaled) + 'px',
//							top: obj.groupyTop + ((top * scale - obj.groupyTop) * obj.percentScaled) + 'px'
//						});
//						
//						this.$box2.css({
//							left: obj.groupyLeft + ((left * scale - obj.groupyLeft) * obj.percentScaled) + 'px',
//							top: obj.groupyTop + ((top * scale - obj.groupyTop) * obj.percentScaled) + 'px'
//						});
//
//						this.setPosition();
//						this.renderLine();
//						this.renderLine();

							//this.scale();
						
					},
					
					changeWithGroupyResizeStop: function(obj) {
			
						var newCoordinates = jQuery.extend(true, {}, this.model.get('json').data.coordinates);
						
						var box1x = this.model.get('json').data.coordinates.box1.x,
								box1y = this.model.get('json').data.coordinates.box1.y,
								box2x = this.model.get('json').data.coordinates.box2.x,
								box2y = this.model.get('json').data.coordinates.box2.y;
											
						this.model.get('json').data.coordinates.box1.x = newCoordinates.box1.x   * obj.percentScaled;
						this.model.get('json').data.coordinates.box1.y = newCoordinates.box1.y   * obj.percentScaled;
						this.model.get('json').data.coordinates.box2.x = newCoordinates.box2.x   * obj.percentScaled;
						this.model.get('json').data.coordinates.box2.y = newCoordinates.box2.y   * obj.percentScaled;
			
						this.scale();
					}
					
				}),
				
				ZagLines: LinesView.extend({

					custom: function() {
						
						var that = this;
						
						this.resize.options.resize = function(event, ui) {
							that.rotateIt.centerRotateHandle();
							that.resizeToGuide( ui );
										
						};
						
						this.resize.options.stop = function(event, ui) {
							that.rotateIt.centerRotateHandle();
							
							that.resizeToGuide( ui );

							saveHistory('save zag  line');
							
						};
						
						this.$zagA = this.$resizeWrapper.find('.zagA');
						this.$zagB = this.$resizeWrapper.find('.zagB');
						this.$zag = this.$resizeWrapper.find('.zag');
						
						this.config();
						
						var midLine = this.model.get('json').data.midLine;
						this.$zagA.css('right', 100 - midLine + '%');						
						this.$zagB.css('left', midLine + '%');
						this.$zag.css('border-color', this.model.get('json').style.line['border-color']);
						this.scaleLine();
					},
					
					scaleLine: function() {
						
						
						var that = this,
								borderWidth = ( 1 * scale >= 1 ? 1 * scale : 1);
						
						this.$clipartDiv.css('border-width', borderWidth + 'px');

					},
										
					editBoxComponents: ['colors', 'layers' ,'lock', 'zag'],
					bindEditHandle: function() {
						
						this.bindHandles.edit = function() {
							
							var that = this;
								
							this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
							
								function(event) {
									
									editbox.view = that;
									
									editbox.whenEditClicked(event);
									
									editbox.methods.colors['one'].label( that );
									
									editbox.methods.zag.label( that );
									
									editbox.methods.layers.setIdxForThisElement();
		
									return false;
									
								}
							);
											
						}
		
					},
					templates:{
			
						zagLines: '\
									<div id="<%= id %>" class="elements noselect" collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<%= html %>\
											<div  class="custom-handle rotate-handle"></div>\
											<div  class="custom-handle zoom-handle"></div>\
											<div  class="custom-handle delete-handle"></div>\
											<div  class="custom-handle edit-handle"></div>\
											<div  class="custom-handle clone-handle"></div>\
										</div>\
									</div>\
								'
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
						var borderWidth = parseFloat(this.getPseudoProp(which, 'border-width', $dom))  * scale;
						var borderColor = $dom.css('border-color');
			
						var str = '\
									border-width: ' + borderWidth + 'px !important;\
									width: ' + width + 'px !important;\
									height: ' + height + 'px !important;\
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
						

						console.log(which + ' ::  ' + styleIs);
			
						this.$el.prepend(styleIs);										
					},
			
					getPseudoProp: function( which, property, $dom){
						return window.getComputedStyle(
										$dom[( which == 'before' ? 0 : 1)], ':'+ which
									).getPropertyValue(property);
					}
					
				}),
				
			},
			Panel:  PanelBase.extend({
						
				initialize: function(options) {
					this.addOptions(options);
					
					this.id = 0;
					this.setEl();	
					
					this.render();
					
					this.bind.click.call( this );
					
					this.bind.contextMenu.call( this );
					
					this.bind.drop.call( this );
					
					if(serverhost != 'localhost') this.bind.dropzone.call( this );
					
					this.bind.track.call( this );
					
					this.bind.guideLines.init.call( this );
					
				},
				
				drop:{

					createAndAddModel: function(json, makeClone, fromwhere) {
						
//						if( typeof( fromwhere ) != 'undefined') console.log(fromwhere);
						
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

						this.$el.append(html);
						
						view.setEl();
						
						view.alignIsDisabled = false;
						
						if(typeof( model.get('json').data.isLocked) != 'undefined'){
							view.$el.addClass('locked');
							view.$el.appendTo('.panel-wrapper');
						}
												
						if( typeof( view.$resizeWrapper) != 'undefined' && app.stubs.hasGrid ) {
							view.$resizeWrapper.addClass('reveal');
						}
						
						view.resize = {
							init: function() {
								
								this.resize.bind.call( this );
							},
							bind: function() {	
								this.$resizeWrapper.resizable( this.resize.options );
							},				
							options: {
								handles: 'n, w, s, se, e',
				        create: function (event, ui) {
			        		// http://stackoverflow.com/questions/15902920/resizing-an-element-triggers-the-resize-event-of-the-window
			            $(this).parent().on('resize', function (e) {
			                e.stopPropagation();
			            });
				        }
							}
						};
						
						this.drop.bindElement.call( this );


						if( app.stubs.saveHistoryEnabled ){ // Only reorder z-index when dropping for the first time and not doing an import
							
							view.model.get('json').style.element['z-index'] = 99999999;
							editbox.methods.layers.redoLayers();
							view.$el.click();							
						} 
						
					},
					
					bindElement: function() {
						
						this.view.custom();
						this.view.fillLockedContainer();
						this.view.storeOffset();
						
						if( !tools.inArray(this.view.collection, app.settings.canSaveImageToCloudDrive)){
							saveHistory('panel drop bindElement');
						}
						
					},

				},
								
				setPanelPosition: function() {
					
					this.panelLeft = this.$panelWrapper.offset().left,
					this.panelTop = this.$panelWrapper.offset().top,
					this.panelBottom = this.panelTop + this.$panelWrapper.height(),
					this.panelRight = this.panelLeft + this.$panelWrapper.width();
					
				},
								
				bind: {
					
					guideLines: {
						
						init: function() {
							this.setPanelPosition.call( this );
							this.bind.guideLines.drag.call( this );
						 	this.bind.guideLines.drop.call( this );
						},
						
						setGuideOptions: function() {
							
							var that = this;
							
							this.guideOptions = {
								'horizontal': {
									grid: [ 
										app.settings.gridSpacing * scale, 
										app.settings.gridSpacing * scale 
									]	
								},
								'vertical': {
									grid: [ 
										app.settings.gridSpacing * scale, 
										app.settings.gridSpacing * scale 
									]	
								}	
							};

							this.guideOptions['horizontal']['axis'] = "y";
							this.guideOptions['horizontal']['stop'] = function(e, ui) {
								var posY = ui.position.top,
										model = app.stubs.collections.guides.get($(this).attr('id'));
								if(  posY > that.$panelWrapper.height()  || posY < 0) {
									$(this).remove();
									app.stubs.collections.guides.remove(model);
								}
								model.get('json').line.pos.y = posY * multiple;
							};
							
				    		
							this.guideOptions['vertical']['axis'] = "x";
							this.guideOptions['vertical']['stop'] = function(e, ui) {
								var posX = ui.position.left,
										model = app.stubs.collections.guides.get($(this).attr('id'));
								if( posX > that.$panelWrapper.width() || posX < 0) {
									$(this).remove();
									app.stubs.collections.guides.remove(model);
								}
								model.get('json').line.pos.x = posX * multiple;
							};
							
							
						},
						
						drag: function() {
							var obj = {
								opacity: .5,
								helper: "clone",
								zIndex:	9999999
							}
							
							obj['axis'] = "x";
							obj['start'] = function(e, ui) {;
								$(ui.helper).addClass("vertical-guide drag-item guide-line");
							};
							
							$('#align-guide-vertical').draggable(obj);
							
							obj['axis'] = "y";
							obj['start'] = function(e, ui) {;
								$(ui.helper).addClass("horizontal-guide drag-item guide-line");
							};
							
							$('#align-guide-horizontal').draggable(obj);
						},
						
						drop: function() {
							
							var that = this;
							
							this.$panelWrapper.droppable({
									accept: ".align-guide",
									drop:	function(	event, ui	)	{

							    	var panelView = app.stubs.views.panels['panel_0'],
							    			json = { line: {} };
												
							    	if( tools.inArray('horizontal-guide', event.srcElement.classList)) {
							    		var top = ui.position.top;
							    		
							    		json.line.type = 'horizontal';
							    		
							    		var yDropped = top * multiple,
							    				gridSpaces = (yDropped/app.settings.gridSpacing) - (yDropped/app.settings.gridSpacing % 1),
							    				snapY = gridSpaces * app.settings.gridSpacing;
							    		
							    		json.line.pos = {
							    			x: 0,
							    			y: snapY
							    		}

						 					that.bind.guideLines.addModelAndRender.call( that, json);

							    	}
							    	
							    	if( tools.inArray('vertical-guide', event.srcElement.classList)) {
							    		
							    		var left = ui.position.left;
							    		json.line.type = 'vertical';
							    		
							    		
							    		var xDropped = left * multiple,
							    				gridSpaces = (xDropped/app.settings.gridSpacing) - (xDropped/app.settings.gridSpacing % 1),
							    				snapX = gridSpaces * app.settings.gridSpacing;
							    		
							    		json.line.pos = {
							    			x: snapX,
							    			y: 0
							    		}							    		
								    	
								    	that.bind.guideLines.addModelAndRender.call( that, json);
											
							    	}
							    	
							    }
							});	
						},
						
						addModelAndRender: function( json ) {

							var that = this,
									guide = document.createElement('div'),
									model = new models.GuideModel();
		
							model.set('json', json);
							app.stubs.collections.guides.add(model);
							
							this.bind.guideLines.setGuideOptions.call( this);
							
							if( json.line.type == 'horizontal'){
								
								var top = json.line.pos.y * scale;
								
								guide.className = 'horizontal-guide guide-line';
				    		guide.style.top = top + 'px';
				    		
				    		this.$panelWrapper.append(guide);
				    		$(guide).attr('id', model.cid);
					
								
							} else{
								
								var left = json.line.pos.x * scale;
								
				    		guide.className = 'vertical-guide guide-line';
				    		guide.style.left = left + 'px';
				    		this.$panelWrapper.append(guide);
				    		$(guide).attr('id', model.cid);

							}
							
			    		$(guide).draggable(this.guideOptions[json.line.type]);
			    		
			    		if( app.stubs.hasGrid ){
			    			$(guide).show();
			    		}
						},


						addModelAndRender_old: function( json ) {
							
							var that = this,
									guide = document.createElement('div'),
									obj = {grid: [ app.settings.gridSpacing * scale, app.settings.gridSpacing * scale ]},
									model = new models.GuideModel();
									
							model.set('json', json);
							app.stubs.collections.guides.add(model);
							
							if( json.line.type == 'horizontal'){
								
								var top = json.line.pos.y * scale;
								
								guide.className = 'horizontal-guide guide-line';
				    		guide.style.top = top + 'px';
				    		
				    		this.$panelWrapper.append(guide);
				    		$(guide).attr('id', model.cid);
					    		
								obj['axis'] = "y";
								obj['stop'] = function(e, ui) {
									var posY = ui.position.top,
											model = app.stubs.collections.guides.get($(guide).attr('id'));
									if(  posY > that.$panelWrapper.height()  || posY < 0) {
										$(guide).remove();
										app.stubs.collections.guides.remove(model);
									}
									model.get('json').line.pos.y = posY * multiple;
								};								
								
							} else{
								
								var left = json.line.pos.x * scale;
								
				    		guide.className = 'vertical-guide guide-line';
				    		guide.style.left = left + 'px';
				    		this.$panelWrapper.append(guide);
				    		$(guide).attr('id', model.cid);
				    		
								obj['axis'] = "x";
								obj['stop'] = function(e, ui) {
									var posX = ui.position.left,
											model = app.stubs.collections.guides.get($(guide).attr('id'));
									if( posX > that.$panelWrapper.width() || posX < 0) {
										$(guide).remove();
										app.stubs.collections.guides.remove(model);
									}
									model.get('json').line.pos.x = posX * multiple;
								};
								
							}
							
			    		$(guide).draggable(obj);
			    		
			    		
			    		if( app.stubs.hasGrid ){
			    			$(guide).show();
			    		}
						},

					
						get: {
							xArr: function() {
								var xs = [];	
								for( var idx in app.stubs.collections.guides.models) {
									if( app.stubs.collections.guides.models[idx].get('json').line.type == 'horizontal') continue;
									xs.push( app.stubs.collections.guides.models[idx].get('json').line.pos.x );
								}
								return xs;
							},
							yArr: function() {
								var ys = [];	
								for( var idx in app.stubs.collections.guides.models) {
									if( app.stubs.collections.guides.models[idx].get('json').line.type == 'vertical') continue;
									ys.push( app.stubs.collections.guides.models[idx].get('json').line.pos.y );
								}
								return ys;	
							}
						}
						
					},
					
					contextMenu: function() {
						
						return;
						
						if (this.$el[0].addEventListener) {
				        this.$el[0].addEventListener('contextmenu', function(e) {
				        	
				        	console.log(e.screenX);
				        	console.log(e.screenY);
				            
				            e.preventDefault();
				            
				        }, false);
				    } else {
				        this.$el[0].attachEvent('oncontextmenu', function(e) {
				        	  toast("B: You've tried to open context menu");
				            window.event.returnValue = false;
				        });
				    }
						
					},
					
					click: function() {
						this.$el.on('click', function() {
							app.methods.clearActive(['previewOn', 'disableGroupy', 'emptyGrouped', 'exitEditText', 'stillRotating', 'removeGroupyClones',  'removeSpot', 'removeSnack', 'removeToast'], 'exclude', 'panel is clicked');
							return false;
						});
						
					},
				
					dropzone: function() {
						
						var done = function(message) {
									if(  typeof( message ) != 'undefined' ) console.log(message);
									console.log('test test');
								}
					
					  var that = this,
					  		canDragLeave = true,
					  		myDropzone = new Dropzone('.dropzone', {
					  			doOnce: false,
					  			dragover: function(e) {
					  				if( !app.stubs.dropzoneDoOnce){
					  					app.stubs.dropzoneDoOnce = true;
											var tempImg = new Image();
											tempImg.id = 'cloudUploadImg';
											tempImg.src = 'img/uploadCloud.png';
											$('#canvas').append(tempImg);
											$('#cloudUploadImg').addClass('animated tada infinite');
											$('.elements').addClass('make-blur');
											$('.dropzone').css('background', '#FCFCDF');
										}
					  			},
					  			dragleave: function(e) {
					  				app.stubs.dropzoneDoOnce = false;
					  				$('.dropzone').css('background', 'transparent');
					  				$('#cloudUploadImg').remove();
					  				$('.elements').removeClass('make-blur');		
					  			},
						  		url: "image/getSrcFromThisImage",
						  		maxFilesize: 10, // MB,
						  		acceptedFiles: '.png, .jpeg, .jpg, .svg, .gif',
								  accept: function(file, done ){
								  	
								    if (file.name == "justinbieber.jpg") {
								      done("Naha, you don't.");
								    }
								    else { done(); }
								  },
						  		/*,
						  		maxFiles: 5,
						  		maxfilesreached: function() {
						  			toast('Maximum concurrent file upload reached.', 'keep', false, 'info', 'Opps');
						  		}*/
						  		error: function(foo, bar) {
						  			toast('You can not upload this type of file.', 'keep', 5000, 'error', 'Something went wrong.');
					  				app.stubs.dropzoneDoOnce = false;
					  				$('.dropzone').css('background', 'transparent');
					  				$('#cloudUploadImg').remove();
					  				$('.elements').removeClass('make-blur');	
						  		},
						  		processing: function() {
						  			$('.dropzone').css('background', 'transparent');
						  			app.methods.loading.locked = false;
						  			app.methods.loading.on();
						  			$('#cloudUploadImg').remove();
						  		},
						  		complete: function() {
						  			app.methods.loading.off('A');
						  			app.methods.loading.locked = false;						  			
						  		},
						  		success: function(file, obj) {
						  			
						  			obj = $.parseJSON(obj);

										var json = app.methods.createNewJson(obj);
										
						  			if( typeof( obj.base64Data ) != 'undefined'){
						  				json.collection = 'photos';
						  				json.data.base64 = obj.base64Data;
						  			}else{
						  				json.collection = 'svg';
						  				json.data.svg = obj.svg.replace(/"/g, "&quot;");
						  			};

										that.drop.createAndAddModel.call( that, json, undefined, 'AA');
								  },
						  		addedfile: function(file) {
								  },
								  parallelUploads: true,
								  clickable: false
						  	});
						
					},	
									
					drop: function() {
					
						var that = this;
						
						this.$el.droppable({
								accept:	".thumb",
								hoverClass:	"ui-state-active",
								over:	function (event, ui) { },
								out: function(event, ui)	{ },
								drop:	function(	event, ui	)	{

									var	$thumb = $(ui.draggable.context),
											cid = $thumb.attr('cid'),
											collection = $thumb.attr('collection'),
											left = ui.offset.left	-	$(this).offset().left,
											top = ui.offset.top	-	$(this).offset().top,
											json = app.methods.generateJsonFromGraphicModel( collection, left, top, false, cid);
											json.justDropped = true;
									
									if( app.methods.hasWidget(collection)){
										
											app.methods.widgets.route(json);
										
									}else{
										
										if( tools.inArray( json.collection, app.settings.hasShapes)||
										 		json.collection == 'straights' ){ 
											//delete json.justDropped;
										}
										
										that.drop.createAndAddModel.call( that, json, undefined, 'BB');
									};
								}
						});
					},
					
					track: function() {

						var	that = this,
								grabmove = false,
								$selection = $('<div>').addClass('selection-box');
								
//						this.$el[0].addEventListener('contextmenu', function(ev) {
//						    ev.preventDefault();
//						    return false;
//						}, false);
								
						this.$el.on('mousedown',	function (e, ui) {

							var boxStyle,
									getMouseDirection	=	function(	e, $this)	{
										var	move_x = e.pageX - $this.offset().left,
												move_y = e.pageY - $this.offset().top;
								
										if(	move_x > click_x){
											var	mouseDirection = 'right';
										}else{
											var	mouseDirection = 'left';
										}
								
										if(	move_y > click_y ){
											mouseDirection +=	'Down';
										}else{
											mouseDirection +=	'Up';
										}
										return mouseDirection;
									};				
									
							if( e.button == 2 || e.ctrlKey) {
								
								grabmove = true;  // http://codepen.io/JTParrett/pen/rkofB
								app.stubs.mainCanScroll = true;
									
								app.stubs.clickedMousPosX = e.pageX;
								app.stubs.clickedMousPosY = e.pageY;
								
								app.stubs.mainCurScollX = $('#main').scrollLeft();
								app.stubs.mainCurScollY = $('#main').scrollTop();
								
							} else{

								var	click_x	=	 e.pageX - $(this).offset().left,
										click_y	=	 e.pageY - $(this).offset().top;
								
								app.methods.clearActive(['transferClonedStylesToElements'], 'include', 'panel track mousedown 1');
								app.methods.clearActive(['previewOn', 'removeToast'], 'exclude', 'panel track mousedown 2');
	
								$selection.css({
										'top': click_y,
										'left':	click_x,
										'width': 0,
										'height':	0
								});
								
								that.$el.append($selection);
								
							}
			
							that.$el
							.on('mousemove', function	(e)	{	 //	MOUSE	MOVING **************
								
									if(grabmove === true) {
										
										app.methods.scrollMain($(this), e.pageX, e.pageY);
										
										return false;
									}
									
									var	move_x = e.pageX - $(this).offset().left,
											move_y = e.pageY - $(this).offset().top,
											width	=	Math.abs(move_x	-	click_x),
											height = Math.abs(move_y - click_y),
											new_x, new_y;
	
									new_x	=	(move_x	<	click_x) ? (click_x	-	width) : click_x;
									new_y	=	(move_y	<	click_y) ? (click_y	-	height)	:	click_y;
	
									boxStyle ={
											'left':	new_x,
											'top': new_y,
											'width': width,
											'height':	height
									};
	
									$selection.css(boxStyle);
	
									var	mouseDirection = getMouseDirection(	e, $(this));
	
									that.selectElementsInBox(	boxStyle,	mouseDirection );
	
									return false;
	
							}).on('mouseleave', function	(e)	{	 //	MOUSE	UP **************
								
								//app.stubs.grouped = [];
								grabmove = false;
								$selection.remove();
								that.$el.off('mousemove');
								that.$el.off('mouseup');
								$('.elements').removeClass('insideSelectBox');
								$(this).css('cursor',	'default');
							})
							.on('mouseup', function	(e)	{	 //	MOUSE	UP **************
									
									// $('.elements').removeClass('hiding');
									grabmove = false;
									var	mouseDirection = getMouseDirection(	e, $(this));
	
									that.selectElementsInBox(	boxStyle,	mouseDirection);
									
									$('.elements').removeClass('insideSelectBox');
	
									that.$el.off('mousemove');
									that.$el.off('mouseup');
									$selection.remove();
									$(this).css('cursor',	'default');

									var disableMoreThanOneRule = false;
									app.methods.groupyBox.init(0, disableMoreThanOneRule);
									
									return false;
							});
	
							if(grabmove === true){
								$(this).css('cursor',	'-webkit-grab');
							}else{
								$(this).css('cursor',	'crosshair');
							};
							

							return false;
		
						});
								
					}
					
				},
				
				selectElementsInBox: function( boxStyle, mouseDirection	)	{
	
					app.stubs.grouped = [];
	
					// $('.elements').removeClass('grouped	hideHandles');
	
					var	that = this;
					
					$('.elements').removeClass('insideSelectBox');
					
					this.$el.find('.elements:not(.locked)').each(
	
						function() {
	
							var	id = $(this).attr('id'),
									$selector	=	( $('#'+ id).hasClass('dynoline') ? $('#'+ id) : $('#'+ id).find('.resize-wrapper')),
									elementStyle = $selector.getStyleObject(),
									$panel = $selector.parent();
	
							if(typeof(boxStyle)	== 'undefined')	return;
	
							var	boxLeft	=	boxStyle.left,
									boxTop = boxStyle.top,
									boxWidth = boxStyle.width,
									boxHeight	=	boxStyle.height,
									boxRight = boxStyle.left + boxWidth,
									boxBottom	=	boxStyle.top + boxHeight;
									
							if(	$(this).hasClass('dynoline') ){ 
								
								return;
	
								var	$box1	=	$($selector.find('.box')[0]);
								var	$box2	=	$($selector.find('.box')[1]);
	
								var	box1Left = $box1.offset().left - $panel.offset().left,
										box1Top	 = $box1.offset().top	-	$panel.offset().top,
										box2Right	=	($box2.offset().left + $box2.width())	-	$panel.offset().left,
										box2Bottom	=	($box2.offset().top	+	$box2.height())	-	$panel.offset().top;
	
								var	elementLeft	=	box1Left,
										elementTop = box1Top,
										elementRight = box2Right,
										elementBottom	=	box2Bottom;
	
							}else{
								
								var panelLeft = $('#panel_0').offset().left,
										panelRight = panelLeft + $('#panel_0').width(),
										panelTop = $('#panel_0').offset().top,
										panelBottom = panelTop + $('#panel_0').height(),
										selector = $selector[0],
										boundingBox = selector.getBoundingClientRect(),
										elementLeft	=	 boundingBox.left - panelLeft,
										elementTop = boundingBox.top - panelTop,
										elementWidth = boundingBox.width,
										elementHeight	=	boundingBox.height,
										elementRight = elementLeft + elementWidth,
										elementBottom	=	elementTop + elementHeight;								

							}
	
	
							var	elementInside	=	false;
	
							switch(	mouseDirection ){
								case 'rightDown':
									if(
										boxRight >=	elementLeft	&&
										boxBottom	>= elementTop	&&
										boxTop <=	elementBottom	&&
										boxLeft	<= elementRight
									){
										elementInside	=	true;
									}
								break;
								case 'leftDown':
									if(
										boxLeft	<= elementRight	&&
										boxBottom	>= elementTop	 &&
										boxTop <=	elementBottom	&&
										boxRight >=	elementLeft
									){
										elementInside	=	true;
									}
								break;
								case 'leftUp':
									if(
										boxLeft	<= elementRight	&&
										boxTop <=	elementBottom	&&
										boxBottom	>= elementTop	&&
										boxRight >=	elementLeft
									){
										elementInside	=	true;
									}
								break;
								case 'rightUp':
									if(
										boxRight >=	elementLeft	&&
										boxTop <=	elementBottom	&&
										boxBottom	>= elementTop	&&
										boxLeft	<= elementRight
									){
										elementInside	=	true;
									}
								break;
							}
	
							if(	elementInside	&& elementStyle.display	!= 'none'){
									$(this).addClass('insideSelectBox	hideHandles');
									app.stubs.grouped.push(id);
							}
							
							//$('#foo').html(JSON.stringify( app.stubs.grouped))
	
							// app.methods.enableGroupButtons.init.call( app);
	
						}
	
					);
					

					app.stubs.copyGroup = app.stubs.grouped.slice();
	
					// tools.addRemoveMethodToArray(	app.stubs.grouped );
				},
				
				template: '\
					<div  class="panel-wrapper dropzone">\
						<div  id="<%= id %>"  class="panels" panel_idx="<%= panel_idx %>">\
						</div>\
						<div id="align-guide-vertical"  class="align-guide vertical-guide">\
						</div>\
						<div id="align-guide-horizontal" class="align-guide horizontal-guide" >\
						</div>\
					</div>\
				'
			}),	
			leftMenu: {
				Card: BackView.extend({
					initialize: function(options) {
						this.addOptions(options);
						this.render();
					},
					render: function() {

						var	subcardsHtml = '';
	
						if(typeof( this.subcards ) != 'undefined'){
							for( var idx in this.subcards){
								
								var subcardObj = this.subcards[idx];
								
								if(typeof(subcardObj.hasTags) != 'undefined'){
									var subcardView = new views.leftMenu.SubcardTagsViewBackView(subcardObj)
								} else{
									var subcardView = new views.leftMenu.SubcardFixedViewBackView(subcardObj) 
								}
								subcardsHtml += subcardView.getHtml();
								
							}
						}
						
						this.options.subcardsHtmls = subcardsHtml;
						
						var cardHtml = _.template( this.template, this.options);
						
						$('#collapse-card-container').append(cardHtml);		
						
					},
					template: '\
			      <div id="<%=	id	%>"class="collapse-card sub-card-container">\
			          <div class="title">\
			              <i><img src="<%=	iconSrc	%>" /></i>\
			              <span></span>\
			              <span><%=	title	%></span>\
			          </div>\
			          <div class="body">\
			          	<%=	subcardsHtmls	%>\
			          </div>\
			      </div>\
					'
				}),
				SubcardTagsViewBackView: SubcardsBackView.extend({
					template: '\
              <div  id="<%=	id	%>"  class="sub-card hasTags">\
              	<div  class="sub-card-title" >\
              		<img src="img/search-icon.svg"   style="max-width:15px;max-height:15px"  >&nbsp;&nbsp;<%=	title	%>\
              	</div>\
              	<div  class="search-container">\
              		<div class="search-field-container">\
										<form class="search-form navbar-form navbar-left">\
											<div  class="picserver-logo"  collection="<%=	collection	%>" >\
											</div>\
											<input type="text" class="form-control col-lg-8" placeholder="   Find">\
										</form>\
              		</div>\
              		<div thumbtype="<%=	thumbtype	%>" collection="<%=	collection	%>" class="search-result-container <%=	externalSearch	%>">\
              		</div>\
              	</div>\
              </div>\
						'
				}),
				SubcardFixedViewBackView: SubcardsBackView.extend({
					template: '\
              <div  id="<%=	id	%>"  class="sub-card">\
              	<div  class="sub-card-title" >\
              		<%=	title	%>\
              	</div>\
              	<div  class="search-container">\
              		<div thumbtype="<%=	thumbtype	%>" collection="<%=	collection	%>" class="search-result-container">\
              		</div>\
              	</div>\
              </div>\
						'
				}),
				Maxcard: {}	
			}	

		};
		
		views.elements.Richtext = views.elements.Richtext.extend( shared.richtext );
		
	    return function() {
				
				var app = this;
				
				this.init = function()	{

					this.methods.injectBodyDom(
						function() {
							
							tools.cookies.deleteCookie('refreshSidebarFiles');

							$('body').append('\
								<div  id="main"  class="transition1s">\
									<div  id="canvas-wrapper" class="transition3s" >\
										<div  id="canvas" >\
										</div>\
									</div>\
								</div>\
							');
							
							tools.cookies.deleteCookie('stopPollRefresh');
							tools.cookies.deleteCookie('pollRefresh');
							app.methods.dim.set();
							app.activatePlugins();
							app.methods.snack();
							app.methods.toast();
							app.methods.createCollections();
							app.methods.changeCanvasShape();
							app.stubs.zoom.idx = app.menu.resize.getBestIdx();
							app.menu.resize.setGlobalScale();
							app.menu.resize.makeChange();
							app.methods.activate.init();
							app.methods.setGlobals();
							app.methods.revert.saveHistory('start fresh');
							window.onbeforeunload = app.methods.cleanUpOnExit
							app.stubs.recentlySaved = true;
							app.methods.groupyBox.bind.init();
							app.methods.setCanvasTop();
							app.methods.windowResize();
							app.methods.disableDropImage();
							
							//app.methods.ensureAbandomB4Save();
							app.methods.loading.init();
							app.methods.modal.init();

							app.stubs.google_id = window.google_id;
							app.stubs.pictoFolderId = window.pictoFolderId;
							
							app.methods.determineWhichFileIdToRetrieveInCaseUserRefreshesAfterASave();
							
							
							if( app.stubs.fileId != 'false' && typeof( app.stubs.fileId ) != 'undefined'){
								app.methods.open();
							} else if( typeof( template_id ) != 'undefined'){
								app.methods.open();
							} else if(  typeof( Windows) != 'undefined'  ){  // UWP version

								app.methods.clearCanvas('no save');
								$('#load-screen').show();
								$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').addClass('make-blur');


								tools.doWhenReady( 
									function() {
			
										if(  Object.keys(app.stubs.svgmap).length > 0 ) return true
										else return false
											
									},
									function() {
										
										app.methods.autosave.retrieve( function() {
											$('#load-screen').hide();
											$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').removeClass('make-blur');
											app.methods.widgets.google.authenticate();
										});
						        
									},
									'when svgmap is done'
								);


							}else{
								
							
								if( typeof( tools.urlGet('new_width') ) == 'string' ){
									app.stubs.curPaperShape.pageSize = 'custom';
									app.stubs.curPaperShape.pageSizeCustom.width = tools.urlGet('new_width');
									app.stubs.curPaperShape.pageSizeCustom.height = tools.urlGet('new_height');									
																		
								};
								
								app.methods.activate.canvas();
								app.methods.widgets.google.authenticate();
							}
							
							if( status_id != 5){
								if( parseInt(howManyDaysLeft) == 0 ){
									toast('Your subscription will expire at the end of today.  Go to accounts settings for details.', 'keep', 13000, 'info', 'Note.');							
								} else if( parseInt(howManyDaysLeft) == 1) {
									toast('Your subscription will expire tomorrow.  Go to accounts settings for details.', 'keep', 13000, 'info', 'Note.');								
								} else if( parseInt(howManyDaysLeft) < 5 && parseInt(howManyDaysLeft) > 0){
									toast('Your subscription will expire in ' + parseInt(howManyDaysLeft) + ' days.  Go to accounts settings for details.', 'keep', 13000, 'info', 'Note.');								
								};								
							};

							app.methods.showOrNotWelcome();
							
							if( !isSocial){
								$('#shareLi').hide();
							};

							
							setTimeout(function(){
													
								$('#nav-top').css('overflow', 'visible');
								
								if( tools.detectEdge() ) $('body').addClass('edge_browser');
								
								
				// work
				if( !tools.detectIE() && serverhost != 'localhost' ){	
				    var _rollbarConfig = {  // rollbar
				    accessToken: "0b1791ed9ffd46e2b73774c035f1712e",
				    captureUncaught: true,
				    payload: {
				        environment: "test"
				    }
				};
				!function(r){function e(t){if(o[t])return o[t].exports;var n=o[t]={exports:{},id:t,loaded:!1};return r[t].call(n.exports,n,n.exports,e),n.loaded=!0,n.exports}var o={};return e.m=r,e.c=o,e.p="",e(0)}([function(r,e,o){"use strict";var t=o(1).Rollbar,n=o(2);_rollbarConfig.rollbarJsUrl=_rollbarConfig.rollbarJsUrl||"https://d37gvrvc0wt4s1.cloudfront.net/js/v1.9/rollbar.min.js";var a=t.init(window,_rollbarConfig),i=n(a,_rollbarConfig);a.loadFull(window,document,!_rollbarConfig.async,_rollbarConfig,i)},function(r,e){"use strict";function o(r){return function(){try{return r.apply(this,arguments)}catch(e){try{console.error("[Rollbar]: Internal error",e)}catch(o){}}}}function t(r,e,o){window._rollbarWrappedError&&(o[4]||(o[4]=window._rollbarWrappedError),o[5]||(o[5]=window._rollbarWrappedError._rollbarContext),window._rollbarWrappedError=null),r.uncaughtError.apply(r,o),e&&e.apply(window,o)}function n(r){var e=function(){var e=Array.prototype.slice.call(arguments,0);t(r,r._rollbarOldOnError,e)};return e.belongsToShim=!0,e}function a(r){this.shimId=++c,this.notifier=null,this.parentShim=r,this._rollbarOldOnError=null}function i(r){var e=a;return o(function(){if(this.notifier)return this.notifier[r].apply(this.notifier,arguments);var o=this,t="scope"===r;t&&(o=new e(this));var n=Array.prototype.slice.call(arguments,0),a={shim:o,method:r,args:n,ts:new Date};return window._rollbarShimQueue.push(a),t?o:void 0})}function l(r,e){if(e.hasOwnProperty&&e.hasOwnProperty("addEventListener")){var o=e.addEventListener;e.addEventListener=function(e,t,n){o.call(this,e,r.wrap(t),n)};var t=e.removeEventListener;e.removeEventListener=function(r,e,o){t.call(this,r,e&&e._wrapped?e._wrapped:e,o)}}}var c=0;a.init=function(r,e){var t=e.globalAlias||"Rollbar";if("object"==typeof r[t])return r[t];r._rollbarShimQueue=[],r._rollbarWrappedError=null,e=e||{};var i=new a;return o(function(){if(i.configure(e),e.captureUncaught){i._rollbarOldOnError=r.onerror,r.onerror=n(i);var o,a,c="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(o=0;o<c.length;++o)a=c[o],r[a]&&r[a].prototype&&l(i,r[a].prototype)}return e.captureUnhandledRejections&&(i._unhandledRejectionHandler=function(r){var e=r.reason,o=r.promise,t=r.detail;!e&&t&&(e=t.reason,o=t.promise),i.unhandledRejection(e,o)},r.addEventListener("unhandledrejection",i._unhandledRejectionHandler)),r[t]=i,i})()},a.prototype.loadFull=function(r,e,t,n,a){var i=function(){var e;if(void 0===r._rollbarPayloadQueue){var o,t,n,i;for(e=new Error("rollbar.js did not load");o=r._rollbarShimQueue.shift();)for(n=o.args,i=0;i<n.length;++i)if(t=n[i],"function"==typeof t){t(e);break}}"function"==typeof a&&a(e)},l=!1,c=e.createElement("script"),d=e.getElementsByTagName("script")[0],p=d.parentNode;c.crossOrigin="",c.src=n.rollbarJsUrl,c.async=!t,c.onload=c.onreadystatechange=o(function(){if(!(l||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)){c.onload=c.onreadystatechange=null;try{p.removeChild(c)}catch(r){}l=!0,i()}}),p.insertBefore(c,d)},a.prototype.wrap=function(r,e){try{var o;if(o="function"==typeof e?e:function(){return e||{}},"function"!=typeof r)return r;if(r._isWrap)return r;if(!r._wrapped){r._wrapped=function(){try{return r.apply(this,arguments)}catch(e){throw e._rollbarContext=o()||{},e._rollbarContext._wrappedSource=r.toString(),window._rollbarWrappedError=e,e}},r._wrapped._isWrap=!0;for(var t in r)r.hasOwnProperty(t)&&(r._wrapped[t]=r[t])}return r._wrapped}catch(n){return r}};for(var d="log,debug,info,warn,warning,error,critical,global,configure,scope,uncaughtError,unhandledRejection".split(","),p=0;p<d.length;++p)a.prototype[d[p]]=i(d[p]);r.exports={Rollbar:a,_rollbarWindowOnError:t}},function(r,e){"use strict";r.exports=function(r,e){return function(o){if(!o&&!window._rollbarInitialized){var t=window.RollbarNotifier,n=e||{},a=n.globalAlias||"Rollbar",i=window.Rollbar.init(n,r);i._processShimQueue(window._rollbarShimQueue||[]),window[a]=i,window._rollbarInitialized=!0,t.processPayloads()}}}}]);
				
				}				

							}, 1000);
							

							tools.doWhenReady( function() {
								if( typeof( app.stubs.collections.elements) != 'undefined' && 
										app.stubs.collections.elements.length > 0 &&
										app.stubs.collections.elements.length == $('.elements').length
								) return true
								else return false
							},
							function() {
								app.methods.ready();
							}, ' readying at last ');
							
							
							
							tools.doWhenReady( function() {
								if( typeof( google.visualization) != 'undefined' && 
										typeof( google.visualization.PieChart) != 'undefined' ) return true
								else return false
							},
							function() {
								app.menu.init();
							}, ' readying at last ');							
						}
					);

				};				
				
				this.methods = {
					
					showOrNotWelcome: function() {

						//if( window.isInOrganization ){
						if( window.isOrgAdmin == 1 ){
							
							if( window.isOrgAdmin == 1){
								if( typeof( window.orgAcceptTerms) != 'undefined' && window.orgAcceptTerms == 1){
									if( typeof( tools.urlGet('popSetupModal') ) == 'string' )  app.methods.account.init();
								} else{
									app.methods.account.init();
								};
							}else{

								if( !window.accountActive){
									app.methods.account.init();
								};	
																
							};
							
							$('#addon-li').hide();
																
						}else{
							
							if( !window.accountActive){
								app.methods.account.init();
							};									
							
						};
						

					},

					scrollMain: function( $this, movingMousPosX, movingMousPosY) {
						
						if(!app.stubs.mainCanScroll) return;
						
						app.methods.clearActive(['previewOn', 'clearActiveCid'], 'exclude', 'scrollMain grabmove');
						
						$this.css('cursor',	'-webkit-grabbing');
						
						var	changeX = movingMousPosX - app.stubs.clickedMousPosX,
								changeY = movingMousPosY - app.stubs.clickedMousPosY,
								scrollMainToX = ( app.stubs.mainCurScollX - changeX > 0 ? app.stubs.mainCurScollX - changeX: 0),
								scrollMainToY = ( app.stubs.mainCurScollY - changeY > 0 ? app.stubs.mainCurScollY - changeY: 0);										
						
						var changObj = {
							changeX: changeX,
							changeY: changeY,
							mainCurScollX: app.stubs.mainCurScollX,
							mainCurScollY: app.stubs.mainCurScollY,
							scrollMainToX: scrollMainToX,
							scrollMainToY: scrollMainToY
						};
								
						// console.log(JSON.stringify(   changObj  , null, 2 ));
						
						document.getElementById('main').scrollLeft = scrollMainToX;
						document.getElementById('main').scrollTop = scrollMainToY;
						
					},
						
					loadToDoQueue: function( doWhat ) {
						
						app.stubs.doQueue.push(doWhat);

					},
					
					unloadToDoQueue: function() {
						
						if( app.stubs.doQueue.length == 0 ) return;
						
						app.methods.progressBar.start();
						
						app.methods.doInterval = setInterval( function() {
							console.log('11057 - looping setInterval - doQueue.length :' + app.stubs.doQueue.length);
							if( !app.stubs.dobusy){
						    app.stubs.doWhat = app.stubs.doQueue.shift();
						    app.stubs.dobusy = true;
						    if( typeof(app.stubs.doWhat ) != 'undefined'){
							    app.stubs.doWhat( function() {
							    	app.stubs.dobusy = false;
							    });						    	
						    }else if( app.stubs.doQueue.length == 0){
						    	if( !app.stubs.saving )app.methods.progressBar.stop('unloadToDoQueue');
						    	clearInterval(app.methods.doInterval);
						    	setTimeout(function(){
							    	app.stubs.renderingPNGforHeaders = false;
							    	//console.log('renderingPNGforHeaders is now false');
							    	app.stubs.dobusy = false;						    		
						    	}, 500);

						    }			
							};		    							
						}, 500);
				    
					},	
					
					groupyBox: {
						
						left: null,
						top: null,
						bottom: null,
						right: null,
						
						init:	function(	panel_idx, disableMoreThanOneRule) {
							
							this.disableAlign = false;
							$('#disable-align-input').prop('checked', false);
							
							var grouped = app.stubs.grouped;

							if( grouped.length > ( disableMoreThanOneRule ? 0 : 1) )	{

								this.getEdges(grouped);
	
								$('#groupy').removeClass('disappear').appendTo('#panel_0');
								$('#groupy').find('.rotate-handle').css('visibility', 'visible');
								
								this.render();
								this.spotify();
								this.resize();
								this.addRotationFunctionality();
								this.stopPropagation();
								this.makeDraggable();
								this.findSiblingClickThruElement();

							}

	
						},
						
						disableAlign: false,
	
						makeDraggable: function()	{
							var	that = this,
									$panel = $('#panel_0'),
									panelWidth= $panel.width(),
									panelHeight = $panel.height(),
									guides = [],
									innerOffsetX, innerOffsetY,
									panelLeft = $('#panel_0').offset().left,
									panelTop = $('#panel_0').offset().top,
									halfGroupyWidth,
									halfPanelWidth,
									leftOfHalfwayWidth,
									topOfHalfwayHeight,
									halfGroupyHeight,
									halfPanelHeight;
									
							var $groupy = $('#groupy');

							$groupy.on('mousedown', 
							
								function(event) {
									
									app.stubs.clickedMousPosX = event.pageX;
									app.stubs.clickedMousPosY = event.pageY;
									
									app.stubs.mainCurScollX = $('#main').scrollLeft();
									app.stubs.mainCurScollY = $('#main').scrollTop();
									
									app.stubs.mainCanScroll = true;
									
									if( event.button == 2 || event.ctrlKey) {
										 
										$groupy.draggable({ disabled: true });
										
										$groupy.on('mousemove', 
										
											function(e) {
												app.methods.scrollMain($(this), e.pageX, e.pageY);
											}
										)		
			
										var killMouseMove = function() {
												$groupy.off('mousemove');
												$groupy.off('mouseup');
												$groupy.draggable({ disabled: false });
												$groupy.css('cursor',	'');								
										};
							
										$groupy.on('mouseup', 
										
											function(event) {
												
												app.stubs.mainCanScroll = false;
												
												setTimeout(function(){
													killMouseMove();
												}, 200);
			
											}
										);	
										
										$groupy.on('mouseleave', 
										
											function(event) {
												
												app.stubs.mainCanScroll = false;
												
												setTimeout(function(){
													killMouseMove();
												}, 200);
			
											}
										);
											
							      
							      return false; 
							      
							      
							    } else {
							    	$groupy.draggable({ disabled: false });
							    	return false;
							    }
							    
							    event.stopPropagation(); 
									return false;
			
								}
							)	
							.draggable({
								snap: '.guide-line',
								snapTolerance: 10,
								cursor:	"move",
								start: function(event,	ui)	{
									if( app.stubs.stillRotating ) return;
									if( app.stubs.stillRotating ) app.methods.clearActive('if app.stubs.stillRotating');
									
									delete that.rotateIt;
									
									//$('#groupy').find('.rotate-handle').css('visibility', 'hidden');
									
									halfGroupyWidth = $('#groupy').width()/2;
									halfPanelWidth = $panel.width()/2;
									leftOfHalfwayWidth  = halfPanelWidth - halfGroupyWidth;	
						
									halfGroupyHeight = $('#groupy').height()/2;
									halfPanelHeight = $panel.height()/2;
									topOfHalfwayHeight  = halfPanelHeight - halfGroupyHeight;
									
									app.methods.clearActive(['disableGroupy', 'emptyGrouped', 'removeSpot', 'removeGroupyClones', 'previewOn'], 'exclude', 'groupy drag');
	
					        innerOffsetX = event.originalEvent.offsetX;
					        innerOffsetY = event.originalEvent.offsetY;
	
									this.startLeft = $(this).offset().left  + app.stubs.mainScrolledRight;
									this.startTop	=	$(this).offset().top + app.stubs.mainScrolledDown;
									
									app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, {
										width: $('#groupy').width(),
										height: $('#groupy').height()
									});		
																
									if(app.stubs.grouped.length ==	0) $('#groupy').addClass('disappear').appendTo('body');
									
									that.dragGrouped.cloneIntoGroupy();

								},
								
								drag:	function(event,	ui) {
	
									if(	$('#groupy').hasClass('disappear') ) return;

									if( that.disableAlign ) return;
									
									var leftOutSideCenter = halfPanelWidth - $('#groupy').width();
									var topOutSideCenter = halfPanelHeight - $('#groupy').height();
									
								 	app.methods.alignToGuide.hitWhenDrag(ui, 'left', 0, 0, 'horizontal-left-edge');
									app.methods.alignToGuide.hitWhenDrag(ui, 'top', 0, 0, 'vertical-top-edge');
				
									app.methods.alignToGuide.hitWhenDrag(ui, 'left', leftOutSideCenter, halfPanelWidth, 'horizontal-left-outside');
									app.methods.alignToGuide.hitWhenDrag(ui, 'top', topOutSideCenter, halfPanelHeight, 'vertical-top-outside');
									
									app.methods.alignToGuide.hitWhenDrag(ui, 'left', leftOfHalfwayWidth, halfPanelWidth, 'horizontal-center');
									app.methods.alignToGuide.hitWhenDrag(ui, 'top', topOfHalfwayHeight, halfPanelHeight, 'vertical-middle');

									app.methods.alignToGuide.hitWhenDrag(ui, 'left', halfPanelWidth, halfPanelWidth, 'horizontal-right-outside');
									app.methods.alignToGuide.hitWhenDrag(ui, 'top', halfPanelHeight, halfPanelHeight, 'vertical-bottom-outside');

								 	app.methods.alignToGuide.hitWhenDrag(ui, 'left', panelWidth - $('#groupy').width(), panelWidth, 'horizontal-right-edge');
									app.methods.alignToGuide.hitWhenDrag(ui, 'top', panelHeight - $('#groupy').height(), panelHeight, 'vertical-bottom-edge');
								
									for( var side in app.methods.alignToGuide.arrays){
										for( var idx in app.methods.alignToGuide.arrays[side]){
											var obj = app.methods.alignToGuide.arrays[side][idx];
											app.methods.alignToGuide.hitWhenDrag(ui, side, obj.hitPos + 1, obj.linePos, obj.hitPos);
										}							
									}
									
								},
								stop:	function(event,	ui) {
								
									app.methods.alignToGuide.hideIt();
									
									that.groupyLeft = ($('#groupy').offset().left - panelLeft),
									that.groupyTop = ($('#groupy').offset().top - panelTop);
	
									if(	$('#groupy').hasClass('disappear') ) return;
	
									that.ok2AddSiblings	=	false;

									if(typeof( that.rotateIt) == 'undefined'){
										that.rotateIt = new RotateIt();
										that.rotateIt.init( $('#rotate-wrapper') );
									}
									
									//$('#groupy').find('.rotate-handle').css('visibility', 'visible');
									
									saveHistory('group drag');

								}
							});
						},
						
						dragGrouped:{
							
							cloneIntoGroupy: function() {
								
								if( $('#groupy').find('.resize-wrapper').length > 0 ) return;
								
								for( var idx in app.stubs.grouped){

									var cid = app.stubs.grouped[idx],
											view = app.stubs.views.elements[cid];
											
									$( "#" + cid )
										.css('visibility', 'hidden')
										.clone()
										.css('visibility', 'visible')
										.attr('id', 'clone_' + cid)
										.appendTo( '#rotate-wrapper' );
										
									var $clone = $('#clone_'+ cid );
									
									$clone.removeClass('grouped')
										.offset({	left:	$('#'+ cid ).offset().left,	top: $('#'+ cid ).offset().top	})
										.find('.resize-wrapper')
										.children('.ui-resizable-handle, .custom-handle').remove();
									$clone.find('.line').children().remove();	
								}
							},
							
							transferClonedStylesToElements: function( line ) {
								
								console.log('transferClonedStylesToElements:' + line);
								
								if( $('#groupy').find('.resize-wrapper').length == 0 ) return;

								for( var idx in app.stubs.grouped){
									
									var cid = app.stubs.grouped[idx],
											view = app.stubs.views.elements[cid];
									
									var $clone = $('#clone_'+ cid );
											
									view.$el.offset({	
										left:	$clone.find('.resize-wrapper').offset().left,	
										top: $clone.find('.resize-wrapper').offset().top	});

									view.storeOffset();

									view.model.get('json').style.element.left = parseFloat( view.$el.css('left'))  * multiple + 'px';
									view.model.get('json').style.element.top 	= parseFloat( view.$el.css('top'))   * multiple + 'px';
									
									if(typeof( view.model.get('json').style.resizeWrapper) == 'undefined'){
										view.model.get('json').style.resizeWrapper = {};
									}
									
									//view.$el.css('visibility', 'hidden');	
									
								}
								
								
								
								// $('#rotate-wrapper').children(':not(.custom-handle)').remove();
							}
						},
						
						redoGroupyResize: function() {
							
							//console.log('redoGroupyResize');
							this.groupyHeight = (this.bottom - this.top);
							this.groupyWidth = (this.right - this.left);
//							this.resizeOptions.maxWidth = app.stubs.curCanvasSize.width * scale * app.settings.resizeMaxRatio;
//							this.resizeOptions.maxHeight = app.stubs.curCanvasSize.height * scale * app.settings.resizeMaxRatio;
							
							$('#groupy').resizable('destroy').resizable( this.resizeOptions);			
						},
						
						resize: function() {

							this.groupyHeight = (this.bottom - this.top);
							this.groupyWidth = (this.right - this.left);
							
							var	that = this;
									
							this.resizeOptions =  {
//									maxHeight: app.stubs.curCanvasSize.height * scale * app.settings.resizeMaxRatio,
//									maxWidth: app.stubs.curCanvasSize.width * scale * app.settings.resizeMaxRatio,
									aspectRatio: this.groupyWidth / this.groupyHeight,
									start:function() {
										
										app.methods.clearActive(['transferClonedStylesToElements'], 'include', 'make changes');

										that.groupyWidth = $(this).width();
										that.groupyHeight = $(this).height();

										if( app.methods.isDynamicAlign() ) {
											app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, {
												width: that.groupyWidth,
												height: that.groupyHeight
											});	
										}
										
										
										return;
										for( var idx in app.stubs.grouped){
											var cid = app.stubs.grouped[idx],
													view = app.stubs.views.elements[cid];
											//	view.changeWithGroupyAsResizeStart();
										}		
									},

									resize: function(event, ui) {
										
										that.rotateIt.centerRotateHandle();
										
										var height = $(this).height(),
												width = $(this).width(),
												percentScaled = height / that.groupyHeight,
												obj = {
													groupyLeft: ($('#groupy').offset().left - $('#panel_0').offset().left),
													groupyTop: ($('#groupy').offset().top - $('#panel_0').offset().top),
													percentScaled: percentScaled	
												};
												
										for( var idx in app.stubs.grouped){
											var cid = app.stubs.grouped[idx],
													view = app.stubs.views.elements[cid];
													
											if( tools.inArray(view.collection, ['dynolines'] )) continue;
											view.changeWithGroupyAsResize(obj);
										}		
										
									},
									stop: function() {
										
										if( app.methods.isDynamicAlign() ) {
											app.methods.alignToGuide.hideIt();
										}										
										
										var height = $(this).height(),
												width = $(this).width(),
												percentScaled = height / that.groupyHeight,
												obj = {
													groupyLeft: that.groupyLeft,
													groupyTop: that.groupyTop,
													percentScaled: percentScaled	
												};
										
										for( var idx in app.stubs.grouped){
											var cid = app.stubs.grouped[idx],
													view = app.stubs.views.elements[cid];
											if( tools.inArray(view.collection, ['dynolines'] )) continue;
											view.changeWithGroupyResizeStop(obj);
										}
										
										app.methods.unloadToDoQueue();
										
										that.getEdges(app.stubs.grouped);
										that.spotify(); // FIX
													
										saveHistory('changeWithGroupyResizeStop');	

																		
									},
									handles: 's, e, se',
					        create: function (event, ui) {
				        		// http://stackoverflow.com/questions/15902920/resizing-an-element-triggers-the-resize-event-of-the-window
				            $(this).parent().on('resize', function (e) {
				                e.stopPropagation();
				            });
					        }
							};

							$('#groupy').resizable( this.resizeOptions);
						},
						
						render:	function(	panel_idx	)	{
							
							var groupyWidth = (this.right - this.left),
									groupyHeight = (this.bottom - this.top);
							
							$('#groupy').css({
								left:	this.left	+	'px',
								top: this.top	+	'px',
								width: 	groupyWidth +	'px',
								height:	groupyHeight + 'px'
							});
							
						},
						
						spotify: function() {
							
							var minWidth = 300,
									minHeight = 250,
									buffer = 20,
									width = (this.right - this.left)+ buffer,
									height = (this.bottom - this.top)+ buffer,
									top = this.top,// - (buffer /2),
									left = this.left,// - (buffer /2),
									paddingLeft = ( width <  minWidth ? (minWidth/2 - width/2) : 0) + buffer,
									paddingTop = ( height <  minHeight ? (minHeight/2 - height/2) : 0) + buffer;
							
							app.stubs.spot = {
								frame: {
									width: 	(width * multiple) + paddingLeft,
									height: (height * multiple) + paddingTop
								},
								diff:{
									left: (left * multiple) - paddingLeft,
									top: (top * multiple) - paddingTop
								}	
							};
							
						},
						
						bind: {
							
							init: function() {
								this.delete();
								this.clone();
								this.edit();
								this.zoom();

								//$('#groupy').resizable();
								
							},
							
							edit: function() {
								
								var reorderGroupedByZindex = function() {
											var zObj = {};
											for( var idx in app.stubs.grouped){
												var cid = app.stubs.grouped[idx],
														model = app.stubs.collections.elements.get(cid);
												zObj[model.get('json').style.element['z-index']] = cid;
											}
											var sortedCidsObj = tools.sortObject(zObj);
											app.stubs.grouped = [];
											for( var key in sortedCidsObj){
												app.stubs.grouped.push(sortedCidsObj[key]);
											}
										},
										GroupyBoxView = EditBoxView.extend({
											
											initialize: function() {
											},
											
											positionEditBox: function( event ) {
												
												var $selector = $('#groupy'),
														left, top,
														buffer = 45,
														$window = $(window),
														windowWidth = $window.width(),
														element_id = this.view.cid,
														elementWidth = $selector.width(),
														elementOffSetLeft = $selector.offset().left,
														elementOffSetRight = $selector.offset().left + elementWidth,
														elementOffSetTop = $selector.offset().top,
														editElementBoxWidth = this.$el.width(),
														clickedSpotX = event.clientX,
														$panel = $('#panel_0'),
														panelOffSetLeft = $panel.offset().left,
														clickedSpotXSubLeftOfPanel = clickedSpotX - panelOffSetLeft,
														bufferWithWidthOfElementBox = editElementBoxWidth + buffer,
														panelHalfwayPoint = $panel.width()/2,
														whichHalfPanel = ( clickedSpotXSubLeftOfPanel > panelHalfwayPoint	?	2	:	1	);
									
												if(	whichHalfPanel ==	2	){
								
													left = elementOffSetLeft - bufferWithWidthOfElementBox;
	
												}else{
								
													left = elementOffSetRight + buffer;
								
													if( left > windowWidth - editElementBoxWidth){
															left = elementOffSetLeft - bufferWithWidthOfElementBox + buffer;
													}

												};
								
												var	top	=	(event.clientY - 15),
														mouseY = event.clientY,
														boxHeight	=	this.$el.height(),
														windowHeight = $(window).height();
								
												if(	(mouseY	+	boxHeight) > windowHeight){
													top	=	windowHeight - boxHeight - 30;
													// top	=	94; // debug
												};
												
												var cssObj = {
														left: ( left <= 0  ? 5: left) + 'px',
														top: ( top <= 0  ? 0: top) + 'px'	
												};
												
												this.$el.show().css(cssObj);

											},
			
											whenEditClicked: function(event) {
												
												this.$el = $('#edit-box');
												
												this.$el.find('.edit-row').hide();

												this.$el.find('.edit-row[component=lock]').show();
												this.$el.find('.edit-row[component=rotate]').show();
												
												this.$el.css({
													'height': '170px'	
												});	
															
												this.positionEditBox(event);
												
												if( app.methods.groupyBox.disableAlign  ) {
													$('#disable-align-input').prop('checked', true);
												} else{
													$('#disable-align-input').prop('checked', false);
												}
												
											}
											
										});
										
								var groupyBoxView = new GroupyBoxView();

								$('#rotate-wrapper').on('click', '.edit-handle', function(event) {
									
									reorderGroupedByZindex();

									groupyBoxView.whenEditClicked(event);
									
									return false;
								
								})
								
							},							
							
							delete: function() {
								
								$('#rotate-wrapper').on('click', '.delete-handle', function() {
									
									for( var idx in app.stubs.grouped){
										var cid = app.stubs.grouped[idx],
												view = app.stubs.views.elements[cid],
												groupDelete = true;
										view.delete( groupDelete );	
									}
									
									app.methods.clearActive(undefined, undefined, 'groupy trash');
									saveHistory('groupy delete');
									return false;										
								})
								
							},
							
							clone: function() {
								
								$('#rotate-wrapper').on('click', '.clone-handle', function() {
										if( $('#groupy').find('.resize-wrapper').length !== 0 ) return;
										app.stubs.cloned = [];
										app.stubs.saveHistoryEnabled = false;
										for( var idx in app.stubs.grouped){
											var cid = app.stubs.grouped[idx],
													model = app.stubs.collections.elements.get(cid);
											app.methods.clone(model, 'group');
										}
										app.stubs.saveHistoryEnabled = true;
										app.methods.revert.saveHistory('clone group');
										app.stubs.grouped = app.stubs.cloned.slice();
										var disableMoreThanOneRule = true;
										app.methods.groupyBox.init(0, disableMoreThanOneRule);
										editbox.methods.layers.redoLayers();
										app.methods.clearActive(['disableGroupy', 'emptyGrouped', 'removeGroupyClones'], 'exclude', 'groupy clone');							
										
										return false;
								})
								
							},
				
							zoom: function() {
								var that = this;	
								$('#rotate-wrapper').on('click', '.zoom-handle', 
									function(event) {
										var whichTarget = ($(this).hasClass('zoomHandleGlassShowsOut') ? 'main': 'groupy');
										app.menu.resize.matchZoomTargetSize(whichTarget);
										event.stopPropagation();
										return false;
									}
								);
							}
							
						},
						
						addRotationFunctionality: function() {
							this.rotateIt = new RotateIt();
							this.rotateIt.init( $('#rotate-wrapper') );
						},
	
						getEdges:function( elements	)	{
							
								var	leftEdge = new app.methods.GetEdge( 'left', elements	),
										topEdge	=	new	app.methods.GetEdge(	'top', elements	),
										rightEdge	=	new	app.methods.GetEdge(	'right', elements	),
										bottomEdge = new app.methods.GetEdge( 'bottom', elements	);
	
								this.left	=	leftEdge.furthest(),
								this.top = topEdge.furthest(),
								this.right = rightEdge.furthest(),
								this.bottom	=	bottomEdge.furthest();
						},
	
						stopPropagation: function()	{
							var	that = this;
							$('#groupy').on('mousedown',	function(event)	{
								event.stopPropagation();
								that.ok2AddSiblings	=	true;
							});
						},
						
						makeDblclickable: function()	{
							var	that = this,
									$selector = $('#groupy');
									
							$selector.unbind('dblclick').dblclick(function(event)	{
								
									event.stopPropagation();
								
									var	slaves = app.stubs.grouped.slice(),
											cid = slaves[0],
											panelCid = $('#' + cid ).parent().attr('cid'),
											elementView = app.methods.getElementViewFromPanelViews(panelCid, cid ),
											isGroup = true;
								
									app.stubs.views.editElementView.launchEditElementbox(event, elementView, isGroup);
									
							});
						},
	
						siblings2add:	[],
	
						ok2AddSiblings:	true,
	
						findSiblingClickThruElement: function( panel_idx)	{
							var	that = this,
									$panel = $('#panel_0');
							this.siblings2add	=	[];
							$('#groupy').unbind('click').click(
	
								function(e,	ui)	{
	
									if(	!	e.shiftKey)	return;
	
									if(	!	that.ok2AddSiblings	)	return;
	
									var	clickedX = e.pageX,
											clickedY = e.pageY;
	
									$panel.children('.elements').each(
										function() {
											var	elementClicked = undefined,
													$element = $(this),
													cid = $(this).attr('id');
	
											if(	$element.hasClass('dynoline')){
	
												var	leftEdge = new app.methods.GetEdge( 'left', [cid]	),
														topEdge	=	new	app.methods.GetEdge(	'top', [cid]	),
														rightEdge	=	new	app.methods.GetEdge(	'right', [cid]	),
														bottomEdge = new app.methods.GetEdge( 'bottom', [cid]	);
	
												var	elementLeft	=	leftEdge.furthest(),
														elementTop = topEdge.furthest(),
														elementRight = rightEdge.furthest(),
														elementBottom	=	bottomEdge.furthest();
	
												var	panelLeft	=	$panel.offset().left,
														panelTop = $panel.offset().top;
	
												var	elePos = {
													left:leftEdge.furthest() + panelLeft,
													top:topEdge.furthest() + panelTop,
													right:rightEdge.furthest() + panelLeft,
													bottom:bottomEdge.furthest() + panelTop
												};
	
												if(	elePos.left	<	clickedX &&
														elePos.top < clickedY	&&
														elePos.right > clickedX	&&
														elePos.bottom	>	clickedY
												){
													elementClicked = cid;
												};
	
											}else{
												if(	$element.offset().left < clickedX	&&
														$element.offset().top	<	clickedY &&
														$element.offset().left + $element.width()	>	clickedX &&
														$element.offset().top	+	$element.height()	>	clickedY
												){
													elementClicked = cid;
												};
											};
	
											if(typeof(elementClicked)	!= 'undefined'){
												that.siblings2add.push(elementClicked);
											}
											
											
										}
									);
	
									that.addRemoveSiblingsToGrouped();
									
									e.stopPropagation();
									
									return;
	
								}
							);
						},
						
						addForeignElement: function( cid ) {
							
							if(	_.indexOf(app.stubs.grouped, cid) ==	-1	)	{ // SELECT	

								app.stubs.grouped.push( cid );
								
								$('#'	+	cid ).addClass('grouped');
	
								app.stubs.copyGroup = app.stubs.grouped.slice();
		
								var disableMoreThanOneRule = true;
								this.init(0, disableMoreThanOneRule);
	
							}

						},
	
						addRemoveSiblingsToGrouped:	function() {
	
								for( var i in	this.siblings2add){
									var	sibling	=	this.siblings2add[i];
									
									if(	!	tools.inArray(sibling, app.stubs.grouped))	{
										app.stubs.grouped.push(sibling);
										$('#'	+	sibling).addClass('grouped');
									}else{
										var	idx	=	_.indexOf(app.stubs.grouped,	sibling);
										if (idx	>	-1)	{
											 app.stubs.grouped.splice(idx,	1);
											 $('#' + sibling).removeClass('grouped');
										}
									}
									
									
								}
								this.siblings2add	=	[];
								app.stubs.copyGroup = app.stubs.grouped.slice();
								var	elements =	app.stubs.grouped.slice();
								
//								console.log(JSON.stringify( elements));
								
								delete elements['remove'];
	
								if(elements.length > 0)	{
									
									this.getEdges(app.stubs.grouped);
									this.render();
									this.spotify();
									this.resize();
									this.addRotationFunctionality();
									this.stopPropagation();
									this.makeDraggable();
									this.findSiblingClickThruElement();

								}	else{
									app.methods.clearActive(undefined, undefined, 'groupy shift click');
								}
	
						},
	
						moveInUnison:	{
							init:	function(	master,	slaves ) {
								this.$master = $(master);
								this.slaves	=	slaves;
							},
	
							doEachSlave: function( callback	)	{
								for( var key in	this.slaves	){
										var	$slave	=	$('#' + this.slaves[key]);
										callback(	$slave	);
								}
							},
	
						}
					},				

					GetEdge: function()	{
		
						var	Edge = function( whichEdge,	elements ) {
		
							this.whichEdge = whichEdge;
							this.elements	=	elements;
		
							if(	whichEdge	== 'left'	|| whichEdge ==	'top'	){
								this.furthestEdge	=	1000000000;
								this.how = 'lessThan';
							}else{
								this.furthestEdge	=	0;
								this.how = 'greaterThan';
							}
		
							this.edges = [];
		
						};
		
						var	p	=	Edge.prototype;
		
						p.furthest = function()	{
							this.getEdges();
							this.filter();
							return this.furthestEdge;
						}
		
						p.getEdges = function()	{
							
							var panelLeft = $('#panel_0').offset().left,
									panelRight = panelLeft + $('#panel_0').width(),
									panelTop = $('#panel_0').offset().top,
									panelBottom = panelTop + $('#panel_0').height();
									
		
							for( var i in	this.elements	){
									var	id = this.elements[i],
											$selector	= ( $('#'+ id).hasClass('dynoline') ? $('#'+ id) : $('#'+ id).find('.resize-wrapper'));
											
									if(	$selector.hasClass('dynoline')	){
										
										var	selectorLeft = parseFloat($selector.css('left')),
												selectorTop	=	parseFloat($selector.css('top'));
		
										var	edge = {
		
											left:	function() {
		
												var	furthestLeft = 1000000;
												$selector.children('.box').each(
													function() {
														var	left =	parseFloat($(this).css('left'));
														if(	left < furthestLeft	){
															furthestLeft = left;
														}
													}
												);
												return furthestLeft	 + selectorLeft;
											}(),
											top: function()	{
		
												var	furthestTop	=	1000000;
												$selector.children('.box').each(
													function() {
														var	top	=	 parseFloat($(this).css('top'));
														if(	top	<	furthestTop	){
															furthestTop	=	top;
														}
													}
												);
												return furthestTop + selectorTop;
											}(),
											right:function() {
		
												var	furthestRight	=	0;
												$selector.children('.box').each(
													function() {
														var	right	=	parseFloat($(this).css('left'))	+	$(this).width();
														if(	right	>	furthestRight	){
															furthestRight	=	right;
														}
													}
												);
												return furthestRight	+	selectorLeft;
											}(),
											bottom:	function() {
		
												var	furthestBottom = 0;
												$selector.children('.box').each(
													function() {
														var	bottom = parseFloat($(this).css('top'))	+	$(this).height();
														if(	bottom > furthestBottom	){
															furthestBottom = bottom;
														}
													}
												);
												return furthestBottom	 + selectorTop;
											}()
										};
		
									} else {
		
										var selector = $selector[0],
												boundingBox = selector.getBoundingClientRect();

										var left = boundingBox.left - panelLeft,
												top = boundingBox.top - panelTop,
												right = left + boundingBox.width,
												bottom = top + boundingBox.height;
										
										var	edge = {
											left:	left,
											top: top,
											right: right,
											bottom:	bottom
										};
		
									}
		
									this.edges.push( edge[this.whichEdge]);
							}
							
						};
		
						p.filter = function()	{
							for( var i in	this.edges ){
									this.compare[this.how].call( this, this.edges[i] );
							}
						};
		
						p.compare	=	{
							'lessThan':	function(	edge ) {
								if(edge	<	this.furthestEdge){
									this.furthestEdge	=	edge;
								}
							},
							'greaterThan': function(edge)	{
								if(edge	>	this.furthestEdge){
									this.furthestEdge	=	edge;
								}
							}
						};
		
						return Edge;
		
					}(),
						
					widgets:{

						charts:{
							
							launch: function(json, view) {
								
								this.json = json;
								this.view = view;
								
								this.origJson = tools.deepCopy(json);
								
								$('#modal-box').css('padding', '0px')
									.width(app.settings.google.charts.type[json.collection].modal.width)
									.height(app.settings.google.charts.type[json.collection].modal.height);
									
								app.methods.modal.on( 'true' );	
								
								var that = this;
								
								$('#modal-box').load('html/charts_modal.html?version=' + version,
									function() {
										
										that.fields();
										
										that.handsOnTable();
										that.color();
										
									  var model = app.stubs.collections.graphics[json.collection].findWhere({version: parseInt(json.version)});
									  
									  that.defaultResolution = model.get('json').data.resolution;
									  that.defaultChartOptions = model.get('json').data.charts.options;
									  
										that.renderChartInModal(json.collection, json.data.preData, that.defaultResolution, that.json.data.charts.options);

									  $('#table-chart_save').click( function() {
									  	that.save();
									  	app.methods.modal.off('A5');
									  });
									  
									  $('#table-chart_outter-wrapper').click( function() {console.log('clicked on table-chart_outter-wrapper');
									  	app.methods.clearActive(['hideColorPicker', 'removeFlashingHandsontableFields'], 'include', 'cxxxg', function() {
						      			that.handsInstance.deselectCell();
						      			that.colorsInstance.curColIdx = -1;
						      			that.colorsInstance.curRowIdx = -1;
									  	});
									  });
									  
									  $('#table-chart').click( function(event) {
									  	return false;
									  });									  
										
									}
								);
								
							},
							
							save: function() {
								
								app.methods.clearActive(['hideColorPicker'], 'include', ' chart graph save');
								
							  var handsData = this.handsInstance.getData();
								
								this.json.data.preData = this.formatDataForCharts(handsData).data;
								
								if( typeof( this.view) != 'undefined'){
										
									this.view.model.set('json', this.json);
									
									saveHistory('changes in chart Data');	
									
									this.view.renderChart(); 
									
								} else {
									var panelView = app.stubs.views.panels['panel_0'];
									panelView.drop.createAndAddModel.call( panelView, this.json, undefined, 'CCC');									
								}

								
								//delete this.origJson;

							},
							
							settings:{
								maxPieColumns: 2,
								maxColumns: 9,
								maxRows: 14,
							},
							
							prefillWithBlanks: function( workingData ) {
								
								this.moreData = [];
								
								var preData = ( typeof( workingData ) == 'undefined' ? this.json.data.preData: workingData);								
											
								for( var idx in preData){
									var row = preData[idx],
											lenRow = row.length,
											moreRow = $.extend(true, [], row);
											
									if( this.json.collection != 'pies' ) {
										while( moreRow.length - lenRow < this.settings.maxColumns - lenRow ){
											moreRow.push("");
										}
									}
									
									this.moreData.push(moreRow);
								}									
								
								var rowsInPreData = preData.length,
										numMissingRows = this.settings.maxRows - rowsInPreData;
								
								while( numMissingRows > 0){
									numMissingRows--;
									var moreRow = [];
									for( var count = 1; count <= (  this.json.collection == 'pies' ? this.settings.maxPieColumns: this.settings.maxColumns); count++ ){
										moreRow.push(null);
									}
									this.moreData.push(moreRow);
								}
								
							},
							
							reloadHands: function() {
								
								this.prefillWithBlanks(this.moreData);
								
								this.handsInstance.loadData(this.moreData);
								
							},
							
							handsOnTable: function() {	
								
								var that = this,
										container = document.getElementById('table-chart');

							  this.prefillWithBlanks();
									
								var row = 0,
										col = 1,
										valueIs = 3;
										
										/*
										
											changes[idx][row, col, beforeValue, afterValue]
											
											[[0,2,"Fluidity",""]]
										
										*/
								
								var data = this.moreData,
										labelIsBlank = function(changes, idx){ // idx is always 0 as a parameter

											return  changes[idx][col] == 0 && changes[idx][valueIs] == '' ||
														  changes[idx][row] == 0 && changes[idx][valueIs] == '' 
										},
										headerIsNumber = function(changes, idx){ 

											return  changes[idx][row] == 0 &&  tools.isFloatOrNumber(changes[idx][valueIs])  
										},
										dataEnteredIsNonNumber = function(changes, idx){ 

											return  changes[idx][col] != 0 && changes[idx][row] != 0 && !tools.isFloatOrNumber(changes[idx][valueIs]) && changes[idx][valueIs] != ''
											  
										},
										contextMenuArray = ( that.json.data.whichside == 'cols' ? ['remove_col']: ['remove_row']),
										contextMenuArray = ['remove_col', 'remove_row'],
										contextMenuArray = [];
								
//								contextMenuArray.push('undo');
//								contextMenuArray.push('redo');

								if( this.json.data.whichside != 'both'){
									contextMenuArray.push('remove_col', 'remove_row');
								} else{
									contextMenuArray.push('remove_row');
								}

								contextMenuArray.push('Cancel');
								
							  this.handsInstance = new Handsontable(container, {
							    data: data,
							    minSpareCols: 0,
							    minSpareRows: 0,
							    maxRows: that.settings.maxRows,
							    colHeaders: true,
    							rowHeaders: true,
    							afterRemoveRow: function(row) {
    								
    								if( that.json.data.whichside == 'both'){
											var colorsInChart = that.json.data.charts.options.colors;
											colorsInChart.splice(col - 1, 1);	      									
    								}
    								
    								if(that.json.data.whichside == 'rows'){
											var colorsInChart = that.json.data.colorsInChart;
											colorsInChart.splice(row - 1, 1);    									
    								}
										
										that.handsInstance.deselectCell();
									  var handsData = that.handsInstance.getData();
									  that.renderChartInModal(that.json.collection, handsData, that.defaultResolution, that.json.data.charts.options);
										
										that.reloadHands();
										
    							},
    							afterRemoveCol: function(col) {
    								
    								if(that.json.data.whichside == 'cols'){
											var colorsInChart = that.json.data.charts.options.colors;
											colorsInChart.splice(col - 1, 1);	    									
    								}
										
										that.handsInstance.deselectCell();
									  var handsData = that.handsInstance.getData();
									  that.renderChartInModal(that.json.collection, handsData, that.defaultResolution, that.json.data.charts.options);		
									  
										that.reloadHands();
										
    							},
    							beforeOnCellMouseDown: function() {
    								console.log('beforeOnCellMouseDown');
    							},
    							afterOnCellMouseDown: function() {
    								console.log('afterOnCellMouseDown');
    							},
    							afterOnCellCornerMouseDown: function() {    							
    								console.log('afterOnCellCornerMouseDown');
    							},
    							afterRender: function(foo, bar) {
    								console.log('rendered handsontable');
    								if( typeof( that.json.data.whichside) != 'undefined' ) that.paintTableCells();
    							},
								  beforeChange: function (changes, source) {
										console.log('before change');
								    for (var idx = changes.length - 1; idx >= 0; idx--) {
								      if ( labelIsBlank(changes, idx)) {
								      	
//								        changes.splice(idx, 1);
												return;
												var col = changes[idx][1],
														row = changes[idx][0],
														whichside = that.json.data.whichside;
								        									
												if( whichside == 'rows' || whichside == 'both'){
													
													var colorsInChart = that.json.data.colorsInChart;
													colorsInChart.splice(row - 1, 1);
													
													// this.spliceRow(row, -1);
													
												} else {
													
													var colorsInChart = that.json.data.charts.options.colors;
													colorsInChart.splice(col - 1, 1);													
													
												}

									      var styleObj = {
									      	'color': '#000000',
									      	'background': '#FFFFFF'
									      };
								        
								        if( col != 0){
								        	
								        	var thisNum = col + 2;
								        	
													setTimeout(function(){
														
													$('.handsontable.ht_master tr td:nth-child(' + thisNum + ')').css(styleObj);		
													$('.handsontable.ht_clone_top tr th:nth-child(' + thisNum + ')').css(styleObj);		
														
													}, 1000);

								        	
								        } else {
								        	
								        	var thisNum = row + 1;
								        	
								        	setTimeout(function(){
								        		
														$('.handsontable.ht_master tr:nth-child(' + thisNum + ') td').css(styleObj);		
														$('.handsontable.ht_clone_left tr:nth-child(' + thisNum + ') th').css(styleObj);		
														
								        	}, 1000);
								        }

								      }
								      else if ( headerIsNumber(changes, idx)) {
								        changes.splice(idx, 1);
								        toast('No numbers allowed in header.');
								      }	
								      else if ( dataEnteredIsNonNumber(changes, idx)) {
								      	
								      	console.log(JSON.stringify( changes));
								        changes.splice(idx, 1);
								        toast('Only numbers are allowed.');
								      }							      
								      
								    }
								  },
								  customCallBack: function() {
								  	console.log('custom calling back');
								  	app.methods.clearActive(['hideColorPicker', 'removeFlashingHandsontableFields'], 'include', 'c123123xxxg', function() {
					      			if( typeof( that.handsInstance ) != 'undefined') that.handsInstance.deselectCell();
					      			that.colorsInstance.curColIdx = -1;
					      			that.colorsInstance.curRowIdx = -1;
								  	});								  	
								  },
    							contextMenu: contextMenuArray
							  });
								
								this.handsInstance.addHook('afterChange', function() {
									
									app.methods.clearActive(['hideColorPicker', 'removeFlashingHandsontableFields'], 'include', 'c3434g');
								  
								  var handsData = that.handsInstance.getData();
								  
								  that.renderChartInModal(that.json.collection, handsData, that.defaultResolution, that.json.data.charts.options);
								  
								});

							  
								return;
							  this.handsInstance.updateSettings({
							    contextMenu: {
							      callback: function (key, options) {
							        if (key === 'color') {
							        	//timeout is used to make sure the menu collapsed before alert is shown
							          setTimeout(function () {
							          	
							          	console.log(JSON.stringify( options));
							            toast('I love you.')
							          }, 100);
							        }
							      },
							      items: {
							        "color": {name: 'Change color'}
							      }
							    }
							  })
								

							},
							
							color: function() {
								
								var that = this;
								
								this.colorsInstance = new Colors();
								
								this.colorsInstance.$parent = $('#modal-screen');
								
								this.colorsInstance.launchFrom = 'charts';
								
								this.colorsInstance.makeDraggable = true;
								
								this.colorsInstance.setColor = function( color, disableHide) {
									
									var textColor = this.getContrastColorFromHex(color),
											styleObj = {
												'color': textColor,
												'background-color':  color	
											};
											
									app.stubs.addUsedPlaceholder = color;

									this.$sampleBox.css(styleObj);
									
									if( that.json.data.whichside == 'cols'){
										
										$('.handsontable.ht_master tr td:nth-child(' + this.paintColorOn.col + ')').css(styleObj);
										that.json.data.charts.options.colors[ this.paintColorOn.col - 3] = color;
										
									}
									
									if( that.json.data.whichside == 'rows' || that.json.data.whichside == 'both'){
										
										$('.handsontable.ht_master tr:nth-child(' + this.paintColorOn.row + ') td').css(styleObj);
										
									};
									
									if( that.json.data.whichside == 'rows') {
										
										that.json.data.colorsInChart[ this.paintColorOn.row - 2] = color;
										
									};
									
									if( that.json.data.whichside == 'both') {
										
										that.json.data.charts.options.colors[ this.paintColorOn.row - 2] = color;
										
									};									
									
								  var handsData = that.handsInstance.getData();
								  
								  that.renderChartInModal(that.json.collection, handsData, that.defaultResolution, that.json.data.charts.options);		
									
									this.farbtastic.setColor(color);
									
									
									// if( typeof( disableHide ) != 'undefined' && disableHide) this.$parent.find('.colorPickerWrapper').hide();
								};
								
								this.colorsInstance.bind.sampleBox = function() {
									
									var colorsInstance = this,
											$colorPickerWrapper = colorsInstance.$parent.find('.colorPickerWrapper'),
											$allFields = $('.handsontable.ht_master tr td');
									
									if(that.json.data.whichside == 'cols'){
										
										colorsInstance.curColIdx = -1;
										
										$('.handsontable.ht_clone_top tr th').each( function() {
											
											if( $(this).index() < 2)  return;

											$(this).css('cursor', 'pointer').click(function() {
												
												var backgroundColor = $(this).css('background-color');
												
												colorsInstance.farbtastic.setColor(colorsInstance.rgbToHex(backgroundColor).toUpperCase());
												
												$colorPickerWrapper.addClass('col').removeClass('row');
												
												var isOn = (  colorsInstance.curColIdx == $(this).index() ),
														col = $(this).index() + 1,
														$selectedCol = $('.handsontable.ht_master tr td:nth-child(' + col + ')');
												
												colorsInstance.curColIdx = $(this).index();
												
												if(!isOn){
													
													$('.handsontable.ht_clone_top tr th').removeClass('animated flash');
													$allFields.removeClass('animated flash');
													
													$(this).addClass('animated flash');
													$selectedCol.addClass('animated flash');
													
													$colorPickerWrapper.show();
													
												  colorsInstance.paintColorOn = {
												  	col: col,
												  	row: undefined	
												  };
												  
													colorsInstance.$sampleBox = $(this);
													
													$colorPickerWrapper
													.offset({
											  		'left': $(this).offset().left + 25,
											  		'top': $(this).offset().top + 30
													});	
													
												} else{
													
													$(this).removeClass('animated flash');
													$allFields.removeClass('animated flash');
													colorsInstance.curColIdx = -1;
													$colorPickerWrapper.hide()
												}
												
	
											});
											
										});										
										
									}

									if(that.json.data.whichside == 'rows' || that.json.data.whichside == 'both' ){
										
										colorsInstance.curRowIdx = -1;
																			
										$('.handsontable.ht_clone_left tr th').each( function() {
											
											if( $(this).parent().index() < 1)  return;
											
											
											$(this).css('cursor', 'pointer').click(function() {
												
												var backgroundColor = $(this).css('background-color');
												
												colorsInstance.farbtastic.setColor(colorsInstance.rgbToHex(backgroundColor).toUpperCase());
												
												$colorPickerWrapper.addClass('row').removeClass('col');
												
												var $selRowIdx = $(this).parent().index(),
														row = $selRowIdx + 1,
														$selectedRow = $('.handsontable.ht_master tr:nth-child(' + row + ') td'),
														isOn = (  colorsInstance.curRowIdx == $selRowIdx );
												
												colorsInstance.curRowIdx = $selRowIdx;
												
												if(!isOn){
													
													$('.handsontable.ht_clone_left tr th').removeClass('animated flash');
													$allFields.removeClass('animated flash');
													
													$(this).addClass('animated flash');
													$selectedRow.addClass('animated flash');
													
												  colorsInstance.paintColorOn = {
												  	col: undefined,
												  	row: row	
												  };
		
													colorsInstance.$sampleBox = $(this);
													
													$colorPickerWrapper.show();
													
													colorsInstance.positionColorWrapper();
													
												} else{
													
													$(this).removeClass('animated flash');
													$allFields.removeClass('animated flash');
													colorsInstance.curRowIdx = -1;
													 setTimeout(function(){  // FIX
													 	$colorPickerWrapper.hide();
													 	toast('hiding colorPickerWrapper Need to FIX');
													}, 2000);
													
												}
												

	
											});
											
										});
										
									}
									
									$('.handsontable.ht_clone_corner tr th').click(function(event) {
											
										$colorPickerWrapper.hide();
										
										event.stopPropagation();
										
									});							

								};
								
								this.colorsInstance.render = function() {
									var $colorPickerWrapper = this.$parent.find('.colorPickerWrapper');
									$colorPickerWrapper.remove();			
									this.$parent.append( this.template );
									
									setTimeout(function(){
										$colorPickerWrapper.draggable({});
									}, 1000);
								};
																
								this.colorsInstance.init();
								
								this.colorsInstance.buildUsedSwatch();
							},
							
							paintTableCells: function() {
								
								console.log('paint table cells');
								
								var that = this;
								
								tools.doWhenReady(function() {
									return typeof( that.colorsInstance ) != 'undefined'
								}, function() {
									
									var colorsInChart = ( that.json.data.whichside == 'rows' ? that.json.data.colorsInChart : that.json.data.charts.options.colors)
									
									for( var idx in colorsInChart){
										
										var color = colorsInChart[idx],
												textColor = that.colorsInstance.getContrastColorFromHex(color),
												styleObj = {
													'color': textColor,
													'background-color':  color	
												};
																	
										if( that.json.data.whichside == 'rows' || that.json.data.whichside == 'both' ){
											
											var childIdx = parseInt(idx) + 2;		
												
											$('.handsontable.ht_master tr:nth-child(' + childIdx + ') td').css(styleObj);		
											$('.handsontable.ht_clone_left tr:nth-child(' + childIdx + ') th').css(styleObj);		
											
										} else{
											
											var childIdx = parseInt(idx) + 3;	
											
											$('.handsontable.ht_master tr td:nth-child(' + childIdx + ')').css(styleObj);		
											$('.handsontable.ht_clone_top tr th:nth-child(' + childIdx + ')').css(styleObj);		
											
										}
											
									}
									
									return;
									
						      var styleObj = {
						      	'color': '#000000',
//						      	'background': '#FFFFFF'
						      	'background': 'red'
						      };
									
									$('.handsontable.ht_master tr td').css(styleObj);		
									$('.handsontable.ht_clone_top tr th').css(styleObj);		
									$('.handsontable.ht_clone_left tr th').css(styleObj);	
									
								},
								'all handsontable is rendered');

							},
							
							renderChartInModal: function(collection, preData, resolution, options) {
								
								var goOptions = $.extend(true, {}, this.json.data.charts.options);
								
								goOptions.width = this.defaultResolution.width;
								goOptions.height = this.defaultResolution.height;
								goOptions.chartArea.width = this.defaultChartOptions.chartArea.width;
								goOptions.chartArea.height = this.defaultChartOptions.chartArea.height;
								goOptions.chartArea.left = this.defaultChartOptions.chartArea.left;
								goOptions.chartArea.top = this.defaultChartOptions.chartArea.top;
								goOptions.titleTextStyle.fontSize = this.defaultChartOptions.titleTextStyle.fontSize;
								goOptions.titleTextStyle.color = this.defaultChartOptions.titleTextStyle.color;

								if(typeof( this.defaultChartOptions.legend.textStyle) != 'undefined'){
									
									goOptions.legend.textStyle.fontSize = this.defaultChartOptions.legend.textStyle.fontSize;
									goOptions.legend.position = this.defaultChartOptions.legend.position;
					
								} 

								if( collection == 'pies' ){
									
 									goOptions.pieSliceTextStyle.fontSize = this.defaultChartOptions.pieSliceTextStyle.fontSize;
 									
								} else{
									
									goOptions.hAxis.slantedTextAngle = this.defaultChartOptions.hAxis.slantedTextAngle;
									goOptions.hAxis.slantedText = this.defaultChartOptions.hAxis.slantedText;
									goOptions.hAxis.textStyle.fontSize = this.defaultChartOptions.hAxis.textStyle.fontSize;
									goOptions.vAxis.textStyle.fontSize = this.defaultChartOptions.vAxis.textStyle.fontSize;
									goOptions.vAxis.titleTextStyle.fontSize = this.defaultChartOptions.vAxis.titleTextStyle.fontSize;
									goOptions.hAxis.titleTextStyle.fontSize = this.defaultChartOptions.hAxis.titleTextStyle.fontSize;
									goOptions.hAxis.textStyle.color = this.defaultChartOptions.hAxis.textStyle.color;
									goOptions.vAxis.textStyle.color = this.defaultChartOptions.vAxis.textStyle.color;
									goOptions.hAxis.titleTextStyle.color = this.defaultChartOptions.hAxis.titleTextStyle.color;
									goOptions.vAxis.titleTextStyle.color = this.defaultChartOptions.vAxis.titleTextStyle.color;
									
								}

								var that = this,
										formated = this.formatDataForCharts(preData);
										
								if( typeof(formated.error ) != 'undefined') {
									toast(formated.error);
									return;
								}
								
								var data = ( typeof(  this.json.data.whichside ) != 'undefined' ? this.injectColorsToChartdata( formated.data,  this.json.data.colorsInChart,  this.json.data.whichside): formated.data);
								
				        this.render(collection, data, resolution, goOptions, function(src){
				        	
				        	var baseArray  = src.split(',');
				        	
				        	that.json.data.base64 = baseArray[1];  //take out
				        	
					        $('#chart-graph').css({
					        		'top': app.settings.google.charts.type[collection].coord.top,	
					        		'left': app.settings.google.charts.type[collection].coord.left
					        })
					        	.width(resolution.width)
					        	.height(resolution.height)
					        	.html('\
					        	<img src="' +  src + '"/>\
					        ');
					        
					        $('#chart-graph').find('img').click( function() {
//					        	app.methods.clearActive(['hideColorPicker', 'removeFlashingHandsontableFields'], 'include', 'clicked chart graph img',  function() {
//					      			that.handsInstance.deselectCell();
//					      			that.colorsInstance.curColIdx = -1;
//					      			that.colorsInstance.curRowIdx = -1;
//					      		});
					      	});
					        
					        
					        
								});
								
							},
							
							fields: function() {
								
								var that = this,
										updateChart = function() {
										  var handsData = that.handsInstance.getData();
										  
										  that.renderChartInModal(that.json.collection, handsData, that.defaultResolution, that.json.data.charts.options);
										  
										};
								
								$('#field-wrapper').height(app.settings.google.charts.type[that.json.collection].field.height);
								
								$('#field-form').append('\
									<input  id="chart-title" type="text" class="form-control chart-field" placeholder="Title">\
								');
								
								$('#chart-title').val(this.json.data.charts.options.title).on('keyup', function() {
									that.json.data.charts.options.title = $(this).val();
									updateChart();
								});
								
								if(typeof( this.json.data.charts.options.hAxis) != 'undefined' ){
									
									var hAxis =  this.json.data.charts.options.hAxis.title,
										 	vAxis =  this.json.data.charts.options.vAxis.title;
									
									$('#field-form').append('\
										<input  id="chart-y" type="text" value=" +  + " class="form-control" placeholder="Vertical">\
										<input  id="chart-x" type="text" value=" +  + " class="form-control" placeholder="Horizontal">\
									');		
									
									$('#chart-x').val(hAxis).on('keyup', function() {
										that.json.data.charts.options.hAxis.title = $(this).val();
										updateChart();
									});
									$('#chart-y').val(vAxis).on('keyup', function() {
										that.json.data.charts.options.vAxis.title = $(this).val();
										updateChart();
									});											
																		
								}
								
								$('#field-form').find('input').click(function() {
//									app.methods.clearActive(['hideColorPicker', 'removeFlashingHandsontableFields'], 'include', 'fields clicked in chart modal',  function() {
//										that.handsInstance.deselectCell();
//				      			that.colorsInstance.curColIdx = -1;
//				      			that.colorsInstance.curRowIdx = -1;
//									});
								});
								
								
							},

							getLeftMenuThumb: function( collection, obj, callback ) {
					    
								  var preData = obj.json.data.preData,
								  		options = obj.json.data.charts.options,
								  		resolution = obj.json.data.resolution;
								  
									var data = ( typeof(  obj.json.data.whichside ) != 'undefined' ? this.injectColorsToChartdata( preData,  obj.json.data.colorsInChart,  obj.json.data.whichside): preData);
								    
							    this.render(collection, data, resolution, options, function(src){
							    	callback(src);
									});
							}
							
						},
						
						richtext:{
							launch: function(json, view) {
								
								$('#modal-box').css('padding', '0px').width(700).height(550);
								app.methods.modal.on( 'true' );	
								
								var that = this;
								
								$('#modal-box').load('html/richtext.html?version=' + version,
									function() {
										
										app.stubs.disableMicroShift = true;
										
										var $editor = $('#editor');
										
										$editor.html(json.data.text);
									
										$('#editor').wysiwyg({ 
												hotKeys: {}	
										}	);
										
										/*
										http://www.albertmartin.de/blog/code.php/20/plain-text-paste-with-javascript
										*/
										$('#editor').bind('paste', function(){ // catch the paste-event in the DIV
										    // get content before paste
										    var before = document.getElementById('editor').innerHTML;
										    setTimeout(function(){
										        // get content after paste by a 100ms delay
										        var after = document.getElementById('editor').innerHTML;
										        // find the start and end position where the two differ
										        var pos1 = -1;
										        var pos2 = -1;
										        for (var i=0; i<after.length; i++) {
										            if (pos1 == -1 && before.substr(i, 1) != after.substr(i, 1)) pos1 = i;
										            if (pos2 == -1 && before.substr(before.length-i-1, 1) != after.substr(after.length-i-1, 1)) pos2 = i;
										        }
										        // the difference = pasted string with HTML:
										        var pasted = after.substr(pos1, after.length-pos2-pos1);
										        // strip the tags:
										        var replace = pasted.replace(/<[^>]+>/g, '');
										        // build clean content:
										        var replaced = after.substr(0, pos1)+replace+after.substr(pos1+pasted.length);
										        // replace the HTML mess with the plain content
										        document.getElementById('editor').innerHTML = replaced.replace(/<\/?[^>]+(>|$)/g, "");
										    }, 100);
										});
																				
										$('#save').click(function(event) {
											
												app.methods.modal.off('A2');
												var content = $editor.cleanHtml();
												
												content = content.replace(/<\/?span[^>]*>/g,"");
												
												//console.log(content);
												//console.log(content.replace(/<\/?[^>]+(>|$)/g, ""));  // STRIPS HTML TAGS -- http://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string
												
												if( typeof( view ) == 'undefined'){
													json.data.text = content;
													var panelView = app.stubs.views.panels['panel_0'];
													panelView.drop.createAndAddModel.call( panelView, json, undefined, 'DDD');													
												}else{
													view.leaveEditText(content);
												};

												
										});					
										
									}
								);
								
							},
							
						},
														
						google: {
							
							authenticate: function() {
								if( serverhost == 'localhost') return;
				    		console.log('Authorizing');
					      window.gapi.auth.authorize({
					            'client_id': window.clientId,
					            'scope': window.scope,
					            'immediate': true
					          },
					          app.methods.widgets.google.handleAuthResult);
							},
							
							handleAuthResult: function(authResult) {
					      if (authResult && !authResult.error) {
					        oauthToken = authResult.access_token;
					        console.log('oauthToken:' + oauthToken);
					      }
							},
							
							picker:{
								
								launch: function(json) {
									
									if( serverhost == 'localhost'){
										var panelView = app.stubs.views.panels['panel_0'];
										panelView.drop.createAndAddModel.call( panelView, json, undefined, 'EEE');
										return;
									}
									
									if( typeof( oauthToken ) == 'undefined'){
										
										alert('oauthToken not yet loaded.  Please try again');	
										
										return;
										
									}
									
									app.methods.blur.on();
									
									this.json = json;
									
									var imageSearchView = new google.picker.ImageSearchView();
			
				          var picker = new google.picker.PickerBuilder().
				              addView(new google.picker.DocsUploadView()).
				              addView(google.picker.ViewId.DOCS_IMAGES).
				              addView(google.picker.ViewId.IMAGE_SEARCH).
//					              addView(google.picker.ViewId.PHOTOS).
				              setOrigin((window.location.protocol + '//' + window.location.host)).
				              setOAuthToken(oauthToken).
				              setDeveloperKey(developerKey).
				              setCallback(this.doWithPicked).
				              build();
				              
				          picker.setVisible(true);
								},
								
								doWithPicked: function(data) {
									
									console.log(JSON.stringify( data ));
									
									if( data.action == 'cancel') app.methods.blur.off();
									
									if(typeof(data.docs)== 'undefined') return;
									
									app.methods.blur.off();
									app.methods.loading.on();
									
									var viewToken = data.viewToken[0],
											docs = data.docs[0],
											url = 'image/getSrcFromThisImage',
											postObj = {'google_id': app.stubs.google_id};
																		
											if(viewToken == 'image-search') {
												var orgSrc =  docs.thumbnails[1].url;
												postObj['url'] = orgSrc;						
											} else{
												postObj['fileId'] = docs.id;
											};
											
/*
									var that = this,
											outputFormat = 'image/png',
											imgURL = ( viewToken == 'image-search' ? docs.thumbnails[1].url: docs.id );
											
									tools.convertImgToBase64(imgURL, outputFormat, function(base64Img, width, height) {
										
										var baseArray  = base64Img.split(',');
										
										app.methods.loading.off();
		
										var panelView = app.stubs.views.panels['panel_0'];
										json.data.base64 = baseArray[1];
										if( typeof( orgSrc) != 'undefined' ) json.data.imgSrc = orgSrc;
										json.style.element.width = width + 'px';
										json.style.element.height = height + 'px';
										panelView.drop.createAndAddModel.call( panelView, json);
										
										
									});
											
									return;*/
									tools.ajax(url, postObj, 'post', function(obj) {

										app.methods.loading.off('D');
		
										var panelView = app.stubs.views.panels['panel_0'],
												json = app.methods.widgets.google.picker.json;
										json.data.base64 = obj.base64Data;
										json.data.width = obj.width;
										json.data.height = obj.height;
										if( typeof( orgSrc) != 'undefined' ) json.data.imgSrc = orgSrc;
										json.style.element.width = obj.width + 'px';
										json.style.element.height = obj.height + 'px';
										panelView.drop.createAndAddModel.call( panelView, json, undefined, 'FFF');
				
									});
								}
								
							}
							
						},
						
						submitUrl:{
							
							launch: function(json) {	
	
								$('#modal-box').width(720).height(100);
								
								app.methods.modal.on( 'true' );	
								var that = this;
								
								$('#modal-box').load('html/submit_url.html?version=' + version,
									function() {
										
										/*  REFACTOR HERE  filter for had url
										
										$('#submit-url-input').change( function() {
											var url = $(this).val();
											if( !is.url(url) ){
												console.log('Bad Url');	
											} else{
												console.log('URL is good !');
											}
											
											
										});
										*/
										
										app.methods.buttonDo.pressdown($('#submit-url-button'));
										
										$('#submit-url-input').focus();
										
										$('#submit-url-button').click(
											function(e) {
												
												e.preventDefault();

												var linkImg = $('#submit-url-input').val();
												
												if( linkImg == ''){
													
													toast('Please enter a URL.', 'keep', 3000, 'error', 'Incomplete.');
													app.methods.buttonDo.error($(this));
													
													return;
													
												};
												
												app.methods.modal.off('A6');
												app.methods.loading.on();
												
												var url = 'image/getSrcFromThisImage',
														postObj = {
															'google_id': app.stubs.google_id,
															'url' : linkImg,
															'saveToDrive': 'true'
														};
												
												//console.log(JSON.stringify( postObj));
														
												tools.ajax(url, postObj, 'post', function(obj) {
													
													if( obj.status == 'error'){
														
														toast('File upload has been blocked by host. Try dragging image to desktop, then back to the canvas.', 'keep', false, 'error', 'Something went wrong.');
														
													}else{
														
														if( typeof( obj.svg ) != 'undefined'){
															json = app.methods.createNewJson(obj);	
															json.collection = 'svg';
											  			json.data.svg = obj.svg.replace(/"/g, "&quot;");
														};
																				
														var panelView = app.stubs.views.panels['panel_0'];
														json.data.base64 = obj.base64Data;
														json.data.width = obj.width;
														json.data.height = obj.height;
														if( typeof( orgSrc) != 'undefined' ) json.data.imgSrc = orgSrc;
														json.style.element.width = obj.width + 'px';
														json.style.element.height = obj.height + 'px';
														panelView.drop.createAndAddModel.call( panelView, json, undefined, 'GGG');														
													};

													//console.log(JSON.stringify(  obj   , null, 2 ));
													
													app.methods.loading.off('E');

							
												});
	
											}
										);
										
										
									}
								);
							}
							
						},

						route: function( json ) {
							
							var panelView = app.stubs.views.panels['panel_0'];
							
							if( tools.inArray( json.collection, app.settings.charts)){
								app.methods.widgets.charts.launch(json);
							}
							
							//console.log(JSON.stringify( json    , null, 2 ));
							
							switch(	json.widget ){//
					  	  case 'Google Drive': {
									app.methods.widgets.google.picker.launch(json);
					  	  	break;
					  	  }
					  	  case 'Submit Url': {
									app.methods.widgets.submitUrl.launch(json);
					  	  	break;
					  	  }
					  	  case 'Rich Text': {
									app.methods.widgets.richtext.launch(json);
					  	  	break;
					  	  }
							}
							
						},
												
					},
										
					isDynamicAlign: function() {
						return !app.stubs.hasGrid && !app.stubs.resizeGuide || app.stubs.hasGrid && !app.stubs.resizeGuide
					},
					
					disableDropImage: function() {
						
						var elements2prevent = ['main', 'nav-top', 'left-menu'];
						
						for( var idx in elements2prevent){

							var ele = document.getElementById(elements2prevent[idx]);
							
							ele.addEventListener("dragover",function(e){
							  e = e || event;
							  e.preventDefault();
							},false);
							ele.addEventListener("drop",function(e){
							  e = e || event;
							  e.preventDefault();
							},false);								
							
						}
						
					},
					
					ready: function() {
						
						domReady = true;
						
						if( serverhost == 'localhost'){
							//app.methods.welcome.init();
							//app.methods.account.init();
						};

						editbox.methods.layers.redoLayers();
						
						if(serverhost == 'localhost'){
							app.methods.debug();
						}

						if(app.stubs.locked.length > 0 ) {
							
							this.animate( $('#lock2Button'), 'flash', 6);
							
							setTimeout(function(){
								toast('This canvas has some locked elements', 'locked', 15000);
							}, 1500);
						}


						if( app.stubs.fileNotWorkInIE ) {
							
							setTimeout(function(){
								toast('This file contains elements that will work only on Chrome.  Please open this file with the Chrome browser.', 'keep', false, 'error', 'Something went wrong.');
							}, 1500);
							
						}				


						if( app.stubs.fileWorksPartiallyInIE ) {
							
							setTimeout(function(){
								toast('This file contains elements with features that will work only on Chrome.  Please open this file with the Chrome browser.', 'keep', false, 'info', 'Note');
							}, 1500);
							
						}										
									
					},

					payment: {
											
						promotion: function() {
							
							app.methods.buttonDo.pressdown($('#promotion-button'));
							
							$('#promotion-button').unbind('click').on('click',  function(e) {
								
								e.preventDefault();
								
								var $button = $(this);

								if( $(this).hasClass('isDisabled')){
									toast('You have already reached maximum promo credits.', 'keep', 5000, 'error', 'Something went wrong.');
									return;
								};
								
								if( $('#promo-code').val() == ''){
									
									toast('Please enter in a promotional code.', 'keep', 5000, 'error', 'Something went wrong.')
									app.methods.buttonDo.error($button);
									return;
									
								};
			
								var url = 'credit/grantPromotionCredit',
										postObj = {
											'code': $('#promo-code').val(),
											'google_id': app.stubs.google_id,
											'os': tools.whatIs()
										};
										
								tools.ajax(url, postObj, 'post', function(obj) {
									
									console.log(JSON.stringify(  obj   , null, 2 ));
									
									var promo_code = $('#promo-code').val();
									$('#promo-code').val('');
									$('#promo-code').focus();
									
									switch(	obj.status ){
							  	  case 'used': {
											toast('You have already used the promtional code, "' + promo_code + '".', 'keep', 5000, 'error', 'Something went wrong.');
											break;
							  	  }
							  	  case 'maxed': {
											toast('You have already reached maximum promo credits.', 'keep', 5000, 'error', 'Something went wrong.');
											break;
							  	  }
							  	  case 'multi-maxed': {
											toast('This promotion code has reached the maximum credit alotted', 'keep', 5000, 'error', 'Something went wrong.');
											break;
							  	  }							  	  	
							  	  case 'applied': {
											toast('You already used a promo code for this marketing channel.', 'keep', 5000, 'error', 'Something went wrong.');
											break;
							  	  }										
							  	  case 'error': {
											toast('Promotional code not found.', 'keep', 5000, 'error', 'Something went wrong.');
							  	  	break;
							  	  }
							  	  case 'redeemed': {
											toast('Promotional code has already been redeemed by another customer.', 'keep', 5000, 'error', 'Something went wrong.');
							  	  	break;
							  	  }
							  	  case 'promoDiscountWorked': {
											var wording = 'success',
													color = '#3FC90D';
											app.methods.buttonDo.success($button, wording, color);
											
							  	  	toast('This promo code has been applied. Your subscription pricing has been discounted.', 'keep', false, 'success', 'Hurray it worked!');
							  	  	$('#top-message').html(obj.welcome);
							  	  	
							  	  	if( window.acceptTerms == 1 ) {
												setTimeout(function(){
													app.methods.modal.off();
												}, 5000);							  	  		
							  	  	}

							  	  	
											break;
							  	  }
							  	  case 'success': {
								
											var wording = 'success',
													color = '#3FC90D';
											app.methods.buttonDo.success($button, wording, color);
											
							  	  	toast('Congrats. You have added ' + obj.howManyDaysLeft + ' more days to your trial, a total of ' + obj.totalWeeks + ' weeks from the start.', 'keep', false, 'success', 'Hurray it worked!');
							  	  	$('#top-message').html(obj.welcome);
											window.accountActive = true;
											window.howManyDaysLeft = obj.howManyDaysLeft;
											
											setTimeout(function(){
												if( window.status_id == 4 ) {
													window.status_id = 2;
													app.methods.modal.off();
												}
											}, 5000);
											
											
											app.methods.account.fillCreditTables(obj)
											if( obj.creditArray.promo.disablePromoButton ){
												app.methods.account.disablePromoButton();
											};
							  	  	break;
							  	  }
									}
									
									if( obj.status != 'success' && obj.status != 'promoDiscountWorked'){
											app.methods.buttonDo.error($button);
									};
			
								});
			
							});
								
						},
						
						stripe: {
							
							whichAction: undefined,
							
							init: function() {
								
									this.stripe.config();
									this.stripe.bind.submitForm.call( this.stripe );
									this.stripe.bind.buttons.call( this.stripe );									

							},

							doAction: function(postObj) {

								var that = this,
										whichAction = app.methods.payment.stripe.whichAction,
										url = 'payment/' + whichAction;
										
								postObj['google_id'] = app.stubs.google_id;
											
								tools.ajax(url, postObj, 'post', function(obj) {
									
									console.log(JSON.stringify(  obj   , null, 2 ));
									
									if( obj.status == 'succeeded'){
										
										app.stubs.status_id = window.status_id = obj.status_id;
										app.stubs.subscription_interval = obj.subscription_interval;
										app.stubs.switchPrice = obj.switchPrice;
										
										switch(	whichAction  ){
								  	  case 'update': { 
												
								  	  	break;
								  	  }
								  	  case 'resubscribe': {
								  	  	console.log('doaction resubscribe');
	
								  	  	break;
								  	  }
								  	  case 'switchPlan': {
								  	  	
								  	  	console.log('doaction switchPlan');
						  	  	
								  	  	break;
								  	  }
								  	  case 'unsubscribe': {
								  	  	console.log('doaction unsubscribe');
								  	  	
								  	  	if( app.stubs.status_id == 7){  // limited
								  	  		// do nothing
								  	  	} else if( tools.inArray( app.stubs.status_id, [1, 2])) {
									  	  	if( !app.stubs.hasCreditCardOnFile ) {
									  	  		that.showTrialStuff();
									  	  	} else{
									  	  		app.methods.account.showTrialStuffHasCreditCardOnFile();
									  	  		app.methods.account.fillCreditTables(obj);
									  	  	}
								  	  	};
								  	  	
								  	  	
								  	  	break;
								  	  }
								  	  case 'subscribe': {
												console.log('doaction subscribe');
												app.methods.modal.canDisable = true;
												app.methods.modal.off('Ac');
												window.accountActive = true;
												window.subscribed = true;
												
								  	  	break;
								  	  }
										}
										
										if( tools.inArray(whichAction, ['unsubscribe','switchPlan','resubscribe'])){
											
							  	  	$('#top-message').html(obj.welcome);
							  	  	$('#switch-message').html(app.methods.account.getSwitchMessage());
							  	  	$('#unsubscribe-message').html(app.methods.account.getUnsubscribeMessage());
							  	  
											app.methods.animate( $('#resubscribe-message'), 'pulse', 2);								  	  	
											app.methods.animate( $('#unsubscribe-message'), 'pulse', 2);								  	  	
											app.methods.animate( $('#switch-message'), 'pulse', 2);								  	  	
											app.methods.animate( $('#top-message'), 'pulse', 2);		
										};
										
										toast(obj.snack, 'keep', false, 'info', 'Please note');	
										app.methods.account.displayPlanwrapper();
										app.methods.account.displayButtons();
										$('#payment-form').find('button').prop('disabled', false);
										app.methods.loading.off('B');
										app.methods.progressBar.stop('subcribe');
										

									} else{
										
										$('#payment-form').find('button').prop('disabled', false);
										$('#payment-form').find('button').removeAttr("disabled");
										app.methods.loading.off('C');
										app.methods.progressBar.stop('subscribe2');
										app.methods.modal.canDisable = true;
										
										$('#cc-number').select();
										
										toast(obj.error_message, 'keep', false, 'error', 'Something went wrong.');
										
									};
									
								});
							},
							
							config: function() { 
								Stripe.setPublishableKey('pk_live_TLEYccungtKOtiCXgreaNrjq');
							},
														
							stripeResponseHandler: function(status, response) {

								var $form = $('#payment-form');
								
								if( typeof( response.error ) != 'undefined'){
									
									console.log(JSON.stringify(  status   , null, 2 ));
									
									console.log(JSON.stringify( response    , null, 2 ));
									
									$form.find('.payment-errors').text(response.error.message);
									$form.find('button').prop('disabled', false);									
									app.methods.progressBar.stop('strip');
									toast(response.error.message, 'keep', 5000, 'error', 'Something went wrong.');
									
								}else{
										
								 	var postObj = {
												'token': response.id,
												'request_interval': $form.find('input[name=interval]:checked').val()
											};
											
									app.methods.payment.stripe.doAction(postObj);	
														
								};
								
							},
							
							bind: {
								
								submitForm: function() {
									
								 	var that = this;
								 	
									$('[data-numeric]').payment('restrictNumeric');
									$('.cc-number').payment('formatCardNumber');
									$('.cc-exp').payment('formatCardExpiry');
									$('.cc-cvc').payment('formatCardCVC');
									
									$.fn.toggleInputError = function(erred) {
									  this.parent('.form-group').toggleClass('has-error', erred);
									  return this;
									};								 	
								 	
						     	$('#payment-form').submit(function(e) {
						     	
						     		e.preventDefault();
						     	
						        var cardType = $.payment.cardType($('.cc-number').val());
						        $('.cc-number').toggleInputError(!$.payment.validateCardNumber($('.cc-number').val()));
						        $('.cc-exp').toggleInputError(!$.payment.validateCardExpiry($('.cc-exp').payment('cardExpiryVal')));
						        $('.cc-cvc').toggleInputError(!$.payment.validateCardCVC($('.cc-cvc').val(), cardType));
						        $('.cc-brand').text(cardType);
						
						        $('.validation').removeClass('text-danger text-success');
						        $('.validation').addClass($('.has-error').length ? 'text-danger' : 'text-success');
						     	
										var expiration = $("#cc-exp").payment("cardExpiryVal");
										$("#stripe-card-exp-month").val(expiration.month || 0);
										$("#stripe-card-exp-year").val(expiration.year || 0);
						     	
										app.methods.loading.on();
										app.methods.progressBar.start();
										var $form = $(this);
										$form.find('button').prop('disabled', true);
										$form.find('button').attr("disabled", "disabled");
										Stripe.card.createToken($form, that.stripeResponseHandler);
						       
						       
						       
						       return false;
						       
						     });
								  				
								},
								
								buttons: function() {
								 	
								 	if( window.market_id == 25){  // dollar deal
								 		$('#interval_1').parent().hide();
								 	};
								
									app.methods.buttonDo.pressdown($('#update-button'));
									app.methods.buttonDo.pressdown($('#subscribe-button'));
									app.methods.buttonDo.pressdown($('#unsubscribe-button'));
									app.methods.buttonDo.pressdown($('#resubscribe-button'));
									app.methods.buttonDo.pressdown($('#switch-button'));
									
									$('#payment-form').on('click', 'button[type=submit].subscription', function() {
										app.methods.payment.stripe.whichAction = $(this).attr('whichAction');
									});
									
									$('#subscription-button-wrapper').on('click', '#subscribe-button', function() {
										app.methods.loading.on();
										app.methods.progressBar.start();
										app.methods.payment.stripe.whichAction = $(this).attr('whichAction');
										var postObj = {
											'request_interval': $('#plan_wrapper').find('input[name=interval]:checked').val()	
										};
										app.methods.payment.stripe.doAction(postObj);										
									});
																		
									$('button[type=button].subscription').on('click', function() {
										app.methods.loading.on();
										app.methods.progressBar.start();
										app.methods.payment.stripe.whichAction = $(this).attr('whichAction');
										app.methods.payment.stripe.doAction({});
									});									
								}
							}
						},
						
						refer: {
							
							init: function() {	
								this.bindSendButton();
							},
							
							bindSendButton: function() {
								
								var that = this;
								
								$('#friend-email').on('click',  function(e) {	
									$(this).css('color', 'gray');
								});
								
								app.methods.buttonDo.pressdown($('#referral-button'));
							
								$('#referral-button').on('click',  function(e) {	
									
									e.preventDefault();
									
									var $button = $(this);
									
									var emailIs = $('#friend-email').val();
			
									if( emailIs == ''){
										
										toast('Please enter in the email of your friends.', 'keep', 5000, 'error', 'Something went wrong.');
										
										app.methods.buttonDo.error($button);
										
										$('#friend-email').focus();
										
										return;
										
									};
									
									var url = 'credit/refer',
											postObj = {
												'google_id': app.stubs.google_id,
												'friend_email': $('#friend-email').val(),
												'setSubject': $('#setSubject').val(),
												'bodyText': $('#bodyText').val()
											};
											
									tools.ajax(url, postObj, 'post', function(obj) {
										
										var resetIt = function() {
													$('#friend-email').focus();
												},
												getWTF = function(obj) {
													
													var useInstead = {
														'alreadySent': 'was already sent',
														'isYourownEmail': 'is your own email',
														'alreadyRegisterd': 'is already a registered user',
														'notValidEmail': 'is not a valid email',
														'mustBeGmail': 'is not a gmail account'
													};
													
									  	  	var wtf = '';
									  	  	for( var idx in obj.problems){
									  	  		var problem = obj.problems[idx],
									  	  				email = problem['email'],
									  	  				status = problem['status'];
									  	  		wtf += email + ' ' + useInstead[status] +',  ';
									  	  		console.log(wtf);
									  	  	}
													wtf = wtf.replace(/,\s*$/, ".");
								  	  		return wtf;
								  	  	},
								  	  	color = '#3FC90D',
												wording = 'sent';
												
										console.log(obj.status);
										
										switch(	obj.status ){
											
								  	  case 'mustBeGmail': {
												toast('The recipient of the email must have a Gmail account.', 'keep', 5000, 'error', 'Something went wrong.');
												resetIt();
												
												break;
								  	  }													
											
								  	  case 'notValidEmail': {
								  	  	
												toast('Email is not a valid one.', 'keep', 5000, 'error', 'Something went wrong.');
												resetIt();
												
												break;
								  	  }											
											
								  	  case 'oneEmailNotValidEmail': {
								  	  	
												toast('One email in your list is not valid.', 'keep', 5000, 'error', 'Something went wrong.');
												resetIt();
												
												break;
								  	  }
								  	  									
								  	  case 'alreadySent': {
								  	  	
												toast('You had already emailed this friend.', 'keep', 5000, 'error', 'Something went wrong.');
												resetIt();
												
												break;
								  	  }
								  	  
								  	  case 'isYourownEmail': {
								  	  	
												toast('Your can not refer yourself.', 'keep', 5000, 'error', 'Something went wrong.');
												resetIt();
												
												break;
								  	  }
								  	  
								  	  case 'alreadyRegisterd': {
								  	  	
												toast('Your friend is already an active user in Pictographr.', 'keep', 5000, 'error', 'Something went wrong.');
												resetIt();
												
												break;
								  	  }	
								  	  
								  	  case 'successOneFriend': {
								  	  	
								  	  	if( typeof( that.myreferral) == 'function'){
													that.myreferral();								  	  		
								  	  	};

												app.methods.buttonDo.success($button, wording, color);
								  	  	
								  	  	toast('Your friend was just send an email request for signing up.', 'success', false, 'success', 'Cool');
												$('#friend-email').val('');
												
								  	  	break;
								  	  }
								  	  
								  	  case 'someBad': {
								  	  	
								  	  	if( typeof( that.myreferral) == 'function'){
													that.myreferral();								  	  		
								  	  	};
								  	  	
								  	  	toast('Some emails on your list can not work: ' + getWTF(obj), 'keep', false, 'error', 'Something went wrong.');
												
								  	  	break;
								  	  }								  	  
								  	  
								  	  case 'someGoodSomeBad': {
								  	  	
								  	  	if( typeof( that.myreferral) == 'function'){
													that.myreferral();								  	  		
								  	  	};
								  	  	
								  	  	var color = 'orange';
								  	  	app.methods.buttonDo.success($button, wording, color);
								  	  	
								  	  	var emails = '';
								  	  	for( var idx in obj.problems){
								  	  		var problem = obj.problems[idx],
								  	  				email = problem['email'];
								  	  		emails += email + ', ';
								  	  	}
								  	  	emails = emails.replace(/,\s*$/, "");
								  	  	$('#friend-email').val(emails);
								  	  	
								  	  	toast('Some friends were just sent email.  The bad ones need your attention. ' + getWTF(obj), 'keep', false, 'info', 'Note');
												
								  	  	break;
								  	  }								  	  
								  	  	
								  	  case 'successManyFriends': {
								  	  	
								  	  	if( typeof( that.myreferral) == 'function'){
													that.myreferral();								  	  		
								  	  	};
								  	  	app.methods.buttonDo.success($button, wording, color);
								  	  	
								  	  	toast('Your friends were just sent email requests for signing up.', 'success', 3000, 'success', 'Cool.');
												$('#friend-email').val('');
								  	  	break;
								  	  }
										}
										
										if( !tools.inArray(obj.status, ['successOneFriend', 'successManyFriends', 'someGoodSomeBad']) ){
											$('#friend-email').css('color', 'red');
											app.methods.buttonDo.error($button);
										};
										
									});
								});				
							}
							
						}
						
					},
											
					welcome: {
						
						widthModal: 750,
						heightModal: 450,
						marginAndBorder: 5,
						noSlides: 0,
						slideSeen: 1,
						
						init: function() {
							$.extend(	true,	this, app.methods.payment);	
							this.launchModal();
						},
						
						launchModal: function() {
							
								var that = this;
										
								$('#modal-box')
									.width(this.widthModal)
									.height(this.heightModal);
								var canDisable = false;
								app.methods.modal.on( canDisable );	
								
								$('#modal-box').load('html/welcome_modal.html?version=' + version,
									function() {
										
										tools.ajax('auth/welcome', {}, 'post', function(obj) {
											
											//console.log(JSON.stringify(  obj   , null, 2 ));
											
											if( typeof( window.showAddOnDocInstructions ) != 'undefined'  ) {
												
												var linkToDocsAddon = 'https://chrome.google.com/webstore/detail/pictographr/lmhhmjokpnnbcmjgdeocdnjmceieiagk';
												var linkToSheetsAddon = 'https://chrome.google.com/webstore/detail/pictographr/jomkekoebpcpibnhagmiicljcjakihpa';
												var linkToFormsAddon = 'https://chrome.google.com/webstore/detail/pictographr/ndjfdecpjbpfjjkhinghgfhjojmcigop';
												var linkToOfficeAddins = 'https://store.office.com/en-us/app.aspx?assetid=WA104380605&ui=en-US&rs=en-US&ad=US&appredirect=false';
												
												$('#welcome-breadcrumb-container li:nth-child(1)').after('\
													<li  class="addonDocInstructions"><span>Add-ons</span></li>\
												');
												
												
												$('#welcome-slide-container .slide-panel:nth-child(1)').after('\
													<div  class="slide-panel addonDocInstructions" >\
														<div>\
															<div  id="addonDocInstructions-title">\
																Click the Add-ons or Add-ins you want to install.&nbsp;&nbsp;Or you can skip this part and do it later.<br />\
															</div>\
														</div>\
														<div  id="addonDocInstructions-div"  >\
															<a partner_id=9 class="addonLink" href="' +  linkToDocsAddon + '" target="_blank">\
																<img src="img/addonDocs.png">\
															</a>\
															<a partner_id=13  class="addonLink" href="' +  linkToSheetsAddon + '" target="_blank">\
																<img src="img/addonSheets.png">\
															</a>\
															<a partner_id=11  class="addonLink" href="' +  linkToFormsAddon + '" target="_blank">\
																<img src="img/addonForms.png">\
															</a>\
															<a partner_id=11  class="addonLink" href="' +  linkToOfficeAddins + '" target="_blank">\
																<img src="img/officeAddinsLinkPng.png">\
															</a>\
														</div>\
													</div>\
												');
												
												
												$('#addonDocInstructions-div .addonLink[partner_id=' + obj.first_partners_id + ']').bind('click', function( event ) {
													event.preventDefault();
													toast( 'You already installed that one.', 'keep', false, 'error', 'Opps');
												})
																								
												
											}
											
												
												$('#welcome-breadcrumb-container li:nth-child(2)').after('\
													<li  class="addonDocInstructions"><span>Chrome</span></li>\
												');
												
												$('#welcome-slide-container .slide-panel:nth-child(2)').after('\
													<div  class="slide-panel addonDocInstructions" >\
														<div>\
															<div  id="more-features-on-chrome">\
																We love the Chrome browser.  The following features are only available on Chrome.<br />\
															</div>\
														</div>\
														<div>\
															<a  href="#" target="_blank">\
																<img src="img/onlychrome.png">\
															</a>\
														</div>\
													</div>\
												');
											

											that.layout.call(that, obj);
											that.bind.init.call(that);
											that.promotion();
											that.refer.init();

										});

									}
								);
						},
						
						layout: function(obj) {
							
							var countSlides = function() {
										var count = $('#long-wrapper').find('.slide-panel').length;
										return count;
									};
									
							this.noSlides = countSlides();console.log('this.noSlides', this.noSlides);
	
							$('#long-wrapper').css({
							 width: (this.widthModal + this.marginAndBorder) * this.noSlides + 'px'	
							});
							$('#share-container, .slide-panel').css({
							 width: this.widthModal + 'px'	
							});
							
							$('#welcome-message-div').html(obj.welcome_text);
							$('#promo-top-message').html(obj.promo_message);
							$('#welcome-terms-div').html(obj.terms);
						},
						
						bind: {
							
							init: function() {	

								this.bind.nav.call( this );
								this.bind.allowEmailPromotion.call( this );
								this.bind.acceptTerms.call( this );
								
							},
							
							nav: function() {
				
								var that = this,
										slideAllowed = 1,
										curSlide = 1,
										changeButton = function() {
											if( that.slideSeen == that.noSlides ){
												$('#continue-button').text('Get Started');
											}
											else{
												$('#continue-button').text('Continue');
											}
										},
										highlightBreadCrumbUpToslideSeen = function(){
											
											$('.breadcrumb-steps li a').css({		
												background: '#C6DBFC'
											});
												
											$('#welcome-breadcrumb-container').find('style').remove();
							
											var styleIs = '<style>';
							
											for( var idx = 1; idx <= that.noSlides; idx++){
												styleIs += '\
													.breadcrumb-steps li:nth-child(' + idx + ') span:after{border-left-color: #C6DBFC;}\
												';
											}
											
											for( var idx = 1; idx <= that.slideSeen; idx++){
												
												$('.breadcrumb-steps li:nth-child(' + idx + ') span').css({		
													background: '#4285F7',
													cursor: 'pointer'
												});					
												
												styleIs += '\
													.breadcrumb-steps li:nth-child(' + idx + ') span:after{border-left-color: #4285F7;}\
												';
											}
											
											styleIs += '</style>';
											
											styleIs =  styleIs.replace(/[\n\r]+/g, '');
											styleIs =  styleIs.replace(/\s{2,10}/g, ' ');	
													
											$('#welcome-breadcrumb-container').prepend(styleIs);	
																				
										};
								
								$('.breadcrumb-steps li').on('click', function() {
									
									
									
									var gotoSlide = $(this).index() + 1;
									if( gotoSlide > slideAllowed) return;
									if( gotoSlide > that.slideSeen) {
//										console.log('gotoSlide :' + gotoSlide);
//										console.log('slideSeen :' + that.slideSeen);
//										console.log('clicked');
										highlightBreadCrumbUpToslideSeen();
									}
									curSlide = $(this).index() + 1;
//									console.log('curSlide' + curSlide);
									$('#welcome-slide-container').scrollTo($('#welcome-slide-container .slide-panel:nth-child(' + curSlide + ')'), 300, function(){
										changeButton();
									});
									return false;
								});
				
								app.methods.buttonDo.pressdown($('#continue-button'));
						
								$('#continue-button').on('click', function() {

									if( that.slideSeen == that.noSlides){
										
										if( $('#acceptTerms').is(":checked") ){
											
											$('#modal-box').addClass('animated bounceOutUp');

											
											$('#modal-box').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
												$('#modal-box').removeClass('animated bounceOutUp');
												app.methods.modal.off('A4');
												$('#modal-box').unbind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');											
											});
											
										}else{
											toast('Please accept "Terms and Conditions" to continue', 'keep', false, 'info', 'To continue');
										};

									} else{

										curSlide++;
										
//										if( curSlide == 3 && $('#friend-email').val() != ''){
//											
//											toast( 'You forgot to click the send button.  Or try clearing out the email field.', 'keep', 10000, 'error', 'Opps');
//											curSlide--;
//											return false;
//										};
										
										that.slideSeen++;
										slideAllowed++;
										$('#foo').append('slide seen: ' + that.slideSeen);										
										
										highlightBreadCrumbUpToslideSeen();
										//console.log($('#welcome-slide-container .slide-panel:nth-child(' + that.slideSeen + ')'));
										$('#welcome-slide-container').scrollTo($('#welcome-slide-container .slide-panel:nth-child(' + that.slideSeen + ')'), 300, function(){
											changeButton();
										});
									}
								return false;
								});
							},
							
							allowEmailPromotion: function() {
								
								$(document).on('click', '#allowEmailPromotion', function() {
									
									var postObj = {
												field: 'allowEmailPromotion',
												google_id: app.stubs.google_id,
												value: ( $('#allowEmailPromotion').is(":checked") ? 1: 0 )
											};

									var url = 'auth/toggleAccept';
											
									tools.ajax(url, postObj, 'post', function(obj) {
										
										console.log(JSON.stringify(  obj   , null, 2 ));
										
									});
										
									
								})								
							},
							
							acceptTerms: function() {
								
								$(document).on('click', '#acceptTerms', function() {
									
									var postObj = {
												'field': 'acceptTerms',
												'value': ( $('#acceptTerms').is(":checked") ? 1: 0 ),
												'google_id': app.stubs.google_id,
												'os': tools.whatIs()
											};

									var url = 'auth/toggleAccept';
									
									tools.ajax(url, postObj, 'post', function(obj) {
										
										$('#welcomeLink').parent().hide();
										console.log(JSON.stringify(  obj   , null, 2 ));
										
										window.acceptTerms = 1;
										
										if( typeof( tools.urlGet('whenUserHasAccountThen') ) == 'string' ) {
											if( opener ) opener.whenUserHasAccountThen(app.stubs.google_id);
										}
										
									});		
								})	
							}
							
						}
						
					},

					account: {
						
						widthModal: 600,
						heightModal: 547,
						
						getAccountData: function() {
							
							var that = this;
							
							var url = 'credit/getAccountData';
									
							tools.ajax(url, { google_id: app.stubs.google_id}, 'post', function(obj) {
								
								$('#accountPickerWrapper').show();
								
								console.log(JSON.stringify(  obj   , null, 2 ));
								
								app.stubs.status_id = window.status_id = obj.status_id;
								app.stubs.subscription_interval = obj.subscription_interval;
								app.stubs.niceTrialEndDate = obj.niceTrialEndDate;
								app.stubs.niceStartDate = obj.timeLeftArr.niceStartDate;
								app.stubs.hasCreditCardOnFile = obj.hasCreditCardOnFile;
								app.stubs.switchPrice = obj.switchPrice;
								app.stubs.pricing = obj.pricing;
								
								$('#top-message').html(obj.welcome);

								if( that.isTrialStatus() ){  // trial
	;
									// $('#promo-top-message').text(obj.marketsArray.promo_message);
									
									that.fillCreditTables(obj);
									that.fillPromoSection(obj);
									
					  	  	$('#requested-count').text(typeof( obj.creditArray.refer.count) ==  'number'  ?  obj.creditArray.refer.count : '0' );
			
					  	  	$('#credited-count').text(typeof( obj.creditArray.refer.count) ==  'number'  ?  obj.creditArray.refer.earned : '0' );
					  	  	
					  	  	if( !app.stubs.hasCreditCardOnFile ) {
					  	  		console.log('A');
					  	  		that.showTrialStuff();
					  	  	} else{
					  	  		console.log('B');
					  	  		that.showTrialStuffHasCreditCardOnFile();
					  	  	}
								
									if( obj.creditArray.promo.disablePromoButton ){
										that.disablePromoButton();
									};
					  	  	
					  	  	that.bindSlider();
					  	  	
								} else if( that.isStatusCanceled() ){
									
									that.showCanceledStuff();
									
								} else { // status is subscribed
									console.log('C');
									that.showSubscriptionStuff();
									that.bindSlider();
								}
								
								if( tools.inArray(app.stubs.status_id, [5, 6, 7, 8, 9]) ){
									$('.refer-stuff').hide();
								}		
								
								that.tailorSize();
								
								$('#price-monthly').text(obj.pricing.monthly);
								$('#price-yearly').text(obj.pricing.yearly);

								that.displayPlanwrapper();
								that.displayButtons();

							});
						},												
						
						init: function() {
							$.extend(	true,	this, app.methods.payment);
							this.launchModal();
						},
						
						launchModal: function() {
								var that = this;
										
								$('#modal-box')
									.width(this.widthModal)
									.height(this.heightModal);
									
								if( !window.accountActive){
									var canDisable = false;
								} else{
									var canDisable = true;
								};
								
								app.methods.modal.on( canDisable );	
								
								$('#modal-box').load('html/account_trial_modal.html?version=' + version,
									function() {
										
										if( !window.accountActive){
											$('.close-button-wrapper').hide();
										};
														
										that.getAccountData();
										that.promotion();
										that.stripe.init.call(that);
										that.refer.init();
										
									}
								);
						},
						
						fillCreditTables: function(obj) {
							
							
							$('.myreferral-list').empty();
			  	  	$('#promo-count').text(obj.creditArray.promo.earned - 1);
			  	  	$('#credit-count').text(obj.creditArray.total - 1);
			  	  	$('#adddays-count').text(obj.creditArray.days);		
			  	  	
			  	  	$('.referral-list').empty();
			  	  						
			  	  	for( var idx in obj.creditArray.refer.list){
			  	  		var referral = '<tr  class="' + 
			  	  			( tools.isOdd(idx) ? 'normalRow': 'alternateRow' ) + 
			  	  			'" ><td>' + obj.creditArray.refer.list[idx].email + 
			  	  			'</td><td>' + obj.creditArray.refer.list[idx].redeemed + 
			  	  			'</td><td>' + obj.creditArray.refer.list[idx].nicedate + 
			  	  			'</td></tr>';
			  	  		$('.referral-list').append(referral);
			  	  	}
			  	  	
			  	  	$('.promo-list').empty();
			  	  	
			  	  	for( var idx in obj.creditArray.promo.list){
			  	  		var promo = '<tr  class="' + 
			  	  			( tools.isOdd(idx) ? 'normalRow': 'alternateRow' ) + 
			  	  			'" ><td>' + obj.creditArray.promo.list[idx].merchant_name + 
			  	  			'</td><td>' + obj.creditArray.promo.list[idx].promo_code + 
			  	  			'</td><td>' + obj.creditArray.promo.list[idx].nicedate + 
			  	  			'</td></tr>';
			  	  		$('.promo-list').append(promo);
			  	  	}
			  	  	

						},
						
						fillPromoSection: function(obj) {						
							$('#promo-top-message').html(obj.promo_message2);
						},
						
						isTrialStatus: function() {
							return tools.inArray(app.stubs.status_id, [1, 2, 4]);
						},
						
						isSubscriptionStatus: function() {
							return tools.inArray( app.stubs.status_id, [5, 6, 7, 9] );
						},
						
						isStatusCanceled: function() {
							return tools.inArray( app.stubs.status_id, [4, 8] );
						},

						disablePromoButton: function() {
							$('#promotion-button').addClass('isDisabled');
							$('#promotion-button').css({
								'-webkit-box-shadow': 'none',
								'-moz-box-shadow': 'none',
								'box-shadow': 'none'
							});
						},

						showCanceledStuff: function() {
							
							$('.refer-stuff, .subscription-stuff, .trial-stuff').hide();
							$('#link-name-1').text('Subscribe');
							
							$('button[type=button].subscription').each( function() {
								$(this).appendTo($('#subscription-button-wrapper'));
							});
						},
						
						showTrialStuff: function() {
							
							$('.subscription-stuff').hide();
						},
						
						showTrialStuffHasCreditCardOnFile: function() {
							
							$('.trial-stuff').show();
							app.methods.account.tailorSize();

							$('#link-name-1').text('Card');
							$('#link-name-2').text('Subscribe');
							
							$('#link-name-2').click();

							var $divElem = $(document.createElement("div"));
							$divElem.attr('id', 'subscribe-message');
							$divElem.html('To continue using Pictographr beyond your trial period,&nbsp;&nbsp;please choose a plan and subscribe.');
							$divElem.addClass('button-message');
							
							$divElem.appendTo($('#subscription-button-wrapper'));
							
							$('#plan_wrapper').appendTo($('#subscription-button-wrapper'));
														
							$('#subscribe-button').appendTo($('#subscription-button-wrapper'));
							
						},
						
						getSwitchMessage: function() {
							if( app.stubs.status_id == 9 ){ // transition
								var oldPlan = ( app.stubs.subscription_interval == 1  ? 'monthly' : 'yearly');
								var message = 'You can still decide to keep your $' + app.stubs.pricing[oldPlan] +  ' ' + oldPlan + ' plan.&nbsp;&nbsp;If you do, you will continue on the ' + oldPlan + ' plan.';
							}else if( app.stubs.status_id == 6 ){ // subscribed
								var newPlan = ( app.stubs.subscription_interval == 1  ? 'yearly':  'monthly');
								var message = 'You can switch to a $' + app.stubs.pricing[newPlan] +  ' ' + newPlan + ' plan.&nbsp;&nbsp;If you do, you will be switched and billed for the new ' + newPlan + ' plan at the end of this billing cycle.';
							}else if( app.stubs.status_id == 5 ){ // starts
								var newPlan = ( app.stubs.subscription_interval == 1  ? 'yearly':  'monthly');
								var message = 'You can still switch to the $' + app.stubs.pricing[newPlan] +  ' ' + newPlan + ' plan right now.';
							};
							return message;
						},
						
						getUnsubscribeMessage: function() {
							if( app.stubs.status_id == 5 ){ // starts
								var message = 'You can end your future subscription to Pictographr.&nbsp;&nbsp;If you do, you can still continue your trial period until ' + app.stubs.niceTrialEndDate + '.';
							}else if( app.stubs.status_id == 6 ) { // subscribed
								var message = 'You can end your subscription to Pictographr.&nbsp;&nbsp;If you do,&nbsp;&nbsp;you will continue to have access to this service until your next billing cycle.';
							}else if( app.stubs.status_id == 9 ) { // subscribed
								var message = 'You can end your subscription to Pictographr.&nbsp;&nbsp;If you do, future plan transitions will be canceled and you will still continue to have access to this service until your next billing cycle.';
							};
							return message;
						},						
						
						showSubscriptionStuff: function() {
							
							$('.refer-stuff, .subscription-stuff').show();
							
							$('.trial-stuff').hide();
							$('#link-name-1').text('Credit Card');
							$('#link-name-2').text('Subscription');

							var messages = {
								'unsubscribe': app.methods.account.getUnsubscribeMessage(),
								'switch': app.methods.account.getSwitchMessage(),
								'resubscribe': 'You can resubscribe and avoid interrurption to this service at the end this next billing cycle.'
							};
							
							$('button[type=button].subscription').each( function() {
								
					    	var buttonNameArray = $(this).attr('id').split('-'),
										buttonName = buttonNameArray[0];
								var $divElem = $(document.createElement("div"));
								$divElem.attr('id', buttonName + '-message');
								$divElem.html(messages[buttonName]);
								$divElem.addClass('button-message');
								
								$divElem.appendTo($('#subscription-button-wrapper'));
								$(this).appendTo($('#subscription-button-wrapper'));
							});
						},
						
						displayPlanwrapper: function() {
								
								if( tools.inArray( app.stubs.status_id, [1, 2, 3, 4, 8] )){
									$('#plan_wrapper').show();
								} else {
									$('#plan_wrapper').after($('#stripesecurebadge'));
									$('#plan_wrapper').hide();
								}
								
								if( app.stubs.hasCreditCardOnFile &&  tools.inArray( app.stubs.status_id, [1, 2] )) {
									$('#cc-button-wrapper').before($('#stripesecurebadge'));
								}

						},
						
						displayButtons: function() {
							
								console.log('displaying buttons');
							
								switch(	app.stubs.status_id  ){
									case 1:
						  	  case '1': { // initial
						  	  	
						  	  	if( app.stubs.hasCreditCardOnFile){
						  	  		var buttons2Show = ['update', 'subscribe'];
						  	  	}else{
						  	  		var buttons2Show = ['subscribe'];
						  	  	};
										
						  	  	break;
						  	  }
						  	  case 2:
						  	  case '2': { // trial is extended
						  	  	
						  	  	if( app.stubs.hasCreditCardOnFile){
						  	  		var buttons2Show = ['update', 'subscribe'];
						  	  	}else{
						  	  		var buttons2Show = ['subscribe'];
						  	  	};
						  	  	
						  	  	break;
						  	  }
						  	  case 3:
						  	  case '3': { // pending subscription is canceled by user
										var buttons2Show = ['subscribe'];
						  	  	break;
						  	  }
						  	  case 4:
						  	  case '4': { // trial expired
										var buttons2Show = ['subscribe'];
						  	  	break;
						  	  }
						  	  case 5:
						  	  case '5': { // start
										var buttons2Show = ['update', 'unsubscribe', 'switch'];
						  	  	break;
						  	  }
						  	  case 6:
						  	  case '6': { // subscribed
										var buttons2Show = ['update', 'unsubscribe', 'switch'];
						  	  	break;
						  	  }
						  	  case 7:
						  	  case '7': { // limited - will cancel when subscription cycle ends
										var buttons2Show = ['update', 'resubscribe'];
						  	  	break;
						  	  }
						  	  case 8:
						  	  case '8': {  // subscription canceled by user
										var buttons2Show = ['subscribe'];
						  	  	break;
						  	  }
						  	  case 9:
						  	  case '9': { // transition between plans
										var buttons2Show = ['update', 'unsubscribe', 'switch'];
						  	  	break;
						  	  }
								}
								
								$('.subscription, .button-message').hide();

								for( var idx in buttons2Show){
									$('#' + buttons2Show[idx]+ '-button').show();
									$('#' + buttons2Show[idx]+ '-message').show();
								}
								  	  	
			  	  		if( app.stubs.status_id == 9){ // transition
			  	  			$('#switch-button').html('SWITCH BACK');
			  	  		}else{
			  	  			$('#switch-button').html('SWITCH PLAN');
			  	  		};
			  	  	
						},
						
						tailorSize: function() {
							
							
							var modalWidth = $('#accountPickerWrapper').width(),
									countTabs = $('#accountPickerWrapper').find('.account-tab-panel:visible').length;
									
							this.tabWidth = modalWidth / countTabs;
							
							$('#accountPickerWrapper .nav li, #accountPickerWrapper .moving-line').width(this.tabWidth);
							$('.account-stretched-wrapper').width(modalWidth * countTabs);		
						},
						
						bindSlider: function() {
							
							var that = this;
							
							$('#accountPickerWrapper a')
								.not($('a#amabassador_program'))
								.not($('a.unlicenced-count'))
								.not($('a.launchAddon'))
								.unbind('click')
								.click(function (e) {
								
								var idx = $(this).parent('li:visible').index();
								
								that.slideToPanel(idx, 400);
								
								var timeoutID = window.setTimeout(function(){
									$('.ripple-wrapper').empty();
								}, 5000);
								
							})
						},
						
						slideToPanel: function( idx, speed ) {
							
							//console.log(idx);
							//console.log(app.stubs.status_id);
							//console.log(this.isSubscriptionStatus(app.stubs.status_id));
							
							if( idx == 3 && this.isSubscriptionStatus(app.stubs.status_id)){
								var tabLeft = 0;
							}else if(  idx == 4 && this.isSubscriptionStatus(app.stubs.status_id) ){
								var tabLeft = this.tabWidth;
							}else{
								var tabLeft = idx * this.tabWidth;
							};

							$('#accountPickerWrapper').find('.moving-line').css({'left': tabLeft + 'px'});
							
							var $selected = $('#accountPickerWrapper').find('.account-tab-panel:eq( ' + (idx)+ ' )');
							
							$('#accountPickerWrapper').find('.account-content').scrollTo($selected, speed);
							
						}
					},
											
					changeCustomPageSize: function() {
			    	var value = $('#custom-pagesize').val(),
			    			patt = /x/g;
			    	if( !patt.test(value) || value.length == 1){
			    		toast('Please enter correct format. (i.e 300x250)', 'keep', 10000, 'error', 'Opps');
			    		$('#custom-pagesize').val('300x250');
			    		return;
			    	};
			    	
			    	var pageSizeArray = value.split('x'),
								width = parseInt(pageSizeArray[0]),
								height = parseInt(pageSizeArray[1]);

						if( width > 7200 || height > 7200){
			    		toast('Dimensions can not be that large.', 'keep', 10000, 'error', 'Opps');
			    		$('#custom-pagesize').val('300x250');
			    		return;
						};
								
						app.stubs.curPaperShape.pageSizeCustom.width = width;		
						app.stubs.curPaperShape.pageSizeCustom.height = height;		
								
			    	app.methods.changeCanvasShape();
					},
									
					windowResize: function() {
						
						var	that = this,
								resizeId,
								doneResizing = function() {
									$('#nav-top').css('overflow', 'visible');
								};
								
						$(window).on(	'resize',
							function() {
								$('.sub-card.active').click();
								$('.sub-card-container.active').click();
								app.methods.dim.set();
								app.stubs.zoom.idx = app.menu.resize.getBestIdx();
								app.menu.resize.makeChange();
								app.methods.clearActive( undefined, undefined, 'resize window');	
								$('#nav-top').css('overflow', 'hidden');
								clearTimeout(resizeId);
								resizeId = setTimeout(doneResizing, 500);	
								
							}
						);
					},
										
					animate: function( $element, how, numTimes) {
						
						var miliSecsTillNext = 1500,
								what = function() {
									
//									console.log('flashing');
							
									$element.addClass('animated ' + how);
									
									setTimeout(function(){
		
										$element.removeClass('animated ' + how);
										
									}, miliSecsTillNext/2);
									
								},
								doit = new tools.Doit();
								
							what();
								
							doit.iterations = 1;	
								
							doit.who = $element.attr('id');
							
							doit.what = what;
			
							doit.numTimes = numTimes;

							doit.interval = setInterval(doit.doo, miliSecsTillNext);
							
							app.stubs.doitQueue.push(doit);
						
					},
					
					createNewJson: function(obj) {
						
						console.log('createNewJson');
						
						app.stubs.placement.leftPlace += app.stubs.placement.increment;
						app.stubs.placement.topPlace += app.stubs.placement.increment;
						
						var dropLeft = app.stubs.placement.leftPlace,
								dropTop = app.stubs.placement.topPlace;
								
						var json = {
									style:{
											element: {
												left: dropLeft + 'px',
												top: dropTop + 'px',
											},
											resizeWrapper:{},
											image: {
				                'border-width': '0px',
				                'border-color': '#000000',
				                'border-style': 'solid',
				                'border-radius': '0%',
				                opacity: 1
											}							
									},
									data:{
										rotation: 0,
			      				shadow: 0,
			      				mirror: 1
									}
						};
						
						  			
						var droppedWidth = app.stubs.curCanvasSize.width  / 2,
								droppedHeight = (app.stubs.curCanvasSize.width / obj.width * obj.height) / 2;
		  			
		
						json.justDropped = true;
						json.data.width = obj.width;
						json.data.height = obj.height;
						json.style.element.width = droppedWidth + 'px';
						json.style.element.height = droppedHeight + 'px';
						
						return json;
					},
										
					activate:{
						init: function() {
							
							var that = this;
							
							this.body();
							this.main();
							this.panel();
							
							that.editbox();
							
							app.methods.onKeypress();
							
						},
						
						body: function() {
/*
							$('#left-menu').click( function() {
								return false;
							})
							$('.bubble').click( function() {
								return false;
							})							
							*/
						},
						main: function() {
							
							var $main = $('#main');
							
							$main.on('mousedown',	function(event)	{
								event.stopPropagation();
							});

							$main.on('click', function(e) {

								//app.methods.clearActive( ['removeOntop'], 'exclude', 'main click');								
								app.methods.clearActive(['removeToast'], 'exclude', 'main click 2');								
								
								e.stopPropagation();			
								return false;
							})
							
							$main.dblclick(	function(e)	{
								var whichTarget = 'main';
								app.menu.resize.matchZoomTargetSize(whichTarget);
								if ( document.selection ) {
									document.selection.empty();
								} else if ( window.getSelection ) {
									window.getSelection().removeAllRanges();
								}
								e.stopPropagation();
								return false;
							});
							
							$main.scroll(function() {
								//$('#bar').append('scrolling </br>');
								app.methods.setMainScrolled();
								return false;
							});
							
						},
						canvas: function() {
	
							app.methods.changeCanvasShape();

							var moveIt = function( whichDom ) {
								$('#' + whichDom).on('mousedown',	function (e, ui) {

									if( e.button == 2 || e.ctrlKey) {
										
										app.stubs.mainCanScroll = true;
											
										app.stubs.clickedMousPosX = e.pageX;
										app.stubs.clickedMousPosY = e.pageY;
										
										app.stubs.mainCurScollX = $('#main').scrollLeft();
										app.stubs.mainCurScollY = $('#main').scrollTop();
										
									}
					
									$('#' + whichDom).on('mousemove', function	(e)	{

										if( e.button == 0 ) return false;
										app.methods.scrollMain($(this), e.pageX, e.pageY);
										
										return false;
												
									}).on('mouseleave', function	(e)	{
										
											$('#' + whichDom).off('mousemove');
											$('#' + whichDom).off('mouseup');
											$('#' + whichDom).css('cursor',	'default');
											return false;
									})
									.on('mouseup', function	(e)	{
											
											$('#' + whichDom).off('mousemove');
											$('#' + whichDom).off('mouseup');
											$('#' + whichDom).css('cursor',	'default');
											return false;
									});
									
									return false;
				
								});							
							}
							
							moveIt('main');
							moveIt('canvas-wrapper');

							app.methods.fillPaperInputs();

						},
						panel: function() {
							
							var name = 'panel_0',
									panel_idx = 0;
							app.stubs.views.panels[name] = new views.Panel({
								id: name,
								panel_idx: panel_idx
							});
							
							$('#align-guide-vertical').css('left', app.settings.gridSpacing * scale + 'px' );
							$('#align-guide-horizontal').css('top', app.settings.gridSpacing * scale + 'px' );
							$('#panel_0').css('background-size', scale * app.settings.gridSpacing + 'px');
							
							$('#panel_0').dblclick(	function(event)	{
								app.menu.resize.matchZoomTargetSize('main');
								return false;
							});
							
							
						},
						
						editbox: function() {
						
							editbox = app.stubs.views.editbox = new EditBoxView();
							
						}
					},
					
							
					fillPaperInputs: function() {
						
							if( typeof( app.stubs.curPaperShape.pageSizeCustom ) == 'undefined' ){
								app.stubs.curPaperShape.pageSizeCustom = tools.deepCopy(app.settings.paperSizes.pageSizeCustom.default);
							};
							
							var isSocialLayout = function(pagesize) {
								if(typeof(pagesize ) == 'undefined') return false;
								for( var key in app.settings.socialNetworks){
									if( key == pagesize ) return true;
								}
								return false;
							};
								
							if( isSocialLayout(app.stubs.curPaperShape.pageSize)) {
					
								$('input[name=' + app.stubs.curPaperShape.pageSize + '][value=' + app.stubs.curPaperShape.layout + ']').prop('checked', true);
															
							} else if(app.stubs.curPaperShape.pageSize == 'custom'){
								
								$('input[value=custom]').prop('checked', true);
						    $('input:radio[name=facebook]').prop('checked', false);
								$('input:radio[name=page-size]').prop('checked', false);
								$('input:radio[name=page-orientation]').prop('checked', false);
								$('input:radio[name=twitter]').prop('checked', false);	
								$('#custom-pagesize').val(app.stubs.curPaperShape.pageSizeCustom.width + 'x' + app.stubs.curPaperShape.pageSizeCustom.height);
								
						    $('#custom-pagesize').unbind('change').bind('change', function() {
									app.methods.changeCustomPageSize();
						    });								
						    
							} else{
					
								$('input[value=' + app.stubs.curPaperShape.pageSize + ']').prop('checked', true);
								$('input[value=' + app.stubs.curPaperShape.layout + ']').prop('checked', true);
								$('input[value=custom]').prop('checked', false);
								app.stubs.curPaperShape.pageSizeCustom = tools.deepCopy(app.settings.paperSizes.pageSizeCustom.default);
								$('#custom-pagesize').val(app.stubs.curPaperShape.pageSizeCustom.width + 'x' + app.stubs.curPaperShape.pageSizeCustom.height);							
								
							}
					},

						
					onKeypress: function() {
						
						var rx = /INPUT|SELECT|TEXTAREA/i,
								microElementShift = function( direction ) {
									var cid = app.stubs.activeCid,
											view = app.stubs.views.elements[cid],
											element = view.model.get('json').style.element,
											curLeft = parseFloat(element.left),
											curTop = parseFloat(element.top);
											
								  switch( direction ){
							  	  case 'left': {
											var newLeft = curLeft - 1;
											element.left = newLeft + 'px';
							  	  	break;
							  	  }
							  	  case 'up': {
											var newTop = curTop - 1;
											element.top = newTop + 'px';
							  	  	break;
							  	  }
							  	  case 'right': {
											var newLeft = curLeft + 1;
											element.left = newLeft + 'px';
							  	  	break;
							  	  }
							  	  case 'down': {
											var newTop = curTop + 1;
											element.top = newTop + 'px';
							  	  	break;
							  	  }
							  	}
							  	
							  	view.scale();
							  	app.methods.revert.saveHistory('microElementShift');
											
								},
								microGroupShift = function( direction ) {
									
									app.methods.groupyBox.dragGrouped.cloneIntoGroupy()
									
									var curLeft = parseFloat($('#groupy').css('left')),
											curTop = parseFloat($('#groupy').css('top'));
											
								  switch( direction ){
							  	  case 'left': {
											var newLeft = curLeft - 1;
											$('#groupy').css('left',  newLeft + 'px');
							  	  	break;
							  	  }
							  	  case 'up': {
											var newTop = curTop - 1;
											$('#groupy').css('top', newTop + 'px');
							  	  	break;
							  	  }
							  	  case 'right': {
											var newLeft = curLeft + 1;
											$('#groupy').css('left', newLeft + 'px');
							  	  	break;
							  	  }
							  	  case 'down': {
											var newTop = curTop + 1;
											$('#groupy').css('top', newTop + 'px');
							  	  	break;
							  	  }
							  	}
							  	
							  	app.methods.clearActive(['transferClonedStylesToElements'], 'include', 'microGroupShift');
							  	
							  	app.methods.revert.saveHistory('microGroupShift');
											
								};
						
						$(document).bind("keydown keypress", function(e){
							
					    if (e.keyCode === 9) { // tab key -- http://stackoverflow.com/questions/2237497/how-to-make-the-tab-key-insert-a-tab-character-in-a-contenteditable-div
					        e.preventDefault();  // this will prevent us from tabbing out of the editor
					
					        // now insert four non-breaking spaces for the tab key
					        var editor = document.getElementById("editor");
					        var doc = editor.ownerDocument.defaultView;
					        var sel = doc.getSelection();
					        var range = sel.getRangeAt(0);
					
					        var tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
					        range.insertNode(tabNode);
					
					        range.setStartAfter(tabNode);
					        range.setEndAfter(tabNode); 
					        sel.removeAllRanges();
					        sel.addRange(range);
					    }
							
							if( app.stubs.disableMicroShift ) return;

//							if (e.ctrlKey &&  String.fromCharCode(e.which) === '1') { 
//									alert('');
//							    $('body').attr('oncontextmenu','');
//							}

							if( typeof( app.stubs.activeCid ) != 'undefined' ){
	
							  switch( e.keyCode ){
						  	  case 37: {
										microElementShift('left');
										e.preventDefault();
						  	  	break;
						  	  }
						  	  case 38: {
										microElementShift('up');
										e.preventDefault();
						  	  	break;
						  	  }
						  	  case 39: {
										microElementShift('right');
										e.preventDefault();
						  	  	break;
						  	  }
						  	  case 40: {
										microElementShift('down');
										e.preventDefault();
						  	  	break;
						  	  }
						  	}
								
							}

							if( app.stubs.grouped.length > 0  ){
	
							  switch( e.keyCode ){
						  	  case 37: {
										microGroupShift('left');
										e.preventDefault();
						  	  	break;
						  	  }
						  	  case 38: {
										microGroupShift('up');
										e.preventDefault();
						  	  	break;
						  	  }
						  	  case 39: {
										microGroupShift('right');
										e.preventDefault();
						  	  	break;
						  	  }
						  	  case 40: {
										microGroupShift('down');
										e.preventDefault();
						  	  	break;
						  	  }
						  	}
								
							}
							
							if (e.keyCode == 27) { // escape key maps to keycode `27`
								
									if( app.methods.serverprocessing ){
										toast( 'ESC disabled. File is being processed on server.', 'keep', 10000, 'error', 'Please wait.');
										return;	
									}
								
							    app.methods.clearActive(['previewOn'], 'include', 'escape');
							    app.methods.progressBar.stop();
							    
							    if( app.stubs.saving ){
							    	
							    	app.stubs.saveIsInterrupted = true;
								    app.stubs.renderingPNGforHeaders = false;
								    app.stubs.saving = false;
								    app.methods.progressBar.stop();	
										app.stubs.recentlySaved = false;
										window.onbeforeunload = app.methods.confirmOnPageExit;
								    app.data.export.reset();
								    app.stubs.doQueue = [];
								    delete app.stubs.doWhenSetter;
								    clearInterval(app.methods.doInterval);
								    clearInterval(app.methods.doWaitServerProcessing);
								    app.stubs.dobusy = false;	
								    
								    toast( app.stubs.savingWhat + ' has been interrupted.', 'interrupted');
								    
								    var quicksave = function() {
								    	
												app.data.export.reset();
												var gatherhow = 'quicksave';
												tools.elasped.start();
												app.data.export.gather(gatherhow);
												app.methods.progressBar.start();
												
								    }
								    					    	
							    }else{
							    	
							    };
							}
							
							if ( e.keyCode == 13 ) {
							 //e.preventDefault(); this killed the pixabay search..
							}
							
					    if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'a' || String.fromCharCode(e.which) === 'A' ) ) {
					    		app.methods.clearActive(undefined, undefined, 'key press select all');
					    		var exceptLocked = true;
					        app.methods.groupAllElements( exceptLocked );
									if ( document.selection ) {
										document.selection.empty();
									} else if ( window.getSelection ) {
										window.getSelection().removeAllRanges();
									}
									return false;
					    }
					    
					    if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'p' || String.fromCharCode(e.which) === 'P' ) ) {
					    		$('#print2Button').click();
									return false;
					    }					    
					    
					    if ( e.ctrlKey && ( String.fromCharCode(e.which) === 's' || String.fromCharCode(e.which) === 'S' ) ) {
					    		$('#fileSave').click();
									return false;
					    }
					    
					    if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'z' || String.fromCharCode(e.which) === 'Z' ) ) {
					    		$('#undoButton').click();
									return false;
					    }
					    
					    
					    if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'y' || String.fromCharCode(e.which) === 'Y' ) ) {
					    		$('#redoButton').click();
									return false;
					    }
					    											
							if( typeof( $(e.target).attr('id') ) != 'undefined') return;
							
					    if( e.which == 8 || e.which == 46){ // 8 == backspace, 46 == delete
					        if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
					        	
			        				var cid = $('.ontop').attr('id'),
			        						view = app.stubs.views.elements[cid];
			        				if(typeof( view ) != 'undefined') view.delete();
			        				
			        				for( var idx in app.stubs.grouped){
			        					var cid = app.stubs.grouped[idx],
			        							view = app.stubs.views.elements[cid];
			        					if(typeof( view ) != 'undefined') view.delete();
			        				}
			        				
			        				app.methods.clearActive(undefined, undefined, 'backspace delete');
			        				
					            e.preventDefault();
					        }
					    }
						    
						});
					},
					
					hasWidget: function(collection) {
						if(tools.inArray(collection, app.settings.hasWidget) || tools.inArray(collection, app.settings.charts)) return true
						else return false
					},
					
					picserver: function() {
						$('.picserver-logo').bind('click', function() {
							if($(this).attr('collection') != 'clipart'){
								window.open( 'https://pixabay.com/', '_blank');
							} else{
								window.open( 'https://openclipart.org/', '_blank');
							}
							
						});
					},
					
					open: function() {
						
						app.methods.clearCanvas('no save');
						$('#load-screen').show();
						$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').addClass('make-blur');
						app.data.import(function() {
							$('#load-screen').hide();
							$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').removeClass('make-blur');
							app.methods.widgets.google.authenticate();
						});
					},

					determineWhichFileIdToRetrieveInCaseUserRefreshesAfterASave: function() {
						if( serverhost == 'localhost' || typeof( template_id ) != 'undefined') {
							app.stubs.fileId = window.fileId; 
							return;
						}
						
						/* if( window.isTemplate ){

							app.stubs.fileId = window.fileId;
							tools.cookies.setCookie('launch_id', window.fileId, tools.cookies.expires);
							tools.cookies.setCookie('active_id', window.fileId, tools.cookies.expires);
							return;	
						}*/

						if( window.newSerial != 'false' ){ // ie. window.newSerial = 0.7423423423
							

								if( window.newSerial == tools.cookies.getCookie('newSerial') ){
									
									app.stubs.fileId = tools.cookies.getCookie('active_id');
									console.log('New pictograph that is saved.');
								} else{
									
									//console.log('Brand new pictograph');	
								}
							
						} else{ // ie. window.newSerial = 'false'
							
							var launch_id = tools.cookies.getCookie('launch_id'),
									active_id = tools.cookies.getCookie('active_id');
									
							if( window.isNewPictographReload ){
								
								app.stubs.fileId = active_id;
								console.log('isNewPictographReload');
								return;
							}	
									
							if( typeof( launch_id ) != 'undefined' && launch_id == window.fileId){
								console.log('launch_id');
								app.stubs.fileId = active_id;
							} else{
							
							app.stubs.fileId = window.fileId;
							tools.cookies.setCookie('launch_id', window.fileId, tools.cookies.expires);
							tools.cookies.setCookie('active_id', window.fileId, tools.cookies.expires);
						};								
							
						}
						
					},
					
					cleanUpOnExit: function() {
						
//						console.log('User has exited.  No changes.');
						// if( typeof( tools.urlGet('pollrefresh') ) == 'string' )	 tools.cookies.setCookie('stopPollRefresh', true);
						
					},
					
					confirmOnPageExit: function (e) {

				    e = e || window.event;
				    var message = 'Recent changes have not been saved';
				 
				    if (e){
				      e.returnValue = message;
				    }
				    
				    // if( typeof( tools.urlGet('pollrefresh') ) == 'string' )	 tools.cookies.setCookie('stopPollRefresh', true);
				    
				    return message;
					},
					 
					ensureAbandomB4Save: function() {
						
						
						$(window).bind("beforeunload", function() {
							if( app.stubs.recentlySaved == false ){
/*								
								
						    if (confirm("Do you want to save this before leaving?") == true && serverhost != 'localhost') {
						    	
						    } else{
						    	
						    }								
								*/
								return confirm("Do you really want to close without saving?");
							};
							
						});
					},
				
					injectBodyDom: function( callback ) {

						var that = this;
						$('body').load('html/body.html?version=' + version,
							function() {
								callback();
							}
						);
					},
					
					dim:{
						set: function() {
								
							var adjustNavWidthIcons = function() {
							
								var shrinkNavIconWidth = function( marginIs, paddingIs) {
									$('.navbar li > i:not(.navbar-brand):not(#meLink)').css({
										margin: marginIs + 'px',
										padding: paddingIs + 'px'
									});
								}
								
								var hamburgerIconWidth= 58,
										navBarLeftWidth= 261,
										navbarRightWidth = tools.getScreenDim()['width'] - (hamburgerIconWidth + navBarLeftWidth),
										noIcons = 13,
										eachPadding = navbarRightWidth / ( noIcons * 6);
								
//								shrinkNavIconWidth(0, eachPadding);
//								
//								return;
	
								if(app.stubs.dim.window.width < 780){
									shrinkNavIconWidth(0, 0);
								}
								else if(app.stubs.dim.window.width < 803){
									shrinkNavIconWidth(0, 0);
								}	
								else if(app.stubs.dim.window.width < 829){
									shrinkNavIconWidth(0, 1);
								}			
								else if(app.stubs.dim.window.width < 852){
									shrinkNavIconWidth(0, 2);
								}							
								else if(app.stubs.dim.window.width < 925){
									shrinkNavIconWidth(0, 3);
								}		
								else if(app.stubs.dim.window.width < 972){
									shrinkNavIconWidth(0, 4);
								}				
								else if(app.stubs.dim.window.width < 1052){
									shrinkNavIconWidth(1, 5);
								}	
								else if(app.stubs.dim.window.width < 1068){
									shrinkNavIconWidth(2, 6);
								}	
								else if(app.stubs.dim.window.width < 1115){
									shrinkNavIconWidth(3, 7);
								}				
								else if(app.stubs.dim.window.width < 1164){
									shrinkNavIconWidth(4, 8);
								}						
								else if(app.stubs.dim.window.width < 1216){
									shrinkNavIconWidth(5, 9);		
								}
								else if(app.stubs.dim.window.width < 1353){
									shrinkNavIconWidth(6, 10);	
								} else if( app.stubs.dim.window.width < 1387 ){
									shrinkNavIconWidth(8, 14);
								} else if( app.stubs.dim.window.width < 9999999999999999999999 ){
									shrinkNavIconWidth(8, 14);
								}
								/*
								var theSet = [{
												margin: 9,
												padding: 15	
										},{
												margin: 7,
												padding: 13	
										},{
												margin: 6,
												padding: 12	
										},{
												margin: 5,
												padding: 11	
										},{
												margin: 4,
												padding: 10	
										},{
												margin: 3,
												padding: 9	
										},{
												margin: 2,
												padding: 8	
										},{
												margin: 1,
												padding: 7	
										},{
												margin: 0,
												padding: 6	
										},{
												margin: 0,
												padding: 5	
										},{
												margin: 0,
												padding: 4	
										},{
												margin: 0,
												padding: 3	
										},{
												margin: 0,
												padding: 2	
										}
								];
								
								var idx = 13;
								tools.doWhenReady( function() {
									idx--;
									console.log('height:' + $('#nav-top').height());
									if( $('#nav-top').height() <  75 ) return true
									else return false
								},
								function() {
									console.log(theSet[idx].margin);
									shrinkNavIconWidth(theSet[idx].margin, theSet[idx].padding);
									console.log($('#nav-top').height());
									console.log('finally');
	
								},
								'dim set'
								);
								*/
							};
							
							var numOfCards = _.size(app.menu.left.cards);
							
							app.stubs.dim.window = {
								width: $(window).width(),
								height:	 $(window).height()				
							};
							
							adjustNavWidthIcons();
		
							app.stubs.dim.main = {
									height: $(window).height() - app.stubs.dim.navbar.height
							};
							
							app.stubs.dim.cards.maxcard.height = app.stubs.dim.main.height - app.stubs.dim.cards.maxcard.bufferButtom;
							
							app.stubs.dim.cards.inactiveCombined = {
								height: numOfCards * app.stubs.dim.cards.inactive.height
							};
							
							app.stubs.dim.cards.numOfCards = numOfCards;
							
							var inactiveCardsHeightAfterOneActivated = app.stubs.dim.cards.inactiveCombined.height - app.stubs.dim.cards.inactive.height;
							
							app.stubs.dim.cards.active = {
								height: app.stubs.dim.cards.maxcard.height - inactiveCardsHeightAfterOneActivated
							};
			
							app.stubs.dim.icons.search.height = app.stubs.dim.cards.maxcard.height;
							app.stubs.dim.icons.search.noSearchHeight = app.stubs.dim.cards.maxcard.height - + app.stubs.dim.icons.result.set.nosearchHeightBufferTop;
							app.stubs.dim.icons.expandedSubCardContainer.height = app.stubs.dim.main.height - 10;
							
							app.stubs.dim.icons.result.height = app.stubs.dim.icons.search.height -	app.stubs.dim.icons.search.searchFieldContainer.height; 
							
							app.stubs.dim.icons.result.set.height = app.stubs.dim.icons.result.height - app.stubs.dim.icons.result.scrollBarBuffer;
							app.stubs.dim.icons.result.set.nosearchHeight = app.stubs.dim.icons.result.height - (app.stubs.dim.icons.result.scrollBarBuffer + app.stubs.dim.icons.result.set.nosearchHeightBufferTop);
							
							app.stubs.dim.icons.result.setMaxIcon.height = app.stubs.dim.icons.result.height - ( app.stubs.dim.icons.result.nav.height + app.stubs.dim.icons.result.scrollBarBuffer );
							app.stubs.dim.icons.result.setMaxIcon.nosearchHeight = app.stubs.dim.icons.result.set.height  + app.stubs.dim.icons.result.nav.height;
	
						}
					},
					
					createCollections: function() {
						app.stubs.collections.elements = new collections.ElementsCollection();
						app.stubs.collections.guides = new collections.GuidesCollection();
					},
					
					alignToGuide: {
						
						buffer: 5,
						
						arrays:{
							left: [],
							top: [],
						},
						
						lock: {
							left: 0,
							top: 0,	
						},
						
						dynoline:{
							left: 0,
							top: 0,	
						},
						
						buildArray: {
							
							init: function(dragCid) {
								
								for( var side in this.arrays){
									this.arrays[side] = [];
									this.buildArray.go.call( this, dragCid, side );
								}

							},
							
							go: function( dragCid, side ) {
								
								var isGroupyBoxDragging = typeof( dragCid ) == 'object',
										isDraggingElementOrDynoline = !isGroupyBoxDragging && typeof( app.stubs.views.elements[dragCid] ) != 'undefined';
								
								if( isDraggingElementOrDynoline ) {
									
									var view = app.stubs.views.elements[dragCid];
									
									if( typeof(  view.model.get('json')  ) == 'undefined' ) return;
									
									var dragCollection = view.model.get('json').collection;
									var isElementDragging = dragCollection != 'dynolines';
									var isDynolineDragging = dragCollection == 'dynolines';
						
									if( view.alignIsDisabled == true ) return;	
															
								}
								
								if ( isDynolineDragging ){
									var widthDragElement = 0, 
											heightDragElement = 0,
											dragResizeableSize = 0;
								}
								else if( isElementDragging ){
									var view = app.stubs.views.elements[dragCid],
											json = view.model.get('json'),
											widthDragElement = parseFloat(json.style.element.width) * scale,
											heightDragElement = parseFloat(json.style.element.height) * scale,
											isRotated = view.model.get('json').data.rotation != 0;
									
									if( isRotated ){
										var dragResizeableSize = ( side == 'left' ? view.boundingboxElement.width :view.boundingboxElement.height );
									}else{
										var dragResizeableSize = ( side == 'left' ? widthDragElement :heightDragElement );
									};
									
								} else if( isGroupyBoxDragging ){
									var widthDragElement = dragCid.width,
											heightDragElement = dragCid.height,
											dragResizeableSize = ( side == 'left' ? dragCid.width : dragCid.height )
								};
								
								var models = app.stubs.collections.elements.models;

								for(var idx in models){
									
									var model = models[idx];
									
									if( model.get('disabled') ) continue;
									if( model.get('json').data.isLocked ) continue;
									if( typeof( dragCid ) == 'string' && model.cid == dragCid ) continue;
									if( model.get('json').collection == 'dynolines' ) continue;

									if( typeof( dragCid ) == 'object' ){
										var skip = false;
										var	grouped = app.stubs.grouped.slice();
										for( var idx in grouped){
										 if( model.cid == grouped[idx])skip = true;
										}
										if( skip ) continue;
									}
									
									var cid = model.cid,
											dragElementSize = ( side == 'left' ? widthDragElement : heightDragElement ),
											halfDragElementSize = dragElementSize / 2,
											halfDragResizeableSize = dragResizeableSize / 2,
											dynamicElementSize = halfDragResizeableSize + halfDragElementSize,
											otherElementSize = ( side == 'left' ? this.buildArray.getTheOther('width', model) : this.buildArray.getTheOther('height', model) ),
											halfOtherElementSize = otherElementSize / 2,
											otherInnerNearSide = this.buildArray.getTheOther(side, model),
											otherInnerFarSide = this.buildArray.getTheOther(side, model) + otherElementSize,
											otherOutterNearSide = this.buildArray.getTheOther(side, model) - dynamicElementSize,
											otherOutterFarSide = this.buildArray.getTheOther(side, model) + otherElementSize;
									
									/* outterNear */
									var outerOuterObj = {
										id: model.cid,
										type: 'outterNear',
										hitPos: otherOutterNearSide,
										linePos: otherInnerNearSide
									}
									
									this.arrays[side].push( outerOuterObj );	
									
									/* innerNear */
									var innerInnerObj = {
										id: model.cid,
										type: 'innerNear',
										hitPos: otherInnerNearSide - ( halfDragElementSize - halfDragResizeableSize ),
										linePos: otherInnerNearSide
									}
									
									this.arrays[side].push( innerInnerObj );
									
									
									/* innerHalfNear */
									var innerHalfNearObj = {
										id: model.cid,
										type: 'innerHalfNear',
										hitPos: (otherInnerNearSide + halfOtherElementSize) - dynamicElementSize,
										linePos: otherInnerNearSide + halfOtherElementSize
									}
									
									this.arrays[side].push( innerHalfNearObj );
									
									/* innerHalfFar */
									var innerHalfFarObj = {
										id: model.cid,
										type: 'innerHalfFar',
										hitPos: otherInnerNearSide + halfOtherElementSize  - ( halfDragElementSize - halfDragResizeableSize ),
										linePos: otherInnerNearSide + halfOtherElementSize
									}
									
									this.arrays[side].push( innerHalfFarObj );
									
									
									/* innerFar */
									var innerInner2Obj = {
										id: model.cid,
										type: 'innerFar',
										hitPos: otherInnerFarSide - dynamicElementSize,
										linePos: otherInnerFarSide,
										otherInnerNearSide: otherInnerNearSide,
										otherElementSize: otherElementSize
									}
									
									this.arrays[side].push( innerInner2Obj );	
									
									/* outterFar */	
									var outerOuter2Obj = {
										id: model.cid,
										type: 'outterFar',
										hitPos: otherOutterFarSide  - ( halfDragElementSize - halfDragResizeableSize ),
										linePos: otherOutterFarSide
									}
									
									this.arrays[side].push( outerOuter2Obj );

									
									/* center */	
									var outerOuter2Obj = {
										id: model.cid,
										type: 'center',
										hitPos: (otherInnerNearSide + halfOtherElementSize) - halfDragElementSize,
										linePos: otherInnerNearSide + halfOtherElementSize
									}
									
									this.arrays[side].push( outerOuter2Obj );

								}
								
							},
							getTheOther: function( style, model ) {
								var $ele = $('#' + model.cid),
										view = app.stubs.views.elements[model.cid],
										isRotated = view.model.get('json').data.rotation != 0,
										boundingboxElement =  view.getBoundingBox();
										
							  switch( style ){
						  	  case 'left': {
										return ( isRotated ? boundingboxElement.leftLeast: parseFloat($ele.css('left')));
						  	  	break;
						  	  }
						  	  case 'top': {
										return ( isRotated ? boundingboxElement.topLeast: parseFloat($ele.css('top')));
						  	  	break;
						  	  }
						  	  case 'width': {
										return ( isRotated ? boundingboxElement.width: parseFloat($ele.css('width')));
						  	  	break;
						  	  }
						  	  case 'height': {
										return ( isRotated ? boundingboxElement.height: parseFloat($ele.css('height')));
						  	  	break;
						  	  }
						  	}
							}
						},
	  				hitWhenDrag: function(ui, side, hitPos, linePos, lockId, that) {
							
							if( typeof( that ) != 'undefined'){
							
								if( that.alignIsDisabled == true ) return;
								
								if( that.collection == 'dynolines') {
									hitPos -= this.dynoline[side];
									hitPos -= 35 * scale;
								}
							}
				
							if( this.lock[side] == 0 || this.lock[side] == lockId){
								
								var movingLine = ui.position[side]; // could be left or top
								
								if( tools.between(movingLine, hitPos - this.buffer, hitPos + this.buffer) ){
									
									this.lock[side] = lockId;
									
									if( app.methods.isDynamicAlign() ){
										
										ui.position[side] = hitPos;
										
										$('#align-guide-' + (side == 'left' ? 'vertical': 'horizontal')).addClass('showit');
										
										var cssObj = {};
										cssObj[side] = linePos + 'px';
										$('#align-guide-' + (side == 'left' ? 'vertical': 'horizontal')).css(cssObj);
										
									};
									
								} else{
									
									$('#align-guide-' + (side == 'left' ? 'vertical': 'horizontal')).removeClass('showit');
									
									this.lock[side] = 0;
									
								}								
							};
							
						},
						//hitWhenResize: function(ui, 'top', $('#panel_0').height(), boundBox, 'vertical-bottom-edge');			
						hitWhenResize: function(ui, side, linePos, boundBox, lockId) {
							
							if( app.methods.alignToGuide.lock[side] == 0 || app.methods.alignToGuide.lock[side] == lockId){
							
								//console.log(side);
							
								var movingLine = ( side == 'left' ? boundBox.right : boundBox.bottom);
								
								if ( tools.between(movingLine, linePos - app.methods.alignToGuide.buffer, linePos + app.methods.alignToGuide.buffer )) {
									
									app.methods.alignToGuide.lock[side] = lockId;
									
									$('#align-guide-' + (side == 'left' ? 'vertical': 'horizontal')).addClass('showit');
									
									var cssObj = {};
									cssObj[side] = linePos + 'px';
									$('#align-guide-' + (side == 'left' ? 'vertical': 'horizontal')).css(cssObj);
									
									if( side == 'left'){
										//console.log(('boundBox.left: ' + boundBox.left + '  linePos: ' + linePos));
										var newWidth = linePos - boundBox.left;
										ui.size.width = newWidth;
										
										
									} else {
										//console.log(('boundBox.top: ' + boundBox.top + '  linePos: ' + linePos));
										var newHeight = linePos - boundBox.top;
										ui.size.height = newHeight;
										
									};
									
									if( typeof( this.$el ) != 'undefined' )	{
										
										if( side == 'left'){
	
											this.$resizeWrapper.width(newWidth);
											
											if( boundBox.aspectRatio != false ){
												var newHeight = newWidth / boundBox.aspectRatio;
												this.$resizeWrapper.height(newHeight);
												ui.size.height = newHeight;
											}
											
										} else {
	
											this.$resizeWrapper.height(newHeight);
											
											if( boundBox.aspectRatio != false ){
												var newWidth = newHeight * boundBox.aspectRatio;
												this.$resizeWrapper.width(newWidth);
												ui.size.width = newWidth;
											}
											
										};	
																			
									} else{
										
										if( side == 'left'){
											var newHeight = newWidth / boundBox.aspectRatio;
											$('#groupy, #rotate-wrapper').width(newWidth).height(newHeight);
											ui.size.height = newHeight;
										} else {
											newWidth = newHeight * boundBox.aspectRatio;
											$('#groupy, #rotate-wrapper').height(newHeight).width(newWidth);
											ui.size.width = newWidth;
										};											
										
									}			

								//return 1;
								} else {
									
									if(  typeof( this.$el ) == 'undefined'){
										var newWidth = boundBox.right - boundBox.left;
										var newHeight = boundBox.bottom - boundBox.top;
										$('#groupy, #rotate-wrapper').width(newWidth).height(newHeight);
									};
									
									$('#align-guide-' + (side == 'left' ? 'vertical': 'horizontal')).removeClass('showit');
									app.methods.alignToGuide.lock[side] = 0;
								}
								//return 0;
							}
							//return 0;
						},
						
						hideIt: function() {
							
							$('#align-guide-horizontal').removeClass('showit');
							$('#align-guide-vertical').removeClass('showit');
							
							this.arrays.left = [];
							this.arrays.top = [];
							
							this.lock.left = 0;
							this.lock.top = 0;

						}
					},
					
					groupAllElements: function( exceptLocked ) {
						app.stubs.grouped = [];
						for(var idx in app.stubs.collections.elements.models){
							var model = app.stubs.collections.elements.models[idx];
							if( model.get('disabled') ) continue;
							if( model.get('json').collection == 'dynolines' ) continue;
							if( typeof( exceptLocked ) != 'undefined' && model.get('json').data.isLocked ) continue;
							var cid = model.cid;

							$('#'	+	cid ).addClass('grouped');		
							app.stubs.grouped.push(cid);		
						}
						var disableMoreThanOneRule = true;
						app.methods.groupyBox.init(0, disableMoreThanOneRule);
					},	
											
					revert: {
						
						saveHistory: function( where ) {
							
							app.stubs.recentlySaved = false;
							
							if( serverhost == 'localhost'){
								window.onbeforeunload = app.methods.cleanUpOnExit
							} else{
								window.onbeforeunload = app.methods.confirmOnPageExit;
							}
							
							app.stubs.print.base64Data = undefined;
							app.stubs.tempImageBase64 = undefined;
							
							if( app.stubs.saveHistoryEnabled == false) return;
							
							app.data.export.reset();
							
							app.methods.revert.clipFuturenHistoryFromCurrentPointer();								

							for( var idx in app.stubs.collections.elements.models){
								var model = app.stubs.collections.elements.models[idx];
								if( model.get('disabled')) continue;
								var json = model.get('json'),
										jsonCopy = tools.deepCopy(json);
								
								if(jsonCopy.collection != 'icons') delete jsonCopy.data.imgSrc;
								delete jsonCopy.data.pixabay;
								jsonCopy.cid = model.cid;
								
								app.stubs.data.elements.push(jsonCopy);
							}
							
							app.stubs.data.canvas.curPaperShape = app.stubs.curPaperShape;
							app.stubs.data.canvas.curCanvasSize = app.stubs.curCanvasSize;

							app.stubs.history.push(tools.deepCopy(app.stubs.data));

							app.stubs.pointer++;
							
							if(typeof( Windows) != 'undefined' && where != 'start fresh' )  app.methods.autosave.init();  // UWP version

							//console.log('-------------history: ' + where);
							
							app.methods.revert.debug('saveHistory');
							
						},
												
						redraw: function( how ) {
							
							app.stubs.stillRotating = false;
							app.methods.clearActive(['previewOn', 'removeToast'], 'exclude', 'revert redraw');
							
							if( this.nothingToDo(how) ){
								return;	
							}
							
							app.stubs.recentlySaved = false;
							window.onbeforeunload = app.methods.confirmOnPageExit;
							app.stubs.tempImageBase64 = undefined;
							
							if( how == 'undo') {
								app.stubs.pointer--;
								var prior = app.stubs.pointer + 1;
							} else{ // redo
								app.stubs.pointer++;
								var prior = app.stubs.pointer - 1;
							}
							
							if( typeof( app.stubs.history[app.stubs.pointer] ) == 'undefined' ) return;
							
							var curElements = app.stubs.history[app.stubs.pointer].elements,
									priorElements = app.stubs.history[prior].elements;
							
							if( curElements.length > 
									priorElements.length){
										var doIt = 'add';		
							} else if( 
									curElements.length < 
									priorElements.length){
										var doIt = 'remove';
							} else{
										var doIt = 'change';
							}

							var priorCids = _.pluck(priorElements, 'cid');
							var curCids = _.pluck(curElements, 'cid');
							
						  switch( doIt ){
					  	  case 'add': {
									//console.log(' >> add');
									
									var extraCids = _.difference(curCids, priorCids);
									
									//console.log('Need to add these: ' + extraCids);
									
									for( var idx in extraCids){
										var cid = extraCids[idx];
										app.stubs.collections.elements.get(cid).set('disabled', false);	
										app.stubs.views.elements[cid].$el.show();
									}
										  	  	
					  	  	break;
					  	  }
					  	  case 'remove': {
									//console.log(' >> remove');	
									
									var extraCids = _.difference(priorCids, curCids);
									
									// console.log('Need to remove these: ' + extraCids);
									
									for( var idx in extraCids){
										var cid = extraCids[idx];
										app.stubs.collections.elements.get(cid).set('disabled', true);
										app.stubs.views.elements[cid].$el.hide();
									}
										  	  	
					  	  	break;
					  	  }	
					  	  case 'change': {
									for( var cid in app.stubs.views.elements){
										if( !app.stubs.collections.elements.get(cid).get('disabled')){
											var view = 	app.stubs.views.elements[cid];
											view.$el.css('visibility', 'visible');
											view.redraw();
										}
										
									}							  	  	
					  	  	break;
					  	  }	
					  	}
					  	
					  	app.stubs.curPaperShape	 = app.stubs.history[app.stubs.pointer].canvas.curPaperShape;
							app.stubs.curCanvasSize = app.stubs.history[app.stubs.pointer].canvas.curCanvasSize;
							var disableResize = true;
							app.methods.changeCanvasShape( disableResize ); 
							app.methods.fillPaperInputs();
					  	
							editbox.methods.layers.redoLayers();
							this.debug('redraw');
							
							
							var timeoutID = window.setTimeout(function(){
								$('.ripple-wrapper').empty();
							}, 4000);
							
						},
						
						debug: function(num) {

							
//							$('#foo').text( 'pointer: ' + app.stubs.pointer);								
//							$('#bar').text( 'history.length: ' + app.stubs.history.length);
							
//								console.log('-------------' + num + '---------');
//
//								console.log( 'pointer: ' + app.stubs.pointer);
//								console.log( 'history.length: ' + app.stubs.history.length);
//								console.log( 'elements length: ' + app.stubs.history[app.stubs.pointer].elements.length);
//								console.log( 'elementsInPanel: ' + JSON.stringify(app.stubs.views.editbox.methods.layers.elementsInPanel));
							return;
							
							
							
//								if( typeof(app.stubs.history[0]) != 'undefined'){
//										//console.log('1) left: ' + app.stubs.history[0].elements[0].style.element.left);
//										console.log('1) text: ' + app.stubs.history[0].elements[0].data.text);
//								}
//								if( typeof(app.stubs.history[1]) != 'undefined'){
//										//console.log('2) left: ' + app.stubs.history[1].elements[0].style.element.left);
//										console.log('2) text: ' + app.stubs.history[1].elements[0].data.text);
//								}								
						},														
						
						clipFuturenHistoryFromCurrentPointer: function() {

							if( app.stubs.pointer < app.stubs.history.length ){
								
								for( var idx = app.stubs.history.length - 1; idx > app.stubs.pointer; idx--){
									app.stubs.history.pop();
//										console.log('popping idx:' + idx );
								}
	
								app.stubs.pointer = app.stubs.history.length - 1;
	
							}
							
						},
						
						getRevertElement: function(cid) {
							
							var that = this;
							
							var idx	=	tools.findIndexInArrayOfObjects( app.stubs.history[app.stubs.pointer].elements,	function(	obj	){
								if(	obj.cid == cid ) return	true;
							});
							
							return tools.deepCopy(app.stubs.history[app.stubs.pointer].elements[idx]);
		
						},
						
						nothingToDo: function(how) {
							
							$('#undoButton, #redoButton').removeClass('animated shake');
							
							if( app.stubs.pointer + 2 > app.stubs.history.length && how == 'redo'){
//										console.log(' revert avoided');
									$('#bar').text('revert avoided');
									app.methods.shakeNo($('#redoButton'));
									toast('There is nothing more to redo.', 'keep', 5000, 'info', 'Note')
									return true;								
							}
							
							if( app.stubs.pointer == 0  && how == 'undo') {
//										console.log(' revert avoided');
									$('#bar').text('revert avoided');
									app.methods.shakeNo($('#undoButton'));
									toast('There is nothing more to undo.', 'keep', 5000, 'info', 'Note')
									return true;									
							}
							
							return false;
							
						}
					},
					
					clearCanvas: function(nosave) {
						app.stubs.recentlySaved = true;
						window.onbeforeunload = app.methods.cleanUpOnExit
						app.stubs.pointer = -1;
						app.stubs.history = [];
						app.methods.clearActive(['removeToast'], 'exclude', 'clearCanvas');
						$('#panel_0').empty();
						app.stubs.collections.elements.reset();
						app.stubs.views.elements = {};
						editbox.methods.layers.redoLayers();
						if(typeof( nosave) == 'undefined') saveHistory('clear all canvas');		
					},
					
					getScaledStyle: function(style) {
						
						var scaledStyleobj = {};
				
						for( var key in style){
							
							if ( tools.inArray(key, app.settings.noScaleStyles)) continue;
							
							var format = tools.useThisFormat(style[key]),
									value =  parseFloat(style[key]),
									scaledValue = value * app.stubs.zoom.scale;		
									
							if( tools.inArray(key, app.settings.scalableStyles)) {
								scaledStyleobj[key] = scaledValue + format
							} else {
								scaledStyleobj[key] = value + format;
							}
							
						}
						
						return scaledStyleobj;
					},						
					
					setGlobals: function() {
						saveHistory = app.methods.revert.saveHistory;
						editbox = app.stubs.views.editbox;
					},
					
					changeCanvasShape: function( disableResize ) {
						
						if( app.stubs.curPaperShape.pageSize == 'custom'){
							var width = app.stubs.curCanvasSize.width = app.stubs.curPaperShape.pageSizeCustom.width;
							var height = app.stubs.curCanvasSize.height = app.stubs.curPaperShape.pageSizeCustom.height;
						}else{
							var width = app.stubs.curCanvasSize.width = app.settings.paperSizes[app.stubs.curPaperShape.pageSize][app.stubs.curPaperShape.layout].width;
							var height = app.stubs.curCanvasSize.height = app.settings.paperSizes[app.stubs.curPaperShape.pageSize][app.stubs.curPaperShape.layout].height;
						};
						
						app.stubs.canvasAspectRatio = app.stubs.curCanvasSize.width/ app.stubs.curCanvasSize.height;
						
						app.stubs.adaptedPercentage = parseInt(app.stubs.curCanvasSize.width) / parseInt(app.settings.paperSizes.letter.portrait.width);
						
						$('#canvas, #panel_0').width(width  * app.stubs.zoom.scale );
						$('#canvas, #panel_0').height(height  * app.stubs.zoom.scale );

						if( typeof( disableResize ) != 'undefined') return;
						
						app.stubs.zoom.idx = app.menu.resize.getBestIdx();
						app.menu.resize.makeChange();

					},
					
					fonts: {
					
						loadGoogleFontCss: function(font){ //	https://github.com/LukeTheDuke/Lazyloader/blob/master/lazyloader.js

							if(tools.inArray(font,	app.stubs.fontsLoaded)){
								return;
							}
							
							app.stubs.fontsLoaded.push(font);
							var	url	=	'https://fonts.googleapis.com/css?family='	+	font,
								head = document.getElementsByTagName('head')[0],
								link = document.createElement('link');
							link.rel = 'stylesheet';
							link.type	=	'text/css';
							link.href	=	url;
							link.media = 'all';
							if(typeof(font)	!= 'undefined')	head.appendChild(link);
						},
						
						getFamilyOfThisFont: function( fontname ){
							
								var category = this.findCategoryContainingThisFont(fontname);
								var fonts = app.stubs.fontlist[category];
								var idx = tools.findIndexInArrayOfObjects( fonts,	function(	obj	){
														if(	obj.fontname === fontname)	return true;
													});
								
								return app.stubs.fontlist[category][idx]['family'];
								
						},
						
						findCategoryContainingThisFont: function(font) {
						
							for( var category in app.stubs.fontlist){
								var fonts = app.stubs.fontlist[category];
								for( var idx in fonts){
									var fontObj = fonts[idx],
											fontname = fontObj['fontname'];
											
									if( font == fontname ) return category;
									
								}
							}
							
						},
						
						getOneFontAtATime: function(callback) {
							
							var fontsGotten = 0,
									fonts2GetLength = app.stubs.fonts2Get.length,
									duration = 100,
								  repeatingFunction = setInterval(
								  
										function(){
											
											if(fontsGotten == fonts2GetLength ){
												clearInterval(repeatingFunction);
												callback();  // program flow continues here
											} 
											
											if( app.stubs.readyForNextFont && app.stubs.fonts2Get.length > 0 ) {
												
												app.stubs.readyForNextFont = false;
												
												var family = app.stubs.fonts2Get.shift()
												
												app.methods.fonts.loadGoogleFontCss( family);
												
												FontDetect.onFontLoaded (family, function() {
													fontsGotten++;
													app.stubs.readyForNextFont = true;
													
												},function() {
													
													
												}, {msTimeout: 3000});
												
											}
											
										},
										
										duration
										
									);
						}
						
					},
					
					clone: function(model, what ) {

						var newJson	=	$.extend(	true,	{},	model.get('json')),
								buffer = 35;							
						
						if( newJson.collection == 'dynolines'){
						
							var	leftEdge = new app.methods.GetEdge( 'left', [model.cid]	),
									topEdge	=	new	app.methods.GetEdge(	'top', [model.cid]	),
									rightEdge	=	new	app.methods.GetEdge(	'right', [model.cid]	),
									bottomEdge = new app.methods.GetEdge( 'bottom', [model.cid]	);
							
							var	elementLeft	=	leftEdge.furthest(),
									elementTop = topEdge.furthest(),
									elementRight = rightEdge.furthest(),
									elementBottom	=	bottomEdge.furthest();	
									
							var heightOfElement = ((elementBottom - elementTop)  *  multiple) / 2.5;	
							
						} else{
							
							var heightOfElement = parseFloat( model.get('json').style.element.height);
							
						}

						var moveDown = ( what == 'element' ? heightOfElement / 5 : $('#groupy').height() * multiple ),
								verticalDistanceFromOrig = moveDown + buffer,
								panelView = app.stubs.views.panels['panel_0'];

						if( newJson.collection == 'dynolines'){
							
							newJson.data.coordinates.box1.y = ( parseFloat(newJson.data.coordinates.box1.y) +  verticalDistanceFromOrig);
							newJson.data.coordinates.box2.y = ( parseFloat(newJson.data.coordinates.box2.y) +  verticalDistanceFromOrig);
							
						} else{
							
							var newtop = (parseFloat(newJson.style.element.top) +  verticalDistanceFromOrig) * app.stubs.zoom.scale,
									newLeft = parseFloat(newJson.style.element.left)  * app.stubs.zoom.scale;
									
							newLeft += 20;
							
							newJson.style.element.top =  newtop + 'px';
							newJson.style.element.left =  newLeft + 'px';
							
						}

						newJson.justDropped = true;
						var makeClone = true;
						
						if( newJson.collection == 'straights' ){ 
							//delete newJson.justDropped;
						}
						
						if( newJson.collection == 'headers'){
							newJson.data.needFreshPNG = true;
						}

						panelView.drop.createAndAddModel.call( panelView, newJson, makeClone, 'HHH');
						
					},
					
					print: function() {
						
						var doNow = function() {
							
								app.stubs.print.width = 826;
								app.stubs.print.height = 1056;
							
								app.stubs.print.base64Data = "";

						};
						
						app.methods.clearActive(undefined, undefined, 'printing');
						
						$('#imageContainer').parent().remove();	

								
						var widthIs = app.stubs.print.width,
								heightIs = app.stubs.print.height,
								src = "data:image/png;base64, " + app.stubs.print.base64Data,
								elem = document.createElement("div");
								
						elem.innerHTML = "\
								<style>\
									#imageContainer {\
									  font-size: 0;\
									  text-align: center;\
									  display:none;\
									}\
									#imageContainer img {\
									  display: inline-block;\
									  vertical-align: middle;\
									  width: " + widthIs + "px;\
									  height: " + heightIs + "px;\
									}\
								</style>\
								<div id='imageContainer'><img  id='img4print' src='" + src + "' /></div>\
							";
						$('body').append(elem);
						
						$('#imageContainer').printArea();
						
						$('#imageContainer').parent().remove();						
					},
					
					blur:{
						
						on: function() {	
							
							$('#blur-screen').show();
							
							$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').addClass('make-blur');

						},
						off: function() {
							
								$('#blur-screen').hide();
								$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').removeClass('make-blur');
						}
						
					},
					
					loading:{
						
						lock: false,
						
						init: function() {
							
							var that = this;
							$('#load-screen').click( function() {
								if( that.locked) return;
								$(this).hide();
								$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').removeClass('make-blur');
							});
							
						},
						
						on: function() {	
							
							$('#load-screen').show();
							$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').addClass('make-blur');

						},
						off: function( where ) {
								if( typeof( where) != 'undefined' ) console.log(where);
								$('#load-screen').hide();
								$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').removeClass('make-blur');
						}
						
					},
					
					shakeNo: function($button) {
						
						app.methods.animate( $button, 'shake', 1);						

					},
					
					progressBar: {
						start: function( callback ) {
							$('#material-load-bar').show();
							if( typeof( callback ) != 'undefined') callback();
						},
						stop: function( where ) {
							$('#material-load-bar').hide();
						}
					},
					
					toast: function() {
						
						toast = (function() { 
						  return function(message, actionText, miliseconds, icon, heading, reset) {
						  	
						  	var options = {};
						  	
						  	options['text'] = message;
						  	options['stack'] = 12;
						  	options['loaderBg'] = '#4285F4';
						  	
						  	if( typeof( reset ) != 'undefined') $.toast().reset('all');
						  	if( typeof( icon ) != 'undefined') options['icon'] = icon;
						  	if( typeof( heading ) != 'undefined') options['heading'] = heading;
						  	
						  	if( typeof( actionText ) != 'undefined' && actionText == 'clearPrevious' ) $.toast().reset('all');
						  	if( typeof( actionText ) != 'undefined' && actionText == 'note' ) {
						  		options['icon'] = 'info';
						  		options['heading'] = 'Note';
						  	}
						  	
						  	if( typeof( actionText ) != 'undefined' && actionText == 'saved' ) {
						  		$.toast().reset('all');
						  		options['icon'] = 'success';
						  		options['heading'] = 'Success';
						  	}
						  	
						  	
						  	if( typeof( actionText ) != 'undefined' && actionText == 'interrupted' ) {
						  		$.toast().reset('all');
						  		options['icon'] = 'info';
						  		options['heading'] = 'Note';
						  		options['hideAfter'] = false;
						  	}	
						  	
						  	if( typeof( actionText ) != 'undefined' && actionText == 'saved selected' ) {
						  		$.toast().reset('all');
						  		options['icon'] = 'success';
						  		options['heading'] = 'Note';
						  		options['hideAfter'] = false;
						  	}	
						  						  	
						  	if( typeof( actionText ) != 'undefined' && actionText == 'saving' ) {
						  		options['icon'] = 'error';
						  		options['heading'] = 'Note';
						  	}
						  	
						  	if( typeof( actionText ) != 'undefined' && actionText == 'locked' ) {
						  		options['icon'] = 'info';
						  		options['heading'] = 'Note';
						  		options['hideAfter'] = 10000;
						  	}		
						  					  	
						  	if( typeof( actionText ) != 'undefined' && actionText == 'keep'){
							  	
							  	options['hideAfter'] = false;

						  	} else if( typeof( actionText ) != 'undefined' && actionText == 'wait'){
						  		
							  	options['hideAfter'] = miliseconds;

						  	}  else if( typeof( actionText ) != 'undefined' && actionText == 'wait for server'){
						  		
						  		$.toast().reset('all');
						  		options['hideAfter'] = 10000;
						  		$.toast(options);
						  		
									app.methods.doWaitServerProcessing = setInterval( function() {
										
										if( app.stubs.saving){
											$.toast().reset('all');
									    $.toast(options);		
									    	
										} else {
											
											clearInterval(app.methods.doWaitServerProcessing);	
											
										};
												    							
									}, 10500);
									
									return;

						  	};
						  	
						  	
						  	if( typeof( miliseconds ) != 'undefined' ) {
						  		options['hideAfter'] = miliseconds;
						  	}
						  	
								$.toast(options);

						  };
						  
						})();
					},
					
					snack: function(){
						
						snack = (function() {  // http://codepen.io/wibblymat/pen/avAjq
						  
						  var previous = null;
						  
						  return function(message, actionText, miliseconds, action) {
						  	

						    if (previous) {
						    	console.log('prev');
						      previous.dismiss();
						    }
						    var snackbar = document.createElement('div');
						    snackbar.className = 'paper-snackbar';
						    snackbar.dismiss = function() {
						      this.style.opacity = 0;
						    };
						    var text = document.createTextNode(message);
						    snackbar.appendChild(text);
						    if (actionText) {
						      if (!action) {
						        action = snackbar.dismiss.bind(snackbar);
						      }
						      var actionButton = document.createElement('button');
						      actionButton.className = 'action';
						      actionButton.innerHTML = actionText;
						      actionButton.addEventListener('click', action);
						      snackbar.appendChild(actionButton);
						    }
						    setTimeout(function() {
						      if (previous === this) {
						        previous.dismiss();
						      }
						    }.bind(snackbar), ( miliseconds || 5000));
						    
						    snackbar.addEventListener('transitionend', function(event, elapsed) {
						      if (event.propertyName === 'opacity' && this.style.opacity == 0) {
						        this.parentElement.removeChild(this);
						        if (previous === this) {
						          previous = null;
						        }
						      }
						    }.bind(snackbar));
						    
						    previous = snackbar;
						    document.body.appendChild(snackbar);
						    // In order for the animations to trigger, I have to force the original style to be computed, and then change it.
						    getComputedStyle(snackbar).bottom;
						    snackbar.style.bottom =  '0px';
						    snackbar.style.opacity = 1;
						  };
						})();
					},
					
					nextCTACount: function() {
						
						var count = 1;
						
						for( var idx in app.stubs.collections.elements.models){
							var model = app.stubs.collections.elements.models[idx];
							if(typeof( model.get('json').data.cta_num ) != 'undefined') {
								count++;
							}
						}
						return count;
					},
					
					getLeastNegElementsTop: function() {
						
						var tops = [];
						for( var idx in app.stubs.collections.elements.models){
							if( typeof( app.stubs.collections.elements.models[idx].get) != 'function') continue;
							var json = app.stubs.collections.elements.models[idx].get('json');
							if(  typeof( json ) == 'undefined' ) continue;
							if( json.data.isLocked ) continue;
							var top = parseFloat(json.style.element.top);
							if( top < 0 ) tops.push(top);
						}
						var minIdx = 0;
						var value = tops[0];
						for (var idx = 1; idx < tops.length; idx++) {
						  if (tops[idx] < value) {
						    value = tops[idx];
						    minIdx = idx;
						  }
						}
						return ( typeof( tops[minIdx]) != 'undefined' ? tops[minIdx] : 0);
					},
					
					setCanvasTop: function() {
						
//						console.log('getLeastNegElementsTop(): ' + this.getLeastNegElementsTop());
						var addThisToTop = Math.abs(this.getLeastNegElementsTop()) * scale * 2;
						
//						console.log('addThisToTop: ' + addThisToTop);

						var canvasMap = {
									500: {
										minimum: 80,
										top: 6	
									},
									1000: {
										minimum: 70,
										top: 6	
									},
									9999: {
										minimum: 60,
										top: 5	
									}	
								};
						
						for( var key in canvasMap ){
//							console.log('trying key: ' + key);
							if( app.stubs.curCanvasSize.width <= key ) {
								var doTop = canvasMap[key]['top'];
//								console.log('accepted key: ' + key);
//								console.log('top: ' + doTop);
//								console.log('curCanvasSize.width: ' + app.stubs.curCanvasSize.width);
								break;	
							};
							
						}
						
//						console.log('minimum: ' + canvasMap[key]['minimum']);
						
						app.stubs.canvasTop = app.stubs.zoom.idx * doTop;
						
						if(addThisToTop > canvasMap[key]['minimum']){
							app.stubs.canvasTop = addThisToTop;
						} else{
							app.stubs.canvasTop = canvasMap[key]['minimum'];
						}

					
						$('#canvas').css('top', app.stubs.canvasTop + 'px');	
						$('#canvas').css('margin-bottom', app.stubs.canvasTop + 'px');	
						
//						console.log('using: ' + $('#canvas').css('top'));
					},
					
					countHowManyDisabledElements: function() {
						var count = 0;
						for(var idx in app.stubs.collections.elements.models){
							var model = app.stubs.collections.elements.models[idx];
							if( model.get('disabled') ) count++;
						}
						return count;
					},
					
					contactus: {
						
						widthModal: 600,
						heightModal: 450,
						
						init: function() {
							this.launchModal();
						},
						
						launchModal: function() {
							
								var that = this;
										
								$('#modal-box')
									.width(this.widthModal)
									.height(this.heightModal);

								app.methods.modal.on( 'true' );		
								
								$('#modal-box').load('html/contactus_modal.html?version=' + version, function() {
										
										tools.ajax('auth/contactus', {}, 'post', function(obj) {
											
											console.log(JSON.stringify(     obj , null, 2 ));
											
											that.fill.call( that, obj);

										});

									}
								);
						},
						
						fill: function( obj ) {

							// $('#showmehow-div').html(obj.promo_message);				
										
						}
						
					},
											
					faq: {
						
						widthModal: 800,
						heightModal: 550,
						
						init: function() {
							this.launchModal();
						},
						
						launchModal: function() {
							
								var that = this;
										
								$('#modal-box')
									.width(this.widthModal)
									.height(this.heightModal);

								app.methods.modal.on( 'true' );		
								
								$('#modal-box').load('html/faq_modal.html?version=' + version, function() {
										
										tools.ajax('auth/faq', {}, 'post', function(obj) {
											
											console.log(JSON.stringify(     obj , null, 2 ));
											
											that.fill.call( that, obj);

										});

									}
								);
						},
						
						fill: function( obj ) {

							// $('#showmehow-div').html(obj.promo_message);				
										
						}
						
					},
											
					showmehow: {
						
						widthModal: 800,
						heightModal: 550,
						
						init: function() {
							this.launchModal();
						},
						
						launchModal: function() {
							
								var that = this;
										
								$('#modal-box')
									.width(this.widthModal)
									.height(this.heightModal);

								app.methods.modal.on( 'true' );	
								
								$('#modal-box').load('html/showmehow_modal.html?version=' + version, function() {
										
										tools.ajax('auth/showmehow', {}, 'post', function(obj) {
											
											console.log(JSON.stringify(     obj , null, 2 ));
											
											that.fill.call( that, obj);

										});

									}
								);
						},
						
						fill: function( obj ) {

							// $('#showmehow-div').html(obj.promo_message);				
										
						}
						
					},					
											
					preferences: {
						
						widthModal: 600,
						heightModal: 250,
						
						init: function() {
							this.launchModal();
						},
						
						launchModal: function() {
							
								var that = this;
										
								$('#modal-box')
									.width(this.widthModal)
									.height(this.heightModal);

								app.methods.modal.on( 'true' );		
								
								$('#modal-box').load('html/preferences_modal.html?version=' + version, function() {
										
										tools.ajax('auth/preferences', {}, 'post', function(obj) {
											
											console.log(JSON.stringify(     obj , null, 2 ));
											
											that.fill.call( that, obj);
											that.bind.init.call(that);

										});

									}
								);
						},
						
						fill: function( obj ) {
							
							if( obj.allowEmailPromotion == 1){
								$('#allowEmailPromotion').prop( "checked", true );
							} else {
								$('#allowEmailPromotion').prop( "checked", false );
							};
							
							$('#why-allow-email-is-good-div').html(obj.promo_message);							
						},
						
						bind: {
							
							init: function() {	
								
								this.bind.allowEmailPromotion.call( this );
								
							},

							allowEmailPromotion: function() {
								
								$(document).on('click', '#allowEmailPromotion', function() {
									
									var postObj = {
												field: 'allowEmailPromotion',
												google_id: app.stubs.google_id,
												value: ( $('#allowEmailPromotion').is(":checked") ? 1: 0 )
											};

									var url = 'auth/toggleAccept';
											
									tools.ajax(url, postObj, 'post', function(obj) {
										if( $('#allowEmailPromotion').is(":checked") ){
											var message = "Thank you. Periodic promotions from the " + obj.market_name + " area will be sent to you.";
										} else{
											var message = "You are be removed from our email promotion list.";
										};
										toast(message)
										console.log(JSON.stringify(  obj   , null, 2 ));
										
									});
										
									
								})								
							}
							
						}
						
					},
					
					crop: function( data,  selectRect, callback, view ) {
												
							$('#modal-box').css('padding', '0px').width(1000).height(550);
							app.methods.modal.on( 'true' );	
							var that = this,
									newlyCropped = {},
									preview = function() {
										var previewWidth = 340,
										    previewHeight = 340,
												dataCropped = tools.crop( $('#crop-target')[0], newlyCropped);
												
										if( dataCropped.width > dataCropped.height){
											var width = previewWidth,
													height = dataCropped.height *  previewWidth/dataCropped.width ;
										} else{
											var height = previewHeight,
													width = dataCropped.width *  previewHeight/dataCropped.height ;
										}
										
										if(  dataCropped.base64 == '' ){
											var src = 'img/transparent.png',
													width = 250,
													height = 250;
										}else{
											var src = app.settings.base64Prefix + dataCropped.base64
										};
										
										
										
										$('#crop-preview').attr('src', src)
											.width(width)
											.height(height);
											
										$('#aspectratio').val(width/height);
									};
							
							$('#modal-box').load('html/crop.html?version=' + version,
								function() {
									
									var src = app.settings.base64Prefix + data.base64,
											width = data.width,
											height = data.height,
											marginCropContainer = 20,
											shrinkBy = .6,
											cropOptions = {
									      onChange: function(c)  {
									      	newlyCropped = tools.deepCopy(c);
									      	preview();
									      },
									      onSelect: function(c)  {
									      	newlyCropped = tools.deepCopy(c);
									      	preview();
									      },
									      boxWidth : 560,
									      boxHeight : 470,
						            bgColor:     'white',
						            bgOpacity:   .5
											};
											
									
									$('#aspectratio').val(view.resize.options.aspectRatio);

									$('#set2free2').click(function(event) {
										
										$('#aspectratio').val(0);
										$('#aspectIt').click();
										event.preventDefault();
									});
									
									$('#set2canvas2').click(function(event) {
										
										$('#aspectratio').val(app.stubs.canvasAspectRatio);
										$('#aspectIt').click();
										event.preventDefault();
									});
									
									$('#set2square2').click(function(event) {
										$('#aspectratio').val(1);
										$('#aspectIt').click();
										event.preventDefault();
									});
									
									if( typeof( selectRect ) != 'undefined'){
										cropOptions.aspectRatio = selectRect.width  / selectRect.height;
										cropOptions.setSelect = [
											0, 
											0, 
											selectRect.width, 
											selectRect.height
						  			];
									}
						
									$('#crop-target').attr('src', src).Jcrop( cropOptions );
									var jcrop_api = $('#crop-target').data('Jcrop');
								
									$('#aspectIt').click(function(event) {
										
						//				jcrop_api.release();
						//				jcrop_api.disable();
						//				jcrop_api.enable();
										
										if( typeof( jcrop_api ) == 'undefined') return;
										
										jcrop_api.destroy();
										
										if( $('#aspectratio').val() == '' || 
											  parseFloat($('#aspectratio').val()) == 0 ||
												$('#aspectratio').val() == '0'
										){
											delete	cropOptions.aspectRatio;
										} else{
											cropOptions.aspectRatio = $('#aspectratio').val();
										}
										
										$('#crop-target').attr('src', src).Jcrop( cropOptions )
										jcrop_api = $('#crop-target').data('Jcrop');
										return false;
									});			
												
									$('#save').click(function(event) {

										if( !tools.isEmpty(newlyCropped) ){
											callback( newlyCropped );
										};
										app.methods.modal.off();
										saveHistory('crop tool');
										
										return false;
										
									});					
									
								}
							);
					},

							
					saveToDeskop: function() {
	
							if( app.stubs.saving ){
								toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
								return;
							}
	
							app.stubs.savingWhat = 'Saving';
							app.stubs.saving = true;
	
							if( app.stubs.collections.elements.length == 0  ||
										app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()){
								app.methods.shakeNo($(this));
								toast('There is nothing on the canvas to save.', 'keep', 5000, 'info', 'Really?');
								return;	
							};
							
							app.methods.clearActive( undefined, undefined, 'justSave');
	
							app.methods.progressBar.start();
							app.data.export.reset();
							app.data.export.gather();
							
			
							tools.doWhenReady( function() {
								console.log('18997 waiting... ');
								return !app.stubs.renderingPNGforHeaders
							}, function() {
								
									if (app.stubs.saveIsInterrupted ) { // save as new
										app.stubs.saveIsInterrupted = false;
										return;
									}
									
									app.methods.serverprocessing = true;
									toast('Processing on Server.', 'wait for server');
								
									var obj = {
												data: app.stubs.data,
												google_id: app.stubs.google_id,
												width: app.stubs.curCanvasSize.width,
												height: app.stubs.curCanvasSize.height,
												fileId: app.stubs.fileId,
												version: 'v1-1-25-216'
											};
											
									var title = app.stubs.data.fileTitle.replace(/[ ,.]/g, "");
									
									tools.saveToDesktop(obj, title);
									app.methods.progressBar.stop();
									app.stubs.saving = false;
	
	
							},'save to desktop');
					},
					

				};
				
				this.menu = {
					init: function() {	
						this.top.init();
						this.left.init();
						this.resize.init();
					},					
					top:{
						bind: {
							
							openTemplates: function() {
								
								var smallapp_old = {
									
									init: function() {
										this.bind.openModal.call( this );
									},
									
									bind: {
										
										openModal: function() {	
											var that = this;
											$('.openPictographrTemplates').on('click', function() {
												that.launch();
											});	
										},
										
										openFile: function() {
											$('.launchImg').unbind('click').bind('click', function() {
												
												var template_id = $(this).attr('template_id'),
														url = 'app?';
													
												if( typeof( tools.urlGet('pollrefresh') ) == 'string' )	url += 'pollrefresh=true&';							
							
												if( typeof( tools.urlGet('new_width') ) == 'string' ){
														url += 'new_width=' + tools.urlGet('new_width') + '&';												
														url += 'new_height=' + tools.urlGet('new_height') + '&';												
												};

												url += 'state=%7B"template_id":%5B"' + template_id + '"%5D,"action":"open","userId":"' +  app.stubs.google_id + '"%7D';
													
												window.location.assign(url);   //window.open( url, '_blank');
												
											});
										},
										
										addFile: function() {
											if( !pow ) return;
											$('.addTemplate').unbind('click').bind('click', function() {
												
												var that = this;
												
												tools.elasped.start();
												app.data.export.reset();
												app.data.export.gather();
												app.methods.progressBar.start();
			
												tools.doWhenReady( function() {
													console.log('16805 waiting... ');
													return !app.stubs.renderingPNGforHeaders
												}, function() {
			
													var set_id = $(that).attr('set_id');
			
													var obj = {
														data: app.stubs.data,
														set_id: set_id,
														google_id: app.stubs.google_id,
														fileId: 'false'
													}
															
													obj['width'] = app.stubs.curCanvasSize.width;
													obj['height'] = app.stubs.curCanvasSize.height;
													
													console.log('ABOUT TO SAVE TEMPLATE');
																				
													tools.ajax( 'more/saveTemplate', obj, 'post', function( data ) {
														
														console.log(JSON.stringify(  data   , null, 2 ));

														tools.elasped.stop();
														toast('Template rendered in ' + tools.elasped.get() + ' secs', 'keep', false, 'success', 'Way to go!');

														app.methods.progressBar.stop('template');				
														
													});
													
												},'save');

												
												return;
												
												if( typeof( app.stubs.PDFId ) == 'undefined') {
													
													toast('No PDFId');
													
													return;	
												}
												
												var set_id = $(this).attr('set_id');
				
												var obj = {
													set_id: set_id,
													google_id: app.stubs.google_id,
													google_file_id: app.stubs.fileId,
													google_image_id: app.stubs.temp_image_id,
													google_pdf_id: ( typeof( app.stubs.PDFId) != 'undefined' ? app.stubs.PDFId: undefined)
												}
												
												console.log(JSON.stringify(  obj   , null, 2 ));
											
												tools.ajax('templates/add', obj, 'post', function(obj) {
													
													toast('all done!');
													console.log('responseObj: ' + JSON.stringify(  obj   , null, 2 ));
													
												});
												
											});
										},
										
										replaceFile: function() {
											
											$('.replace').unbind('click').bind('click', function() {
												
												var that = this;
												
												tools.elasped.start();
												app.data.export.reset();
												app.data.export.gather();
												app.methods.progressBar.start();
			
												tools.doWhenReady( function() {
													console.log('16880 waiting... ');
													return !app.stubs.renderingPNGforHeaders
												}, function() {
			
													var set_id = $(that).attr('set_id'),
															template_id = $(that).attr('template_id');

													var obj = {
														data: app.stubs.data,
														google_id: app.stubs.google_id,
														set_id: set_id,
														template_id: template_id,
														fileId: 'false'
													}
															
													obj['width'] = app.stubs.curCanvasSize.width;
													obj['height'] = app.stubs.curCanvasSize.height;
													
													console.log('ABOUT TO SAVE TEMPLATE');
																				
													tools.ajax( 'more/saveTemplate', obj, 'post', function( data ) {
														console.log(JSON.stringify(    data , null, 2 ));
														tools.elasped.stop();
														toast('Template rendered in ' + tools.elasped.get() + ' secs', 'keep', false, 'success', 'Way to go!');

														app.methods.progressBar.stop('replace file');				
														
													});
													
												},'save');
												
											});
										}
									},
									
									launch: function() {
										var that = this;
										$('#modal-box')
											.width(988)
											.height(620);

										app.methods.modal.on( 'true' );	
										
										$('#modal-box').load('html/pictographrTemplates.html?version=' + version + Math.random(),
											function() {
												that.post();
											}
										);	
									},
									
									post: function() {
										
										var that = this,
												collection_id = 2;
										tools.ajax('collections/getJson', {id: collection_id}, 'post', function(data) {
											
//											console.log(JSON.stringify(   data  , null, 2 ));
											
											that.paint(data.results);
											that.bind.openFile.call( that );
											that.bind.addFile.call( that );
											that.bind.replaceFile.call( that );
											
										});
									},
									
									paint: function(collections) {
										
										var html = '';
										
										for( var collection_name in collections){
											
											var groups = collections[collection_name];
											
											for( var group_name in groups){
												
												var sets = groups[group_name];

												if( !$.isArray( sets) && sets[Object.keys(sets)[0]] != 0 ){
													
													html += '\
														  <div class="row">\
														  	<div>\
														  		<h4><big><b>' + group_name + '</b></big></h4>\
														  	</div>\
														  	<hr style="border:1px solid gray">\
														  </div>\
															';
													for( var set_name in sets){
														
														var set = sets[set_name];
														
														if( typeof(set.length) != 'undefined'){
															
															html += '\
															  <div class="row">\
															  	<div>\
															  		<h4   style="cursor:pointer"  ' + ( typeof( set[0] ) != "undefined" ? "set_id=" + set[0].set_id :'' ) + ' class="addTemplate">' + set_name + '</h4>\
															  	</div>\
															  	<div>\
																';
																
															for( var idx in set){
																var template = set[idx];
																html += '\
																	<div  class="launchImg-wrapper">\
																		<img class="launchImg" template_id=' + template['id'] + ' src="templates/' + template['id'] + '_thumb.png?version=' + version + '">\
																		<div   ' + ( typeof( set[0] ) != "undefined" ? "set_id=" + set[0].set_id :'' ) + '   template_id=' + template['id'] + '  class="replace" ' + ( pow ? '' : ' style="display:none" ' ) + '>Replace</div>\
																	</div>\
																';						
															}
															
															html += '\
															  	</div>\
															  </div>\
																';
															
														};
														
	
														$('#pictographrTemplates-container').append(html);
														
														html = '';
														
													}
											
											  };
																									
											}
										}

									},
									
								};
								
								var smallapp_new = {
									
									init: function() {
										this.bind.openModal.call( this );
									},
									
									launch: function() {
										var that = this;
										$('#modal-box')
											.width(988)
											.height(620);

										app.methods.modal.on( 'true' );	
										
										$('#modal-box').load('html/pictographrTemplates.html?version=' + version + Math.random(),
											function() {
												$('#loading-div').show();
												$('#pictographrTemplates-main').hide();
												that.getFolders();
											}
										);	
									},
									
									getFolders: function() {
										
										var that = this;
										
										//tools.ajax('admin/getTemplatesFromDrive?parentFolderId=0B1nKK3UKG5hjZkFSVjRNLTcxdDg&version=' + version, {}, 'post', function( folders ) {
										tools.ajax('admin/getTemplatesJsonFile?version=' + version, {}, 'post', function( folders ) {
											
											//console.log(JSON.stringify(   folders  , null, 2 ));
											$('#loading-div').hide();
											$('#pictographrTemplates-main').show();
											that.paint( folders );
											that.bind.openFile.call( that );
											
										});
									},
									
									bind: {
										
										openModal: function() {	
											var that = this;
											$('.openPictographrTemplates').on('click', function() {
												that.launch();
											});	
										},
										
										openFile: function() {
											
											$('.launchImg').unbind('click').bind('click', function() {
												
												var fileId = $(this).attr('fileId');
												var url = 'https://pictographr.com/app?';
												
												url += 'state=%7B"ids":%5B"' + fileId + '"%5D,"action":"open","userId":"' + app.stubs.google_id + '"%7D';
												//window.open( url, '_blank');
												window.location.assign(url);   
												
											});
										}
									},
									
									paint: function(folders) {
										
										var html = '';
										
										for( var idx in folders){
											
											var folder = folders[idx];
											var title_folder = folder['title'];
											
											html += '\
												  <div class="row">\
												  	<div>\
												  		<h4><big><b>' + title_folder + '</b></big></h4>\
												  	</div>\
												  	<hr style="border:1px solid gray">\
												  </div>\
													';
																						
											if( typeof( folder['sub_folders'] ) != 'undefined'){
												
												var sub_folders = folder['sub_folders'];
								
												for( var idx in sub_folders){
													
													var sub_folder = sub_folders[idx];
													
													var title_sub_folder = sub_folder['title'];
													
													html += '\
													  <div class="row">\
													  	<div>\
													  		<h4>' + title_sub_folder + '</h4>\
													  	</div>\
													  	<div>\
														';													
													
													var files_sub_folder = sub_folder['files'];
													for( var idx in files_sub_folder){
														
														var file = files_sub_folder[idx];
														var title_file = file['title'];
														var thumb = file['thumb'];
														var fileId = file['id'];
														
															html += '\
																<div  class="launchImg-wrapper">\
																	<img class="launchImg" fileId=' + fileId + ' src="temp/templates/' + fileId  + '.png">\
																</div>\
															';	
													}
													
													html += '\
													  	</div>\
													  </div>\
														';													
											
											  };
																									
											} else{
												
													html += '\
													  <div class="row">\
													  	<div>\
														';		
												
													var files_folder = folder['files'];
													
													for( var idx in files_folder){
														
														var file = files_folder[idx];
														var title_file = file['title'];
														var thumb = file['thumb'];
														var fileId = file['id'];
														
															html += '\
																<div  class="launchImg-wrapper">\
																	<img class="launchImg" fileId=' + fileId + ' src="temp/templates/' + fileId  + '.png">\
																</div>\
															';	

													}
												
													
													html += '\
													  	</div>\
													  </div>\
														';
												
											};

											
										}
											
										$('#pictographrTemplates-container').append(html);
										
										html = '';
										
									},
									
								};
								
								smallapp_new.init();
								
								
							},		
														
							welcome: function() {
								
								if( window.isOrgAdmin ){
									$('#accountLink').text('Licenses Setup');
								}
								
								if( window.isInOrganization &&
										window.status_id == 6 &&
										!window.isOrgAdmin
								){
									$('#accountLink').parent().hide();								
								}	
															
								if( window.status_id == 10 ||
										window.status_id == 11
								){
									
									$('#accountLink, #preferencesLink').parent().hide();
									
									setTimeout(function(){
														
									  (function(){ 
									    var node = document.createElement("script"); 
									    node.setAttribute("type", "text/javascript"); 
									    node.setAttribute("src", "//app.bugmuncher.com/js/bugMuncher.min.js"); 
									    document.getElementsByTagName("head")[0].appendChild(node); 
									  })();
					
										
									}, 6000);
									
								};
								
								if( window.acceptTerms == 1 || window.isOrgAdmin){
									
									$('#welcomeLink').parent().hide();
									
								} else{
									
									app.methods.welcome.init();					
									
								};

							},	
							
							contactUs: function() {
								return;
								$('#contactUsLink').on('click', function() {
									app.methods.contactus.init();
								});									
							},
							
							showMe: function() {
								$('#showMeLink').on('click', function() {
									app.methods.showmehow.init();
								});									
							},
							
							faq: function() {
								$('#faqLink').on('click', function() {
									app.methods.faq.init();
								});									
							},
							
							preferences: function() {
								
								$('#preferencesLink').on('click', function() {
									app.methods.preferences.init();
								});	
							},	
														
							melink: function() {
								$('#meLink').on('click', function() {
										app.methods.clearActive(['previewOn', 'removeToast'], 'exclude', 'clicked on bubble');
										$('.tooltip').removeClass('show').addClass('disable');
										$('[data-toggle="tooltip"]').tooltip('disable');
								});
							},
							
							downloadImageByUrl: function() {
								
								$('#imageDownloadByUrlButton').on('click', function() {
									
									app.stubs.placement.leftPlace += app.stubs.placement.increment;
									app.stubs.placement.topPlace += app.stubs.placement.increment;
									
									var left = app.stubs.placement.leftPlace,
											top = app.stubs.placement.topPlace,
											json = app.methods.generateJsonFromGraphicModel( 'web', left, top, false, $(this).attr('cid'));
											
									json.justDropped = true;
									
									app.methods.clearActive(['previewOn', 'removeToast'], 'exclude', ' downloadImageByUrl');
										
									app.methods.widgets.route(json);
										
								});	
								
							},
							
							account: function() {
								$('#accountLink').on('click', function(event) {
										event.preventDefault(); 
										app.methods.account.init();
								});								
							},
							
							education: function() {
								
								if( window.status_id == 6){
									$('#educationLink').parent().remove();
								}else{
									
									$('#educationLink').on('click', function(event) {
										
											event.preventDefault(); 
	
											$('#modal-box')
												.width(750)
												.height(350);
												
											var canDisable = true;
											
											app.methods.modal.on( canDisable );	
											
											$('#modal-box').load('html/education_modal.html?version=' + version,
												function() {
													
													
												}
											);	
											
									});			
																				
								};
								
			
							},
							
							seeImg: function() {
								
									var longUrl,
											shortenedUrl,
											pinUrl,
											$bubble = $('#imgBubble'),
											$button = $('#imgButton'),
											$doWrapper = $('.do-wrapper'),
											postIt = function( social ) {
												switch( social ){
													
												  case 'twitter': {
												  	var postURL = "https://twitter.com/share?url=" + shortenedUrl + "&text=pictographr tweet image";
											  		break;
											  	}
											  	
												  case 'linkedin': {
												  	var postURL = "https://www.linkedin.com/shareArticle?mini=true&url=" + shortenedUrl + "&title=pictographr&summary=pictographr";
											  		break;
											  	}
											  	
												  case 'googleplus': {
												  	var postURL = "https://plus.google.com/share?url=" + shortenedUrl;
											  		break;
											  	}
											  	
												  case 'email': {
												  	var postURL = "mailto:?subject=Sharing my design from Pictographr.&body=Please click on this link: " + shortenedUrl;
											  		break;
											  	}														  	
											  	
												  case 'public-url': {
												  	//var postURL = "http://pictographr.com/image/socialImage/" + google_id + "/" + app.stubs.temp_image_id;
												  	var postURL = shortenedUrl;
											  		break;
											  	}											  	
											  	
											  }
											  
											  
											  if(typeof( Windows) != 'undefined') {  // UWP version
														
													var uri = new Windows.Foundation.Uri(postURL);

													var options = new Windows.System.LauncherOptions();
													options.treatAsUntrusted = false;
													
													Windows.System.Launcher.launchUriAsync(uri, options).then(
													   function (success) {
													      if (success) {
																		    
													      } else {
																		    
													      }
													   });
																		
													
												} else{
													
													tools.redirectURL(postURL);
													
												}
											  
											  
											},
											addDoButtons = function() {
												$('#imgBubble').append('\
													<div id="do-container" >\
														<div  class="do-row whereload">\
															<div  class="do-img-wrapper">\
																<img  id="spot-to-drive-button"  class="do-img" src="img/drive.png" />\
																<img id="spot-to-desktop-button"  class="do-img" src="img/download.png" />\
																<img id="publicUrl"  class="do-img" src="img/link.png" />\
															</div>\
														</div>\
														<div  class="do-row social-row">\
															<div  class="do-img-wrapper" >\
																	<img  id="facebook-post-button"  class="do-img" src="img/facebook.png">\
																	<img   id="twitter-button"   social="twitter" class="do-img social" src="img/twitter.png">\
																	<img  id="linkedin-button"   social="linkedin"  class="do-img social" src="img/linkedin.png">\
																	<img  id="googleplus-button" social="googleplus" class="do-img social" src="img/googleplus.png">\
																	<img   id="pinterest-button"  class="do-img" src="img/pinterest.png">\
																	<img   id="email-button"  class="do-img" src="img/email.png">\
															</div>\
														</div>\
												');
										
												$('#spot-to-drive-button').click( function() {
													
													app.methods.progressBar.start();
													
													var url = 'app/spotToDrive',
															obj = {
																base64: app.stubs.tempImageBase64,
																google_id: app.stubs.google_id
															};
															
													tools.ajax(url, obj, 'post', function( data ) {
														
														app.methods.progressBar.stop('spot to drive');
														toast('This image is now saved in your image folder under the main Pictographr folder.', 'keep', false, 'success', 'Success');	
													});							
		
												});
												
												$('#spot-to-desktop-button').click( function() {
													
														app.methods.progressBar.start();
													
														var url = 'app/spotToTempFile',
																obj = {
																	base64: app.stubs.tempImageBase64,
																	google_id: app.stubs.google_id
																};
																
														tools.ajax(url, obj, 'post', function( data ) {
															
															app.methods.progressBar.stop('spot to desktop');
															
															//var url = base_url + 'uploads/output/image_facebook_' + app.stubs.google_id + '.png';
															var url = base_url + 'temp/image_facebook_' + app.stubs.google_id + '.png';
															
															
															if( typeof( Windows) != 'undefined' ) { // UWP version
																
																var fileName = app.stubs.fileTitle.replace(/ /g,"_");
																fileName = fileName.replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|\+|=)/g,"") + '.png';
																
												        Windows.Storage.KnownFolders.getFolderForUserAsync(
												        	null, Windows.Storage.KnownFolderId.picturesLibrary
												        ).then(function (picturesLibrary) {
												            return picturesLibrary.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting);
												        }).done(
												        function (file) {
												
																	WinJS.xhr({
																	    url: url,
																	    responseType: "arraybuffer"
																	}).then(
																	    function completed(result) {
																		    
																		    var buffer = new Uint8Array(result.response);
																		    Windows.Storage.FileIO.writeBytesAsync(file, buffer);
																	
																	}).then(
																			function createFileSuccess() {
																				
																			    var msgtext = "Your image has been downloaded to your Pictures folder";
																			    toast( msgtext, 'keep', false, 'success', 'Success');	
																	});
												
												        },
												        function (error) {
												        		toast("error in create");
												        });
																
															} else{
																
																tools.download(url, app.stubs.fileTitle.replace(/ /g,"_") + '.png');
															
																var url = 'app/removeSpotToTempFile',
																		obj = {
																			google_id: app.stubs.google_id
																		};
																		
																tools.ajax(url, obj, 'post', function( data ) {});																
																
															}
															
														});
													

														
												});	
												
												$('#publicUrl').click( function() {
													
													var social = 'public-url';
													
													if( typeof( shortenedUrl ) != 'undefined') {
														postIt(social);
														return;	
													}
													
													app.methods.progressBar.start();
													
													var url = 'app/spotToDrive',
															obj = {
																base64: app.stubs.tempImageBase64,
																social: 'true',
																google_id: app.stubs.google_id
															};
															
													tools.ajax(url, obj, 'post', function( data ) {
														
														app.methods.progressBar.stop('public url');
														
														shortenedUrl = data.shortenedURL;
														longUrl = data.longUrl;	
																											
														var pinImageUrl = 'https://pictographr.com/image/pinDriveImage/' + app.stubs.google_id + '/' + data.image_fileId;
														
														pinUrl = 'https://www.pinterest.com/pin/create/button/?url=' + longUrl + '&media=' + pinImageUrl;

														
														postIt(social);
														
													});							
		
												});													
																						
												$('#pinterest-button').click( function() {
													
													if( typeof( pinUrl ) != 'undefined') {
														 tools.redirectURL(pinUrl);
														return;	
													}
													
													app.methods.progressBar.start();
													
													var url = 'app/spotToDrive',
															obj = {
																base64: app.stubs.tempImageBase64,
																pinterest: 'true',
																google_id: app.stubs.google_id
															};
															
													tools.ajax(url, obj, 'post', function( data ) {
														
														app.methods.progressBar.stop('pinterest but');
														
														shortenedUrl = data.shortenedURL;
														longUrl = data.longUrl;
														
														var pinImageUrl = 'https://pictographr.com/image/pinDriveImage/' + app.stubs.google_id + '/' + data.image_fileId;
														
														pinUrl = 'https://www.pinterest.com/pin/create/button/?url=' + longUrl + '&media=' + pinImageUrl;

												    tools.redirectURL(pinUrl);
														
													});							
		
												});
												
												$('.do-img.social').click( function() {
													
													var social = $(this).attr('social');
													
													if( typeof( shortenedUrl ) != 'undefined') {
														postIt(social);
														return;	
													}
													
													app.methods.progressBar.start();
													
													var url = 'app/spotToDrive',
															obj = {
																base64: app.stubs.tempImageBase64,
																social: 'true',
																google_id: app.stubs.google_id
															};
															
													tools.ajax(url, obj, 'post', function( data ) {
														
														app.methods.progressBar.stop('do img social');
														
														shortenedUrl = data.shortenedURL;
														longUrl = data.longUrl;	
																											
														var pinImageUrl = 'https://pictographr.com/image/pinDriveImage/' + google_id + '/' + data.image_fileId;
														
														pinUrl = 'https://www.pinterest.com/pin/create/button/?url=' + longUrl + '&media=' + pinImageUrl;

														
														postIt(social);
														
													});							
		
												});												

												$('#facebook-post-button').click( function() {
													
														app.methods.progressBar.start();
														
														var url = 'app/spotToTempFile',
																obj = {
																	base64: app.stubs.tempImageBase64,
																	google_id: app.stubs.google_id
																};
																
														tools.ajax(url, obj, 'post', function( data ) {
															
															app.methods.progressBar.stop('facebook ppst');
															
															var url = base_url + 'temp/image_facebook_' + app.stubs.google_id + '.png',
																	postFacebook= function() {
																		
																		FB.api('me/photos', 'post', {
																		    message: 'Designed in Pictographr',
																		    status: 'success',
																		    access_token: window.FBaccessToken,
																		    url: url
																		}, function(response) {
																			
																				toast('Image has been posted to Facebook.', 'keep', false, 'success', 'Success');	
																				
																				var url = 'app/removeSpotToTempFile',
																						obj = {
																							google_id: app.stubs.google_id
																						};
																						
																				tools.ajax(url, obj, 'post', function( data ) {});
																				
																			 }
																		);
																	};
															
															if( typeof( window.FBaccessToken ) == 'undefined'){
																
																app.methods.widgets.facebook.authenticate( function() {
															
																	postFacebook();
						
																});
																
															} else{
																
																	postFacebook();
																
															}
															
															
														});	
													

														return;
									
														FB.ui({
														  method: 'feed',
														  link: url,
														  name: 'Pictographr Post to Facebook Test',
														  caption: 'This is a post to see if this works.'
														}, function(response){
																console.log(JSON.stringify( response ));
														});	
														
													
														$(this).parent().attr('href', $('#imgPic').attr('src'));
													  $(this).parent().click();			
												});

												$('#email-button').click( function() {
													
													var social = 'email';
													
													if( typeof( shortenedUrl ) != 'undefined') {
														postIt(social);
														return;	
													}
													
													app.methods.progressBar.start();
													
													var url = 'app/spotToDrive',
															obj = {
																base64: app.stubs.tempImageBase64,
																social: 'true',
																google_id: app.stubs.google_id
															};
															
													tools.ajax(url, obj, 'post', function( data ) {
														
														app.methods.progressBar.stop('email button');
														
														shortenedUrl = data.shortenedURL;
														longUrl = data.longUrl;			
																									
														var pinImageUrl = 'https://pictographr.com/image/pinDriveImage/' + google_id + '/' + data.image_fileId;
														
														pinUrl = 'https://www.pinterest.com/pin/create/button/?url=' + longUrl + '&media=' + pinImageUrl;

														
														postIt(social);
														
													});							
		
												});													
										
											},
											buffer = 10,
											defaultPic = function() {
												var width = 300,
														height = 250;
												
												$('#imgPic').attr('src', 'https://placehold.it/' + width + 'x' + height);
		
												$('#imgPic, #imgBubble').width(width).height(height);
												$('#imgBubble').width(width + buffer).height(height + buffer);
											},
											
											centerBubble = function() {
												$bubble.removeClass('transition2s');
												var buffer = 6,
														buttonCenter = $button.offset().left + $button.width();
												var bubbleLeft = (buttonCenter - $bubble.width() / 2) + buffer;
												
												$bubble.offset({left:  bubbleLeft});
												$bubble.addClass('transition2s');
											},
											renderPic = function(savehow) {
												
												if( app.stubs.saving ){
													toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
													return;
												}
												
												if( app.stubs.offline ){
													toast('Can not render image. Your internet connection is offline.');
													return;
												}
												
												app.stubs.savingWhat = 'Rendering';
												app.stubs.saving = true;
												
												app.data.export.reset();
												var gatherhow = ( savehow == 'spotify' ? 'spotify': undefined);
												
												tools.elasped.start();
												
												app.methods.progressBar.start();
												app.data.export.gather(gatherhow);
												

												
												/*  // EDIT
												
													console.log(app.stubs.data.elements);
													if( typeof( app.stubs.data.elements ) != 'undefined' ){   
														console.log('No elements: ' + app.stubs.data.elements.length);   
													}						
																									
												
													if( typeof( app.stubs.data.elements ) == 'undefined' ){
														toast('There is nothing on the canvas to render.', 'keep', 5000, 'info', 'Really?');
														return;	
													};
												
												*/
							
												tools.doWhenReady( function() {
													console.log('17513 waiting... ');
													return !app.stubs.renderingPNGforHeaders
												}, function() {
													
													if (app.stubs.saveIsInterrupted ) {  // render PNG
														app.stubs.saveIsInterrupted = false;
														return;
													}

													var obj = {
																google_id: app.stubs.google_id,
																fileId: 'false',
																data: app.stubs.data
															};
															
													if( savehow == 'spotify' ) {
														obj['width'] = parseInt(app.stubs.spot.frame.width);
														obj['height'] = parseInt(app.stubs.spot.frame.height);
														obj['data'].spot = app.stubs.spot;
														
													} else{
														obj['width'] = app.stubs.curCanvasSize.width;
														obj['height'] = app.stubs.curCanvasSize.height;
													}
													
													console.log('ABOUT TO RENDER PNG');
													app.methods.serverprocessing = true;
													toast('Processing on Server.', 'wait for server');
																				
													tools.ajax( 'more/renderPNG', obj, 'post', function( data ) {
														//console.log(JSON.stringify(  data   , null, 2 ));
														app.stubs.saving = false;
														app.methods.serverprocessing = false;
														
														if( data.status == 'problem' ){
															toast( data.message, 'keep', false, 'error', 'Unsuccesful.');
															app.methods.progressBar.stop('Your file size is not yet supported');
															return;
														};
														
														if( data.status == 'error' ||
																data.readyState == 4
														) {
															toast('An error has occured.  Please contact support', 'keep', false, 'error', 'Something went wrong.');
															app.methods.progressBar.stop('render png error');
															return;
														}
	
														if( isSocial )app.stubs.share.justpulledOriginalImage = false;
														
														var height = ( data.height > tools.getScreenDim().height ? tools.getScreenDim().height - 100 : data.height),
																ratio = height /  data.height * data.width;
																
														app.stubs.tempImageBase64 = tools.deepCopy(data.base64);
														console.log('img loading');
														$('#imgPic').attr('src', app.settings.base64Prefix + data.base64).on('load', function() {
															console.log('img loaded');
															$bubble.addClass('visible');
															$('#imgPic').height(height).width( ratio);
															$('#imgBubble').width(ratio + buffer).height(height + 3);															
															app.methods.progressBar.stop('after  img load');
															centerBubble();
														});
														
														shortenedUrl = undefined;		
														
														delete data.base64;
														console.log(JSON.stringify(  data , null, 2 ));	
														tools.elasped.stop();
														
														if( savehow == 'spotify' ) {
															toast('Rendered only selected area.  Unselect elements to render entire canvas.', 'saved selected');
														}	else{
															toast('PNG rendered in ' + tools.elasped.get() + ' secs', 'saved');
														}													
														
//														var obj = {
//																fileId: data.fileId,
//																switch_ip: data.switch_ip,
//																google_id: app.stubs.google_id,
//																switch_id: data.switch_id
//															};
//														
//														tools.ajax( 'more/cleartemp', obj, 'post', function( data ) {
//															
//																console.log(JSON.stringify(  data , null, 2 ));
//
//																
//														});
														
													});
												},'save');

												return;
												
												/* ------------------------------------------------------------------------- */
												
												app.stubs.savingWhat = 'Rendering';
												app.data.export.reset();
												var gatherhow = ( savehow == 'spotify' ? 'spotify': undefined);
												app.data.export.gather(gatherhow);
												app.data.export.save(function(data) {
													
													app.stubs.saving = false; 
													$bubble.addClass('visible');
													app.stubs.quickSaveCount = 1;
													
													app.stubs.tempImageBase64 = data.base64;
													
													if( isSocial )app.stubs.share.justpulledOriginalImage = false;
													
													var height = ( data.height > tools.getScreenDim().height ? tools.getScreenDim().height - 100 : data.height),
															ratio = height /  data.height * data.width;
													
													$('#imgPic').attr('src', app.settings.base64Prefix + data.base64);

													$('#imgPic').height(height).width( ratio);
													$('#imgBubble').width(ratio + buffer).height(height + 3);
													
													centerBubble();
													
													shortenedUrl = undefined;
													
												}, savehow );
												
												
												
											},
											
											getTempImage = function() {
												
												app.methods.progressBar.start();
												
												var url = 'index.php/app/doesDriveFileIdExist',
														obj = { 
															google_id: app.stubs.google_id,
															fileId: app.stubs.temp_image_id
														};
														
												tools.ajax(url, obj, 'post', function( data) {
													
													if( data.itDoesExist == 'true'){
														var url = 'index.php/app/open',
																obj = { 
																	google_id: app.stubs.google_id,
																	fileId: app.stubs.temp_image_id,
																	openFrom: 'temp_image'
																};
																
														tools.ajax(url, obj, 'post', function( data) {
															
															app.methods.progressBar.stop('does file drive exist');
															
															app.stubs.tempImageBase64 = data.base64Data;
															
															$bubble.addClass('visible');
															
															var height = ( data.height > tools.getScreenDim().height ? tools.getScreenDim().height - 100 : data.height),
																	ratio = height /  data.height * data.width;
															
															$('#imgPic').attr('src', app.settings.base64Prefix + data.base64Data);
		
															$('#imgPic').height(height).width( ratio);
															$('#imgBubble').width(ratio + buffer).height(height + 3);
															
															centerBubble();
															
															app.methods.progressBar.stop('does file drive exist2 '); 
															
															
							
														});
													} else {
														renderPic('renderAsPng');
													}
					
												});												


													
											};
									
											addDoButtons();
											
											$button.on('click', function() {
												
												console.log('here1');
												
												if( app.stubs.collections.elements.length == 0 ||
														app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()
												){
													app.methods.shakeNo($(this));
													toast('There is nothing on the canvas to render.', 'keep', 5000, 'info', 'Really?');
													return;	
												};
												
												if( app.stubs.saving ){
													toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
													return;
												}
												
												$('.tooltip').removeClass('show').addClass('disable');
												app.methods.clearActive(['enableTooltip', 'disableGroupy', 'emptyGrouped', 'removeSpot', 'previewOn', 'removeToast'], 'exclude', 'clicked on bubble');
												
												if( serverhost == 'localhost'){
													defaultPic();
													$bubble.addClass('visible');

												} else{
													
														var savehow;
														
														if(app.stubs.grouped.length == 0)	{
															savehow = 'renderAsPng';		
																	
															if( typeof(app.stubs.tempImageBase64) != 'undefined' ){
																	$bubble.addClass('visible');
																	centerBubble();
																	return;
															}
																							
														} else{
															
															app.stubs.recentlySaved = false;
															
															savehow = 'spotify';
															
														}											
																
														renderPic(savehow);
												}
		
												
											});
		
		
											$('.renderPNG').on('click', function() {
												
												console.log('here2');
												
												if( app.stubs.collections.elements.length == 0 ||
														app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()
												){
													app.methods.shakeNo($(this));
													toast('There is nothing on the canvas.')
													return;	
												};
												
												if( app.stubs.saving ){
													toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
													return;
												}
												
												var savehow = 'renderAsPng';
														
												if( typeof(app.stubs.tempImageBase64) != 'undefined'){
													$bubble.addClass('visible');
													return;	
												}
														
												renderPic(savehow);
												
											});	
				
							},
							
							saveAsTemplate: function() {
								$('#saveAsTemplate').on('click', function() {

									app.stubs.savingWhat = 'Template';
									
									app.data.export.reset();
									app.data.export.gather();
									app.data.export.save(function(data) { 
										app.stubs.saving = false;
										toast('File is saved in template folder.')
										app.stubs.isTemplate = window.isTemplate = true;
									}, 'asTemplate');
									
									
								});
							},
							
							openNew: function() {
								$('#openNew, #newFileButton').on('click', function() {
									
									if( app.stubs.saving ){
										toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
										return;
									}
												
									if( app.stubs.offline ){
										toast('Your internet connection is offline.');
										return;
									}
									
									if(typeof( Windows) != 'undefined') app.methods.autosave.delete()  // UWP version
									
									var url = 'app?';
									
									if( typeof( tools.urlGet('pollrefresh') ) == 'string' )	url += 'pollrefresh=true&';							
							
									if( typeof( tools.urlGet('new_width') ) == 'string' ){
											url += 'new_width=' + tools.urlGet('new_width') + '&';												
											url += 'new_height=' + tools.urlGet('new_height') + '&';												
									};

									url += 'state=%7B"folderId":%5B"' + app.stubs.pictoFolderId ;
									url += '"%5D, "newSerial": "' +  Math.random();
									url += '", "action":"create","userId":"';
									url +=  app.stubs.google_id;
									url += '"%7D';

									if( app.stubs.recentlySaved){
										
										window.location.assign(url);
										return;										
										
										app.stubs.fileId = 'false';
										app.methods.clearCanvas('no save');
										window.newSerial = Math.random();
										
									} else {
										window.location.assign(url);
									}
									
								});
							},
							
							openOld: function() {
								
								var doWithData = function(data) {
										
										if( app.stubs.saving ){
											toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
											return;
										}
										
												
										if( app.stubs.offline ){
											toast('Your internet connection is offline.');
											return;
										}
										
										
										if( data.length == 0){
											toast('There are no files found.  Try creating one first.', 'keep', 5000, 'info', 'Note.');
											return;
										};
										
										app.methods.modal.on( 'true' );	
										
										$('#modal-box').css('padding', '0px').width(800).height(580);
										
										$('#modal-box').load('html/open_old.html?version=' + version,
											function() {
												
												$('#old-files-container-wrapper').css('overflow', 'none');
												
												var len = data.length,
														count = 0,
														imgCount = 0;
														
												for( var idx in data){
													count++;
													var file = data[idx],
															src = file['thumbnailLink'],
															fileId = file['fileId'];
															
													//console.log(src);
													//src = 'img/transparent.png';

													$('#old-files-container').append('\
														<div class="old-thumb transition2s invisible"  count="'+ count +'" fileId="' + fileId  + '" >\
															<img  class="isFile"  src="' + src + '">\
															<div  class="old-files-delete-div">\
																<img src="img/md-color-svg/ic_delete_24px.svg" class="old-files-delete-img" >\
															</div>\
														</div>\
													');																
												}
												
												$('#old-files-container').wookmark();
												
												$('#old-files-container img.isFile').each( function() {
													$(this).on('error',  function() {
														
														len--;
														
													}).on('load', function(e) {
														
														imgCount++;
														$(this).parent('div').width($(this).width()).height($(this).height())
														
													});													
												});
												
												$('#old-files-container').on('click', 'img.isFile', function() {
														
														$(this).unbind('click');
														
														var fileId = $(this).parent().attr('fileId');
														
														var	url = 'app?';
																
														if( typeof( tools.urlGet('pollrefresh') ) == 'string' )	url += 'pollrefresh=true&';
																
														url += 'state=%7B"ids":%5B"' + fileId + '"%5D,"action":"open","userId":"' + app.stubs.google_id + '"%7D';

														if( app.stubs.recentlySaved){
															
																window.location.assign(url);
																return;

														} else {
																
																window.location.assign(url);
																return;
																window.open(url, '_blank');
																app.methods.modal.off('Au');
														}
													
												});
												
												$('#old-files-container').on('click', 'img.old-files-delete-img', function() {
													
														var $divContainer = $(this).parent().parent();
														
														var fileId = $divContainer.attr('fileId');
														
												    if (confirm("Are you sure you want to remove this file from Drive") == true) {
															
															var obj = { 
																					fileId: fileId,
																					google_id: app.stubs.google_id	
																				};
															
															tools.ajax( 'app/deleteFile', obj, 'post', function( obj ) {
																 	if( obj.success){															
																 	 	toast("The file has been moved to Google Drive's trash folder where it can be restored if needed.", "keep", false, 'info', 'Note.');
																 	 	$divContainer.remove();
																 	 	$('#old-files-container').wookmark();
																	} else{
																		toast('error occured');
																	};
																
															});	
												    }
														
												});
																									
																						
												tools.doWhenReady( function() {
													if( imgCount ==  len) return true
													else return false
												},
												function() {
													
													$('.old-thumb').removeClass('invisible');
													$('#old-files-container-wrapper').css('overflow', 'auto');
													$('#old-files-container').wookmark();
													$('#loading-div').hide();
													
												},
												'placefinder'
												);
												

												
											});
					
								};

								
								$('#openFiles, #openOldFileButton').on('click', function() {
									
									if( app.stubs.saving ){
										toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
										return;
									}
												
									if( app.stubs.offline ){
										toast('Your internet connection is offline.');
										return;
									}
												
									app.methods.progressBar.start();
									app.stubs.saving = true;
									app.stubs.savingWhat = 'Retrieving files';
									
									var url = 'app/getFileList',
											postObj = {
												'google_id': app.stubs.google_id,
												'whichFolder': 'files'
											};

									tools.ajax(url, postObj, 'post', function(data) {
										app.methods.progressBar.stop('open files');
										app.stubs.saving = false;

										doWithData(data);
				
									});		
								});
								
								$('#openTemplates').on('click', function() {
									
									if( app.stubs.offline ){
										toast('Your internet connection is offline.');
										return;
									}
									
									
									if( app.stubs.saving ){
										toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
										return;
									}									
									
									app.methods.progressBar.start();

									app.stubs.saving = true;
									app.stubs.savingWhat = 'Retrieving files';
									
									var url = 'app/getFileList',
											postObj = {
												'google_id': app.stubs.google_id,
												'whichFolder': 'templates'
											};

									tools.ajax(url, postObj, 'post', function(data) {
										app.stubs.saving = false;
										doWithData(data);
				
									});		
								});									

							},	
													
							clear: function() {
								$('#clearButton').on('click', function() {
									app.methods.clearCanvas();			
								});
							},		
														
							open: function() {
								$('#openButton').on('click', function() {
									app.methods.open();
								});
							},
							
							save: function() {

								$('#saveButton, #fileSave').on('click', function() {
									
									if( typeof( app.stubs.folderOwnedByMe ) != 'undefined' &&
											app.stubs.folderOwnedByMe == 'false'
									){
										
										$('#saveAsNew').click();
										return false;
																				
									};
									
									if( app.stubs.saving ){
										toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
										return;
									}
									
									if( serverhost == 'localhost'){
										
										app.methods.progressBar.start();
										app.methods.clearActive( undefined, undefined, 'menu save');
										app.data.export.reset();
										app.data.export.gather();
										
										app.stubs.savingWhat = 'Saving';
										app.stubs.saving = true;
										
										tools.doWhenReady( function() {
											 // console.log('18071 waiting... ');
											return !app.stubs.renderingPNGforHeaders
										}, function() {
											
											
											if (app.stubs.saveIsInterrupted ) { // save local
												console.log('saveWasInterrupted.  Save halted.');
												app.stubs.saveIsInterrupted = false;
												return;
											}
												
											console.log('ABOUT TO SAVE');
											app.methods.serverprocessing = true;	
																				
											app.data.export.save(function() {
												
												console.log('SAVED');	
												app.stubs.recentlySaved = true;
												window.onbeforeunload = app.methods.cleanUpOnExit
												app.stubs.saving = false;
												app.methods.serverprocessing = false;
												
												if( serverhost == 'localhost'){
													
													toast('Saved.', 'clearPrevious');
										
													var url = 'index.php/app/base?param=' + app.stubs.google_id + '@' + app.stubs.fileId + ( serverhost == 'localhost' ? '@temp': '&drive=true');
													var win = window.open(url,	'Pictographr', 'type=fullWindow, fullscreen, scrollbars=yes, modal=yes');
													win.focus();	
													var left = undefined,
															top = 90;
															
													tools.popupwindow(url, "Pictographr", tools.getScreenDim().width - 300, tools.getScreenDim().height - 70, left, top);
													var url = 'index.php/app/base?param=' + app.stubs.google_id + '@' + app.stubs.fileId + '&drive=true';

													
												}else{
													app.stubs.print = print;
													toast('Saved on your cloud drive.');	
												}
												app.methods.progressBar.stop('local save');
												app.stubs.isTemplate = window.isTemplate = false;
												tools.cookies.setCookie('active_id', app.stubs.fileId, tools.cookies.expires);
												
											}, 'justSave');
										},'save');
										
										return false;	
										
									} else{
									
										if( app.stubs.collections.elements.length == 0  ||
													app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()){
											app.methods.shakeNo($(this));
											toast('There is nothing on the canvas to save.', 'keep', 5000, 'info', 'Really?');
											return;	
										};
										
										if( app.stubs.saving ){
											toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
											return;
										}

										if( app.stubs.offline ){
											toast('Can not save.  Your internet connection is offline.');
											return;
										}
										
										if( app.stubs.recentlySaved ){
											toast('Everything has already been saved.', 'note');
											return;	
										};

										app.stubs.savingWhat = 'Saving';
										app.stubs.saving = true;										
										
										app.methods.clearActive( undefined, undefined, 'justSave');
										
						
										app.methods.progressBar.start();										
										app.data.export.reset();
										app.data.export.gather();
										
										

										/*  // EDIT
										
										console.log(app.stubs.data.elements);
										
										if( typeof( app.stubs.data.elements ) != 'undefined' ){   
											console.log('No elements: ' + app.stubs.data.elements.length);   
										}
										
										
											if( typeof( app.stubs.data.elements ) == 'undefined' ){
												toast('There is nothing on the canvas to render.', 'keep', 5000, 'info', 'Really?');
												return;	
											};
										
										*/

										tools.doWhenReady( function() {
											console.log('18171 waiting... ');
											return !app.stubs.renderingPNGforHeaders
										}, function() {
											
											if (app.stubs.saveIsInterrupted ) {  // save remote
												app.stubs.saveIsInterrupted = false;
												return;
											}
											
											var sizeJson = tools.lengthInUtf8Bytes(JSON.stringify(app.stubs.data));
											console.log(sizeJson);
											console.log('ABOUT TO SAVE');
											app.methods.serverprocessing = true;
											toast('Processing on Server.', 'wait for server');
											
											var url = 'more/save',
													obj = {
														data: app.stubs.data,
														google_id: app.stubs.google_id,
														width: app.stubs.curCanvasSize.width,
														height: app.stubs.curCanvasSize.height,
														fileId: app.stubs.fileId
													};
													
											tools.ajax(url, obj, 'post', function( data ) {	

												app.stubs.recentlySaved = true;
												window.onbeforeunload = app.methods.cleanUpOnExit
												app.stubs.saving = false;
												app.methods.serverprocessing = false;
												
												if( data.status == 'problem' ){ // HERE
													toast( data.message, 'keep', false, 'error', 'Unsuccessful.');
													app.methods.progressBar.stop('There was a internet connection problem. Please save onto the desktop.');
													
													if (confirm("An error has occured.  Do you want to save your work onto the Desktop?  Images and text are all saved in a text file you can open later.") == true) {
														app.methods.saveToDeskop();
													}	
													
													return;
												};
												
												if( data.status == 'error' ||
														data.status == 0 ||
														data.readyState == 4 ||
														data.readyState == 0
												) {
													console.log(JSON.stringify(  data , null, 2 ));
													toast('An error has occured.  Please contact support', 'keep', false, 'error', 'Something went wrong.');
													app.methods.progressBar.stop('save error');
													if (confirm("An error has occured. Do you want to save your work onto the Desktop?  Images and text are all saved in a text file you can open later.") == true) {
														app.methods.saveToDeskop();
													}	
													return;
												}

												console.log(JSON.stringify( data    , null, 2 ));
												
												app.stubs.fileId = data.fileId;
												app.stubs.parentFolderId = data.parentFolderId;
												
												tools.cookies.setCookie('active_id', app.stubs.fileId, tools.cookies.expires);
												app.stubs.isTemplate = window.isTemplate = false;
												
												tools.elasped.stop();
												
												console.log('Saved in ' + tools.elasped.get() + ' secs');
												
												if( typeof( tools.urlGet('opener_reload') ) == 'string' ){												
													if( opener )  {
														opener.location.reload();
														toast('Design now available in side panel.', 'saved');
													}
												} else if( typeof( tools.urlGet('refreshSidebarFiles') ) == 'string' ) {
													if( opener ) {
														if( typeof( opener.refreshSidebarFiles ) == 'function'){
															toast('Design now available in side panel.', 'saved');
															opener.refreshSidebarFiles();
															opener.focus();															
														}else{
															toast('Design now available in side panel. Please click refresh on add-on', 'saved');
														};
													}
												} else if( typeof( tools.urlGet('pollrefresh') ) == 'string' ) {
													tools.cookies.setCookie('pollRefresh', true);
													toast('Design now available in side panel.', 'saved');
													setTimeout(function(){
														tools.cookies.deleteCookie('pollRefresh');
													}, 5000);
												} else{
													toast('Saved on Google drive.', 'saved');
												};

												app.methods.progressBar.stop('more save');
												
											});


										},'save');
							
										return false;
									};

								});
								
							},
																
							trash: function() {
								$('#trashButton').on('click', function() {
									var that = this;
									$(this).removeClass('animated shake');
									if( app.stubs.grouped.length == 0 ){
										setTimeout(function(){
											$(that).addClass('animated shake');
										}, 100);
										return;	
									};
									for( var idx in app.stubs.grouped){
										var cid = app.stubs.grouped[idx],
												view = app.stubs.views.elements[cid],
												groupDelete = true;
										view.delete( groupDelete );	
									}
									
									app.methods.clearActive(['disableGroupy', 'removeBubble'], 'include', 'menu trash');
									saveHistory('group delete');
								});									
							},
							
							pagesize:{
								init: function() {
									var popBubble = new app.menu.top.PopBubble( 
																									$('#pagesizeButton'),  
																									$('#pagesizeBubble'), function() {
																										app.methods.clearActive( ['previewOn', 'removeToast'], 'exclude', 'clicked on bubble');
																										return false;
																									}); 
									this.bind();
								},
								
								bind: function() {
									
									var that = this,
											somethingChanged = function() {
												app.stubs.recentlySaved = false;
												window.onbeforeunload = app.methods.confirmOnPageExit;
												saveHistory('changed pagesize1');
											};
									
									$('input:radio[name=page-size]').click(function(){
										
											$('input:radio[name=facebook]').prop('checked', false);
											$('input:radio[name=twitter]').prop('checked', false);
											$('input:radio[name=custom]').prop('checked', false);
											if( app.stubs.curPaperShape.pageSize == 'facebook' ||
												  app.stubs.curPaperShape.pageSize == 'twitter' ||
												  app.stubs.curPaperShape.pageSize == 'custom' 
											){
												$('input[name=page-orientation][value=portrait]').prop('checked', true);
												app.stubs.curPaperShape.layout = 'portrait';
											}
										
									    app.stubs.curPaperShape.pageSize = $(this).val();
									    app.methods.changeCanvasShape();
									    somethingChanged();
									    
									});

									$('input:radio[name=page-orientation]').click(function(){
											$('input:radio[name=facebook]').prop('checked', false);
											$('input:radio[name=twitter]').prop('checked', false);
											$('input:radio[name=custom]').prop('checked', false);
											if( app.stubs.curPaperShape.pageSize == 'facebook' ||
												  app.stubs.curPaperShape.pageSize == 'twitter'  ||
												  app.stubs.curPaperShape.pageSize == 'custom' 
											){
												$('input[name=page-size][value=letter]').prop('checked', true);
												app.stubs.curPaperShape.pageSize = 'letter';
											}
									    app.stubs.curPaperShape.layout = $(this).val();
									    app.methods.changeCanvasShape();
									    somethingChanged();
											
									});

									$('input:radio[name=facebook]').click(function(){
											app.stubs.curPaperShape.pageSize = 'facebook';
									    app.stubs.curPaperShape.layout = $(this).val();
									    $('input:radio[name=twitter]').prop('checked', false);
											$('input:radio[name=page-size]').prop('checked', false);
											$('input:radio[name=page-orientation]').prop('checked', false);
											$('input:radio[name=custom]').prop('checked', false);
									    app.methods.changeCanvasShape();
									    somethingChanged();
									});
									
									
									$('input:radio[name=twitter]').click(function(){
											app.stubs.curPaperShape.pageSize = 'twitter';
									    app.stubs.curPaperShape.layout = $(this).val();
									    $('input:radio[name=facebook]').prop('checked', false);
											$('input:radio[name=page-size]').prop('checked', false);
											$('input:radio[name=page-orientation]').prop('checked', false);
											$('input:radio[name=custom]').prop('checked', false);
									    app.methods.changeCanvasShape();
									    somethingChanged();
									});
									
									$('input:radio[name=custom]').click(function(){
											app.stubs.curPaperShape.pageSize = 'custom';
									    $('input:radio[name=facebook]').prop('checked', false);
											$('input:radio[name=page-size]').prop('checked', false);
											$('input:radio[name=page-orientation]').prop('checked', false);
											$('input:radio[name=twitter]').prop('checked', false);
									    app.methods.changeCanvasShape();
									    somethingChanged();
									});
							    
							    $('#custom-pagesize').click( function() {
							    	$(this).select();
							    }).unbind('keydown keypress').bind('keydown keypress', function(e){
								   if ( e.keyCode == 13 ) {
								     app.methods.changeCustomPageSize();
								     somethingChanged();
								     e.preventDefault();
								   }
							    });			
							    						
							    $('#custom-pagesize').unbind('change').bind('change', function() {
										app.methods.changeCustomPageSize();
										app.stubs.customPageSizeChanged = false;
										somethingChanged();
							    });	
							    
							    $('#custom-pagesize').unbind('focus').bind('focus', function() {
										app.stubs.customPageSizeChanged = true;
							    });	
							    							
									$('#custom-pagesize').click(function(){
										app.stubs.curPaperShape.pageSize = 'custom';
										$('input:radio[name=custom]').prop('checked', true);
								    $('input:radio[name=facebook]').prop('checked', false);
										$('input:radio[name=page-size]').prop('checked', false);
										$('input:radio[name=page-orientation]').prop('checked', false);
										$('input:radio[name=twitter]').prop('checked', false);										
									});
									
							    							
									$('#more-page-formats').click(function(){
										
										app.methods.modal.on( 'true' );	
										
										$('#modal-box').css('padding', '0px').width(1200).height(580);
										
										$('#modal-box').load('html/morepaper.html?version=' + version,
											function() {
												
												$('#morepaper .thumbcard').click(function(){

													var dim = $(this).attr('dim');
													$('#custom-pagesize').val(dim);
													
													app.stubs.curPaperShape.pageSize = 'custom';
													
													$('input:radio[name=custom]').prop('checked', true);	
													$('#custom-pagesize').val(dim);
											    $('input:radio[name=facebook]').prop('checked', false);
													$('input:radio[name=page-size]').prop('checked', false);
													$('input:radio[name=page-orientation]').prop('checked', false);
													$('input:radio[name=twitter]').prop('checked', false);		
													
													app.stubs.customPageSizeChanged = true;
													app.methods.modal.off('XXX');

												});
										});
									});				
									
								}							
								
							},
							
							alignGroupedElements: {
								
								init: function() {
									var popBubble = new app.menu.top.PopBubble( 
																									$('#alignGroupedElementsButton'),  
																									$('#alignGroupedElementsBubble'), function() {
																										return app.stubs.grouped.length < 2
																									}); 
									this.bind();
								},
								
								bind: function() {
									
									var that = this;
									
									$('#alignGroupedElementsBubble').on('click', 'img', function() {
										
										that.how.setVar();

										var how = $(this).attr('how');
										
										that.how[how]();
										
										var disableMoreThanOneRule = true;
										app.methods.groupyBox.init(0, disableMoreThanOneRule);
										
										saveHistory('align elements');
										
										return false;

									});										
								},
								
								how: {
									
									setVar: function() {
										
										this.elements = app.stubs.collections.elements;
										this.grouped = app.stubs.grouped.slice();
										this.groupyDistribute = [];
										this.numGrouped = this.grouped.length;
										this.groupLeft = app.methods.groupyBox.left;
										this.groupRight = app.methods.groupyBox.right;
										this.groupTop = app.methods.groupyBox.top;
										this.groupBottom = app.methods.groupyBox.bottom;
										this.widthGrouped = this.groupRight - this.groupLeft;
										this.heightGrouped = this.groupBottom - this.groupTop;
										this.centerUpDownGrouped = this.groupTop + ( this.heightGrouped / 2);
										this.centerLeftRightGrouped = this.groupLeft + ( this.widthGrouped / 2);
										
										this.totalWidthElementsInGroup = 0;
										this.totalHeightElementsInGroup = 0;
										
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													json = this.elements.get(cid).get('json'),
													elementWidth = parseFloat(json.style.element.width),
													elementHeight = parseFloat(json.style.element.height);
											this.totalWidthElementsInGroup += elementWidth;
											this.totalHeightElementsInGroup += elementHeight;
											
											this.groupyDistribute.push({
												id: cid,
												left: parseFloat(json.style.element.left),
												top: parseFloat(json.style.element.top)
											});
											
										}
		
									},
									
									resetGroupBox: function() {
										
										app.methods.groupyBox.getEdges(app.stubs.grouped);
	
										app.methods.groupyBox.render();
										
									},
									
									allAsWide: function() {
										
										var that = this,
												widthArray = [],
												skip = ['dynolines'];
												
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													json = this.elements.get(cid).get('json'),
													elementWidth = parseFloat(json.style.element.width);
											if( tools.inArray(json.collection, skip)) continue;
											widthArray.push(elementWidth);
										}
										
										var widest = Math.min.apply(Math, widthArray);

										for( var idx in this.grouped){
											
											var cid = this.grouped[idx],
													view = app.stubs.views.elements[cid],
													collection = view.collection,
													json = view.model.get('json'),
													width = parseFloat(json.style.element.width),
													height = parseFloat(json.style.element.height),
													percent = widest/width;
										
											if( tools.inArray(collection, skip)) continue;
										
											var newWidth = widest;		
											var newHeight =  height * percent;
											
											json.style.element.width = newWidth + 'px';
											json.style.element.height = newHeight  + 'px';
											
											//if( typeof( view.preRender ) != 'undefined' ) view.preRender();
											
											view.$el.width(newWidth * app.stubs.zoom.scale );
											view.$el.find('.resize-wrapper').width(newWidth * scale );
											view.$el.height(newHeight * app.stubs.zoom.scale );
											view.$el.find('.resize-wrapper').height(newHeight * scale );
											
											view.resizeWrapperWidth = newWidth * scale;
											view.resizeWrapperHeight = newHeight * scale;
											
											// working all same width
											if( tools.inArray( view.collection, app.settings.hasSvgshapes)) {
												var obj = {
													width: newWidth * app.stubs.zoom.scale  + 'px',
													height: newHeight * app.stubs.zoom.scale  + 'px'
												};
												
												view.$svgshape.css(obj);
												view.model.get('json').style.svgshape.width = newWidth + 'px';
												view.model.get('json').style.svgshape.height = newHeight + 'px'
											}
											
											if( typeof( view.model.get('json').style.textedit ) != 'undefined'){											
												view.model.get('json').style.textedit['font-size'] = parseFloat( view.model.get('json').style.textedit['font-size'] ) * percent + 'px';
												view.$el.find('.textedit').css('font-size',  parseFloat( view.model.get('json').style.textedit['font-size'] ) * scale  + 'px')
												if( tools.inArray( view.collection, ['headers'])) view.model.get('json').data.needFreshPNG = true;
												if( view.collection == 'richtext' ) view.renderPngFromTextedit('allAsWide: ' + view.model.get('json').data.text, undefined, true);
											}
										}
										
										app.methods.unloadToDoQueue();
										this.alignLeftRightCenter();
										this.setVar();
										this.resetGroupBox();
										this.setVar();
										this.distributeVertically();
										
									},
									
									allAsLong: function() {
										
										var that = this,
												heightArray = [],
												skipTheseCollectionsArray = ['dynolines', 'paragraphs', 'richtext'];
												
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													json = this.elements.get(cid).get('json'),
													elementHeight = parseFloat(json.style.element.height);
											if( tools.inArray(json.collection, skipTheseCollectionsArray)) continue;
											heightArray.push(elementHeight);
										}
										
										var longest = Math.min.apply(Math, heightArray);

										for( var idx in this.grouped){
											
											var cid = this.grouped[idx],
													view = app.stubs.views.elements[cid],
													collection = view.collection,
													json = view.model.get('json'),
													width = parseFloat(json.style.element.width),
													height = parseFloat(json.style.element.height),
													percent = longest/height;
													
											if( tools.inArray(collection, skipTheseCollectionsArray)) continue;
										
											var newWidth = width * percent;		
											var newHeight = longest;
											
											json.style.element.width = newWidth + 'px';
											json.style.element.height = newHeight + 'px';
											
											view.$el.width(newWidth * app.stubs.zoom.scale );
											view.$el.find('.resize-wrapper').width(newWidth * app.stubs.zoom.scale );
											view.$el.height(newHeight * app.stubs.zoom.scale );
											view.$el.find('.resize-wrapper').height(newHeight * app.stubs.zoom.scale );
											
											
											// working all same height
											if( tools.inArray( view.collection, app.settings.hasSvgshapes)) {
												var obj = {
													width: newWidth * app.stubs.zoom.scale  + 'px',
													height: newHeight * app.stubs.zoom.scale  + 'px'
												};
												
												view.$svgshape.css(obj);
												view.model.get('json').style.svgshape.width = newWidth + 'px';
												view.model.get('json').style.svgshape.height = newHeight + 'px'
											}
											
											if( typeof( view.model.get('json').style.textedit ) != 'undefined'){
												view.model.get('json').style.textedit['font-size'] = parseFloat( view.model.get('json').style.textedit['font-size'] ) * percent + 'px';
												view.$el.find('.textedit').css('font-size',  parseFloat( view.model.get('json').style.textedit['font-size'] ) * scale  + 'px');
												if( tools.inArray( view.collection, ['headers'])) view.model.get('json').data.needFreshPNG = true;
												if( view.collection == 'richtext' ) view.renderPngFromTextedit('allAsLong: ' + view.model.get('json').data.text, undefined, true);
											}
											
										}
										
										app.methods.unloadToDoQueue();
										this.alignTopBottomCenter();
										this.setVar();
										this.resetGroupBox();
										this.setVar();
										this.distributeHorizontally();
										
									},
									
									alignLeft: function() {
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json');
													
											json.style.element.left = this.groupLeft * multiple + 'px';
											
											$selector.css({
												left: this.groupLeft + 'px'
											});
											
											$selector.data('offSetLeft', $selector.offset().left);
											
										}
									},
									
									alignLeftRightCenter: function() {
										
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json'),
													width = parseFloat(json.style.element.width);
													
											json.style.element.left = this.centerLeftRightGrouped  * multiple  - width / 2 + 'px';
											
											
											$selector.css({
												left: this.centerLeftRightGrouped  - (width  * app.stubs.zoom.scale) / 2 + 'px'
											});
											
											$selector.data('offSetLeft', $selector.offset().left);
											
										}								
										
										
										return;
										
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json'),
													width = parseFloat(json.style.element.width) * app.stubs.zoom.scale,
													halfWidth = width / 2,
													newLeft = this.centerLeftRightGrouped - halfWidth ;
													
											json.style.element.left = newLeft + 'px';
											
											
											$selector.css({
												left: newLeft + 'px'
											});
											
											$selector.data('offSetLeft', $selector.offset().left);
											
										}
										
										
										
									},
									
									alignTopBottomCenter: function() {
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json'),
													height = parseFloat(json.style.element.height) * app.stubs.zoom.scale,
													halfHeight = height / 2,
													newTop = this.centerUpDownGrouped - halfHeight;
													
											json.style.element.top = newTop * multiple + 'px';
											
											$selector.css({
												top: newTop + 'px'
											});
											
											$selector.data('offSetLeft', $selector.offset().left  + app.stubs.mainScrolledRight);									
											$selector.data('offSetTop',	$selector.offset().top  + app.stubs.mainScrolledDown);
											
										}
										
									},
									
									centerCenter: function() {
										this.alignLeftRightCenter();
										this.alignTopBottomCenter();
									},
									
									alignRight: function() {
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json'),
													width = parseFloat(json.style.element.width);
													
													console.log('width: ' + width);
													
											json.style.element.left = this.groupRight * multiple - width + 'px';
											
											
											$selector.css({
												left: this.groupRight - width * app.stubs.zoom.scale + 'px'
											});
											
											$selector.data('offSetLeft', $selector.offset().left);
											
										}
									},
									
									alignTop: function() {
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json');
													
											json.style.element.top = this.groupTop * multiple + 'px';
											
											
											$selector.css({
												top: this.groupTop + 'px'
											});
											
											$selector.data('offSetLeft', $selector.offset().left  + app.stubs.mainScrolledRight);									
											$selector.data('offSetTop',	$selector.offset().top  + app.stubs.mainScrolledDown);
		
											
										}
									},
									
									alignBottom: function() {
										for( var idx in this.grouped){
											var cid = this.grouped[idx],
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json'),
													newTop = this.groupBottom - (parseFloat(json.style.element.height)) * app.stubs.zoom.scale;
													
											json.style.element.top = newTop * multiple + 'px';
											
											$selector.css({
												top: newTop + 'px'
											});
											
											$selector.data('offSetLeft', $selector.offset().left  + app.stubs.mainScrolledRight);
											$selector.data('offSetTop',	$selector.offset().top  + app.stubs.mainScrolledDown);
											
										}
									},
									
									distributeHorizontally: function() {
										
										this.groupyDistribute.sort(function(obj1, obj2) {
											return obj1.left - obj2.left;
										});
										
										var whitespaces = this.widthGrouped * multiple - this.totalWidthElementsInGroup,
												whitespace = whitespaces / (this.numGrouped - 1);
		
										for( var idx in this.groupyDistribute){
											var cid = this.groupyDistribute[idx].id,
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json');
													
											if(idx != 0 && idx != this.numGrouped - 1){
												
												var prev_id = this.groupyDistribute[idx-1].id,
														prev_json = this.elements.get(prev_id).get('json'),
														previousWidth = prev_json.style.element.width,
														previousLeft = prev_json.style.element.left,
														newLeft = parseFloat(previousLeft) + parseFloat(previousWidth) + whitespace;
														
												json.style.element.left = newLeft + 'px';
												
												$selector.css({
													left: newLeft * app.stubs.zoom.scale + 'px'
												});
												
												$selector.data('offSetLeft', $selector.offset().left + app.stubs.mainScrolledRight);
											}  
											
										}
										
									},
									
									distributeVertically: function() {
										
										this.groupyDistribute.sort(function(obj1, obj2) {
											return obj1.top - obj2.top;
										});
										
										var whitespaces = this.heightGrouped * multiple - this.totalHeightElementsInGroup,
												whitespace = whitespaces / (this.numGrouped - 1);
												
										for( var idx in this.grouped){
											var cid = this.groupyDistribute[idx].id,
													$selector = $('#' + cid),
													model = this.elements.get(cid),
													json = model.get('json');
													
											if(idx != 0 && idx != this.numGrouped - 1){
												
												var prev_id = this.groupyDistribute[idx-1].id,
														prev_json = this.elements.get(prev_id).get('json'),
														previousHeight = prev_json.style.element.height,
														previousTop = prev_json.style.element.top,
														newTop = parseFloat(previousTop) + parseFloat(previousHeight) + whitespace;
														
												json.style.element.top = newTop + 'px';
												
												
												$selector.css({
													top: newTop * app.stubs.zoom.scale + 'px'
												});
												
												$selector.data('offSetLeft', $selector.offset().left  + app.stubs.mainScrolledRight);
												$selector.data('offSetTop',	$selector.offset().top  + app.stubs.mainScrolledDown);
											}  
											
										}
									}
									
								}
								
							},
														
							clone: function() {
								$('#cloneButton').on('click', function() {
									
									var that = this;
									
/*									$(this).removeClass('animated shake');
									if( app.stubs.grouped.length == 0 ){
										setTimeout(function(){
											$(that).addClass('animated shake');
										}, 100);
										return;	
									};
*/
									
									app.stubs.cloned = [];
									app.stubs.saveHistoryEnabled = false;
									for( var idx in app.stubs.grouped){
										var cid = app.stubs.grouped[idx],
												model = app.stubs.collections.elements.get(cid);
										app.methods.clone(model, 'group');
									}
									app.stubs.saveHistoryEnabled = true;
									app.methods.revert.saveHistory('clone group');
									app.stubs.grouped = app.stubs.cloned.slice();
									app.methods.groupyBox.init(0);
									
									app.methods.clearActive(['removeBubble'], 'include', 'menu clone');
								});									
							},
															
							lock_depreciated: function() {
								$('#lockButton').on('click', function() {
									app.methods.tagIcons();
								});										
							},
							
							lock2:{
								init: function() {
									var that = this,
											popBubble = new app.menu.top.PopBubble( 
																									$('#lock2Button'),  
																									$('#lock2Bubble'), 
																									function() {
																										
																										$('#locked-group-container').empty();
																										
																										var reorderGroupedByZindex = function() {
																											var zObj = {};
																											for( var idx in app.stubs.locked){
																												var cid = app.stubs.locked[idx],
																														model = app.stubs.collections.elements.get(cid);
																												zObj[model.get('json').style.element['z-index']] = cid;
																											}
																											var sortedCidsObj = tools.sortObject(zObj);
																											app.stubs.locked = [];
																											for( var key in sortedCidsObj){
																												app.stubs.locked.push(sortedCidsObj[key]);
																											}
																										};
																										
																										reorderGroupedByZindex();

																										for( var idx in app.stubs.locked){
																											var cid = app.stubs.locked[idx],
																													model = app.stubs.collections.elements.get(cid);
																											editbox.methods.lock.cloneElementToLockedContainer( model );
																										}
																										app.methods.clearActive( ['previewOn'], 'exclude' , 'clicked on lock2');
																										return app.stubs.locked.length == 0;
																									},
																									undefined, 
																									'Nothing on the canvas is locked.'
																									); 
								}					
							},
							
							printPop:{
								init: function() {
									
									$('#printButton').on('click', function() {

										
									});	
									
									return;
									var that = this,
											popBubble = new app.menu.top.PopBubble( 
																									$('#print2Button'),  
																									$('#print2Bubble'), 
																									function() {
																										app.methods.clearActive( undefined, undefined , 'clicked on print2');
																										return app.stubs.collections.elements.length == 0  || app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements();
																									},
																									undefined, 
																									'There is nothing on the canvas to print.'
																									); 
								}
							},
							
							openFromDesktop: function() {
								$('#openFromDesktop').on('click', function() {
									$('#uploadFile').click();
								});
							},

							saveToDesktop: function() { // HERE
								
								$('#saveToDesktop').on('click', function() {
									app.methods.saveToDeskop();
								});
											
							},
							
							saveAsNew: function() {
								
								$('#saveAsNew').on('click', function() {

									if( app.stubs.saving ){
										toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
										return;
									}

									if( app.stubs.offline ){
										toast('Can not save.  Your internet connection is offline.');
										return;
									}

									app.stubs.savingWhat = 'Saving';
									app.stubs.saving = true;

									if( app.stubs.collections.elements.length == 0  ||
												app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()){
										app.methods.shakeNo($(this));
										toast('There is nothing on the canvas to save.', 'keep', 5000, 'info', 'Really?');
										return;	
									};
									
									app.methods.clearActive( undefined, undefined, 'justSave');

									app.methods.progressBar.start();
									app.data.export.reset();
									app.data.export.gather();
									
					
									tools.doWhenReady( function() {
										console.log('18997 waiting... ');
										return !app.stubs.renderingPNGforHeaders
									}, function() {
										
											if (app.stubs.saveIsInterrupted ) { // save as new
												app.stubs.saveIsInterrupted = false;
												return;
											}
											
											app.methods.serverprocessing = true;
											toast('Processing on Server.', 'wait for server');
										
											var url = 'more/save',
													obj = {
														data: app.stubs.data,
														google_id: app.stubs.google_id,
														width: app.stubs.curCanvasSize.width,
														height: app.stubs.curCanvasSize.height,
														fileId: app.stubs.fileId,
														copy: true
													};
															
											tools.ajax(url, obj, 'post', function( data ) {
												app.stubs.saving = false;
												app.methods.serverprocessing = false;
												
												if( data.status == 'problem' ){
													toast( data.message, 'keep', false, 'error', 'Unsuccesful.');
													app.methods.progressBar.stop('Your file size is not yet supported');
													return;
												};
												
												window.onbeforeunload = app.methods.cleanUpOnExit		
												window.newSerial = 'false';
												tools.cookies.setCookie('newSerial',  window.newSerial); 
												window.fileId = data.fileId;
												tools.cookies.setCookie('active_id', data.fileId, tools.cookies.expires);
												tools.cookies.setCookie('launch_id', data.fileId, tools.cookies.expires);
	
												var url = 'app?state=%7B"ids":%5B"' + data.fileId + '"%5D,"action":"open","userId":"' + app.stubs.google_id + '"%7D';
												window.location.assign(url);
	
												
											});
											
									},'save as new');

								});
											
							},
							
							delete: function() {
								
								$('#fileDelete').on('click', function() {
									
							    var proceed;
							    if (confirm("Are you sure you want to remove this file from Drive") == true) {
							        proceed = true;
							    } else {
							        proceed = false;
							    }
							    
							    if( proceed ){
							    	
										if( app.stubs.saving ){
											toast(app.stubs.savingWhat + ' in process. Please wait.');
											return;
										}
										
										app.stubs.saving = true;
										app.stubs.savingWhat = 'Delete';
										app.methods.clearActive( undefined, undefined, 'delete');
												
										app.methods.progressBar.start();
							
										var url = 'app/trashDriveFile',
												obj = {
													google_id: app.stubs.google_id,
													fileId: app.stubs.fileId
												};
												
										tools.ajax(url, obj, 'post', function( data ) {
											app.methods.progressBar.stop('file delete');
											app.stubs.saving = false;
											toast('File has been removed from Drive.');
										});	
							    		
							    }
									
											
								});

											
							},
							
							print: function() {
	
								$('#print2Button, #filePrint').on('click', function() {

									if( app.stubs.saving ){
										toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
										return;
									}

									if( app.stubs.offline ){
										toast('Can not render PDF.  Your internet connection is offline.');
										return;
									}
									
									app.stubs.savingWhat = 'Generating PDF';
									app.stubs.saving = true;

									if( app.stubs.collections.elements.length == 0  ||
												app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()){
										app.methods.shakeNo($(this));
										toast('There is nothing on the canvas to print.', 'keep', 5000, 'info', 'Really?');
										return;	
									};
									
									app.methods.clearActive( ['previewOn'], 'exclude', 'justPrint');

									tools.elasped.start();
									
									app.methods.progressBar.start();
									app.data.export.reset();
									app.data.export.gather();
									
									/*  // EDIT
									
										if( typeof( app.stubs.data.elements ) != 'undefined' ){   console.log('No elements: ' + app.stubs.data.elements.length);   }
										
										if( typeof( app.stubs.data.elements ) == 'undefined' ){
											toast('There is nothing on the canvas to render.', 'keep', 5000, 'info', 'Really?');
											return;	
										};
									
									*/
					
									tools.doWhenReady( function() {
										console.log('19137 waiting... ');
										return !app.stubs.renderingPNGforHeaders
									}, function() {
										
											if (app.stubs.saveIsInterrupted ) {  // render PDF
												app.stubs.saveIsInterrupted = false;
												return;
											}
										
											var obj = {
														data: app.stubs.data,
														width: app.stubs.curCanvasSize.width,
														height: app.stubs.curCanvasSize.height,
														google_id: app.stubs.google_id,
														fileId: 'false'
													};
											
											console.log('ABOUT TO RENDER PDF');
											
											app.methods.serverprocessing = true;
											toast('Processing on Server.', 'wait for server');
											
											tools.ajax('more/renderPDF', obj, 'post', function( data ) {	
												
												// console.log(JSON.stringify(  data , null, 2 ));
												app.stubs.saving = false;
												app.methods.serverprocessing = false;
												
														
												if( data.status == 'problem' ){
													toast( data.message, 'keep', false, 'error', 'Unsuccesful.');
													app.methods.progressBar.stop('Your file size is not yet supported');
													return;
												};
												
												
												if( data.status == 'error'  ||
														data.readyState == 4) {
													toast('An error has occured.  Please contact support', 'keep', 5000, 'error', 'Something went wrong.');
													app.methods.progressBar.stop('save PDF error');
													return;
												}
												
												var PDFId = data.PDFId;
												
												var url = 'https://pictographr.com/app/streamPDF?google_id=' + app.stubs.google_id + '&fileId=' + data.PDFId;
												
												if(typeof( Windows) != 'undefined') {  // UWP version
														
													var uri = new Windows.Foundation.Uri(url);

													var options = new Windows.System.LauncherOptions();
													options.treatAsUntrusted = false;
													
													Windows.System.Launcher.launchUriAsync(uri, options).then(
													   function (success) {
													      if (success) {
																		    
													      } else {
																		    
													      }
													   });
																		
													
												} else{
													
													tools.download(url, app.stubs.fileTitle + '.pdf');
														
												}
															
												tools.elasped.stop();
												toast('PDF rendered in ' + tools.elasped.get() + ' secs' + '.  A PDF of this file is also stored in Google Drive.', 'keep', false, 'success', 'Rendered.', 'reset');
												app.methods.progressBar.stop('render pdf', 'clearPrevious');
												
											});
									},'save');


								});	
								
								
								/* -------------------------------------------------------------- */

								var doPrint = function() {

										app.stubs.savingWhat = 'Printing';
										app.methods.clearActive( undefined, undefined, 'menu save');
										app.data.export.reset();
										app.data.export.gather();
										
										app.data.export.save(function(data) {
											
											delete data.base64;
											
											console.log(JSON.stringify( data    , null, 2 ));
											
											app.stubs.recentlySaved = true;
											window.onbeforeunload = app.methods.cleanUpOnExit
											app.stubs.saving = false;
											
											app.stubs.PDFId = data.PDFId;
											
											var url = 'app/streamPDF?google_id=' + app.stubs.google_id + '&fileId=' + data.PDFId;
											
											tools.download(url, 'pictographr.pdf');

											
										}, 'print');	
								};
											

								$('#save4template').on('click', function() {

									tools.elasped.start();
									app.data.export.reset();
									app.data.export.gather();
									app.methods.progressBar.start();

									tools.doWhenReady( function() {
										console.log('19250 waiting... ');
										return !app.stubs.renderingPNGforHeaders
									}, function() {

										var obj = {
											data: app.stubs.data,
											google_id: app.stubs.google_id,
											set_id: 9999,
											fileId: 'false'
										}
												
										obj['width'] = app.stubs.curCanvasSize.width;
										obj['height'] = app.stubs.curCanvasSize.height;
										
										console.log('ABOUT TO SAVE TEMPLATE');
																	
										tools.ajax( 'more/saveTemplate', obj, 'post', function( data ) {
											
											console.log(JSON.stringify( data    , null, 2 ));

											tools.elasped.stop();
											toast('Template rendered in ' + tools.elasped.get() + ' secs', 'keep', 5000, 'error', 'Something went wrong.');
											app.methods.progressBar.stop('save 4 templae');				
											
										});
										
									},'save');



									return;

	
									if( app.stubs.collections.elements.length == 0  ||
												app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()){
										app.methods.shakeNo($(this));
										toast('There is nothing on the canvas to print.', 'keep', 5000, 'info', 'Really?');
										return;	
									};
									
									if( app.stubs.saving ){
										toast(app.stubs.savingWhat + ' in process.  Please wait.', 'saving');
										return;
									}
									
									console.log(app.stubs.recentlySaved);
									console.log(typeof( app.stubs.PDFId ));
									
									if( app.stubs.recentlySaved && 
											typeof( app.stubs.PDFId ) != 'undefined'){


											var url = 'index.php/app/doesDriveFileIdExist',
													obj = {
															google_id: app.stubs.google_id,
															fileId: app.stubs.PDFId
														};
														
											tools.ajax(url, obj, 'post', function( data ) {
													if( data.itDoesExist == 'true'){
														console.log('found an old pdf copy!');
														var url = 'app/streamPDF?google_id=' + app.stubs.google_id + '&fileId=' + app.stubs.PDFId;
														tools.download(url, 'pictographr.pdf');	
													} else {
														console.log(' pdf was destroped.  Rendering it again on the server.');
														doPrint();	
														
													}
											});



										 
									} else{
										
										console.log('printing directly');
										doPrint();
									
									}
									
									return false;
								
								});
										
/*				
var pdf = 'app/streamPDF?google_id=' + app.stubs.google_id + '&fileId=' + print.PDFId,
		url = 'js/lib/pdf/web/viewer.html?name='+ pdf,
		left = undefined,
		top = 90;

tools.popupwindow(url, "_blank", tools.getScreenDim().width - 300, tools.getScreenDim().height - 70, left, top);

var pdf = 'pdf_' + app.stubs.google_id + '.pdf',
		url = 'js/lib/pdf/web/viewer.html?name=../../../../uploads/output/'+ pdf,
													
pdf = 'pdf_' + app.stubs.google_id + '.pdf',
url = 'uploads/output/'+ pdf
tools.download(url, 'pictographr.pdf');

console.log(print);

app.stubs.print = print;
app.methods.print();

*/
		
								$('#fbAsPng').on('click', function() {
								
								
								
								});
																	
							},	
													
							slideLeft: function() {
								
								$('#left-menu-button').on('click', function() {
									
									$('.sub-card.active').click();
									$('.sub-card-container.active').click();
									
									$('#left-menu').toggleClass('slide-left');
									if($('#left-menu').hasClass('slide-left')){
										app.stubs.leftMenuHidden = true;
										$('#canvas-wrapper').css('padding-left', '150px');
									} else {
										app.stubs.leftMenuHidden = false;
										$('#canvas-wrapper').css('padding-left', '330px' )
									}
								});
							},
							
							colorCanvas: function() {
								$('#colorCanvasButton').on('click', function() {
									$('#my-modal').modal('show');
								});
							},
							
							undo: function() {
								
								$('#undoButton, #undoLink').on('click', function() {
									
									app.methods.revert.redraw('undo');
									
									return false;
									
								});
							},
							
							selectAll: function() {
								
								$('#selectAll').on('click', function() {
									
					    		app.methods.clearActive(['previewOn'], 'exclude', 'main click 1');
					    		var exceptLocked = true;
					        app.methods.groupAllElements( exceptLocked );
									if ( document.selection ) {
										document.selection.empty();
									} else if ( window.getSelection ) {
										window.getSelection().removeAllRanges();
									}
									return false;
									
								});
								

							},
							
							redo: function() {
								
								$('#redoButton, #redoLink').on('click', function() {
									
									app.methods.revert.redraw('redo');
									
									return false;
									
								});
							},
							
							fileTitle: function() {
									 		
									$('#fileTitleLabel').on('click', function() {

										app.stubs.recentlySaved = false;
										window.onbeforeunload = app.methods.confirmOnPageExit;
										$(this).hide();
										$('#fileTitleInput').show().select();

										
									});
									
							},
							
							seeBase: function() {
								
								$('#htmlButton').on('click', function() {

										app.stubs.previewIsOn = true;
										$('.tooltip').removeClass('show').addClass('disable');
										$('[data-toggle="tooltip"]').tooltip('disable');

										$('#nav-top').css({
											'top':	'-62px'
										});
										$('#main').css({
											'top':	'0px'
										}).addClass('preview');
										$('#canvas').css('overflow', 'hidden');
										$('#canvas-wrapper, body').css('cursor', 'pointer');
										
										
										$('.sub-card.active').click();
										$('.sub-card-container.active').click();
										
										$('#left-menu').addClass('slide-left');
										$('#canvas-wrapper').css('padding-left', '150px');
									
										toast('ESC key will end preview');
										
										//$('.ontop').find('.ui-resizable-handle, .custom-handle').hide();
										
										app.methods.clearActive( ['previewOn', 'removeSnack'], 'exclude' , 'see baseclick');	
										$('body').click( function() {
											app.methods.clearActive(undefined, undefined, 'body');
										})	
										
										
																			
									return false;


									
									return;									
									var left = undefined,
											top = 90;
									
									tools.popupwindow(url, "_blank", tools.getScreenDim().width - 300, tools.getScreenDim().height - 70, left, top);


									html2canvas(document.getElementById('logo'), {
										onrendered: function(image) {
											
											$('#bar').append('\
												<img src=" + image + ">\
											');
										}
									});
									
									
									

								});										
							},
							
							grid: function() {
								
								var count = 0,
										doNow = {
											0: function() {

												$('#panel_0').removeClass('addgrid');
												$('.resize-wrapper').removeClass('reveal');
												$('.vertical-guide, .horizontal-guide').hide();
												app.stubs.hasGrid = false;
												app.stubs.resizeGuide = false;
											},/*
											1: function() {	
												app.stubs.hasGrid = true;
												$('#panel_0').addClass('addgrid');
												$('.resize-wrapper').addClass('reveal');
												$('.vertical-guide, .horizontal-guide').show();
												app.stubs.resizeGuide = true;
											},
											2: function() {
												$('#panel_0').removeClass('addgrid');
												app.stubs.hasGrid = true;
												app.stubs.resizeGuide = true;
											},
											3: function() {*/
											1: function() {
												
												app.settings.gridSpacing = 900;
												$('#panel_0').css('background-size', app.stubs.adaptedPercentage * scale * app.settings.gridSpacing + 'px');
												app.stubs.hasGrid = true;
												$('#panel_0').addClass('addgrid');
												$('.resize-wrapper').removeClass('reveal');
												$('.vertical-guide, .horizontal-guide').hide();
												app.stubs.hasGrid = true;
												app.stubs.resizeGuide = false;
												
											},
											2: function() {
												app.settings.gridSpacing = 600;
												$('#panel_0').css('background-size', app.stubs.adaptedPercentage * scale * app.settings.gridSpacing + 'px');
												
											},
											3: function() {
												app.settings.gridSpacing = 300;
												$('#panel_0').css('background-size', app.stubs.adaptedPercentage * scale * app.settings.gridSpacing + 'px');

											},
											4: function() {
												app.settings.gridSpacing = 200;
												$('#panel_0').css('background-size', app.stubs.adaptedPercentage * scale * app.settings.gridSpacing + 'px');
											},
											5: function() {
												app.settings.gridSpacing = 100;
												$('#panel_0').css('background-size', app.stubs.adaptedPercentage * scale * app.settings.gridSpacing + 'px');
												count = -1;
											},											
											
										};
								
								$('#gridButton').click(function() {
										$('#align-guide-vertical').css('left', app.settings.gridSpacing * scale + 'px' );
										$('#align-guide-horizontal').css('top', app.settings.gridSpacing * scale + 'px' );
										count++;
										doNow[count]();
										return false;
								});
								
								
								return;
								$('#gridButton').on('click', function() {
									
									$('#modal-screen').show();
									$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').addClass('make-blur');	
									
									return;
									$('#load-screen').show();
									$('#main, #left-menu, .navbar, #resize-zoomback, #resize-larger, #resize-smaller, #edit-box').addClass('make-blur');
									
									
								});										
							},
							
							logout: function() {
								
								$('#logout').click( function() {
									
//										$('#logout_iframe').attr('src', 'https://pictographr.com/auth/destroySessionP').load(function () {
//											$('#logout_iframe').attr('src', 'https://accounts.google.com/Logout').unbind('load').load(function () {
//												window.location.assign('https://pictographr.com/app/start');
//											});					
//										});
//											
//									 return;
									
								   if(typeof( Windows) != 'undefined') {  // UWP version
								   	
											$('#logout_iframe').attr('src', 'https://accounts.google.com/Logout').load(function () {
												$('#logout_iframe').attr('src', 'https://pictographr.com/auth/destroySessionP').unbind('load').load(function () {
													window.location.assign('https://pictographr.com/app/start');
												});					
											});
								     
								   } else{
									
											tools.cookies.deleteCookie('active_id');
											tools.cookies.deleteCookie('launch_id');
		
											window.location.assign( 
												( 
													typeof( tools.cookies.getCookie('market_name'))!= 'undefined' && 
													tools.cookies.getCookie('market_id') != 1 ? 
													"/" + tools.cookies.getCookie('market_name') : 
													'' 
												) + "?out=true"
											);
								   	 
								   }

									
									return false;
								});		
												
							},														
							
						},						
						init: function() {

							this.bind.melink();
							this.bind.showMe();
							this.bind.contactUs();
							this.bind.faq();
							this.bind.preferences();
							this.bind.slideLeft();
							this.bind.colorCanvas();
							//this.bind.trash();
							this.bind.clear();
							this.bind.clone();
							this.bind.open();
							this.bind.saveAsTemplate();
							this.bind.account();
							this.bind.education();
							this.bind.openNew();
							this.bind.openOld();
							this.bind.openTemplates();
							this.bind.save();
							if(isSocial ) this.bind.share.init();
							this.bind.undo();
							this.bind.redo();
							this.bind.selectAll();
							this.bind.alignGroupedElements.init();	
							this.bind.pagesize.init();	
							//this.bind.lock();			
							this.bind.lock2.init();			
							//this.bind.print.init();			
							this.bind.print();			
							this.bind.saveAsNew();			
							this.bind.saveToDesktop();			
							this.bind.openFromDesktop();			
							this.bind.delete();			
							this.bind.seeBase();			
							this.bind.welcome();			
							this.bind.fileTitle();			
							this.bind.seeImg();			
							this.bind.downloadImageByUrl();			
							this.bind.grid();			
							this.bind.logout();		
							
							
								
						},
						PopBubble: function( $button, $bubble, disableLaunch, callback, snackMessage) {
							
							if(typeof( $button.offset() ) == 'undefined') return;

							
							this.bind = function() {
									var that = this;
									$button.click(
										function() {
											
											app.methods.clearActive(['removeBubble', 'disableGroupy', 'emptyGrouped', 'removeSpot', 'previewOn', 'removeToast'], 'exclude', 'clicked on bubble');
											if( disableLaunch() ){
												
												app.methods.shakeNo($(this));
												
												if( typeof( snackMessage ) != 'undefined') {
													toast(snackMessage);
													return;
												}
												
												if( app.stubs.collections.elements.length == 0  ||
												app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()){
													toast('There is nothing on the canvas to align.', 'keep', 5000, 'info', 'Really?');
													return;	
												};
												
												toast('Please select two or more elements on the canvas to align.');
												return;	
											};
											
											$('.bubble').not($bubble).removeClass('visible');
											
											if($bubble.hasClass('visible')){
												that.close();
											} else{
												that.open();
												$('.tooltip').removeClass('show').addClass('disable');
												
												if( typeof( $('[data-toggle="tooltip"]').tooltip ) != 'undefined' )  {
													$('[data-toggle="tooltip"]').tooltip('disable');
												}
												
												if(typeof( callback) != 'undefined') callback();
											}
											
											$bubble.on( 'click', '.closeTHIS', function() {
												$bubble.removeClass('visible');
											});
											
											return false;
											
										}
									);
							};
							this.open = function() {
								
								$bubble.addClass('visible');

								var buffer = 13;
								$bubble.css('left', (-1 * parseFloat($bubble.css('width'))/ 2 + parseFloat($button.css('width'))/ 2) + buffer + 'px');
								
							};
							this.close = function() {
								$bubble.removeClass('visible');
							}
							this.bind();
						}
					},					
					left:{
						
						init: function() {
							this.getData.init();
							this.build.cards.init();
							this.build.subcards();
							this.build.maxcard.init();
							this.click();
						},
						
						getData: {
							
							init: function() {	
								//this.fontwidths();
								this.pixabayTagsFromLocalStorage();
								this.getMiscCollection();
								this.other('icons');
								this.other('backgrounds');
								this.other('borders');
								this.other('banners');
								this.other('arrows');
								this.other('speech');
								
								tools.ajax(	'json/svgshapes/svgmap.json', {}, 'get', function( jsonObj ) {
									app.stubs.svgmap = jsonObj;
								});  // working svgmap
								
								for( var idx in app.settings.hasSvgshapes){ // working get data
									var svgshape = 	app.settings.hasSvgshapes[idx];
									this.other(svgshape);
								}

							},
							
							pixabayTagsFromLocalStorage: function() {
//								window.localStorage.clear();
							
								var collectionTagsArray = ['clipart', 'photos', 'vectors', 'illustrations'];
							
								for( var idx in collectionTagsArray){
									var collection = collectionTagsArray[idx];
									
									var tagsCollection = app.stubs.tags.graphics[collection]= new collections.tags[tools.capitaliseFirstLetter(collection)];
									tagsCollection.fetch();
									
									var tagModel = new models.TagModel();
									tagsCollection.sort();
									
								}
							},
							
							other: function(collection) {
								
									var thisCollection = app.stubs.collections.graphics[collection] = new collections.GraphicsCollection(),
											theseTags = app.stubs.tags.graphics[collection] = {};
									
									var that = this,
											url = 'json/' + collection + '/' + collection + '.json?version=' + Math.random();
											
									if( tools.inArray( collection, app.settings.hasSvgshapes ) ) {  // working getdata
										url = 'json/svgshapes/' + collection + '.json?version=' + version;
									}
									
									var arrDataObj = {},
											type='get',
											callback = function( jsonObj ) {
												
												switch( collection ){
													
												  case 'icons': {
													
														jsonObj = $.parseJSON(jsonObj);
														
														for( var idx in jsonObj){
															var iconObj = jsonObj[idx],
																	imgSrc = iconObj['src'],
																	tagsArr = iconObj['tags'],
																	source = ( typeof(  iconObj['source']) != 'undefined' ? iconObj['source'] :undefined),
																	model = new models.GraphicModel();
																	
															model.set('imgSrc', imgSrc);
															model.set('tags', tagsArr);
															
															if(typeof(  iconObj['source']) != 'undefined')
																model.set('source', source);	
																
															thisCollection.add(model);		
															
														}
														
//														for( var idx in thisCollection.models){
//															var model = thisCollection.models[idx],
//																	cid = model.cid,
//																	tags = model.get('tags');
//																	
//															for(var idx in tags){
//																var tag = tags[idx].trim();
//																if ( tag == '') continue;
//																if( typeof(theseTags[tag]) == 'undefined'){
//																	theseTags[tag] = [];
//																}
//																theseTags[tag].push(cid);
//															}
//															
//														}
														
//														app.stubs.tags.graphics[collection] = tools.sortObject(theseTags);	

											  		break;
											  	}
											  	
												  case 'backgrounds': {

														for( var idx in jsonObj){
															
															if( typeof( jsonObj[idx].json ) == 'undefined' ) continue;
															
															var model = new models.GraphicModel(),
																	backgroundStyleObj = jsonObj[idx].json.style.background,
																	backgroundStyleStr = '';
																	
															backgroundStyleObj['background-size'] = jsonObj[idx].json.data.width /2  + 'px';
																	
															for( var key in backgroundStyleObj){
																
																var value = backgroundStyleObj[key];
																
																backgroundStyleStr += key + ': ' + value + ';'
																
															}				
																												
															model.set('html', '\
																<div style="' + backgroundStyleStr + '"></div>\
															');																			
																	
															model.set('json', jsonObj[idx].json);
															
															
															thisCollection.add(model);
															
														}
														
														

											  		break;
											  	}

													case 'arrows':
													case 'speech':
													case 'banners':
												  case 'borders': {
													
														for( var idx in jsonObj){
															
															if( typeof( jsonObj[idx].json ) == 'undefined' ) continue;
															
															var model = new models.GraphicModel(),
																	src = jsonObj[idx].json.data.src;
															
															model.set('imgSrc', src);																		
																	
															model.set('json', jsonObj[idx].json);
																
															thisCollection.add(model);		
															
														}


											  		break;
											  	}

												}
												
												if( tools.inArray( collection, app.settings.hasSvgshapes) ){ // working get data
													
														for( var idx in jsonObj){
															var svgObj = jsonObj[idx],
																	imgSrc = svgObj['json']['data']['src'],
																	model = new models.GraphicModel();
																	
															model.set('file', svgObj['json']['data'].file);
															model.set('imgSrc', imgSrc);
															//app.stubs.svgmap['file'] = imgSrc;
															model.set('json', svgObj.json);
															thisCollection.add(model);	

														}
													
												}

											};
									
									tools.ajax(	url, arrDataObj, type, callback	);
							},
							
							fontwidths: function() {
								tools.ajax(	'json/fontwidths.js', {}, 'post', function(jsonObj) {
									
									console.log(jsonObj);
								});
							},
							
							clouddrive: {
								google: function( callback ) {
									
									var thisCollection = app.stubs.collections.graphics.googledrive = new collections.GraphicsCollection();

									var that = this,
											url = 'app/getImgFileList',
											postObj = {
												'google_id': app.stubs.google_id
											},
											type='post';
											
											tools.ajax(	url, postObj, type, function( data ) {
												
												for( var idx in data){
													
													var file = data[idx],
															model = new models.GraphicModel();
															
													model.set('thumbnailLink', file['thumbnailLink']);
													model.set('fileId', file['fileId']);
													model.set('width', file['width']);
													model.set('height', file['height']);
													
													var html = '\
														<img fileId="' + file['fileId'] + '" src="' + file['thumbnailLink'] + '">\
													';
													
													model.set('html', html);
													
													thisCollection.add(model);		
													
												}
												
												if( typeof( callback) != 'undefined') callback();
												
											});
								}
							}
							
						},
						
						build: {
							
							cards: {
								
									init: function() {

										for( var key in app.menu.left.cards){
											var cardObj = app.menu.left.cards[key];
											new views.leftMenu.Card(cardObj);
										}
										
										this.bind();	
																			
									},
									
									bind: function() {
										
										app.methods.picserver();
		
								    var boxShadowFor = function( $el, boxStyle ) {
								    	var prefixes = ['-moz-', '-webkit-', '-o-', ''];
								    	for( var idx in prefixes ){
								    		var prefix = prefixes[idx];
								    		$el.css( prefix + 'box-shadow', boxStyle);	
								    	}
								    };
				
							      var hideShadow = '0 0px 0px 0 rgba(0, 0, 0, 0.0), 0 0px 0px 0 rgba(0, 0, 0, 0.0)';
								  	var thinShadow = '0 1px 1px 0 rgba(0, 0, 0, 0.1), 0 1px 1px 0 rgba(0, 0, 0, 0.1)';
								  	var thickShadow = '0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.18824)';
				
										$('#collapse-card-container').on('click', '.collapse-card', function() {
											
											app.methods.clearActive(['previewOn', 'removeToast'], 'exclude', 'collapse-card click');
											
											$('.sub-card.active').each(
												function() {
													$(this).removeClass('active');
												}
											);
											
											$('.sub-card').show();
												
											$('.collapse-card').css({ // Do to all cards
												'background-color': 'white',
												'border-bottom': '1px solid #eeeeee',
												'height': app.stubs.dim.cards.inactive.height + 'px'
											});

											$('.collapse-card').not(this) // Do to other than active card
											
											.each(
												function() {
													$(this).removeClass('active').find('.body').slideUp();
													boxShadowFor($(this), thinShadow);
												}
											);
											

											  
										  if ( !$(this).hasClass('active') ) { // Expand
										  	
										  	boxShadowFor($(this), thickShadow);
										  	
										  	if($(this).hasClass('sub-card-container')){
										  		
										  		var numSubCards =  $(this).find('.sub-card').length + 2;
										  		
										  		$(this).css({
										  			'background-color': '#DDDDDD',
										  			'border-bottom': '0px',
										  			'height': numSubCards * app.stubs.dim.cards.subcards.inactive.height + 'px',
										  			'padding-bottom': '16px'
										  		});
										  	} else{
										  		$(this).css({
										  			'height': app.stubs.dim.cards.active.height + 'px',
										  			'padding-bottom': '30px'
										  		});
										  	}
										    
										    $(this).addClass('active');
										    
										    $(this).find('.body').slideDown();
										    
										    boxShadowFor($('#collapse-card-container'), hideShadow);
										
										  } else { // Collapse
										  	
												boxShadowFor($(this), thinShadow);
										
										    $(this).removeClass('active');
										    
										    $(this).find('.body').slideUp( 400, function() {
										  		boxShadowFor($('#collapse-card-container'), thinShadow);
										  	});
										  	
										  }
										});
									},

							},
							subcards: function() {
		
								$('.sub-card-container').on('click', '.sub-card', function(event) {
									event.stopPropagation();
									
									app.methods.clearActive(['previewOn', 'removeToast'], 'exclude', 'subcards click');
									
									// $('.search-form').addClass('hasIcon');
									
									$('input.form-control').val('').attr('placeholder', 'Enter search term');
									
									$(this).closest('.body').css('overflow', 'hidden');
									$(this).siblings().hide();
									$('.close-button').remove();
									
									if ( !$(this).hasClass('active') ) { // Expand
										
										$(this).closest('.sub-card-container').css('cursor', 'auto');
										
										 $(this).addClass('active').css({
								  			'height': app.stubs.dim.icons.expandedSubCardContainer.height + 'px'
								  		});
								  		
								  	$(this).find('.search-container').show();
								  	
								  	$(this).find('.search-container').height(app.stubs.dim.icons.search.height)
								  	
								  	$(this).prepend('\
								  		<span class="close-button">&times;</span>\
								  	');
								  	
								  	var $searchResultContainer = $(this).find('.search-result-container');
								  	
								  	$('.search-result-container').empty();
		
		
								  	if($(this).hasClass('hasTags')){
								  		
								  		app.menu.left.build.maxcard.tags($searchResultContainer);
								  		
								  	} else {
								  		
								  		app.methods.progressBar.start();

								  		var collection = $searchResultContainer.attr('collection');
								  		
								  		if( collection == 'googledrive'){
								  			app.menu.left.getData.clouddrive.google( function() {
								  				
								  				app.menu.left.build.maxcard.render( $searchResultContainer, collection);
								  			})
								  			return;	
								  		}
								  										  		
								  		app.menu.left.build.maxcard.render( $searchResultContainer, collection);
								  		
								  	}
								  	
									} else { // Collapse

										
										$(this).closest('.sub-card-container').css('cursor', 'pointer');
										
										$(this).siblings().show();
										$(this).removeClass('active').css({
								  		'height': app.stubs.dim.cards.subcards.inactive.height + 'px'
								  	});
								  	$(this).find('.search-container').hide();
									}
									
								});						
							},
							maxcard: {
								
								imgLoadedCount:0,
								
								init: function() {
									
									var selectors = [];
									for( var idx in app.menu.left.cards.graphics.subcards){
										var subcard = app.menu.left.cards.graphics.subcards[idx];
										this.bind( subcard['id'] );
									}
									
									$('.search-container').bind('click', function(event) {
										event.stopPropagation();
									});
									
								},
		
								bind: function( selector ) {
									
									var that = this,
											$searchResultContainer = $('#' + selector).find('.search-result-container'),
											collection = $searchResultContainer.attr('collection'),
											$searchField = $('#' + selector + ' input'),
											$searchForm = $('#' + selector + ' form.search-form'),
											showTagsLike = function( search ) {
												
												var filteredTags = {};
												if( tools.inArray( collection, ['icons', 'backgrounds'])){
													for( var tag in app.stubs.tags.graphics[collection]){
														if( typeof( search ) == 'undefined' ){
															filteredTags[tag] = '';
														} else{
															if( tools.beginsWith(search, tag) ){
																filteredTags[tag] = '';
															}
														}
													}											
												} else{
													var tags = app.stubs.tags.graphics[collection].pluck('tag');
													for( var idx in tags){
														var tag = tags[idx];
														tag = tag.trim();
														if( typeof( search ) == 'undefined' ){
															filteredTags[tag] = '';
														} else{
															if( tools.beginsWith(search, tag) ){
																filteredTags[tag] = '';
															}
														}
													}												
													
												}
												
												that.tags($searchResultContainer, filteredTags);
												
											};
											
									$searchForm.submit(function(event){
										
										$searchResultContainer.empty(); 
										
										var searchTerm = $(this).find('input').val();
										
										//console.log('Searching ' + searchTerm + ' in ' + collection + ' collection.');
										
										that.render( $searchResultContainer, collection, searchTerm);
										
										event.preventDefault(); 
									});							
									
									
									$searchField.on('click', function(event) {
										$('.search-form').removeClass('hasIcon');
										$(this).val('').attr('placeholder', '');
										
										that.tags( $searchResultContainer );
										
										event.stopPropagation();
										
										return;
		
									  var disappear = function() {
									    return setTimeout((function() {
									      $('.thumb').removeClass('animated-visible');
									      return appear();
									    }), 1500);
									  };
									
									  
										
									}).on('keyup', function( event) {
										if ( event.which == 13 ) {
								     event.preventDefault();
								  	}else{
								  		showTagsLike($(this).val() );
								  	}
										
									});
									
								},
								
								render: function( $searchResultContainer, collection, searchTerm) {
									
//									console.log('rendering dom after searching ' + searchTerm + ' in collection ' + collection);
									
									this.imgLoadedCount = 0;
									
									$('.search-result-container').empty();
									
									this.$searchResultContainer = $searchResultContainer;
									this.collection = collection;
									this.searchTerm = searchTerm;
		
									// working  search
									
									var that = this,
											totalThumbsInCollection = ( tools.inArray( collection, app.settings.pixabayCollections) || collection == 'clipart' ? 99999999999 :app.stubs.collections.graphics[collection].length),
											html = this.html = '',
											sets  = this.sets = '',
											thumbtype = this.thumbtype = $searchResultContainer.attr('thumbtype'),
											thumbtypeArray =  this.thumbtypeArray = thumbtype.split(' '),
											shape = this.shape = thumbtypeArray[0],
											size = this.size = thumbtypeArray[1],
											maxHeight = this.maxHeight = app.stubs.dim.icons.result.setMaxIcon.height,
											maxWidth = this.maxWidth = app.stubs.dim.icons.result.setMaxIcon.width,
											noSearchMaxHeight  = app.stubs.dim.icons.result.setMaxIcon.nosearchHeight,
											thumbRealHeight = this.thumbRealHeight = app.stubs.dim.icons.thumb[shape][size].realHeight,
											thumbRealWidth = this.thumbRealWidth = app.stubs.dim.icons.thumb[shape][size].realWidth,
											width = this.width = app.stubs.dim.icons.thumb[shape][size].width,
											height = this.height = app.stubs.dim.icons.thumb[shape][size].height,
											blocksWide = this.blocksWide = app.stubs.dim.icons.thumb[shape][size].blocksWide,
											thumbColumnHeight = this.thumbColumnHeight = thumbRealHeight,
											iconsPerSet = this.iconsPerSet = Math.floor((app.stubs.dim.icons.result.setMaxIcon.height * app.stubs.dim.icons.result.setMaxIcon.width) /  (thumbRealHeight * thumbRealWidth )),
											iconsPerSet = this.iconsPerSet = Math.floor(iconsPerSet / blocksWide) * blocksWide,
											set = 1,
											noSearch = (  $searchResultContainer.hasClass('pixabay-search') || $searchResultContainer.hasClass('openclipart-search') || $searchResultContainer.hasClass('pexels-search')  ? false: true  ),
											hasSearch = (  $searchResultContainer.hasClass('pixabay-search') || $searchResultContainer.hasClass('openclipart-search') || $searchResultContainer.hasClass('pexels-search') || tools.inArray( collection, ['icons']) ? true  : false),
											usesImgTag = (  tools.inArray( collection, ['speech', 'icons', 'borders', 'banners', 'arrows']) || tools.inArray( collection, app.settings.hasSvgshapes)  ? true : false );
											
											
											//console.log('width: ' + width);
											//console.log('height:' + height);
											
											// working search thumbs
											
//											console.log('raw:'  + (app.stubs.dim.icons.result.setMaxIcon.height * app.stubs.dim.icons.result.setMaxIcon.width) /  (thumbRealHeight * thumbRealWidth ) );
//											console.log('app.stubs.dim.icons.result.setMaxIcon.height: ' + app.stubs.dim.icons.result.setMaxIcon.height);
//											console.log('app.stubs.dim.icons.result.setMaxIcon.width: ' + app.stubs.dim.icons.result.setMaxIcon.width);
//											console.log('thumbRealHeight: ' + thumbRealHeight);
//											console.log('thumbRealWidth: ' + thumbRealWidth);
//											console.log('iconsPerSet: ' + iconsPerSet);
											
											
											if( $searchResultContainer.hasClass('pixabay-search') ){
												
												app.stubs.collections.graphics[collection] = new collections.GraphicsCollection();
												this.renderNextPixalBay.call( this, set );
												
											} else if( $searchResultContainer.hasClass('openclipart-search')){
												
												app.stubs.collections.graphics[collection] = new collections.GraphicsCollection();
												this.renderOpenClipart.call( this, set );
												
											} else if( $searchResultContainer.hasClass('pexels-search')){
												
												app.stubs.collections.graphics[collection] = new collections.GraphicsCollection();
												this.renderPexel.call( this, set );
												
											} else{  // non pixabay
						
												if(searchTerm == ''){
													//console.log('no search term');	
													return;
												}
												
												if(typeof(searchTerm) == 'undefined'){  // fixed
													
													var cidArr = [];
													
													for( var idx in app.stubs.collections.graphics[collection].models){
														var model = app.stubs.collections.graphics[collection].models[idx];
														cidArr.push(model.cid);
													}
													
												} else{
													
													var cidArr = app.stubs.tags.graphics[collection][searchTerm];

													//console.log(JSON.stringify( cidArr));
													
												}
												
												var countInThisSet = 0;
												
												for( var idx in cidArr){
													
													countInThisSet++;
													
													var cid = cidArr[idx],
															model = app.stubs.collections.graphics[collection].get(cid);
													
//													if( noSearch ){
//														
//														var innerhtml = model.get('html');
//														
//														html += _.template( that.templates.thumb.innerhtml,{
//																			thumbtype: thumbtype,
//																			innerhtml: innerhtml,
//																			height: height + 'px',
//																			collection: collection,
//																			cid: cid
//																		})	
//													} else{
//														
//														var imgSrc = model.get('imgSrc');
//														
//														html += _.template( that.templates.thumb.image,{
//																			thumbtype: thumbtype,
//																			src: imgSrc,
//																			imgWidth: '100%',
//																			imgHeight: '100%',
//																			collection: collection,
//																			cid: cid
//																		})														
//													}
													
													
													if( usesImgTag ){
														
														var imgSrc = model.get('imgSrc'),
																obj = {
																			thumbtype: thumbtype,
																			src: imgSrc,
																			collection: collection,
																			imgWidth: '100%',
																			imgHeight: '100%',
																			cid: cid
																		};
																		
														if( tools.inArray( collection, ['speech', 'borders', 'arrows', 'banners']) ){
															
															//console.log(thumbtype);
															
															var imgWidth = model.get('json').data.width,
																	imgHeight = model.get('json').data.height;
																	
															obj['imgWidth'] = (imgHeight > imgWidth ? 'auto': '100%');
															obj['imgHeight'] = (imgHeight > imgWidth ? '100%': 'auto');
															
															
														}
														
														html += _.template( that.templates.thumb.image, obj)	
																		
													} else{
														
														var innerhtml = model.get('html');
														
														html += _.template( that.templates.thumb.innerhtml,{
																			thumbtype: thumbtype,
																			innerhtml: innerhtml,
																			height: height + 'px',
																			collection: collection,
																			cid: cid
																		})														
													}		
		
													//if( tools.inArray( collection, app.settings.charts)) iconsPerSet = 2;

													if(countInThisSet >= iconsPerSet &&
														 countInThisSet != totalThumbsInCollection
													){
														
														countInThisSet = 0;
														
														if( typeof(skipedfirst) != 'undefined'){
															html += that.templates.previous;
														} else{
															var skipedfirst = true;
														}
														
														html += that.templates.more;
														
														sets += '<div  class="search-results-set">' + html + '</div>';
														
														html = '';
														
													}	
													
												}
												
												html += that.templates.previous;
												
												sets += '<div  class="search-results-set">' + html + '</div>';
												
												var setsDom = '<div  class="search-results-set-wrapper">' + sets + '</div>';
												
												$searchResultContainer.append(setsDom);

										  	$('.search-container').height(app.stubs.dim.icons.search.height);

												$searchResultContainer
														.css('padding-top', ( noSearch || collection == 'icons' ? app.stubs.dim.icons.result.set.nosearchHeightBufferTop: '0') + 'px')
														.height( noSearch || collection == 'icons'  ? app.stubs.dim.icons.search.noSearchHeight:app.stubs.dim.icons.search.height);											
						
												$('.search-results-set-wrapper, .search-results-set')
														.height( noSearch || collection == 'icons' ? noSearchMaxHeight: app.stubs.dim.icons.result.set.height);
												
												
												$('.search-results-set').find('img').on('load',function(){
													
													
													if( that.collection == 'icons' || tools.inArray( collection, app.settings.hasSvgshapes)) return; // working thumbs
														
													
													app.methods.progressBar.stop('search ');
													
													var imgWidth = this.width,
															imgHeight = this.height,
															centeredCSSObjForImage = that.getCenteredCSSObjForImage( imgWidth, imgHeight);
															
													 $(this).css(centeredCSSObjForImage);
													 
											   	 that.imgLoadedCount++;
												   	 
												});
												
												var setWidth = app.stubs.dim.icons.result.set.width;
												
												that.showWhichSet(1);
												
											}
		
								},
								
								getCenteredCSSObjForImage: function( width, height ) {
									
									var thumbWidth = app.stubs.dim.icons.thumb[this.shape][this.size].width,
											thumbHeight = app.stubs.dim.icons.thumb[this.shape][this.size].height,
											shrunkByWidth = ( thumbWidth < width ? thumbWidth / width: width / thumbWidth),
											shrunkByHeight = ( thumbHeight < height ? thumbHeight / height: height / thumbHeight);
									//console.log(width);
									//console.log(height);
									if( width > height){
										
									 var adjustedHeight = thumbWidth / width *  height;

										if( adjustedHeight > thumbHeight){
										 return {
												'width': thumbHeight / height *  width + 'px',
												'height': thumbHeight + 'px',
												'margin-left': (  (thumbWidth - (width * shrunkByHeight))  / 2 ) + 'px'
											}
										}else{
										 return {
												'width': thumbWidth + 'px',
												'height': adjustedHeight + 'px',
												'margin-top': (  (thumbHeight - (height * shrunkByWidth))  / 2 ) + 'px'
											}										
										};
									

										
									} else{
									
									 return {
											'width': 'initial',
											'height': '100%',
											'margin-left': (  (thumbWidth - (width * shrunkByHeight))  / 2 ) + 'px'
										}
									 	
									}

								},
								
								renderOpenClipart: function( set ) {

										var tagsCollection = app.stubs.tags.graphics[this.collection];
										
										while( tagsCollection.length > 200){
											var arr = tagsCollection.pluck("id");
											var model = tagsCollection.get(arr[Math.floor(Math.random() * arr.length)]);
											model.destroy();
										}
										
										this.thumbColumnHeight = this.thumbRealHeight;
									
										var that = this,
												USERNAME = 'jamesming0',
												API_KEY = 'c0ec40063b92c823a2f4',
												image_type = this.collection.substring(0, this.collection.length - 1),
												url = "https://openclipart.org/search/json/?query=" 
															+ encodeURIComponent(this.searchTerm)
															+"&amount=" + this.iconsPerSet
															+"&page=" + set;
									
												$.getJSON(url, function(data){

													var payload = data.payload,
															totalHits = parseInt(data.info.results),
															numberOfWholeSets = Math.floor(totalHits / that.iconsPerSet);
													
													if ( totalHits > 0){
															
															for( var idx in payload){
																var item = payload[idx],
																		model = new models.GraphicModel(),
																		svg = item.svg,
																		dimensions = item.dimensions;
																		
																model.set('pageURL', svg.url);
																model.set('theirTags', item.tags);
																model.set('previewURL', svg.png_thumb);
																model.set('previewWidth', dimensions.png_thumb.width);
																model.set('previewHeight', dimensions.png_thumb.height);
																model.set('webformatURL', svg.png_full_lossy);
																model.set('webformatWidth', dimensions.png_full_lossy.width);
																model.set('webformatHeight', dimensions.png_full_lossy.height);
																
																var tagArr = item.tags.split(',');
																
																for( var idx in tagArr){
																	
																	var tag = tools.trimFrontAndBackOf(tagArr[idx]).toLowerCase(),
																			found = tagsCollection.find(function(item){
																			  return item.get('tag') == tag;
																			});
																			
																	if( typeof(found) == 'undefined' && 
																			tag != '' && 
																			tag.length < 15 && 
																			tag.length > 2 && 
																			tools.containsAtoZaTOz(tag)
																			){
																				
																		var tagModel = new models.TagModel();
																		tagModel.set('tag', tag);
																		tagsCollection.add(tagModel);
																		tagModel.save();
																		tagsCollection.sort();															
																	}
																	
																}
										
																app.stubs.collections.graphics[that.collection].add(model);
																	
															}
															
													} else {
														
														that.$searchResultContainer.empty().append('<div  class="error-message">No results found.</div>');	
														
													}
													
													that.generateUnScaledThumbs(set, totalHits, numberOfWholeSets);	
												});
										
								},
								
								renderNextPixalBay: function( set ){

										var tagsCollection = app.stubs.tags.graphics[this.collection];
										
										while( tagsCollection.length > 200){
											var arr = tagsCollection.pluck("id");
											var model = tagsCollection.get(arr[Math.floor(Math.random() * arr.length)]);
											model.destroy();
										}
										
										this.thumbColumnHeight = this.thumbRealHeight;
									
										var that = this,
												API_KEY = '618173-7f7ff2c813807a9b9e301b5bb',
												image_type = this.collection.substring(0, this.collection.length - 1),
												url = "https://pixabay.com/api/?key="+ API_KEY
															+"&q=" + encodeURIComponent(this.searchTerm)
															+"&image_type=" + image_type
															+"&page=" + set 
															+"&per_page=" + this.iconsPerSet;
															
												$.getJSON(url, function(data){
													
													var hits = data.hits,
															totalHits = parseInt(data.totalHits),
															numberOfWholeSets = Math.floor(totalHits / that.iconsPerSet);
													
		//											//console.log('---------------------------------------------------------------------------------');
		//											//console.log('totalHits: ' + totalHits);
		//											//console.log('numberOfWholeSets: ' + numberOfWholeSets);
		//											//console.log('set: ' + set);
													
													if ( totalHits > 0){
															
															for( var idx in hits){
																var hit = hits[idx],
																		model = new models.GraphicModel();
																model.set('pageURL', hit.pageURL);
																model.set('theirTags', hit.tags);
																model.set('previewURL', hit.previewURL);
																model.set('previewWidth', hit.previewWidth);
																model.set('previewHeight', hit.previewHeight);
																model.set('webformatURL', hit.webformatURL);
																model.set('webformatWidth', hit.webformatWidth);
																model.set('webformatHeight', hit.webformatHeight);
																
																var tagArr = hit.tags.split(',');
																
																for( var idx in tagArr){
																	
																	var tag = tools.trimFrontAndBackOf(tagArr[idx]),
																			found = tagsCollection.find(function(item){
																			  return item.get('tag') === tag;
																			});
																	
																	if( typeof(found) == 'undefined' && 
																			tag != '' && 
																			tag.length < 15 && 
																			tag.length > 2 && 
																			tools.containsAtoZaTOz(tag)
																			){
																		var tagModel = new models.TagModel();
																		tagModel.set('tag', tag);
																		tagsCollection.add(tagModel);
																		tagModel.save();
																		tagsCollection.sort();															
																	}
																	
																}
										
																app.stubs.collections.graphics[that.collection].add(model);
																	
															}
															
													} else {
														
														that.$searchResultContainer.empty().append('<div  class="error-message">No results found.</div>');	
														
													}
													
													that.generateUnScaledThumbs(set, totalHits, numberOfWholeSets);	
											    
												}).fail(function(data) {
													that.$searchResultContainer.empty().append('<div  class="error-message">No results found.</div>');
											    //console.log(data.statusText);
											  });
										
								},
								
								renderPexel: function( set ){

										var tagsCollection = app.stubs.tags.graphics[this.collection];
										
										while( tagsCollection.length > 200){
											var arr = tagsCollection.pluck("id");
											var model = tagsCollection.get(arr[Math.floor(Math.random() * arr.length)]);
											model.destroy();
										}
										
										this.thumbColumnHeight = this.thumbRealHeight;
									
										var that = this,
												API_KEY = '563492ad6f91700001000001d7ce5290bc89451f6de5bee330807d09',
												url = "https://api.pexels.com/v1/search?"
															+"&query=" + encodeURIComponent(this.searchTerm)
															+"&page=" + set 
															+"&per_page=" + this.iconsPerSet;
$.ajax({
  dataType: "json",
  beforeSend: function (xhr) {
    xhr.setRequestHeader ("Authorization", API_KEY); 
	},
  url: url,
  success: function(data){
													
		 console.log(JSON.stringify(  data   , null, 2 ));													
													
													return;
													var hits = data.hits,
															totalHits = parseInt(data.totalHits),
															numberOfWholeSets = Math.floor(totalHits / that.iconsPerSet);
													
		//											//console.log('---------------------------------------------------------------------------------');
		//											//console.log('totalHits: ' + totalHits);
		//											//console.log('numberOfWholeSets: ' + numberOfWholeSets);
		//											//console.log('set: ' + set);
													
													if ( totalHits > 0){
															
															for( var idx in hits){
																var hit = hits[idx],
																		model = new models.GraphicModel();
																model.set('pageURL', hit.pageURL);
																model.set('theirTags', hit.tags);
																model.set('previewURL', hit.previewURL);
																model.set('previewWidth', hit.previewWidth);
																model.set('previewHeight', hit.previewHeight);
																model.set('webformatURL', hit.webformatURL);
																model.set('webformatWidth', hit.webformatWidth);
																model.set('webformatHeight', hit.webformatHeight);
																
																var tagArr = hit.tags.split(',');
																
																for( var idx in tagArr){
																	
																	var tag = tools.trimFrontAndBackOf(tagArr[idx]),
																			found = tagsCollection.find(function(item){
																			  return item.get('tag') === tag;
																			});
																	
																	if( typeof(found) == 'undefined' && 
																			tag != '' && 
																			tag.length < 15 && 
																			tag.length > 2 && 
																			tools.containsAtoZaTOz(tag)
																			){
																		var tagModel = new models.TagModel();
																		tagModel.set('tag', tag);
																		tagsCollection.add(tagModel);
																		tagModel.save();
																		tagsCollection.sort();															
																	}
																	
																}
										
																app.stubs.collections.graphics[that.collection].add(model);
																	
															}
															
													} else {
														
														that.$searchResultContainer.empty().append('<div  class="error-message">No results found.</div>');	
														
													}
													
													that.generateUnScaledThumbs(set, totalHits, numberOfWholeSets);	
											    
	}
});		

								},
								
								generateUnScaledThumbs: function(set, totalHits, numberOfWholeSets) {
									
										var that = this,
												setsDom = '',
												html = '',
												nextIdx = ((this.iconsPerSet * set)) - this.iconsPerSet,
												len = app.stubs.collections.graphics[this.collection].models.length,
												curCountPerSet = 0,
												blocksWideCount = 0;

										for( var idx = nextIdx; idx <= len - 1; idx++){
											
											curCountPerSet++;
											
											var model = app.stubs.collections.graphics[this.collection].models[idx],
													cid = model.cid,
													srcThumb = model.get('previewURL'),
													previewWidth = model.get('previewWidth'),
													previewHeight = model.get('previewHeight'),
													getAdaptedHeight = function() {
														return previewHeight / that.height  * that.height;
													};
							
											html += _.template( this.templates.thumb.image,{
																thumbtype: this.thumbtype,
																src: srcThumb,
																imgWidth: previewHeight > previewWidth ? 'auto': '100%',
																imgHeight: previewHeight > previewWidth ? '100%': 'auto',
																collection: this.collection,
																cid: cid
															})
							
//												//console.log('idx: ' + idx);
											
											if( curCountPerSet == this.iconsPerSet ||
													set > numberOfWholeSets && totalHits == (idx + 1)){
												
													html += this.templates.previous;
													
													if( curCountPerSet == this.iconsPerSet && totalHits != this.iconsPerSet) html += this.templates.more;
													
													setsDom += '<div  class="search-results-set">' + html + '</div>';
													if( set == 1){
														var setsWrapper = '<div  class="search-results-set-wrapper">' + setsDom + '</div>';
														this.$searchResultContainer.empty().append(setsWrapper);									
													} else {
														this.$searchResultContainer.find('.search-results-set-wrapper')
																.append(setsDom);	
													}
													$('.search-results-set-wrapper, .search-results-set')
														.height(app.stubs.dim.icons.result.set.height);
														
													$('.search-results-set').find('img').on('load',function(){

														app.methods.progressBar.stop('search result set');
														
														var imgWidth = this.width,
																imgHeight = this.height,
																centeredCSSObjForImage = that.getCenteredCSSObjForImage( imgWidth, imgHeight);
																
														 $(this).css(centeredCSSObjForImage);
													   that.imgLoadedCount++;
													   
													});
														
													this.showWhichSet(set);
													
											} 							 
								    		
								    };

								},
								
								templates: {
									thumb:{
										image: '\
			          			<div class="thumb <%=	thumbtype	%> animated-nonvisible"  collection="<%= collection	%>"  cid="<%=	cid	%>"   >\
			          				<img src="<%=	src	%>"   style="width: <%=	imgWidth	%>; height: <%=	imgHeight	%> "   />\
			          			</div>\
										',
										innerhtml: '\
			          			<div class="thumb <%=	thumbtype	%> animated-nonvisible "  collection="<%= collection	%>"  cid="<%=	cid	%>" style="height:<%=	height	%>" >\
			          				<%=	innerhtml	%>\
			          			</div>\
										'
									},
									more: '\
			              	<div class="search-more-container search-nav animated-nonvisible">\
			              		more\
			              	</div>\
											',
									previous: '\
			              	<div class="search-previous-container search-nav animated-nonvisible">\
			              		previous\
			              	</div>\
											'		
								},
								
								showWhichSet: function(set) {
									
									var that = this,
											newResultSetWidth = app.stubs.dim.icons.result.set.width * set,
											$setWrapper = $('.search-results-set-wrapper'),
											$set = $('.search-results-set-wrapper').children(':nth-child('+ set +')'),
											$searchResultContainer = $setWrapper.parent(),
											nextSet = set + 1,
											$nextSet = $('.search-results-set-wrapper').children(':nth-child('+ nextSet +')'),
											scrollNext = newResultSetWidth - app.stubs.dim.icons.result.set.width,
											scrollPrevious = newResultSetWidth - (app.stubs.dim.icons.result.set.width * 2);
									
									$setWrapper.width(newResultSetWidth);
									
									$set.show();
	
									$searchResultContainer.animate({scrollLeft: scrollNext}, 300);
									
					  			var delay, 
								  		thumb, 
								  		offset,
								  		$thumbs = $('.search-results-set-wrapper .search-results-set:nth-child('+ set +') .thumb'),
								  		numThumbsInThisSet = $thumbs.length;
								  
								  for (var i = 0;  i < numThumbsInThisSet; i++) {
								  	
								  	var randomNum = tools.randomIntFromInterval(140, 110);
								  	
								    thumb = $thumbs[i];
								    offset = thumb.offsetLeft + thumb.offsetTop;
								    delay = offset / 1000;
								    
								    $(thumb).css({
								    	'font-size': '12px',
								      'transition-delay': (delay * 1.318) + 's'
								    }).draggable({
												opacity: 0.4,
												start: function(event,	ui) {
												
												},
												
												drag:	function(event,	ui)	{
					
												},
												stop: function() {
					
												},
												helper:	"clone",
												zIndex:	9999999,
												appendTo:	'body'
											});
								    
								  }
	
									var $nav = $('.search-results-set-wrapper .search-results-set:nth-child('+ set +') .search-more-container'),
											nav = $nav[0],
											$searchPrevious = $('.search-results-set-wrapper .search-results-set:nth-child('+ set +') .search-previous-container'),
											searchPrevious = $searchPrevious[0],
											appear = function() {
												
									    	$thumbs.addClass('animated-visible');
									    	$nav.addClass('animated-visible');
									    	if( set > 1) $searchPrevious.addClass('animated-visible');
									    	
									    	app.methods.progressBar.stop('thumbs');

										  };
										  
									if( set > 1) {
										var	$lastNav = $('.search-results-set-wrapper .search-results-set:nth-child('+ (set - 1) +') .search-more-container');
										$lastNav.text('next').unbind('click').bind('click', function(event) {
											event.stopPropagation();
											$searchResultContainer.animate({scrollLeft: scrollNext}, 300);
										});
									}
									
									if( typeof(searchPrevious) != 'undefined' ){
										
										
								    offset = searchPrevious.offsetLeft + searchPrevious.offsetTop;
								    delay = (offset / 1000) * 1.318;
	
									  $searchPrevious.css({
									    'transition-delay': delay + "s"
									  });									  
									  
									  setTimeout(function(){
									  	$searchPrevious.css({
										    'transition-delay': '0s'
										  }).on('click',  function(event) {
										  	event.stopPropagation();
										  	$searchResultContainer.animate({scrollLeft: scrollPrevious}, 300);
										  });
									  }, 1000);										
										
									}
	
									if( typeof(nav) != 'undefined'){
										
								    offset = nav.offsetLeft + nav.offsetTop;
								    delay = (offset / 1000) * 1.318;
	
									  $nav.css({
									    'transition-delay': delay + "s"
									  });
	
									  setTimeout(function(){
										  $nav.css({
										      'transition-delay': '0s'
										  }).on('click',  function(event) {
										  	app.methods.progressBar.start();
										  	event.stopPropagation();
										  	
										  	if( $searchResultContainer.hasClass('pixabay-search')) {
										  		that.renderNextPixalBay(nextSet);
										  	} else if( $searchResultContainer.hasClass('openclipart-search')){
													that.renderOpenClipart(nextSet);
												} else if( $searchResultContainer.hasClass('pexels-search')){
													that.renderPexel(nextSet);
												} 
											  else{
										  		that.showWhichSet(nextSet);
										  	}
										  	
										  });
									  }, 1000);										
										
									}
	
									tools.doWhenReady( function() {
//										console.log('-----------------------------------');
//										console.log('imgLoadedCount: ' + that.imgLoadedCount);
//										console.log('numThumbsInThisSet: ' + numThumbsInThisSet);
//										console.log('numThumbsInThisSet * set:' + numThumbsInThisSet * set);
//										console.log('-----------------------------------');
										if( that.imgLoadedCount >= numThumbsInThisSet * set ||
												! $searchResultContainer.hasClass('pixabay-search' ||
												! $searchResultContainer.hasClass('openclipart-search') ||
												! $searchResultContainer.hasClass('pexels-search')
												)
										) return true
										else return false
									},
									function() {
										appear();
									},
									'dowhen imgLoadedCount: ' + that.imgLoadedCount + ' numThumbsInThisSet: ' + numThumbsInThisSet * set
									);
								  
		
								},
								
								tags: function( $searchResultContainer, filteredTags ) {
		
									$searchResultContainer.empty();
									
									$('.search-result-container').height(app.stubs.dim.icons.result.height);
									
									var that = this,
											collection = $searchResultContainer.attr('collection'),
											tagsCollection = ( $searchResultContainer.hasClass('pixabay-search') ||  $searchResultContainer.hasClass('openclipart-search')  ||  $searchResultContainer.hasClass('pexels-search') ? app.stubs.tags.graphics[collection].models : app.stubs.tags.graphics[collection]),
											tagsDom = '<div  class="tags-wrapper">',
											tagDom = '',
											tags = ( typeof( filteredTags ) != 'undefined' ? filteredTags: tagsCollection);
		
		//								//console.log('filtered tags: ' + JSON.stringify( filteredTags));
									
									for( var key in tags){
										
										if( $searchResultContainer.hasClass('pixabay-search') &&
												typeof( filteredTags ) == 'undefined' ||
												$searchResultContainer.hasClass('openclipart-search') &&
												typeof( filteredTags ) == 'undefined' ||
												$searchResultContainer.hasClass('pexels-search') &&
												typeof( filteredTags ) == 'undefined' 
											){
											var tag = tags[key].get('tag');
										}else{
											var tag = key;
										}							
										
										tagDom += '\
											<span class="tag">' + tag + '</span>\
										';
									}
									
									tagsDom += tagDom;
									tagsDom += '</div>';
									
									$searchResultContainer.append(tagsDom);
									
									$searchResultContainer.find('.tag').on('click', function(event) {
										
										var that = this;
										
										app.methods.progressBar.start( function() {});
										
										
										
										event.stopPropagation();
										$('.search-form').removeClass('hasIcon');
										var searchTerm = $(this).text();
										
										$(this).closest('.search-container').find('input').val(searchTerm);
										
										app.menu.left.build.maxcard.render( $searchResultContainer, collection, searchTerm);
										
										
										
									})	
										
								}
							}
						},
						
						click: function() {
							
							$('.search-container').on('dblclick', '.thumb', function() {
								
									app.stubs.placement.leftPlace += app.stubs.placement.increment;
									app.stubs.placement.topPlace += app.stubs.placement.increment;
								
									var	$thumb = $(this),
											cid = $thumb.attr('cid'),
											collection = $thumb.attr('collection'),
											left = app.stubs.placement.leftPlace,
											top = app.stubs.placement.topPlace,
											panelView = app.stubs.views.panels['panel_0'],
											json = app.methods.generateJsonFromGraphicModel( collection, left, top, false, cid);
											json.justDropped = true;
									
									if( app.methods.hasWidget(collection)){
											app.methods.widgets.route(json);
									}else{
										
//										if( tools.inArray( json.collection, app.settings.hasShapes)||
//										 		json.collection == 'straights' ){ 
//											delete json.justDropped;
//										}
										
										panelView.drop.createAndAddModel.call( panelView, json, undefined, 'III');
									};

								return false;
							});
						}
						
					}
				};				
				
				this.data = {
					import: function(callback, dataFromDesktop) {
							
							var loadThe = function(data) {
								
								
								
								app.stubs.saveHistoryEnabled = false;
								
								var panelView = app.stubs.views.panels['panel_0'],
										data = $.parseJSON( data);
								
								app.stubs.version = data.version;

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
								
								if( typeof( data.canvas)  != 'undefined') {
									app.stubs.curPaperShape = data.canvas.curPaperShape;
								} else {
									toast('data.canvas is missing')	
								}
								
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
														
									if( tools.detectEdge() && tools.inArray(json.collection, app.settings.brokenWithIE) ||
											tools.detectIE() && tools.inArray(json.collection, app.settings.brokenWithIE) 
									){
										app.stubs.fileNotWorkInIE = true;
									}
									
									if( tools.detectEdge() && json.collection == 'headers' || 
											tools.detectIE() &&  json.collection == 'headers' 
									) {
										
										if( typeof( json.data.strokewidth ) != 'undefined' && parseFloat(json.data.strokewidth) > 0 ) {
											app.stubs.fileWorksPartiallyInIE = true;
										}
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
							};
							
							
							if( typeof(dataFromDesktop) != 'undefined'){
								app.methods.createCollections();
								app.stubs.views.elements = {};
								$('.elements').remove();
								
								loadThe(dataFromDesktop);
								
								return;
							};
						
							var url,
									controller = 'index.php/app/';
							
							if( serverhost == 'localhost' ){ 
								url = controller + 'open_local';
							} else if( typeof( tools.urlGet('badfile') ) == 'string' ) {
								url = controller + 'open_badfile';
							} else{
								url = controller + 'open';
							};
						
							var data = [],
									obj = { 
										google_id: app.stubs.google_id,
										fileId: app.stubs.fileId,
										openFrom: 'drive'
									};
									
							if( typeof( template_id ) != 'undefined'){
								url = controller + 'open_template';
								obj['template_id'] = template_id;
								obj['openFrom'] = 'template';
								obj['google_id'] = app.stubs.google_id;
								delete obj['fileId'];
							}
							
							tools.ajax(url, obj, 'post', function( data) {
								
								loadThe(data);
								
							});	
							
					
					},					
					export: {
						
						/*
						numWithRichtext: 0,
						numWithRichtextThatHasHtmlAsPng: 0,
						*/
						ready: true,
						
						reset: function(gatherhow) {
							
							app.stubs.data.os = tools.whatIs();
							app.stubs.data.elements = [];
							app.stubs.data.panels = [];
							app.stubs.data.canvas = {};
							app.stubs.data.guides = [];
							app.stubs.data.spot = undefined;
						},
						
						gather: function(gatherhow) {
							
							for( var idx in app.stubs.collections.elements.models){
								var model = app.stubs.collections.elements.models[idx];
								
								if( model.get('disabled')) continue;
								
								if( typeof( model.get('json').data.base64) == 'undefined' && 
										model.get('json').collection == 'web'
								) {
									continue;
								}
								
								if( typeof( gatherhow ) != 'undefined' && gatherhow == 'spotify' ){
									if( !tools.inArray(model.cid, app.stubs.grouped)) continue;
								}
								
								var json = model.get('json');
								
								//if( json.collection == 'headers' && json.data.text.length == 0  ) continue;
								
								if( typeof( gatherhow ) != 'undefined' && gatherhow == 'publish' ){
									if( tools.inArray(json.collection, app.settings.canSaveImageToCloudDrive)) {  
										var shrinkby = 1,
												newBase64Data = app.methods.reduceImageSize(json, shrinkby, model.cid);
										json.data.shrunken_base64 = newBase64Data.base64;
										var shrinkby = .2,
												tinyBase64Data = app.methods.reduceImageSize(json, shrinkby, model.cid);
										json.data.tiny_base64 = tinyBase64Data.base64;
										json.data.match = tools.randomIntFromInterval(1, 9999999999999);
									};
								};

								// FIX IMAGE
//								if( tools.inArray(json.collection, app.settings.canSaveImageToCloudDrive) &&
//										parseFloat(json.style.element.width) < json.data.width &&
//										parseFloat(json.style.element.height) < json.data.height  
//								) {  
//									var newBase64Data = app.methods.reduceSize(json, shrinkby, model.cid);
//									json.data.base64 = newBase64Data.base64;
//									json.data.width = parseFloat(json.style.element.width);
//									 json.data.height = parseFloat(json.style.element.height);
//								};
//								
//								if( tools.inArray(json.collection, app.settings.charts)) {
//									var view = app.stubs.views.elements[model.cid];
//									view.renderChartHi()
//								};
								
								window.force = true; // FIX BUG
								
								if( json.collection == 'headers' && json.data.needFreshPNG ||
										json.collection == 'headers' && typeof( window.force ) != 'undefined'
								) {
 									
 									app.stubs.renderingPNGforHeaders = true;
 									console.log('renderingPNGforHeaders is true');
 									var view = app.stubs.views.elements[model.cid];
 									var usequeue = true;
 									view.renderPngFromTextedit('gather for header', undefined, usequeue);
 									json.data.needFreshPNG = false;
 									
 								};

								app.stubs.data.elements.push(json);
								
							}
							
//							console.log(JSON.stringify(  app.stubs.data.elements   , null, 2 ));
							
							app.methods.unloadToDoQueue();
							

							app.stubs.data.canvas.curPaperShape = app.stubs.curPaperShape;
							app.stubs.data.isTemplate = app.stubs.isTemplate;
							
							for( var idx in app.stubs.collections.guides.models){
								var model = app.stubs.collections.guides.models[idx],
										json = model.get('json');
								app.stubs.data.guides.push(json);
							}
							
							if( isSocial ) app.stubs.share.needNewOriginalFileImage = true;

							app.stubs.data.share = app.stubs.share;
							
							app.stubs.data.version = 'v1-1-25-216';
							
							app.stubs.data.os = tools.whatIs();
							
							app.stubs.data.width = app.stubs.curCanvasSize.width;
							
							app.stubs.data.height = app.stubs.curCanvasSize.height;
							
							app.stubs.data.parentFolderId = app.stubs.parentFolderId;
							
							app.stubs.data.fileTitle = app.stubs.fileTitle;
							
						},
						
						save: function( callback, savehow) {
							
							if( app.stubs.collections.elements.length == 0  ||
									app.stubs.collections.elements.length == app.methods.countHowManyDisabledElements()
							){
								app.methods.shakeNo($(this));
								toast('There is nothing on the canvas.')
								return;
							}
							
							if( app.stubs.recentlySaved && 
									serverhost != 'localhost' &&
									savehow == 'justSave' 
							){
								app.methods.shakeNo($(this));
								toast('Everything has already been saved.', 'note')
								return;
							}
							
							var controller = 'index.php/app/',
									url = ( serverhost == 'localhost' ? controller + 'save_local': controller + 'save');

							var obj = {
										data: app.stubs.data,
										google_id: app.stubs.google_id,
										fileId: savehow == 'spotify' ? 'spotify' : app.stubs.fileId
									};
									
							if( savehow == 'spotify' ) {
								obj['width'] = parseInt(app.stubs.spot.frame.width);
								obj['height'] = parseInt(app.stubs.spot.frame.height);
								obj.data.spot = app.stubs.spot;
							} else{
								obj['width'] = app.stubs.curCanvasSize.width;
								obj['height'] = app.stubs.curCanvasSize.height;
							}

							obj[savehow] = 'true';
							
							if(app.stubs.data.isTemplate ) {
								obj['isTemplate'] = 'true';
							}									
							
							if( app.stubs.data.isTemplate || savehow == 'asTemplate' ) {
								delete obj.data.share;
							}
							
							if( typeof( app.stubs.temp_image_id ) != 'undefined'){
									obj.data.temp_image_id = app.stubs.temp_image_id;
							};
							
							if( typeof( app.stubs.quickSaveCount ) != 'undefined'){
									obj.data.quickSaveCount = app.stubs.quickSaveCount;
							};							

							
							var exportIt = function( url, obj, callback, savehow ) {
								
								app.data.export.ready = true;
								
								/*
									app.data.export.numWithRichtext = 0;
									app.data.export.numWithRichtextThatHasHtmlAsPng = 0;								
								*/

								tools.ajax(url, obj, 'post', function( data ) {
									
									app.methods.progressBar.stop('exportit ');
									
									if( tools.inArray( savehow, ['generateSharePic', 'copy', 'justSave', 'print', 'publish', 'renderAsPng', 'asTemplate'])									) {
	
										if(typeof( data.fileId) != 'undefined'){
											
											console.log('New app.stubs.fileId is set');
											app.stubs.recentlySaved = true;
											window.onbeforeunload = app.methods.cleanUpOnExit										
											
											app.stubs.fileId = data.fileId;
											
											app.stubs.temp_image_id = data.temp_image_id;
											app.stubs.quickSaveCount = data.quickSaveCount;
											if( typeof( data.base64 ) != 'undefined') {
												app.stubs.tempImageBase64 = data.base64;
												
												var buffer = 10,
														height = ( data.height > tools.getScreenDim().height ? tools.getScreenDim().height - 100 : data.height),
														ratio = height /  data.height * data.width;
												
												$('#imgPic').attr('src', app.settings.base64Prefix + data.base64);

												$('#imgPic').height(height).width( ratio);
												$('#imgBubble').width(ratio + buffer).height(height + 3);
												
											} else{
												app.stubs.tempImageBase64 = undefined;
											}
											
											tools.cookies.setCookie('active_id', data.fileId, tools.cookies.expires);
											if( window.newSerial != 'false' ) tools.cookies.setCookie('newSerial',  window.newSerial);
											
											app.stubs.PDFId = undefined;
											
										} 
	
										
									} else{
										
										console.log('rendered Spotify or shared pic.. not resetting fileId');
										
									}
									
									if(  typeof( callback ) != 'undefined' ){
											callback( data );
									};
									
									
									
									
								});										
							};
							
							exportIt( url, obj, callback, savehow );

						}
					}
				};

				this.activatePlugins = function() {
					
					$.fn.getStyleObject	=	function(){	 //	http://stackoverflow.com/questions/1004475/jquery-css-plugin-that-returns-computed-style-of-element-to-pseudo-clone-that-el/1020560#1020560
							var	dom	=	this.get(0);
							var	style;
							var	returns	=	{};
							if(window.getComputedStyle){
									var	camelize = function(a,b){
											return b.toUpperCase();
									}
									style	=	window.getComputedStyle(dom, null);
									for(var	i=0;i<style.length;i++){
											var	prop = style[i];
											var	camel	=	prop.replace(/\-([a-z])/g, camelize);
											var	val	=	style.getPropertyValue(prop);
											returns[camel] = val;
									}
									return returns;
							}
							if(dom.currentStyle){
									style	=	dom.currentStyle;
									for(var	prop in	style){
											returns[prop]	=	style[prop];
									}
									return returns;
							}
							return this.css();
					}
					// work
					$.material.init(); 
					$('#my-modal').on('show.bs.modal', function (event) {
					  var button = $(event.relatedTarget) // Button that triggered the modal
					  var recipient = button.data('whatever') // Extract info from data-* attributes
					})
					
					
					if(serverhost != 'localhost'){
						$('#main').on("contextmenu",function(e){
				        e.preventDefault();
				    });
					}

					/* offline.js */

	        Offline.options = {checks: {xhr: {url: '/connection-test'}}};
	
	        Offline.on('confirmed-down', function () {
							app.methods.progressBar.stop('offline');
							saidConnectionOk = false;
							app.stubs.saving = false;		
							app.stubs.offline = true;
	        		toast('Your internet connection is down.', 'keep', 5000, 'error', 'Something went wrong.');
	        });
	
	        Offline.on('confirmed-up', function () {
	        	app.stubs.offline = false;
	        	if(!saidConnectionOk) {
	        		toast('Your internet connection is now back online.', 'keep', 5000, 'success', 'Whew.');
	        		saidConnectionOk = true;
	        	}
	        });

					// PREVENTS BACK BUTTON EVENT
					if(typeof( Windows) != 'undefined') {  // UWP version
						history.pushState(null, null, document.URL);
						window.addEventListener('popstate', function () {
						    history.pushState(null, null, document.URL);
						});
						return;
					}
					
					$('[data-toggle="tooltip"]').tooltip({
						placement: function (tooltip, el) {
							
								
							
						    window.setTimeout(function () {
						    	
						    	$('.tooltip').removeClass('show');
/*						    	
						    	console.log($(el).attr('id'));
						    	console.log( $(el).width());
						    	console.log( $(el).offset().left);
						    	console.log($(tooltip).width());
						    	console.log($(el).width()/2);
						    	*/
						        $(tooltip)
						            .addClass('bottom')
						            .offset({	left:	$(el).offset().left + $(el).width()/2 - $(tooltip).width()/2})
						            .css({top: 45});
						            
						        if( $(el).attr('id') == 'myaccountli'){
						         	$(tooltip).offset({	left:	($(el).offset().left + $(el).width()/2 - $(tooltip).width()/2) - 10})
						        };
						
						        $(tooltip).addClass('in show');
						        
						        $(el).bind('mouseleave', function() {
						        	$(this).unbind('mouseleave');
						        	$(tooltip).removeClass('show');
						        })
						        
						    }, 50);
						}
					});
					
					
					$('#canvas-wrapper, #canvas').bind('mouseover', function() {
	        	$('.tooltip').removeClass('show');
	        })
					

				};

			};
				
	}();

	var	p	=	App.prototype;

	var app = new App();
	
	app.menu.left.cards = {
		'text':{
			id: 'text-card',
			title: 'Text',
			iconSrc: 'img/md-png/24/ic_format_color_text_24.png',
			subcards: [
				{
					id: 'headers-subcard',
					title: 'Header',
					collection: 'headers',
					thumbtype: 'rectangle small'
				},
				{
					id: 'paragraphs-subcard',
					title: 'Paragraph',
					collection: 'richtext',
					thumbtype: 'rectangle small'
				}
			]
		},
		'lines':{
			id: 'lines-card',
			title: 'Lines',
			iconSrc: 'img/md-png/24/ic_call_made_24.png',
			subcards: [{
					id: 'lines-dynamic-subcard',
					title: 'Dynamic',
					collection: 'dynolines',
					thumbtype: 'rectangle small'
				},{
					id: 'lines-straight-subcard',
					title: 'Straight',
					collection: 'shapeone',
					thumbtype: 'square small'
				},{
					id: 'lines-angle-subcard',
					title: 'Angle',
					collection: 'shapetwo',
					thumbtype: 'square small'
				},{
					id: 'lines-bracket-subcard',
					title: 'Bracket',
					collection: 'shapethree',
					thumbtype: 'square small'
				}/*,
				{
					id: 'lines-zag-subcard',
					title: 'Zag',
					collection: 'zagLines',
					thumbtype: 'square small'
				}*/
			]
		},
		'elements':{
			id: 'elements-card',
			title: 'Elements',
			iconSrc: 'img/md-png/24/ic_attachment_24.png',
			subcards: [{
					id: 'elements-shapes-subcard',
					title: 'Frames',
					collection: 'shapefour',
					thumbtype: 'square small',
					/*hasTags: true,*/
					externalSearch: ''
				},
				{
					id: 'elements-background-subcard',
					title: 'Shapes',
					collection: 'polygon',
					thumbtype: 'square small',
					externalSearch: ''
				},{
					id: 'elements-mask-subcard',
					title: 'Mask',
					collection: 'mask',
					thumbtype: 'square small',
					/*hasTags: true,*/
					externalSearch: ''
				}

			]
		},
		'svgshapes':{ // working
			id: 'svgshapes-card',
			title: 'SVG',
			iconSrc: 'img/md-png/24/ic_favorite_outline_24.png',
			subcards: [{
					id: 'svgshapes_basic-subcard',
					title: 'Basic Shapes',
					collection: 'svgshapes_basic',
					thumbtype: 'square small',
					externalSearch: ''
				},{
					id: 'svgshapes_symbol-subcard',
					title: 'Symbols',
					collection: 'svgshapes_symbol',
					thumbtype: 'square small',
					externalSearch: ''
				},{
					id: 'svgshapes_arrows-subcard',
					title: 'Arrows',
					collection: 'svgshapes_arrows',
					thumbtype: 'square small',
					externalSearch: ''
				},{
					id: 'svgshapes_business-subcard',
					title: 'Business and Education',
					collection: 'svgshapes_business',
					thumbtype: 'square small',
					externalSearch: ''
				}/*,{
					id: 'svgshapes_flowchart-subcard',
					title: 'Flowchart',
					collection: 'svgshapes_flowchart',
					thumbtype: 'square small',
					externalSearch: ''
				}*/,{
					id: 'svgshapes_speech-subcard',
					title: 'Speech Bubbles',
					collection: 'svgshapes_speech',
					thumbtype: 'square small',
					externalSearch: ''
				},{
					id: 'svgshapes_music-subcard',
					title: 'Music',
					collection: 'svgshapes_music',
					thumbtype: 'square small',
					externalSearch: ''
				},{
					id: 'svgshapes_social-subcard',
					title: 'Social and Web',
					collection: 'svgshapes_social',
					thumbtype: 'square small',
					externalSearch: ''
				},{
					id: 'svgshapes_nature-subcard',
					title: 'Nature',
					collection: 'svgshapes_nature',
					thumbtype: 'square small',
					externalSearch: ''
				}
			]
		},
		'graphics':{
			id: 'graphics-card',
			title: 'Graphics',
			iconSrc: 'img/md-png/24/ic_color_lens_24.png',
			subcards: [
				{
					id: 'elements-arrows-subcard',
					title: 'Arrows',
					collection: 'arrows',
					thumbtype: 'square medium',
					externalSearch: ''
				},
				{
					id: 'elements-background-subcard',
					title: 'Backgrounds',
					collection: 'backgrounds',
					thumbtype: 'rectangle small',
					externalSearch: ''
				},
				{
					id: 'elements-banners-subcard',
					title: 'Banners',
					collection: 'banners',
					thumbtype: 'rectangle medium',
					externalSearch: ''
				},
				{
					id: 'elements-borders-subcard',
					title: 'Borders',
					collection: 'borders',
					thumbtype: 'square medium',
					externalSearch: ''
				},
				{
					id: 'elements-speech-subcard',
					title: 'Speech Bubble',
					collection: 'speech',
					thumbtype: 'square medium',
					externalSearch: ''
				},
				{
					id: 'graphics-icons-subcard',
					title: 'Icons',
					collection: 'icons',
					thumbtype: 'square small',
					/*hasTags: true,*/
					externalSearch: ''
				},
				{
					id: 'graphics-clipart-subcard',
					title: 'Clip Art',
					collection: 'clipart',
					thumbtype: 'square medium',
					hasTags: true,
					externalSearch: 'openclipart-search'
				},
				{
					id: 'graphics-vectorart-subcard',
					title: 'Vectors',
					collection: 'vectors',
					thumbtype: 'square medium',
					hasTags: true,
					externalSearch: 'pixabay-search'
				},
				{
					id: 'graphics-photos-subcard',
					title: 'Photos and Images',
					collection: 'photos',
					thumbtype: 'square medium',
					hasTags: true,
					externalSearch: 'pixabay-search'
				}/*,
				{
					id: 'graphics-photos-subcard',
					title: 'Pexels',
					collection: 'photos',
					thumbtype: 'square medium',
					hasTags: true,
					externalSearch: 'pexels-search'
				}*/
			]
		},
		'web':{
			id: 'web-card',
			title: 'Web',
			iconSrc: 'img/md-png/24/ic_public_24.png',
			subcards: [{
					id: 'web-web-subcard',
					title: 'Web',
					collection: 'web',
					thumbtype: 'square medium'
				},
				{
					id: 'graphics-googledrive-subcard',
					title: 'Google Drive',
					collection: 'googledrive',
					thumbtype: 'square medium',
					/*hasTags: true,*/
					externalSearch: ''
				}
			]
		},
		'charts':{
			id: 'chart-card',
			title: 'Charts',
			iconSrc: 'img/md-png/24/ic_line_chart_24.png',
			subcards: [{
					id: 'pie-chart-subcard',
					title: 'Pie',
					collection: 'pies',
					thumbtype: 'rectangle large'
				},
				{
					id: 'bar-chart-subcard',
					title: 'Bar',
					collection: 'bars',
					thumbtype: 'rectangle large'
				},
				{
					id: 'columns-chart-subcard',
					title: 'Columns',
					collection: 'columns',
					thumbtype: 'rectangle large'
				},
				{
					id: 'line-chart-subcard',
					title: 'Line',
					collection: 'lines',
					thumbtype: 'rectangle large'
				},
				{
					id: 'scatter-chart-subcard',
					title: 'Scatter',
					collection: 'scatter',
					thumbtype: 'rectangle large'
				},
				{
					id: 'Stepped-chart-subcard',
					title: 'Stepped',
					collection: 'stepped',
					thumbtype: 'rectangle large'
				},
				{
					id: 'Area-chart-subcard',
					title: 'Area',
					collection: 'area',
					thumbtype: 'rectangle large'
				}
			]
		}
	};
	
	var os = tools.whatIs();
	if( os.browser == 'Firefox' || tools.detectIE()){
		delete app.menu.left.cards.elements.subcards[1];
		delete app.menu.left.cards.elements.subcards[2];
	}
	
/*	
if( typeof( Windows) != 'undefined' && !pow ){
		delete app.menu.left.cards.svgshapes;
}
*/	

	app.menu.left.getData.getMiscCollection = function() {
								
		var that = this,
				url = 'json/left/misc.json?version=' + version,
				addToCollection = function( collection,  obj ) {
					
					var thisCollection = app.stubs.collections.graphics[collection] = 
								( typeof( app.stubs.collections.graphics[collection]) == 'undefined' ? 
								new collections.GraphicsCollection(): 
								app.stubs.collections.graphics[collection]);
								
					var model = new models.GraphicModel();
					
					if( app.methods.hasFont(collection) || collection == 'numbers'){
						
						if(  collection == 'headers'){
							
							model.set('json', tools.deepCopy(obj.json) ); 
							model.set('html', obj.json.data.html);
							
							thisCollection.add(model);
							
							return;		
							
						} else if( collection == 'richtext'){
							
							model.set('json', tools.deepCopy(obj.json) );
							
							model.set('textedit_content', obj.textedit_content);
							model.set('textedit_style', obj.textedit_style);
							model.set('data', obj.textedit_style);
							var data = $.parseJSON( obj.data);
							model.set('data', data);		
							model.set('html', obj.html);
							
							thisCollection.add(model);
							
							return;																
							
						} else{
							
							//model.set('json', obj.json); // CORRECT
							model.set('json', tools.deepCopy(obj.json) );
							
							model.set('textedit_content', obj.textedit_content);
							model.set('textedit_style', obj.textedit_style);
							model.set('data', obj.textedit_style);
							var data = $.parseJSON( obj.data);
							model.set('data', data);		
							
							if( typeof( obj.json.data ) != 'undefined'){
								model.set('html', obj.json.data.html);
							}else{
								model.set('html', obj.html);
							};
							
							thisCollection.add(model);
							return;									
													
							
						};
						

							
					}
					
					if(collection == 'dynolines'){
						
						var json = $.parseJSON( obj.json);
						model.set('kinds', json.kinds);
					}
					
					if( app.methods.hasWidget(collection)){
						model.set('widget', obj.name);
					}
					
					if(collection == 'web'  && obj.name == 'Submit Url'){
						$('#imageDownloadByUrlButton').attr('cid', model.cid);
					};
										
					if(collection == 'straights'){
						
						if( typeof(obj.json.style.line ) != 'undefined'){
							
							model.set('json', obj.json); // CORRECT
							
							var lineStyleObj = obj.json.style.line,
									lineStyleStr = '';
									
							for( var key in lineStyleObj){
								var value = lineStyleObj[key];
								
								lineStyleStr += key + ': ' + value + ';'
							}
							
							lineStyleStr += 'margin-top: 40px;';
							
							model.set('html', '\
								<div style="' + lineStyleStr + '"></div>\
							');													
						}

						thisCollection.add(model);
								
						return;
					};

					
					if(tools.inArray( collection, app.settings.hasShapes)){

						if( typeof(obj.json.style.shape ) != 'undefined'){
							
							model.set('json', obj.json); // CORRECT
							
							var shapeStyleObj = obj.json.style.shape,
									shapeStyleStr = '';
									
							for( var key in shapeStyleObj){
								
								var value = shapeStyleObj[key];
								
								if( !obj.json.data.aspectratio && key == 'height'){
									value = '80%';
									shapeStyleStr += 'margin-top: 7px;';
								}
								
								shapeStyleStr += key + ': ' + value + ';'
							}
							
							if( collection == 'mask' && obj.json.data.whereglow == 'outter'){
								shapeStyleStr +=  "-webkit-mask-image: -webkit-radial-gradient(50% 50%, ellipse cover, rgba(255, 255, 255, 0.9) 0%, rgba(0, 0, 0, 0) 100%);";
							};

							var showSide = obj.json.data.show;
							
							for( var side in showSide){
										
								var isTrue = showSide[side];
			
								if( typeof( isTrue) == 'string' && isTrue === 'true' ||
										typeof( isTrue) == 'boolean' && isTrue
								){
									shapeStyleStr += 'border-' +  side + '-width: ' + obj.json.data['border-width'] +'px;';	
									shapeStyleStr += 'border-' +  side + '-style: ' + 'solid;';
									shapeStyleStr += 'border-' +  side + '-style: ' + obj.json.data['border-style'] + ';';	
								}
									
							};
							
							model.set('html', '\
								<div style="' + shapeStyleStr + '"></div>\
							');													
						}

						if( typeof(obj.html  ) != 'undefined'){
							
							var svgStyleObj = obj.json.style.svg,
									svgStyleStr = '';
									
							for( var key in svgStyleObj){
								var value = svgStyleObj[key];
								svgStyleStr += key + ': ' + value + ';'
							}
							
							model.set('html', obj.html + '<style>polygon.triangle{' + svgStyleStr +  '}</style>' );													
						}
						
						thisCollection.add(model);
								
						return;
					};												
					
					if( tools.inArray( collection, app.settings.charts )){
						
						model.set('json', obj.json);  // CORRECT
						model.set('version', obj.version);
						
						app.methods.widgets.charts.getLeftMenuThumb( collection, obj, function( src ) {
							
								model.set('html', '<img src="' +  src + '"/>');
								thisCollection.add(model);
								
						});
						
						return;
					};
					
					model.set('html', obj.html);
					thisCollection.add(model);
					
				};
		
		tools.ajax(url, {}, 'get', function( data) {

			for( var num in data){
				
				var obj = data[num];
				
				if(typeof( obj.collection ) != 'undefined'){
					// console.log(obj.collection);
					addToCollection( obj.collection, obj);
				}
				
			}
		})
	}
	
	app.methods.generateJsonFromGraphicModel = function(collection, dropLeft, dropTop, random, cid) {

		app.stubs.adaptedPercentage = parseInt(app.stubs.curCanvasSize.width) / parseInt(app.settings.paperSizes.letter.portrait.width);

		if(random){
			var graphicModel = app.stubs.collections.graphics[collection].models[tools.randomIntFromInterval(0, 0)];
			var graphicModel = app.stubs.collections.graphics[collection].models[0];
		} else{
			var graphicModel = app.stubs.collections.graphics[collection].get(cid);
		}
		
		var dataObj = graphicModel.attributes;
		
		var getHeaderBaseJson = function(dataObj) {
					
					var json = {
								style:{
										element: {
											left: dropLeft + 'px',
											top: dropTop + 'px'
										},
										textedit: tools.deepCopy(dataObj.json.style.textedit),
										resizeWrapper:{}
									
								},
								data: tools.deepCopy(dataObj.json.data),
								collection: collection
							}
					
					json.style.textedit['font-size'] = dataObj.json.data['font-size'] * app.stubs.adaptedPercentage + 'px';
					json.style.textedit['letter-spacing'] = '0px';
					json.data.textshadow = 0;
					// EDIT
/*					
//json.style.textedit['text-shadow'] = '-1px -1px 0 red, 1px -1px 0 orange, -1px 1px 0 green, 1px 1px 0 blue'
//json.style.textedit['color'] = '#FFFFFF';
					
json.style.textedit['-webkit-text-fill-color'] = '#FFFFFF';
json.style.textedit['-webkit-text-stroke-width'] = '1px';
json.style.textedit['-webkit-text-stroke-color'] = '#000000';
*/

					return json;


				},
				getParagraphJson = function(dataObj){
					var str = dataObj.textedit_style,
							textEditStyleObj = $.parseJSON( str),
							json = {
										style:{
												element: {
													left: dropLeft + 'px',
													top: dropTop + 'px',
													width: '600px'
												},
												resizeWrapper:{
													border: textEditStyleObj.border,
												},
												textedit: {
													'font-family': 'Roboto',
													'color': '#000000',
													'background-color': 'transparent',
													'letter-spacing': '0px',
													'word-spacing': '0px',
													'text-align': 'left',
													'font-size': 30 * app.stubs.adaptedPercentage + "px",
													'line-height': "123%",
	               					'opacity': 1,
	               					'text-transform': 'none'
												},
										},
										data:{
											text: 'Lorem ipsum dolor sit amet, sonetdiscere alienum ei sea. Ad prisoluta omittantur.',
											lines: ["Lorem ipsum dolor sit", "amet, sonetdiscere", "alienum ei sea. Ad", "prisoluta omittantur."],
											fontname: 'roboto',
											rotation: 0,
											textshadow: 0
										},
										collection: collection
									};
					return json;	
					// HERE
				},
				getLinesJson = function(dataObj) {

							var json = {
												data:{
													html: dataObj.html,
													rotation: 0
												},
												collection: collection,
												style: {
														element: {
															left: dropLeft + 'px',
															top: dropTop + 'px',
															width: 275 * app.stubs.adaptedPercentage + 'px',
															height: 275 * app.stubs.adaptedPercentage + 'px'
														},
														resizeWrapper:{},
														line:{
															'border-color': 'black'
														}																
												}
									};
									
						return json;
				};

		
		if(tools.inArray( collection, app.settings.pixabayCollections) || collection == 'clipart'){
				
			var droppedWidth = app.stubs.curCanvasSize.width  / 2,
					droppedHeight = (app.stubs.curCanvasSize.width / dataObj.previewWidth * dataObj.previewHeight) / 2;
			

			var json = {
						style:{
								element: {
									left: dropLeft + 'px',
									top: dropTop + 'px',
									width: droppedWidth + 'px',
									height: droppedHeight + 'px'
								},
								resizeWrapper:{},
								image: {
	                'border-width': '0px',
	                'border-color': '#000000',
	                'border-style': 'solid',
	                'border-radius': '0%',
	                opacity: 1
								}							
						},
						data:{
							imgSrc: dataObj.previewURL,
							picserver: dataObj,
							rotation: 0,
      				shadow: 0,
      				mirror: 1,
							blur: 0,
							grayscale: 0
						},
						collection: collection
					};
					
		}
		
		if(tools.inArray( collection, app.settings.charts)){
			
			var width = dataObj.json.data.resolution.width * app.stubs.adaptedPercentage + 'px',
					height = dataObj.json.data.resolution.height * app.stubs.adaptedPercentage + 'px';
			
			var json = {
						style:{
								element: {
									left: dropLeft + 'px',
									top: dropTop + 'px',
									width: width +'px',
									height: height + 'px'
								},
								resizeWrapper:{}
						},
						data:{
							rotation: 0,
							charts: {}
						},
						collection:  collection,
						version: dataObj.version,
						widget: dataObj.widget
					};
					
			json.data =	$.extend(	true, json.data,	dataObj.json.data);
			
			json.data.charts.options.width = width;		
			json.data.charts.options.height = height;

		}
			
		switch(	collection ){

			case 'borders':{
				
				var droppedWidth = app.stubs.curCanvasSize.width,
						droppedHeight = app.stubs.curCanvasSize.width / dataObj.json.data.width * dataObj.json.data.height
				
				var json = {
										style:{
												element: {
													left: '0px',
													top: ((app.stubs.curCanvasSize.height - droppedHeight)/2  * scale) + 'px',
													width: droppedWidth + 'px',
													height: droppedHeight + 'px'
												},
												resizeWrapper:{},
												image: {
					                'border-width': '0px',
					                'opacity': 1,
					                'border-color': '#000000',
					                'border-style': 'solid',
												}							
										},
										data:{
											imgSrc: dataObj.imgSrc,
											rotation: 0,
      								shadow: 0,
      								mirror: 1,
      								blur: 0,
      								grayscale: 0
										},
										collection: collection
									};
									
				if( app.stubs.curCanvasSize.width > app.stubs.curCanvasSize.height &&
						dataObj.json.data.width < dataObj.json.data.height
				){
					
					var droppedWidth = app.stubs.curCanvasSize.height / dataObj.json.data.height * dataObj.json.data.width,
							droppedHeight = app.stubs.curCanvasSize.height;
					
					json.style.element.left = ((app.stubs.curCanvasSize.width - droppedWidth)/2  * scale) + 'px';
					json.style.element.top = '0px';
					json.style.element.width = droppedWidth + 'px';
					json.style.element.height = droppedHeight + 'px';
						
				};
				
				break;
			}
			
			case 'speech':
			case 'banners':
			case 'arrows': {
				
				var droppedWidth = app.stubs.curCanvasSize.width  / 2,
						droppedHeight = (app.stubs.curCanvasSize.width / dataObj.json.data.width * dataObj.json.data.height) / 2;
				
				var json = {
										style:{
												element: {
													left: dropLeft + 'px',
													top: dropTop + 'px',
													width: droppedWidth + 'px',
													height: droppedHeight + 'px'
												},
												resizeWrapper:{},
												image: {
					                'border-width': '0px',
					                'opacity': 1,
					                'border-color': '#000000',
					                'border-style': 'solid',
												}							
										},
										data:{
											imgSrc: dataObj.imgSrc,
											rotation: 0,
      								shadow: 0,
      								mirror: 1,
      								blur: 0,
      								grayscale: 0
										},
										collection: collection
									};
				break;
			}

			case 'icons': {
				var json = {
										style:{
												element: {
													left: dropLeft + 'px',
													top: dropTop + 'px',
													width: 150 * app.stubs.adaptedPercentage + 'px',
													height: 150 * app.stubs.adaptedPercentage + 'px'
												},
												resizeWrapper:{},
												image: {
					                'border-width': '0px',
					                'opacity': 1,
					                'border-color': '#000000',
					                'border-style': 'solid',
	                				'border-radius': '0%'
												}							
										},
										data:{
											imgSrc: dataObj.imgSrc,
											rotation: 0,
      								shadow: 0,
      								mirror: 1,
      								blur: 0,
      								grayscale: 0
										},
										collection: collection
									};
				break;
			}
	
			case 'headers': {
				
				var json = getHeaderBaseJson(dataObj);
				break;
			}
			
			case 'numbers': {
				
				var json = getHeaderBaseJson(dataObj),
						color = ( json.data.class.indexOf('dark') ? 'black': 'white' );
				
				json.style.textedit['font-family'] = 'Roboto';
				json.style.textedit['font-size'] = 50 * app.stubs.adaptedPercentage + 'px';
				
				json.style.textedit['color'] = color;
				json.style.texteditWrapper = {
						'border-width': '2px',
						'border-color': color
				};
				
				if( !json.data.class.indexOf('dark')) {
					json.style.texteditWrapper.background = 'black';
					json.style.texteditWrapper['border-color'] = 'black';
					json.data.isReverse = true;
				}
				
				break;
			}					
			
			case 'paragraphs': {

				var json = getParagraphJson(dataObj);
									
				break;
			}
			
			case 'richtext': {
				var json = getParagraphJson(dataObj);
				json.widget = 'Rich Text';
				json.style.element.width =  600 * app.stubs.adaptedPercentage + 'px';
				json.data.text = dataObj.html,
				delete json.data.lines;
				break;
			}
			
			case 'dynolines': {
				
//				console.log(JSON.stringify( dataObj));
				
				var str = dataObj.kinds,
						kindsArr = str.split(','),
						initialWidth = 300,
						boxCoord =	{
							box1:{
								x: dropLeft * multiple,
								y: dropTop * multiple
							},
							box2:{
								x: dropLeft * multiple + initialWidth,
								y: dropTop * multiple
							}
						};

				var json = {
										data:{
											coordinates: boxCoord,
											kinds: kindsArr
										},
										collection: collection,
										style: {
												element: {},
												line:{
													'border-color': 'black'	
												}
										}
									};

				break;
			}									
			
			case 'angleLines': {

				var json = getLinesJson(dataObj);

				break;
			}		
			
			case 'zagLines': {

				var json = getLinesJson(dataObj);
				json.data.midLine = 50;
				break;
			}									
			
			case 'web': {
				
				var width = 150 * app.stubs.adaptedPercentage + 'px',
						height = 150 * app.stubs.adaptedPercentage + 'px';
				
				var json = {
										style:{
												element: {
													left: dropLeft + 'px',
													top: dropTop + 'px',
													width: width + 'px',
													height: height + 'px'
												},
												resizeWrapper:{},
												image: {
					                'border-width': '0px',
					                'border-color': '#000000',
					                'border-style': 'solid',
	                				'border-radius': '0%',
					                opacity: 1
												}							
										},
										data:{
											imgSrc: 'https://lorempixel.com/' + width + '/' +  height +'/',
											rotation: 0,
      								shadow: 0,
      								mirror: 1,
      								blur: 0,
      								grayscale: 0
										},
										collection: 'web',
										widget: dataObj.widget
									};

				break;
			}
			
			case 'straights': {
				
				var json = {
							data:{
								name: dataObj.json.data.name,
								rotation: 0
							},
							collection: 'straights'
						};
						
				dropTop = dropTop + 40;
									
				json.style = tools.deepCopy(dataObj.json.style);
				json.style.element.left = dropLeft + 'px';
				json.style.element.top = dropTop + 'px';
				json.style.element.width =  parseInt(json.style.element.width) * app.stubs.adaptedPercentage + 'px';
				json.style.element.height =  parseInt(json.style.element.height) * app.stubs.adaptedPercentage + 'px';
				json.style.resizeWrapper = {};

				break;
				
			}

			case 'polygon': 
			case 'mask': 
			case 'shapeone': 	
			case 'shapetwo': 	
			case 'shapefour': 	
			case 'shapethree': {	

				var json = {
										data:{
											name: dataObj.json.data.name,
											aspectratio: tools.deepCopy(dataObj.json.data.aspectratio),
											rotation: 0,
											shadow: tools.deepCopy(dataObj.json.data.shadow),
											show: tools.deepCopy(dataObj.json.data.show),
											'border-width': tools.deepCopy(dataObj.json.data['border-width']),
											'border-style': tools.deepCopy(dataObj.json.data['border-style']),
											glow: dataObj.json.data.glow,
											'whereglow': tools.deepCopy(dataObj.json.data.whereglow)
										},
										collection: collection
									};
									
				json.style = tools.deepCopy(dataObj.json.style);
				json.style.element.left = dropLeft + 'px';
				json.style.element.top = dropTop + 'px';
				json.style.element.width =  parseInt(json.style.element.width) * app.stubs.adaptedPercentage + 'px';
				json.style.element.height =  parseInt(json.style.element.height) * app.stubs.adaptedPercentage + 'px';
				json.style.resizeWrapper = {};
				
				json.style.shape['border-radius'] =  parseInt(json.style.shape['border-radius']) * app.stubs.adaptedPercentage + 'px';

				break;
				
			}
			
			case 'backgrounds': {
				
				var json = { collection: collection };
									
				json.style = tools.deepCopy(dataObj.json.style);
				json.style.element.left = '0px';
				json.style.element.top = '0px';
				
				json.style.element.width =  app.stubs.curCanvasSize.width + 'px';
				json.style.element.height =  app.stubs.curCanvasSize.height * .1 + 'px';

				json.style.resizeWrapper = {};
				
				json.style['background']['border-radius'] = '0px';
				json.style['background']['border-width'] = '0px';
				json.style['background']['border-color'] = '#000000';
				json.style['background']['border-style'] = 'solid';

				json.data = tools.deepCopy(dataObj.json.data);
				
				json.data.shadow = 0;
				
				break;
				
			}
			
			case 'googledrive': {
				
				var width = dataObj.width * app.stubs.adaptedPercentage + 'px',
						height = dataObj.height * app.stubs.adaptedPercentage + 'px';
						
				var droppedWidth = app.stubs.curCanvasSize.width  / 2,
						droppedHeight = (app.stubs.curCanvasSize.width / dataObj.width * dataObj.height) / 2;
				
				
				var json = {
										style:{
												element: {
													left: dropLeft + 'px',
													top: dropTop + 'px',
													width: droppedWidth + 'px',
													height: droppedHeight + 'px'
												},
												resizeWrapper:{},
												image: {
					                'border-width': '0px',
					                opacity: 1,
					                'border-color': '#000000',
					                'border-style': 'solid',
												}							
										},
										data:{
											imgSrc: dataObj.thumbnailLink,
											rotation: 0,
											fileId: dataObj.fileId,
      								shadow: 0,
      								blur: 0,
      								grayscale: 0
										},
										collection: 'googledrive',
										widget: dataObj.widget
									};

				break;
			}
				
		}
		
		if( tools.inArray( collection, app.settings.hasSvgshapes) ){ // working drop
			
			var json = {
						style:{
								element: {
									left: dropLeft + 'px',
									top: dropTop + 'px',
									width: 300 * app.stubs.adaptedPercentage + 'px',
									height: 300 * app.stubs.adaptedPercentage + 'px'
								},
								resizeWrapper:{},
								svgshape: {
									fill: ( typeof( dataObj["json"]["style"]["svg"]['fill']) != 'undefined' ? dataObj["json"]["style"]["svg"]['fill']: '#000000'),
									'stroke-width': ( typeof( dataObj["json"]["style"]["svg"]['stroke-width']) != 'undefined' ? dataObj["json"]["style"]["svg"]['stroke-width']: '1px'),
									stroke: '#000000',
	                opacity: 1,
									width: 300 * app.stubs.adaptedPercentage + 'px',
									height: 300 * app.stubs.adaptedPercentage + 'px'
	                
								}							
						},
						data:{ 
							file: dataObj.file,
							rotation: 0,
							mirror: 1,
							svgshadow: 0,
							aspectratio: ( typeof( dataObj["json"]["data"]["aspectratio"]) != 'undefined' ? dataObj["json"]["data"]["aspectratio"] : false),
							new: true
						},
						collection: collection
			};
			
		}
		
		if( collection != 'dynolines' ){
			for(var	idx	in app.settings.keysInLayout){
				json.style.resizeWrapper[app.settings.keysInLayout[idx] + 'transform'] = 'rotate(0deg)';
				json.style.element[app.settings.keysInLayout[idx] + 'transform'] = 'rotate(0deg) scaleX(1)';
			}
			
			json.data.mirror = 1;			
			
		}

		return json;
							
	};