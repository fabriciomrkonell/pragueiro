(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('perfilCtrl', perfilCtrl);

	perfilCtrl.$inject = ['$scope', '$rootScope', '$firebaseObject'];

	function perfilCtrl($scope, $rootScope, $firebaseObject) {

		var ref = new Firebase("https://pragueiro.firebaseio.com/usuario");

		$scope.data = $firebaseObject(ref.orderByChild("uid").equalTo($rootScope.__user.uid), function(){
			console.log('dasd');
		});

  }
}());