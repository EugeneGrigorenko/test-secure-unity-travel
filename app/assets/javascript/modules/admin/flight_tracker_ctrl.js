(function () {

    this.app.controller('FlightTrackerCtrl', [
        '$scope', '$window', '$timeout',
        function ($scope, $window, $timeout) {
            $scope.show_priority_popup = false;
            $scope.contract_statuses = {};
            $scope.contract_site_statuses = {};
            $scope.vendor = {};
            $scope.schools = [];
            $scope.airlines = [];
            $scope.events = [];
            $scope.trip_dates = [];
            $scope.airports = [];
            $scope.error = '';
            $scope.vendor_contract = {};
            $scope.flight_contract = {};
            $scope.flight_contract_events = [];
            $scope.product_sold = 0;
            $scope.product_instock = 0;

            $scope.init = new function () {
            };

            $scope.validate = function () {
                var valid = true;
                $scope.error = '';

                if ($.trim($scope.flight_contract.record_locator) == '' || $.trim($scope.flight_contract.contracted_seats) == '') {
                    $scope.error = 'Please input required fields';
                    valid = false;
                }

                if ($scope.product_instock < 0) {
                    $scope.error = '# of contract seats must be larger than total sold';
                    valid = false;
                }

                if($scope.flight_contract_events == null || $scope.flight_contract_events.length == 0){
                    $scope.error = 'Please select event to assign flight';
                    valid = false;
                }

                return valid;
            };

            $scope.getInstock = function () {
                if ($scope.flight_contract) {
                    var qty = $scope.flight_contract.contracted_seats || 0;
                    $scope.product_instock = qty - $scope.product_sold;
                }
                return 0;
            };

            $scope.showEventForm = function () {
                var excluded_event_ids = [];
                if ($scope.flight_contract_events) {
                    $.each($scope.flight_contract_events, function (x, i) {
                        excluded_event_ids.push(x.id);
                    });
                }
                var option = {excluded_event_ids: excluded_event_ids};
                $.post('/events/active-list', option, function (result) {
                    $scope.$apply(function () {
                        $scope.events = result || [];
                        $('#eventModal').modal('show');
                    });
                });
            };

            $scope.selectEvent = function () {
                $scope.selected_trip_dates = null;
                if ($scope.selected_event && $scope.selected_event.id) {
                    var option = {};
                    $.post('/events/' + $scope.selected_event.id + '/trip-dates', option, function (result) {
                        $scope.$apply(function () {
                            $scope.trip_dates = result || [];
                        });
                    });
                }
            };

            $scope.applyEvent = function () {
                if ($scope.selected_event && $scope.selected_event.id) {
                    var temp = {
                        id: $scope.selected_event.id,
                        name: $scope.selected_event.name,
                        trip_dates: $scope.selected_trip_dates
                    };
                    $scope.flight_contract_events.push(temp);
                    $('#eventModal').modal('hide');
                    $timeout(function () {
                        $($("[ng-model='selected_event']").next('.btn-group').find('input[type=radio]:first')).click();
                        $("[ng-model='selected_trip_dates']").multiselect('rebuild');
                    });
                    $scope.selected_event = null;
                    $scope.selected_trip_dates = null;
                }
            };

            $scope.removeEvent = function (index) {
                $scope.flight_contract_events.splice(index, 1);
            };

            $scope.submitFlightTracker = function () {
                if (!$scope.validate()) {
                    return;
                }
                var option = {
                    vendor_contract: angular.toJson($scope.vendor_contract),
                    flight_contract: angular.toJson($scope.flight_contract),
                    flight_contract_events: angular.toJson($scope.flight_contract_events)
                };

                $.post($scope.submit_url, option, function (result) {
                    if (result.message) {
                        bootbox.alert(result.message);
                    }
                    if (result.is_successful) {
                        if ($scope.is_edit) {
                            wiselinks.load();
                        } else {
                            wiselinks.load('/vendors/' + $scope.vendor.slug + '/edit?tab=contracts');
                        }
                    }
                });
            };

            $scope.generateFlight = function () {
                if (!$scope.validate()) {
                    return;
                }
                var option = {
                    vendor_contract: angular.toJson($scope.vendor_contract),
                    flight_contract: angular.toJson($scope.flight_contract),
                    flight_contract_events: angular.toJson($scope.flight_contract_events)
                };

                $.post($scope.generate_url, option, function (result) {
                    if (result.message) {
                        bootbox.alert(result.message);
                    }
                    if (result.is_successful) {
                        if ($scope.is_edit) {
                            wiselinks.load();
                        } else {
                            wiselinks.load('/vendors/' + $scope.vendor.slug + '/edit?tab=contracts');
                        }
                    }
                });
            };
        }
    ]);

}).call(this);