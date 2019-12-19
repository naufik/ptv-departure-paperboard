/**
 * Source code for the quick HTTP-GET based demonstration.
 * Uses AWS Step Functions to connect the ends together.
 */
import { Handler, APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import { DepartureConfig } from '../departure';

/**
 * Translates a HTTP GET Request into the Departure Board Argument.
 * 
 * @param event API Gateway HTTP event.
 * @param ctx 
 * @param callback 
 */
export const unboxRequest: Handler<APIGatewayEvent, DepartureConfig | APIGatewayProxyResult> =
    async (event, ctx, callback) => {
        // Return non-GET requests with errors.
        if (event.httpMethod !== "GET") {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: "Malformed request body.",
            }
        }

        // Spit out the parameter of the departure board lambda function.
        let trackedStops = event.multiValueQueryStringParameters.stopID
            .slice(0, 3).map((param) => {
            return {
                stopId: parseInt(param),
                routes: 'all',
                routeType: event.queryStringParameters.routeType,
            }
        });
    };

/**
 * Lambda handler for converting the output into a HTTP Response.
 *
 * @param event 
 * @param ctx 
 * @param callback 
 */
export const wrapResponse: Handler<string | Buffer, APIGatewayProxyResult> =
    async (event, ctx, callback) => {
        if (event !== void 0) {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "image/bmp",
                    "Access-Control-Allow-Origin": "*",
                },
                body: (event).toString(),
            }
        }
        
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
            },
            body: "<h1>Bad Request</h1>"
        }
    }