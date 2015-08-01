'use strict';

angular.module('buildAVotingAppApp')
	.controller('MainCtrl', function($scope, Auth) {
		$('body').addClass('loaded');

		Auth.isLoggedInAsync(function(bool) {
			if(bool){
				$scope.loggedIn = true;
				$scope.author = Auth.getCurrentUser().name;
			}else if(!bool){
				$scope.loggedIn = false;
			}
		});
	});
