(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('safraCtrl', safraCtrl);

	safraCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', 'Notify'];

	function safraCtrl($scope, Constant, Session, $firebaseArray, Notify) {

		function validFormSafra(data){
      if(data.descricao === ''){
        Notify.infoBottom('O campo descriçāo é inválido!');
        return true
      }
      if(data.ativo === ''){
        Notify.infoBottom('O campo ativo é inválido!');
        return true
      }
      return false;
    };

		angular.extend($scope, {
			edit: false,
			fazendas: [],
			safras: [],
			data: {
				fazenda: null
			},
			form: {
				descricao: '',
				ativo: 'true'
			}
		});

		var ref = new Firebase(Constant.Url + '/filial'),
				refSafra = null;

		$scope.fazendas = $firebaseArray(ref.orderByChild("key_usuario").equalTo(Session.getUser().uid));

		$scope.clear = function(){
			angular.extend($scope.form, {
				descricao: '',
				ativo: 'true'
			});
			$scope.edit = false;
		};

		$scope.clear();

		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) return false;
			refSafra = new Firebase(Constant.Url + '/filial/' + fazenda.$id + '/safra');
			$scope.safras = $firebaseArray(refSafra);
		};

		$scope.salvarSafra = function(form){
			if(validFormSafra(form)) return true;
			$scope.safras.$add(form);
			Notify.successBottom('Safra salva com sucesso!');
			$scope.clear();
		};

		$scope.atualizarSafra = function(form){
			if(validFormSafra(form)) return true;
			$scope.safras.$save(form);
			Notify.successBottom('Safra atualizada com sucesso!');
			$scope.clear();
		};

		$scope.editarSafra = function(data){
			$scope.form = data;
			$scope.edit = true;
		};
  }

}());