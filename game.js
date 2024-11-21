window.onload = function(){
    var config = {
        width: 1295,
        height:881,
        backgroundColor: 0x000000,
        scene: [Scene1, Scene2,Scene3],
        physics: {
            default: 'arcade', // 使用 Arcade 物理引擎
            arcade: {
                debug: false
            }
        }
    }

    var game = new Phaser.Game(config);
}

