(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('controleacessoCtrl', controleacessoCtrl);

	controleacessoCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function controleacessoCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			save: true,
			controleacessos: [],
			controleacessoFilial: [],
			data: {
				ativo:true				
			}
		});

		$scope.tipo = ['Praga', 'Doença'];
		$scope.numeracao_codigo = 1;
		$scope.todosControleacessos=[];
		
		

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "key", displayName: "Intero", width: 80 },
			{ field: "ordem", displayName: "Ordem", width: 80 },
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 240 },
			{ field: "ativo", displayName: "Ativo", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
			{ field: "grupo", displayName: "Grupo", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValueGrupo(row)}}</div>" }

			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				},
				mapValueGrupo: function(row) {
					return row.entity.grupo ? 'Sim' : 'Não';
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

		listenerCodigo();
		recuperaControleacesso();

		//############################################################################################################################
		//############################################################################################################################
		// 
		//############################################################################################################################

		function recuperaControleacesso() {

			var baseRef = new Firebase(Constant.Url+'/controleacesso');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.todosControleacessos.push(objNovo);
				$scope.gridOptions.data=$scope.todosControleacessos;	
				if (!$scope.$$phase) {
					$scope.$apply();

					$scope.gridOptions.data=$scope.todosControleacessos;	
				}


			});

			baseRef.on('child_changed', function(snap) {
				var objNovo= snap.val();
				var x=0;
				var posicao=null;
				$scope.todosControleacessos.forEach(function(obj){
					if(obj.key === objNovo.key)
					{ 
						posicao=x;
					}
					x++;

				});
				if(posicao!=null)
					$scope.todosControleacessos[posicao]=objNovo;

				if(!$scope.$$phase) {
					$scope.$apply();
				}
			});
		}


		function listenerCodigo() {


			var refOrdser = new Firebase(Constant.Url + '/controleacesso/' );

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

		

		$scope.clonar = function(){		
			$scope.todosControleacessos.forEach(function(obj){
				var objClonado= obj;
				delete 	objClonado.$$hashKey;
				var refNovo = new Firebase(Constant.Url + '/filial/-KtH3-hl4fZVNnCHZnFn/controleacessoemp/' + obj.key);
				refNovo.set(true);
			});
			Notify.successBottom('Praga clonada com sucesso!');
		};

		$scope.getDadosControleacesso = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todosControleacessos.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todosControleacessos.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todosControleacessos.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todosControleacessos.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarControleacesso = function(data){
			if(validForm(data)) return false;			
			delete data.$$hashKey;	
			
			var refControleacesso= new Firebase(Constant.Url + '/controleacesso/' );
			data.key = refControleacesso.push().key();

			data.visualizacao=false;
			data.inclusao=false;
			data.edicao=false;
			data.exclusao=false;

			var refNovo= new Firebase(Constant.Url + '/controleacesso/' + data.key);
			refNovo.set(data);

			$scope.clear();			
			Notify.successBottom('Controle de acesso/Menu inserida com sucesso!');
		};

		$scope.editarControleacesso = function(data){
			if(validForm(data)) return false;
			delete data.$$hashKey;		
			var refControleacesso= new Firebase(Constant.Url + '/controleacesso/'+data.key);

			data.visualizacao=false;
			data.inclusao=false;
			data.edicao=false;
			data.exclusao=false;

			refControleacesso.set(data);

			$scope.clear();

			Notify.successBottom('Controle de acesso/Menu atualizada com sucesso!');
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

		$scope.excluirControleacesso = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null)
			{					

				var refEquipeNovo = new Firebase(Constant.Url + '/controleacesso/'+objeto.key);
				refEquipeNovo.remove();

				Notify.successBottom('Controle de acesso/Menu removida com sucesso!');
				
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

			if(data.nome == ''){
				setMessageError('O campo nome é obrigatório!');
				return true;
			}
			if(data.codigo == ''){
				setMessageError('O campo Código é obrigatório!');
				return true;
			}
			if(data.ordem == ''){
				setMessageError('O campo Ordem é obrigatório!');
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