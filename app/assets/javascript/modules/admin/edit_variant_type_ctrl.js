(function() {
	this.app.controller('EditVariantTypeCtrl', [
		"$scope",
		function($scope) {
			$scope.variants = [];
			
			$scope.setVariants = function(variants) {
				if (variants) {
					$scope.variants = variants;
				} else {
					$scope.variants = [];
				}
			};
			
			$scope.addVariant = function() {
				$scope.variants.push({ name: '' });
			};
			
			$scope.deleteVariant = function(variant) {
				var index = $.inArray(variant, $scope.variants);
				if (index === -1) {
				    return;
				}
				
				bootbox.confirm("<p>Are you sure you want to delete this variant?</p>", function(result) {
				    if(result) {
				        $scope.$apply(function(){
				            $scope.variants.splice(index, 1);
				        });
				    }
				});
			};
			
			$scope.serializeVariants = function() {
				return angular.toJson($scope.variants);
			};
		}
	]);
}).call(this);