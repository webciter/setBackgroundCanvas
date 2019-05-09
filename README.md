# setBackgroundCanvas
Sets an Image as the background of any Element using a single function.

This functions allows you to apply an image behind all element children. By using this function you will have far more control over your 
image. The main reason for this was to allow opacity over an still background image without effecting nested elements. 
Now each nested element can have its own alpha use setAlpha project for this. Use the opacity rule for the canvas.

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

<h2>Requires</h2>

containsAll
arrayMin

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
 document.getElementById("your_block_level_element").getBackgroundCanvas().classList.add("xc yc");
 
</pre>
 
 <h2>Opacity</h2>
 
 Use the opacity rule, inheritance will not be effected as it's on it own branch.
 
 <pre>
  /* 50% Opacity */
  document.getElementById("your_block_level_element").getBackgroundCanvas().style.opacity = 0.5;

 </pre>
 

 
