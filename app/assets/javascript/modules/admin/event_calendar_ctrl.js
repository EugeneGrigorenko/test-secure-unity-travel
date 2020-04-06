(function() {
    this.app.controller('CalendarCtrl', [
        "$scope", "$compile", "uiCalendarConfig",
        function($scope, $compile, uiCalendarConfig) {
            $scope.events = [];
            $scope.eventSources = [$scope.events];
            $scope.disable_today_button = true;

            $scope.init = function(){};

            $scope.getEventsList = function(calendar){
                var moment = uiCalendarConfig.calendars[calendar].fullCalendar('getDate');
                $.ajax({
                    type: "POST",
                    url: '/events/get_event_calendar',
                    data: {'year': moment.year(), 'month': moment.month() + 1},
                    success: function(data) {
                        $scope.events.splice(0, $scope.events.length);

                        $scope.$apply(function() {
                            $.each(data.event_list, function(index, e){
                                $scope.events.push({
                                    title: e.title,
                                    start: new Date(e.start_Y, e.start_M - 1 , e.start_D, e.start_H, e.start_m),
                                    end: new Date(e.end_Y, e.end_M - 1, e.end_D, e.end_H, e.end_m),
                                    url: e.url,
                                    className: [e.className]
                                });
                            });
                        });
                    }
                });
            };

            $scope.goNext = function(calendar){
                uiCalendarConfig.calendars[calendar].fullCalendar('next');
                $scope.disable_today_button = false;
                $scope.getEventsList(calendar);
            };

            $scope.goBack = function(calendar){
                uiCalendarConfig.calendars[calendar].fullCalendar('prev');
                $scope.disable_today_button = false;
                $scope.getEventsList(calendar);
            };

            $scope.goToday = function(calendar){
                uiCalendarConfig.calendars[calendar].fullCalendar('today');
                $scope.disable_today_button = true;
                $scope.getEventsList(calendar);
            };

            /* alert on eventClick */
            //$scope.alertOnEventClick = function( date, jsEvent, view){
            //    //alert(date.title + ' was clicked ');
            //};

            /* alert on Drop */
            //$scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
            //    //$scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
            //};

            /* alert on Resize */
            //$scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
            //    //$scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
            //};

            /* Change View */
            $scope.changeView = function(view,calendar) {
                uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
            };
            /* Change View */
            $scope.renderCalender = function(calendar) {
                if(uiCalendarConfig.calendars[calendar]){
                    uiCalendarConfig.calendars[calendar].fullCalendar('render');
                }
            };
            /* Render Tooltip */
            //$scope.eventRender = function(event, element, view) {
            //    element.attr({'tooltip': event.title, 'tooltip-append-to-body': true});
            //    $compile(element)($scope);
            //};
            /* config object */
            $scope.uiConfig = {
                calendar:{
                    height: 600,
                    editable: false,
                    header:{
                        left: 'title',
                        center: '',
                        right: ''
                    },
                    allDaySlot: false
                    //eventClick: $scope.alertOnEventClick,
                    //eventDrop: $scope.alertOnDrop,
                    //eventResize: $scope.alertOnResize,
                    //eventRender: $scope.eventRender
                }
            };
        }
    ]);
}).call(this);