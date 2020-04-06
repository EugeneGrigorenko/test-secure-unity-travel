(function () {
    this.app.controller('DashboardActivityAddonCtrl', [
        "$scope",
        function ($scope) {
            $scope.event_id = '';
            $scope.start_date = '';
            $scope.end_date = '';
            $scope.data = {};

            $scope.init = new function(){};

            $scope.loadMoreOrders = function(product, limit){
                var loadMoresUrl = "/group_travel_control_dashboards/" + $scope.event_id + "/" +  product.product_id + "/" + $scope.start_date + "/" + $scope.end_date + "/load-more-activity-addon-orders";

                $.post(loadMoresUrl, {offset: product.orders.length, limit: limit}, function(result){
                    if(result.length > 0){
                        $scope.$apply(function(){
                            $.merge(product.orders, result);
                        });
                    }
                });
            };
        }
    ]);
}).call(this);
