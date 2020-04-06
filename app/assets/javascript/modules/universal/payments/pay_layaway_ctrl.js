(function() {
    this.app.controller('PayLayawayCtrl', [
        "$scope",
        "cartService",
        function($scope, cartService) {
            $scope.layawayPayments = [];
            $scope.totalPayAmount = 0;
            $scope.getLayawayPaymentsUrl = '';
            $scope.numberOfMembers = 0;
            $scope.emailList = [];
            $scope.MAX_SPLIT_MEMBERS = 0;
            $scope.isValidateSplitmentForm = false;
            $scope.isValidateLaywayForm = false;
            $scope.MINIMUM_PAYMENT_AMOUNT = 0;
            $scope.currentPayAmount = $scope.totalPayAmount;

            $scope.$watch(cartService.getToPayAmount, function (amount) {
                $scope.totalPayAmount = amount;
                $scope.getLayawayPayments();
            });

            $scope.setDefaultPayment = function(){
                if($scope.layawayPayments.length > 0){
                    var layawayPaymentsForBuyer = $scope.layawayPayments[0];
                    layawayPaymentsForBuyer.payments[0].checked = true;
                    layawayPaymentsForBuyer.payments[0].disabled = true;
                    $scope.currentPayAmount = parseFloat(layawayPaymentsForBuyer.payments[0].pay_amount);
                }
            }

            $scope.$watch('numberOfMembers', function (number) {
                if($scope.MAX_SPLIT_MEMBERS == 0)
                    return;

                number = parseInt(number);
                if(number > $scope.MAX_SPLIT_MEMBERS)
                    $scope.numberOfMembers =  $scope.MAX_SPLIT_MEMBERS;
                else if(number < 2)
                    $scope.numberOfMembers = 2;
                if(number > 1 && $scope.totalPayAmount > 0){
                    var emails = [];
                    for(var i = 0; i < number; i++){
                        if($scope.emailList.length > i)
                            emails.push($scope.emailList[i]);
                        else
                            emails.push('');
                    }
                    $scope.emailList = emails;
                    $scope.getLayawayPayments();
                }
            });

            $scope.getLayawayPayments = function(){
                if($scope.getLayawayPaymentsUrl != ''){
                    $.ajax({
                        url: $scope.getLayawayPaymentsUrl,
                        data: {number_of_members: $scope.numberOfMembers},
                        type: 'POST',
                        beforeSend: function (xhr) {
                            $(document).unbind("ajaxSend");
                        }
                    }).done(function(data){
                        if(data.return_url != ''){
                            window.location.href = data.return_url;
                        }
                        else if(data.message != ''){
                            $scope.numberOfMembers = 2;
                            $scope.$apply();
                            if(!$(".bootbox ").is(':visible'))
                                bootbox.alert("<p class='center'>" + data.message + "</p>");
                        }
                        else{
                            $scope.layawayPayments = data.layaway_payments;
                            $scope.setDefaultPayment();
                            $scope.$apply();
                        }

                        $(document).bind("ajaxSend");
                    });
                }
            }

            $scope.chooseLayawayPayment = function($event, layawayPayment){
                layawayPayment.checked = $(angular.element($event.target)).is(':checked');
                if(layawayPayment.checked ){
                    $scope.currentPayAmount += parseFloat(layawayPayment.pay_amount);
                }
                else{
                    $scope.currentPayAmount -= parseFloat(layawayPayment.pay_amount);
                }
            };

            $scope.serialize = function(fieldName) {
                return angular.toJson($scope[fieldName]);
            };

            $scope.serializeBuyerPayments = function() {
                if ($scope.layawayPayments.length > 0)
                    return angular.toJson($scope.layawayPayments[0].payments);

                return '';
            };

            $("#credit-card-form button[type='submit']").click(function(e){
                if($scope.numberOfMembers > 1) {
                    e.preventDefault();
                    //email duplicate
                    var emails_temp = $scope.emailList.slice(0);
                    $.unique(emails_temp)
                    if (emails_temp.length < $scope.emailList.length) {
                        $("span[ng-bind='errorMessage']").text("Please input valid email addresses.");
                        return false;
                    }
                    //email validation
                    invalid_emails = jQuery.grep($scope.emailList, function (email) {
                        return !isValidEmail(email);
                    });
                    if (invalid_emails.length > 0) {
                        $("span[ng-bind='errorMessage']").text("Please input valid email addresses.");
                        return false;
                    }
                    $(this).parents('form').submit();
                }
            });

            $scope.backSplitmentForm = function(e){
                $scope.isValidateSplitmentForm = false;
                $('html, body').animate({scrollTop:$('#split-payment-form-header').position().top - 70}, 'slow');
            };

            $scope.nextSplitmentForm = function(){
                $scope.isValidateSplitmentForm = $scope.validateSplitment();
            };

            $scope.validateLayaway = function(){
                if($scope.isValidateSplitmentForm){
                    if ($scope.layawayPayments.length > 0){
                        invalid_layaway_payments = $.grep($scope.layawayPayments[0].payments, function (layawayPayment){
                            return layawayPayment.checked == true;
                        });
                        if (invalid_layaway_payments.length > 0){
                            return true;
                        }else{
                            bootbox.alert("Please choose at least one layaway payment.");
                            return false;
                        }
                    }else{
                        bootbox.alert("Please choose at least one layaway payment.");
                        return false;
                    }
                }else{
                    return false;
                }
            };

            $scope.validateSplitment = function(){
                if($scope.numberOfMembers > 1) {
                    //email duplicate
                    var emails_temp = $scope.emailList.slice(0);
                    $.unique(emails_temp)
                    if (emails_temp.length < $scope.emailList.length) {
                        bootbox.alert("Some of your friend's emails are duplicated.");
                        return false;
                    }
                    //email validation
                    invalid_emails = jQuery.grep($scope.emailList, function (email) {
                        return !isValidEmail(email);
                    });
                    if (invalid_emails.length > 0) {
                        bootbox.alert("Please input valid email addresses.");
                        return false;
                    }
                    return true;
                }else{
                    bootbox.alert("Please input valid email addresses.");
                    return false;
                }
            };

            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
        }
    ]);
}).call(this);
