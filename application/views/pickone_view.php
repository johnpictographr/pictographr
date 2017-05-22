	<head>
		<link rel="stylesheet" type="text/css" href="../js/lib/bootstrap/bootstrap.min.css"/>
		<link rel="stylesheet" type="text/css" href="../js/lib/material/material.css"/>
	  <link rel="stylesheet" href="../js/lib/fontawesome/font-awesome.min.css">
		<link rel="stylesheet" type="text/css" href="https://netdna.bootstrapcdn.com/font-awesome/3.0.2/css/font-awesome.css"/>
		<script src="../js/lib/jquery/jquery.min.js"></script>
		<script src="../js/lib/bootstrap/bootstrap.min.js"></script>
		<script src="../js/lib/material/ripples.min.js"></script>
		<script src="../js/lib/material/material.min.js"></script>
		<script type="text/javascript" src="https://js.stripe.com/v2/"></script>
		<style>
			body{
				overflow-y: scroll;	
				overflow-x: hidden;	
			}
			.oh,.ot,.tt{float:left;padding:0 2% 2% 0;width:48%}.ot{width:31%}.tt{width:65%}.cl{clear:both}
			.panel-body{
				padding: 19px 51px;
			}
			#cc_form_wrapper{
				color: gray;	
			}
			#cc_form_wrapper label{
				font-weight: 300;
			}	
			#cc_form_wrapper > div{
				margin: 10px 0;
				min-height: 34px;
			}
			#cc_form_wrapper #cc-title{
				font-weight: 300;
				font-size:24px; 
			}
			#cc_form_wrapper #addcc{
			width:216px;
			position:relative;
			float: right;
			}
			#cc_form_wrapper #cc_logo{
				position: absolute;
				top: 32px;
				right: 1px;	
			}
			#cc_form_wrapper #cc_cvc{
				position: absolute;
				top: 80px;
				right: 1px;
			}
			#cc_form_wrapper table{
				    margin: 0px 0 18px;
			}	
			#cc_form_wrapper #cc_submit{
				position: relative;
			}
			#cc_form_wrapper #cc-button-wrapper button{
				width: auto;
				margin: 0 auto;
				height: auto;
				display: block;
			}
			#subscriptions_table_wrapper{
				min-width: 430px;
				height: 194px;
				overflow-y: scroll;	
				overflow-x: hidden;	
			}
			label {
				font-weight: normal;
			}
			
		</style>
	</head>
	<body>
		<div  class="container">
	
		<form action="" method="POST" id="payment-form">			
			<div class="panel-group" id="accordion">
			  <div class="panel panel-default">
			    <div class="panel-heading">
			      <h4 class="panel-title">
			        <a data-toggle="collapse" href="#collapseOne">
			          Payment Information
			        </a>
			      </h4>
			    </div>
			    <div id="collapseOne" class="panel-collapse collapse in">
			      <div class="panel-body">
							
								<div  id="cc_form_wrapper" class="form-control-wrapper">
									<div>
										<span  id="cc-title" >Payment</span><img  id="addcc"  src="../img/allcc.png">
									</div>
									<div>
										<input type="hidden" id="new_subscription_interval" name="new_subscription_interval" value="">
										<input type="hidden" id="addSeatCount" name="addSeatCount" value="">
										<input type="hidden" id="stripe_customer_id" name="stripe_customer_id" value="<?php echo $stripe_customer_id; ?>">
										<input class="form-control empty" placeholder="Full Name"   value="John Doe">
									</div>
									<div>
										<input class="form-control empty" placeholder="Credit Card Number"   data-stripe="number" value="4242424242424242">
									</div>
									<div>
										<table>
											<tr>
												<td>
													<div class="oh">
														<input class="form-control empty" placeholder="Month"   data-stripe="exp-month" value="12">
													</div>
													<div class="oh">
														<input class="form-control empty" placeholder="Year"   data-stripe="exp-year"  value="2018">
													</div>	
												</td>
												<td   style="padding: 0 0 5px 0"  >
													<input class="form-control empty" placeholder="CVC"  data-stripe="cvc"    value="123">
												</td>
											</tr>
										</table>
									</div>
		
								</div>
							
			      </div>
			    </div>
			  </div>
			  <div class="panel panel-default">
			    <div class="panel-heading">
			      <h4 class="panel-title">
			        <a data-toggle="collapse"  href="#collapseTwo">
			          Plans
			        </a>
			      </h4>
			    </div>
			    <div id="collapseTwo" class="panel-collapse collapse in">
			      <div class="panel-body">
						  <div>
						  	<div  class="ot">
							    <label style='float:right'  >
							      <span>Choose Group Plan:&nbsp;&nbsp;&nbsp;</span>
							     </label>
						  	</div>
						  	<div  class="tt">
									<div  id="subscriptions_table_wrapper" >
										<table id="subscriptions_table">
										</table>
									</div>
						  	</div>
						  </div>
			      </div>
			    </div>
			  </div>
			  	
				<div  id="cc-button-wrapper"  >
					<button  id="cc_submit"  type="submit"  class="btn btn-primary ">Subscribe</button>
				</div>
		  </form>
		</div>
			
			

		</div>		
	</body>		
	<script	src="../js/core/tools.js"></script>
	<script>
	
	(function(){
		
		tools.ajax('getSubscriptionsorgs', {}, 'post', function( data ) {	
			//console.log(JSON.stringify( data    , null, 2 ));
			for( var idx in data){
				$('#subscriptions_table').append('\
					<tr>\
						<td>' + data[idx]['count'] + ' seats</td>\
						<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>\
						<td><label><input addSeatCount=' + data[idx]['count'] + ' new_subscription_interval="M" name="stripe_plan" type="radio" value="' + data[idx]['stripe_monthly_plan'] + '">&nbsp;&nbsp;$' + data[idx]['monthly'] + '/month</input>&nbsp;&nbsp;&nbsp;&nbsp;</label></td>\
						<td><label><input addSeatCount=' + data[idx]['count'] + ' new_subscription_interval="Y" name="stripe_plan" type="radio" value="' + data[idx]['stripe_yearly_plan'] + '">&nbsp;&nbsp;$' + data[idx]['yearly'] + '/year</input></label></td>\
					</tr>\
				');
			}
			
			$('input[name=stripe_plan]').bind('click',  function() {
				
				var new_subscription_interval = $(this).attr('new_subscription_interval');
				$('#new_subscription_interval').val(new_subscription_interval);

				var addSeatCount = $(this).attr('addSeatCount');
				$('#addSeatCount').val(addSeatCount);
				
			})						
		});
				
		stripeResponseHandler = function(status, response) {
		
			if( typeof( response.error ) != 'undefined'){
			}else{
			
				var postObj = {
							'token': response.id,
							'stripe_plan': $('input[name=stripe_plan]:checked').val(),
							'addSeatCount': $('#addSeatCount').val(),
							'new_subscription_interval': $('#new_subscription_interval').val()
						};
						
				console.log(JSON.stringify(  postObj   , null, 2 ));
				
				tools.ajax('subscribe', postObj, 'post', function(obj) {
					
					console.log(JSON.stringify(  obj   , null, 2 ));
					
				});
									
			};
					
		};
		
		Stripe.setPublishableKey('pk_test_Lu4B8GHyOrFcVL5DmxA5EXwc');

		
		$('#payment-form').submit(function(e) {
			
		 if( typeof( $('input[name=stripe_plan]:checked').val() ) == 'undefined' ) {
		 	alert('Please check a plan.');
		 	return false;
		 }
		
		 var $form = $(this);
		 $form.find('button').prop('disabled', true);
		 $form.find('button').attr("disabled", "disabled");
		 Stripe.card.createToken($form, stripeResponseHandler);
		 return false;
		 
		});

		    
	})();
	
	</script>