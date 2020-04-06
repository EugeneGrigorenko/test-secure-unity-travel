(function() {
    this.app.controller('UpdatePassportFromConvertPackageCtrl', [
        "$scope",
        function($scope) {
            $scope.is_admin = false;
            $scope.current_step = 1;
            $scope.pp_properties = [];
            $scope.submit_url = '';
            $scope.can_submit = false;
            $scope.date_of_birth_setting = {
                firstItem: 'name',
                minYear: (new Date()).getFullYear() - 100,
                maxYear: (new Date()).getFullYear()
            };

            $scope.expiration_date_setting = {
                firstItem: 'name',
                maxYear: (new Date()).getFullYear() + 20,
                minYear: (new Date()).getFullYear()
            };

            $scope.init = new function(){};

            //Convert spec to real flight
            $scope.setCurrentStep = function(step){
                $scope.current_step = step;
            };

            $scope.updateLegalInformation = function(){
                if($scope.validatePassportProperties()){
                    $.ajax({
                        type: "POST",
                        data: {'pp_properties': JSON.stringify($scope.pp_properties)},
                        url: $scope.update_legal_information_url,
                        success: function (result) {
                            $scope.$apply(function() {
                                $scope.current_step = 2;
                            });
                        }
                    });
                }else{
                    bootbox.alert("Please input required field");
                }
            };

            $scope.selectFlight = function(flight_slug){
                bootbox.hideAll();
                bootbox.confirm('Please click OK to confirm your flight selection or CANCEL to select another available flight.', function (confirmed) {
                    if (confirmed) {
                        $scope.submit_url = $scope.submit_url.replace('flight_slug', flight_slug);
                        $.ajax({
                            type: "POST",
                            data: {},
                            url: $scope.submit_url,
                            success: function (result) {
                                bootbox.alert(result.message);
                                $('#convert_form').closest('.modal').modal('hide');
                                wiselinks.load($scope.return_url);
                            }
                        });
                    }
                });
            };

            //Convert package to hotel & flight
            $scope.submitConvertPackage = function(){
                if($scope.is_admin || $scope.validatePassportProperties()){
                    $.ajax({
                        type: "POST",
                        data: {'pp_properties': JSON.stringify($scope.pp_properties)},
                        url: $scope.submit_url,
                        success: function (result) {
                            bootbox.alert(result.message);
                            $('#convert_form').closest('.modal').modal('hide');
                            wiselinks.load($scope.return_url);
                        }
                    });
                }else{
                    bootbox.alert("Please input required field");
                }
            };

            $scope.validatePassportProperties = function(){
                for(var i = 0; i < $scope.pp_properties.length; i++){
                    if($scope.pp_properties[i].required == true && ($scope.pp_properties[i].value === '' || $scope.pp_properties[i].value === null)){
                        return false;
                    }
                }
                return true;
            };
        }
    ]);
}).call(this);