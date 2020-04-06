(function () {
    this.app.controller('DashboardFlightCtrl', [
        "$scope", "$timeout",
        function ($scope, $timeout) {
            $scope.selected_event = {};
            $scope.data = {};
            $scope.selected_src_flight = null;
            $scope.selected_passengers = [];
            $scope.search_string = '';
            $scope.search_list = [];
            $scope.destination_flight = null;
            $scope.additional_fee = 0;
            $scope.is_edit_additional_fee = false;
            $scope.show_input_additional_fee = false;
            $scope.minimum_price_apply = 0;
            $scope.report_type = 'flat_view';
            $scope.notify_to_user = false;

            $scope.init = new function(){};

            $scope.getSelectedPassengersOnProductPage = function(event){
                var selected_passengers = $.grep(event.passengers, function(x, i){return x.checked == true;});
                if (selected_passengers.length > 0){
                    $scope.minimum_price_apply = selected_passengers.sort(function(a, b){ return a.total_price - b.total_price; })[0].total_price;
                }

                return selected_passengers;
            };

            $scope.movePassengersOnProductPage = function(event){
                $scope.is_edit_additional_fee = false;
                $scope.search_string = '';
                $scope.selected_event = event;
                $scope.selected_src_flight = $scope.selected_src_flight_product_page;
                $scope.selected_passengers = $scope.getSelectedPassengersOnProductPage(event);
            };

            $scope.getExchangedPrice = function(price, exchange_rate) {
                if(!price) return 0;
                if(!exchange_rate) return price;
                return price * exchange_rate;
            }

            $scope.showPassengers = function(flight){
                flight.is_expanded = !flight.is_expanded;

                if (!flight.showed_passengers){
                    var get_passengers_url = '/group_travel_control_dashboards/' + $scope.selected_event.id + '/' + flight.product_id + '/get-passengers';
                    $.post(get_passengers_url, {}, function(result){
                        if(result.is_successful){
                            $scope.$apply(function(){
                                flight.showed_passengers = true;
                                flight.passengers = result.passengers;
                            });
                        }else{
                            bootbox.alert(result.message);
                        }
                    });
                }
            };

            $scope.getSelectedPassengers = function(flight){
                var selected_passengers = $.grep(flight.passengers, function(x, i){return x.checked == true;});
                if (selected_passengers.length > 0){
                    $scope.minimum_price_apply = selected_passengers.sort(function(a, b){ return a.total_price - b.total_price; })[0].total_price;
                }
                return selected_passengers;
            };

            $scope.movePassengers = function(flight){
                $scope.is_edit_additional_fee = false;
                $scope.show_input_additional_fee = false;
                $scope.additional_fee = 0;
                $scope.search_string = '';
                $scope.selected_src_flight = flight;
                $scope.selected_passengers = $scope.getSelectedPassengers(flight);
            };

            $scope.searchFlights = function(){
                if($scope.search_string == '')
                    return;
                var search_flights_url = '/group_travel_control_dashboards/' + $scope.selected_event.id + '/' + $scope.selected_src_flight.product_id + '/search-flight';

                $.post(search_flights_url, {search_string: $scope.search_string, number_of_passengers: $scope.selected_passengers.length}, function(result){
                    if(result.is_successful){
                        $scope.$apply(function(){
                            $scope.search_list = result.flights;
                            $('#csb_search_modal').modal('show');
                        });
                    }else{
                        bootbox.alert(result.message);
                    }
                });
            };

            $scope.selectDestinationFlight = function(des_flight){
                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to select this flight?', function (confirmed) {
                    if (confirmed) {
                        $scope.$apply(function() {
                            $scope.destination_flight = des_flight;
                            $scope.additional_fee = $scope.destination_flight.additional_fee;
                        });
                        $('#csb_search_modal').modal('hide');
                    }
                });
            };

            $scope.confirmMovingPassengers = function(){
                if(!$scope.disableConfirmMoveButton()) {
                    bootbox.hideAll();
                    $('#notify_to_user_modal').modal('show');
                }
            };

            $scope.submitMovingPassengers = function(){
                var submit_moving_passengers_url = '/group_travel_control_dashboards/' + $scope.selected_event.id + '/' + $scope.selected_src_flight.product_id + '/submit-moving-flight' + '/' + $scope.destination_flight.product_id;
                var options = {selected_passengers: angular.toJson($scope.selected_passengers),
                    notify_to_user: $scope.notify_to_user,
                    additional_moving_fee: $scope.additional_fee};
                $.post(submit_moving_passengers_url, options, function(result){
                    var msg = result.message;
                    if(result.refund_error != ''){
                        msg += '<div class="alert alert-error left">' + result.refund_error + '</div>'
                    }
                    bootbox.alert(msg);
                    if(result.is_successful){
                        $scope.closeMovePassengersForm();
                        wiselinks.load();
                    }
                });
                $('#notify_to_user_modal').modal('hide');
            };

            $scope.closeMovePassengersForm = function(){
                // clean data
                $timeout(function(){
                    $scope.selected_src_flight = null;
                    $scope.destination_flight = null;
                });
                // close modal
                $('#move_passengers_modal').modal('hide');
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

            $scope.cancelAdditionalFee = function(){
                $scope.additional_fee = $scope.destination_flight.additional_fee;
                $scope.is_edit_additional_fee = false;
                $scope.show_input_additional_fee = false;
            };

            $scope.disableConfirmMoveButton = function(){
                return $scope.destination_flight == null || ( $scope.destination_flight != null && $scope.is_edit_additional_fee) || ($scope.additional_fee < 0 && $scope.additional_fee < -$scope.minimum_price_apply);
            };

            $scope.showDownloadConfirm = function(){
                $('#confirmDownloadDlg').modal({
                    //backdrop: 'static',
                    keyboard: false
                });

            };

            $scope.download_report_click = function(){
                var download_url = $scope.download_url + '/' + $scope.report_type;
                $("#download_report_form").attr('action', download_url);
                $('.lockModal').show();
                $('#download_report_form').submit();
            };

            // functions for updating confirmation
            // parent_item = it is flight if we are staying flight control dashboard. It is event if we are staying on flight product dashboard level
            $scope.clearConfirmationData = function(parent_item) {
                parent_item.is_edit_mode = false;
                parent_item.original_selected_passengers = [];
                parent_item.selected_passengers = [];
                parent_item.can_send_email = false;
            };

             $scope.selectConfirmingPassenger = function(parent_item, passenger, $event){
                if(parent_item.selected_passengers == undefined)
                   parent_item.selected_passengers = [];
                if(parent_item.original_selected_passengers == undefined)
                   parent_item.original_selected_passengers = [];
                if(!passenger.checked){
                    parent_item.selected_passengers.push(passenger);
                    parent_item.original_selected_passengers.push(angular.copy(passenger));
                }
                else{
                    parent_item.selected_passengers = $(parent_item.selected_passengers).not([passenger]).get();
                    var original_items = $.grep(parent_item.original_selected_passengers, function(x){ return x.order_id == passenger.order_id});
                    parent_item.original_selected_passengers = $(parent_item.original_selected_passengers).not(original_items).get();
                }
                 if(parent_item.is_edit_mode){
                     parent_item.is_edit_mode = parent_item.selected_passengers.length > 0;
                 }

                 parent_item.is_selected_all_passengers = parent_item.passengers.length == parent_item.selected_passengers.length;
                 var checkbox_all = angular.element($event.target).parents('.sub-table').find('input:checkbox.checkbox_all');
                 $(checkbox_all).prop('checked', parent_item.is_selected_all_passengers);

                 $scope.canSendEmail(parent_item);
            };

            $scope.clearSelectedPassengers = function(parent_item, is_cancel){
                $.each(parent_item.passengers, function(i,p){
                    p.checked = false;
                    if(is_cancel && parent_item.original_selected_passengers != undefined){
                        $.each(parent_item.original_selected_passengers, function(j, o) {
                            if(p.order_id == o.order_id){
                                p.confirmation_number = o.confirmation_number;
                            }
                        });
                    }
                });
                parent_item.is_selected_all_passengers = false;
                var item_id = parent_item.product_id ? parent_item.product_id : parent_item.id;
                $('#checkbox_all_' + item_id).prop('checked', parent_item.is_selected_all_passengers);
                parent_item.original_selected_passengers = [];
                parent_item.selected_passengers = [];
            };

            $scope.canSendEmail = function (parent_item) {
                parent_item.can_send_email = !parent_item.is_edit_mode && parent_item.selected_passengers.length > 0 && $.grep(parent_item.selected_passengers, function(x){ return x.confirmation_number }).length == parent_item.selected_passengers.length;
            };

            $scope.editConfirmation = function(parent_item){
                parent_item.is_edit_mode = true;
                $scope.canSendEmail(parent_item);
            }

            $scope.saveConfirmation = function(parent_item){
                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to change confirmation number for the selected passenger(s)?', function (confirmed) {
                    if (confirmed) {
                        var submit_save_confirmation_url = '/group_travel_control_dashboards/update-flight-confirmation';
                        var options = {selected_orders: angular.toJson(parent_item.selected_passengers)};
                        $.post(submit_save_confirmation_url, options, function(result){
                            bootbox.alert(result.message);
                            if(result.is_successful){
                                $scope.$apply(function() {
                                    parent_item.is_edit_mode = false;
                                });
                            }
                        });
                    }
                });
            }

            $scope.cancelConfirmation = function(parent_item){
                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to revert your changes for the selected passenger(s)?', function (confirmed) {
                    if (confirmed) {
                        $scope.$apply(function(){
                            parent_item.is_edit_mode = false;
                            $scope.clearSelectedPassengers(parent_item, true);
                        });
                    }
                });
            }

            $scope.SendEmailConfirmation = function(parent_item){
                bootbox.hideAll();
                bootbox.confirm('Are you sure you want to send confirmation email to the selected room(s)?', function (confirmed) {
                    if (confirmed) {
                        var submit_send_email_confirmation_url = '/group_travel_control_dashboards/send-flight-confirmation';
                        var options = {selected_orders: angular.toJson(parent_item.selected_passengers)};
                        $.post(submit_send_email_confirmation_url, options, function(result){
                            bootbox.alert(result.message);
                            if(result.is_successful){
                                $scope.$apply(function() {
                                    $scope.clearSelectedPassengers(parent_item, false);
                                });
                            }
                        });
                    }
                });
            }

            $scope.focusNextElementByKeyEnter = function(parent_section_class, $event){
                if($event.keyCode == 13 || $event.which == 13){
                    var ele = angular.element($event.target);
                    var currentTabIndex = parseInt($(ele).attr('tabindex'));
                    var all_inputs = $(ele).parents(parent_section_class).find('input:visible');
                    $.each(all_inputs, function(i, item){
                        if(parseInt($(item).attr('tabindex')) > currentTabIndex) {
                            $(item).focus();
                            return false;
                        }
                    });
                }
            };

            $scope.selectAllPassengers = function(parent_item){
                parent_item.selected_passengers = [];
                if(parent_item.original_selected_passengers == undefined)
                    parent_item.original_selected_passengers = [];
                $.each(parent_item.passengers, function(i, p){
                    p.checked = !parent_item.is_selected_all_passengers;
                    if(p.checked){
                        parent_item.selected_passengers.push(p);
                        parent_item.original_selected_passengers.push(angular.copy(p));
                    }else{
                        var temp = $.grep(parent_item.original_selected_passengers, function(x){return x.order_id == p.order_id;});
                        if(temp.length > 0) {
                            p.confirmation_number = temp[0].confirmation_number;
                        }
                    }
                });

                if(parent_item.is_selected_all_passengers) {
                    parent_item.is_edit_mode = false;
                    parent_item.original_selected_passengers = [];
                }
                $scope.canSendEmail(parent_item);
            };
        }
    ]);
}).call(this);