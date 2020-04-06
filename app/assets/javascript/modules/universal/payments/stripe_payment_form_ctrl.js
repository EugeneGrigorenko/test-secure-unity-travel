(function() {
        this.app.controller('StripePaymentFormCtrl', [
                "$scope",
                "cartService",
                function($scope, cartService) {
                        var target;

                        // Custom styling can be passed to options when creating an Element.
                        var stripeCardStyles = {
                                iconStyle: "solid",
                                style: {
                                        base: {
                                                iconColor: "#8898AA",
                                                color: "#757575",
                                                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                                                fontSize: "16px",
                                                fontSmoothing: "antialiased",

                                                ":-webkit-autofill": {
                                                        color: "#fce883"
                                                }
                                        },
                                        invalid: {
                                                iconColor: "red",
                                                color: "red"
                                        }
                                }
                        };

                        // Create an instance of the card Element.
                        var stripeElementsCard = stripe.elements().create('card', stripeCardStyles);

                        $scope.isSubmitButtonDisabled = true;
                        $scope.errorMessage = '';
                        $scope.payment_customer_name = '';
                        $scope.selectableQuantities = [];

                        $scope.agree_privacy_term = false;
                        $scope.agree_acknowledgement_of_risk = false;

                        $scope.billing_address = {};

                        $scope.shipping_address = {};

                        $scope.countries = [];
                        $scope.states = [];

                        $scope.name = '';

                        $scope.getToPayAmount = function () {
                                return cartService.getToPayAmount();
                        };

                        var errorElement = document.getElementById('card-errors');
                        $scope.init = function() {
                                // Add an instance of the card Element into the `card-element` <div>.
                                stripeElementsCard.mount('#card-element');

                                stripeElementsCard.addEventListener('change', function(event) {
                                        if (event.error) {
                                                errorElement.textContent = event.error.message;
                                        } else {
                                                errorElement.textContent = '';
                                        }
                                });
                        };
                        $scope.init();

                        function stripeTokenHandler(token) {
                                var form = document.getElementById('credit-card-form');

                                if (form.shipping_address_first_name != undefined) {

                                        $scope.shipping_address = {
                                                shipping_address: {
                                                        first_name: form.shipping_address_first_name.value,
                                                        last_name: form.shipping_address_last_name.value,
                                                        address_attributes: {
                                                                line_1: form.shipping_address_line_1.value,
                                                                line_2: form.shipping_address_line_2.value,
                                                                city: form.shipping_address_city.value,
                                                                zip: form.shipping_address_zip.value,
                                                                state_id: form.shipping_address_state.value,
                                                                country_id: form.shipping_address_country.value
                                                        }
                                                }
                                        }

                                        $.ajax({
                                                url: $scope.update_primary_shipping_address_path,
                                                data: $scope.shipping_address,
                                                type: 'POST',
                                                async: false
                                        })
                                }

                                // Insert the token ID into the form so it gets submitted to the server
                                var hiddenInput = document.createElement('input');
                                hiddenInput.setAttribute('type', 'hidden');
                                hiddenInput.setAttribute('name', 'stripeToken');
                                hiddenInput.setAttribute('value', token.id);
                                form.appendChild(hiddenInput);

                                form.submit();
                        }

                        function createToken() {
                                var stripeCustomInfo = {
                                        name: $scope.name
                                }

                                stripe.createToken(stripeElementsCard, stripeCustomInfo).then(function(result) {
                                        if (result.error) {
                                                // Inform the user if there was an error
                                                errorElement.textContent = result.error.message;
                                                $scope.validateSubmitButtonStatus();
                                                $('.lockModal').hide();
                                        } else {
                                                // Send the token to your server
                                                stripeTokenHandler(result.token);
                                        }
                                });
                        };

                        $scope.$watch('agree_privacy_term', function(value) {
                                $scope.validateSubmitButtonStatus();
                        });

                        $scope.$watch('agree_acknowledgement_of_risk', function(value) {
                                $scope.validateSubmitButtonStatus();
                        });

                        $scope.$watch('pp_properties', function(value) {
                                $scope.validateSubmitButtonStatus();
                        }, true);

                        $scope.validateSubmitButtonStatus = function() {
                                var passport_properties = $scope.validatePassportProperties();
                                if(!passport_properties){
                                        $scope.errorMessage = 'Your legal and/or passport information is missing';
                                        $scope.isSubmitButtonDisabled = true;
                                        return;
                                }

                                if(!$scope.agree_privacy_term){
                                        $scope.errorMessage = 'Privacy & Term is not confirmed';
                                        $scope.isSubmitButtonDisabled = true;
                                        return;
                                }

                                if(!$scope.agree_acknowledgement_of_risk){
                                        $scope.errorMessage = 'Acknowledgement of Risk is not confirmed';
                                        $scope.isSubmitButtonDisabled = true;
                                        return;
                                }

                                $scope.isSubmitButtonDisabled = false;
                        };

                        $scope.submit = function(e) {
                                target = $(e.target);
                                e.preventDefault();

                                if ($scope.validateExtraPaymentInfo && !$scope.validateExtraPaymentInfo()) {
                                        return;
                                }

                                $scope.isSubmitButtonDisabled = true;
                                $('.lockModal').show();
                                if ($scope.getToPayAmount != 0) {
                                        createToken();
                                } else {
                                        stripeTokenHandler('1');
                                }
                        };

                        $scope.validatePassportProperties = function(){
                                for(var i = 0; i < $scope.pp_properties.length; i++){
                                        if($scope.pp_properties[i].required == true && ($scope.pp_properties[i].value === '' || $scope.pp_properties[i].value === null)){
                                                return false;
                                        }
                                }
                                return true;
                        };
                }
        ]);
}).call(this);
