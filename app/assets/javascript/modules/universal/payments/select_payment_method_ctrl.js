(function() {
    this.app.controller('choosePaymentMethodCtrl', [
        "$scope",
        "cartService",
        "$timeout",
        function($scope, cartService, $timeout) {
            $scope.payment_buttons = [];
            $scope.current_payment_buttons = [];
            $scope.show_back_button = false;
            $scope.getPaymentButtonsUrl = '';

            $scope.pay_all_info = {
                as_low_as: 0,
                discount: 0,
                can_split_with_friend: false,
                selected: false
            };
            $scope.pay_affirm_info = {
                as_low_as: 0,
                starting: 0,
                months: 12,
                affirm_month_term: '',
                selected: false
            };
            $scope.pay_installment_info = {
                balance_due: 0,
                due_today: 0,
                split_payments: [],
                selected: false
            };

            $scope.init = new function(){};

            // High light selected payment content if clicked, un-highlight if clicked again
            $scope.selectPaymentContent = function(e, payment_button){

                if(e.target.id == 'learnMoreAffirmBtn') {
                    return;
                }

                var selected = false;

                if (payment_button.type == 'PAY_ALL_TODAY'){
                    selected = !$scope.pay_all_info.selected;
                    $scope.resetSelectedPayment();
                    $scope.pay_all_info.selected = selected;
                }
                else if (payment_button.type == 'PAY_INSTALLMENT'){
                    selected = !$scope.pay_installment_info.selected;
                    $scope.resetSelectedPayment();
                    $scope.pay_installment_info.selected = selected;
                }
                else if (payment_button.type == 'PAY_BY_AFFIRM'){
                    selected = !$scope.pay_affirm_info.selected;
                    $scope.resetSelectedPayment();
                    $scope.pay_affirm_info.selected = selected;
                }

                if(selected){
                    $scope.current_payment_buttons = payment_button.buttons;
                }else{
                    $scope.current_payment_buttons = [];
                }
            };

            $scope.resetSelectedPayment = function(){
                $scope.pay_all_info.selected = false;
                $scope.pay_installment_info.selected = false;
                $scope.pay_affirm_info.selected = false;
            };

            // Call affirm checkout (redirect to affirm website) if button is affirm checkout
            // Redirect to href if button is not affirm checkout
            $scope.selectPaymentMethod = function(payment_button){
                window.location.href = payment_button.href;
            };

            $scope.showHelperContent = function(){
                $('[data-toggle=popover]').popover({
                    html: true,
                    placement: 'top',
                    trigger: 'hover',
                    content: function(){
                        return '<div style="color:black;">' + $($(this).attr('target')).html() + '</div>';
                    }
                });
            };

            // Get and update payment information
            $scope.getPaymentInfo = function(){
                $scope.getPaymentContent();
            };

            // Get payment content
            $scope.getPaymentContent = function () {
                $scope.payment_buttons.forEach(function (payment_button) {
                    if (payment_button.type == 'PAY_ALL_TODAY'){
                        $scope.pay_all_info.as_low_as = payment_button.to_pay_amount;
                        $scope.pay_all_info.discount = payment_button.full_discount_amount;
                        $scope.pay_all_info.can_split_with_friend = payment_button.can_split_with_friend;
                    }
                    else if (payment_button.type == 'PAY_BY_AFFIRM'){
                        $scope.getAndUpdatePayAffirmData(payment_button);
                    }
                    else if (payment_button.type == 'PAY_INSTALLMENT'){
                        $scope.showLayawayPayments(payment_button.to_pay_amount, payment_button.layaway_payments);
                    }
                })
            };

            $scope.getAndUpdatePayAffirmData = function (payment_button) {
                var pay_full_amount = payment_button.to_pay_amount;
                var cents = pay_full_amount * 100;

                if(cents < 5000 || cents > 1750000){
                    $scope.GetAffirmPaymentPlanError(pay_full_amount);
                    return;
                }

                var options = {
                    apr: payment_button.min_apr, // percentage assumed APR for loan
                    months: 12, // can be 3, 6, or 12
                    amount: cents // USD cents
                };

                try{
                    affirm.ui.payments.get_estimate(options, function(payment_estimate){
                        $timeout(function(){
                            $scope.temp = payment_estimate;
                            $scope.pay_affirm_info.months = payment_estimate.months;
                            $scope.pay_affirm_info.starting = parseFloat(payment_estimate.payment/100).toFixed(2);
                            $scope.pay_affirm_info.affirm_month_term = $scope.getAffirmMonthTerms($scope.pay_affirm_info.months);
                            $('#learnMoreAffirmBtn').click(payment_estimate.open_modal);
                        });
                    });
                }catch(ex){
                    $scope.GetAffirmPaymentPlanError(pay_full_amount);
                }
            };

            $scope.GetAffirmPaymentPlanError = function(pay_full_amount){
                $timeout(function(){
                    $scope.pay_affirm_info.months = 1;
                    $scope.pay_affirm_info.starting = parseFloat(pay_full_amount).toFixed(2);
                    $scope.pay_affirm_info.affirm_month_term = $scope.getAffirmMonthTerms(1);
                    $('#learnMoreAffirmBtn').hide();
                });
            };

            $scope.getAffirmMonthTerms = function(months){
                if(months == 1){
                    return '1';
                }

                var result = '3';

                if(months >= 6 ){
                    result += ', 6';
                }

                if(months >= 12 ){
                    result += ', or 12';
                }

                return result;
            };

            $scope.showLayawayPayments = function(to_pay_amount, layaway_payments){
                $scope.pay_installment_info.split_payments = [];
                if(layaway_payments.length > 0){
                    layaway_payments[0].payments.forEach(function (layaway_payment, index) {
                        if(index == 0){
                            var due_today = layaway_payment.pay_amount;
                            $scope.pay_installment_info.due_today = due_today;
                            $scope.pay_installment_info.balance_due = to_pay_amount - due_today;
                        }
                        else{
                            var split_payment = {
                                charge_date: layaway_payment.auto_charge_date,
                                amount_due: layaway_payment.pay_amount
                            };
                            $scope.pay_installment_info.split_payments.push(split_payment);
                        }
                    })
                }
            };

            $scope.$watch(cartService.getToPayAmount, function(to_pay_amount) {
                if ($scope.getPaymentButtonsUrl != '') {
                    $.ajax({
                        url: $scope.getPaymentButtonsUrl,
                        type: 'POST'
                    }).done(function (data) {
                        $timeout(function(){
                            if (data) {
                                $scope.payment_buttons = data;
                                $scope.getPaymentContent();
                            }
                        });
                    });
                }
            });
        }
    ]);
}).call(this);