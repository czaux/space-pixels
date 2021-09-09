




export function getInnerElementCoords(canvas, object, id) {
    let newcoords = { tl: {}, tr: {}, bl: {}, br: {} };
    let paths = object.getObjects()[0].paths;
    var matcher = new RegExp(id, "i");
    //Don't use objects ocoords because they multiply by canvas zoom.
    for(let index in paths) {
        if(matcher.test(paths[index].id)) {
            let scaleX = paths[index].group.scaleX;
            let scaleY = paths[index].group.scaleY;
            let left = paths[index].left;
            let top = paths[index].top;
            let width = paths[index].width;
            let height = paths[index].height;
            let tl = { x: object.left + left * scaleX, y: object.top + top * scaleY } // top left corner 
            let tr = { x: tl.x + width * scaleX, y: tl.y } // top right corner
            let bl = { x: tl.x, y: tl.y + height * scaleY } // bottom left corner
            let br = { x: tr.x, y: bl.y } // bottom right corner
            newcoords.tl = tl;
            newcoords.tr = tr;
            newcoords.bl = bl;
            newcoords.br = br;
            newcoords['left'] = (object.get('left') + paths[index].get('left')) * object.get('zoomX');
            newcoords['top'] =  (object.top + top) * object.zoomY;
            newcoords['rleft'] = object.left + left;
            newcoords['rtop'] = object.top + top;
            newcoords['object'] = paths[index];
            break;
        }
    }
    return newcoords;
}


export function getOuterPolygonCoords(canvas, object, id) {

    let elementcoords = this.getInnerElementCoords(canvas, object, id);

    var startPoints = [
        {x: 0, y: 0},
        {x: 0, y: canvas.height},
        {x: canvas.width, y: canvas.height},
        {x: canvas.width, y: 0},
        {x: 0, y: 0},
        {x:elementcoords.tl['x'], y:elementcoords.tl['y']},
        {x:elementcoords.bl['x'], y:elementcoords.bl['y']},
        {x:elementcoords.br['x'], y:elementcoords.br['y']},
        {x:elementcoords.tr['x'], y:elementcoords.tr['y']},
        {x:elementcoords.tl['x'], y:elementcoords.tl['y']},
        {x: 0, y: 0},
    ];

    return startPoints;
}

function typeOf(val) {
    return Object.prototype.toString.call(val).slice(8,-1);
}


// returns uniform pixel data from various img
export function customGetImageData(img, width) {
    var can, ctx, imgd, buf8, buf32, height;

    switch (typeOf(img)) {
        case "HTMLImageElement":
            can = document.createElement("canvas");
            can.width = img.naturalWidth;
            can.height = img.naturalHeight;
            ctx = can.getContext("2d");
            ctx.drawImage(img,0,0);
        case "Canvas":
        case "HTMLCanvasElement":
            can = can || img;
            ctx = ctx || can.getContext("2d");
        case "CanvasRenderingContext2D":
            ctx = ctx || img;
            can = can || ctx.canvas;
            imgd = ctx.getImageData(0, 0, can.width, can.height);
        case "ImageData":
            imgd = imgd || img;
            width = imgd.width;
            if (typeOf(imgd.data) == "CanvasPixelArray")
                buf8 = new Uint8Array(imgd.data);
            else
                buf8 = imgd.data;
        case "Array":
        case "CanvasPixelArray":
            buf8 = buf8 || new Uint8Array(img);
        case "Uint8Array":
        case "Uint8ClampedArray":
            buf8 = buf8 || img;
            buf32 = new Uint32Array(buf8.buffer);
        case "Uint32Array":
            buf32 = buf32 || img;
            buf8 = buf8 || new Uint8Array(buf32.buffer);
            width = width || buf32.length;
            height = buf32.length / width;
    }

    return {
        can: can, ctx: ctx, imgd: imgd, buf8: buf8,
        buf32: buf32, width: width, height: height
    };
}


export function encodeSVGToURI(string) {

    let namespaceddata = string;
    if ( string.trim().indexOf( "http://www.w3.org/2000/svg" ) < 0 ) {
        namespaceddata = namespaceddata.replace( /<svg/g, "<svg xmlns='http://www.w3.org/2000/svg'" );
    }

    // Use single quotes instead of double to avoid encoding.
    if ( namespaceddata.indexOf( '"' ) >= 0 ) {
        namespaceddata = namespaceddata.replace( /"/g, "'" );
    }
    
    namespaceddata = namespaceddata.replace( />\s{1,}</g, "><" );
    namespaceddata = namespaceddata.replace( /\s{2,}/g, " " );

    //var symbols = /[\r\n"%#()<>?\[\\\]^`{|}]/g;
    let escaped = encodeURIComponent(namespaceddata);
    //let escaped = namespaceddata.replace( symbols, escape );
    escaped = 'data:image/svg+xml;utf8,' + escaped;

    return escaped;
}