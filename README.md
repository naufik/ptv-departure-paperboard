# Departure Board

![](https://i.imgur.com/7CAFaia.png)

A function (AWS Lambda compatible) that generates PTV public transit departures.
The function takes options as an 'event' and returns a `.bmp` image.

The function is intended to be used with an IoT setup at home to deliver
upcoming bus departures, the function is called once per minute and the image
is displayed on [this ePaper screen](https://www.waveshare.com/wiki/7.5inch_e-Paper_HAT).

## Test / Evaluation

To try, send a HTTP POST request to (soon) with the
following JSON body:

```typescript
{
    "timezoneOffset": 0, // This parameter is not used, but needs to be here. Will be removed.
    "trackedStops": Stop[] // A list of stops to 'track'.
}
```

Each `Stop` has the following format:
```typescript
{
    "stopId": 1000, // Stop primary key.
    "routeType": 2, // The PTV 'routeType', see below.
    "routes": "all",    // Primary keys of routes.
}
```

**Route Types**:
- `0` is Metro Train.
- `1` is Tram.
- `2` is Bus.
- `3` is VLine Train.
- `4` is Night Bus.

**Obtaining a Stop ID**:
- Find a route you wish to track in the **PTV Website**.
- Click on a stop and follow the link until you see departures of the stop.
- The URL when viewing departures of a stop will be in the following format:
    `https://www.ptv.vic.gov.au/stop/{STOPID}/{STOPNAME}/...`.
- Copy the stop id from the URL into the JSON request body.

## To-Do List

- Organize and decouple: rewrite with async/await (I do realize it is not the
    best stylistic choice).
- Rewrite the rendering logic: JIMP is fantastic, but heavy. Loading the library
alone uses a lot of RAM, so I plan to rewrite this using