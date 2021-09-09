"use strict";

interface ArrayConstructor {
    from(arrayLike: any, mapFn?, thisArg?): Array<any>;
}

export function setupMenu() {

  var selected = null, // Object of the element to be moved
      x_pos = 0, y_pos = 0, // Stores x & y coordinates of the mouse pointer
      x_elem = 0, y_elem = 0; // Stores top, left values (edge) of the element

  // Will be called when user starts dragging an element
  function _drag_init(elem) {
      // Store the object of the element which needs to be moved
      selected = elem.parentElement;
      x_elem = x_pos - selected.offsetLeft;
      y_elem = y_pos - selected.offsetTop;
  }

  interface Event {
    clientX: number,
    clientY: number
  }

  // Will be called when user dragging an element
  function _move_elem(e:MouseEvent):void {
      x_pos = e.pageX;
      y_pos = e.pageY;
      if (selected !== null) {
          selected.style.left = (x_pos - x_elem) + 'px';
          selected.style.top = (y_pos - y_elem) + 'px';
      }
  }

  // Destroy the object when we are done
  function _destroy() {
      selected = null;
  }

  // Bind the functions...
    let movers:any = document.getElementsByClassName('layers-menu-topmove');
    for(var e of movers)
    {
      e.onmousedown = function () {
        _drag_init(this);
        return false;
      };
    }

  document.onmousemove = _move_elem;
  document.onmouseup = _destroy;

}