'use strict';

angular.module('buildAVotingAppApp')
	.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'app/main/main.html',
				controller: 'MainCtrl'
			})
			.when('/:user', {
				templateUrl: 'app/main/user/user.html',
				controller: 'UserCtrl'
			})
			.when('/:user/:poll', {
				templateUrl: 'app/main/user/poll/poll.html',
				controller: 'PollCtrl'
			});
	});
