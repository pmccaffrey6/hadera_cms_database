var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var url = require('url');

var CmsMetrics = require('./cms_metrics');

CmsMetrics.loadFromFile(path.join(__dirname, '../data/cmsdrg_sheet_with_latlong_final.csv'));

app.use('/', express.static(path.join(__dirname, '../client')));

//configure the app to use bodyParser()
//this will let us get the data from POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
//====================
var router = express.Router(); //instance of express router

router.use(function(req, res, next) {
	//do logging
	console.log('something is happening.');
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

//test the route
router.get('/', function(req, res) {
	res.json({  message: 'welcome to the Hadera CMS API!' });	
});

router.route('/metric/:metric_key').get(function(req, res) {
	var key = req.params.metric_key;
	var result = CmsMetrics.getMetric(key);
	res.json({value: result});
});

router.route('/metrics').get(function(req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	if (query.keys != undefined) {
		var results = {};
		query.keys.split(',').forEach(function (k) { results[k] = CmsMetrics.getMetric(k); });
		res.json(results);
	}
});

router.route('/providers').get(function(req, res) {
	res.json(CmsMetrics.getProviders());
});

router.route('/drgs').get(function(req, res) {
	res.json(CmsMetrics.getDrgs());
});

// ADDITIONAL ROUTES FOR GETTING METRICS SETS
router.route('/payments').get(function(req, res) {
	res.json(CmsMetrics.getPaymentSet());
});

// REGISTER ROUTES so all api routes start with /api
app.use('/api', router);

// START THE SERVER
//====================
var port = process.env.PORT || 8080;
app.listen(port);
console.log('Hadera API is listening on port ' + port);
