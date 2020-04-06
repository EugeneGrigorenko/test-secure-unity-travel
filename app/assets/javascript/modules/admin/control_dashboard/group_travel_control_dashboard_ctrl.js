(function() {
    this.app.controller('GroupTravelControlDashboardCtrl', [
        "$scope",
        function($scope) {
            $scope.validate_message = '';
            $scope.get_product_url = '';
            $scope.selected_event = '';
            $scope.selected_function = '';
            $scope.selected_products = [];
            $scope.selected_from_date = '';
            $scope.selected_to_date = '';
            $scope.event_list = [];
            $scope.product_list = [];
            $scope.event_extra_settings = {
                nonSelectedText: 'Select event',
                includeSelectAllOption: false,
                filterPlaceholder: '...search event by name...'
            };
            $scope.product_extra_settings = {
                nonSelectedText: 'Select product',
                includeSelectAllOption: true,
                filterPlaceholder: '...search product by name...'
            };

            $scope.init = function(){};

            $scope.event_changed = function(){
                $scope.update_dates_ranges();
                $scope.load_products('');
                $scope.disabled_view_button();
            };

            $scope.update_dates_ranges = function(){
                if($scope.selected_event && $scope.selected_event != ''){
                    $scope.selected_from_date = $scope.selected_function == 'orders_and_payments' ? $scope.selected_event.first_order_date : $scope.selected_event.start_date;
                    $scope.selected_to_date = $scope.selected_event.end_date;
                    $("#from_date").datepicker("option", "minDate", $scope.selected_from_date);
                    $("#from_date").datepicker("option", "maxDate", $scope.selected_to_date);
                    $("#to_date").datepicker("option", "minDate", $scope.selected_from_date);
                    $("#to_date").datepicker("option", "maxDate", $scope.selected_to_date);
                }else{
                    $scope.selected_from_date = '';
                    $scope.selected_to_date = '';
                }
            };

            $scope.select_product_mode = function(){
                return $scope.function_list.filter(function(func) {return func.id === $scope.selected_function;})[0].select_product;
            };

            $scope.function_changed = function(){
                $scope.selected_products = [];
                var select_product_mode = $scope.select_product_mode();

                if(select_product_mode == 'none')
                    $("#select_product_control").multiselect("disable");
                else{
                    $("#select_product_control").multiselect("enable");
                    $("#select_product_control").prop('multiple', select_product_mode == 'multiple');
                    $("#select_product_control").multiselect('rebuild');
                }
                $scope.selected_date_type = 0;
                $scope.update_dates_ranges();
                $scope.load_products('');
                $scope.disabled_view_button();
            };

            $scope.load_products = function(selected_product_ids){
                if(!$scope.selected_event || $scope.selected_event == '' || $scope.selected_function == '')
                    return;

                if($scope.select_product_mode() == 'none') {
                    $scope.product_list = [];
                    return;
                }

                $.ajax({
                    type: "POST",
                    url: $scope.get_product_url,
                    data: {
                        'selected_event': $scope.selected_event.slug,
                        'selected_function': $scope.selected_function
                    },
                    success: function(result) {
                        $scope.$apply(function(){
                            $scope.product_list = result;
                            if(result.length){
                                if(selected_product_ids.length == 0){
                                    $scope.selected_products.push($scope.product_list[0].id);
                                }else{
                                    for(var i=0; i < selected_product_ids.length; i++){
                                        var pid = selected_product_ids[i];
                                        var temp = $.grep($scope.product_list, function(p){return p.id == pid});
                                        if(temp.length > 0){
                                            $scope.selected_products.push(pid);
                                        }
                                    }
                                }
                            }else{
                                $scope.selected_products = [];
                            }

                            if($scope.product_list.length > 0 && $scope.selected_products.length > 0){
                                var available_product_ids = $.map($scope.product_list, function(item, idx){return item.id});
                                $scope.selected_products = $.grep($scope.selected_products, function(item){return $.inArray(item, available_product_ids) >= 0;});
                            }

                            $scope.disabled_view_button();
                        });
                    }
                });
            };

            $scope.disabled_view_button = function(){
                if(!$scope.selected_event || $scope.selected_event == ''){
                    $scope.validate_message = 'Please select event';
                }else if($scope.selected_function == ''){
                    $scope.validate_message = 'Please select function';
                }else if(!$scope.selected_event.arrow_pass_integrated && $scope.selected_function == 'redeem_items'){
                    $scope.validate_message = 'This event is not support for dashboard';
                }else if($scope.select_product_mode() != 'none' && $scope.selected_products.length == 0){
                    $scope.validate_message = 'Please select ' + ($scope.selected_function == 'redeem_items' ? 'vendor' : 'product');
                }else if($scope.selected_from_date == '' || $scope.selected_to_date == ''){
                    $scope.validate_message = 'Please select date';
                }else{
                    $scope.validate_message = '';
                }
            };

            $scope.view_dashboard = function(){
                var url='/group_travel_control_dashboards/'
                    + $scope.selected_function
                    + '/' + $scope.selected_event.slug
                    + '/' + $scope.selected_products.toString()
                    + '/' + $scope.selected_from_date
                    + '/' + $scope.selected_to_date
                    + '/' + $scope.selected_date_type;

                wiselinks.load(url);
            };

            $scope.set_default_option = function(s_event, s_function, s_product_ids, s_from_date, s_to_date, s_date_type){
                for(var i = 0; i < $scope.event_list.length; i++){
                    if($scope.event_list[i].slug == s_event){
                        $scope.selected_event = $scope.event_list[i];
                        var min_date = s_function == 'orders_and_payments' ? $scope.selected_event.first_order_date : $scope.selected_event.start_date;
                        $("#from_date").datepicker("option", "minDate", min_date );
                        $("#from_date").datepicker("option", "maxDate", $scope.selected_event.end_date );
                        $("#to_date").datepicker("option", "minDate", min_date );
                        $("#to_date").datepicker("option", "maxDate", $scope.selected_event.end_date);
                        break;
                    }
                }
                $scope.selected_from_date = s_from_date;
                $scope.selected_to_date = s_to_date;

                if(s_function != ''){
                    if (s_function == 'rooming_list') s_function = 'rooming';

                    $scope.selected_function = s_function;
                    var select_product_mode = $scope.select_product_mode();
                    if(select_product_mode == 'none'){
                        $("#select_product_control").multiselect("disable");
                    }else{
                        $("#select_product_control").prop('multiple', select_product_mode == 'multiple');
                        $("#select_product_control").multiselect('rebuild');
                        $scope.load_products(JSON.parse(s_product_ids));
                    }

                    $scope.selected_date_type = (s_function == 'rooming' || s_function == 'hotels') ?  s_date_type : 0;
                }
            };

            $scope.$watch('selected_from_date', function() {
                $("#to_date").datepicker("option", "minDate", $scope.selected_from_date);
            });

            $scope.$watch('selected_to_date', function() {
                $("#from_date").datepicker("option", "maxDate", $scope.selected_to_date);
            });
        }
    ]);
}).call(this);