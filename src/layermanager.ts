import * as lodash from 'lodash'

export function layersmanager(canvas:any, vm:any, vueoutputmenuvm:any) {

/*
let updateImageView = lodash.debounce((function(e) {
    console.log('ran');
    var activeObject = e.target;
    let type = activeObject.get('type');
    if(type) {
        if(type === 'canvasimage') {
            let arreturn = vm.layers.filter(function(item) {
                //compare reference in memory rather than properties
                if(item.object == activeObject) {
                    return true;
                }
            });
            console.log(arreturn);
            vm.layers[vm.layers.indexOf(arreturn[0])].url = activeObject.getSrc();
        }
    }

}), 300);
*/


/*
    canvas.on('mouse:down', function(evt) {
        //console.log(evt);
        
        var _canvas = canvas;
        canvas.calcOffset();
        var _mouse = _canvas.getPointer(evt.e);
        var _active = _canvas.getActiveObject();
        var _targets: Array<any> = _canvas.getObjects().filter(function (_obj) {
            return _obj.get('type') == 'image' && _obj.containsPoint(_mouse) && !_canvas.isTargetTransparent(_obj, _mouse.x, _mouse.y);
        });
        console.log(_targets);
        for(let index in _targets) {
            let object = _targets[index];
            if(_active != null) {
                if(_active.get('type') !== 'image') {
                    canvas.deactivateAll();
                }
            }
            if(object.get('type') === 'image') {
                console.log(object);
                _canvas.setActiveObject(object).renderAll();
                for(let index2 in _targets) {
                    if(_targets[index2].get('type') !== 'lcdgroup') {
                    // canvas.bringToFront(_targets[index2]);
                    }
                }
                
                return;
            }
        }
    
        return false;
    });
*/
    //When image is added to canvas, add it to our vue instance
    canvas.on('mouse:down', function(e) {
        if(vueoutputmenuvm.activePreview) {
            vueoutputmenuvm.removeActive();
        }

    });

    //When image is added to canvas, add it to our vue instance
    canvas.on('object:added', function(e) {

        var activeObject = e.target;
        let type = activeObject.get('type');
        if(type) {
            if(type === 'canvasimage') {
                vm.add({url: activeObject.getSrc(), filename: activeObject.get('filename'), object: activeObject, highlight: false, visible:true})
                //vm.layers.unshift({url: activeObject.getSrc(), filename: activeObject.get('filename'), object: activeObject, highlight: false, visible:true});
            }
        }

    });

    //When image is removed from canvas, remove it from vue instance
    //DO NOT remove from the vue data itself, or else indexes will be wrong
    canvas.on('object:removed', function(e) {
        var activeObject = e.target;
        let type = activeObject.get('type');
        if(type) {
            if(type === 'canvasimage') {
                let arreturn = vm.layers.filter(function(item) {
                    //compare reference in memory rather than properties
                    if(item.object == activeObject) {
                        return true;
                    }
                });
                vm.remove(arreturn[0]);
            }
        }
    });

    //When we select an object on the canvas, send that selection to our vue instance for highlight
    canvas.on('object:selected', function(e) {
        var activeObject = e.target;
        let type = activeObject.get('type');
        if(type) {
            if(type === 'canvasimage') {
                //Find our object in the vue layers
                let arreturn = vm.layers.filter(function(item) {
                    //compare reference in memory rather than properties
                    if(item.object == activeObject) {
                        return true;
                    } else {
                        //This will change the object in our vue layers because objects are by reference
                        item.highlight = false;
                    }
                });
                vm.layers[vm.layers.indexOf(arreturn[0])].highlight = true;
            }
        }
    });

    //Clear highlight in vue instance
    canvas.on('before:selection:cleared', function(e) {
        var activeObject = e.target;
        let type = activeObject.get('type');
        if(type) {
            if(type === 'canvasimage') {
                let arreturn = vm.layers.filter(function(item) {
                    //compare reference in memory rather than properties
                    if(item.object == activeObject) {
                        return true;
                    }
                });
                vm.layers[vm.layers.indexOf(arreturn[0])].highlight = false;
            }
        }
    });


  //copy the original function to store
  let originalMouseDownEvent = lodash.cloneDeep(canvas.__onMouseDown);
  //console.log(JSON.stringify(canvas.__onMouseDown));

  //canvas.__onMouseDown = lodash.cloneDeep(originalMouseDownEvent);

  //override onmousedown, probably will break someday
  let modifiedMouseDownEvent = function (e) {

      //var target = this.findTarget(e);
      var target = canvas.getActiveObject();
      // if right click just fire events
      var isRightClick  = 'which' in e ? e.which === 3 : e.button === 2;
      if (isRightClick) {
        if (this.fireRightClick) {
            this._handleEvent(e, 'down', target ? target : null);
        }
        return;
      }

      if (this.isDrawingMode) {
      this._onMouseDownInDrawingMode(e);
      return;
      }

      // ignore if some object is being transformed at this moment
      if (this._currentTransform) {
      return;
      }

      // save pointer for check in __onMouseUp event
      var pointer = this.getPointer(e, true);
      this._previousPointer = pointer;

      var shouldRender = this._shouldRender(target, pointer),
          shouldGroup = this._shouldGroup(e, target);

      if (this._shouldClearSelection(e, target)) {
          this._clearSelection(e, target, pointer);
      }
      else if (shouldGroup) {
          this._handleGrouping(e, target);
          target = this.getActiveGroup();
      }

      if (target) {
          if (target.selectable && (target.__corner || !shouldGroup)) {
              this._beforeTransform(e, target);
              this._setupCurrentTransform(e, target);
          }

          if (target !== this.getActiveGroup() && target !== this.getActiveObject()) {
              this.deactivateAll();
              target.selectable && this.setActiveObject(target, e);
          }
      }
      this._handleEvent(e, 'down', target ? target : null);
      // we must renderAll so that we update the visuals
      shouldRender && this.renderAll();
  }


  let findTarget = function(e, skipGroup) {
      if (canvas.skipTargetFind) {
          return;
      }

      var ignoreZoom = true,
          pointer = canvas.getPointer(e, ignoreZoom),
          activeGroup = canvas.getActiveGroup(),
          activeObject = canvas.getActiveObject(),
          activeTarget;
      // first check current group (if one exists)
      // active group does not check sub targets like normal groups.
      // if active group just exits.
      if (activeGroup && !skipGroup && canvas._checkTarget(pointer, activeGroup)) {
          canvas._fireOverOutEvents(activeGroup, e);
          return activeGroup;
      }
      // if we hit the corner of an activeObject, let's return that.
      if (activeObject && activeObject._findTargetCorner(pointer)) {
          canvas._fireOverOutEvents(activeObject, e);
          return activeObject;
      }
      if (activeObject && canvas._checkTarget(pointer, activeObject)) {
          if (!canvas.preserveObjectStacking) {
              canvas._fireOverOutEvents(activeObject, e);
              return activeObject;
          }
          else {
              activeTarget = activeObject;
          }
      }

      canvas.targets = [];
      var target = canvas._searchPossibleTargets(canvas._objects, pointer);
      if (e[canvas.altSelectionKey] && target && activeTarget && target !== activeTarget) {
      target = activeTarget;
      }
      canvas._fireOverOutEvents(target, e);
      return target;
  };


}