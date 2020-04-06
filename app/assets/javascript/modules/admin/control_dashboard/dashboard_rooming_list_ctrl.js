(function () {
    this.app.controller('DashboardRoomingListCtrl', [
        "$scope",
        function ($scope) {
            $scope.is_edit_mode = false;
            $scope.rooming_list = [];
            $scope.original_selected_rooms = [];
            $scope.selected_rooms = [];
            $scope.can_send_email = false;
            $scope.room_statuses = [];
            $scope.selected_room_statuses = [];
            $scope.is_selected_all_rooms = false;

            $scope.clearData = function() {
                $scope.is_edit_mode = false;
                $scope.original_selected_rooms = [];
                $scope.selected_rooms = [];
                $scope.can_send_email = false;
                $scope.is_selected_all_rooms = false;
            };

            $scope.clearSelectedRooms = function(is_cancel){
                $.each($scope.rooming_list, function(i,r){
                    r.checked = false;
                    if(is_cancel){
                        $.each($scope.original_selected_rooms, function(j, o) {
                            if(r.room_id == o.room_id){
                                r.room_number = o.room_number;
                                r.confirmation_number = o.confirmation_number;
                                r.confirmation_note = o.confirmation_note;
                            }
                        });
                    }
                });
                $scope.is_selected_all_rooms = false;
                $("#checkbox_all").prop('checked', $scope.is_selected_all_rooms);
                $scope.original_selected_rooms = [];
                $scope.selected_rooms = [];
            };

            $scope.selectRoom = function(room){
                if(!room.checked){
                    $scope.selected_rooms.push(room);
                    $scope.original_selected_rooms.push(angular.copy(room));
                }
                else{
                    $scope.selected_rooms = $($scope.selected_rooms).not([room]).get();
                    var original_items = $.grep($scope.original_selected_rooms, function(x){ return x.room_id == room.room_id});
                    $scope.original_selected_rooms = $($scope.original_selected_rooms).not(original_items).get();
                }
                if($scope.is_edit_mode){
                    $scope.is_edit_mode = $scope.selected_rooms.length > 0;
                }

                var finalized_rooms = $.grep($scope.rooming_list, function(x){return x.can_select});
                $scope.is_selected_all_rooms = finalized_rooms.length == $scope.selected_rooms.length;
                $("#checkbox_all").prop('checked', $scope.is_selected_all_rooms);
                $scope.canSendEmail();
            };

            $scope.canSendEmail = function () {
                $scope.can_send_email = !$scope.is_edit_mode && $scope.selected_rooms.length > 0 && $.grep($scope.selected_rooms, function(x){ return x.room_number || x.confirmation_number || x.confirmation_note}).length == $scope.selected_rooms.length;
            };

            $scope.selectAllRoomStatus = function(val){
                $scope.selected_room_statuses = [];
                if(val){
                    $scope.selected_room_statuses.push('all');
                }
                $.each($scope.room_statuses, function(i, x){
                    x.checked = false;
                    if(!val && x.key == 'Finalized'){
                        $scope.selected_room_statuses.push(x.value);
                        x.checked = true;
                    }
                });
                var reload_data_url = $scope.get_rooming_list_data_url + "?room_status=" + $scope.selected_room_statuses.toString();
                window.location = reload_data_url;
            };

            $scope.selectRoomStatus = function(item){
                $scope.selected_room_statuses = $($scope.selected_room_statuses).not(['all']).get();
                $.each($scope.room_statuses, function(i, x){
                    x.value = x.value.toString();
                    $scope.selected_room_statuses = $($scope.selected_room_statuses).not([x.value]).get();
                    if(x.checked){
                        $scope.selected_room_statuses.push(x.value);
                    }
                });
                var reload_data_url = $scope.get_rooming_list_data_url + "?room_status=" + $scope.selected_room_statuses.toString();
                window.location = reload_data_url;
            };

            $scope.editConfirmation = function(){
                $scope.is_edit_mode = true;
                $scope.canSendEmail();
            }

            $scope.saveConfirmation = function(){
                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to change room information for the selected room(s)?', function (confirmed) {
                    if (confirmed) {
                        var submit_save_confirmation_url = '/group_travel_control_dashboards/update-rooming-list-confirmation';
                        var options = {selected_rooms: angular.toJson($scope.selected_rooms)};
                        $.post(submit_save_confirmation_url, options, function(result){
                            var msg = result.message;
                            if(result.ignored_error != ''){
                                msg += '<div class="alert alert-error left">' + result.ignored_error + '</div>'
                            }
                            bootbox.alert(msg);
                            if(result.is_successful){
                                $scope.$apply(function() {
                                    $scope.is_edit_mode = false;
                                    wiselinks.load();
                                });
                            }
                        });
                    }
                });
            }

            $scope.cancelConfirmation = function(){
                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to revert your changes for the selected room(s)?', function (confirmed) {
                    if (confirmed) {
                        $scope.$apply(function(){
                            $scope.is_edit_mode = false;
                            $scope.clearSelectedRooms(true);
                        });
                    }
                });
            }

            $scope.SendEmailConfirmation = function(){
                bootbox.hideAll();
                var email_count = 0;
                $.each($scope.selected_rooms, function(i, r){email_count += r.room_members.length + 1;});
                var msg = email_count > 1 ? ' emails' : ' email';
                msg = "You are sending " + email_count + msg + ". The Confirmation #, Room # and Public Notes will be sent to the customer. Are you sure?";
                bootbox.confirm(msg, function (confirmed) {
                    if (confirmed) {
                        var submit_send_email_confirmation_url = '/group_travel_control_dashboards/send-rooming-list-confirmation';
                        var options = {selected_rooms: angular.toJson($scope.selected_rooms)};
                        $.post(submit_send_email_confirmation_url, options, function(result){
                            var msg = result.message;
                            if(result.ignored_error != ''){
                                msg += '<div class="alert alert-error left">' + result.ignored_error + '</div>'
                            }
                            bootbox.alert(msg);
                            if(result.is_successful){
                                $scope.$apply(function() {
                                    $scope.clearSelectedRooms(false);
                                });
                            }
                        });
                    }
                });
            }

            $scope.focusNextElementByKeyEnter = function($event){
                if($event.keyCode == 13 || $event.which == 13){
                    var $this = $(angular.element($event.target));
                    var $td = $this.closest('td'); // Current TD
                    var $row = $td.closest('tr'); // Current TR
                    var $rows = $row.parents('table').find('tr');//.has('.focus:visible'); // Current TABLE or TBODY - parent of all rows
                    var column_index = $td.index(); // Current column of TD
                    var row_index = $row.index() + 1;
                    while(row_index < $rows.length){
                        row_index += 1;
                        var $input = $rows.eq(row_index).children().eq(column_index).find('.focus');
                        if($input.length > 0 && $input.is(':visible')){
                            $input.focus();
                            break;
                        }
                        if(row_index == $rows.length){
                            column_index += 1;
                            $rows.find('.focus:visible').first().parents('tr').children().eq(column_index).find('.focus').focus();
                            break;
                        }
                    }
                }
            };

            $scope.selectAllRooms = function(){
                $scope.selected_rooms = [];
                var finalized_rooms = $.grep($scope.rooming_list, function(x){return x.can_select;});
                $.each(finalized_rooms, function(i, room){
                    room.checked = !$scope.is_selected_all_rooms;
                    if(room.checked){
                        $scope.selected_rooms.push(room);
                        $scope.original_selected_rooms.push(angular.copy(room));
                    }else{
                        var temp = $.grep($scope.original_selected_rooms, function(x){return x.room_id == room.room_id;});
                        if(temp.length > 0) {
                            var o = temp[0];
                            room.room_number = o.room_number;
                            room.confirmation_number = o.confirmation_number;
                            room.confirmation_note = o.confirmation_note;
                        }
                    }
                });
                if($scope.is_selected_all_rooms) {
                    $scope.is_edit_mode = false;
                    $scope.original_selected_rooms = [];
                }
                $scope.canSendEmail();
            };
        }
    ]);
}).call(this);