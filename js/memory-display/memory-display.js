function memoryToAssci(memory, index, length)
{
  var stringbuilder = "";

  for(var i = 0; i < length; i++)
  {
    var cellVal = memory[index + i];
    var isAsciiChar = (32 <= cellVal && cellVal <= 126)

    if (cellVal == undefined || !isAsciiChar) 
    {
      stringbuilder += "."
      continue;
    }
    
    stringbuilder += String.fromCharCode(memory[index + i]);
  }

  return stringbuilder;
}

function memoryToCellList(memory, byteLine, memoryPointer, length)
{
  var cells = {}

  for(var i = 0; i < length; i++)
  {
    var value = memory[i + byteLine]
    if(value == undefined)
    {
      value = 0
    }

    cells[i + byteLine] = { Value: value }

    if(memoryPointer == i + byteLine)
    {
      cells[i + byteLine].Pointer = true; 
    }
  }

  return cells;
}

/*
We assume that every row will contain 8 bytes

{
  StartingCellIndex: 0,
  Cells: {
    0: { Value: 0 },
    1: { Value: 0 },
    2: { Value: 0 },
    ...
  },
  AsciiValue: "........"
}
*/
function memoryToDisplayObj(memory, byteLine, memoryPointer, length)
{
  var obj = {
    StartingCellIndex: byteLine,
    Cells: memoryToCellList(memory, byteLine, memoryPointer, length),
    AsciiValue: memoryToAssci(memory, byteLine, length)
  };

  return obj;
}

function displayObjToTableRow(displayObj)
{
  // Remove row before we insert the new one
  $('#memory-display #' + displayObj.StartingCellIndex).remove(); 
  var tr = $('<tr id="' + displayObj.StartingCellIndex + '"/>');
    
  tr.append("<td> 0x" + decimalToHex(displayObj.StartingCellIndex, 4) + "</td>");

  var keys = Object.keys(displayObj.Cells)
  for (var j = 0; j < keys.length; j++) 
  { 
      var pointer = keys[j]
      var cell = displayObj.Cells[pointer]

      var cellEle = $("<td>" + cell.Value + "</td>");

      if(cell.Pointer == true)
      {
        cellEle.addClass("current-memory")
      }
      
      cellEle.appendTo(tr)

      $('#memory-display tbody').append(tr);
  }

  tr.append("<td>" + displayObj.AsciiValue + "</td>");
}

function generateTable(memory, memoryPos)
{
  var linesOfMemory = Math.max(3, Math.ceil(memory.length / 8))
  for (var j = 0; j < linesOfMemory; j++) 
  { 
    displayObjToTableRow(memoryToDisplayObj(memory, j * 8, memoryPos, 8)) 
  }
}

function populateEmptyTable()
{
  generateTable([], 0)
}

function decimalToHex(d, padding) {
  var hex = Number(d).toString(16);
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

  while (hex.length < padding) {
      hex = "0" + hex;
  }

  return hex;
}

$(document).ready(function () {
  populateEmptyTable();
});

