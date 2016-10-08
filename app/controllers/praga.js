(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('pragaCtrl', pragaCtrl);

	pragaCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function pragaCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			pragas: [],
			data: {
				ativo:true,
				texto: ' '
			}
		});

		buscaPragas();
		function buscaPragas()
		{
			$scope.pragas =[];
			var ref = new Firebase(Constant.Url + '/praga');
			$scope.pragas = $firebaseArray(ref);
		}

		//############################################################################################################################
		//############################################################################################################################
		// QUADRA
		//############################################################################################################################

		


		$scope.salvarPraga = function(data){
			if(validForm(data)) return false;

			var refNovo = new Firebase(Constant.Url + '/praga/' + data.key );
			refNovo.set(data);
			buscaPragas();
			data.key=parseInt(data.key)+1;
			$scope.clear();

		};

		$scope.editarPraga = function(data){
			if(validForm(data)) return false;
			$scope.pragas.$save(data).then(function(ref) {
				Notify.successBottom('Praga salva com sucesso!');
			});
			
			
			Notify.successBottom('Praga atualizada com sucesso!');
			$scope.chengeFazenda(fazendaTmp);
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
		};

		$scope.cancelar = function(){
			var fazendaTmp=$scope.data.fazenda;
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
			$scope.chengeFazenda($scope.data.fazenda);	
			$scope.edit = false;
		};

		$scope.editar = function(praga){
			
			$scope.data = praga;
			
			
			$scope.edit = true;
		};

		$scope.excluir = function(objeto){
			var fazendaTmp=$scope.data.fazenda;
			if(objeto.qtd!=null)
			{
				if(objeto.qtd>0)
				{
					setMessageError('Já foi associado em quadra. Impossível continuar.');
					return true;
				}
			}
			
			var refPragaNovo = new Firebase(Constant.Url + '/praga/'+objeto.key_filial+'/'+objeto.key_cultura+'/'+objeto.key);
			refPragaNovo.remove();
			
			Notify.successBottom('Praga removida com sucesso!');
			$scope.chengeFazenda(fazendaTmp);
			return true;
			
		};


		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################


		function setMessageError(message){
			Notify.errorBottom(message);
		};

		function validForm(data){
			if(data.key == null){
				setMessageError('O campo key é inválido!');
				return true;
			}
			if(data.nome_cientifico == null){
				setMessageError('O campo nome_cientifico é inválido!');
				return true;
			}
			if(data.descricao === ''){
				setMessageError('O campo descrição é inválido!');
				return true;
			}
			if(data.ativo === ''){
				setMessageError('O campo ativo é inválido!');
				return true;
			}

			return false;
		};
		
		$scope.clear = function(){
			//var fazendaTmp=$scope.data.fazenda;
			angular.extend($scope.data, {			
				ativo: true,
				nome_cientifico: '',
				descricao: '',
				img: ''
			});
			//$scope.data.fazenda=fazendaTmp;
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			//$scope.chengeFazenda($scope.fazenda);
			//$scope.data.fazenda=fazendaTmp;
		};
		

		//$scope.clear();

	}

}());