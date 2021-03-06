(function() {
    this.app.controller('AddToCartFormSharedLodgingCtrl', [
        "$scope", '$window', "cartService",
        function($scope, $window, cartService) {
            $scope.addToCartButtonText = 'Add to Cart';
            $scope.selectedRoomType = {};
            $scope.isSubmitButtonDisabled = true;
            $scope.urlAddToCart = '';
            $scope.redirectUrl = '';
            $scope.error = '';
            $scope.roomTypes = [];
            $scope.isInModal = false;
            $scope.event_slug = '';

            $scope.validate = function() {
                return true;
            };

            $scope.addToCart = function() {
                var dates = [];
                data = {quantity: 1,
                        trip_date_id: $scope.trip_date_id,
                        room_type_id: $scope.selectedRoomType.id};

                if ($scope.isInModal) {
                    data.get_cart = true;
                }
                $.post($scope.urlAddToCart, data,
                    function(result){
                        var cartScope;
                        $scope.changeToNextTab($scope.event_slug);
                        if(result.is_successful){
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
                        else if (result.error_message) {
                            $scope.$apply(function(){
                                $scope.error = result.error_message;
                            });
                        } else {
                            $scope.$apply(function(){
                                $scope.error = 'An error occurred while adding to cart';
                            });
                        }
                    },
                    'json'
                ).error(function(){
                        $scope.$apply(function(){
                            $scope.error = 'An error occurred while adding to cart';
                        });
                    });
            };

        }
    ]);
}).call(this);