'use strict'

var ref = new Firebase("https://pragueiroproducao.firebaseio.com");
if(ref.getAuth() === null) window.location.href = '/login';

//var greetings = require("./../controllers/greetings.js");
//var greetings = '';
angular.module('Pragueiro.controllers', [ 'firebase', 'ngSanitize', 'googlechart', 'uiGmapgoogle-maps', 'angularGeoFire'])
.config(function(uiGmapGoogleMapApiProvider) {
	uiGmapGoogleMapApiProvider.configure({
		key: 'AIzaSyDDu-8XiPmbb5QbSlh-Dv4xyHF53iGUPOk',
        //v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
})


angular.module('Pragueiro.config', ['ngRoute']);

angular.module('Pragueiro.constant', []).constant('Constant', {
	Url: 'https://pragueiroproducao.firebaseio.com',
	Message: {
		'Error: The specified password is incorrect.': 'A senha está inválida!',
		'Error: The specified email address is already in use.': 'O endereço de email já está em uso!'
	},
});



angular.module('Pragueiro.services', []);

angular.module('Pragueiro.directives', []);

angular.module('Pragueiro', ['Pragueiro.controllers', 'Pragueiro.config', 'Pragueiro.constant', 'Pragueiro.services', 'Pragueiro.directives']);

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
	angular.bootstrap(document, ['Pragueiro']);
});

