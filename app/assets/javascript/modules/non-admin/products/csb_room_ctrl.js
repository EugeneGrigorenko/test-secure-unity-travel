(function () {
    this.app.controller('CsbRoomCtrl', [
        "$scope",
        function ($scope) {
            $scope.request_accept_list = [];
            $scope.room_data = {};
            $scope.inviting_list = [];
            $scope.search_list = [];
            $scope.room_types = [];
            $scope.selected_room_type = ''; //room_type; pax;
            $scope.search_user_url = '';
            $scope.submit_inviting_member_url = '';
            $scope.get_available_room_types_url = '';
            $scope.search = {search_string: ''};

            $scope.init = function () {};

            $scope.start_to_create_room_click = function () {
                $('#csb_room_step_0').modal('show');
            };

            $scope.checked_all_request_list = function(){
                for(var i=0; i< $scope.request_accept_list.length; i++){
                    if($scope.request_accept_list[i].checked == false)
                        return false;
                }
                return true;
            };

            $scope.become_room_leader_click = function () {
                $.ajax({
                    url: $scope.get_available_room_types_url,
                    data: {
                        order_number: $scope.room_data.order_number
                    },
                    type: 'POST',
                    async: false
                }).done(function (result) {
                    if (result) {
                        $scope.room_types = result;
                        $('#csb_room_step_0').modal('hide');
                        $('#csb_room_step_1').modal('show');
                    }
                });
            };

            $scope.select_room_type = function(option){
                $.ajax({
                    url: $scope.create_room_execute_url,
                    data: {
                        order_number: $scope.room_data.order_number,
                        product_id: $scope.room_data.product_id,
                        trip_date_id: $scope.room_data.trip_date_id,
                        room_type_id: option.room_type_id
                    },
                    type: 'POST',
                    async: false
                }).done(function (result) {
                    if (result.is_successful) {
                        $scope.inviting_list = [];
                        $scope.selected_room_type = option;
                        for(var i = 1; i < option.pax; i ++){
                            $scope.inviting_list.push({'order_number': '', 'buyer_name': ''});
                        }
                        $scope.start_timer($scope.room_data.inviting_duration, 0);
                        $('#csb_room_step_1').modal('hide');
                        $('#csb_room_step_2').modal('show');
                    }else{
                        $('.modal').modal('hide');
                        bootbox.alert(result.message);
                        wiselinks.load();
                    }
                });
            };

            $scope.time_is_up = function(){
                $('.modal').modal('hide');
                bootbox.alert("Time is up. Your room will be released in a moment. Click OK to refresh this page", function(){
                    wiselinks.load();
                });
            };

            $scope.search_roommates = function() {
                if($scope.search.search_string == '')
                    return;

                var exclude_list = [];
                exclude_list.push($scope.room_data.order_number);
                for (var i = 0; i < $scope.inviting_list.length; i++) {
                    if ($scope.inviting_list[i].order_number != '') {
                        exclude_list.push($scope.inviting_list[i].order_number);
                    }
                }
                $.ajax({
                    url: $scope.search_user_url,
                    data: {
                        product_id: $scope.room_data.product_id,
                        search_string: $scope.search.search_string,
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

            $scope.selectMemberFromSearchResults = function(member){
                for (var i = 0; i<= $scope.inviting_list.length; i++){
                    if($scope.inviting_list[i].order_number == ''){
                        $scope.inviting_list[i].order_number = member.order_number;
                        $scope.inviting_list[i].buyer_name = member.buyer_name;
                        $scope.search.search_string = '';
                        $('#csb_search_modal').modal('hide');
                        break;
                    }
                }
            };

            $scope.removeMember = function(index){
                if($('.bootbox .modal-body:visible').text().indexOf('Are you sure you want to remove this user from your room?') < 0){
                    bootbox.confirm("Are you sure you want to remove this user from your room?", function(confirmed){
                        if(confirmed) {
                            $scope.$apply(function(){
                                $scope.inviting_list.splice(index,1);
                                $scope.inviting_list.push({order_number: '', buyer_name: ''});
                            });
                        }
                    });
                }
            };

            $scope.isFullFillInvitingList = function(){
                if($scope.inviting_list.length){
                    for (var i = 0; i< $scope.inviting_list.length; i++){
                        if($scope.inviting_list[i].order_number == ''){
                            return false;
                        }
                    }
                }
                return true;
            };

            $scope.confirmInvitingMember = function(){
                $('#csb_room_step_2').modal('hide');
                $('#csb_room_step_3').modal('show');
            };

            $scope.submitInvitingMember = function(){
                $.ajax({
                    url: $scope.submit_inviting_member_url,
                    data: {
                        order_number: $scope.room_data.order_number,
                        inviting_list: angular.toJson($scope.inviting_list)
                    },
                    type: 'POST',
                    async: false
                }).done(function(result){
                    if(result.is_successful){
                        $('.ms_timer').countdown('stop');
                        $('.modal').modal('hide');
                        bootbox.alert(result.message);
                        wiselinks.load();
                    }else{
                        bootbox.alert(result.message);
                    }
                });
            };

            $scope.cancel_create_room = function(){
                $('#csb_room_step_0').modal('hide');
                $('#csb_room_step_1').modal('hide');
                for(var i=0; i< $scope.request_accept_list.length; i++){
                    $scope.request_accept_list[i].checked = $scope.request_accept_list_checked;
                }
            };

            $scope.goto_inviting_members_step = function(remaining_mins,remaining_secs){
                $scope.inviting_list = [];
                for(var i = 1; i < $scope.selected_room_type.pax; i ++){
                    $scope.inviting_list.push({'order_number': '', 'buyer_name': ''});
                }
                $scope.start_timer(remaining_mins, remaining_secs);
                $('#csb_room_step_2').modal('show');
            };

            $scope.start_timer = function(minutes, seconds){
                var now = new Date();
                $('.ms_timer').countdown(now.addMinutes(minutes, seconds), function (event) {
                    $(this).html(event.strftime($scope.room_data.inviting_duration > 3600 ? '%D days %H:%M:%S' : $scope.room_data.inviting_duration > 60 ? '%H:%M:%S' : '%M:%S'));
                }).on('finish.countdown', $scope.time_is_up);
            };

            Date.prototype.addMinutes = function(minutes, seconds) {
                var copiedDate = new Date(this.getTime());
                return new Date(copiedDate.getTime() + (minutes * 60 + seconds) * 1000);
            }
        }
    ]);
}).call(this);