'use strict';

describe('Controller: PollCtrl', function() {

	// load the controller's module
	beforeEach(module('buildAVotingAppApp'));
	beforeEach(module('socketMock'));

	var PollCtrl,
		scope,
		$httpBackend;

	// Initialize the controller and a mock scope
	beforeEach(inject(function(_$httpBackend_, $controller, $rootScope) {
		$httpBackend = _$httpBackend_;
		$httpBackend.expectGET('/api/polls')
			.respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

		scope = $rootScope.$new();
		PollCtrl = $controller('PollCtrl', {
			$scope: scope
		});
	}));

	it('should ...', function() {
		expect(1).toEqual(1);
	});
});
