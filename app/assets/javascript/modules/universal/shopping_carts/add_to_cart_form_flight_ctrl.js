(function() {
    this.app.controller('AddToCartFormFlightCtrl', [
        "$scope", '$window', "cartService",
        function($scope, $window, cartService) {
            $scope.quantity = 0;
            $scope.totalPrice = 0;
            $scope.urlAddToCart = '';
            $scope.redirectUrl = '';
            $scope.error = '';
            $scope.isInModal = false;
            $scope.existingCartItems = {};
            $scope.addToCartButtonText = 'Add to Cart';
            $scope.isSubmitButtonDisabled = true;
            $scope.flight = {};
            $scope.flight_terms = false;
            $scope.event_slug = '';

            $scope.addToCart = function() {
                if(!$scope.validate())
                    return false;

                data = {quantity: $scope.quantity, total_price: $scope.totalPrice};
                if ($scope.isInModal) {
                    data.get_cart = true;
                }
                $.post($scope.urlAddToCart, data,
                    function(result){
                        if(result.is_successful){
                            $scope.changeToNextTab($scope.event_slug);
                            if ($scope.isInModal) {
                                if (result.cart) {
                                    $scope.$apply(function() {
                                        cartService.updateCart(result.cart);
                                    });
                                }
                                $('.modal.in').modal('hide');
                                cartService.refreshPopoverShoppingCart();
                            }
                            if($window.location.href.indexOf('checkout-affirm') > -1){
                                $window.location.reload();
                            }else if($scope.redirectUrl != ''){
                                wiselinks.load($scope.redirectUrl);
                            }else{
                                wiselinks.load();
                            }
                        }
                        else {
                            $scope.$apply(function() {
                                $scope.error = result.error_message;
                                $scope.isSubmitButtonDisabled = true;
                            });
                        }
                    }).error(function(){
                        $scope.$apply(function(){
                            $scope.error = 'An error occurred while adding to cart';
                        });
                    });
            };

            $scope.validate = function () {
                $scope.isSubmitButtonDisabled = true;
                if (!$scope.quantity || $scope.quantity % 1 !== 0) {
                    $scope.error = 'Please enter a valid quantity!';
                    return false;
                }
                if ($scope.quantity <= 0) {
                    $scope.error = 'Please enter a positive quantity!';
                    return false;
                }
                if ($scope.flight.instock && $scope.quantity > $scope.flight.instock) {
                    $scope.error = "Sorry, there aren't that many available!";
                    return false;
                }
                $scope.error ='';
                $scope.isSubmitButtonDisabled = false;
                return true;
            }

            $scope.$watch('quantity', function(value){
                if($scope.validate()){
                    if(value > 50)
                        $scope.quantity = 50;
                    else if(value < 1)
                        $scope.quantity = 1;

                    $scope.totalPrice = $scope.quantity * $scope.totalPrice;
                }
                else $scope.totalPrice = 0;
            });

            $scope.serialize = function(fieldName) {
                return angular.toJson($scope[fieldName]);
            };
        }
    ]);
}).call(this);