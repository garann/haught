var https = require("https"),
	adapter = function(auth) {
		var opts = {
			host: "api.github.com",
			method: "GET"
		};
		this.auth = auth;

		this.getUserRepos = function(callback) {
			opts.path = "/user/repos?access_token=" + this.auth;
	    	_makeReq(opts, callback);
		};

		this.getRepoIssues = function(owner, repo, callback) {
			opts.path = "/repos/" + owner + "/" + repo + "/issues?access_token=" + this.auth;
			_makeReq(opts, callback);
		};

		function _makeReq(opts, callback) {
			var request = https.request(opts, callback);
			request.end();
		};

		return this;
	};

exports.adapter = adapter;