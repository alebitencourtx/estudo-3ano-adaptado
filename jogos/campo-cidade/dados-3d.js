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

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🌳 Jardim da Luz', cam: 'parque' },
      { label: '🎬 Cinema Antigo', cam: 'cinema' }
    ],

    cameras: {
      geral:  { pos: [0, 22, 32],   look: [0, 2, 0] },
      parque: { pos: [-14, 11, 16], look: [-14, 1.5, 0] },
      cinema: { pos: [14, 11, 16],  look: [14, 2.0, 0] }
    },

    fichas3d: [
      {
        id: 'cc-jardim',
        pos: [-19, 3.2, -6],
        nome: 'Jardim da Luz',
        foto: '../img/hga/cc/jardim-luz.jpg',
        fato: 'Em 1910, as famílias passeavam no Jardim da Luz.'
      },
      {
        id: 'cc-mudo',
        pos: [14, 3.2, 0],
        nome: 'Cinema Mudo',
        foto: '../img/hga/cc/cinema-1895.jpg',
        fato: 'Em 1895, os primeiros filmes não tinham som.'
      },
      {
        id: 'cc-sonoro',
        pos: [18, 3.5, -6],
        nome: 'Cinema Sonoro',
        foto: '../img/hga/cc/cinema-1927.jpg',
        fato: 'Em 1927, surgiram as primeiras falas no cinema.'
      },
      {
        id: 'cc-branca',
        pos: [18, 3.5, 6],
        nome: 'Branca de Neve',
        foto: '../img/hga/cc/branca-neve.jpg',
        fato: 'Em 1937, foi lançado o desenho longo colorido.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Chão gramado geral e rua pavimentada central
      scene.add(kit.criarChao(64, 44, 0x81c784));

      // Rua central de paralelepípedos separando o parque da cidade
      const ruaCentral = kit.criarEstrada(6, 44, 0x546e7a);
      scene.add(ruaCentral);

      // Trilhos de ferro do bondinho na rua central
      const trilhoGeo = new THREE.BoxGeometry(0.08, 0.05, 44);
      const trilhoMat = new THREE.MeshLambertMaterial({ color: 0xb0bec5 });
      const trilhoEsq = new THREE.Mesh(trilhoGeo, trilhoMat);
      trilhoEsq.position.set(-1.0, 0.04, 0);
      scene.add(trilhoEsq);

      const trilhoDir = new THREE.Mesh(trilhoGeo, trilhoMat);
      trilhoDir.position.set(1.0, 0.04, 0);
      scene.add(trilhoDir);

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

      // Lago com chafariz
      const lago = kit.criarRio(8, 10, 0x29b6f6);
      lago.position.set(-5, 0.08, -6);
      grpParque.add(lago);

      const chafarizBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.6, 0.5, 8),
        new THREE.MeshLambertMaterial({ color: 0xb0bec5 })
      );
      chafarizBase.position.set(-5, 0.3, -6);
      grpParque.add(chafarizBase);

      const jatoAgua = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 1.6, 6),
        new THREE.MeshLambertMaterial({ color: 0xe1f5fe, transparent: true, opacity: 0.85 })
      );
      jatoAgua.position.set(-5, 1.3, -6);
      grpParque.add(jatoAgua);

      // Árvores históricas do Jardim da Luz
      grpParque.add(kit.criarArvore(-7, 8, 0x2e7d32));
      grpParque.add(kit.criarArvore(-8, -12, 0x388e3c));
      grpParque.add(kit.criarArvore(7, -10, 0x43a047));
      grpParque.add(kit.criarArvore(6, 9, 0x2e7d32));
      grpParque.add(kit.criarArvore(-2, -12, 0x1b5e20));

      // Coreto histórico de música no Jardim da Luz
      const coreto = new THREE.Group();
      coreto.position.set(5.5, 0, -4);
      const baseCoreto = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.6, 0.6, 8),
        new THREE.MeshLambertMaterial({ color: 0xd7ccc8 })
      );
      baseCoreto.position.y = 0.3;
      coreto.add(baseCoreto);

      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2;
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6),
          new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        col.position.set(Math.cos(ang) * 1.8, 1.5, Math.sin(ang) * 1.8);
        coreto.add(col);
      }
      const telhadoCoreto = new THREE.Mesh(
        new THREE.ConeGeometry(2.8, 1.4, 8),
        new THREE.MeshLambertMaterial({ color: 0x8d6e63 })
      );
      telhadoCoreto.position.y = 3.3;
      coreto.add(telhadoCoreto);
      grpParque.add(coreto);

      // Bancos de jardim de ferro e ripas de madeira
      function criarBanco(bx, bz, rotY) {
        const b = new THREE.Group();
        b.position.set(bx, 0, bz);
        b.rotation.y = rotY || 0;
        const assento = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.1, 0.5),
          new THREE.MeshLambertMaterial({ color: 0x5d4037 })
        );
        assento.position.y = 0.5;
        b.add(assento);
        const encosto = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.5, 0.1),
          new THREE.MeshLambertMaterial({ color: 0x5d4037 })
        );
        encosto.position.set(0, 0.8, -0.2);
        b.add(encosto);
        const pernaMat = new THREE.MeshLambertMaterial({ color: 0x263238 });
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.4), pernaMat);
        p1.position.set(-0.6, 0.25, 0);
        b.add(p1);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.4), pernaMat);
        p2.position.set(0.6, 0.25, 0);
        b.add(p2);
        return b;
      }
      grpParque.add(criarBanco(2.2, -2, -Math.PI / 2));
      grpParque.add(criarBanco(2.2, 4, -Math.PI / 2));

      // Toalha de piquenique com cesta e frutas
      const toalha = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 3.6),
        new THREE.MeshLambertMaterial({ color: 0xef5350 })
      );
      toalha.rotation.x = -Math.PI / 2;
      toalha.position.set(-2.2, 0.07, 3);
      grpParque.add(toalha);

      const toalhaCentro = new THREE.Mesh(
        new THREE.PlaneGeometry(2.9, 2.9),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      toalhaCentro.rotation.x = -Math.PI / 2;
      toalhaCentro.position.set(-2.2, 0.075, 3);
      grpParque.add(toalhaCentro);

      const cesta = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.65, 0.65),
        new THREE.MeshLambertMaterial({ color: 0x8d6e63 })
      );
      cesta.position.set(-2.4, 0.38, 3.2);
      cesta.castShadow = true;
      grpParque.add(cesta);

      const maca1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshLambertMaterial({ color: 0xd32f2f })
      );
      maca1.position.set(-1.6, 0.18, 2.7);
      grpParque.add(maca1);

      const maca2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshLambertMaterial({ color: 0xffeb3b })
      );
      maca2.position.set(-1.9, 0.18, 2.6);
      grpParque.add(maca2);

      // Cerca clássica do parque
      grpParque.add(kit.criarCerca(-10, 0, 32, true, 0x8d6e63));
      grpParque.add(kit.criarCerca(0, 16, 20, false, 0x8d6e63));
      grpParque.add(kit.criarCerca(0, -16, 20, false, 0x8d6e63));

      // Placa identificando o parque
      grpParque.add(kit.criarPlaca(0, 8, 'JARDIM DA LUZ (1910)', 0x2e7d32));
      scene.add(grpParque);

      // ==========================================
      // LADO DIREITO: Cidade com Cinema Antigo
      // ==========================================
      const grpCidade = new THREE.Group();
      grpCidade.position.set(14, 0, 0);

      // Calçada de pedestres
      const calcada = kit.criarChao(22, 34, 0xb0bec5);
      calcada.position.y = 0.05;
      grpCidade.add(calcada);

      // Prédio histórico do Cinema Antigo
      const predioCinema = new THREE.Group();
      predioCinema.position.set(0, 0, -4);

      // Fachada em tom clássico rosado/tijolo antigo
      const fachada = new THREE.Mesh(
        new THREE.BoxGeometry(11, 7.5, 8),
        new THREE.MeshLambertMaterial({ color: 0xef9a9a })
      );
      fachada.position.y = 3.75;
      fachada.castShadow = true;
      predioCinema.add(fachada);

      // Frontão superior clássico
      const frontao = new THREE.Mesh(
        new THREE.BoxGeometry(11.4, 1.0, 8.4),
        new THREE.MeshLambertMaterial({ color: 0xc62828 })
      );
      frontao.position.y = 8.0;
      predioCinema.add(frontao);

      const frontaoTri = new THREE.Mesh(
        new THREE.ConeGeometry(3.5, 1.6, 4),
        new THREE.MeshLambertMaterial({ color: 0xb71c1c })
      );
      frontaoTri.position.set(0, 9.3, 4.0);
      frontaoTri.rotation.y = Math.PI / 4;
      predioCinema.add(frontaoTri);

      // Portas de madeira escura da entrada do cinema
      const portaCinema = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 2.6, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x3e2723 })
      );
      portaCinema.position.set(0, 1.3, 4.05);
      predioCinema.add(portaCinema);

      // Marquise saliente do cinema antigo
      const marquise = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 0.5, 3.0),
        new THREE.MeshLambertMaterial({ color: 0x212121 })
      );
      marquise.position.set(0, 3.2, 5.0);
      marquise.castShadow = true;
      predioCinema.add(marquise);

      // Placa com letreiro iluminado "CINEMA"
      const letreiroBase = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, 1.0, 0.2),
        new THREE.MeshLambertMaterial({ color: 0xffd54f })
      );
      letreiroBase.position.set(0, 4.0, 5.0);
      predioCinema.add(letreiroBase);

      const letreiroLuz = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 0.6, 0.25),
        new THREE.MeshLambertMaterial({ color: 0xff6f00 })
      );
      letreiroLuz.position.set(0, 4.0, 5.02);
      predioCinema.add(letreiroLuz);

      // Cartazes decorativos nas laterais da entrada
      const cartaz1 = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.8, 0.1),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      cartaz1.position.set(-3.2, 2.2, 4.05);
      predioCinema.add(cartaz1);

      const cartaz2 = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.8, 0.1),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      cartaz2.position.set(3.2, 2.2, 4.05);
      predioCinema.add(cartaz2);

      grpCidade.add(predioCinema);

      // Prédios vizinhos antigos completando a rua histórica
      const predioEsq = kit.criarPredio(5.5, 8.5, 7, 0x90a4ae);
      predioEsq.position.set(-8.5, 0, -4);
      grpCidade.add(predioEsq);

      const predioDir = kit.criarPredio(5.5, 9.5, 7, 0x8d6e63);
      predioDir.position.set(8.5, 0, -4);
      grpCidade.add(predioDir);

      // Postes de luz clássicos (lampiões de rua antiga)
      function criarPosteAntigo(px, pz) {
        const poste = new THREE.Group();
        poste.position.set(px, 0, pz);
        const coluna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.13, 3.2, 8),
          new THREE.MeshLambertMaterial({ color: 0x263238 })
        );
        coluna.position.y = 1.6;
        coluna.castShadow = true;
        poste.add(coluna);

        const topo = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.6, 0.5),
          new THREE.MeshLambertMaterial({ color: 0xfff59d })
        );
        topo.position.y = 3.3;
        poste.add(topo);

        const chapeu = new THREE.Mesh(
          new THREE.ConeGeometry(0.4, 0.35, 4),
          new THREE.MeshLambertMaterial({ color: 0x263238 })
        );
        chapeu.position.y = 3.75;
        poste.add(chapeu);
        return poste;
      }
      grpCidade.add(criarPosteAntigo(-4, 3));
      grpCidade.add(criarPosteAntigo(4, 3));
      grpCidade.add(criarPosteAntigo(-4, 11));
      grpCidade.add(criarPosteAntigo(4, 11));

      // Placa identificando a cidade
      grpCidade.add(kit.criarPlaca(0, 14, 'CINEMA DA CIDADE', 0xb71c1c));
      scene.add(grpCidade);

      // ==========================================
      // VEÍCULOS DE ÉPOCA: Bondinho e Carro Clássico
      // ==========================================
      // Bondinho histórico sobre os trilhos na avenida central
      const bonde = new THREE.Group();
      const bondeChassi = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.4, 7.0),
        new THREE.MeshLambertMaterial({ color: 0x37474f })
      );
      bondeChassi.position.y = 0.5;
      bonde.add(bondeChassi);

      const bondeCabine = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.8, 6.6),
        new THREE.MeshLambertMaterial({ color: 0xfbc02d })
      );
      bondeCabine.position.y = 1.5;
      bondeCabine.castShadow = true;
      bonde.add(bondeCabine);

      const bondeFaixa = new THREE.Mesh(
        new THREE.BoxGeometry(2.45, 0.3, 6.65),
        new THREE.MeshLambertMaterial({ color: 0xc62828 })
      );
      bondeFaixa.position.y = 1.1;
      bonde.add(bondeFaixa);

      const bondeJanelas = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.7, 5.8),
        new THREE.MeshLambertMaterial({ color: 0x263238 })
      );
      bondeJanelas.position.y = 1.75;
      bonde.add(bondeJanelas);

      const bondeTelhado = new THREE.Mesh(
        new THREE.BoxGeometry(2.55, 0.3, 6.8),
        new THREE.MeshLambertMaterial({ color: 0x5d4037 })
      );
      bondeTelhado.position.y = 2.5;
      bonde.add(bondeTelhado);

      const bondeHaste = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
        new THREE.MeshLambertMaterial({ color: 0x212121 })
      );
      bondeHaste.position.set(0, 3.1, -1.0);
      bondeHaste.rotation.x = Math.PI / 6;
      bonde.add(bondeHaste);

      const rodaBondeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
      const rodaBondeMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
      [[-1.1, 1.8], [1.1, 1.8], [-1.1, -1.8], [1.1, -1.8]].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rodaBondeGeo, rodaBondeMat);
        r.rotation.z = Math.PI / 2;
        r.position.set(rx, 0.35, rz);
        bonde.add(r);
      });
      bonde.position.set(0, 0, 4);
      scene.add(bonde);

      // Carro clássico vintage estacionado perto do cinema
      const carro = new THREE.Group();
      const carroChassi = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.4, 4.4),
        new THREE.MeshLambertMaterial({ color: 0x212121 })
      );
      carroChassi.position.y = 0.5;
      carro.add(carroChassi);

      const carroCabine = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.3, 2.0),
        new THREE.MeshLambertMaterial({ color: 0x1a237e })
      );
      carroCabine.position.set(0, 1.4, -0.6);
      carroCabine.castShadow = true;
      carro.add(carroCabine);

      const carroCapo = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.9, 1.8),
        new THREE.MeshLambertMaterial({ color: 0x1a237e })
      );
      carroCapo.position.set(0, 1.0, 1.2);
      carroCapo.castShadow = true;
      carro.add(carroCapo);

      const radiador = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.8, 0.1),
        new THREE.MeshLambertMaterial({ color: 0xb0bec5 })
      );
      radiador.position.set(0, 1.0, 2.15);
      carro.add(radiador);

      const farolMat = new THREE.MeshLambertMaterial({ color: 0xfff59d });
      const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), farolMat);
      f1.position.set(-0.7, 1.1, 2.15);
      carro.add(f1);
      const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), farolMat);
      f2.position.set(0.7, 1.1, 2.15);
      carro.add(f2);

      const rodaCarroGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 12);
      const rodaCarroMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
      [[-1.15, 1.2], [1.15, 1.2], [-1.15, -1.2], [1.15, -1.2]].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rodaCarroGeo, rodaCarroMat);
        r.rotation.z = Math.PI / 2;
        r.position.set(rx, 0.48, rz);
        carro.add(r);
      });
      carro.position.set(13, 0, 8);
      carro.rotation.y = -Math.PI * 0.15;
      scene.add(carro);

      // Animações sutis e agradáveis
      animaveis.push((now) => {
        // Movimento suave do bondinho ao longo dos trilhos
        bonde.position.z = 2 + Math.sin(now * 0.4) * 5;

        // Pulso suave do jato do chafariz
        jatoAgua.scale.y = 0.9 + Math.sin(now * 3.5) * 0.15;

        // Efeito sutil de letreiro luminoso do cinema
        if (letreiroLuz && letreiroLuz.material) {
          const pisca = Math.floor(now * 2.5) % 2 === 0;
          letreiroLuz.material.color.setHex(pisca ? 0xffa000 : 0xff6f00);
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
