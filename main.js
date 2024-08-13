/* 
* Setting up the board and its pieces for now
* 
*/

    /*
    * Instead of keeping a global variable legalSquares and modifying it wi th 
    * functions, we'll use the functoins for retrieving legal movesand 
    * it will return to legal Squars directly
    */

let boardSquaresArray = [];
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
fillBoardSquaresArray();



function fillBoardSquaresArray()
{

    /*
    *
    * This Function should be filled with infromation about the initial postition of 
    * the pieces on the chessboard. This array will be updated after each move to reflect the
    * current state of the chessboard.
    * 
    * each element in the array is containing the sqaureId, pieceId, pieceType
    * and pieceColor properties. the squareId property represents the square's
    * identifier, while the pieceId, pieceType, and pieceColor Properties
    * represent the identifier, type, and color of th epiece occupying the square
    * 
    */
    const boardSquares = document.getElementsByClassName("square");

    for(let i = 0; i < boardSquares.length; i++)
    {
        let row = 8 - Math.floor(i / 8);
        let column = String.fromCharCode(97 + (i % 8)); 
        let square = boardSquares[i];
        square.id = column + row; 
        let color = "";
        let pieceType = "";
        let pieceId = "";
        if(square.querySelector(".piece"))
        {
            const obj = square.querySelector(".piece");

            color = obj.getAttribute("color");
            pieceType = obj.classList[1];
            pieceId = obj.id;



        }
        else
        {
            color = "blank";
            pieceType = "blank";
            pieceId = "blank";
        }

        let arrayElement = 
        {
            squareId: square.id,
            pieceColor: color,
            pieceType: pieceType,
            pieceId: pieceId

        };

        boardSquaresArray.push(arrayElement);

    }
}

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

/*
* modfiying the drag event to send pieceId and startsqId to drop event it will also send legal squares arry to drop 
* event. in order to send array it has to be converted to JSON Sstring
*/ 

function drag(act)
{
    const piece = act.target;
    const pieceColor = piece.getAttribute("color");
    const pieceType = piece.classList[1];
    const pieceId = piece.id;

    if((isWhiteTurn && pieceColor == "white") || (!isWhiteTurn && pieceColor == "black"))
    {   
        const startSqID = piece.parentNode.id;
        act.dataTransfer.setData("text", piece.id + "|" + startSqID);
        const pieceObj = {pieceColor: pieceColor, pieceType: pieceType, pieceId: pieceId}
        let legalSquares = getPossibleMoves(startSqID, pieceObj, boardSquaresArray);

        let legalSquaresJson = JSON.stringify(legalSquares);
        act.dataTransfer.setData("application/json", legalSquaresJson);
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
    * making a new function called getPieceAtSquare to used in replace of isSqaureTaken 
    * this function shou;d return an object containing the properties of the piece occupying the square
    * 
    * This new functoin will first find the object with the sqaureId given then extract properties
    */
function getPieceAtSquare(squareId, boardSquaresArray)
{
    let currentSquare = boardSquaresArray.find((element) => element.squareId === squareId);
    const color = currentSquare.pieceColor;
    const pieceType = currentSquare.pieceType;
    const pieceId = currentSquare.pieceId;
    return {
        pieceColor : color,
        pieceType : pieceType,
        pieceId : pieceId
    };

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
    // console.log(square)

    
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
function getPossibleMoves(startSqID, piece, boardSquaresArray)
{
    const pieceColor = piece.pieceColor;
    const pieceType = piece.pieceType
    let legalSquares = [];
    if(pieceType == "pawn")
    {
        legalSquares = getPawnMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType = "knight")
    {
        legalSquares = getKnightMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType = "rook")
    {
        legalSquares = getRookMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType = "bishop")
    {
        legalSquares = getBishopMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType = "queen")
    {
        legalSquares = getQueenMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType = "king")
    {
        legalSquares = getKingMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

}

function getPawnMoves(startSqID, pieceColor,boardSquaresArray)
{
// pawn can capture diagonally
    let diagonalSquares = checkPawnDiagCap(startSqID, pieceColor, boardSquaresArray);
    let fowardSquares = checkPawnMoves(startSqID, pieceColor, boardSquaresArray);

    /*
    * we are merging the outputs of thee functions using the spread operator
    */

    let legalSquares = [... diagonalSquares, ... fowardSquares];
    return legalSquares;
}


/*
* @checkPawnDiag function checks the two diagonal squares
* on the top left and right of the pawn. If there are pieces of the opposite
* color on those squares it adds them to the legalSquares array allowing you to capture
*/
function checkPawnDiagCap(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    let currentSquareID = currentFile + currentRank;
    // let currentSquare = document.getElementById(currentSquareID);
    // let SquareContent = isSquareTaken(currentSquare);
    let legalSquares = [];
    const direction = pieceColor == "white" ? 1: -1;



    currentRank += direction;

    for(let i = -1; i <= 1; i+=2)
    {
        currentFile = String.fromCharCode(file.charCodeAt(0) + i);
        if(currentFile >= "a" && currentFile <= "h")
        {
            currentSquareID = currentFile+currentRank;
            // currentSquare = document.getElementById(currentSquareID);
            // SquareContent = isSquareTaken(currentSquare);
            let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
            const SquareContent = currentSquare.pieceColor;

    // if a square is occupied by a piece of the opposite color, then the pawn can capture it 
    // thus the id should be added to the legal squares.

            if(SquareContent!= "blank" && SquareContent != pieceColor)
            {
                legalSquares.push(currentSquareID);
            }
        }
    }


return legalSquares;

}
function checkPawnMoves(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    let currentSquareID = currentFile + currentRank;
    let legalSquares = [];
    // let currentSquare = document.getElementById(currentSquareID);
    // let SquareContent = isSquareTaken(currentSquare);

    const direction = pieceColor == "white" ? 1: -1;

    currentRank += direction;

    currentSquareID = currentFile+currentRank;
    // currentSquare = document.getElementById(currentSquareID);
    // SquareContent = isSquareTaken(currentSquare);

    let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
    let SquareContent = currentSquare.pieceColor;

    if(SquareContent!= "blank" )
    {
        // if its not blank then there are no legal moves
        return legalSquares;
    }
    legalSquares.push(currentSquareID);

    if(rankNum != 2 && rankNum != 7)
    {
        return legalSquares;
    }
    currentRank += direction;
    currentSquareID = currentFile+currentRank;
    currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
    SquareContent = currentSquare.pieceColor;

    if(SquareContent != "blank")
    {
        return legalSquares;
    }
    legalSquares.push(currentSquareID);
    return legalSquares;


}

function getKnightMoves(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charCodeAt(0) - 97;
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    let legalSquares = [];

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
            // let currentSquare = document.getElementById(currentSquareID);
            // let SquareContent = isSquareTaken(currentSquare); 
            let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
            let SquareContent = currentSquare.pieceColor;
            if(SquareContent != "blank" && SquareContent == pieceColor)
            {
                return legalSquares;
            }
            legalSquares.push(currentSquareID); 

        }
    });

    return legalSquares;

}

function getRookMoves(startSqID, pieceColor, boardSquaresArray)
{
    /* 
    * These function will be responsble for moving the rook up down and left and right
    * inside each functoin it will be checking along the line where the rook can go is a 
    * legal square to take or not
    */
    let moveToEightRankSquares = moveToEightRank(startSqID, pieceColor, boardSquaresArray); // up
    let moveToFirstRankSquares = moveToFirstRank(startSqID, pieceColor, boardSquaresArray); // down 
    let moveToAFileSquares = moveToAFile(startSqID, pieceColor, boardSquaresArray); // left 
    let moveToHFileSqaures = moveToHFile(startSqID, pieceColor, boardSquaresArray); // right

    let legalSquares = [... moveToEightRankSquares, ... moveToFirstRankSquares, ... moveToAFileSquares, ...moveToHFileSqaures];

    return legalSquares;


}

function moveToEightRank(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentRank = rankNum;
    let legalSquares = [];

    while(currentRank != 8)
    {
        currentRank++;
        let currentSquareID = file + currentRank;
        // let currentSquare = document.getElementById(currentSquareID)
        // let SquareContent = isSquareTaken(currentSquare);
        let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
        let SquareContent = currentSquare.pieceColor;

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return legalSquares; // if the square is not empty do nothing
        }
        legalSquares.push(currentSquareID); //otherwise push it on one of the legal squares that can be take by the rook

        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return legalSquares;
            }
    }
    return legalSquares;
}


function moveToFirstRank(startSqID, pieceColor,boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentRank = rankNum;
    legalSquares = [];

    while(currentRank != 1)
    {
        currentRank--;
        let currentSquareID = file + currentRank;
        // let currentSquare = document.getElementById(currentSquareID)
        // let SquareContent = isSquareTaken(currentSquare);
        let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
        let SquareContent = currentSquare.pieceColor;

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return legalSquares; // if the square is not empty do nothing
        }
        legalSquares.push(currentSquareID); //otherwise push it on one of the legal squares that can be take by the rook

        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return legalSquares;
            }
    }
    return legalSquares;
}


function moveToAFile(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let legalSquares = [];

    while(currentFile != "a")
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) - 1);
        let currentSquareID = currentFile + rank;
        let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
        let SquareContent = currentSquare.pieceColor;

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return legalSquares; // if the square is not empty do nothing
        }
        legalSquares.push(currentSquareID); //otherwise push it on one of the legal squares that can be take by the rook

        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return legalSquares;
            }
    }
    return legalSquares;
}

function moveToHFile(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let legalSquares = [];

    while(currentFile != "h")
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) + 1);
        let currentSquareID = currentFile + rank;
        // let currentSquare = document.getElementById(currentSquareID)
        // let SquareContent = isSquareTaken(currentSquare);
        let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
        let SquareContent = currentSquare.pieceColor;

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return legalSquares; // if the square is not empty do nothing
        }
        legalSquares.push(currentSquareID); //otherwise push it on one of the legal squares that can be take by the rook

        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return legalSquares;
            }
    }
    return legalSquares;
}

function getBishopMoves(startSqID, pieceColor, boardSquaresArray)
{
    // These are all diagonal movements
    let moveToEightRankHfileSquares = moveToEightRankHfile(startSqID, pieceColor, boardSquaresArray); // top right  
    let moveToEightRankAfileSquares = moveToEightRankAfile(startSqID, pieceColor, boardSquaresArray); // top left
    let moveToFirstRankHfileSquares = moveToFirstRankHfile(startSqID, pieceColor, boardSquaresArray); // bottom right
    let moveToFirstRankAfileSquares = moveToFirstRankAfile(startSqID, pieceColor, boardSquaresArray); // bottom left 

    let legalSquares = [... moveToEightRankHfileSquares, ...moveToEightRankAfileSquares, ... moveToFirstRankHfileSquares, ... moveToFirstRankAfileSquares];

    return legalSquares;
}

function moveToEightRankAfile(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    let legalSquares = [];

    while(!(currentFile == "a" || currentRank == 8))
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) - 1); // going to the left
        currentRank++; // going up 

        let currentSquareID = currentFile + currentRank;
        // let currentSquare = document.getElementById(currentSquareID);
        // let SquareContent = isSquareTaken(currentSquare);
        let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
        let SquareContent = currentSquare.pieceColor;

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return legalSquares;
        }
        legalSquares.push(currentSquareID);
        if(SquareContent != "blank" && SquareContent != pieceColor)
        {
            return legalSquares;
        }
    }

    return legalSquares;
}


function moveToEightRankHfile(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    legalSquares = [];

    while(!(currentFile == "h" || currentRank == 8))
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) + 1); // going to the right
        currentRank++; // going up 

        let currentSquareID = currentFile + currentRank;
        // let currentSquare = document.getElementById(currentSquareID);
        // let SquareContent = isSquareTaken(currentSquare);
        let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
        let SquareContent = currentSquare.pieceColor;

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return legalSquares;
        }
        legalSquares.push(currentSquareID);
        if(SquareContent != "blank" && SquareContent != pieceColor)
        {
            return legalSquares;
        }
    }

    return legalSquares;
}


function moveToFirstRankAfile(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    let legalSquares = [];

    while(!(currentFile == "a" || currentRank == 1))
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) - 1); // going to the left
        currentRank--; // going down 

        let currentSquareID = currentFile + currentRank;
        // let currentSquare = document.getElementById(currentSquareID);
        // let SquareContent = isSquareTaken(currentSquare);
        let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
        let SquareContent = currentSquare.pieceColor;

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return legalSquares;
        }
        legalSquares.push(currentSquareID);
        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return legalSquares;
            }
    }
    return legalSquares;
}



function moveToFirstRankHfile(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charAt(0);
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;
    let legalSquares = [];

    while(!(currentFile == "h" || currentRank == 1))
    {
        currentFile = String.fromCharCode(currentFile.charCodeAt(currentFile.length - 1) + 1); // going to the right
        currentRank--; // going down 

        let currentSquareID = currentFile + currentRank;
        // let currentSquare = document.getElementById(currentSquareID);
        // let SquareContent = isSquareTaken(currentSquare);
        let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
        let SquareContent = currentSquare.pieceColor;

        if(SquareContent != "blank" && SquareContent == pieceColor)
        {
            return legalSquares;
        }
        legalSquares.push(currentSquareID);
        if(SquareContent != "blank" && SquareContent != pieceColor)
            {
                return legalSquares;
            }
    }

    return legalSquares;
}


/*
* This function is interesting since we dont have to do much work 
* since the functions to move diagonally and vertical and horizonally have already been made
*/ 
function getQueenMoves(startSqID, pieceColor, boardSquaresArray)
{
    // moveToEightRankHfile(startSqID, pieceColor, boardSquaresArray); // top right  .. These are all diagonal movements
    // moveToEightRankAfile(startSqID, pieceColor, boardSquaresArray); // top left
    // moveToFirstRankHfile(startSqID, pieceColor, boardSquaresArray); // bottom right
    // moveToFirstRankAfile(startSqID, pieceColor, boardSquaresArray); // bottom left 
    // moveToEightRank(startSqID, pieceColor, boardSquaresArray); // up
    // moveToFirstRank(startSqID, pieceColor, boardSquaresArray);// down 
    // moveToAFile(startSqID, pieceColor, boardSquaresArray); // left 
    // moveToHFile(startSqID, pieceColor, boardSquaresArray); // right 
    let bishopMoves = getBishopMoves(startSqID, pieceColor, boardSquaresArray);
    let rookMoves = getRookMoves(startSqID, pieceColor, boardSquaresArray);
    
    let legalSquares = [... bishopMoves, ... rookMoves];

    return legalSquares;
}


/*
* King moves will be similar to the knight moves just one space tho, so we just need to adjust the movement
*/
function getKingMoves(startSqID, pieceColor, boardSquaresArray)
{
    const file = startSqID.charCodeAt(0) - 97;
    const rank = startSqID.charAt(1);
    const rankNum = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNum;

    let legalSquares = [];


    const moves = [ 
        [0, 1], [0, -1], [1, 1], [1, -1], [-1, 0], [-1, -1], [-1, 1], [1, 0]
    ]


    moves.forEach((move) =>
    {
        currentFile = file + move[0];
        currentRank = rankNum + move[1];
        if(currentFile >= 0 && currentFile <= 7 && currentRank > 0 && currentRank <= 8)
        {
            let currentSquareID = String.fromCharCode(currentFile + 97) + currentRank;
            // let currentSquare = document.getElementById(currentSquareID);
            // let SquareContent = isSquareTaken(currentSquare); 

            let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);
            let SquareContent = currentSquare.pieceColor;

            if(SquareContent != "blank" && SquareContent == pieceColor)
            {
                return legalSquares;
            }
            legalSquares.push(currentSquareID); 

        }
    });

    return legalSquares;

}
