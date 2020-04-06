(function() {
    this.app.controller('EditOrderCtrl', [
        "$scope",
        function($scope) {
            var date_format_string = 'dddd, MMM DD, YYYY';
            var ignored_refund_statuses = ['Failed'];

            $scope.total_decreased_amount = 0;
        	$scope.order_total_price = 0;
            $scope.total_changed_amount = 0;
            $scope.total_refunded_amount = 0;
            $scope.isSubmitButtonDisabled = true;
            $scope.update_lodging_room_url = '';
            $scope.splitments = [];
            $scope.total_lodging_refunded_amount = 0;
            $scope.reason_of_refund = 1;
            $scope.refunded_additional_fees = [];
            $scope.exceed_promo_code_amount = false;
            $scope.total_manual_amount = 0;
            $scope.is_input_manual_amount = false;
            $scope.show_travel_package = false;

            $scope.lodging_rooms = [];
            $scope.flight_order_items = [];
            $scope.shared_lodging_order_items = [];
            $scope.shared_hotel_order_items = [];
            $scope.travel_package_order_items = [];
            $scope.club_access_order_items = [];
            $scope.bus_without_time_order_items = [];
            $scope.addon_order_items = [];
            $scope.shuttle_bus_order_items = [];
            $scope.custom_activity_order_items = [];
            $scope.dependent_order_items = [];
            $scope.addon_with_variant_order_items = [];

            $scope.changed_lodging_room_data = [];
            $scope.changed_flight_data = [];
            $scope.changed_shared_lodging_data = [];
            $scope.changed_shared_hotel_data = [];
            $scope.changed_travel_package_data = [];
            $scope.changed_club_data = [];
            $scope.changed_bus_without_time_data = [];
            $scope.changed_shuttle_data = [];
            $scope.changed_custom_activity_data = [];
            $scope.changed_addon_data = [];
            $scope.changed_room_data = [];
            $scope.changed_addon_with_variant_data = [];

            // Add products
            $scope.available_products = [];
            $scope.product_type_filters = { flight: false, hotel: false, package: false, club: true, bus: true, addon: true };
            $scope.selected_product = {
                blocks: [],
                available_dates: [],
                available_times: [],
                selected_date: null,
                shared_checkin_date: null,
                shared_checkout_date: null,
                selected_block: {},
                product_block_id: null,
                quantity: 0,
                hotel_id: '',
                custom_hotel_name: '',
                selected_airline: '',
                other_airline: '',
                flight_number: '',
                note: '',
                addon_variant: null,
                addon_variants: []
            };
            $scope.shuttle_hotels = [];
            $scope.airlines = [];

            $scope.added_lodging_room_data = [];
            $scope.added_flight_data = [];
            $scope.added_shared_lodging_data = [];
            $scope.added_shared_hotel_data = [];
            $scope.added_travel_package_data = [];
            $scope.added_club_data = [];
            $scope.added_shuttle_data = [];
            $scope.added_custom_activity_data = [];
            $scope.added_addon_data = [];
            $scope.added_addon_with_variant_data = [];

            $scope.doRefundAdditionalFee = function (fee) {
                if(fee.do_refund) $scope.total_changed_amount -= fee.amount;
                else $scope.total_changed_amount += fee.amount;
                $scope.exceed_promo_code_amount = ($scope.total_changed_amount < 0 && -$scope.total_changed_amount > $scope.order_total_price);
            };

            $scope.has_changed_data = function(){
                if(!angular.equals([], $scope.changed_lodging_room_data)) return true;
                if(!angular.equals([], $scope.changed_flight_data)) return true;
                if(!angular.equals([], $scope.changed_shared_lodging_data)) return true;
                if(!angular.equals([], $scope.changed_shared_hotel_data)) return true;
                if(!angular.equals([], $scope.changed_travel_package_data)) return true;
                if(!angular.equals([], $scope.changed_club_data)) return true;
                if(!angular.equals([], $scope.changed_bus_without_time_data)) return true;
                if(!angular.equals([], $scope.changed_shuttle_data)) return true;
                if(!angular.equals([], $scope.changed_custom_activity_data)) return true;
                if(!angular.equals([], $scope.changed_addon_data)) return true;
                if(!angular.equals([], $scope.changed_room_data)) return true;
                if(!angular.equals([], $scope.changed_addon_with_variant_data)) return true;

                if($scope.has_added_data()) return true;

                return false;
            };

            $scope.has_added_data = function(){
                if(!angular.equals([], $scope.added_lodging_room_data)) return true;
                if(!angular.equals([], $scope.added_flight_data)) return true;
                if(!angular.equals([], $scope.added_shared_lodging_data)) return true;
                if(!angular.equals([], $scope.added_shared_hotel_data)) return true;
                if(!angular.equals([], $scope.added_travel_package_data)) return true;
                if(!angular.equals([], $scope.added_club_data)) return true;
                if(!angular.equals([], $scope.added_shuttle_data)) return true;
                if(!angular.equals([], $scope.added_custom_activity_data)) return true;
                if(!angular.equals([], $scope.added_addon_data)) return true;
                if(!angular.equals([], $scope.added_addon_with_variant_data)) return true;

                return false;
            };

            $scope.has_flight = function () {
                return $scope.flight_order_items.length > 0 || $scope.added_flight_data.length > 0;
            };

            $scope.has_shared_hotel = function () {
                return $scope.shared_lodging_order_items.length > 0
                    || $scope.shared_hotel_order_items.length > 0
                    || $scope.added_shared_lodging_data.length > 0
                    || $scope.added_shared_hotel_data.length > 0;
            };

            $scope.has_package = function () {
                return $scope.travel_package_order_items.length > 0 || $scope.added_travel_package_data.length > 0
            };

            $scope.add_product_button = function (product_type) {
                switch (product_type){
                    case 'Flight':
                        return 'Flight';
                    case 'SharedLodging':
                        return 'Hotel';
                    case 'SharedHotel':
                        return 'Hotel';
                    case 'TravelPackage':
                        return 'Package';
                    default:
                        return 'Product'
                }
            };

            $scope.refund_round_up_amount_alert = function () {
                $.each($scope.refunded_additional_fees, function (idx, fee) {
                  if(fee.fee_type == 'Round-up Amount'){
                      var has_flight = !angular.equals([], $scope.flight_order_items);
                      var has_hotel = !angular.equals([], $scope.shared_lodging_order_items) || !angular.equals([], $scope.shared_hotel_order_items);
                      var changed_flight = !angular.equals([], $scope.changed_flight_data);
                      var changed_hotel = !angular.equals([], $scope.changed_shared_lodging_data) || !angular.equals([], $scope.changed_shared_hotel_data);
                      var is_show_confirm =  false;
                      if(has_flight && has_hotel){
                          is_show_confirm = changed_flight && changed_hotel
                      }else if(has_flight && !has_hotel){
                          is_show_confirm = changed_flight
                      }else if(!has_flight && has_hotel){
                          is_show_confirm = changed_hotel
                      }
                      if(is_show_confirm){
                          bootbox.confirm("You should refund Round-up Amount when refund full flight & lodging. Do you want?", function(result) {
                              if (result == true) {
                                  $scope.$apply(function(){
                                      fee.do_refund = true;
                                      $scope.doRefundAdditionalFee(fee);
                                  });
                              }
                          });
                      }
                      return false;
                  }
                });
            };

            $scope.setSubmitButtonStatus = function(){
                var has_refunded_fees = $.grep($scope.refunded_additional_fees, function(x){return x.do_refund}).length > 0;
                if(!$scope.has_changed_data() && !has_refunded_fees){
                    $scope.isSubmitButtonDisabled = true;
                    return;
                }

                if ($scope.total_manual_amount < 0)
                {
                    //check if total split refund amount == total refund amount
                    var total_split_amount = 0;
                    for(var i = 0; i < $scope.splitments.length; i++){
                        if($scope.splitments[i].refundable_amount < $scope.splitments[i].refund_amount){
                            $scope.isSubmitButtonDisabled = true;
                            $('input[type=number]:eq(' + i + ')').addClass('input_error');
                            return;
                        }
                        else{
                            $('input[type=number]:eq(' + i + ')').removeClass('input_error');
                        }
                        if($scope.splitments[i].do_not_refund == false  && ignored_refund_statuses.indexOf($scope.splitments[i].status) == -1 ){
                            total_split_amount += parseFloat($scope.splitments[i].refund_amount);
                        }
                    }
                    if(total_split_amount.toFixed(2) != $scope.total_refunded_amount.toFixed(2)){
                        $scope.isSubmitButtonDisabled = true;
                        return;
                    }
                }

                $scope.isSubmitButtonDisabled = false;
            };
            
            $scope.update_total_changed_amount = function(value, is_increase){
                if(is_increase){
                    $scope.total_decreased_amount = parseFloat($scope.total_decreased_amount) - value ;
                }
                else{
                    $scope.total_decreased_amount = parseFloat($scope.total_decreased_amount) + value;
                }

                $scope.total_changed_amount =  $scope.total_decreased_amount;
                $scope.total_changed_amount += parseFloat($scope.total_lodging_refunded_amount);

                // Update total_changed_amount if there is any additional fee is checked
                $.each($scope.refunded_additional_fees, function (idx, fee) {
                   if(fee.do_refund){
                       $scope.total_changed_amount -= fee.amount;
                   }
                });

                $scope.exceed_promo_code_amount = ($scope.total_changed_amount < 0 && -$scope.total_changed_amount > $scope.order_total_price);
            };

            $scope.refunded_amount_base_on_manual_amount = function () {
                if($scope.is_input_manual_amount){
                    $scope.total_refunded_amount = Math.abs($scope.total_manual_amount);
                }
                else{
                    $scope.total_refunded_amount = Math.abs($scope.total_changed_amount);
                }

                if($scope.total_refunded_amount > parseFloat($scope.order_total_price) && $scope.total_manual_amount < 0)
                {
                    $scope.total_refunded_amount =  parseFloat($scope.order_total_price);
                }

                $scope.setSubmitButtonStatus();
            }

            $scope.updateDependentOrderItems = function(parent_product_id, current_parent_product_quantity){
                $.each($scope.dependent_order_items, function(index, item){
                    if(item.depended_product_id == parent_product_id){
                        item.quantity = (current_parent_product_quantity * item.original_dependent_quantity);
                        item.removed = current_parent_product_quantity == 0;
                    }
                });
            }

            /*-----------------------------------------------------------------------
             * decrease quantity 1 unit for all kinds of order items
             *-----------------------------------------------------------------------*/
            $scope.decrease_quantity = function(item){
                if(item.remaining > 0)
                {
                    item.instock += 1;
                    item.remaining -= 1;
                    var unit_price = parseFloat(item.unit_price);
                    item.refunded_amount -= unit_price;
                    $scope.update_total_changed_amount(unit_price, true);
                    $scope.updateDependentOrderItems(item.product_id, item.remaining);
                }
            };

            /*-----------------------------------------------------------------------
             * increase quantity 1 unit for all kinds of order items
             *-----------------------------------------------------------------------*/
            $scope.increase_quantity = function(item){
                if(item.instock > 0) {
                    item.instock -= 1;
                    item.remaining += 1;
                    var unit_price = parseFloat(item.unit_price);
                    item.refunded_amount += unit_price;
                    $scope.update_total_changed_amount(unit_price, false);
                    $scope.updateDependentOrderItems(item.product_id, item.remaining);
                }
            };

            //flight
            $scope.decreaseFlightQuantity = function(index){
                var current_order_item = $scope.flight_order_items[index];
                if(current_order_item.remaining > 0)
                {
                    current_order_item.remaining -= 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount -= refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, true);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            $scope.increaseFlightQuantity = function(index){
                var current_order_item = $scope.flight_order_items[index];
                if(current_order_item.remaining < current_order_item.quantity)
                {
                    current_order_item.remaining += 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount += refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, false);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            // shared lodging
            $scope.decreaseSharedLodgingQuantity = function(index){
                var current_order_item = $scope.shared_lodging_order_items[index];
                if(current_order_item.remaining > 0)
                {
                    current_order_item.remaining -= 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount -= refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, true);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            $scope.increaseSharedLodgingQuantity = function(index){
                var current_order_item = $scope.shared_lodging_order_items[index];
                if(current_order_item.remaining < current_order_item.quantity)
                {
                    current_order_item.remaining += 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount += refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, false);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            // shared hotel
            $scope.decreaseSharedHotelQuantity = function(index){
                var current_order_item = $scope.shared_hotel_order_items[index];
                if(current_order_item.remaining > 0)
                {
                    current_order_item.remaining -= 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount -= refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, true);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            $scope.increaseSharedHotelQuantity = function(index){
                var current_order_item = $scope.shared_hotel_order_items[index];
                if(current_order_item.remaining < current_order_item.quantity)
                {
                    current_order_item.remaining += 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount += refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, false);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            // package
            $scope.decreasePackageQuantity = function(index){
                var current_order_item = $scope.travel_package_order_items[index];
                if(current_order_item.remaining > 0)
                {
                    current_order_item.remaining -= 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount -= refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, true);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            $scope.increasePackageQuantity = function(index){
                var current_order_item = $scope.travel_package_order_items[index];
                if(current_order_item.remaining < current_order_item.quantity)
                {
                    current_order_item.remaining += 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount += refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, false);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            //add-ons
            $scope.decreaseAddonQuantity = function(index){
                var current_order_item = $scope.addon_order_items[index];
            	if(current_order_item.remaining > 0)
            	{
                    current_order_item.instock += 1;
            		current_order_item.remaining -= 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount -= refunded_amount;
            		$scope.update_total_changed_amount(refunded_amount, true);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
            	}
            };

            $scope.increaseAddonQuantity = function(index){
                var current_order_item = $scope.addon_order_items[index];
                if(current_order_item.instock > 0){
                    current_order_item.instock -= 1;
                    current_order_item.remaining += 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount += refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, false);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            //add-ons with variant
            $scope.decreaseAddonWithVariantQuantity = function(index){
                var current_order_item = $scope.addon_with_variant_order_items[index];
                if(current_order_item.remaining > 0)
                {
                    current_order_item.instock += 1;
                    current_order_item.remaining -= 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount -= refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, true);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            $scope.increaseAddonWithVariantQuantity = function(index){
                var current_order_item = $scope.addon_with_variant_order_items[index];
                if(current_order_item.instock > 0){
                    current_order_item.instock -= 1;
                    current_order_item.remaining += 1;
                    var refunded_amount = parseFloat(current_order_item.unit_price);
                    current_order_item.refunded_amount += refunded_amount;
                    $scope.update_total_changed_amount(refunded_amount, false);
                    $scope.updateDependentOrderItems(current_order_item.product_id, current_order_item.remaining);
                }
            };

            //club access
            $scope.decreaseClubAccessQuantity = function(index){
                var item = $scope.club_access_order_items[index];
                if(item.remaining > 0)
                {
                    item.remaining -= 1;
                    var unit_price = parseFloat(item.unit_price);
                    item.refunded_amount -= unit_price;
                    $scope.update_total_changed_amount(unit_price, true);
                    $scope.updateDependentOrderItems(item.product_id, item.remaining);
                }
            };

            $scope.increaseClubAccessQuantity = function(index){
                var item = $scope.club_access_order_items[index];
                item.remaining += 1;
                var unit_price = parseFloat(item.unit_price);
                item.refunded_amount += unit_price;
                $scope.update_total_changed_amount(unit_price, false);
                $scope.updateDependentOrderItems(item.product_id, item.remaining);
            };

            //bus without time
            $scope.decreaseBusWithoutTimeQuantity = function(index){
                var item = $scope.bus_without_time_order_items[index];
                if(item.remaining > 0)
                {
                    item.remaining -= 1;
                    var unit_price = parseFloat(item.unit_price);
                    item.refunded_amount -= unit_price;
                    $scope.update_total_changed_amount(unit_price, true);
                    $scope.updateDependentOrderItems(item.product_id, item.remaining);
                }
            };

            $scope.increaseBusWithoutTimeQuantity = function(index){
                var item = $scope.bus_without_time_order_items[index];
                item.remaining += 1;
                var unit_price = parseFloat(item.unit_price);
                item.refunded_amount += unit_price;
                $scope.update_total_changed_amount(unit_price, false);
                $scope.updateDependentOrderItems(item.product_id, item.remaining);
            };

            $scope.updateDoRemoveRoomCheckChanged = function(index){
                var room = $scope.lodging_rooms[index];
                if (room.is_removed == true){
                    room.checkout_date = room.checkin_date;
                }else{
                    room.checkout_date = room.old_checkout_date;
                }
            };

            $scope.updateDoNotRefundCheckChanged = function(index){
                $scope.splitments[index].refund_amount = 0;
                $scope.setSubmitButtonStatus();
            };

            $scope.splitEvenly = function(){
            	if(parseFloat($scope.total_refunded_amount) == 0) return;

            	//get number of split payments
                var num_splitment = $.grep($scope.splitments, function(s){ return s.do_not_refund == false && ignored_refund_statuses.indexOf(s.status) == -1 }).length;

                if(num_splitment > 0){
                    //eg: $28.34343 --> $28.34
                    var cannot_update_split_indexes = [];
                    var split_amount = $scope.calculate_even_amount(num_splitment, cannot_update_split_indexes);

                    while(cannot_update_split_indexes.length < num_splitment){
                        var recheck = false;

                        for(i = 0; i < $scope.splitments.length; i++){
                            if(!$scope.splitments[i].do_not_refund &&  cannot_update_split_indexes.indexOf(i) == -1 && ignored_refund_statuses.indexOf($scope.splitments[i].status) == -1){
                                if(parseFloat($scope.splitments[i].refundable_amount) < parseFloat(split_amount)){
                                    cannot_update_split_indexes.push(i);
                                    split_amount = $scope.calculate_even_amount(num_splitment, cannot_update_split_indexes);
                                    recheck = true;
                                }
                            }
                        }

                        if(recheck == false) break;
                    }

                    var remaining_amount = parseFloat($scope.total_refunded_amount);

                    for(i=0; i < cannot_update_split_indexes.length; i++) {
                        var idx = cannot_update_split_indexes[i];
                        var amount = parseFloat($scope.splitments[idx].refundable_amount).toFixed(2);
                        $scope.splitments[idx].refund_amount = parseFloat(amount);
                        remaining_amount -= parseFloat(amount);
                    }

                    var last_split_amount = parseFloat(remaining_amount) - split_amount * (num_splitment - cannot_update_split_indexes.length - 1);
                    var last_split_index = -1;
                    for(var i = 0; i < $scope.splitments.length; i++){
                        if($scope.splitments[i].do_not_refund == false && cannot_update_split_indexes.indexOf(i) == -1 && ignored_refund_statuses.indexOf($scope.splitments[i].status) == -1){
                            last_split_index = i;
                        }
                    }

                    for(i = 0; i < $scope.splitments.length; i++){
                        if(!$scope.splitments[i].do_not_refund &&  cannot_update_split_indexes.indexOf(i) == -1 && ignored_refund_statuses.indexOf($scope.splitments[i].status) == -1){
                            $scope.splitments[i].refund_amount = parseFloat(split_amount);
                        }
                    }
                    if(last_split_index >= 0){
                        $scope.splitments[last_split_index].refund_amount = parseFloat(last_split_amount.toFixed(2));
                    }
                }

            	$scope.setSubmitButtonStatus();
            };

            $scope.calculate_even_amount = function(num_splitment, cannot_update_split_indexes){
                var total_assigned_value = 0;
                for(var i=0; i < cannot_update_split_indexes.length; i++) {
                    var idx = cannot_update_split_indexes[i];
                    total_assigned_value += parseFloat($scope.splitments[idx].refundable_amount);
                }
                var remaining_splits = num_splitment - cannot_update_split_indexes.length;
                return parseFloat(($scope.total_refunded_amount - total_assigned_value) / remaining_splits).toFixed(2);
            };

            $scope.refund_amount_changing = function(){
            	if(parseFloat($scope.total_changed_amount) != 0)
                    $scope.setSubmitButtonStatus();
            };

            $scope.decrease_item_submit = function(e) {
            	e.preventDefault();

                $scope.setSubmitButtonStatus();

	            if($scope.isSubmitButtonDisabled){
	            	bootbox.alert("<p style='text-aligh:left;'><b>Please check your split refund amounts.</b>"
								  + "<br />  - The total split refund must be equal to (<b>$" + $scope.total_manual_amount + "</b>)."
								  + "<br />  - Each split refund amount must be <= the refundable amount."
								  + "</p>");
	            	return false;
	            }

            	bootbox.confirm("Are you sure you want to refund? <br /><br />", function(confirm){
					if (confirm) {
						$('#decreaseItemOrderForm').submit();
					}
				});
            };

            $scope.increase_item_submit = function(e){
                e.preventDefault();

                bootbox.confirm("Are you sure you want to update? <br /><br />", function(confirm){
                    if (confirm) {
                        $('#increaseItemOrderForm').submit();
                    }
                });
            };

            $scope.get_changed_room_data = function () {
                var changed_room_data = [];
                for(var i = 0; i < $scope.lodging_rooms.length; i++) {
                    var room = $scope.lodging_rooms[i];
                    changed_room_data.push({
                        "id": room.id,
                        "old_checkin_date": room.old_checkin_date,
                        "old_checkout_date": room.old_checkout_date,
                        "checkin_date": room.checkin_date,
                        "checkout_date": room.checkout_date
                    });
                }

                $.ajax({
                    type: "POST",
                    url: $scope.update_lodging_room_url,
                    data: {'changed_room_data': JSON.stringify(changed_room_data)},
                    async: false,
                    success: function (data) {
                        if (data.is_success){
                            $scope.changed_lodging_room_data = data.lodging_changed_data;
                            $scope.changed_room_data = changed_room_data;
                            $scope.total_lodging_refunded_amount = data.total_amount;
                            var lodging_room_changed_data = data.lodging_room_changed_data;
                            for(var i = 0; i < lodging_room_changed_data.length; i++){
                                for(var j = 0; j < $scope.lodging_rooms.length; j++) {
                                    var room = $scope.lodging_rooms[j];
                                    if (room.id == lodging_room_changed_data[i].id){
                                        room.amount_changed = lodging_room_changed_data[i].amount_changed;
                                        break;
                                    }
                                }
                            }

                            $scope.changed_room_data = $.grep($scope.changed_room_data, function(value) {
                                return value.checkin_date != value.old_checkin_date || value.checkout_date != value.old_checkout_date;
                            });
                            $scope.setSubmitButtonStatus();
                        }else{
                            bootbox.alert('out of stock');
                            $scope.reset_lodging_data();

                            $scope.changed_room_data = $.grep($scope.changed_room_data, function(value) {
                                return value.checkin_date != value.old_checkin_date || value.checkout_date != value.old_checkout_date;
                            });
                            $scope.setSubmitButtonStatus();
                        }
                    }
                });
            };

            $scope.$watch("lodging_rooms", function(newVal, oldVal){
                var changed_room = null;
                for(var i = 0; i < newVal.length; i++) {
                    var room = newVal[i];
                    var old_room = null;
                    for (var j = 0; j < oldVal.length; j++) {
                        if (oldVal[j].id == room.id) {
                            old_room = oldVal[j];
                        }
                    }
                    if (old_room != null
                        && (room.checkin_date != old_room.checkin_date || room.checkout_date != old_room.checkout_date || room.is_removed != old_room.is_removed)) {
                        changed_room = room;
                    }
                }

                if(changed_room != null){
                    var diff_date = moment(changed_room.checkout_date).diff(moment(changed_room.checkin_date), 'days');

                    if(diff_date <= 0 && changed_room.is_removed == false){
                        bootbox.alert('Check-in date must less than or equal checkout date!');
                        $scope.reset_lodging_data();
                        return;
                    }
                    else if (diff_date < changed_room.min_nights && changed_room.is_removed == false) {
                        var message = changed_room.min_nights + " minimum nights to stay is required. Are you sure you want to change?";

                        bootbox.confirm(message, function (result) {
                            if (!result) {
                                $scope.$apply(function() {
                                    $scope.reset_lodging_data();
                                    return;
                                });
                            }
                            else{
                                $scope.get_changed_room_data();
                            }
                        });
                    }
                    else{
                        $scope.get_changed_room_data();
                    }
                }
            }, true);

            $scope.$watch("total_lodging_refunded_amount", function(newVal, oldVal){
                $scope.total_changed_amount += parseFloat(newVal) - parseFloat(oldVal);
            });

            $scope.$watch("total_changed_amount", function(newVal, oldVal){
                if(!$scope.is_input_manual_amount){
                    $scope.total_manual_amount = parseFloat(newVal.toFixed(2));
                }
                else{
                    $scope.refunded_amount_base_on_manual_amount();
                }
            });

            $scope.$watch("total_manual_amount", function(newVal, oldVal){
                $scope.refunded_amount_base_on_manual_amount();
            });

            $scope.$watch("is_input_manual_amount", function(newVal, oldVal){
                if(!newVal){
                    $scope.total_manual_amount = parseFloat($scope.total_changed_amount.toFixed(2));
                }

                $('#total_manual_amount').attr('min', -999999);
            });

            $scope.$watch("flight_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var changed_flight_data = [];
                    for(var i = 0; i < $scope.flight_order_items.length; i++){
                        var flight = $scope.flight_order_items[i];
                        if (flight.quantity != flight.remaining){
                            changed_flight_data.push({"block_id": flight.flight_id,
                                "quantity": parseInt(flight.remaining) - parseInt(flight.quantity),
                                "date": ""});
                        }
                    }
                    $scope.changed_flight_data = changed_flight_data;
                    $scope.refund_round_up_amount_alert();
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("shared_lodging_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var selected_items = [];
                    for(var i = 0; i < $scope.shared_lodging_order_items.length; i++){
                        var shared_lodging = $scope.shared_lodging_order_items[i];
                        if (shared_lodging.quantity != shared_lodging.remaining){
                            selected_items.push(
                                {
                                    "room_type_id": shared_lodging.room_type_id,
                                    "quantity": parseInt(shared_lodging.remaining) - parseInt(shared_lodging.quantity),
                                    "block_id": shared_lodging.block_id
                                });
                        }
                    }
                    $scope.changed_shared_lodging_data = selected_items;
                    $scope.refund_round_up_amount_alert();
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("shared_hotel_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var selected_items = [];
                    for(var i = 0; i < $scope.shared_hotel_order_items.length; i++){
                        var shared_lodging = $scope.shared_hotel_order_items[i];
                        if (shared_lodging.quantity != shared_lodging.remaining){
                            selected_items.push(
                                {
                                    "quantity": parseInt(shared_lodging.remaining) - parseInt(shared_lodging.quantity),
                                    "block_id": shared_lodging.block_id
                                });
                        }
                    }
                    $scope.changed_shared_hotel_data = selected_items;
                    $scope.refund_round_up_amount_alert();
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("travel_package_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var selected_items = [];
                    for(var i = 0; i < $scope.travel_package_order_items.length; i++){
                        var package = $scope.travel_package_order_items[i];
                        if (package.quantity != package.remaining){
                            selected_items.push(
                                {
                                    "travel_package_id": package.travel_package_id,
                                    "quantity": parseInt(package.remaining) - parseInt(package.quantity),
                                    "travel_package_setting_id": package.travel_package_setting_id
                                });
                        }
                    }
                    $scope.changed_travel_package_data = selected_items;
                    $scope.refund_round_up_amount_alert();
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("club_access_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var changed_club_data = [];
                    for(var i = 0; i < $scope.club_access_order_items.length; i++){
                        var club = $scope.club_access_order_items[i];
                        if (club.quantity != club.remaining){
                            changed_club_data.push(
                                {
                                    "block_id": club.block_id,
                                    "quantity": parseInt(club.remaining) - parseInt(club.quantity),
                                    "date": ""
                                });
                        }
                    }
                    $scope.changed_club_data = changed_club_data;
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("bus_without_time_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var changed_bus_without_time_data = [];
                    for(var i = 0; i < $scope.bus_without_time_order_items.length; i++){
                        var bus_without_time = $scope.bus_without_time_order_items[i];
                        if (bus_without_time.quantity != bus_without_time.remaining){
                            changed_bus_without_time_data.push(
                                {
                                    "block_id": bus_without_time.block_id,
                                    "quantity": parseInt(bus_without_time.remaining) - parseInt(bus_without_time.quantity),
                                    "date": ""
                                });
                        }
                    }
                    $scope.changed_bus_without_time_data = changed_bus_without_time_data;
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("shuttle_bus_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var changed_items = [];
                    for(var i = 0; i < $scope.shuttle_bus_order_items.length; i++){
                        var item = $scope.shuttle_bus_order_items[i];
                        if (item.quantity != item.remaining){
                            changed_items.push(
                                {
                                    "block_id": item.block_id,
                                    "quantity": parseInt(item.remaining) - parseInt(item.quantity),
                                    "date": ""
                                });
                        }
                    }
                    $scope.changed_shuttle_data = changed_items;
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("custom_activity_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var changed_items = [];
                    for(var i = 0; i < $scope.custom_activity_order_items.length; i++){
                        var item = $scope.custom_activity_order_items[i];
                        if (item.quantity != item.remaining){
                            changed_items.push(
                                {
                                    "block_id": item.block_id,
                                    "quantity": parseInt(item.remaining) - parseInt(item.quantity),
                                    "date": ""
                                });
                        }
                    }
                    $scope.changed_custom_activity_data = changed_items;
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("addon_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var changed_addon_data = [];
                    for(var i = 0; i < $scope.addon_order_items.length; i++){
                        var addon = $scope.addon_order_items[i];
                        if (addon.quantity != addon.remaining){
                            changed_addon_data.push(
                                {
                                    "block_id": addon.block_id,
                                    "quantity": parseInt(addon.remaining) - parseInt(addon.quantity),
                                    "date": addon.date
                                });
                        }
                    }
                    $scope.changed_addon_data = changed_addon_data;
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.$watch("addon_with_variant_order_items", function(newVal, oldVal){
                if (!angular.equals([], oldVal)){
                    var changed_addon_data = [];
                    for(var i = 0; i < $scope.addon_with_variant_order_items.length; i++){
                        var addon = $scope.addon_with_variant_order_items[i];
                        if (addon.quantity != addon.remaining){
                            changed_addon_data.push(
                                {
                                    "block_id": addon.block_id,
                                    "quantity": parseInt(addon.remaining) - parseInt(addon.quantity),
                                    "date": ""
                                });
                        }
                    }
                    $scope.changed_addon_with_variant_data = changed_addon_data;
                    $scope.setSubmitButtonStatus();
                }
            }, true);

            $scope.reset_lodging_data = function(){
                $scope.changed_lodging_room_data = [];
                for(var i = 0; i < $scope.lodging_rooms.length; i++) {
                    var room = $scope.lodging_rooms[i];
                    room.checkin_date = room.old_checkin_date;
                    room.checkout_date = room.old_checkout_date;
                    room.amount_changed = 0;
                }
                $scope.total_lodging_refunded_amount = 0;
            };

            $scope.filter_product_type = function(product){
                if(product.added){
                    return false;
                }

                if(product.type == 'Flight' && product.unique && $scope.product_type_filters.flight){
                    return !($scope.flight_order_items.length > 0 || $scope.added_flight_data.length > 0);
                }
                else if((product.type == 'SharedLodging' || product.type == 'SharedHotel') && product.unique && $scope.product_type_filters.hotel){
                    return !($scope.shared_lodging_order_items.length > 0 || $scope.added_shared_lodging_data.length > 0 || $scope.shared_hotel_order_items.length > 0 || $scope.added_shared_hotel_data.length > 0);
                }
                else if(product.type == 'TravelPackage' && product.unique && $scope.product_type_filters.package){
                    return !($scope.travel_package_order_items.length > 0 || $scope.added_travel_package_data.length > 0);
                }
                else{
                    var filters = [];
                    if($scope.product_type_filters.addon){
                        filters.push('SuiteParty');
                        filters.push('CustomActivity');
                        filters.push('AddonWithVariant');
                    }
                    if($scope.product_type_filters.bus){
                        filters.push('BusWithoutTime');
                        filters.push('ShuttleBus');
                    }
                    if($scope.product_type_filters.club){
                        filters.push('ClubAccess');
                    }
                    if($scope.product_type_filters.hotel){
                        filters.push('Lodging');
                        filters.push('SharedLodging');
                        filters.push('SharedHotel');
                    }
                    if($scope.product_type_filters.flight){
                        filters.push('Flight');
                    }
                    return (filters.indexOf(product.type) !== -1);
                }

                return false;
            };

            $scope.increase_added_quantity = function(item){
                if(item.instock > item.quantity) {
                    item.quantity += 1;
                    var unit_price = parseFloat(item.unit_price);
                    item.amount += unit_price;
                    if(item.type == 'Lodging'){
                        $.each(item.blocks, function(i,b){
                            b.quantity += 1;
                        });
                    }
                    $scope.update_total_changed_amount(unit_price, false);
                    $scope.setSubmitButtonStatus();
                }
            };

            $scope.decrease_added_quantity = function(item){
                if(item.quantity > 0)
                {
                    item.quantity -= 1;
                    var unit_price = parseFloat(item.unit_price);
                    item.amount -= unit_price;
                    $scope.update_total_changed_amount(unit_price, true);
                    
                    if(item.quantity <= 0){
                        $scope.remove_added_product(item);
                    }else{
                        if(item.type == 'Lodging'){
                            $.each(item.blocks, function(i,b){
                                b.quantity -= 1;
                            });
                        }
                    }
                    $scope.setSubmitButtonStatus();
                }
            };

            $scope.add_new_product_with_option = function(){
                if($scope.selected_product.quantity > 0){
                    $scope.add_new_product($scope.selected_product);
                    $scope.reset_selected_product();
                    $('#lodgingDetailsModal').modal('hide');
                    $('#customProductDetailsModal').modal('hide');
                    $('#addonWithVariantDetailsModal').modal('hide');
                }
            };

            $scope.add_new_shared_lodging = function(){
                if($scope.selected_product.room_type)
                {
                    $scope.add_new_product($scope.selected_product);
                    $scope.reset_selected_product();
                    $('#sharedLodgingDetailsModal').modal('hide');
                }
            };

            $scope.add_new_shared_hotel = function(){
                if($scope.selected_product.unit_price)
                {
                    $scope.add_new_product($scope.selected_product);
                    $scope.reset_selected_product();
                    $('#sharedHotelDetailsModal').modal('hide');
                }
            };

            $scope.add_new_travel_package = function(){
                if($scope.selected_product.hotel)
                {
                    $scope.add_new_product($scope.selected_product);
                    $scope.reset_selected_product();
                    $('#travelPackageDetailsModal').modal('hide');
                }
            };

            $scope.add_new_flight = function(){
                $scope.selected_product.quantity = 1;
                $scope.add_new_product($scope.selected_product);
                $scope.reset_selected_product();
                $('#flightDetailsModal').modal('hide');
            };

            $scope.add_new_product = function(product){
                var item = {
                    product_id: product.id,
                    product_name: product.name,
                    unit_price: (product.type != 'SharedLodging' && product.type != 'SharedHotel') ? product.price : 0,
                    amount: parseFloat(product.price) * product.quantity,
                    quantity: product.quantity,
                    instock: product.instock,
                    unique: product.unique,
                    type: product.type,
                    note: product.note
                };

                // Insert item to array of items
                switch (product.type){
                    case 'Flight':
                        item.flight_details = product.flight_details;
                        $scope.added_flight_data.push(item);
                        break;
                    case 'SharedLodging':
                        item.checkin_date = product.shared_checkin_date;
                        item.checkout_date = product.shared_checkout_date;
                        item.trip_date_id = product.trip_date_id;
                        item.room_type = product.room_type;
                        item.unit_price = product.room_type.unit_price;
                        item.quantity = 1;
                        item.amount = parseFloat(product.room_type.unit_price);
                        $scope.added_shared_lodging_data.push(item);
                        break;
                    case 'SharedHotel':
                        item.checkin_date = product.shared_checkin_date;
                        item.checkout_date = product.shared_checkout_date;
                        item.trip_date_id = product.trip_date_id;
                        item.unit_price = product.unit_price;
                        item.quantity = 1;
                        item.amount = parseFloat(product.unit_price);
                        $scope.added_shared_hotel_data.push(item);
                        break;
                    case 'TravelPackage':
                        item.travel_package_setting_id = product.hotel.travel_package_setting_id;
                        item.travel_package_id = product.hotel.travel_package_id;
                        item.has_flight = product.hotel.has_flight;
                        item.hotel_name = product.hotel.name;
                        item.unit_price = product.hotel.price;
                        item.quantity = 1;
                        item.amount = parseFloat(product.hotel.price);
                        $scope.added_travel_package_data.push(item);
                        break;
                    case 'Lodging':
                        item.checkin_date = moment(product.checkin_date).format("YYYY-MM-DD");
                        item.checkout_date = moment(product.checkout_date).format("YYYY-MM-DD");
                        item.room_type_id = product.room_type_id;
                        item.blocks = product.selected_blocks;
                        $scope.added_lodging_room_data.push(item);
                        break;
                    case 'SuiteParty':
                        $scope.added_addon_data.push(item);
                        break;
                    case 'ClubAccess':
                        $scope.added_club_data.push(item);
                        break;
                    case 'ShuttleBus':
                        item.product_block_id = product.selected_block.block_id;
                        item.description = product.selected_date != undefined ? product.selected_date + ' ' + product.selected_block.time : '';
                        item.hotel_id = product.hotel_id;
                        item.custom_hotel_name = product.custom_hotel_name;
                        item.flight_number = product.flight_number;
                        item.airline = product.selected_airline == 'Other' ? product.other_airline : product.selected_airline;
                        item.other_airline = product.other_airline;
                        item.unit_price = product.selected_block.unit_price;
                        item.amount = parseFloat(product.selected_block.unit_price) * product.quantity;
                        item.date = product.selected_date;
                        $scope.added_shuttle_data.push(item);
                        break;
                    case 'CustomActivity':
                        if(product.shopping_type == 1){
                            item.product_block_id = product.selected_block.block_id;
                            item.description = product.selected_date != undefined ? product.selected_date + ' ' + product.selected_block.time : '';
                            item.unit_price = product.selected_block.unit_price;
                            item.amount = parseFloat(product.selected_block.unit_price) * product.quantity;
                            item.date = product.selected_date;
                        }
                        $scope.added_custom_activity_data.push(item);
                        break;
                    case 'AddonWithVariant':
                        item.product_block_id = product.selected_block.block_id;
                        item.unit_price = product.selected_block.unit_price;
                        item.amount = parseFloat(product.selected_block.unit_price) * product.quantity;
                        item.variant_name = product.variant_name;
                        $scope.added_addon_with_variant_data.push(item);
                        break;
                }

                $scope.update_product_state(product.id, true);
                $scope.update_total_changed_amount(item.amount, false);
                $scope.setSubmitButtonStatus();
            };

            $scope.show_added_product = function(product){
                $scope.selected_product = angular.copy(product);

                if(product.type == 'Flight'){
                    $('#flightDetailsModal').modal({keyboard: false});
                    return;
                }

                if(product.type == 'SharedLodging'){
                    $scope.selected_product.checkout_dates = [];
                    var checkin_dates = $scope.selected_product.checkin_dates;
                    var min_checkin_date = moment(checkin_dates[0]).format(date_format_string);
                    var max_checkin_date = moment(checkin_dates[checkin_dates.length - 1]).format(date_format_string);
                    var $txtcheckin = $('[ng-model="selected_product.shared_checkin_date"]');
                    if(checkin_dates && checkin_dates.length > 0){
                        $txtcheckin.datepicker("option", {minDate: min_checkin_date, maxDate: max_checkin_date, defaultDate: min_checkin_date});
                    }else{
                        $txtcheckin.datepicker("option", "minDate", '');
                        $txtcheckin.datepicker("option", "maxDate", '');
                    }
                    $('#sharedLodgingDetailsModal').modal({keyboard: false});
                    return;
                }

                if(product.type == 'SharedHotel'){
                    $scope.selected_product.checkout_dates = [];
                    var checkin_dates = $scope.selected_product.checkin_dates;
                    var min_checkin_date = moment(checkin_dates[0]).format(date_format_string);
                    var max_checkin_date = moment(checkin_dates[checkin_dates.length - 1]).format(date_format_string);
                    var $txtcheckin = $('[ng-model="selected_product.shared_checkin_date"]');
                    if(checkin_dates && checkin_dates.length > 0){
                        $txtcheckin.datepicker("option", {minDate: min_checkin_date, maxDate: max_checkin_date, defaultDate: min_checkin_date});
                    }else{
                        $txtcheckin.datepicker("option", "minDate", '');
                        $txtcheckin.datepicker("option", "maxDate", '');
                    }
                    $('#sharedHotelDetailsModal').modal({keyboard: false});
                    return;
                }

                if(product.type == 'TravelPackage'){
                    $scope.selected_product.hotel_id = null;
                    $('#travelPackageDetailsModal').modal({keyboard: false});
                    return;
                }

                $.ajax({
                    type: "POST",
                    url: '/orders/customize_product/' + product.type + '/' + product.id,
                    data: {event_id: $scope.event_id },
                    success: function (result) {
                        $scope.$apply(function(){
                            if (product.type == 'Lodging'){
                                $scope.selected_product = $.extend($scope.selected_product, result);

                                if(result.room_type_id && result.room_type_id > 0){
                                    $scope.selected_product.checkin_dates_by_room_type = result.checkin_dates;
                                    $scope.selected_product.checkout_dates_by_room_type = result.checkout_dates;
                                    $scope.selected_product.checkin_dates = result.checkin_dates[result.room_type_id];
                                    $scope.selected_product.checkout_dates = result.checkout_dates[result.room_type_id];
                                }

                                var checkin_dates = $scope.selected_product.checkin_dates;
                                var checkout_dates = $scope.selected_product.checkout_dates;

                                var min_checkin_date = moment(checkin_dates[0]).format(date_format_string);
                                var min_checkout_date = moment(checkout_dates[0]).format(date_format_string);
                                var max_checkin_date = moment(checkin_dates[checkin_dates.length - 1]).format(date_format_string);
                                var max_checkout_date = moment(checkout_dates[checkout_dates.length - 1]).format(date_format_string);
                                var $txtcheckin = $('[ng-model="selected_product.checkin_date"]');
                                var $txtcheckout = $('[ng-model="selected_product.checkout_date"]');
                                if(checkin_dates && checkin_dates.length > 0){
                                    $txtcheckin.datepicker("option", {minDate: min_checkin_date, maxDate: max_checkin_date, defaultDate: min_checkin_date});
                                    $txtcheckout.datepicker("option", {minDate: min_checkout_date, maxDate: max_checkout_date, defaultDate: min_checkout_date});
                                }else{
                                    $txtcheckin.datepicker("option", "minDate", '');
                                    $txtcheckin.datepicker("option", "maxDate", '');
                                    $txtcheckout.datepicker("option", "minDate", '');
                                    $txtcheckout.datepicker("option", "maxDate", '');
                                }
                            }
                            else if (product.type == 'AddonWithVariant'){
                                $scope.selected_product.addon_variants = result.addon_variants;
                            }
                            else{
                                // Shuttle bus and Custom activity
                                var dates = result.available_dates;
                                $scope.selected_product.blocks = result.blocks;
                                $scope.selected_product.available_dates = dates;
                                if(dates && dates.length > 0){
                                    $("#datePicker").datepicker("option", "minDate", dates[0]);
                                    $("#datePicker").datepicker("option", "maxDate", dates[dates.length -1]);
                                }else{
                                    $("#datePicker").datepicker("option", "minDate", '');
                                    $("#datePicker").datepicker("option", "maxDate", '');
                                }

                                if (product.type == 'ShuttleBus'){
                                    $scope.airlines = result.airlines;
                                }
                            }
                        });


                        if (product.type == 'Lodging'){
                            $('#lodgingDetailsModal').modal({keyboard: false});
                        }
                        else if (product.type == 'AddonWithVariant'){
                            $('#addonWithVariantDetailsModal').modal({keyboard: false});
                        }
                        else {
                            $('#customProductDetailsModal').modal({keyboard: false});
                        }
                    }
                });
            };

            $scope.remove_added_product = function(item){
                // Set product added status to false
                $scope.update_product_state(item.product_id, false);

                // Remove item from array of items
                switch (item.type){
                    case 'Flight':
                        $scope.added_flight_data = jQuery.grep($scope.added_flight_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'SharedLodging':
                        $scope.added_shared_lodging_data = jQuery.grep($scope.added_shared_lodging_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'SharedHotel':
                        $scope.added_shared_hotel_data = jQuery.grep($scope.added_shared_hotel_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'TravelPackage':
                        $scope.added_travel_package_data = jQuery.grep($scope.added_travel_package_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'Lodging':
                        $scope.added_lodging_room_data = jQuery.grep($scope.added_lodging_room_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'SuiteParty':
                        $scope.added_addon_data = jQuery.grep($scope.added_addon_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'ClubAccess':
                        $scope.added_club_data = jQuery.grep($scope.added_club_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'ShuttleBus':
                        $scope.added_shuttle_data = jQuery.grep($scope.added_shuttle_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'CustomActivity':
                        $scope.added_custom_activity_data = jQuery.grep($scope.added_custom_activity_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                    case 'AddonWithVariant':
                        $scope.added_addon_with_variant_data = jQuery.grep($scope.added_addon_with_variant_data, function(value) {
                            return value.product_id != item.product_id;
                        });
                        break;
                }
            };

            $scope.update_product_state = function (product_id, is_added) {
                var product = $scope.available_products.find(function (value) {
                    return value.id == product_id;
                });
                if(is_added){
                    product.added = true;
                }
                else{
                    product.added = false;
                    product.quantity = 0;
                }
            };

            $scope.reset_selected_product = function(){
                $scope.selected_product = {
                    blocks: [],
                    available_dates: [],
                    available_times: [],
                    flight_details: {},
                    selected_date: null,
                    selected_block: {},
                    product_block_id: null,
                    quantity: 0,
                    hotel_id: '',
                    custom_hotel_name: '',
                    selected_airline: '',
                    other_airline: '',
                    flight_number: '',
                    note: '',
                    addon_variant: null,
                    addon_variants: [],
                    room_type: null,
                    room_type_id: null,
                    checkin_date: null,
                    checkout_date: null,
                    checkin_dates: [],
                    checkout_dates: [],
                    checkin_dates_by_room_type: null,
                    checkout_dates_by_room_type: null
                };
            };

            $scope.disable_add_custom_product_button = function(){
                if($scope.selected_product.type == 'Lodging'){
                    return !$scope.selected_product.selected_blocks || ($scope.selected_product.selected_blocks && $scope.selected_product.selected_blocks.length == 0);
                }

                var p = $scope.selected_product;

                return p.quantity == 0 ||
                    !p.product_block_id || p.error ||
                    p.selected_block.stock < p.quantity ||
                    (p.type == 'ShuttleBus' &&
                        ((
                            !p.flight_number || p.flight_number == ''
                        ) ||
                        (
                            !p.hotel_id || p.hotel_id == '' || (p.hotel_id == 'other' && $.isEmptyObject(p.custom_hotel_name))
                        ) ||
                        (
                            !p.selected_airline || p.selected_airline == '' || (p.selected_airline == 'Other' && (!p.other_airline || p.other_airline == ''))
                        ))
                    );
            };

            $scope.$watch('selected_product.room_type_id', function(){
                var room_type_id = $scope.selected_product.room_type_id;
                if(room_type_id == null){
                    $scope.selected_product.checkin_dates = [];
                    $scope.selected_product.checkout_dates = [];
                    $scope.selected_product.checkin_date = null;
                    $scope.selected_product.checkout_date = null;
                }
                else{
                    checkin_dates_by_room_type = $scope.selected_product.checkin_dates_by_room_type;
                    checkout_dates_by_room_type = $scope.selected_product.checkout_dates_by_room_type;
                    $scope.selected_product.checkin_dates = checkin_dates_by_room_type[room_type_id];
                    $scope.selected_product.checkout_dates = checkout_dates_by_room_type[room_type_id];
                    $scope.selected_product.checkin_date = null;
                    $scope.selected_product.checkout_date = null;
                }

                var checkin_dates = $scope.selected_product.checkin_dates;
                var checkout_dates = $scope.selected_product.checkout_dates;

                var min_checkin_date = moment(checkin_dates[0]).format(date_format_string);
                var min_checkout_date = moment(checkout_dates[0]).format(date_format_string);
                var max_checkin_date = moment(checkin_dates[checkin_dates.length - 1]).format(date_format_string);
                var max_checkout_date = moment(checkout_dates[checkout_dates.length - 1]).format(date_format_string);
                var $txtcheckin = $('[ng-model="selected_product.checkin_date"]');
                var $txtcheckout = $('[ng-model="selected_product.checkout_date"]');
                if(checkin_dates && checkin_dates.length > 0){
                    $txtcheckin.datepicker("option", {minDate: min_checkin_date, maxDate: max_checkin_date, defaultDate: min_checkin_date});
                    $txtcheckout.datepicker("option", {minDate: min_checkout_date, maxDate: max_checkout_date, defaultDate: min_checkout_date});
                }else{
                    $txtcheckin.datepicker("option", "minDate", '');
                    $txtcheckin.datepicker("option", "maxDate", '');
                    $txtcheckout.datepicker("option", "minDate", '');
                    $txtcheckout.datepicker("option", "maxDate", '');
                }

                $scope.update_selected_product();
            });

            $scope.$watch('selected_product.selected_date', function(){
                if($scope.selected_product.selected_date == null) return;
                $scope.selected_product.available_times = $scope.selected_product.blocks[$scope.selected_product.selected_date];
                $scope.selected_product.selected_block = {};
                $scope.selected_product.quantity = 0;
            });

            $scope.$watch('selected_product.product_block_id', function(){
                if($scope.selected_product.product_block_id == null) {
                    $scope.selected_product.selected_block = {};
                    return;
                }
                if($scope.selected_product.available_times && $scope.selected_product.available_times.length > 0) {
                    $scope.selected_product.selected_block = $.grep($scope.selected_product.available_times, function (x) {
                        return x.block_id == $scope.selected_product.product_block_id;
                    })[0];
                }
            });

            $scope.$watch('selected_product.addon_variant', function(){
                if($scope.selected_product.addon_variant == null) {
                    $scope.selected_product.selected_block = {};
                    $scope.selected_product.product_block_id = null;
                    $scope.selected_product.variant_name = null;
                    return;
                }
                else {
                    $scope.selected_product.selected_block = $.grep($scope.selected_product.addon_variants, function (x) {
                        return x.block_id == $scope.selected_product.addon_variant.block_id;
                    })[0];
                    $scope.selected_product.product_block_id = $scope.selected_product.selected_block.block_id;
                    $scope.selected_product.variant_name = $scope.selected_product.addon_variant.name;
                }
            });

            //normal lodging
            $scope.$watch('selected_product.checkin_date', function(checkin_date){
                if(checkin_date){
                    var min_checkout_date = moment(checkin_date).add('days', $scope.selected_product.min_nights_lodging).format(date_format_string);
                    $('[ng-model="selected_product.checkout_date"]').datepicker(
                        "option",
                        {
                            minDate: min_checkout_date,
                            defaultDate: min_checkout_date
                        }
                    );
                    $scope.update_selected_product();
                }
            });

            $scope.$watch('selected_product.checkout_date', function(checkout_date){
                if(checkout_date){
                    var max_checkin_date = moment(checkout_date).add('days', -$scope.selected_product.min_nights_lodging).format(date_format_string);
                    $('[ng-model="selected_product.checkin_date"]').datepicker(
                        "option",
                        {
                            maxDate: max_checkin_date,
                            defaultDate: max_checkin_date
                        }
                    );
                    $scope.update_selected_product();
                }
            });

            //shared lodging
            $scope.$watch('selected_product.shared_checkin_date', function(d){
                if(d){
                    if ($scope.selected_product.type == 'SharedLodging'){
                        $scope.shared_lodging_changed(1);
                    }else if($scope.selected_product.type == 'SharedHotel'){
                        $scope.shared_hotel_changed(1);
                    }
                }
            });

            $scope.$watch('selected_product.shared_checkout_date', function(d){
                if(d){
                    if ($scope.selected_product.type == 'SharedLodging'){
                        $scope.shared_lodging_changed(2);
                    }else if($scope.selected_product.type == 'SharedHotel'){
                        $scope.shared_hotel_changed(2);
                    }
                }
            });

            $scope.shared_lodging_changed = function(type){
                $scope.selected_product.room_type = null;
                $scope.selected_product.error = "";

                $.ajax({
                    type: "POST",
                    url: '/events/' + $scope.event_id + '/available-shared-lodgings',
                    data: {
                        checkin_date: $scope.selected_product.shared_checkin_date,
                        checkout_date: $scope.selected_product.shared_checkout_date,
                        product_id: $scope.selected_product.id
                    },
                    success: function (result) {
                        $scope.$apply(function(){
                            if(type == 1){
                                $scope.selected_product.shared_checkout_date = null;
                                $scope.selected_product.checkout_dates = result.checkout_dates;
                                if(result.checkout_dates.length > 0){
                                    $('[ng-model="selected_product.shared_checkout_date"]').datepicker(
                                        "option",
                                        {
                                            maxDate: result.checkout_dates[result.checkout_dates.length - 1],
                                            minDate: result.checkout_dates[0]
                                        }
                                    );
                                }
                            }
                            $scope.selected_product.trip_date_id = result.trip_date_id;
                            $scope.selected_product.room_types = result.room_types;
                            if($scope.selected_product.shared_checkin_date && $scope.selected_product.shared_checkout_date && result.room_types.length == 0){
                                $scope.selected_product.error = "Sorry, there are no room type available for this hotel. Please select another hotel to continue!";
                            }
                        });
                    }
                });
            };

            $scope.shared_hotel_changed = function(type){
                $scope.selected_product.room_type = null;
                $scope.selected_product.error = "";

                $.ajax({
                    type: "POST",
                    url: '/events/' + $scope.event_id + '/available-shared-hotels',
                    data: {
                        checkin_date: $scope.selected_product.shared_checkin_date,
                        checkout_date: $scope.selected_product.shared_checkout_date,
                        product_id: $scope.selected_product.id
                    },
                    success: function (result) {
                        $scope.$apply(function(){
                            if(type == 1){
                                $scope.selected_product.shared_checkout_date = null;
                                $scope.selected_product.checkout_dates = result.checkout_dates;
                                if(result.checkout_dates.length > 0){
                                    $('[ng-model="selected_product.shared_checkout_date"]').datepicker(
                                        "option",
                                        {
                                            maxDate: result.checkout_dates[result.checkout_dates.length - 1],
                                            minDate: result.checkout_dates[0]
                                        }
                                    );
                                }
                            }
                            $scope.selected_product.trip_date_id = result.trip_date_id;
                            $scope.selected_product.unit_price = result.unit_price;
                            if($scope.selected_product.shared_checkin_date && $scope.selected_product.shared_checkout_date && result.unit_price == null){
                                $scope.selected_product.error = "Sorry, there are no block available for this hotel. Please select another hotel to continue!";
                            }
                        });
                    }
                });
            };

            $scope.update_selected_product = function(){
                $scope.selected_product.error = null;
                $scope.selected_product.selected_blocks = [];
                $scope.selected_product.total_price = 0;
                $scope.selected_product.price = 0;
                var quantity = $scope.selected_product.quantity;

                if($scope.selected_product.checkin_date && $scope.selected_product.checkout_date){
                    // Validate
                    var diff_date = moment($scope.selected_product.checkout_date).diff(moment($scope.selected_product.checkin_date),'days');

                    if(diff_date <= 0){
                        $scope.selected_product.error = 'Checkout must be grater than check-in';
                        return;
                    }

                    if(diff_date < $scope.selected_product.min_nights_lodging){
                        $scope.selected_product.error = 'Minimum room nights is ' + $scope.selected_product.min_nights_lodging;
                        return;
                    }

                    if($scope.selected_product.quantity && $scope.selected_product.quantity > $scope.selected_product.instock){
                        $scope.selected_product.error = 'Quantity must be less than availabe inventory';
                        return;
                    }

                    var date = $scope.selected_product.checkin_date;
                    var selected_dates = [];

                    while(diff_date > 0){
                        selected_dates.push(moment(date).format('YYYY-MM-DD'));
                        date = moment(date).add('days',1);
                        diff_date -= 1;
                    }

                    if (selected_dates.length >= $scope.selected_product.min_nights_lodging){
                        var urlMaximumQuantity = $scope.urlMaximumQuantity.replace(':product_slug', $scope.selected_product.slug);
                        var options = {
                            dates: selected_dates
                        };
                        if($scope.selected_product.type == 'Lodging'
                            && $scope.selected_product.room_type_id
                            && $scope.selected_product.room_type_id > 0){
                            options.room_type_id = $scope.selected_product.room_type_id;
                        }
                        $.get(urlMaximumQuantity, options, function(result){
                            $scope.$apply(function(){
                                $scope.selected_product.instock = result.maximumQuantity;
                                $scope.selected_product.selectableQuantities = result.quantitiesWithBlocks;
                                if(quantity > 0){
                                    for(var i = 0; i < $scope.selected_product.selectableQuantities.length; i++) {
                                        var blocksInDate = $scope.selected_product.selectableQuantities[i].quantityByBlocks;
                                        var qty = quantity;
                                        var date = selected_dates[i];
                                        for(var j = 0; j < blocksInDate.length; j++){
                                            var block_id = parseInt(blocksInDate[j].block.id);
                                            var block_unit_price = parseFloat(blocksInDate[j].block.unit_price);
                                            var block_qty = parseInt(blocksInDate[j].quantity);
                                            if (qty <= block_qty) {
                                                var block = {block_id: block_id, date: date, quantity: qty, unit_price: block_unit_price};
                                                $scope.selected_product.total_price += block_unit_price * qty;
                                                $scope.selected_product.selected_blocks.push(block);
                                                break;
                                            }else{
                                                var block = {block_id: block_id, date: date , quantity: block_qty, price: block_unit_price};
                                                $scope.selected_product.total_price += block_unit_price * block_qty;
                                                $scope.selected_product.selected_blocks.push(block);
                                                qty -= block_qty;
                                            }
                                        }
                                    }
                                    $scope.selected_product.price = $scope.selected_product.total_price/parseFloat($scope.selected_product.quantity);
                                }
                            });
                        }, 'json');

                    }
                }
            }

            $scope.format_date = function(d){
                return moment(d).format(date_format_string);
            }
        }
    ]);
}).call(this);