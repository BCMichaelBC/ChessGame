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
        const startSqID = piece.parentNode.id;
        getPossibleMoves(startSqID, piece);
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

    // legalSquares.includes() we do this to only allow a piece to dropped when the square id is among the legal ids
    if((isSquareTaken(destSquare) == "blank") && (legalSquares.includes(destSquareId)))
    {
        console.log(isSquareTaken(destSquare));
        destSquare.appendChild(piece);
        isWhiteTurn = !isWhiteTurn;
        legalSquares.length = 0;
        return
    }

// if the square is taken remove all of its childern before appending, should look like a capture.
    if(isSquareTaken(destSquare) != "blank" && legalSquares.includes(destSquareId))
    {
        console.log(isSquareTaken(destSquare));
        while(destSquare.firstChild)
        {
            destSquare.removeChild(destSquare.firstChild)
        }
        destSquare.appendChild(piece);
        isWhiteTurn = !isWhiteTurn;
        legalSquares.length = 0;
        return;

    }
}


/*
* @isSquareTaken function checks if a square is occupied by a piece
* if it is, the function returns the color of the piece, if not return "blank"
*
* This function will be used to prevent pieces from moving to squares that are already being used
* and it'll allow a capturing mechanic
*/
function isSquareTaken(square)
{
    // console.log(square.querySelector(".piece"));
    console.log(square)
    if(square.querySelector(".piece"))
    {
        const color = square.querySelector(".piece").getAttribute("color");
        console.log(color)
        return color;
    }
    else
    {
        return "blank";
    }


}

/* 
* Finding the lega moves for pieces is to determin the legal moves for 
* each peice
*/
function getPossibleMoves(startSqID, piece)
{
    const pieceColor = piece.getAttribute("color");
    if(piece.classList.contains("pawn"))
    {
        getPawnMoves(startSqID, pieceColor);
    }

    if(piece.classList.contains("knight"))
    {
        getKnightMoves(startSqID, pieceColor);
    }

    if(piece.classList.contains("rook"))
    {
        getRookMoves(startSqID, pieceColor);
    }

    if(piece.classList.contains("bishop"))
    {
        getBishopMoves(startSqID, pieceColor);
    }
}

function getPawnMoves(startSqID, pieceColor)
{
// pawn can capture diagonally
    checkPawnDiagCap(startSqID, pieceColor);
    checkPawnMoves(startSqID, pieceColor);
}


/*
* @checkPawnDiag function checks the two diagonal squares
* on the top left and right of the pawn. If there are pieces of the opposite
* color on those squares it adds them to the legalSquare array allowing you to capture
*/
function checkPawnDiagCap(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    let currentSquareID = currentFile + currentRank;
    let currentSquare = document.getElementById(currentSquareID);
    let SquareContent = isSquareTaken(currentSquare);
    const direction = pieceColor == "white" ? 1: -1;



    currentRank += direction;

    for(let i = -1; i <= 1; i+=2)
    {
        currentFile = String.fromCharCode(file.charCodeAt(0) + i);
        if(currentFile >= "a" && currentFile <= "h")
        {
            currentSquareID = currentFile+currentRank;
            currentSquare = document.getElementById(currentSquareID);
            SquareContent = isSquareTaken(currentSquare);

    // if a square is occupied by a piece of the opposite color, then the pawn can capture it 
    // thus the id should be added to the legal squares.

            if(SquareContent!= "blank" && SquareContent != pieceColor)
            {
                legalSquares.push(currentSquareID);
            }
        }
    }




}
function checkPawnMoves(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    let currentSquareID = currentFile + currentRank;
    let currentSquare = document.getElementById(currentSquareID);
    let SquareContent = isSquareTaken(currentSquare);
    const direction = pieceColor == "white" ? 1: -1;

    currentRank += direction;

    currentSquareID = currentFile+currentRank;
    currentSquare = document.getElementById(currentSquareID);
    SquareContent = isSquareTaken(currentSquare);
    if(SquareContent!= "blank" )
    {
        // if its not blank then there are no legal moves
        return;
    }
    legalSquares.push(currentSquareID);

    if(rankNum != 2 && rankNum != 7)
    {
        return;
    }
    currentRank += direction;
    currentSquareID = currentFile+currentRank;
    currentSquare = document.getElementById(currentSquareID);
    SquareContent = isSquareTaken(currentSquare);
    legalSquares.push(currentSquareID);


}

function getKnightMoves(startSqID, pieceColor)
{
    const file = startSqID.charCodeAt(0) - 97;
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;

// the the var is going to be an array list containing all possible moves for the knight,
// if a square is taken by a piece of same color it can not take otherwise it is a legal move
    const moves = [ 
        [-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1,-2], [-2, -1]
    ]


    // this is basically another function for the knight moves
    moves.forEach((move) =>
    {
        currentFile = file + move[0];
        currentRank = rankNum + move[1];
        if(currentFile >= 0 && currentFile <= 7 && currentRank > 0 && currentRank <= 8)
        {
            let currentSquareID = String.fromCharCode(currentFile + 97) + currentRank;
            let currentSquare = document.getElementById(currentSquareID);
            let SquareContent = isSquareTaken(currentSquare); 
            if(SquareContent != "blank" && SquareContent == pieceColor)
            {
                return;
            }
            legalSquares.push(currentSquareID); 

        }
    });

}

function getRookMoves(startSqID, pieceColor)
{
    /* 
    * These function will be responsble for moving the rook up down and left and right
    * inside each functoin it will be checking along the line where the rook can go is a 
    * legal square to take or not
    */
    moveToEightRank(startSqID, pieceColor);
    moveToFirstRank(startSqID, pieceColor);
    moveToAFile(startSqID, pieceColor);
    moveToHFile(startSqID, pieceColor);


}

function moveToEightRank(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentRank = rankNum;

    while(currentRank != 8)
    {
        currentRank++;
        let currentSquareID = file + currentRank;
        let currentSquare = document.getElementById(currentSquareID)
        let SquareContent = isSquareTaken(currentSquare);

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return; // if the square is not empty do nothing
        }
        legalSquares.push(currentSquareID); //otherwise push it on one of the legal squares that can be take by the rook

        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return;
            }
    }
    return;
}


function moveToFirstRank(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentRank = rankNum;

    while(currentRank != 1)
    {
        currentRank--;
        let currentSquareID = file + currentRank;
        let currentSquare = document.getElementById(currentSquareID)
        let SquareContent = isSquareTaken(currentSquare);

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return; // if the square is not empty do nothing
        }
        legalSquares.push(currentSquareID); //otherwise push it on one of the legal squares that can be take by the rook

        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return;
            }
    }
    return;
}


function moveToAFile(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;

    while(currentFile != "a")
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) - 1);
        let currentSquareID = currentFile + rank;
        let currentSquare = document.getElementById(currentSquareID)
        let SquareContent = isSquareTaken(currentSquare);

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return; // if the square is not empty do nothing
        }
        legalSquares.push(currentSquareID); //otherwise push it on one of the legal squares that can be take by the rook

        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return;
            }
    }
    return;
}

function moveToHFile(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;

    while(currentFile != "h")
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) + 1);
        let currentSquareID = currentFile + rank;
        let currentSquare = document.getElementById(currentSquareID)
        let SquareContent = isSquareTaken(currentSquare);

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return; // if the square is not empty do nothing
        }
        legalSquares.push(currentSquareID); //otherwise push it on one of the legal squares that can be take by the rook

        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return;
            }
    }
    return;
}

function getBishopMoves(startSqID, pieceColor)
{
    moveToEightRankHfile(startSqID, pieceColor); // top right  .. These are all diagonal movements
    moveToEightRankAfile(startSqID, pieceColor); // top left
    moveToFirstRankHfile(startSqID, pieceColor); // bottom right
    moveToFirstRankAfile(startSqID, pieceColor); // bottom left 
}

function moveToEightRankAfile(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;

    while(!(currentFile == "a" || currentRank == 8))
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) - 1); // going to the left
        currentRank++; // going up 

        let currentSquareID = currentFile + currentRank;
        let currentSquare = document.getElementById(currentSquareID);
        let SquareContent = isSquareTaken(currentSquare);

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return;
        }
        legalSquares.push(currentSquareID);
        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return;
            }
    }
}


function moveToEightRankHfile(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;

    while(!(currentFile == "h" || currentRank == 8))
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) + 1); // going to the right
        currentRank++; // going up 

        let currentSquareID = currentFile + currentRank;
        let currentSquare = document.getElementById(currentSquareID);
        let SquareContent = isSquareTaken(currentSquare);

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return;
        }
        legalSquares.push(currentSquareID);
        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return;
            }
    }
}


function moveToFirstRankAfile(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;

    while(!(currentFile == "a" || currentRank == 1))
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) - 1); // going to the left
        currentRank--; // going down 

        let currentSquareID = currentFile + currentRank;
        let currentSquare = document.getElementById(currentSquareID);
        let SquareContent = isSquareTaken(currentSquare);

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return;
        }
        legalSquares.push(currentSquareID);
        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return;
            }
    }
}



function moveToFirstRankHfile(startSqID, pieceColor)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;

    while(!(currentFile == "h" || currentRank == 1))
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) + 1); // going to the right
        currentRank--; // going down 

        let currentSquareID = currentFile + currentRank;
        let currentSquare = document.getElementById(currentSquareID);
        let SquareContent = isSquareTaken(currentSquare);

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return;
        }
        legalSquares.push(currentSquareID);
        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return;
            }
    }
}


