var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="..\typings\jquery.d.ts" />
//
// Module containing Drawing Shapes
//
var Shapes;
(function (Shapes) {
    Shapes.ShapeType = {
        Line: 1,
        Rectangle: 2,
        Square: 3,
        Circle: 4,
        Ellipse: 5,
        Arc: 6
    };

    //
    // Shape
    //
    var Shape = (function () {
        function Shape(options) {
            this.id = options.id;
            this.x = options.x;
            this.y = options.y;
            this.strokeStyle = options.strokeStyle;
            this.lineWidth = options.lineWidth;
        }
        Shape.prototype.draw = function (context) {
            //context.drawRect(this.x);
        };
        return Shape;
    })();
    Shapes.Shape = Shape;

    //
    // Rectangle
    //
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.Rectangle;
            this.width = options.width;
            if (undefined !== options.height)
                this.height = options.height;
            if (undefined !== options.fillStyle)
                this.fillStyle = options.fillStyle;
        }
        Rectangle.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            if (undefined === this.fillStyle)
                context.strokeRect(this.x, this.y, this.width, this.height);
            else {
                context.fillStyle = this.fillStyle;
                context.fillRect(this.x, this.y, this.width, this.height);
            }
        };
        return Rectangle;
    })(Shape);
    Shapes.Rectangle = Rectangle;

    //
    // Line
    //
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.Line;
            this.endX = options.endX;
            this.endY = options.endY;
        }
        Line.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.endX, this.endY);
            context.stroke();
            context.closePath();
        };
        return Line;
    })(Shape);
    Shapes.Line = Line;

    //
    // Circle
    //
    var Circle = (function (_super) {
        __extends(Circle, _super);
        function Circle(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.Circle;
            this.radius = options.radius;
            if (undefined !== options.fill)
                this.fill = options.fill;
            else
                this.fill = false;
            if (undefined !== options.fillStyle)
                this.fillStyle = options.fillStyle;
        }
        Circle.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            context.beginPath();
            context.arc(this.x, this.y, this.radius, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
            context.stroke();
            context.closePath();
        };
        return Circle;
    })(Shape);
    Shapes.Circle = Circle;

    //
    // Arc
    //
    var Arc = (function (_super) {
        __extends(Arc, _super);
        function Arc(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.Circle;
            this.radius = options.radius;
            this.angle = options.angle;
            this.counterclockwise = options.counterclockwise;
        }
        Arc.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            context.beginPath();
            context.arc(this.x, this.y, this.radius, (Math.PI / 180) * 0, (Math.PI / 180) * this.angle, this.counterclockwise);
            context.stroke();
            context.closePath();
        };
        return Arc;
    })(Shape);
    Shapes.Arc = Arc;
})(Shapes || (Shapes = {}));
