(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('safraCtrl', safraCtrl);

	safraCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray'];

	function safraCtrl($scope, Constant, Session, $firebaseArray) {

		angular.extend($scope, {
			fazendas: [],
			data: {}
		});

		var ref = new Firebase(Constant.Url + '/filial');

		$scope.fazendas = $firebaseArray(ref.orderByChild("key_usuario").equalTo(Session.getUser().uid));

		$scope.clear = function(){
			angular.extend($scope.data, {
				fazenda: null
			});
		};

		$scope.clear();
  }

}());