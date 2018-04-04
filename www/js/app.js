// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','chart.js','ui.router','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider,$urlRouterProvider){
  $stateProvider

    .state('auth',{
      url: '/auth',
      abstract: true,
      templateUrl: 'templates/auth.html'
    })

    .state('auth.login', {
      url: '/login',
      views: {
        'auth-login': {
          templateUrl: 'templates/home.html',
          controller: 'LoginController'
        }
      },
      cache: false
    })
    .state('auth.register', {
      url: '/register',
      views: {
        'auth-login': {
          templateUrl: 'templates/register.html',
          controller: 'LoginController'
        },
        cache: false
      }
    })
  // setup an abstract state for the tabs directive
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tabs.list', {
      url: '/list',
      views: {
        'tab-list': {
          templateUrl: 'templates/list.html',
          controller: 'ListController'
        }
      },
      cache:false
    })
    
    .state('tabs.calendar', {
      url: '/calendar',
      views: {
        'tab-calendar' : {
          templateUrl: 'templates/calendar.html',
          controller: 'CalendarController'
        }
      },
      cache: false
    })



    .state('tabs.summary', {
      url: '/summary',
      views: {
        'tab-summary' : {
          templateUrl: 'templates/summary.html',
          controller: 'GraphController'
        }
      }
    })

    .state('tabs.detail', {
      url: '/list/detail/:aid',
      views: {
        'tab-list' : {
          templateUrl: 'templates/detail.html',
          controller: 'ListController'
        }
      },
      cache:false
    })

    .state('tabs.addEvent', {
      url: '/summary/addEvent',
      views: {
        'tab-summary' : {
          templateUrl: 'templates/addEvent.html',
          controller: 'AddEventController'
        }
      },
      cache:false
    });




  //by default go to tab/list page
  $urlRouterProvider.otherwise('/auth/login');
})

  .controller("LoginController",function ($scope, $http, $state) {
    var API = "http://localhost:8989/api";
    var LoginApi = API + "/login";
    $scope.data = {
      username: "",
      password: ""
    };
    $scope.login = function(data) {

      console.log(data);

      $http({
        method:"POST",
        url: LoginApi,
        params:{
          "username":data.username,
          "password":data.password
        }
      }).success(function(res) {
        $scope.response = res;
        console.log($scope.response);
        if ($scope.response == true) {

          console.log("success");

          $state.go('tabs.summary');
        } else {
          console.log("try again");
        }
      }).error(function() {
        console.log("error");
      });

    };

    $scope.goBack = function(){
      $state.go('auth.login');
    };


  })
  .controller("AddEventController",function($scope, $http, $state,$cordovaDatePicker, $ionicPlatform){

    $scope.event = {
      fromWhichDay: new Date(2018,2,31,13,30,0),
      toWhichDay: new Date(2018,2,31,14,30),
      title: null,
      description: null
    };
    console.log( $scope.event);

    $scope.goBack = function(){
      $state.go('tabs.summary');
    };

    $ionicPlatform.ready(function(){
      $scope.showDatePicker = function(){
        var options = {
          date: new Date(),
          mode: 'date', // or 'time'
          minDate: new Date() - 10000,
          allowOldDates: true,
          allowFutureDates: false,
          doneButtonLabel: 'DONE',
          doneButtonColor: '#F2F3F4',
          cancelButtonLabel: 'CANCEL',
          cancelButtonColor: '#000000'
        };
        $cordovaDatePicker.show(options).then(function (value) {
          alert(value);
        });

      };
    });

    $scope.confirm = function(){
      var API = "http://localhost:8989/api";
      var CREATE_API = API + '/schedules/create';

        if($scope.event.title == null|| $scope.event.description == null){

        }else{
          var timeDiff = ($scope.event.toWhichDay - $scope.event.fromWhichDay)/60000;

          $http.post(CREATE_API,{},{params:{
              "username": "lili",
              "date": $scope.event.fromWhichDay.toDateString(),
              "time": timeDiff,
              "sports": $scope.event.title,
              "description": $scope.event.description

            }}).success(function(data) {
            console.log(data);
          }).error(function(data) {
            console.log(data);
          });


          $state.go('tabs.summary');
        }

      };

  })


  .controller("GraphController", ['$scope','$http','$ionicPopup','$state',function($scope, $http, $ionicPopup, $state) {

    var API = "http://localhost:8989/api";
    var CALENDAR_API = API + '/users';
    var CREATE_API = API + '/schedules/create';

    $http.get(CALENDAR_API).success(function(data){
      var sportsArray = [];
      var timeArray = [];

      $scope.calendar = data[1].calendar;

      console.log($scope.calendar);

      $scope.jumpToUrl = function(){
        $state.go('tabs.addEvent');
      };

      $scope.doRefresh =function(){
        sportsArray = [];
        timeArray = [];
        $http.get(CALENDAR_API).success(function(data){
          $scope.calendar= data[1].calendar;
          $scope.$broadcast('scroll.refreshComplete');
          angular.forEach($scope.calendar, function(item){
            console.log(item.schedule);

            for (var i = 0; i < item.schedule.length; i++)
            {
              var index = sportsArray.indexOf(item.schedule[i].sports);
              if(index >= 0){
                timeArray[index] += item.schedule[i].time;
              }else{
                sportsArray.push(item.schedule[i].sports);
                timeArray.push(item.schedule[i].time);
              }

            }
          });
          $scope.labels = sportsArray;
          $scope.data = timeArray;
        })
      };
      $scope.toggleStar = function(item){
        item.star = !item.star;
      };
      $scope.onItemDelete = function(dayIndex, item){
        $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item),1);

        var index = sportsArray.indexOf(item.sports);
        timeArray[index] -= item.time;

      };
      angular.forEach($scope.calendar, function(item){
        console.log(item.schedule);

        for (var i = 0; i < item.schedule.length; i++)
        {
          var index = sportsArray.indexOf(item.schedule[i].sports);
          if(index >= 0){
            timeArray[index] += item.schedule[i].time;
          }else{
            sportsArray.push(item.schedule[i].sports);
            timeArray.push(item.schedule[i].time);
          }

        }
      });
      console.log(sportsArray);
      console.log(timeArray);
      $scope.labels = sportsArray;
      $scope.data = timeArray;

    });
  }])

  .controller('CalendarController',['$scope','$http','$state',function($scope, $http, $state){
    $http.get('js/data.json').success(function(data){
      $scope.calendar = data.calendar;

      $scope.doRefresh =function(){
        $http.get('js/data.json').success(function(data){
          $scope.calendar = data.calendar;
          $scope.$broadcast('scroll.refreshComplete');
        })
      };
      $scope.toggleStar = function(item){
        item.star = !item.star;
      };
      $scope.onItemDelete = function(dayIndex, item){
        $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item),1);
      };

      console.log(data);
    });
  }])

.controller('ListController',['$scope','$http','$state','$rootScope',function($scope, $http, $state,$rootScope){
  $http.get('js/data.json').success(function(data){
    $scope.artists = data.artists;
    $scope.data = { showDelete: false, showReorder: false };
    $scope.jumpToUrl = function(item){
      console.log(item);
      $state.go('tabs.detail',{aid:item.shortname});
      console.log("#/tab/list/"+item.shortname);
      $rootScope.detail = item;
    };
    $scope.goBack = function(){
      $state.go('tabs.list');
    };
    $scope.doRefresh =function(){
      $http.get('js/data.json').success(function(data){
        $scope.artists = data.artists;
        $scope.$broadcast('scroll.refreshComplete');
      })
    };
    $scope.toggleStar = function(item){
      item.star = !item.star;
    };
    $scope.onItemDelete = function(item){
      $scope.artists.splice($scope.artists.indexOf(item),1);
    };
    $scope.moveItem = function(item, fromIndex, toIndex){
      $scope.artists.splice(fromIndex,1);
      $scope.artists.splice(toIndex,0,item);
    };
    console.log(data);
  });

}]);
