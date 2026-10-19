/* jogos/pecuaria/dados-3d.js — Dados declarativos do jogo 3D de Pecuária.
   Lido por jogos/jogar-3d.html?topico=pecuaria. Usa os helpers em ../jogo-kit-3d.js. */
(function (global) {
  'use strict';
  global.DADOS_3D = global.DADOS_3D || {};

  global.DADOS_3D.pecuaria = {
    id: 'pec-3d',
    topico: 'pecuaria',
    titulo: 'Fazenda 3D da Pecuária',
    icone: '🐄',
    referenciaLivro: 'p. 86 e 87 · base do livro',
    skyColor: 0xd7ecfd,
    skyTopo: 0x87ceeb, /* Azul claro para céu limpo */
    skyBase: 0xffffff, /* Branco no horizonte */
    hudTags: ['🌿 Pasto (Extensiva)', '🏡 Estábulo (Intensiva)'],

    visual: {
      cor: true,
      exposicao: 1.05,
      ceu: { topo: 0x87ceeb, base: 0xe3f2fd },
      nevoa: { cor: 0xe3f2fd, perto: 75, longe: 180 }
    },

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🌿 Olhar Pasto', cam: 'pasto' },
      { label: '🏡 Olhar Estábulo', cam: 'estabulo' },
      { label: '📐 Isométrica', cam: 'isometrica' }
    ],

    cameras: {
      geral:       { pos: [0, 30, 42],   look: [0, 2, -2] },
      pasto:       { pos: [-14, 18, 28], look: [-14, 2, -2] },
      estabulo:    { pos: [14, 18, 28],  look: [14, 2, -2] },
      isometrica:  { pos: [30, 30, 30],  look: [0, 2, 0] },
      produtos:    { pos: [0, 14, 26],   look: [0, 2, 8] }
    },

    fichas3d: [
      {
        id: 'pec-pasto',
        pos: [-12.0, 4.2, 0.5],
        nome: 'Gado no Pasto',
        foto: '../img/hga/pec/pasto.jpg',
        fato: 'Na pecuária extensiva, os animais vivem soltos nas pastagens.'
      },
      {
        id: 'pec-curral',
        pos: [13.0, 4.2, 1.5],
        nome: 'Gado no Estábulo',
        foto: '../img/hga/pec/curral.jpg',
        fato: 'Na pecuária intensiva, os animais são criados em estábulos.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Pedestal da Ilha Diorama Flutuante (estratificado com solo e rochas)
      scene.add(kit.criarIlhaDiorama(56, 40, 4.0, 0x5cb85c, 0x4e342e));

      // Estrada central rústica que divide o pasto e o estábulo
      scene.add(kit.criarEstrada(4.5, 40, 0xc8a97a));

      // Pedrinhas decorativas, tufos de grama estilizados e flores campestres nos caminhos e margens
      [-16, -11, -6, 0, 5, 11, 16].forEach((pz, idx) => {
        // Margem esquerda da estrada (lado do pasto)
        kit.criarPedrinhasDecorativas(scene, -2.6, pz, 7, 1.2, { escala: 0.85, cores: [0xd7ccc8, 0xbcaaa4, 0xcfd8dc] });
        kit.criarTufosGramaDecorativos(scene, -2.55, pz + (idx % 2 === 0 ? 0.8 : -0.8), 5, 0.9, animaveis, 0x66bb6a);
        if (idx % 2 === 0) {
          kit.criarFloresCampestresCaminho(scene, -2.7, pz + 1.2, 5, 0.9, animaveis, [0xffffff, 0xffe082, 0xf48fb1, 0xce93d8]);
        }

        // Margem direita da estrada (lado do estábulo)
        kit.criarPedrinhasDecorativas(scene, 2.6, pz + 1.0, 7, 1.2, { escala: 0.85, cores: [0xd7ccc8, 0xbcaaa4, 0xb0bec5] });
        kit.criarTufosGramaDecorativos(scene, 2.55, pz + (idx % 2 === 0 ? -0.8 : 0.8), 5, 0.9, animaveis, 0x81c784);
        if (idx % 2 !== 0) {
          kit.criarFloresCampestresCaminho(scene, 2.7, pz - 1.1, 5, 0.9, animaveis, [0xffffff, 0xffe082, 0x80deea, 0xffcc80]);
        }
      });

      // Gramado com centenas de tufos instanciados balançando ao vento (1 draw call)
      kit.criarGramaInstanciada(scene, animaveis, {
        minX: -26,
        maxX: -4,
        minZ: -18,
        maxZ: 18,
        count: 280,
        cor: 0x4caf50,
        excluir: (gx, gz) => Math.hypot(gx - (-17), gz - (-7)) < 5.2 || Math.hypot(gx - (-19), gz - 13) < 4.2
      });

      // LADO ESQUERDO: Pasto (Extensiva)
      const grpPasto = new THREE.Group();
      grpPasto.position.set(-14, 0, 0);

      // Lago artesanal com margem de seixos, vitórias-régias e píer de madeira
      const lago = kit.criarLagoDiorama(-3, -7, 4.8, 3.8, animaveis);
      lago.userData = {
        interativo: true,
        nome: '💧 Lago com água fresca: onde os patinhos nadam e os animais bebem água limpa.',
        som: 'splash'
      };
      grpPasto.add(lago);

      // Brilho suave da água do lago refletindo a luz do dia (reflexo cintilante sereno)
      const luzLago = new THREE.PointLight(0x29b6f6, 1.05, 12.0);
      luzLago.position.set(-3, 1.35, -7);
      grpPasto.add(luzLago);

      // Disco sereno de reflexo luminoso na superfície da água
      const discoReflexoLagoMat = kit.mat('basic', 0x4fc3f7, { transparent: true, opacity: 0.42, depthWrite: false });
      const discoReflexoLago = new THREE.Mesh(new THREE.CircleGeometry(2.8, 20), discoReflexoLagoMat);
      discoReflexoLago.rotation.x = -Math.PI / 2;
      discoReflexoLago.position.set(-3, 0.08, -7);
      grpPasto.add(discoReflexoLago);

      // ============================================================
      // 1. PEDRAS DE RIO SEMI-SUBMERSAS NA MARGEM E LEITO DO LAGO
      // ============================================================
      const pedrasRioLago = [];
      const rochaRioCores = [0x37474f, 0x455a64, 0x546e7a, 0x263238, 0x607d8b];
      const pedrasRioConfig = [
        { x: -5.6, z: -8.8, sx: 0.55, sy: 0.35, sz: 0.52, rotY: 0.4, cor: rochaRioCores[0], submersao: 0.10 },
        { x: -6.1, z: -7.2, sx: 0.48, sy: 0.30, sz: 0.45, rotY: 1.1, cor: rochaRioCores[1], submersao: 0.09 },
        { x: -5.3, z: -5.6, sx: 0.52, sy: 0.34, sz: 0.50, rotY: 0.8, cor: rochaRioCores[2], submersao: 0.11 },
        { x: -3.8, z: -4.4, sx: 0.44, sy: 0.28, sz: 0.42, rotY: 1.5, cor: rochaRioCores[3], submersao: 0.09 },
        { x: -1.4, z: -4.8, sx: 0.58, sy: 0.36, sz: 0.54, rotY: 0.2, cor: rochaRioCores[0], submersao: 0.12 },
        { x: -0.6, z: -6.2, sx: 0.46, sy: 0.32, sz: 0.48, rotY: 0.9, cor: rochaRioCores[4], submersao: 0.10 },
        { x: -0.9, z: -8.6, sx: 0.50, sy: 0.32, sz: 0.46, rotY: 1.8, cor: rochaRioCores[1], submersao: 0.10 },
        { x: -2.2, z: -9.8, sx: 0.62, sy: 0.38, sz: 0.56, rotY: 0.6, cor: rochaRioCores[2], submersao: 0.13 },
        { x: -4.2, z: -9.6, sx: 0.48, sy: 0.30, sz: 0.44, rotY: 2.1, cor: rochaRioCores[3], submersao: 0.09 }
      ];

      pedrasRioConfig.forEach((cfg) => {
        const pGrp = new THREE.Group();
        pGrp.position.set(cfg.x, cfg.submersao, cfg.z);

        // Corpo poliédrico arredondado de rocha de rio desgastada pela correnteza
        const pedraGeo = new THREE.DodecahedronGeometry(cfg.sx, 1);
        const pedraMat = kit.mat('toon', cfg.cor);
        const pedraMesh = new THREE.Mesh(pedraGeo, pedraMat);
        pedraMesh.scale.set(1.0, cfg.sy / cfg.sx, cfg.sz / cfg.sx);
        pedraMesh.rotation.y = cfg.rotY;
        pedraMesh.castShadow = true;
        pedraMesh.receiveShadow = true;
        pGrp.add(pedraMesh);

        // Anel de água / espuma suave na linha de submersão
        const anelAguaGeo = new THREE.RingGeometry(cfg.sx * 0.92, cfg.sx * 1.25, 14);
        const anelAguaMat = kit.mat('basic', 0xb2ebf2, { transparent: true, opacity: 0.38, depthWrite: false });
        const anelAgua = new THREE.Mesh(anelAguaGeo, anelAguaMat);
        anelAgua.rotation.x = -Math.PI / 2;
        anelAgua.position.y = 0.08 - cfg.submersao;
        pGrp.add(anelAgua);

        grpPasto.add(pGrp);
        pedrasRioLago.push(pGrp);
      });

      // ============================================================
      // 2. JUNCOS DE TABOA DETALHADOS COM ESPIGAS AVELUDADAS
      // ============================================================
      const juncosTaboaAnimados = [];
      const criarTufoTaboa = (tx, tz, numHastes, rotBase) => {
        const tGrp = new THREE.Group();
        tGrp.position.set(tx, 0.08, tz);
        tGrp.rotation.y = rotBase || 0;
        tGrp.userData = {
          interativo: true,
          nome: '🌾 Juncos de taboa: plantas aquáticas com espigas aveludadas que crescem à beira do lago.',
          som: 'splash',
          aoClicar: function (alvo) {
            alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 2.0;
          }
        };

        const cauleTaboaMat = kit.mat('toon', 0x33691e);
        const espigaTaboaMat = kit.mat('toon', 0x3e2723);
        const folhaTaboaMat = kit.mat('toon', 0x558b2f);
        const pontaCauleMat = kit.mat('toon', 0x689f38);

        for (let i = 0; i < numHastes; i++) {
          const hasteGrp = new THREE.Group();
          const altHaste = 1.35 + (i % 4) * 0.22 + Math.random() * 0.15;
          const offX = (Math.random() - 0.5) * 0.42;
          const offZ = (Math.random() - 0.5) * 0.42;
          hasteGrp.position.set(offX, 0, offZ);

          // Haste flexível esguia
          const hasteGeo = new THREE.CylinderGeometry(0.022, 0.032, altHaste, 5);
          const haste = new THREE.Mesh(hasteGeo, cauleTaboaMat);
          haste.position.y = altHaste / 2;
          haste.castShadow = true;
          hasteGrp.add(haste);

          // Espiga cilíndrica de taboa aveludada característica
          const hEspiga = 0.42 + (i % 3) * 0.08;
          const rEspiga = 0.055 + (i % 2) * 0.01;
          const espigaGeo = new THREE.CylinderGeometry(rEspiga, rEspiga, hEspiga, 8);
          const espiga = new THREE.Mesh(espigaGeo, espigaTaboaMat);
          espiga.position.y = altHaste * 0.72;
          espiga.castShadow = true;
          hasteGrp.add(espiga);

          // Topo arredondado da espiga de taboa
          const topoEspiga = new THREE.Mesh(new THREE.SphereGeometry(rEspiga, 6, 6), espigaTaboaMat);
          topoEspiga.position.y = altHaste * 0.72 + hEspiga / 2;
          hasteGrp.add(topoEspiga);

          const baseEspiga = new THREE.Mesh(new THREE.SphereGeometry(rEspiga, 6, 6), espigaTaboaMat);
          baseEspiga.position.y = altHaste * 0.72 - hEspiga / 2;
          hasteGrp.add(baseEspiga);

          // Pontinha verde afilada saindo no topo da espiga
          const pontaGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.25, 4);
          const ponta = new THREE.Mesh(pontaGeo, pontaCauleMat);
          ponta.position.y = altHaste * 0.72 + hEspiga / 2 + 0.12;
          hasteGrp.add(ponta);

          // Folhas longas em fita arqueadas e elegantes
          for (let f = 0; f < 2; f++) {
            const folhaGeo = new THREE.BoxGeometry(0.045, altHaste * 0.85, 0.012);
            const folha = new THREE.Mesh(folhaGeo, folhaTaboaMat);
            folha.position.set(f === 0 ? 0.06 : -0.06, altHaste * 0.42, 0);
            folha.rotation.z = f === 0 ? 0.22 : -0.22;
            folha.rotation.y = (f * Math.PI) / 2;
            hasteGrp.add(folha);
          }

          hasteGrp.userData = {
            fase: Math.random() * Math.PI * 2,
            freq: 1.5 + Math.random() * 0.6,
            ampl: 0.045 + Math.random() * 0.025
          };
          tGrp.add(hasteGrp);
          juncosTaboaAnimados.push(hasteGrp);
        }

        grpPasto.add(tGrp);
        return tGrp;
      };

      // Tufos de taboas nas margens rasa e de fundo do lago
      criarTufoTaboa(-5.8, -8.6, 6, Math.PI * 0.2);
      criarTufoTaboa(-5.4, -6.0, 5, -Math.PI * 0.3);
      criarTufoTaboa(-0.8, -5.8, 6, Math.PI * 0.7);

      // ============================================================
      // 3. VITÓRIAS-RÉGIAS COM PÉTALAS DUPLAS E MIOLO DOURADO
      // ============================================================
      const vitoriasDuplasAnimadas = [];
      const criarVitoriaRegiaDupla = (vx, vz, rotY, escala) => {
        const vGrp = new THREE.Group();
        vGrp.position.set(vx, 0.12, vz);
        vGrp.rotation.y = rotY;
        vGrp.scale.set(escala, escala, escala);
        vGrp.userData = {
          interativo: true,
          nome: '🌸 Vitória-régia com flor de lótus de pétalas duplas: flutua serena na água do lago.',
          som: 'splash',
          baseY: 0.12,
          fase: Math.random() * Math.PI * 2,
          aoClicar: function (alvo) {
            alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
          }
        };

        // Grande folha redonda com rebordo saliente elevado e recorte característico em V
        const folhaGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.03, 24, 1, false, 0.28, Math.PI * 1.88);
        const folhaMat = kit.mat('toon', 0x2e7d32);
        const folha = new THREE.Mesh(folhaGeo, folhaMat);
        folha.receiveShadow = true;
        vGrp.add(folha);

        // Rebordo periférico saliente da folha
        const bordaGeo = new THREE.TorusGeometry(0.71, 0.032, 5, 24, Math.PI * 1.88);
        const bordaMat = kit.mat('toon', 0x1b5e20);
        const borda = new THREE.Mesh(bordaGeo, bordaMat);
        borda.rotation.x = Math.PI / 2;
        borda.position.y = 0.02;
        vGrp.add(borda);

        // Flor exuberante de pétalas duplas flutuando ao centro
        const florGrp = new THREE.Group();
        florGrp.position.set(0.08, 0.04, 0.06);

        // Miolo dourado central com pistilos
        const mioloMat = kit.mat('toon', 0xffd54f);
        const miolo = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), mioloMat);
        miolo.position.y = 0.05;
        florGrp.add(miolo);

        const pistiloMat = kit.mat('toon', 0xffa000);
        for (let p = 0; p < 6; p++) {
          const ang = (p / 6) * Math.PI * 2;
          const pist = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.06, 4), pistiloMat);
          pist.position.set(Math.cos(ang) * 0.07, 0.09, Math.sin(ang) * 0.07);
          florGrp.add(pist);
        }

        // Camada 1 (Exterior): 8 pétalas maiores abertas em rosa suave / marfim pérola
        const petalaExtGeo = new THREE.ConeGeometry(0.12, 0.28, 5);
        const petalaExtMat = kit.mat('toon', 0xf8bbd0);
        for (let e = 0; e < 8; e++) {
          const angE = (e / 8) * Math.PI * 2;
          const pExt = new THREE.Mesh(petalaExtGeo, petalaExtMat);
          pExt.position.set(Math.cos(angE) * 0.18, 0.08, Math.sin(angE) * 0.18);
          pExt.rotation.x = Math.sin(angE) * 0.55;
          pExt.rotation.z = -Math.cos(angE) * 0.55;
          florGrp.add(pExt);
        }

        // Camada 2 (Interior): 6 pétalas menores semi-eretas em rosa vivo aveludado
        const petalaIntGeo = new THREE.ConeGeometry(0.09, 0.22, 5);
        const petalaIntMat = kit.mat('toon', 0xec407a);
        for (let n = 0; n < 6; n++) {
          const angN = (n / 6) * Math.PI * 2 + 0.25;
          const pInt = new THREE.Mesh(petalaIntGeo, petalaIntMat);
          pInt.position.set(Math.cos(angN) * 0.11, 0.11, Math.sin(angN) * 0.11);
          pInt.rotation.x = Math.sin(angN) * 0.28;
          pInt.rotation.z = -Math.cos(angN) * 0.28;
          florGrp.add(pInt);
        }

        vGrp.add(florGrp);
        grpPasto.add(vGrp);
        vitoriasDuplasAnimadas.push(vGrp);
        return vGrp;
      };

      criarVitoriaRegiaDupla(-4.2, -6.6, 0.8, 1.15);
      criarVitoriaRegiaDupla(-2.2, -8.2, 2.2, 0.95);

      // Barquinho de madeira a remo ancorado junto ao píer do lago
      const barcoRemo = new THREE.Group();
      barcoRemo.position.set(0.1, 0.12, -7.6);
      barcoRemo.rotation.y = -Math.PI * 0.28;
      barcoRemo.userData = {
        interativo: true,
        nome: '🛶 Barco de madeira a remo: repousa suavemente na água tranquila do lago.',
        som: 'splash'
      };

      // Casco do barco (madeira rústica com cavidade interna)
      const cascoGeo = new THREE.BoxGeometry(1.6, 0.42, 0.78);
      const madeiraBarcoMat = kit.mat('lambert', 0x795548);
      const casco = new THREE.Mesh(cascoGeo, madeiraBarcoMat);
      casco.position.y = 0.21;
      casco.castShadow = true;
      barcoRemo.add(casco);

      // Proa afilada do barquinho
      const proaGeo = new THREE.ConeGeometry(0.48, 0.65, 4);
      const proa = new THREE.Mesh(proaGeo, madeiraBarcoMat);
      proa.rotation.z = Math.PI / 2;
      proa.rotation.y = Math.PI / 4;
      proa.position.set(1.05, 0.21, 0);
      proa.castShadow = true;
      barcoRemo.add(proa);

      // Bancos internos de madeira clara
      const bancoMat = kit.mat('lambert', 0xa1887f);
      const bancoMeio = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.68), bancoMat);
      bancoMeio.position.set(0, 0.32, 0);
      barcoRemo.add(bancoMeio);

      const bancoPopa = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.68), bancoMat);
      bancoPopa.position.set(-0.55, 0.32, 0);
      barcoRemo.add(bancoPopa);

      // Par de remos apoiados na borda
      const remoMat = kit.mat('lambert', 0xbcaaa4);
      const hasteRemoGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6);
      const paRemoGeo = new THREE.BoxGeometry(0.1, 0.02, 0.25);

      const remo1 = new THREE.Group();
      remo1.position.set(-0.1, 0.38, 0.42);
      remo1.rotation.set(0.15, 0.3, -0.4);
      remo1.add(new THREE.Mesh(hasteRemoGeo, remoMat));
      const pa1 = new THREE.Mesh(paRemoGeo, remoMat);
      pa1.position.y = -0.52;
      remo1.add(pa1);
      barcoRemo.add(remo1);

      const remo2 = new THREE.Group();
      remo2.position.set(-0.1, 0.38, -0.42);
      remo2.rotation.set(-0.15, -0.3, -0.4);
      remo2.add(new THREE.Mesh(hasteRemoGeo, remoMat));
      const pa2 = new THREE.Mesh(paRemoGeo, remoMat);
      pa2.position.y = -0.52;
      remo2.add(pa2);
      barcoRemo.add(remo2);

      // Corda de amarração ao píer
      const corda = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), kit.mat('lambert', 0xd7ccc8));
      corda.position.set(1.2, 0.24, -0.2);
      corda.rotation.z = Math.PI / 3;
      barcoRemo.add(corda);

      grpPasto.add(barcoRemo);

      // Sombra de contato suave e alinhada sob o barquinho no lago
      const sombraBarco = kit.criarSombraContato(0.1, -7.6, 1.1, 1.5, 0.38);
      sombraBarco.position.y = 0.08;
      grpPasto.add(sombraBarco);

      // Patos e patinhos fofos nadando no lago
      const patos = [];
      const criarPato = (corPena, corBico, escala, x, z, rotY) => {
        const pGrp = new THREE.Group();
        pGrp.position.set(x, 0.12, z);
        pGrp.rotation.y = rotY;
        pGrp.scale.set(escala, escala, escala);
        pGrp.userData = {
          interativo: true,
          nome: escala < 0.8 ? '🦆 Patinho no lago: nada feliz na água límpida do pasto.' : '🦆 Mamãe pata no lago: nada suavemente com seus patinhos.',
          som: 'splash',
          baseY: 0.12,
          fase: Math.random() * Math.PI * 2,
          aoClicar: function (alvo) {
            alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
          }
        };

        const penaMat = kit.mat('toon', corPena);
        const bicoMat = kit.mat('toon', corBico);

        // Corpo arredondado
        const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), penaMat);
        corpo.scale.set(1.25, 0.8, 0.9);
        corpo.position.y = 0.16;
        corpo.castShadow = true;
        pGrp.add(corpo);

        // Cabeça com bico e olhos
        const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), penaMat);
        cabeca.position.set(0.28, 0.34, 0);
        cabeca.castShadow = true;
        pGrp.add(cabeca);

        const bico = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.12), bicoMat);
        bico.position.set(0.44, 0.32, 0);
        pGrp.add(bico);

        // Cauda empinada
        const cauda = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 4), penaMat);
        cauda.rotation.z = -Math.PI / 3;
        cauda.position.set(-0.38, 0.25, 0);
        pGrp.add(cauda);

        grpPasto.add(pGrp);
        patos.push(pGrp);
        return pGrp;
      };

      // Mamãe pata branca e dois patinhos amarelos
      criarPato(0xffffff, 0xff9800, 1.0, -4.5, -6.3, Math.PI * 0.2);
      criarPato(0xfff176, 0xffa726, 0.65, -3.6, -7.8, -Math.PI * 0.4);
      criarPato(0xfff176, 0xffa726, 0.65, -2.2, -6.0, Math.PI * 0.85);

      // Galinheiro aconchegante com galinhas ciscando
      const galinheiro = new THREE.Group();
      galinheiro.position.set(-8.0, 0, 1.2);
      galinheiro.userData = {
        interativo: true,
        nome: '🐔 Galinheiro da fazenda: abrigo aconchegante das galinhas que produzem ovos frescos.',
        som: 'pop'
      };

      // 4 estacas de madeira elevando o galinheiro do chão úmido
      const estacaMat = kit.mat('lambert', 0x5d4037);
      const estacaPernaGeo = new THREE.BoxGeometry(0.15, 0.65, 0.15);
      [[-0.9, -0.7], [0.9, -0.7], [-0.9, 0.7], [0.9, 0.7]].forEach(([px, pz]) => {
        const perna = new THREE.Mesh(estacaPernaGeo, estacaMat);
        perna.position.set(px, 0.32, pz);
        perna.castShadow = true;
        galinheiro.add(perna);
      });

      // Plataforma e casinha de madeira rústica
      const casaGalinheiro = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.45, 1.65), kit.mat('lambert', 0x8d6e63));
      casaGalinheiro.position.y = 1.35;
      casaGalinheiro.castShadow = true;
      galinheiro.add(casaGalinheiro);

      // Telhado aconchegante terracota em duas águas
      const telhadoAba1 = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.12, 1.15), kit.mat('lambert', 0xb71c1c));
      telhadoAba1.position.set(0, 2.35, -0.42);
      telhadoAba1.rotation.x = Math.PI * 0.18;
      telhadoAba1.castShadow = true;
      galinheiro.add(telhadoAba1);

      const telhadoAba2 = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.12, 1.15), kit.mat('lambert', 0xb71c1c));
      telhadoAba2.position.set(0, 2.35, 0.42);
      telhadoAba2.rotation.x = -Math.PI * 0.18;
      telhadoAba2.castShadow = true;
      galinheiro.add(telhadoAba2);

      // Portinha de entrada das aves com palha amarela saindo
      const portaGalinhas = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.12), kit.mat('basic', 0x3e2723));
      portaGalinhas.position.set(0.45, 1.05, 0.84);
      galinheiro.add(portaGalinhas);

      const palhaEntrada = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.25), kit.mat('lambert', 0xffe082));
      palhaEntrada.position.set(0.45, 0.72, 0.9);
      galinheiro.add(palhaEntrada);

      // Rampinha de madeira com travessas para as aves subirem
      const rampa = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 1.2), kit.mat('lambert', 0x6d4c41));
      rampa.position.set(0.45, 0.35, 1.35);
      rampa.rotation.x = -Math.PI * 0.16;
      rampa.castShadow = true;
      galinheiro.add(rampa);

      for (let s = -0.4; s <= 0.4; s += 0.25) {
        const degrau = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 0.05), kit.mat('lambert', 0x4e342e));
        degrau.position.set(0.45, 0.35 - s * 0.4, 1.35 + s * 0.85);
        degrau.rotation.x = -Math.PI * 0.16;
        galinheiro.add(degrau);
      }

      // Ninho lateral com ovos brancos frescos
      const ninho = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.85), kit.mat('lambert', 0x795548));
      ninho.position.set(-1.25, 0.95, 0);
      galinheiro.add(ninho);

      const tampaNinho = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.95), kit.mat('lambert', 0xb71c1c));
      tampaNinho.position.set(-1.25, 1.28, 0);
      tampaNinho.rotation.z = Math.PI * 0.12;
      galinheiro.add(tampaNinho);

      const ovo1 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), kit.mat('toon', 0xffffff));
      ovo1.scale.set(1, 1.3, 1);
      ovo1.position.set(-1.25, 1.15, 0.12);
      galinheiro.add(ovo1);

      const ovo2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), kit.mat('toon', 0xffffff));
      ovo2.scale.set(1, 1.3, 1);
      ovo2.position.set(-1.18, 1.15, -0.15);
      galinheiro.add(ovo2);

      // Catavento decorativo de galo no topo
      const hasteCatavento = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), kit.mat('lambert', 0x212121));
      hasteCatavento.position.set(0, 2.75, 0);
      galinheiro.add(hasteCatavento);

      const galoTopo = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.04), kit.mat('basic', 0xffd54f));
      galoTopo.position.set(0, 2.95, 0);
      galinheiro.add(galoTopo);

      grpPasto.add(galinheiro);
      grpPasto.add(kit.criarSombraDeContato(-8.0, 1.2, 1.8, 1.5, 0.45));

      // 3 galinhas e pintinhos ciscando pelo terreiro
      const galinhas = [];
      const criarGalinha = (corCorpo, escala, x, z, rotY) => {
        const gGrp = new THREE.Group();
        gGrp.position.set(x, 0, z);
        gGrp.rotation.y = rotY;
        gGrp.scale.set(escala, escala, escala);
        gGrp.userData = {
          interativo: true,
          nome: escala < 0.8 ? '🐥 Pintinho: filhote da galinha que cisca alegre pelo terreiro.' : '🐔 Galinha ciscando: alimenta-se de sementes e produz ovos frescos.',
          som: 'pop',
          tempo: Math.random() * 5,
          aoClicar: function (alvo) {
            alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.6;
          }
        };

        const corpoMat = kit.mat('toon', corCorpo);

        // Corpo
        const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), corpoMat);
        corpo.scale.set(1.1, 0.9, 0.85);
        corpo.position.y = 0.32;
        corpo.castShadow = true;
        gGrp.add(corpo);

        // Cabeça com pivô para animação de bicar o chão
        const pescoco = new THREE.Group();
        pescoco.position.set(0.2, 0.4, 0);

        const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), corpoMat);
        cabeca.position.set(0.08, 0.12, 0);
        pescoco.add(cabeca);

        // Crista vermelha
        const crista = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.04), kit.mat('toon', 0xd32f2f));
        crista.position.set(0.06, 0.24, 0);
        pescoco.add(crista);

        // Bico laranja
        const bico = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), kit.mat('toon', 0xff9800));
        bico.rotation.z = -Math.PI / 2;
        bico.position.set(0.22, 0.12, 0);
        pescoco.add(bico);

        gGrp.add(pescoco);
        gGrp.userData.pescoco = pescoco;

        // Asas
        const asaMat = kit.mat('toon', corCorpo);
        [-0.18, 0.18].forEach((az) => {
          const asa = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.05), asaMat);
          asa.position.set(-0.02, 0.34, az);
          gGrp.add(asa);
        });

        // Rabinho
        const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.04), corpoMat);
        rabo.position.set(-0.25, 0.42, 0);
        rabo.rotation.z = Math.PI * 0.25;
        gGrp.add(rabo);

        // Perninhas finas
        const pernaMat = kit.mat('basic', 0xffb300);
        [-0.08, 0.08].forEach((lz) => {
          const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4), pernaMat);
          perna.position.set(0, 0.12, lz);
          gGrp.add(perna);
        });

        grpPasto.add(gGrp);
        grpPasto.add(kit.criarSombraDeContato(x, z, 0.35 * escala, 0.35 * escala, 0.3));
        galinhas.push(gGrp);
        return gGrp;
      };

      criarGalinha(0xffffff, 1.0, -7.2, 2.5, Math.PI * 0.4);
      criarGalinha(0xa1887f, 0.95, -9.1, 2.0, -Math.PI * 0.25);
      criarGalinha(0xffeb3b, 0.65, -6.6, 1.8, Math.PI * 0.8);

      // Bebedouro rústico de madeira com superfície de água translúcida e reflexiva
      const bebedouro = new THREE.Group();
      bebedouro.position.set(-0.5, 0, -0.8);
      bebedouro.userData = {
        interativo: true,
        nome: '💧 Bebedouro do gado: água limpa e fresca para as vacas se hidratarem no pasto.',
        som: 'splash'
      };

      // Tronco/cocho esculpido em madeira nobre escura e envernizada
      const cochoBordaMat = kit.mat('lambert', 0x4e342e);
      const cochoFundo = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 1.1), cochoBordaMat);
      cochoFundo.position.y = 0.18;
      cochoFundo.castShadow = true;
      bebedouro.add(cochoFundo);

      // Laterais do cocho de madeira nobre
      const cochoLado1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.12), cochoBordaMat);
      cochoLado1.position.set(0, 0.42, 0.49);
      cochoLado1.castShadow = true;
      bebedouro.add(cochoLado1);

      const cochoLado2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.12), cochoBordaMat);
      cochoLado2.position.set(0, 0.42, -0.49);
      cochoLado2.castShadow = true;
      bebedouro.add(cochoLado2);

      const cochoPonta1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 1.1), cochoBordaMat);
      cochoPonta1.position.set(1.14, 0.42, 0);
      cochoPonta1.castShadow = true;
      bebedouro.add(cochoPonta1);

      const cochoPonta2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 1.1), cochoBordaMat);
      cochoPonta2.position.set(-1.14, 0.42, 0);
      cochoPonta2.castShadow = true;
      bebedouro.add(cochoPonta2);

      // Nós de madeira rústica estilizados e cantoneiras de reforço
      const noMadeiraMat = kit.mat('toon', 0x3e2723);
      const noMadeiraGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 6);
      [
        [-0.8, 0.45, 0.56], [0.5, 0.38, 0.56], [-0.4, 0.42, -0.56], [0.7, 0.46, -0.56],
        [1.21, 0.42, 0.25], [-1.21, 0.44, -0.2]
      ].forEach(([nx, ny, nz]) => {
        const no = new THREE.Mesh(noMadeiraGeo, noMadeiraMat);
        no.position.set(nx, ny, nz);
        no.rotation.x = Math.PI / 2;
        bebedouro.add(no);
      });

      // Aros e cantoneiras de ferro forjado reforçando a madeira com rebites
      const aroMat = kit.mat('lambert', 0x263238);
      const rebiteMat = kit.mat('lambert', 0x546e7a);
      [-0.6, 0.6].forEach((ax) => {
        const aro = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.48, 1.14), aroMat);
        aro.position.set(ax, 0.42, 0);
        bebedouro.add(aro);

        // Rebites nos aros
        [-0.52, 0.52].forEach((rz) => {
          const reb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), rebiteMat);
          reb.position.set(ax, 0.62, rz);
          bebedouro.add(reb);
        });
      });

      // Pés de suporte entalhados
      const peMat = kit.mat('lambert', 0x3e2723);
      [[-0.9, -0.35], [-0.9, 0.35], [0.9, -0.35], [0.9, 0.35]].forEach(([px, pz]) => {
        const pe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.2), peMat);
        pe.position.set(px, 0.1, pz);
        bebedouro.add(pe);
      });

      // Espelho d'água límpida cristalina e altamente reflexiva (com cáustica e alto specular)
      const aguaCochoMat = kit.mat('phong', 0x29b6f6, {
        transparent: true,
        opacity: 0.88,
        shininess: 130,
        specular: new THREE.Color(0xe0f7fa)
      });
      const aguaCocho = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.05, 0.86), aguaCochoMat);
      aguaCocho.position.y = 0.52;
      bebedouro.add(aguaCocho);

      // Fundo com leve cáustica de profundidade
      const fundoLimpidoMat = kit.mat('basic', 0x0288d1, { transparent: true, opacity: 0.45 });
      const fundoLimpido = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.82), fundoLimpidoMat);
      fundoLimpido.rotation.x = -Math.PI / 2;
      fundoLimpido.position.set(0, 0.28, 0);
      bebedouro.add(fundoLimpido);

      // Boia mecânica esférica de latão polido para controle de nível d'água
      const boiaMat = kit.mat('phong', 0xffb300, { shininess: 90 });
      const hasteBoiaMat = kit.mat('lambert', 0x78909c);
      const boia = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), boiaMat);
      boia.position.set(-0.85, 0.54, 0);
      boia.castShadow = true;
      bebedouro.add(boia);

      const hasteBoia = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 4), hasteBoiaMat);
      hasteBoia.position.set(-0.98, 0.58, 0);
      hasteBoia.rotation.z = Math.PI / 3;
      bebedouro.add(hasteBoia);

      // Brilho especular e reflexo vívido sobre a lâmina d'água límpida do bebedouro
      const luzBebedouro = new THREE.PointLight(0x80d8ff, 0.55, 4.5);
      luzBebedouro.position.set(0, 0.85, 0);
      bebedouro.add(luzBebedouro);

      const brilhoBebedouroMat = kit.mat('basic', 0xffffff, { transparent: true, opacity: 0.38, depthWrite: false });
      const brilhoBebedouro = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.32), brilhoBebedouroMat);
      brilhoBebedouro.rotation.x = -Math.PI / 2;
      brilhoBebedouro.position.set(0.25, 0.53, 0);
      bebedouro.add(brilhoBebedouro);

      // Cano rústico de ferro curvado com registro/torneira e gota d'água cristalina
      const canoAgua = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 6), kit.mat('lambert', 0x546e7a));
      canoAgua.position.set(-1.18, 0.65, 0);
      canoAgua.rotation.z = Math.PI / 4;
      bebedouro.add(canoAgua);

      const registroTorneira = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.14), kit.mat('toon', 0xd32f2f));
      registroTorneira.position.set(-1.18, 0.72, 0);
      bebedouro.add(registroTorneira);

      const bicaCano = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 6), kit.mat('lambert', 0x546e7a));
      bicaCano.position.set(-1.0, 0.74, 0);
      bicaCano.rotation.x = Math.PI / 2;
      bebedouro.add(bicaCano);

      const gotaCristalina = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), kit.mat('basic', 0x80d8ff));
      gotaCristalina.position.set(-1.0, 0.62, 0);
      bebedouro.add(gotaCristalina);

      grpPasto.add(bebedouro);
      grpPasto.add(kit.criarSombraDeContato(-0.5, -0.8, 1.8, 1.2, 0.42));

      // Girassóis encantadores erguidos junto à cerca do pasto
      const girassois = [];
      const criarGirassol = (gx, gz, alt) => {
        const gGrp = new THREE.Group();
        gGrp.position.set(gx, 0, gz);
        gGrp.rotation.y = Math.PI * 0.35;
        gGrp.userData = {
          interativo: true,
          nome: '🌻 Girassol: flor dourada que acompanha o sol e alegra a fazenda.',
          som: 'pop',
          baseAlt: alt,
          aoClicar: function (alvo) {
            alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.6;
          }
        };

        // Caule verde
        const caule = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, alt, 6), kit.mat('lambert', 0x388e3c));
        caule.position.y = alt / 2;
        caule.castShadow = true;
        gGrp.add(caule);

        // Folhas largas verdes
        const folhaMat = kit.mat('lambert', 0x43a047);
        const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.18), folhaMat);
        f1.position.set(0.14, alt * 0.45, 0);
        f1.rotation.z = -0.3;
        gGrp.add(f1);

        const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.18), folhaMat);
        f2.position.set(-0.14, alt * 0.65, 0);
        f2.rotation.z = 0.3;
        gGrp.add(f2);

        // Coroa de pétalas amarelas douradas
        const florCentro = new THREE.Group();
        florCentro.position.set(0, alt, 0);
        florCentro.rotation.x = 0.25;

        const miolo = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 12), kit.mat('lambert', 0x4e342e));
        miolo.rotation.x = Math.PI / 2;
        florCentro.add(miolo);

        const petalas = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.03, 14), kit.mat('toon', 0xfbc02d));
        petalas.rotation.x = Math.PI / 2;
        florCentro.add(petalas);

        gGrp.add(florCentro);
        grpPasto.add(gGrp);
        girassois.push(gGrp);
      };

      [-4.5, -2.5, -0.5, 3.5, 5.5].forEach((gz, idx) => {
        criarGirassol(-11.5, gz, 1.8 + (idx % 3) * 0.25);
      });

      // Arbustos de frutos e bagas silvestres espalhados pelo pasto
      const criarArbustoBagas = (ax, az, corBaga) => {
        const aGrp = new THREE.Group();
        aGrp.position.set(ax, 0, az);
        aGrp.userData = {
          interativo: true,
          nome: '🫐 Arbusto de amoras e frutinhas silvestres nativas da fazenda.',
          som: 'pop'
        };

        const folhagem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), kit.mat('toon', 0x388e3c));
        folhagem.position.y = 0.65;
        folhagem.castShadow = true;
        aGrp.add(folhagem);

        const bagaMat = kit.mat('phong', corBaga, { shininess: 60 });
        const bagaGeo = new THREE.SphereGeometry(0.12, 6, 6);
        [
          [0.45, 0.75, 0.5],
          [-0.5, 0.8, 0.4],
          [0.2, 1.1, -0.4],
          [-0.35, 0.6, -0.55],
          [0.6, 0.5, -0.2]
        ].forEach(([bx, by, bz]) => {
          const baga = new THREE.Mesh(bagaGeo, bagaMat);
          baga.position.set(bx, by, bz);
          aGrp.add(baga);
        });

        grpPasto.add(aGrp);
        grpPasto.add(kit.criarSombraDeContato(ax, az, 1.0, 1.0, 0.35));
      };

      criarArbustoBagas(-10, -8.5, 0xe53935); // Frutinhas vermelhas silvestres
      criarArbustoBagas(5.0, -6.5, 0x283593);  // Amoras azuis
      criarArbustoBagas(5.5, 5.0, 0xffb300);   // Frutas douradas

      // Moinho de vento holandês com pás giratórias
      const moinho = kit.criarMoinhoVento(-5, -13, animaveis);
      moinho.userData = {
        interativo: true,
        paGrp: moinho.userData ? moinho.userData.paGrp : null,
        nome: '💨 Moinho de vento: suas pás giram com o vento e ajudam no trabalho do campo.',
        som: 'sino',
        aoClicar: function (alvo) {
          alvo.userData.turboAte = performance.now() * 0.001 + 3.0;
        }
      };
      grpPasto.add(moinho);

      // Janela do moinho iluminada com brilho dourado acolhedor
      const janelaMoinhoGlow = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.48, 0.12),
        kit.mat('basic', 0xffb74d)
      );
      janelaMoinhoGlow.position.set(-5, 3.8, -11.2);
      grpPasto.add(janelaMoinhoGlow);

      // Luz suave e aconchegante emanando da janela do moinho
      const luzMoinho = new THREE.PointLight(0xffb74d, 0.75, 7.5);
      luzMoinho.position.set(-5, 3.85, -11.0);
      grpPasto.add(luzMoinho);

      // Árvores no pasto com alturas variadas e frutas deliciosas
      grpPasto.add(kit.criarArvore(5, -11, 0x2e7d32, 0x5d4037, 'frutifera'));
      grpPasto.add(kit.criarArvore(-7, 7, 0x388e3c, 0x5d4037, 'frutifera'));
      grpPasto.add(kit.criarArvore(6, 9, 0x1b5e20, 0x4e342e, 'copa'));

      // Macieira alta majestosa no fundo
      const macieiraAlta = kit.criarArvore(-9, -12, 0x2e7d32, 0x5d4037, 'frutifera');
      macieiraAlta.scale.set(1.35, 1.45, 1.35);
      grpPasto.add(macieiraAlta);

      // Laranjeira com laranjas redondas vibrantes
      const laranjeira = kit.criarArvore(3.5, -13, 0x388e3c, 0x5d4037, 'frutifera');
      laranjeira.scale.set(1.15, 1.2, 1.15);
      grpPasto.add(laranjeira);

      // Pequena muda jovem de pereira
      const mudaPequena = kit.criarArvore(6.5, 1.0, 0x43a047, 0x6d4c41, 'copa');
      mudaPequena.scale.set(0.75, 0.75, 0.75);
      grpPasto.add(mudaPequena);

      // ============================================================
      // HELPERS VISUAIS: FIAPOS DE FENO, MOURÕES COM NÓS E PORTEIRA
      // ============================================================
      const fenoFiaposGeo1 = new THREE.ConeGeometry(0.016, 0.32, 4);
      const fenoFiaposGeo2 = new THREE.CylinderGeometry(0.009, 0.014, 0.28, 4);
      const fenoFiaposMat1 = kit.mat('toon', 0xffe082);
      const fenoFiaposMat2 = kit.mat('toon', 0xffd54f);
      const fenoFiaposMat3 = kit.mat('toon', 0xffca28);

      const adicionarFiaposFardo = (fardoMesh) => {
        if (!fardoMesh) return;
        const fiaposGrp = new THREE.Group();
        fiaposGrp.position.y = 0.65; // centro do cilindro deitado

        // Fiapos de palha projetando-se nas duas extremidades circulares
        [-0.68, 0.68].forEach((ex) => {
          for (let f = 0; f < 12; f++) {
            const ang = (f / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const r = 0.2 + Math.random() * 0.42;
            const fiapo = new THREE.Mesh(f % 2 === 0 ? fenoFiaposGeo1 : fenoFiaposGeo2, f % 3 === 0 ? fenoFiaposMat1 : (f % 3 === 1 ? fenoFiaposMat2 : fenoFiaposMat3));
            fiapo.position.set(ex + (ex > 0 ? 0.08 : -0.08) * Math.random(), Math.sin(ang) * r, Math.cos(ang) * r);
            fiapo.rotation.z = (ex > 0 ? Math.PI / 2 : -Math.PI / 2) + (Math.random() - 0.5) * 0.55;
            fiapo.rotation.y = (Math.random() - 0.5) * 0.6;
            fiaposGrp.add(fiapo);
          }
        });

        // Fiapos arrepiados salientes na casca do fardo
        for (let s = 0; s < 18; s++) {
          const sx = (Math.random() - 0.5) * 1.15;
          const sAng = Math.random() * Math.PI * 2;
          const fiapoS = new THREE.Mesh(s % 2 === 0 ? fenoFiaposGeo1 : fenoFiaposGeo2, s % 2 === 0 ? fenoFiaposMat2 : fenoFiaposMat1);
          fiapoS.position.set(sx, Math.sin(sAng) * 0.66, Math.cos(sAng) * 0.66);
          fiapoS.rotation.x = sAng + (Math.random() - 0.5) * 0.5;
          fiapoS.rotation.z = (Math.random() - 0.5) * 0.6;
          fiaposGrp.add(fiapoS);
        }

        fardoMesh.add(fiaposGrp);
      };

      // Cercas com mourões de madeira roliça chanfrados e nós estilizados
      const criarCercaMouroesComNos = (parent, x, z, comp, horizontal, cor) => {
        const grpCerca = new THREE.Group();
        const madeiraCercaMat = kit.mat('lambert', cor || 0x795548);
        const noCercaMat = kit.mat('toon', 0x3e2723);
        const mourraoGeo = new THREE.CylinderGeometry(0.13, 0.15, 1.35, 7);
        const topoGeo = new THREE.ConeGeometry(0.13, 0.16, 7);
        const noGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 5);

        // 2 réguas horizontais robustas
        const alturasReguas = [0.62, 1.05];
        alturasReguas.forEach((alt) => {
          const reguaGeo = horizontal
            ? new THREE.BoxGeometry(comp, 0.11, 0.12)
            : new THREE.BoxGeometry(0.12, 0.11, comp);
          const regua = new THREE.Mesh(reguaGeo, madeiraCercaMat);
          regua.position.set(x, alt, z);
          regua.castShadow = true;
          grpCerca.add(regua);
        });

        const numMouroes = Math.floor(comp / 2.2);
        for (let i = -numMouroes / 2; i <= numMouroes / 2; i++) {
          const mx = horizontal ? x + i * 2.2 : x;
          const mz = horizontal ? z : z + i * 2.2;

          const mGrp = new THREE.Group();
          mGrp.position.set(mx, 0, mz);

          // Mourão roliço principal
          const mourrao = new THREE.Mesh(mourraoGeo, madeiraCercaMat);
          mourrao.position.y = 0.675;
          mourrao.castShadow = true;
          mGrp.add(mourrao);

          // Topo chanfrado elegante contra chuva
          const topoMourrao = new THREE.Mesh(topoGeo, madeiraCercaMat);
          topoMourrao.position.y = 1.43;
          mGrp.add(topoMourrao);

          // Nós de madeira rústica estilizados em relevo
          const no1 = new THREE.Mesh(noGeo, noCercaMat);
          no1.position.set(0.13, 0.45, 0);
          no1.rotation.z = Math.PI / 2;
          mGrp.add(no1);

          const no2 = new THREE.Mesh(noGeo, noCercaMat);
          no2.position.set(0, 0.85, -0.13);
          no2.rotation.x = Math.PI / 2;
          mGrp.add(no2);

          grpCerca.add(mGrp);
        }

        parent.add(grpCerca);
        return grpCerca;
      };

      // Porteira detalhada de fazenda (madeira rústica nobre com réguas em Z/X, dobradiças e tranca com corrente)
      const porteirasFazendaAnimadas = [];
      const criarPorteiraFazendaDetalhada = (parent, px, pz, rotY, anims) => {
        const portGrp = new THREE.Group();
        portGrp.position.set(px, 0, pz);
        portGrp.rotation.y = rotY || 0;
        portGrp.userData = {
          interativo: true,
          nome: '🚪 Porteira da fazenda: porteira de madeira nobre com mourões de nós estilizados, dobradiças de ferro forjado e tranca.',
          som: 'sino',
          aoClicar: function (alvo) {
            alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 2.2;
          }
        };

        const madeiraPorteiraMat = kit.mat('lambert', 0x6d4c41);
        const madeiraEscuraMat = kit.mat('lambert', 0x4e342e);
        const ferroPorteiraMat = kit.mat('lambert', 0x212121);
        const noPorteiraMat = kit.mat('toon', 0x3e2723);

        // 2 mourões mestres grossos e altos com nós de madeira
        [-1.6, 1.6].forEach((mx) => {
          const mestre = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.8, 8), madeiraEscuraMat);
          mestre.position.set(mx, 0.9, 0);
          mestre.castShadow = true;
          portGrp.add(mestre);

          const topoMestre = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.25, 8), madeiraEscuraMat);
          topoMestre.position.set(mx, 1.92, 0);
          portGrp.add(topoMestre);

          // Nós estilizados no mourão mestre
          [-0.18, 0.18].forEach((nz, idx) => {
            const no = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 6), noPorteiraMat);
            no.position.set(mx, 0.6 + idx * 0.5, nz);
            no.rotation.x = Math.PI / 2;
            portGrp.add(no);
          });
        });

        // Folha articulada da porteira (pivô em mx = -1.6)
        const folhaPorteira = new THREE.Group();
        folhaPorteira.position.set(-1.5, 0, 0);

        // Quadro retangular da folha da porteira
        const compFolha = 2.9;
        const altFolha = 1.05;

        // Réguas horizontais paralelas (4 réguas)
        for (let r = 0; r < 4; r++) {
          const yR = 0.35 + r * 0.28;
          const regua = new THREE.Mesh(new THREE.BoxGeometry(compFolha, 0.09, 0.06), madeiraPorteiraMat);
          regua.position.set(compFolha / 2, yR, 0);
          regua.castShadow = true;
          folhaPorteira.add(regua);
        }

        // Montantes verticais nas pontas e no meio
        [0.08, compFolha / 2, compFolha - 0.08].forEach((vx) => {
          const montante = new THREE.Mesh(new THREE.BoxGeometry(0.1, altFolha + 0.1, 0.08), madeiraPorteiraMat);
          montante.position.set(vx, 0.76, 0);
          montante.castShadow = true;
          folhaPorteira.add(montante);
        });

        // Contraventamento clássico diagonal em "Z" e "X"
        const diag1 = new THREE.Mesh(new THREE.BoxGeometry(compFolha * 0.6, 0.08, 0.05), madeiraPorteiraMat);
        diag1.position.set(compFolha * 0.28, 0.76, 0.02);
        diag1.rotation.z = Math.PI * 0.18;
        folhaPorteira.add(diag1);

        const diag2 = new THREE.Mesh(new THREE.BoxGeometry(compFolha * 0.6, 0.08, 0.05), madeiraPorteiraMat);
        diag2.position.set(compFolha * 0.72, 0.76, 0.02);
        diag2.rotation.z = -Math.PI * 0.18;
        folhaPorteira.add(diag2);

        // Dobradiças longas de ferro forjado preto com rebites
        [0.45, 1.05].forEach((dy) => {
          const dobradica = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.07, 0.09), ferroPorteiraMat);
          dobradica.position.set(0.38, dy, 0.03);
          folhaPorteira.add(dobradica);

          const pinoDobradica = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6), ferroPorteiraMat);
          pinoDobradica.position.set(0.02, dy, 0.03);
          folhaPorteira.add(pinoDobradica);
        });

        // Trinco/tranca de ferro deslizante com corrente de elos pendurada
        const trinco = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.08), ferroPorteiraMat);
        trinco.position.set(compFolha - 0.12, 0.78, 0.04);
        folhaPorteira.add(trinco);

        const argolaTrinco = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 4, 8), ferroPorteiraMat);
        argolaTrinco.position.set(compFolha - 0.05, 0.78, 0.06);
        folhaPorteira.add(argolaTrinco);

        // Corrente de elos rústica pendurada
        for (let elo = 0; elo < 4; elo++) {
          const eloMesh = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 4, 6), ferroPorteiraMat);
          eloMesh.position.set(compFolha - 0.05, 0.70 - elo * 0.06, 0.06);
          eloMesh.rotation.y = (elo % 2 === 0 ? 0 : Math.PI / 2);
          folhaPorteira.add(eloMesh);
        }

        portGrp.add(folhaPorteira);
        portGrp.userData.folhaPorteira = folhaPorteira;
        porteirasFazendaAnimadas.push(portGrp);
        parent.add(portGrp);
        return portGrp;
      };

      // ============================================================
      // CANTEIROS BOTÂNICOS DE FLORES CAMPESTRES PASTÉIS COM BALANÇO INDIVIDUALIZADO
      // (Margaridas brancas, Lavanda aromática e Botões dourados)
      // ============================================================
      const floresBotanicasAnimadas = [];
      const criarCanteiroBotanicoPastel = (parent, cx, cz, rotY, w, d) => {
        const cantGrp = new THREE.Group();
        cantGrp.position.set(cx, 0, cz);
        cantGrp.rotation.y = rotY || 0;
        cantGrp.userData = {
          interativo: true,
          nome: '🌸 Canteiro botânico campestre: margaridas brancas, lavandas e botões dourados que dançam suavemente na brisa da fazenda.',
          som: 'chime',
          aoClicar: function (alvo) {
            alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 2.2;
          }
        };

        const largura = w || 4.2;
        const profundidade = d || 2.4;

        // Solo fértil elevado com terra preta fofa e rica em nutrientes
        const terraMat = kit.mat('toon', 0x3e2723);
        const terraCanteiro = new THREE.Mesh(new THREE.BoxGeometry(largura, 0.16, profundidade), terraMat);
        terraCanteiro.position.y = 0.08;
        terraCanteiro.receiveShadow = true;
        cantGrp.add(terraCanteiro);

        // Bordadura orgânica de pedras roliças ao redor do canteiro
        const pedraCores = [0xbcaaa4, 0xd7ccc8, 0xcfd8dc, 0x90a4ae];
        const numPedrasBorda = 22;
        for (let b = 0; b < numPedrasBorda; b++) {
          const t = b / numPedrasBorda;
          let bx, bz;
          if (t < 0.3) {
            bx = -largura / 2 + (t / 0.3) * largura;
            bz = -profundidade / 2;
          } else if (t < 0.5) {
            bx = largura / 2;
            bz = -profundidade / 2 + ((t - 0.3) / 0.2) * profundidade;
          } else if (t < 0.8) {
            bx = largura / 2 - ((t - 0.5) / 0.3) * largura;
            bz = profundidade / 2;
          } else {
            bx = -largura / 2;
            bz = profundidade / 2 - ((t - 0.8) / 0.2) * profundidade;
          }
          const pMesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.08, 0),
            kit.mat('toon', pedraCores[b % pedraCores.length])
          );
          pMesh.scale.set(1.2, 0.7, 1.0);
          pMesh.position.set(bx, 0.10, bz);
          pMesh.rotation.y = Math.random() * Math.PI;
          cantGrp.add(pMesh);
        }

        // MATERIAIS BOTÂNICOS PASTÉIS
        const cauleVerdeMat = kit.mat('toon', 0x43a047);
        const cauleLavandaMat = kit.mat('toon', 0x689f38);

        // 1. Margaridas brancas pastéis
        const petalaMargaridaMat = kit.mat('toon', 0xffffff);
        const mioloMargaridaMat = kit.mat('toon', 0xffd54f);

        // 2. Lavanda aromática pastel (lilás e violeta suave)
        const lavandaMat1 = kit.mat('toon', 0xce93d8);
        const lavandaMat2 = kit.mat('toon', 0xba68c8);
        const lavandaMat3 = kit.mat('toon', 0xd1c4e9);

        // 3. Botões dourados (botão-de-ouro / buttercup pastel)
        const botaoDouradoMat1 = kit.mat('toon', 0xffe082);
        const botaoDouradoMat2 = kit.mat('toon', 0xffd54f);
        const mioloDouradoMat = kit.mat('toon', 0xffa000);

        // Geometrias compartilhadas
        const hasteGeo = new THREE.CylinderGeometry(0.014, 0.02, 0.65, 4);
        const petalaMargGeo = new THREE.ConeGeometry(0.035, 0.14, 4);
        const espigaLavandaGeo = new THREE.SphereGeometry(0.05, 5, 5);

        // Distribuição de flores em alta densidade com balanço individualizado
        const totalFlores = 32;
        for (let i = 0; i < totalFlores; i++) {
          const fx = (Math.random() - 0.5) * (largura - 0.7);
          const fz = (Math.random() - 0.5) * (profundidade - 0.6);
          const altHaste = 0.52 + Math.random() * 0.35;
          const tipoFlor = i % 3; // 0 = Margarida, 1 = Lavanda, 2 = Botão Dourado

          const florHasteGrp = new THREE.Group();
          florHasteGrp.position.set(fx, 0.16, fz);

          // Caule flexível ereto
          const caule = new THREE.Mesh(hasteGeo, tipoFlor === 1 ? cauleLavandaMat : cauleVerdeMat);
          caule.scale.set(1, altHaste / 0.65, 1);
          caule.position.y = altHaste / 2;
          caule.castShadow = true;
          florHasteGrp.add(caule);

          if (tipoFlor === 0) {
            // MARGARIDA BRANCA PASTEL
            const topoFlor = new THREE.Group();
            topoFlor.position.set(0, altHaste, 0);
            topoFlor.rotation.x = (Math.random() - 0.5) * 0.3;

            // Miolo dourado suave
            const miolo = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 8), mioloMargaridaMat);
            miolo.rotation.x = Math.PI / 2;
            topoFlor.add(miolo);

            // Corola de pétalas brancas duplas
            for (let p = 0; p < 10; p++) {
              const angP = (p / 10) * Math.PI * 2;
              const pet = new THREE.Mesh(petalaMargGeo, petalaMargaridaMat);
              pet.position.set(Math.cos(angP) * 0.11, 0, Math.sin(angP) * 0.11);
              pet.rotation.x = Math.PI / 2;
              pet.rotation.z = -angP;
              topoFlor.add(pet);
            }
            florHasteGrp.add(topoFlor);

          } else if (tipoFlor === 1) {
            // LAVANDA AROMÁTICA PASTEL (espiga floral com camadas escalonadas lilás)
            const numCamadas = 5;
            for (let c = 0; c < numCamadas; c++) {
              const yC = altHaste - 0.05 - c * 0.055;
              const matC = c % 2 === 0 ? lavandaMat1 : (c % 3 === 1 ? lavandaMat2 : lavandaMat3);
              for (let b = 0; b < 4; b++) {
                const angB = (b / 4) * Math.PI * 2 + (c * 0.4);
                const botao = new THREE.Mesh(espigaLavandaGeo, matC);
                botao.position.set(Math.cos(angB) * 0.045, yC, Math.sin(angB) * 0.045);
                florHasteGrp.add(botao);
              }
            }
            // Pequenas folhas lineares na base da haste
            const folhaLavanda = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.015), cauleLavandaMat);
            folhaLavanda.position.set(0.04, altHaste * 0.3, 0);
            folhaLavanda.rotation.z = -0.4;
            florHasteGrp.add(folhaLavanda);

          } else {
            // BOTÕES DOURADOS PASTÉIS (Buttercups em taça)
            const topoFlor = new THREE.Group();
            topoFlor.position.set(0, altHaste, 0);

            const corolaDourada = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.12, 6), botaoDouradoMat1);
            corolaDourada.rotation.x = Math.PI;
            topoFlor.add(corolaDourada);

            const mioloDourado = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), mioloDouradoMat);
            mioloDourado.position.y = 0.04;
            topoFlor.add(mioloDourado);

            // Pétalas abertas em taça
            for (let d = 0; d < 5; d++) {
              const angD = (d / 5) * Math.PI * 2;
              const petD = new THREE.Mesh(new THREE.SphereGeometry(0.045, 4, 4), botaoDouradoMat2);
              petD.scale.set(1.4, 0.4, 0.9);
              petD.position.set(Math.cos(angD) * 0.065, 0.03, Math.sin(angD) * 0.065);
              topoFlor.add(petD);
            }
            florHasteGrp.add(topoFlor);
          }

          // Parâmetros individualizados de balanço à brisa
          florHasteGrp.userData = {
            fase: Math.random() * Math.PI * 2,
            freq: 1.4 + Math.random() * 0.8,
            amplX: 0.035 + Math.random() * 0.03,
            amplZ: 0.04 + Math.random() * 0.035
          };

          cantGrp.add(florHasteGrp);
          floresBotanicasAnimadas.push(florHasteGrp);
        }

        parent.add(cantGrp);
        return cantGrp;
      };

      // Fardos de feno dourados no campo com fiapos de palha volumétricos
      const msgFeno = '🌾 Fardo de feno: forragem seca e nutritiva para alimentar o gado.';
      const feno1 = kit.criarFardoFeno(4, 3, 0.3);
      feno1.userData = {
        interativo: true,
        nome: msgFeno,
        som: 'pop'
      };
      adicionarFiaposFardo(feno1);
      grpPasto.add(feno1);

      const feno2 = kit.criarFardoFeno(2, 4.2, -0.2);
      feno2.userData = {
        interativo: true,
        nome: msgFeno,
        som: 'pop'
      };
      adicionarFiaposFardo(feno2);
      grpPasto.add(feno2);

      // Cercas com mourões de nós de madeira estilizados
      criarCercaMouroesComNos(grpPasto, -12, 0, 36, true);
      criarCercaMouroesComNos(grpPasto, 0, -18, 22, false);
      criarCercaMouroesComNos(grpPasto, 0, 18, 22, false);

      // Porteira detalhada de fazenda dando acesso do pasto à estrada central
      criarPorteiraFazendaDetalhada(grpPasto, 2.2, 5.0, 0, animaveis);

      // Canteiros botânicos de flores campestres pastéis no pasto (perto do moinho e da cerca)
      criarCanteiroBotanicoPastel(grpPasto, -8.2, -4.8, Math.PI * 0.08, 4.5, 2.2);
      criarCanteiroBotanicoPastel(grpPasto, -3.8, 6.2, -Math.PI * 0.12, 4.2, 2.0);

      // Vaquinhas felizes pastando soltas
      const v1 = kit.criarVaca(0xffffff, 0x222222);
      v1.position.set(-2, 0, 2);
      v1.rotation.y = Math.PI * 0.25;
      v1.userData = {
        interativo: true,
        pistaMissao: [0, 4],
        nome: '🐄 Vaquinha no pasto: na pecuária extensiva, o gado vive solto e se alimenta de capim.',
        som: 'moo',
        aoClicar: function (alvo) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
        }
      };
      grpPasto.add(v1);

      const v2 = kit.criarVaca(0xffffff, 0x6d4c41);
      v2.position.set(2, 0, -3.5);
      v2.rotation.y = -Math.PI * 0.35;
      v2.userData = {
        interativo: true,
        pistaMissao: 0,
        nome: '🐄 Vaca pastando: vive livre no pasto em grandes áreas abertas da fazenda.',
        som: 'moo',
        aoClicar: function (alvo) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
        }
      };
      grpPasto.add(v2);

      // Bezerro fofo pastando perto da mãe (p. 86: vacas, bois e bezerros)
      const bezerro = kit.criarBezerro(0xffffff, 0x6d4c41);
      bezerro.position.set(4.2, 0, -2.8);
      bezerro.rotation.y = -Math.PI * 0.45;
      bezerro.userData = {
        interativo: true,
        pistaMissao: 0,
        nome: '🐮 Bezerro: filhote da vaca que mama leite nutritivo e cresce saudável.',
        som: 'moo',
        aoClicar: function (alvo) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
        }
      };
      grpPasto.add(bezerro);

      // Sombras de contato suaves para ancorar os elementos no chão
      grpPasto.add(kit.criarSombraDeContato(-2, 2, 1.3, 1.8, 0.45));
      grpPasto.add(kit.criarSombraDeContato(2, -3.5, 1.3, 1.8, 0.45));
      grpPasto.add(kit.criarSombraDeContato(4.2, -2.8, 0.9, 1.2, 0.42));
      grpPasto.add(kit.criarSombraDeContato(-5, -13, 2.2, 2.2, 0.48));

      // Borboletas animadas voando suavemente sobre as flores
      kit.criarBorboletas(scene, animaveis, -15, 3, 5, 3);

      // Flores e arbustos floridos espalhados
      kit.criarFlores(grpPasto, -1, 5, 4.5, 16);
      kit.criarFlores(grpPasto, -5, -2, 3.5, 12);
      grpPasto.add(kit.criarArbusto(-9, 4, 0x43a047, 0xffeb3b));
      grpPasto.add(kit.criarArbusto(-8, -6, 0x388e3c, 0xff5722));
      grpPasto.add(kit.criarArbusto(6, -4, 0x4caf50));

      // Placa indicativa com CanvasTexture de alta resolução
      grpPasto.add(kit.criarPlaca(0, 15, '🌿 PASTO (EXTENSIVA)', 0x2e7d32));
      scene.add(grpPasto);

      // LADO DIREITO: Estábulo (Intensiva)
      const grpEstabulo = new THREE.Group();
      grpEstabulo.position.set(14, 0, 0);

      // Piso de terra batida / curral
      const pisoCurral = kit.criarChao(22, 36, 0xc4a882);
      pisoCurral.position.y = 0.03;
      grpEstabulo.add(pisoCurral);

      // Celeiro Vermelho Tradicional com sótão de feno, lanterna, chaminé e cocho longo
      const estabulo = kit.criarEstabuloPremium(12, 5.2, 9, animaveis);
      estabulo.position.set(0, 0, -6);
      estabulo.userData.interativo = true;
      estabulo.userData.pistaMissao = [1, 2];
      estabulo.userData.nome = '🏡 Estábulo e curral: na pecuária intensiva, os animais ficam confinados e protegidos.';
      estabulo.userData.som = 'sino';

      // Madeiramento envernizado rústico: ripas frisadas, caibros e ferragens estruturais
      const madeiraEnvernizadaMat = kit.mat('phong', 0x8b2500, {
        shininess: 65,
        specular: new THREE.Color(0xd7ccc8)
      });
      const vigaVernizMat = kit.mat('phong', 0x5c150b, {
        shininess: 50,
        specular: new THREE.Color(0xbcaaa4)
      });
      const ferroForjadoMat = kit.mat('lambert', 0x212121);
      const noVernizMat = kit.mat('toon', 0x3e1508);

      // Frisos de tábuas envernizadas nas paredes laterais do celeiro
      [-5.96, 5.96].forEach((lx) => {
        for (let py = 0.5; py <= 4.8; py += 0.55) {
          const tabuaFriso = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 8.8), madeiraEnvernizadaMat);
          tabuaFriso.position.set(lx, py, 0);
          estabulo.add(tabuaFriso);
        }
      });

      // Frontão superior envernizado na fachada frontal e traseira
      [-4.45, 4.45].forEach((fz) => {
        for (let ry = 1.0; ry <= 4.6; ry += 0.6) {
          const tabuaFrontal = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.08, 0.06), vigaVernizMat);
          tabuaFrontal.position.set(0, ry, fz);
          estabulo.add(tabuaFrontal);
        }
      });

      // Vigas mestras de carpintaria tradicional nos 4 cantos com nós de madeira estilizados
      [
        [-5.95, 4.45], [5.95, 4.45],
        [-5.95, -4.45], [5.95, -4.45]
      ].forEach(([vx, vz]) => {
        const vigaCanto = new THREE.Mesh(new THREE.BoxGeometry(0.32, 5.4, 0.32), vigaVernizMat);
        vigaCanto.position.set(vx, 2.7, vz);
        vigaCanto.castShadow = true;
        estabulo.add(vigaCanto);

        // Nós de madeira envernizada entalhados
        [-0.17, 0.17].forEach((ny, idx) => {
          const noCanto = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), noVernizMat);
          noCanto.position.set(vx > 0 ? vx + 0.05 : vx - 0.05, 1.5 + idx * 1.8, vz);
          noCanto.rotation.z = Math.PI / 2;
          estabulo.add(noCanto);
        });

        // Cantoneiras em "L" de ferro forjado com rebites
        [0.8, 4.6].forEach((cy) => {
          const cantoneira = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.38), ferroForjadoMat);
          cantoneira.position.set(vx, cy, vz);
          estabulo.add(cantoneira);
        });
      });

      // Caibros de madeira envernizada sob o beiral do telhado
      for (let cb = -5.2; cb <= 5.2; cb += 1.3) {
        const caibro = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.35), vigaVernizMat);
        caibro.position.set(cb, 5.22, 4.58);
        caibro.rotation.x = -Math.PI * 0.14;
        estabulo.add(caibro);

        const caibroTraseiro = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.35), vigaVernizMat);
        caibroTraseiro.position.set(cb, 5.22, -4.58);
        caibroTraseiro.rotation.x = Math.PI * 0.14;
        estabulo.add(caibroTraseiro);
      }

      grpEstabulo.add(estabulo);

      // Vaca confinada se alimentando no cocho
      const v3 = kit.criarVaca(0xffffff, 0x1a1a1a);
      v3.position.set(0, 0, 0.4);
      v3.rotation.y = 0;
      v3.userData.interativo = true;
      v3.userData.pistaMissao = 1;
      v3.userData.nome = '🐄 Vaca no estábulo: na pecuária intensiva, fica abrigada e se alimenta no cocho.';
      v3.userData.som = 'moo';
      v3.userData.aoClicar = function (alvo) {
        alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
      };
      grpEstabulo.add(v3);

      // Sombras de contato no estábulo
      grpEstabulo.add(kit.criarSombraDeContato(0, 0.4, 1.3, 1.8, 0.45));
      grpEstabulo.add(kit.criarSombraDeContato(0, -6, 6.2, 4.8, 0.52));

      // Soleira rústica de madeira na entrada do celeiro
      const soleiraEntrada = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 0.08, 1.3),
        kit.mat('lambert', 0x6d4c41)
      );
      soleiraEntrada.position.set(0, 0.06, -1.4);
      soleiraEntrada.receiveShadow = true;
      grpEstabulo.add(soleiraEntrada);

      // Poça suave de luz âmbar acolhedora refletida na soleira de madeira
      const pocaLuzSoleiraMat = kit.mat('basic', 0xffb74d, { transparent: true, opacity: 0.38, depthWrite: false });
      const pocaLuzSoleira = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), pocaLuzSoleiraMat);
      pocaLuzSoleira.rotation.x = -Math.PI / 2;
      pocaLuzSoleira.position.set(0, 0.11, -1.4);
      grpEstabulo.add(pocaLuzSoleira);

      // Divisórias de baias e cocheiras de madeira no interior do estábulo
      const madeiraBaiaMat = kit.mat('lambert', 0x5d4037);
      const palhaBaiaMat = kit.mat('toon', 0xffe082);
      [-2.8, 2.8].forEach((bx) => {
        const posteBaia = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.18), madeiraBaiaMat);
        posteBaia.position.set(bx, 1.1, -3.2);
        grpEstabulo.add(posteBaia);

        for (let ry = 0.45; ry <= 1.85; ry += 0.45) {
          const regua = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 4.2), madeiraBaiaMat);
          regua.position.set(bx, ry, -5.2);
          grpEstabulo.add(regua);
        }

        const camaPalha = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 3.8), palhaBaiaMat);
        camaPalha.position.set(bx > 0 ? bx + 1.4 : bx - 1.4, 0.08, -5.2);
        grpEstabulo.add(camaPalha);
      });

      // Brilho dourado aconchegante no interior do celeiro através do sótão e baias
      const luzCeleiroInterior = new THREE.PointLight(0xffb74d, 0.7, 11);
      luzCeleiroInterior.position.set(0, 3.4, -4.8);
      grpEstabulo.add(luzCeleiroInterior);

      // Fresta luminosa da janela do sótão de feno emanando luz dourada
      const brilhoSotao = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.2),
        kit.mat('basic', 0xffca28, { transparent: true, opacity: 0.65 })
      );
      brilhoSotao.position.set(0, 4.58, -1.42);
      grpEstabulo.add(brilhoSotao);

      // Estrado de madeira para os latões de leite ordenhado
      const estradoLeite = new THREE.Group();
      estradoLeite.position.set(-5.2, 0, 3.6);
      estradoLeite.userData = {
        interativo: true,
        nome: '🥛 Plataforma de latões de leite: armazena o leite fresco recém-tirado da vaca.',
        som: 'pop'
      };

      const tabuasEstradoMat = kit.mat('lambert', 0x8d6e63);
      const estradoBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 2.0), tabuasEstradoMat);
      estradoBase.position.y = 0.08;
      estradoBase.castShadow = true;
      estradoLeite.add(estradoBase);

      // Vigas de apoio do estrado
      const vigaMat = kit.mat('lambert', 0x5d4037);
      [-0.9, 0, 0.9].forEach((vx) => {
        const viga = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 2.0), vigaMat);
        viga.position.set(vx, 0.09, 0);
        estradoLeite.add(viga);
      });

      grpEstabulo.add(estradoLeite);
      grpEstabulo.add(kit.criarSombraDeContato(-5.2, 3.6, 1.6, 1.5, 0.4));

      // Latões metálicos de leite fresco ordenhado posicionados com esmero no estrado
      const msgLatao = '🥛 Latão de leite: alimento nutritivo e matéria-prima fornecido pela pecuária.';
      const l1 = kit.criarLataoLeite(-5.7, 3.1);
      l1.userData = {
        interativo: true,
        nome: msgLatao,
        som: 'pop'
      };
      grpEstabulo.add(l1);

      const l2 = kit.criarLataoLeite(-4.7, 3.1);
      l2.userData = {
        interativo: true,
        nome: msgLatao,
        som: 'pop'
      };
      grpEstabulo.add(l2);

      const l3 = kit.criarLataoLeite(-5.7, 4.1);
      l3.userData = {
        interativo: true,
        nome: msgLatao,
        som: 'pop'
      };
      grpEstabulo.add(l3);

      const l4 = kit.criarLataoLeite(-4.7, 4.1);
      l4.userData = {
        interativo: true,
        nome: msgLatao,
        som: 'pop'
      };
      grpEstabulo.add(l4);

      // Pilha de sacos de ração balanceada para o gado confinado
      const grpSacosRacao = new THREE.Group();
      grpSacosRacao.position.set(-6.5, 0, -2.0);
      grpSacosRacao.userData = {
        interativo: true,
        nome: '📦 Sacos de ração balanceada: alimento concentrado e nutritivo para o gado no estábulo.',
        som: 'pop'
      };

      const sacoMat1 = kit.mat('lambert', 0xd7ccc8);
      const sacoMat2 = kit.mat('lambert', 0xbcaaa4);
      const etiquetaMat = kit.mat('toon', 0x66bb6a);
      const amarraMat = kit.mat('lambert', 0x5d4037);

      const criarSaco = (sx, sy, sz, rotY, mat) => {
        const s = new THREE.Group();
        s.position.set(sx, sy, sz);
        s.rotation.y = rotY;

        // Corpo gordinho do saco
        const corpoSaco = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.32, 1.25), mat);
        corpoSaco.position.y = 0.16;
        corpoSaco.castShadow = true;
        s.add(corpoSaco);

        // Faixa de identificação de alimento nutritivo
        const faixa = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, 0.4), etiquetaMat);
        faixa.position.set(0, 0.22, 0);
        s.add(faixa);

        // Amarra franzida na ponta do saco
        const amarra = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 6), amarraMat);
        amarra.position.set(0, 0.2, 0.65);
        s.add(amarra);

        grpSacosRacao.add(s);
      };

      // Base com 3 sacos organizados
      criarSaco(-0.45, 0, 0, 0.05, sacoMat1);
      criarSaco(0.45, 0, -0.05, -0.08, sacoMat2);
      criarSaco(-0.42, 0, 1.25, 0.02, sacoMat2);

      // Segundo nível com 2 sacos cruzados no topo
      criarSaco(0, 0.32, 0.05, Math.PI * 0.48, sacoMat1);
      criarSaco(0, 0.32, 1.15, Math.PI * 0.45, sacoMat2);

      grpEstabulo.add(grpSacosRacao);
      grpEstabulo.add(kit.criarSombraDeContato(-6.5, -1.5, 1.8, 2.2, 0.45));

      // Lanternas suspensas quentes com suporte de ferro trabalhado
      const lanternas = [];
      const criarLanternaSuspensa = (lx, ly, lz, parent, alcanceLuz) => {
        const lGrp = new THREE.Group();
        lGrp.position.set(lx, ly, lz);

        const ferroMat = kit.mat('lambert', 0x263238);
        // Suporte metálico fixado na parede
        const hasteV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), ferroMat);
        lGrp.add(hasteV);

        const hasteH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.35), ferroMat);
        hasteH.position.set(0, 0.15, 0.16);
        lGrp.add(hasteH);

        // Corpo da lanterna
        const corpoLanterna = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.2), ferroMat);
        corpoLanterna.position.set(0, -0.05, 0.32);
        lGrp.add(corpoLanterna);

        // Vidro iluminado incandescente
        const vidroLuz = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.14), kit.mat('basic', 0xffb74d));
        vidroLuz.position.set(0, -0.05, 0.32);
        lGrp.add(vidroLuz);

        // Halo suave luminoso ao redor da lanterna
        const haloLanterna = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 12, 12),
          kit.mat('basic', 0xffe082, { transparent: true, opacity: 0.32, depthWrite: false })
        );
        haloLanterna.position.set(0, -0.05, 0.32);
        lGrp.add(haloLanterna);

        // Piscina de luz acolhedora no piso logo abaixo da lanterna
        const piscinaLuzMat = kit.mat('basic', 0xffb74d, { transparent: true, opacity: 0.22, depthWrite: false });
        const piscinaLuz = new THREE.Mesh(new THREE.CircleGeometry(1.8, 16), piscinaLuzMat);
        piscinaLuz.rotation.x = -Math.PI / 2;
        piscinaLuz.position.set(0, -ly + 0.05, 0.32);
        lGrp.add(piscinaLuz);

        // Fonte de luz pontual acolhedora (PointLight 0xffb74d)
        const pLight = new THREE.PointLight(0xffb74d, 1.15, alcanceLuz || 8.5);
        pLight.position.set(0, -0.05, 0.32);
        lGrp.add(pLight);

        parent.add(lGrp);
        lanternas.push({ pLight, halo: haloLanterna, piscina: piscinaLuz, baseInt: 1.15, fase: Math.random() * Math.PI * 2 });
      };

      criarLanternaSuspensa(0, 3.6, -1.3, grpEstabulo, 10.5);   // Entrada principal do celeiro (lanterna acolhedora 0xffb74d)
      criarLanternaSuspensa(-3.5, 2.2, 3.8, grpEstabulo, 6.5);   // Perto dos latões de leite
      criarLanternaSuspensa(-6.8, 2.2, -2.4, grpEstabulo, 6.5);  // Perto da ração

      // Fardos de feno organizados ao lado do estábulo com fiapos volumétricos
      const feno3 = kit.criarFardoFeno(7.5, -3, 0.1);
      feno3.userData = {
        interativo: true,
        nome: msgFeno,
        som: 'pop'
      };
      adicionarFiaposFardo(feno3);
      grpEstabulo.add(feno3);

      const feno4 = kit.criarFardoFeno(7.5, -1.5, 0.25);
      feno4.userData = {
        interativo: true,
        nome: msgFeno,
        som: 'pop'
      };
      adicionarFiaposFardo(feno4);
      grpEstabulo.add(feno4);

      const feno5 = kit.criarFardoFeno(7.5, 0, -0.1);
      feno5.userData = {
        interativo: true,
        nome: msgFeno,
        som: 'pop'
      };
      adicionarFiaposFardo(feno5);
      grpEstabulo.add(feno5);

      // Trator agrícola detalhado com rodas robustas e escapamento vertical
      const trator = new THREE.Group();
      trator.position.set(6, 0, 8);
      trator.rotation.y = -Math.PI * 0.15;
      trator.userData = {
        interativo: true,
        pistaMissao: 3,
        nome: '🚜 Trator agrícola: máquina forte com rodas robustas que apoia os trabalhos da fazenda.',
        som: 'motor',
        aoClicar: function (alvo) {
          alvo.userData.vibrarAte = performance.now() * 0.001 + 2.0;
        }
      };

      const verdeTratorMat = kit.mat('lambert', 0x2e7d32);
      const chassiTratorMat = kit.mat('lambert', 0x263238);
      const metalTratorMat = kit.mat('lambert', 0x455a64);

      // Chassi inferior robusto
      const chassiTrator = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.65, 3.8), chassiTratorMat);
      chassiTrator.position.y = 0.85;
      chassiTrator.castShadow = true;
      trator.add(chassiTrator);

      // Capô frontal do motor
      const capo = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.1, 2.3), verdeTratorMat);
      capo.position.set(0, 1.6, 0.8);
      capo.castShadow = true;
      trator.add(capo);

      // Grade frontal preta do radiador
      const gradeMotor = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.85, 0.1), chassiTratorMat);
      gradeMotor.position.set(0, 1.5, 1.96);
      trator.add(gradeMotor);

      // Faróis dianteiros brilhantes com feixes suaves para a frente
      const farolTratorMat = kit.mat('phong', 0xfff59d, { emissive: 0xffeb3b, emissiveIntensity: 0.85 });
      const haloFarolTratorMat = kit.mat('basic', 0xfff59d, { transparent: true, opacity: 0.28, depthWrite: false });
      const feixeTratorMat = kit.mat('basic', 0xfff9c4, { transparent: true, opacity: 0.18, depthWrite: false });

      [-0.65, 0.65].forEach((fx) => {
        const farol = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), farolTratorMat);
        farol.position.set(fx, 1.7, 1.96);
        trator.add(farol);

        // Halo luminoso frontal da lente
        const haloFarol = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), haloFarolTratorMat);
        haloFarol.position.set(fx, 1.7, 2.02);
        trator.add(haloFarol);

        // Fonte de luz projetando iluminação suave à frente
        const luzFarol = new THREE.PointLight(0xfff59d, 0.8, 10);
        luzFarol.position.set(fx, 1.7, 3.0);
        trator.add(luzFarol);

        // Feixe cônico suave de iluminação projetado para a frente
        const feixeGeo = new THREE.ConeGeometry(0.9, 5.0, 12, 1, true);
        const feixe = new THREE.Mesh(feixeGeo, feixeTratorMat);
        feixe.position.set(fx, 1.65, 4.4);
        feixe.rotation.x = Math.PI / 2;
        trator.add(feixe);
      });

      // Iluminação suave e piscina de luz acolhedora projetada no solo à frente do trator
      const luzChaoTrator = new THREE.PointLight(0xfff9c4, 0.65, 9);
      luzChaoTrator.position.set(0, 0.6, 5.0);
      trator.add(luzChaoTrator);

      const piscinaChaoTratorMat = kit.mat('basic', 0xfff9c4, { transparent: true, opacity: 0.18, depthWrite: false });
      const piscinaChaoTrator = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5.4), piscinaChaoTratorMat);
      piscinaChaoTrator.rotation.x = -Math.PI / 2;
      piscinaChaoTrator.position.set(0, 0.05, 5.2);
      trator.add(piscinaChaoTrator);

      // Cabine envidraçada panorâmica
      const cabineVidroMat = kit.mat('phong', 0xe0f7fa, { transparent: true, opacity: 0.72, shininess: 95 });
      const cabineVidro = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.55, 1.6), cabineVidroMat);
      cabineVidro.position.set(0, 2.7, -0.6);
      cabineVidro.castShadow = true;
      trator.add(cabineVidro);

      // Colunas pretas da cabine
      [[-0.92, -1.35], [0.92, -1.35], [-0.92, 0.15], [0.92, 0.15]].forEach(([cx, cz]) => {
        const coluna = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), chassiTratorMat);
        coluna.position.set(cx, 2.7, cz);
        trator.add(coluna);
      });

      // Teto verde da cabine com sinalizador âmbar
      const tetoCabine = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.18, 1.8), verdeTratorMat);
      tetoCabine.position.set(0, 3.55, -0.6);
      tetoCabine.castShadow = true;
      trator.add(tetoCabine);

      const giroflex = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.18, 8), kit.mat('basic', 0xffa000));
      giroflex.position.set(0, 3.72, -0.6);
      trator.add(giroflex);

      // Volante do operador no interior da cabine
      const volante = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 6, 12), chassiTratorMat);
      volante.rotation.x = Math.PI * 0.35;
      volante.position.set(0, 2.45, -0.15);
      trator.add(volante);

      // Escapamento vertical com curva e bocal protetor
      const escapeVertical = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 8), metalTratorMat);
      escapeVertical.position.set(0.85, 2.7, 0.9);
      escapeVertical.castShadow = true;
      trator.add(escapeVertical);

      const bocalEscape = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.16), metalTratorMat);
      bocalEscape.position.set(0.85, 3.62, 0.92);
      bocalEscape.rotation.x = 0.35;
      trator.add(bocalEscape);

      // Rodas traseiras gigantes com garras de tração e cubos amarelos
      const rodaGGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.65, 14);
      const pneuMat = kit.mat('lambert', 0x212121);
      const cuboMat = kit.mat('phong', 0xfbc02d, { shininess: 80 });

      [-1.38, 1.38].forEach((rx) => {
        const rGrp = new THREE.Group();
        rGrp.position.set(rx, 1.05, -0.9);

        const pneu = new THREE.Mesh(rodaGGeo, pneuMat);
        pneu.rotation.z = Math.PI / 2;
        pneu.castShadow = true;
        rGrp.add(pneu);

        // Cubo central da roda com porcas
        const cubo = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.68, 8), cuboMat);
        cubo.rotation.z = Math.PI / 2;
        rGrp.add(cubo);

        // Para-lamas arredondados sobre as rodas traseiras
        const paralamas = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 1.45), verdeTratorMat);
        paralamas.position.set(0, 1.15, 0);
        rGrp.add(paralamas);

        trator.add(rGrp);
      });

      // Rodas dianteiras direcionais
      const rodaPGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.48, 12);
      [-1.32, 1.32].forEach((fx) => {
        const rGrp = new THREE.Group();
        rGrp.position.set(fx, 0.65, 1.3);

        const pneu = new THREE.Mesh(rodaPGeo, pneuMat);
        pneu.rotation.z = Math.PI / 2;
        pneu.castShadow = true;
        rGrp.add(pneu);

        const cubo = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 8), cuboMat);
        cubo.rotation.z = Math.PI / 2;
        rGrp.add(cubo);

        trator.add(rGrp);
      });

      // Engate traseiro de implementos
      const engate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.4), metalTratorMat);
      engate.position.set(0, 0.75, -2.05);
      trator.add(engate);

      grpEstabulo.add(trator);
      grpEstabulo.add(kit.criarSombraDeContato(6, 8, 2.5, 3.4, 0.48));

      // Cercas com mourões de nós de madeira estilizados no confinamento
      criarCercaMouroesComNos(grpEstabulo, 10, 0, 36, true);
      criarCercaMouroesComNos(grpEstabulo, 0, -18, 20, false);
      criarCercaMouroesComNos(grpEstabulo, 0, 18, 20, false);

      // Porteira detalhada de fazenda para entrada do curral
      criarPorteiraFazendaDetalhada(grpEstabulo, -2.2, 5.0, Math.PI, animaveis);

      // Canteiro botânico ornamental de flores campestres pastéis em frente ao curral
      criarCanteiroBotanicoPastel(grpEstabulo, 7.5, 3.2, 0, 4.2, 2.2);

      grpEstabulo.add(kit.criarArbusto(8, 12, 0x43a047));
      grpEstabulo.add(kit.criarPlaca(0, 15, '🏡 ESTÁBULO (INTENSIVA)', 0xc62828));
      scene.add(grpEstabulo);

      // Caminhão azul de transporte na estrada central
      const caminhao = kit.criarCaminhao(0x1976d2);
      caminhao.position.set(0, 0, 8);
      caminhao.userData.interativo = true;
      caminhao.userData.pistaMissao = 5;
      caminhao.userData.nome = '🚚 Caminhão de transporte: leva leite, carnes e produtos da pecuária do campo para a cidade.';
      caminhao.userData.som = 'buzina';
      caminhao.userData.aoClicar = function (alvo) {
        alvo.userData.vibrarAte = performance.now() * 0.001 + 2.0;
      };
      scene.add(caminhao);

      // Sombra de contato perfeita e alinhada sob o caminhão de transporte
      const sombraCaminhao = kit.criarSombraContato(0, 8, 2.1, 3.8, 0.46);
      sombraCaminhao.position.y = 0.04;
      scene.add(sombraCaminhao);

      // Animações contínuas e acolhedoras (TEA-friendly: suaves e harmoniosas)
      animaveis.push((now) => {
        // Balanço calmo do barquinho no píer do lago
        barcoRemo.rotation.z = Math.sin(now * 1.6) * 0.035;
        barcoRemo.position.y = 0.12 + Math.sin(now * 1.4) * 0.015;

        // Ondulação suave dos patos na água com pulo alegre ao toque
        patos.forEach((p, i) => {
          const emReacao = p.userData && p.userData.reacaoToqueAte > now;
          const jumpBonus = emReacao ? Math.abs(Math.sin(now * 14)) * 0.22 : 0;
          p.position.y = p.userData.baseY + Math.sin(now * 2.0 + p.userData.fase) * 0.018 + jumpBonus;
          p.rotation.x = Math.sin(now * 1.8 + p.userData.fase) * (emReacao ? 0.2 : 0.04);
          p.rotation.z = Math.cos(now * 1.6 + p.userData.fase) * (emReacao ? 0.25 : 0.03);
        });

        // Galinhas ciscando com bicar acelerado e pulo fofo ao toque
        galinhas.forEach((g) => {
          const off = g.userData.tempo || 0;
          const emReacao = g.userData && g.userData.reacaoToqueAte > now;
          if (g.userData.pescoco) {
            const freq = emReacao ? 8.0 : 3.2;
            const bicar = Math.sin(now * freq + off);
            g.userData.pescoco.rotation.x = bicar > 0.1 ? (bicar - 0.1) * (emReacao ? 0.85 : 0.6) : 0;
          }
          if (emReacao) {
            g.position.y = Math.abs(Math.sin(now * 14)) * 0.15;
          }
        });

        // Ondulação sutil e brilho da água do bebedouro límpido
        aguaCocho.scale.x = 1 + Math.sin(now * 2.2) * 0.012;
        luzBebedouro.intensity = 0.55 + Math.sin(now * 2.2 + 0.6) * 0.09;
        brilhoBebedouro.scale.x = 1.0 + Math.sin(now * 1.8) * 0.12;

        // Pulso sutil senoidal do reflexo cintilante da água do lago
        luzLago.intensity = 0.75 + Math.sin(now * 1.8) * 0.12;
        if (discoReflexoLago && discoReflexoLago.material) {
          discoReflexoLago.material.opacity = 0.32 + Math.sin(now * 1.8) * 0.06;
        }

        // Juncos de taboa detalhados balançando suavemente à brisa com reação ao toque
        juncosTaboaAnimados.forEach((t) => {
          const emReacao = t.parent && t.parent.userData && t.parent.userData.reacaoToqueAte > now;
          const mult = emReacao ? 2.5 : 1.0;
          t.rotation.z = Math.sin(now * t.userData.freq * mult + t.userData.fase) * (t.userData.ampl * (emReacao ? 2.0 : 1.0));
          t.rotation.x = Math.cos(now * (t.userData.freq * 0.8) * mult + t.userData.fase) * (t.userData.ampl * (emReacao ? 1.8 : 0.8));
        });

        // Vitórias-régias de pétalas duplas flutuando na ondulação do lago
        vitoriasDuplasAnimadas.forEach((v) => {
          const emReacao = v.userData && v.userData.reacaoToqueAte > now;
          const jumpBonus = emReacao ? Math.abs(Math.sin(now * 12)) * 0.12 : 0;
          v.position.y = v.userData.baseY + Math.sin(now * 1.8 + v.userData.fase) * 0.012 + jumpBonus;
          v.rotation.z = Math.sin(now * 1.5 + v.userData.fase) * (emReacao ? 0.15 : 0.025);
        });

        // Canteiros botânicos: balanço individualizado à brisa de margaridas brancas, lavandas e botões dourados
        floresBotanicasAnimadas.forEach((fl) => {
          const emReacao = fl.parent && fl.parent.userData && fl.parent.userData.reacaoToqueAte > now;
          const freq = emReacao ? 5.5 : fl.userData.freq;
          const amplBonus = emReacao ? 2.8 : 1.0;
          fl.rotation.z = Math.sin(now * freq + fl.userData.fase) * (fl.userData.amplZ * amplBonus);
          fl.rotation.x = Math.cos(now * (freq * 0.85) + fl.userData.fase) * (fl.userData.amplX * amplBonus);
        });

        // Porteiras de fazenda com leve amortecimento elástico ao toque
        porteirasFazendaAnimadas.forEach((p) => {
          const emReacao = p.userData && p.userData.reacaoToqueAte > now;
          if (p.userData.folhaPorteira) {
            p.userData.folhaPorteira.rotation.y = emReacao ? Math.sin(now * 8) * 0.28 : 0;
          }
        });

        // Pulso suave e acolhedor da janela do moinho e rotação acelerada ao toque por 3s
        const moinhoTurbo = moinho && moinho.userData && moinho.userData.turboAte > now;
        luzMoinho.intensity = 0.75 + Math.sin(now * (moinhoTurbo ? 4.5 : 1.6)) * (moinhoTurbo ? 0.35 : 0.09);
        if (moinhoTurbo && moinho.userData && moinho.userData.paGrp) {
          moinho.userData.paGrp.rotation.z -= 0.035;
        }

        // Brilho dourado aconchegante do estábulo e poça na soleira de entrada
        luzCeleiroInterior.intensity = 0.85 + Math.sin(now * 1.8) * 0.06;
        pocaLuzSoleira.scale.setScalar(1.0 + Math.sin(now * 2.5) * 0.03);

        // Girassóis balançando suavemente com a brisa e reativos ao toque
        girassois.forEach((gir, i) => {
          const emReacao = gir.userData && gir.userData.reacaoToqueAte > now;
          const ampl = emReacao ? 0.16 : 0.035;
          const freq = emReacao ? 6.0 : 1.4;
          gir.rotation.z = Math.sin(now * freq + i * 0.8) * ampl;
        });

        // Vibração da suspensão do trator e pulso luminoso dos faróis ao toque
        const tratorVibrando = trator.userData && trator.userData.vibrarAte > now;
        trator.position.y = 0.02 + Math.sin(now * (tratorVibrando ? 36 : 4.5)) * (tratorVibrando ? 0.04 : 0.008);
        if (tratorVibrando) {
          trator.rotation.z = Math.sin(now * 24) * 0.02;
          luzChaoTrator.intensity = 0.65 + Math.sin(now * 16) * 0.45;
        } else {
          trator.rotation.z = 0;
          luzChaoTrator.intensity = 0.65;
        }

        // Vibração e buzina do caminhão ao toque
        const caminhaoVibrando = caminhao.userData && caminhao.userData.vibrarAte > now;
        caminhao.position.y = caminhaoVibrando ? Math.sin(now * 32) * 0.035 : 0;
        if (caminhaoVibrando) {
          caminhao.rotation.z = Math.sin(now * 24) * 0.015;
        } else {
          caminhao.rotation.z = 0;
        }

        // Pulsação suave e relaxante das lanternas rústicas
        lanternas.forEach((lan) => {
          lan.pLight.intensity = lan.baseInt + Math.sin(now * 2.2 + lan.fase) * 0.12;
          if (lan.halo && lan.halo.material) {
            lan.halo.material.opacity = 0.32 + Math.sin(now * 2.2 + lan.fase) * 0.05;
          }
          if (lan.piscina && lan.piscina.material) {
            lan.piscina.material.opacity = 0.22 + Math.sin(now * 2.2 + lan.fase) * 0.04;
          }
        });

        // Vaquinhas e bezerro com balanço de cabeça e corpo reforçado ao toque
        [v1, v2, v3, bezerro].forEach((v) => {
          const off = (v.userData && v.userData.tempo) || 0;
          const emReacao = v.userData && v.userData.reacaoToqueAte > now;
          const mult = emReacao ? 3.0 : 1.0;
          if (v.userData && v.userData.cabeca) {
            v.userData.cabeca.position.y = v.userData.baseHeadY + Math.sin(now * 2 * mult + off) * (emReacao ? 0.15 : 0.06);
            v.userData.cabeca.rotation.x = Math.sin(now * 1.8 * mult + off) * (emReacao ? 0.22 : 0.08);
            if (emReacao) {
              v.userData.cabeca.rotation.z = Math.sin(now * 14) * 0.2;
              v.rotation.z = Math.sin(now * 10) * 0.04;
            } else {
              v.userData.cabeca.rotation.z = 0;
              v.rotation.z = 0;
            }
          }
          if (v.userData && v.userData.focinho) {
            v.userData.focinho.rotation.y = Math.sin(now * 6 + off) * 0.07;
          }
          if (v.userData && v.userData.cauda) {
            v.userData.cauda.rotation.z = Math.sin(now * (emReacao ? 10 : 4) + off) * (emReacao ? 0.6 : 0.3);
          }
          if (v.userData && v.userData.sino) {
            v.userData.sino.rotation.z = Math.sin(now * 2.5 + off) * 0.18;
          }
        });
      });
    },

    missoes: [
      {
        kicker: 'Missão 1 · Gado no Campo',
        enunciado: 'Onde o gado vive solto em grandes áreas e come nas pastagens?',
        respostaCerta: 'pasto',
        cam: 'pasto',
        foto: '../img/hga/pec/pasto.jpg',
        fotoAlt: 'Gado solto no pasto',
        explicacao: '🌟 Muito bem! Na pecuária extensiva, os animais vivem soltos nas grandes pastagens verdes e comem capim natural.',
        dicaRetry: '💡 Dica: observe a área verde aberta. Na pecuária extensiva, o gado fica livre no pasto!',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Gado Solto)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Gado Confinado)' }
        ]
      },
      {
        kicker: 'Missão 2 · Confinamento',
        enunciado: 'Onde o gado fica confinado (abrigado) e recebe ração no cocho?',
        respostaCerta: 'estabulo',
        cam: 'estabulo',
        foto: '../img/hga/pec/curral.jpg',
        fotoAlt: 'Gado confinado no curral',
        explicacao: '🌟 Parabéns! Na pecuária intensiva, os animais ficam protegidos no estábulo e comem ração balanceada no cocho.',
        dicaRetry: '💡 Dica: veja a construção de madeira vermelha. No estábulo, o gado fica protegido e confinado!',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Gado Solto)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Gado Confinado)' }
        ]
      },
      {
        kicker: 'Missão 3 · Ordenha do Leite',
        enunciado: 'Onde pode ser feita a ordenha mecânica com máquinas para tirar leite?',
        respostaCerta: 'estabulo',
        cam: 'estabulo',
        foto: '../img/hga/pec/curral.jpg',
        fotoAlt: 'Ordenha mecânica no estábulo',
        explicacao: '🌟 Excelente! No estábulo da pecuária intensiva, a retirada de leite fresco pode ser feita com máquinas modernas de ordenha.',
        dicaRetry: '💡 Dica: as máquinas de ordenha mecânica ficam no estábulo da pecuária intensiva.',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Gado Solto)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Gado Confinado)' }
        ]
      },
      {
        kicker: 'Missão 4 · Mais Trabalhadores',
        enunciado: 'Em qual forma de criação é necessário mais trabalhadores cuidando do gado?',
        respostaCerta: 'estabulo',
        cam: 'estabulo',
        foto: '../img/hga/pec/curral.jpg',
        fotoAlt: 'Pecuária intensiva com mais trabalhadores',
        explicacao: '🌟 Isso mesmo! Na pecuária intensiva, muitos trabalhadores cuidam da alimentação, higiene e saúde dos animais todos os dias.',
        dicaRetry: '💡 Dica: cuidar dos animais fechados em cocheiras exige mais pessoas trabalhando.',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Poucos trabalhadores)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Mais trabalhadores)' }
        ]
      },
      {
        kicker: 'Missão 5 · Poucos Trabalhadores',
        enunciado: 'Onde um pequeno número de trabalhadores consegue cuidar dos animais?',
        respostaCerta: 'pasto',
        cam: 'pasto',
        foto: '../img/hga/pec/pasto.jpg',
        fotoAlt: 'Gado solto no pasto',
        explicacao: '🌟 Perfeito! Na pecuária extensiva, os animais buscam seu próprio alimento nas pastagens, então poucos vaqueiros cuidam de todo o gado.',
        dicaRetry: '💡 Dica: como os animais pastam livres pelo campo, poucas pessoas cuidam da área.',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Poucos trabalhadores)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Mais trabalhadores)' }
        ]
      },
      {
        kicker: 'Missão 6 · Produtos da Pecuária',
        enunciado: 'Toque nos 4 produtos obtidos por meio da criação de animais:',
        tipo: 'produtos',
        cam: 'produtos',
        foto: '../img/jogo/pec/emoji/leite.svg',
        fotoAlt: 'Produtos da pecuária',
        explicacao: '🎉 Fantástico! Pela pecuária obtemos alimentos e matérias-primas essenciais: leite fresco, carnes, ovos e couro!',
        totalRequerido: 4,
        itens: [
          { id: 'leite', nome: 'Leite', img: '../img/jogo/pec/emoji/leite.svg' },
          { id: 'carne', nome: 'Carnes', img: '../img/jogo/pec/carne.svg' },
          { id: 'ovos', nome: 'Ovos', img: '../img/jogo/pec/emoji/ovos.svg' },
          { id: 'couro', nome: 'Couro', img: '../img/jogo/pec/couro.svg' }
        ]
      }
    ],

    resumoFinal: [
      {
        titulo: '🌿 Pecuária Extensiva',
        itens: [
          'Gado criado solto em grandes áreas',
          'Alimentam-se nas pastagens',
          'Poucos trabalhadores'
        ]
      },
      {
        titulo: '🏡 Pecuária Intensiva',
        itens: [
          'Animais confinados no curral ou estábulo',
          'Alimentação específica no cocho',
          'Ordenha mecânica',
          'Mais trabalhadores'
        ]
      }
    ]
  };
})(window);
