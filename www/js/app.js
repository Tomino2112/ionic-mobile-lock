// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic','ngCordova'])

.run(function($ionicPlatform, $ionicConfig) {
        $ionicConfig.views.transition('android');
  $ionicPlatform.ready(function() {
    ionic.Platform.fullScreen();
      StatusBar.hide();
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

      // Line
      if ($scope.currentLine){
          var line = $scope.currentLine;
          var startPoint = [parseInt(line.style.left),parseInt(line.style.top)],
              endPoint = [e.gesture.center.pageX,e.gesture.center.pageY],
              length = Math.sqrt((endPoint[0] - startPoint[0]) * (endPoint[0] - startPoint[0])
              + (endPoint[1] - startPoint[1]) * (endPoint[1] - startPoint[1])),
              angle = 180 / 3.1415 * Math.acos((endPoint[1] - startPoint[1]) / length);

          if(endPoint[0] > startPoint[0])
              angle *= -1;

          line.style.height=(length-1)+"px";
          line.style.transform= "rotate("+angle+"deg)";
      }

    // Bubble up
    var noddy = document.elementFromPoint(e.gesture.center.pageX,e.gesture.center.pageY);

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

      if ($scope.currentLine && $scope.currentLine.parentNode){
          $scope.currentLine.parentNode.removeChild($scope.currentLine);
      }

    if ($scope.currentComb.length) {
        var combination = document.getElementsByClassName('screenlock')[0];
        classy.addClass(combination,'finished');

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

    $scope.currentLine = null;
    $scope.lastPoint = null;

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

            if ($scope.currentLine && $scope.currentComb.length>0){
                endLine($scope.lastPoint, el, $scope);
            }
            addLine(el,$scope);

            $scope.lastPoint = el;

            classy.addClass(el,'active');
            $scope.currentComb.push(pointId);
            if (ionic.Platform.isWebView()) {
                $cordovaVibration.vibrate(10);
            }
        }
    }

    function addLine(point,$scope){
        // Create line
        var line = document.createElement('div'),
            span = point.getElementsByTagName('span')[0],
            offset = getOffset(span),
            spanWidth = parseInt(span.offsetWidth);

        classy.addClass(line,'line');
        line.style.top = (offset.top+(spanWidth/2))+'px';
        line.style.left = (offset.left+(spanWidth/2))+'px';

        var root = document.getElementsByClassName('screenlock')[0];
        root.appendChild(line);

        $scope.currentLine = line;
    }

    function endLine(last, current, $scope){
        var span = current.getElementsByTagName('span')[0],
            spanWidth = span.offsetWidth,
            offset = getOffset(current.getElementsByTagName('span')[0]),
            startPoint = [parseInt($scope.currentLine.style.left),parseInt($scope.currentLine.style.top)],
            endPoint = [(offset.left+(spanWidth/3)),(offset.top+(spanWidth/3))],
            length = Math.sqrt((endPoint[0] - startPoint[0]) * (endPoint[0] - startPoint[0])
            + (endPoint[1] - startPoint[1]) * (endPoint[1] - startPoint[1]))+(spanWidth/3),
            angle = 180 / 3.1415 * Math.acos((endPoint[1] - startPoint[1]) / length);

        if (angle>0 && angle<35){
            angle = 0;
        } else if (angle>34 && angle<80) {
            angle = 45;
        } else if (angle>79 && angle<125){
            angle = 90;
        } else if (angle>124 && angle<160){
            angle = 135;
        } else {
            angle = 180;
        }

        if(endPoint[0] > startPoint[0]) {
            angle *= -1;
        }

        $scope.currentLine.style.height=length+"px";
        $scope.currentLine.style.transform= "rotate("+angle+"deg)";

        $scope.currentLine = null;
    }

    function getOffset(el) {
        el = el.getBoundingClientRect();
        return {
            left: el.left + window.scrollX,
            top: el.top + window.scrollY
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

      var combination = document.getElementsByClassName('screenlock')[0];
      classy.removeClass(combination,'finished');

    var points = document.getElementsByClassName('point');
    for(var i=0;i<points.length;i++){
      classy.removeClass(points[i],'active');
    }

    var lines = root.getElementsByClassName('line');
      while(lines.length > 0){
          lines[0].parentNode.removeChild(lines[0]);
      }
  }
}]);
