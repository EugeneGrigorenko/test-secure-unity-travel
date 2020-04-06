(function() {
    this.app.controller('ProductReviewsCtrl', [
        "$scope",
        function($scope) {
            $scope.averageRating = 2;
            $scope.newRating = 0;
            $scope.newReview = null;
            $scope.reviews = [];
            $scope.postReviewUrl = '';
            $scope.loadReviewsUrl = '';
            $scope.page = 1;
            $scope.totalPages = 1;
            $scope.canPostNewReview = false;
            $scope.loadingReviews = false;
            $scope.saveButtonDisabled = false;
            $scope.totalReviews = 0;
            
            $scope.loadReviews = function(nextPage){                
                $scope.loadingReviews = true;
                if(nextPage) {
                    $scope.page += 1;
                }
                
                $.get($scope.loadReviewsUrl, { page: $scope.page}, function(result){
                   $scope.$apply(function(){
                       $scope.totalPages = result.total_pages;
                       $scope.totalReviews = result.total_reviews;
                       if ($scope.page > $scope.totalPages) {
                           $scope.page = $scope.totalPages;
                           loadReviews();
                           return;
                       }
                       $scope.reviews.push.apply($scope.reviews, result.reviews);
                       $scope.loadingReviews = false;
                   });
                }, 'json').error(function(){
                    $scope.$apply(function(){
                        $scope.loadingReviews = false;
                        if (nextPage) {
                            $scope.page -= 1;
                        }
                    });
                });
            };
            
            $scope.postReview = function() {
                var data;
                
                if (!$scope.newRating) {
                    bootbox.alert('Please rate by clicking on the stars.');
                    return;
                }
                $scope.saveButtonDisabled = true;
                
                data = {
                    'product_review[stars]': $scope.newRating,
                    'product_review[review]': $scope.newReview
                };
                
                $.post($scope.postReviewUrl, data,
                    function(result) {
                        $scope.$apply(function(){
                           $scope.saveButtonDisabled = false; 
                        });
                        
                        if (!result.is_successful) {
                            bootbox.alert("An error occurred while posting your review.");
                            return;
                        }
                        
                        $scope.$apply(function(){
                            $scope.page = 1;
                            $scope.canPostNewReview = false;
                        });
                        $scope.reviews = [];
                        $scope.page = 1;
                        $scope.loadReviews();
                    }, 
                    'json'
                ).error(function(){
                    $scope.$apply(function(){
                       $scope.saveButtonDisabled = false; 
                    });
                    bootbox.alert("An error occurred while posting your review.");
                });
            };
            
            $scope.editReview = function(review) {
                $scope.newRating = review.stars;
                $scope.newReview = review.review;
                review.isEditing = true;
            };
            
            $scope.cancelEditing = function(review) {
                review.isEditing = false;
            };
            
            $scope.loadNextPage = function (){
                $scope.loadReviews(true);  
            };
        }
    ]);
}).call(this);