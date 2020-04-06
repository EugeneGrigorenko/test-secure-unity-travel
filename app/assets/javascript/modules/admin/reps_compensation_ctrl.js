(function() {
    this.app.controller('RepsCompensationCtrl', [
        "$scope",'$window', '$timeout',
        function($scope, $window, $timeout) {
            $scope.compensation = {};
            $scope.event_id = null;
            $scope.sold_products = [];
            $scope.sold_options = [];
            $scope.sold_option_type = '';
            $scope.getProductOptionUrl = '';
            $scope.submitUrl = '';
            $scope.receive_products = [];
            $scope.receive_options = [];
            $scope.receive_option_type = '';

            $scope.init = new function(){};

            $scope.selectProduct = function(){
                var event_id = $scope.event_id;
                if(event_id != undefined){
                    var option = {
                        event_id: $scope.event_id,
                        product_id: $scope.compensation.sold_product_id
                    };
                    $.get($scope.getProductOptionUrl, option, function (result) {
                        $timeout(function(){
                            $scope.sold_option_type = result.option_type;
                            $scope.sold_options = result.options;

                            var resetOption = true;
                            for(var i = 0; i < $scope.sold_options.length; i++){
                                var option = $scope.sold_options[i];
                                if(option[0] == $scope.compensation.sold_product_option_id){
                                    resetOption = false;
                                    break;
                                }
                            }
                            if(resetOption){
                                $scope.compensation.sold_product_option_id = '';
                            }
                        });
                    });
                }
            };

            $scope.selectCompensation = function(){
                var event_id = $scope.event_id;
                if(event_id != undefined){
                    var option = {
                        event_id: $scope.event_id,
                        product_id: $scope.compensation.receive_product_id
                    };
                    $.get($scope.getProductOptionUrl, option, function (result) {
                        $timeout(function(){
                            $scope.receive_option_type = result.option_type;
                            $scope.receive_options = result.options;

                            var resetOption = true;
                            for(var i = 0; i < $scope.receive_options.length; i++){
                                var option = $scope.receive_options[i];
                                if(option[0] == $scope.compensation.receive_product_option_id){
                                    resetOption = false;
                                    break;
                                }
                            }
                            if(resetOption){
                                $scope.compensation.receive_product_option_id = '';
                            }
                        });
                    });
                }
            };

            $scope.showProductOption = function(){
                return $scope.sold_option_type && $scope.sold_option_type.length > 0
                    && $scope.sold_options && $scope.sold_options.length > 0;
            };

            $scope.showCompensationOption = function(){
                return $scope.receive_option_type && $scope.receive_option_type.length > 0
                    && $scope.receive_options && $scope.receive_options.length > 0;
            };

            $scope.validateCompensation = function(show_error){
                $scope.error_message = null;
                var is_valid = true;

                if(!$scope.compensation.sold_product_id){
                    $scope.error_message = show_error ? 'Product must be selected!' : '';
                    is_valid = false;
                }else if(!$scope.compensation.receive_product_id){
                    $scope.error_message = show_error ? 'Compensation product must be selected!' : '';
                    is_valid = false;
                }else if($scope.compensation.number_tickets_sold == '' || parseInt($scope.compensation.number_tickets_sold) <= 0){
                    $scope.error_message = show_error ? 'No. tickets sold must be greater than zero!' : '';
                    is_valid = false;
                }else if($scope.compensation.number_compensation == '' || parseInt($scope.compensation.number_compensation) <= 0){
                    $scope.error_message = show_error ? 'No. compensation must be greater than zero!' : '';
                    is_valid = false;
                }else if($scope.showCompensationOption() && !$scope.compensation.receive_product_option_id){
                    $scope.error_message = show_error ? 'Compensation option must be selected!' : '';
                    is_valid = false;
                }

                return is_valid
            };

            $scope.submitCompensation = function(){
                if($scope.validateCompensation(true)){
                    var compensation = angular.copy($scope.compensation);
                    var option = {
                        compensation: angular.toJson(compensation)
                    };

                    $.post($scope.submitUrl, option, function (result) {
                        bootbox.alert(result.message);
                        if(result.is_successful){
                            $('[ng-controller=RepsCompensationCtrl]').parents('.modal').modal('hide');
                            wiselinks.load();
                        }
                    });
                }
            };

            $scope.$watch('compensation.sold_product_id', function(value){
                if($scope.compensation.sold_product_id){
                    $scope.selectProduct();
                }else{
                    $scope.sold_options = [];
                    $scope.sold_option_type = '';
                    $scope.compensation.sold_product_option_id = '';
                }
            });

            $scope.$watch('compensation.receive_product_id', function(value){
                if($scope.compensation.receive_product_id){
                    $scope.selectCompensation();
                }else{
                    $scope.receive_options = [];
                    $scope.receive_option_type = '';
                    $scope.compensation.receive_product_option_id = '';
                }
            });
        }
    ]);
}).call(this);