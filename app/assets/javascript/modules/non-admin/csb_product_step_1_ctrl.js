(function() {
    this.app.controller('CsbProductStep1Ctrl', [
        "$scope", "$timeout",
        function($scope, $timeout) {
            $scope.schools = [];
            $scope.trip_dates = [];
            $scope.from_dates = [];
            $scope.to_dates = [];
            $scope.show_trip_dates = false;
            $scope.show_from_to_dates = false;
            $scope.is_submit_button_disabled = true;

            $scope.selected_school_id = null;
            $scope.selected_trip_date_id = null;
            $scope.trip_date_id = null;

            $scope.get_from_dates_url = null;
            $scope.get_to_dates_url = null;
            $scope.get_trip_date_id_url = null;
            $scope.select_trip_date_url = null;

            $scope.init = function(){};

            $scope.validate = function () {
                $timeout(function(){
                    if($scope.trip_dates.length > 0){
                        $scope.show_trip_dates = true;
                        $scope.show_from_to_dates = $scope.selected_trip_date_id == null;
                    }
                    else{
                        $scope.show_trip_dates = false;
                        $scope.show_from_to_dates = true;
                    }

                    $scope.is_submit_button_disabled = $scope.trip_date_id == null;
                });
            }

            $scope.is_valid_date = function (date, disable_date_ranges) {
                var dmy = moment(date).format('dddd, MMM DD, YYYY');
                if ($.inArray(dmy.toString(), disable_date_ranges) != -1)
                    return true;

                return false;
            }

            $scope.search_trip_dates = function () {
                if($scope.get_from_dates_url != null){
                    $.ajax({
                        url: $scope.get_from_dates_url,
                        data: {'school_id': $scope.selected_school_id},
                        type: 'POST',
                        success: function (result) {
                            $timeout(function(){
                                if(result){
                                    if(result.trip_dates){
                                        $scope.trip_dates = result.trip_dates;
                                    }else{
                                        $scope.trip_dates = [];
                                    }

                                    if(result.from_dates){
                                        $scope.update_from_dates(result.from_dates);
                                    }else{
                                        $scope.update_from_dates([]);
                                    }
                                }
                                $scope.selected_trip_date_id = null;
                                $scope.trip_date_id = null;
                                $scope.validate();
                            });
                        }
                    });
                }
            }

            $scope.update_from_dates = function (result) {
                $('#from_date').val('');
                if(result.length > 0){
                    $('#from_date').removeClass('hasDatepicker').datepicker({
                        dateFormat: 'DD, M dd, yy',
                        defaultDate: result[0],
                        minDate: result[0],
                        maxDate: result[result.length - 1],
                        beforeShowDay: function (from_date) {
                            return [$scope.is_valid_date(from_date, result), ''];
                        },
                        onSelect: $scope.search_to_date
                    });
                }
                else{
                    $('#from_date').removeClass('hasDatepicker').datepicker({
                        dateFormat: 'DD, M dd, yy',
                        beforeShowDay: function (from_date) {
                            return [$scope.is_valid_date(from_date, []), ''];
                        }
                    });
                }

                $('#to_date').val('');
                $('#to_date').removeClass('hasDatepicker').datepicker({
                    dateFormat: 'DD, M dd, yy',
                    beforeShowDay: function (to_date) {
                        return [$scope.is_valid_date(to_date, []), ''];
                    }
                });
            }

            $scope.search_to_date = function (from_date_text) {
                if($scope.get_to_dates_url != null){
                    $.ajax({
                        url: $scope.get_to_dates_url,
                        data: {'from_date': from_date_text},
                        type: 'POST',
                        success: function (result) {
                            $timeout(function(){
                                $('#to_date').val('');
                                $('#to_date').removeClass('hasDatepicker').datepicker({
                                    dateFormat: 'DD, M dd, yy',
                                    defaultDate: result[0],
                                    minDate:  result[0],
                                    maxDate:  result[result.length - 1],
                                    beforeShowDay: function (to_date) {
                                        return [$scope.is_valid_date(to_date, result), ''];
                                    },
                                    onSelect: function (to_date_text) {
                                        $scope.search_trip_date(from_date_text, to_date_text);
                                    }
                                });
                            });
                        }
                    });
                }
            }

            $scope.search_trip_date = function (from_date_text, to_date_text) {
                if($scope.get_trip_date_id_url != null){
                    $.ajax({
                        url: $scope.get_trip_date_id_url,
                        data: {'to_date': to_date_text, 'from_date': from_date_text},
                        type: 'POST',
                        success: function (result) {
                            if(result != ''){
                                $timeout(function(){
                                    $scope.trip_date_id = parseInt(result);
                                    $scope.validate();
                                });
                            }
                        }
                    });
                }
            }

            $scope.select_trip_date = function () {
                if($scope.select_trip_date_url != null && $scope.trip_date_id != null){
                    $.post($scope.select_trip_date_url, {trip_date_id: $scope.trip_date_id, show_all: $scope.selected_trip_date_id == null}, function (data) {});
                }
            }

            $scope.$watch('selected_school_id', function(){
                $scope.search_trip_dates();
            });

            $scope.$watch('selected_trip_date_id', function(){
                $scope.trip_date_id = $scope.selected_trip_date_id;
                $scope.validate();
            });
        }
    ]);
}).call(this);