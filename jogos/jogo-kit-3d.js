/* jogos/jogo-kit-3d.js — Motor e helpers compartilhados para jogos 3D (Three.js r128).
   Reduz centenas de linhas repetidas: gerenciamento de cena, iluminação, áudio, TTS,
   construção de modelos low-poly e controle de missões com feedback didático para TEA. */
(function (global) {
  'use strict';

  const Kit3D = {};

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

  /* ===== HELPERS DE CONSTRUÇÃO LOW-POLY 3D ===== */
  Kit3D.criarChao = function (w, d, cor) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = new THREE.MeshLambertMaterial({ color: cor || 0x86c232 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return mesh;
  };

  Kit3D.criarEstrada = function (w, d, cor) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = new THREE.MeshLambertMaterial({ color: cor || 0xd9b382 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    mesh.receiveShadow = true;
    return mesh;
  };

  Kit3D.criarArvore = function (x, z, corCopa, corTronco) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const troncoGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.2, 7);
    const troncoMat = new THREE.MeshLambertMaterial({ color: corTronco || 0x5d4037 });
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);
    tronco.position.y = 1.1;
    tronco.castShadow = true;
    grp.add(tronco);

    const copaGeo = new THREE.DodecahedronGeometry(1.6, 1);
    const copaMat = new THREE.MeshLambertMaterial({ color: corCopa || 0x388e3c });
    const copa = new THREE.Mesh(copaGeo, copaMat);
    copa.position.y = 2.9;
    copa.castShadow = true;
    grp.add(copa);

    return grp;
  };

  Kit3D.criarCerca = function (x, z, comp, horizontal, cor) {
    const grp = new THREE.Group();
    const posteGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6);
    const madeiraMat = new THREE.MeshLambertMaterial({ color: cor || 0x8d6e63 });
    const num = Math.floor(comp / 2.2);
    for (let i = -num / 2; i <= num / 2; i++) {
      const poste = new THREE.Mesh(posteGeo, madeiraMat);
      poste.castShadow = true;
      if (horizontal) poste.position.set(x, 0.6, z + i * 2.2);
      else poste.position.set(x + i * 2.2, 0.6, z);
      grp.add(poste);
    }
    return grp;
  };

  Kit3D.criarPlaca = function (x, z, texto, corFundo) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const posteGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6);
    const posteMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const poste = new THREE.Mesh(posteGeo, posteMat);
    poste.position.y = 0.9;
    grp.add(poste);

    const painelGeo = new THREE.BoxGeometry(3.2, 0.9, 0.15);
    const painelMat = new THREE.MeshLambertMaterial({ color: corFundo || 0x2e7d32 });
    const painel = new THREE.Mesh(painelGeo, painelMat);
    painel.position.y = 1.7;
    painel.castShadow = true;
    grp.add(painel);

    return grp;
  };

  Kit3D.criarCasa = function (w, h, d, corParede, corTelhado) {
    const grp = new THREE.Group();
    const paredeGeo = new THREE.BoxGeometry(w, h, d);
    const paredeMat = new THREE.MeshLambertMaterial({ color: corParede || 0xffffff });
    const parede = new THREE.Mesh(paredeGeo, paredeMat);
    parede.position.y = h / 2;
    parede.castShadow = true;
    grp.add(parede);

    const telhadoGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, h * 0.65, 4);
    const telhadoMat = new THREE.MeshLambertMaterial({ color: corTelhado || 0xb71c1c });
    const telhado = new THREE.Mesh(telhadoGeo, telhadoMat);
    telhado.position.y = h + (h * 0.65) / 2;
    telhado.rotation.y = Math.PI / 4;
    telhado.castShadow = true;
    grp.add(telhado);

    return grp;
  };

  Kit3D.criarPredio = function (w, h, d, cor) {
    const grp = new THREE.Group();
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshLambertMaterial({ color: cor || 0x78909c });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    grp.add(mesh);

    // Janelas simples
    const janGeo = new THREE.BoxGeometry(w + 0.05, 0.6, d + 0.05);
    const janMat = new THREE.MeshLambertMaterial({ color: 0xe0f7fa });
    for (let y = 1.5; y < h - 0.5; y += 1.8) {
      const jan = new THREE.Mesh(janGeo, janMat);
      jan.position.y = y;
      grp.add(jan);
    }
    return grp;
  };

  Kit3D.criarVaca = function (corCorpo, corManchas) {
    const vaca = new THREE.Group();
    const corpoGeo = new THREE.BoxGeometry(1.8, 1.4, 2.6);
    const corpoMat = new THREE.MeshLambertMaterial({ color: corCorpo || 0xffffff });
    const corpo = new THREE.Mesh(corpoGeo, corpoMat);
    corpo.position.y = 1.4;
    corpo.castShadow = true;
    vaca.add(corpo);

    const manchaGeo = new THREE.BoxGeometry(1.85, 0.8, 1.0);
    const manchaMat = new THREE.MeshLambertMaterial({ color: corManchas || 0x222222 });
    const mancha = new THREE.Mesh(manchaGeo, manchaMat);
    mancha.position.set(0, 1.4, 0.3);
    vaca.add(mancha);

    const cabeca = new THREE.Group();
    cabeca.position.set(0, 1.8, 1.4);
    const cMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.2), corpoMat);
    cMesh.castShadow = true;
    cabeca.add(cMesh);

    const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xffcdd2 }));
    focinho.position.set(0, -0.25, 0.7);
    cabeca.add(focinho);
    vaca.add(cabeca);
    vaca.userData = { cabeca: cabeca, baseHeadY: 1.8, tempo: Math.random() * 10 };

    const pernaGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.0, 8);
    [[-0.6, 0.9], [0.6, 0.9], [-0.6, -0.9], [0.6, -0.9]].forEach(([px, pz]) => {
      const perna = new THREE.Mesh(pernaGeo, corpoMat);
      perna.position.set(px, 0.5, pz);
      perna.castShadow = true;
      vaca.add(perna);
    });
    return vaca;
  };

  Kit3D.criarTrator = function (cor) {
    const grp = new THREE.Group();
    // Chassi
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 3.4), new THREE.MeshLambertMaterial({ color: cor || 0x2e7d32 }));
    corpo.position.y = 1.4;
    corpo.castShadow = true;
    grp.add(corpo);

    // Cabine
    const cabine = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 1.8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    cabine.position.set(0, 2.6, -0.4);
    grp.add(cabine);

    // Rodas traseiras grandes
    const rodaGGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.5, 12);
    const rodaMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
    [[-1.3, -0.8], [1.3, -0.8]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaGGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 0.9, rz);
      grp.add(r);
    });

    // Rodas dianteiras menores
    const rodaPGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12);
    [[-1.3, 1.2], [1.3, 1.2]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaPGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 0.55, rz);
      grp.add(r);
    });
    return grp;
  };

  Kit3D.criarCaminhao = function (cor) {
    const grp = new THREE.Group();
    const chassi = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 6), new THREE.MeshLambertMaterial({ color: 0x263238 }));
    chassi.position.y = 0.6;
    chassi.castShadow = true;
    grp.add(chassi);

    const cabine = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 2.2), new THREE.MeshLambertMaterial({ color: cor || 0x1976d2 }));
    cabine.position.set(0, 1.8, 1.6);
    cabine.castShadow = true;
    grp.add(cabine);

    const cacamba = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.6, 3.4), new THREE.MeshLambertMaterial({ color: 0xffb300 }));
    cacamba.position.set(0, 1.5, -1.2);
    cacamba.castShadow = true;
    grp.add(cacamba);

    const rodaGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12);
    const rodaMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
    [[-1.8, 1.6], [1.8, 1.6], [-1.8, -1.4], [1.8, -1.4]].forEach(([rx, rz]) => {
      const r = new THREE.Mesh(rodaGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(rx, 0.55, rz);
      r.castShadow = true;
      grp.add(r);
    });
    return grp;
  };

  Kit3D.criarRio = function (w, d, cor) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = new THREE.MeshLambertMaterial({ color: cor || 0x4fa3e3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.05;
    return mesh;
  };

  Kit3D.criarRochas = function (x, z, cor) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);
    const rochaMat = new THREE.MeshLambertMaterial({ color: cor || 0x757575 });
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.6, 0), rochaMat);
      r.position.set((Math.random() - 0.5) * 3, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 3);
      r.rotation.set(Math.random(), Math.random(), Math.random());
      r.castShadow = true;
      grp.add(r);
    }
    return grp;
  };

  Kit3D.criarNuvens = function (scene) {
    const grp = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 6; i++) {
      const nuvem = new THREE.Group();
      for (let j = 0; j < 3; j++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(1.6 + Math.random() * 0.8, 7, 7), mat);
        m.position.set(j * 1.5, Math.random() * 0.4, 0);
        nuvem.add(m);
      }
      nuvem.position.set(-25 + Math.random() * 50, 18 + Math.random() * 6, -20 + Math.random() * 35);
      grp.add(nuvem);
    }
    scene.add(grp);
    return grp;
  };

  /* ===== MOTOR DO JOGO E MÁQUINA DE ESTADOS ===== */
  Kit3D.iniciar = function (cfg) {
    const container = document.getElementById('container3d');
    const canvas = document.getElementById('canvas3d');

    // Inicialização da Cena Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(cfg.skyColor || 0xd7ecfd);
    scene.fog = new THREE.Fog(cfg.skyColor || 0xd7ecfd, 35, 80);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 150);
    const targetCamPos = new THREE.Vector3(0, 18, 28);
    const targetLookAt = new THREE.Vector3(0, 2, 0);
    const currentLookAt = new THREE.Vector3(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Luzes
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6dd, 0.95);
    sunLight.position.set(18, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    Kit3D.criarNuvens(scene);

    // Constrói o cenário específico do tópico
    const animaveis = [];
    if (typeof cfg.construirCenario === 'function') {
      cfg.construirCenario(scene, Kit3D, animaveis);
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
        pos.push((Math.random() - 0.5) * 30, 15 + Math.random() * 15, (Math.random() - 0.5) * 25);
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

    // Pointer Drag
    let isDragging = false;
    let prevX = 0;
    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      Kit3D.Audio.init();
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      const angle = dx * 0.006;
      const offset = new THREE.Vector3().subVectors(targetCamPos, targetLookAt);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
      targetCamPos.copy(targetLookAt).add(offset);
    });
    window.addEventListener('pointerup', () => { isDragging = false; });
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
      camera.position.lerp(targetCamPos, 0.04);
      currentLookAt.lerp(targetLookAt, 0.04);
      camera.lookAt(currentLookAt);

      animaveis.forEach((a) => {
        if (typeof a === 'function') a(now);
      });

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
        // Configura rótulos dos dois botões de escolha
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

    // Botoes de Câmera da UI
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
