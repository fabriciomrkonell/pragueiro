(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('fazendaCtrl', fazendaCtrl);

	fazendaCtrl.$inject = 
	['$scope', '$firebase', '$firebaseObject', '$firebaseArray', 'Constant', 'Session', 'Notify'];

	function fazendaCtrl($scope,  $firebase, $firebaseObject, $firebaseArray, Constant, Session, Notify) {

		angular.extend($scope, {
			edit: false,
			save:true,
			fazendas: [],
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
				tipintapl: '',
				key: '',
				distancia_pontos:10,
				usuarios:[],
				todosUsuarios:[],
				todosFiliais:[],
				filialxusuarios:[], novoarray:[]
			});
		};

		var key_usuario;

		$scope.tipintapls = ['Data aplicação', 'Data atual'];

		var ref = new Firebase(Constant.Url + '/filial');
		$scope.todosFiliais=$firebaseArray(ref);
		atualizaListaFiliais();


		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "nome", displayName: "Nome", width: 300 },
			{ field: "razaosocial", displayName: "Raz. Social", width: 150 },
			{ field: "telefone", displayName: "Telefone", width: 150 },
			]
		};

		$scope.toggleMultiSelect = function() {
			$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		};


		$scope.gridOptions.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.editar(row.entity);
			});
		};

		function atualizaListaFiliais()
		{
			var refUser = new Firebase(Constant.Url + '/usuarioxauth/'+Session.getUser().uid);		
			var obj = $firebaseObject(refUser);

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

					refNovo.on('child_added', function(snap) {
						console.log('Adicionou filial', snap.name(), snap.val());
						var obj= snap.val();
						$scope.fazendas.push(obj.filial);
						$scope.gridOptions.data = $scope.fazendas;

					});

					refNovo.on('child_changed', function(snap) {
						console.log('Houve uma atualização', snap.name(), snap.val());
						var objNovo= snap.val();

						var x=0;
						var posicao=null;
						$scope.fazendas.forEach(function(obj){
							if(obj.key === objNovo.filial.key)
							{ 
								posicao=x;
							}
							x++;

						});
						if(posicao!=null)
							$scope.fazendas[posicao]=objNovo.filial;

					});

					refNovo.on('child_removed', function(snap) {
						console.log('Houve uma remoção', snap.name(), snap.val());
						atualizaListaFiliais();

					});


			});// final do load

		}

		function extend(base) {
			var parts = Array.prototype.slice.call(arguments, 1);
			parts.forEach(function (p) {
				if (p && typeof (p) === 'object') {
					for (var k in p) {
						if (p.hasOwnProperty(k)) {
							base[k] = p[k];
						}
					}
				}
			});
			return base;
		}

		var refUsuario = new Firebase(Constant.Url + '/usuario');

		$scope.todoUsuarios = $firebaseArray(refUsuario);

		function isEmail(email){
			var er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/;
			return !!er.exec(email);
		};

		function setMessageError(message){
			Notify.errorBottom(message);
		};

		function validForm(data){
			if(data.nome === ''){
				setMessageError('O campo nome é inválido!');
				return true;
			}
			if(data.razaosocial === ''){
				setMessageError('O campo razão social é inválido!');
				return true;
			}
			if(data.telefone!=null)
			{
				if(data.telefone === '' ||   data.telefone.length < 14){
					setMessageError('O campo telefone é inválido!');
					return true;
				}
			}

			if(data.cidade === ''){
				setMessageError('O campo cidade é inválido!');
				return true;
			}			
			return false;
		};


		$scope.salvarFazenda = function(data){
			if(validForm(data)) return false;
			data.key_usuario = key_usuario;
			$scope.todosFiliais.$add(data).then(function(ref) {
				data.key = ref.key();
				var refNovo = new Firebase(Constant.Url + '/filial/'+ref.key());
				refNovo.set(data);

				var refNovo = new Firebase(Constant.Url + '/filial/'+ref.key()+'/usuario/'+key_usuario);
				refNovo.set(true);

				var refNovoUsuXFil = new Firebase(Constant.Url + '/usuario/'+key_usuario+'/filial/'+ref.key());
				refNovoUsuXFil.set(true);

				atualizaListaFiliais();
			});

			$scope.edit = false;
			$scope.save = true;
			$scope.clear();
			Notify.successBottom('Fazenda salva com sucesso!');
		};

		$scope.editarFazenda = function(data){
			if(validForm(data)) return false;

			$scope.todosFiliais.$save(data);
			$scope.edit = false;
			$scope.save = true;
			$scope.clear();
			//atualizaListaFiliais();
			Notify.successBottom('Fazenda atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
			$scope.save = true;
			return true;
		};

		$scope.editar = function(data){

			$scope.todosFiliais.forEach(function(obj){
				if(obj.$id === data.key)
				{ 
					$scope.data = obj;
				}
			});
			
			$scope.edit = true;
			$scope.save = false;
		};

		$scope.excluir = function(data){
			$('#modalDelete').modal('show');
			return true;
		};

		$scope.excluirFilial = function(data){
			$('#modalDelete').modal('hide');
			if(key_usuario == null || data.key == null)
			{
				return;
			}
			else
			{
				var refNovoUsuXFil = new Firebase(Constant.Url + '/usuario/'+key_usuario+'/filial/'+data.key);
				refNovoUsuXFil.remove();
				refNovoUsuXFil = new Firebase(Constant.Url + '/filial/'+data.key+'/usuario/'+key_usuario);
				refNovoUsuXFil.remove();
				$scope.fazendas.$remove(data);
				Notify.successBottom('Fazenda removida com sucesso!');
			}
			$scope.cancelar();
			return true;
		};

		$scope.getUsuarios = function(fazenda){		
			$scope.objModal = fazenda;
			$scope.usuarios=[];
			$scope.filialxusuarios = $firebaseArray(new Firebase(Constant.Url + '/filial/'+fazenda.key+'/usuario'));
			$scope.filialxusuarios.$loaded(function() {
				$scope.filialxusuarios.forEach(function(user){
					$scope.todoUsuarios.forEach(function(item){
						if(item.$id === user.$id)
						{ 
							$scope.usuarios.push(item);
						}
					});
				});
			});

			$('#modalUsuarios').modal('show');
		};

		$scope.clearUsuarioXfil = function(fazenda){
			angular.extend($scope.objModalUsuario, {
				usuario: $scope.usuarios[0].$id,
			});
			//refQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda + '/safra/' + safra + '/quadra');
			//$scope.quadra = $firebaseArray(refQuadrasCulturas);
			$scope.editQuadra = false;

		};

		$scope.salvarUsuarioXfil = function(fazenda, usuario){

			var refNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/usuario/'+usuario);
			refNovo.set(true);

			var refNovoUserXFil = new Firebase(Constant.Url + '/usuario/'+usuario+'/filial/'+fazenda.key);
			refNovoUserXFil.set(true);

			/*
			$scope.quadra.$add(form);
			*/
			$scope.getUsuarios($scope.objModal);
			Notify.successBottom('Usuário adicionado com sucesso!');
			//_salvarQuadra = true;
			//$scope.clearQuadrasCulturas(fazenda.$id, safra);
		};

		$scope.editarQuadrasCulturas = function(data){
			$scope.objModalQuadra = data;
			$scope.editQuadra = true;
		};

		$scope.atualizarQuadrasCulturas = function(fazenda, safra, form){
			$scope.quadra.$save(form);
			$scope.addHistorico(form.quadra, form.cultura, 'Atualizou');
			Notify.successBottom('Relacionamento atualizadpo com sucesso!');
			$scope.clearQuadrasCulturas(fazenda.key, safra);
		};

		$scope.excluirUsuarioxfilial = function(fazenda, data){

			$scope.filialxusuarios.forEach(function(user){
				if(user.$id === data.$id)
				{ 
					$scope.filialxusuarios.$remove(user);
					var refNovoUsuXFil = new Firebase(Constant.Url + '/usuario/'+data.key+'/filial/'+fazenda.key);
					refNovoUsuXFil.remove();
				}
				
			});
			$scope.getUsuarios($scope.objModal);
			Notify.successBottom('Usuário removido desta fazenda com sucesso!');
			return true;
		};


		$scope.clear();

	}

}());