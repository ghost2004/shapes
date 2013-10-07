

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
		
	}
}