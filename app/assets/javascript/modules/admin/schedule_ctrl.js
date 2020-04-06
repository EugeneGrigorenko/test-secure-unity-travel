(function() {
        this.app.controller('ScheduleCtrl', [
                "$scope",'$timeout',
                function($scope, $timeout) {
                        $scope.schedule = {};
                        $scope.show_recipients = false;
                        $scope.filter = {};
                        $scope.selected_filter = {};
                        $scope.filtered_condition = {};
                        $scope.select_all = true;
                        $scope.recipients = [];
                        $scope.current_page = 1;
                        $scope.excluded_recipient_ids = [];
                        $scope.products = [];
                        $scope.schools = [];
                        $scope.selected_product_id = null;
                        $scope.filter_products = [];
                        $scope.allow_set_schedule = false;
                        $scope.product_types = {};
                        $scope.selected_event = {};
                        $scope.default_school_type = 'All Schools';
                        $scope.max_selected_recipients = 300;
                        $scope.always_update_before_send = false;
                        $scope.real_flight_tiers = [];
                        $scope.real_flight_tiers_by_event = {};
                        $scope.other_school_text = 'Other Schools';

                        $scope.init = new function(){};

                        $scope.expiration_date_setting = {
                                firstItem: 'name',
                                maxYear: (new Date()).getFullYear() + 5,
                                minYear: (new Date()).getFullYear()
                        };

                        $scope.resetData = function(){
                                $scope.filter_products = [];
                                $scope.filtered_condition = {};
                                $scope.recipients = [];
                                $scope.show_recipients = false;
                                $scope.excluded_recipient_ids = [];
                                $scope.show_schedule_form = false;
                                $scope.selected_event = {};
                                $scope.selected_filter = {
                                        school_type: $scope.filter.school_type[$scope.default_school_type],
                                        date_type: $scope.filter.date_type['General']
                                };
                                $scope.select_all = true;
                                $scope.always_update_before_send = false;
                                $('#checkbox_all').prop('checked', $scope.select_all);
                        };

                        $scope.selectReceiverType = function(value){
                                if($scope.selected_filter.receiver_type != value){
                                        $scope.resetData();
                                        $scope.selected_filter.receiver_type = value;
                                        if([$scope.filter.receiver_type.Buyers, $scope.filter.receiver_type.Reps, $scope.filter.receiver_type['Room Leaders']].indexOf(value) > -1){
                                                $scope.selected_filter.order_type = $scope.filter.order_type.Order;
                                                $scope.schedule.update_before_send = false;
                                                $timeout(function(){
                                                        $($("[ng-model='selected_filter.event']").next('.btn-group').find('input[type=radio]:first')).click();
                                                });
                                        }
                                        else{
                                                $scope.schedule.update_before_send = true;
                                        }
                                }
                        };

                        $scope.selectOrderType = function(value){
                                if($scope.selected_filter.order_type != value){
                                        var selected_filter = {
                                                receiver_type: $scope.selected_filter.receiver_type,
                                                order_type: value,
                                                event: $scope.selected_filter.event,
                                                school_type: $scope.selected_filter.school_type,
                                                school: $scope.selected_filter.school,
                                                date_type: $scope.selected_filter.date_type,
                                                order_status: $scope.selected_filter.order_status,
                                                gender: $scope.selected_filter.gender
                                        };
                                        $scope.resetData();
                                        $scope.selected_filter = selected_filter;
                                }
                        };

                        $scope.selectEvent = function(is_edit){
                                $scope.filter_products = [];

                                var event_id = $scope.selected_filter.event;

                                $scope.selected_event = jQuery.grep($scope.filter.event, function(ev) {
                                        return ev.id == event_id;
                                })[0];

                                var $txtcheckin = $('[ng-model="selected_filter.date.checkin_date"], [ng-model="selected_filter.date.checkout_date"]');

                                if(!is_edit && $scope.selected_filter.date){
                                        $scope.selected_filter.date.checkin_date = null;
                                        $scope.selected_filter.date.checkout_date = null;
                                }

                                if($scope.selected_event){
                                        $txtcheckin.datepicker("option", {
                                                minDate: $scope.selected_event.start_date,
                                                maxDate: $scope.selected_event.end_date
                                        });
                                }else{
                                        $txtcheckin.datepicker("option", "minDate", '');
                                        $txtcheckin.datepicker("option", "maxDate", '');
                                }

                                if(event_id != undefined && event_id.toString().length > 0){
                                        var url = '/events/' + event_id + '/get_products';
                                        var option = {};

                                        if($scope.selected_filter.receiver_type == $scope.filter.receiver_type.Reps){
                                                option.location = 1;
                                        }

                                        $.post(url, option, function (result) {
                                                $timeout(function(){
                                                        $scope.products = result;
                                                });
                                        });

                                        url = '/events/' + event_id + '/get_schools';
                                        $.post(url, option, function (result) {
                                                $timeout(function(){
                                                        $scope.schools = result;
                                                });
                                        });

                                        url = '/events/' + event_id + '/get_spec_to_real_flight_settings';
                                        $.get(url, option, function (result) {
                                                $timeout(function(){
                                                        $scope.real_flight_tiers_by_event = result;
                                                });
                                        });
                                }
                        };

                        $scope.selectSchool = function(){
                                var school = $scope.selected_filter.school;
                                if($scope.selected_filter.receiver_type == $scope.filter.receiver_type.Reps && school){
                                        var event_id = $scope.selected_filter.event;
                                        var option = {school: school, location: 1};
                                        url = '/events/' + event_id + '/get_organizations';
                                        $.post(url, option, function (result) {
                                                $timeout(function(){
                                                        $scope.organizations = result;
                                                        $($("[ng-model='selected_filter.organization']").next('.btn-group').find('input[type=radio]:first')).click();
                                                });
                                        });
                                }
                        };

                        $scope.filterAddedProduct = function(item){
                                var valid = true;
                                $.each($scope.filter_products, function (i, p) {
                                        if(p.id == item[0]) {
                                                valid = false;
                                                return false;
                                        }
                                });
                                return valid;
                        };

                        $scope.addProduct = function(){
                                var event_id = $scope.selected_filter['event'];
                                if(event_id != undefined && event_id.toString().length > 0){
                                        var url = '/schedules/get-product-data';
                                        var option = {event_id: event_id, product_id: $scope.selected_product_id};

                                        $.post(url, option, function (result) {
                                                $timeout(function(){
                                                        $scope.filter_products.push(result);
                                                        $scope.selected_product_id = null;
                                                });
                                        });
                                }
                        };

                        $scope.removeProduct = function(product){
                                $scope.filter_products.splice($scope.filter_products.indexOf(product), 1);
                        };

                        $scope.canGetRecipients = function(){
                                if($scope.filter.receiver_type == undefined)
                                        return false;

                                var valid = $scope.selected_filter['event'] != undefined && $scope.selected_filter['event'].toString().length > 0;
                                var not_check_event = [$scope.filter.receiver_type.Admins, $scope.filter.receiver_type['No Orders']].indexOf($scope.selected_filter.receiver_type) > -1;

                                return  not_check_event || (!not_check_event && valid);
                        };

                        $scope.selectOption = function(key, value){
                                var temp = $scope.selected_filter[key];
                                if(temp == null)
                                        temp = [];
                                if(temp.indexOf(value) < 0)
                                        temp.push(value);
                                else
                                        temp.splice(temp.indexOf(value),1);
                                $scope.selected_filter[key] = temp;
                        };

                        $scope.getRecipients = function(){
                                var filter_products = {};
                                $.each($scope.filter_products, function(i, p){
                                        var product = {id: p.id, name: p.name};
                                        if(p.type == $scope.product_types.LODGING){
                                                product.checkin = p.checkin;
                                                product.checkout = p.checkout;
                                        }
                                        if(p.type == $scope.product_types.SHAREDLODGING){
                                                product.checkin = p.checkin;
                                                product.checkout = p.checkout;
                                                product.room_type = p.room_type;
                                        }
                                        if(p.type == $scope.product_types.SHARED_HOTEL){
                                                product.checkin = p.checkin;
                                                product.checkout = p.checkout;
                                                product.room_type = $scope.selected_filter['room_status'] && $scope.selected_filter['room_status'].length > 0 ? p.room_type : null;
                                        }
                                        if([$scope.product_types.SHUTTLEBUS, $scope.product_types.CUSTOMACTIVITY].indexOf(p.type) > -1){
                                                product.date = p.date;
                                                product.time = p.time;
                                        }
                                        if(p.type == $scope.product_types.ADDON_WITH_VARIANT){
                                                product.variant = p.variant;
                                        }

                                        if(filter_products[p.type] == undefined){
                                                filter_products[p.type] = [];
                                        }
                                        filter_products[p.type].push(product);
                                });

                                $scope.selected_filter.product = filter_products;

                                $scope.current_page = 1;
                                var url = '/schedules/get-recipients';
                                var option = {
                                        selected_filter: angular.toJson($scope.selected_filter),
                                        excluded_recipient_ids: $scope.excluded_recipient_ids,
                                };
                                $.post(url, option, function (result) {
                                        $timeout(function(){
                                                $scope.show_recipients = true;
                                                $scope.filtered_condition = result.filtered_condition;
                                                $scope.recipients = result.recipients;
                                                $scope.excluded_recipient_ids = result.excluded_recipient_ids;
                                                $scope.select_all = $scope.excluded_recipient_ids.length == 0;
                                                $('#checkbox_all').prop('checked', $scope.select_all);
                                        });
                                });
                        };

                        $scope.loadMoreRecipients = function(){
                                $scope.current_page += 1;
                                var url = '/schedules/get-recipients';
                                var option = {selected_filter: angular.toJson($scope.selected_filter),
                                        excluded_recipient_ids: $scope.excluded_recipient_ids,
                                        page: $scope.current_page};

                                $.post(url, option, function (result) {
                                        $timeout(function(){
                                                $.merge($scope.recipients.data, result.recipients.data);
                                        });
                                });
                        };

                        $scope.selectAllRecipients = function(){
                                $scope.excluded_recipient_ids = [];
                                $.each($scope.recipients.data, function(i, r){
                                        r.selected = !$scope.select_all;
                                        if($scope.select_all)
                                                $scope.excluded_recipient_ids.push(r.id);
                                })
                        };

                        $scope.selectRecipient = function(recipient){
                                if(recipient.selected){
                                        $scope.excluded_recipient_ids.push(recipient.id);
                                }else{
                                        $scope.excluded_recipient_ids.splice($scope.excluded_recipient_ids.indexOf(recipient.id),1);
                                }

                                $scope.select_all = $scope.excluded_recipient_ids.length == 0;
                                $('#checkbox_all').prop('checked', $scope.select_all);
                        };

                        $scope.selectScheduleType = function(schedule_type){
                                $scope.show_schedule_form = true;
                                $scope.schedule.schedule_type = schedule_type;
                        };

                        $scope.validate = function(){
                                var invalid = $.trim($scope.schedule.name) == '' || $.trim($scope.schedule.subject) == '';


                                if(!invalid && $scope.schedule.schedule_type == 0){
                                        invalid = $.trim($scope.schedule.body_content) == '';
                                }

                                if(!invalid && $scope.allow_set_schedule){
                                        invalid = $.trim($scope.schedule.date) == '' || $.trim($scope.schedule.time) == '';
                                }

                                return !invalid;
                        };

                        $scope.cancelSetSchedule = function(){
                                $scope.allow_set_schedule = false;
                                $("[ng-model='schedule.date']").next('.combodate').find('select').val('');
                                $("[ng-model='schedule.time']").next('.combodate').find('select').val('')
                                $scope.schedule.date = null;
                                $scope.schedule.time = null;
                        };

                        $scope.cancelSchedule = function(){
                                bootbox.hideAll();
                                bootbox.confirm('Are you sure to cancel this schedule?', function(rs){
                                        if(rs == true){
                                                var url = '/schedules/' + $scope.schedule.id + '/cancel-schedule';
                                                $.post(url, {}, function(data){
                                                        if (data.success){
                                                                bootbox.alert('Schedule is reset');
                                                                $timeout(function(){
                                                                        $("[ng-model='schedule.date']").next('.combodate').find('select').val('');
                                                                        $("[ng-model='schedule.time']").next('.combodate').find('select').val('')
                                                                        $scope.schedule.date = null;
                                                                        $scope.schedule.time = null;
                                                                        $scope.schedule.scheduled_time = data.schedule.scheduled_time;
                                                                        $scope.allow_set_schedule = true;
                                                                });
                                                        }
                                                });
                                        }
                                });
                        };

                        $scope.updateSchedule = function(){
                                if($scope.validate()){
                                        if($scope.schedule.schedule_type == 1){
                                                $scope.schedule.body_content = '';
                                        }
                                        $scope.schedule.event_id = $scope.selected_filter.event;
                                        $scope.selected_filter.excluded_recipient_ids = $scope.excluded_recipient_ids;

                                        var option = {
                                                selected_filter: angular.toJson($scope.selected_filter),
                                                schedule: angular.toJson($scope.schedule)
                                        };

                                        $.post($scope.submit_url, option, function (result) {
                                                bootbox.alert(result.message);
                                                if(result.is_successful){
                                                        wiselinks.load($scope.redirect_url);
                                                }
                                        });
                                }
                        };

                        $scope.$watch('excluded_recipient_ids', function() {
                                $scope.updateAlwaysUpdateBeforeSend();
                        }, true);

                        $scope.$watch('recipients.total_recipients', function() {
                                $scope.updateAlwaysUpdateBeforeSend();
                        });

                        $scope.$watch('selected_filter.school', function() {
                                $scope.updateSpecToRealFlight();
                        }, true);

                        $scope.$watch('real_flight_tiers_by_event', function() {
                                $scope.updateSpecToRealFlight();
                        }, true);

                        $scope.updateAlwaysUpdateBeforeSend = function(){
                                var totalSelected = $scope.recipients.total_recipients - $scope.excluded_recipient_ids.length;
                                var always_update = totalSelected > $scope.max_selected_recipients;
                                $scope.always_update_before_send = always_update;
                                $scope.schedule.update_before_send = $scope.schedule.update_before_send || always_update;
                        };

                        $scope.updateSpecToRealFlight = function () {
                                $scope.real_flight_tiers = [];
                                if($scope.selected_filter.school && $scope.selected_filter.school.length == 1 && $scope.real_flight_tiers_by_event) {
                                        var tiers = $scope.real_flight_tiers_by_event[$scope.selected_filter.school[0]];
                                        if (!tiers || tiers.length == 0) {
                                                tiers = $scope.real_flight_tiers_by_event[$scope.other_school_text];
                                        }

                                        if (tiers && tiers.length > 0) {
                                                $scope.real_flight_tiers = tiers;
                                        }
                                }
                        };
                }
        ]);
}).call(this);
