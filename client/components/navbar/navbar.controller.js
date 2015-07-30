'use strict';

angular.module('buildAVotingAppApp')
	.controller('NavbarCtrl', function($scope, $location, Auth) {
		$scope.isCollapsed = true;
		$scope.isLoggedIn = Auth.isLoggedIn;
		$scope.isAdmin = Auth.isAdmin;
		$scope.getCurrentUser = Auth.getCurrentUser;

		$scope.isActive = function(route) {
			return route === $location.path();
		};

		$scope.isCreate = function(query) {
			return query === $location.search().action;
		};

		$('[data-toggle="tooltip"]').tooltip();

		if(!$scope.isActive('/polls')){
			$('#polls').on('click', function(){$('body').removeClass('loaded');});
		}
		if(!$scope.isActive('/' + $scope.getCurrentUser().name) && $scope.isCreate(undefined)){
			$('#user').on('click', function(){$('body').removeClass('loaded');});
		}
		if(!$scope.isActive('/' + $scope.getCurrentUser().name) && $scope.isCreate('create')){
			$('#create').on('click', function(){$('body').removeClass('loaded');});
		}
	});
