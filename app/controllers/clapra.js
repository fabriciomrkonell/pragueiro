(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('clapraCtrl', clapraCtrl);

	clapraCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function clapraCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			clapras: [],
			clapraFilial: [],
			data: {
				ativo:true				
			}
		});


		var ref = new Firebase(Constant.Url + '/clapra');
		$scope.todasClapras = $firebaseArray(ref);
		$scope.numeracao_codigo = 1;
		//var refFazendas = new Firebase(Constant.Url + '/filial');
		listenerCodigo();
		recuperaClapra();

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 240 },
			{ field: "ativo", displayName: "Ativo", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				}
			}
			
		};

		$scope.toggleMultiSelect = function() {
			$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		};


		$scope.gridOptions.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.editar(row.entity);
			});
		};

		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA/FILIAL
		//############################################################################################################################

		function recuperaClapra() {

			var baseRef = new Firebase(Constant.Url+'/clapra');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.todasClapras.push(objNovo);
				
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				$scope.gridOptions.data=$scope.todasClapras;				

			}, function(error) {
				console.error(error);
			});
		}


		function listenerCodigo() {

			$scope.numeracao_codigo = 1;
			var refOrdser = new Firebase(Constant.Url + '/clapra/' );

			refOrdser.on('child_added', function(snap) {
				$scope.numeracao_codigo++;
				if ($scope.data.key == null || $scope.data.key == '') {
					$scope.data.key=$scope.numeracao_codigo;
				}
			});

			refOrdser.on('child_removed', function(snap) {
				$scope.numeracao_codigo--;
				if ($scope.data.key == null || $scope.data.key == '') {
					$scope.data.key=$scope.numeracao_codigo;
				}
			});
			
		}



		//############################################################################################################################
		//############################################################################################################################
		// QUADRA
		//############################################################################################################################

		

		$scope.getDadosClapra = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todasClapras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todasClapras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todasClapras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todasClapras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarClapra = function(data){
			if(validForm(data)) return false;			
			delete data.$$hashKey;	
			
			var refClapra= new Firebase(Constant.Url + '/clapra/' + data.key);
			
			refClapra.set(data);

			$scope.clear();			
			Notify.successBottom('Classe de Pragas inserida com sucesso!');
		};

		$scope.editarsalvarClapra = function(data){
			if(validForm(data)) return false;
			delete data.$$hashKey;		
			var refClapra= new Firebase(Constant.Url + '/clapra/'+data.key);
			refClapra.set(data);

			$scope.clear();

			Notify.successBottom('Classe de Pragas atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			var fazendaTmp=$scope.data.fazenda;
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
			$scope.chengeFazenda($scope.data.fazenda);	
			$scope.edit = false;
			$scope.save=true;
		};

		$scope.editar = function(obj){
			$scope.desabilitaFazenda=true;
			var fazendaTmp=$scope.data.fazenda;
			$scope.data = obj;
			$scope.data.fazenda=fazendaTmp;
			$scope.edit = true;
			$scope.save = false;

			$scope.desabilitaFazenda=true;		

		};
		$scope.excluir = function(){
			$('#modalDelete').modal('show');
		};

		$scope.excluirClapra = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null)
			{					

				var refEquipeNovo = new Firebase(Constant.Url + '/clapra/'+objeto.key);
				refEquipeNovo.remove();
				var refEquipeNovo = new Firebase(Constant.Url + '/filial/'+ $scope.data.fazenda.key + '/clapra/'+objeto.key);
				refEquipeNovo.remove();						
				Notify.successBottom('Classe de Pragas removida com sucesso!');
				$scope.chengeFazenda(fazendaTmp);
				$scope.cancelar();

			}
			return true;

		};


		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		$scope.setaFazenda = function(fazenda){
			if(fazenda === null) return false;

			$scope.fazendas.forEach(function(item){
				if(item.key === fazenda.key) 	
				{
					$scope.data.fazenda = item;		
				}
			});
			
		};

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
			
			return false;
		};
		
		$scope.clear = function(){
			//var fazendaTmp=$scope.data.fazenda;
			angular.extend($scope.data, {
				ativo: true,
				nome: '',
				qtd:0,
				codigo: '',
				key:''
			});
			//$scope.data.fazenda=fazendaTmp;
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			$scope.save = true;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			//$scope.chengeFazenda($scope.fazenda);
			//$scope.data.fazenda=fazendaTmp;
		};
		

		//$scope.clear();

	}

}());