(function($) {
    $('body').on('hidden.bs.modal', 'a.modal, div.modal', function () {
        var myModal = $(this);
        var list_of_ignore_forms = [
            "term_and_privacy_modal",
            "flight_policy_modal",
            "hotel_policy_modal",
            "export_orders_modal",
            "showDefaultPropertiesModal",
            "showDefaultImagesModal",
            "viewImageModal",
            "paymentPlanModal",
            "refundPaymentModal",
            "refundPartiallyPaymentModal",
            "changeAmountPaymentModal",
            "assignCheckinModal",
            "confirmUserInformationModal",
            "acknowledgementOfRiskModel",
            "updateQuantityDependentProductModal",
            "applyAffiliateModal",
            "confirmPayDlg",
            "setScheduleModal",
            "sendTestEMAILScheduleModal",
            "sendTestSMSScheduleModal",
            "showFilterConditionsModal",
            "confirmUserPaymentModal",
            "depositBalanceDueModal",
            "csb_room_step_0",
            "csb_room_step_1",
            "csb_room_step_2",
            "csb_room_step_3",
            "csb_search_modal",
            "edit_csb_room_modal",
            "move_passengers_modal",
            "move_guests_modal",
            "confirmDownloadDlg",
            "increase_orders_modal",
            "decrease_orders_modal",
            "adjust_orders_modal",
            "refund_orders_modal",
            "cancel_orders_modal",
            "confirmModal",
            "chosen_export_fields_Modal",
            "fillter_export_fields_Modal",
            "confirmEnoughShuttleBusModal",
            "searchPassportPropertiesModal",
            "customProductDetailsModal",
            "flightDetailsModal",
            "lodgingDetailsModal",
            "sharedLodgingDetailsModal",
            "sharedHotelDetailsModal",
            "travelPackageDetailsModal",
            "addonWithVariantDetailsModal",
            "showEmergencyMessageModal",
            "bar_data_list_modal",
            "showRecipientsModal",
            "showFilterConditionsModal",
            "search-transfer-user-modal",
            "search-transfer-order-modal",
            "notify_to_user_modal",
            "becomeAffiliateModal",
            "eventModal",
            "yoy_download_option_modal",
            "trackingConfirmModal",
            "selectSocialNetworkModal"
        ];
        if (list_of_ignore_forms.indexOf($(this).attr('id')) < 0){
            myModal.removeData('bs.modal');
            $('.modal-content', this).html('<p>Loading...</p>');
        }
    });

	$(document).bind("ajaxSend", function(){
	   	$(".lockModal").show();
	}).bind("ajaxComplete", function(){
        // Enable validation for number textbox
        $('input[type=number]').each(function(){
            $(this).attr('min',0);
            $(this).attr('onCopy','return false');
            $(this).attr('onDrag','return false');
            $(this).attr('onDrop','return false');
            $(this).attr('onPaste','return false');
            $(this).attr('autocomplete','off');
        });

        $(".integer").bind("keypress", function(evt) {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode == 46) return false;
            if (charCode > 31 && (charCode < 48 || charCode > 57))
                return false;
            return true;
        });

        $(".decimal").bind("keypress", function(evt) {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            var value = $(this).val();
            var dotcontains = value.indexOf(".") != -1;
            if (dotcontains)
                if (charCode == 46) return false;
            if (charCode == 46) return true;
            if (charCode > 31 && (charCode < 48 || charCode > 57))
                return false;
            return true;
        });

        var checkAjaxCalls = function () {
            if ($.active > 0) {
                setTimeout(checkAjaxCalls, 300);
            } else {
                $('[data-toggle="tooltip"]').tooltip();
                $(".tablesorter").tablesorter();
                $('.tablesorter').trigger('update');
                $(".lockModal").hide();
            }
        };
        checkAjaxCalls();
	}).bind("ajaxError", function(){
	   $(".lockModal").hide();
	});
}(jQuery));
