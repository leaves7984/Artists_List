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
      // $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
      var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      console.log(username);
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
            storeUserCredentials(user.username);
            resolve(result.data);
        }).catch(function (reason) {
          reject(reason);
        })
      })
    };
    var calendar = function(){
      return $q(function(resolve,reject){
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        $http({
          method:"GET",
          url: API_ENDPOINT.url+"/user/" + username,
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
            resolve("true");
          }else{
            reject("false");
          }
        })
      })

    };
    var addPatient= function (event) {
      return $q(function (resolve, reject) {
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        $http({
          method: "POST",
          url: API_ENDPOINT.url + "/patient",
          data: {
            "username": username,
            "name": event.name,
            "phone": event.phone,
            "email": event.email,
            "address": event.address,
            "description": event.description
          }
        }).then(function (result) {
            resolve(result);
        }).catch(function(message)
        {
        })
      })

    };
    var addPrescription = function (event) {
      var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      var timeDiff = (event.toWhichDay - event.fromWhichDay) / 3600000;
      var diff = Math.round(timeDiff * 10) / 10;
      return $q(function (resolve, reject) {
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        $http({
          method: "POST",
          url: API_ENDPOINT.url + "/prescription",
          data: {
            "username": username,
            "fromWhichDay": $filter('date')(event.fromWhichDay, 'yyyy-MM-dd'),
            "toWhichDay": $filter('date')(event.toWhichDay, 'yyyy-MM-dd'),
            "time": diff,
            "title": event.title,
            "description": event.description,
            "weekTimes": event.weekTimes,
            "type": event.type,
            "patient": event.patient
          }
        }).then(function (result) {
          resolve(result);
        }).catch(function (message) {
        })
      })

    };
    var getUserInfo = function(){
      return $q(function (resolve, reject) {
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        $http({
          method: "GET",
          url: API_ENDPOINT.url + "/user/" + username,
        }).then(function (result) {
            resolve(result.data);
        }).catch(function(error){
            reject(error);
        })
      })
    };
    var getPatient = function(){
      return $q(function (resolve, reject) {
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        $http({
          method: "GET",
          url: API_ENDPOINT.url + "/patient/" + username,
        }).then(function (result) {
          if (result.data) {
            console.log("success");
            resolve(result.data);
          } else {
            console.log("try again");
            reject(result.data);
          }
        })
      })

    };

    var deleteSchedule = function(calendarId,scheduleId){
      return $q(function(resolve,reject){
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        $http({
          method:"DELETE",
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
    var deleteDoctor = function (id) {
      return $q(function (resolve, reject) {
        $http({
          method: "DELETE",
          url: API_ENDPOINT.url + "/patient/" + id
        }).then(function (result) {
          if (result) {
            resolve(result.data);
          } else {
            reject(result.data);
          }
        })
      })
    }

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
      addPatient: addPatient,
      getPatient: getPatient,
      deleteSchedule: deleteSchedule,
      getUserInfo: getUserInfo,
      deleteDoctor: deleteDoctor,
      addPrescription: addPrescription,
      getUser: function(){
        var username = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        return username;
      },
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
