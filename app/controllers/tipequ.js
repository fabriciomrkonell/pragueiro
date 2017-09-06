(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('tipequCtrl', tipequCtrl);

	tipequCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function tipequCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

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


		var ref = new Firebase(Constant.Url + '/tipequ');
		$scope.todasTipequs = $firebaseArray(ref);
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

					var i=0;
					refNovo.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');

						//console.log('Adicionou filial', snap.name(), snap.val());
						var obj= snap.val();
						$scope.fazendas.push(obj.filial);
						if(i==0)
						{
							$scope.chengeFazenda($scope.fazendas[0]);
							$scope.data.fazenda=$scope.fazendas[0];
						}
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

		$scope.chengeFazenda = function(fazenda)
		{
			if(fazenda === null) 
			{
				$scope.tipequs =null;
			}
			else
			{				

				//$('#myPleaseWait').modal('show');

				$scope.tipequs=[];
				$scope.gridOptions.data=$scope.tipequs;

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/tipequ"),
					[baseRef.child("/tipequ"), "$key"]
					).select(
					{"key":"tipequ.$value","alias":"filial"},
					{"key":"$key.$value","alias":"tipequs"}
					).ref();

					/*
					refNovoQuadra.on('value', function(snapshot) {
						if(snapshot.numChildren()==0)
						{
							$('#myPleaseWait').modal('hide');
						}
					});
					*/
					refNovoQuadra.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						$scope.tipequs.push(objNovo['tipequs']);
						if(!$scope.$$phase) {
							$scope.$apply();
						}
						$scope.gridOptions.data=$scope.tipequs;
					});

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						var x=0;
						var posicao=null;
						$scope.tipequs.forEach(function(obj){
							if(obj.key === objNovo['tipequs'].key)
							{ 
								posicao=x;
							}
							x++;

						});
						if(posicao!=null)
							$scope.tipequs[posicao]=objNovo['tipequs'];

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

		

		$scope.getDadosTipequ = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todasTipequs.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todasTipequs.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todasTipequs.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todasTipequs.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarTipequ = function(data){
			if(validForm(data)) return false;

			var fazendaTmp=data.fazenda;
			delete data.fazenda;
			delete data.$$hashKey;	
			data['filial']=[];
			data['filial'][fazendaTmp.key]=true;
			var refTipequ = new Firebase(Constant.Url + '/tipequ/');
			var key=refTipequ.push().key();
			var refTipequNovo = new Firebase(Constant.Url + '/tipequ/'+key);
			data.key=key;
			refTipequNovo.set(data);
			var refTipequNovo = new Firebase(Constant.Url + '/filial/'+fazendaTmp.key + '/tipequ/'+key);
			refTipequNovo.set(true);
			$scope.chengeFazenda(fazendaTmp);
			$scope.clear();						
			$scope.setaFazenda(fazendaTmp);	

			Notify.successBottom('Tipo Equipamento inserida com sucesso!');



		};

		$scope.editarTipequ = function(data){
			if(validForm(data)) return false;
			var fazendaTmp=data.fazenda;
			delete data.fazenda;
			delete data.$$hashKey;		
			var refTipequ = new Firebase(Constant.Url + '/tipequ/'+data.key);
			refTipequ.set(data);
			data.fazenda=fazendaTmp;
			$scope.clear();

			Notify.successBottom('Tipo Equipamento atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			var fazendaTmp=$scope.data.fazenda;
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
			$scope.chengeFazenda($scope.data.fazenda);	
			$scope.edit = false;
			$scope.save= true;
		};

		$scope.editar = function(obj){
			$scope.desabilitaFazenda=true;
			var fazendaTmp=$scope.data.fazenda;
			$scope.data = obj;
			$scope.data.fazenda=fazendaTmp;
			$scope.edit = true;
			$scope.save= false;

			$scope.desabilitaFazenda=true;		

		};

		$scope.excluir = function(objeto){
			$('#modalDelete').modal('show');
		};

		$scope.excluirTipequ = function(objeto){
			$('#modalDelete').modal('hide');
			var fazendaTmp=$scope.data.fazenda;
			if(objeto.qtd!=null)
			{
				if(objeto.qtd>0)
				{
					setMessageError('Já foi associado em Atividades. Impossível continuar.');
					return true;
				}
			}		

			var refTipequNovo = new Firebase(Constant.Url + '/tipequ/'+objeto.key);
			refTipequNovo.remove();
			var refTipequNovo = new Firebase(Constant.Url + '/filial/'+ $scope.data.fazenda.key + '/tipequ/'+objeto.key);
			refTipequNovo.remove();			
			Notify.successBottom('Tipo Equipamento removida com sucesso!');
			$scope.chengeFazenda(fazendaTmp);
			$scope.cancelar();
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
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			//$scope.chengeFazenda($scope.fazenda);
			//$scope.data.fazenda=fazendaTmp;
		};
		

		//$scope.clear();

	}

}());