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

    visual: {
      cor: true,
      exposicao: 1.05,
      ceu: { topo: 0x87ceeb, base: 0xe8f5e9 },
      nevoa: { cor: 0xe8f5e9, perto: 75, longe: 180 }
    },

    camBotoes: [
      { label: '🗺️ Visão Geral', cam: 'geral' },
      { label: '🏡 Subsistência', cam: 'subsistencia' },
      { label: '🚜 Comercial', cam: 'comercial' },
      { label: '📐 Isométrica', cam: 'isometrica' }
    ],

    cameras: {
      geral:        { pos: [0, 30, 42], look: [0, 2, -2] },
      subsistencia: { pos: [-14, 18, 28], look: [-14, 2, -2] },
      comercial:    { pos: [14, 18, 28], look: [14, 2, -2] },
      isometrica:   { pos: [30, 30, 30], look: [0, 2, 0] },
      alimentos:    { pos: [0, 14, 26], look: [0, 2, 8] }
    },

    fichas3d: [
      {
        id: 'agr-arado',
        pos: [-14.5, 4.0, 5.5],
        nome: 'Arado Tradicional',
        foto: '../img/hga/agr/arado.jpg',
        fato: 'O arado tradicional prepara a terra com tração animal.'
      },
      {
        id: 'agr-colheitadeira',
        pos: [14.0, 4.5, 1.0],
        nome: 'Colheitadeira',
        foto: '../img/hga/agr/colheitadeira.jpg',
        fato: 'A colheitadeira colhe os grãos em grandes lavouras comerciais.'
      },
      {
        id: 'agr-ordenha',
        pos: [-15.0, 4.0, -1.5],
        nome: 'Ordenha do Leite',
        foto: '../img/hga/agr/ordenha.jpg',
        fato: 'O leite tirado na fazenda serve para fazer queijos.'
      },
      {
        id: 'agr-silo',
        pos: [16.0, 5.2, -3.5],
        nome: 'Silo de Grãos',
        foto: '../img/hga/agr/chip.jpg',
        fato: 'O silo armazena os grãos colhidos na agricultura moderna.'
      }
    ],

    construirCenario: function (scene, kit, animaveis) {
      // Pedestal da Ilha Diorama Flutuante estratificado (solo e rochas)
      scene.add(kit.criarIlhaDiorama(60, 44, 4.0, 0x86c232, 0x5d4037));
      scene.add(kit.criarEstrada(5, 44, 0xd9b382));

      // Pedrinhas decorativas, tufos de grama estilizados e flores campestres nos caminhos da fazenda
      [-17, -12, -7, -1, 4, 10, 15].forEach((pz, idx) => {
        // Borda esquerda da estrada (lado familiar)
        kit.criarPedrinhasDecorativas(scene, -2.9, pz, 6, 1.1, { escala: 0.85, cores: [0xd7ccc8, 0xbcaaa4, 0xd9b382] });
        kit.criarTufosGramaDecorativos(scene, -2.85, pz + (idx % 2 === 0 ? 0.7 : -0.7), 5, 0.9, animaveis, 0x7cb342);
        if (idx % 2 === 0) {
          kit.criarFloresCampestresCaminho(scene, -3.0, pz + 1.1, 5, 0.9, animaveis, [0xffffff, 0xfff9c4, 0xf8bbd0]);
        }

        // Borda direita da estrada (lado comercial)
        kit.criarPedrinhasDecorativas(scene, 2.9, pz + 0.9, 6, 1.1, { escala: 0.85, cores: [0xcfd8dc, 0xb0bec5, 0xd9b382] });
        kit.criarTufosGramaDecorativos(scene, 2.85, pz + (idx % 2 === 0 ? -0.7 : 0.7), 5, 0.9, animaveis, 0x8bc34a);
        if (idx % 2 !== 0) {
          kit.criarFloresCampestresCaminho(scene, 3.0, pz - 1.0, 5, 0.9, animaveis, [0xffffff, 0xe1bee7, 0xbbdefb]);
        }
      });

      // Tufos de grama instanciada no sítio familiar balançando ao vento (1 draw call)
      kit.criarGramaInstanciada(scene, animaveis, {
        minX: -23,
        maxX: -5,
        minZ: -15,
        maxZ: 15,
        count: 220,
        cor: 0x7cb342,
        excluir: (gx, gz) => {
          if (Math.hypot(gx - (-16), gz - (-8)) < 4.2) return true; // casa familiar
          if (gx > -15.5 && gx < -8.5 && gz > -2 && gz < 6) return true; // canteiros da horta
          if (Math.hypot(gx - (-19), gz - 2) < 3.5) return true; // poço de irrigação
          if (Math.hypot(gx - (-16), gz - 7) < 2.0) return true; // área do arado
          return false;
        }
      });

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
      casaFamiliar.userData = {
        interativo: true,
        nome: '🏡 Casa da família de agricultores: moradia acolhedora no centro do sítio familiar.',
        som: 'sino'
      };
      grpSubsistencia.add(casaFamiliar);

      // Sombra de contato para aterrar a casa familiar
      const sombraCasa = kit.criarSombraDeContato(-2, -8, 3.8, 3.2, 0.48);
      sombraCasa.position.y = 0.06;
      grpSubsistencia.add(sombraCasa);

      // Alpendre e lanterna acolhedora na varanda da casa familiar acolhendo o estudante
      const suporteLanternaMat = kit.mat('lambert', 0x3e2723);
      const bracoLanterna = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.38), suporteLanternaMat);
      bracoLanterna.position.set(-2, 2.65, -5.35);
      grpSubsistencia.add(bracoLanterna);

      const lanternaCasa = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.28), kit.mat('basic', 0xffb74d));
      lanternaCasa.position.set(-2, 2.45, -5.2);
      grpSubsistencia.add(lanternaCasa);

      // Halo luminoso suave envolvendo a lanterna da varanda
      const haloLanternaCasaMat = kit.mat('basic', 0xffe082, { transparent: true, opacity: 0.35, depthWrite: false });
      const haloLanternaCasa = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), haloLanternaCasaMat);
      haloLanternaCasa.position.set(-2, 2.45, -5.2);
      grpSubsistencia.add(haloLanternaCasa);

      // Lanterna quente e acolhedora com luz âmbar dourada
      const luzCasa = new THREE.PointLight(0xffb74d, 1.15, 10.5);
      luzCasa.position.set(-2, 2.45, -5.1);
      grpSubsistencia.add(luzCasa);

      // Soleira de madeira da varanda com poça suave de luz acolhedora
      const soleiraVaranda = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.2), kit.mat('lambert', 0x6d4c41));
      soleiraVaranda.position.set(-2, 0.08, -5.2);
      grpSubsistencia.add(soleiraVaranda);

      const pocaLuzVarandaMat = kit.mat('basic', 0xffe082, { transparent: true, opacity: 0.35, depthWrite: false });
      const pocaLuzVaranda = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), pocaLuzVarandaMat);
      pocaLuzVaranda.rotation.x = -Math.PI / 2;
      pocaLuzVaranda.position.set(-2, 0.13, -5.2);
      grpSubsistencia.add(pocaLuzVaranda);

      // Piscina de luz acolhedora estendendo-se suavemente ao caminho de pedras
      const piscinaCaminhoCasaMat = kit.mat('basic', 0xffb74d, { transparent: true, opacity: 0.2, depthWrite: false });
      const piscinaCaminhoCasa = new THREE.Mesh(new THREE.CircleGeometry(2.0, 16), piscinaCaminhoCasaMat);
      piscinaCaminhoCasa.rotation.x = -Math.PI / 2;
      piscinaCaminhoCasa.position.set(-2, 0.06, -4.6);
      grpSubsistencia.add(piscinaCaminhoCasa);

      // Árvores frutíferas no quintal
      grpSubsistencia.add(kit.criarArvore(-6, 8, 0x2e7d32, null, 'frutifera'));
      grpSubsistencia.add(kit.criarArvore(-7, -4, 0x388e3c, null, 'frutifera'));
      grpSubsistencia.add(kit.criarArvore(4, -10, 0x43a047));
      // Caminho rústico de pedras chatas e seixos ligando a varanda da casa aos canteiros
      const matPasso = kit.mat('lambert', 0xbcaaa4);
      const passos = [
        [-2.0, -4.2, 0.65, 0.5],
        [-1.8, -3.2, 0.7, 0.55],
        [-1.6, -2.1, 0.65, 0.5],
        [-1.2, -1.0, 0.7, 0.6],
        [-0.8, 0.1, 0.65, 0.55],
        [-3.2, -2.8, 0.6, 0.5],
        [-4.2, -2.0, 0.65, 0.5]
      ];
      passos.forEach(([px, pz, sx, sz]) => {
        const passoMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), matPasso);
        passoMesh.scale.set(sx * 1.6, 0.16, sz * 1.6);
        passoMesh.position.set(px, 0.08, pz);
        passoMesh.rotation.y = Math.random() * Math.PI;
        passoMesh.receiveShadow = true;
        grpSubsistencia.add(passoMesh);

        const sombraPasso = kit.criarSombraContato(px, pz, sx * 0.65, sz * 0.65, 0.28);
        sombraPasso.position.y = 0.06;
        grpSubsistencia.add(sombraPasso);
      });

      kit.criarPedrinhasDecorativas(grpSubsistencia, -1.8, -3.0, 8, 1.4, { escala: 0.7, cores: [0xd7ccc8, 0xbcaaa4, 0xcfd8dc] });
      kit.criarTufosGramaDecorativos(grpSubsistencia, -1.9, -2.4, 5, 1.0, animaveis, 0x8bc34a);
      kit.criarFloresCampestresCaminho(grpSubsistencia, -1.3, -1.5, 6, 1.1, animaveis, [0xffffff, 0xfff9c4, 0xf8bbd0, 0xe1bee7]);

      // Vaquinha da agricultura familiar (fornece leite para queijos e consumo da família)
      const vacaFamiliar = kit.criarVaca(0xffffff, 0x6d4c41);
      vacaFamiliar.position.set(-5, 0, -3);
      vacaFamiliar.rotation.y = Math.PI * 0.35;
      vacaFamiliar.userData = {
        interativo: true,
        nome: '🐄 Vaca leiteira do sítio: animal dócil que fornece leite fresco e queijos para a família.',
        som: 'moo'
      };
      grpSubsistencia.add(vacaFamiliar);
      const sombraVaca = kit.criarSombraDeContato(-5, -3, 1.3, 1.8, 0.42);
      sombraVaca.position.y = 0.06;
      grpSubsistencia.add(sombraVaca);

      // Fardos de feno para alimentação dos animais no sítio
      const fenoSub1 = kit.criarFardoFeno(-7, -1, 0.3);
      fenoSub1.userData = {
        interativo: true,
        nome: '🌾 Fardo de feno: forragem nutritiva para alimentar os animais do sítio.',
        som: 'pop'
      };
      grpSubsistencia.add(fenoSub1);

      const fenoSub2 = kit.criarFardoFeno(-6.5, 4.5, -0.4);
      fenoSub2.userData = {
        interativo: true,
        nome: '🌾 Fardo de feno: forragem nutritiva para alimentar os animais do sítio.',
        som: 'pop'
      };
      grpSubsistencia.add(fenoSub2);

      // Poço de irrigação artesanal em pedra rústica com balde e telhado de madeira
      const poco = new THREE.Group();
      poco.position.set(-5, 0, 2);
      poco.userData = {
        interativo: true,
        pistaMissao: 2,
        nome: '🪣 Poço artesanal de pedra: fornece água pura com balde para irrigar a horta familiar.',
        som: 'chime',
        aoClicar: function (alvo) {
          alvo.userData.turboAte = performance.now() * 0.001 + 3.0;
        }
      };

      // Espelho d'água translúcido circular com reflexos cristalinos
      const aguaPocoGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.12, 16);
      const aguaPocoMat = kit.mat('phong', 0x29b6f6, { transparent: true, opacity: 0.88, shininess: 100 });
      const aguaPoco = new THREE.Mesh(aguaPocoGeo, aguaPocoMat);
      aguaPoco.position.y = 0.28;
      poco.add(aguaPoco);

      // Borda cilíndrica de alvenaria de pedra do poço
      const bordaPocoGeo = new THREE.CylinderGeometry(1.85, 1.95, 0.7, 16, 1, true);
      const bordaPocoMat = kit.mat('lambert', 0x78909c);
      const bordaPoco = new THREE.Mesh(bordaPocoGeo, bordaPocoMat);
      bordaPoco.position.y = 0.35;
      bordaPoco.castShadow = true;
      poco.add(bordaPoco);

      // Pedras e seixos rústicos esculpidos ao redor da borda
      const pedraCores = [0x607d8b, 0x546e7a, 0x90a4ae, 0x78909c];
      const pedraGeo = new THREE.DodecahedronGeometry(0.24, 0);
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const pMat = kit.mat('lambert', pedraCores[i % pedraCores.length]);
        const pedra = new THREE.Mesh(pedraGeo, pMat);
        pedra.position.set(Math.cos(ang) * 1.9, 0.68, Math.sin(ang) * 1.9);
        pedra.scale.set(1.2, 0.7, 1.0);
        pedra.castShadow = true;
        poco.add(pedra);
      }

      // Pilares de madeira rústica e vigas de sustentação
      const pilarMat = kit.mat('lambert', 0x5d4037);
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.1, 0.18), pilarMat);
      p1.position.set(-1.45, 1.25, 0);
      p1.castShadow = true;
      poco.add(p1);

      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.1, 0.18), pilarMat);
      p2.position.set(1.45, 1.25, 0);
      p2.castShadow = true;
      poco.add(p2);

      // Mãos-francesas / reforços diagonais de madeira
      [-1.3, 1.3].forEach((mx) => {
        const trava = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.1), pilarMat);
        trava.position.set(mx, 2.05, 0);
        trava.rotation.z = mx > 0 ? -Math.PI / 4 : Math.PI / 4;
        poco.add(trava);
      });

      const viga = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 0.18), pilarMat);
      viga.position.set(0, 2.25, 0);
      viga.castShadow = true;
      poco.add(viga);

      // Sarilho / carretel de madeira com corda enrolada
      const eixoSarilho = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.2, 8), kit.mat('lambert', 0x4e342e));
      eixoSarilho.rotation.z = Math.PI / 2;
      eixoSarilho.position.set(0, 1.7, 0);
      poco.add(eixoSarilho);

      const cordaEnrolada = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8), kit.mat('lambert', 0xd7ccc8));
      cordaEnrolada.rotation.z = Math.PI / 2;
      cordaEnrolada.position.set(0, 1.7, 0);
      poco.add(cordaEnrolada);
      poco.userData.sarilho = eixoSarilho;
      poco.userData.corda = cordaEnrolada;

      // Corda suspensa descendo até o balde
      const cordaSuspensa = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4), kit.mat('lambert', 0xd7ccc8));
      cordaSuspensa.position.set(0, 1.25, 0);
      poco.add(cordaSuspensa);

      // Telhado aconchegante de tábuas de madeira em duas águas
      const telhadoMat = kit.mat('lambert', 0x8d6e63);
      const telhaAba1 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.45), telhadoMat);
      telhaAba1.position.set(0, 2.72, -0.55);
      telhaAba1.rotation.x = Math.PI * 0.22;
      telhaAba1.castShadow = true;
      poco.add(telhaAba1);

      const telhaAba2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.45), telhadoMat);
      telhaAba2.position.set(0, 2.72, 0.55);
      telhaAba2.rotation.x = -Math.PI * 0.22;
      telhaAba2.castShadow = true;
      poco.add(telhaAba2);

      // Balde de madeira com aros metálicos suspenso no poço
      const baldeGrp = new THREE.Group();
      baldeGrp.position.set(0, 0.85, 0);

      const baldeMadeira = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.42, 8), kit.mat('lambert', 0x5d4037));
      baldeMadeira.castShadow = true;
      baldeGrp.add(baldeMadeira);

      const aroBaldeMat = kit.mat('lambert', 0x37474f);
      [-0.1, 0.1].forEach((by) => {
        const aro = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.21, 0.04, 8), aroBaldeMat);
        aro.position.y = by;
        baldeGrp.add(aro);
      });

      const alcaBalde = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 4, 10, Math.PI), aroBaldeMat);
      alcaBalde.position.set(0, 0.21, 0);
      baldeGrp.add(alcaBalde);
      poco.add(baldeGrp);

      // Segundo balde cheio de água fresca apoiado na borda de pedra
      const baldeBorda = baldeGrp.clone();
      baldeBorda.position.set(1.3, 0.88, 0.4);
      baldeBorda.scale.set(0.85, 0.85, 0.85);
      poco.add(baldeBorda);

      // Brilho azul límpido cristalino no interior do poço iluminando a água pura
      const luzPoco = new THREE.PointLight(0x80d8ff, 0.65, 6.5);
      luzPoco.position.set(0, 0.55, 0);
      poco.add(luzPoco);

      // Realce translúcido cintilante do espelho d'água interior
      const brilhoAguaPocoMat = kit.mat('basic', 0x80d8ff, { transparent: true, opacity: 0.35, depthWrite: false });
      const brilhoAguaPoco = new THREE.Mesh(new THREE.CircleGeometry(1.4, 16), brilhoAguaPocoMat);
      brilhoAguaPoco.rotation.x = -Math.PI / 2;
      brilhoAguaPoco.position.y = 0.29;
      poco.add(brilhoAguaPoco);

      grpSubsistencia.add(poco);
      grpSubsistencia.add(kit.criarSombraDeContato(-5, 2, 2.2, 2.2, 0.45));

      // ==========================================
      // Horta Rica e Diversificada da Agricultura Familiar
      // ==========================================
      const horta = new THREE.Group();
      horta.position.set(2, 0, 0);
      horta.userData = {
        interativo: true,
        pistaMissao: [0, 5],
        nome: '🌱 Horta da agricultura familiar: cultivo de legumes, folhas e verduras frescas para o consumo da família.',
        som: 'pop'
      };

      const madeiraCanteiroMat = kit.mat('lambert', 0x5d4037);
      const madeiraCantoMat = kit.mat('lambert', 0x4e342e);
      const pregoMat = kit.mat('phong', 0xb0bec5, { shininess: 85 });
      const noMadeiraCanteiroMat = kit.mat('toon', 0x3e2723);
      const terraHumusBaseMat = kit.mat('toon', 0x221611); // Terra preta profunda rica em húmus
      const terraHumusCristaMat = kit.mat('toon', 0x2c1d16); // Cristas dos sulcos de plantio

      // Helper para montar caixote de canteiro elevado com sulcos de terra preta e pregos aparentes
      const criarBaseCanteiro = (w, d) => {
        const cGrp = new THREE.Group();

        // 1. Base profunda de solo fértil (terra preta rica em matéria orgânica / húmus)
        const terraBase = new THREE.Mesh(new THREE.BoxGeometry(w - 0.22, 0.22, d - 0.22), terraHumusBaseMat);
        terraBase.position.y = 0.11;
        terraBase.receiveShadow = true;
        cGrp.add(terraBase);

        // 2. Sulcos e camalhões de terra arada bem definidos (3 leiras volumétricas longitudinais)
        const numSulcos = 3;
        const largSulco = (d - 0.5) / numSulcos;
        for (let s = 0; s < numSulcos; s++) {
          const zSulco = -d / 2 + 0.35 + s * largSulco + largSulco / 2;

          // Camalhão / leira elevada de terra arada
          const leiraGeo = new THREE.CylinderGeometry(largSulco * 0.42, largSulco * 0.48, w - 0.35, 12);
          const leira = new THREE.Mesh(leiraGeo, terraHumusCristaMat);
          leira.rotation.z = Math.PI / 2;
          leira.position.set(0, 0.24, zSulco);
          leira.receiveShadow = true;
          cGrp.add(leira);

          // Valetas de irrigação entre os sulcos
          if (s < numSulcos - 1) {
            const valaGeo = new THREE.BoxGeometry(w - 0.35, 0.04, 0.14);
            const vala = new THREE.Mesh(valaGeo, terraHumusBaseMat);
            vala.position.set(0, 0.21, zSulco + largSulco / 2);
            cGrp.add(vala);
          }
        }

        // 3. Bordas de madeira rústica com pregos visíveis
        const pranchas = [
          { geo: new THREE.BoxGeometry(w, 0.30, 0.12), pos: [0, 0.15, d / 2 - 0.06] },
          { geo: new THREE.BoxGeometry(w, 0.30, 0.12), pos: [0, 0.15, -d / 2 + 0.06] },
          { geo: new THREE.BoxGeometry(0.12, 0.30, d), pos: [w / 2 - 0.06, 0.15, 0] },
          { geo: new THREE.BoxGeometry(0.12, 0.30, d), pos: [-w / 2 + 0.06, 0.15, 0] }
        ];

        pranchas.forEach((p) => {
          const pranchaMesh = new THREE.Mesh(p.geo, madeiraCanteiroMat);
          pranchaMesh.position.set(p.pos[0], p.pos[1], p.pos[2]);
          pranchaMesh.castShadow = true;
          pranchaMesh.receiveShadow = true;
          cGrp.add(pranchaMesh);
        });

        // Nós de madeira rústica estilizados nas pranchas
        [-w * 0.3, w * 0.3].forEach((nx) => {
          const no = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), noMadeiraCanteiroMat);
          no.position.set(nx, 0.16, d / 2 - 0.005);
          no.rotation.x = Math.PI / 2;
          cGrp.add(no);
        });

        // 4. Cantoneiras de madeira nos 4 cantos reforçadas com pregos visíveis
        const pregoGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.03, 6);
        const cabecaPregoGeo = new THREE.SphereGeometry(0.024, 6, 6);

        [
          [-w / 2 + 0.06, -d / 2 + 0.06],
          [w / 2 - 0.06, -d / 2 + 0.06],
          [-w / 2 + 0.06, d / 2 - 0.06],
          [w / 2 - 0.06, d / 2 - 0.06]
        ].forEach(([cx, cz]) => {
          // Estaca de canto
          const estacaCanto = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.16), madeiraCantoMat);
          estacaCanto.position.set(cx, 0.17, cz);
          estacaCanto.castShadow = true;
          cGrp.add(estacaCanto);

          // Pregos metálicos visíveis com cabeças brilhantes pregadas na madeira
          [0.10, 0.22].forEach((py) => {
            const prego1 = new THREE.Mesh(cabecaPregoGeo, pregoMat);
            prego1.position.set(cx, py, cz > 0 ? cz + 0.09 : cz - 0.09);
            cGrp.add(prego1);

            const prego2 = new THREE.Mesh(cabecaPregoGeo, pregoMat);
            prego2.position.set(cx > 0 ? cx + 0.09 : cx - 0.09, py, cz);
            cGrp.add(prego2);
          });
        });

        return cGrp;
      };

      // ------------------------------------------
      // CANTEIRO 1: Cenouras e Raízes Nutritivas (z = 0)
      // ------------------------------------------
      const canteiroCenouras = criarBaseCanteiro(5.8, 2.4);
      canteiroCenouras.position.set(0, 0, 0);
      canteiroCenouras.userData = {
        interativo: true,
        pistaMissao: 0,
        nome: '🥕 Canteiro de cenouras: raízes frescas e crocantes cultivadas com carinho pela família.',
        som: 'pop',
        aoClicar: function (alvo) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.6;
        }
      };

      const cenouraMat = kit.mat('toon', 0xff7043);
      const ramaCenouraMat = kit.mat('toon', 0x2e7d32);
      const cenouraGeo = new THREE.ConeGeometry(0.14, 0.42, 6);
      const ramaGeo = new THREE.DodecahedronGeometry(0.18, 0);

      for (let cx = -2.3; cx <= 2.3; cx += 0.92) {
        for (let cz = -0.7; cz <= 0.7; cz += 0.7) {
          // Pontinha da cenoura despontando da terra
          const cen = new THREE.Mesh(cenouraGeo, cenouraMat);
          cen.position.set(cx, 0.26, cz);
          cen.rotation.x = Math.PI;
          canteiroCenouras.add(cen);

          // Folhagem verde farta em cima
          const rama = new THREE.Mesh(ramaGeo, ramaCenouraMat);
          rama.position.set(cx, 0.48, cz);
          rama.scale.set(0.9, 1.2, 0.9);
          rama.castShadow = true;
          canteiroCenouras.add(rama);
        }
      }

      // Plaquinha indicativa no canteiro de cenouras
      const plaquinhaCenoura = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.04), kit.mat('lambert', 0xd7ccc8));
      plaquinhaCenoura.position.set(-2.5, 0.5, 1.05);
      const estacaPlaca1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), madeiraCanteiroMat);
      estacaPlaca1.position.set(-2.5, 0.25, 1.05);
      canteiroCenouras.add(estacaPlaca1);
      canteiroCenouras.add(plaquinhaCenoura);

      horta.add(canteiroCenouras);

      // ------------------------------------------
      // CANTEIRO 2: Abóboras Redondas e Morangas Douradas (z = 3.6)
      // ------------------------------------------
      const canteiroAboboras = criarBaseCanteiro(5.8, 2.4);
      canteiroAboboras.position.set(0, 0, 3.6);
      canteiroAboboras.userData = {
        interativo: true,
        pistaMissao: 5,
        nome: '🎃 Canteiro de abóboras: frutos fartos, dourados e nutritivos colhidos na horta do sítio.',
        som: 'pop',
        aoClicar: function (alvo) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.6;
        }
      };

      const aboboraLaranjaMat = kit.mat('toon', 0xf57c00);
      const aboboraAmarelaMat = kit.mat('toon', 0xffa726);
      const cauleAboboraMat = kit.mat('lambert', 0x33691e);
      const ramaAboboraMat = kit.mat('lambert', 0x388e3c);

      // Ramas rasteiras verdes pelo chão do canteiro
      [-1.8, 0, 1.8].forEach((vx) => {
        const videira = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.06), ramaAboboraMat);
        videira.position.set(vx, 0.25, 0);
        videira.rotation.y = 0.3;
        canteiroAboboras.add(videira);
      });

      // 7 abóboras fofas com formato gordinho e cabinho verde
      const aboborasConfig = [
        [-2.0, -0.4, 0.42, aboboraLaranjaMat],
        [-1.2, 0.45, 0.36, aboboraAmarelaMat],
        [-0.3, -0.35, 0.46, aboboraLaranjaMat],
        [0.6, 0.4, 0.38, aboboraAmarelaMat],
        [1.3, -0.45, 0.44, aboboraLaranjaMat],
        [2.1, 0.35, 0.40, aboboraLaranjaMat],
        [0.2, 0.0, 0.35, aboboraAmarelaMat]
      ];

      aboborasConfig.forEach(([abx, abz, r, mat]) => {
        const aGrp = new THREE.Group();
        aGrp.position.set(abx, 0.24 + r * 0.7, abz);

        // Corpo gordinho da abóbora (esfera ligeiramente achatada)
        const corpoAbobora = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
        corpoAbobora.scale.set(1.2, 0.85, 1.2);
        corpoAbobora.castShadow = true;
        aGrp.add(corpoAbobora);

        // Cabinho verde curvado
        const cabinho = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.22, 6), cauleAboboraMat);
        cabinho.position.set(0, r * 0.85 + 0.08, 0);
        cabinho.rotation.z = 0.2;
        aGrp.add(cabinho);

        canteiroAboboras.add(aGrp);
      });

      horta.add(canteiroAboboras);

      // ------------------------------------------
      // CANTEIRO 3: Alfaces Crespas, Couves e Hortaliças (z = -3.6)
      // ------------------------------------------
      const canteiroAlfaces = criarBaseCanteiro(5.8, 2.4);
      canteiroAlfaces.position.set(0, 0, -3.6);
      canteiroAlfaces.userData = {
        interativo: true,
        nome: '🥬 Canteiro de alfaces e verduras: folhas verdes frescas e saudáveis para a salada da família.',
        som: 'pop'
      };

      const alfaceMat1 = kit.mat('toon', 0x7cb342);
      const alfaceMat2 = kit.mat('toon', 0x43a047);
      const repolhoMat = kit.mat('toon', 0x388e3c);

      for (let ax = -2.2; ax <= 2.2; ax += 0.88) {
        for (let az = -0.7; az <= 0.7; az += 0.7) {
          const aGrp = new THREE.Group();
          aGrp.position.set(ax, 0.25, az);

          const matUsado = (Math.abs(ax) < 1.0) ? repolhoMat : ((az > 0) ? alfaceMat1 : alfaceMat2);
          // Camada base de folhas
          const baseFolhas = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), matUsado);
          baseFolhas.scale.set(1.15, 0.7, 1.15);
          baseFolhas.position.y = 0.14;
          baseFolhas.castShadow = true;
          aGrp.add(baseFolhas);

          // Miolo interno repicado
          const mioloFolha = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), matUsado);
          mioloFolha.position.y = 0.28;
          aGrp.add(mioloFolha);

          canteiroAlfaces.add(aGrp);
        }
      }

      horta.add(canteiroAlfaces);

      // ------------------------------------------
      // Tomateiros verticais tutorados com estacas de bambu
      // ------------------------------------------
      const tomateiroGrp = new THREE.Group();
      tomateiroGrp.position.set(3.4, 0, -1.8);
      tomateiroGrp.userData = {
        interativo: true,
        nome: '🍅 Pés de tomate: frutos vermelhos e maduros tutorados com estacas de bambu.',
        som: 'pop'
      };

      [-0.8, 0, 0.8].forEach((tz) => {
        const estaca = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 5), kit.mat('lambert', 0x8d6e63));
        estaca.position.set(0, 0.95, tz);
        estaca.castShadow = true;
        tomateiroGrp.add(estaca);

        // Folhagem do tomateiro
        const folhaTomate = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 5), kit.mat('toon', 0x2e7d32));
        folhaTomate.position.set(0, 0.9, tz);
        folhaTomate.castShadow = true;
        tomateiroGrp.add(folhaTomate);

        // Frutos de tomates vermelhos maduros
        const tomateMat = kit.mat('phong', 0xe53935, { shininess: 80 });
        [[-0.2, 0.6, 0.15], [0.18, 0.85, -0.15], [-0.15, 1.1, -0.1]].forEach(([tx, ty, offz]) => {
          const tom = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), tomateMat);
          tom.position.set(tx, ty, tz + offz);
          tomateiroGrp.add(tom);
        });
      });
      horta.add(tomateiroGrp);

      // Regador rústico de zinco apoiado ao lado da horta
      const regador = new THREE.Group();
      regador.position.set(-3.2, 0, 1.2);
      regador.userData = {
        interativo: true,
        nome: '🚿 Regador de metal: instrumento manual usado para irrigar as plantas da horta.',
        som: 'splash'
      };

      const zincoMat = kit.mat('lambert', 0x90a4ae);
      const corpoRegador = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.45, 8), zincoMat);
      corpoRegador.position.y = 0.23;
      corpoRegador.castShadow = true;
      regador.add(corpoRegador);

      const bicoRegador = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 6), zincoMat);
      bicoRegador.position.set(0.35, 0.35, 0);
      bicoRegador.rotation.z = -Math.PI / 3;
      regador.add(bicoRegador);

      const chuveiroRegador = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.12, 6), zincoMat);
      chuveiroRegador.position.set(0.6, 0.48, 0);
      chuveiroRegador.rotation.z = -Math.PI / 3;
      regador.add(chuveiroRegador);

      const alcaRegador = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 10, Math.PI), zincoMat);
      alcaRegador.position.set(-0.05, 0.44, 0);
      alcaRegador.rotation.z = -Math.PI * 0.15;
      regador.add(alcaRegador);

      horta.add(regador);

      grpSubsistencia.add(horta);

      // Sombras de contato suaves para os 3 canteiros
      const sombraC1 = kit.criarSombraDeContato(2, 0, 3.1, 1.4, 0.38);
      sombraC1.position.y = 0.06;
      grpSubsistencia.add(sombraC1);

      const sombraC2 = kit.criarSombraDeContato(2, 3.6, 3.1, 1.4, 0.38);
      sombraC2.position.y = 0.06;
      grpSubsistencia.add(sombraC2);

      const sombraC3 = kit.criarSombraDeContato(2, -3.6, 3.1, 1.4, 0.38);
      sombraC3.position.y = 0.06;
      grpSubsistencia.add(sombraC3);

      // ==========================================
      // Carroça Tradicional de Madeira (Carro de Boi) com Colheita Farta
      // ==========================================
      const carroca = new THREE.Group();
      carroca.position.set(-6.0, 0, 6.0);
      carroca.rotation.y = Math.PI * 0.12;
      carroca.userData = {
        interativo: true,
        nome: '🛞 Carroça com bois: veículo tradicional de madeira puxado por animais para transportar a colheita.',
        som: 'pop'
      };

      const madeiraCarrocaMat = kit.mat('lambert', 0x6d4c41);
      const madeiraClaraMat = kit.mat('lambert', 0x8d6e63);
      const ferroRodaMat = kit.mat('lambert', 0x3e2723);

      // Eixo de madeira reforçado
      const eixoCarroca = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 2.3), ferroRodaMat);
      eixoCarroca.position.y = 0.85;
      carroca.add(eixoCarroca);

      // As duas grandes rodas de madeira raiadas
      const rodaMadeiraGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.12, 14);
      [-1.15, 1.15].forEach((rz) => {
        const rGrp = new THREE.Group();
        rGrp.position.set(0, 0.85, rz);

        // Aro de ferro externo
        const pneu = new THREE.Mesh(rodaMadeiraGeo, ferroRodaMat);
        pneu.rotation.x = Math.PI / 2;
        pneu.castShadow = true;
        rGrp.add(pneu);

        // Cubo central de madeira torneada
        const cuboRoda = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 8), madeiraCarrocaMat);
        cuboRoda.rotation.x = Math.PI / 2;
        rGrp.add(cuboRoda);

        // Raios da roda
        for (let r = 0; r < 6; r++) {
          const raio = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.55, 0.04), madeiraClaraMat);
          raio.rotation.z = (r * Math.PI) / 6;
          rGrp.add(raio);
        }

        carroca.add(rGrp);
      });

      // Caçamba / estrado da carroça
      const estradoCarroca = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 1.6), madeiraCarrocaMat);
      estradoCarroca.position.set(0, 1.0, 0);
      estradoCarroca.castShadow = true;
      carroca.add(estradoCarroca);

      // Laterais com fueiros e tábuas de proteção
      [-0.78, 0.78].forEach((sz) => {
        const lateralTabua = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.08), madeiraClaraMat);
        lateralTabua.position.set(0, 1.3, sz);
        carroca.add(lateralTabua);

        // 4 fueiros verticais
        [-1.1, -0.35, 0.35, 1.1].forEach((fx) => {
          const fueiro = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.65, 0.1), madeiraCarrocaMat);
          fueiro.position.set(fx, 1.35, sz);
          carroca.add(fueiro);
        });
      });

      // Painel traseiro
      const traseiraTabua = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 1.5), madeiraClaraMat);
      traseiraTabua.position.set(-1.26, 1.3, 0);
      carroca.add(traseiraTabua);

      // Varais frontais de tração (onde se atrela o animal)
      [-0.45, 0.45].forEach((vz) => {
        const varal = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.4, 6), madeiraCarrocaMat);
        varal.rotation.z = Math.PI / 2;
        varal.position.set(2.2, 0.82, vz);
        carroca.add(varal);
      });

      // Perna de apoio frontal da carroça
      const pernaApoio = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), madeiraCarrocaMat);
      pernaApoio.position.set(1.4, 0.45, 0);
      carroca.add(pernaApoio);

      // Cargas transportadas na carroça: caixas de hortaliças, abóboras e sacos
      // Caixa de madeira com cenouras
      const caixaMadeira = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.4, 0.65), kit.mat('lambert', 0xa1887f));
      caixaMadeira.position.set(-0.65, 1.3, -0.32);
      carroca.add(caixaMadeira);

      const cenourasCaixa = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.15, 0.55), kit.mat('toon', 0xff7043));
      cenourasCaixa.position.set(-0.65, 1.5, -0.32);
      carroca.add(cenourasCaixa);

      // 3 belas abóboras empilhadas
      const aboboraC1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), kit.mat('toon', 0xf57c00));
      aboboraC1.scale.set(1.2, 0.85, 1.2);
      aboboraC1.position.set(0.35, 1.35, -0.35);
      carroca.add(aboboraC1);

      const aboboraC2 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), kit.mat('toon', 0xffa726));
      aboboraC2.scale.set(1.2, 0.85, 1.2);
      aboboraC2.position.set(0.42, 1.32, 0.35);
      carroca.add(aboboraC2);

      const aboboraC3 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), kit.mat('toon', 0xf57c00));
      aboboraC3.scale.set(1.2, 0.85, 1.2);
      aboboraC3.position.set(0.38, 1.7, 0);
      carroca.add(aboboraC3);

      // Sacos de batatas / mandioca na carroça
      const sacoBatatas = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.3, 0.8), kit.mat('lambert', 0xbcaaa4));
      sacoBatatas.position.set(-0.6, 1.25, 0.35);
      carroca.add(sacoBatatas);

      // Boi de tração atrelado à frente da carroça
      const boiCarroca = kit.criarVaca(0x8d6e63, 0x3e2723);
      boiCarroca.position.set(3.4, 0, 0);
      boiCarroca.userData = {
        interativo: true,
        nome: '🐂 Boi de tração da carroça: animal forte e paciente que puxa a colheita no sítio.',
        som: 'moo',
        aoClicar: function (alvo) {
          alvo.userData.reacaoToqueAte = performance.now() * 0.001 + 1.8;
        }
      };
      carroca.add(boiCarroca);

      grpSubsistencia.add(carroca);
      grpSubsistencia.add(kit.criarSombraDeContato(-6.0, 6.0, 2.2, 1.8, 0.45));

      // Arado rústico tradicional de madeira e ferro (preservado para a missão didática)
      const aradoRustico = new THREE.Group();
      aradoRustico.position.set(-2, 0, 7.2);
      aradoRustico.userData = {
        interativo: true,
        pistaMissao: 2,
        nome: '⛏️ Arado tradicional: instrumento puxado por animais para preparar a terra na agricultura familiar.',
        som: 'pop'
      };
      const hasteArado = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 2.2), new THREE.MeshLambertMaterial({ color: 0x6d4c41 }));
      hasteArado.position.set(0, 0.4, 0);
      hasteArado.rotation.x = 0.25;
      aradoRustico.add(hasteArado);
      const laminaArado = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 4), new THREE.MeshLambertMaterial({ color: 0x616161 }));
      laminaArado.position.set(0, 0.2, 0.8);
      laminaArado.rotation.x = -Math.PI / 4;
      aradoRustico.add(laminaArado);
      grpSubsistencia.add(aradoRustico);

      const sombraArado = kit.criarSombraDeContato(-2, 7.2, 1.2, 1.0, 0.35);
      sombraArado.position.y = 0.06;
      grpSubsistencia.add(sombraArado);

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
      galpao.userData = {
        interativo: true,
        pistaMissao: 3,
        nome: '🏢 Galpão de armazenamento: guarda os maquinários e a produção da fazenda comercial.',
        som: 'sino'
      };
      grpComercial.add(galpao);

      const sombraGalpao = kit.criarSombraDeContato(0, -6, 5.6, 4.6, 0.48);
      sombraGalpao.position.y = 0.06;
      grpComercial.add(sombraGalpao);

      // Silo de grãos moderno com chapas metálicas frisadas e telhado cônico com arremate nobre
      const silo = new THREE.Group();
      silo.position.set(6.5, 0, -6);
      silo.userData = {
        interativo: true,
        pistaMissao: 3,
        nome: '🏗️ Silo de grãos moderno: com chapas metálicas frisadas, escada de segurança e arremate nobre para armazenar cereais.',
        som: 'sino'
      };

      const acoGalvanizadoMat = kit.mat('standard', 0xcfd8dc, { metalness: 0.75, roughness: 0.32 });
      const frisoAcoMat = kit.mat('standard', 0xb0bec5, { metalness: 0.82, roughness: 0.28 });
      const acoEscuroMat = kit.mat('lambert', 0x455a64);
      const telhadoSiloMat = kit.mat('standard', 0x546e7a, { metalness: 0.65, roughness: 0.38 });
      const arremateNobreMat = kit.mat('standard', 0x37474f, { metalness: 0.85, roughness: 0.25 });

      // Corpo cilíndrico principal
      const corpoSilo = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 6.0, 24), acoGalvanizadoMat);
      corpoSilo.position.y = 3.0;
      corpoSilo.castShadow = true;
      corpoSilo.receiveShadow = true;
      silo.add(corpoSilo);

      // Chapas metálicas frisadas: anéis ondulados em relevo ao longo do cilindro
      for (let fr = 0.5; fr <= 5.5; fr += 0.55) {
        const frisoRing = new THREE.Mesh(new THREE.TorusGeometry(1.61, 0.035, 6, 24), frisoAcoMat);
        frisoRing.rotation.x = Math.PI / 2;
        frisoRing.position.y = fr;
        silo.add(frisoRing);

        // Rebites / parafusos nas costuras horizontais das chapas
        for (let reb = 0; reb < 8; reb++) {
          const angReb = (reb / 8) * Math.PI * 2;
          const ptoReb = new THREE.Mesh(new THREE.SphereGeometry(0.024, 4, 4), acoEscuroMat);
          ptoReb.position.set(Math.cos(angReb) * 1.63, fr, Math.sin(angReb) * 1.63);
          silo.add(ptoReb);
        }
      }

      // Costuras verticais reforçadas de união das chapas frisadas
      for (let cv = 0; cv < 4; cv++) {
        const angCv = (cv * Math.PI) / 2 + 0.35;
        const costuraV = new THREE.Mesh(new THREE.BoxGeometry(0.05, 5.9, 0.04), frisoAcoMat);
        costuraV.position.set(Math.cos(angCv) * 1.61, 3.0, Math.sin(angCv) * 1.61);
        costuraV.rotation.y = -angCv;
        silo.add(costuraV);
      }

      // Escada externa de marinheiro de aço galvanizado com gaiola de segurança
      const escadaGrp = new THREE.Group();
      const angEscada = -Math.PI * 0.28;
      const rEscada = 1.72;
      escadaGrp.position.set(Math.cos(angEscada) * rEscada, 0, Math.sin(angEscada) * rEscada);
      escadaGrp.rotation.y = -angEscada + Math.PI / 2;

      // Montantes verticais da escada
      [-0.18, 0.18].forEach((ex) => {
        const mont = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 6.2, 6), acoEscuroMat);
        mont.position.set(ex, 3.1, 0);
        escadaGrp.add(mont);
      });

      // Degraus da escada
      for (let dg = 0.4; dg <= 6.0; dg += 0.35) {
        const degrau = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.36, 6), acoEscuroMat);
        degrau.rotation.z = Math.PI / 2;
        degrau.position.set(0, dg, 0);
        escadaGrp.add(degrau);

        // Arcos de gaiola de segurança contra quedas
        if (dg >= 2.0 && dg <= 5.8) {
          const arcoGaiola = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.015, 4, 10, Math.PI * 1.2), acoEscuroMat);
          arcoGaiola.rotation.x = Math.PI / 2;
          arcoGaiola.position.set(0, dg, 0.15);
          escadaGrp.add(arcoGaiola);
        }
      }
      silo.add(escadaGrp);

      // Tubulação vertical de transporte e descarga pneumática de grãos
      const tuboDescarga = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.2, 8), acoEscuroMat);
      tuboDescarga.position.set(-1.45, 3.1, 0.7);
      tuboDescarga.castShadow = true;
      silo.add(tuboDescarga);

      const curvaTubo = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 6, 10, Math.PI / 2), acoEscuroMat);
      curvaTubo.position.set(-1.25, 6.2, 0.7);
      curvaTubo.rotation.z = -Math.PI / 2;
      silo.add(curvaTubo);

      // Telhado cônico com arremate nobre e nervuras radiais
      const topoCupula = new THREE.Mesh(new THREE.ConeGeometry(1.85, 1.45, 24), telhadoSiloMat);
      topoCupula.position.y = 6.72;
      topoCupula.castShadow = true;
      silo.add(topoCupula);

      // Nervuras radiais frisadas no teto cônico
      for (let nv = 0; nv < 12; nv++) {
        const angNv = (nv / 12) * Math.PI * 2;
        const nervura = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.55, 0.04), arremateNobreMat);
        nervura.position.set(Math.cos(angNv) * 0.9, 6.72, Math.sin(angNv) * 0.9);
        nervura.rotation.y = -angNv;
        nervura.rotation.z = Math.PI * 0.22;
        silo.add(nervura);
      }

      // Beiral nobre saliente com moldura torneada
      const beiralNobre = new THREE.Mesh(new THREE.TorusGeometry(1.86, 0.045, 6, 28), arremateNobreMat);
      beiralNobre.rotation.x = Math.PI / 2;
      beiralNobre.position.y = 6.02;
      silo.add(beiralNobre);

      // Passarela circular de inspeção superior com guarda-corpo de segurança
      const passarelaGeo = new THREE.RingGeometry(0.85, 1.35, 16);
      const passarela = new THREE.Mesh(passarelaGeo, acoEscuroMat);
      passarela.rotation.x = -Math.PI / 2;
      passarela.position.y = 7.15;
      silo.add(passarela);

      const guardaCorpo = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.025, 4, 20), acoEscuroMat);
      guardaCorpo.rotation.x = Math.PI / 2;
      guardaCorpo.position.y = 7.6;
      silo.add(guardaCorpo);

      // Exaustor e respiro de aeração tipo cogumelo no topo
      const exaustorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.35, 10), arremateNobreMat);
      exaustorBase.position.y = 7.55;
      silo.add(exaustorBase);

      const exaustorChapeu = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.22, 12), arremateNobreMat);
      exaustorChapeu.position.y = 7.78;
      silo.add(exaustorChapeu);

      // Haste e baliza de observação / sinalização aérea no topo nobre do silo
      const hasteBaliza = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.55, 6), arremateNobreMat);
      hasteBaliza.position.y = 8.05;
      silo.add(hasteBaliza);

      const balizaSiloMat = kit.mat('phong', 0xffca28, { emissive: 0xffca28, emissiveIntensity: 0.95 });
      const balizaSilo = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), balizaSiloMat);
      balizaSilo.position.y = 8.35;
      silo.add(balizaSilo);

      // Halo suave e translúcido em torno da baliza do silo
      const haloBalizaSiloMat = kit.mat('basic', 0xffca28, { transparent: true, opacity: 0.35, depthWrite: false });
      const haloBalizaSilo = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 12), haloBalizaSiloMat);
      haloBalizaSilo.position.y = 8.35;
      silo.add(haloBalizaSilo);

      // Luz da baliza de observação no topo do silo pulsando suavemente
      const luzSilo = new THREE.PointLight(0xffca28, 1.15, 14);
      luzSilo.position.set(0, 8.35, 0);
      silo.add(luzSilo);

      grpComercial.add(silo);

      // Sombra de contato para aterrar o silo
      const sombraSilo = kit.criarSombraDeContato(6.5, -6, 2.2, 2.2, 0.48);
      sombraSilo.position.y = 0.06;
      grpComercial.add(sombraSilo);

      // Fardos de feno da colheita comercial
      const fenoCom1 = kit.criarFardoFeno(-6.5, -9, 0.2);
      fenoCom1.userData = {
        interativo: true,
        nome: '🌾 Fardo de feno: forragem nutritiva e estoque de alimento vegetal.',
        som: 'pop'
      };
      grpComercial.add(fenoCom1);

      const fenoCom2 = kit.criarFardoFeno(-5.2, -10.2, 0.7);
      fenoCom2.userData = {
        interativo: true,
        nome: '🌾 Fardo de feno: forragem nutritiva e estoque de alimento vegetal.',
        som: 'pop'
      };
      grpComercial.add(fenoCom2);

      // ==========================================
      // Grande Lavoura Comercial: Trigo Dourado e Milharal Alto em Fileiras Perfeitas
      // ==========================================
      const plantacaoComercial = new THREE.Group();
      plantacaoComercial.position.set(-2, 0, 4);
      plantacaoComercial.userData = {
        interativo: true,
        nome: '🌾 Lavoura comercial de trigo e milho: cultivada em grande extensão para venda no país e exterior.',
        som: 'pop'
      };

      const soloCultivo = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.16, 11), kit.mat('lambert', 0x5d4037));
      soloCultivo.position.y = 0.08;
      soloCultivo.receiveShadow = true;
      plantacaoComercial.add(soloCultivo);

      // ------------------------------------------
      // LADO ESQUERDO DA LAVOURA: Trigo Dourado (fx de -5.0 a -0.6)
      // ------------------------------------------
      const trigoMeshes = [];
      const cauleTrigoMat = kit.mat('toon', 0xffe082);
      const espigaTrigoMat = kit.mat('toon', 0xfbc02d);
      const espigaGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.65, 6);
      const hasteTrigoGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.2, 4);

      for (let fx = -5.0; fx <= -0.8; fx += 1.0) {
        for (let fz = -4.5; fz <= 4.5; fz += 0.75) {
          const tGrp = new THREE.Group();
          tGrp.position.set(fx, 0.16, fz);

          // Haste fina
          const haste = new THREE.Mesh(hasteTrigoGeo, cauleTrigoMat);
          haste.position.y = 0.6;
          haste.castShadow = true;
          tGrp.add(haste);

          // Espiga dourada gordinha no topo
          const espiga = new THREE.Mesh(espigaGeo, espigaTrigoMat);
          espiga.position.y = 1.35;
          tGrp.add(espiga);

          // Folhinhas douradas laterais
          const folhaTrigo = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.04), cauleTrigoMat);
          folhaTrigo.position.set(0.08, 0.8, 0);
          folhaTrigo.rotation.z = -0.4;
          tGrp.add(folhaTrigo);

          plantacaoComercial.add(tGrp);
          trigoMeshes.push(tGrp);
        }
      }

      // ------------------------------------------
      // LADO DIREITO DA LAVOURA: Milharal Alto com Espigas Amarelas (fx de 0.8 a 5.0)
      // ------------------------------------------
      const milhoMeshes = [];
      const cauleMilhoMat = kit.mat('lambert', 0x388e3c);
      const folhaMilhoMat = kit.mat('toon', 0x43a047);
      const espigaMilhoMat = kit.mat('toon', 0xffd54f);
      const palhaMilhoMat = kit.mat('toon', 0x7cb342);

      const cauleMilhoGeo = new THREE.CylinderGeometry(0.05, 0.06, 2.3, 6);
      const folhaMilhoGeo = new THREE.BoxGeometry(0.65, 0.03, 0.16);
      const espigaMilhoGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.45, 6);

      for (let fx = 0.8; fx <= 5.0; fx += 1.35) {
        for (let fz = -4.2; fz <= 4.2; fz += 1.05) {
          const mGrp = new THREE.Group();
          mGrp.position.set(fx, 0.16, fz);

          // Caule verde alto
          const caule = new THREE.Mesh(cauleMilhoGeo, cauleMilhoMat);
          caule.position.y = 1.15;
          caule.castShadow = true;
          mGrp.add(caule);

          // Folhas verdes compridas arqueadas
          const folha1 = new THREE.Mesh(folhaMilhoGeo, folhaMilhoMat);
          folha1.position.set(0.28, 1.2, 0);
          folha1.rotation.z = -0.45;
          mGrp.add(folha1);

          const folha2 = new THREE.Mesh(folhaMilhoGeo, folhaMilhoMat);
          folha2.position.set(-0.28, 1.6, 0);
          folha2.rotation.z = 0.45;
          mGrp.add(folha2);

          // Espiga de milho amarela apetitosa entre as folhas
          const espiga = new THREE.Mesh(espigaMilhoGeo, espigaMilhoMat);
          espiga.position.set(0.12, 1.35, 0.1);
          espiga.rotation.z = -0.3;
          mGrp.add(espiga);

          // Palha protetora na base da espiga
          const palha = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 4), palhaMilhoMat);
          palha.position.set(0.08, 1.25, 0.1);
          palha.rotation.z = -0.3;
          mGrp.add(palha);

          // Pendão no topo do pé de milho
          const pendao = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.38, 4), palhaMilhoMat);
          pendao.position.y = 2.4;
          mGrp.add(pendao);

          plantacaoComercial.add(mGrp);
          milhoMeshes.push(mGrp);
        }
      }

      grpComercial.add(plantacaoComercial);

      // ==========================================
      // Pivô Central de Irrigação Moderna com Microgotículas de Água
      // ==========================================
      const pivoIrrigacao = new THREE.Group();
      pivoIrrigacao.position.set(-2, 0, 10.2);
      pivoIrrigacao.userData = {
        interativo: true,
        nome: '💦 Pivô central de irrigação: tecnologia moderna que borrifa água uniformemente sobre grandes plantações.',
        som: 'splash'
      };

      const metalPivoMat = kit.mat('lambert', 0x90a4ae);
      const tuboAguaMat = kit.mat('lambert', 0x78909c);
      const gotaMat = kit.mat('phong', 0x80d8ff, { transparent: true, opacity: 0.75, shininess: 90 });

      // Torre central fixa do pivô (estrutura piramidal treliçada)
      const torreBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.7, 4.0, 4), metalPivoMat);
      torreBase.position.y = 2.0;
      torreBase.castShadow = true;
      pivoIrrigacao.add(torreBase);

      // Tubo de alimentação central vertical
      const tuboAlimentador = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.2, 8), tuboAguaMat);
      tuboAlimentador.position.y = 2.1;
      pivoIrrigacao.add(tuboAlimentador);

      // Braço giratório do pivô
      const pivoArm = new THREE.Group();
      pivoArm.position.y = 3.9;

      // Tubo horizontal de distribuição
      const tuboHorizontal = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 9.2, 8), tuboAguaMat);
      tuboHorizontal.rotation.x = Math.PI / 2;
      tuboHorizontal.position.set(0, 0, -4.6);
      tuboHorizontal.castShadow = true;
      pivoArm.add(tuboHorizontal);

      // Cabos e tirantes de sustentação do braço
      const tirante1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 5.0, 4), metalPivoMat);
      tirante1.position.set(0, 0.35, -2.5);
      tirante1.rotation.x = 0.15;
      pivoArm.add(tirante1);

      const tirante2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 5.0, 4), metalPivoMat);
      tirante2.position.set(0, 0.35, -6.8);
      tirante2.rotation.x = -0.15;
      pivoArm.add(tirante2);

      // Torre móvel com rodas no meio do braço
      const torreMovel = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.8, 4), metalPivoMat);
      torreMovel.position.set(0, -1.9, -6.5);
      pivoArm.add(torreMovel);

      const rodaPivoMat = kit.mat('lambert', 0x212121);
      [-0.45, 0.45].forEach((wx) => {
        const rodaPivo = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 10), rodaPivoMat);
        rodaPivo.rotation.z = Math.PI / 2;
        rodaPivo.position.set(wx, -3.5, -6.5);
        pivoArm.add(rodaPivo);
      });

      // Tubos de descida com aspersores e gotículas de água
      const gotasMist = [];
      const gotaGeo = new THREE.SphereGeometry(0.05, 4, 4);

      for (let bz = -1.5; bz >= -8.5; bz -= 1.4) {
        // Tubo de descida flexível
        const tuboDescida = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 4), kit.mat('lambert', 0x424242));
        tuboDescida.position.set(0, -0.7, bz);
        pivoArm.add(tuboDescida);

        // Bico aspersor
        const bicoAspersor = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 6), metalPivoMat);
        bicoAspersor.position.set(0, -1.45, bz);
        pivoArm.add(bicoAspersor);

        // Nuvem de microgotículas de orvalho / névoa de irrigação
        for (let g = 0; g < 4; g++) {
          const gota = new THREE.Mesh(gotaGeo, gotaMat);
          gota.position.set(
            (Math.random() - 0.5) * 0.4,
            -1.6 - g * 0.45,
            bz + (Math.random() - 0.5) * 0.4
          );
          gota.userData = {
            baseY: gota.position.y,
            fase: Math.random() * Math.PI * 2
          };
          pivoArm.add(gota);
          gotasMist.push(gota);
        }
      }

      pivoIrrigacao.add(pivoArm);
      grpComercial.add(pivoIrrigacao);
      grpComercial.add(kit.criarSombraDeContato(-2, 10.2, 1.6, 1.6, 0.4));

      // ==========================================
      // Estação Agrometeorológica & Painel Solar de Agricultura de Precisão
      // ==========================================
      const estacaoClima = new THREE.Group();
      estacaoClima.position.set(6.8, 0, 2.5);
      estacaoClima.userData = {
        interativo: true,
        nome: '📡 Estação agrometeorológica e painel solar: sensores que monitoram chuva e vento na agricultura de precisão.',
        som: 'chime',
        aoClicar: function (alvo) {
          alvo.userData.haloPulseAte = performance.now() * 0.001 + 2.0;
        }
      };

      const posteMetalMat = kit.mat('lambert', 0xb0bec5);
      const brancoEstacaoMat = kit.mat('lambert', 0xf5f5f5);

      // Poste vertical de instrumentos
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 8), posteMetalMat);
      poste.position.y = 1.7;
      poste.castShadow = true;
      estacaoClima.add(poste);

      // Painel solar fotovoltaico inclinado voltado ao sol
      const painelGrp = new THREE.Group();
      painelGrp.position.set(0, 1.8, 0.35);
      painelGrp.rotation.x = Math.PI * 0.22;

      const molduraPainel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.95), posteMetalMat);
      painelGrp.add(molduraPainel);

      const celulasSolares = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 0.85), kit.mat('phong', 0x1565c0, { shininess: 90 }));
      celulasSolares.position.y = 0.035;
      painelGrp.add(celulasSolares);

      // Reflexo especular sobre o painel solar fotovoltaico de alta eficiência
      const reflexoSolarMat = kit.mat('basic', 0xffffff, { transparent: true, opacity: 0.32, depthWrite: false });
      const reflexoSolar = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.4), reflexoSolarMat);
      reflexoSolar.position.set(0, 0.05, 0);
      reflexoSolar.rotation.x = -Math.PI / 2;
      painelGrp.add(reflexoSolar);

      // Luz refletida pelo painel solar
      const luzPainelSolar = new THREE.PointLight(0x90caf9, 0.5, 4.5);
      luzPainelSolar.position.set(0, 2.2, 0.6);
      estacaoClima.add(luzPainelSolar);

      estacaoClima.add(painelGrp);

      // Abrigo meteorológico Stevenson (caixa de sensores de temperatura/umidade)
      const abrigoSensores = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.45), brancoEstacaoMat);
      abrigoSensores.position.set(0, 2.2, -0.3);
      abrigoSensores.castShadow = true;
      estacaoClima.add(abrigoSensores);

      // Pluviômetro digital (funil coletor de chuva)
      const pluviometro = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 8), brancoEstacaoMat);
      pluviometro.position.set(0.42, 2.65, 0);
      pluviometro.rotation.x = Math.PI;
      estacaoClima.add(pluviometro);

      // Anemômetro giratório de 3 conchas para medir o vento
      const anemometro = new THREE.Group();
      anemometro.position.set(0, 3.55, 0);

      const eixoAnemometro = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), posteMetalMat);
      anemometro.add(eixoAnemometro);

      const conchaMat = kit.mat('toon', 0xe0e0e0);
      for (let c = 0; c < 3; c++) {
        const angConcha = (c * Math.PI * 2) / 3;
        const braco = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), posteMetalMat);
        braco.position.set(Math.cos(angConcha) * 0.15, 0.12, Math.sin(angConcha) * 0.15);
        braco.rotation.y = angConcha;
        anemometro.add(braco);

        const concha = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6, 0, Math.PI), conchaMat);
        concha.position.set(Math.cos(angConcha) * 0.32, 0.12, Math.sin(angConcha) * 0.32);
        concha.rotation.y = angConcha + Math.PI / 2;
        anemometro.add(concha);
      }
      estacaoClima.add(anemometro);

      // Catavento direcional digital
      const catavento = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.03), kit.mat('basic', 0xd32f2f));
      catavento.position.set(0, 3.25, 0.18);
      estacaoClima.add(catavento);

      // Antena de telemetria com LED indicador de status verde calmo
      const antenaTelemetria = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 4), posteMetalMat);
      antenaTelemetria.position.set(-0.35, 2.7, 0);
      estacaoClima.add(antenaTelemetria);

      const ledStatus = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), kit.mat('basic', 0x00e676));
      ledStatus.position.set(-0.35, 3.05, 0);
      estacaoClima.add(ledStatus);

      // Luz suave do LED verde de telemetria da estação agrometeorológica
      const luzLedStatus = new THREE.PointLight(0x00e676, 0.6, 4.0);
      luzLedStatus.position.set(-0.35, 3.05, 0);
      estacaoClima.add(luzLedStatus);

      grpComercial.add(estacaoClima);
      grpComercial.add(kit.criarSombraDeContato(6.8, 2.5, 1.4, 1.4, 0.38));

      // ==========================================
      // Trator Agrícola Moderno com Rodas Rotativas
      // ==========================================
      const trator = new THREE.Group();
      trator.position.set(-4, 0, -0.5);
      trator.rotation.y = Math.PI * 0.15;
      trator.userData = {
        interativo: true,
        pistaMissao: 1,
        nome: '🚜 Trator agrícola moderno: com piloto automático e GPS para guiar grandes lavouras.',
        som: 'motor',
        aoClicar: function (alvo) {
          alvo.userData.vibrarAte = performance.now() * 0.001 + 2.0;
        }
      };

      const verdeTratorMat = kit.mat('lambert', 0x2e7d32);
      const chassiTratorMat = kit.mat('lambert', 0x212121);
      const metalTratorMat = kit.mat('lambert', 0x455a64);
      const pneuMat = kit.mat('lambert', 0x1f1f1f);
      const cuboAmareloMat = kit.mat('phong', 0xfbc02d, { shininess: 80 });

      // Chassi do trator moderno
      const chassi = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 4.0), chassiTratorMat);
      chassi.position.y = 0.9;
      chassi.castShadow = true;
      trator.add(chassi);

      // Capô frontal aerodinâmico
      const capo = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.15, 2.4), verdeTratorMat);
      capo.position.set(0, 1.7, 0.85);
      capo.castShadow = true;
      trator.add(capo);

      // Grade frontal preta com faróis LED modernos
      const grade = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.85, 0.1), chassiTratorMat);
      grade.position.set(0, 1.6, 2.06);
      trator.add(grade);

      const farolLedMat = kit.mat('phong', 0xe0f7fa, { emissive: 0x80deea, emissiveIntensity: 0.95 });
      const feixeLedMat = kit.mat('basic', 0x80deea, { transparent: true, opacity: 0.18, depthWrite: false });
      const haloLedMat = kit.mat('basic', 0x80deea, { transparent: true, opacity: 0.32, depthWrite: false });

      [-0.65, 0.65].forEach((fx) => {
        const farol = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.08), farolLedMat);
        farol.position.set(fx, 1.75, 2.08);
        trator.add(farol);

        // Halo frontal da lente LED
        const haloLed = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), haloLedMat);
        haloLed.position.set(fx, 1.75, 2.14);
        trator.add(haloLed);

        // Ponto de luz LED de alta tecnologia projetando iluminação para a frente
        const luzLedTrator = new THREE.PointLight(0xe0f7fa, 1.05, 15);
        luzLedTrator.position.set(fx, 1.8, 3.2);
        trator.add(luzLedTrator);

        // Feixe volumétrico nítido translúcido projetado à frente em direção à lavoura de trigo
        const feixeGeo = new THREE.ConeGeometry(0.95, 5.4, 12, 1, true);
        const feixe = new THREE.Mesh(feixeGeo, feixeLedMat);
        feixe.position.set(fx, 1.75, 4.6);
        feixe.rotation.x = Math.PI / 2;
        trator.add(feixe);
      });

      // Iluminação brilhante e ampla banhando o solo e as fileiras de trigo à frente
      const luzSoloPlantacao = new THREE.PointLight(0xe0f7fa, 0.95, 14);
      luzSoloPlantacao.position.set(0, 0.9, 5.8);
      trator.add(luzSoloPlantacao);

      // Piscina de luz LED translúcida no solo à frente do trator
      const piscinaTratorAgrMat = kit.mat('basic', 0x80deea, { transparent: true, opacity: 0.16, depthWrite: false });
      const piscinaTratorAgr = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 5.8), piscinaTratorAgrMat);
      piscinaTratorAgr.rotation.x = -Math.PI / 2;
      piscinaTratorAgr.position.set(0, 0.05, 5.4);
      trator.add(piscinaTratorAgr);

      // Cabine panorâmica envidraçada de alta tecnologia
      const vidroMat = kit.mat('phong', 0xe0f7fa, { transparent: true, opacity: 0.72, shininess: 95 });
      const cabine = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.65, 1.7), vidroMat);
      cabine.position.set(0, 2.8, -0.65);
      cabine.castShadow = true;
      trator.add(cabine);

      // Colunas estruturais pretas da cabine
      [[-0.96, -1.45], [0.96, -1.45], [-0.96, 0.15], [0.96, 0.15]].forEach(([cx, cz]) => {
        const coluna = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 0.08), chassiTratorMat);
        coluna.position.set(cx, 2.8, cz);
        trator.add(coluna);
      });

      // Teto verde da cabine com domo de antena GPS de precisão
      const teto = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.18, 1.9), verdeTratorMat);
      teto.position.set(0, 3.68, -0.65);
      teto.castShadow = true;
      trator.add(teto);

      // Receptor de GPS agrícola (agricultura de precisão)
      const domoGps = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.14, 10), kit.mat('basic', 0xffffff));
      domoGps.position.set(0, 3.82, -0.65);
      trator.add(domoGps);

      const ledGps = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), kit.mat('basic', 0x00e676));
      ledGps.position.set(0, 3.92, -0.65);
      trator.add(ledGps);

      // Escapamento vertical cromado
      const escape = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.85, 8), metalTratorMat);
      escape.position.set(0.88, 2.8, 1.0);
      escape.castShadow = true;
      trator.add(escape);

      // Rodas giratórias detalhadas com calotas amarelas
      const rodasTrator = [];
      const rodaGGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.65, 14);
      const rodaPGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.48, 12);

      // Rodas traseiras gigantes
      [-1.42, 1.42].forEach((rx) => {
        const rGrp = new THREE.Group();
        rGrp.position.set(rx, 1.05, -0.95);

        const pneu = new THREE.Mesh(rodaGGeo, pneuMat);
        pneu.rotation.z = Math.PI / 2;
        pneu.castShadow = true;
        rGrp.add(pneu);

        const cubo = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.68, 8), cuboAmareloMat);
        cubo.rotation.z = Math.PI / 2;
        rGrp.add(cubo);

        trator.add(rGrp);
        rodasTrator.push(pneu);
      });

      // Rodas dianteiras direcionais
      [-1.34, 1.34].forEach((fx) => {
        const rGrp = new THREE.Group();
        rGrp.position.set(fx, 0.65, 1.35);

        const pneu = new THREE.Mesh(rodaPGeo, pneuMat);
        pneu.rotation.z = Math.PI / 2;
        pneu.castShadow = true;
        rGrp.add(pneu);

        const cubo = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 8), cuboAmareloMat);
        cubo.rotation.z = Math.PI / 2;
        rGrp.add(cubo);

        trator.add(rGrp);
        rodasTrator.push(pneu);
      });

      grpComercial.add(trator);

      // Sombra de contato para aterrar o trator
      const sombraTrator = kit.criarSombraDeContato(-4, -0.5, 2.5, 3.2, 0.48);
      sombraTrator.position.y = 0.06;
      grpComercial.add(sombraTrator);

      // Colheitadeira moderna com carretel rotativo (preservada para as missões didáticas)
      const colheitadeira = new THREE.Group();
      colheitadeira.position.set(2.5, 0, 0);
      colheitadeira.rotation.y = -Math.PI * 0.1;
      colheitadeira.userData = {
        interativo: true,
        pistaMissao: [1, 4],
        nome: '🌾 Colheitadeira moderna: máquina potente que colhe grandes plantações rapidamente.',
        som: 'motor',
        aoClicar: function (alvo) {
          alvo.userData.vibrarAte = performance.now() * 0.001 + 2.0;
        }
      };

      const chassiColh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 4.4), new THREE.MeshLambertMaterial({ color: 0xfbc02d }));
      chassiColh.position.y = 1.9;
      chassiColh.castShadow = true;
      colheitadeira.add(chassiColh);

      const cabineColh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.7, 1.8), new THREE.MeshLambertMaterial({ color: 0xe0f7fa }));
      cabineColh.position.set(0, 3.1, 1.3);
      cabineColh.castShadow = true;
      colheitadeira.add(cabineColh);

      // Faróis LED de alta tecnologia no teto da cabine da colheitadeira com feixe translúcido
      const farolColhMat = kit.mat('phong', 0xe0f7fa, { emissive: 0x80deea, emissiveIntensity: 0.95 });
      const feixeColhMat = kit.mat('basic', 0x80deea, { transparent: true, opacity: 0.18, depthWrite: false });
      const haloColhMat = kit.mat('basic', 0x80deea, { transparent: true, opacity: 0.32, depthWrite: false });

      [-0.85, 0.85].forEach((cx) => {
        const farolColh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.1), farolColhMat);
        farolColh.position.set(cx, 3.85, 2.15);
        colheitadeira.add(farolColh);

        // Halo luminoso frontal da colheitadeira
        const haloColh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), haloColhMat);
        haloColh.position.set(cx, 3.85, 2.22);
        colheitadeira.add(haloColh);

        // Fonte de luz LED projetando iluminação no carretel e nas culturas
        const luzFarolColh = new THREE.PointLight(0xe0f7fa, 1.05, 14);
        luzFarolColh.position.set(cx, 3.8, 3.2);
        colheitadeira.add(luzFarolColh);

        // Feixe volumétrico translúcido cônico suave apontado para a colheita
        const feixeColhGeo = new THREE.ConeGeometry(0.9, 5.2, 12, 1, true);
        const feixeColh = new THREE.Mesh(feixeColhGeo, feixeColhMat);
        feixeColh.rotation.x = Math.PI / 2 + 0.15;
        feixeColh.position.set(cx, 3.1, 4.4);
        colheitadeira.add(feixeColh);
      });

      // Iluminação ampla e piscina de luz no solo à frente da colheitadeira
      const luzSoloColh = new THREE.PointLight(0xe0f7fa, 0.9, 13);
      luzSoloColh.position.set(0, 1.2, 4.8);
      colheitadeira.add(luzSoloColh);

      const piscinaSoloColhMat = kit.mat('basic', 0x80deea, { transparent: true, opacity: 0.16, depthWrite: false });
      const piscinaSoloColh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.2), piscinaSoloColhMat);
      piscinaSoloColh.rotation.x = -Math.PI / 2;
      piscinaSoloColh.position.set(0, 0.05, 4.6);
      colheitadeira.add(piscinaSoloColh);

      // Tubo de descarga de grãos
      const canoDescarga = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 8), new THREE.MeshLambertMaterial({ color: 0xef6c00 }));
      canoDescarga.position.set(-1.8, 3.2, -0.8);
      canoDescarga.rotation.z = Math.PI / 3;
      colheitadeira.add(canoDescarga);

      // Rodas dianteiras grandes
      const rodaColhMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
      const rodaGColhGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.55, 12);
      [[-1.6, 1.1], [1.6, 1.1]].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rodaGColhGeo, rodaColhMat);
        r.rotation.z = Math.PI / 2;
        r.position.set(rx, 0.95, rz);
        r.castShadow = true;
        colheitadeira.add(r);
      });

      // Rodas traseiras
      const rodaPColhGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 12);
      [[-1.5, -1.3], [1.5, -1.3]].forEach(([rx, rz]) => {
        const r = new THREE.Mesh(rodaPColhGeo, rodaColhMat);
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

      // Sombra de contato para aterrar a colheitadeira
      const sombraColh = kit.criarSombraDeContato(2.5, 0, 2.4, 2.8, 0.45);
      sombraColh.position.y = 0.06;
      grpComercial.add(sombraColh);

      // Placa identificadora
      grpComercial.add(kit.criarPlaca(0, 8, 'COMERCIAL', 0x1565c0));
      scene.add(grpComercial);

      // ==========================================
      // CENTRO: Estrada e Caminhão de Transporte
      // ==========================================
      const caminhao = kit.criarCaminhao(0xef6c00);
      caminhao.position.set(0, 0, 10);
      caminhao.userData = {
        interativo: true,
        pistaMissao: 3,
        nome: '🚚 Caminhão de transporte: leva a produção agrícola do campo para feiras, cidades e indústrias.',
        som: 'buzina',
        aoClicar: function (alvo) {
          alvo.userData.vibrarAte = performance.now() * 0.001 + 2.0;
        }
      };
      scene.add(caminhao);

      const sombraCaminhao = kit.criarSombraDeContato(0, 10, 2.0, 3.4, 0.45);
      sombraCaminhao.position.y = 0.03;
      scene.add(sombraCaminhao);

      // Animações contínuas e acolhedoras (TEA-friendly: suaves e harmoniosas)
      animaveis.push((now) => {
        // Carretel da colheitadeira girando para a colheita dos grãos com aceleração ao toque
        const colhVibrando = colheitadeira.userData && colheitadeira.userData.vibrarAte > now;
        carretel.rotation.x += (colhVibrando ? 0.09 : 0.038);
        colheitadeira.position.y = colhVibrando ? Math.sin(now * 32) * 0.035 : 0;
        if (colhVibrando) {
          luzSoloColh.intensity = 0.9 + Math.sin(now * 16) * 0.55;
        } else {
          luzSoloColh.intensity = 0.9;
        }

        // Rodas do trator moderno girando e vibração sutil do motor com reforço ao toque
        const tratorVibrando = trator.userData && trator.userData.vibrarAte > now;
        rodasTrator.forEach((r) => {
          r.rotation.x += (tratorVibrando ? 0.08 : 0.026);
        });
        trator.position.y = 0.02 + Math.sin(now * (tratorVibrando ? 36 : 3.5)) * (tratorVibrando ? 0.04 : 0.008);
        if (tratorVibrando) {
          trator.rotation.z = Math.sin(now * 24) * 0.015;
          luzSoloPlantacao.intensity = 0.95 + Math.sin(now * 16) * 0.5;
        } else {
          trator.rotation.z = 0;
          luzSoloPlantacao.intensity = 0.95;
        }

        // Vibração do caminhão de transporte ao toque
        const caminhaoVibrando = caminhao.userData && caminhao.userData.vibrarAte > now;
        caminhao.position.y = caminhaoVibrando ? Math.sin(now * 30) * 0.03 : 0;

        // Sarilho do poço acelerando suavemente ao toque por 3 segundos
        const pocoTurbo = poco.userData && poco.userData.turboAte > now;
        if (pocoTurbo && poco.userData.sarilho) {
          poco.userData.sarilho.rotation.x += 0.06;
          if (poco.userData.corda) poco.userData.corda.rotation.x += 0.06;
        }

        // Canteiros de cenoura e abóbora com leve balanço ao toque
        const c1Reacao = canteiroCenouras.userData && canteiroCenouras.userData.reacaoToqueAte > now;
        canteiroCenouras.position.y = c1Reacao ? Math.abs(Math.sin(now * 14)) * 0.12 : 0;
        const c2Reacao = canteiroAboboras.userData && canteiroAboboras.userData.reacaoToqueAte > now;
        canteiroAboboras.position.y = c2Reacao ? Math.abs(Math.sin(now * 14)) * 0.12 : 0;

        // Balanço da cabeça do boi de tração
        if (boiCarroca && boiCarroca.userData && boiCarroca.userData.cabeca) {
          const boiReacao = boiCarroca.userData && boiCarroca.userData.reacaoToqueAte > now;
          boiCarroca.userData.cabeca.position.y = 1.9 + Math.sin(now * (boiReacao ? 6 : 2)) * (boiReacao ? 0.14 : 0.05);
          boiCarroca.userData.cabeca.rotation.z = boiReacao ? Math.sin(now * 14) * 0.18 : 0;
        }

        // Anemômetro da estação agrometeorológica girando com o vento
        anemometro.rotation.y = now * 3.8;

        // Braço do pivô de irrigação oscilando suavemente sobre a lavoura
        pivoArm.rotation.y = Math.sin(now * 0.22) * 0.16;

        // Microgotículas de água do pivô flutuando suavemente
        gotasMist.forEach((g) => {
          g.position.y = g.userData.baseY + Math.sin(now * 2.8 + g.userData.fase) * 0.08;
        });

        // Ondulação suave do trigo dourado como ondas na brisa
        trigoMeshes.forEach((t, idx) => {
          t.rotation.z = Math.sin(now * 1.5 + idx * 0.35) * 0.045;
        });

        // Milharal balançando calmamente com o vento
        milhoMeshes.forEach((m, idx) => {
          m.rotation.z = Math.sin(now * 1.2 + idx * 0.45) * 0.035;
        });

        // Luzes, balizas e sensores com pulsação acolhedora e serena (TEA-friendly)
        luzCasa.intensity = 1.15 + Math.sin(now * 2.2) * 0.08;
        pocaLuzVaranda.scale.setScalar(1.0 + Math.sin(now * 2.2) * 0.03);
        haloLanternaCasaMat.opacity = 0.35 + Math.sin(now * 2.2) * 0.05;
        luzPoco.intensity = 0.65 + Math.sin(now * (pocoTurbo ? 4.5 : 2.5)) * (pocoTurbo ? 0.25 : 0.09);
        brilhoAguaPoco.scale.setScalar(1.0 + Math.sin(now * 2.0) * 0.04);
        luzSilo.intensity = 1.15 + Math.sin(now * 1.8) * 0.22;
        balizaSilo.scale.setScalar(1.0 + Math.sin(now * 1.8) * 0.08);
        haloBalizaSiloMat.opacity = 0.35 + Math.sin(now * 1.8) * 0.06;
        luzLedStatus.intensity = 0.6 + Math.sin(now * 2.8) * 0.16;

        // Painel solar com pulso de halo e energia limpa ao toque
        const solarPulso = estacaoClima.userData && estacaoClima.userData.haloPulseAte > now;
        luzPainelSolar.intensity = (0.5 + Math.sin(now * (solarPulso ? 4.0 : 1.5)) * 0.12) * (solarPulso ? 2.2 : 1.0);
        reflexoSolar.scale.x = (1.0 + Math.sin(now * (solarPulso ? 4.2 : 1.6)) * 0.12) * (solarPulso ? 1.6 : 1.0);
      });
    },

    missoes: [
      {
        kicker: 'Missão 1 · Agricultura Familiar e de Subsistência',
        enunciado: 'Onde os alimentos são consumidos pela própria família do agricultor?',
        respostaCerta: 'subsistencia',
        cam: 'subsistencia',
        foto: '../img/hga/agr/arado.jpg',
        fotoAlt: 'Agricultor cuidando da terra na agricultura de subsistência',
        explicacao: '🌟 Muito bem! Na agricultura de subsistência, a própria família cultiva a pequena horta para se alimentar todos os dias.',
        dicaRetry: '💡 Dica: olhe para a casinha e a horta do sítio. É lá que a família planta para o seu próprio consumo!',
        opcoes: [
          { id: 'subsistencia', ico: '🏡', tit: 'Subsistência', desc: 'Pequena propriedade e consumo da própria família' },
          { id: 'comercial', ico: '🚜', tit: 'Comercial', desc: 'Grande extensão de terra destinada à venda' }
        ]
      },
      {
        kicker: 'Missão 2 · Agricultura Comercial com Máquinas',
        enunciado: 'Onde a plantação é gigante e usa máquinas modernas como tratores e colheitadeiras?',
        respostaCerta: 'comercial',
        cam: 'comercial',
        foto: '../img/hga/agr/colheitadeira.jpg',
        fotoAlt: 'Colheitadeira em grande plantação comercial',
        explicacao: '🌟 Parabéns! Na agricultura comercial, as lavouras são enormes e contam com tratores modernos e colheitadeiras velozes.',
        dicaRetry: '💡 Dica: observe as grandes máquinas e as fileiras de trigo. A agricultura comercial usa muita tecnologia!',
        opcoes: [
          { id: 'subsistencia', ico: '🏡', tit: 'Subsistência', desc: 'Pequena propriedade e trabalho manual' },
          { id: 'comercial', ico: '🚜', tit: 'Comercial', desc: 'Grandes extensões e maquinários modernos' }
        ]
      },
      {
        kicker: 'Missão 3 · Ferramentas Simples de Trabalho',
        enunciado: 'Enxadas, foices e arados manuais são instrumentos de qual agricultura?',
        respostaCerta: 'subsistencia',
        cam: 'subsistencia',
        foto: '../img/hga/agr/arado.jpg',
        fotoAlt: 'Instrumentos simples na agricultura de subsistência',
        explicacao: '🌟 Isso mesmo! Ferramentas simples e manuais como arado, enxada e foice pertencem à agricultura de subsistência e familiar.',
        dicaRetry: '💡 Dica: no sítio familiar, o trabalho é feito à mão com ferramentas manuais leves como o arado.',
        opcoes: [
          { id: 'subsistencia', ico: '🏡', tit: 'Subsistência', desc: 'Usa instrumentos simples como arado e enxada' },
          { id: 'comercial', ico: '🚜', tit: 'Comercial', desc: 'Usa máquinas pesadas como colheitadeiras' }
        ]
      },
      {
        kicker: 'Missão 4 · Destino da Grande Produção',
        enunciado: 'Para onde vai a imensa produção da agricultura comercial?',
        respostaCerta: 'paises',
        cam: 'comercial',
        foto: '../img/hga/agr/colheitadeira.jpg',
        fotoAlt: 'Produção da agricultura comercial vendida para vários lugares',
        explicacao: '🌟 Excelente! A colheita da agricultura comercial abastece cidades de todo o Brasil e é exportada para outros países do mundo!',
        dicaRetry: '💡 Dica: as grandes fazendas produzem milhares de sacas de grãos para alimentar muitas pessoas no país e fora dele.',
        opcoes: [
          { id: 'paises', ico: '🌎', tit: 'Brasil e outros países', desc: 'Destinada à venda em grande escala no comércio' },
          { id: 'mercados_proximos', ico: '🧺', tit: 'Apenas feiras próximas', desc: 'Somente pequenas sobras do sítio familiar' }
        ]
      },
      {
        kicker: 'Missão 5 · Tecnologia na Colheita',
        enunciado: 'Hoje em dia, a maior parte das plantações de cana colhe com:',
        respostaCerta: 'maquinas',
        cam: 'comercial',
        foto: '../img/hga/agr/cana-facao.jpg',
        fotoAlt: 'Trabalho de colheita da cana-de-açúcar',
        explicacao: '🌟 Perfeito! Hoje, 9 em cada 10 propriedades usam colheita mecanizada com grandes colheitadeiras, tornando o trabalho mais rápido e seguro.',
        dicaRetry: '💡 Dica: as máquinas agrícolas modernas substituíram a maior parte do trabalho braçal com facão manual.',
        opcoes: [
          { id: 'maquinas', ico: '🚜', tit: 'Máquinas modernas', desc: 'Colheita rápida mecanizada com colheitadeiras' },
          { id: 'facao', ico: '🔪', tit: 'Facão manual', desc: 'Trabalho manual braçal mais comum no passado' }
        ]
      },
      {
        kicker: 'Missão 6 · Alimentos da Agricultura',
        enunciado: 'Toque nos 4 alimentos vegetais que vêm da atividade agrícola:',
        tipo: 'produtos',
        cam: 'alimentos',
        foto: '../img/jogo/agr/arroz.svg',
        fotoAlt: 'Alimentos produzidos pela agricultura',
        explicacao: '🎉 Fantástico! O arroz saboroso, o feijão do prato, as frutas docinhas e as verduras frescas vêm do trabalho da agricultura!',
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
