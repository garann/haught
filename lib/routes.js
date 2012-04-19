var ghAdapter = require("./github"),
	ishAdapter = require("./issue"),
	board = require("./board");

function adapters(sesh) {
	sesh.github = new ghAdapter.adapter(sesh.oauth);
	sesh.issue = new ishAdapter.issue(sesh.github);
};

exports.root = function(req,res) {
	if (req.session && req.session.uid) {
	    return res.redirect('/user');
	}
	adapters(req.session);
	res.render('login');
};

exports.user = function(req,res) {
	if (!req.session.uid) {
        return res.redirect('/');
    }
    var repos,
    	github = new ghAdapter.adapter(req.session.oauth);
    github.getUserRepos(function(resp) {
		var data = "";
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			data += chunk;
		});
		resp.on('end', function () {
			repos = JSON.parse(data); 
			res.render('user',{username: req.session.uid, repos: repos});
		});
	});
};

exports.board = function(req, res) {
	if (!req.session.uid) {
        return res.redirect('/');
    }
    var issues,
    	owner = req.params.owner,
    	repo = req.params.repo,
    	github = new ghAdapter.adapter(req.session.oauth);

	github.getRepoIssues( owner, repo, function(resp) {
		var data = "";
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			data += chunk;
		});
		resp.on('end', function () {
			issues = JSON.parse(data); 
			if ( !req.session.board ) req.session.board = new board.create( owner, repo, issues );
			req.session.board.getIssues( function() {
				res.render( 'board', req.session.board );
			});
		});
	});
};

exports.newIssue = function( req, res ) {
	if (!req.session.uid) {
        return res.redirect('/');
    }
    var issues,
    	owner = req.params.owner,
    	repo = req.params.repo,
    	github = new ghAdapter.adapter(req.session.oauth);

	req.session.board.newIssue({
		title: req.body.txtTile,
		body: req.body.txtBody,
		state: req.body.selState
	}, function() {
		req.session.board.getIssues( function() {
			res.render( 'board', req.session.board );
		});
	});
};