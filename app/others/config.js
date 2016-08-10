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
      }).when('/index', {
        templateUrl: '/views/partials/index.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/index.js'])
        }
      }).when('/erros', {
        templateUrl: '/views/partials/erros.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/erros.js'])
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
      }).when('/quadra', {
        templateUrl: '/views/partials/quadra.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/quadra.js'])
        }

      }).when('/aplicacao', {
        templateUrl: '/views/partials/aplicacao.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/aplicacao.js'])
        }
      }).when('/perfil', {
        templateUrl: '/views/partials/perfil.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/perfil.js'])
        }
      }).when('/usuarios', {
        templateUrl: '/views/partials/user.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/user.js'])
        }
      }).otherwise({
        redirectTo: '/home'
      });
    }
    ]);

}());