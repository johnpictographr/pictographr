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
,
				
				AngleLines: LineBase.extend({

					templates:{
			
						angleLines: '\
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
						this.$angle = this.$resizeWrapper.find('.angle');
						this.$angle.css('border-color', this.model.get('json').style.line['border-color']);
						this.scaleLine();
					}					
				}),
				
				Straights: ImageBase.extend({
					templates:{
						straights: '\
									<div id="<%= id %>" class="elements noselect"  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="line" style="<%= typeof(lineStyle)!== "undefined" ?  lineStyle : "" %>"></div>\
										</div>\
									</div>\
							'
					},
					scaleCustom: function( customScale ) {
						
						var adjustedScale = ( typeof( customScale) != 'undefined' ? customScale: scale),
								borderWidth = parseFloat(this.model.get('json').style.line['border-top-width']) * adjustedScale;
						
						if( borderWidth < 1) borderWidth = 1;
						this.$line.css('border-top-width', borderWidth + 'px');
						
					}
				})


,				
,
				
				AngleLines: LinesView.extend({

					custom: function() {
						
						var that = this;
						
						this.config();
						
						this.$angle.css('border-color', this.model.get('json').style.line['border-color']);
						
						this.scaleLine();
					},					

					templates:{
			
						angleLines: '\
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
					
					scaleCustom: function() {
						this.scaleLine();
						this.scaleClipArtDivWrapper();
					},		
								
					scaleLine: function() {
						
						var that = this,
								borderWidth = ( 1 * scale >= 1 ? 1 * scale : 1);
						
						this.$clipartDiv.css('border-width', borderWidth + 'px');

					},

				
					scaleClipArtDivWrapper: function() {
						
						var $wrapper = $('#clipart-div-wrapper'),
								top = 15 * scale,
								left = 15  * scale,
								bottom = 15 * scale,
								right = 15 * scale;
								
						$wrapper.css({
							'left': left + 'px',
							'top': top + 'px',
							'bottom': bottom + 'px',
							'right': right + 'px'
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
			
					getPseudoProp: function( which, property, $dom){
						return window.getComputedStyle(
										$dom[0], ':'+ which
									).getPropertyValue(property);
					},
					
				})				
				Straights: ImageView.extend({
					
					scaleCustom: function( customScale ) {
						
						var adjustedScale = ( typeof( customScale) != 'undefined' ? customScale: scale),
								borderWidth = parseFloat(this.model.get('json').style.line['border-top-width']) * adjustedScale;
						
						if( borderWidth < 1) borderWidth = 1;
						this.$line.css('border-top-width', borderWidth + 'px');
						
					},
										
					setLabel: function() {
						
						var borderColor = this.model.get('json').style.line['border-top-color'].toUpperCase(),
								transparentUrl = 'url(' + 'img/transparent.png)';
									
						$('#color-sample').css({
							'background-color': borderColor	
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
					},
					
					bindEditHandle: function() {
						
						this.bindHandles.edit = function() {
							
							var that = this;
								
							this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
							
								function(event) {
									
									editbox.view = that;
									
									editbox.whenEditClicked(event);
									
									that.setLabel();
									editbox.methods.customBorder.label( that );
									editbox.methods.opacity.label( that );
									
									editbox.methods.layers.setIdxForThisElement();
		
									return false;
									
								}
							);
											
						}
		
					},
					
					editBoxComponents: ['colors', 'layers' ,'lock', 'customborders', 'opacity'],
			
					custom: function() {
		
						var that = this;
						
						this.bindEditHandle();
						
						this.setSizeForResizeWrapper();
						
						this.resize.options.aspectRatio = false;
						
						this.resize.options.handles =  'e, w';

						this.resize.options.start = function(event, ui) {
							
							if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
							app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for straight lines');
							
						};
						
						this.resize.options.resize = function(event, ui) {

							that.resizeToGuide( ui );
										
						};
						
						this.resize.options.stop = function(event, ui) {
							
							that.resizeToGuide( ui );
							
							if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();

							var newWidth = ui.size.width,
									newHeight = ui.size.height,
									newLeft = parseFloat(that.$el.css('left')) + ui.position.left,
									newTop = parseFloat(that.$el.css('top')) + ui.position.top;
		
							that.resizeWrapperWidth = newWidth  * app.stubs.zoom.multiple;
							that.resizeWrapperHeight = newHeight * app.stubs.zoom.multiple;
		
							that.model.get('json').style.element.width = newWidth * app.stubs.zoom.multiple + 'px';
							that.model.get('json').style.element.height = newHeight * app.stubs.zoom.multiple + 'px';
							that.model.get('json').style.element.left = newLeft * app.stubs.zoom.multiple + 'px';
							that.model.get('json').style.element.top = newTop * app.stubs.zoom.multiple + 'px';
							
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
							
							saveHistory('straight resize');
							
						};
						
						this.drag();
						
						this.resize.init.call( this );
						
						this.rotateIt = new RotateIt();
						this.rotateIt.init( this.$resizeWrapper );
						
						this.click();
						
						this.scaleCustom();
						
					},
					
					templates:{
						straights: '\
									<div id="<%= id %>" class="elements noselect"  collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="line" style="<%= typeof(lineStyle)!== "undefined" ?  lineStyle : "" %>"></div>\
											<div  class="custom-handle rotate-handle">&nbsp;</div>\
											<div  class="custom-handle delete-handle">&nbsp;</div>\
											<div  class="custom-handle edit-handle">&nbsp;</div>\
											<div  class="custom-handle clone-handle">&nbsp;</div>\
										</div>\
									</div>\
							'
					}
					
				})