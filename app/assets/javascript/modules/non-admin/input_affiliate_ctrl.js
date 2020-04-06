(function() {
    this.app.controller('InputAffiliateCtrl', [
        "$scope",
        "cartService",
        function($scope) {
            $scope.addAffiliateUrl = '';
            $scope.removeAffiliateUrl = '';
            $scope.havingAffiliate = false;
            $scope.inputAffiliate = null;
            $scope.errorMessage = null;
            $scope.validAffiliate = null;
            $scope.canApplyAffiliate = false;
            $scope.affiliateName = '';


            $scope.$watch('havingAffiliate', function(value, oldValue) {
                if(oldValue && !value) $scope.removeAffiliate();
            });

            $scope.addAffiliate = function(){
                $.post($scope.addAffiliateUrl, { vanity_url: $scope.inputAffiliate}, function(result){});
            };
            
            $scope.removeAffiliate = function() {
                $.post($scope.removeAffiliateUrl, { vanity_url: $scope.validAffiliate}, function(result){
                    if(result.is_successful) {
                        $scope.$apply(function(){
                            $scope.havingAffiliate = false;
                            $scope.validAffiliate = null;
                            $scope.inputAffiliate = null;
                        });
                        $('#affiliate-bar').remove();
                        $('#affiliate-padding').remove();
                        $('.navbar-fixed-top').css({'top' : '0px'});
                    }
                }).error(function(){
                    $scope.$apply(function(){
                        $scope.errorMessage = 'An error occurred. Please try again!';
                    });
                });
            };
        }
    ]);
}).call(this);