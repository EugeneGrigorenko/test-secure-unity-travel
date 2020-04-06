(function () {
    this.app.controller('CsbRoomParentCtrl', [
        "$scope",
        function ($scope) {
            $scope.room_data = {};
            $scope.search_user_url = '';
            $scope.resign_check_list = [
                {checked:false, content: 'Click "Resign" ONLY if you wish to cancel and forfeit this room.'},
                {checked:false, content: "You can only accept an invitation to join another room leader's room if you resign and disband your room."},
                {checked:false, content: 'Note that your roommates will have to get invited to a new room as well.'}
            ];
            $scope.search = {search_string: ''};

            $scope.init = new function(){};

            $scope.enableResignRoom = function(){
                return $.grep($scope.resign_check_list, function(x){ return x.checked == false}).length > 0;
            };

            $scope.search_roommates = function(){
                if($scope.search.search_string == '')
                    return;

                var exclude_list = [];
                exclude_list.push($scope.room_data.order_number);
                for (var i = 0; i < $scope.room_data.room_members.length; i++) {
                    exclude_list.push($scope.room_data.room_members[i].order_number);
                }
                $.ajax({
                    url: $scope.search_user_url,
                    data: {
                        product_id: $scope.room_data.product_id,
                        room_type_id: $scope.room_data.room_type_id,
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
                var inviting_list = [];
                inviting_list.push(member);
                $.ajax({
                    url: $scope.submit_inviting_member_url,
                    data: {
                        order_number: $scope.room_data.order_number,
                        inviting_list: angular.toJson(inviting_list)
                    },
                    type: 'POST'
                }).done(function(result){
                    if(result.is_successful){
                        $('.modal').modal('hide');
                        bootbox.alert(result.message);
                        wiselinks.load();
                    }else{
                        bootbox.alert(result.message);
                    }
                });
            };

            $scope.start_timer = function(minutes, seconds){
                if(minutes < 0){
                    $scope.time_is_up();
                }
                var now = new Date();
                $('.ms_timer').countdown(now.addMinutes(minutes, seconds), function (event) {
                    $(this).html(event.strftime(minutes > 1440 ? '%-D day%!D %H:%M:%S' : minutes > 60 ? '%H:%M:%S' : '%M:%S'));
                }).on('finish.countdown', $scope.time_is_up);
            };

            $scope.time_is_up = function(){
                $('.modal').modal('hide');
                bootbox.alert("Time is up. Your room will be released in a moment. Click OK to refresh this page", function(){
                    wiselinks.load();
                });
            };

            Date.prototype.addMinutes = function(minutes, seconds) {
                var copiedDate = new Date(this.getTime());
                return new Date(copiedDate.getTime() + (minutes * 60 + seconds) * 1000);
            }
        }
    ]);
}).call(this);