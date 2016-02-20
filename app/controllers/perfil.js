(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('perfilCtrl', perfilCtrl);

	perfilCtrl.$inject = ['$scope', '$rootScope', '$firebaseArray', 'Constant', 'Notify', 'Session', 'Util'];

	function perfilCtrl($scope, $rootScope, $firebaseArray, Constant, Notify, Session, Util) {

    function validFormPerfil(data){
      if(data.nome === ''){
        Notify.infoBottom('O campo nome é inválido!');
        return true
      }
      if(data.telefone === ''){
        Notify.infoBottom('O campo telefone é inválido!');
        return true
      }
      if(data.cidade === ''){
        Notify.infoBottom('O campo cidade é inválido!');
        return true
      }
      return false;
    };

    function validFormEmail(data){
      if(data.novoemail === ''){
        Notify.infoBottom('O campo novo email é inválido!');
        return true
      }
      return false;
    };

    function validFormSenha(data){
      if(data.novasenha === ''){
        Notify.infoBottom('O campo nova senha é inválido!');
        return true
      }
      return false;
    };

		var ref = new Firebase(Constant.Url + '/usuario'),
				user = Session.getUser();

			angular.extend($scope, {
			data: {
				editEmail: {
					email: user.password.email,
					novoemail: ''
				},
				editSenha: {
					senha: '',
					novasenha: ''
				}
			}
		});

		$scope.arrayData = $firebaseArray(ref.orderByChild("uid").equalTo(user.uid));

		$scope.salvarPerfil = function(data){
			if(validFormPerfil(data)) return true;
			$scope.arrayData.$save(data);
			Notify.successBottom('Perfil atualizado com sucesso!');
		};

		$scope.salvarSenha = function(){
			ref.changePassword({
			  email: user.password.email,
			  oldPassword: $scope.data.editSenha.senha,
			  newPassword: $scope.data.editSenha.novasenha
			}, function(error) {
			  if(error === null){
			    Notify.successBottom('Senha atualizada com sucesso!');
			    $('#modalSenha').modal('hide');
			    angular.extend($scope.data.editSenha, {
			    	senha: '',
			    	novasenha: ''
			    });
			    Util.refresh($scope);
			  }else{
			  	Notify.infoBottom(error);
			  }
			});
		};

		$scope.salvarEmail = function(){
			ref.changeEmail({
			  oldEmail: $scope.data.editEmail.email,
			  newEmail: $scope.data.editEmail.novoemail,
			  password: $scope.data.editSenha.senha
			}, function(error) {
			  if(error === null){
			    ref.unauth();
			    window.location.href = '/login';
			  }else{
			    Notify.infoBottom(error);
			  }
			});
		};

		$scope.openModalSalvarSenha = function(data){
			if(validFormSenha(data)) return true;
			$('#modalSenha').modal();
		};

		$scope.openModalSalvarEmail = function(data){
			if(validFormEmail(data)) return true;
			$('#modalEmail').modal();
		};

  }
}());