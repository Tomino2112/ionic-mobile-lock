// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    ionic.Platform.fullScreen();
    if(window.StatusBar) {
      StatusBar.hide();
    }
  });
});

app.config(function($stateProvider) {
  $stateProvider
      .state('standby', {
        url: '',
        templateUrl: 'templates/standby/main.html',
        controller: 'StandbyCtrl'
      })
      .state('standby.notifications',{
        url:'/',
        templateUrl:'templates/standby/notifications.html',
        controller: 'NotificationsCtrl'
      })
      .state('standby.screenlock', {
        templateUrl: 'templates/standby/screenlock.html',
        controller: 'ScreenLockCtrl'
      });
});

angular.module('starter').controller('StandbyCtrl',['$scope','$state',function($scope,$state){
  $scope.footerButtons = {
    back: false,
    dialer: true,
    lock: true,
    camera: true
  };

  // Automatically go to notifications
  $state.go('standby.notifications');

  $scope.goToScreenLock = function(){
    $scope.toggleFooterButtons();
    $state.go('standby.screenlock');
  };

  $scope.goToNotifications = function(){
    $scope.toggleFooterButtons();
    $state.go('standby.notifications');
  };

  $scope.toggleFooterButtons = function(){
    for (var k in $scope.footerButtons){
      $scope.footerButtons[k] = !$scope.footerButtons[k];
    }
  };
}]);

angular.module('starter').controller('NotificationsCtrl',['$scope','$interval',function($scope,$interval){
  $scope.tickInterval = 60; //s
  $scope.clock = Date.now();
  $scope.tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

    // @todo: MUST manually cancel interval
  $interval(function(){
    $scope.clock = Date.now();
  },$scope.tickInterval*1000);
}]);

angular.module('starter').controller('ScreenLockCtrl',['$scope','$timeout','$interval','$ionicGesture','$cordovaVibration',function($scope,$timeout,$interval,$ionicGesture,$cordovaVibration){
  var classy = {
    hasClass: function (ele, cls) {
      if (!ele || typeof ele.className === 'undefined') return false;
      return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    },
    addClass: function (ele, cls) {
      if (!ele) return false;
      if (!this.hasClass(ele, cls)) ele.className += " " + cls;
    },
    removeClass: function (ele, cls) {
      if (!ele) return false;
      if (this.hasClass(ele, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
      }
    }
  };

  $scope.currentComb = [];
  $scope.lastComb = [];
  $scope.combination = '';

  $scope.correctCombination = '12369';
  $scope.result = '';
    $scope.blockTries = 5;
    $scope.tries = $scope.blockTries*2; // Double it for now becaue events firing twice...
    $scope.block = false;
    $scope.blockCountDown = null;
    $scope.blockLength = 30;

  $scope.availableMoves = [ // array index+1 = point id
      [2,4,5],
      [1,3,4,5,6],
      [2,5,6],
      [1,2,5,7,8],
      [1,2,3,4,6,7,8,9],
      [2,3,5,8,9],
      [4,5,8],
      [4,5,6,7,9],
      [5,6,8]
  ];

  $ionicGesture.on('touch',function(e){
      var root = document.getElementsByClassName('screenlock')[0];
      var $scope = angular.element(root).scope();

      if ($scope.block) return;
    reset(false);

    // Bubble up
    var noddy = e.target;
    while(!classy.hasClass(noddy,'point') && noddy) {
      noddy = noddy.parentNode;
    }

    if (!noddy) return;

    highlighPoint(noddy);
  },angular.element(document.getElementsByClassName('combination')[0]));

  $ionicGesture.on('drag',function(e){
      var root = document.getElementsByClassName('screenlock')[0];
      var $scope = angular.element(root).scope();

      if ($scope.block) return;

    // Bubble up
    var noddy = e.target;
    while(!classy.hasClass(noddy,'point') && noddy) {
      noddy = noddy.parentNode;
    }

    if (!noddy) return;

    highlighPoint(noddy);
  },angular.element(document.getElementsByClassName('combination')[0]));

  $ionicGesture.on('release',function(e){
      var root = document.getElementsByClassName('screenlock')[0];
      var $scope = angular.element(root).scope();

      if ($scope.block) return;

    if ($scope.currentComb.length) {
      if ($scope.currentComb.join('') === $scope.correctCombination) {
        $scope.$apply(function(){
          $scope.result = 'Thats right!';
        });
      } else {
          $scope.$apply(function(){
              $scope.result = 'Wrong Pattern';
              $scope.tries--;
          });

          if ($scope.tries === 0){
              alert('You have incorrectly drawn your unlock pattern '+$scope.blockTries+' times. Try again in '+$scope.blockLength+' seconds.');
              blockScreenlock();
          }
      }
    }

    $timeout(function(){
      reset();
    },800);
  },angular.element(document.getElementsByClassName('combination')[0]));

    function highlighPoint(el, first){
        if (typeof first === 'undefined'){
            first = false;
        }

        var pointId = parseInt(el.dataset.point);

        var root = document.getElementsByClassName('screenlock')[0];
        var $scope = angular.element(root).scope();

        if ($scope.currentComb.indexOf(pointId)<0){
            if ($scope.currentComb.length){
                if ($scope.availableMoves[$scope.currentComb[$scope.currentComb.length-1]-1].indexOf(pointId)<0 && !first){
                    return;
                }
            }

            classy.addClass(el,'active');
            $scope.currentComb.push(pointId);
            if (ionic.Platform.isWebView()) {
                $cordovaVibration.vibrate(30);
            }
        }
    }

    function blockScreenlock(){
        var root = document.getElementsByClassName('screenlock')[0];
        var $scope = angular.element(root).scope();

        $scope.$apply(function(){
            $scope.block = true;
            $scope.result = 'Try again in '+$scope.blockLength+'s';
        });

        $scope.blockCountDown = $interval(function(count){
            $scope.blockLength--;
            $scope.result = 'Try again in '+$scope.blockLength+' s';

            if (!$scope.blockLength){
                $scope.block = false;
                $scope.result = '';
                $scope.tries = $scope.blockTries*2;
                $scope.blockLength = 30;
            }
        },1000,$scope.blockLength);
    }

  function reset(){
      var root = document.getElementsByClassName('screenlock')[0];
      var $scope = angular.element(root).scope();

    $scope.currentComb = [];
      if (!$scope.block) {
          $scope.result = '';
      }

    var points = document.getElementsByClassName('point');
    for(var i=0;i<points.length;i++){
      classy.removeClass(points[i],'active');
    }
  }
}]);
