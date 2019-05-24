# setBackgroundCanvas
Sets an Image or Video as the background of any Element using a single function.

This functions allows you to apply a image or video behind all element children. By using this function you will have far more control. The main reason for this was to allow opacity over an still background image without effecting nested elements. 
Now each nested element can have its own alpha use setAlpha project for this. Use the opacity rule for the canvas.

<h2>Image Example</h2>
<pre>
        /* create the image */
        var img1 = new Image();

        //drawing of the test image - img1
        img1.onload = function () {
            //draw background image
            
            /* run the function with the object */
            document.getElementById("your_block_level_element").setBackgroundCanvas(img1);

        };

        img1.src = 'https://upload.wikimedia.org/wikipedia/commons/9/9b/The.Matrix.glmatrix.2.png';

</pre>

<h2>Video Example</h2>
<pre>
            var vid1 = document.createElement("video");
            vid1.id = "vid_1";
            vid1.src = "http://your_video_url.com/video.mp4";
            vid1.muted = true; 
            var vw,vh;
            vid1.addEventListener("loadedmetadata", function() {
                document.getElementById("your_block_level_element").setBackgroundCanvas(this);
			/* you can use a timer for a delay */
                    setTimeout(function(){
                        vid1.play();
                    }, 5000)

            }, false);
</pre>

<h2>Change Canvas Object</h2>

<pre>
    /* create the image */
    var img1 = new Image();

    //drawing of the test image - img1
    img1.onload = function () {
        //draw background image
        
        /* run the function with the object */
        document.getElementById("col_1").changeBackgroundCanvas(img1);
	document.getElementById("col_1").canvas.reFresh();
    };

    img1.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1024px-The_Earth_seen_from_Apollo_17.jpg';
</pre>

<h2>Canvas Element</h2>

You can access the canvas element directly by using 

<pre>element.canvas.element</pre>

<h2>Refresh</h2>

You can access the reFresh function if you have any refreshing issues with

<pre>
element.canvas.reFresh();
</pre>

<h2>Events</h2>
<h3>BackgroundCanvasLoaded</h3>

<pre>

document.getElementById("your_block_level_element").addEventListener("BackgroundCanvasLoaded", function(event){
           // apply the settings 
           event.target.canvas.element.classList.add("x-x","y-y");

           // set the opacity if you wish
           event.target.canvas.element.style.opacity = 0.5;

           event.target.canvas.reFresh();
});

</pre>

<h3>BackgroundCanvasChanged</h3>

Triggered when a chnage to the canvas object.

<h2>Requires</h2>

<pre>
containsAll https://github.com/webciter/containsAll
arrayMin https://github.com/webciter/arrayMin
</pre>

<h2>Optional</h2>

By including this module you will get an extra reFresh call.

<pre>
classListMonitor https://github.com/webciter/classListMonitor
</pre>

<h2>Installation</h2>

<pre>
npm i element-functions-set_background_canvas
</pre>

<h2>Positioning</h2>

To reposition the image use two classes on the canvas element, both x and y classes are needed.

9 positions are possible
 
 <pre>
 xl yt, xc yt, xr yt
 xl yc, xc yc, xr yc
 xl yb, xc yb, xr yb
 </pre>
 
 So for a center image use 
 
<pre>
/* center image */
 document.getElementById("your_block_level_element").canvas.element.classList.add("xc yc");
 
</pre>

 <h2>Stretch</h2>

 The object ether image, video can be stretched over the element, using the following classes. aspect ratio is ignored.

 <pre>
 x-x - x axis only
 y-y - y axis only
 xy-xy - both axis
 </pre>
 
 
 <h2>Opacity</h2>
 
 Use the opacity rule, inheritance will not be effected as it's on it own branch.
 
 <pre>
  /* 50% Opacity */
  document.getElementById("your_block_level_element").canvas.element.style.opacity = 0.5;

 </pre>

<h2>Repeat</h2>

<pre>
/* only on the x axis */
 document.getElementById("your_block_level_element").canvas.element.classList.add("xx");

/* only on the y axis */
 document.getElementById("your_block_level_element").canvas.element.classList.add("yy");

/* both axis, essentially tile cover */
 document.getElementById("your_block_level_element").canvas.element.classList.add("xx yy");

</pre>

<h2>Levels</h2>

Levels were added for manipulation of pixels just in case there is some chroma pixels remaining.
The class of levels must be added to the Element or it will be ignored

<pre>
document.getElementById("your_block_level_element").canvas.element.levels.red = 1; /* 0.0 - 2.0 */
document.getElementById("your_block_level_element").canvas.element.levels.green = 1; /* 0.0 - 2.0 */
document.getElementById("your_block_level_element").canvas.element.levels.blue = 1; /* 0.0 - 2.0 */
</pre>


<h2>Chroma Key</h2>

Apply a color of chroma key to the video or image the class of chromaKey must be added to the canvas element to function, make sure you slect the exact colour of the chroma key.

<pre>
document.getElementById("your_block_level_element").canvas.element.chromaKey = {red: 0, green: 255, blue:0};
</pre>

<h2>Chroma Variance</h2>

Apply an amount of chroma variance to the video or image the class of chromaKey must be added to the canvas element to function

<pre>
document.getElementById("your_block_level_element").canvas.element.chromaVariance = 300;
</pre>




 
