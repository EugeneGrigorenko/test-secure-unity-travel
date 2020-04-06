(function() {
    this.app.controller('AddToCartFormLodgingCtrl', [
        "$scope", '$window', "cartService",
        function($scope, $window, cartService) {
            var format_string = 'dddd, MMM DD, YYYY';

            $scope.availableDates = {};
            $scope.availableCheckoutDates = {};
            $scope.roomTypeId = null;

            $scope.selectedCheckinDate = '';
            $scope.selectedCheckoutDate = '';

            $scope.maximumQuantity = 0;
            $scope.eachDayQuantity = 1;
            $scope.chosenQuantitiesByDate = {};
            $scope.totalPrice = 0;
            $scope.selectableQuantities = [];
            $scope.isSubmitButtonDisabled = true;
            $scope.urlAddToCart = '';
            $scope.urlMaximumQuantity = '';
            $scope.isInModal = false;
            $scope.error = '';
            $scope.existingCartItems = {};
            $scope.addToCartButtonText = 'Add to Cart';
            $scope.hasUnlimitedQuantity = false;
            $scope.min_nights_lodging = 1;
            $scope.diffdate = 0;
            $scope.event_slug = '';

            $scope.totalDetails = [];

            function updatechosenQuantitiesByDate(){
                var dates = [];
                if($scope.selectedCheckinDate && $scope.selectedCheckoutDate){
                    var checkin_date =  moment($scope.selectedCheckinDate).format('YYYY-MM-DD');
                    var checkout_date = moment($scope.selectedCheckoutDate).format('YYYY-MM-DD');
                    while (checkin_date < checkout_date)
                    {
                        dates.push(checkin_date);
                        checkin_date = moment(checkin_date).add('days',1).format('YYYY-MM-DD');
                    }
                }

                $scope.chosenQuantitiesByDate = {};
                for(i = 0; i < dates.length; i++) {
                    $scope.chosenQuantitiesByDate[dates[i]] = $scope.eachDayQuantity;
                }
            }

            function updateTotalPrice() {
                var dates = [];
                if($scope.selectedCheckinDate && $scope.selectedCheckoutDate){
                    var checkin_date =  moment($scope.selectedCheckinDate).format('YYYY-MM-DD');
                    var checkout_date = moment($scope.selectedCheckoutDate).format('YYYY-MM-DD');
                    while (checkin_date < checkout_date)
                    {
                        dates.push(checkin_date);
                        checkin_date = moment(checkin_date).add('days',1).format('YYYY-MM-DD');
                    }
                }
                var i,
                    j,
                    quantity = $scope.eachDayQuantity,
                    blocksInDate,
                    tmpQuantity,
                    totalPrice = new Big(0);

                if (!quantity) {
                    $scope.totalPrice = 0;
                    return;
                }

                if (quantity < 0 || (quantity > $scope.maximumQuantity)) {
                    $scope.totalPrice = 0;
                    return;
                }
                $scope.totalDetails = [];
                for(i = 0; i < $scope.selectableQuantities.length; i++) {
                    blocksInDate = $scope.selectableQuantities[i].quantityByBlocks;
                    var block_quantity = quantity;
                    for(var block = 0; block < blocksInDate.length; block++){
                        if (block_quantity <= blocksInDate[block].quantity) {
                            var perBlock = {date: dates[i] , quantity: block_quantity, price: blocksInDate[block].block.unit_price};
                            $scope.totalDetails.push(perBlock);
                            break;
                        }else{
                            var perBlock = {date: dates[i] , quantity: blocksInDate[block].quantity, price: blocksInDate[block].block.unit_price};
                            $scope.totalDetails.push(perBlock);
                            block_quantity -= blocksInDate[block].quantity;
                        }
                    }

                    if($scope.hasUnlimitedQuantity) {
                        if (blocksInDate.length) {
                            totalPrice = totalPrice.plus(
                                Big(blocksInDate[0].block.unit_price).times(quantity)
                            );
                        }
                    } else {
                        tmpQuantity = quantity;

                        for (j = 0; j < blocksInDate.length; j++) {
                            if (tmpQuantity <= blocksInDate[j].quantity) {
                                totalPrice = totalPrice.plus(
                                    Big(blocksInDate[j].block.unit_price).times(tmpQuantity)
                                );
                                break;
                            }

                            totalPrice = totalPrice.plus(
                                Big(blocksInDate[j].block.unit_price).times(blocksInDate[j].quantity)
                            );
                            tmpQuantity -= blocksInDate[j].quantity;
                        }
                    }
                }

                $scope.totalPrice = totalPrice.toString();
            }

            $scope.validate = function() {
                $scope.isSubmitButtonDisabled = true;

                if (!$scope.selectedCheckinDate && !$scope.selectedCheckoutDate) {
                    return false;
                }

                var diff_date = moment($scope.selectedCheckoutDate).diff(moment($scope.selectedCheckinDate),'days');

                if (diff_date < 0) {
                    $scope.error = 'Checkout date is not valid (must be after check-in date)';
                    return false;
                }

                if (diff_date < $scope.min_nights_lodging) {
                    $scope.error = 'You have to stay at least '+ $scope.min_nights_lodging + ' nights';
                    return false;
                }

                // check if integer
                if (!$scope.eachDayQuantity || $scope.eachDayQuantity % 1 !== 0) {
                    $scope.error = 'Please enter a valid room quantity!';
                    return false;
                }

                if ($scope.eachDayQuantity <= 0) {
                    $scope.error = 'Please enter a positive quantity!';
                    return false;
                }

                if ($scope.eachDayQuantity > $scope.maximumQuantity) {
                    $scope.error = "Sorry, inventory of each selected dates is " + $scope.maximumQuantity + " room(s). There aren't that many available!";
                    return false;
                }

                $scope.error = '';
                $scope.isSubmitButtonDisabled = false;
                return true;
            };

            $scope.serializeCartItem = function() {
                return angular.toJson({
                    chosen_quantities_by_date: $scope.chosenQuantitiesByDate,
                    total_price: $scope.totalPrice
                });
            };

            $scope.getAvailableDates = function() {
                $('#txtRoomTotal').focus();
                return $scope.roomTypeId
                    ? $scope.availableDates[$scope.roomTypeId]
                    : $scope.availableDates;
            };

            $scope.getAvailableDatesCheckout = function() {
                $('#txtRoomTotal').focus();
                return $scope.roomTypeId
                    ? $scope.availableCheckoutDates[$scope.roomTypeId]
                    : $scope.availableCheckoutDates;
            };

            $scope.addToCart = function() {
                var dates = [];
                var checkin_date =  moment($scope.selectedCheckinDate).format('YYYY-MM-DD');
                var checkout_date = moment($scope.selectedCheckoutDate).format('YYYY-MM-DD');
                while (checkin_date < checkout_date)
                {
                    dates.push(checkin_date);
                    checkin_date = moment(checkin_date).add('days',1).format('YYYY-MM-DD');
                }
                var data = {
                    room_type_id: $scope.roomTypeId,
                    dates: dates,
                    each_day_quantity: $scope.eachDayQuantity,
                    total_price: $scope.totalPrice
                };
                if ($scope.isInModal) {
                    data.get_cart = true;
                }

                $scope.isSubmitButtonDisabled = true;

                if (!$scope.validate()) {
                    $scope.isSubmitButtonDisabled = false;
                    return;
                }

                $.post($scope.urlAddToCart, data,
                    function(result){
                        var cartScope;
                        $scope.changeToNextTab($scope.event_slug);
                        $scope.$apply(function(){
                            $scope.isSubmitButtonDisabled = false;
                        });
                        if (result.is_successful) {
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
                        } else if (result.not_enough_quantity || result.is_price_changed) {
                            $scope.$apply(function(){
                                $scope.maximumQuantity = result.new_quantity_info.maximumQuantity;
                                $scope.selectableQuantities = result.new_quantity_info.quantitiesWithBlocks;
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
                        } else if (result.available_dates_changed) {
                            bootbox.alert(
                                "Inventory or available dates have been changed while you're filling in information. Please try again!",
                                function() {
                                    if ($scope.isInModal) {
                                        $('.modal.in').modal('hide');
                                    } else {
                                        $window.location.reload();
                                    }
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
                            $scope.isSubmitButtonDisabled = false;
                            $scope.error = 'An error occurred while adding to cart';
                        });
                    });
            };

            $scope.updateCartItem = function () {
                var cartItem = $scope.existingCartItems,
                    i;
                var availableDates = $scope.roomTypeId
                    ? $scope.availableDates[$scope.roomTypeId]
                    : $scope.availableDates;

                if (cartItem && cartItem.total_quantity > 0 && $scope.roomTypeId == cartItem.room_type_id) {
                    $scope.eachDayQuantity = cartItem.each_date_quantity;

                    $scope.selectedCheckinDate = cartItem.selected_dates[0];
                    $scope.selectedCheckoutDate = moment(cartItem.selected_dates[cartItem.selected_dates.length -1]).add('days',1);

                    for (i = 0; i < cartItem.selected_dates.length; i++) {
                        if ($.inArray(cartItem.selected_dates[i], availableDates) == -1) {
                            $scope.permanentError = 'One or more dates you selected before are not available anymore. Please review and click "Update Cart" button to update your cart item.';
                            break;
                        }
                    }
                } else {
                    $scope.selectedCheckinDate = '';
                    $scope.selectedCheckoutDate = '';
                }

                if(cartItem && cartItem.total_quantity > 0){
                    $scope.addToCartButtonText = 'Update Cart';
                }
                else{
                    $scope.addToCartButtonText = 'Add to Cart';
                }

                if(availableDates && availableDates.length > 0){
                    var minDate = availableDates[0];
                    var maxDate = availableDates[availableDates.length -1];
                    var maxDateCheckout = moment(maxDate).add('days',1).format('YYYY-MM-DD');
                    var minDateCheckout = moment(minDate).add('days',1).format('YYYY-MM-DD');
                    $("#txtCheckIn").datepicker( "option", {minDate:  moment(minDate).format(format_string),
                        maxDate: moment(maxDate).format(format_string)} );
                    $("#txtCheckOut").datepicker( "option", {minDate:  moment(minDateCheckout).format(format_string),
                        maxDate: moment(maxDateCheckout).format(format_string)} );
                }
            };

            $scope.$watch('roomTypeId', function(){
                $scope.updateCartItem();
            });

            $scope.$watch('eachDayQuantity', function(value){
                if(value < 1)
                    $scope.eachDayQuantity = 1;

                $scope.validate();
                updatechosenQuantitiesByDate();
                updateTotalPrice();
            });

            $scope.change_date_event = function(){
                if($scope.selectedCheckinDate && $scope.selectedCheckoutDate){
                    var dates = [];

                    var diff_date = moment($scope.selectedCheckoutDate).diff(moment($scope.selectedCheckinDate),'days');
                    if(diff_date>=0){
                        $scope.diffdate = diff_date;
                    }
                    var checkin_date =  moment($scope.selectedCheckinDate).format('YYYY-MM-DD');
                    var checkout_date = moment($scope.selectedCheckoutDate).format('YYYY-MM-DD');
                    while (checkin_date < checkout_date)
                    {
                        dates.push(checkin_date);
                        checkin_date = moment(checkin_date).add('days',1).format('YYYY-MM-DD');
                    }
                    if (dates.length){
                        $.get($scope.urlMaximumQuantity, {
                            room_type_id: $scope.roomTypeId,
                            dates: dates
                        }, function(result){
                            $scope.$apply(function(){
                                $scope.maximumQuantity = result.maximumQuantity;
                                $scope.selectableQuantities = result.quantitiesWithBlocks;
                                $scope.validate();
                                updatechosenQuantitiesByDate();
                                updateTotalPrice();
                            });
                        }, 'json');
                    }
                }else{
                    $scope.isSubmitButtonDisabled = true;
                }
            };

            $scope.$watch('selectedCheckoutDate', function(value){
                $scope.change_date_event(value);
            });

            $scope.$watch('selectedCheckinDate', function(value){
                update_checkout_available_dates(value);
                $scope.change_date_event(value);
            });

            function update_checkout_available_dates(current_checkin_string){
                var availableDates = $scope.roomTypeId
                    ? $scope.availableCheckoutDates[$scope.roomTypeId]
                    : $scope.availableCheckoutDates;

                if(availableDates && availableDates.length > 0) {
                    var current_checkout_date = '';
                    var current_checkin_date = moment(current_checkin_string).format('YYYY-MM-DD');
                    if ($scope.selectedCheckoutDate){
                        current_checkout_date = moment($scope.selectedCheckoutDate).format('YYYY-MM-DD');
                    }

                    var minDateCheckout = moment(current_checkin_date).add('days', $scope.min_nights_lodging).format('YYYY-MM-DD');

                    availableDates = $.grep(availableDates, function (a) {
                        return a >= minDateCheckout;
                    });
                    if (availableDates.length == 0 || (current_checkout_date != '' && $.inArray(current_checkout_date, availableDates) == -1)){
                        $scope.selectedCheckoutDate = '';
                    }

                    $("#txtCheckOut").datepicker(
                        "option",
                        {
                            minDate: moment(availableDates[0]).format(format_string),
                            maxDate: moment(availableDates[availableDates.length -1]).format(format_string),
                            defaultDate: moment(availableDates[0]).format(format_string)
                        }
                    );
                }
            }
        }
    ]);
}).call(this);