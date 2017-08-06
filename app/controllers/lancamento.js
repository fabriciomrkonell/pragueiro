(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('lancamentoCtrl', lancamentoCtrl);

	lancamentoCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function lancamentoCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			desabilitaFazenda: false,
			fazendas: [],
			lancamentos: [],
			lancamentoFilial: [],
			data: {
				ativo:true				
			}
		});

	}

}());