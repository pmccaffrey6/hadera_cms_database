function ComputedMetricsStore() {
    this.computed_values = {};
}

ComputedMetricsStore.prototype.get = function() {
    var args = Array.prototype.slice.call(arguments);
    var values = this.computed_values[args.join(':')];
    return (values.length > 4 ? values.slice(1) : values);
};

ComputedMetricsStore.prototype.put = function() {
    var args = Array.prototype.slice.call(arguments);
    this.computed_values[args.slice(1).join(':')] = arguments[0];
};

ComputedMetricsStore.prototype.put_avg = function() {
    var args = Array.prototype.slice.call(arguments);
    var values = args[0];
    var key = args.slice(1).join(':');

    if (this.computed_values.hasOwnProperty(key)) {
        var old_values = this.computed_values[key];
        var count = old_values[0];
        var new_values = old_values.slice(1).map(function(v, i) { return (v * count + values[i]) / (count + 1); });
        new_values.unshift(count + 1);

        this.computed_values[key] = new_values;
    } else {
        var new_values = values.slice(0);
        new_values.unshift(1);
        this.computed_values[key] = new_values;
    }
};

module.exports = ComputedMetricsStore;