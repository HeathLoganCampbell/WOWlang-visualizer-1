
$(document).ready(function () {
  var editor = CodeMirror.fromTextArea($("#editor")[0],{
    lineNumbers: true,
    theme: "blackboard",
    styleSelectedText: true
  });


  var mark = editor.markText({line: 0, ch: 0}, {line: 0, ch: 0});

  const CMD_MEMORY_INC = "WOW"
  const CMD_MEMORY_DEC = "wow"
  const CMD_REG_INC = "woW"
  const CMD_REG_DEC = "Wow"
  const CMD_INPUT = "wOw"
  const CMD_OUTPUT = "WoW"
  const CMD_RESET = "w0w"
  const CMD_LOOP_OPEN = "WOw"
  const CMD_LOOP_CLOSE = "wOW"

  const HTML_EDITOR_ID = "editor";
  const HTML_OUTPUT_ID = "output";
  const HTML_INPUT_ID = "stdin";
  const HTML_RUN_BTN_ID = "interpret";
  const HTML_DELAY_ID = "delay";
  const HTML_MEMORY_ID = "memory-container";

  const MEMORY_SIZE_LIMIT = 256;
  const DELAY_MULTIPLIER = 100;

  $("#" + HTML_RUN_BTN_ID).click(function () {
    interpret(editor.getValue());
  });

  async function interpret(s) {
    var lines = s.split(/\r?\n/);
    var lineLengths = [];
    lines.forEach(line => lineLengths.push(line.length + 1));

    editor.setOption("readOnly", "nocursor");
    $("#memory-container").html("<div id=\"line0\">"+ "00000000 00 00 00 00 00 00 00 00 ........</div><div id=\"line1\">"+ "00000008 00 00 00 00 00 00 00 00 ........</div><div id=\"line2\">"+ "00000016 00 00 00 00 00 00 00 00 ........</div>");
    var mem = [0];
    var mem_pos = 0;
    var reg = 0;
    var brac_open_pos = [];
    var input = $("#" + HTML_INPUT_ID).val().split(" ");
    var current_input_pos = 0;

    var i = 0;
    while (i < s.length - 2) {
      i += 3;
      switch (s.substring(i - 3, i)) {
        case CMD_MEMORY_DEC:
          mem[mem_pos] = (((mem[mem_pos]-1)%MEMORY_SIZE_LIMIT)+MEMORY_SIZE_LIMIT)%MEMORY_SIZE_LIMIT;
          processLine(mem, mem_pos);
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;

        case CMD_REG_INC:
          if (mem_pos == mem.length - 1) {
            mem.push(0);
          }
          mem_pos++;
          if (parseInt($('#' + HTML_MEMORY_ID).children().last().attr('id').substring(4)) < Math.floor(mem_pos / 8)) {
            $("#" + HTML_MEMORY_ID).append("<div id=\"line" + Math.floor(mem_pos / 8) + "\">"+  (Math.floor(mem_pos / 8) * 8).toString().padStart(8,0) +" 00 00 00 00 00 00 00 00 ........</div>");
          }
          processLine(mem, mem_pos);
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;

        case CMD_INPUT:
          mem[mem_pos] = ((parseInt(input[current_input_pos++])%MEMORY_SIZE_LIMIT)+MEMORY_SIZE_LIMIT)%MEMORY_SIZE_LIMIT;
          processLine(mem, mem_pos);
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;

        case CMD_LOOP_CLOSE:
          if (mem[mem_pos] != 0) {
            i = brac_open_pos[brac_open_pos.length - 1];
          }
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;

        case CMD_REG_DEC:
          mem_pos--;
          processLine(mem, mem_pos);
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;

        case CMD_OUTPUT:
          document.getElementById(HTML_OUTPUT_ID).value += String.fromCharCode(mem[mem_pos]);
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;

        case CMD_LOOP_OPEN:
          brac_open_pos.push(i + 1);
          if (mem[mem_pos] == 0) {
            i = i + 1 + s.substring(i + 1).indexof(CMD_LOOP_CLOSE);
            brac_open_pos.pop();
          }
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;

        case CMD_MEMORY_INC:
          mem[mem_pos] = (((mem[mem_pos]+1)%MEMORY_SIZE_LIMIT)+MEMORY_SIZE_LIMIT)%MEMORY_SIZE_LIMIT;
          processLine(mem, mem_pos);
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;

        case CMD_RESET:
          mem[mem_pos] = 0;
          highlightElement(i-3,lineLengths,3);
          await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          break;
        case "woo":
          if (s[i] == "w") {
            reg = mem[mem_pos];
            i++;
            highlightElement(i-3,lineLengths,4);
            await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          }
          else {
            i -= 2;
          }
          break;
        case "WOO":
          if (s[i] == "W") {
            mem[mem_pos] += reg;
            i++;
            highlightElement(i-3,lineLengths,4);
            await sleep($("#" + HTML_DELAY_ID).val() * DELAY_MULTIPLIER);
          }
          else {
            i -= 2;
          }
          break;
        default:
          i -= 2;
      }
    }
    mark.clear();
    editor.setOption("readOnly", false);
  }

  function processLine(mem, mem_pos) {
    $('#memory-container').find('span').contents().unwrap();
    var startPos = Math.floor(mem_pos / 8) * 8;
    var output = startPos.toString().padStart(8,0) + " ";
    var display = "";
    for (var i = startPos; i < startPos + 8; i++) {
      if (i == mem_pos) {
        output += " <span class=\"current-memory\"> "
        display += "<span class=\"current-memory\">"
      }
      if (i > mem.length - 1) {
        output += "00 ";
        display += ".";
      }
      else {
        output += mem[i].toString(16).toUpperCase().padStart(2, '0') + " ";
        if ((mem[i] >= 32) && (mem[i] < 127)) {
          display += String.fromCharCode(mem[i]);
        }
        else {
          display += ".";
        }
      }
      if (i == mem_pos) {
        output += " </span> "
        display += "</span>"
      }
    }
    output += " " + display;

    $("#line" + Math.floor(mem_pos / 8)).html(output);
  }

  function highlightElement(pos, lineLengths, length){
    mark.clear();

    var currLine = 0;

    while (true){
      if (pos>=lineLengths[currLine]){
        pos-=lineLengths[currLine++];
      }
      else{
        //deal with line breaks
        mark = editor.markText({line: currLine, ch: pos}, {line: currLine, ch: pos + length}, {css: "background-color : red"});
        break;
      }
    }



  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


});
