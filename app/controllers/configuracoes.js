(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('configuracoesCtrl', configuracoesCtrl);

	configuracoesCtrl.$inject = ['$scope', '$compile', '$sce',  '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', 'uiGridGroupingConstants', 'Controleacesso'];

	function configuracoesCtrl($scope, $compile,  $sce, $firebaseArray, $firebaseObject, Session, Constant, Notify, uiGridGroupingConstants, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			configuracoess: [],
			configuracoesFilial: [],
			data: {
				ativo:true				
			},
			frmCultura: {
				key_cultura:'',
				abertura : false,
				altura : false,
				altura_ocorrencia : '',
				//altura_intervalo : '',
				altura_estagio : false,
				quanos : false,
				quanos_ocorrencia : '',
				//quanos_intervalo : '',
				quanos_estagio : false,
				disnos : false,
				disnos_ocorrencia : '',
				//disnos_intervalo : '',
				disnos_estagio : false,
				quaast : false,
				quaast_ocorrencia : '',
				//quaast_intervalo : '',
				quaast_estagio : false,
				quavag : false,
				quavag_ocorrencia : '',
				//quavag_intervalo : '',
				quavag_estagio : false,
				altprivag : false,
				altprivag_ocorrencia : '',
				//altprivag_intervalo : '',
				altprivag_estagio : false,
				quagravag : false,
				quagravag_ocorrencia : '',
				//quagravag_intervalo : '',
				quagravag_estagio : false
			}
		});



		$scope.ocorrencia = [
		{
			nome:'Primeiro ponto',
			key: 'PRIPON'
		},
		{
			nome:'Todo ponto',
			key: 'TODPON'
		},
		{
			nome:'Intervalo fixo',
			key: 'INTFIX'
		}];

		$scope.terminou=false;

		var objMenuVazio;

		$scope.todasCulturas=[];
		$scope.exibePermissoes=false;
		$scope.todosControleacessos =[];
		$scope.todosControleacessosGeral =[];
		$scope.usuarios=[];
		$scope.aceemps=[];
		$scope.todoUsuarios=[];
		$scope.usuario={};
		$scope.qtde_controleacesso=0;
		$scope.qtde_culturas=0;

		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.posicaoFilial = window.localStorage.getItem('posicaoFilial');
		$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
		var key_usuario  = window.localStorage.getItem('key_usuario');

		$scope.usuario_inclusao={};

		$scope.frmCultura= {
			key_cultura:''
		};

		$scope.gridOptionsCulturas = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "nome", displayName: "Cultura", width: 300 }
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


		$scope.gridOptionsCulturas.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.chamaEditarConxcul(row.entity);
			});
		};

		$scope.gridUsuarios = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "nome", displayName: "Nome", width: 300 }
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				}
			}
			
		};

		$scope.gridUsuarios.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.usuario=row.entity;
				$scope.exibePermissoes=true;
				recuperaControleacessoPorUsuario() ;
			});
		};

		$scope.gridOptionsControleacesso = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			//treeRowHeaderAlwaysVisible: false,

			columnDefs : [
			{ field: "nomgru", displayName: "Menu", width: 300, enableCellEdit: false, grouping: { groupPriority: 0 } , cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>"},
			

			{ field: "nome", displayName: "Nome", width: 300, enableCellEdit: false, },
			{ name: 'Visualização', enableCellEdit: false, width: 130, field: 'visualizacao', cellTemplate: '<input type="checkbox" ng-model="row.entity.visualizacao">'},
			{ field: "inclusao", displayName: "Inclusão", width: 130, enableCellEdit: false, cellTemplate: '<input type="checkbox" ng-model="row.entity.inclusao">'},
			{ field: "edicao", displayName: "Edição", width: 130, enableCellEdit: false, cellTemplate: '<input type="checkbox" ng-model="row.entity.edicao">'},
			{ field: "exclusao", displayName: "Exclusão", width: 130,enableCellEdit: false, cellTemplate: '<input type="checkbox" ng-model="row.entity.exclusao">'},
			],
			appScopeProvider: {
				mapValue: function(row) {
					if(row.groupHeader)
					{
						var entity = row.treeNode.children[0].row.entity;
						return entity.nomgru;
					}
					else
					{
						return '';
					}
				}
			}			
		};

		$scope.name = function(grid,row,col)
		{
			if(row.groupHeader)
			{
				var entity = row.treeNode.children[0].row.entity;
				return entity.codgru;
			}
			else
			{
				return row.entity.codgru;
			}
			return "SAmple";
		}


		$scope.gridOptionsControleacesso.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;

			gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
				console.log('edited row id:' + rowEntity.key + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue);
				$scope.$apply();
			});

			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				console.log('edited row id:' + row);
				$scope.gravarAceemp(row.entity);
			});


		};



		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA/FILIAL
		//############################################################################################################################

		function atualizaListaFiliais()
		{
			$scope.terminou=true;

			$scope.chengeFazenda($scope.fazendas[0]);
			console.log('atualizaListaFiliais()')
			$('#myPleaseWait').modal('hide');

			var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
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
					}
					window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));

				});
			}		

		//---------------------
		$scope.chengeFazenda = function(fazenda)
		{
			if(fazenda === null || fazenda==null) 
			{
				$scope.configuracoess =null;
			}
			else
			{		
				$scope.exibePermissoes=false
				//--------------------------------------
				//Controle Acesso	
				//$scope.menu  = $sce.trustAsHtml(Controleacesso.refazMenu_Acesso(fazenda.aceemps));
				$scope.objetoTelaAcesso=Controleacesso.retornaObjetoTela(fazenda.aceemps, 'configuracoes');

				if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
				{
				//	window.location.href = '#home';
			}
				//--------------------------------------
				else
				{
					$('#myPleaseWait').modal('show');
				}

				recuperaConfiguracao($scope.fazendas[0]);	
				$scope.recuperaUsuarios(fazenda);
				$scope.configuracoess=[];

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/configuracoes"),
					[baseRef.child("/configuracoes"), "$key"]
					).select(
					{"key":"configuracoes.$value","alias":"filial"},
					{"key":"$key.$value","alias":"configuracoess"}
					).ref();

					
					
					refNovoQuadra.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();

						var x=0;
						var posicao=null;
						$scope.configuracoess.forEach(function(obj){
							if(obj!=null && objNovo['configuracoess']!=null)
							{
								if(obj.key === objNovo['configuracoess'].key)
								{ 
									posicao=x;
								}
							}
							x++;

						});

						if(posicao==null)
							$scope.configuracoess.push(objNovo['configuracoess']);

						if(!$scope.$$phase) {
							$scope.$apply();
						}
						
					});

					

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						var x=0;
						var posicao=null;
						$scope.configuracoess.forEach(function(obj){
							if(obj!=null && objNovo['configuracoess']!=null)
							{
								if(obj.key === objNovo['configuracoess'].key)
								{ 
									posicao=x;
								}
							}
							x++;

						});
						if(posicao!=null)
							$scope.configuracoess[posicao]=objNovo['configuracoess'];

						if(!$scope.$$phase) {
							$scope.$apply();
						}
					});

					refNovoQuadra.on('child_removed', function(snap) {
						$scope.chengeFazenda($scope.fazenda);
					});



				}
			};

		//---------------------

		$scope.recuperaUsuarios = function(fazenda)
		{
			if(fazenda === null || fazenda==null) 
			{
				$scope.usuarios =null;
			}
			else
			{			
				$scope.usuarios=[];

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/usuario"),
					[baseRef.child("/usuario"), "$key"]
					).select(
					{"key":"usuario.$value","alias":"filial"},
					{"key":"$key.$value","alias":"usuarios"}
					).ref();



					refNovoQuadra.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();

						var posicao=null;
						$scope.usuarios.forEach(function(obj){
							if(obj!=null && objNovo['usuarios']!=null)
							{
								if(obj.key === objNovo['usuarios'].key)
								{ 
									posicao = $scope.usuarios.indexOf(obj);
								}
							}
						});

						if(posicao==null)
							$scope.usuarios.push(objNovo['usuarios']);

						$scope.gridUsuarios.data = $scope.usuarios;

						if(!$scope.$$phase) {
							$scope.$apply();
						}

					});



					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						var posicao=null;
						$scope.usuarios.forEach(function(obj){
							if(obj!=null && objNovo['usuarios']!=null)
							{
								if(obj.key === objNovo['usuarios'].key)
								{ 
									posicao = $scope.usuarios.indexOf(obj);
								}
							}

						});
						if(posicao!=null)
							$scope.usuarios[posicao]=objNovo['usuarios'];

						if(!$scope.$$phase) {
							$scope.$apply();
						}
					});

					refNovoQuadra.on('child_removed', function(snap) {
						var posicao=null;
						$scope.usuarios.forEach(function(obj){
							if (obj.key == snap.key()) {
								posicao = $scope.usuarios.indexOf(obj);
							}
						});
						if(posicao!=null)
							delete $scope.usuarios[posicao];

						$scope.gridUsuarios.data = $scope.usuarios;

						if(!$scope.$$phase) {
							$scope.$apply();
						}
					});



				}
			};
		//---------------------

		function recuperaConfiguracao(fazenda) {

			var baseRef = new Firebase(Constant.Url+'/configuracoes/'+fazenda.key);

			baseRef.on('child_added', function(snapshot) {

				var obj = snapshot.val();

				$scope.data=obj;

				$('#myPleaseWait').modal('hide');
				$scope.gridOptionsCulturas.data=$scope.todasCulturas;
				if (!$scope.$$phase) {
					$scope.$apply();
				}

			}, function(error) {
				console.error(error);
			});

			baseRef.on('child_changed', function(snapshot) {
				var obj = snapshot.val();

				if($scope.data.key=obj)
				{
					$scope.data=obj;
				}
				if (!$scope.$$phase) {
					$scope.$apply();
				}

			}, function(error) {
				console.error(error);
			});
		}

		//---------------------

		function recuperaCulturaQtde() {

			var baseRef = new Firebase(Constant.Url+'/cultura');
			baseRef.on('value', function(snapshot) {
				$scope.qtde_culturas= snapshot.numChildren();
				recuperaCultura();

			});
		}

		function recuperaControleacessoQtde() {

			var baseRef = new Firebase(Constant.Url+'/controleacesso');
			baseRef.on('value', function(snapshot) {
				$scope.qtde_controleacesso= snapshot.numChildren();
				recuperaControleacesso();
			});
		}

		function recuperaCultura() {

			var baseRef = new Firebase(Constant.Url+'/cultura');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.todasCulturas.push(objNovo);

				
				$scope.gridOptionsCulturas.data=$scope.todasCulturas;
				if (!$scope.$$phase) {
					$scope.$apply();
				}	

				if(verificaTermino() && !$scope.terminou)
				{
					console.log('recuperaCultura terminou()')
					
					atualizaListaFiliais();
				}					

			}, function(error) {
				console.error(error);
			});
		}

		function recuperaTodosUsuarios() {

			$('#myPleaseWait').modal('show');

			var baseRef = new Firebase(Constant.Url+'/usuario');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.todoUsuarios.push(objNovo);			


			}, function(error) {
				console.error(error);
			});
		}		

		function recuperaControleacesso() {

			$scope.todosControleacessosGeral = [];
			$scope.todosControleacessos =[];
			$scope.gridOptionsControleacesso.data=$scope.todosControleacessos;

			var baseRef = new Firebase(Constant.Url+'/controleacesso');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();

				$scope.todosControleacessosGeral.push(objNovo);

				if(objNovo.ativo==null || objNovo.ativo==false)
				{
					$scope.qtde_controleacesso --;
					if(objNovo.codigo=='001')
					{
						objMenuVazio=objNovo;
					}
					return;
				}
				else
				{
					if(objNovo.grupo!=null && objNovo.grupo==true)
					{
						$scope.qtde_controleacesso --;						
						return;
					}
					else
					{
						$scope.todosControleacessos.push(objNovo);
					}
				}

				

				
				$scope.gridOptionsControleacesso.data=$scope.todosControleacessos;
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if(verificaTermino() && !$scope.terminou)
				{
					console.log('recuperaControleacesso terminou')
					atualizaListaFiliais();
				}					

			}, function(error) {
				console.error(error);
			});
		}

		function recuperaControleacessoPorUsuario() {
			if($scope.fazenda==null) return false;
			if($scope.usuario.key==null) return false;

			var i=0
			$scope.todosControleacessos.forEach(function(controle){
				$scope.todosControleacessos[i].visualizacao= false;
				$scope.todosControleacessos[i].inclusao=false;
				$scope.todosControleacessos[i].edicao= false;
				$scope.todosControleacessos[i].exclusao= false;
				i++;
			});

			var baseRef = new Firebase(Constant.Url+'/aceemp/' + $scope.fazenda.key+'/'+$scope.usuario.key);

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.aceemps.push(objNovo);

				var posicao;
				$scope.todosControleacessos.forEach(function(controle){
					if(controle.key==objNovo.key)
					{
						posicao= $scope.todosControleacessos.indexOf(controle);
					}
				});
				if(posicao!=null)
				{
					$scope.todosControleacessos[posicao].visualizacao= objNovo.visualizacao;
					$scope.todosControleacessos[posicao].inclusao= objNovo.inclusao;
					$scope.todosControleacessos[posicao].edicao= objNovo.edicao;
					$scope.todosControleacessos[posicao].exclusao= objNovo.exclusao;
				}
				$scope.gridOptionsControleacesso.data=$scope.todosControleacessos;
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				$('#myPleaseWait').modal('hide');									

			});

			baseRef.on('child_changed', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.aceemps.push(objNovo);

				var posicao;
				$scope.todosControleacessos.forEach(function(controle){
					if(controle.key==objNovo.key)
					{
						posicao= $scope.todosControleacessos.indexOf(controle);
					}
				});
				if(posicao!=null)
				{
					$scope.todosControleacessos[posicao].visualizacao= objNovo.visualizacao;
					$scope.todosControleacessos[posicao].inclusao= objNovo.inclusao;
					$scope.todosControleacessos[posicao].edicao= objNovo.edicao;
					$scope.todosControleacessos[posicao].exclusao= objNovo.exclusao;
				}


			});
		}

		function verificaTermino()
		{

			console.log(' --------------------- ');

			console.log('todasCulturas: ' + $scope.todasCulturas.length + ' - qde: ' + $scope.qtde_culturas);
			console.log('todosControleacessos: ' + $scope.todosControleacessos.length + ' - qde: ' + $scope.qtde_controleacesso);		
			//console.log('todoUsuarios: ' + $scope.todosUsuarios.length + ' - qde: ' + $scope.qtde_usuario);

			//console.log(' --------------------- ');

			if($scope.qtde_culturas==$scope.todasCulturas.length 
				&& $scope.qtde_controleacesso== $scope.todosControleacessos.length)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		//---------------------
		$scope.getUsuarios = function(){		
			$('#modalUsuarios').modal('show');
			if (!$scope.$$phase) {
				$scope.$apply();
			}	
		};

		$scope.cancelar = function(){
			$scope.desabilitaFazenda=false;
			$scope.frmCultura.abertura = false;
			$scope.clear();
		};

		$scope.chamaEditarConxcul = function(obj){
			$scope.desabilitaFazenda=true;

			$scope.clear();

			if($scope.data.cultura!=null)
			{
				$scope.data.cultura.forEach(function(objConf){

					if(objConf.key_cultura==obj.key)
					{						
						$scope.frmCultura = objConf;
						$scope.frmCultura.abertura = true;
					}
				});
			}
			else
			{
				$scope.frmCultura.abertura = true;
			}
			
			$scope.frmCultura.key_cultura=obj.key;
		};



		//############################################################################################################################
		//############################################################################################################################
		// CONFIGURACOES
		//############################################################################################################################
		$scope.salvar = function(data){
			if($scope.fazenda==null) return false;

			var refConfiguracoes = new Firebase(Constant.Url + '/configuracoes/' + $scope.fazenda.key + '/' + $scope.data.key);

			refConfiguracoes.set($scope.data);
			Notify.successBottom('Configurações atualizadas com sucesso!');
		};


		//############################################################################################################################
		//############################################################################################################################
		// CULTURA
		//############################################################################################################################
		

		$scope.salvarConfcul = function(data){
			if($scope.frmCultura.key_cultura==null) return false;
			if($scope.fazenda==null) return false;
			if(validForm($scope.frmCultura)) return false;

			$scope.frmCultura.abertura = true;

			var refConfiguracoes = new Firebase(Constant.Url + '/configuracoes/' + $scope.fazenda.key + '/' + $scope.data.key + '/cultura/'+$scope.frmCultura.key_cultura);

			refConfiguracoes.set($scope.frmCultura);
			Notify.successBottom('Configurações relativo a cultura atualizadas com sucesso!');
		};

		//############################################################################################################################
		//############################################################################################################################
		// USUARIO X FIL
		//############################################################################################################################


		$scope.salvarUsuarioXfil = function(usuario){
			if(usuario==null) return false;
			if($scope.fazenda==null) return false;

			var refNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/usuario/'+usuario.key);
			refNovo.set(true);

			var refNovoUserXFil = new Firebase(Constant.Url + '/usuario/'+usuario.key+'/filial/'+ $scope.fazenda.key);
			refNovoUserXFil.set(true);

			objMenuVazio['key_filial'] = $scope.fazenda.key ;
			objMenuVazio['key_usuario'] = usuario.key ;

			var refAcess = new Firebase(Constant.Url + '/aceemp/' + $scope.fazenda.key + '/' + usuario.key+'/'+ objMenuVazio.key);
			refAcess.set(objMenuVazio);

			$('#modalUsuarios').modal('hide');
			
			Notify.successBottom('Usuário adicionado com sucesso!');
			usuario = null;
		};

		//############################################################################################################################
		//############################################################################################################################
		// NOVO USUÁRIO
		//############################################################################################################################


		$scope.chamaNovoUsuario = function(){		
			$('#modalNovoUsuario').modal('show');			
		};

		$scope.salvarNovoUsuario = function(data){
			if($scope.fazenda==null) return false;

			var ref = new Firebase(Constant.Url);


			$('#myPleaseWait').modal('show');

			ref.createUser({
				email: data.email,
				password : data.senha
			}, function(error, user) {
				if (error) {
					setMessageError(error);

					$('#myPleaseWait').modal('hide');
				} else {
					data['key']= user.uid;
					if(data.key==null)
					{
						Notify.errorBottom('Houve um problema ao criar o usuário. Entre em contao com a equipe do Pragueiro.');
						return;
					}
					var refNovoAuth = new Firebase(Constant.Url + '/usuarioxauth/' +data.key);
					
					refNovoAuth.set( data.key);

					data['key']= user.uid;
					var refNovo = new Firebase(Constant.Url + '/usuario/' + data.key);
					refNovo.set(data);

					var refNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/usuario/'+data.key);
					refNovo.set(true);

					var refNovoUserXFil = new Firebase(Constant.Url + '/usuario/'+data.key+'/filial/'+ $scope.fazenda.key);
					refNovoUserXFil.set(true);

					objMenuVazio['key_filial'] = $scope.fazenda.key ;
					objMenuVazio['key_usuario'] = data.key ;

					var refAcess = new Firebase(Constant.Url + '/aceemp/' + $scope.fazenda.key + '/' + data.key  +'/'+ objMenuVazio.key);
					refAcess.set(objMenuVazio);


					Notify.successBottom('Usuário criado e associado a fazenda com sucesso!');

					$('#myPleaseWait').modal('hide');
					$('#modalNovoUsuario').modal('hide');	
				}
			});

		}

		//############################################################################################################################
		//############################################################################################################################
		// ACESSOS (PERMISSOES)
		//############################################################################################################################


		$scope.gravarAceemp= function(aceemp)
		{
			if($scope.fazenda==null) return false;
			if($scope.usuario.key==null) return false;

			delete aceemp.$$hashKey;	

			aceemp['key_filial'] = $scope.fazenda.key ;
			aceemp['key_usuario'] = $scope.usuario.key ;

			var refConfiguracoes = new Firebase(Constant.Url + '/aceemp/' + $scope.fazenda.key + '/' + $scope.usuario.key+'/'+ aceemp.key);
			refConfiguracoes.set(aceemp);

			if(aceemp.visualizacao)
			{
				$scope.todosControleacessosGeral.forEach(function(obj) {
					if(aceemp.keygru==obj.key)
					{
						var aceempGrupo = clone(obj);
						aceempGrupo.visualizacao=true;

						var refConfiguracoes = new Firebase(Constant.Url + '/aceemp/' + $scope.fazenda.key + '/' + $scope.usuario.key+'/'+ aceempGrupo.key);
						refConfiguracoes.set(aceempGrupo);
					}
				});
			}
			else
			{
				var temOutraTela=false;
				$scope.aceemps.forEach(function(obj) {
					if(aceemp.key!=obj.key && aceemp.codgru == obj.codgru && (obj.grupo==false || obj.grupo==false) && obj.visualizacao)
					{
						temOutraTela=true;
					}
				});
				if(!temOutraTela)
				{
					var refConfiguracoes = new Firebase(Constant.Url + '/aceemp/' + $scope.fazenda.key + '/' + $scope.usuario.key+'/'+ aceemp.keygru);
					refConfiguracoes.remove();
				}
			}
		}

		$scope.chamaExcluirAcesso = function(){
			if($scope.exibePermissoes)
			{
				$('#modalDeleteAcesso').modal('show');
			}
		};

		$scope.excluirAcesso = function(){
			$('#modalDeleteAcesso').modal('hide');

			if( $scope.usuario==null) return false;
			if( $scope.usuario.key==null) return false;
			if($scope.fazenda==null) return false;

			var refNovo = new Firebase(Constant.Url + '/filial/' + $scope.fazenda.key + '/usuario/'+ $scope.usuario.key);
			refNovo.remove();

			var refNovoUserXFil = new Firebase(Constant.Url + '/usuario/'+ $scope.usuario.key+'/filial/'+ $scope.fazenda.key);
			refNovoUserXFil.remove();

			var refConfiguracoes = new Firebase(Constant.Url + '/aceemp/' + $scope.fazenda.key + '/' + $scope.usuario.key);
			refConfiguracoes.remove();

			Notify.successBottom('Usuário removido com sucesso!');

			$scope.exibePermissoes= false;
			return true;
		};

		$scope.cancelarUsuario = function(){
			$scope.exibePermissoes=false;
		}

		$scope.setarAcessoTotal = function (){
			if($scope.fazenda==null) return false;
			if($scope.usuario.key==null) return false;

			$scope.todosControleacessosGeral.forEach(function(obj) {
				if(obj.ativo == true)
				{
					var aceempPadrao = clone(obj);

					delete aceempPadrao.$$hashKey;	

					aceempPadrao.inclusao = true;
					aceempPadrao.visualizacao=true;
					aceempPadrao.edicao = true;
					aceempPadrao.exclusao = true;


					var refConfiguracoes = new Firebase(Constant.Url + '/aceemp/' + $scope.fazenda.key + '/' + $scope.usuario.key+'/'+ aceempPadrao.key);
					refConfiguracoes.set(aceempPadrao);
				}
			});

			Notify.successBottom('Acesso total definido para o usuário ' + $scope.usuario.nome +' com sucesso!');

		}

		$scope.retirarAcessoTotal = function (){
			if($scope.fazenda==null) return false;
			if($scope.usuario.key==null) return false;

			$scope.todosControleacessosGeral.forEach(function(obj) {
				if(obj.ativo == true)
				{
					var aceempPadrao = clone(obj);

					delete aceempPadrao.$$hashKey;	

					aceempPadrao.inclusao = false;
					aceempPadrao.visualizacao=false;
					aceempPadrao.edicao = false;
					aceempPadrao.exclusao = false;


					var refConfiguracoes = new Firebase(Constant.Url + '/aceemp/' + $scope.fazenda.key + '/' + $scope.usuario.key+'/'+ aceempPadrao.key);
					refConfiguracoes.set(aceempPadrao);
				}
			});

			Notify.successBottom('Retirado acessos do usuário ' + $scope.usuario.nome +' com sucesso!');

		}

		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		recuperaTodosUsuarios();
		recuperaCulturaQtde();
		recuperaControleacessoQtde();

		$scope.setaFazenda = function(fazenda){
			if(fazenda === null) return false;

			$scope.fazendas.forEach(function(item){
				if(item.key === fazenda.key) 	
				{
					$scope.fazenda = item;		
				}
			});

		};

		function setMessageError(message){
			Notify.errorBottom(message);
		};

		function validForm(data){			
			if(data.altura){
				if(data.altura_ocorrencia==null || data.altura_ocorrencia==''){
					setMessageError('O ocorrência de "Altura" é inválido!');
					return true;
				}
				if(data.altura_ocorrencia=='INTFIX' && (data.altura_intervalo==null || data.altura_intervalo=='')){
					setMessageError('É preciso definir o intervalo da ocorrência de "Altura"!');
					return true;
				}
			}

			if(data.quanos){
				if(data.quanos_ocorrencia==null || data.quanos_ocorrencia==''){
					setMessageError('O ocorrência de "Quantidade de nós" é inválido!');
					return true;
				}
				if(data.quanos_ocorrencia=='INTFIX' && (data.quanos_intervalo==null || data.quanos_intervalo=='')){
					setMessageError('É preciso definir o intervalo da ocorrência de "Quantidade de nós"!');
					return true;
				}
			}

			if(data.disnos){
				if(data.disnos_ocorrencia==null || data.disnos_ocorrencia==''){
					setMessageError('O ocorrência de "Distância entre de nós" é inválido!');
					return true;
				}
				if(data.disnos_ocorrencia=='INTFIX' && (data.disnos_intervalo==null || data.disnos_intervalo=='')){
					setMessageError('É preciso definir o intervalo da ocorrência de "Distância entre de nós"!');
					return true;
				}
			}

			if(data.quaast){
				if(data.quaast_ocorrencia==null || data.quaast_ocorrencia==''){
					setMessageError('O ocorrência de "Quantidade de Astes" é inválido!');
					return true;
				}
				if(data.quaast_ocorrencia=='INTFIX' && (data.quaast_intervalo==null || data.quaast_intervalo=='')){
					setMessageError('É preciso definir o intervalo da ocorrência de "Quantidade de Astes"!');
					return true;
				}
			}

			if(data.quavag){
				if(data.quavag_ocorrencia==null || data.quavag_ocorrencia==''){
					setMessageError('O ocorrência de "Quantidade de Vagem" é inválido!');
					return true;
				}
				if(data.quavag_ocorrencia=='INTFIX' && (data.quavag_intervalo==null || data.quavag_intervalo=='')){
					setMessageError('É preciso definir o intervalo da ocorrência de "Quantidade de Vagem"!');
					return true;
				}
			}

			if(data.altprivag){
				if(data.altprivag_ocorrencia==null || data.altprivag_ocorrencia==''){
					setMessageError('O ocorrência de "Altura primeira Vagem" é inválido!');
					return true;
				}
				if(data.altprivag_ocorrencia=='INTFIX' && (data.altprivag_intervalo==null || data.altprivag_intervalo=='')){
					setMessageError('É preciso definir o intervalo da ocorrência de "Altura primeira Vagem"!');
					return true;
				}
			}

			if(data.quagravag){
				if(data.quagravag_ocorrencia==null || data.quagravag_ocorrencia==''){
					setMessageError('O ocorrência de "Quantidade Grãos por Vagem" é inválido!');
					return true;
				}
				if(data.quagravag_ocorrencia=='INTFIX' && (data.quagravag_intervalo==null || data.quagravag_intervalo=='')){
					setMessageError('É preciso definir o intervalo da ocorrência de "Quantidade Grãos por Vagem"!');
					return true;
				}
			}

			return false;
		};

		function isEmail(email){
			er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/;
			return !!er.exec(email);
		};

		function validFormUsuario(data){

			if(data.nome == ''){
				setMessageError('O campo nome é inválido!');
				return true;
			}


			if(data.senha === ''){
				setMessageError('O campo senha é inválido!');
				return true;
			}

			if(data.senha == ''){
				setMessageError('O campo senha é obrigatório!');
				return true;
			}

			if(data.senha.length<6 ){
				setMessageError('É necessário uma senha com no mínimo 6 caracteres!');
				return true;
			}

			if(data.telefone === '' ||   data.telefone.length < 14){
				setMessageError('O campo telefone é inválido!');
				return true;
			}
			if(data.cidade === ''){
				setMessageError('O campo cidade é inválido!');
				return true;
			}

			return false;
		};

		$scope.clear = function(){
			$scope.frmCultura= {
				abertura : false,
				key_cultura:'',
				altura : false,
				altura_ocorrencia : '',
				//altura_intervalo : '',
				altura_estagio : false,
				quanos : false,
				quanos_ocorrencia : '',
				//quanos_intervalo : '',
				quanos_estagio : false,
				disnos : false,
				disnos_ocorrencia : '',
				//disnos_intervalo : '',
				disnos_estagio : false,
				quaast : false,
				quaast_ocorrencia : '',
				//quaast_intervalo : '',
				quaast_estagio : false,
				quavag : false,
				quavag_ocorrencia : '',
				//quavag_intervalo : '',
				quavag_estagio : false,
				altprivag : false,
				altprivag_ocorrencia : '',
				//altprivag_intervalo : '',
				altprivag_estagio : false,
				quagravag : false,
				quagravag_ocorrencia : '',
				//quagravag_intervalo : '',
				quagravag_estagio : false
			}
		};


	}

	function clone(obj) {
		if (null == obj || "object" != typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}

}());