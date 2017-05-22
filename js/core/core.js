	var models = {
		GraphicModel:	Backbone.Model.extend(),
		TagModel:	Backbone.Model.extend(),
		ElementModel:	Backbone.Model.extend({
			initialize: function(options) {
				this.addOptions(options);
			},
			addOptions:	function(options) {
				this.options = options;
				for( var key in	options ){
					this[key]	=	options[key];
				}
			}
		}),
		GuideModel:	Backbone.Model.extend()
	};
		
	var TagsCollection =	Backbone.Collection.extend({
			model: models.GraphicModel,			
	    comparator: function(item) {
	        return item.get('tag');
	    	}			
	})


	var BackView = Backbone.View.extend({
		initialize: function(options) {
			this.addOptions(options);
		},
		
		addOptions:	function(options) {
			this.options = options;
			for( var key in	options ){
				this[key]	=	options[key];
			}
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
			str += ( this.getPseudoProp(which, 'left', $dom) != 'auto'  ? 'left: ' + left + 'px !important;' : '' );
			str += ( this.getPseudoProp(which, 'right', $dom) != 'auto'  ? 'right: ' + right + 'px !important;' : '' );
			
			
//			console.log('---------');
//			console.log('right:' + this.getPseudoProp(which, 'right', $dom));
//			console.log('which: ' + which);
//			console.log($dom);
//			console.log(this.getPseudoProp(which, 'content', $dom));
//			console.log(str);

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
		
		fillLockedContainer: function() { 

			if(typeof( this.model.get('json').data.isLocked) != 'undefined'){
				app.stubs.locked.push(this.model.cid);
				this.$el.draggable( 'disable' );
				//editbox.methods.lock.cloneElementToLockedContainer( this.model )
			}
			
		}
			
	});	
	
	var ElementBase = BackView.extend({
	
		initialize: function(options) {
			
			this.addOptions(options);
			this.setUp();
			
			this.setTemplateObj();
			
			if( typeof(this.setCustomTemplateObj) != 'undefined') this.setCustomTemplateObj();
			this.render();

		},
		
		render: function() {
			this.html = _.template( this.templates[this.useTemplate], this.templateObj);
		},
		
		setUp: function() {
						
				this.collection = this.model.get('json').collection;
				
				if(tools.inArray( this.collection, app.settings.areImages)){
				
					this.useTemplate = 'images';
					
				} else if( tools.inArray( this.collection, ['icons'])) {
				
					this.useTemplate = 'icons';
					
				} else {
					this.useTemplate = this.collection;
				}
				
				this.templateObj = {
					id: this.model.cid,
					collection: this.collection
				};
			
		},

		setTemplateObj: function() {
			
				app.methods.doTempateObjFor.call( this, 'elementStyle', 'element');
				app.methods.doTempateObjFor.call( this, 'imageStyle', 'image');
				
				if( typeof(this.model.get('json').style.resizeWrapper) != 'undefined'){
					app.methods.doTempateObjFor.call( this, 'resizeStyle', 'resizeWrapper');
				}
				 
				if( this.collection == 'headers' || 
						this.collection == 'paragraphs' || 
						this.collection == 'richtext'  || 
						this.collection == 'numbers' 
				){
					this.templateObj['textedit_content'] = this.model.get('json').data.text;
				}
				 
				if( tools.inArray( this.collection, app.settings.hasShapes)){
					app.methods.doTempateObjFor.call( this, 'shapeStyle', 'shape');
				}
				
				if( this.collection == 'straights' ){
					app.methods.doTempateObjFor.call( this, 'lineStyle', 'line');
				}
					
				if( typeof(this.model.get('json').justDropped) != 'undefined' ) delete this.model.get('json').justDropped
		},
		
		setEl: function() {

			this.$el = $('#' + this.model.cid);
			this.cid = this.model.cid;
			this.$resizeWrapper = this.$el.find('.resize-wrapper');
			this.$clipartDiv = this.$resizeWrapper.find('.clipartDiv');
			this.$img = this.$el.find('img');
			this.$shape = this.$el.find('.shape');
			this.$background = this.$el.find('.background');
			this.$panel = this.$el.closest('.panels');
			this.collection = this.model.get('json').collection;
			this.$shape = this.$el.find('.shape');
			this.$line = this.$el.find('.line');
			this.$textEdit = this.$resizeWrapper.find('.textedit');
			this.$angle = this.$resizeWrapper.find('.angle');

		},

		getHtml: function() {
			return this.html;
		},
		
		resizeWrapperWidth: 0,
		resizeWrapperHeight: 0,
		
		setRotation_deprec: function() {
			
			console.log('test');
			
			var rotation = parseFloat(this.model.get('json').data.rotation),
					mirror = ( typeof( this.model.get('json').data.mirror ) != 'undefined' ? this.model.get('json').data.mirror: 1);
			
			for(var	idx	in app.settings.keysInLayout){
				this.$resizeWrapper.css(app.settings.keysInLayout[idx]  + 'transform' , 'rotate(' + rotation	+	'deg)'  + ' ' +  'scaleX(' + mirror + ')');
			}
		},
		
		renderChartHi: function( callback ) {

			var that = this,
					json = tools.deepCopy(this.model.get('json')),
					widget = app.methods.widgets.charts,
					formated = widget.formatDataForCharts(json.data.preData);

			var data = ( typeof( json.data.whichside ) != 'undefined' ? widget.injectColorsToChartdata( formated.data, json.data.colorsInChart, json.data.whichside): formated.data);

			var enlargeBy = 4;
					
			json.data.charts.options.width *= enlargeBy;		
			json.data.charts.options.height *= enlargeBy;		
			json.data.resolution.width *= enlargeBy;	
			json.data.resolution.height *= enlargeBy;	
			
			if( typeof( json.data.charts.options.pieSliceTextStyle ) != 'undefined') json.data.charts.options.pieSliceTextStyle.fontSize *= enlargeBy;
			if( typeof( json.data.charts.options.legend.textStyle ) != 'undefined') json.data.charts.options.legend.textStyle.fontSize *= enlargeBy;
			if( typeof( json.data.charts.options.chartArea ) != 'undefined') json.data.charts.options.chartArea.left *= enlargeBy;
			if( typeof( json.data.charts.options.chartArea ) != 'undefined') json.data.charts.options.chartArea.top *= enlargeBy;
			if( typeof( json.data.charts.options.titleTextStyle ) != 'undefined') json.data.charts.options.titleTextStyle.fontSize *= enlargeBy;
			if( typeof( json.data.charts.options.vAxis ) != 'undefined') json.data.charts.options.vAxis.textStyle.fontSize *= enlargeBy;
			if( typeof( json.data.charts.options.vAxis ) != 'undefined') json.data.charts.options.vAxis.titleTextStyle.fontSize *= enlargeBy;
			if( typeof( json.data.charts.options.hAxis ) != 'undefined') json.data.charts.options.hAxis.textStyle.fontSize *= enlargeBy;
			if( typeof( json.data.charts.options.hAxis ) != 'undefined') json.data.charts.options.hAxis.titleTextStyle.fontSize *= enlargeBy;

	    widget.render(json.collection, data, json.data.resolution, json.data.charts.options, function(src){
	    	
	    	console.log('rendering chart hi');
      	var baseArray  = src.split(',');
      	that.model.get('json').data.base64 = baseArray[1];  
      	
			});
		},
						
		renderChart: function() {

			var that = this,
					json = this.model.get('json'),
					widget = app.methods.widgets.charts,
					formated = widget.formatDataForCharts(json.data.preData);

			var data = ( typeof( json.data.whichside ) != 'undefined' ? widget.injectColorsToChartdata( formated.data, json.data.colorsInChart, json.data.whichside): formated.data);

	    widget.render(json.collection, data, json.data.resolution, json.data.charts.options, function(src){
      	
        that.$el.find('img').attr('src', src);
        
			});
		},
			
		changeWithGroupyAsResizeStart: function() {	

		},
		
		changeWithGroupyAsResize: function(obj) {
			
			var that = this,
					preceivedPercentScaled = obj.percentScaled * scale;
			
			var left = parseFloat(this.model.get('json').style.element.left),
					top = parseFloat(this.model.get('json').style.element.top),
					width = parseFloat(this.model.get('json').style.element.width),
					height = parseFloat(this.model.get('json').style.element.height),
					leftScaled = left  * scale,
					topScaled = top * scale;
					
			var elementLeft = ((leftScaled - obj.groupyLeft)  * obj.percentScaled);
			var elementTop = ((topScaled - obj.groupyTop)  * obj.percentScaled);
			
//			console.log('obj.groupyTop: ' + obj.groupyTop);
//			console.log('top: ' + top);
//			console.log('topScaled: ' + topScaled);
//			console.log('elementTop: ' + elementTop);
//			console.log('percentScaled: ' + obj.percentScaled);
//			console.log('----------------');

			this.$el.css({
				left: obj.groupyLeft + elementLeft + 'px',
				top: obj.groupyTop + elementTop + 'px',
				width: (width * obj.percentScaled) + 'px',
				height: (height * obj.percentScaled) + 'px',	
			});
			
			if( typeof( this.model.get('json').style.image) != 'undefined' && 
					this.model.get('json').style.image['border-width'] != '0px'){
				this.$el.find('img').css({
					'border-width': parseFloat(this.model.get('json').style.image['border-width']) * preceivedPercentScaled + 'px'
				});
			};

			if(  tools.inArray( this.collection, app.settings.hasShapes)){

				var resizedRadius = parseFloat(this.model.get('json').style.shape['border-radius']) * obj.percentScaled;
				this.$el.find('.shape').css({
					'border-radius': resizedRadius * scale + 'px'
				});
				
				if( this.model.get('json').data.show.top || this.model.get('json').data.show.top  == 'true') this.$el.find('.shape').css({'border-top-width': this.model.get('json').data['border-width'] * preceivedPercentScaled + 'px'});
				if( this.model.get('json').data.show.bottom || this.model.get('json').data.show.bottom  == 'true') this.$el.find('.shape').css({'border-bottom-width': this.model.get('json').data['border-width'] * preceivedPercentScaled + 'px'});
				if( this.model.get('json').data.show.left || this.model.get('json').data.show.left  == 'true') this.$el.find('.shape').css({'border-left-width': this.model.get('json').data['border-width'] * preceivedPercentScaled + 'px'});
				if( this.model.get('json').data.show.right || this.model.get('json').data.show.right  == 'true') this.$el.find('.shape').css({'border-right-width':this.model.get('json').data['border-width'] * preceivedPercentScaled + 'px'});
				
			};

			var newWidth = width * preceivedPercentScaled,
					newHeight = height * preceivedPercentScaled;

			if(  tools.inArray( this.collection, app.settings.hasSvgshapes)  ) {   // working groupy resize

					this.$svgshape.css({
						width: newWidth + 'px',
						height: newHeight + 'px'
					});
			}
						
			if(  tools.inArray( this.model.get('json').collection, ['headers', 'numbers'])){
				this.$textEdit.css('font-size', parseFloat( this.model.get('json').style.textedit['font-size'])   * preceivedPercentScaled  + 'px' ) ;
				this.$textEdit.css('letter-spacing', parseFloat( this.model.get('json').style.textedit['letter-spacing'])   * preceivedPercentScaled  + 'px' ) ;
				this.$textEdit.width(newWidth);
				this.$textEdit.height(newHeight);
			};			
			
			
			this.$el.width(newWidth);
			this.$el.height(newHeight);

			this.$resizeWrapper.width(newWidth);
			this.$resizeWrapper.height(newHeight);
			
		},
		
		changeWithGroupyResizeStop: function(obj) {

			var width = parseFloat(this.$el.css('width')),
					height = parseFloat(this.$el.css('height'))  ;
			
			this.model.get('json').style.element.left = parseFloat(this.$el.css('left')) * multiple + 'px';
			this.model.get('json').style.element.top =  parseFloat(this.$el.css('top')) * multiple + 'px';
			this.model.get('json').style.element.width =  width   * multiple + 'px';
			this.model.get('json').style.element.height = height  * multiple + 'px';

			if( typeof( this.model.get('json').style.image) != 'undefined' && this.model.get('json').style.image['border-width'] != '0px'){
				
				this.model.get('json').style.image['border-width'] = parseFloat(this.$el.find('img').css('border-width'))  * multiple + 'px';
				
			};
			
			if(  tools.inArray( this.collection, app.settings.hasShapes)){
				
				var resizedRadius = parseFloat(this.model.get('json').style.shape['border-radius']) * obj.percentScaled
				this.$el.find('.shape').css({
					'border-radius': resizedRadius * scale + 'px'
				});
				this.model.get('json').style.shape['border-radius'] = resizedRadius + 'px';

				var that = this,
						changeShape = function( side ) {
					
							if( that.model.get('json').data.show[side] || that.model.get('json').data.show[side]  == 'true') {
								
								var newBorderWidth = parseFloat(that.$el.find('.shape').css('border-' + side + '-width'))  * multiple;
								
								that.model.get('json').data['border-width'] = newBorderWidth;
								
								that.model.get('json').style.shape['border-' + side + '-width'] = newBorderWidth + 'px';
								
							} 
						}
				
				shapeArr = ['top', 'bottom', 'left', 'right'];
				
				for( var idx in shapeArr ){
					changeShape(shapeArr[idx]);
				};

			};	

			if(   tools.inArray( this.collection, app.settings.hasSvgshapes)  ) {  // working groupy resise

					this.$svgshape.css({
						width: width+ 'px',
						height: height + 'px'
					});
					
			}
			
			if( tools.inArray( this.model.get('json').collection, ['headers', 'numbers'])){
				this.model.get('json').style.textedit['font-size'] = multiple * parseFloat( this.$textEdit.css('font-size') ) + 'px';
				this.model.get('json').style.textedit['letter-spacing'] = multiple * parseFloat( this.$textEdit.css('letter-spacing') ) + 'px';
				this.redoAspectRatioAndSize('changeWithGroupyResizeStop');
				if( this.model.get('json').collection == 'headers') this.model.get('json').data.needFreshPNG = true;
				
			};	
			
			if( tools.inArray( this.model.get('json').collection, ['richtext'])){
				
				this.$textEdit.css('font-size', parseFloat(this.model.get('json').style.textedit['font-size'] ) * obj.percentScaled  * scale+ 'px')
				this.$textEdit.html(this.model.get('json').data.text);
				this.model.get('json').style.textedit['font-size'] = parseFloat(this.model.get('json').style.textedit['font-size'] ) * obj.percentScaled + 'px';
				var usequeue = true;
				this.adaptHeightToTextedit('adaptHeightToTextedit from groupy resizing stop');
				this.renderPngFromTextedit('groupy stop rich text', undefined, usequeue);
				
			};
						
			
			
			if( typeof( this.rotateIt ) != 'undefined' ) {
				this.rotateIt.centerRotateHandle();
			}
			
			
		},
		
		scale: function() {
			
			if( typeof( this.model.get('json') ) == 'undefined' ) return;
			
			var that = this,
					left = parseFloat(this.model.get('json').style.element.left),
					top = parseFloat(this.model.get('json').style.element.top),
					width = parseFloat(this.model.get('json').style.element.width),
					height = parseFloat(this.model.get('json').style.element.height);
					
			this.$el.css({
				left: (left * scale) + 'px',
				top: (top * scale) + 'px',
				width: (width * scale) + 'px',
				height: (height * scale) + 'px',	
			});
			
			this.storeOffset();
			
			var newWidth = width * scale,
					newHeight = height * scale;

			this.$resizeWrapper.width(newWidth);
			this.$resizeWrapper.height(newHeight);
			
			if( typeof( this.scaleCustom) != 'undefined') {
				this.scaleCustom();
			}
			
				
				if( tools.detectEdge() ) { // edge hack
					var that = this;
					that.$el.css('visibility', 'hidden');
					
					setTimeout(function(){
				    
						that.$el.css('visibility', 'visible');
													
					}, 1);

				}
	
			
		},

		storeOffset: function()	{
			
			this.$el.data('offSetLeft',	this.$el.offset().left  + app.stubs.mainScrolledRight);
			this.$el.data('offSetTop',	this.$el.offset().top + app.stubs.mainScrolledDown);
		},
			
		resizeWrapperWidth: 0,
		resizeWrapperHeight: 0
		
	});	

	var DynoBase = BackView.extend({

		setTemplateObj: function() {
			
				this.templateObj = {
					id: this.model.cid,
					collection: this.collection
				};
									
				app.methods.doTempateObjFor.call( this, 'elementStyle', 'element');
			
		},

		createHTML:	{
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
						elementStyle: this.templateObj.elementStyle,
						classString: this.classString,
						collection: this.collection,
						handlesLeft: this.createHTML.templates.handlesLeft,
						handlesRight: this.createHTML.templates.handlesRight
					});

				this.html = html;
				
			},
			
			templates:	{
				elements:'\
					<div   id="<%= id %>"  collection="<%= collection %>"  style="<%= elementStyle %>"  class="elements dynoline"	>\
						<div where="left" class="box"></div>\
						<div where="right"  class="box"></div>\
						<div class="line <%= classString %>"><%= handlesLeft %><%= handlesRight %></div>\
					</div>\
				',
				handlesLeft:	'\
				<div class="custom-handle delete-handle left"></div>\
				<div class="custom-handle clone-handle left"></div>\
				<div class="custom-handle edit-handle left"></div>\
				',
				handlesRight:	'\
				<div class="custom-handle delete-handle right"></div>\
				<div class="custom-handle clone-handle right"></div>\
				<div class="custom-handle edit-handle right"></div>\
				'
			}
		},	
		classString: '',

		colorLine: function() {
			
			// pseudo handled in createPseudoForStyleFor method
			this.$line.css('background-color', this.model.get('json').style.line['border-color']);
			this.$line.css('border-color', this.model.get('json').style.line['border-color']);
			
		},
		setPosition: function()	{

			this.$el.css('left', this.coordinates.box1.x * scale + 'px');
			this.$el.css('top',	this.coordinates.box1.y * scale + 'px');
			
			if( typeof(this.$boxes.data('dim')) == 'undefined' ){
				this.$boxes.data('dim', {
					width:  parseInt(window.getComputedStyle( this.$boxes[0]).getPropertyValue('width')),
					height:	parseInt(window.getComputedStyle( this.$boxes[0]).getPropertyValue('height'))
				});
			}

			//console.log(app.stubs.adaptedPercentage);
			
			var w1 = this.$boxes.data('dim').width * scale;
			var w2 = this.$boxes.data('dim').width * app.stubs.adaptedPercentage * scale;
			
/*			
			var diff = 0; //w1 - w2;
			var halfDiff = 0; //diff / 2;
			
			console.log(diff);
			console.log(halfDiff);
			*/
			
			this.$boxes.css({
				width: (this.$boxes.data('dim').width * scale)  + 'px',
				height:	(this.$boxes.data('dim').height * scale)   + 'px'
			});

			this.$box1.css('left', '0px');
			this.$box1.css('top',	'0px');
			this.$box2.css('left', (this.coordinates.box2.x  * scale	-	this.coordinates.box1.x * scale ) + 'px');
			this.$box2.css('top',	(this.coordinates.box2.y * scale - this.coordinates.box1.y * scale ) + 'px');

		},
		renderLine:	function() {
			
			var	x1 = this.$box1.offset().left	+	this.centerOffset * scale;
			var	x2 = this.$box2.offset().left	+	this.centerOffset * scale;
			var	y1 = this.$box1.offset().top + this.centerOffset * scale;
			var	y2 = this.$box2.offset().top + this.centerOffset * scale;
			

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

			var	rotateString = 'rotate(' + angle + 'deg)';

			var that = this;

			this.$line.queue(function(){
				$(this).offset({top: y1, left: x1});
				$(this).dequeue();
				
			}).queue(function(){
				$(this).width(hypotenuse);
				$(this).dequeue();
				
			}).queue(function(){
				for( var idx in	app.settings.keysInLayout){
					$(this).css(app.settings.keysInLayout[idx] + 'transform', rotateString);
				}
				$(this).dequeue();
			});

		},

		getHtml: function() {
			return this.html;
		},
		setEl: function() {
			
			this.$el = $('#' + this.model.cid);
			this.cid = this.model.cid;
			this.$boxes = this.$el.find('.box'),
			this.$box1 = $(this.$el.find('.box')[0]);
			this.$box2 = $(this.$el.find('.box')[1]);
			this.$line = $(this.$el.find('.line')[0]);
			this.centerOffset	=	(this.$box1.width()/2);
			this.collection = this.model.get('json').collection;
			
		},
		scale: function() {
			this.scaleLine();
			this.setPosition();
			this.renderLine();
			this.renderLine();
			this.storeOffset();
		},
		scaleLine: function() {
			
			var that = this;
			this.$el.find('style').remove();						
			this.createPseudoForStyleFor('before', this.$line);
			this.createPseudoForStyleFor('after', this.$line);
			
			this.$line.addClass('line_' + this.model.cid);
			
			if( typeof(this.$line.data('height')) == 'undefined' ){
				this.$line.data('height', parseFloat(window.getComputedStyle( this.$el.find('.line')[0]).getPropertyValue('height')));
			}
			
			var height = this.$line.data('height');
			
			this.$line.css('width', this.$el.width() * scale + 'px');
			
			var scaledHeight = ( 1 * scale >= 1 ? 1 * scale : 1);
			
//			this.$line.css('height', scaledHeight + 'px');


			if( typeof( isRead ) != 'undefined'){
				this.$line.css('height', '2px');
			}else{
				this.$line.css('height', '1px');
			};
			
			
			var borderWidth = ( 1 * scale >= .5 ? 1 * scale : .5);
			
//			this.$line.css('border-width', borderWidth + 'px');
			
			this.$line.css('border-width', '0px');
			
			setTimeout(function(){
				that.setHandlePositions();
			}, 50);
			
			
		},
		storeOffset: function() {
			
			this.$el.data('offSetLeft',	this.$el.offset().left  + app.stubs.mainScrolledRight);
			this.$el.data('offSetTop',	this.$el.offset().top + app.stubs.mainScrolledDown);
			
		},
		angle: null,
		lineWidth: null,

	});

	var PanelBase = BackView.extend({
		setEl: function() {
			this.$el = $('#panel_' + this.id);
			this.$panelWrapper = this.$el.parent();
		},
		render: function() {
			var html = _.template( this.template, this.options);
			$('#canvas').append(html);
			this.setEl();
		}
	})
	
	var shared = {
		
		numbers:{ 
			
			scale: function() {
						
				var left = parseFloat(this.model.get('json').style.element.left),
						top = parseFloat(this.model.get('json').style.element.top);
						
				this.$el.css({
					left: (left * scale) + 'px',
					top: (top * scale) + 'px'	
				});
				
				this.storeOffset();
				
				this.adaptStyle('font-size', 'px');
				
				var dim = this.getWidthOfTextAreaWithContent();
				
				dim.width = dim.height;
				var newWidth = dim.width,
						newHeight  = dim.height;
				
				this.$el.width(newWidth).height(newHeight);
				this.$resizeWrapper.width(newWidth).height(newHeight);
										
		}},
		
		paragraph: {
			
			scaleCustom: function() {
	
				this.adaptStyle( 'font-size', 'px');
				this.adaptStyle( 'letter-spacing', 'px' );
				this.adaptStyle( 'word-spacing', 'px' );	
				
			}
			
		},
		
		richtext: {
					
			scaleCustom: function() {
				
				var that = this;
				
				this.adaptStyle( 'font-size', 'px');
				this.adaptStyle( 'letter-spacing', 'px' );
				this.adaptStyle( 'word-spacing', 'px' );

				var defaultMarginBottom = 10,
						defaultPaddingLeft = 40;
						
				this.adaptListCSS('margin-bottom', defaultMarginBottom);
				
				this.adaptUL();
				var fontSize = parseFloat(this.$textEdit.css('font-size'));

				
			},
									
			adaptListCSS: function( styleKey, setValue) {
					var newValue = app.stubs.zoom.scale * setValue;
					this.$textEdit.find('ul').css(styleKey, newValue + 'px');
					this.$textEdit.find('ol').css(styleKey, newValue + 'px');
			},

			setCustomTemplateObj: function() {
				
				app.methods.doTempateObjFor.call( this, 'texteditStyle', 'textedit');

				if( typeof( this.model.get('json').data.htmlAsPng) != 'undefined' ){
					this.templateObj['textedit_content'] =  '\
						<img src="' + this.model.get('json').data.htmlAsPng + '"/>\
					';
				} else{
					
					this.templateObj['textedit_content'] =  this.model.get('json').data.text;

				}

			}	
		},
		
		head:{

			getWidthOfTextAreaWithContent: function() {
				
				var textvalue = ( $('#theTextarea').text().length > 0 ? $('#theTextarea').val(): this.$textEdit.text()),
						numCharactersInText = ( $('#theTextarea').text().length > 0 ? $('#theTextarea').val().length: this.$textEdit.text().length),
						fontSize = parseFloat(this.$textEdit.css('font-size')),
						fontFamily = this.$textEdit[0].style.fontFamily,
						fontStyle = this.$textEdit[0].style.fontStyle,
						textTransform = this.$textEdit[0].style.textTransform;
						
				if( fontFamily == '') fontFamily = $('body').css('font-family');
						
				var dim  = this.measureText(textvalue, fontSize, fontFamily, textTransform, fontStyle);
				
				dim.perChar = this.widestChar(fontSize, fontFamily);
				
				dim.numCharactersInText = numCharactersInText;
				
				if( typeof( this.model.get('json').style.textedit['letter-spacing'] ) != 'undefined'  && 
					parseInt(this.model.get('json').style.textedit['letter-spacing']) != 0
				) {
					
					var buffer = ( fontStyle == 'italic' ? 10: 5);
					//var buffer = 8;
					var letterspacing = dim['letter-spacing'] = parseFloat(this.model.get('json').style.textedit['letter-spacing']);
					dim.width += letterspacing * scale * (numCharactersInText - 1) + buffer;
				}
				
				//console.log( 'textvalue: ' + textvalue + ' - ' + JSON.stringify( dim    , null, 2 ));
				
				return dim;
			},
			
			measureText: function(textvalue, fontSizeIs, fontFamily, textTransform, fontStyle) {
				
				textvalue = tools.trimFrontAndBackOf(textvalue);
				
		    var divIs = document.createElement('div');
		
		    document.body.appendChild(divIs);
	
		    divIs.style.textTransform = textTransform;
		    divIs.style.fontFamily = fontFamily;
		    divIs.style.fontStyle = fontStyle;
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
			},
			
			widestChar: function(fontSizeIs, fontFamily, textTransform, fontStyle) {
				
				var wideCharacters = ['J','M', 'W', 'Z'],
						widest = 0;
				
				for ( var idx in wideCharacters){
					var char = wideCharacters[idx],
							charWidth = this.measureText(char, fontSizeIs, fontFamily, textTransform, fontStyle).width;
					// console.log('char: ' + char + ' -  charWidth: ' + charWidth);
					widest = ( charWidth > widest  ? charWidth: widest);
				}
				
				return widest;
			},
			
			widenArea: function( backed ) {
				
				var dim = this.getWidthOfTextAreaWithContent();
				
				var newPerChar = ( typeof( backed ) != 'undefined' ? 5 : dim.perChar);
				var newWidth = dim.width + (150 * scale); 		
				$('#theTextarea').width(newWidth);
				
				this.$resizeWrapper.width(newWidth);
				this.$textEdit.width(newWidth);
					
			},
			
			scale: function() {
				
				var left = parseFloat(this.model.get('json').style.element.left),
						top = parseFloat(this.model.get('json').style.element.top),
						width = parseFloat(this.model.get('json').style.element.width),
						height = parseFloat(this.model.get('json').style.element.height),
						scaledWidth = width * scale,
						scaledHeight  = height * scale;
						
				this.$el.css({
					left: (left * scale) + 'px',
					top: (top * scale) + 'px'	
				});
				
				this.storeOffset();
				
				this.adaptStyle('font-size', 'px');
				this.adaptStyle('letter-spacing', 'px');

				this.$el.width(scaledWidth).height(scaledHeight);
				this.$resizeWrapper.width(scaledWidth).height(scaledHeight);
				this.$textEdit.width(scaledWidth).height(scaledHeight);		
				
				this.scaleCustom();
							
			}
		},
		
		text:{

			adaptStyle: function( styleKey, formatIs) {
				
				var curValue = parseFloat(this.model.get('json').style.textedit[styleKey]),
						newValue = app.stubs.zoom.scale * curValue;
						
				this.$textEdit.css(styleKey, newValue + formatIs);

				this.$el.find('.textFitted').css(styleKey, newValue + formatIs);
				
				$('#theTextarea').css(styleKey, newValue + formatIs);
				
				
			}
		}
	}
	