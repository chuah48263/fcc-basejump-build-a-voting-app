'use strict';

angular.module('buildAVotingAppApp')
	.filter('renderHtml', ['$sce', function($sce) {
		return function(str) {
			return $sce.trustAsHtml(str);
		};
	}]);
