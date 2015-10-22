/***********************************************************************
 * bubbles.js
 * Written by Tara Mathers, 2010 
 * ---------------------------------------------------------------------
 * Draws randomly generated bubbles floating up the screen to an HTML5
 * canvas. Clicking on the bubbles pops them. 
 * Only runs on browsers which support the canvas element.
 * *********************************************************************/     



/********************************
 * Bubble()
 * Creates a new bubble object
 ********************************/
 
function Bubble() {
	
	this.x = Math.floor(Math.random() * CANVAS_WIDTH);
	this.y = Math.floor(Math.random() * (CANVAS_HEIGHT + 250));
	this.radius = Math.floor(Math.random() * 75);		
	
	this.direction;
	if (Math.random() * 2 >= 1)
		this.direction = 0;
	else this.direction = 1;

	this.amplitude	= Math.round(this.radius / 75 * 15 + 2 * Math.random());

	this.velocity = this.radius / 70 + 2 * Math.random() + 0.2;
	
	this.popTimer = 0;
	this.popSegments = 2;
	
}


/******************************************
 * initialize()
 * Initial function called on page load
 *****************************************/

function initialize() {

	// Global variables:
	
	CANVAS_WIDTH = screen.width;
	CANVAS_HEIGHT = screen.height;
	
	REFRESH_RATE = 10;
	
	MAX_BUBBLES = 40;

	
	t = 1;	// current time step
	
	
	// Array storing all bubble objects 
	bubbles = new Array(MAX_BUBBLES);
		
	for (var i = 0; i < MAX_BUBBLES; i++) {
		bubbles[i] = new Bubble();		
	}
		
		
	// Array of bubbles currently being popped
	popping = new Array(5);

	
	// Create canvas and context objects
	canvas = document.getElementById('canvas1');	
	context = canvas.getContext('2d');
	
	// Call the draw() function at the specified refresh interval
	setInterval(draw, REFRESH_RATE);
	
	
	// Add mouse-click callback function
	canvas.addEventListener("click", click, false);
							
	//removeEventListener();

}


/*******************************************************
 * click(e)
 * Click event - makes a bubble pop if mouse is over it
 *******************************************************/
 
function click(e) { 
  					
	//get canvas position and subtract from current mouse position	
	
	var obj = document.getElementById('canvas');
	var left = 0;
	var top = 0;
	if (obj.offsetParent) {
		do {
			left += obj.offsetLeft;
			top += obj.offsetTop;
		} while (obj = obj.offsetParent);	
	}
  
	//var x = (e.clientX - left)+document.documentElement.scrollLeft;
	//var y = (e.clientY - top)+document.documentElement.scrollTop;
	
	var x = (e.clientX - left) + window.pageXOffset
	var y = (e.clientY - top) + window.pageYOffset

								
	var popped = 0;
	
	// Iterate through each bubble and pop the one that is being clicked on, if any							
	for (var i = bubbles.length-1; i >= 0 && popped == 0; i--) {

		if (Math.pow(x - bubbles[i].x, 2) + Math.pow(y - bubbles[i].y, 2) 
				<= Math.pow(bubbles[i].radius, 2)	&& popped == 0) {
		
			var p = 0;
			
			for (var j = 0; j < popping.length; j++)
				if (popping[j+1] == null)
					p = j;
					
										
			popping[p] = bubbles[i];
										
			bubbles[i] = new Bubble();
			bubbles[i].y = CANVAS_HEIGHT + Math.random() * 200 + 75;
										
			popped = 1;
										
			popping[p].popSegments = 2;
										
		}
	}						
}


/******************************************************
 * draw()
 * draws each bubble at every frame
 ******************************************************/
 
function draw() {

	// Update the position of each bubble
	for (var i = 0; i < bubbles.length; i++) {
	
		// Create a new bubble if one has gone off the screen
		if (bubbles[i].y + bubbles[i].radius  < 0) {
			bubbles[i].x = Math.floor(Math.random() * CANVAS_WIDTH);
			bubbles[i].y = Math.floor(Math.random() * CANVAS_HEIGHT) + CANVAS_HEIGHT;
			bubbles[i].radius = Math.floor(Math.random() * 75);	
		}
	

		if (t % bubbles[i].amplitude == 0) {

			if (bubbles[i].direction == 0)
				bubbles[i].direction = 1;
			else
				bubbles[i].direction = 0;
		}
				
		if (bubbles[i].direction == 0)		
			bubbles[i].x -= Math.sin(0.5);
			
		else
			bubbles[i].x += Math.sin(0.5);
			
		bubbles[i].y -= bubbles[i].velocity;
			
	}

	// Clear the previous canvas state
	//context.fillStyle = "rgb(0, 0, 0)";
	canvas.width = screen.availWidth;
	canvas.height = screen.availHeight;
	context.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
	//context.style.backgroundImage = 'url(/images/splash_bg.png)';
	var img = new Image();
    img.src = "assets/images/splash_bg2.png";           
                
                context.drawImage(img, 0, 0);  
	// Draw bubbles that are popping
	for (var i = 0; i < popping.length; i++) {
		
		if (popping[i] != null) {
			
			var segments = 2 * Math.PI * popping[i].popSegments* popping[i].radius / 20;
		
			context.lineWidth = 1;
			
			context.fillStyle = "rgba(215, 215, 215, 0.9)";	
			
			for (var j = 0; j < segments; j = j + popping[i].popSegments) {

				context.beginPath();

				var rand = Math.random();
				
				// Draw random disjointed arcs around perimiter of bubble
				context.arc(popping[i].x, popping[i].y, 
							popping[i].radius + 5 + popping[i].popSegments,
							j * Math.PI*2/segments,
							j * Math.PI*2/segments + rand * Math.PI*2/segments, 
							false);
							
				context.stroke();
				
			}
			
			if (popping[i].popTimer > 1) {
				popping[i] = null;
			}
			else popping[i].popTimer += 1;
					
					
			if (popping[i] != null)		
				popping[i].popSegments += 3;
		
		}
	}
	
	// Draw bubbles
	for (var i = 0; i < bubbles.length; i++) {
		
		context.lineWidth = 1;

		gradObj = context.createRadialGradient(bubbles[i].x + bubbles[i].radius/2 ,
		                                       bubbles[i].y - bubbles[i].radius/2, 0, 
		                                       bubbles[i].x , bubbles[i].y, 
		                                       bubbles[i].radius);
				
		gradObj.addColorStop(0, "rgba(255, 255, 255, .2)");
		gradObj.addColorStop(1, "rgba(215, 215, 215, .1)");
		context.fillStyle = gradObj;
		
		
		context.beginPath();
		context.arc(bubbles[i].x, bubbles[i].y, bubbles[i].radius, 0, Math.PI*2, true); 
		
		context.fill();
		context.strokeStyle = "rgba(206, 206, 206, .9)";
		context.stroke();
		
	}
	
	t++;
  
}

