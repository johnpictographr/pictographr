<head>
	<link rel="stylesheet" type="text/css" href="../js/lib/bootstrap/bootstrap.min.css"/>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.2/underscore-min.js"></script>
	<script src="../js/lib/bootstrap/bootstrap.min.js"></script>
	<script src="../js/lib/popconfirm/popconfirm_adapted.js"></script>
	<style>
		button:focus { outline:0 !important; }
		#main_container{
			position: absolute;
			width: 400px;
//			background: lightblue;
		}
		.boxes{
			position:relative;
			float: left;
			margin-right: 2px;
			margin-bottom: 2px;
			width: 196px;
			height: 196px;
//			background: ivory;
			white-space: nowrap;
			text-align: center;
		}
		.boxes:hover .buttons_wrapper,
		.boxes.loading .buttons_wrapper,
		.boxes.deleting .buttons_wrapper{		
			display: block;	
		}

		.boxes.disabled .buttons_wrapper,
		.boxes.loading .buttons_wrapper .action_buttons.disabled{		
			display: none;	
		}

		.boxes.deleting .buttons_wrapper .action_buttons.disabled{		
			visibility: hidden;	
		}

		.buttons_wrapper{
			position:absolute;
			width: 190px;
			left: 5px;
			top: 80px;
//			background: orange;
			display: none;
		}
		.action_buttons{
			outline: 0;
			position: relative;
			opacity: 1;
			width: 60px;
			height: 30px;
			cursor: pointer;
			font-family: arial;
//			box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
			font-weight: bold;
			font-size: 13px;
			border-radius: 2px;
//			float: left;
			display: block;
    	margin: 5px auto;
	    color: #fff;
	    padding-top: 6px;
	    border-radius: 3px;
		}

		.action_buttons.edit{
	    background-color: #FF9800;
	    border-color: #FF9800;
		}
		
		.action_buttons.delete{
		background-color: #f5f5f5;
		border-color: #f5f5f5;
		color: #333;
		}		
		
		
		.action_buttons.doit{
	    background-color: #2196F3;
	    border-color: #2196F3;
		}	
		
		.action_buttons.doit img{
	     margin-top: 4px;
		}				
		
		.helper {
			display: inline-block;
			height: 100%;
			vertical-align: middle;
		}
		.boxes .thumbs{
	    vertical-align: middle;
	    max-height: 196px;
	    max-width: 196px;
	    margin: 0px;
		}
		#loadingImg{
			width: 29px;
			margin: 2px auto;	
		}
	</style>

</head>
<body>
	<div  id="main_container" >
	</div>
</body>
<script>
	
$(document).ready(function() {
	
	var data = [
	  {
	    "fileId": "0B5ptY5tUIebjelNCSlhRMTFSb3M",
	    "thumbnailLink": "https://lh3.googleusercontent.com/uZ0tDIEea3RCoCCYKFYHOpwLROM3fQgJGNytqcy0vuX0G_Zt2u54qmL4WA0DE5DGyMldCg=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjcENSYi1pRUlubUk",
	    "thumbnailLink": "https://lh4.googleusercontent.com/77iWYsetbpSSNIa9_QEZnOadcBoEMd8xb8kT2mLf0awJTk7nRpgyaFx-jDi6bzI6Jt_ppA=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjMy1PR3BaUklJTzg",
	    "thumbnailLink": "https://lh4.googleusercontent.com/jOOzF8fWgcsYYxJZnDZakySS0fDfx4EBOPd2F9Ai1Y3YrIGZURrCh_sNoHXvIIZeoyMAGg=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjdFNoNE5SZVV6LXc",
	    "thumbnailLink": "https://lh6.googleusercontent.com/2VVDOI5r8qswVfHZz7hmWF1Ivgi9UoF8wBKyaPmB7ffxt8RwQU9HbB47VAvj3H9MW3CEGA=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjeVRWVUotY1BqYTQ",
	    "thumbnailLink": "https://lh6.googleusercontent.com/wK3IX8mwNI-vz4726jPFAPau68iWnVy5L2O0e2OOscRbtI4pEGZhmv-K1A_0ovLkco-Izw=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjMy1PR3BaUklJTzg",
	    "thumbnailLink": "https://lh4.googleusercontent.com/jOOzF8fWgcsYYxJZnDZakySS0fDfx4EBOPd2F9Ai1Y3YrIGZURrCh_sNoHXvIIZeoyMAGg=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjdFNoNE5SZVV6LXc",
	    "thumbnailLink": "https://lh6.googleusercontent.com/2VVDOI5r8qswVfHZz7hmWF1Ivgi9UoF8wBKyaPmB7ffxt8RwQU9HbB47VAvj3H9MW3CEGA=s220"
	  },
	  {
	    "fileId": "0B5ptY5tUIebjeVRWVUotY1BqYTQ",
	    "thumbnailLink": "https://lh6.googleusercontent.com/wK3IX8mwNI-vz4726jPFAPau68iWnVy5L2O0e2OOscRbtI4pEGZhmv-K1A_0ovLkco-Izw=s220"
	  }
	]
		
		var tools = {
			SHA512: function SHA512(str) {  //http://coursesweb.net/javascript/sha512-encrypt-hash_cs
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
			},
			ajax:	function(	url, arrDataObj, type, callback	)	{
				
				$.ajax({
					url: url + '?v=' + Math.random(),
					type:	type,
			    data: {
			        arrData : arrDataObj
			    },
					dataType:'json',
					success: function(data){
						//console.log('success');
						//console.log(JSON.stringify(  data   , null, 2 ));
						callback(data);
					},
					error:	function(data){
						console.log('error');
						console.log(JSON.stringify(  data   , null, 2 ));
						callback(data);
					},
					async:true
				});
			},
			randomIntFromInterval: function(min,max) {
		    return Math.floor(Math.random()*(max-min+1)+min);
			},
			openInNewTab: function(url) {
			  var win = window.open(url, '_blank');
			  win.focus();
			}
		};
	
		var App = function(){
	
	    return function() {
	    	
				var app = this;

				this.stubs = {};

				this.settings = {
					dim:{
						buttons_wrappers: {
							width: 190, // ideal
							height: 136, // ideal
							left: 5	 // ideal
						},
						action_buttons: {
							width: 62,
							height: 30	
						}
					}	
				};

				this.getFiles = function()	{
					
					var url = '/app/getFileList',
							postObj = {
								'google_id': '105870981217629422585',
								'whichFolder': 'files'
							};

					tools.ajax(url, postObj, 'post', function(data) {
						
						console.log(JSON.stringify(  data   , null, 2 ));
						
						app.stubs.data = data;
						app.paint();
					});		
					
				};
	
				this.resizeElements = function() {
					
					$('#main_container').width( app.settings.dim.main_container );
					
					var shrinkByRatio = (app.settings.dim.main_container / 400);  // ideal
						
					$('.boxes').width( (app.settings.dim.main_container / 2) - 2);
					$('.boxes').height( (app.settings.dim.main_container / 2) - 2 );
					$('.buttons_wrapper')
					.width( Math.ceil(app.settings.dim.buttons_wrappers.width * shrinkByRatio)  )
					.height( app.settings.dim.buttons_wrappers.height * shrinkByRatio  )
					.css('left', (app.settings.dim.buttons_wrappers.left * shrinkByRatio) + 'px')
					.css('top', ($('.boxes').height() - app.settings.dim.buttons_wrappers.height)  /2 + 'px');
					
					var marginSpacingformula = ($('.buttons_wrapper').width() - app.settings.dim.action_buttons.width * 2) / 4 ;
/*					
					$('.action_buttons').css({
						'padding':  '0px',	
						'margin-left':  marginSpacingformula + 'px',	
						'margin-right':  marginSpacingformula  + 'px',
						'width' : app.settings.dim.action_buttons.width
					});
					*/
					$('.thumbs').css({	
						'max-width':  196 * shrinkByRatio + 'px',	
						'max-height':  196 * shrinkByRatio + 'px'
					});
					
				};
	
				this.paint = function() {
					
					var placement = 'left';
					
					// https://www.placebear.com/200/300
					//"http://placehold.it/200x200"
					// "http://placehold.it/' + tools.randomIntFromInterval(75,450) + 'x' + tools.randomIntFromInterval(75,450) + '"
					// "http://placehold.it/' + tools.randomIntFromInterval(75,450) + 'x' + tools.randomIntFromInterval(75,450) + '"
					for( var idx in data){
						
						var obj = data[idx];
						var thumbLink = obj.thumbnailLink;
						var fileId = obj.fileId;
						
						if( placement == 'right') placement = 'left';
						 else placement = 'right';
						
						var box = '\
							<div  class="boxes">\
								<div  class="buttons_wrapper">\
									<div class="action_buttons doit" thumbLink="' +  thumbLink + '" fileId="' + fileId + '" >\
									</div >\
									<div  class="action_buttons edit" thumbLink="' +  thumbLink + '" fileId="' + fileId + '" >Edit\
									</div >\
									<div  placement="' + placement + '" class="action_buttons delete" thumbLink="' +  thumbLink + '" fileId="' + fileId + '" >Delete\
									</div >\
								</div>\
								<span class="helper"></span>\
								<img  class="thumbs" src="http://placebear.com/' + tools.randomIntFromInterval(75,450) + '/' + tools.randomIntFromInterval(75,450) + '">\
							</div>\
						';						
						
						$('#main_container').append(box);
						
					}
				 	this.resizeElements();	
					this.bind();				
				};
				
				this.bind = function() {
					
			    $('#new_design').click(function(e){
			    	e.preventDefault();
			    	tools.openInNewTab('https://pictographr.com/app?state=%7B%22newSerial%22:%20%220.6974779665800683%22,%20%22action%22:%22create%22,%22userId%22:%22%22%7D');
			    });

			    $('.delete').click(function(e){
							console.log('server delete');
					}).popConfirm({
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
		    
        $('.boxes').on('click', function () {
          	console.log('x');
          	doWhenClose();
            $('.action_buttons.delete').popover('hide').removeClass('popconfirm-active');
        });
			    
			    
			    
			    
			    
			    
					
			    $('.edit').click(function(e){
			    	e.preventDefault();
			    	tools.openInNewTab('https://pictographr.com/app?state=%7B%22newSerial%22:%20%220.6974779665800683%22,%20%22action%22:%22create%22,%22userId%22:%22%22%7D');
			    });					
					$('.doit').bind('click', function() {
						
						var that = this;
						
						app.progress.start( this );

						setTimeout(function(){
							
								app.progress.stop( that );
							
						}, 3000);
						
					})
				};
				
				this.progress = {
					start: function(that) {
						$(that).parent().parent().addClass('loading');
						$(that).css({'background': 'white', 'border-color': 'white'}).html('\
							<img src="../img/smallloading.gif" />\
						');
						$('.boxes:not(.loading)').addClass('disabled');
						console.log('test');
						$('.action_buttons.edit, .action_buttons.delete').addClass('disabled');
					},
					stop: function( that ) {
						$('.boxes').removeClass('disabled');
						$('.action_buttons.edit, .action_buttons.delete').removeClass('disabled');
						$(that).parent().parent().removeClass('loading');
						$(that).css({'background': '#2196F3', 'border-color': '#5cb85c'}).html(app.stubs.doItLabel);
					}
				};
				
				this.renderFilePngForPost = function(fileId) {
					
					var url = '/more/renderPNGFromDrive',
							postObj = {
								'google_id': app.stubs.google_id,
								'fileId': fileId
							};

					tools.ajax(url, postObj, 'post', function(data) {
						
						var url = 'https://pictographr.com/image/streamDriveImage?google_id=' + app.stubs.google_id + '&fileId=' + data.imageId + '&max_width=40000';
						console.log(url);
						app.doWithRenderedPNG(url);

					});	
					
				};
				
			}}();
			
		var app = new App();
		
		/* CUSTOM */
		app.settings.dim.main_container = 400;

		app.setUserId = function()	{
					
			hsp.getMemberInfo(function(info){
				app.stubs.userId = info.userId;
				app.stubs.google_id = '105870981217629422585';
			});					
		};
		
		app.doWithRenderedPNG = function( url ) {
			
			hsp.composeMessage( 'Check out this file.', { shortenLinks: true } );
			
			var timestamp = new Date().getTime() / 1000;
			var new_time = parseInt(timestamp, 10);
			
			var token = app.stubs.userId + '' + new_time + url + app.settings.secret;
			
			console.log('userId: ' + app.stubs.userId);
			console.log('new_time: ' + new_time);
			console.log('token: ' + token);
			console.log('SHA512: ' + tools.SHA512(token));
			
			var obj = {
				url: url,
				name: 'logo',
				extension: 'png',
				timestamp: new_time,
				token: tools.SHA512(token)
			}
			
			hsp.attachFileToMessage(obj);
			
		};
		
		app.stubs.doItLabel = "Attach";
		
		app.labelDoItButton = function() {
			$('.doit').html(app.stubs.doItLabel);
		};
		
		app.init = function() {
			
//	    var hsp_params = {
//	    			apiKey: 'dw6rh5otra8gkwok8c00k8wkc3ie1e2pfdj',
//	    			useTheme: true,
//	    			callBack: function( data ) {}
//	        };
//	        
//			hsp.init(hsp_params);
//			
//			this.setUserId();
//			this.getFiles();
			
			this.paint();
			this.labelDoItButton();
			
		};
		
		app.init();
		
});
	

</script>		