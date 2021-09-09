export var LCDConfigObject = 
  {
  "lcdsizes": {
    "vanilla": {
      "title": {
        "en": "Vanilla Blocks"
      },
      "mods": {
        "vanilla": {
          "modname": {
            "en": "Vanilla Blocks"
          },
          "submenu": false,
          "blocks": [
            {
              "blockname": {
                "en": "Square LCD"
              },
              "size": [178,178],
              "image": require("raw-loader!./sprites/vanilla/LCD-Square.svg"),
              "sizeratio": [1.0,1.0],
              "layout": [
                [0,0]
              ]
            },
            {
              "blockname": {
                "en": "Corner LCD"
              },
              "size": [178,30],
              "image": require("raw-loader!./sprites/vanilla/LCD-Corner.svg"),
              "sizeratio": [1.0,1.0],
              "layout": [
                [0,0]
              ]
            },
            {
              "blockname": {
                "en": "Widescreen LCD"
              },
              "size": [356,178],
              "image": require("raw-loader!./sprites/vanilla/LCD-Wide.svg"),
              "sizeratio": [1.0,1.0],
              "layout": [
                [0,0]
              ]
            }
          ]
        }
      }
    },
    "digi": {
      "title": {
        "en": "Digis Mods"
      },
      "mods": {
        "403922024": {
          "modname": {
            "en": "Computer Monitor - LCD Screen"
          },
          "modimage": "",
          "submenu": false,
          "blocks": [
            {
              "blockname": {
                "en": "Computer Monitor"
              },
              "sizetype": "Large",
              "size": [178,178],
              "image": require("raw-loader!./sprites/vanilla/LCD-Square.svg"),
              "sizeratio": [1.0,1.0],
              "layout": [
                [0,0]
              ]
            }
          ]
        }
      }
    },
    "eikster": {
      "title": {
        "en": "Eiksters Mods"
      },

      "mods": {
        "402727385": {
          "modname": {
            "en": "Computer Monitor - LCD Screen"
          },
          "guidisplayname": {
            "en": "+ Eikesters Decoration Mod"
          },
          "submenu": false,
          "blocks": [
            {
              "blockname": {
                "en": "Widescreen TV"
              },
              "size": [178,178],
              "image": require("raw-loader!./sprites/eikester/TV1.svg"),
              "sizeratio": [0.65,0.65],
              "layout": [
                [0,0]
              ]
            }
          ]
        }
      }
    },
    "sektan": {
      "title": {
        "en": "Sektans Mods"
      },
      "mods": {
        "396080275": {
          "modname": {
            "en": "Computer Monitor - LCD Screen"
          },
          "submenu": true,
          "blocks": [
            {
              "blockname": {
                "en": "S Sign Big"
              },
              "size": [178,178],
              "image": require("raw-loader!./sprites/vanilla/LCD-Square.svg"),
              "sizeratio": [0.63,0.63],
              "layout": [
                [0,0]
              ]
            }
          ]
        }
      }
    }
  }
}