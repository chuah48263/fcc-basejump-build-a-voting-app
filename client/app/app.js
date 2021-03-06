'use strict';

angular.module('buildAVotingAppApp', [
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngRoute',
		'btford.socket-io',
		'ui.bootstrap',
		'ngClipboard'
	])
	.config(function($routeProvider, $locationProvider, $httpProvider, ngClipProvider) {
		$routeProvider
			.when('/polls', {
				redirectTo: '/polls'
			})
			.when('/admin', {
				redirectTo: '/admin'
			})
			.when('/login', {
				redirectTo: '/login'
			})
			.when('/logout', {
				redirectTo: '/logout'
			})
			.when('/signup', {
				redirectTo: '/signup'
			})
			.when('/settings', {
				redirectTo: '/settings'
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode(true);
		$httpProvider.interceptors.push('authInterceptor');
		ngClipProvider.setPath('bower_components/zeroclipboard/dist/ZeroClipboard.swf');
	})

.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
	return {
		// Add authorization token to headers
		request: function(config) {
			config.headers = config.headers || {};
			if ($cookieStore.get('token')) {
				config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
			}
			return config;
		},

		// Intercept 401s and redirect you to login
		responseError: function(response) {
			if (response.status === 401) {
				$location.path('/login');
				// remove any stale tokens
				$cookieStore.remove('token');
				return $q.reject(response);
			} else {
				return $q.reject(response);
			}
		}
	};
})

.run(function($rootScope, $location, Auth) {
	// Redirect to login if route requires auth and you're not logged in
	$rootScope.$on('$routeChangeStart', function(event, next) {
		Auth.isLoggedInAsync(function(loggedIn) {
			if (next.authenticate && !loggedIn) {
				$location.path('/login');
			}
		});
	});
});
