(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('erroCtrl', erroCtrl);

	erroCtrl.$inject = 
	['$scope', '$firebase', '$firebaseObject', '$firebaseArray', 'Constant', 'Session', 'Notify'];

	function erroCtrl($scope,  $firebase, $firebaseObject, $firebaseArray, Constant, Session, Notify) {

		angular.extend($scope, {
			edit: false,
			erros: [],
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
				erros:[],
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
			{ field: "erro.data", displayName: "Data",  type: 'date', cellFilter: 'date:"dd/MM/yyyy HH:mm:ss"', width: 150 },
			{ field: "erro.versao", displayName: "Ver", width: 50 },
			{ field: "usuario.nome", displayName: "Nome", width: 100 },
			{ field: "usuario.email", displayName: "E-mail", width: 170 },
			{ field: "usuario.senha", displayName: "Senha", width: 80 },
			{ field: "erro.conserto_data", displayName: "Consertado em", type: 'date', cellFilter: 'date:"dd/MM/yyyy HH:mm:ss"', width: 150 }
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



  atualizaListaFiliais();
		//atualizaTodasQuadras();

		var refUser = new Firebase(Constant.Url + '/usuarioxauth/'+Session.getUser().uid);		
		var obj = $firebaseObject(refUser);
		var key_usuario;
		obj.$loaded().then(function() {
			key_usuario= obj.$value;

		});
		
		function atualizaListaFiliais()
		{
			$('#myPleaseWait').modal('show');

			$scope.erros=[];
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

					for(var propertyName in obj.informacoes.erros) {
						var obj_erro=[];
						obj.informacoes.erros[propertyName]['key']=propertyName;
						obj_erro['erro']=obj.informacoes.erros[propertyName];
						var data_datetime =new Date(obj.informacoes.erros[propertyName].data);
						obj_erro['data']=data_datetime;
						obj_erro['data_str']= new Date(data_datetime);
						if(obj_erro['data_str']> new Date('2017-07-27'))
						{
							obj_erro['usuario']=obj.usuario;
							if(obj.informacoes.erros[propertyName].erro!=null)
							{
								obj_erro['texto']=obj.informacoes.erros[propertyName].erro.replace('\n', '<br>');
							}
							else
							{
								obj_erro['texto']=obj.informacoes.erros[propertyName].erro;
							}

							$scope.erros.push(obj_erro);
							$scope.erros.sort(compare);
						}
					}
					$scope.gridOptions.data = $scope.erros;
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

				data.erro['usuario_concerto']= key_usuario;
				data.erro['conserto_data'] = new Date().getTime();;
				var refNovo = new Firebase(Constant.Url + '/informacoes/' + data.usuario.key + '/erros/'+data.erro.key);
				refNovo.set(data.erro);				

				Notify.successBottom('Setado com sucesso!');
				$scope.clear();
				
			};

			$scope.excluir = function(data){
				console.log('teste');
				
				var refVariedadeNovo = new Firebase(Constant.Url + '/informacoes/' + data.usuario.key + '/erros/' + data.erro.key);
				refVariedadeNovo.remove();

				Notify.successBottom('Excluído com sucesso!');
				$scope.clear();

			};

			$scope.excluirLote = function(){
				var arrayErros = $scope.gridApi.selection.getSelectedRows();
				for(var erro in arrayErros) 
				{
					var caminho= Constant.Url + '/informacoes/' + arrayErros[erro].usuario.key + '/erros/' + arrayErros[erro].erro.key ;
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