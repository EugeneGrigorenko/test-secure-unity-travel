(function() {
    this.app.controller('PayFullCtrl', [
        "$scope",
        function($scope) {
            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
        }
    ]);
}).call(this);
        