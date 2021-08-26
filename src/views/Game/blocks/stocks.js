import * as Blockly from 'blockly/core'
import api from "../../../api"

/**
 * 自定义组件
 */

Blockly.defineBlocksWithJsonArray(
    [
      //events 事件
      {
        "type": "while_program_start",
        "message0": "当程序运行 %1 %2",
        "args0": [
          {
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "while_content"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#609FD6",
        "strokeColour": "#4088C8",
        "tooltip": "123",
        "helpUrl": "1"
      },
      //commands 指令
      {
        "type": "move",
        "message0": "移动 %1 CM",
        "args0": [
          {
            "type": "field_input",
            "name": "move_distance",
            "text": "50"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F7D233",
        "strokeColour": "#CCAD2B",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "turn",
        "message0": "向 %1 %2",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "dirction",
            "options": [
              [
                "左转",
                "0"
              ],
              [
                "右转",
                "1"
              ]
            ]
          },
          {
            "type": "field_angle",
            "name": "degree",
            "angle": 90
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F7D233",
        "strokeColour": "#CCAD2B",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "arc",
        "message0": "弧形 %1 %2 ，半径 %3 CM",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "dirction",
            "options": [
              [
                "向左",
                "0"
              ],
              [
                "向右",
                "1"
              ]
            ]
          },
          {
            "type": "field_angle",
            "name": "degree",
            "angle": 90
          },
          {
            "type": "field_number",
            "name": "radius",
            "value": 50,
            "min": 1,
            "max": 100
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F7D233",
        "strokeColour": "#CCAD2B",
        "tooltip": "",
        "helpUrl": ""
      },
        //setting 设置
      {
        "type": "draw",
        "message0": "设置 %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "pencilState",
            "options": [
              [
                {
                  "src": api.simulatorUrl + "pencil_down.png",
                  "width": 50,
                  "height": 50,
                  "alt": "pencil down"
                },
                "1"
              ],
              [
                {
                  "src": api.simulatorUrl + "pencil_up.png",
                  "width": 50,
                  "height": 50,
                  "alt": "pencil up"
                },
                "0"
              ]
            ]
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#81C679",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "pencilcolor",
        "message0": "设置笔颜色： 红 %1 绿 %2 蓝 %3",
        "args0": [
          {
            "type": "field_number",
            "name": "red",
            "value": 100,
            "min": 0,
            "max": 255
          },
          {
            "type": "field_number",
            "name": "green",
            "value": 100,
            "min": 0,
            "max": 255
          },
          {
            "type": "field_number",
            "name": "blue",
            "value": 100,
            "min": 0,
            "max": 255
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#81C679",
        "tooltip": "",
        "helpUrl": ""
      }
    ]);

/**
 * 自定义组件生成代码
 * @param block
 * @returns {string}
 */
Blockly.JavaScript['while_program_start'] = function (block) {
  block
  var while_content = Blockly.JavaScript.statementToCode(block, 'while_content');
  var code = 'robot.init();\n' +
      while_content +
      'robot.stop();\n';

  return code;
};

Blockly.JavaScript['move'] = function(block) {
  var text_move_distance = block.getFieldValue('move_distance');
  // TODO: Assemble JavaScript into code variable.
  var code = 'robot.move(' + text_move_distance + ');\n';
  return code;
};

Blockly.JavaScript['turn'] = function(block) {
  var dropdown_dirction = block.getFieldValue('dirction');
  var angle_degree = block.getFieldValue('degree');
  // TODO: Assemble JavaScript into code variable.
  var code = 'robot.turn(' + dropdown_dirction + ', ' + angle_degree + ');\n';
  return code;
};

Blockly.JavaScript['arc'] = function(block) {
  var dropdown_dirction = block.getFieldValue('dirction');
  var angle_degree = block.getFieldValue('degree');
  var radius = block.getFieldValue('radius');
  // TODO: Assemble JavaScript into code variable.
  var code = 'robot.arc(' + dropdown_dirction + ', ' + angle_degree + ',' + radius + ');\n';
  return code;
};

Blockly.JavaScript['draw'] = function(block) {
  var dropdown_pencilstate = block.getFieldValue('pencilState');

  // TODO: Assemble JavaScript into code variable.
  var code = 'robot.drawable('+ dropdown_pencilstate +');\n';
  return code;
};

Blockly.JavaScript['pencilcolor'] = function(block) {
  var number_red = block.getFieldValue('red') / 255.0;
  var number_green = block.getFieldValue('green') / 255.0;
  var number_blue = block.getFieldValue('blue') / 255.0;
  var code = 'await robot.pencilcolor('+ number_red +','+ number_green + ',' + number_blue +');\n';
  return code;
};