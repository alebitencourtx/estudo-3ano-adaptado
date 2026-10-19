/* jogos/impactos/dados-3d.js — Dados declarativos do jogo 3D de Impactos Ambientais.
   Lido por jogos/jogar-3d.html?topico=impactos. Usa os helpers em ../jogo-kit-3d.js. */
(function (global) {
  'use strict';
  global.DADOS_3D = global.DADOS_3D || {};

  global.DADOS_3D.impactos = {
    id: 'imp-3d',
    topico: 'impactos',
    titulo: 'Cenário 3D: Campo e Cidade',
    icone: '🌍',
    referenciaLivro: 'p. 108 a 113 · base do livro',
    skyColor: 0xd7ecfd,
    skyTopo: 0x90a4ae, /* Cinza para céu urbano */
    skyBase: 0x81c784, /* Verde no horizonte */
    hudTags: ['🚜 Campo (Lavoura e Mata)', '🏙️ Cidade (Urbano e Rios)'],

    visual: {
      cor: true,
      exposicao: 1.05,
      ceu: { topo: 0x90a4ae, base: 0x81c784 },
      nevoa: { cor: 0xc8e6c9, perto: 75, longe: 180 }
    },

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🚜 Olhar Campo', cam: 'campo' },
      { label: '🏙️ Olhar Cidade', cam: 'cidade' },
      { label: '💚 Boas Ações', cam: 'acoes' },
      { label: '📐 Isométrica', cam: 'isometrica' }
    ],

    cameras: {
      geral:      { pos: [0, 32, 44],   look: [0, 2, -2] },
      campo:      { pos: [-16, 18, 28], look: [-16, 2, -2] },
      cidade:     { pos: [16, 18, 28],  look: [16, 2, -2] },
      acoes:      { pos: [6.5, 12, 22], look: [6.5, 1.8, 7.5] },
      isometrica: { pos: [32, 32, 32],  look: [0, 2, 0] }
    },

    fichas3d: [
      {
        id: 'imp-agro',
        pos: [-11.0, 4.0, 3.5],
        nome: '🌾 Cuidado no Campo',
        foto: '../img/hga/imp/agrotoxico.jpg',
        fato: 'Evitar o excesso de agrotóxicos e irrigação protege as plantas, o solo e a nossa saúde.'
      },
      {
        id: 'imp-rio',
        pos: [2.0, 3.8, 3.5],
        nome: '💧 Rio com Água Limpa',
        foto: '../img/hga/imp/esgoto.jpg',
        fato: 'Tratar o esgoto e não jogar lixo mantém os rios limpos para toda a comunidade.'
      },
      {
        id: 'imp-cidade',
        pos: [12.5, 4.0, -1.0],
        nome: '🚗 Trânsito e Poluição',
        foto: '../img/hga/imp/engarrafamento.jpg',
        fato: 'Muitos carros juntos geram fumaça e trânsito; transporte coletivo ajuda a cidade.'
      },
      {
        id: 'imp-arvores',
        pos: [-15.5, 4.0, -3.5],
        nome: '🌳 Proteger as Florestas',
        foto: '../img/hga/imp/desmatamento.jpg',
        fato: 'Cuidar das matas preserva o solo, o clima e protege a casa dos animais.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // 1. PEDESTAL DA ILHA DIORAMA FLUTUANTE
      scene.add(kit.criarIlhaDiorama(72, 48, 4.0, 0x7cb342, 0x3e2723));

      // 2. RIO CENTRAL CORTANDO O CENÁRIO COM CONTRASTE: ÁGUA CRISTALINA E REMÉDIOS SUSTENTÁVEIS
      // --- A) PARTE MONTANTE (LADO POSITIVO): RIO CRISTALINO COM SEIXOS E VITÓRIAS-RÉGIAS ---
      // Textura procedural com transição de cor suave e límpida para as águas preservadas (TEA-friendly)
      function criarTexturaRioPreservado() {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 512;
        const ctx = c.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        // Nascente na mata tropical (z = -24): azul turquesa sereno profundo
        grad.addColorStop(0.0, '#00838f');
        grad.addColorStop(0.25, '#00acc1');
        grad.addColorStop(0.55, '#26c6da');
        // Trecho raso e límpido com seixos lisos
        grad.addColorStop(0.8, '#4dd0e1');
        // Transição suave para a ponte de integração (z = -1)
        grad.addColorStop(1.0, '#80deea');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 512);

        // Ondulações cáusticas suaves no leito
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        for (let y = 25; y < 510; y += 42) {
          ctx.beginPath();
          ctx.ellipse(64 + Math.sin(y * 0.05) * 18, y, 40, 12, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
      }

      const matRioLimpo = kit.mat('phong', 0xffffff, {
        map: criarTexturaRioPreservado(),
        transparent: true,
        opacity: 0.88,
        shininess: 90
      });

      // Sistema reativo de borbulhas do rio límpido
      const borbulhasAtivas = [];
      const matBorbulha = kit.mat('phong', 0xe0f7fa, {
        transparent: true,
        opacity: 0.85,
        shininess: 100
      });
      function gerarBorbulhas(bx, bz) {
        const agora = performance.now() * 0.001;
        for (let i = 0; i < 7; i++) {
          const bGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.07, 8, 8);
          const bMesh = new THREE.Mesh(bGeo, matBorbulha.clone());
          bMesh.position.set(
            bx + (Math.random() - 0.5) * 1.1,
            0.08,
            bz + (Math.random() - 0.5) * 1.1
          );
          scene.add(bMesh);
          borbulhasAtivas.push({
            mesh: bMesh,
            vy: 0.018 + Math.random() * 0.02,
            vx: (Math.random() - 0.5) * 0.008,
            vz: (Math.random() - 0.5) * 0.008,
            nasc: agora,
            vida: 0.9 + Math.random() * 0.5
          });
        }
      }

      const rioLimpo = new THREE.Mesh(new THREE.PlaneGeometry(6, 24), matRioLimpo);
      rioLimpo.rotation.x = -Math.PI / 2;
      rioLimpo.position.set(0, 0.07, -12);
      rioLimpo.userData = {
        interativo: true,
        pistaMissao: [0, 2],
        nome: '💧 Rio de água limpa e preservada: fonte de vida protegida pela mata ciliar e respeito à natureza.',
        som: 'splash',
        aoClicar: function (obj, kitRef) {
          gerarBorbulhas(0, -12);
          if (kitRef && kitRef.Audio && kitRef.Audio.splash) kitRef.Audio.splash();
          if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(0, 0.25, -12), '🫧');
        }
      };
      scene.add(rioLimpo);

      // Margem verde límpida do rio
      const margemRioLimpo = kit.criarChao(7.6, 24, 0x81c784);
      margemRioLimpo.position.set(0, 0.04, -12);
      scene.add(margemRioLimpo);

      // Seixos lisos e arredondados no leito e margens do rio cristalino
      const seixosRio = [];
      const matSeixos = [
        kit.mat('lambert', 0x90a4ae),
        kit.mat('lambert', 0xbcaaa4),
        kit.mat('lambert', 0x78909c),
        kit.mat('lambert', 0xd7ccc8),
        kit.mat('lambert', 0x546e7a)
      ];
      [
        { x: -1.8, z: -19, s: 0.32 },
        { x: -0.6, z: -17, s: 0.40 },
        { x: 1.2,  z: -20, s: 0.35 },
        { x: 1.9,  z: -16, s: 0.28 },
        { x: -1.2, z: -14, s: 0.36 },
        { x: 0.4,  z: -12, s: 0.42 },
        { x: -1.7, z: -10, s: 0.30 },
        { x: 1.5,  z: -8,  s: 0.38 },
        { x: -0.5, z: -6,  s: 0.34 },
        { x: 1.8,  z: -5,  s: 0.26 }
      ].forEach((p, idx) => {
        const sx = new THREE.Mesh(
          new THREE.DodecahedronGeometry(p.s, 0),
          matSeixos[idx % matSeixos.length]
        );
        sx.scale.set(1.2, 0.6, 1.0);
        sx.position.set(p.x, 0.1, p.z);
        sx.castShadow = true;
        sx.receiveShadow = true;
        sx.userData = {
          interativo: true,
          pistaMissao: [0, 2],
          nome: '🪨 Seixo liso do leito do rio: rocha polida pela correnteza límpida e limpa.',
          som: 'splash',
          aoClicar: function (obj, kitRef) {
            gerarBorbulhas(p.x, p.z);
            if (kitRef && kitRef.Audio && kitRef.Audio.splash) kitRef.Audio.splash();
            if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(p.x, 0.2, p.z), '🫧');
          }
        };
        scene.add(sx);
        seixosRio.push(sx);
      });

      // Vitórias-régias estilizadas completas com rebordo, sombras e flores de lótus
      const vitoriasRegias = [];
      const criarVitoriaRegia = (vx, vz, raio, comFlor) => {
        const vGrp = new THREE.Group();
        vGrp.position.set(vx, 0.08, vz);

        // Prato circular verde da vitória-régia
        const pratoGeo = new THREE.CylinderGeometry(raio, raio, 0.03, 16);
        const pratoMat = kit.mat('lambert', 0x2e7d32);
        const prato = new THREE.Mesh(pratoGeo, pratoMat);
        prato.castShadow = true;
        prato.receiveShadow = true;
        vGrp.add(prato);

        // Rebordo elevado característico da folha
        const rebordoGeo = new THREE.CylinderGeometry(raio, raio, 0.05, 16, 1, true, 0, Math.PI * 1.85);
        const rebordoMat = kit.mat('lambert', 0x388e3c);
        const rebordo = new THREE.Mesh(rebordoGeo, rebordoMat);
        rebordo.position.y = 0.028;
        vGrp.add(rebordo);

        // Sombra de contato suave na água sob a vitória-régia
        const sombraFolha = kit.criarSombraContato(0, 0, raio * 1.05, raio * 1.05, 0.28);
        sombraFolha.position.y = -0.008;
        vGrp.add(sombraFolha);

        // Flor de lótus desabrochada (se aplicável)
        if (comFlor) {
          const florGrp = new THREE.Group();
          florGrp.position.set(0, 0.05, 0);

          // Pétalas externas rosa pastel
          const petalaRosaMat = kit.mat('toon', 0xf48fb1);
          for (let p = 0; p < 6; p++) {
            const ang = (p / 6) * Math.PI * 2;
            const petala = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), petalaRosaMat);
            petala.position.set(Math.cos(ang) * 0.12, 0.05, Math.sin(ang) * 0.12);
            petala.rotation.set(0.3, ang, 0.2);
            florGrp.add(petala);
          }

          // Pétalas internas brancas
          const petalaBrancaMat = kit.mat('toon', 0xffffff);
          for (let p = 0; p < 5; p++) {
            const ang = (p / 5) * Math.PI * 2 + 0.3;
            const petala = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), petalaBrancaMat);
            petala.position.set(Math.cos(ang) * 0.07, 0.08, Math.sin(ang) * 0.07);
            petala.rotation.set(0.2, ang, 0.1);
            florGrp.add(petala);
          }

          // Miolo dourado de pólen
          const miolo = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), kit.mat('toon', 0xffd54f));
          miolo.position.y = 0.1;
          florGrp.add(miolo);

          vGrp.add(florGrp);
        }

        vGrp.userData = {
          interativo: true,
          pistaMissao: [0, 2],
          nome: comFlor
            ? '🌸 Vitória-régia com flor desabrochada: planta aquática nativa que flutua nas águas limpas e puras.'
            : '🍃 Vitória-régia: grande folha circular que flutua serenamente no rio preservado.',
          som: 'splash',
          baseY: 0.08,
          fase: vx * 0.6 + vz * 0.5 + Math.random(),
          aoClicar: function (obj, kitRef) {
            gerarBorbulhas(vx, vz);
            if (kitRef && kitRef.Audio && kitRef.Audio.splash) kitRef.Audio.splash();
            if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(vx, 0.2, vz), '🫧');
          }
        };
        scene.add(vGrp);
        vitoriasRegias.push(vGrp);
        return vGrp;
      };

      [
        { x: -1.2, z: -18, r: 0.72, flor: true },
        { x: 0.9,  z: -15, r: 0.60, flor: true },
        { x: -0.5, z: -12, r: 0.68, flor: false },
        { x: 1.3,  z: -9,  r: 0.54, flor: true },
        { x: -1.0, z: -6,  r: 0.65, flor: false }
      ].forEach((vr) => criarVitoriaRegia(vr.x, vr.z, vr.r, vr.flor));

      // Peixinhos estilizados nadando serenamente no rio límpido
      const peixesRio = [];
      function criarPeixinho(px, pz, cor, escala) {
        const pGrp = new THREE.Group();
        pGrp.position.set(px, 0.05, pz);

        // Corpo alongado e fusiforme do peixinho
        const corpoGeo = new THREE.ConeGeometry(0.16 * escala, 0.62 * escala, 8);
        const corpoMat = kit.mat('phong', cor, { shininess: 90 });
        const corpo = new THREE.Mesh(corpoGeo, corpoMat);
        corpo.rotation.x = Math.PI / 2;
        pGrp.add(corpo);

        // Barbatana caudal oscilante
        const caudaMat = kit.mat('phong', cor, { side: THREE.DoubleSide, shininess: 85 });
        const cauda = new THREE.Mesh(new THREE.ConeGeometry(0.14 * escala, 0.26 * escala, 4), caudaMat);
        cauda.position.z = 0.38 * escala;
        cauda.rotation.x = -Math.PI / 2;
        pGrp.add(cauda);

        // Olhinhos expressivos
        const olhoMat = kit.mat('basic', 0xffffff);
        const pupilaMat = kit.mat('basic', 0x212121);
        [-0.09 * escala, 0.09 * escala].forEach((ox) => {
          const olho = new THREE.Mesh(new THREE.SphereGeometry(0.04 * escala, 4, 4), olhoMat);
          olho.position.set(ox, 0.04 * escala, -0.16 * escala);
          const pupila = new THREE.Mesh(new THREE.SphereGeometry(0.02 * escala, 4, 4), pupilaMat);
          pupila.position.set(ox * 1.1, 0.04 * escala, -0.18 * escala);
          pGrp.add(olho);
          pGrp.add(pupila);
        });

        pGrp.userData = {
          interativo: true,
          pistaMissao: [0, 2],
          nome: '🐟 Peixinho do rio límpido: nada com vigor nas águas limpas, oxigenadas e protegidas pela mata.',
          som: 'splash',
          baseX: px,
          baseZ: pz,
          fase: px * 2.0 + pz * 1.5,
          cauda: cauda,
          aoClicar: function (obj, kitRef) {
            gerarBorbulhas(obj.position.x, obj.position.z);
            if (kitRef && kitRef.Audio && kitRef.Audio.splash) kitRef.Audio.splash();
            if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(obj.position, '🫧');
          }
        };

        scene.add(pGrp);
        peixesRio.push(pGrp);
        return pGrp;
      }

      criarPeixinho(-0.9, -17, 0xff9800, 1.0);  // Peixinho dourado
      criarPeixinho(0.8, -13, 0xffb74d, 0.85);  // Peixinho amarelo ouro
      criarPeixinho(-0.5, -9, 0x00bcd4, 0.9);   // Peixinho azul turquesa
      criarPeixinho(0.6, -5, 0xff7043, 0.8);    // Peixinho coral

      // Pedrinhas decorativas, tufos de grama estilizados e flores campestres nas margens e caminhos
      [-19, -14, -9, -4, 2, 7, 13, 18].forEach((pz, idx) => {
        // Margem do rio e mata ciliar (lado do campo preservado)
        kit.criarPedrinhasDecorativas(scene, -3.8, pz, 7, 1.2, { escala: 0.85, cores: [0x90a4ae, 0xbcaaa4, 0x81c784] });
        kit.criarTufosGramaDecorativos(scene, -3.75, pz + (idx % 2 === 0 ? 0.7 : -0.7), 5, 0.9, animaveis, 0x7cb342);
        if (idx % 2 === 0) {
          kit.criarFloresCampestresCaminho(scene, -3.9, pz + 1.0, 5, 0.9, animaveis, [0xffffff, 0xfff9c4, 0xf8bbd0]);
        }

        // Caminhos de pedestres do lado urbano / praça sustentável (x = 4.2)
        kit.criarPedrinhasDecorativas(scene, 4.2, pz + 0.8, 6, 1.1, { escala: 0.8, cores: [0xb0bec5, 0xcfd8dc, 0x78909c] });
        kit.criarTufosGramaDecorativos(scene, 4.15, pz + (idx % 2 === 0 ? -0.7 : 0.7), 4, 0.8, animaveis, 0x66bb6a);
        if (idx % 2 !== 0) {
          kit.criarFloresCampestresCaminho(scene, 4.3, pz - 1.0, 5, 0.9, animaveis, [0xffffff, 0xe1bee7, 0xbbdefb]);
        }
      });

      // Discos suaves de reflexo cáustico nas águas cristalinas sobre as pedras e seixos
      const matCausticaDisco = kit.mat('basic', 0x80deea, { transparent: true, opacity: 0.28, depthWrite: false });
      const matReflexoPedras = kit.mat('basic', 0xb3e5fc, { transparent: true, opacity: 0.35, depthWrite: false });
      [-17, -13, -8].forEach((cz) => {
        const causticaMesh = new THREE.Mesh(new THREE.CircleGeometry(1.8, 14), matCausticaDisco);
        causticaMesh.rotation.x = -Math.PI / 2;
        causticaMesh.position.set(0, 0.075, cz);
        scene.add(causticaMesh);

        // Reflexo cintilante cristalino concentrado junto às pedras e seixos
        const reflexoPedraMesh = new THREE.Mesh(new THREE.CircleGeometry(0.85, 10), matReflexoPedras);
        reflexoPedraMesh.rotation.x = -Math.PI / 2;
        reflexoPedraMesh.position.set((cz % 2 === 0 ? 0.6 : -0.6), 0.082, cz + 0.3);
        scene.add(reflexoPedraMesh);
      });

      // Luz cáustica serena azul-turquesa cristalina iluminando os seixos e pedras do leito do rio (TEA)
      const luzRio = new THREE.PointLight(0x4fc3f7, 1.15, 12.0);
      luzRio.position.set(0, 1.6, -12);
      scene.add(luzRio);

      const luzRioMontante = new THREE.PointLight(0x80d8ff, 1.05, 10.5);
      luzRioMontante.position.set(0, 1.4, -18);
      scene.add(luzRioMontante);

      // --- B) PARTE JUSANTE: RIO EM RECUPERAÇÃO / DESAFIO URBANO ---
      const rioPoluido = kit.criarRio(6, 24, 0x455a64);
      rioPoluido.position.set(0, 0.06, 12);
      rioPoluido.userData = {
        interativo: true,
        pistaMissao: [2, 4],
        nome: '⚠️ Rio poluído: o esgoto sem tratamento e o lixo jogado adoecem as águas e trazem perigo à saúde.',
        som: 'splash'
      };
      scene.add(rioPoluido);

      // Ponte ligando Campo e Cidade no centro
      const ponte = kit.criarEstrada(7, 4.5, 0x90a4ae);
      ponte.position.set(0, 0.12, -1);
      ponte.userData = {
        interativo: true,
        nome: '🌉 Ponte de integração: conecta o campo à cidade sobre o leito do rio.',
        som: 'pop'
      };
      scene.add(ponte);
      scene.add(kit.criarCerca(0, -3.2, 7, false, 0x546e7a));
      scene.add(kit.criarCerca(0, 1.2, 7, false, 0x546e7a));

      // Cano de esgoto e efluente
      const canoEsgoto = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 2.2, 12),
        kit.mat('lambert', 0x37474f)
      );
      canoEsgoto.rotation.z = Math.PI / 2;
      canoEsgoto.position.set(3, 0.4, 5);
      canoEsgoto.castShadow = true;
      canoEsgoto.userData = {
        interativo: true,
        pistaMissao: [2, 4],
        nome: '🚯 Cano de esgoto sem tratamento: precisa ser canalizado para uma estação de tratamento para proteger os rios.',
        som: 'pop'
      };
      scene.add(canoEsgoto);

      const manchaEsgoto = new THREE.Mesh(
        new THREE.CircleGeometry(1.6, 12),
        kit.mat('lambert', 0x212121)
      );
      manchaEsgoto.rotation.x = -Math.PI / 2;
      manchaEsgoto.position.set(1.5, 0.08, 5);
      manchaEsgoto.userData = canoEsgoto.userData;
      scene.add(manchaEsgoto);

      // Lixo flutuando suavemente no trecho urbano
      const lixoObjetos = [];
      const coresLixo = [0xd32f2f, 0xfbc02d, 0xffffff, 0x8d6e63];
      for (let i = 0; i < 6; i++) {
        const mat = kit.mat('lambert', coresLixo[i % coresLixo.length]);
        const geo = i % 2 === 0 ? new THREE.BoxGeometry(0.35, 0.25, 0.45) : new THREE.CylinderGeometry(0.18, 0.18, 0.5, 8);
        const l = new THREE.Mesh(geo, mat);
        l.position.set(-1.8 + Math.random() * 3.6, 0.1, 3 + i * 2.8);
        l.rotation.set(Math.random(), Math.random(), Math.random());
        l.userData = {
          baseY: 0.1,
          fase: Math.random() * Math.PI * 2,
          interativo: true,
          pistaMissao: [2, 4],
          nome: '🗑️ Resíduos e lixo descartados: o lixo jogado no rio polui a água e causa enchentes.',
          som: 'pop'
        };
        scene.add(l);
        lixoObjetos.push(l);
      }

      // ==========================================
      // LADO ESQUERDO: CAMPO E FLORESTA TROPICAL
      // ==========================================
      const grpCampo = new THREE.Group();
      grpCampo.position.set(-18, 0, 0);

      const chaoCampo = kit.criarChao(30, 44, 0x7cb342);
      chaoCampo.position.y = 0.03;
      grpCampo.add(chaoCampo);

      // --- 3. COPA EXUBERANTE DA FLORESTA TROPICAL ESTRATIFICADA (CANOPY) ---
      function criarArvoreExuberante(ax, az, corCopa, corTronco) {
        const arvoreGrp = new THREE.Group();
        arvoreGrp.position.set(ax, 0, az);

        // Tronco imponente com raízes tabulares
        const tronco = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.48, 4.2, 8),
          kit.mat('lambert', corTronco || 0x4e342e)
        );
        tronco.position.y = 2.1;
        tronco.castShadow = true;
        arvoreGrp.add(tronco);

        // Raízes superficiais ancoradas no solo
        [0, Math.PI * 0.6, Math.PI * 1.3].forEach((ang) => {
          const raiz = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.9), kit.mat('lambert', corTronco || 0x4e342e));
          raiz.position.set(Math.cos(ang) * 0.5, 0.18, Math.sin(ang) * 0.5);
          raiz.rotation.y = ang;
          arvoreGrp.add(raiz);
        });

        // Copas estratificadas em múltiplos níveis (canopy exuberante)
        const matC = kit.mat('lambert', corCopa || 0x1b5e20);
        const matC2 = kit.mat('lambert', 0x2e7d32);
        const matC3 = kit.mat('lambert', 0x388e3c);

        const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), matC);
        c1.position.y = 4.2;
        c1.castShadow = true;
        arvoreGrp.add(c1);

        const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.7, 1), matC2);
        c2.position.set(0.6, 5.4, 0.4);
        c2.castShadow = true;
        arvoreGrp.add(c2);

        const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), matC3);
        c3.position.set(-0.5, 6.2, -0.3);
        c3.castShadow = true;
        arvoreGrp.add(c3);

        arvoreGrp.userData = {
          interativo: true,
          pistaMissao: [0, 2],
          nome: '🌳 Árvore nativa da mata preservada: copa exuberante que protege o solo e abriga a biodiversidade.',
          som: 'pop',
          aoClicar: function (obj, kitRef) {
            if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(ax - 18, 5, az), '🌳');
            if (kitRef && kitRef.Audio && kitRef.Audio.pop) kitRef.Audio.pop();
          }
        };

        return arvoreGrp;
      }

      grpCampo.add(criarArvoreExuberante(-8, -16, 0x1b5e20, 0x4e342e));
      grpCampo.add(criarArvoreExuberante(-4, -17, 0x2e7d32, 0x5d4037));
      grpCampo.add(criarArvoreExuberante(-9, -11, 0x388e3c, 0x5d4037));
      grpCampo.add(criarArvoreExuberante(-2, -14, 0x2e7d32, 0x4e342e));
      grpCampo.add(criarArvoreExuberante(-5, -9, 0x1b5e20, 0x5d4037));
      grpCampo.add(criarArvoreExuberante(-10, -5, 0x388e3c, 0x4e342e));
      grpCampo.add(kit.criarRochas(-6, -13, 0x757575));
      grpCampo.add(kit.criarPlaca(-4, -5, 'MATA PRESERVADA', 0x2e7d32));

      // Luz solar filtrada quente (dappled sunlight) descendo através da copa das árvores
      const luzSolCanopy = new THREE.PointLight(0xfff59d, 1.15, 18.0);
      luzSolCanopy.position.set(-6, 8.5, -12);
      grpCampo.add(luzSolCanopy);

      // Manchas suaves de luz solar filtrada (dappled light) brilhando na copa das árvores
      const matDappleCopa = kit.mat('basic', 0xfff9c4, { transparent: true, opacity: 0.32, depthWrite: false });
      [
        { x: -8, y: 4.8, z: -16, r: 0.8 },
        { x: -4, y: 4.6, z: -17, r: 0.75 },
        { x: -9, y: 5.1, z: -11, r: 0.85 },
        { x: -5, y: 4.9, z: -9,  r: 0.8 }
      ].forEach((dc) => {
        const patchCopa = new THREE.Mesh(new THREE.SphereGeometry(dc.r, 8, 8), matDappleCopa);
        patchCopa.position.set(dc.x, dc.y, dc.z);
        grpCampo.add(patchCopa);
      });

      // Feixes volumétricos translúcidos de luz solar filtrada (crepuscular sunbeams)
      const matFeixeCanopy = kit.mat('basic', 0xfff9c4, {
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const feixesCanopy = [];
      [
        { x: -5.5, y: 3.2, z: -13.0, rx: 0.12, rz: -0.15, h: 5.5, r: 1.5 },
        { x: -8.0, y: 3.5, z: -8.5,  rx: -0.10, rz: 0.14, h: 6.0, r: 1.6 },
        { x: -3.2, y: 3.0, z: -15.5, rx: 0.08, rz: -0.12, h: 5.0, r: 1.3 }
      ].forEach((sb) => {
        const fGeo = new THREE.ConeGeometry(sb.r, sb.h, 12, 1, true);
        const fMesh = new THREE.Mesh(fGeo, matFeixeCanopy);
        fMesh.position.set(sb.x, sb.y, sb.z);
        fMesh.rotation.x = Math.PI + sb.rx;
        fMesh.rotation.z = sb.rz;
        grpCampo.add(fMesh);
        feixesCanopy.push(fMesh);
      });

      // Manchas suaves de luz dourada (dappled light pools) no solo da floresta
      const matDappledPool = kit.mat('basic', 0xfff9c4, {
        transparent: true,
        opacity: 0.26,
        depthWrite: false
      });
      [
        { x: -5.5, z: -13.0, r: 1.3 },
        { x: -8.0, z: -8.5,  r: 1.4 },
        { x: -3.2, z: -15.5, r: 1.1 },
        { x: -6.8, z: -11.0, r: 0.9 }
      ].forEach((dp) => {
        const pMesh = new THREE.Mesh(new THREE.CircleGeometry(dp.r, 12), matDappledPool);
        pMesh.rotation.x = -Math.PI / 2;
        pMesh.position.set(dp.x, 0.045, dp.z);
        grpCampo.add(pMesh);
      });

      // Samambaias e arbustos de sub-bosque tropical
      [-7, -3, -9].forEach((sx, idx) => {
        const samambaia = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 6), kit.mat('lambert', 0x43a047));
        samambaia.position.set(sx, 0.25, -11 - idx * 2.5);
        grpCampo.add(samambaia);
      });

      // --- 4. ORQUÍDEAS FLORIDAS NOS TRONCOS DAS ÁRVORES E ROCHAS ---
      function criarOrquideaFlor(ox, oy, oz, corPetala) {
        const orqGrp = new THREE.Group();
        orqGrp.position.set(ox, oy, oz);
        orqGrp.userData = {
          interativo: true,
          nome: '🌸 Orquídea silvestre: flor nativa da floresta tropical que floresce em equilíbrio com a mata.',
          som: 'pop'
        };

        // Folhas verdes carnosas
        [-0.15, 0.15].forEach((lx) => {
          const folha = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.12), kit.mat('lambert', 0x2e7d32));
          folha.position.set(lx, 0, 0);
          folha.rotation.z = lx > 0 ? 0.35 : -0.35;
          orqGrp.add(folha);
        });

        // Pétalas coloridas da orquídea (magenta/lilás/rosa)
        const matP = kit.mat('phong', corPetala || 0xab47bc, { shininess: 80 });
        for (let p = 0; p < 5; p++) {
          const ang = (p / 5) * Math.PI * 2;
          const petala = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 5), matP);
          petala.scale.set(1.4, 0.5, 0.8);
          petala.position.set(Math.cos(ang) * 0.14, Math.sin(ang) * 0.14, 0.05);
          petala.rotation.z = ang;
          orqGrp.add(petala);
        }

        // Labelo central amarelo
        const centro = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), kit.mat('basic', 0xffeb3b));
        centro.position.set(0, 0, 0.1);
        orqGrp.add(centro);

        return orqGrp;
      }

      grpCampo.add(criarOrquideaFlor(-4.8, 1.8, -9, 0xab47bc));
      grpCampo.add(criarOrquideaFlor(-4.8, 2.3, -9, 0xf06292));
      grpCampo.add(criarOrquideaFlor(-8.8, 1.6, -11, 0xffd54f));
      grpCampo.add(criarOrquideaFlor(-2.2, 1.9, -13.8, 0xba68c8));
      grpCampo.add(criarOrquideaFlor(-6.2, 0.7, -13, 0xf06292)); // na rocha

      // --- 5. BORBOLETAS AZUIS MORPHO VOANDO SOBRE A FLORESTA E RIO ---
      const borboletasMorpho = [];
      const matMorphoAsa = kit.mat('phong', 0x00b0ff, {
        side: THREE.DoubleSide,
        shininess: 95
      });
      const matMorphoBorda = kit.mat('basic', 0x1565c0, { side: THREE.DoubleSide });

      for (let b = 0; b < 4; b++) {
        const bGrp = new THREE.Group();
        bGrp.userData = {
          baseX: -6 + b * 2.5,
          baseZ: -12 + (b % 2) * 5,
          baseY: 2.2 + (b % 3) * 0.4,
          fase: b * 1.5,
          interativo: true,
          nome: '🦋 Borboleta azul Morpho: voa suavemente pela floresta tropical preservada.',
          som: 'pop'
        };

        // Asas esquerda e direita com tom azul elétrico iridescente
        const asaEsq = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.22), matMorphoAsa);
        asaEsq.position.x = -0.16;
        bGrp.add(asaEsq);

        const asaDir = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.22), matMorphoAsa);
        asaDir.position.x = 0.16;
        bGrp.add(asaDir);

        bGrp.position.set(bGrp.userData.baseX, bGrp.userData.baseY, bGrp.userData.baseZ);
        bGrp.userData.asaEsq = asaEsq;
        bGrp.userData.asaDir = asaDir;
        grpCampo.add(bGrp);
        borboletasMorpho.push(bGrp);
      }

      // --- 6. REMÉDIO SUSTENTÁVEL: MATA CILIAR PROTETORA AO LONGO DO RIO ---
      const mataCiliarGrp = new THREE.Group();
      mataCiliarGrp.position.set(13.8, 0, -12);
      mataCiliarGrp.userData = {
        interativo: true,
        pistaMissao: [0, 2],
        nome: '🌿 Mata ciliar protetora: faixa verde de árvores na margem do rio que age como um filtro natural, segura a terra e evita o assoreamento.',
        som: 'pop'
      };

      // Árvores ciliares nativas formando corredor ecológico
      [-8, -4, 0, 4, 8].forEach((cz, idx) => {
        const alt = 2.4 + (idx % 2) * 0.6;
        const troncoC = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, alt, 6), kit.mat('lambert', 0x5d4037));
        troncoC.position.set(0, alt * 0.5, cz);
        troncoC.castShadow = true;
        mataCiliarGrp.add(troncoC);

        const copaC = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), kit.mat('lambert', (idx % 2 === 0) ? 0x2e7d32 : 0x388e3c));
        copaC.position.set(0, alt + 0.5, cz);
        copaC.castShadow = true;
        mataCiliarGrp.add(copaC);

        // Raízes visíveis protegendo a margem
        const raizC = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.4), kit.mat('lambert', 0x4e342e));
        raizC.position.set(0.3, 0.08, cz);
        mataCiliarGrp.add(raizC);
      });

      // Arbustos e juncos ao longo da mata ciliar
      for (let jz = -9; jz <= 9; jz += 2.2) {
        const junco = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 5), kit.mat('lambert', 0x43a047));
        junco.position.set(0.4, 0.35, jz);
        mataCiliarGrp.add(junco);
      }

      grpCampo.add(mataCiliarGrp);
      grpCampo.add(kit.criarPlaca(13.8, -3, 'MATA CILIAR', 0x1b5e20));

      // --- 7. ÁREA DESAFIADA E REMÉDIO: CANTEIRO DE MUDAS DE REFLORESTAMENTO ---
      const chaoDesmatado = kit.criarChao(14, 14, 0xa1887f);
      chaoDesmatado.position.set(-4, 0.04, 11);
      chaoDesmatado.userData = {
        interativo: true,
        pistaMissao: [1, 2],
        nome: '🪵 Solo degradado pelo desmatamento: terra empobrecida e desprotegida da vegetação natural.',
        som: 'pop'
      };
      grpCampo.add(chaoDesmatado);

      // Tocos remanescentes com anéis de crescimento
      const tocoGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.45, 8);
      const tocoMat = kit.mat('lambert', 0x4e342e);
      const topoMat = kit.mat('lambert', 0xd7ccc8);
      [
        [-7, 8], [-2, 7], [-8, 15]
      ].forEach(([tx, tz]) => {
        const toco = new THREE.Mesh(tocoGeo, tocoMat);
        toco.position.set(tx, 0.22, tz);
        toco.castShadow = true;
        const anel = new THREE.Mesh(new THREE.CircleGeometry(0.33, 8), topoMat);
        anel.rotation.x = -Math.PI / 2;
        anel.position.set(tx, 0.46, tz);
        const dadosToco = {
          interativo: true,
          pistaMissao: [1, 2],
          nome: '🪵 Toco remanescente: marca do desmatamento que destrói a mata e leva animais à extinção.',
          som: 'pop',
          aoClicar: function (obj, kitRef) {
            if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(tx - 18, 0.6, tz), '🪵');
            if (kitRef && kitRef.Audio && kitRef.Audio.pop) kitRef.Audio.pop();
          }
        };
        toco.userData = dadosToco;
        anel.userData = dadosToco;
        grpCampo.add(toco);
        grpCampo.add(anel);
      });

      // Tronco caído de alerta
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.8, 6), tocoMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = 0.4;
      log.position.set(-5, 0.2, 9);
      log.userData = {
        interativo: true,
        pistaMissao: [1, 2],
        nome: '🪵 Tronco caído pelo desmatamento: perda da mata que prejudica o solo e o clima.',
        som: 'pop',
        aoClicar: function (obj, kitRef) {
          if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(-23, 0.6, 9), '🪵');
          if (kitRef && kitRef.Audio && kitRef.Audio.pop) kitRef.Audio.pop();
        }
      };
      grpCampo.add(log);
      grpCampo.add(kit.criarPlaca(-7, 6, 'DESMATAMENTO', 0xc62828));

      // Canteiro de mudas de árvores nativas em tubetes (solução sustentável ativa)
      const canteiroMudas = new THREE.Group();
      canteiroMudas.position.set(-2.0, 0, 12.5);

      // Caixa de madeira do viveiro de mudas
      const caixaViveiro = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 2.4), kit.mat('lambert', 0x6d4c41));
      caixaViveiro.position.y = 0.18;
      caixaViveiro.castShadow = true;
      canteiroMudas.add(caixaViveiro);

      const terraViveiro = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 2.2), kit.mat('lambert', 0x3e2723));
      terraViveiro.position.y = 0.35;
      canteiroMudas.add(terraViveiro);

      // Fileiras de mudinhas jovens em crescimento com folhas reativas
      const folhasCanteiro = [];
      for (let mx = -1.3; mx <= 1.3; mx += 0.65) {
        for (let mz = -0.7; mz <= 0.7; mz += 0.7) {
          // Tubete preto
          const tubete = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.25, 6), kit.mat('lambert', 0x212121));
          tubete.position.set(mx, 0.42, mz);
          canteiroMudas.add(tubete);

          // Caule e folhas da mudinha jovem
          const caule = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), kit.mat('lambert', 0x558b2f));
          caule.position.set(mx, 0.65, mz);
          canteiroMudas.add(caule);

          const folhasMuda = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 5), kit.mat('lambert', 0x43a047));
          folhasMuda.position.set(mx, 0.8, mz);
          canteiroMudas.add(folhasMuda);
          folhasCanteiro.push(folhasMuda);
        }
      }

      canteiroMudas.userData = {
        interativo: true,
        pistaMissao: [3, 5],
        nome: '🌱 Canteiro de mudas de reflorestamento: pequenas árvores cultivadas em tubetes para restaurar a floresta e proteger o solo.',
        som: 'pop',
        folhas: folhasCanteiro,
        aoClicar: function (obj, kitRef) {
          // Folhinhas verdes brotando alegremente com som pop
          if (obj.userData.folhas) {
            obj.userData.folhas.forEach((folha, idx) => {
              setTimeout(() => {
                try {
                  folha.scale.set(1.9, 2.2, 1.9);
                  folha.material.color.setHex(0x76ff03);
                  setTimeout(() => {
                    try {
                      folha.scale.set(1.0, 1.0, 1.0);
                      folha.material.color.setHex(0x43a047);
                    } catch (e) {}
                  }, 320);
                } catch (e) {}
              }, (idx % 5) * 45);
            });
          }
          if (kitRef && kitRef.Audio && kitRef.Audio.pop) kitRef.Audio.pop();
          if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(-20, 1.2, 12.5), '🌱');
        }
      };
      grpCampo.add(canteiroMudas);

      // Árvores jovens de reflorestamento com estacas tutoras de bambu
      function criarMudaComTutor(ax, az) {
        const mGrp = new THREE.Group();
        mGrp.position.set(ax, 0, az);

        // Estaca tutora de madeira
        const estaca = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), kit.mat('lambert', 0x8d6e63));
        estaca.position.set(0.12, 1.0, 0);
        mGrp.add(estaca);

        // Caule jovem
        const caule = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6), kit.mat('lambert', 0x5d4037));
        caule.position.y = 0.9;
        mGrp.add(caule);

        // Copa jovem
        const copa = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 0), kit.mat('lambert', 0x43a047));
        copa.position.y = 2.0;
        copa.castShadow = true;
        mGrp.add(copa);

        mGrp.userData = {
          interativo: true,
          pistaMissao: [3, 5],
          nome: '🌳 Reflorestamento ativo: árvore jovem plantada com estaca de suporte para restaurar a floresta nativa.',
          som: 'pop',
          copa: copa,
          aoClicar: function (obj, kitRef) {
            if (obj.userData.copa) {
              obj.userData.copa.scale.set(1.4, 1.4, 1.4);
              obj.userData.copa.material.color.setHex(0x76ff03);
              setTimeout(() => {
                try {
                  obj.userData.copa.scale.set(1.0, 1.0, 1.0);
                  obj.userData.copa.material.color.setHex(0x43a047);
                } catch (e) {}
              }, 350);
            }
            if (kitRef && kitRef.Audio && kitRef.Audio.pop) kitRef.Audio.pop();
            if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(ax - 18, 2.5, az), '🌱');
          }
        };
        return mGrp;
      }

      grpCampo.add(criarMudaComTutor(1.0, 10));
      grpCampo.add(criarMudaComTutor(-0.5, 14.5));
      grpCampo.add(kit.criarPlaca(1.0, 7.5, 'REFLORESTAMENTO', 0x2e7d32));

      // Lavoura, irrigação e trator
      const lavoura = kit.criarChao(8, 36, 0x8d6e63);
      lavoura.position.set(8.5, 0.04, 0);
      grpCampo.add(lavoura);

      const plantRowMat = kit.mat('lambert', 0x558b2f);
      for (let z = -14; z <= 14; z += 3.2) {
        const row = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.35, 1.2), plantRowMat);
        row.position.set(8.5, 0.2, z);
        grpCampo.add(row);
      }

      const canalAgua = kit.criarRio(1.4, 22, 0x42a5f5);
      canalAgua.position.set(13.2, 0.07, 4);
      canalAgua.userData = {
        interativo: true,
        pistaMissao: 3,
        nome: '💧 Canal de irrigação agrícola: canaliza água dos rios para a lavoura.',
        som: 'splash'
      };
      grpCampo.add(canalAgua);

      const aspersorHaste = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), kit.mat('lambert', 0xb0bec5));
      aspersorHaste.position.set(8.5, 1.3, -4);
      aspersorHaste.userData = {
        interativo: true,
        pistaMissao: 3,
        nome: '💧 Aspersor de irrigação: prática que consome volume excessivo de água dos rios.',
        som: 'pop'
      };
      grpCampo.add(aspersorHaste);

      const aspersorTubo = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.0, 6), kit.mat('lambert', 0x90a4ae));
      aspersorTubo.rotation.z = Math.PI / 2;
      aspersorTubo.position.set(8.5, 2.5, -4);
      aspersorTubo.userData = aspersorHaste.userData;
      grpCampo.add(aspersorTubo);

      const trator = kit.criarTrator(0x2e7d32);
      trator.position.set(8.5, 0, 7);
      trator.rotation.y = -Math.PI * 0.15;
      trator.userData = {
        interativo: true,
        pistaMissao: 1,
        nome: '🚜 Trator no campo: mecanização da agricultura que aumentou a colheita, mas substituiu o trabalho manual.',
        som: 'buzina'
      };
      grpCampo.add(trator);

      scene.add(grpCampo);

      // ==========================================
      // LADO DIREITO: CIDADE, ENCOSTA E BOAS AÇÕES
      // ==========================================
      const grpCidade = new THREE.Group();
      grpCidade.position.set(18, 0, 0);

      const chaoCidade = kit.criarChao(30, 44, 0x90a4ae);
      chaoCidade.position.y = 0.03;
      grpCidade.add(chaoCidade);

      // Avenida com tráfego
      const avenida = kit.criarChao(7, 44, 0x263238);
      avenida.position.set(-5, 0.05, 0);
      grpCidade.add(avenida);

      const faixaMat = kit.mat('basic', 0xffffff);
      for (let z = -20; z <= 20; z += 4) {
        const faixa = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 2.2), faixaMat);
        faixa.rotation.x = -Math.PI / 2;
        faixa.position.set(-5, 0.06, z);
        grpCidade.add(faixa);
      }

      function criarCarro(cor) {
        const c = new THREE.Group();
        const chassi = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.65, 3.2), kit.mat('lambert', cor));
        chassi.position.y = 0.55;
        chassi.castShadow = true;
        c.add(chassi);

        // Sombra de contato suave e alinhada sob o veículo
        const sombraCarro = kit.criarSombraContato(0, 0, 1.25, 2.1, 0.44);
        sombraCarro.position.y = 0.04;
        c.add(sombraCarro);

        const cabine = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 1.6), kit.mat('lambert', 0xffffff));
        cabine.position.set(0, 1.15, -0.2);
        cabine.castShadow = true;
        c.add(cabine);

        const rGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 10);
        const rMat = kit.mat('lambert', 0x212121);
        [[-0.9, 0.9], [0.9, 0.9], [-0.9, -0.9], [0.9, -0.9]].forEach(([rx, rz]) => {
          const r = new THREE.Mesh(rGeo, rMat);
          r.rotation.z = Math.PI / 2;
          r.position.set(rx, 0.35, rz);
          c.add(r);
        });

        c.userData = {
          interativo: true,
          nome: '🚗 Carro na cidade: o excesso de veículos individuais gera trânsito e polui o ar.',
          som: 'buzina'
        };
        return c;
      }

      const carroAzul = criarCarro(0x1976d2);
      carroAzul.position.set(-6.6, 0, -8);
      grpCidade.add(carroAzul);

      const carroVermelho = criarCarro(0xd32f2f);
      carroVermelho.position.set(-3.4, 0, 10);
      carroVermelho.rotation.y = Math.PI;
      grpCidade.add(carroVermelho);

      const carroAmarelo = criarCarro(0xfbc02d);
      carroAmarelo.position.set(-6.6, 0, 4);
      grpCidade.add(carroAmarelo);

      // Prédios urbanos ao fundo
      const dadosPredioUrbano = {
        interativo: true,
        nome: '🏙️ Edifícios da cidade: concentram residências e comércios urbanos.',
        som: 'pop'
      };
      const p1 = kit.criarPredio(5, 14, 5, 0x546e7a);
      p1.position.set(2, 0, -15);
      p1.userData = dadosPredioUrbano;
      grpCidade.add(p1);

      const p2 = kit.criarPredio(6, 18, 6, 0x37474f);
      p2.position.set(9, 0, -14);
      p2.userData = dadosPredioUrbano;
      grpCidade.add(p2);

      const p3 = kit.criarPredio(5, 11, 5, 0x78909c);
      p3.position.set(2, 0, -7);
      p3.userData = dadosPredioUrbano;
      grpCidade.add(p3);

      const p4 = kit.criarPredio(6, 15, 5, 0x455a64);
      p4.position.set(9, 0, -6);
      p4.userData = dadosPredioUrbano;
      grpCidade.add(p4);

      // --- 8. REMÉDIO SUSTENTÁVEL: BANCADAS DE CONTENÇÃO E CURVAS DE NÍVEL NA ENCOSTA ---
      const encostaGrp = new THREE.Group();
      encostaGrp.position.set(7, 0, 12);

      // Morro escalonado em bancadas de contenção (terraços anti-erosão)
      const baseMorro = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 13), kit.mat('lambert', 0x8d6e63));
      baseMorro.position.y = 0.6;
      baseMorro.castShadow = true;
      encostaGrp.add(baseMorro);

      const patamarMorro = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.2, 11.5), kit.mat('lambert', 0x795548));
      patamarMorro.position.set(0.5, 1.8, 0.5);
      patamarMorro.castShadow = true;
      encostaGrp.add(patamarMorro);

      // Cobertura vegetal em grama verde de contenção (capim vetiver)
      const gramaVetiver1 = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 12.8), kit.mat('lambert', 0x689f38));
      gramaVetiver1.rotation.x = -Math.PI / 2;
      gramaVetiver1.position.y = 1.21;
      encostaGrp.add(gramaVetiver1);

      const gramaVetiver2 = new THREE.Mesh(new THREE.PlaneGeometry(9.3, 11.3), kit.mat('lambert', 0x558b2f));
      gramaVetiver2.rotation.x = -Math.PI / 2;
      gramaVetiver2.position.set(0.5, 2.41, 0.5);
      encostaGrp.add(gramaVetiver2);

      // Paliçadas de retenção com troncos de madeira nas bordas dos terraços
      const matPalicada = kit.mat('lambert', 0x5d4037);
      for (let pz = -5.5; pz <= 5.5; pz += 1.4) {
        const estaca = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6), matPalicada);
        estaca.position.set(-4.8, 1.2, pz);
        estaca.castShadow = true;
        encostaGrp.add(estaca);
      }
      for (let pz = -4.5; pz <= 4.5; pz += 1.4) {
        const estaca2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6), matPalicada);
        estaca2.position.set(-4.0, 2.4, pz);
        estaca2.castShadow = true;
        encostaGrp.add(estaca2);
      }

      // Moradias seguras no topo do morro estabilizado
      const c1 = kit.criarCasa(2.6, 2.0, 2.4, 0xffe0b2, 0xd32f2f);
      c1.position.set(-1.5, 2.4, -2.5);
      encostaGrp.add(c1);

      const c2 = kit.criarCasa(2.4, 1.8, 2.2, 0xffcc80, 0xb71c1c);
      c2.position.set(1.5, 2.4, 2.5);
      encostaGrp.add(c2);

      encostaGrp.userData = {
        interativo: true,
        pistaMissao: [0, 4, 5],
        nome: '🛡️ Contenção de encosta e curvas de nível: degraus e paliçadas de madeira sustentam a terra, evitam deslizamentos nas chuvas e protegem as casas.',
        som: 'sino',
        grama1: gramaVetiver1,
        grama2: gramaVetiver2,
        aoClicar: function (obj, kitRef) {
          // Pulso de estabilidade do solo com harmonia relaxante
          if (obj.userData.grama1 && obj.userData.grama2) {
            obj.userData.grama1.material.color.setHex(0x7cb342);
            obj.userData.grama2.material.color.setHex(0x689f38);
            setTimeout(() => {
              try {
                obj.userData.grama1.material.color.setHex(0x689f38);
                obj.userData.grama2.material.color.setHex(0x558b2f);
              } catch (e) {}
            }, 450);
          }
          obj.position.y = -0.04;
          setTimeout(() => {
            try { obj.position.y = 0; } catch (e) {}
          }, 180);

          if (kitRef && kitRef.Audio) {
            if (typeof kitRef.Audio.celebrarAcerto === 'function') {
              kitRef.Audio.celebrarAcerto();
            } else if (typeof kitRef.Audio.sino === 'function') {
              kitRef.Audio.sino();
            }
          }
          if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(7 + 18, 3.2, 12), '🛡️');
        }
      };
      c1.userData = encostaGrp.userData;
      c2.userData = encostaGrp.userData;

      grpCidade.add(encostaGrp);
      grpCidade.add(kit.criarPlaca(3.5, 3.5, 'CONTENÇÃO DE ENCOSTA', 0x2e7d32));

      // --- 9. PRAÇA DE BOAS AÇÕES: PAINÉIS SOLARES E ESTAÇÃO DE RECICLAGEM ---
      const praca = kit.criarChao(7.5, 10.5, 0xcfd8dc);
      praca.position.set(-11.5, 0.06, 8);
      grpCidade.add(praca);

      // Árvores na praça urbana
      const arvoreReflorest1 = kit.criarArvore(-13.5, 11, 0x43a047, 0x5d4037);
      arvoreReflorest1.userData = {
        interativo: true,
        pistaMissao: [0, 5],
        nome: '🌳 Árvores urbanas: melhoram o ar da cidade, dão sombra fresca e reduzem o calor dos asfaltos.',
        som: 'pop'
      };
      grpCidade.add(arvoreReflorest1);

      // Painel solar fotovoltaico com células de silício e suporte de alumínio
      const painelSolar = new THREE.Group();
      painelSolar.position.set(-9.2, 0, 8.5);

      const hasteSolar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), kit.mat('lambert', 0x78909c));
      hasteSolar1.position.set(-0.8, 0.8, 0);
      hasteSolar1.castShadow = true;
      painelSolar.add(hasteSolar1);

      const hasteSolar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), kit.mat('lambert', 0x78909c));
      hasteSolar2.position.set(0.8, 0.8, 0);
      hasteSolar2.castShadow = true;
      painelSolar.add(hasteSolar2);

      // Moldura de alumínio do painel
      const placaSuporte = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.9), kit.mat('lambert', 0x37474f));
      placaSuporte.position.set(0, 1.6, 0);
      placaSuporte.rotation.x = Math.PI / 6;
      placaSuporte.castShadow = true;
      painelSolar.add(placaSuporte);

      // Células fotovoltaicas azuis brilhantes com divisórias
      const celulasFotovolt = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.12, 1.7),
        kit.mat('phong', 0x0d47a1, { shininess: 90 })
      );
      celulasFotovolt.position.set(0, 1.61, 0);
      celulasFotovolt.rotation.x = Math.PI / 6;
      painelSolar.add(celulasFotovolt);

      // Linhas da grade solar em relevo
      const gradeSolar = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.13, 0.04),
        kit.mat('basic', 0x90caf9)
      );
      gradeSolar.position.set(0, 1.62, 0);
      gradeSolar.rotation.x = Math.PI / 6;
      painelSolar.add(gradeSolar);

      // Inversor de energia limpa na base
      const inversor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), kit.mat('lambert', 0x455a64));
      inversor.position.set(0, 0.3, 0);
      painelSolar.add(inversor);

      // Display e indicador LED verde de geração de energia limpa
      const ledInversor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.06), kit.mat('basic', 0x00e676));
      ledInversor.position.set(0, 0.45, 0.16);
      painelSolar.add(ledInversor);

      // Halo e pulso de energia ecológica limpa verde-esmeralda
      const haloEcoMat = kit.mat('basic', 0x00e676, { transparent: true, opacity: 0.65, depthWrite: false });
      const haloEco = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.035, 8, 16),
        haloEcoMat
      );
      haloEco.position.set(0, 2.1, 0);
      painelSolar.add(haloEco);

      // Luz verde-esmeralda ecológica de energia limpa e renovável no painel solar (TEA)
      const luzSolar = new THREE.PointLight(0x00e676, 1.15, 8.5);
      luzSolar.position.set(0, 2.1, 0);
      painelSolar.add(luzSolar);

      // Piscina suave de luz verde-esmeralda projetada na base do painel
      const piscinaSolarMat = kit.mat('basic', 0x00e676, { transparent: true, opacity: 0.22, depthWrite: false });
      const piscinaSolar = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16), piscinaSolarMat);
      piscinaSolar.rotation.x = -Math.PI / 2;
      piscinaSolar.position.set(0, 0.05, 0);
      painelSolar.add(piscinaSolar);

      painelSolar.userData = {
        interativo: true,
        pistaMissao: [4, 5],
        nome: '☀️ Painel solar: tecnologia limpa que transforma a luz do sol em eletricidade sem queimar combustíveis nem poluir.',
        som: 'chime',
        halo: haloEco,
        luz: luzSolar,
        piscina: piscinaSolarMat,
        aoClicar: function (obj, kitRef) {
          // Pulso do halo verde esmeralda com som cristalino chime
          if (obj.userData.halo) {
            obj.userData.halo.scale.set(1.9, 1.9, 1.9);
            obj.userData.halo.material.opacity = 1.0;
            setTimeout(() => {
              try {
                obj.userData.halo.scale.set(1.0, 1.0, 1.0);
                obj.userData.halo.material.opacity = 0.65;
              } catch (e) {}
            }, 450);
          }
          if (obj.userData.luz) {
            obj.userData.luz.intensity = 2.4;
            setTimeout(() => {
              try { obj.userData.luz.intensity = 1.15; } catch (e) {}
            }, 450);
          }
          if (obj.userData.piscina) {
            obj.userData.piscina.opacity = 0.55;
            setTimeout(() => {
              try { obj.userData.piscina.opacity = 0.22; } catch (e) {}
            }, 450);
          }
          if (kitRef && kitRef.Audio && kitRef.Audio.chime) kitRef.Audio.chime();
          if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(-9.2 + 18, 2.2, 8.5), '☀️');
        }
      };
      grpCidade.add(painelSolar);

      // Sombra de contato para a estrutura do painel solar
      const sombraSolar = kit.criarSombraContato(-9.2, 8.5, 1.8, 1.4, 0.42);
      sombraSolar.position.y = 0.05;
      grpCidade.add(sombraSolar);

      grpCidade.add(kit.criarPlaca(-9.2, 7.0, 'ENERGIA SOLAR', 0x00897b));

      // Estação de Reciclagem com as 4 lixeiras da coleta seletiva e fardos reciclados
      const estacaoReciclagem = new THREE.Group();
      estacaoReciclagem.position.set(0, 0, 0);
      estacaoReciclagem.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '♻️ Estação de reciclagem: separar papel, plástico, vidro e metal permite reaproveitar materiais e poupar a natureza.',
        som: 'pop'
      };

      const lixeiras = [
        { cor: 0x1976d2, nome: 'Azul (Papel)',        x: -13.8 },
        { cor: 0xd32f2f, nome: 'Vermelho (Plástico)', x: -12.7 },
        { cor: 0x388e3c, nome: 'Verde (Vidro)',       x: -11.6 },
        { cor: 0xfbc02d, nome: 'Amarelo (Metal)',     x: -10.5 }
      ];
      lixeiras.forEach((lx) => {
        // Anel de pulso da cor correspondente da lixeira
        const anelPulso = new THREE.Mesh(
          new THREE.RingGeometry(0.35, 0.56, 24),
          kit.mat('basic', lx.cor, { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
        );
        anelPulso.rotation.x = -Math.PI / 2;
        anelPulso.position.set(lx.x, 0.08, 5.2);
        estacaoReciclagem.add(anelPulso);

        const corpo = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.32, 0.95, 12),
          kit.mat('lambert', lx.cor)
        );
        corpo.position.set(lx.x, 0.48, 5.2);
        corpo.castShadow = true;

        const tampa = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.16, 12),
          kit.mat('lambert', 0x263238)
        );
        tampa.position.set(lx.x, 1.0, 5.2);

        const dadosLixeira = {
          interativo: true,
          pistaMissao: 5,
          nome: `♻️ Lixeira de Coleta Seletiva: ${lx.nome} para reaproveitar materiais e poupar a natureza.`,
          som: 'pop',
          corLixeira: lx.cor,
          corpo: corpo,
          tampa: tampa,
          anelPulso: anelPulso,
          aoClicar: function (obj, kitRef) {
            // Pulso da cor correspondente da lixeira com som pop
            const anel = obj.userData.anelPulso;
            if (anel) {
              anel.material.opacity = 0.95;
              anel.scale.set(1.0, 1.0, 1.0);
              const inicio = performance.now();
              const dur = 400;
              const timer = setInterval(() => {
                const prog = Math.min(1, (performance.now() - inicio) / dur);
                anel.scale.setScalar(1.0 + prog * 1.8);
                anel.material.opacity = Math.max(0, 0.95 * (1 - prog));
                if (prog >= 1) clearInterval(timer);
              }, 16);
            }
            if (obj.userData.corpo) {
              obj.userData.corpo.scale.set(1.18, 1.25, 1.18);
              setTimeout(() => {
                try { obj.userData.corpo.scale.set(1.0, 1.0, 1.0); } catch (e) {}
              }, 220);
            }
            if (kitRef && kitRef.Audio && kitRef.Audio.pop) kitRef.Audio.pop();
            if (kitRef && kitRef.criarEfeitoToque) kitRef.criarEfeitoToque(new THREE.Vector3(lx.x + 18, 1.2, 5.2), '♻️');
          }
        };

        corpo.userData = dadosLixeira;
        tampa.userData = dadosLixeira;
        estacaoReciclagem.add(corpo);
        estacaoReciclagem.add(tampa);
      });

      // Fardo de papelão e latas prensadas prontos para reciclagem
      const fardoPapel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), kit.mat('lambert', 0xd7ccc8));
      fardoPapel.position.set(-13.8, 0.25, 6.4);
      fardoPapel.castShadow = true;
      fardoPapel.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '📦 Fardo de papelão reciclado: papel separado e prensado para virar novas caixas.',
        som: 'pop'
      };
      estacaoReciclagem.add(fardoPapel);

      const fardoMetal = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.65), kit.mat('phong', 0xb0bec5, { shininess: 80 }));
      fardoMetal.position.set(-10.5, 0.22, 6.4);
      fardoMetal.castShadow = true;
      fardoMetal.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '🥫 Fardo de metal reciclado: latinhas de alumínio prensadas prontas para novas utilidades.',
        som: 'pop'
      };
      estacaoReciclagem.add(fardoMetal);

      grpCidade.add(estacaoReciclagem);

      // Sombra de contato suave e alinhada sob a estação de reciclagem
      const sombraReciclagem = kit.criarSombraContato(-12.0, 5.0, 2.4, 2.2, 0.42);
      sombraReciclagem.position.y = 0.05;
      grpCidade.add(sombraReciclagem);

      grpCidade.add(kit.criarPlaca(-12.1, 3.8, 'RECICLAGEM', 0x1b5e20));

      scene.add(grpCidade);

      // ==========================================
      // ANIMAÇÕES: CARROS, BORBOLETAS, ASPERSOR, LIXO E LUZES
      // ==========================================
      animaveis.push((now) => {
        // Flutuação suave e relaxante das vitórias-régias no rio límpido
        vitoriasRegias.forEach((vr) => {
          vr.position.y = vr.userData.baseY + Math.sin(now * 1.5 + vr.userData.fase) * 0.012;
          vr.rotation.y = Math.sin(now * 0.8 + vr.userData.fase) * 0.03;
        });

        // Trânsito na avenida urbana
        carroAzul.position.z += 0.08;
        if (carroAzul.position.z > 21) carroAzul.position.z = -21;

        carroAmarelo.position.z += 0.05;
        if (carroAmarelo.position.z > 21) carroAmarelo.position.z = -21;

        carroVermelho.position.z -= 0.09;
        if (carroVermelho.position.z < -21) carroVermelho.position.z = 21;

        // Voo suave e gracioso das borboletas azuis morpho
        borboletasMorpho.forEach((b) => {
          // Bater suave das asas azuis
          const batida = Math.sin(now * 11 + b.userData.fase) * 0.75;
          b.userData.asaEsq.rotation.y = batida;
          b.userData.asaDir.rotation.y = -batida;

          // Trajetória orbital suave
          b.position.x = b.userData.baseX + Math.sin(now * 0.9 + b.userData.fase) * 1.4;
          b.position.z = b.userData.baseZ + Math.cos(now * 0.9 + b.userData.fase) * 1.4;
          b.position.y = b.userData.baseY + Math.sin(now * 2.2 + b.userData.fase) * 0.25;
          b.rotation.y = -(now * 0.9 + b.userData.fase) + Math.PI / 2;
        });

        // Aspersor de irrigação oscilando
        aspersorTubo.rotation.y = Math.sin(now * 1.5) * 0.4;

        // Lixo flutuando suavemente no trecho poluído
        lixoObjetos.forEach((l) => {
          l.position.y = l.userData.baseY + Math.sin(now * 2.5 + l.userData.fase) * 0.04;
          l.rotation.y += 0.005;
        });

        // Brilho sereno e cáusticas azul-turquesa do rio cristalino iluminando as pedras e seixos (TEA)
        if (luzRio) {
          luzRio.intensity = 1.15 + Math.sin(now * 1.8) * 0.12 + Math.cos(now * 2.7) * 0.05;
        }
        if (luzRioMontante) {
          luzRioMontante.intensity = 1.05 + Math.cos(now * 1.6) * 0.1;
        }
        if (matReflexoPedras) {
          matReflexoPedras.opacity = 0.35 + Math.sin(now * 1.8) * 0.08;
        }

        // Pulso calmo verde-esmeralda da energia solar limpa renovável
        if (luzSolar) {
          const pulsoEco = 1.15 + Math.sin(now * 1.8) * 0.18;
          luzSolar.intensity = pulsoEco;
          if (haloEco) {
            haloEco.scale.setScalar(1.0 + Math.sin(now * 1.8) * 0.12);
          }
          if (piscinaSolarMat) {
            piscinaSolarMat.opacity = 0.22 + Math.sin(now * 1.8) * 0.05;
          }
        }

        // Luz solar filtrada quente e feixes através da copa da floresta tropical (dappled sunlight)
        if (luzSolCanopy) {
          luzSolCanopy.intensity = 1.15 + Math.sin(now * 1.1) * 0.08;
        }
        if (matDappleCopa) {
          matDappleCopa.opacity = 0.32 + Math.sin(now * 1.1) * 0.06;
        }
        feixesCanopy.forEach((feixe, fIdx) => {
          feixe.material.opacity = 0.18 + Math.sin(now * 1.2 + fIdx) * 0.03;
        });

        // Nado gracioso dos peixinhos no rio límpido
        peixesRio.forEach((p) => {
          p.position.z = p.userData.baseZ + Math.sin(now * 1.2 + p.userData.fase) * 1.1;
          p.position.x = p.userData.baseX + Math.cos(now * 0.9 + p.userData.fase) * 0.35;
          p.position.y = 0.05 + Math.sin(now * 2.2 + p.userData.fase) * 0.012;
          p.rotation.y = Math.cos(now * 1.2 + p.userData.fase) >= 0 ? 0 : Math.PI;
          if (p.userData.cauda) {
            p.userData.cauda.rotation.y = Math.sin(now * 9.0 + p.userData.fase) * 0.35;
          }
        });

        // Animação de subida e dissipação suave das borbulhas no rio límpido
        for (let i = borbulhasAtivas.length - 1; i >= 0; i--) {
          const b = borbulhasAtivas[i];
          const idade = now - b.nasc;
          if (idade >= b.vida) {
            scene.remove(b.mesh);
            try { b.mesh.geometry.dispose(); b.mesh.material.dispose(); } catch (e) {}
            borbulhasAtivas.splice(i, 1);
          } else {
            b.mesh.position.y += b.vy;
            b.mesh.position.x += b.vx;
            b.mesh.position.z += b.vz;
            const prog = idade / b.vida;
            b.mesh.scale.setScalar(1.0 + prog * 0.8);
            b.mesh.material.opacity = Math.max(0, 0.85 * (1 - prog));
          }
        }
      });
    },

    missoes: [
      {
        kicker: 'Missão 1 · Campo e Cidade',
        enunciado: 'As atividades do campo abastecem as cidades com o quê?',
        respostaCerta: 'alimentos',
        cam: 'campo',
        foto: '../img/hga/imp/paisagem.jpg',
        fotoAlt: 'Campo com lavoura e pasto abastecendo as cidades',
        explicacao: 'O campo abastece as cidades com alimentos e matérias-primas da agricultura e pecuária.',
        dicaRetry: 'Lembre-se: o campo produz alimentos e matérias-primas para as cidades.',
        opcoes: [
          { id: 'alimentos', ico: '🍎', tit: 'Alimentos e matérias-primas', desc: 'Produtos da agricultura, pecuária e extrativismo' },
          { id: 'industria', ico: '📱', tit: 'Celulares e ferramentas', desc: 'Produtos da indústria e do comércio urbano' }
        ]
      },
      {
        kicker: 'Missão 2 · Máquinas no Campo',
        enunciado: 'A mecanização da agricultura aumentou a produção, mas o que causou aos trabalhadores?',
        respostaCerta: 'desemprego',
        cam: 'campo',
        foto: '../img/hga/imp/colheitadeiras.jpg',
        fotoAlt: 'Colheitadeiras trabalhando em lavoura de algodão',
        explicacao: 'As máquinas substituem pessoas no trabalho rural e fazem crescer o desemprego no campo.',
        dicaRetry: 'As máquinas substituem pessoas e fazem crescer o desemprego no campo.',
        opcoes: [
          { id: 'desemprego', ico: '🚜', tit: 'Cresceu o desemprego no campo', desc: 'As máquinas substituem o trabalho feito pelas pessoas' },
          { id: 'mais_vagas', ico: '👷', tit: 'Mais trabalho manual', desc: 'Aumentou a quantidade de pessoas colhendo à mão' }
        ]
      },
      {
        kicker: 'Missão 3 · O Desmatamento',
        enunciado: 'O desmatamento causa qual impacto socioambiental grave?',
        respostaCerta: 'extincao',
        cam: 'campo',
        foto: '../img/hga/imp/desmatamento.jpg',
        fotoAlt: 'Área com vegetação natural retirada',
        explicacao: 'O desmatamento leva animais e plantas à extinção e empobrece o solo.',
        dicaRetry: 'A retirada da vegetação natural leva espécies animais e vegetais à extinção.',
        opcoes: [
          { id: 'extincao', ico: '🪵', tit: 'Extinção de animais e plantas', desc: 'Perda da vegetação natural e empobrecimento do solo' },
          { id: 'protecao', ico: '🌳', tit: 'Proteção das florestas', desc: 'Mais abrigo e alimentos para os animais' }
        ]
      },
      {
        kicker: 'Missão 4 · Uso Excessivo de Água',
        enunciado: 'Qual prática na lavoura consome uma quantidade excessiva de água?',
        respostaCerta: 'irrigacao',
        cam: 'campo',
        foto: '../img/hga/imp/irrigacao.jpg',
        fotoAlt: 'Irrigação em lavoura agrícola',
        explicacao: 'A irrigação consome muita água e pode reduzir a água disponível para o consumo das pessoas.',
        dicaRetry: 'A irrigação de lavouras é uma das práticas que mais consomem água.',
        opcoes: [
          { id: 'irrigacao', ico: '💧', tit: 'Irrigação das lavouras', desc: 'Usa uma quantidade excessiva de água dos rios' },
          { id: 'colheita', ico: '🌾', tit: 'Colheita dos grãos', desc: 'Atividade que não consome água dos rios' }
        ]
      },
      {
        kicker: 'Missão 5 · Águas na Cidade',
        enunciado: 'Na cidade, o que contamina e polui a água dos rios e córregos?',
        respostaCerta: 'esgoto',
        cam: 'cidade',
        foto: '../img/hga/imp/esgoto.jpg',
        fotoAlt: 'Esgoto sem tratamento despejado no curso de água',
        explicacao: 'O esgoto sem tratamento e o lixo jogado poluem os rios e aumentam as doenças.',
        dicaRetry: 'O esgoto não tratado e o lixo despejado contaminam córregos e rios.',
        opcoes: [
          { id: 'esgoto', ico: '🚯', tit: 'Esgoto sem tratamento e lixo', desc: 'Contamina a água dos rios e pode causar doenças' },
          { id: 'tratamento', ico: '🚰', tit: 'Tratamento de esgoto e limpeza', desc: 'Deixa a água limpa para o uso das pessoas' }
        ]
      },
      {
        kicker: 'Missão 6 · Boas Ações Ambientais',
        enunciado: 'Toque nas 4 boas ações para cuidar do meio ambiente:',
        tipo: 'produtos',
        cam: 'acoes',
        foto: '../img/jogo/imp/reciclagem.svg',
        fotoAlt: 'Símbolo da reciclagem e boas ações',
        explicacao: 'Muito bem! Plantar árvores, cuidar da água, fazer reciclagem e usar menos agrotóxicos protegem a natureza!',
        totalRequerido: 4,
        itens: [
          { id: 'arvore', nome: 'Plantar árvores', img: '../img/jogo/imp/arvore.svg' },
          { id: 'agua', nome: 'Cuidar da água', img: '../img/jogo/imp/agua.svg' },
          { id: 'reciclagem', nome: 'Fazer reciclagem', img: '../img/jogo/imp/reciclagem.svg' },
          { id: 'agrotoxico', nome: 'Usar menos agrotóxicos', img: '../img/jogo/imp/agrotoxico.svg' }
        ]
      }
    ],

    resumoFinal: [
      {
        titulo: '🚜 Impactos no Campo',
        itens: [
          'Mecanização: máquinas aumentam a produção, mas causam desemprego rural',
          'Desmatamento: extinção de espécies animais e vegetais e empobrecimento do solo',
          'Uso excessivo de água: irrigação consome muita água e pode faltar para as pessoas',
          'Agrotóxicos: uso inadequado contamina o solo, os rios e prejudica a saúde'
        ]
      },
      {
        titulo: '🏙️ Impactos na Cidade',
        itens: [
          'Moradias em áreas de risco: ocupação de encostas de morros e margens de rios',
          'Poluição das águas: esgoto sem tratamento e despejo de lixo aumentam doenças',
          'Engarrafamentos: transporte coletivo deficiente agrava a poluição do ar',
          'Serviços públicos: má qualidade no atendimento de saúde, educação e segurança'
        ]
      }
    ]
  };
})(window);
