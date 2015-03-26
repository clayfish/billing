
$(document).ready(function() {
    var body = $('body');
    var testMode = true;

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
        $(parent).find('.item-row-price').html('&#8377; '+ price);
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
        $('.item-total').html('&#8377; '+total);
    };

    var updateDiscountTotal = function() {
        var percentageDiscount = getNumber($('input#discount').val());
        if(percentageDiscount>0) {
            var itemTotal = getNumber($('.item-total').html());
            var discountAmount = itemTotal*percentageDiscount/100;
            discountAmount = discountAmount.toFixed(2);
            $('.discount-amount').html('-&#8377; '+ discountAmount);
            $('.discount-total').html('&#8377; '+(itemTotal-discountAmount).toFixed(2));
        } else {
            $('.discount-amount').html('-&#8377; 0');
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

        $('.vat-amount').html('&#8377; '+ vatAmount);
        $('.service-tax-amount').html('&#8377; '+ serviceTaxAmount);
        $('.education-cess').html('&#8377; '+ educationCess);
        $('.higher-education-cess').html('&#8377; '+ higherEducationCess);
        $('.payable-total').html('&#8377; '+totalAmountPayable);
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

        info.items = {
            total: $('p.item-total').html(),
            list: []
        };
        $('.items .item').each(function() {
            info.items.list.push({
                name: $(this).find('input.item-name').val(),
                price: $(this).find('input.item-price').val(),
                unit: $(this).find('input.item-quantity').val(),
                amount: $(this).find('p.item-row-price').html()
            });
        });

        var discountPercent = parseFloat($('input#discount').val()).toFixed(2);
        info.discount = {
            available: discountPercent>0,
            percent: discountPercent+'%',
            amount: $('p.discount-amount').html(),
            totalAfterDiscount: $('p.discount-total').html()
        };

        info.taxApplied = true;
        info.taxes = {
            totalWithTaxes: $('p.payable-total').html(),
            list: [{
                name: 'VAT',
                percent: $('input#vat').val()+'%',
                amount: $('p.vat-amount').html()
            }]
        };
        var serviceTaxPercent = parseFloat($('input#service-tax').val()).toFixed(2);
        if(serviceTaxPercent>0) {
            info.taxes.list.push({
                name: 'Service Tax',
                percent: serviceTaxPercent+'%',
                amount: $('p.service-tax-amount').html()
            });
            info.taxes.list.push({
                name: 'Education Cess',
                percent: '2%',
                amount: $('p.education-cess').html()
            });
            info.taxes.list.push({
                name: 'Higher Education Cess',
                percent: '1%',
                amount: $('p.higher-education-cess').html()
            });
        }

        return info;
    };

    if(testMode) {
        // Fill in the test data
        $('input#billNo').val('TESTING');
        $('input#purchaser').val("John Ahmed Doe");
        $('textarea#purchaser-address').val("B-221, Baker Street\nDown Town\nLondon, UK");
        $('input#purchaser-tin').val("THSPD1251Y");

        $('.items .item input.item-name').val("Royal Enfield");
        $('.items .item input.item-price').val(55000);
        $('.items .item input.item-quantity').val(1);
        updateTotals();
    }

}); // END DOCUMENT READY
