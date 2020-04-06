(function() {
    this.app.controller('EditEventCtrl', [
        "$scope",
        function($scope) {
            $scope.profileImage = null;
            $scope.slideImages = [];
            $scope.videos = [];
            
            function moveFileUp(array, index) {
                var tmpItem = array[index - 1];
                array[index - 1] = array[index];
                array[index] = tmpItem;
            }
            
            function moveFileDown(array, index) {
                var tmp = array[index + 1];
                array[index + 1] = array[index];
                array[index] = tmp;
            }
            
            $scope.moveImageUp = function(index) {
                moveFileUp($scope.slideImages, index);
            };
            
            $scope.moveImageDown = function(index) {
                moveFileDown($scope.slideImages, index);
            };
            
            $scope.removeImage = function(index) {
                if (confirm("Are you sure?")) {
                    $scope.slideImages.splice(index, 1);
                }
            };
            
            $scope.moveVideoUp = function(index) {
                moveFileUp($scope.videos, index);
            };
            
            $scope.moveVideoDown = function(index) {
                moveFileDown($scope.videos, index);
            };

            $scope.removeVideo = function(index) {
                if (confirm("Are you sure?")) {
                    $scope.videos.splice(index, 1);
                }
            };
        }
    ]);
}).call(this);