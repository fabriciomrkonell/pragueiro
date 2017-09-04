(function(){

	'use strict'; 

	angular.module('Pragueiro.controllers').registerCtrl('planejamentoCtrl', planejamentoCtrl);

	planejamentoCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify', '$interval'];

	function planejamentoCtrl($scope, Constant, Session, $firebaseArray, $firebaseObject, Notify, $interval) {

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
			historico: [],
			culturas: [],
			key_var:[],
			variedades: [],
			variedadesAdd: [],
			todasQuadras: [],
			quadrasPlanejamento: [],
			data: {
				ativo: true,
				key_quadra: '',
				key_cultura:'',
				key_filial:'',
				data_plantio : ''
			},
			formPlanejamento:
			{
				key_variedade: '',
				area: ''
			}
		});
		
		var fazendaSelecioanda;

		$scope.qtde_quadras = 0 ; 
		$scope.qtde_culturas = 0;
		$scope.qtde_variedades = 0;
		$scope.soma_area=0;

		$scope.todasQuadras=[];
		$scope.todasVariedades=[];
		$scope.todasCulturas=[];
		$scope.todasVariedadesPlanejamento=[];
		var ref = new Firebase(Constant.Url + '/filial'),

		_salvarQuadra = false,
		refSafra = null,
		
		refHistoricoQuadrasCulturas = null;

		recuperaCulturaQtde();
		recuperaCultura();

		atualizaListaFiliais();
		$scope.planejamentoExcluir={};

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "quadra.nome", displayName: "Quadra/Região", width: 150 },
			{ field: "cultura.nome", displayName: "Cultura", width: 150 },
			{ field: "area", displayName: "Área", width: 90 },
			{ field: "separar_variedade", displayName: "Separa Variedade", width: 150, cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValueSepara(row)}}</div>" },
			{ field: "ativo", displayName: "Ativo", width: 100,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				},
				mapValueSepara: function(row) {
					return row.entity.separar_variedade ? 'Sim' : 'Não';
				}
			}
		};

		$scope.gridOptions.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.ChamarEditarPlanejamento(row.entity);
			});
		};

		$scope.gridOptionsVariedades  = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "nome", displayName: "Variedade", width: 150 },
			{ field: "area", displayName: "Área", width: 120 },			
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				},
				mapValueSepara: function(row) {
					return row.entity.separar_variedade ? 'Sim' : 'Não';
				}
			}
		};

		$scope.gridOptionsVariedades.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.ChamarEditarVariedade(row.entity);
			});
		};



		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA/FILIAL
		//############################################################################################################################
		function atualizaListaFiliais() {
			$('#myPleaseWait').modal('show');

			var refUser = new Firebase(Constant.Url + '/usuarioxauth/' + Session.getUser().uid);
			var obj = $firebaseObject(refUser);
			var key_usuario;
			obj.$loaded().then(function() {
				key_usuario = obj.$value;

				$scope.fazendas = [];
				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovo = new Firebase.util.NormalizedCollection(
					[baseRef.child("/usuario/" + key_usuario + "/filial/"), "$key"],
					baseRef.child("/filial")
					).select({
						"key": "$key.$key",
						"alias": "key"
					}, {
						"key": "filial.$value",
						"alias": "filial"
					}).ref();
					var i=0;

					refNovo.on('child_added', function(snap) {

						var obj = snap.val();
						$scope.fazendas.push(obj.filial);


						if(obj.filial.quadra!=null)
						{
							$scope.qtde_quadras =+ Object.keys(obj.filial.quadra).length;
						}
						else
						{
							$scope.qtde_quadras =+ 0;
						}
						if(obj.filial.variedade!=null)
						{
							$scope.qtde_variedades =+ Object.keys(obj.filial.variedade).length;
						}
						else
						{
							$scope.qtde_variedades =+ 0;
						}

						recuperaQuadra(obj);
						recuperaVariedade(obj);

						if (!$scope.$$phase) {
							$scope.$apply();
						}
					});

			}); // final do load
		}
		$scope.chengeFazenda = function(fazenda){
			if (fazenda === null) return false;
			$scope.planejamentos=[];
			fazendaSelecioanda = fazenda;
			$scope.safras = [];
			for (var propertyName in fazenda.safra) {
				$scope.safras.push(fazenda.safra[propertyName]);
			}
			
			$scope.chengeSafra($scope.safras[0]);
			$scope.safra=$scope.safras[0];
		};
		//-------------------------------------------------------------------
		$scope.chengeSafra = function(safra){
			if (fazendaSelecioanda === null) return false;
			$scope.planejamentos=[];
			$scope.gridOptions.data = $scope.planejamentos;

			var refSafraXquadra = new Firebase(Constant.Url + '/filial/' + fazendaSelecioanda.key + '/safra/' + safra.key+'/quadra');
			refSafraXquadra.on('child_added', function(snap) {

				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.planejamentos.forEach(function(obj) {
					if (obj.key === objNovo.key) {
						posicao = x;
					}
					x++;

				});
				if (posicao == null) {
					$scope.todasQuadras.forEach(function(obj2) {
						if (obj2.key!=null && objNovo.key === obj2.key) {
							objNovo['quadra'] = obj2;
						}
					});

					$scope.todasCulturas.forEach(function(obj2) {
						if (objNovo.key_cultura === obj2.key) {
							objNovo['cultura'] = obj2;
						}
					});

					$scope.planejamentos.push(objNovo);
					$scope.gridOptions.data = $scope.planejamentos;
				}
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

			refSafraXquadra.on('child_changed', function(snap) {
				$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.planejamentos.forEach(function(obj) {
					if (obj.key === objNovo.key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null) {

					$scope.todasQuadras.forEach(function(obj2) {
						if (obj2.key!=null && objNovo.key === obj2.key) {
							objNovo['quadra'] = obj2;
						}
					});

					$scope.todasCulturas.forEach(function(obj2) {
						if (objNovo.key_cultura === obj2.key) {
							objNovo['cultura'] = obj2;
						}
					});

					$scope.planejamentos[posicao] = objNovo;
				}

				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

			refSafraXquadra.on('child_removed', function(snap) {
				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.planejamentos.forEach(function(obj) {
					if (obj.key === objNovo.key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null) {
					delete $scope.planejamentos[posicao];
				}

			});
		};
		//-------------------------------------------------------------------
		$scope.setaFazenda = function(fazenda){
			if(fazenda === null) return false;

			$scope.fazendas.forEach(function(item){
				if(item.key === fazenda.key) 	
				{
					$scope.fazenda = item;		
				}
			});			
		};
		//-------------------------------------------------------------------
		function recuperaQuadra(fazenda) {
			if (fazenda === null) {
				$scope.todasQuadras = null;
			} else {

				$scope.todasQuadras = [];

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/" + fazenda.key + "/quadra"), [baseRef.child("/quadra"), "$key"]
					).select({
						"key": "quadra.$value",
						"alias": "filial"
					}, {
						"key": "$key.$value",
						"alias": "Quadras"
					}).ref();

					refNovoQuadra.on('child_added', function(snap) {
						var objNovo = snap.val();
						$scope.todasQuadras.push(objNovo['Quadras']);
						if (!$scope.$$phase) {
							$scope.$apply();
						}
						if(verificaFinalizacaoCarregamento())
						{
							$scope.chengeFazenda($scope.fazendas[0]);
							$scope.fazenda=$scope.fazendas[0];
							$('#myPleaseWait').modal('hide');
						}
					});

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo = snap.val();
						var x = 0;
						var posicao = null;
						$scope.todasQuadras.forEach(function(obj) {
							if (obj.key === objNovo['Quadras'].key) {
								posicao = x;
							}
							x++;

						});
						if (posicao != null)
							$scope.todasQuadras[posicao] = objNovo['Quadras'];

						if (!$scope.$$phase) {
							$scope.$apply();
						}
					});

					refNovoQuadra.on('child_removed', function(snap) {
						var x = 0;
						var posicao = null;
						$scope.todasQuadras.forEach(function(obj) {
							if (obj.key === objNovo['Quadras'].key) {
								posicao = x;
							}
							x++;

						});
						if (posicao != null)
							delete	$scope.todasQuadras[posicao];
					});
				}
			}
		//-------------------------------------------------------------------
		function recuperaVariedade(fazenda) {
			if (fazenda === null) {
				$scope.todasVariedades = null;
			} else {

				$scope.todasVariedades = [];

				var refUsuarios= new Firebase(Constant.Url + '/variedade/'+fazenda.key);

				refUsuarios.ref().on('child_added', function(snap) {
					var variedades_brutas=snap.val();
					$scope.todasVariedades.push(variedades_brutas);

					for(var obj in variedades_brutas ){
						var objVar=variedades_brutas[obj];
						$scope.todasVariedades.push(objVar);
					};
					if(verificaFinalizacaoCarregamento())
					{
						$scope.chengeFazenda($scope.fazendas[0]);
						$scope.fazenda=$scope.fazendas[0];
						$('#myPleaseWait').modal('hide');
						if (!$scope.$$phase) {
							$scope.$apply();
						}
					}
				}); 

				
			}
		}
		//-------------------------------------------------------------------
		function recuperaCulturaQtde() {

			var baseRef = new Firebase(Constant.Url+'/cultura');
			baseRef.on('value', function(snapshot) {
				$scope.qtde_culturas= snapshot.numChildren();

			});
		}
		//-------------------------------------------------------------------
		function recuperaCultura() {

			var baseRef = new Firebase(Constant.Url+'/cultura');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.todasCulturas.push(objNovo);
				
				if(verificaFinalizacaoCarregamento())
				{
					$scope.chengeFazenda($scope.fazendas[0]);
					$scope.fazenda=$scope.fazendas[0];
					$('#myPleaseWait').modal('hide');
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				}

			}, function(error) {
				console.error(error);
			});
		}
		
		function verificaFinalizacaoCarregamento()
		{
			if($scope.todasQuadras.length==$scope.qtde_quadras
				&& $scope.todasCulturas.length==$scope.qtde_culturas
				&& $scope.todasVariedades.length==$scope.qtde_variedades
				)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		//############################################################################################################################
		//############################################################################################################################
		// PLANEJAMENTO
		//############################################################################################################################

		$scope.salvarPlanejamento = function(){
			if(validForm($scope.data)) return true;

			var retorna=false;
			
			$scope.planejamentos.forEach(function(var_pla) {
				if (var_pla.key == $scope.data.key) {
					Notify.errorBottom('Quadra/região já está relacionada nesta safra!');
					retorna=true;
				}
			});

			if(!retorna)
			{

				var refNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/safra/'+$scope.safra.key+'/quadra/'+$scope.data.key);

				var mPlanejamento = {};
				mPlanejamento['key_fazenda']=$scope.fazenda.key;
				mPlanejamento['key_safra']=$scope.safra.key;
				mPlanejamento['key'] = $scope.data.key;
				mPlanejamento['key_cultura'] = $scope.data.key_cultura;
				mPlanejamento['area'] = $scope.data.area;
				mPlanejamento['ativo'] = $scope.data.ativo;

				if( $scope.data.separar_variedade!=null)
				{
					mPlanejamento['separar_variedade'] = $scope.data.separar_variedade;
				}
				else
				{
					mPlanejamento['separar_variedade'] = false;
				}

				if(isNaN($scope.data.data_plantio) || $scope.data.data_plantio==null || $scope.data.data_plantio=='') 
				{

				}
				else
				{		
					mPlanejamento['data_plantio']=new Date($scope.data.data_plantio).getTime();
				}
				refNovo.set(mPlanejamento);

				$scope.todasQuadras.forEach(function(quadra) {
					if (quadra.key == $scope.data.key) {
						mPlanejamento['quadra']=quadra;
					}
				});

				$scope.todasCulturas.forEach(function(cultura) {
					if (cultura.key == $scope.data.key_cultura) {
						mPlanejamento['cultura']=cultura;
					}
				});

				Notify.successBottom('Planejamento salvo com sucesso!');

				$scope.edit = true;
				$scope.save=false;
			}

		};

		$scope.atualizarPlanejamento = function(){

			if(validForm($scope.data)) return true;

			var refNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/safra/'+$scope.safra.key+'/quadra/'+$scope.data.key);

			var mPlanejamento = {};
			mPlanejamento['key'] = $scope.data.key;
			mPlanejamento['key_cultura'] = $scope.data.key_cultura;
			mPlanejamento['area'] = $scope.data.area;
			mPlanejamento['ativo'] = $scope.data.ativo;
			if( $scope.data.separar_variedade!=null)
			{
				mPlanejamento['separar_variedade'] = $scope.data.separar_variedade;
			}
			else
			{
				mPlanejamento['separar_variedade'] = false;
			}

			if(isNaN($scope.data.data_plantio) || $scope.data.data_plantio==null) 
			{

			}
			else
			{		
				mPlanejamento['data_plantio']=new Date($scope.data.data_plantio).getTime();
			}

			if($scope.data.variedades!=null)
			{
				if(!Array.isArray($scope.data.variedades))
				{
					mPlanejamento['variedades']=$scope.data.variedades;
				}
				else
				{
					var list_var=[];
					$scope.data.variedades.forEach(function(var_pla) 
					{
						list_var[var_pla.key]=[];
						list_var[var_pla.key]['key_variedade']=var_pla.key;
						if(var_pla.area!=null)
						{
							list_var[var_pla.key]['area']=var_pla.area;
						}
					});
					mPlanejamento['variedades']=list_var;
				}		
			}

			refNovo.set(mPlanejamento);

			Notify.successBottom('Planejamento atualizado com sucesso!');
		};

		$scope.ChamarEditarPlanejamento = function(data){
			$scope.clearFormVariedade();
			data.data_plantio = new Date(data.data_plantio);
			$scope.data = data;
			$scope.edit = true;
			$scope.save=false;
			$scope.soma_area = 0;

			$scope.variedadesAdd=[];
			$scope.todasVariedades.forEach(function(obj2) {
				if (obj2.key_cultura!=null && data.key_cultura === obj2.key_cultura) {
					$scope.variedadesAdd.push(obj2);
				}
			});

			$scope.todasVariedadesPlanejamento=[];

			if(data.variedades!=null)
			{
				$scope.editCultura=false;

				if(!Array.isArray(data.variedades))
				{
					for(var objVar in data.variedades)
					{
						$scope.variedadesAdd.forEach(function(variedade) {
							if (objVar === variedade.key) {
								var obj=variedade;
								if(data.variedades[objVar].area!=null)
								{
									obj['area']=data.variedades[objVar].area;
									$scope.soma_area = $scope.soma_area + data.variedades[objVar].area;
								}
								$scope.todasVariedadesPlanejamento.push(obj);
							}
						});


					}
				}
				else
				{
					data.variedades.forEach(function(var_pla) 
					{
						$scope.variedadesAdd.forEach(function(variedade) {
							if (var_pla.key === variedade.key) {
								var obj=variedade;
								if(var_pla.area!=null)
								{
									obj['area']=var_pla.area;
									$scope.soma_area = $scope.soma_area + var_pla.area;
								}
								$scope.todasVariedadesPlanejamento.push(obj);
							}
						});


					});
				}
				data['variedades']=$scope.todasVariedadesPlanejamento;

			}
			$scope.gridOptionsVariedades.data = $scope.todasVariedadesPlanejamento;
		};

		$scope.chamaExcluirPlanejamento= function(data){
			$('#modalDeletePlanejamento').modal('show');
			return true;
		};

		$scope.excluirPlanejamento = function(){
			$('#modalDeletePlanejamento').modal('hide');
			if($scope.data!=null && $scope.data.key!=null && $scope.fazenda !=null && $scope.safra != null)
			{
				var refNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/safra/'+$scope.safra.key+'/quadra/'+$scope.data.key);

				refNovo.remove();

				Notify.successBottom('Quadra/região removida com sucesso desta safra!');

				var i = 0;
				var posicao_deletar;
				$scope.planejamentos.forEach(function(obj2) {
					if (obj2.key === $scope.data.key) {
						posicao_deletar = i;
					}
					i++;
				});
				if (posicao_deletar != null) {

					delete $scope.planejamentos[posicao_deletar];
				}		

				$scope.clearForm();
			}
		};

		$scope.cancelar= function(data){
			$scope.clearForm();
			$scope.edit = false;
			$scope.save = true;
			return true;
		};
		//############################################################################################################################
		//############################################################################################################################
		// VARIEDADE
		//############################################################################################################################

		$scope.salvarVariedade = function(){
			if ($scope.fazenda == null) return false;
			if ($scope.safra == null) return false;

			var fazendaTmp=$scope.fazenda ;
			var safraTmp=$scope.safra ;

			var frmVariedade={};
			

			if (validformPlanejamento($scope.formPlanejamento)) return false;

			var retorna=false;
			
			$scope.todasVariedadesPlanejamento.forEach(function(var_pla) {
				if (var_pla.key == $scope.formPlanejamento.variedade.key) {
					Notify.errorBottom('Variedade já está relacionada neste planejamento!');
					retorna=true;
				}
			});

			if(!retorna)
			{
				if($scope.formPlanejamento.area!=null)
				{
					frmVariedade['area']=$scope.formPlanejamento.area;				
					$scope.formPlanejamento.variedade['area']=$scope.formPlanejamento.area;
					$scope.soma_area = $scope.soma_area + $scope.formPlanejamento.area;
				}

				var refVariedadeNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/safra/' + $scope.safra.key + '/quadra/'+$scope.data.key+'/variedades/'+$scope.formPlanejamento.variedade.key);

				frmVariedade['key_variedade']=$scope.formPlanejamento.variedade.key;
				frmVariedade['key_safra']=$scope.safra.key;
				frmVariedade['key_quadra']=$scope.data.key;

				refVariedadeNovo.set(frmVariedade);

				$scope.todasVariedadesPlanejamento.push($scope.formPlanejamento.variedade);


				var refVariedade= new Firebase(Constant.Url + '/variedade/' + $scope.fazenda.key + '/' + $scope.formPlanejamento.variedade.key_cultura + '/' + $scope.formPlanejamento.variedade.key+  '/quadras/' + $scope.safra.key + '/' + $scope.data.key);

				refVariedade.set(true);
				$scope.clearFormVariedade();


				Notify.successBottom('Variedade adicionada com sucesso!');
			}
		};

		$scope.atualizarVariedade = function(){
			if ($scope.fazenda == null) return false;
			if ($scope.safra == null) return false;

			var fazendaTmp=$scope.fazenda ;
			var safraTmp=$scope.safra ;

			var frmVariedade={};


			if (validformPlanejamento($scope.formPlanejamento)) return false;

			if($scope.formPlanejamento.area!=null)
			{
				frmVariedade['area']=$scope.formPlanejamento.area;				
				$scope.formPlanejamento.variedade['area']=$scope.formPlanejamento.area;
				$scope.soma_area = $scope.soma_area + $scope.formPlanejamento.area;
			}

			var refVariedadeNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/safra/' + $scope.safra.key + '/quadra/'+$scope.data.key+'/variedades/'+$scope.formPlanejamento.variedade.key);

			frmVariedade['key_variedade']=$scope.formPlanejamento.variedade.key;
			frmVariedade['key_safra']=$scope.safra.key;
			frmVariedade['key_quadra']=$scope.data.key;

			refVariedadeNovo.set(frmVariedade);


			var posicao = null;
			var x=0;
			$scope.todasVariedadesPlanejamento.forEach(function(obj2) {
				if (obj2.key_variedade!=null && obj2.key_variedade == objNovo.key) {
					posicao = x;
				}
				x++;
			});
			if (posicao == null) {
				$scope.todasVariedadesPlanejamento[posicao] = $scope.formPlanejamento.variedade;				
			}


			var refVariedade= new Firebase(Constant.Url + '/variedade/' + $scope.fazenda.key + '/' + $scope.formPlanejamento.variedade.key_cultura + '/' + $scope.formPlanejamento.variedade.key+  '/quadras/' + $scope.safra.key + '/' + $scope.data.key);

			refVariedade.set(true);
			$scope.clearFormVariedade();


			Notify.successBottom('Variedade atualizada com sucesso!');
		};

		$scope.ChamarEditarVariedade = function(data){
			$scope.formPlanejamento.variedade=data;
			$scope.formPlanejamento.area=data.area;
			$scope.edit_variedade=true;
		}

		$scope.cancelarVariedade= function(){			
			$scope.clearFormVariedade();
			return true;
		};

		$scope.questionaExcluirVariedade = function() {
			if ($scope.formPlanejamento.variedade != null) {
				$('#modalDeleteVariedade').modal('show');
			} 
		};

		$scope.excluirVariedade = function() {
			$('#modalDeleteVariedade').modal('hide');

			if ($scope.fazenda == null) return false;
			if ($scope.safra == null) return false;

			var fazendaTmp=$scope.fazenda ;
			var safraTmp=$scope.safra ;			

			if (validformPlanejamento($scope.formPlanejamento)) return false;

			if($scope.formPlanejamento.area!=null)
			{
				$scope.soma_area = $scope.soma_area - $scope.formPlanejamento.area;
			}

			var refVariedadeNovo2 = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/safra/' + $scope.safra.key + '/quadra/'+$scope.data.key+'/variedades/'+$scope.formPlanejamento.variedade.key);
			refVariedadeNovo2.remove();
			Notify.successBottom('Variedade removida com sucesso!');

			var refVariedade= new Firebase(Constant.Url + '/variedade/' + $scope.fazenda.key + '/' + $scope.formPlanejamento.variedade.key_cultura + '/' + $scope.formPlanejamento.variedade.key+  '/quadras/' + $scope.safra.key + '/' + $scope.data.key);
			refVariedade.remove();

			var i = 0;
			var posicao_deletar;
			$scope.todasVariedadesPlanejamento.forEach(function(obj2) {
				if (obj2.key === $scope.formPlanejamento.variedade.key) {
					posicao_deletar = i;
				}
				i++;
			});
			if (posicao_deletar != null) {

				delete $scope.todasVariedadesPlanejamento[posicao_deletar];
			}			
			$scope.clearFormVariedade();
			return true;
		};

		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA X SAFRA X QUADRA X CULTURA
		//############################################################################################################################



		

		
		//-------------------------------------------------------------------



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
				if(item.key === quadraId) retorno = item.nome;
			});
			return retorno;
		};

		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		function validForm(data){
			if($scope.fazenda == null){
				Notify.errorBottom('O campo fazenda é inválido!');
				return true;
			}
			if($scope.safra == null){
				Notify.errorBottom('O campo safra é inválido!');
				return true;
			}
			if(data.key ==null || data.key == ''){
				Notify.errorBottom('O campo quadra/região é inválido!');
				return true;
			}

			if(data.key_cultura == ''){
				Notify.errorBottom('O campo cultura é inválido!');
				return true;
			}
			
			if(data.area != null){
				if(data.area<0 || data.area==0){
					Notify.errorBottom('A área da quadra/região deve ser maior que zero!');
					return true;
				}
			}
			
			return false;
		};

		function validformPlanejamento(formPlanejamento){
			
			if($scope.data.key==null || $scope.data.key=='')
			{
				Notify.errorBottom('É preciso o planejamento estar salvo!');
				return true;
			} 

			if(formPlanejamento.variedade == null){
				Notify.errorBottom('O campo Variedade é inválido!');
				return true;
			}	

			$scope.soma_area=0;
			$scope.todasVariedadesPlanejamento.forEach(function(var_pla) {
				if (var_pla.key != formPlanejamento.variedade.key) {
					if(var_pla.area!=null)
					{
						$scope.soma_area = $scope.soma_area + var_pla.area;
					}
				}
			});

			if(formPlanejamento.area != null){
				if(($scope.soma_area +formPlanejamento.area)  > $scope.data.area){
					Notify.errorBottom('A soma das áreas das variedades ficará maior que a área da quadra/região!');
					return true;
				}
			}
			return false;
		};
		
		$scope.clearForm = function(){
			$scope.data=null;
			$scope.todasVariedadesPlanejamento=[];
			$scope.gridOptionsVariedades.data = $scope.todasVariedadesPlanejamento;
			return true;
		};

		$scope.clearFormVariedade= function(){
			$scope.formPlanejamento.variedade=null;
			$scope.formPlanejamento.area= '';
			$scope.edit_variedade=false;
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
/*
		$scope.$watch('quadra', function(newValue, oldValue){
			if(_salvarQuadra){
				$scope.addHistorico(newValue[newValue.length - 1].key, newValue[newValue.length - 1].key_cultura, 'Adicionou');
				_salvarQuadra = false;
			}
		});
		*/
	}

}());