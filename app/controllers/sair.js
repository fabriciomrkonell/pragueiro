(function(){

	'use strict'; 

	angular.module('Pragueiro.controllers').registerCtrl('sairCtrl', sairCtrl);

	sairCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify', '$routeParams', '$geofire', 'NgMap', '$location', '$anchorScroll', '$window'];

	function sairCtrl($scope, Constant, Session, $firebaseArray, $firebaseObject, Notify, $routeParams,  $geofire, NgMap, $location, $anchorScroll, $window) {


		var ref = new Firebase(Constant.Url);
		ref.unauth();
		window.location.href = '/login';
	}

}());