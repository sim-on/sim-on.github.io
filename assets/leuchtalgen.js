/*---------Basic arrays and constants---------*/

var N = 54; // Seems to work well on my machines & phone. Make this changeable, maybe.
var size = (N + 2);
var u = new Array(size);
var v = new Array(size);
var uPrev = new Array(size);
var vPrev = new Array(size);
var dens = new Array(size);
var densPrev = new Array(size);

/*--------------Drawing functions-------------*/

function CellDimensions() {
    this.calculate = function() {
        this.dimensionX = canvasWidth / (N + 2);
        this.dimensionY = canvasHeight / (N + 2);
    }
}

function updateImage(array) {
    var r, g, b;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    //ctx.save();
    var wi = Math.ceil(cellDimensions.dimensionX);
    var he = Math.ceil(cellDimensions.dimensionY);
    for (var j = array.length - 1; j >= 0; j--) {
        for (var i = array.length - 1; i >= 0; i--) {
            r = 0;
            g = 60;
            b = 60;
            var x = Math.floor(i * wi);
            var y = Math.floor(j * he);
            var d = array[i][j];
            g += Math.floor(Math.sqrt(u[i][j] * u[i][j] + v[i][j] * v[i][j]) * 50);
            b += Math.floor(Math.sqrt(u[i][j] * u[i][j] + v[i][j] * v[i][j]) * 50);
            if (g > 255) { g = 255; }
            if (b > 255) { b = 255; }

            ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + d + ")";
            ctx.fillRect(x, y, wi, he);
        }
    }
}

function resizeCanvas() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    cellDimensions.calculate();
}

function ev_mousemove(ev) {
    drawDensity(ev);
}

function ev_mousedown(ev) {
    mouseIsDown = true;
    drawDensity(ev);
}

function ev_mouseup(ev) {
    mouseIsDown = false;
}

function drawDensity(ev) {
    var x, y;
    // Get the mouse position relative to the <canvas> element
    if (ev.layerX || ev.layerX == 0) { // Firefox
        x = ev.layerX;
        y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
        x = ev.offsetX;
        y = ev.offsetY;
    }
    var dx = x - prevEventX;
    var dy = y - prevEventY;
    gridXYValues = new getGridXY(x, y);
    var xi = gridXYValues.X;
    var yi = gridXYValues.Y;
    addDensity(xi, yi, 1, dens);

    if (mouseIsDown) {
        addVelocity(xi, yi, 2 * dx, 2 * dy);
    }
    prevEventX = x;
    prevEventY = y;
}

function getGridXY(x, y) {
    this.X = Math.floor(x / cellDimensions.dimensionX);
    this.Y = Math.floor(y / cellDimensions.dimensionY);

    /*	var arrayCoords = new Array();
    	arrayCoords.push(Math.floor(x / cellDimensions.dimensionX));
    	arrayCoords.push(Math.floor(y / cellDimensions.dimensionY));
    	return arrayCoords;*/
}

// Draw data into the canvas (old, greyscale)
/*function updateImage_old(array) {
		for (var y = 0; y < canvasHeight; ++y) {
	    for (var x = 0; x < canvasWidth; ++x) {
	        var index = (y * canvasWidth + x) * 4;

	        //var value = x * y & 0xff;
	        var value = (array[y][x] * 250) & 0xff;

	        data[index]   = value;    // red
	        data[++index] = value;    // green
	        data[++index] = value;    // blue
	        data[++index] = 255;      // alpha
	    }
	}
	ctx.putImageData(imageData, 0, 0);
}*/


/*------------Simulation functions------------*/

function swapVelocity() {
    var tempU = u;
    var tempV = v;
    u = uPrev;
    v = vPrev;
    uPrev = tempU;
    vPrev = tempV;
}

function swapDensity() {
    var temp = dens;
    dens = densPrev;
    densPrev = temp;
}

function initializeArrays() {
    // initialize arrays (2D) with empty arrays / zeros
    for (var i = 0; i < size; i++) {
        u[i] = [];
        v[i] = [];
        uPrev[i] = [];
        vPrev[i] = [];
        dens[i] = [];
        densPrev[i] = [];
    }

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            u[i][j] = 0;
            v[i][j] = 0;
            uPrev[i][j] = 0;
            vPrev[i][j] = 0;
            dens[i][j] = 0;
            densPrev[i][j] = 0;
        }
    }
}

function addSource(N, x, s, dt) {
    for (var i = 1; i < (N + 1); i++) {
        for (var j = 1; j < (N + 1); j++) {
            x[i][j] += dt * s[i][j];
        }
    }
}

function diffuse(N, b, x, x0, diff, dt) {
    var a = dt * diff * N * N;
    for (var k = 0; k < 20; k++) {
        for (var i = 1; i <= N; i++) {
            for (var j = 1; j <= N; j++) {
                x[i][j] = (x0[i][j] + a * (x[i - 1][j] + x[i + 1][j] + x[i][j - 1] + x[i][j + 1])) / (1 + (4.05 * a));
            }
        }
        setBoundaryConditions(N, b, x);
    }
}

function advect(N, b, d, d0, u, v, dt) {
    var i0;
    var j0;
    var i1;
    var j1;
    var x;
    var y;
    var s1;
    var t1;
    var dt0 = dt * N;

    for (var i = 1; i <= N; i++) {
        for (var j = 1; j <= N; j++) {
            x = i - dt0 * u[i][j];
            y = j - dt0 * v[i][j];
            if (x < 0.5) {
                x = 0.5;
            }
            if (x > (N + 0.5)) {
                x = N + 0.5;
            }
            i0 = Math.floor(x);
            i1 = i0 + 1;
            if (y < 0.5) {
                y = 0.5
            }
            if (y > (N + 0.5)) {
                y = N + 0.5;
            }
            j0 = Math.floor(y);
            j1 = j0 + 1;
            s1 = x - i0;
            s0 = 1 - s1;
            t1 = y - j0;
            t0 = 1 - t1;
            d[i][j] = s0 * (t0 * d0[i0][j0] + t1 * d0[i0][j1]) +
                s1 * (t0 * d0[i1][j0] + t1 * d0[i1][j1]);
        }
    }
    setBoundaryConditions(N, b, d);
}

function densityStep(diff, dt) {
    addSource(N, dens, densPrev, dt);
    swapDensity();
    diffuse(N, 0, dens, densPrev, diff, dt);
    swapDensity();
    advect(N, 0, dens, densPrev, u, v, dt);
}

function velocityStep(visc, dt) {
    addSource(N, u, uPrev, dt);
    addSource(N, v, vPrev, dt);
    swapVelocity();
    diffuse(N, 1, u, uPrev, visc, dt);
    diffuse(N, 2, v, vPrev, visc, dt);
    project(N, u, v, uPrev, vPrev);
    swapVelocity();
    advect(N, 1, u, uPrev, uPrev, vPrev, dt);
    advect(N, 2, v, vPrev, uPrev, vPrev, dt);
    project(N, u, v, uPrev, vPrev);
}

function project(N, u, v, p, div) {
    var h = 1.0 / N;

    for (var i = 1; i <= N; i++) {
        for (var j = 1; j <= N; j++) {
            div[i][j] = -0.5 * h * (u[i + 1][j] - u[i - 1][j] + v[i][j + 1] - v[i][j - 1]);
            p[i][j] = 0;
        }
    }
    setBoundaryConditions(N, 0, div);
    setBoundaryConditions(N, 0, p);

    for (var k = 0; k < 20; k++) {
        for (var i = 1; i <= N; i++) {
            for (var j = 1; j <= N; j++) {
                p[i][j] = (div[i][j] + p[i - 1][j] + p[i + 1][j] + p[i][j - 1] + p[i][j + 1]) / 4;
            }
        }
        setBoundaryConditions(N, 0, p);
    }

    for (var i = 1; i <= N; i++) {
        for (var j = 1; j <= N; j++) {
            u[i][j] -= 0.5 * (p[i + 1][j] - p[i - 1][j]) / h;
            v[i][j] -= 0.5 * (p[i][j + 1] - p[i][j - 1]) / h;
        }
    }
    setBoundaryConditions(N, 1, u);
    setBoundaryConditions(N, 2, v);
}

function setBoundaryConditions(N, b, x) {
    for (var i = 1; i <= N; i++) {

        x[0][i] = b == 1 ? -x[1][i] : x[1][i];
        x[N + 1][i] = b == 1 ? -x[N][i] : x[N][i];
        x[i][0] = b == 2 ? -x[i][1] : x[i][1];
        x[i][N + 1] = b == 2 ? -x[i][N] : x[i][N];
    }
    x[0][0] = 0.5 * (x[1][0] + x[0][1]);
    x[0][N + 1] = 0.5 * (x[1][N + 1] + x[0][N]);
    x[N + 1][0] = 0.5 * (x[N][0] + x[N + 1][1]);
    x[N + 1][N + 1] = 0.5 * (x[N][N + 1] + x[N + 1][N]);
}

function addDensity(x, y, d, array) {
    // This should scale with the system size. As the system size is fixed for now, so is this.
    // array[x][y] += 3 * Math.sqrt(N);
    array[x][y] += 20;
}

function addVelocity(xi, yi, dx, dy) {
    u[xi][yi] += dx;
    v[xi][yi] += dy;
}

function addVel() {
    for (var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            vPrev[i][j] += 0.1;
        }
    }
}

/*-------Miscellaneous Helper Functions-------*/

function writeOut(u) {
    var string = "";
    for (var i = 0; i < size; i++) {
        string += u[i].toString() + "<br>";
    }
    document.getElementById("writeHere").innerHTML = string;
}

function getMaxMin(array2d) {
    var minMax = new Array();
    var max = 0;
    var min = 1E9;
    for (var i = array2d.length - 1; i >= 0; i--) {
        for (var j = array2d.length - 1; j >= 0; j--) {
            if (array2d[i][j] > max) {
                max = array2d[i][j];
            }
            if (array2d[i][j] < min) {
                min = array2d[i][j];
            }
        }
    }
    minMax.push(max);
    minMax.push(min);
    return minMax;
}

// Draw a rectangle to test the canvas
function drawRect(array) {
    for (var y = 30; y < 40; ++y) {
        for (var x = 30; x < 40; ++x) {
            array[y][x] = 1;
        }
    }
}

function fillTest(array) {
    for (var i = size - 1; i >= 0; i--) {
        for (var j = size - 1; j >= 0; j--) {
            array[j][i] = 0.5;
        }
    }
}