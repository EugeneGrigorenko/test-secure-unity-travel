(function() {
	this.app.controller('ManageCheckinUsersCtrl', [
		"$scope",
		function($scope) {
            $scope.checkin_users = []; // [{:quanity,:name,:first_name,...}]
            //checkin_items_by_products = [{:product_id => 1, :product_name => '', :total_quantity => 10, :items => items}]
            // items = list of Check_in_items Model by the product
            $scope.checkin_items_by_products = [];
            $scope.current_checkin_items = [];
            $scope.execute_url = '';

            $scope.editCheckinUser = function(current_checkin_items){
                var not_checkin_items = $.grep(current_checkin_items, function(item){
                   return  item.can_change == true;
                });

                $.each(not_checkin_items, function(index, not_checkin_item){
                    var i;
                    for(i = 1 ; i <= not_checkin_item.quantity; i++){
                        var new_checkin_item = new Object();
                        new_checkin_item.id = 0;
                        new_checkin_item.checkin_user_id = not_checkin_item.checkin_user_id;
                        new_checkin_item.checkin_user_name = not_checkin_item.checkin_user_name;
                        new_checkin_item.checkin_user_email = not_checkin_item.checkin_user_email;
                        new_checkin_item.checkin_user_image_url = not_checkin_item.checkin_user_image_url;
                        new_checkin_item.product_id = not_checkin_item.product_id;
                        new_checkin_item.product_name = not_checkin_item.product_name;
                        new_checkin_item.product_image = not_checkin_item.product_image;
                        new_checkin_item.event_id = not_checkin_item.event_id;
                        new_checkin_item.order_id = not_checkin_item.order_id;
                        new_checkin_item.checkin_id = not_checkin_item.checkin_id;
                        new_checkin_item.quantity = 1;
                        new_checkin_item.can_change = true;
                        new_checkin_item.status = 0;
                        new_checkin_item.get_status = 'not check-in';
                        new_checkin_item.email = not_checkin_item.email;
                        new_checkin_item.is_other_option = false;
                        $scope.current_checkin_items.push(new_checkin_item);
                    }
                });
            };

            $scope.selectCheckinUser = function ($index) {
                var id = $('.select-checkin-user:eq(' + $index + ')').val();
                if(id == "" || id == undefined){
                    return;
                }
                var current_item = $scope.current_checkin_items[$index];
                if(id == 'other'){
                    $('input.invite-user:eq(' + $index + ')').fadeIn();
                    current_item.checkin_user_id = current_item.checkin_user_id;
                    current_item.is_other_option = true;
                }
                else{
                    $('input.invite-user:eq(' + $index + ')').fadeOut();
                    current_item.is_other_option = false;
                    current_item.checkin_user_id = id;
                    current_item.email = null;
                }
                $('label.invite-user-error').text('Please provide email to checkin!').hide();
            }

            $scope.updateNewCheckinItem = function(){
                var input_emails = [];
                $.each($scope.current_checkin_items, function (index, item) {
                    if( item.is_other_option == true){
                        input_emails.push(item.email);
                    }
                });

                if($.grep(input_emails, function (email) {return email == ''}).length > 0){
                    $('label.invite-user-error').text('Please provide email to checkin!').show();
                    return;
                }

                if($.grep(input_emails, function (email) {return !isValidEmail(email)}).length > 0){
                    $('label.invite-user-error').text('Email invalid!').show();
                    return;
                }

                //if($.grep(input_emails, function (email) {return !isDuplicateEmail(email)}).length > 0){
                //    $('label.invite-user-error').text('Email is duplicate!').show();
                //    return;
                //}

                var product_id = $scope.current_checkin_items[0].product_id;
                var option = {product_id: product_id, not_checkin_items: $scope.serialize('current_checkin_items')};
                $.post($scope.execute_url, option, function(){});

//                var checkin_items_by_product = $.grep($scope.checkin_items_by_products, function (checkin) {
//                    return checkin.product_id == product_id;
//                })[0];
//                var not_checkin_items =  $.grep(checkin_items_by_product.items, function (item) {
//                    return item.can_change == true;
//                });
//
//                $.each($scope.current_checkin_items, function (index, item) {
//                    if(not_checkin_items[index]){
//                        not_checkin_items[index] = item;
//                    }
//                    else {
//                        not_checkin_items.push(item);
//                    }
//                });
//
//                $('#assignCheckinModal').modal('hide');
            };

            $scope.closeAssignCheckinModal = function(){
                $scope.current_checkin_items = [];
            };

			$scope.serialize = function(fieldName) {
				return angular.toJson($scope[fieldName]);
			};

            function isDuplicateEmail(email){
                for(var i =0; i < $scope.checkin_users.length; i++){
                    if($scope.checkin_users[i].email == email){
                        return false;
                    }
                }
                return true;
            };
		}
	]);
}).call(this);
