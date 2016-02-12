(function(){

  'use strict';

  angular.module('Pragueiro.config').config(['$routeProvider', '$controllerProvider',
    function($routeProvider, $controllerProvider) {
      angular.module('Pragueiro.controllers').registerCtrl = $controllerProvider.register;
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

      $routeProvider.when('/home', {
        templateUrl: '/views/partials/home.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/home.js'])
        }
      }).otherwise({
        redirectTo: '/home'
      });

    }
  ]);

}());