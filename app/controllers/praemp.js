(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('praempCtrl', praempCtrl);

	praempCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify', '$interval'];

	function praempCtrl($scope, Constant, Session, $firebaseArray, $firebaseObject, Notify, $interval) {

		angular.extend($scope, {
			edit: false,			
			
			data: {
				ativo:true,
				tamanhos:false,
				texto: ' ',
				key_praga:'40',
				valor:[],
				tamanho:[]
			},
			frmTamanho: {
				key:'',
				nome:'',
				ativo:true,
				ordem:1
			},
			frmValor: {
				key:'',
				nome:'',
				ativo:true,
				ordem:1
			}			
		});

		$scope.todosFiliaisGeral=[];
		var baseRef1 = new Firebase(Constant.Url+'/filial');

		baseRef1.on('child_added', function(snapshot1) {

			var objNovo = snapshot1.val();
			$scope.todosFiliaisGeral.push(objNovo);
			


		});


		$scope.tipos = [{nome:'Praga', key:'PRA'},
		{nome:'Doença', key:'DOE'}];
		$scope.todasPragas= [];
		$scope.todasPragasPadrao= [];
		$scope.todasClapras= [];

		$scope.qtde_clapras=0;
		$scope.qtde_qtde_praemp=0;
		$scope.qtde_pragas=0;

		$scope.tamanhos=[];
		$scope.valor=[];
		recuperaQtdePragaPadrao();


		$scope.clonar = function(){		

			var i=0;
			$scope.todosFiliaisGeral.forEach(function(fazenda){
				i++;
				if(fazenda.key!=null && fazenda.key!='-KtH3-hl4fZVNnCHZnFn') //&& i>=450 && i<500)
				{
					if(fazenda.key=='-KgRvI7Rhsi236Kwu4ZI')
					{
						console.log(i);
					}
					console.log(fazenda.key + ' ' + i);
						//console.log(i); -KgleULakT5f6ZrFRvW2

/*

						$scope.todasPragas.forEach(function(obj){
							if(obj.key!=null)
							{

								var objClonado= obj;
								if(fazenda.key=='-KgRvI7Rhsi236Kwu4ZI')
								{
									console.log(Constant.Url + '/praemp/'+fazenda.key+'/' + objClonado.key);
								}
								delete 	objClonado.$$hashKey;
								var refNovo = new Firebase(Constant.Url + '/praemp/'+fazenda.key+'/' + objClonado.key);
								objClonado['key_filial']=fazenda.key;
								refNovo.set(objClonado);

								var refFilial = new Firebase(Constant.Url + '/filial/' +fazenda.key+'/praemp/'+ objClonado.key );
								refFilial.set(true);
							}
						});

						*/						
						$scope.todasClapras.forEach(function(obj){
							if(obj.key!=null)
							{
								var objClonado= obj;
								delete 	objClonado.$$hashKey;
								var refNovo = new Firebase(Constant.Url + '/clapraemp/'+fazenda.key+'/' + objClonado.key);
								objClonado['key_filial']=fazenda.key;
								refNovo.set(objClonado);

								var refFilial = new Firebase(Constant.Url + '/filial/' +fazenda.key+'/clapraemp/'+ objClonado.key );
								refFilial.set(true);
							}
						});



						var objClonado={};
						var refNovo = new Firebase(Constant.Url + '/configuracoes/'+fazenda.key+'/1');
						objClonado['key']='1';
						objClonado['key_filial']=fazenda.key;
						objClonado['ponman']= false;
						if(fazenda.distancia_pontos!=null)
						{
							objClonado['distancia_pontos']= fazenda.distancia_pontos;
						}
						else
						{
							objClonado['distancia_pontos']= 20;
						}
						if(fazenda.variacao!=null)
						{
							objClonado['variacao']= fazenda.variacao;
						}

						refNovo.set(objClonado);
						
					}
					else
					{

					}
				});
			console.log(i);
			Notify.successBottom('Praga clonada com sucesso!');
		};

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "descricao", displayName: "Descrição", width: 240 },
			{ field: "ativo", displayName: "Ativo", width: 70,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
			{ field: "postam", displayName: "Tamanhos", width: 100,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValueTamanhos(row)}}</div>" },
			{ field: "valpre", displayName: "Valores", width: 100,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValueValores(row)}}</div>" }


			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				},
				mapValueTamanhos: function(row) {
					return row.entity.postam ? 'Sim' : 'Não';
				},
				mapValueValor: function(row) {
					return row.entity.valpre ? 'Sim' : 'Não';
				}
			}

		};

		$scope.toggleMultiSelect = function() {
			$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		};


		$scope.gridOptions.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.chamaEditar(row.entity);
			});
		};


		$scope.gridOptionsTamanhos = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "ordem", displayName: "Ordem", width: 100 , sort:{ direction: 'asc', priority: 0 }},
			{ field: "nome", displayName: "Nome", sort:{ direction: 'asc', priority: 1 }, width: 240 },	
			{ field: "ativo", displayName: "Ativo", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" }


			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				}
			}

		};

		$scope.gridOptionsTamanhos.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.ChamarEditarTamanho(row.entity);
			});
		};


		$scope.gridOptionsValor = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "ordem", displayName: "Ordem", width: 100 , sort:{ direction: 'asc', priority: 0 }},
			{ field: "nome", displayName: "Nome", sort:{ direction: 'asc', priority: 1 }, width: 240 },	
			{ field: "valor", displayName: "Valor" },	
			{ field: "ativo", displayName: "Ativo", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" }

			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				}
			}

		};

		$scope.gridOptionsValor.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.ChamarEditarValor(row.entity);
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
							$scope.fazenda=$scope.fazendas[0];
							$scope.chengeFazenda($scope.fazendas[0]);							
						}
						i++;
						if(!$scope.$$phase) {
							$scope.$apply();
						}
					});
					
					if($scope.fazendas.length==0)
					{
						$('#myPleaseWait').modal('hide');
					}
			});// final do load
		}		

		//---------------------
		$scope.chengeFazenda = function(fazenda)
		{
			if(fazenda === null) 
			{
				$scope.todasPragas =null;
			}
			else
			{		

				
				if(fazenda.clapraemp!=null)
				{
					$scope.qtde_clapras = castObjToArray(fazenda.clapraemp).length;
					recuperaClapra(fazenda.key);
				}
				if(fazenda.praemp!=null)
				{
					$scope.qtde_praemp = castObjToArray(fazenda.praemp).length;
				}
				else
				{
					$scope.qtde_praemp=0;
				}

			}
		};

		function recuperaQtdePragaPadrao() {

			var baseRef = new Firebase(Constant.Url+'/praga');
			baseRef.on('value', function(snapshot2) {
				$scope.qtde_pragas= snapshot2.numChildren();
				if(	$scope.qtde_pragas==0)
				{
					atualizaListaFiliais();
				}
				else
				{				
					recuperaPragasPadrao();
				}
			});
		}

		//---------------------
		function recuperaPragasPadrao() {

			var baseRef2 = new Firebase(Constant.Url+'/praga');

			baseRef2.on('child_added', function(snapshot3) {
				console.log('add praga');
				var objNovo3 = snapshot3.val();
				$scope.todasPragasPadrao.push(objNovo3);		

				if(	$scope.qtde_pragas==$scope.todasPragasPadrao.length)
				{
					atualizaListaFiliais();
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}			

			}, function(error) {
				console.error(error);
			});
		}

		//---------------------
		$scope.buscaPragas = function(fazenda)
		{
			if(fazenda === null) 
			{
				$scope.todasPragas =null;
			}
			else
			{			

				$scope.todasPragas=[];

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/praemp"),
					[baseRef.child("/praemp/"+fazenda.key), "$key"]
					).select(
					{"key":"praemp.$value","alias":"filial"},
					{"key":"$key.$value","alias":"praemps"}
					).ref();


					var i=1;
					refNovoQuadra.on('child_added', function(snap) {

						var objNovo= snap.val();
						$scope.todasPragas.push(objNovo['praemps']);
						if(!$scope.$$phase) {
							$scope.$apply();
						}
						$scope.gridOptions.data = $scope.todasPragas;

						if($scope.todasPragas.length==$scope.qtde_praemp)
						{
							$('#myPleaseWait').modal('hide');
						}
					});

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo = snap.val();
						var posicao = null;
						$scope.todasPragas.forEach(function(obj) {
							if (obj.key === objNovo['praemps'].key) {
								posicao = $scope.todasPragas.indexOf(obj);
							}
						});
						if (posicao != null)
							$scope.todasPragas[posicao] = objNovo['praemps'];

						if (!$scope.$$phase) {
							$scope.$apply();
						}
					});

					refNovoQuadra.on('child_removed', function(snap) {
						var posicao = null;
						$scope.todasPragas.forEach(function(obj) {
							if (obj.key == snap.key()) {
								posicao = $scope.todasPragas.indexOf(obj);
							}
						});
						if (posicao != null)
							delete $scope.todasPragas[posicao];

						$scope.gridOptions.data = $scope.todasPragas;
					});
				}
			};

		//---------------------
		function recuperaClapra(key_fazenda) {

			var baseRef2 = new Firebase(Constant.Url+'/clapraemp/'+key_fazenda);

			baseRef2.on('child_added', function(snapshot3) {

				var objNovo3 = snapshot3.val();
				$scope.todasClapras.push(objNovo3);		

				if(	$scope.qtde_clapras-1==$scope.todasClapras.length)
				{
					$scope.buscaPragas($scope.fazenda);
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}			

			}, function(error) {
				console.error(error);
			});
		}

		//############################################################################################################################
		//############################################################################################################################
		// Praga
		//############################################################################################################################


		$scope.salvarPraga = function(data){
			if(validForm(data)) return false;
			if($scope.fazenda==null) return false;	

			delete data.$$hashKey;	

			var refNovo = new Firebase(Constant.Url + '/praemp/' +$scope.fazenda.key+'/');
			data.key=refNovo.push().key();

			var refPraemp = new Firebase(Constant.Url + '/praemp/' +$scope.fazenda.key+'/'+ data.key );
			refPraemp.set(data);

			var refFilial = new Firebase(Constant.Url + '/filial/' +$scope.fazenda.key+'/praemp/'+ data.key );
			refFilial.set(true);

			$scope.clear();

		};

		$scope.editarPraga = function(data){
			if(validForm(data)) return false;
			if($scope.fazenda==null) return false;	

			delete data.$$hashKey;	
			if(data.img == null || data.img == '')
			{
				delete data.img;	
			}

			var tamanhos={};
			$scope.tamanhos.forEach(function(obj){
				tamanhos[obj.key]={};
				tamanhos[obj.key]=obj;	
				delete 	tamanhos[obj.key].$$hashKey;
			});

			delete data.tamanho;

			data.tamanho=tamanhos;


			var valores={};
			$scope.valor.forEach(function(obj){
				valores[obj.key]={};
				valores[obj.key]=obj;	
				delete 	valores[obj.key].$$hashKey;
			});

			delete data.valor;

			data.valor=valores;

			var refNovo = new Firebase(Constant.Url + '/praemp/' +$scope.fazenda.key + '/'+ data.key );
			refNovo.set(data);

			Notify.successBottom('Praga salva com sucesso!');

			
			$scope.clear();
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
		};	

		$scope.chamaEditar = function(praemp){	
			$scope.data = clone(praemp);
			if(praemp.tamanho!=null)
			{
				$scope.tamanhos=(castObjToArray(praemp.tamanho));
			}
			else
			{
				$scope.data.tamanhos=[];
				$scope.tamanhos=[];
			}
			if(praemp.valor!=null)
			{
				$scope.valor=(castObjToArray(praemp.valor));
			}
			else
			{
				$scope.data.valor=[];
				$scope.valor=[];
			}

			$scope.clearFormTamanho();
			$scope.clearFormValor();

			$scope.gridOptionsTamanhos.data=$scope.tamanhos;
			$scope.gridOptionsValor.data=$scope.valor;

			if(!$scope.$$phase) {
				$scope.$apply();
			}

			$scope.edit = true;
		};

		$scope.excluir = function(){
			$('#modalDelete').modal('show');
		};

		$scope.excluirPraga = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null)
			{					
				if($scope.fazenda==null) return false;		

				var refEquipeNovo = new Firebase(Constant.Url + '/praga/'+ $scope.fazenda.key + '/'+objeto.key);
				refEquipeNovo.remove();

				var refFilial = new Firebase(Constant.Url + '/filial/'+ $scope.fazenda.key + '/praemp/'+objeto.key);
				refFilial.remove();	

				Notify.successBottom('Praga removida com sucesso!');
				
				$scope.cancelar();

				var posicao = null;
				$scope.todasPragas.forEach(function(obj) {
					if (obj.key === objeto.key) {
						posicao = 	$scope.todasPragas.indexOf(obj);
					}

				});
				if (posicao != null)
					delete $scope.todasPragas[posicao];



			}
			return true;

		};

		//--
		$scope.chengePragaPadrao = function(data)
		{
			if(data.key_praga==null || data.key_praga!='')
			{
				var posicao;
				$scope.todasPragasPadrao.forEach(function(obj) {
					if (obj.key!=null && obj.key == data.key_praga) {
						posicao = $scope.todasPragasPadrao.indexOf(obj);
					}
				});
				if (posicao != null) {
					var padraPadrao = $scope.todasPragasPadrao[posicao];	

					$scope.data.nome_cientifico=padraPadrao.nome_cientifico;
					$scope.data.img=padraPadrao.img;
					$scope.data.texto=padraPadrao.texto;
				}
			}
			else
			{
				$scope.data.nome_cientifico='';
				$scope.data.img='';
				$scope.data.texto='';
			}
		}

		//############################################################################################################################
		//############################################################################################################################
		//TAMANHO
		//############################################################################################################################


		$scope.ChamarEditarTamanho = function(tamanho)
		{
			$scope.frmTamanho = clone(tamanho);
			$scope.edit_tamanho=true;

		}

		$scope.atualizarTamanho = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			if(validFormTamanho($scope.frmTamanho)) return false;
			if($scope.fazenda==null) return false;	


			var tamObj = clone($scope.frmTamanho);
			delete tamObj.$$hashKey;
			var refTamanho = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+ '/'+$scope.data.key+'/tamanho/'+tamObj.key);
			refTamanho.set(tamObj);

			$scope.data.tamanho[tamObj.key]=tamObj;
			var posicao;
			var x=0;
			$scope.tamanhos.forEach(function(obj) {
				if (obj.key!=null && obj.key == tamObj.key) {
					posicao = $scope.tamanhos.indexOf(obj);
				}
				x++;
			});
			if (posicao != null) {
				$scope.tamanhos[posicao] = tamObj;				
			}

			Notify.successBottom('Tamanho atualizado com sucesso!');

			$scope.clearFormTamanho();
			$scope.edit_tamanho= false;
		}

		$scope.salvarTamanho = function()
		{
			if($scope.data==null || $scope.data.key==null) return;
			if($scope.fazenda==null) return false;	

			if(validFormTamanho($scope.frmTamanho)) return false;

			var tamObj = clone($scope.frmTamanho);
			delete tamObj.$$hashKey;
			var refTamanho = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/tamanho/');
			tamObj.key = refTamanho.push().key();

			var refTamanhoNovo = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/tamanho/'+tamObj.key);
			refTamanhoNovo.set(tamObj);


			var refPraga = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/postam');
			refPraga.set(true);
			$scope.data.postam=true;
			
			if($scope.data.tamanho!=null)
			{
				if($scope.data.tamanho[tamObj.key]!=null)
				{
					$scope.data.tamanho[tamObj.key]=tamObj;
				}
				else
				{
					if(Array.isArray($scope.data.tamanho))
					{
						$scope.data.tamanho.push(tamObj);
					}
					else
					{
						$scope.data.tamanho= castObjToArray($scope.data.tamanho);
						$scope.data.tamanho.push(tamObj);
					}
				}
			}
			else
			{
				$scope.data.tamanho=[];
				$scope.data.tamanho.push(tamObj);
			}


			$scope.tamanhos.push(tamObj);

			
			Notify.successBottom('Tamanho inserido com sucesso!');

			$scope.clearFormTamanho();
			$scope.edit_tamanho= false;
		}

		$scope.cancelarTamanho = function()
		{		
			$scope.clearFormTamanho();
			$scope.edit_tamanho = false;
		}

		$scope.questionaExcluirTamanho = function()
		{
			if ($scope.frmTamanho.key != null) {
				$('#modalDeleteTamanho').modal('show');
			} 
		}

		$scope.excluirTamanho = function()
		{
			if($scope.data==null || $scope.data.key==null) return;
			if($scope.fazenda==null) return false;	

			var tamObj = clone($scope.frmTamanho);
			delete tamObj.$$hashKey;
			var refTamanho = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/tamanho/'+tamObj.key);
			refTamanho.remove();

			delete $scope.data.tamanho[tamObj.key]
			var posicao;
			var x=0;
			$scope.tamanhos.forEach(function(obj) {
				if (obj.key!=null && obj.key == tamObj.key) {
					posicao = $scope.tamanhos.indexOf(obj);
				}
				x++;
			});
			if (posicao != null) {
				delete $scope.tamanhos[posicao];	
				$scope.tamanhos.remove(posicao);	
			}


			if($scope.tamanhos.count==0)
			{
				var refPraga = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/postam');
				refPraga.set(false);
				$scope.data.postam=false;
			}


			$('#modalDeleteTamanho').modal('hide');

			Notify.successBottom('Tamanho removido com sucesso!');

			$scope.clearFormTamanho();
			$scope.edit_tamanho= false;

		}

		//############################################################################################################################
		//############################################################################################################################
		//TAMANHO
		//############################################################################################################################


		$scope.ChamarEditarValor = function(valor)
		{
			$scope.frmValor = clone(valor);
			$scope.edit_valor=true;

		}

		$scope.atualizarValor = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			if(validFormValor($scope.frmValor)) return false;
			if($scope.fazenda==null) return false;	

			var tamObj = clone($scope.frmValor);
			delete tamObj.$$hashKey;
			var refValor = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/valor/'+tamObj.key);
			refValor.set(tamObj);

			$scope.data.valor[tamObj.key]=tamObj;
			var posicao;
			var x=0;
			$scope.valor.forEach(function(obj) {
				if (obj.key!=null && obj.key == tamObj.key) {
					posicao = $scope.valor.indexOf(obj);
				}
				x++;
			});
			if (posicao != null) {
				$scope.valor[posicao] = tamObj;				
			}

			Notify.successBottom('Valores atualizado com sucesso!');

			$scope.clearFormValor();
			$scope.edit_valor = false;
		}

		$scope.salvarValor = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			if(validFormValor($scope.frmValor)) return false;
			if($scope.fazenda==null) return false;	

			var tamObj = clone($scope.frmValor);
			delete tamObj.$$hashKey;
			var refValor = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/valor/');
			tamObj.key = refValor.push().key();

			var refValorNovo = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/valor/'+tamObj.key);
			refValorNovo.set(tamObj);


			var refPraga = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/valpre');
			refPraga.set(true);
			$scope.data.valpre=true;
			
			if($scope.data.valor!=null)
			{
				if($scope.data.valor[tamObj.key]!=null)
				{
					$scope.data.valor[tamObj.key]=tamObj;
				}
				else
				{
					if(Array.isArray($scope.data.valor))
					{
						$scope.data.valor.push(tamObj);
					}
					else
					{
						$scope.data.valor= castObjToArray($scope.data.valor);
						$scope.data.valor.push(tamObj);
					}				
				}
			}
			else
			{
				$scope.data.valor=[];
				$scope.data.valor.push(tamObj);
			}		

			$scope.valor.push(tamObj);
			
			Notify.successBottom('Valores inserido com sucesso!');

			$scope.clearFormValor();
			$scope.edit_valor = false;
		}

		$scope.cancelarValor = function()
		{		
			$scope.clearFormValor();
			$scope.edit_valor = false;
		}

		$scope.questionaExcluirValor = function()
		{
			if ($scope.frmValor.key != null) {
				$('#modalDeleteValor').modal('show');
			} 
		}

		$scope.excluirValor = function()
		{
			if($scope.data==null || $scope.data.key==null) return;
			if($scope.fazenda==null) return false;	

			var tamObj = clone($scope.frmValor);
			delete tamObj.$$hashKey;
			var refValor = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/valor/'+tamObj.key);
			refValor.remove();

			delete $scope.data.valor[tamObj.key]
			var posicao;
			var x=0;
			$scope.valor.forEach(function(obj) {
				if (obj.key!=null && obj.key == tamObj.key) {
					posicao = $scope.valor.indexOf(obj);
				}
				x++;
			});
			if (posicao != null) {
				delete $scope.valor[posicao];		
			}


			if($scope.valor.length==0)
			{
				var refPraga = new Firebase(Constant.Url + '/praemp/'+$scope.fazenda.key+'/'+$scope.data.key+'/valpre');
				refPraga.set(false);
				$scope.data.valpre=false;
			}

			$('#modalDeleteValor').modal('hide');

			Notify.successBottom('Valores removido com sucesso!');

			$scope.clearFormValor();
			$scope.edit_valor = false;

		}

		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################


		function setMessageError(message){
			Notify.errorBottom(message);
		};

		function validForm(data){
			
			if(data.nome_cientifico == null){
				setMessageError('O campo nome_cientifico é inválido!');
				return true;
			}
			if(data.descricao==null || data.descricao === ''){
				setMessageError('O campo descrição é inválido!');
				return true;
			}
			if(data.ativo === ''){
				setMessageError('O campo ativo é inválido!');
				return true;
			}
			if(data.tipo==null || data.tipo == ''){
				setMessageError('O campo tipo é obrigatório!');
				return true;
			}
			if(data.key_clapra==null || data.key_clapra==''){
				setMessageError('O campo Classe é obrigatório!');
				return true;
			}
			if(data.key_praga==null || data.key_praga==''){
				setMessageError('O campo Pragra Padrão é obrigatório!');
				return true;
			}
			return false;
		};


		function validFormTamanho(data){
			if(data.nome == null || data.nome==''){
				setMessageError('O campo nome é obrigatório!');
				return true;
			}
			if(data.ordem == null || (data.ordem=='' && data.ordem!=0)){
				setMessageError('O campo ordem é obrigatório!');
				return true;
			}
			
			return false;
		};


		function validFormValor(data){
			if(data.nome == null || data.nome==''){
				setMessageError('O campo nome é obrigatório!');
				return true;
			}
			if(data.ordem == null || (data.ordem=='' && data.ordem!=0)){
				setMessageError('O campo ordem é obrigatório!');
				return true;
			}
			if(data.valor == null || (data.valor=='' && data.valor!=0)){
				setMessageError('O campo valor é obrigatório!');
				return true;
			}
			return false;
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

		$scope.clearFormTamanho= function(){
			$scope.frmTamanho==null;
			$scope.frmTamanho.nome='';
			$scope.frmTamanho.key='';
			$scope.frmTamanho.ativo=true;
			if($scope.tamanhos!=null)
			{
				$scope.frmTamanho.ordem = $scope.tamanhos.length +1 ;
			}
			else
			{
				$scope.frmTamanho.ordem = 1 ;
			}
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

		$scope.clearFormValor= function(){
			$scope.frmValor==null;
			$scope.frmValor.nome='';
			$scope.frmValor.key='';
			$scope.frmValor.ativo=true;
			if($scope.valor!=null)
			{
				$scope.frmValor.ordem = $scope.valor.length +1 ;
			}
			else
			{
				$scope.frmValor.ordem = 1 ;
			}
			return true;
		};

		$scope.clear = function(){
			
			$scope.data.key='';
			$scope.data.descricao='';
			$scope.data.nome_cientifico='';
			$scope.data.img='';
			//$scope.data.key_clapra='';
			$scope.data.key_praga='40';
			$scope.data.ativo=true;
			$scope.data.codigo='';
			$scope.data.tamanho=[];
			$scope.data.valor=[];
			$scope.data.postam=false;
			$scope.data.valpre=false;

			$scope.tamanhos=[];
			$scope.gridOptionsTamanhos.data=$scope.tamanhos;

			$scope.valor=[];
			$scope.gridOptionsValor.data=$scope.valor;

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