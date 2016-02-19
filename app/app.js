'use strict'

angular.module('Pragueiro.controllers', []);

angular.module('Pragueiro.config', ['ngRoute']);

angular.module('Pragueiro.constant', []);

angular.module('Pragueiro.services', []);

angular.module('Pragueiro', ['Pragueiro.controllers', 'Pragueiro.config', 'Pragueiro.constant', 'Pragueiro.services']);

angular.module('Pragueiro').run(['$rootScope', function($rootScope){

	var ref = new Firebase("https://pragueiro.firebaseio.com");

	$rootScope.logout = function(){
		ref.unauth();
		window.location.href = '/login';
	};

}]);

angular.element(document).ready(function() {
	var ref = new Firebase("https://pragueiro.firebaseio.com");
	if(ref.getAuth() === null) window.location.href = '/login';
	angular.bootstrap(document, ['Pragueiro']);
});