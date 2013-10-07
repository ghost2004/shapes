/**
 * @author      章小飞
 * @since       2008-12-26
 * @version 	2.05
 * @description SVG实时曲线绘图
 * @QQ:253445528
 * @版权所有
 * 
 * 1、控件会主动获取页面参数进行绘图初始化
 *    必须的初始化参数有：
 *		 data_precision:数值精度，精确到小数点后的位数
 *		 up_limit：曲线上限值参考线
 *		 down_limit：曲线下限值参考线
 *		 standard_limit：标准参照值(或平均值)
 *		 y_min：y轴最小值
 *		 y_max：y轴最大值
 *		 y_value_per_step：y轴标签步长
 *    以上参数为必须的，在获取参数过程中只要出现一个异常即停止绘制曲线
 *    或者只绘制出坐标轴和鼠标跟随的提示线
 * 2、控件调用入口为main函数
 * 3、页面脚本get_param_for_curve()与get_curve_data()两个函数分别
 * 	  用来获取初始化参数和某条曲线的数值数组
 * 4、控件支持负值数据，将y_min参数设置到负值范围即可绘制数值小于0的曲
 * 	  线，x坐标轴位置会自动校准到y=0的位置或y_min的位置（当y_min>0）
 * 5、在向脚本传递参数时，在服务器端按照对应数据的电压等级设定合适的
 * 	  上下限（y_min、y_max）范围，即可显示波动幅度可控的曲线
 * 6、y轴标签步长最好为合适的整数值，以提高脚本的执行效率
 */
 
//=================全局变量================
var svg_doc=null;			//svg的document对象
var grid_group=null;	    //背景网格组
var curve_group=null;	    //曲线组
var text_group=null;		//提示文本组
var axis_group=null;		//坐标轴组
//视图区外观参数
var curve_left=0;		  	//视图区左边界
var curve_top=0;		  	//视图区上边界
var curve_width=800;      	//视图区宽度
var curve_height=500;     	//视图区高度
var line_left_blank=80;   	//曲线区左边距
var line_right_blank=120;  	//曲线区右边距
var line_top_blank=50;    	//曲线区上边距
var line_bottom_blank=90; 	//曲线区下边距
var line_width=curve_width-line_left_blank-line_right_blank;  //曲线区宽度
var line_height=curve_height-line_top_blank-line_bottom_blank;//曲线区高度
var y_label_left_blank=50;	//y轴标签左边距
var zoom_ratio=1;			//放大倍率
var y_union="单位：V";
var x_union="单位：分钟";

//计算xy轴起始和终止点坐标
var x_axis_x1=line_left_blank;
var x_axis_y1=curve_height-line_bottom_blank;
var x_axis_x2=curve_width-line_right_blank;
var x_axis_y2=curve_height-line_bottom_blank;

var y_axis_x1=line_left_blank;
var y_axis_y1=curve_height-line_bottom_blank;
var y_axis_x2=line_left_blank;
var y_axis_y2=line_top_blank;

//曲线绘制相关参数
var data_precision=3;						//数值精度:保留的小数位数
var up_limit=90;							//曲线上限值
var down_limit=50;							//曲线下限值
var standard_limit=70;						//标准参照值
var y_min=0;	           					//y轴最小值
var y_max=100;            					//y轴最大值
var y_value_per_step=10;    				//y轴标签步长
var y_steps=(y_max-y_min)/y_value_per_step;	//y轴标签总步数
var x_steps=288;							//x轴总步数
var x_step_pels=(curve_width-line_left_blank-line_right_blank)/x_steps;    //x轴每步象素数
var y_step_pels=(curve_height-line_top_blank-line_bottom_blank)/y_steps;   //y轴每步象素数

//屏蔽异常值范围(若选择在绘制曲线时屏蔽异常值，则以下两个参数指定屏蔽的范围)
var up_overflow=0.1;			//超过上限值10%
var down_overflow=0.1;			//超过下限值10%
//曲线图的标题
var curve_title="";

//提示线、提示文本相关参数
var y_offset_to_cursor=40;		//提示框、提示文本到鼠标下方的偏移量
var x_offset_to_cursor=10;		//提示框、提示文本到鼠标左边的偏移量
var curve_arr=new Array();	    //曲线组
var color_array=["red","green","blue","#FFCC00","#FF00CC","#00FFCC","navy","blue","blue","blue"];

//显示格式定义
//单位提示文本格式
var union_sty="font-size:16;font-family:simsun;stroke:#000000;stroke-size:2;";
//鼠标跟随的提示线格式
var tip_line_sty="fill:red;stroke:red;stroke-width:2;"
//y轴标签格式
var y_label_sty="font-size:16;font-family:simsun;stroke:#000000;stroke-size:1;";
//标题样式
var title_sty="fill:blue;font-size:20;font-family:simsun;stroke:blue;stroke-size:1;";
//背景网格线样式
var grid_sty="fill:#CCCCCC;";
//文本阴影框样式
var tip_box_sty="fill:#C4E1FF;stroke:#000000;stroke-size:1;fill-opacity:0.8;";
//出错提示信息样式
var err_msg_sty="fill:red;font-size:16;font-family:simsun;stroke:red;stroke-size:2;";

//===================================曲线对象===================================
/**
 * 曲线对象
 * 该对象为绘制曲线的核心对象
 * 外部程序在绘图时，应首先生成该对象的实例
 * 将生成的实例保存到curve_arr数组中
 * 最后调用绘图函数完成一条曲线的绘制
 */
function curve(){
	this.x_values=new Array();				//曲线x坐标值数组
	this.y_values=new Array();				//曲线y坐标值数组
	this.color="#000000";					//曲线默认显示颜色 
	this.mask_flag=false;					//是否屏a蔽异常值
	this.size=1.5;						    //曲线粗细
	this.line_group_id=null;				//曲线组id
	this.name=null;							//曲线名称
	this.create_line=create_curve_line;		//绘制自己
}

//=====================================工具函数=================================
/**
 * 数据精度格式化
 * source:需要格式化的数字
 * n:保留的小数位数
 */
function data_format(source){
	var val=Math.round(source*Math.pow(10,data_precision))/Math.pow(10,data_precision);
	return parseFloat(val);
}

/**
 * 画一条直线
 * 起始点坐标(x1,y1)
 * 结束点坐标(x2,y2)
 * sty:样式(style)
 */
function create_line(x1,y1,x2,y2,sty,id){
	var line=svg_doc.createElement("line");
	if(id!=null){
		line.setAttribute("id",id);
	}
	line.setAttribute("Pointer-event",null);
	line.setAttribute("x1",x1);
	line.setAttribute("y1",y1);
	line.setAttribute("x2",x2);
	line.setAttribute("y2",y2);
	line.setAttribute("style",sty);
	return line;
}

/**
 * x坐标数值格式化
 * 规则：0～s_steps之间的整数
 */
function x_data_format(x_value){
	var result=0;
	if(x_value<0){
		return result;
	}else if(x_value>x_steps){
		return x_steps;
	}else{
		result=parseInt(x_value);
		return result;
	}
}

/**
 * y轴坐标格式化
 * 规则：y_min～y_max之间的实数
 */
function y_data_format(y_value){
	var result=y_min;
	if(y_value<y_min){
		return y_min;
	}else if(y_value>y_max){
		return y_max;
	}else{
		return y_value;
	}
}

/**
 * 根据x值获得该值在绘图区的x象素值
 */
function get_x_pels(x_value){
	var result=x_axis_x1+x_value*x_step_pels;
	return result;
}

/**
 * 根据y值获得该值在绘图区的y象素值
 * 规则：绘图区最底部位置-传入的y值相对于y最小值的偏移量*每y值的象素数
 */
function get_y_pels(y_value){
	var temp_pels=(curve_height-line_top_blank-line_bottom_blank)/(y_max-y_min);
	var result=0;
	result=(curve_height-line_bottom_blank)-(y_value-y_min)*temp_pels;
	return result;
}

/**
 * 创建一个标签
 */
function create_label(x,y,text_value,sty){
	var text_node=svg_doc.createElement("text");
	text_node.setAttribute("Pointer-event",null);
	text_node.setAttribute("x",x);
	text_node.setAttribute("y",y);
	text_node.setAttribute("style",sty);
	
	var text=svg_doc.createTextNode(text_value);
	
	text_node.appendChild(text);
	curve_group.appendChild(text_node);
}

/**
 * (显示---隐藏)曲线和提示文本
 */
function hide_show_line(evt){
	var rect_obj=evt.target;
	var line_id=rect_obj.getAttribute("line_id");
	var is_show=rect_obj.getAttribute("is_show");
	var line_obj=svg_doc.getElementById(line_id);
	var text_obj=svg_doc.getElementById(line_id+"_text");
	if(is_show==1){
		line_obj.style.setProperty("opacity",0);
		text_obj.style.setProperty("opacity",0);
		rect_obj.style.setProperty("fill","#ffffff");
		rect_obj.setAttribute("is_show",0);
	}else{
		line_obj.style.setProperty("opacity",1);
		text_obj.style.setProperty("opacity",1);
		rect_obj.style.setProperty("fill",rect_obj.getAttribute("color_log"));
		rect_obj.setAttribute("is_show",1);
	}
}

/**
 * 屏蔽异常值
 * 范围：
 * 		上限：上限+标准参考值*0.1
 * 		下限：下限-标准参考值*0.1
 */
function mask_abnomal_value(x_values,y_values){
	var up_temp=up_limit*(1+up_overflow);
	var down_temp=down_limit*(1-down_overflow);
	var len=x_values.length;
	
	var x_value=0;
	var y_value=0;
	flag:
	for(var i=0;i<len;i++){
		x_value=x_values[i];
		y_value=y_values[i];
		if(x_value<0||x_value>x_steps){//超过x轴的绘制范围
			x_values[i]=null;
			y_values[i]=null;
			continue flag;
		}
		if(y_value<down_temp){
			x_values[i]=null;
			y_values[i]=null;
			continue flag;
		}
		if(y_value>up_temp){
			x_values[i]=null;
			y_values[i]=null;
			continue flag;
		}
	}
}

/**
 * 向曲线组中增加一条曲线
 */
function add_curve(curve_obj){
	curve_arr.push(curve_obj);
}
		
/**
 * 绘制曲线
 * 该函数完成实际绘制曲线的工作：1、在曲线区域按照曲线对象的x、y坐标值数组绘制曲线；
 * 							  2、在左侧添加一个控制该曲线是否显示的控制方块
 * 							  3、在对应曲线方块的右侧添加描述该曲线名称的文本
 * x_values,y_values:坐标点数组
 * color：曲线颜色
 * mask_flag：是否屏蔽异常值
 * size:曲线粗细
 * line_group_id:曲线组id
 */
function create_curve_line(x_values,y_values,color,mask_flag,size,line_group_id,line_name){
	//数据校验
	if(x_values==null||y_values==null){
		alert("没有为曲线设置数值！");
		return;
	}
	if(x_values.length!=y_values.length){
		alert("xy坐标数组长度不一致！");
		return;
	}
	//曲线颜色
	var line_color="blue";
	if(color!=null){
		line_color=color;
	}
	var line_size="1.5";
	if(size!=null){
		line_size=size;
	}
	//屏蔽异常值
	if(mask_flag){
		mask_abnomal_value(x_values,y_values);
	}
	//精度格式化
	var data_format_func=data_format;
	var y_values_len=y_values.length;
	for(var i=0;i<y_values_len;i++){
		y_values[i]=data_format_func(y_values[i]);
	}
	/**
	 * 创建曲线组
	 */
	var line_group=null;
	if(line_group_id!=null){
		line_group=svg_doc.createElement("g");
		line_group.setAttribute("id",line_group_id);
	}
	/**
	 * 开始绘制曲线
	 * 绘制规则：
	 * 		1、当前点没有值：跳过，继续循环
	 * 		2、当前点有值且下个点有值：在当前坐标点与下个坐标点之间绘制一条直线
	 * 		3、当前点有值但是下个点没有值：仅绘制一个点
	 */
	var x1,y1,x2,y2;
	var x1_pels,y1_pels,x2_pels,y2_pels;
	var sty="fill:"+line_color+";stroke:"+line_color+";stroke-width:"+line_size+";";
	var x_values_len=x_values.length;
	var create_line_func=create_line;		//缓存函数指针
	var get_x_pels_func=get_x_pels;
	var get_y_pels_func=get_y_pels;
	flag:
	for(var i=0;i<x_values_len;i++){
		x1=x_values[i];
		y1=y_values[i];
		x2=x_values[i+1];
		y2=y_values[i+1];
		if(x1==null||y1==null||isNaN(x1)||isNaN(y1)){	   //当前位置值是否合法
			continue flag;
		}else if(x2==null||y2==null||isNaN(x2)||isNaN(y2)){//探测下一个位置值是否合法
			continue flag;
		}else if((x2!=null)&&(y2!=null)){
			x1_pels=get_x_pels_func(x1);
			x2_pels=get_x_pels_func(x2);
			y1_pels=get_y_pels_func(y1);
			y2_pels=get_y_pels_func(y2);
			var line=null;
			if(line_group!=null){
				line=create_line_func(x1_pels,y1_pels,x2_pels,y2_pels,sty);
				line_group.appendChild(line);
			}else{
				line=create_line_func(x1_pels,y1_pels,x2_pels,y2_pels,sty);
				curve_group.appendChild(line);
			}
		}else{
			x1_pels=get_x_pels_func(x1);
			y1_pels=get_y_pels_func(y1);
			var line=null;
			if(line_group!=null){
				line=create_line_func(x1_pels,y1_pels,x1_pels,y1_pels,sty);
				line_group.appendChild(line);
			}else{
				line=create_line_func(x1_pels,y1_pels,x1_pels,y1_pels,sty);
				curve_group.appendChild(line);
			}
		}
	}
	
	if(line_group!=null){
		curve_group.appendChild(line_group);
	}
	
	/**
	 * 创建右侧标签
	 */
	if(line_group_id!=null){
		//第几个曲线
		var index=line_group_id.toString().replace("line_group_","");
		index=parseInt(index);
		
		//x,y坐标值
		var label_x=x_axis_x2+5;
		var lable_y=y_axis_y2+20*index;
		
		var rect_sty="fill:"+color+";stroke:red;stroke-width:1.5";
		var text_sty="fill:"+color+";stroke:"+color+";font-size:16;";
		var rect_node=svg_doc.createElement("rect");
		rect_node.setAttribute("x",label_x);
		rect_node.setAttribute("y",lable_y);
		rect_node.setAttribute("width",10);
		rect_node.setAttribute("height",10);
		rect_node.setAttribute("style",rect_sty);
		rect_node.setAttribute("color_log",color);
		rect_node.setAttribute("line_id",line_group_id);
		rect_node.setAttribute("is_show",1);
		rect_node.addEventListener("click",hide_show_line,false);
		curve_group.appendChild(rect_node);
		
		create_label(label_x+10+2,lable_y+10,line_name,text_sty);
	}
	/**
	 * 增加一条提示信息
	 */
	add_to_tip_group(line_name,color,line_group_id);
}

//==================================提示线、提示文本===========================
/**
 * 根据鼠标当前位置，遍历曲线数组，添加提示信息
 * 格式：“曲线名：时间（yyyy-mm-dd:hh24:mm:ss） 数值” 
 * 获取：1、曲线名；
 * 		2、时间；
 * 		3、y值
 */
function get_tip_msg(x_pels){
	//根据鼠标位置计算下标
	var x_index=parseInt((x_pels-x_axis_x1)/x_step_pels);
	//获取时间
	var hour=(x_index*5)/60;
	hour=parseInt(hour);
	var min=(x_index*5)%60;
	min=parseInt(min);
	//获取每个曲线名和曲线y值
	var curve_arr_len=curve_arr.length;
	var modify_text_value_func=modify_text_value;//缓存函数指针
	var name_temp="";
	var y_value="";
	var tip="";
	for(var i=0;i<curve_arr_len;i++){
		var curve_obj=curve_arr[i];
		if(curve_obj!=null){
			name_temp=curve_obj.name;
			y_value=curve_obj.y_values[x_index];
			if(y_value==null||isNaN(y_value)){
				y_value="没有值";
			}
			tip=curve_obj.name+">"+hour+"时"+min+"分  "+y_value;
			modify_text_value_func(curve_obj.line_group_id+"_text",tip);
		}
	}
}

/**
 * 修改提示信息内容
 */
function modify_text_value(text_node_id,new_text){
	var text_node=svg_doc.getElementById(text_node_id);
	for(var i=0;i<text_node.childNodes.length;i++){
		text_node.removeChild(text_node.childNodes.item(i));
	}
	var text=svg_doc.createTextNode(new_text);
	text_node.appendChild(text);
}

/**
 * 向提示信息组添加一条提示信息
 */
function add_to_tip_group(text_value,color,line_group_id){
	var last_node=text_group.childNodes.item(text_group.childNodes.length-1);
	var tip_msg_sty="fill:"+color+";font-size:20;stroke:"+color+";stroke-size:2;";
	var x_position=0;
	var y_position=0;
	if(last_node==null){									//文本组原来没有内容
		x_position=x_axis_x1;
		y_position=y_axis_y2+text_node.getBBox().height;
	}else{													//已经有内容
		x_position=last_node.getAttribute("x");
		y_position=last_node.getAttribute("y")+last_node.getBBox().height;
	}
	
	var text_node=svg_doc.createElement("text");
	text_node.setAttribute("id",line_group_id+"_text");
	text_node.setAttribute("x",x_position);
	text_node.setAttribute("y",y_position);
	
	text_node.setAttribute("style",tip_msg_sty);	
	var text=svg_doc.createTextNode(text_value);
	text_node.appendChild(text);
	text_group.appendChild(text_node);
}

/**
 * 移动一个文本组中的所有文本元素的位置到当前鼠标位置
 * 并刷新当前位置的时间值和y坐标值
 */
function move_text_group(cx,cy){
	var node_list=text_group.childNodes;
	if(node_list==null){
		return;
	}
	/**
	 * 刷新对应的时间值和y值
	 */
	get_tip_msg(cx);
	/**
	 * 移动文本组所有文本的位置
	 */
	var node_list_len=node_list.length;
	var x_position=0;//x坐标
	var y_position=0;//y坐标
	if(cx>(curve_width-line_left_blank-line_width/2)){
		for(var i=0;i<node_list_len;i++){
			var text_node=node_list.item(i);
			x_position=cx-text_node.getBBox().width-x_offset_to_cursor;
			text_node.setAttribute("x",x_position);
		}
	}else{
		for(var i=0;i<node_list_len;i++){
			var text_node=node_list.item(i);
			x_position=cx+x_offset_to_cursor;
			text_node.setAttribute("x",x_position);
		}
	}
	var tip_box=svg_doc.getElementById("tip_box");
	tip_box.setAttribute("x",x_position);
	var y_temp_min=99999999;
	var y_temp_max=-99999999;
	if(cy>(curve_height-line_bottom_blank-line_height/5)){
		for(var i=0;i<node_list_len;i++){
			var text_node=node_list.item(i);
			y_position=cy-(i+1)*text_node.getBBox().height;
			text_node.setAttribute("y",y_position);
			if(y_position>y_temp_max){
				y_temp_max=y_position;
			}
		}
		tip_box.setAttribute("y",parseInt(y_temp_max-tip_box.getAttribute("height"))+15);
	}else{
		for(var i=0;i<node_list_len;i++){
			var text_node=node_list.item(i);
			y_position=cy+y_offset_to_cursor+i*text_node.getBBox().height;
			text_node.setAttribute("y",y_position);
			if(y_position<y_temp_min){
				y_temp_min=y_position;
			}
		}
		tip_box.setAttribute("y",parseInt(y_temp_min)+5);
	}
	
	var width_temp=-99999999;
	var height_temp=20*(node_list_len-1);
	for(var i=0;i<node_list_len;i++){
		var text_node=node_list.item(i);
		if(text_node.getBBox().width>width_temp){
			width_temp=text_node.getBBox().width;
		}
	}
	tip_box.setAttribute("width",width_temp);
	tip_box.setAttribute("height",height_temp);		
}

/**
 *提示线、提示框跟随鼠标 
 */
function move_tipline_and_tipbox(evt){
	var cx=evt.clientX;
	var cy=evt.clientY;
	var tip_line=svg_doc.getElementById("tip_line");
	var tip_text=svg_doc.getElementById("tip_text");
	if(cx>=x_axis_x1&&cx<x_axis_x2){
		if(cy>=y_axis_y2&&cy<=y_axis_y1){
			//移动提示线位置
			tip_line.setAttribute("x1",cx);
			tip_line.setAttribute("x2",cx);
			//移动文本组中所有文本的位置并重新赋值
			move_text_group(cx,cy);
		}
	}
}

/**
 * 创建鼠标跟随提示线
 */
function create_tipline(){
	//创建提示线
	var tip_line=create_line(x_axis_x1,y_axis_y1,x_axis_x1,y_axis_y2,tip_line_sty,"tip_line");
	text_group.appendChild(tip_line);
	//创建阴影框
	var tip_box=svg_doc.createElement("rect");
	tip_box.setAttribute("id","tip_box");
	tip_box.setAttribute("x",0);
	tip_box.setAttribute("y",0);
	tip_box.setAttribute("width",0);
	tip_box.setAttribute("height",80);
	tip_box.setAttribute("style",tip_box_sty);
	text_group.appendChild(tip_box);
	//设置事件监听
	curve_group.addEventListener("mousemove",move_tipline_and_tipbox,false);
}

//=====================================绘制背景==================================
//绘图区背景初始化
function bg_init(){
	//创建一个矩形区域
	var rect_obj=svg_doc.createElement("rect");
	rect_obj.setAttribute("x",curve_left);
	rect_obj.setAttribute("y",curve_top);
	rect_obj.setAttribute("width",curve_width);
	rect_obj.setAttribute("height",curve_height);
	rect_obj.setAttribute("style","fill:url(#line_gradient);stroke:#000000;stroke-width:2;");
	
	//创建x轴
	var x_axis_style="stroke:red;stroke-width:2;marker-end:url(#end_arrow)";
	var x_axis=create_line(x_axis_x1,x_axis_y1,x_axis_x2,x_axis_y2,x_axis_style,"x_axis");
	
	//创建y轴
	var y_axis_style="stroke:red;stroke-width:2;marker-end:url(#end_arrow)";
	var y_axis=create_line(y_axis_x1,y_axis_y1,y_axis_x2,y_axis_y2,y_axis_style,"y_axis");
	
	curve_group.appendChild(rect_obj);
	axis_group.appendChild(x_axis);
	axis_group.appendChild(y_axis);
}

/**
 * x轴位置重新对准
 * 规则：1、y_min<=0将x轴位置对准到y=0
 * 		 2、y_min>0将x轴位置对准到y_min
 */
function aim_x_axis(){
	var x_axis_obj=svg_doc.getElementById("x_axis");
	var y_pels=0;
	if(y_min<=0){
		y_pels=get_y_pels(0);
	}else{
		y_pels=get_y_pels(y_min)
	}
	x_axis_obj.setAttribute("y1",y_pels);
	x_axis_obj.setAttribute("y2",y_pels);
}

/**
 * 创建网格线
 */
function create_grid(){
	var x1,y1,x2,y2;
	//平行于y轴的直线
	for(var i=0;i<=x_steps;i++){
		x1=x_axis_x1+x_step_pels*i;
		y1=x_axis_y1;
		x2=x1;
		y2=y_axis_y2;
		var temp_line=create_line(x1,y1,x2,y2,grid_sty);
		grid_group.appendChild(temp_line);
	}
	//平行于x轴的直线
	for(var i=0;i<=y_steps;i++){
		x1=x_axis_x1;
		y1=y_axis_y2+y_step_pels*i;
		x2=x_axis_x2;
		y2=y1;
		var temp_line=create_line(x1,y1,x2,y2,grid_sty);
		grid_group.appendChild(temp_line);
	}
}

/**
 * 创建y轴标签
 */
function create_y_label(){
	var x=y_label_left_blank;
	for(var i=0;i<=y_steps;i++){
		var y_value=y_min+i*y_value_per_step;
		var y=get_y_pels(y_value)+5;
		create_label(x,y,y_value,y_label_sty);
	}
}

/**
 * 创建y轴单位提示
 */
function create_y_union(){
	var x=y_label_left_blank/2;
	var y=y_axis_y2-15;
	create_label(x,y,y_union,union_sty);
}

/**
 * 创建x轴单位提示
 */
function create_x_union(){
	var x=x_axis_x2;
	var x_axis_obj=svg_doc.getElementById("x_axis");
	var y=x_axis_obj.getAttribute("y2");
	create_label(x,y,x_union,union_sty);
}

/**
 * 标题
 */
function create_curve_title(text_value){
	//创建外部路径
	var outer_path=svg_doc.createElement("path");
	var x1=curve_width/3;
	var y1=line_top_blank/2;
	var x2=x1*2;
	var y2=y1;
	var trace="M "+x1+" "+y1+" l"+" "+x2+" "+y2;
	outer_path.setAttribute("d",trace);
	//创建文字路径
	var text_path=svg_doc.createElement("textPath");
	text_path.setAttribute("xlink:href",outer_path);
	text_path.setAttribute("x",x1);
	text_path.setAttribute("y",y1);
	//创建文本对象
	var text_node=svg_doc.createElement("text");
	text_node.setAttribute("style",title_sty);
	
	var text=svg_doc.createTextNode(text_value);
	text_path.appendChild(text);
	text_node.appendChild(text_path);
	
	curve_group.appendChild(text_node);
}

/*
 *解析曲线坐标
 */
function parse_line_value(curve_obj,line_value){
	var x_values1=new Array();
	var y_values1=new Array();
	for(var i=0;i<line_value.length;i++){
		x_values1[i]=i;
		if(line_value[i]!=null&&(!isNaN(line_value[i]))){
			y_values1[i]=parseFloat(line_value[i]);
		}else{
			y_values1[i]=null;
		}
	}
	curve_obj.x_values=x_values1;
	curve_obj.y_values=y_values1;
}

/**
 * 参考线赋值
 */
function set_value(curve_obj,value){
	var x_values1=new Array();
	var y_values1=new Array();
	for(var i=0;i<288;i++){
		x_values1[i]=i;
		y_values1[i]=value;
	}
	curve_obj.x_values=x_values1;
	curve_obj.y_values=y_values1;
}

/**
 *曲线配置参数校验 
 */
function param_verify(param){
	if(param==null){
		return -1;
	}
	if(isNaN(param)){
		return -1;
	}
	if(param.toString().length==0){
		return -1;
	}
	return 0;
}

//=================================调用入口=======================================
/**
 * 工具函数：获取页面数据
 */
function get_param_for_curve(param_name){
  	var temp_obj=document.getElementById(param_name)
  	if(temp_obj==null){
  		return null;
  	}else{
  		return temp_obj.value;
  	}
}
/**
 * 主函数
 */
function main(evt){
	/**
	 *绘图区初始化
	 *完成背景和坐标轴的初始位置绘制
	 *该部分无条件执行 
	 */
	//参数初始化
	svg_doc=evt.target.ownerDocument;
	grid_group=svg_doc.getElementById("grid_group");
	curve_group=svg_doc.getElementById("curve");
	text_group=svg_doc.getElementById("text_group");
	axis_group=svg_doc.getElementById("axis_group");
	//背景初始化
	bg_init();
	/**
	 *参数获取和y轴标签上下限、x轴位置校准
	 *必须的参数有：
	 *		 data_precision:数值精度
	 *		 up_limit：曲线上限值
	 *		 down_limit：曲线下限值
	 *		 standard_limit：标准参照值(或平均值)
	 *		 y_min：y轴最小值
	 *		 y_max：y轴最大值
	 *		 y_value_per_step：y轴标签步长
	 *以上参数为必须的，在获取参数过程中只要出现一个异常即停止绘制曲线
	 */
	try{
		//获取配置参数
		var param_verify_func=param_verify;
		var data_precision_temp=get_param_for_curve("data_precision");
		var y_min_temp=get_param_for_curve("y_min");
		var y_max_temp=get_param_for_curve("y_max");
		var y_value_per_step_temp=get_param_for_curve("y_value_per_step");
		
		var param_arr=new Array();
		param_arr.push(data_precision_temp);
		param_arr.push(y_min_temp);
		param_arr.push(y_max_temp);
		param_arr.push(y_value_per_step_temp);
		//参数校验
		var param_arr_len=param_arr.length;
		for(var i=0;i<param_arr_len;i++){
			if(param_verify_func(param_arr[i])==-1){
			 	create_label(320,200,"参数错误,曲线绘制失败",err_msg_sty);
			 	return;
			}
		}
		data_precision=parseInt(data_precision_temp);
		y_min=parseInt(y_min_temp);
		y_maxp=parseInt(y_max_temp);
		y_value_per_step=parseInt(y_value_per_step_temp);
		
		//刷新数据
		y_steps=(y_max-y_min)/y_value_per_step;								   //y轴标签总步数
		x_step_pels=(curve_width-line_left_blank-line_right_blank)/x_steps;    //x轴每步象素数
		y_step_pels=(curve_height-line_top_blank-line_bottom_blank)/y_steps;   //y轴每步象素数
	}catch(ex){
		return;
	}
	create_grid();
	create_y_label();
	create_y_union();
	create_x_union();
	aim_x_axis();
	create_tipline();
	
	/**
	 * 获取标题
	 * 标题为可选参数
	 * 当出现解析异常时可以继续绘制曲线
	 */
	var curve_title_temp=get_param_for_curve("curve_title");
	if(curve_title_temp!=null){
		curve_title=curve_title_temp;
	}
	create_curve_title(curve_title);
	/**
	 * 开始创建曲线
	 */
	//获取参考线值，创建参考线对象:上限线、下限线、均值线
	var up_limit_temp=get_param_for_curve("up_limit");
	var down_limit_temp=get_param_for_curve("down_limit");
	var standard_limit_temp=get_param_for_curve("standard_limit");
	if(up_limit_temp!=null&&(!isNaN(up_limit_temp))){
		up_limit=parseInt(up_limit_temp);
		var curve_obj=new curve();
		curve_obj.line_group_id="line_group_0";
		curve_obj.name="上限 "+up_limit+"V";
		curve_obj.color=color_array[0];
		set_value(curve_obj,up_limit);
		add_curve(curve_obj);
	}
	if(standard_limit!=null&&(!isNaN(standard_limit))){
		standard_limit=parseInt(standard_limit_temp);
		var curve_obj=new curve();
		curve_obj.line_group_id="line_group_1";
		curve_obj.name="均值 "+standard_limit+"V";
		curve_obj.color=color_array[0];
		set_value(curve_obj,standard_limit);
		add_curve(curve_obj);
	}
	
	if(down_limit!=null&&(!isNaN(down_limit))){
		down_limit=parseInt(down_limit_temp);
		var curve_obj=new curve();
		curve_obj.line_group_id="line_group_2";
		curve_obj.name="下限 "+down_limit+"V";
		curve_obj.color=color_array[0];
		set_value(curve_obj,down_limit);
		add_curve(curve_obj);
	}
	
	//获取曲线值、创建曲线对象
	for(var i=0;i<10;i++){
		var line_id="line_value_"+i;
		var line_name="line_name_"+i;
		var line_value_temp=document.getElementById(line_id);
		var line_name_value=document.getElementById(line_name);
		if(line_value_temp){
			var line_value=line_value_temp.value.toString().split(",");;
			
			/**
			 * 以下if判断为测试数据
			 * 实际使用时请删除
			 */
			if(i==1){
				line_value=new Array();
				for(var j=0;j<288;j++){
					line_value[j]=10*Math.sin(j/2)+30;
				}
			}
			if(i==2){
				line_value=new Array();
				for(var j=0;j<288;j++){
					line_value[j]=10*Math.cos(j/2)-40;
				}
			}
			if(i==3){
				line_value=new Array();
				for(var j=0;j<288;j++){
					line_value[j]=2*(j%5);
				}
			}
			
			if(i==4){
				line_value=new Array();
				var p=new Array();
				var r=5;
				for(var j=0;j<288;j++){
					if(j%r==0){
						p.push(j);
					}
				}
				for(var k=0;k<p.length;k++){
					var ct=p[k];
					for(var tp=ct;tp<(ct+r);tp++){
						if(k%2){
							line_value[tp]=-10;
						}else{
							line_value[tp]=-20;
						}
					}
				}
			}
			
			var curve_obj=new curve();
			curve_obj.line_group_id="line_group_1"+i;
			curve_obj.name=line_name_value.value;
			curve_obj.color=color_array[i%5+1];
			parse_line_value(curve_obj,line_value);
			add_curve(curve_obj);
		}
	}
	
	//绘制曲线
	for(var i=0;i<curve_arr.length;i++){
		var curve_obj=curve_arr[i];
		curve_obj.create_line(curve_obj.x_values,curve_obj.y_values,curve_obj.color,curve_obj.mask_flag,curve_obj.size,curve_obj.line_group_id,curve_obj.name);
	}
}
	