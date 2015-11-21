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

var numberConverter = {
    $breakNumberInGroups: function (number) {
        var groups = [];

        var digits = number.toString().split('');
        var length = digits.length % 3 == 0 ? digits.length : (Math.floor(digits.length / 3) + 1) * 3;
        var digitsWithZeroes = [];
        for (var i = digits.length; i < length; i++) {
            digitsWithZeroes.push('0');
        }
        for (var j = 0; j < digits.length; j++) {
            digitsWithZeroes.push(digits[j]);
        }

        for (var k = length - 1; k > -1; k = k - 3) {
            var group1 = '';
            for (var l = k - 2; l <= k; l++) {
                group1 += digitsWithZeroes[l];
            }
            groups.push(group1);
        }

        return groups;
    },

    $getTextForGroup: function (group) {
        var onesPlace = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        var tensPlace = ["ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        var special = ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];

        var groupText = '';
        var digits = group.split('');

        for (var i = 0; i < 3; i++) {
            var digit = parseInt(digits[i]);
            if (digit > 0) {
                if (i == 1) {
                    groupText += (tensPlace[digit - 1] + ' ');
                }
                if (i == 2) {
                    if (parseInt(digits[1]) == 1) {
                        groupText += special[digit - 1];
                    } else {
                        groupText += onesPlace[digit - 1];
                    }
                }

                if (i == 0) {
                    groupText += (onesPlace[digit - 1] + ' hundred ');
                }
            }
        }
        return groupText;
    },

    $capitalizeFirstLetter: function (str) {
        str = str.replace( / +/g, ' ');
        str = str.substr(0, 1).toUpperCase() + str.substr(1);
        return str;
    },

    convertNumberToText: function (number) {
        var text = '';
        var denominations = ['', 'thousand', 'million', 'billion'];
        var groups = numberConverter.$breakNumberInGroups(number);
        if (groups.length > 4) {
            return 'Large numbers are not supported.';
        }
        for (var i = groups.length - 1; i >= 0; i--) {
            var placeValue = ' '+ denominations[i]+ ' ';

            var groupText = numberConverter.$getTextForGroup(groups[i]);
            text += groupText && groupText.trim().length? groupText + placeValue : '';
        }

        if (text == '') {
            text = 'zero';
        }
        return numberConverter.$capitalizeFirstLetter(text.trim());
    }

};
