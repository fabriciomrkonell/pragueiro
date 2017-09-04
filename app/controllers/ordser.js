(function() {

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('ordserCtrl', ordserCtrl);

	ordserCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function ordserCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			save: true,

			editarcodigo: true,
			temquadras: false,
			temprodutos: false,
			temequipamentos: false,
			temexecucoes: false,
			finalizado:false,
			desabilitaQuadras: true,
			desabilitaFazenda: false,
			fazendas: [],
			safras: [],
			ordsers: [],
			ordserFilial: [],
			data: {
				datpre: '',
				obs: '',
				codigo: '',
				key_tipati: '',
				key_equipe: '',
				key: ''
			}
		});

		$scope.situacoes = ['Aberto', 'Iniciado', 'Finalizado'];
		$scope.exibeImplemento = false;
		$scope.numeracao_codigo = 1;
		$scope.area_total = 0;
		$scope.horas_total = 0;
		$scope.area_total_executada = 0;
		$scope.per_total_executada = 0;

		$scope.qtde_tipatis  = 0;
		$scope.qtde_equipes = 0;
		$scope.qtde_equipamentos = 0;
		$scope.qtde_quadras = 0;
		$scope.qtde_produtos = 0;
		$scope.qtde_funcionarios  = 0;
		$scope.qtde_variedades = 0;

		$scope.todasTipatis = [];
		$scope.todasEquipes  = [];
		$scope.todasQuadras  = [];
		$scope.todosProdutos  = [];
		$scope.todosEquipamentos  = [];
		$scope.todosFuncionarios  = [];
		$scope.todasVariedades = [];

		$scope.variedadesTmp = [];

		$scope.activetab = 'dashboard';
		var ref = new Firebase(Constant.Url + '/filial');
		var refOrdser = null;
		atualizaListaFiliais();
		var fazendaSelecioanda;

//############################################################################################################################
// GRID ORDSER
//############################################################################################################################

$scope.gridOptions = {
	enableRowSelection: true,
	enableRowHeaderSelection: false,

	enableColumnResizing: true,

	multiSelect: false,
	modifierKeysToMultiSelect: false,

	columnDefs: [
	{
		field: "codigo",
		displayName: "Código",
		width: 80
	}, 
	{
		field: "datpre",
		displayName: "Dat. Prev.",
		type: 'date',
		cellFilter: 'date:"dd/MM/yyyy"',
		width: 120
	}, 
	{
		field: "situacao",
		displayName: "Situação",
		width: 108
	}, 
	{
		field: "per_total_executada" ,
		displayName: "% Exec.",
		width: 90
	}, 
	{
		field: "tipati.nome",
		displayName: "Tipo Ord. Ser.",
		width: 130
	}, 
	{
		field: "quadras",
		displayName: "Quadra",
		width: 130,

		cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>"
	},
	{
		field: "equipe.nome",
		displayName: "Equipe",
		width: 130
	}, 
	{
		field: "safra.nome",
		displayName: "Safra",
		width: 130
	},

	],
	appScopeProvider: {
		mapValue: function(row) {
			var retorno='';
			for (var propertyName in row.entity.quadras) {
				$scope.todasQuadras.forEach(function(obj2) {
					if (row.entity.quadras[propertyName].key_quadra === obj2.key) {
						retorno+=obj2.nome + ', ';
					}
				});
			}
			return retorno.substring(0, retorno.length-2);
		}
	}
};

$scope.toggleMultiSelect = function() {
	$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
};


$scope.gridOptions.onRegisterApi = function(gridApi) {
	$scope.gridApi = gridApi;
	gridApi.selection.on.rowSelectionChanged($scope, function(row) {
		$scope.chamaEditarOrdser(row.entity);
	});
};

//############################################################################################################################
// GRID QUADRAS
//############################################################################################################################
$scope.todasQuadrasOrdser = [];

$scope.gridOptionsQuadras = {
	enableRowSelection: true,
	enableRowHeaderSelection: false,

	enableColumnResizing: true,

	multiSelect: false,
	modifierKeysToMultiSelect: false,

	columnDefs: [
	{
		field: "codigo",
		displayName: "Código",
		width: 100
	}, 
	{
		field: "nome",
		displayName: "Nome",
		width: 300
	}, 
	{
		field: "variedade.nome",
		displayName: "Variedade",
		width: 200
	}, 
	{
		field: "area",
		displayName: "Area",
		width: 300,
		cellFilter: 'number: 2'
	}, 
	{
		name: 'Retirar',
		enableColumnMenu: false,
		width: 70,
		cellTemplate: '<div class="cell_personalizada_excluir"><button class="btn btn-danger btn-xs" ng-click="grid.appScope.questionaExcluirQuadra(row)"><i class="glyphicon glyphicon-remove"></i>	</button></div>'
	}]
};

//############################################################################################################################
// GRID EQUIPAMENTOS
//############################################################################################################################
$scope.todosEquipamentosOrdser = [];

$scope.gridOptionsEquipamentos = {
	enableRowSelection: true,
	enableRowHeaderSelection: false,

	enableColumnResizing: true,

	multiSelect: false,
	modifierKeysToMultiSelect: false,

	columnDefs: [
	{
		field: "codigo",
		displayName: "Código",
		width: 100
	},
	{
		field: "nome",
		displayName: "Nome",
		width: 300
	}, 
	{
		field: "consumo",
		displayName: "Consumo",
		width: 300
	}, 
	{
		name: 'Retirar',
		enableColumnMenu: false,
		width: 70,
		cellTemplate: '<div class="cell_personalizada_excluir"><button class="btn btn-danger btn-xs" ng-click="grid.appScope.questionaExcluirEquipamento(row)"><i class="glyphicon glyphicon-remove"></i>	</button></div>'
	}
	]
};

//############################################################################################################################
// GRID PRODUTOS
//############################################################################################################################
$scope.todosProdutosOrdser = [];

$scope.gridOptionsProdutos = {
	enableRowSelection: true,
	enableRowHeaderSelection: false,

	enableColumnResizing: true,

	multiSelect: false,
	modifierKeysToMultiSelect: false,

	columnDefs: [
	{
		field: "codigo",
		displayName: "Código",
		width: 100
	}, 
	{
		field: "nome",
		displayName: "Nome",
		width: 300
	}, 
	{
		field: "dose",
		displayName: "Dose",
		width: 300
	}, 
	{
		field: "quatot",
		displayName: "Qtde Total",
		width: 300,
		cellFilter: 'number: 2'
	}, 
	{
		name: 'Retirar',
		enableColumnMenu: false,
		width: 70,
		cellTemplate: '<div class="cell_personalizada_excluir"><button class="btn btn-danger btn-xs" ng-click="grid.appScope.questionaExcluirProduto(row)"><i class="glyphicon glyphicon-remove"></i>	</button></div>'
	}]
};

//############################################################################################################################
// GRID EXECUCAO
//############################################################################################################################
$scope.todosExecucoesOrdser = [];

$scope.gridOptionsExecucoes = {
	enableRowSelection: true,
	enableRowHeaderSelection: false,

	enableColumnResizing: true,

	multiSelect: false,
	modifierKeysToMultiSelect: false,

	columnDefs: [
	{
		field: "data",
		displayName: "Data",
		type: 'date',
		cellFilter: 'date:"dd/MM/yyyy"',
		width: 130
	}, 
	{
		field: "equipamento.nome",
		displayName: "Equipamento",
		width: 120
	}, 
	{
		field: "implemento.nome",
		displayName: "Implemento",
		width: 120
	}, 
	{
		field: "funcionario.nome",
		displayName: "Operador",
		width: 120
	}, 
	{
		field: "quahor",
		displayName: "Qtde Horas",
		width: 120,
		cellFilter: 'number: 2'
	}, 
	{
		field: "quadra.nome",
		displayName: "Quadra",
		width: 120
	}, 	
	{
		field: "variedade.nome",
		displayName: "Variedade",
		width: 120
	}, 
	{
		field: "area",
		displayName: "Area",
		width: 120,
		cellFilter: 'number: 2'
	}, 
	{
		name: 'Retirar',
		enableColumnMenu: false,
		width: 70,
		cellTemplate: '<div class="cell_personalizada_excluir"><button class="btn btn-danger btn-xs" ng-click="grid.appScope.questionaExcluirExecucao(row)"><i class="glyphicon glyphicon-remove"></i>	</button></div>'
	}]
};

//############################################################################################################################
//############################################################################################################################
// FAZENDA/FILIAL
//############################################################################################################################
//-------------------------------------------------------------------
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

					//console.log('Adicionou filial', snap.name(), snap.val());
					var obj = snap.val();
					$scope.fazendas.push(obj.filial);

					if(obj.filial.tipati!=null)
					{
						$scope.qtde_tipatis=+ Object.keys(obj.filial.tipati).length;
					}
					else
					{
						$scope.qtde_tipatis=+ 0;
					}
					if(obj.filial.equipe!=null)
					{
						$scope.qtde_equipes =+ Object.keys(obj.filial.equipe).length;
					}
					else
					{
						$scope.qtde_equipes =+ 0;
					}
					if(obj.filial.quadra!=null)
					{
						$scope.qtde_quadras =+ Object.keys(obj.filial.quadra).length;
					}
					else
					{
						$scope.qtde_quadras =+ 0;
					}
					if(obj.filial.produto!=null)
					{
						$scope.qtde_produtos =+ Object.keys(obj.filial.produto).length;
					}
					else
					{
						$scope.qtde_produtos =+ 0;
					}
					if(obj.filial.equipamento!=null)
					{
						$scope.qtde_equipamentos =+ Object.keys(obj.filial.equipamento).length;
					}
					else
					{
						$scope.qtde_equipamentos =+ 0;
					}
					if(obj.filial.funcionario!=null)
					{
						$scope.qtde_funcionarios  =+ Object.keys(obj.filial.funcionario).length;
					}
					else
					{
						$scope.qtde_funcionarios  =+ 0;
					}
					if(obj.filial.variedade!=null)
					{
						$scope.qtde_variedades  =+ Object.keys(obj.filial.variedade).length;
					}
					else
					{
						$scope.qtde_variedades  =+ 0;
					}

					recuperaTipati(obj);
					recuperaEquipe(obj);
					recuperaQuadra(obj);
					recuperaEquipamento(obj);
					recuperaFuncionario(obj);
					recuperaProduto(obj);
					recuperaVariedade(obj);

					

					if (!$scope.$$phase) {
						$scope.$apply();
					}
				});

			refNovo.on('child_changed', function(snap) {
				var objNovo = snap.val();

				var x = 0;
				var posicao = null;
				$scope.fazendas.forEach(function(obj) {
					if (obj.key === objNovo.filial.key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					$scope.fazendas[posicao] = objNovo.filial;

			});

			refNovo.on('child_removed', function(snap) {
					//console.log('Houve uma remoção', snap.name(), snap.val());
					atualizaListaFiliais();
				});
			if ($scope.fazendas.length == 0) {
				//$('#myPleaseWait').modal('hide');
			}
			}); // final do load
}
//-------------------------------------------------------------------
function listenerCodigo(fazenda) {
	if (fazenda === null || fazenda === null) {
		$scope.numeracao_codigo = 1;
	} else {
		$scope.numeracao_codigo = 1;
		var refOrdser = new Firebase(Constant.Url + '/ordser/' + fazenda.key);

		refOrdser.on('child_added', function(snap) {
			$scope.numeracao_codigo++;
			if ($scope.data.key == null || $scope.data.key == '') {
				$scope.data.codigo = zeroFill($scope.numeracao_codigo, 5);
			}
		});

		refOrdser.on('child_removed', function(snap) {
			$scope.numeracao_codigo--;
			if ($scope.data.key == null || $scope.data.key == '') {
				$scope.data.codigo = zeroFill($scope.numeracao_codigo, 5);
			}
		});
	}
}
//-------------------------------------------------------------------
function recuperaTipati(fazenda) {
	if (fazenda === null) {
		$scope.todasTipatis = null;
	} else {

		$scope.todasTipatis = [];
		
		var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
		var refTipatiNovo = new Firebase.util.NormalizedCollection(
			baseRef.child("/filial/" + fazenda.key + "/tipati"), [baseRef.child("/tipati"), "$key"]
			).select({
				"key": "tipati.$value",
				"alias": "filial"
			}, {
				"key": "$key.$value",
				"alias": "tipatis"
			}).ref();

			refTipatiNovo.on('child_added', function(snap) {
				//$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				$scope.todasTipatis.push(objNovo['tipatis']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}

				if(verificaFinalizacaoCarregamento())
				{
					$scope.chengeFazenda($scope.fazendas[0]);
					$scope.data.fazenda=$scope.fazendas[0];
					$('#myPleaseWait').modal('hide');
				}
			});

			refTipatiNovo.on('child_changed', function(snap) {
				$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.todasTipatis.forEach(function(obj) {
					if (obj.key === objNovo['tipatis'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					$scope.todasTipatis[posicao] = objNovo['tipatis'];

				if (!$scope.$$phase) {
					$scope.$apply();
				}



			});

			refTipatiNovo.on('child_removed', function(snap) {
				var x = 0;
				var posicao = null;
				$scope.todasTipatis.forEach(function(obj) {
					if (obj.key === objNovo['tipatis'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					delete $scope.todasTipatis[posicao];

			});



		}
	}
//-------------------------------------------------------------------
function recuperaEquipe(fazenda) {
	if (fazenda === null) {
		$scope.todasEquipes = null;
	} else {

		$scope.todasEquipes = [];

		var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
		var refNovoQuadra = new Firebase.util.NormalizedCollection(
			baseRef.child("/filial/" + fazenda.key + "/equipe"), [baseRef.child("/equipe"), "$key"]
			).select({
				"key": "equipe.$value",
				"alias": "filial"
			}, {
				"key": "$key.$value",
				"alias": "equipes"
			}).ref();

			refNovoQuadra.on('child_added', function(snap) {
				//$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				$scope.todasEquipes.push(objNovo['equipes']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if(verificaFinalizacaoCarregamento())
				{
					$scope.chengeFazenda($scope.fazendas[0]);
					$scope.data.fazenda=$scope.fazendas[0];
					$('#myPleaseWait').modal('hide');
				}
			});

			refNovoQuadra.on('child_changed', function(snap) {
				$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.todasEquipes.forEach(function(obj) {
					if (obj.key === objNovo['equipes'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					$scope.todasEquipes[posicao] = objNovo['equipes'];

				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

			refNovoQuadra.on('child_removed', function(snap) {
				var x = 0;
				var posicao = null;
				$scope.todasEquipes.forEach(function(obj) {
					if (obj.key === objNovo['equipes'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					delete $scope.todasEquipes[posicao];
			});



		}
	}
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
				//$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				$scope.todasQuadras.push(objNovo['Quadras']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if(verificaFinalizacaoCarregamento())
				{
					$scope.chengeFazenda($scope.fazendas[0]);
					$scope.data.fazenda=$scope.fazendas[0];
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
function recuperaProduto(fazenda) {
	if (fazenda === null) {
		$scope.todosProdutos = null;
	} else {

		$scope.todosProdutos = [];

		var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
		var refNovoProduto = new Firebase.util.NormalizedCollection(
			baseRef.child("/filial/" + fazenda.key + "/produto"), [baseRef.child("/produto"), "$key"]
			).select({
				"key": "produto.$value",
				"alias": "filial"
			}, {
				"key": "$key.$value",
				"alias": "Produtos"
			}).ref();

			refNovoProduto.on('child_added', function(snap) {
				//$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				$scope.todosProdutos.push(objNovo['Produtos']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if(verificaFinalizacaoCarregamento())
				{
					$scope.chengeFazenda($scope.fazendas[0]);
					$scope.data.fazenda=$scope.fazendas[0];
					$('#myPleaseWait').modal('hide');
				}
			});

			refNovoProduto.on('child_changed', function(snap) {
				$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.todosProdutos.forEach(function(obj) {
					if (obj.key === objNovo['Produtos'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					$scope.todosProdutos[posicao] = objNovo['Produtos'];

				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

			refNovoProduto.on('child_removed', function(snap) {
				var x = 0;
				var posicao = null;
				$scope.todosProdutos.forEach(function(obj) {
					if (obj.key === objNovo['Produtos'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					delete $scope.todosProdutos[posicao];
			});



		}
	}
//-------------------------------------------------------------------
function recuperaEquipamento(fazenda) {
	if (fazenda === null) {
		$scope.todosEquipamentos = null;
	} else {

		$scope.todosEquipamentos = [];
		$scope.todosEquipamentosNaoImplemento = [];
		$scope.todosEquipamentosImplemento = [];

		var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
		var refNovoEquipamento = new Firebase.util.NormalizedCollection(
			baseRef.child("/filial/" + fazenda.key + "/equipamento"), [baseRef.child("/equipamento"), "$key"]
			).select({
				"key": "equipamento.$value",
				"alias": "filial"
			}, {
				"key": "$key.$value",
				"alias": "Equipamentos"
			}).ref();

			refNovoEquipamento.on('child_added', function(snap) {
				//$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				$scope.todosEquipamentos.push(objNovo['Equipamentos']);
				if(objNovo.implemento!=null && objNovo.implemento)
				{
					$scope.todosEquipamentosImplemento.push(objNovo['Equipamentos']);
				}
				else
				{
					$scope.todosEquipamentosNaoImplemento.push(objNovo['Equipamentos']);
				}

				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if(verificaFinalizacaoCarregamento())
				{
					$scope.chengeFazenda($scope.fazendas[0]);
					$scope.data.fazenda=$scope.fazendas[0];
					$('#myPleaseWait').modal('hide');
				}
			});

			refNovoEquipamento.on('child_changed', function(snap) {
				$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.todosEquipamentos.forEach(function(obj) {
					if (obj.key === objNovo['Equipamentos'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					$scope.todosEquipamentos[posicao] = objNovo['Equipamentos'];

				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

			refNovoEquipamento.on('child_removed', function(snap) {
				var x = 0;
				var posicao = null;
				$scope.todosEquipamentos.forEach(function(obj) {
					if (obj.key === objNovo['Equipamentos'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					delete $scope.todosEquipamentos[posicao];
			});



		}
	}
//-------------------------------------------------------------------
function recuperaFuncionario(fazenda) {
	if (fazenda === null) {
		$scope.todosFuncionarios = null;
	} else {

		$scope.todosFuncionarios = [];

		var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
		var refNovoFuncionario = new Firebase.util.NormalizedCollection(
			baseRef.child("/filial/" + fazenda.key + "/funcionario"), [baseRef.child("/funcionario"), "$key"]
			).select({
				"key": "funcionario.$value",
				"alias": "filial"
			}, {
				"key": "$key.$value",
				"alias": "Funcionarios"
			}).ref();

			refNovoFuncionario.on('child_added', function(snap) {
				
				var objNovo = snap.val();
				$scope.todosFuncionarios.push(objNovo['Funcionarios']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if(verificaFinalizacaoCarregamento())
				{
					$scope.chengeFazenda($scope.fazendas[0]);
					$scope.data.fazenda=$scope.fazendas[0];
					$('#myPleaseWait').modal('hide');
				}
			});

			refNovoFuncionario.on('child_changed', function(snap) {
				$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.todosFuncionarios.forEach(function(obj) {
					if (obj.key === objNovo['Funcionarios'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					$scope.todosFuncionarios[posicao] = objNovo['Funcionarios'];

				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

			refNovoFuncionario.on('child_removed', function(snap) {
				var x = 0;
				var posicao = null;
				$scope.todosFuncionarios.forEach(function(obj) {
					if (obj.key === objNovo['Funcionarios'].key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					delete $scope.todosFuncionarios[posicao];
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
				$scope.data.fazenda=$scope.fazendas[0];
				$('#myPleaseWait').modal('hide');
			}			
		}); 


	}
}
//-------------------------------------------------------------------
function verificaFinalizacaoCarregamento()
{
	
	console.log(' --------------------- ');
	console.log('todasTipatis: ' + $scope.todasTipatis.length + ' - qde: ' + $scope.qtde_tipatis);
	console.log('todasEquipes: ' + $scope.todasEquipes.length + ' - qde: ' + $scope.qtde_equipes);
	console.log('todasQuadras: ' + $scope.todasQuadras.length + ' - qde: ' + $scope.qtde_quadras);
	console.log('todosProdutos: ' + $scope.todosProdutos.length + ' - qde: ' + $scope.qtde_produtos);
	console.log('todosEquipamentos: ' + $scope.todosEquipamentos.length + ' - qde: ' + $scope.qtde_equipamentos);
	console.log('todosFuncionarios: ' + $scope.todosFuncionarios.length + ' - qde: ' + $scope.qtde_funcionarios);
	console.log('todasVariedades: ' + $scope.todasVariedades.length + ' - qde: ' + $scope.qtde_variedades);

	console.log(' --------------------- ');
	
	if(
		$scope.todasTipatis.length==$scope.qtde_tipatis 
		&& $scope.todasEquipes.length==$scope.qtde_equipes
		&& $scope.todasQuadras.length==$scope.qtde_quadras
		&& $scope.todosProdutos.length==$scope.qtde_produtos
		&& $scope.todosEquipamentos.length==$scope.qtde_equipamentos
		&& $scope.todosFuncionarios.length==$scope.qtde_funcionarios
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
//-------------------------------------------------------------------		
$scope.chengeSafra = function(key_safra) {

	if (key_safra === null) {
		$scope.todosPlanejamento = null;
	} else {

		$scope.todosPlanejamento = [];
		var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
		var refTipatiNovo = new Firebase.util.NormalizedCollection(
			[baseRef.child("/filial/" + $scope.data.fazenda.key + "/safra/" + key_safra + "/quadra"), "$key"],
			baseRef.child("/quadra")
			).select({
				"key": "$key.$value",
				"alias": "planejamento"
			}, {
				"key": "quadra.$value",
				"alias": "quadra"
			}).ref();

			refTipatiNovo.on('child_added', function(snap) {
				//$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();

				if(objNovo.planejamento.variedades!=null)
				{
					var list_var=[];
					if(!Array.isArray(objNovo.planejamento.variedades))
					{
						for(var objVar in objNovo.planejamento.variedades)
						{
							for(var variedade of $scope.todasVariedades) {
								if (objVar === variedade.key) {
									var obj=clone(variedade);
									if(objNovo.planejamento.variedades[objVar].area!=null)
									{
										obj['area']=objNovo.planejamento.variedades[objVar].area;
									}
									list_var.push(obj);
									break;
								}
							};
						}
						objNovo['variedades']=list_var;
					}
					else
					{
						var list_var=[];
						objNovo.planejamento.variedades.forEach(function(var_pla) 
						{
							for(var variedade of $scope.todasVariedades) {
								if (var_pla.key === variedade.key) {
									var obj=variedade;
									if(var_pla.area!=null)
									{
										obj['area']=var_pla.area;
										$scope.soma_area = $scope.soma_area + var_pla.area;
									}
									list_var.push(obj);
									break;
								}
							};

						});
						objNovo['variedades']=list_var;
					}
				}
				

				$scope.todosPlanejamento.push(objNovo);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

			refTipatiNovo.on('child_changed', function(snap) {
				$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				objNovo.datpre = new Date(objNovo.datpre);
				var x = 0;
				var posicao = null;
				$scope.todosPlanejamento.forEach(function(obj) {
					if (obj.key === objNovo.key) {
						posicao = x;
					}
					x++;

				});
				if (posicao != null)
					$scope.todasTipatis[posicao] = objNovo['quadras'];

				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

			refTipatiNovo.on('child_removed', function(snap) {
				$scope.chengeFazenda($scope.data.fazenda);
			});



		}
	};
//-------------------------------------------------------------------
$scope.chengeFazenda = function(fazenda) {
	if (fazenda === null) return false;
	$scope.safras = [];
	for (var propertyName in fazenda.safra) {
		$scope.safras.push(fazenda.safra[propertyName]);
	}
	$scope.ordsers=[];
	listenerCodigo(fazenda);

	refOrdser = new Firebase(Constant.Url + '/ordser/' + fazenda.key);

	refOrdser.on('child_added', function(snap) {
		$('#myPleaseWait').modal('hide');
		var objNovo = snap.val();
		var x = 0;
		var posicao = null;
		$scope.ordsers.forEach(function(obj) {
			if (obj.key === objNovo.key) {
				posicao = x;
			}
			x++;

		});
		if (posicao == null) {
			$scope.todasTipatis.forEach(function(obj2) {
				if (obj2.key!=null && objNovo.key_tipati === obj2.key) {
					objNovo['tipati'] = obj2;
				}
			});

			$scope.safras.forEach(function(obj2) {
				if (objNovo.key_safra === obj2.key) {
					objNovo['safra'] = obj2;
				}
			});

			$scope.todasEquipes.forEach(function(obj2) {
				if (objNovo.key_equipe === obj2.key) {
					objNovo['equipe'] = obj2;
				}
			});

			var area_total_tmp=0;
			var area_total_executada_tmp=0;
			var per_total_executada_tmp = 0;
			for (var propertyName in objNovo.quadras) {
				if(objNovo.quadras[propertyName].area!=null)
				{
					area_total_tmp +=objNovo.quadras[propertyName].area;
				}
			}
			for (var propertyName in objNovo.execucoes) {
				var objExe=objNovo.execucoes[propertyName];

				area_total_executada_tmp += objExe.area;
				per_total_executada_tmp = (area_total_executada_tmp*100) / area_total_tmp ;
			};
			if(!isNaN(area_total_executada_tmp))
			{
				objNovo['area_total_executada']=area_total_executada_tmp;
			}
			if(!isNaN(per_total_executada_tmp))
			{
				objNovo['per_total_executada']=per_total_executada_tmp.toFixed(2);
			}
			$scope.ordsers.push(objNovo);
			$scope.gridOptions.data = $scope.ordsers;
		}
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	});

	refOrdser.on('child_changed', function(snap) {
		$('#myPleaseWait').modal('hide');
		var objNovo = snap.val();
		var x = 0;
		var posicao = null;
		$scope.ordsers.forEach(function(obj) {
			if (obj.key === objNovo.key) {
				posicao = x;
			}
			x++;

		});
		if (posicao != null) {

			$scope.todasTipatis.forEach(function(obj2) {
				if (objNovo.key_tipati === obj2.key) {
					objNovo['tipati'] = obj2;
				}
			});

			$scope.safras.forEach(function(obj2) {
				if (objNovo.key_safra === obj2.key) {
					objNovo['safra'] = obj2;
				}
			});

			$scope.todasEquipes.forEach(function(obj2) {
				if (objNovo.key_equipe === obj2.key) {
					objNovo['equipe'] = obj2;
				}
			});

			$scope.ordsers[posicao] = objNovo;
		}

		if (!$scope.$$phase) {
			$scope.$apply();
		}
	});

	refOrdser.on('child_removed', function(snap) {
		var objNovo = snap.val();
		var x = 0;
		var posicao = null;
		$scope.ordsers.forEach(function(obj) {
			if (obj.key === objNovo.key) {
				posicao = x;
			}
			x++;

		});
		if (posicao != null) {
			delete $scope.ordsers[posicao];
		}

	});
	//-------------------------------------------------------------------
	$scope.tipatis = [];
	for (var propertyName in fazenda.tipati) {
		$scope.todasTipatis.forEach(function(obj2) {
			if (propertyName === obj2.key) {
				$scope.tipatis.push(obj2);
			}
		});
	}
	//-------------------------------------------------------------------
	$scope.equipes = [];
	for (var propertyName in fazenda.equipe) {
		$scope.todasEquipes.forEach(function(obj2) {
			if (propertyName === obj2.key) {
				$scope.equipes.push(obj2);
			}
		});
	}
};
//-------------------------------------------------------------------
$scope.chengeTipOrdser = function() {
	if($scope.data.key_tipati!=null && $scope.data.key_tipati!=''  )
	{
		$scope.todasTipatis.forEach(function(obj2) {
			if ($scope.data.key_tipati === obj2.key) {
				if(obj2.aplagr!=null)
				{
					$scope.data.aplagr=obj2.aplagr;
				}
				else
				{
					$scope.data.aplagr=false;
				}

				if(obj2.plantio!=null)
				{
					$scope.data.plantio=obj2.plantio;
				}
				else
				{
					$scope.data.plantio=false;
				}

				if(obj2.colheita!=null)
				{
					$scope.data.colheita=obj2.colheita;
				}
				else
				{
					$scope.data.colheita=false;
				}
			}
		});
	}
	else
	{
		$scope.data.aplagr=false;
	}


	return true;
};
//############################################################################################################################
//############################################################################################################################
// ORDEM SERVICO
//############################################################################################################################

//-------------------------------------------------------------------
$scope.salvarOrdser = function(data) {
	if (validForm(data)) return false;

	var fazendaTmp = data.fazenda;
	delete data.fazenda;
	delete data.$$hashKey;
	delete data.$id;
	delete data.$priority;
	delete data.filial;
	delete data.safra;
	delete data.equipe;
	delete data.tipati;

	data.datpre = new Date(data.datpre).getTime();
	data['filial'] = [];
	data['filial'][fazendaTmp.key] = true;
	var refOrdser = new Firebase(Constant.Url + '/ordser/' + fazendaTmp.key);
	var key = refOrdser.push().key();
	var refOrdserNovo = new Firebase(Constant.Url + '/ordser/' + fazendaTmp.key + '/' + key);
	data.key = key;
	refOrdserNovo.set(data);

	Notify.successBottom('Ordem de Serviço/Atividade inserida com sucesso!');
	$scope.desabilitaFazenda = true;
	$scope.desabilitaQuadras = false;
	$scope.edit = true;
	$scope.save = false;
	$scope.data.fazenda=fazendaTmp;

};		
//-------------------------------------------------------------------
$scope.editarOrdser = function(data) {

	if (validForm(data)) return false;
	var fazendaTmp = data.fazenda;
	delete data.fazenda;
	delete data.$$hashKey;
	delete data.$id;
	delete data.$priority;
	delete data.filial;
	delete data.safra;
	delete data.equipe;
	delete data.tipati;
	data.datpre = new Date(data.datpre).getTime();
	var refOrdser = new Firebase(Constant.Url + '/ordser/' + fazendaTmp.key + '/' + data.key);
	refOrdser.set(data);
	data.fazenda = fazendaTmp;
	$scope.clear();

	Notify.successBottom('Ordem de Serviço/Atividade atualizada com sucesso!');
};
//-------------------------------------------------------------------
$scope.cancelar = function() {
	var fazendaTmp = $scope.data.fazenda;
	$scope.clear();
	if (fazendaTmp != null) {
		$scope.setaFazenda(fazendaTmp);
		$scope.chengeFazenda($scope.data.fazenda);
	}
	$scope.edit = false;
};
//-------------------------------------------------------------------
$scope.chamaEditarOrdser = function(obj) {
	$scope.desabilitaFazenda = true;
	$scope.desabilitaQuadras = false;
	$scope.edit = true;
	$scope.save = false;
	var fazendaTmp = $scope.data.fazenda;
	obj.datpre = new Date(obj.datpre);
	$scope.data = clone(obj);
	$scope.data.fazenda = fazendaTmp;

	$scope.area_total = 0;
	$scope.horas_total =0;
	$scope.area_total_executada = 0;
	$scope.per_total_executada = 0;

	if($scope.data.situacao=='Finalizado')
	{
		$scope.finalizado=true;
	}

	$scope.chengeSafra($scope.data.key_safra);
	$scope.todasQuadrasOrdser=[];
	for (var propertyName in $scope.data.quadras) {
		for(var obj3 of $scope.todasQuadras) {
			if ($scope.data.quadras[propertyName].key_quadra === obj3.key) {

				var obj2 = clone(obj3);
				obj2['key'] = propertyName;
				obj2['key_quadra'] = obj3.key;
				obj2['area'] = $scope.data.quadras[propertyName].area;
				if ($scope.data.quadras[propertyName].area != null) {
					$scope.area_total += $scope.data.quadras[propertyName].area;
				}
				if ($scope.data.quadras[propertyName].key_variedade != null) {
					$scope.todasVariedades.forEach(function(objVar) {
						if ($scope.data.quadras[propertyName].key_variedade === objVar.key) {
							obj2['variedade'] = objVar;
						}
					});
				}
				$scope.todasQuadrasOrdser.push(obj2);

			}
		};
	}
	if ($scope.todasQuadrasOrdser.length == 0) {
		$scope.temquadras = false;
	} else {
		$scope.temquadras = true;
	}
	$scope.gridOptionsQuadras.data = $scope.todasQuadrasOrdser;
	//-------------------------------------------------------------
	$scope.todosProdutosOrdser=[];
	for (var propertyName in $scope.data.produtos) {
		$scope.todosProdutos.forEach(function(obj2) {
			if (propertyName === obj2.key) {
				obj2.dose = $scope.data.produtos[propertyName]['dose'];
				obj2.quatot = $scope.data.produtos[propertyName]['quatot'];
				$scope.todosProdutosOrdser.push(obj2);
			}
		});
	}
	$scope.gridOptionsProdutos.data = $scope.todosProdutosOrdser;
	if ($scope.todosProdutos.length == 0) {
		$scope.temprodutos = false;
	} else {
		$scope.temprodutos = true;
	}
	//-------------------------------------------------------------
	$scope.todosEquipamentosOrdser = [];
	$scope.todosEquipamentosNaoImplementoOrdser = [];
	$scope.todosEquipamentosImplementoOrdser = [];
	for (var propertyName in $scope.data.equipamentos) {
		$scope.todosEquipamentos.forEach(function(obj2) {
			if (propertyName === obj2.key) {
				obj2.consumo = $scope.data.equipamentos[propertyName]['consumo'];
				$scope.todosEquipamentosOrdser.push(obj2);
				if(obj2.implemento!=null && obj2.implemento)
				{
					$scope.todosEquipamentosImplementoOrdser.push(obj2);
				}
				else
				{
					$scope.todosEquipamentosNaoImplementoOrdser.push(obj2);
				}
			}
		});
	}

	if ($scope.todosEquipamentosOrdser.length == 0) {
		$scope.temequipamentos = false;
	} else {
		$scope.temequipamentos = true;
	}
	$scope.gridOptionsEquipamentos.data = $scope.todosEquipamentosOrdser;
	//-------------------------------------------------------------
	$scope.todosExecucoesOrdser = [];
	for (var propertyName in $scope.data.execucoes) {
		var objExe=$scope.data.execucoes[propertyName];
		$scope.horas_total += objExe.quahor;

		$scope.area_total_executada += objExe.area;
		$scope.per_total_executada = ($scope.area_total_executada*100) / $scope.area_total ;

		$scope.todosEquipamentos.forEach(function(obj2) {
			if (objExe.key_equipamento === obj2.key) {
				objExe['equipamento'] = obj2;
			}
		});

		if(objExe.key_implemento!=null)
		{
			$scope.todosEquipamentos.forEach(function(obj2) {
				if (objExe.key_implemento === obj2.key) {
					objExe['implemento'] = obj2;
				}
			});
		}

		if(objExe.key_variedade!=null)
		{
			$scope.todasVariedades.forEach(function(obj2) {
				if (objExe.key_variedade === obj2.key) {
					objExe['variedade'] = obj2;
				}
			});
		}

		$scope.todosFuncionarios.forEach(function(obj2) {
			if (objExe.key_funcionario === obj2.key) {
				objExe['funcionario'] = obj2;
			}
		});
		$scope.todasQuadras.forEach(function(obj2) {
			if (objExe.key_quadra === obj2.key) {
				objExe['quadra'] = obj2;
			}
		});
		$scope.todosExecucoesOrdser.push(objExe);
	}
	if ($scope.todosExecucoesOrdser.length == 0) {
		$scope.temexecucoes = false;
	} else {
		$scope.temexecucoes = true;
	}
	$scope.gridOptionsExecucoes.data = $scope.todosExecucoesOrdser;
	//-------------------------------------------------------------
};

//-------------------------------------------------------------------
$scope.finalizarOrdser = function(obj) {
	$('#modalFinalizar').modal('show');
}
//-------------------------------------------------------------------
$scope.efetuarFinalizar= function() {
	var	fazendaTmp= $scope.data.fazenda;
	if($scope.data==null)
	{
		return true;
	}
	else
	{
		var refOrdser = new Firebase(Constant.Url + '/ordser/' + fazendaTmp.key + '/' + $scope.data.key+'/situacao');
		refOrdser.set('Finalizado');
		$scope.clear();
		$scope.data.fazenda = fazendaTmp;

		Notify.successBottom('Ordem de Serviço/Atividade finalizada com sucesso!');
		$('#modalFinalizar').modal('hide');
	}
}
//-------------------------------------------------------------------
$scope.excluir = function(objeto) {
	$('#modalDeleteOrdser').modal('show');
};
//-------------------------------------------------------------------
$scope.excluirOrdser = function() {
	$('#modalDeleteOrdser').modal('hide');
	if ($scope.data != null && $scope.data.fazenda != null) {
		var fazendaTmp = $scope.data.fazenda;

		var refOrdserNovo = new Firebase(Constant.Url + '/ordser/' + $scope.data.fazenda.key + '/' + $scope.data.key);
		refOrdserNovo.remove();
		Notify.successBottom('Ordem de Serviço/Atividade removida com sucesso!');				
		$scope.clear();
		$scope.data.fazenda=fazendaTmp;
	}
	return true;

};
//############################################################################################################################
//############################################################################################################################
//QUADRA
//############################################################################################################################
//-------------------------------------------------------------------
$scope.adicionarQuadra = function(data, data_quadra) {
	if ($scope.todosProdutosOrdser.length > 0 && $scope.data_quadra_area != null) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade já possui produtos, ao adicionar quadra/região a área total mudará e a quantidade total do produto baseado na dose x area ficará errado. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	if($scope.data.plantio || $scope.data.colheita)
	{
		if ($scope.data_quadra_area== null) {
			$scope.mensagem_aviso = "Para atividade de 'plantio' e 'colheita' é necessário a área, defina-a em 'Planejamento de Safra'. Impossível continuar.";
			$('#modalMensagem').modal('show');
			return;
		}
	}

	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}

	var existe=false;
	if($scope.data.plantio || $scope.data.colheita)
	{
		$scope.todasQuadrasOrdser.forEach(function(obj2) {
			if($scope.data_variedade==null)
			{
				$scope.todasQuadrasOrdser.forEach(function(obj2) {
					if (obj2.key_quadra === data_quadra.quadra.key) {
						$scope.mensagem_aviso = "Quadra já adicionada. Impossível continuar.";
						existe=true;
						$('#modalMensagem').modal('show');
						return;
					}
				});
			}
			else
			{
				if (obj2.key_quadra === data_quadra.quadra.key && obj2.variedade.key== $scope.data_variedade.key) {
					$scope.mensagem_aviso = "Quadra e Variedade já adicionada. Impossível continuar.";
					existe=true;
					$('#modalMensagem').modal('show');
					return;
				}
			}
		});
	}
	else
	{
		$scope.todasQuadrasOrdser.forEach(function(obj2) {
			if (obj2.key_quadra === data_quadra.quadra.key) {
				$scope.mensagem_aviso = "Quadra já adicionada. Impossível continuar.";
				existe=true;
				$('#modalMensagem').modal('show');
				return;
			}
		});
	}

	if(!existe)
	{
		var fazendaTmp = $scope.data.fazenda;
		if (data_quadra == null) return false;

		//var refOrdser = new Firebase(Constant.Url + '/ordser/' + data.fazenda.key + '/' + data.key + '/quadras/' + data_quadra.quadra.key);
		var refOrdser = new Firebase(Constant.Url + '/ordser/' + data.fazenda.key + '/' + data.key + '/quadras/');
		
		var quadraIncluir = clone(data_quadra.quadra);
		quadraIncluir['key_quadra']=data_quadra.quadra.key;

		quadraIncluir.key = refOrdser.push().key();
		if ($scope.data_quadra_area  != null) {
			quadraIncluir['area'] = $scope.data_quadra_area;
			if( $scope.data_variedade!=null)
			{
				quadraIncluir['key_variedade'] = $scope.data_variedade.key;
			}
		}
		var quadraTmp = clone(quadraIncluir);
		delete quadraTmp.filial;
		delete quadraTmp.$$hashKey;
		delete quadraTmp.$$hashKey;
		delete quadraTmp.codigo;
		delete quadraTmp.nome;
		delete quadraTmp.ativo;
		delete quadraTmp.coordenadas;
		delete quadraTmp.dataStr_ultalt;
		delete quadraTmp.data_ultalt;
		delete quadraTmp.aplicacoes;
		delete quadraTmp.variedade;
		delete quadraTmp.separar_variedade;

		var refOrdserGravar = new Firebase(Constant.Url + '/ordser/' + data.fazenda.key + '/' + data.key + '/quadras/'+quadraIncluir.key);
		refOrdserGravar.set(quadraTmp);

		quadraIncluir['variedade'] = $scope.data_variedade;
		$scope.todasQuadrasOrdser.push(quadraIncluir);

		$scope.temquadras = true;

		$scope.gridOptionsQuadras.data = $scope.todasQuadrasOrdser;

		if ($scope.data_quadra_area  != null) {
			$scope.area_total += $scope.data_quadra_area ;
		}

		Notify.successBottom('Quadra/Região inserida com sucesso!');
		$scope.data.fazenda = fazendaTmp;
	}
};
//-------------------------------------------------------------------
$scope.retornaArea = function() {
	return $scope.area_total.toFixed(2);
};
//-------------------------------------------------------------------
$scope.questionaExcluirQuadra = function(row) {
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	if ($scope.todosProdutosOrdser.length == 0 || row.entity.area == null) {
		$scope.key_quadra = row.entity.key;
		$('#modalDeleteQuadra').modal('show');
	} else {
		$scope.mensagem_aviso = "Ordem de serviço/atividade já possui produtos, ao retirar esta quadra/região a área total mudará e a quantidade total do produto baseado na dose x area ficará errado. Impossível continuar.";
		$('#modalMensagem').modal('show');
	}
};
//-------------------------------------------------------------------
$scope.excluirQuadra = function() {
	$('#modalDeleteQuadra').modal('hide');
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	var fazendaTmp = $scope.data.fazenda;
	if ($scope.data != null && $scope.data.fazenda != null && $scope.key_quadra != null) {
		var refOrdserNovo = new Firebase(Constant.Url + '/ordser/' + $scope.data.fazenda.key + '/' + $scope.data.key + '/quadras/' + $scope.key_quadra);
		refOrdserNovo.remove();
		Notify.successBottom('Quadra/Região removido com sucesso!');

		var posicao_deletar;
		$scope.todasQuadrasOrdser.forEach(function(obj2) {
			if ($scope.key_quadra === obj2.key) {
				posicao_deletar = $scope.todasQuadrasOrdser.indexOf(obj2);
			}
		});
		if (posicao_deletar != null) {
			if ($scope.todasQuadrasOrdser[posicao_deletar].area != null) {
				$scope.area_total -= $scope.todasQuadrasOrdser[posicao_deletar].area;
			}
			delete $scope.todasQuadrasOrdser[posicao_deletar];
		}

		if ($scope.todasQuadrasOrdser.length == 0) {
			$scope.temquadras = false;
		}

		$scope.key_quadra = null;
	}
	$scope.data.fazenda = fazendaTmp;
	return true;

};

$scope.chengeQuadra = function(qus) {
	if(qus!=null)
	{
		if(qus.planejamento.area==null)
		{			
			$scope.data_quadra_area=null;
		}

		if($scope.data.plantio || $scope.data.colheita)
		{
			if(qus.variedades==null)
			{
				if(qus.planejamento.area!=null)
				{
					$scope.data_quadra_area=qus.planejamento.area;
				}
			}
			else
			{
				$scope.variedadesTmp = qus.variedades;
				$scope.data_quadra_area=null;
			}
		}
		else
		{
			if(qus.planejamento.area!=null)
			{
				$scope.data_quadra_area=qus.planejamento.area;
			}			
		}
	}
	else
	{
		$scope.data_quadra_area=null;
	}
}

$scope.chengeVariedade = function(variedade) {
	if(variedade!=null && variedade.area!=null)
	{		
		$scope.data_quadra_area=variedade.area;		
	}
}



//############################################################################################################################
//############################################################################################################################
//PRODUTO
//############################################################################################################################
//-------------------------------------------------------------------
$scope.adicionarProduto = function(data, data_produto) {
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	var fazendaTmp = $scope.data.fazenda;
	if (data_produto == null) return false;
	if (data_produto.dose != null) {
		data_produto['quatot'] = (data_produto.dose * $scope.area_total).toFixed(2);
	}
	var existe=false;
	$scope.todosProdutosOrdser.forEach(function(obj2) {
		if (obj2.key === data_produto.key) {
			$scope.mensagem_aviso = "Produto já adicionado. Impossível continuar.";
			existe=true;
			$('#modalMensagem').modal('show');
			return;
		}
	});
	if(!existe)
	{
		var refOrdser = new Firebase(Constant.Url + '/ordser/' + data.fazenda.key + '/' + data.key + '/produtos/' + data_produto.key);
		var produtoTmp = clone(data_produto);
		delete produtoTmp.filial;
		delete produtoTmp.$$hashKey;
		delete produtoTmp.$$hashKey;
		delete produtoTmp.codigo;
		delete produtoTmp.nome;
		delete produtoTmp.marca;
		delete produtoTmp.priati;
		delete produtoTmp.obs;
		delete produtoTmp.ativo;

		refOrdser.set(produtoTmp);

		$scope.todosProdutosOrdser.push(data_produto);

		$scope.gridOptionsProdutos.data = $scope.todosProdutosOrdser;

		$scope.temprodutos = true;

		Notify.successBottom('Produto inserido com sucesso!');
		$scope.data.fazenda = fazendaTmp;
	}
};
//-------------------------------------------------------------------
$scope.questionaExcluirProduto = function(row) {
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	$scope.key_produto = row.entity.key;
	$('#modalDeleteProduto').modal('show');
};
//-------------------------------------------------------------------
$scope.excluirProduto = function() {
	$('#modalDeleteProduto').modal('hide');
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	var fazendaTmp = $scope.data.fazenda;
	if ($scope.data != null && $scope.data.fazenda != null && $scope.key_produto != null) {
		var refOrdserNovo = new Firebase(Constant.Url + '/ordser/' + $scope.data.fazenda.key + '/' + $scope.data.key + '/produtos/' + $scope.key_produto);
		refOrdserNovo.remove();
		Notify.successBottom('Produto removido com sucesso!');

		var posicao_deletar;
		$scope.todosProdutosOrdser.forEach(function(obj2) {
			if ($scope.key_produto === obj2.key) {
				posicao_deletar = $scope.todosProdutosOrdser.indexOf(obj2);
			}
		});
		if($scope.todosProdutosOrdser.length==1)
		{
			if (posicao_deletar != null) {
				delete $scope.todosProdutosOrdser[posicao_deletar];

				$scope.todosProdutosOrdser=[];
			}
		}
		else
		{
			delete $scope.todosProdutosOrdser[posicao_deletar];
		}

		if ($scope.todosProdutosOrdser.length == 0) {
			$scope.temprodutos = false;
		}


		$scope.key_produto = null;
	}
	$scope.data.fazenda = fazendaTmp;
	return true;

};
$scope.chengeProduto = function() {
	$scope.data_produto.dose= $scope.data_produto.dospad;
}
//############################################################################################################################
//############################################################################################################################
//EQUIPAMENTO
//############################################################################################################################

//-------------------------------------------------------------------
$scope.adicionarEquipamento = function(data, data_equipamento) {
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	var fazendaTmp = $scope.data.fazenda;
	if (data_equipamento == null) return false;

	var existe=false;
	$scope.todosEquipamentosOrdser.forEach(function(obj2) {
		if (obj2.key === data_equipamento.key) {
			$scope.mensagem_aviso = "Equipamento já adicionado. Impossível continuar.";
			existe=true;
			$('#modalMensagem').modal('show');
			return;
		}
	});
	if(!existe)
	{
		var refOrdser = new Firebase(Constant.Url + '/ordser/' + data.fazenda.key + '/' + data.key + '/equipamentos/' + data_equipamento.key);
		var equipamentoTmp = clone(data_equipamento);
		delete equipamentoTmp.filial;
		delete equipamentoTmp.$$hashKey;
		delete equipamentoTmp.$$hashKey;
		delete equipamentoTmp.nome;
		delete equipamentoTmp.codigo;
		delete equipamentoTmp.ano;
		delete equipamentoTmp.marca;
		delete equipamentoTmp.ativo;
		delete equipamentoTmp.key_combustivel;

		refOrdser.set(equipamentoTmp);

		$scope.todosEquipamentosOrdser.push(data_equipamento);

		if(data_equipamento.implemento!=null && data_equipamento.implemento)
		{
			$scope.todosEquipamentosImplementoOrdser.push(data_equipamento);
		}
		else
		{
			$scope.todosEquipamentosNaoImplementoOrdser.push(data_equipamento);
		}


		$scope.gridOptionsEquipamentos.data = $scope.todosEquipamentosOrdser;

		$scope.temequipamentos = true;

		Notify.successBottom('Equipamento inserida com sucesso!');
		$scope.data.fazenda = fazendaTmp;
	}
};
//-------------------------------------------------------------------
$scope.questionaExcluirEquipamento = function(row) {
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	var existe=false;
	$scope.todosExecucoesOrdser.forEach(function(obj2) {
		if (obj2.key_equipamento === row.entity.key) {
			existe=true;
			$scope.mensagem_aviso = "Ordem de serviço/atividade já possui execuções com este equipamento. Impossível continuar.";
			$('#modalMensagem').modal('show');
			return;
		}
	});
	if(!existe)
	{
		$scope.key_equipamento = row.entity.key;
		$('#modalDeleteEquipamento').modal('show');
	}
};
//-------------------------------------------------------------------
$scope.excluirEquipamento = function() {
	$('#modalDeleteEquipamento').modal('hide');
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	var fazendaTmp = $scope.data.fazenda;
	if ($scope.data != null && $scope.data.fazenda != null && $scope.key_equipamento != null) {
		var refOrdserNovo = new Firebase(Constant.Url + '/ordser/' + $scope.data.fazenda.key + '/' + $scope.data.key + '/equipamentos/' + $scope.key_equipamento);
		refOrdserNovo.remove();
		Notify.successBottom('Equipamento removido com sucesso!');

		var posicao_deletar;
		$scope.todosEquipamentosOrdser.forEach(function(obj2) {
			if ($scope.key_equipamento === obj2.key) {
				posicao_deletar = $scope.todosEquipamentosOrdser.indexOf(obj2);
			}
		});
		if (posicao_deletar != null) {
			delete $scope.todosEquipamentosOrdser[posicao_deletar];
		}

		if ($scope.todosProdutosOrdser.length == 0) {
			$scope.temequipamentos = false;
		}

		$scope.key_equipamento = null;
	}
	$scope.data.fazenda = fazendaTmp;
	return true;

};
$scope.chengeEquipamento = function() {
	if($scope.data_equipamento.equipamento.consumo!=null)
	{
		$scope.data_equipamento.consumo = $scope.data_equipamento.equipamento.consumo;
	}
	else
	{
		$scope.data_equipamento.consumo = null;
	}
}

//############################################################################################################################
//############################################################################################################################
//EXECUCAO
//############################################################################################################################
//-------------------------------------------------------------------

$scope.chengeEquipamentoExecucao = function() {
	if($scope.data_execucao.equipamento.perimp !=null && $scope.data_execucao.equipamento.perimp)
	{
		$scope.exibeImplemento = $scope.data_execucao.equipamento.perimp;
	}
	else
	{
		$scope.exibeImplemento = false;
		$scope.data_execucao.implemento=null;
	}
	
}

$scope.adicionarExecucao = function(data, data_execucao) {
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	if (validFormExecucao(data_execucao)) return false;

	var fazendaTmp = $scope.data.fazenda;
	if (data_execucao == null) return false;

	var refOrdserExe = new Firebase(Constant.Url + '/ordser/' + data.fazenda.key + '/' + data.key + '/execucoes' );
	data_execucao['key'] = refOrdserExe.push().key();
	data_execucao['key_ordser'] = data.key;
	data_execucao['key_equipamento'] = data_execucao.equipamento.key;
	if(data_execucao.implemento!=null)
	{
		data_execucao['key_implemento'] = data_execucao.implemento.key;
	}
	data_execucao['key_safra'] = data.key_safra;
	data_execucao['key_funcionario'] = data_execucao.funcionario.key;
	if(data_execucao.quadra!=null)
	{
		data_execucao['key_quadra'] = data_execucao.quadra.key;
	}
	if(data_execucao.variedade!=null)
	{
		data_execucao['key_variedade'] = data_execucao.variedade.key;
	}
	data_execucao.data = new Date(data_execucao.data).getTime();
	data_execucao['data_string'] = formatDate(new Date(data_execucao.data));
	var refOrdser = new Firebase(Constant.Url + '/ordser/' + data.fazenda.key + '/' + data.key + '/execucoes/' + 	data_execucao.key);
	var execucaoTmp = clone(data_execucao);
	if(execucaoTmp.area==null)
	{
		delete execucaoTmp.area;
	}
	delete execucaoTmp.filial;
	delete execucaoTmp.$$hashKey;
	delete execucaoTmp.$$hashKey;
	delete execucaoTmp.equipamento;
	delete execucaoTmp.funcionario;
	delete execucaoTmp.quadra;
	delete execucaoTmp.implemento;
	delete execucaoTmp.variedade;

	refOrdser.set(execucaoTmp);

	if($scope.data.aplagr!=null && $scope.data.aplagr)
	{
		var refOrdserQuadra = new Firebase(Constant.Url + '/quadra/' + data_execucao.quadra.key + '/aplicacoes/' + data.key_safra + '/' + data_execucao['key'] );
		refOrdserQuadra.set(execucaoTmp);
	}

	$scope.todosExecucoesOrdser.push(clone(data_execucao));

	$scope.gridOptionsExecucoes.data = $scope.todosExecucoesOrdser;

	$scope.temexecucoes = true;

	$scope.horas_total += data_execucao.quahor;

	Notify.successBottom('Execução inserida com sucesso!');
	$scope.data.fazenda = fazendaTmp;
};
//-------------------------------------------------------------------
$scope.questionaExcluirExecucao = function(row) {
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	$scope.key_execucao = row.entity.key;
	$scope.key_execucao_quadra = row.entity.key_quadra;
	$('#modalDeleteExecucao').modal('show');
};
//-------------------------------------------------------------------
$scope.excluirExecucao = function() {
	$('#modalDeleteExecucao').modal('hide');
	if ($scope.finalizado) {
		$scope.mensagem_aviso = "Ordem de serviço/atividade está finalizada. Impossível continuar.";
		$('#modalMensagem').modal('show');
		return;
	}
	var fazendaTmp = $scope.data.fazenda;
	if ($scope.data != null && $scope.data.fazenda != null && $scope.key_execucao != null) {
		var refOrdserNovo = new Firebase(Constant.Url + '/ordser/' + $scope.data.fazenda.key + '/' + $scope.data.key + '/execucoes/' + $scope.key_execucao);
		refOrdserNovo.remove();

		if($scope.data.aplagr!=null && $scope.data.aplagr)
		{
			var refOrdserNovo = new Firebase(Constant.Url + '/quadra/' + $scope.key_execucao_quadra + '/aplicacoes/' + $scope.data.key_safra + '/' + $scope.key_execucao);
			refOrdserNovo.remove();
		}		

		Notify.successBottom('Execução removida com sucesso!');

		var posicao_deletar;
		$scope.todosExecucoesOrdser.forEach(function(obj2) {
			if ($scope.key_execucao === obj2.key) {
				$scope.horas_total -= obj2.quahor;
				posicao_deletar = $scope.todosExecucoesOrdser.indexOf(obj2);
			}
		});
		if (posicao_deletar != null) {
			delete $scope.todosExecucoesOrdser[posicao_deletar];
		}

		if ($scope.todosExecucoesOrdser.length == 0) {
			$scope.temexecucoes = false;
		}


		$scope.key_execucao = null;
	}
	$scope.data.fazenda = fazendaTmp;
	return true;

};
//-------------------------------------------------------------------
$scope.chengeQuadraExecucao = function() {
	//$scope.data_execucao.area = $scope.data_execucao.quadra.area;

	if($scope.data_execucao.quadra!=null)
	{
		if($scope.data_execucao.quadra.area==null)
		{			
			$scope.data_execucao.area =null;
		}

		if($scope.data.plantio || $scope.data.colheita)
		{
			if( $scope.data_execucao.quadra.variedade==null)
			{
				if($scope.data_execucao.quadra.area!=null)
				{
					$scope.data_execucao.area=$scope.data_execucao.quadra.area;
				}
			}
			else
			{
				$scope.data_execucao.area=null;
			}			
		}
		else
		{
			if($scope.data_execucao.quadra.area!=null)
			{
				$scope.data_execucao.area=$scope.data_execucao.quadra.area;
			}			
		}
	}
	else
	{
		$scope.data_execucao.area=null;
	}


	$scope.variedadesTmpExecucao=[];
	if($scope.data.plantio || $scope.data.colheita)
	{
		$scope.todasQuadrasOrdser.forEach(function(obj2) {
			if (obj2.key_quadra === $scope.data_execucao.quadra.key_quadra && $scope.data_execucao.quadra.variedade!=null) {
				var objCloneVariedade= clone(obj2.variedade);
				objCloneVariedade['area']=obj2.area;
				$scope.variedadesTmpExecucao.push(objCloneVariedade)
			}
		});

	}
}
$scope.chengeVariedadeExecucao = function(variedade) {
	if(variedade!=null && variedade.area!=null)
	{		
		$scope.data_execucao.area=variedade.area;		
	}
}

//############################################################################################################################
//############################################################################################################################
//UTEIS
//############################################################################################################################
//-------------------------------------------------------------------
$scope.setaFazenda = function(fazenda) {
	if (fazenda === null) return false;

	$scope.fazendas.forEach(function(item) {
		if (item.key === fazenda.key) {
			$scope.data.fazenda = item;
		}
	});

};
//-------------------------------------------------------------------
function setMessageError(message) {
	Notify.errorBottom(message);
};
//-------------------------------------------------------------------
function validForm(data) {

	if (data.fazenda == null || data.fazenda.key == null) {
		setMessageError('O campo Fazenda é obrigatório!');
		return true;
	}
	if (data.codigo === '') {
		setMessageError('O campo Código é obrigatório!');
		return true;
	}
	if (data.situacao === '') {
		setMessageError('O campo Situação é obrigatório!');
		return true;
	}
	if (data.datpre === '') {
		setMessageError('O campo Data Prevista é obrigatório!');
		return true;
	}
	if (data.key_safra === '') {
		setMessageError('O campo Safra é obrigatório!');
		return true;
	}
	if (data.key_tipati === '') {
		setMessageError('O campo Tipo Ordem de Serviço/Aplicação é obrigatório!');
		return true;
	}



	return false;
};
//-------------------------------------------------------------------
function validFormExecucao(data) {

	if (data == null) {
		setMessageError('É preciso preencher os campos da guia Execução!');
		return true;
	}
	if (data.data == null) {
		setMessageError('O campo Data é obrigatório!');
		return true;
	}
	if (data.data === '') {
		setMessageError('O campo Data é obrigatório!');
		return true;
	}
	if (data.equipamento == null) {
		setMessageError('O campo Equipamento é obrigatório!');
		return true;
	}
	if (data.funcionario == null) {
		setMessageError('O campo Operador é obrigatório!');
		return true;
	}
	if (data.quahor == null || data.quahor === '') {
		setMessageError('O campo Quantidade de Horas é obrigatório!');
		return true;
	}
	if(data.variedade==null)
	{
		if (data.quadra != null && data.area != ''  && data.area >  data.quadra.area) {
			setMessageError('A area informada está maior que a área da Quadra/região!');
			return true;
		}
	}
	else
	{
		if (data.area != ''  && data.area >  data.variedade.area) {
			setMessageError('A area informada está maior que a área da Variedade!');
			return true;
		}
	}


	return false;
};
//-------------------------------------------------------------------
$scope.helpSituacao = function() {
	$('#modalHelp').modal('show');
}
//-------------------------------------------------------------------
$scope.clear = function() {
			//var fazendaTmp=$scope.data.fazenda;
			angular.extend($scope.data, {
				datpre: '',
				obs: '',
				codigo: '',
				key_tipati: '',
				key_safra: '',
				key_equipe: '',
				situacao: 'Aberto',
				key: ''
			});
			//$scope.data.fazenda=fazendaTmp;
			$scope.desabilitaFazenda = false;
			$scope.edit = false;
			$scope.save = true;

			$scope.todasQuadrasOrdser = [];
			$scope.gridOptionsQuadras.data = $scope.todasQuadrasOrdser;
			$scope.temquadras = false;
			$scope.todosProdutosOrdser = [];
			$scope.gridOptionsProdutos.data = $scope.todosProdutosOrdser;
			$scope.temprodutos = false;
			$scope.todosEquipamentosOrdser = [];
			$scope.gridOptionsEquipamentos.data = $scope.todosEquipamentosOrdser;
			$scope.temequipamentos = false;
			$scope.todosExecucoesOrdser = [];
			$scope.gridOptionsExecucoes.data = $scope.todosExecucoesOrdser;
			$scope.temequipamentos = false;
			$scope.area_total = 0;
			$scope.horas_total =0;

			if (!$scope.$$phase) {
				$scope.$apply();
			}

			$scope.data.codigo = zeroFill($scope.numeracao_codigo, 5);
			//$scope.chengeFazenda($scope.fazenda);
			//$scope.data.fazenda=fazendaTmp;
		};
//-------------------------------------------------------------------
function clone(obj) {
	if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
		return obj;

	if (obj instanceof Date)
				var temp = new obj.constructor(); //or new Date(obj);
			else
				var temp = obj.constructor();

			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					obj['isActiveClone'] = null;
					temp[key] = clone(obj[key]);
					delete obj['isActiveClone'];
				}
			}

			return temp;
		}
//-------------------------------------------------------------------
function zeroFill(number, width) {
	width -= number.toString().length;
	if (width > 0) {
		return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
	}
	return number + "";
}

function formatDate(date) {
	var d = new Date(date),
	month = '' + (d.getMonth() + 1),
	day = '' + d.getDate(),
	year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [day, month, year].join('/');
}


}

}());