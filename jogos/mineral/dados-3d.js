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

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '⛏️ Olhar Mina', cam: 'mina' },
      { label: '🏙️ Olhar Cidade', cam: 'cidade' },
      { label: '💎 Minerais', cam: 'minerais' }
    ],

    cameras: {
      geral:    { pos: [0, 22, 32],   look: [0, 2, 0] },
      mina:     { pos: [-16, 12, 17], look: [-14, 2, 0] },
      cidade:   { pos: [16, 12, 17],  look: [14, 2, 0] },
      minerais: { pos: [0, 6.5, 15],  look: [0, 1.2, 8] }
    },

    fichas3d: [
      {
        id: 'min-ferro',
        pos: [-19, 4.5, -4],
        nome: 'Minério de Ferro',
        foto: '../img/hga/min/ferro.jpg',
        fato: 'O ferro é extraído da natureza e vira aço forte.'
      },
      {
        id: 'min-cobre',
        pos: [15, 5.2, -6],
        nome: 'Fios de Cobre',
        foto: '../img/hga/min/cobre.jpg',
        fato: 'O cobre é um metal que conduz a eletricidade.'
      },
      {
        id: 'min-cimento',
        pos: [20, 6.0, 4],
        nome: 'Cimento para Prédios',
        foto: '../img/hga/min/cimento.jpg',
        fato: 'O cimento é feito de calcário e constrói cidades.'
      },
      {
        id: 'min-areia',
        pos: [-11, 2.5, 6],
        nome: 'Areia da Construção',
        foto: '../img/hga/min/areia.jpg',
        fato: 'A areia é um recurso mineral usado nas obras.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Chão principal e estrada conectando a mina à cidade
      scene.add(kit.criarChao(64, 44, 0x8a947d));
      scene.add(kit.criarEstrada(6, 44, 0x455a64));

      // Faixas centrais da estrada de asfalto
      const faixaGeo = new THREE.PlaneGeometry(0.3, 2);
      const faixaMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let z = -18; z <= 18; z += 4) {
        const fx = new THREE.Mesh(faixaGeo, faixaMat);
        fx.rotation.x = -Math.PI / 2;
        fx.position.set(0, 0.03, z);
        scene.add(fx);
      }

      // ==================== LADO ESQUERDO: MINA (Solo e Subsolo) ====================
      const grpMina = new THREE.Group();
      grpMina.position.set(-15, 0, 0);

      // Chão escavado de terra e rocha da mina
      const pisoMina = kit.criarChao(22, 34, 0x8d6e63);
      pisoMina.position.y = 0.04;
      grpMina.add(pisoMina);

      // Morro de escavação em patamares (mina a céu aberto)
      const matPat1 = new THREE.MeshLambertMaterial({ color: 0x795548 });
      const matPat2 = new THREE.MeshLambertMaterial({ color: 0x6d4c41 });
      const matPat3 = new THREE.MeshLambertMaterial({ color: 0x5d4037 });

      const nivel1 = new THREE.Mesh(new THREE.CylinderGeometry(8, 9.5, 1.8, 10), matPat1);
      nivel1.position.set(-4, 0.9, -4);
      nivel1.castShadow = true;
      nivel1.receiveShadow = true;
      grpMina.add(nivel1);

      const nivel2 = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 7.2, 1.8, 10), matPat2);
      nivel2.position.set(-4, 2.7, -4);
      nivel2.castShadow = true;
      nivel2.receiveShadow = true;
      grpMina.add(nivel2);

      const nivel3 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.8, 1.6, 9), matPat3);
      nivel3.position.set(-4, 4.4, -4);
      nivel3.castShadow = true;
      nivel3.receiveShadow = true;
      grpMina.add(nivel3);

      // Rochas da mina (Kit3D.criarRochas)
      grpMina.add(kit.criarRochas(-2, 4, 0x8d6e63));
      grpMina.add(kit.criarRochas(-7, -2, 0x616161));
      grpMina.add(kit.criarRochas(4, -8, 0x757575));
      grpMina.add(kit.criarRochas(-4, 5.3, 0xa1887f));

      // Monte de areia extraída na natureza
      const coneAreia = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.0, 12), new THREE.MeshLambertMaterial({ color: 0xd7ccc8 }));
      coneAreia.position.set(4, 1.0, 6);
      coneAreia.castShadow = true;
      grpMina.add(coneAreia);

      // Monte de minério de ferro
      const coneMin = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.8, 10), new THREE.MeshLambertMaterial({ color: 0x455a64 }));
      coneMin.position.set(-1, 0.9, 8);
      coneMin.castShadow = true;
      grpMina.add(coneMin);

      // Caminhão de minério pesado amarelo na mina
      const caminhaoMina = kit.criarCaminhao(0xfbc02d);
      caminhaoMina.position.set(2, 0, -2);
      caminhaoMina.rotation.y = Math.PI * 0.15;
      const pedrasNaCacamba = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), new THREE.MeshLambertMaterial({ color: 0x37474f }));
      pedrasNaCacamba.position.set(0, 2.5, -1.2);
      caminhaoMina.add(pedrasNaCacamba);
      grpMina.add(caminhaoMina);

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

      // Prédios feitos com cimento, ferro e aço
      const predio1 = kit.criarPredio(4.5, 10.5, 4.5, 0x607d8b);
      predio1.position.set(5, 0, -6);
      grpCidade.add(predio1);

      const predio2 = kit.criarPredio(4, 7.5, 4, 0x78909c);
      predio2.position.set(5, 0, 4);
      grpCidade.add(predio2);

      // Casas com cimento e telhados
      const casa1 = kit.criarCasa(4.5, 3.2, 3.8, 0xffffff, 0xc62828);
      casa1.position.set(-4, 0, -6);
      casa1.rotation.y = Math.PI / 2;
      grpCidade.add(casa1);

      const casa2 = kit.criarCasa(4.2, 3.0, 3.6, 0xfff9c4, 0x2e7d32);
      casa2.position.set(-4, 0, 4);
      casa2.rotation.y = -Math.PI / 2;
      grpCidade.add(casa2);

      // Postes com cruzetas e fios de cobre que levam energia para a cidade
      function criarPoste(x, z) {
        const p = new THREE.Group();
        p.position.set(x, 0, z);

        const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.2, 8), new THREE.MeshLambertMaterial({ color: 0x795548 }));
        poste.position.y = 2.6;
        poste.castShadow = true;
        p.add(poste);

        const cruzeta = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.15), new THREE.MeshLambertMaterial({ color: 0x5d4037 }));
        cruzeta.position.y = 4.9;
        cruzeta.rotation.y = Math.PI / 2;
        p.add(cruzeta);

        const isoMat = new THREE.MeshLambertMaterial({ color: 0x00acc1 });
        const iso1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 6), isoMat);
        iso1.position.set(0, 5.05, -0.6);
        const iso2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 6), isoMat);
        iso2.position.set(0, 5.05, 0.6);
        p.add(iso1);
        p.add(iso2);
        return p;
      }

      grpCidade.add(criarPoste(-1, -10));
      grpCidade.add(criarPoste(-1, 0));
      grpCidade.add(criarPoste(-1, 10));

      // Fios elétricos feitos de cobre (tom metálico cobre) conectando os postes
      const fioMat = new THREE.MeshBasicMaterial({ color: 0xb87333 });
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
      scene.add(caminhaoEstrada);

      // Mostruário dos 5 recursos minerais em pedestais com rotação suave
      const grpMinerais = new THREE.Group();
      grpMinerais.position.set(0, 0, 8);

      const amostrasGemas = [];
      const listaMin = [
        { nome: 'Cobre',    cor: 0xb87333, x: -3.6 },
        { nome: 'Ferro',    cor: 0x455a64, x: -1.8 },
        { nome: 'Areia',    cor: 0xd7ccc8, x: 0 },
        { nome: 'Bauxita',  cor: 0xbf360c, x: 1.8 },
        { nome: 'Calcário', cor: 0xeeeeee, x: 3.6 }
      ];

      listaMin.forEach((m) => {
        const pedGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.7, 12);
        const pedMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
        const pedestal = new THREE.Mesh(pedGeo, pedMat);
        pedestal.position.set(m.x, 0.35, 0);
        pedestal.castShadow = true;
        grpMinerais.add(pedestal);

        const gemaGeo = new THREE.DodecahedronGeometry(0.38, 0);
        const gemaMat = new THREE.MeshLambertMaterial({ color: m.cor });
        const gema = new THREE.Mesh(gemaGeo, gemaMat);
        gema.position.set(m.x, 0.95, 0);
        gema.castShadow = true;
        grpMinerais.add(gema);
        amostrasGemas.push(gema);
      });
      scene.add(grpMinerais);

      // Animações sutis e agradáveis (sem agitação sensorial)
      animaveis.push((now) => {
        amostrasGemas.forEach((gema, idx) => {
          gema.rotation.y = now * 1.4 + idx * 0.8;
          gema.position.y = 0.95 + Math.sin(now * 2 + idx) * 0.05;
        });
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
