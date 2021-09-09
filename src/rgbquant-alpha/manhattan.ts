/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * manhattanNeuQuant.ts - part of Image Quantization Library
 */
import { AbstractDistanceCalculator } from "./abstractDistanceCalculator"
import { Y } from "./bt709"

/**
 * Manhattan distance (NeuQuant modification) - w/o sRGB coefficients
 */
export abstract class AbstractManhattan extends AbstractDistanceCalculator {
    protected _kR : number;
    protected _kG : number;
    protected _kB : number;
    protected _kA : number;

    calculateRaw(rgba1: Array<number>, rgba2: Array<number>) : number {
        let dR = rgba2[0] - rgba1[0], dG = rgba2[1] - rgba1[1], dB = rgba2[2] - rgba1[2], dA = rgba2[3] - rgba1[3];
        if (dR < 0) dR = 0 - dR;
        if (dG < 0) dG = 0 - dG;
        if (dB < 0) dB = 0 - dB;
        if (dA < 0) dA = 0 - dA;

        return this._kR * dR + this._kG * dG + this._kB * dB + this._kA * dA;
    }
}

export class Manhattan extends AbstractManhattan {
    protected _setDefaults() {
        this._kR = 1;
        this._kG = 1;
        this._kB = 1;
        this._kA = 1;
    }
}

/**
 * Manhattan distance (Nommyde modification)
 * https://github.com/igor-bezkrovny/image-quantization/issues/4#issuecomment-235155320
 */
export class ManhattanNommyde extends AbstractManhattan {
    protected _setDefaults() {
        this._kR = 0.4984;
        this._kG = 0.8625;
        this._kB = 0.2979;
        // TODO: what is the best coefficient below?
        this._kA = 1;
    }
}

/**
 * Manhattan distance (sRGB coefficients)
 */
export class ManhattanSRGB extends AbstractManhattan {
    protected _setDefaults() {
        this._kR = Y.RED;
        this._kG = Y.GREEN;
        this._kB = Y.BLUE;
        // TODO: what is the best coefficient below?
        this._kA = 1;
    }
}
