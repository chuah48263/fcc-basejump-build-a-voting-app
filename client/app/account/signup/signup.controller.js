'use strict';

angular.module('buildAVotingAppApp')
	.controller('SignupCtrl', function($scope, Auth, $window, $timeout) {
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

				$scope.register = function(form) {
					$scope.submitted = true;

					if ($scope.user.name !== undefined) {
						if ($scope.user.name.search(/\s/g) !== -1 || $scope.user.name.search(/@/g) !== -1) {
							$scope.errors = {};
							form.name.$setValidity('mongoose', false);
							$scope.errors.name = 'Space or @ is not permitted within username.';
							$('#name').focus();
						}
					}

					if (form.$valid) {
						Auth.createUser({
								name: $scope.user.name,
								email: $scope.user.email,
								password: $scope.user.password
							})
							.then(function() {
								// Account created, redirecting
								$scope.success = true;
								$scope.message = 'Registration completed. Redirecting to your previous page.';
								$('body').removeClass('loaded');
								$timeout(function() {
									$window.history.back();
								}, 1000);
							})
							.catch(function(err) {
								err = err.data;
								$scope.errors = {};

								// Update validity of form fields that match the mongoose errors
								angular.forEach(err.errors, function(error, field) {
									form[field].$setValidity('mongoose', false);
									$scope.errors[field] = error.message;
									$('#' + field).focus();
								});
							});
					}
				};

				$('input').on('click', function() {
					$(this).focus();
				});

				$('#submit').on('click', function() {
					if ($scope.user.name === undefined && $scope.user.email === undefined && $scope.user.password === undefined) {
						$('#name').focus();
					} else if ($scope.user.name === undefined && $scope.user.email === undefined && $scope.user.password !== undefined) {
						$('#name').focus();
					} else if ($scope.user.name === undefined && $scope.user.email !== undefined && $scope.user.password === undefined) {
						$('#name').focus();
					} else if ($scope.user.name === undefined && $scope.user.email !== undefined && $scope.user.password !== undefined) {
						$('#name').focus();
					} else if ($scope.user.name !== undefined && $scope.user.email === undefined && $scope.user.password === undefined) {
						$('#email').focus();
					} else if ($scope.user.name !== undefined && $scope.user.email === undefined && $scope.user.password !== undefined) {
						$('#email').focus();
					} else if ($scope.user.name !== undefined && $scope.user.email !== undefined && $scope.user.password === undefined) {
						$('#password').focus();
					}
				});

				$('#name').focus();

				// $scope.loginOauth = function(provider) {
				// 	$('body').removeClass('loaded');
				// 	$window.location.href = '/auth/' + provider;
				// };
			}
		});
	});
