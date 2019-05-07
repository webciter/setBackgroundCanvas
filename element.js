/* Code By David Clews */

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
    
    
    let element = this, 
            elementWidth, 
            elementHeight,
            canvas = document.createElement("canvas"), 
            context = canvas.getContext("2d");
    
    /* 
     * calculateZIndex
     * 
     * Loops through all elements nested and retrieves the z-index, then return 1 less than the minimum
     * 
     * @return {integer} The z-index value to use 1 below minimum 
     */
    let calculateZIndex = function(){
        let nestedElements = self.querySelectorAll("*:not(.backgroundImage)"),
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
        
        if(canvas.classList.containsMany("xl yt")){
            xy = [0,0];
        }else if(canvas.classList.containsMany("xc yt")){
            xy = [x.c,y.t];
        }else if(canvas.classList.containsMany("xr yt")){
            xy = [x.r,y.t];
        }else if(canvas.classList.containsMany("xl yc")){
            xy = [x.l,y.c];
        }else if(canvas.classList.containsMany("xc yc")){
            xy = [x.c,y.c];
        }else if(canvas.classList.containsMany("xr yc")){
            xy = [x.r,y.c];
        }else if(canvas.classList.containsMany("xl yb")){
            xy = [x.l,y.b];
        }else if(canvas.classList.containsMany("xc yb")){
            xy = [x.c,y.b];
        }else if(canvas.classList.containsMany("xr yb")){
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
        var _reDraw = function(){
            let width = object.width,
                height = object.height;
                canvas.style.zIndex = calculateZIndex();
                
                /* update the new position */
                calculatePositions();
                
                /* get the position classes */
                let xy = getCoordinates();
                console.log(xy);
                context.drawImage(object, xy[0], xy[1]);
        }
        
    }
    
    let reFresh = function(event){
        
        /* when the window resizes recalculate the width and height */
        let styles = window.getComputedStyle(element), 
            replace = /[px]/g;
        
        /* updates the canvas based on media queries and resize */
        
        elementWidth = styles.getPropertyValue("width").replace(replace,'');
        elementHeight = styles.getPropertyValue("height").replace(replace,'');

        canvas.setAttribute("width", elementWidth+"px");
        canvas.setAttribute("height", elementHeight+"px");
        
        _reDraw();
    };
    
    /* get the width and hight of the element in use */
    window.addEventListener("resize", reFresh);
    
    /* monitor the element nested elemetns for changes then redraw */
    let config = { attributes: true, childList: true, subtree: false },
            callback = function(mutationsList, observer) {
                for(var mutation of mutationsList) {
                    /* wait for changes here */
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        _reDraw();
                    }
                }
            }
    
    // Create an observer instance linked to the callback function
    var elementObserver = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    elementObserver.observe(self, config);
    
    /* 100% canvas */
    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    
    canvas.classList.add('backgroundImage','xl','yt');
    
    this.appendChild(canvas);
    reFresh();

    return context;
}
