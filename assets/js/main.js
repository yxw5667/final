// Add scene
const loadScene = {
  key: 'loadScene',
  active: true,
  preload: loadPreload,
  create: loadCreate,
  update: loadUpdate,
};

const gameStartScene = {
  key: 'gameStartScene',
  preload: gameLoad,
  create: gameCreate,
  update: update,
};

const gameOverScene = {
  key: 'gameOverScene',
  create: overCreate,
};

// Game setting
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 338,

  // Gravity setting
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 600,
      },
      debug: false,
    },
  },
  scene: [loadScene, gameStartScene, gameOverScene],
};

let platforms;
let play;
let ground;
let ground2;
let bg;
let scoreText = null;
let endScoreText = null;
let isOver = false;
let groundSpeed = 0;
let bgSpeed = 0;
let score = 0;
const platformsSpeed = -200;
const obstaclesW = 320;
let obstaclesX = config.width;
var rd;
const game = new Phaser.Game(config);

// loding函数
function loadFn() {
  const width = this.cameras.main.width;
  const height = this.cameras.main.height;
  const loadingText = this.make.text({
    x: width / 2,
    y: height / 2 - 50,
    text: 'Loading...',
    style: {
      font: '20px monospace',
      fill: '#dbb87d',
    },
  });
  loadingText.setOrigin(0.5, 0.5);

  const percentText = this.make.text({
    x: width / 2,
    y: height / 2 - 5,
    text: '0%',
    style: {
      font: '18px monospace',
      fill: '#dbb87d',
    },
  });
  percentText.setOrigin(0.5, 0.5);

  this.load.on('progress', function (value) {
    percentText.setText(parseInt(value * 100) + '%');
  });

  this.load.on('complete', function () {
    loadingText.destroy();
    percentText.destroy();
  });
}

// Preload
function loadPreload() {
  // Add image resource
  this.load.image('title', './assets/images/title01.png');
  this.load.image('gameover', './assets/images/gameover.png');
  this.load.image('start-button', './assets/images/button_hover.png');
  this.load.image('restart-button', './assets/images/restartButton.png');
  this.load.image('background', './assets/images/blurMountain.png');
  this.load.image('cloud01', './assets/images/cloud01.png');
  this.load.image('cloud02', './assets/images/cloud02.png');
  this.load.image('desert', './assets/images/desert.png');
  this.load.image('cloud03', './assets/images/cloud03.png');

  // Add audio
  this.load.audio('score', './assets/audio/score.wav');
  this.load.audio('ground-hit', './assets/audio/ground-hit.wav');
  this.load.audio('pipe-hit', './assets/audio/pipe-hit.wav');
  this.load.audio('music_intro', './assets/audio/bg.mp3');

  // Add sprite resource
  this.load.spritesheet('character', './assets/images/character.png', {
    frameWidth: 76,
    frameHeight: 90,
  });

  this.load.spritesheet('dragon', './assets/images/dragonMove.png', {
    frameWidth: 150,
    frameHeight: 44,
  });

  this.load.spritesheet('gravestone', './assets/images/gravestone.png', {
    frameWidth: 43,
    frameHeight: 44,
  });

  this.load.spritesheet('runcharacter', './assets/images/runCharacter.png', {
    frameWidth: 47,
    frameHeight: 30,
  });

  loadFn.call(this);
}

// Load prepare
function loadCreate() {
  // Add background to scene
  bg = this.add.tileSprite(
    config.width / 2,
    config.height / 2,
    config.width,
    config.height,
    'background'
  );

  const title = this.add.image(300, 110, 'title');
  cloud02 = this.add.tileSprite(0, 170, 0, 0, 'cloud02').setOrigin(0, 0);
  cloud01 = this.add.tileSprite(0, 140, 0, 0, 'cloud01').setOrigin(0, 0);
  desert = this.add.image(300, 263, 'desert');
  cloud03 = this.add.tileSprite(100, 190, 0, 0, 'cloud03').setOrigin(0, 0);

  const startButton = this.add
    .image(config.width / 2, config.height - 180, 'start-button')
    .setInteractive();

  // Add animation
  this.anims.create({
    key: 'fly',
    frames: this.anims.generateFrameNumbers('runcharacter', {
      start: 0,
      end: 8,
    }),
    frameRate: 10,
    repeat: -1,
  });

  const character = this.add.sprite(176, 266, 'character');
  this.anims.create({
    key: 'character_anim',
    frames: this.anims.generateFrameNumbers('character'),
    frameRate: 5,
    repeat: -1,
  });

  character.play('character_anim');

  startButton.on('pointerdown', function (pointer) {
    title.destroy();
    startButton.destroy();
    cloud01.destroy();
    cloud02.destroy();
    desert.destroy();
    cloud03.destroy();
    character.destroy();

    game.scene.start('gameStartScene');
  });

  // Let bgm loop play
  this.sound.play('music_intro', {
    loop: true,
  });
}

function loadUpdate() {
  cloud01.tilePositionX += 0.2;
  cloud02.tilePositionX += 0.1;
  cloud03.tilePositionX += 0.8;
}

var long1, long2, long3;
var obstacleStone1, obstacleStone2, obstacleStone3;
// Add obstacles
function createObstacles() {
  // 龙的y轴
  let dragonY = Phaser.Math.Between(20, 200);
  // 石头的y轴，固定值
  let gravestoneY = config.height - 95;
  // 屏幕外距离
  obstaclesX = config.width + Phaser.Math.Between(100, 500);
  // 第一条龙
  long1 = platforms.create(obstaclesX, dragonY, 'dragon');
  // 第二条龙
  dragonY = Phaser.Math.Between(20, 200);
  obstaclesX = config.width + Phaser.Math.Between(500, 900);
  long2 = platforms.create(obstaclesX, dragonY, 'dragon');
  // 第三条龙
  dragonY = Phaser.Math.Between(20, 200);
  obstaclesX = config.width + Phaser.Math.Between(900, 1400);
  long3 = platforms.create(obstaclesX, dragonY, 'dragon');
  // 第一个墓碑
  obstaclesX = config.width + Phaser.Math.Between(100, 300);
  obstacleStone1 = platforms.create(obstaclesX, gravestoneY, 'gravestone');
  // 第二个墓碑
  obstaclesX = config.width + Phaser.Math.Between(300, 500);
  obstacleStone2 = platforms.create(obstaclesX, gravestoneY, 'gravestone');

  //循环子组件设置重力为false
  platforms.children.iterate(function (child) {
    child.body.allowGravity = false;
  });
}

// Update obstacles position
function updateObstacles(that) {
  platforms.children.iterate(function (child) {
    if (child.body.x < -obstaclesW) {
      topY = Phaser.Math.Between(-60, 0);
      bottomY = Phaser.Math.Between(400, 460);

      if (child.body.y < 20) {
        score++;
        scoreText.setText(score);
        that.sound.play('score');
        child.body.reset(config.width, topY);
      } else {
        child.body.reset(config.width, bottomY);
      }
    }
  });
}

// score
function scoreRefresh() {
  score++;
  scoreText.setText(score);
  that.sound.play('score');
}

// Game start
function gameLoad() {
  // Add background images resource
  this.load.image('sea01', './assets/images/sea01.png');
  this.load.image('sea02', './assets/images/sea02.png');
  this.load.image('sea03', './assets/images/sea03.png');
  this.load.image('sea04', './assets/images/sea04.png');
  this.load.image('sea05', './assets/images/sea05.png');
  this.load.image('building02', './assets/images/building02.png');
  this.load.image('building01', './assets/images/building01.png');
  this.load.image('ground', './assets/images/bridge.png');
}

function gameCreate() {
  // Add background images to game
  sea05 = this.add.tileSprite(0, 230, 0, 0, 'sea05').setOrigin(0, 0);
  sea04 = this.add.tileSprite(0, 240, 0, 0, 'sea04').setOrigin(0, 0);
  sea03 = this.add.tileSprite(0, 260, 0, 0, 'sea03').setOrigin(0, 0);
  sea02 = this.add.tileSprite(0, 250, 0, 0, 'sea02').setOrigin(0, 0);
  sea01 = this.add.tileSprite(0, 300, 0, 0, 'sea01').setOrigin(0, 0);
  cloud02 = this.add.tileSprite(0, 140, 0, 0, 'cloud02').setOrigin(0, 0);
  cloud01 = this.add.tileSprite(-40, 100, 0, 0, 'cloud01').setOrigin(0, 0);
  building02 = this.add
    .tileSprite(-180, 190, 0, 0, 'building02')
    .setOrigin(0, 0);
  building01 = this.add
    .tileSprite(0, 150, 100, 0, 'building01')
    .setOrigin(0, 0);

  this.anims.create({
    key: 'dragon_anim',
    frames: this.anims.generateFrameNumbers('dragon', {
      start: 0,
      end: 12,
    }),
    frameRate: 16,
    repeat: -1,
  });

  this.anims.create({
    key: 'gravestone_anim',
    frames: this.anims.generateFrameNumbers('gravestone', {
      start: 0,
      end: 3,
    }),
    frameRate: 6,
    repeat: -1,
  });

  // Add Physics Components
  platforms = this.physics.add.group();
  // platforms.enableBody = true;

  createObstacles();

  // Add Physics Components sprite
  ground = this.add.tileSprite(
    config.width - 856 / 2,
    config.height - 77 / 2,
    856,
    77,
    'ground'
  );
  ground = this.physics.add.existing(ground, 'staticSprite');
  scoreText = this.add.text(570, 16, score);
  scoreText.setFontSize(16);

  // Add player with gravity
  player = this.physics.add.sprite(100, 100, 'runcharacter');

  //添加按下事件监听
  this.input.on('pointerdown', (pointer, currentlyOver) => {
    if (isOver) {
      return;
    }
    this.tweens.add({
      targets: player,
      duration: 50,
      angle: -30,
    });

    //设置角色Y轴速度
    player.setVelocityY(-200);
  });

  // Player animation
  player.anims.play('fly');
}

function overCreate() {
  const title = this.add.image(300, 169, 'gameover');
  const restartButton = this.add
    .image(config.width / 2, config.height - 100, 'restart-button')
    .setInteractive();

  endScoreText = this.add.text(
    config.width / 2 - 5,
    config.height / 2 - 9,
    score
  );
  scoreText.setFontSize(16);

  restartButton.on('pointerdown', (pointer) => {
    isOver = false;
    title.destroy();
    restartButton.destroy();
    restart();
  });
}

function restart() {
  long1.destroy();
  long2.destroy();
  long3.destroy();
  obstacleStone1.destroy();
  obstacleStone2.destroy();
  createObstacles();
  player.x = 100;
  player.y = 100;
  player.angle = 0;
  player.anims.play('fly');
  score = 0;
  endScoreText.destroy();
  scoreText.setText(score);
  game.scene.resume('gameStartScene');
}

function gameOver(that) {
  isOver = true;
  // score = 0;
  bgSpeed = 0;
  groundSpeed = 0;
  // obstaclesX = config.width;
  player.anims.stop('fly');
  game.scene.start('gameOverScene');
}

//  更新函数
function update() {
  // 背景移动
  cloud01.tilePositionX += 0.4;
  cloud02.tilePositionX += 0.2;
  building01.tilePositionX += 0.8;
  building02.tilePositionX += 0.5;
  sea01.tilePositionX += 1.2;
  sea02.tilePositionX += 0.8;
  sea03.tilePositionX += 0.6;
  sea04.tilePositionX += 0.4;
  sea05.tilePositionX += 0.2;

  long1.anims.play('dragon_anim', true);
  long2.anims.play('dragon_anim', true);
  long3.anims.play('dragon_anim', true);
  obstacleStone1.anims.play('gravestone_anim', true);
  obstacleStone2.anims.play('gravestone_anim', true);

  if (long1.x + long1.width / 2 < 0) {
    let dragonY = Phaser.Math.Between(20, 200);
    obstaclesX = config.width + Phaser.Math.Between(100, 300);
    long1.x = obstaclesX;
    long1.y = Phaser.Math.Between(20, 200);
    if (!isOver) {
      scoreRefresh();
    }
  }
  if (long2.x + long2.width / 2 < 0) {
    let dragonY = Phaser.Math.Between(20, 200);
    obstaclesX = config.width + Phaser.Math.Between(100, 300);
    long2.x = obstaclesX;
    long2.y = Phaser.Math.Between(20, 200);
    if (!isOver) {
      scoreRefresh();
    }
  }
  if (long3.x + long3.width / 2 < 0) {
    let dragonY = Phaser.Math.Between(20, 200);
    obstaclesX = config.width + Phaser.Math.Between(100, 300);
    long3.x = obstaclesX;
    long3.y = Phaser.Math.Between(20, 200);
    if (!isOver) {
      scoreRefresh();
    }
  }

  if (obstacleStone1.x + obstacleStone1.width / 2 < 0) {
    obstaclesX = config.width + Phaser.Math.Between(100, 300);
    obstacleStone1.x = obstaclesX;
    if (!isOver) {
      scoreRefresh();
    }
  }
  if (obstacleStone2.x + obstacleStone2.width / 2 < 0) {
    obstaclesX = config.width + Phaser.Math.Between(100, 300);
    obstacleStone2.x = obstaclesX;
    if (!isOver) {
      scoreRefresh();
    }
  }

  // 判断人物冲出场景
  if (player.y - player.height / 2 < 0) {
    player.angle = 90;
    gameOver();
  }

  // 背景地面无限滚动
  if (!isOver) {
    bgSpeed += 0.01;
    groundSpeed += 3.6;
    bg.tilePositionX = bgSpeed;
    ground.tilePositionX = groundSpeed;
    // updateObstacles(this);
    platforms.setVelocityX(platformsSpeed);
    //判断角色下降角度
    if (player.angle < 90) player.angle += 2.5;
    this.physics.resume();
  } else {
    platforms.setVelocityX(platformsSpeed);
    // this.physics.pause();
  }

  //添加碰撞
  this.physics.add.overlap(player, platforms, () => {
    if (isOver) {
      return;
    }
    this.sound.play('pipe-hit');
    player.angle = 90;
    gameOver();
  });

  this.physics.add.collider(player, ground, () => {
    if (isOver) {
      return;
    }
    this.sound.play('ground-hit');
    player.angle = 90;
    gameOver();
  });
}
