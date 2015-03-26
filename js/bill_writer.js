
var billWriter = {
    version: '0.1.0',
    config: {
        companyName: "Global Vision",
        address: "A83, Gali No 5, Saket, New Delhi-30",
        tin: "12DF33FFG32F",
        terms: ["1. Goods once sold cannot be taken back.",
            "2. Interest @18% pa chargeable on bills unpaid for more than 15 days.",
            "3. Dispute will be under Delhi jurisdiction.",
            "4. This bill is not valid without authority signatures."],
        eAndOe: true,
        blank: false
    },

    generateBill: function(doc, info) {
        border(doc);
        generateBillHeader(doc);
        writeCustomerInfo(doc, info);
        writeItems(doc, info);
        writeTaxes(doc, info);
        writeTerms(doc);
        writeFooter(doc);
    },

    download: function(doc, fileName) {
        if(fileName === undefined || fileName == null) {
            var date = new Date();
            fileName = "bill_"+ date.getFullYear() + date.getMonth() + date.getDate();
        }

        doc.save(fileName+".pdf");
    }

};

var generateBillHeader = function(doc) {
    doc.setFontSize(15);
    doc.text(76, 18, "Retail Invoice/Bill");
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(20);
    doc.text(75, 25, billWriter.config.companyName);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(70, 32, billWriter.config.address);
    doc.text(82, 38, "TIN: "+billWriter.config.tin);
    doc.line(10,45,200,45);
};

var border = function(doc) {
    doc.rect(10,10, 190, 275);
};

var writeEAndOe = function(doc) {
    doc.setFontSize(8);
    doc.text(190, 44, 'E & OE');
};

var writeCustomerInfo = function(doc, info) {
    var writeBlankCustomerInfo = function() {
        doc.text(80, 55, "M/s ___________________________________________________");
        doc.text(80, 63, "_______________________________________________________");
        doc.text(80, 71, "TIN/PAN: ______________________________________________");
    };

    doc.setFontSize(10);
    doc.text(15, 55, "Invoice: " + info.billNo);
    doc.text(15, 63, "Date: " + utils.getDate());
    doc.line(75,45,75,80);

    if(billWriter.config.blank) {
        writeBlankCustomerInfo();
    } else {
        doc.text(80, 55, info.customer.name);
        doc.text(80, 63, info.customer.address);
        doc.text(80, 71, "TIN/PAN: "+info.customer.pan);
    }

    doc.line(10, 80, 200, 80);
};

var writeItems = function(doc, info) {
    doc.text(15, 86, "Sr");
    doc.text(60, 86, "Name");
    doc.text(120, 86, "Price");
    doc.text(150, 86, "Units");
    doc.text(180, 86, "Amount");
    doc.line(10, 88, 200, 88);
    doc.line(10, 230, 200, 230);

    doc.line(20, 80, 20, 190);
    doc.line(115, 80, 115, 190);
    doc.line(140, 80, 140, 190);
    doc.line(170, 80, 170, 200);

    if(billWriter.config.blank) {

    } else {

    }
};

var writeTaxes = function(doc, info) {
    doc.setFontSize(8);
    if(!info.taxApplied) {
        // No taxes, just extend the vertical lines of items
        doc.line(20, 190, 20, 220);
        doc.line(115, 190, 115, 220);
        doc.line(140, 190, 140, 220);
        doc.line(170, 200, 170, 230);

        doc.line(10, 220, 200, 220);
        doc.text(140, 227, "Total payable amount");
        if(!billWriter.config.blank) {
            doc.text(175, 224, info.discount.totalAfterDiscount);
        }
    } else {
        // Draw a horizontal line to make it separate from Items
        doc.line(10, 190, 200, 190);
        doc.line(10, 200, 200, 200);
        doc.text(160, 193, "Total");
        if(!billWriter.config.blank) {
            doc.text(170, 192, info.discount.totalAfterDiscount);
            var cursor = {x: 20, y: 196};

            for(var i=0; i<info.taxes.list.length; i++) {
                var tax = info.taxes.list[i];
                doc.text(cursor.x, cursor.y, tax.name+' ('+ tax.percent+'&#8377;)');
                doc.text(170, cursor.y, tax.amount);
                cursor.y += 4;
            }
        }
    }
};
var writeTerms = function(doc, terms) {

};
var writeFooter = function(doc) {
    if(billWriter.config.eAndOe) {
        writeEAndOe(doc);
    }
};
