/*
 Copyright 2015 ClayFish Technologies LLP

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

MONTH = {
    JANUARY: {
        index: 0,
        displayName: "January",
        shortName: "Jan",
        intDisplay: "01"
    },
    FEBRUARY: {
        index: 1,
        displayName: "February",
        shortName: "Feb",
        intDisplay: "02"
    },
    MARCH: {
        index: 2,
        displayName: "March",
        shortName: "Mar",
        intDisplay: "03"
    },
    APRIL: {
        index: 3,
        displayName: "April",
        shortName: "Apr",
        intDisplay: "04"
    },
    MAY: {
        index: 4,
        displayName: "May",
        shortName: "May",
        intDisplay: "05"
    },
    JUNE: {
        index: 5,
        displayName: "June",
        shortName: "Jun",
        intDisplay: "06"
    },
    JULY: {
        index: 6,
        displayName: "July",
        shortName: "Jul",
        intDisplay: "07"
    },
    AUGUST: {
        index: 7,
        displayName: "August",
        shortName: "Aug",
        intDisplay: "08"
    },
    SEPTEMBER: {
        index: 8,
        displayName: "September",
        shortName: "Sep",
        intDisplay: "09"
    },
    OCTOBER: {
        index: 9,
        displayName: "October",
        shortName: "Oct",
        intDisplay: "10"
    },
    NOVEMBER: {
        index: 10,
        displayName: "November",
        shortName: "Nov",
        intDisplay: "11"
    },
    DECEMBER: {
        index: 11,
        displayName: "December",
        shortName: "Dec",
        intDisplay: "12"
    },
    find: function (intMonth) {
        for (var property in MONTH) {
            if (MONTH.hasOwnProperty(property) && typeof MONTH[property] === 'object' && MONTH[property].index == intMonth) {
                return MONTH[property];
            }
        }
    }
};

DAY = {
    SUNDAY: {
        index: 0,
        displayName: "Sunday",
        shortName: "Sun",
        intDisplay: "7"
    },
    MONDAY: {
        index: 1,
        displayName: "Monday",
        shortName: "Mon",
        intDisplay: "1"
    },
    TUESDAY: {
        index: 2,
        displayName: "Tuesday",
        shortName: "Tue",
        intDisplay: "2"
    },
    WEDNESDAY: {
        index: 3,
        displayName: "Wednesday",
        shortName: "Wed",
        intDisplay: "3"
    },
    THURSDAY: {
        index: 4,
        displayName: "Thursday",
        shortName: "Thu",
        intDisplay: "4"
    },
    FRIDAY: {
        index: 5,
        displayName: "Friday",
        shortName: "Fri",
        intDisplay: "5"
    },
    SATURDAY: {
        index: 6,
        displayName: "Saturday",
        shortName: "Sat",
        intDisplay: "6"
    },
    find: function (intDay) {
        for (var property in DAY) {
            if (DAY.hasOwnProperty(property) && typeof DAY[property] === 'object' && DAY[property].index == intDay) {
                return DAY[property];
            }
        }
    }
};

DARK_COLOR = {
    BLUE: {
        index: 0,
        hexCode: "1BA1F8"
    },
    RED: {
        index: 1,
        hexCode: "f80a09"
    },
    GREEN: {
        index: 2,
        hexCode: "29b038"
    },
    ORANGE: {
        index: 3,
        hexCode: "f87e0e"
    },
    BROWN: {
        index: 4,
        hexCode: "B05E02"
    },
    GRAY: {
        index: 5,
        hexCode: "7E807B"
    },
    PURPLE: {
        index: 6,
        hexCode: "9332b0"
    },

    random: function () {
        var randomIndex = utils.getRandomIntInInterval(0, 6);
        for (var i in DARK_COLOR) {
            if (typeof DARK_COLOR[i] !== 'function' && DARK_COLOR[i].index == randomIndex) {
                return DARK_COLOR[i];
            }
        }
    }
};
