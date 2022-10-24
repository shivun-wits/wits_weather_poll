const request = require('request');
const yargs = require('yargs')
const fs = require('fs')



const argv = yargs
    .usage('Usage $0 [options]')
    .option('list', {
        alias: 'l',
        description: 'Lists available Measurements, if \'-s\' parameter provided then lists chosen sensors only',
        type: 'boolean'
    })
    .option('period', {
        alias: 'p',
        describe: 'Period in ms at which data is queried from the weather station. Default is 1000ms',
        type: 'number'
    })
    .option('sensors', {
        alias: 's',
        describe: 'list of sensors to query, otherwise all are logged',
        type: 'string'
    })
    .help('h')
    .alias('h', 'help')
    .option('file', {
        alias: 'f',
        describe: 'File to write queried data',
        type: 'string'
    })
    .argv

function logError() {
    console.error('Failed to fetch at ' + new Date())
}


let options = {
    method: 'GET',
    url: 'http://weather.wits.ac.za/',
    qs: {
        command: 'DataQuery',
        uri: 'HttpDataloggerSource:public',
        format: 'json',
        mode: 'most-recent',
        p1: '1',
        p2: ''
    },
    headers: { Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)' }
};



let cont = true;


let queryIndices = [];

if (argv.sensors) {
    let x = argv.sensors.split(',').forEach(index => queryIndices.push(parseInt(index)))
}


if (argv.list) {
    cont = false
    console.log('Available Sensors/Measurements:')
}
// get first one

let interval = 1000

if (argv.period) {
    interval = parseInt(argv.period)
    options.qs.nextpoll = interval
}

console.log('Poll Interval: ' + interval + 'ms')


function getItems(array, indices) {
    out = []
    indices.forEach(index => out.push(array[index]))
    return out
}

let csvhead = "";
request(options, function (error, response, body) {
    if (error) logError();
    else {

        data = JSON.parse(body)
        if (queryIndices.length == 0) {
            queryIndices = [...Array(data.head.fields.length).keys()]
        }



        queryIndices.forEach(index => {
            let element = data.head.fields[index];
            let x = element.name;
            if (element.units) x += ' (' + element.units + ')';

            csvhead += ',' + x;

            if (!cont) console.log(index, x)
        });

        csvhead = 'UTC' + csvhead;

        if (cont) {

            let line = getItems(data.data[0].vals, queryIndices).join(',')
            line = data.data[0].time +','+ line

            if (argv.file) {
                console.log('Writing output to: ' + argv.file)
                fs.writeFileSync(argv.file, csvhead + '\n' + line)
            }
            console.log(csvhead)

            console.log(line)

           
        }

    }
});



function printData() {
    request(options, function (error, response, body) {
        if (error) logError();
        else {

            data = JSON.parse(body)

            let line = getItems(data.data[0].vals, queryIndices).join(',')
            line = data.data[0].time +','+ line
            console.log(line)

            if (argv.file) {
                try {
                    fs.appendFileSync(argv.file, '\n'+line);
                } catch (err) {
                    console.log(err);
                }
            }
        }

    })
}

if (cont) {
    setInterval(
        printData, interval)
}


