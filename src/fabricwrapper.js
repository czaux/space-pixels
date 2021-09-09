//import { fabric } from './fabric.js';
let fabric = require('./fabric.js').fabric;

let sanitizeFileName = require("sanitize-filename");

//add our custom classes to differentiate layers
fabric.CanvasImage = fabric.util.createClass(fabric.Image, {
    type: 'canvasimage',
    initialize: function(image, options) {
        options || (options = { });
        this.callSuper('initialize', image, options);
        this.set('filename', sanitizeFileName(options.filename) || undefined);
    },
    _render: function(ctx) {
        this.callSuper('_render', ctx);
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            name: this.name,
            filename : this.get('filename')
        });
    }
});

fabric.DitherImage = fabric.util.createClass(fabric.Image, {
    type: 'ditherimage',
    initialize: function(image, options) {
        options || (options = { });
        this.callSuper('initialize', image, options);
    },
    _render: function(ctx) {
        this.callSuper('_render', ctx);
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {});
    }
});

fabric.lcdgroup = fabric.util.createClass(fabric.Group, {
  type: 'lcdgroup',
  initialize : function(objects, options) {
      options || ( options = { });
      this.callSuper('initialize', objects, options);
  },
  toObject : function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {});
  },
  _render : function(ctx) {
      this.callSuper('_render', ctx);
  }
});

fabric.lcdbackground = fabric.util.createClass(fabric.Group, {
  type: 'lcdbackground',
  initialize : function(objects, options) {
      options || ( options = { });
      this.callSuper('initialize', objects, options);
  },
  toObject : function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {});
  },
  _render : function(ctx) {
      this.callSuper('_render', ctx);
  }
});

fabric.lcdoverlay = fabric.util.createClass(fabric.Polygon, {
  type: 'lcdoverlay',
  initialize : function(objects, options) {
      options || ( options = { });
      this.callSuper('initialize', objects, options);
  },
  toObject : function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {});
  },
  _render : function(ctx) {
      this.callSuper('_render', ctx);
  }
});


  module.exports = fabric;



//exports.fabric = fabric;