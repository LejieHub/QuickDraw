class Scene3 extends Phaser.Scene {
    constructor() {
        super("endGame"); // 场景的唯一标识符
    }

    init(data) {
        this.result = data.result; // 获取传递的结果，例如 'player_hit' 或 'marshal_hit'
        this.timeTaken = data.time || 0; // 获取时间，默认为 0
    }

    create() {
        this.cameras.main.setBackgroundColor('#A9A9A9');

        this.endMusic = this.sound.add('endMusic', {
            volume: 1, // 音量：0.0 ~ 1.0
        });

        this.endMusic.play();

        // 时间转换为秒
        const timeInSeconds = (this.timeTaken / 1000).toFixed(2);

        // 主消息部分
        const mainText = this.result === 'player_hit'
            ? 'You lost! Too slow on the draw!'
            : 'Yeehaw! A true quick-draw in:';

        // 添加主消息
        if (this.result !== 'player_hit'){
            const mainMessage = this.add.text(
                this.cameras.main.width / 2 - 40, 
                this.cameras.main.height / 2 - 300, 
                mainText, 
                {
                    font: '32px Arial',
                    fill: '#000000', // 白色
                }
            ).setOrigin(0.5, 0.5);

            this.add.text(
                mainMessage.x + mainMessage.width / 2 + 10, // 紧跟在主消息后
                mainMessage.y, 
                `${timeInSeconds} s`, 
                {
                    font: '32px Arial',
                    fill: '#00ff00', // 绿色
                }
            ).setOrigin(0, 0.5); // 左对齐
        }
        else{
            const mainMessage = this.add.text(
                this.cameras.main.width / 2, 
                this.cameras.main.height / 2 - 300, 
                mainText, 
                {
                    font: '32px Arial',
                    fill: '#000000', // 白色
                }
            ).setOrigin(0.5, 0.5);
        }
        
        // 根据结果显示 win 或 lose 图像，并单独设定大小
        if (this.result === 'player_hit') {
            // 显示 lose 图像并设置大小
            this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'lose')
                .setOrigin(0.5, 0.5)
                .setDisplaySize(350, 400); // 单独设置 lose 图像的大小
        } else {
            // 显示 win 图像并设置大小
            this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'win')
                .setOrigin(0.5, 0.5)
                .setDisplaySize(288, 400); // 单独设置 win 图像的大小
        }



        // 使用图片按钮替换 HTML 按钮
        const tryButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 225, "try")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(186, 50)
            .setInteractive(); // 使按钮可交互

        // 鼠标悬停效果
        tryButton.on("pointerover", () => {
            tryButton.setTexture("tryH"); // 悬停时切换到悬停图片
            this.game.canvas.style.cursor = "pointer";
        });

        tryButton.on("pointerout", () => {
            tryButton.setTexture("try"); // 恢复默认图片
            this.game.canvas.style.cursor = "default";
        });

        // 按钮点击事件
        tryButton.on("pointerdown", () => {
            // 停止当前场景并启动 Scene2
            this.scene.stop("endGame");
            this.scene.start("playGame");
        });

        // // 创建一个 HTML 按钮并添加到游戏画布所在的父容器
        // const button = document.createElement("button");
        // button.innerText = "Try Again";
        // button.style.position = "absolute";
        // button.style.left = `${window.innerWidth / 2 - 100}px`; // 居中按钮
        // button.style.top = `${window.innerHeight / 2 + 225}px`; // 居中按钮
        // button.style.width = "200px";
        // button.style.height = "50px";
        // button.style.backgroundColor = "#B80000";
        // button.style.border = "none";
        // button.style.borderRadius = "10px";
        // button.style.color = "#FFFFFF";
        // button.style.fontSize = "20px";
        // button.style.cursor = "pointer";

        // // 添加 hover 样式
        // button.addEventListener("mouseenter", () => {
        //     button.style.backgroundColor = "#8B0000"; // 鼠标悬停时的颜色
        // });
        // button.addEventListener("mouseleave", () => {
        //     button.style.backgroundColor = "#B80000"; // 恢复原始颜色
        // })

        // document.body.appendChild(button);

        // // 按钮点击事件
        // button.addEventListener("click", () => {
        //     // 清除按钮
        //     button.remove();

        //     // 停止当前场景并启动Scene2
        //     this.scene.stop("endGame");
        //     this.scene.start("playGame");
        // });
    }
}
