import { fabric } from "./fabric";

export function setupDrop(canvas:any, vm:any) {
    var canvas_container = document.body;
    canvas_container.addEventListener('drop', function (e:any) {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        }
        var dt = e.dataTransfer;
        var files = dt.files;
        for (var i=0; i<files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function (e:any) {
                var img = new Image();

                img.onload = function() {
                    var imgInstance = new fabric.CanvasImage(img, {
                        filename: file.name,
                        left: 100,
                        top: 100,
                    });
                    canvas.add(imgInstance);
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
        
        return false;
    });
    
    canvas_container.addEventListener('dragover', cancel);
    canvas_container.addEventListener('dragenter', cancel);

    function cancel(e) {
        if (e.preventDefault) { e.preventDefault(); }
        return false;
    }
};