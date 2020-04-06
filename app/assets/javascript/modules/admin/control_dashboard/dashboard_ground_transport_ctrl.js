(function () {
    this.app.controller('DashboardGroundTransportCtrl', [
        "$scope",
        function ($scope) {
            $scope.selected_event = {};
            $scope.data = {};

            $scope.init = new function(){};

            $scope.show_passengers = function(flight){
                flight.show = !flight.show;

                if (flight.show && flight.passengers.length == 0){
                    var get_passengers_url = '/group_travel_control_dashboards/' + $scope.selected_event.id + '/' + flight.product_id + '/get-passengers';
                    $.post(get_passengers_url, {}, function(result){
                        if(result.is_successful){
                            $scope.$apply(function(){
                                flight.passengers = result.passengers;
                            });
                        }else{
                            bootbox.alert(result.message);
                        }
                    });
                }
            };
        }
    ]);
}).call(this);