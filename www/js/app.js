// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});


angular.module('starter').controller('CombinationCtrl',['$scope','$ionicGesture',function($scope,$ionicGesture){
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

  $scope.availableMoves = [ // array index+1 = area id
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

  $ionicGesture.on('dragstart',function(e){ console.log('drag start');
    reset(false);

    // Bubble up
    var noddy = e.target;
    while(!classy.hasClass(noddy,'area') && noddy) {
      noddy = noddy.parentNode;
    }

    if (!noddy) return;

    if (!classy.hasClass(noddy,'active')){
      var areaId = noddy.dataset.area;

      if ($scope.currentComb.indexOf(areaId)<0){
        classy.addClass(noddy,'active');
        $scope.currentComb.push(areaId);
      }
    }
  },angular.element(document.getElementsByClassName('combination')[0]));

  $ionicGesture.on('drag',function(e){ console.log('dragging');
    // Bubble up
    var noddy = e.target;
    while(!classy.hasClass(noddy,'area') && noddy) {
      noddy = noddy.parentNode;
    }

    if (!noddy) return;

    var areaId = parseInt(noddy.dataset.area);

    if ($scope.currentComb.indexOf(areaId)<0){
      if ($scope.currentComb.length){
        if ($scope.availableMoves[$scope.currentComb[$scope.currentComb.length-1]-1].indexOf(areaId)<0){
          return;
        }
      }

      classy.addClass(noddy,'active');
      $scope.currentComb.push(areaId);
    }
  },angular.element(document.getElementsByClassName('combination')[0]));

  $ionicGesture.on('dragend',function(e){ console.log('dragend');
    reset();
  },angular.element(document.getElementsByClassName('combination')[0]));

  function reset(showCombination){
    if (typeof showCombination === 'undefined'){
      showCombination = true;
    }

    $scope.lastComb = angular.copy($scope.currentComb);
    $scope.currentComb = [];

    if (showCombination){
      alert($scope.lastComb);
    }

    var areas = document.getElementsByClassName('area');
    for(var i=0;i<areas.length;i++){
      classy.removeClass(areas[i],'active');
    }
  }
}]);
