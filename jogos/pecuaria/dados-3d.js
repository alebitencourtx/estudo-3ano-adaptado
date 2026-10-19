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
      ceu: { topo: 0x87ceeb, base: 0xffffff },
      nevoa: { cor: 0xd7ecfd, perto: 40, longe: 110 }
    },

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🌿 Olhar Pasto', cam: 'pasto' },
      { label: '🏡 Olhar Estábulo', cam: 'estabulo' }
    ],

    cameras: {
      geral:    { pos: [0, 24, 34],   look: [0, 2, 0] },
      pasto:    { pos: [-14, 14, 22], look: [-14, 2, -1] },
      estabulo: { pos: [14, 13, 22],  look: [14, 2, -2] },
      produtos: { pos: [0, 11, 22],    look: [0, 2, 8] }
    },

    fichas3d: [
      {
        id: 'pec-pasto',
        pos: [-13.4, 2.2, -8.5],
        nome: 'Gado no Pasto',
        foto: '../img/hga/pec/pasto.jpg',
        fato: 'Na pecuária extensiva, os animais vivem soltos nas pastagens.'
      },
      {
        id: 'pec-curral',
        pos: [11.8, 2.4, 0.0],
        nome: 'Gado no Estábulo',
        foto: '../img/hga/pec/curral.jpg',
        fato: 'Na pecuária intensiva, os animais são criados em estábulos.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Pedestal da Ilha Diorama Flutuante (estratificado com solo e rochas)
      scene.add(kit.criarIlhaDiorama(56, 40, 4.0, 0x7eb856, 0x5d4037));

      // Estrada central rústica que divide o pasto e o estábulo
      scene.add(kit.criarEstrada(4.5, 40, 0xd7ccc8));

      // Partículas suaves de luz do sol no ar (pólen e raios de sol)
      kit.criarParticulasSol(scene, animaveis, 45);

      // Gramado com centenas de tufos instanciados balançando ao vento (1 draw call)
      kit.criarGramaInstanciada(scene, animaveis, {
        minX: -26,
        maxX: -4,
        minZ: -18,
        maxZ: 18,
        count: 280,
        cor: 0x8bc34a,
        excluir: (gx, gz) => Math.hypot(gx - (-17), gz - (-7)) < 5.2 || Math.hypot(gx - (-19), gz - 13) < 4.2
      });

      // LADO ESQUERDO: Pasto (Extensiva)
      const grpPasto = new THREE.Group();
      grpPasto.position.set(-14, 0, 0);

      // Lago artesanal com margem de seixos, vitórias-régias e píer de madeira
      const lago = kit.criarLagoDiorama(-3, -7, 4.8, 3.8, animaveis);
      grpPasto.add(lago);

      // Moinho de vento holandês com pás giratórias
      const moinho = kit.criarMoinhoVento(-5, -13, animaveis);
      moinho.userData.interativo = true;
      moinho.userData.nome = 'Moinho de vento da fazenda, que ajuda nas tarefas do campo.';
      grpPasto.add(moinho);

      // Árvores no pasto: frutíferas com maçãs e copas frondosas
      grpPasto.add(kit.criarArvore(5, -11, 'frutifera'));
      grpPasto.add(kit.criarArvore(-7, 7, 'frutifera'));
      grpPasto.add(kit.criarArvore(6, 9, 'copa'));

      // Fardos de feno dourados no campo
      const msgFeno = 'Fardos de feno: alimento nutritivo fornecido no cocho para o gado confinado.';
      const feno1 = kit.criarFardoFeno(4, 3, 0.3);
      feno1.userData.interativo = true;
      feno1.userData.nome = msgFeno;
      grpPasto.add(feno1);

      const feno2 = kit.criarFardoFeno(2, 4.2, -0.2);
      feno2.userData.interativo = true;
      feno2.userData.nome = msgFeno;
      grpPasto.add(feno2);

      // Cercas rústicas de madeira
      grpPasto.add(kit.criarCerca(-12, 0, 36, true));
      grpPasto.add(kit.criarCerca(0, -18, 22, false));
      grpPasto.add(kit.criarCerca(0, 18, 22, false));

      // Vaquinhas felizes pastando soltas
      const msgVaca = 'Vaquinha no pasto: na pecuária extensiva, os animais vivem soltos e comem capim.';
      const v1 = kit.criarVaca(0xffffff, 0x222222);
      v1.position.set(-2, 0, 2);
      v1.rotation.y = Math.PI * 0.25;
      v1.userData.interativo = true;
      v1.userData.nome = msgVaca;
      grpPasto.add(v1);

      const v2 = kit.criarVaca(0xffffff, 0x6d4c41);
      v2.position.set(2, 0, -3.5);
      v2.rotation.y = -Math.PI * 0.35;
      v2.userData.interativo = true;
      v2.userData.nome = msgVaca;
      grpPasto.add(v2);

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
      const pisoCurral = kit.criarChao(22, 36, 0xbcaaa4);
      pisoCurral.position.y = 0.03;
      grpEstabulo.add(pisoCurral);

      // Celeiro Vermelho Tradicional com sótão de feno, lanterna, chaminé e cocho longo
      const estabulo = kit.criarEstabuloPremium(12, 5.2, 9, animaveis);
      estabulo.position.set(0, 0, -6);
      estabulo.userData.interativo = true;
      estabulo.userData.nome = 'Estábulo: na pecuária intensiva, os animais ficam confinados e recebem alimentação balanceada.';
      grpEstabulo.add(estabulo);

      // Vaca confinada se alimentando no cocho
      const v3 = kit.criarVaca(0xffffff, 0x1a1a1a);
      v3.position.set(0, 0, 0.4);
      v3.rotation.y = 0;
      v3.userData.interativo = true;
      v3.userData.nome = msgVaca;
      grpEstabulo.add(v3);

      // Latões metálicos de leite fresco ordenhado
      const msgLatao = 'Latão de leite: a pecuária fornece matérias-primas e alimentos como leite e carne.';
      const l1 = kit.criarLataoLeite(-5.5, 3.5);
      l1.userData.interativo = true;
      l1.userData.nome = msgLatao;
      grpEstabulo.add(l1);

      const l2 = kit.criarLataoLeite(-4.7, 3.2);
      l2.userData.interativo = true;
      l2.userData.nome = msgLatao;
      grpEstabulo.add(l2);

      const l3 = kit.criarLataoLeite(-5.0, 4.2);
      l3.userData.interativo = true;
      l3.userData.nome = msgLatao;
      grpEstabulo.add(l3);

      // Fardos de feno organizados ao lado do estábulo
      const feno3 = kit.criarFardoFeno(7.5, -3, 0.1);
      feno3.userData.interativo = true;
      feno3.userData.nome = msgFeno;
      grpEstabulo.add(feno3);

      const feno4 = kit.criarFardoFeno(7.5, -1.5, 0.25);
      feno4.userData.interativo = true;
      feno4.userData.nome = msgFeno;
      grpEstabulo.add(feno4);

      const feno5 = kit.criarFardoFeno(7.5, 0, -0.1);
      feno5.userData.interativo = true;
      feno5.userData.nome = msgFeno;
      grpEstabulo.add(feno5);

      // Trator agrícola verde estacionado junto ao curral
      const trator = kit.criarTrator(0x2e7d32);
      trator.position.set(6, 0, 8);
      trator.rotation.y = -Math.PI * 0.15;
      trator.userData.interativo = true;
      trator.userData.nome = 'Trator e máquinas usadas para apoiar a produção na fazenda.';
      grpEstabulo.add(trator);

      // Cercas do confinamento
      grpEstabulo.add(kit.criarCerca(10, 0, 36, true));
      grpEstabulo.add(kit.criarCerca(0, -18, 20, false));
      grpEstabulo.add(kit.criarCerca(0, 18, 20, false));

      grpEstabulo.add(kit.criarArbusto(8, 12, 0x43a047));
      grpEstabulo.add(kit.criarPlaca(0, 15, '🏡 ESTÁBULO (INTENSIVA)', 0xc62828));
      scene.add(grpEstabulo);

      // Caminhão azul de transporte na estrada central
      const caminhao = kit.criarCaminhao(0x1976d2);
      caminhao.position.set(0, 0, 8);
      caminhao.userData.interativo = true;
      caminhao.userData.nome = 'Caminhão de transporte: leva produtos da agropecuária do campo para a cidade.';
      scene.add(caminhao);

      // Animação das vaquinhas (cabeça com ruminação, rabo balançando e sininho)
      animaveis.push((now) => {
        [v1, v2, v3].forEach((v) => {
          const off = (v.userData && v.userData.tempo) || 0;
          if (v.userData && v.userData.cabeca) {
            v.userData.cabeca.position.y = v.userData.baseHeadY + Math.sin(now * 2 + off) * 0.06;
            v.userData.cabeca.rotation.x = Math.sin(now * 1.8 + off) * 0.08;
          }
          if (v.userData && v.userData.focinho) {
            v.userData.focinho.rotation.y = Math.sin(now * 6 + off) * 0.07;
          }
          if (v.userData && v.userData.cauda) {
            v.userData.cauda.rotation.z = Math.sin(now * 4 + off) * 0.3;
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
