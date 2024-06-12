/*preloader*/
var loader = document.getElementById("preloader");
window.addEventListener("load",function(){
    loader.style.display="none";
})
/*Game*/
const gameLevels=[20,50,70];

//Will decide the behaviour of the sliding puzzle(object)
class Game{
    difficulty;//easy medium hard
    cols=4;
    rows=4;
    count;//cols*rows
    blocks;//html element puzzleBlock
    emptyBlockCoords=[3,3];//total there are 16 blocks out of which only 15 are filled
    indexes=[];//To keep the track of order of blocks, once we get the desired order person wins the game

    //called everytime whenever new instance of game is created
    //initializes the game by setting the difficulty level and grabbing the element  representing puzzleBlocks
    constructor(difficultyLevel=1){
        this.difficulty=gameLevels[difficultyLevel-1];
        this.count=this.cols*this.rows;
        this.blocks=document.getElementsByClassName("puzzleBlock");
        this.init();
        this.difficultyButtons = document.querySelectorAll('.difficulty-button');
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                let difficulty = button.dataset.difficulty;
                this.startGame(difficulty);
            });
        });
        this.freezeButton = document.getElementById('freeze-button');
        this.freezeButton.addEventListener('click', () => {
            this.freezeBlock();
        });
    }
    startGame(difficulty) {
        // Reset the game state
        this.blocks = [];
        this.indexes = [];
        this.emptyBlockCoords = [this.cols - 1, this.rows - 1];
    
        // Generate a new puzzle with the selected difficulty
        this.generatePuzzle(difficulty);
    
        // Reset the game UI
        this.gameContainer.innerHTML = '';
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let block = document.createElement('div');
                block.className = 'block';
                block.style.left = (j * block.clientWidth) + 'px';
                block.style.top = (i * block.clientWidth) + 'px';
                block.coords = [j, i];
                this.gameContainer.appendChild(block);
                this.blocks.push(block);
            }
        }
    
        // Initialize the game logic
        this.initGameLogic();
    }
    generatePuzzle(difficulty) {
        let numMoves = 0;
        switch (difficulty) {
            case 'easy':
                numMoves = 10;
                break;
            case 'edium':
                numMoves = 20;
                break;
            case 'hard':
                numMoves = 30;
                break;
        }
    
        // Generate a puzzle with the selected number of moves
        for (let i = 0; i < numMoves; i++) {
            let randomBlockIdx = Math.floor(Math.random() * this.blocks.length);
            let block = this.blocks[randomBlockIdx];
            let blockCoords = this.canMoveBlock(block);
            if (blockCoords!= null) {
                this.moveBlock(randomBlockIdx);
            }
        }
    }
//to initializre the game
    init(){
        //to initialize the position of blocks
        let y;
        let x;
        for(y=0;y<this.rows;y++){
            for(x=0;x<this.cols;x++){
                let blockIdx=x+y*this.cols;
                if(blockIdx+1>=this.count) break;
                let block=this.blocks[blockIdx];
                this.positionBlockAtCoord(blockIdx,x,y);
                block.addEventListener('click',(e)=>this.onClickOnBlock(blockIdx));//event would occur when clicked
                this.indexes.push(blockIdx);
            }
        }
        this.indexes.push(this.count-1);//empty block position
        this.randomize(this.difficulty);
    }
    //function to put blocks i random order by shuffling into n times
    randomize(iterationCount){
        //move a random block (x iterationCount)
        for(let i=0;i<iterationCount;i++){
            let randomBlockIdx=Math.floor(Math.random()*(this.count-1));
            let moved=this.moveBlock(randomBlockIdx);
            if(!moved)i--;
        }
    }
    //take block index as argument and tries to move it to the position of empty block
    moveBlock(blockIdx) {
        let block = this.blocks[blockIdx];
        if(block.frozen) return false;//Do not move the frozen block
        let blockCoords = this.canMoveBlock(block);
        if (blockCoords!= null) {
            let oldX = block.coords[0];
            let oldY = block.coords[1];
            let newX = blockCoords[0];
            let newY = blockCoords[1];
    
            // Update the indexes array
            this.indexes[oldX + oldY * this.cols] = -1;
            this.indexes[newX + newY * this.cols] = blockIdx;
    
            // Update the block's coordinates
            block.coords = [newX, newY];
    
            // Update the empty block's coordinates
            this.emptyBlockCoords = [oldX, oldY];
    
            // Remove the block from its old position
            block.style.left = (newX * block.clientWidth) + "px";
            block.style.top = (newY * block.clientWidth) + "px";
    
            return true;
        }
        return false;
    }
     //only blocks near the empty block can move and the block must not be empty block hence this checks whether the block is capable to move or not
     //return coordinates if possible else returns null
     canMoveBlock(block) {
        let x = block.coords[0];
        let y = block.coords[1];
        let emptyX = this.emptyBlockCoords[0];
        let emptyY = this.emptyBlockCoords[1];
    
        if (x === emptyX && Math.abs(y - emptyY) === 1) {
            return [x, emptyY];
        } else if (y === emptyY && Math.abs(x - emptyX) === 1) {
            return [emptyX, y];
        } else {
            return null;
        }
    }
    //take index of block,xcoordinate,ycoordinate as arguments and places it at the specified coordiantes
    positionBlockAtCoord(blockIdx,x,y){//position the block at a certain coordinates
        let block = this.blocks[blockIdx];
        block.style.left = (x * block.clientWidth) + "px";
        block.style.top = (y * block.clientWidth) + "px";
        block.coords = [x, y];
    }
    //when  a block is moved to empty position it checks whether the puzzle is solved or not and shows alert the puzzle is solved if it is done
    onClickOnBlock(blockIdx){//try move block and check if puzzle was solved
        if(this.moveBlock(blockIdx)){
            if(this.checkPuzzleSolved()){
                setTimeout(()=>alert("Puzzle Solved!!"),600);
            }
        }
    }
    checkPuzzleSolved(){//return if puzzle was solved
        for(let i=0;i<this.indexes.length;i++){
            //console.log(this.indexes[i],i);
            if(i==this.emptyBlockCoords[0]+this.emptyBlockCoords[1]*this.cols)continue;
            if(this.indexes[i]!=i)return false;
        }
        return true;
    }
    //setting hte level of the game
    setDifficulty(difficultyLevel){
        this.difficulty=gameLevels[difficultyLevel-1];
        this.randomize(this.difficulty);
    }
    //the ultimate difficulty level
    freezeBlock() {
        let correctBlockIdx = -1;
        for (let i = 0; i < this.indexes.length; i++) {
            if (this.indexes[i] === i) {
                correctBlockIdx = i;
                break;
            }
        }
    
        if (correctBlockIdx!== -1) {
            let block = this.blocks[correctBlockIdx];
            block.frozen = true;
            block.style.background = 'gray'; // Visual indicator for frozen block
        }
    }

  
}
  //instnatiatin the new game
  var game=new Game(1);
  //sets up event listenres to set the difficulty level and randomize the puzzleBlocks
  var difficulty_buttons=Array.from(document.getElementsByClassName("difficultyLevels"));
  difficulty_buttons.forEach((elem,idx)=>{
    elem.addEventListener('click',(e)=>{
        difficulty_buttons[gameLevels.indexOf(game.difficulty)].classList.remove("active");
        elem.classList.add("active");
        game.setDifficulty(idx+1);
    });
});
