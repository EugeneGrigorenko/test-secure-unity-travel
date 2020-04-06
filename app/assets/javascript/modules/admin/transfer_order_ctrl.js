(function() {
    this.app.controller('TransferOrderCtrl', [
        "$scope",
        function($scope) {
            $scope.init = new function(){};
            $scope.search_user_url = '';
            $scope.search_order_url = '';
            $scope.submit_url = '';
            $scope.event_id = '';
            $scope.search_user_result = [];
            $scope.search_order_result = [];
            $scope.transfer_from = null;
            $scope.transfer_to = null;

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
            $scope.addon_with_variant_order_items = [];
            
            $scope.transfer_items = [];
            $scope.transfer_rooms = [];
            $scope.transfer_fee = {};
            $scope.transfer_all = false;
            $scope.change_transfer_user = function(){
                $scope.transfer_to = null;
            };
            $scope.number_transfer_change = function(item){
                if (item.transfer > item.qty){
                    item.transfer = item.qty;
                }
            };
            $scope.search_user = function(search_string){
                if (search_string && search_string.trim() != ''){
                    $.ajax({
                        type: 'POST',
                        data: {id: $scope.transfer_from.id, search_string: search_string},
                        url: $scope.search_user_url,
                        dataType: 'json',
                        success: function (result) {
                            $scope.$apply(function(){
                                $scope.search_user_result = result;
                            });
                            $('#search-transfer-user-modal').modal('show');
                        }
                    });
                }
            };
            $scope.select_transfer_user = function(user){
                $scope.transfer_to = {'id': user.id,
                                      'name': user.name,
                                      'img': user.image,
                                      'apply_fee': false,
                                      'additional_fee': 0,
                                      'order_id': '',
                                      'order_number': '',
                                      'currency': $scope.transfer_from.currency};
                $('#search-transfer-user-modal').modal('hide');
                $.ajax({
                    type: 'POST',
                    data: {id: user.id, event_id: $scope.event_id},
                    url: $scope.search_order_url,
                    dataType: 'json',
                    success: function (result) {
                        $scope.$apply(function () {
                            if (result && result.length) {
                                if (result.length == 1) {
                                    $scope.transfer_to.order_id = result[0].id;
                                    $scope.transfer_to.order_number = result[0].number;
                                    $scope.transfer_to.currency = result[0].currency;
                                } else {
                                    $scope.search_order_result = result;
                                    $('#search-transfer-order-modal').modal('show');
                                }
                            }
                        });
                    }
                });
            };
            $scope.select_transfer_order = function(order){
                $scope.transfer_to.order_id = order.id;
                $scope.transfer_to.order_number = order.number;
                $scope.transfer_to.currency = order.currency;
                $('#search-transfer-order-modal').modal('hide');
            };
            $scope.decrease_transfer_number = function(item){
                if(item.transfer > 0){
                    item.transfer -= 1;
                }
            };
            $scope.increase_transfer_number = function(item){
                if(item.quantity > item.transfer){
                    item.transfer += 1;
                }
            };
            $scope.submit = function(){
                if($scope.transfer_validate()){
                    $.ajax({
                        type: 'POST',
                        data: {transfer_from: $scope.transfer_from,
                               transfer_to: $scope.transfer_to,
                               transfer_all: $scope.transfer_all,
                               transfer_items: JSON.stringify($scope.transfer_items),
                               transfer_rooms: JSON.stringify($scope.transfer_rooms)},
                        url: $scope.submit_url,
                        dataType: 'json',
                        success: function (result) {
                            if(result.is_successful){
                                window.location = '/orders/' + $scope.transfer_from.order_number;
                            }else{
                                bootbox.alert(result.error);
                            }
                        }
                    });
                }
            };
            $scope.$watch("transfer_all", function(){
                if($scope.transfer_from){
                    if($scope.transfer_all == true){
                        $scope.transfer_from.apply_fee = false;
                        $scope.transfer_from.additional_fee = 0;
                        set_max_transfer($scope.flight_order_items);
                        set_max_transfer($scope.shared_lodging_order_items);
                        set_max_transfer($scope.shared_hotel_order_items);
                        set_max_transfer($scope.travel_package_order_items);
                        set_max_transfer($scope.club_access_order_items);
                        set_max_transfer($scope.bus_without_time_order_items);
                        set_max_transfer($scope.addon_order_items);
                        set_max_transfer($scope.shuttle_bus_order_items);
                        set_max_transfer($scope.custom_activity_order_items);
                        set_max_transfer($scope.addon_with_variant_order_items);
                        set_max_transfer_room($scope.lodging_rooms);
                    }else{
                        set_zero_transfer($scope.flight_order_items);
                        set_zero_transfer($scope.shared_lodging_order_items);
                        set_zero_transfer($scope.shared_hotel_order_items);
                        set_zero_transfer($scope.travel_package_order_items);
                        set_zero_transfer($scope.club_access_order_items);
                        set_zero_transfer($scope.bus_without_time_order_items);
                        set_zero_transfer($scope.addon_order_items);
                        set_zero_transfer($scope.shuttle_bus_order_items);
                        set_zero_transfer($scope.custom_activity_order_items);
                        set_zero_transfer($scope.addon_with_variant_order_items);
                        set_zero_transfer_room($scope.lodging_rooms);
                    }
                }
            });
            function set_zero_transfer_room(array){
                for(var i = 0; i< array.length; i++){
                    array[i].is_removed = false;
                }
            }
            function set_max_transfer_room(array){
                for(var i = 0; i< array.length; i++){
                    array[i].is_removed = true;
                }
            }
            function set_zero_transfer(array){
                for(var i = 0; i< array.length; i++){
                    array[i].transfer = 0;
                }
            }
            function set_max_transfer(array){
                for(var i = 0; i< array.length; i++){
                    array[i].transfer = array[i].quantity;
                }
            }
            function add_changed_item(array){
                for(var i = 0; i< array.length; i++){
                    if(array[i].transfer != 0){
                        $scope.transfer_items.push({'id': array[i].order_item_id,
                                                    'transfer': array[i].transfer})
                    }
                }
            }
            function add_changed_room(array){
                for(var i = 0; i< array.length; i++){
                    if(array[i].is_removed == true){
                        $scope.transfer_rooms.push(array[i].id);
                    }
                }
            }
            function add_changed_item_for_all_item(){
                $scope.transfer_items = [];
                $scope.transfer_rooms = [];
                add_changed_item($scope.flight_order_items);
                add_changed_item($scope.shared_lodging_order_items);
                add_changed_item($scope.shared_hotel_order_items);
                add_changed_item($scope.travel_package_order_items);
                add_changed_item($scope.club_access_order_items);
                add_changed_item($scope.bus_without_time_order_items);
                add_changed_item($scope.addon_order_items);
                add_changed_item($scope.shuttle_bus_order_items);
                add_changed_item($scope.custom_activity_order_items);
                add_changed_item($scope.addon_with_variant_order_items);
                add_changed_room($scope.lodging_rooms);
            }
            function is_transfer_all_for_item(array){
                for(var i = 0; i< array.length; i++){
                    if(array[i].transfer != array[i].quantity){
                        $scope.transfer_all = false;
                        return false;
                    }
                }
                return true;
            }
            function is_transfer_all_for_room(array){
                for(var i = 0; i< array.length; i++){
                    if($scope.lodging_rooms[i].is_removed == false){
                        $scope.transfer_all = false;
                        return false;
                    }
                }
                return true;
            }
            function check_transfer_all(){
                if(!is_transfer_all_for_item($scope.flight_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.shared_lodging_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.shared_hotel_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.travel_package_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.club_access_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.bus_without_time_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.addon_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.shuttle_bus_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.custom_activity_order_items)){
                    return
                }
                if(!is_transfer_all_for_item($scope.addon_with_variant_order_items)){
                    return
                }
                if(!is_transfer_all_for_room($scope.lodging_rooms)){
                    return
                }
                $scope.transfer_all = true;
            }
            $scope.$watch("lodging_rooms", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("flight_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("shared_lodging_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("shared_hotel_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("travel_package_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("club_access_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("bus_without_time_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("addon_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("shuttle_bus_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("custom_activity_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.$watch("addon_with_variant_order_items", function(){
                add_changed_item_for_all_item();
                check_transfer_all();
            }, true);
            $scope.transfer_validate = function(){
                if ($scope.transfer_from && $scope.transfer_from.apply_fee){
                    if ($scope.transfer_from.additional_fee == null){
                        return false;
                    }
                    if ($scope.transfer_from.additional_fee != 0 && $scope.transfer_from.additional_fee <= $scope.MINIMUM_PAYMENT_AMOUNT) {
                        return false;
                    }
                }
                if (!$scope.transfer_to){
                    return false;
                }
                if($scope.transfer_to && $scope.transfer_to.apply_fee){
                    if ($scope.transfer_to.additional_fee == null){
                        return false;
                    }
                    if ($scope.transfer_to.additional_fee != 0 && $scope.transfer_to.additional_fee <= $scope.MINIMUM_PAYMENT_AMOUNT) {
                        return false;
                    }
                }
                if ($scope.transfer_to && $scope.transfer_all == false && !$scope.transfer_items.length && !$scope.transfer_rooms.length){
                    return false;
                }
                return true;
            };
        }
    ]);
}).call(this);