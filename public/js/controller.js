var haught = haught || {};

haught.Controller = function() {

	// setup polling or sockets or something
	
	this.init = function() {
		
	};
	
	this.render = function(obj, container) {
		container.appendChild($.tmpl(obj.tmpl,obj.getViewObj()));
	};
	
};