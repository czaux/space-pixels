import { fabric } from "./fabricjs/fabric";

export function gridstuff2(canvas:any, grid: number, threshold:number) {

  const maxsize = 1300;

  var widthx:number = 0;
  var heightx:number = 0;
  grid = 177;
  for (var i = 0; i < 5; i++) {

      for (var x = 0; x < 7; x++) {
          canvas.add(new fabric.Rect({
              left: widthx,
              top: heightx,
              width: grid,
              height: grid,
              originX: 'left', 
              originY: 'top',
              lockMovementX: true,
              lockMovementY: true,
              selectable: false,
              hoverCursor: "pointer",
              stroke: '#333',
              strokeWidth: 1,
              hasControls: false,
              fill: 'rgb(240,240,240)',
              opacity: 0.5
          }));
          
        widthx += grid + 1;
      }
      widthx = 0;
      heightx += grid + 1;
  }

  var _prevActive = 0;
  var _layer = 0;


  canvas.on('object:moving', function(options) {

    grid = 178;
    threshold = 50;
    var pointer = canvas.getPointer(options.e);
    //console.log(JSON.parse(JSON.stringify(options.target)));

    let leftvar:number = Math.round(options.target.left / grid) * grid;
    let topvar:number = Math.round(options.target.top / grid) * grid;

    let intersect = 0;
    let intersect1 = 0;

    canvas.forEachObject(function(obj) {
        options.target.setCoords();
        if (obj === options.target) return;
        if(options.target !== obj)
        {
          if(obj.get('type') === 'lcdgroup')
          {
            //Again, width and position seem to not coorelate, but this works.
            //pls
            let lcdpanel = new fabric.Rect({
                width: (options.target.getWidth() - 5),
                height: (options.target.getHeight() - 5),
                left:leftvar+1.5,
                top:topvar+1.5,
                angle: options.target.getAngle(),
                originX: 'left',
                originY: 'top',
                fill:"rgb(0,0,0)",
                selectable: true,
                hasControls: true,
                opacity: 1.0
            });

            lcdpanel.setCoords();
            canvas.bringToFront(lcdpanel);
            canvas.renderAll();
            if (lcdpanel.intersectsWithObject(obj)) intersect1++;
            canvas.remove(lcdpanel);
            if (options.target.intersectsWithObject(obj)) intersect++;
          }
        }
    });

    if(intersect1 > 0) {
      options.target.set({
        left: options.target.get('mycustomposstateleft'),
        top: options.target.get('mycustomposstatetop')
      });

      return;
    } else {
      options.target.set({
        left: leftvar,
        top: topvar,
        mycustomposstateleft: leftvar,
        mycustomposstatetop: topvar
      });

    }

  });

/*
canvas.on('after:render', function() {
    canvas.contextContainer.strokeStyle = '#555';

    canvas.forEachObject(function(obj) {
      var bound = obj.getBoundingRect();

      
      canvas.contextContainer.strokeStyle = "#FF0000";
      canvas.contextContainer.strokeRect(
        bound.left,
        bound.top,
        bound.width,
        bound.height
      );
    })
  });

*/
}