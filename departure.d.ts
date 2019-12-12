export interface DepartureConfig {
    timezoneOffset: number;
    trackedStops: {
        routeType: number;
        stopId: number;
        stopName?: string;
        routeIds: number[] | string;
        minutePadding?: number;
    }[]
    displayAliases?: Map<RouteDirection, DepartureText>;
}

export interface RouteDirection {
    routeId: number;
    directionId: number;
}

export interface DepartureText {
    header: string | { default: true };
    subtitle: string | { default: true };
}