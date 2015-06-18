var fs = require('fs');
var csv = require('csv');

var ComputedMetricsStore = require('./computed_metrics_store');

function CmsMetrics() {
    // Parsing CMS DRG csv file
    this.csvparser = csv.parse({});
    this.csvparser.on('readable', this.onCsvRecord.bind(this));
    this.csvparser.on('finish', this.onCsvFinished.bind(this));
}

CmsMetrics.prototype.resetData = function() {
    this.metrics = new ComputedMetricsStore();
    this.drg_to_id = {};
    this.hospital_details = {};
    this.first_record = true;
    // START peter addition
    this.avg_medicare_payments = [];
    // END peter addition
};

CmsMetrics.prototype.loadFromFile = function(filename) {
    this.resetData();
    var file_extension = filename.split('.').pop();
    var fs_stream = fs.createReadStream(filename)
        fs_stream.pipe(this.csvparser);
};

CmsMetrics.prototype.onCsvRecord = function() {
    while (data = this.csvparser.read()) {
        if (this.first_record) {
            this.first_record = false;
            break;
        }

        var hospital_name = data[2];
        var hospital_id = data[1];
        var drg_parts = data[0].split(' - ',2);
        var drg_name = drg_parts[1];
        var drg_id = drg_parts[0];
        var region = data[7];

        var values = data.slice(8,12).map(function(v) { return parseFloat(v); });
        
        // START peter addition
        this.avg_medicare_payments.push(values[3]);
        // END peter addition

        this.metrics.put(values, hospital_id, drg_id);
        this.metrics.put_avg(values, hospital_id);
        this.metrics.put_avg(values, drg_id);
        this.metrics.put_avg(values, region);
        this.metrics.put_avg(values, region, drg_id);
        this.metrics.put_avg(values, "global");

        if (!this.drg_to_id.hasOwnProperty(drg_name)) {
            this.drg_to_id[drg_name] = drg_id;
        }

        if (!this.hospital_details.hasOwnProperty(hospital_name)) {
            this.hospital_details[hospital_name] = {
                id: hospital_id,
                name: hospital_name,
                address: data[3],
                city: data[4],
                state: data[5],
                zip: data[6],
                region: data[7],
                // lat long
                latitude: data[12],
                longitude: data[13],
            };
        }
    }
};

CmsMetrics.prototype.onCsvFinished = function() {
    console.log("Data load complete.");
};

CmsMetrics.prototype.getMetric = function(metric_key) {
    return this.metrics.get(metric_key);
};

CmsMetrics.prototype.getProviders = function() {
    var details_array = [];

    for (var k in this.hospital_details) {
        details_array.push(this.hospital_details[k]);
    }

    return details_array;
};

CmsMetrics.prototype.getDrgs = function() {
    var drg_array = [];

    for (var k in this.drg_to_id) {
        drg_array.push({name: k, id: this.drg_to_id[k]});
    }

    return drg_array;
};

// START Peter addition
CmsMetrics.prototype.getPaymentSet = function() {
    return this.avg_medicare_payments;
};
// END peter addition

module.exports = new CmsMetrics();