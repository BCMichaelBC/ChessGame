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
let moves = []; // keep track of moves made by both players
let isWhiteTurn = true;
let enPassantSquare = "blank";
// let  whiteKingSquare = "e1"; // dnot really need this anymore because of the new function getKingLastMove()
// let blackKingSquare = "e8";
const castlingSquares = ["g1", "g8", "c1", "c8"];
const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const pieceImg = document.getElementsByTagName("img");
let allowMovement = true;
const chessBoard = document.querySelector(".chessBoard");
let postitionArray = [];

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
let startingPosition = generateFEN(boardSquaresArray);
getEvaluation(startingPosition, function(evaluations){
    displayEvaluation(evaluations)
})


function makeMove(startSqID, destSquareId, pieceType, pieceColor, captured, promotedTo = "blank")
{
    moves.push({
        from: startSqID,
        to: destSquareId,
        pieceType: pieceType,
        pieceColor: pieceColor,
        captured: captured,
        promotedTo : promotedTo
    });
}


    /* 
    * this function will generate FEN rules of a position, and will be used to check 
    * for threefold repetition, insufficient materal, and 50-move rule draw.
    * 
    * FEN stands for Forsyth-Edwards Notation. it is a standard notation for describing a particular
    * position of a chess game. the purpose of FEN is to provide all the necessary information to 
    * restart a game from a particular position
    */
function generateFEN(boardSquares)
{
    let fen = "";
    let rank = 8;
    while(rank >= 1)
    {
        for(let file = "a"; file <= "h"; file = String.fromCharCode(file.charCodeAt(0) + 1))
        {
            const square = boardSquares.find((element) => element.squareId === `${file}${rank}`);

            if(square && square.pieceType)
            {
                let pieceNotation = "";
                switch (square.pieceType)
                {
                    case "pawn":
                        pieceNotation = "p";
                        break;
                    
                    case "bishop":
                        pieceNotation = "b";
                        break;

                    case "knight":
                        pieceNotation = "n";
                        break;

                    case "rook":
                        pieceNotation = "r";
                        break;

                    case "queen":
                        pieceNotation = "q";
                        break;

                    case "king":
                        pieceNotation = "k";
                        break;

                    case "blank":
                        pieceNotation = "blank";
                        break;
                        
                }

                fen += square.pieceColor === "white" ? pieceNotation.toUpperCase() : pieceNotation;


            }
            
        }
        if(rank > 1)
        {
            fen += "/";
        }
        rank --;
    }
    fen = fen.replace(new RegExp("blankblankblankblankblankblankblankblank", "g"),"8");
    fen = fen.replace(new RegExp("blankblankblankblankblankblankblank", "g"),"7");
    fen = fen.replace(new RegExp("blankblankblankblankblankblank", "g"),"6");
    fen = fen.replace(new RegExp("blankblankblankblankblank", "g"),"5");
    fen = fen.replace(new RegExp("blankblankblankblank", "g"),"4");
    fen = fen.replace(new RegExp("blankblankblank", "g"),"3");
    fen = fen.replace(new RegExp("blankblank", "g"),"2");
    fen = fen.replace(new RegExp("blank", "g"),"1");

    fen += isWhiteTurn ? " w " : " b ";


    let castlingString = "";

    let shortCastlePossibleForWhite = !kingHasMoved("white") && !rookHasMoved("white", "h1");
    let longCastlePossibleForWhite = !kingHasMoved("white") && !rookHasMoved("white", "a1");
    let shortCastlePossibleForBlack = !kingHasMoved("black") && !rookHasMoved("black", "h8");
    let longCastlePossibleForBlack = !kingHasMoved("black") && !rookHasMoved("black", "a8");

    if(shortCastlePossibleForWhite)
        castlingString += "K";

    if(longCastlePossibleForWhite)
        castlingString += "Q";

    if(shortCastlePossibleForBlack)
        castlingString += "k";

    if(longCastlePossibleForBlack)
        castlingString += "q";

    if(castlingString == "")
        castlingString += "-";

    castlingString += " ";

    fen += castlingString;

    fen += enPassantSquare == "blank" ? "-" : enPassantSquare;

    let fiftyMovesRuleCount = getFiftyMovesRuleCount();
    fen += " " + fiftyMovesRuleCount;
    let moveCount = Math.floor(moves.length / 2 ) + 1;
    fen += " " + moveCount;
    console.log(fen);
    return fen;

}



function fillBoardSquaresArray()
{

    /*
    *
    * This Function should be filled with infromation about the initial postition of 
    * the pieces on the chessboard. This array will be updated after each move to reflect the
    * current state of the chessboard.
    * 
    * each element in the array is containing the squareId, pieceId, pieceType
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
* a deep copy of an array measn creating a new array and copying over the value, 
* so that changes made to the new array do not affect the original
*
* The map method is a built in javaScript functoin that creates a new array populated with the 
* results of calling a provided function on every element in the calling array.
*/
function deepCopyArray(array)
{
let arrayCopy = array.map(element => {
    return {... element}
});
return arrayCopy;
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
    if(!allowMovement)
    {
        return;
    } 
    
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
    let [pieceId , startSqID] = data.split("|"); // preparing to revcive json data
    let legalSquaresJson = act.dataTransfer.getData("application/Json");
    if(legalSquaresJson.length == 0 )
    {
        return;
    }
    let legalSquares = JSON.parse(legalSquaresJson);

    const piece = document.getElementById(pieceId);
    const pieceColor = piece.getAttribute("color");
    const pieceType = piece.classList[1];
    const destSquare = act.currentTarget;
    let destSquareId = destSquare.id;


    legalSquares = isMoveValidAgainstCheck(pieceColor, pieceType, startSqID, legalSquares);

    if(pieceType == "king")
    {
        let isCheck = isKingInCheck(destSquareId, pieceColor, boardSquaresArray);
        if(isCheck)
            return;
        // isWhiteTurn ? (whiteKingSquare = destSquareId) : (blackKingSquare = destSquareId)
    }

    let SquareContent = getPieceAtSquare(destSquareId, boardSquaresArray);

    // legalSquares.includes() we do this to only allow a piece to dropped when the square id is among the legal ids
    if((SquareContent.pieceColor == "blank") && (legalSquares.includes(destSquareId)))
    {
        // console.log(isSquareTaken(destSquare));
        let isCheck = false;
        if(pieceType == "king")
        {
            isCheck = isKingInCheck(startSqID, pieceColor, boardSquaresArray);
        }
        if(pieceType == "king" && !kingHasMoved(pieceColor) && castlingSquares.includes(destSquareId) 
            && !isCheck)
        {
            performCastling(piece, pieceColor, startSqID, destSquareId, boardSquaresArray);
            return;
        }

        if(pieceType == "king" && !kingHasMoved(pieceColor) && castlingSquares.includes(destSquareId) 
            && isCheck)
        {
            return;
        }

        if(pieceType == "pawn" && enPassantSquare == destSquareId) 
        {
            performEnPassant(piece, pieceColor, startSqID, destSquareId);
            return;
        }

        enPassantSquare = "blank";

        if(pieceType == "pawn" && (destSquareId.charAt(1) == 8 || 
        destSquareId.charAt(1) == 1) )
        {
            allowMovement = false;
            displayPromotionChoices(pieceId, pieceColor, startSqID, destSquareId, false);
            updateBoardSquaresOpacity();
            return;
        }




        destSquare.appendChild(piece);
        isWhiteTurn = !isWhiteTurn;
        // legalSquares.length = 0;
        updateBoardSquaresArray(startSqID, destSquareId, boardSquaresArray );
        let captured = false;
        makeMove(startSqID, destSquareId, pieceType, pieceColor, captured);
        checkForEndGame(); // checking for checkmate after every drop
        return;
    }

// if the square is taken remove all of its childern before appending, should look like a capture.
    if(SquareContent.pieceColor != "blank" && legalSquares.includes(destSquareId))
    {
        if(pieceType == "pawn" && (destSquareId.charAt(1) == 8 || 
        destSquareId.charAt(1) == 1) )
        {
            allowMovement = false;
            displayPromotionChoices(pieceId, pieceColor, startSqID, destSquareId, true);
            updateBoardSquaresOpacity();
            return;
        }
        // console.log(isSquareTaken(destSquare));
        while(destSquare.firstChild)
        {
            destSquare.removeChild(destSquare.firstChild)
        }
        destSquare.appendChild(piece);
        isWhiteTurn = !isWhiteTurn;
        // legalSquares.length = 0;
        updateBoardSquaresArray(startSqID, destSquareId, boardSquaresArray );
        let captured = true;
        makeMove(startSqID, destSquareId, pieceType, pieceColor, captured);
        checkForEndGame();
        return;

    }
}


    /*
    * This functoin takes startSqID and the destSquareId arguemnts and updates there 
    * respective objects in the boardSquaresArray after each move. this means removing the piece
    * from the start square and adding it to the destination square.
    */
function updateBoardSquaresArray(currentSquareID, destSquareId, boardSquaresArray, promotionOption = "blank")
{
    let currentSquare = boardSquaresArray.find((element) => element.squareId === currentSquareID);

    let destSquareElement =  boardSquaresArray.find((element) => element.squareId === destSquareId);

    let pieceColor = currentSquare.pieceColor;
    let pieceType = promotionOption == "blank" ? currentSquare.pieceType: promotionOption;
    let pieceId = promotionOption == "blank" ? currentSquare.pieceId : promotionOption + currentSquare.pieceId

    destSquareElement.pieceColor = pieceColor;
    destSquareElement.pieceType = pieceType;
    destSquareElement.pieceId = pieceId;

    currentSquare.pieceColor = "blank";
    currentSquare.pieceType = "blank";
    currentSquare.pieceId =  "blank";
}





    /*
    * making a new function called getPieceAtSquare to used in replace of issquareTaken 
    * this function shou;d return an object containing the properties of the piece occupying the square
    * 
    * This new functoin will first find the object with the squareId given then extract properties
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



    /* this function will search the moves array to find the last move made by the king */

    /* 
    * with this function there is no ned to save the king's last square anymore
    * so we can modify isMoveValidAginstCheck function and checkForCheckMate function
    * to just use this new function
    */

function getKingLastMove(color)
{
    let kingLastMove = moves.find( element => element.pieceType === "king" && element.pieceColor === color);
    
    if(kingLastMove == undefined)
        return isWhiteTurn ? "e1" : "e8";

    /* 
    * even though when i searched it up .to is used for readablity so i thought it wouldnt be needed 
    * but it turns out without it the function getRookMoves can not read it properly and is 
    * returning an error because of the charAt function not being able to grab it
    */
    return kingLastMove.to; 
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

    if(pieceType == "knight")
    {
        legalSquares = getKnightMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType == "rook")
    {
        legalSquares = getRookMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType == "bishop")
    {
        legalSquares = getBishopMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType == "queen")
    {
        legalSquares = getQueenMoves(startSqID, pieceColor, boardSquaresArray);
        return legalSquares;
    }

    if(pieceType == "king")
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

            if(SquareContent == "blank")
            {
                currentSquareID = currentFile + rank;
                let pawnStartingSquareRank = rankNum + direction * 2;
                let pawnStartingSquareId = currentFile + pawnStartingSquareRank;


                if(enPassantPossible(currentSquareID, pawnStartingSquareId, direction))
                {
                    let pawnStartingSquareRank = rankNum + direction;
                    let enPassantSquare = currentFile + pawnStartingSquareRank;
                    legalSquares.push(enPassantSquare);
                }
            }
        }
    }


return legalSquares;

}

    /*
    * this function will take the square If of the square next to the pawn and the square Id of the square
    * two squares behind it as arguments.
    * 
    * the function will also check if, in the last move, a pawn moved from the square two squares behind 
    * to the square next to the pawn. if this is true and the piece that moved is a pawn then an en passant move is possible
    */
function enPassantPossible(currentSquareID, pawnStartingSquare, direction)
{
    if(moves. length == 0)
        return false;

    let lastMove = moves[moves.length - 1];
    if(!(lastMove.to === currentSquareID && lastMove.from === pawnStartingSquare && lastMove.pieceType == "pawn"))
        return false;

    file = currentSquareID[0];
    rank = parseInt(currentSquareID[1]);
    rank += direction;
    let squareBehindId = file + rank;
    enPassantSquare = squareBehindId;
    return true;
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

    if( !((rankNum == 2 && pieceColor == "white") || (rankNum == 7 && pieceColor == "black")) )
    {
        return legalSquares;
    }
    currentRank += direction;
    currentSquareID = currentFile + currentRank;
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
    let moveToHFileSquares = moveToHFile(startSqID, pieceColor, boardSquaresArray); // right

    let legalSquares = [... moveToEightRankSquares, ... moveToFirstRankSquares, ... moveToAFileSquares, ...moveToHFileSquares];

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

    // trying to enable castling 
    let shortCastle = isShortCastlePossble(pieceColor, boardSquaresArray);
    let longCastle = isLongCastlePossible(pieceColor, boardSquaresArray);
    if(shortCastle != "blank")
        legalSquares.push(shortCastle);

    if(longCastle != "blank")
        legalSquares.push(longCastle);
    return legalSquares;

}


function isKingInCheck(squareId, pieceColor, boardSquaresArray)
{
    let legalSquares = getRookMoves(squareId, pieceColor, boardSquaresArray);

    for(let squareId of legalSquares)
    {
        let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
        if(pieceProperties.pieceType == "rook" || pieceProperties.pieceType == "queen" && pieceColor != pieceProperties.pieceColor)
        {
            return true;
        }
    }

    legalSquares = getBishopMoves(squareId, pieceColor, boardSquaresArray);

    for(let squareId of legalSquares)
    {
        let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
        if(pieceProperties.pieceType == "bishop" || pieceProperties.pieceType == "queen" && pieceColor != pieceProperties.pieceColor)
        {
            return true;
        }
    }

    legalSquares = checkPawnDiagCap(squareId, pieceColor, boardSquaresArray);

    for(let squareId of legalSquares)
    {
        let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
        if(pieceProperties.pieceType == "pawn" && pieceColor != pieceProperties.pieceColor)
        {
            return true;
        }
    }

    legalSquares = getKnightMoves(squareId, pieceColor, boardSquaresArray);

    for(let squareId of legalSquares)
    {
        let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
        if(pieceProperties.pieceType == "knight" && pieceColor != pieceProperties.pieceColor)
        {
            return true;
        }
    }
    

    legalSquares = getKingMoves(squareId, pieceColor, boardSquaresArray);

    for(let squareId of legalSquares)
    {
        let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
        if(pieceProperties.pieceType == "king" && pieceColor != pieceProperties.pieceColor)
        {
            return true;
        }
    }

    return false;
}


    /*
    * this function will take piece features and the starting sq and legal sqs
    * it will then check if playing those legal moves will put the king in check 
    * by playing them on the copy of the boardSquaresArray. if it puts in check 
    * it will be filterd out as a legal move thus allowing the tacting called "pinning"
    */

function isMoveValidAgainstCheck(pieceColor, pieceType, startSqID, legalSquares)
{
    let kingSquare = getKingLastMove("white");
    if(isWhiteTurn)
    {
        kingSquare = getKingLastMove("white");
    }
    else
    {
        kingSquare = getKingLastMove("black");
    }

    let boardSquaresArrayCopy = deepCopyArray(boardSquaresArray); 

    let legalSquaresCopy = legalSquares.slice();

    legalSquaresCopy.forEach((element) =>{
        let destinationId = element;
        boardSquaresArrayCopy = deepCopyArray(boardSquaresArray); 
        updateBoardSquaresArray(startSqID, destinationId, boardSquaresArrayCopy);
        if(pieceType != "king" && isKingInCheck(kingSquare, pieceColor, boardSquaresArrayCopy))
        {
            legalSquares = legalSquares.filter((item) => item != destinationId);
        }

        if(pieceType == "king" && isKingInCheck(destinationId, pieceColor, boardSquaresArrayCopy))
        {
            legalSquares = legalSquares.filter((item) => item != destinationId);
        }
    })

    return legalSquares;
}



function checkForEndGame()
{
    checkForCheckMateAndStaleMate();
    let currentPosition = generateFEN(boardSquaresArray);
    getEvaluation(currentPosition, function(evaluations)
{
    displayEvaluation(evaluations);
});
    postitionArray.push(currentPosition);
    let insufficientMaterial = hasInsufficientMaterial(currentPosition);
    let threeFoldRepetition = isThreefoldRepetition();
    let fiftyMovesRuleCount = currentPosition.split(" ")[4];
    fiftymovesRule = fiftyMovesRuleCount != 100 ? false : true
    let isDraw = threeFoldRepetition || insufficientMaterial || fiftymovesRule;
    if(isDraw )
    {
        allowMovement = false;
        showAlert("Draw");
    }
}


    /* 
    * the checkMate function will check if there are no legal moves for all pieces on one side
    * if there arent then it is checkmate and some one has won
    * 
    * ***Edited it to also when there a no more available moves just say its a draw
    */

function checkForCheckMateAndStaleMate()
{
    let kingSquare = isWhiteTurn ? getKingLastMove("white") :getKingLastMove("black");
    let pieceColor = isWhiteTurn ? "white" : "black";
    let boardSquaresArrayCopy = deepCopyArray(boardSquaresArray);
    let kingIsCheck = isKingInCheck(kingSquare, pieceColor, boardSquaresArrayCopy);
    
    // if(!kingIsCheck) 
    //     return;

    let possibleMoves = getAllPossibleMoves(boardSquaresArrayCopy, pieceColor); 

    if(possibleMoves.length > 0)
        return;
    let message = "";
    if(kingIsCheck)

    isWhiteTurn ? message = "Black Wins!" : message = "White Wins!";

    else
    message = "Draw";

    showAlert(message);

}

function getFiftyMovesRuleCount()
{
    let count = 0;
    for ( let i = 0; i < moves.length; i++)
    {
        count++;
        if(moves[i].captured || moves[i].pieceType =="pawn" || moves[i].promotedTo != "blank")
            count = 0;
    }
    return count;
}


function isThreefoldRepetition()
{
    return postitionArray.some((string) => {
        const fen = string.split(" ").slice(0, 4).join(" ");
        return postitionArray.filter(
            (element) => element.split(" ").slice(0, 4).join(" ") === fen).length >= 3
    });
}

function hasInsufficientMaterial(fen)
{
    const piecePlacement = fen.split(" ")[0];
    const whiteBishops = piecePlacement.split("").filter(char => char === 'B').length;
    const blackBishops = piecePlacement.split("").filter(char => char === 'b').length;
    const whiteKnights = piecePlacement.split("").filter(char => char === 'N').length;
    const blackKnights = piecePlacement.split("").filter(char => char === 'n').length;
    const whiteQueens = piecePlacement.split("").filter(char => char === 'Q').length;
    const blackQueens = piecePlacement.split("").filter(char => char === 'q').length;
    const whiteRooks = piecePlacement.split("").filter(char => char === 'R').length;
    const blackRooks = piecePlacement.split("").filter(char => char === 'r').length;
    const whitePawns = piecePlacement.split("").filter(char => char === 'P').length;
    const blackPawns = piecePlacement.split("").filter(char => char === 'p').length;

    if(whiteQueens + blackQueens + whiteRooks + blackRooks + whitePawns + blackPawns > 0)
    {
        return false;
    }

    if(whiteKnights + blackKnights > 1)
    {
        return false;
    }

    if(whiteBishops > 0 || blackBishops > 0 &&(whiteKnights + blackKnights > 0))
    {
        return false;
    }

    if(whiteBishops > 1 || blackBishops > 1)
    {
        return false;
    }

    if(whiteBishops === 1 && blackBishops === 1)
    {
        // if both both bishops are on the same color tile with insuff mat the game is also a draw
        let whiteBishopSquarecolor, blackBishopSquareColor;

        let whiteBishopSquare = boardSquaresArray.find(element =>(element.pieceType === "bishop" && element.pieceColor === "white"));
        let blackBishopSquare = boardSquaresArray.find(element =>(element.pieceType === "bishop" && element.pieceColor === "black"));

        whiteBishopSquarecolor = getSquareColor(whiteBishopSquare.squareId);
        blackBishopSquareColor = getSquareColor(blackBishopSquare.squareId);

        if(whiteBishopSquarecolor != blackBishopSquareColor)
        {
            return false;
        }
    }
    
    return true;

}

function getSquareColor(squareId)
{
    let squareElement = document.getElementById(squareId);
    let squareColor = squareElement.classList.contains("white") ? "white" : "black";
    return squareColor;
}

function getAllPossibleMoves(squaresArray, pieceColor)
{
    /* 
    * The flatMap method is used to map each square occupied by a piece of a given color 
    * to an array of its legal moves, then flatten the resulting array of arrays into a single array
    */

    return squaresArray.filter((square) => square.pieceColor === pieceColor).flatMap((square) =>{
        const {pieceColor, pieceType, pieceId} = getPieceAtSquare(square.squareId, squaresArray);

        if(pieceId === "blank") return [];
        let squaresArrayCopy = deepCopyArray(squaresArray);
        const pieceObj = {pieceColor: pieceColor, pieceType: pieceType, pieceId: pieceId}
        let legalSquares = getPossibleMoves(square.squareId, pieceObj, squaresArrayCopy);
        legalSquares = isMoveValidAgainstCheck(pieceColor, pieceType,square.squareId, legalSquares);
        return legalSquares;
    })
}
function getEvaluation(fen,callback) {
  var engine = new Worker("./node_modules/stockfish/src/stockfish-nnue-16-single.js");
  let evaluations =[];

  engine.onmessage = function (event) {
    let message = event.data;
    console.log(message);
    if(message.startsWith("info depth 10")) {
      let multipvIndex = message.indexOf("multipv");
      if(multipvIndex!==-1) {
        let multipvString = message.slice(multipvIndex).split(" ")[1];
        let multipv = parseInt(multipvString);
        let scoreIndex = message.indexOf("score cp");
        if(scoreIndex!==-1) {
          let scoreString = message.slice(scoreIndex).split(" ")[2];
          let evaluation = parseInt(scoreString)/100;
          evaluation = isWhiteTurn ? evaluation : evaluation * -1;
          evaluations[multipv-1] = evaluation;
        } else {
          scoreIndex = message.indexOf("score mate");
          scoreString = message.slice(scoreIndex).split(" ")[2];
          evaluation = parseInt(scoreString);
          evaluation = Math.abs(evaluation);
          evaluations[multipv-1] = "#" + evaluation;
        }
        let pvIndex = message.indexOf(" pv ");
        if(pvIndex !== -1) {
          let pvString = message.slice(pvIndex+4).split(" ");
          if(evaluations.length===1) {
            callback(evaluations);
          }
        }
      }
    }
  }
   engine.postMessage("uci");
   engine.postMessage("isready");
   engine.postMessage("ucinewgame");
   engine.postMessage("setoption name multipv value 3");
   engine.postMessage("position fen "+fen);
   engine.postMessage("go depth 10");
}

function displayEvaluation (evaluations) {
  let blackBar = document.querySelector(".blackBar");
  let blackBarHeight = 50 - (evaluations[0]/15)*100;
  blackBarHeight = blackBarHeight>100 ? (blackBarHeight=100) : blackBarHeight;
  blackBarHeight = blackBarHeight<0 ? (blackBarHeight=0) : blackBarHeight;
  blackBar.style.height = blackBarHeight + "%";
  let evalNum = document.querySelector(".evalNum");
  evalNum.innerHTML = evaluations[0];
}

function isShortCastlePossble(pieceColor, boardSquaresArray)
{
    let rank = pieceColor == "white" ? "1" : "8";

    /* 
    * the $ part of the code is a template that represents a string. when the code is executed, the value
    * of the rank variable is inserted into the string replacing the $ placeholder
    */
    let fSquare = boardSquaresArray.find(element => element.squareId === `f${rank}`);
    let gSquare = boardSquaresArray.find(element => element.squareId === `g${rank}`);
    

    if(fSquare.pieceColor != "blank" || gSquare .pieceColor != "blank" || kingHasMoved(pieceColor) || rookHasMoved(pieceColor, `h${rank}`))
    {
        return "blank";
    }

    return `g${rank}`;

}

function isLongCastlePossible(pieceColor, boardSquaresArray)
{

    let rank = pieceColor == "white" ? "1" : "8";
    let dSquare = boardSquaresArray.find(element => element.squareId === `d${rank}`);
    let cSquare = boardSquaresArray.find(element => element.squareId === `c${rank}`);
    let bSquare = boardSquaresArray.find(element => element.squareId === `b${rank}`);

    if(dSquare.pieceColor != "blank" || cSquare .pieceColor != "blank" || bSquare .pieceColor != "blank"
        || kingHasMoved(pieceColor) || rookHasMoved(pieceColor, `a${rank}`))
    {
        return "blank";
    }

    return `c${rank}`;
}


function kingHasMoved(pieceColor)
{
    let result = moves.find((element) => (element.pieceColor == pieceColor) &&(element.pieceType == "king"));

    if(result != undefined)
        return true;
    return false;

}

function rookHasMoved(pieceColor, startSqID)
{
    let result = moves.find((element) => (element.pieceColor == pieceColor) &&(element.pieceType == "rook")
    && (element.from == startSqID));

    if(result != undefined)
        return true;
    return false;
    
}

function performCastling(piece, pieceColor, startSqID, destSquareId, boardSquaresArray)
{
    let rookId, rookDestinationSqId, checkSquareId;

    if(destSquareId == "g1")
    {
        rookId = "rookh1";
        rookDestinationSqId = "f1";
        checkSquareId = "f1";
    }

    else if(destSquareId == "c1")
    {
        rookId = "rooka1";
        rookDestinationSqId = "d1";
        checkSquareId = "d1";
    }

    else if(destSquareId == "g8")
    {
        rookId = "rookh8";
        rookDestinationSqId = "f8";
        checkSquareId = "f8";
    }
    else if(destSquareId == "c8")
    {
        rookId = "rooka8";
        rookDestinationSqId = "d8";
        checkSquareId = "d8";
    }

    if(isKingInCheck(checkSquareId, pieceColor, boardSquaresArray) )
        return;

    let rook = document.getElementById(rookId);
    let rookDestinationSq = document.getElementById(rookDestinationSqId);

    rookDestinationSq.appendChild(rook);
    updateBoardSquaresArray(rook.id.slice(-2), rookDestinationSq.id, boardSquaresArray);

    const destinationSq = document.getElementById(destSquareId);
    destinationSq.appendChild(piece);
    isWhiteTurn = !isWhiteTurn;

    updateBoardSquaresArray(startSqID, destSquareId, boardSquaresArray);

    let captured = false;

    makeMove(startSqID, destSquareId, "king", pieceColor, captured);
    checkForEndGame();
    return;
    
}



    /* 
    * this function will function like anyother perform function really... 
    * the function will play the enPassant move on the board and then update both 
    * the boardSquaresArray and the moves Array
    */
function performEnPassant(piece, pieceColor, startSqID, destSquareId)
{
    let file = destSquareId[0];
    let rank = parseInt(destSquareId[1]);
    rank +=(pieceColor === "white") ? -1 : 1;

    let squareBehindId = file + rank;
    const  squareBehindElement = document.getElementById(squareBehindId); 
    while(squareBehindElement.firstChild)
    {
        squareBehindElement.removeChild(squareBehindElement.firstChild);
    }
    let squareBehind = boardSquaresArray.find(
        (element) => element.squareId == squareBehindId
    );

    squareBehind.pieceColor = "blank";
    squareBehind.pieceType = "blank";
    squareBehind.pieceId = "blank";

    const destSquare = document.getElementById(destSquareId);
    destSquare.appendChild(piece);
    isWhiteTurn = !isWhiteTurn;
    updateBoardSquaresArray(startSqID, destSquareId, boardSquaresArray);
    let captured = true;
    makeMove(startSqID, destSquareId, "pawn", pieceColor, captured);
    enPassantSquare = "blank";
    checkForEndGame();
    return;
}


// this functions job is kinda what it says. it should only serve to display the promotion options

function displayPromotionChoices(pieceId, pieceColor, startSqID, destSquareId, captured)
{
    let file = destSquareId[0];
    let rank = parseInt(destSquareId[1]); // this is repersenting the last rank on the board
    let rank1 = (pieceColor == "white") ? rank - 1 : rank + 1 // rank 1 2 3 are ranks immediatly behind it based on the colot of pawn
    let rank2 = (pieceColor == "white") ? rank1 - 1 : rank1 + 1
    let rank3 = (pieceColor == "white") ? rank2 - 1 : rank2 + 1

    let squareBehindId1 = file + rank1;
    let squareBehindId2 = file + rank2;
    let squareBehindId3 = file + rank3;

    const destSquare = document.getElementById(destSquareId);
    const squareBehind1 = document.getElementById(squareBehindId1);
    const squareBehind2 = document.getElementById(squareBehindId2);
    const squareBehind3 = document.getElementById(squareBehindId3);

    let piece1 = createChessPiece("queen", pieceColor, "promotionOption");
    let piece2 = createChessPiece("knight", pieceColor, "promotionOption");
    let piece3 = createChessPiece("rook", pieceColor, "promotionOption");
    let piece4 = createChessPiece("bishop", pieceColor, "promotionOption");


    destSquare.appendChild(piece1);
    squareBehind1.appendChild(piece2);
    squareBehind2.appendChild(piece3);
    squareBehind3.appendChild(piece4);

    let promotionOptions = document.getElementsByClassName("promotionOption");

    for(let i = 0; i < promotionOptions.length; i++)
    {
        let pieceType = promotionOptions[i].classList[1];
        promotionOptions[i].addEventListener("click", function(){
            performPromotion(pieceId, pieceType, pieceColor, startSqID, destSquareId, captured);
        })
    }


}

function performPromotion(pieceId, pieceType, pieceColor, startSqID, destSquareId, captured)
{
    clearPromotionOptions();
    promotionPiece = pieceType;
    piece = createChessPiece(pieceType, pieceColor, "piece");

    piece.addEventListener("dragstart", drag);
    piece.setAttribute("draggable", true);
    piece.firstChild.setAttribute("draggable", false);
    piece.id = pieceType + pieceId;

    const startSq = document.getElementById(startSqID);
    while(startSq.firstChild)
    {
        startSq.removeChild(startSq.firstChild);
    }

    const destSquare = document.getElementById(destSquareId);

    if(captured)
    {
        while(destSquare.firstChild)
        {
            destSquare.removeChild(destSquare.firstChild);
        }
    }
    destSquare.appendChild(piece);
    isWhiteTurn = !isWhiteTurn;
    updateBoardSquaresArray(startSqID, destSquareId, boardSquaresArray, pieceType);

    makeMove(startSqID, destSquareId, pieceType, pieceColor, captured, pieceType);

    checkForEndGame();

    return;

}



    /* 
    * This function will generate a chess piece as a div element that contains an image. the class names and atrributes
    * of the element are set based on the piece Type and color
    */
function createChessPiece(pieceType, color, pieceClass )
{
    let pieceName = "sprites/"+color.charAt(0).toUpperCase() + color.slice(1)+ pieceType.charAt(0).toUpperCase() + pieceType.slice(1) +".png";
    console.log(pieceName);
    let pieceDiv = document.createElement("div");
    pieceDiv.className = `${pieceClass} ${pieceType}`;
    pieceDiv.setAttribute("color", color);
    let img = document.createElement("img");
    img.src = pieceName;
    img.alt = pieceType;
    pieceDiv.appendChild(img);
    return pieceDiv;
}


// making it so the promotion choices disappear when the user clicks anywhere on the board
chessBoard.addEventListener("click", clearPromotionOptions);


function clearPromotionOptions()
{
    for(let i = 0; i < boardSquares.length; i++)
    {
        let style = getComputedStyle(boardSquares[i]);
        let backgroundColor = style.backgroundColor;
        let rgbaColor = backgroundColor.replace("0.5)" , "1)");
        boardSquares[i].style.backgroundColor = rgbaColor;
        boardSquares[i].style.opacity = 1;

    }

    let elementsToRemove = chessBoard.querySelectorAll(".promotionOption");
    elementsToRemove.forEach( function(element){
       element.parentElement.removeChild(element);
    } );

    allowMovement = true;
}

function updateBoardSquaresOpacity()
{
    for(let i = 0; i < boardSquares.length; i++)
    {
        if(!(boardSquares[i].querySelector(".promotionOption")))
        {
            boardSquares[i].style.opacity = 0.5;
        }
        else
        {
            let style = getComputedStyle(boardSquares[i]);
            let backgroundColor = style.backgroundColor;
            let rgbaColor = backgroundColor.replace("rgb", "rgba").replace(")", ",0.5)");
            boardSquares[i].style.backgroundColor = rgbaColor;
        }
    }
}














function showAlert(mess)
{
    const alert = document.getElementById("alert");
    alert.innerHTML = mess;
    alert.style.display = "block";

    setTimeout(function(){
        alert.style.display = "none";
        
    }, 3000);

}

