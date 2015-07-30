'use strict';

angular.module('buildAVotingAppApp')
	.filter('renderMongoId', [function() {
		return function(str) {
			return new Date(parseInt(str.toString().slice(0, 8), 16) * 1000);
		};
	}]);
