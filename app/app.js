var myApp = angular.module('myApp', ['ui.router']);

myApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider.state('home', {
        url: '/home',
        views: {
            'navbar': {
                templateUrl: 'view/navbar.html',
                controller: 'homeController'
            },
            'content': {
                templateUrl: 'view/home.html',
                controller: 'homeController'
            }
        }
    }).state('detail', {
        url: '/detail/:itemID',
        params: { "itemID": null },
        views: {
            'navbar': {
                templateUrl: 'view/navbar.html',
                controller: 'homeController'
            },
            'content': {
                templateUrl: 'view/detail.html',
                controller: 'detailController'
            }
        }
    });

});

myApp.run(function ($rootScope, $stateParams) {
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $rootScope.activeItem = toState.name == 'home' ? 'home' : toParams.itemID;
    });
});

myApp.service('apiService', function ($http, $q) {
    this.getItemList = function () {
        var d = $q.defer();
        $http.get("mock/itemList.json")
            .success(function (response) {
                d.resolve(response);
            })
            .error(function () {
                alert(0)
                d.reject("error");
            });
        return d.promise;
    }
    this.getItemDetail = function (params) {
        var d = $q.defer();
        $http.post("mock/item.json", { id: params })
            .success(function (response) {
                d.resolve(response);
            })
            .error(function () {
                alert(0)
                d.reject("error");
            });
        return d.promise;
    }
    this.getCommentList = function (params) {
        var d = $q.defer();
        $http.post("mock/comment.json", { id: params })
            .success(function (response) {
                d.resolve(response);
            })
            .error(function () {
                alert(0)
                d.reject("error");
            });
        return d.promise;
    }

}).controller('homeController', function ($scope, apiService, $rootScope, $stateParams) {
    $scope.logoText = 'USJ';

    apiService.getItemList().then(function (data) {
        $scope.itemList = data.itemList;
    }, function (data) {
        alert(data);
    });

}).controller('detailController', function ($scope, $stateParams, apiService) {
    $scope.itemID = $stateParams.itemID;
    apiService.getItemDetail($scope.itemID).then(function (data) {
        $scope.item = data.item;
    }, function (data) {
        alert(data);
    });

    apiService.getCommentList($scope.itemID).then(function (data) {
        $scope.commentList = data.commentList;
    }, function (data) {
        alert(data);
    });
}).directive('defaultImg', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var uID = scope.user.id;
            var uname = scope.user.name;
            var name = uname.charAt(0);
            var fontSize = 30;
            var fontWeight = 'bold';

            var canvas = element[0].children[1];
            canvas.width = 60;
            canvas.height = 60;
            var context = canvas.getContext('2d');
            context.fillStyle = '#ccc';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#333';
            context.font = fontWeight + ' ' + fontSize + 'px sans-serif';
            context.textAlign = 'center';
            context.textBaseline = "middle";
            context.fillText(name, fontSize, fontSize);
            element[0].children[0].setAttribute('src', canvas.toDataURL("image/png"));
        }
    };
});