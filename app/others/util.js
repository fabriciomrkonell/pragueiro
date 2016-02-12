(function(){

	'use strict';

	angular.module('Pragueiro.controllers').resolveScriptDeps = function(dependencies){
    return function($q,$rootScope){
      var deferred = $q.defer();
      $script(dependencies, function() {
        $rootScope.$apply(function(){
          deferred.resolve();
        });
      });
      return deferred.promise;
    }
  };

}());