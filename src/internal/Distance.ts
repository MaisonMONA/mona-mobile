import {Discovery} from "@/internal/Types";

export class Distance {
    private static R = 6371000;

    //Haversine Formula
    //inspire du code python https://community.esri.com/t5/coordinate-reference-systems-blog/distance-on-a-sphere-the-haversine-formula/ba-p/902128#:~:text=For%20example%2C%20haversine(%CE%B8),longitude%20of%20the%20two%20points.
    public static calculateDistance(discovery:Discovery, lat2:number, lng2:number){
        const lat1 = discovery.getLocation().lat
        const lng1 = discovery.getLocation().lng
        const phi1 = this.degrees2radians(lat1)
        const phi2 = this.degrees2radians(lat2)
        const delta_phi = this.degrees2radians(lat2 - lat1)
        const delta_lambda = this.degrees2radians(lng2 - lng1)
        const a = Math.sin(delta_phi/2.0)** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda/2.0)**2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt((1-a)))
        return this.R * c; //distance en metre
    }
    //source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-33.php
    public static degrees2radians(degrees: number){
        const pi = Math.PI;
        return degrees * (pi/180);
    }
    public static roundDown(number:number){ //up to 3 decimal
        return Math.round(number * 1000) / 1000
    }
    public static distance2string(meters:number) {
        if (meters > 1000)
            return Math.round(meters/1000) + " km"

        return Math.round(meters) + " m"
    }
}