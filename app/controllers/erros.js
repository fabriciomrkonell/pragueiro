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
				todosUsuarios:[],
				todosFiliais:[],
				filialxusuarios:[], novoarray:[],
				key_usuario:''
			});
		};

		


		atualizaListaFiliais();

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

			$scope.getDetalhes = function(data){
				$scope.myHTML=data.texto;
				$scope.data = data;
			};

			$scope.setarConsertado = function(data){
				
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