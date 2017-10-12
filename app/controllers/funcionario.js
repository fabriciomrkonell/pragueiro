(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('funcionarioCtrl', funcionarioCtrl);

	funcionarioCtrl.$inject = ['$scope',  '$compile', '$sce', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', 'Controleacesso'];

	function funcionarioCtrl($scope,  $compile, $sce,  $firebaseArray, $firebaseObject, Session, Constant, Notify, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			funcionarios: [],
			funcionarioFilial: [],
			data: {
				ativo:true				
			}
		});


		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.posicaoFilial = window.localStorage.getItem('posicaoFilial');
		$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
		var key_usuario  = window.localStorage.getItem('key_usuario');		

		

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 200 },
			{ field: "funcao", displayName: "Função/Cargo", width: 200 },
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

		function atualizaListaFiliais()
		{
			$('#myPleaseWait').modal('show');

			$scope.chengeFazenda($scope.fazenda);			

			var baseRef = new Firebase(Constant.Url);
			var refNovo = new Firebase.util.NormalizedCollection(
				[baseRef.child("/usuario/"+key_usuario+"/filial/"), "$key"],
				baseRef.child("/filial")
				).select(
				{"key":"$key.$key","alias":"key"},
				{"key":"filial.$value","alias":"filial"}
				).ref();

				refNovo.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo = snap.val();
					var posicao = null;
					$scope.fazendas.forEach(function(obj) {
						if (obj.key === objNovo['filial'].key) {
							posicao = $scope.fazendas.indexOf(obj);
						}
					});
					if (posicao != null)
					{
						objNovo['filial'].aceempsObj= $scope.fazendas[posicao].aceempsObj;
						$scope.fazendas[posicao] = objNovo['filial'];
					}

					if(objNovo['filial'].key==$scope.fazenda.key)
					{
						objNovo['filial'].aceempsObj= JSON.parse(window.localStorage.getItem('aceempsObj'));
						objNovo['filial'].aceemps= JSON.parse(window.localStorage.getItem('aceemps'));
						
						window.localStorage.setItem('filialCorrente', JSON.stringify( objNovo['filial']));
						$scope.fazenda=objNovo['filial'];
					}
					window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));

				});
			}	

		//---	


		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) 
			{
				$scope.funcionarios =null;
			}
			else
			{			
				$scope.clear();
				//--------------------------------------
				//Controle Acesso	
				$scope.objetoTelaAcesso=fazenda.aceempsObj.funcionario;

				if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
				{
					window.location.href = '#home';
				}
				//--------------------------------------

				if(fazenda.funcionario!=null)
				{
					$scope.qtde_funcionario= castObjToArray(fazenda.funcionario).length;
				}
				else
				{
					$scope.qtde_funcionario=0;
					$('#myPleaseWait').modal('hide');
				}

				$scope.funcionarios=[];
				$scope.gridOptions.data = $scope.funcionarios;

				var baseRef = new Firebase(Constant.Url + '/funcionario/' + fazenda.key);				

				baseRef.on('child_added', function(snap) {
					var objNovo= snap.val();

					var posicao=null;
					$scope.funcionarios.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.funcionarios.indexOf(obj);
						}

					});
					if(posicao==null)
						$scope.funcionarios.push(objNovo);
					else						
						$scope.funcionarios[posicao]=objNovo;

					
					if(!$scope.$$phase) {
						$scope.$apply();
					}
					$scope.gridOptions.data = $scope.funcionarios;

					if($scope.qtde_funcionario==$scope.funcionarios.length)
					{
						$('#myPleaseWait').modal('hide');
					}
				});

				baseRef.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo= snap.val();
					var posicao=null;
					$scope.funcionarios.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.funcionarios.indexOf(obj);
						}

					});
					if(posicao!=null)
						$scope.funcionarios[posicao]=objNovo;

					if(!$scope.$$phase) {
						$scope.$apply();
					}
				});

				baseRef.on('child_removed', function(snap) {
					$scope.chengeFazenda($scope.fazenda);
				});
			}
		};


			//############################################################################################################################
			//############################################################################################################################
			// FUNCIONARIO
			//############################################################################################################################

			$scope.salvarFuncionario = function(data){
				if(validForm(data)) return false;

				delete data.$$hashKey;					

				var refFuncionario = new Firebase(Constant.Url + '/funcionario/'+$scope.fazenda);
				data['key']=refFuncionario.push().key();

				var refFuncionarioNovo = new Firebase(Constant.Url + '/funcionario/'+$scope.fazenda.key+'/'+ data.key);			
				refFuncionarioNovo.set(data);

				var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/funcionario/'+data.key);
				refFilial.set(true);

				$scope.clear();					

				Notify.successBottom('Funcionário(a) inserida com sucesso!');

			};

			$scope.editarFuncionario = function(data){
				if(validForm(data)) return false;
				delete data.$$hashKey;		

				var refFuncionarioNovo = new Firebase(Constant.Url + '/funcionario/'+$scope.fazenda.key+'/'+ data.key);			
				refFuncionarioNovo.set(data);

				$scope.clear();

				Notify.successBottom('Funcionário(a) atualizada com sucesso!');
			};

			$scope.cancelar = function(){
				$scope.clear();
				$scope.edit = false;
				$scope.save= true;
			};

			$scope.editar = function(obj){
				$scope.desabilitaFazenda=true;
				$scope.data = obj;
				$scope.edit = true;
				$scope.save= false;

				$scope.desabilitaFazenda=true;		

			};

			$scope.excluir = function(objeto){
				$('#modalDelete').modal('show');
			}

			$scope.excluirFuncionario = function(objeto){
				$('#modalDelete').modal('hide');

				if(objeto.qtd!=null)
				{
					if(objeto.qtd>0)
					{
						setMessageError('Já foi associado em funcionário. Impossível continuar.');
						return true;
					}
				}			

				var refFuncionarioNovo = new Firebase(Constant.Url + '/funcionario/' +  $scope.fazenda.key + '/' + objeto.key);
				refFuncionarioNovo.remove();
				
				var refFilial = new Firebase(Constant.Url + '/filial/'+ $scope.fazenda.key + '/funcionario/' + objeto.key);
				refFilial.remove();		

				Notify.successBottom('Funcionário(a) removida com sucesso!');

				$scope.cancelar();
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

				if($scope.fazenda==null || $scope.fazenda.key == null){
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
				angular.extend($scope.data, {
					ativo: true,
					nome: '',
					qtd:0,
					codigo: '',
					valhor: '',
					key:''
				});
				$scope.desabilitaFazenda=false;
				$scope.edit=false;
				$scope.save= true;
				if(!$scope.$$phase) {
					$scope.$apply();
				}

			};

			function castObjToArray(myObj)
			{
				if(myObj==null)
				{
					var sem_nada=[];
					return sem_nada;
				}
				else
				{
					var array = $.map(myObj, function(value, index) {
						return [value];
					});
					return array;

				}
			}

			atualizaListaFiliais();

		}

	}());