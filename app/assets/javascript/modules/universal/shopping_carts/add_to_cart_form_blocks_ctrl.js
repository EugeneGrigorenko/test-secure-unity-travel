(function() {
	this.app.controller('AddToCartFormBlocksCtrl', [
		"$scope", '$window', "cartService",
		function($scope, $window, cartService) {
			$scope.availableDates = {};
			$scope.selectedDates = {};
			$scope.maximumQuantity = 0;
			$scope.eachDayQuantity = null;
			$scope.chosenQuantitiesByDate = {};
			$scope.totalPrice = 0;
			$scope.selectableQuantities = [];
			$scope.isSubmitButtonDisabled = false;
			$scope.urlAddToCart = '';
			$scope.urlMaximumQuantity = '';
			$scope.isInModal = false;
			$scope.error = '';
			$scope.existingCartItems = {};
			$scope.addToCartButtonText = 'Add to Cart';
			$scope.hasUnlimitedQuantity = false;
			$scope.event_slug = '';

			function updatechosenQuantitiesByDate(){
				$scope.chosenQuantitiesByDate = {};
                if ($scope.selectedDates) {
                    for(i = 0; i < $scope.selectedDates.length; i++) {
                        $scope.chosenQuantitiesByDate[$scope.selectedDates[i]] = $scope.eachDayQuantity;
                    }
                }
			}
			
			function updateTotalPrice() {
				var i,
					j,
					quantity = $scope.eachDayQuantity,
					blocksInDate,
					tmpQuantity,
					totalPrice = 0;
				
				if (!quantity) {
                    $scope.totalPrice = 0;
					return;
				}

				if (quantity < 0 || (quantity > $scope.maximumQuantity)) {
                    $scope.totalPrice = 0;
                    return;
				}
				
				for(i = 0; i < $scope.selectableQuantities.length; i++) {
					blocksInDate = $scope.selectableQuantities[i].quantityByBlocks;
					if($scope.hasUnlimitedQuantity) {
					   if (blocksInDate.length) {
					       totalPrice += Big(blocksInDate[0].block.unit_price) * quantity;
					   }
					} else {
        				tmpQuantity = quantity;
        				
        				for (j = 0; j < blocksInDate.length; j++) {
        					if (tmpQuantity <= blocksInDate[j].quantity) {
                                totalPrice += Big(blocksInDate[j].block.unit_price) * tmpQuantity;
        						break;
        					}
                            totalPrice += Big(blocksInDate[j].block.unit_price) * blocksInDate[j].quantity;
        					tmpQuantity -= blocksInDate[j].quantity;
        				}
					}
				}
				
				$scope.totalPrice = totalPrice.toString();
			}
			
			$scope.validate = function() {
                $scope.isSubmitButtonDisabled = true;

				if (!$scope.selectedDates || !$scope.selectedDates.length) {
					return false;
				}
				// check if integer
				if (!$scope.eachDayQuantity || $scope.eachDayQuantity % 1 !== 0) {
					$scope.error = 'Please enter a valid quantity!';
					return false;
				}
				if ($scope.eachDayQuantity <= 0) {
					$scope.error = 'Please enter a positive quantity!';
					return false;
				}
				if ($scope.eachDayQuantity > $scope.maximumQuantity) {
                    $scope.error = "Sorry, inventory is " + $scope.maximumQuantity + ". There aren't that many available!";
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
                $scope.selectedDates = $scope.availableDates;
				return $scope.availableDates;
			};
			$scope.addToCart = function() {
				var data = {
					   		dates: $scope.selectedDates,
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
							$scope.$apply(function(){
								$scope.isSubmitButtonDisabled = false;
							});
							if (result.is_successful) {
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
									"Inventory has been changed while you're filling in information. Please try again!",
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
                    availableDates,
                    i;
                if (cartItem) {
                    $scope.eachDayQuantity = cartItem.each_date_quantity;
                    $scope.selectedDates = cartItem.selected_dates;
                    $scope.addToCartButtonText = 'Update Cart';
                    availableDates = $scope.availableDates;
                    for (i = 0; i < cartItem.selected_dates.length; i++) {
                        if ($.inArray(cartItem.selected_dates[i], availableDates) == -1) {
                            $scope.permanentError = 'One or more dates you selected before are not available anymore. Please review and click "Update Cart" button to update your cart item.';
                            break;
                        }
                    }
                } else {
                    $scope.selectedDates = [];
                    $scope.addToCartButtonText = 'Add to Cart';
                }
            };

			$scope.$watch('eachDayQuantity', function(value){
                if(value < 1)
                    $scope.eachDayQuantity = 1;
                $scope.validate();
				updatechosenQuantitiesByDate();
				updateTotalPrice();
			});
			
			$scope.$watch('selectedDates', function(value){
				if (value && value.length){
					$.get($scope.urlMaximumQuantity, {
						dates: value
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
			});
		}
	]);
}).call(this);