angular.module('starter')

  .service('Auth',function($q,$http,API_ENDPOINT,$filter){
    var LOCAL_TOKEN_KEY = 'username';
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
      // $http.defaults.headers.common.Authorization = authToken;
    }
    function destroyUserCredentials(){
      authToken = undefined;
      isAuthenticated =false;
      $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var login = function(user){
      return $q(function(resolve,reject){

        console.log(user);
        $http({
              method:"POST",
              url: API_ENDPOINT.url+"/login",
              params:{
                "username":user.username,
                "password":user.password
              }
            }).then(function(result){
          if(result.data){
            storeUserCredentials(user.username);
            console.log("success");
            resolve(result.data);
          }else{
            console.log("try again");
            reject(result.data);
          }
        })
      })
    };
    var calendar = function(){
      return $q(function(resolve,reject){
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        $http({
          method:"GET",
          url: API_ENDPOINT.url+"/users",
          params:{
            "username": username
          }
        }).then(function(result){
          if(result.data){
            console.log("success");
            resolve(result.data);
          }else{
            console.log("try again");
            reject(result.data);
          }
        })
      })
    };

    var addEvent = function(event){
      return $q(function(resolve,reject){
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        var timeDiff = (event.toWhichDay - event.fromWhichDay)/3600000;
        var diff = Math.round(timeDiff*10)/10;
        $http({
          method:"POST",
          url: API_ENDPOINT.url+"/schedules/create",
          params:{
            "username": username,
            "date": $filter('date')(event.fromWhichDay,'yyyy-MM-dd'),
            "from": $filter('date')(event.fromWhichDay,'h:mm'),
            "to": $filter('date')(event.toWhichDay,'h:mm'),
            "time": diff,
            "sports": event.title,
            "description": event.description
          }
        }).then(function(result){
          if(result.data){
            console.log("success");
            resolve("true");
          }else{
            console.log("try again");
            reject("false");
          }
        })
      })

    };
    var deleteSchedule = function(calendarId,scheduleId){
      return $q(function(resolve,reject){
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        $http({
          method:"POST",
          url: API_ENDPOINT.url+"/schedules/delete",
          params:{
            "username": username,
            "calendarId": calendarId,
             "scheduleId": scheduleId
          }
        }).then(function(result){
          if(result){
            console.log("success");
            console.log(result);
            resolve(result.data);
          }else{
            console.log("try again");
            console.log(result);
            reject(result.data);
          }
        })
      })
    };
    var register = function(data){
      return $q(function(resolve,reject){

        $http({
          method:"POST",
          url: API_ENDPOINT.url+"/create",
          params:{
            "username":data.username,
            "password":data.password,
            "email":data.email
          }
        }).then(function(result){
          if(result.data){
            console.log("success11");
            console.log(result);
            resolve(result.data);
          }else{
            console.log("try again");
            reject(result.data);
            alert("name repeated");
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
      register: register,
      calendar: calendar,
      addEvent: addEvent,
      deleteSchedule: deleteSchedule,
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
