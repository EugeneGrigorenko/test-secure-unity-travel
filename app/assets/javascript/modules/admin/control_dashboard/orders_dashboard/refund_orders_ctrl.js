// This controller depends on DashboardOrdersCtrl
(function () {
    this.app.controller('RefundOrdersFromControlDashboardCtrl', [
        "$scope",
        function ($scope) {
            $scope.reason_type = null;
            $scope.other_reason = '';

            $scope.clearData = function(){
                $scope.reason_type = null;
                $scope.other_reason = '';
                $scope.show_submit_result = false;
                $scope.submited_orders = [];
            };

            $scope.disableConfirmRefundButton = function(){
                var is_not_valid = false;
                if($scope.submited_orders.length > 0){
                    is_not_valid = $.grep($scope.submited_orders, function(x){return x.is_successful}).length > 0;
                }

                return $scope.selected_orders.length == 0 || $scope.reason_type == null || ($scope.reason_type == 0 && $scope.other_reason == '') || is_not_valid;
            };

            $scope.submitRefundOrders = function(){
                if($scope.disableConfirmRefundButton()){
                    return;
                }

                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to refund the selected order(s)?', function (confirmed) {
                    if (confirmed) {
                        var submit_refund_orders_url = '/group_travel_control_dashboards/order-dashboard/refund-orders';
                        var options = {selected_orders: angular.toJson($scope.selected_orders),
                                       reason_type: $scope.reason_type,
                                       reason_of_refund: $scope.other_reason};
                        $.post(submit_refund_orders_url, options, function(result){
                            bootbox.alert(result.message);
                            if(result.is_successful){
                                $('#refund_orders_modal').modal('hide');
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