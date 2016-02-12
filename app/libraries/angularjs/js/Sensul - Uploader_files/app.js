'use strict'

angular.module('Sensul.controllers', []);

angular.module('Sensul.config', ['ngRoute']);

angular.module('Sensul.constant', []);

angular.module('Sensul', ['Sensul.controllers', 'Sensul.config', 'Sensul.constant']);

angular.element(document).ready(function() {
	angular.bootstrap(document, ['Sensul']);
});