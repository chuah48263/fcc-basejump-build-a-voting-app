'use strict';

describe('Controller: UserCtrl', function() {

	// load the controller's module
	beforeEach(module('buildAVotingAppApp'));
	beforeEach(module('socketMock'));

	var UserCtrl,
		scope,
		$httpBackend;

	// Initialize the controller and a mock scope
	beforeEach(inject(function(_$httpBackend_, $controller, $rootScope) {
		$httpBackend = _$httpBackend_;
		$httpBackend.expectGET('/api/polls')
			.respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

		scope = $rootScope.$new();
		UserCtrl = $controller('UserCtrl', {
			$scope: scope
		});
	}));

	it('should ...', function() {
		expect(1).toEqual(1);
	});
});
