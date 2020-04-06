(function () {
    this.app.controller('DashboardHotelCtrl', [
        "$scope", "$timeout",
        function ($scope, $timeout) {
            $scope.Math = Math;
            $scope.selected_event = {};
            $scope.is_cabo_spring_break_event = false;
            $scope.trip_dates = [];
            $scope.data = {};
            $scope.src_hotel = null;
            $scope.src_trip_date_id = null;
            $scope.src_room_type_id = null;
            $scope.selected_guests = [];
            $scope.destination_hotels = [];
            $scope.destination_trip_date = null;
            $scope.destination_hotel = null;
            $scope.destination_room_type = null;
            $scope.additional_fee = 0;
            $scope.is_edit_additional_fee = false;
            $scope.show_input_additional_fee = false;
            $scope.hotel_index = 0;
            $scope.start_date = '';
            $scope.end_date = '';
            $scope.selected_product_ids = [];
            $scope.minimum_price_apply = 0;
            $scope.notify_to_user = false;

            $scope.init = new function(){};

            $scope.clearData = function () {
                $scope.is_edit_additional_fee = false;
                $scope.show_input_additional_fee = false;
                $scope.additional_fee = 0;
                $scope.destination_trip_date = null;
                $scope.destination_hotels = [];
                $scope.destination_hotel = null;
                $scope.destination_room_type = null;
                $scope.move_guests_comment = '';

                $timeout(function(){
                    $('[ng-model=destination_trip_date]').multiselect('refresh');
                });
            };

            $scope.getCurrentHotel = function(){
                if($scope.data.summary_data && $scope.data.summary_data.hotels.length > 0)
                    return $scope.data.summary_data.hotels[$scope.hotel_index];
            };

            $scope.changeHotelData = function(hotel_index, is_refresh){
                $scope.clearData();
                $scope.selected_guests = [];
                $scope.src_trip_date_id = null;
                $scope.src_room_type_id = null;
                $scope.hotel_index = hotel_index;
                $scope.src_hotel = $scope.getCurrentHotel();

                var get_hotel_data_url = "/group_travel_control_dashboards/" + $scope.selected_event.id + "/";

                if(is_refresh) {
                    get_hotel_data_url +=  $scope.selected_product_ids + "/";
                }

                get_hotel_data_url +=  $scope.src_hotel.id + "/" + $scope.start_date + "/" + $scope.end_date + "/" + $scope.date_type + "/get-hotel-data";

                $.post(get_hotel_data_url, {}, function(result){
                    if(result != null){
                        $scope.$apply(function(){
                            if(is_refresh) {
                                $scope.data = result;
                            }else{
                                $scope.data.selected_product = result.selected_product;
                                $scope.data.rooms = result.rooms;
                                $scope.data.total_guests = result.total_guests;
                                $scope.data.guests = result.guests;
                            }
                        });
                    }
                });
            };

            $scope.loadMoreGuests = function(numberGuest){
                var loadMoreHotelGuestsUrl = "/group_travel_control_dashboards/" + $scope.selected_event.id + "/" +  $scope.src_hotel.id + "/" + $scope.start_date + "/" + $scope.end_date + "/" + $scope.date_type + "/load-more-guests";
                $.post(loadMoreHotelGuestsUrl, {offset: $scope.data.guests.length, limit: numberGuest}, function(result) {
                    if(result.length > 0){
                        $scope.$apply(function(){
                            $.merge($scope.data.guests, result);
                        });
                    }
                });
            };


            $scope.selectGuest = function(guest){
                if(!guest.checked){
                    $scope.selected_guests.push(guest);
                    $scope.src_trip_date_id = guest.trip_date_id;
                    $scope.src_room_type_id = guest.room_type_id;
                }
                else{
                    $scope.selected_guests = $($scope.selected_guests).not([guest]).get();
                    if($scope.selected_guests.length == 0){
                        $scope.src_trip_date_id = null;
                        $scope.src_room_type_id = null;
                    }
                }

                if ($scope.selected_guests.length > 0){
                    $scope.minimum_price_apply = $scope.selected_guests.sort(function(a, b){ return a.total_price - b.total_price; })[0].total_price;
                }
            };

            $scope.moveGuests = function(){
                $scope.clearData();

                if(!$scope.is_cabo_spring_break_event){
                    $scope.getDestinationHotels();
                }
            };

            $scope.getDestinationHotels = function(){
                $scope.destination_hotel = null;
                $scope.destination_room_type = null;
                var get_destination_hotels_url = '/group_travel_control_dashboards/' + $scope.selected_event.id ;

                if($scope.is_cabo_spring_break_event){
                    get_destination_hotels_url += '/' + $scope.destination_trip_date.id;
                }

                get_destination_hotels_url += '/get-destination-hotels';

                var options = {src_product_id: $scope.src_hotel.id, src_trip_date_id: $scope.src_trip_date_id, src_room_type_id: $scope.src_room_type_id, number_of_guests: $scope.selected_guests.length};
                $.post(get_destination_hotels_url, options, function(result){
                    if(result.is_successful){
                        $scope.$apply(function(){
                            $scope.destination_hotels = result.hotels;
                        });
                    }else{
                        bootbox.alert(result.message);
                    }
                });
            };

            $scope.destinationHotelChange = function(){
                if($scope.destination_hotel.type != 'SharedLodging'){
                    $scope.additional_fee = $scope.destination_hotel.additional_fee;
                }
                $scope.destination_room_type = null;
            };

            $scope.confirmMovingGuests = function(){
                if(!$scope.disableConfirmMoveButton()) {
                    bootbox.hideAll();
                    $('#notify_to_user_modal').modal('show');
                }
            };

            $scope.submitMovingGuests = function(){
                var submit_moving_guests_url = '/group_travel_control_dashboards/' + $scope.selected_event.id + '/' + $scope.src_hotel.id + '/submit-moving-hotel' + '/' + $scope.destination_hotel.product_id;
                var options = {selected_guests: angular.toJson($scope.selected_guests),
                    trip_date_id: $scope.destination_trip_date.id,
                    room_type_id: $scope.destination_room_type ? $scope.destination_room_type.id : null,
                    move_guests_comment: $scope.move_guests_comment,
                    notify_to_user: $scope.notify_to_user,
                    additional_moving_fee: $scope.additional_fee};
                $.post(submit_moving_guests_url, options, function(result){
                    var msg = result.message;
                    if(result.refund_error != ''){
                        msg += '<div class="alert alert-error left">' + result.refund_error + '</div>'
                    }
                    bootbox.alert(msg);
                    if(result.is_successful){
                        $('#move_guests_modal').modal('hide');
                        $scope.changeHotelData($scope.hotel_index, true);
                    }
                });

                $('#notify_to_user_modal').modal('hide');
            };

            $scope.editAdditionalFee = function(){
                $scope.is_edit_additional_fee = true;
                $scope.show_input_additional_fee = true;
            };

            $scope.updateAdditionalFee = function(){
                $scope.is_edit_additional_fee = false;
                if ($scope.additional_fee == ''){
                    $scope.additional_fee = 0;
                }
            };

            $scope.getExchangedPrice = function(price, exchange_rate) {
                if(!price) return 0;
                if(!exchange_rate) return price;
                return price * exchange_rate;
            };

            $scope.cancelAdditionalFee = function(){
                $scope.additional_fee = $scope.destination_room_type == null ? $scope.destination_hotel.additional_fee : $scope.destination_room_type.additional_fee;
                $scope.is_edit_additional_fee = false;
                $scope.show_input_additional_fee = false;
            };

            $scope.disableConfirmMoveButton = function(){
                if ($scope.destination_hotel == null){
                    return true;
                }

                if ($scope.destination_hotel == 'SharedLodging' && $scope.destination_room_type == null){
                    return true;
                }

                if ($scope.is_edit_additional_fee){
                    return true;
                }

                 return ($scope.additional_fee < 0 && $scope.additional_fee < -$scope.minimum_price_apply);

            };
        }
    ]);
}).call(this);