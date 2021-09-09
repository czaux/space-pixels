import { AbstractDistanceCalculator } from "./abstractDistanceCalculator"
import { rgb2hsl } from "./rgb2hsl"
import { Y } from "./constants/bt709"
import {createUint32FromRGBA2} from "./dither"
const hueGroups : number = 10;

export function hueGroup(hue : number, segmentsNumber : number) {
    const maxHue = 360,
          seg    = maxHue / segmentsNumber,
          half   = seg / 2;

    for (let i = 1, mid = seg - half; i < segmentsNumber; i++, mid += seg) {
        if (hue >= mid && hue < mid + seg) return i;
    }
    return 0;
}

export class Palette {
    private _pointArray : number[][] = [];
    private _i32idx : { [ key : string ] : number } = {};

    add(color) {
        this._pointArray.push(color);
    }

    has(color) {
        return this._pointArray.includes(color, -1);
    }

    // TOTRY: use HUSL - http://boronine.com/husl/ http://www.husl-colors.org/ https://github.com/husl-colors/husl
    getNearestColor(colorDistanceCalculator : AbstractDistanceCalculator, rgba) {
        return this._pointArray[ this.getNearestIndex(colorDistanceCalculator, rgba) | 0 ];
    }

    private _nearestPointFromCache(key : string) {
        return typeof this._i32idx[ key ] === "number" ? this._i32idx[ key ] : -1;
    }

    private getNearestIndex(colorDistanceCalculator : AbstractDistanceCalculator, rgba) : number {
        /*var idx : number = this._nearestPointFromCache("" + uint32);
        if (idx >= 0) return idx;
*/
        var idx = 0;
        var minimalDistance : number = Number.MAX_VALUE;

        idx = 0;
        for (let i = 0, l = this._pointArray.length; i < l; i++) {
            var p        = this._pointArray[ i ],
                  distance = colorDistanceCalculator.calculateRaw(rgba[0], rgba[1], rgba[2], rgba[3], p[0], p[1], p[2], p[3]);

            if (distance < minimalDistance) {
                minimalDistance = distance;
                idx             = i;
            }
        }

        //this._i32idx[ uint32 ] = idx;
        return idx;
    }


    // TODO: group very low lum and very high lum colors
    // TODO: pass custom sort order
    // TODO: sort criteria function should be placed to HueStats class
    sort() {
        this._i32idx = {};
        this._pointArray.sort((a, b) => {
            const hslA = rgb2hsl(a[0], a[1], a[2]),
                  hslB = rgb2hsl(b[0], b[1], b[2]);

            // sort all grays + whites together
            const hueA = (a[0] === a[1] && a[1] === a[2]) ? 0 : 1 + hueGroup(hslA.h, hueGroups),
                  hueB = (b[0] === b[1] && b[1] === b[2]) ? 0 : 1 + hueGroup(hslB.h, hueGroups);

            const hueDiff = hueB - hueA;
            if (hueDiff) return -hueDiff;

            const lA = this.getLuminosity(a, true),
                  lB = this.getLuminosity(b, true);

            if (lB - lA !== 0) return lB - lA;

            const satDiff = ((hslB.s * 100) | 0) - ((hslA.s * 100) | 0);
            if (satDiff) return -satDiff;

            return 0;
        });
    }

    getLuminosity(color, useAlphaChannel : boolean) : number {
        let r = color[0],
            g = color[1],
            b = color[2];

        if (useAlphaChannel) {
            r = Math.min(255, 255 - color[3] + color[3] * r / 255);
            g = Math.min(255, 255 - color[3] + color[3] * g / 255);
            b = Math.min(255, 255 - color[3] + color[3] * b / 255);
        }

        return r * Y.RED + g * Y.GREEN + b * Y.BLUE;
    }

}