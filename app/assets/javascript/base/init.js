$.ajaxSetup({
	headers : {
		'X-Wiselinks' : 'template'
	}
});

// Remove Facebook #_=_ append
if (window.location.hash == '#_=_') {
    window.location.hash = '';
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function removeParamByName(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01-Jan-70 00:00:01 GMT;path=/";
}
function eraseCookie(name) {
	createCookie(name,"",-1);
}

function isValidEmail(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

//get current location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            codeLatLng(position.coords.latitude, position.coords.longitude);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function codeLatLng(lat, lng) {
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if(status != google.maps.GeocoderStatus.OK){
            console.log("Geocoder failed due to: " + status);
            return;
        }
        if (results[1]) {
            var indice=0;
            for (var j=0; j<results.length; j++)
            {
                if (results[j].types[0]=='locality')
                {
                    indice=j;
                    break;
                }
            }
            for (var i=0; i<results[j].address_components.length; i++)
            {
                if (results[j].address_components[i].types[0] == "locality") {
                    city = results[j].address_components[i];
                }
                if (results[j].address_components[i].types[0] == "administrative_area_level_1") {
                    region = results[j].address_components[i];
                }
                if (results[j].address_components[i].types[0] == "country") {
                    country = results[j].address_components[i];
                }
            }
            setCookie("google_country", country.short_name, 365);
            setCookie("google_state", region.short_name, 365);
            setCookie("google_city", city.long_name, 365);
        }
    });
}

window.JusCollege = { pageDoneCallback: null };

$(function() {
    window.onload = function() {
        localStorage.removeItem('selectedTab');
    };
    
	window.wiselinks = new Wiselinks($('#yield_container'));

    $(document).off('page:always').on(
        'page:always',
        function (event, xhr, settings) {
            // Enable table sorter after load Ajax
            $(".tablesorter").tablesorter();

            // Enable tooltip show  after load Ajax
            $('[data-toggle="tooltip"]').tooltip();
            $(document).bind("ajaxSend", function(){
                $(".lockModal").show();
            });
            // close timer for activityHistory auto-refresh function
            if (window.refreshIntervalId){
                clearInterval(window.refreshIntervalId);
            }
        }
    );
	
	// Integrate wiselinks with angularjs
	$(document).off('page:done').on(
	    'page:done',
	    function(event, $target, render, url) {
	      	var scope = angular.element($('html')).scope(),
	      	  	container = $('#yield_container');

	      	scope.compile_content(container.contents());

	      	// Clean up and re-create easy drop down
	      	try { $('select.dropdown').easyDropDown('destroy'); }
            catch(e) {}
            finally { $('select.dropdown').easyDropDown(); }

	      	if (JusCollege.pageDoneCallback) {
	      		JusCollege.pageDoneCallback();
	      	}

            if($(container).find('.tab-panel .page-size-combobox').length > 0){
                var tab_id = getParameterByName('tab_id');
                if($.trim(tab_id) != "")
                {
                    var object = $(".nav-tabs a[href='#" + tab_id + "']");
                    if(object.length > 0) object.click();
                }
            }

            var selectedTab = localStorage.getItem('selectedTab');
            if (selectedTab) {
                $(".nav-tabs a[href='"+selectedTab+"']").tab('show');
                localStorage.removeItem('selectedTab');
            }
	    }
	);

	// Fix conflict between bootstrap dropdown and wiselinks
	$('.dropdown-menu a[data-push=true]').click(function() {
		$(this).closest('.dropdown').removeClass('open');
	});
	
	// Override rails default confirm (window.confirm) with bootbox.confirm
	$.rails.allowAction = function(element) {
        var message = element.data('confirm'),
            answer = false;
        if (!message) { return true; }
 
        if ($.rails.fire(element, 'confirm')) {
            bootbox.confirm(message, function(confirmed) {
                if(!confirmed) return;

                var callback = $.rails.fire(element, 'confirm:complete', [answer]);

                if(callback) {
                    var oldAllowAction = $.rails.allowAction;
                    $.rails.allowAction = function() { return true; };
                    if (element.prop("tagName") === 'FORM') element.trigger('submit');
                    else element.trigger('click');
                    $.rails.allowAction = oldAllowAction;
                }
            });
        }
        return false;
    };

    $('html').on('click', '.pagination a', function (e) {
        var url = $(this).attr('href');
        if(url.indexOf("tab_id") >= 0){
            $(this).attr('href',removeParamByName('tab_id', url));
        }
    });

    function centerHorizontally(objectID) {
        var thisObj = document.getElementById(objectID);
        var width = (window.innerWidth) ? window.innerWidth : document.body.clientWidth;
        var objectWidth = parseInt(thisObj.offsetWidth);
        var newLocation = (width - objectWidth) / 2;
        thisObj.style.left = newLocation + 'px';
    }

    $(window).resize(function() {
        if($('#ui-datepicker-div').is(':visible'))
            centerHorizontally('ui-datepicker-div');
    });
});

