/* jogos/jogo-kit-3d.js — Motor e helpers compartilhados para jogos 3D (Three.js r128).
   Padrões de software aplicados:
   - Flyweight / Cache de Materiais e Geometrias (reduz alocação na GPU e memória)
   - Dynamic CanvasTexture para placas legíveis de alta resolução em 3D
   - Iluminação hemisférica + direcional suave com sombras PCF
   - Animação de água, cauda/cabeça de animais e partículas de fumaça
   - Interatividade tátil: toque/clique com raycaster, pulo elástico e TTS didático
   - Fiel às diretrizes de acessibilidade TEA (respostas literais, som suave, sem sobrecarga)
*/
(function (global) {
  'use strict';

  const Kit3D = {};

  /* ===== DETECÇÃO MOBILE E AJUSTES DINÂMICOS ===== */
  const isMobile = window.matchMedia('(max-width: 800px), (pointer: coarse)').matches;
  const shadowMapSize = isMobile ? 1024 : 2048;

  /* ===== CACHES FLYWEIGHT (Reuso de Materiais e Geometrias) ===== */
  const materialCache = new Map();
  const geometryCache = new Map();
  const canvasCache = new Map();
  const texturaCache = new Map();

  /* ===== MODO "COR VIVA" (opt-in por cfg.visual) =====
     Sem cfg.visual, o motor se comporta EXATAMENTE como antes. Com cfg.visual.cor = true, o
     tópico passa a renderizar em fluxo de cor correto (hex sRGB -> linear -> ACES -> sRGB na
     saída), com céu em vertex colors, névoa casada com o céu, nuvens em sprite, texturas
     procedurais, sombra de contato e luz configurável. Só o tópico que declara cfg.visual muda. */
  let usarSRGB = false;
  let reduzirMovimento = false;

  /* Converte um hex (autorado em sRGB) para o espaço linear quando o modo "cor viva" está
     ligado. Sem isso, cores hex ficariam claras/lavadas ao ativar a saída sRGB. */
  Kit3D.cor = function (hex) {
    const c = new THREE.Color(hex);
    if (usarSRGB) c.convertSRGBToLinear();
    return c;
  };

  Kit3D.criarRampaToon = function () {
    if (Kit3D._rampaToon) return Kit3D._rampaToon;
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 1;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#616161'; ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = '#9e9e9e'; ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = '#e0e0e0'; ctx.fillRect(2, 0, 1, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(3, 0, 1, 1);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    Kit3D._rampaToon = tex;
    return tex;
  };

  Kit3D.mat = function (tipo, cor, opts) {
    opts = opts || {};
    // opts.chave permite cachear materiais que carregam textura (map) sem serializar o mapa
    const chaveCache = (typeof opts.chave === 'string')
      ? tipo + '_' + cor + '_' + opts.chave
      : `${tipo}_${cor}_${JSON.stringify(opts)}`;
    if (materialCache.has(chaveCache)) return materialCache.get(chaveCache);
    let mat;
    const cfg = Object.assign({ color: cor }, opts);
    delete cfg.chave;
    if (usarSRGB) {
      if (typeof cfg.color === 'number') cfg.color = Kit3D.cor(cfg.color);
      if (typeof cfg.emissive === 'number') cfg.emissive = Kit3D.cor(cfg.emissive);
    }
    if (tipo === 'toon') {
      mat = new THREE.MeshToonMaterial(Object.assign({
        gradientMap: Kit3D.criarRampaToon()
      }, cfg));
    } else if (tipo === 'pbr' || tipo === 'standard') {
      mat = new THREE.MeshStandardMaterial(Object.assign({
        flatShading: true,
        roughness: 0.78,
        metalness: 0.12
      }, cfg));
    } else if (tipo === 'phong') {
      mat = new THREE.MeshPhongMaterial(cfg);
    } else if (tipo === 'basic') {
      mat = new THREE.MeshBasicMaterial(cfg);
    } else {
      mat = new THREE.MeshLambertMaterial(cfg);
    }
    materialCache.set(chaveCache, mat);
    return mat;
  };

  Kit3D.geo = function (key, factory) {
    if (geometryCache.has(key)) return geometryCache.get(key);
    const g = factory();
    geometryCache.set(key, g);
    return g;
  };

  /* ===== SÍNTESE DE ÁUDIO WEB (Harmonias calmas, sem sobrecarga sensorial) ===== */
  Kit3D.Audio = {
    ctx: null,
    audioContextStarted: false,
    init() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },
    initOnFirstInteraction() {
      if (!this.audioContextStarted && this.ctx) {
        this.ctx.resume();
        this.audioContextStarted = true;
      }
    },
    acerto() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        gain.gain.setValueAtTime(0.001, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.15, t + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.5);
      });
    },
    retry() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.25);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    },
    toqueObjeto() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, t); // Mi (E5)
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.14, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    },
    fanfarra() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.12);
        gain.gain.setValueAtTime(0.001, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, t + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.75);
      });
    },
    sino() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [1046.5, 1318.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        gain.gain.setValueAtTime(0.001, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.12, t + i * 0.1 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.1 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.5);
      });
    },
    splash() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.22);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    },
    pop() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.08);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    },
    buzina() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [220, 277.18].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    },
    moo() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, t);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(110, t + 0.45);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.58);
    },
    motor() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [68, 98].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 1.3, t + 0.16);
        osc.frequency.linearRampToValueAtTime(freq * 0.95, t + 0.38);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.10, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    },
    chime() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);
        gain.gain.setValueAtTime(0.001, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.09, t + idx * 0.06 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.38);
      });
    },
    clique() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.04);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    },
    celebrarAcerto() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Acorde musical harmonioso e sereno do sintetizador Web Audio (C4 - E4 - G4 - B4 - D5)
      const notas = [
        { freq: 261.63, delay: 0.00, vol: 0.11 },
        { freq: 329.63, delay: 0.08, vol: 0.10 },
        { freq: 392.00, delay: 0.16, vol: 0.10 },
        { freq: 493.88, delay: 0.24, vol: 0.09 },
        { freq: 587.33, delay: 0.32, vol: 0.08 }
      ];
      notas.forEach((n) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, t + n.delay);
        gain.gain.setValueAtTime(0.0001, t + n.delay);
        gain.gain.linearRampToValueAtTime(n.vol, t + n.delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + n.delay + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + n.delay);
        osc.stop(t + n.delay + 1.25);
      });
    }
  };

  /* ===== SÍNTESE DE VOZ (TTS) ===== */
  Kit3D.falar = function (texto, vel) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    u.rate = vel || 0.85;
    window.speechSynthesis.speak(u);
  };

  /* ===== EFEITO VISUAL DE TOQUE 3D FLUTUANTE & CELEBRAÇÃO SERENA ===== */
  const iconeTexCache = new Map();
  function obterTexturaIcone(icone) {
    if (iconeTexCache.has(icone)) return iconeTexCache.get(icone);
    const cv = document.createElement('canvas');
    cv.width = 128;
    cv.height = 128;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);

    // Halo radial brilhante e suave
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(255, 249, 196, 0.95)');
    grad.addColorStop(0.45, 'rgba(255, 213, 79, 0.65)');
    grad.addColorStop(0.8, 'rgba(167, 255, 235, 0.35)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    // Ícone central
    ctx.font = '52px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icone || '⭐', 64, 66);

    const tex = new THREE.CanvasTexture(cv);
    iconeTexCache.set(icone, tex);
    return tex;
  }

  Kit3D.criarEfeitoToque = function (pos, icone) {
    const scene = Kit3D._cenaAtiva;
    const toques = Kit3D._toquesAtivos;
    if (!scene || !toques) return;

    const tex = obterTexturaIcone(icone || '⭐');
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);

    let px = 0, py = 1, pz = 0;
    if (pos) {
      if (typeof pos.x === 'number') { px = pos.x; py = pos.y; pz = pos.z; }
      else if (Array.isArray(pos)) { px = pos[0]; py = pos[1]; pz = pos[2]; }
    }
    sprite.position.set(px, py + 0.4, pz);
    sprite.scale.set(0.6, 0.6, 0.6);
    scene.add(sprite);

    toques.push({
      sprite: sprite,
      start: performance.now(),
      dur: 1.05,
      origY: py + 0.4
    });
  };

  let chuvaCelebracao = null;
  Kit3D.celebrarAcerto = function () {
    Kit3D.Audio.celebrarAcerto();
    const scene = Kit3D._cenaAtiva;
    if (!scene) return;

    // Chuva suave de confetes e estrelinhas pastéis em tons dourados e menta
    const count = 90;
    const geo = new THREE.BufferGeometry();
    const pos = [];
    const cores = [];
    const colorList = [0xffe082, 0xffd54f, 0xa7ffeb, 0xb9f6ca, 0x81c784, 0xfff9c4, 0x80cbc4];

    for (let i = 0; i < count; i++) {
      pos.push(
        (Math.random() - 0.5) * 34,
        14 + Math.random() * 12,
        (Math.random() - 0.5) * 28
      );
      const c = new THREE.Color(colorList[Math.floor(Math.random() * colorList.length)]);
      cores.push(c.r, c.g, c.b);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));

    if (chuvaCelebracao && chuvaCelebracao.parent) {
      scene.remove(chuvaCelebracao);
      if (chuvaCelebracao.geometry) chuvaCelebracao.geometry.dispose();
    }
    chuvaCelebracao = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.55,
        vertexColors: true,
        transparent: true,
        opacity: 0.95
      })
    );
    chuvaCelebracao.userData = {
      start: performance.now(),
      dur: 3.4
    };
    scene.add(chuvaCelebracao);
  };

  /* ===== GERADOR DE TEXTURAS DE TEXTO EM CANVAS 2D ===== */
  Kit3D.criarTexturaTexto = function (texto, opts) {
    opts = opts || {};
    const w = opts.width || 512;
    const h = opts.height || 160;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const bg = opts.bg || '#2e7d32';
    const fg = opts.fg || '#ffffff';
    const border = opts.border || '#ffffff';
    const radius = opts.radius || 20;

    // Fundo com borda arredondada
    ctx.fillStyle = bg;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(8, 8, w - 16, h - 16, radius);
    } else {
      ctx.rect(8, 8, w - 16, h - 16);
    }
    ctx.fill();

    // Borda de contraste
    ctx.lineWidth = opts.borderWidth || 8;
    ctx.strokeStyle = border;
    ctx.stroke();

    // Texto em caixa alta e negrito com ajuste de escala automático
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontSize = opts.fontSize || Math.floor(h * 0.44);
    ctx.font = `bold ${fontSize}px "Baloo 2", Nunito, sans-serif`;
    const txt = (texto || '').toUpperCase();
    const maxLarguraTexto = w - 48;
    const larguraMedida = ctx.measureText(txt).width;
    if (larguraMedida > maxLarguraTexto && larguraMedida > 0) {
      fontSize = Math.floor(fontSize * (maxLarguraTexto / larguraMedida));
      ctx.font = `bold ${fontSize}px "Baloo 2", Nunito, sans-serif`;
    }
    ctx.fillText(txt, w / 2, h / 2 + 3);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = usarSRGB ? 8 : 4;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    if (usarSRGB) tex.encoding = THREE.sRGBEncoding;
    return tex;
  };

  /* ===== TEXTURAS PROCEDURAIS EM CANVAS (sem nenhum download) ===== */
  const PINCEL = {
    grama:   { base: '#63b23a', tons: ['#54a02e', '#7ac94e', '#4a8f27', '#8ed860'], forma: 'traco',  qtd: 2600 },
    terra:   { base: '#bd9367', tons: ['#a87c50', '#d3ad82', '#96704a', '#e2c69d'], forma: 'ponto',  qtd: 1500 },
    palha:   { base: '#e3cf9c', tons: ['#d2ba82', '#f2e4b6', '#c6ab72', '#efe0b0'], forma: 'tracoH', qtd: 2200 },
    areia:   { base: '#ead9ac', tons: ['#f4e7c2', '#dcc796', '#fcf3d6'],            forma: 'ponto',  qtd: 1600 },
    madeira: { base: '#a5713c', tons: ['#8a5a2b', '#c08c52', '#7a4f26'],            forma: 'tracoV', qtd: 700 },
    agua:    { base: '#808080', tons: ['#adadad', '#5e5e5e', '#c4c4c4'],            forma: 'ponto',  qtd: 2000 }
  };

  function canvasProcedural(tipo, cor) {
    const chave = tipo + '|' + (cor || '');
    if (canvasCache.has(chave)) return canvasCache.get(chave);
    const p = PINCEL[tipo] || PINCEL.grama;
    const S = 256;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    g.fillStyle = cor || p.base;
    g.fillRect(0, 0, S, S);
    for (let i = 0; i < p.qtd; i++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      g.fillStyle = p.tons[(Math.random() * p.tons.length) | 0];
      g.globalAlpha = 0.22 + Math.random() * 0.5;
      if (p.forma === 'traco') {
        g.fillRect(x, y, 1.5, 3 + Math.random() * 5);
      } else if (p.forma === 'tracoH') {
        g.fillRect(x, y, 4 + Math.random() * 7, 1.4);
      } else if (p.forma === 'tracoV') {
        g.fillRect(x, y, 1.6 + Math.random() * 2.4, 9 + Math.random() * 24);
      } else {
        g.beginPath();
        g.arc(x, y, 0.8 + Math.random() * 1.8, 0, 6.2832);
        g.fill();
      }
    }
    g.globalAlpha = 1;
    // manchas grandes e suaves: evitam o efeito "papel de parede"
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      const r = 18 + Math.random() * 46;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      const claro = Math.random() > 0.5;
      rg.addColorStop(0, claro ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.beginPath();
      g.arc(x, y, r, 0, 6.2832);
      g.fill();
    }
    canvasCache.set(chave, c);
    return c;
  }

  Kit3D.texturaProcedural = function (tipo, opts) {
    opts = opts || {};
    const tex = new THREE.CanvasTexture(canvasProcedural(tipo, opts.cor));
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repX || 1, opts.repY || 1);
    tex.anisotropy = opts.aniso || 4;
    // map/emissive em sRGB; mapas de relevo (bump/normal) continuam lineares
    if (usarSRGB && !opts.linear) tex.encoding = THREE.sRGBEncoding;
    return tex;
  };

  Kit3D.texturaNuvem = function () {
    if (texturaCache.has('nuvem')) return texturaCache.get('nuvem');
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const g = c.getContext('2d');
    for (let i = 0; i < 30; i++) {
      const x = 44 + Math.random() * 168;
      const y = 50 + Math.random() * 46;
      const r = 16 + Math.random() * 30;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, 'rgba(255,255,255,0.85)');
      rg.addColorStop(0.55, 'rgba(255,255,255,0.42)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg;
      g.beginPath();
      g.arc(x, y, r, 0, 6.2832);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    if (usarSRGB) tex.encoding = THREE.sRGBEncoding;
    texturaCache.set('nuvem', tex);
    return tex;
  };

  /* ===== TEXTURA PROCEDURAL DE CÁUSTICAS SOLARES EM ÁGUA ===== */
  Kit3D.criarTexturaCaustica = function () {
    if (Kit3D._texCaustica) return Kit3D._texCaustica;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    // Fundo transparente com células orgânicas de refração solar
    ctx.clearRect(0, 0, 256, 256);
    const numCelulas = 16;
    const pts = [];
    for (let i = 0; i < numCelulas; i++) {
      pts.push({
        x: (Math.sin(i * 1.35) * 0.42 + 0.5) * 256,
        y: (Math.cos(i * 1.72) * 0.42 + 0.5) * 256,
        r: 16 + (i % 5) * 8
      });
    }

    // Anéis e filamentos de luz cáustica interconectados com reflexo dourado suave
    ctx.strokeStyle = 'rgba(255, 248, 225, 0.45)';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = 'rgba(255, 236, 179, 0.65)';
    ctx.shadowBlur = 6;

    pts.forEach((p, idx) => {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.75, idx * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      const pNext = pts[(idx + 1) % pts.length];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      const mx = (p.x + pNext.x) / 2 + Math.sin(idx) * 20;
      const my = (p.y + pNext.y) / 2 + Math.cos(idx) * 20;
      ctx.quadraticCurveTo(mx, my, pNext.x, pNext.y);
      ctx.stroke();
    });

    // Nós de luz cintilantes
    ctx.fillStyle = 'rgba(255, 253, 231, 0.8)';
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.0, 0, Math.PI * 2);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    Kit3D._texCaustica = tex;
    return tex;
  };

  /* ===== TEXTURA PROCEDURAL DE ESPUMA SUAVE DE MARGEM (FOAM) ===== */
  Kit3D.criarTexturaEspuma = function () {
    if (Kit3D._texEspuma) return Kit3D._texEspuma;
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);

    // Gradiente suave de espuma com bordas orgânicas esfumadas
    const radGrad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
    radGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.88)');
    radGrad.addColorStop(0.35, 'rgba(240, 253, 250, 0.68)');
    radGrad.addColorStop(0.70, 'rgba(224, 247, 250, 0.32)');
    radGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 128, 128);

    // Bolhas e micro-pontilhados finos de espuma superficial
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let b = 0; b < 36; b++) {
      const bx = 16 + Math.sin(b * 1.7) * 46 + 46;
      const by = 16 + Math.cos(b * 2.3) * 46 + 46;
      const br = 1.0 + (b % 4) * 0.7;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    Kit3D._texEspuma = tex;
    texturaCache.set('espuma', tex);
    return tex;
  };

  /* ===== TEXTURA PROCEDURAL DE SOMBRAS DE NUVENS FLUTUANTES ===== */
  Kit3D.criarTexturaSombraNuvem = function () {
    if (Kit3D._texSombraNuvem) return Kit3D._texSombraNuvem;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 256, 128);

    // Múltiplos núcleos esferoidais suaves sobrepostos formando a silhueta da nuvem
    const blobs = [
      { x: 70, y: 64, rx: 42, ry: 28 },
      { x: 110, y: 55, rx: 50, ry: 34 },
      { x: 155, y: 62, rx: 46, ry: 30 },
      { x: 195, y: 68, rx: 36, ry: 24 },
      { x: 130, y: 75, rx: 54, ry: 26 }
    ];

    blobs.forEach((b) => {
      const grad = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, Math.max(b.rx, b.ry));
      // Tonalidade de sombra botânica translúcida e suave
      grad.addColorStop(0.0, 'rgba(12, 28, 16, 0.75)');
      grad.addColorStop(0.45, 'rgba(16, 32, 20, 0.45)');
      grad.addColorStop(0.75, 'rgba(20, 36, 24, 0.18)');
      grad.addColorStop(1.0, 'rgba(20, 36, 24, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(c);
    Kit3D._texSombraNuvem = tex;
    texturaCache.set('sombra_nuvem', tex);
    return tex;
  };

  /* ===== SOMBRA DE CONTATO PROCEDURAL (AMBIENT OCCLUSION SUAVE) ===== */
  Kit3D.criarTexturaSombra = function () {
    if (Kit3D._texSombra) return Kit3D._texSombra;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 126);
    // Gradiente radial com falloff suave natural e oclusão de contato realista
    grad.addColorStop(0.0, 'rgba(14, 18, 16, 0.92)');
    grad.addColorStop(0.16, 'rgba(16, 21, 18, 0.78)');
    grad.addColorStop(0.35, 'rgba(20, 26, 23, 0.48)');
    grad.addColorStop(0.55, 'rgba(26, 33, 28, 0.24)');
    grad.addColorStop(0.75, 'rgba(32, 40, 36, 0.08)');
    grad.addColorStop(0.92, 'rgba(38, 48, 42, 0.02)');
    grad.addColorStop(1.0, 'rgba(40, 50, 44, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    Kit3D._texSombra = tex;
    texturaCache.set('sombra', tex);
    return tex;
  };

  Kit3D.texturaSombra = Kit3D.criarTexturaSombra;

  /* ===== CHÃO TEXTURIZADO ===== */
  Kit3D.criarChaoTexturizado = function (w, d, opts) {
    opts = opts || {};
    const tipo = opts.textura || 'grama';
    const tex = Kit3D.texturaProcedural(tipo, {
      cor: opts.cor,
      repX: opts.repX || Math.max(1, Math.round(w / 4)),
      repY: opts.repY || Math.max(1, Math.round(d / 4))
    });
    const geo = Kit3D.geo('chao_tex_' + w + '_' + d, () => new THREE.PlaneGeometry(w, d));
    const mat = Kit3D.mat('lambert', 0xffffff, {
      chave: 'chao_' + tipo + '_' + (opts.cor || '') + '_' + tex.repeat.x + '_' + tex.repeat.y,
      map: tex
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return mesh;
  };

  /* ===== SOMBRA DE CONTATO (ancoragem pictórica de veículos, animais e construções) ===== */
  Kit3D.criarSombraContato = function (x, z, raioX, raioZ, opacidade, opts) {
    let px = 0, pz = 0, rx = 1.0, rz = 1.0, opac = 0.55;
    if (typeof x === 'number' && typeof z === 'number' && raioX !== undefined) {
      px = x;
      pz = z;
      rx = Math.max(0.05, raioX || 1.0);
      rz = Math.max(0.05, raioZ || rx);
      opac = opacidade != null ? opacidade : 0.55;
    } else if (typeof x === 'number') {
      // Assinatura compacta: criarSombraContato(raio, opacidade)
      rx = Math.max(0.05, x || 1.0);
      rz = rx;
      opac = z != null ? z : 0.55;
    }
    opts = opts || {};
    const key = `sombra_contato_${rx.toFixed(2)}_${rz.toFixed(2)}`;
    const geo = Kit3D.geo(key, () => new THREE.PlaneGeometry(rx * 2, rz * 2));
    const mat = Kit3D.mat('basic', 0xffffff, {
      chave: 'sombra_contato_procedural',
      map: Kit3D.criarTexturaSombra(),
      transparent: true,
      opacity: opac,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(px, opts.yOffset != null ? opts.yOffset : 0.02, pz);
    mesh.renderOrder = 1;
    return mesh;
  };

  Kit3D.sombraContato = function (raio, opacidade) {
    return Kit3D.criarSombraContato(raio, opacidade);
  };

  Kit3D.criarSombraDeContato = function (x, z, raioX, raioZ, opacidade, opts) {
    return Kit3D.criarSombraContato(x, z, raioX, raioZ, opacidade, opts);
  };

  /* ===== CÉU EM VERTEX COLORS (compatível com tone mapping, sem shader próprio) ===== */
  Kit3D.ceuGradiente = function (topoHex, baseHex, raio, abaixoHex) {
    const r = raio || 300;
    const geo = new THREE.SphereGeometry(r, 40, 24);
    const pos = geo.attributes.position;
    const cores = [];
    const topo = Kit3D.cor(topoHex);
    const base = Kit3D.cor(baseHex);
    const abaixo = Kit3D.cor(abaixoHex != null ? abaixoHex : 0x4a7040);
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / r;
      const c = h >= 0
        ? base.clone().lerp(topo, Math.pow(Math.min(h * 1.45, 1), 0.7))
        : base.clone().lerp(abaixo, Math.min(-h * 2.4, 1));
      cores.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });
    return new THREE.Mesh(geo, mat);
  };

  /* ===== ATMOSFERA & CÚPULA DE CÉU GRADIENTE (3 PARADAS PROCEDURAIS) ===== */
  Kit3D.criarCupulaAtmosferica = function (sceneOrOpts, maybeOpts) {
    let scene = null;
    let opts = {};
    if (sceneOrOpts && (sceneOrOpts.isScene || sceneOrOpts.isGroup || sceneOrOpts.add)) {
      scene = sceneOrOpts;
      opts = maybeOpts || {};
    } else if (sceneOrOpts && typeof sceneOrOpts === 'object') {
      opts = sceneOrOpts;
      scene = opts.scene || Kit3D._cenaAtiva || null;
    }
    opts = opts || {};

    const r = opts.raio || 380;
    const corTopoHex = opts.corTopo || '#e3f2fd';
    const corMeioHex = opts.corMeio || '#f1f8e9';
    const corHorizonteHex = opts.corHorizonte || '#fff8e1';
    const corAbaixoHex = opts.corAbaixo || '#e8f5e9';

    const corTopo = Kit3D.cor(corTopoHex);
    const corMeio = Kit3D.cor(corMeioHex);
    const corHoriz = Kit3D.cor(corHorizonteHex);
    const corAbaixo = Kit3D.cor(corAbaixoHex);

    const geo = new THREE.SphereGeometry(r, 48, 32);
    const pos = geo.attributes.position;
    const cores = [];

    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / r; // normalizado de -1.0 (nadir) a +1.0 (zenith)
      let c;
      if (h >= 0.40) {
        // Menta solar suave no meio para azul diurno acolhedor no topo (#e3f2fd)
        const t = Math.min(Math.max((h - 0.40) / 0.60, 0), 1);
        c = corMeio.clone().lerp(corTopo, Math.pow(t, 0.82));
      } else if (h >= 0.0) {
        // Dourado suave no horizonte (#fff8e1) para menta solar suave no meio (#f1f8e9)
        const t = Math.min(Math.max(h / 0.40, 0), 1);
        c = corHoriz.clone().lerp(corMeio, Math.pow(t, 0.88));
      } else {
        // Horizonte suavemente continuado para a base inferior
        const t = Math.min(Math.max(-h / 0.75, 0), 1);
        c = corHoriz.clone().lerp(corAbaixo, t);
      }
      cores.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'cupulaAtmosferica';
    mesh.renderOrder = -100;

    if (scene) {
      scene.add(mesh);
      if (opts.nevoa !== false) {
        scene.fog = new THREE.FogExp2(
          Kit3D.cor(opts.corNevoa || 0xf0fdf4),
          opts.densidadeNevoa || 0.0055
        );
      }
    }
    return mesh;
  };

  /* ===== SOMBRAS DE NUVENS FLUTUANTES SOBRE O DIORAMA ===== */
  Kit3D.criarSombrasNuvens = function (sceneOrParent, maybeAnimaveis, maybeOpts) {
    let parent = null;
    let animaveis = null;
    let opts = {};

    if (sceneOrParent && (sceneOrParent.isScene || sceneOrParent.isGroup || sceneOrParent.add)) {
      parent = sceneOrParent;
      if (Array.isArray(maybeAnimaveis)) {
        animaveis = maybeAnimaveis;
        opts = maybeOpts || {};
      } else if (maybeAnimaveis && typeof maybeAnimaveis === 'object') {
        opts = maybeAnimaveis;
      }
    } else if (sceneOrParent && typeof sceneOrParent === 'object') {
      opts = sceneOrParent;
      parent = opts.scene || Kit3D._cenaAtiva || null;
      animaveis = opts.animaveis || Kit3D._animaveisAtivos || null;
    }
    opts = opts || {};
    if (!parent) parent = Kit3D._cenaAtiva || null;
    if (!animaveis) animaveis = Kit3D._animaveisAtivos || null;

    const grp = new THREE.Group();
    grp.name = 'sombrasNuvensDiorama';

    const tex = Kit3D.criarTexturaSombraNuvem();
    const qtd = opts.qtd || 5;
    const raioX = opts.largura ? opts.largura * 0.5 : (opts.raio || 34);
    const raioZ = opts.profundidade ? opts.profundidade * 0.5 : (opts.raio || 28);
    const velBaseX = opts.velocidadeX != null ? opts.velocidadeX : 0.65;
    const velBaseZ = opts.velocidadeZ != null ? opts.velocidadeZ : 0.32;
    const alturaY = opts.y != null ? opts.y : 0.028;
    const opacBase = opts.opacidade != null ? opts.opacidade : 0.20;

    const patches = [];
    const geo = Kit3D.geo('nuvem_sombra_geo_base', () => new THREE.PlaneGeometry(1, 0.55));

    for (let i = 0; i < qtd; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: opacBase * (0.8 + Math.random() * 0.4),
        depthWrite: false,
        blending: THREE.NormalBlending
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      const esc = (opts.escala || 20) * (0.75 + Math.random() * 0.7);
      mesh.scale.set(esc, esc * 0.55, 1);

      const startX = -raioX * 1.3 + (i / qtd) * (raioX * 2.6) + (Math.random() - 0.5) * 8;
      const startZ = -raioZ + Math.random() * (raioZ * 2);
      mesh.position.set(startX, alturaY, startZ);
      grp.add(mesh);

      patches.push({
        mesh: mesh,
        mat: mat,
        baseScaleX: mesh.scale.x,
        baseScaleY: mesh.scale.y,
        baseOpac: mat.opacity,
        speedX: velBaseX * (0.85 + (i % 3) * 0.15),
        speedZ: velBaseZ * (0.85 + (i % 2) * 0.2),
        seed: i * 1.7 + Math.random()
      });
    }

    const minX = -raioX * 1.4;
    const maxX = raioX * 1.4;
    const minZ = -raioZ * 1.3;
    const maxZ = raioZ * 1.3;

    const animSombras = (now) => {
      if (reduzirMovimento) return;

      patches.forEach((p) => {
        let px = p.mesh.position.x + p.speedX * 0.02;
        let pz = p.mesh.position.z + p.speedZ * 0.02;

        if (px > maxX) px = minX;
        if (pz > maxZ) pz = minZ;

        p.mesh.position.x = px;
        p.mesh.position.z = pz;

        p.mesh.scale.x = p.baseScaleX * (1.0 + Math.sin(now * 0.4 + p.seed) * 0.08);
        p.mesh.scale.y = p.baseScaleY * (1.0 + Math.cos(now * 0.35 + p.seed) * 0.08);
        p.mat.opacity = p.baseOpac * (0.88 + Math.sin(now * 0.6 + p.seed) * 0.12);
      });
    };

    grp.userData = { animFn: animSombras };
    if (animaveis) {
      animaveis.push(animSombras);
    }

    if (parent) {
      parent.add(grp);
    }
    return grp;
  };

  /* ===== NUVENS EM SPRITE (textura macia, sem esferas de plástico) ===== */
  Kit3D.nuvensSprite = function (scene, opts) {
    opts = opts || {};
    const grp = new THREE.Group();
    const tex = Kit3D.texturaNuvem();
    const qtd = opts.qtd || 8;
    const cores = opts.cores || [0xffffff, 0xfff3e0, 0xf3f8ff];
    for (let i = 0; i < qtd; i++) {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        fog: false,
        opacity: 0.75 + Math.random() * 0.25,
        color: Kit3D.cor(cores[i % cores.length])
      });
      const s = new THREE.Sprite(mat);
      const esc = (opts.escala || 16) * (0.7 + Math.random() * 0.8);
      s.scale.set(esc, esc * 0.5, 1);
      s.position.set(
        (opts.centroX || 0) + (-(opts.largura || 140) / 2) + Math.random() * (opts.largura || 140),
        (opts.altura != null ? opts.altura : 30) + Math.random() * (opts.variacao != null ? opts.variacao : 18),
        (opts.centroZ || 0) + (-(opts.prof || 120) / 2) + Math.random() * (opts.prof || 120)
      );
      grp.add(s);
    }
    scene.add(grp);
    return grp;
  };

  /* ===== HELPERS DE CONSTRUÇÃO LOW-POLY 3D ===== */
  Kit3D.criarChao = function (w, d, cor) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = Kit3D.mat('lambert', cor || 0x86c232);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return mesh;
  };

  Kit3D.criarEstrada = function (w, d, cor) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = Kit3D.mat('lambert', cor || 0xd9b382);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    mesh.receiveShadow = true;
    return mesh;
  };

  Kit3D.criarCerca = function (x, z, comp, horizontal, cor, opts) {
    opts = opts || {};
    const grp = new THREE.Group();
    const posteGeo = opts.quadrado
      ? Kit3D.geo('cerca_poste_q', () => new THREE.BoxGeometry(0.2, 1.25, 0.2))
      : Kit3D.geo('cerca_poste', () => new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6));
    const madeiraMat = Kit3D.mat('lambert', cor || 0x8d6e63);
    const num = Math.floor(comp / 2.2);

    // Trilhos (um só, ou dois quando opts.duplo)
    const alturas = opts.duplo ? [1.02, 0.6] : [0.85];
    alturas.forEach((alt) => {
      const trilhoGeo = horizontal
        ? Kit3D.geo('cerca_trilho_h_' + alt, () => new THREE.BoxGeometry(comp, 0.1, 0.12))
        : Kit3D.geo('cerca_trilho_v_' + alt, () => new THREE.BoxGeometry(0.12, 0.1, comp));
      const trilho = new THREE.Mesh(trilhoGeo, madeiraMat);
      trilho.position.set(x, alt, z);
      trilho.castShadow = true;
      grp.add(trilho);
    });

    for (let i = -num / 2; i <= num / 2; i++) {
      const poste = new THREE.Mesh(posteGeo, madeiraMat);
      poste.castShadow = true;
      if (horizontal) poste.position.set(x + i * 2.2, 0.62, z);
      else poste.position.set(x, 0.62, z + i * 2.2);
      grp.add(poste);
    }
    return grp;
  };

  Kit3D.criarPlaca = function (x, z, texto, corFundo, largura) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    // Poste de madeira com suporte
    const posteGeo = Kit3D.geo('placa_poste', () => new THREE.CylinderGeometry(0.09, 0.1, 1.9, 7));
    const posteMat = Kit3D.mat('lambert', 0x5d4037);
    const poste = new THREE.Mesh(posteGeo, posteMat);
    poste.position.y = 0.95;
    poste.castShadow = true;
    grp.add(poste);

    // Textura de canvas com o texto legível
    const txt = texto || 'PLACA';
    const minLargura = Math.max(3.4, txt.length * 0.28);
    const wPainel = largura || minLargura;
    const hPainel = 1.05;
    const texW = Math.max(512, Math.round(wPainel * 140));
    const corHex = typeof corFundo === 'number' ? '#' + corFundo.toString(16).padStart(6, '0') : (corFundo || '#2e7d32');
    const tex = Kit3D.criarTexturaTexto(txt, { bg: corHex, fg: '#ffffff', border: '#ffffff', width: texW });

    const painelGeo = new THREE.BoxGeometry(wPainel, hPainel, 0.16);
    const painelFrenteMat = new THREE.MeshLambertMaterial({ map: tex });
    const painelBordaMat = Kit3D.mat('lambert', 0x3e2723);

    // Aplica a textura na face frontal e traseira
    const mats = [painelBordaMat, painelBordaMat, painelBordaMat, painelBordaMat, painelFrenteMat, painelFrenteMat];
    const painel = new THREE.Mesh(painelGeo, mats);
    painel.position.y = 1.75;
    painel.castShadow = true;
    grp.add(painel);

    grp.userData = { interativo: true, nome: `Placa: ${texto}` };
    return grp;
  };

  Kit3D.criarArvore = function (x, z, corCopa, corTronco, tipo, animaveis) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    let copaColor = 0x2e7d32; // Verde floresta viçoso por padrão
    let troncoColor = 0x5d4037;
    let tipoArvore = 'copa';

    if (typeof corCopa === 'string') {
      tipoArvore = corCopa;
      copaColor = tipoArvore === 'frutifera' ? 0x388e3c : 0x2e7d32;
    } else if (typeof corCopa === 'number') {
      copaColor = corCopa;
    }

    if (typeof corTronco === 'number') {
      troncoColor = corTronco;
    }

    if (typeof tipo === 'string') {
      tipoArvore = tipo;
    }

    // Tronco robusto e proporcional
    const troncoGeo = Kit3D.geo('arvore_tronco', () => new THREE.CylinderGeometry(0.35, 0.48, 2.5, 8));
    const troncoMat = Kit3D.mat('toon', troncoColor);
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);
    tronco.position.y = 1.25;
    tronco.castShadow = true;
    grp.add(tronco);

    // Subgrupo da copa para animação de vento suave e elástica
    const copaGrp = new THREE.Group();
    copaGrp.position.y = 0;
    grp.add(copaGrp);

    // Copa volumosa com verde vivo e camadas naturais
    const copaMat = Kit3D.mat('toon', copaColor);
    const copaGeo1 = Kit3D.geo('arvore_copa1', () => new THREE.DodecahedronGeometry(1.75, 1));
    const copaGeo2 = Kit3D.geo('arvore_copa2', () => new THREE.DodecahedronGeometry(1.3, 1));
    const copaGeo3 = Kit3D.geo('arvore_copa3', () => new THREE.DodecahedronGeometry(0.9, 1));

    const copa1 = new THREE.Mesh(copaGeo1, copaMat);
    copa1.position.y = 3.1;
    copa1.castShadow = true;
    copaGrp.add(copa1);

    const copa2 = new THREE.Mesh(copaGeo2, copaMat);
    copa2.position.set(0.35, 4.0, -0.25);
    copa2.castShadow = true;
    copaGrp.add(copa2);

    const copa3 = new THREE.Mesh(copaGeo3, copaMat);
    copa3.position.set(-0.3, 4.6, 0.2);
    copa3.castShadow = true;
    copaGrp.add(copa3);

    // Se for frutífera, adiciona maçãs vermelhas vibrantes
    if (tipoArvore === 'frutifera') {
      const frutaGeo = Kit3D.geo('arvore_fruta', () => new THREE.SphereGeometry(0.22, 7, 7));
      const frutaMat = Kit3D.mat('toon', 0xd32f2f);
      const coords = [
        [-1.0, 2.9, 1.0], [0.9, 3.3, 0.9], [-0.6, 3.8, 0.8],
        [1.0, 2.8, -0.8], [-0.9, 3.2, -0.9], [0.4, 4.1, 0.9]
      ];
      coords.forEach(([fx, fy, fz]) => {
        const fruta = new THREE.Mesh(frutaGeo, frutaMat);
        fruta.position.set(fx, fy, fz);
        copaGrp.add(fruta);
      });
    }

    grp.userData = {
      interativo: true,
      nome: tipoArvore === 'frutifera' ? 'Árvore Frutífera com Maçãs' : 'Árvore Frondosa no Campo',
      vegetacao: 'arvore',
      copaGrp: copaGrp,
      faseVento: (x * 0.47 + z * 0.31) + Math.random() * 0.5
    };

    if (animaveis) {
      Kit3D.animarBalancoObjeto(grp, animaveis);
    }

    return grp;
  };

  Kit3D.criarPinheiro = function (x, z, corCopa, animaveis) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const troncoGeo = Kit3D.geo('pinheiro_tronco', () => new THREE.CylinderGeometry(0.28, 0.38, 2.0, 8));
    const troncoMat = Kit3D.mat('lambert', 0x4e342e);
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);
    tronco.position.y = 1.0;
    tronco.castShadow = true;
    grp.add(tronco);

    const mat = Kit3D.mat('lambert', corCopa || 0x1b5e20);
    const cones = [];
    [
      { r: 1.9, h: 2.2, y: 2.4 },
      { r: 1.5, h: 2.0, y: 3.6 },
      { r: 1.0, h: 1.8, y: 4.7 },
      { r: 0.6, h: 1.4, y: 5.5 }
    ].forEach((c) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(c.r, c.h, 8), mat);
      cone.position.y = c.y;
      cone.castShadow = true;
      grp.add(cone);
      cones.push(cone);
    });

    grp.userData = {
      interativo: true,
      nome: 'Pinheiro',
      vegetacao: 'pinheiro',
      cones: cones,
      faseVento: (x * 0.43 + z * 0.29) + Math.random() * 0.5
    };

    if (animaveis) {
      Kit3D.animarBalancoObjeto(grp, animaveis);
    }

    return grp;
  };

  Kit3D.criarArbusto = function (x, z, cor, corFlores, animaveis) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const mat = Kit3D.mat('lambert', cor || 0x43a047);
    const m1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 0), mat);
    m1.position.y = 0.6;
    m1.castShadow = true;
    grp.add(m1);

    const m2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), mat);
    m2.position.set(0.45, 0.5, 0.2);
    m2.castShadow = true;
    grp.add(m2);

    if (corFlores) {
      const flMat = Kit3D.mat('lambert', corFlores);
      const flGeo = Kit3D.geo('flor_dot', () => new THREE.SphereGeometry(0.12, 5, 5));
      [[-0.3, 0.8, 0.4], [0.2, 0.9, 0.3], [0.6, 0.7, 0.4]].forEach(([fx, fy, fz]) => {
        const fl = new THREE.Mesh(flGeo, flMat);
        fl.position.set(fx, fy, fz);
        grp.add(fl);
      });
    }

    grp.userData = {
      interativo: true,
      nome: 'Arbusto',
      vegetacao: 'arbusto',
      folhas: [m1, m2],
      faseVento: (x * 0.52 + z * 0.37) + Math.random() * 0.5
    };

    if (animaveis) {
      Kit3D.animarBalancoObjeto(grp, animaveis);
    }

    return grp;
  };

  Kit3D.criarFlores = function (parent, x, z, raio, qtd, animaveis) {
    const count = qtd || 8;
    const rMax = raio || 2.5;
    const cores = [0xffeb3b, 0xff5722, 0xffffff, 0xe91e63, 0xab47bc];
    const hasteMat = Kit3D.mat('lambert', 0x388e3c);
    const hasteGeo = Kit3D.geo('haste_flor', () => new THREE.CylinderGeometry(0.03, 0.03, 0.35, 4));

    const floresGrp = new THREE.Group();
    parent.add(floresGrp);

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * rMax;
      const fx = x + Math.cos(ang) * dist;
      const fz = z + Math.sin(ang) * dist;

      const fItem = new THREE.Group();
      fItem.position.set(fx, 0, fz);

      const haste = new THREE.Mesh(hasteGeo, hasteMat);
      haste.position.set(0, 0.17, 0);
      fItem.add(haste);

      const corFl = cores[Math.floor(Math.random() * cores.length)];
      const petala = new THREE.Mesh(
        Kit3D.geo('petala_' + corFl, () => new THREE.SphereGeometry(0.12, 5, 5)),
        Kit3D.mat('lambert', corFl)
      );
      petala.position.set(0, 0.36, 0);
      fItem.add(petala);

      fItem.userData = { fase: fx * 0.6 + fz * 0.5 + Math.random() * 0.5 };
      floresGrp.add(fItem);
    }

    floresGrp.userData = {
      vegetacao: 'flores',
      itens: floresGrp.children
    };

    if (animaveis) {
      Kit3D.animarBalancoObjeto(floresGrp, animaveis);
    }

    return floresGrp;
  };

  /* Pedrinhas decorativas e seixos arredondados de caminho */
  Kit3D.criarPedrinhasDecorativas = function (scene, x, z, qtd, raio, opts) {
    opts = opts || {};
    const count = qtd || 12;
    const rMax = raio || 2.0;
    const grp = new THREE.Group();
    grp.position.set(x, opts.y || 0.03, z);

    const tons = opts.cores || [0xcfd8dc, 0xb0bec5, 0xd7ccc8, 0xbcaaa4, 0x90a4ae];
    const geo = Kit3D.geo('pedrinha_seixo_geo', () => new THREE.DodecahedronGeometry(0.18, 0));

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = (0.2 + Math.random() * 0.8) * rMax;
      const px = Math.cos(ang) * dist;
      const pz = Math.sin(ang) * dist;
      const escala = (0.55 + Math.random() * 0.65) * (opts.escala || 1.0);
      const cor = tons[Math.floor(Math.random() * tons.length)];

      const pedra = new THREE.Mesh(geo, Kit3D.mat('toon', cor));
      pedra.position.set(px, 0.06 * escala, pz);
      pedra.scale.set(escala * (0.9 + Math.random() * 0.3), escala * 0.45, escala * (0.8 + Math.random() * 0.4));
      pedra.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3);
      pedra.castShadow = true;
      pedra.receiveShadow = true;
      grp.add(pedra);
    }
    if (scene && scene.add) scene.add(grp);
    return grp;
  };

  /* Tufos de grama estilizados com lâminas triangulares fofas (TEA) */
  Kit3D.criarTufosGramaDecorativos = function (scene, x, z, qtd, raio, animaveis, cor) {
    const count = qtd || 8;
    const rMax = raio || 2.0;
    const grp = new THREE.Group();
    grp.position.set(x, 0.02, z);

    const corGrama = cor || 0x8bc34a;
    const matGrama = Kit3D.mat('toon', corGrama);
    const bladeGeo = Kit3D.geo('tufo_blade_geo', () => {
      const g = new THREE.ConeGeometry(0.09, 0.52, 4);
      g.translate(0, 0.26, 0);
      return g;
    });

    const itensAnimaveis = [];

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * rMax;
      const tx = Math.cos(ang) * dist;
      const tz = Math.sin(ang) * dist;

      const tufo = new THREE.Group();
      tufo.position.set(tx, 0, tz);

      const numBlades = 3;
      for (let b = 0; b < numBlades; b++) {
        const blade = new THREE.Mesh(bladeGeo, matGrama);
        const rotY = (b / numBlades) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const s = 0.7 + Math.random() * 0.45;
        blade.scale.set(s, s, s);
        blade.rotation.set(0.15 + Math.random() * 0.2, rotY, (Math.random() - 0.5) * 0.15);
        blade.castShadow = true;
        tufo.add(blade);
      }
      tufo.userData = { fase: (x + tx) * 0.8 + (z + tz) * 0.7 + Math.random() };
      grp.add(tufo);
      itensAnimaveis.push(tufo);
    }

    if (animaveis && itensAnimaveis.length > 0) {
      animaveis.push((now) => {
        for (let i = 0; i < itensAnimaveis.length; i++) {
          const item = itensAnimaveis[i];
          const vento = Math.sin(now * 2.2 + item.userData.fase) * 0.1;
          item.rotation.z = vento;
          item.rotation.x = vento * 0.5;
        }
      });
    }

    if (scene && scene.add) scene.add(grp);
    return grp;
  };

  /* Flores campestres com pétalas suaves em tons pastel TEA */
  Kit3D.criarFloresCampestresCaminho = function (scene, x, z, qtd, raio, animaveis, cores) {
    const count = qtd || 10;
    const rMax = raio || 2.2;
    const tonsPastel = cores || [0xffffff, 0xfff9c4, 0xf8bbd0, 0xe1bee7, 0xbbdefb, 0xffecb3];
    const hasteMat = Kit3D.mat('lambert', 0x7cb342);
    const hasteGeo = Kit3D.geo('haste_campestre_geo', () => new THREE.CylinderGeometry(0.025, 0.025, 0.32, 4));

    const floresGrp = new THREE.Group();
    floresGrp.position.set(x, 0.02, z);

    const itensFlores = [];

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * rMax;
      const fx = Math.cos(ang) * dist;
      const fz = Math.sin(ang) * dist;

      const fItem = new THREE.Group();
      fItem.position.set(fx, 0, fz);

      const haste = new THREE.Mesh(hasteGeo, hasteMat);
      haste.position.set(0, 0.16, 0);
      fItem.add(haste);

      const corFl = tonsPastel[Math.floor(Math.random() * tonsPastel.length)];
      const petala = new THREE.Mesh(
        Kit3D.geo('petala_campestre_' + corFl, () => new THREE.SphereGeometry(0.11, 6, 5)),
        Kit3D.mat('toon', corFl)
      );
      petala.position.set(0, 0.32, 0);
      fItem.add(petala);

      const miolo = new THREE.Mesh(
        Kit3D.geo('miolo_campestre', () => new THREE.SphereGeometry(0.05, 5, 4)),
        Kit3D.mat('toon', 0xffd54f)
      );
      miolo.position.set(0, 0.35, 0);
      fItem.add(miolo);

      fItem.userData = { fase: (x + fx) * 0.7 + (z + fz) * 0.6 + Math.random() * 0.5 };
      floresGrp.add(fItem);
      itensFlores.push(fItem);
    }

    if (animaveis && itensFlores.length > 0) {
      animaveis.push((now) => {
        for (let i = 0; i < itensFlores.length; i++) {
          const item = itensFlores[i];
          const balanco = Math.sin(now * 1.8 + item.userData.fase) * 0.08;
          item.rotation.z = balanco;
          item.rotation.x = balanco * 0.6;
        }
      });
    }

    if (scene && scene.add) scene.add(floresGrp);
    return floresGrp;
  };

  /* Fileira ou campo de cultivo estilizado (cana, milho, trigo, hortaliças) com balanço ao vento */
  Kit3D.criarPlantacao = function (scene, animaveis, opts) {
    opts = opts || {};
    const grp = new THREE.Group();
    grp.position.set(opts.x || 0, opts.y || 0, opts.z || 0);

    const tipo = opts.tipo || 'cana';
    const linhasX = opts.linhasX || 6;
    const linhasZ = opts.linhasZ || 8;
    const espacoX = opts.espacoX || 1.4;
    const espacoZ = opts.espacoZ || 1.0;
    const corCaule = opts.corCaule || 0xaed581;
    const corFolha = opts.corFolha || 0x689f38;
    const altura = opts.altura || 1.6;

    const cauleGeo = Kit3D.geo(`caule_${tipo}_geo`, () => new THREE.CylinderGeometry(0.07, 0.08, altura, 5));
    const cauleMat = Kit3D.mat('toon', corCaule);
    const folhaMat = Kit3D.mat('toon', corFolha);
    const folhaGeo = Kit3D.geo(`folha_${tipo}_geo`, () => new THREE.ConeGeometry(0.32, 0.75, 4));

    const estacas = [];
    const startX = -((linhasX - 1) * espacoX) / 2;
    const startZ = -((linhasZ - 1) * espacoZ) / 2;

    for (let ix = 0; ix < linhasX; ix++) {
      for (let iz = 0; iz < linhasZ; iz++) {
        const px = startX + ix * espacoX + (Math.random() - 0.5) * 0.15;
        const pz = startZ + iz * espacoZ + (Math.random() - 0.5) * 0.15;

        const estaca = new THREE.Group();
        estaca.position.set(px, 0, pz);

        const caule = new THREE.Mesh(cauleGeo, cauleMat);
        caule.position.y = altura / 2;
        caule.castShadow = true;
        estaca.add(caule);

        const folha = new THREE.Mesh(folhaGeo, folhaMat);
        folha.position.y = altura * 0.95;
        folha.castShadow = true;
        estaca.add(folha);

        estaca.userData = {
          fase: px * 0.6 + pz * 0.5 + Math.random() * 0.3
        };
        grp.add(estaca);
        estacas.push(estaca);
      }
    }

    grp.userData = {
      interativo: true,
      nome: opts.nome || 'Plantação de Lavoura no Campo',
      vegetacao: 'cultivo',
      estacas: estacas
    };

    if (scene) scene.add(grp);
    if (animaveis) {
      Kit3D.animarBalancoObjeto(grp, animaveis);
    }
    return grp;
  };

  /* Registra animação de brisa suave nos galhos e copas de árvores, pinheiros, arbustos e cultivos */
  Kit3D.animarBalancoObjeto = function (obj, animaveis) {
    if (!obj || !animaveis || obj.userData._animadoVento) return;
    obj.userData._animadoVento = true;

    const tipo = obj.userData.vegetacao;
    const fase = obj.userData.faseVento || (obj.position.x * 0.4 + obj.position.z * 0.3);

    if (tipo === 'arvore') {
      const copa = obj.userData.copaGrp;
      animaveis.push((now) => {
        if (reduzirMovimento) return;
        const breeze = Math.sin(now * 1.5 + fase);
        const breezeSide = Math.cos(now * 1.2 + fase);
        obj.rotation.z = breeze * 0.016;
        obj.rotation.x = breezeSide * 0.012;
        if (copa) {
          copa.rotation.z = Math.sin(now * 2.1 + fase + 0.3) * 0.034;
          copa.rotation.x = Math.cos(now * 1.7 + fase + 0.2) * 0.026;
        }
      });
    } else if (tipo === 'pinheiro') {
      const cones = obj.userData.cones || [];
      animaveis.push((now) => {
        if (reduzirMovimento) return;
        const breeze = Math.sin(now * 1.6 + fase);
        const breezeSide = Math.cos(now * 1.3 + fase);
        obj.rotation.z = breeze * 0.014;
        cones.forEach((cone, idx) => {
          const mult = (idx + 1) * 0.009;
          cone.rotation.z = Math.sin(now * 2.0 + fase + idx * 0.25) * mult;
          cone.rotation.x = breezeSide * (mult * 0.7);
        });
      });
    } else if (tipo === 'arbusto') {
      const folhas = obj.userData.folhas || [];
      animaveis.push((now) => {
        if (reduzirMovimento) return;
        folhas.forEach((folha, idx) => {
          folha.rotation.z = Math.sin(now * 2.2 + fase + idx * 0.4) * 0.028;
          folha.rotation.x = Math.cos(now * 1.8 + fase + idx * 0.3) * 0.022;
        });
      });
    } else if (tipo === 'flores') {
      const itens = obj.userData.itens || [];
      animaveis.push((now) => {
        if (reduzirMovimento) return;
        for (let i = 0; i < itens.length; i++) {
          const it = itens[i];
          const f = it.userData ? it.userData.fase : i;
          it.rotation.z = Math.sin(now * 2.3 + f) * 0.06;
          it.rotation.x = Math.cos(now * 1.9 + f) * 0.045;
        }
      });
    } else if (tipo === 'cultivo') {
      const estacas = obj.userData.estacas || [];
      animaveis.push((now) => {
        if (reduzirMovimento) return;
        for (let i = 0; i < estacas.length; i++) {
          const est = estacas[i];
          const f = est.userData ? est.userData.fase : (i * 0.2);
          est.rotation.z = Math.sin(now * 2.6 + f) * 0.065;
          est.rotation.x = Math.cos(now * 2.1 + f) * 0.045;
        }
      });
    }
  };

  /* Varre a cena do diorama e ativa a brisa suave para toda a vegetação presente */
  Kit3D.adicionarBalancoVegetacao = function (scene, animaveis) {
    if (!scene || !animaveis) return;
    scene.traverse((obj) => {
      if (!obj || !obj.userData) return;
      if (obj.userData.vegetacao && !obj.userData._animadoVento) {
        Kit3D.animarBalancoObjeto(obj, animaveis);
      } else if (!obj.userData._animadoVento) {
        const nome = obj.userData.nome || '';
        if (nome.includes('Árvore') && !obj.userData._animadoVento) {
          obj.userData.vegetacao = 'arvore';
          obj.userData.faseVento = (obj.position.x * 0.4 + obj.position.z * 0.3) + Math.random();
          Kit3D.animarBalancoObjeto(obj, animaveis);
        } else if (nome.includes('Pinheiro') && !obj.userData._animadoVento) {
          obj.userData.vegetacao = 'pinheiro';
          obj.userData.faseVento = (obj.position.x * 0.4 + obj.position.z * 0.3) + Math.random();
          Kit3D.animarBalancoObjeto(obj, animaveis);
        } else if (nome.includes('Arbusto') && !obj.userData._animadoVento) {
          obj.userData.vegetacao = 'arbusto';
          obj.userData.faseVento = (obj.position.x * 0.5 + obj.position.z * 0.4) + Math.random();
          Kit3D.animarBalancoObjeto(obj, animaveis);
        } else if ((nome.includes('Lavoura') || nome.includes('cana') || nome.includes('Plantação')) && obj.children && obj.children.length > 5 && !obj.userData._animadoVento) {
          const caules = obj.children.filter(ch => ch.isMesh && ch.geometry && ch.geometry.type === 'CylinderGeometry');
          if (caules.length > 3) {
            obj.userData.vegetacao = 'cultivo';
            obj.userData.estacas = caules;
            obj.userData._animadoVento = true;
            animaveis.push((now) => {
              if (reduzirMovimento) return;
              for (let k = 0; k < caules.length; k++) {
                const c = caules[k];
                const f = (c.position.x * 0.5 + c.position.z * 0.4);
                c.rotation.z = Math.sin(now * 2.5 + f) * 0.055;
                c.rotation.x = Math.cos(now * 2.0 + f) * 0.04;
              }
            });
          }
        }
      }
    });
  };

  Kit3D.criarCasa = function (w, h, d, corParede, corTelhado, opts) {
    const grp = new THREE.Group();
    opts = opts || {};

    // Paredes principais
    const paredeGeo = new THREE.BoxGeometry(w, h, d);
    const paredeMat = Kit3D.mat('lambert', corParede || 0xffffff);
    const parede = new THREE.Mesh(paredeGeo, paredeMat);
    parede.position.y = h / 2;
    parede.castShadow = true;
    parede.receiveShadow = true;
    grp.add(parede);

    // Telhado de 4 águas ou 2 águas mais detalhado
    const telhadoGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.82, h * 0.7, 4);
    const telhadoMat = Kit3D.mat('lambert', corTelhado || 0xb71c1c);
    const telhado = new THREE.Mesh(telhadoGeo, telhadoMat);
    telhado.position.y = h + (h * 0.7) / 2;
    telhado.rotation.y = Math.PI / 4;
    telhado.castShadow = true;
    grp.add(telhado);

    // Porta frontal de madeira com maçaneta mais detalhada
    const portaMat = Kit3D.mat('lambert', 0x5d4037);
    const porta = new THREE.Mesh(new THREE.BoxGeometry(w * 0.24, h * 0.58, 0.12), portaMat);
    porta.position.set(0, (h * 0.58) / 2, d / 2 + 0.06);
    grp.add(porta);

    const macaneta = new THREE.Mesh(Kit3D.geo('macaneta', () => new THREE.SphereGeometry(0.07, 7, 7)), Kit3D.mat('phong', 0xffd54f, { shininess: 80 }));
    macaneta.position.set(w * 0.08, (h * 0.58) / 2, d / 2 + 0.14);
    grp.add(macaneta);

    // Janelas com vidros reflexivos e molduras mais bonitas
    const janelaMat = Kit3D.mat('phong', 0xe0f7fa, { shininess: 95, transparent: true, opacity: 0.8 });
    const molduraMat = Kit3D.mat('lambert', 0xffffff);
    [-w * 0.32, w * 0.32].forEach((jx) => {
      const moldura = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.1), molduraMat);
      moldura.position.set(jx, h * 0.65, d / 2 + 0.06);
      grp.add(moldura);

      const vidro = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.12), janelaMat);
      vidro.position.set(jx, h * 0.65, d / 2 + 0.07);
      grp.add(vidro);
    });

    // Chaminé com fumaça mais detalhada
    const chamine = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.3, 0.65), Kit3D.mat('lambert', 0x8d6e63));
    chamine.position.set(w * 0.3, h + 0.65, -d * 0.12);
    chamine.castShadow = true;
    grp.add(chamine);

    grp.userData = { interativo: true, nome: opts.nome || 'Casa Familiar' };
    return grp;
  };

  Kit3D.criarPredio = function (w, h, d, cor, opts) {
    const grp = new THREE.Group();
    opts = opts || {};

    // Estrutura principal do edifício
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = Kit3D.mat('lambert', cor || 0x78909c);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    grp.add(mesh);

    // Janelas envidraçadas com reflexo
    const janMat = Kit3D.mat('phong', 0xbbdefb, { shininess: 80 });
    for (let y = 1.6; y < h - 0.8; y += 1.8) {
      [-w * 0.28, w * 0.28].forEach((jx) => {
        const j = new THREE.Mesh(new THREE.BoxGeometry(w * 0.32, 0.85, 0.1), janMat);
        j.position.set(jx, y, d / 2 + 0.06);
        grp.add(j);
      });
    }

    // Entrada térrea
    const portaMat = Kit3D.mat('phong', 0x37474f, { shininess: 50 });
    const porta = new THREE.Mesh(new THREE.BoxGeometry(w * 0.35, 1.3, 0.1), portaMat);
    porta.position.set(0, 0.65, d / 2 + 0.06);
    grp.add(porta);

    // Caixa d'água / antena no topo
    const caixaGeo = Kit3D.geo('predio_caixa', () => new THREE.CylinderGeometry(0.8, 0.8, 0.9, 8));
    const caixa = new THREE.Mesh(caixaGeo, Kit3D.mat('lambert', 0x90a4ae));
    caixa.position.set(-w * 0.2, h + 0.45, 0);
    caixa.castShadow = true;
    grp.add(caixa);

    const antenaGeo = Kit3D.geo('predio_antena', () => new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6));
    const antena = new THREE.Mesh(antenaGeo, Kit3D.mat('lambert', 0x455a64));
    antena.position.set(w * 0.25, h + 0.9, 0);
    grp.add(antena);

    grp.userData = { interativo: true, nome: opts.nome || 'Edifício da Cidade' };
    return grp;
  };

  Kit3D.criarVaca = function (corCorpo, corManchas) {
    const vaca = new THREE.Group();
    const corpoMat = Kit3D.mat('lambert', corCorpo || 0xffffff);
    const manchaMat = Kit3D.mat('lambert', corManchas || 0x222222);

    // Corpo mais arredondado e proporcional
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.5, 2.8), corpoMat);
    corpo.position.y = 1.45;
    corpo.castShadow = true;
    vaca.add(corpo);

    // Manchas assimétricas mais orgânicas (largura 1.94 para evitar z-fighting e dithering)
    const mancha1 = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.86, 1.1), manchaMat);
    mancha1.position.set(0, 1.5, 0.35);
    vaca.add(mancha1);

    const mancha2 = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.56, 0.8), manchaMat);
    mancha2.position.set(0, 1.65, -0.75);
    vaca.add(mancha2);

    // Cabeça móvel articulada
    const cabeca = new THREE.Group();
    cabeca.position.set(0, 1.9, 1.45);

    const cMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.15, 1.25), corpoMat);
    cMesh.castShadow = true;
    cabeca.add(cMesh);

    // Focinho rosa mais detalhado com narinas
    const focinho = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.55, 0.58), Kit3D.mat('lambert', 0xffccbc));
    focinho.position.set(0, -0.25, 0.78);
    cabeca.add(focinho);

    const narinaMat = Kit3D.mat('lambert', 0xe57373);
    [-0.24, 0.24].forEach((nx) => {
      const narina = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8), narinaMat);
      narina.position.set(nx, -0.2, 1.06);
      narina.rotation.x = Math.PI / 2;
      cabeca.add(narina);
    });

    // Olhinhos 3D expressivos maiores e mais bonitos
    const olhoGeo = Kit3D.geo('vaca_olho', () => new THREE.SphereGeometry(0.14, 8, 8));
    const pupilaGeo = Kit3D.geo('vaca_pupila', () => new THREE.SphereGeometry(0.08, 8, 8));
    const olhoBrancoMat = Kit3D.mat('basic', 0xffffff);
    const pupilaPretaMat = Kit3D.mat('basic', 0x111111);
    const olhos = [];

    [-0.6, 0.6].forEach((ox) => {
      const olhoGrp = new THREE.Group();
      olhoGrp.position.set(ox, 0.18, 0.48);

      const olho = new THREE.Mesh(olhoGeo, olhoBrancoMat);
      olhoGrp.add(olho);

      const pupila = new THREE.Mesh(pupilaGeo, pupilaPretaMat);
      pupila.position.set(ox > 0 ? 0.05 : -0.05, 0, 0.07);
      olhoGrp.add(pupila);

      cabeca.add(olhoGrp);
      olhos.push(olhoGrp);
    });

    // Orelhas caídas mais expressivas
    const orelhaGeo = Kit3D.geo('vaca_orelha', () => new THREE.ConeGeometry(0.18, 0.6, 6));
    [-0.7, 0.7].forEach((ex) => {
      const orelha = new THREE.Mesh(orelhaGeo, corpoMat);
      orelha.position.set(ex, 0.38, 0);
      orelha.rotation.z = ex > 0 ? -Math.PI / 3.5 : Math.PI / 3.5;
      cabeca.add(orelha);
    });

    // Chifrinhos de marfim mais detalhados
    const chifreGeo = Kit3D.geo('vaca_chifre', () => new THREE.ConeGeometry(0.11, 0.5, 6));
    const chifreMat = Kit3D.mat('lambert', 0xfff8e1);
    [-0.4, 0.4].forEach((cx) => {
      const chifre = new THREE.Mesh(chifreGeo, chifreMat);
      chifre.position.set(cx, 0.68, 0.12);
      chifre.rotation.z = cx > 0 ? -Math.PI * 0.12 : Math.PI * 0.12;
      cabeca.add(chifre);
    });

    // Coleira e sininho dourado no pescoço
    const coleira = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 5, 12), Kit3D.mat('toon', 0xb71c1c));
    coleira.position.set(0, 1.62, 0.85);
    coleira.rotation.x = Math.PI / 3;
    vaca.add(coleira);

    const sininho = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.25, 6), Kit3D.mat('phong', 0xffd54f, { shininess: 90 }));
    sininho.position.set(0, 1.25, 1.05);
    vaca.add(sininho);

    vaca.add(cabeca);

    // Pernas com cascos escuros mais robustos
    const pernaGeo = Kit3D.geo('vaca_perna', () => new THREE.CylinderGeometry(0.2, 0.2, 0.95, 8));
    const cascoGeo = Kit3D.geo('vaca_casco', () => new THREE.CylinderGeometry(0.21, 0.22, 0.24, 8));
    const cascoMat = Kit3D.mat('lambert', 0x3e2723);

    [[-0.65, 0.95], [0.65, 0.95], [-0.65, -0.95], [0.65, -0.95]].forEach(([px, pz]) => {
      const perna = new THREE.Mesh(pernaGeo, corpoMat);
      perna.position.set(px, 0.58, pz);
      perna.castShadow = true;
      vaca.add(perna);

      const casco = new THREE.Mesh(cascoGeo, cascoMat);
      casco.position.set(px, 0.12, pz);
      casco.castShadow = true;
      vaca.add(casco);
    });

    // Cauda articulada com movimento mais natural
    const cauda = new THREE.Group();
    cauda.position.set(0, 1.85, -1.35);
    const caudaHaste = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 6), corpoMat);
    caudaHaste.position.set(0, -0.55, -0.18);
    caudaHaste.rotation.x = Math.PI * 0.15;
    cauda.add(caudaHaste);

    const penacho = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), manchaMat);
    penacho.position.set(0, -1.05, -0.3);
    cauda.add(penacho);
    vaca.add(cauda);

    vaca.userData = {
      interativo: true,
      nome: 'Vaquinha no pasto: na pecuária extensiva, os animais vivem soltos e comem capim.',
      cabeca: cabeca,
      olhos: olhos,
      focinho: focinho,
      sino: sininho,
      cauda: cauda,
      baseHeadY: 1.9,
      tempo: Math.random() * 10
    };

    return vaca;
  };

  Kit3D.criarTrator = function (cor) {
    const grp = new THREE.Group();

    // Chassi principal mais detalhado
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 3.6), Kit3D.mat('lambert', cor || 0x2e7d32));
    corpo.position.y = 1.5;
    corpo.castShadow = true;
    grp.add(corpo);

    // Grade frontal do motor mais robusta
    const grade = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.9, 0.12), Kit3D.mat('lambert', 0x37474f));
    grade.position.set(0, 1.3, 1.82);
    grp.add(grade);

    // Faróis dianteiros brilhantes maiores
    const farolMat = Kit3D.mat('phong', 0xffeb3b, { emissive: 0xffd54f, emissiveIntensity: 0.7 });
    const farolGeo = Kit3D.geo('farol', () => new THREE.SphereGeometry(0.22, 8, 8));
    [-0.85, 0.85].forEach((fx) => {
      const farol = new THREE.Mesh(farolGeo, farolMat);
      farol.position.set(fx, 1.55, 1.82);
      grp.add(farol);
    });

    // Cabine com vidro transparente mais detalhada
    const cabine = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.7, 1.9), Kit3D.mat('phong', 0xe0f7fa, { transparent: true, opacity: 0.7, shininess: 100 }));
    cabine.position.set(0, 2.75, -0.45);
    cabine.castShadow = true;
    grp.add(cabine);

    // Teto da cabine com moldura
    const teto = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 2.1), Kit3D.mat('lambert', cor || 0x2e7d32));
    teto.position.set(0, 3.6, -0.45);
    grp.add(teto);

    // Cano de escapamento vertical mais detalhado
    const escape = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.7, 6), Kit3D.mat('lambert', 0x424242));
    escape.position.set(0.9, 2.7, 1.05);
    grp.add(escape);

    // Rodas traseiras grandes com calota mais bonita
    const rodaGGeo = Kit3D.geo('roda_traseira_g', () => new THREE.CylinderGeometry(1.0, 1.0, 0.6, 12));
    const rodaMat = Kit3D.mat('lambert', 0x212121);
    const calotaMat = Kit3D.mat('phong', 0xffb300, { shininess: 80 });

    [[-1.4, -0.85], [1.4, -0.85]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaGGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 1.0, rz);
      r.castShadow = true;
      grp.add(r);

      const calota = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.62, 8), calotaMat);
      calota.rotation.z = Math.PI / 2;
      calota.position.set(rx, 1.0, rz);
      grp.add(calota);
    });

    // Rodas dianteiras menores
    const rodaPGeo = Kit3D.geo('roda_dianteira_p', () => new THREE.CylinderGeometry(0.62, 0.62, 0.48, 12));
    [[-1.4, 1.25], [1.4, 1.25]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaPGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 0.62, rz);
      r.castShadow = true;
      grp.add(r);
    });

    grp.userData = { interativo: true, nome: 'Trator e máquinas usadas para apoiar a produção na fazenda.' };
    return grp;
  };

  Kit3D.criarCaminhao = function (cor) {
    const grp = new THREE.Group();

    // Chassi de metal mais robusto
    const chassi = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.55, 6.5), Kit3D.mat('lambert', 0x263238));
    chassi.position.y = 0.7;
    chassi.castShadow = true;
    grp.add(chassi);

    // Cabine do motorista mais detalhada
    const cabine = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.4, 2.4), Kit3D.mat('lambert', cor || 0x1976d2));
    cabine.position.set(0, 1.95, 1.8);
    cabine.castShadow = true;
    grp.add(cabine);

    // Pára-brisa reflexivo
    const parabrisa = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.15, 0.12), Kit3D.mat('phong', 0xe0f7fa, { shininess: 95 }));
    parabrisa.position.set(0, 2.3, 3.0);
    grp.add(parabrisa);

    // Faróis maiores e mais brilhantes
    const farolMat = Kit3D.mat('phong', 0xffeb3b, { emissive: 0xffd54f, emissiveIntensity: 0.7 });
    [-1.3, 1.3].forEach((fx) => {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), farolMat);
      f.position.set(fx, 1.15, 3.0);
      grp.add(f);
    });

    // Caçamba de carga mais detalhada
    const cacamba = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 3.8), Kit3D.mat('lambert', 0xffb300));
    cacamba.position.set(0, 1.65, -1.3);
    cacamba.castShadow = true;
    grp.add(cacamba);

    // Rodas com eixos duplos mais robustas
    const rodaGeo = Kit3D.geo('caminhao_roda', () => new THREE.CylinderGeometry(0.62, 0.62, 0.48, 12));
    const rodaMat = Kit3D.mat('lambert', 0x212121);
    [[-1.9, 1.8], [1.9, 1.8], [-1.9, -1.05], [1.9, -1.05], [-1.9, -2.15], [1.9, -2.15]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 0.62, rz);
      r.castShadow = true;
      grp.add(r);
    });

    grp.userData = { interativo: true, nome: 'Caminhão de Transporte' };
    return grp;
  };

  Kit3D.criarRio = function (w, d, cor, animaveis) {
    const geo = new THREE.PlaneGeometry(w, d, 28, 40);
    const mat = new THREE.MeshStandardMaterial({
      color: Kit3D.cor(cor || 0x29b6f6),
      transparent: true,
      opacity: 0.88,
      roughness: 0.1,
      metalness: 0.15,
      flatShading: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.06;
    mesh.receiveShadow = true;

    // Plano de cáusticas solares refratadas ao longo do leito do rio
    const texCaustica = Kit3D.criarTexturaCaustica().clone();
    texCaustica.repeat.set(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(d / 4)));
    const causticaMat = new THREE.MeshBasicMaterial({
      map: texCaustica,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const causticaPlane = new THREE.Mesh(Kit3D.geo(`rio_caustica_${w}_${d}`, () => new THREE.PlaneGeometry(w, d)), causticaMat);
    causticaPlane.position.z = -0.015;
    mesh.add(causticaPlane);

    // Anéis / faixas de espuma suave (foam) nas margens de contato com o solo e pedras
    const margemW = Math.max(0.45, w * 0.12);
    const texEspuma = Kit3D.criarTexturaEspuma();
    const foamGeoL = Kit3D.geo(`rio_espuma_${w}_${d}_L`, () => new THREE.PlaneGeometry(margemW, d, 8, 32));
    const foamGeoR = Kit3D.geo(`rio_espuma_${w}_${d}_R`, () => new THREE.PlaneGeometry(margemW, d, 8, 32));
    const foamMat = new THREE.MeshBasicMaterial({
      map: texEspuma,
      color: Kit3D.cor(0xffffff),
      transparent: true,
      opacity: 0.58,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    const foamMeshL = new THREE.Mesh(foamGeoL, foamMat);
    foamMeshL.position.set(-w / 2 + margemW * 0.48, 0, 0.008);
    mesh.add(foamMeshL);

    const foamMeshR = new THREE.Mesh(foamGeoR, foamMat);
    foamMeshR.position.set(w / 2 - margemW * 0.48, 0, 0.008);
    mesh.add(foamMeshR);

    const origPos = new Float32Array(geo.attributes.position.array);
    const posAttr = geo.attributes.position;

    const animRio = (now) => {
      if (reduzirMovimento) return;

      // Múltiplas harmônicas senoidais na ondulação da malha para movimento de correnteza orgânico
      for (let i = 0; i < posAttr.count; i++) {
        const u = origPos[i * 3];
        const v = origPos[i * 3 + 1];

        // Harmônica 1: fluxo longitudinal principal da correnteza
        const wave1 = Math.sin(v * 0.78 - now * 2.5) * 0.024;
        // Harmônica 2: ondulação transversal e refluxo de margem
        const wave2 = Math.cos(u * 1.15 + now * 1.7) * 0.013;
        // Harmônica 3: vórtice diagonal orgânico e refração solar
        const wave3 = Math.sin((u * 0.85 + v * 0.65) * 1.3 - now * 3.1) * 0.008;
        // Harmônica 4: micro-ondulações capilares de alta frequência
        const wave4 = Math.sin((u * 1.8 - v * 1.4) * 1.6 + now * 3.8) * 0.004;
        // Harmônica 5: modulação de borda próxima ao solo
        const distBorda = Math.abs(u) / (w * 0.5 || 1);
        const wave5 = Math.sin(v * 1.4 + now * 2.0) * 0.005 * distBorda;

        posAttr.array[i * 3 + 2] = origPos[i * 3 + 2] + wave1 + wave2 + wave3 + wave4 + wave5;
      }
      posAttr.needsUpdate = true;
      geo.computeVertexNormals();

      // Fluxo dinâmico das cáusticas solares acompanhando a correnteza
      texCaustica.offset.y = -(now * 0.32) % 1.0;
      texCaustica.offset.x = (Math.sin(now * 0.7) * 0.06) % 1.0;
      causticaMat.opacity = 0.28 + Math.sin(now * 2.1) * 0.09;

      // Respiração e ondulação da espuma nas margens
      const pulsoEspuma = Math.sin(now * 1.9) * 0.10;
      foamMat.opacity = 0.52 + pulsoEspuma;
      texEspuma.offset.y = -(now * 0.18) % 1.0;
      texEspuma.offset.x = (Math.sin(now * 0.9) * 0.04) % 1.0;
    };

    mesh.userData = {
      interativo: true,
      nome: 'Rio de Água Limpa',
      baseGeo: geo,
      animFn: animRio
    };

    if (animaveis) {
      animaveis.push(animRio);
    }
    return mesh;
  };

  Kit3D.criarRochas = function (x, z, cor) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);
    const rochaMat = Kit3D.mat('lambert', cor || 0x757575);
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85 + Math.random() * 0.6, 0), rochaMat);
      r.position.set((Math.random() - 0.5) * 3, 0.55 + Math.random() * 0.4, (Math.random() - 0.5) * 3);
      r.rotation.set(Math.random(), Math.random(), Math.random());
      r.castShadow = true;
      grp.add(r);
    }
    grp.userData = { interativo: true, nome: 'Formação Rochosa' };
    return grp;
  };

  Kit3D.criarNuvens = function (scene) {
    const grp = new THREE.Group();
    const mat = Kit3D.mat('lambert', 0xffffff, { transparent: true, opacity: 0.72 });
    for (let i = 0; i < 6; i++) {
      const nuvem = new THREE.Group();
      for (let j = 0; j < 4; j++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(3.2 + Math.random() * 1.6, 8, 8), mat);
        m.position.set(j * 2.8, (Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 1.2);
        nuvem.add(m);
      }
      // Nuvens altas no céu distante, bem acima do diorama e das câmeras
      nuvem.position.set(-60 + Math.random() * 120, 48 + Math.random() * 14, -55 + Math.random() * 50);
      grp.add(nuvem);
    }
    scene.add(grp);
    return grp;
  };

  /* ===== HELPERS DE DIORAMA ESTILIZADO 3D (LOW-POLY PREMIUM) ===== */
  Kit3D.criarIlhaDiorama = function (w, d, h, corGrama, corTerra, opts) {
    opts = opts || {};
    const grp = new THREE.Group();
    grp.userData.isIlhaDiorama = true;
    grp.userData.largura = w;
    grp.userData.profundidade = d;
    const espessuraGrama = 0.65;
    const alturaTerra = Math.max(1.8, (h || 4) - espessuraGrama);

    // 1. Placa superior de grama com BISELADO SUAVE nas bordas (maquete premium fascinante)
    const topoGeo = Kit3D.geo(`ilha_topo_bisel_${w}_${d}`, () => {
      const chanfro = 0.16;
      const hw = (w / 2) - chanfro;
      const hd = (d / 2) - chanfro;
      const r = Math.min(0.45, hw * 0.12, hd * 0.12);
      const shape = new THREE.Shape();
      shape.moveTo(-hw + r, -hd);
      shape.lineTo(hw - r, -hd);
      shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
      shape.lineTo(hw, hd - r);
      shape.quadraticCurveTo(hw, hd, hw - r, hd);
      shape.lineTo(-hw + r, hd);
      shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
      shape.lineTo(-hw, -hd + r);
      shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

      const depth = Math.max(0.12, espessuraGrama - chanfro * 2);
      const g = new THREE.ExtrudeGeometry(shape, {
        depth: depth,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: chanfro,
        bevelThickness: chanfro
      });
      g.rotateX(Math.PI / 2);
      g.center();

      // Mapeamento planar de UVs no topo para texturas procedurais
      const pos = g.attributes.position;
      const uv = g.attributes.uv;
      if (pos && uv) {
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vz = pos.getZ(i);
          uv.setXY(i, (vx + w / 2) / w, (vz + d / 2) / d);
        }
        uv.needsUpdate = true;
      }
      g.computeVertexNormals();
      return g;
    });

    let topoMat;
    if (opts.texturaGrama) {
      const tipoTex = opts.texturaGrama === true ? 'grama' : opts.texturaGrama;
      const tex = Kit3D.texturaProcedural(tipoTex, {
        cor: opts.corTextura,
        repX: opts.repX || Math.max(2, Math.round(w / 4.5)),
        repY: opts.repY || Math.max(2, Math.round(d / 4.5))
      });
      topoMat = Kit3D.mat('toon', 0xffffff, {
        chave: 'ilha_topo_tex_' + tipoTex + '_' + (opts.corTextura || '') + '_' + tex.repeat.x + '_' + tex.repeat.y,
        map: tex
      });
    } else {
      topoMat = Kit3D.mat('toon', corGrama || 0x7eb856);
    }
    const topo = new THREE.Mesh(topoGeo, topoMat);
    topo.position.y = -espessuraGrama / 2;
    topo.receiveShadow = true;
    grp.add(topo);

    // Friso de turfa/musgo denso sob o bisel da grama (acabamento tátil de maquete)
    const frisoGeo = Kit3D.geo(`ilha_friso_${w}_${d}`, () => new THREE.BoxGeometry(w - 0.16, 0.16, d - 0.16));
    const frisoMat = Kit3D.mat('toon', 0x33691e);
    const friso = new THREE.Mesh(frisoGeo, frisoMat);
    friso.position.y = -espessuraGrama - 0.04;
    grp.add(friso);

    // 2. ESTRATOS GEOLÓGICOS DETALHADOS (4 camadas sedimentares com escalonamento natural)
    const hE1 = alturaTerra * 0.30; // Camada 1: Solo Fértil / Húmus com raízes
    const hE2 = alturaTerra * 0.28; // Camada 2: Argila e Terra Vermelha
    const hE3 = alturaTerra * 0.24; // Camada 3: Cascalho e Sedimento Mineral
    const hE4 = alturaTerra * 0.18; // Camada 4: Rocha Matriz Profunda (Bedrock)

    // Estrato 1: Solo fértil
    const e1Geo = Kit3D.geo(`ilha_est1_${w}_${d}`, () => new THREE.BoxGeometry(w - 0.32, hE1, d - 0.32));
    const e1Mat = Kit3D.mat('toon', corTerra || 0x5d4037);
    const e1 = new THREE.Mesh(e1Geo, e1Mat);
    e1.position.y = -espessuraGrama - (hE1 / 2);
    e1.receiveShadow = true;
    grp.add(e1);

    // Estrato 2: Argila e silte mineral
    const e2Geo = Kit3D.geo(`ilha_est2_${w}_${d}`, () => new THREE.BoxGeometry(w - 0.58, hE2, d - 0.58));
    const e2Mat = Kit3D.mat('toon', 0x6d4c41);
    const e2 = new THREE.Mesh(e2Geo, e2Mat);
    e2.position.y = -espessuraGrama - hE1 - (hE2 / 2);
    e2.receiveShadow = true;
    grp.add(e2);

    // Estrato 3: Cascalho e ardósia estratificada
    const e3Geo = Kit3D.geo(`ilha_est3_${w}_${d}`, () => new THREE.BoxGeometry(w - 0.82, hE3, d - 0.82));
    const e3Mat = Kit3D.mat('toon', 0x4a342e);
    const e3 = new THREE.Mesh(e3Geo, e3Mat);
    e3.position.y = -espessuraGrama - hE1 - hE2 - (hE3 / 2);
    grp.add(e3);

    // Estrato 4: Rocha matriz ígnea profunda
    const e4Geo = Kit3D.geo(`ilha_est4_${w}_${d}`, () => new THREE.BoxGeometry(w - 1.08, hE4, d - 1.08));
    const e4Mat = Kit3D.mat('toon', 0x2d1f1d);
    const e4 = new THREE.Mesh(e4Geo, e4Mat);
    e4.position.y = -espessuraGrama - hE1 - hE2 - hE3 - (hE4 / 2);
    grp.add(e4);

    // Pedestal base de exposição de maquete (acabamento elegante tipo museu)
    const baseGeo = Kit3D.geo(`ilha_base_${w}_${d}`, () => new THREE.BoxGeometry(w - 0.75, 0.22, d - 0.75));
    const baseMat = Kit3D.mat('toon', 0x212121);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -espessuraGrama - alturaTerra - 0.11;
    grp.add(baseMesh);

    // 3. FACETAS DE ROCHA E SEIXOS EMBUTIDOS NAS LATERAIS DA TERRA
    // Geometrias low-poly facetadas com variação mineral
    const rochaGeoG = Kit3D.geo('ilha_rocha_g', () => new THREE.DodecahedronGeometry(0.72, 0));
    const rochaGeoM = Kit3D.geo('ilha_rocha_m', () => new THREE.DodecahedronGeometry(0.50, 0));
    const seixoGeoP = Kit3D.geo('ilha_seixo_p', () => new THREE.DodecahedronGeometry(0.28, 0));
    const seixoGeoMicro = Kit3D.geo('ilha_seixo_micro', () => new THREE.IcosahedronGeometry(0.18, 0));

    // Paleta mineral rica
    const matGranito = Kit3D.mat('toon', 0x757575);
    const matArdosia = Kit3D.mat('toon', 0x424242);
    const matArenito = Kit3D.mat('toon', 0x8d6e63);
    const matCalcario = Kit3D.mat('toon', 0xa1887f);
    const matQuartzo = Kit3D.mat('toon', 0xd7ccc8);

    // Formações de facetas de rocha esculpidas nas 4 faces e quinas
    const facetasRochas = [
      // Face +X (Leste)
      { geo: rochaGeoG, mat: matGranito, pos: [w / 2 - 0.12, -espessuraGrama - hE1 * 0.7, -d * 0.28], rot: [0.3, 0.4, 0.2] },
      { geo: rochaGeoM, mat: matArdosia, pos: [w / 2 - 0.16, -espessuraGrama - hE1 - hE2 * 0.5, d * 0.22], rot: [0.5, 0.8, 0.1] },
      { geo: seixoGeoP, mat: matCalcario, pos: [w / 2 - 0.22, -espessuraGrama - hE1 * 0.3, d * 0.05], rot: [0.1, 0.3, 0.5] },
      { geo: seixoGeoMicro, mat: matQuartzo, pos: [w / 2 - 0.24, -espessuraGrama - hE1 * 0.9, -d * 0.1], rot: [0.2, 0.1, 0.4] },
      { geo: rochaGeoM, mat: matArenito, pos: [w / 2 - 0.28, -espessuraGrama - hE1 - hE2 - hE3 * 0.4, -d * 0.2], rot: [0.4, 0.2, 0.6] },

      // Face -X (Oeste)
      { geo: rochaGeoG, mat: matArdosia, pos: [-w / 2 + 0.12, -espessuraGrama - hE1 * 0.8, -d * 0.15], rot: [0.2, 0.5, 0.7] },
      { geo: rochaGeoM, mat: matGranito, pos: [-w / 2 + 0.16, -espessuraGrama - hE1 - hE2 * 0.6, d * 0.28], rot: [0.4, 0.1, 0.3] },
      { geo: seixoGeoP, mat: matArenito, pos: [-w / 2 + 0.22, -espessuraGrama - hE1 * 0.4, d * 0.0], rot: [0.6, 0.3, 0.1] },
      { geo: seixoGeoMicro, mat: matCalcario, pos: [-w / 2 + 0.25, -espessuraGrama - hE1 - hE2 * 0.2, -d * 0.32], rot: [0.1, 0.7, 0.4] },
      { geo: rochaGeoM, mat: matQuartzo, pos: [-w / 2 + 0.30, -espessuraGrama - hE1 - hE2 - hE3 * 0.5, d * 0.15], rot: [0.3, 0.6, 0.2] },

      // Face +Z (Sul)
      { geo: rochaGeoG, mat: matArenito, pos: [w * 0.22, -espessuraGrama - hE1 * 0.75, d / 2 - 0.12], rot: [0.1, 0.6, 0.4] },
      { geo: rochaGeoM, mat: matCalcario, pos: [-w * 0.28, -espessuraGrama - hE1 - hE2 * 0.4, d / 2 - 0.16], rot: [0.5, 0.2, 0.6] },
      { geo: seixoGeoP, mat: matGranito, pos: [w * 0.05, -espessuraGrama - hE1 * 0.35, d / 2 - 0.22], rot: [0.3, 0.4, 0.2] },
      { geo: seixoGeoMicro, mat: matArdosia, pos: [-w * 0.12, -espessuraGrama - hE1 * 0.85, d / 2 - 0.24], rot: [0.7, 0.1, 0.5] },
      { geo: seixoGeoP, mat: matQuartzo, pos: [w * 0.35, -espessuraGrama - hE1 - hE2 * 0.7, d / 2 - 0.28], rot: [0.2, 0.5, 0.3] },

      // Face -Z (Norte)
      { geo: rochaGeoG, mat: matCalcario, pos: [w * 0.18, -espessuraGrama - hE1 * 0.8, -d / 2 + 0.12], rot: [0.4, 0.3, 0.5] },
      { geo: rochaGeoM, mat: matGranito, pos: [-w * 0.24, -espessuraGrama - hE1 - hE2 * 0.5, -d / 2 + 0.16], rot: [0.2, 0.7, 0.1] },
      { geo: seixoGeoP, mat: matArdosia, pos: [-w * 0.05, -espessuraGrama - hE1 * 0.4, -d / 2 + 0.22], rot: [0.5, 0.2, 0.4] },
      { geo: seixoGeoMicro, mat: matArenito, pos: [w * 0.32, -espessuraGrama - hE1 * 0.9, -d / 2 + 0.25], rot: [0.1, 0.4, 0.7] },
      { geo: seixoGeoP, mat: matQuartzo, pos: [-w * 0.38, -espessuraGrama - hE1 - hE2 * 0.6, -d / 2 + 0.28], rot: [0.6, 0.3, 0.2] }
    ];

    facetasRochas.forEach((f) => {
      const m = new THREE.Mesh(f.geo, f.mat);
      m.position.set(f.pos[0], f.pos[1], f.pos[2]);
      m.rotation.set(f.rot[0], f.rot[1], f.rot[2]);
      grp.add(m);
    });

    // 4. Hera e trepadeiras estilizadas caindo sobre as rochas do diorama
    const heraGeo = Kit3D.geo('ilha_hera_folha', () => new THREE.ConeGeometry(0.35, 1.4, 5));
    const heraMat = Kit3D.mat('toon', 0x2e7d32);
    [
      [-w * 0.35, -0.1, d / 2 + 0.05],
      [-w * 0.32, -0.3, d / 2 + 0.05],
      [w * 0.25, -0.15, d / 2 + 0.05],
      [-w / 2 - 0.05, -0.1, -d * 0.15],
      [w / 2 + 0.05, -0.2, d * 0.1],
      [w * 0.18, -0.18, -d / 2 - 0.05],
      [-w * 0.22, -0.25, -d / 2 - 0.05]
    ].forEach(([hx, hy, hz]) => {
      const hera = new THREE.Mesh(heraGeo, heraMat);
      hera.position.set(hx, hy - 0.7, hz);
      hera.rotation.x = Math.PI;
      grp.add(hera);
    });

    return grp;
  };

  /* ===== BEZERRO FOFO PROCEDURAL (PROPORÇÃO INFANTIL) ===== */
  Kit3D.criarBezerro = function (corCorpo, corManchas) {
    const bezerro = new THREE.Group();
    bezerro.scale.set(0.62, 0.62, 0.62);

    const corpoMat = Kit3D.mat('toon', corCorpo || 0xffffff);
    const manchaMat = Kit3D.mat('toon', corManchas || 0x6d4c41);

    const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 2.2), corpoMat);
    corpo.position.y = 1.25;
    corpo.castShadow = true;
    bezerro.add(corpo);

    const mancha = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.72, 0.9), manchaMat);
    mancha.position.set(0, 1.35, 0.2);
    bezerro.add(mancha);

    const cabeca = new THREE.Group();
    cabeca.position.set(0, 1.7, 1.2);

    const cMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.05, 1.1), corpoMat);
    cMesh.castShadow = true;
    cabeca.add(cMesh);

    const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.48, 0.52), Kit3D.mat('toon', 0xffccbc));
    focinho.position.set(0, -0.22, 0.68);
    cabeca.add(focinho);

    const olhoGeo = Kit3D.geo('bezerro_olho', () => new THREE.SphereGeometry(0.16, 8, 8));
    const pupilaGeo = Kit3D.geo('bezerro_pupila', () => new THREE.SphereGeometry(0.09, 8, 8));
    const olhoBranco = Kit3D.mat('basic', 0xffffff);
    const pupilaPreta = Kit3D.mat('basic', 0x111111);

    [-0.52, 0.52].forEach((ox) => {
      const oGrp = new THREE.Group();
      oGrp.position.set(ox, 0.15, 0.42);
      oGrp.add(new THREE.Mesh(olhoGeo, olhoBranco));
      const p = new THREE.Mesh(pupilaGeo, pupilaPreta);
      p.position.set(ox > 0 ? 0.04 : -0.04, 0, 0.08);
      oGrp.add(p);
      cabeca.add(oGrp);
    });

    const orelhaGeo = Kit3D.geo('bezerro_orelha', () => new THREE.ConeGeometry(0.16, 0.5, 6));
    [-0.62, 0.62].forEach((ex) => {
      const o = new THREE.Mesh(orelhaGeo, corpoMat);
      o.position.set(ex, 0.32, 0);
      o.rotation.z = ex > 0 ? -Math.PI / 3.2 : Math.PI / 3.2;
      cabeca.add(o);
    });

    bezerro.add(cabeca);

    const pernaGeo = Kit3D.geo('bezerro_perna', () => new THREE.CylinderGeometry(0.16, 0.16, 0.8, 6));
    [[-0.55, 0.75], [0.55, 0.75], [-0.55, -0.75], [0.55, -0.75]].forEach(([px, pz]) => {
      const p = new THREE.Mesh(pernaGeo, corpoMat);
      p.position.set(px, 0.48, pz);
      p.castShadow = true;
      bezerro.add(p);
    });

    const cauda = new THREE.Group();
    cauda.position.set(0, 1.6, -1.05);
    const caudaHaste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 4), corpoMat);
    caudaHaste.position.set(0, -0.4, -0.15);
    caudaHaste.rotation.x = Math.PI * 0.15;
    cauda.add(caudaHaste);
    const penacho = new THREE.Mesh(new THREE.SphereGeometry(0.14, 5, 5), manchaMat);
    penacho.position.set(0, -0.8, -0.25);
    cauda.add(penacho);
    bezerro.add(cauda);

    bezerro.userData = {
      interativo: true,
      nome: 'Bezerro da fazenda: na pecuária, os bezerros crescem saudáveis junto ao rebanho.',
      cabeca: cabeca,
      cauda: cauda,
      baseHeadY: 1.7,
      tempo: Math.random() * 10
    };
    return bezerro;
  };

  Kit3D.criarGramaInstanciada = function (scene, animaveis, opts) {
    opts = opts || {};
    const count = opts.count || 320;
    const minX = opts.minX != null ? opts.minX : -24;
    const maxX = opts.maxX != null ? opts.maxX : -3;
    const minZ = opts.minZ != null ? opts.minZ : -16;
    const maxZ = opts.maxZ != null ? opts.maxZ : 16;
    const cor = opts.cor || 0x8bc34a;

    const bladeGeo = Kit3D.geo('grama_cone_geo', () => {
      const g = new THREE.ConeGeometry(0.12, 0.7, 4);
      g.translate(0, 0.35, 0);
      return g;
    });
    const bladeMat = Kit3D.mat('toon', cor);
    const iMesh = new THREE.InstancedMesh(bladeGeo, bladeMat, count);
    iMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const data = [];
    let validCount = 0;

    for (let i = 0; i < count; i++) {
      const x = minX + Math.random() * (maxX - minX);
      const z = minZ + Math.random() * (maxZ - minZ);
      if (opts.excluir && opts.excluir(x, z)) continue;

      const s = 0.75 + Math.random() * 0.55;
      const rotY = Math.random() * Math.PI * 2;
      const tiltX = (Math.random() - 0.5) * 0.15;
      dummy.position.set(x, 0.02, z);
      dummy.scale.set(s, s * (0.85 + Math.random() * 0.4), s);
      dummy.rotation.set(tiltX, rotY, 0);
      dummy.updateMatrix();
      iMesh.setMatrixAt(validCount, dummy.matrix);
      data.push({ x, z, s, rotY, tiltX, phase: Math.random() * Math.PI * 2 });
      validCount++;
    }
    iMesh.count = validCount;
    iMesh.instanceMatrix.needsUpdate = true;
    scene.add(iMesh);

    if (animaveis && data.length > 0) {
      animaveis.push((now) => {
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          const wind = Math.sin(now * 2.2 + d.x * 0.35 + d.z * 0.35 + d.phase) * 0.12;
          dummy.position.set(d.x, 0.02, d.z);
          dummy.scale.set(d.s, d.s, d.s);
          dummy.rotation.set(d.tiltX + wind, d.rotY, wind * 0.6);
          dummy.updateMatrix();
          iMesh.setMatrixAt(i, dummy.matrix);
        }
        iMesh.instanceMatrix.needsUpdate = true;
      });
    }
    return iMesh;
  };

  Kit3D.criarMoinhoVento = function (x, z, animaveis) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    // Torre cônica de pedra / madeira
    const torreGeo = Kit3D.geo('moinho_torre', () => new THREE.CylinderGeometry(1.5, 2.3, 6.2, 8));
    const torreMat = Kit3D.mat('toon', 0xf5eedc);
    const torre = new THREE.Mesh(torreGeo, torreMat);
    torre.position.y = 3.1;
    torre.castShadow = true;
    torre.receiveShadow = true;
    grp.add(torre);

    // Porta rústica de madeira
    const porta = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.12), Kit3D.mat('toon', 0x5d4037));
    porta.position.set(0, 0.7, 2.2);
    grp.add(porta);

    // Pequenas janelas na torre
    const janelaMat = Kit3D.mat('toon', 0x37474f);
    const j1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.1), janelaMat);
    j1.position.set(0, 3.8, 1.75);
    grp.add(j1);

    // Teto cônico vermelho/telha
    const tetoGeo = Kit3D.geo('moinho_teto', () => new THREE.ConeGeometry(2.1, 1.9, 8));
    const tetoMat = Kit3D.mat('toon', 0xb71c1c);
    const teto = new THREE.Mesh(tetoGeo, tetoMat);
    teto.position.y = 7.15;
    teto.castShadow = true;
    grp.add(teto);

    // Cubo do rotor
    const rotorHub = new THREE.Group();
    rotorHub.position.set(0, 5.8, 1.7);
    const eixo = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 8), Kit3D.mat('toon', 0x3e2723));
    eixo.rotation.x = Math.PI / 2;
    rotorHub.add(eixo);

    // 4 pás do moinho com moldura e tecido
    const paGrp = new THREE.Group();
    const paVigaMat = Kit3D.mat('toon', 0x4e342e);
    const paTecidoMat = Kit3D.mat('toon', 0xfffde7, { opacity: 0.9, transparent: true });

    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Group();
      arm.rotation.z = (Math.PI / 2) * i;

      // Haste de madeira
      const viga = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.4, 0.12), paVigaMat);
      viga.position.y = 2.2;
      arm.add(viga);

      // Tecido/tela da pá
      const tela = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.2, 0.04), paTecidoMat);
      tela.position.set(0.38, 2.5, 0.02);
      arm.add(tela);

      paGrp.add(arm);
    }
    rotorHub.add(paGrp);
    grp.add(rotorHub);

    if (animaveis) {
      animaveis.push(() => {
        paGrp.rotation.z -= 0.012;
      });
    }

    grp.userData = { interativo: true, paGrp: paGrp, nome: 'Moinho de vento da fazenda, que ajuda nas tarefas do campo.' };
    return grp;
  };

  Kit3D.criarFardoFeno = function (x, z, rotY) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);
    if (rotY) grp.rotation.y = rotY;

    // Fardo cilíndrico de feno dourado
    const fenoGeo = Kit3D.geo('fardo_feno_geo', () => new THREE.CylinderGeometry(0.65, 0.65, 1.3, 10));
    const fenoMat = Kit3D.mat('toon', 0xfbc02d);
    const feno = new THREE.Mesh(fenoGeo, fenoMat);
    feno.rotation.z = Math.PI / 2;
    feno.position.y = 0.65;
    feno.castShadow = true;
    feno.receiveShadow = true;
    grp.add(feno);

    // Amarras de corda rústica
    const cordaMat = Kit3D.mat('toon', 0x6d4c41);
    const cordaGeo = Kit3D.geo('fardo_corda_geo', () => new THREE.TorusGeometry(0.66, 0.035, 4, 16));
    [-0.35, 0.35].forEach((px) => {
      const corda = new THREE.Mesh(cordaGeo, cordaMat);
      corda.position.set(px, 0.65, 0);
      corda.rotation.y = Math.PI / 2;
      grp.add(corda);
    });

    grp.userData = { interativo: true, nome: 'Fardos de feno: alimento nutritivo fornecido no cocho para o gado confinado.' };
    return grp;
  };

  Kit3D.criarLataoLeite = function (x, z) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const metalMat = Kit3D.mat('standard', 0xcfd8dc, { metalness: 0.8, roughness: 0.3 });
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.75, 12), metalMat);
    corpo.position.y = 0.375;
    corpo.castShadow = true;
    grp.add(corpo);

    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 0.28, 12), metalMat);
    cone.position.y = 0.89;
    grp.add(cone);

    const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 10), metalMat);
    tampa.position.y = 1.09;
    grp.add(tampa);

    const alca = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 4, 8), metalMat);
    alca.position.set(0, 1.2, 0);
    alca.rotation.x = Math.PI / 2;
    grp.add(alca);

    grp.userData = { interativo: true, nome: 'Latão de leite: a pecuária fornece matérias-primas e alimentos como leite e carne.' };
    return grp;
  };

  Kit3D.criarLagoDiorama = function (x, z, raioX, raioZ, animaveis) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const rx = raioX || 4.5;
    const rz = raioZ || 3.8;

    // Fundo profundo do lago (gradiente visual de profundidade serena)
    const leitoGeo = new THREE.CylinderGeometry(rx * 0.94, rx * 0.94, 0.1, 24);
    leitoGeo.scale(1, 1, rz / rx);
    const leitoMat = Kit3D.mat('toon', 0x01579b);
    const leito = new THREE.Mesh(leitoGeo, leitoMat);
    leito.position.y = 0.03;
    grp.add(leito);

    // Plano de cáusticas solares refratadas no fundo do lago
    const causticaGeo = new THREE.CircleGeometry(rx * 0.92, 32);
    causticaGeo.scale(1, rz / rx, 1);
    const texCausticaLago = Kit3D.criarTexturaCaustica().clone();
    texCausticaLago.wrapS = THREE.RepeatWrapping;
    texCausticaLago.wrapT = THREE.RepeatWrapping;
    texCausticaLago.repeat.set(2.4, 2.4);
    const causticaMat = new THREE.MeshBasicMaterial({
      map: texCausticaLago,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const causticaMesh = new THREE.Mesh(causticaGeo, causticaMat);
    causticaMesh.rotation.x = -Math.PI / 2;
    causticaMesh.position.y = 0.05;
    grp.add(causticaMesh);

    // Espelho d'água com profundidade translúcida PBR
    const aguaGeo = new THREE.CylinderGeometry(rx, rx, 0.14, 36, 4);
    aguaGeo.scale(1, 1, rz / rx);
    const aguaMat = new THREE.MeshStandardMaterial({
      color: Kit3D.cor(0x29b6f6),
      transparent: true,
      opacity: 0.88,
      roughness: 0.1,
      metalness: 0.15,
      flatShading: false
    });
    const agua = new THREE.Mesh(aguaGeo, aguaMat);
    agua.position.y = 0.08;
    agua.receiveShadow = true;
    grp.add(agua);

    // Anéis de espuma suave (foam) nas margens de contato com as pedras e o solo
    const texEspumaLago = Kit3D.criarTexturaEspuma();
    const foamRingGeo = Kit3D.geo(`lago_espuma_ring_${rx.toFixed(1)}_${rz.toFixed(1)}`, () => {
      const g = new THREE.RingGeometry(rx * 0.88, rx * 1.03, 48);
      g.scale(1, rz / rx, 1);
      return g;
    });
    const foamRingMat = new THREE.MeshBasicMaterial({
      map: texEspumaLago,
      color: Kit3D.cor(0xffffff),
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const foamRingMesh = new THREE.Mesh(foamRingGeo, foamRingMat);
    foamRingMesh.rotation.x = -Math.PI / 2;
    foamRingMesh.position.y = 0.085;
    grp.add(foamRingMesh);

    const posAttr = aguaGeo.attributes.position;
    const origPositions = new Float32Array(posAttr.array);

    // Anéis concêntricos de ondulação sutil na água (ripples suaves)
    const ripples = [];
    const rippleGeo = Kit3D.geo('lago_ripple_ring', () => new THREE.RingGeometry(0.18, 0.32, 28));

    // Emissores de ondas: píer e vitórias-régias
    const emissores = [
      { x: rx * 0.55, z: -rz * 0.28, maxR: 1.8, speed: 0.7, offset: 0 },
      { x: rx * 0.55, z: -rz * 0.28, maxR: 1.8, speed: 0.7, offset: 0.5 },
      { x: -rx * 0.35, z: -rz * 0.25, maxR: 1.4, speed: 0.65, offset: 0.25 }
    ];

    emissores.forEach((em) => {
      const rMat = new THREE.MeshBasicMaterial({
        color: Kit3D.cor(0xe0f7fa),
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const rMesh = new THREE.Mesh(rippleGeo, rMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.position.set(em.x, 0.095, em.z);
      grp.add(rMesh);
      ripples.push({ mesh: rMesh, em: em });
    });

    // Seixos e rochas decorativas na borda do lago com anéis de espuma de contato
    const seixoGeo = Kit3D.geo('lago_seixo', () => new THREE.DodecahedronGeometry(0.38, 0));
    const seixoMat = Kit3D.mat('toon', 0x8d6e63);
    const foamSeixoGeo = Kit3D.geo('lago_foam_seixo', () => new THREE.RingGeometry(0.18, 0.44, 16));
    const seixoFoamMeshes = [];
    const numSeixos = 14;
    for (let i = 0; i < numSeixos; i++) {
      const ang = (i / numSeixos) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const sx = Math.cos(ang) * (rx + (Math.random() - 0.5) * 0.4);
      const sz = Math.sin(ang) * (rz + (Math.random() - 0.5) * 0.4);
      const seixo = new THREE.Mesh(seixoGeo, seixoMat);
      seixo.position.set(sx, 0.15, sz);
      seixo.scale.set(0.8 + Math.random() * 0.5, 0.6, 0.8 + Math.random() * 0.5);
      seixo.castShadow = true;
      grp.add(seixo);

      // Colar de espuma suave de contato na base do seixo
      const sfMat = new THREE.MeshBasicMaterial({
        color: Kit3D.cor(0xffffff),
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const sfMesh = new THREE.Mesh(foamSeixoGeo, sfMat);
      sfMesh.rotation.x = -Math.PI / 2;
      sfMesh.position.set(sx, 0.086, sz);
      grp.add(sfMesh);
      seixoFoamMeshes.push(sfMesh);
    }

    // Vitórias-régias com corte característico em V (fenda de lótus) e flores de água delicadas
    const vitoriaGeo = Kit3D.geo('lago_vitoria_recorte', () => new THREE.CylinderGeometry(0.52, 0.52, 0.025, 20, 1, false, 0.35, Math.PI * 1.84));
    const vitoriaMat = Kit3D.mat('toon', 0x2e7d32);
    const florPetalaGeo = Kit3D.geo('lago_flor_petala', () => new THREE.ConeGeometry(0.08, 0.18, 5));
    const florPetalaMat = Kit3D.mat('toon', 0xf48fb1);
    const florCentroGeo = Kit3D.geo('lago_flor_centro', () => new THREE.SphereGeometry(0.07, 7, 7));
    const florCentroMat = Kit3D.mat('toon', 0xffeb3b);

    const vitorias = [
      [-rx * 0.4, -rz * 0.3],
      [rx * 0.3, rz * 0.35],
      [-rx * 0.2, rz * 0.4]
    ];
    const vitoriaMeshes = [];
    vitorias.forEach(([vx, vz], idx) => {
      const vGrp = new THREE.Group();
      vGrp.position.set(vx, 0.15, vz);
      vGrp.rotation.y = idx * 1.9;

      const folha = new THREE.Mesh(vitoriaGeo, vitoriaMat);
      folha.receiveShadow = true;
      vGrp.add(folha);

      // Flor de água delicada com pétalas e miolo dourado
      if (idx !== 1) {
        const florGrp = new THREE.Group();
        florGrp.position.set(0.05, 0.03, 0.05);

        const miolo = new THREE.Mesh(florCentroGeo, florCentroMat);
        miolo.position.y = 0.08;
        florGrp.add(miolo);

        const numPetalas = 6;
        for (let p = 0; p < numPetalas; p++) {
          const angP = (p / numPetalas) * Math.PI * 2;
          const petala = new THREE.Mesh(florPetalaGeo, florPetalaMat);
          petala.position.set(Math.cos(angP) * 0.09, 0.07, Math.sin(angP) * 0.09);
          petala.rotation.x = Math.sin(angP) * 0.45;
          petala.rotation.z = -Math.cos(angP) * 0.45;
          florGrp.add(petala);
        }
        vGrp.add(florGrp);
      }
      grp.add(vGrp);
      vitoriaMeshes.push(vGrp);
    });

    // Píerzinho de madeira rústica
    const pier = new THREE.Group();
    pier.position.set(rx * 0.75, 0, -rz * 0.4);
    pier.rotation.y = -Math.PI / 4;
    const pranchaGeo = Kit3D.geo('lago_prancha', () => new THREE.BoxGeometry(1.6, 0.08, 0.45));
    const pranchaMat = Kit3D.mat('toon', 0x795548);
    for (let p = 0; p < 3; p++) {
      const prancha = new THREE.Mesh(pranchaGeo, pranchaMat);
      prancha.position.set(0, 0.26, p * 0.5 - 0.5);
      prancha.castShadow = true;
      pier.add(prancha);
    }
    const estacaGeo = Kit3D.geo('lago_estaca', () => new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6));
    [[-0.7, 0.4], [0.7, 0.4]].forEach(([ex, ez]) => {
      const est = new THREE.Mesh(estacaGeo, pranchaMat);
      est.position.set(ex, 0.2, ez);
      est.castShadow = true;
      pier.add(est);
    });
    grp.add(pier);

    const animLago = (now) => {
      if (reduzirMovimento) return;

      // Ondulação com múltiplas harmônicas senoidais para movimento orgânico
      for (let i = 0; i < posAttr.count; i++) {
        const py = origPositions[i * 3 + 1];
        if (py >= 0) {
          const px = origPositions[i * 3];
          const pz = origPositions[i * 3 + 2];
          const dNorm = Math.sqrt((px / rx) * (px / rx) + (pz / rz) * (pz / rz));
          // Harmônica 1: onda radial primária expansiva
          const wave1 = Math.sin(dNorm * 5.4 - now * 2.2) * 0.020;
          // Harmônica 2: ondulação oblíqua induzida pela brisa
          const wave2 = Math.cos(px * 0.85 + pz * 0.65 + now * 1.5) * 0.012;
          // Harmônica 3: ressonância transversal secundária
          const wave3 = Math.sin((px * 1.25 - pz * 1.05) + now * 2.6) * 0.007;
          // Harmônica 4: micro-rugosidade capilar da superfície
          const wave4 = Math.cos((px * 2.1 + pz * 1.9) - now * 3.4) * 0.0035;
          // Harmônica 5: modulação de choque nas margens com pedras
          const wave5 = Math.sin(dNorm * 8.5 - now * 2.8) * 0.004 * dNorm;
          posAttr.array[i * 3 + 1] = py + wave1 + wave2 + wave3 + wave4 + wave5;
        }
      }
      posAttr.needsUpdate = true;
      aguaGeo.computeVertexNormals();

      // Deriva suave das cáusticas solares refratadas no leito
      texCausticaLago.offset.x = (Math.sin(now * 0.35) * 0.08 + now * 0.02) % 1.0;
      texCausticaLago.offset.y = (Math.cos(now * 0.30) * 0.08 + now * 0.015) % 1.0;
      causticaMat.opacity = 0.26 + Math.sin(now * 1.9) * 0.08;

      // Respiração e ondulação dos anéis de espuma de margem
      const pulsoEspumaLago = Math.sin(now * 1.6) * 0.10;
      foamRingMat.opacity = 0.50 + pulsoEspumaLago;
      const escalaEspuma = 1.0 + Math.sin(now * 1.8) * 0.015;
      foamRingMesh.scale.set(escalaEspuma, escalaEspuma, 1);
      seixoFoamMeshes.forEach((sf, idx) => {
        sf.material.opacity = 0.40 + Math.sin(now * 2.0 + idx * 0.7) * 0.12;
      });

      // Ondas concêntricas (ripples) que se expandem suavemente
      ripples.forEach((r) => {
        const prog = (now * r.em.speed + r.em.offset) % 1.0;
        const escala = 1.0 + prog * (r.em.maxR / 0.3);
        r.mesh.scale.set(escala, escala, 1);
        r.mesh.material.opacity = (1.0 - prog) * 0.42;
      });

      // Flutuação orgânica das vitórias-régias com pitch e roll
      vitoriaMeshes.forEach((vm, i) => {
        vm.position.y = 0.15 + Math.sin(now * 1.8 + i * 1.9) * 0.022;
        vm.rotation.x = Math.sin(now * 1.4 + i * 1.5) * 0.032;
        vm.rotation.z = Math.cos(now * 1.6 + i * 1.7) * 0.032;
        vm.rotation.y += 0.002;
      });
    };

    if (animaveis) {
      animaveis.push(animLago);
    } else {
      grp.userData.animFn = animLago;
    }

    grp.userData = { interativo: true, nome: 'Lago de Água Fresca no Pasto', animFn: animLago };
    return grp;
  };
  Kit3D.criarLago = Kit3D.criarLagoDiorama;

  Kit3D.criarTexturaParticulaSuave = function () {
    if (Kit3D._texParticulaSuave) return Kit3D._texParticulaSuave;
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.28, 'rgba(255, 250, 225, 0.88)');
    grad.addColorStop(0.62, 'rgba(255, 220, 150, 0.35)');
    grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    Kit3D._texParticulaSuave = tex;
    return tex;
  };

  Kit3D.criarParticulasAmbiente = function (scene, animaveis, config) {
    config = config || {};
    const count = (config.count && config.count >= 40 && config.count <= 60)
      ? config.count
      : (isMobile ? 42 : 54); // Entre 40 e 60 partículas suaves de alto desempenho

    const bounds = config.bounds || {
      minX: -26,
      maxX: 26,
      minY: 0.6,
      maxY: 13,
      minZ: -24,
      maxZ: 24
    };

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const pData = [];

    // Paleta serena TEA: pólen dourado de flores silvestres e feixes de sol quentes (sem aspecto de neve)
    const corPolen = new THREE.Color(0xffb74d);    // Âmbar suave
    const corMagica = new THREE.Color(0xffd54f);   // Dourado solar quente
    const corDourada = new THREE.Color(0xffa000);  // Ouro âmbar rico
    const corAguaLuz = new THREE.Color(0xffca28);  // Reflexo dourado

    for (let i = 0; i < count; i++) {
      const isDourada = i >= Math.floor(count * 0.72); // ~28% de partículas douradas quentes perto do solo/luz/água
      let x, y, z;
      if (isDourada) {
        x = (Math.random() - 0.5) * 36;
        y = 0.8 + Math.random() * 4.2;
        z = (Math.random() - 0.5) * 32;
      } else {
        x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
        y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
        z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      let c;
      if (isDourada) {
        c = (i % 2 === 0) ? corDourada : corAguaLuz;
      } else {
        c = (i % 2 === 0) ? corPolen : corMagica;
      }

      if (usarSRGB) {
        const cLin = c.clone().convertSRGBToLinear();
        colors[i * 3] = cLin.r;
        colors[i * 3 + 1] = cLin.g;
        colors[i * 3 + 2] = cLin.b;
      } else {
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      pData.push({
        x: x,
        y: y,
        z: z,
        vx: 0.28 + Math.random() * 0.35, // Deriva suave do vento na direção X
        vy: (Math.random() - 0.5) * 0.12,
        vz: 0.12 + Math.random() * 0.25, // Leve componente oblíquo em Z
        phase: Math.random() * Math.PI * 2,
        freq: 0.7 + Math.random() * 0.7,
        isDourada: isDourada
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 0.48 : 0.58,
      map: Kit3D.criarTexturaParticulaSuave(),
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geom, mat);
    points.userData = { interativo: false };
    if (scene) scene.add(points);

    let lastTime = 0;
    const animParticulas = function (now) {
      if (reduzirMovimento) return;
      const dt = lastTime ? Math.min(now - lastTime, 0.08) : 0.016;
      lastTime = now;
      const posArr = geom.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const p = pData[i];

        // Voo senoidal orgânico da brisa (vento lento, suave e harmônico)
        const windDriftX = Math.sin(now * p.freq + p.phase) * 0.26;
        const windDriftZ = Math.cos(now * p.freq * 0.88 + p.phase) * 0.22;
        const bobY = Math.sin(now * p.freq * 1.35 + p.phase) * 0.14;

        p.x += (p.vx + windDriftX * 0.35) * dt * 1.6;
        p.y += (p.vy + bobY * 0.3) * dt * 1.2;
        p.z += (p.vz + windDriftZ * 0.35) * dt * 1.6;

        // Wrap around bounds com custo computacional zero
        if (p.x > bounds.maxX) p.x = bounds.minX;
        else if (p.x < bounds.minX) p.x = bounds.maxX;

        if (p.y > bounds.maxY) p.y = bounds.minY;
        else if (p.y < bounds.minY) p.y = bounds.maxY;

        if (p.z > bounds.maxZ) p.z = bounds.minZ;
        else if (p.z < bounds.minZ) p.z = bounds.maxZ;

        posArr[i * 3] = p.x;
        posArr[i * 3 + 1] = p.y;
        posArr[i * 3 + 2] = p.z;
      }

      geom.attributes.position.needsUpdate = true;
    };

    if (animaveis) {
      animaveis.push(animParticulas);
    } else {
      points.userData.animFn = animParticulas;
    }

    return points;
  };

  Kit3D.criarParticulasSol = Kit3D.criarParticulasAmbiente;

  Kit3D.criarEstabuloPremium = function (w, h, d, animaveis) {
    const grp = new THREE.Group();
    const l = w || 12;
    const alt = h || 5.5;
    const prof = d || 10;

    // Paredes vermelhas de celeiro tradicional (Barn Red)
    const corpoGeo = Kit3D.geo(`est_corpo_${l}_${prof}`, () => new THREE.BoxGeometry(l, alt, prof));
    const corpoMat = Kit3D.mat('toon', 0xb71c1c);
    const corpo = new THREE.Mesh(corpoGeo, corpoMat);
    corpo.position.y = alt / 2;
    corpo.castShadow = true;
    corpo.receiveShadow = true;
    grp.add(corpo);

    // Molduras brancas nas quinas
    const molduraMat = Kit3D.mat('toon', 0xffffff);
    const quinaGeo = Kit3D.geo('est_quina', () => new THREE.BoxGeometry(0.2, alt + 0.1, 0.2));
    [
      [-l / 2, prof / 2], [l / 2, prof / 2],
      [-l / 2, -prof / 2], [l / 2, -prof / 2]
    ].forEach(([qx, qz]) => {
      const quina = new THREE.Mesh(quinaGeo, molduraMat);
      quina.position.set(qx, alt / 2, qz);
      grp.add(quina);
    });

    // Telhado duplo em duas águas inclinado (Gambrel Roof)
    const telhadoMat = Kit3D.mat('toon', 0x37474f);
    const tetoBaseGeo = Kit3D.geo(`est_teto_${l}_${prof}`, () => new THREE.ConeGeometry(prof * 0.72, alt * 0.55, 4));
    const teto = new THREE.Mesh(tetoBaseGeo, telhadoMat);
    teto.position.set(0, alt + (alt * 0.25), 0);
    teto.rotation.y = Math.PI / 4;
    teto.scale.set(l / prof * 0.95, 1, 1);
    teto.castShadow = true;
    grp.add(teto);

    // Entrada ampla aberta com vigas de suporte
    const vigaMat = Kit3D.mat('toon', 0x5d4037);
    const vigaGeo = Kit3D.geo('est_viga', () => new THREE.BoxGeometry(0.35, alt * 0.75, 0.35));
    [-l * 0.28, l * 0.28].forEach((vx) => {
      const v = new THREE.Mesh(vigaGeo, vigaMat);
      v.position.set(vx, (alt * 0.75) / 2, prof / 2 + 0.15);
      v.castShadow = true;
      grp.add(v);
    });

    // Travessão superior da entrada
    const vigaTopo = new THREE.Mesh(new THREE.BoxGeometry(l * 0.65, 0.35, 0.35), vigaMat);
    vigaTopo.position.set(0, alt * 0.75, prof / 2 + 0.15);
    grp.add(vigaTopo);

    // Portões laterais com travessa "X" branca clássica
    const portaoMat = Kit3D.mat('toon', 0x8e0000);
    [-l * 0.38, l * 0.38].forEach((px) => {
      const porta = new THREE.Mesh(new THREE.BoxGeometry(l * 0.22, alt * 0.65, 0.12), portaoMat);
      porta.position.set(px, (alt * 0.65) / 2, prof / 2 + 0.08);
      grp.add(porta);

      const x1 = new THREE.Mesh(new THREE.BoxGeometry(l * 0.25, 0.1, 0.14), molduraMat);
      x1.position.set(px, (alt * 0.65) / 2, prof / 2 + 0.1);
      x1.rotation.z = Math.PI / 4;
      grp.add(x1);
      const x2 = new THREE.Mesh(new THREE.BoxGeometry(l * 0.25, 0.1, 0.14), molduraMat);
      x2.position.set(px, (alt * 0.65) / 2, prof / 2 + 0.1);
      x2.rotation.z = -Math.PI / 4;
      grp.add(x2);
    });

    // Janela do sótão de feno
    const sotao = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.15), Kit3D.mat('toon', 0x212121));
    sotao.position.set(0, alt * 0.88, prof / 2 + 0.05);
    grp.add(sotao);

    // Feno dourado saindo do sótão
    const fenoSotao = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), Kit3D.mat('toon', 0xfbc02d));
    fenoSotao.position.set(0, alt * 0.8, prof / 2 + 0.4);
    grp.add(fenoSotao);

    // Lanterna na entrada
    const lanterna = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), Kit3D.mat('phong', 0xffb74d, { emissive: 0xffa000, emissiveIntensity: 0.8 }));
    lanterna.position.set(0, alt * 0.72, prof / 2 + 0.4);
    grp.add(lanterna);

    // Chaminé com fumaça animada
    const chamine = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.7), Kit3D.mat('toon', 0x616161));
    chamine.position.set(l * 0.28, alt + 1.2, -prof * 0.2);
    grp.add(chamine);

    const fumacaGeo = Kit3D.geo('est_fumaca', () => new THREE.SphereGeometry(0.28, 6, 6));
    const fumacaMat = Kit3D.mat('toon', 0xffffff, { transparent: true, opacity: 0.75 });
    const fumacas = [];
    for (let f = 0; f < 3; f++) {
      const pFumaca = new THREE.Mesh(fumacaGeo, fumacaMat);
      pFumaca.position.set(l * 0.28, alt + 2.2 + f * 0.7, -prof * 0.2);
      grp.add(pFumaca);
      fumacas.push({ mesh: pFumaca, offset: f * 1.4 });
    }

    if (animaveis) {
      animaveis.push((now) => {
        fumacas.forEach((f) => {
          const y = (alt + 2.2) + ((now * 1.5 + f.offset) % 2.5);
          f.mesh.position.y = y;
          const prog = (y - (alt + 2.2)) / 2.5;
          const s = 0.7 + prog * 1.1;
          f.mesh.scale.set(s, s, s);
          f.mesh.position.x = l * 0.28 + Math.sin(now + f.offset) * 0.25;
        });
      });
    }

    // Cocho de alimentação longo para o gado confinado
    const cochoGeo = Kit3D.geo('est_cocho', () => new THREE.BoxGeometry(l * 0.55, 0.8, 1.2));
    const cocho = new THREE.Mesh(cochoGeo, Kit3D.mat('toon', 0x5d4037));
    cocho.position.set(0, 0.4, prof / 2 + 2.2);
    cocho.castShadow = true;
    cocho.receiveShadow = true;
    grp.add(cocho);

    const fenoCocho = new THREE.Mesh(new THREE.BoxGeometry(l * 0.52, 0.45, 0.95), Kit3D.mat('toon', 0xfbc02d));
    fenoCocho.position.set(0, 0.65, prof / 2 + 2.2);
    grp.add(fenoCocho);

    grp.userData = { interativo: true, nome: 'Estábulo: na pecuária intensiva, os animais ficam confinados e recebem alimentação balanceada.' };
    return grp;
  };

  /* ===== SOMBRA DE CONTATO RADIAL (AMBIENT OCCLUSION SUAVE) ===== */
  // Mantém retrocompatibilidade delegando para o gerador de alta definição definido no início do módulo
  Kit3D.criarSombraDeContato = Kit3D.criarSombraContato;

  /* ===== BORBOLETAS ANIMADAS VIVAS EM VOO SENOIDAL ===== */
  Kit3D.criarBorboletas = function (scene, animaveis, centroX, centroZ, raio, count) {
    const grp = new THREE.Group();
    const qtd = count || 3;
    const asasGeo = Kit3D.geo('borboleta_asa', () => new THREE.PlaneGeometry(0.24, 0.18));
    const cores = [0xffd54f, 0x4fc3f7, 0xff80ab];
    const borboletas = [];

    for (let i = 0; i < qtd; i++) {
      const bGrp = new THREE.Group();
      const cor = cores[i % cores.length];
      const mat = Kit3D.mat('basic', cor, { side: THREE.DoubleSide });

      const asaEsq = new THREE.Mesh(asasGeo, mat);
      asaEsq.position.x = -0.12;
      bGrp.add(asaEsq);

      const asaDir = new THREE.Mesh(asasGeo, mat);
      asaDir.position.x = 0.12;
      bGrp.add(asaDir);

      bGrp.position.set(
        centroX + (Math.random() - 0.5) * (raio || 6),
        1.2 + Math.random() * 1.5,
        centroZ + (Math.random() - 0.5) * (raio || 6)
      );

      grp.add(bGrp);
      borboletas.push({
        grp: bGrp,
        asaEsq,
        asaDir,
        baseX: bGrp.position.x,
        baseZ: bGrp.position.z,
        baseY: bGrp.position.y,
        fase: Math.random() * Math.PI * 2,
        vel: 1.4 + Math.random() * 0.8
      });
    }
    scene.add(grp);

    if (animaveis) {
      animaveis.push((now) => {
        borboletas.forEach((b) => {
          const flap = Math.sin(now * 18 + b.fase) * 0.7;
          b.asaEsq.rotation.y = flap;
          b.asaDir.rotation.y = -flap;

          b.grp.position.x = b.baseX + Math.sin(now * b.vel + b.fase) * 2.4;
          b.grp.position.z = b.baseZ + Math.cos(now * b.vel * 0.7 + b.fase) * 2.4;
          b.grp.position.y = b.baseY + Math.sin(now * 3 + b.fase) * 0.4;
          b.grp.rotation.y = Math.atan2(
            Math.cos(now * b.vel + b.fase) * 2.4,
            -Math.sin(now * b.vel * 0.7 + b.fase) * 2.4 * 0.7
          );
        });
      });
    }
    return grp;
  };

  /* ===== CÉU DINÂMICO COM SHADER DE GRADIENTE ===== */
  Kit3D.criarCeuDinamico = function (corTopo, corBase) {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec2 vUv;
      void main() {
        float h = normalize(vUv + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    const uniforms = {
      topColor: { value: new THREE.Color(corTopo || 0x0077ff) },
      bottomColor: { value: new THREE.Color(corBase || 0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };

    const skyGeo = new THREE.SphereGeometry(400, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    return sky;
  };

  /* ===== SHADER DE DESTAQUE (OUTLINE) ===== */
  Kit3D.criarOutlineShader = function (corDestaque) {
    const vertexShader = `
      uniform float thickness;
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * thickness, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(color, 1.0) * intensity;
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        thickness: { value: 0.03 },
        color: { value: new THREE.Color(corDestaque || 0xffd54f) }
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  };

  /* ===== TEXTURA PROCEDURAL PARA FEIXE VOLUMÉTRICO SUAVE ===== */
  Kit3D.criarTexturaFeixe = function () {
    if (Kit3D._texFeixe) return Kit3D._texFeixe;
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext('2d');
    // Gradiente vertical para queda suave (falloff) sem cortes secos nas bordas
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.00, 'rgba(255, 255, 255, 0.75)');
    grad.addColorStop(0.08, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.72)');
    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.38)');
    grad.addColorStop(0.80, 'rgba(255, 255, 255, 0.14)');
    grad.addColorStop(0.96, 'rgba(255, 255, 255, 0.02)');
    grad.addColorStop(1.00, 'rgba(255, 255, 255, 0.00)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    Kit3D._texFeixe = tex;
    texturaCache.set('feixe_volumetrico', tex);
    return tex;
  };

  /* ===== FEIXE DE LUZ VOLUMÉTRICO SUAVE (Cones para postes, projetores e faróis) ===== */
  Kit3D.criarFeixeLuzVolumetrico = function (raioTopo, raioBase, altura, cor, opacidade) {
    let rt = 0.2;
    let rb = 2.4;
    let h = 6.0;
    let c = 0xfff8e7;
    let op = 0.22;
    let opts = {};

    if (typeof raioTopo === 'object' && raioTopo !== null) {
      opts = raioTopo;
      rt = opts.raioTopo != null ? opts.raioTopo : rt;
      rb = opts.raioBase != null ? opts.raioBase : rb;
      h = opts.altura != null ? opts.altura : h;
      c = opts.cor != null ? opts.cor : c;
      op = opts.opacidade != null ? opts.opacidade : op;
    } else {
      if (raioTopo != null) rt = raioTopo;
      if (raioBase != null) rb = raioBase;
      if (altura != null) h = altura;
      if (cor != null) c = cor;
      if (opacidade != null) op = opacidade;
    }

    // Cilindro cônico aberto nas extremidades
    const geo = new THREE.CylinderGeometry(rt, rb, h, 24, 1, true);
    // Posiciona o pivô no topo do feixe luminoso (y = 0), projetando para baixo (-y)
    geo.translate(0, -h / 2, 0);

    const texGrad = (opts.suave !== false) ? Kit3D.criarTexturaFeixe() : null;

    const mat = new THREE.MeshBasicMaterial({
      color: Kit3D.cor(c),
      map: texGrad || null,
      transparent: true,
      opacity: Math.min(Math.max(op, 0.02), 0.8),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 3;

    // Núcleo interno opcional mais denso para maior tridimensionalidade fotográfica
    if (opts.nucleo) {
      const geoCore = new THREE.CylinderGeometry(rt * 0.55, rb * 0.42, h * 0.94, 18, 1, true);
      geoCore.translate(0, -h * 0.94 / 2, 0);
      const matCore = new THREE.MeshBasicMaterial({
        color: Kit3D.cor(c),
        map: texGrad || null,
        transparent: true,
        opacity: Math.min(Math.max(op * 1.35, 0.04), 0.85),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const coreMesh = new THREE.Mesh(geoCore, matCore);
      coreMesh.renderOrder = 4;
      mesh.add(coreMesh);
    }

    // Ponto de luz sutil opcional no topo do feixe
    if (opts.comLuz || opts.luzPonto) {
      const pLight = new THREE.PointLight(
        Kit3D.cor(c),
        opts.luzIntensidade != null ? opts.luzIntensidade : 0.8,
        opts.luzDistancia != null ? opts.luzDistancia : (h * 1.8)
      );
      mesh.add(pLight);
    }

    // Orientação para faróis (horizontal +Z) ou postes (padrão -Y)
    if (opts.tipo === 'farol' || opts.direcao === 'frente' || opts.horizontal) {
      mesh.rotation.x = Math.PI / 2;
    }
    if (typeof opts.inclinacao === 'number') {
      mesh.rotation.x += opts.inclinacao;
    }

    return mesh;
  };

  /* Helper conveniente para feixe de farol de veículos (trator, caminhão, bonde) */
  Kit3D.criarFeixeFarol = function (opts) {
    opts = opts || {};
    return Kit3D.criarFeixeLuzVolumetrico(Object.assign({
      raioTopo: 0.16,
      raioBase: 1.15,
      altura: 4.8,
      cor: 0xfff9c4,
      opacidade: 0.18,
      tipo: 'farol',
      direcao: 'frente'
    }, opts));
  };

  /* Helper conveniente para feixe de poste de iluminação pública ou mina */
  Kit3D.criarFeixePoste = function (opts) {
    opts = opts || {};
    return Kit3D.criarFeixeLuzVolumetrico(Object.assign({
      raioTopo: 0.22,
      raioBase: 2.3,
      altura: 5.8,
      cor: 0xfff8e7,
      opacidade: 0.20,
      tipo: 'poste',
      direcao: 'baixo'
    }, opts));
  };

  /* ===== PULSAÇÃO ORGÂNICA DE LUZ (Lanternas rústicas, cristais, fogueiras e brilho d'água) ===== */
  Kit3D.adicionarPulsacaoLuz = function (pointLight, freq, minInt, maxInt, animaveis) {
    if (!pointLight) return null;
    const f = freq != null ? freq : 1.6;
    const min = minInt != null ? minInt : 0.65;
    const max = maxInt != null ? maxInt : 1.25;
    const offset = Math.random() * Math.PI * 2;

    const anim = function (now) {
      if (!pointLight) return;
      if (reduzirMovimento) {
        pointLight.intensity = (min + max) * 0.5;
        return;
      }
      const t = typeof now === 'number' ? now : performance.now() * 0.001;
      // Variação senoidal ultra-suave, relaxante e serena para TEA (sem estroboscopia ou flashes)
      const onda = (Math.sin(t * f + offset) + 1) * 0.5;
      pointLight.intensity = min + onda * (max - min);
    };

    if (!pointLight.userData) pointLight.userData = {};
    pointLight.userData.animFn = anim;

    const lista = Array.isArray(animaveis)
      ? animaveis
      : (Array.isArray(Kit3D._animaveisAtivos) ? Kit3D._animaveisAtivos : null);

    if (lista) {
      lista.push(anim);
      pointLight.userData._animFnRegistrada = true;
    }

    return anim;
  };

  /* ===== SOL ATMOSFÉRICO COM CORONA MULTI-CAMADAS E BLENDING ADITIVO ===== */
  Kit3D.criarSolAtmosferico = function (scene, solPos, opts) {
    opts = opts || {};
    const grp = new THREE.Group();
    const pos = solPos || [28, 26, 14];
    const mult = opts.mult != null ? opts.mult : 1.8;
    grp.position.set(pos[0] * mult, pos[1] * mult, pos[2] * mult);

    const raioBase = opts.raio || 4.2;

    // 1. Núcleo solar (disco radiante em tom amarelo/dourado pastel suave)
    const coreGeo = Kit3D.geo('sol_core_geo', () => new THREE.SphereGeometry(raioBase, 16, 12));
    const coreMat = new THREE.MeshBasicMaterial({
      color: Kit3D.cor(opts.corCore || 0xfffae8),
      fog: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    grp.add(coreMesh);

    // 2. Halo coronal interno (brilho suave com AdditiveBlending)
    const halo1Geo = Kit3D.geo('sol_halo1_geo', () => new THREE.SphereGeometry(raioBase * 1.5, 16, 12));
    const halo1Mat = new THREE.MeshBasicMaterial({
      color: Kit3D.cor(opts.corHalo1 || 0xffe082),
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });
    const halo1Mesh = new THREE.Mesh(halo1Geo, halo1Mat);
    grp.add(halo1Mesh);

    // 3. Halo coronal intermediário (difusão dourada serena)
    const halo2Geo = Kit3D.geo('sol_halo2_geo', () => new THREE.SphereGeometry(raioBase * 2.3, 16, 12));
    const halo2Mat = new THREE.MeshBasicMaterial({
      color: Kit3D.cor(opts.corHalo2 || 0xffd54f),
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });
    const halo2Mesh = new THREE.Mesh(halo2Geo, halo2Mat);
    grp.add(halo2Mesh);

    // 4. Halo atmosférico exterior ultra-suave (esfumaçado nos limites celestes)
    const halo3Geo = Kit3D.geo('sol_halo3_geo', () => new THREE.SphereGeometry(raioBase * 3.5, 16, 12));
    const halo3Mat = new THREE.MeshBasicMaterial({
      color: Kit3D.cor(opts.corHalo3 || 0xffca28),
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });
    const halo3Mesh = new THREE.Mesh(halo3Geo, halo3Mat);
    grp.add(halo3Mesh);

    if (scene) scene.add(grp);
    return grp;
  };

  /* ===== MOTOR DO JOGO E MÁQUINA DE ESTADOS ===== */
  Kit3D.iniciar = function (cfg) {
    const container = document.getElementById('container3d');
    const canvas = document.getElementById('canvas3d');
    const tooltipEl = document.getElementById('hudTooltip');

    // Previne conflitos de gestos do navegador (pull-to-refresh, rolagem de página acidental)
    if (canvas) {
      canvas.style.touchAction = 'none';
    }
    if (container) {
      container.style.touchAction = 'none';
    }

    /* ===== MODO "COR VIVA" (opt-in, declarado em cfg.visual pelo tópico) =====
       Sem cfg.visual, tudo o que vem abaixo se comporta como antes. Com cfg.visual.cor = true
       o kit: converte cores sRGB -> linear, usa céu em vertex colors, névoa casada com o céu,
       nuvens em sprite, luz configurável e sombra de contato; e desliga o EffectComposer
       (a cena vai direto pro canvas, mantendo o sRGB correto e o MSAA do antialias ativo). */
    const vis = cfg.visual || null;
    usarSRGB = !!(vis && vis.cor);
    reduzirMovimento = !!((vis && vis.semMovimento) ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));

    // Inicialização da Cena Three.js
    const scene = new THREE.Scene();
    Kit3D._cenaAtiva = scene;
    const toquesFlutuantes = [];
    Kit3D._toquesAtivos = toquesFlutuantes;
    const skyTopo = (vis && vis.ceu && vis.ceu.topo) || cfg.skyTopo || '#e3f2fd';
    const skyMeio = (vis && vis.ceu && vis.ceu.meio) || '#f1f8e9';
    const skyBase = (vis && vis.ceu && vis.ceu.base) || cfg.skyBase || '#fff8e1';
    scene.background = Kit3D.cor(skyTopo);

    // Cúpula atmosférica de céu suave com gradiente procedural de 3 paradas
    const skyMesh = Kit3D.criarCupulaAtmosferica(scene, {
      corTopo: skyTopo,
      corMeio: skyMeio,
      corHorizonte: skyBase,
      corAbaixo: (vis && vis.ceu && vis.ceu.abaixo) != null ? vis.ceu.abaixo : '#e8f5e9',
      raio: (vis && vis.raioCeu) || 380,
      nevoa: false
    });

    const nev = (vis && vis.nevoa) || null;
    if (nev && nev.perto != null && nev.longe != null) {
      scene.fog = new THREE.Fog(
        Kit3D.cor(nev.cor || 0xf0fdf4),
        nev.perto,
        nev.longe
      );
    } else {
      scene.fog = new THREE.FogExp2(
        Kit3D.cor((nev && nev.cor) || 0xf0fdf4),
        (nev && nev.densidade) || 0.0055
      );
    }

    let cameraHasDragged = false;
    let rotVelocity = 0;
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, (vis && vis.cameraFar) || 500);
    const targetCamPos = new THREE.Vector3(0, 22, 34);
    const targetLookAt = new THREE.Vector3(0, 2, 0);
    const currentLookAt = new THREE.Vector3(0, 2, 0);

    function atualizarFovCamera(forcarPosicao) {
      if (!container || !camera) return;
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 1);
      const aspect = width / height;
      camera.aspect = aspect;

      const viewportH = (window.visualViewport && window.visualViewport.height) || window.innerHeight || height;
      const isMobileLandscape = (aspect > 1.2) && (viewportH < 520 || height < 520 || (isMobile && height < 560));
      const isNarrowPortrait = aspect < 0.65;

      // Obtém dimensões do diorama para garantir enquadramento perfeito (4 cantos + formas flutuantes)
      let ilhaW = 64;
      let ilhaD = 44;
      if (scene) {
        scene.traverse((obj) => {
          if (obj.userData && obj.userData.isIlhaDiorama) {
            if (obj.userData.largura) ilhaW = Math.max(ilhaW, obj.userData.largura);
            if (obj.userData.profundidade) ilhaD = Math.max(ilhaD, obj.userData.profundidade);
          }
        });
      }
      const hw = ilhaW * 0.5 + 2.5; // raio com margem de segurança de rochas e vegetação
      const hd = ilhaD * 0.5 + 2.5;

      if (isMobileLandscape) {
        // Enquadramento inteligente em paisagem móvel:
        // Enquadra a maquete perfeitamente na metade esquerda da tela usando setViewOffset
        camera.setViewOffset(width, height, width * 0.25, 0, width, height);

        // Compensação de FOV e altura para baixa altura de tela
        camera.fov = 42;

        if (!cameraHasDragged || forcarPosicao) {
          const fovRad = (camera.fov * Math.PI) / 180;
          const tanHalfFov = Math.tan(fovRad / 2);
          const aspectEfetivo = aspect * 0.5;

          const distHoriz = hw / (tanHalfFov * aspectEfetivo * 0.88);
          const distVert = (hd * 0.75 + 8) / (tanHalfFov * 0.88);
          const distNecessaria = Math.max(distHoriz, distVert, 36);

          const pitchRad = (30 * Math.PI) / 180;
          const camY = 2 + distNecessaria * Math.sin(pitchRad);
          const camZ = distNecessaria * Math.cos(pitchRad);

          targetLookAt.set(0, 2, -1);
          targetCamPos.set(0, camY, camZ);
          if (forcarPosicao) {
            camera.position.copy(targetCamPos);
            currentLookAt.copy(targetLookAt);
          }
        }
      } else {
        camera.clearViewOffset();

        if (isNarrowPortrait) {
          // Em smartphones verticais estreitos (aspect < 0.65, ex: 390x844, 360x800):
          // Calcula distância e recuo exatos em tempo real para 100% da ilha, 4 cantos e formas flutuantes ficarem visíveis sem corte
          const fovRadPadrao = (45 * Math.PI) / 180;
          const targetHalfWidth = Math.tan(fovRadPadrao / 2) * 1.35;
          const newFov = 2 * Math.atan(targetHalfWidth / aspect) * (180 / Math.PI);
          camera.fov = Math.min(Math.max(newFov, 48), 64);

          const fovRad = (camera.fov * Math.PI) / 180;
          const tanHalfFov = Math.tan(fovRad / 2);

          const pitchRad = (36 * Math.PI) / 180;
          const sinPitch = Math.sin(pitchRad);
          const cosPitch = Math.cos(pitchRad);

          // Pontos limites críticos: 4 cantos da ilha + formas geométricas flutuantes (Y=12 a 14) + base inferior
          const pontosLimites = [
            [-hw, 0, -hd],
            [hw, 0, -hd],
            [hw, 0, hd],
            [-hw, 0, hd],
            [-hw * 0.82, 13.5, -hd * 0.82],
            [hw * 0.82, 13.5, -hd * 0.82],
            [hw * 0.82, 13.5, hd * 0.82],
            [-hw * 0.82, 13.5, hd * 0.82],
            [0, 14.0, 0],
            [-hw * 0.9, -4.5, hd * 0.9],
            [hw * 0.9, -4.5, hd * 0.9]
          ];

          const margemSegura = 0.88;
          let reqDist = 42;

          for (let i = 0; i < pontosLimites.length; i++) {
            const px = pontosLimites[i][0];
            const py = pontosLimites[i][1];
            const pz = pontosLimites[i][2];

            const dy = py - 2.0;
            const dz = pz - (-1.0);

            const rHoriz = Math.abs(px) / (tanHalfFov * aspect * margemSegura) + (dy * sinPitch + dz * cosPitch);
            if (rHoriz > reqDist) reqDist = rHoriz;

            const yCam = dy * cosPitch - dz * sinPitch;
            const rVert = Math.abs(yCam) / (tanHalfFov * margemSegura) + (dy * sinPitch + dz * cosPitch);
            if (rVert > reqDist) reqDist = rVert;
          }

          if (!cameraHasDragged || forcarPosicao) {
            targetLookAt.set(0, 2, -1);
            targetCamPos.set(0, 2 + reqDist * sinPitch, -1 + reqDist * cosPitch);
            if (forcarPosicao) {
              camera.position.copy(targetCamPos);
              currentLookAt.copy(targetLookAt);
            }
          }
        } else if (aspect < 1.45) {
          const fovRad = (45 * Math.PI) / 180;
          const targetHalfWidth = Math.tan(fovRad / 2) * 1.35;
          const newFov = 2 * Math.atan(targetHalfWidth / aspect) * (180 / Math.PI);
          camera.fov = Math.min(Math.max(newFov, 45), 62);
          if (!cameraHasDragged || forcarPosicao) {
            const fator = (isMobile || aspect < 1.0) ? 1.15 : 1.0;
            targetLookAt.set(0, 2, 0);
            targetCamPos.set(0, 22 * fator, 34 * fator);
            if (forcarPosicao) {
              camera.position.copy(targetCamPos);
              currentLookAt.copy(targetLookAt);
            }
          }
        } else {
          camera.fov = 45;
          if (!cameraHasDragged || forcarPosicao) {
            targetLookAt.set(0, 2, 0);
            targetCamPos.set(0, 18, 28);
            if (forcarPosicao) {
              camera.position.copy(targetCamPos);
              currentLookAt.copy(targetLookAt);
            }
          }
        }
      }

      camera.updateProjectionMatrix();
    }
    atualizarFovCamera(true);

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      antialias: !isMobile, 
      alpha: false,
      powerPreference: isMobile ? 'low-power' : 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (typeof THREE.SRGBColorSpace !== 'undefined') {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if (typeof THREE.sRGBEncoding !== 'undefined') {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.toneMapping = (vis && vis.toneMapping === false) ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = (vis && vis.exposicao != null) ? vis.exposicao : 1.06;

    const luz = (vis && vis.luz) || null;

    // 1. Iluminação Hemisférica Zenital: céu dourado sereno + reflexo de chão calmo
    const hemiLight = new THREE.HemisphereLight(
      Kit3D.cor((luz && luz.hemiCeu) || 0xfffaed),
      Kit3D.cor((luz && luz.hemiChao) || 0xb9f6ca),
      (luz && luz.hemiForca != null) ? luz.hemiForca : 0.62
    );
    scene.add(hemiLight);

    // 2. Luz Direcional Principal do Sol (Key Light): esculpe volumes com sombras PCF suaves e nítidas
    const solPos = (luz && luz.solPos) || [28, 26, 14];
    const sunLight = new THREE.DirectionalLight(
      Kit3D.cor((luz && luz.solCor) || 0xfff5e8),
      (luz && luz.solForca != null) ? luz.solForca : 1.22
    );
    sunLight.position.set(solPos[0], solPos[1], solPos[2]);
    sunLight.castShadow = true;
    sunLight.shadow.normalBias = (luz && luz.sombraNormalBias != null) ? luz.sombraNormalBias : 0.028;
    sunLight.shadow.bias = (luz && luz.sombraBias != null) ? luz.sombraBias : -0.0004;
    sunLight.shadow.radius = (luz && luz.sombraRaioBlur != null) ? luz.sombraRaioBlur : 3.2;
    sunLight.shadow.mapSize.width = shadowMapSize;
    sunLight.shadow.mapSize.height = shadowMapSize;
    sunLight.shadow.camera.near = (luz && luz.sombraNear != null) ? luz.sombraNear : 8;
    sunLight.shadow.camera.far = (luz && luz.sombraFar != null) ? luz.sombraFar : 90;
    const sombraLeft = (luz && luz.sombraLeft != null) ? luz.sombraLeft : ((vis && vis.sombraLeft != null) ? vis.sombraLeft : ((vis && vis.sombraRaio) ? -vis.sombraRaio : -34));
    const sombraRight = (luz && luz.sombraRight != null) ? luz.sombraRight : ((vis && vis.sombraRight != null) ? vis.sombraRight : ((vis && vis.sombraRaio) ? vis.sombraRaio : 34));
    const sombraTop = (luz && luz.sombraTop != null) ? luz.sombraTop : ((vis && vis.sombraTop != null) ? vis.sombraTop : ((vis && vis.sombraRaio) ? vis.sombraRaio : 28));
    const sombraBottom = (luz && luz.sombraBottom != null) ? luz.sombraBottom : ((vis && vis.sombraBottom != null) ? vis.sombraBottom : ((vis && vis.sombraRaio) ? -vis.sombraRaio : -28));
    sunLight.shadow.camera.left = sombraLeft;
    sunLight.shadow.camera.right = sombraRight;
    sunLight.shadow.camera.top = sombraTop;
    sunLight.shadow.camera.bottom = sombraBottom;
    scene.add(sunLight);

    // 3. Luz Ambiente de Preenchimento (Ambient Fill Light): tons pastéis ricos e luminosos nas sombras
    const ambLight = new THREE.AmbientLight(
      Kit3D.cor((luz && luz.ambCor) || 0xfff8e7),
      (luz && luz.ambForca != null) ? luz.ambForca : 0.30
    );
    scene.add(ambLight);

    // 4. Luz de Recorte (Rim Light / Contraluz): realce sutil dourado nas bordas das geometrias
    const rimPos = (luz && luz.rimPos) || [-24, 20, -22];
    const rimLight = new THREE.DirectionalLight(
      Kit3D.cor((luz && luz.rimCor) || 0xffdfba),
      (luz && luz.rimForca != null) ? luz.rimForca : 0.45
    );
    rimLight.position.set(rimPos[0], rimPos[1], rimPos[2]);
    scene.add(rimLight);

    // 5. Preenchimento Secundário Suave (Secondary Soft Fill): elimina cantos escuros sem ofuscar
    const fillSecPos = (luz && luz.fillSecPos) || (luz && luz.preenchimento && luz.preenchimento.pos) || [-18, 12, 16];
    const fillSecLight = new THREE.DirectionalLight(
      Kit3D.cor((luz && luz.fillSecCor) || (luz && luz.preenchimento && luz.preenchimento.cor) || 0xe8f5e9),
      (luz && luz.fillSecForca != null) ? luz.fillSecForca : ((luz && luz.preenchimento && luz.preenchimento.forca != null) ? luz.preenchimento.forca : 0.22)
    );
    fillSecLight.position.set(fillSecPos[0], fillSecPos[1], fillSecPos[2]);
    scene.add(fillSecLight);

    // Sol disc with multi-layered glowing coronal halo (SphereGeometry layers with additive blending)
    const solAtmosferico = Kit3D.criarSolAtmosferico(scene, solPos, (vis && vis.solOpts) || null);

    const nuvensGrp = (vis && vis.nuvens === 'sprite')
      ? Kit3D.nuvensSprite(scene, vis.nuvensOpts || null)
      : Kit3D.criarNuvens(scene);

    // Constrói o cenário específico do tópico
    const animaveis = [];
    Kit3D._animaveisAtivos = animaveis;
    if (typeof cfg.construirCenario === 'function') {
      cfg.construirCenario(scene, Kit3D, animaveis);
    }

    // Registra animações de objetos criados que declararam animFn (águas, etc.)
    scene.traverse((obj) => {
      if (obj && obj.userData && typeof obj.userData.animFn === 'function' && !obj.userData._animFnRegistrada) {
        obj.userData._animFnRegistrada = true;
        animaveis.push(obj.userData.animFn);
      }
    });

    // Sombras de nuvens translúcidas derivando suavemente sobre a grama do diorama
    if (!vis || vis.sombrasNuvens !== false) {
      Kit3D.criarSombrasNuvens(scene, animaveis, (vis && (vis.sombrasNuvensOpts || (typeof vis.sombrasNuvens === 'object' ? vis.sombrasNuvens : null))) || null);
    }

    // Partículas atmosféricas de brisa e pólen dourado flutuante (40-60 partículas infinitas)
    if (!vis || vis.particulas !== false) {
      Kit3D.criarParticulasAmbiente(scene, animaveis, (vis && vis.particulas) || null);
    }

    // Ativa a brisa viva do diorama para árvores, pinheiros, arbustos e cultivos
    Kit3D.adicionarBalancoVegetacao(scene, animaveis);

    // Animação física de squash & stretch / bounce nos objetos clicados
    const saltando = [];
    function animarSalto(obj) {
      if (!obj) return;
      if (saltando.some(s => s.obj === obj)) return; // Evita empilhamento caso clicado rapidamente
      saltando.push({
        obj: obj,
        start: performance.now(),
        origY: obj.position.y,
        origScale: obj.scale.clone()
      });
    }
    Kit3D.animarSalto = animarSalto;

    // Exibe tooltip com o nome do objeto
    let tooltipTimer = null;
    function mostrarTooltip(texto) {
      if (!tooltipEl) return;
      tooltipEl.textContent = texto;
      tooltipEl.style.display = 'block';
      tooltipEl.style.opacity = '1';
      clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(() => {
        tooltipEl.style.opacity = '0';
        setTimeout(() => { tooltipEl.style.display = 'none'; }, 260);
      }, 4000);
    }

    // ===== FICHAS 3D E ÁLBUM DE DESCOBERTAS =====
    const storageKey = 'kit3d_album_' + (cfg.id || 'geral');
    const fichasColetadas = new Set();
    try {
      const salvas = localStorage.getItem(storageKey);
      if (salvas) {
        JSON.parse(salvas).forEach(id => fichasColetadas.add(id));
      }
    } catch (e) {}

    const fichaMarkers = [];
    let fichaAtual = null;
    let origemFicha = 'cenario'; // 'cenario' | 'album'
    let atualizarVisualMarcador = null;

    function salvarFichas() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(fichasColetadas)));
      } catch (e) {}
    }

    function atualizarContadorFichas() {
      const c = document.getElementById('fichasContador');
      if (c && cfg.fichas3d) {
        c.textContent = `${fichasColetadas.size}/${cfg.fichas3d.length}`;
      }
    }

    function atualizarNavFicha() {
      const navEl = document.getElementById('fichaNav');
      const indEl = document.getElementById('fichaNavInd');
      const btnAnt = document.getElementById('btnFichaAnt');
      const btnProx = document.getElementById('btnFichaProx');
      if (!navEl || !cfg.fichas3d) return;

      if (origemFicha !== 'album') {
        navEl.style.display = 'none';
        return;
      }

      const descobertas = cfg.fichas3d.filter(f => fichasColetadas.has(f.id));
      if (descobertas.length <= 1) {
        navEl.style.display = 'none';
        return;
      }

      navEl.style.display = 'flex';
      const idx = descobertas.findIndex(f => f.id === fichaAtual.id);
      if (idx !== -1) {
        if (indEl) indEl.textContent = `${idx + 1} de ${descobertas.length}`;
        if (btnAnt) btnAnt.disabled = (idx === 0);
        if (btnProx) btnProx.disabled = (idx === descobertas.length - 1);
      }
    }

    function abrirFicha(ficha, markerGrp, origem = 'cenario') {
      fichaAtual = ficha;
      origemFicha = origem;
      const eraNova = !fichasColetadas.has(ficha.id);
      fichasColetadas.add(ficha.id);
      salvarFichas();

      if (markerGrp) {
        animarSalto(markerGrp);
        if (typeof atualizarVisualMarcador === 'function') {
          atualizarVisualMarcador(markerGrp, true);
        }
      }
      const mMatch = fichaMarkers.find(mk => mk.userData && mk.userData.ficha && mk.userData.ficha.id === ficha.id);
      if (mMatch && typeof atualizarVisualMarcador === 'function') {
        atualizarVisualMarcador(mMatch, true);
      }
      Kit3D.Audio.acerto();
      atualizarContadorFichas();

      const fModal = document.getElementById('fichaModal');
      const fBadge = document.getElementById('fichaBadge');
      const fImg = document.getElementById('fichaImg');
      const fTit = document.getElementById('fichaTit');
      const fFato = document.getElementById('fichaFato');
      const btnGuardar = document.getElementById('btnGuardarFicha');
      const btnIrAlbum = document.getElementById('btnIrAlbum');

      if (fModal) {
        if (fImg) {
          fImg.src = ficha.foto;
          fImg.alt = ficha.nome;
        }
        if (fTit) fTit.textContent = ficha.nome;
        if (fFato) fFato.textContent = ficha.fato;

        if (origem === 'album') {
          if (fBadge) fBadge.textContent = '📖 Ficha do Álbum';
          if (btnGuardar) btnGuardar.textContent = '← Voltar ao Álbum';
          if (btnIrAlbum) btnIrAlbum.style.display = 'none';
        } else {
          if (fBadge) fBadge.textContent = '✨ Ficha Descoberta!';
          if (btnGuardar) btnGuardar.textContent = '✓ Guardar e Explorar';
          if (btnIrAlbum) btnIrAlbum.style.display = 'inline-flex';
        }

        atualizarNavFicha();
        fModal.style.display = 'flex';
      }
      Kit3D.falar(ficha.fato, 0.85);

      if (eraNova && cfg.fichas3d && fichasColetadas.size === cfg.fichas3d.length) {
        setTimeout(() => {
          Kit3D.Audio.fanfarra();
          criarConfetes();
          Kit3D.falar('Parabéns! Você encontrou todas as fotos do álbum!', 0.85);
        }, 600);
      }
    }

    function fecharFichaModal() {
      const fModal = document.getElementById('fichaModal');
      if (fModal) fModal.style.display = 'none';
      Kit3D.Audio.toqueObjeto();
      if (origemFicha === 'album') {
        const aModal = document.getElementById('albumModal');
        if (aModal) aModal.style.display = 'flex';
      }
    }

    function abrirAlbum() {
      const albModal = document.getElementById('albumModal');
      const grid = document.getElementById('albumGrid');
      if (!albModal || !grid) return;
      grid.innerHTML = '';
      (cfg.fichas3d || []).forEach((f) => {
        const achou = fichasColetadas.has(f.id);
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'album-item ' + (achou ? 'desbloqueado' : 'bloqueado');
        item.setAttribute('aria-label', `${f.nome}: ${achou ? 'Desbloqueada. Toque para ver detalhes.' : 'Ainda bloqueada no cenário 3D.'}`);
        item.innerHTML = `
          <img src="${achou ? f.foto : '../img/fita-autismo.png'}" alt="${achou ? f.nome : 'Foto bloqueada'}">
          <span>${achou ? f.nome : '???'}</span>
          <span class="album-badge-status">${achou ? '🔍 Toque para abrir' : '🔒 No Cenário 3D'}</span>
        `;
        if (achou) {
          item.onclick = () => {
            albModal.style.display = 'none';
            abrirFicha(f, null, 'album');
          };
        } else {
          item.title = 'Ficha ainda não descoberta no cenário 3D';
          item.onclick = () => {
            Kit3D.Audio.toqueObjeto();
            mostrarTooltip('Gire o cenário 3D e toque na estrela amarela para descobrir esta foto!');
            Kit3D.falar('Gire o cenário 3D e toque na estrela dourada para descobrir esta foto!', 0.85);
          };
        }
        grid.appendChild(item);
      });
      const sub = document.getElementById('albumSub');
      if (sub && cfg.fichas3d) {
        sub.textContent = `${fichasColetadas.size} de ${cfg.fichas3d.length} fotos descobertas!`;
      }
      albModal.style.display = 'flex';
      Kit3D.Audio.toqueObjeto();
    }

    if (cfg.fichas3d && cfg.fichas3d.length > 0) {
      const fBtn = document.getElementById('hudFichasBtn');
      if (fBtn) fBtn.style.display = 'block';
      atualizarContadorFichas();

      // Geometria e materiais aprimorados: formato geométrico maior e emissivo para alta visibilidade no mobile
      const marcGeo = Kit3D.geo('ficha_gem_v2', () => new THREE.OctahedronGeometry(0.95, 0));
      const marcMat = Kit3D.mat('toon', 0xffb300, {
        emissive: 0xff8f00,
        emissiveIntensity: 0.65
      });
      const marcMatDescoberto = Kit3D.mat('toon', 0x2e7d32, {
        emissive: 0x1b5e20,
        emissiveIntensity: 0.60
      });
      const anelGeo = Kit3D.geo('ficha_anel_v2', () => new THREE.TorusGeometry(1.35, 0.09, 8, 24));
      const anelMat = Kit3D.mat('toon', 0xfff9c4, {
        emissive: 0xffecb3,
        emissiveIntensity: 0.50
      });
      const anelMatDescoberto = Kit3D.mat('toon', 0xa5d6a7, {
        emissive: 0x81c784,
        emissiveIntensity: 0.45
      });
      // Hit sphere ampla (raio 5.0 no mobile/touch e 3.8 no desktop) para garantir toque imediato com o dedo
      const hitRaio = (isMobile || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) ? 5.0 : 3.8;
      const hitGeo = Kit3D.geo(`ficha_hit_r${hitRaio}`, () => new THREE.SphereGeometry(hitRaio, 12, 12));
      const hitMat = Kit3D.mat('basic', 0xffffff, { transparent: true, opacity: 0, depthWrite: false });

      atualizarVisualMarcador = function (grp, coletado) {
        if (!grp || !grp.userData) return;
        const gem = grp.userData.gem;
        const anel = grp.userData.anel;
        const luz = grp.userData.luz;
        if (coletado) {
          if (gem) gem.material = marcMatDescoberto;
          if (anel) anel.material = anelMatDescoberto;
          if (luz) luz.color.setHex(0x81c784);
        } else {
          if (gem) gem.material = marcMat;
          if (anel) anel.material = anelMat;
          if (luz) luz.color.setHex(0xffca28);
        }
        grp.visible = true; // Permanece sempre visível no mobile e desktop para exploração
      };

      cfg.fichas3d.forEach((f) => {
        const grp = new THREE.Group();
        grp.position.set(f.pos[0], f.pos[1], f.pos[2]);

        const gem = new THREE.Mesh(marcGeo, marcMat);
        gem.castShadow = true;
        gem.userData = { isFicha: true, ficha: f, grpFicha: grp };
        grp.add(gem);

        const anel = new THREE.Mesh(anelGeo, anelMat);
        anel.rotation.x = Math.PI / 2;
        anel.userData = { isFicha: true, ficha: f, grpFicha: grp };
        grp.add(anel);

        // Ponto de luz quente/suave emitido pelo marcador
        const luz = new THREE.PointLight(0xffca28, 0.85, 9);
        luz.position.set(0, 0, 0);
        grp.add(luz);

        // Hit sphere generosa para toque no mobile e clique no desktop
        const hitSphere = new THREE.Mesh(hitGeo, hitMat);
        hitSphere.userData = { isFicha: true, ficha: f, grpFicha: grp };
        grp.add(hitSphere);

        grp.userData = {
          isFicha: true,
          isFichaMarker: true,
          ficha: f,
          grpFicha: grp,
          gem: gem,
          anel: anel,
          luz: luz,
          baseY: f.pos[1],
          tempo: Math.random() * 10
        };

        atualizarVisualMarcador(grp, fichasColetadas.has(f.id));

        scene.add(grp);
        fichaMarkers.push(grp);
      });
    }

    // ===== HUD DE EXPLORAÇÃO CURIOSA ("Explorador da Maquete") =====
    const objetosInterativos = new Set();
    scene.traverse((obj) => {
      if (obj.userData && obj.userData.interativo && !obj.userData.isFicha) {
        let pai = obj.parent;
        let temPaiInterativo = false;
        while (pai && pai !== scene) {
          if (pai.userData && pai.userData.interativo) {
            temPaiInterativo = true;
            break;
          }
          pai = pai.parent;
        }
        if (!temPaiInterativo) {
          objetosInterativos.add(obj);
        }
      }
    });

    const elementosDescobertos = new Set();
    let hudExplorador = document.getElementById('hudExplorador');
    if (!hudExplorador && container) {
      hudExplorador = document.createElement('button');
      hudExplorador.type = 'button';
      hudExplorador.id = 'hudExplorador';
      hudExplorador.className = 'hud-explorador';
      hudExplorador.setAttribute('aria-label', 'Explorador da Maquete 3D');
      container.appendChild(hudExplorador);
    }

    function atualizarHudExplorador() {
      if (!hudExplorador) return;
      const total = objetosInterativos.size;
      if (total === 0) {
        hudExplorador.style.display = 'none';
        return;
      }
      hudExplorador.style.display = 'inline-flex';
      const achados = elementosDescobertos.size;
      if (achados >= total) {
        hudExplorador.className = 'hud-explorador completo';
        hudExplorador.innerHTML = '<span class="hud-exp-ico">⭐</span> <span class="hud-exp-txt">Explorador Nato! ⭐</span>';
        if (!hudExplorador._parabenizado) {
          hudExplorador._parabenizado = true;
          Kit3D.Audio.fanfarra();
          Kit3D.celebrarAcerto();
          mostrarTooltip('⭐ Explorador Nato! Você descobriu todos os elementos da maquete!');
          Kit3D.falar('Parabéns! Você descobriu todos os elementos da maquete!', 0.85);
        }
      } else {
        hudExplorador.className = 'hud-explorador';
        hudExplorador.innerHTML = `<span class="hud-exp-ico">🔍</span> <span class="hud-exp-txt">${achados}/${total} descobertos</span>`;
      }
    }

    if (hudExplorador) {
      atualizarHudExplorador();
      hudExplorador.onclick = () => {
        Kit3D.Audio.pop();
        const total = objetosInterativos.size;
        const achados = elementosDescobertos.size;
        if (achados >= total) {
          mostrarTooltip('⭐ Você é um Explorador Nato! Conheceu toda a maquete!');
          Kit3D.falar('Você é um Explorador Nato e conheceu toda a maquete!', 0.85);
        } else {
          const restantes = total - achados;
          mostrarTooltip(`🔍 Explorador da Maquete: ${achados}/${total} descobertos. Toque nos elementos 3D para encontrar os outros ${restantes}!`);
          Kit3D.falar(`Explorador: você descobriu ${achados} de ${total}. Toque nos objetos da maquete para explorar!`, 0.85);
        }
      };
    }

    // Raycaster para Toque / Clique didático com expansão para dedos em telas móveis
    const isTouchDevice = isMobile || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const raycaster = new THREE.Raycaster();
    if (raycaster.params) {
      if (raycaster.params.Points) raycaster.params.Points.threshold = isTouchDevice ? 5.0 : 2.5;
      if (raycaster.params.Line) raycaster.params.Line.threshold = isTouchDevice ? 5.0 : 2.5;
    }
    const mouse = new THREE.Vector2();
    let hoveredObj = null;

    function tratarClique(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      let intersects = raycaster.intersectObjects(scene.children, true);

      // 1. PRIORIDADE MÁXIMA: Fichas 3D do Álbum (se qualquer ponto do raio tocou uma ficha visível)
      for (let i = 0; i < intersects.length; i++) {
        let cur = intersects[i].object;
        while (cur && cur !== scene) {
          if (cur.userData && cur.userData.isFicha) {
            let visivel = true;
            let check = cur;
            while (check && check !== scene) {
              if (check.visible === false) { visivel = false; break; }
              check = check.parent;
            }
            if (visivel) {
              const grp = cur.userData.grpFicha || cur;
              Kit3D.criarEfeitoToque(intersects[i].point || grp.position, '✨');
              abrirFicha(cur.userData.ficha, grp, 'cenario');
              return;
            }
          }
          cur = cur.parent;
        }
      }

      // Expansão de raio de colisão para fichas (esfera invisível de proximidade de 5.0 unidades para toque impreciso)
      let fichaProxima = null;
      let distFichaMin = 5.0;
      if (Array.isArray(fichaMarkers)) {
        fichaMarkers.forEach((m) => {
          if (!m.visible) return;
          const dist = raycaster.ray.distanceToPoint(m.position);
          if (dist < distFichaMin) {
            distFichaMin = dist;
            fichaProxima = m;
          }
        });
      }
      if (fichaProxima && fichaProxima.userData && fichaProxima.userData.isFicha) {
        Kit3D.criarEfeitoToque(fichaProxima.position, '✨');
        abrirFicha(fichaProxima.userData.ficha, fichaProxima, 'cenario');
        return;
      }

      // 2. PRIORIDADE SECUNDÁRIA: Objetos interativos do cenário
      let alvo = null;
      let pontoToque = null;
      for (let i = 0; i < intersects.length; i++) {
        let cur = intersects[i].object;
        while (cur && cur !== scene) {
          if (cur.userData && cur.userData.interativo) {
            alvo = cur;
            pontoToque = intersects[i].point;
            break;
          }
          cur = cur.parent;
        }
        if (alvo) break;
      }

      // Proximidade para objetos interativos (tolerância de até 5.0 unidades para dedos em telas pequenas)
      if (!alvo) {
        let menorDistInterativo = 5.0;
        scene.traverse((obj) => {
          if (!obj.visible || !obj.userData || !obj.userData.interativo) return;
          const worldPos = new THREE.Vector3();
          obj.getWorldPosition(worldPos);
          const dRay = raycaster.ray.distanceToPoint(worldPos);
          if (dRay < menorDistInterativo) {
            menorDistInterativo = dRay;
            alvo = obj;
            pontoToque = worldPos;
          }
        });
      }

      if (alvo) {
        let raizInterativa = alvo;
        while (raizInterativa.parent && raizInterativa.parent !== scene && raizInterativa.parent.userData && raizInterativa.parent.userData.interativo) {
          raizInterativa = raizInterativa.parent;
        }
        elementosDescobertos.add(raizInterativa);
        atualizarHudExplorador();

        animarSalto(alvo);
        Kit3D.criarEfeitoToque(pontoToque || alvo.position, '⭐');
        if (typeof alvo.userData.aoClicar === 'function') {
          try { alvo.userData.aoClicar(alvo, Kit3D); } catch (e) {}
        }
        const som = alvo.userData.som;
        if (som && typeof Kit3D.Audio[som] === 'function') {
          Kit3D.Audio[som]();
        } else {
          Kit3D.Audio.toqueObjeto();
        }

        const nome = alvo.userData.nome || 'Objeto do cenário';
        mostrarTooltip(`🔍 ${nome}`);
        Kit3D.falar(nome, 0.85);
      } else if (intersects.length > 0) {
        // Toque lúdico livre no cenário 3D (chão/pedras/água/cenografia)
        Kit3D.criarEfeitoToque(intersects[0].point, '🫧');
        Kit3D.Audio.pop();
      }
    }

    // Highlight ao passar o mouse (apenas desktop)
    function tratarHover(clientX, clientY) {
      if (isMobile) return;
      
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      
      if (hoveredObj) {
        if (!saltando.some(s => s.obj === hoveredObj)) {
          hoveredObj.scale.set(1, 1, 1);
        }
      }
      hoveredObj = null;

      if (intersects.length > 0) {
        // Prioriza ficha no hover
        for (let i = 0; i < intersects.length; i++) {
          let cur = intersects[i].object;
          while (cur && cur !== scene) {
            if (cur.userData && cur.userData.isFicha) {
              let visivel = true;
              let check = cur;
              while (check && check !== scene) {
                if (check.visible === false) { visivel = false; break; }
                check = check.parent;
              }
              if (visivel) {
                canvas.style.cursor = 'pointer';
                return;
              }
            }
            cur = cur.parent;
          }
        }

        // Objetos interativos no hover
        for (let i = 0; i < intersects.length; i++) {
          let cur = intersects[i].object;
          while (cur && cur !== scene) {
            if (cur.userData && cur.userData.interativo) {
              hoveredObj = cur;
              if (!saltando.some(s => s.obj === cur)) {
                cur.scale.set(1.05, 1.05, 1.05);
              }
              canvas.style.cursor = 'pointer';
              return;
            }
            cur = cur.parent;
          }
        }
      }
      canvas.style.cursor = 'default';
    }

    // Confetes para o final
    let confetes = null;
    function criarConfetes() {
      if (confetes) return;
      const count = 120;
      const geo = new THREE.BufferGeometry();
      const pos = [];
      const cores = [];
      const colorList = [0xffd54f, 0x4fc3f7, 0x81c784, 0xff8a80, 0xba68c8];
      for (let i = 0; i < count; i++) {
        pos.push((Math.random() - 0.5) * 32, 15 + Math.random() * 15, (Math.random() - 0.5) * 26);
        const c = new THREE.Color(colorList[Math.floor(Math.random() * colorList.length)]);
        cores.push(c.r, c.g, c.b);
      }
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
      confetes = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.6, vertexColors: true, transparent: true, opacity: 0.9 }));
      scene.add(confetes);
    }

    // Redimensionamento rápido e Visual Viewport (teclado virtual, barras do navegador)
    function onRedimensionar() {
      if (!container || !renderer || !camera) return;
      atualizarFovCamera(false);
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(w, h);
      if (composer) {
        composer.setSize(w, h);
      }
    }

    window.addEventListener('resize', onRedimensionar);
    window.addEventListener('orientationchange', () => {
      setTimeout(onRedimensionar, 60);
      setTimeout(onRedimensionar, 250);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onRedimensionar);
      window.visualViewport.addEventListener('scroll', onRedimensionar);
    }

    // Gesto de Pinch-to-Zoom para Mobile (2 dedos com hypot(dx, dy) e limites seguros)
    let isPinching = false;
    let prevPinchDist = 0;

    canvas.addEventListener('touchstart', (e) => {
      Kit3D.Audio.init();
      Kit3D.Audio.initOnFirstInteraction();
      if (e.touches && e.touches.length === 2) {
        isPinching = true;
        isDragging = false;
        cameraHasDragged = true;
        rotVelocity = 0;
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        prevPinchDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 2) {
        isPinching = true;
        isDragging = false;
        cameraHasDragged = true;
        rotVelocity = 0;
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const curDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        if (prevPinchDist > 0 && curDist > 0) {
          const delta = prevPinchDist - curDist;
          const dpr = window.devicePixelRatio || 1;
          const pinchFactor = dpr > 2 ? 0.0075 : 0.009;
          const scale = 1 + delta * pinchFactor;
          const offset = new THREE.Vector3().subVectors(targetCamPos, targetLookAt);
          const currentDist = offset.length();
          if (currentDist > 0.001) {
            let newDist = currentDist * scale;
            // Limites seguros de zoom: mínimo 14 (evita clipping no near plane de 0.1) e máximo 110 (sem corte no far plane de 500)
            newDist = Math.max(14, Math.min(110, newDist));
            offset.setLength(newDist);
            targetCamPos.copy(targetLookAt).add(offset);
          }
          prevPinchDist = curDist;
        }
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    function resetPinch(e) {
      if (!e.touches || e.touches.length < 2) {
        isPinching = false;
        prevPinchDist = 0;
      }
    }
    canvas.addEventListener('touchend', resetPinch);
    canvas.addEventListener('touchcancel', resetPinch);
    window.addEventListener('touchend', resetPinch);
    window.addEventListener('touchcancel', resetPinch);

    // Rotação com 1 dedo com desaceleração suave (inércia/amortecimento) e toque duplo para reset
    let isDragging = false;
    let startX = 0, startY = 0;
    let prevX = 0;
    let lastMoveTime = 0;

    canvas.addEventListener('pointerdown', (e) => {
      if (isPinching || (e.pointerType === 'touch' && !e.isPrimary)) return;
      isDragging = true;
      cameraHasDragged = false;
      rotVelocity = 0;
      startX = e.clientX;
      startY = e.clientY;
      prevX = e.clientX;
      lastMoveTime = performance.now();
      Kit3D.Audio.init();
      Kit3D.Audio.initOnFirstInteraction();
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging || isPinching || (e.pointerType === 'touch' && !e.isPrimary)) {
        if (!isMobile && !isDragging) {
          tratarHover(e.clientX, e.clientY);
        }
        return;
      }
      const distTotal = Math.hypot(e.clientX - startX, e.clientY - startY);
      const isTouch = e.pointerType === 'touch' || isMobile;
      const dpr = window.devicePixelRatio || 1;
      const dragThreshold = isTouch ? (dpr > 2 ? 16 : 13) : 7;
      if (distTotal > dragThreshold) {
        cameraHasDragged = true;
        const nowTime = performance.now();
        const dt = Math.max(8, nowTime - lastMoveTime);
        const dx = e.clientX - prevX;
        prevX = e.clientX;
        lastMoveTime = nowTime;

        const rotSensibilidade = isTouch ? (dpr > 2 ? 0.0048 : 0.0055) : 0.006;
        const angle = dx * rotSensibilidade;
        const offset = new THREE.Vector3().subVectors(targetCamPos, targetLookAt);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
        targetCamPos.copy(targetLookAt).add(offset);

        // Velocidade instantânea para inércia suave
        const instantVel = (dx * rotSensibilidade) * (16.67 / dt);
        rotVelocity = rotVelocity * 0.35 + instantVel * 0.65;
        rotVelocity = Math.max(-0.065, Math.min(0.065, rotVelocity));
      }
    });

    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    if (canvas) {
      canvas.addEventListener('dblclick', () => {
        resetarCameraMissao();
      });
    }

    window.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch' && !e.isPrimary) return;
      if (performance.now() - lastMoveTime > 90) {
        rotVelocity = 0;
      }

      if (isDragging && !cameraHasDragged && !isPinching) {
        const agora = performance.now();
        const tempoDiff = agora - lastTapTime;
        const distDiff = Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY);

        if (tempoDiff > 40 && tempoDiff < 350 && distDiff < 32) {
          // Toque duplo na cena reseta o ângulo da câmera para o preset ideal da missão
          resetarCameraMissao();
          lastTapTime = 0;
        } else {
          lastTapTime = agora;
          lastTapX = e.clientX;
          lastTapY = e.clientY;
          tratarClique(e.clientX, e.clientY);
        }
      }
      isDragging = false;
      cameraHasDragged = false;
    });

    window.addEventListener('pointercancel', (e) => {
      if (e.pointerType === 'touch' && !e.isPrimary) return;
      isDragging = false;
      cameraHasDragged = false;
      rotVelocity = 0;
    });

    // Câmeras preset
    function setCameraPreset(nome, imediato) {
      if (!cfg.cameras || !cfg.cameras[nome]) return;
      const c = cfg.cameras[nome];
      cameraHasDragged = true;
      rotVelocity = 0;
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 1);
      const aspect = width / height;
      const viewportH = (window.visualViewport && window.visualViewport.height) || window.innerHeight || height;
      const isMobileLandscape = (aspect > 1.2) && (viewportH < 520 || height < 520 || (isMobile && height < 560));

      targetLookAt.set(c.look[0], c.look[1], c.look[2]);
      targetCamPos.set(c.pos[0], c.pos[1], c.pos[2]);

      if (isMobileLandscape) {
        // Em paisagem móvel, enquadra na metade esquerda compensando a altura
        camera.setViewOffset(width, height, width * 0.25, 0, width, height);
        const off = new THREE.Vector3().subVectors(targetCamPos, targetLookAt);
        const dist = off.length();
        off.y = Math.min(off.y, 18);
        off.setLength(Math.max(dist * 0.95, 34));
        targetCamPos.copy(targetLookAt).add(off);
      } else {
        camera.clearViewOffset();
        if (aspect < 0.65) {
          // Em smartphone vertical estreito, afasta proporcionalmente para garantir visão total sem cortes
          const fator = Math.max(0.65 / aspect, 1.28);
          const off = new THREE.Vector3().subVectors(targetCamPos, targetLookAt);
          off.multiplyScalar(fator);
          off.y = Math.max(off.y, off.y * 1.10);
          targetCamPos.copy(targetLookAt).add(off);
        } else if (isMobile || aspect < 1.0) {
          const fator = 1.15;
          const off = new THREE.Vector3().subVectors(targetCamPos, targetLookAt);
          off.multiplyScalar(fator);
          off.y = Math.max(off.y, off.y * 1.08);
          targetCamPos.copy(targetLookAt).add(off);
        }
      }

      camera.updateProjectionMatrix();

      if (imediato) {
        camera.position.copy(targetCamPos);
        currentLookAt.copy(targetLookAt);
        camera.lookAt(currentLookAt);
      }
      const camBtnsContainer = document.getElementById('camBtns');
      if (camBtnsContainer) {
        camBtnsContainer.querySelectorAll('.btn-cam').forEach((b) => {
          b.classList.toggle('active', b.dataset.cam === nome);
        });
      }
    }

    // Atalho rápido: reseta a câmera para o ângulo ideal da missão ativa
    function resetarCameraMissao() {
      cameraHasDragged = false;
      rotVelocity = 0;
      const m = missoes[missaoIdx];
      const camIdeal = (m && m.cam) ? m.cam : (cfg.camInicial || 'geral');
      if (camIdeal === 'geral') {
        atualizarFovCamera(false);
      } else {
        setCameraPreset(camIdeal, false);
      }
      Kit3D.Audio.pop();
      mostrarTooltip('🎥 Câmera reposicionada para a missão!');
    }
    Kit3D.resetarCamera = resetarCameraMissao;

    // Câmera Guia de Pista no Erro/Retry ou Botão de Dica (TEA - Sem frustração)
    function focarPista(idMissao) {
      let m = null;
      if (typeof idMissao === 'number') {
        m = missoes[idMissao];
      } else if (typeof idMissao === 'string') {
        m = missoes.find(x => x.id === idMissao || x.kicker === idMissao);
      }
      if (!m) m = missoes[missaoIdx];
      if (!m) return;

      cameraHasDragged = true;

      // 1. Procura na cena o objeto 3D correspondente à resposta ou pista da missão
      let alvoPista = null;
      const termoResp = (m.respostaCerta || '').toLowerCase();
      const termoPista = (m.pistaAlvo || m.pista || '').toLowerCase();

      const curIdx = typeof idMissao === 'number' ? idMissao : missoes.indexOf(m);

      scene.traverse((obj) => {
        if (alvoPista) return;
        if (!obj.userData) return;
        const pm = obj.userData.pistaMissao;
        if (pm !== undefined && (pm === curIdx || (Array.isArray(pm) && pm.includes(curIdx)))) {
          alvoPista = obj;
          return;
        }
        if (obj.userData.pista === true || obj.userData.idMissao === m.id || obj.userData.pista === m.respostaCerta) {
          alvoPista = obj;
          return;
        }
        if (obj.userData.pistaMissao !== undefined) {
          const pm = obj.userData.pistaMissao;
          const matchIdx = (typeof idMissao === 'number') ? idMissao : missoes.indexOf(m);
          if (pm === matchIdx || (Array.isArray(pm) && pm.includes(matchIdx)) || (m && pm === m.id)) {
            alvoPista = obj;
            return;
          }
        }
        if (termoResp && (obj.userData.id === termoResp || obj.userData.tipo === termoResp)) {
          alvoPista = obj;
          return;
        }
        if (termoPista && (obj.userData.id === termoPista || obj.userData.tipo === termoPista)) {
          alvoPista = obj;
          return;
        }
        if (termoResp && obj.userData.nome && obj.userData.nome.toLowerCase().includes(termoResp)) {
          alvoPista = obj;
          return;
        }
      });

      if (alvoPista) {
        const wPos = new THREE.Vector3();
        alvoPista.getWorldPosition(wPos);
        targetLookAt.copy(wPos);

        const off = new THREE.Vector3().subVectors(camera.position, wPos).normalize();
        if (off.length() < 0.1) off.set(0, 0.6, 0.8).normalize();
        const distFoco = isMobile ? 15 : 12;
        targetCamPos.copy(wPos).addScaledVector(off, distFoco);
        targetCamPos.y = Math.max(targetCamPos.y, wPos.y + (isMobile ? 7 : 5));

        animarSalto(alvoPista);
        Kit3D.criarEfeitoToque(wPos, '💡');
        Kit3D.Audio.sino();
      } else if (m.cam && cfg.cameras && cfg.cameras[m.cam]) {
        const c = cfg.cameras[m.cam];
        targetLookAt.set(c.look[0], c.look[1], c.look[2]);
        const camLook = new THREE.Vector3(c.look[0], c.look[1], c.look[2]);
        const camPos = new THREE.Vector3(c.pos[0], c.pos[1], c.pos[2]);
        const zoomed = new THREE.Vector3().subVectors(camPos, camLook).multiplyScalar(0.75);
        targetCamPos.copy(camLook).add(zoomed);
        Kit3D.Audio.sino();
      }

      const camBtnsContainer = document.getElementById('camBtns');
      if (camBtnsContainer && m.cam) {
        camBtnsContainer.querySelectorAll('.btn-cam').forEach((b) => {
          b.classList.toggle('active', b.dataset.cam === m.cam);
        });
      }
    }
    Kit3D.focarPista = focarPista;

    // Loop de renderização
    let composer = null;

    // Post-processing apenas em desktop. No modo "cor viva" o bloom fica DESLIGADO por padrão:
    // o EffectComposer renderiza a cena num render target LINEAR e devolveria a imagem escura
    // ao canvas (e o antialias do contexto não vale para render target). Sem ele, a saída vai
    // direto pro canvas com sRGB correto + MSAA. Se o tópico pedir bloom (visual.bloom = true),
    // o composer volta e um passe final converte linear -> sRGB.
    const usarComposer = !isMobile && typeof THREE.EffectComposer !== 'undefined' &&
      !!(vis && vis.bloom);

    if (usarComposer) {
      composer = new THREE.EffectComposer(renderer);
      const renderPass = new THREE.RenderPass(scene, camera);
      composer.addPass(renderPass);

      // Bloom suave apenas nos pontos brilhantes (lanternas, sinos, reflexos metálicos)
      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        0.35, // intensidade elegante
        0.25, // radius de difusão
        0.82  // threshold alto: mantém o diorama toon nítido e ilumina apenas pontos de luz
      );
      composer.addPass(bloomPass);

      if (usarSRGB && typeof THREE.ShaderPass !== 'undefined') {
        composer.addPass(new THREE.ShaderPass({
          uniforms: { tDiffuse: { value: null } },
          vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'vec3 linearParaSRGB(vec3 c) {',
            '  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(0.41666)) - 0.055, step(vec3(0.0031308), c));',
            '}',
            'void main() {',
            '  vec4 cor = texture2D(tDiffuse, vUv);',
            '  gl_FragColor = vec4(linearParaSRGB(cor.rgb), cor.a);',
            '}'
          ].join('\n')
        }));
      }
    }

    function renderLoop() {
      requestAnimationFrame(renderLoop);
      const now = performance.now() * 0.001;

      // Inércia suave de rotação da câmera (desaceleração com amortecimento)
      if (!isDragging && !isPinching && Math.abs(rotVelocity) > 0.00005) {
        const offset = new THREE.Vector3().subVectors(targetCamPos, targetLookAt);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotVelocity);
        targetCamPos.copy(targetLookAt).add(offset);
        rotVelocity *= 0.92;
        if (Math.abs(rotVelocity) < 0.00005) {
          rotVelocity = 0;
        }
      }

      camera.position.lerp(targetCamPos, 0.045);
      currentLookAt.lerp(targetLookAt, 0.045);
      camera.lookAt(currentLookAt);

      // Deslocamento sutil das nuvens (desligado com prefers-reduced-motion)
      if (nuvensGrp && !reduzirMovimento) {
        nuvensGrp.position.x = Math.sin(now * 0.04) * 4;
      }

      // Animações cadastradas pelos tópicos (cabeça/cauda de animais, rodas, etc.)
      animaveis.forEach((a) => {
        if (typeof a === 'function') a(now);
      });

      // Flutuação, pulsação e rotação dos marcadores de fichas 3D
      fichaMarkers.forEach((m) => {
        if (m.visible) {
          m.rotation.y += 0.035;
          if (m.userData.anel) {
            m.userData.anel.rotation.z += 0.02;
          }
          m.position.y = m.userData.baseY + Math.sin(now * 3 + m.userData.tempo) * 0.28;
          const escala = 1.0 + Math.sin(now * 4 + m.userData.tempo) * 0.06;
          m.scale.set(escala, escala, escala);
        }
      });

      // Animação de squash & stretch / bounce nos objetos tocados (escala suave Y 1.0 -> 1.25 -> 0.95 -> 1.00)
      const timeMs = performance.now();
      for (let i = saltando.length - 1; i >= 0; i--) {
        const item = saltando[i];
        const elapsed = (timeMs - item.start) * 0.001;
        const dur = 0.52;
        if (elapsed >= dur) {
          item.obj.position.y = item.origY;
          if (item.origScale) item.obj.scale.copy(item.origScale);
          saltando.splice(i, 1);
        } else {
          const t = elapsed / dur;
          let sy = 1.0;
          if (!reduzirMovimento) {
            if (t < 0.28) {
              const p = Math.sin((t / 0.28) * (Math.PI / 2));
              sy = 1.0 + 0.25 * p; // 1.00 -> 1.25
            } else if (t < 0.65) {
              const p = Math.sin(((t - 0.28) / (0.65 - 0.28)) * (Math.PI / 2));
              sy = 1.25 - 0.30 * p; // 1.25 -> 0.95
            } else {
              const p = Math.sin(((t - 0.65) / (1.0 - 0.65)) * (Math.PI / 2));
              sy = 0.95 + 0.05 * p; // 0.95 -> 1.00
            }
          } else {
            sy = 1.0 + 0.05 * Math.sin(t * Math.PI);
          }
          if (item.origScale) {
            const sxz = 1.0 / Math.sqrt(Math.max(0.4, sy));
            item.obj.scale.set(
              item.origScale.x * sxz,
              item.origScale.y * sy,
              item.origScale.z * sxz
            );
          }
          const jumpHeight = reduzirMovimento ? 0.15 : 0.65;
          const jump = Math.sin(Math.min(1.0, t * 1.2) * Math.PI) * jumpHeight;
          item.obj.position.y = item.origY + Math.max(0, jump);
        }
      }

      // Efeitos visuais de toque 3D flutuantes (estrelinhas / bolhas com subida e fade out)
      for (let i = toquesFlutuantes.length - 1; i >= 0; i--) {
        const tf = toquesFlutuantes[i];
        const el = (timeMs - tf.start) * 0.001;
        const p = el / tf.dur;
        if (p >= 1.0) {
          scene.remove(tf.sprite);
          if (tf.sprite.material) tf.sprite.material.dispose();
          toquesFlutuantes.splice(i, 1);
        } else {
          tf.sprite.position.y = tf.origY + Math.sin(p * (Math.PI / 2)) * 1.8;
          const sc = 0.6 + Math.sin(p * Math.PI) * 0.75;
          tf.sprite.scale.set(sc, sc, sc);
          tf.sprite.material.opacity = Math.max(0, (1 - p * p) * 0.95);
        }
      }

      // Chuva suave de vitória serena (estrelinhas pastéis em tons dourados e menta)
      if (chuvaCelebracao) {
        const el = (timeMs - chuvaCelebracao.userData.start) * 0.001;
        if (el >= chuvaCelebracao.userData.dur) {
          scene.remove(chuvaCelebracao);
          if (chuvaCelebracao.geometry) chuvaCelebracao.geometry.dispose();
          chuvaCelebracao = null;
        } else {
          const pos = chuvaCelebracao.geometry.attributes.position.array;
          for (let i = 1; i < pos.length; i += 3) {
            pos[i] -= 0.045;
            pos[i - 1] += Math.sin(now * 1.8 + i) * 0.008;
          }
          chuvaCelebracao.geometry.attributes.position.needsUpdate = true;
          chuvaCelebracao.rotation.y += 0.002;
          chuvaCelebracao.material.opacity = Math.max(0, 0.95 * (1 - Math.pow(el / chuvaCelebracao.userData.dur, 3)));
        }
      }

      if (confetes) {
        const pos = confetes.geometry.attributes.position.array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] -= 0.08;
          if (pos[i] < 0.2) pos[i] = 20;
        }
        confetes.geometry.attributes.position.needsUpdate = true;
        confetes.rotation.y += 0.003;
      }

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }
    renderLoop();

    // Estado das Missões
    let missaoIdx = 0;
    const missoes = cfg.missoes || [];
    const coletados = new Set();
    let hintTimer = null;

    function removerHintPulse() {
      document.querySelectorAll('.hint-pulse').forEach(el => el.classList.remove('hint-pulse'));
    }

    function focarPistaMissao(idx) {
      focarPista(idx);
    }

    function ativarHintPulse() {
      const m = missoes[missaoIdx];
      if (!m) return;
      const btnOptions = document.getElementById('btnOptions');
      const itemsGrid = document.getElementById('itemsGrid');
      if (btnOptions && btnOptions.style.display !== 'none') {
        const btnA = document.getElementById('btnEscolhaA');
        const btnB = document.getElementById('btnEscolhaB');
        if (m.respostaCerta === (m.opcoes && m.opcoes[0] && m.opcoes[0].id)) {
          if (btnA) btnA.classList.add('hint-pulse');
        } else if (btnB) {
          btnB.classList.add('hint-pulse');
        }
      } else if (itemsGrid && itemsGrid.style.display !== 'none') {
        const firstUncollected = itemsGrid.querySelector('.btn-grid-item:not(.collected)');
        if (firstUncollected) firstUncollected.classList.add('hint-pulse');
      }

      // Câmera guia para o objeto central da missão
      focarPistaMissao(missaoIdx);
    }

    function renderMissao(idx) {
      clearTimeout(hintTimer);
      removerHintPulse();
      hintTimer = setTimeout(ativarHintPulse, 12000);

      missaoIdx = idx;
      const m = missoes[idx];
      if (!m) return;

      document.getElementById('txtMissaoNum').textContent = `Missão ${idx + 1} de ${missoes.length}`;
      const dots = document.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.className = 'dot';
        if (i < idx) dot.classList.add('done');
        else if (i === idx) dot.classList.add('active');
      });

      document.getElementById('qKicker').textContent = m.kicker;
      document.getElementById('qEnunciado').textContent = m.enunciado;

      const fbBox = document.getElementById('feedbackBox');
      fbBox.className = 'feedback-box';
      fbBox.style.display = 'none';

      const btnOptions = document.getElementById('btnOptions');
      const itemsGrid = document.getElementById('itemsGrid');

      if (m.tipo === 'selecao' || m.tipo === 'produtos') {
        btnOptions.style.display = 'none';
        itemsGrid.style.display = 'grid';
        itemsGrid.innerHTML = '';
        coletados.clear();
        (m.itens || []).forEach((it) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn-grid-item';
          btn.innerHTML = `<img src="${it.img}" alt="${it.nome}"><span>${it.nome}</span>`;
          btn.onclick = () => {
            if (coletados.has(it.id)) return;
            coletados.add(it.id);
            btn.classList.add('collected');
            Kit3D.Audio.acerto();
            if (coletados.size === (m.totalRequerido || m.itens.length)) {
              mostrarFeedback(true, m);
            }
          };
          itemsGrid.appendChild(btn);
        });
      } else {
        btnOptions.style.display = 'grid';
        itemsGrid.style.display = 'none';
        if (m.opcoes && m.opcoes.length >= 2) {
          const btnA = document.getElementById('btnEscolhaA');
          const btnB = document.getElementById('btnEscolhaB');
          btnA.querySelector('.ico-box').textContent = m.opcoes[0].ico || '🌿';
          btnA.querySelector('.tit').textContent = m.opcoes[0].tit;
          btnA.querySelector('.desc').textContent = m.opcoes[0].desc;
          btnA.onclick = () => responder(m.opcoes[0].id);

          btnB.querySelector('.ico-box').textContent = m.opcoes[1].ico || '🏡';
          btnB.querySelector('.tit').textContent = m.opcoes[1].tit;
          btnB.querySelector('.desc').textContent = m.opcoes[1].desc;
          btnB.onclick = () => responder(m.opcoes[1].id);
        }
      }

      setCameraPreset(m.cam, idx === 0);
      setTimeout(() => { Kit3D.falar(m.enunciado, 0.85); }, 300);
    }

    function responder(resposta) {
      clearTimeout(hintTimer);
      removerHintPulse();
      const m = missoes[missaoIdx];
      if (!m) return;
      const acertou = resposta === m.respostaCerta;
      if (window.navigator && typeof window.navigator.vibrate === 'function') {
        try { window.navigator.vibrate(acertou ? [25, 40, 25] : [45]); } catch (e) {}
      }
      mostrarFeedback(acertou, m);
    }

    function mostrarFeedback(acertou, m) {
      const fbBox = document.getElementById('feedbackBox');
      const fbTopo = document.getElementById('fbTopo');
      const fbImg = document.getElementById('fbImg');
      const fbTexto = document.getElementById('fbTexto');

      if (acertou) {
        Kit3D.celebrarAcerto();
        fbBox.className = 'feedback-box ok';
        fbTopo.className = 'fb-topo ok';
        fbTopo.textContent = '✓ Muito bem!';
        fbImg.src = m.foto;
        fbImg.alt = m.fotoAlt || 'Foto didática';
        fbTexto.textContent = m.explicacao;
        fbBox.style.display = 'flex';
        Kit3D.falar(m.explicacao, 0.85);
      } else {
        Kit3D.Audio.retry();
        focarPista(missaoIdx);
        fbBox.className = 'feedback-box retry';
        fbTopo.className = 'fb-topo retry';
        fbTopo.textContent = 'Quase lá! Veja a pista na maquete:';
        fbImg.src = m.foto;
        fbTexto.textContent = m.dicaRetry || 'Olhe com calma a área destacada na maquete e tente novamente.';
        fbBox.style.display = 'flex';
        Kit3D.falar(m.dicaRetry || 'Veja a pista na maquete e tente novamente.', 0.85);
      }
    }

    function proxima() {
      if (missaoIdx < missoes.length - 1) {
        renderMissao(missaoIdx + 1);
      } else {
        Kit3D.Audio.fanfarra();
        Kit3D.celebrarAcerto();
        criarConfetes();
        document.getElementById('qCard').style.display = 'none';
        document.getElementById('actionPanel').style.display = 'none';
        document.getElementById('feedbackBox').style.display = 'none';
        document.getElementById('winModal').classList.add('show');
        setCameraPreset('geral');
        Kit3D.falar('Parabéns! Você concluiu todas as missões!', 0.85);
      }
    }

    // Configuração de Eventos
    document.getElementById('btnAudioNormal').onclick = () => {
      Kit3D.falar(missoes[missaoIdx].enunciado, 0.85);
    };
    document.getElementById('btnAudioLento').onclick = () => {
      Kit3D.falar(missoes[missaoIdx].enunciado, 0.55);
    };
    document.getElementById('btnProxima').onclick = () => proxima();

    // Botão de dica visual no card de pergunta
    let btnDica = document.getElementById('btnDicaVisual');
    if (!btnDica) {
      const audioBtns = document.querySelector('#qCard .audio-btns');
      if (audioBtns) {
        btnDica = document.createElement('button');
        btnDica.type = 'button';
        btnDica.id = 'btnDicaVisual';
        btnDica.className = 'btn-som btn-dica';
        btnDica.title = 'Ver pista visual na maquete 3D';
        btnDica.setAttribute('aria-label', 'Ver pista visual na maquete 3D');
        btnDica.innerHTML = '💡 Dica';
        audioBtns.appendChild(btnDica);
      }
    }
    if (btnDica) {
      btnDica.onclick = () => {
        focarPista(missaoIdx);
        const m = missoes[missaoIdx];
        const dicaTexto = (m && m.dicaRetry) || (m && m.explicacao) || 'Observe o objeto destacado no cenário!';
        mostrarTooltip(`💡 ${dicaTexto}`);
        Kit3D.falar(dicaTexto, 0.85);
      };
    }

    // Botões de Câmera da UI
    const camBtnsContainer = document.getElementById('camBtns');
    if (camBtnsContainer && cfg.camBotoes) {
      camBtnsContainer.innerHTML = '';
      cfg.camBotoes.forEach((b) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-cam';
        btn.dataset.cam = b.cam;
        btn.textContent = b.label;
        btn.onclick = () => {
          Kit3D.Audio.toqueObjeto();
          setCameraPreset(b.cam);
        };
        camBtnsContainer.appendChild(btn);
      });
    }

    // Final / Restart
    document.getElementById('btnModoLivre').onclick = () => {
      document.getElementById('winModal').classList.remove('show');
      setCameraPreset('geral');
    };
    document.getElementById('btnReiniciar').onclick = () => {
      document.getElementById('winModal').classList.remove('show');
      document.getElementById('qCard').style.display = 'flex';
      document.getElementById('actionPanel').style.display = 'flex';
      renderMissao(0);
    };

    // Eventos dos Modais de Ficha e Álbum (Fluxo didático otimizado)
    const btnGuardar = document.getElementById('btnGuardarFicha');
    if (btnGuardar) {
      btnGuardar.onclick = fecharFichaModal;
    }
    const btnFecharFicha = document.getElementById('btnFecharFicha');
    if (btnFecharFicha) {
      btnFecharFicha.onclick = fecharFichaModal;
    }
    const btnIrAlbum = document.getElementById('btnIrAlbum');
    if (btnIrAlbum) {
      btnIrAlbum.onclick = () => {
        const m = document.getElementById('fichaModal');
        if (m) m.style.display = 'none';
        abrirAlbum();
      };
    }
    const btnFichaAnt = document.getElementById('btnFichaAnt');
    if (btnFichaAnt) {
      btnFichaAnt.onclick = () => {
        if (!cfg.fichas3d || !fichaAtual) return;
        const descobertas = cfg.fichas3d.filter(f => fichasColetadas.has(f.id));
        const idx = descobertas.findIndex(f => f.id === fichaAtual.id);
        if (idx > 0) {
          abrirFicha(descobertas[idx - 1], null, 'album');
        }
      };
    }
    const btnFichaProx = document.getElementById('btnFichaProx');
    if (btnFichaProx) {
      btnFichaProx.onclick = () => {
        if (!cfg.fichas3d || !fichaAtual) return;
        const descobertas = cfg.fichas3d.filter(f => fichasColetadas.has(f.id));
        const idx = descobertas.findIndex(f => f.id === fichaAtual.id);
        if (idx >= 0 && idx < descobertas.length - 1) {
          abrirFicha(descobertas[idx + 1], null, 'album');
        }
      };
    }
    const btnVerAlbum = document.getElementById('btnVerAlbum');
    if (btnVerAlbum) {
      btnVerAlbum.onclick = abrirAlbum;
    }
    const btnFecharAlbum = document.getElementById('btnFecharAlbum');
    if (btnFecharAlbum) {
      btnFecharAlbum.onclick = () => {
        const m = document.getElementById('albumModal');
        if (m) m.style.display = 'none';
        Kit3D.Audio.toqueObjeto();
      };
    }
    const btnVoltarCenario = document.getElementById('btnVoltarCenario');
    if (btnVoltarCenario) {
      btnVoltarCenario.onclick = () => {
        const m = document.getElementById('albumModal');
        if (m) m.style.display = 'none';
        Kit3D.Audio.toqueObjeto();
      };
    }
    const btnAudioFichaNorm = document.getElementById('btnAudioFichaNorm');
    if (btnAudioFichaNorm) {
      btnAudioFichaNorm.onclick = () => {
        if (fichaAtual) Kit3D.falar(fichaAtual.fato, 0.85);
      };
    }
    const btnAudioFichaLento = document.getElementById('btnAudioFichaLento');
    if (btnAudioFichaLento) {
      btnAudioFichaLento.onclick = () => {
        if (fichaAtual) Kit3D.falar(fichaAtual.fato, 0.55);
      };
    }

    // Acessibilidade por Teclado (Desktop e Tablets com teclado)
    window.addEventListener('keydown', (e) => {
      const fModal = document.getElementById('fichaModal');
      const aModal = document.getElementById('albumModal');
      const fAberto = fModal && fModal.style.display !== 'none';
      const aAberto = aModal && aModal.style.display !== 'none';

      if (e.key === 'Escape') {
        if (fAberto) {
          fecharFichaModal();
        } else if (aAberto) {
          aModal.style.display = 'none';
        }
        return;
      }

      if (fAberto || aAberto) return;

      const k = e.key.toLowerCase();
      if (k === '1' || k === 'a') {
        const btnA = document.getElementById('btnEscolhaA');
        if (btnA && btnA.offsetParent !== null) { btnA.click(); }
      } else if (k === '2' || k === 'b') {
        const btnB = document.getElementById('btnEscolhaB');
        if (btnB && btnB.offsetParent !== null) { btnB.click(); }
      } else if (e.code === 'Space' || k === 'o') {
        e.preventDefault();
        const btnSom = document.getElementById('btnAudioNorm');
        if (btnSom) btnSom.click();
      } else if (k === 'd' || k === 'l') {
        const btnLento = document.getElementById('btnAudioLento');
        if (btnLento) btnLento.click();
      } else if (k === 'm' || k === 'c') {
        const btns = Array.from(document.querySelectorAll('#camBtns .btn-cam'));
        if (btns.length > 0) {
          const curIdx = btns.findIndex(b => b.classList.contains('active'));
          const nextIdx = (curIdx + 1) % btns.length;
          btns[nextIdx].click();
        }
      } else if (k === 'h' || k === 'p') {
        if (btnDica && btnDica.offsetParent !== null) {
          btnDica.click();
        }
      } else if (k === 'r') {
        resetarCameraMissao();
      } else if (e.key === 'Enter') {
        const btnNext = document.getElementById('btnNextMissao');
        if (btnNext && btnNext.offsetParent !== null) {
          btnNext.click();
        }
      }
    });

    // Gera os pontinhos de progresso dinamicamente
    const dotsContainer = document.getElementById('dotsContainer');
    dotsContainer.innerHTML = '';
    missoes.forEach(() => {
      const d = document.createElement('div');
      d.className = 'dot';
      dotsContainer.appendChild(d);
    });

    // Inicia na Missão 0
    renderMissao(0);
    if (cfg.camInicial) {
      setCameraPreset(cfg.camInicial, true);
    }
  };

  global.Kit3D = Kit3D;
})(window);
