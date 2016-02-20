'use strict'

angular.module('Pragueiro.controllers', ['firebase']);

angular.module('Pragueiro.config', ['ngRoute']);

angular.module('Pragueiro.constant', []).constant('Constant', {
	Url: 'https://pragueiro.firebaseio.com'
});

angular.module('Pragueiro.services', []);

angular.module('Pragueiro', ['Pragueiro.controllers', 'Pragueiro.config', 'Pragueiro.constant', 'Pragueiro.services']);

angular.module('Pragueiro').run(['$rootScope', 'Session', 'Constant', function($rootScope, Session, Constant){

	var ref = new Firebase(Constant.Url);

	$rootScope.logout = function(){
		ref.unauth();
		window.location.href = '/login';
	};

	$rootScope.$on('$routeChangeStart', function(event, next, current) {
    Session.getUser();
  });

}]);

angular.element(document).ready(function() {
	var ref = new Firebase("https://pragueiro.firebaseio.com");
	if(ref.getAuth() === null) window.location.href = '/login';
	angular.bootstrap(document, ['Pragueiro']);
});