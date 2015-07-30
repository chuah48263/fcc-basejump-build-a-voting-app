'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PollSchema = new Schema({
	authorId: String,
	authorName: String,
	pollName: String,
	pollTitle: String,
	pollOptions: Array,
	pollVoted: Array,
	pollTotal: Number,
	pollId: Number,
	pollClosed: Boolean,
	url: String
});

module.exports = mongoose.model('Poll', PollSchema);
