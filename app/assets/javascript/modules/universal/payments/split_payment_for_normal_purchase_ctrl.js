(function() {
    this.app.controller('SplitPaymentForNormalPurchaseCtrl', [
        "$scope",
        "cartService",
        function($scope, cartService) {
            $scope.basePaymentUrl = '';
            $scope.totalPrice = 0;

            $scope.numberOfMember = '';
            $scope.emails = [];
            $scope.amounts = [];
            $scope.isValidateSplitmentForm = false;
            $scope.isSubmitButtonDisabled = false;

            $scope.MAX_SPLIT_MEMBERS = 0;
            $scope.MINIMUM_PAYMENT_AMOUNT = 0;

            $scope.$watch(cartService.getToPayAmount, function(newPrice) {
                $scope.totalPrice = newPrice;
            });

            $scope.$watch('totalPrice', function(newPrice) {
                $scope.splitEvenly();
            });

            $scope.$watch('reducedAmount', function(newPrice) {
                $scope.splitEvenly();
            });

            $scope.$watch('numberOfMember', function(new_value) {
                if(new_value == 0){
                    return;
                }

                var number = parseInt(new_value);
                if(number > $scope.MAX_SPLIT_MEMBERS)
                    $scope.numberOfMember = $scope.MAX_SPLIT_MEMBERS;
                else if(number < 2)
                    $scope.numberOfMember = 2;
                if(number > 1 && $scope.totalPrice > 0){
                    var emails = [];
                    var amounts = [];
                    for(var i=0; i< number; i++) {
                        if($scope.emails.length > i)
                            emails.push($scope.emails[i]);
                        else
                            emails.push('');
                        amounts.push(0);
                    }
                    $scope.emails = emails;
                    $scope.amounts = amounts;
                    $scope.splitEvenly();
                }
            });

            $scope.getCurrentPayAmount = function () {
                if ($scope.amounts.length > 0){
                    var toPayAmount = Big($scope.amounts[0]);
                    return toPayAmount.gt(0) ? toPayAmount.toString() : '0';
                }
            };

            $scope.splitEvenly = function () {
                var i,
                    totalCents,
                    sharedCents,
                    remainingCents;

                if (!$scope.amounts.length) {
                    return;
                }

                totalCents = Math.floor(Big($scope.totalPrice).times(100).toString());
                sharedCents = Math.floor(Big(totalCents).div($scope.amounts.length).toString());
                remainingCents = totalCents % $scope.amounts.length;

                for (i = 0; i < $scope.amounts.length; i++) {
                    $scope.amounts[i] = sharedCents;
                }

                i = 0;
                while(remainingCents > 0) {
                    $scope.amounts[i] += 1;
                    remainingCents -= 1;
                    i++;
                }

                for (i = 0; i < $scope.amounts.length; i++) {
                    $scope.amounts[i] = parseFloat(Big($scope.amounts[i]).div(100).toString());
                    if($scope.amounts[i] <= $scope.MINIMUM_PAYMENT_AMOUNT){
                        bootbox.alert("You can't increase total of split members because minimum payment for each member is $" + $scope.MINIMUM_PAYMENT_AMOUNT + '.');
                        $scope.numberOfMember = 2;
                        break;
                    }
                }
            };

            $("#credit-card-form button[type='submit']").click(function(e){
                if ($scope.isValidateSplitmentForm){
                    $(this).parents('form').submit();
                }
            });

            $scope.backSplitmentForm = function(e){
                $scope.isValidateSplitmentForm = false;
                $('html, body').animate({scrollTop:$('#split-payment-form-header').position().top - 70}, 'slow');
            };

            $scope.nextSplitmentForm = function(){
                $scope.isValidateSplitmentForm = $scope.validateSplitment();
            };

            $scope.validateSplitment = function(){
                if ($scope.emails.length < 1){
                    bootbox.alert('Please input number of member');
                    return false;
                }else{
                    for(var i = 0; i< $scope.emails.length; i++){
                        if ($scope.emails[i] == ''){
                            bootbox.alert('Please input your friend\'s email address');
                            return false;
                        }

                        var current_email = $scope.emails[i].toLowerCase();
                        var regex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+$/i;

                        if (!regex.test(current_email)) {
                            bootbox.alert('Invalid email address, please update and try again.');
                            return false;
                        }

                        for(var j = i + 1; j< $scope.emails.length; j++){
                            if (current_email == $scope.emails[j]){
                                bootbox.alert(current_email + ' has already been in the list.');
                                return false;
                            }
                        }
                    }
                    return true;
                }
            };

            $scope.serialize = function(fieldName) {
                return angular.toJson($scope[fieldName]);
            };

            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
        }
    ]);
}).call(this);
