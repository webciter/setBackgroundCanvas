/* 
 * @author David Clews
 * @version 2.0.0
 * @authorUrl http://davidclews.com
 * @repositoryUrl https://github.com/webciter/setBackgroundCanvas
*/

require('array-functions-min');
require('dom_token_list-functions-contains_all');

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
    backgroundCanvasLoadedEvent = new Event('BackgroundCanvasLoaded'),
    backgroundCanvasChangedEvent = new Event('BackgroundCanvasChanged'),

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
    
    self.i = 0;
    
    self.chromaVariance = 300; /* chroma key variance */
    
    self.chromaKey = 
    {   
        red: 58, /* 0 - 255 */
        green: 228, /* 0 - 255 */
        blue:31 /* 0 - 255 */
    };
    
    self.levels = {   
        red: 1, /* 0 - 2 */
        green: 1, /* 0 - 2 */
        blue: 1 /* 0 - 2 */
    };
    

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
        element: document.createElement("canvas"),
        hiddenCanvas: document.createElement("canvas")
    };
    
    /* inherit the rules of the parent for cascading */

    self.canvas.element.style.cssText = 
        `
        border: inherit;
       
        border-top-color: inherit;
        border-right-color: inherit;
        border-bottom-color: inherit;
        border-left-color: inherit;
        
        border-radius: inherit;
         
        border-top-style: inherit;
        border-right-style: inherit;
        border-bottom-style: inherit;
        border-left-style: inherit;
        
        border-top-width: inherit;
        border-right-width: inherit;
        border-bottom-width: inherit;
        border-left-width: inherit;
        `;
    
    /* create the contexts */
    self.canvas.context = self.canvas.element.getContext("2d", {alpha: true});
    self.canvas.hiddenContext = self.canvas.element.getContext("2d", {alpha: true});
    
    /* 
     * calculateZIndex
     * 
     * Loops through all elements nested and retrieves the z-index, then return 1 less than the minimum
     * 
     * @return {integer} The z-index value to use 1 below minimum 
     */
    let calculateZIndex = function(){
        let n = self.querySelectorAll("*:not(.backgroundCanvas)"),
                z = [];
       
        Array.from(n).forEach(function(a) {
            /* only return real numbers */
            if(isNaN(a.style.zIndex) === false){
                z.push(a.style.zIndex);
            }
        });
        
        return parseInt(Array.min(z))-1;
        
    }
    
    /*
     * calculatePositions
     * 
     * @returns {undefined}
     */
    let calculatePositions = function(){
        /* bring the canvas into scope */
        let a = self.canvas.element,
            b = self.backgroundCanvasObject;
        
        x.l = 0;
        x.c = Math.floor(a.width/2 - (b.width/2 !== 0 ? b.width/2 : b.videoWidth/2));
        x.r = Math.floor(a.width - (b.width !== 0 ? b.width : b.videoWidth));
        
        y.t = 0;
        y.c = Math.floor(a.height/2 - (b.height/2 !== 0 ? b.height/2 : b.videoHeight/2));
        y.b = Math.floor(a.height- (b.height !== 0 ? b.height : b.videoHeight));
        
    }
    
    let getCoordinates = function(){
        /* make sure we only have one x and y class in the classList */
        let c = self.canvas.element,
                xy;

        if(c.classList.containsAll("xl yt")){
            xy = [0,0];
        }else if(c.classList.containsAll("xc yt")){
            xy = [x.c,y.t];
        }else if(c.classList.containsAll("xr yt")){
            xy = [x.r,y.t];
        }else if(c.classList.containsAll("xl yc")){
            xy = [x.l,y.c];
        }else if(c.classList.containsAll("xc yc")){
            xy = [x.c,y.c];
        }else if(c.classList.containsAll("xr yc")){
            xy = [x.r,y.c];
        }else if(c.classList.containsAll("xl yb")){
            xy = [x.l,y.b];
        }else if(c.classList.containsAll("xc yb")){
            xy = [x.c,y.b];
        }else if(c.classList.containsAll("xr yb")){
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
                    hiddenContext = self.canvas.hiddenContext;
                    
            window.addEventListener("load", function(event){
                setTimeout(function(){
                    reFresh(); 
                }, 3000);
            });
            
            /* still image redraw */
            _reDraw = function(){

                let width = self.backgroundCanvasObject.width,
                    height = self.backgroundCanvasObject.height;
                    canvas.style.zIndex = calculateZIndex();
                    /* update the new position */
                    calculatePositions();

                    let w = detectFilters();

                    /* detect repeat */ 
                    if(canvas.classList.contains("xx") && canvas.classList.contains("yy") === false){
                        /* x axis only */
                        processCanvasRepeat(hiddenContext, context, w, 0, 0, canvas.width, height, elementWidth, elementHeight);
                    }else if(canvas.classList.contains("xx") === false && canvas.classList.contains("yy")){
                        /* y axis only */
                        processCanvasRepeat(hiddenContext, context, w, 0, 0, width, height, elementWidth, elementHeight);
                    }else if(canvas.classList.containsAll("xx yy")){
                        /* x and y axis */
                        processCanvasRepeat(hiddenContext, context, w, 0, 0, canvas.width, canvas.height, elementWidth, elementHeight);
                    }else if(canvas.classList.contains("x-x")){
                        /* stretch x */
                        processCanvas(hiddenContext, context, w, 0, 0, width, height, 0, 0, elementWidth, height);
                    }else if(canvas.classList.containsAll("y-y")){
                        /* stretch y */
                        processCanvas(hiddenContext, context, w, 0, 0, width, height, 0, 0, width, elementHeight);
                    }else if(canvas.classList.containsAll("xy-xy")){
                        /* x and y axis stretch */
                        processCanvas(hiddenContext, context, w, 0, 0, width, height, 0, 0, elementWidth, elementHeight);
                    }else{
                        /* no repeat - no stretch */

                        /* get the position classes */
                        let xy = getCoordinates();

                        //context.drawImage(self.backgroundCanvasObject, xy[0], xy[1]);
                        processCanvas(hiddenContext, context, w, 0, 0, width, height, xy[0], xy[1], width, height);
                    }


            }
        }else if(self.backgroundCanvasObject instanceof HTMLVideoElement){
            let     canvas = self.canvas.element,
                    context = self.canvas.context,
                    hiddenContext = self.canvas.hiddenContext;
            self.backgroundCanvasObject.addEventListener("play", function(event){
               reFresh(); 
            });
            
            /* video redraw */
            _reDraw = function(){
                let width = self.backgroundCanvasObject.videoWidth,
                    height = self.backgroundCanvasObject.videoHeight;
                    canvas.style.zIndex = calculateZIndex();
                    /* update the new position */
                    calculatePositions();
                    
                    let w = detectFilters( );


                    /* detect repeat and stretch */ 
                    if(canvas.classList.contains("xx") && canvas.classList.contains("yy") === false){
                        /* x axis only */
                        processCanvasRepeat(hiddenContext, context, w, 0, 0, canvas.width, height, elementWidth, elementHeight);
                    }else if(canvas.classList.contains("xx") === false && canvas.classList.contains("yy")){
                        /* y axis only */
                        processCanvasRepeat(hiddenContext, context, w, 0, 0, width, canvas.height, elementWidth, elementHeight);
                    }else if(canvas.classList.containsAll("xx yy")){
                        /* x and y axis */
                        processCanvasRepeat(hiddenContext, context, w, 0, 0, canvas.width, canvas.height, elementWidth, elementHeight);
                    }else if(canvas.classList.contains("x-x")){
                        /* stretch x */
                        processCanvas(hiddenContext, context, w, 0, 0, width, height, 0, 0, elementWidth, height);
                    }else if(canvas.classList.containsAll("y-y")){
                        /* stretch y */
                        processCanvas(hiddenContext, context, w, 0, 0, width, height, 0, 0, width, elementHeight);
                    }else if(canvas.classList.containsAll("xy-xy")){
                        /* x and y axis stretch */
                        processCanvas(hiddenContext, context, w, 0, 0, width, height, 0, 0, elementWidth, elementHeight);
                    }else{
                        /* no repeat - no stretch */
                        let xy = getCoordinates();
                        processCanvas(hiddenContext, context, w, 0, 0, width, height, xy[0], xy[1], width, height);
                    }
            }
        }else{
            /* remove object from element */
            delete self.backgroundCanvasObject;
            throw "Unable to detect the Element Type";
        }
    }
    
    /*
     * processCanvas
     * 
     * @param {CanvasRenderingContext2D} a The hidden buffer context
     * @param {CanvasRenderingContext2D} b The viewable context as seen by the end user
     * @param {array} c an arary of the filters that are going to be applied
     * @param {integer} d drawImage parameter 2 sx|dx
     * @param {integer} e drawImage parameter 3 sy|dy
     * @param {integer} [f] drawImage parameter 4 sWidth
     * @param {integer} [g] drawImage parameter 5 sHeight
     * @param {integer} [h] drawImage parameter 6 dx
     * @param {integer} [j] drawImage parameter 7 dy
     * @param {integer} [k] drawImage parameter 8 dWidth
     * @param {integer} [l] drawImage parameter 9 dHeight
     * 
     * 
     * @returns {undefined}
     */
    var processCanvas = function(a, b, c, d = 0, e = 0, f = false, g = false, h = false, j = false, k = false, l = false){
        window.requestAnimationFrame(_reDraw);
                       
        /* extract all the parameters for drawimage */
        let m = Array.from(arguments).slice(3);
        m.unshift(self.backgroundCanvasObject);
            
        /* remove undefined parameters (false) */
        m.filter(Boolean);
        
        /* extract hidden render variables  */
        let n = [d, e, k, l];
        n.filter(Boolean);

        if(c.length >= 1){
            // a.drawImage(self.backgroundCanvasObject, 0, 0, width, height, 0, 0, elementWidth, elementHeight);
            a.drawImage.apply(a, m);
            let x = a.getImageData.apply(a, n);

            processPixels(x, c);

            b.putImageData(x, d, e);
            
        }else{
            /* draw to the canvas with no filters */
            a.drawImage.apply(a, m);
            let x = a.getImageData.apply(a, n);
            
            processPixels(x, c);
            
            b.putImageData(x, d, e);
        }
    }
    
    
    /*
     * processCanvasRepeat
     * 
     * @param {CanvasRenderingContext2D} a The hidden buffer context
     * @param {CanvasRenderingContext2D} b The viewable context as seen by the end user
     * @param {array} c an arary of the filters that are going to be applied
     * @param {integer} d fillRect x
     * @param {integer} e fillRect y
     * @param {integer} f fillRect width
     * @param {integer} g fillRect height
     * @param {integer} h elementWidth
     * @param {integer} j elementHeight
     * 
     * 
     * @returns {undefined}
     */
    var processCanvasRepeat = function(a, b, c, d = 0, e = 0, f, g, h, j){
        window.requestAnimationFrame(_reDraw);
                       
        a.fillStyle = b.createPattern(self.backgroundCanvasObject, "repeat");
        a.fillRect(d, e, f, g);
                        
        let x = a.getImageData(d, e, h, j);
            
        if(c.length >= 1){
            
            processPixels(x, c);
            b.putImageData(x, 0, 0);
            
        }else{
            /* draw to the canvas with no filters */
            b.putImageData(x, 0, 0);
        }
    }
    
    detectElementType();
    
    /**
     * detectFilters
     * 
     * @return {array}
     * */
    var detectFilters = function(){
        let c = self.canvas.element;
        
        let f = [];
            
        if(c.classList.contains("chromaKey")){
            f.push("chromaKey");
        }
        
        if(c.classList.contains("levels")){
            f.push("levels");
        }
        
        return f;
        
    }
    /*
     * adjustLevels
     * 
     * Adjust the Levels in a relative way
     * 
     * @param {ImageData} a
     * @param {integer} i The nth position in a
     * @returns {undefined}
     */
    var adjustLevels = function(a, i){
        /* adjust the levels */
        let r,g,b;
        /* red */
        if(self.levels.red !== 1){
            r = (a.data[i] * self.levels.red);
            a.data[i] = r <= 255 ? r >= 0 ? r : 0 : 255;
        }
        
        /* green */
        if(self.levels.green !== 1){
            g = (a.data[i+1]  * self.levels.green);
            a.data[i+1] = g <= 255 ? g >= 0 ? g : 0 : 255;
        }
        
        /* blue */
        if(self.levels.blue !== 1){
            b = (a.data[i+2] * self.levels.blue);
            a.data[i+2] = b <= 255 ? b >= 0 ? b : 0 : 255;
        }
        /* ignore alpha */

    }
    
    /*
     * processChromaKey
     * 
     * @param {ImageData} a
     * @param {array} b The chroma red, green and blue
     * @param {integer} i The integer offset of ImageData
     * 
     * @return {undefined}
     */
    var processChromaKey = function(a, b, i){
        /* loop through each pixel */
        /* z is the difference */
        let z = Math.abs(a.data[i] - b[0]) + Math.abs(a.data[i+1] - b[1]) + Math.abs(a.data[i+2] - b[2]);
        if(z < self.chromaVariance) {
            a.data[i+3] = (z*z)/self.chromaVariance;
        }                            
        
    }
    
    /*
     * processPixels
     * 
     * Run the routines for direct pixel manipulation 
     * 
     * @param {ImageData} a
     * @param {array} b The filters to apply to the ImageData
     * @returns {undefined}
     */
    var processPixels = function(a, b = []){
        /* z = chroma key data */
        let z = [self.chromaKey.red, self.chromaKey.green, self.chromaKey.blue];
        /* loop through each pixel */
        /* step 4 positions for a single pixel */
        for(
                let i = 0;
                i<a.data.length;
                i+=4){
                     
            if(b.indexOf("chromaKey") !== -1){
                processChromaKey(a, z, i)
            }else if(b.indexOf("levels") !== -1){
                adjustLevels(a, i);
            }

        }
    }
    
    
    var reFresh = function(event){
        let     canvas = self.canvas.element,
                hiddenCanvas = self.canvas.hiddenCanvas,
                styles = window.getComputedStyle(self), 
                replace = /[px]/g;
        
        /* updates the canvas based on media queries and resize */
        elementWidth = Math.ceil(styles.getPropertyValue("width").replace(replace,'')-styles.getPropertyValue("border-left-width").replace(replace,'')-styles.getPropertyValue("border-right-width").replace(replace,''));
        elementHeight = Math.ceil(styles.getPropertyValue("height").replace(replace,'')-styles.getPropertyValue("border-top-width").replace(replace,'')-styles.getPropertyValue("border-bottom-width").replace(replace,''));
        canvas.setAttribute("width", elementWidth+"px");
        canvas.setAttribute("height", elementHeight+"px");
        
        hiddenCanvas.setAttribute("width", elementWidth+"px");
        hiddenCanvas.setAttribute("height", elementHeight+"px");
        
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
    
    /* when the window resizes recalculate the width and height */
    window.addEventListener("resize", function(event){
        /* its not very accurate but works */
        setTimeout(function(){reFresh();}, 200);
    });
    
    /* ClassListChanged */
    
    /* its ok to add this functionality like this if the event does not exist it will still work */
    self.addEventListener("ClassListChanged", function(event){
        reFresh();
    });
    
    /* tell the view when the background canvas has been added */ 
    
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
            self.dispatchEvent(backgroundCanvasChangedEvent);

        }else if(object instanceof HTMLVideoElement){
            self.backgroundCanvasObject = object;
            detectElementType();
            self.dispatchEvent(backgroundCanvasChangedEvent);

        }else{
            delete self.backgroundCanvasObject;
            throw "Unable to detect the Element Type";
        }
    }
    
    self.addEventListener("BackgroundCanvasChangedEvent", function(){
        reFresh();
    });
    

    // Dispatch the event.
    self.dispatchEvent(backgroundCanvasLoadedEvent);
    
    
    /* done */
    reFresh();

}
