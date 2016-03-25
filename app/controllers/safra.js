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

		angular.extend($scope, {
			objModal: {},
			objModalQuadra: {},
			objModalHistorico: {},
			edit: false,
			editQuadra: false,
			fazendas: [],
			safras: [],
			historico: [],
			culturas: [],
			quadras: [],
			quadrasculturas: [],
			data: {
				fazenda: null
			},
			form: {
				descricao: '',
				ativo: 'true'
			}
		});

		var ref = new Firebase(Constant.Url + '/filial'),
				refCultura = new Firebase(Constant.Url + '/cultura'),
				refQuadra = new Firebase(Constant.Url + '/quadra'),
				_salvarQuadra = false,
				refSafra = null,
				refQuadrasCulturas = null,
				refHistoricoQuadrasCulturas = null;

		$scope.fazendas = $firebaseArray(ref.orderByChild("key_usuario").equalTo(Session.getUser().uid));
		$scope.culturas = $firebaseArray(refCultura);
		$scope.quadras = $firebaseArray(refQuadra);

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

		$scope.excluirSafra = function(data){
			$scope.safras.$remove(data);
			Notify.successBottom('Safra removida com sucesso!');
		};

		$scope.getQuadras = function(fazenda, data){
			if(data === null) return false;
			if($scope.quadras.length === 0) return false;
			if($scope.culturas.length === 0) return false;
			$scope.clearQuadrasCulturas(fazenda.$id, data.$id);
			$scope.objModal = data;
			refHistoricoQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.$id + '/safra/' + data.$id +'/historicorelacionamento');
			$scope.historico = $firebaseArray(refHistoricoQuadrasCulturas);
			$('#modalQuadras').modal('show');
		};

		$scope.clearQuadrasCulturas = function(fazenda, safra){
			angular.extend($scope.objModalQuadra, {
				quadra: $scope.quadras[0].$id,
				cultura: $scope.culturas[0].$id
			});
			refQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda + '/safra/' + safra + '/quadrasculturas');
			$scope.quadrasculturas = $firebaseArray(refQuadrasCulturas);
			$scope.editQuadra = false;
		};

		$scope.salvarQuadrasCulturas = function(fazenda, safra, form){
			$scope.quadrasculturas.$add(form);
			Notify.successBottom('Relacionamento salvo com sucesso!');
			_salvarQuadra = true;
			$scope.clearQuadrasCulturas(fazenda.$id, safra);
		};

		$scope.editarQuadrasCulturas = function(data){
			$scope.objModalQuadra = data;
			$scope.editQuadra = true;
		};

		$scope.atualizarQuadrasCulturas = function(fazenda, safra, form){
			$scope.quadrasculturas.$save(form);
			$scope.addHistorico(form.quadra, form.cultura, 'Atualizou');
			Notify.successBottom('Relacionamento atualizadpo com sucesso!');
			$scope.clearQuadrasCulturas(fazenda.$id, safra);
		};

		$scope.excluirQuadrasCulturas = function(data){
			$scope.quadrasculturas.$remove(data);
			$scope.addHistorico(data.quadra, data.cultura, 'Removeu');
			Notify.successBottom('Relacionamento removido com sucesso!');
		};

		$scope.addHistorico = function(quadraId, culturaId, tipo){
		$scope.historico.$add({
				quadra: quadraId,
				cultura: culturaId,
				tipo: tipo,
				dataAlteracao: new Date().getTime()
			});
		};

		$scope.getHistoricoQuadrasCulturas = function(fazenda, safra){
			$scope.objModalHistorico = safra;
			refHistoricoQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.$id + '/safra/' + safra.$id +'/historicorelacionamento');
			$scope.historico = $firebaseArray(refHistoricoQuadrasCulturas);
			$('#modalHistoricoQuadras').modal('show');
		};

		$scope.getCulturaNome = function(culturaId){
			var retorno = '';
			$scope.culturas.forEach(function(item){
				if(item.$id === culturaId) retorno = item.nome;
			});
			return retorno;
		};

		$scope.getQuadraNome = function(quadraId){
			var retorno = '';
			$scope.quadras.forEach(function(item){
				if(item.$id === quadraId) retorno = item.nome;
			});
			return retorno;
		};

		$scope.$watch('quadrasculturas', function(newValue, oldValue){
			if(_salvarQuadra){
				$scope.addHistorico(newValue[newValue.length - 1].quadra, newValue[newValue.length - 1].cultura, 'Adicionou');
				_salvarQuadra = false;
			}
    });

  }

}());