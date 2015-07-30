'use strict';

angular.module('buildAVotingAppApp')
	.controller('PollCtrl', function($scope, $routeParams, $http, Auth, socket, $timeout, $interval, $location) {
		$('body').removeClass('loaded');

		$scope.user = $routeParams.user;
		var poll = $routeParams.poll;
		var initial = true;
		var rendered = '';
		var scopeLength = 0;
		var scopeStatus = '';
		$scope.canVote = true;
		$scope.cantVote = '';
		$scope.voteOrChart = 'Vote';

		// device detection
		$scope.desktop = true;
		$scope.mobile = false;
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))){
			$scope.mobile = true;
			$scope.desktop = false;
		}

		$scope.poll = [];
		$scope.pollName = '';
		$scope.pollClosed = true;
		$scope.pollOptions = [];
		$scope.selectedOption = undefined;

		if (Auth.getCurrentUser().name === $scope.user) {
			$scope.isAuthor = true;
		} else {
			$scope.isAuthor = false;
		}

		$scope.vote = true;
		$scope.edit = false;
		$scope.button = 'vote';

		$http.get('/api/polls/' + $scope.user + '/' + poll).success(function(data) {
			$http.post('/api/polls/googl', {
				'longUrl': window.location.href
			}).success(function(googl) {
				$scope.googl = googl;
			}).error(function() {
				$scope.googl = window.location.href;
			});
			callback(data);
			callbackSync();
			$('body').addClass('loaded');

			socket.syncUpdates('poll', $scope.poll, function(event, item, array) {
				callback(array);
				$scope.pollName = $scope.poll[0].pollName;
				$scope.pollClosed = $scope.poll[0].pollClosed;
				$scope.pollOptions = $scope.poll[0].pollOptions;
				$scope.pollTotal = $scope.poll[0].pollTotal;
			});
		});

		$scope.$on('$destroy', function() {
			socket.unsyncUpdates('poll');
		});

		var callback = function(data) {
			$scope.poll = data;

			if ($scope.button === 'vote') {
				Auth.isLoggedInAsync(function(bool) {
					$scope.canVote = true;
					if (bool) {
						if ($scope.poll[0].pollClosed) {
							$scope.canVote = false;
							$scope.cantVote = 'This poll is closed for voting.';
						} else if (!$scope.poll[0].pollClosed) {
							for (var i in $scope.poll[0].pollVoted) {
								if ($scope.poll[0].pollVoted[i] === Auth.getCurrentUser()._id) {
									$scope.canVote = false;
									$scope.cantVote = 'You have already voted.';
								}
							}
						}
					} else if (!bool) {
						$scope.canVote = false;
						$scope.cantVote = 'Please login to vote.';
					}
				});

				$scope.averageColor = $scope.poll[0].pollOptions[0].color;
				for (var c = 0; c < $scope.poll[0].pollOptions.length; c++) {
					$scope.averageColor = $.xcolor.average($scope.averageColor, $scope.poll[0].pollOptions[c].color);
				}

				$timeout(function() {
					new Chart($('#chart').get(0).getContext('2d')).Doughnut($scope.poll[0].pollOptions, {
						animation: false,
						responsive: false
					});
					$('#textfill0').textfill();
					$('#textfill0').css('display', 'flex');
					$('#textfill0').css('display', '-webkit-flex');
					$('#textfill0').css({
						'flex-wrap': 'wrap',
						'-webkit-flex-wrap': 'wrap'
					});
					$('#textfill0').css({
						'align-items': 'center',
						'-webkit-align-items': 'center'
					});
					$('#textfill0').css({
						'justify-content': 'center',
						'-webkit-justify-content': 'center'
					});
					$('#textfill1').textfill();
					$('#textfill1').css('display', 'flex');
					$('#textfill1').css('display', '-webkit-flex');
					$('#textfill1').css({
						'flex-wrap': 'wrap',
						'-webkit-flex-wrap': 'wrap'
					});
					$('#textfill1').css({
						'align-items': 'center',
						'-webkit-align-items': 'center'
					});
					$('#textfill1').css({
						'justify-content': 'center',
						'-webkit-justify-content': 'center'
					});

					if (initial) {
						css();
					} else if (!initial) {
						if (rendered === 'left') {
							$('#chart').removeClass('chart-flex');
							$('#chart').addClass('chart');
							$('#left').css('display', 'block');
						} else if (rendered === 'right') {
							$('#left').css('display', 'block');
							$('#table').addClass('table-flex');
							$('#table').css('position', 'initial');
							$('#table').css('margin-bottom', '20px');
							$('#table').css('margin-top', '20px');
							$('#table').css('top', 0);
							$('#list-group').addClass('list-group-flex');
							$('#list-group').css('position', 'initial');
							$('#list-group').css('margin-bottom', '20px');
							$('#list-group').css('margin-top', '20px');
							$('#list-group').css('top', 0);
						}
						if ($scope.canVote && rendered !== '') {
							if ($('#list-group').height() >= $('#chart').height()) {
								$('#right').height($('#list-group').height() + 40);
								$('#left').height(0);
							} else if ($('#chart').height() > $('#list-group').height()) {
								$('#left').height($('#chart').height() + 45);
								$('#right').height(0);
							}
						} else if (!$scope.canVote && rendered !== '') {
							if ($('#table').height() >= $('#chart').height()) {
								$('#right').height($('#table').height() + 40);
								$('#left').height(0);
							} else if ($('#chart').height() > $('#table').height()) {
								$('#left').height($('#chart').height() + 45);
								$('#right').height(0);
							}
						}
						css();
					}

					new Chart($('#chart').get(0).getContext('2d')).Doughnut($scope.poll[0].pollOptions, {
						animation: false,
						responsive: false
					});
					$('#textfill0').textfill();
					$('#textfill0').css('display', 'flex');
					$('#textfill0').css('display', '-webkit-flex');
					$('#textfill0').css({
						'flex-wrap': 'wrap',
						'-webkit-flex-wrap': 'wrap'
					});
					$('#textfill0').css({
						'align-items': 'center',
						'-webkit-align-items': 'center'
					});
					$('#textfill0').css({
						'justify-content': 'center',
						'-webkit-justify-content': 'center'
					});
					$('#textfill1').textfill();
					$('#textfill1').css('display', 'flex');
					$('#textfill1').css('display', '-webkit-flex');
					$('#textfill1').css({
						'flex-wrap': 'wrap',
						'-webkit-flex-wrap': 'wrap'
					});
					$('#textfill1').css({
						'align-items': 'center',
						'-webkit-align-items': 'center'
					});
					$('#textfill1').css({
						'justify-content': 'center',
						'-webkit-justify-content': 'center'
					});
				}, 0);
			} else if ($scope.button === 'edit') {
				Auth.isLoggedInAsync(function(bool) {
					if (bool) {
						if ($scope.error.length !== 0) {
							$scope.reminder = 'Please submit to apply changes.';
						} else {
							$scope.reminder = '';
						}
					}
				});
			}
		};

		var callbackSync = function() {
			$scope.pollName = $scope.poll[0].pollName;
			$scope.pollClosed = $scope.poll[0].pollClosed;
			$scope.pollOptions = $scope.poll[0].pollOptions;
			$scope.pollTotal = $scope.poll[0].pollTotal;
			if (!$scope.pollClosed) {
				$('#pollOpen').removeClass('btn-default');
				$('#pollOpen').addClass('btn-success');
				$('#pollClosed').removeClass('btn-danger');
				$('#pollClosed').addClass('btn-default');
			} else if ($scope.pollClosed) {
				$('#pollClosed').removeClass('btn-default');
				$('#pollClosed').addClass('btn-danger');
				$('#pollOpen').removeClass('btn-success');
				$('#pollOpen').addClass('btn-default');
			}
			$timeout(function() {
				$('#pollName').prop('disabled', true);
				for (var a in $scope.pollOptions) {
					$('#pollOption' + a).prop('disabled', true);
					$('#pollOptionMinus' + a).children().prop('disabled', true);
				}
				$('#pollOptionColor' + ($scope.pollOptions.length - 1)).children().removeClass('pollOptionColor').addClass('pollOptionColorLast');
			}, 0);
			scopeLength = $scope.poll[0].pollOptions.length;
			if ($scope.poll[0].pollClosed) {
				scopeStatus = true;
			} else if (!$scope.poll[0].pollClosed) {
				scopeStatus = false;
			}
			$('body').addClass('loaded');
		};

		var css = function() {
			if ($('#right').height() >= $('#left').height() && $(document).width() >= 980) {
				$('#chart').removeClass('chart');
				$('#chart').addClass('chart-flex');
				$('#left').height($('#right').height());
				$('#right').height($('#right').height());
				$('#left').css('display', 'flex');
				$('#left').css('display', '-webkit-flex');
				$('#left').css({
					'flex-wrap': 'wrap',
					'-webkit-flex-wrap': 'wrap'
				});
				$('#left').css({
					'align-items': 'center',
					'-webkit-align-items': 'center'
				});
				$('#left').css({
					'justify-content': 'center',
					'-webkit-justify-content': 'center'
				});
				initial = false;
				rendered = 'left';
			} else if ($('#left').height() > $('#right').height() && $(document).width() >= 980) {
				$('#right').height($('#left').height());
				$('#left').height($('#left').height());
				$('#left').css('display', 'flex');
				$('#left').css('display', '-webkit-flex');
				$('#left').css({
					'flex-wrap': 'wrap',
					'-webkit-flex-wrap': 'wrap'
				});
				$('#left').css({
					'align-items': 'center',
					'-webkit-align-items': 'center'
				});
				$('#left').css({
					'justify-content': 'center',
					'-webkit-justify-content': 'center'
				});
				$('#table').removeClass('table-flex');
				$('#table').css('position', 'absolute');
				$('#table').css('margin-bottom', 0);
				$('#table').css('margin-top', 0);
				$('#table').css('top', ($('#right').height() - $('#table').height()) / 2);
				$('#list-group').removeClass('list-group-flex');
				$('#list-group').css('position', 'relative');
				$('#list-group').css('margin-bottom', 0);
				$('#list-group').css('margin-top', 0);
				$('#list-group').css('top', ($('#right').height() - $('#list-group').height()) / 2);
				initial = false;
				rendered = 'right';
			} else if ($(document).width() < 980) {
				$('#left').css('display', 'flex');
				$('#left').css('display', '-webkit-flex');
				$('#left').css({
					'flex-wrap': 'wrap',
					'-webkit-flex-wrap': 'wrap'
				});
				$('#left').css({
					'align-items': 'center',
					'-webkit-align-items': 'center'
				});
				$('#left').css({
					'justify-content': 'center',
					'-webkit-justify-content': 'center'
				});
				initial = false;
				rendered = '';
			}
		};

		$scope.withinScope = function(index) {
			if (index < scopeLength) {
				return true;
			} else {
				return false;
			}
		};

		$scope.selectOption = function(index) {
			for (var j in $scope.poll[0].pollOptions) {
				$('#voteOption' + j).removeClass('list-group-item-success');
				$('#voteOption' + j).addClass('list-group-item');
			}
			$('#voteOption' + index).addClass('list-group-item-success');
			$scope.selectedOption = index;
		};

		$scope.submitVote = function() {
			Auth.isLoggedInAsync(function(bool) {
				if (bool) {
					var votePollFlag = true;
					$scope.voteError = '';
					$scope.poll[0].pollVoted.forEach(function(userId) {
						if (userId === Auth.getCurrentUser()._id) {
							votePollFlag = false;
							$scope.voteError = 'You have already voted.';
							return;
						}
					});
					if ($scope.selectedOption === undefined) {
						votePollFlag = false;
						$scope.voteError = 'Please select a poll option to vote.';
						return;
					}
					if ($scope.poll[0].pollOptions.length > scopeLength || $scope.pollClosed !== scopeStatus) {
						votePollFlag = false;
						$scope.voteError = 'Please submit edited changes before voting.';
						return;
					}
					if (votePollFlag) {
						$scope.poll[0].pollOptions[$scope.selectedOption].value++;
						$scope.poll[0].pollTotal++;
						$scope.poll[0].pollVoted.push(Auth.getCurrentUser()._id);
						$http.put('/api/polls/' + $scope.poll[0]._id, $scope.poll[0]);
						$scope.canVote = false;
						$scope.pollOptions = $scope.poll[0].pollOptions;
						$scope.pollTotal = $scope.poll[0].pollTotal;
						$scope.voteError = '';
						callback($scope.poll);
						callbackSync();
					}
				} else if (!bool) {
					return;
				}
			});
		};

		$scope.pollStatus = function(status) {
			if (status === 'open') {
				$('#pollClosed').removeClass('btn-danger');
				$('#pollClosed').addClass('btn-default');
				$('#pollOpen').removeClass('btn-default');
				$('#pollOpen').addClass('btn-success');
				$scope.pollClosed = false;
			} else if (status === 'closed') {
				$('#pollOpen').removeClass('btn-success');
				$('#pollOpen').addClass('btn-default');
				$('#pollClosed').removeClass('btn-default');
				$('#pollClosed').addClass('btn-danger');
				$scope.pollClosed = true;
			}
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

		var randomColor = function() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var a = 0; a < 6; a++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		};

		$scope.morePollOption = function() {
			$scope.pollOptions.push({
				'value': 0,
				'color': randomColor()
			});
			$timeout(function() {
				$('#pollOption' + ($scope.pollOptions.length - 1)).focus();
			}, 0);

			$timeout(function() {
				$('#pollOptionColor' + ($scope.pollOptions.length - 2)).children().removeClass('pollOptionColorLast').addClass('pollOptionColor');
				$('#pollOptionColor' + ($scope.pollOptions.length - 1)).children().removeClass('pollOptionColor').addClass('pollOptionColorLast');
			}, 0);
		};

		$scope.generateRandomColor = function(index) {
			$scope.pollOptions[index].color = randomColor();
		};

		$scope.error = {};

		$scope.submitPoll = function() {
			Auth.isLoggedInAsync(function(bool) {
				if (bool && Auth.getCurrentUser().name === $scope.user && document.getElementsByClassName('has-error').length === 1) {
					$scope.error = {};
					$('#pollNameParent').removeClass('has-error');
					for (var p in $scope.pollOptions) {
						$('#pollOptionParent' + p).removeClass('has-error');
					}

					var blankName = false;
					if ($scope.pollName === undefined || $scope.pollName === '') {
						$scope.reminder = '';
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
							$scope.reminder = '';
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
							$scope.reminder = '';
							duplicateOption = true;
							$scope.error.option = 'Poll options should not duplicate each other.';
							for (var o = 0; o < duplicate.length; o++) {
								if ($('#pollOption' + duplicate[o]).is(':enabled')) {
									$('#pollOptionParent' + duplicate[o]).addClass('has-error');
								}
							}
							var enabledError = [];
							for (var d in $scope.pollOptions) {
								if ($('#pollOption' + d).is(':enabled') && $('#pollOptionParent' + d).hasClass('has-error')) {
									enabledError.push(d);
								}
							}
							$('#pollOption' + enabledError[0]).focus();
							return;
						}
					}

					if (blankName || blankOption || duplicateOption) {
						return;
					} else if (!blankName && !blankOption && !duplicateOption) {
						$scope.poll[0].pollName = $scope.pollName;
						$scope.poll[0].pollClosed = $scope.pollClosed;
						$scope.poll[0].pollOptions = $scope.pollOptions;
						$http.put('/api/polls/' + $scope.poll[0]._id, $scope.poll[0]);
						$timeout(function() {
							for (var a in $scope.pollOptions) {
								$('#pollOption' + a).prop('disabled', true);
								$('#pollOptionMinus' + a).children().prop('disabled', true);
							}
							$('#pollOptionPlus').prop('disabled', true);
							$('#submit').prop('disabled', true);
							$('#delete').prop('disabled', true);
							$('#pollOpen').prop('disabled', true);
							$('#pollClosed').prop('disabled', true);
						}, 0);
						$scope.reminder = '';
						$scope.success = 'Poll updated. Redirecting to your updated poll page.';
						$('body').removeClass('loaded');
						$timeout(function() {
							$scope.vote = true;
							$scope.edit = false;
							$scope.button = 'vote';
							$scope.voteError = '';
							$scope.success = '';
							$scope.reminder = 'Please submit to apply changes.';
							callback($scope.poll);
							callbackSync();
							$('#pollOptionPlus').prop('disabled', false);
							$('#submit').prop('disabled', false);
							$('#delete').prop('disabled', false);
							$('#pollOpen').prop('disabled', false);
							$('#pollClosed').prop('disabled', false);
						}, 1000);
					}
				} else if (bool && Auth.getCurrentUser().name === $scope.user && document.getElementsByClassName('has-error').length > 1) {
					$('.has-error').eq(0).children('input').focus();
				}
			});
		};

		$scope.voteButton = function() {
			$timeout(function() {
				$scope.button = 'vote';
				callback($scope.poll);
			}, 0);
		};

		$scope.editButton = function() {
			$('#edit').on('click', function() {
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
					}
				}
			});
			$scope.button = 'edit';
			callback($scope.poll);
		};

		$scope.delete = function() {
			if (Auth.getCurrentUser()._id === $scope.poll[0].authorId) {
				$http.delete('/api/polls/' + $scope.poll[0]._id);
				$scope.error = {};
				$timeout(function() {
					for (var z in $scope.pollOptions) {
						$('#pollOptionParent' + z).removeClass('has-error');
						$('#pollOption' + z).prop('disabled', true);
						$('#pollOptionMinus' + z).children().prop('disabled', true);
					}
				}, 0);
				$('#pollOptionPlus').prop('disabled', true);
				$('#submit').prop('disabled', true);
				$('#delete').prop('disabled', true);
				$('#pollOpen').prop('disabled', true);
				$('#pollClosed').prop('disabled', true);
				$scope.success = 'Poll deleted. Redirecting to your profile page.';
				$('body').removeClass('loaded');
				$timeout(function() {
					$location.path('/' + Auth.getCurrentUser().name);
				}, 1000);
			}
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
				if ($scope.voteError === '' || $scope.voteError === undefined) {
					$('#voteOption' + s).on('click', function() {
						$scope.voteError = '';
					});
				}
			});
			if (document.getElementsByClassName('has-error').length === 1) {
				$scope.error = {};
				if ($scope.success === '' || $scope.success === undefined) {
					$scope.reminder = 'Please submit to apply changes.';
				} else {
					$scope.reminder = '';
				}
			}
			if ($scope.canVote) {
				$scope.voteOrChart = 'Cast Vote';
			} else if (!$scope.canVote) {
				$scope.voteOrChart = 'Poll Chart';
			}
		}, 50);

		$('.help-block').each(function() {
			$(this).width($(this).parent().parent().width() - $('#pollOptionPlus').parent().width() - 2);
		});
		$('.help-block-success').css('left', '15px');
		$('.help-block-reminder').css('left', '15px');

		/* center modal */
		var centerModals = function($element) {
			var $modals;
			if ($element.length) {
				$modals = $element;
			} else {
				$modals = $('.modal-vcenter:visible');
			}
			$modals.each(function() {
				var $clone = $(this).clone().css('display', 'block').appendTo('body');
				var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
				top = top > 0 ? top : 0;
				$clone.remove();
				$(this).find('.modal-content').css('margin-top', top);
			});
		};
		$('.modal-vcenter').on('show.bs.modal', function() {
			centerModals($(this));
		});
		$(window).on('resize', centerModals);
	});
