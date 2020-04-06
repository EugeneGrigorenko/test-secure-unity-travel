(function() {
    this.app.controller('EditProductCtrl', [
        "$scope",
        function($scope) {
            $scope.properties = [];
            $scope.images = [];
            $scope.videos = [];
            $scope.blockDates = {};
            $scope.subProducts = [];
            $scope.hasSubProduct = false;
            $scope.error = null;
            $scope.masterAvailableDates = [];
            $scope.blocksUingMasterCalendar = [];
            $scope.vendorId = null;
            $scope.productId = null;
            $scope.vendor_default_properties = [];
            $scope.vendor_default_images = [];
            $scope.mainImage ='';
            $scope.selected_room_type_id = '';

            $scope.selectDefaultProperty = function(default_property) {
                default_property.checked = !default_property.checked;
            };

            $scope.applyDefaultProperties = function() {
                $.each( $scope.vendor_default_properties.reverse(), function( index, p ) {
                    if (p.checked){
                        var item = {
                            key: p.key,
                            value: p.value,
                            priority: 1
                        };
                        $scope.properties.splice(0, 0, item);
                        p.checked = false;
                    }
                });
                $scope.vendor_default_properties.reverse();
                $scope.sortProperties();
                $('.modal').modal('hide');
            };

            $scope.selectDefaultImage = function(default_image) {
                default_image.checked = !default_image.checked;
            };
            $scope.setMainImage = function(default_image) {
                $.each( $scope.vendor_default_images, function( index, image ) {
                    image.is_main_image = false;
                });
                default_image.is_main_image = true;
            };

            $scope.applyDefaultImages = function() {
                $.each( $scope.vendor_default_images.reverse(), function( index, image ) {
                    if (image.is_main_image){
                        $scope.mainImage = image.url;
                    }
                    if (image.checked){
                        item = { url: image.url, is_visible: true};
                        $scope.images.splice(0, 0, item);
                    }
                    image.is_main_image = false;
                    image.checked = false;
                });
                $scope.vendor_default_images.reverse();
                $('.modal').modal('hide');
            };

            $scope.sortProperties = function(){
                for (var i = 0; i<$scope.properties.length; i++){
                    $scope.properties[i].priority = i + 1;
                }
            };

            $scope.movePriorityUp = function (index) {
                var array = $scope.properties;
                var tmpItem = array[index - 1];
                array[index - 1] = array[index];
                array[index] = tmpItem;
                $scope.sortProperties();
            };

            $scope.movePriorityDown = function (index) {
                var array = $scope.properties;
                var tmp = array[index + 1];
                array[index + 1] = array[index];
                array[index] = tmp;
                $scope.sortProperties();
            };

            $scope.addProperty = function() {
                var item = { key: '', value: '', priority: 0 };
                $scope.properties.splice(0, 0, item);
            };

            $scope.deleteProperty = function(property) {
                var index = $.inArray(property, $scope.properties);
                if (index > -1) {
                    $scope.properties.splice(index, 1);
                    $scope.sortProperties();
                }
            };

            $scope.deleteImage = function(image) {
                var index = $.inArray(image, $scope.images);
                if (index > -1) {
                    bootbox.confirm(
                        '<p class="center">Are you sure you want to delete this image?</p>',
                        function (result) {
                            if (result) {
                                $scope.$apply(function(){
                                    $scope.images.splice(index, 1);
                                });
                            }
                        }
                    );
                }
            };

            $scope.serialize = function(fieldName) {
                return angular.toJson($scope[fieldName]);
            };

            $scope.deleteVideo = function(video) {
                var index = $.inArray(video, $scope.videos);
                if (index > -1) {
                    bootbox.confirm(
                        '<p class="center">Are you sure you want to delete this video?</p>',
                        function (result) {
                            if (result) {
                                $scope.$apply(function(){
                                    $scope.videos.splice(index, 1);
                                });
                            }
                        }
                    );
                }
            };

            $scope.useMasterCalendarForBlock = function(block) {
                bootbox.confirm(
                    '<p style="padding-bottom: 10px;">Are you sure you want to use the master calendar for this block? Any selected dates will be deleted.</p>',
                    function (result) {
                        if (result) {
                            $scope.$apply(function(){
                                block.using_master_calendar = true;
                                $scope.blockDates[block.id] = [];
                                $scope.blocksUingMasterCalendar.push(block.id);
                            });
                        }
                    }
                );
            };

            $scope.useSeparateCalendarForBlock = function(block) {
                var index;
                block.using_master_calendar = false;
                index = $.inArray(block.id, $scope.blocksUingMasterCalendar);
                if (index > -1) {
                    $scope.blocksUingMasterCalendar.splice(index, 1);
                }
            };

            function askChangedBlockQuantity(message, callback) {
                bootbox.prompt(message, function(result){
                    var quantity;
                    if (result === null) {
                        return;
                    }
                    quantity = parseInt(result);

                    if (!result || !/^\d+$/.test(result) || !quantity) {
                        bootbox.alert('Please input a positive integer.');
                        return;
                    }

                    if (callback) {
                        callback(quantity);
                    }
                });
            }

            function getBlockUrl(blockId) {
                return '/vendors/' + $scope.vendorId + '/products/' + $scope.productId + '/product_blocks/' + blockId;
            }

            function getSubProductIndex(subProductId) {
                var subProductIndex = -1;

                for(var i = 0; i < $scope.subProducts.length; i++) {
                    if ($scope.subProducts[i].id === subProductId) {
                        subProductIndex = i;
                        break;
                    }
                }

                return subProductIndex;
            }

            function getBlockIndex(subProduct, blockId) {
                var blockIndex = -1;

                for(var i = 0; i < subProduct.blocks.length; i++) {
                    if (subProduct.blocks[i].id === blockId) {
                        blockIndex = i;
                        break;
                    }
                }

                return blockIndex;
            }

            function updateBlockData(block, newBlockData) {
                block.quantity = newBlockData.quantity;
                block.instock = newBlockData.instock;
                block.unit_price = newBlockData.unit_price;
                block.unit_cost = newBlockData.unit_cost;
                block.affiliate_point = newBlockData.affiliate_point;
                block.active = newBlockData.active;
                block.has_unlimited_quantity = newBlockData.has_unlimited_quantity;
                block.using_master_calendar = newBlockData.using_master_calendar;
            }

            function deleteBlock(subProduct, blockId) {
                var blockIndex = getBlockIndex(subProduct, blockId);

                if (blockIndex == -1) {
                    return;
                }
                subProduct.blocks.splice(blockIndex, 1);
            }

            $scope.addBlockQuantity = function(block) {
                askChangedBlockQuantity('Add Quantity', function(quantity){
                    $.ajax({
                        url: getBlockUrl(block.id) + '/add_quantity',
                        data: { quantity: quantity },
                        type: 'POST',
                        async: false
                    }).done(function(result){
                        $scope.$apply(function() {
                            updateBlockData(block, result.new_block_data);
                        });
                        if (result.error) {
                            bootbox.alert(result.error);
                        }
                    });
                });
            };

            $scope.removeBlockQuantity = function(block) {
                askChangedBlockQuantity('Remove Quantity', function(quantity){
                    $.ajax({
                        url: getBlockUrl(block.id) + '/remove_quantity',
                        data: { quantity: quantity },
                        type: 'POST',
                        async: false
                    }).done(function(result){
                        $scope.$apply(function() {
                            updateBlockData(block, result.new_block_data);
                        });
                        if (result.error) {
                            bootbox.alert(result.error);
                        }
                    });
                });
            };

            $scope.deleteBlock = function(subProduct, block) {
                var confirmMessage = "";

                if (block.sold_quantity > 0 || block.in_cart_quantity > 0) {
                    if (block.has_unlimited_quantity) {
                        bootbox.alert("<p>You cannot delete this block because it has unlimited quantity and " +
                            block.sold_quantity + " item(s) have been sold</p>");
                        return;
                    } else {
                        if (block.instock > 0) {
                            confirmMessage = "<p>The rest of quantity in this block will be removed instead of deleting it</p>";
                        } else {
                            bootbox.alert("<p>You cannot delete this block because it has been booked!</p>");
                            return;
                        }
                    }
                } else {
                    confirmMessage = "<p class='center' style='padding-bottom: 10px;'>Are you sure you want to delete this block?</p>";
                }

                bootbox.confirm(confirmMessage, function(result) {
                    if(result){
                        $.ajax({
                            url: getBlockUrl(block.id),
                            data: { _method: 'delete' },
                            type: 'POST',
                            dataType: 'json',
                            async: false
                        }).done(function(result){
                            if (result.error) {
                                bootbox.alert(result.error);
                            }
                            if (result.is_destroyed) {
                                $scope.$apply(function() {
                                    deleteBlock(subProduct, block.id);
                                    $scope.hasSubProduct = result.has_sub_product;
                                });
                            } else if(result.new_block_data) {
                                $scope.$apply(function() {
                                    updateBlockData(block, result.new_block_data);
                                });
                            }
                        });
                    }
                });
            };

            $scope.updateBlockData = function(subProductId, blockId, newBlockData) {

                $scope.selected_room_type_id = subProductId;

                var subProductIndex = getSubProductIndex(subProductId);

                if (subProductIndex == -1) {
                    return;
                }

                var subProduct = $scope.subProducts[subProductIndex];

                var blockIndex = getBlockIndex(subProduct, blockId);

                if(blockIndex == -1){
                    return;
                }

                updateBlockData(subProduct.blocks[blockIndex], newBlockData);
            };

            $scope.update_room_type_id = function(id){
                $scope.selected_room_type_id = id;
            };

            $scope.submit = function(e) {
                e.preventDefault();
                for (var instance in CKEDITOR.instances) {
                    CKEDITOR.instances[instance].updateElement();
                }
                $('#product-details-form').submit();
            };
        }
    ]);
}).call(this);