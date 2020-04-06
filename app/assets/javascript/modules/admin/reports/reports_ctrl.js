(function() {
    this.app.controller('ReportsCtrl', [
        "$scope", "$filter", "$timeout",
        function($scope, $filter, $timeout) {
            var currencyFilter = $filter('currency');
            
            $scope.data = [];
            $scope.years = [];
            $scope.refreshDisabled = true;
            $scope.eventId = null;
            $scope.report = 'orders';
            $scope.chartType = 'column';
            $scope.interval = 'monthly';
            $scope.dailyDay = 1;
            $scope.dailyMonth = 1;
            $scope.dailyYear = 0;
            $scope.monthlyMonthFrom = 1;
            $scope.monthlyMonthTo = 12;
            $scope.monthlyYearFrom = 0;
            $scope.monthlyYearTo = 0;
            $scope.yearlyYearFrom = 0;
            $scope.yearlyYearTo = 0;
            $scope.report_title = "";
            $scope.reports_support_hourly = ['check_in'];
            $scope.event_start_date = {};
            $scope.event_end_date = {};
            $scope.yoy_order_type = 'active_orders';
            $scope.yoy_tag_id = '';
            $scope.yoy_with_organization = 'false';
            $scope.event_tags = [];

            $scope.resetReportTime = function() {
                $scope.dailyYear = $scope.monthlyYearTo = $scope.yearlyYearTo = $scope.this_year;
                $scope.monthlyMonthFrom = $scope.last_12_month;
                $scope.monthlyYearFrom = $scope.yearlyYearFrom = $scope.last_12_month_year;
                $scope.dailyMonth = $scope.monthlyMonthTo = $scope.this_month;
            }

            function getFilterOptions() {
                var options = { interval: $scope.interval };
                if ($scope.eventId) {
                    options.event_id = $scope.eventId;
                }
                
                switch($scope.interval) {
                    case 'daily':
                        options.month = $scope.dailyMonth;
                        options.year = $scope.dailyYear;
                        break;
                        
                    case 'monthly':
                        options.month_from = $scope.monthlyMonthFrom;
                        options.year_from = $scope.monthlyYearFrom;
                        options.month_to = $scope.monthlyMonthTo;
                        options.year_to = $scope.monthlyYearTo;
                        break;
                        
                    case 'yearly':
                        options.year_from = $scope.yearlyYearFrom;
                        options.year_to = $scope.yearlyYearTo;
                        break;

                    case 'hourly':
                        options.day = $scope.dailyDay;
                        options.month = $scope.dailyMonth;
                        options.year = $scope.dailyYear;
                        break;

                    case 'during_event':
                        options.day_from = $scope.event_start_date.day;
                        options.month_from = $scope.event_start_date.month;
                        options.year_from = $scope.event_start_date.year;
                        options.day_to = $scope.event_end_date.day;
                        options.month_to = $scope.event_end_date.month;
                        options.year_to = $scope.event_end_date.year;
                        break;

                    case 'year_over_year':
                        options.month_from = $scope.monthlyMonthFrom;
                        options.month_to = $scope.monthlyMonthTo;
                        options.year_from = $scope.monthlyYearFrom;
                        options.year_to = $scope.monthlyYearTo;
                        options.tag_id = $scope.yoy_tag_id;
                        options.order_type = $scope.yoy_order_type;
                        break;
                }
                return options;
            }
            
            function getStatisticsData(statisticsTypeList) {
                var options = getFilterOptions();
                options.statistics_type_list = statisticsTypeList;
                
                return $.get('/reports/daily-report-data', options);
            }

            function getHourlyStatisticsData(statisticsTypeList) {
                var options = getFilterOptions();
                options.statistics_type_list = statisticsTypeList;

                return $.get('/reports/hourly-report-data', options);
            }

            function getYOYReportDataByEvent(){
                var options = getFilterOptions();
                return $.get('/reports/yoy-report-data/event', options);
            }

            function getYOYReportDataBySchool(){
                var options = getFilterOptions();
                return $.get('/reports/yoy-report-data/school', options);
            }

            function getYOYReportDataByOrganization(school_id){
                var options = getFilterOptions();
                options.school_id = school_id;
                return $.get('/reports/yoy-report-data/organization', options);
            }

            function getCumulativeRecognizedRevenue() {
                var options = getFilterOptions();
                return $.get('/reports/cumulative-recognized-revenue', options);
            }
            
            function getStoredCumulativeData(statisticsType) {
                var options = getFilterOptions();
                options.statistics_type = statisticsType;
                return $.get('/reports/stored-cumulative-data', options);
            }

            function getPaymentMethodData() {
                var options = getFilterOptions();
                return $.get('/reports/statistic-payment-method', options);
            }

            function getCheckinLocationData() {
                var options = getFilterOptions();
                return $.get('/reports/statistic-checkin-location', options);
            }

            function refreshData() {
                if ($scope.refreshDisabled) return;

                switch($scope.report) {
                    case 'check_in_location':
                        $.when(getCheckinLocationData()).done(function(result){
                            $scope.$apply(function() {
                                $scope.data = result;
                            });
                        });
                        break;
                    case 'payment_method':
                        $.when(getPaymentMethodData()).done(function(result){
                            $scope.$apply(function() {
                                $scope.paymentMethodData = result;
                            });
                        });
                        break;
                    case 'reasons_for_refund':
                        $.when(getStatisticsData('reasons_for_refund_0,reasons_for_refund_1,reasons_for_refund_2,reasons_for_refund_3,reasons_for_refund_4,reasons_for_refund_5, reasons_for_refund_6, reasons_for_refund_7'))
                            .done(function(refundedReasons){
                                $scope.$apply(function(){
                                    $scope.data = [refundedReasons[0], refundedReasons[1], refundedReasons[2], refundedReasons[3],
                                                   refundedReasons[4], refundedReasons[5], refundedReasons[6], refundedReasons[7]];
                                });
                            });
                        break;
                    case 'affiliates':
                        $.when(getStatisticsData('affiliate_requests, affiliate_approvals, affiliate_orders, affiliate_revenue'))
                            .done(function(affiliateData){
                                $scope.$apply(function(){
                                    $scope.data = [affiliateData[0], affiliateData[1], affiliateData[2], affiliateData[3]];
                                });
                            });
                        break;
                    case 'cash_flows':
                        $.when(getStatisticsData("cash_in, cash_out"))
                            .done(function(cashData){
                                $scope.$apply(function(){
                                    $scope.data = [cashData[0], cashData[1]];
                                });
                                resizeYAxis();
                            });
                        break;
                    case 'cumulative_revenue':
                        $.when(getCumulativeRecognizedRevenue(),
                               getStoredCumulativeData('cumulative_account_receivable'),
                               getStoredCumulativeData('cumulative_unearned_revenue'))
                         .done(function(revenueData, accountReceivableData, unearnedRevenueData) {
                             $scope.$apply(function(){
                               $scope.data = [revenueData[0], unearnedRevenueData[0], accountReceivableData[0]];
                             });
                             resizeYAxis();
                         });
                        break;
                    case 'event_cumulative_revenue':
                        $.when(getStoredCumulativeData('cumulative_recognized_revenue'),
                               getStoredCumulativeData('cumulative_account_receivable'),
                               getStoredCumulativeData('cumulative_unearned_revenue'))
                         .done(function(revenueData, accountReceivableData, unearnedRevenueData) {
                             $scope.$apply(function(){
                               $scope.data = [revenueData[0], unearnedRevenueData[0], accountReceivableData[0]];
                             });
                             resizeYAxis();
                         });
                        break;
                    case 'check_in':
                        $.when(getHourlyStatisticsData($scope.report)).done(function(data){
                            $scope.$apply(function(){
                                $scope.data = [data[0]];
                            });
                        });
                        break;
                    case 'yoy_reports':
                        $.when(getYOYReportDataByEvent()).done(function(data){
                            $scope.$apply(function(){
                                $scope.data = data['data'];
                                $scope.period_months = data['months'];
                                console.log(data['months']);
                            });
                        });
                        break;
                    default:
                        getStatisticsData($scope.report).done(function(data){
                            $scope.$apply(function(){
                               $scope.data = [data[0]];
                            });
                        });
                }
            }
            
            function formatInt(d) {
                if (d > Math.floor(d)) return '';
                return d.toString();
            }
            
            function formatDecimal(d) {
                return currencyFilter(d, '');
            }
            
            var colors = ['#df3e04', '#41b1e4', '#1b274c', '#FF8F2C', '#B2E7A8', '#FF3399', '#50B050', '#5294c2'];

            $scope.colorFunction = function() {
                return function(d, i) { return colors[i]; };
            };
            
            $scope.xAxisTickFormatFunction = function(){
                return function(d){
                    var momentObj = moment(d);
                    
                    switch ($scope.interval) {
                        case 'daily':
                            return momentObj.format('D');
                            
                        case 'monthly':
                            return momentObj.format('MMM YY');
                            
                        case 'yearly':
                            return momentObj.format('YYYY');

                        case 'during_event':
                            return momentObj.format('D MMM');
                            
                        default:
                            return d;                            
                    }
                };
            };
            
            $scope.yAxisTickFormatFunction = function(){
                return function(d) {
                    switch($scope.report) {
                        case 'check_in_location':
                        case 'reasons_for_refund':
                        case 'affiliates':
                        case 'inquiries':
                        case 'orders':
                        case 'events':
                        case 'users':
                        case 'yoy_reports':
                            return formatInt(d);
                        default:
                            return formatDecimal(d);
                    }
                };
            };

            $scope.xAxisTickValuesFunction = function(){
                return function(d) {
                    var tickVals = [], i;
                    if(d.length > 0) {
                        for (i = 0; i < d[0].values.length; i++) {
                            tickVals.push(d[0].values[i][0]);
                        }
                    }
                    return tickVals;
                };
            };

            $scope.valueFormatFunction = function() {
                return function(d) {
                    switch($scope.report) {
                        case 'cash_flows':
                        case 'recognized_revenue':
                        case 'cumulative_revenue':
                        case 'stripe_fee':
                            return formatDecimal(d);
                        default:
                            return formatInt(d);

                    }
                };
            };

            $scope.$watch('refreshDisabled', function(value) {
               if (!value) refreshData();
            });

            $scope.report_change = function(){
                if ($scope.report === 'cumulative_revenue' || $scope.report === 'event_cumulative_revenue') {
                    $scope.chartType = 'stackedArea';
                } else if ($scope.report === 'payment_method') {
                    $scope.chartType = 'table';
                    $scope.interval = 'monthly';
                } else{
                    $scope.chartType = 'column';
                }

                if($scope.interval == 'hourly' && $scope.reports_support_hourly.indexOf($scope.report) === -1) {
                    $scope.interval = 'monthly';
                }

                if($scope.report == 'yoy_reports'){
                    $scope.interval = 'year_over_year';
                    if($scope.monthlyMonthFrom > $scope.monthlyMonthTo){
                        $scope.monthlyMonthFrom = $scope.monthlyMonthTo;
                    }
                }else if($scope.interval == 'year_over_year'){
                    $scope.interval = 'daily';
                    $scope.resetReportTime();
                }

                refreshData();
            };

            $scope.data_change = function(){
                refreshData();
            };

            $scope.date_selected_change = function(){
                if($scope.dailyMonth == '2' && parseInt($scope.dailyDay) > 28){
                    $scope.dailyDay = '28';
                }
                else if($scope.dailyDay == '31' && ['1','3','5','7','8','10','12'].indexOf($scope.dailyMonth) < 0){
                    $scope.dailyDay = '30';
                }
                refreshData();
            };

            $scope.get_YOY_organizations = function(school){
                if(school.expand){
                    school.expand = false;
                    return;
                }

                if(school.organizations){
                   school.expand = true;
                    return;
                }

                $.when(getYOYReportDataByOrganization(school.id)).done(function(data){
                    $scope.$apply(function(){
                        school.organizations = data;
                        school.expand = true;
                    });
                });
            };

            $scope.download_yoy_report = function () {
                if($scope.yoy_with_organization == 'false'){
                    $('#yoy_download_option_modal').modal('hide');
                }
            };

            var not_show_popup_report_names = ['Affiliate Requests', 'Affiliate Approvals', 'Stripe Fee'];
            var not_show_popup_report_types = ['recognized_revenue', 'cumulative_revenue', 'stripe_fee', 'check_in_location', 'yoy_reports'];

            $scope.$on('elementClick.directive', function(event, data) {

                var data_key = '';
                if(data.series) data_key = data.series.key;
                else if (data.data.key) data_key = data.data.key;
                else data_key = $scope.report;

                if($.inArray($scope.report, not_show_popup_report_types) < 0 && $.inArray(data_key, not_show_popup_report_names) < 0) {
                    var selected_bar = {interval: $scope.interval, report: $scope.report};

                    var selected_time = null;
                    if(data.series) selected_time = data.point[0];
                    else selected_time = data.data[0];

                    if($scope.interval == 'hourly'){
                        var selected_date = new Date($scope.dailyYear + '-' + $scope.dailyMonth + '-' + $scope.dailyDay + ' ' + selected_time + ':00:00');
                        momentObj = moment(selected_date);
                    }
                    else{
                        momentObj = moment(selected_time)
                    }
                    selected_bar.selected_date =  momentObj.format('YYYY-MM-DD HH:00');
                    selected_bar.key = data_key;
                    selected_bar.event_id = $scope.eventId;

                    var date_format = $scope.interval == 'yearly' ? 'YYYY' : $scope.interval == 'monthly' ? 'MM/YYYY' : $scope.interval == 'daily' ? 'MM/DD/YYYY' : 'HH:00 MM/DD/YYYY'

                    if( $scope.report == 'reasons_for_refund')
                        $scope.report_title = 'Reasons of refund - ' + momentObj.format(date_format);
                    else
                        $scope.report_title = selected_bar.key + " - " + momentObj.format(date_format);

                    $scope.$apply();

                    $.get('/reports/bar-data-list', selected_bar).done(function (result) {
                        $('#bar_data_list_modal .modal-body').html(result);
                        $('#bar_data_list_modal').modal().show();
                    });
                }
             });

            function resizeYAxis(){
                $timeout(function() {
                    $('.nvd3.nv-wrap.nv-multiBarWithLegend').attr('transform', 'translate(90, 50)');
                },1000);
            }
        }
    ]);
}).call(this);