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
    hudTags: ['🚜 Campo (Lavoura e Mata)', '🏙️ Cidade (Urbano e Rios)'],

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🚜 Olhar Campo', cam: 'campo' },
      { label: '🏙️ Olhar Cidade', cam: 'cidade' },
      { label: '💚 Boas Ações', cam: 'acoes' }
    ],

    cameras: {
      geral:  { pos: [0, 24, 34],   look: [0, 2, 0] },
      campo:  { pos: [-16, 13, 19], look: [-16, 2, 0] },
      cidade: { pos: [16, 13, 19],  look: [16, 2, 0] },
      acoes:  { pos: [6.5, 9, 16],  look: [6.5, 1.5, 7.5] }
    },

    construirCenario: function (scene, kit, animaveis) {
      // 1. CHÃO GERAL
      scene.add(kit.criarChao(72, 48, 0x81c784));

      // 2. RIO CENTRAL CORTANDO O CENÁRIO (Área limpa ao fundo e área com lixo/poluição à frente)
      // Parte montante (limpa): água azul límpida
      const rioLimpo = kit.criarRio(6, 24, 0x29b6f6);
      rioLimpo.position.set(0, 0.06, -12);
      scene.add(rioLimpo);

      // Parte jusante (cidade): água escura com poluição
      const rioPoluido = kit.criarRio(6, 24, 0x455a64);
      rioPoluido.position.set(0, 0.06, 12);
      scene.add(rioPoluido);

      // Ponte ligando Campo e Cidade no centro
      const ponte = kit.criarEstrada(7, 4.5, 0x90a4ae);
      ponte.position.set(0, 0.12, -1);
      scene.add(ponte);
      scene.add(kit.criarCerca(0, -3.2, 7, false, 0x546e7a));
      scene.add(kit.criarCerca(0, 1.2, 7, false, 0x546e7a));

      // Cano de esgoto despejando no rio pela margem da cidade
      const canoEsgoto = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 2.2, 12),
        new THREE.MeshLambertMaterial({ color: 0x37474f })
      );
      canoEsgoto.rotation.z = Math.PI / 2;
      canoEsgoto.position.set(3, 0.4, 5);
      canoEsgoto.castShadow = true;
      scene.add(canoEsgoto);

      // Efluente escuro saindo do cano
      const manchaEsgoto = new THREE.Mesh(
        new THREE.CircleGeometry(1.6, 12),
        new THREE.MeshLambertMaterial({ color: 0x212121 })
      );
      manchaEsgoto.rotation.x = -Math.PI / 2;
      manchaEsgoto.position.set(1.5, 0.08, 5);
      scene.add(manchaEsgoto);

      // Lixo flutuando no rio poluído
      const lixoObjetos = [];
      const coresLixo = [0xd32f2f, 0xfbc02d, 0xffffff, 0x8d6e63];
      for (let i = 0; i < 6; i++) {
        const mat = new THREE.MeshLambertMaterial({ color: coresLixo[i % coresLixo.length] });
        const geo = i % 2 === 0 ? new THREE.BoxGeometry(0.35, 0.25, 0.45) : new THREE.CylinderGeometry(0.18, 0.18, 0.5, 8);
        const l = new THREE.Mesh(geo, mat);
        l.position.set(-1.8 + Math.random() * 3.6, 0.1, 3 + i * 2.8);
        l.rotation.set(Math.random(), Math.random(), Math.random());
        l.userData = { baseY: 0.1, fase: Math.random() * Math.PI * 2 };
        scene.add(l);
        lixoObjetos.push(l);
      }

      // ==========================================
      // LADO ESQUERDO: CAMPO
      // ==========================================
      const grpCampo = new THREE.Group();
      grpCampo.position.set(-18, 0, 0);

      // Chão do campo
      const chaoCampo = kit.criarChao(30, 44, 0x7cb342);
      chaoCampo.position.y = 0.03;
      grpCampo.add(chaoCampo);

      // A) MATA PRESERVADA (Fundo esquerdo)
      grpCampo.add(kit.criarArvore(-8, -16, 0x1b5e20, 0x4e342e));
      grpCampo.add(kit.criarArvore(-4, -17, 0x2e7d32, 0x5d4037));
      grpCampo.add(kit.criarArvore(-9, -11, 0x388e3c, 0x5d4037));
      grpCampo.add(kit.criarArvore(-2, -14, 0x2e7d32, 0x4e342e));
      grpCampo.add(kit.criarArvore(-5, -9, 0x1b5e20, 0x5d4037));
      grpCampo.add(kit.criarArvore(-10, -5, 0x388e3c, 0x4e342e));
      grpCampo.add(kit.criarRochas(-6, -13, 0x757575));
      grpCampo.add(kit.criarPlaca(-4, -5, 'MATA PRESERVADA', 0x2e7d32));

      // B) ÁREA ABERTA / DESMATAMENTO (Frente esquerda)
      const chaoDesmatado = kit.criarChao(14, 14, 0xa1887f);
      chaoDesmatado.position.set(-4, 0.04, 11);
      grpCampo.add(chaoDesmatado);

      // Tocos de árvores cortadas (stumps)
      const tocoGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.45, 8);
      const tocoMat = new THREE.MeshLambertMaterial({ color: 0x4e342e });
      const topoMat = new THREE.MeshLambertMaterial({ color: 0xd7ccc8 });
      [
        [-7, 8], [-2, 7], [-5, 12], [-8, 15], [-1, 14]
      ].forEach(([tx, tz]) => {
        const toco = new THREE.Mesh(tocoGeo, tocoMat);
        toco.position.set(tx, 0.22, tz);
        toco.castShadow = true;
        const anel = new THREE.Mesh(new THREE.CircleGeometry(0.33, 8), topoMat);
        anel.rotation.x = -Math.PI / 2;
        anel.position.set(tx, 0.46, tz);
        grpCampo.add(toco);
        grpCampo.add(anel);
      });
      // Tronco caído
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.8, 6), tocoMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = 0.4;
      log.position.set(-4, 0.2, 10);
      grpCampo.add(log);
      grpCampo.add(kit.criarPlaca(-4, 4, 'DESMATAMENTO', 0xc62828));

      // C) LAVOURA, CANAL DE IRRIGAÇÃO E MÁQUINAS
      const lavoura = kit.criarChao(10, 36, 0x8d6e63);
      lavoura.position.set(7, 0.04, 0);
      grpCampo.add(lavoura);

      // Sulcos / fileiras de plantação
      const plantRowMat = new THREE.MeshLambertMaterial({ color: 0x558b2f });
      for (let z = -14; z <= 14; z += 3.2) {
        const row = new THREE.Mesh(new THREE.BoxGeometry(8, 0.35, 1.2), plantRowMat);
        row.position.set(7, 0.2, z);
        grpCampo.add(row);
      }

      // Canal de água para irrigação
      const canalAgua = kit.criarRio(1.4, 22, 0x42a5f5);
      canalAgua.position.set(13.2, 0.07, -4);
      grpCampo.add(canalAgua);

      // Aspersor / pivô de irrigação
      const aspersorHaste = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6),
        new THREE.MeshLambertMaterial({ color: 0xb0bec5 })
      );
      aspersorHaste.position.set(7, 1.3, -4);
      grpCampo.add(aspersorHaste);

      const aspersorTubo = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 5.5, 6),
        new THREE.MeshLambertMaterial({ color: 0x90a4ae })
      );
      aspersorTubo.rotation.z = Math.PI / 2;
      aspersorTubo.position.set(7, 2.5, -4);
      grpCampo.add(aspersorTubo);

      // Trator na lavoura
      const trator = kit.criarTrator(0x2e7d32);
      trator.position.set(7, 0, 7);
      trator.rotation.y = -Math.PI * 0.15;
      grpCampo.add(trator);

      scene.add(grpCampo);

      // ==========================================
      // LADO DIREITO: CIDADE
      // ==========================================
      const grpCidade = new THREE.Group();
      grpCidade.position.set(18, 0, 0);

      // Chão urbano de asfalto/concreto
      const chaoCidade = kit.criarChao(30, 44, 0x90a4ae);
      chaoCidade.position.y = 0.03;
      grpCidade.add(chaoCidade);

      // A) AVENIDA COM TRÂNSITO DE CARROS
      const avenida = kit.criarChao(7, 44, 0x263238);
      avenida.position.set(-5, 0.05, 0);
      grpCidade.add(avenida);

      // Faixa tracejada central da avenida
      const faixaMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let z = -20; z <= 20; z += 4) {
        const faixa = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 2.2), faixaMat);
        faixa.rotation.x = -Math.PI / 2;
        faixa.position.set(-5, 0.06, z);
        grpCidade.add(faixa);
      }

      // Função construtora de carro low-poly
      function criarCarro(cor) {
        const c = new THREE.Group();
        const chassi = new THREE.Mesh(
          new THREE.BoxGeometry(1.7, 0.65, 3.2),
          new THREE.MeshLambertMaterial({ color: cor })
        );
        chassi.position.y = 0.55;
        chassi.castShadow = true;
        c.add(chassi);

        const cabine = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.65, 1.6),
          new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        cabine.position.set(0, 1.15, -0.2);
        cabine.castShadow = true;
        c.add(cabine);

        const rGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 10);
        const rMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
        [[-0.9, 0.9], [0.9, 0.9], [-0.9, -0.9], [0.9, -0.9]].forEach(([rx, rz]) => {
          const r = new THREE.Mesh(rGeo, rMat);
          r.rotation.z = Math.PI / 2;
          r.position.set(rx, 0.35, rz);
          c.add(r);
        });
        return c;
      }

      // Carros na avenida
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

      // B) PRÉDIOS E SERVIÇOS URBANOS (Fundo da cidade)
      grpCidade.add(kit.criarPredio(5, 14, 5, 0x546e7a));
      const p1 = grpCidade.children[grpCidade.children.length - 1];
      p1.position.set(2, 0, -15);

      grpCidade.add(kit.criarPredio(6, 18, 6, 0x37474f));
      const p2 = grpCidade.children[grpCidade.children.length - 1];
      p2.position.set(9, 0, -14);

      grpCidade.add(kit.criarPredio(5, 11, 5, 0x78909c));
      const p3 = grpCidade.children[grpCidade.children.length - 1];
      p3.position.set(2, 0, -7);

      grpCidade.add(kit.criarPredio(6, 15, 5, 0x455a64));
      const p4 = grpCidade.children[grpCidade.children.length - 1];
      p4.position.set(9, 0, -6);

      // C) ENCOSTA / MORRO COM MORADIAS EM ÁREA DE RISCO (Frente direita)
      const morroGeo = new THREE.BoxGeometry(11, 2.2, 13);
      const morroMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
      const morro = new THREE.Mesh(morroGeo, morroMat);
      morro.position.set(7, 1.1, 12);
      morro.castShadow = true;
      grpCidade.add(morro);

      const gramaMorro = kit.criarChao(10, 12, 0x7cb342);
      gramaMorro.position.set(7, 2.22, 12);
      grpCidade.add(gramaMorro);

      // Moradias na encosta e margem
      const c1 = kit.criarCasa(2.6, 2.0, 2.4, 0xffe0b2, 0xd32f2f);
      c1.position.set(5, 2.2, 9);
      grpCidade.add(c1);

      const c2 = kit.criarCasa(2.4, 1.8, 2.2, 0xffcc80, 0xb71c1c);
      c2.position.set(8.5, 2.2, 14);
      grpCidade.add(c2);

      grpCidade.add(kit.criarPlaca(3.5, 3.5, 'ÁREA DE RISCO', 0xe65100));

      // D) PRAÇA DE BOAS AÇÕES AMBIENTAIS E LIXEIRAS DE COLETA SELETIVA
      const praca = kit.criarChao(6, 10, 0xcfd8dc);
      praca.position.set(-11.5, 0.06, 8);
      grpCidade.add(praca);

      // Árvores plantadas na praça urbana
      grpCidade.add(kit.criarArvore(-13, 11, 0x43a047, 0x5d4037));
      grpCidade.add(kit.criarArvore(-10, 12, 0x388e3c, 0x5d4037));

      // Lixeiras da coleta seletiva (Azul, Vermelha, Verde, Amarela)
      const lixeiras = [
        { cor: 0x1976d2, nome: 'Papel', x: -13.5 },
        { cor: 0xd32f2f, nome: 'Plástico', x: -12.5 },
        { cor: 0x388e3c, nome: 'Vidro', x: -11.5 },
        { cor: 0xfbc02d, nome: 'Metal', x: -10.5 }
      ];
      lixeiras.forEach((lx) => {
        const corpo = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.9, 12),
          new THREE.MeshLambertMaterial({ color: lx.cor })
        );
        corpo.position.set(lx.x, 0.45, 5);
        corpo.castShadow = true;
        const tampa = new THREE.Mesh(
          new THREE.CylinderGeometry(0.33, 0.33, 0.15, 12),
          new THREE.MeshLambertMaterial({ color: 0x37474f })
        );
        tampa.position.set(lx.x, 0.95, 5);
        grpCidade.add(corpo);
        grpCidade.add(tampa);
      });
      grpCidade.add(kit.criarPlaca(-11.5, 3.8, 'RECICLAGEM', 0x1b5e20));

      scene.add(grpCidade);

      // ==========================================
      // ANIMAÇÕES: CARROS, ASPERSOR E LIXO FLUTUANTE
      // ==========================================
      animaveis.push((now) => {
        // Carro azul descendo avenida
        carroAzul.position.z += 0.08;
        if (carroAzul.position.z > 21) carroAzul.position.z = -21;

        // Carro amarelo seguindo mais devagar (trânsito)
        carroAmarelo.position.z += 0.05;
        if (carroAmarelo.position.z > 21) carroAmarelo.position.z = -21;

        // Carro vermelho subindo avenida
        carroVermelho.position.z -= 0.09;
        if (carroVermelho.position.z < -21) carroVermelho.position.z = 21;

        // Aspersor de irrigação oscilando
        aspersorTubo.rotation.y = Math.sin(now * 1.5) * 0.4;

        // Lixo flutuando suavemente
        lixoObjetos.forEach((l) => {
          l.position.y = l.userData.baseY + Math.sin(now * 2.5 + l.userData.fase) * 0.04;
          l.rotation.y += 0.005;
        });
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
