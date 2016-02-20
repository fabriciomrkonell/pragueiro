(function(){

  'use strict';

  angular.module('Pragueiro.services').service('Notify', [function() {
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

  angular.module('Pragueiro.services').service('Util', [function() {
    this.refresh = function(scope){
      if(!scope.$$phase) {
        scope.$apply();
      }
    }
  }]);

}());