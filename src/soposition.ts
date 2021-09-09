//get position and other properties of subobject in svg
//data is accessed by reference because fabricjs updates objects internally
export class SubObjectPosition {

    public lcdobject;
    public screenbounds;

    constructor(lcdobject, boundsid) {
        this.lcdobject = lcdobject;

        let paths = lcdobject.getObjects()[0].paths;
        var matcher = new RegExp(boundsid, "i");
        for(let object of paths) {
            if(matcher.test(object.id)) {
                this.screenbounds = object;
            }
        }

    }

    public left(zoom) {
        if (zoom) return (this.screenbounds.left + this.lcdobject.left) * this.lcdobject.zoomX;
        else return this.screenbounds.left + this.lcdobject.left;
    }

    public top(zoom) {
        if (zoom) return (this.screenbounds.top + this.lcdobject.top) * this.lcdobject.zoomY;
        else return this.screenbounds.top + this.lcdobject.top;
    }

    public width(scale) {
        if (scale) return this.screenbounds.width * this.lcdobject.zoomX;
        else return this.screenbounds.width;
    }

    public height(scale) {
        if (scale) return this.screenbounds.height * this.lcdobject.zoomY;
        else return this.screenbounds.height;
    }

    public tl(zoom) {
        if(zoom) {
            let x =  (this.lcdobject.left + this.screenbounds.left) * this.screenbounds.group.scaleX;
            let y = (this.lcdobject.top + this.screenbounds.top) * this.screenbounds.group.scaleY;
            return {x: x, y: y}
        } else {
            let x =  this.lcdobject.left + this.screenbounds.left;
            let y = this.lcdobject.top + this.screenbounds.top;
            return {x: x, y: y}
        }
    }

    public tr(zoom) {
        if(zoom) {
            let tl = this.tl(true);
            let x = tl.x + (this.screenbounds.width * this.screenbounds.group.scaleX);
            let y = tl.y;
            return {x: x, y: y}
        } else {
            let tl = this.tl(false);
            let x = tl.x + this.screenbounds.width;
            let y = tl.y;
            return {x: x, y: y}
        }
    }

    public bl(zoom) {
        if(zoom) {
            let tl = this.tl(true);
            let x = tl.x;
            let y = tl.y + (this.screenbounds.height * this.screenbounds.group.scaleY);
            return {x: x, y: y}
        } else {
            let tl = this.tl(false);
            let x = tl.x;
            let y = tl.y + this.screenbounds.height;
            return {x: x, y: y}
        }

    }

    public br(zoom) {
        if(zoom) {
            let tl = this.tl(true);
            let bl = this.bl(true);
            let x = tl.x;
            let y = bl.y;
            return {x: x, y: y}
        } else {
            let tl = this.tl(false);
            let bl = this.bl(false);
            let x = tl.x;
            let y = bl.y;
            return {x: x, y: y}
        }
    }
    
}