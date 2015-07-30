'use strict';

angular.module('buildAVotingAppApp')
	.controller('UserCtrl', function($scope, $http, socket, $timeout, $location, $routeParams, Auth, $interval) {
		$('body').removeClass('loaded');

		$scope.user = $routeParams.user;

		if (Auth.getCurrentUser().name === $scope.user) {
			$scope.isAuthor = true;
		} else {
			$scope.isAuthor = false;
		}

		$scope.view = true;
		$scope.create = false;
		$scope.noPoll = true;
		$scope.polls = [];
		$scope.charts = [];
		var initial = true;

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

		$http.get('/api/polls/' + $scope.user).success(function(polls) {
			callback(polls);
			$('body').addClass('loaded');
			socket.syncUpdates('poll', $scope.polls, function(event, item, array) {
				if($scope.view && !$scope.create){
					callback(array);
				}
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
						$('#textfill' + $scope.polls[i].pollId).css('display', '-webkit-flex');
						$('#textfill' + $scope.polls[i].pollId).css({
							'flex-wrap': 'wrap',
							'-webkit-flex-wrap': 'wrap'
						});
						$('#textfill' + $scope.polls[i].pollId).css({
							'align-items': 'center',
							'-webkit-align-items': 'center'
						});
						$('#textfill' + $scope.polls[i].pollId).css({
							'justify-content': 'center',
							'-webkit-justify-content': 'center'
						});
					}
					var maxHeight = Math.max.apply(Math, $('#thumbnail').map(function() {
						return $(this).height();
					}));
					$('#thumbnail').each(function() {
						$(this).height(maxHeight);
					});

					for (var i in $scope.polls) {
						new Chart($('#chart' + $scope.polls[i].pollId).get(0).getContext('2d')).Doughnut($scope.polls[i].pollOptions, {
							animation: false,
							responsive: false
						});
						$('#textfill' + $scope.polls[i].pollId).textfill();
						$('#textfill' + $scope.polls[i].pollId).css('display', 'flex');
						$('#textfill' + $scope.polls[i].pollId).css('display', '-webkit-flex');
						$('#textfill' + $scope.polls[i].pollId).css({
							'flex-wrap': 'wrap',
							'-webkit-flex-wrap': 'wrap'
						});
						$('#textfill' + $scope.polls[i].pollId).css({
							'align-items': 'center',
							'-webkit-align-items': 'center'
						});
						$('#textfill' + $scope.polls[i].pollId).css({
							'justify-content': 'center',
							'-webkit-justify-content': 'center'
						});
					}
					var maxHeight = Math.max.apply(Math, $('#thumbnail').map(function() {
						return $(this).height();
					}));
					$('#thumbnail').each(function() {
						$(this).height(maxHeight);
					});

					if(initial){
						if ($location.search().action === 'create') {
							$scope.create = true;
							$scope.view = false;
							$timeout(function(){
								$('#pollName').focus();
							}, 0);
						}
						initial = false;
					}
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

		$scope.viewButton = function() {
			$('body').removeClass('loaded');
			$timeout(function(){
				callback($scope.polls);
			}, 0);
			$('#user').parent().addClass('active');
			$('#create').parent().removeClass('active');
		};

		$scope.createButton = function() {
			$('#createButton').on('click', function() {
				if (document.getElementsByClassName('has-error').length > 1) {
					$('.has-error').eq(0).children('input').focus();
					return;
				} else {
					if ($scope.pollName === undefined || $scope.pollName === '') {
						$('#pollName').focus();
						return;
					} else {
						for (var r in $scope.pollOptions) {
							if ($scope.pollOptions[r].label === undefined || $scope.pollOptions[r].label === '') {
								$('#pollOption' + r).focus();
								return;
							}
						}
						$('#submit').focus();
					}
				}
			});
			$('#create').parent().addClass('active');
			$('#user').parent().removeClass('active');
		};

		var randomColor = function() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var a = 0; a < 6; a++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		};

		$scope.pollOptions = [{
			'value': 0,
			'color': randomColor()
		}, {
			'value': 0,
			'color': randomColor()
		}];
		$timeout(function() {
			$('#pollOptionColor' + ($scope.pollOptions.length - 1)).children().removeClass('pollOptionColor').addClass('pollOptionColorLast');
		}, 0);

		$scope.morePollOption = function() {
			$scope.pollOptions.push({
				'value': 0,
				'color': randomColor()
			});
			$timeout(function() {
				$('#pollOption' + ($scope.pollOptions.length - 1)).focus();
				$('#pollOptionColor' + ($scope.pollOptions.length - 2)).children().removeClass('pollOptionColorLast').addClass('pollOptionColor');
				$('#pollOptionColor' + ($scope.pollOptions.length - 1)).children().removeClass('pollOptionColor').addClass('pollOptionColorLast');
			}, 0);
		};
		$scope.removePollOption = function(index) {
			var hasError = [];
			for (var z in $scope.pollOptions) {
				if ($('#pollOption' + z).parent().hasClass('has-error')) {
					hasError.push(z);
				}
			}
			if ($scope.pollOptions.length > 2) {
				$scope.pollOptions.splice(index, 1);
				if ($('#pollOption' + index).parent().hasClass('has-error')) {
					$('#pollOption' + index).parent().removeClass('has-error');
				}
				for (var y in hasError) {
					if (index < hasError[y]) {
						$('#pollOption' + hasError[y]).parent().removeClass('has-error');
						$('#pollOption' + (hasError[y] - 1)).parent().addClass('has-error');
					}
				}
			} else if ($scope.pollOptions.length <= 2) {
				$scope.pollOptions[index].label = '';
				$('#pollOption' + index).parent().removeClass('has-error');
			}
			if (index === $scope.pollOptions.length) {
				$('#pollOption' + (index - 1)).focus();
			} else {
				$('#pollOption' + index).focus();
			}
			$timeout(function() {
				$('#pollOptionColor' + ($scope.pollOptions.length - 1)).children().removeClass('pollOptionColor').addClass('pollOptionColorLast');
			}, 0);
		};

		$scope.generateRandomColor = function(index) {
			$scope.pollOptions[index].color = randomColor();
		};

		$scope.error = {};

		$scope.createPoll = function() {
			Auth.isLoggedInAsync(function(bool) {
				if (bool && Auth.getCurrentUser().name === $scope.user && document.getElementsByClassName('has-error').length === 1) {
					$scope.error = {};
					$('#pollNameParent').removeClass('has-error');
					for (var p in $scope.pollOptions) {
						$('#pollOptionParent' + p).removeClass('has-error');
					}

					var blankName = false;
					if ($scope.pollName === undefined || $scope.pollName === '') {
						blankName = true;
						$scope.error.name = 'Poll name is required.';
						$('#pollName').focus();
						$('#pollNameParent').addClass('has-error');
						return;
					}

					var blankOption = false;
					var blank = [];
					for (var q in $scope.pollOptions) {
						if ($scope.pollOptions[q].label === undefined || $scope.pollOptions[q].label === '') {
							blankOption = true;
							$scope.error.option = 'Poll options should not be blank.';
							$('#pollOptionParent' + q).addClass('has-error');
							blank.push(q);
						}
					}
					if (blank.length > 0) {
						$('#pollOption' + blank[0]).focus();
						return;
					}

					var duplicateOption = false;
					if (!blankOption) {
						var duplicates = [];
						for (var j in $scope.pollOptions) {
							for (var k in $scope.pollOptions) {
								if ($scope.pollOptions[j].label === $scope.pollOptions[k].label) {
									duplicates.push(j);
								}
							}
						}
						var duplicate = [];
						for (var l = duplicates.length - 1; l >= 0; l--) {
							if (duplicates[l] === duplicates[l + 1]) {
								duplicate.push(duplicates[l]);
							}
						}
						var removeDuplicate = function() {
							for (var m = duplicate.length - 1; m >= 0; m--) {
								if (duplicate[m] === duplicate[m + 1]) {
									duplicate.splice(m, 1);
								}
							}
						};
						for (var n = $scope.pollOptions.length - 1; n > 0; n--) {
							n--;
							removeDuplicate();
						}
						duplicate.reverse();
						if (duplicates.length !== $scope.pollOptions.length) {
							duplicateOption = true;
							$scope.error.option = 'Poll options should not duplicate each other.';
							$('#pollOption' + duplicate[0]).focus();
							for (var o = 0; o < duplicate.length; o++) {
								$('#pollOptionParent' + duplicate[o]).addClass('has-error');
							}
							return;
						}
					}

					if (blankName || blankOption || duplicateOption) {
						return;
					} else if (!blankName && !blankOption && !duplicateOption) {
						$http.get('/api/polls/' + Auth.getCurrentUser().name + '/' + $scope.pollName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')).success(function(poll) {
							if (poll.length === 0) {
								$http.get('/api/polls/count').success(function(count) {
									$http.post('/api/polls', {
										authorId: Auth.getCurrentUser()._id,
										authorName: Auth.getCurrentUser().name,
										pollName: $scope.pollName,
										pollTitle: $scope.pollName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-'),
										pollOptions: $scope.pollOptions,
										pollVoted: [],
										pollTotal: 0,
										pollId: count,
										pollClosed: false,
										url: '/' + Auth.getCurrentUser().name + '/' + $scope.pollName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
									});
								}).error(function() {
									$http.post('/api/polls', {
										authorId: Auth.getCurrentUser()._id,
										authorName: Auth.getCurrentUser().name,
										pollName: $scope.pollName,
										pollTitle: $scope.pollName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-'),
										pollOptions: $scope.pollOptions,
										pollVoted: [],
										pollTotal: 0,
										pollId: 0,
										pollClosed: false,
										url: '/' + Auth.getCurrentUser().name + '/' + $scope.pollName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
									});
								});
								$scope.success = 'Poll created. Redirecting to your created poll page.';
								$scope.created = true;
								$('body').removeClass('loaded');
								$timeout(function() {
									$location.path('/' + Auth.getCurrentUser().name + '/' + $scope.pollName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-'));
								}, 1000);
							} else {
								$scope.error.name = 'Poll name existed, please try another.';
								$('#pollName').focus();
								$('#pollNameParent').addClass('has-error');
							}
						});
					}
				} else if (bool && Auth.getCurrentUser().name === $scope.user && document.getElementsByClassName('has-error').length > 1) {
					$('.has-error').eq(0).children('input').focus();
				}
			});
		};

		$interval(function() {

			if ($('#pollNameParent').hasClass('has-error')) {
				$('#pollName').on('keydown', function() {
					$(this).parent().removeClass('has-error');
				});
			}

			$scope.pollOptions.forEach(function(pollOption, s) {
				if ($('#pollOption' + s).parent().hasClass('has-error')) {
					$('#pollOption' + s).on('keydown', function() {
						$(this).parent().removeClass('has-error');
					});
				}
			});
			if (document.getElementsByClassName('has-error').length === 1) {
				$scope.error = {};
			}
		}, 50);

		$('.help-block').each(function() {
			$(this).width($(this).parent().parent().width() - $('#pollOptionPlus').parent().width() - 2);
		});
		$('.help-block-success').css('left', '15px');
	});
