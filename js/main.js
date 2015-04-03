
$(document).ready(function() {
    var body = $('body');
    var devMode = false;

    var billGenerated = false;

    // COOKIES
    var COMPANY_NAME = "companyName";
    var COMPANY_PHONE = "companyPhone";
    var COMPANY_TIN = "companyTin";
    var COMPANY_ADDRESS = "companyAddress";
    // In days
    var DEFAULT_COOKIE_LIFE = 30;

    var getNumber = function(str) {
        return parseFloat(str.replace('₹', '').trim());
    };

    body.find('span.current-year').html(new Date().getFullYear());

    body.on('change', '#company-name', function(e){
        var companyName = $(this).val();
        utils.setCookie(COMPANY_NAME, companyName, DEFAULT_COOKIE_LIFE);
        billWriter.config.companyName = companyName;
    });

    body.on('change', '#company-address', function(e){
        var companyAddress = $(this).val();
        utils.setCookie(COMPANY_ADDRESS, companyAddress, DEFAULT_COOKIE_LIFE);
        billWriter.config.address = companyAddress;
    });

    body.on('change', '#company-tin', function(e){
        var companyTin = $(this).val();
        utils.setCookie(COMPANY_TIN, companyTin, DEFAULT_COOKIE_LIFE);
        billWriter.config.tin = companyTin;
    });

    body.on('change', '#company-contact', function(e){
        var companyPhone = $(this).val();
        utils.setCookie(COMPANY_PHONE, companyPhone, DEFAULT_COOKIE_LIFE);
        billWriter.config.contactNumber = companyPhone;
    });

    body.on('click', '.change-seller-info', function(e){
        $('.company-info').removeClass('hide');
        $(this).addClass('hide');
    });

    body.on('click', '.new-bill', function(e) {
        if (billGenerated) {
            location.reload();
        } else {
            // TODO replace this confirm with bootbox
            var result = confirm("This bill has not been generated. Do you still want to continue?");
            if(result) {
                location.reload();
            }
        }
    });

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
        var totalAmountWithTax = totalAmount+vatAmount+serviceTaxAmount+educationCess+higherEducationCess;

        vatAmount = vatAmount.toFixed(2);
        serviceTaxAmount = serviceTaxAmount.toFixed(2);
        educationCess = educationCess.toFixed(2);
        higherEducationCess = higherEducationCess.toFixed(2);
        totalAmountWithTax = totalAmountWithTax.toFixed(2);

        $('.vat-amount').html('&#8377; '+ vatAmount);
        $('.service-tax-amount').html('&#8377; '+ serviceTaxAmount);
        $('.education-cess').html('&#8377; '+ educationCess);
        $('.higher-education-cess').html('&#8377; '+ higherEducationCess);
        $('.total-with-tax').html('&#8377; '+totalAmountWithTax);
    };

    body.on('click', '.generate-bill', function() {
        billGenerated = true;
        var info = createFormDataObject();
        billWriter.config.blank = false;
        var doc = billWriter.generateBill(info);
        billWriter.download(doc);
    });

    // TODO Re-enable this button
    //body.on('click', '.generate-blank-bill', function() {
    //    var info = createFormDataObject();
    //    billWriter.config.blank = true;
    //    var doc = billWriter.generateBill(info);
    //    billWriter.download(doc);
    //});

    var createFormDataObject = function() {
        var info = {};
        info.billNo = $('input#billNo').val();
        if(info.billNo == '') {
            var now = new Date();
            info.billNo = ''+now.getFullYear()+(now.getMonth()+1)+now.getDate();
        }

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
            totalWithTaxes: $('p.total-with-tax').html(),
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

    if(devMode) {
        // Fill in the test data
        $('input#billNo').val('TESTING');
        $('input#purchaser').val("John Ahmed Doe");
        $('textarea#purchaser-address').val("B-221, Baker Street\nDown Town\nLondon, UK");
        $('input#purchaser-tin').val("THSPD1251Y");

        $('.items .item input.item-name').val("Canon Printer");
        $('.items .item input.item-price').val(3500);
        $('.items .item input.item-quantity').val(1);
        updateTotals();
    }

    if(!utils.getCookie(COMPANY_NAME).length) {
        $('.company-info').removeClass('hide');
        $('.change-seller-info').addClass('hide');
    } else {
        billWriter.config.companyName = utils.getCookie(COMPANY_NAME);
        billWriter.config.contactNumber = utils.getCookie(COMPANY_PHONE);
        billWriter.config.address = utils.getCookie(COMPANY_ADDRESS);
        billWriter.config.tin = utils.getCookie(COMPANY_TIN);

        $('#company-name').val(billWriter.config.companyName);
        $('#company-address').val(billWriter.config.address);
        $('#company-tin').val(billWriter.config.tin);
        $('#company-contact').val(billWriter.config.contactNumber);
    }

}); // END DOCUMENT READY
