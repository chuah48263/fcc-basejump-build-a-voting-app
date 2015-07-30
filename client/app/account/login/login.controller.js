'use strict';

angular.module('buildAVotingAppApp')
	.controller('LoginCtrl', function($scope, Auth, $window, $timeout) {
		Auth.isLoggedInAsync(function(bool) {
			if (bool) {
				$scope.success = true;
				$scope.loggedIn = 'You have already logged in. Redirecting to your previous page.';
				$('body').removeClass('loaded');
				$timeout(function() {
					$window.history.back();
				}, 1000);
			} else if (!bool) {
				$('body').addClass('loaded');

				$scope.user = {};
				$scope.errors = {};

				$scope.login = function(form) {
					$scope.submitted = true;

					if (form.$valid) {
						Auth.login({
								name: $scope.user.name,
								password: $scope.user.password
							})
							.then(function() {
								// Logged in, redirect to previous page
								$scope.success = true;
								$scope.message = 'Login successfully. Redirecting to your previous page.';
								$('body').removeClass('loaded');
								$timeout(function() {
									$window.history.back();
								}, 1000);
							})
							.catch(function(err) {
								if (err.field === 'name') {
									form.name.$setValidity('mongoose', false);
									$scope.errors.other = err.message;
									$('#name').focus();
								} else if (err.field === 'password') {
									form.password.$setValidity('mongoose', false);
									$scope.errors.other = err.message;
									$('#password').focus();
								}
							});
					}
				};

				$('input').on('click', function() {
					$(this).focus();
				});

				$('#submit').on('click', function() {
					if ($scope.user.name === undefined && $scope.user.password === undefined) {
						$('#name').focus();
					} else if ($scope.user.name === undefined && $scope.user.password !== undefined) {
						$('#name').focus();
					} else if ($scope.user.name !== undefined && $scope.user.password === undefined) {
						$('#password').focus();
					}
				});

				$('#name').focus();

				$scope.loginOauth = function(provider) {
					$('body').removeClass('loaded');
					$window.location.href = '/auth/' + provider;
					console.log(provider);
				};
			}
		});
	});
