(function () {
    this.app.controller('DashboardRoomingCtrl', [
        "$scope",
        function ($scope) {
            $scope.room_data = {};
            $scope.search_user_url = '';
            $scope.search_string = '';
            $scope.search_list = [];
            $scope.show_finalize_form = false;
            $scope.is_loading = false;
            $scope.show_additional_fee = false;
            $scope.selected_member = {};
            $scope.additional_fee = 0;

            $scope.init = new function(){};

            $scope.editRoom = function(room_id){
                $scope.room_data = {};
                $scope.search_string = '';
                $scope.search_list = [];
                $scope.show_finalize_form = false;
                $scope.is_loading = false;
                var edit_room_url = '/group_travel_control_dashboards/' + room_id + '/edit-room';
                $.ajax({
                    url: edit_room_url,
                    type: 'POST'
                }).done(function (result) {
                    if(result.is_successful){
                        $('#edit_csb_room_modal').modal('show');
                        $scope.$apply(function(){
                            $scope.room_data = result.room_data;
                        });
                    }else{
                        bootbox.alert(result.message);
                        wiselinks.load();
                    }
                });

            };

            $scope.isRoomFull = function(){
                if ($scope.room_data != undefined && !angular.equals({}, $scope.room_data)){
                    return $scope.room_data.room_pax == $scope.room_data.roommates.length;
                }
            };

            $scope.disableSearchForm = function(){
                var is_show = false;
                if ($scope.room_data != undefined && !angular.equals({}, $scope.room_data)){
                    is_show = $scope.room_data.is_finalized || $scope.room_data.room_pax == $scope.room_data.roommates.length;
                }
                if(is_show)
                    $scope.show_finalize_form = false;
                return is_show;
            };

            $scope.search_roommates = function(){
                $scope.show_additional_fee = false;
                $scope.additional_fee = 0;
                if($scope.search_string == '' || $scope.isRoomFull())
                    return;
                var exclude_list = [];
                for (var i = 0; i < $scope.room_data.roommates.length; i++) {
                    exclude_list.push($scope.room_data.roommates[i].order_number);
                }
                $.ajax({
                    url: $scope.search_user_url,
                    data: {
                        product_id: $scope.room_data.product_id,
                        room_type_id: $scope.room_data.room_type_id,
                        search_string: $scope.search_string,
                        event_slug: $scope.room_data.event_slug,
                        trip_date_id: $scope.room_data.trip_date_id,
                        exclude_list: JSON.stringify(exclude_list)
                    },
                    type: 'POST'
                }).done(function (result) {
                    if (result) {
                        $('#csb_search_modal').modal('show');
                        $scope.$apply(function () {
                            $scope.search_list = result;
                        });
                    }
                });
            };

            $scope.get_current_total_additional_fee = function () {
                var amount = 0;
                if ($scope.room_data != undefined && !angular.equals({}, $scope.room_data)){
                    $.each($scope.room_data.roommates, function(i, item){amount += parseFloat(Number(item.additional_fee))});
                }
                return amount;
            };

            $scope.addRoommate = function(member){
                $scope.selected_member = member;
                bootbox.hideAll();
                if($scope.room_data.is_finalized){
                    $scope.show_additional_fee = true;
                }else{
                    $scope.addRoommateExecute(0);
                }

            };

            $scope.addRoommateExecute = function(additional_fee){
                bootbox.confirm('Are you sure you want to add this user to this room?', function(confirmed){
                    if(confirmed) {
                        var add_roommate_url = '/group_travel_control_dashboards/' + $scope.room_data.room_id + '/add-roommate';
                        $.ajax({
                            url: add_roommate_url,
                            data: {
                                order_number: $scope.selected_member.order_number,
                                additional_fee: additional_fee
                            },
                            type: 'POST'
                        }).done(function(result){
                            $('#csb_search_modal').modal('hide');
                            bootbox.alert(result.message);
                            $scope.editRoom($scope.room_data.room_id);
                            $scope.is_loading = true;
                        });
                    }
                });
            };

            $scope.removeRoommate = function(order_id){
                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to remove this user to this room?', function(confirmed){
                    if(confirmed) {
                        var remove_roommate_url = '/group_travel_control_dashboards/' + $scope.room_data.room_id + '/remove-roommate';
                        $.ajax({
                            url: remove_roommate_url,
                            data: {
                                order_id: order_id
                            },
                            type: 'POST'
                        }).done(function(result){
                            bootbox.alert(result.message);
                            if(result.is_successful){
                                $scope.editRoom($scope.room_data.room_id);
                                $scope.is_loading = true;
                            }
                        });
                    }
                });
            };

            $scope.finalizeRoom = function(){
                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to finalize this room?', function (confirmed) {
                    if (confirmed) {
                        var finalize_room_url = '/group_travel_control_dashboards/' + $scope.room_data.room_id + '/finalize-room';
                        $.post(finalize_room_url, {additional_fee_data: angular.toJson($scope.room_data.roommates)}, function (result) {
                            if (result.is_successful) {
                                $('.modal').modal('hide');
                                wiselinks.load();
                            }
                            bootbox.alert(result.message);
                        });
                    }
                });
            };

            $scope.closeEditForm = function(){
                $('.modal').modal('hide');
                if ($scope.is_loading)
                    wiselinks.load();
            };

            $scope.updateRoomCommentHandler = function(newValue) {
                var update_room_comment_url = '/group_travel_control_dashboards/' + $scope.room_data.room_id + '/update-room-comment';
                $.post(update_room_comment_url, {room_comment: newValue}, function (result) {
                    if (result.is_successful) {
                        $scope.room_data.comment = newValue;
                        $scope.is_loading = true;
                    }
                    bootbox.alert(result.message);
                });
            };
        }
    ]);
}).call(this);