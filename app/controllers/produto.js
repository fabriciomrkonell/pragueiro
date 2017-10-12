(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('produtoCtrl', produtoCtrl);

	produtoCtrl.$inject = ['$scope', '$compile', '$sce', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', 'Controleacesso'];

	function produtoCtrl($scope, $compile, $sce, $firebaseArray, $firebaseObject, Session, Constant, Notify, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			produtos: [],
			produtoFilial: [],
			data: {
				ativo: true				
			}
		});

		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.todasFazendasAceemps = JSON.parse(window.localStorage.getItem('todasFazendasAceemps'));
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
			{ field: "marca", displayName: "Marca", width: 120 },
			{ field: "ativo", displayName: "Ativo", width: 90,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
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
						$scope.fazenda.aceempsObj = $scope.todasFazendasAceemps[$scope.fazenda.key].aceempsObj;
					}
					window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));

				});
			}	

		//---	

		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) 
			{
				$scope.produtos =null;
			}
			else
			{		
				//--------------------------------------
				//Controle Acesso	
				fazenda.aceempsObj = $scope.todasFazendasAceemps[fazenda.key].aceempsObj;
				$scope.objetoTelaAcesso=fazenda.aceempsObj.produto;

				if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
				{
					window.location.href = '#home';
				}
				//-------------------------------------
				$scope.clear();
				if(fazenda.produto!=null)
				{
					$scope.qtde_produto= castObjToArray(fazenda.produto).length;
				}
				else
				{
					$scope.qtde_produto=0;
					$('#myPleaseWait').modal('hide');
				}

				$scope.produtos=[];
				$scope.gridOptions.data = $scope.produtos;

				var baseRef = new Firebase(Constant.Url + '/produto/' + fazenda.key);				

				baseRef.on('child_added', function(snap) {
					var objNovo= snap.val();

					var posicao=null;
					$scope.produtos.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.produtos.indexOf(obj);
						}

					});
					if(posicao==null)
						$scope.produtos.push(objNovo);
					else						
						$scope.produtos[posicao]=objNovo;

					
					if(!$scope.$$phase) {
						$scope.$apply();
					}
					$scope.gridOptions.data = $scope.produtos;

					if($scope.qtde_produto==$scope.produtos.length)
					{
						$('#myPleaseWait').modal('hide');
					}
				});



				baseRef.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo= snap.val();
					var posicao=null;
					$scope.produtos.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.produtos.indexOf(obj);
						}

					});
					if(posicao!=null)
						$scope.produtos[posicao]=objNovo;

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
		// QUADRA
		//############################################################################################################################

		$scope.salvarProduto = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;	

			var refProduto = new Firebase(Constant.Url + '/produto/' + $scope.fazenda.key+'/');
			data['key']=refProduto.push().key();

			var refProdutoNovo = new Firebase(Constant.Url + '/produto/' + $scope.fazenda.key+'/' +data.key);
			refProdutoNovo.set(data);

			var refProdutoNovo = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/produto/'+data.key);
			refProdutoNovo.set(true);

			$scope.clear();						

			Notify.successBottom('Produto inserida com sucesso!');		
		};

		$scope.editarProduto = function(data){
			if(validForm(data)) return false;
			delete data.$$hashKey;		

			var refProdutoNovo = new Firebase(Constant.Url + '/produto/' + $scope.fazenda.key+'/' +data.key);
			refProdutoNovo.set(data);

			$scope.clear();

			Notify.successBottom('Produto atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
			$scope.save = true;
		};

		$scope.editar = function(obj){
			$scope.desabilitaFazenda=true;
			$scope.data = obj;
			$scope.edit = true;
			$scope.save = false;

			$scope.desabilitaFazenda=true;		

		};

		$scope.excluir = function(objeto){
			$('#modalDelete').modal('show');
		};

		$scope.excluirProduto = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null && $scope.fazenda!=null)
			{
				if(objeto.qtd!=null)
				{
					if(objeto.qtd>0)
					{
						setMessageError('Já foi associado em produto. Impossível continuar.');
						return true;
					}
				}			

				var refProdutoNovo = new Firebase(Constant.Url + '/produto/'+$scope.fazenda.key + '/'+ objeto.key);
				refProdutoNovo.remove();

				var refProdutoNovo = new Firebase(Constant.Url + '/filial/'+ $scope.fazenda.key + '/produto/'+objeto.key);
				refProdutoNovo.remove();	

				Notify.successBottom('Produto removida com sucesso!');
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
				marca: '',
				obs: '',
				priati: '',
				dospad: '',
				qtd:0,
				codigo: '',
				key:''
			});
			$scope.desabilitaFazenda=false;
			$scope.edit = false;
			$scope.save = true;
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