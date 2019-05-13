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
    

    /* position grid */
    
    /*********
     * 1 2 3
     * 4 5 6
     * 7 8 9
     * 
     */
    
    
    let element = self, 
            elementWidth, 
            elementHeight,
            canvas = document.createElement("canvas"), 
            context = canvas.getContext("2d", {alpha: true});
    
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
        x.l = 0;
        x.c = Math.floor(canvas.width/2 - object.width/2);
        x.r = Math.floor(canvas.width - object.width);
        
        y.t = 0;
        y.c = Math.floor(canvas.height/2 - object.height/2);
        y.b = Math.floor(canvas.height- object.height);
        console.log(x, y);
    }
    
    let getCoordinates = function(){
        /* make sure we only have one x and y class in the classList */
        
        
        
        let xy;
        
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
    
    /* image */
    if(object instanceof HTMLImageElement){

        /* still image redraw */
        var _reDraw = function(){
            let width = object.width,
                height = object.height;
                canvas.style.zIndex = calculateZIndex();
                /* update the new position */
                calculatePositions();
                
                /* detect repeat */ 
		if(canvas.classList.contains("xx") && canvas.classList.contains("yy") === false){
                    /* x axis only */
                    context.fillStyle = context.createPattern(object, "repeat");
                    context.fillRect(0, 0, canvas.width, height);
		}else if(canvas.classList.contains("xx") === false && canvas.classList.contains("yy")){
                    /* y axis only */
                    context.fillStyle = context.createPattern(object, "repeat");
                    context.fillRect(0, 0, width, canvas.height);
		}else if(canvas.classList.containsAll("xx yy")){
                    /* x and y axis */
                    context.fillStyle = context.createPattern(object, "repeat");
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }else if(canvas.classList.contains("x-x")){
                    /* stretch x */
                    /* dont't call getCoordinates don't need it for stretch as all images are rendered at the top left corner */
                    context.drawImage(object, 0, 0, width, height,0,0, elementWidth, height);
                }else if(canvas.classList.containsAll("y-y")){
                    /* stretch y */
                    context.drawImage(object, 0, 0, width, height, 0, 0, width, elementHeight);
                }else if(canvas.classList.containsAll("xy-xy")){
                    /* x and y axis stretch */
                    context.drawImage(object, 0, 0, width, height, 0, 0, elementWidth, elementHeight);
		}else{
                    /* no repeat - no stretch */

                    /* get the position classes */
                    let xy = getCoordinates();

                    context.drawImage(object, xy[0], xy[1]);

		}
                
               

        }
    }else if(object instanceof HTMLVideoElement){
        object.addEventListener("play", function(event){
           self.reFresh(); 
        });

        /* video redraw */
        var _reDraw = function(){
            let width = object.videoWidth,
                height = object.videoHeight;
                canvas.style.zIndex = calculateZIndex();
                /* update the new position */
                //calculatePositions();
                
                /* detect repeat */ 
		if(canvas.classList.contains("xx") && canvas.classList.contains("yy") === false){
                    /* x axis only */
                    context.fillStyle = context.createPattern(object, "repeat");
                    context.fillRect(0, 0, canvas.width, height);
                    window.requestAnimationFrame(_reDraw);
		}else if(canvas.classList.contains("xx") === false && canvas.classList.contains("yy")){
                    /* y axis only */
                    context.fillStyle = context.createPattern(object, "repeat");
                    context.fillRect(0, 0, width, canvas.height);
                    window.requestAnimationFrame(_reDraw);
		}else if(canvas.classList.containsAll("xx yy")){
                    /* x and y axis */
                    context.fillStyle = context.createPattern(object, "repeat");
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    window.requestAnimationFrame(_reDraw);
                }else if(canvas.classList.contains("x-x")){
                    /* stretch x */
                    /* dont't call getCoordinates don't need it for stretch as all images are rendered at the top left corner */
                    context.drawImage(object, 0, 0, width, height,0,0, elementWidth, height);
                    window.requestAnimationFrame(_reDraw);

                }else if(canvas.classList.containsAll("y-y")){
                    /* stretch y */
                    context.drawImage(object, 0, 0, width, height, 0, 0, width, elementHeight);
                    window.requestAnimationFrame(_reDraw);

                }else if(canvas.classList.containsAll("xy-xy")){
                    /* x and y axis stretch */
                    context.drawImage(object, 0, 0, width, height, 0, 0, elementWidth, elementHeight);
                    window.requestAnimationFrame(_reDraw);
		}else{
                    /* no repeat - no stretch */

                    /* get the position classes */
                    let xy = getCoordinates();

                    context.drawImage(object, 0, 0);
                    window.requestAnimationFrame(_reDraw);
		}

        }
    }else{
        throw "Unable to detect the Element Type";
    }
    
    self.reFresh = function(event){
        console.log("refresh");
        /* when the window resizes recalculate the width and height */
        let styles = window.getComputedStyle(element), 
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
    
    window.addEventListener("resize", self.reFresh);


    element.appendChild(canvas);
    canvas.classList.add("backgroundCanvas");

    /**
     * getBackgroundCanvas
     * 
     * Gets the {HTMLCanvasElement} that hold the background object
     * 
     * @returns {HTMLCanvasElement|null}
     */
    self.getBackgroundCanvas = function(){
        return canvas || null;
    }
    
    /* tell the view when the background canvas has been added */ 
    let event =  new Event('BackgroundCanvasLoaded');

    // Dispatch the event.
    element.dispatchEvent(event);

    self.reFresh();


}


