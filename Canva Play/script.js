const canvas = document.querySelector('#draw');
const ctx = canvas.getContext('2d');

// tool buttons
const brushBtn = document.getElementById('brushBtn');
const brushWeight = document.getElementById('brushWeight');
const pencilBtn = document.getElementById('pencilBtn');
const penBtn = document.getElementById('penBtn');
const markerBtn = document.getElementById('markerBtn');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
let brushColor = document.getElementById('colorPicker');

// state variables
const MAX_HISTORY = 15;
let undoStack = [];
let redoStack = [];
let theColor ='black';
let isDrawing = false;
let isErasing = false;
let lastX = 0;
let lastY = 0;

// brush weights
let pencilWeight = 0.5;
let penWeight = 4;
let markerWeight = 20;
let eraserWeight = 15;

// set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// drawing function
function draw(e){
    if(!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX,lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    lastX = e.offsetX;
    lastY = e.offsetY;
}

// tool functions
function usePencil(){
    console.log(ctx);
    ctx.strokeStyle = theColor;
    ctx.lineJoin = 'round'; 
    ctx.lineCap = 'round'; 
    ctx.lineWidth = pencilWeight;
    ctx.globalAlpha = 0.7; // light opacity
    ctx.shadowBlur = 0;
    ctx.shadowColor = theColor;
    canvas.addEventListener('mousemove', draw);
    brushWeight.value = pencilWeight;
    changeCursor('assets/pencil-cursor.png');
}

function usePen(){ 
    ctx.strokeStyle = theColor;
    ctx.lineJoin = 'round'; 
    ctx.lineCap = 'round'; 
    ctx.lineWidth = penWeight;
    ctx.globalAlpha = 1; // solid stroke
    ctx.shadowBlur = 0;
    ctx.shadowColor = theColor;
    canvas.addEventListener('mousemove', draw);
    brushWeight.value = penWeight;
    changeCursor('assets/pen-cursor.png');
}

function useMarker(){
    ctx.strokeStyle = theColor;
    ctx.lineJoin = 'round'; 
    ctx.lineCap = 'round'; 
    ctx.lineWidth = markerWeight;
    ctx.globalAlpha = 0.4; // marker layering effect
    ctx.shadowBlur = 7;
    ctx.shadowColor = theColor;
    canvas.addEventListener('mousemove', draw);
    brushWeight.value = markerWeight;
    changeCursor('assets/marker-cursor.png');
}

function erase(){
    if(!isErasing){
        isErasing = true;
        theColor = ctx.strokeStyle;
        ctx.strokeStyle = 'aliceblue';
        ctx.lineWidth = eraserWeight;
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'aliceblue';
        brushWeight.value = eraserWeight;
        changeCursor('assets/eraser-cursor.png');

    }else{
        isErasing = false;
        ctx.strokeStyle = theColor;
    }
}

// Undo/Redo functions
function saveState(){
    if(undoStack.length >= MAX_HISTORY) undoStack.shift(); // limit history and remove oldest
    undoStack.push(canvas.toDataURL());
    redoStack = [];
}

function undo(){
    if(undoStack.length > 0) 
    {
        redoStack.push(canvas.toDataURL());
        let img = new Image();
        img.src = undoStack.pop();
        img.onload = function (){
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.drawImage(img,0,0);
        
    }}
}

function redo(){
    if(redoStack.length > 0) 
    {
        undoStack.push(canvas.toDataURL());
        let img = new Image();
        img.src = redoStack.pop();
        img.onload = function (){
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.drawImage(img,0,0);
        }
    }
}

// clear canvas
function clear(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
}

// download canvas as image(png)
function download(){
    let data = canvas.toDataURL('image/png');
    let a = document.createElement('a');
    a.href = data;
    a.download = "canvasPlay.png";
    a.click();
}

// change the cursor based on tool
function changeCursor(cursorUrl){
    canvas.style.cursor = `url('${cursorUrl}') 0 32, auto`;
}

// event listeners
document.querySelectorAll('.clr').forEach(clr => {
    clr.addEventListener('click', () => {
        ctx.strokeStyle = clr.dataset.clr;
        ctx.shadowColor = clr.dataset.clr;
        theColor = ctx.strokeStyle;
    });
});

brushBtn.addEventListener('click', () => {
    brushWeight.classList.toggle('visible');
});

brushColor.addEventListener('input', function(){
    theColor = brushColor.value;
    ctx.strokeStyle = theColor;
    ctx.shadowColor = theColor;
});
brushWeight.addEventListener('input', ()=> {
    ctx.lineWidth = brushWeight.value
});

canvas.addEventListener('mousedown', (e)=>{
    isDrawing = true;
    [lastX,lastY] =[e.offsetX, e.offsetY];
    saveState();
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
clearBtn.addEventListener('click', clear);
downloadBtn.addEventListener('click', download);
pencilBtn.addEventListener('click', usePencil);
penBtn.addEventListener('click', usePen);
markerBtn.addEventListener('click', useMarker);
eraserBtn.addEventListener('click', erase);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);