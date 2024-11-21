class Scene1 extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }

    preload() {
        this.load.image("background", "assets/desert-pixel.png");
        this.load.image("player_draw", "assets/cowboy_draw.png");
        this.load.image("player_idle","assets/cowboy_idle.png");
        this.load.image("player_idle2","assets/cowboy_idle 2.png");
        this.load.image("player_hit","assets/cowboy_hit.png");
        this.load.image("hand", "assets/cowboy_hand.png");
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("marshal_idle", "assets/marshal_idle 1.png");
        this.load.image("marshal_idle2", "assets/marshal_idle 2.png");
        this.load.image("marshal_hit","assets/marshal_hit.png");
        this.load.image("marshal_draw", "assets/marshal_draw.png");
        this.load.image("marshal_hand", "assets/marshal_hand.png");
        this.load.image("reticle1", "assets/reticle 1.png");
        this.load.image("reticle2", "assets/reticle 2.png");
        this.load.image("reticle3", "assets/reticle 3.png");
        this.load.image("reticle4", "assets/reticle 4.png");
        this.load.image("arrow_up", "assets/up.png");
        this.load.image("arrow_down", "assets/down.png");
        this.load.image("arrow_left", "assets/left.png");
        this.load.image("arrow_right", "assets/right.png");
        this.load.image("bird1", "assets/bird1.png");
        this.load.image("bird2", "assets/bird2.png");
        this.load.image("bird3", "assets/bird3.png");
        this.load.image("bird4", "assets/bird4.png");
        this.load.image("tumbleweed", "assets/tumbleweed.png");
        this.load.image("title", "assets/title.png");
        this.load.audio('countdownMusic', 'assets/drawFX.WAV');
        this.load.audio('fireMusic', 'assets/fireFX.WAV');
        this.load.audio('endMusic', 'assets/endFX.WAV');
    }

    create() {
        // 设置背景
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background")
            .setOrigin(0.5, 0.5)
            .setScale(1);

        // this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 150, "Quick Draw", {
        //     font: "80px Arial",
        //     fill: "black"
        // }).setOrigin(0.5, 0.5);

        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 - 200, "title")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(600, 420);
        
        // 创建 HTML 按钮
        let button = document.createElement("button");
        button.innerText = "Let's Draw!";
        button.style.position = "absolute";
        button.style.top = "55%";
        button.style.left = "50%";
        button.style.transform = "translate(-50%, -5%)";
        button.style.padding = "40px 65px";
        button.style.fontSize = "18px";
        button.style.cursor = "pointer";
        button.style.backgroundColor = "#B80000";
        button.style.color = "#ffffff";
        button.style.border = "none";
        button.style.borderRadius = "5px";

        // 添加 hover 样式
        button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#8B0000"; // 鼠标悬停时的颜色
        });
        button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = "#B80000"; // 恢复原始颜色
        });

        // 将按钮添加到 HTML 文档中
        document.body.appendChild(button);

        // 按钮点击事件
        button.addEventListener("click", () => {
            // 切换到游戏场景
            this.scene.start("playGame");

            // 删除按钮
            button.remove();
        });
    }
}
