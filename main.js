import './style.css'
import Phaser, { Physics } from 'phaser'

// parameter lebar dan panjang kanvas game
const sizes = {
  width: 500,
  height: 496
}

const speedDown = 300 //variabel kecepatan turun
const gameStartDiv = document.querySelector("#gameStartDiv")
const gameStartBtn = document.querySelector("#gameStartBtn")
const gameEndDiv = document.querySelector("#gameEndDiv")
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan")


class GameScene extends Phaser.Scene{
  constructor(){
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speedDown + 50
    this.target
    this.points = 0
    this.textScore
    this.textTime
    this.timedEvent
    this.remainingTime
    this.coinMusic
    this.bgMusic
    this.emmiter
  }

  //meload asset
  preload(){
    this.load.image('bg', 'assets/bg.png') //meload gambar background
    this.load.image("basket", 'assets/basket.png') //meload gambar keranjang
    this.load.image("apple", 'assets/apple.png') //meload gambar apel
    this.load.image("money", 'assets/money.png') //meload gambar uang
    this.load.audio("bgMusic","assets/bgMusic.mp3") //meload musik
    this.load.audio("coin","assets/coin.mp3") //meload musik
  }

  // menerima asset yang sdh di load
  create(){

    this.scene.pause("scene-game")

    //menambahkan musik yang diperlukan
    this.coinMusic = this.sound.add("coin")
    this.bgMusic = this.sound.add("bgMusic")

    // this.bgMusic.play() //menjalankan music

    this.add.image(0, 0, 'bg').setOrigin(0,0) //menambahkan background dgn posisi set origin 0,0

    //menambahkan keranjang dalam permainan
    this.player = this.physics.add
      .image(100, sizes.height - 100, "basket")
      .setOrigin(0, 0);
    this.player.setImmovable(true)
    this.player.body.allowGravity = false //mencegah agar keranjang tidak terdampak gravitasi
    this.player.setCollideWorldBounds(true)
    this.player.setSize(80,15).setOffset(10,70) //mengatur hitbox pada keranjang agar lebih kecil

    // this.player.setSize(this.player.width-this.player.width/4, this.player.height/6).
    // setOffset(this.player.width/10, this.player.height - this.player.height/10)

    //menambahkan appel ke dalam permainan
    this.target = this.physics.add
      .image(0, 0, "apple")
      .setOrigin(0, 0);
      this.target.setMaxVelocity(0, speedDown) //mengatur kecepatan gerakan

      this.physics.add.overlap(this.target, this.player,this.targetHit, null, this)

    this.cursor = this.input.keyboard.createCursorKeys() //menerima inputan user

    //membuat gui berupa text yang menampilkan skor
    this.textScore = this.add.text(sizes.width - 120, 10, "Score:0", {
      font: "25px Arial",
      fill: "#000000",
    })

    //membuat gui berupa text yang menampilkan sisa waktu
    this.textTime = this.add.text(10, 10, "Remaining Time : 00", {
      font: "25px Arial",
      fill: "#000000",
    })

    this.timedEvent = this.time.delayedCall(30000,this.gameOver,[], this)

    //membuat partikel dalam game
    this.emmiter = this.add.particles(0,0,"money",{
      speed: 100,
      gravityY: speedDown-200,
      scale: 0.04,
      duration: 100,
      emitting: false
    })
    //membuat partikel muncul ditengah keranjang saat bersentuhan dgn apel
    this.emmiter.startFollow(this.player, this.player.width/2, this.player.height / 2, true)
  }

  // method yang akan merun terus menerus
  update(){
    this.remainingTime = this.timedEvent.getRemainingSeconds() //mendapatkan sisa detik yg tersisa hingga timer habis agar memicu gameover
    this.textTime.setText("Remaining Time : " + Math.round(this.remainingTime).toString()) //mengupdate ui waktu

    if(this.target.y >= sizes.height) {
      this.target.setY(0)
      this.target.setX(this.getRandomX())//agar appel berjatuhan dengan koordinat x yg random
    }

    const {left, right} = this.cursor // mengecek scr terus menerus apakah user menginputkan
    
    //menegcek apakah user menekan tombol kanan/kiri
    if(left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }
  }

  //membuat fungsi random untuk jatuhnya appel
  getRandomX(){
    return Math.floor(Math.random() * 480)
  }

  //mendeteksi tabrakan apel ke keranjang
  targetHit(){
    this.coinMusic.play()//memainkan sound saat bersentuhan
    this.emmiter.start() //mengeluarkan particle saat apel bersentuhan
    this.target.setY(0)
    this.target.setX(this.getRandomX())
    this.points++
    this.textScore.setText("Score: " + this.points)
  }

  gameOver(){
    this.sys.game.destroy(true)
    if(this.points >= 10) {
      gameEndScoreSpan.textContent = this.points
      gameWinLoseSpan.textContent = "Win!"
    } else {
      gameEndScoreSpan.textContent = this.points
      gameWinLoseSpan.textContent = "Lose!"
    }

    gameEndDiv.style.display="Flex" //memanggil html menu game over
  }
}

const config = {
  type: Phaser.WEBGL,
  width:sizes.width, //pass parameter lebar
  height:sizes.height, //pass parameter panjang
  canvas:gameCanvas, //membuat kanvas muncul di html menggunakan id pada html canvas
  // menambahkan physic kedalam game
  physics:{
    default: 'arcade',
    // child dari physics berupa gravity
    arcade:{
      gravity: { y: speedDown }, //menyimpan value dari gravity dalam sumbu y 
      debug:true

    }
  },
  scene : [GameScene]
}

const game = new Phaser.Game(config)

//membuat agar tombol ketika ditekan maka akan masuk ke permainan
gameStartBtn.addEventListener("click", ()=>(
  gameStartDiv.style.display="none",
  game.scene.resume("scene-game")
))
