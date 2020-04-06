// This controller depends on DashboardOrdersCtrl
(function () {
    this.app.controller('CancelOrdersFromControlDashboardCtrl', [
        "$scope",
        function ($scope) {

            $scope.clearData = function(){
                $scope.$parent.show_submit_result = false;
                $scope.$parent.submited_orders = [];
            };

            $scope.disableConfirmCancelButton = function(){
                var is_not_valid = false;
                if($scope.submited_orders.length > 0){
                    is_not_valid = $.grep($scope.submited_orders, function(x){return x.is_successful}).length > 0;
                }
                return $scope.selected_orders.length == 0 || is_not_valid;
            };

            $scope.submitCancelOrders = function(){
                if($scope.disableConfirmCancelButton()){
                    return;
                }

                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to cancel for the selected order(s)?', function (confirmed) {
                    if (confirmed) {
                        var submit_cancel_orders_url = '/group_travel_control_dashboards/order-dashboard/cancel-orders';
                        var options = {selected_orders: angular.toJson($scope.selected_orders)};
                        $.post(submit_cancel_orders_url, options, function(result){
                            bootbox.alert(result.message);
                            if(result.is_successful){
                                $('#cancel_orders_modal').modal('hide');
                                wiselinks.load();
                            }else{
                                $scope.$parent.$apply(function(){
                                    $scope.$parent.submited_orders = result.orders_result;
                                    if(result.orders_result.length > 0){
                                        $scope.$parent.show_submit_result = true;
                                    }
                                });
                            }
                        });
                    }
                });
            };
        }
    ]);
}).call(this);