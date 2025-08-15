const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

let player;
let cursors;
let speedModes = ['Tortoise', 'Human', 'Hare', 'Lightning'];
let currentSpeedIndex = 1;
let speedValues = [100, 200, 350, 550];

let multipliersGroup;
let rocketsGroup;

let power = 0;
let altitude = 0;
let altitudeText;
let powerText;
let speedText;

let gameOver = false;

const game = new Phaser.Game(config);

function preload() {
  // Load assets here
  this.load.image('sky', 'https://i.imgur.com/f4W3yTR.png'); // sky bg (replace with your own)
  this.load.spritesheet('plane', 'https://i.imgur.com/ZLnYnTJ.png', {
    frameWidth: 64,
    frameHeight: 64,
  }); // plane sprite with superman colors
  this.load.image('multiplier', 'https://i.imgur.com/Lz62FxY.png'); // multiplier icon
  this.load.image('rocket', 'https://i.imgur.com/RDfGy6j.png'); // rocket icon
}

function create() {
  this.add.tileSprite(400, 300, 800, 600, 'sky').setScrollFactor(0);

  player = this.physics.add.sprite(400, 500, 'plane', 0);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: 'fly',
    frames: this.anims.generateFrameNumbers('plane', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });

  player.play('fly');

  cursors = this.input.keyboard.createCursorKeys();

  multipliersGroup = this.physics.add.group();
  rocketsGroup = this.physics.add.group();

  altitude = 0;
  power = 0;

  altitudeText = this.add.text(10, 10, 'Altitude: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3,
  });

  powerText = this.add.text(10, 40, 'Power: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3,
  });

  speedText = this.add.text(10, 70, `Speed: ${speedModes[currentSpeedIndex]}`, {
    fontSize: '20px',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3,
  });

  // Spawn multipliers & rockets periodically
  this.time.addEvent({
    delay: 2500,
    callback: () => spawnMultiplier(this),
    loop: true,
  });

  this.time.addEvent({
    delay: 4000,
    callback: () => spawnRocket(this),
    loop: true,
  });

  // Collision detection
  this.physics.add.overlap(player, multipliersGroup, collectMultiplier, null, this);
  this.physics.add.overlap(player, rocketsGroup, hitRocket, null, this);
}

function update() {
  if (gameOver) return;

  // Move player left/right with cursors
  if (cursors.left.isDown) {
    player.setVelocityX(-speedValues[currentSpeedIndex]);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speedValues[currentSpeedIndex]);
  } else {
    player.setVelocityX(0);
  }

  // Speed switch: up/down keys
  if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
    currentSpeedIndex = Math.min(currentSpeedIndex + 1, speedModes.length - 1);
    speedText.setText(`Speed: ${speedModes[currentSpeedIndex]}`);
  }
  if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
    currentSpeedIndex = Math.max(currentSpeedIndex - 1, 0);
    speedText.setText(`Speed: ${speedModes[currentSpeedIndex]}`);
  }

  // Update altitude & power with time & speed
  altitude += 0.5 * (currentSpeedIndex + 1);
  altitudeText.setText(`Altitude: ${Math.floor(altitude)}`);

  // Game over condition: altitude too low or power <= 0
  if (altitude < 0 || power <= 0) {
    endGame(this);
  }
}

function spawnMultiplier(scene) {
  const x = Phaser.Math.Between(50, 750);
  const y = -50;
  const multiplier = multipliersGroup.create(x, y, 'multiplier');
  multiplier.setVelocityY(speedValues[currentSpeedIndex] / 2 + 50);
  multiplier.setInteractive();
  multiplier.body.setAllowGravity(false);
  multiplier.setScale(0.5);
  multiplier.checkWorldBounds = true;
  multiplier.outOfBoundsKill = true;
}

function spawnRocket(scene) {
  const x = Phaser.Math.Between(50, 750);
  const y = -50;
  const rocket = rocketsGroup.create(x, y, 'rocket');
  rocket.setVelocityY(speedValues[currentSpeedIndex] / 2 + 100);
  rocket.setInteractive();
  rocket.body.setAllowGravity(false);
  rocket.setScale(0.5);
  rocket.checkWorldBounds = true;
  rocket.outOfBoundsKill = true;
}

function collectMultiplier(player, multiplier) {
  power += 10;
  powerText.setText(`Power: ${power}`);
  multiplier.destroy();
}

function hitRocket(player, rocket) {
  power = Math.floor(power / 2);
  powerText.setText(`Power: ${power}`);
  altitude -= 20;
  rocket.destroy();

  if (power <= 0) {
    endGame(this);
  }
}

function endGame(scene) {
  gameOver = true;
  scene.add
    .text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      stroke: '#000',
      strokeThickness: 5,
    })
    .setOrigin(0.5);
  scene.physics.pause();
  player.setTint(0xff0000);
}
