(function() {
	this.app.controller('EventActivitiesCtrl', [
		"$scope",
		function($scope) {
            $scope.from_date;
            $scope.to_date;
            $scope.selected_role = 'all';
            $scope.selected_type = 'all';
            $scope.selected_event = '';
            $scope.event_list = [];
            $scope.auto_refresh = false;
            $scope.refresh_link = '';
            $scope.get_new_data_link = '';
            $scope.page_size = 0;

            $scope.last_id = '';
            $scope.last_id_old = '';
            $scope.last_refresh = new Date();
            $scope.data = [];
            $scope.refresh_opts = { interval: 5000, paused: true };

            $scope.event_extra_settings = {
                nonSelectedText: 'Select event',
                includeSelectAllOption: false,
                filterPlaceholder: '...search event by name...'
            };

            $scope.init = new function(){};

            $scope.refresh_data = function(){
                $scope.refresh_opts.paused = true;
                $scope.selected_event = ($scope.selected_event == null || $scope.selected_event == '') ? 'all' : $scope.selected_event;
                var url = $scope.build_url($scope.refresh_link);
                wiselinks.load(url);
            };

            $scope.change_auto_refresh = function(){
                $scope.auto_refresh = !$scope.auto_refresh;
                $scope.refresh_opts.paused = !$scope.auto_refresh;
                if($scope.auto_refresh){
                    window.refreshIntervalId = setInterval(function(){
                        $scope.get_new_data();
                    }, $scope.refresh_opts.interval);
                } else {
                    if (window.refreshIntervalId){
                        clearInterval(window.refreshIntervalId);
                    }
                }
            };

            $scope.set_default_option = function(s_event){
                for(var i = 0; i < $scope.event_list.length; i++){
                    if(parseInt($scope.event_list[i][1]) == parseInt(s_event)){
                        $scope.selected_event = $scope.event_list[i][1];
                        break;
                    }
                }
            };

            $scope.get_new_data = function(){
                $scope.last_id_old = $scope.last_id;
                var url = $scope.build_url($scope.get_new_data_link) + '&last_id=' + $scope.last_id;

                $.ajax({
                    url: url,
                    type: 'GET',
                    beforeSend: function(xhr){ $(document).unbind("ajaxSend");},
                    async: false
                }).done(function(result){

                    if(result.length > 0){
                        $scope.last_id = result[0].id;
                        var number_of_removed_items = $scope.data.length + result.length - $scope.page_size;
                        if(number_of_removed_items > 0){
                            $scope.data.splice($scope.data.length - number_of_removed_items - 1, number_of_removed_items);
                        }
                    }
                    $scope.$apply(function () {
                        $scope.data = $.merge(result, $scope.data);
                    });

                    $(document).bind("ajaxSend", function(){
                        $(".lockModal").show();
                    })

                    $scope.last_refresh = new Date();
                });
            };

            $scope.set_last_refresh = function(eventArgs){
                $scope.last_refresh = eventArgs.when;
            };

            $scope.build_url = function(root_url){

                var params = $.param({
                    role: $scope.selected_role,
                    type: $scope.selected_type,
                    event: $scope.selected_event,
                    from_date: $scope.from_date,
                    to_date: $scope.to_date
                });

                var mark = root_url.indexOf("?") >= 0 ?  '&' : '?';

                return root_url + mark + params;
            };

            $scope.$watch('from_date', function() {
                $("#to_date").datepicker("option", "minDate", $scope.from_date);
            });

            $scope.$watch('to_date', function() {
                $("#from_date").datepicker("option", "maxDate", $scope.to_date);
            });
		}
	]);
}).call(this);
