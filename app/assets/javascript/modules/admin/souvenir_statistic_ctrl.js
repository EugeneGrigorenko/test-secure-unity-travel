(function() {
    this.app.controller('SouvenirStatisticCtrl', [
        "$scope",
        function($scope) {
            $scope.detail_statistic_url = '';
            $scope.event_ids = '';
            $scope.has_detail = false;
            $scope.data = [];

            $scope.init = new function(){};

            $scope.show_details = function(seller){
                seller.show = !seller.show;

                if (seller.show && seller.details && seller.details.length == 0){
                    var get_details_url = $scope.detail_statistic_url + '?admin_id=' + seller.admin_id;
                    if($scope.event_ids){
                        get_details_url += '&event=' + $scope.event_ids;
                    }
                    $.post(get_details_url, {}, function(result){
                        if(result.is_successful){
                            $scope.$apply(function(){
                                seller.details = result.details;
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