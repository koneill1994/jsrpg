
// js doesn't easily support importing other js files
// so this will have to do
function Perlin(seed) {
    
    // This is fugly as hell. I simply cut, pasted, and wrapped it with 
// a simple interface. Sorry! -wwwtyro
// https://github.com/wwwtyro/perlin.js

    
// Alea random number generator.
//----------------------------------------------------------------------------//

    // From http://baagoe.com/en/RandomMusings/javascript/
    function Alea() {
      return (function(args) {
        // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
        var s0 = 0;
        var s1 = 0;
        var s2 = 0;
        var c = 1;

        if (args.length == 0) {
          args = [+new Date];
        }
        var mash = Mash();
        s0 = mash(' ');
        s1 = mash(' ');
        s2 = mash(' ');

        for (var i = 0; i < args.length; i++) {
          s0 -= mash(args[i]);
          if (s0 < 0) {
            s0 += 1;
          }
          s1 -= mash(args[i]);
          if (s1 < 0) {
            s1 += 1;
          }
          s2 -= mash(args[i]);
          if (s2 < 0) {
            s2 += 1;
          }
        }
        mash = null;

        var random = function() {
          var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
          s0 = s1;
          s1 = s2;
          return s2 = t - (c = t | 0);
        };
        random.uint32 = function() {
          return random() * 0x100000000; // 2^32
        };
        random.fract53 = function() {
          return random() + 
            (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
        };
        random.version = 'Alea 0.9';
        random.args = args;
        return random;

      } (Array.prototype.slice.call(arguments)));
    };

    // From http://baagoe.com/en/RandomMusings/javascript/
    // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
    function Mash() {
      var n = 0xefc8249d;

      var mash = function(data) {
        data = data.toString();
        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
      };

      mash.version = 'Mash 0.9';
      return mash;
    }

// Simplex perlin noise.
//----------------------------------------------------------------------------//

    // Ported from Stefan Gustavson's java implementation
    // http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
    // Read Stefan's excellent paper for details on how this code works.
    //
    // Sean McCullough banksean@gmail.com

    /**
     * You can pass in a random number generator object if you like.
     * It is assumed to have a random() method.
     */
    var SimplexNoise = function(r) {
	    if (r == undefined) r = Math;
      this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                     [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                     [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
      this.p = [];
      for (var i=0; i<256; i++) {
	      this.p[i] = Math.floor(r.random()*256);
      }
      // To remove the need for index wrapping, double the permutation table length 
      this.perm = []; 
      for(var i=0; i<512; i++) {
		    this.perm[i]=this.p[i & 255];
	    } 

      // A lookup table to traverse the simplex around a given point in 4D. 
      // Details can be found where this table is used, in the 4D noise method. 
      this.simplex = [ 
        [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
        [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
        [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
        [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
        [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
        [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
        [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
        [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
    };

    SimplexNoise.prototype.dot = function(g, x, y) { 
	    return g[0]*x + g[1]*y;
    };

    SimplexNoise.prototype.noise = function(xin, yin) { 
      var n0, n1, n2; // Noise contributions from the three corners 
      // Skew the input space to determine which simplex cell we're in 
      var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
      var s = (xin+yin)*F2; // Hairy factor for 2D 
      var i = Math.floor(xin+s); 
      var j = Math.floor(yin+s); 
      var G2 = (3.0-Math.sqrt(3.0))/6.0; 
      var t = (i+j)*G2; 
      var X0 = i-t; // Unskew the cell origin back to (x,y) space 
      var Y0 = j-t; 
      var x0 = xin-X0; // The x,y distances from the cell origin 
      var y0 = yin-Y0; 
      // For the 2D case, the simplex shape is an equilateral triangle. 
      // Determine which simplex we are in. 
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
      if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
      else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
      // c = (3-sqrt(3))/6 
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
      var y1 = y0 - j1 + G2; 
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
      var y2 = y0 - 1.0 + 2.0 * G2; 
      // Work out the hashed gradient indices of the three simplex corners 
      var ii = i & 255; 
      var jj = j & 255; 
      var gi0 = this.perm[ii+this.perm[jj]] % 12; 
      var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
      var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
      // Calculate the contribution from the three corners 
      var t0 = 0.5 - x0*x0-y0*y0; 
      if(t0<0) n0 = 0.0; 
      else { 
        t0 *= t0; 
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
      } 
      var t1 = 0.5 - x1*x1-y1*y1; 
      if(t1<0) n1 = 0.0; 
      else { 
        t1 *= t1; 
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
      }
      var t2 = 0.5 - x2*x2-y2*y2; 
      if(t2<0) n2 = 0.0; 
      else { 
        t2 *= t2; 
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
      } 
      // Add contributions from each corner to get the final noise value. 
      // The result is scaled to return values in the interval [-1,1]. 
      return 70.0 * (n0 + n1 + n2); 
    };

    // 3D simplex noise 
    SimplexNoise.prototype.noise3d = function(xin, yin, zin) { 
      var n0, n1, n2, n3; // Noise contributions from the four corners 
      // Skew the input space to determine which simplex cell we're in 
      var F3 = 1.0/3.0; 
      var s = (xin+yin+zin)*F3; // Very nice and simple skew factor for 3D 
      var i = Math.floor(xin+s); 
      var j = Math.floor(yin+s); 
      var k = Math.floor(zin+s); 
      var G3 = 1.0/6.0; // Very nice and simple unskew factor, too 
      var t = (i+j+k)*G3; 
      var X0 = i-t; // Unskew the cell origin back to (x,y,z) space 
      var Y0 = j-t; 
      var Z0 = k-t; 
      var x0 = xin-X0; // The x,y,z distances from the cell origin 
      var y0 = yin-Y0; 
      var z0 = zin-Z0; 
      // For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
      // Determine which simplex we are in. 
      var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords 
      var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords 
      if(x0>=y0) { 
        if(y0>=z0) 
          { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order 
          else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order 
          else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order 
        } 
      else { // x0<y0 
        if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order 
        else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order 
        else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order 
      } 
      // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
      // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
      // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
      // c = 1/6.
      var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords 
      var y1 = y0 - j1 + G3; 
      var z1 = z0 - k1 + G3; 
      var x2 = x0 - i2 + 2.0*G3; // Offsets for third corner in (x,y,z) coords 
      var y2 = y0 - j2 + 2.0*G3; 
      var z2 = z0 - k2 + 2.0*G3; 
      var x3 = x0 - 1.0 + 3.0*G3; // Offsets for last corner in (x,y,z) coords 
      var y3 = y0 - 1.0 + 3.0*G3; 
      var z3 = z0 - 1.0 + 3.0*G3; 
      // Work out the hashed gradient indices of the four simplex corners 
      var ii = i & 255; 
      var jj = j & 255; 
      var kk = k & 255; 
      var gi0 = this.perm[ii+this.perm[jj+this.perm[kk]]] % 12; 
      var gi1 = this.perm[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]] % 12; 
      var gi2 = this.perm[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]] % 12; 
      var gi3 = this.perm[ii+1+this.perm[jj+1+this.perm[kk+1]]] % 12; 
      // Calculate the contribution from the four corners 
      var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; 
      if(t0<0) n0 = 0.0; 
      else { 
        t0 *= t0; 
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0); 
      }
      var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; 
      if(t1<0) n1 = 0.0; 
      else { 
        t1 *= t1; 
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1); 
      } 
      var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; 
      if(t2<0) n2 = 0.0; 
      else { 
        t2 *= t2; 
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2); 
      } 
      var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; 
      if(t3<0) n3 = 0.0; 
      else { 
        t3 *= t3; 
        n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3); 
      } 
      // Add contributions from each corner to get the final noise value. 
      // The result is scaled to stay just inside [-1,1] 
      return 32.0*(n0 + n1 + n2 + n3); 
    };

// Classic Perlin noise, 3D version 
//----------------------------------------------------------------------------//

    var ClassicalNoise = function(r) { // Classic Perlin noise in 3D, for comparison 
	    if (r == undefined) r = Math;
      this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                     [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                     [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
      this.p = [];
      for (var i=0; i<256; i++) {
	      this.p[i] = Math.floor(r.random()*256);
      }
      // To remove the need for index wrapping, double the permutation table length 
      this.perm = []; 
      for(var i=0; i<512; i++) {
		    this.perm[i]=this.p[i & 255];
      }
    };

    ClassicalNoise.prototype.dot = function(g, x, y, z) { 
        return g[0]*x + g[1]*y + g[2]*z; 
    };

    ClassicalNoise.prototype.mix = function(a, b, t) { 
        return (1.0-t)*a + t*b; 
    };

    ClassicalNoise.prototype.fade = function(t) { 
        return t*t*t*(t*(t*6.0-15.0)+10.0); 
    };

    ClassicalNoise.prototype.noise = function(x, y, z) { 
      // Find unit grid cell containing point 
      var X = Math.floor(x); 
      var Y = Math.floor(y); 
      var Z = Math.floor(z); 
      
      // Get relative xyz coordinates of point within that cell 
      x = x - X; 
      y = y - Y; 
      z = z - Z; 
      
      // Wrap the integer cells at 255 (smaller integer period can be introduced here) 
      X = X & 255; 
      Y = Y & 255; 
      Z = Z & 255;
      
      // Calculate a set of eight hashed gradient indices 
      var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12; 
      var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12; 
      var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12; 
      var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12; 
      var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12; 
      var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12; 
      var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12; 
      var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12; 
      
      // The gradients of each corner are now: 
      // g000 = grad3[gi000]; 
      // g001 = grad3[gi001]; 
      // g010 = grad3[gi010]; 
      // g011 = grad3[gi011]; 
      // g100 = grad3[gi100]; 
      // g101 = grad3[gi101]; 
      // g110 = grad3[gi110]; 
      // g111 = grad3[gi111]; 
      // Calculate noise contributions from each of the eight corners 
      var n000= this.dot(this.grad3[gi000], x, y, z); 
      var n100= this.dot(this.grad3[gi100], x-1, y, z); 
      var n010= this.dot(this.grad3[gi010], x, y-1, z); 
      var n110= this.dot(this.grad3[gi110], x-1, y-1, z); 
      var n001= this.dot(this.grad3[gi001], x, y, z-1); 
      var n101= this.dot(this.grad3[gi101], x-1, y, z-1); 
      var n011= this.dot(this.grad3[gi011], x, y-1, z-1); 
      var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1); 
      // Compute the fade curve value for each of x, y, z 
      var u = this.fade(x); 
      var v = this.fade(y); 
      var w = this.fade(z); 
       // Interpolate along x the contributions from each of the corners 
      var nx00 = this.mix(n000, n100, u); 
      var nx01 = this.mix(n001, n101, u); 
      var nx10 = this.mix(n010, n110, u); 
      var nx11 = this.mix(n011, n111, u); 
      // Interpolate the four results along y 
      var nxy0 = this.mix(nx00, nx10, v); 
      var nxy1 = this.mix(nx01, nx11, v); 
      // Interpolate the two last results along z 
      var nxyz = this.mix(nxy0, nxy1, w); 

      return nxyz; 
    };


//----------------------------------------------------------------------------//


    var rand = {};
    rand.random = new Alea(seed);
    var noise = new ClassicalNoise(rand);
    
    this.noise = function (x, y, z) {
        return 0.5 * noise.noise(x, y, z) + 0.5;
    }
    
}


var pn = new Perlin('random seed');
// usage:
// pn.noise(100,200,0); // x,y,z

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


num_blocks = 4

gburg = "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this."


var active_chunks=[]

chunk_range=2



// keyboard input
keys=[]
keypress=[]
kd=false;
window.addEventListener('keypress', function (e) {
  if(kd==false){
    console.log("key fire: "+e.keyCode);
    keypress = (keypress || []);
    keypress[e.keyCode] = true;
    kd=true; // this is a mess, needs to be specific to the individual key
  }
})
window.addEventListener('keydown', function (e) {
  keys = (keys || []);
  keys[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
  keys[e.keyCode] = false;
  kd=false;
})






// generate perlin image
// pn.noise(100,200,0); // x,y,z
function generate_noise_image(x,y,w,h,ctx){
  scale=.1
  var id = ctx.getImageData(x,y,w,h);
  for(var i=0; i<id.data.length; i+=4){
    xcoord=scale*((i/4)%w+x);
    ycoord=scale*(Math.floor((i/4)/w)+y);
    id.data[i]     = pn.noise(xcoord,ycoord,0)*255; // red
    id.data[i + 1] = pn.noise(xcoord,ycoord,0)*255; // green
    id.data[i + 2] = pn.noise(xcoord,ycoord,0)*255; // blue
    id.data[i+3]   = 255;
  }
  ctx.putImageData(id, 25,25);
}

function color_from_elevation(elevation){
  //console.log(elevation)
  if(elevation < 0.2){
    return [247, 234, 140]
  }
  if(elevation < 0.4){
    return [106, 224, 51]
  }
  if(elevation < 0.6){
    return [113, 158, 119]
  }
  if(elevation < 0.8){
    return [148, 158, 149]
  }
  else{
    return [244, 247, 245]
  }  
}


// this function takes freakin forever
function generate_noise_octave(x,y,w,h){
  scales=[4.7,1.3,.1]
  ratios=[.166, .33,.5]
  //scales=[.1]
  //ratios=[1]
  //var id = ctx.getImageData(x,y,w,h);
  id=new Uint8ClampedArray(w*h*4);
  for(var i=0; i<id.length; i+=4){
    xcoord=((i/4)%w+x);
    ycoord=(Math.floor((i/4)/w)+y);
    var e=0;
    for(j=0; j<scales.length; j++){
      //console.log("{"+xcoord+","+ycoord+"): "+j);
      e+=ratios[j]*pn.noise(xcoord*scales[j],ycoord*scales[j],0)
    }
    col=color_from_elevation(e)
    id[i]     = col[0]; // red
    id[i + 1] = col[1]; // green
    id[i + 2] = col[2]; // blue
    id[i+3]   = 255;
  }
  return id;
}


// recalculate nearby chunks based on the central chunk's coords
function recalculate_active_chunks(c_chunkx,c_chunky){
  active_chunks=[]
  range=2
  for(var i=c_chunkx-range; i<c_chunkx+range; i++){
    for(var j=c_chunky-range  ; j<c_chunky+range; j++){
      c=generate_chunk(i,j,chunksize);
      active_chunks.push(c);
      objects=objects.concat(c.blocks)
    }
  }
}

// a version of the function which will only re-generate chunks if they are new
function recalculate_active_chunks_efficient(c_chunkx,c_chunky,active_chunks){
  active_chunks_new=[]
  
  coord_pairs=[]
  
  for(var i=c_chunkx-chunk_range; i<c_chunkx+chunk_range; i++){
    for(var j=c_chunky-chunk_range  ; j<c_chunky+chunk_range; j++){
      coord_pairs.push([i,j])
    }
  }
  
  // first remove old ones
  // (i.e. add the ones we're keeping to the new array
  for(var i=0; i<active_chunks.length; i++){
    if(!(Math.abs(active_chunks[i].chunkx - c_chunkx) > chunk_range ||
        Math.abs(active_chunks[i].chunky - c_chunky) > chunk_range)){
      active_chunks_new.push(active_chunks[i]);
      // remove those coords from coord pairs, since we dont need to gen them
      for(m=0; m<coord_pairs.length; m++){
        if(coord_pairs[m][0] == active_chunks[i].chunkx && coord_pairs[m][1] == active_chunks[i].chunky){
          coord_pairs.splice(m,1);
          break;
        }
      }
    }
  }
  
  for(n=0;n<coord_pairs.length;n++){
    pos=coord_pairs[n]
    c=generate_chunk(pos[0],pos[1],chunksize);
    active_chunks.push(c);
    objects=objects.concat(c.blocks)
  }
  
  active_chunks=active_chunks_new;
}


// figure out what the chunk coordinates are for the chunk the player is currently in
function get_chunk_location(player, chunksize){
  return [Math.floor(player.x/chunksize),Math.floor(player.y/chunksize)]
}

function generate_chunk(xpos,ypos, chunksize){
  var chunk = {
    chunkx: xpos,
    chunky: ypos,
    x: xpos*chunksize,
    y: ypos*chunksize,
    seed: cantor(xpos,ypos),
    blocks: generate_chunk_blocks(xpos*chunksize, ypos*chunksize, num_blocks, cantor(xpos,ypos), chunksize),
    //terrain: new ImageData(generate_noise_octave(xpos*chunksize, ypos*chunksize, chunksize, chunksize),chunksize,chunksize), // try moving this to a separate thread (web worker?)
  }
  multithread_terrain_gen(chunk);
  return chunk;
}

function multithread_terrain_gen(chunk){
  var worker = new Worker('maketerrain.js');
  worker.onmessage = function(e) {
      chunk.terrain = e.data.terrain;
  };
  worker.postMessage({'xpos':chunk.chunkx,
                      'ypos':chunk.chunky,
                      'chunksize':chunksize});
}

// generate the objects within a chunk
function generate_chunk_blocks(xcoord, ycoord, num, seed, chunksize){
  rseed=seed;
  b=[]
  for(var i=0; i<num; i++){
    b.push(det_random_block(xcoord, xcoord+chunksize, ycoord, ycoord+chunksize));
  }
  return b;
}

// generate a random block deterministically
function det_random_block(x1,x2,y1,y2){
  var block={
    x: roundDownToMult(getdetRndInteger(x1, x2),4),
    y: roundDownToMult(getdetRndInteger(y1, y2),4),
    sizex: roundDownToMult(getdetRndInteger(8, 64),4),
    sizey: roundDownToMult(getdetRndInteger(8, 64),4),
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

// deterministic random number gen (js doesn't let you set the seed)
function seedrandom() {
    var x = Math.sin(rseed++) * 10000;
    return x - Math.floor(x);
}

// check if 2 rectangles collide
// 1 and 2 are the objects
// x and y are the start coords, and sx and sy are the sizes
function check_collide_general(x1,sx1,y1,sy1, x2, sx2, y2, sy2){
  if(x1 < x2+sx2 &&
     x1+sx1 > x2 &&
     y1 < y2+sy2 &&
     y1+sy1 > y2){
     return true; // yes they do collide
  }
  return false; // no they do not collide
}

//check if the object is colliding with anything else
function checkbounds_movesafe(x1,x2,y1,y2, objects){
  for(var i=0; i<objects.length; i++){
    if(x1 < objects[i].x+objects[i].sizex &&
       x2 > objects[i].x &&
       y1 < objects[i].y+objects[i].sizey &&
       y2 > objects[i].y){
         return false; // no, it is not a safe move
       }
  }
  return true; // yes it is a safe move
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
// does not necessarily work as intended for negative numbers
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
    paused=false;
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
var drawtext=false;

var paused=false;

var player_chunk_location=[0,0]
var oldchunkloc=[-999,-999]

//recalculate_active_chunks_efficient(c_chunkx,c_chunky,active_chunks

recalculate_active_chunks_efficient(player_chunk_location[0],player_chunk_location[1],active_chunks); 

// optimization idea: only draw images within the screen's bounding area


// idea: encode number & type of objects within each chunk
//   in relation to the biome of that chunk


function draw(){
    if (canvas.getContext){
      var ctx = canvas.getContext('2d');
      
      color_pulse(t);
      
      player_chunk_location=get_chunk_location(player, chunksize)
      if(oldchunkloc[0]!=player_chunk_location[0] || oldchunkloc[1]!=player_chunk_location[1]){
        recalculate_active_chunks_efficient(player_chunk_location[0],player_chunk_location[1],active_chunks); 
        oldchunkloc=player_chunk_location
      }
      
      if(!paused){
        UpdateScreenPos(player);
      }
      
      // blit away previous frame
      //ctx.fillStyle='#e5f442';
      ctx.fillStyle=color_pulse(t);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      /*
      //testing perlin noise 
      generate_noise_image(screen.x+25,screen.y+25,100,100,ctx);
      */
      
      
      // draw all the backgrounds before we draw the objects
      // it takes forever
      // and also doesn't even show the chunks
      for(var i=0; i<active_chunks.length; i++){
        obj=active_chunks[i]
        //console.log(obj.x+","+obj.y);
        /*
        if(check_collide_general(obj.x,obj.chunksize,obj.y,obj.chunksize, 
          screen.x, canvas.width, screen.y, canvas.height)){ // only draw if on-screen
          * */
        if(obj.terrain){
          localcoords=global2local(obj, screen);
          ctx.putImageData(obj.terrain, localcoords.x, localcoords.y);
        }
      }
      
      // draw all the non-player objects
      for(var i=0; i<active_chunks.length; i++){
        for(var j=0; j<active_chunks[i].blocks.length; j++){
          obj = active_chunks[i].blocks[j]
          if(check_collide_general(obj.x,obj.sizex,obj.y,obj.sizey, 
          screen.x, canvas.width, screen.y, canvas.height)){ // if its off-screen, don't bother trying to draw it
            ctx.fillStyle = active_chunks[i].blocks[j].color;
            scoord=global2local(active_chunks[i].blocks[j],screen);
            ctx.fillRect(scoord.x,scoord.y,active_chunks[i].blocks[j].sizex,active_chunks[i].blocks[j].sizey);
          }
        }
      }
      
      if(!paused){
        // change physics in the draw loop because we're smart
        // (control w/ arrow keys (37-40) or wasd
        if (keys && (keys[37] || keys[65])) {move_safe(player, objects, 37); }
        if (keys && (keys[39] || keys[68])) {move_safe(player, objects, 39); }
        if (keys && (keys[38] || keys[87])) {move_safe(player, objects, 38); }
        if (keys && (keys[40] || keys[83])) {move_safe(player, objects, 40); }
      }
      
      // text box test
      if (keypress && keypress[32]) {
        keypress[32] = false;
        if(!tstart){
          text_t=t;
          tstart=!tstart;
          paused=true;
        }
        else{
          tstart=!tstart;
          paused=false;
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
