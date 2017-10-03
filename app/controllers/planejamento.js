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
		
		$scope.fazendaSelecioanda;

		$scope.fazendas=[];
		$scope.qtde_fazendas = 0 ; 
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

		//atualizaListaFiliais();
		//recuperaCultura();

		
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
			{ field: "variedade.nome", displayName: "Variedade", width: 150 },
			{ field: "area", displayName: "Área", width: 100 },		
			{ field: "dias", displayName: "Dias", width: 100 },	
			{ field: "pn", displayName: "PN", width: 80 },	
			{ field: "pms", displayName: "PMS", width: 120 },	
			{ field: "perger", displayName: "% Germ.", width: 120 },	
			{ field: "pitm", displayName: "Pits/m", width: 120 },	
			{ field: "stem", displayName: "Stes/m", width: 120 },	
			{ field: "kgha", displayName: "KG/ha", width: 120 },	
			{ field: "qtdekg", displayName: "Qtde KG", width: 120 },	
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

			var i=0;
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
						$scope.qtde_fazendas ++;
						var obj = snap.val();
						$scope.fazendas.push(obj.filial);


						if(i==0)
						{
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

						}
						
						if (!$scope.$$phase) {
							$scope.$apply();
						}
						i++;
					});

			}); // final do load
		}		
		$scope.chengeFazenda = function(fazenda){
			if (fazenda === null) return false;
			$scope.planejamentos=[];
			$scope.clearForm();
			$scope.edit = false;
			$scope.save = true;
			$scope.gridOptions.data = $scope.planejamentos;
			$scope.fazendaSelecioanda = fazenda;
			$scope.safra = {};
			$scope.safras = [];
			for (var propertyName in fazenda.safra) {
				$scope.safras.push(fazenda.safra[propertyName]);
			}
			if(verificaFinalizacaoCarregamento())
			{			
				$scope.chengeSafra($scope.safras[0]);
				$scope.safra=$scope.safras[0];
			}
		};
		//-------------------------------------------------------------------
		$scope.chengeSafra = function(safra){
			


			$scope.clearForm();
			$scope.edit = false;
			$scope.save = true;
			$scope.planejamentos=[];
			$scope.gridOptions.data = $scope.planejamentos;

			if ($scope.fazendaSelecioanda === null || safra==null) return false;

			var refSafraXquadra = new Firebase(Constant.Url + '/filial/' + $scope.fazendaSelecioanda.key + '/safra/' + safra.key+'/quadra');
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
					$scope.fazendaSelecioanda.todasQuadras.forEach(function(obj2) {
						if (obj2.key!=null && objNovo.key == obj2.key) {
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
				fazenda.filial['todasQuadras']=[];

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
						fazenda.filial.todasQuadras.push(objNovo['Quadras']);
						if (!$scope.$$phase) {
							$scope.$apply();
						}
						if(fazenda.filial.key==$scope.fazendas[0].key)
						{
							if(verificaFinalizacaoCarregamento())
							{
								$scope.chengeFazenda($scope.fazendas[0]);
								$scope.fazenda=$scope.fazendas[0];
								$('#myPleaseWait').modal('hide');
							}
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
				recuperaCultura();

			});
		}
		//-------------------------------------------------------------------
		function recuperaCultura() {

			var baseRef = new Firebase(Constant.Url+'/cultura');

			var i=0;
			baseRef.on('child_added', function(snapshot) {
				console.log(i);
				var objNovo = snapshot.val();
				$scope.todasCulturas.push(objNovo);
				
				if(verificaFinalizacaoCultura())
				{
					atualizaListaFiliais();
				}

			}, function(error) {
				console.error(error);
			});
		}
		
		function verificaFinalizacaoCultura()
		{		

			if($scope.todasCulturas.length==$scope.qtde_culturas
				)
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		function verificaFinalizacaoCarregamento()
		{
			console.log(' --------------------- ');

			console.log('todasQuadras: ' + $scope.todasQuadras.length + ' - qde: ' + $scope.qtde_quadras);
			console.log('todasCulturas: ' + $scope.todasCulturas.length + ' - qde: ' + $scope.qtde_culturas);
			console.log('todasVariedades: ' + $scope.todasVariedades.length + ' - qde: ' + $scope.qtde_variedades);
			console.log('fazendas: ' + $scope.fazendas.length + ' - qde: ' + $scope.qtde_fazendas);

			console.log(' --------------------- ');

			if($scope.todasQuadras.length==$scope.qtde_quadras
				&& $scope.todasCulturas.length==$scope.qtde_culturas
				&& $scope.todasVariedades.length>=$scope.qtde_variedades
				&& $scope.fazendas.length == $scope.qtde_fazendas
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

		$scope.salvarPlanejamento = function(novo){
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
				if( $scope.data.area!=null)
				{
					mPlanejamento['area'] = $scope.data.area;
				}
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

				if(!novo)
				{
					$scope.edit = true;
					$scope.save=false;
				}
				else
				{
					$scope.clearForm();
					$scope.edit = false;
					$scope.save=true;
				}
			}
		};

		$scope.atualizarPlanejamento = function(){

			if(validForm($scope.data)) return true;

			var refNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/safra/'+$scope.safra.key+'/quadra/'+$scope.data.key);

			var mPlanejamento = {};
			mPlanejamento['key'] = $scope.data.key;
			mPlanejamento['key_cultura'] = $scope.data.key_cultura;
			if($scope.data.area!=null)
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

			if($scope.todasVariedadesPlanejamento!=null)
			{
				if(!Array.isArray($scope.todasVariedadesPlanejamento))
				{
					mPlanejamento['variedades']=$scope.todasVariedadesPlanejamento;
				}
				else
				{
					var list_var=[];
					$scope.todasVariedadesPlanejamento.forEach(function(var_pla) 
					{
						list_var[var_pla.key]=[];
						list_var[var_pla.key]['key_variedade']=var_pla.key;
						if(var_pla.area!=null)
						{
							list_var[var_pla.key]['area']=var_pla.area;
						}


						list_var[var_pla.key]['key_variedade']=var_pla.variedade.key;
						list_var[var_pla.key]['key_safra']=$scope.safra.key;
						list_var[var_pla.key]['key_quadra']=$scope.data.key;
						list_var[var_pla.key]['key']=var_pla.variedade.key;

						if(var_pla.dias!=null)
						{
							list_var[var_pla.key]['dias']=var_pla.dias;
						}
						if(var_pla.pn!=null)
						{
							list_var[var_pla.key]['pn']=var_pla.pn;
						}
						if(var_pla.pms!=null)
						{
							list_var[var_pla.key]['pms']=var_pla.pms;
						}
						if(var_pla.perger!=null)
						{
							list_var[var_pla.key]['perger']=var_pla.perger;
						}
						if(var_pla.pitm!=null)
						{
							list_var[var_pla.key]['pitm']=var_pla.pitm;
						}
						if(var_pla.stem!=null)
						{
							list_var[var_pla.key]['stem']=var_pla.stem;
						}
						if(var_pla.kgha!=null)
						{
							list_var[var_pla.key]['kgha']=var_pla.kgha;
						}
						if(var_pla.qtdekg!=null)
						{
							list_var[var_pla.key]['qtdekg']=var_pla.qtdekg;
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
								var obj={};
								obj['key']=objVar;
								obj['variedade']=variedade;
								if(data.variedades[objVar].area!=null)
								{
									obj['area']=data.variedades[objVar].area;
									$scope.soma_area = $scope.soma_area + data.variedades[objVar].area;
								}

								if(data.variedades[objVar].dias!=null)
								{
									obj['dias']=data.variedades[objVar].dias;
								}
								if(data.variedades[objVar].pn!=null)
								{
									obj['pn']=data.variedades[objVar].pn;
								}
								if(data.variedades[objVar].pms!=null)
								{
									obj['pms']=data.variedades[objVar].pms;
								}
								if(data.variedades[objVar].perger!=null)
								{
									obj['perger']=data.variedades[objVar].perger;
								}
								if(data.variedades[objVar].pitm!=null)
								{
									obj['pitm']=data.variedades[objVar].pitm;
								}
								if(data.variedades[objVar].stem!=null)
								{
									obj['stem']=data.variedades[objVar].stem;
								}
								if(data.variedades[objVar].kgha!=null)
								{
									obj['kgha']=data.variedades[objVar].kgha;
								}
								if(data.variedades[objVar].qtdekg!=null)
								{
									obj['qtdekg']=data.variedades[objVar].qtdekg;
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
								var obj={};
								obj['key']=var_pla.key;
								obj['variedade']=variedade;
								if(var_pla.area!=null)
								{
									obj['area']=var_pla.area;
									$scope.soma_area = $scope.soma_area + var_pla.area;
								}

								if(var_pla.dias!=null)
								{
									obj['dias']=var_pla.dias;
								}
								if(var_pla.pn!=null)
								{
									obj['pn']=var_pla.pn;
								}
								if(var_pla.pms!=null)
								{
									obj['pms']=var_pla.pms;
								}
								if(var_pla.perger!=null)
								{
									obj['perger']=var_pla.perger;
								}
								if(var_pla.pitm!=null)
								{
									obj['pitm']=var_pla.pitm;
								}
								if(var_pla.stem!=null)
								{
									obj['stem']=var_pla.stem;
								}
								if(var_pla.kgha!=null)
								{
									obj['kgha']=var_pla.kgha;
								}
								if(var_pla.qtdekg!=null)
								{
									obj['qtdekg']=var_pla.qtdekg;
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
				$scope.edit = false;
				$scope.save=true;
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
			
			$scope.editCultura=true;

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
				frmVariedade['key']=$scope.formPlanejamento.variedade.key;
				if($scope.formPlanejamento.dias!=null)
				{
					frmVariedade['dias']=$scope.formPlanejamento.dias;
				}
				if($scope.formPlanejamento.pn!=null)
				{
					frmVariedade['pn']=$scope.formPlanejamento.pn;
				}
				if($scope.formPlanejamento.pms!=null)
				{
					frmVariedade['pms']=$scope.formPlanejamento.pms;
				}
				if($scope.formPlanejamento.perger!=null)
				{
					frmVariedade['perger']=$scope.formPlanejamento.perger;
				}
				if($scope.formPlanejamento.pitm!=null)
				{
					frmVariedade['pitm']=$scope.formPlanejamento.pitm;
				}
				if($scope.formPlanejamento.stem!=null)
				{
					frmVariedade['stem']=$scope.formPlanejamento.stem;
				}
				if($scope.formPlanejamento.kgha!=null)
				{
					frmVariedade['kgha']=$scope.formPlanejamento.kgha;
				}
				if($scope.formPlanejamento.qtdekg!=null)
				{
					frmVariedade['qtdekg']=$scope.formPlanejamento.qtdekg;
				}

				refVariedadeNovo.set(frmVariedade);

				frmVariedade['variedade']=$scope.formPlanejamento.variedade;

				$scope.todasVariedadesPlanejamento.push(frmVariedade);


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
			frmVariedade['key']=$scope.formPlanejamento.variedade.key;
			if($scope.formPlanejamento.dias!=null)
			{
				frmVariedade['dias']=$scope.formPlanejamento.dias;
			}
			if($scope.formPlanejamento.pn!=null)
			{
				frmVariedade['pn']=$scope.formPlanejamento.pn;
			}
			if($scope.formPlanejamento.pms!=null)
			{
				frmVariedade['pms']=$scope.formPlanejamento.pms;
			}
			if($scope.formPlanejamento.perger!=null)
			{
				frmVariedade['perger']=$scope.formPlanejamento.perger;
			}
			if($scope.formPlanejamento.pitm!=null)
			{
				frmVariedade['pitm']=$scope.formPlanejamento.pitm;
			}
			if($scope.formPlanejamento.stem!=null)
			{
				frmVariedade['stem']=$scope.formPlanejamento.stem;
			}
			if($scope.formPlanejamento.kgha!=null)
			{
				frmVariedade['kgha']=$scope.formPlanejamento.kgha;
			}
			if($scope.formPlanejamento.qtdekg!=null)
			{
				frmVariedade['qtdekg']=$scope.formPlanejamento.qtdekg;
			}

			refVariedadeNovo.set(frmVariedade);

			frmVariedade['variedade']=$scope.formPlanejamento.variedade;

			var posicao = null;
			var x=0;
			$scope.todasVariedadesPlanejamento.forEach(function(obj2) {
				if (obj2.key!=null && obj2.key == frmVariedade.key) {
					posicao = $scope.todasVariedadesPlanejamento.indexOf(obj2);
				}
				x++;
			});
			if (posicao != null) {
				$scope.todasVariedadesPlanejamento[posicao] = frmVariedade;				
			}


			var refVariedade= new Firebase(Constant.Url + '/variedade/' + $scope.fazenda.key + '/' + $scope.formPlanejamento.variedade.key_cultura + '/' + $scope.formPlanejamento.variedade.key+  '/quadras/' + $scope.safra.key + '/' + $scope.data.key);

			refVariedade.set(true);
			$scope.clearFormVariedade();


			Notify.successBottom('Variedade atualizada com sucesso!');
		};

		$scope.ChamarEditarVariedade = function(data){
			$scope.formPlanejamento=clone(data);
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
			var posicao;
			$scope.todasVariedadesPlanejamento.forEach(function(obj2) {
				if (obj2.key == $scope.formPlanejamento.variedade.key) {
					posicao = $scope.todasVariedadesPlanejamento.indexOf(obj2);
				}
				i++;
			});
			if (posicao != null) {

				delete $scope.todasVariedadesPlanejamento[posicao];
			}			
			if($scope.todasVariedadesPlanejamento.length==0 || $scope.todasVariedadesPlanejamento.count==0)
			{
				var refSepara = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/safra/' + $scope.safra.key + '/quadra/'+$scope.data.key+'/separar_variedade/');
				refSepara.set(false);
				$scope.data.separar_variedade=false;
			}
			$scope.clearFormVariedade();
			return true;
		};

		$scope.chengeQtdeKg = function(){
			if($scope.formPlanejamento.area!=null && $scope.formPlanejamento.kgha!=null)
			{
				$scope.formPlanejamento.qtdekg = $scope.formPlanejamento.area * $scope.formPlanejamento.kgha;
			}
			else
			{
				$scope.formPlanejamento.qtdekg = null;
			}
		}

		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA X SAFRA X QUADRA X CULTURA
		//############################################################################################################################


		//-------------------------------------------------------------------

		$scope.chengeCultura = function(key_cultura){
			if(key_cultura === null) return false;
			$scope.variedadesAdd=[];
			for (var i = 0; i < $scope.todasVariedades.length; i++)
			{						
				for(var obj in $scope.todasVariedades[i])
				{	
					if($scope.todasVariedades[i][obj].key_cultura==key_cultura)
					{
						$scope.variedadesAdd.push($scope.todasVariedades[i][obj]);					
					}
				}
			}
		};


		$scope.chengeVariedade = function(){
			if($scope.formPlanejamento.variedade == null || $scope.formPlanejamento.variedade.dias==null) return false;
			$scope.formPlanejamento.dias=$scope.formPlanejamento.variedade.dias;
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
			$scope.data ={};
			$scope.data['ativo']=true;

			$scope.todasVariedadesPlanejamento=[];
			$scope.gridOptionsVariedades.data = $scope.todasVariedadesPlanejamento;
			return true;
		};



		$scope.clearFormVariedade= function(){
			$scope.formPlanejamento.variedade=null;
			$scope.formPlanejamento.area= '';
			$scope.formPlanejamento.dias= '';
			$scope.formPlanejamento.pn= '';
			$scope.formPlanejamento.pms= '';
			$scope.formPlanejamento.perger= '';
			$scope.formPlanejamento.pitm= '';
			$scope.formPlanejamento.stem= '';
			$scope.formPlanejamento.kgha= '';
			$scope.formPlanejamento.qtdekg= '';
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