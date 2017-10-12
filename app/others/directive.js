(function(){

  'use strict';


  angular.module('Pragueiro.directives').directive("phone", function(){
    return {
      link : function(scope, element, attrs) {
        var options = {
          onKeyPress: function(val, e, field, options) {
            putMask();
          }
        }
        $(element).mask('(00) 00000-0000', options);
        function putMask() {
          var mask;
          var cleanVal = element[0].value.replace(/\D/g, '');
          if(cleanVal.length > 10) {
            mask = "(00) 00000-0000";
          } else {
            mask = "(00) 0000-00009";
          }
          $(element).mask(mask, options);
        }
      }
    }
  });


  angular.module('Pragueiro.directives').directive('initBind', function($compile) {
    return {
      restrict: 'A',
      replace: true,
      link: function (scope, ele, attrs) {
        scope.$watch(attrs.dynamic, function(html) {
          ele.html(html);
          $compile(ele.contents())(scope);
        });
      }
    };
  })
}());