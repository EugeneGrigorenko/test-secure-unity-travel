(function() {
    this.app.controller('CheckinCtrl', [
        "$scope", "$timeout",
        function($scope, $timeout) {

            $scope.pc_number = '';
            $scope.pc_number_color = '#1b274c';

            $scope.current_step = 0;
            $scope.step_title = 'Welcome';
            $scope.hidden_image = '';
            $scope.phone_number = '';
            $scope.order_number = '';
            $scope.email = '';
            $scope.search_order_url = '';
            $scope.get_checkin_order_item_by_user_url = '';
            $scope.submit_url = '';
            $scope.checkin_items = [];
            $scope.users = [];
            $scope.user_info = {};
            $scope.this_is_my_phone = false;
            $scope.original_image = '';
            $scope.counter = -1;
            $scope.new_phone_number = '';

            $scope.new_gender = '';
            $scope.is_edit_phone_enabled = false;
            $scope.is_edit_birthday_enabled = false;
            $scope.is_edit_gender_enabled = false;
            $scope.is_going_back = false;
            $scope.bd_years = [];
            $scope.new_bd_day = '';
            $scope.new_bd_month = '';
            $scope.new_bd_year = '';
            $scope.acknowledgement_checked = false;

            //check-in location
            $scope.checkin_locations = [];
            $scope.location_id = '';
            $scope.location_name = '';

            var indexedEventNames = [];

            $scope.init = new function(){};

            $scope.isColor = function(str){
              var colorRegex = /(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)/;
              return colorRegex.test(str);
            };

            $scope.isNumber1to99Regex = function(str){
                var number1to99Regex = /(^[1-9]{1}$|^[1-9]{1}[0-9]{1}$)/gm;
                return number1to99Regex.test(str);
            };

            $scope.$watch("location_id", function(){
                if($scope.checkin_locations.length > 0){
                    var location = $.grep($scope.checkin_locations, function(l){return l.id == $scope.location_id})[0];
                    $scope.location_name = location != null ? location.name : '';
                }
            });

            $scope.$watch("pc_number", function(new_value, old_value){
                if (new_value != ''){
                    var number1to99Regex = /(^[1-9]{1}$|^[1-9]{1}[0-9]{1}$)/gm;
                    var isValid = number1to99Regex.test(new_value);
                    if (!isValid){
                        $scope.pc_number = old_value;
                    }
                }
            });

            $scope.verify_access_code = function(access_code_verified, verify_checkin_access_code_url){

                if(access_code_verified){
                    $scope.current_step = 1;
                    $scope.enable_main_camera();
                    return;
                }

                $("#checkinAccessCodeModal").on("show.bs.modal", function() {

                    $("#quit_checkin_btn").on("click", function(e){
                        window.location.replace('/');
                    });

                    $("#done_checkin_btn").on("click", function(e){
                        $("#checkinAccessCodeModal").modal('hide');
                        $scope.$apply(function() {
                            $scope.current_step = 1;
                            $scope.enable_main_camera();
                        });
                    });

                    $("#enter_checkin_btn").on("click", function(e) {
                        var access_code = $("#checkin_access_code_tb").val();

                        if(access_code == ''){
                            $("#checkinAccessCodeModal .error").text('Access code is required!').show().fadeOut(2000);
                            e.preventDefault();
                            return;
                        }

                        if($scope.pc_number != '' && !$scope.isNumber1to99Regex($scope.pc_number)){
                            $("#checkinAccessCodeModal .error").text('PC number is required from 1 to 99!').show().fadeOut(2000);
                            e.preventDefault();
                            return;
                        }

                        if($scope.pc_number_color != '' && !$scope.isColor($scope.pc_number_color)){
                            $("#checkinAccessCodeModal .error").text('PC number color is wrong format!').show().fadeOut(2000);
                            e.preventDefault();
                            return;
                        }

                        var check_access_code_result = $scope.check_access_code(access_code, verify_checkin_access_code_url);
                        if(check_access_code_result.is_valid){
                            //hide 'Enter' button & access_code_div
                            $('#enter_checkin_btn').hide();
                            $('#access_code_div').hide();

                            //show 'Done' button and camerrar_checking_div --> this is to enable allow access to camerrar
                            $('#camerrar_checking_div').show();
                            $scope.enable_test_camera();
                            $('#done_checkin_btn').show();

                        }else{
                            $("#checkinAccessCodeModal .error").text(check_access_code_result.error_message).show().fadeOut(4000);
                            e.preventDefault();
                        }
                    });
                });

                $('#checkinAccessCodeModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            }

            $scope.check_access_code = function(access_code, verify_checkin_access_code_url){
                var result = {};
                $.ajax({
                    type: "POST",
                    url: verify_checkin_access_code_url,
                    data: {
                        'password': access_code,
                        access_pc_number: $scope.pc_number,
                        access_pc_number_color: $scope.pc_number_color,
                        location_id: $scope.location_id,
                        location_name: $scope.location_name
                    },
                    async: false,
                    success: function(r) { result = r; }
                });
                return result;
            };

            $scope.$watch("current_step", function(){
                switch($scope.current_step){
                    case 0:case 1: $scope.step_title = 'Welcome'; break;
                    case 2: $scope.step_title = "Let's find your order"; break;
                    case 3:case 4: $scope.step_title = 'Confirm your order'; break;
                    case 5: $scope.step_title = 'Confirm your phone'; break;
                    case 6: $scope.step_title = "Smile! Let's take a picture"; break;
                    case 7: $scope.step_title = "More info"; break;
                    case 8: $scope.step_title = 'Finish'; break;
                }
            });

            $scope.get_started = function(){
                $scope.current_step = 2;
                $scope.set_full_screen();
            };

            $scope.this_is_me_click = function(){
                $('#confirmUserInformationModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            };

            $scope.init_camera = function(){
                Webcam.set({
                    width: 300,
                    height: 400,
                    crop_width: 300,
                    crop_height: 400,
                    dest_width: 300,
                    dest_height: 400,
                    image_format: 'jpeg',
                    jpeg_quality: 40 //For JPEG images, this is the desired quality, from 0 (worst) to 100 (best).
                });
            };

            $scope.enable_test_camera = function(){
                $scope.init_camera();
                Webcam.attach('#testWebcam');
            };

            $scope.enable_main_camera = function(){
                $scope.init_camera();
                Webcam.attach('#main_camera');
            };

            $scope.auto_search_order = function(){
                if(($scope.phone_number != '' || $scope.email != '' || $scope.order_number != '') && !$scope.is_going_back){
                    $scope.search_order();
                }
            };

            $scope.search_order = function(){

                //verify input data
                if($scope.phone_number == '' && $scope.order_number == '' && $scope.email == ''){
                    $('.second-screen .search_error').html('Please input at least one informtion below <button class="close" data-hide="error">x</button>').show();
                    return;
                }

                //verify email address
                var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if($scope.email != '' && !regex.test($scope.email)){
                    $('.second-screen .search_error').html('Your email is not valid. Please input the correct email format. <button class="close" data-hide="error">x</button>').show();
                    return;
                }

                $.ajax({
                    type: "POST",
                    url: $scope.search_order_url,
                    data: {
                        'phone_number': $scope.phone_number,
                        'order_number': $scope.order_number,
                        'email': $scope.email},
                    success: function (result) {
                        if(result.success){
                            $('.second-screen .search_warning').hide();
                            $('.second-screen .search_error').hide();
                            $scope.$apply(function() {
                                $scope.users = result.users;
                                if ($scope.users.length == 1) {
                                    $scope.user_info = result.users[0];
                                    $scope.checkin_items = result.checkin_order_items;
                                    $scope.current_step = 4;
                                } else {
                                    $scope.current_step = 3;
                                }
                            });
                        }else{
                            $('.second-screen .search_warning').hide();
                            $('.second-screen .search_error').hide();

                            if (result.message_status == 'warning')
                                $('.second-screen .search_warning').html(result.message + '<button class="close" data-hide="error">x</button>').show();
                            else if (result.message_status == 'error')
                                $('.second-screen .search_error').html(result.message + '<button class="close" data-hide="error">x</button>').show();

                            if (result.users.length == 1) {
                                $('#search-form').hide();
                                $('#already-checkin-container').show();
                                $scope.$apply(function() {
                                    $scope.user_info = result.users[0];
                                    $scope.checkin_items = result.checkin_order_items;
                                });
                            } else {
                                $scope.is_going_back = true;
                            }
                        }
                    }
                });
            };

            $scope.confirm_information = function(){
                $scope.capture_hidden_image();
                $("#confirmUserInformationModal").modal('hide');
                $scope.current_step = 5;
            };

            $scope.edit_birthday_click = function(){
                if($scope.new_bd_day != '' && $scope.new_bd_month != '' && $scope.new_bd_year != ''){
                    $scope.user_info.new_birthday_day = $scope.new_bd_day;
                    $scope.user_info.new_birthday_month = $scope.new_bd_month;
                    $scope.user_info.new_birthday_year = $scope.new_bd_year;
                }else{
                    $scope.new_bd_day = $scope.user_info.user_birthday_day;
                    $scope.new_bd_month = $scope.user_info.user_birthday_month;
                    $scope.new_bd_year = $scope.user_info.user_birthday_year;
                }
                $scope.is_edit_birthday_enabled = true;
            };

            $scope.cancel_update_birthday = function(){
                if($scope.user_info.new_birthday_day != ''){
                    $scope.new_bd_day = $scope.user_info.new_birthday_day;
                    $scope.new_bd_month = $scope.user_info.new_birthday_month;
                    $scope.new_bd_year = $scope.user_info.new_birthday_year;
                }else{
                    $scope.new_bd_day = $scope.user_info.user_birthday_day;
                    $scope.new_bd_month = $scope.user_info.user_birthday_month;
                    $scope.new_bd_year = $scope.user_info.user_birthday_year;
                }
                $scope.is_edit_birthday_enabled = false;
            };

            $scope.update_birthday = function(){
                if ($scope.new_bd_day != '' && $scope.new_bd_month != '' && $scope.new_bd_year != ''){
                    $scope.is_edit_birthday_enabled = false;
                }
            };

            $scope.edit_phone_click = function(){
                if($scope.new_phone_number == ''){
                    $scope.new_phone_number = $scope.user_info.user_phone;
                }
                $scope.is_edit_phone_enabled = true;
                $scope.this_is_my_phone = false;
            };

            $scope.cancel_update_phone_number = function(){
                $scope.new_phone_number = '';
                $scope.is_edit_phone_enabled = false;
            };

            $scope.update_phone_number = function(){
                $scope.new_phone_number = $scope.new_phone_number.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                $scope.is_edit_phone_enabled = false;
            };

            $scope.confirm_phone = function(){
                if($scope.this_is_my_phone)
                    $scope.current_step = 6;
                else
                    $('.confirm_phone_error').html('Please tick on the checkbox <b>"This is my phone number"</b> <button class="close" data-hide="error">x</button>').show();
            };

            $scope.edit_gender_click = function(){
                if($scope.new_gender != '' && $scope.new_gender != $scope.user_info.user_gender){
                    $scope.user_info.new_gender = $scope.new_gender;
                }
                else{
                    $scope.new_gender = $scope.user_info.user_gender;
                }
                $scope.is_edit_gender_enabled = true;
            };

            $scope.cancel_update_gender = function(){
                if($scope.user_info.new_gender != ''){
                    $scope.new_gender = $scope.user_info.new_gender;
                }else{
                    $scope.new_gender = $scope.user_info.user_gender;
                }
                $scope.is_edit_gender_enabled = false;
            };

            $scope.update_gender = function(){
                $scope.new_gender = $scope.new_gender;
                $scope.is_edit_gender_enabled = false;
            };

            $scope.choose_user = function(user_id){
                for(var i = 0; i < $scope.users.length; i++){
                    if($scope.users[i].user_id == user_id){
                        $scope.user_info = $scope.users[i];
                        $scope.checkin_items = $scope.get_checkin_order_item_by_user(user_id);
                        $scope.current_step = 4;
                        break;
                    }
                }
            };

            $scope.get_checkin_order_item_by_user = function(user_id){
                var checkin_items = [];
                $.ajax({
                    type: "POST",
                    url: $scope.get_checkin_order_item_by_user_url,
                    data: {'user_id': user_id},
                    async: false,
                    success: function (result) {
                        if(result.length == 0){
                            bootbox.alert("Search result is empty");
                        }else{
                            checkin_items = result;
                        }
                    }
                });
                return checkin_items;
            };

            $scope.capture_hidden_image = function() {
                Webcam.snap(function(b64_code) { $scope.hidden_image = b64_code; } );
            };

            $scope.take_a_picture = function(){
                Webcam.snap(function(image_uri) {
                    $scope.original_image = image_uri;
                    $('#original_image').attr("src", $scope.original_image);
                });
            };

            $scope.start_count_down = function(){
                $scope.counter = 4;
                $scope.reset_original_image();
                $scope.countdown();
            };

            $scope.take_picture_again = function(){
                $scope.reset_original_image();
                $scope.counter = 4;
                $scope.countdown();
            };

            $scope.countdown = function() {
                stopped = $timeout(function() {
                    $scope.counter--;
                    if ($scope.counter == 0){
                        $scope.stop();
                        $timeout(function() {
                            $scope.take_a_picture();
                            $scope.counter--;
                        }, 500);
                    }else{
                        $scope.countdown();
                    }
                }, 1000);
            };

            $scope.stop = function(){
                $timeout.cancel(stopped);
            };

            $scope.confirm_picture = function(){
                $scope.current_step = 7;
            };

            $scope.submit_checkin = function(){
                $.ajax({
                    type: "POST",
                    url: $scope.submit_url,
                    data: {
                        'hidden_image': $scope.hidden_image,
                        'original_image': $scope.original_image,
                        'checkin_items': JSON.stringify($scope.checkin_items),
                        'user_id': $scope.user_info.user_id,
                        'new_phone_number': $scope.new_phone_number,
                        'new_birthday_day': $scope.new_bd_day,
                        'new_birthday_month': $scope.new_bd_month,
                        'new_birthday_year': $scope.new_bd_year,
                        'new_gender': $scope.new_gender,
                        'location_id': $scope.location_id
                    },
                    success: function (result) {
                        if (result.is_success) {
                            $scope.$apply(function(){
                                $scope.current_step = 8;
                            });
                        }
                        else{
                            bootbox.alert(result.message);
                        }
                    }
                });
            };

            $scope.more_info_data_not_completed = function(){
                return $scope.is_edit_birthday_enabled
                    || $scope.is_edit_gender_enabled
                    || !$scope.acknowledgement_checked
                    || ($scope.user_info.user_gender == '' && $scope.new_gender == '')
                    || ($scope.user_info.user_birthday_year == '' && $scope.new_bd_month == '' && $scope.new_bd_year == '' && $scope.new_bd_day == '')
            };

            $scope.go_back = function(){
                $scope.is_going_back = true;

                if($scope.current_step == 4){
                    $("#confirmUserInformationModal").modal('hide');
                }
                if($scope.current_step == 4 && $scope.users.length == 1){
                    $scope.current_step -= 2;
                    return;
                }
                if($scope.current_step == 5){
                    $scope.cancel_update_phone_number();
                    $scope.this_is_my_phone = false;
                }
                if($scope.current_step == 6){
                    $scope.this_is_my_phone = false;
                    $scope.reset_original_image();
                }

                if($scope.current_step == 7){
                    $scope.cancel_update_birthday();
                    $scope.cancel_update_gender();
                }

                $scope.current_step -= 1;
            };

            $scope.start_over = function(){
                $scope.current_step = 1;
                $scope.hidden_image = '';
                $scope.phone_number = '';
                $scope.order_number = '';
                $scope.email = '';
                $scope.checkin_items = [];
                $scope.users = [];
                $scope.user_info = {};
                $scope.this_is_my_phone = false;
                $scope.counter = -1;
                $scope.new_phone_number = '';
                $scope.new_bd_day = '';
                $scope.new_bd_month = '';
                $scope.new_bd_year = '';
                $scope.new_gender = '';
                $scope.is_edit_phone_enabled = false;
                $scope.is_edit_birthday_enabled = false;
                $scope.is_edit_gender_enabled = false;
                $scope.is_going_back = false;
                $scope.acknowledgement_checked = false;
                $scope.reset_original_image();
                $('.step-main-content .alert-error').each(function() {
                    $(this).hide(); //clean all error notify display
                });
                $('.second-screen .search_warning').hide();
                $('.second-screen .search_error').hide();
                $('#search-form').show();
                $('#already-checkin-container').hide();
            };

            $scope.reset_original_image = function(){
                $scope.original_image = '';
                $('#original_image').attr("src", "");
            };

            $scope.checkinItemToFilter = function() {
                indexedEventNames = [];
                return $scope.checkin_items;
            };

            $scope.filterEventName = function(checkinItem) {
                var eventNameIsNew = indexedEventNames.indexOf(checkinItem.event_name) == -1;
                if (eventNameIsNew) {
                    indexedEventNames.push(checkinItem.event_name);
                }
                return eventNameIsNew;
            };

            $scope.date_selected_change = function(){
                if($scope.new_bd_month == '2' && parseInt($scope.new_bd_day) > 28){
                    $scope.new_bd_day = '28';
                }
                else if($scope.new_bd_day == '31' && ['1','3','5','7','8','10','12'].indexOf($scope.new_bd_month) < 0){
                    $scope.new_bd_day = '30';
                }
            };

            $scope.convertToDate = function(year, month, day){
                if(year != '' && month != '' && day != '' && year != undefined && month != undefined && day != undefined){
                    return $.datepicker.formatDate('M dd, yy', new Date(year, parseInt(month) - 1, day));
                }
            };

            $scope.set_full_screen = function(){
                var docElement, request;

                docElement = document.documentElement;
                request = docElement.requestFullScreen || docElement.webkitRequestFullScreen || docElement.mozRequestFullScreen || docElement.msRequestFullScreen;

                if(typeof request!="undefined" && request)
                    request.call(docElement);
            };

            $scope.showHideAcknowledgeModal = function(is_showing){
                if(is_showing){
                    $('#acknowledgementOfRiskModel').modal({
                        backdrop: 'none',
                        keyboard: false
                    });
                }else{
                    $('#acknowledgementOfRiskModel').modal('hide');
                }
            };
        }
    ]);
}).call(this);