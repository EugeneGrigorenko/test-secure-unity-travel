(function() {
    this.app.controller('CaboReportsCtrl', [
        "$scope", "$filter",
        function($scope, $filter) {
            $scope.event_id = null;
            $scope.dashboard_data = {};
            $scope.booking_sub_categories = [];
            $scope.booking_report_data = [];
            $scope.is_special_category = false;
            $scope.report_type = 0;
            $scope.deposited_from = null;
            $scope.deposited_to = null;

            $scope.init = new function(){};

            $scope.resetBookingSubCategory = function () {
                $scope.booking_sub_category = null;
                $scope.booking_sub_categories = [];
                $scope.booking_report_data = [];
            };

            $scope.selectBookingCategory = function(){
                $scope.is_special_category = ['Admin', 'Add-on', 'Package'].indexOf($scope.booking_category) > -1;
                if(!$scope.booking_category && !$scope.booking_sub_category){
                    $scope.booking_sub_categories = [];
                    $scope.booking_report_data = [];
                    return false;
                }

                var url = "/events/" + $scope.event_id + "/booking-report";
                var option = {booking_by: $scope.booking_category, sub_booking_by: $scope.booking_sub_category};
                if($scope.booking_category == 'School'){
                    option.deposited_from = $scope.deposited_from;
                    option.deposited_to = $scope.deposited_to;
                }

                if($scope.booking_category || $scope.booking_sub_category){
                    $.post(url, option, function(result){
                        $scope.$apply(function(){
                            $scope.data = null;
                            $scope.report_type = 0;
                            if($scope.is_special_category && $scope.booking_sub_category == null){
                                $scope.booking_sub_categories = result;
                                $scope.booking_report_data = [];
                            }else{
                                $scope.booking_report_data = result;
                            }

                            if($scope.booking_category == 'School'){
                                $scope.report_type = 1;
                                var data = {key: $scope.booking_category, values: []};
                                $.each($scope.booking_report_data, function(i, item){
                                    data.values.push([item.key, item.value]);
                                });
                                $scope.data = [data];
                                setTimeout(function(){ formatAxisTick(); }, 1000);
                            }
                        });
                    });
                }
            };

            $scope.showOrganizationPackage = function(school_data){
                if(school_data.sold > 0){
                    $scope.showOrganization(school_data);
                }
            };

            $scope.showOrganization = function(school_data){
                if($scope.is_special_category){
                    school_data.is_expanded = !school_data.is_expanded;
                    if(!school_data.organizations){
                        var url = "/events/" + $scope.event_id + "/booking-report";
                        var option = {booking_by: $scope.booking_category, sub_booking_by: $scope.booking_sub_category, school: school_data.key};
                        $.post(url, option, function(result){
                            $scope.$apply(function(){
                                school_data.organizations = result;
                            });
                        });
                    }
                }
            };

            $scope.getDetailsLink = function (product_id, org) {
                var url = '/events/'+ $scope.event_id +'/booking-report/order-list';
                url += '?product_id=' + product_id;
                url += '&school=' + $scope.booking_sub_category;
                url += '&organization=' + org;
                return url.split(" ").join("%20");
            };

            $scope.xAxisTickFormatFunction = function(){
                return function(d){
                    return d;
                };
            };

            $scope.yAxisTickFormatFunction = function(){
                return function(d) {
                    return formatInt(d);
                };
            };

            $scope.valueFormatFunction = function() {
                return function(d) {
                    return formatInt(d);
                };
            };

            $scope.$watch('deposited_from', function () {
                $scope.selectBookingCategory();
            });

            $scope.$watch('deposited_to', function () {
                $scope.selectBookingCategory();
            });

            function formatInt(d) {
                if (d > Math.floor(d)) {
                    return '';
                }
                return d.toString();
            }


            function formatAxisTick() {
                var xTicks = d3.select('.nv-x.nv-axis > g').selectAll('g.tick text')
                    .attr('transform', function(d,i,j) { return 'translate (0, 0) rotate(-75 0,0)' })
                    .style('text-anchor', 'end');
            }
        }
    ]);
}).call(this);