'use strict';

angular.module('new2dApp')
  .directive('header', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the header directive');
      }
    };
  });
