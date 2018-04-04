angular.module('starter')

  .service('Auth',function($q,$http,API_ENDPOINT){
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var isAuthenticated = false;
    var authToken;

    function loadUserCredentials(){
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if(token){
        userCredentials(token);
      }
    }
    function storeUserCredentials(token){
      window.localStorage.setItem(LOCAL_TOKEN_KEY,token);
      userCredentials(token);


    }
    function userCredentials(token){
      isAuthenticated = true;
      authToken = token;

      //set the token as header for your requests
      $http.defaults.headers.common.Authorization = authToken;
    }
    function destroyUserCredentials(){
      authToken = undefined;
      isAuthenticated =false;
      $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var login = function(user){
      return $q(function(resolve,reject){
        $http.post(API_ENDPOINT.url + '/login',user).then(function(result){
          if(result.data.success){
            storeUserCredentials(result.data.token);
            resolve(result.data.msg);
          }else{
            reject(result.data.msg);
          }
        })
      })
    };

    var logout = function () {
      destroyUserCredentials();
    };

    loadUserCredentials();

    return {
      login: login,
      logout:logout,
      isAuthenticated: function () {
        return isAuthenticated;
      }

    }
  })

  .factory('AuthInterceptor', function($rootScope,$q,AUTH_EVENTS){
    return {
      responseError: function(response) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated
        }[response.status],response);
        return $q.reject(response);
      }
    };
  })

  .config(function($httpProvider){

    $httpProvider.interceptors.push("AuthInterceptor");

  });
