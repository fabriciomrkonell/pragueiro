(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('cadastroCtrl', cadastroCtrl);

	cadastroCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function cadastroCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			desabilitaFazenda: false,
			fazendas: [],
			cadastros: [],
			cadastroFilial: [],
			data: {
				ativo:true				
			}
		});

	}

}());