;(function(window, document, undefined) {

    var bind = function(elem, evt, func) {
        if (elem.addEventListener) {
            elem.addEventListener(evt, func, false);
        } else if (elem.attachEvent) {
            elem.attachEvent('on' + evt, func);
        }
    };

    var supportsNumber = function() {
        var testElem = document.createElement('input');
        testElem.setAttribute('type', 'number');
        return testElem.type !== 'text';
    };

    var onload = function() {
        var inputs = document.getElementsByTagName('input');

        for (var i = 0, il = inputs.length; i < il; i++) {
            var input = inputs[i];

            if (input.getAttribute('type').toLowerCase() === 'number') {
                bind(input, 'change', onchange);
            }
        }
    };

    var onchange = function() {
        var min = this.getAttribute('min'),
            max = this.getAttribute('max'),
            val = parseInt(this.value, 10);

        if (!isNaN(val)) {
            if (max && val > max) {
                this.value = max;
            } else if (min && val < min) {
                this.value = min;
            }
        }
    };

    if (!supportsNumber()) {
        bind(window, 'load', onload);
    }

}(this, this.document));
