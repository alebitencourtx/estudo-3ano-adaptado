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
    hudTags: ['🌿 Pasto (Extensiva)', '🏡 Estábulo (Intensiva)'],

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🌿 Olhar Pasto', cam: 'pasto' },
      { label: '🏡 Olhar Estábulo', cam: 'estabulo' }
    ],

    cameras: {
      geral:    { pos: [0, 20, 30],   look: [0, 2, 0] },
      pasto:    { pos: [-14, 11, 16], look: [-14, 1.5, 0] },
      estabulo: { pos: [13, 11, 16],  look: [13, 1.5, -2] },
      produtos: { pos: [0, 9, 20],    look: [0, 1.5, 9] }
    },

    fichas3d: [
      {
        id: 'pec-pasto',
        pos: [-6, 3.2, 2],
        nome: 'Gado no Pasto',
        foto: '../img/hga/pec/pasto.jpg',
        fato: 'Na pecuária extensiva, os animais vivem soltos nas pastagens.'
      },
      {
        id: 'pec-curral',
        pos: [13, 3.5, 0],
        nome: 'Gado no Estábulo',
        foto: '../img/hga/pec/curral.jpg',
        fato: 'Na pecuária intensiva, os animais são criados em estábulos.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Chão e estrada
      scene.add(kit.criarChao(60, 44, 0x86c232));
      scene.add(kit.criarEstrada(5, 44, 0xd9b382));

      // LADO ESQUERDO: Pasto (Extensiva)
      const grpPasto = new THREE.Group();
      grpPasto.position.set(-14, 0, 0);

      const grama = kit.criarChao(20, 32, 0x76b82a);
      grama.position.y = 0.05;
      grpPasto.add(grama);

      grpPasto.add(kit.criarCerca(-9.5, 0, 30, true));
      grpPasto.add(kit.criarCerca(0, -15.5, 19, false));

      grpPasto.add(kit.criarArvore(-6, 8));
      grpPasto.add(kit.criarArvore(-5, -11));
      grpPasto.add(kit.criarArvore(5, -10));

      const lago = kit.criarRio(7, 7, 0x4fa3e3);
      lago.position.set(-4, 0.08, -6);
      grpPasto.add(lago);

      const v1 = kit.criarVaca(0xffffff, 0x222222);
      v1.position.set(-2, 0, 2);
      v1.rotation.y = Math.PI * 0.2;
      grpPasto.add(v1);

      const v2 = kit.criarVaca(0xffffff, 0x704214);
      v2.position.set(3, 0, -4);
      v2.rotation.y = -Math.PI * 0.35;
      grpPasto.add(v2);

      // Flores e arbustos no pasto
      kit.criarFlores(grpPasto, -3, 4, 4, 12);
      grpPasto.add(kit.criarArbusto(-8, 4, 0x43a047, 0xffeb3b));
      grpPasto.add(kit.criarArbusto(-8, -5, 0x388e3c, 0xff5722));

      grpPasto.add(kit.criarPlaca(0, 6, 'PASTO', 0x2e7d32));
      scene.add(grpPasto);

      // LADO DIREITO: Estábulo (Intensiva)
      const grpEstabulo = new THREE.Group();
      grpEstabulo.position.set(13, 0, 0);

      const pisoCurral = kit.criarChao(20, 32, 0xc4ab80);
      pisoCurral.position.y = 0.05;
      grpEstabulo.add(pisoCurral);

      const galpao = kit.criarCasa(10, 4.5, 8, 0x8d6e63, 0xb71c1c, { nome: 'Galpão do Estábulo' });
      galpao.position.set(0, 0, -4);
      grpEstabulo.add(galpao);

      // Cocho de ração
      const cocho = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.9, 1.2), kit.mat('lambert', 0x6d4c41));
      cocho.position.set(0, 0.5, 2.2);
      grpEstabulo.add(cocho);

      const v3 = kit.criarVaca(0xffffff, 0x111111);
      v3.position.set(0, 0, -1);
      grpEstabulo.add(v3);

      grpEstabulo.add(kit.criarCerca(9.5, 0, 30, true));
      grpEstabulo.add(kit.criarCerca(0, 15.5, 19, false));
      grpEstabulo.add(kit.criarArbusto(8, 4, 0x43a047));
      grpEstabulo.add(kit.criarPlaca(0, 7, 'ESTÁBULO', 0xc62828));
      scene.add(grpEstabulo);

      // Caminhão no centro
      const caminhao = kit.criarCaminhao(0x1976d2);
      caminhao.position.set(0, 0, 10);
      scene.add(caminhao);

      // Animação das vaquinhas (cabeça e cauda)
      animaveis.push((now) => {
        [v1, v2, v3].forEach((v) => {
          if (v.userData && v.userData.cabeca) {
            const off = v.userData.tempo || 0;
            v.userData.cabeca.position.y = v.userData.baseHeadY + Math.sin(now * 3 + off) * 0.08;
            v.userData.cabeca.rotation.x = Math.sin(now * 2.5 + off) * 0.12;
          }
          if (v.userData && v.userData.cauda) {
            const off = v.userData.tempo || 0;
            v.userData.cauda.rotation.z = Math.sin(now * 4 + off) * 0.22;
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
        explicacao: 'Na pecuária extensiva, os animais são criados soltos nas pastagens.',
        dicaRetry: 'Lembre-se: na pecuária extensiva o gado vive solto no pasto.',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Gado Solto)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Confinado)' }
        ]
      },
      {
        kicker: 'Missão 2 · Confinamento',
        enunciado: 'Onde o gado fica confinado e recebe alimentação específica?',
        respostaCerta: 'estabulo',
        cam: 'estabulo',
        foto: '../img/hga/pec/curral.jpg',
        fotoAlt: 'Gado confinado no curral',
        explicacao: 'Na pecuária intensiva, os animais ficam confinados no estábulo e no curral.',
        dicaRetry: 'Lembre-se: na pecuária intensiva o gado fica confinado no estábulo.',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Gado Solto)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Confinado)' }
        ]
      },
      {
        kicker: 'Missão 3 · Ordenha do Leite',
        enunciado: 'Onde pode ser feita a ordenha mecânica para retirar o leite?',
        respostaCerta: 'estabulo',
        cam: 'estabulo',
        foto: '../img/hga/pec/curral.jpg',
        fotoAlt: 'Ordenha mecânica no estábulo',
        explicacao: 'No estábulo da pecuária intensiva, a retirada de leite pode ser feita por ordenha mecânica.',
        dicaRetry: 'A ordenha mecânica é feita no estábulo da pecuária intensiva.',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Gado Solto)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Confinado)' }
        ]
      },
      {
        kicker: 'Missão 4 · Muitos Trabalhadores',
        enunciado: 'Em qual forma de criação é necessário mais trabalhadores cuidando do gado?',
        respostaCerta: 'estabulo',
        cam: 'estabulo',
        foto: '../img/hga/pec/curral.jpg',
        fotoAlt: 'Pecuária intensiva com mais trabalhadores',
        explicacao: 'Na pecuária intensiva, é necessário um número maior de trabalhadores.',
        dicaRetry: 'A intensiva necessita de mais trabalhadores cuidando dos animais.',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Poucos trabalhadores)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Mais trabalhadores)' }
        ]
      },
      {
        kicker: 'Missão 5 · Poucos Trabalhadores',
        enunciado: 'Onde um pequeno número de trabalhadores cuida dos animais?',
        respostaCerta: 'pasto',
        cam: 'pasto',
        foto: '../img/hga/pec/pasto.jpg',
        fotoAlt: 'Gado solto no pasto',
        explicacao: 'Na pecuária extensiva, poucos trabalhadores cuidam dos animais.',
        dicaRetry: 'Na extensiva, poucos trabalhadores cuidam do gado solto.',
        opcoes: [
          { id: 'pasto', ico: '🌿', tit: 'Pasto', desc: 'Pecuária Extensiva (Poucos trabalhadores)' },
          { id: 'estabulo', ico: '🏡', tit: 'Estábulo', desc: 'Pecuária Intensiva (Mais trabalhadores)' }
        ]
      },
      {
        kicker: 'Missão 6 · Produtos da Pecuária',
        enunciado: 'Toque nos 4 produtos obtidos por meio da pecuária:',
        tipo: 'produtos',
        cam: 'produtos',
        foto: '../img/jogo/pec/emoji/leite.svg',
        fotoAlt: 'Produtos da pecuária',
        explicacao: 'Pela pecuária obtemos alimentos e matérias-primas: leite, carnes, ovos e couro!',
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
