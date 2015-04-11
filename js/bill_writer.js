
var billWriter = {
    version: '0.1.0',
    config: {
        companyName: "Global Vision",
        address: "A83, Paryavaran Complex, IGNOU Road, Saidulajab, New Delhi-30",
        tin: "07086947245",
        contactNumber: '+91 9873 593229',
        terms: ["Goods once sold cannot be taken back.",
            "Interest @18% pa chargeable on bills unpaid for more than 15 days.",
            "Dispute will be under Delhi jurisdiction.",
            "This bill is not valid without authority signatures."],
        eAndOe: true,
        blank: false
    },

    generateBill: function (info) {
        if (info == undefined) {
            return;
        }

        pdfMake.fonts = {
            Ubuntu: {
                    normal: 'Ubuntu-L.ttf',
                    bold: 'Ubuntu-B.ttf',
                    italics: 'Ubuntu-LI.ttf',
                    bolditalics: 'Ubuntu-BI.ttf'
                }
            };

        var doc = {
            content: [],
            defaultStyle: {
                font: "Ubuntu"
            },
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
                },
                term: {
                    fontSize: 6
                },
                termsHeading: {
                    fontSize: 8,
                    bold: true,
                    margin: [0, 50, 0, 0]
                },
                signature: {
                    color: 'red',
                    alignment: 'right',
                    margin: [0, 50, 0, 0]
                }
            }
        };
        //border(doc);
        doc = generateBillHeader(doc, info);
        doc = writeCustomerInfo(doc, info);
        doc = writeItems(doc, info);
        doc = writeTerms(doc);
        doc = writeFooter(doc);
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
        // FIXME Test the vertical line
        doc.content.push({
            table: {
                widths: ['*'],
                body: [[" "], [" "]]
            },
            layout: {
                hLineWidth: function () {
                    return 0;
                },
                vLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 0 : 1;
                }
            }
        });
    } else {
        doc.content.push({
            table: {
                widths: ['*'],
                body: [[" "], [" "]]
            },
            layout: {
                hLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 0 : 1;
                },
                vLineWidth: function () {
                    return 0;
                }
            }
        });
    }

    return doc;
};

var generateBillHeader = function (doc, info) {
    doc.content.push({
        alignment: 'center',
        columns: [{
            text: ''
        }, {
            text: info.invoiceType + ' Invoice/Bill',
            style: 'titleSmall'
        }, {
            text: billWriter.config.contactNumber,
            style: 'contact'
        }]
    });

    doc.content.push({
        text: billWriter.config.companyName,
        style: 'title'
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
    // TODO Implement drawing a border
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

    if (billWriter.config.blank) {
        doc = writeBlankCustomerInfo();
    } else {
        doc.content.push({
            alignment: 'justify',
            columns: [{
                text: 'Invoice: '+info.billNo + '\nDate: '+ utils.getDate()
            }, [{
                text: info.customer.name,
                bold: true
            }, {
                text: info.customer.address
            }, {
                text: "TIN/PAN: " + info.customer.pan
            }]]
        });
    }

    return insertLine(doc);
};

var writeItems = function (doc, info) {
    var tableObject = {
        layout: 'lightHorizontalLines',
        table: {
            headerRows: 1,
            widths: [25, 200, '*', 75, '*'],
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
            for(i in info.taxes.list) {
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

var writeTerms = function (doc) {
    doc.content.push({
        text: 'Terms & Conditions',
        style: 'termsHeading'
    });

    var srNo;
    for(var i in billWriter.config.terms) {
        srNo = parseInt(i)+1;
        doc.content.push({
            text: srNo+'. '+billWriter.config.terms[i],
            style: 'term'
        });
    }

    if(billWriter.config.eAndOe) {
        srNo++;
        doc.content.push({
            text: srNo+'. '+'E & OE',
            style: 'term'
        })
    }
    return doc;
};

var writeFooter = function (doc) {
    doc.content.push({
        text: 'For '+billWriter.config.companyName,
        style: 'signature'
    });
    return doc;
};
