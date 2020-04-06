(function() {
        this.app.controller('PayAffirmCtrl', [
                "$scope",
                "cartService",
                function($scope, cartService) {
                        $scope.isSubmitButtonDisabled = true;
                        $scope.errorMessage = '';
                        $scope.affirm_data = {};
                        $scope.shipping_address = {};
                        $scope.countries = [];
                        $scope.states = [];

                        JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);

                        $scope.getToPayAmount = function () {
                                return cartService.getToPayAmount();
                        };

                        $scope.$watch('pp_properties', function(){
                                $scope.validate();
                        }, true);

                        $scope.$watch('shipping_address', function(){
                                $scope.validate();
                        }, true);

                        $scope.$watch('phone', function(){
                                $scope.validate();
                        });

                        $scope.validate = function(){
                                $scope.errorMessage = '';
                                $scope.isSubmitButtonDisabled = true;

                                for(var i = 0; i < $scope.pp_properties.length; i++){
                                        if($scope.pp_properties[i].required && ($scope.pp_properties[i].value === '' || $scope.pp_properties[i].value === null)){
                                                $scope.errorMessage = 'Your legal and/or passport information is missing required data!';
                                                return false;
                                        }
                                }

                                for( var key in $scope.shipping_address){
                                        if ([null, ''].indexOf($.trim($scope.shipping_address[key])) > -1 && ['line_2'].indexOf(key) < 0){
                                                $scope.errorMessage = 'Your shipping address is missing required data!';
                                                return false;
                                        }
                                };

                                if ($.trim($scope.phone) == ''){
                                        $scope.errorMessage = 'Please input your phone number.';
                                        return false;
                                }
                                $scope.isSubmitButtonDisabled = false;
                        };

                        $scope.back = function () {
                                window.location.href = $scope.back_path;
                        };

                        // Call affirm checkout (redirect to affirm website) if button is affirm checkout
                        // Redirect to href if button is not affirm checkout
                        $scope.payWithAffirm = function(){
                                if (!$scope.isSubmitButtonDisabled){
                                        var school = '';
                                        var organization = '';
                                        if ($scope.school != null && $scope.organization != null){
                                                if ($scope.school.name == "Other") {
                                                        school = $scope.other_school;
                                                }else if ($scope.school.name == "Select a School" || $scope.school.name == "Select a Group"){
                                                        school = '';
                                                }else{
                                                        school =  $scope.school.name;
                                                }

                                                if ($scope.organization.name == "Other"){
                                                        organization =  $scope.other_organization;
                                                }else if ($scope.organization.name == "Select an Organization"){
                                                        organization = '';
                                                }else{
                                                        organization =  $scope.organization.name;
                                                }
                                        }

                                        var buyer_info = {};
                                        buyer_info.phone = $scope.phone;
                                        buyer_info.shool = school;
                                        buyer_info.organization = organization;
                                        buyer_info.passport = $scope.pp_properties;
                                        buyer_info.shipping_address = $scope.shipping_address;

                                        if ($scope.update_buyer_info_path != '') {
                                                $.ajax({
                                                        url: $scope.update_buyer_info_path,
                                                        data: buyer_info,
                                                        type: 'POST'
                                                }).done(function (rs) {
                                                        if (rs.success) {
                                                                $scope.affirm_data.shipping.name.first = $scope.shipping_address.first_name;
                                                                $scope.affirm_data.shipping.name.last = $scope.shipping_address.last_name;
                                                                $scope.affirm_data.shipping.address.line1 = $scope.shipping_address.line_1;
                                                                $scope.affirm_data.shipping.address.line2 = $scope.shipping_address.line_2;
                                                                $scope.affirm_data.shipping.address.city = $scope.shipping_address.city;
                                                                $scope.affirm_data.shipping.address.state = $scope.shipping_address.state.abbr;
                                                                $scope.affirm_data.shipping.address.country = $scope.shipping_address.country.abbr;
                                                                $scope.affirm_data.shipping.address.zipcode = $scope.shipping_address.zip_code;

                                                                var to_pay_amount = $scope.getToPayAmount() * 100;
                                                                $scope.affirm_data.total = to_pay_amount;
                                                                $scope.affirm_data.items[0].unit_price = to_pay_amount;
                                                                $scope.affirm.checkout($scope.affirm_data);
                                                                $scope.affirm.checkout.post();
                                                        }else{
                                                                bootbox.alert(rs.message);
                                                        }
                                                });
                                        }
                                }
                        };
                }
        ]);
}).call(this);
