$(document).ready(function() {
	
		var app = new App();
		
		/* CUSTOM */
		app.settings.dim.main_container = 400;
		
		app.stubs.doItLabel = "Insert";
		
		app.init = function() {

			this.paint();
			this.labelDoItButton();
			
		};
		
		app.init();
		
});