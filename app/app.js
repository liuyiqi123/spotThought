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
    this.getProject = function () {
        var d = $q.defer();
        $http.get("/spotThought/scenicController/getScenicInfo.do")
            .success(function (response) {
                d.resolve(response);
            })
            .error(function () {
                alert(0)
                d.reject("error");
            });
        return d.promise;
    }
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
    this.postComment = function (params) {
        var d = $q.defer();
        $http.post("mock/postComment.json", { id: params })
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
    apiService.getProject().then(function (data) {
        $scope.logoText = data.name;
    }, function (data) {
        $scope.message = "Error: " + data.status + " " + data.statusText;
    });

    apiService.getItemList().then(function (data) {
        $scope.itemList = data.itemList;
        for (i in $scope.itemList) {
            var item = $scope.itemList[i];
            item.progressClass = progressFn(item.progress, false);
            item.style = {
                "background-image": "url(" + item.itemImg + ")",
                "background-size": "cover"
            };
        }
        $scope.isLoading = false;
    }, function (data) {
        $scope.message = "Error: " + data.status + " " + data.statusText;
    });
    $scope.isLoading = true;
    $scope.loadingMsg = "加载中...";
    $scope.defaultOrder = {
        "progress": true,
        "progressIcon": null,
        "name": true,
        "nameIcon": null,
        "isDesc": "",
        "orderParam": "name"
    }

    $scope.setOrder = function (param, $event) {
        if ($event) { $event.stopPropagation() };
        if (param == "progress") {
            $scope.defaultOrder.isDesc = $scope.defaultOrder.progress ? "" : "desc";
            $scope.defaultOrder.nameIcon = null;
            $scope.defaultOrder.progress = !$scope.defaultOrder.progress;
            $scope.defaultOrder.progressIcon = $scope.defaultOrder.progress ? "oi-arrow-bottom" : "oi-arrow-top";
        } else if (param == "name") {
            $scope.defaultOrder.isDesc = $scope.defaultOrder.name ? "" : "desc";
            $scope.defaultOrder.progressIcon = null;
            $scope.defaultOrder.name = !$scope.defaultOrder.name;
            $scope.defaultOrder.nameIcon = $scope.defaultOrder.name ? "oi-arrow-bottom" : "oi-arrow-top";
        } else {
            return
        }
        $scope.defaultOrder.orderParam = param;
    }

}).controller('detailController', function ($scope, $stateParams, apiService) {
    $scope.isLoading = true;
    $scope.loadingMsg = "加载中...";
    $scope.itemID = $stateParams.itemID;
    apiService.getItemDetail($scope.itemID).then(function (data) {
        $scope.item = data.item;
        $scope.item.badgeClass = progressFn($scope.item.progress, true);
    }, function (data) {
        $scope.message = "Error: " + data.status + " " + data.statusText;;
    });

    apiService.getCommentList($scope.itemID).then(function (data) {
        $scope.commentList = data.commentList;
        $scope.isLoading = false;
    }, function (data) {
        $scope.message = "Error: " + data.status + " " + data.statusText;;
    });

    $scope.commentModal = function () {

    };
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
}).directive('carouseImg', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.carousel({
                interval: 2000
            });
        }
    };
}).directive('formHandler', function (apiService, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var targetModal = element.closest("#commentModals").find("#Modalshort");
            var closeDelay = function () {
                targetModal.modal("hide");
            };
            var randomGuest = "游客" + Math.floor(Math.random() * 10000);
            element.find("#guestName")[0].setAttribute('placeholder', randomGuest);
            element.closest("#ModalLong").find("#submit").on("click", function () {
                apiService.postComment(scope.itemID).then(function (data) {
                    if (data.status == "success") {
                        var targetModal = element.closest("#commentModals").find("#Modalshort");
                        element.closest("#commentModals").find("#messageInput").html(data.message);
                        targetModal.modal('show');
                        $timeout(closeDelay, 1000);
                        element.closest("#ModalLong").modal('hide');
                    } else {
                        element.closest("#commentModals").find("#messageInput").html(data.message);
                        targetModal.modal('show');
                        $timeout(closeDelay, 1000);
                    }
                }, function (data) {
                    $scope.message = "Error: " + data.status + " " + data.statusText;;
                });
            });
        }
    };
});

function progressFn(progress, badge) {
    var progressNum = parseInt(progress), progressClass = "";
    if (progressNum >= 80) {
        progressClass = badge ? "badge-danger" : "bg-danger";
    } else if (progressNum >= 60) {
        progressClass = badge ? "badge-warning" : "bg-warning";
    } else {
        progressClass = badge ? "badge-success" : "bg-success";
    }
    return progressClass;
}