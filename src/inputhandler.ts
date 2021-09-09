

enum ArrowDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export function setup(canvas) {

  function handleArrowMoveObjectInput(Direction:ArrowDirection) {

      let activeObject = canvas.getActiveObject();
      if(activeObject) {
          let amount = 1;
          if(Direction === ArrowDirection.UP)
              activeObject.top = Math.round(activeObject.top - amount);
          else if (Direction === ArrowDirection.DOWN)
              activeObject.top = Math.round(activeObject.top + amount);
          else if (Direction === ArrowDirection.LEFT)
              activeObject.left = Math.round(activeObject.left - amount);
          else if (Direction === ArrowDirection.RIGHT)
              activeObject.left = Math.round(activeObject.left + amount);
          canvas.renderAll();
          activeObject.setCoords();
      }
  }

  function handleRemoveObjectInput() {

  }


  function onKeyDownHandler(e) {
    switch (e.keyCode) {
        case 46:
            if(canvas.getActiveObject()) canvas.remove(canvas.getActiveObject());
            break;
        case 37:
            //left arrow
            handleArrowMoveObjectInput(ArrowDirection.LEFT);
            break;
        case 38:
            //up arrow
            handleArrowMoveObjectInput(ArrowDirection.UP);
            break;
        case 39:
            //right arrow
            handleArrowMoveObjectInput(ArrowDirection.RIGHT);
            break;
        case 40:
            //down arrow
            handleArrowMoveObjectInput(ArrowDirection.DOWN);
            break;
    }
    e.preventDefault(); 
  }

  window.onkeydown = onKeyDownHandler;



}