'use strict';

angular.module('buildAVotingAppApp')
	.controller('LogoutCtrl', function($scope, $timeout, $window, Auth) {
		$('body').removeClass('loaded');

		Auth.isLoggedInAsync(function(bool) {
			if (bool) {
				Auth.logout();
				$scope.success = 'Logout successfully. Redirecting to your previous page.';
			} else if (!bool) {
				$scope.error = 'You are not logged in. Redirecting to your previous page.';
			}
		});
		$timeout(function() {
			$window.history.back();
		}, 1000);
	});
