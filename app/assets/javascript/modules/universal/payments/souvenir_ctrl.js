(function() {
    this.app.controller('SouvenirCtrl', [
        "$scope", "$timeout",
        function($scope, $timeout) {
            $scope.current_step = 1;
            $scope.is_going_back = false;

            //constant --> cannot be reset
            $scope.search_users_url = '';
            $scope.create_user_url = '';
            $scope.get_souvenirs_by_event_url = '';
            $scope.validate_and_correct_items_url = '';
            $scope.payment_url = '';
            $scope.authenticity_token = '';

            //step 1: global
            $scope.show_normal_search = true;
            $scope.show_advanced_search = false;
            $scope.show_create_user = false;
            $scope.users = [];

            //step 1: normal search
            $scope.phone_number = '';
            $scope.order_number = '';
            $scope.email = '';

            //step 1: advanced search
            $scope.first_name = '';
            $scope.last_name = '';
            $scope.school_id = 0;
            $scope.school_list = [];

            //step 1: create new user
            $scope.new_email = '';
            $scope.new_phone_number = '';
            $scope.new_first_name = '';
            $scope.new_last_name = '';

            //step 2:
            $scope.event_list = [];
            $scope.souvenir_list = [];
            $scope.selected_event = '';
            $scope.selected_souvenir = [];
            $scope.user_info = {};
            $scope.selected_event_info = {};
            $scope.product_type_filters = { add_ons: true, shuttles: true, custom_activities: true };
            $scope.selected_product = {
                block: [],
                available_dates: [],
                available_times: [],
                selected_date: null,
                selected_block: {},
                product_block_id: null,
                quantity: 0,
                hotel_id: '',
                custom_hotel_name: '',
                selected_airline: '',
                other_airline: '',
                flight_number: '',
                note: '',
                addon_variant: null,
                addon_variants: []
            };
            $scope.shuttle_hotels = [];
            $scope.airlines = [];

            //step 3:
            var shouldAllowSubmit = false;
            $scope.isSubmitButtonDisabled = true;
            $scope.errorMessage = '';
            $scope.name = '';
            $scope.number = '';
            $scope.cvc = '';
            $scope.exp_month = '';
            $scope.exp_year = '';
            $scope.expiration = '';
            $scope.payment_customer_name = '';
            $scope.selectableQuantities = [];
            $scope.already_check = false;
            $scope.allow_check_in_on_behalf = true;
            $scope.payment_phone_number = '';
            $scope.discount_amount = 0;
            $scope.discount_percent = 0;
            $scope.allow_pay_free = false;
            $scope.discount_value_is_valid = true;

            $scope.init = new function(){
                $.ajax({
                    url: '/souvenirs/get-school-list',
                    type: 'POST',
                    async: false
                }).done(function(result){
                    result.push({"name":"Other"});
                    $scope.school_list = result;
                });
            };

            /*-------------------------------------------------------------------------------------
             *  global functions
             *------------------------------------------------------------------------------------*/
            $scope.startOver = function(){
                $scope.current_step = 1;
                $scope.is_going_back = false;

                //step 1: global
                $scope.show_normal_search = true;
                $scope.show_advanced_search = false;
                $scope.show_create_user = false;
                $scope.users = [];

                //step 1: normal search
                $scope.phone_number = '';
                $scope.order_number = '';
                $scope.email = '';

                //step 1: advanced search
                $scope.first_name = '';
                $scope.last_name = '';
                $scope.school_id = 0;

                //step 1: create new user
                $scope.new_email = '';
                $scope.new_phone_number = '';
                $scope.new_first_name = '';
                $scope.new_last_name = '';

                //step 2:
                $scope.souvenir_list = [];
                $scope.resetMultiSelect($("#eventListCombobox"));
                $scope.selected_event = '';
                $scope.selected_souvenir = [];
                $scope.user_info = {};
                $scope.payment_phone_number = '';
                $scope.reset_selected_product();
                $scope.shuttle_hotels = [];

                //step 3:
                $scope.resetStep3();

                //step 4:
                $('#order-summary-container').html('');
            };

            $scope.choosePaymentMethod = function(method){
                if(method == 'credit_card'){
                    $scope.pay_by_credit_card = true;
                    $scope.pay_by_cash = false;
                    $scope.pay_free = false;
                }
                else if(method == 'cash'){
                    $scope.resetStep3();
                    $scope.pay_by_cash = true;
                }
                else{
                    $scope.resetStep3();
                    $scope.pay_free = true;
                }
            };

            $scope.resetStep3 = function(){
                $scope.pay_by_credit_card = $scope.pay_by_cash = $scope.pay_free = false;
                $scope.allow_check_in_on_behalf = true;
                $scope.isSubmitButtonDisabled = true;
                $scope.errorMessage = '';
                $scope.name = '';
                $scope.number = '';
                $scope.cvc = '';
                $scope.exp_month = '';
                $scope.exp_year = '';
                $scope.expiration = '';
                $scope.payment_customer_name = '';
                $scope.selectableQuantities = [];
                $scope.already_check = false;
                $scope.discount_amount = $scope.selected_event_info.souvenir_discount_amount;
                $scope.discount_percent = $scope.selected_event_info.souvenir_discount_percent;
                $scope.allow_pay_free = $scope.selected_event_info.allow_souvenir_discount;
                $scope.discount_value_is_valid = true;
                $('input:text').removeClass('valid');
                $('[ng-model="number"]').attr('class', 'cc-number');
            };

            $scope.backToStep = function(step){
                if($scope.current_step == 3 && step < 3){
                    $scope.resetStep3();
                }
                $scope.current_step = step;
            };

            $scope.resetMultiSelect = function(element){
                $('option', element).each(function(e) {
                    $(this).removeAttr('selected').prop('selected', false);
                });
                element.multiselect('refresh');
                element.multiselect('rebuild');
            };

            $scope.setDefaultValueMultiSelect = function(element, value){
                $('option', element).each(function(e) {
                    $(this).removeAttr('selected').prop('selected', false);
                });
                $('option[value="'+value+'"]', element).prop('selected', true);
                element.multiselect('refresh');
            };

            $scope.reset_selected_product = function(){
                $scope.selected_product = {
                    block: [],
                    available_dates: [],
                    available_times: [],
                    selected_date: null,
                    selected_block: {},
                    product_block_id: null,
                    quantity: 0,
                    hotel_id: '',
                    custom_hotel_name: '',
                    selected_airline: '',
                    other_airline: '',
                    flight_number: '',
                    note: '',
                    addon_variant: null,
                    addon_variants: []
                };
            };

            /*-------------------------------------------------------------------------------------
             *  functions on step #1 (search)
             *------------------------------------------------------------------------------------*/
            $scope.disabledSearchButton = function(){
                if(!$scope.show_advanced_search && $scope.phone_number == '' && $scope.email == '' && $scope.order_number == '')
                    return true;

                if($scope.show_advanced_search && $scope.first_name == '' && $scope.last_name == '')
                    return true;

                return false;
            }

            $scope.disableCreateUserButton = function(){
                if($scope.show_create_user && ($scope.new_email == '' || $scope.new_first_name == '' || $scope.new_last_name == ''))
                    return true;

                var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if(!regex.test($scope.new_email))
                    return true;

                return false;
            };

            $scope.resetFormContentStep1 = function(){
                $scope.users = [];
                $('.first-screen .search_error').hide();

                if($scope.show_advanced_search){
                    $scope.first_name = '';
                    $scope.last_name = '';
                    $scope.resetMultiSelect($("#schoolListCombobox"));
                    $scope.school_id = 0;
                }

                if($scope.show_normal_search){
                    $scope.phone_number = '';
                    $scope.order_number = '';
                    $scope.email = '';
                }

                if($scope.show_create_user){
                    $scope.new_email = '';
                    $scope.new_phone_number = '';
                    $scope.new_first_name = '';
                    $scope.new_last_name = '';
                }
            };

            $scope.showAdvancedSearch = function(){
                $scope.show_advanced_search = true;
                $scope.resetFormContentStep1();
                $scope.show_normal_search = false;
                $scope.show_create_user = false;
            };

            $scope.showNormalSearch = function(){
                $scope.show_normal_search = true;
                $scope.resetFormContentStep1();
                $scope.show_create_user = false;
                $scope.show_advanced_search = false;
            };

            $scope.showCreateUser = function(){
                $scope.show_create_user = true;
                $scope.resetFormContentStep1();
                $scope.show_advanced_search = false;
                $scope.show_normal_search = false;
            };

            $scope.autoSearchUsers = function(){
                if($scope.disabledSearchButton() == false && !$scope.is_going_back){
                    $scope.searchUsers();
                }
            };

            $scope.searchUsers = function(){
                if($scope.show_normal_search){
                    //verify email address
                    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    if($scope.email != '' && !regex.test($scope.email)){
                        $('.first-screen .search_error').html('Your email is not valid. Please input the correct email format. <button class="close" data-hide="error">x</button>').show();
                        return;
                    }
                }

                $('.first-screen .search_error').hide();
                $scope.users = [];

                $.ajax({
                    type: "POST",
                    url: $scope.search_users_url,
                    data: {
                        'is_advanced_search': $scope.show_advanced_search,
                        'phone_number': $scope.phone_number,
                        'order_number': $scope.order_number,
                        'email': $scope.email,
                        'first_name': $scope.first_name,
                        'last_name': $scope.last_name,
                        'school_id': $scope.school_id
                    },
                    success: function (result) {
                        if(result.success){
                            $scope.$apply(function() {
                                $scope.users = result.users;
                                if ($scope.users.length == 1) {
                                    $scope.selectUser($scope.users[0]);
                                }
                            });
                        }else{
                            $('.first-screen .search_error').html(result.message + '<button class="close" data-hide="error">x</button>').show();
                        }
                    }
                });

                $scope.is_going_back = true;
            };

            $scope.showCreateUserConfirmation = function(){
                $('#confirmUserInformationModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            };

            $scope.createUser = function(){
                $("#confirmUserInformationModal").modal('hide');

                //verify email address
                var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if($scope.new_email != '' && !regex.test($scope.new_email)){
                    $('.first-screen .search_error').html('Email address is not valid. Please input the correct email format. <button class="close" data-hide="error">x</button>').show();
                    return;
                }

                $('.first-screen .search_error').hide();

                $.ajax({
                    type: "POST",
                    url: $scope.create_user_url,
                    data: {
                        'user_email': $scope.new_email,
                        'user_phone_number': $scope.new_phone_number,
                        'user_first_name': $scope.new_first_name,
                        'user_last_name': $scope.new_last_name
                    },
                    success: function (result) {
                        if(result.success){
                            $scope.$apply(function() {
                                $scope.selectUser(result.user);
                            });
                        }else{
                            $('.first-screen .search_error').html(result.message + '<button class="close" data-hide="error">x</button>').show();
                        }
                    }
                });
            };

            $scope.selectUser = function(user){
                $scope.user_info = user;
                $scope.payment_phone_number = user.user_phone;
                $scope.current_step = 2;
                $scope.setDefaultEvent(user.last_event_id);
            };

            /*-------------------------------------------------------------------------------------
             *  functions on step #2 (select souvenir products)
             *------------------------------------------------------------------------------------*/

            $scope.event_selected_change = function(){
                $.ajax({
                    type: "POST",
                    url: $scope.get_souvenirs_by_event_url,
                    data: {'event_id': $scope.selected_event},
                    success: function(result) {
                        $scope.$apply(function(){
                            $scope.selected_souvenir = [];
                            $scope.selected_event_info = result.event_info;
                            $scope.souvenir_list = result.souvenirs;
                            $scope.shuttle_hotels = result.shuttle_hotels;
                            $scope.discount_amount = $scope.selected_event_info.souvenir_discount_amount;
                            $scope.discount_percent = $scope.selected_event_info.souvenir_discount_percent;
                            $scope.allow_pay_free = $scope.selected_event_info.allow_souvenir_discount;
                        });
                        var width = $(".product-wrap img").width();
                        $(".product-wrap img").css('height', width * 0.67777);
                    }
                });
            };

            $scope.filter_product_type = function(souvenir){
                var filters = [];
                //0: add-ons; 1: shuttle buses; 2: custom activities

                if($scope.product_type_filters.add_ons) filters.push(0);
                if($scope.product_type_filters.shuttles) filters.push(1);
                if($scope.product_type_filters.custom_activities) filters.push(2);
                return (filters.indexOf(souvenir.type) !== -1);
            };

            $scope.isEmpty = function (obj) {
                for (var i in obj) if (obj.hasOwnProperty(i)) return false;
                return true;
            };

            $scope.is_existed_in_shopping_cart = function(id){
                for(var i = 0;i<$scope.selected_souvenir.length;i++){
                    if($scope.selected_souvenir[i].id == id) return true;
                }
                return false;
            };

            $scope.add_item = function(souvenir){
                if (souvenir.quantity > 0){
                    $scope.selected_souvenir.push({
                        'id': souvenir.id,
                        'name': souvenir.name,
                        'instock': souvenir.instock,
                        'price': souvenir.price,
                        'quantity': souvenir.quantity
                    });
                    souvenir.existed_in_shopping_cart = true;
                }
            };

            $scope.show_souvenir_settings = function(souvenir){
                $scope.selected_product = angular.copy(souvenir);

                $.ajax({
                    type: "POST",
                    url: '/souvenirs/customize_product/' + souvenir.type + '/' + $scope.selected_product.id,
                    success: function (result) {
                        $scope.$apply(function(){
                            if (souvenir.type == 0){
                                $scope.selected_product.addon_variants = result.addon_variants;
                            }
                            else{
                                var dates = result.available_dates;
                                $scope.blocks = result.blocks;
                                $scope.selected_product.available_dates = dates;
                                if(dates && dates.length > 0){
                                    $("#datePicker").datepicker("option", "minDate", dates[0]);
                                    $("#datePicker").datepicker("option", "maxDate", dates[dates.length -1]);
                                }else{
                                    $("#datePicker").datepicker("option", "minDate", '');
                                    $("#datePicker").datepicker("option", "maxDate", '');
                                }

                                $scope.airlines = result.airlines;
                            }
                        });

                        if (souvenir.type == 0){
                            $('#addonWithVariantDetailsModal').modal({keyboard: false});
                        }
                        else {
                            $('#customProductDetailsModal').modal({keyboard: false});
                        }
                    }
                });
            };

            $scope.add_custom_product_to_shopping_cart = function(){
                if($scope.selected_product.quantity > 0){
                    var souvenir = $scope.selected_product;

                    $scope.selected_souvenir.push({
                        'id': souvenir.id,
                        'name': souvenir.name,
                        'instock': souvenir.selected_block.stock,
                        'price': souvenir.selected_block.unit_price,
                        'quantity': souvenir.quantity,
                        'product_block_id': souvenir.selected_block.block_id,
                        'description': souvenir.selected_date != undefined ? souvenir.selected_date + ' ' + souvenir.selected_block.time : '',
                        'hotel_id': souvenir.hotel_id,
                        'custom_hotel_name': souvenir.custom_hotel_name,
                        'note': souvenir.note,
                        'flight_number': souvenir.flight_number,
                        'airline': souvenir.selected_airline == 'Other' ? souvenir.other_airline : souvenir.selected_airline
                    });

                    souvenir.existed_in_shopping_cart = true;

                    $scope.reset_selected_product();
                    $('#customProductDetailsModal').modal('hide');
                    $('#addonWithVariantDetailsModal').modal('hide');
                }
            };

            $scope.$watch('selected_product.selected_date', function(){
                if($scope.selected_product.selected_date == null) return;
                $scope.selected_product.available_times = $scope.blocks[$scope.selected_product.selected_date];
                $scope.selected_product.selected_block = {};
                $scope.selected_product.quantity = 0;
            });

            $scope.$watch('selected_product.product_block_id', function(){
                if($scope.selected_product.product_block_id == null) {
                    $scope.selected_product.selected_block = {};
                    return;
                }
                if($scope.selected_product.available_times && $scope.selected_product.available_times.length > 0) {
                    $scope.selected_product.selected_block = $.grep($scope.selected_product.available_times, function (x) {
                        return x.block_id == $scope.selected_product.product_block_id;
                    })[0];
                }
            });

            $scope.$watch('selected_product.addon_variant', function(){
                if($scope.selected_product.addon_variant == null) {
                    $scope.selected_product.selected_block = {};
                    $scope.selected_product.product_block_id = null;
                    return;
                }
                else {
                    $scope.selected_product.selected_block = $.grep($scope.selected_product.addon_variants, function (x) {
                        return x.block_id == $scope.selected_product.addon_variant.block_id;
                    })[0];
                    $scope.selected_product.product_block_id = $scope.selected_product.selected_block.block_id;
                }
            });

            $scope.update_quantity = function(souvenir){
                for(var i = 0;i<$scope.selected_souvenir.length;i++){
                    if($scope.selected_souvenir[i].id == souvenir.id){
                        $scope.selected_souvenir[i].quantity = souvenir.quantity;
                        return;
                    }
                }
            };

            $scope.remove_item = function(souvenir){
                for(var j = 0;j<$scope.souvenir_list.length;j++){
                    if($scope.souvenir_list[j].id == souvenir.id){
                        $scope.souvenir_list[j].existed_in_shopping_cart = false;
                        $timeout(function(){
                            // Any code in here will automatically have an $scope.apply() run afterwards
                            $scope.souvenir_list[j].quantity = 0;
                        });
                        break;
                    }
                }

                for(var i = 0;i<$scope.selected_souvenir.length;i++){
                    if($scope.selected_souvenir[i].id == souvenir.id){
                        $scope.selected_souvenir.splice(i, 1);
                        break;
                    }
                }

                if($scope.selected_souvenir.length == 0){
                    $scope.backToStep(2);
                }
            };

            $scope.cal_price = function(souvenir){
                return souvenir.price * souvenir.quantity;
            };

            $scope.get_total_price = function(){
                var result = 0;
                for(var i = 0;i<$scope.selected_souvenir.length;i++){
                    result += $scope.cal_price($scope.selected_souvenir[i])
                }
                return result;
            }

            $scope.get_discount_amount = function(){
                var discountAmount = 0;
                if($scope.selected_event_info.allow_souvenir_discount && $scope.pay_by_credit_card){
                    if($scope.selected_event_info.souvenir_discount_type){
                        discountAmount = ($scope.get_total_price() * $scope.discount_percent)/100;
                    }
                    else{
                        discountAmount = $scope.discount_amount;
                    }
                }
                return discountAmount;
            };

            $scope.get_payment_amount = function(){
                if($scope.pay_free){
                    return 0;
                }

                var remaining_amount = $scope.get_total_price() - $scope.get_discount_amount();
                return remaining_amount > 0 ? remaining_amount : 0;
            };

            $scope.get_payment_amount_without_pay_free = function(){
                var remaining_amount = $scope.get_total_price() - $scope.get_discount_amount();
                return remaining_amount > 0 ? remaining_amount : 0;
            };

            $scope.discountAmountChange = function(value){
                var is_valid = false;
                if($scope.selected_event_info.souvenir_discount_type){
                    var number0to100Regex = /^(100(\.00)?|[0-9]{1,2}(\.[0-9]{0,2})?)$/gm;
                    is_valid = number0to100Regex.test(value);
                    if(is_valid)
                        $scope.discount_percent = value;
                }
                else{
                    var decimalRegex = /^[0-9]+(\.[0-9]{0,2})?$/gm;
                    is_valid = decimalRegex.test(value);
                    if(is_valid)
                        $scope.discount_amount = value;
                }
                $scope.discount_value_is_valid = is_valid && $scope.get_payment_amount() >= 0;
                $scope.validateSubmitButtonStatus();
            };

            $scope.validate_and_correct_items = function(){
                $.ajax({
                    type: "POST",
                    url: $scope.validate_and_correct_items_url,
                    data: {
                        'event_id': $scope.selected_event,
                        'buyer_id': $scope.user_info.user_id,
                        'selected_souvenir': angular.toJson($scope.selected_souvenir)
                    },
                    success: function(result) {
                       $scope.handle_validate_data(result, 3);
                    }
                });
                return false;
            }

            $scope.handle_validate_data = function(result, next_step){
                if (result.is_successful){
                    $('#alert_error_div').hide();
                    $scope.current_step = next_step;
                    if($scope.current_step == 4){
                        if(result.arrow_pass_check_in_id != undefined && result.arrow_pass_check_in_id > 0){
                            $.ajax({
                                type: "POST",
                                url: "/souvenirs/integrate-arrow-pass/" + result.arrow_pass_check_in_id,
                                success: function(data) {}
                            });
                        }else{
                            $.ajax({
                                type: "POST",
                                url: "/souvenirs/get-order-summary",
                                data: {'order_number': result.order_number},
                                success: function(data) {}
                            });
                        }
                    }
                }else{
                    $('#alert_error_div').html(result.error_message + ' <button class="close" data-hide="error">x</button>').show();
                }

                $scope.$apply(function(){
                    $scope.selected_souvenir = [];
                    if (result.souvenir_products !== undefined && result.souvenir_products !== null ){
                        for(var i = 0;i< result.souvenir_products.length;i++) {
                            var souvenir = result.souvenir_products[i];
                            $scope.selected_souvenir.push({
                                'id': souvenir.id,
                                'name': souvenir.name,
                                'instock': souvenir.instock,
                                'price': souvenir.price,
                                'quantity': souvenir.quantity,
                                'product_block_id': souvenir.product_block_id,
                                'description': souvenir.description,
                                'hotel_id': souvenir.hotel_id,
                                'custom_hotel_name': souvenir.custom_hotel_name,
                                'flight_number': souvenir.flight_number,
                                'airline': souvenir.airline,
                                'note': souvenir.note,
                                'out_of_stock': souvenir.out_of_stock,
                                'existed_in_shopping_cart': souvenir.existed_in_shopping_cart
                            });
                        }
                    }
                });

            }

            $scope.setDefaultEvent = function(event_id){
                for(var i = 0; i < $scope.event_list.length; i++){
                    if(event_id == $scope.event_list[i].id){
                        $scope.selected_event = event_id;
                        $scope.setDefaultValueMultiSelect($('#eventListCombobox'), event_id);
                        $scope.event_selected_change();
                        break;
                    }
                }
            };

            $scope.disableCustomAddToCartButton = function () {

                var p = $scope.selected_product;

                return p.quantity == 0 || !p.product_block_id || p.error ||
                       p.selected_block.stock < p.quantity ||
                      (p.type == 1 &&
                          ((
                              !p.flight_number || p.flight_number == ''
                          ) ||
                          (
                              !p.hotel_id || p.hotel_id == '' || (p.hotel_id == 'other' && $.isEmptyObject(p.custom_hotel_name))
                          ) ||
                          (
                              !p.selected_airline || p.selected_airline == '' || (p.selected_airline == 'Other' && (!p.other_airline || p.other_airline == ''))
                          ))
                      );
            };

            $scope.disableSelectCustomProductButton = function(souvenir){
                return $scope.selected_souvenir && $.grep($scope.selected_souvenir, function(x){ return x.id == souvenir.id}).length > 0;
            }

            /*-------------------------------------------------------------------------------------
             *  functions on step #3 (checkout)
             *------------------------------------------------------------------------------------*/
            $scope.clearCreditCardInfo = function(){
                $scope.name = '';
                $scope.number = '';
                $scope.expiration = '';
                $scope.cvc = '';
            };

            $scope.$watch('name', function(value){
                var ele = $('[ng-model="name"]');
                $(ele).removeClass('valid');
                if(value && value.length > 0){
                    $(ele).addClass('valid');
                }
                $scope.validateSubmitButtonStatus();
            });

            $scope.$watch('number', function(value){
                var ele = $('[ng-model="number"]');
                $(ele).val(value);
                $(ele).validateCreditCard(function(card)
                {
                    $(ele).attr('class', 'cc-number');
                    if(card.card_type){
                        $(ele).addClass(card.card_type.name);
                    }
                    if(card.length_valid ){
                        $(ele).addClass('valid');
                    }
                });
                $scope.validateSubmitButtonStatus();
            });

            $scope.$watch('expiration', function(newValue) {
                var parsedExpiration = $.payment.cardExpiryVal(newValue);
                $scope.exp_month = parsedExpiration.month || '';
                $scope.exp_year = parsedExpiration.year || '';

                var ele = $('[ng-model="expiration"]');
                date = newValue.split('/');
                $(ele).removeClass('valid');
                if(date.length > 1 && $.trim(date[0]) > 0 && $.trim(date[0]) < 13 && ($.trim(date[1]).length == 2 || $.trim(date[1]).length == 4)){
                    input_month = $.trim(date[0]);
                    input_year = $.trim(date[1]);
                    current_date = new Date();
                    current_month = current_date.getMonth() + 1;
                    current_year = current_date.getFullYear();
                    if (input_year.length == 2){
                        input_year = parseInt(current_year.toString().substring(0,2) + input_year.toString());
                    }

                    exp_year = input_year - current_year;

                    if(exp_year == 0 && input_month >= current_month){
                        $(ele).addClass('valid');
                    }
                    else if(exp_year > 0 && exp_year < 11){
                        $(ele).addClass('valid');
                    }
                }
                $scope.validateSubmitButtonStatus();
            });

            $scope.$watch('cvc', function(value){
                var ele = $('[ng-model="cvc"]');
                $(ele).removeClass('valid');
                if(value.length > 2){
                    $(ele).addClass('valid');
                }
                $scope.validateSubmitButtonStatus();
            });

            $scope.validateSubmitButtonStatus = function(){
                var card_name = $('[ng-model="name"]').hasClass('valid');
                var card_number = $('[ng-model="number"]').hasClass('valid');
                var card_expiration = $('[ng-model="expiration"]').hasClass('valid');
                var card_cvv = $('[ng-model="cvc"]').hasClass('valid');
                var already_check = $scope.already_check; //$('[ng-model="already_check"]').is(':checked');
                $scope.isSubmitButtonDisabled = !(card_name && card_number && card_expiration && card_cvv && already_check && $scope.discount_value_is_valid);
            };

            $scope.showPaymentConfirm = function(){
                $('#confirmPayDlg').modal({
                    //backdrop: 'static',
                    keyboard: false
                });
            };

            $scope.payByCashClick = function(){
                $.ajax({
                    type: "POST",
                    url: $scope.payment_url,
                    data: {
                        'authenticity_token': $scope.authenticity_token,
                        'token': '',
                        'payment_method': 'cash',
                        'allow_check_in_on_behalf': $scope.allow_check_in_on_behalf,
                        'event_id': $scope.selected_event,
                        'buyer_id': $scope.user_info.user_id,
                        'selected_souvenir': angular.toJson($scope.selected_souvenir),
                        'payment_amount': $scope.get_payment_amount(),                   
                        'payment_phone_number': $scope.payment_phone_number.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                    },
                    success: function (result) {
                        $scope.handle_validate_data(result, 4);
                        $("#confirmPayDlg").modal('hide');
                    }
                });
            };

            $scope.payByCreditCardClick = function() {
                if (shouldAllowSubmit) {
                    return;
                }

                if ($scope.validateExtraPaymentInfo && !$scope.validateExtraPaymentInfo()) {
                    return;
                }
                if(validate()) {
                    $(".lockModal").show();
                    $scope.isSubmitButtonDisabled = true;

                    Stripe.card.createToken({
                        number: $scope.number,
                        cvc: $scope.cvc,
                        exp_month: $scope.exp_month,
                        exp_year: $scope.exp_year,
                        name: $scope.name
                    }, stripeResponseHandler);
                }else{
                    $scope.errorMessage = 'Cardholder Name cannot be blank.';
                }
            };

            $scope.payFreeClick = function(){
                $.ajax({
                    type: "POST",
                    url: $scope.payment_url,
                    data: {
                        'authenticity_token': $scope.authenticity_token,
                        'token': '',
                        'payment_method': 'free',
                        'allow_check_in_on_behalf': $scope.allow_check_in_on_behalf,
                        'event_id': $scope.selected_event,
                        'buyer_id': $scope.user_info.user_id,
                        'selected_souvenir': angular.toJson($scope.selected_souvenir),
                        'discount_amount': $scope.get_payment_amount_without_pay_free(),
                        'payment_amount': 0,
                        'payment_phone_number': $scope.payment_phone_number.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                    },
                    success: function (result) {
                        $scope.handle_validate_data(result, 4);
                        $("#confirmPayDlg").modal('hide');
                    }
                });
            };

            function validate() {
                return !!($scope.name);
            }

            function stripeResponseHandler (status, response) {
                $("#confirmPayDlg").modal('hide');

                $scope.$apply(function(){
                    if (response.error) {
                        $scope.errorMessage = response.error.message;
                        $scope.isSubmitButtonDisabled = false;
                        $(".lockModal").hide();
                    } else {
                        shouldAllowSubmit = true;
                        $.ajax({
                            type: "POST",
                            url: $scope.payment_url,
                            data: {
                                'authenticity_token': $scope.authenticity_token,
                                'token': response.id,
                                'payment_method': 'credit_card',
                                'allow_check_in_on_behalf': $scope.allow_check_in_on_behalf,
                                'event_id': $scope.selected_event,
                                'buyer_id': $scope.user_info.user_id,
                                'selected_souvenir': angular.toJson($scope.selected_souvenir),
                                'discount_amount': $scope.get_discount_amount(),
                                'payment_amount': $scope.get_payment_amount(),
                                'payment_phone_number': $scope.payment_phone_number.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                            },
                            success: function (result) {
                                $scope.handle_validate_data(result, 4);
                            }
                        });
                        shouldAllowSubmit = false;
                    }
                });
            }

            $scope.$watch('selected_souvenir', function(value){
                for(var i = 0; i<$scope.selected_souvenir.length; i++){
                    if($scope.selected_souvenir[i].quantity == 0 || $scope.selected_souvenir[i].quantity == '' || $scope.selected_souvenir[i].quantity == undefined){
                        $scope.selected_souvenir[i].quantity = 1;
                        return;
                    }
                }
            },
            true);
        }
    ]);
}).call(this);