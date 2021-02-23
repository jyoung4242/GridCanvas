var zoomlevel = 50
var canvasHeight = 2048
var canvasWidth = 2048
var boxsizeX = 0
var boxsizeY = 0
var screenWidth = 0
var screenHeight = 0
var isDown = false

var majorSeperation = 10
var cnv
var ctx

var g_height
var g_width
var gridsize

var numG
var start_x
var start_y
var screenRatio
var offsetX, offsetY
var startX = 0
var startY = 0
var mouseX,
  mouseY = 0

/*************************************************
Initialization routine, set's default values
and setups up event listeners
*************************************************/

function init() {
  /*************************************************
window resizing event, recalculates the grid pattern
on a window resizing to keep the perfect square shape
regardless of window shape/size
*************************************************/

  addEvent(window, "resize", function (event) {
    screenRatio = window.innerWidth / window.innerHeight
    let rect = cnv.getBoundingClientRect()
    offsetX = rect.left
    offsetY = rect.top
    canvasWidth = rect.width * devicePixelRatio
    canvasHeight = rect.height * devicePixelRatio
    cnv.width = canvasWidth
    cnv.height = canvasHeight
    log("ScreenRatio: " + screenRatio.toString())
    recalc()
  })

  cnv = document.getElementById("myCanvas")
  ctx = cnv.getContext("2d")

  /*************************************************
  mouse events, setting up function handlers for each mouse
  event
  *************************************************/

  log("setting up Mouse events")
  $("#myCanvas").mousedown(function (e) {
    handleMouseDown(e)
  })
  $("#myCanvas").mousemove(function (e) {
    handleMouseMove(e)
  })
  $("#myCanvas").mouseup(function (e) {
    handleMouseUp(e)
  })
  $("#myCanvas").mouseout(function (e) {
    handleMouseOut(e)
  })
  //mousewheel
  cnv.addEventListener("onwheel" in document ? "wheel" : "mousewheel", (e) => handleMouseWheel(e))

  /*************************************************
  calculating screen ratio and display size to assist
  in calculating canvas size for best resolution
  *************************************************/

  screenRatio = window.innerWidth / window.innerHeight
  screenWidth = screen.width
  screenHeight = screen.height
  log("screen: w(" + screenWidth.toString() + ") h(" + screenHeight.toString() + ")")
  log("window (default): w(" + window.innerWidth.toString() + ") h(" + window.innerHeight.toString() + ")")
  log("screen ratio is: " + screenRatio.toString())
  log("preparing to draw initial grid")

  cnv.width = canvasWidth
  cnv.height = canvasHeight

  /*************************************************
  calculating sizes of the grids to best fit default
  grid onto canvase at startup
  *************************************************/

  gridsize = $("#pixelSelect").eq(0).val()
  log(`Default selected grid size: ` + gridsize)
  let tempzoom = $("#myRange").eq(0).val()
  zoomlevel = parseInt(tempzoom)
  log(`Default selected zoom level: ` + zoomlevel.toString())
  numG = $("#numGrid").eq(0).val()
  log(`Default number of grid squares: ` + numG)
  let rect = cnv.getBoundingClientRect()

  /*************************************************
  using devicePixelRatio, recalculate canvase dimensions
  to make perfect squares regardless of display
  resolution
  *************************************************/

  canvasWidth = rect.width * devicePixelRatio
  canvasHeight = rect.height * devicePixelRatio
  offsetX = rect.left
  offsetY = rect.top
  cnv.width = canvasWidth
  cnv.height = canvasHeight
  recalc()
}

/*************************************************
drawGrid --> sets up line color, canvas dimensions
and also resets the canvase prior to redrawing
*************************************************/

function drawGrid() {
  var gridOptions = {
    majorLines: {
      separation: majorSeperation,
      color: "#d3d3d3",
    },
  }
  ctx.clearRect(0, 0, cnv.width, cnv.height)
  cnv.width = canvasWidth
  cnv.height = canvasHeight
  drawGridLines(cnv, gridOptions.majorLines)

  return
}

/*************************************************
drawGridLines --> sets up the canvas routines to 
draw the lines first, horizontal then vertical
then draws the border Rectangle
*************************************************/

function drawGridLines(cnv, lineOptions) {
  var iWidth = g_width //cnv.width
  var iHeight = g_height // cnv.height

  ctx.strokeStyle = lineOptions.color
  ctx.strokeWidth = 1
  ctx.lineWidth = 2

  ctx.beginPath()

  var iCount = null
  var i = null
  var x = start_x
  var y = start_y

  lineOptions.separation = boxsizeX
  //draw vertical lines
  for (i = 1; i <= numG; i++) {
    x = i * lineOptions.separation + start_x
    ctx.moveTo(x, start_y)
    ctx.lineTo(x, iHeight + start_y)
    ctx.stroke()
  }

  //draw horizontal grid
  lineOptions.separation = boxsizeY
  for (i = 1; i <= numG; i++) {
    y = i * lineOptions.separation + start_y

    ctx.moveTo(start_x, y)
    ctx.lineTo(iWidth + start_x, y)
    ctx.stroke()
  }
  ctx.rect(start_x, start_y, g_width, g_height)
  ctx.stroke()
  ctx.closePath()

  return
}

/*************************************************
log --> small function that appends logged text to 
the console text area on the user interface
takes a string input and appends to text, then 
forces scroll to bottom
*************************************************/

function log(s) {
  var selectionStart = $("#consoleText")[0].selectionStart
  var selectionEnd = $("#consoleText")[0].selectionEnd

  $("#consoleText").val($("#consoleText").val() + s + "\n")

  $("#consoleText")[0].selectionStart = selectionStart
  $("#consoleText")[0].selectionEnd = selectionEnd
  $("#consoleText")[0].scrollTop = $("#consoleText")[0].scrollHeight
}

/*************************************************
zoom --> this function is tied to the user control
and as the slider is moved, oninput event, takes the 
control value and updates the zoom factor
*************************************************/

function zoom() {
  zoomlevel = $("#myRange").eq(0).val()
  recalc()
}

/*************************************************
recalc -> this takes all the global variables
and refactors grid size, and the grid size 
based on screensize, zoom, number of grids
and redraws the grid on the screen
*************************************************/

function recalc() {
  //boxize calc = physical screen size to yield a 3" grid on full screen, times zoom factor, then modified by "resolution?"
  boxsizeX = Math.floor((screenWidth * 0.3 * (zoomlevel / 100)) / numG) //.15 is 3" divided by the 20" of my monitor width (physically) to be modified for responsiveness later
  boxsizeY = Math.floor((screenHeight * 0.5 * (zoomlevel / 100)) / numG) //.27 is 3" divided by the 11" of my monitor height (physically) to be modified for responsiveness later

  g_width = numG * boxsizeX
  g_height = numG * boxsizeY

  //calculate starting point
  if (!isDown) {
    start_x = cnv.width / 2 - g_width / 2
    start_y = cnv.height / 2 - g_height / 2
  }

  drawGrid()
}

/*************************************************
newNumGrids -> this is the onchange event function
that takes the numeric value and redraws the grid
on the canvas for the updated grid size
*************************************************/

function newNumGrids() {
  numG = $("#numGrid").eq(0).val()
  log("Number of grids updated to: " + numG.toString())
  recalc()
}

/*************************************************
addEvent(), setups up the window resizing event in 
a manner that doesn't overrides system event 
*************************************************/

function addEvent(object, type, callback) {
  if (object == null || typeof object == "undefined") return
  if (object.addEventListener) {
    object.addEventListener(type, callback, false)
  } else if (object.attachEvent) {
    object.attachEvent("on" + type, callback)
  } else {
    object["on" + type] = callback
  }
}

/*************************************************
handleMouseDown, setups up the mouse events for 
the canvas, sets flag , records mouse position
*************************************************/

function handleMouseDown(e) {
  // tell the browser we're handling this event
  e.preventDefault()
  e.stopPropagation()

  // calc the starting mouse X,Y for the drag
  startX = parseInt(e.clientX - offsetX)
  startY = parseInt(e.clientY - offsetY)

  // set the isDragging flag
  isDown = true
}

/*************************************************
handleMouseUp, setups up the mouse events for 
the canvas, clears flag
*************************************************/

function handleMouseUp(e) {
  // tell the browser we're handling this event
  e.preventDefault()
  e.stopPropagation()

  // clear the isDragging flag
  isDown = false
}

/*************************************************
handleMouseWheel, setups up the mouse events for 
the canvas, zoom wheel functionality
*************************************************/

function handleMouseWheel(e) {
  e.preventDefault()
  e.stopPropagation()
  var zoomDelta = parseInt(e.deltaY) / 10
  zoomlevel = parseInt(zoomlevel)
  zoomlevel = zoomlevel + zoomDelta / 10

  log("zoomDelta: " + zoomDelta.toString())
  log("zoomlevel: " + zoomlevel.toString())

  if (zoomlevel >= 400) {
    zoomlevel = 400
    log("Full Zoom")
  } else if (zoomlevel <= 5) {
    zoomlevel = 5
    log("Full Zoom")
  }
  $("#myRange").eq(0).val(zoomlevel)
  recalc()
}

/*************************************************
handleMouseOut, setups up the mouse events for 
the canvas, clears drag flag
*************************************************/

function handleMouseOut(e) {
  // tell the browser we're handling this event
  e.preventDefault()
  e.stopPropagation()

  // clear the isDragging flag
  isDown = false
}

/*************************************************
handleMouseMove, setups up the mouse events for 
the canvas, this calculates the delta for the 
mouse dragging the grid on the canvas
*************************************************/

function handleMouseMove(e) {
  // only do this code if the mouse is being dragged
  if (!isDown) {
    return
  }

  // tell the browser we're handling this event
  e.preventDefault()
  e.stopPropagation()

  // get the current mouse position
  mouseX = parseInt(e.clientX - offsetX)
  mouseY = parseInt(e.clientY - offsetY)

  // dx & dy are the distance the mouse has moved since
  // the last mousemove event
  var dx = mouseX - startX
  var dy = mouseY - startY
  // reset the vars for next mousemove
  startX = mouseX
  startY = mouseY

  start_x = start_x + dx //netPanningX
  start_y = start_y + dy //netPanningY
  recalc()
}
