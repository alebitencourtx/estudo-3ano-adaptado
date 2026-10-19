/* jogos/agricultura/dados-3d.js — Dados declarativos do jogo 3D de Agricultura.
   Lido por jogos/jogar-3d.html?topico=agricultura. Usa os helpers em ../jogo-kit-3d.js. */
(function (global) {
  'use strict';
  global.DADOS_3D = global.DADOS_3D || {};

  global.DADOS_3D.agricultura = {
    id: 'agr-3d',
    topico: 'agricultura',
    titulo: 'Plantação 3D da Agricultura',
    icone: '🌾',
    referenciaLivro: 'p. 84, 85, 92, 95 · base do livro',
    skyColor: 0xd7ecfd,
    skyTopo: 0x87ceeb, /* Azul claro para céu limpo */
    skyBase: 0xe8f5e9, /* Verde claro no horizonte */
    hudTags: ['🏡 Subsistência (Familiar)', '🚜 Comercial (Máquinas)'],

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🏡 Subsistência', cam: 'subsistencia' },
      { label: '🚜 Comercial', cam: 'comercial' }
    ],

    cameras: {
      geral:        { pos: [0, 20, 30],   look: [0, 2, 0] },
      subsistencia: { pos: [-14, 11, 16], look: [-14, 1.5, 0] },
      comercial:    { pos: [13, 11, 16],  look: [13, 1.5, -2] },
      alimentos:    { pos: [0, 9, 20],    look: [0, 1.5, 9] }
    },

    fichas3d: [
      {
        id: 'agr-arado',
        pos: [-16, 2.2, 7],
        nome: 'Arado Tradicional',
        foto: '../img/hga/agr/arado.jpg',
        fato: 'O arado tradicional prepara a terra com tração animal.'
      },
      {
        id: 'agr-colheitadeira',
        pos: [15.5, 3.5, 0],
        nome: 'Colheitadeira',
        foto: '../img/hga/agr/colheitadeira.jpg',
        fato: 'A colheitadeira colhe os grãos em grandes lavouras comerciais.'
      },
      {
        id: 'agr-ordenha',
        pos: [-20, 2.5, -4],
        nome: 'Ordenha do Leite',
        foto: '../img/hga/agr/ordenha.jpg',
        fato: 'O leite tirado na fazenda serve para fazer queijos.'
      },
      {
        id: 'agr-silo',
        pos: [19.5, 4.5, -6],
        nome: 'Silo de Grãos',
        foto: '../img/hga/agr/chip.jpg',
        fato: 'O silo armazena os grãos colhidos na agricultura moderna.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Chão principal e estrada central
      scene.add(kit.criarChao(60, 44, 0x86c232));
      scene.add(kit.criarEstrada(5, 44, 0xd9b382));

      // ==========================================
      // LADO ESQUERDO: Agricultura de Subsistência
      // ==========================================
      const grpSubsistencia = new THREE.Group();
      grpSubsistencia.position.set(-14, 0, 0);

      // Terreno da pequena propriedade
      const gramaHorta = kit.criarChao(20, 32, 0x76b82a);
      gramaHorta.position.y = 0.05;
      grpSubsistencia.add(gramaHorta);

      // Cercas simples de madeira delimitando o sítio
      grpSubsistencia.add(kit.criarCerca(-9.5, 0, 30, true));
      grpSubsistencia.add(kit.criarCerca(0, -15.5, 19, false));
      grpSubsistencia.add(kit.criarCerca(0, 15.5, 19, false));

      // Pequena casa familiar
      const casaFamiliar = kit.criarCasa(6, 3.5, 5, 0xfff3e0, 0xb71c1c);
      casaFamiliar.position.set(-2, 0, -8);
      grpSubsistencia.add(casaFamiliar);

      // Árvores frutíferas no quintal
      grpSubsistencia.add(kit.criarArvore(-6, 8, 0x2e7d32, null, 'frutifera'));
      grpSubsistencia.add(kit.criarArvore(-7, -4, 0x388e3c, null, 'frutifera'));
      grpSubsistencia.add(kit.criarArvore(4, -10, 0x43a047));
      kit.criarFlores(grpSubsistencia, -2, -5, 3, 10);

      // Pequeno lago / poço para irrigar a horta
      const poco = kit.criarRio(6, 6, 0x4fa3e3);
      poco.position.set(-5, 0.08, 2);
      grpSubsistencia.add(poco);

      // Canteiro 1: hortaliças e verduras
      const canteiro1 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 2.5), new THREE.MeshLambertMaterial({ color: 0x5d4037 }));
      canteiro1.position.set(2, 0.12, 0);
      canteiro1.receiveShadow = true;
      grpSubsistencia.add(canteiro1);
      for (let ix = -2.2; ix <= 2.2; ix += 1.1) {
        for (let iz = -0.7; iz <= 0.7; iz += 0.7) {
          const folha = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), new THREE.MeshLambertMaterial({ color: 0x43a047 }));
          folha.position.set(ix, 0.35, iz);
          folha.castShadow = true;
          canteiro1.add(folha);
        }
      }

      // Canteiro 2: legumes / cenouras
      const canteiro2 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 2.5), new THREE.MeshLambertMaterial({ color: 0x4e342e }));
      canteiro2.position.set(2, 0.12, 4);
      canteiro2.receiveShadow = true;
      grpSubsistencia.add(canteiro2);
      for (let ix = -2.2; ix <= 2.2; ix += 1.1) {
        for (let iz = -0.7; iz <= 0.7; iz += 0.7) {
          const cenoura = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 6), new THREE.MeshLambertMaterial({ color: 0xff7043 }));
          cenoura.position.set(ix, 0.25, iz);
          cenoura.rotation.x = Math.PI;
          canteiro2.add(cenoura);
          const rama = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), new THREE.MeshLambertMaterial({ color: 0x2e7d32 }));
          rama.position.set(ix, 0.45, iz);
          canteiro2.add(rama);
        }
      }

      // Arado rústico tradicional de madeira e ferro
      const aradoRustico = new THREE.Group();
      aradoRustico.position.set(-2, 0, 7);
      const hasteArado = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 2.2), new THREE.MeshLambertMaterial({ color: 0x6d4c41 }));
      hasteArado.position.set(0, 0.4, 0);
      hasteArado.rotation.x = 0.25;
      aradoRustico.add(hasteArado);
      const laminaArado = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 4), new THREE.MeshLambertMaterial({ color: 0x616161 }));
      laminaArado.position.set(0, 0.2, 0.8);
      laminaArado.rotation.x = -Math.PI / 4;
      aradoRustico.add(laminaArado);
      grpSubsistencia.add(aradoRustico);

      // Placa identificadora
      grpSubsistencia.add(kit.criarPlaca(0, 8, 'SUBSISTÊNCIA', 0x2e7d32));
      scene.add(grpSubsistencia);

      // ==========================================
      // LADO DIREITO: Agricultura Comercial
      // ==========================================
      const grpComercial = new THREE.Group();
      grpComercial.position.set(13, 0, 0);

      // Terreno da grande propriedade comercial
      const pisoComercial = kit.criarChao(20, 32, 0x8bc34a);
      pisoComercial.position.y = 0.05;
      grpComercial.add(pisoComercial);

      grpComercial.add(kit.criarCerca(9.5, 0, 30, true));
      grpComercial.add(kit.criarCerca(0, -15.5, 19, false));
      grpComercial.add(kit.criarCerca(0, 15.5, 19, false));

      // Grande Galpão de armazenamento
      const galpao = kit.criarCasa(10, 4.8, 8, 0x78909c, 0x37474f);
      galpao.position.set(0, 0, -6);
      grpComercial.add(galpao);

      // Silo de grãos cilíndrico com teto cônico
      const silo = new THREE.Group();
      silo.position.set(6.5, 0, -6);
      const corpoSilo = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 6.0, 16), new THREE.MeshLambertMaterial({ color: 0xb0bec5 }));
      corpoSilo.position.y = 3.0;
      corpoSilo.castShadow = true;
      silo.add(corpoSilo);
      const topoCupula = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.4, 16), new THREE.MeshLambertMaterial({ color: 0x546e7a }));
      topoCupula.position.y = 6.7;
      silo.add(topoCupula);
      grpComercial.add(silo);

      // Grande plantação comercial em fileiras paralelas
      const plantacaoComercial = new THREE.Group();
      plantacaoComercial.position.set(-2, 0, 4);
      const soloCultivo = new THREE.Mesh(new THREE.BoxGeometry(11, 0.15, 10), new THREE.MeshLambertMaterial({ color: 0x558b2f }));
      soloCultivo.position.y = 0.08;
      soloCultivo.receiveShadow = true;
      plantacaoComercial.add(soloCultivo);

      const cauleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 5);
      const cauleMat = new THREE.MeshLambertMaterial({ color: 0xaed581 });
      const pontaMat = new THREE.MeshLambertMaterial({ color: 0x689f38 });
      for (let fx = -4.5; fx <= 4.5; fx += 1.5) {
        for (let fz = -4.0; fz <= 4.0; fz += 1.0) {
          const planta = new THREE.Mesh(cauleGeo, cauleMat);
          planta.position.set(fx, 0.8, fz);
          planta.castShadow = true;
          const folhaCana = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 4), pontaMat);
          folhaCana.position.y = 0.8;
          planta.add(folhaCana);
          plantacaoComercial.add(planta);
        }
      }
      grpComercial.add(plantacaoComercial);

      // Trator moderno no campo
      const trator = kit.criarTrator(0x2e7d32);
      trator.position.set(-4, 0, -0.5);
      trator.rotation.y = Math.PI * 0.15;
      grpComercial.add(trator);

      // Colheitadeira moderna com carretel rotativo
      const colheitadeira = new THREE.Group();
      colheitadeira.position.set(2.5, 0, 0);
      colheitadeira.rotation.y = -Math.PI * 0.1;

      const chassiColh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 4.4), new THREE.MeshLambertMaterial({ color: 0xfbc02d }));
      chassiColh.position.y = 1.9;
      chassiColh.castShadow = true;
      colheitadeira.add(chassiColh);

      const cabineColh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.7, 1.8), new THREE.MeshLambertMaterial({ color: 0xe0f7fa }));
      cabineColh.position.set(0, 3.1, 1.3);
      cabineColh.castShadow = true;
      colheitadeira.add(cabineColh);

      // Tubo de descarga de grãos
      const canoDescarga = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 8), new THREE.MeshLambertMaterial({ color: 0xef6c00 }));
      canoDescarga.position.set(-1.8, 3.2, -0.8);
      canoDescarga.rotation.z = Math.PI / 3;
      colheitadeira.add(canoDescarga);

      // Rodas dianteiras grandes
      const rodaGGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.55, 12);
      const rodaMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
      [[-1.6, 1.1], [1.6, 1.1]].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rodaGGeo, rodaMat);
        r.rotation.z = Math.PI / 2;
        r.position.set(rx, 0.95, rz);
        r.castShadow = true;
        colheitadeira.add(r);
      });

      // Rodas traseiras
      const rodaPGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 12);
      [[-1.5, -1.3], [1.5, -1.3]].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rodaPGeo, rodaMat);
        r.rotation.z = Math.PI / 2;
        r.position.set(rx, 0.6, rz);
        r.castShadow = true;
        colheitadeira.add(r);
      });

      // Carretel rotativo frontal
      const carretel = new THREE.Group();
      carretel.position.set(0, 0.85, 2.9);
      const eixoCarretel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.8, 8), new THREE.MeshLambertMaterial({ color: 0x424242 }));
      eixoCarretel.rotation.z = Math.PI / 2;
      carretel.add(eixoCarretel);
      for (let a = 0; a < 4; a++) {
        const lamina = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 0.35), new THREE.MeshLambertMaterial({ color: 0x757575 }));
        lamina.rotation.x = (a * Math.PI) / 2;
        carretel.add(lamina);
      }
      colheitadeira.add(carretel);
      grpComercial.add(colheitadeira);

      // Placa identificadora
      grpComercial.add(kit.criarPlaca(0, 8, 'COMERCIAL', 0x1565c0));
      scene.add(grpComercial);

      // ==========================================
      // CENTRO: Estrada e Caminhão de Transporte
      // ==========================================
      const caminhao = kit.criarCaminhao(0xef6c00);
      caminhao.position.set(0, 0, 10);
      scene.add(caminhao);

      // Animações contínuas
      animaveis.push((now) => {
        carretel.rotation.x = now * 2.5;
        trator.position.y = Math.sin(now * 3) * 0.03;
      });
    },

    missoes: [
      {
        kicker: 'Missão 1 · Agricultura de Subsistência',
        enunciado: 'Onde os alimentos são consumidos pela própria família?',
        respostaCerta: 'subsistencia',
        cam: 'subsistencia',
        foto: '../img/hga/agr/arado.jpg',
        fotoAlt: 'Agricultor usando arado na agricultura de subsistência',
        explicacao: 'Na agricultura de subsistência, a própria família consome os alimentos produzidos.',
        dicaRetry: 'Lembre-se: na subsistência, a própria família consome o que planta.',
        opcoes: [
          { id: 'subsistencia', ico: '🏡', tit: 'Subsistência', desc: 'Pequena propriedade e consumo da família' },
          { id: 'comercial', ico: '🚜', tit: 'Comercial', desc: 'Grande extensão e destinada à venda' }
        ]
      },
      {
        kicker: 'Missão 2 · Agricultura Comercial',
        enunciado: 'Onde a plantação é grande e usa máquinas como colheitadeiras?',
        respostaCerta: 'comercial',
        cam: 'comercial',
        foto: '../img/hga/agr/colheitadeira.jpg',
        fotoAlt: 'Colheitadeira em grande plantação comercial',
        explicacao: 'A agricultura comercial tem propriedades de grande extensão e usa máquinas.',
        dicaRetry: 'A agricultura comercial usa máquinas e grandes extensões de terra.',
        opcoes: [
          { id: 'subsistencia', ico: '🏡', tit: 'Subsistência', desc: 'Pequena propriedade e instrumentos simples' },
          { id: 'comercial', ico: '🚜', tit: 'Comercial', desc: 'Grandes extensões e máquinas modernas' }
        ]
      },
      {
        kicker: 'Missão 3 · Instrumentos de Trabalho',
        enunciado: 'Enxadas, foices e arados pertencem a qual agricultura?',
        respostaCerta: 'subsistencia',
        cam: 'subsistencia',
        foto: '../img/hga/agr/arado.jpg',
        fotoAlt: 'Instrumentos simples na agricultura de subsistência',
        explicacao: 'Instrumentos simples como enxadas, foices e arados são da agricultura de subsistência.',
        dicaRetry: 'Enxadas, foices e arados são instrumentos simples da subsistência.',
        opcoes: [
          { id: 'subsistencia', ico: '🏡', tit: 'Subsistência', desc: 'Usa instrumentos simples como arado e enxada' },
          { id: 'comercial', ico: '🚜', tit: 'Comercial', desc: 'Usa máquinas pesadas como colheitadeiras' }
        ]
      },
      {
        kicker: 'Missão 4 · Destino da Produção',
        enunciado: 'Para onde vai a produção da agricultura comercial?',
        respostaCerta: 'paises',
        cam: 'comercial',
        foto: '../img/hga/agr/colheitadeira.jpg',
        fotoAlt: 'Produção da agricultura comercial vendida para vários lugares',
        explicacao: 'A produção da agricultura comercial é vendida no país e para outros países.',
        dicaRetry: 'A produção comercial é vendida no país e para outros países.',
        opcoes: [
          { id: 'paises', ico: '🌎', tit: 'País e outros países', desc: 'Destinada à venda em grande quantidade' },
          { id: 'mercados_proximos', ico: '🧺', tit: 'Mercados próximos', desc: 'Apenas sobras da agricultura de subsistência' }
        ]
      },
      {
        kicker: 'Missão 5 · Colheita da Cana no Tempo',
        enunciado: 'Hoje, a maioria das plantações de cana colhe com:',
        respostaCerta: 'maquinas',
        cam: 'comercial',
        foto: '../img/hga/agr/cana-facao.jpg',
        fotoAlt: 'Trabalho de colheita da cana-de-açúcar',
        explicacao: 'Hoje, 9 em cada 10 propriedades usam somente colheita mecanizada com máquinas.',
        dicaRetry: 'Hoje em dia a colheita da cana é feita principalmente com máquinas.',
        opcoes: [
          { id: 'maquinas', ico: '🚜', tit: 'Máquinas', desc: 'Colheita mecanizada com colheitadeiras' },
          { id: 'facao', ico: '🔪', tit: 'Facão manual', desc: 'Trabalho manual realizado no passado' }
        ]
      },
      {
        kicker: 'Missão 6 · Alimentos da Agricultura',
        enunciado: 'Toque nos 4 alimentos que vêm da atividade agrícola:',
        tipo: 'produtos',
        cam: 'alimentos',
        foto: '../img/jogo/agr/arroz.svg',
        fotoAlt: 'Alimentos produzidos pela agricultura',
        explicacao: 'O arroz, o feijão, as frutas e as verduras que comemos vêm da atividade agrícola!',
        totalRequerido: 4,
        itens: [
          { id: 'arroz', nome: 'Arroz', img: '../img/jogo/agr/arroz.svg' },
          { id: 'feijao', nome: 'Feijão', img: '../img/jogo/agr/feijao.svg' },
          { id: 'frutas', nome: 'Frutas', img: '../img/jogo/agr/frutas.svg' },
          { id: 'verduras', nome: 'Verduras', img: '../img/jogo/agr/verduras.svg' }
        ]
      }
    ],

    resumoFinal: [
      {
        titulo: '🏡 Agricultura de Subsistência',
        itens: [
          'Pequenas propriedades rurais',
          'Alimentos para o consumo da própria família',
          'O que sobra é vendido em mercados próximos',
          'Instrumentos simples: enxadas, foices e arados',
          'Mão de obra familiar'
        ]
      },
      {
        titulo: '🚜 Agricultura Comercial',
        itens: [
          'Propriedades de média e grande extensão',
          'Produtos destinados à venda no país e para outros países',
          'Uso de máquinas modernas (tratores e colheitadeiras)',
          'Trabalhadores assalariados ou meeiros'
        ]
      }
    ]
  };
})(window);
