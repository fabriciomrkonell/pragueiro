(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('perfilCtrl', perfilCtrl);

	perfilCtrl.$inject = ['$scope', '$rootScope', '$firebaseArray'];

	function perfilCtrl($scope, $rootScope, $firebaseArray) {

		function setMessageSuccess(message){
      $.notify({
        message: message
      },{
        aling: 'center',
        type: 'success'
      });
    }

		var ref = new Firebase("https://pragueiro.firebaseio.com/usuario"),
				user = $rootScope.getUser();

		$scope.editEmail = {
			email: user.password.email
		}

		$scope.arrayData = $firebaseArray(ref.orderByChild("uid").equalTo($rootScope.__user.uid));

		$scope.salvarSenha = function(data){
			ref.changePassword({
			  email: user.password.email,
			  oldPassword: $scope.editSenha.senha,
			  newPassword: $scope.editSenha.novasenha
			}, function(error) {
			  if(error === null){
			    setMessageSuccess('Senha atualizada com sucesso!');
			  }else{
			  	setMessageSuccess(error);
			  }
			});
		};

  }
}());