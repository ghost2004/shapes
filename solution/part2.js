

/* Determine whether an object is an array. */
function isArray(a) {
	return (a && a.constructor == Array);
}

function dataItem(item) {
	this._date = new Date(item.date);
	this._val = item.level;
}

function ChartData() {
	this._chartD = new Array();
	this._minVal = 0;
	this._maxVal = 0;
			
	this.loadFromArray = function(data){
		if (!isArray(data)){
			return null;
		}
		this._minVal = data[0].level;
		this._maxVal = data[0].level;
		for (var i = 0; i < data.length; i++) {
			var item = new dataItem(data[i]);
			this._chartD.push(item);
			if (item._val < this._minVal)
				this._minVal = item._val;
			else if (item._val > this._maxVal)
				this._maxVal = item._val;
				
		} 
		
	};
}

function SVGPlot(svg, data) {
	this._width = svg.getAttribute("width");
	this._height = svg.getAttribute("height");
	this._svg = svg;
	this._chartData = data;
	
	this._left_blank = 60;
	this._right_blank = 40;
	this._bottom_blank = 60;
	this._top_blank = 40;
	
	this._axis_x1 = this._left_blank;
	this._axis_y1 = this._height - this._bottom_blank;
	this._axis_x2 = this._width - this._right_blank;
	this._axis_y2 = this._top_blank;
	
	var x_axis = new Line().x1(this._axis_x1).y1(this._axis_y1)
				.x2(this._axis_x2).y2(this._axis_y1)
				.stroke('purple').strokeWidth(2)
            	.draw(this._svg);
	
	var y_axis = new Line().x1(this._axis_x1).y1(this._axis_y1)
				.x2(this._axis_x1).y2(this._axis_y2)
				.stroke('purple').strokeWidth(2)
            	.draw(this._svg);
	
	
	
}