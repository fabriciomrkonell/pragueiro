(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('perfilCtrl', perfilCtrl);

	perfilCtrl.$inject = ['$scope',  '$compile', '$sce', '$rootScope', '$firebaseArray', '$firebaseObject', 'Constant', 'Notify', 'Session', 'Util'];

	function perfilCtrl($scope, $compile, $sce, $rootScope, $firebaseArray, $firebaseObject, Constant, Notify, Session, Util) {

		var refUsuario;
		

		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.posicaoFilial = window.localStorage.getItem('posicaoFilial');
		$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
		var key_usuario  = window.localStorage.getItem('key_usuario');	
		

		console.log('tesssse');
		$('#myPleaseWait').modal('show');
		var refUser = new Firebase(Constant.Url + '/usuarioxauth/'+Session.getUser().uid);		
		var obj = $firebaseObject(refUser);
		var key_usuario;
		obj.$loaded().then(function() {
			refUsuario = new Firebase(Constant.Url + '/usuario/'+obj.$value);
			var usuario = $firebaseObject(refUsuario);
			usuario.$loaded().then(function() {


				angular.extend($scope, {
					data: {
						editEmail: {
							email: usuario.email,
							novoemail: ''
						},
						editSenha: {
							senha: '',
							novasenha: ''
						},
						usuario

					}
				});
				//$scope.data = objUsuario;
				$('#myPleaseWait').modal('hide');
			});
			
			//user = Session.getUser();

		});
		//############################################################################################################################
		//############################################################################################################################
		// PERFIL
		//############################################################################################################################

		$scope.salvarPerfil = function(data){
			if(validFormPerfil(data)) return true;
			$scope.data.usuario.$save(data);
			Notify.successBottom('Perfil atualizado com sucesso!');
		};

		$scope.salvarSenha = function(){
			if(validFormSenhaModal($scope.data.editSenha.senha)) return true;
			ref.changePassword({
				email: $scope.data.usuario.email,
				oldPassword: $scope.data.editSenha.senha,
				newPassword: $scope.data.editSenha.novasenha
			}, function(error) {
				if(error === null){
					$scope.data.usuario.senha=$scope.data.editSenha.novasenha;
/*
					var refNovo = new Firebase(Constant.Url + '/usuario/' + data.$id);
					delete data.$id;
					delete data.$priority;
					delete data.$$hashKey;
					refNovo.set(data);
					*/
					$scope.data.usuario.$save($scope.data.usuario);
					Notify.successBottom('Senha atualizada com sucesso!');
					$('#modalSenha').modal('hide');
					angular.extend($scope.data.editSenha, {
						senha: '',
						novasenha: ''
					});
					Util.refresh($scope);
				}else{
					Notify.errorBottom(error);
				}
			});
		};

		$scope.salvarEmail = function(){
			if(validFormSenhaModal($scope.data.editSenha.senha)) return true;
			ref.changeEmail({
				oldEmail: $scope.data.editEmail.email,
				newEmail: $scope.data.editEmail.novoemail,
				password: $scope.data.editSenha.senha
			}, function(error) {
				if(error === null){
					$scope.data.usuario.email=$scope.data.editEmail.novoemail;
/*
					var refNovo = new Firebase(Constant.Url + '/usuario/' + data.key);
					delete data.$id;
					delete data.$priority;
					delete data.$$hashKey;
					refNovo.set(data);
					*/
					$scope.data.usuario.$save($scope.data.usuario);

					ref.unauth();
					window.location.href = '/login';
				}else{
					Notify.errorBottom(error);
				}
			});
		};

		$scope.openModalSalvarSenha = function(data){
			if(validFormSenha(data)) return true;
			$scope.data.editSenha.senha = '';
			$('#modalSenha').modal();
		};

		$scope.openModalSalvarEmail = function(data){
			if(validFormEmail(data)) return true;
			$scope.data.editSenha.senha = '';
			$('#modalEmail').modal();
		};

		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		function isEmail(email){
			var er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/;
			return !!er.exec(email);
		};

		function validFormPerfil(data){
			if(data.nome === ''){
				Notify.errorBottom('O campo nome é inválido!');
				return true
			}
			if(data.telefone === '' ||   data.telefone.length < 14){
				Notify.errorBottom('O campo telefone é inválido!');
				return true
			}
			if(data.cidade === ''){
				Notify.errorBottom('O campo cidade é inválido!');
				return true
			}
			return false;
		};

		function validFormEmail(data){
			if(isEmail(data.novoemail) !== true){
				Notify.errorBottom('O campo novo email é inválido!');
				return true
			}
			return false;
		};

		function validFormSenha(data){
			if(data.novasenha === ''){
				Notify.errorBottom('O campo nova senha é inválido!');
				return true
			}
			return false;
		};

		function validFormSenhaModal(senha){
			if(senha === ''){
				Notify.errorBottom('O campo senha atual é inválido!');
				return true
			}
			return false;
		};

	}
}());