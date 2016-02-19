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
      }).when('/fazenda', {
        templateUrl: '/views/partials/fazenda.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/fazenda.js'])
        }
      }).when('/safra', {
        templateUrl: '/views/partials/safra.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/safra.js'])
        }
      }).when('/regiao', {
        templateUrl: '/views/partials/regiao.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/regiao.js'])
        }
      }).when('/perfil', {
        templateUrl: '/views/partials/perfil.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/perfil.js'])
        }
      }).otherwise({
        redirectTo: '/home'
      });

    }
  ]);

}());