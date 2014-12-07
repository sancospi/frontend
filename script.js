program = [];
$(function () {
    $('.component').draggable({
        revert: true
    });
    $('.droppable').droppable({
        hoverClass: "droppable-active",
        drop: dropElement

    });
});

function getObj(type, index) {
    var obj = {
        type: type
    };
    switch (type) {
        case 'assign':
			getObjAssign(obj, index);
            break;
        case 'if':
            obj = getObjIf(obj, index);
            break;
        case 'input':
            break;
        case 'display':
            break;
    }
}

function getObjIf(obj, index) {
    bootbox.dialog({
                title: "If's Options",
                message: '' +
        '<div class="row">  ' +
            '<div class="col-sm-4 col-xs-4">' +
                '<select id="leftVariable" class="form-control">' +
                    '<option value="">Variable</option>'+
                    '<option value="a">a</option>'+
                    '<option value="b">b</option>'+
                    '<option value="c">c</option>'+
                    '<option value="x">x</option>'+
                    '<option value="y">y</option>'+
                    '<option value="z">z</option>'+
                '</select>' +
            '</div>' +
            '<div class="col-sm-4 col-xs-4">' +
                '<select id="operator" class="form-control">'+
                    '<option value="">Operator</option>'+
                    '<option value="<"><</option>'+
                    '<option value=">">></option>'+
                    '<option value="==">==</option>'+
                    '<option value="<="><=</option>'+
                    '<option value=">=">>=</option>'+
                    '<option value="!=">!=</option>'+
                '</select>' +
            '</div>' +
            '<div class="col-sm-4 col-xs-4">' +
                '<select id="rightVariable" class="form-control">' +
                    '<option value="">Variable</option>'+
                    '<option value="a">a</option>'+
                    '<option value="b">b</option>'+
                    '<option value="c">c</option>'+
                    '<option value="x">x</option>'+
                    '<option value="y">y</option>'+
                    '<option value="z">z</option>'+
                '</select>' +
            '</div>' +
        '</div>',
                buttons: {
                    success: {
                        label: "Save",
                        className: "btn-success",
                        callback: function () {
                            obj.ifTrue = [];
                            obj.ifFalse = [];
                            var left = $('#leftVariable').val();
                            var right = $('#rightVariable').val();
                            var operator = $('#operator').val();
                            obj.value = left + operator +right;
                            addElement(obj, index);
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

function getObjAssign(obj, index) {
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
							'<select id="variable" class="form-control">' +
							'<option value="">Variable</option>'+
							'<option value="a">a</option>'+
							'<option value="b">b</option>'+
							'<option value="c">c</option>'+
							'<option value="x">x</option>'+
							'<option value="y">y</option>'+
							'<option value="z">z</option>'+
							'</select>' +
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
                            addElement(obj, index);
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
    var obj = getObj(type, index);
}

function addElement(obj, index) {
    if(obj) {
        if (index !== undefined) {
            program[index][$(this).data('condition')].push(obj);
        } else {
            program.push(obj);
        }
    }
    console.log(program);
    drawArray();
}

function drawArray(array) {
    $('#tail').empty();
    var tag = '';
    $.each(program, function (index, value) {
        tag += drawElement(index, value);
    });
    $('#tail').append(tag + '<div class="row droppable"></div>');
    $('.droppable').droppable({
        hoverClass: "droppable-active",
        drop: dropElement
    });
}

function drawElement(index, value, nested) {
    var name = value.type;
    if(value.type == 'if') {
        name += ' ' + value.value;
    }
    var tag = '<a class="btn btn-default program col-xs-2 col-sm-2">' + name + '</a>';
    if (!nested) {
        tag = '<div class="row">' + tag + '</div>';
        if (value.type == 'if') {
            tag += drawIf(index, value);
        }
    }
    return tag;
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
                ret += '<div class="droppable col-xs-2 col-sm-2" data-condition="ifTrue" data-index="' + index + '">true</div>';
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
                ret += '<div class="droppable col-xs-2 col-sm-2" data-condition="ifFalse" data-index="' + index + '">false</div>';
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
        ret += '<div class="droppable col-xs-2 col-sm-2" data-condition="ifTrue" data-index="' + index + '">true</div>';
        if (falseLength < trueLength) {
            ret += '<div class="program col-xs-2 col-sm-2""></div>';
        }
    }
    if (!flagFalse) {
        if (falseLength > trueLength) {
            ret += '<div class="program col-xs-2 col-sm-2""></div>';
        }
        ret += '<div class="droppable col-xs-2 col-sm-2" data-condition="ifFalse" data-index="' + index + '">false</div>';
    }
    //}
    ret += '</div>';
    return ret;
} 

function displayPrompt(obj){
	bootbox.prompt(obj.message, function(result) {                
		if (result === null) {                                             
			obj.value = obj.variable + ',0';                             
		} else {
			obj.value = obj.variable + ',' + result;                             
		}
	});
	
}