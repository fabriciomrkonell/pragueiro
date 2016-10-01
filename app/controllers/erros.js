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
						obj_erro['usuario']=obj.usuario;
						obj_erro['texto']=obj.informacoes.erros[propertyName].erro.replace('\n', '<br>');
						$scope.erros.push(obj_erro);
						$scope.erros.sort(compare);
					}
					$scope.$apply();
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
				/*
				$scope.quadras.forEach(function(item){
					//console.log('teste1');
					var quadra_fil=item.filial;
					for(var propertyName in quadra_fil) {
						var teste = propertyName;
						//$scope.filiais[propertyName].forEach(function(fil){
							try {
								var saf;
								for(var propertyName2 in $scope.filiais[propertyName].safra) {
								//console.log('teste1');
								saf=propertyName2;
								if($scope.filiais[propertyName].safra[propertyName2].quadra[item.key]!=null)
								{
									console.log(Constant.Url + '/filial/' + propertyName + '/safra/' + saf + '/quadra/' + item.key  );
									//if(item.key=="-K7Rk4kLo0nE4RHKsJ6T")
									//{
										var quadraxsa=$scope.filiais[propertyName].safra[propertyName2].quadra[item.key];
										quadraxsa.ativo=item.ativo;
										if(item.data_ultalt == null || item.data_ultalt==0)
										{
											quadraxsa.dataStr_ultalt="";
											quadraxsa.data_ultalt=-1;
										}
										else
										{
											quadraxsa.dataStr_ultalt=item.dataStr_ultalt;
											quadraxsa.data_ultalt=item.data_ultalt;
										}										
										var refAtualizacao = new Firebase(Constant.Url + '/filial/' + propertyName + '/safra/' + saf + '/quadra/' + item.key );
										refAtualizacao.set(quadraxsa);
										//console.log("222" );
									//}
								}
							};
							
						}
						catch(err) {
							console.log(" ERRRO FILIAL  + "+ propertyName  );
						}
					};
				});
				*/

				
				data.erro['usuario_concerto']= key_usuario;
				data.erro['conserto_data'] = new Date().getTime();;
				var refNovo = new Firebase(Constant.Url + '/informacoes/' + data.usuario.key + '/erros/'+data.erro.key);
				refNovo.set(data.erro);
				


				/*
				Notify.successBottom('Safra salva com sucesso!');
				$scope.clear();
				//$scope.setaFazenda(fazendaTmp);		
				*/
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