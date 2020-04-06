(function() {
    this.app.controller('PayBalanceDueCheckinCtrl', [
        "$scope", "$timeout",
        function($scope, $timeout) {
            var shouldAllowSubmit = false;
            $scope.isSubmitButtonDisabled = true;
            $scope.errorMessage = '';
            $scope.name = '';
            $scope.number = '';
            $scope.cvc = '';
            $scope.exp_month = '';
            $scope.exp_year = '';
            $scope.expiration = '';
            $scope.already_check = false;
            $scope.amount = 0;
            $scope.order_id = null;

            $scope.payment_url = '';
            $scope.authenticity_token = '';
            $scope.check_in_id = '';

            $scope.init = function(){};

            $scope.resetData = function(amount, order_id){
                $timeout(function () {
                    $scope.amount = amount;
                    $scope.name = '';
                    $scope.number = '';
                    $scope.cvc = '';
                    $scope.exp_month = '';
                    $scope.exp_year = '';
                    $scope.expiration = '';
                    $scope.already_check = false;
                    $scope.order_id = order_id;
                });
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
                var already_check = $scope.already_check;
                $scope.isSubmitButtonDisabled = !(card_name && card_number && card_expiration && card_cvv && already_check && $scope.amount > 0);
            };

            $scope.showPaymentConfirm = function(){
                $scope.payByCreditCardClick();
            };

            $scope.payByCreditCardClick = function() {
                if (shouldAllowSubmit) {
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
                    $scope.errorMessage = 'Card information cannot be blank.';
                }
            };

            function validate() {
                return !!($scope.name) && !!($scope.number) && !!($scope.cvc) && !!($scope.exp_month) && !!($scope.exp_year) && !!($scope.order_id);
            }

            function stripeResponseHandler (status, response) {
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
                                'order_id': $scope.order_id,
                                'payment_amount': $scope.amount
                            },
                            success: function (result) {
                                if (result && result.success){
                                    $('#pay_balance_due_checkin').modal('hide');
                                    wiselinks.load(window.location.href);
                                }else {
                                    $timeout(function () {
                                        $scope.validateSubmitButtonStatus();
                                    });

                                    if(result && result.message){
                                        bootbox.alert(result.message);
                                    }
                                }
                            }
                        });
                        shouldAllowSubmit = false;
                    }
                });
            }
        }
    ]);
}).call(this);