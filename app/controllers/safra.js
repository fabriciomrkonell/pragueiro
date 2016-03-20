(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('safraCtrl', safraCtrl);

	safraCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', 'Notify'];

	function safraCtrl($scope, Constant, Session, $firebaseArray, Notify) {

		function validFormSafra(data){
      if(data.descricao === ''){
        Notify.errorBottom('O campo descriçāo é inválido!');
        return true;
      }
      if(data.ativo === ''){
        Notify.errorBottom('O campo ativo é inválido!');
        return true;
      }
      return false;
    };

    function validFormQuadra(data){
      if(data.descricao === ''){
        Notify.errorBottom('O campo descriçāo é inválido!');
        return true;
      }
      if(data.ativo === ''){
        Notify.errorBottom('O campo ativo é inválido!');
        return true;
      }
      if(data.coordenada === ''){
        Notify.errorBottom('O campo coordenada é inválido!');
        return true;
      }
      if(data.cultura === ''){
        Notify.errorBottom('O campo cultura é inválido!');
        return true;
      }
      return false;
    };

		angular.extend($scope, {
			objModal: {},
			objModalQuadra: {},
			edit: false,
			fazendas: [],
			safras: [],
			culturas: Constant.Culturas,
			quadras: [],
			data: {
				fazenda: null
			},
			form: {
				descricao: '',
				ativo: 'true'
			}
		});

		var ref = new Firebase(Constant.Url + '/filial'),
				refSafra = null,
				refQuadra = null;

		$scope.fazendas = $firebaseArray(ref.orderByChild("key_usuario").equalTo(Session.getUser().uid));

		$scope.clearQuadra = function(getquadras){
			angular.extend($scope.objModalQuadra, {
				descricao: '',
				ativo: 'true',
				coordenada: 'false',
				cultura: Constant.Culturas[0].nome
			});
			$scope.editQuadra = false;
			if(getquadras) return false;
			$scope.quadras = $firebaseArray(refQuadra);
		};

		$scope.clear = function(getsafras){
			angular.extend($scope.form, {
				descricao: '',
				ativo: 'true'
			});
			$scope.edit = false;
			if(getsafras) return false;
			$scope.safras = $firebaseArray(refSafra);
		};

		$scope.clear(true);

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

		$scope.salvarQuadra = function(form){
			if(validFormQuadra(form)) return true;
			$scope.quadras.$add(form);
			Notify.successBottom('Quadra salva com sucesso!');
			$scope.clearQuadra();
		};

		$scope.atualizarQuadra = function(form){
			if(validFormSafra(form)) return true;
			$scope.quadras.$save(form);
			Notify.successBottom('Quadra atualizada com sucesso!');
			$scope.clearQuadra();
		};

		$scope.atualizarSafra = function(form){
			if(validFormSafra(form)) return true;
			$scope.safras.$save(form);
			Notify.successBottom('Safra atualizada com sucesso!');
			$scope.clear();
		};

		$scope.editarQuadra = function(data){
			$scope.objModalQuadra = data;
			$scope.editQuadra = true;
		};

		$scope.editarSafra = function(data){
			$scope.form = data;
			$scope.edit = true;
		};

		$scope.excluirSafra = function(data){
			$scope.safras.$remove(data);
			Notify.successBottom('Safra removida com sucesso!');
		};

		$scope.excluirQuadra = function(data){
			$scope.quadras.$remove(data);
			Notify.successBottom('Quadra removida com sucesso!');
		};

		$scope.getQuadras = function(data){
			if(data === null) return false;
			$scope.objModal = data;
			refQuadra = new Firebase(Constant.Url + '/filial/' + data.$id + '/safra/quadra');
			$scope.quadras = $firebaseArray(refQuadra);
			$scope.clearQuadra(true);
			$('#modalQuadras').modal('show');
		};
  }

}());