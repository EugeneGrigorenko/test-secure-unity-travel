JusCollege.AngularUtils = new function() {
    var awaitingDataApplies = {};

    function pageDoneCallback() {
        var apply;
        for (apply in awaitingDataApplies) {
            if(awaitingDataApplies.hasOwnProperty(apply)){
                awaitingDataApplies[apply].call();
            }
        }
    }

    JusCollege.pageDoneCallback = pageDoneCallback;

    this.applyData = function(elementSelector, itemToCheckScopeOn, scopeApplyFunction) {
        var element = $(elementSelector),
            scope = $(elementSelector).scope();

        function applyData(isValidScope) {		    
            if (typeof(isValidScope) === 'undefined' || !isValidScope) {
                element = $(elementSelector);
                scope = element.scope();
            }

            scope.$apply(function(){
                scopeApplyFunction.call(element, scope);
            });

            delete awaitingDataApplies[elementSelector];
        }

        if (scope[itemToCheckScopeOn]) {
            applyData(true);
        } else {
            awaitingDataApplies[elementSelector] = applyData;
        }
    };

    this.setScopeToBeOuterPaymentScopeWithPhoneValidation = function ($scope) {
        $scope.basePaymentUrl = '';
        $scope.paymentUrl = '';
        $scope.phone = null;
        $scope.user_school_organization = null;
        $scope.school = null;
        $scope.organization = null;
        $scope.school_list = null;
        $scope.organization_list = null;
        $scope.pp_properties = [];
        $scope.is_traveling = null;
        $scope.date_of_birth_setting = {
            firstItem: 'name',
            minYear: (new Date()).getFullYear() - 100,
            maxYear: (new Date()).getFullYear()
        };

        $scope.expiration_date_setting = {
            firstItem: 'name',
            maxYear: (new Date()).getFullYear() + 20,
            minYear: (new Date()).getFullYear()
        };

        $scope.group_extra_settings = {
            enableCaseInsensitiveFiltering: true,
            nonSelectedText: 'Select a Group',
            includeSelectAllOption: false,
            filterPlaceholder: '...search group by name...'
        };

        $scope.organization_extra_settings = {
            enableCaseInsensitiveFiltering: true,
            nonSelectedText: 'Select an Organization',
            includeSelectAllOption: false,
            filterPlaceholder: '...search organization by name...'
        };

        function generatePaymentUrl() {
            var baseUrl = $scope.basePaymentUrl || '';
            if (baseUrl.indexOf('?') > -1) {
                baseUrl += '&';
            } else {
                baseUrl += '?';
            }

            var school = '';
            var school_id = '';
            var organization = '';
            if ($scope.school != null && $scope.organization != null){
                if ($scope.school.name == "Other") {
                    school = $scope.other_school;
                }else if ($scope.school.name == "Select a Group"){
                    school = '';
                }else{
                    school =  $scope.school.name;
                    school_id = $scope.school.id;
                }

                if ($scope.organization.name == "Other"){
                    organization =  $scope.other_organization;
                }else if ($scope.organization.name == "Select an Organization"){
                    organization = '';
                }else{
                    organization =  $scope.organization.name;
                }
            }

            $scope.paymentUrl = baseUrl
                + '&phone=' + ($scope.phone || '')
                + '&school_id=' + (school_id || '')
                + '&school=' + (school || '')
                + '&organization=' + (organization || '')
                + '&pp_properties=' + (JSON.stringify($scope.pp_properties) || '')
                + '&is_traveling=' + ($scope.is_traveling || '');
        }

        $scope.$watch('pp_properties', function(newValue) {
            generatePaymentUrl();
        }, true);

        $scope.$watch('is_traveling', function(newValue) {
            generatePaymentUrl();
        });

        $scope.$watch('basePaymentUrl', function(newValue) {
            generatePaymentUrl();
        });

        $scope.$watch('phone', function(newValue) {
            generatePaymentUrl();
        });

        $scope.$watch('other_school', function(newValue) {
            generatePaymentUrl();
        });

        $scope.$watch('other_organization', function(newValue) {
            generatePaymentUrl();
        });

        $scope.$watch('school', function(newValue) {
            if(newValue != null){
                if(newValue.name == 'Other'){
                    $scope.show_other_school = true;
                    $scope.organization = $scope.organization_list[$scope.organization_list.length - 1];
                }else{
                    $scope.other_school = '';
                    $scope.show_other_school = false;
                }
            }
            generatePaymentUrl();
        });

        $scope.$watch('organization', function(newValue) {
            if(newValue != null){
                if(newValue.name == 'Other'){
                    $scope.show_other_organization = true;
                }else{
                    $scope.other_organization = '';
                    $scope.show_other_organization = false;
                }
            }
            generatePaymentUrl();
        });
        function get_organization_list(school_name){
            return $.ajax({
                url: '/inquiries/get_organization_by_school',
                data: { school_name: school_name },
                type: 'POST'
            });
        }
        function get_school_list(){
            return  $.ajax({
                url: '/inquiries/get_school_list',
                type: 'POST'
            });
        }
        $scope.$watch('user_school_organization', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                get_school_list().done(function(school_result){
                    $scope.school_list = school_result;
                    if(newValue == null || newValue.school == null || newValue.school.length === 0 ){
                        $scope.school = school_result[0];
                    }else{
                        var is_school_existed = false;
                        var school_index = 0;
                        for (var i = 0; i < school_result.length; i++) {
                            if (school_result[i].name == newValue.school) {
                                is_school_existed = true;
                                school_index = i;
                                break;
                            }
                        }
                        if (is_school_existed) {
                            $scope.school = school_result[school_index];
                        } else {
                            $scope.other_school = newValue.school;
                            $scope.school = school_result[school_result.length - 1];
                        }
                    }
                    get_organization_list($scope.school.name)
                        .done(function(organization_result){
                            $scope.$apply(function() {
                                organization_result.unshift({"name":"Select an Organization"});
                                organization_result.push({"name":"Other"});
                                $scope.organization_list = organization_result;
                                $scope.other_organization = '';
                                $scope.show_other_organization = false;
                                if(newValue == null || newValue.organization == null || newValue.organization.length === 0 ){
                                    $scope.organization = $scope.organization_list[0];
                                }else{
                                    var is_organization_existed = false;
                                    var organization_index = 0;
                                    for (var i = 0; i < $scope.organization_list.length; i++) {
                                        if ($scope.organization_list[i].name == newValue.organization) {
                                            is_organization_existed = true;
                                            organization_index = i;
                                            break;
                                        }
                                    }
                                    if (is_organization_existed) {
                                        $scope.organization = $scope.organization_list[organization_index];
                                    } else {
                                        $scope.other_organization = newValue.organization;
                                        $scope.organization = $scope.organization_list[$scope.organization_list.length - 1];
                                    }
                                }
                            });
                        });
                });
            }
        });
        $scope.school_change = function () {
            var organization_list = [];
            organization_list.push({"name": "Select an Organization"});
            $.ajax({
                url: '/inquiries/get_organization_by_school',
                data: {school_name: $scope.school.name},
                type: 'POST',
                async: false
            }).done(function (result) {
                for (var i = 0; i < result.length; i++) {
                    organization_list.push(result[i]);
                }
            });
            organization_list.push({"name": "Other"});
            $scope.organization_list = organization_list;
            $scope.organization = $scope.organization_list[0];
            $scope.other_organization = '';
            $scope.show_other_organization = false;
        };

        $scope.validateExtraPaymentInfo = function () {
            $scope.phone = $.trim($('[ng-model=phone]').val());
            if ($scope.phone == '') {
                bootbox.alert('Please input mobile phone number in the field above.');
                return false;
            }
            return true;
        };
    };
};
