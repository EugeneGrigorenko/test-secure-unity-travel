(function() {
    this.app.controller('PassportPropertyCtrl', [
        "$scope",
        function($scope) {
            $scope.selected_properties = [];
            $scope.property_list = [];
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
            $scope.remove = function(scp){
                scp.selected = false;
            };
            $scope.$watch('property_list', function(newValue) {
                if (newValue.length) {
                    $scope.selected_properties = [];
                    $.each(newValue, function (key, value) {
                        if(value.selected && value.selected == true){
                            $scope.selected_properties.push(value);
                        }else{
                            value.required = false;
                        }
                    });
                }
            }, true);
        }
    ]);
}).call(this);