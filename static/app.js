var app = angular.module('myApp', ['ngStorage', 'ngRoute'])
.constant('urls', {
       BASE: 'http://localhost:5000'  
})
.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'static/home.html',
            controller: 'HomeController'
        }).
        when('/public', {
            templateUrl: 'static/public.html',
            controller: 'PublicController'
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
       return {
           signin: function (data, success, error) {
               $http.post(urls.BASE + '/signin', data).success(success).error(error)
           },
           logout: function (success) {
               delete $localStorage.token;
               success();
           }
       };
   }
]);

app.controller('HomeController', ['$rootScope', '$scope', '$location', '$localStorage', 'Auth',
       function ($rootScope, $scope, $location, $localStorage, Auth) {
           function successAuth(res) {
               $rootScope.error = '';
               $localStorage.token = res;
               $location.path('/restricted');
           }
           $scope.signin = function () {               
               var formData = {
                   email: $scope.user.email,
                   password: $scope.user.password
               };
               Auth.signin(formData, successAuth, function () {
                   $rootScope.error = 'Invalid credentials.';
               })
           };
           $scope.token = $localStorage.token;
       }]);

app.controller('RestrictedController', ['$rootScope', '$scope', '$http', 'urls', 'Auth', function ($rootScope, $scope, $http, urls, Auth) {
       $http.get(urls.BASE + '/restricted')
           .success(function(res){$scope.msg = res})
           .error(function(res){$rootScope.error = 'Failed to fetch restricted content: ' + res.message});
       $scope.logout = function () {
            Auth.logout(function () {              
              window.location.href = '/';
           });
       };           
  }]);

app.controller('PublicController', ['$rootScope', '$scope', '$http', 'urls', function ($rootScope, $scope, $http, urls) {
       $http.get(urls.BASE + '/public')
           .success(function(res){$scope.msg = res})
           .error(function(res){$rootScope.error = 'Failed to fetch public content: ' + res.message});
  }]);