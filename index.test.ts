/**
 * Sample function call for PTV Departures Paperboard.
 * http://github.com/naufik
 */
import { render } from './index';
import * as File from 'fs';

/**
 * To test other PTV stops, change the stopID and routeType parameters. As of
 * this version, the routeIds parameter do not work properly yet.
 * 
 * See https://github.com/naufik/ptv-departure-paperboard for more information.
 */
const event = {
    timezoneOffset: 0,
    trackedStops: [
        {
            stopId: 13743,
            routeIds: 'all',
            routeType: 2,
        },
        {
            stopId: 11091,
            routeIds: 'all',
            routeType: 2,
        }
    ]
}

let output = (render(event, null, null) as Promise<Buffer>).then((img) => {
    console.log(img);
    File.writeFileSync(__dirname + '/test2.bmp', img.toString("binary"));
});