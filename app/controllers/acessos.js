(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('acessoCtrl', acessoCtrl);

	acessoCtrl.$inject = 
	['$scope', '$firebase', '$firebaseObject', '$firebaseArray', 'Constant', 'Session', 'Notify'];

	function acessoCtrl($scope,  $firebase, $firebaseObject, $firebaseArray, Constant, Session, Notify) {

		angular.extend($scope, {
			edit: false,
			acessos: [],
			data: {}
		});



		$scope.clear = function(){
			$scope.data = {};
			angular.extend($scope.data, {
				nome: '',
				razaosocial: '',
				telefone: '',
				website: '',
				cidade: '',
				email: '',
				key: '',
				acessos:[],
				quadras:[],
				filiais:[],
				todosUsuarios:[],
				todosFiliais:[],
				filialxusuarios:[], novoarray:[],
				key_usuario:''
			});
		};
		
		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "acesso.data", displayName: "Data",  type: 'date', cellFilter: 'date:"dd/MM/yyyy HH:mm:ss"', width: 150 },
			{ field: "acesso_web.data", displayName: "Data",  type: 'date', cellFilter: 'date:"dd/MM/yyyy HH:mm:ss"', width: 150 },
			{ field: "acesso.versao", displayName: "Ver", width: 50 },
			{ field: "usuario.nome", displayName: "Nome", width: 100 },
			{ field: "usuario.email", displayName: "E-mail", width: 170 },
			{ field: "usuario.senha", displayName: "Senha", width: 80 },
			{ field: "tipo", displayName: "Tipo", width: 80 },
			]
		};

		$scope.toggleMultiSelect = function() {
			$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		};


		$scope.gridOptions.onRegisterApi = function(gridApi){
      //set gridApi on scope
      $scope.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged($scope,function(row){
      	var msg = 'row selected ' + row.isSelected;
      	console.log(msg + '- ' + row);

      	$scope.myHTML=row.entity.texto;
      	$scope.data = row.entity;
      });

      gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
      	var msg = 'rows changed ' + rows.length;
      	//$log.log(msg);
      });
  };



  //atualizaListaFiliais();
		//atualizaTodasQuadras();

		var refUser = new Firebase(Constant.Url + '/usuarioxauth/'+Session.getUser().uid);		
		var obj = $firebaseObject(refUser);
		var key_usuario;
		obj.$loaded().then(function() {
			key_usuario= obj.$value;

		});
		
		$scope.gerarConsulta = function()
		{
			$('#myPleaseWait').modal('show');

			$scope.acessos=[];


			var baseRef = new Firebase(Constant.Url);
			var refNovo = new Firebase.util.NormalizedCollection(
				baseRef.child("/informacoes"),
				baseRef.child("/usuario")
				).select(
				{"key":"informacoes.$value","alias":"informacoes"},
				{"key":"usuario.$value","alias":"usuario"}
				).ref();

				refNovo.on('child_added', function(snap) {

					$('#myPleaseWait').modal('hide');
					var obj= snap.val();

					var count_usuarios=0;

					if(obj.informacoes.acessos!=null)
					{
						var array = $.map(obj.informacoes.acessos, function(value, index) {
							return [value];
						})

						var obj_puro=array[array.length-1];


						var obj_acesso=[];
						obj_acesso['acesso']=obj_puro;
						var data_datetime =new Date(obj_puro.data);
						obj_acesso['data']=data_datetime;
						obj_acesso['versao']=obj_puro.versao;
						if(obj_puro.tipo==null)
						{
							obj_acesso['tipo']='APP';
						}
						else
						{
							obj_acesso['tipo']='WEB';
						}

						obj_acesso['data_str']= new Date(data_datetime);
						if(obj_acesso['data_str']> $scope.filtro.data)
						{
							obj_acesso['usuario']=obj.usuario;							

							$scope.acessos.push(obj_acesso);
							$scope.acessos.sort(compare);
						}

					}

					if(obj.informacoes.acessos_web!=null)
					{
						var array2 = $.map(obj.informacoes.acessos_web, function(value, index) {
							return [value];
						})


						var obj_puro2=array2[array2.length-1];
						var obj_acesso_web=[];
						obj_acesso_web['acesso_web']=obj_puro2;
						var data_datetime =new Date(obj_puro2.data);
						obj_acesso_web['data']=data_datetime;
						obj_acesso_web['versao']=obj_puro2.versao;
						if(obj_puro2.tipo==null)
						{
							obj_acesso_web['tipo']='APP';
						}
						else
						{
							obj_acesso_web['tipo']='WEB';
						}

						obj_acesso_web['data_str']= new Date(data_datetime);
						if(obj_acesso_web['data_str']> $scope.filtro.data)
						{
							obj_acesso_web['usuario']=obj.usuario;							

							$scope.acessos.push(obj_acesso_web);
							$scope.acessos.sort(compare);
						}
						
					}
					
					$scope.gridOptions.data = $scope.acessos;
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				});

				refNovo.on('child_changed', function(snap) {

				});

				refNovo.on('child_removed', function(snap) {

				});
			}

			function atualizaTodasQuadras()
			{
				var refQuadra = new Firebase(Constant.Url + '/quadra');	
				var obj2 = $firebaseObject(refQuadra);
				
				obj2.$loaded().then(function() {
					var qd=obj2;
					delete qd.$$conf;
					delete qd.$id;
					delete qd.$priority;
					$scope.quadras=qd;
					/*
					for(var propertyName in qd) {
						console.log('Nome quadra: ' + qd[propertyName].nome )
						
						for(var quadraDentro in qd.propertyName) {
							console.log('Nome quadra: ' + quadraDentro.nome )
						}
					}
					*/

				});

				var refFilial = new Firebase(Constant.Url + '/filial');	
				var obj3 = $firebaseObject(refFilial);
				
				obj3.$loaded().then(function() {
					var qd=obj3;
					delete qd.$$conf;
					delete qd.$id;
					delete qd.$priority;

					$scope.filiais=qd;
					/*
					for(var propertyName in qd) {
						console.log('Nome quadra: ' + qd[propertyName].nome )
						
						for(var quadraDentro in qd.propertyName) {
							console.log('Nome quadra: ' + quadraDentro.nome )
						}
					}
					*/

				});
			}

			$scope.getDetalhes = function(data){
				$scope.myHTML=data.texto;
				$scope.data = data;
			};

			$scope.setarConsertado = function(data){
				console.log('teste');

				data.acesso['usuario_concerto']= key_usuario;
				data.acesso['conserto_data'] = new Date().getTime();;
				var refNovo = new Firebase(Constant.Url + '/informacoes/' + data.usuario.key + '/acessos/'+data.acesso.key);
				refNovo.set(data.acesso);				

				Notify.successBottom('Setado com sucesso!');
				$scope.clear();
				
			};

			$scope.excluir = function(data){
				console.log('teste');
				
				var refVariedadeNovo = new Firebase(Constant.Url + '/informacoes/' + data.usuario.key + '/acessos/' + data.acesso.key);
				refVariedadeNovo.remove();

				Notify.successBottom('Excluído com sucesso!');
				$scope.clear();

			};

			$scope.excluirLote = function(){
				var arrayAcessos = $scope.gridApi.selection.getSelectedRows();
				for(var acesso in arrayAcessos) 
				{
					var caminho= Constant.Url + '/informacoes/' + arrayAcessos[acesso].usuario.key + '/acessos/' + arrayAcessos[acesso].acesso.key ;
					console.log(caminho);
					var refVariedadeNovo = new Firebase(caminho);
					refVariedadeNovo.remove();
				}
				Notify.successBottom('Excluído com sucesso!');
			};


			function compare(a,b) {
				if (a.data < b.data)
					return -1;
				if (a.data > b.data)
					return 1;

				return 0;
			}
		}


	}());