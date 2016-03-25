(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('quadraCtrl', quadraCtrl);

	quadraCtrl.$inject = ['$scope', '$firebaseArray', 'Constant', 'Notify'];

	function quadraCtrl($scope, $firebaseArray, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			quadras: [],
			data: {}
		});

		var ref = new Firebase(Constant.Url + '/quadra');

		function setMessageError(message){
    	Notify.errorBottom(message);
    };

    function validForm(data){
      if(data.nome === ''){
        setMessageError('O campo nome é inválido!');
        return true;
      }
      if(data.ativo === ''){
        setMessageError('O campo ativo é inválido!');
        return true;
      }
      if(data.coordenadas === ''){
        setMessageError('O campo coordenada é inválido!');
        return true;
      }
      return false;
    };

		$scope.salvarQuadra = function(data){
			if(validForm(data)) return false;
			$scope.quadras.$add(data);
			$scope.edit = false;
			$scope.clear();
			Notify.successBottom('Quadra salva com sucesso!');
		};

		$scope.editarQuadra = function(data){
			if(validForm(data)) return false;
			$scope.quadras.$save(data);
			$scope.edit = false;
			$scope.clear();
			Notify.successBottom('Quadra atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
		};

		$scope.editar = function(data){
			data.ativo = data.ativo.toString();
			data.coordenadas = data.coordenadas.toString();
			$scope.data = data;
			$scope.edit = true;
		};

		$scope.excluir = function(data){
			$scope.quadras.$remove(data);
			Notify.successBottom('Quadra removida com sucesso!');
		};

		$scope.clear = function(){
			angular.extend($scope.data, {
				nome: '',
				coordenadas: 'true',
				ativo: 'true'
			});
			$scope.quadras = $firebaseArray(ref);
		};

		$scope.clear();

  }

}());