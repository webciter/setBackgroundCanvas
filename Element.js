/* 
 * @author David Clews
 * @version 3.0.0
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
    backgroundCanvasCachedEvent = new Event('BackgroundCanvasCached'),

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
    
    self.version = "3.0.0";

    self.backgroundCanvas = {
        opacity: .8,
        fps: 60,
        i: 0,
        backgroundCanvasObject: object,
        chromaVariance: 300,
        chromaKey:
        {   
            red: 0, /* 0 - 255 */
            green: 255, /* 0 - 255 */
            blue: 0 /* 0 - 255 */
        },
        levels: {   
            red: 1, /* 0 - 2 */
            green: 1, /* 0 - 2 */
            blue: 1 /* 0 - 2 */
        },
        
    };
    

    /* position grid */
    
    /*********
     * 1 2 3
     * 4 5 6
     * 7 8 9
     * 
     */
    
    let     elementWidth, 
            elementHeight,
            rAF = null,
            resizeTimeout = null,
            rAFTimeout = null;
    
    /*
     * initNewCanvas
     * 
     * @returns {undefined}
     */
    let initNewCanvas = function(){
        
        
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
        self.canvas.hiddenContext = self.canvas.hiddenCanvas.getContext("2d", {alpha: true});

        self.canvas.context.globalCompositeOperation = 'source-in';
        self.canvas.element.style.opacity = self.backgroundCanvas.opacity;
        
        self.canvas.element.classList.add("backgroundCanvas");
        self.backgroundCanvas.id = "bGC_"+Math.floor(Math.random() * (99999 - 10000));
        self.canvas.element.id = self.backgroundCanvas.id;
        self.appendChild(self.canvas.element);
        
        _reDraw = function(){};
    }
    
    initNewCanvas();
    
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
            b = self.backgroundCanvas.backgroundCanvasObject;
        
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
            return [0,0];
            throw "Unable to detect background position classes in canvas";

        }else{
            return xy;
        }
    }
    
    /* hoist this function */
    var _reDraw = null;
    
    /*
     * detectElementType
     * 
     * Detects what type of Element was passed in and creates the _reDraw function, 
     * this function remove any imcompatible events from the object
     * @returns {undefined}
     */
    let detectElementType = function(){
        
        /*
         * _fragment1
         * 
         * @param {array} a The filters to apply
         * @param {HTMLCanvasElement} b The canvas
         * @param {CanvasRenderingContext2D} c context
         * @param {CanvasRenderingContext2D} d hiddenContext
         * @param {integer} e width
         * @param {integer} f height
         * @returns {undefined}
         */
        let _fragment1 = function(a, b, c, d, e, f){
            /* detect repeat */ 
            if(b.classList.contains("xx") && b.classList.contains("yy") === false){
                /* x axis only */
                processCanvasRepeat(d, c, a, 0, 0, b.width, f, elementWidth, elementHeight);
            }else if(b.classList.contains("xx") === false && b.classList.contains("yy")){
                /* y axis only */
                processCanvasRepeat(d, c, a, 0, 0, e, b.height, elementWidth, elementHeight);
            }else if(b.classList.containsAll("xx yy")){
                /* x and y axis */
                processCanvasRepeat(d, c, a, 0, 0, b.width, b.height, elementWidth, elementHeight);
            }else if(b.classList.contains("x-x")){
                /* stretch x */
                processCanvas(d, c, a, 0, 0, e, f, 0, 0, elementWidth, f);
            }else if(b.classList.containsAll("y-y")){
                /* stretch y */
                processCanvas(d, c, a, 0, 0, e, f, 0, 0, e, elementHeight);
            }else if(b.classList.containsAll("xy-xy")){
                /* x and y axis stretch */

                processCanvas(d, c, a, 0, 0, e, f, 0, 0, elementWidth, elementHeight);
            }else{
                /* no repeat - no stretch */

                /* get the position classes */
                let xy = getCoordinates();

                processCanvas(d, c, a, 0, 0, e, f, xy[0], xy[1], e, f);
            }
        } 
        
        try{
            /* image */
            if(self.backgroundCanvas.backgroundCanvasObject instanceof HTMLImageElement){
                let     canvas = self.canvas.element,
                        context = self.canvas.context,
                        hiddenContext = self.canvas.hiddenContext;

                window.addEventListener("load", function(event){
                    setTimeout(function(){
                        reFresh(); 
                    }, 3000);
                });

                /* still image redraw */
                _reDraw = function(){
                    try{
                        clearTimeout(rAFTimeout);

                        let width = self.backgroundCanvas.backgroundCanvasObject.width,
                            height = self.backgroundCanvas.backgroundCanvasObject.height;
                            canvas.style.zIndex = calculateZIndex();
                            /* update the new position */
                            calculatePositions();

                            let w = detectFilters();

                            _fragment1(w, canvas, context, hiddenContext, width, height);
                            
                            
                    }catch(err){
                        /* image not ready */
                        console.log("image not ready");
                    }
                }
           
            }else if(self.backgroundCanvas.backgroundCanvasObject instanceof GLSLFragmentShader){

                let     canvas = self.canvas.element,
                        context = self.canvas.context,
                        hiddenContext = self.canvas.hiddenContext;

                let o = self.backgroundCanvas.backgroundCanvasObject.canvas;

                /* remove the incompatible resize event */
                window.removeEventListener("resize", self.backgroundCanvas.backgroundCanvasObject.onWindowResize);
                self.backgroundCanvas.backgroundCanvasObject.onWindowResize();
                
                /* glsl redraw */
                _reDraw = function(){
                    clearTimeout(rAFTimeout);
                    let width = self.backgroundCanvas.backgroundCanvasObject.width,
                        height = self.backgroundCanvas.backgroundCanvasObject.height;
                        canvas.style.zIndex = calculateZIndex();
                        /* update the new position */
                        calculatePositions();

                        let w = detectFilters();

                        _fragment1(w, canvas, context, hiddenContext, width, height);

                }
            }else{
                /* remove object from element */
                delete self.backgroundCanvas.backgroundCanvasObject;
                throw "Unable to detect the Element Type";
            }
        }catch(err){
            console.error(err);
        }
    }
    
    /*
     * animationControl
     * 
     * Controls the animation frame, removes duplicate code
     * 
     * @returns {undefined}
     */
    let animationControl = function(){
        let o = self.backgroundCanvas;
        
        if(o.backgroundCanvasObject instanceof HTMLImageElement){
            rAFTimeout = setTimeout(function() {
                rAF = window.requestAnimationFrame(_reDraw);
            }, 10000);
        }else{
            if(o.fps !== 60){
                rAFTimeout = setTimeout(function() {
                    rAF = window.requestAnimationFrame(_reDraw);
                }, Math.floor(1000 / o.fps));
                
            }else{
                /* run as fast as the browser can go capped at 60fps */
                rAF = window.requestAnimationFrame(_reDraw);
            }
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
    let processCanvas = function(a, b, c, d = 0, e = 0, f = false, g = false, h = false, j = false, k = false, l = false){
             
        animationControl();      
        
        let o = self.backgroundCanvas.backgroundCanvasObject,
            p = self.backgroundCanvas; /* shorthand */     
       
        /* code for HTMLVideoElement and HTMLImageElement*/
        if(     o instanceof HTMLImageElement ||
                o instanceof GLSLFragmentShader
                ){
            var n,u,m;

            /* extract all the parameters for drawimage */
            m = Array.from(arguments).slice(3);
            
            /* get compatible object for drawImage */
            if(o instanceof HTMLCanvasElement || 
                    o instanceof HTMLImageElement){
                m.unshift(o);
            }else{
                /* expect the canvas to be named canvas in the object */
                m.unshift(o.canvas);
            }

            /* remove undefined parameters (false) */
            m.filter(Boolean);

            /* extract hidden render variables  */
            n = [d, e, b.canvas.width, b.canvas.height];
            n.filter(Boolean);

            a.drawImage.apply(a, m);
            u = a.getImageData.apply(a, n);
        }
        
        if(o instanceof HTMLImageElement){
                /* image */
                processPixels(u, c)
                b.putImageData(u, d, e);
            
        }else if(o instanceof GLSLFragmentShader){
                /* GLSL Fragment Shader */
                b.putImageData(u, d, e);
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
     * @returns {undefined}
     */
    let processCanvasRepeat = function(a, b, c, d = 0, e = 0, f, g, h, j){
        
        animationControl();
        
        let o = self.backgroundCanvas.backgroundCanvasObject,
            p = self.backgroundCanvas; /* shorthand */
        
        if(o instanceof HTMLImageElement){
            a.fillStyle = b.createPattern(o, "repeat");
        }else if(o instanceof GLSLFragmentShader){
            a.fillStyle = b.createPattern(o.canvas, "repeat");
        }

        a.fillRect(d, e, f, g);

        let x = a.getImageData(d, e, h, j);
            
        if(o instanceof HTMLImageElement){
            
            processPixels(x, c);
            b.putImageData(x, 0, 0);
            b.restore();
            
        }else if(o instanceof GLSLFragmentShader){
            b.putImageData(x, 0, 0);
        }
    }
    
    detectElementType();
    
    /**
     * detectFilters
     * 
     * @return {array}
     * */
    let detectFilters = function(){
        let c = self.canvas.element,
                f = [];
            
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
    let adjustLevels = function(a, i){
        /* adjust the levels */
        let r,g,b;
        /* red */
        if(self.backgroundCanvas.levels.red !== 1){
            r = (a.data[i] * self.backgroundCanvas.levels.red);
            a.data[i] = r <= 255 ? r >= 0 ? r : 0 : 255;
        }
        
        /* green */
        if(self.backgroundCanvas.levels.green !== 1){
            g = (a.data[i+1]  * self.backgroundCanvas.levels.green);
            a.data[i+1] = g <= 255 ? g >= 0 ? g : 0 : 255;
        }
        
        /* blue */
        if(self.backgroundCanvas.levels.blue !== 1){
            b = (a.data[i+2] * self.backgroundCanvas.levels.blue);
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
    let processChromaKey = function(a, b, i){
        /* loop through each pixel */
        /* z is the difference */
        
        /* run on CPU */
        let z = Math.abs(a.data[i] - b[0]) + Math.abs(a.data[i+1] - b[1]) + Math.abs(a.data[i+2] - b[2]);
        if(z < self.backgroundCanvas.chromaVariance) {
            a.data[i+3] = parseInt((z*z)/self.backgroundCanvas.chromaVariance);
        }    

        if(a.data[i] === 0 && a.data[i+1] === 0 && a.data[i+2] === 0){
            a.data[i+3] = 0;
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
    let processPixels = function(a, b = []){
        /* z = chroma key data */
        let z = [self.backgroundCanvas.chromaKey.red, self.backgroundCanvas.chromaKey.green, self.backgroundCanvas.chromaKey.blue];
        /* loop through each pixel */
        /* step 4 positions for a single pixel */
       

            /* run on the CPU */
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
    
    /* 
     * reFresh
     * 
     */
    let reFresh = function(event){
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
        
        canvas.style.opacity = self.backgroundCanvas.opacity;
                                

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
        self.canvas.element.style.opacity = 0;

        clearTimeout(resizeTimeout);
        clearTimeout(rAFTimeout);
        cancelAnimationFrame(rAF);

        resizeTimeout = setTimeout(function(){reFresh();
            if(self.backgroundCanvas.backgroundCanvasObject instanceof GLSLFragmentShader){
                self.backgroundCanvas.backgroundCanvasObject.onWindowResize();
            }
            
            self.canvas.element.style.opacity = self.backgroundCanvas.opacity;

        }, 250);
        
    });
    
    let classListTimeout = null;

    /* ClassListChanged 
     * 
     * its ok to add this functionality like this if the event does not exist it will still work
     * @param {Event} event 
     * @return {undefined}
     */
    self.addEventListener("ClassListChanged", function(event){
        // make sure this event is not fired to many times, this will stop the gittering effect of the GLSLFragmentShader's running 
        if(classListTimeout !== null){
            return;
        }
        
        classListTimeout  = setTimeout(function(){
            let a = self.backgroundCanvas;
            reFresh();
            classListTimeout = null;
        }, 100);        
    });
    

    /*
     * destroyBackgroundCanvas
     * 
     * Cleanup previous backgroundCanvas
     * 
     * @param {type} a
     * @returns {undefined}
     */
    self.destroyBackgroundCanvas = function(){
        
        if(typeof self.backgroundCanvas.backgroundCanvasObject.destroy === "function"){
            self.backgroundCanvas.backgroundCanvasObject.destroy();
        }   
        
        cancelAnimationFrame(rAF);
        clearTimeout(resizeTimeout);
        clearTimeout(rAFTimeout);
                    
        delete self.backgroundCanvas.backgroundCanvasObject;
        
        document.getElementById(self.backgroundCanvas.id).remove();

    }
    
    /**
     * changeBackgroundCanvas
     * 
     * Change the background canvas object
     * 
     * @param {HTMLImageElement|HTMLVideoElement|GLSLFragmentShader} a 
     * @returns {undefined}
     */
    self.changeBackgroundCanvas = function(a){
        let o = self.backgroundCanvas.backgroundCanvasObject,
            p = self.backgroundCanvas;
        
        if(a instanceof HTMLImageElement){
            
            self.backgroundCanvas.backgroundCanvasObject = a;
            initNewCanvas();

            detectElementType();
            self.dispatchEvent(backgroundCanvasChangedEvent);

        }else if(a instanceof GLSLFragmentShader){

            self.backgroundCanvas.backgroundCanvasObject = a;
            initNewCanvas();

            detectElementType();
            self.dispatchEvent(backgroundCanvasChangedEvent);  

        }else{
            delete self.backgroundCanvas.backgroundCanvasObject;
            throw "Unable to detect the Element Type";
        }
    }
    
    self.addEventListener("BackgroundCanvasChangedEvent", function(){
        reFresh();
    });

    // tell the caller Class has been Loaded
    self.dispatchEvent(backgroundCanvasLoadedEvent);
    
    /* done */
    reFresh();

}
