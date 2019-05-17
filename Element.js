/* Code By David Clews
   http://davidclews.com
*/

require('array-functions-min');
require('dom_token_list-functions-contains_all');

window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;


/*
 * setBackgroundCanvas
 * 
 * Creates a 100% canvas behind all the other elements within a block level element
 * 
 * @param {Image} object
 * 
 * @returns {context}
 */
Element.prototype.setBackgroundCanvas = function(object){
    let 
    self = this,
    x = {
        l: 0, /* left*/
        c: 0, /* center */
        r: 0, /* right */
        }, 
    y = {
        t: 0, /* top */
        c: 0, /* center */
        b: 0, /* bottom */
    }
    
    /* hold the object sent into the function */
    self.backgroundCanvasObject = object;
    
    

    /* position grid */
    
    /*********
     * 1 2 3
     * 4 5 6
     * 7 8 9
     * 
     */
    
    
    let     elementWidth, 
            elementHeight;
    
    /* allow the canvas to be accessed externally */
    self.canvas = {
        element: document.createElement("canvas")
    };
    
    self.canvas.context = self.canvas.element.getContext("2d", {alpha: true});
    
    /* 
     * calculateZIndex
     * 
     * Loops through all elements nested and retrieves the z-index, then return 1 less than the minimum
     * 
     * @return {integer} The z-index value to use 1 below minimum 
     */
    let calculateZIndex = function(){
        let nestedElements = self.querySelectorAll("*:not(.backgroundCanvas)"),
                zIndexes = [];
        
       
        Array.from(nestedElements).forEach(function(nestedElement) {
            /* only return real numbers */
            if(isNaN(nestedElement.style.zIndex) === false){
                zIndexes.push(nestedElement.style.zIndex);
            }
        });
        
        return parseInt(Array.min(zIndexes))-1;
        
    }
    
    let calculatePositions = function(){
        let canvas = self.canvas.element;
        
        x.l = 0;
        x.c = Math.floor(canvas.width/2 - self.backgroundCanvasObject.width/2);
        x.r = Math.floor(canvas.width - self.backgroundCanvasObject.width);
        
        y.t = 0;
        y.c = Math.floor(canvas.height/2 - self.backgroundCanvasObject.height/2);
        y.b = Math.floor(canvas.height- self.backgroundCanvasObject.height);
        console.log(x, y);
    }
    
    let getCoordinates = function(){
        /* make sure we only have one x and y class in the classList */
        
        let canvas = self.canvas.element,
                xy;
        
        if(canvas.classList.containsAll("xl yt")){
            xy = [0,0];
        }else if(canvas.classList.containsAll("xc yt")){
            xy = [x.c,y.t];
        }else if(canvas.classList.containsAll("xr yt")){
            xy = [x.r,y.t];
        }else if(canvas.classList.containsAll("xl yc")){
            xy = [x.l,y.c];
        }else if(canvas.classList.containsAll("xc yc")){
            xy = [x.c,y.c];
        }else if(canvas.classList.containsAll("xr yc")){
            xy = [x.r,y.c];
        }else if(canvas.classList.containsAll("xl yb")){
            xy = [x.l,y.b];
        }else if(canvas.classList.containsAll("xc yb")){
            xy = [x.c,y.b];
        }else if(canvas.classList.containsAll("xr yb")){
            xy = [x.r,y.b];
        }else{
            xy = null;
        }

        if(xy === null){
            throw "Unable to detect background position classes in canvas";
            return [0,0];
        }else{
            return xy;
        }
        
    }
    
    /* hoist this function */
    var _reDraw = null;
    
    /*
     * detectElementType
     * 
     * Detects what type of Element was passed in and creates the _reDraw function
     * @returns {undefined}
     */
    let detectElementType = function(){
        /* image */
        if(self.backgroundCanvasObject instanceof HTMLImageElement){
            let     canvas = self.canvas.element,
                    context = self.canvas.context;

            /* still image redraw */
            _reDraw = function(){
                let width = self.backgroundCanvasObject.width,
                    height = self.backgroundCanvasObject.height;
                    canvas.style.zIndex = calculateZIndex();
                    /* update the new position */
                    calculatePositions();

                    /* detect repeat */ 
                    if(canvas.classList.contains("xx") && canvas.classList.contains("yy") === false){
                        /* x axis only */
                        context.fillStyle = context.createPattern(self.backgroundCanvasObject, "repeat");
                        context.fillRect(0, 0, canvas.width, height);
                    }else if(canvas.classList.contains("xx") === false && canvas.classList.contains("yy")){
                        /* y axis only */
                        context.fillStyle = context.createPattern(self.backgroundCanvasObject, "repeat");
                        context.fillRect(0, 0, width, canvas.height);
                    }else if(canvas.classList.containsAll("xx yy")){
                        /* x and y axis */
                        context.fillStyle = context.createPattern(self.backgroundCanvasObject, "repeat");
                        context.fillRect(0, 0, canvas.width, canvas.height);
                    }else if(canvas.classList.contains("x-x")){
                        /* stretch x */
                        /* dont't call getCoordinates don't need it for stretch as all images are rendered at the top left corner */
                        context.drawImage(self.backgroundCanvasObject, 0, 0, width, height,0,0, elementWidth, height);
                    }else if(canvas.classList.containsAll("y-y")){
                        /* stretch y */
                        context.drawImage(self.backgroundCanvasObject, 0, 0, width, height, 0, 0, width, elementHeight);
                    }else if(canvas.classList.containsAll("xy-xy")){
                        /* x and y axis stretch */
                        context.drawImage(self.backgroundCanvasObject, 0, 0, width, height, 0, 0, elementWidth, elementHeight);
                    }else{
                        /* no repeat - no stretch */

                        /* get the position classes */
                        let xy = getCoordinates();

                        context.drawImage(self.backgroundCanvasObject, xy[0], xy[1]);

                    }


            }
        }else if(self.backgroundCanvasObject instanceof HTMLVideoElement){
            let canvas = self.canvas.element,
                    context = self.canvas.context;

            self.backgroundCanvasObject.addEventListener("play", function(event){
               reFresh(); 
            });
            /* video redraw */
            _reDraw = function(){
                let width = self.backgroundCanvasObject.videoWidth,
                    height = self.backgroundCanvasObject.videoHeight;
                    canvas.style.zIndex = calculateZIndex();
                    /* update the new position */
                    //calculatePositions();

                    /* detect repeat */ 
                    if(canvas.classList.contains("xx") && canvas.classList.contains("yy") === false){
                        /* x axis only */
                        context.fillStyle = context.createPattern(self.backgroundCanvasObject, "repeat");
                        context.fillRect(0, 0, canvas.width, height);
                        window.requestAnimationFrame(_reDraw);
                    }else if(canvas.classList.contains("xx") === false && canvas.classList.contains("yy")){
                        /* y axis only */
                        context.fillStyle = context.createPattern(self.backgroundCanvasObject, "repeat");
                        context.fillRect(0, 0, width, canvas.height);
                        window.requestAnimationFrame(_reDraw);
                    }else if(canvas.classList.containsAll("xx yy")){
                        /* x and y axis */
                        context.fillStyle = context.createPattern(self.backgroundCanvasObject, "repeat");
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        window.requestAnimationFrame(_reDraw);
                    }else if(canvas.classList.contains("x-x")){
                        /* stretch x */
                        /* dont't call getCoordinates don't need it for stretch as all images are rendered at the top left corner */
                        context.drawImage(self.backgroundCanvasObject, 0, 0, width, height,0,0, elementWidth, height);
                        window.requestAnimationFrame(_reDraw);

                    }else if(canvas.classList.containsAll("y-y")){
                        /* stretch y */
                        context.drawImage(self.backgroundCanvasObject, 0, 0, width, height, 0, 0, width, elementHeight);
                        window.requestAnimationFrame(_reDraw);

                    }else if(canvas.classList.containsAll("xy-xy")){
                        /* x and y axis stretch */
                        context.drawImage(self.backgroundCanvasObject, 0, 0, width, height, 0, 0, elementWidth, elementHeight);
                        window.requestAnimationFrame(_reDraw);
                    }else{
                        /* no repeat - no stretch */

                        /* get the position classes */
                        let xy = getCoordinates();

                        context.drawImage(self.backgroundCanvasObject, 0, 0);
                        window.requestAnimationFrame(_reDraw);
                    }

            }
        }else{
            /* remove object from element */
            delete self.backgroundCanvasObject;
            throw "Unable to detect the Element Type";
        }
    }
    
    detectElementType();
    
    
    
    let reFresh = function(event){
        let canvas = self.canvas.element;

        /* when the window resizes recalculate the width and height */
        let styles = window.getComputedStyle(self), 
            replace = /[px]/g;
        
        /* updates the canvas based on media queries and resize */
        
        elementWidth = styles.getPropertyValue("width").replace(replace,'')-styles.getPropertyValue("border-left-width").replace(replace,'')-styles.getPropertyValue("border-right-width").replace(replace,'');
        elementHeight = styles.getPropertyValue("height").replace(replace,'')-styles.getPropertyValue("border-top-width").replace(replace,'')-styles.getPropertyValue("border-bottom-width").replace(replace,'');
        canvas.setAttribute("width", elementWidth+"px");
        canvas.setAttribute("height", elementHeight+"px");
        
        /* 100% canvas */
        canvas.style.position = "absolute";
        canvas.style.left = "-"+styles.getPropertyValue("border-left-width").replace(replace,'')+"px";
        canvas.style.top = "-"+styles.getPropertyValue("border-top-width").replace(replace,'')+"px";
        
        _reDraw();
    };
    
    /*
     * reFresh
     * 
     * Allow external access to the refresh function
     * 
     * @return {undefined}
     */
    self.canvas.reFresh = function(){
        reFresh();
    }
    
    window.addEventListener("resize", reFresh);

    
    /* tell the view when the background canvas has been added */ 
    
    /*canvas.classList.add('backgroundCanvas','xl','yt');*/

    self.appendChild(self.canvas.element);
    self.canvas.element.classList.add("backgroundCanvas");
    
    
    
    /**
     * changeBackgroundCanvas
     * 
     * Change the background canvas object
     * 
     * @param {HTMLImageElement|HTMLVideoElement} object
     * @returns {undefined}
     */
    self.changeBackgroundCanvas = function(object){
        if(object instanceof HTMLImageElement){
            self.backgroundCanvasObject = object;
            detectElementType();

            reFresh();

        }else if(object instanceof HTMLVideoElement){
            self.backgroundCanvasObject = object;
            detectElementType();

            reFresh();

        }else{
            delete self.backgroundCanvasObject;
            throw "Unable to detect the Element Type";
        }
    }
    
    
    let event =  new Event('BackgroundCanvasLoaded');

    // Dispatch the event.
    self.dispatchEvent(event);
    
    /* done */
    reFresh();

}
