/* jogos/campo-cidade/dados-3d.js — Dados declarativos do jogo 3D de Campo e Cidade (Lazer e Cinema).
   Lido por jogos/jogar-3d.html?topico=campo-cidade. Usa os helpers em ../jogo-kit-3d.js. */
(function (global) {
  'use strict';
  global.DADOS_3D = global.DADOS_3D || {};

  global.DADOS_3D['campo-cidade'] = {
    id: 'cc-3d',
    topico: 'campo-cidade',
    titulo: 'Lazer e Cinema 3D',
    icone: '🎬',
    referenciaLivro: 'p. 102, 104 e 105 · base do livro',
    skyColor: 0xd2e7f9,
    skyTopo: 0xff9800, /* Laranja para pôr do sol */
    skyBase: 0x90caf9, /* Azul claro no horizonte */
    hudTags: ['🌳 Jardim da Luz (1910)', '🎬 Cinema Antigo'],

    visual: {
      cor: true,
      exposicao: 1.05,
      ceu: { topo: 0xff9800, base: 0x90caf9 },
      nevoa: { cor: 0xffe0b2, perto: 75, longe: 180 }
    },

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🌳 Jardim da Luz', cam: 'parque' },
      { label: '🎬 Cinema Antigo', cam: 'cinema' },
      { label: '📐 Isométrica', cam: 'isometrica' }
    ],

    cameras: {
      geral:      { pos: [0, 30, 42],   look: [0, 2, -2] },
      parque:     { pos: [-14, 18, 28], look: [-14, 2, -2] },
      cinema:     { pos: [14, 18, 28],  look: [14, 2, -2] },
      isometrica: { pos: [30, 30, 30],  look: [0, 2, 0] }
    },

    fichas3d: [
      {
        id: 'cc-jardim',
        pos: [-14.5, 4.0, -2.0],
        nome: '🌳 Jardim da Luz',
        foto: '../img/hga/cc/jardim-luz.jpg',
        fato: 'Em 1910, as famílias passeavam ao ar livre no Jardim da Luz com árvores e coreto.'
      },
      {
        id: 'cc-mudo',
        pos: [11.5, 4.0, 0.5],
        nome: '🎬 Cinema Mudo (1895)',
        foto: '../img/hga/cc/cinema-1895.jpg',
        fato: 'Em 1895, os primeiros filmes dos irmãos Lumière eram curtos, mudos e em preto e branco.'
      },
      {
        id: 'cc-sonoro',
        pos: [15.0, 4.0, -1.5],
        nome: '🎷 Cinema Sonoro (1927)',
        foto: '../img/hga/cc/cinema-1927.jpg',
        fato: 'Em 1927, surgiram as primeiras falas e músicas gravadas no filme O cantor de jazz.'
      },
      {
        id: 'cc-branca',
        pos: [14.0, 4.0, 4.5],
        nome: '🍎 Animação Colorida (1937)',
        foto: '../img/hga/cc/branca-neve.jpg',
        fato: 'Em 1937, a animação Branca de Neve encantou o mundo com cores vivas e canções.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Pedestal da Ilha Diorama Flutuante estilizada (1910)
      scene.add(kit.criarIlhaDiorama(64, 44, 4.0, 0x81c784, 0x4e342e));

      // Centenas de tufos de grama instanciados balançando ao vento no gramado do Jardim da Luz
      kit.criarGramaInstanciada(scene, animaveis, {
        minX: -24,
        maxX: -4,
        minZ: -16,
        maxZ: 16,
        count: 240,
        cor: 0x66bb6a,
        excluir: function (gx, gz) {
          // Caminho central de cascalho do parque
          if (gx > -15.8 && gx < -12.2 && gz > -14.5 && gz < 14.5) return true;
          // Lago e chafariz em (-19, -6)
          if (Math.hypot(gx - (-19), gz - (-6)) < 4.8) return true;
          // Coreto histórico em (-8.5, -4)
          if (Math.hypot(gx - (-8.5), gz - (-4)) < 2.9) return true;
          // Piquenique em (-16.2, 3)
          if (Math.hypot(gx - (-16.2), gz - 3) < 2.4) return true;
          return false;
        }
      });

      // Rua central de paralelepípedos separando o parque da cidade
      const ruaCentral = kit.criarEstrada(6, 44, 0x455a64);
      scene.add(ruaCentral);

      // Leito de brita mineral (lastro ferroviário em basalto/granito) para sustentação dos trilhos do bonde
      const matLeitoCascalho = kit.mat('lambert', 0x455a64);
      const matBritaAngular = kit.mat('lambert', 0x37474f);
      const leitoCascalho = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.05, 44), matLeitoCascalho);
      leitoCascalho.position.set(0, 0.035, 0);
      leitoCascalho.receiveShadow = true;
      scene.add(leitoCascalho);

      // Bermas chanfradas do leito de brita
      [-1.48, 1.48].forEach((bx) => {
        const bermaBrita = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 44), matBritaAngular);
        bermaBrita.position.set(bx, 0.025, 0);
        scene.add(bermaBrita);
      });

      // Dormentes de madeira nítidos com placas de fixação e tirefonds metálicos
      const dormenteMat = kit.mat('lambert', 0x3e2723);
      const placaFixacaoMat = kit.mat('phong', 0x263238, { shininess: 80 });
      const tirefondMat = kit.mat('phong', 0x1f242b, { shininess: 90, specular: 0x90a4ae });

      const dormenteGeo = new THREE.BoxGeometry(2.45, 0.07, 0.28);
      const placaFixacaoGeo = new THREE.BoxGeometry(0.20, 0.025, 0.24);
      const tirefondGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.045, 6);

      for (let z = -21; z <= 21; z += 0.85) {
        const dormente = new THREE.Mesh(dormenteGeo, dormenteMat);
        dormente.position.set(0, 0.06, z);
        dormente.castShadow = true;
        dormente.receiveShadow = true;
        scene.add(dormente);

        // Placas de fixação de aço sobre o dormente sob cada trilho com tirefonds
        [-1.0, 1.0].forEach((tx) => {
          const placa = new THREE.Mesh(placaFixacaoGeo, placaFixacaoMat);
          placa.position.set(tx, 0.095, z);
          scene.add(placa);

          // Tirefonds de fixação (parafusos hexagonais cravados na madeira que travam o trilho)
          [-0.065, 0.065].forEach((tz) => {
            const tirefond = new THREE.Mesh(tirefondGeo, tirefondMat);
            tirefond.position.set(tx, 0.11, z + tz);
            scene.add(tirefond);
          });
        });
      }

      // Pedregulhos de brita mineral e seixos angulares distribuídos ao longo do leito e entre dormentes
      [-20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20].forEach((cz) => {
        kit.criarPedrinhasDecorativas(scene, -1.25, cz, 5, 0.5, { escala: 0.65, cores: [0x546e7a, 0x607d8b, 0x455a64] });
        kit.criarPedrinhasDecorativas(scene, 1.25, cz + 0.35, 5, 0.5, { escala: 0.65, cores: [0x546e7a, 0x607d8b, 0x455a64] });
        kit.criarPedrinhasDecorativas(scene, 0, cz - 0.25, 4, 0.6, { escala: 0.58, cores: [0x37474f, 0x546e7a] });
      });

      // Trilhos de aço polido elevados sobre as placas dos dormentes de madeira
      const trilhoGeo = new THREE.BoxGeometry(0.085, 0.075, 44);
      const trilhoMat = kit.mat('phong', 0xcfd8dc, { shininess: 95, specular: 0xffffff });
      const trilhoEsq = new THREE.Mesh(trilhoGeo, trilhoMat);
      trilhoEsq.position.set(-1.0, 0.11, 0);
      scene.add(trilhoEsq);

      const trilhoDir = new THREE.Mesh(trilhoGeo, trilhoMat);
      trilhoDir.position.set(1.0, 0.11, 0);
      scene.add(trilhoDir);

      // Pedrinhas decorativas, tufos de grama estilizados e flores campestres nos caminhos do Jardim da Luz e rua
      [-14, -9, -4, 1, 6, 11, 16].forEach((pz, idx) => {
        // Caminho central de cascalho do parque (x = -14)
        kit.criarPedrinhasDecorativas(scene, -14, pz, 7, 1.2, { escala: 0.8, cores: [0xd7ccc8, 0xbcaaa4, 0xcfd8dc] });
        kit.criarTufosGramaDecorativos(scene, -14.9, pz + (idx % 2 === 0 ? 0.6 : -0.6), 5, 0.85, animaveis, 0x66bb6a);
        if (idx % 2 === 0) {
          kit.criarFloresCampestresCaminho(scene, -15.1, pz + 0.9, 5, 0.9, animaveis, [0xffffff, 0xfff9c4, 0xf8bbd0, 0xe1bee7]);
        }

        // Borda da calçada do parque junto à rua (x = -3.2)
        kit.criarTufosGramaDecorativos(scene, -3.2, pz, 4, 0.75, animaveis, 0x66bb6a);
        kit.criarPedrinhasDecorativas(scene, -3.1, pz + 0.5, 5, 0.8, { escala: 0.75 });
      });

      // Fio aéreo de contato (rede elétrica aérea do bonde)
      const fioAereo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 44, 4), kit.mat('basic', 0x263238));
      fioAereo.position.set(0, 3.8, 0);
      scene.add(fioAereo);

      // Postes de luz clássicos (Missão 4: Transição Histórica / Iluminação Pública)
      const postesAntigos = [];
      function criarPosteAntigo(px, pz, luzCor, luzInt, luzDist, comConeLuz) {
        const poste = new THREE.Group();
        poste.position.set(px, 0, pz);
        poste.userData = {
          interativo: true,
          pistaMissao: 4,
          nome: '🏮 Lampião a gás vitoriano: iluminava as noites de São Paulo em 1910 com luz âmbar aconchegante.',
          som: 'pop',
          aoClicar: function (alvo, Kit3D) {
            alvo.userData.piscarAte = performance.now() * 0.001 + 2.4;
            if (Kit3D && Kit3D.Audio && typeof Kit3D.Audio.pop === 'function') {
              Kit3D.Audio.pop();
            }
          }
        };

        // Pedestal e coluna canelada de ferro fundido ornamental
        const basePed = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.32, 0.45, 8),
          kit.mat('lambert', 0x1b262c)
        );
        basePed.position.y = 0.22;
        basePed.castShadow = true;
        poste.add(basePed);

        const coluna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, 3.0, 8),
          kit.mat('lambert', 0x263238)
        );
        coluna.position.y = 1.7;
        coluna.castShadow = true;
        poste.add(coluna);

        // Braço curvo ornamental e suporte da lanterna
        const bracoCurvo = new THREE.Mesh(
          new THREE.TorusGeometry(0.22, 0.035, 4, 8, Math.PI),
          kit.mat('lambert', 0x263238)
        );
        bracoCurvo.rotation.z = Math.PI / 2;
        bracoCurvo.position.set(0, 3.1, 0);
        poste.add(bracoCurvo);

        // Lanterna hexagonal envidraçada de época com brilho vítreo
        const lanterna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.22, 0.65, 6),
          kit.mat('phong', 0xfff59d, { opacity: 0.92, transparent: true, shininess: 95 })
        );
        lanterna.position.y = 3.35;
        poste.add(lanterna);

        // Cúpula e chapéu de cobre escuro com remate
        const chapeu = new THREE.Mesh(
          new THREE.ConeGeometry(0.38, 0.4, 6),
          kit.mat('lambert', 0x263238)
        );
        chapeu.position.y = 3.85;
        poste.add(chapeu);

        const remate = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 6, 6),
          kit.mat('phong', 0xffb74d, { shininess: 80 })
        );
        remate.position.y = 4.1;
        poste.add(remate);

        // Chama de gás incandescente quente dentro da lanterna
        const chamaGas = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 8),
          kit.mat('basic', 0xffca28)
        );
        chamaGas.position.y = 3.35;
        poste.add(chamaGas);

        // Halo de luz aconchegante ao redor do bulbo
        const haloLanterna = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 10, 10),
          kit.mat('basic', 0xffe082, { transparent: true, opacity: 0.35, depthWrite: false })
        );
        haloLanterna.position.y = 3.35;
        poste.add(haloLanterna);

        let coneLuz = null;
        let poolChao = null;

        // Cone de luz translúcido suave e piscina de luz dourada iluminando o caminho de cascalho
        if (comConeLuz !== false) {
          const coneLuzGeo = new THREE.ConeGeometry(1.75, 3.3, 14, 1, true);
          const coneLuzMat = kit.mat('basic', 0xfff9c4, {
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
            side: THREE.DoubleSide
          });
          coneLuz = new THREE.Mesh(coneLuzGeo, coneLuzMat);
          coneLuz.position.set(0, 1.6, 0);
          coneLuz.rotation.x = Math.PI;
          poste.add(coneLuz);

          // Piscina de luz dourada aconchegante projetada no cascalho do Jardim da Luz
          poolChao = new THREE.Mesh(
            new THREE.CircleGeometry(1.9, 16),
            kit.mat('basic', 0xffd54f, { transparent: true, opacity: 0.28, depthWrite: false })
          );
          poolChao.rotation.x = -Math.PI / 2;
          poolChao.position.set(0, 0.065, 0);
          poste.add(poolChao);
        }

        let ptLight = null;
        if (luzCor != null) {
          ptLight = new THREE.PointLight(luzCor || 0xffd54f, (luzInt || 0.85) * 1.25, luzDist || 9.5);
          ptLight.position.set(0, 3.35, 0);
          poste.add(ptLight);
        }

        poste.userData.elementosLuz = {
          haloLanterna,
          chamaGas,
          ptLight,
          coneLuz,
          poolChao,
          luzInt: luzInt || 0.85
        };
        postesAntigos.push(poste);

        return poste;
      }

      // ==========================================
      // LADO ESQUERDO: Parque / Jardim da Luz em 1910
      // ==========================================
      const grpParque = new THREE.Group();
      grpParque.position.set(-14, 0, 0);

      // Gramado bem cuidado do Jardim da Luz
      const gramadoParque = kit.criarChao(22, 34, 0x66bb6a);
      gramadoParque.position.y = 0.05;
      grpParque.add(gramadoParque);

      // Caminho de passeio em cascalho/terra clara
      const caminhoPasseio = kit.criarChao(3.2, 28, 0xd7ccc8);
      caminhoPasseio.position.set(0, 0.06, 0);
      grpParque.add(caminhoPasseio);

      // Canteiros de flores históricas do Jardim da Luz
      kit.criarFlores(grpParque, 4, 4, 3, 14);
      kit.criarFlores(grpParque, 4, -8, 3, 10);

      // Lago com chafariz de bacias escalonadas em pedra clássica e cascata contínua (Missão 3: Chafariz e Lazer Urbano)
      const cascatasChafariz = [];
      const ondulacoesLago = [];

      const dadosChafariz = {
        interativo: true,
        pistaMissao: 3,
        nome: '⛲ Chafariz ornamental e lago do Jardim da Luz: bacias escalonadas em pedra clássica com cascata contínua e água cristalina.',
        som: 'splash',
        aoClicar: function (alvo, Kit3D) {
          const tAte = performance.now() * 0.001 + 2.4;
          chafarizBase.userData.splashAte = tAte;
          jatoAgua.userData.splashAte = tAte;
          lago.userData.splashAte = tAte;
          if (Kit3D && Kit3D.Audio && typeof Kit3D.Audio.splash === 'function') {
            Kit3D.Audio.splash();
          }
        }
      };

      // Espelho d'água do lago ornamental
      const lago = kit.criarRio(8.4, 10.4, 0x29b6f6);
      lago.position.set(-5, 0.08, -6);
      lago.userData = dadosChafariz;
      grpParque.add(lago);

      // Borda em cantaria de pedra moldurada contornando o lago
      const matBordaLago = kit.mat('lambert', 0xb0bec5);
      const bordaLagoN = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.16, 0.35), matBordaLago);
      bordaLagoN.position.set(-5, 0.12, -11.2);
      grpParque.add(bordaLagoN);
      const bordaLagoS = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.16, 0.35), matBordaLago);
      bordaLagoS.position.set(-5, 0.12, -0.8);
      grpParque.add(bordaLagoS);
      const bordaLagoL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 10.6), matBordaLago);
      bordaLagoL.position.set(-0.8, 0.12, -6);
      grpParque.add(bordaLagoL);
      const bordaLagoO = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 10.6), matBordaLago);
      bordaLagoO.position.set(-9.2, 0.12, -6);
      grpParque.add(bordaLagoO);

      // --- ESTRUTURA ESCALONADA EM PEDRA CLÁSSICA DO CHAFARIZ ---
      const matPedraClassica = kit.mat('lambert', 0xcfd8dc);
      const matPedraEscura   = kit.mat('lambert', 0x90a4ae);
      const matAguaCascata   = kit.mat('phong', 0xe1f5fe, { transparent: true, opacity: 0.75, shininess: 95, side: THREE.DoubleSide });

      // 1. Bacia inferior ampla (Nível 1) em cantaria de pedra clássica
      const chafarizBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.9, 2.2, 0.5, 16),
        matPedraClassica
      );
      chafarizBase.position.set(-5, 0.3, -6);
      chafarizBase.castShadow = true;
      chafarizBase.receiveShadow = true;
      chafarizBase.userData = dadosChafariz;
      grpParque.add(chafarizBase);

      // Borda moldurada em toro da bacia inferior
      const toroBacia1 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.12, 8, 18), matPedraEscura);
      toroBacia1.rotation.x = Math.PI / 2;
      toroBacia1.position.set(-5, 0.55, -6);
      grpParque.add(toroBacia1);

      // Pedestal central canelado esculpido clássico
      const pedestalCentral = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.8, 12), matPedraClassica);
      pedestalCentral.position.set(-5, 0.8, -6);
      pedestalCentral.castShadow = true;
      grpParque.add(pedestalCentral);

      // 2. Bacia intermediária escalonada (Nível 2) em concha clássica
      const baciaIntermediaria = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.65, 0.35, 14), matPedraClassica);
      baciaIntermediaria.position.set(-5, 1.25, -6);
      baciaIntermediaria.castShadow = true;
      grpParque.add(baciaIntermediaria);

      const toroBacia2 = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.09, 8, 16), matPedraEscura);
      toroBacia2.rotation.x = Math.PI / 2;
      toroBacia2.position.set(-5, 1.42, -6);
      grpParque.add(toroBacia2);

      // Coluna superior canelada sustentando a taça do topo
      const colunaSuperior = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.65, 10), matPedraClassica);
      colunaSuperior.position.set(-5, 1.68, -6);
      colunaSuperior.castShadow = true;
      grpParque.add(colunaSuperior);

      // 3. Bacia superior escalonada (Nível 3)
      const baciaSuperior = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.35, 0.28, 12), matPedraClassica);
      baciaSuperior.position.set(-5, 2.05, -6);
      baciaSuperior.castShadow = true;
      grpParque.add(baciaSuperior);

      const toroBacia3 = new THREE.Mesh(new THREE.TorusGeometry(0.70, 0.065, 6, 14), matPedraEscura);
      toroBacia3.rotation.x = Math.PI / 2;
      toroBacia3.position.set(-5, 2.18, -6);
      grpParque.add(toroBacia3);

      // Bico vertedouro central de bronze / remate de onde brota a nascente
      const bicoNascente = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 8), kit.mat('phong', 0xb87333, { shininess: 85 }));
      bicoNascente.position.set(-5, 2.28, -6);
      grpParque.add(bicoNascente);

      // --- CASCATAS CONTÍNUAS TRANSLÚCIDAS ---
      // Cascata contínua 1: véu vertendo da bacia superior para a intermediária
      const cascata1 = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 1.15, 0.65, 14, 1, true), matAguaCascata);
      cascata1.position.set(-5, 1.72, -6);
      grpParque.add(cascata1);
      cascatasChafariz.push(cascata1);

      // Cascata contínua 2: véu largo vertendo da bacia intermediária para a bacia inferior
      const cascata2 = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.85, 0.72, 16, 1, true), matAguaCascata);
      cascata2.position.set(-5, 0.92, -6);
      grpParque.add(cascata2);
      cascatasChafariz.push(cascata2);

      // Jato d'água central ascendente que cai em arco de cascata contínua
      const jatoAgua = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 1.8, 8),
        kit.mat('phong', 0xe1f5fe, { transparent: true, opacity: 0.85, shininess: 90 })
      );
      jatoAgua.position.set(-5, 2.7, -6);
      jatoAgua.userData = dadosChafariz;
      grpParque.add(jatoAgua);

      // Gotículas e borbulhas cintilantes de água no topo do jato
      const gotaTopo = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), kit.mat('basic', 0xffffff));
      gotaTopo.position.set(-5, 3.65, -6);
      grpParque.add(gotaTopo);

      // Ondulações concêntricas de água na superfície do lago
      const matOndulacao = kit.mat('basic', 0xb3e5fc, { transparent: true, opacity: 0.38, depthWrite: false });
      [2.3, 3.1, 3.8].forEach((raio, oIdx) => {
        const anelOnda = new THREE.Mesh(new THREE.RingGeometry(raio - 0.08, raio + 0.08, 18), matOndulacao);
        anelOnda.rotation.x = -Math.PI / 2;
        anelOnda.position.set(-5, 0.088, -6);
        anelOnda.userData = { baseRaio: raio, fase: oIdx * 1.8 };
        grpParque.add(anelOnda);
        ondulacoesLago.push(anelOnda);
      });

      // Árvores históricas do Jardim da Luz (Missão 1: Jardim da Luz / Parque Verde)
      const arvoresJardim = [];
      [
        [-7, 8, 0x2e7d32],
        [-8, -12, 0x388e3c],
        [7, -10, 0x43a047],
        [6, 9, 0x2e7d32],
        [-2, -12, 0x1b5e20]
      ].forEach(([ax, az, acor]) => {
        const arvore = kit.criarArvore(ax, az, acor);
        arvore.userData = {
          interativo: true,
          pistaMissao: 1,
          nome: '🌳 Árvore centenária do Jardim da Luz: refúgio verde e fresco nos passeios de domingo em 1910.',
          som: 'pop',
          aoClicar: function (alvo) {
            alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
          }
        };
        grpParque.add(arvore);
        arvoresJardim.push(arvore);
      });

      // --- 1. CORETO VITORIANO ORNAMENTAL COM CÚPULA DE COBRE (Missão 1: Jardim da Luz / Parque Verde) ---
      const coreto = new THREE.Group();
      coreto.position.set(5.5, 0, -4);
      coreto.userData = {
        interativo: true,
        pistaMissao: 1,
        nome: '🎪 Coreto vitoriano do Jardim da Luz: elegante palco com cúpula de cobre onde bandas e orquestras tocavam valsas e músicas suaves.',
        som: 'acordeCoreto',
        aoClicar: function (alvo) {
          coreto.userData.reacaoToqueAte = performance.now() * 0.001 + 2.2;
        }
      };

      // Base octogonal de cantaria de pedra com degraus de acesso
      const baseCoreto = new THREE.Mesh(
        new THREE.CylinderGeometry(2.7, 2.9, 0.65, 8),
        kit.mat('lambert', 0xd7ccc8)
      );
      baseCoreto.position.y = 0.325;
      baseCoreto.castShadow = true;
      baseCoreto.receiveShadow = true;
      coreto.add(baseCoreto);

      // Piso de assoalho de madeira nobre do coreto
      const pisoAssoalho = new THREE.Mesh(
        new THREE.CylinderGeometry(2.55, 2.55, 0.05, 8),
        kit.mat('lambert', 0x5d4037)
      );
      pisoAssoalho.position.y = 0.66;
      coreto.add(pisoAssoalho);

      // Escadinha frontal de acesso em pedra
      const degrau1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.5), kit.mat('lambert', 0xd7ccc8));
      degrau1.position.set(0, 0.18, 2.85);
      coreto.add(degrau1);

      const degrau2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.45), kit.mat('lambert', 0xd7ccc8));
      degrau2.position.set(0, 0.36, 2.55);
      coreto.add(degrau2);

      // 8 Colunas esguias de ferro fundido vitoriano branco com capitéis rendados
      const matColunaVitoriana = kit.mat('lambert', 0xf5f5f5);
      const matGradeFerro = kit.mat('lambert', 0x1b5e20);
      const raioColunas = 2.2;

      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        const cx = Math.cos(ang) * raioColunas;
        const cz = Math.sin(ang) * raioColunas;

        // Coluna principal
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.5, 8), matColunaVitoriana);
        col.position.set(cx, 1.9, cz);
        col.castShadow = true;
        coreto.add(col);

        // Capitel e mísula vitoriana de apoio no topo da coluna
        const capitel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), matColunaVitoriana);
        capitel.position.set(cx, 3.15, cz);
        coreto.add(capitel);

        // Guarda-corpo de ferro trabalhado entre as colunas (exceto na entrada frontal)
        if (a !== 2) {
          const proxAng = ((a + 1) / 8) * Math.PI * 2;
          const px = (cx + Math.cos(proxAng) * raioColunas) * 0.5;
          const pz = (cz + Math.sin(proxAng) * raioColunas) * 0.5;
          const distCol = 2 * raioColunas * Math.sin(Math.PI / 8);

          const grade = new THREE.Mesh(new THREE.BoxGeometry(distCol * 0.94, 0.7, 0.04), matGradeFerro);
          grade.position.set(px, 1.05, pz);
          grade.rotation.y = -(ang + Math.PI / 8) + Math.PI / 2;
          coreto.add(grade);
        }
      }

      // Cimalha e friso octogonal ornamental
      const cimalha = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.35, 0.25, 8),
        kit.mat('lambert', 0xffffff)
      );
      cimalha.position.y = 3.25;
      coreto.add(cimalha);

      // Cúpula majestosa de cobre oxidado / verdigris (cobre histórico com tom verde-azulado nobre)
      const matCupulaCobre = kit.mat('phong', 0x4db6ac, { shininess: 45 });
      const cupulaCobre = new THREE.Mesh(
        new THREE.ConeGeometry(2.7, 1.7, 8),
        matCupulaCobre
      );
      cupulaCobre.position.y = 4.15;
      cupulaCobre.castShadow = true;
      coreto.add(cupulaCobre);

      // Nervuras de cobre ao longo dos 8 gomos da cúpula
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        const nervura = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.06), kit.mat('lambert', 0x00897b));
        nervura.position.set(Math.cos(ang) * 1.3, 4.15, Math.sin(ang) * 1.3);
        nervura.rotation.y = -ang;
        nervura.rotation.z = Math.PI * 0.12;
        coreto.add(nervura);
      }

      // Pináculo e flecha ornamental de cobre no topo da cúpula
      const pinaculo = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), kit.mat('phong', 0xb87333, { shininess: 80 }));
      pinaculo.position.y = 5.1;
      coreto.add(pinaculo);

      const agulha = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.6, 6), kit.mat('phong', 0xb87333, { shininess: 80 }));
      agulha.position.y = 5.45;
      coreto.add(agulha);

      // Lustre vitoriano ornamental de latão polido com cúpulas de gás
      const grpLustre = new THREE.Group();
      grpLustre.position.set(0, 3.0, 0);

      const hasteLustre = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), kit.mat('phong', 0xffb74d, { shininess: 90 }));
      hasteLustre.position.y = 0.25;
      grpLustre.add(hasteLustre);

      const corpoLustre = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), kit.mat('phong', 0xffb74d, { shininess: 95 }));
      grpLustre.add(corpoLustre);

      // 4 Braços curvos de latão com globos de iluminação a gás
      for (let la = 0; la < 4; la++) {
        const angL = (la / 4) * Math.PI * 2;
        const bracoL = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 4, 8, Math.PI / 2), kit.mat('phong', 0xffb74d, { shininess: 90 }));
        bracoL.position.set(Math.cos(angL) * 0.15, -0.05, Math.sin(angL) * 0.15);
        bracoL.rotation.y = -angL;
        grpLustre.add(bracoL);

        const globoL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), kit.mat('basic', 0xfff9c4));
        globoL.position.set(Math.cos(angL) * 0.35, 0.05, Math.sin(angL) * 0.35);
        grpLustre.add(globoL);
      }

      // Globo central incandescente do lustre
      const lanternaCoreto = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), kit.mat('basic', 0xfff59d));
      grpLustre.add(lanternaCoreto);

      // Luz âmbar aconchegante do lustre vitoriano iluminando os instrumentos de latão e o assoalho
      const luzCoreto = new THREE.PointLight(0xffe082, 1.1, 8.5);
      grpLustre.add(luzCoreto);

      // Facho volumétrico cônico suave em direção ao chão de madeira
      const coneLustreGeo = new THREE.ConeGeometry(2.3, 2.4, 14, 1, true);
      const coneLustreMat = kit.mat('basic', 0xffe082, {
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const coneLustre = new THREE.Mesh(coneLustreGeo, coneLustreMat);
      coneLustre.position.set(0, -1.2, 0);
      coneLustre.rotation.x = Math.PI;
      grpLustre.add(coneLustre);

      // Poça de luz dourada suave refletida sobre o assoalho de madeira nobre
      const poolAssoalho = new THREE.Mesh(
        new THREE.CircleGeometry(2.35, 14),
        kit.mat('basic', 0xffe082, { transparent: true, opacity: 0.22, depthWrite: false })
      );
      poolAssoalho.rotation.x = -Math.PI / 2;
      poolAssoalho.position.set(0, 0.67, 0);
      coreto.add(poolAssoalho);

      coreto.add(grpLustre);

      // Instrumentos musicais clássicos de latão dourado sobre o palco do coreto
      const matLatao = kit.mat('phong', 0xffd54f, { shininess: 95 });

      // 1. Trompete vitoriano reluzente (Missão 1: Jardim da Luz / Música no Coreto)
      const grpTrompete = new THREE.Group();
      grpTrompete.position.set(-0.85, 0.72, 0.5);
      grpTrompete.rotation.y = Math.PI * 0.3;
      grpTrompete.userData = {
        interativo: true,
        pistaMissao: 1,
        nome: '🎺 Trompete de latão polido: instrumento de sopro das bandas que tocavam valsas no coreto.',
        som: 'acordeCoreto',
        aoClicar: function () {
          coreto.userData.reacaoToqueAte = performance.now() * 0.001 + 2.2;
        }
      };

      const campana = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 8), matLatao);
      campana.position.set(0, 0.08, 0.2);
      campana.rotation.x = -Math.PI / 2;
      grpTrompete.add(campana);

      const tuboTrompete = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6), matLatao);
      tuboTrompete.rotation.x = Math.PI / 2;
      grpTrompete.add(tuboTrompete);

      const pistoes = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.12), matLatao);
      pistoes.position.set(0, 0.05, 0);
      grpTrompete.add(pistoes);
      coreto.add(grpTrompete);

      // 2. Tuba / Bombardino de latão reluzente no banco do músico (Missão 1: Coreto)
      const grpTuba = new THREE.Group();
      grpTuba.position.set(0.9, 0.72, -0.4);
      grpTuba.rotation.y = -Math.PI * 0.4;
      grpTuba.userData = {
        interativo: true,
        pistaMissao: 1,
        nome: '📯 Tuba de latão dourado: instrumento de som grave e aveludado das orquestras vitorianas.',
        som: 'acordeCoreto',
        aoClicar: function () {
          coreto.userData.reacaoToqueAte = performance.now() * 0.001 + 2.2;
        }
      };

      const corpoTuba = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 12), matLatao);
      corpoTuba.rotation.x = Math.PI / 2;
      grpTuba.add(corpoTuba);

      const campanaTuba = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 8), matLatao);
      campanaTuba.position.set(0.18, 0.15, 0);
      campanaTuba.rotation.z = -Math.PI * 0.25;
      grpTuba.add(campanaTuba);
      coreto.add(grpTuba);

      // Estante de partitura de ferro com música clássica
      const estantePartitura = new THREE.Group();
      estantePartitura.position.set(0, 0.68, 0);
      const estPed = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), kit.mat('lambert', 0x263238));
      estPed.position.y = 0.55;
      estantePartitura.add(estPed);

      const estPrancheta = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.04), kit.mat('lambert', 0x263238));
      estPrancheta.position.set(0, 1.15, 0);
      estPrancheta.rotation.x = -Math.PI * 0.18;
      estantePartitura.add(estPrancheta);

      const folhaMusica = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.34, 0.02), kit.mat('basic', 0xffffff));
      folhaMusica.position.set(0, 1.16, 0.02);
      folhaMusica.rotation.x = -Math.PI * 0.18;
      estantePartitura.add(folhaMusica);
      coreto.add(estantePartitura);

      grpParque.add(coreto);

      // Sombra de contato sob o coreto
      const sombraCoreto = kit.criarSombraDeContato(5.5, -4, 3.0, 3.0, 0.45);
      sombraCoreto.position.y = 0.05;
      grpParque.add(sombraCoreto);

      // --- 2. BANCOS CLÁSSICOS DE FERRO FUNDIDO E RIPAS DE MADEIRA ---
      function criarBancoVitoriano(bx, bz, rotY) {
        const b = new THREE.Group();
        b.position.set(bx, 0, bz);
        b.rotation.y = rotY || 0;
        b.userData = {
          interativo: true,
          nome: '🪑 Banco de ferro fundido e madeira: mobiliário clássico dos passeios do Jardim da Luz em 1910.',
          som: 'pop'
        };

        const matMadeiraSlats = kit.mat('lambert', 0x5d4037);
        const matFerroCurvo = kit.mat('lambert', 0x1b5e20);

        // Laterais esculpidas de ferro fundido verde escuro
        [-0.7, 0.7].forEach((lx) => {
          const peCurvo = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.55), matFerroCurvo);
          peCurvo.position.set(lx, 0.28, 0);
          peCurvo.castShadow = true;
          b.add(peCurvo);

          const bracoApoio = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 4, 8, Math.PI), matFerroCurvo);
          bracoApoio.position.set(lx, 0.58, 0.05);
          bracoApoio.rotation.x = Math.PI / 2;
          b.add(bracoApoio);
        });

        // Ripas de madeira nobre polida para assento
        [-0.15, 0, 0.15].forEach((sz) => {
          const slatAssento = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.12), matMadeiraSlats);
          slatAssento.position.set(0, 0.52, sz);
          slatAssento.castShadow = true;
          b.add(slatAssento);
        });

        // Ripas de madeira para o encosto
        [0.7, 0.85, 1.0].forEach((sy) => {
          const slatEncosto = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.04), matMadeiraSlats);
          slatEncosto.position.set(0, sy, -0.25);
          slatEncosto.castShadow = true;
          b.add(slatEncosto);
        });

        return b;
      }

      grpParque.add(criarBancoVitoriano(2.2, -2, -Math.PI / 2));
      grpParque.add(criarBancoVitoriano(2.2, 4, -Math.PI / 2));
      grpParque.add(criarBancoVitoriano(2.2, -6, -Math.PI / 2));
      grpParque.add(criarBancoVitoriano(-2.5, -6, Math.PI / 2));

      // Toalha de piquenique com cesta e frutas
      const toalha = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 3.6),
        kit.mat('lambert', 0xef5350)
      );
      toalha.rotation.x = -Math.PI / 2;
      toalha.position.set(-2.2, 0.07, 3);
      grpParque.add(toalha);

      const toalhaCentro = new THREE.Mesh(
        new THREE.PlaneGeometry(2.9, 2.9),
        kit.mat('lambert', 0xffffff)
      );
      toalhaCentro.rotation.x = -Math.PI / 2;
      toalhaCentro.position.set(-2.2, 0.075, 3);
      grpParque.add(toalhaCentro);

      const cesta = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.65, 0.65),
        kit.mat('lambert', 0x8d6e63)
      );
      cesta.position.set(-2.4, 0.38, 3.2);
      cesta.castShadow = true;
      cesta.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '🧺 Piquenique ao ar livre: toalha com frutas e lanches para o passeio em família aos domingos.',
        som: 'pop'
      };
      grpParque.add(cesta);

      const maca1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        kit.mat('lambert', 0xd32f2f)
      );
      maca1.position.set(-1.6, 0.18, 2.7);
      grpParque.add(maca1);

      const maca2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        kit.mat('lambert', 0xffeb3b)
      );
      maca2.position.set(-1.9, 0.18, 2.6);
      grpParque.add(maca2);

      // Cerca clássica do parque
      grpParque.add(kit.criarCerca(-10, 0, 32, true, 0x8d6e63));
      grpParque.add(kit.criarCerca(0, 16, 20, false, 0x8d6e63));
      grpParque.add(kit.criarCerca(0, -16, 20, false, 0x8d6e63));

      // Placa identificando o parque
      grpParque.add(kit.criarPlaca(0, 8, 'JARDIM DA LUZ (1910)', 0x2e7d32));

      // Lampiões a gás vitorianos no Jardim da Luz com cones de luz e piscinas de luz no caminho de cascalho
      grpParque.add(criarPosteAntigo(1.8, 0, 0xffd54f, 0.85, 8.5, true));
      grpParque.add(criarPosteAntigo(1.8, -8, 0xffd54f, 0.85, 8.5, true));
      grpParque.add(criarPosteAntigo(1.8, 8, 0xffd54f, 0.85, 8.5, true));
      grpParque.add(criarPosteAntigo(-1.8, -4, 0xffd54f, 0.85, 8.5, true));
      grpParque.add(criarPosteAntigo(-1.8, 4, 0xffd54f, 0.85, 8.5, true));

      scene.add(grpParque);

      // ==========================================
      // LADO DIREITO: Cidade com Cinema Antigo (1895 - 1937)
      // ==========================================
      const grpCidade = new THREE.Group();
      grpCidade.position.set(14, 0, 0);

      // Calçada de pedestres
      const calcada = kit.criarChao(22, 34, 0xb0bec5);
      calcada.position.y = 0.05;
      grpCidade.add(calcada);

      // --- 3. FACHADA ART DÉCO DO CINEMA CINE GLÓRIA COM MARQUISE DOURADA E CARTAZES RETRÔ ---
      const predioCinema = new THREE.Group();
      predioCinema.position.set(0, 0, -4);

      // Fachada principal Art Déco escalonada (zigurate) em tom elegante terracota/coral suave
      const fachada = new THREE.Mesh(
        new THREE.BoxGeometry(11, 7.5, 8),
        kit.mat('lambert', 0xffcdd2)
      );
      fachada.position.y = 3.75;
      fachada.castShadow = true;
      predioCinema.add(fachada);

      // Pilastras geométricas verticais clássicas Art Déco com caneluras e capitéis facetados
      const matPilastra = kit.mat('lambert', 0xb0bec5);
      const matFrisoDeco = kit.mat('phong', 0xffd54f, { shininess: 90, specular: 0xffffff });

      [-4.5, -1.8, 1.8, 4.5].forEach((px) => {
        const pilastra = new THREE.Mesh(new THREE.BoxGeometry(0.55, 8.2, 0.4), matPilastra);
        pilastra.position.set(px, 4.1, 4.15);
        pilastra.castShadow = true;
        predioCinema.add(pilastra);

        // Caneluras verticais douradas Art Déco
        const canelura = new THREE.Mesh(new THREE.BoxGeometry(0.18, 7.4, 0.08), matFrisoDeco);
        canelura.position.set(px, 4.1, 4.36);
        predioCinema.add(canelura);

        // Capitel geométrico Art Déco no topo da pilastra
        const capitelDeco = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.35, 0.5), matFrisoDeco);
        capitelDeco.position.set(px, 8.25, 4.15);
        predioCinema.add(capitelDeco);
      });

      // Frontão superior escalonado Art Déco com molduras e relevos em zigurate
      const frontao1 = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.9, 8.4), kit.mat('lambert', 0xc62828));
      frontao1.position.y = 7.95;
      predioCinema.add(frontao1);

      const frontao2 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.2, 8.5), kit.mat('lambert', 0xb71c1c));
      frontao2.position.y = 8.95;
      predioCinema.add(frontao2);

      const frontaoZiggurat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 8.55), kit.mat('lambert', 0x8e0000));
      frontaoZiggurat.position.y = 10.05;
      predioCinema.add(frontaoZiggurat);

      // Medalhão ornamental Art Déco "CINE GLÓRIA" em latão dourado no topo do frontão
      const medalhaoDeco = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 16), matFrisoDeco);
      medalhaoDeco.rotation.x = Math.PI / 2;
      medalhaoDeco.position.set(0, 9.9, 4.32);
      predioCinema.add(medalhaoDeco);

      const discoInternoMedalhao = new THREE.Mesh(new THREE.CircleGeometry(0.82, 16), kit.mat('basic', 0xb71c1c));
      discoInternoMedalhao.position.set(0, 9.9, 4.4);
      predioCinema.add(discoInternoMedalhao);

      // Raios de sol geométricos Art Déco (Sunburst motif)
      for (let r = 0; r < 7; r++) {
        const raioAng = -Math.PI * 0.4 + (r / 6) * Math.PI * 0.8;
        const raioMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.04), matFrisoDeco);
        raioMesh.position.set(Math.sin(raioAng) * 0.5, 9.9 + Math.cos(raioAng) * 0.5, 4.41);
        raioMesh.rotation.z = -raioAng;
        predioCinema.add(raioMesh);
      }

      // Portas duplas de entrada do cinema em madeira nobre e vidro bisotado
      const portaCinema = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 0.2), kit.mat('lambert', 0x3e2723));
      portaCinema.position.set(0, 1.3, 4.05);
      predioCinema.add(portaCinema);

      // Puxadores verticais em latão dourado nas portas
      [-0.45, 0.45].forEach((px) => {
        const puxador = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 6), matFrisoDeco);
        puxador.position.set(px, 1.3, 4.18);
        predioCinema.add(puxador);
      });

      // --- MARQUISE DOURADA ART DÉCO CANTILEVER ---
      // Estrutura principal da marquise com acabamento em latão dourado polido
      const matMarquiseDourada = kit.mat('phong', 0xffd54f, { shininess: 95, specular: 0xffffff });
      const matMarquiseBase = kit.mat('lambert', 0x2b2b2b);

      const marquise = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.55, 3.2), matMarquiseBase);
      marquise.position.set(0, 3.2, 5.2);
      marquise.castShadow = true;
      predioCinema.add(marquise);

      // Moldura e testeira frontal em latão dourado polido com frisos Art Déco
      const bordaDouradaFrente = new THREE.Mesh(new THREE.BoxGeometry(6.75, 0.62, 0.12), matMarquiseDourada);
      bordaDouradaFrente.position.set(0, 3.2, 6.82);
      predioCinema.add(bordaDouradaFrente);

      const bordaDouradaEsq = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 3.26), matMarquiseDourada);
      bordaDouradaEsq.position.set(-3.34, 3.2, 5.2);
      predioCinema.add(bordaDouradaEsq);

      const bordaDouradaDir = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 3.26), matMarquiseDourada);
      bordaDouradaDir.position.set(3.34, 3.2, 5.2);
      predioCinema.add(bordaDouradaDir);

      // Plafond dourado inferior iluminado no intradorso da marquise
      const plafondDourado = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.0), matMarquiseDourada);
      plafondDourado.rotation.x = Math.PI / 2;
      plafondDourado.position.set(0, 2.91, 5.2);
      predioCinema.add(plafondDourado);

      // Lâmpadas retrô de perseguição (chase lights) no perímetro da marquise dourada
      const lampadasMarquise = [];
      const posicoesMarquise = [];

      // Borda frontal (esquerda para a direita)
      for (let mx = -3.0; mx <= 3.0; mx += 0.6) {
        posicoesMarquise.push({ x: mx, y: 2.88, z: 6.88 });
      }
      // Borda lateral direita (frente para trás)
      for (let mz = 6.2; mz >= 4.0; mz -= 0.65) {
        posicoesMarquise.push({ x: 3.38, y: 2.88, z: mz });
      }
      // Borda lateral esquerda (trás para frente)
      for (let mz = 4.0; mz <= 6.2; mz += 0.65) {
        posicoesMarquise.push({ x: -3.38, y: 2.88, z: mz });
      }

      posicoesMarquise.forEach((p, idx) => {
        const matBulbo = new THREE.MeshBasicMaterial({ color: 0xffe082 });
        const lampadaM = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), matBulbo);
        lampadaM.position.set(p.x, p.y, p.z);
        lampadaM.userData = { chaseIdx: idx };
        predioCinema.add(lampadaM);
        lampadasMarquise.push(lampadaM);
      });

      // Brilho dourado suave irradiado da marquise
      const luzMarquise = new THREE.PointLight(0xffb74d, 1.15, 10.0);
      luzMarquise.position.set(0, 3.4, 5.5);
      predioCinema.add(luzMarquise);

      // Piscina de luz acolhedora no piso em frente à entrada do cinema
      const piscinaCinemaMat = kit.mat('basic', 0xffb74d, { transparent: true, opacity: 0.26, depthWrite: false });
      const piscinaCinema = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 3.8), piscinaCinemaMat);
      piscinaCinema.rotation.x = -Math.PI / 2;
      piscinaCinema.position.set(0, 0.06, 5.6);
      predioCinema.add(piscinaCinema);

      // Letreiro luminoso "CINE GLÓRIA" com efeito acolhedor, halo e moldura Art Déco
      const letreiroBase = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.1, 0.25), matFrisoDeco);
      letreiroBase.position.set(0, 4.1, 5.25);
      predioCinema.add(letreiroBase);

      const letreiroLuzMat = kit.mat('basic', 0xff9800, { transparent: true, opacity: 0.95 });
      const letreiroLuz = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.7, 0.3), letreiroLuzMat);
      letreiroLuz.position.set(0, 4.1, 5.28);
      predioCinema.add(letreiroLuz);

      const haloLetreiroMat = kit.mat('basic', 0xffb74d, { transparent: true, opacity: 0.28, depthWrite: false });
      const haloLetreiro = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.2), haloLetreiroMat);
      haloLetreiro.position.set(0, 4.1, 5.32);
      predioCinema.add(haloLetreiro);

      // Luz pontual acolhedora do letreiro banhando a fachada Art Déco
      const luzLetreiroCinema = new THREE.PointLight(0xffb74d, 1.2, 9.0);
      luzLetreiroCinema.position.set(0, 4.1, 5.6);
      predioCinema.add(luzLetreiroCinema);

      // Três cartazes de cinema retrô com molduras ornamentais (1895, 1927, 1937)
      function criarCartazRetro(cx, cy, cz, textoAno, titulo, corMoldura) {
        const cGrp = new THREE.Group();
        cGrp.position.set(cx, cy, cz);
        cGrp.userData = {
          interativo: true,
          nome: `🖼️ Cartaz histórico (${textoAno}): ${titulo}`,
          som: 'pop'
        };

        // Moldura em relevo
        const moldura = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.9, 0.08), kit.mat('lambert', corMoldura));
        cGrp.add(moldura);

        // Fundo do cartaz
        const papelCartaz = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.7, 0.1), kit.mat('basic', 0xfffde7));
        papelCartaz.position.z = 0.02;
        cGrp.add(papelCartaz);

        // Barra ilustrativa simulando imagem de época
        const barraArte = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.11), kit.mat('lambert', corMoldura));
        barraArte.position.set(0, 0.2, 0.03);
        cGrp.add(barraArte);

        // Fita inferior do título
        const fitaTexto = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.25, 0.11), kit.mat('basic', 0x212121));
        fitaTexto.position.set(0, -0.5, 0.03);
        cGrp.add(fitaTexto);

        return cGrp;
      }

      // Cartaz 1895: Cinema Mudo (Irmãos Lumière)
      const cartaz1895 = criarCartazRetro(-3.3, 2.2, 4.1, '1895', 'Cinema Mudo dos Irmãos Lumière (preto e branco)', 0x455a64);
      predioCinema.add(cartaz1895);

      // Cartaz 1927: Cinema Sonoro (O Cantor de Jazz)
      const cartaz1927 = criarCartazRetro(3.3, 2.2, 4.1, '1927', 'O Cantor de Jazz (primeiro filme com diálogos sonoros)', 0xffb300);
      predioCinema.add(cartaz1927);

      // Cartaz 1937: Animação Colorida (Branca de Neve)
      const cartaz1937 = criarCartazRetro(0, 1.8, 6.75, '1937', 'Branca de Neve e os Sete Anões (famoso filme colorido)', 0xd32f2f);
      predioCinema.add(cartaz1937);

      predioCinema.userData = {
        interativo: true,
        pistaMissao: 2,
        nome: '🎬 Cinema Antigo Cine Glória (1895-1937): exibia os clássicos mudos dos irmãos Lumière, os primeiros sonoros e animações coloridas.',
        som: 'pelicula',
        aoClicar: function () {
          predioCinema.userData.luzAcesaAte = performance.now() * 0.001 + 2.6;
        }
      };
      fachada.userData = predioCinema.userData;
      grpCidade.add(predioCinema);

      const sombraCinema = kit.criarSombraDeContato(0, -3.5, 6.2, 5.0, 0.45);
      grpCidade.add(sombraCinema);

      // --- 4. PROJETOR DE CINEMA 35MM DETALHADO COM CARRETÉIS DUPLOS E TELA EXTERNA ---
      const cineOutdoorGrp = new THREE.Group();
      cineOutdoorGrp.position.set(-2.5, 0, 7.5);

      // Tripé de ferro fundido do projetor com sapatas
      const matTripe = kit.mat('lambert', 0x263238);
      [
        { rotZ: 0.18, posX: -0.3, posZ: 0.2 },
        { rotZ: -0.18, posX: 0.3, posZ: 0.2 },
        { rotX: -0.22, posX: 0, posZ: -0.35 }
      ].forEach((p) => {
        const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 6), matTripe);
        perna.position.set(p.posX, 0.8, p.posZ);
        if (p.rotZ) perna.rotation.z = p.rotZ;
        if (p.rotX) perna.rotation.x = p.rotX;
        cineOutdoorGrp.add(perna);
      });

      // Lanterna de projeção e corpo mecânico do projetor 35mm
      const corpoProjetor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.70, 0.78), kit.mat('lambert', 0x37474f));
      corpoProjetor.position.set(0, 1.75, 0);
      corpoProjetor.castShadow = true;
      cineOutdoorGrp.add(corpoProjetor);

      // Chaminé cilíndrica de exaustão de calor da lâmpada de arco de projeção
      const chamineProjetor = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.35, 8), kit.mat('lambert', 0x212121));
      chamineProjetor.position.set(0, 2.22, -0.1);
      cineOutdoorGrp.add(chamineProjetor);

      // Torre de lente óptica cilíndrica apontando para a tela externa
      const lenteProjetor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.38, 12), kit.mat('phong', 0xffd54f, { shininess: 90, specular: 0xffffff }));
      lenteProjetor.rotation.x = Math.PI / 2;
      lenteProjetor.position.set(0, 1.85, 0.46);
      cineOutdoorGrp.add(lenteProjetor);

      // CARRETÉIS DUPLOS DETALHADOS DE FILME 35MM (Carretel alimentador superior e carretel recolhedor inferior)
      const bobinasFilme = [];
      const matCarretelMetal = kit.mat('phong', 0xffd54f, { shininess: 90, specular: 0xffffff });
      const matPeliculaCeluloide = kit.mat('phong', 0x4e342e, { opacity: 0.92, transparent: true, shininess: 80 });

      [
        { y: 2.32, z: -0.15, isSuperior: true }, // Carretel alimentador superior
        { y: 1.18, z: -0.15, isSuperior: false } // Carretel recolhedor inferior
      ].forEach((bPos) => {
        const grpCarretel = new THREE.Group();
        grpCarretel.position.set(0.24, bPos.y, bPos.z);

        // Flange lateral externa do carretel com raios vazados
        const flange1 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 14), matCarretelMetal);
        flange1.rotation.z = Math.PI / 2;
        flange1.position.x = 0.035;
        grpCarretel.add(flange1);

        // Flange lateral interna do carretel
        const flange2 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 14), matCarretelMetal);
        flange2.rotation.z = Math.PI / 2;
        flange2.position.x = -0.035;
        grpCarretel.add(flange2);

        // Rolo espesso de película 35mm em celuloide enrolado entre os aros do carretel
        const roloPelicula = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 14), matPeliculaCeluloide);
        roloPelicula.rotation.z = Math.PI / 2;
        grpCarretel.add(roloPelicula);

        // Eixo central cromado
        const eixoCarretel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 8), matCarretelMetal);
        eixoCarretel.rotation.z = Math.PI / 2;
        grpCarretel.add(eixoCarretel);

        cineOutdoorGrp.add(grpCarretel);
        bobinasFilme.push(grpCarretel);
      });

      // Fita de celuloide 35mm passando pela janela de projeção do obturador
      const fitaPelicula = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.1, 0.06), matPeliculaCeluloide);
      fitaPelicula.position.set(0.24, 1.75, 0.12);
      cineOutdoorGrp.add(fitaPelicula);

      // Manivela lateral em bronze torneado
      const manivelaEixo = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 6), matCarretelMetal);
      manivelaEixo.rotation.z = Math.PI / 2;
      manivelaEixo.position.set(-0.32, 1.75, 0);
      cineOutdoorGrp.add(manivelaEixo);

      const manivelaBraco = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.03), matCarretelMetal);
      manivelaBraco.position.set(-0.46, 1.82, 0);
      cineOutdoorGrp.add(manivelaBraco);

      // Feixe de luz volumétrico cônico luminoso emitido pelo projetor em direção à tela
      const feixeGeo = new THREE.ConeGeometry(1.65, 6.2, 16, 1, true);
      const feixeMat = kit.mat('basic', 0xfff9c4, {
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const feixeLuz = new THREE.Mesh(feixeGeo, feixeMat);
      feixeLuz.rotation.x = -Math.PI / 2;
      feixeLuz.position.set(0, 1.85, 3.4);
      cineOutdoorGrp.add(feixeLuz);

      // Núcleo brilhante interno do feixe de projeção de cinema
      const feixeCoreGeo = new THREE.ConeGeometry(1.15, 6.2, 16, 1, true);
      const feixeCoreMat = kit.mat('basic', 0xfffde7, {
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const feixeCore = new THREE.Mesh(feixeCoreGeo, feixeCoreMat);
      feixeCore.rotation.x = -Math.PI / 2;
      feixeCore.position.set(0, 1.85, 3.4);
      cineOutdoorGrp.add(feixeCore);

      // Lente óptica incandescente do projetor
      const lenteGlow = new THREE.Mesh(new THREE.CircleGeometry(0.13, 14), kit.mat('basic', 0xffffff));
      lenteGlow.position.set(0, 1.85, 0.66);
      cineOutdoorGrp.add(lenteGlow);

      // Ponto de luz da projeção
      const luzProjecao = new THREE.PointLight(0xfff59d, 0.85, 8.0);
      luzProjecao.position.set(0, 1.85, 1.2);
      cineOutdoorGrp.add(luzProjecao);

      // Luz refletida iluminando a tela e o fotograma
      const luzTela = new THREE.PointLight(0xfffde7, 0.75, 4.5);
      luzTela.position.set(0, 1.9, 6.2);
      cineOutdoorGrp.add(luzTela);

      // Tela ao ar livre de cinema antigo
      const telaArmacao = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.5, 0.15), kit.mat('lambert', 0x5d4037));
      telaArmacao.position.set(0, 1.9, 6.4);
      telaArmacao.castShadow = true;
      cineOutdoorGrp.add(telaArmacao);

      const telaBranca = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.1, 0.16), kit.mat('basic', 0xffffff));
      telaBranca.position.set(0, 1.9, 6.41);
      cineOutdoorGrp.add(telaBranca);

      // Círculo central com fotograma retrô na tela
      const circuloFotograma = new THREE.Mesh(new THREE.CircleGeometry(0.65, 16), kit.mat('basic', 0x212121));
      circuloFotograma.position.set(0, 1.9, 6.5);
      cineOutdoorGrp.add(circuloFotograma);

      const pontoCentroTela = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), kit.mat('basic', 0xffffff));
      pontoCentroTela.position.set(0, 1.9, 6.51);
      cineOutdoorGrp.add(pontoCentroTela);

      // Pés de suporte da tela externa
      [-1.5, 1.5].forEach((tx) => {
        const peTela = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.6), kit.mat('lambert', 0x5d4037));
        peTela.position.set(tx, 0.6, 6.4);
        cineOutdoorGrp.add(peTela);
      });

      cineOutdoorGrp.userData = {
        interativo: true,
        pistaMissao: 2,
        nome: '📽️ Projetor 35mm com carretéis duplos de filme e tela externa: exibia os fotogramas clássicos de cinema com feixe de luz mágica.',
        som: 'pelicula',
        aoClicar: function () {
          predioCinema.userData.luzAcesaAte = performance.now() * 0.001 + 2.6;
        }
      };
      grpCidade.add(cineOutdoorGrp);

      // Prédios vizinhos antigos completando a rua histórica (Missão 5: Comércio e Vida Urbana)
      const predioEsq = kit.criarPredio(5.5, 8.5, 7, 0x90a4ae);
      predioEsq.position.set(-8.5, 0, -4);
      predioEsq.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '🏙️ Edifício residencial histórico: casarão antigo preservado no centro da cidade.',
        som: 'pop',
        aoClicar: function (alvo) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
        }
      };
      grpCidade.add(predioEsq);

      const predioDir = kit.criarPredio(5.5, 9.5, 7, 0x8d6e63);
      predioDir.position.set(8.5, 0, -4);
      predioDir.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '🏙️ Edifício comercial de época: comércio tradicional e empório das ruas históricas de São Paulo.',
        som: 'sino',
        aoClicar: function (alvo, Kit3D) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
          if (Kit3D && Kit3D.Audio && typeof Kit3D.Audio.sino === 'function') {
            Kit3D.Audio.sino();
          }
        }
      };
      // Toldo de época listrado e vitrine no térreo da loja histórica
      const toldoLoja = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.22, 1.8), kit.mat('lambert', 0xb71c1c));
      toldoLoja.position.set(0, 2.5, 3.8);
      toldoLoja.rotation.x = 0.25;
      predioDir.add(toldoLoja);

      const vitrineLoja = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.15), kit.mat('phong', 0xfff9c4, { opacity: 0.92, transparent: true, shininess: 85 }));
      vitrineLoja.position.set(0, 1.2, 3.55);
      predioDir.add(vitrineLoja);

      grpCidade.add(predioDir);

      // Postes de luz clássicos com cone de luz na calçada da cidade
      grpCidade.add(criarPosteAntigo(-4, 3, 0xffd54f, 0.75, 7, true));
      grpCidade.add(criarPosteAntigo(4, 3, 0xffd54f, 0.75, 7, true));
      grpCidade.add(criarPosteAntigo(-4, 11, 0xffd54f, 0.75, 7, true));
      grpCidade.add(criarPosteAntigo(4, 11, 0xffd54f, 0.75, 7, true));

      // Placa identificando a cidade
      grpCidade.add(kit.criarPlaca(0, 14, 'CINEMA DA CIDADE', 0xb71c1c));
      scene.add(grpCidade);

      // ==========================================
      // VEÍCULOS DE ÉPOCA: Bondinho Amarelo de 1910 e Carro Clássico
      // ==========================================
      // --- 5. BONDE ELÉTRICO AMARELO CLÁSSICO DE 1910 (Missão 0: Bonde Elétrico de 1910) ---
      const bonde = new THREE.Group();
      bonde.userData = {
        interativo: true,
        pistaMissao: 0,
        nome: '🚋 Bonde elétrico de 1910: veículo amarelo sobre trilhos que transportava as famílias de São Paulo com segurança e charme.',
        som: 'sino',
        aoClicar: function (alvo, Kit3D) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 2.2;
          if (Kit3D && Kit3D.Audio && typeof Kit3D.Audio.sino === 'function') {
            Kit3D.Audio.sino();
          }
        }
      };

      const bondeChassi = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.4, 7.2),
        kit.mat('lambert', 0x37474f)
      );
      bondeChassi.position.y = 0.5;
      bonde.add(bondeChassi);

      // Cabine amarela clássica com faixa vermelha tradicional
      const bondeCabine = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.8, 6.8),
        kit.mat('lambert', 0xfbc02d)
      );
      bondeCabine.position.y = 1.5;
      bondeCabine.castShadow = true;
      bonde.add(bondeCabine);

      const bondeFaixa = new THREE.Mesh(
        new THREE.BoxGeometry(2.45, 0.35, 6.85),
        kit.mat('lambert', 0xb71c1c)
      );
      bondeFaixa.position.y = 1.1;
      bonde.add(bondeFaixa);

      // FRISOS DE LATÃO POLIDO: contornos metálicos dourados reluzentes ao redor da cabine e saias
      const matLataoBonde = kit.mat('phong', 0xffd54f, { shininess: 95, specular: 0xffffff });
      const frisoSuperiorBonde = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.05, 6.9), matLataoBonde);
      frisoSuperiorBonde.position.y = 2.22;
      bonde.add(frisoSuperiorBonde);

      const frisoMeioBonde = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.04, 6.9), matLataoBonde);
      frisoMeioBonde.position.y = 1.30;
      bonde.add(frisoMeioBonde);

      const frisoInferiorBonde = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.04, 6.9), matLataoBonde);
      frisoInferiorBonde.position.y = 0.92;
      bonde.add(frisoInferiorBonde);

      // Corrimãos verticais de latão polido nas plataformas abertas dianteira e traseira
      [
        [-1.05, 3.2], [1.05, 3.2],   // Plataforma frontal
        [-1.05, -3.2], [1.05, -3.2]  // Plataforma traseira
      ].forEach(([hx, hz]) => {
        const corrimao = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.35, 6), matLataoBonde);
        corrimao.position.set(hx, 1.35, hz);
        bonde.add(corrimao);
      });

      // Manete do condutor de latão na plataforma frontal (reostato e freio de mão clássico)
      const colunaReostato = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.85, 8), kit.mat('lambert', 0x37474f));
      colunaReostato.position.set(-0.4, 1.1, 3.1);
      bonde.add(colunaReostato);

      const maneteLatao = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.04), matLataoBonde);
      maneteLatao.position.set(-0.35, 1.54, 3.1);
      bonde.add(maneteLatao);

      // JANELAS COM MOLDURAS DE MADEIRA NOBRE E VIDROS TRANSLÚCIDOS
      const matMolduraMadeira = kit.mat('lambert', 0x4e342e);
      const matVidroBonde = kit.mat('phong', 0xe0f7fa, {
        opacity: 0.65,
        transparent: true,
        shininess: 95,
        specular: 0xffffff
      });

      // Recorte interior e vidros translúcidos laterais
      [-1.21, 1.21].forEach((wx) => {
        // Painel contínuo de vidro translúcido
        const vidroLateral = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 5.8), matVidroBonde);
        vidroLateral.position.set(wx, 1.75, 0);
        bonde.add(vidroLateral);

        // Molduras e pilaretes de madeira esculpida separando os 6 vãos de janela
        for (let m = -2.5; m <= 2.5; m += 1.0) {
          const pilarMadeira = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.76, 0.12), matMolduraMadeira);
          pilarMadeira.position.set(wx, 1.75, m);
          bonde.add(pilarMadeira);
        }

        // Guarnições superior e inferior de madeira da janela
        const guarnicaoSup = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 5.9), matMolduraMadeira);
        guarnicaoSup.position.set(wx, 2.13, 0);
        bonde.add(guarnicaoSup);

        const guarnicaoInf = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 5.9), matMolduraMadeira);
        guarnicaoInf.position.set(wx, 1.37, 0);
        bonde.add(guarnicaoInf);
      });

      // Vidro frontal do condutor
      const vidroFrontalBonde = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.04), matVidroBonde);
      vidroFrontalBonde.position.set(0, 1.75, 3.42);
      bonde.add(vidroFrontalBonde);

      // Bancos internos longitudinais de ripas de palhinha/madeira vistos através do vidro
      const matBancoBonde = kit.mat('lambert', 0x8d6e63);
      [-0.75, 0.75].forEach((bx) => {
        const banco = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 5.2), matBancoBonde);
        banco.position.set(bx, 0.88, 0);
        bonde.add(banco);
      });

      // Teto clerestory clássico em dois níveis com venezianas
      const bondeTelhadoBase = new THREE.Mesh(
        new THREE.BoxGeometry(2.55, 0.25, 7.0),
        kit.mat('lambert', 0x5d4037)
      );
      bondeTelhadoBase.position.y = 2.45;
      bonde.add(bondeTelhadoBase);

      const bondeMonitorTeto = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.25, 5.8),
        kit.mat('lambert', 0xfff9c4)
      );
      bondeMonitorTeto.position.y = 2.65;
      bonde.add(bondeMonitorTeto);

      // Placa de destino na frente do bonde: "JARDIM DA LUZ · CENTRO"
      const placaDestino = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.32, 0.1),
        kit.mat('basic', 0xffffff)
      );
      placaDestino.position.set(0, 2.35, 3.42);
      bonde.add(placaDestino);

      // Alavanca / haste pantográfica do bonde tocando o fio aéreo
      const bondeHaste = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6),
        kit.mat('lambert', 0x212121)
      );
      bondeHaste.position.set(0, 3.3, -1.0);
      bondeHaste.rotation.x = Math.PI * 0.25;
      bonde.add(bondeHaste);

      const roldanaContato = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 6, 6),
        matLataoBonde
      );
      roldanaContato.position.set(0, 3.8, -1.5);
      bonde.add(roldanaContato);

      // --- FAROL DE ARCO VOLTAICO FRONTAL DE 1910 ---
      // Carcaça de bronze fundido
      const farolBonde = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.28, 14),
        kit.mat('phong', 0x5d4037, { shininess: 85 })
      );
      farolBonde.rotation.x = Math.PI / 2;
      farolBonde.position.set(0, 1.1, 3.5);
      bonde.add(farolBonde);

      // Aro frontal espesso de latão polido
      const aroFarolLatao = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 8, 16), matLataoBonde);
      aroFarolLatao.position.set(0, 1.1, 3.64);
      bonde.add(aroFarolLatao);

      // Refletor parabólico interno cromado espelhado
      const refletorFarol = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        kit.mat('phong', 0xffffff, { shininess: 100, specular: 0xffffff, side: THREE.BackSide })
      );
      refletorFarol.rotation.x = -Math.PI / 2;
      refletorFarol.position.set(0, 1.1, 3.55);
      bonde.add(refletorFarol);

      // Ponto de centelha / eletrodos de carbono de arco voltaico incandescente branca-azulada
      const centelhaArco = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        kit.mat('basic', 0xffffff)
      );
      centelhaArco.position.set(0, 1.1, 3.6);
      bonde.add(centelhaArco);

      // Lente convexa de vidro de época
      const lenteFarol = new THREE.Mesh(
        new THREE.CircleGeometry(0.28, 16),
        kit.mat('phong', 0xe1f5fe, { transparent: true, opacity: 0.92, shininess: 95, specular: 0xffffff })
      );
      lenteFarol.position.set(0, 1.1, 3.65);
      bonde.add(lenteFarol);

      // Halo luminoso frontal da lente do farol de arco voltaico (branco-azulado brilhante)
      const haloFarolBonde = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 12, 12),
        kit.mat('basic', 0xe1f5fe, { transparent: true, opacity: 0.40, depthWrite: false })
      );
      haloFarolBonde.position.set(0, 1.1, 3.68);
      bonde.add(haloFarolBonde);

      // Facho volumétrico cônico emitido pelo arco voltaico para frente ao longo dos trilhos
      const fachoFarolGeo = new THREE.ConeGeometry(1.65, 8.2, 16, 1, true);
      const fachoFarolMat = kit.mat('basic', 0xe1f5fe, {
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const fachoFarolBonde = new THREE.Mesh(fachoFarolGeo, fachoFarolMat);
      fachoFarolBonde.rotation.x = -Math.PI / 2;
      fachoFarolBonde.position.set(0, 1.1, 7.6);
      bonde.add(fachoFarolBonde);

      // Piscina de luz branca-dourada projetada nos dormentes e trilhos à frente do bonde
      const poolTrilhos = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 7.2),
        kit.mat('basic', 0xe1f5fe, { transparent: true, opacity: 0.28, depthWrite: false })
      );
      poolTrilhos.rotation.x = -Math.PI / 2;
      poolTrilhos.position.set(0, 0.08, 7.2);
      bonde.add(poolTrilhos);

      // Luz brilhante suave do arco voltaico do bonde de 1910 iluminando os trilhos à frente
      const luzFarolBonde = new THREE.PointLight(0xe1f5fe, 1.35, 12.0);
      luzFarolBonde.position.set(0, 1.1, 4.2);
      bonde.add(luzFarolBonde);

      // Rodas de ferro do bonde
      const rodaBondeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
      const rodaBondeMat = kit.mat('lambert', 0x212121);
      [[-1.0, 2.0], [1.0, 2.0], [-1.0, -2.0], [1.0, -2.0]].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rodaBondeGeo, rodaBondeMat);
        r.rotation.z = Math.PI / 2;
        r.position.set(rx, 0.35, rz);
        bonde.add(r);
      });
      bonde.position.set(0, 0, 4);
      scene.add(bonde);

      // Sombra de contato suave sob o bonde
      const sombraBonde = kit.criarSombraDeContato(0, 4, 1.8, 4.2, 0.48);
      scene.add(sombraBonde);

      // Carro clássico vintage estacionado perto do cinema
      const carro = new THREE.Group();
      const carroChassi = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.4, 4.4),
        kit.mat('lambert', 0x212121)
      );
      carroChassi.position.y = 0.5;
      carro.add(carroChassi);

      const carroCabine = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.3, 2.0),
        kit.mat('lambert', 0x1a237e)
      );
      carroCabine.position.set(0, 1.4, -0.6);
      carroCabine.castShadow = true;
      carro.add(carroCabine);

      const carroCapo = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.9, 1.8),
        kit.mat('lambert', 0x1a237e)
      );
      carroCapo.position.set(0, 1.0, 1.2);
      carroCapo.castShadow = true;
      carro.add(carroCapo);

      const radiador = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.8, 0.1),
        kit.mat('lambert', 0xb0bec5)
      );
      radiador.position.set(0, 1.0, 2.15);
      carro.add(radiador);

      const farolMat = kit.mat('lambert', 0xfff59d);
      const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), farolMat);
      f1.position.set(-0.7, 1.1, 2.15);
      carro.add(f1);
      const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), farolMat);
      f2.position.set(0.7, 1.1, 2.15);
      carro.add(f2);

      const rodaCarroGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 12);
      const rodaCarroMat = kit.mat('lambert', 0x212121);
      [[-1.15, 1.2], [1.15, 1.2], [-1.15, -1.2], [1.15, -1.2]].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rodaCarroGeo, rodaCarroMat);
        r.rotation.z = Math.PI / 2;
        r.position.set(rx, 0.48, rz);
        carro.add(r);
      });
      carro.position.set(13, 0, 8);
      carro.rotation.y = -Math.PI * 0.15;
      carro.userData = {
        interativo: true,
        nome: '🚗 Automóvel clássico de 1910: veículo antigo com faróis arredondados e buzina de época.',
        som: 'buzina',
        aoClicar: function (alvo, Kit3D) {
          alvo.userData.vibrarAte = performance.now() * 0.001 + 2.0;
          if (Kit3D && Kit3D.Audio && typeof Kit3D.Audio.buzina === 'function') {
            Kit3D.Audio.buzina();
          }
        }
      };
      scene.add(carro);

      // Sombra de contato suave e alinhada sob o automóvel clássico
      const sombraCarro = kit.criarSombraContato(13, 8, 1.8, 3.2, 0.46);
      sombraCarro.rotation.z = -Math.PI * 0.15;
      sombraCarro.position.y = 0.04;
      scene.add(sombraCarro);

      // Animações sutis e agradáveis com feedback reativo ao toque (TEA-friendly: acolhedor e harmonioso)
      animaveis.push((now) => {
        // 1. Bonde elétrico nos trilhos: balanço suave, pulso reforçado do farol e balanço ao toque com sineta
        const bondeReagindo = bonde.userData && bonde.userData.reacaoToqueAte > now;
        bonde.position.z = 2 + Math.sin(now * 0.35) * 5.2;
        sombraBonde.position.z = bonde.position.z;

        if (bondeReagindo) {
          bonde.rotation.z = Math.sin(now * 14) * 0.035; // leve balanço reativo nos trilhos
          bonde.position.y = Math.abs(Math.sin(now * 12)) * 0.035;
        } else {
          bonde.rotation.z = Math.sin(now * 0.7) * 0.015; // balanço suave sobre os trilhos
          bonde.position.y = 0;
        }

        // Farol luminoso do bonde elétrico de 1910 (pulso reforçado ao toque da sineta)
        if (bondeReagindo) {
          if (luzFarolBonde) luzFarolBonde.intensity = 1.3 + Math.abs(Math.sin(now * 15)) * 1.6;
          if (haloFarolBonde) {
            haloFarolBonde.material.opacity = 0.55 + Math.sin(now * 15) * 0.25;
            haloFarolBonde.scale.setScalar(1.0 + Math.sin(now * 15) * 0.4);
          }
          if (fachoFarolBonde && fachoFarolBonde.material) {
            fachoFarolBonde.material.opacity = 0.40 + Math.sin(now * 15) * 0.15;
          }
        } else {
          if (luzFarolBonde) luzFarolBonde.intensity = 1.25 + Math.sin(now * 2.5) * 0.08;
          if (haloFarolBonde) {
            haloFarolBonde.material.opacity = 0.35 + Math.sin(now * 2.5) * 0.05;
            haloFarolBonde.scale.setScalar(1.0);
          }
          if (fachoFarolBonde && fachoFarolBonde.material) {
            fachoFarolBonde.material.opacity = 0.24 + Math.sin(now * 2.5) * 0.03;
          }
        }

        // 2. Chafariz: pulso calmo ou splash relaxante e revigorante de água ao toque
        const chafarizSplash = (chafarizBase.userData && chafarizBase.userData.splashAte > now) ||
                               (jatoAgua.userData && jatoAgua.userData.splashAte > now) ||
                               (lago.userData && lago.userData.splashAte > now);
        if (chafarizSplash) {
          jatoAgua.scale.y = 1.1 + Math.abs(Math.sin(now * 12)) * 0.55;
          jatoAgua.scale.x = 1.0 + Math.sin(now * 10) * 0.22;
          jatoAgua.scale.z = 1.0 + Math.sin(now * 10) * 0.22;
        } else {
          jatoAgua.scale.y = 0.9 + Math.sin(now * 3.5) * 0.15;
          jatoAgua.scale.x = 1.0;
          jatoAgua.scale.z = 1.0;
        }

        // 3. Cinema Antigo: letreiro luminoso aceso intensamente e película cinematográfica ao toque
        const cinemaAceso = predioCinema.userData && predioCinema.userData.luzAcesaAte > now;

        if (letreiroLuz && letreiroLuz.material) {
          if (cinemaAceso) {
            letreiroLuz.material.opacity = 1.0;
            if (luzLetreiroCinema) luzLetreiroCinema.intensity = 2.4 + Math.sin(now * 16) * 0.35;
            if (haloLetreiroMat) haloLetreiroMat.opacity = 0.55;
            if (luzMarquise) luzMarquise.intensity = 2.0;
            if (piscinaCinemaMat) piscinaCinemaMat.opacity = 0.48;
          } else {
            const tOnda = (Math.sin(now * 1.8) + 1) * 0.5;
            letreiroLuz.material.opacity = 0.85 + tOnda * 0.15;
            if (luzLetreiroCinema) luzLetreiroCinema.intensity = 1.05 + tOnda * 0.25;
            if (haloLetreiroMat) haloLetreiroMat.opacity = 0.24 + tOnda * 0.08;
            if (luzMarquise) luzMarquise.intensity = 1.05;
            if (piscinaCinemaMat) piscinaCinemaMat.opacity = 0.24;
          }
        }

        // Rotação das bobinas do projetor (acelerada suavemente ao tocar o cinema)
        const velBobina = cinemaAceso ? 6.5 : 2.2;
        bobinasFilme.forEach((bob, bIdx) => {
          bob.rotation.x = now * velBobina * (bIdx === 0 ? 1 : 0.9);
        });

        // Feixe de luz volumétrico de projeção de cinema 35mm
        if (feixeLuz && feixeLuz.material) {
          feixeLuz.material.opacity = (cinemaAceso ? 0.38 : 0.22) + Math.sin(now * 7.0) * 0.03 + Math.sin(now * 15.0) * 0.015;
        }
        if (feixeCore && feixeCore.material) {
          feixeCore.material.opacity = (cinemaAceso ? 0.44 : 0.26) + Math.sin(now * 7.0) * 0.04;
        }
        if (luzProjecao) {
          luzProjecao.intensity = (cinemaAceso ? 1.5 : 0.85) + Math.sin(now * 7.0) * 0.06;
        }
        if (luzTela) {
          luzTela.intensity = (cinemaAceso ? 1.35 : 0.75) + Math.sin(now * 7.0) * 0.05;
        }

        // Lâmpadas retrô de perseguição (chase lights) da marquise Art Déco
        if (lampadasMarquise && lampadasMarquise.length) {
          const totalChase = lampadasMarquise.length;
          const velChase = cinemaAceso ? 7.0 : 3.5;
          lampadasMarquise.forEach((lamp) => {
            const idx = lamp.userData.chaseIdx || 0;
            const fase = ((now * velChase - (idx / totalChase) * Math.PI * 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            const ativo = Math.sin(fase) > 0.2;
            lamp.material.color.setHex(ativo ? 0xfff59d : 0xffb74d);
            lamp.scale.setScalar(ativo ? (cinemaAceso ? 1.3 : 1.15) : 0.88);
          });
        }

        // 4. Coreto e instrumentos: brilho aconchegante e pulso musical ao toque
        const coretoReagindo = coreto.userData && coreto.userData.reacaoToqueAte > now;
        if (coretoReagindo) {
          if (luzCoreto) luzCoreto.intensity = 1.25 + Math.sin(now * 12) * 0.55;
          grpTrompete.scale.setScalar(1.0 + Math.sin(now * 10) * 0.12);
          grpTuba.scale.setScalar(1.0 + Math.cos(now * 10) * 0.12);
          coreto.position.y = Math.abs(Math.sin(now * 8)) * 0.035;
        } else {
          if (luzCoreto) luzCoreto.intensity = 1.1 + Math.sin(now * 1.5) * 0.08;
          grpTrompete.scale.setScalar(1.0);
          grpTuba.scale.setScalar(1.0);
          coreto.position.y = 0;
        }

        // 5. Lampiões a gás vitorianos: halo de luz dourada âmbar piscando suavemente ao toque
        postesAntigos.forEach((p) => {
          const el = p.userData && p.userData.elementosLuz;
          if (!el) return;
          const piscar = p.userData && p.userData.piscarAte > now;
          if (piscar) {
            const onda = 0.45 + Math.sin(now * 11) * 0.28;
            if (el.haloLanterna) {
              el.haloLanterna.material.opacity = onda;
              el.haloLanterna.scale.setScalar(1.0 + Math.sin(now * 11) * 0.38);
            }
            if (el.ptLight) {
              el.ptLight.intensity = el.luzInt * (1.3 + Math.sin(now * 11) * 0.6);
            }
            if (el.chamaGas) {
              el.chamaGas.scale.setScalar(1.0 + Math.sin(now * 11) * 0.25);
            }
          } else {
            if (el.haloLanterna) {
              el.haloLanterna.material.opacity = 0.35 + Math.sin(now * 2.0) * 0.05;
              el.haloLanterna.scale.setScalar(1.0);
            }
            if (el.ptLight) {
              el.ptLight.intensity = el.luzInt * (1.0 + Math.sin(now * 2.0) * 0.06);
            }
            if (el.chamaGas) {
              el.chamaGas.scale.setScalar(1.0);
            }
          }
        });

        // 6. Árvores históricas do Jardim da Luz: suave balanço das copas com a brisa e ao toque
        arvoresJardim.forEach((arv, i) => {
          const emReacao = arv.userData && arv.userData.reacaoToqueAte > now;
          const ampl = emReacao ? 0.08 : 0.02;
          const freq = emReacao ? 6.0 : 1.2;
          arv.rotation.z = Math.sin(now * freq + i * 0.8) * ampl;
        });

        // 7. Edifícios e comércio histórico com leve pulso ao toque
        [predioEsq, predioDir].forEach((pr) => {
          if (pr.userData && pr.userData.reacaoToqueAte > now) {
            pr.position.y = Math.abs(Math.sin(now * 10)) * 0.05;
          } else {
            pr.position.y = 0;
          }
        });

        // 8. Automóvel clássico: leve vibração de motor e suspensão ao toque
        if (carro.userData && carro.userData.vibrarAte > now) {
          carro.rotation.z = Math.sin(now * 22) * 0.02;
          carro.position.y = Math.abs(Math.sin(now * 18)) * 0.04;
        } else {
          carro.rotation.z = 0;
          carro.position.y = 0;
        }
      });
    },

    missoes: [
      {
        kicker: 'Missão 1 · Passeios de Dona Alice',
        enunciado: 'Onde dona Alice ia passear aos domingos com as famílias amigas há cem anos?',
        respostaCerta: 'parque',
        cam: 'parque',
        foto: '../img/hga/cc/jardim-luz.jpg',
        fotoAlt: 'Pessoas passeando no Jardim da Luz em 1910',
        explicacao: 'Aos domingos, depois do almoço, dona Alice ia passear no Jardim da Luz e em parques de São Paulo.',
        dicaRetry: 'Dona Alice passeava no Jardim da Luz aos domingos.',
        opcoes: [
          { id: 'parque', ico: '🌳', tit: 'Jardim da Luz', desc: 'Passeios no parque aos domingos' },
          { id: 'fabrica', ico: '🏭', tit: 'Fábrica moderna', desc: 'Trabalho na indústria' }
        ]
      },
      {
        kicker: 'Missão 2 · Cinema em 1895',
        enunciado: 'Em 1895, na França, como eram os primeiros filmes exibidos pelos irmãos Lumière?',
        respostaCerta: 'mudo_pb',
        cam: 'cinema',
        foto: '../img/hga/cc/cinema-1895.jpg',
        fotoAlt: 'A saída dos trabalhadores da fábrica, de 1895',
        explicacao: 'Em 1895, na França, os primeiros filmes dos irmãos Lumière eram mudos e em preto e branco.',
        dicaRetry: 'Em 1895, os filmes eram mudos e em preto e branco.',
        opcoes: [
          { id: 'mudo_pb', ico: '🎬', tit: 'Mudo e preto e branco', desc: 'Sem som e sem cores em 1895' },
          { id: 'som_cor', ico: '🌈', tit: 'Sonoro e colorido', desc: 'Com som e muitas cores' }
        ]
      },
      {
        kicker: 'Missão 3 · O Som no Cinema (1927)',
        enunciado: 'Em 1927, qual filme foi o primeiro a ter trechos com diálogos sonoros?',
        respostaCerta: 'cantor_jazz',
        cam: 'cinema',
        foto: '../img/hga/cc/cinema-1927.jpg',
        fotoAlt: 'O cantor de jazz, lançado em 1927',
        explicacao: 'Em 1927, O cantor de jazz foi o primeiro filme a ter trechos com diálogos sonoros!',
        dicaRetry: 'O primeiro filme com falas sonoras foi O cantor de jazz.',
        opcoes: [
          { id: 'cantor_jazz', ico: '🎷', tit: 'O cantor de jazz', desc: 'Primeiro filme com diálogos sonoros' },
          { id: 'museu_cera', ico: '🏛️', tit: 'Museu de cera', desc: 'Filme com tecnologia 3-D' }
        ]
      },
      {
        kicker: 'Missão 4 · Cores na Animação (1937)',
        enunciado: 'Em 1937, qual famosa animação dos Estados Unidos recebeu cores eficientes?',
        respostaCerta: 'branca_neve',
        cam: 'cinema',
        // Foto da animação colorida de 1937: ../img/hga/cc/branca-neve.jpg (ref: cinema-1927.jpg)
        foto: '../img/hga/cc/branca-neve.jpg',
        fotoAlt: 'Branca de Neve e os Sete Anões, lançada em 1937',
        explicacao: 'Em 1937, a animação Branca de Neve e os Sete Anões recebeu uma técnica de colorização eficiente!',
        dicaRetry: 'A famosa animação colorida de 1937 foi Branca de Neve e os Sete Anões.',
        opcoes: [
          { id: 'branca_neve', ico: '🍎', tit: 'Branca de Neve', desc: 'Animação famosa com cores em 1937' },
          { id: 'saida_fabrica', ico: '🏭', tit: 'Saída da fábrica', desc: 'Filme mudo e preto e branco de 1895' }
        ]
      },
      {
        kicker: 'Missão 5 · Tecnologia 3-D (1953)',
        enunciado: 'Em 1953, qual grande produção utilizou a tecnologia de filmagem em 3-D?',
        respostaCerta: 'museu_cera',
        cam: 'cinema',
        foto: '../img/hga/cc/museu-cera.jpg',
        fotoAlt: 'Museu de cera, lançado em 1953',
        explicacao: 'Em 1953, a tecnologia de filmagem em 3-D foi aplicada na grande produção Museu de cera.',
        dicaRetry: 'O filme em 3-D de 1953 foi Museu de cera.',
        opcoes: [
          { id: 'museu_cera', ico: '👓', tit: 'Museu de cera', desc: 'Grande produção com tecnologia 3-D' },
          { id: 'cantor_jazz', ico: '🎷', tit: 'O cantor de jazz', desc: 'Filme sonoro de 1927' }
        ]
      },
      {
        kicker: 'Missão 6 · Atividades de Lazer',
        enunciado: 'Toque nas 3 atividades de lazer praticadas por dona Alice há cem anos:',
        tipo: 'selecao',
        cam: 'parque',
        foto: '../img/hga/cc/jardim-luz.jpg',
        fotoAlt: 'Passeio no Jardim da Luz em 1910',
        explicacao: 'Dona Alice ia a piqueniques na Cantareira e no Parque Antártica, e passeava no Jardim da Luz aos domingos!',
        totalRequerido: 3,
        itens: [
          { id: 'cantareira', nome: 'Piquenique na Cantareira', img: '../img/jogo/cc/cesta.svg' },
          { id: 'jardim_luz', nome: 'Passeio no Jardim da Luz', img: '../img/jogo/cc/parque.svg' },
          { id: 'parque_antartica', nome: 'Parque Antártica', img: '../img/jogo/cc/bonde.svg' }
        ]
      }
    ],

    resumoFinal: [
      {
        titulo: '🎞️ Cinema em 1895 (Irmãos Lumière)',
        itens: [
          'Mudo (não tinha som nem falas)',
          'Filmes em preto e branco',
          'Tecnologia 3-D não existia',
          'Primeiro filme: Saída dos trabalhadores da fábrica'
        ]
      },
      {
        titulo: '🎬 Cinema Atualmente (Evolução)',
        itens: [
          'Sonoro (1927: O cantor de jazz com diálogos)',
          'Colorido (1937: Branca de Neve com cores eficientes)',
          'Tecnologia 3-D (1953: Museu de cera)',
          'Filmes com som, muitas cores e tecnologia 3-D'
        ]
      }
    ]
  };
})(window);
