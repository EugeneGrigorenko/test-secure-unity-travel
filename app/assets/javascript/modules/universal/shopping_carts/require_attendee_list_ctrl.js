(function() {
    this.app.controller('RequireAttendeeListCtrl', [
        "$scope",
        "cartService",
        function($scope, cartService) {
            $scope.init = new function(){};

            $scope.numberOfAttendees = '';
            $scope.first_names = [];
            $scope.last_names = [];
            $scope.emails = [];
            $scope.phone_numbers = [];
            $scope.isValidateAttendeeForm = false;
            $scope.isSubmitButtonDisabled = false;

            // doesn't matter is set in _require_attendee_list.html.erb
            // TODO: Make adjustable
            $scope.MAX_ATTENDEES = 0;

            $scope.$watch('numberOfAttendees', function(new_value) {
                var number = parseInt(new_value);
                if (number > $scope.MAX_ATTENDEES) {
                    $scope.numberOfAttendees = $scope.MAX_ATTENDEES;
                } else if (number < 1) {
                    $scope.numberOfAttendees = 1;
                }

                if (number > 1) {
                    var attendee_first_names = [];
                    var attendee_last_names = [];
                    var attendee_emails = [];
                    var attendee_phone_numbers = [];
                    for (var i=0; i < number; i++) {
                        if ($scope.attendee_first_names.length > i) {
                            attendee_first_names.push($scope.attendee_first_names[i]);
                            attendee_last_names.push($scope.attendee_last_names[i]);
                            attendee_emails.push($scope.attendee_emails[i]);
                            attendee_phone_numbers.push($scope.attendee_phone_numbers[i]);
                        } else {
                            attendee_first_names.push('');
                            attendee_last_names.push('');
                            attendee_emails.push('');
                            attendee_phone_numbers.push('');
                        }
                    }
                    $scope.attendee_first_names = attendee_first_names;
                    $scope.attendee_last_names = attendee_last_names;
                    $scope.attendee_emails = attendee_emails;
                    $scope.attendee_phone_numbers = attendee_phone_numbers;
                } else if (number == 1) {
                    $scope.attendee_first_names = [$scope.attendee_first_names[0]];
                    $scope.attendee_last_names = [$scope.attendee_last_names[0]];
                    $scope.attendee_emails = [$scope.attendee_emails[0]];
                    $scope.attendee_phone_numbers = [$scope.attendee_phone_numbers[0]];
                }
            });

            $scope.validateAttendeeForm = function() {
                // alert($scope.attendee_first_names)
                // alert($scope.attendee_first_names.length)
                for(var i = 0; i < $scope.attendee_first_names.length; i++){
                    // alert($scope.attendee_first_names[i])
                    // alert($scope.attendee_last_names[i])
                    if (!$scope.attendee_first_names[i] || !$scope.attendee_last_names[i]) {
                        bootbox.alert('Please write your friend\'s full name in the attendee list');
                        return false;
                    }
                }
                return true;
            };

            // $("#credit-card-form").submit(function(event) {
            //     event.preventDefault();
            //
            //     if ($scope.validateAttendeeForm) {
            //         $(this).unbind('submit').submit();
            //     }
            // });

            $scope.serialize = function(fieldName) {
                return angular.toJson($scope[fieldName]);
            };

            JusCollege.AngularUtils.setScopeToBeOuterPaymentScopeWithPhoneValidation($scope);
        }
    ]);
}).call(this);
