(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('equipamentoCtrl', equipamentoCtrl);

	equipamentoCtrl.$inject = ['$scope', '$compile', '$sce', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', 'Controleacesso'];

	function equipamentoCtrl($scope, $compile, $sce, $firebaseArray, $firebaseObject, Session, Constant, Notify, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			equipamentos: [],
			equipamentoFilial: [],
			data: {
				ativo:true,
				perimp:true				
			}
		});

		$scope.terminou=false;

		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.posicaoFilial = window.localStorage.getItem('posicaoFilial');
		$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
		var key_usuario  = window.localStorage.getItem('key_usuario');		

		$scope.tipequs=[];
		

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 200 },
			{ field: "tipequ.nome", displayName: "Tipo Equip.", width: 200 },
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

			//--------------------------------------
			//Controle Acesso	
			$scope.objetoTelaAcesso=fazenda.aceempsObj.equipamento;

			if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
			{
				window.location.href = '#home';
			}
			//--------------------------------------
			else
			{
				$scope.clear();
				recuperaTipequis(fazenda);
			}
		};

		//-------------------------------------------------------------------
		function recuperaTipequis(fazenda) {
			$scope.clear();

			if (fazenda === null) {
				$scope.tipequs = null;
			} else 
			{
				if(fazenda.tipequ!=null)
				{
					$scope.qtde_tipequ= castObjToArray(fazenda.tipequ).length;
				}
				else
				{
					$scope.qtde_tipequ=0;
					recuperaEquipamentos(fazenda) 
					$('#myPleaseWait').modal('hide');
				}

				$scope.tipequs = [];
				var baseRef = new Firebase(Constant.Url + '/tipequ/' + fazenda.key);	

				baseRef.on('child_added', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo = snap.val();
					if(objNovo!=null)
					{
						$scope.tipequs.push(objNovo);
					}
					if (!$scope.$$phase) {
						$scope.$apply();
					}

					if($scope.tipequs.length == $scope.qtde_tipequ)
					{
						recuperaEquipamentos(fazenda);
					}
				});					
			}
		}

		function recuperaEquipamentos(fazenda) {
			if(fazenda === null) 
			{
				$scope.equipamentos =null;
			}
			else
			{			
				if(fazenda.equipamento!=null)
				{
					$scope.qtde_equipamento= castObjToArray(fazenda.equipamento).length;
				}
				else
				{
					$scope.qtde_equipamento=0;
					$('#myPleaseWait').modal('hide');
				}

				$scope.equipamentos=[];

				var baseRef = new Firebase(Constant.Url + '/equipamento/' + fazenda.key);				

				baseRef.on('child_added', function(snap) {
					var objNovo= snap.val();

					var posicao=null;
					$scope.equipamentos.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.equipamentos.indexOf(obj);
						}

					});


					if(posicao==null)
						$scope.equipamentos.push(objNovo);
					else						
						$scope.equipamentos[posicao]=objNovo;

					
					$scope.tipequs.forEach(function(obj){
						if(obj.key==objNovo.key_tipequ)
						{
							objNovo['tipequ']=obj;
						}
					});

					if(!$scope.$$phase) {
						$scope.$apply();
					}
					$scope.gridOptions.data = $scope.equipamentos;

					if($scope.qtde_equipamento==$scope.equipamentos.length)
					{
						$('#myPleaseWait').modal('hide');
					}
				});

				baseRef.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo= snap.val();
					var posicao=null;
					$scope.equipamentos.forEach(function(obj){
						if(obj.key === objNovo.key)
						{ 
							posicao=$scope.equipamentos.indexOf(obj);
						}

					});

					$scope.tipequs.forEach(function(obj){
						if(obj.key==objNovo.key_tipequ)
						{
							objNovo['tipequ']=obj;
						}
					});

					if(posicao!=null)
						$scope.equipamentos[posicao]=objNovo;

					if(!$scope.$$phase) {
						$scope.$apply();
					}
				});

				baseRef.on('child_removed', function(snap) {
					$scope.chengeFazenda($scope.fazenda);
				});

			}
		}

		//############################################################################################################################
		//############################################################################################################################
		// EQUIPAMENTO
		//############################################################################################################################

		$scope.salvarEquipamento = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;
			delete data.tipequ;		
			
			var refEquipamento = new Firebase(Constant.Url + '/equipamento/' + $scope.fazenda.key);
			data['key']=refEquipamento.push().key();

			var refEquipamentoNovo = new Firebase(Constant.Url + '/equipamento/'+ $scope.fazenda.key + '/'+ data.key);
			refEquipamentoNovo.set(data);

			var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/equipamento/'+data.key);
			refFilial.set(true);

			$scope.clear();						

			Notify.successBottom('Equipamento inserida com sucesso!');

		};

		$scope.editarEquipamento = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;	
			delete data.tipequ;			

			var refEquipamentoNovo = new Firebase(Constant.Url + '/equipamento/'+ $scope.fazenda.key + '/'+ data.key);
			refEquipamentoNovo.set(data);

			$scope.clear();

			Notify.successBottom('Equipamento atualizada com sucesso!');
		};

		$scope.cancelar = function(){

			$scope.clear();

			$scope.edit = false;
			$scope.save = true;
		};

		$scope.editar = function(obj){

			$scope.desabilitaFazenda=true;
			
			$scope.data = clone(obj);

			$scope.edit = true;
			$scope.save = false;

			$scope.desabilitaFazenda=true;	
		};

		$scope.excluir = function(objeto){
			$('#modalDelete').modal('show');
		}

		$scope.excluirEquipamento = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null && $scope.fazenda!=null)
			{
				if(objeto.qtd!=null)
				{
					if(objeto.qtd>0)
					{
						setMessageError('Já foi associado em equipamento. Impossível continuar.');
						return true;
					}
				}			

				var refEquipamentoNovo = new Firebase(Constant.Url + '/equipamento/'+ $scope.fazenda.key + '/'+ objeto.key);
				refEquipamentoNovo.remove();

				var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/equipamento/'+objeto.key);
				refFilial.remove();

				Notify.successBottom('Equipamento removida com sucesso!');

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

			if(data.key_tipequ== null || data.key_tipequ === ''){
				setMessageError('O campo nome é Tipo Equipamento é obrigatório!');
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
				consumo: '',
				qtd:0,
				codigo: '',
				key:'',
				perimp:true,
				implemento:false,
				chassi:''
			});
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			$scope.save = true;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		};
		

		function clone(obj) {
			if (null == obj || "object" != typeof obj) return obj;
			var copy = obj.constructor();
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
			}
			return copy;
		}


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

		recuperaTipequis($scope.fazenda);

	}

}());