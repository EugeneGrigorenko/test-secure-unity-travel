(function() {
	this.app.controller('EditVendorCtrl', [
		"$scope",
		function($scope) {			
            $scope.default_properties = [];
            $scope.default_images = [];

            $scope.sortDefaultProperties = function(){
                for (i = 0; i<$scope.default_properties.length; i++){
                    $scope.default_properties[i].priority = i + 1;
                }
            };

            $scope.movePriorityUp = function (index) {
                var array = $scope.default_properties;
                var tmpItem = array[index - 1];
                array[index - 1] = array[index];
                array[index] = tmpItem;
                $scope.sortDefaultProperties();
            };

            $scope.movePriorityDown = function (index) {
                var array = $scope.default_properties;
                var tmp = array[index + 1];
                array[index + 1] = array[index];
                array[index] = tmp;
                $scope.sortDefaultProperties();
            };

			$scope.addDefaultProperty = function() {
                item = { key: '', value: '', priority: 0};
				$scope.default_properties.splice(0, 0, item);
			};
			
			$scope.deleteDefaultProperty = function(default_property) {
				var index = $.inArray(default_property, $scope.default_properties);
				if (index > -1) {
					$scope.default_properties.splice(index, 1);
				}
                $scope.sortDefaultProperties();
			};
			
			$scope.deleteDefaultImage = function(default_image) {
				var index = $.inArray(default_image, $scope.default_images);
				if (index > -1) {
                    bootbox.confirm(
                        '<p class="center">Are you sure you want to delete this image?</p>',
                        function (result) {
                            if (result) {
                                $scope.$apply(function(){
                                    $scope.default_images.splice(index, 1);
                                });
                            }
                        }
                    );
				}
			};
			
			$scope.serialize = function(fieldName) {
				return angular.toJson($scope[fieldName]);
			};
		}
	]);
}).call(this);
