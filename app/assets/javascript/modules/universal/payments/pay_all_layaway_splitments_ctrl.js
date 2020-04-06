(function() {
    this.app.controller('PayAllLayawaySplitmentsCtrl', [
        "$scope",
        "cartService",
        function($scope, cartService) {
            $scope.layawaySplitments = [];
            $scope.totalPayAmount = 0;
            $scope.currentPayAmount = 0;

            $scope.setDefaultPayment = function(){
                if($scope.layawaySplitments.length > 0){
                    $scope.layawaySplitments[0].checked = true;
                    $scope.layawaySplitments[0].disabled = true;
                    $scope.currentPayAmount = parseFloat($scope.layawaySplitments[0].shared_price);
//                    if($scope.layawaySplitments.length > 1){
//                        $scope.layawaySplitments[1].disabled = false;
//                    }
                }
            }
            $scope.chooseLayawaySplitment = function($event, layawaySplitment){
                layawaySplitment.checked = $(angular.element($event.target)).is(':checked');
                if(layawaySplitment.checked ){
                    $scope.currentPayAmount += parseFloat(layawaySplitment.shared_price);
                }
                else{
                    $scope.currentPayAmount -= parseFloat(layawaySplitment.shared_price);
                }
            };

            $scope.serialize = function(fieldName) {
                return angular.toJson($scope[fieldName]);
            };
            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
        }
    ]);
}).call(this);
        