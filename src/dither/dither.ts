import { AbstractDistanceCalculator } from "./abstractDistanceCalculator";
import { Y } from "./constants/bt709";
import { Palette } from "./palette";

export function createUint32FromRGBA(r,g,b,a) {
    return (a << 24 | b << 16 | g << 8 | r) >>> 0;
}

export function createUint32FromRGBA2(arr) {
    return (arr[3] << 24 | arr[2] << 16 | arr[1] << 8 | arr[0]) >>> 0;
}

export function createRGBAfromUInt32(uint32) {
    var arr = Array(4);
    arr[0] = uint32 & 0xff;
    arr[1] = (uint32 >>> 8) & 0xff;
    arr[2] = (uint32 >>> 16) & 0xff;
    arr[3] = (uint32 >>> 24) & 0xff;
    return arr;
}

export function inRange0to255Rounded(n : number) {
    n = Math.round(n);
    if (n > 255) n = 255;
    else if (n < 0) n = 0;
    return n;
}

export class ErrorDiffusionDither {

    // adapted from http://jsbin.com/iXofIji/2/edit by PAEz
    // fixed version. it doesn't use image pixels as error storage, also it doesn't have 0.3 + 0.3 + 0.3 + 0.3 = 0 error
    dither(pointBuffer, width, height, palette : Palette, _distance) {
        var errorLines : number[][][] = [];
        let originalPoint:number[];

        var dir           = 1,
            maxErrorLines = 1;

        var _kernel =  [[ 7 / 16, 1, 0 ],
            [ 3 / 16, -1, 1 ],
            [ 5 / 16, 0, 1 ],
            [ 1 / 16, 1, 1 ]];

        var _serpentine = false;

        var _calculateErrorLikeGIMP = true;

        var _minColorDistance = 0;

        // initial error lines (number is taken from dithering kernel)
        for (let  i = 0; i < _kernel.length; i++) {
            var kernelErrorLines = _kernel[ i ][ 2 ] + 1;
            if (maxErrorLines < kernelErrorLines) maxErrorLines = kernelErrorLines;
        }

        for (let  i = 0; i < maxErrorLines; i++) {
            this._fillErrorLine(errorLines[ i ] = [], width);
        }

        for (let  y = 0; y < height; y++) {
            // always serpentine
            if (_serpentine) dir = dir * -1;

            const lni    = y * width,
                  xStart = dir == 1 ? 0 : width - 1,
                  xEnd   = dir == 1 ? width : -1;

            // cyclic shift with erasing
            this._fillErrorLine(errorLines[ 0 ], width);
            // TODO: why it is needed to cast types here?
            errorLines.push(<number[][]>errorLines.shift());

            const errorLine = errorLines[ 0 ];
            for (let  x = xStart, idx = lni + xStart; x !== xEnd; x += dir, idx += dir) {
                // Image pixel

                let point:number = pointBuffer[idx];
                let pointr:number[] = createRGBAfromUInt32(point);
                originalPoint  = createRGBAfromUInt32(pointBuffer[idx]);

                const error = errorLine[ x ];

                const correctedPoint:number[] = Array(
                    inRange0to255Rounded(pointr[0] + error[ 0 ]),
                    inRange0to255Rounded(pointr[1] + error[ 1 ]),
                    inRange0to255Rounded(pointr[2] + error[ 2 ]),
                    inRange0to255Rounded(pointr[3] + error[ 3 ])
                );
                
                // Reduced pixel
                const palettePoint = palette.getNearestColor(_distance, correctedPoint, createUint32FromRGBA2(correctedPoint));
                pointBuffer[idx] = createUint32FromRGBA2(palettePoint);
                pointr = palettePoint;

                //point.from(palettePoint);
                // dithering strength
                if (_minColorDistance) {
                    var dist = _distance.calculateNormalized(pointr, palettePoint);
                    if (dist < _minColorDistance) continue;
                }


                // Component distance
                let er : number, eg : number, eb : number, ea : number;
                if (_calculateErrorLikeGIMP) {
                    er = correctedPoint[0] - palettePoint[0];
                    eg = correctedPoint[1] - palettePoint[1];
                    eb = correctedPoint[2] - palettePoint[2];
                    ea = correctedPoint[3] - palettePoint[3];
                } else {
                    er = originalPoint[0] - palettePoint[0];
                    eg = originalPoint[1] - palettePoint[1];
                    eb = originalPoint[2] - palettePoint[2];
                    ea = originalPoint[3] - palettePoint[3];
                }

                const dStart = dir == 1 ? 0 : _kernel.length - 1,
                      dEnd   = dir == 1 ? _kernel.length : -1;

                for (let i = dStart; i !== dEnd; i += dir) {
                    const x1 = _kernel[ i ][ 1 ] * dir,
                          y1 = _kernel[ i ][ 2 ];

                    if (x1 + x >= 0 && x1 + x < width && y1 + y >= 0 && y1 + y < height) {
                        const d = _kernel[ i ][ 0 ],
                              e = errorLines[ y1 ][ x1 + x ];

                        e[ 0 ] = e[ 0 ] + er * d;
                        e[ 1 ] = e[ 1 ] + eg * d;
                        e[ 2 ] = e[ 2 ] + eb * d;
                        e[ 3 ] = e[ 3 ] + ea * d;
                    }
                }
            }
        }

        return pointBuffer;
    }

    private _fillErrorLine(errorLine : number[][], width : number) : void {
        // shrink
        if (errorLine.length > width) {
            errorLine.length = width;
        }

        // reuse existing arrays
        var l = errorLine.length;
        for (let i = 0; i < l; i++) {
            var error = errorLine[ i ];
            error[ 0 ]  = error[ 1 ] = error[ 2 ] = error[ 3 ] = 0;
        }

        // create missing arrays
        for (var i = l; i < width; i++) {
            errorLine[ i ] = [ 0.0, 0.0, 0.0, 0.0 ];
        }
    }

}


