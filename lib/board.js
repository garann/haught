var redis = require('redis'),
	db = redis.createClient();

exports.create = function( owner, repo, ish ) {
	var that = this;
	this.owner = owner;
	this.repo = repo;
	this.ghIssues = ish;
	this.repoIssues;

	this.getIssues = function( cb ) {
		db.hget( "issues:" + owner, repo, function(err, issues) {
			if ( err ) {
				// publish boardNotFound
				return;
			}
			that.repoIssues = issues;
			that.issues = that.repoIssues ? that.repoIssues.concat(that.ghIssues) : that.ghIssues;
			// publish issuesLoaded
			cb();
		});
	};

	this.newIssue = function( issue, cb ) {
		that.getIssues( function() {
			var newIssues = that.issues.push( issue );
			db.hset( "issues:" + that.owner, that.repo, newIssues, function(err) {
				if ( err ) {
					// publish errorSavingIssue
					return;
				}
				// publish issueSaved
				cb();
			});
		});
	};

	return this;
};