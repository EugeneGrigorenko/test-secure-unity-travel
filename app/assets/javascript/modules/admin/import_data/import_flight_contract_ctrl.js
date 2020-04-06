(function() {
	this.app.controller('ImportFlightContractCtrl', [
		"$scope",
		function($scope) {
            $scope.current_step = 1;
            $scope.validate_url = '';
            $scope.submit_import_url = '';
            $scope.excel_file = '';
            $scope.review_data = [];
            $scope.error_data = [];
            $scope.country_list = {};
            $scope.message = '';
            $scope.limit_file_size = 0;
            $scope.payment_method_list = [];
            $scope.status_list = [];

			$scope.init = new function(){
            };

            $scope.go_back = function(){
                if($scope.current_step == 2){
                    $scope.current_step = 1;
                    $scope.excel_file = '';
                    $scope.review_data = [];
                    $scope.error_data = [];
                    $scope.message = '';
                }
            };

            $scope.start_over = function(){
                $scope.current_step = 1;
                $scope.excel_file = '';
                $scope.review_data = [];
                $scope.error_data = [];
                $scope.message = '';
            };

            $scope.submit_upload_form = function(){
                $('#validate-form').submit();
                $('.lockModal').show();
            };

            $scope.set_file = function(element) {
                $scope.$apply(function($scope) {
                    var extension = element.files[0].name.substring(element.files[0].name.lastIndexOf('.') + 1);
                    if(extension != 'xls' && extension != 'xlsx') {
                        $scope.excel_file = '';
                        bootbox.alert("Please upload valid excel file");
                    }else{
                        if(element.files[0].size > $scope.limit_file_size){
                            bootbox.alert("Sorry! There's a maximum file size of 1 megabyte.");
                        }else{
                            $scope.excel_file = element.files[0];
                        }
                    }
                });
            };

            $scope.is_valid_excel_file = function(){
                if(!$scope.excel_file){
                    return false;
                }else{
                    return true;
                }
            };

            $scope.import_data = function(){
                $.ajax({
                    type: "POST",
                    url: $scope.submit_import_url,
                    data: {'data': JSON.stringify($scope.review_data)},
                    success: function(result) {
                        $scope.$apply(function($scope) {
                            $scope.message = result.message;
                            $scope.current_step = 3;
                        });
                    }
                });
            };

            $scope.get_payment_method = function(payment_val){
                switch (payment_val){
                    case 1:
                        return $scope.payment_method_list[0];
                    case 2:
                        return $scope.payment_method_list[1];
                }
            };

            $scope.get_status = function(status_val){
                switch (status_val){
                    case 1:
                        return $scope.status_list[0];
                    case 2:
                        return $scope.status_list[1];
                    case 3:
                        return $scope.status_list[2];
                }
            };
		}
	]);
}).call(this);