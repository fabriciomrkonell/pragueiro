(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('aplicacaoCtrl', aplicacaoCtrl);

	aplicacaoCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify'];

	function aplicacaoCtrl($scope, Constant, Session, $firebaseArray, $firebaseObject, Notify) {

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
			quadra: [],
			data: {
			},
			form: {
				descricao: '',
				ativo: 'true',
				key: '',
				key_filial:'',
				data_plantio : ''
			}
		});
		$scope.form.data_plantio = new Date();
		var ref = new Firebase(Constant.Url + '/filial'),
		refCultura = new Firebase(Constant.Url + '/cultura'),
		refQuadra = new Firebase(Constant.Url + '/quadra'),
		_salvarQuadra = false,
		refSafra = null,
		refQuadrasCulturas = null,
		refHistoricoQuadrasCulturas = null;

		atualizaListaFiliais();


		$scope.culturas = $firebaseArray(refCultura);
		var todasQuadras = $firebaseArray(refQuadra);
		



		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA/FILIAL
		//############################################################################################################################

		function atualizaListaFiliais()
		{
			$('#myPleaseWait').modal('show');
			var refUser = new Firebase(Constant.Url + '/usuarioxauth/'+Session.getUser().uid);		
			var obj = $firebaseObject(refUser);
			var key_usuario;
			obj.$loaded().then(function() {
				key_usuario= obj.$value;
				
				$scope.fazendas=[];
				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovo = new Firebase.util.NormalizedCollection(
					[baseRef.child("/usuario/"+key_usuario+"/filial/"), "$key"],
					baseRef.child("/filial")
					).select(
					{"key":"$key.$key","alias":"key"},
					{"key":"filial.$value","alias":"filial"}
					).ref();

					refNovo.on('child_added', function(snap) {

						$('#myPleaseWait').modal('hide');
						//console.log('Adicionou filial', snap.name(), snap.val());
						var obj= snap.val();
						$scope.fazendas.push(obj.filial);
						$scope.$apply();
					});

					refNovo.on('child_changed', function(snap) {
						//console.log('Houve uma atualização', snap.name(), snap.val());
						var objNovo= snap.val();

						var x=0;
						var posicao=null;
						$scope.fazendas.forEach(function(obj){
							if(obj.key === objNovo.filial.key)
							{ 
								posicao=x;
							}
							x++;

						});
						if(posicao!=null)
							$scope.fazendas[posicao]=objNovo.filial;

					});

					refNovo.on('child_removed', function(snap) {
						//console.log('Houve uma remoção', snap.name(), snap.val());
						atualizaListaFiliais();
					});

			});// final do load
		}
		

		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) return false;
			refSafra = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra');
			$scope.safras = $firebaseArray(refSafra);
			$scope.quadras=[];
			$scope.quadras.push({nome:'', key:null});
			var filialxquadras = $firebaseArray(new Firebase(Constant.Url + '/filial/'+fazenda.key+'/quadra'));
			filialxquadras.$loaded(function() {
				filialxquadras.forEach(function(filxqua){
					todasQuadras.forEach(function(item){
						if(item.$id === filxqua.$id)
						{ 
							$scope.quadras.push(item);
						}
					});
				});
			});
		};

		$scope.setaFazenda = function(fazenda){
			if(fazenda === null) return false;

			$scope.fazendas.forEach(function(item){
				if(item.key === fazenda.key) 	
				{
					$scope.data.fazenda = item;		
				}
			});
			
		};


		//############################################################################################################################
		//############################################################################################################################
		// SAFRA
		//############################################################################################################################

		$scope.salvarSafra = function(fazenda, form){
			
			if(validFormSafra(form)) return true;
			$scope.safras.$add(form).then(function(ref) {
				form.key = ref.key();
				
				var fazendaTmp=fazenda;
				var refNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/'+form.key);
				refNovo.set(form);
				Notify.successBottom('Safra salva com sucesso!');
				$scope.clear();
				$scope.setaFazenda(fazendaTmp);		
			});
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
			var fazendaTmp=$scope.data.fazenda;
			$scope.safras.$remove(data);
			Notify.successBottom('Safra removida com sucesso!');
			$scope.setaFazenda(fazendaTmp);
		};

		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA X SAFRA X QUADRA X CULTURA
		//############################################################################################################################

		$scope.getQuadras = function(fazenda, data){
			if(data === null) return false;
			//if($scope.quadras.length === 0) return false;
			if($scope.culturas.length === 0) return false;
			if($scope.quadras.length > 0) $scope.clearQuadrasCulturas(fazenda.key, data.$id);			
			$scope.objModal = data;
			refHistoricoQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + data.$id +'/historicorelacionamento');
			$scope.historico = $firebaseArray(refHistoricoQuadrasCulturas);
			$('#modalQuadras').modal('show');
		};


		$scope.salvarQuadrasCulturas = function(fazenda, safra, form){
			if(validFormQuadraXCultura(form)) return true;
			var refNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/'+safra+'/quadra/'+form.key);
			delete form.cultura;
			delete form.quadra;
			form.data_plantio=form.data_plantio.getTime();
			refNovo.set(form);

			Notify.successBottom('Relacionamento salvo com sucesso!');
			_salvarQuadra = true;
			//$scope.clearQuadrasCulturas(fazenda.key, safra);
			$scope.objModalQuadra.key=null;
			$scope.objModalQuadra.key_cultura=null;
			$scope.setaFazenda($scope.data.fazenda);	
		};

		$scope.editarQuadrasCulturas = function(data){

			$scope.objModalQuadra = data;
			$scope.objModalQuadra.data_plantio = new Date(data.data_plantio);
			$scope.editQuadra = true;
		};

		$scope.atualizarQuadrasCulturas = function(fazenda, safra, form){
			if(validFormQuadraXCultura(form)) return true;
			form.data_plantio=form.data_plantio.getTime();
			$scope.quadra.$save(form);
			$scope.addHistorico(form.key, form.key_cultura, 'Atualizou');
			Notify.successBottom('Relacionamento atualziado com sucesso!');
			$scope.clearQuadrasCulturas(fazenda.key, safra);
			$scope.objModalQuadra.key=null;
			$scope.objModalQuadra.key_cultura=null;
			$scope.setaFazenda(fazenda);		
		};

		$scope.excluirQuadrasCulturas = function(data){
			var fazendaTmp=$scope.data.fazenda;
			$scope.quadra.$remove(data);
			$scope.addHistorico(data.key, data.key_cultura, 'Removeu');
			Notify.successBottom('Relacionamento removido com sucesso!');
			$scope.setaFazenda(fazendaTmp);
		};

		$scope.clearQuadrasCulturas = function(fazenda, safra){
			/*
			angular.extend($scope.objModalQuadra, {
				quadra: $scope.quadras[0].$id,
				cultura: $scope.culturas[0].$id
			});
			*/
			refQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda + '/safra/' + safra + '/quadra');
			$scope.quadra = $firebaseArray(refQuadrasCulturas);
			$scope.editQuadra = false;
		};

		//############################################################################################################################
		//############################################################################################################################
		//HISTÓRICO
		//############################################################################################################################

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
			refHistoricoQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.$id +'/historicorelacionamento');
			$scope.historico = $firebaseArray(refHistoricoQuadrasCulturas);
			$('#modalHistoricoQuadras').modal('show');
		};

		//############################################################################################################################
		//############################################################################################################################
		//RECUPERA NOME QUADRA/CULTURA
		//############################################################################################################################
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

		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		function validFormSafra(data){
			if($scope.data.fazenda == null){
				Notify.errorBottom('O campo fazenda é inválido!');
				return true;
			}
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



		function validFormQuadraXCultura(data){
			
			if(data.key == null){
				Notify.errorBottom('O campo quadra é inválido!');
				return true;
			}
			else
			{
				if(data.key == ''){
					Notify.errorBottom('O campo quadra é inválido!');
					return true;
				}
			}
			if(data.key_cultura == null){
				Notify.errorBottom('O campo cultura é inválido!');
				return true;
			}
			else
			{
				if(data.key_cultura == ''){
					Notify.errorBottom('O campo cultura é inválido!');
					return true;
				}
			}
			return false;
		};

		$scope.clear = function(){
			angular.extend($scope.form, {
				descricao: '',
				ativo: 'true'
			});			
		};

		$scope.$watch('quadra', function(newValue, oldValue){
			if(_salvarQuadra){
				$scope.addHistorico(newValue[newValue.length - 1].key, newValue[newValue.length - 1].key_cultura, 'Adicionou');
				_salvarQuadra = false;
			}
		});

		$scope.format = 'yyyy/MM/dd';
		$scope.date = new Date();
	}

}());