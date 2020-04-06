(function() {
        this.app.controller('CartCtrl', [
                "$scope",
                "cartService",
                "$timeout",
                function($scope, cartService, $timeout) {
                        $scope.totalPrice = 0;
                        $scope.grand_total = 0;
                        $scope.items = [];
                        $scope.bundle = null;
                        $scope.discounted_items = [];
                        $scope.addition_fees = [];
                        $scope.reduced_amount = 0;
                        $scope.isUpdateCart = false;
                        $scope.isUpdatedBySystem = false;
                        $scope.urlDismissUpdatedBySysteMessage = '';
                        $scope.show_flight_terms = false;

                        $scope.$watch(cartService.getTotalPrice, function(subTotalAmount) {
                                $scope.totalPrice = subTotalAmount;
                        });

                        $scope.$watch(cartService.getToPayAmount, function(newGrandTotalAmount, oldGrandTotalAmount) {
                                if(newGrandTotalAmount > 0 && (oldGrandTotalAmount && oldGrandTotalAmount == 0)){
                                        location.reload();
                                        return;
                                }
                                if(newGrandTotalAmount == 0 && oldGrandTotalAmount > 0){
                                        location.reload();
                                        return;
                                }
                                $scope.grand_total = newGrandTotalAmount;
                        });

                        $scope.$watch(cartService.getItems, function(productItems) {
                                $scope.items = productItems;
                        });

                        $scope.$watch(cartService.getBundle, function(min_bundle) {
                                $scope.bundle = min_bundle;
                        });

                        $scope.$watch(cartService.getDiscountedItems, function(discountedItems) {
                                $scope.discounted_items = discountedItems;
                        });

                        $scope.$watch(cartService.getAdditionFees, function(additionFees) {
                                $scope.addition_fees = additionFees;
                        });

                        $scope.cartService = cartService;

                        $scope.removeFromCart = function(item) {
                                bootbox.confirm("<p>Are you sure you want to remove this item from your shopping cart?</p>", function(confirm){
                                        if (!confirm) return;
                                        $.post(item.remove_url, {travel_package_setting_id: item.travel_package_setting_id},
                                                function(result){
                                                        if(!result.is_successful) bootbox.alert("<p>An error occurred when removing the item from your cart.</p>");
                                                        if (result.cart) location.reload();
                                                }, 'json')
                                                .error(function(){
                                                        bootbox.alert("<p>An error occurred when removing the item from your cart.</p>");
                                                }
                                                );
                                });
                        };

                        $scope.selectCurrentTab = function(event_cart, event_slug, product_type) {
                                window.scrollTo(0,0);
                                sessionStorage.product_type_length = product_type.length - 1;
                                if (sessionStorage.current_tab_index == undefined || sessionStorage.current_tab_index > sessionStorage.product_type_length || sessionStorage.current_event_slug != event_slug || event_cart == '') {
                                        sessionStorage.current_tab_index = 0;
                                        sessionStorage.current_event_slug = event_slug;
                                }
                                // $timeout(function () {
                                //         $('#product-tabs li').removeClass('active');
                                //         $('.tab-pane').removeClass('active');
                                //         $("[href='#tab-" + product_type[sessionStorage.current_tab_index].type.replace(' ','') + "']").parent().addClass('active');
                                //         $('.tab-pane#tab-' + product_type[sessionStorage.current_tab_index].type.replace(' ','')).addClass('active');
                                // })
                        };

                        $scope.setIsManualSelectedTab = function(index) {
                                if (index >= 0) {
                                        sessionStorage.current_tab_index = index;
                                }
                        };

                        $scope.hasNonBundle = function () {
                                if ($scope.bundle != null && $scope.items.length > 0){
                                        for(var i = 0; i < $scope.items.length; i++){
                                                if($scope.items[i].bundle_id == null
                                                        || $scope.items[i].quantity > $scope.items[i].bundle_quantity){
                                                        return true;
                                                }
                                        }
                                }
                                return false;
                        }

                        $scope.dismissUpdatedBySystemMessage = function(){
                                $scope.isUpdatedBySystem = false;

                                if($scope.urlDismissUpdatedBySysteMessage) {
                                        $.post($scope.urlDismissUpdatedBySysteMessage);
                                }
                        };

                        $scope.startTimer = function(seconds){
                                if(seconds < 0) $scope.timeIsUp();

                                var now = new Date();
                                $('.ms_timer').countdown(now.addSeconds(seconds), function (event) {
                                        var timer_text = event.strftime(seconds > 86400 ? '%-D day%!D %H:%M:%S' : (seconds > 3600 ? '%H:%M:%S' : '%M:%S'));
                                        $(this).html(timer_text);
                                }).on('finish.countdown', $scope.timeIsUp);
                        };

                        $scope.timeIsUp = function(){
                                $('.modal').modal('hide');
                                bootbox.alert("Time is up. The items in your shopping cart will be released in a moment. Click OK to refresh this page", function(){
                                        wiselinks.load();
                                });
                        };

                        Date.prototype.addSeconds = function(seconds) {
                                var copiedDate = new Date(this.getTime());
                                return new Date(copiedDate.getTime() + seconds * 1000);
                        }

                }
        ]);
}).call(this);
