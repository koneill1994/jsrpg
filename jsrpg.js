


var canvas = document.getElementById('jsrpg');

var ms_frame_delay=30;

var t=0;

var player={
  x: 200,
  y: 200,
  color: '#000000',
  size: 16,
  speed: 4
}

var screen={
  x: 0,
  y: 0
}


objects=[]


num_blocks = 200

for(var i=0; i<num_blocks; i++){
  objects.push(random_block());
}


// keyboard input
keys=[]
window.addEventListener('keydown', function (e) {
  keys = (keys || []);
  keys[e.keyCode] = true;
  o.frequency=e.keyCode;
})
window.addEventListener('keyup', function (e) {
  keys[e.keyCode] = false;
})



function random_block(){
  var block={
    x: roundDownToMult(getRndInteger(0, canvas.width),4),
    y: roundDownToMult(getRndInteger(0, canvas.width),4),
    sizex: roundDownToMult(getRndInteger(8, 128),4),
    sizey: roundDownToMult(getRndInteger(8, 128),4),
    color: "#000000"
  }
  return block;  
}

function roundDownToMult(num, mult){
  r=num%mult;
  return num-r;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
} 

function checkbounds(player, objects){
  for(var i=0; i<objects.length; i++){
    if( ( (player.x > objects[i].x) && (player.x < objects[i].x + objects[i].sizex) ) ||
     (player.x+player.size > objects[i].x) && (player.x+player.size < objects[i].x + objects[i].sizex) ){
       
     if( ( (player.y > objects[i].y) && (player.y < objects[i].y + objects[i].sizey) ) ||
     (player.y+player.size > objects[i].y) && (player.y+player.size < objects[i].y + objects[i].sizey) ){
       
       return false;    
      }
    }
  }
  return true;
}

function checkbounds_movesafe(x1,x2,y1,y2, objects){
  for(var i=0; i<objects.length; i++){
    if(x1 < objects[i].x+objects[i].sizex &&
       x2 > objects[i].x &&
       y1 < objects[i].y+objects[i].sizey &&
       y2 > objects[i].y){
         return false
       }
  }
  return true;
}

function move_safe(player, objects, key){
  if(key==37){
    var x1=player.x-player.speed;
    var x2=player.x+player.size-player.speed;
    var y1=player.y;
    var y2=player.y+player.size;
    if(checkbounds_movesafe(x1,x2,y1,y2, objects)){
      player.x-=player.speed;
    }
  }
  if(key==39){
    var x1=player.x+player.speed;
    var x2=player.x+player.size+player.speed;
    var y1=player.y;
    var y2=player.y+player.size;
    if(checkbounds_movesafe(x1,x2,y1,y2, objects)){
      player.x+=player.speed;
    }
  }
  if(key==38){
    var x1=player.x;
    var x2=player.x+player.size;
    var y1=player.y-player.speed;
    var y2=player.y+player.size-player.speed;
    if(checkbounds_movesafe(x1,x2,y1,y2, objects)){
      player.y-=player.speed;
    }
  }
  if(key==40){
    var x1=player.x;
    var x2=player.x+player.size;
    var y1=player.y+player.speed;
    var y2=player.y+player.size+player.speed;
    if(checkbounds_movesafe(x1,x2,y1,y2, objects)){
      player.y+=player.speed;
    }
  }
}

//rgb color tuple to hexcode string
function clist_to_string(clist){
  s="#";
  for(var i=0; i<clist.length; i++){
    var hex = Math.round(clist[i],2).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    s+=hex;
  }
  return s;
}

function color_pulse(t){
  // two colors to shift between
  c1=[255, 0, 0];
  c2=[0, 0, 255];
  // how long it takes to shift from one color to the other and back
  period = 500;
  // sine wave to determine how much of each shows (normalized from 0 to 1)
  s=(Math.sin((t/period) * 2 * Math.PI)+1)/2;
  // average the two together, proportional to the sine wave value
  c3=[(c1[0]*s + c2[0]*(1-s))/2,
      (c1[1]*s + c2[1]*(1-s))/2,
      (c1[2]*s + c2[2]*(1-s))/2,
  ]
  
  o.frequency.value=1000*((Math.sin((t/period) * 2 * Math.PI)+1)/2)+750;

  
  return clist_to_string(c3)
  
}

var context = new AudioContext()
var o = context.createOscillator()
o.type = "triangle"
o.connect(context.destination)
o.start()


function draw(){
    if (canvas.getContext){
      var ctx = canvas.getContext('2d');
      
      color_pulse(t);
      
      
      if(keys){
      }
      
      
      // blit away previous frame
      //ctx.fillStyle='#e5f442';
      ctx.fillStyle=color_pulse(t);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for(var i=0; i<objects.length; i++){
        ctx.fillStyle = objects[i].color;
        ctx.fillRect(objects[i].x,objects[i].y,objects[i].sizex,objects[i].sizey);
      }

      // change physics in the draw loop because we're smart
      /*
      if (keys && keys[37]) {player.x-=player.speed; }
      if (keys && keys[39]) {player.x+=player.speed; }
      if (keys && keys[38]) {player.y-=player.speed; }
      if (keys && keys[40]) {player.y+=player.speed; }
      */
      

             
      if (keys && keys[37]) {move_safe(player, objects, 37); }
      if (keys && keys[39]) {move_safe(player, objects, 39); }
      if (keys && keys[38]) {move_safe(player, objects, 38); }
      if (keys && keys[40]) {move_safe(player, objects, 40); }
      
      
      if(!checkbounds(player,objects)){
        ctx.fillStyle="#ffffff"
      }
      else{
      ctx.fillStyle = player.color;
      }
      ctx.fillRect(player.x,player.y,player.size,player.size);
      
      
      //iterate time
      t++;
    }
  }
  setInterval(draw,ms_frame_delay)
