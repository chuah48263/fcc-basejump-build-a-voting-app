'use strict';

describe('Controller: MainCtrl', function() {

	// load the controller's module
	beforeEach(module('buildAVotingAppApp'));
	beforeEach(module('socketMock'));

	var MainCtrl,
		scope,
		$httpBackend;

	// Initialize the controller and a mock scope
	beforeEach(inject(function(_$httpBackend_, $controller, $rootScope) {
		$httpBackend = _$httpBackend_;
		$httpBackend.expectGET('/api/polls')
			.respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

		scope = $rootScope.$new();
		MainCtrl = $controller('MainCtrl', {
			$scope: scope
		});
	}));

	it('should ...', function() {
		expect(1).toEqual(1);
	});
});
