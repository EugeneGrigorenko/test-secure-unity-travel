(function() {
    this.app.controller('UpdatePassportFromUserProfileCtrl', [
        "$scope",
        function($scope) {
            $scope.pp_properties = [];
            $scope.submit_url = '';
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
            $scope.updatePassport = function(){
                if($scope.validatePassportProperties()){
                    $.ajax({
                        type: "POST",
                        data: {'pp_properties': JSON.stringify($scope.pp_properties)},
                        url: $scope.submit_url,
                        success: function (result) {
                            bootbox.alert(result.message);
                            wiselinks.load();
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