var redis = require("redis"),
  	db = redis.createClient(),
	issue = function(adapter) {
		var _empty = {
			title: "",
			body: "",
			state: "design"	
		};
		this.adapter = adapter;

		this.add = function(board, title, body, state) {
			// add to github
			// get issue #
			// add as board:id issue:number {}
		};

		this.change = function(board, number, title, body, state) {
			// update on github, don't have to wait
			// update db board:id issue:number {}
		};

		this.close = function(board, number) {
			// close on github
			// wait, then delete from db
		};

		return this;
	};

exports.issue = issue;