var app = angular.module('myApp', ['ngStorage', 'ngRoute'])
.constant('urls', {
       BASE: 'http://localhost:5000'  // python server
       // BASE: 'http://localhost:6000'  // php server
})
.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'static/home.html',
            controller: 'HomeController'
        }).
        when('/signin', {
            templateUrl: 'static/signin.html',
            controller: 'HomeController'
        }).
        when('/restricted', {
            templateUrl: 'static/restricted.html',
            controller: 'RestrictedController'
        }).
        otherwise({
            redirectTo: '/'
        });        
	$httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
	   return {
	       'request': function (config) {
	           config.headers = config.headers || {};
	           if ($localStorage.token) {
	               config.headers.Authorization = 'Bearer ' + $localStorage.token;
	           }
	           return config;
	       },
	       'responseError': function (response) {
	           if (response.status === 401 || response.status === 403) {
	               $location.path('/signin');
	           }
	           return $q.reject(response);
	       }
	   };
	}]);
}])

app.factory('Auth', ['$http', '$localStorage', 'urls', function ($http, $localStorage, urls) {
       function urlBase64Decode(str) {
           var output = str.replace('-', '+').replace('_', '/');
           switch (output.length % 4) {
               case 0:
                   break;
               case 2:
                   output += '==';
                   break;
               case 3:
                   output += '=';
                   break;
               default:
                   throw 'Illegal base64url string!';
           }
           return window.atob(output);
       }

       function getClaimsFromToken() {
           var token = $localStorage.token;
           var user = {};
           if (typeof token !== 'undefined') {
               var encoded = token.split('.')[1];
               user = JSON.parse(urlBase64Decode(encoded));
           }
           return user;
       }

       var tokenClaims = getClaimsFromToken();

       return {
           signin: function (data, success, error) {
               $http.post(urls.BASE + '/signin', data).success(success).error(error)
           },
           logout: function (success) {
               tokenClaims = {};
               delete $localStorage.token;
               success();
           },
           getTokenClaims: function () {
               return tokenClaims;
           }
       };
   }
]);

app.controller('HomeController', ['$rootScope', '$scope', '$location', '$localStorage', 'Auth',
       function ($rootScope, $scope, $location, $localStorage, Auth) {
           function successAuth(res) {
               $localStorage.token = res;
               $location.path('/restricted');
           }
           $scope.signin = function () {
               console.log('poha');
               var formData = {
                   email: $scope.user.email,
                   password: $scope.user.password
               };
               Auth.signin(formData, successAuth, function () {
                   $rootScope.error = 'Invalid credentials.';
               })
           };
           $scope.token = $localStorage.token;
           $scope.tokenClaims = Auth.getTokenClaims();
       }]);

app.controller('RestrictedController', ['$rootScope', '$scope', '$http', 'urls', '$location', 'Auth', function ($rootScope, $scope, $http, urls, $location, Auth) {

       $http.get(urls.BASE + '/restricted')
           .success(function(res){$scope.msg = res})
           .error(function(){$rootScope.error = 'Failed to fetch restricted content.'});

       $scope.logout = function () {
           Auth.logout(function () {
               $location.path('/#');
           });
       };           
  }]);