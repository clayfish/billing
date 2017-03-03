/*
 Copyright 2017 ClayFish Technologies

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

$(document).ready(function () {
    var body = $('body');
    var devMode = window.location.href.indexOf("localhost") > 0;

    var billGenerated = false;

    // COOKIES
    var COMPANY_NAME = "companyName";
    var COMPANY_PHONE = "companyPhone";
    var COMPANY_TIN = "companyTin";
    var COMPANY_SERVICE_TAX = "companyServiceTax";
    var COMPANY_ADDRESS = "companyAddress";
    var COMPANY_CURRENCY = "companyCurrency";
    // In days
    var DEFAULT_COOKIE_LIFE = 30;

    /**
     *
     * @param str with currency symbol
     * @returns {number}
     * @deprecated It may be error-prone in multi-currency scenario
     */
    var getNumber = function (str) {
        str = str.replace(billWriter.config.currency, '').trim();
        return str.length ? parseFloat(str.replace(billWriter.config.currency, '').trim()) : 0;
    };

    /**
     * Updates the currency symbol in the web-page and PDF
     * @param currency The symbol of currency
     */
    var updateCurrency = function (currency) {
        body.find('span.currency').each(function () {
            $(this).html(currency);
        });
    };

    body.find('span.current-year').html(new Date().getFullYear());
    updateCurrency();

    /**
     *
     */
    var checkServiceTaxApplicability = function () {
        var serviceTaxGroup = $('.service-tax-group');
        if ($('#company-service-tax-no').val().length) {
            serviceTaxGroup.removeClass('hide');
        } else {
            serviceTaxGroup.addClass('hide');
        }
    };

    /**
     *
     */
    var updateItemTotal = function () {
        var total = 0;
        $('.items .item').each(function () {
            total = total + parseFloat($(this).find('.item-row-price .numeral').text());
        });
        total = total.toFixed(2);
        $('.item-total .numeral').html(total);
    };

    /**
     *
     */
    var updateDiscountTotal = function () {
        var percentageDiscount = $('input#discount').val();
        if (percentageDiscount > 0) {
            var itemTotal = $('.item-total .numeral').text();
            var discountAmount = itemTotal * percentageDiscount / 100;
            discountAmount = discountAmount.toFixed(2);
            $('.discount-amount .numeral').html(discountAmount);
            $('.discount-total .numeral').html((itemTotal - discountAmount).toFixed(2));
        } else {
            $('.discount-amount .numeral').html('0');
            $('.discount-total .numeral').html($('.item-total .numeral').html());
        }
    };

    /**
     *
     */
    var updateTotalPayable = function () {
        var totalAmount = parseFloat($('.discount-total .numeral').text());
        var vatAmount = totalAmount * $('input#vat').val() / 100;
        var serviceTaxAmount = totalAmount * $('input#service-tax').val() / 100;
        var bharatCess = totalAmount * 5 / 1000;
        var kkCess = bharatCess;
        var totalAmountWithTax = totalAmount + vatAmount + serviceTaxAmount + bharatCess + kkCess;

        vatAmount = vatAmount.toFixed(2);
        serviceTaxAmount = serviceTaxAmount.toFixed(2);
        bharatCess = bharatCess.toFixed(2);
        kkCess = kkCess.toFixed(2);
        totalAmountWithTax = totalAmountWithTax.toFixed(2);

        $('.vat-amount .numeral').html(vatAmount);
        $('.service-tax-amount .numeral').html(serviceTaxAmount);
        $('.bharat-cess .numeral').html(bharatCess);
        $('.kk-cess .numeral').html(kkCess);
        $('.total-with-tax .numeral').html(totalAmountWithTax);
    };

    /**
     *
     */
    var updateTotals = function () {
        updateItemTotal();
        updateDiscountTotal();
        updateTotalPayable();
    };

    /**
     *
     */
    var clearForms = function () {
        $('form').each(function () {
            this.reset();
        });

        $('form .row.item').remove();
        $('.add-item').click();
        updateTotals();
    };

    body.on('change', '#company-name', function (e) {
        var companyName = $(this).val();
        utils.setCookie(COMPANY_NAME, companyName, DEFAULT_COOKIE_LIFE);
        billWriter.config.companyName = companyName;
    });

    body.on('change', '#company-address', function (e) {
        var companyAddress = $(this).val();
        utils.setCookie(COMPANY_ADDRESS, companyAddress, DEFAULT_COOKIE_LIFE);
        billWriter.config.address = companyAddress;
    });

    body.on('change', '#company-tin', function (e) {
        var companyTin = $(this).val();
        utils.setCookie(COMPANY_TIN, companyTin, DEFAULT_COOKIE_LIFE);
        billWriter.config.tin = companyTin;
    });

    body.on('change', '#company-service-tax-no', function (e) {
        var companyServiceTax = $(this).val();
        utils.setCookie(COMPANY_SERVICE_TAX, companyServiceTax, DEFAULT_COOKIE_LIFE);
        billWriter.config.serviceTax = companyServiceTax;
        checkServiceTaxApplicability();
    });

    body.on('change', '#company-contact', function (e) {
        var companyPhone = $(this).val();
        utils.setCookie(COMPANY_PHONE, companyPhone, DEFAULT_COOKIE_LIFE);
        billWriter.config.contactNumber = companyPhone;
    });

    body.on('change', '#company-currency', function (e) {
        var companyCurrency = $(this).val();
        utils.setCookie(COMPANY_CURRENCY, companyCurrency, DEFAULT_COOKIE_LIFE);
        billWriter.config.currency = companyCurrency;
        updateCurrency(companyCurrency);
    });

    body.on('click', '.change-seller-info', function (e) {
        $('.company-info').removeClass('hide');
        $(this).addClass('hide');
    });

    body.on('click', '.new-bill', function (e) {
        if (billGenerated) {
            clearForms();
        } else {
            // TODO Replace this confirm with bootbox
            var result = confirm("This bill has not been generated. Do you still want to continue?");
            if (result) {
                clearForms();
            }
        }
    });

    body.on('click', '.add-item', function (e) {
        var i = $('.items .item').length + 1;
        var itemElement = $('.item-template').clone();

        $(itemElement).removeClass('item-template hide').addClass('item');
        $(itemElement).attr('data-serial', i);
        $(itemElement).find('.sr-no').html(i);
        $(itemElement).appendTo('.items');
    });

    body.on('change', '.item-price, .item-quantity', function () {
        var parent = $(this).closest('.item');
        var price = $(parent).find('.item-price').val() * $(parent).find('.item-quantity').val();
        price = price.toFixed(2);
        $(parent).find('.item-row-price .numeral').html(price);
        updateTotals();
    });

    body.on('change', 'input#discount', function () {
        var percentageDiscount = $(this).val();
        if (percentageDiscount > 100 || percentageDiscount < 0) {
            $(this).val(0);
        }

        updateDiscountTotal();
        updateTotalPayable();
    });

    body.on('change', 'input#vat', function () {
        var vatPercent = $(this).val();
        if (vatPercent > 100 || vatPercent < 0) {
            $(this).val(0);
        }
        updateTotalPayable();
    });

    body.on('change', 'input#service-tax', function () {
        var serviceTaxPercent = $(this).val();
        if (serviceTaxPercent > 100 || serviceTaxPercent < 0) {
            $(this).val(0);
        }
        if ($(this).val() == 0) {
            $('.service-tax-extras').addClass('hide');
        } else {
            $('.service-tax-extras').removeClass('hide');
        }
        updateTotalPayable();
    });

    body.on('click', '.generate-bill', function () {
        billGenerated = true;
        var info = createFormDataObject();
        billWriter.config.blank = false;
        var doc = billWriter.generateBill(info);
        billWriter.download(doc, undefined, info.billDate);
    });

    // TODO #6 Re-enable this button
    //body.on('click', '.generate-blank-bill', function() {
    //    var info = createFormDataObject();
    //    billWriter.config.blank = true;
    //    var doc = billWriter.generateBill(info);
    //    billWriter.download(doc);
    //});

    /**
     *
     * @returns {{}}
     */
    var createFormDataObject = function () {
        var info = {};

        info.billDate = $('input#billDate').val();
        if (info.billDate) {
            info.billDate = new Date(info.billDate);
        } else {
            info.billDate = new Date();
        }

        info.billNo = $('input#billNo').val();
        if (info.billNo == '') {
            var now = new Date();
            info.billNo = '' + now.getFullYear() + (now.getMonth() + 1) + now.getDate();
        }

        info.customer = {
            name: $('input#purchaser').val(),
            address: $('textarea#purchaser-address').val(),
            pan: $('input#purchaser-tin').val()
        };

        info.items = {
            total: $('p.item-total').text(),
            list: []
        };
        $('.items .item').each(function () {
            info.items.list.push({
                name: $(this).find('input.item-name').val(),
                price: $(this).find('input.item-price').val(),
                unit: $(this).find('input.item-quantity').val(),
                amount: $(this).find('p.item-row-price').text()
            });
        });

        var discountPercent = parseFloat($('input#discount').val()).toFixed(2);
        info.discount = {
            available: discountPercent > 0,
            percent: discountPercent + '%',
            amount: $('p.discount-amount').text(),
            totalAfterDiscount: $('p.discount-total').text()
        };

        info.taxes = {
            totalWithTaxes: $('p.total-with-tax').text(),
            list: []
        };

        var vatPercent = parseFloat($('input#vat').val()).toFixed(2);
        var serviceTaxPercent = parseFloat($('input#service-tax').val()).toFixed(2);
        if (vatPercent > 0) {
            var taxName = $('input[type="radio"][name="taxType"]:checked').val();
            info.taxes.list.push({
                name: taxName,
                percent: vatPercent + '%',
                amount: $('p.vat-amount').text()
            });
        }

        if (serviceTaxPercent > 0 && billWriter.config.serviceTax.length) {
            info.taxes.list.push({
                name: 'Service Tax',
                percent: serviceTaxPercent + '%',
                amount: $('p.service-tax-amount').text()
            });
            info.taxes.list.push({
                name: 'Swachchh Bharat Cess',
                percent: '0.5%',
                amount: $('p.bharat-cess').text()
            });
            info.taxes.list.push({
                name: 'Krishi Kalyan Cess',
                percent: '0.5%',
                amount: $('p.kk-cess').text()
            });
        }

        info.taxApplied = info.taxes.list.length;

        info.invoiceType = $('input[type="radio"][name="invoiceType"]:checked').val();

        return info;
    };

    if (devMode) {
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

    if (!devMode) {
        body.find('.under-development').each(function () {
            $(this).hide();
        });
    }

    if (!utils.getCookie(COMPANY_NAME).length) {
        $('.company-info').removeClass('hide');
        $('.change-seller-info').addClass('hide');
    } else {
        billWriter.config.companyName = utils.getCookie(COMPANY_NAME);
        billWriter.config.contactNumber = utils.getCookie(COMPANY_PHONE);
        billWriter.config.address = utils.getCookie(COMPANY_ADDRESS);
        billWriter.config.tin = utils.getCookie(COMPANY_TIN);
        billWriter.config.serviceTax = utils.getCookie(COMPANY_SERVICE_TAX);
        billWriter.config.currency = utils.getCookie(COMPANY_CURRENCY);

        $('#company-name').val(billWriter.config.companyName);
        $('#company-address').val(billWriter.config.address);
        $('#company-tin').val(billWriter.config.tin);
        $('#company-service-tax-no').val(billWriter.config.serviceTax);
        $('#company-contact').val(billWriter.config.contactNumber);
        $('#company-currency').val(billWriter.config.currency);
        checkServiceTaxApplicability();
    }


}); // END DOCUMENT READY
