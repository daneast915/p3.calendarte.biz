/*
 * drawApp.js
 * Root namespace module
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 4,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : true,
  white  : true
*/
/*global $, drawApp */

var drawApp = (function () {

    var currentTool = false,
        strokeStyle = "#000000",
        fillStyle = "#0000ff",
        fillOption = true,
        lineWidth = 5,
        canvasAll,
        contextAll,
        canvasTool,
        contextTool,
        canvasWidth,
        canvasHeight,
        undoManager,
        shapes = [],
        shapeId = 0
    ;


    /**
     * Determines is the browser supports the canvas API
     * @return {Boolean} true is canvas is supported
     */
    function canvasSupport () {
        return Modernizr.canvas;
    }

    /**
     * Clears all contents from the canvas context
     */
    function clearCanvas() {
        contextAll.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    /**
     * Adds two numbers
     * @param {Number} a 
     * @return {Number} sum
     */
    function clearToolCanvas() {
        drawCanvas();
    }

    /**
     * Adds two numbers
     * @param {Number} a 
     * @return {Number} sum
     */
    function drawCanvas() {
        clearCanvas();
        var i,
            shape;
        for (i = 0; i < shapes.length; i += 1) {
            shape = shapes[i];
            shape.draw(contextAll);
        }
    }

    /**
     * Adds two numbers
     * @param {Number} a 
     * @return {Number} sum
     */
    function removeShape(id) {
        var i = 0, index = -1;

        for (i = 0; i < shapes.length; i += 1) {
            if (shapes[i].id === id) {
                index = i;
            }
        }

        if (index !== -1) {
            shapes.splice(index, 1);
        }

        drawCanvas();
    }

    /**
     * Adds two numbers
     * @param {Number} a 
     * @return {Number} sum
     */
    function addShape(shape) {
        shapes.push(shape);

        clearToolCanvas();
        drawCanvas();

        var attrs = JSON.stringify(shape);

        undoManager.add({
            undo: function () {
                removeShape(shape.id);
            },
            redo: function () {
                createShape(attrs);
            }
        });
    }


    /**
     * Adds two numbers
     * @param {Number} a 
     * @return {Number} sum
     */
    function createShape(attrs) {
        var obj = JSON.parse(attrs),
            shape
        ;

        switch (obj.shapeType) {
            case Shapes.ShapeType.Line:
                shape = new Shapes.Line (obj);
                break;
            case Shapes.ShapeType.Rectangle:
                shape = new Shapes.Rectangle (obj);
                break;
            case Shapes.ShapeType.Circle:
                shape = new Shapes.Circle (obj);
                break;
            case Shapes.ShapeType.Arc:
                shape = new Shapes.Arc (obj);
                break;
             case Shapes.ShapeType.PencilDrawing:
                shape = new Shapes.PencilDrawing (obj);
                break;               
            default:
                break;
        }

        if (undefined !== shape) {
            addShape (shape);
        }
    }

    /**
     * Adds two numbers
     * @param {Number} a 
     * @return {Number} sum
     */
    function initDrawingOptions() {
        $("#lineColor").spectrum({
            color: strokeStyle,
            showPalette: true,
            showSelectionPalette: true,            
            change: function(color) {
                if (null != color && undefined != color) {
                    var hex = color.toHexString(); // #ff0000
                    if (undefined != hex)
                        strokeStyle = hex;
                }
            }
        });  

        $("#widthSpinner").spinner()
            .spinner( "value", lineWidth )
            .spinner({
                spin: function( event, ui ) {
                    lineWidth = ui.value;
                }
            });
 
        $("#fillOption").prop('checked', fillOption);
        $("#fillOption").change (function() {
            fillOption = $("#fillOption").prop('checked');
        });
 
        $("#fillColor").spectrum({
            color: fillStyle,
            showPalette: true,
            showSelectionPalette: true,  
            change: function(color) {
                if (null != color && undefined != color) {
                    var hex = color.toHexString(); // #ff0000
                    if (undefined != hex)
                        fillStyle = hex;
                }
            }
        });  
 
    }



    /**
    * @class PencilTool
    * @classdesc This painting tool works like a drawing pencil which tracks the mouse movements..
    */
    var PencilTool = function (context) {
        var tool = this;

        this.started = false;
        this.context = context;

        $('#fillOptions').hide();  

        // This is called when you start holding down the mouse button.
        // This starts the pencil drawing.
        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;

            tool.pencilDrawing = new Shapes.PencilDrawing ({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth
            });
        };
            
        // This function is called every time you move the mouse. Obviously, it only 
        // draws if the tool.started state is set to true (when you are holding down 
        // the mouse button).
        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            clearToolCanvas(); 

            var point = {
                x: ev._x, 
                y: ev._y
            };
            tool.pencilDrawing.addPoint (point);
            tool.pencilDrawing.draw (tool.context);
        };

        // This is called when you release the mouse button.
        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.pencilDrawing);
            }
        };
    };
 
    /**
    * @class RectangleTool
    * @classdesc The rectangle tool - can draw stroked rectangles or filled rectangles
    */
    var RectangleTool = function (context) {
        var tool = this;

        this.started = false;
        this.context = context;

        $('#fillOptions').show(); 

        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;

            tool.rectangle = new Shapes.Rectangle({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                width: 1,
                height: 1,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                fill: fillOption,
                fillStyle: fillStyle
            });
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            var x = Math.min(ev._x,  tool.rectangle.x),
                y = Math.min(ev._y,  tool.rectangle.y),
                w = Math.abs(ev._x - tool.rectangle.x),
                h = Math.abs(ev._y - tool.rectangle.y);

            if (!w || !h) {
                return;
            }

            clearToolCanvas(); 

            tool.rectangle.x = x;
            tool.rectangle.y = y;
            tool.rectangle.width  = w;
            tool.rectangle.height = h;

            tool.rectangle.draw (tool.context);
        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.rectangle);
            }
        };
    };

    /**
    * @class LineTool
    * @classdesc The line tool.
    */
    var LineTool = function (context) {
        var tool = this;
        
        this.started = false;
        this.context = context;

        $('#fillOptions').hide(); 

        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;

            tool.line = new Shapes.Line({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                endX: ev._x,
                endY: ev._y,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth
            });
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            clearToolCanvas();

            tool.line.endX = ev._x;
            tool.line.endY = ev._y;

            tool.line.draw (tool.context);
        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.line);
            }
        };
    };

    /**
    * @class CircleTool
    * @classdesc The circle tool.
    */
    var CircleTool = function (context) {
        var tool = this;
        
        this.started = false;
        this.context = context;

        $('#fillOptions').show(); 

        function getLineLength (x, y, x0, y0){
            return Math.sqrt((x -= x0) * x + (y -= y0) * y);
        }

        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;

            tool.circle = new Shapes.Circle({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                radius: 50,
                fill: fillOption,
                fillStyle: fillStyle
            });      
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            clearToolCanvas();

            tool.circle.radius = getLineLength (tool.circle.x, tool.circle.y, ev._x, ev._y);

            tool.circle.draw (tool.context);
        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.circle);
            }
        };
    };

    /**
    * @class ArcTool
    * @classdesc The arc tool.
    */
    var ArcTool = function (context) {
        var tool = this;

        this.started = false;
        this.context = context;

        $('#fillOptions').hide(); 

        function getLineLength (x, y, x0, y0) {
            return Math.sqrt((x -= x0) * x + (y -= y0) * y);
        }
        
        function getDegreeAngle (x1, y1, x2, y2, x3, y3) {
            var theta1 = Math.atan2( (y1-y2),(x1-x2) );
            var theta2 = Math.atan2( (y3-y2),(x3-x2) );
            var theta = (theta2-theta1)*180/Math.PI;
            theta = (theta+360)%360;
            return theta.toFixed(2);
        }

        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;
 
            tool.arc = new Shapes.Arc({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                radius: 50,
                angle: 90,
                counterclockwise: true            
            });        
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            clearToolCanvas();

            tool.arc.radius = getLineLength (tool.arc.x, tool.arc.y, ev._x, ev._y);
            tool.arc.angle = getDegreeAngle (0, 0, tool.arc.x, tool.arc.y, ev._x, ev._y);

            tool.arc.draw (tool.context);
        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.arc);
            }
        };
    };


    /**
     * Adds two numbers
     * @param {Number} a 
     * @return {Number} sum
     */
    var initModule = function () {
    
        if (!canvasSupport ()) {
            alert("This app cannot be run with this browser. Try Chrome, Firefox, Opera, Safari or Internet Explorer 9+.");
            return;
        }

        undoManager = new UndoManager();

        function updateUI() {
            $('#btnUndo').prop('disabled', !undoManager.hasUndo());
            $('#btnRedo').prop('disabled', !undoManager.hasRedo());
        }

        undoManager.setCallback(updateUI);

        var $canvasAll = $("#canvasAll");

        canvasAll = $canvasAll.get(0);
        contextAll = canvasAll.getContext('2d');  
        canvasWidth = $canvasAll.width();
        canvasHeight = $canvasAll.height();

        contextTool = contextAll; // canvasTool.getContext('2d');  

        var $canvasTool = $canvasAll; // $("#canvasTool");
 
        // The general-purpose event handler. This function just determines the mouse 
        // position relative to the canvas element.
        function ev_canvas (ev) {

            ev._x = ev.pageX - $canvasTool.offset().left;
            ev._y = ev.pageY - $canvasTool.offset().top;

            // Call the event handler of the tool.
            if (undefined !== currentTool) {
                var func = currentTool[ev.type];
                if (func) {
                    func(ev);
                }
            }
        }

        $canvasTool.mousedown (ev_canvas);
        $canvasTool.mousemove (ev_canvas);
        $canvasTool.mouseup (ev_canvas);

        initDrawingOptions();

        $('#btnUndo').click (function () {
            undoManager.undo();
            updateUI();
        });

        $('#btnRedo').click (function () {
            undoManager.redo();
            updateUI();
        });

        $('#btnClear').click (function () {
            undoManager.clear();
            updateUI();
        });

        $('#btnLine').click (function () {
            currentTool = new LineTool (contextTool);
        });

        $('#btnCircle').click (function () {
            currentTool = new CircleTool (contextTool);
        });

        $('#btnArc').click (function () {
            currentTool = new ArcTool (contextTool);
        });

        $('#btnRectangle').click (function () {
            currentTool = new RectangleTool (contextTool);
        });

        $('#btnPencil').click (function () {
            currentTool = new PencilTool (contextTool);
        });

        updateUI();        
    };

    return { 
        initModule: initModule 
    };
}());