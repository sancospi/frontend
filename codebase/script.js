program = [];
$(function () {
	$('.component').draggable({
		revert: true
	});
	$('.droppable').droppable({
		hoverClass: "droppable-active",
		drop: dropElement

	});
	$('#run').click(function(){
		run(0);
	});
});

function run(pc, instructions){
	var i = (pc == undefined ? 0 : pc)
	var instr = (instructions == undefined? program : instructions);
	$.each(instr.slice(i), function(index, obj){
		switch (obj.type) {
			case 'assign':
				eval(obj.variable + ' = ' + obj.value);
				break;
			case 'if':
				var logical_value = eval(obj.value);
				if(logical_value){
					var new_instructions = obj.ifTrue.concat(instr.slice(index+pc+1));
				} else{
					var new_instructions = obj.ifFalse.concat(instr.slice(index+pc+1));
				}
				run(0, new_instructions);
				return false;
				break;
			case 'input':
				bootbox.prompt(obj.message, function(result) {   
					obj.value = (result === null) ? 0 : result;
					eval(obj.variable + ' = ' + obj.value);
					run(index+pc+1, instructions);
				});
				return false;
				break;
			case 'display':
				var message = obj.message;
				if( obj.variable !== ''){
					message += ' ' + eval(obj.variable);
				}
				bootbox.alert(message,function(result){
					run(index+pc+1, instructions);
				});
				return false
				break;
		}
	});
}

function getObj(type, index, condition) {
	var obj = {
		type: type
	};
	switch (type) {
		case 'assign':
			getObjAssign(obj, index, condition);
			break;
		case 'if':
			obj = getObjIf(obj, index, condition);
			break;
		case 'input':
			getObjInput(obj, index, condition);
			break;
		case 'display':
			getObjDisplay(obj, index, condition);
			break;
	}
}

function getObjIf(obj, index, condition) {
	bootbox.dialog({
				title: "If's Options",
				message: '' +
	'<div class="row">' +
			'<div class="col-sm-offset-4 col-xs-offset-4 col-sm-4 col-xs-4">' +
				'<label class="form-label pull-right">Type</label>' +
			'</div>' +
			'<div class="col-sm-4 col-xs-4">' +
				'<select id="inputType" class="form-control col-sm-4 col-xs-4">' +
					'<option value="variable" selected>Variable</option>' +
					'<option value="constant">Constant</option>' +
				'</select>' +
			'</div>' +
	'</div>' +
		'<div class="row">  ' +
			'<div class="col-sm-4 col-xs-4">' +
				createVariableSelect("leftVariable", "form-control")+
			'</div>' +
			'<div class="col-sm-4 col-xs-4">' +
				'<select id="operator" class="form-control">'+
					'<option value="">Operator</option>'+
					'<option value="<">less than</option>'+
					'<option value=">">greater than</option>'+
					'<option value="==">equal to</option>'+
					'<option value="<=">less than or equal to</option>'+
					'<option value=">=">greater than or equal to</option>'+
					'<option value="!=">not equal to</option>'+
				'</select>' +
			'</div>' +
			'<div class="col-sm-4 col-xs-4">' +
							createVariableSelect("rightVariable", "form-control") +
							'<input type="number" placeholder="Constant" class="form-control" id="rightConstant" style="display:none;">' + 
			'</div>' +
		'</div>' + 
		'<script>' +
			'$("#inputType").change(function(){' + 
				'var option = $(this).val();' +
				'if(option == "constant") {' + 
					'$("#rightConstant").css("display", "");' + 
					'$("#rightVariable").css("display", "none");' + 
				'} else if(option == "variable") {' + 
					'$("#rightVariable").css("display", "");' + 
					'$("#rightConstant").css("display", "none");' + 
				'}' + 
			'});' +
		'</script>',
				buttons: {
					success: {
						label: "Save",
						className: "btn-success",
						callback: function () {
							obj.ifTrue = [];
							obj.ifFalse = [];
							var left = $('#leftVariable').val();
							var option = $('#inputType').val();
							if(option == "constant") {
								var right = $('#rightConstant').val();
							} else if(option == "variable") {
								var right = $('#rightVariable').val();
							}
							if(right + left + option) {
								var operator = $('#operator').val();
								obj.value = left + operator + right;
								addElement(obj, index, condition);
							} else {
								bootbox.alert('Please make a comparation eg: "a less than b"');
							}
						}
					},
					cancel:{
						label: "Cancel",
						className: "btn-danger",
						callback: function() {
							obj = undefined;
						}
					}
				}
			}
		);
}

function getObjInput(obj, index, condition) {
	bootbox.dialog({
				title: "Get user input",
				message: '<div class="row">  ' +
				'<div class="col-md-12"> ' +
				'<form class="form-horizontal"> ' +
					'<div class="form-group"> ' +
						'<label class="col-md-4 control-label" for="message">Message to display to user</label> ' +
						'<div class="col-md-4"> ' +
							'<input id="message" name="message" type="text" placeholder="Message for user" class="form-control input-md"> ' +
						'</div> ' +
					'</div> ' +
					'<div class="form-group"> ' +
						'<label class="col-md-4 control-label" for="variable">Where are you going the store the users input?</label> ' +
						'<div class="col-md-4">  ' +
							createVariableSelect("variable", "form-control")+
						'</div>' +
					'</div>' +
				 '</form></div></div>',
				buttons: {
					success: {
						label: "Save",
						className: "btn-success",
						callback: function () {
							obj.value = '';
							var msg = $('#message').val();
							var variable = $('#variable').val();
							obj.message = msg;
							obj.variable = variable;
							if(msg && variable){
								addElement(obj, index, condition);
							} else {
								bootbox.alert('Please enter a message and choose a variable');
							}
						}
					},
					cancel:{
						label: "Cancel",
						className: "btn-danger",
						callback: function() {
							obj = undefined;
						}
					}
				}
			}
		);
}

function getObjAssign(obj, index, condition) {
	bootbox.dialog({
				title: "Assign value to variable",
				message: '<div class="row">  ' +
				'<div class="col-md-12"> ' +
				'<form class="form-horizontal"> ' +
					'<div class="form-group"> ' +
						'<label class="col-md-4 control-label" for="variable">Variable</label> ' +
						'<div class="col-md-4">  ' +
							createVariableSelect("variable", "form-control")+
						'</div>' +
					'</div>' +
					'<div class="form-group"> ' +
						'<label class="col-md-4 control-label" for="assign_value">What do you want to assign?</label> ' +
						'<div class="col-md-4"> ' +
							'<input id="assign_value" name="assign_value" type="text" placeholder="x+5" class="form-control input-md"> ' +
						'</div> ' +
					'</div> ' +
				 '</form></div></div>',
				buttons: {
					success: {
						label: "Save",
						className: "btn-success",
						callback: function () {
							var variable = $('#variable').val();
							var value = $('#assign_value').val();
							obj.value = value;
							obj.variable = variable;
							if(value && variable) {
								addElement(obj, index, condition);
							} else {
								bootbox.alert('Please select a variable and enter an assignation');
							}
						}
					},
					cancel:{
						label: "Cancel",
						className: "btn-danger",
						callback: function() {
							obj = undefined;
						}
					}
				}
			}
		);
}

function getObjDisplay(obj, index, condition) {
	bootbox.dialog({
				title: "Display input to user",
				message: '<div class="row">  ' +
				'<div class="col-md-12"> ' +
				'<form class="form-horizontal"> ' +
					'<div class="form-group"> ' +
						'<label class="col-md-4 control-label" for="message">Message to display to user</label> ' +
						'<div class="col-md-4"> ' +
							'<input id="message" name="message" type="text" placeholder="Message for user" class="form-control input-md"> ' +
						'</div> ' +
					'</div> ' +
					'<div class="form-group"> ' +
						'<label class="col-md-4 control-label" for="variable">Append variable to the end?</label> ' +
						'<div class="col-md-4">  ' +
							createVariableSelect("variable", "form-control")+
						'</div>' +
					'</div>' +
				 '</form></div></div>',
				buttons: {
					success: {
						label: "Save",
						className: "btn-success",
						callback: function () {
							obj.value = '';
							var msg = $('#message').val();
							var variable = $('#variable').val();
							obj.message = msg;
							obj.variable = variable;
							if(msg && variable) {
								addElement(obj, index, condition);
							} else {
								bootbox.alert('Please enter a message and choose a variable');
							}
						}
					},
					cancel:{
						label: "Cancel",
						className: "btn-danger",
						callback: function() {
							obj = undefined;
						}
					}
				}
			}
		);
}

function dropElement(event, ui) {
	var type = ui.draggable.data('class');
	var index = $(this).data('index');
	if(type == 'if' && index !== undefined) {
		return;
	}
	var obj = getObj(type, index, $(this).data('condition'));
}

function addElement(obj, index, condition) {
	if(obj) {
		if (index !== undefined) {
			program[index][condition].push(obj);
		} else {
			program.push(obj);
		}
	}
	drawArray();
}

function drawArray(array) {
	$('#tail').empty();
	var tag = '';
	$.each(program, function (index, value) {
		tag += drawElement(index, value);
	});
	$('#tail').append(tag + '<div class="row"><div class="droppable col-xs-2 col-sm-2 text-center">main flow</div></div>');
	$('.droppable').droppable({
		hoverClass: "droppable-active",
		drop: dropElement
	});
	$('.pop').popover();
}

function drawElement(index, value, nested) {
	var name = value.type;
	if(value.type == 'if') {
		name += ' ' +  getOperator(value.value);
	} else if(value.type == 'assign') {
		var msg = value.variable + ' = ' + value.value;
	} else if(value.type == 'input') {
		var msg = 'Save input in ' + value.variable;
	} else if(value.type == 'display') {
		var msg = 'Show variable ' + value.variable + ' content';
	}
	var pop = '';
	if(msg){
		pop = 'data-container="body" data-toggle="popover" data-placement="top" data-content="'+msg+'"';
	}
	var tag = '<a class="btn btn-default program col-xs-2 col-sm-2 '+ (pop ? 'pop' : '') +'" '+pop+'>' + name + '</a>';
	if (!nested) {
		tag = '<div class="row">' + tag + '</div>';
		if (value.type == 'if') {
			tag += drawIf(index, value);
		}
	}
	return tag;
}

function getOperator(value) {
	var ret = value;
	ret = ret.replace('<=',' less than or equal to ');
	ret = ret.replace('>=',' greater than or equal to ');
	ret = ret.replace('==',' equal to ');
	ret = ret.replace('!=',' not equal to ');
	ret = ret.replace('<',' less than ');
	ret = ret.replace('>',' greater than ');
	return ret;
}

function drawIf(index, value) {
	var trueLength = value.ifTrue ? value.ifTrue.length : 0;
	var falseLength = value.ifFalse ? value.ifFalse.length : 0;
	var flagTrue = false;
	var flagFalse = false;
	var ret = '';
	for (var i = 0; i < Math.max(trueLength, falseLength); i++) {
		ret += '<div class="row">';
		if (i < trueLength) {
			ret += drawElement(i, value.ifTrue[i], true);
		} else {
			if (!flagTrue) {
				ret += '<div class="droppable col-xs-2 col-sm-2 text-center" data-condition="ifTrue" data-index="' + index + '">true</div>';
				if (falseLength < trueLength) {
					ret += '<div class="program col-xs-2 col-sm-2""></div>';
				}
				flagTrue = true;
			} else {
				ret += '<div class="program col-xs-2 col-sm-2""></div>';
			}
		}

		if (i < falseLength) {
			ret += drawElement(i, value.ifFalse[i], true);
		} else {
			if (!flagFalse) {
				if (falseLength > trueLength) {
					ret += '<div class="program col-xs-2 col-sm-2""></div>';
				}
				ret += '<div class="droppable col-xs-2 col-sm-2 text-center" data-condition="ifFalse" data-index="' + index + '">false</div>';
				flagFalse = true;
			} else {
				if (falseLength > trueLength) {

				}
				ret += '<div class="program col-xs-2 col-sm-2""></div>';
			}
		}
		ret += '</div>';
	}
	ret += '<div class="row">';
	//if(!trueLength && !falseLength) {
	if (!flagTrue) {
		ret += '<div class="droppable col-xs-2 col-sm-2 text-center" data-condition="ifTrue" data-index="' + index + '">true</div>';
		if (falseLength < trueLength) {
			ret += '<div class="program col-xs-2 col-sm-2""></div>';
		}
	}
	if (!flagFalse) {
		if (falseLength > trueLength) {
			ret += '<div class="program col-xs-2 col-sm-2""></div>';
		}
		ret += '<div class="droppable col-xs-2 col-sm-2 text-center" data-condition="ifFalse" data-index="' + index + '">false</div>';
	}
	//}
	ret += '</div>';
	return ret;
} 

function createVariableSelect(id, klass){
	return '<select id="'+ id +'" class="'+ klass +'">' +
				'<option value="">Variable</option>'+
				'<option value="a">a</option>'+
				'<option value="b">b</option>'+
				'<option value="c">c</option>'+
				'<option value="x">x</option>'+
				'<option value="y">y</option>'+
				'<option value="z">z</option>'+
			'</select>';
}