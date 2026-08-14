// JavaScript source code

// universal variables

var totalPoints = 0;
var totalBudget = 5000;
const totalArtifacts = 50;
var discovered_artifacts = 0;
var game_over = false;

var score1;
var score2;
var artifacts_found;
var tot_artifacts;

var grid;
var cols;
var rows;
var w = 20;

var counter = 0;      // Variavel do timer
var timeleft = 1200;   // Variavel do timer
var ding;             //Variavel do timer sound do fim
var lastpenny; //variavel fim de jogo por dinheiro

//loading sounds and images

function preload() {
    soundFormats('mp3', 'ogg', 'wav');
    ding = loadSound("https://upload.wikimedia.org/wikipedia/commons/3/34/Sound_Effect_-_Door_Bell.ogg");
    lastpenny = loadSound("https://upload.wikimedia.org/wikipedia/commons/3/3c/Whoom_bass.ogg");
    lastpenny.setVolume(1.0);
    gotpenny = loadSound("https://upload.wikimedia.org/wikipedia/commons/1/16/Dropmetalthing.ogg");
    gameWon_snd = loadSound("https://upload.wikimedia.org/wikipedia/commons/archive/a/a8/20131214154326%21Clapping_hurray.ogg");
    artifact_img = loadImage("https://upload.wikimedia.org/wikipedia/commons/0/0d/Clovis_Point.jpg");
    digging_snd = loadSound("/assets/archaeosweeper/digging_snd.wav");
    digging_snd.fade(0.05, 0.8);
}

// function to be called in setup 
// make the arrays 

function make2DArray(cols, rows) {
    var arr = new Array(cols);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

function setup() {
    // creating the canvas with columns and rows
    cnv = createCanvas(401, 401);
    cnv.parent("script1_holder");
    cols = floor(width / w);
    rows = floor(height / w);
    grid = make2DArray(cols, rows);

    // Presetting the Timer
    function convertSeconds(s) {
        var min = floor(s / 60);
        var sec = s % 60;
        return nf(min, 2) + ':' + nf(sec, 2);
    }

    var timer = select('#timer');
    timer.html(convertSeconds(timeleft - counter));

    var interval = setInterval(timeIt, 1000);

    function timeIt() {
        counter++;
        timer.html(convertSeconds(timeleft - counter));
        if (counter == timeleft) {
            counter = 0;
            clearInterval(interval);
            gameOver()
            ding.play();
            
        }
    }
    //Fim do timer   

    score1 = select('#totalPoints');
    score2 = select('#totalBudget');
    score1.html(totalPoints);
    score2.html(totalBudget);

    artifacts_found = select('#artifacts_found');
    tot_artifacts = select('#TotalArtifacts');
    artifacts_found.html(discovered_artifacts);
    tot_artifacts.html(totalArtifacts);

    reset_game();
    // Pick spots 
    /*
    var options = [];
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            options.push([i, j]);
        }
    }

    for (var n = 0; n < totalArtifacts; n++) {
        var index = floor(random(options.length));
        var choice = options[index];
        var i = choice[0];
        var j = choice[1];
        // Deletes that spot so it's no longer an option
        options.splice(index, 1);
        grid[i][j].artifact = true;
    }

for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
        grid[i][j].countArtifacts();
    }
    }*/
    var reset_btn = createButton("reset");
    reset_btn.parent("reset_btn");
    reset_btn.mousePressed(reset_game);
    
       
}

function reset_game() {
    game_over = false;
    counter = -2;
    totalPoints = 0;
    totalBudget = 5000;
    discovered_artifacts = 0;
    artifacts_found.html(discovered_artifacts);
    score1.style("color: black");
    score2.style("color: black");
    score1.html(totalPoints);
    score2.html(totalBudget);


    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j] = new Cell(i, j, w);
        }
    }
    
    var options = [];
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            options.push([i, j]);
        }
    }

    for (var n = 0; n < totalArtifacts; n++) {
        var index = floor(random(options.length));
        var choice = options[index];
        var i = choice[0];
        var j = choice[1];
        // Deletes that spot so it's no longer an option
        options.splice(index, 1);
        grid[i][j].artifact = true;
    }

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].countArtifacts();
        }
    }
}

    function gameOver() {
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                grid[i][j].revealed = true;
            }
        }
        game_over = true;
    }


    function payMoney() {
        
        const x = Math.floor(Math.random() * 10) + 1;
        if (x <= 5) {
            totalBudget -= 250;
        } else if (x > 5 && x <= 8) {
            totalBudget -= 600;
        } else {
            totalBudget -= 2000;
        }
    }

function getMoney() {
        const x = Math.floor(Math.random() * 10) + 1;
        if (x <= 5) {
            totalBudget += 1750;
            totalPoints += 500;
        } else if (x > 5 && x <= 8) {
            totalBudget += 3000;
            totalPoints += 750;
        } else if (x == 9) {
            totalBudget += 0;
            totalPoints += 100;
        } else {
            totalBudget += 5000;
            totalPoints += 1500;
            
    }
    setTimeout(gotpenny.play(), 1000);
}
function gameWon() {
    gameWon_snd.play();
    score1.style("color: #FFD700");
    score2.style("color: #FFD700");
    gameOver();
}

function mousePressed() {
    if (game_over == true) {
        window.alert("***** The game will restart in 3 seconds *******");
        setTimeout(reset_game, 2000);
    }

        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                if (grid[i][j].contains(mouseX, mouseY) && grid[i][j].revealed === false) {
                    grid[i][j].reveal();
                    payMoney();
                    digging_snd.play();
                    
                    if (grid[i][j].artifact) {
                        //getPoints();
                        getMoney();
                        discovered_artifacts += 1;
                        artifacts_found.html(discovered_artifacts);

                    }  
                    
                }
            }
        }
    

        score1.html(totalPoints);
        score2.html(totalBudget);

        if (totalBudget < 0) {
            score2.style("color: #ff0000");
            gameOver();
            setTimeout(lastpenny.play(), 1000);
        }

        if (discovered_artifacts == totalArtifacts) {
            gameWon();
        }

    
 }

    function draw() {
        background(31, 204, 39);
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                grid[i][j].show();
            }
        }
    }