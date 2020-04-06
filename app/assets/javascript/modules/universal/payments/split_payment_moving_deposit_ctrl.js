(function() {
    this.app.controller('SplitPaymentMovingDepositCtrl', [
        "$scope",
        function($scope) {
            var shouldAllowSubmit = false;
            
            $scope.total = 0;
            $scope.group_members = [];
            $scope.isSubmitButtonDisabled = true;

            $scope.setSubmitButtonStatus = function(){
                //check if total refund amount > 0

                if(parseFloat($scope.total) <= 0){
                    $scope.isSubmitButtonDisabled = true;
                    return;
                }
                total_split_amount = 0;
                for(i = 0; i < $scope.group_members.length; i++){
                    if($scope.group_members[i].do_not_split == false){
                        total_split_amount += parseFloat($scope.group_members[i].shared_prices);
                    }
                }
                if(total_split_amount.toFixed(2) != parseFloat($scope.total).toFixed(2)){
                    $scope.isSubmitButtonDisabled = true;
                    return;
                }
                $scope.isSubmitButtonDisabled = false;
            };

            $scope.shared_amount_changing = function(index){
                if(parseFloat($scope.total) == 0){
                    return;
                }
                $scope.setSubmitButtonStatus();
            };

            $scope.splitEvenly = function () {
                if(parseFloat($scope.total) == 0){
                    return;
                }

                num_splitment = 0;
                last_splitment_index = -1;
                for(i = 0; i < $scope.group_members.length; i++){
                    if($scope.group_members[i].do_not_split == false){
                        num_splitment += 1;
                        last_splitment_index = i;
                    }
                }

                if(num_splitment > 0){
                    shared_amount_equally = parseFloat($scope.total) / num_splitment; //eg: $28.34343
                    shared_amount_equally = parseFloat(shared_amount_equally).toFixed(2); // --> $28.34
                    last_shared_amount = parseFloat($scope.total) - shared_amount_equally * (num_splitment - 1);

                    for(i = 0; i < $scope.group_members.length; i++){
                        if($scope.group_members[i].do_not_split == false){
                            $scope.group_members[i].shared_prices = parseFloat(shared_amount_equally);
                        }
                    }

                    $scope.group_members[last_splitment_index].shared_prices = parseFloat(last_shared_amount.toFixed(2));
                }
                $scope.setSubmitButtonStatus();
            };

            $scope.submit = function(e) {
                var target,
                    i,
                    amount,
                    areAllPositive,
                    splitsTotalCents,
                    totalCents;
                
                if (shouldAllowSubmit) {
                    return;
                }
                target = $(e.target);
                e.preventDefault();

                areAllPositive = true;
                splitsTotal = Big('0');

                for (i = 0; i < $scope.group_members.length; i++) {
                    amount = $scope.group_members[i].shared_prices;

                    if (amount < 0) {
                        areAllPositive = false;
                        break;
                    }

                    splitsTotal = splitsTotal.plus(amount);
                }
                if (!areAllPositive) {
                    bootbox.alert('All items must be greater than 0.');
                    return;
                }
                if (!splitsTotal.eq($scope.total)) {
                    bootbox.alert('Total of all items must be equal to ' + $scope.total + '.');
                    return;
                }
                $scope.isSubmitButtonDisabled = true;
                shouldAllowSubmit = true;
                target.submit();
                shouldAllowSubmit = false;
                $(".lockModal").show();
            };

            $scope.updateDoNotRefundCheckChanged = function(index){
                $scope.group_members[index].shared_prices = 0;
                $scope.setSubmitButtonStatus();
            };

            $scope.$watch('total', function(){
                $scope.setSubmitButtonStatus();
            });
        }
    ]);
}).call(this);