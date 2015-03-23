
var utils = {
    getDate: function(date) {
        if(date === undefined || date == null) {
            date = new Date();
        }
        return MONTH.find(date.getMonth()).displayName+" "+date.getDate()+", "+date.getFullYear();
    }
};
