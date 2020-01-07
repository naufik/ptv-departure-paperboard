# Departure Board

![](https://i.imgur.com/7CAFaia.png)

A function (AWS Lambda compatible) that generates PTV public transit departures.
The function takes options as an 'event' and returns a `.bmp` image.

The function is intended to be used with an IoT setup at home to deliver
upcoming bus departures, the function is called once per minute and the image
is displayed on [this ePaper screen](https://www.waveshare.com/wiki/7.5inch_e-Paper_HAT).

## Using the Function

You can run the function locally or on AWS Lambda.

### Preliminary Steps

Clone the repository and run:
```bash
npm install
```

The function requires two environment variables to run:
- `PTV_KEY` that contains your PTV developer key.
- `PTV_DEVID` that contains your PTV developer ID.
You need to obtain these values from PTV by emailing them, see [more information
on the PTV API](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api).

### Running this function on Lambda
This assumes that you are running on the web-console, not the CLI alternative.
You will need to have typescript installed globally, you can obtain it by running:
```bash
npm install -g typescript
```

**Step 1:** Run `npm run build`. This will create a ZIP file called `function.zip`
in the project's root folder.

**Step 2:** Open your AWS console and navigate to Lambda. Create a new function
and upload the ZIP to the AWS console (by changing Code entry type to "Upload a
.zip file").

**Step 3:** Add the `PTV_DEVID` and `PTV_KEY` environment variables and set them
to be the keys you get from PTV.

**Step 4:** Set the "Handler" function. **If you want to use AWS API Gateway you need to change the handler to `index.handleAPICall`**. Otherwise, set it to `index.render`.

**Step 5:** *Optional.* Create an API Gateway, you should then be able to send
a POST request with a body to the API gateway URL. See **Request Body Format**
for more info. 

**Step 5B:** Test your function!

### Running the Function Locally

To run locally. Install `ts-node` and `typescript` globally using
```
npm install -g ts-node typescript
```

Then, create a file to test or use the function. Have a look at `index.test.ts`
to see how it can be called. See **Request Body Format** for format of `event`.

On Linux, run
```
PTV_DEVID=$YOUR_DEV_ID PTV_KEY=$YOUR_KEY node-ts index.test.ts
```
replacing `index.test.ts` with any other file that you have created. The
function will save a file called test.bmp in the root folder of your project.


## Test / Evaluation

Try this out by visiting the URL:

```
https://b7kmrvpr6d.execute-api.ap-southeast-1.amazonaws.com/default/departures?stopID=14281&routeType=2
```

Stop ID can be replaced with ID of another bus stop. Instructions to obtain in the next section.

## Request Body Format (for POST)

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

- Use a custom URL for the evaluation. 
- Organize and decouple: rewrite with async/await (I do realize what I have now is not in the best stylistic choice).
- Rewrite the rendering logic: JIMP is fantastic, but heavy. Loading the library
alone uses a lot of RAM, so I plan to rewrite this using