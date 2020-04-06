(function() {
    this.app.controller('AddToCartFormAddonWithVariantCtrl', [
        "$scope", '$window', "cartService",
        function($scope, $window, cartService) {
            $scope.addToCartButtonText = 'Add to Cart';
            $scope.selectedVariant = {};
            $scope.quantity = null;
            $scope.maximumQuantity = 0;
            $scope.unitPrice = 0;
            $scope.totalPrice = 0;
            $scope.isSubmitButtonDisabled = true;
            $scope.urlAddToCart = '';
            $scope.error = '';
            $scope.addonVariants = [];
            $scope.urlMaximumQuantity = '';
            $scope.isInModal = false;
            $scope.event_slug = '';

            $scope.validate = function() {
                $scope.isSubmitButtonDisabled = true;

                if($scope.selectedVariant == null || $scope.selectedVariant.id == null){
                    $scope.error = 'Please select a valid option!';
                    return false;
                }

                if($scope.quantity == null){
                    $scope.error = 'Please enter a valid quantity!';
                    return false;
                }

                if($scope.quantity > $scope.maximumQuantity){
                    $scope.error = "Sorry, inventory is " + $scope.maximumQuantity + ". There aren't that many available!";
                    return false;
                }

                $scope.error = '';
                $scope.isSubmitButtonDisabled = false;
                return true;
            };

            $scope.updateTotalPrice = function(){
                $scope.totalPrice = $scope.quantity * $scope.unitPrice;
            }

            $scope.addToCart = function() {
                data = {
                    quantity: $scope.quantity,
                    addon_variant_id: $scope.selectedVariant.id
                };

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
                            }else{
                                wiselinks.load();
                            }
                        }
                        else if (result.not_enough_quantity || result.is_price_changed){
                            $scope.$apply(function(){
                                $scope.maximumQuantity = result.new_quantity_info.maximum_quantity;
                                $scope.unitPrice = result.new_quantity_info.unit_price;
                                $scope.validate();
                                $scope.updateTotalPrice();
                            });
                            if (result.not_enough_quantity) {
                                bootbox.alert(
                                    "Available quantity has been changed while you're filling in information. Please try again!"
                                );
                            } else if(result.is_price_changed) {
                                bootbox.confirm('Price has been changed to $' +  result.price +
                                    " while you're filling information. Do you still want to add the product to cart?",
                                    function (result){
                                        if (result) {
                                            $scope.addToCart();
                                        }
                                    });
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

            $scope.$watch('quantity', function(value){
                if(value < 1)
                    $scope.quantity = 1;
                $scope.validate();
                $scope.updateTotalPrice();
            });

            $scope.$watch('selectedVariant', function(value){

                if (value && value.id != undefined && value.id > 0){
                    $.get($scope.urlMaximumQuantity, {
                        addon_variant_id: $scope.selectedVariant.id
                    }, function(result){
                        $scope.$apply(function(){
                            $scope.maximumQuantity = result.maximum_quantity;
                            $scope.unitPrice = result.unit_price;
                            $scope.validate();
                            $scope.updateTotalPrice();
                        });
                    }, 'json');
                }
            });
        }
    ]);
}).call(this);