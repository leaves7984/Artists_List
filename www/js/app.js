// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','chart.js','ui.router','ion-datetime-picker','ion-floating-menu'])

.run(function($ionicPlatform,$ionicSideMenuDelegate) {
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

  .config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
  })


.config(function($stateProvider,$urlRouterProvider){

  $stateProvider
    .state('editProfile',{
      url:'/edit',
      templateUrl: 'templates/editProfile.html',
      controller: 'EditProfileController'

    })


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
          controller: 'RegisterController'
        },
        cache: false
      }
    })
  // setup an abstract state for the tabs directive

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: 'templates/sidemenu.html',
      controller: 'sideBarController'
    })
    .state('app.tabs', {
      url: "/tabs",
      views: {
        'menuContent': {
          templateUrl: 'templates/tabs.html',
          controller: 'tabsController'
        }
      }
    })

    // Each tab has its own nav history stack:

    .state('app.tabs.list', {
      url: '/list',
      views: {
        'tab-list': {
          templateUrl: 'templates/list.html',
          controller: 'ListController'
        }
      },
      cache:false
    })

    .state('app.tabs.addPatient', {
      url: '/list/addPatient',
      views: {
        'tab-list': {
          templateUrl: 'templates/addPatient.html',
          controller: 'AddPatientController'
        }
      },
      cache: false
    })

    .state('app.tabs.addPrescription', {
      url: '/list/addPrescription',
      views: {
        'tab-list': {
          templateUrl: 'templates/addPrescription.html',
          controller: 'AddPrescriptionController'
        }
      },
      cache: false
    })

    .state('app.tabs.calendar', {
      url: '/calendar',
      views: {
        'tab-calendar' : {
          templateUrl: 'templates/calendar.html',
          controller: 'CalendarController'
        }
      },
      cache: false
    })



    .state('app.tabs.summary', {
      url: '/summary',
      views: {
        'tab-summary' : {
          templateUrl: 'templates/summary.html',
          controller: 'GraphController'
        }
      }
    })

    .state('app.tabs.detail', {
      url: '/list/detail/:aid',
      views: {
        'tab-list' : {
          templateUrl: 'templates/detail.html',
          controller: 'ListController'
        }
      },
      cache:false
    })

    .state('app.tabs.addEvent', {
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
  .controller('tabsController', function($scope, $ionicSideMenuDelegate) {

    $scope.showRightMenu = function() {
      $ionicSideMenuDelegate.toggleRight();
    };

  })

  .controller('sideBarController',function ($scope,$state,Auth) {

    $scope.LogOut = function () {
      Auth.logout();
      $state.go('auth.login');
    };
    $scope.username = Auth.getUser();

  })

  .controller("LoginController",function ($scope, $http, $state, Auth) {

    $scope.data = {
      username: "",
      password: ""
    };
    $scope.login = function(data) {
      if(data.username === ""|| data.password === ""){
        alert("please input username and password");
      }
      var result = Auth.login(data);
      result.then(function (data) {
        console.log(data);
        $state.go('app.tabs.summary');

      }).catch(function (reason){
        $scope.message = true;
        $scope.data.password = null;
      });
    };
    $scope.clearInput = function() {
      $scope.message = false;
    }



  })

  .controller("EditProfileController",function($scope,$state,Auth){
    $scope.goBack = function(){
      $state.go('app.tabs.summary');
    };
    Auth.getUserInfo().then(function(data){
      $scope.currentUser = data;
    });
    console.log($scope.currentUser);

  })

  .controller("RegisterController",function($scope,$state,Auth){
    $scope.data = {
      username: "",
      password: "",
      email:""
    };
    $scope.userRegex = '[a-zA-Z]{8,}';
    $scope.passRegex = '[a-zA-Z]{5,}';

    $scope.SignUp = function(){
      if($scope.data.username === ""||$scope.data.password ===""|| $scope.data.email === ""){
        alert("please fill all blanks");
      } else{
        var result = Auth.register($scope.data);
        result.then(function(data){
          alert("register succeed!")
        }).catch(function(data){
          alert("register failure");
        });
        $state.go('auth.login');
      }

    };

    $scope.goBack = function(){
      $state.go('auth.login');
    };
  })


  .controller("AddEventController",function($scope, $http, $state, Auth, MESSAGE_NOTICE, $rootScope, $timeout,$ionicLoading){

    $scope.event = {
      fromWhichDay: new Date(),
      toWhichDay: new Date(),
      title: null,
      description: null,
      type: 'DAILY',
      weekTimes: 1
    };
    $scope.event.toWhichDay.setHours($scope.event.toWhichDay.getHours() + 1);

    $scope.setType = function(data) {
      $scope.event.type = data;
    }

    $scope.goBack = function(){
      $state.go('app.tabs.summary');
    };
    $scope.goBackToDoctor = function(){
      $state.go('app.tabs.list');
    };

    $scope.confirm = function(){

        if($scope.event.title == null|| $scope.event.description == null){
          alert("please fill all the blanks");
        }else{
          Auth.addEvent($scope.event);
          $rootScope.$emit(MESSAGE_NOTICE.ADD_NEW_EVENT);
          $ionicLoading.show({
            content: '<i class="ion-loading-c"></i> ',
            animation: 'fade-in',
            noBackdrop: false,
            maxWidth: 200,
            showDelay: 500
          });
          $timeout(function () {
            $ionicLoading.hide();
            $state.go('app.tabs.summary');
          }, 2000);
        }

      };

  })

  .controller("AddPrescriptionController", function ($scope, $http, $state, Auth, MESSAGE_NOTICE, $rootScope, $timeout, $ionicLoading) {

    Auth.getPatient().then(function (data) {
      $scope.doctors = data;
    });
    $scope.event = {
      fromWhichDay: new Date(),
      toWhichDay: new Date(),
      title: null,
      description: null,
      type: 'DAILY',
      weekTimes: 1,
      patient: null,
    };



    $scope.event.toWhichDay.setHours($scope.event.toWhichDay.getHours() + 1);

    $scope.setType = function (data) {
      $scope.event.type = data;
    }

    $scope.goBackToDoctor = function () {
      $state.go('app.tabs.list');
    };

    $scope.confirm = function () {
      console.log($scope.event)
      if ($scope.event.title == null || $scope.event.description == null) {
        alert("please fill all the blanks");
      } else {
        Auth.addPrescription($scope.event);
        $rootScope.$emit(MESSAGE_NOTICE.ADD_NEW_EVENT);
        $ionicLoading.show({
          content: '<i class="ion-loading-c"></i> ',
          animation: 'fade-in',
          noBackdrop: false,
          maxWidth: 200,
          showDelay: 500
        });
        $timeout(function () {
          $ionicLoading.hide();
          $state.go('app.tabs.list');
        }, 2000);
      }

    };

  })
  .controller("AddPatientController", function ($scope, $http, $state, Auth) {

    $scope.event = {
      name: null,
      sex: null,
      phone: null,
      email: null,
      address: null,
      description: null
    };

    $scope.goBack = function () {
      $state.go('app.tabs.list');
    };

    $scope.confirm = function () {

      if ($scope.event.name == null || $scope.event.description == null) {
        alert("please fill all the blanks");
      } else {
        Auth.addPatient($scope.event);
        $state.go('app.tabs.list');
      }

    };

  })

  .controller("GraphController", function($scope, $state, Auth, MESSAGE_NOTICE, $rootScope) {
    var sportsArray = [];
    var timeArray = [];
    var last7days = [];
    $rootScope.$on(MESSAGE_NOTICE.ADD_NEW_EVENT, function (event) {
      console.log("load new event");
      $scope.doRefresh();
     });

    Auth.calendar().then(function (data) {
      $scope.calendar = data.calendar;
      angular.forEach($scope.calendar, function (item) {

        console.log("schedule::" + item.date);
        var time = new Date(item.date);
        var now = new Date();
        var timediff = (now - time) / (1000 * 60 * 60 * 24);

        if (timediff < 8 && timediff >= 0) {
          for (var i = 0; i < item.schedule.length; i++) {
            var index = sportsArray.indexOf(item.schedule[i].sports);
            if (index >= 0) {
              timeArray[index] += item.schedule[i].time;
            } else {
              sportsArray.push(item.schedule[i].sports);
              timeArray.push(item.schedule[i].time);

            }

          }
          last7days.push(item);

        }
      });
      $scope.last7days = last7days;
      $scope.labels = sportsArray;
      $scope.data = timeArray;

    });
    $scope.toggleStar = function (item) {
      item.star = !item.star;
    };

    $scope.onItemDelete = function (day, item) {
      var time = new Date(day.date);
      var now = new Date();
      var timediff = (now - time) / (1000 * 60 * 60 * 24);
      dayIndex = $scope.last7days.indexOf(day);
      $scope.last7days[dayIndex].schedule.splice($scope.last7days[dayIndex].schedule.indexOf(item), 1);
      if (timediff < 8 && timediff >= 0) {
        var index = sportsArray.indexOf(item.sports);
        timeArray[index] -= item.time;
      }


    };
    $scope.onDelete = function (day, item) {
      console.log(day);
      console.log(item);
      Auth.deleteSchedule(day.id, item.id);
      dayIndex = $scope.last7days.indexOf(day);
      $scope.last7days[dayIndex].schedule.splice($scope.last7days[dayIndex].schedule.indexOf(item), 1);
      $scope.doRefresh();

    };




      $scope.jumpToUrl = function(data){
        $state.go('app.tabs.addEvent');
      };

      $scope.doRefresh =function(){
        sportsArray = [];
        timeArray = [];
        last7days = [];
        console.log("do refresh")
        Auth.calendar().then(function (data) {
          $scope.calendar = data.calendar;
          angular.forEach($scope.calendar, function(item){
            var time = new Date(item.date);
            var now = new Date();
            var timediff = (now - time) / (1000 * 60 * 60 * 24);

            if(timediff < 8 && timediff >=0) {

              for (var i = 0; i < item.schedule.length; i++) {
                var index = sportsArray.indexOf(item.schedule[i].sports);
                if (index >= 0) {
                  timeArray[index] += item.schedule[i].time;
                } else {
                  sportsArray.push(item.schedule[i].sports);
                  timeArray.push(item.schedule[i].time);
                }

              }
              last7days.push(item);
            }

          });
          $scope.labels = sportsArray;
          $scope.data = timeArray;
          $scope.last7days = last7days;
          console.log($scope.last7days)
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

    })


  .controller('CalendarController',['$scope','$http','$state',function($scope, $http){
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

.controller('ListController',['$scope','$http','$state','$rootScope','Auth',
function($scope, $http, $state,$rootScope, Auth){
  Auth.getPatient().then(function (data) {
    $scope.data = data;
    $scope.manage = { showDelete: false, showReorder: false };
    $scope.jumpToUrl = function(item){
      console.log(item);
      $state.go('app.tabs.detail',{aid:item.id});
      console.log("#/tab/list/"+item.id);
      $rootScope.detail = item;
    };
    $scope.goBack = function(){
      $state.go('app.tabs.list');
    };
    $scope.doRefresh =function(){
      Auth.getPatient().then(function(data){
        $scope.data = data;
        $scope.$broadcast('scroll.refreshComplete');
      })
    };
    $scope.toggleStar = function(item){
      item.star = !item.star;
    };
    $scope.onItemDelete = function(item){
      $scope.data.splice($scope.data.indexOf(item),1);
    };
    $scope.moveItem = function(item, fromIndex, toIndex){
      $scope.data.splice(fromIndex,1);
      $scope.data.splice(toIndex,0,item);
    };
    $scope.addPatient = function() {
      $state.go('app.tabs.addPatient');
    };
    $scope.addPrescription = function () {
      $state.go('app.tabs.addPrescription');
    };
    $scope.jumpToUrl = function (item) {
      console.log(item);
      $state.go('app.tabs.detail', {aid: item.id});
      console.log("#/tab/list/" + item.id);
      $rootScope.detail = item;
      console.log($rootScope.detail)
    };

    $scope.onDelete = function (item) {
      Auth.deleteDoctor(item.id);
      $scope.data.splice($scope.data.indexOf(item), 1);
    };
  });

}]);
