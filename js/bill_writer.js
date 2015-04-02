var billWriter = {
    version: '0.1.0',
    config: {
        companyName: "Global Vision",
        address: "A83, Paryavaran Complex, IGNOU Road, Saidulajab, New Delhi-30",
        tin: "07086947245",
        contactNumber: '+91 9873 593229',
        terms: ["1. Goods once sold cannot be taken back.",
            "2. Interest @18% pa chargeable on bills unpaid for more than 15 days.",
            "3. Dispute will be under Delhi jurisdiction.",
            "4. This bill is not valid without authority signatures."],
        eAndOe: true,
        blank: false
    },

    generateBill: function (info) {
        if (info == undefined) {
            return;
        }
        var doc = {
            content: [],
            styles: {
                title: {
                    fontSize: 30,
                    alignment: 'center',
                    bold: true,
                    color: 'red'
                },
                titleSmall: {
                    fontSize: 16,
                    alignment: 'center'
                },
                address: {
                    fontSize: 10,
                    alignment: 'center'
                },
                contact: {
                    fontSize: 8,
                    alignment: 'right'
                },
                tableHeader: {
                    fontSize: 10,
                    bold: true,
                    alignment: 'center'
                },
                money: {
                    alignment: 'right'
                },
                discount: {
                    alignment: 'right',
                    fontSize: 8
                },
                tax: {
                    alignment: 'right',
                    fontSize: 8
                },
                total: {
                    bold: true,
                    alignment: 'right'
                }
            }
        };
        //border(doc);
        doc = generateBillHeader(doc);
        doc = writeCustomerInfo(doc, info);
        doc = writeItems(doc, info);
        //writeTerms(doc);
        //writeFooter(doc);
        return doc;
    },

    download: function (doc, fileName) {
        if (fileName === undefined || fileName == null) {
            var date = new Date();
            fileName = "bill_" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
        }

        pdfMake.createPdf(doc).download(fileName);
    }

};

var insertLine = function (doc, vertical) {
    if (vertical) {
        // TODO draw a vertical line
    } else {
        doc.content.push({
            table: {
                widths: ['*'],
                body: [[" "], [" "]]
            },
            layout: {
                hLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 0 : 2;
                },
                vLineWidth: function (i, node) {
                    return 0;
                }
            }
        });
    }

    return doc;
};

var generateBillHeader = function (doc) {
    doc.content.push({
        text: 'Retail Invoice/Bill',
        style: 'titleSmall'
    });
    doc.content.push({
        text: [{
            text: billWriter.config.companyName,
            style: 'title'
        }, {
            text: billWriter.config.contactNumber,
            style: 'contact'
        }]
    });
    doc.content.push({
        text: billWriter.config.address,
        style: 'address'
    });
    doc.content.push({
        text: 'TIN: ' + billWriter.config.tin,
        style: 'address'
    });
    return insertLine(doc);
};

var border = function (doc) {
    doc.rect(10, 10, 190, 275);
};

var writeEAndOe = function (doc) {
    doc.setFontSize(8);
    doc.text(190, 44, 'E & OE');
};

var writeCustomerInfo = function (doc, info) {
    var writeBlankCustomerInfo = function () {
        doc.content.push({
            text: 'M/s ___________________________________________________'
        });
        doc.content.push({
            text: '_______________________________________________________'
        });
        doc.content.push({
            text: 'TIN/PAN: ______________________________________________'
        });
        return doc;
    };

    doc.content.push({
        text: "Invoice: " + info.billNo
    });
    doc.content.push({
        text: "Date: " + utils.getDate()
    });

    // Draw a vertical line

    if (billWriter.config.blank) {
        doc = writeBlankCustomerInfo();
    } else {
        doc.content.push({
            text: info.customer.name,
            bold: true
        });
        doc.content.push({
            text: info.customer.address
        });
        doc.content.push({
            text: "TIN/PAN: " + info.customer.pan
        });
    }

    return insertLine(doc);
};

var writeItems = function (doc, info) {
    var tableObject = {
        table: {
            headerRows: 1,
            widths: [25, 250, '*', '*', '*'],
            dontBreakRows: true,
            body: [[{
                text: "Sr",
                style: 'tableHeader'
            }, {
                text: 'Name',
                style: 'tableHeader'
            }, {
                text: 'Price',
                style: 'tableHeader'
            }, {
                text: 'Unit',
                style: 'tableHeader'
            }, {
                text: 'Amount',
                style: 'tableHeader'
            }]]
        }
    };

    if (billWriter.config.blank) {

    } else {
        for (var i in info.items.list) {
            var lineNumber = parseInt(i) + 1;
            tableObject.table.body.push([{
                text: lineNumber.toString(),
                alignment: 'center'
            }, {
                text: info.items.list[i].name
            }, {
                text: info.items.list[i].price,
                style: 'money'
            }, {
                text: info.items.list[i].unit,
                style: 'money'
            }, {
                text: info.items.list[i].amount,
                style: 'money'
            }]);
        }


        // Incorporating discount
        if(info.discount.available) {
            tableObject.table.body.push([
                {
                    colSpan: 4,
                    text: 'Total',
                    style: 'money'
                }, {}, {}, {},
                {
                    text: info.items.total,
                    style: 'money'
                }
            ]);

            tableObject.table.body.push([
                {
                    text: 'Discount ('+info.discount.percent+')',
                    style: 'discount',
                    colSpan: 4
                }, {}, {}, {},
                {
                    text: info.discount.amount,
                    style: 'discount'
                }
            ]);
            tableObject.table.body.push([
                {
                    colSpan: 4,
                    text: 'Total',
                    style: 'total'
                }, {}, {}, {},
                {
                    text: info.discount.totalAfterDiscount,
                    style: 'total'
                }
            ]);
        } else {
            tableObject.table.body.push([
                {
                    colSpan: 4,
                    text: 'Total',
                    style: 'total'
                }, {}, {}, {},
                {
                    text: info.items.total,
                    style: 'total'
                }
            ]);
        }

        // Including taxes
        if(info.taxApplied) {
            for(var i in info.taxes.list) {
                tableObject.table.body.push([{
                    text: info.taxes.list[i].name + ' (' + info.taxes.list[i].percent + ')',
                    style: 'tax',
                    colSpan: 4
                }, {}, {}, {}, {
                    text: info.taxes.list[i].amount,
                    style: 'tax'
                }]);
            }

            tableObject.table.body.push([{
                text: 'Total Payable amount',
                colSpan: 4,
                style: 'total'
            }, {}, {}, {}, {
                text: info.taxes.totalWithTaxes,
                style: 'total'
            }]);

        }

    }

    doc.content.push(tableObject);
    return doc;
};

var writeTaxes = function (doc, info) {
    if (!info.taxApplied) {
        // No taxes, just extend the vertical lines of items
        doc.line(20, 190, 20, 220);
        doc.line(115, 190, 115, 220);
        doc.line(140, 190, 140, 220);
        doc.line(170, 200, 170, 230);

        doc.line(10, 220, 200, 220);
        doc.text(140, 227, "Total payable amount");
        if (!billWriter.config.blank) {
            doc.text(175, 224, info.discount.totalAfterDiscount);
        }
    } else {
        // Draw a horizontal line to make it separate from Items
        doc.line(10, 190, 200, 190);
        doc.line(10, 200, 200, 200);
        doc.text(160, 193, "Total");
        if (!billWriter.config.blank) {
            doc.text(170, 192, info.discount.totalAfterDiscount);
            var cursor = {x: 20, y: 196};

            for (var i = 0; i < info.taxes.list.length; i++) {
                var tax = info.taxes.list[i];
                doc.text(cursor.x, cursor.y, tax.name + ' (' + tax.percent + '&#8377;)');
                doc.text(170, cursor.y, tax.amount);
                cursor.y += 4;
            }
        }
    }
};
var writeTerms = function (doc, terms) {

};
var writeFooter = function (doc) {
    if (billWriter.config.eAndOe) {
        writeEAndOe(doc);
    }
};
