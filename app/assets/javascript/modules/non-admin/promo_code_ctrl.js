(function() {
    this.app.controller('PromoCodeCtrl', [
        "$scope",
        "cartService",
        function($scope, cartService) {

            $scope.selecting_promo_code = false;
            $scope.code_input = '';
            $scope.promo_code = { code: '', amount: 0 };
            $scope.error_message = '';
            $scope.is_checking_full_payment_discount = false;
            $scope.add_promo_code_url = '';
            $scope.remove_promo_code_url = '';

            $scope.$watch(cartService.getReducedAmount, function(promo_code_amount) {
                $scope.promo_code.amount = promo_code_amount;
                $scope.selecting_promo_code = Big(promo_code_amount).gt(0);
            });
            
            $scope.$watch(cartService.getPromoCode, function(code) {
                $scope.promo_code.code = code;
            });
            
            $scope.$watch('selecting_promo_code', function(value) {
                if(!value) {
                    $scope.error_message = '';
                    $scope.code_input = '';
                    if ($scope.promo_code.amount > 0)
                        $scope.removePromoCode();
                }
            });
            
            $scope.addPromoCode = function(){
                $.post(
                    $scope.add_promo_code_url, { code: $scope.code_input, is_discount: $scope.is_checking_full_payment_discount },
                    function(result){
                        $scope.$apply(function(){
                            if (!result.code_valid){
                                $scope.error_message = 'Invalid code!';
                                return;
                            }
                            if (!result.added) {
                                $scope.error_message = 'Error occurred!';
                                return;
                            }
                            $scope.error_message = '';
                            $scope.code_input = '';
                            if (result.cart) cartService.updateCart(result.cart);
                        });
                    }).error(function(){
                        $scope.$apply(function(){ $scope.error_message = 'An error occurred when adding promo code.'; });
                    }
                );
            };
            
            $scope.removePromoCode = function() {
                $.post($scope.remove_promo_code_url, { is_discount: $scope.is_checking_full_payment_discount },
                    function(result){
                        $scope.$apply(function(){
                            if(!result.removed) {
                                $scope.selecting_promo_code = true;
                                bootbox.alert('An error occurred when removing promo code.');
                            }
                            else{
                                cartService.updateCart(result.cart);
                            }
                        });
                    }).error(function(){
                        $scope.$apply(function(){ $scope.selecting_promo_code = true; });
                        bootbox.alert('An error occurred when removing promo code.');
                    }
                );
            };
        }
    ]);
}).call(this);