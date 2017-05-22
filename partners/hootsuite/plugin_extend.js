tools['SHA512'] = function SHA512(str) {  //http://coursesweb.net/javascript/sha512-encrypt-hash_cs
  function int64(msint_32, lsint_32) {
    this.highOrder = msint_32;
    this.lowOrder = lsint_32;
  }

  var H = [new int64(0x6a09e667, 0xf3bcc908), new int64(0xbb67ae85, 0x84caa73b),
      new int64(0x3c6ef372, 0xfe94f82b), new int64(0xa54ff53a, 0x5f1d36f1),
      new int64(0x510e527f, 0xade682d1), new int64(0x9b05688c, 0x2b3e6c1f),
      new int64(0x1f83d9ab, 0xfb41bd6b), new int64(0x5be0cd19, 0x137e2179)];

  var K = [new int64(0x428a2f98, 0xd728ae22), new int64(0x71374491, 0x23ef65cd),
      new int64(0xb5c0fbcf, 0xec4d3b2f), new int64(0xe9b5dba5, 0x8189dbbc),
      new int64(0x3956c25b, 0xf348b538), new int64(0x59f111f1, 0xb605d019),
      new int64(0x923f82a4, 0xaf194f9b), new int64(0xab1c5ed5, 0xda6d8118),
      new int64(0xd807aa98, 0xa3030242), new int64(0x12835b01, 0x45706fbe),
      new int64(0x243185be, 0x4ee4b28c), new int64(0x550c7dc3, 0xd5ffb4e2),
      new int64(0x72be5d74, 0xf27b896f), new int64(0x80deb1fe, 0x3b1696b1),
      new int64(0x9bdc06a7, 0x25c71235), new int64(0xc19bf174, 0xcf692694),
      new int64(0xe49b69c1, 0x9ef14ad2), new int64(0xefbe4786, 0x384f25e3),
      new int64(0x0fc19dc6, 0x8b8cd5b5), new int64(0x240ca1cc, 0x77ac9c65),
      new int64(0x2de92c6f, 0x592b0275), new int64(0x4a7484aa, 0x6ea6e483),
      new int64(0x5cb0a9dc, 0xbd41fbd4), new int64(0x76f988da, 0x831153b5),
      new int64(0x983e5152, 0xee66dfab), new int64(0xa831c66d, 0x2db43210),
      new int64(0xb00327c8, 0x98fb213f), new int64(0xbf597fc7, 0xbeef0ee4),
      new int64(0xc6e00bf3, 0x3da88fc2), new int64(0xd5a79147, 0x930aa725),
      new int64(0x06ca6351, 0xe003826f), new int64(0x14292967, 0x0a0e6e70),
      new int64(0x27b70a85, 0x46d22ffc), new int64(0x2e1b2138, 0x5c26c926),
      new int64(0x4d2c6dfc, 0x5ac42aed), new int64(0x53380d13, 0x9d95b3df),
      new int64(0x650a7354, 0x8baf63de), new int64(0x766a0abb, 0x3c77b2a8),
      new int64(0x81c2c92e, 0x47edaee6), new int64(0x92722c85, 0x1482353b),
      new int64(0xa2bfe8a1, 0x4cf10364), new int64(0xa81a664b, 0xbc423001),
      new int64(0xc24b8b70, 0xd0f89791), new int64(0xc76c51a3, 0x0654be30),
      new int64(0xd192e819, 0xd6ef5218), new int64(0xd6990624, 0x5565a910),
      new int64(0xf40e3585, 0x5771202a), new int64(0x106aa070, 0x32bbd1b8),
      new int64(0x19a4c116, 0xb8d2d0c8), new int64(0x1e376c08, 0x5141ab53),
      new int64(0x2748774c, 0xdf8eeb99), new int64(0x34b0bcb5, 0xe19b48a8),
      new int64(0x391c0cb3, 0xc5c95a63), new int64(0x4ed8aa4a, 0xe3418acb),
      new int64(0x5b9cca4f, 0x7763e373), new int64(0x682e6ff3, 0xd6b2b8a3),
      new int64(0x748f82ee, 0x5defb2fc), new int64(0x78a5636f, 0x43172f60),
      new int64(0x84c87814, 0xa1f0ab72), new int64(0x8cc70208, 0x1a6439ec),
      new int64(0x90befffa, 0x23631e28), new int64(0xa4506ceb, 0xde82bde9),
      new int64(0xbef9a3f7, 0xb2c67915), new int64(0xc67178f2, 0xe372532b),
      new int64(0xca273ece, 0xea26619c), new int64(0xd186b8c7, 0x21c0c207),
      new int64(0xeada7dd6, 0xcde0eb1e), new int64(0xf57d4f7f, 0xee6ed178),
      new int64(0x06f067aa, 0x72176fba), new int64(0x0a637dc5, 0xa2c898a6),
      new int64(0x113f9804, 0xbef90dae), new int64(0x1b710b35, 0x131c471b),
      new int64(0x28db77f5, 0x23047d84), new int64(0x32caab7b, 0x40c72493),
      new int64(0x3c9ebe0a, 0x15c9bebc), new int64(0x431d67c4, 0x9c100d4c),
      new int64(0x4cc5d4be, 0xcb3e42b6), new int64(0x597f299c, 0xfc657e2a),
      new int64(0x5fcb6fab, 0x3ad6faec), new int64(0x6c44198c, 0x4a475817)];

  var W = new Array(64);
  var a, b, c, d, e, f, g, h, i, j;
  var T1, T2;
  var charsize = 8;

  function utf8_encode(str) {
    return unescape(encodeURIComponent(str));
  }

  function str2binb(str) {
    var bin = [];
    var mask = (1 << charsize) - 1;
    var len = str.length * charsize;

    for (var i = 0; i < len; i += charsize) {
      bin[i >> 5] |= (str.charCodeAt(i / charsize) & mask) << (32 - charsize - (i % 32));
    }

    return bin;
  }

  function binb2hex(binarray) {
    var hex_tab = "0123456789abcdef";
    var str = "";
    var length = binarray.length * 4;
    var srcByte;

    for (var i = 0; i < length; i += 1) {
      srcByte = binarray[i >> 2] >> ((3 - (i % 4)) * 8);
      str += hex_tab.charAt((srcByte >> 4) & 0xF) + hex_tab.charAt(srcByte & 0xF);
    }

    return str;
  }

  function safe_add_2(x, y) {
    var lsw, msw, lowOrder, highOrder;

    lsw = (x.lowOrder & 0xFFFF) + (y.lowOrder & 0xFFFF);
    msw = (x.lowOrder >>> 16) + (y.lowOrder >>> 16) + (lsw >>> 16);
    lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

    lsw = (x.highOrder & 0xFFFF) + (y.highOrder & 0xFFFF) + (msw >>> 16);
    msw = (x.highOrder >>> 16) + (y.highOrder >>> 16) + (lsw >>> 16);
    highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

    return new int64(highOrder, lowOrder);
  }

  function safe_add_4(a, b, c, d) {
    var lsw, msw, lowOrder, highOrder;

    lsw = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) + (c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF);
    msw = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) + (c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (lsw >>> 16);
    lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

    lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) + (c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) + (msw >>> 16);
    msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) + (c.highOrder >>> 16) + (d.highOrder >>> 16) + (lsw >>> 16);
    highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

    return new int64(highOrder, lowOrder);
  }

  function safe_add_5(a, b, c, d, e) {
    var lsw, msw, lowOrder, highOrder;

    lsw = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) + (c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF) + (e.lowOrder & 0xFFFF);
    msw = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) + (c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (e.lowOrder >>> 16) + (lsw >>> 16);
    lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

    lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) + (c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) + (e.highOrder & 0xFFFF) + (msw >>> 16);
    msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) + (c.highOrder >>> 16) + (d.highOrder >>> 16) + (e.highOrder >>> 16) + (lsw >>> 16);
    highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

    return new int64(highOrder, lowOrder);
  }

  function maj(x, y, z) {
    return new int64(
      (x.highOrder & y.highOrder) ^ (x.highOrder & z.highOrder) ^ (y.highOrder & z.highOrder),
      (x.lowOrder & y.lowOrder) ^ (x.lowOrder & z.lowOrder) ^ (y.lowOrder & z.lowOrder)
    );
  }

  function ch(x, y, z) {
    return new int64(
      (x.highOrder & y.highOrder) ^ (~x.highOrder & z.highOrder),
      (x.lowOrder & y.lowOrder) ^ (~x.lowOrder & z.lowOrder)
    );
  }

  function rotr(x, n) {
    if (n <= 32) {
      return new int64(
       (x.highOrder >>> n) | (x.lowOrder << (32 - n)),
       (x.lowOrder >>> n) | (x.highOrder << (32 - n))
      );
    } else {
      return new int64(
       (x.lowOrder >>> n) | (x.highOrder << (32 - n)),
       (x.highOrder >>> n) | (x.lowOrder << (32 - n))
      );
    }
  }

  function sigma0(x) {
    var rotr28 = rotr(x, 28);
    var rotr34 = rotr(x, 34);
    var rotr39 = rotr(x, 39);

    return new int64(
      rotr28.highOrder ^ rotr34.highOrder ^ rotr39.highOrder,
      rotr28.lowOrder ^ rotr34.lowOrder ^ rotr39.lowOrder
    );
  }

  function sigma1(x) {
    var rotr14 = rotr(x, 14);
    var rotr18 = rotr(x, 18);
    var rotr41 = rotr(x, 41);

    return new int64(
      rotr14.highOrder ^ rotr18.highOrder ^ rotr41.highOrder,
      rotr14.lowOrder ^ rotr18.lowOrder ^ rotr41.lowOrder
    );
  }

  function gamma0(x) {
    var rotr1 = rotr(x, 1), rotr8 = rotr(x, 8), shr7 = shr(x, 7);

    return new int64(
      rotr1.highOrder ^ rotr8.highOrder ^ shr7.highOrder,
      rotr1.lowOrder ^ rotr8.lowOrder ^ shr7.lowOrder
    );
  }

  function gamma1(x) {
    var rotr19 = rotr(x, 19);
    var rotr61 = rotr(x, 61);
    var shr6 = shr(x, 6);

    return new int64(
      rotr19.highOrder ^ rotr61.highOrder ^ shr6.highOrder,
      rotr19.lowOrder ^ rotr61.lowOrder ^ shr6.lowOrder
    );
  }

  function shr(x, n) {
    if (n <= 32) {
      return new int64(
       x.highOrder >>> n,
       x.lowOrder >>> n | (x.highOrder << (32 - n))
      );
    } else {
      return new int64(
       0,
       x.highOrder << (32 - n)
      );
    }
  }

  str = utf8_encode(str);
  strlen = str.length*charsize;
  str = str2binb(str);

  str[strlen >> 5] |= 0x80 << (24 - strlen % 32);
  str[(((strlen + 128) >> 10) << 5) + 31] = strlen;

  for (var i = 0; i < str.length; i += 32) {
    a = H[0];
    b = H[1];
    c = H[2];
    d = H[3];
    e = H[4];
    f = H[5];
    g = H[6];
    h = H[7];

    for (var j = 0; j < 80; j++) {
      if (j < 16) {
       W[j] = new int64(str[j*2 + i], str[j*2 + i + 1]);
      } else {
       W[j] = safe_add_4(gamma1(W[j - 2]), W[j - 7], gamma0(W[j - 15]), W[j - 16]);
      }

      T1 = safe_add_5(h, sigma1(e), ch(e, f, g), K[j], W[j]);
      T2 = safe_add_2(sigma0(a), maj(a, b, c));
      h = g;
      g = f;
      f = e;
      e = safe_add_2(d, T1);
      d = c;
      c = b;
      b = a;
      a = safe_add_2(T1, T2);
    }

    H[0] = safe_add_2(a, H[0]);
    H[1] = safe_add_2(b, H[1]);
    H[2] = safe_add_2(c, H[2]);
    H[3] = safe_add_2(d, H[3]);
    H[4] = safe_add_2(e, H[4]);
    H[5] = safe_add_2(f, H[5]);
    H[6] = safe_add_2(g, H[6]);
    H[7] = safe_add_2(h, H[7]);
  }

  var binarray = [];
  for (var i = 0; i < H.length; i++) {
    binarray.push(H[i].highOrder);
    binarray.push(H[i].lowOrder);
  }
  return binb2hex(binarray);
};

var app = new App(),
		nameOfThisFile = 'plugin_extend.js';

app.settings.dim.main_container = tools.getScreenDim().width - 9;
app.stubs.doItLabel = "Attach";

app.windowResize = function() {
				
	var	that = this,
			resizeId,
			doneResizing = function() {
				app.settings.dim.main_container = tools.getScreenDim().width - 9;
				that.resizeElements();
			};
			
	$(window).on(	'resize',
		function() {
			clearTimeout(resizeId);
			resizeId = setTimeout(doneResizing, 500);	
		}
	);
};


app.resizeElements = function() {

	var mainContainerHeight = tools.getScreenDim().height; 
	
	$('#main_container')
		.width( app.settings.dim.main_container )
		.height( mainContainerHeight );
		
	$('body').height( tools.getScreenDim().height );
	
	var shrinkByRatio = (app.settings.dim.main_container / 400);  // ideal
	var boxSideSize = (app.settings.dim.main_container / 2) - 14;
	$('.boxes').width( boxSideSize );
	$('.boxes').height( boxSideSize );
	
	app.stubs.boxesPerMainContainer = Math.ceil(mainContainerHeight / boxSideSize)  * 2;

	$('.buttons_wrapper')
	.width( Math.ceil(app.settings.dim.buttons_wrappers.width * shrinkByRatio)  )
	.height( app.settings.dim.buttons_wrappers.height * shrinkByRatio  )
	.css('left', (app.settings.dim.buttons_wrappers.left * shrinkByRatio) + 'px')
	.css('top', ($('.boxes').height() - app.settings.dim.buttons_wrappers.height)  /2 + 'px');
	
	var marginSpacingformula = ($('.buttons_wrapper').width() - app.settings.dim.action_buttons.width * 2) / 4 ;

	$('.thumbs').css({	
		'max-width':  186 * shrinkByRatio + 'px',	
		'max-height':  186 * shrinkByRatio + 'px'
	});
	
};

app.doWithRenderedPNG = function( url ) {
	
	app.settings.secret = 'thisisthesecret';
	
	hsp.composeMessage( '', { shortenLinks: true } );
	
	var timestamp = new Date().getTime() / 1000;
	var new_time = parseInt(timestamp, 10);
	var token = app.stubs.partner_userId + '' + new_time + url + app.settings.secret;

	// console.log('url:' + url);
	// console.log('partner_userId: ' + app.stubs.partner_userId);
	// console.log('new_time: ' + new_time);
	// console.log('token: ' + token);
	// console.log('SHA512: ' + tools.SHA512(token));

	var obj = {
		url: url,
		name: 'logo',
		extension: 'png',
		timestamp: new_time,
		token: tools.SHA512(token)
	}
	
	hsp.attachFileToMessage(obj);
	
	setTimeout(function(){
		app.deleteRenderedPNGForeverFromDriveTempFolder();
	}, 5000);

	$('.action_buttons').show();
	
};

app.getFiles = function()	{
	
			app.stubs.wait = true;
			
			if( typeof( app.stubs.nextPageToken )  == 'undefined' &&
					typeof( app.stubs.data ) != 'undefined'
			) return;
			
			if( typeof( app.stubs.google_id )  == 'undefined') return;	
					
			var url = '/app/getMoreFiles',
					postObj = {
						'google_id': app.stubs.google_id,
						'whichFolder': 'files',
						'boxesPerMainContainer': app.stubs.boxesPerMainContainer
					};
					
			//console.log(JSON.stringify(  postObj   , null, 2 ));
					
			if ( typeof( app.stubs.nextPageToken ) != 'undefined') {
				postObj['nextPageToken'] = app.stubs.nextPageToken;
			}
			
			
			var proceed = function(response) {
				
				app.stubs.data = response.data;
				
				app.stubs.fullname = response.fullname;
				$('#fullname').text(app.stubs.fullname);
				hsp.updatePlacementSubtitle(app.stubs.fullname);
				app.stubs.nextPageToken = response.nextPageToken;
				app.paint();
				app.labelDoItButton();
				
				app.stubs.wait = false;				
			};

			tools.ajax(url, postObj, 'post', function(response) {
				
				if( response.status == 'success'){
					
					proceed(response);
					
				}else{
					
					setTimeout(function(){
						app.getFiles();
					}, 2000);
					
				};
				
				
			});		
			
};


		
app.windowResize = function() {
	var	that = this,
			resizeId,
			doneResizing = function() {
				
				app.settings.dim.main_container = tools.getScreenDim().width;
				
				if( typeof( app.stubs.google_id ) != 'undefined') {
					app.resizeElements();
					app.stubs.wait = false;
					app.stubs.nextPageToken = undefined;
					app.stubs.data = undefined;
					app.streamPictoFiles();
										
				} else{
					
					app.showClickToInstall();
					
				}
				

			};
			
	$(window).unbind('resize').on(	'resize',
		function() {
			clearTimeout(resizeId);
			resizeId = setTimeout(doneResizing, 500);	
		}
	);
};
			
app.afterpaint = function() {

}

app.streamPictoFiles = function() {
	var that = this;
	$('#main_container_wrapper').load('stream_body.html', function() {
		app.bind.newdesign();
		app.bind.mysettings();
		that.resizeElements();
		app.stubs.wait = false;
		app.stubs.nextPageToken = undefined;
		app.stubs.data = undefined;
		that.getFiles();
	});
};

app.bind.newdesign = function() {

  $('#new_design').unbind('click').bind('click', function(e){
	  	var msgObj = {};
			msgObj.msgFrom = nameOfThisFile;
			msgObj['purpose'] = 'newdesign';	
			msgObj['pollrefresh'] = true;				
			msgObj['google_id'] = app.stubs.google_id;			
			tools.crossdom.send(msgObj);
			e.preventDefault();
  });		
		    			
};

app.bind.delete = function() {
				
		    $('.delete').unbind('click').click(function(e){
		    	
					var url = 'https://pictographr.com/app/deleteFile',
							postObj = {
								'google_id': app.stubs.google_id,
								'fileId': $(this).attr('fileId')
							};
		
					tools.ajax(url, postObj, 'post', function( response ) {
						//console.log(JSON.stringify(  response   , null, 2 ));
						app.streamPictoFiles();
					});		
						
						
				}).popConfirmDelete({
				    title: "Confirmation",
				    content: "Are you sure?"
				})
		    .click(function(e){
		    	e.preventDefault();
		    	var that = this;
		    	$(this).parent().parent().addClass('deleting');
					$('.boxes:not(.deleting)').addClass('disabled');
		    	$('.action_buttons').not(this).addClass('disabled');
					$(this).css({
						'background-color': '#d9534f',
						'border-color': '#d9534f',
						'color': 'white'	
					});
		    });
        
        var doWhenClose = function( that ) {
					$('.delete').parent().parent().removeClass('deleting');
					$('.delete').css({
						'background-color': '#f5f5f5',
						'border-color': '#f5f5f5',
						'color': '#333'	
					});							
					
					$('.boxes:not(.loading) .action_buttons, .boxes').removeClass('disabled');
					
        };		    
		    
        $('.boxes').unbind('click').on('click', function () {
          	doWhenClose();
            $('.action_buttons.delete').popover('hide').removeClass('popconfirm-active');
        });
				
};

app.bind.mysettings = function() {
	
	$('#my_settings').unbind('click').click( function(e) {
		$('#disconnect-div').addClass('active').toggle();
	});
	
	$('#disconnect-button').unbind('click').click( function(e) {
		
		e.preventDefault();
		app.stubs.google_id = undefined;
		app.stubs.wait = true;
		app.stubs.nextPageToken = undefined;
		app.stubs.data = undefined;
		app.stubs.painted = undefined;
		
		src = 'https://accounts.google.com/Logout';
		
		$('#iframe_logout').attr('src', 'https://accounts.google.com/Logout').load(function () {
			$('#iframe_logout').attr('src', 'https://pictographr.com/auth/destroySessionP').unbind('load').load(function () {
				// console.log('logout');
				$('.hs_stream').remove();
				app.showClickToInstall();
			});					
		});	
	
	});
		    			
};

app.setUserId = function( callback )	{
			
	hsp.getMemberInfo(function(info){
		
		app.stubs.partner_userId = info.userId;
		app.stubs.partner_id = 1;
		
		callback();
		
	});					
};

app.whenUserHasAccountThen = function(msgObj) {
	app.stubs.google_id = msgObj.google_id;
	app.stubs.username = msgObj.username;
	app.stubs.painted = undefined;
	app.streamPictoFiles();
};

app.progress.start = function(that) {
	$(that).parent().parent().addClass('loading');
	$(that).css({'background': 'white', 'border-color': 'white'}).html('\
		<img src="https://pictographr.com/img/smallloading.gif" />\
	');
	$('.action_buttons').not(that).hide();
}


app.showClickToInstall = function() {

		this.paintLoginWithGoogleButton();
		
    $("#carousel-gallery").owlCarousel({
			navigation : true, // Show next and prev buttons
			slideSpeed : 300,
			paginationSpeed : 400,
			singleItem:true,
			autoPlay: true
    });

		$('#get-started-button').unbind('click').click( function(e) {
			e.preventDefault();
			tools.crossdom.send({
				msgFrom: nameOfThisFile,
				purpose: 'createNewPictographrUser',
				partner_id: 1	
			});
			app.poll.byAuth();
		});
			
		$('#greet-container').css('height', tools.getScreenDim().height - 30 + 'px');
		
		this.resizeElements();
		
};

app.paintLoginWithGoogleButton = function() {
	
		$('body').find('#main_container').remove();
	
		$('#main_container_wrapper').append('\
			<div  id="main_container" >\
				<div  id="greet-container"  class="block">\
					<div  id="carousel-gallery" class="owl-carousel owl-theme" >\
			        <div class="item"><img alt="" src="https://pictographr.com/img/showmehoot.png"></div>\
			        <div class="item"><img alt="" src="https://pictographr.com/img/createhootsuite.png"></div>\
			        <div class="item"><img alt="" src="https://pictographr.com/img/design2.png"></div>\
			        <div class="item"><img alt="" src="https://pictographr.com/img/attachhootsuite.png"></div>\
			    </div>\
					<div>\
						Click below to get started...\
					</div>\
					<div>\
						<img   style="cursor:pointer;width:220px" id="get-started-button"  src="https://pictographr.com/img/loginGoogle.png"/>\
					</div>\
				</div>\
			</div>\
		');
};

app.init = function() {
	
	app.stubs.wait = false;
	
	tools.crossdom.init('iframe_messaging_conduit', 'https://pictographr.com/partners/iframeSrcPostMsgConduit.html');
	
	var that = this;
	
	$('body').height( tools.getScreenDim().height );
	
	app.stubs.apiKey = 'dw6rh5otra8gkwok8c00k8wkc3ie1e2pfdj';
	
	hsp.bind('refresh', function () {
		if( typeof( app.stubs.google_id ) != 'undefined') {
			app.streamPictoFiles();
		}
	});
	
  var hsp_params = {
  			apiKey: app.stubs.apiKey,
  			useTheme: true,
  			callBack: function( data ) {
  				
					that.setUserId( function() {
						
						that.windowResize();
						
						tools.crossdom.receive = function(msg) {
							
							if( typeof( msg.data.split ) != 'function') return;
							
							var msgObj = this.unserialize(msg.data.split(','));
							
							if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'retrieveGoogleIdDomain' ){ // ONLY LISTEN FOR MSG FROM PICTOGRAPHR
								
								//console.log(JSON.stringify(  msgObj   , null, 2 ));
								
								if( typeof( msgObj.google_id ) != 'undefined')   app.stubs.google_id = msgObj.google_id;
								
								if( msgObj.appInstalled == 'true'){
									
										if( msgObj.exist == 'true'){  // user is in database
											
										  app.stubs.isGoogleConnected = true;
										  app.streamPictoFiles();
						
										}else{
											
											// console.log('not in pictographr DB');
											
											app.showClickToInstall();
											
										};
									
								} else{
									
										app.showClickToInstall();
					
								};
								
							};
							
							if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'whenUserHasAccountThen' ){
								
								// console.log(JSON.stringify( msgObj    , null, 2 ));
								clearInterval(app.poll.polling);
								app.whenUserHasAccountThen(msgObj);			
								
							};		
							
							
							if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'refreshSidebarFiles' ){
								
								
								//console.log('refreshSidebarFiles');
								//console.log(JSON.stringify( msgObj    , null, 2 ));

								
								app.streamPictoFiles();		
								
							};
							
							
							if( typeof( msgObj.msgFrom) != 'undefined' && msgObj.purpose == 'clearPolling' ){
								
								clearInterval( app.poll.polling );
								app.showClickToInstall();		
								
							};
														
						}
						
					});

  			}
      };
      
	hsp.init(hsp_params);

	$(document).endlessScroll({
		inflowPixels: 300,
		callback: function() {
      if( !app.stubs.wait ) app.getFiles();
		}
	});
};

app.init();

refreshSidebarFiles = function() {

	app.streamPictoFiles();
};

		