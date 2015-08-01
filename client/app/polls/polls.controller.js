'use strict';

angular.module('buildAVotingAppApp')
	.controller('PollsCtrl', function($scope, $http, socket, $timeout, $location, $interval) {
		$('body').removeClass('loaded');

		$scope.polls = [];
		$scope.charts = [];
		$scope.noPoll = true;

		$scope.order = [{
			'title': 'Vote Count',
			'value': ['-pollTotal', 'pollName']
		}, {
			'title': 'Poll Name',
			'value': ['pollName']
		}, {
			'title': 'Creation Time',
			'value': ['-pollId']
		}];

		$scope.filter = ['All', 'Open', 'Closed'];

		$scope.filterBy = function(status) {
			if ($scope.filterByData === 'All') {
				return true;
			} else if ($scope.filterByData === 'Open') {
				if (status === true) {
					return false;
				} else if (status === false) {
					return true;
				}
			} else if ($scope.filterByData === 'Closed') {
				if (status === true) {
					return true;
				} else if (status === false) {
					return false;
				}
			}
		};

		$http.get('/api/polls').success(function(polls) {
			callback(polls);
			$('body').addClass('loaded');
			socket.syncUpdates('poll', $scope.polls, function(event, item, array) {
				callback(array);
			});
		});

		$scope.$on('$destroy', function() {
			socket.unsyncUpdates('poll');
		});

		var callback = function(polls) {
			if (polls.length !== 0) {
				$scope.noPoll = false;
				$scope.polls = polls;
				$timeout(function() {
					for (var i in $scope.polls) {
						new Chart($('#chart' + $scope.polls[i].pollId).get(0).getContext('2d')).Doughnut($scope.polls[i].pollOptions, {
							animation: false,
							responsive: false
						});
						$('#textfill' + $scope.polls[i].pollId).textfill();
						$('#textfill' + $scope.polls[i].pollId).css('display', 'flex');
						$('#textfill' + $scope.polls[i].pollId).css('flex-wrap', 'wrap');
						$('#textfill' + $scope.polls[i].pollId).css('align-items', 'center');
						$('#textfill' + $scope.polls[i].pollId).css('justify-content', 'center');
					}
					var maxHeight = Math.max.apply(Math, $('#thumbnail').map(function() {
						return $(this).height();
					}));
					$('#thumbnail').each(function(){
						$(this).height(maxHeight);
					});

					for (var i in $scope.polls) {
						new Chart($('#chart' + $scope.polls[i].pollId).get(0).getContext('2d')).Doughnut($scope.polls[i].pollOptions, {
							animation: false,
							responsive: false
						});
						$('#textfill' + $scope.polls[i].pollId).textfill();
						$('#textfill' + $scope.polls[i].pollId).css('display', 'flex');
						$('#textfill' + $scope.polls[i].pollId).css('flex-wrap', 'wrap');
						$('#textfill' + $scope.polls[i].pollId).css('align-items', 'center');
						$('#textfill' + $scope.polls[i].pollId).css('justify-content', 'center');
					}
					var maxHeight = Math.max.apply(Math, $('#thumbnail').map(function() {
						return $(this).height();
					}));
					$('#thumbnail').each(function(){
						$(this).height(maxHeight);
					});
				}, 0);
			} else {
				$scope.noPoll = true;
			}
			$('body').addClass('loaded');
		};

		$scope.vote = function(url) {
			$('body').removeClass('loaded');
			$location.path(url);
		};

		$scope.searchButton = function(){
			$scope.searched = $scope.search;
			$('body').removeClass('loaded');
			$timeout(function(){
				callback($scope.polls);
			}, 0);
		};

		$interval(function(){
			$scope.polls.forEach(function(poll, z){
				$('#href' + z).on('click', function(){
					$('body').removeClass('loaded');
				});
			});
		}, 50);
	});
