(function() {
    this.app.controller('AddToCartFormTravelPackageCtrl', [
        "$scope", '$window', "cartService",
        function($scope, $window, cartService) {
            $scope.addToCartButtonText = 'Add to Cart';
            $scope.selected_package_setting = null;
            $scope.isSubmitButtonDisabled = true;
            $scope.urlAddToCart = '';
            $scope.redirectUrl = '';
            $scope.error = '';
            $scope.package_settings = [];
            $scope.nights = [];
            $scope.isInModal = false;
            $scope.included_flight = false;
            $scope.selected_nights = null;
            $scope.event_slug = '';

            $scope.init = function() {};

            $scope.selectSetting = function () {
                if ($scope.selected_nights == null){
                    $scope.selected_package_setting = null;
                    $scope.isSubmitButtonDisabled = true;
                    return;
                }

                var available_setting = null;
                for(var i = 0; i < $scope.package_settings.length; i++){
                    var setting = $scope.package_settings[i];
                    if (setting.number_of_nights == $scope.selected_nights
                        && setting.has_flight == $scope.included_flight
                        && (available_setting == null || available_setting.price > setting.price)){
                        available_setting = setting;
                    }
                }

                $scope.selected_package_setting = available_setting;
                $scope.isSubmitButtonDisabled = $scope.selected_package_setting == null;
            };

            $scope.addToCart = function() {
                var dates = [];
                var data = {
                    quantity: 1,
                    travel_package_id: $scope.selected_package_setting.travel_package_id,
                    travel_package_setting_id: $scope.selected_package_setting.id
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

            $scope.$watch('selected_nights', function (newVal, oldVal) {
                $scope.selectSetting();
            });

            $scope.$watch('included_flight', function (newVal, oldVal) {
                $scope.selectSetting();
            });
        }
    ]);
}).call(this);