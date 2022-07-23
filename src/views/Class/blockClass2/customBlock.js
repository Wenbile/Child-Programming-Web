import * as Blockly from 'blockly/core'

import * as hans from 'blockly/msg/zh-hans'

Blockly.setLocale(hans);//汉化

/**
 * 自定义组件注册
 */
Blockly.defineBlocksWithJsonArray(
    [
        //事件
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
        //指令
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
                                "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFIGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMDgtMjNUMTE6Mzk6NTQrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTA4LTIzVDExOjUxOjAxKzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA4LTIzVDExOjUxOjAxKzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmVkZGRkMGNlLTU4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",
                                "width": 50,
                                "height": 50,
                                "alt": "pencil down"
                            },
                            "1"
                        ],
                        [
                            {
                                "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFIGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMDgtMjNUMTE6NDA6MTErMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTA4LTIzVDExOjUyOjA2KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA4LTIzVDExOjUyOjA2KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjU3Y2UzN2ViLTQ0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",
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
    ]
);

/**
 * 自定义组件生成代码
 * @param block
 * @returns {string}
 */
Blockly.JavaScript['while_program_start'] = function (block) {
    block
    var while_content = Blockly.JavaScript.statementToCode(block, 'while_content');
    var code =
        'robot.init();\n'
        + while_content +
        'robot.stop();\n';
    return code;
};

Blockly.JavaScript['move'] = function (block) {
    var text_move_distance = block.getFieldValue('move_distance');
    var code = 'robot.move(' + text_move_distance + ');\n';
    return code;
};

Blockly.JavaScript['turn'] = function (block) {
    var dropdown_dirction = block.getFieldValue('dirction');
    var angle_degree = block.getFieldValue('degree');
    var code = 'robot.turn(' + dropdown_dirction + ', ' + angle_degree + ');\n';
    return code;
};

Blockly.JavaScript['arc'] = function (block) {
    var dropdown_dirction = block.getFieldValue('dirction');
    var angle_degree = block.getFieldValue('degree');
    var radius = block.getFieldValue('radius');
    var code = 'robot.arc(' + dropdown_dirction + ', ' + angle_degree + ',' + radius + ');\n';
    return code;
};

Blockly.JavaScript['draw'] = function (block) {
    var dropdown_pencilstate = block.getFieldValue('pencilState');
    var code = 'robot.drawable(' + dropdown_pencilstate + ');\n';
    return code;
};

Blockly.JavaScript['pencilcolor'] = function (block) {
    var number_red = block.getFieldValue('red') / 255.0;
    var number_green = block.getFieldValue('green') / 255.0;
    var number_blue = block.getFieldValue('blue') / 255.0;
    var code = 'await robot.pencilcolor(' + number_red + ',' + number_green + ',' + number_blue + ');\n';
    return code;
};
