(function() {
	this.app.controller('SchoolScheduleCtrl', [
		"$scope", '$window',
		function($scope, $window) {
            $scope.school_schedules = [];
            $scope.school_years = [];
            $scope.school_year = '';
            $scope.fillter_school_schedule_url = '';

            $scope.init = function(){};

            $scope.fillter = function(){
                if($scope.school_year){
                    $.ajax({
                        url: $scope.fillter_school_schedule_url,
                        data: {school_year: $scope.school_year.value},
                        type: 'POST',
                        async: false,
                        success: function(data){
                            $scope.school_schedules = data;
                        }
                    });
                }
            };

            $scope.$watch('school_years', function(value){
                $scope.school_year = $scope.school_years[0];
                $scope.fillter();
            });
		}
	]);
}).call(this);