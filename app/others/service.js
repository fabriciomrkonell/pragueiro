(function(){

  'use strict';

  //var app = require('/.././app.js'); 

  angular.module('Pragueiro.services').service('Controleacesso', ['Constant', function(Constant) {
    this.refazMenu_Acesso = function(acessos){

      var menu='<nav class="navbar navbar-default navbar-fixed-top">';
      menu+='  <div class="container-fluid">';
      menu+='    <div class="navbar-header">';
      menu+='      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">';
      menu+='        <span class="sr-only">Toggle navigation</span>';
      menu+='        <span class="icon-bar"></span>';
      menu+='        <span class="icon-bar"></span>';
      menu+='        <span class="icon-bar"></span>';
      menu+='      </button>';
      menu+='      <a class="navbar-brand"><img src="dist/img/actionbar_title.png" class="logo-actionbar_title"</a>';
      menu+='    </div>';
      menu+='    <div id="navbar" class="navbar-collapse collapse">';
      menu+='      <ul class="nav navbar-nav">';
      menu+='        <li><a href="#/home">Início</a></li>';

      var oldGrupo;

      var i=0;

      if(acessos!=null)
      {
        acessos.forEach(function(obj){
          i++;
          if(obj.ativo==null || obj.ativo==false || obj.visualizacao==null || obj.visualizacao==false || obj.app==true)
          {
            if(acessos.length==i)
            {
             menu +=' </ul>';
             menu +='</li>';
            }//
            return;
          }
          if(obj.grupo)
          {
            if(oldGrupo!=null)//
            {
             menu +='</ul>';
             menu +='</li>';
            }//--

            oldGrupo = obj;

            menu +='<li class="dropdown" ng-show="fazenda.aceempsObj.'+obj.link+'"" >';
            menu +='   <a href="#'+ obj.link + '" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' + obj.nome + ' <span class="caret"></span></a>';
            menu +='   <ul class="dropdown-menu">';
          }
          else
          {
              menu +='     <li ng-show="fazenda.aceempsObj.'+obj.link+'"" ><a href="#/'+obj.link +'">'+ obj.nome +'</a></li>';//
              if(acessos.length==i)
              {
               menu +=' </ul>';
               menu +='</li>';
              }//
          }//

        });
      }
      menu+= '</ul>';



      menu+= '<ul class="nav navbar-nav navbar-right">';
      menu+= ' <li class="dropdown">';
      menu+= '   <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Configurações <span class="caret"></span></a>';
      menu+= '   <ul class="dropdown-menu">';
      menu+= '     <li><a href="#/perfil">Meu perfil</a></li>';
      menu+= '     <li><a href="#/sair">Sair</a></li>';
      menu+= '     <!--<li><a href="#/erros">Erros</a></li>-->';
      menu+= '   </ul>';
      menu+= ' </li>';
      menu+= '</ul>';

      menu+= '<ul class="nav navbar-nav navbar-right">';
      menu+= ' <li>';
      menu+= '   <div class="navFazenda" > Fazenda <select class="navFazenda select" ng-options="fazenda.nome for fazenda in fazendas" ng-model="fazenda"  ng-change="chengeFazenda(fazenda)"> </select> </div>';
      menu+= ' </li>';
      menu+= '</ul>';


      menu+= '</div></div></nav>';

      return menu;
    },
    this.retornaObjetoTela = function(acessos, link)
    {
      var objAchado;
      if(acessos!=null)
      {
        acessos.forEach(function(obj){
          if(obj.link == link)
          {
            objAchado= obj;
          }
        });
      }
      return objAchado;
    }


  }]);

  angular.module('Pragueiro.services').service('Notify', ['Constant', function(Constant) {
    this.funcaoTeste = function(message){
      return 'esssasada';
    },

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