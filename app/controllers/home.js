(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('homeCtrl', homeCtrl);

	homeCtrl.$inject = ['$scope'];

	function homeCtrl($scope) {

		console.log('Pragueiro iniciado.');

  }

}());