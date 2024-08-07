/* 
* Setting up the board and its pieces for now
* 
*/

let legalSquares = [];
let isWhiteTurn = true;
const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const pieceImg = document.getElementsByTagName("img");


/* 
* functoin setupBoard will loop through the array boardSquares and for each "square"
* it will add an event listener for dragover and drop events 
*
* https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
* https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
*
* Im also going to use the chance to assign ID's to the squares in the form of 
* column + row with letters a - h for columns and 1  - 8 for rows
*
*/

setupBoard();
setupPieces();

function setupBoard()
{
    for(let i = 0; i < boardSquares.length; i++)
    {
        boardSquares[i].addEventListener("dragover", allowDrop); 
        boardSquares[i].addEventListener("drop", drop);

        let row = 8 - Math.floor(i / 8);
        let column = String.fromCharCode(97 + (i%8));
        let square = boardSquares[i]
        square.id = column + row;

    }
}



/*
* Similar to the previous function setupBoard, but setupPieces() will be setting up the pieces which will allow the pieces
* to be draggable and setting the event listner for the dragstart event
*
*/


function setupPieces()
{
    for ( let i = 0; i < pieces.length; i++)
    {
        pieces[i].addEventListener("dragstart", drag);
        pieces[i].setAttribute("draggable", true);
        pieces[i].id = pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
    }
    for ( let i = 0; i < pieceImg.length; i++)
        {
            pieceImg[i].setAttribute("draggable", false); // so that you aren't dragging images 
            
        }
}

// just to prevent an element from being dropped on another elemnt 

function allowDrop(act)
{
    act.preventDefault();
}

// this function retrives the target of the event, which is the piece

function drag(act)
{
    const piece = act.target;
    const pieceColor = piece.getAttribute("color");
    if((isWhiteTurn && pieceColor == "white") || (!isWhiteTurn && pieceColor == "black"))
    {
        act.dataTransfer.setData("text", piece.id);
    }

}


// retrieves the target of the drop event where the drop occureed and assigns it to the dest square variable
function drop(act)
{
    act.preventDefault();
    let data = act.dataTransfer.getData("text");
    const piece = document.getElementById(data);
    const destSquare = act.currentTarget;
    let destSquareId = destSquare.id;
    destSquare.appendChild(piece);
    isWhiteTurn = !isWhiteTurn;
}


