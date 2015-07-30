'use strict';

var _ = require('lodash');
var Poll = require('./poll.model');
var https = require('https');

// Get list of polls
exports.index = function(req, res) {
	Poll.find(function(err, polls) {
		if (err) {
			return handleError(res, err);
		}
		return res.json(200, polls);
	});
};

// // Get a single poll
// exports.show = function(req, res) {
// 	Poll.findById(req.params.id, function(err, poll) {
// 		if (err) {
// 			return handleError(res, err);
// 		}
// 		if (!poll) {
// 			return res.send(404);
// 		}
// 		return res.json(poll);
// 	});
// };

// Creates a new poll in the DB.
exports.create = function(req, res) {
	Poll.create(req.body, function(err, poll) {
		if (err) {
			return handleError(res, err);
		}
		return res.json(201, poll);
	});
};

// Updates an existing poll in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Poll.findById(req.params.id, function(err, poll) {
		if (err) {
			return handleError(res, err);
		}
		if (!poll) {
			return res.send(404);
		}
		var updated = _.extend(poll, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, poll);
		});
	});
};

// Deletes a poll from the DB.
exports.destroy = function(req, res) {
	Poll.findById(req.params.id, function(err, poll) {
		if (err) {
			return handleError(res, err);
		}
		if (!poll) {
			return res.send(404);
		}
		poll.remove(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.send(204);
		});
	});
};

// Get last document pollId + 1
exports.count = function(req, res) {
	Poll.findOne({}, {}, {
		sort: {
			'pollId': -1
		}
	}, function(err, data) {
		if (err) {
			return handleError(res, err);
		}
		if (!data) {
			return res.send(404);
		}
		return res.json(data.pollId + 1);
	});
};

// Get goo.gl API key
exports.googl = function(req, res) {
	var postData = JSON.stringify(req.body);
	var postOptions = {
		hostname: 'www.googleapis.com',
		path: '/urlshortener/v1/url?key=' + process.env.GOOGL_KEY,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};
	var postReq = https.request(postOptions, function(postRes) {
		postRes.setEncoding('utf8');
		postRes.on('data', function(googl) {
			if (!googl) {
				return res.send(404);
			}
			return res.json(JSON.parse(googl).id);
		});
	});
	postReq.on('error', function(err) {
		return handleError(res, err);
	});
	postReq.write(postData);
	postReq.end();
};

// Get user polls
exports.user = function(req, res) {
	Poll.find({
		authorName: req.params.user
	}, function(err, polls) {
		if (err) {
			return handleError(res, err);
		}
		if (!polls) {
			return res.send(404);
		}
		return res.json(polls);
	});
};

// Get single user poll
exports.userPoll = function(req, res) {
	Poll.find({
		authorName: req.params.user,
		pollTitle: req.params.poll
	}, function(err, poll) {
		if (err) {
			return handleError(res, err);
		}
		if (!poll) {
			return res.send(404);
		}
		return res.json(poll);
	});
};

function handleError(res, err) {
	return res.send(500, err);
}
