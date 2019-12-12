/**
 * Departure Board.
 */

import { Handler } from "aws-lambda";
import { DepartureConfig } from "./departure.d"
// TODO: Maybe try to not use the Phin library? It can make things 10kB lighter
// and lambda loading less required.
import * as Phin from 'phin';
import * as Crypto from 'crypto';
import * as Path from 'path';
import * as QueryString from 'querystring';
// TODO: JIMP may be 'too heavy too load' (16MB) for lambda purposes. May want to use
// a different library or delegate it to an always-on service.
import * as Jimp from 'jimp';


const PTV_ID: number = parseInt(process.env.PTV_DEVID);
const PTV_KEY: string = process.env.PTV_KEY;
const BASE_URL: string = "https://timetableapi.ptv.vic.gov.au";


/**
 * Creates a finalized version of the request, this adds the base URL and the
 * signature required by PTV API.
 */
const finalizeRequest = (req: string, params: any = {}) => {
    req = '/v3/' + req + (req.includes("?") ? "&" : "?") + `devId=${PTV_ID}&${QueryString.stringify(params)}`;

    const sig = Crypto.createHmac('sha1', Buffer.from(PTV_KEY))
        .update(Buffer.from(req)).digest('hex').toUpperCase();
    return BASE_URL + req + `&signature=${sig}`;
}


/**
 * Lambda handler function.
 * @param event 
 */
const render: Handler<DepartureConfig, any> = (event: DepartureConfig) => {
    let defaultParams = {
        expand: [ "direction", "route" ],
        max_results: 40,
    };

    // TODO: Create a DepartureInfo interface
    let requests: Promise<any>[] = [];

    for (let item of event.trackedStops) {
        let url = finalizeRequest(`departures/route_type/${item.routeType}/stop/${item.stopId}`,
            defaultParams);

        // Obtains data for each stop from PTV API.
        let promiseId = Math.floor(Math.random() * 300);
        
        let request = Phin({
            url: url,
        }).then((data) => {
            // TODO: Create interface for the departure info data.
            let deps: any[] = [];

            const resObj = JSON.parse(data.body);
            for (let departure of resObj.departures) {
                deps.push(
                    {
                        route: resObj.routes[departure.route_id].route_number,
                        to: resObj.directions[departure.direction_id].direction_name,
                        stopId: departure.stop_id,
                        toId: departure.direction_id,
                        routeId: departure.route_id,
                        scheduled: departure.scheduled_departure_utc,
                        estimated: departure.estimated_departure_utc,
                    }
                );
            }
            return deps;
        });
        requests.push(request);
    }

    // TODO: delegate the rendering part.
    return Promise.all(requests).then((stopDepartures) => {
        let allDepartures: any[] = [].concat(...stopDepartures)

        return allDepartures.sort((a,b) => {
            // Sort by departure time.
            return new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime();
        }).filter((thing) => {
            // Takes out PTV "combined" routes, it is not useful.
            return !thing.route.toLowerCase().includes('combine'); 
        }).slice(0, 80);
    }).then((data) => {
        /**
         * This function renders the board, should be delegated to another lambda function.
         */
        let displayedDepartures = data.slice(0, 5);
        return Jimp.create(600,400, Jimp.cssColorToHex("#FFFFFFFF"))
            .then(async (img) => {
                let FONT = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
                let ROUTEFONT = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
                let MINIFONT = await Jimp.loadFont(Jimp.FONT_SANS_14_BLACK);
                let offset = 0;
                for (let currentDep of displayedDepartures) {
                    // create the square
                    for (let i = 10; i <= 83; ++i) {
                        for (let j = 36 + offset; j <= 82 + offset; ++j) {
                            img = img.setPixelColor(Jimp.cssColorToHex("#000000FF"), i, j);
                        }
                    }
                    let depTime = currentDep.estimated || currentDep.scheduled;
                    let mins = (new Date(depTime)
                        .getTime() - new Date().getTime()) / 60000;
                    
                    img = img
                        // Prints the route number, big.
                        .print(FONT, 20, 40 + offset,
                            currentDep.route)
                        // Prints the destination/direction of the route.
                        .print(ROUTEFONT, 115, 30 + offset,
                            currentDep.to)
                        // prints the subtitle (i.e. 'via Place')
                        .print(MINIFONT, 115, 30 + 35 + offset,
                            "via ${placeholder}")
                        // prints the 'when to walk timer'
                        .print(MINIFONT, 490, 30 + offset,
                            "walk in")
                        .print(ROUTEFONT, 490, 43 + offset, 
                            `${Math.floor(mins)}min`);
                    offset += 64;
                }
                img.writeAsync("departures.bmp");
            });
    });
}



export default render;