(function(){

  'use strict';

  //var app = require('/.././app.js');

  angular.module('Pragueiro.services').service('Notify', ['Constant', function(Constant) {
    this.successBottom = function(message){
      $.notify({
        message: message
      },{
        aling: 'center',
        type: 'success',
        placement: {
          from: 'bottom',
          align: 'center'
        }
      });
    },
    this.errorBottom = function(message){
      $.notify({
        message: Constant.Message[message] || message
      },{
        aling: 'center',
        type: 'danger',
        placement: {
          from: 'bottom',
          align: 'center'
        }
      });
    },
    this.infoBottom = function(message){
      $.notify({
        message: message
      },{
        aling: 'center',
        type: 'info',
        placement: {
          from: 'bottom',
          align: 'center'
        }
      });
    }
  }]);

  angular.module('Pragueiro.services').service('Session', ['Constant', function(Constant) {
    this.getUser = function(){
      var ref = new Firebase(Constant.Url),
      user = ref.getAuth();
      if(user === null) window.location.href = '/login';
      return user;
    }
  }]);

  angular.module('Pragueiro.services').service('Coordenadas', ['Constant', function(Constant) {

    var data='vazio';
    this.getCoordendas = function(){

      return data;
    }

    this.setCoordenadas = function(data2){
      data=data2;
      return 'atualizado';
    }
  }]);


  angular.module('Pragueiro.services').service('Util', [function() {
    this.refresh = function(scope){
      if(!scope.$$phase) {
        scope.$apply();
      }
    }
  }]);

}());