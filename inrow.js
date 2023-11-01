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

class realTamaero extends Agent {
    constructor() {
        super();
        this.board = new Board();
    }

    compute(board, time) {
        const moves = this.board.valid_moves(board);
        let bestMove = -1;
        let bestScore = -Infinity;
        const depth = 3; // Profundidad máxima de búsqueda

        for (const move of moves) {
            const clonedBoard = this.board.clone(board);
            this.board.move(clonedBoard, move, this.color);
            const score = this.minimax(clonedBoard, depth, -Infinity, Infinity, false);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // Modifica el algoritmo minimax para elegir el mejor movimiento en función del puntaje
    minimax(board, depth, alpha, beta, maximizingPlayer) {
        console.log("boar winner",this.board.winner(board, this.size))
        if (depth === 0 || this.board.winner(board, this.size) !== ' ') {
            return this.evaluate(board);
        }

        const moves = this.board.valid_moves(board);

        if (maximizingPlayer) {
            let maxScore = -Infinity;
            let bestMove = null;

            for (const move of moves) {
                const clonedBoard = this.board.clone(board);
                this.board.move(clonedBoard, move, this.color);
                const score = this.minimax(clonedBoard, depth - 1, alpha, beta, false);

                if (score > maxScore) {
                    maxScore = score;
                    bestMove = move;
                }

                alpha = Math.max(alpha, score);

                if (beta <= alpha) {
                    break;
                }
            }

            // Si es el nodo raíz, devuelve el mejor movimiento
            if (depth === 3) {
                return bestMove;
            }

            return maxScore;
        } else {
            let minScore = Infinity;

            for (const move of moves) {
                const clonedBoard = this.board.clone(board);
                this.board.move(clonedBoard, move, this.color === 'B' ? 'W' : 'B');
                const score = this.minimax(clonedBoard, depth - 1, alpha, beta, true);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);

                if (beta <= alpha) {
                    break;
                }
            }

            return minScore;
        }
    }

    evaluate(board) {
        const ownColor = this.color;
        const opponentColor = ownColor === 'B' ? 'W' : 'B';
        const size = this.size;
        var k = parseInt(Konekti.vc('k').value) // k-pieces in row
        let score = 0;
    
        // Criterios de evaluación
        const criteria = {
            'OwnPiecesInLine': [0, 1, 10, 100, 1000],    // Valor para fichas propias en línea
            'OpponentPiecesInLine': [0, -1, -10, -100, -1000],  // Valor para fichas del oponente en línea
            'EmptySpace': [0, 0, 0, 0, 0]  // Valor para espacios vacíos
        };
    
        // Función para calcular la puntuación en una dirección dada
        function calculateDirectionScore(row, col, dr, dc, color) {
            let ownCount = 0;
            let opponentCount = 0;
    
            for (let i = 0; i < k; i++) {
                const r = row + i * dr;
                const c = col + i * dc;
    
                if (r < 0 || r >= size || c < 0 || c >= size) {
                    break;
                }
    
                if (board[r][c] === ownColor) {
                    ownCount++;
                } else if (board[r][c] === opponentColor) {
                    opponentCount++;
                }
            }
    
            // Calcula la puntuación en función de los criterios
            return criteria['OwnPiecesInLine'][ownCount] +
                criteria['OpponentPiecesInLine'][opponentCount] +
                criteria['EmptySpace'][ownCount + opponentCount];
        }
    
        // Calcular la puntuación en todas las direcciones posibles
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                for (const [dr, dc] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
                    score += calculateDirectionScore(row, col, dr, dc, ownColor);
                    score -= calculateDirectionScore(row, col, dr, dc, opponentColor);
                }
            }
        }
        console.log('puntaje:', score);
        return score;
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
