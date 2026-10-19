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

  /* ===== CACHES FLYWEIGHT (Reuso de Materiais e Geometrias) ===== */
  const materialCache = new Map();
  const geometryCache = new Map();

  Kit3D.mat = function (tipo, cor, opts) {
    opts = opts || {};
    const key = `${tipo}_${cor}_${JSON.stringify(opts)}`;
    if (materialCache.has(key)) return materialCache.get(key);
    let mat;
    const cfg = Object.assign({ color: cor }, opts);
    if (tipo === 'phong') {
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
    init() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
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

    // Tronco robusto
    const troncoGeo = Kit3D.geo('arvore_tronco', () => new THREE.CylinderGeometry(0.32, 0.44, 2.3, 7));
    const troncoMat = Kit3D.mat('lambert', corTronco || 0x5d4037);
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);
    tronco.position.y = 1.15;
    tronco.castShadow = true;
    grp.add(tronco);

    // Copa volumosa com camadas
    const copaMat = Kit3D.mat('lambert', corCopa || 0x388e3c);
    const copaGeo1 = Kit3D.geo('arvore_copa1', () => new THREE.DodecahedronGeometry(1.65, 1));
    const copaGeo2 = Kit3D.geo('arvore_copa2', () => new THREE.DodecahedronGeometry(1.2, 1));

    const copa1 = new THREE.Mesh(copaGeo1, copaMat);
    copa1.position.y = 2.9;
    copa1.castShadow = true;
    grp.add(copa1);

    const copa2 = new THREE.Mesh(copaGeo2, copaMat);
    copa2.position.set(0.3, 3.8, -0.2);
    copa2.castShadow = true;
    grp.add(copa2);

    // Se for frutífera, adiciona frutas vermelhas/laranjas
    if (tipo === 'frutifera') {
      const frutaGeo = Kit3D.geo('arvore_fruta', () => new THREE.SphereGeometry(0.2, 6, 6));
      const frutaMat = Kit3D.mat('lambert', 0xd32f2f);
      const coords = [
        [-0.9, 2.7, 0.9], [0.8, 3.1, 0.8], [-0.5, 3.6, 0.7],
        [0.9, 2.6, -0.7], [-0.8, 3.0, -0.8], [0.3, 3.9, 0.8]
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

    const troncoGeo = Kit3D.geo('pinheiro_tronco', () => new THREE.CylinderGeometry(0.25, 0.35, 1.8, 6));
    const troncoMat = Kit3D.mat('lambert', 0x4e342e);
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);
    tronco.position.y = 0.9;
    tronco.castShadow = true;
    grp.add(tronco);

    const mat = Kit3D.mat('lambert', corCopa || 0x1b5e20);
    [
      { r: 1.8, h: 2.0, y: 2.2 },
      { r: 1.4, h: 1.8, y: 3.4 },
      { r: 0.9, h: 1.6, y: 4.5 }
    ].forEach((c) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(c.r, c.h, 7), mat);
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

    // Telhado de 4 águas ou 2 águas
    const telhadoGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.78, h * 0.65, 4);
    const telhadoMat = Kit3D.mat('lambert', corTelhado || 0xb71c1c);
    const telhado = new THREE.Mesh(telhadoGeo, telhadoMat);
    telhado.position.y = h + (h * 0.65) / 2;
    telhado.rotation.y = Math.PI / 4;
    telhado.castShadow = true;
    grp.add(telhado);

    // Porta frontal de madeira com maçaneta
    const portaMat = Kit3D.mat('lambert', 0x5d4037);
    const porta = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 0.55, 0.1), portaMat);
    porta.position.set(0, (h * 0.55) / 2, d / 2 + 0.05);
    grp.add(porta);

    const macaneta = new THREE.Mesh(Kit3D.geo('macaneta', () => new THREE.SphereGeometry(0.06, 5, 5)), Kit3D.mat('basic', 0xffd54f));
    macaneta.position.set(w * 0.07, (h * 0.55) / 2, d / 2 + 0.12);
    grp.add(macaneta);

    // Janelas com vidros reflexivos e molduras
    const janelaMat = Kit3D.mat('phong', 0xe0f7fa, { shininess: 90 });
    const molduraMat = Kit3D.mat('lambert', 0xffffff);
    [-w * 0.3, w * 0.3].forEach((jx) => {
      const moldura = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.08), molduraMat);
      moldura.position.set(jx, h * 0.62, d / 2 + 0.05);
      grp.add(moldura);

      const vidro = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.09), janelaMat);
      vidro.position.set(jx, h * 0.62, d / 2 + 0.06);
      grp.add(vidro);
    });

    // Chaminé com fumaça
    const chamine = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.6), Kit3D.mat('lambert', 0x8d6e63));
    chamine.position.set(w * 0.28, h + 0.6, -d * 0.1);
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

    // Corpo
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.6), corpoMat);
    corpo.position.y = 1.4;
    corpo.castShadow = true;
    vaca.add(corpo);

    // Manchas assimétricas
    const mancha1 = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.8, 1.0), manchaMat);
    mancha1.position.set(0, 1.45, 0.3);
    vaca.add(mancha1);

    const mancha2 = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.5, 0.7), manchaMat);
    mancha2.position.set(0, 1.6, -0.7);
    vaca.add(mancha2);

    // Cabeça móvel articulada
    const cabeca = new THREE.Group();
    cabeca.position.set(0, 1.85, 1.4);

    const cMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.1, 1.2), corpoMat);
    cMesh.castShadow = true;
    cabeca.add(cMesh);

    // Focinho rosa com narinas
    const focinho = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.52, 0.55), Kit3D.mat('lambert', 0xffcdd2));
    focinho.position.set(0, -0.25, 0.75);
    cabeca.add(focinho);

    const narinaMat = Kit3D.mat('lambert', 0xd81b60);
    [-0.22, 0.22].forEach((nx) => {
      const narina = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.1), narinaMat);
      narina.position.set(nx, -0.22, 1.03);
      cabeca.add(narina);
    });

    // Olhinhos 3D expressivos (esfera branca + pupila preta)
    const olhoGeo = Kit3D.geo('vaca_olho', () => new THREE.SphereGeometry(0.12, 6, 6));
    const pupilaGeo = Kit3D.geo('vaca_pupila', () => new THREE.SphereGeometry(0.07, 6, 6));
    const olhoBrancoMat = Kit3D.mat('basic', 0xffffff);
    const pupilaPretaMat = Kit3D.mat('basic', 0x111111);

    [-0.58, 0.58].forEach((ox) => {
      const olho = new THREE.Mesh(olhoGeo, olhoBrancoMat);
      olho.position.set(ox, 0.15, 0.45);
      cabeca.add(olho);

      const pupila = new THREE.Mesh(pupilaGeo, pupilaPretaMat);
      pupila.position.set(ox > 0 ? ox + 0.04 : ox - 0.04, 0.15, 0.52);
      cabeca.add(pupila);
    });

    // Orelhas caídas
    const orelhaGeo = Kit3D.geo('vaca_orelha', () => new THREE.ConeGeometry(0.16, 0.55, 5));
    [-0.65, 0.65].forEach((ex) => {
      const orelha = new THREE.Mesh(orelhaGeo, corpoMat);
      orelha.position.set(ex, 0.35, 0);
      orelha.rotation.z = ex > 0 ? -Math.PI / 3 : Math.PI / 3;
      cabeca.add(orelha);
    });

    // Chifrinhos de marfim
    const chifreGeo = Kit3D.geo('vaca_chifre', () => new THREE.ConeGeometry(0.1, 0.45, 5));
    const chifreMat = Kit3D.mat('lambert', 0xfff8e1);
    [-0.38, 0.38].forEach((cx) => {
      const chifre = new THREE.Mesh(chifreGeo, chifreMat);
      chifre.position.set(cx, 0.65, 0.1);
      chifre.rotation.z = cx > 0 ? -Math.PI * 0.15 : Math.PI * 0.15;
      cabeca.add(chifre);
    });

    vaca.add(cabeca);

    // Pernas com cascos escuros
    const pernaGeo = Kit3D.geo('vaca_perna', () => new THREE.CylinderGeometry(0.18, 0.18, 0.9, 8));
    const cascoGeo = Kit3D.geo('vaca_casco', () => new THREE.CylinderGeometry(0.19, 0.2, 0.22, 8));
    const cascoMat = Kit3D.mat('lambert', 0x3e2723);

    [[-0.6, 0.9], [0.6, 0.9], [-0.6, -0.9], [0.6, -0.9]].forEach(([px, pz]) => {
      const perna = new THREE.Mesh(pernaGeo, corpoMat);
      perna.position.set(px, 0.55, pz);
      perna.castShadow = true;
      vaca.add(perna);

      const casco = new THREE.Mesh(cascoGeo, cascoMat);
      casco.position.set(px, 0.11, pz);
      casco.castShadow = true;
      vaca.add(casco);
    });

    // Cauda articulada
    const cauda = new THREE.Group();
    cauda.position.set(0, 1.8, -1.3);
    const caudaHaste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 5), corpoMat);
    caudaHaste.position.set(0, -0.5, -0.15);
    caudaHaste.rotation.x = Math.PI * 0.12;
    cauda.add(caudaHaste);

    const penacho = new THREE.Mesh(new THREE.SphereGeometry(0.14, 5, 5), manchaMat);
    penacho.position.set(0, -1.0, -0.28);
    cauda.add(penacho);
    vaca.add(cauda);

    vaca.userData = {
      interativo: true,
      nome: 'Vaquinha na Fazenda',
      cabeca: cabeca,
      cauda: cauda,
      baseHeadY: 1.85,
      tempo: Math.random() * 10
    };

    return vaca;
  };

  Kit3D.criarTrator = function (cor) {
    const grp = new THREE.Group();

    // Chassi principal
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 3.4), Kit3D.mat('lambert', cor || 0x2e7d32));
    corpo.position.y = 1.4;
    corpo.castShadow = true;
    grp.add(corpo);

    // Grade frontal do motor
    const grade = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 0.1), Kit3D.mat('lambert', 0x212121));
    grade.position.set(0, 1.25, 1.72);
    grp.add(grade);

    // Faróis dianteiros brilhantes
    const farolMat = Kit3D.mat('phong', 0xffeb3b, { emissive: 0xffd54f, emissiveIntensity: 0.6 });
    const farolGeo = Kit3D.geo('farol', () => new THREE.SphereGeometry(0.2, 7, 7));
    [-0.8, 0.8].forEach((fx) => {
      const farol = new THREE.Mesh(farolGeo, farolMat);
      farol.position.set(fx, 1.5, 1.72);
      grp.add(farol);
    });

    // Cabine com vidro transparente
    const cabine = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 1.8), Kit3D.mat('phong', 0xe0f7fa, { transparent: true, opacity: 0.65 }));
    cabine.position.set(0, 2.65, -0.4);
    cabine.castShadow = true;
    grp.add(cabine);

    // Teto da cabine
    const teto = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 2.0), Kit3D.mat('lambert', cor || 0x2e7d32));
    teto.position.set(0, 3.5, -0.4);
    grp.add(teto);

    // Cano de escapamento vertical
    const escape = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), Kit3D.mat('lambert', 0x424242));
    escape.position.set(0.85, 2.6, 1.0);
    grp.add(escape);

    // Rodas traseiras grandes com calota
    const rodaGGeo = Kit3D.geo('roda_traseira_g', () => new THREE.CylinderGeometry(0.95, 0.95, 0.55, 12));
    const rodaMat = Kit3D.mat('lambert', 0x212121);
    const calotaMat = Kit3D.mat('lambert', 0xffb300);

    [[-1.35, -0.8], [1.35, -0.8]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaGGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 0.95, rz);
      r.castShadow = true;
      grp.add(r);

      const calota = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.58, 8), calotaMat);
      calota.rotation.z = Math.PI / 2;
      calota.position.set(rx, 0.95, rz);
      grp.add(calota);
    });

    // Rodas dianteiras menores
    const rodaPGeo = Kit3D.geo('roda_dianteira_p', () => new THREE.CylinderGeometry(0.58, 0.58, 0.45, 12));
    [[-1.35, 1.2], [1.35, 1.2]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaPGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 0.58, rz);
      r.castShadow = true;
      grp.add(r);
    });

    grp.userData = { interativo: true, nome: 'Trator Agrícola' };
    return grp;
  };

  Kit3D.criarCaminhao = function (cor) {
    const grp = new THREE.Group();

    // Chassi de metal
    const chassi = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 6.2), Kit3D.mat('lambert', 0x263238));
    chassi.position.y = 0.65;
    chassi.castShadow = true;
    grp.add(chassi);

    // Cabine do motorista
    const cabine = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.3, 2.3), Kit3D.mat('lambert', cor || 0x1976d2));
    cabine.position.set(0, 1.85, 1.7);
    cabine.castShadow = true;
    grp.add(cabine);

    // Pára-brisa
    const parabrisa = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.1, 0.1), Kit3D.mat('phong', 0xe0f7fa, { shininess: 85 }));
    parabrisa.position.set(0, 2.2, 2.86);
    grp.add(parabrisa);

    // Faróis
    const farolMat = Kit3D.mat('phong', 0xffeb3b, { emissive: 0xffd54f, emissiveIntensity: 0.6 });
    [-1.2, 1.2].forEach((fx) => {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), farolMat);
      f.position.set(fx, 1.1, 2.86);
      grp.add(f);
    });

    // Caçamba de carga
    const cacamba = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.7, 3.6), Kit3D.mat('lambert', 0xffb300));
    cacamba.position.set(0, 1.55, -1.2);
    cacamba.castShadow = true;
    grp.add(cacamba);

    // Rodas com eixos duplos
    const rodaGeo = Kit3D.geo('caminhao_roda', () => new THREE.CylinderGeometry(0.58, 0.58, 0.45, 12));
    const rodaMat = Kit3D.mat('lambert', 0x212121);
    [[-1.85, 1.7], [1.85, 1.7], [-1.85, -1.0], [1.85, -1.0], [-1.85, -2.1], [1.85, -2.1]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 0.58, rz);
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

  /* ===== MOTOR DO JOGO E MÁQUINA DE ESTADOS ===== */
  Kit3D.iniciar = function (cfg) {
    const container = document.getElementById('container3d');
    const canvas = document.getElementById('canvas3d');
    const tooltipEl = document.getElementById('hudTooltip');

    // Inicialização da Cena Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(cfg.skyColor || 0xd7ecfd);
    scene.fog = new THREE.Fog(cfg.skyColor || 0xd7ecfd, 40, 95);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 160);
    const targetCamPos = new THREE.Vector3(0, 18, 28);
    const targetLookAt = new THREE.Vector3(0, 2, 0);
    const currentLookAt = new THREE.Vector3(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Iluminação Natural: Luz Hemisférica (céu azul suave + reflexo de terra/grama)
    const hemiLight = new THREE.HemisphereLight(0xe8f5fe, 0x4e7a2b, 0.65);
    scene.add(hemiLight);

    // Luz Direcional do Sol com sombra suave
    const sunLight = new THREE.DirectionalLight(0xfffaec, 0.95);
    sunLight.position.set(22, 34, 24);
    sunLight.castShadow = true;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
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

    // Raycaster para Toque / Clique didático
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

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
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
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

      renderer.render(scene, camera);
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
