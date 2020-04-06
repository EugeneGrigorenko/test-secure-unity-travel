(function () {
    this.app.controller('DashboardOrderCtrl', [
        "$scope",
        function ($scope) {
            $scope.data = {};
            $scope.to_date = '';
            $scope.to_date = '';
            $scope.advanced_search = false;
            $scope.search_object_value = [];
            $scope.search_object_search_string_value = [];
            $scope.search_status_value = [];
            $scope.search_date_value = [];

            $scope.search_object_to_text = '';
            $scope.search_status_to_text = '';
            $scope.search_date_to_text = '';

            $scope.search_all_object = true;
            $scope.search_all_status = true;
            $scope.search_all_date = true;

            $scope.object_text = {'addon': 'Add-on', 'airline': 'Airline', 'email': 'Email', 'hotel': 'Hotel',
                                  'name': 'First / Last Name', 'order_number': 'Order Number', 'organization': 'Organization',
                                  'record_locator': 'Record Locator', 'school': 'School'};
            $scope.order_status_text = {'active': 'Active', 'cancelled': 'Cancelled', 'refunded': 'Refunded'};
            $scope.date_type_text = {'checkin': 'Check-in Date', 'checkout': 'Checkout Date', 'order': 'Order Date', 'deposit': 'Deposited Date'};

            $scope.search_object = {'addon': true, 'airline': true, 'email': true, 'hotel': true,
                                    'name': true, 'order_number': true, 'organization': true,
                                    'record_locator': true, 'school': true};
            $scope.search_object_search_string = {'addon': '', 'airline': '', 'email': '', 'hotel': '',
                                                  'name': '', 'order_number': '', 'organization': '',
                                                  'record_locator': '', 'school': ''};
            $scope.order_status = {'active': true, 'cancelled': true, 'refunded': true};
            $scope.date_type = {'checkin': true, 'checkout': true, 'order': true, 'deposit': true};

            $scope.event_id = '';
            $scope.search_string = '';
            $scope.searchOrderUrl = '';
            $scope.selected_orders = [];
            $scope.show_submit_result = false;
            $scope.submited_orders = [];
            $scope.reasons_of_refund = {};

            $scope.can_increase = false;
            $scope.can_decrease = false;
            $scope.can_adjust = false;
            $scope.can_cancel = false;
            $scope.can_refund = false;

            $scope.init = function(){};

            $scope.params = function(limit){
                return {
                    'event_id': $scope.event_id,
                    'from_date': $scope.from_date,
                    'to_date': $scope.to_date,
                    'search_params': {
                        'search_string': $scope.search_string,
                        'search_object': JSON.stringify($scope.search_object_value),
                        'search_object_search_string': JSON.stringify($scope.search_object_search_string_value),
                        'order_status' : JSON.stringify($scope.search_status_value),
                        'date_type_search' : JSON.stringify($scope.search_date_value)},
                    'offset': $scope.data.orders.length,
                    'limit' : limit
                }
            };

            $scope.searchOrder = function(){
                $scope.selected_orders = [];
                $scope.data.orders = [];
                $.ajax({
                    type: "POST",
                    url: $scope.searchOrderUrl,
                    data: $scope.params(25),
                    success: function(result){
                        $scope.$apply(function(){
                            $scope.data = result;
                        });
                    }
                });
            };

            $scope.loadMoreOrders = function(limit){
                $.ajax({
                    type: "POST",
                    url: $scope.searchOrderUrl,
                    data: $scope.params(limit),
                    success: function(result){
                        if(result.total_orders > 0){
                            $scope.$apply(function(){
                                $.merge($scope.data.orders, result.orders);
                                $scope.data.projected_revenue = parseFloat($scope.data.projected_revenue) + parseFloat(result.projected_revenue);
                                $scope.data.projected_profit = parseFloat($scope.data.projected_profit) + parseFloat(result.projected_profit);
                                $scope.data.total_revenue_collected = parseFloat($scope.data.total_revenue_collected) + parseFloat(result.total_revenue_collected);
                                $scope.data.total_profit_collected = parseFloat($scope.data.total_profit_collected) + parseFloat(result.total_profit_collected);
                            });
                        }
                    }
                });
            };

            $scope.$watch('from_date', function() {
                $("#toDate").datepicker("option", "minDate", $scope.from_date);
            });

            $scope.$watch('to_date', function() {
                $("#fromDate").datepicker("option", "maxDate", $scope.to_date);
            });

            $scope.$watch('search_object', function() {
                $scope.search_object_to_text = '';
                $scope.search_object_value = [];
                $scope.search_object_search_string_value = [];
                for (var key in $scope.search_object) {
                    if($scope.search_object[key] == true && $scope.search_object_search_string[key] != ''){
                        $scope.search_object_value.push(key);
                        $scope.search_object_to_text += $scope.object_text[key] + ', ';
                    }
                }
                for (var key in $scope.search_object_search_string) {
                    if($scope.search_object[key] == true && $scope.search_object_search_string[key] != ''){
                        $scope.search_object_search_string_value.push($scope.search_object_search_string[key]);
                    }
                }
                $scope.search_object_to_text = $scope.search_object_to_text.substring(0, $scope.search_object_to_text.lastIndexOf(', '));
                $scope.search_all_object = get_check_all_value($scope.search_object);
            }, true);

            $scope.$watch('search_object_search_string', function() {
                $scope.search_object_to_text = '';
                $scope.search_object_value = [];
                $scope.search_object_search_string_value = [];
                for (var key in $scope.search_object) {
                    if($scope.search_object[key] == true && $scope.search_object_search_string[key] != ''){
                        $scope.search_object_value.push(key);
                        $scope.search_object_to_text += $scope.object_text[key] + ', ';
                    }
                }
                for (var key in $scope.search_object_search_string) {
                    if($scope.search_object[key] == true && $scope.search_object_search_string[key] != ''){
                        $scope.search_object_search_string_value.push($scope.search_object_search_string[key]);
                    }
                }
                $scope.search_object_to_text = $scope.search_object_to_text.substring(0, $scope.search_object_to_text.lastIndexOf(', '));
                $scope.search_all_object = get_check_all_value($scope.search_object);
            }, true);

            $scope.$watch('order_status', function() {
                $scope.search_status_to_text = '';
                $scope.search_status_value = [];
                for (var key in $scope.order_status) {
                    if($scope.order_status[key] == true){
                        $scope.search_status_value.push(key);
                        $scope.search_status_to_text += $scope.order_status_text[key] + ', ';
                    }
                }
                $scope.search_status_to_text = $scope.search_status_to_text.substring(0, $scope.search_status_to_text.lastIndexOf(', '));
                $scope.search_all_status = get_check_all_value($scope.order_status);
                if ($scope.search_all_status == true)
                    $scope.search_status_value = [];
            }, true);

            $scope.$watch('date_type', function() {
                $scope.search_date_to_text = '';
                $scope.search_date_value = [];
                for (var key in $scope.date_type) {
                    if($scope.date_type[key] == true){
                        $scope.search_date_value.push(key);
                        $scope.search_date_to_text += $scope.date_type_text[key] + ', ';
                    }
                }
                $scope.search_date_to_text = $scope.search_date_to_text.substring(0, $scope.search_date_to_text.lastIndexOf(', '));
                $scope.search_all_date = get_check_all_value($scope.date_type);
                if ($scope.search_all_date == true)
                    $scope.search_date_value = [];
            }, true);

            $scope.$watch('advanced_search', function(){
                if ($scope.advanced_search == true){
                    $scope.search_string = '';
                }
            });
            
            function get_check_all_value(array){
                var result = true;
                var false_value_count = 0;
                for (var key in array) {
                    if(array[key] == false){
                        result = false;
                        false_value_count ++;
                    }
                }
                if (false_value_count == Object.keys(array).length){
                    result = true;
                    select_all(array);
                }
                return result;
            }

            function select_all(hash){
                for (var key in hash) {
                    hash[key] = true;
                }
            }

            function unselect_all(hash){
                for (var key in hash) {
                    hash[key] = false;
                }
            }
            $scope.search_all_object_action = function(value, array){
                if (value == true){
                    select_all(array);
                }else{
                    unselect_all(array)
                }
            };

            $scope.getMinimumTotalPrice = function(){
                if ($scope.selected_orders && $scope.selected_orders.length > 0) {
                    return $scope.selected_orders.sort(function (a, b) {
                        return a.total_price - b.total_price;
                    })[0].total_price;
                }
                return 0;
            };

            $scope.getMinimumBalanceDue = function(){
                if ($scope.selected_orders && $scope.selected_orders.length > 0) {
                    return $scope.selected_orders.sort(function(a, b){ return a.balance_due - b.balance_due; })[0].balance_due;
                }
                return 0;
            };

            $scope.selectOrder = function(order){
                order.changed_amount = 0;
                if(!order.checked){
                    $scope.selected_orders.push(order);
                }
                else{
                    $scope.selected_orders = $($scope.selected_orders).not([order]).get();
                }
                $scope.updateActionButtonStatus();
            };

            $scope.removeSelectedOrder = function(order){
                var orders = $.grep($scope.data.orders, function (x) {return x.order_id == order.order_id});
                $.each(orders, function(i,x){x.checked = false;});
                $scope.selected_orders = $($scope.selected_orders).not([order]).get();
                if($scope.submited_orders.length > 0) {
                    var orders = $.grep($scope.submited_orders, function (x) {
                        return x.order_id == order.order_id
                    });
                    $scope.submited_orders = $($scope.submited_orders).not(orders).get();
                }
                $scope.updateActionButtonStatus();
            };

            $scope.getSubmitResult = function(order){
                if($scope.submited_orders.length > 0){
                    var orders = $.grep($scope.submited_orders, function(x){return x.order_id == order.order_id});
                    if(orders.length > 0){
                        return orders[0];
                    }
                }
                return {};
            };

            $scope.updateActionButtonStatus = function(){
                if($scope.selected_orders.length <= 0){
                    $scope.can_increase = false;
                    $scope.can_decrease = false;
                    $scope.can_adjust = false;
                    $scope.can_cancel = false;
                    $scope.can_refund = false;
                    return;
                }
                var can_increase = true;
                var can_decrease = true;
                var can_adjust = true;
                var can_cancel = true;
                var can_refund = true;
                $.each($scope.selected_orders, function(index, order) {
                    can_increase = can_increase && order.can_increase;
                    can_decrease = can_decrease && order.can_decrease;
                    can_adjust = can_adjust && order.can_adjust;
                    can_cancel = can_cancel && order.can_cancel;
                    can_refund = can_refund && order.can_refund;
                });
                $scope.can_increase = can_increase;
                $scope.can_decrease = can_decrease;
                $scope.can_adjust = can_adjust;
                $scope.can_cancel = can_cancel;
                $scope.can_refund = can_refund;
            };

            $scope.getExchangedPrice = function(price, exchange_rate) {
                if(!price) return 0;
                if(!exchange_rate || exchange_rate <= 0) return price;
                return price * exchange_rate;
            }
        }
    ]);
}).call(this);