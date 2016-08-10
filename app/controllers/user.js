(function(){

	'use strict';

	angular.module('Sensul.controllers').registerCtrl('userCtrl', userCtrl);

	userCtrl.$inject = ['$scope', '$http', 'Constant', '$rootScope', 'Util'];

	function userCtrl($scope, $http, Constant, $rootScope, Util) {

		var item = null, index = null;

		Util.showLoader('Carregando Informações', 'Aguarde enquando a página é carregada');

		$rootScope.eventOkButton = function(){
			Util.hideLoader();
		};

		$rootScope.eventSimButton = function(){
			$http.delete(Constant.url.User + '/' + item._id).success(function(data){
				if(data.error){
					Util.showLoaderInfo('Usuário Nāo Deletado', data.message);
				}else{
					$rootScope.options.users.splice(index, 1);
					Util.showLoaderInfo('Usuário Deletado', 'O usuário foi deletado com sucesso');
				}
			}).error(function(error){
				alert(error);
			});
		};

		angular.extend($scope, {
			data: {}
		});

		$scope.clear = function(){
			angular.extend($scope.data, {
				_id: null,
				name: '',
				email: '',
				password: '',
				type: Constant.options.Users[0]
			});
		};

		$scope.clear();

		$http.get(Constant.url.User).success(function(data){
			$rootScope.options.users = data.data;
			Util.hideLoader();
		}).error(function(error){
			alert(error);
		});

		$scope.saveUser = function(item){
			if($scope.validForm()) return false;
			Util.showLoader('Processando Informações', 'Aguarde enquando o usuário é salvo');
			$http.post(Constant.url.User, item).success(function(data){
				if(item._id == null){
					$rootScope.options.users.push(data.data);
					$window.alert("O ID é:" + data.data._id);
				}else{
					$rootScope.options.users.forEach(function(item){
						if(item._id === data.data._id){
							item.name = data.data.name;
							item.email = data.data.email;
							item.password = data.data.password;
							item.type = data.data.type;
						}
					});
					$window.alert("2-O ID é:" + data.data._id);
				}
				$scope.clear();
				Util.hideLoader();
			}).error(function(error){
				alert(error);
			});
		};

		$scope.editUser = function(item){
			angular.copy(item, $scope.data);
			$scope.data.type = $rootScope.getUserType(item.type);
		};

		$scope.deleteUser = function(_item, _index){
			item = _item;
			index = _index;
			Util.showLoaderConfirm('Deletar Usuário?', 'Deseja realmente excluir o usuário?');
		};

		$scope.validForm = function(){
			if($scope.data.name === '') { alert('Favor preencher o campo Nome!'); return true }
			if($scope.data.email === '') { alert('Favor preencher o campo Email!'); return true }
			if($scope.data.password === '') { alert('Favor preencher o campo Senha!'); return true }
			return false;
		}

	}

}());