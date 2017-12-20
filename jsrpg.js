


var canvas = document.getElementById('jsrpg');

var ms_frame_delay=30;

var t=0;

var chunksize=512

var rseed = 1;

var player={
  x: -200,
  y: -200,
  color: '#ffffff',
  size: 16,
  speed: 4
}

var screen={
  x: -50,
  y: -100
}

var mouse ={
  x: canvas.width/2,
  y: canvas.height/2
}

var objects=[]


num_blocks = 25

for(var i=0; i<num_blocks; i++){
  objects.push(random_block());
}

gburg = "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this."


// testing chunk code

var active_chunks=[]
/*
for(var x=-2; x<4; x++){
  for(var y=-2  ; y<4; y++){
    active_chunks.push(generate_chunk(x,y,chunksize));
  }
}*/

//active_chunks.push(generate_chunk(0,0,chunksize));

// end chunk test


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

// recalculate nearby chunks based on the central chunk's coords
function recalculate_active_chunks(c_chunkx,c_chunky){
  active_chunks=[]
  for(var i=c_chunkx-3; i<c_chunkx+3; i++){
    for(var j=c_chunky-3  ; j<c_chunky+3; j++){
      c=generate_chunk(i,j,chunksize);
      active_chunks.push(c);
      objects=objects.concat(c.blocks)
    }
  }
  console.log(objects)
}

function get_chunk_location(player, chunksize){
  return [Math.floor(player.x/chunksize),Math.floor(player.y/chunksize)]
}

function generate_chunk(x,y, chunksize){
  var chunk = {
    chunkx: x,
    chunky: y,
    xcoord: x*chunksize,
    ycoord: y*chunksize,
    seed: cantor(x,y),
    blocks: generate_chunk_blocks(x*chunksize, y*chunksize, num_blocks, cantor(x,y), chunksize),
  }
  return chunk;
}

function generate_chunk_blocks(xcoord, ycoord, num, seed, chunksize){
  rseed=seed;
  b=[]
  for(var i=0; i<num; i++){
    b.push(det_random_block(xcoord, xcoord+chunksize, ycoord, ycoord+chunksize));
  }
  return b;
}

function det_random_block(x1,x2,y1,y2){
  var block={
    x: roundDownToMult(getdetRndInteger(x1, x2),4),
    y: roundDownToMult(getdetRndInteger(y1, y2),4),
    sizex: roundDownToMult(getdetRndInteger(8, 128),4),
    sizey: roundDownToMult(getdetRndInteger(8, 128),4),
    color: "#000000"
  }
  return block;  
}

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

function getdetRndInteger(min, max) {
    return Math.floor(seedrandom() * (max - min) ) + min;
} 

function seedrandom() {
    var x = Math.sin(rseed++) * 10000;
    return x - Math.floor(x);
}

//check if the object is colliding with anything else
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

//move the player while avoiding colliding with things in objects
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
  //o.frequency.value=1000*((Math.sin((t/period) * 2 * Math.PI)+1)/2)+750;
  return clist_to_string(c3)
  
}

// turns global (worldmap) coordinates into local (on-screen) coordinates
function global2local(obj, screen){
  var scoords={
    x: obj.x-screen.x,
    y: obj.y-screen.y,
  }
  return scoords
}

// turns local (on-screen) coordinates into global (worldmap) coordinates
function local2global(obj, screen){
  var scoords={
    x: obj.x+screen.x,
    y: obj.y+screen.y,
  }
  return scoords
}

//cantor pairing function
function cantor(k1, k2){
  return (k1+k2)*(k1+k2+1)/2 + k2
}

// get mouse's local coordinates
function mouse_position(event){
  var rect = canvas.getBoundingClientRect();
  mouse.x= event.clientX - rect.left;     // Get the horizontal coordinate
  mouse.y= event.clientY - rect.top;     // Get the vertical coordinate
}

// update screen position, centered halfway between the player and the mouse
function UpdateScreenPos(player){
  m_screen = local2global(mouse, screen)
  screen.x = ((player.x + player.size/2)+(m_screen.x))/2 - (canvas.width/2);
  screen.y = ((player.y + player.size/2)+(m_screen.y))/2 - (canvas.height/2);
  
}

//wrap text around based on text box size
function stringwrap(ctx, boxwidth, boxheight, text){
  strings=[]
  space=ctx.measureText(" ").width
  words=(text+" ").split(" ")
  linesum=0
  line=[]
  for(var i=0; i<words.length; i++){
    w=ctx.measureText(words[i]).width;
    if(linesum+space+w > boxwidth || i==words.length-1){
      strings.push(line.join(" "));
      line=[words[i]]
      linesum=w+space
    }
    else{
      line.push(words[i])
      linesum+=w+space
    }
  } 
  return strings
}


function DrawTextBox(display, ctx, text, t, text_start){
  if(t-text_start - 100 > text.length || text.length == 0){
    tstart=false;
  }
  if(display){
    fontSize=20;
    
    text_new = text.substring(0, t-text_start)
    
    ctx.fillStyle = "#444444";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(50,canvas.height-300,canvas.width-100,250);
    ctx.globalAlpha = 1.0;
    
    
    ctx.fillStyle = "#ffffff"
    ctx.font = fontSize+'px Arial';
    
    var strings = stringwrap(ctx, canvas.width-150, 250, text_new); //parameterize these later
    for(var i=0; i<strings.length; i++){
      ctx.fillText(strings[i], 80, canvas.height-270 + (fontSize * i));
    }
  }
}


var context = new AudioContext()
var o = context.createOscillator()
o.type = "triangle"
o.connect(context.destination)
//o.start()


var tstart=false;
var text_t = 0;
var drawtext=false

var player_chunk_location=[0,0]
var oldchunkloc=[-999,-999]

function draw(){
    if (canvas.getContext){
      var ctx = canvas.getContext('2d');
      
      color_pulse(t);
      
      oldchunkloc=player_chunk_location
      player_chunk_location=get_chunk_location(player, chunksize)
      if(oldchunkloc[0]!=player_chunk_location[0] || oldchunkloc[1]!=player_chunk_location[1]){
        recalculate_active_chunks(player_chunk_location[0],player_chunk_location[1]); 
        console.log("recalculating")
      }
      
      UpdateScreenPos(player);
      
      // blit away previous frame
      //ctx.fillStyle='#e5f442';
      ctx.fillStyle=color_pulse(t);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for(var i=0; i<active_chunks.length; i++){
        for(var j=0; j<active_chunks[i].blocks.length; j++){
          ctx.fillStyle = active_chunks[i].blocks[j].color;
          scoord=global2local(active_chunks[i].blocks[j],screen);
          ctx.fillRect(scoord.x,scoord.y,active_chunks[i].blocks[j].sizex,active_chunks[i].blocks[j].sizey);
        }
      }
      

      // change physics in the draw loop because we're smart
      if (keys && (keys[37] || keys[65])) {move_safe(player, objects, 37); }
      if (keys && (keys[39] || keys[68])) {move_safe(player, objects, 39); }
      if (keys && (keys[38] || keys[87])) {move_safe(player, objects, 38); }
      if (keys && (keys[40] || keys[83])) {move_safe(player, objects, 40); }
      
      // text box test
      if (keys && keys[32]) {
        if(!tstart){
          text_t=t;
          tstart=!tstart;
        }
      }
      

      ctx.fillStyle = player.color;
      scoord = global2local(player, screen);
      ctx.fillRect(scoord.x,scoord.y,player.size,player.size);
      
      DrawTextBox(tstart, ctx, gburg, t, text_t)
      
      //iterate time
      t++;
    }
  }
  setInterval(draw,ms_frame_delay)
