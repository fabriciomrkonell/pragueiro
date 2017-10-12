(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('equipeCtrl', equipeCtrl);

	equipeCtrl.$inject = ['$scope', '$compile', '$sce', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', 'Controleacesso'];

	function equipeCtrl($scope, $compile, $sce,  $firebaseArray, $firebaseObject, Session, Constant, Notify, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			equipes: [],
			equipeFilial: [],
			data: {
				ativo:true				
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

		$scope.chengeFazenda = function(fazenda)
		{
			if(fazenda === null) 
			{
				$scope.equipes =null;
			}
			else
			{	
				//--------------------------------------
				//Controle Acesso	
				fazenda.aceempsObj = $scope.todasFazendasAceemps[fazenda.key].aceempsObj;
				$scope.objetoTelaAcesso=fazenda.aceempsObj.equipe;

				if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
				{
					window.location.href = '#home';
				}
				//--------------------------------------

				$scope.clear();

				$scope.equipes=[];

				$scope.gridOptions.data=$scope.equipes;

				if(fazenda.equipes!=null)
				{
					$scope.qtde_equipe= castObjToArray(fazenda.equipes).length;
				}
				else
				{
					$scope.qtde_equipe=0;
					$('#myPleaseWait').modal('hide');
				}


				var baseRef = new Firebase(Constant.Url + '/equipe/' + fazenda.key);		



				
				baseRef.on('child_added', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo= snap.val();

					var posicao=null;
					$scope.equipes.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.equipes.indexOf(obj);
						}

					});
					if(posicao==null)
						$scope.equipes.push(objNovo);
					else						
						$scope.equipes[posicao]=objNovo;

					
					if(!$scope.$$phase) {
						$scope.$apply();
					}
					$scope.gridOptions.data = $scope.equipes;
				});



				baseRef.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo= snap.val();
					var posicao=null;
					$scope.equipes.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.equipes.indexOf(obj);
						}

					});
					if(posicao!=null)
						$scope.equipes[posicao]=objNovo;

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

		

		$scope.getDadosEquipe = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todasEquipes.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todasEquipes.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todasEquipes.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todasEquipes.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarEquipe = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;	

			var refEquipe = new Firebase(Constant.Url + '/equipe/'+$scope.fazenda.key );
			data['key']=refEquipe.push().key();

			var refEquipeNovo = new Firebase(Constant.Url + '/equipe/'+$scope.fazenda.key + '/' +data.key);
			refEquipeNovo.set(data);

			var refEquipeNovo = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/equipe/'+data.key);
			refEquipeNovo.set(true);

			$scope.clear();			
			Notify.successBottom('Equipe inserida com sucesso!');

		};

		$scope.editarEquipe = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;		

			var refEquipeNovo = new Firebase(Constant.Url + '/equipe/'+$scope.fazenda.key + '/' +data.key);
			refEquipeNovo.set(data);
			$scope.clear();

			Notify.successBottom('Equipe atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
			$scope.save=true;
		};

		$scope.editar = function(obj){
			$scope.desabilitaFazenda=true;
			$scope.data = obj;
			$scope.edit = true;
			$scope.save = false;

			$scope.desabilitaFazenda=true;		

		};
		$scope.excluir = function(){
			$('#modalDelete').modal('show');
		};

		$scope.excluirEquipe = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null && $scope.fazenda!=null)
			{
				if(objeto.qtd!=null)
				{
					if(objeto.qtd>0)
					{
						setMessageError('Já foi associado em equipe. Impossível continuar.');
						return true;
					}
				}			

				var refEquipeNovo = new Firebase(Constant.Url + '/equipe/'+ $scope.fazenda.key + '/' + objeto.key);
				refEquipeNovo.remove();
				var refEquipeNovo = new Firebase(Constant.Url + '/filial/'+ $scope.fazenda.key + '/equipe/'+objeto.key);
				refEquipeNovo.remove();						
				Notify.successBottom('Equipe removida com sucesso!');
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
				qtd:0,
				codigo: '',
				key:''
			});
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
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