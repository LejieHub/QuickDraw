class Scene2 extends Phaser.Scene{
    maxAngle = Math.PI / 20;
    minAngle = -Math.PI / 5;
    countdown = 14;
    
    // 定义初始值和目标值
    initialShakeIntensity = 180;
    initialFollowSpeed = 0.02;
    initialRotationSpeed = 0.005;
    targetShakeIntensity = 0;
    targetFollowSpeed = 1;
    targetRotationSpeed = 1;
     
    // 当前值
    reticleShakeIntensity = this.initialShakeIntensity;
    reticleFollowSpeed = this.initialFollowSpeed;
    handRotationSpeed = this.initialRotationSpeed;

    // 定义子弹的垂直偏移初始值和目标值
    initialBulletOffsetY = -600;
    targetBulletOffsetY = 0;
    currentBulletOffsetY = this.initialBulletOffsetY;

    constructor(){
        super("playGame");
    }

    
    create(){
        // 添加一个时间事件来定时生成鸟
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 10000), // 1-5秒随机生成一只鸟
            callback: this.spawnBird,
            callbackScope: this,
            //loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(10000, 20000), // 3 到 10 秒之间随机生成一个滚滚草
            callback: this.spawnTumbleweed, // 调用生成滚滚草的函数
            callbackScope: this, // 设置作用域为当前场景
            loop: true // 循环生成
        });
        
        this.timer = 0; // 用于记录时间
        this.timerEvent = null; // Phaser 定时事件对象
        
        this.countdown = 14;
        // 隐藏鼠标光标
        this.input.manager.canvas.style.cursor = 'none';

        this.countdownMusic = this.sound.add('countdownMusic', {
            volume: 1, // 音量：0.0 ~ 1.0
        });

        this.fireMusic = this.sound.add('fireMusic', {
            volume: 1, // 音量：0.0 ~ 1.0
        });

        this.birdFX = this.sound.add('birdFX', {
            volume: 1, // 音量：0.0 ~ 1.0
        });
        
        this.tumbleweedFX = this.sound.add('tumbleweedFX', {
            volume: 1, // 音量：0.0 ~ 1.0
        });

        this.countdownMusic.play();

        this.input.mouse.disableContextMenu();
        
        this.add.image(0, 0, 'background').setDisplaySize(1295, 881).setOrigin(0, 0);

        // 初始化子弹（确保 physics 系统已启用）
        this.bullet = this.physics.add.image(0, 0, 'bullet');
        this.bullet.setVisible(false);
        this.bullet.setActive(false);

        this.hand = this.add.image(220, 650, 'hand').setDisplaySize(180, 77).setOrigin(0, 1).setVisible(false);
        this.player = this.physics.add.image(200, 600, 'player_idle').setDisplaySize(341, 341).setOrigin(0.5, 0.5);

        this.marshalHand = this.add.image(1065, 585, 'marshal_hand').setDisplaySize(165, 59).setOrigin(1, 0.5).setFlipX(true).setVisible(false);
        this.marshal = this.physics.add.image(1050, 630, 'marshal_idle').setDisplaySize(341, 341).setOrigin(0.5, 0.5).setFlipX(true);

        // // 创建 reticle 并隐藏
        // this.reticle = this.add.image(0, 0, 'reticle1').setDisplaySize(200, 200).setOrigin(0.5, 0.8).setVisible(false);
        
        // 初始化 reticle 图片数组
        this.reticleFrames = ['reticle1', 'reticle2', 'reticle3', 'reticle4'];

        // 设置初始 reticle
        this.currentReticleFrame = 0; // 当前显示的 reticle 索引
        this.reticle = this.add.image(0, 0, this.reticleFrames[this.currentReticleFrame])
            .setDisplaySize(200, 200)
            .setOrigin(0.5, 0.8)
            .setVisible(false); // 初始隐藏

        // 是否正在切换动画
        this.reticleSwitching = false;

        // 在 create() 中初始化状态变量
        this.previousRightButtonDown = false;
        
        //this.add.text(20,20,"Playing game",{font: "25px Arial", fill:"yellow"});

        // 倒计时文本
        this.countdownText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 150, this.countdown, {
            font: "80px Arial",
            fill: "red"
        }).setOrigin(0.5, 0.5);

        // 启动倒计时
        this.time.addEvent({
            delay: 1000, // 每秒触发一次
            repeat: this.countdown - 1, // 重复4次（5秒倒计时）
            callback: this.updateCountdown,
            callbackScope: this
        });

        // 设置键盘输入
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cursors = this.input.keyboard.createCursorKeys();

        // 初始化箭头挑战的相关变量
        this.correctSequence = [];
        this.playerInput = [];
        this.arrowIcons = [];

        // 初始化变量
        this.inputTimer = null;
        this.inputTimeout = 3000; // 3 秒时间窗口

        // 检测子弹与 marshal 的碰撞
        this.physics.add.overlap(this.bullet, this.marshal, this.handleMarshalHit, null, this);

        // 检测子弹与 player 的碰撞
        this.physics.add.overlap(this.bullet, this.player, this.handlePlayerHit, null, this);

        this.player.body.setSize(1000, 6667); // 设置 player 的碰撞区域
        this.marshal.body.setSize(2000, 6667); // 设置 marshal 的碰撞区域

        
    }


    spawnTumbleweed() { 
        const isFromLeft = Phaser.Math.Between(0, 1) === 0;
        const startX = isFromLeft ? -50 : this.game.config.width + 50;
        const targetX = isFromLeft ? this.game.config.width + 50 : -50;
        const startY = Phaser.Math.Between(this.game.config.height - 100, this.game.config.height - 50);
    
        const tumbleweed = this.add.image(startX, startY, 'tumbleweed')
            .setOrigin(0.5)
            .setScale(0.1); // 初始缩放比例
    
        let previousRotation = 0;
        let isTumbleweedDestroyed = false; // 追踪是否已经销毁
    
        // 滚动动画
        this.tweens.add({
            targets: tumbleweed,
            x: targetX,
            duration: Phaser.Math.Between(5000, 7000),
            onUpdate: (tween, target) => {
                const progress = tween.progress;
                const bounce = Math.sin(progress * Math.PI * 4) * 20;
                target.y = this.game.config.height - 50 - bounce; // 模拟弹跳
            },
            onComplete: () => {
                tumbleweed.destroy();
                isTumbleweedDestroyed = true; // 标记为销毁
            }
        });
    
        // 旋转动画，播放音效逻辑
        this.tweens.add({
            targets: tumbleweed,
            angle: 360, // 旋转一圈
            duration: 2000, // 每圈旋转时间
            repeat: -1, // 无限循环
            onUpdate: (tween, target) => {
                if (isTumbleweedDestroyed) return; // 如果目标已经销毁，直接退出回调
    
                const currentRotation = target.angle;
                if (Math.floor(currentRotation / 360) > Math.floor(previousRotation / 360)) {
                    this.tumbleweedFX.play(); // 播放音效
                }
                previousRotation = currentRotation;
            },
        });
    
        // 缩放动画
        this.tweens.add({
            targets: tumbleweed,
            scale: { from: 0.1, to: 0.2 },
            duration: Phaser.Math.Between(5000, 7000),
        });
    }
    
    
    

    spawnBird() {
        // 随机生成鸟的初始Y位置
        this.birdFX.play();
        const birdY = Phaser.Math.Between(50, 200);
    
        // 添加第一帧作为初始显示的鸟
        const bird = this.add.sprite(-50, birdY, 'bird1').setScale(0.07);
    
        // 控制鸟的动画帧
        const birdFrames = ['bird1', 'bird2', 'bird3', 'bird4'];
        let currentFrame = 0;
    
        // 使用时间事件来切换图片
        const animationTimer = this.time.addEvent({
            delay: 225, // 每帧125ms
            callback: () => {
                currentFrame = (currentFrame + 1) % birdFrames.length; // 循环切换帧
                bird.setTexture(birdFrames[currentFrame]);
            },
            callbackScope: this,
            loop: true
        });
    
        // 设置鸟的移动，从左到右
        this.tweens.add({
            targets: bird,
            x: this.game.config.width + 50, // 移动到屏幕右侧外
            duration: 10000, // 5秒完成移动
            onComplete: () => {
                bird.destroy(); // 超出屏幕后销毁
                animationTimer.remove(false); // 停止动画切换
            }
        });
    }

    updateCountdown() {
        this.countdown--;

        if (this.countdown > 0) {
            this.countdownText.setText(this.countdown); // 更新倒计时文本
        } else {
            this.countdownText.setVisible(false); // 隐藏倒计时文本
            this.startGame(); // 开始游戏
        }
    }

    startGame() {
        // 设置为 marshal_idle2，并在 1 到 3 秒的随机时间后切换为 marshal_draw
        this.arrowChallengeActive = true; // 初始设置为激活

        // 重置计时器
        this.timer = 0;

        // 开始计时器
        this.timerEvent = this.time.addEvent({
            delay: 1, // 每 1 毫秒更新一次
            callback: () => {
                this.timer++;
            },
            callbackScope: this,
            loop: true, // 循环计时
        });

        const delayForReady = Phaser.Math.Between(100, 2000);
        this.time.delayedCall(delayForReady, () => {
            this.marshal.setTexture("marshal_idle2");
        }, [], this);

        const delayForDraw = Phaser.Math.Between(2000, 3000);

        this.time.delayedCall(delayForDraw, () => {
            this.marshal.setTexture("marshal_draw");
            this.showMarshalHand();
            this.marshalShootSequence(); // 开始 marshal 的射击逻辑
        }, [], this);

        // // 开始游戏时，可以允许用户输入
        // this.input.on('pointerdown', this.showHand, this);
        // this.input.on('pointerup', this.hideHand, this);
    }

    showMarshalHand() {
        // marshalHand 在一个随机角度上出现，并在一个随机时间后旋转到目标角度
        const initialAngle = Phaser.Math.FloatBetween(Phaser.Math.DegToRad(-50), Phaser.Math.DegToRad(60));
        this.marshalHand.setRotation(initialAngle).setVisible(true);

        // // 等待 0 到 3 秒的随机时间后开始旋转
        // const delayForRotation = Phaser.Math.Between(0, 3000);
        // this.time.delayedCall(delayForRotation, this.startRotatingHand, [], this);
    }

    // startRotatingHand() {
    //     // 随机生成目标角度在 minAngle 和 maxAngle 范围内
    //     this.targetAngle = Phaser.Math.FloatBetween(this.minAngle, this.maxAngle);
    //     this.rotationSpeed = 0.01; // 设置旋转速度
    // }

    marshalShootSequence() {
        // 如果任意一方被击中，停止射击逻辑
        if (this.player.texture.key === 'player_hit' || this.marshal.texture.key === 'marshal_hit') {
            this.shooting = false; // 停止射击
            return;
        }
    
        this.shooting = true; // 开始射击逻辑
    
        // 随机延迟后进行一次射击
        const delay = Phaser.Math.Between(1000, 1500);
        this.time.delayedCall(delay, () => {
            // 再次检查状态，避免无效射击
            if (!this.shooting || this.player.texture.key === 'player_hit' || this.marshal.texture.key === 'marshal_hit') {
                return;
            }
    
            // 随机生成一个新角度
            const randomAngle = Phaser.Math.FloatBetween(this.minAngle, this.maxAngle);

            // 平滑旋转到目标角度
            this.rotateMarshalHandTo(randomAngle, () => {
                // 在旋转完成后发射子弹
                this.marshalShoot();
                // 继续递归调用
                this.marshalShootSequence();
            });
        });
    }

    rotateMarshalHandTo(targetAngle, onComplete) {
        // 开始一个计时器，用于平滑旋转
        const rotationDuration = 300; // 旋转持续时间（毫秒）
        const startAngle = this.marshalHand.rotation;
        const rotationSpeed = Math.abs(targetAngle - startAngle) / rotationDuration;
    
        const rotateInterval = this.time.addEvent({
            delay: 16, // 每帧更新（60FPS）
            callback: () => {
                // 使用 Phaser 的角度插值方法
                this.marshalHand.rotation = Phaser.Math.Angle.RotateTo(
                    this.marshalHand.rotation,
                    targetAngle,
                    rotationSpeed * 16
                );
    
                // 检查是否到达目标角度
                if (Math.abs(this.marshalHand.rotation - targetAngle) < 0.01) {
                    // 停止计时器
                    rotateInterval.remove(false);
                    if (onComplete) onComplete(); // 调用完成回调
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    

    marshalShoot() {
        if (!this.marshalHand.visible || this.marshal.texture.key === 'marshal_hit') return;
    
        const offsetDistance = 150;
        const verticalOffset = 0;
    
        // 计算子弹的初始位置和方向
        const bulletX = this.marshalHand.x - Math.cos(this.marshalHand.rotation) * offsetDistance;
        const bulletY = this.marshalHand.y - Math.sin(this.marshalHand.rotation) * offsetDistance + verticalOffset;
    
        this.fireMusic.play();

        // 子弹方向基于 marshalHand 的角度
        const angle = this.marshalHand.rotation;
    
        
    
        // 设置 bullet 的状态
        this.bullet.setPosition(bulletX, bulletY);
        this.bullet.rotation = angle;
        this.bullet.setFlipX(true);
        this.bullet.setVisible(true);
        this.bullet.setActive(true);
        this.bullet.speed = -10; // 子弹速度
    }

    update(){        
        const pointer = this.input.activePointer;

        // 检查右键状态是否变化
        const isRightButtonDown = pointer.rightButtonDown();

        if (isRightButtonDown !== this.previousRightButtonDown) {
            if (isRightButtonDown) {
                // 右键刚刚按下
                this.reticleSwitching = true;
                this.animateReticle('forward'); // 按顺序切换 reticle
            } else {
                // 右键刚刚松开
                this.reticleSwitching = false;
                this.animateReticle('backward'); // 按反序切换 reticle
            }
        }

        // 更新 previousRightButtonDown 状态
        this.previousRightButtonDown = isRightButtonDown;

        // 检查当前状态，停止 Marshal 射击逻辑
        if (this.player.texture.key === 'player_hit' || this.marshal.texture.key === 'marshal_hit') {
            this.shooting = false;
        }

        // 检查鼠标右键是否按下
        if (pointer.rightButtonDown()) {
            // 按下右键时，逐渐减少子弹的随机偏移量，使其接近 (0, 0)
            this.currentBulletOffsetY = Phaser.Math.Interpolation.Linear([this.currentBulletOffsetY, this.targetBulletOffsetY], 0.03);
            
            // 增加 reticleFollowSpeed 和 handRotationSpeed，减少 reticleShakeIntensity
            this.reticleShakeIntensity = Phaser.Math.Interpolation.Linear([this.reticleShakeIntensity, this.targetShakeIntensity], 0.03);
            this.reticleFollowSpeed = Phaser.Math.Interpolation.Linear([this.reticleFollowSpeed, this.targetFollowSpeed], 0.005);
            this.handRotationSpeed = Phaser.Math.Interpolation.Linear([this.handRotationSpeed, this.targetRotationSpeed], 0.005);
        } else {
            // 松开右键后，逐渐恢复到初始偏移
            this.currentBulletOffsetY = Phaser.Math.Interpolation.Linear([this.currentBulletOffsetY, this.initialBulletOffsetY], 0.05);

            
            // 松开右键后，逐渐恢复到初始值
            this.reticleShakeIntensity = Phaser.Math.Interpolation.Linear([this.reticleShakeIntensity, this.initialShakeIntensity], 0.05);
            this.reticleFollowSpeed = Phaser.Math.Interpolation.Linear([this.reticleFollowSpeed, this.initialFollowSpeed], 0.05);
            this.handRotationSpeed = Phaser.Math.Interpolation.Linear([this.handRotationSpeed, this.initialRotationSpeed], 0.05);
        }
        
        // 更新 reticle 的位置为鼠标的当前位置
        if (this.reticle.visible) {
            // 添加随机偏移
            const randomOffsetX = Phaser.Math.FloatBetween(-this.reticleShakeIntensity, this.reticleShakeIntensity);
            const randomOffsetY = Phaser.Math.FloatBetween(-this.reticleShakeIntensity, this.reticleShakeIntensity);

            // 目标位置 + 随机偏移
            const targetX = pointer.worldX + randomOffsetX;
            const targetY = pointer.worldY + randomOffsetY;

            // 缓慢趋近目标位置
            this.reticle.x += (targetX - this.reticle.x) * this.reticleFollowSpeed;
            this.reticle.y += (targetY - this.reticle.y) * this.reticleFollowSpeed;
        }
        
        // 让 marshalHand 逐渐旋转到目标角度
        if (this.targetAngle !== undefined) {
            // 检查当前角度是否已接近目标角度
            if (Math.abs(this.marshalHand.rotation - this.targetAngle) > 0.01) {
                // 根据旋转速度调整当前角度
                if (this.marshalHand.rotation < this.targetAngle) {
                    this.marshalHand.rotation += this.rotationSpeed;
                } else {
                    this.marshalHand.rotation -= this.rotationSpeed;
                }
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.startArrowChallenge();
        }

        // 检查箭头输入
        if (this.correctSequence.length > 0) {
            if (Phaser.Input.Keyboard.JustUp(this.cursors.up)) this.checkInput('up');
            if (Phaser.Input.Keyboard.JustUp(this.cursors.down)) this.checkInput('down');
            if (Phaser.Input.Keyboard.JustUp(this.cursors.left)) this.checkInput('left');
            if (Phaser.Input.Keyboard.JustUp(this.cursors.right)) this.checkInput('right');
        }
        

        // // 检查空格键是否按下和松开
        // if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        //     // 按下空格键时，设置 player 为 player_idle2
        //     this.player.setTexture("player_idle2");
        //     this.player.setPosition(200, 600);
        //     this.hand.setVisible(false); // 确保 hand 仍然隐藏
        // }

        // if (Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
        //     // 松开空格键时，切换 player 为 player_draw，并显示 hand 和 reticle
        //     this.player.setTexture("player_draw");
        //     this.player.setPosition(230, 595);
        //     this.hand.setVisible(true);
        //     this.reticle.setVisible(true);
        // }

        // hand 缓慢跟随鼠标，并限制旋转角度
        if (this.hand.visible) {
            const targetAngle = Phaser.Math.Clamp(
                Phaser.Math.Angle.Between(this.hand.x, this.hand.y, pointer.x, pointer.y),
                this.minAngle,
                this.maxAngle
            );

            // 让 hand 的角度缓慢接近目标角度
            this.hand.rotation = Phaser.Math.Angle.RotateTo(this.hand.rotation, targetAngle, this.handRotationSpeed);

            if (pointer.leftButtonDown() && !this.bullet.active) {
                this.shootBullet();
            }
        }

        if (this.bullet.active) {
            this.bullet.x += Math.cos(this.bullet.rotation) * this.bullet.speed;
            this.bullet.y += Math.sin(this.bullet.rotation) * this.bullet.speed;

            if (
                this.bullet.x < 0 || this.bullet.x > this.game.config.width ||
                this.bullet.y < 0 || this.bullet.y > this.game.config.height
            ) {
                this.bullet.setVisible(false);
                this.bullet.setActive(false);
            }
        }

        // 确保 marshalHand 和 hand 的可见性在被击中后同步更新
        if (this.marshal.texture.key === 'marshal_hit' && this.marshalHand.visible) {
            this.marshalHand.setVisible(false);
        }

        if (this.player.texture.key === 'player_hit' && this.hand.visible) {
            this.hand.setVisible(false);
        }
    }

    startArrowChallenge() {
        if (!this.arrowChallengeActive) return; // 禁止启动新的挑战
        this.player.setTexture('player_idle2');
        this.correctSequence = Phaser.Utils.Array.Shuffle(['up', 'down', 'left', 'right']).slice(0, 4);
        this.playerInput = [];

        this.arrowIcons.forEach(icon => icon.destroy());
        this.arrowIcons = [];

        const baseX = this.cameras.main.width / 2;
        const baseY = this.cameras.main.height / 2 + 300;
        const spacing = 100;

        this.correctSequence.forEach((direction, index) => {
            const icon = this.add.image(baseX + (index - 1.5) * spacing, baseY, `arrow_${direction}`);
            
            // 为不同的箭头图标设置不同的大小
            switch (direction) {
                case 'up':
                    icon.setDisplaySize(50, 67); // 设置宽 60 高 80
                    break;
                case 'down':
                    icon.setDisplaySize(49, 72); // 设置宽 50 高 70
                    break;
                case 'left':
                    icon.setDisplaySize(67, 50); // 设置宽 55 高 55
                    break;
                case 'right':
                    icon.setDisplaySize(67, 50); // 设置宽 65 高 65
                    break;
            }
    
            this.arrowIcons.push(icon);
        });

        // 启动计时器
        this.resetInputTimer();
    }

    checkInput(direction) {
        // 当前输入对应的索引
        const currentIndex = this.playerInput.length;
    
        // 检查当前输入是否正确
        const isCorrect = this.correctSequence[currentIndex] === direction;
    
        if (isCorrect) {
            // 输入正确，加入队列并移除对应的图标
            this.playerInput.push(direction);
    
            const iconToRemove = this.arrowIcons.shift(); // 获取并移除第一个图标
            if (iconToRemove) iconToRemove.destroy();
    
            // 如果已输入完所有箭头，完成挑战
            if (this.playerInput.length === this.correctSequence.length) {
                this.completeArrowChallenge();
            }
        } else {
            // 输入错误时立即重置
            this.resetArrowChallenge();
        }
    }
    
    resetInputTimer() {
        // 如果已有计时器，移除它
        if (this.inputTimer) {
            this.inputTimer.remove(false);
        }
    
        // 设置新的计时器
        this.inputTimer = this.time.delayedCall(this.inputTimeout, () => {
            // 超时则重置挑战
            this.resetArrowChallenge();
        });
    }

    resetArrowChallenge() {
        this.playerInput = [];
        this.arrowIcons.forEach(icon => icon.destroy()); // 销毁现有图标
        this.arrowIcons = [];
    
        // 清除计时器
        if (this.inputTimer) {
            this.inputTimer.remove(false);
            this.inputTimer = null;
        }
    
        this.startArrowChallenge(); // 重新开始挑战
    }
    

    completeArrowChallenge() {
        if (this.inputTimer) {
            this.inputTimer.remove(false);
            this.inputTimer = null;
        }
        
        

        this.player.setTexture('player_draw');
        this.player.setPosition(230, 595);
        this.hand.setVisible(true);
        this.reticle.setVisible(true);
        console.log('Reticle state:', this.reticle.visible, this.reticle.x, this.reticle.y);

        this.arrowIcons.forEach(icon => icon.destroy());
        this.arrowIcons = [];
        this.arrowChallengeActive = false;
    }

    animateReticle(direction) {
        // 如果当前有未完成的动画，立即清除
        if (this.reticleTween) {
            this.reticleTween.remove();
        }
    
        const totalFrames = this.reticleFrames.length;
    
        
    
        // 根据方向设置动画
        const step = direction === 'forward' ? 1 : -1;
    
        // 递归函数进行动画
        const changeFrame = () => {
            // 更新当前帧索引
            this.currentReticleFrame += step;
    
            // 检查是否到达边界
            if (this.currentReticleFrame < 0) {
                this.currentReticleFrame = 0;
                this.reticleSwitching = false;
                return;
            }
    
            if (this.currentReticleFrame >= totalFrames) {
                this.currentReticleFrame = totalFrames - 1;
                this.reticleSwitching = false;
                return;
            }
    
            // 设置当前帧
            this.reticle.setTexture(this.reticleFrames[this.currentReticleFrame]);
    
            // 创建下一帧的计时器
            this.reticleTween = this.time.delayedCall(100, changeFrame, [], this);
        };
    
        changeFrame(); // 启动动画
    }
    
    

    // showHand(pointer) {
    //     // 检查是否是鼠标右键按下
    //     if (pointer.rightButtonDown()) {
    //         this.hand.setVisible(true);

    //         this.reticle.setVisible(true);

    //         this.player.setTexture("player_draw");
    //         this.player.setPosition(230, 595);
    //     }
    // }

    // hideHand(pointer) {
    //     // 检查是否是鼠标右键松开
    //     if (pointer.rightButtonReleased()) {
    //         this.hand.setVisible(false);

    //         this.reticle.setVisible(false);

    //         this.player.setTexture("player_idle");
    //         this.player.setPosition(200, 600);
    //     }
    // }
    
    shootBullet() {
        if (this.hand.visible) {
            // 子弹初始位置基于 hand 的固定偏移
            this.fireMusic.play();
            const offsetDistance = 150; 
            const verticalOffset = -60;
            const bulletX = this.hand.x + Math.cos(this.hand.rotation) * offsetDistance;
            const bulletY = this.hand.y + Math.sin(this.hand.rotation) * offsetDistance + verticalOffset;
    
            // 应用动态偏移量
            const targetX = this.reticle.x;
            const targetY = this.reticle.y - 60 + Phaser.Math.Between(0,this.currentBulletOffsetY);
    
            // 计算从初始位置 (bulletX, bulletY) 到随机化目标点的角度
            const angle = Phaser.Math.Angle.Between(bulletX, bulletY, targetX, targetY);

            // 设置 hand 的角度，使其与子弹的发射角度一致
            this.hand.rotation = angle;
    
            // 设置子弹的初始位置和旋转角度
            this.bullet.setPosition(bulletX, bulletY);
            this.bullet.rotation = angle;
            this.bullet.speed = 10; // 自定义速度
            this.bullet.setVisible(true);
            this.bullet.setActive(true);
        }
    }

    handleMarshalHit(bullet, marshal) {
        // 设置 marshal 为 hit 状态
        marshal.setTexture('marshal_hit');
        this.bullet.setActive(false).setVisible(false); // 隐藏子弹

        // 停止箭头挑战
        this.arrowChallengeActive = false;

        this.reticle.setVisible(false);

        // 停止计时器
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }
        
        // 保存时间
        this.savedTime = this.timer;

        console.log(`Time taken: ${this.savedTime} ms`);

        // 记录结束状态
        const result = 'marshal_hit';

        // 添加旋转、位移和缩小动画
        this.tweens.add({
            targets: marshal,
            angle: 360, // 旋转一圈
            x: this.cameras.main.width / 2, // 移动到屏幕中心 X
            y: this.cameras.main.height / 2, // 移动到屏幕中心 Y
            scaleX: 0, // 缩小到 0
            scaleY: 0, // 缩小到 0
            alpha: 0, // 渐隐
            duration: 1000, // 动画持续时间 1 秒
            onComplete: () => {
                marshal.setVisible(false); // 动画结束后隐藏 player
                this.scene.start("endGame", { result,time: this.savedTime || 0  });
            }
        });
    }
    
    handlePlayerHit(bullet, player) {
        // 设置 player 为 hit 状态
        player.setTexture('player_hit');
        this.bullet.setActive(false).setVisible(false); // 隐藏子弹

        // 停止箭头挑战
        this.arrowChallengeActive = false;
        this.arrowIcons.forEach(icon => icon.destroy()); // 销毁所有箭头图标
        this.arrowIcons = []; // 清空数组

        this.reticle.setVisible(false);

        // 停止计时器（如果尚未停止）
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }

        // 保存时间
        this.savedTime = this.timer;

        console.log(`Time taken: ${this.savedTime} ms`);

        const result = 'player_hit';
        
        // 添加旋转、位移和缩小动画
        this.tweens.add({
            targets: player,
            angle: 360, // 旋转一圈
            x: this.cameras.main.width / 2, // 移动到屏幕中心 X
            y: this.cameras.main.height / 2, // 移动到屏幕中心 Y
            scaleX: 0, // 缩小到 0
            scaleY: 0, // 缩小到 0
            alpha: 0, // 渐隐
            duration: 1000, // 动画持续时间 1 秒
            onComplete: () => {
                player.setVisible(false); // 动画结束后隐藏 player
                this.scene.start("endGame", { result ,time: this.savedTime || 0 });
            }
        });
    }
    
}