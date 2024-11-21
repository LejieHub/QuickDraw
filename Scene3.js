class Scene3 extends Phaser.Scene {
    constructor() {
        super("endGame"); // 场景的唯一标识符
    }

    init(data) {
        this.result = data.result; // 获取传递的结果，例如 'player_hit' 或 'marshal_hit'
    }

    create() {
        this.cameras.main.setBackgroundColor('#A9A9A9');

        this.endMusic = this.sound.add('endMusic', {
            volume: 1, // 音量：0.0 ~ 1.0
        });

        this.endMusic.play();

        // 显示结束信息
        const message = this.result === 'player_hit' 
            ? 'Too Slow! You Lost!' 
            : 'You Won! Play Again?';

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 300, message, {
            font: '32px Arial',
            fill: '#ffffff',
        }).setOrigin(0.5, 0.5);

        // 创建一个 HTML 按钮并添加到游戏画布所在的父容器
        const button = document.createElement("button");
        button.innerText = "Try Again";
        button.style.position = "absolute";
        button.style.left = `${window.innerWidth / 2 - 100}px`; // 居中按钮
        button.style.top = `${window.innerHeight / 2 + 225}px`; // 居中按钮
        button.style.width = "200px";
        button.style.height = "50px";
        button.style.backgroundColor = "#B80000";
        button.style.border = "none";
        button.style.borderRadius = "10px";
        button.style.color = "#FFFFFF";
        button.style.fontSize = "20px";
        button.style.cursor = "pointer";

        // 添加 hover 样式
        button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#8B0000"; // 鼠标悬停时的颜色
        });
        button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = "#B80000"; // 恢复原始颜色
        })

        document.body.appendChild(button);

        // 按钮点击事件
        button.addEventListener("click", () => {
            // 清除按钮
            button.remove();

            // 停止当前场景并启动Scene2
            this.scene.stop("endGame");
            this.scene.start("playGame");
        });
    }
}
