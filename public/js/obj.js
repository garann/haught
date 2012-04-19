var haught = haught || {};

haught.States = ["Future","Design","Dev","Test","Complete"];

haught.Story = function(props) {

	var defaults = {
		id: null,
		name: "New story",
		description: "",
		state: 0,
		tasks: [],
		bugs: []
	};
	$.extend({},defaults,props);
	
	this.newTask = function() {
		this.addTask(new haught.Task());
	};
	
	this.addTask = function(t) {
		this.tasks.push(t);
		$.publish("taskAdded",this.id);
	};
	
	this.changeState = function(newState) {
		this.state = newState;
		$.publish("stateChanged",this.id);
	};	
	
	this.getViewObj = function() {
		return this;
	};
	
	return this;
	
};

haught.Task = function(props) {

	var defaults = {
		id: null,
		parentId: null,
		description: "",
		owner: null,
		done: false,
		bugs: []
	};
	$.extend({},defaults,props);
	
	this.assign = function(newOwner) {
		this.owner = newOwner;
		$.publish("taskAssigned",newOwner);
	};
	
	this.complete = function() {
		this.done = true;
		$.publish("taskCompleted",this.parentId);
	}
	
	this.openBug = function(b) {
		b.taskId = this.id;
		this.done = false;
		this.bugs.push(b);
		this.publish("bugOpened",this.id)
	};
	
	this.getViewObj = function() {
		return this;
	};
	
	return this;
	
};

haught.Bug = function(props) {

	var defaults = {
		storyId: null,
		taskId: null,
		description: "",
		reporter: null,
		fixed: false,
		promotedId: null
	};
	$.extend({},defaults,props);
	
	this.open = function() {
		
	};
	
	this.fix = function() {
		this.fixed = true;
		$.publish("bugFixed",this.taskId);
	};

	this.getViewObj = function() {
		return this;
	};
	
	return this;
	
};