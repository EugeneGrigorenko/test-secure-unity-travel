// This controller depends on DashboardOrdersCtrl
(function () {
    this.app.controller('DecreaseOrdersFromControlDashboardCtrl', [
        "$scope",
        function ($scope) {
            $scope.additional_fee = 0;
            $scope.fee_type = true; //if true USD else %
            $scope.apply_to_amount = true; //if true apply to order total price else balance due
            $scope.minimum_price_apply = 0;
            $scope.show_reason_of_refund = false;
            $scope.reason_type = null;
            $scope.other_reason = '';
            $scope.show_applied_amount = true;
            $scope.invalid_price_apply = false;

            $scope.$watch('additional_fee', function(new_val) {
                if(!$scope.fee_type && new_val > 100){
                    $scope.additional_fee = 100;
                }
                $scope.updateChangedAmount();
            });

            $scope.$watch('fee_type', function() {
                if(!$scope.fee_type && $scope.additional_fee > 100){
                    $scope.additional_fee = 0;
                }
                $scope.updateChangedAmount();
            });

            $scope.$watch('apply_to_amount', function() {
                $scope.updateChangedAmount();
            });

            $scope.clearData = function(){
                $scope.additional_fee = 0;
                $scope.fee_type = true;
                $scope.apply_to_amount = true;
                $scope.minimum_price_apply = 0;
                $scope.exceed_minimum_price_apply = false;
                $scope.show_reason_of_refund = false;
                $scope.reason_type = null;
                $scope.other_reason = '';
                $scope.$parent.show_submit_result = false;
                $scope.$parent.submited_orders = [];
                $scope.invalid_price_apply = false;
            };

            $scope.setDefaultFee = function(){
                if($scope.additional_fee == ''){
                    $scope.additional_fee = 0;
                }
            };

            $scope.updateChangedAmount = function(){
                $.each($scope.selected_orders, function (index, order) {
                    var deducted_amount = 0;
                    if($scope.fee_type){
                        deducted_amount = parseFloat($scope.additional_fee);
                    }else{
                        var tempAmount = parseFloat($scope.apply_to_amount ? order.total_price : order.balance_due);
                        deducted_amount = parseFloat($scope.additional_fee * tempAmount / 100);
                    }

                    order.changed_amount = deducted_amount;
                    order.new_total_price = parseFloat(order.total_price) - deducted_amount;
                });
            };

            $scope.disableConfirmDecreaseButton = function(){
                $scope.show_reason_of_refund = false;
                $scope.exceed_minimum_price_apply = false;
                $scope.minimum_price_apply = $scope.getMinimumTotalPrice();

                if(parseFloat($scope.additional_fee) > 0 && $scope.selected_orders.length > 0){
                    $scope.show_reason_of_refund = $.grep($scope.selected_orders, function(x){return parseFloat(x.balance_due) < x.changed_amount}).length > 0;
                }

                if(!$scope.exceed_minimum_price_apply){
                    $scope.exceed_minimum_price_apply = $.grep($scope.selected_orders, function(x){return parseFloat(x.total_price) < x.changed_amount}).length > 0;
                }

                var is_not_valid = false;
                if($scope.submited_orders.length > 0){
                    is_not_valid = $.grep($scope.submited_orders, function(x){return x.is_successful}).length > 0;
                }

                if(!is_not_valid && $scope.selected_orders.length > 0){
                    is_not_valid = $.grep($scope.selected_orders, function(x){return x.changed_amount < $scope.minimum_payment_amount}).length > 0;
                    $scope.invalid_price_apply = is_not_valid;
                }

                return $scope.selected_orders.length == 0 ||
                    $scope.additional_fee <= 0 ||
                    is_not_valid ||
                    (!$scope.fee_type && $scope.additional_fee > 100) ||
                    $scope.exceed_minimum_price_apply ||
                    ($scope.show_reason_of_refund && ($scope.reason_type == null || ($scope.reason_type == 0 && $scope.other_reason == '')));
            };

            $scope.submitDecreaseOrdersPrice = function(){
                if($scope.disableConfirmDecreaseButton()){
                    return;
                }

                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to decrease package price to the selected order(s)?', function (confirmed) {
                    if (confirmed) {
                        var submit_decrease_balance_due_url = '/group_travel_control_dashboards/order-dashboard/decrease-balance-due';
                        var options = {selected_orders: angular.toJson($scope.selected_orders),
                                       deducted_fee: $scope.additional_fee,
                                       fee_type: $scope.fee_type,
                                       apply_to_amount: $scope.apply_to_amount,
                                       reason_type: $scope.reason_type,
                                       reason_of_refund: $scope.other_reason,
                                        note: $scope.note};
                        $.post(submit_decrease_balance_due_url, options, function(result){
                            bootbox.alert(result.message);
                            if(result.is_successful){
                                $('#decrease_orders_modal').modal('hide');
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