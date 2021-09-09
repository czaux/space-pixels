import * as LCDConfig from "./lcd-config"
import { fabric } from "fabric";

let FromLcdObject: LcdParenteInterface = LCDConfig.LCDConfigObject.lcdsizes;
var language = 'en';

interface LangInterface {
  en: string;
}

interface LcdParenteInterface {
  lcdsizes?: LcdInterface
}

interface LcdInterface {
  [key: string]: AuthorLCD;
}
interface AuthorLCD {
  title: LangInterface;
  name: string;
  mods: ModLCD;
}
interface ModLCD {
  [key: string]: ModLCDList;
}
interface ModLCDList {
  modname: LangInterface;
  submenu: boolean;
  blocks: Array<BlockLCD>;
}
interface BlockLCD {
  blockname: LangInterface;
  size: Array<number>;
  image: string;
  layout: Array<Array<number>>;
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function unescapeHtml(escapedStr) {
    var div = document.createElement('div');
    div.innerHTML = escapedStr;
    var child = div.childNodes[0];
    return child ? child.nodeValue : '';
}

class LcdConfigClass {

    public static LcdObject: LcdParenteInterface = null;

    constructor() {
        LcdConfigClass.LcdObject = FromLcdObject;
    }

    public getLcdObject() {
      return LcdConfigClass.LcdObject;
    }



    public getLCDItem(canvas:any, lcditem:string) {

      //We pull names of blocks and such from a mods XML files.
      //So we escape the html chars when put into the DOM and unescape here.
      //Just in case.
      //http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
      let lcditemUE:string = unescapeHtml(lcditem);

      let items: Array<string> = lcditemUE.split('-');
      if(items[0] === 'lcditem')
      {
        let author = items[1];
        let modname = items[2];
        let blockname = items[3];



        
      } else {
        throw "Wrong usage of getLCDItem";
      }
      

      

      let LcdObject = LcdConfigClass.LcdObject;



        //Iterate over authors
        for(let authorkey in LcdConfigClass.LcdObject)
        {
          //Iterate over mods
          for(let modkey in LcdObject[authorkey].mods)
          {
            //Iterate over blocks
            for(let blockkey in LcdObject[authorkey].mods[modkey].blocks)
            {
            }
          }
        }

/*
        var path = fabric.loadSVGFromString(pingers, function(objects, options) {
          var obj = fabric.util.groupSVGElements(objects, options);
                obj.set({
                    left: 200,
                    top: 250,
                    snapAngle:90,
                    snapThreshold:45,
                    strokeWidth: 0
                });
              
                obj.scaleToWidth(356);
                canvas.add(obj);
        });
        */

    }

    public buildHTMLList() {
        let LcdObject = LcdConfigClass.LcdObject;
        let html = `<div class="lcd-menu-contain">`;
        //Iterate over authors
        for(let authorkey in LcdConfigClass.LcdObject)
        {
          let list = ``;

          list += `
          <label for="lcd-menu-${authorkey}">${LcdObject[authorkey].title[language]}</label>
          <input type="checkbox" class="lcd-menu-toggle" id="lcd-menu-${authorkey}"/>
          <ul class="lcd-menu">
          `;

          //Iterate over mods
          for(let modkey in LcdObject[authorkey].mods)
          {
            let makesubmenu = LcdObject[authorkey].mods[modkey].submenu;
            //If a mod has a lot of blocks, make a submenu
            if(makesubmenu)
            {
              list += `
              <label for="lcd-menu-${modkey}">${LcdObject[authorkey].mods[modkey].modname[language]}</label>
              <input type="checkbox" class="lcd-menu-toggle" id="lcd-menu-${modkey}"/>
              <ul class="lcd-menu">
              `;
            }

            //Iterate over blocks
            for(let blockkey in LcdObject[authorkey].mods[modkey].blocks)
            {
              let block = LcdObject[authorkey].mods[modkey].blocks[blockkey];
              let blockname = block.blockname[language];
              list += `<li><a href="#">${block.image}<p>${blockname}</p></a></li>`;
            }

            if(makesubmenu)
            {
              list += `</ul>`;
            }
            html += list;
          }
          html += `</ul>`;
        }
        html += `</div>`
        return html;
    }
}


export let LcdConfig = new LcdConfigClass();