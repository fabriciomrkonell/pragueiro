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
      }).when('/controleacesso', {
        templateUrl: '/views/partials/controleacesso.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/controleacesso.js'])
        }
      }).when('/erros', {
        templateUrl: '/views/partials/erros.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/erros.js'])
        }
      }).when('/acessos', {
        templateUrl: '/views/partials/acessos.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/acessos.js'])
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
      }).when('/agendamento', {
        templateUrl: '/views/partials/agendamento.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/agendamento.js'])
        }
      }).when('/planejamento', {
        templateUrl: '/views/partials/planejamento.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/planejamento.js'])
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
      }).when('/configuracoes', {
        templateUrl: '/views/partials/configuracoes.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/configuracoes.js'])
        }
      }).when('/perfil', {
        templateUrl: '/views/partials/perfil.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/perfil.js'])
        }
      }).when('/clapra', {
        templateUrl: '/views/partials/clapra.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/clapra.js'])
        }
      }).when('/praga', {
        templateUrl: '/views/partials/praga.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/praga.js'])
        }
      }).when('/clapraemp', {
        templateUrl: '/views/partials/clapraemp.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/clapraemp.js'])
        }
      }).when('/praemp', {
        templateUrl: '/views/partials/praemp.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/praemp.js'])
        }
      }).when('/variedade', {
        templateUrl: '/views/partials/variedade.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/variedade.js'])
        }
      }).when('/equipe', {
        templateUrl: '/views/partials/equipe.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/equipe.js'])
        }
      }).when('/tipati', {
        templateUrl: '/views/partials/tipati.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/tipati.js'])
        }
      }).when('/tipequ', {
        templateUrl: '/views/partials/tipequ.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/tipequ.js'])
        }
      }).when('/equipamento', {
        templateUrl: '/views/partials/equipamento.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/equipamento.js'])
        }
      }).when('/produto', {
        templateUrl: '/views/partials/produto.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/produto.js'])
        }
      }).when('/funcionario', {
        templateUrl: '/views/partials/funcionario.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/funcionario.js'])
        }
      }).when('/usuarios', {
        templateUrl: '/views/partials/user.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/user.js'])
        }
      }).when('/cadastro', {
        templateUrl: '/views/partials/cadastro.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/cadastro.js'])
        }
      }).when('/lancamento', {
        templateUrl: '/views/partials/lancamento.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/lancamento.js'])
        }
      }).when('/ordser', {
        templateUrl: '/views/partials/ordser.html',
        resolve: {
          deps: angular.module('Pragueiro.controllers').resolveScriptDeps([ '/app/controllers/ordser.js'])
        }
      }).otherwise({
        redirectTo: '/home'
      });
    }
    ]);

}());