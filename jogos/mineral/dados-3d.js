/* jogos/mineral/dados-3d.js — Dados declarativos do jogo 3D de Extrativismo Mineral.
   Lido por jogos/jogar-3d.html?topico=mineral. Usa os helpers em ../jogo-kit-3d.js. */
(function (global) {
  'use strict';
  global.DADOS_3D = global.DADOS_3D || {};

  global.DADOS_3D.mineral = {
    id: 'min-3d',
    topico: 'mineral',
    titulo: 'Mina e Cidade 3D dos Minerais',
    icone: '⛏️',
    referenciaLivro: 'p. 90 e 91 · base do livro',
    skyColor: 0xdcedf8,
    skyTopo: 0x90a4ae, /* Cinza para céu nublado */
    skyBase: 0xcfd8dc, /* Cinza claro no horizonte */
    hudTags: ['⛏️ Mina (Solo e Subsolo)', '🏙️ Cidade (Construções e Fios)'],

    visual: {
      cor: true,
      exposicao: 1.05,
      ceu: { topo: 0x90a4ae, base: 0xcfd8dc },
      nevoa: { cor: 0xcfd8dc, perto: 75, longe: 180 }
    },

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '⛏️ Olhar Mina', cam: 'mina' },
      { label: '🏙️ Olhar Cidade', cam: 'cidade' },
      { label: '💎 Minerais', cam: 'minerais' },
      { label: '📐 Isométrica', cam: 'isometrica' }
    ],

    cameras: {
      geral:      { pos: [0, 30, 42], look: [0, 2, -2] },
      mina:       { pos: [-15, 18, 28], look: [-14, 2, -2] },
      cidade:     { pos: [15, 18, 28], look: [14, 2, -2] },
      isometrica: { pos: [30, 30, 30], look: [0, 2, 0] },
      minerais:   { pos: [0, 12, 22], look: [0, 1.8, 8] }
    },

    fichas3d: [
      {
        id: 'min-ferro',
        pos: [-15.5, 4.8, -2.5],
        nome: '🔩 Minério de Ferro',
        foto: '../img/hga/min/ferro.jpg',
        fato: 'O ferro é extraído da natureza e vira aço forte para ferramentas e construções.'
      },
      {
        id: 'min-cobre',
        pos: [13.0, 4.8, -2.5],
        nome: '⚡ Fios de Cobre',
        foto: '../img/hga/min/cobre.jpg',
        fato: 'O cobre é um metal condutor que transmite eletricidade para as lâmpadas.'
      },
      {
        id: 'min-cimento',
        pos: [15.0, 5.0, 2.5],
        nome: '🧱 Cimento para Prédios',
        foto: '../img/hga/min/cimento.jpg',
        fato: 'O cimento é produzido a partir do calcário e ajuda a construir as cidades.'
      },
      {
        id: 'min-areia',
        pos: [-11.0, 4.0, 4.5],
        nome: '🏖️ Areia da Construção',
        foto: '../img/hga/min/areia.jpg',
        fato: 'A areia é um recurso mineral da natureza indispensável nas obras.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Pedestal da Ilha Diorama Flutuante estratificado (solo rochoso e minerais)
      scene.add(kit.criarIlhaDiorama(64, 44, 4.0, 0x8a947d, 0x4e342e));
      scene.add(kit.criarEstrada(6, 44, 0x455a64));

      // Faixas centrais da estrada de asfalto
      const faixaGeo = new THREE.PlaneGeometry(0.3, 2);
      const faixaMat = kit.mat('basic', 0xffffff);
      for (let z = -18; z <= 18; z += 4) {
        const fx = new THREE.Mesh(faixaGeo, faixaMat);
        fx.rotation.x = -Math.PI / 2;
        fx.position.set(0, 0.03, z);
        scene.add(fx);
      }

      // Pedrinhas decorativas minerais, tufos estilizados e flores nos caminhos e acostamento
      [-16, -11, -6, 0, 5, 11, 16].forEach((pz, idx) => {
        // Acostamento da mina (lado rochoso/mineral)
        kit.criarPedrinhasDecorativas(scene, -3.3, pz, 8, 1.2, { escala: 0.9, cores: [0x78909c, 0x90a4ae, 0xb0bec5, 0x8d6e63] });
        kit.criarTufosGramaDecorativos(scene, -3.25, pz + (idx % 2 === 0 ? 0.7 : -0.7), 4, 0.8, animaveis, 0x8a947d);

        // Acostamento da cidade/construção (lado urbano)
        kit.criarPedrinhasDecorativas(scene, 3.3, pz + 0.8, 8, 1.2, { escala: 0.85, cores: [0xb0bec5, 0xcfd8dc, 0x90a4ae] });
        kit.criarTufosGramaDecorativos(scene, 3.25, pz + (idx % 2 === 0 ? -0.7 : 0.7), 5, 0.9, animaveis, 0x7cb342);
        if (idx % 2 === 0) {
          kit.criarFloresCampestresCaminho(scene, 3.4, pz + 1.1, 5, 0.9, animaveis, [0xffffff, 0xfff9c4, 0xbbdefb]);
        }
      });

      // ==================== LADO ESQUERDO: MINA (Solo e Subsolo) ====================
      const grpMina = new THREE.Group();
      grpMina.position.set(-15, 0, 0);

      // Chão escavado de terra e rocha da mina
      const pisoMina = kit.criarChao(22, 34, 0x8d6e63);
      pisoMina.position.y = 0.04;
      grpMina.add(pisoMina);

      // --- 1. BANCADAS ESCALONADAS DA MINA A CÉU ABERTO COM ESTRATOS MINERAIS ---
      const matPat1 = kit.mat('lambert', 0x795548);
      const matPat2 = kit.mat('lambert', 0x6d4c41);
      const matPat3 = kit.mat('lambert', 0x5d4037);
      const matPat4 = kit.mat('lambert', 0x4e342e);

      // Níveis de rocha escalonada recuados na encosta posterior (liberando a praça de manobra da mina)
      const nivel1 = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 6.4, 1.8, 12), matPat1);
      nivel1.position.set(-5.0, 0.9, -8.5);
      nivel1.castShadow = true;
      nivel1.receiveShadow = true;
      nivel1.userData = {
        interativo: true,
        pistaMissao: 4,
        nome: '⛰️ Taludes e encostas da mina: degraus escavados na rocha para segurança e recuperação ambiental.',
        som: 'pop'
      };
      grpMina.add(nivel1);

      const nivel2 = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.8, 1.8, 12), matPat2);
      nivel2.position.set(-5.0, 2.7, -8.5);
      nivel2.castShadow = true;
      nivel2.receiveShadow = true;
      grpMina.add(nivel2);

      const nivel3 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, 1.8, 11), matPat3);
      nivel3.position.set(-5.0, 4.5, -8.5);
      nivel3.castShadow = true;
      nivel3.receiveShadow = true;
      grpMina.add(nivel3);

      const nivel4 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.2, 1.4, 10), matPat4);
      nivel4.position.set(-5.0, 6.1, -8.5);
      nivel4.castShadow = true;
      nivel4.receiveShadow = true;
      grpMina.add(nivel4);

      // Estratos geológicos coloridos nas paredes rochosas das bancadas da mina:
      // 1. Ocre avermelhado/alaranjado de Bauxita (óxido de alumínio nativo)
      const matBauxita = kit.mat('lambert', 0xd97736);
      const matBauxitaEscura = kit.mat('lambert', 0xbf5700);

      // 2. Cinza escuro metálico reluzente de Hematita (minério de ferro puro)
      const matHematitaCinza = kit.mat('phong', 0x2b303a, { shininess: 85, specular: 0x90a4ae });
      const matHematitaEscura = kit.mat('phong', 0x1f242b, { shininess: 90, specular: 0xb0bec5 });
      const matHematitaRubra = kit.mat('lambert', 0x8d3b2a);

      // 3. Arenito dourado e calcário estratificado
      const matArenitoDourado = kit.mat('lambert', 0xe9c46a);
      const matArenitoOcre = kit.mat('lambert', 0xd4a373);

      // Estratos do Nível 1 (Bancada inferior)
      const estratoBauxita1 = new THREE.Mesh(new THREE.CylinderGeometry(5.24, 5.75, 0.38, 12, 1, false, 0, Math.PI * 1.55), matBauxita);
      estratoBauxita1.position.set(-5.0, 0.45, -8.5);
      grpMina.add(estratoBauxita1);

      const estratoHematita1 = new THREE.Mesh(new THREE.CylinderGeometry(5.26, 5.78, 0.42, 12, 1, false, Math.PI * 0.35, Math.PI * 1.3), matHematitaCinza);
      estratoHematita1.position.set(-5.0, 1.25, -8.5);
      grpMina.add(estratoHematita1);

      const estratoArenito1 = new THREE.Mesh(new THREE.CylinderGeometry(5.27, 5.82, 0.28, 12, 1, false, Math.PI * 0.8, Math.PI * 1.1), matArenitoDourado);
      estratoArenito1.position.set(-5.0, 1.62, -8.5);
      grpMina.add(estratoArenito1);

      // Estratos do Nível 2 (Segunda bancada)
      const estratoArenito2 = new THREE.Mesh(new THREE.CylinderGeometry(3.84, 4.38, 0.36, 12, 1, false, 0, Math.PI * 1.4), matArenitoOcre);
      estratoArenito2.position.set(-5.0, 2.15, -8.5);
      grpMina.add(estratoArenito2);

      const estratoHematita2 = new THREE.Mesh(new THREE.CylinderGeometry(3.86, 4.42, 0.44, 12, 1, false, Math.PI * 0.25, Math.PI * 1.45), matHematitaEscura);
      estratoHematita2.position.set(-5.0, 2.95, -8.5);
      grpMina.add(estratoHematita2);

      const estratoBauxita2 = new THREE.Mesh(new THREE.CylinderGeometry(3.88, 4.45, 0.32, 12, 1, false, Math.PI * 0.7, Math.PI * 1.2), matBauxitaEscura);
      estratoBauxita2.position.set(-5.0, 3.42, -8.5);
      grpMina.add(estratoBauxita2);

      // Estratos do Nível 3 (Terceira bancada)
      const estratoBauxita3 = new THREE.Mesh(new THREE.CylinderGeometry(2.44, 2.98, 0.32, 11, 1, false, Math.PI * 0.1, Math.PI * 1.35), matBauxita);
      estratoBauxita3.position.set(-5.0, 4.15, -8.5);
      grpMina.add(estratoBauxita3);

      const estratoHematita3 = new THREE.Mesh(new THREE.CylinderGeometry(2.46, 3.02, 0.38, 11, 1, false, Math.PI * 0.55, Math.PI * 1.3), matHematitaCinza);
      estratoHematita3.position.set(-5.0, 4.75, -8.5);
      grpMina.add(estratoHematita3);

      const estratoArenito3 = new THREE.Mesh(new THREE.CylinderGeometry(2.47, 3.05, 0.26, 11, 1, false, 0, Math.PI * 1.1), matArenitoDourado);
      estratoArenito3.position.set(-5.0, 5.25, -8.5);
      grpMina.add(estratoArenito3);

      // Estratos do Nível 4 (Cume da bancada da mina)
      const estratoHematita4 = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 2.18, 0.35, 10, 1, false, Math.PI * 0.2, Math.PI * 1.2), matHematitaRubra);
      estratoHematita4.position.set(-5.0, 6.2, -8.5);
      grpMina.add(estratoHematita4);

      // Blocos rochosos angulares e lascas minerais salientes nas frentes de lavra
      [
        { x: -1.8, y: 1.0, z: -7.2, mat: matHematitaCinza, s: 0.36 },
        { x: -7.5, y: 1.1, z: -7.6, mat: matBauxita, s: 0.38 },
        { x: -2.8, y: 2.8, z: -8.0, mat: matArenitoDourado, s: 0.32 },
        { x: -6.8, y: 2.85, z: -8.2, mat: matHematitaEscura, s: 0.35 },
        { x: -3.8, y: 4.6, z: -8.4, mat: matBauxitaEscura, s: 0.30 },
        { x: -5.8, y: 4.65, z: -8.5, mat: matArenitoOcre, s: 0.28 }
      ].forEach((bloco) => {
        const bMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(bloco.s, 0), bloco.mat);
        bMesh.position.set(bloco.x, bloco.y, bloco.z);
        bMesh.rotation.set(Math.random(), Math.random(), Math.random());
        bMesh.castShadow = true;
        grpMina.add(bMesh);
      });

      // Veios verde-azulados de cobre (malaquita / carbonato de cobre oxidado)
      const matCobreVeio = kit.mat('phong', 0x26a69a, { shininess: 40 });
      const matCobreNugget = kit.mat('phong', 0xb87333, { shininess: 85 });
      const veioCobre1 = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.6, 0.25, 12, 1, false, Math.PI * 1.1, Math.PI * 0.65), matCobreVeio);
      veioCobre1.position.set(-5.0, 0.65, -8.5);
      grpMina.add(veioCobre1);

      const veioCobre2 = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 4.2, 0.22, 12, 1, false, 0, Math.PI * 0.75), matCobreVeio);
      veioCobre2.position.set(-5.0, 2.3, -8.5);
      grpMina.add(veioCobre2);

      // Pepitas brilhantes de cobre nos veios
      [
        { x: -2.0, y: 0.7, z: -6.5 },
        { x: -7.8, y: 2.3, z: -7.0 },
        { x: -3.2, y: 2.35, z: -8.5 }
      ].forEach((p) => {
        const pepita = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), matCobreNugget);
        pepita.position.set(p.x, p.y, p.z);
        grpMina.add(pepita);
      });

      // Array de partículas cintilantes dos geodos e facetas brilhantes dos taludes
      const particulasGeodos = [];
      const facetasTalude = [];

      // Geodos de quartzo ametista com facetas lapidadas poliédricas cristalinas, núcleos violeta brilhantes e refração de luz
      const refracoesGeodos = [];

      function criarGeodoAmetista(gx, gy, gz, rotY) {
        const g = new THREE.Group();
        g.position.set(gx, gy, gz);
        if (rotY) g.rotation.y = rotY;

        // 1. Casca rochosa externa de basalto escuro da jazida
        const cascaExterna = new THREE.Mesh(new THREE.DodecahedronGeometry(0.92, 0), kit.mat('lambert', 0x37474f));
        cascaExterna.castShadow = true;
        g.add(cascaExterna);

        // 2. Camada intermediária de calcedônia / ágata branca acinzentada
        const camadaCalcedonia = new THREE.Mesh(new THREE.DodecahedronGeometry(0.82, 0), kit.mat('lambert', 0xe0e0e0));
        camadaCalcedonia.position.set(0, 0, 0.08);
        g.add(camadaCalcedonia);

        // 3. Facetas lapidadas poliédricas cristalinas de ametista pura (em gradiente do violeta profundo ao lilás translúcido)
        const matAmetistaProfunda = kit.mat('phong', 0x6a1b9a, { shininess: 95, specular: 0xffffff });
        const matAmetistaVioleta  = kit.mat('phong', 0x8e24aa, { shininess: 95, specular: 0xe1bee7 });
        const matAmetistaLilas    = kit.mat('phong', 0xba68c8, { shininess: 95, specular: 0xffffff });
        const matAmetistaClara    = kit.mat('phong', 0xce93d8, { shininess: 95, specular: 0xffffff });
        const matCristalQuartzo   = kit.mat('phong', 0xf3e5f5, { shininess: 100, specular: 0xffffff });

        // Coroa de primas e pirâmides lapidadas dispostas radialmente na cavidade oca
        const cristaisData = [
          // Cones hexagonais lapidados em posições radiais
          { geo: new THREE.ConeGeometry(0.22, 0.62, 6), mat: matAmetistaProfunda, pos: [0.18, 0.12, 0.45], rot: [Math.PI * 0.28, 0.2, 0] },
          { geo: new THREE.ConeGeometry(0.20, 0.58, 6), mat: matAmetistaVioleta,  pos: [-0.18, 0.16, 0.42], rot: [Math.PI * 0.25, -Math.PI * 0.25, 0] },
          { geo: new THREE.ConeGeometry(0.18, 0.52, 6), mat: matAmetistaLilas,    pos: [0.0, -0.18, 0.48], rot: [Math.PI * 0.35, 0, 0] },
          { geo: new THREE.ConeGeometry(0.16, 0.46, 6), mat: matAmetistaClara,    pos: [0.24, -0.12, 0.44], rot: [Math.PI * 0.22, 0.4, -0.2] },
          { geo: new THREE.ConeGeometry(0.15, 0.42, 6), mat: matCristalQuartzo,   pos: [-0.22, -0.14, 0.42], rot: [Math.PI * 0.3, -0.3, 0.1] },

          // Cristais poliédricos lapidados em Icosaedro e Octaedro incrustados
          { geo: new THREE.IcosahedronGeometry(0.16, 0), mat: matAmetistaProfunda, pos: [0.28, 0.05, 0.38], rot: [0.4, 0.8, 0.2] },
          { geo: new THREE.OctahedronGeometry(0.15, 0),  mat: matAmetistaVioleta,  pos: [-0.26, 0.08, 0.38], rot: [0.6, -0.4, 0.5] },
          { geo: new THREE.IcosahedronGeometry(0.14, 0), mat: matAmetistaLilas,    pos: [0.12, 0.26, 0.40], rot: [-0.3, 0.5, 0.7] },
          { geo: new THREE.OctahedronGeometry(0.13, 0),  mat: matAmetistaClara,    pos: [-0.12, 0.24, 0.40], rot: [0.2, -0.7, 0.4] },
          { geo: new THREE.DodecahedronGeometry(0.12, 0),mat: matCristalQuartzo,   pos: [0.0, -0.28, 0.42], rot: [0.5, 0.2, -0.4] },
          { geo: new THREE.OctahedronGeometry(0.11, 0),  mat: matAmetistaVioleta,  pos: [0.20, -0.24, 0.38], rot: [-0.4, 0.6, 0.3] },
          { geo: new THREE.OctahedronGeometry(0.11, 0),  mat: matAmetistaLilas,    pos: [-0.20, -0.22, 0.38], rot: [0.7, -0.3, -0.5] }
        ];

        cristaisData.forEach((cd) => {
          const cMesh = new THREE.Mesh(cd.geo, cd.mat);
          cMesh.position.set(cd.pos[0], cd.pos[1], cd.pos[2]);
          cMesh.rotation.set(cd.rot[0], cd.rot[1], cd.rot[2]);
          cMesh.castShadow = true;
          g.add(cMesh);
        });

        // 4. Núcleo violeta brilhante e incandescente no interior do geodo
        const nucleoVioleta = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.18, 1),
          kit.mat('basic', 0xba68c8)
        );
        nucleoVioleta.position.set(0, 0, 0.35);
        g.add(nucleoVioleta);

        const nucleoCore = new THREE.Mesh(
          new THREE.SphereGeometry(0.10, 8, 8),
          kit.mat('basic', 0xffffff)
        );
        nucleoCore.position.set(0, 0, 0.38);
        g.add(nucleoCore);

        // Halo esférico de luz violeta radiante interno
        const haloGeodo = new THREE.Mesh(
          new THREE.SphereGeometry(0.36, 12, 12),
          kit.mat('basic', 0xba68c8, { transparent: true, opacity: 0.36, depthWrite: false })
        );
        haloGeodo.position.set(0, 0, 0.38);
        g.add(haloGeodo);

        // 5. Refração de luz cristalina: anel cáustico prismático projetado ao redor da cavidade
        const matRefracaoPrismatica = kit.mat('basic', 0xce93d8, {
          transparent: true,
          opacity: 0.32,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const anelRefracao = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.95, 12), matRefracaoPrismatica);
        anelRefracao.position.set(0, 0, 0.42);
        g.add(anelRefracao);
        refracoesGeodos.push(anelRefracao);

        // Feixes e facetas de refração prismática projetadas na rocha vizinha
        [-0.45, 0.45].forEach((rx) => {
          const facetaReflete = new THREE.Mesh(
            new THREE.PlaneGeometry(0.35, 0.55),
            kit.mat('basic', 0xe1bee7, { transparent: true, opacity: 0.28, depthWrite: false })
          );
          facetaReflete.position.set(rx, 0, 0.38);
          facetaReflete.rotation.y = rx > 0 ? -0.4 : 0.4;
          g.add(facetaReflete);
        });

        // Pequenas partículas cintilantes geométricas flutuando com calma no geodo (TEA)
        for (let p = 0; p < 5; p++) {
          const ang = (p / 5) * Math.PI * 2;
          const pMesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.065, 0),
            kit.mat('basic', 0xffffff, { transparent: true, opacity: 0.85 })
          );
          pMesh.position.set(Math.cos(ang) * 0.34, Math.sin(ang) * 0.30, 0.52 + (p % 2) * 0.08);
          pMesh.userData = {
            baseY: pMesh.position.y,
            baseX: pMesh.position.x,
            fase: p * 1.5 + gx * 0.5
          };
          g.add(pMesh);
          particulasGeodos.push(pMesh);
        }

        g.userData = {
          interativo: true,
          pistaMissao: 3,
          nome: '💎 Geodo de quartzo ametista: cavidade rochosa na mina com lindos cristais de cor lilás e roxa que brilham na rocha.',
          som: 'chime',
          halo: haloGeodo,
          nucleo: nucleoVioleta,
          anel: anelRefracao,
          aoClicar: function (obj) {
            if (kit && kit.Audio && typeof kit.Audio.chime === 'function') {
              kit.Audio.chime();
            }
            if (obj.userData.halo) {
              obj.userData.halo.scale.set(1.5, 1.5, 1.5);
              if (obj.userData.anel) obj.userData.anel.scale.set(1.3, 1.3, 1.3);
              setTimeout(() => {
                try {
                  obj.userData.halo.scale.set(1.0, 1.0, 1.0);
                  if (obj.userData.anel) obj.userData.anel.scale.set(1.0, 1.0, 1.0);
                } catch (e) {}
              }, 450);
            }
          }
        };

        return g;
      }

      const geodo1 = criarGeodoAmetista(-2.4, 2.7, -6.5, -0.2);
      grpMina.add(geodo1);

      const geodo2 = criarGeodoAmetista(-7.2, 1.2, -4.8, 0.3);
      grpMina.add(geodo2);

      // Luz mágica violeta serena dos geodos de ametista com pulso harmônico de respiração (TEA)
      const luzGeodo = new THREE.PointLight(0xba68c8, 1.25, 10.0);
      luzGeodo.position.set(-2.4, 3.1, -6.3);
      grpMina.add(luzGeodo);

      const luzGeodo2 = new THREE.PointLight(0xba68c8, 1.15, 9.0);
      luzGeodo2.position.set(-7.2, 1.6, -4.5);
      grpMina.add(luzGeodo2);

      // Poças de luz violeta acolhedora banhando a rocha ao redor dos geodos
      const poolGeodo1Mat = kit.mat('basic', 0xba68c8, { transparent: true, opacity: 0.28, depthWrite: false });
      const poolGeodo1 = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16), poolGeodo1Mat);
      poolGeodo1.rotation.x = -Math.PI / 2;
      poolGeodo1.position.set(-2.4, 1.82, -6.3);
      grpMina.add(poolGeodo1);

      const poolGeodo2Mat = kit.mat('basic', 0xba68c8, { transparent: true, opacity: 0.26, depthWrite: false });
      const poolGeodo2 = new THREE.Mesh(new THREE.CircleGeometry(1.4, 16), poolGeodo2Mat);
      poolGeodo2.rotation.x = -Math.PI / 2;
      poolGeodo2.position.set(-7.2, 0.06, -4.5);
      grpMina.add(poolGeodo2);

      // Facetas brilhantes e cristais cintilantes cravados nos taludes de rocha da mina (TEA-friendly)
      const matFacetaPirita = kit.mat('phong', 0xffd54f, { shininess: 95 });
      const matFacetaQuartzo = kit.mat('phong', 0xe0f7fa, { shininess: 95 });
      const matFacetaAmetista = kit.mat('phong', 0xce93d8, { shininess: 90 });
      const facetasGeoOcta = new THREE.OctahedronGeometry(0.18, 0);
      const facetasGeoDodec = new THREE.DodecahedronGeometry(0.15, 0);

      const posTaludes = [
        { x: -7.5, y: 1.2, z: -6.8, mat: matFacetaPirita, geo: facetasGeoOcta },
        { x: -3.0, y: 1.4, z: -7.2, mat: matFacetaQuartzo, geo: facetasGeoDodec },
        { x: -6.2, y: 2.8, z: -7.8, mat: matFacetaAmetista, geo: facetasGeoOcta },
        { x: -4.0, y: 3.2, z: -8.0, mat: matFacetaPirita, geo: facetasGeoDodec },
        { x: -8.2, y: 1.8, z: -8.2, mat: matFacetaQuartzo, geo: facetasGeoOcta },
        { x: -2.2, y: 2.2, z: -7.5, mat: matFacetaPirita, geo: facetasGeoOcta },
        { x: -5.5, y: 4.6, z: -8.2, mat: matFacetaQuartzo, geo: facetasGeoDodec },
        { x: -3.8, y: 5.0, z: -8.0, mat: matFacetaAmetista, geo: facetasGeoOcta }
      ];

      posTaludes.forEach((ft, idx) => {
        const meshFaceta = new THREE.Mesh(ft.geo, ft.mat);
        meshFaceta.position.set(ft.x, ft.y, ft.z);
        meshFaceta.rotation.set(Math.random(), Math.random(), Math.random());
        meshFaceta.userData = {
          interativo: true,
          nome: '✨ Faceta brilhante de cristal mineral: reflete a luz suavemente nas paredes da mina.',
          som: 'sino',
          fase: idx * 0.8
        };
        grpMina.add(meshFaceta);
        facetasTalude.push(meshFaceta);
      });

      // Rochas da mina com veios minerais interativos (ferro, cobre, cimento/calcário)
      const rochaFerro = kit.criarRochas(-2, 4, 0x455a64);
      rochaFerro.userData = {
        interativo: true,
        pistaMissao: 0,
        nome: '🔩 Minério de ferro: mineral resistente usado em ferramentas, máquinas e na produção de aço.',
        som: 'pop'
      };
      grpMina.add(rochaFerro);

      const rochaCobre = kit.criarRochas(-7, -2, 0xb87333);
      rochaCobre.userData = {
        interativo: true,
        nome: '⚡ Minério de cobre: metal avermelhado excelente condutor de eletricidade, usado em fios e cabos.',
        som: 'pop'
      };
      grpMina.add(rochaCobre);

      const rochaCalcario = kit.criarRochas(4, -8, 0xdcd6cd);
      rochaCalcario.userData = {
        interativo: true,
        nome: '🧱 Calcário e cimento: rocha sedimentar usada como matéria-prima principal para o cimento das obras.',
        som: 'pop'
      };
      grpMina.add(rochaCalcario);

      const rochaGeral = kit.criarRochas(-4, 5.3, 0xa1887f);
      rochaGeral.userData = {
        interativo: true,
        pistaMissao: 4,
        nome: '🪨 Formação rochosa da mina: no solo e subsolo encontramos minerais valiosos formados há milhões de anos.',
        som: 'pop'
      };
      grpMina.add(rochaGeral);

      // Monte de areia extraída na natureza
      const coneAreia = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.0, 12), kit.mat('lambert', 0xd7ccc8));
      coneAreia.position.set(4, 1.0, 6);
      coneAreia.castShadow = true;
      coneAreia.userData = {
        interativo: true,
        nome: '🏖️ Areia da construção: recurso mineral indispensável na fabricação de argamassa e concreto.',
        som: 'pop'
      };
      grpMina.add(coneAreia);

      const sombraAreia = kit.criarSombraDeContato(4, 6, 2.2, 2.2, 0.42);
      sombraAreia.position.y = 0.05;
      grpMina.add(sombraAreia);

      // Monte de minério de ferro
      const coneMin = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.8, 10), kit.mat('lambert', 0x455a64));
      coneMin.position.set(-1, 0.9, 8);
      coneMin.castShadow = true;
      coneMin.userData = {
        interativo: true,
        pistaMissao: 0,
        nome: '⛏️ Minério de ferro bruto: extraído das jazidas para produzir ligas metálicas e aço.',
        som: 'pop'
      };
      grpMina.add(coneMin);

      const sombraFerro = kit.criarSombraDeContato(-1, 8, 2.0, 2.0, 0.42);
      sombraFerro.position.y = 0.05;
      grpMina.add(sombraFerro);

      // --- 2. MINI ESCAVADEIRA MECÂNICA AMARELA COM CONCHA ARTICULADA ---
      const escavadeira = new THREE.Group();
      escavadeira.position.set(-4.5, 0.04, 2.2);
      escavadeira.rotation.y = Math.PI * 0.95;

      const matEsteira = kit.mat('lambert', 0x263238);
      const matRodaEsteira = kit.mat('lambert', 0x455a64);
      [-1.1, 1.1].forEach((lx) => {
        const esteira = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 3.2), matEsteira);
        esteira.position.set(lx, 0.35, 0);
        esteira.castShadow = true;
        esteira.receiveShadow = true;
        escavadeira.add(esteira);

        [-1.1, -0.4, 0.4, 1.1].forEach((wz) => {
          const r = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.58, 8), matRodaEsteira);
          r.rotation.z = Math.PI / 2;
          r.position.set(lx, 0.35, wz);
          escavadeira.add(r);
        });
      });

      const baseEixo = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.8), matEsteira);
      baseEixo.position.set(0, 0.45, 0);
      baseEixo.castShadow = true;
      escavadeira.add(baseEixo);

      const matCabine = kit.mat('lambert', 0xffb300);
      const cabineEsc = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.2), matCabine);
      cabineEsc.position.set(0, 1.35, -0.2);
      cabineEsc.castShadow = true;
      escavadeira.add(cabineEsc);

      const matVidro = kit.mat('phong', 0xe0f7fa, { shininess: 90 });
      const vidroFrente = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.1), matVidro);
      vidroFrente.position.set(0, 1.5, 0.92);
      escavadeira.add(vidroFrente);

      const vidroLado = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 1.2), matVidro);
      vidroLado.position.set(0.92, 1.5, 0);
      escavadeira.add(vidroLado);

      // Iluminação acolhedora da cabine da escavadeira
      const cabineGlowEsc = new THREE.PointLight(0xffe082, 0.65, 3.2);
      cabineGlowEsc.position.set(0, 1.5, -0.2);
      escavadeira.add(cabineGlowEsc);

      const painelEsc = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.25), kit.mat('basic', 0xffd54f));
      painelEsc.position.set(0, 1.1, 0.5);
      escavadeira.add(painelEsc);

      // Faróis de trabalho âmbar da escavadeira mecânica
      const matFarolAmbar = kit.mat('basic', 0xffb300);
      const matHaloTrabalho = kit.mat('basic', 0xffca28, { transparent: true, opacity: 0.32, depthWrite: false });
      const matSuporteTrabalho = kit.mat('lambert', 0x212121);
      [-0.65, 0.65].forEach((wx) => {
        const supW = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.15), matSuporteTrabalho);
        supW.position.set(wx, 2.12, 0.85);
        escavadeira.add(supW);

        const lenteW = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.04), matFarolAmbar);
        lenteW.position.set(wx, 2.12, 0.94);
        escavadeira.add(lenteW);

        // Halo luminoso do farol de trabalho
        const haloW = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), matHaloTrabalho);
        haloW.position.set(wx, 2.12, 0.98);
        escavadeira.add(haloW);
      });

      // Luz âmbar de trabalho iluminando a escavação e a concha
      const luzTrabalhoEsc = new THREE.PointLight(0xffb300, 1.15, 8.5);
      luzTrabalhoEsc.position.set(0, 2.1, 1.8);
      escavadeira.add(luzTrabalhoEsc);

      // Facho cônico suave âmbar projetado em direção à concha
      const fachoEscGeo = new THREE.ConeGeometry(0.95, 3.6, 12, 1, true);
      const fachoEscMat = kit.mat('basic', 0xffb300, {
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const fachoEsc = new THREE.Mesh(fachoEscGeo, fachoEscMat);
      fachoEsc.rotation.x = -Math.PI * 0.38;
      fachoEsc.position.set(0, 1.8, 2.4);
      escavadeira.add(fachoEsc);

      // Piscina de luz âmbar no solo da frente da escavadeira
      const piscinaEscMat = kit.mat('basic', 0xffb300, { transparent: true, opacity: 0.22, depthWrite: false });
      const piscinaEsc = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.2), piscinaEscMat);
      piscinaEsc.rotation.x = -Math.PI / 2;
      piscinaEsc.position.set(0, 0.05, 3.0);
      escavadeira.add(piscinaEsc);

      const contrapeso = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.8, 0.6), kit.mat('lambert', 0x37474f));
      contrapeso.position.set(0, 1.2, -1.25);
      contrapeso.castShadow = true;
      escavadeira.add(contrapeso);

      // Grade do radiador traseira com aletas horizontais de ventilação do motor diesel
      const matGradeRadiadorEsc = kit.mat('lambert', 0x212121);
      const matAletaRadiadorEsc = kit.mat('phong', 0x546e7a, { shininess: 80 });
      const molduraGradeEsc = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 0.08), matGradeRadiadorEsc);
      molduraGradeEsc.position.set(0, 1.2, -1.58);
      escavadeira.add(molduraGradeEsc);

      [-0.18, -0.06, 0.06, 0.18].forEach((ay) => {
        const aleta = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.04, 0.09), matAletaRadiadorEsc);
        aleta.position.set(0, 1.2 + ay, -1.58);
        escavadeira.add(aleta);
      });

      // Espelhos retrovisores com haste e espelho cromado
      const matCromado = kit.mat('phong', 0xffffff, { shininess: 100, specular: 0xffffff });
      [-1.0, 1.0].forEach((mx) => {
        const hasteRetro = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), kit.mat('lambert', 0x212121));
        hasteRetro.position.set(mx, 1.7, 0.8);
        hasteRetro.rotation.z = mx > 0 ? -Math.PI * 0.15 : Math.PI * 0.15;
        escavadeira.add(hasteRetro);

        const espelho = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.12), matCromado);
        espelho.position.set(mx * 1.15, 1.85, 0.8);
        escavadeira.add(espelho);
      });

      const chamineEsc = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), kit.mat('lambert', 0x212121));
      chamineEsc.position.set(-0.6, 2.25, -0.9);
      escavadeira.add(chamineEsc);

      // Braço articulado e concha mecânica móvel (subgrupo móvel para levantar/abaixar concha)
      const bracoMovelEscavadeira = new THREE.Group();
      bracoMovelEscavadeira.position.set(0.4, 1.1, 0.4);

      const braco1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.4, 0.38), kit.mat('lambert', 0xf57c00));
      braco1.position.set(0, 1.0, 0.7);
      braco1.rotation.x = Math.PI * 0.22;
      braco1.castShadow = true;
      bracoMovelEscavadeira.add(braco1);

      // Pistão hidráulico cromado principal da lança (Boom Cylinder)
      const camisaPistao1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8), kit.mat('lambert', 0xffb300));
      camisaPistao1.position.set(0, 0.55, 0.3);
      camisaPistao1.rotation.x = Math.PI * 0.38;
      bracoMovelEscavadeira.add(camisaPistao1);

      const hastePistao1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.95, 8), matCromado);
      hastePistao1.position.set(0, 0.95, 0.6);
      hastePistao1.rotation.x = Math.PI * 0.38;
      bracoMovelEscavadeira.add(hastePistao1);

      const braco2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.9, 0.32), kit.mat('lambert', 0xffb300));
      braco2.position.set(0, 1.5, 2.0);
      braco2.rotation.x = -Math.PI * 0.32;
      braco2.castShadow = true;
      bracoMovelEscavadeira.add(braco2);

      // Pistão hidráulico cromado do braço secundário (Arm Cylinder)
      const camisaPistao2 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.85, 8), kit.mat('lambert', 0xffb300));
      camisaPistao2.position.set(0, 1.6, 1.3);
      camisaPistao2.rotation.x = -Math.PI * 0.22;
      bracoMovelEscavadeira.add(camisaPistao2);

      const hastePistao2 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.75, 8), matCromado);
      hastePistao2.position.set(0, 1.75, 1.7);
      hastePistao2.rotation.x = -Math.PI * 0.22;
      bracoMovelEscavadeira.add(hastePistao2);

      // Concha mecânica reforçada com dentes de escavação
      const concha = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.75), kit.mat('lambert', 0x37474f));
      concha.position.set(0, 0.45, 2.85);
      concha.rotation.x = -Math.PI * 0.2;
      concha.castShadow = true;
      bracoMovelEscavadeira.add(concha);

      // Dentes da concha de escavação
      [-0.3, -0.1, 0.1, 0.3].forEach((dx) => {
        const dente = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 4), kit.mat('lambert', 0x212121));
        dente.position.set(dx, 0.15, 3.25);
        dente.rotation.x = -Math.PI * 0.3;
        bracoMovelEscavadeira.add(dente);
      });

      // Minério na concha da escavadeira
      const pedrasNaConcha = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), kit.mat('lambert', 0x8d3b2a));
      pedrasNaConcha.position.set(0, 0.5, 2.85);
      bracoMovelEscavadeira.add(pedrasNaConcha);

      // Pistão hidráulico articulador da concha em aço cromado com camisa amarela
      const camisaPistaoConcha = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.75, 8), kit.mat('lambert', 0xffb300));
      camisaPistaoConcha.position.set(0, 0.85, 2.1);
      camisaPistaoConcha.rotation.x = -Math.PI * 0.15;
      bracoMovelEscavadeira.add(camisaPistaoConcha);

      const cilHid = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.7, 8), matCromado);
      cilHid.position.set(0, 0.75, 2.45);
      cilHid.rotation.x = -Math.PI * 0.15;
      bracoMovelEscavadeira.add(cilHid);

      escavadeira.add(bracoMovelEscavadeira);

      escavadeira.userData = {
        interativo: true,
        pistaMissao: 1,
        nome: '🚜 Mini escavadeira mecânica: equipada com esteiras e concha dentada para retirar rochas e minérios da terra.',
        som: 'motor',
        aoClicar: function (alvo) {
          if (kit && kit.Audio) {
            if (typeof kit.Audio.motor === 'function') kit.Audio.motor();
            setTimeout(() => {
              try {
                if (typeof kit.Audio.buzina === 'function') kit.Audio.buzina();
              } catch (e) {}
            }, 300);
          }
          alvo.userData.animAte = performance.now() * 0.001 + 2.0;
        }
      };
      grpMina.add(escavadeira);

      const sombraEscavadeira = kit.criarSombraDeContato(-4.5, 2.2, 2.4, 2.8, 0.48);
      sombraEscavadeira.position.y = 0.05;
      grpMina.add(sombraEscavadeira);

      // --- 3. SUPER CAMINHÃO DE MINERAÇÃO FORA-DE-ESTRADA COM RODAS GIGANTES ---
      const caminhaoMina = new THREE.Group();
      caminhaoMina.position.set(3.2, 0.04, 3.5);
      caminhaoMina.rotation.y = Math.PI * 0.12;

      // Chassi pesado de aço
      const chassiMina = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.7, 5.2), kit.mat('lambert', 0x263238));
      chassiMina.position.y = 1.1;
      chassiMina.castShadow = true;
      caminhaoMina.add(chassiMina);

      // 6 Rodas gigantes e robustas fora-de-estrada com sulcos profundos de tração
      const rodaGeoGigante = new THREE.CylinderGeometry(0.85, 0.85, 0.55, 16);
      const aroGeoGigante = new THREE.CylinderGeometry(0.45, 0.45, 0.58, 14);
      const matPneuGigante = kit.mat('lambert', 0x1f2421);
      const matAroAmarelo = kit.mat('lambert', 0xffb300);
      const matCravoPneu = kit.mat('lambert', 0x141815);
      const matParafusoRoda = kit.mat('phong', 0xffffff, { shininess: 100, specular: 0xffffff });

      [
        [-1.65, 1.6], [1.65, 1.6],     // Dianteiras
        [-1.75, -1.5], [1.75, -1.5],   // Traseiras externas
        [-1.15, -1.5], [1.15, -1.5]    // Traseiras internas (rodado duplo)
      ].forEach(([wx, wz]) => {
        const pneu = new THREE.Mesh(rodaGeoGigante, matPneuGigante);
        pneu.rotation.z = Math.PI / 2;
        pneu.position.set(wx, 0.85, wz);
        pneu.castShadow = true;
        caminhaoMina.add(pneu);

        const aro = new THREE.Mesh(aroGeoGigante, matAroAmarelo);
        aro.rotation.z = Math.PI / 2;
        aro.position.set(wx, 0.85, wz);
        caminhaoMina.add(aro);

        // Sulcos profundos de tração na banda de rodagem (lugs agressivos fora-de-estrada)
        for (let s = 0; s < 12; s++) {
          const ang = (s / 12) * Math.PI * 2;
          const py = 0.85 + Math.sin(ang) * 0.86;
          const pz = wz + Math.cos(ang) * 0.86;

          const cravo = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.14), matCravoPneu);
          cravo.position.set(wx, py, pz);
          cravo.rotation.x = -ang;
          caminhaoMina.add(cravo);
        }

        // Anel de parafusos/porcas cromadas de fixação no aro
        for (let f = 0; f < 6; f++) {
          const fang = (f / 6) * Math.PI * 2;
          const pfy = 0.85 + Math.sin(fang) * 0.28;
          const pfz = wz + Math.cos(fang) * 0.28;
          const paraf = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), matParafusoRoda);
          paraf.rotation.z = Math.PI / 2;
          paraf.position.set(wx + (wx > 0 ? 0.29 : -0.29), pfy, pfz);
          caminhaoMina.add(paraf);
        }
      });

      // Cabine do operador elevada à esquerda com ampla visibilidade
      const cabineCamMina = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.4, 1.6), kit.mat('lambert', 0xfbc02d));
      cabineCamMina.position.set(-0.75, 2.15, 1.3);
      cabineCamMina.castShadow = true;
      caminhaoMina.add(cabineCamMina);

      const vidroCamMina = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.1), matVidro);
      vidroCamMina.position.set(-0.75, 2.3, 2.12);
      caminhaoMina.add(vidroCamMina);

      // Iluminação acolhedora da cabine do caminhão gigante
      const cabineGlowCam = new THREE.PointLight(0xffe082, 0.7, 3.2);
      cabineGlowCam.position.set(-0.75, 2.3, 1.3);
      caminhaoMina.add(cabineGlowCam);

      const painelCam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.22), kit.mat('basic', 0xffd54f));
      painelCam.position.set(-0.75, 1.85, 1.7);
      caminhaoMina.add(painelCam);

      // Luzes de trabalho âmbar e refletores no teto da cabine do caminhão
      const matRefletorAmbar = kit.mat('basic', 0xffa000);
      [-1.25, -0.75, -0.25].forEach((rx) => {
        const refMina = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.15), kit.mat('lambert', 0x263238));
        refMina.position.set(rx, 2.92, 2.05);
        caminhaoMina.add(refMina);

        const lenteMina = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.04), matRefletorAmbar);
        lenteMina.position.set(rx, 2.92, 2.14);
        caminhaoMina.add(lenteMina);
      });

      // Luz de trabalho âmbar iluminando o piso e frente do caminhão
      const luzTrabalhoCam = new THREE.PointLight(0xffa726, 0.9, 7.5);
      luzTrabalhoCam.position.set(-0.75, 2.8, 3.2);
      caminhaoMina.add(luzTrabalhoCam);

      // Facho de luz volumétrico cônico suave à frente do caminhão
      const fachoCamGeo = new THREE.ConeGeometry(1.6, 5.0, 12, 1, true);
      const fachoCamMat = kit.mat('basic', 0xffb74d, {
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const fachoCam = new THREE.Mesh(fachoCamGeo, fachoCamMat);
      fachoCam.rotation.x = -Math.PI * 0.35;
      fachoCam.position.set(-0.75, 2.2, 4.4);
      caminhaoMina.add(fachoCam);

      // Escadaria frontal e corrimão de acesso
      const escadaFrontal = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.3, 0.1), kit.mat('lambert', 0xffd54f));
      escadaFrontal.position.set(0.6, 1.3, 2.5);
      escadaFrontal.rotation.x = -Math.PI * 0.15;
      caminhaoMina.add(escadaFrontal);

      // Grade frontal pesada do radiador com malha de aletas e detalhes industriais
      const gradeFrontalMoldura = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.25, 0.25), kit.mat('lambert', 0x212121));
      gradeFrontalMoldura.position.set(0, 1.45, 2.65);
      caminhaoMina.add(gradeFrontalMoldura);

      // Aletas horizontais cromadas/aço escuro da grade do radiador
      const matAletaGrade = kit.mat('phong', 0x78909c, { shininess: 85, specular: 0xb0bec5 });
      [-0.4, -0.2, 0, 0.2, 0.4].forEach((gy) => {
        const aletaG = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.05, 0.08), matAletaGrade);
        aletaG.position.set(0, 1.45 + gy, 2.78);
        caminhaoMina.add(aletaG);
      });

      // Emblema central de aço cromado no radiador
      const emblemaRadiador = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.1), matParafusoRoda);
      emblemaRadiador.position.set(0, 1.45, 2.82);
      caminhaoMina.add(emblemaRadiador);

      // Parachoque pesado frontal de aço fundido
      const parachoquePesado = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 0.4), kit.mat('lambert', 0x263238));
      parachoquePesado.position.set(0, 0.8, 2.75);
      caminhaoMina.add(parachoquePesado);

      [-0.8, 0.8].forEach((fx) => {
        const farol = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 10), kit.mat('basic', 0xfff9c4));
        farol.rotation.x = Math.PI / 2;
        farol.position.set(fx, 1.45, 2.82);
        caminhaoMina.add(farol);

        const molduraFarol = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 10), matParafusoRoda);
        molduraFarol.rotation.x = Math.PI / 2;
        molduraFarol.position.set(fx, 1.45, 2.8);
        caminhaoMina.add(molduraFarol);
      });

      // Caçamba basculante amarela gigante com extensão sobre a cabine
      const caçambaBase = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.4, 4.4), kit.mat('lambert', 0xfbc02d));
      caçambaBase.position.set(0, 2.3, -0.6);
      caçambaBase.castShadow = true;
      caminhaoMina.add(caçambaBase);

      const caçambaAba = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 1.8), kit.mat('lambert', 0xfbc02d));
      caçambaAba.position.set(0, 3.1, 1.2);
      caçambaAba.rotation.x = -Math.PI * 0.12;
      caminhaoMina.add(caçambaAba);

      // Pistões hidráulicos telescópicos cromados sob a caçamba basculante
      [-0.85, 0.85].forEach((px) => {
        // Camisa amarela inferior ancorada no chassi
        const camisaPistaoCam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8), kit.mat('lambert', 0xfbc02d));
        camisaPistaoCam.position.set(px, 1.7, -0.6);
        caminhaoMina.add(camisaPistaoCam);

        // Haste telescópica cromada espelhada sustentando a caçamba
        const hastePistaoCam = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.85, 8), matParafusoRoda);
        hastePistaoCam.position.set(px, 2.15, -0.6);
        caminhaoMina.add(hastePistaoCam);
      });

      // Carga pesada de minério de ferro hematita e rochas na caçamba
      const cargaMin1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 0), kit.mat('lambert', 0x37474f));
      cargaMin1.position.set(-0.4, 3.2, -0.7);
      caminhaoMina.add(cargaMin1);

      const cargaMin2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), kit.mat('lambert', 0x8d3b2a));
      cargaMin2.position.set(0.5, 3.15, -0.2);
      caminhaoMina.add(cargaMin2);

      const cargaMin3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), kit.mat('lambert', 0x455a64));
      cargaMin3.position.set(0.1, 3.1, -1.3);
      caminhaoMina.add(cargaMin3);

      caminhaoMina.userData = {
        interativo: true,
        pistaMissao: 2,
        nome: '🚛 Caminhão de mina fora-de-estrada: gigante com pneus enormes que transporta toneladas de minério de ferro.',
        som: 'buzina',
        aoClicar: function (alvo) {
          if (kit && kit.Audio && typeof kit.Audio.buzina === 'function') {
            kit.Audio.buzina();
          }
          alvo.userData.vibrarAte = performance.now() * 0.001 + 1.6;
        }
      };
      grpMina.add(caminhaoMina);

      const sombraCamMina = kit.criarSombraDeContato(3.2, 3.5, 3.2, 5.0, 0.52);
      sombraCamMina.position.y = 0.05;
      grpMina.add(sombraCamMina);

      // --- 4. CORREIA TRANSPORTADORA COM CARGA DE MINÉRIOS BRILHANTES ---
      const correiaGrp = new THREE.Group();
      correiaGrp.position.set(-1.2, 0.04, -3.2);
      correiaGrp.rotation.y = Math.PI * 0.12;

      // Estrutura inclinada da esteira (treliça amarela industrial)
      const vigaCorreiaGeo = new THREE.BoxGeometry(1.0, 0.25, 8.5);
      const matCorreiaViga = kit.mat('lambert', 0xffb300);
      const vigaCorreia = new THREE.Mesh(vigaCorreiaGeo, matCorreiaViga);
      vigaCorreia.position.set(0, 2.7, 0);
      vigaCorreia.rotation.x = Math.PI * 0.18;
      vigaCorreia.castShadow = true;
      correiaGrp.add(vigaCorreia);

      // Pés de sustentação da correia (treliças em A)
      const matSuporte = kit.mat('lambert', 0x455a64);
      [
        { z: -2.8, h: 4.0 },
        { z: 0.2, h: 2.7 },
        { z: 2.8, h: 1.5 }
      ].forEach((p) => {
        const pe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, p.h, 6), matSuporte);
        pe1.position.set(-0.45, p.h * 0.5, p.z);
        pe1.castShadow = true;
        correiaGrp.add(pe1);

        const pe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, p.h, 6), matSuporte);
        pe2.position.set(0.45, p.h * 0.5, p.z);
        pe2.castShadow = true;
        correiaGrp.add(pe2);
      });

      // Lona de borracha contínua da esteira transportadora com bordas elevadas de contenção vulcanizada
      const matBorrachaEsteira = kit.mat('lambert', 0x1f2421);
      const matBorrachaChevron = kit.mat('lambert', 0x111413);
      const matAcoRoletes = kit.mat('phong', 0xb0bec5, { shininess: 95, specular: 0xffffff });

      const lonaEsteira = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.08, 8.4), matBorrachaEsteira);
      lonaEsteira.position.set(0, 2.84, 0);
      lonaEsteira.rotation.x = Math.PI * 0.18;
      correiaGrp.add(lonaEsteira);

      // Bordas laterais de borracha vulcanizada (guias de contenção anti-queda de minério)
      [-0.42, 0.42].forEach((bx) => {
        const bordaGuia = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 8.4), matBorrachaEsteira);
        bordaGuia.position.set(bx, 2.88, 0);
        bordaGuia.rotation.x = Math.PI * 0.18;
        correiaGrp.add(bordaGuia);
      });

      // Nervuras transversais em chevron de borracha texturizada ao longo da esteira
      for (let c = -3.8; c <= 3.8; c += 0.48) {
        const progY = 2.86 - c * Math.sin(Math.PI * 0.18);
        const progZ = c * Math.cos(Math.PI * 0.18);

        const chevronEsq = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.06), matBorrachaChevron);
        chevronEsq.position.set(-0.16, progY, progZ);
        chevronEsq.rotation.x = Math.PI * 0.18;
        chevronEsq.rotation.y = Math.PI * 0.12;
        correiaGrp.add(chevronEsq);

        const chevronDir = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.06), matBorrachaChevron);
        chevronDir.position.set(0.16, progY, progZ);
        chevronDir.rotation.x = Math.PI * 0.18;
        chevronDir.rotation.y = -Math.PI * 0.12;
        correiaGrp.add(chevronDir);
      }

      // Roletes cilíndricos de aço polido sustentando a lona da esteira (Idler Rollers)
      [-3.2, -2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4, 3.2].forEach((rz) => {
        const rY = 2.76 - rz * Math.sin(Math.PI * 0.18);
        const rZ = rz * Math.cos(Math.PI * 0.18);

        // Rolete central horizontal de aço polido
        const roleteCentral = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.52, 12), matAcoRoletes);
        roleteCentral.rotation.z = Math.PI / 2;
        roleteCentral.position.set(0, rY, rZ);
        roleteCentral.rotation.x = Math.PI * 0.18;
        correiaGrp.add(roleteCentral);

        // Roletes laterais inclinados em berço (troughing idlers)
        [-0.32, 0.32].forEach((rx) => {
          const roleteLat = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.28, 10), matAcoRoletes);
          roleteLat.rotation.z = rx > 0 ? Math.PI / 2 + 0.35 : Math.PI / 2 - 0.35;
          roleteLat.position.set(rx, rY + 0.04, rZ);
          roleteLat.rotation.x = Math.PI * 0.18;
          correiaGrp.add(roleteLat);
        });
      });

      // Tambores de acionamento e retorno nas duas extremidades em aço maciço
      const tamborSuperior = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 14), matAcoRoletes);
      tamborSuperior.rotation.z = Math.PI / 2;
      tamborSuperior.position.set(0, 3.98, -3.45);
      tamborSuperior.rotation.x = Math.PI * 0.18;
      correiaGrp.add(tamborSuperior);

      const tamborInferior = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 14), matAcoRoletes);
      tamborInferior.rotation.z = Math.PI / 2;
      tamborInferior.position.set(0, 1.48, 3.45);
      tamborInferior.rotation.x = Math.PI * 0.18;
      correiaGrp.add(tamborInferior);

      // Funil coletor / silo de alimentação no topo da bancada
      const funilSilo = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.45, 1.4, 6), kit.mat('lambert', 0x546e7a));
      funilSilo.position.set(0, 4.4, -3.8);
      correiaGrp.add(funilSilo);

      // Chunks de minérios e pedregulhos de ferro brilhantes descendo a esteira (animáveis)
      const pedrasEsteira = [];
      const matMinEsteira = [
        kit.mat('phong', 0x1f242b, { shininess: 95, specular: 0xb0bec5 }), // ferro hematita metálico reluzente
        kit.mat('phong', 0x8d3b2a, { shininess: 80, specular: 0xd7ccc8 }), // hematita ocre
        kit.mat('phong', 0xb87333, { shininess: 90, specular: 0xffd54f }), // cobre nativo
        kit.mat('phong', 0x2b303a, { shininess: 95, specular: 0xffffff }), // magnetita especular
        kit.mat('phong', 0xffd54f, { shininess: 95, specular: 0xffffff }), // pirita brilhante
        kit.mat('phong', 0xce93d8, { shininess: 90, specular: 0xffffff })  // quartzo ametista
      ];

      for (let i = 0; i < 8; i++) {
        const pChunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), matMinEsteira[i % matMinEsteira.length]);
        pChunk.userData = { tOffset: i / 8 };
        correiaGrp.add(pChunk);
        pedrasEsteira.push(pChunk);
      }

      // Pilha de pedregulhos de ferro brilhantes acumulados no pé de descarga da esteira
      const matFerroBrilhantePilha = kit.mat('phong', 0x263238, { shininess: 95, specular: 0xb0bec5 });
      const matPiritaPilha = kit.mat('phong', 0xffd54f, { shininess: 90, specular: 0xffffff });
      [
        { x: -0.3, y: 0.25, z: 3.8, s: 0.24, mat: matFerroBrilhantePilha },
        { x: 0.25, y: 0.22, z: 3.9, s: 0.22, mat: matMinEsteira[1] },
        { x: -0.1, y: 0.38, z: 4.1, s: 0.26, mat: matFerroBrilhantePilha },
        { x: 0.2,  y: 0.30, z: 4.2, s: 0.20, mat: matPiritaPilha },
        { x: -0.35, y: 0.18, z: 4.3, s: 0.22, mat: matMinEsteira[0] }
      ].forEach((pp) => {
        const pedraPilha = new THREE.Mesh(new THREE.DodecahedronGeometry(pp.s, 0), pp.mat);
        pedraPilha.position.set(pp.x, pp.y, pp.z);
        pedraPilha.rotation.set(Math.random(), Math.random(), Math.random());
        pedraPilha.castShadow = true;
        correiaGrp.add(pedraPilha);
      });

      correiaGrp.userData = {
        interativo: true,
        pistaMissao: 0,
        nome: '⚙️ Correia transportadora contínua: esteira mecânica que leva minérios das bancadas da mina com agilidade.',
        som: 'pop',
        aoClicar: function (alvo) {
          if (kit && kit.Audio && typeof kit.Audio.pop === 'function') {
            kit.Audio.pop();
          }
          alvo.userData.turboAte = performance.now() * 0.001 + 3.0;
        }
      };
      grpMina.add(correiaGrp);

      // Sombra de contato suave e alinhada sob a correia transportadora
      const sombraCorreia = kit.criarSombraContato(-1.2, -3.2, 1.4, 4.2, 0.44);
      sombraCorreia.rotation.z = Math.PI * 0.12;
      sombraCorreia.position.y = 0.05;
      grpMina.add(sombraCorreia);

      // --- 4.1 LANTERNAS DE SÓDIO INDUSTRIAIS EM POSTES DE MADEIRA RÚSTICA (MINA) ---
      function criarLanternaSodioMina(px, py, pz, rotY, distLuz) {
        const grpL = new THREE.Group();
        grpL.position.set(px, py, pz);
        grpL.rotation.y = rotY || 0;
        grpL.userData = {
          interativo: true,
          nome: '💡 Lanterna industrial da mina: iluminação âmbar que revela os estratos de hematita e veios de ferro na rocha.',
          som: 'pop'
        };

        // Poste de madeira rústica de mina (timber post)
        const posteMad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 0.2), kit.mat('lambert', 0x4e342e));
        posteMad.position.y = 1.7;
        posteMad.castShadow = true;
        grpL.add(posteMad);

        // Cruzeta / braço de madeira escura com tirante de ferro
        const bracoMad = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.14), kit.mat('lambert', 0x3e2723));
        bracoMad.position.set(0.32, 3.15, 0);
        grpL.add(bracoMad);

        const tiranteFerro = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), kit.mat('lambert', 0x263238));
        tiranteFerro.position.set(0.2, 3.25, 0);
        tiranteFerro.rotation.z = Math.PI / 4;
        grpL.add(tiranteFerro);

        // Cúpula e carcaça industrial da luminária de sódio
        const cupulaSodio = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.22, 6), kit.mat('lambert', 0x263238));
        cupulaSodio.position.set(0.62, 3.18, 0);
        grpL.add(cupulaSodio);

        const vidroSodio = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.16, 0.38, 6),
          kit.mat('phong', 0xffb74d, { opacity: 0.9, transparent: true, shininess: 85 })
        );
        vidroSodio.position.set(0.62, 2.96, 0);
        grpL.add(vidroSodio);

        // Lâmpada de vapor de sódio industrial incandescente âmbar-dourada (0xffb300)
        const bulboSodio = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), kit.mat('basic', 0xffb300));
        bulboSodio.position.set(0.62, 2.96, 0);
        grpL.add(bulboSodio);

        // Halo suave luminoso ao redor da lâmpada de vapor de sódio
        const haloSodioMat = kit.mat('basic', 0xffca28, { transparent: true, opacity: 0.32, depthWrite: false });
        const haloSodio = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), haloSodioMat);
        haloSodio.position.set(0.62, 2.96, 0);
        grpL.add(haloSodio);

        // Luz quente de vapor de sódio industrial banhando os estratos e patamares rochosos
        const luzSodio = new THREE.PointLight(0xffb300, 1.2, distLuz || 10.5);
        luzSodio.position.set(0.62, 2.96, 0);
        grpL.add(luzSodio);

        // Cone volumétrico translúcido suave de luz âmbar
        const coneLuzGeo = new THREE.ConeGeometry(1.45, 2.9, 12, 1, true);
        const coneLuzMat = kit.mat('basic', 0xffb300, {
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const coneLuz = new THREE.Mesh(coneLuzGeo, coneLuzMat);
        coneLuz.position.set(0.62, 1.5, 0);
        coneLuz.rotation.x = Math.PI;
        grpL.add(coneLuz);

        // Poça de luz dourada projetada nos patamares rochosos
        const poolChao = new THREE.Mesh(
          new THREE.CircleGeometry(1.65, 16),
          kit.mat('basic', 0xffb300, { transparent: true, opacity: 0.25, depthWrite: false })
        );
        poolChao.rotation.x = -Math.PI / 2;
        poolChao.position.set(0.62, 0.05, 0);
        grpL.add(poolChao);

        return grpL;
      }

      // Lanternas industriais de sódio estrategicamente posicionadas iluminando as bancadas de hematita
      grpMina.add(criarLanternaSodioMina(0.5, 0, 0.5, 0, 9.5));
      grpMina.add(criarLanternaSodioMina(-1.5, 0, -4.5, Math.PI * 0.45, 9.0));
      grpMina.add(criarLanternaSodioMina(-8.0, 0, -0.5, -Math.PI * 0.25, 8.5));

      // Ponto de brilho mineral no afloramento
      const luzGlintMina = new THREE.PointLight(0xffd54f, 0.5, 5);
      luzGlintMina.position.set(-2, 1.8, 4);
      grpMina.add(luzGlintMina);

      // Placa e cercas de proteção da mina
      grpMina.add(kit.criarPlaca(0, 10, 'MINA', 0x5d4037));
      grpMina.add(kit.criarCerca(-10, 0, 32, true, 0x795548));
      grpMina.add(kit.criarCerca(0, -15.5, 20, false, 0x795548));

      scene.add(grpMina);

      // ==================== LADO DIREITO: CIDADE E CONSTRUÇÃO ====================
      const grpCidade = new THREE.Group();
      grpCidade.position.set(15, 0, 0);

      // Calçada urbana de concreto
      const pisoCidade = kit.criarChao(22, 34, 0xb0bec5);
      pisoCidade.position.y = 0.04;
      grpCidade.add(pisoCidade);

      // --- 5. ARRANHA-CÉU EM CONSTRUÇÃO COM GRUA TORRE AMARELA ---
      const predioConstrucao = new THREE.Group();
      predioConstrucao.position.set(5, 0, -6);

      // Base e andares inferiores com concreto e fachada moderna
      const basePredio = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.0, 4.8), kit.mat('lambert', 0x607d8b));
      basePredio.position.y = 2.0;
      basePredio.castShadow = true;
      predioConstrucao.add(basePredio);

      // Andares intermediários com lajes de concreto e pilares abertos
      const matConcretoLajes = kit.mat('lambert', 0x90a4ae);
      const matPilar = kit.mat('lambert', 0x546e7a);
      [4.2, 6.2, 8.2, 10.2].forEach((ly) => {
        const laje = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.3, 4.9), matConcretoLajes);
        laje.position.y = ly;
        laje.castShadow = true;
        predioConstrucao.add(laje);

        // Pilares nos quatro cantos
        [-2.1, 2.1].forEach((px) => {
          [-2.1, 2.1].forEach((pz) => {
            const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.7, 0.35), matPilar);
            pilar.position.set(px, ly - 0.95, pz);
            predioConstrucao.add(pilar);
          });
        });
      });

      // Telas verdes de proteção da construção
      const matTelaProtecao = kit.mat('lambert', 0x2e7d32, { opacity: 0.85, transparent: true });
      const telaProt = new THREE.Mesh(new THREE.BoxGeometry(4.85, 1.6, 0.05), matTelaProtecao);
      telaProt.position.set(0, 5.2, 2.42);
      predioConstrucao.add(telaProt);

      // Vergalhões de aço expostos no topo da construção
      const matRebar = kit.mat('lambert', 0xd84315);
      [-1.8, -0.6, 0.6, 1.8].forEach((rx) => {
        [-1.8, 1.8].forEach((rz) => {
          const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4), matRebar);
          rebar.position.set(rx, 10.6, rz);
          predioConstrucao.add(rebar);
        });
      });

      // Grua Torre Amarela de Construção Civil
      const gruaTorre = new THREE.Group();
      gruaTorre.position.set(0, 10.3, 0);

      // Mastro vertical treliçado da grua
      const mastroGrua = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.5, 0.7), kit.mat('lambert', 0xffb300));
      mastroGrua.position.y = 2.75;
      mastroGrua.castShadow = true;
      gruaTorre.add(mastroGrua);

      // Conjunto giratório (lança, contra-lança, cabine do operador e gancho)
      const lancaGiratoria = new THREE.Group();
      lancaGiratoria.position.set(0, 5.5, 0);

      // Cabine envidraçada do operador da grua
      const cabineGrua = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.75), kit.mat('lambert', 0xffb300));
      cabineGrua.position.set(0.5, 0.45, 0.4);
      lancaGiratoria.add(cabineGrua);

      const vidroGrua = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.1), matVidro);
      vidroGrua.position.set(0.5, 0.55, 0.8);
      lancaGiratoria.add(vidroGrua);

      // Lança horizontal de trabalho (estende-se para a frente da obra)
      const lancaViga = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 7.5), kit.mat('lambert', 0xffb300));
      lancaViga.position.set(0, 0.7, 2.2);
      lancaViga.castShadow = true;
      lancaGiratoria.add(lancaViga);

      // Sinalizador de obstáculo aéreo vermelho (safety beacon) na ponta da lança da grua
      const baseBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 8), kit.mat('lambert', 0x263238));
      baseBeacon.position.set(0, 0.96, 5.95);
      lancaGiratoria.add(baseBeacon);

      const domoBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 8), kit.mat('basic', 0xff1744));
      domoBeacon.position.set(0, 1.08, 5.95);
      lancaGiratoria.add(domoBeacon);

      const beaconHalo = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        kit.mat('basic', 0xff1744, { transparent: true, opacity: 0.35, depthWrite: false })
      );
      beaconHalo.position.set(0, 1.08, 5.95);
      lancaGiratoria.add(beaconHalo);

      const beaconLuz = new THREE.PointLight(0xff1744, 1.15, 7.0);
      beaconLuz.position.set(0, 1.08, 5.95);
      lancaGiratoria.add(beaconLuz);

      // Contra-lança traseira com contrapesos de concreto
      const contraLanca = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 3.2), kit.mat('lambert', 0xffb300));
      contraLanca.position.set(0, 0.7, -2.2);
      lancaGiratoria.add(contraLanca);

      const contrapesosGrua = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 1.2), kit.mat('lambert', 0x78909c));
      contrapesosGrua.position.set(0, 0.75, -3.0);
      lancaGiratoria.add(contrapesosGrua);

      // Torrete ápice com cabos de aço tensores
      const apiceTorre = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.4, 4), kit.mat('lambert', 0xffb300));
      apiceTorre.position.set(0, 1.6, 0);
      lancaGiratoria.add(apiceTorre);

      // Cabo de aço e gancho erguendo viga I de aço
      const caboAco = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.2, 4), kit.mat('basic', 0x37474f));
      caboAco.position.set(0, -0.9, 4.2);
      lancaGiratoria.add(caboAco);

      const gancho = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 4, 8, Math.PI * 1.5), kit.mat('lambert', 0xffb300));
      gancho.position.set(0, -2.55, 4.2);
      gancho.rotation.z = Math.PI / 2;
      lancaGiratoria.add(gancho);

      // Viga I de aço suspensa pelo guindaste
      function criarVigaI(comprimento, cor) {
        const v = new THREE.Group();
        const matViga = kit.mat('lambert', cor || 0xd84315);
        // Alma central
        const alma = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, comprimento), matViga);
        alma.castShadow = true;
        v.add(alma);
        // Flange superior e inferior
        [-0.22, 0.22].forEach((fy) => {
          const fl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, comprimento), matViga);
          fl.position.y = fy;
          fl.castShadow = true;
          v.add(fl);
        });
        return v;
      }

      // Função sintetizadora de ressonância metálica suave de vigas de aço
      function tocarRessonanciaMetalica() {
        if (!kit || !kit.Audio) return;
        kit.Audio.init();
        const ctx = kit.Audio.ctx;
        if (!ctx) {
          if (typeof kit.Audio.sino === 'function') kit.Audio.sino();
          return;
        }
        const t = ctx.currentTime;
        // Ressonância metálica suave e cristalina de vigas de aço
        [587.33, 880, 1480, 2349.3].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, t);
          const vol = [0.08, 0.05, 0.03, 0.018][idx];
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.52 + idx * 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.65 + idx * 0.09);
        });
      }

      const vigaSuspensa = criarVigaI(2.8, 0xd84315);
      vigaSuspensa.position.set(0, -2.85, 4.2);
      lancaGiratoria.add(vigaSuspensa);

      gruaTorre.add(lancaGiratoria);
      predioConstrucao.add(gruaTorre);

      predioConstrucao.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '🏗️ Edifício em construção: construído com aço resistente, concreto e vigas, sustentado pela grua torre amarela.',
        som: 'sino',
        aoClicar: function () {
          tocarRessonanciaMetalica();
        }
      };
      grpCidade.add(predioConstrucao);

      const sombraConstrucao = kit.criarSombraDeContato(5, -6, 3.4, 3.4, 0.52);
      sombraConstrucao.position.y = 0.05;
      grpCidade.add(sombraConstrucao);

      // --- 6. PILHA DE VIGAS I DE AÇO NO CANTEIRO DE OBRAS ---
      const pilhaVigas = new THREE.Group();
      pilhaVigas.position.set(1.6, 0.1, -1.5);
      pilhaVigas.rotation.y = Math.PI * 0.1;

      // Caibros de madeira de apoio
      [-0.9, 0.9].forEach((cz) => {
        const caibro = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.15), kit.mat('lambert', 0x5d4037));
        caibro.position.set(0, 0.06, cz);
        pilhaVigas.add(caibro);
      });

      // Vigas empilhadas
      [-0.45, 0.45].forEach((vx) => {
        const vBaixo = criarVigaI(2.4, 0xd84315);
        vBaixo.position.set(vx, 0.35, 0);
        pilhaVigas.add(vBaixo);
      });
      const vCima = criarVigaI(2.4, 0x455a64);
      vCima.position.set(0, 0.85, 0);
      pilhaVigas.add(vCima);

      pilhaVigas.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '🔩 Vigas I de aço estrutural: produzidas com minério de ferro para dar sustentação aos prédios modernos.',
        som: 'sino',
        aoClicar: function (alvo) {
          tocarRessonanciaMetalica();
          alvo.userData.ressonarAte = performance.now() * 0.001 + 0.8;
        }
      };
      grpCidade.add(pilhaVigas);

      // Segundo edifício (prédio moderno com cimento e vidro)
      const predio2 = kit.criarPredio(4, 7.5, 4, 0x78909c);
      predio2.position.set(5, 0, 4);
      predio2.userData.interativo = true;
      predio2.userData.nome = '🏙️ Edifícios da cidade: construídos com ferro, cimento e areia extraídos da natureza.';
      predio2.userData.som = 'pop';
      grpCidade.add(predio2);

      const sombraPredio2 = kit.criarSombraDeContato(5, 4, 2.9, 2.9, 0.48);
      sombraPredio2.position.y = 0.05;
      grpCidade.add(sombraPredio2);

      // --- 7. CAMINHÃO BETONEIRA COM TAMBOR GIRATÓRIO DE CONCRETO ---
      const caminhaoBetoneira = new THREE.Group();
      caminhaoBetoneira.position.set(-4.5, 0, 0.5);
      caminhaoBetoneira.rotation.y = -Math.PI * 0.35;

      // Chassi do caminhão betoneira
      const chassiBet = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 5.0), kit.mat('lambert', 0x37474f));
      chassiBet.position.y = 0.55;
      chassiBet.castShadow = true;
      caminhaoBetoneira.add(chassiBet);

      // Rodas
      const rGeoBet = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 10);
      const rMatBet = kit.mat('lambert', 0x212121);
      [
        [-1.15, 1.6], [1.15, 1.6],
        [-1.15, -1.0], [1.15, -1.0],
        [-1.15, -1.8], [1.15, -1.8]
      ].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rGeoBet, rMatBet);
        r.rotation.z = Math.PI / 2;
        r.position.set(rx, 0.42, rz);
        r.castShadow = true;
        caminhaoBetoneira.add(r);
      });

      // Cabine moderna em branco e azul
      const cabineBet = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.3, 1.5), kit.mat('lambert', 0x1976d2));
      cabineBet.position.set(0, 1.45, 1.6);
      cabineBet.castShadow = true;
      caminhaoBetoneira.add(cabineBet);

      const vidroBet = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.65, 0.1), matVidro);
      vidroBet.position.set(0, 1.6, 2.36);
      caminhaoBetoneira.add(vidroBet);

      // Tanque de água cilíndrico atrás da cabine
      const tanqueAgua = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.7, 8), kit.mat('phong', 0xb0bec5, { shininess: 80 }));
      tanqueAgua.rotation.z = Math.PI / 2;
      tanqueAgua.position.set(0, 2.1, 0.65);
      caminhaoBetoneira.add(tanqueAgua);

      // Tambor giratório misturador de concreto (biconíco inclinado)
      const grpTambor = new THREE.Group();
      grpTambor.position.set(0, 1.75, -0.6);
      grpTambor.rotation.x = Math.PI * 0.16;

      const coneFrente = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.8, 12), kit.mat('lambert', 0xfff9c4));
      coneFrente.position.z = 0.9;
      coneFrente.rotation.x = -Math.PI / 2;
      grpTambor.add(coneFrente);

      const coneTraseiro = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.2, 12), kit.mat('lambert', 0xf57c00));
      coneTraseiro.position.z = -1.1;
      coneTraseiro.rotation.x = Math.PI / 2;
      grpTambor.add(coneTraseiro);

      // Faixas espirais em relevo no tambor
      const faixaEspiral = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.08, 6, 16), kit.mat('lambert', 0x1976d2));
      grpTambor.add(faixaEspiral);

      caminhaoBetoneira.add(grpTambor);

      // Calha e funil de descarga de concreto na traseira
      const funilCarga = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.6, 6), kit.mat('lambert', 0x546e7a));
      funilCarga.position.set(0, 2.3, -2.15);
      caminhaoBetoneira.add(funilCarga);

      const calhaDescarga = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 1.1), kit.mat('lambert', 0x78909c));
      calhaDescarga.position.set(0.15, 1.35, -2.6);
      calhaDescarga.rotation.x = -Math.PI * 0.22;
      calhaDescarga.rotation.y = Math.PI * 0.15;
      caminhaoBetoneira.add(calhaDescarga);

      caminhaoBetoneira.userData = {
        interativo: true,
        nome: '🚚 Caminhão betoneira: mistura cimento calcário, areia, brita e água para produzir o concreto das construções.',
        som: 'buzina',
        aoClicar: function (alvo) {
          if (kit && kit.Audio && typeof kit.Audio.buzina === 'function') {
            kit.Audio.buzina();
          }
          alvo.userData.vibrarAte = performance.now() * 0.001 + 1.6;
          alvo.userData.turboTamborAte = performance.now() * 0.001 + 2.8;
        }
      };
      grpCidade.add(caminhaoBetoneira);

      const sombraBetoneira = kit.criarSombraDeContato(-4.5, 0.5, 2.0, 3.8, 0.48);
      sombraBetoneira.position.y = 0.05;
      grpCidade.add(sombraBetoneira);

      // Casas com cimento e telhados
      const casa1 = kit.criarCasa(4.5, 3.2, 3.8, 0xffffff, 0xc62828);
      casa1.position.set(-4, 0, -6);
      casa1.rotation.y = Math.PI / 2;
      casa1.userData.interativo = true;
      casa1.userData.nome = '🏠 Casa de alvenaria: construída com cimento, areia e ferro estrutural.';
      casa1.userData.som = 'pop';
      grpCidade.add(casa1);

      const casa2 = kit.criarCasa(4.2, 3.0, 3.6, 0xfff9c4, 0x2e7d32);
      casa2.position.set(-4, 0, 7.5);
      casa2.rotation.y = -Math.PI / 2;
      casa2.userData.interativo = true;
      casa2.userData.nome = '🏡 Casa urbana com telhado cerâmico e instalações elétricas de cobre.';
      casa2.userData.som = 'pop';
      grpCidade.add(casa2);

      const sombraCasa1 = kit.criarSombraDeContato(-4, -6, 2.8, 2.8, 0.42);
      sombraCasa1.position.y = 0.05;
      grpCidade.add(sombraCasa1);

      const sombraCasa2 = kit.criarSombraDeContato(-4, 7.5, 2.7, 2.7, 0.42);
      sombraCasa2.position.y = 0.05;
      grpCidade.add(sombraCasa2);

      // Luz suave azulada moderna das janelas dos arranha-céus
      const luzJanelasCidade = new THREE.PointLight(0x64b5f6, 0.7, 10);
      luzJanelasCidade.position.set(4.5, 5.5, -1);
      grpCidade.add(luzJanelasCidade);

      // Postes com cruzetas e fios de cobre que levam energia para a cidade
      function criarPoste(x, z) {
        const p = new THREE.Group();
        p.position.set(x, 0, z);

        const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.2, 8), kit.mat('lambert', 0x795548));
        poste.position.y = 2.6;
        poste.castShadow = true;
        p.add(poste);

        const cruzeta = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.15), kit.mat('lambert', 0x5d4037));
        cruzeta.position.y = 4.9;
        cruzeta.rotation.y = Math.PI / 2;
        p.add(cruzeta);

        const isoMat = kit.mat('lambert', 0x00acc1);
        const iso1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 6), isoMat);
        iso1.position.set(0, 5.05, -0.6);
        const iso2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 6), isoMat);
        iso2.position.set(0, 5.05, 0.6);
        p.add(iso1);
        p.add(iso2);

        p.userData = {
          interativo: true,
          nome: '⚡ Rede elétrica urbana: fios de cobre transmitem eletricidade para os lares.',
          som: 'pop'
        };
        return p;
      }

      grpCidade.add(criarPoste(-1, -10));
      grpCidade.add(criarPoste(-1, 0));
      grpCidade.add(criarPoste(-1, 10));

      // Fios elétricos feitos de cobre (tom metálico cobre) conectando os postes
      const fioMat = kit.mat('basic', 0xb87333);
      const fio1Geo = new THREE.CylinderGeometry(0.03, 0.03, 10, 6);
      const fioA = new THREE.Mesh(fio1Geo, fioMat);
      fioA.position.set(-1, 5.05, -5);
      fioA.rotation.x = Math.PI / 2;
      grpCidade.add(fioA);

      const fioB = new THREE.Mesh(fio1Geo, fioMat);
      fioB.position.set(-1, 5.05, 5);
      fioB.rotation.x = Math.PI / 2;
      grpCidade.add(fioB);

      // Árvores urbanas e placa da cidade
      grpCidade.add(kit.criarArvore(7, 10));
      grpCidade.add(kit.criarArvore(7, -11));
      grpCidade.add(kit.criarPlaca(0, 10, 'CIDADE', 0x1565c0));

      scene.add(grpCidade);

      // ==================== CENTRO: TRANSPORTE E AMOSTRAS ====================
      // Caminhão na estrada transportando minerais para a cidade
      const caminhaoEstrada = kit.criarCaminhao(0x1976d2);
      caminhaoEstrada.position.set(0, 0, 3);
      caminhaoEstrada.userData.interativo = true;
      caminhaoEstrada.userData.nome = '🚛 Caminhão de transporte: leva os minerais da mina para as fábricas e cidades.';
      caminhaoEstrada.userData.som = 'buzina';
      caminhaoEstrada.userData.aoClicar = function (alvo) {
        if (kit && kit.Audio && typeof kit.Audio.buzina === 'function') {
          kit.Audio.buzina();
        }
        alvo.userData.vibrarAte = performance.now() * 0.001 + 1.6;
      };
      scene.add(caminhaoEstrada);

      // Sombra de contato sob o caminhão da estrada
      const sombraCamEstrada = kit.criarSombraDeContato(0, 3, 2.2, 3.8, 0.45);
      sombraCamEstrada.position.y = 0.05;
      scene.add(sombraCamEstrada);

      // Mostruário dos 5 recursos minerais em pedestais com rotação suave
      const grpMinerais = new THREE.Group();
      grpMinerais.position.set(0, 0, 8);

      const amostrasGemas = [];
      const listaMin = [
        { nome: 'Cobre',    cor: 0xb87333, x: -3.6, desc: '⚡ Cobre: metal condutor usado em fios elétricos e motores.' },
        { nome: 'Ferro',    cor: 0x455a64, x: -1.8, desc: '🔩 Ferro: mineral que vira aço em altas temperaturas e sustenta construções.' },
        { nome: 'Areia',    cor: 0xd7ccc8, x: 0,    desc: '🏖️ Areia: recurso mineral natural muito utilizado nas argamassas e concreto.' },
        { nome: 'Bauxita',  cor: 0xbf360c, x: 1.8,  desc: '✈️ Bauxita: mineral avermelhado do qual é extraído o alumínio.' },
        { nome: 'Calcário', cor: 0xeeeeee, x: 3.6,  desc: '🧱 Calcário: rocha mineral a partir da qual é fabricado o cimento.' }
      ];

      listaMin.forEach((m) => {
        const pedGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.7, 12);
        const pedMat = kit.mat('lambert', 0x37474f);
        const pedestal = new THREE.Mesh(pedGeo, pedMat);
        pedestal.position.set(m.x, 0.35, 0);
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        pedestal.userData = { interativo: true, nome: m.desc, som: 'pop' };
        grpMinerais.add(pedestal);

        const gemaGeo = new THREE.DodecahedronGeometry(0.38, 0);
        const gemaMat = kit.mat('lambert', m.cor);
        const gema = new THREE.Mesh(gemaGeo, gemaMat);
        gema.position.set(m.x, 0.95, 0);
        gema.castShadow = true;
        gema.userData = { interativo: true, nome: m.desc, som: 'pop' };
        grpMinerais.add(gema);
        amostrasGemas.push(gema);
      });

      // Brilho mineral dourado suave sobre as amostras
      const luzGlintMinerais = new THREE.PointLight(0xffd54f, 0.5, 5);
      luzGlintMinerais.position.set(0, 1.8, 0.5);
      grpMinerais.add(luzGlintMinerais);

      scene.add(grpMinerais);

      // Animações sutis e agradáveis (sem agitação sensorial, acessibilidade TEA)
      let posEsteiraAcum = 0;
      let ultNowAnim = null;
      let rotTamborAcum = 0;

      animaveis.push((now) => {
        const dt = (ultNowAnim === null) ? 0.016 : Math.min(0.1, Math.max(0, now - ultNowAnim));
        ultNowAnim = now;

        // Pedestais das gemas flutuando e girando suavemente
        amostrasGemas.forEach((gema, idx) => {
          gema.rotation.y = now * 1.4 + idx * 0.8;
          gema.position.y = 0.95 + Math.sin(now * 2 + idx) * 0.05;
        });

        // Minérios descendo na correia transportadora contínua (acelera rolagem com som pop ao toque)
        const isTurboEsteira = correiaGrp.userData.turboAte && now < correiaGrp.userData.turboAte;
        const velEsteira = isTurboEsteira ? 0.95 : 0.28;
        posEsteiraAcum += dt * velEsteira;

        pedrasEsteira.forEach((chunk) => {
          const prog = ((posEsteiraAcum + chunk.userData.tOffset) % 1 + 1) % 1;
          chunk.position.z = -3.4 + prog * 6.8;
          chunk.position.y = 3.9 - prog * 2.2;
          chunk.rotation.y = now * (isTurboEsteira ? 4.5 : 1.5) + chunk.userData.tOffset;
        });

        // Levantar e abaixar a concha da escavadeira mecânica (com ronco de motor e buzina)
        if (escavadeira.userData.animAte && now < escavadeira.userData.animAte) {
          const dur = 2.0;
          const el = dur - (escavadeira.userData.animAte - now);
          const frac = Math.max(0, Math.min(1, el / dur));
          const lev = Math.sin(frac * Math.PI); // elevação suave e descida harmoniosa (0 -> 1 -> 0)
          if (bracoMovelEscavadeira) {
            bracoMovelEscavadeira.rotation.x = -lev * 0.38;
          }
          if (concha) {
            concha.rotation.x = -Math.PI * 0.2 + lev * 0.24;
          }
        } else if (bracoMovelEscavadeira) {
          bracoMovelEscavadeira.rotation.x = 0;
          if (concha) concha.rotation.x = -Math.PI * 0.2;
        }

        // Vibração da suspensão do super caminhão fora-de-estrada
        if (caminhaoMina.userData.vibrarAte && now < caminhaoMina.userData.vibrarAte) {
          const tRest = caminhaoMina.userData.vibrarAte - now;
          const intens = Math.max(0, tRest / 1.6);
          caminhaoMina.position.y = 0.04 + Math.abs(Math.sin(now * 36)) * 0.07 * intens;
          caminhaoMina.rotation.z = Math.sin(now * 28) * 0.02 * intens;
        } else {
          caminhaoMina.position.y = 0.04;
          caminhaoMina.rotation.z = 0;
        }

        // Vibração da suspensão do caminhão betoneira
        if (caminhaoBetoneira.userData.vibrarAte && now < caminhaoBetoneira.userData.vibrarAte) {
          const tRest = caminhaoBetoneira.userData.vibrarAte - now;
          const intens = Math.max(0, tRest / 1.6);
          caminhaoBetoneira.position.y = Math.abs(Math.sin(now * 38)) * 0.06 * intens;
          caminhaoBetoneira.rotation.z = Math.sin(now * 30) * 0.018 * intens;
        } else {
          caminhaoBetoneira.position.y = 0;
          caminhaoBetoneira.rotation.z = 0;
        }

        // Vibração da suspensão do caminhão de transporte da estrada
        if (caminhaoEstrada.userData.vibrarAte && now < caminhaoEstrada.userData.vibrarAte) {
          const tRest = caminhaoEstrada.userData.vibrarAte - now;
          const intens = Math.max(0, tRest / 1.6);
          caminhaoEstrada.position.y = Math.abs(Math.sin(now * 36)) * 0.05 * intens;
          caminhaoEstrada.rotation.z = Math.sin(now * 26) * 0.015 * intens;
        } else {
          caminhaoEstrada.position.y = 0;
          caminhaoEstrada.rotation.z = 0;
        }

        // Rotação do tambor da betoneira (acelera quando tocada)
        if (grpTambor) {
          const isTurboTambor = caminhaoBetoneira.userData.turboTamborAte && now < caminhaoBetoneira.userData.turboTamborAte;
          const velTambor = isTurboTambor ? 4.2 : 1.2;
          rotTamborAcum += dt * velTambor;
          grpTambor.rotation.z = rotTamborAcum;
        }

        // Ressonância metálica suave e tremor sutil das vigas de aço ao toque
        if (pilhaVigas.userData.ressonarAte && now < pilhaVigas.userData.ressonarAte) {
          const tRest = pilhaVigas.userData.ressonarAte - now;
          const tremor = Math.sin(now * 48) * 0.015 * Math.max(0, tRest / 0.8);
          pilhaVigas.position.x = 1.6 + tremor;
        } else {
          pilhaVigas.position.x = 1.6;
        }

        // Pulso harmônico de respiração suave e sereno da luz mágica violeta dos geodos de ametista (TEA)
        if (luzGeodo) {
          luzGeodo.intensity = 1.15 + Math.sin(now * 1.5) * 0.18 + Math.sin(now * 0.75) * 0.08;
        }
        if (luzGeodo2) {
          luzGeodo2.intensity = 1.05 + Math.cos(now * 1.3) * 0.16 + Math.sin(now * 0.65) * 0.07;
        }
        if (poolGeodo1 && poolGeodo1.material) {
          poolGeodo1.material.opacity = 0.28 + Math.sin(now * 1.5) * 0.05;
        }
        if (poolGeodo2 && poolGeodo2.material) {
          poolGeodo2.material.opacity = 0.26 + Math.cos(now * 1.3) * 0.05;
        }

        // Refração de luz cristalina dos geodos de ametista (ondas prismáticas suaves)
        refracoesGeodos.forEach((rg, rIdx) => {
          if (rg.material) {
            rg.material.opacity = 0.28 + Math.sin(now * 1.8 + rIdx) * 0.08;
          }
          rg.rotation.z = Math.sin(now * 0.6 + rIdx) * 0.15;
        });

        // Partículas cintilantes dos geodos flutuando serenamente (TEA)
        particulasGeodos.forEach((p) => {
          p.position.y = p.userData.baseY + Math.sin(now * 1.6 + p.userData.fase) * 0.03;
          p.position.x = p.userData.baseX + Math.cos(now * 1.4 + p.userData.fase) * 0.02;
          p.scale.setScalar(0.85 + Math.sin(now * 2.0 + p.userData.fase) * 0.2);
        });

        // Facetas brilhantes dos taludes com cintilação serena
        facetasTalude.forEach((f) => {
          const brilho = 0.92 + Math.sin(now * 1.5 + f.userData.fase) * 0.12;
          f.scale.set(brilho, brilho, brilho);
        });

        // Sinalizador vermelho de segurança da grua piscando serenamente (calm blink, acessibilidade TEA)
        if (beaconLuz) {
          const ondaBlink = Math.sin(now * 2.8);
          const pulsoBeacon = ondaBlink > 0.25 ? Math.pow(ondaBlink, 3) : 0.06;
          beaconLuz.intensity = pulsoBeacon * 1.15;
          if (beaconHalo && beaconHalo.material) {
            beaconHalo.material.opacity = pulsoBeacon * 0.38;
          }
        }

        // Pulso calmo e sutil das luzes de trabalho âmbar da escavadeira e caminhão
        if (luzTrabalhoEsc) {
          luzTrabalhoEsc.intensity = 1.15 + Math.sin(now * 1.8) * 0.08;
        }
        if (luzTrabalhoCam) {
          luzTrabalhoCam.intensity = 0.95 + Math.cos(now * 1.6) * 0.08;
        }

        // Giro suave e calmante da lança da grua torre no arranha-céu
        if (lancaGiratoria) {
          lancaGiratoria.rotation.y = Math.sin(now * 0.35) * 0.18;
        }
      });
    },

    missoes: [
      {
        kicker: 'Missão 1 · Extrativismo Mineral',
        enunciado: 'De onde são retirados os recursos minerais na natureza?',
        respostaCerta: 'natureza',
        cam: 'mina',
        foto: '../img/hga/min/areia.jpg',
        fotoAlt: 'Recursos minerais no solo e subsolo',
        explicacao: 'O extrativismo mineral é a retirada de recursos minerais do solo e do subsolo na natureza.',
        dicaRetry: 'Lembre-se: os recursos minerais são retirados do solo e subsolo na natureza.',
        opcoes: [
          { id: 'natureza', ico: '⛏️', tit: 'Solo e Subsolo', desc: 'Retirados da natureza' },
          { id: 'cidade',   ico: '🏙️', tit: 'Prédios da Cidade', desc: 'Construídos pelas pessoas' }
        ]
      },
      {
        kicker: 'Missão 2 · Fios Elétricos',
        enunciado: 'Qual mineral é utilizado para fazer fios elétricos e utensílios?',
        respostaCerta: 'cobre',
        cam: 'cidade',
        foto: '../img/hga/min/cobre.jpg',
        fotoAlt: 'Fios de cobre',
        explicacao: 'O cobre é o mineral utilizado para fazer fios elétricos e utensílios domésticos.',
        dicaRetry: 'O mineral dos fios elétricos é o cobre.',
        opcoes: [
          { id: 'cobre', ico: '⚡', tit: 'Cobre', desc: 'Fios elétricos e utensílios' },
          { id: 'areia', ico: '🏖️', tit: 'Areia', desc: 'Usada na construção' }
        ]
      },
      {
        kicker: 'Missão 3 · Ferramentas e Aço',
        enunciado: 'Qual mineral é usado para ferramentas, máquinas e vira aço com altas temperaturas?',
        respostaCerta: 'ferro',
        cam: 'mina',
        foto: '../img/hga/min/ferro.jpg',
        fotoAlt: 'Portão de ferro',
        explicacao: 'O ferro é usado para fazer ferramentas, máquinas e, com calor, vira aço.',
        dicaRetry: 'O mineral usado em ferramentas e que vira aço é o ferro.',
        opcoes: [
          { id: 'ferro', ico: '🔩', tit: 'Ferro', desc: 'Ferramentas, máquinas e aço' },
          { id: 'cobre', ico: '⚡', tit: 'Cobre', desc: 'Fios elétricos e utensílios' }
        ]
      },
      {
        kicker: 'Missão 4 · Origem do Alumínio',
        enunciado: 'O alumínio (usado em utensílios e partes de aviões) é produzido a partir de qual mineral?',
        respostaCerta: 'bauxita',
        cam: 'cidade',
        foto: '../img/hga/min/aluminio.jpg',
        fotoAlt: 'Objeto de alumínio feito de bauxita',
        explicacao: 'O alumínio é produzido a partir da bauxita e usado em utensílios e partes de aviões.',
        dicaRetry: 'O alumínio é produzido a partir do mineral bauxita.',
        opcoes: [
          { id: 'bauxita',  ico: '✈️', tit: 'Bauxita', desc: 'Dela é produzido o alumínio' },
          { id: 'calcario', ico: '🧱', tit: 'Calcário', desc: 'Dele é produzido o cimento' }
        ]
      },
      {
        kicker: 'Missão 5 · Cimento na Construção',
        enunciado: 'O cimento utilizado nas construções é produzido a partir de qual mineral?',
        respostaCerta: 'calcario',
        cam: 'cidade',
        foto: '../img/hga/min/cimento.jpg',
        fotoAlt: 'Sacos de cimento',
        explicacao: 'O cimento utilizado nas construções é produzido a partir do calcário.',
        dicaRetry: 'O cimento é produzido a partir do calcário.',
        opcoes: [
          { id: 'calcario', ico: '🧱', tit: 'Calcário', desc: 'Dele é produzido o cimento' },
          { id: 'cobre',    ico: '⚡', tit: 'Cobre', desc: 'Dele são feitos fios elétricos' }
        ]
      },
      {
        kicker: 'Missão 6 · Os 5 Recursos Minerais',
        enunciado: 'Toque nos 5 recursos minerais que saem da natureza:',
        tipo: 'selecao',
        cam: 'minerais',
        foto: '../img/hga/min/areia.jpg',
        fotoAlt: 'Os 5 minerais do livro didático',
        explicacao: 'Muito bem! Você encontrou os 5 minerais do livro: Cobre, Ferro, Areia, Bauxita e Calcário!',
        totalRequerido: 5,
        itens: [
          { id: 'cobre',    nome: 'Cobre',    img: '../img/hga/min/cobre.jpg' },
          { id: 'ferro',    nome: 'Ferro',    img: '../img/hga/min/ferro.jpg' },
          { id: 'areia',    nome: 'Areia',    img: '../img/hga/min/areia.jpg' },
          { id: 'bauxita',  nome: 'Bauxita',  img: '../img/hga/min/aluminio.jpg' },
          { id: 'calcario', nome: 'Calcário', img: '../img/hga/min/cimento.jpg' }
        ]
      }
    ],

    resumoFinal: [
      {
        titulo: '⛏️ Extrativismo Mineral',
        itens: [
          'Retirada de minerais do solo e subsolo',
          'Levaram milhões de anos para se formar',
          'Ao serem extraídos, diminuem na natureza'
        ]
      },
      {
        titulo: '🏙️ Mineral → Produto Cotidiano',
        itens: [
          'Cobre: fios elétricos e utensílios',
          'Ferro: ferramentas, máquinas e vira aço',
          'Bauxita: dela é produzido o alumínio',
          'Calcário: dele é produzido o cimento',
          'Areia: usada na construção civil'
        ]
      }
    ]
  };
})(window);
