'use strict';

angular.module('buildAVotingAppApp')
	.controller('MainCtrl', function($scope, $http, socket, Auth) {
		$('body').addClass('loaded');

		// $scope.awesomeThings = [];
		// $scope.getCurrentUser = Auth.getCurrentUser();
		// Auth.isLoggedInAsync(function(bool) {
		// 	if (bool) {
		// 		$http.get('/api/things').success(function(awesomeThings) {
		// 			$scope.awesomeThings = awesomeThings;
		// 			socket.syncUpdates('thing', $scope.awesomeThings);
		// 			console.log(awesomeThings);
		// 		});
		// 		$scope.addThing = function() {
		// 			if ($scope.newThing === '') {
		// 				return;
		// 			}
		// 			$http.post('/api/things', {
		// 				name: $scope.newThing,
		// 				zzz: 'zzz'
		// 			});
		// 			$scope.newThing = '';
		// 		};

		// 		$scope.deleteThing = function(thing) {
		// 			$http.delete('/api/things/' + thing._id);
		// 		};

		// 		$scope.$on('$destroy', function() {
		// 			socket.unsyncUpdates('thing');
		// 		});
		// 	} else {
		// 		return;
		// 	}
		// });


		function randomColor() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		}

		$scope.polls = [];
		$http.get('/api/polls').success(function(polls) {
			$scope.polls = polls;
			socket.syncUpdates('poll', $scope.polls);
			console.log(polls);
		});
		$scope.addPoll = function() {
			var addPollFlag = true;
			$scope.pollOptions.forEach(function(pollOption){
				if(pollOption.label === ''){
					addPollFlag = false;
				}
			});
			if ($scope.pollName === '' || $scope.pollOptions.length === 1 || !addPollFlag) {
				return;
			}else{
				$http.post('/api/polls', {
					authorId: Auth.getCurrentUser()._id,
					authorName: Auth.getCurrentUser().name,
					pollName: $scope.pollName,
					pollTitle: $scope.pollName.toLowerCase().replace(/[\W_]/gi, '-'),
					pollOptions: $scope.pollOptions,
					pollVoted: [],
					pollTotal: 0,
					pollId: $scope.polls.length,
					pollClosed: true,
					url: '/' + Auth.getCurrentUser().name + '/' + $scope.pollName.toLowerCase().replace(/[\W_]/gi, '-')
				});
				$scope.pollName = '';
				$scope.pollOptions = [{'value': 0, 'color': randomColor()}, {'value': 0, 'color': randomColor()}];
			}
		};

		$scope.deletePoll = function(poll) {
			if(Auth.getCurrentUser()._id === poll.authorId){
				$http.delete('/api/polls/' + poll._id);
			}else if(Auth.isAdmin){
				$http.delete('/api/polls/' + poll._id);
			}
		};

		$scope.$on('$destroy', function() {
			socket.unsyncUpdates('poll');
		});

		$scope.pollOptions = [{'value': 0, 'color': randomColor()}, {'value': 0, 'color': randomColor()}];

		$scope.addPollOption = function() {
			$scope.pollOptions.push({
				'value': 0,
				'color': randomColor()
			});
		};
		$scope.removePollOption = function(index) {
			if($scope.pollOptions === 1){
				$scope.pollOptions = [{'value': 0, 'color': randomColor()}];
			}else{
				$scope.pollOptions.splice(index, 1);
			}
		};

		$scope.votePoll = function(poll, index){
			var votePollFlag = true;
			poll.pollVoted.forEach(function(userId){
				if(userId === Auth.getCurrentUser()._id){
					votePollFlag = false;
				}
			});
			if(votePollFlag){
				poll.pollOptions[index].value++;
				poll.pollTotal++;
				poll.pollVoted.push(Auth.getCurrentUser()._id);
				$http.put('/api/polls/' + poll._id, poll);
			}
		};
	});
