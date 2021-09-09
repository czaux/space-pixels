import { fabric } from "./fabricjs/fabric";

export function objectstuff(canvas:any) {

  fabric.CustomImageObject = fabric.util.createClass(fabric.Image, {
    type: 'customimageobject',
    initialize: function(options) {
      options || (options = { });

      this.callSuper('initialize', options);
    },
    _render: function(ctx) {
      this.callSuper('_render', ctx);
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), { name: this.name });
    }
  });

  fabric.SettingsObject = fabric.util.createClass(fabric.Image, {
    type: 'settingsobject',
    initialize: function(options) {
      options || (options = { });

      this.callSuper('initialize', options);
    },
    _render: function(ctx) {
      this.callSuper('_render', ctx);
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), { name: this.name });
    }
  });

  fabric.LCDBlock = fabric.util.createClass(fabric.Rect, {
    type: 'lcdblock',
    initialize: function(options) {
      options || (options = { });

      this.callSuper('initialize', options);
    },
    _render: function(ctx) {
      this.callSuper('_render', ctx);
    }
  });

  fabric.Gridblock = fabric.util.createClass(fabric.Rect, {
    type: 'gridblock',
    initialize: function(options) {
      options || (options = { });

      this.callSuper('initialize', options);
    },
    _render: function(ctx) {
      this.callSuper('_render', ctx);
    }
  });


  fabric.lcdgroup = fabric.util.createClass(fabric.Group, {
    type : 'lcdgroup',

    initialize : function(objects, options) {
        options || ( options = { });

        this.callSuper('initialize', objects, options);
        this.set('customAttribute', options.customAttribute || 'undefinedCustomAttribute');
    },

    toObject : function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            customAttribute : this.get('customAttribute')
        });
    },

    _render : function(ctx) {
        this.callSuper('_render', ctx);
    }
});

/*
  fabric.util.addListener(canvas.upperCanvasEl, "mousedown", function (e) {
    
    var _canvas = canvas;
    //current mouse position
    var _mouse = _canvas.getPointer(e);
    //active object (that has been selected on click)

    var _active = _canvas.getActiveObject();
    //possible dblclick targets (objects that share mousepointer)
    var _targets: Array<any> = _canvas.getObjects().filter(function (_obj) {
        return _obj.containsPoint(_mouse) && !_canvas.isTargetTransparent(_obj, _mouse.x, _mouse.y);
    });

    var isImage:boolean = false;
    var isLCD:boolean = false;
    _targets.forEach(function(object) {
      let type:string = object.get('type');
      if(type == 'customimageobject')
      {
        isImage = true; 
      } else if (type == 'lcdblock')
      {
        isLCD = true;
      }

    });

    _targets.forEach(function(object) {
      //If an image is selected from the stack, get the image first, unless user selects an option




    });



    _canvas.deactivateAll();
    
    //new top layer target
    if (_prevActive !== _active) {
        //try to go one layer below currents target
        _layer = Math.max(_targets.length-2, 0);
    }
    //top layer target is same as before
    else {
        //try to go one more layer down
        _layer = --_layer < 0 ? Math.max(_targets.length-2, 0) : _layer;
    }

    //get obj on current layer
    var _obj = _targets[_layer];

    if (_obj) {
    	_prevActive = _obj;
    	//_obj.bringToFront();
    	_canvas.setActiveObject(_obj).renderAll();
    }
});
*/




  var lcdpanel = new fabric.LCDBlock({
      width: 178,
      height: 178,
      originX: 'left',
      originY: 'top',
      selectable: false,
      stroke: '#444',
      strokeWidth: 1,
      hasControls: true,
      fill: 'rgb(255,255,255)',
      opacity: 1.0
  });

  var settingsimage = new fabric.Image.fromURL("/bin/Gear_icon.svg", function(img) {
    img.set({
        left:10,
        top:10,
        width:15,
        height:15
    })
  });

  var comicSansText = new fabric.Textbox("Square LCD\n(Vanilla)", {
    fontFamily: "monospace",
      width: 175,
      height: 178,
      top: 0,
      left: 0,
      fontSize: 25,
      textAlign: 'center'
  });

  var sizeText = new fabric.Textbox("178x178", {
    fontFamily: "monospace",
      width: 175,
      height: 178,
      top: 130,
      left: 0,
      fontSize: 25,
      textAlign: 'center'
  });

  var LCDGroup:any = new fabric.lcdgroup([lcdpanel, comicSansText, sizeText], {
      mycustomposstateleft: 0,
      mycustomposstatetop: 0,
      left:50,
      top:50,
      angle: 0,
      snapAngle: 90,
      snapThreshold: 45,
  });
  
  canvas.add(LCDGroup);



  var lcdpanel = new fabric.LCDBlock({
      width: 355,
      height: 177,
      originX: 'left',
      originY: 'top',
      selectable: false,
      stroke: '#444',
      strokeWidth: 1,
      hasControls: true,
      fill: 'rgb(255,255,255)',
      opacity: 1.0
  });
  var comicSansText = new fabric.Textbox("Widescreen LCD\n(Vanilla)", {
    fontFamily: "monospace",
      width: 351,
      height: 178,
      top: 0,
      left: 0,
      fontSize: 25,
      textAlign: 'center'
  });
  var sizeText = new fabric.Textbox("356x178", {
    fontFamily: "monospace",
      width: 351,
      height: 178,
      top: 130,
      left: 0,
      fontSize: 25,
      textAlign: 'center'
  });
  var LCDGroup2:any = new fabric.lcdgroup([lcdpanel, comicSansText, sizeText], {
      mycustomposstateleft: 0,
      mycustomposstatetop: 0,
      left:50,
      top:50,
      angle: 0,
      hasControls: false,
      snapAngle: 90,
      snapThreshold: 45,
  });



  canvas.add(LCDGroup2);















document.body.getElementsByClassName('imagemenu-upload')[0].addEventListener("change", function (e: any) {
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function (f: any) {
    var data = f.target.result;         
    var imger = new Image();
        imger.src = data;
        var width = imger.width;
        var height = imger.height;

    var oImg = new fabric.Image(imger, {
        perPixelTargetFind: true,
        targetFindTolerance: 4,
        left: 0, 
        top: 0,
        angle: 0,
        snapAngle: 45,
        snapThreshold: 4,
        borderColor: 'blue',
        cornerColor: 'blue',
        cornerSize: 10,
        transparentCorners: true
    });

    canvas.add(oImg).renderAll();
      //var a = canvas.setActiveObject(oImg);
      //var dataURL = canvas.toDataURL({format: 'png', quality: 0.8});
  };
  reader.readAsDataURL(file);
});



}