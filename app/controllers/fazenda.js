(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('fazendaCtrl', fazendaCtrl);

	fazendaCtrl.$inject = ['$scope', '$firebaseArray', 'Constant', 'Session', 'Notify'];

	function fazendaCtrl($scope, $firebaseArray, Constant, Session, Notify) {

		angular.extend($scope, {
			edit: false,
			fazendas: [],
			data: {}
		});

		var ref = new Firebase(Constant.Url + '/filial');

		$scope.fazendas = $firebaseArray(ref.orderByChild("key_usuario").equalTo(Session.getUser().uid));

		$scope.salvarFazenda = function(data){
			data.key_usuario = Session.getUser().uid;
			$scope.fazendas.$add(data);
			$scope.edit = false;
			$scope.clear();
			Notify.successBottom('Fazenda salva com sucesso!');
		};

		$scope.editarFazenda = function(data){
			$scope.fazendas.$save(data);
			$scope.edit = false;
			$scope.clear();
			Notify.successBottom('Fazenda atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
		};

		$scope.editar = function(data){
			$scope.data = data;
			$scope.edit = true;
		};

		$scope.clear = function(){
			$scope.data = {};
			angular.extend($scope.data, {
				nome: '',
				razaosocial: '',
				telefone: '',
				website: '',
				cidade: '',
				email: ''
			});
		};

		$scope.clear();

  }

}());