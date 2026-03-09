var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update, render: render});

var space;
var player;
var cursors;
var ACCELERATION = 300;
var DRAG = 200;
var MAXSPEED = 200;
var bullets;
var fireButton;
var bulletTimer = 0;
var asteroids;
var explosion;
var shields;
var asteroidLaunchTimer;
var gameOver;
var score = 0;
var scoreText;
var playerDeath;
var greenEnemies;
var greenEnemiesLaunchTimer;
var enemyBullet;
var firingTimer = 0;
var livingEnemies = [];
var laser;



function preload() {
    game.load.image('background', 'assets/space.png');
    game.load.atlasJSONHash('ship', 'assets/ellie_fly.png', 'assets/ellie_fly.json');
    game.load.image('bullet', 'assets/Bullets.png');
    game.load.atlasJSONHash('enemy1', 'assets/asteroids.png', 'assets/asteroids.json' );
    game.load.atlasJSONHash('explosion1', 'assets/explosion.png', 'assets/explosion.json');
    game.load.atlasJSONHash('shields_on', 'assets/shields_on.png', 'assets/shields_on.json');
    game.load.atlasJSONHash('game_over', 'assets/game_over.png', 'assets/game_over.json');
    game.load.atlasJSONHash('enemy2', 'assets/enemy.png', 'assets/enemy.json');
    game.load.image('enemyBullet', 'assets/enemy_bullets.png');
    game.load.image('laser', 'assets/laser.png');
    


}
    
function create() {
    // Smooth the pixels
    game.renderer.renderSession.roundPixels = true; 
    
    // The scrolling space background
    space = game.add.tileSprite(0,0, 800, 600, 'background');
    
    // Bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0);
    bullets.setAll('anchor.y', 0 );
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    
    // Laser group
    laser = game.add.group();
    laser.enableBody = true;
    laser.physicsBodyType = Phaser.Physics.ARCADE;
    laser.createMultiple(30, 'laser');
    laser.setAll('anchor.x', 0);
    laser.setAll('anchor.y', 0 );
    laser.setAll('scale.x', 0.5);
    laser.setAll('scale.y', 0.5);
    laser.setAll('outOfBoundsKill', true);
    laser.setAll('checkWorldBounds', true);
    
    // Ellie properties
    player = game.add.sprite(50, 200, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.animations.add('fly');
    player.animations.play('fly', 15, true);
    player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
    player.body.drag.setTo(DRAG, DRAG);
    player.health = 100;
    player.events.onKilled.add(function(){ 
    });
    player.events.onRevived.add(function(){ 
    });
    
    
    
    // Enemy1 group
    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.ARCADE;
    asteroids.createMultiple(1000, 'enemy1');
    asteroids.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3], 10, true);
    asteroids.callAll('animations.play', 'animations', 'spin');
    asteroids.setAll('anchor.x', 0.5);
    asteroids.setAll('anchor.y', 0.5);
    asteroids.setAll('scale.x', 0.5);
    asteroids.setAll('scale.y', 0.5);
    asteroids.setAll('angle', 90);
    asteroids.setAll('outOfBoundsKill', true);
    asteroids.setAll('checkWorldBounds', false);
    asteroids.forEach(function(enemy1){
        enemy1.body.setSize(enemy1.width * 3 / 4, enemy1.height * 3 / 4);
        enemy1.damageAmount = -20;
    });
    
    // Enemy2 group
    greenEnemies = game.add.group();
    greenEnemies.enableBody = true;
    greenEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    greenEnemies.createMultiple(1000, 'enemy2');
    greenEnemies.callAll('animations.add', 'animations', 'hover', [0, 1, 2], 10, true);
    greenEnemies.callAll('animations.play', 'animations', 'hover');
    greenEnemies.setAll('scale.x', 1.3);
    greenEnemies.setAll('scale.y', 1.3);
    greenEnemies.setAll('outOfBoundsKill', true);
    greenEnemies.setAll('checkWorldBounds', false);
    greenEnemies.forEach(function(enemy2){
        enemy2.body.setSize(enemy2.width * 3 / 4, enemy2.height * 3 / 4);
        enemy2.damageAmount = -20;
    });
    
    // Green Enemy's bullets
    greenEnemyBullets = game.add.group();
    greenEnemyBullets.enableBody = true;
    greenEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    greenEnemyBullets.createMultiple(1, 'enemyBullet');
    greenEnemyBullets.setAll('anchor.x', 0.5);
    greenEnemyBullets.setAll('anchor.y', 0.5);
    greenEnemyBullets.setAll('outOfBoundsKill', true);
    greenEnemyBullets.setAll('checkWorldBounds', true);
    
    
    
    // Game controls
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
    switchWeapon = game.input.keyboard.addKey(Phaser.Keyboard.S);
    
    // explosion group
    explosion = game.add.group();
    explosion.enableBody = true;
    explosion.physicsBodyType = Phaser.Physics.ARCADE;
    explosion.createMultiple(200, 'explosion1');
    explosion.setAll('anchor.x', 0.5);
    explosion.setAll('anchor.y', 0.5);
    explosion.forEach( function(explosion1) {
        explosion1.animations.add('explosion1');
                       });
    
    
    
    // Shields stat
    shields = game.add.text(game.world.width - 150, 10, 'Shields: ' + player.health + '%', {font: '20px Arial', fill: '#fff'});
    shields.render = function() {
        shields.text = 'Shields: ' + Math.max(player.health, 0) + '%';
    };
    
    // Game over text
    gameOver = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER!', { font: '84px Arial', fill: '#fff'});
    gameOver.anchor.setTo(0.5, 0.5);
    gameOver.visible = false;
    
    // Score
    scoreText = game.add.text(10, 10, '', {font: '20px Arial', fill: '#fff'});
    scoreText.render = function() {
        scoreText.text = 'Score: ' + score;
    };
    scoreText.render();
    
    // Laser Notification
    laserText = game.add.text(250, 10, '', {font: '20px Arial', fill: '#fff'});
    laserText.render = function() {
    laserText.text = 'A for bullets S for lasers!'
    }
    laserText.render();
    
    
    
    
    
    
    game.time.events.add(1000, launchAsteroids);
    game.time.events.add(1000, launchEnemy1)
    

}
    
function update() {
    // This allows the background to scroll
    space.tilePosition.x += 1;
    
    // Set this to zero and waiting for key input.
    player.body.acceleration.x = 0;
    
    // If-else-if statements for movement of the ship
    if (cursors.left.isDown) {
        player.body.acceleration.x = -ACCELERATION;
        
    }
    if (cursors.left.isDown && cursors.up.isDown) {
        player.body.velocity.x = -200;
        player.body.velocity.y = -200;
    }
    if (cursors.right.isDown && cursors.up.isDown) {
        player.body.velocity.x = 200;
        player.body.velocity.y = -200;
    }
    if (cursors.left.isDown && cursors.down.isDown) {
        player.body.velocity.x = -200;
        player.body.velocity.y = 200;
    }
    if (cursors.right.isDown && cursors.down.isDown) {
        player.body.velocity.x = 200;
        player.body.velocity.y = 200;
    }
    else if (cursors.right.isDown) {
        player.body.acceleration.x = ACCELERATION;
        
    }
    else if (cursors.up.isDown) {
        player.body.velocity.y = -200;
    }
    else if (cursors.down.isDown) {
        player.body.velocity.y = 200;
    }
    
    // Fire bullet
    if (player.alive && fireButton.isDown) {
        fireBullet();
    } else if (player.alive && switchWeapon.isDown) {
        fireLaser();
    }
    
    // enemy Fire
    if (true) {
        enemyFires();
    }
    
    // Stop at screen edges
    if (player.x > game.width - 30) {
        player.x = game.width - 30;
        player.body.acceleration.x = 0;
    }
    if (player.x < 30) {
        player.x = 30;
        player.body.acceleration.x = 0;
    }
    if (player.y > game.height - 30) {
        player.y = game.height - 30;
        player.body.acceleration.y = 0;
    }
    if (player.y < 30) {
        player.y = 30;
        player.body.acceleration.y = 0;
    }
    
    // Check collisions
    game.physics.arcade.overlap(player, asteroids, shipCollide, shieldsOn, null, this);
    game.physics.arcade.overlap(asteroids, bullets, hitEnemy, null, this);
    game.physics.arcade.overlap(asteroids, laser, hitEnemy, null, this);
    
    game.physics.arcade.overlap(player, greenEnemies, shipCollide, shieldsOn, null, this);
    game.physics.arcade.overlap(greenEnemies, bullets, hitEnemy, null, this);
    game.physics.arcade.overlap(greenEnemies, laser, hitEnemy, null, this);
    
    game.physics.arcade.overlap(greenEnemyBullets, player, enemyHitsPlayer, shieldsOn, null, this);
    
    
    
    // Game Over?
    if (! player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        gameOver.alpha = 0;
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();
        function setResetHandlers() {
            // The 'click to restart' handler
            spaceRestart = fireButton.onDown.addOnce(_restart,this);
            function _restart() {
                spaceRestart.detach();
                restart();
            }
        }
        
    }
}

function render() {
//    for (var i = 0; i < asteroids.length; i++) {
//        game.debug.body(asteroids.children[i]);
//    }
//    game.debug.body.(player);
}

function fireBullet() {
    // Set a time limit to avoid player firing too fast
    if (game.time.now > bulletTimer){
        var BULLET_SPEED = 400;
        var BULLET_SPACING = 250;
        var bullet = bullets.getFirstExists(false);
        
    }
    
     
    if (bullet) {
        // And fire it
        bullet.reset(player.x, player.y - 18);
        bullet.body.velocity.x = 400;
        
        bulletTimer = game.time.now + BULLET_SPACING;
    } 
    
    
    
    
}

function fireLaser() {
    // Set a time limit to avoid player firing too fast
    if (game.time.now > bulletTimer){
        var BULLET_SPEED = 400;
        var BULLET_SPACING = 100;
        var lasers = laser.getFirstExists(false);
        
    }
    
     
    if (lasers) {
        // And fire it
        lasers.reset(player.x, player.y - 0);
        lasers.body.velocity.x = 1000;
        
        bulletTimer = game.time.now + BULLET_SPACING;
    } 
}

function launchAsteroids() {
//    var MIN_ENEMY_SPACING = 300;
//    var MAX_ENEMY_SPACING = 3000;
//    var ENEMY_SPEED = 250;
//    
//    var enemy1 = asteroids.getFirstExists(false);
//    if (enemy1) {
//        enemy1.reset(game.rnd.integerInRange(0, game.width), -20);
//        enemy1.body.velocity.x = game.rnd.integerInRange(-300, 300);
//        enemy1.body.velocity.y = ENEMY_SPEED;
//        enemy1.body.drag.x = 100;
//    }
    
    var enemy2 = asteroids.getFirstExists(false);
			if(enemy2) {
				enemy2.reset(800 - 30,Math.floor(Math.random()*(600 - 30)),'enemy1'+(1+Math.floor(Math.random()*5)));
                enemy2.body.velocity.x = -300;
			}
			else if (enemy2) {
				enemy2 = asteroids.create(800 - 30,Math.floor(Math.random()*(600 -30)),'enemy1'+(1+Math.floor(Math.random()*5)));
                
			}
            
            
			
    
    // Send another enemy quickly
    asteroidLaunchTimer = game.time.events.add(game.rnd.integerInRange(800, 800), launchAsteroids)
}

function launchEnemy1() {
//    var MIN_ENEMY_SPACING = 300;
//    var MAX_ENEMY_SPACING = 3000;
//    var ENEMY_SPEED = 250;
//    
//    var enemy1 = asteroids.getFirstExists(false);
//    if (enemy1) {
//        enemy1.reset(game.rnd.integerInRange(0, game.width), -20);
//        enemy1.body.velocity.x = game.rnd.integerInRange(-300, 300);
//        enemy1.body.velocity.y = ENEMY_SPEED;
//        enemy1.body.drag.x = 100;
//    }
    
    var enemy1 = greenEnemies.getFirstExists(false);
			if(enemy1) {
				enemy1.reset(800 - 30,Math.floor(Math.random()*(600 - 30)),'enemy2'+(1+Math.floor(Math.random()*5)));
                enemy1.body.velocity.x = -300;
			}
			else if (enemy1) {
				enemy1 = greenEnemies.create(800 - 30,Math.floor(Math.random()*(600 -30)),'enemy2'+(1+Math.floor(Math.random()*5)));
                
			}
            
			
    
    // Send another enemy quickly
    greenEnemiesLaunchTimer = game.time.events.add(game.rnd.integerInRange(300, 300), launchEnemy1)
}

function shipCollide(player, asteroids) {
//    var explosion1 = asteroidExplosions.getFirstExists(false);
//    explosion1.reset(asteroids.body.x + asteroids.body.halfWidth, asteroids.body.y + asteroids.body.halfHeight);
//    explosion1.body.velocity.y = asteroids.body.velocity.y;
//    explosion1.alpha = 0.7;
//    explosion1.animations.play('explosion1', 30, false, true);
    asteroids.kill();
    player.damage(20);
    shields.render();
    
    if (player.alive) {
        var explosion1 = explosion.getFirstExists(false);
        explosion1.reset(asteroids.body.x + asteroids.body.halfWidth, asteroids.body.y + asteroids.body.halfHeight);
        explosion1.body.velocity.y = asteroids.body.velocity.y;
        explosion1.alpha = 0.7;
        explosion1.animations.play('explosion1', 30, false, true);
        } else {
        // Player Death
        player = game.add.sprite(player.body.x, player.body.y, 'game_over')
        player.animations.add('game_over');
        player.animations.play('game_over', 5, false, true);
    }
}

function shieldsOn(player, asteroids, greenEnemies) {
    if (shipCollide) {
    player = game.add.sprite(player.body.x, player.body.y, 'shields_on');
    player.animations.add('shields_on');
    player.animations.play('shields_on', 500, false, true);
    }
}

function hitEnemy(asteroids, bullets) {
    var explosion1 = explosion.getFirstExists(false);
    explosion1.reset(asteroids.body.x + asteroids.body.halfWidth, asteroids.body.y + asteroids.body.halfHeight);
    explosion1.body.velocity.y = asteroids.body.velocity.y;
    explosion1.alpha = 0.7;
    explosion1.animations.play('explosion1', 30, false, true);
    asteroids.kill();
    bullets.kill();
    
    
    
    
    
    
    
    // Increase score
    score += 20 * 10;
    scoreText.render();
}

function enemyHitsPlayer(player, bullet) {
    bullet.kill();
    player.damage(20);
    shields.render()
    
    if (player.alive) {
        return;
        } else {
        // Player Death
        player = game.add.sprite(player.body.x, player.body.y, 'game_over')
        player.animations.add('game_over');
        player.animations.play('game_over', 5, false, true);
    } 
    
}

function enemyFires() {
    enemyBullet = greenEnemyBullets.getFirstExists(false);
    
    livingEnemies.length=0;

    greenEnemies.forEachAlive(function(greenEnemies){

        // put every living enemy in an array
        livingEnemies.push(greenEnemies);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
        firingTimer = game.time.now + 2000;
    }
    
}

function restart () {
    // Reset the enemies
    asteroids.callAll('kill');
    game.time.events.remove(asteroidLaunchTimer);
    game.time.events.add(1000, launchAsteroids);
    
    greenEnemyBullets.callAll('kill');
    greenEnemies.callAll('kill');
    game.time.events.remove(greenEnemiesLaunchTimer);
    game.time.events.add(1000, launchEnemy1);
    
    // Revive the player
    player.revive();
    player.health = 100;
    shields.render();
    score = 0;
    scoreText.render();
    
    // Hide the text
    gameOver.visible = false;
}

