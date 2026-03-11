const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.background = "#0b101a"; // Un fondo más oscuro para que resalten las estrellas

let score = 0;
let speedLevel = 1;
let effects = []; // Aquí guardaremos las explosiones activas

// --- CLASE PARA LAS PARTÍCULAS DE LA EXPLOSIÓN ---
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 10; // Dirección aleatoria X
        this.speedY = (Math.random() - 0.5) * 10; // Dirección aleatoria Y
        this.color = color;
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02; // Se desvanece
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- CLASE PRINCIPAL MODIFICADA ---
class FallingObject {
    constructor() {
        this.init();
    }

    init() {
        this.size = Math.random() * 20 + 20; // Radio de la estrella
        this.posX = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.posY = -this.size * 2;
        this.baseSpeed = Math.random() * 2 + 1;
        this.speed = this.baseSpeed * speedLevel;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.rotation = 0;
        this.rotationSpeed = Math.random() * 0.05;
    }

    // Función para dibujar una estrella
    drawStar(x, y, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(x, y - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(x, y - outerRadius);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Un pequeño brillo (glow)
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
    }

    draw() {
        ctx.save();
        this.drawStar(this.posX, this.posY, 5, this.size, this.size / 2);
        ctx.restore();
        ctx.shadowBlur = 0; // Resetear sombra para lo demás
    }

    update() {
        this.posY += this.speed;
        if (this.posY > canvas.height + this.size) {
            this.init();
        }
        this.draw();
    }

    isClicked(mouseX, mouseY) {
        // Detección de colisión circular (más precisa para estrellas)
        const dist = Math.hypot(mouseX - this.posX, mouseY - this.posY);
        return dist < this.size;
    }

    createExplosion() {
        for (let i = 0; i < 12; i++) {
            effects.push(new Particle(this.posX, this.posY, this.color));
        }
    }
}

let objects = [];
function generateObjects(n) {
    for (let i = 0; i < n; i++) {
        objects.push(new FallingObject());
    }
}

function updateSpeedLevel() {
    speedLevel = score > 15 ? 3 : (score > 10 ? 2 : 1);
    objects.forEach(obj => obj.speed = obj.baseSpeed * speedLevel);
}

canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

    objects.forEach(obj => {
        if (obj.isClicked(mouseX, mouseY)) {
            score++;
            obj.createExplosion(); // Lanzar animación
            obj.init(); // Resetear posición
            updateSpeedLevel();
        }
    });
});

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Estrellas: " + score, canvas.width - 20, 40);
}

function animate() {
    // Fondo con estela suave opcional (cambiar a fillRect con alpha si quieres rastro)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar estrellas
    objects.forEach(obj => obj.update());

    // Actualizar y limpiar partículas de explosión
    for (let i = effects.length - 1; i >= 0; i--) {
        effects[i].update();
        effects[i].draw();
        if (effects[i].opacity <= 0) {
            effects.splice(i, 1);
        }
    }

    drawScore();
    requestAnimationFrame(animate);
}

generateObjects(15);
animate();