(function() {
	this.app.controller('BundleCtrl', [
		"$scope",'$window', '$timeout',
		function($scope, $window, $timeout) {
            $scope.is_cabo_spring_break_event = false;
            $scope.bundle = {};
            $scope.schools = [];
            $scope.trip_dates = [];
            $scope.products = [];
            $scope.flights = [];
            $scope.product_types = {};
            $scope.sub_bundles = [];
            $scope.selected_products = [];

            $scope.expiration_checkout_date_setting = {
                firstItem: 'name',
                maxYear: (new Date()).getFullYear() + 5,
                minYear: (new Date()).getFullYear()
            };

            $scope.expiration_date_setting = {
                firstItem: 'name',
                maxYear: (new Date()).getFullYear() + 5,
                minYear: (new Date()).getFullYear() - 5
            };

            $scope.init = new function(){};

            Date.prototype.addDays = function (days) {
                this.setDate(this.getDate() + days);
                return this;
            };

            // Called when school or trip date changed
            $scope.getProducts = function(){
                var url = '/events/' + $scope.bundle.event_id + '/bundles/get-products';
                var option = {trip_date_ids: $scope.bundle.trip_date_ids, school_id: $scope.bundle.school_id};

                $.post(url, option, function (result) {
                    $timeout(function(){
                        $scope.products = result.products;
                        $scope.flights = result.flights;
                        var product_ids = [];

                        $.each($scope.products, function(i, p){
                            product_ids.push(p[0]);
                        });

                        if($scope.bundle.flight_id != null && $scope.bundle.flight_id != '' && $.grep($scope.flights, function(p, i){ return p[0] == $scope.bundle.flight_id; }).length == 0){
                            $scope.bundle.flight_id = $scope.flights[0][0];
                        }

                        $scope.selected_products = $.grep($scope.selected_products, function(p, i){ return product_ids.indexOf(p.id) > -1; });
                    });
                });
            };

            $scope.filterAddedProduct = function(item){
                var valid = true;
                $.each($scope.selected_products, function (i, p) {
                    if(p.id == item[0]) {
                        valid = false;
                        return false;
                    }
                });
                return valid;
            };

            $scope.addProduct = function(){
                var event_id = $scope.bundle.event_id;
                if(event_id != undefined && event_id.toString().length > 0){
                    var url = '/events/' + event_id + '/bundles/get-product-data/' + $scope.selected_product_id;
                    var option = {trip_date_ids: $scope.bundle.trip_date_ids };

                    $.post(url, option, function (result) {
                        $timeout(function(){
                            $scope.selected_products.push(result);
                            $scope.selected_product_id = null;
                        });
                    });
                }
            };

            $scope.removeProduct = function(index){
                $scope.selected_products.splice(index, 1);
            };

            // add sub bundle
            $scope.addSubBundle = function() {
                $scope.inserted = {
                    id: null,
                    increase_price: Big(0),
                    num_of_day: 1,
                    deposited_from: '',
                    deposited_to: '',
                    amount: Big(0),
                    can_delete: true
                };
                $scope.sub_bundles.push($scope.inserted);
                $scope.updateSubBundleData();
            };

            // remove sub bundle
            $scope.removeSubBundle = function(index) {
                $scope.sub_bundles.splice(index, 1);
            };

            $scope.validateBundle = function(){
                $scope.error_message = null;
                var is_valid = true;
                var current_date = new Date(moment().format('YYYY-MM-DD'));

                // Validate main bundle
                if($scope.bundle.amount == '' || parseFloat($scope.bundle.amount) <= 0){
                    $scope.error_message = 'Bundle amount must be greater than zero!';
                    is_valid = false;
                }else if($scope.selected_products.length == 0){
                    $scope.error_message = 'Bundle requires at least one product!';
                    is_valid = false;
                }else if($scope.bundle.checkout_to && $scope.bundle.checkout_to != '' && new Date($scope.bundle.checkout_to) < current_date){
                    $scope.error_message = 'Invalid purchase dates: dates must be after or equal today!';
                    is_valid = false;
                }else if($scope.bundle.checkout_from && $scope.bundle.checkout_from != '' &&
                        $scope.bundle.checkout_to && $scope.bundle.checkout_to != '' &&
                        new Date($scope.bundle.checkout_to) < new Date($scope.bundle.checkout_from))
                {
                    $scope.error_message = 'Invalid purchase dates: to date must be after from date!';
                    is_valid = false;
                }else if($scope.bundle.deposited_from && $scope.bundle.deposited_from != '' &&
                            $scope.bundle.deposited_to && $scope.bundle.deposited_to != '' &&
                            new Date($scope.bundle.deposited_to) < new Date($scope.bundle.deposited_from))
                {
                    $scope.error_message = 'Invalid deposited dates: dates must be after or equal today!';
                    is_valid = false;
                }else if($scope.sub_bundles.length > 0){
                    var cannot_delete = ($.grep($scope.sub_bundles, function(item, idx){ return !item.can_delete; })).length > 0;

                    if(($scope.bundle.deposited_from == null || $scope.bundle.deposited_from == '') &&
                        ($scope.bundle.deposited_to == null || $scope.bundle.deposited_to == '')){

                        if(cannot_delete){
                            is_valid = false;
                            $scope.error_message = 'You must set deposited date because some sub bundles have applied already!';
                        }else {
                            $scope.sub_bundles = [];
                        }
                    }else{
                        $.each($scope.sub_bundles, function(idx, bundle){
                            if(bundle.num_of_day == undefined || bundle.num_of_day <= 0 || bundle.increase_price == ''){
                                $scope.error_message = 'Sub bundles are invalid. Please update!';
                                is_valid = false;
                                return false;
                            }
                        });
                    }
                }

                return is_valid
            };

            $scope.updateSubBundleData = function(){
                if($scope.sub_bundles.length > 0){
                    var amount = $scope.bundle.amount;
                    var start_date = $scope.bundle.deposited_from;

                    if($scope.bundle.deposited_to){
                        start_date = $scope.bundle.deposited_to
                    }

                    $.each($scope.sub_bundles, function(idx, bundle){
                        if(bundle.num_of_day > 0){
                            bundle.deposited_from = new Date(start_date).addDays(1);
                            bundle.deposited_to = new Date(start_date).addDays(parseInt(bundle.num_of_day));
                            start_date = bundle.deposited_to;
                        }else{
                            bundle.deposited_from = '';
                            bundle.deposited_to = '';
                        }

                        if(bundle.increase_price == ''){
                            bundle.increase_price = Big(0);
                        }

                        bundle.amount = parseFloat(amount) + parseFloat(bundle.increase_price);
                        amount = bundle.amount;

                    });
                }
            };

            $scope.submitBundle = function(){
                var product_ids = [];
                var product_options = {};
                $.each($scope.selected_products, function(i, p){
                    product_ids.push(p.id);

                    if(p.option_ids && p.option_ids.length > 0){
                        product_options[p.id] = p.option_ids;
                    }
                });

                $scope.bundle.product_ids = product_ids;
                $scope.bundle.product_options = product_options;

                var option = {bundle: angular.toJson($scope.bundle), sub_bundles: angular.toJson($scope.sub_bundles)};
                var url = '/events/' + $scope.bundle.event_id + '/bundles/update-bundle';

                $.post(url, option, function (result) {
                    bootbox.alert(result.message);
                    if(result.is_successful){
                        $('[ng-controller=BundleCtrl]').parents('.modal').modal('hide');
                        wiselinks.load($scope.redirect_url);
                    }
                });
            };
		}
	]);
}).call(this);