(function(){

	'use strict';

	angular.module('Sensul.controllers').controller('indexCtrl', indexCtrl);

	indexCtrl.$inject = ['$scope', '$http'];

	function indexCtrl($scope, $http) {

		angular.extend($scope, {
			data: {
				uploads: []
			}
		});

		$scope.sendUpload = function(){
      $('#formUpload').ajaxSubmit({
        dataType: 'text',
        error: function(xhr) {
          console.log(xhr);
        },
        success: function(response) {
          console.log(response)
        }
      });
		};

  }

}());