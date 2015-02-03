// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])

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
        url: '/',
        templateUrl: 'templates/standby/main.html',
        controller: 'StandbyCtrl'
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

  $scope.goToScreenLock = function(){
    $scope.toggleFooterButtons();
    $state.go('standby.screenlock');
  };

  $scope.goToStandby = function(){
    $scope.toggleFooterButtons();
    $state.go('standby');
  };

  $scope.toggleFooterButtons = function(){
    for (var k in $scope.footerButtons){
      $scope.footerButtons[k] = !$scope.footerButtons[k];
    }
  };
}]);

angular.module('starter').controller('ScreenLockCtrl',['$scope','$ionicGesture',function($scope,$ionicGesture){
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

  $ionicGesture.on('dragstart',function(e){
    reset(false);

    // Bubble up
    var noddy = e.target;
    while(!classy.hasClass(noddy,'point') && noddy) {
      noddy = noddy.parentNode;
    }

    if (!noddy) return;

    if (!classy.hasClass(noddy,'active')){
      var pointId = noddy.dataset.point;

      if ($scope.currentComb.indexOf(pointId)<0){
        classy.addClass(noddy,'active');
        $scope.currentComb.push(pointId);
      }
    }
  },angular.element(document.getElementsByClassName('combination')[0]));

  $ionicGesture.on('drag',function(e){
    // Bubble up
    var noddy = e.target;
    while(!classy.hasClass(noddy,'point') && noddy) {
      noddy = noddy.parentNode;
    }

    if (!noddy) return;

    var pointId = parseInt(noddy.dataset.point);

    if ($scope.currentComb.indexOf(pointId)<0){
      if ($scope.currentComb.length){
        if ($scope.availableMoves[$scope.currentComb[$scope.currentComb.length-1]-1].indexOf(pointId)<0){
          return;
        }
      }

      classy.addClass(noddy,'active');
      $scope.currentComb.push(pointId);
    }
  },angular.element(document.getElementsByClassName('combination')[0]));

  $ionicGesture.on('dragend',function(e){
    reset();
  },angular.element(document.getElementsByClassName('combination')[0]));

  function reset(testCombination){
    if (typeof testCombination === 'undefined'){
      testCombination = true;
    }

    if (testCombination){
      if ($scope.currentComb.join('') === $scope.correctCombination){
        alert('Thats right!');
        $scope.result = 'Thats right!';
      } else {
        alert('Wrong Pattern');
        $scope.result = 'Wrong Pattern';
      }
    }

    $scope.currentComb = [];

    var points = document.getElementsByClassName('point');
    for(var i=0;i<points.length;i++){
      classy.removeClass(points[i],'active');
    }
  }
}]);
