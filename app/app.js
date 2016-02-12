'use strict'

angular.module('Pragueiro.controllers', []);

angular.module('Pragueiro.config', ['ngRoute']);

angular.module('Pragueiro.constant', []);

angular.module('Pragueiro.services', []);

angular.module('Pragueiro', ['Pragueiro.controllers', 'Pragueiro.config', 'Pragueiro.constant', 'Pragueiro.services']);

angular.element(document).ready(function() {
	angular.bootstrap(document, ['Pragueiro']);
});