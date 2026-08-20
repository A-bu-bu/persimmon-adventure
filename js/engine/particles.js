// High-Performance Particle Engine & Ghost Trail Effects

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.ghostTrails = [];
  }

  createDust(x, y, count = 4, color = 'rgba(255, 230, 180, 0.7)') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 12 - 6),
        y: y + (Math.random() * 4 - 2),
        vx: (Math.random() * 60 - 30),
        vy: -(Math.random() * 30 + 10),
        size: Math.random() * 4 + 3,
        color: color,
        alpha: 0.8,
        life: 0.25,
        maxLife: 0.25,
        type: 'circle'
      });
    }
  }

  createLeaves(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: (Math.random() * 80 - 40),
        vy: -(Math.random() * 60 + 20),
        size: Math.random() * 5 + 4,
        color: Math.random() > 0.5 ? '#70b030' : '#4e9b20',
        alpha: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 10 - 5),
        life: 0.5,
        maxLife: 0.5,
        type: 'leaf'
      });
    }
  }

  createHitSparks(x, y, count = 8, color = '#ffea50') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 160 + 60;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: color,
        alpha: 1.0,
        life: 0.22,
        maxLife: 0.22,
        type: 'spark'
      });
    }
  }

  createExplosion(x, y, count = 20, color = '#ff7700') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 220 + 50;
      const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ffffff', '#74c043'];
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        gravity: 180,
        life: 0.45,
        maxLife: 0.45,
        type: 'circle'
      });
    }
  }

  createCoinSparkle(x, y) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const speed = 70;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3,
        color: '#fff066',
        alpha: 1.0,
        life: 0.3,
        maxLife: 0.3,
        type: 'star'
      });
    }
  }

  createGhostTrail(image, x, y, width, height, facing, alpha = 0.5) {
    this.ghostTrails.push({
      image,
      x,
      y,
      width,
      height,
      facing,
      alpha,
      life: 0.2,
      maxLife: 0.2
    });
  }

  createShockwave(x, y, radius = 40, color = 'rgba(255, 180, 50, 0.8)') {
    this.particles.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: radius,
      color: color,
      alpha: 1.0,
      life: 0.25,
      maxLife: 0.25,
      type: 'shockwave'
    });
  }

  update(dt) {
    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.alpha = p.life / p.maxLife;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      if (p.rotation !== undefined && p.rotSpeed) {
        p.rotation += p.rotSpeed * dt;
      }
    }

    // Update Ghost Trails
    for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
      const g = this.ghostTrails[i];
      g.life -= dt;
      if (g.life <= 0) {
        this.ghostTrails.splice(i, 1);
        continue;
      }
      g.alpha = (g.life / g.maxLife) * 0.5;
    }
  }

  draw(ctx) {
    // Draw Ghost Trails
    for (const g of this.ghostTrails) {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.translate(g.x + g.width / 2, g.y + g.height / 2);
      ctx.scale(g.facing, 1);
      if (g.image) {
        ctx.drawImage(g.image, -g.width / 2, -g.height / 2, g.width, g.height);
      }
      ctx.restore();
    }

    // Draw Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'circle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'leaf') {
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size, p.y - 1, p.size * 2, 2);
        ctx.fillRect(p.x - 1, p.y - p.size, 2, p.size * 2);
      } else if (p.type === 'shockwave') {
        const currentR = (1 - p.life / p.maxLife) * p.maxRadius;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.ghostTrails = [];
  }
}

export const particles = new ParticleSystem();
