<style type="text/css">
    ::selection{ background-color: #E13300; color: white; }
    ::moz-selection{ background-color: #E13300; color: white; }
    ::webkit-selection{ background-color: #E13300; color: white; }
    body {
        background-color: #fff;
        margin: 40px;
        font: 13px/20px normal Helvetica, Arial, sans-serif;
        color: #4F5155;
    }
    a {
        color: #003399;
        background-color: transparent;
        font-weight: normal;
    }
    h1 {
        color: #444;
        background-color: transparent;
        border-bottom: 1px solid #D0D0D0;
        font-size: 19px;
        font-weight: normal;
        margin: 0 0 14px 0;
        padding: 14px 15px 10px 15px;
    }
    code {
        font-family: Consolas, Monaco, Courier New, Courier, monospace;
        font-size: 12px;
        background-color: #f9f9f9;
        border: 1px solid #D0D0D0;
        color: #002166;
        display: block;
        margin: 14px 0 14px 0;
        padding: 12px 10px 12px 10px;
    }
    #body{
        margin: 0 15px 0 15px;
    }
    #container{
        margin: 10px;
        border: 1px solid #D0D0D0;
        -webkit-box-shadow: 0 0 8px #D0D0D0;
    }
</style>
            <div id="body">

						
						<code>
						<?php if($upload_data != ''):?>
							<?php var_dump($upload_data);?>
							
							</code>
							<img scr="<?php echo $upload_data['full_path'];?>">

						<?php endif;?>
						
						<form  id="uploadForm" target="iframeDump" action="<?php echo base_url(). 'graphics/upload' ?>" method="post" accept-charset="utf-8" enctype="multipart/form-data">
						<input  id="filename" type="file" name="filename" size="20" /><br />
						<input  id="external_id" type="text" name="external_id" size="5" />
						
						<br /><br />
						
						<input type="submit" value="upload" />
						
						</form>



 </div>
 <script type="text/javascript" language="Javascript">
	app = {
		init: function() {
			this.proxy.init();
		},
		refreshParentThumb: function() {
			this.proxy.send({
						'action': 'hideIframe',
						'test':'this is one'	
					});	
		},
		proxy:{
			clientHost: '',	// This would be the s3 client or localhost	
			init: function() {
				var that = this;
				this.bind(function(e) {that.receive(e) });
			},
			send: function(obj){
				var msg = this.serialize(obj);
				parent.postMessage(msg, this.clientHost);						
			},
			receive: function(e) {
				var that = this,
						obj = this.unserialize(e.data.split(','));
				this.clientHost = 'http://' + obj.clientHost;
				
				if( obj.action == 'uploadFile'){
					console.log(JSON.stringify(obj));
					$('#external_id').val(obj.external_id);
				};
				
			},				
			bind: function(callback){
				if (window.attachEvent) { // IE9...
					window.attachEvent("onmessage", callback);
				}
				else if (document.attachEvent) { // IE8...
					document.attachEvent("onmessage", callback);
				}
				else if (window.addEventListener) { // Everyone else...
					window.addEventListener("message", callback, false);
				}
			},
			serialize:function(obj){
				var str='';
				for(var key in obj){
					str += key + ':' + obj[key] + ',';
				};
				return str.substr(0,str.length-1)
			},        
			unserialize: function(strArray){
				var strLen = strArray.length,
					row,
					obj={};			
				for(var i=0;i<strLen;i++){
					row = strArray[i].split(':');
					obj[row[0]]=row[1];
				}
				return obj;
			}
		}
	};
	
	app.init();
</script>

<iframe id="iframeDump" name="iframeDump" />