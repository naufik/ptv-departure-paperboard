import render from './index';

const param ={
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

render(param, null, null);
