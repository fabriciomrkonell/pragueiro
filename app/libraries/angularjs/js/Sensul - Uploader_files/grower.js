(function(){

	'use strict';

	angular.module('Sensul.controllers').controller('growerCtrl', growerCtrl);

	growerCtrl.$inject = ['$scope', '$http', 'Constant'];

	function growerCtrl($scope, $http, Constant) {

		angular.extend($scope, {
			growers: [],
			data: {}
		});

		$scope.clear = function(){
			angular.extend($scope.data, {
				_id: null,
				name: '',
			  city: ''
			});
		};

		$scope.clear();

		$http.get(Constant.url.Grower).success(function(data){
			$scope.growers = data.data;
		}).error(function(error){
			alert(error);
		});

		$scope.saveGrower = function(item){
			$http.post(Constant.url.Grower, item).success(function(data){
				if(item._id == null){
					$scope.growers.push(data.data);
				}else{
					$scope.growers.forEach(function(item){
						if(item._id === data.data._id){
							item.name = data.data.name;
							item.city = data.data.city;
						}
					});
				}
				$scope.clear();
			}).error(function(error){
				alert(error);
			});
		};

		$scope.editGrower = function(item){
			angular.copy(item, $scope.data)	;
		};

		$scope.deleteGrower = function(item, index){
			$http.delete(Constant.url.Grower + '/' + item._id).success(function(data){
				$scope.growers.splice(index, 1);
			}).error(function(error){
				alert(error);
			});
		};

  }

}());