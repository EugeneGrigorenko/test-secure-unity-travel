(function() {
    this.app.controller('UpdateLayawayMemberCtrl', [
        "$scope",
        function($scope) {
            $scope.listActionType =
            {0:[
                {text:'Replace Member', value:'replace'},
                {text:'Remove Member', value:'remove'}
               ],
             1:[
                 {text:'Refund', value:'refund'},
                 {text:'NoRefund', value:'norefund'}
               ]}
            ;
            $scope.order_id = '';
            $scope.userMember = [];
            $scope.searchUserList = [];
            $scope.selectedActionTypeStep1 = $scope.listActionType[0][0];
            $scope.selectedActionTypeStep4 = $scope.listActionType[1][0];
            $scope.selectedUser = '';
            $scope.selectedMember = '';
            $scope.isSelectedUser = false;
            $scope.activeStep = 1;
            $scope.result = {};
            $scope.stepTemp = 1;

            $scope.$watch('userMember', function(value){
                if (value.length == 1){
                    $scope.listActionType =
                    {0:[
                        {text:'Replace Member', value:'replace'}
                    ],
                        1:[
                            {text:'Refund', value:'refund'},
                            {text:'NoRefund', value:'norefund'}
                        ]}
                    ;
                }
            });

            $scope.actionTypeChange = function(){
                $scope.stepTemp = $scope.selectedActionTypeStep1.value == 'remove' ? 0 : 1;
            };

            $scope.validateStepOne = function(){
                if($scope.selectedActionTypeStep1)
                    return true;
            };

            $scope.validateStepTwo = function(){
                if($scope.selectedUser)
                    return true;
            };
            $scope.validateStepThree = function(){
                if($scope.selectedMember)
                    return true;
            };
            $scope.validateStepFour = function(){
                return true;
            };
            $scope.validateStepFive = function(){
                return true;
            };

            $scope.enterSearchUser = function(event, search_string){
                if(event.which === 13){
                    $scope.searchUser(search_string);
                }
            };

            $scope.searchUser = function(search_string){
                if (search_string && search_string.trim() != ''){
                    $.ajax({
                        type: 'POST',
                        data: { search_string: search_string },
                        url: '/admins/search-user',
                        dataType: 'json',
                        async: false,
                        success: function (result) {
                            if(result && result.length) {
                                $scope.searchUserList = result;
                            }
                        }
                    });

                    $scope.selectedUser = '';
                    $scope.isSelectedUser = false;
                }
            };

            $scope.selectUser = function(user){
                $scope.selectedUser = user;
                $scope.isSelectedUser = true;
            };

            $scope.selectMember = function(member){
                $scope.selectedMember = member;
            }

            $scope.nextStep = function(step){
                switch (step){
                    case 1:
                        if($scope.validateStepOne()){
                            if($scope.selectedActionTypeStep1.value == 'replace'){
                                $scope.setActiveStep(2);
                            }else{
                                $scope.setActiveStep(3);
                            }
                        }
                        break;
                    case 2:
                        if($scope.validateStepTwo()){
                            $scope.setActiveStep(3);
                        }
                        break;
                    case 3:
                        if($scope.validateStepThree()){
                            $scope.setActiveStep(4);
                        }
                        break;
                    case 4:
                        if($scope.validateStepFour()){
                            var message_confirm = '';
                            if ($scope.selectedActionTypeStep1.value == 'remove'){
                                message_confirm = 'Do you want to remove ' + $scope.selectedMember.email;
                            }else{
                                message_confirm = 'Do you want to replace ' + $scope.selectedUser.email + ' to ' + $scope.selectedMember.email;
                            }

                            if ($scope.selectedActionTypeStep4.value == 'refund'){
                                message_confirm += ' with refund?';
                            }else{
                                message_confirm += ' without refund?';
                            }

                            bootbox.confirm(message_confirm,
                                function (result){
                                    if (result) {
                                        $.ajax({
                                            type: 'POST',
                                            data: { order_id: $scope.order_id,
                                                replace_or_remove: $scope.selectedActionTypeStep1.value,
                                                selected_user_id: $scope.selectedUser.id,
                                                selected_member_user_id: $scope.selectedMember.user_id,
                                                selected_member_email: $scope.selectedMember.email,
                                                refund_or_norefund: $scope.selectedActionTypeStep4.value },
                                            url: '/orders/submit-update-layaway-member',
                                            async: false,
                                            success: function (result) {
                                                $scope.$apply(function(){
                                                    $scope.result = result;
                                                    $scope.setActiveStep(5);
                                                });
                                            }
                                        });
                                    }
                                }
                            );
                        }
                        break;
                    case 5:
                        if($scope.validateStepFive()){
                            alert("DONE");
                        }
                        break;
                }
            };
            $scope.previousStep = function(step){
                switch (step){
                    case 2:
                        $scope.setActiveStep(1);
                        break;
                    case 3:
                        if($scope.selectedActionTypeStep1.value == 'replace'){
                            $scope.setActiveStep(2);
                        }else{
                            $scope.setActiveStep(1);
                        }
                        break;
                    case 4:
                        $scope.setActiveStep(3);
                        break;
                    case 5:
                        $scope.setActiveStep(4);
                        break;
                }
            };

            $scope.removeSelectedUser = function(){
                $scope.isSelectedUser = false;
                $scope.selectedUser = '';
            };

            $scope.init = function(){
            };

            $scope.setActiveStep = function(step_number){
                $scope.activeStep = step_number;
                $('.stepwizard a[href="#step' + step_number + '"]').tab('show');
            };
        }
    ]);
}).call(this);