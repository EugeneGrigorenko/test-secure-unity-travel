(function() {
    this.app.controller('SchoolOrganizationCtrl', [
        "$scope", '$window', "cartService",
        function($scope, $window, cartService) {
            $scope.isRedeem = false;

            $scope.init = function () {};

            $scope.$watch('other_school', function(newValue) {
                $scope.add_school_and_organization_to_hidden_field();
            });

            $scope.$watch('other_organization', function(newValue) {
                $scope.add_school_and_organization_to_hidden_field();
            });

            $scope.$watch('school', function(newValue) {
                $scope.add_school_and_organization_to_hidden_field();
            });

            $scope.$watch('organization', function(newValue) {
                $scope.add_school_and_organization_to_hidden_field();
            });

            $scope.add_school_and_organization_to_hidden_field = function(){
                var school = '';
                var organization = '';
                if ($scope.school != null && $scope.organization != null){
                    if ($scope.school.name == "Other") {
                        school = $scope.other_school;
                    }else if ($scope.school.name == "Select a School" || $scope.school.name == "Select a Group"){
                        school = '';
                    }else{
                        school =  $scope.school.name;
                    }

                    if ($scope.organization.name == "Other"){
                        organization =  $scope.other_organization;
                    }else if ($scope.organization.name == "Select an Organization"){
                        organization = '';
                    }else{
                        organization =  $scope.organization.name;
                    }
                }
                if($scope.isRedeem){
                    $('#user_school').val(school);
                    $('#user_organization').val(organization);
                }else{
                    $('#inquiry_school').val(school);
                    $('#inquiry_organization').val(organization);
                }
            };
            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
        }
    ]);
}).call(this);