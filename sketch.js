let points = [];
const numPoints = 5;
const gap = 50; // 空間距離設定在 30-60 之間，此處取 50
let gameState = "START"; // 遊戲狀態：START, READY, PLAYING, GAMEOVER, WIN

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame() {
  points = [];
  // 產生 5 個基準點
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: i * (width / (numPoints - 1)),
      y: random(height * 0.3, height * 0.6)
    });
  }
}

function draw() {
  background(220);
  rectMode(CORNER); // 確保預設繪圖模式正確

  if (gameState === "START") { showStartScreen(); return; }
  if (gameState === "GAMEOVER") { showGameOver(); return; }
  if (gameState === "WIN") { showWinScreen(); return; }

  stroke(0);
  strokeWeight(3);
  noFill();

  // 繪製起點與終點標示
  drawZones();

  stroke(0);
  noFill();
  
  // 繪製上方線條
  beginShape();
  for (let p of points) {
    vertex(p.x, p.y);
  }
  endShape();

  // 繪製下方線條 (距離上方 10-40 加上 空間距離，總合形成隧道)
  beginShape();
  for (let p of points) {
    vertex(p.x, p.y + gap);
  }
  endShape();

  if (gameState === "READY") {
    showReadyHint();
    checkStartTrigger();
  } else if (gameState === "PLAYING") {
    checkCollision();
    checkWinCondition();
  }

  // 繪製玩家指標 (滑鼠)
  if (gameState === "PLAYING") fill(0, 255, 0);
  else fill(150);
  noStroke();
  ellipse(mouseX, mouseY, 10, 10);
}

function drawZones() {
  noStroke();
  const zoneWidth = 40; // 定義起點與終點區域的寬度

  // 起點 (左側)
  fill(0, 255, 0, 100);
  let p1 = points[0];
  let p2 = points[1];
  // 計算區域右側邊界點在斜坡上的 Y 座標
  let tStart = zoneWidth / (p2.x - p1.x);
  let yStartEnd = lerp(p1.y, p2.y, tStart);

  beginShape();
  vertex(p1.x, p1.y);                // 左上點
  vertex(zoneWidth, yStartEnd);      // 右上點 (跟隨斜率)
  vertex(zoneWidth, yStartEnd + gap);// 右下點
  vertex(p1.x, p1.y + gap);          // 左下點
  endShape(CLOSE);

  // 終點 (右側)
  fill(255, 215, 0, 150);
  let pn_1 = points[points.length - 2];
  let pn = points[points.length - 1];
  // 計算區域左側邊界點在斜坡上的 Y 座標
  let tEnd = (width - zoneWidth - pn_1.x) / (pn.x - pn_1.x);
  let yEndStart = lerp(pn_1.y, pn.y, tEnd);

  beginShape();
  vertex(width - zoneWidth, yEndStart); // 左上點 (跟隨斜率)
  vertex(pn.x, pn.y);                   // 右上點
  vertex(pn.x, pn.y + gap);             // 右下點
  vertex(width - zoneWidth, yEndStart + gap); // 左下點
  endShape(CLOSE);
}

function checkStartTrigger() {
  // 檢查滑鼠是否進入左側起點區域
  let startP = points[0];
  if (mouseX >= 0 && mouseX <= 40 && mouseY >= startP.y && mouseY <= startP.y + gap) {
    gameState = "PLAYING";
  }
}

function checkWinCondition() {
  if (mouseX >= width - 5) {
    gameState = "WIN";
  }
}

function checkCollision() {
  // 尋找目前滑鼠在哪兩個點之間
  for (let i = 0; i < points.length - 1; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];

    if (mouseX >= p1.x && mouseX <= p2.x) {
      // 使用線性插值 (lerp) 計算當前 X 位置對應的上下界 Y 值
      let t = (mouseX - p1.x) / (p2.x - p1.x);
      let currentUpperY = lerp(p1.y, p2.y, t);
      let currentLowerY = currentUpperY + gap;

      // 如果滑鼠 Y 軸超出範圍，則遊戲結束
      if (mouseY <= currentUpperY || mouseY >= currentLowerY) {
        gameState = "GAMEOVER";
      }
      break;
    }
  }
  // 如果滑鼠超出畫布左右範圍也算失敗
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    gameState = "GAMEOVER";
  }
}

function showStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(0);
  text("電流急急棒", width / 2, height / 2 - 60);
  
  // 繪製開始按鈕
  fill(100, 200, 100);
  rectMode(CENTER);
  rect(width / 2, height / 2 + 20, 160, 60, 10);
  
  fill(255);
  textSize(24);
  text("開始遊戲", width / 2, height / 2 + 20);
}

function showReadyHint() {
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(NORMAL);
  noStroke();
  fill(100);
  text("← 請將游標移動到左側綠色起點開始", width / 2, 80);
}

function showGameOver() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255, 0, 0);
  text("遊戲失敗！", width / 2, height / 2);
  textSize(16);
  text("點擊滑鼠重新開始", width / 2, height / 2 + 40);
}

function showWinScreen() {
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(0, 150, 0);
  text("恭喜通關成功！", width / 2, height / 2);
  textSize(20);
  fill(50);
  text("點擊滑鼠再玩一次", width / 2, height / 2 + 60);
}

function mousePressed() {
  if (gameState === "START") {
    // 檢查滑鼠是否點擊在開始按鈕範圍內
    if (mouseX > width / 2 - 80 && mouseX < width / 2 + 80 &&
        mouseY > height / 2 - 10 && mouseY < height / 2 + 50) {
      gameState = "READY";
    }
  } else if (gameState === "GAMEOVER" || gameState === "WIN") {
    initGame();
    gameState = "READY";
  }
}
