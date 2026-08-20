// Unified Input Manager: Keyboard, Mobile Touch, and Gamepad API
export class InputManager {
  constructor() {
    this.keys = {};
    this.prevKeys = {};
    this.actions = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      shoot: false,
      dash: false,
      switchWeapon: false,
      pause: false
    };
    this.prevActions = { ...this.actions };

    this.touchControls = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      shoot: false,
      dash: false,
      switchWeapon: false
    };

    this.initKeyboard();
    this.initTouch();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.code) this.keys[e.code] = true;
      if (e.key) this.keys[e.key] = true;
      if (e.keyCode) this.keys[e.keyCode] = true;
      
      // Prevent default scrolling for Space, arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) || e.keyCode === 32) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code) this.keys[e.code] = false;
      if (e.key) this.keys[e.key] = false;
      if (e.keyCode) this.keys[e.keyCode] = false;
    });

    // Reset when window loses focus
    window.addEventListener('blur', () => {
      this.keys = {};
      this.touchControls = {
        left: false, right: false, up: false, down: false,
        jump: false, shoot: false, dash: false, switchWeapon: false
      };
    });
  }

  initTouch() {
    const bindTouchBtn = (elementId, actionName) => {
      const el = document.getElementById(elementId);
      if (!el) return;

      const handleStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.touchControls[actionName] = true;
        el.classList.add('active');
      };

      const handleEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.touchControls[actionName] = false;
        el.classList.remove('active');
      };

      el.addEventListener('touchstart', handleStart, { passive: false });
      el.addEventListener('touchend', handleEnd, { passive: false });
      el.addEventListener('touchcancel', handleEnd, { passive: false });
      el.addEventListener('mousedown', handleStart);
      el.addEventListener('mouseup', handleEnd);
      el.addEventListener('mouseleave', handleEnd);
    };

    bindTouchBtn('touch-left', 'left');
    bindTouchBtn('touch-right', 'right');
    bindTouchBtn('touch-down', 'down');
    bindTouchBtn('touch-up', 'up');
    bindTouchBtn('touch-jump', 'jump');
    bindTouchBtn('touch-shoot', 'shoot');
    bindTouchBtn('touch-dash', 'dash');
    bindTouchBtn('touch-switch', 'switchWeapon');
    bindTouchBtn('touch-pause', 'pause');
  }

  pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return null;

    const stickX = gp.axes[0] || 0;
    const stickY = gp.axes[1] || 0;
    const threshold = 0.35;

    return {
      left: stickX < -threshold || (gp.buttons[14] && gp.buttons[14].pressed),
      right: stickX > threshold || (gp.buttons[15] && gp.buttons[15].pressed),
      up: stickY < -threshold || (gp.buttons[12] && gp.buttons[12].pressed),
      down: stickY > threshold || (gp.buttons[13] && gp.buttons[13].pressed),
      jump: (gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[12] && gp.buttons[12].pressed), // A button or DPad Up
      shoot: (gp.buttons[2] && gp.buttons[2].pressed) || (gp.buttons[7] && gp.buttons[7].pressed), // X button or Right Trigger
      dash: (gp.buttons[1] && gp.buttons[1].pressed) || (gp.buttons[5] && gp.buttons[5].pressed), // B button or Right Bumper
      switchWeapon: (gp.buttons[3] && gp.buttons[3].pressed) || (gp.buttons[4] && gp.buttons[4].pressed), // Y button or Left Bumper
      pause: (gp.buttons[9] && gp.buttons[9].pressed) // Start button
    };
  }

  update() {
    // Copy current to previous
    this.prevActions = { ...this.actions };

    const gp = this.pollGamepad();

    // Map Keyboard keys
    const k = this.keys;
    const keyLeft = k['KeyA'] || k['a'] || k['A'] || k['ArrowLeft'] || k[37];
    const keyRight = k['KeyD'] || k['d'] || k['D'] || k['ArrowRight'] || k[39];
    const keyUp = k['KeyW'] || k['w'] || k['W'] || k['ArrowUp'] || k[38];
    const keyDown = k['KeyS'] || k['s'] || k['S'] || k['ArrowDown'] || k[40];
    const keyJump = k['Space'] || k[' '] || k[32] || k['KeyW'] || k['w'] || k['W'] || k['ArrowUp'] || k[38] || k['KeyK'] || k['k'] || k['K'] || k[75];
    const keyShoot = k['KeyJ'] || k['j'] || k['J'] || k['KeyX'] || k['x'] || k['X'] || k[74] || k[88];
    const keyDash = k['KeyL'] || k['l'] || k['L'] || k['KeyC'] || k['c'] || k['C'] || k['ShiftLeft'] || k['ShiftRight'] || k['Shift'] || k[16];
    const keySwitch = k['KeyQ'] || k['q'] || k['Q'] || k['KeyE'] || k['e'] || k['E'] || k['Digit1'] || k['Digit2'] || k['Digit3'] || k['1'] || k['2'] || k['3'];
    const keyPause = k['Escape'] || k['KeyP'] || k['p'] || k['P'] || k[27] || k[80];

    this.actions.left = Boolean(keyLeft || this.touchControls.left || (gp && gp.left));
    this.actions.right = Boolean(keyRight || this.touchControls.right || (gp && gp.right));
    this.actions.up = Boolean(keyUp || this.touchControls.up || (gp && gp.up));
    this.actions.down = Boolean(keyDown || this.touchControls.down || (gp && gp.down));
    this.actions.jump = Boolean(keyJump || this.touchControls.jump || (gp && gp.jump));
    this.actions.shoot = Boolean(keyShoot || this.touchControls.shoot || (gp && gp.shoot));
    this.actions.dash = Boolean(keyDash || this.touchControls.dash || (gp && gp.dash));
    this.actions.switchWeapon = Boolean(keySwitch || this.touchControls.switchWeapon || (gp && gp.switchWeapon));
    this.actions.pause = Boolean(keyPause || (gp && gp.pause));
  }

  isDown(action) {
    return Boolean(this.actions[action]);
  }

  justPressed(action) {
    return Boolean(this.actions[action] && !this.prevActions[action]);
  }

  justReleased(action) {
    return Boolean(!this.actions[action] && this.prevActions[action]);
  }
}

export const input = new InputManager();
