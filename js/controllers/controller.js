// Declare a module dedcated to the controllers.
var appControllers = angular.module("appControllers", []);

/***
 * Controller for the homepage.
 * Use 'angucomplete-alt', an autocomplete module, to select a bus stop from the
 * STAR (Rennes' public transport service) API. Then query the API for infos
 * about the next passages of buses at the selected bus stop. On click on a list
 * item, redirect the user to the map.
 */
appControllers.controller('listCtrl', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {
        // Define $scope variable for the location on the page (cf. header).
		$scope.location = "Home";

        $scope.preProcess = function (response) {
            var rec = [];
            response.records.map(function (item) {
                if (!rec.find(x => x.fields.nom == item.fields.nom)) rec.push(item);
            });
            response.records = rec;
            return response;
        }

		$scope.postProcess = function(selected) {
			if (selected) $http.get("https://data.explore.star.fr/api/records/1.0/search/?apikey=fa4b313c01368e8a9344246ee78f47a628a66c62a385f5ba96e5d23d&dataset=tco-bus-circulation-passages-tr&lang=FR&timezone=Europe%2FParis&sort=-arriveetheorique&q=nomarret:" + selected.title)
				.then(function (response) {
					var records = [];
					for (var i in response.data.records) records.push({
							name: response.data.records[i].fields.nomarret,
							numline: response.data.records[i].fields.nomcourtligne,
							arrival: moment(response.data.records[i].fields.arriveetheorique),
							dest: response.data.records[i].fields.destination,
							coord: { lat: response.data.records[i].fields.coordonnees[0], lng: response.data.records[i].fields.coordonnees[1] },
							timestamp: moment(response.data.records[i].fields.record_timestamp)
						});
					$scope.records = records;
					$rootScope.selectedStop = selected.originalObject.fields;
				});
		};

		// Print out the bus stop on a map with its line
		$scope.toMap = function (record) {
			$rootScope.mapInfos = record;
			location.assign("#!/map");
		}
    }
]);

appControllers.controller('mapCtrl', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {
		if ($rootScope.mapInfos && $rootScope.selectedStop) {
			$scope.location = "Map";
			$scope.append = $rootScope.selectedStop;

			var coord = $rootScope.selectedStop.coordonnees;
			var map = L.map('map').setView(coord, 13);
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox.streets',
				accessToken: 'pk.eyJ1IjoibGVvbGF2YXVyIiwiYSI6ImNqZnV3Zm94dDE0MzUyeHFudHlwNHZ0c2kifQ.k6ufD3sC_Y0AsUZjvqaefQ'
			}).addTo(map);

			var marker = L.marker(coord).addTo(map);
			marker.bindPopup('<span class="lead">' + $rootScope.selectedStop.nom + '</span>').openPopup();

			$http.get("https://data.explore.star.fr/api/records/1.0/search/?dataset=tco-bus-topologie-parcours-td&rows=-1&timezone=Europe%2FParis&sort=longueur&q=senscommercial:Aller%20AND%20nomcourtligne:" + $rootScope.mapInfos.numline)
				.then(function (response) {
					var rec = response.data.records[0].fields;
					var line = L.polyline(rec.parcours.coordinates.map(item => item.reverse()), {color: rec.couleurtrace}).addTo(map);
					map.fitBounds(line.getBounds());
				});
		} else window.location.href = "#!/";
	}
]);
