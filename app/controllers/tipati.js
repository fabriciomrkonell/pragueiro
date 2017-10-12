(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('tipatiCtrl', tipatiCtrl);

	tipatiCtrl.$inject = ['$scope', '$compile', '$sce', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', 'Controleacesso'];

	function tipatiCtrl($scope, $compile, $sce, $firebaseArray, $firebaseObject, Session, Constant, Notify, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			tipatis: [],
			tipatiFilial: [],
			data: {
				ativo: true,
				aplagr: false,
				aplagr: false,
				plantio: false,
				colheita: false,
				quahor: 0			
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
				$scope.tipatis =null;
			}
			else
			{				
				//--------------------------------------
				//Controle Acesso	
				$scope.objetoTelaAcesso=fazenda.aceempsObj.tipati;

				if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
				{
					window.location.href = '#home';
				}
				//-------------------------------------
				$scope.clear();
				if(fazenda.tipati!=null)
				{
					$scope.qtde_tipati= castObjToArray(fazenda.tipati).length;
				}
				else
				{
					$scope.qtde_tipati=0;
					$('#myPleaseWait').modal('hide');
				}


				$scope.tipatis=[];
				$scope.gridOptions.data=$scope.tipatis;

				var baseRef = new Firebase(Constant.Url + '/tipati/' + fazenda.key);				

				baseRef.on('child_added', function(snap) {
					var objNovo= snap.val();

					var posicao=null;
					$scope.tipatis.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.tipatis.indexOf(obj);
						}

					});
					if(posicao==null)
						$scope.tipatis.push(objNovo);
					else						
						$scope.tipatis[posicao]=objNovo;

					
					if(!$scope.$$phase) {
						$scope.$apply();
					}
					$scope.gridOptions.data = $scope.tipatis;

					if($scope.qtde_tipati==$scope.tipatis.length)
					{
						$('#myPleaseWait').modal('hide');
					}
				});

				baseRef.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo= snap.val();
					var posicao=null;
					$scope.tipatis.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.tipatis.indexOf(obj);
						}

					});
					if(posicao!=null)
						$scope.tipatis[posicao]=objNovo;

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

		$scope.salvarTipati = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;	

			var refTipati = new Firebase(Constant.Url + '/tipati/'+$scope.fazenda.key );
			data['key']=refTipati.push().key();

			var refTipatiNovo = new Firebase(Constant.Url + '/tipati/'+$scope.fazenda.key +'/'+data.key);
			refTipatiNovo.set(data);

			var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/tipati/'+data.key);
			refFilial.set(true);

			$scope.clear();						

			Notify.successBottom('Tipo Ordem de Serviço/Atividade inserida com sucesso!');



		};

		$scope.editarTipati = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;	

			var refTipatiNovo = new Firebase(Constant.Url + '/tipati/'+$scope.fazenda.key +'/'+data.key);
			refTipatiNovo.set(data);

			$scope.clear();

			Notify.successBottom('Tipo Ordem de Serviço/Atividade atualizada com sucesso!');
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

		$scope.excluirTipati = function(objeto){
			$('#modalDelete').modal('hide');

			if(objeto.qtd!=null)
			{
				if(objeto.qtd>0)
				{
					setMessageError('Já foi associado em Atividades. Impossível continuar.');
					return true;
				}
			}		

			var refTipatiNovo = new Firebase(Constant.Url + '/tipati/'+$scope.fazenda.key +'/'+objeto.key);
			refTipatiNovo.remove();

			var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/tipati/'+objeto.key);
			refFilial.remove();		

			Notify.successBottom('Tipo Ordem de Serviço/Atividade removida com sucesso!');

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
			if(data.coordenadas === ''){
				setMessageError('O campo coordenada é inválido!');
				return true;
			}

			if(data.ageant != null && data.ageant==true && (data.diaant==null || data.diaant=='')){
				setMessageError('O campo Qtde dias (agendar antes) é obrigatório!');
				return true;
			}
			if(data.agedep != null && data.agedep==true && (data.diadep==null || data.diadep=='')){
				setMessageError('O campo Qtde dias (agendar depois) é obrigatório!');
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
				key:'',
				aplagr: false,
				plantio: false,
				colheita: false,
				quahor:0
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