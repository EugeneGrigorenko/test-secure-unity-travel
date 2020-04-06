(function() {
    this.app.controller('GeolocationReportsCtrl', [
        "$scope",
        function($scope) {
            $scope.years = [];
            $scope.show_zoom_out_button = false;
            $scope.get_geolocation_data_url = '/reports/geolocation-report-data';
            $scope.chart_color_option = {colors: ['#A3DCF1', '#068DC7']};
            $scope.data = [];
            $scope.interval = 'monthly';
            $scope.chartType = 0;
            $scope.refreshDisabled = true;
            $scope.dailyDate = '';
            $scope.monthlyMonthFrom = 1;
            $scope.monthlyMonthTo = 12;
            $scope.monthlyYearFrom = 0;
            $scope.monthlyYearTo = 0;
            $scope.yearlyYearFrom = 0;
            $scope.yearlyYearTo = 0;
            $scope.eventId = null;

            $scope.data_change = function(){
                drawChartCountry();
            };

            $scope.zoom_out = function(){
                if ($scope.show_zoom_out_button){
                    $scope.show_zoom_out_button = false;
                    drawChartCountry();
                }
            };

            $scope.$watch('refreshDisabled', function(value) {
                if (!value) {
                    drawChartCountry();
                }
            });

            $scope.$watch('dailyDate', function(value) {
                if (value) {
                    drawChartCountry();
                }
            });

            function getFilterOptions() {
                var options = { interval: $scope.interval };

                if ($scope.eventId) {
                    options.event_id = $scope.eventId;
                }

                switch($scope.interval) {
                    case 'daily':
                        options.date = $scope.dailyDate;
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
                }
                return options;
            }

            function drawChartCountry(){
                $('#unknown_span').html('');
                var container = document.getElementById('geolocation_map');
                var geochart = new google.visualization.GeoChart(container);
                var country_data = new google.visualization.DataTable();
                country_data.addColumn('string', 'Country');
                country_data.addColumn('number', 'Counts');
                var country_options = getFilterOptions();
                country_options.chartType = $scope.chartType;
                country_options.chartCountry = 'world';
                country_options.dataType = 0;
                var country_chart_options = {};
                country_chart_options['colorAxis'] = $scope.chart_color_option;
                $.ajax({
                    url: $scope.get_geolocation_data_url,
                    data: country_options, type: 'POST', async: false
                }).done(function(country_result) {
                    if (country_result && country_result.length) {
                        $('#geolocation_map').html("<h4>Loading...</h4>");
                        $(country_result).each(function(index, value){
                            if (value.country == "Unknown"){
                                $('#unknown_span').html("Unknown Countries: " + value.value);
                            }else{
                                country_data.addRow([value.country, value.value]);
                            }
                        });
                        if (country_data.getNumberOfRows() > 0) {
                            geochart.draw(country_data, country_chart_options);

                            google.visualization.events.addListener(geochart, 'select', function() {
                                var selectedItem = geochart.getSelection()[0];
                                if (selectedItem) {
                                    var country = country_data.getValue(selectedItem.row, 0);
                                    drawChartState(country);
                                }
                            });
                            $scope.show_zoom_out_button = true;

                        }else{
                            $scope.show_zoom_out_button = false;
                            $('#geolocation_map').html("<h2>NO DATA COLLECTED</h2>");
                        }
                    }else{
                        $scope.show_zoom_out_button = false;
                        $('#geolocation_map').html("<h2>NO DATA COLLECTED</h2>");
                    }
                });
            }

            function drawChartState(country){
                $('#unknown_span').html('');
                var container = document.getElementById('geolocation_map');
                var geochart = new google.visualization.GeoChart(container);
                var state_data = new google.visualization.DataTable();
                state_data.addColumn('string', 'State');
                state_data.addColumn('number', 'Counts');
                var state_options = getFilterOptions();
                state_options.chartType = $scope.chartType;
                state_options.chartCountry = country;
                state_options.dataType = 1;
                var state_chart_options = {};
                state_chart_options['region'] = country;
                state_chart_options['resolution'] = 'provinces';
                state_chart_options['colorAxis'] = $scope.chart_color_option;
                $.ajax({
                    url: $scope.get_geolocation_data_url,
                    data: state_options, type: 'POST', async: false
                }).done(function(state_result){
                    $(state_result).each(function(index, value){
                        if (value.state == "Unknown"){
                            $('#unknown_span').html("Unknown States: " + value.value);
                        }else{
                            state_data.addRow([value.state, value.value]);
                        }
                    });
                    if (state_data.getNumberOfRows() > 0){
                        geochart.draw(state_data, state_chart_options);
                        google.visualization.events.addListener(geochart, 'select', function() {
                            var selectedItem = geochart.getSelection()[0];
                            if (selectedItem) {
                                var state = state_data.getValue(selectedItem.row, 0);
                                drawChartCity(country, state);
                            }
                        });
                        $scope.show_zoom_out_button = true;
                    }
                });
            }

            function drawChartCity(country, state){
                $('#unknown_span').html('');
                var container = document.getElementById('geolocation_map');
                var geochart = new google.visualization.GeoChart(container);
                var city_data = new google.visualization.DataTable();
                city_data.addColumn('string', 'City');
                city_data.addColumn('number', 'Counts');
                var city_options = getFilterOptions();
                city_options.chartType = $scope.chartType;
                city_options.chartCountry = state;
                city_options.dataType = 2;
                var city_chart_options = {};
                city_chart_options['displayMode'] = 'markers';
                city_chart_options['region'] = country + "-" + state;
                city_chart_options['resolution'] = 'provinces';
                city_chart_options['colorAxis'] = $scope.chart_color_option;
                $.ajax({
                    url: $scope.get_geolocation_data_url,
                    data: city_options, type: 'POST', async: false
                }).done(function(city_result){
                    $(city_result).each(function(index, value){
                        if (value.city == "Unknown"){
                            $('#unknown_span').html("Unknown Cities: " + value.value);
                        }else{
                            city_data.addRow([value.city, value.value]);
                        }
                    });
                    if (city_data.getNumberOfRows() > 0){
                        geochart.draw(city_data, city_chart_options);
                        $scope.show_zoom_out_button = true;
                    }
                });
            }
        }
    ]);
}).call(this);