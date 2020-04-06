(function() {
    this.app.controller('PayZeroCtrl', [
        "$scope",
        "cartService",
        function($scope, cartService) {
            $scope.isSubmitButtonDisabled = true;
            $scope.errorMessage = '';

            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);

            $scope.$watch('pp_properties', function(value){
                $scope.validateSubmitButtonStatus();
            }, true);

            $scope.getToPayAmount = function () {
                return cartService.getToPayAmount();
            };

            $scope.validateSubmitButtonStatus = function(){
                $scope.isSubmitButtonDisabled = !$scope.validatePassportProperties();
            };

            $scope.submit = function() {
                if (!$scope.validateExtraPaymentInfo()) return;
                $('.lockModal').show();
                $('#zero_payment_form').submit();
            };

            $scope.validatePassportProperties = function(){
                for(var i = 0; i < $scope.pp_properties.length; i++){
                    if($scope.pp_properties[i].required == true && ($scope.pp_properties[i].value === '' || $scope.pp_properties[i].value === null)){
                        $scope.errorMessage = "Your legal and/or passport information is missing";
                        return false;
                    }
                }
                $scope.errorMessage = '';
                return true;
            };
        }
    ]);
}).call(this);