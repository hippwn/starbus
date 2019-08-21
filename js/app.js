// Define the 'app' module
var app = angular.module('app', ['angucomplete-alt',
                                    'ngRoute',
                                    'appControllers',
                                ]);

// Set MomentJS locale
moment.locale('fr');

// Route setting
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when("/", {
            templateUrl : "partials/home.htm",
            controller: "listCtrl"
        })
		.when("/map", {
			templateUrl : "partials/map.htm",
            controller: "mapCtrl"
		});

    }
]);
