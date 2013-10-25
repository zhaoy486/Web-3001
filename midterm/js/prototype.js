var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    myCanvas = document.createElement("canvas"),
    myCtx = myCanvas.getContext("2d"),
    width = 1000,
    height = 1000,
    threshold = 210,
    colors = {r:255,g:0,b:0}, cycle = 0,
    points = [];

canvas.width = myCanvas.width = width;
canvas.height= myCanvas.height= height;

for(var i = 0; i < 2; i++){
    var /*x = Math.random()*width,
        y = Math.random()*height,*/
        x = width/2,//strating x position
        y = height/2,//starting y position
        vx = (Math.random()*8)-4,
        vy = (Math.random()*8)-4,
        size = Math.floor(Math.random()*15+90);
     
    points.push({x:x,y:y,vx:vx,vy:vy, size:size});
}

for(var j = 0; j < 2; j++){
    var /*x = Math.random()*width,
        y = Math.random()*height,*/
        x = width/3,//strating x position
        y = height/3,//starting y position
        vx = (Math.random()*8)-4,
        vy = (Math.random()*8)-4,
        size = Math.floor(Math.random()*15+90);
     
    points.push({x:x,y:y,vx:vx,vy:vy, size:size});
}

for(var a = 0; a < 2; a++){
    var /*x = Math.random()*width,
        y = Math.random()*height,*/
        x = width-200,//strating x position
        y = 150,//starting y position
        vx = (Math.random()*20)-4,
        vy = (Math.random()*20)-4,
        size = Math.floor(Math.random()*15+90);
     
    points.push({x:x,y:y,vx:vx,vy:vy, size:size});
}

for(var b = 0; b < 2; b++){
    var /*x = Math.random()*width,
        y = Math.random()*height,*/
        x = 200,//strating x position
        y = 450,//starting y position
        vx = (Math.random()*20)-4,
        vy = (Math.random()*20)-4,
        size = Math.floor(Math.random()*15+90);
     
    points.push({x:x,y:y,vx:vx,vy:vy, size:size});
}

function update(){
    var len = points.length;
  console.log(points.length);
    myCtx.clearRect(0,0,width,height);
    while(len--){
        var point = points[len];
        point.x+=point.vx*0.08;//moving speed
        point.y+=point.vy*0.08;
        
        if(point.x > width-point.size){
            point.vx=point.vx*(-1);
            point.vy=point.vy*(-1);
        }
        if(point.x < 0+point.size){
            point.vx=point.vx*(-1);
            point.vy=point.vy*(-1);
        }
        if(point.y > height-point.size){
            point.vx=point.vx*(-1);
            point.vy=point.vy*(-1);
        }
        if(point.y < 0+point.size){
            point.vx=point.vx*(-1);
            point.vy=point.vy*(-1);
       }
      
      
     
        myCtx.beginPath();
        var grad = myCtx.createRadialGradient(point.x, point.y, 1, point.x, point.y, point.size);
        grad.addColorStop(0, 'rgba(' + colors.r +',' + colors.g + ',' + colors.b + ',1)');
        grad.addColorStop(1, 'rgba(' + colors.r +',' + colors.g + ',' + colors.b + ',0)');
        myCtx.fillStyle = grad;
        myCtx.arc(point.x, point.y, point.size, 0, Math.PI*2);
        myCtx.fill();
     
    }
  myCtx.beginPath();
	
	grad = myCtx.createRadialGradient(
	 mouseCircle.x,mouseCircle.y,1,
	 mouseCircle.x,mouseCircle.y,mouseCircle.size
	);
	grad.addColorStop(0,'rgba(0,0,0,1)');
	grad.addColorStop(1,'rgba(0,0,0,0)');
	myCtx.fillStyle = grad;
	myCtx.arc(mouseCircle.x,mouseCircle.y,800,0,Math.PI*2);
	myCtx.fill();
    metabalize();
   
    setTimeout(update,10);
}




function metabalize(){
    var imageData = myCtx.getImageData(0,0,width,height),
        pix = imageData.data;
    
    for (var i = 0, n = pix.length; i <n; i += 4) {
        if(pix[i+3]<threshold){
           pix[i+3]/=6;
            if(pix[i+3]>threshold/4){
                pix[i+3]=0;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);    
}

var mouseCircle = {
		size:40,
		x:0,
		y:0
	};
var mouseMove = function(e){
	mouseCircle.x = e.layerX;
	mouseCircle.y = e.layerY;
};
canvas.addEventListener('mousemove',mouseMove);



update();

