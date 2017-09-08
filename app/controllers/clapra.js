(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('clapraCtrl', clapraCtrl);

	clapraCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function clapraCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			save: true,
			clapras: [],
			clapraFilial: [],
			data: {
				ativo:true				
			}
		});

		$scope.tipo = ['Praga', 'Doença'];
		$scope.numeracao_codigo = 1;
		$scope.todasClapras=[];
		
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
		// 
		//############################################################################################################################

		function recuperaClapra() {

			var baseRef = new Firebase(Constant.Url+'/clapra');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.todasClapras.push(objNovo);
				$scope.gridOptions.data=$scope.todasClapras;	
				if (!$scope.$$phase) {
					$scope.$apply();

					$scope.gridOptions.data=$scope.todasClapras;	
				}


			});

			baseRef.on('child_changed', function(snap) {
				var objNovo= snap.val();
				var x=0;
				var posicao=null;
				$scope.todasClapras.forEach(function(obj){
					if(obj.key === objNovo.key)
					{ 
						posicao=x;
					}
					x++;

				});
				if(posicao!=null)
					$scope.todasClapras[posicao]=objNovo;

				if(!$scope.$$phase) {
					$scope.$apply();
				}
			});
		}


		function listenerCodigo() {


			var refOrdser = new Firebase(Constant.Url + '/clapra/' );

			refOrdser.on('child_added', function(snap) {
				$scope.numeracao_codigo++;
				if (!$scope.edit) {
					$scope.data.key=$scope.numeracao_codigo;
					$scope.data.codigo = zeroFill($scope.numeracao_codigo, 3);
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				}
			});

			refOrdser.on('child_removed', function(snap) {
				$scope.numeracao_codigo--;
				if (!$scope.edit) {
					$scope.data.key=$scope.numeracao_codigo;
					$scope.data.codigo = zeroFill($scope.numeracao_codigo, 3);
					if (!$scope.$$phase) {
						$scope.$apply();
					}
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

		$scope.editarClapra = function(data){
			if(validForm(data)) return false;
			delete data.$$hashKey;		
			var refClapra= new Firebase(Constant.Url + '/clapra/'+data.key);
			refClapra.set(data);

			$scope.clear();

			Notify.successBottom('Classe de Pragas atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			$scope.clear();

			$scope.edit = false;
			$scope.save=true;
		};

		$scope.editar = function(obj){
			
			$scope.data = obj;		
			$scope.edit = true;
			$scope.save = false;


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

				Notify.successBottom('Classe de Pragas removida com sucesso!');
				
				$scope.cancelar();

			}
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
			angular.extend($scope.data, {
				ativo: true,
				nome: '',
				qtd:0,
				codigo: '',
				key:''
			});
			$scope.edit=false;
			$scope.save = true;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		};
		

		function zeroFill(number, width) {
			width -= number.toString().length;
			if (width > 0) {
				return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
			}
			return number + "";
		}

	}

}());