app.stubs = {
	svgmap:{},
	svgNeedRendering: 0,
	fileWorksPartiallyInIE: false,
	fileNotWorkInIE: false,
	maxchar4header: 50,
	disableMicroShift: false,
	serverprocessing: false,
	renderPNGIsBusy: false,
	doWhenSetter: false,
	fileTitle: 'untitled',
	parentFolderId: undefined,
	saveIsInterrupted: false,
	customPageSizeChanged: false,
	offline: false,
	canvasAspectRatio: undefined,
	blockRenderPng: false,
	addUsedPlaceholder:undefined,
	leftMenuHidden: false,
	adaptedPercentage: 0,
	resolution: 25,
	renderingPNGforHeaders: false,
	mainCanScroll: true,
	mainCurScollX: 0,
	mainCurScollY: 0,
	clickedMousPosX: 0,
	clickedMousPosY: 0,
	dropzoneDoOnce: false,
	status_id: undefined,
	tempImageBase64: undefined,
	quickSaveCount: undefined,
	previewIsOn: false,
	resizeGuide: false,
	hasGrid: false,
	imageId: undefined,
	temp_image_id: undefined,
	PDFId: undefined,
	activeCid: undefined,
	isTemplate: false,
	dobusy: false,
	doQueue:[],
	doitQueue:[],
	locked:[],
	usedColors: ['#000000', '#FFFFFF'],
	saving: false,
	savingWhat:'',
	pictoFolderId: undefined,
	spot: undefined,
	stillRotating: false,
	placement:{
		leftPlace: 120,
		topPlace: 120,
		increment: 40	
	},
	recentlySaved: true,
	$every: $('body, .elements, .ui-resizable-se, .ui-resizable-sw, .ui-resizable-nw, .ui-resizable-ne, .rotate-handle'),
	curPaperShape:{
		pageSize: 'letter',
		layout: 'portrait',
		pageSizeCustom: {
			width: 300,
			height: 250	
		}
	},
	saveHistoryEnabled: true,
	pointer: -1,
	history: [],
	print:{
		base64Data: undefined,
		width: undefined,
		height: undefined
	},
	data: {
		elements:[],
		panels:[],
		canvas:{
			curPaperShape: {}	
		}
	},
	mainScrolledDown: null,
	mainScrolledRight: null,
	grouped: [],
	cloned: [],
	readyForNextFont: true,
	fonts2Get:[],
	fontsLoaded:['Roboto'], //  added to header in link tag
	fontlist:{},
	viewBeingEdited:undefined,
	dim:{
		window: {
			width: 0,
			height:	0				
		},
		navbar:{
			height: 60	
		},
		leftmenu:{
			padding: 15	
		},
		main:{
			height: 0
		},
		cards:{
			inactive:{
				height: 39	
			},
			subcards:{
				inactive:{
					height: 30
				},
				title:{
					height: 38	
				}
			},					
			maxcard:{
				height:0,
				bufferButtom: 49	
			}

		},
		icons:{
			expandedSubCardContainer:{},
			
			thumb:{
				square: {
					small:{
						blocksWide: 3,
						width: 75,
						height: 75,
						marginTop: 4,
						realHeight: 83,
						realWidth: 79	
					},
					medium:{
						blocksWide: 2,
						width: 116,
						height: 116,
						marginTop: 4,
						realHeight: 124,
						realWidth: 120
					},
					large:{}
						
				},
				rectangle:{
					small:{
						blocksWide: 1,
						width: 241,
						height: 75,
						marginTop: 4,
						realHeight: 83,
						realWidth: 245
					},
					medium:{
						blocksWide: 1,
						width: 241,
						height: 150,
						marginTop: 4,
						realHeight: 158,
						realWidth: 245
					},
					large:{
						blocksWide: 1,
						width: 241,
						height: 145,
						marginTop: 20,
						realHeight: 153,
						realWidth: 245
					}					
				}
			},
			
			search:{
				borderLeft: 3,
				searchFieldContainer:{ height: 45},						
				
			},
			result:{
				height: 0,
				
				set:{
					width: 267, // accomodates blue border
					height: 0,
					nosearchHeight: 0,
					nosearchHeightBufferTop:13
				},
				setMaxIcon:{
					height:0,
					width: 241
				},
				nav:{ height: 30},
				
				scrollBarBuffer: 22
			},

		}
	},
	curCanvasSize:{
		width: 0,
		height: 0	
	},
	zoom:{
		scale: 1,
		multiple: 1,
		idx: 9,
		values: [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 
						 	110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210,
						 	220, 230, 240, 250, 260, 270, 280, 290, 300, 310,
						 	320, 330, 340, 350, 360, 370, 380, 390, 300, 410
						 	]
	},
	collections:{
		graphics:{
		}	
	},
	views:{
		leftMenu:{
			cards:{},
			subcards:{},
			maxcards:{}
		},
		elements:{
			
		},
		panels:{
			
		}
	},
	tags:{
		graphics:{
		}	
	},
	google_id: '',
	fileId: 'false'
};				

app.settings = {
	brokenWithIE: ['mask', 'polygon'],
	resizeMaxRatio: 9/10,
	gridSpacing: 20,
	canSaveImageToCloudDrive: ['speech', 'banners', 'arrows', 'borders', 'clipart', 'vectors', 'photos', 'illustrations', 'image', 'web', 'googledrive'],
	areImages:['speech','banners', 'arrows','borders', 'clipart', 'vectors', 'photos', 'illustrations', 'web'],
	skipAlignmentCollections: ['dynolines', 'paragraphs'],
	hasWidget:['web', 'richtext'],
	charts: ['pies', 'lines', 'columns', 'bars', 'scatter', 'stepped', 'area'],	
	google:{
		charts:{
			type:{
				pies:{
					appName: 'PieChart',
					coord:{
						left: '0px',
						top: '60px'	
					},
					modal:{
						width: '750px',
						height: '480px'	
					},
					field: {
						height: '60px'	
					}
				},
				bars:{
					appName: 'BarChart',
					coord:{
						left: '0px',
						top: '0px'	
					},
					modal:{
						width: '1200px',
						height: '520px'	
					},
					field: {
						height: '100px'	
					}
				},
				columns:{
					appName: 'ColumnChart',
					coord:{
						left: '0px',
						top: '0px'	
					},
					modal:{
						width: '1200px',
						height: '520px'	
					},
					field: {
						height: '100px'	
					}
				},
				lines:{
					appName: 'LineChart',
					coord:{
						left: '0px',
						top: '0px'	
					},
					modal:{
						width: '1200px',
						height: '520px'	
					},
					field: {
						height: '100px'	
					}
				},
				scatter:{
					appName: 'ScatterChart',
					coord:{
						left: '0px',
						top: '0px'	
					},
					modal:{
						width: '1200px',
						height: '520px'	
					},
					field: {
						height: '100px'	
					}
				},
				stepped:{
					appName: 'SteppedAreaChart',
					coord:{
						left: '0px',
						top: '0px'	
					},
					modal:{
						width: '1200px',
						height: '520px'	
					},
					field: {
						height: '100px'	
					}
				},
				area:{
					appName: 'AreaChart',
					coord:{
						left: '0px',
						top: '0px'	
					},
					modal:{
						width: '1200px',
						height: '520px'	
					},
					field: {
						height: '100px'	
					}
				},
			},
			options: {
				tooltip: { trigger: 'none' },
				//backgroundColor: 'rgb(239, 239, 239)',
				backgroundColor: 'transparent',
				enableInteractivity: false
	    }	
		}
	},
	hasFont:['paragraphs', 'headers', 'richtext'],
	hasLines:['straights', 'dynolines', 'zagLines', 'angleLines'],
	hasShapes:['shapes', 'shapeone', 'shapetwo', 'shapethree', 'shapefour', 'mask', 'polygon'],
	hasSvgshapes:['svgshapes_nature', 'svgshapes_speech', 'svgshapes_social', 'svgshapes_business', 'svgshapes_music', 'svgshapes_symbol','svgshapes_arrows', 'svgshapes_basic'],
	base64Prefix: 'data:image/png;base64, ',
	baseSvgPrefix: 'data:image/svg+xml;utf8,',
	minCanvasTop: 20,
	sides: ['top', 'right', 'bottom', 'left'],
	scalableStyles: ['border-top-width', 'border-left-width', 'border-bottom-width', 'border-right-width', 'border-width', 'width', 'height', 'top', 'left', 'font-size', 'letter-spacing'],
	noScaleStyles: ['border-top-style','border-style', 'line-height', 'opacity', 'color', 'text-align', 'font-weight', 'font-style', 'font-family', 'background', 'background-color', 'background-position-x', 'background-position-y', 'background-size', 'background-repeat', 'background-image', 'border-color', 'border-top-color', 'z-index', 'transform', '-o-transform', '-ms-transform', '-moz-transform', '-webkit-transform', 'box-shadow', '-o-box-shadow', '-ms-box-shadow', '-moz-box-shadow', '-webkit-box-shadow', 'radius'],
	RAD2DEG: 180 / Math.PI,
	keysInLayout:	[
		'-webkit-',
		'-moz-',
		'-ms-',
		'-o-',
		''],
	pixabayCollections: ['vectors', 'photos', 'illustrations'],
	s3: 'http://core-project-files.s3-website-us-east-1.amazonaws.com',
	paperSizes:{
		letter:{
			portrait:{
				width:1275,
				height:1650 	
			},
			landscape:{
				width:1650,
				height:1275	
			}
		},
		legal:{
			portrait:{
				width:736,
				height:1275
			},
			landscape:{
				width:1275,
				height:736
			},			
			
			portraitx:{
				width:818,
				height:1344	
			},
			landscapex:{
				width:1401,
				height:797	
			}
		},
		facebook:{ //https://docs.google.com/spreadsheets/d/1IpTYTTMJLcSXcPDtW9zSbPBHQyRdrLfKERohGIIkE_Q/edit#gid=1557149121
			post:{
				width: 1200,
				height: 630	
			},
			picture:{
				width:1200,
				height:1200	
			},
			cover:{
				width:815,
				height:315	
			},
			profile:{
				width:180,
				height:180	
			},
		},
		twitter:{
			post:{
				width: 1000,
				height: 1000	
			}
		},
		pinterest:{
			post:{
				width: 236,
				height: 236	
			}
		},
		
		instagram:{
			post:{
				width: 1080,
				height: 1080	
			}
		},
		
		linkedin:{
			post:{
				width: 1080,
				height: 1080	
			}
		},
		
		pinterest:{
			post:{
				width: 735,
				height: 1102	
			}
		},
		
		tumblr:{
			post:{
				width: 540,
				height: 810	
			}
		},
		
		googleplus:{
			post:{
				width: 250,
				height: 250	
			}
		},
		pageSizeCustom: {
			default:{
				width: 300,
				height: 250	
			}
		}
	},

	socialNetworks: {
		facebook:{
				width: 1200,
				height: 630	
		}/*,
		twitter:{
				width: 1000,
				height: 1000 	
			},
		pinterest:{
				width: 236,
				height: 236 	
			},
		googleplus:{
				width: 250,
				height: 250	
			}*/
	}
};

app.methods.widgets.facebook ={
	authenticate: function( callback ) {
		
	    window.fbAsyncInit = function() {
	        FB.init({
	            appId      : '1503228929961401', 
	            status     : true,
	            cookie     : true,
	            xfbml      : true,
	            oauth      : true
	        });
	            var token = "";
	            var userId = "";
	
	            FB.getLoginStatus(function(response) { 
	
	                if (response && response.authResponse) { // Check if User is Logged In
	
	                    window.FBaccessToken = response.authResponse.accessToken; // Get Token
	                    window.userId = response.authResponse.userID;     // Get User ID
	                    
	                    console.log('A) Facebook authenticated with token: ' + window.FBaccessToken);
	                    
	                    callback();
	
	                } else {
	                    //  alert("Not Auhtenticated");
	                    FB.login(function(response) { // Promote User to Authenticate App
	                        if (response && response.authResponse) {
	                        	
	                            window.FBaccessToken = response.authResponse.accessToken;
	                            window.userId = response.authResponse.userID;
	                            
	                            console.log('B) Facebook authenticated with token: ' + window.FBaccessToken);
	                            
	                            callback();
	                            
	                        }
	                    }, {scope: 'user_friends, email, user_about_me,  user_location, user_photos, publish_actions'}); // Scopes Example...
	                }
	            });
      };

      (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_GB/all.js";
          fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
	        
	}								
};

app.methods.widgets.charts.render = function(collection, preData, resolution, options, callback) {
	
		if(typeof( google.visualization ) == 'undefined') {
			
			$('#chart-card').hide();
			return;
			var postObj = {
				email: 'Google Visualization not working'	
			};

			var url = 'admin/sendnotification';
					
			tools.ajax(url, postObj, 'post', function(obj) {
				
				console.log(JSON.stringify(  obj   , null, 2 ));
				
			});
			
		}

	  var hiddenDiv = document.createElement('div');
	
	  document.body.appendChild(hiddenDiv);
	  
	  hiddenDiv.style.width = resolution.width  + 'px';
	  hiddenDiv.style.height = resolution.height + 'px';
	  hiddenDiv.style['z-index'] = 99999999999999999;
	  hiddenDiv.className = ' google-chart-visulation-svg-version';
	
		//console.log(app.settings.google.charts.type[collection].appName);
	
		var postData = google.visualization.arrayToDataTable(preData),
	  		chartGraph = new google.visualization[app.settings.google.charts.type[collection].appName](hiddenDiv);
	  
		google.visualization.events.addListener(chartGraph, 'ready', function() {
			
			var src = chartGraph.getImageURI();
			callback(src);
			
			document.body.removeChild(hiddenDiv);
			hiddenDiv = null;
			
		});

		options =	$.extend(	true,	options, app.settings.google.charts.options);
		
//		console.log(JSON.stringify(   options  , null, 2 ));
//		console.log(JSON.stringify(  preData   , null, 2 ));

	  chartGraph.draw( postData, options);

};

app.methods.widgets.charts.formatDataForCharts = function(  rawData) {
		
	var removeBadColumnsAndOrRows = function( badData, badColIndexArr, badRowIndexArr) {
		
		var goodData = [],
				goodRow = [];
		
		for( var rowIdx in badData){
			var badRow = badData[rowIdx];
			goodRow = [];
			for (var colIdx in badRow){	
				if( tools.inArray( colIdx, badColIndexArr)) continue;
				var cellValue = badRow[colIdx];
				goodRow.push(cellValue);
			}
			if( tools.inArray( rowIdx, badRowIndexArr)) continue;
			goodData.push(goodRow);
		}
		return goodData;
	};
	
  var badColIndexArr = [],
  		badRowIndexArr = [],
  		preData = [],
  		preDataRow = [],
  		error = undefined;
  
  for( var rowIdx in rawData){
  	var row = rawData[rowIdx];
  	preDataRow = [];
  	for (var colIdx in row){
  		
  		var cellValue = row[colIdx];
  		
  		// console.log('row: ' + rowIdx   + ' col: ' + colIdx + ' cellvalue: ' + cellValue);		
  							  		
  		if(rowIdx == 0 && cellValue == ''){ // first row
  			badColIndexArr.push(colIdx);
  		} else if(rowIdx != 0 && colIdx == 0 && cellValue == '') { //other rows label
  			badRowIndexArr.push(rowIdx);
  		} else if(rowIdx != 0 && cellValue == '') { //other rows besides first one
  			cellValue = 0;
  		}
  		
  		if( colIdx == 0 && cellValue == null ) {
  			badRowIndexArr.push(rowIdx);
  		}
  		
  		if(  	rowIdx != 0 && 
  					colIdx != 0 && 
  					!tools.isFloatOrNumber(cellValue) &&
  					cellValue != null
  					){
  			console.log(cellValue);
  			error = cellValue + ' is not a number.';
  		}	

  		if( tools.isFloatOrNumber(cellValue) ){
  			preDataRow.push( parseFloat(cellValue));
  		} else{
  			preDataRow.push(cellValue);
  		}

  	}
  	preData.push(preDataRow);
  }
  
  // console.log(JSON.stringify( badRowIndexArr));
  
  return {
  	data: removeBadColumnsAndOrRows(preData, badColIndexArr, badRowIndexArr),
  	error: error	
  };

};

app.methods.widgets.charts.injectColorsToChartdata = function( preData, colorsInChart, whichside) {
	
		var colorfulData = [];
	
		if( whichside == 'rows'){
			for( var idx in preData){
				var row = preData[idx],
						moreRow = $.extend(true, [], row);
						
				if( idx == 0 ) moreRow.push({ role: 'style' });
				else moreRow.push(colorsInChart[idx - 1]);
	
				colorfulData.push(moreRow);
			}			
			
		} else {
			
			colorfulData = preData;
		}
		
		return colorfulData;
		
};

app.methods.hasFont = function(collection) {
	if(tools.inArray(collection, app.settings.hasFont)) return true
	else return false
};

app.methods.buttonDo = {
						
	pressdown: function($button) {
		
			$button.on('mousedown', function() {	
				$(this).addClass('pressdown');
			}).on('mouseup', function() {	
				$(this).removeClass('pressdown');
			});		
				
	},
	
	success: function($button, wording, color, disable) {
		
		var origLabel = $button.text();
		
		$button.addClass('animated rubberBand');
		$button.css('background-color', color).text(wording);
		
		$button.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			
			$button.removeClass('animated rubberBand');
			
			if( typeof( disable ) != 'undefined'){
				$button.unbind('click').click(function(e) { e.preventDefault(); });
				$button.css({
					'-webkit-box-shadow': 'none',
					'-moz-box-shadow': 'none',
					'box-shadow': 'none'
				});									
			} else {
				setTimeout(function(){
					$button.css('background-color','#4285f4').text(origLabel);
				}, 3000);

			};
		});							
	},
	
	error: function($button) {
		$button.addClass('animated shake').css('background-color', '#aa3311');
		$button.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$button.removeClass('animated shake');
			setTimeout(function(){
				$button.css('background-color','#4285f4');
			}, 1000);
		});
	},
	
	color: '#4285f4' // original color
};
					
app.methods.doTempateObjFor = function( domStyle, dom, customScale){

	var styleIs = '',
			scale = ( typeof( customScale) == 'undefined' ? app.stubs.zoom.scale: customScale );

	for( var key in this.model.get('json').style[dom]){

		if ( tools.inArray(key, app.settings.noScaleStyles)) {
			
			var value =  this.model.get('json').style[dom][key];
			styleIs += key + ': ' + value + ';'	
			
			continue;
			
		}  else if( key == 'filter'){

				var grayscale = ( typeof( this.model.get('json').data.grayscale) != 'undefined' ? this.model.get('json').data.grayscale: 0);
				var blur = ( typeof( this.model.get('json').data.blur) != 'undefined' ? this.model.get('json').data.blur : 0);
				
				var filter = '';
				filter += 'blur(' + blur + 'px) grayscale(' + grayscale + '%)';
				
				for(var	idx	in app.settings.keysInLayout){
					styleIs += app.settings.keysInLayout[idx]  + 'filter:' + filter + ';';
				}
										
				continue;
					
		} else{
			
			var format = tools.useThisFormat(this.model.get('json').style[dom][key]),
					value =  parseFloat (this.model.get('json').style[dom][key]),
					scaledValue = ( format == '%' ?  value: value * scale );  // whenever % dont scale
			
			if( scaledValue < 1 && scaledValue != 0 && key == 'border-width') scaledValue = 1;
			
			if(dom == 'resizeWrapper'){
//				console.log(this.model.get('json').style[dom]);
//				console.log(key + ' - ' + scaledValue);
			}
			
		}
		
//		console.log('dom: ' + dom + ' key: ' + key + ' value:  ' + value);
	
		if( typeof(this.model.get('json').justDropped) != 'undefined' ){
			
			if( tools.inArray(key, ['border-radius', 'width', 'height', 'border-width', 'border-top-width', 'border-left-width', 'border-bottom-width', 'border-right-width'])) {
				styleIs += key + ': ' + scaledValue + format + ';';
			} else {
				this.model.get('json').style[dom][key] = value  * app.stubs.zoom.multiple + format;
				styleIs += key + ': ' + value + format + ';'
			}
			
		}else{
			
			if( tools.inArray(key, app.settings.scalableStyles)) {
				styleIs += key + ': ' + scaledValue + format + ';'
				
			}else {
				styleIs += key + ': ' + value + format + ';'
				
			}								
			
		}
		
	}

	this.templateObj[domStyle] = styleIs;
};

app.methods.setMainScrolled = function() {
	app.stubs.mainScrolledDown = $('#main').scrollTop();
	app.stubs.mainScrolledRight = $('#main').scrollLeft();
};

app.methods.getWhichView = function( model ) {
	
	var collection = model.get('json').collection;
	
	if(tools.inArray( collection, app.settings.areImages)){

		var whichView = 'Image';
		
	}  else if( tools.inArray( collection, app.settings.charts)) {

		var whichView = 'Charts';
		
	}  else if( tools.inArray( collection, app.settings.hasShapes)) {

		var whichView = 'Shapes';
		
	}  else if( tools.inArray( collection, app.settings.hasSvgshapes)) {  // working 

		var whichView = 'Svgshapes';
		
	} else{
		
		var whichView = tools.capitalizeFirstLetter(collection);

	}

	return whichView;
};

app.menu.resize = {
						
	init: function() {
		this.bind();
	},
	
	bind: function() {	
		
		var that = this,
				handleDelta = function( delta ) {
	        if (delta < 0){
	        	app.stubs.zoom.idx--;
	        }
	        else {
	        	app.stubs.zoom.idx++;
	        }
	        
	        if( app.stubs.zoom.idx >= 40 || app.stubs.zoom.idx < 0 ) return;
					
					that.makeChange();
				};
				
		app.methods.buttonDo.pressdown($('#resize-larger'));
		app.methods.buttonDo.pressdown($('#resize-smaller'));
		
		$('#resize-zoomback, #resize-larger, #resize-smaller').on( 'DOMMouseScroll mousewheel', function (event) {  // http://www.adomas.org/javascript-mouse-wheel/
				if( app.stubs.stillRotating ) app.methods.clearActive( ['previewOn'], 'exclude', ' DOMMouseScroll mousewheel');	
				var event = window.event || event; // old IE support
				var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
			
        var delta = 0;
        if (!event) /* For IE. */
                event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta/120;
        } else if (event.detail) { /** Mozilla case. */

                delta = -event.detail/3;
        }

        if (delta) handleDelta(delta);

        if (event.preventDefault)
                event.preventDefault();
								event.returnValue = false;
		});
		
		$('#resize-larger').on('click', function(event) {
			if( app.stubs.stillRotating ) app.methods.clearActive( ['previewOn'], 'exclude', ' resize-larger');	
			if( event.shiftKey ) {
				app.menu.resize.matchZoomTargetSize('main');
				return false;
			}		
			
			if( app.stubs.zoom.idx == 40 ) return;
			app.stubs.zoom.idx++;
			that.makeChange();
			return false;
			
		});
		
		$('#resize-smaller').on('click', function(event) {
			if( app.stubs.stillRotating ) app.methods.clearActive( ['previewOn'], 'exclude', ' resize-smaller');	
			if( event.shiftKey ) {
				app.menu.resize.matchZoomTargetSize('main');
				return false;
			}		
			
			if(app.stubs.zoom.idx == 0) return;
			app.stubs.zoom.idx--;
			that.makeChange();
			return false;
		});
		
		
		$('#resize-zoomback').on('click', function(event) {
			app.menu.resize.matchZoomTargetSize('main');
			return false;
		});		
		
		$('#resize-smaller').dblclick(	function(event)	{
			return false;
			app.menu.resize.matchZoomTargetSize('main');
			
		});
			
	},
	
	setGlobalScale: function() {
		scale = app.stubs.zoom.scale = app.stubs.zoom.values[app.stubs.zoom.idx] * .01;
		multiple = app.stubs.zoom.multiple = 1 / scale;	
	},
	
	makeChange: function() {

		app.methods.clearActive(['transferClonedStylesToElements'], 'include', 'make changes');
		
		this.setGlobalScale();
		
		var newWidth = app.stubs.curCanvasSize.width  * app.stubs.zoom.scale,
				newHeight = app.stubs.curCanvasSize.height * app.stubs.zoom.scale;
							
		$('#canvas, #canvas-wrapper, #panel_0').width(newWidth);
		$('#canvas, #canvas-wrapper, #panel_0').height(newHeight);
		
		$('#panel_0').css('background-size', app.stubs.adaptedPercentage * scale * app.settings.gridSpacing + 'px');
	
		app.methods.setCanvasTop();
		app.methods.setMainScrolled();
		
		for( var key in app.stubs.views.elements){
			
			var view = app.stubs.views.elements[key];
			
			view.scale();
			if( typeof( view.rotateIt ) != 'undefined') view.rotateIt.centerRotateHandle();
			
		}
		
		if( typeof( app.stubs.collections.guides ) != 'undefined'){
			for( var idx in app.stubs.collections.guides.models){
				
				var model = app.stubs.collections.guides.models[idx],
						json = model.get('json'),
						panelView = app.stubs.views.panels['panel_0'];
				
				panelView.bind.guideLines.setGuideOptions.call( panelView );
						
				if( json.line.type == 'horizontal'){
					var top = json.line.pos.y * scale;
					$('#' + model.cid).css('top', top + 'px' );
					$('#' + model.cid).draggable( "destroy" ).draggable(panelView.guideOptions['horizontal']);
				} else{
					var left = json.line.pos.x * scale;
					$('#' + model.cid).css('left', left + 'px' );
					$('#' + model.cid).draggable( "destroy" ).draggable(panelView.guideOptions['vertical']);
				}
				
			}
			
			$('#align-guide-vertical').css('left', app.settings.gridSpacing * scale + 'px' );
			$('#align-guide-horizontal').css('top', app.settings.gridSpacing * scale + 'px' );
			
		}

		if($('.elements.ontop:not(.dynoline)').length > 0){
			
			$('#main').scrollTop(parseFloat($('.ontop').css('top')) + app.stubs.canvasTop - 50);
			$('#main').scrollLeft(parseFloat($('.ontop').css('left'))- 50);			


		}
		
		if($('.elements.dynoline.ontop').length > 0){
			
			$('#main').scrollTop(parseFloat($('.ontop .box.active').css('top')) + 200);
			$('#main').scrollLeft(parseFloat($('.ontop .box.active').css('left')) + 400);;

		}							
		
		if( app.stubs.grouped.length != 0){
			
			app.methods.groupyBox.getEdges(app.stubs.grouped);
			app.methods.groupyBox.redoGroupyResize();
			app.methods.groupyBox.render();
			if( typeof( app.methods.groupyBox.rotateIt ) != 'undefined' ) app.methods.groupyBox.rotateIt.centerRotateHandle();		
			
			$('#main').scrollTop(parseFloat($('#groupy').css('top')) - 50);
			$('#main').scrollLeft(parseFloat($('#groupy').css('left')) - 50);	
			
		};

		var excludeArray = [];

		excludeArray.push('unzoomGlass');
		excludeArray.push('previewOn');
		excludeArray.push('removeOntop');
		excludeArray.push('hideHandles');
		excludeArray.push('hideDynolineHandles');
		excludeArray.push('enableTooltip');
		excludeArray.push('disableGroupy');
		excludeArray.push('removeSpot');
		excludeArray.push('emptyGrouped');
		excludeArray.push('clearActiveCid');
		excludeArray.push('removeToast');

		app.methods.clearActive( excludeArray, 'exclude', ' makeChange zoom');
										
		var fooHtml = "";
		
		fooHtml += "<div>idx: " + app.stubs.zoom.idx + "</div>";
		fooHtml += "<div>scale: " + scale + "</div>";
		fooHtml += "<div>multiple: " + multiple + "</div>";
		fooHtml += "<div>cidOntop: " + app.menu.resize.getCidOnTop() + "</div>";

		$('#foo').html(fooHtml);
		
	},
	
	getCidOnTop: function() {
		if($('.elements.ontop:not(.dynoline)').length > 0) return $('.ontop').attr('id');
		else '';
	},
	
	matchZoomTargetSize: function( whichTarget ) {
		if( app.stubs.stillRotating ) {
			toast('Group zoom disabled when group is rotated.');
			return;	
		}
			
		switch(	whichTarget	){

			case 'element' : {
				$el = $('.elements.ontop');
				$('.zoom-handle').addClass('zoomHandleGlassShowsOut');
			}
			break;
			
			case 'groupy' : {
				$el = $('#groupy');
				$('.zoom-handle').addClass('zoomHandleGlassShowsOut');
			}
			break;
			
			case 'main' : {
				$el = undefined;
				$('.zoom-handle').removeClass('zoomHandleGlassShowsOut');
			}
			break;
		}
		
		app.stubs.zoom.idx = this.getBestIdx($el);
		this.makeChange();
		$('.ripple-wrapper').empty();
	},
	
	getBestIdx: function( $el ) {
		
		if( typeof( $el ) != 'undefined' ){
			var whichDim = ( $el.height() > $el.width() ? 'height' : 'width' );
			var elBuffer = ( $el.height() > $el.width() ? 220 : 700 );
			
			if( $el.height() == $el.width()  ){
				var whichDim =  'height';
				var elBuffer = 370;
			};
			
			if( $el.attr('id') == 'groupy'){
				
				var realElDim = $('#groupy')[whichDim]() * multiple;
				
			}else{
				
				var cid = $el.attr('id'),
						json = app.stubs.views.elements[cid].model.get('json'),
						realElDim = parseFloat(json.style.element[whichDim]);				
			};

			
		} else{
			var whichDim = 'height';
		}
		
		var bestIdx,
				panelBuffer = 200,
				buffer = (typeof( $el) != 'undefined'  ? elBuffer : panelBuffer ),
				screenSideSize = parseFloat(tools.getScreenDim()[whichDim] - buffer ),
				foundBestIdx = false;
				
		for( var idx = 0; idx <= 40; idx++ ){
			var useScale = app.stubs.zoom.values[idx],
					domSideSize = (typeof( $el ) == 'undefined' ?  app.stubs.curCanvasSize[whichDim] : realElDim)  * useScale  * .01;
					
			if( domSideSize > screenSideSize &&
					!foundBestIdx
				){
				foundBestIdx = true;
				bestIdx = idx;
				//console.log('trying for bestIdx: ' + idx);
				continue;	
			}
		}
		
		if( app.stubs.curPaperShape.pageSize == 'legal'  && app.stubs.curPaperShape.layout == 'landscape'){
			//bestIdx--;
		};
		
		if( tools.mobilecheck() ) {
			bestIdx--;
			bestIdx--;
			bestIdx--;	
		} else if( typeof( drive ) != 'undefined' ){
			
			//bestIdx--;
			
			if( app.stubs.curPaperShape.layout == 'portrait')  {

				bestIdx--;
				bestIdx--;
			}
				
		}
		
		document.getElementById('main').scrollTop = 0;
		//return 21;
		return  ( typeof( bestIdx) != 'undefined' ? bestIdx: 40);
		
	}
}

app.methods.reduceSize = function( json, cid ) {
	
  var base64 = json.data.base64,
  		naturalWidth = json.data.width,
  		naturalHeight = json.data.height,
  		width = parseFloat(json.style.element.width),
  		height = parseFloat(json.style.element.height),
  		imgIs = document.createElement('img');

  document.body.appendChild(imgIs);

  imgIs.style.position = "absolute";
  imgIs.setAttribute('src', app.settings.base64Prefix + base64);
  
  var resizedData = tools.resizeToRect( imgIs, {x:0,y:0, x2:naturalWidth, y2:naturalHeight, w:width, h:height});
  
  imgIs.setAttribute('src', app.settings.base64Prefix + resizedData.base64);
  
	document.body.removeChild(imgIs);
  imgIs = null;
  
  return resizedData;

};

app.methods.reduceImageSize = function( json, shrinkby, cid ) {
	
  var base64 = json.data.base64,
  		naturalWidth = json.data.width,
  		naturalHeight = json.data.height,
  		width = parseFloat(json.style.element.width) * shrinkby,
  		height = parseFloat(json.style.element.height) * shrinkby,
  		imgIs = document.createElement('img');
  		
//  imgIs.style.width = parseFloat(json.style.element.width) +  'px';
//  imgIs.style.height = parseFloat(json.style.element.height) +  'px';

  document.body.appendChild(imgIs);

  imgIs.style.position = "absolute";
  imgIs.setAttribute('src', app.settings.base64Prefix + base64);
  
  var resizedData = tools.resizeToRect( imgIs, {x:0,y:0, x2:naturalWidth, y2:naturalHeight, w:width, h:height});
  
  imgIs.setAttribute('src', app.settings.base64Prefix + resizedData.base64);
  
	document.body.removeChild(imgIs);
  imgIs = null;
  
  return resizedData;

};

app.methods.clearActive = function( whichMethodArray, how, from, callback ) {
						
			$('#bar').append('clearActive: ' + from + '</br>');
 		//console.log('clearActive: ' + from);
		
		if( typeof( callback) != 'undefined' )callback();

		var clearThis = {
			'dropzone': function() { 
				$('.dropzone').css('background', 'transparent');
				$('#cloudUploadImg').remove();
				$('.elements').removeClass('make-blur');
				app.stubs.dropzoneDoOnce = false;
			},
			'removeToast': function() {
				$.toast().reset('all');
			},
			'changeCustomPageSize': function() {
				if( app.stubs.customPageSizeChanged ){
					app.stubs.customPageSizeChanged = false;
					app.methods.changeCustomPageSize();
					app.stubs.recentlySaved = false;
					window.onbeforeunload = app.methods.confirmOnPageExit;
					saveHistory('changed pagesize3');
				}
			},
			'disableMicroShift': function() {
				app.stubs.disableMicroShift = false;
			},
			'previewOn': function() {
				//$('.ontop').find('.ui-resizable-handle, .custom-handle').show();
				app.stubs.previewIsOn = false;
				if( !app.stubs.leftMenuHidden ){
					$('#left-menu').removeClass('slide-left');
					$('#canvas-wrapper').css('padding-left', '330px' )
				};
				
				$('#nav-top').css({
					'top':	'0px'
				});
				$('#main').css({
					'top':	'50px'
				}).removeClass('preview');
				$('#canvas').css('overflow', 'visible');
				$('#canvas-wrapper, body').css('cursor', 'default');
				$('body').unbind('click');
			},
			'disableGroupy': function() {
				if( app.stubs.stillRotating ) return;
				//console.log('disableGroupy');
				$('#groupy').addClass('disappear').appendTo('body');
				$('.elements').removeClass('grouped');
				for(var	idx	in app.settings.keysInLayout){
					$('#rotate-wrapper').css(app.settings.keysInLayout[idx]  + 'transform', 'rotate(0deg)');
				}
				$('#rotate-wrapper').children(':not(.custom-handle)').remove();
				for( var idx in app.stubs.grouped){
					var cid = app.stubs.grouped[idx],
							view = app.stubs.views.elements[cid];
					if( typeof( view ) != 'undefined' ) view.$el.css('visibility', 'visible');	
				}
				app.stubs.$every.removeClass('rotate-cursor');
			},
			'stillRotating': function() {
				//console.log('making app.stubs.stillRotating false');
				app.stubs.stillRotating = false;
			},
			'transferClonedStylesToElements': function() {
				
				//console.log('will transfer?');
				//console.log('app.stubs.stillRotating', app.stubs.stillRotating);
				
				if( app.stubs.stillRotating ) return;	
				
				//console.log('length', $('#groupy').find('.resize-wrapper').length);
				
				if( $('#groupy').find('.resize-wrapper').length > 0){
	
					//console.log('app.stubs.stillRotating', app.stubs.stillRotating);
					//console.log('transferring cloned styles');					
//					console.log('app.methods.groupyBox.rotateIt', app.methods.groupyBox.rotateIt);
					
					if( typeof( app.methods.groupyBox.rotateIt) != 'undefined'){
						app.methods.groupyBox.rotateIt.custom.groupy.transferClonedStylesToElements.call( app.methods.groupyBox.rotateIt, 'clearActive - rotateIt - transferClonedStylesToElements');
					}else{
						app.methods.groupyBox.dragGrouped.transferClonedStylesToElements('clearActive - dragGrouped - transferClonedStylesToElements');
					};
					
					for( var idx in app.stubs.grouped){
						var cid = app.stubs.grouped[idx],
								view = app.stubs.views.elements[cid];
						view.$el.css('visibility', 'visible');	
					}
					$('#rotate-wrapper').children(':not(.custom-handle)').remove();
				}
			},
			'clearActiveCid': function() {
				app.stubs.activeCid = undefined;
			},
			'saveFileTitle': function() {
				
				var fileTitle = $('#fileTitleInput').val();
				
				if( fileTitle.length > 10 ){
					var fileTitleShort = fileTitle.substring(0, 10) + '...';
				} else{
					var fileTitleShort = fileTitle;
				}
				
				$('#fileTitleLabel').text(fileTitleShort).show();
				$('#fileTitleInput').hide();
				app.stubs.fileTitle = fileTitle;
			},
			'enableTooltip': function() {
				
				if( typeof( $('[data-toggle="tooltip"]').tooltip ) != 'undefined' ){
					$('[data-toggle="tooltip"]').tooltip('enable');
					$('.tooltip').removeClass('disable');
					$('.tooltip').show();
				} 

			},
			'removeDropDown': function() {
				$('.dropdown').removeClass('open');
			},
			'hideHandles': function() {
				$('.elements').removeClass('see-handles');
			},
			'removeOntop': function() {
				$('.elements').removeClass('ontop');
			},
			'hideDynolineHandles': function() {
				$('.line').find('.custom-handle').removeClass('active');
				$('.box').removeClass('active');
			},
			'exitEditText': function() {
				if(typeof(app.stubs.viewBeingEdited) != 'undefined'){
					var view = app.stubs.viewBeingEdited;
					view.leaveEditText.call(view);
				}			
			},
			'editBox': function() {
				$('#picked-font').show();
				$('#listwrapper').hide();
				$('#edit-box').hide();
				$('.elements').removeClass('editting');
			},
			'hideColorPicker' : function() {
				
/*				
				if( typeof(  editbox ) != 'undefined' && 
					 editbox.view.collection == 'richtext' &&
					 editbox.view.$textEdit.find('img').length == 0 &&
					 editbox.richTextColorChanged
				){
					 console.log('close color picker.. rendering png for richtext');
					 editbox.richTextColorChanged = false;
					 var usequeue = true;
					 editbox.view.renderPngFromTextedit('hide color picker from clearactive if editbox collection is richtext', 
					 function() {
					 	saveHistory('rendering png for richtext');	
					 }, usequeue);	
				}
				*/

				if( typeof( app.stubs.addUsedPlaceholder) != 'undefined'){
					if ( !tools.inArray(app.stubs.addUsedPlaceholder, app.stubs.usedColors)){
						console.log('adding to used array');
						app.stubs.usedColors.push(app.stubs.addUsedPlaceholder);
						app.stubs.addUsedPlaceholder = undefined;							
					};
	
				};					 
				$('.colorPickerWrapper').hide();
				
			},
			'shrinkFontList' : function() {
				$('#picked-font').show();
				$('#listwrapper').hide();
			},
			'removeBubble': function() {
				$('.bubble').removeClass('visible');
			},
			'emptyGrouped': function() {
				for( var idx in app.stubs.grouped){
					var cid = app.stubs.grouped[idx],
							view = app.stubs.views.elements[cid];
					view.$el.css('visibility', 'visible');	
				}
				app.stubs.grouped = [];
			},
			'removeSpot': function() {
				app.stubs.spot = undefined;
			},
			'removeGroupyClones': function() {
				
			},
			'removeFlashingHandsontableFields': function() {

					var $allCol = $('.handsontable.ht_master tr td'),
							$allRow = $('.handsontable.ht_master tr td'),
							$topTh = $('.handsontable.ht_clone_top tr th'),
							$leftTh = $('.handsontable.ht_clone_left tr th');
					$allCol.removeClass('animated flash');
					$allRow.removeClass('animated flash');
					$topTh.removeClass('animated flash');
					$leftTh.removeClass('animated flash');
					
			},
			'removeSnack': function() {
				$('.paper-snackbar').remove();
			},
			'clearTempImageBase64': function() {
				app.stubs.tempImageBase64 = undefined;
			},
			'removeSaveIsInterrupted': function() {
				app.stubs.saveIsInterrupted = false;
			},
			'doitQueue': function() {
				for( var idx in app.stubs.doitQueue){
					var doit = app.stubs.doitQueue[idx];
					// console.log('clearing doitQueue process num: ' + idx + ' for: ' + doit.who);
					if( typeof( doit ) != 'undefined' ) doit.clear();
				}
				app.stubs.doitQueue = [];
			},
			'unzoomGlass': function() {
				$('.zoom-handle').removeClass('zoomHandleGlassShowsOut');
			}
		}
		
		if(typeof(whichMethodArray) == 'undefined'){
			
			for( var key in clearThis){
				clearThis[key]();
			}
			
		} else{
			
			switch(	how	){

				case 'include' : {
					for( var idx in whichMethodArray){
						var method = whichMethodArray[idx];
						
						if( typeof( clearThis[method] ) == 'function') {
							//console.log(method + ' running');
							clearThis[method]();
						}
					}

				}
				break;
				
				case 'exclude' : {
					
					for( var key in clearThis){
						//console.log('exclude key:' + key);
						if( tools.inArray( key, whichMethodArray)) continue;
						clearThis[key]();
					}
				}
				break;

			}
			
		}

}

app.methods.modal = {
	
	canDisable: true,
					
	init: function() {
		
		var that = this;
		
		$('#modal-screen').on( 'mousedown', function() {

			if( that.canDisable ) that.off();
			//app.methods.clearActive(undefined, undefined, 'modal off');
			return false;
		})
										
		$('#modal-box').on( 'mousedown', function(event) {
			event.stopPropagation();
		});	
		
		$('#modal-box').dblclick( function(event) {
			event.stopPropagation();
			event.preventDefault(); 
		});			
								
		$('#modal-box').on( 'click', '.close-button', function() {
			that.off();
		});
						
	},
	
	on: function(canDisable) {	
		
		this.canDisable = canDisable;

		if( !canDisable ) $('.close-button').hide();
		else $('.close-button').show();
		
		$('#modal-screen').show();
		$('#main, #left-menu, #nav-top, #resize-zoomback, #resize-larger, #resize-smaller, #pdf-container, #sthoverbuttons, #edit-box').addClass('make-blur');

	},
	off: function( where ) {
//			console.log('modal turned off from:  ' + where);
			this.canDisable = true;
		
		 	$('#modal-box iframe').attr('src', '');
		 	
			$('#modal-box').empty();
			$('#modal-screen').hide(); 
			$('#main, #left-menu, #nav-top, #resize-zoomback, #resize-larger, #resize-smaller, #pdf-container, #sthoverbuttons, #edit-box').removeClass('make-blur');
			
			app.methods.clearActive( undefined, undefined, 'modal off');
			
			if( typeof(app.methods.widgets.charts.handsInstance ) != 'undefined' ) {
				
//					if( typeof( app.methods.widgets.charts.view ) != 'undefined'){
//						app.methods.widgets.charts.view.model.set('json', app.methods.widgets.charts.origJson);	
//					}
				
				app.methods.widgets.charts.origJson = undefined;
				app.methods.widgets.charts.handsInstance.destroy();
				app.methods.widgets.charts.handsInstance = undefined;
			}		

	}
						
}
