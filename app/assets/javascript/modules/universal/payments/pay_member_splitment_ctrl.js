(function() {
    this.app.controller('PayMemberSplitmentCtrl', [
        "$scope",
        function($scope) {
            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
        }
    ]);
}).call(this);
        