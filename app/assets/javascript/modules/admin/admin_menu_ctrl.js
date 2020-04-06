(function() {
    this.app.controller('AdminMenuCtrl', [
        "$scope",
        function($scope) {
            $scope.global_search_text = '';

            $scope.search_objects = [
                { text: 'Users', url: '/users'},
                { text: 'Events', url: '/events'},
                { text: 'Order Number', url: '/orders'}
            ];
            
            $scope.selected_search_object = $scope.search_objects[0];

            $scope.changeSearchObject = function(search_object){
                $scope.selected_search_object = search_object;
            };

            $scope.doSearch = function(){
                var url = $scope.selected_search_object.url;
                if($scope.global_search_text != ''){
                    url += '?q=' + $scope.global_search_text;
                }
                wiselinks.load(url);
            };
        }
    ]);
}).call(this);