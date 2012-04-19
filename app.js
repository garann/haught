var express = require('express'),
	app = express.createServer(),
	connr = require('connect-redis')(express),
	everyauth = require('everyauth'),
	config = require('./lib/config'),
	sesh = new connr(),
	redis = require('redis'),
	db = redis.createClient(),
	io = require('socket.io').listen(app),
	routes = require("./lib/routes");

everyauth.github
	.appId(config.gh_clientId)
	.appSecret(config.gh_secret)
	.findOrCreateUser( function (session, accessToken, accessTokenExtra, githubUserMetadata) {
		// find or create user logic goes here
		session.oauth = accessToken;
		return session.uid = githubUserMetadata.login;
	})
	.redirectPath('/');
 everyauth.everymodule.handleLogout( function (req, res) {
	req.logout(); 
	req.session.uid = null;
	res.writeHead(303, { 'Location': this.logoutRedirectPath() });
	res.end();
});


app.configure(function(){
    app.set('view engine', 'html');
  	app.register('.html', require('jqtpl').express);
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({store: sesh, secret: config.redis_secret}));
    app.use(everyauth.middleware());
});
 
app.get('/', routes.root);

app.get('/user', routes.user);

app.get('/board/:owner/:repo', routes.board);

app.post('/newIssue/:owner/:repo', routes.newIssue);

app.listen(process.env.PORT || 8001);