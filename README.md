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
    "routes": "all",    // Which routes to track, only 'all' is supported right now.
}
```


## Notes

This is not yet finished, and the `bmp` image is not properly output as a
response yet.