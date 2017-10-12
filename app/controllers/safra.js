(function(){

	'use strict'; 

	angular.module('Pragueiro.controllers').registerCtrl('safraCtrl', safraCtrl);

	safraCtrl.$inject = ['$scope', '$compile', '$sce', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify', '$interval', 'Controleacesso'];

	function safraCtrl($scope, $compile,  $sce,  Constant, Session, $firebaseArray, $firebaseObject, Notify, $interval, Controleacesso) {

		angular.extend($scope, {
			objSafra: {},
			formPlanejamento: {
				ativo:true,
				key:'',
				key_cultura:'',
				data_plantio: undefined,
				variedades:[]
			},
			objHistorico: {},
			edit: false,
			save:true,
			editQuadra: false,
			editCultura: true,
			fazendas: [],
			safras: [],
			historico: [],
			culturas: [],
			key_var:[],
			variedades: [],
			variedadesAdd: [],
			todasQuadras: [],
			quadrasPlanejamento: [],
			data: {
			},
			data: {
				descricao: '',
				ativo: true,
				key: '',
				key_filial:'',
				data_plantio : ''
			}
		});

		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.posicaoFilial = window.localStorage.getItem('posicaoFilial');
		$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
		var key_usuario  = window.localStorage.getItem('key_usuario');


		$scope.data.data_plantio = new Date();
		var ref = new Firebase(Constant.Url + '/filial'),
		refCultura = new Firebase(Constant.Url + '/cultura'),
		refQuadra = new Firebase(Constant.Url + '/quadra'),
		_salvarQuadra = false,
		refSafra = null,
		refQuadrasCulturas = null,
		refHistoricoQuadrasCulturas = null;


		$scope.planejamentoExcluir={};

		$scope.culturas = $firebaseArray(refCultura);
		var todasQuadras = $firebaseArray(refQuadra);
		

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "descricao", displayName: "Descricao", width: 400 },


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
				$scope.ChamarEditarSafra(row.entity);
			});
		};

		function atualizaVariedade(key_filial)
		{
			var refVariedades = new Firebase(Constant.Url + '/variedade/'+ key_filial);
			refVariedades.ref().on('child_added', function(snap) {
				$scope.variedades.push(snap.val());
			});
		}

		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA/FILIAL
		//############################################################################################################################

		function atualizaListaFiliais()
		{
			
			//$scope.chengeFazenda($scope.fazenda);

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
					var objNovo = snap.val();
					var posicao = null;
					$scope.fazendas.forEach(function(obj) {
						if (obj.key === objNovo['filial'].key) {
							posicao = $scope.fazendas.indexOf(obj);
						}
					});
					if (posicao == null)
						$scope.fazendas[posicao] = objNovo['filial'];

					if(objNovo['filial'].key==$scope.fazenda.key)
					{
						window.localStorage.setItem('filialCorrente', JSON.stringify( objNovo['filial']));
						$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
						$scope.chengeFazenda($scope.fazenda);
					}
					window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));

				});	

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
						$scope.chengeFazenda($scope.fazenda);
					}
					window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));

				});			

			}


			$scope.chengeFazenda = function(fazenda){
				if(fazenda === null) return false;

				//--------------------------------------
				//Controle Acesso	
				$scope.objetoTelaAcesso=fazenda.aceempsObj.safra;

				if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
				{
					window.location.href = '#home';
				}
				//-------------------------------------
				$scope.clear();
				$scope.safras = [];
				$scope.gridOptions.data = $scope.safras;
				if(fazenda.safra!=null)
				{
					$scope.safras=castObjToArray(fazenda.safra);
					$scope.gridOptions.data = $scope.safras;
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}
				else
				{
					$scope.safras = [];
					$scope.gridOptions.data = $scope.safras;
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}

			};

			$scope.setaFazenda = function(fazenda){
				if(fazenda === null) return false;

				$scope.fazendas.forEach(function(item){
					if(item.key === fazenda.key) 	
					{
						$scope.data.fazenda = item;		
					}
				});

			};


		//############################################################################################################################
		//############################################################################################################################
		// SAFRA
		//############################################################################################################################

		$scope.salvarSafra = function(data){
			
			if(validdata(data)) return true;
			if($scope.fazenda==null) return false;

			delete data.$$hashKey;

			var refSafra =  new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key+'/safra/');
			data.key=refSafra.push().key();
			
			var refSafraNovo = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key+'/safra/'+data.key);
			refSafraNovo.set(data);

			Notify.successBottom('Safra salva com sucesso!');

			$scope.clear();
		};

		$scope.atualizarSafra = function(data){
			if(validdata(data)) return true;
			if($scope.fazenda==null) return false;

			delete data.$$hashKey;
			
			var refSafraNovo = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key+'/safra/'+data.key);
			refSafraNovo.set(data);

			Notify.successBottom('Safra atualizada com sucesso!');
			$scope.clear();
		};

		$scope.ChamarEditarSafra = function(data){
			$scope.data = clone(data);
			$scope.edit = true;
			$scope.save=false;
		};

		$scope.chamaExcluirSafra= function(data){
			$('#modalDelete').modal('show');
			return true;
		};


		$scope.excluirSafra = function(data){
			$('#modalDelete').modal('hide');
			if(data!=null && data.key!=null)
			{
				var refVariedadeNovo = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key+'/safra/'+data.key);
				refVariedadeNovo.remove();

				Notify.successBottom('Safra removida com sucesso!');
				$scope.clear();
			}
		};

		$scope.cancelar= function(data){
			$scope.clear();
			$scope.edit = false;
			$scope.save = true;
			return true;
		};

		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA X SAFRA X QUADRA X CULTURA
		//############################################################################################################################

		$scope.showQuadras = function(fazenda, safra){
			if(safra === null) return false;
			$scope.objSafra=safra;
			if($scope.culturas.length === 0) return false;
			if($scope.todasQuadras.length > 0) 
			{
				$scope.recuperaPlanejamentos(fazenda, safra);
			}	
			refHistoricoQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.$id +'/historicorelacionamento');
			$scope.historico = $firebaseArray(refHistoricoQuadrasCulturas);


			$('#modalQuadras').modal('show');
		};


		$scope.salvarPlanejamento = function(fazenda, safra, formPlanejamento){
			if(validFormQuadraXCultura(formPlanejamento)) return true;

			if(isNaN(formPlanejamento.data_plantio) || formPlanejamento.data_plantio==null) 
			{
				delete formPlanejamento.data_plantio;
			}
			else
			{		
				formPlanejamento.data_plantio=new Date(formPlanejamento.data_plantio).getTime();
			}

			var refNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/'+safra.key+'/quadra/'+formPlanejamento.key);
			delete formPlanejamento.cultura;
			delete formPlanejamento.quadra;

			refNovo.set(formPlanejamento);

			Notify.successBottom('Relacionamento salvo com sucesso!');
			_salvarQuadra = true;
			$scope.formPlanejamento.key=null;
			$scope.formPlanejamento.key_cultura=null;
			$scope.setaFazenda($scope.data.fazenda);	
		};

		$scope.ChamarEditarPlanejamento = function(quadracultura)
		{
			$scope.editCultura=true;
			var data=clone(quadracultura);
			if(data.variedades!=null)
			{
				$scope.editCultura=false;
				var listVariedades=[];
				for(var objVar in data.variedades)
				{
					for (var i = 0; i < $scope.variedades.length; i++)
					{
						for(var obj in $scope.variedades[i])
						{							
							if($scope.variedades[i][obj].key==objVar)
							{
								listVariedades.push($scope.variedades[i][obj]);
								break;
							}							
						}
					}
				}
				data['variedades']=listVariedades;
			}

			$scope.formPlanejamento = data;
			$scope.formPlanejamento.data_plantio = new Date(data.data_plantio);
			$scope.editQuadra = true;
			$scope.chengeCultura($scope.formPlanejamento.key_cultura);

			return true;
		};

		$scope.atualizarPlanejamento = function(fazenda, safra, formPlanejamento){
			if(validFormQuadraXCultura(formPlanejamento)) return true;

			if(isNaN(formPlanejamento.data_plantio) || formPlanejamento.data_plantio==null) 
			{
				delete formPlanejamento.data_plantio;
			}
			else
			{		
				formPlanejamento.data_plantio=new Date(formPlanejamento.data_plantio).getTime();
			}
			
			console.log(Constant.Url + '/filial/' + fazenda.key + '/safra/'+safra.key+'/quadra/'+formPlanejamento.key);
			var refNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/'+safra.key+'/quadra/'+formPlanejamento.key);

			delete formPlanejamento.key_variedade;
			delete formPlanejamento.cultura;
			delete formPlanejamento.quadra;
			delete formPlanejamento.$$hashKey;
			delete formPlanejamento.$id;
			delete formPlanejamento.$priority;
			delete formPlanejamento.variedades;

			refNovo.update(formPlanejamento);
			//$scope.quadrasPlanejamento.$save(formPlanejamento);
			$scope.addHistorico(formPlanejamento.key, formPlanejamento.key_cultura, 'Atualizou');
			Notify.successBottom('Relacionamento atualziado com sucesso!');
			$scope.recuperaPlanejamentos(fazenda, safra);
			$scope.clearFormPlanejamento();
			$scope.setaFazenda(fazenda);		
		};

		$scope.chamaExcluirPlanejamento= function(data){
			$scope.planejamentoExcluir=data;
			$('#modalDeletePlanejamento').modal('show');
			return true;
		};

		$scope.excluirPlanejamento = function(){
			$('#modalDeletePlanejamento').modal('hide');
			var data=$scope.planejamentoExcluir;
			if(data!=null)
			{
				var fazendaTmp=$scope.data.fazenda;
				$scope.quadrasPlanejamento.$remove(data);
				$scope.addHistorico(data.key, data.key_cultura, 'Removeu');
				Notify.successBottom('Relacionamento removido com sucesso!');
				$scope.setaFazenda(fazendaTmp);
			}
		};

		$scope.recuperaPlanejamentos = function(fazenda, safra){

			refQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra');
			$scope.quadrasPlanejamento = $firebaseArray(refQuadrasCulturas);
			$scope.editQuadra = false;
			return true;
		};

		$scope.chengeCultura = function(key_cultura){
			if(key_cultura === null) return false;
			$scope.variedadesAdd=[];
			for (var i = 0; i < $scope.variedades.length; i++)
			{						
				for(var obj in $scope.variedades[i])
				{	
					if($scope.variedades[i][obj].key_cultura==key_cultura)
					{
						$scope.variedadesAdd.push($scope.variedades[i][obj]);					
					}
				}
			}
		};

		//############################################################################################################################
		//############################################################################################################################
		//VARIEDADE
		//############################################################################################################################

		$scope.chengeVariedade = function(cultura){
			//if(cultura === null) return false;
			$scope.variedadesAdd=[];
			for (var i = 0; i < $scope.variedades.length; i++)
			{						
				for(var obj in $scope.variedades[i])
				{	
					if($scope.variedades[i][obj].key_cultura==cultura)
					{
						$scope.variedadesAdd.push($scope.variedades[i][obj]);					
					}
				}
			}
		};

		$scope.excluirVariedade = function(fazenda, safra, formPlanejamento, variedade){
			if(variedade!=null && variedade.key!=null)
			{
				var fazendaTmp=fazenda;
				var refVariedadeNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra/'+formPlanejamento.key+'/variedades/'+variedade.key);
				refVariedadeNovo.remove();
				console.log(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra/'+formPlanejamento.key+'/variedades/'+variedade.key);
				Notify.successBottom('Variedade removida com sucesso!');
				for (var i = 0; i < $scope.variedadesAdd.length; i++)
				{			
					if($scope.variedadesAdd[i].key==variedade.key)
					{
						$scope.formPlanejamento.variedades.splice(i);
						break
					}
				}
				$scope.setaFazenda(fazendaTmp);
			}
		};

		$scope.salvarVariedade = function(fazenda, safra, formPlanejamento){
			var fazendaTmp=fazenda;
			var refVariedadeNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra/'+formPlanejamento.key+'/variedades/'+formPlanejamento.key_variedade);
			
			var frmVariedade={};
			frmVariedade['key_variedade']=formPlanejamento.key_variedade;
			frmVariedade['key_safra']=safra.key;
			frmVariedade['key_quadra']=formPlanejamento.key;
			if(formPlanejamento.area_variedade!=null)
			{
				frmVariedade['area']=formPlanejamento.area_variedade;
			}

			refVariedadeNovo.set(frmVariedade);

			console.log(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra/'+formPlanejamento.key+'/variedades/'+formPlanejamento.key_variedade);
			for (var i = 0; i < $scope.variedadesAdd.length; i++)
			{			
				if($scope.variedadesAdd[i].key==formPlanejamento.key_variedade)
				{
					if(formPlanejamento.variedades!=null)
					{
						formPlanejamento.variedades.push($scope.variedadesAdd[i]);
					}
					else
					{
						formPlanejamento['variedades']=[]
						formPlanejamento.variedades.push($scope.variedadesAdd[i]);
					}
					break;
				}
			}
			
			Notify.successBottom('Variedade adicionada com sucesso!');
			$scope.setaFazenda(fazendaTmp);
		};

		//############################################################################################################################
		//############################################################################################################################
		//HISTÓRICO
		//############################################################################################################################

		$scope.addHistorico = function(quadraId, culturaId, tipo){
			$scope.historico.$add({
				quadra: quadraId,
				cultura: culturaId,
				tipo: tipo,
				dataAlteracao: new Date().getTime()
			});
		};

		$scope.getHistoricoQuadrasCulturas = function(fazenda, safra){
			$scope.objHistorico = safra;
			refHistoricoQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.$id +'/historicorelacionamento');
			$scope.historico = $firebaseArray(refHistoricoQuadrasCulturas);
			$('#modalHistoricoQuadras').modal('show');
		};

		//############################################################################################################################
		//############################################################################################################################
		//RECUPERA NOME QUADRA/CULTURA
		//############################################################################################################################
		$scope.getCulturaNome = function(culturaId){
			var retorno = '';
			$scope.culturas.forEach(function(item){
				if(item.$id === culturaId) retorno = item.nome;
			});
			return retorno;
		};

		$scope.getQuadraNome = function(quadraId){
			var retorno = '';
			$scope.todasQuadras.forEach(function(item){
				if(item.$id === quadraId) retorno = item.nome;
			});
			return retorno;
		};

		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		function validdata(data){
			if($scope.fazenda == null){
				Notify.errorBottom('O campo fazenda é inválido!');
				return true;
			}
			if(data.descricao == ''){
				Notify.errorBottom('O campo descriçāo é inválido!');
				return true;
			}
			if(data.ativo === null){
				Notify.errorBottom('O campo ativo é inválido!');
				return true;
			}
			
			return false;
		};

		function validFormQuadraXCultura(data){
			
			if(data.key == null){
				Notify.errorBottom('O campo quadra é inválido!');
				return true;
			}
			else
			{
				if(data.key == ''){
					Notify.errorBottom('O campo quadra é inválido!');
					return true;
				}
			}
			if(data.key_cultura == null){
				Notify.errorBottom('O campo cultura é inválido!');
				return true;
			}
			else
			{
				if(data.key_cultura == ''){
					Notify.errorBottom('O campo cultura é inválido!');
					return true;
				}
			}
			return false;
		};

		$scope.clear = function(){
			$scope.data.descricao = '';
			$scope.data.ativo= true
			$scope.data.key='';

			$scope.edit=false;
			$scope.save=true;
			return true;
		};

		$scope.clearFormPlanejamento= function(){
			angular.extend($scope.formPlanejamento, {
				ativo:true,
				key:'',
				area: 0,
				key_cultura:'',
				data_plantio: undefined,
				variedades:[]
			});			
			return true;
		};

		function clone(obj) {
			if (null == obj || "object" != typeof obj) return obj;
			var copy = obj.constructor();
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
			}
			return copy;
		}

		$scope.$watch('quadra', function(newValue, oldValue){
			if(_salvarQuadra){
				$scope.addHistorico(newValue[newValue.length - 1].key, newValue[newValue.length - 1].key_cultura, 'Adicionou');
				_salvarQuadra = false;
			}
		});


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

		$scope.dataat = 'yyyy/MM/dd';
		$scope.date = new Date();


		atualizaListaFiliais();
	}

}());