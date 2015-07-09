'use strict';

angular.module('buildAVotingAppApp')
	.config(function($routeProvider) {
		$routeProvider
			.when('/polls', {
				templateUrl: 'app/polls/polls.html',
				controller: 'PollsCtrl'
			});
	});
