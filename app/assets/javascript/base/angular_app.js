(function() {
    var app = angular.module('app', ['nvd3ChartDirectives', 'ui.calendar', 'angularInlineEdit', 'ui.mask']);

    app.config(function($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'https://www.filepicker.io/**'
        ]);
    });

    app.filter('maskString', function () {
        return function (str) {
            if (!str) { return '******'; }

            return str.replace(/./g, '*').trim();
        };
    });

    app.filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });

    app.filter('formatPhone', function () {
        return function (tel) {
            if (!tel) { return ''; }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country == 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " " + city + "-" + number).trim();
        };
    });

    app.filter('noFractionCurrency',
        [ '$filter', '$locale',
            function(filter, locale) {
                var currencyFilter = filter('currency');
                var formats = locale.NUMBER_FORMATS;
                return function(amount, currencySymbol) {
                    var value = currencyFilter(amount, currencySymbol);
                    var sep = value.indexOf(formats.DECIMAL_SEP);
                    if (value.substring(sep + 1) !== '00') {
                        return value;
                    }

                    if(amount >= 0) {
                        return value.substring(0, sep);
                    }
                    return value.substring(0, sep) + ')';
                };
            } ]);

    app.directive('multiselectDropdown', function () {
        return {
            scope: {
                extraSettings: '='
            },
            link: function (scope, element, attributes) {
                scope.settings = {
                    enableCaseInsensitiveFiltering: true,
                    nonSelectedText: 'Select item',
                    includeSelectAllOption: false,
                    filterPlaceholder: '......'
                };

                angular.extend(scope.settings, scope.extraSettings || []);

                element.multiselect({
                    buttonClass: 'btn btn-default',
                    buttonWidth: 'auto',
                    buttonContainer: '<div class="btn-group" />',
                    maxHeight: false,
                    enableCaseInsensitiveFiltering: scope.settings.enableCaseInsensitiveFiltering,
                    filterPlaceholder: scope.settings.filterPlaceholder,
                    nonSelectedText: scope.settings.nonSelectedText,
                    includeSelectAllOption: scope.settings.includeSelectAllOption,
                    buttonText: function (options, select) {
                        if (options.length == 0) { return 'None selected <b class="caret"></b>'; }
                        if (options.length > 3) { return options.length + ' selected  <b class="caret"></b>'; }
                        var selected = '';
                        options.each(function () { selected += $(this).text() + ', '; });
                        return selected.substr(0, selected.length - 2) + ' <b class="caret"></b>';
                    },
                    onChange: function (optionElement, checked) {
                        if (optionElement != null) { optionElement.removeAttr('selected'); }
                        if (checked && optionElement) {  optionElement.prop('selected', 'selected'); }
                        element.change();
                    }
                });

                // Watch for any changes to the length of our select element
                scope.$watch(
                    function () { return element[0].length; },
                    function () { element.multiselect('rebuild');}
                );

                // Watch for any changes from outside the directive and refresh
                scope.$watch(attributes.ngModel, function () {
                    element.multiselect('refresh');
                });

            }
        }
    });

    app.directive('ngOptionsDisabled', ['$parse', function($parse) {
        var disableOptions = function(scope, attr, element, data, fnDisableIfTrue) {
            // refresh the disabled options in the select element.
            var options = element.find('option');
            var pos = 0, index = 0;
            while (pos < options.length) {
                var elem = angular.element(options[pos]);
                if (elem.val() != "" && data) {
                    var locals = {};
                    locals[attr] = data[index];
                    elem.attr('disabled', fnDisableIfTrue(scope, locals));
                    index++;
                }
                pos++;
            }
        };
        return {
            priority: 0,
            require: 'ngModel',
            link: function(scope, el, attrs, ctrl) {
                // parse expression and build array of disabled options
                var expElements = attrs.ngOptionsDisabled.match(
                    /^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
                var attrToWatch = expElements[3];
                var fnDisableIfTrue = $parse(expElements[1]);
                scope.$watch(attrToWatch, function(newValue, oldValue) {
                    if(newValue)
                        disableOptions(scope, expElements[2], el,
                            newValue, fnDisableIfTrue);
                }, true);
                // handle model updates properly
                scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                    var disOptions = $parse(attrToWatch)(scope);
                    if(newValue)
                        disableOptions(scope, expElements[2], el,
                            disOptions, fnDisableIfTrue);
                });
            }
        };
    }]);

    app.directive('onlyNum', function() {
        return function(scope, element, attrs) {

            var keyCode = [8,9,37,39,48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105,110];
            element.bind("keydown", function(event) {
                if($.inArray(event.which,keyCode) == -1) {
                    scope.$apply(function(){
                        scope.$eval(attrs.onlyNum);
                        event.preventDefault();
                    });
                    event.preventDefault();
                }

            });
        };
    });

    app.directive('onlyDecimal', function() {
        return function(scope, element, attrs) {

            var keyCode = [8,9,37,39,48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105,110, 190];
            element.bind("keydown", function(event) {
                if($.inArray(event.which,keyCode) == -1) {
                    scope.$apply(function(){
                        scope.$eval(attrs.onlyNum);
                        event.preventDefault();
                    });
                    event.preventDefault();
                }
            });
        };
    });

    app.directive('smartDecimal', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                    var spiltArray = String(newValue).split("");

                    if (spiltArray.length === 0) return;
                    if (spiltArray.length === 1 && (spiltArray[0] == '-' || spiltArray[0] === '.' )) return;
                    if (spiltArray.length === 2 && newValue === '-.') return;

                    if(attrs.max) {
                        var maxValue = parseFloat(attrs.max);
                        if(maxValue < parseFloat(newValue)){
                            newValue = maxValue;
                            ngModel.$setViewValue(newValue);
                            ngModel.$render();
                        }
                    }

                    if(attrs.min) {
                        var minValue = parseFloat(attrs.min);
                        if(minValue > parseFloat(newValue)){
                            newValue = minValue;
                            ngModel.$setViewValue(newValue);
                            ngModel.$render();
                        }
                    }

                    if(attrs.allowNegative == "false") {
                        if(spiltArray[0] == '-') {
                            newValue = newValue.replace("-", "");
                            ngModel.$setViewValue(newValue);
                            ngModel.$render();
                        }
                    }

                    if(attrs.allowDecimal == "false") {
                        newValue = parseInt(newValue);
                        ngModel.$setViewValue(newValue);
                        ngModel.$render();
                    }

                    if(attrs.allowDecimal != "false") {
                        var fractionNumber = 2;
                        if(attrs.decimalUpto) {
                            fractionNumber = attrs.decimalUpto;
                        }

                        var n = String(newValue).split(".");
                        if(n[1]) {
                            var n2 = n[1].slice(0, fractionNumber);
                            newValue = [n[0], n2].join(".");
                            ngModel.$setViewValue(newValue);
                            ngModel.$render();
                        }
                    }

                    /*Check it is number or not.*/
                    if (isNaN(newValue)) {
                        ngModel.$setViewValue(oldValue);
                        ngModel.$render();
                    }
                });
            }
        };
    });

    app.directive('inputMaxLengthNumber', function() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attrs, ngModelCtrl) {
                function fromUser(text) {
                    var maxlength = Number(attrs.maxlength);
                    if (String(text).length > maxlength) {
                        ngModelCtrl.$setViewValue(ngModelCtrl.$modelValue);
                        ngModelCtrl.$render();
                        return ngModelCtrl.$modelValue;
                    }
                    return text;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    });
           
    app.directive('myMultipleDatesPicker', function($rootScope) {
        function link(scope, element, attrs) {
            var $element = $(element),
                selectableDates = null;
            
            $element.multiDatesPicker({
                onSelect: function(dateText, inst) {
                    var $this = $(this),
                        dates = $this.multiDatesPicker('getDates', 'object'),
                        i,
                        resultDates = [];
                        
                    for(i = 0; i < dates.length; i++) {
                        resultDates.push(moment(dates[i]).format('YYYY-MM-DD'));
                    }
                    
                    scope.$apply(function() {
                        scope.ngModel = resultDates;
                    });
                },
                beforeShowDay: function (date) {                    
                    var isSelectable = true,
                        normalizedDate;
                    
                    if (selectableDates) {
                        normalizedDate = moment(date).format('YYYY-MM-DD');
                        isSelectable = $.inArray(normalizedDate, selectableDates) > -1;
                    }
                    
                    return [isSelectable, ''];
                }
            });
            
            scope.$watch('myMultipleDatesPicker', function(value) {
                var firstDate,
                    today;
                
                selectableDates = value;
                $element.datepicker('refresh');
                if (selectableDates && selectableDates.length > 0) {
                    firstDate = moment(selectableDates[0]).toDate();
                    today = new Date();
                    // check if the first date has different month
                    if (firstDate > today && 
                        (firstDate.getMonth() != today.getMonth() || 
                         firstDate.getFullYear() != today.getFullYear())
                    ) {
                        // Go to the month having the first available date
                        $element.datepicker('setDate', firstDate);
                    }
                }
            });
            
            scope.$watch('ngModel', function(value) {
                var dates = [],
                    i;
                $element.multiDatesPicker('resetDates');
                if (value && value.length) {
                    for (i = 0; i < value.length; i++) {
                        dates.push( moment(value[i]).toDate() );
                    }
                    
                    $element.multiDatesPicker('addDates', dates);
                    $element.datepicker('setDate', dates[0]);
                }
            });
        }
        
        return {
            require: ['^ngModel'],
            scope: {
                ngModel: '=',
                myMultipleDatesPicker: '=myMultipleDatesPicker'
            },
            link: link
        };
    });

    app.directive('tooltip', function() {
        return function(scope, element, attrs) {
            attrs.$observe('title',function(title){
                // Destroy any existing tooltips (otherwise new ones won't get initialized)
                element.tooltip('destroy');
                // Only initialize the tooltip if there's text (prevents empty tooltips)
                if (jQuery.trim(title)) element.tooltip();
            })
            element.on('$destroy', function() {
                element.tooltip('destroy');
                delete attrs.$$observers['title'];
            });
        }
    });

    app.directive('myDatePicker', function($rootScope) {
        function link(scope, element, attrs) {
            var $element = $(element),
                selectableDates = null,
                format_string = 'YYYY-MM-DD';

            $element.addClass("hasNormalDatePicker");

            $element.datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function(dateText, inst) {
                    var selectedDate = moment(dateText).format(format_string);

                    scope.$apply(function() {
                        scope.ngModel = selectedDate;
                    });
                },
                beforeShowDay: function (date) {
                    var isSelectable = true,
                        normalizedDate;

                    if (selectableDates) {
                        normalizedDate = moment(date).format(format_string);
                        isSelectable = $.inArray(normalizedDate, selectableDates) > -1;
                    }

                    return [isSelectable, ''];
                }
            });

            scope.$watch('myDatePicker', function(value) {
                var firstDate, last_date, today;

                today = new Date();
                selectableDates = value;
                $element.datepicker('refresh');

                if (selectableDates && selectableDates.length > 0){
                    firstDate = moment(selectableDates[0]).toDate();
                    last_date = moment(selectableDates[selectableDates.length - 1]).toDate();
                    $element.datepicker("option", {
                        minDate: firstDate,
                        maxDate: last_date,
                        defaultDate: firstDate
                    });
                }

                // check if the first date has different month
                if (firstDate > today &&
                    (firstDate.getMonth() != today.getMonth() || firstDate.getFullYear() != today.getFullYear())) {
                    // Go to the month having the first available date
                    $element.datepicker('setDate', '');
                }

                // Remove today default selection
                $('.ui-datepicker-current-day', $element).removeClass('ui-datepicker-current-day');
            });

            scope.$watch('ngModel', function(value) {
                $element.datepicker('setDate', value ? moment(value).toDate() : null);
                $element.blur();
            });
        }

        return {
            require: ['^ngModel'],
            scope: {
                ngModel: '=',
                myDatePicker: '=myDatePicker'
            },
            link: link
        };
    });

    app.directive('customDatePicker', function($rootScope) {
        function link(scope, element, attrs) {
            var $element = $(element),
                selectableDates = null,
                format_string = 'dddd, MMM DD, YYYY';

            $element.addClass("hasNormalDatePicker");

            $element.datepicker({
                dateFormat: 'DD, M dd, yy',

                onSelect: function(dateText, inst) {
                    var selectedDate = moment(dateText).format(format_string);
                    scope.$apply(function() {
                        scope.ngModel = selectedDate;
                    });
                },
                beforeShowDay: function (date) {
                    var isSelectable = true,
                        normalizedDate;

                    if (selectableDates) {
                        normalizedDate = moment(date).format('YYYY-MM-DD');
                        isSelectable = $.inArray(normalizedDate, selectableDates) > -1;
                    }

                    return [isSelectable, ''];
                }
            });

            scope.$watch('customDatePicker', function(value) {
                var firstDate, today;

                today = new Date();
                selectableDates = value;
                $element.datepicker('refresh');

                if (selectableDates && selectableDates.length > 0)
                    firstDate = moment(selectableDates[0]).toDate();


                // check if the first date has different month
                if (firstDate > today &&
                    (firstDate.getMonth() != today.getMonth() || firstDate.getFullYear() != today.getFullYear())) {
                    // Go to the month having the first available date
                    $element.datepicker('setDate', '');
                }

                // Remove today default selection
                $('.ui-datepicker-current-day', $element).removeClass('ui-datepicker-current-day');
            });

            scope.$watch('ngModel', function(value) {
                $element.datepicker('setDate', value ? moment(value).toDate() : null);
            });
        }

        return {
            require: ['^ngModel'],
            scope: {
                ngModel: '=',
                customDatePicker: '=customDatePicker'
            },
            link: link
        };
    });
    
    app.directive('myRating', function($rootScope) {
        function link(scope, element, attrs) {
            var $element = $(element),
                isReadonly = !!$element.attr('readonly'); // cast to boolean
                        
            $element.raty({ 
                readOnly: isReadonly,
                click: function(score, evt) {
                    scope.$apply(function() {
                        scope.ngModel = score;
                    });
                }
            });
            
            scope.$watch('ngModel', function(value) {
                value = value || 0;
                if($element.raty('score') !== value) {
                    $element.raty('set', {score: value });
                }
            });
        }
        
        return {
            require: ['^ngModel'],
            scope: {
                ngModel: '='
            },
            link: link
        };
    });

    app.directive('fallbackSource', function() {
        return {
            link: function(scope, element, attributes) {

                if (sourceIsEmpty()) { useFallbackSource(); }
                else { listenForSourceLoadingError(); }

                function sourceIsEmpty() {
                    var originalSource = element.attr('src');
                    return originalSource? false : true;
                }

                function useFallbackSource() {
                    element.attr('src', attributes.fallbackSource);
                }

                function listenForSourceLoadingError() {
                    element.bind('error', function() {
                        useFallbackSouce();
                    });
                }
            }
        }
    });

    // Require AngularJS, jQuery and autoNumeric.js from: https://gist.github.com/kwokhou/5964296
    app.directive('crNumeric', [function () {
        'use strict';
        // Declare a empty options object
        var options = {};
        return {
            // Require ng-model in the element attribute for watching changes.
            require: '?ngModel',
            // This directive only works when used in element's attribute (e.g: cr-numeric)
            restrict: 'A',
            compile: function (tElm, tAttrs) {

                var isTextInput = tElm.is('input:text');

                return function (scope, elm, attrs, controller) {
                    // Get instance-specific options.
                    var opts = angular.extend({}, options, scope.$eval(attrs.crNumeric));
                    // Helper method to update autoNumeric with new value.
                    var updateElement = function (element, newVal) {
                        // Only set value if value is numeric
                        if ($.isNumeric(newVal))
                            element.autoNumeric('set', newVal);
                    };

                    // Initialize element as autoNumeric with options.
                    elm.autoNumeric(opts);

                    // if element has controller, wire it (only for <input type="text" />)
                    if (controller && isTextInput) {
                        // watch for external changes to model and re-render element
                        scope.$watch(tAttrs.ngModel, function (current, old) {
                            controller.$render();
                        });
                        // render element as autoNumeric
                        controller.$render = function () {
                            updateElement(elm, controller.$viewValue);
                        }
                        // Detect changes on element and update model.
                        elm.on('change', function (e) {
                            scope.$apply(function () {
                                controller.$setViewValue(elm.autoNumeric('get'));
                            });
                        });
                    }
                    else {
                        // Listen for changes to value changes and re-render element.
                        // Useful when binding to a readonly input field.
                        if (isTextInput) {
                            attrs.$observe('value', function (val) {
                                updateElement(elm, val);
                            });
                        }
                    }
                }
            } // compile
        } // return
    }]);

    app.directive('comboDate', function($timeout) {
        return {
            restrict : 'A',
            require:'ngModel',
            scope:{
                ngModel:'=',
                extraSettings: '='
            },
            link : function(scope, element, attr) {
                var maxYear = (new Date()).getFullYear() + 10;
                var minYear = (new Date()).getFullYear() - 10;
                scope.settings = {
                    firstItem: 'name',
                    maxYear: maxYear,
                    minYear: minYear,
                    format:'DD-MM-YYYY',
                    template:'DD / MM / YYYY',
                    smartDays: true
                };

                angular.extend(scope.settings, scope.extraSettings || []);
                function renderComboDate() {
                    var comboElem=angular.element(element);
                    var currentMaxYear = scope.settings.maxYear;
                    var currentMinYear = scope.settings.minYear;
                    if (scope.ngModel != ''){
                        var selectedYear = moment(scope.ngModel).get('year');
                        if (selectedYear > currentMaxYear){
                            currentMaxYear = selectedYear;
                        }else if (selectedYear < currentMinYear){
                            currentMinYear = selectedYear;
                        }
                    }
                    comboElem.combodate({
                        value:scope.ngModel,
                        firstItem: scope.settings.firstItem,
                        format: scope.settings.format,
                        template: scope.settings.template,
                        maxYear: currentMaxYear,
                        minYear: currentMinYear,
                        smartDays: scope.settings.smartDays
                    });
                    comboElem.on('change',function(){
                        scope.ngModel=comboElem.combodate('getValue');
                    });
                    scope.$watch(function () {
                        return scope.ngModel;
                    }, function(newValue) {
                        if(newValue)
                        {
                            comboElem.combodate('setValue',newValue);
                        }
                    });
                }

                $timeout(function() {
                    renderComboDate();
                }, 0);

            }
        }
    });

    app.directive('ckEditor', function() {
        return {
            require: '?ngModel',
            link: function(scope, elm, attr, ngModel) {
                var ck = CKEDITOR.replace(elm[0]);

                if (!ngModel) return;

                ck.on('instanceReady', function() {
                    ck.setData(ngModel.$viewValue);
                });

                function updateModel() {
                    scope.$apply(function() {
                        ngModel.$setViewValue(ck.getData());
                    });
                }

                ck.on('change', updateModel);
                ck.on('key', updateModel);
                ck.on('dataReady', updateModel);

                ngModel.$render = function(value) {
                    ck.setData(ngModel.$viewValue);
                };
            }
        };
    });

    app.factory('cartService', function ($rootScope){
        var totalPrice = 0,
            isUpdate = false,
            items = [],
            bundle = null,
            discounted_items = [],
            addition_fees = [],
            reducedAmount = 0,
            promoCode = null,
            toPayAmount = 0;

        function getToPayAmount() {
            return toPayAmount;
        }

        function setToPayAmount(newToPayAmount) {
            toPayAmount = newToPayAmount;
        }

        function getTotalPrice() {
            return totalPrice;
        }
        
        function setTotalPrice(newPrice) {
            totalPrice = newPrice;
        }
        
        function getItems() {
            return items;
        }
        
        function setItems(newItems) {
            items = newItems;
        }

        function getDiscountedItems() {
            return discounted_items;
        }

        function setDiscountedItems(items) {
            discounted_items = items;
        }

        function getAdditionFees() {
            return addition_fees;
        }

        function setAdditionFees(items) {
            addition_fees = items;
        }
        
        function getReducedAmount() {
            return reducedAmount;
        }
        
        function setReducedAmount(newReducedAmount) {
            reducedAmount = newReducedAmount;
        }

        function getPromoCode() {
            return promoCode;
        }
        
        function setPromoCode(newPromoCode) {
            promoCode = newPromoCode;
        }

        function isUpdateCart() {
            return isUpdate;
        }

        function setUpdateCart(new_value) {
            isUpdate = new_value;
        }

        function setBundle(min_bundle) {
            bundle = min_bundle;
        }

        function getBundle() {
            return bundle;
        }

        function updateCart(cart) {
            var cart_num = $("#cart_num").text();
            $.post("/get_num_of_cart",
                function (result) {
                    $("#cart_num").text(result != '0' ? result : '');
                }, 'json'
            );

            totalPrice = cart.total_price;
            toPayAmount = cart.to_pay_amount;
            items = cart.items;
            discounted_items = cart.discounted_items;
            addition_fees = cart.addition_fees;
            reducedAmount = cart.reduced_amount;
            promoCode = cart.promo_code;
            isUpdate = true;
        }

        refreshPopoverShoppingCart = function(){
            if($('#order_summary .order-summary-popover').hasClass('in')){
                $('#order_summary_popover').popover('hide');
                setTimeout(function(){ $('#order_summary_popover').popover('show'); }, 300);
            }
        }
        
        return {
            getToPayAmount: getToPayAmount,
            setToPayAmount: setToPayAmount,
            getTotalPrice: getTotalPrice,
            setTotalPrice: setTotalPrice,
            getItems: getItems,
            setItems: setItems,
            setBundle: setBundle,
            getBundle: getBundle,
            getDiscountedItems: getDiscountedItems,
            setDiscountedItems: setDiscountedItems,
            getAdditionFees: getAdditionFees,
            setAdditionFees: setAdditionFees,
            getReducedAmount: getReducedAmount,
            setReducedAmount: setReducedAmount,
            getPromoCode: getPromoCode,
            setPromoCode: setPromoCode,
            updateCart: updateCart,
            isUpdateCart: isUpdateCart,
            setUpdateCart: setUpdateCart,
            refreshPopoverShoppingCart: refreshPopoverShoppingCart
        };
    });

    app.factory('csbService', function ($rootScope) {
        var tripDate = {},
            tripWeek = 0,
            departureCityId = 0;

        function setTripDate(selectedTripDate) {
            tripDate = selectedTripDate;
        }
        function setTripWeek(selectedTripWeek) {
            tripWeek = selectedTripWeek;
        }
        function setDepartureCityId(selectedDepartureCityId) {
            departureCityId = selectedDepartureCityId;
        }
        function getTripDate() {
            return tripDate;
        }
        function getTripWeek() {
            return tripWeek;
        }
        function getDepartureCityId() {
            return departureCityId;
        }

        return {
            setTripDate: setTripDate,
            setTripWeek: setTripWeek,
            setDepartureCityId: setDepartureCityId,
            getTripDate: getTripDate,
            getTripWeek: getTripWeek,
            getDepartureCityId: getDepartureCityId
        };
    });

    app.controller('GlobalCtrl', [
        "$scope", '$compile', function($scope, $compile) {
            $scope.current_currency = {};

            $scope.initialize = function(){};

            $scope.compile_content = function(data) {
                $compile(data)($scope);
                $scope.$apply();
            };

            $scope.changeToNextTab = function (event_slug) {
                if (sessionStorage.product_type_length && sessionStorage.current_tab_index < sessionStorage.product_type_length && sessionStorage.current_event_slug == event_slug) {
                    sessionStorage.current_tab_index ++;
                }
            };
        }
    ]);
    
    this.app = app;

}).call(this);
