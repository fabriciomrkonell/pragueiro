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

		function isEmail(email){
      var er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/;
      return !!er.exec(email);
    };

    function setMessageError(message){
    	Notify.errorBottom(message);
    };

    function validForm(data){
      if(data.nome === ''){
        setMessageError('O campo nome é inválido!');
        return true;
      }
      if(data.razaosocial === ''){
        setMessageError('O campo razão social é inválido!');
        return true;
      }
      if(data.telefone === '' ||   data.telefone.length < 14){
        setMessageError('O campo telefone é inválido!');
        return true;
      }
      if(data.website === ''){
        setMessageError('O campo website é inválido!');
        return true;
      }
      if(data.cidade === ''){
        setMessageError('O campo cidade é inválido!');
        return true;
      }
      if(isEmail(data.email) !== true){
        setMessageError('O campo email é inválido!');
        return true;
      }
      return false;
    };


		$scope.salvarFazenda = function(data){
			if(validForm(data)) return false;
			data.key_usuario = Session.getUser().uid;
			$scope.fazendas.$add(data);
			$scope.edit = false;
			$scope.clear();
			Notify.successBottom('Fazenda salva com sucesso!');
		};

		$scope.editarFazenda = function(data){
			if(validForm(data)) return false;
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

		$scope.excluir = function(data){
			$scope.fazendas.$remove(data);
			Notify.successBottom('Fazenda removida com sucesso!');
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