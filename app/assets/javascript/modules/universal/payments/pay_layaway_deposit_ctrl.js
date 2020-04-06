(function() {
    this.app.controller('PayLayawayDepositCtrl', [
        "$scope",
        "cartService",
        function($scope, cartService) {
            $scope.layawayPayments = [];
            $scope.totalPayAmount = 0;
            $scope.currentPayAmount = $scope.totalPayAmount;

            $scope.setDefaultPayment = function(){
                if($scope.layawayPayments.length > 0){
                    var layawayPaymentsForBuyer = $scope.layawayPayments[0];
                    layawayPaymentsForBuyer.payments[0].checked = true;
                    layawayPaymentsForBuyer.payments[0].disabled = true;
                    $scope.currentPayAmount = parseFloat(layawayPaymentsForBuyer.payments[0].pay_amount);
                }
            }

            $scope.serialize = function(fieldName) {
                return angular.toJson($scope[fieldName]);
            };

            $scope.serializeBuyerPayments = function() {
                if ($scope.layawayPayments.length > 0)
                    return angular.toJson($scope.layawayPayments[0].payments);

                return '';
            };

            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
        }
    ]);
}).call(this);
