views.elements.Numbers = views.elements.Numbers.extend( shared.numbers );,				

				Numbers: TextHeaderView.extend({
					
					editBoxComponents: ['colors', 'layers' ,'lock', 'align'],
					
					bindEditHandle: function() {
						
						this.bindHandles.edit = function() {
							
							var that = this;
								
							this.$el.unbind('click').on('click', '.custom-handle.edit-handle', 
							
								function(event) {
									
									editbox.view = that;
									
									editbox.whenEditClicked(event);
									
									editbox.methods.fonts.label( that );
									
									editbox.methods.colors['one'].label( that );
									
									editbox.methods.text.label( that );
									
									editbox.methods.layers.setIdxForThisElement();
									
		
									return false;
									
								}
							);
											
						}
		
					},

					setRootTextEdit: function() {
						
						this.texteditStyle = this.model.get('json').style.textedit;
						this.texteditData = this.model.get('json').data;
						this.$textEdit = this.$resizeWrapper.find('.textedit');
						this.$texteditWrapper = this.$resizeWrapper.find('.textedit-wrapper');
						this.isReverse = this.model.get('json').data.isReverse;
					},
					
					custom: function() {
						
						var that = this;
						
						this.bindEditHandle();
						this.edit();
						this.setRootTextEdit();
						
						
						this.setSizeForResizeWrapper();						
						this.setResizeOptions();
		
		
						this.drag();
						
						this.resize.init.call( this );
						
						this.rotateIt = new RotateIt();
						this.rotateIt.init( this.$resizeWrapper );
						
						if( typeof( this.model.get('json').data.needFreshPNG ) == 'undefined') {
							this.model.get('json').data.needFreshPNG = true;
						}
						
						if( this.model.get('json').data.needFreshPNG == 'false' ) {
							this.model.get('json').data.needFreshPNG = false;
						}
						
						this.click();		
					},
					
					setCustomTemplateObj: function() {
						
						var json = this.model.get('json'),
								texteditStyle = '',
								texteditWrapperStyle = '';
								
						for( var key in json.style.textedit){
							var value = json.style.textedit[key];
							texteditStyle += key + ': ' + value + ';'
						}
						
						texteditStyle += 'width: 100%; height: 100%';
						
						this.templateObj['texteditStyle'] = texteditStyle;
						
						for( var key in json.style.texteditWrapper){
							var value = json.style.texteditWrapper[key];
							texteditWrapperStyle += key + ': ' + value + ';'
						}
						
						this.templateObj['texteditWrapperStyle'] = texteditWrapperStyle;		
						
						this.templateObj['text'] = json.data.text;
						
						var str = json.data.class,
								classArr = str.split(','),
								classStr = '';
						
								
						for( var idx in classArr){
							classStr += ' ' +classArr[idx];
						}
										
						this.templateObj['texteditWrapperClass'] = classStr;
						
					},	
									
					setSizeForResizeWrapper: function() {
						
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
		
						this.resizeWrapperWidth = dim.width;
						this.resizeWrapperHeight = dim.height;
						
						this.model.get('json').style.element.width = dim.width * multiple + 'px';
						this.model.get('json').style.element.height = dim.height * multiple + 'px';
						
					},

					textFitWord_depreciated: function() {

						var that = this;
						
						setTimeout(function(){
							
							textFit(that.$textEdit[0], {
								maxFontSize: 99999999,
								alignHoriz: false, 
								alignVert: false,
								multiLine: false, 
								detectMultiLine: true
							});
							
							var $textFitted = that.$textEdit.find('.textFitted'),
									content = $textFitted.text(),
									len = content.length,
									obj = {
										1: {
											'shrink': 1,
											'line-height': '1.42857143'	
										},
										2: {
											'shrink': 1,
											'line-height': '1.42857143'	
										}
										,
										33: {
											'shrink': .75,
											'line-height': '1.85'	
										}	
									};
							
							
							var cssStyle  = {
								'font-size': obj[len].shrink * parseFloat($textFitted.css('font-size')) + 'px',
								'line-height': obj[len]['line-height']
							};
							
							//that.$textEdit.css(cssStyle).text(content);
							that.$textEdit.css(cssStyle).text(content);
							
							that.model.get('json').style.textedit['font-size'] = parseFloat(that.$textEdit.css('font-size')) * multiple + 'px';
							that.model.get('json').style.textedit['line-height'] =  obj[len]['line-height'];
							
						}, 0);
					
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
								
						this.origNumber = contentText;
								
						this.$el.addClass('editing');		
						 		 
						this.$textEdit.html('')
						.addClass('active')
						.append('<textarea id="theTextarea">' + contentText + '</textarea>')
						.unbind('dblclick')
						.unbind('click');
		
						this.$el.removeClass('see-handles');
						
						this.adaptStyle('font-size', 'px');
						
						var $theTextarea = $('#theTextarea');
						
						$theTextarea.select().on('click', function(event) {
							event.stopPropagation();
						});
						
					},
					
					leaveEditText: function() {
						
					 	var that = this,
					 			content	=	$('#theTextarea').val(),
					 			len = content.length;
					 			
						if( len > 2 ){
							$('#bar').text('bad');
							content = this.origNumber;
						};
					 			
						$('#theTextarea').remove();				
						this.$textEdit.text(content).removeClass('active');
						this.$el.removeClass('editing');
						
						this.$textEdit.dblclick(function(event)	{
							that.whenTextIsDblclicked(event);
							return false;
						});
						
						this.model.get('json').data.text = content;
						
						this.model.get('json').data.needFreshPNG = true;
						
						setTimeout(function(){
							app.stubs.viewBeingEdited = undefined;
							saveHistory('leaveEditText');							
						}, 500);

						
					},
					
					maybeChangeBorderWidth: function(realWidth) {
						var oneO = '1px',
								twoP = '2px',
								widthCss = ( realWidth < 21  ? oneO	: twoP);
						this.$texteditWrapper.css({
							'border-width': widthCss
						});
						this.$textEdit.css({
							'left': widthCss,
							'top': widthCss
						});
						
						$('#bar').html( 'realWidth: ' + realWidth + '<br>'
							+ 'border-width: ' + widthCss + '<br>'
						);
						
						this.model.get('json').style.texteditWrapper['border-width'] = widthCss;
						this.model.get('json').style.textedit['left'] = widthCss;
						this.model.get('json').style.textedit['top'] = widthCss;
						

					},
			
					setResizeOptions: function() {
						
						var that = this,
								startWidth;
						
						this.resize.options.aspectRatio = 1;
											
						this.resize.options.start = function() {
							
							startWidth = $(this).width();
							
							if( app.methods.isDynamicAlign() ) {
								that.boundingboxElement =  that.getBoundingBox();
								app.methods.alignToGuide.buildArray.init.call( app.methods.alignToGuide, that.cid);
							}
							app.methods.clearActive(['editBox', 'hideColorPicker'], 'include', 'resize start for headers');
						};
				
						this.resize.options.resize = function( event, ui ) {
							that.rotateIt.centerRotateHandle();
							that.resizeToGuide( ui );
							
							var newWidth = ui.size.width;
							that.maybeChangeBorderWidth(newWidth * multiple);
							
							var percentScaled =  $(this).width() / startWidth;
							
							that.$textEdit.css('font-size', percentScaled *  scale *  parseFloat(that.model.get('json').style.textedit['font-size'])  + 'px')
							
							//that.textFitWord();
						};

						this.resize.options.stop = function(event, ui) {
							
							that.rotateIt.centerRotateHandle();
							
							that.resizeToGuide( ui );
							
							if( app.methods.isDynamicAlign() ) app.methods.alignToGuide.hideIt();
							
							that.model.get('json').style.textedit['font-size'] = multiple * parseFloat( that.$textEdit.css('font-size') ) + 'px';
					
							//that.textFitWord();
		
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
							
							that.maybeChangeBorderWidth(newWidth * multiple);
							
							saveHistory('header resize');
						
						};				
					},
		
					templates:{
			
						numbers: '\
									<div id="<%= id %>" class="elements noselect" collection="<%= collection %>" style="<%= elementStyle %>">\
										<div  class="resize-wrapper" style="<%= typeof(resizeStyle)!== "undefined" ?  resizeStyle : "" %>">\
											<div  class="textedit-wrapper <%= texteditWrapperClass %>" style="<%= texteditWrapperStyle %>">\
												<div  class="textedit" style="<%= texteditStyle %>"><%= text %></div>\
											</div>\
											<div  class="custom-handle rotate-handle"></div>\
											<div  class="custom-handle zoom-handle"></div>\
											<div  class="custom-handle delete-handle"></div>\
											<div  class="custom-handle edit-handle"></div>\
											<div  class="custom-handle clone-handle"></div>\
										</div>\
									</div>\
								'
					},
					
					setColor: function( color, saveToUsed)	{
						
						if( !this.isReverse ){
							editbox.view.$textEdit.css('color', color);
							editbox.view.model.get('json').style.textedit.color = color;
							
							editbox.view.$texteditWrapper.css('border-color', color);
							editbox.view.model.get('json').style.texteditWrapper['border-color'] = color;	
	
						} else{

							editbox.view.$textEdit.css('color', 'white');
							editbox.view.$texteditWrapper.css('border-color', color);
							editbox.view.$texteditWrapper.css('background', color);
							editbox.view.model.get('json').style.texteditWrapper.background = color;
							editbox.view.model.get('json').style.texteditWrapper['border-color'] = color;	
							
						}
						
						if( saveToUsed ) saveHistory('editbox numbers color change');	
	
					},
			
					reColor: function() {
						
						var json = this.model.get('json');
						
						if( !this.isReverse ){
							
							this.$el.find('.textedit').css({
								'color': json.style.textedit.color	
							});
							this.$texteditWrapper.css('border-color', json.style.texteditWrapper['border-color']);
							
						} else{
							
							this.$texteditWrapper.css('background', json.style.texteditWrapper.background );
							
						}						

					},
					
					setLabel: function() {
						
						if( !this.isReverse ){
						
							var color = this.model.get('json').style.textedit.color;
									
						} else{
							
							var color = this.model.get('json').style.texteditWrapper.background;

						}
									
						$('#color-sample').css({
							'background': color	
						});	
					}
				})