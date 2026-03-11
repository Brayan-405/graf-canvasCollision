const canvas = document.getElementById("canvas"); 
let ctx = canvas.getContext("2d"); 
 
// Obtiene las dimensiones de la pantalla actual 
const window_height = window.innerHeight; 
const window_width = window.innerWidth; 
 
canvas.height = window_height; 
canvas.width = window_width; 
 
canvas.style.background = "#ff8"; 
 
class Circle { 
    constructor(x, y, radius, color, text, speed) { 
        this.posX = x; 
        this.posY = y; 
        this.radius = radius; 
        this.color = color;
        this.originalColor = color;           
        this.text = text; 
        this.speed = speed; 

        // ← NUEVO ATRIBUTO (POO) para controlar el flash de 500ms
        this.collisionEndTime = 0;

        // Dirección inicial aleatoria
        this.dx = (Math.random() * 2 - 1) * this.speed; 
        this.dy = (Math.random() * 2 - 1) * this.speed; 
    } 
 
    draw(context) { 
        context.beginPath(); 

        context.strokeStyle = this.color; 
        context.textAlign = "center"; 
        context.textBaseline = "middle"; 
        context.font = "20px Arial"; 
        context.fillText(this.text, this.posX, this.posY); 

        context.lineWidth = 2; 
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false); 
        context.stroke(); 
        context.closePath(); 
    } 

    updatePosition() {
        this.posX += this.dx;
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) { 
            this.dx = -this.dx; 
        }
       
        this.posY += this.dy;
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) { 
            this.dy = -this.dy; 
        }
    }

    collidesWith(other) {
        const dx = this.posX - other.posX;
        const dy = this.posY - other.posY;
        const distance = Math.hypot(dx, dy);
        return distance <= (this.radius + other.radius);
    }

    // === MÉTODO DE REBOTE REALISTA (paso 10) ===
    bounceOff(other) {
        let dx = other.posX - this.posX;
        let dy = other.posY - this.posY;
        let dist = Math.hypot(dx, dy);

        if (dist === 0) return;

        const nx = dx / dist;
        const ny = dy / dist;

        const v1 = this.dx * nx + this.dy * ny;
        const v2 = other.dx * nx + other.dy * ny;

        this.dx  = this.dx  - v1 * nx + v2 * nx;
        this.dy  = this.dy  - v1 * ny + v2 * ny;
        other.dx = other.dx - v2 * nx + v1 * nx;
        other.dy = other.dy - v2 * ny + v1 * ny;

        const overlap = (this.radius + other.radius - dist) / 2;
        this.posX  -= nx * overlap;
        this.posY  -= ny * overlap;
        other.posX += nx * overlap;
        other.posY += ny * overlap;
    }

    // === MÉTODO PARA EL FLASH DE 500MS ===
    getCurrentColor() {
        return Date.now() < this.collisionEndTime ? "#0000FF" : this.originalColor;
    }
} 
 
let circles = []; 
 
function generateCircles(n) {
    circles = [];
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 28 + 22; 
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${(Math.floor(Math.random()*16777215).toString(16))}`; 
        
        // VELOCIDADES MÁS RÁPIDAS (modificado aquí)
        let speed = Math.random() * 4 + 2;   // ← Ahora entre 2 y 6 unidades (más rápido que antes)

        let text = `C${i + 1}`; 

        circles.push(new Circle(x, y, radius, color, text, speed));
    }
} 
 
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); 

    // 1. Mover todos los círculos
    circles.forEach(circle => {
        circle.updatePosition();
    });

    // 2. Detectar colisiones → flash 500ms + rebote
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].collidesWith(circles[j])) {
                const endTime = Date.now() + 300;
                circles[i].collisionEndTime = Math.max(circles[i].collisionEndTime, endTime);
                circles[j].collisionEndTime = Math.max(circles[j].collisionEndTime, endTime);

                circles[i].bounceOff(circles[j]);
            }
        }
    }

    // 3. Dibujar con el color correcto (flash azul 500ms o original)
    circles.forEach(circle => {
        circle.color = circle.getCurrentColor();
        circle.draw(ctx);
    });

    requestAnimationFrame(animate); 
} 
 
// ¡20 círculos con velocidades más rápidas!
generateCircles(20); 
animate();