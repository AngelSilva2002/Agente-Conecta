
class Agent{
    constructor(){}
    
    init(color, board, time=20000){
        this.color = color
        this.time = time
        this.size = board.length
    }

    // Must return an integer representing the column to put a piece
    //                           column
    //                             | 
    compute( board, time ){ return 0 }
}

/*
 * A class for board operations (it is not the board but a set of operations over it)
 */
class Board{
    constructor(){}

    // Initializes a board of the given size. A board is a matrix of size*size of characters ' ', 'B', or 'W'
    init(size){
        var board = []
        for(var i=0; i<size; i++){
            board[i] = []
            for(var j=0; j<size; j++)
                board[i][j] = ' '
        }
        return board
    }

    // Deep clone of a board the reduce risk of damaging the real board
    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }

    // Determines if a piece can be set at column j 
    check(board, j){
        return (board[0][j]==' ')
    }

    // Computes all the valid moves for the given 'color'
    valid_moves(board){
        var moves = []
        var size = board.length
        for( var j=0; j<size; j++)
            if(this.check(board, j)) moves.push(j)
        return moves
    }

    // Computes the new board when a piece of 'color' is set at column 'j'
    // If it is an invalid movement stops the game and declares the other 'color' as winner
    move(board, j, color){
        var size = board.length
        var i=size-1;
        while(i>=0 && board[i][j]!=' ') i--;
        if(i<0) return false;
        board[i][j] = color
        return true
    }

    // Determines the winner of the game if available 'W': white, 'B': black, ' ': none
    winner(board, k){
        console.log(k)
        var size = board.length
        for( var i=0; i<size; i++){
            for(var j=0; j<size; j++){
                var p = board[i][j]
                if(p!=' '){
                    if(j+k<=size && i+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j+h]==p) c++
                        if(c==k) return p
                    }
                    if(j+1>=k && i+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j-h]==p) c++
                        if(c==k) return p

                    }
                    if(j+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i][j+h]==p) c++
                        if(c==k) return p

                    }
                    if(i+k<=size){
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j]==p) c++
                            else break;
                        if(c==k) return p
                    }
                }
            }
        }      
        return ' '
    }

    // Draw the board on the canvas
    print(board){
        var size = board.length
        // Commands to be run (left as string to show them into the editor)
        var grid = []
        for(var i=0; i<size; i++){
            for(var j=0; j<size; j++)
                grid.push({"command":"translate", "y":i, "x":j, "commands":[{"command":"-"}, {"command":board[i][j]}]})
        }

	    var commands = {"r":true,"x":1.0/size,"y":1.0/size,"command":"fit", "commands":grid}
        Konekti.client['canvas'].setText(commands)
    }
}

/*
 * Player's Code (Must inherit from Agent) 
 * This is an example of a rangom player agent
 */
class RandomPlayer extends Agent{
    constructor(){ 
        super() 
        this.board = new Board()
    }

    compute(board, time){
        var moves = this.board.valid_moves(board)
        var index = Math.floor(moves.length * Math.random())
        for(var i=0; i<50000000; i++){} // Making it very slow to test time restriction
        for(var i=0; i<50000000; i++){} // Making it very slow to test time restriction
        console.log(this.color + ',' + moves[index])
        return moves[index]
    }
}

class realTamalero extends Agent {
    constructor() {
        super();
        this.board = new Board();
        this.size = this.board.size;
    }

    compute(board, time) {
        const k = parseInt(Konekti.vc('k').value);
        const moves = this.board.valid_moves(board);
        const depth = this.determineDepth(moves.length, time);
        const bestMove = this.minimax(board, depth, true, k);
        return bestMove;
    }

    determineDepth(numMoves, time) {
        // Establece reglas para determinar la profundidad dinámica basada en el tiempo y la cantidad de movimientos disponibles.
        const maxDepth = 10; // Profundidad máxima permitida
        const maxTime = 10000; // Tiempo máximo para la decisión en milisegundos
        const minDepth = 3; // Profundidad mínima para asegurar una decisión razonable

        if (time > maxTime) {
            return maxDepth;
        }

        // Ajusta la profundidad en función del tiempo y la cantidad de movimientos disponibles.
        const dynamicDepth = Math.max(minDepth, Math.floor(maxDepth * (time / maxTime) * (numMoves / 42)));
        return dynamicDepth;
    }

    minimax(board, depth, maximizing, k) {
        const availableMoves = this.board.valid_moves(board);
        if (depth === 0 || availableMoves.length === 0) {
            return this.evaluate(board, k);
        }

        let bestMove = availableMoves[0]; 
        let bestScore = maximizing ? -Infinity : Infinity; 

        for (const move of availableMoves) {
            const newBoard = this.board.clone(board);

            if (maximizing) {
                this.board.move(newBoard, move, this.color);
            } else {
                this.board.move(newBoard, move, this.opponentColor());
            }

            const score = this.minimax(newBoard, depth - 1, !maximizing, k);

            if ((maximizing && score > bestScore) || (!maximizing && score < bestScore)) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    evaluate(board) {
        var k = parseInt(Konekti.vc('k').value) // k-pieces in row
        const playerColor = this.color;
        const opponentColor = this.opponentColor();
        let playerScore = 0;
        let opponentScore = 0;
    

        // Evaluar la cantidad de fichas en línea para el jugador y el oponente
        playerScore += this.countConsecutivePieces(board, playerColor, k);
        playerScore += this.connectKInLine(board, playerColor, k);
        opponentScore += this.countConsecutivePieces(board, opponentColor, k);
        opponentScore += this.connectKInLine(board, opponentColor, k);
    
        // Evaluar el bloqueo del oponente
        playerScore += this.blockOpponent(board,playerColor, opponentColor, k);
        //opponentScore += this.blockOpponent(board,opponentColor, playerColor, k);
    
        

        playerScore += this.evaluateControlCenter(board, playerColor);

        opponentScore += this.evaluateControlCenter(board, opponentColor);

        // Devolver la diferencia en puntuaciones como la evaluación
        
        return playerScore - opponentScore;
    }



    connectKInLine(board, playerColor, k) {
        let playerScore = 0;
    
        // Evaluar líneas horizontales
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                let emptyCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row][col + i] === playerColor) {
                        consecutiveCount++;
                    } else if (board[row][col + i] === ' ') {
                        emptyCount++;
                    }
                }
                if (consecutiveCount + emptyCount === k && emptyCount > 0) {
                    playerScore += 1;
                }
            }
        }
    
        // Evaluar líneas verticales
        for (let col = 0; col < this.size; col++) {
            for (let row = 0; row <= this.size - k; row++) {
                let consecutiveCount = 0;
                let emptyCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row + i][col] === playerColor) {
                        consecutiveCount++;
                    } else if (board[row + i][col] === ' ') {
                        emptyCount++;
                    }
                }
                if (consecutiveCount + emptyCount === k && emptyCount > 0) {
                    playerScore += 1; 
                }
            }
        }
    
        // Evaluar líneas diagonales descendentes
        for (let row = 0; row <= this.size - k; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                let emptyCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row + i][col + i] === playerColor) {
                        consecutiveCount++;
                    } else if (board[row + i][col + i] === ' ') {
                        emptyCount++;
                    }
                }
                if (consecutiveCount + emptyCount === k && emptyCount > 0) {
                    playerScore += 1; 
                }
            }
        }
    
        // Evaluar líneas diagonales ascendentes
        for (let row = k - 1; row < this.size; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                let emptyCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row - i][col + i] === playerColor) {
                        consecutiveCount++;
                    } else if (board[row - i][col + i] === ' ') {
                        emptyCount++;
                    }
                }
                if (consecutiveCount + emptyCount === k && emptyCount > 0) {
                    playerScore += 1; 
                }
            }
        }
    
        return playerScore;
    }
    
    
    countConsecutivePieces(board, playerColor, k) {
        let playerScore = 0;
    
        // Evaluar líneas horizontales
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row][col + i] === playerColor) {
                        consecutiveCount++;
                    }
                }
                if (consecutiveCount === k) {
                    playerScore += 1; 
                }
            }
        }
    
        // Evaluar líneas verticales
        for (let col = 0; col < this.size; col++) {
            for (let row = 0; row <= this.size - k; row++) {
                let consecutiveCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row + i][col] === playerColor) {
                        consecutiveCount++;
                    }
                }
                if (consecutiveCount === k) {
                    playerScore += 1; 
                }
            }
        }
    
        // Evaluar líneas diagonales descendentes
        for (let row = 0; row <= this.size - k; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row + i][col + i] === playerColor) {
                        consecutiveCount++;
                    }
                }
                if (consecutiveCount === k) {
                    playerScore += 1; 
                }
            }
        }
    
        // Evaluar líneas diagonales ascendentes
        for (let row = k - 1; row < this.size; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row - i][col + i] === playerColor) {
                        consecutiveCount++;
                    }
                }
                if (consecutiveCount === k) {
                    playerScore += 1; 
                }
            }
        }
    
        return playerScore;
    }

    blockOpponent(board, playerColor, opponentColor, k) {
        let playerScore = 0;
    
        // Evaluar líneas horizontales
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                let emptyCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row][col + i] === opponentColor) {
                        consecutiveCount++;
                    } else if (board[row][col + i] === ' ') {
                        emptyCount++;
                    }
                }
                if (consecutiveCount + emptyCount === k && emptyCount > 0) {
                    // Verificar si esta jugada bloquea una victoria del oponente
                    if (this.isBlockingMove(board, row, col, k, 'horizontal', playerColor)) {
                        playerScore += 100; // Incrementa el puntaje
                    }
                }
            }
        }
    
        // Evaluar líneas verticales
        for (let col = 0; col < this.size; col++) {
            for (let row = 0; row <= this.size - k; row++) {
                let consecutiveCount = 0;
                let emptyCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row + i][col] === opponentColor) {
                        consecutiveCount++;
                    } else if (board[row + i][col] === ' ') {
                        emptyCount++;
                    }
                }
                if (consecutiveCount + emptyCount === k && emptyCount > 0) {
                    // Verificar si esta jugada bloquea una victoria del oponente
                    if (this.isBlockingMove(board, row, col, k, 'vertical', playerColor)) {
                        playerScore += 100; // Incrementa el puntaje
                    }
                }
            }
        }
    
        // Evaluar líneas diagonales descendentes
        for (let row = 0; row <= this.size - k; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                let emptyCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row + i][col + i] === opponentColor) {
                        consecutiveCount++;
                    } else if (board[row + i][col + i] === ' ') {
                        emptyCount++;
                    }
                }
                if (consecutiveCount + emptyCount === k && emptyCount > 0) {
                    // Verificar si esta jugada bloquea una victoria del oponente
                    if (this.isBlockingMove(board, row, col, k, 'diagonal-descendente', playerColor)) {
                        playerScore += 100; // Incrementa el puntaje
                    }
                }
            }
        }
    
        // Evaluar líneas diagonales ascendentes
        for (let row = k - 1; row < this.size; row++) {
            for (let col = 0; col <= this.size - k; col++) {
                let consecutiveCount = 0;
                let emptyCount = 0;
                for (let i = 0; i < k; i++) {
                    if (board[row - i][col + i] === opponentColor) {
                        consecutiveCount++;
                    } else if (board[row - i][col + i] === ' ') {
                        emptyCount++;
                    }
                }
                if (consecutiveCount + emptyCount === k && emptyCount > 0) {
                    // Verificar si esta jugada bloquea una victoria del oponente
                    if (this.isBlockingMove(board, row, col, k, 'diagonal-ascendente', playerColor)) {
                        playerScore += 100; // Incrementa el puntaje
                    }
                }
            }
        }
    
        return playerScore;
    }
    
    isBlockingMove(board, row, col, k, direction, playerColor) {
        // Verificar si la jugada en la dirección dada bloquea una victoria del oponente
        let consecutiveCount = 0;
        for (let i = 0; i < k; i++) {
            if (direction === 'horizontal' && board[row][col + i] === playerColor) {
                consecutiveCount++;
            }
            if (direction === 'vertical' && board[row + i][col] === playerColor) {
                consecutiveCount++;
            }
            if (direction === 'diagonal-descendente' && board[row + i][col + i] === playerColor) {
                consecutiveCount++;
            }
            if (direction === 'diagonal-ascendente' && board[row - i][col + i] === playerColor) {
                consecutiveCount++;
            }
        }
        return consecutiveCount === k - 1; // La jugada bloquea una victoria si hay k-1 piezas del jugador en línea
    }
    

    evaluateControlCenter(board, color) {
        const playerColor = color;
        const centerX = Math.floor(board.length / 2);
        const centerY = Math.floor(board[0].length / 2);
        const centerValue = 0.1; // Puntuación para controlar el centro
    
        if (board[centerX][centerY] === playerColor) {
            return centerValue;
        }
        return 0;
    }

    opponentColor() {
        return this.color === 'B' ? 'W' : 'B';
    }
}

/*
 * Environment (Cannot be modified or any of its attributes accesed directly)
 */
class Environment extends MainClient{
	constructor(){ 
        super()
        this.board = new Board()
        
    }

    setPlayers(players){ this.players = players }

	// Initializes the game 
	init(){ 
        var white = Konekti.vc('W').value // Name of competitor with white pieces
        var black = Konekti.vc('B').value // Name of competitor with black pieces
        var time = 1000*parseInt(Konekti.vc('time').value) // Maximum playing time assigned to a competitor (milliseconds)
        var size = parseInt(Konekti.vc('size').value) // Size of the reversi board
        var k = parseInt(Konekti.vc('k').value) // k-pieces in row
        
        this.k = k
        this.size = size
        this.rb = this.board.init(size)
        this.board.print(this.rb)
        var b1 = this.board.clone(this.rb)
        var b2 = this.board.clone(this.rb)

        this.white = white
        this.black = black
        this.ptime = {'W':time, 'B':time}
        Konekti.vc('W_time').innerHTML = ''+time
        Konekti.vc('B_time').innerHTML = ''+time
        this.player = 'W'
        this.winner = ''

        this.players[white].init('W', b1, time)
        this.players[black].init('B', b2, time)
    }

    // Listen to play button 
	play(){ 
        var TIME = 10
        var x = this
        var board = x.board
        x.player = 'W'
        Konekti.vc('log').innerHTML = 'The winner is...'

        x.init()
        var start = -1

        function clock(){
            if(x.winner!='') return
            if(start==-1) setTimeout(clock,TIME)
            else{
                var end = Date.now()
                var ellapsed = end - start
                var remaining = x.ptime[x.player] - ellapsed
                Konekti.vc(x.player+'_time').innerHTML = remaining
                Konekti.vc((x.player=='W'?'B':'W')+'_time').innerHTML = x.ptime[x.player=='W'?'B':'W']
                
                if(remaining <= 0) x.winner = (x.player=='W'?x.black:x.white) + ' since ' + (x.player=='W'?x.white:x.black) + 'got time out'
                else setTimeout(clock,TIME) 
            }
        }
        
        function compute(){
            var w = x.player=='W'
            var id = w?x.white:x.black
            var nid = w?x.black:x.white
            var b = board.clone(x.rb)
            start = Date.now()
            var action = x.players[id].compute(b, x.ptime[x.player])
            var end = Date.now()
            var flag = board.move(x.rb, action, x.player)
            if(!flag){
                x.winner = nid + ' ...Invalid move taken by ' + id + ' on column ' + action
            }else{
                var winner = board.winner(x.rb, x.k)
                console.log(winner)
                if(winner!= ' ') x.winner = winner
                else{
                    var ellapsed = end - start
                    x.ptime[x.player] -= ellapsed
                    Konekti.vc(x.player+'_time').innerHTML = ''+x.ptime[x.player]
                    if(x.ptime[x.player] <= 0){ 
                        x.winner = nid + ' since ' + id + ' got run of time'
                    }else{
                        x.player = w?'B':'W'
                    }
                }    
            }

            board.print(x.rb)
            start = -1
            if(x.winner=='') setTimeout(compute,TIME)
            else Konekti.vc('log').innerHTML = 'The winner is ' + x.winner
        }

        board.print(x.rb)
        setTimeout(clock, 1000)
        setTimeout(compute, 1000)
    }
}

// Drawing commands
function custom_commands(){
    return [
        { 
            "command":" ", "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":255, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }

            ]},
        { 
            "command":"-", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":0, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,0,1,1,0],
                    "y":[0,1,1,0,0]
                }
            ]
        },
        {
            "command":"B",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":0, "green":0, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }
            ]
        },  
        {
            "command":"W",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                },
            ]
        }
    ] 
}