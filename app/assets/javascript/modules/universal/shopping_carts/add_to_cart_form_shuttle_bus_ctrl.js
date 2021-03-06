(function() {
	this.app.controller('AddToCartFormShuttleBusCtrl', [
        "$scope", '$window', "cartService",
        function($scope, $window, cartService) {
            var format_string = 'dddd, MMM DD, YYYY';
            $scope.productName = '';
            $scope.hotelList = [];
            $scope.airlines = [];
            $scope.blockList = {};
            $scope.availableDates = [];
            $scope.availableTimes = [];
            $scope.selectedHotel =  '';
            $scope.otherHotel = '';
            $scope.selectedAirline = '';
            $scope.otherAirline = '';
            $scope.flightNumber = '';
            $scope.selectedBlock = '';
            $scope.existingBlock = '';
            $scope.selectedDate = '';
            $scope.cartItemId = '';
            $scope.note = '';
            $scope.maximumQuantity = 0;
            $scope.unitPrice = 0;
            $scope.qty = 1;
            $scope.totalPrice = '0';
            $scope.isSubmitButtonDisabled = true;
            $scope.urlAddToCart = '';
            $scope.urlMaximumQuantity = '';
            $scope.isInModal = false;
            $scope.error = '';
            $scope.existingCartItems = {};
            $scope.addToCartButtonText = 'Add to Cart';
            $scope.hasUnlimitedQuantity = false;
            $scope.isWarningOnEditForm = false;
            $scope.event_slug = '';

            $scope.addToCart = function() {
                if (!$scope.validate()) return;

                var selected_airline = $scope.selectedAirline;

                if($scope.selectedAirline == 'Other'){
                    selected_airline = $scope.otherAirline;
                }

                var data = {
                    selected_hotel: $scope.selectedHotel,
                    selected_airline: selected_airline,
                    flight_number: $scope.flightNumber,
                    other_hotel: $scope.otherHotel,
                    quantity: $scope.qty,
                    note: $scope.note,
                    cart_item_id: $scope.cartItemId,
                    block_id: $scope.selectedBlock,
                    total_price: $scope.totalPrice
                };
                if ($scope.isInModal) {
                    data.get_cart = true;
                }

                $.post($scope.urlAddToCart, data,
                    function(result){
                        $scope.$apply(function(){
                            $scope.isSubmitButtonDisabled = false;
                        });
                        if (result.is_successful) {
                            $scope.changeToNextTab($scope.event_slug);
                            if ($scope.isInModal) {
                                if (result.cart) {
                                    $scope.$apply(function(){
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
                                $scope.maximumQuantity = result.new_quantity_info.maximum_quantity;
                                $scope.unitPrice = result.new_quantity_info.unit_price;
                                $scope.hasUnlimitedQuantity = result.new_quantity_info.has_unlimited_quantity;
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
                        } else if (result.block_changed) {
                            bootbox.alert(
                                "Stocks have been changed while you're filling in information. Please try again!",
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

            $scope.validate = function() {
                $scope.isSubmitButtonDisabled = true;
                if (!$scope.selectedBlock){
                    $scope.error = 'Please select departure time.';
                    return false;
                }
                // check if integer
                if (!$scope.qty || $scope.qty % 1 !== 0) {
                    $scope.error = 'Please enter a valid quantity!';
                    return false;
                }
                if ($scope.qty <= 0) {
                    $scope.error = 'Please enter a positive quantity!';
                    return false;
                }
                if ($scope.qty > $scope.maximumQuantity) {
                    $scope.error = "Sorry, inventory is " + $scope.maximumQuantity + ". There aren't that many available!";
                    return false;
                }
                if ($scope.selectedAirline == '' || ($scope.selectedAirline == 'Other' && $scope.otherAirline == '')) {
                    $scope.error = "Please select your airline!";
                    return false;
                }
                if ($scope.flightNumber.trim() == ''){
                    $scope.error = "Please input your flight number!";
                    return false;
                }

                $scope.error = '';
                $scope.isSubmitButtonDisabled = false;
                return true;
            };

            function getMaximumQuantity(){
                if ($scope.selectedBlock){
                    $.get($scope.urlMaximumQuantity, {
                        block_id: $scope.selectedBlock
                    }, function(result){
                        $scope.$apply(function(){
                            $scope.maximumQuantity = result.maximum_quantity;
                            $scope.unitPrice = result.unit_price;
                            $scope.hasUnlimitedQuantity = result.has_unlimited_quantity;
                            updateTotalPrice();
                        });
                    }, 'json');
                }else{
                    $scope.isSubmitButtonDisabled = true;
                }
            }

            function updateTotalPrice() {
                $scope.validate();
                var totalPrice = new Big(0);
                totalPrice = totalPrice.plus(Big($scope.unitPrice).times($scope.qty));
                $scope.totalPrice = totalPrice.toString();
            }

            $scope.$watch('selectedDate', function(){
                getMaximumQuantity();
                var date = moment($scope.selectedDate).format('YYYY-MM-DD');

                $scope.availableTimes = $scope.blockList[date];
                if($scope.existingBlock){
                    $scope.selectedBlock = $scope.existingBlock;
                    $scope.existingBlock = '';
                }else{
                    $scope.selectedBlock = '';
                }
            });

            $scope.$watch('selectedBlock', function(){
                getMaximumQuantity();
            });

            $scope.$watch('qty', function(value){
                if($('.bootbox').is(':visible')){
                    bootbox.hideAll();
                }

                if(value < 1) $scope.qty = 1;

                getMaximumQuantity();

                if($scope.qty > 1){
                    if($scope.isWarningOnEditForm){
                        $scope.isWarningOnEditForm = false;
                    }else{
                        bootbox.dialog({
                            message: "<p>We recommend that you purchase your "+$scope.productName+" only for yourself to ensure the accuracy of the\
                                order and travel logistics. Please have your friend purchase their own "+$scope.productName+". Click\
                            <i>cancel</i> to change the quantity or proceed with the selected quantity.</p>",
                            buttons: {
                                confirm: {
                                    label: "Proceed with purchase of "+$scope.qty+" x "+ $scope.productName,
                                    className: "btn btn-primary",
                                    callback: function() {
                                    }
                                },
                                cancel: {
                                    label: "Cancel",
                                    className: "btn btn-default",
                                    callback: function() {
                                        $scope.$apply(function(){
                                            $scope.qty = 1;
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });

            $scope.$watch('blockList', function(){
                if(JSON.stringify($scope.blockList) !== '{}') {
                    var dates = [];
                    for(var k in $scope.blockList){
                        dates.push(k);
                    }
                    $scope.availableDates = dates;
                    $('#datePicker').datepicker(
                        "option",
                        {
                            minDate: moment(dates[0]).format(format_string),
                            maxDate: moment(dates[dates.length -1]).add('days', 1).format(format_string),
                            defaultDate: moment(dates[0]).format(format_string)
                        }
                    );
                }
            });

            $scope.$watch('hotelList', function(){
                $scope.hotelList.push({id: 'other', name: 'Other'});
            });

            $scope.$watch('selectedHotel', function(val){
                if(!$scope.selectedHotel) $scope.otherHotel = '';
            });
		}
	]);
}).call(this);