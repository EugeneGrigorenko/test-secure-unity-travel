// This controller depends on DashboardOrdersCtrl
(function () {
    this.app.controller('AdjustOrdersFromControlDashboardCtrl', [
        "$scope",
        function ($scope) {
            $scope.additional_fee = 0;
            $scope.apply_to_amount = true;
            $scope.show_reason_of_refund = false;
            $scope.reason_type = null;
            $scope.other_reason = '';
            $scope.show_applied_amount = true;
            $scope.invalid_price_apply = false;

            $scope.$watch('additional_fee', function() {
                $scope.updateChangedAmount();
            });

            $scope.$watch('apply_to_amount', function() {
                $scope.updateChangedAmount();
                $scope.disableConfirmAdjustButton();
            });

            $scope.clearData = function(){
                $scope.additional_fee = 0;
                $scope.apply_to_amount = true;
                $scope.show_reason_of_refund = false;
                $scope.reason_type = null;
                $scope.other_reason = '';
                $scope.$parent.show_submit_result = false;
                $scope.$parent.submited_orders = [];
            };

            $scope.setDefaultFee = function(){
                if($scope.additional_fee == ''){
                    $scope.additional_fee = 0;
                }
            };

            $scope.updateChangedAmount = function(){
                $.each($scope.selected_orders, function (index, order) {
                    order.changed_amount = parseFloat($scope.additional_fee);

                    if($scope.apply_to_amount){
                        // Adjust Order
                        order.new_total_price = order.changed_amount;
                    }else{
                        // Adjust Balance due
                        order.new_total_price = parseFloat(order.total_price) - parseFloat(order.balance_due) + order.changed_amount;
                    }
                });
            };

            $scope.disableConfirmAdjustButton = function(){
                $scope.show_reason_of_refund = false;
                var is_not_valid = false;
                if($scope.submited_orders.length > 0){
                    is_not_valid = $.grep($scope.submited_orders, function(x){return x.is_successful}).length > 0;
                }

                if(!is_not_valid && $scope.selected_orders.length > 0){
                    is_not_valid = $.grep($scope.selected_orders, function(x){return x.changed_amount == parseFloat($scope.apply_to_amount ? x.total_price : x.balance_due)}).length > 0;
                    $scope.invalid_price_apply = is_not_valid;
                }

                if(parseFloat($scope.additional_fee) > 0 && $scope.apply_to_amount && $scope.selected_orders.length > 0){
                    $scope.show_reason_of_refund = $.grep($scope.selected_orders, function(x){return (parseFloat(x.total_price) - parseFloat(x.balance_due)) > x.changed_amount}).length > 0;
                    if(!is_not_valid && $scope.show_reason_of_refund){
                        is_not_valid = $scope.reason_type == null || ($scope.reason_type == 0 && $scope.other_reason == '');
                    }
                }

                return $scope.selected_orders.length == 0 || $scope.additional_fee <= 0 || is_not_valid;
            };

            $scope.submitAdjustOrderBalanceDue = function(){
                if($scope.disableConfirmAdjustButton()){
                    return;
                }

                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to adjust amount for the selected order(s)?', function (confirmed) {
                    if (confirmed) {
                        var submit_adjust_orders_url = '/group_travel_control_dashboards/order-dashboard/adjust-orders';
                        var options = {selected_orders: angular.toJson($scope.selected_orders),
                                       adjusted_amount: $scope.additional_fee,
                                       apply_to_amount: $scope.apply_to_amount,
                                       reason_type: $scope.reason_type,
                                       reason_of_refund: $scope.other_reason,
                                        note: $scope.note};
                        $.post(submit_adjust_orders_url, options, function(result){
                            bootbox.alert(result.message);
                            if(result.is_successful){
                                $('#adjust_orders_modal').modal('hide');
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