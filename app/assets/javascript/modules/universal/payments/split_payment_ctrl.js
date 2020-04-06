(function() {
    this.app.controller('SplitPaymentCtrl', [
        "$scope",
        function($scope) {
            var shouldAllowSubmit = false;
            
            $scope.total = '0';
            $scope.splitment_message = '';
            $scope.newEmail = null;
            $scope.emails = [];
            $scope.amounts = [];
            $scope.isSubmitButtonDisabled = false;
            
            $scope.addNewEmail = function () {
                var newEmail, 
                    regex;
                
                if (!$scope.newEmail) {
                    return;
                }
                
                regex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+$/i;
                
                newEmail = $scope.newEmail.toLowerCase();
                if (!regex.test(newEmail)) {
                    bootbox.alert('Invalid email address, please update and try again.');
                    return;
                }
                
                if($.inArray(newEmail, $scope.emails) > -1){
                    bootbox.alert($scope.newEmail + ' has already been in the list.');
                    return;
                }                
                
                $scope.emails.push(newEmail);
                $scope.amounts.push(0);
                $scope.newEmail = null;
            };
            
            $scope.removeEmail = function (index) {
                bootbox.confirm("<p class='center'>Are you sure you want to remove this splitment?</p>", function(confirm){
                    if (!confirm) {
                        return;
                    }
                    
                    $scope.$apply(function() {
                        $scope.emails.splice(index, 1); 
                        $scope.amounts.splice(index, 1);
                    });
                });
            };
            
            $scope.splitEvenly = function () {
                var i,
                    totalCents,
                    sharedCents,
                    remainingCents;
                
                if (!$scope.amounts.length) {
                    return;
                }
                
                totalCents = Math.floor(Big($scope.total).times(100).toString());
                sharedCents = Math.floor(Big(totalCents).div($scope.amounts.length).toString());
                remainingCents = totalCents % $scope.amounts.length;

                for (i = 0; i < $scope.amounts.length; i++) {
                    $scope.amounts[i] = sharedCents;
                }
                
                i = 0;
                while(remainingCents > 0) {
                    $scope.amounts[i] += 1;
                    remainingCents -= 1;
                    i++;
                }
                
                for (i = 0; i < $scope.amounts.length; i++) {
                    $scope.amounts[i] = parseFloat(Big($scope.amounts[i]).div(100).toString());
                }
            };
            
            $scope.submit = function(e) {
                var target,
                    i,
                    amount,
                    areAllPositive,
                    splitsTotalCents,
                    totalCents;
                
                if (shouldAllowSubmit) {
                    return;
                }
                
                target = $(e.target);
                e.preventDefault();
                
                if (!$scope.amounts.length) {
                    bootbox.alert('Please add at least one item.');
                    return;
                }
                
                areAllPositive = true;
                splitsTotal = Big('0');
                
                for (i = 0; i < $scope.amounts.length; i++) {
                    amount = $scope.amounts[i];
                    
                    if (amount <= 0) {
                        areAllPositive = false;
                        break;
                    }
                    
                    splitsTotal = splitsTotal.plus(amount);
                }
                
                if (!areAllPositive) {
                    bootbox.alert('All items must be greater than 0.');
                    return;
                }
                
                if (!splitsTotal.eq($scope.total)) {
                    bootbox.alert('Total of all items must be equal to ' + $scope.total + '.');
                    return;
                }
                
                $scope.isSubmitButtonDisabled = true;
                shouldAllowSubmit = true;
                target.submit();
                shouldAllowSubmit = false;
            };
        }
    ]);
}).call(this);