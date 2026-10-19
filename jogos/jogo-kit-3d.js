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
  const shadowMapSize = isMobile ? 512 : 1024;

  /* ===== CACHES FLYWEIGHT (Reuso de Materiais e Geometrias) ===== */
  const materialCache = new Map();
  const geometryCache = new Map();

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
    const key = `${tipo}_${cor}_${JSON.stringify(opts)}`;
    if (materialCache.has(key)) return materialCache.get(key);
    let mat;
    const cfg = Object.assign({ color: cor }, opts);
    if (tipo === 'toon') {
      mat = new THREE.MeshToonMaterial(Object.assign({
        color: cor,
        gradientMap: Kit3D.criarRampaToon()
      }, opts));
    } else if (tipo === 'standard') {
      mat = new THREE.MeshStandardMaterial(cfg);
    } else if (tipo === 'phong') {
      mat = new THREE.MeshPhongMaterial(cfg);
    } else if (tipo === 'basic') {
      mat = new THREE.MeshBasicMaterial(cfg);
    } else {
      mat = new THREE.MeshLambertMaterial(cfg);
    }
    materialCache.set(key, mat);
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

    // Texto em caixa alta e negrito
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = opts.fontSize || Math.floor(h * 0.44);
    ctx.font = `bold ${fontSize}px "Baloo 2", Nunito, sans-serif`;
    ctx.fillText(texto.toUpperCase(), w / 2, h / 2 + 3);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
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

  Kit3D.criarCerca = function (x, z, comp, horizontal, cor) {
    const grp = new THREE.Group();
    const posteGeo = Kit3D.geo('cerca_poste', () => new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6));
    const madeiraMat = Kit3D.mat('lambert', cor || 0x8d6e63);
    const num = Math.floor(comp / 2.2);

    // Trilho horizontal superior
    const trilhoGeo = horizontal
      ? new THREE.BoxGeometry(comp, 0.08, 0.1)
      : new THREE.BoxGeometry(0.1, 0.08, comp);
    const trilho = new THREE.Mesh(trilhoGeo, madeiraMat);
    trilho.position.set(x, 0.85, z);
    trilho.castShadow = true;
    grp.add(trilho);

    for (let i = -num / 2; i <= num / 2; i++) {
      const poste = new THREE.Mesh(posteGeo, madeiraMat);
      poste.castShadow = true;
      if (horizontal) poste.position.set(x + i * 2.2, 0.6, z);
      else poste.position.set(x, 0.6, z + i * 2.2);
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
    const corHex = typeof corFundo === 'number' ? '#' + corFundo.toString(16).padStart(6, '0') : (corFundo || '#2e7d32');
    const tex = Kit3D.criarTexturaTexto(texto || 'PLACA', { bg: corHex, fg: '#ffffff', border: '#ffffff' });

    const wPainel = largura || 3.4;
    const hPainel = 1.05;
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

  Kit3D.criarArvore = function (x, z, corCopa, corTronco, tipo) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    // Tronco robusto mais detalhado
    const troncoGeo = Kit3D.geo('arvore_tronco', () => new THREE.CylinderGeometry(0.35, 0.48, 2.5, 8));
    const troncoMat = Kit3D.mat('lambert', corTronco || 0x5d4037);
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);
    tronco.position.y = 1.25;
    tronco.castShadow = true;
    grp.add(tronco);

    // Copa volumosa com mais camadas
    const copaMat = Kit3D.mat('lambert', corCopa || 0x388e3c);
    const copaGeo1 = Kit3D.geo('arvore_copa1', () => new THREE.DodecahedronGeometry(1.75, 1));
    const copaGeo2 = Kit3D.geo('arvore_copa2', () => new THREE.DodecahedronGeometry(1.3, 1));
    const copaGeo3 = Kit3D.geo('arvore_copa3', () => new THREE.DodecahedronGeometry(0.9, 1));

    const copa1 = new THREE.Mesh(copaGeo1, copaMat);
    copa1.position.y = 3.1;
    copa1.castShadow = true;
    grp.add(copa1);

    const copa2 = new THREE.Mesh(copaGeo2, copaMat);
    copa2.position.set(0.35, 4.0, -0.25);
    copa2.castShadow = true;
    grp.add(copa2);

    const copa3 = new THREE.Mesh(copaGeo3, copaMat);
    copa3.position.set(-0.3, 4.6, 0.2);
    copa3.castShadow = true;
    grp.add(copa3);

    // Se for frutífera, adiciona frutas vermelhas/laranjas
    if (tipo === 'frutifera') {
      const frutaGeo = Kit3D.geo('arvore_fruta', () => new THREE.SphereGeometry(0.22, 7, 7));
      const frutaMat = Kit3D.mat('lambert', 0xd32f2f);
      const coords = [
        [-1.0, 2.9, 1.0], [0.9, 3.3, 0.9], [-0.6, 3.8, 0.8],
        [1.0, 2.8, -0.8], [-0.9, 3.2, -0.9], [0.4, 4.1, 0.9]
      ];
      coords.forEach(([fx, fy, fz]) => {
        const fruta = new THREE.Mesh(frutaGeo, frutaMat);
        fruta.position.set(fx, fy, fz);
        grp.add(fruta);
      });
    }

    grp.userData = { interativo: true, nome: tipo === 'frutifera' ? 'Árvore Frutífera' : 'Árvore no Campo' };
    return grp;
  };

  Kit3D.criarPinheiro = function (x, z, corCopa) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const troncoGeo = Kit3D.geo('pinheiro_tronco', () => new THREE.CylinderGeometry(0.28, 0.38, 2.0, 8));
    const troncoMat = Kit3D.mat('lambert', 0x4e342e);
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);
    tronco.position.y = 1.0;
    tronco.castShadow = true;
    grp.add(tronco);

    const mat = Kit3D.mat('lambert', corCopa || 0x1b5e20);
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
    });

    grp.userData = { interativo: true, nome: 'Pinheiro' };
    return grp;
  };

  Kit3D.criarArbusto = function (x, z, cor, corFlores) {
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

    grp.userData = { interativo: true, nome: 'Arbusto' };
    return grp;
  };

  Kit3D.criarFlores = function (parent, x, z, raio, qtd) {
    const count = qtd || 8;
    const rMax = raio || 2.5;
    const cores = [0xffeb3b, 0xff5722, 0xffffff, 0xe91e63, 0xab47bc];
    const hasteMat = Kit3D.mat('lambert', 0x388e3c);
    const hasteGeo = Kit3D.geo('haste_flor', () => new THREE.CylinderGeometry(0.03, 0.03, 0.35, 4));

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * rMax;
      const fx = x + Math.cos(ang) * dist;
      const fz = z + Math.sin(ang) * dist;

      const haste = new THREE.Mesh(hasteGeo, hasteMat);
      haste.position.set(fx, 0.17, fz);
      parent.add(haste);

      const corFl = cores[Math.floor(Math.random() * cores.length)];
      const petala = new THREE.Mesh(
        Kit3D.geo('petala_' + corFl, () => new THREE.SphereGeometry(0.12, 5, 5)),
        Kit3D.mat('lambert', corFl)
      );
      petala.position.set(fx, 0.36, fz);
      parent.add(petala);
    }
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

    // Manchas assimétricas mais orgânicas
    const mancha1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 1.1), manchaMat);
    mancha1.position.set(0, 1.5, 0.35);
    vaca.add(mancha1);

    const mancha2 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 0.8), manchaMat);
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
      nome: 'Vaquinha na Fazenda',
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

    grp.userData = { interativo: true, nome: 'Trator Agrícola' };
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

  Kit3D.criarRio = function (w, d, cor) {
    const geo = new THREE.PlaneGeometry(w, d, 8, 8);
    const mat = Kit3D.mat('phong', cor || 0x29b6f6, {
      transparent: true,
      opacity: 0.88,
      shininess: 95
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.06;
    mesh.userData = { interativo: true, nome: 'Rio de Água Limpa', baseGeo: geo };
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
    const mat = Kit3D.mat('lambert', 0xffffff, { transparent: true, opacity: 0.88 });
    for (let i = 0; i < 7; i++) {
      const nuvem = new THREE.Group();
      for (let j = 0; j < 4; j++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(1.6 + Math.random() * 0.9, 8, 8), mat);
        m.position.set(j * 1.6, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.8);
        nuvem.add(m);
      }
      nuvem.position.set(-30 + Math.random() * 60, 20 + Math.random() * 7, -25 + Math.random() * 45);
      grp.add(nuvem);
    }
    scene.add(grp);
    return grp;
  };

  /* ===== HELPERS DE DIORAMA ESTILIZADO 3D (LOW-POLY PREMIUM) ===== */
  Kit3D.criarIlhaDiorama = function (w, d, h, corGrama, corTerra) {
    const grp = new THREE.Group();
    const espessuraGrama = 0.6;
    const alturaTerra = (h || 4) - espessuraGrama;

    // Placa superior de grama com relevo
    const topoGeo = Kit3D.geo(`ilha_topo_${w}_${d}`, () => new THREE.BoxGeometry(w, espessuraGrama, d));
    const topoMat = Kit3D.mat('toon', corGrama || 0x7eb856);
    const topo = new THREE.Mesh(topoGeo, topoMat);
    topo.position.y = -espessuraGrama / 2;
    topo.receiveShadow = true;
    grp.add(topo);

    // Camada de solo fértil (marrom escuro estilizado)
    const terraGeo = Kit3D.geo(`ilha_terra_${w}_${d}`, () => new THREE.BoxGeometry(w - 0.4, alturaTerra * 0.6, d - 0.4));
    const terraMat = Kit3D.mat('toon', corTerra || 0x5d4037);
    const terra = new THREE.Mesh(terraGeo, terraMat);
    terra.position.y = -espessuraGrama - (alturaTerra * 0.3);
    terra.receiveShadow = true;
    grp.add(terra);

    // Camada de substrato rochoso profundo
    const rochaGeo = Kit3D.geo(`ilha_rocha_${w}_${d}`, () => new THREE.BoxGeometry(w - 0.9, alturaTerra * 0.4, d - 0.9));
    const rochaMat = Kit3D.mat('toon', 0x3e2723);
    const rocha = new THREE.Mesh(rochaGeo, rochaMat);
    rocha.position.y = -espessuraGrama - (alturaTerra * 0.6) - (alturaTerra * 0.2);
    grp.add(rocha);

    // Rochas cravadas na lateral para acabamento artesanal
    const pedraGeo = Kit3D.geo('ilha_pedra_lateral', () => new THREE.DodecahedronGeometry(0.7, 0));
    const pedraMat = Kit3D.mat('toon', 0x757575);
    const pedrasPos = [
      [w / 2 - 0.1, -1.2, -d * 0.25],
      [w / 2 - 0.1, -1.6, d * 0.2],
      [-w / 2 + 0.1, -1.3, -d * 0.15],
      [-w / 2 + 0.1, -1.7, d * 0.3],
      [w * 0.2, -1.5, d / 2 - 0.1],
      [-w * 0.3, -1.4, d / 2 - 0.1],
      [w * 0.15, -1.6, -d / 2 + 0.1]
    ];
    pedrasPos.forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(pedraGeo, pedraMat);
      p.position.set(px, py, pz);
      p.rotation.set(Math.random(), Math.random(), Math.random());
      grp.add(p);
    });

    return grp;
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

    grp.userData = { interativo: true, nome: 'Moinho de Vento da Fazenda' };
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

    grp.userData = { interativo: true, nome: 'Fardo de Feno para os Animais' };
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

    grp.userData = { interativo: true, nome: 'Latão de Leite da Ordenha' };
    return grp;
  };

  Kit3D.criarLagoDiorama = function (x, z, raioX, raioZ, animaveis) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const rx = raioX || 4.5;
    const rz = raioZ || 3.8;

    // Espelho d'água translúcido brilhante
    const aguaGeo = new THREE.CylinderGeometry(rx, rx, 0.12, 20);
    aguaGeo.scale(1, 1, rz / rx);
    const aguaMat = Kit3D.mat('phong', 0x42a5f5, { transparent: true, opacity: 0.82, shininess: 95 });
    const agua = new THREE.Mesh(aguaGeo, aguaMat);
    agua.position.y = 0.08;
    grp.add(agua);

    // Seixos e rochas decorativas na borda do lago
    const seixoGeo = Kit3D.geo('lago_seixo', () => new THREE.DodecahedronGeometry(0.38, 0));
    const seixoMat = Kit3D.mat('toon', 0x8d6e63);
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
    }

    // Vitórias-régias / folhas aquáticas flutuantes com flores de lótus
    const vitoriaGeo = Kit3D.geo('lago_vitoria', () => new THREE.CylinderGeometry(0.48, 0.48, 0.02, 10));
    const vitoriaMat = Kit3D.mat('toon', 0x2e7d32);
    const florGeo = Kit3D.geo('lago_flor', () => new THREE.SphereGeometry(0.14, 6, 6));
    const florMat = Kit3D.mat('toon', 0xf48fb1);

    const vitorias = [
      [-rx * 0.4, -rz * 0.3],
      [rx * 0.3, rz * 0.35],
      [-rx * 0.2, rz * 0.4]
    ];
    const vitoriaMeshes = [];
    vitorias.forEach(([vx, vz], idx) => {
      const vGrp = new THREE.Group();
      vGrp.position.set(vx, 0.15, vz);
      const v = new THREE.Mesh(vitoriaGeo, vitoriaMat);
      vGrp.add(v);

      if (idx !== 1) {
        const fl = new THREE.Mesh(florGeo, florMat);
        fl.position.set(0, 0.1, 0);
        vGrp.add(fl);
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

    if (animaveis) {
      animaveis.push((now) => {
        agua.scale.x = 1 + Math.sin(now * 1.5) * 0.015;
        vitoriaMeshes.forEach((vm, i) => {
          vm.position.y = 0.15 + Math.sin(now * 2 + i * 2) * 0.015;
          vm.rotation.y += 0.003;
        });
      });
    }

    grp.userData = { interativo: true, nome: 'Lago de Água Fresca no Pasto' };
    return grp;
  };

  Kit3D.criarParticulasSol = function (scene, animaveis, count) {
    const qtd = count || 50;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(qtd * 3);
    const velocidades = [];

    for (let i = 0; i < qtd; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = 1.0 + Math.random() * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 36;
      velocidades.push({
        vy: 0.008 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
        amp: 0.008 + Math.random() * 0.008
      });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xfff59d,
      size: 0.35,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    if (animaveis) {
      animaveis.push((now) => {
        const positions = points.geometry.attributes.position.array;
        for (let i = 0; i < qtd; i++) {
          const v = velocidades[i];
          positions[i * 3 + 1] += v.vy;
          positions[i * 3]     += Math.sin(now + v.phase) * v.amp;
          if (positions[i * 3 + 1] > 16) {
            positions[i * 3 + 1] = 1.0;
          }
        }
        points.geometry.attributes.position.needsUpdate = true;
      });
    }
    return points;
  };

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

    grp.userData = { interativo: true, nome: 'Estábulo da Pecuária Intensiva' };
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

  /* ===== MOTOR DO JOGO E MÁQUINA DE ESTADOS ===== */
  Kit3D.iniciar = function (cfg) {
    const container = document.getElementById('container3d');
    const canvas = document.getElementById('canvas3d');
    const tooltipEl = document.getElementById('hudTooltip');

    // Inicialização da Cena Three.js
    const scene = new THREE.Scene();
    
    // Céu dinâmico com shader de gradiente (ou fallback para cor sólida)
    const skyTopo = cfg.skyTopo || 0x87ceeb;
    const skyBase = cfg.skyBase || 0xffffff;
    const skyMesh = Kit3D.criarCeuDinamico(skyTopo, skyBase);
    scene.add(skyMesh);
    
    scene.fog = new THREE.Fog(skyBase, 40, 95);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 160);
    const targetCamPos = new THREE.Vector3(0, 18, 28);
    const targetLookAt = new THREE.Vector3(0, 2, 0);
    const currentLookAt = new THREE.Vector3(0, 2, 0);

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
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Iluminação Natural: Luz Hemisférica (céu azul suave + reflexo de terra/grama)
    const hemiLight = new THREE.HemisphereLight(0xe8f5fe, 0x4e7a2b, 0.65);
    scene.add(hemiLight);

    // Luz Direcional do Sol com sombra suave e sem acne
    const sunLight = new THREE.DirectionalLight(0xfffaec, 1.05);
    sunLight.position.set(22, 34, 24);
    sunLight.castShadow = true;
    sunLight.shadow.normalBias = 0.02;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.mapSize.width = shadowMapSize;
    sunLight.shadow.mapSize.height = shadowMapSize;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    const nuvensGrp = Kit3D.criarNuvens(scene);

    // Constrói o cenário específico do tópico
    const animaveis = [];
    if (typeof cfg.construirCenario === 'function') {
      cfg.construirCenario(scene, Kit3D, animaveis);
    }

    // Animação de salto elástico ao clicar num objeto interativo
    const saltando = [];
    function animarSalto(obj) {
      if (!obj) return;
      saltando.push({
        obj: obj,
        start: performance.now(),
        origY: obj.position.y
      });
    }

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
      }, 2400);
    }

    // ===== FICHAS 3D E ÁLBUM DE DESCOBERTAS (PROPOSTA 1) =====
    const fichasColetadas = new Set();
    const fichaMarkers = [];
    let fichaAtual = null;

    function atualizarContadorFichas() {
      const c = document.getElementById('fichasContador');
      if (c && cfg.fichas3d) {
        c.textContent = `${fichasColetadas.size}/${cfg.fichas3d.length}`;
      }
    }

    function abrirFicha(ficha, markerGrp) {
      fichaAtual = ficha;
      fichasColetadas.add(ficha.id);
      if (markerGrp) {
        animarSalto(markerGrp);
        markerGrp.visible = false;
      }
      Kit3D.Audio.acerto();
      atualizarContadorFichas();

      const fModal = document.getElementById('fichaModal');
      if (fModal) {
        document.getElementById('fichaImg').src = ficha.foto;
        document.getElementById('fichaImg').alt = ficha.nome;
        document.getElementById('fichaTit').textContent = ficha.nome;
        document.getElementById('fichaFato').textContent = ficha.fato;
        fModal.style.display = 'flex';
      }
      Kit3D.falar(ficha.fato, 0.85);

      if (cfg.fichas3d && fichasColetadas.size === cfg.fichas3d.length) {
        setTimeout(() => {
          Kit3D.Audio.fanfarra();
          criarConfetes();
          Kit3D.falar('Parabéns! Você encontrou todas as fotos do álbum!', 0.85);
        }, 500);
      }
    }

    function abrirAlbum() {
      const albModal = document.getElementById('albumModal');
      const grid = document.getElementById('albumGrid');
      if (!albModal || !grid) return;
      grid.innerHTML = '';
      (cfg.fichas3d || []).forEach((f) => {
        const achou = fichasColetadas.has(f.id);
        const item = document.createElement('div');
        item.className = 'album-item ' + (achou ? 'desbloqueado' : 'bloqueado');
        item.innerHTML = `
          <img src="${achou ? f.foto : '../img/fita-autismo.png'}" alt="${achou ? f.nome : 'Bloqueado'}">
          <span>${achou ? f.nome : '???'}</span>
        `;
        if (achou) {
          item.style.cursor = 'pointer';
          item.onclick = () => {
            albModal.style.display = 'none';
            abrirFicha(f, null);
          };
        }
        grid.appendChild(item);
      });
      const sub = document.getElementById('albumSub');
      if (sub && cfg.fichas3d) {
        sub.textContent = `${fichasColetadas.size} de ${cfg.fichas3d.length} fichas descobertas!`;
      }
      albModal.style.display = 'flex';
    }

    if (cfg.fichas3d && cfg.fichas3d.length > 0) {
      const fBtn = document.getElementById('hudFichasBtn');
      if (fBtn) fBtn.style.display = 'block';
      atualizarContadorFichas();

      const marcGeo = Kit3D.geo('ficha_gem', () => new THREE.OctahedronGeometry(0.65, 0));
      const marcMat = Kit3D.mat('phong', 0xffd54f, { emissive: 0xff8f00, emissiveIntensity: 0.55, shininess: 90 });
      const anelGeo = Kit3D.geo('ficha_anel', () => new THREE.TorusGeometry(0.85, 0.07, 6, 16));
      const anelMat = Kit3D.mat('basic', 0xffffff);

      cfg.fichas3d.forEach((f) => {
        const grp = new THREE.Group();
        grp.position.set(f.pos[0], f.pos[1], f.pos[2]);

        const gem = new THREE.Mesh(marcGeo, marcMat);
        gem.castShadow = true;
        grp.add(gem);

        const anel = new THREE.Mesh(anelGeo, anelMat);
        anel.rotation.x = Math.PI / 2;
        grp.add(anel);

        grp.userData = {
          isFicha: true,
          ficha: f,
          baseY: f.pos[1],
          tempo: Math.random() * 10
        };

        scene.add(grp);
        fichaMarkers.push(grp);
      });
    }

    // Raycaster para Toque / Clique didático
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObj = null;

    function tratarClique(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        let cur = intersects[0].object;
        let alvo = null;
        while (cur && cur !== scene) {
          if (cur.userData && cur.userData.isFicha) {
            abrirFicha(cur.userData.ficha, cur);
            return;
          }
          if (cur.userData && cur.userData.interativo) {
            alvo = cur;
            break;
          }
          cur = cur.parent;
        }
        if (alvo) {
          animarSalto(alvo);
          const nome = alvo.userData.nome || 'Objeto do cenário';
          mostrarTooltip(`🔍 ${nome}`);
          Kit3D.Audio.toqueObjeto();
          Kit3D.falar(nome, 0.85);
        }
      }
    }

    // Highlight ao passar o mouse (apenas desktop)
    function tratarHover(clientX, clientY) {
      if (isMobile) return; // Não usa hover em mobile
      
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // Remove highlight do objeto anterior (usando escala em vez de emissive)
      if (hoveredObj) {
        hoveredObj.scale.set(1, 1, 1);
      }
      hoveredObj = null;

      if (intersects.length > 0) {
        let cur = intersects[0].object;
        while (cur && cur !== scene) {
          // Não faz hover em fichas 3D
          if (cur.userData && cur.userData.isFicha) {
            break;
          }
          if (cur.userData && cur.userData.interativo) {
            hoveredObj = cur;
            // Destaque sutil com escala (não interfere com emissive)
            cur.scale.set(1.05, 1.05, 1.05);
            break;
          }
          cur = cur.parent;
        }
      }
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

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Pointer Drag vs Click
    let isDragging = false;
    let dragDistance = 0;
    let startX = 0, startY = 0;
    let prevX = 0;

    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      dragDistance = 0;
      startX = e.clientX;
      startY = e.clientY;
      prevX = e.clientX;
      Kit3D.Audio.init();
      Kit3D.Audio.initOnFirstInteraction(); // Desbloqueia áudio no iOS
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) {
        // Hover quando não está arrastando (apenas desktop)
        if (!isMobile) {
          tratarHover(e.clientX, e.clientY);
        }
        return;
      }
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      dragDistance += Math.abs(dx) + Math.abs(e.clientY - startY);
      const angle = dx * 0.006;
      const offset = new THREE.Vector3().subVectors(targetCamPos, targetLookAt);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
      targetCamPos.copy(targetLookAt).add(offset);
    });

    window.addEventListener('pointerup', (e) => {
      if (isDragging && dragDistance < 8) {
        tratarClique(e.clientX, e.clientY);
      }
      isDragging = false;
    });
    window.addEventListener('pointercancel', () => { isDragging = false; });

    // Câmeras preset
    function setCameraPreset(nome) {
      if (!cfg.cameras || !cfg.cameras[nome]) return;
      const c = cfg.cameras[nome];
      targetCamPos.set(c.pos[0], c.pos[1], c.pos[2]);
      targetLookAt.set(c.look[0], c.look[1], c.look[2]);
    }

    // Loop de renderização
    let composer = null;
    
    // Configura post-processing apenas em desktop e se as bibliotecas foram carregadas
    if (!isMobile && typeof THREE.EffectComposer !== 'undefined') {
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
    }

    function renderLoop() {
      requestAnimationFrame(renderLoop);
      const now = performance.now() * 0.001;
      camera.position.lerp(targetCamPos, 0.045);
      currentLookAt.lerp(targetLookAt, 0.045);
      camera.lookAt(currentLookAt);

      // Deslocamento sutil das nuvens
      if (nuvensGrp) {
        nuvensGrp.position.x = Math.sin(now * 0.04) * 4;
      }

      // Animações cadastradas pelos tópicos (cabeça/cauda de animais, rodas, etc.)
      animaveis.forEach((a) => {
        if (typeof a === 'function') a(now);
      });

      // Flutuação e rotação dos marcadores de fichas 3D
      fichaMarkers.forEach((m) => {
        if (m.visible) {
          m.rotation.y += 0.035;
          m.position.y = m.userData.baseY + Math.sin(now * 3 + m.userData.tempo) * 0.22;
        }
      });

      // Animação de pulo elástico dos objetos tocados
      const timeMs = performance.now();
      for (let i = saltando.length - 1; i >= 0; i--) {
        const item = saltando[i];
        const elapsed = (timeMs - item.start) * 0.001;
        if (elapsed > 0.45) {
          item.obj.position.y = item.origY;
          saltando.splice(i, 1);
        } else {
          const jump = Math.sin((elapsed / 0.45) * Math.PI) * 0.6;
          item.obj.position.y = item.origY + jump;
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

    function renderMissao(idx) {
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

      setCameraPreset(m.cam);
      setTimeout(() => { Kit3D.falar(m.enunciado, 0.85); }, 300);
    }

    function responder(resposta) {
      const m = missoes[missaoIdx];
      if (!m) return;
      if (resposta === m.respostaCerta) {
        mostrarFeedback(true, m);
      } else {
        mostrarFeedback(false, m);
      }
    }

    function mostrarFeedback(acertou, m) {
      const fbBox = document.getElementById('feedbackBox');
      const fbTopo = document.getElementById('fbTopo');
      const fbImg = document.getElementById('fbImg');
      const fbTexto = document.getElementById('fbTexto');

      if (acertou) {
        Kit3D.Audio.acerto();
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
        fbBox.className = 'feedback-box retry';
        fbTopo.className = 'fb-topo retry';
        fbTopo.textContent = 'Quase lá! Tente de novo:';
        fbImg.src = m.foto;
        fbTexto.textContent = m.dicaRetry || 'Releia com calma a pergunta e tente novamente.';
        fbBox.style.display = 'flex';
        Kit3D.falar(m.dicaRetry || 'Tente novamente.', 0.85);
      }
    }

    function proxima() {
      if (missaoIdx < missoes.length - 1) {
        renderMissao(missaoIdx + 1);
      } else {
        Kit3D.Audio.fanfarra();
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

    // Botões de Câmera da UI
    const camBtnsContainer = document.getElementById('camBtns');
    if (camBtnsContainer && cfg.camBotoes) {
      camBtnsContainer.innerHTML = '';
      cfg.camBotoes.forEach((b) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-cam';
        btn.textContent = b.label;
        btn.onclick = () => setCameraPreset(b.cam);
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

    // Eventos dos Modais de Ficha e Álbum (Proposta 1)
    const btnGuardar = document.getElementById('btnGuardarFicha');
    if (btnGuardar) {
      btnGuardar.onclick = () => {
        const m = document.getElementById('fichaModal');
        if (m) m.style.display = 'none';
        Kit3D.Audio.toqueObjeto();
      };
    }
    const btnFecharFicha = document.getElementById('btnFecharFicha');
    if (btnFecharFicha) {
      btnFecharFicha.onclick = () => {
        const m = document.getElementById('fichaModal');
        if (m) m.style.display = 'none';
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
      };
    }
    const btnVoltarCenario = document.getElementById('btnVoltarCenario');
    if (btnVoltarCenario) {
      btnVoltarCenario.onclick = () => {
        const m = document.getElementById('albumModal');
        if (m) m.style.display = 'none';
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
  };

  global.Kit3D = Kit3D;
})(window);
