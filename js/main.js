
$(document).ready(function() {
    var body = $('body');

    var getNumber = function(str) {
        return parseFloat(str.replace('₹', '').trim());
    };

    body.find('span.current-year').html(new Date().getFullYear());

    body.on('click', '.add-item', function(e) {
        var i = $('.items .item').length+1;
        var itemElement = $('.item-template').clone();

        $(itemElement).removeClass('item-template hide').addClass('item');
        $(itemElement).attr('data-serial', i);
        $(itemElement).find('.sr-no').html(i);
        $(itemElement).appendTo('.items');
    });

    body.on('change', '.item-price, .item-quantity', function() {
        var parent = $(this).closest('.item');
        var price = getNumber($(parent).find('.item-price').val()) * getNumber($(parent).find('.item-quantity').val());
        price = price.toFixed(2);
        $(parent).find('.item-row-price').html('₹ '+ price);
        updateTotals();
    });

    body.on('change', 'input#discount', function() {
        var percentageDiscount = getNumber($(this).val());
        if(percentageDiscount>100 || percentageDiscount<0) {
            $(this).val(0);
        }

        updateDiscountTotal();
        updateTotalPayable();
    });

    body.on('change', 'input#vat', function() {
        var vatPercent = getNumber($(this).val());
        if(vatPercent>100 || vatPercent<0) {
            $(this).val(0);
        }
        updateTotalPayable();
    });

    body.on('change', 'input#service-tax', function() {
        var serviceTaxPercent = getNumber($(this).val());
        if(serviceTaxPercent>100 || serviceTaxPercent<0) {
            $(this).val(0);
        }
        if($(this).val() == 0) {
            $('.service-tax-extras').addClass('hide');
        } else {
            $('.service-tax-extras').removeClass('hide');
        }
        updateTotalPayable();
    });

    var updateTotals = function() {
        updateItemTotal();
        updateDiscountTotal();
        updateTotalPayable();
    };

    var updateItemTotal = function() {
        var total = 0;
        $('.items .item').each(function() {
            total = total + getNumber($(this).find('.item-row-price').html());
        });
        total = total.toFixed(2);
        $('.item-total').html('₹ '+total);
    };

    var updateDiscountTotal = function() {
        var percentageDiscount = getNumber($('input#discount').val());
        if(percentageDiscount>0) {
            var itemTotal = getNumber($('.item-total').html());
            var discountAmount = itemTotal*percentageDiscount/100;
            discountAmount = discountAmount.toFixed(2);
            $('.discount-amount').html('-₹ '+ discountAmount);
            $('.discount-total').html('₹ '+(itemTotal-discountAmount).toFixed(2));
        } else {
            $('.discount-amount').html('-₹ 0');
            $('.discount-total').html($('.item-total').html());
        }
    };

    var updateTotalPayable = function() {
        var totalAmount = getNumber($('.discount-total').html());
        var vatAmount = totalAmount*$('input#vat').val()/100;
        var serviceTaxAmount = totalAmount*$('input#service-tax').val()/100;
        var educationCess = serviceTaxAmount/50;
        var higherEducationCess = educationCess/2;
        var totalAmountPayable = totalAmount+vatAmount+serviceTaxAmount+educationCess+higherEducationCess;

        vatAmount = vatAmount.toFixed(2);
        serviceTaxAmount = serviceTaxAmount.toFixed(2);
        educationCess = educationCess.toFixed(2);
        higherEducationCess = higherEducationCess.toFixed(2);
        totalAmountPayable = totalAmountPayable.toFixed(2);

        $('.vat-amount').html('₹ '+ vatAmount);
        $('.service-tax-amount').html('₹ '+ serviceTaxAmount);
        $('.education-cess').html('₹ '+ educationCess);
        $('.higher-education-cess').html('₹ '+ higherEducationCess);
        $('.payable-total').html('₹ '+totalAmountPayable);
    };

    body.on('click', '.generate-bill', function() {
        var info = createFormDataObject();
        var doc = new jsPDF();
        billWriter.config.blank = false;
        billWriter.generateBill(doc, info);
        billWriter.download(doc);
    });

    body.on('click', '.generate-blank-bill', function() {
        var info = createFormDataObject();
        var doc = new jsPDF();
        billWriter.config.blank = true;
        billWriter.generateBill(doc, info);
        billWriter.download(doc);
    });

    var createFormDataObject = function() {
        var info = {};
        info.billNo = $('input#billNo').val();

        info.customer = {
            name: $('input#purchaser').val(),
            address: $('textarea#purchaser-address').val(),
            pan: $('input#purchaser-tin').val()
        };

        return info;
    };

}); // END DOCUMENT READY
