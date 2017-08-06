(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('equipamentoCtrl', equipamentoCtrl);

	equipamentoCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function equipamentoCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			equipamentos: [],
			equipamentoFilial: [],
			data: {
				ativo:true				
			}
		});

		var ref = new Firebase(Constant.Url + '/equipamento');
		$scope.todasEquipamentos = $firebaseArray(ref);
		//var refFazendas = new Firebase(Constant.Url + '/filial');
		atualizaListaFiliais();

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 200 },
			{ field: "key_combustivel", displayName: "Combustível", width: 120 ,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValueComb(row)}}</div>" },
			{ field: "consumo", displayName: "Consumo", width: 100 },
			{ field: "ativo", displayName: "Ativo", width: 80,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				},
				mapValueComb: function(row) {
					if(row.entity.key_combustivel=='1')
					{
						return 'Gasolina';
					}
					if(row.entity.key_combustivel=='2')
					{
						return 'Álcool';
					}
					if(row.entity.key_combustivel=='3')
					{
						return 'Energia';
					}
					if(row.entity.key_combustivel=='4')
					{
						return '';
					}
					if(row.entity.key_combustivel=='5')
					{
						return 'Diesel';
					}

					else
					{
						return '';
					}


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
						if(!$scope.$$phase) {
							$scope.$apply();
						}
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
					if($scope.fazendas.length==0)
					{
						$('#myPleaseWait').modal('hide');
					}
			});// final do load
		}		

		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) 
			{
				$scope.equipamentos =null;
			}
			else
			{				

				$scope.equipamentos=[];

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/equipamento"),
					[baseRef.child("/equipamento"), "$key"]
					).select(
					{"key":"equipamento.$value","alias":"filial"},
					{"key":"$key.$value","alias":"equipamentos"}
					).ref();

					refNovoQuadra.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						$scope.equipamentos.push(objNovo['equipamentos']);
						if(!$scope.$$phase) {
							$scope.$apply();
						}
						$scope.gridOptions.data = $scope.equipamentos;
					});

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						var x=0;
						var posicao=null;
						$scope.equipamentos.forEach(function(obj){
							if(obj.key === objNovo['equipamentos'].key)
							{ 
								posicao=x;
							}
							x++;

						});
						if(posicao!=null)
							$scope.equipamentos[posicao]=objNovo['equipamentos'];

						if(!$scope.$$phase) {
							$scope.$apply();
						}
					});

					refNovoQuadra.on('child_removed', function(snap) {
						$scope.chengeFazenda($scope.data.fazenda);
					});



				}
			};





		//############################################################################################################################
		//############################################################################################################################
		// QUADRA
		//############################################################################################################################

		

		$scope.getDadosEquipamento = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todasEquipamentos.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todasEquipamentos.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todasEquipamentos.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todasEquipamentos.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarEquipamento = function(data){
			if(validForm(data)) return false;

			var fazendaTmp=data.fazenda;
			delete data.fazenda;
			delete data.$$hashKey;	
			data['filial']=[];
			data['filial'][fazendaTmp.key]=true;
			var refEquipamento = new Firebase(Constant.Url + '/equipamento/');
			var key=refEquipamento.push().key();
			var refEquipamentoNovo = new Firebase(Constant.Url + '/equipamento/'+key);
			data.key=key;
			refEquipamentoNovo.set(data);
			var refEquipamentoNovo = new Firebase(Constant.Url + '/filial/'+fazendaTmp.key + '/equipamento/'+key);
			refEquipamentoNovo.set(true);
			$scope.chengeFazenda(fazendaTmp);
			$scope.clear();						
			$scope.setaFazenda(fazendaTmp);	

			Notify.successBottom('Equipamento inserida com sucesso!');

		};

		$scope.editarEquipamento = function(data){
			if(validForm(data)) return false;
			var fazendaTmp=data.fazenda;
			delete data.fazenda;
			delete data.$$hashKey;		
			var refEquipamento = new Firebase(Constant.Url + '/equipamento/'+data.key);
			refEquipamento.set(data);
			data.fazenda=fazendaTmp;
			$scope.clear();

			Notify.successBottom('Equipamento atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			var fazendaTmp=$scope.data.fazenda;
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
			$scope.chengeFazenda($scope.data.fazenda);	
			$scope.edit = false;
			$scope.save = true;
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

		$scope.excluir = function(objeto){
			$('#modalDelete').modal('show');
		}

		$scope.excluirEquipamento = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null && $scope.data.fazenda!=null)
			{
				var fazendaTmp=$scope.data.fazenda;
				if(objeto.qtd!=null)
				{
					if(objeto.qtd>0)
					{
						setMessageError('Já foi associado em equipamento. Impossível continuar.');
						return true;
					}
				}			

				var refEquipamentoNovo = new Firebase(Constant.Url + '/equipamento/'+objeto.key);
				refEquipamentoNovo.remove();
				var refEquipamentoNovo = new Firebase(Constant.Url + '/equipamento/'+ $scope.data.fazenda.key + '/equipamento/'+objeto.key);
				refEquipamentoNovo.remove();						
				Notify.successBottom('Equipamento removida com sucesso!');
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

			if(data.fazenda==null || data.fazenda.key == null){
				setMessageError('O campo fazenda é inválido!');
				return true;
			}			
			
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
		
		$scope.clear = function(){
			//var fazendaTmp=$scope.data.fazenda;
			angular.extend($scope.data, {
				ativo: true,
				nome: '',
				marca: '',
				obs: '',
				consumo: '',
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