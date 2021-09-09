/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */

export abstract class AbstractDistanceCalculator {
    protected _maxDistance : number;
    protected _whitePoint : Array<number>;

    constructor() {
        this._setDefaults();

        // set default maximal color component deltas (255 - 0 = 255)
        this.setWhitePoint([255, 255, 255, 255]);
    }

    setWhitePoint(rgba: Array<number>) : void {
        this._whitePoint  = [
            (rgba[0] > 0) ? 255 / rgba[0] : 0,
            (rgba[1] > 0) ? 255 / rgba[1] : 0,
            (rgba[2] > 0) ? 255 / rgba[2] : 0,
            (rgba[3] > 0) ? 255 / rgba[3] : 0
        ];
        this._maxDistance = this.calculateRaw(rgba, [0, 0, 0, 0]);
    }

    calculateNormalized(colorA, colorB) : number {
        return this.calculateRaw(colorA, colorB) / this._maxDistance;
    }

    protected _setDefaults() : void {
    }

    /**
     * Calculate raw distance (non-normalized)
     */
    abstract calculateRaw(rgba1: Array<number>, rgba2: Array<number>) : number;
}
