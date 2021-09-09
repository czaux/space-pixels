var fabric = require("fabric");
var $ = require("jquery");

export function zoomstuff(canvas:any) {

  var canvasWidth:number    = canvas.getWidth();
  var canvasHeight:number   = canvas.getHeight();
  var SCALE_FACTOR:number   = 1.3;
  var zoomMax:number        = 7;

  var getFabricCanvases = (function () {
      var fabricCanvasCollection;
      return function getCanvases() {
          if (!fabricCanvasCollection) {
              fabricCanvasCollection = [];
              var fabricCanvas = $('.canvas-container canvas');
              fabricCanvas.each(function(index, item) {
                  fabricCanvasCollection.push($(item));
              });
          }
          return fabricCanvasCollection;
      }
  })();

  canvas.on('mouse:wheel', function(event){
    event.e.preventDefault();
    var target = canvas.findTarget(event);
    if (event.e.wheelDelta > 0 || event.e.detail < 0) {

        // scroll up
        zoomByMouseCoords(event, "in");
    }
    else {
        // scroll down
        zoomByMouseCoords(event, "out");
    }
  });

  //Zoom By Mouse Coordinates
  function zoomByMouseCoords(event, direction:string) {
/*
    var evt = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window
    });
*/
    console.log(event);

      if( !direction || !event.e ) return;

      var pointer = canvas.getPointer(event.e);
      console.log("zoomByMouseCoords: direction: " +direction +", p.x: " +pointer.x +", p.y:" + pointer.y +", canvas.width: " +canvas.getWidth());

      if( direction.toLowerCase() == "in" ){
          if(canvas.getZoom().toFixed(5) > zoomMax){
              console.log("zoomByMouseCoords: Error: cannot zoom-in anymore");
              return;
          }
                  
          zoomIn(zoomMax);
      }
      if( direction.toLowerCase() == "out" ){
          if( canvas.getZoom().toFixed(5) <=1 ){
              console.log("zoomByMouseCoords: Error: cannot zoom-out anymore");
              return;
          }
          zoomOut(zoomMax);
      }
      zoomToPosition( zoomInCalcXpos(pointer.x), zoomInCalcYpos(pointer.y));
  }

  // Zoom In
  function zoomIn(zoomMax:number) {
      if(canvas.getZoom().toFixed(5) > zoomMax){
          console.log("zoomIn: Error: cannot zoom-in anymore");
          return;
      }

      canvas.setZoom(canvas.getZoom() * SCALE_FACTOR);
      canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
      canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);
      canvas.renderAll();
  }

  // Zoom Out
  function zoomOut(zoomMax:number) {
      if( canvas.getZoom().toFixed(5) <=1 ){
          console.log("zoomOut: Error: cannot zoom-out anymore");
          return;
      }

      canvas.setZoom(canvas.getZoom() / SCALE_FACTOR);
      canvas.setHeight(canvas.getHeight() / SCALE_FACTOR);
      canvas.setWidth(canvas.getWidth() / SCALE_FACTOR);
      canvas.renderAll();
  }

  function zoomToPosition(x:number, y:number) {
      zoomMoveToPosition('top', y);
      zoomMoveToPosition('left', x);
  }

  function zoomMoveToPosition(position, numericValue) {
      getFabricCanvases().forEach(function(elementValue) {
          elementValue.css(position, numericValue);
      });
  }

  function zoomInCalcXpos(xPos:number) {
      xPos *= canvas.getZoom();
      return zoomCalcXpos((canvasWidth/2) - xPos);
  }

  function zoomCalcXpos(xPos:number) {
      if (xPos>0){
          return 0;
      }
      if (xPos+canvas.getWidth() < canvasWidth){
          return canvasWidth - canvas.getWidth();
      }
      return xPos;
  }

  function zoomInCalcYpos(yPos:number) {
      yPos *= canvas.getZoom();
      return zoomCalcYpos( (canvasHeight/2) - yPos );
  }

  function zoomCalcYpos(yPos:number) {
      if (yPos>0){
          return 0;
      }
      if (yPos+canvas.getHeight() < canvasHeight) {
          return canvasHeight - canvas.getHeight();
      }
      return yPos;
  }

}