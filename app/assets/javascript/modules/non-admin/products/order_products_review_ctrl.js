(function() {
    this.app.controller('OrderProductsReviewCtrl', [
        "$scope",
        function($scope) {
            $scope.products = [];
            $scope.postReviewsUrl = '';
            $scope.redirectUrl = '';
            $scope.posted_reviews = [];
            $scope.error = '';

            $scope.validate = function(){
                $scope.posted_reviews = $.grep($scope.products, function(p){ return p.stars > 0 && p.stars < 6 && p.review != '' });
                var err_message = 'Please rate and review at least one product.';

                if($scope.posted_reviews.length == 0) {
                    $scope.error = err_message;
                    return false;
                }

                for(var i = 0; i < $scope.products.length; i++) {
                    var p = $scope.products[i];
                    if((p.stars > 0 && p.review == '') || (p.stars == 0 && p.review != '')) {
                        $scope.error = err_message;
                        return false;
                    }
                }

                return true;
            };
            
            $scope.postReviews = function(){
                $.post($scope.postReviewsUrl, 
                       { posted_reviews: angular.toJson($scope.posted_reviews) },
                       function(result){
                           $scope.$apply(function(){
                              $scope.submitDisabled = false; 
                           });

                           bootbox.alert(result.message);
                           if (!result.is_successful) {
                              return; 
                           }
                           
                           window.location.href = $scope.redirectUrl;
                       }, 'json'
                ).error(function(){
                    $scope.$apply(function(){
                      $scope.submitDisabled = false; 
                    });
                    bootbox.alert('An error occurred when posting reviews.');
                });
            };
        }
    ]);
}).call(this);
