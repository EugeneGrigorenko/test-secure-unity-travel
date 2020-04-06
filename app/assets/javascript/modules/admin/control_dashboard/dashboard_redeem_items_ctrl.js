(function () {
    this.app.controller('DashboardRedeemItemCtrl', [
        "$scope",
        function ($scope) {
            $scope.event_id = '';
            $scope.start_date = '';
            $scope.end_date = '';
            $scope.data = {};
            $scope.init = new function(){};

            $scope.show_vendor_redeem = function(data){
                return !angular.equals({}, data)
            };
        }
    ]);
}).call(this);