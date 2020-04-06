// This controller depends on DashboardOrdersCtrl
(function () {
    this.app.controller('IncreaseOrdersFromControlDashboardCtrl', [
        "$scope",
        function ($scope) {
            $scope.additional_fee = 0;
            $scope.fee_type = true; //if true USD else %
            $scope.apply_to_amount = true; //if true apply to order total price else balance due
            $scope.show_applied_amount = true;
            $scope.invalid_price_apply = false;

            $scope.$watch('additional_fee', function(new_val) {
                if(!$scope.fee_type && new_val > 1000){
                    $scope.additional_fee = 1000;
                }
                $scope.updateChangedAmount();
            });

            $scope.$watch('fee_type', function() {
                if(!$scope.fee_type && $scope.additional_fee > 1000){
                    $scope.additional_fee = 0;
                }
                $scope.updateChangedAmount();
            });

            $scope.$watch('apply_to_amount', function() {
                $scope.updateChangedAmount();
            });

            $scope.setDefaultFee = function(){
                if($scope.additional_fee == ''){
                    $scope.additional_fee = 0;
                }
            };

            $scope.clearData = function(){
                $scope.additional_fee = 0;
                $scope.fee_type = true;
                $scope.apply_to_amount = true;
                $scope.$parent.show_submit_result = false;
                $scope.$parent.submited_orders = [];
            };

            $scope.updateChangedAmount = function(){
                $.each($scope.selected_orders, function (index, order) {
                    var increasedAmount = 0;
                    if($scope.fee_type){
                        increasedAmount = parseFloat($scope.additional_fee);
                    }else{
                        var tempAmount = parseFloat($scope.apply_to_amount ? order.total_price : order.balance_due);
                        increasedAmount = parseFloat($scope.additional_fee * tempAmount / 100);
                    }

                    order.changed_amount = increasedAmount;
                    order.new_total_price = parseFloat(order.total_price) + increasedAmount;
                });
            };

            $scope.disableConfirmIncreaseButton = function(){
                var is_not_valid = false;
                if($scope.submited_orders.length > 0){
                    is_not_valid = $.grep($scope.submited_orders, function(x){return x.is_successful}).length > 0;
                }

                if(!is_not_valid && $scope.selected_orders.length > 0){
                    is_not_valid = $.grep($scope.selected_orders, function(x){return x.changed_amount < $scope.minimum_payment_amount}).length > 0;
                    $scope.invalid_price_apply = is_not_valid;
                }

                return $scope.selected_orders.length == 0 || $scope.additional_fee <= 0 || is_not_valid;
            };

            $scope.submitIncreaseOrderBalanceDue = function(){
                if($scope.disableConfirmIncreaseButton()){
                    return;
                }

                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to add more balance due to the selected order(s)?', function (confirmed) {
                    if (confirmed) {
                        var submit_increase_balance_due_url = '/group_travel_control_dashboards/order-dashboard/increase-balance-due';
                        var options = {selected_orders: angular.toJson($scope.selected_orders),
                                       additional_fee: $scope.additional_fee,
                                       fee_type: $scope.fee_type,
                                       apply_to_amount: $scope.apply_to_amount,
                                        note: $scope.note};
                        $.post(submit_increase_balance_due_url, options, function(result){
                            bootbox.alert(result.message);
                            if(result.is_successful){
                                $('#increase_orders_modal').modal('hide');
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