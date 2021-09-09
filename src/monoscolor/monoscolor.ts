let MonoSColorsRAW = require("json-loader!./monospace-colors.json");

interface MonoSpaceArrayArray {
    'uint32': number[]
}

interface MonoSpaceObjectArray {
    [uint32: string]: {
        'rgba': number[],
        'ch': string
    }
}

//static class that will convert our object to multiple usable forms when requested
class MonoSColors {

    private static ColorObjectByUint32Object: MonoSpaceObjectArray;
    private static ColorObjectArrayArray: MonoSpaceArrayArray[];

    public ColorObjectArray = (): MonoSpaceArrayArray[] => {
        if(MonoSColors.ColorObjectArrayArray != null)
        {
            return MonoSColors.ColorObjectArrayArray;
        }
        let colorArray: MonoSpaceArrayArray[] = [];

        let ByUint32Colors2: MonoSpaceObjectArray = this.ColorObjectByUint32();

        var ByUint32Colors = this.ColorObjectByUint32();
            for(var key in ByUint32Colors)
            {
                let object = {uint32: null};

                for(var key2 in ByUint32Colors[key])
                {
                    object[key2] = ByUint32Colors[key][key2];
                }

                object.uint32 = key;

                colorArray.push(object);
            }

            MonoSColors.ColorObjectArrayArray = colorArray;

        return colorArray;
        
    }

    public ColorObjectByUint32 = ():MonoSpaceObjectArray => {

        if(MonoSColors.ColorObjectByUint32Object != null)
        {
            return MonoSColors.ColorObjectByUint32Object;
        }

        var colorObject: MonoSpaceObjectArray = {};

        for(var key in MonoSColorsRAW)
        {
            for(var key2 in MonoSColorsRAW[key])
            {
                
                colorObject[key2] = MonoSColorsRAW[key][key2];
            }
        }

        MonoSColors.ColorObjectByUint32Object = colorObject;

        return colorObject;
    }

}

export let MonoSpaceColors = new MonoSColors();
