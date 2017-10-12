(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('tipequCtrl', tipequCtrl);

	tipequCtrl.$inject = ['$scope',  '$compile', '$sce', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', 'Controleacesso'];

	function tipequCtrl($scope,  $compile, $sce, $firebaseArray, $firebaseObject, Session, Constant, Notify, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			tipequs: [],
			tipequFilial: [],
			data: {
				ativo: true		
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

		function atualizaListaFiliais()
		{
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
						$scope.fazendas[posicao] = objNovo['filial'];

					if(objNovo['filial'].key==$scope.fazenda.key)
					{
						window.localStorage.setItem('filialCorrente', JSON.stringify( objNovo['filial']));
						$scope.fazenda=objNovo['filial'];
					}
					window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));

				});
			}	

		//---	
		
		$scope.chengeFazenda = function(fazenda)
		{
			$scope.clear();

			if(fazenda === null) 
			{
				$scope.tipequs =null;
			}
			else
			{			
				//--------------------------------------
				//Controle Acesso	
				$scope.objetoTelaAcesso=fazenda.aceempsObj.tipequ;

				if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
				{
					window.location.href = '#home';
				}
				//-------------------------------------	
				$scope.clear();
				if(fazenda.tipequ!=null)
				{
					$scope.qtde_tipequ= castObjToArray(fazenda.tipequ).length;
				}
				else
				{
					$scope.qtde_tipequ=0;
					$('#myPleaseWait').modal('hide');
				}

				$scope.tipequs=[];
				$scope.gridOptions.data=$scope.tipequs;

				var baseRef = new Firebase(Constant.Url + '/tipequ/' + fazenda.key);				

				baseRef.on('child_added', function(snap) {
					var objNovo= snap.val();

					var posicao=null;
					$scope.tipequs.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.tipequs.indexOf(obj);
						}

					});
					if(posicao==null)
						$scope.tipequs.push(objNovo);
					else						
						$scope.tipequs[posicao]=objNovo;

					
					if(!$scope.$$phase) {
						$scope.$apply();
					}
					$scope.gridOptions.data = $scope.tipequs;

					if($scope.qtde_tipequ==$scope.tipequs.length)
					{
						$('#myPleaseWait').modal('hide');
					}
				});

				baseRef.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo= snap.val();
					var posicao=null;
					$scope.tipequs.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.tipequs.indexOf(obj);
						}

					});
					if(posicao!=null)
						$scope.tipequs[posicao]=objNovo;

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

		$scope.salvarTipequ = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;	

			var refTipequ = new Firebase(Constant.Url + '/tipequ/'+$scope.fazenda.key );
			data['key']=refTipequ.push().key();

			var refTipequNovo = new Firebase(Constant.Url + '/tipequ/'+$scope.fazenda.key +'/'+data.key);
			refTipequNovo.set(data);

			var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/tipequ/'+data.key);
			refFilial.set(true);

			$scope.clear();		

			Notify.successBottom('Tipo Equipamento inserida com sucesso!');
		};

		$scope.editarTipequ = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;		

			var refTipequNovo = new Firebase(Constant.Url + '/tipequ/'+$scope.fazenda.key +'/'+data.key);
			refTipequNovo.set(data);


			$scope.clear();

			Notify.successBottom('Tipo Equipamento atualizada com sucesso!');
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
		};

		$scope.excluirTipequ = function(objeto){
			$('#modalDelete').modal('hide');

			if(objeto.qtd!=null)
			{
				if(objeto.qtd>0)
				{
					setMessageError('Já foi associado em Atividades. Impossível continuar.');
					return true;
				}
			}		

			var refTipequNovo = new Firebase(Constant.Url + '/tipequ/'+$scope.fazenda.key +'/'+objeto.key);
			refTipequNovo.remove();

			var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/tipequ/'+objeto.key);
			refFilial.remove();

			Notify.successBottom('Tipo Equipamento removida com sucesso!');

			$scope.clear();

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
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
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