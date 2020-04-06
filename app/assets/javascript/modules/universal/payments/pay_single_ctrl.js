(function() {
	this.app.controller('PaySingleCtrl', [
		"$scope",
		"cartService",
		function($scope, cartService) {
			$scope.maximumLengthOfStay = 100;

			$scope.getToPayAmount = function () {
				return cartService.getToPayAmount();
			};

			JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
		}
	]);
}).call(this);
