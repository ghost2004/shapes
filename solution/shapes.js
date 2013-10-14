var NS="http://www.w3.org/2000/svg";

function extendClass(subCls,superCls,param) {  
	superCls.call(subCls.prototype,param); 
}

// Base Object
function Shapes() {
	this._x = 0;
	this._y = 0;
	this._color = "red";
	this._height = 0;
	this._width = 0;
	this._shape = null;
	
	this.x = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this._x;
		else {
			this._x = arguments[0];
			return this;
		}
	};
	this.y = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this._y;
		else {
			this._y = arguments[0];
			return this;
		}
	};
	this.center = function(c1, c2) {
		this._x = c1;
		this._y = c2;
		return this;
	};
	this.width = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this._width;
		else {
			this._width = arguments[0];
			return this;
		}
	};
	
	this.height = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this._height;
		else {
			this._height = arguments[0];
			return this;
		}
	};
		
	this.fill = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this._color;
		else {
			this._color = arguments[0];
			return this;
		}
	};
}

// Object Rectangle, subclass of Shapes
function Rectangle() {
	this.draw = function(svg) {
		this._shape = document.createElementNS(NS, "rect");
    	this._shape.setAttributeNS(null, "x", this._x - this._width/2);
    	this._shape.setAttributeNS(null, "y", this._y - this._height/2);
    	this._shape.setAttributeNS(null, "height", this._height);
    	this._shape.setAttributeNS(null, "width", this._width);
    	this._shape.setAttributeNS(null, "fill", this._color);

		svg.appendChild(this._shape);
		return this;
	};
}
extendClass(Rectangle, Shapes,"");

// Object Square, subclass of Shapes
function Square() {
	this.cx = this.x;
	this.cy = this.y;
	this.draw = function(svg) {
		this._shape = document.createElementNS(NS, "rect");
    	this._shape.setAttributeNS(null, "x", this._x - this._width/2);
    	this._shape.setAttributeNS(null, "y", this._y - this._width/2);
    	this._shape.setAttributeNS(null, "height", this._width);
    	this._shape.setAttributeNS(null, "width", this._width);
    	this._shape.setAttributeNS(null, "fill", this._color);

		svg.appendChild(this._shape);
		return this;
	};
}
extendClass(Square, Shapes,"");

// Object Line, subclass of Shapes
function Line() {
	this._x2 = 0;
	this._y2 = 0;
	this._broken = false;
	this.x1 = this.x;
	this.y1 = this.y;
	this.stroke = this.fill;
	this.strokeWidth = this.width;
	this.broken = function(flag) {
		this._broken = flag;
		return this;
	};
	
	this.x2 = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this._x2;
		else {
			this._x2 = arguments[0];
			return this;
		}
	};
	
	this.y2 = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this._y2;
		else {
			this._y2 = arguments[0];
			return this;
		}
	};
	this.draw = function(svg) {
		this._shape = document.createElementNS(NS, "line");
    	this._shape.setAttributeNS(null, "x1", this._x);
    	this._shape.setAttributeNS(null, "y1", this._y);
    	this._shape.setAttributeNS(null, "x2", this._x2);
    	this._shape.setAttributeNS(null, "y2", this._y2);
    	this._shape.setAttributeNS(null, "stroke", this._color);
    	this._shape.setAttributeNS(null, "stroke-width", this._width);
    	if (this._broken)
 			this._shape.setAttributeNS(null, "style", "stroke-dasharray:3 2");   
		svg.appendChild(this._shape);
		return this;
	};
	
}
extendClass(Line, Shapes,"");

// Object Text, subclass of Shapes
function Text() {
	this._text = "";
	this._data = null;
	this.text = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this._text;
		else {
			this._text = arguments[0];
			return this;
		}
	};
	this.draw = function(svg) {
		this._data  = document.createTextNode(this._text);
		this._shape = document.createElementNS(NS, "text");
		this._shape.setAttributeNS(null, "x", this._x);
		this._shape.setAttributeNS(null, "y", this._y);
		this._shape.setAttributeNS(null, "text-anchor", "start");
		this._shape.appendChild(this._data);
		svg.appendChild(this._shape);
		return this;		
	};
}
extendClass(Text, Shapes,"");


// Object Circle, subclass of Shapes
function Circle() {
	this.draw = function(svg) {
		this._shape = document.createElementNS(NS, "circle");
    	this._shape.setAttributeNS(null, "cx", this._x);
    	this._shape.setAttributeNS(null, "cy", this._y);
    	this._shape.setAttributeNS(null, "r", this._width/2);
    	this._shape.setAttributeNS(null, "fill", this._color);

		svg.appendChild(this._shape);
		return this;
	};
}
extendClass(Circle, Shapes,"");
