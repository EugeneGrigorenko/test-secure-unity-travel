(function() {
    this.app.controller('offlineCheckinCtrl', [
        "$scope",'$timeout',
        function($scope, $timeout) {
            $scope.confirm_number_type = true;
            $scope.current_step = 1;
            $scope.user = {};
            $scope.checkin_items = [];
            $scope.agree_risk = false;
            $scope.location_id = null;

            $scope.init = new function(){};

            $scope.validate = function(){
                var is_valid = false;

                if(!$scope.agree_risk){
                    return is_valid;
                }

                if($scope.current_step == 3 && $scope.require_checkin_location && ($scope.location_id == null || $scope.location_id == '')){
                    return is_valid;
                }

                if($scope.confirm_number_type){
                    return $scope.license_number != null && $scope.license_number != ''
                        && $scope.license_state_id != null && $scope.license_state_id != '';
                }else{
                    return $scope.passport_number != null && $scope.passport_number != ''
                        && $scope.passport_country_id != null && $scope.passport_country_id != '';
                }

                return is_valid;
            };

            $scope.doOfflineCheckinSubmit = function(){
                var option = {location_id: $scope.location_id, confirm_number_type: $scope.confirm_number_type};
                if($scope.confirm_number_type){
                    option.license_number = $scope.license_number;
                    option.license_state_id = $scope.license_state_id;
                }else{
                    option.passport_number =  $scope.passport_number;
                    option.passport_country_id = $scope.passport_country_id;
                }

                $.post($scope.submit_url, option, function(rs){
                    bootbox.alert(rs.message);
                    if(rs.is_successful){
                        wiselinks.load('/my-profile');
                    }
                });
            };
        }
    ]);
}).call(this);