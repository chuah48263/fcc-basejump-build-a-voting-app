'use strict';

angular.module('buildAVotingAppApp')
	.controller('SettingsCtrl', function($scope, User, Auth, $window, $location, $timeout) {
		Auth.isLoggedInAsync(function(bool) {
			if(!bool){
				$scope.success = true;
				$scope.notLoggedIn = 'You are not logged in. Redirecting to login page.';
				$('body').removeClass('loaded');
				$timeout(function() {
					$location.path('/login');
				}, 1000);
			}else if(bool){
				$('body').addClass('loaded');

				$scope.errors = {};
				$scope.user = {};

				$scope.changePassword = function(form) {
					$scope.submitted = true;
					if (form.$valid) {
						Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword)
							.then(function() {
								$scope.success = true;
								$scope.message = 'Password changed. Redirecting to your previous page.';
								$('body').removeClass('loaded');
								$timeout(function() {
									$window.history.back();
								}, 1000);
							})
							.catch(function() {
								$scope.verify = false;
								form.password.$setValidity('mongoose', false);
								$scope.errors.other = 'Incorrect password, please try again.';
								$scope.message = '';
								$('#password').focus();
							});
					}
				};

				$('#password').on('keydown', function() {
					if (!$scope.verify && $scope.submitted && !$scope.success) {
						$scope.verify = true;
						$scope.form.password.$setValidity('mongoose', true);
					}
				});

				$('input').on('click', function() {
					$(this).focus();
				});

				$('#submit').on('click', function() {
					if ($scope.user.oldPassword === undefined && $scope.user.newPassword === undefined) {
						$('#password').focus();
					} else if ($scope.user.oldPassword === undefined && $scope.user.newPassword !== undefined) {
						$('#password').focus();
					} else if ($scope.user.oldPassword !== undefined && $scope.user.newPassword === undefined) {
						$('#newPassword').focus();
					}
				});

				$('#password').focus();
			}
		});
	});
