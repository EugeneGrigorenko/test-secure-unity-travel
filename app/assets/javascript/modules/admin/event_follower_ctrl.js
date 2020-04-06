(function() {
    this.app.controller('EventFollowerCtrl', [
        "$scope",
        function($scope) {
            $scope.update_url = '';
            $scope.follower_users = [];
            $scope.actions = [];
            $scope.init = new function(){
            };

            $scope.update_follower = function(){
                if($scope.follower_users.length){
                    $.ajax({
                        type: "POST",
                        url: $scope.update_url,
                        data: {'data': JSON.stringify($scope.follower_users)},
                        success: function(result){
                            if(result.success){
                                wiselinks.load();
                            }
                            bootbox.alert(result.message);
                        }
                    });
                }
            };
        }
    ]);
}).call(this);