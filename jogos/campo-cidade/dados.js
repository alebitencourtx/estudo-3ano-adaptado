/* jogos/campo-cidade/dados.js — conteúdo declarativo dos jogos de Campo e cidade em diferentes tempos.
   Lido por jogos/jogar.html via ?jogo=<id>. Motores em ../jogo-kit.js.
   Substitui os 7 jogos antigos de jogos/campo-cidade/jogo-campo-cidade-*.html (livro p. 102, 104 e 105).
   Os caminhos de imagem já estão no formato do jogador: ../img/... (o jogador fica em jogos/). */
(function (J) {

  /* ===== tempo-cc — linha do tempo do cinema (era jogo-campo-cidade-tempo.html) ===== */
  J['tempo-cc'] = {
    id:'tempo-cc', topico:'campo-cidade', tipo:'trilha',
    icone:'🎬', titulo:'Linha do tempo do cinema',
    instrucao:'Toque na parada que está brilhando.',
    paradas:[
      { ano:1895, foto:'../img/hga/cc/cinema-1895.jpg',
        alt:'Cena do filme A saída dos trabalhadores da fábrica, de 1895',
        frase:'1895: o cinema era mudo e preto e branco.' },
      { ano:1927, foto:'../img/hga/cc/cinema-1927.jpg',
        alt:'Foto do filme de 1927, o primeiro com falas',
        frase:'1927: o primeiro filme com falas.' },
      { ano:1937, foto:'../img/hga/cc/branca-neve.jpg',
        alt:'Foto do desenho de 1937, Branca de Neve, já colorido',
        frase:'1937: os desenhos ganharam cor, com Branca de Neve.' },
      { ano:1953, foto:'../img/hga/cc/museu-cera.jpg',
        alt:'Foto do filme de 1953, em 3-D',
        frase:'1953: o cinema em 3-D, com Museu de cera.' }
    ],
    /* o jogo antigo não mostrava o cartão grande da parada: a foto fica na própria parada */
    msgFim:'Muito bem! Você viu os quatro anos do cinema.',
    creditos:[
      'Fotos do cinema: livro do 3º ano, História e Geografia — p. 104 e 105 (uso escolar).',
      'História do cinema conforme o quadro da p. 105.'
    ],
    /* tabela de resumo do quadro da p. 105, como no fim do jogo antigo */
    extraFim:'<section class="card"><details class="detalhes" open><summary>O que mudou no cinema (p. 105)</summary>' +
      '<table class="quadro">' +
        '<tr><th>Tipo</th><th>Em 1895</th><th>Atualmente</th></tr>' +
        '<tr><td>Mudo ou sonoro</td><td>mudo</td><td>sonoro</td></tr>' +
        '<tr><td>Preto e branco ou colorido</td><td>preto e branco</td><td>colorido</td></tr>' +
        '<tr><td>Tecnologia 3-D</td><td>não existia</td><td>existe</td></tr>' +
      '</table></details></section>'
  };

  /* ===== cc-lazer — quiz de 6 rodadas (era jogo-campo-cidade-lazer.html) ===== */
  J['cc-lazer'] = {
    id:'cc-lazer', topico:'campo-cidade', tipo:'quiz',
    icone:'🧺', titulo:'O passeio de dona Alice',
    dica:'Toque na resposta.',
    creditos:[
      'Fotos do livro didático, p. 102 (uso escolar).',
      'Depoimento de dona Alice conforme o livro (p. 102).',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    rodadas:[
      { pergunta:'Onde dona Alice fazia piquenique?',
        certa:'Na Cantareira e no Parque Antártica',
        opcoes:['Na Cantareira e no Parque Antártica', 'No Jardim da Luz', 'No cinema'],
        msg:'Ela fazia piquenique na Cantareira e no Parque Antártica.',
        img:'../img/jogo/cc/cesta.svg', alt:'Cesta de piquenique' },
      { pergunta:'Onde Alice passeava aos domingos depois do almoço?',
        certa:'No Jardim da Luz',
        opcoes:['No Jardim da Luz', 'Na Cantareira', 'No Parque Antártica'],
        msg:'Ela passeava no Jardim da Luz.',
        img:'../img/hga/cc/jardim-luz.jpg', alt:'Foto antiga de pessoas passeando no Jardim da Luz, em 1910' },
      { pergunta:'Quem ia junto com Alice?',
        certa:'As famílias amigas',
        opcoes:['As famílias amigas', 'Os irmãos Lumière', 'Os trabalhadores da fábrica'],
        msg:'Ia com as famílias amigas.' },
      { pergunta:'O que Alice dizia sobre o Jardim da Luz?',
        certa:'Muito bem tratado e agradável',
        opcoes:['Muito bem tratado e agradável', 'Na Cantareira', 'No Parque Antártica'],
        msg:'Ela dizia: tudo muito bem tratado, agradável.' },
      { pergunta:'Em que cidade fica o Jardim da Luz?',
        certa:'São Paulo',
        opcoes:['São Paulo', 'Na França', 'Nos Estados Unidos'],
        msg:'O Jardim da Luz fica em São Paulo.' },
      { pergunta:'Em que ano foi tirada a foto do Jardim da Luz?',
        certa:'Em 1910',
        opcoes:['Em 1910', 'Em 1895', 'Em 1927'],
        msg:'A foto do Jardim da Luz é de 1910.',
        img:'../img/hga/cc/jardim-luz.jpg', alt:'Foto antiga de pessoas passeando no Jardim da Luz, em 1910' }
    ]
  };

  /* ===== cc-antes-agora — 6 cartões em 2 caixas, 3 por tela (era jogo-campo-cidade-antes-agora.html) ===== */
  J['cc-antes-agora'] = {
    id:'cc-antes-agora', topico:'campo-cidade', tipo:'classificar',
    icone:'🎬', titulo:'Em 1895 ou atualmente?',
    instrucao:'Este cartão é de 1895 ou de hoje?',
    apoio:'Ligue cada cartão ao tempo: 1895 ou hoje.',
    hint:'Arraste o cartão. Ou toque no cartão e na caixa.',
    erroComDestino:false,      /* o jogo antigo mostrava só a frase do cartão, sem "Vai na caixa ..." */
    alvos:[
      { id:'1895',      ico:'../img/jogo/cc/cinema.svg', nome:'Em 1895' },
      { id:'atualmente', ico:'../img/jogo/cc/camera.svg', nome:'Atualmente' }
    ],
    pecas:[
      { id:'mudo',      alvo:'1895',       ico:'../img/jogo/cc/cinema.svg', nome:'Mudo',
        msg:'Em 1895, o cinema era mudo.' },
      { id:'pb',        alvo:'1895',       ico:'../img/jogo/cc/camera.svg', nome:'Preto e branco',
        msg:'Em 1895, o cinema era preto e branco.' },
      { id:'sem-3d',    alvo:'1895',       ico:'../img/jogo/cc/cinema.svg', nome:'3-D não existia',
        msg:'Em 1895, a tecnologia 3-D não existia.' },
      { id:'sonoro',    alvo:'atualmente', ico:'../img/jogo/cc/cinema.svg', nome:'Sonoro',
        msg:'Atualmente, os filmes são sonoros.' },
      { id:'colorido',  alvo:'atualmente', ico:'../img/jogo/cc/camera.svg', nome:'Colorido',
        msg:'Atualmente, os filmes são coloridos.' },
      { id:'com-3d',    alvo:'atualmente', ico:'../img/jogo/cc/cinema.svg', nome:'3-D existe',
        msg:'Atualmente, a tecnologia 3-D existe.' }
    ],
    /* 2 telas de 3 cartões (o jogo antigo nunca mostrava os 6 de uma vez) */
    rodadas:[
      ['mudo', 'pb', 'sem-3d'],
      ['sonoro', 'colorido', 'com-3d']
    ],
    porRodada:3,
    resumoFim:'Você colocou tudo no lugar!',
    creditos:[
      'Ícones de cinema e câmera: Twemoji, CC-BY 4.0.',
      'Texto base: quadro do livro do 3º ano, p. 105.'
    ]
  };

  /* ===== cc-cinema — ligar o ano ao fato (era jogo-campo-cidade-cinema.html) ===== */
  J['cc-cinema'] = {
    id:'cc-cinema', topico:'campo-cidade', tipo:'ligar',
    icone:'🎬', titulo:'O ano e o fato',
    fala:'Ligue o ano ao fato.',
    dica:'Toque no ano e depois na foto.',
    palavrasGrandes:true,      /* a coluna da esquerda são anos */
    pares:[
      { id:'1895', palavra:'1895', foto:'../img/hga/cc/cinema-1895.jpg',
        alt:'Cena do filme A saída dos trabalhadores da fábrica, de 1895',
        fato:'Mudo e preto e branco', audio:'1895. Mudo e preto e branco.',
        msg:'1895: o cinema era mudo e preto e branco.' },
      { id:'1927', palavra:'1927', foto:'../img/hga/cc/cinema-1927.jpg',
        alt:'Foto do filme de 1927, o primeiro com falas',
        fato:'Primeiro filme com falas', audio:'1927. Primeiro filme com falas.',
        msg:'1927: o primeiro filme com falas.' },
      { id:'1937', palavra:'1937', foto:'../img/hga/cc/branca-neve.jpg',
        alt:'Foto do desenho de 1937, Branca de Neve, já colorido',
        fato:'Cor nos desenhos (Branca de Neve)', audio:'1937. Cor nos desenhos. Branca de Neve.',
        msg:'1937: os desenhos ganharam cor, com Branca de Neve.' },
      { id:'1953', palavra:'1953', foto:'../img/hga/cc/museu-cera.jpg',
        alt:'Foto do filme de 1953, em 3-D',
        fato:'Cinema em 3-D (Museu de cera)', audio:'1953. Cinema em 3-D. Museu de cera.',
        msg:'1953: o cinema em 3-D, com Museu de cera.' }
    ],
    resumoFim:'Você ligou tudo!',
    creditos:[
      'Fotos do livro de História e Geografia do 3º ano, p. 104 e 105 (uso escolar).',
      'Cinema mudo (1895), filme com falas (1927), Branca de Neve (1937) e Museu de cera em 3-D (1953).',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    /* bloco final do jogo antigo: o quadro da p. 105 */
    extraFim:'<section class="card"><details class="detalhes" open><summary>O que mudou no cinema (p. 105)</summary>' +
      '<table class="quadro">' +
        '<tr><th>Tipo</th><th>Em 1895</th><th>Atualmente</th></tr>' +
        '<tr><td>Mudo ou sonoro</td><td>mudo</td><td>sonoro</td></tr>' +
        '<tr><td>Preto e branco ou colorido</td><td>preto e branco</td><td>colorido</td></tr>' +
        '<tr><td>Tecnologia 3-D</td><td>não existia</td><td>existe</td></tr>' +
      '</table></details></section>'
  };

  /* ===== cc-filme — quiz sim/não de 4 rodadas (era jogo-campo-cidade-filme.html) ===== */
  J['cc-filme'] = {
    id:'cc-filme', topico:'campo-cidade', tipo:'quiz',
    icone:'❓', titulo:'Sim ou não?',
    dica:'Toque em Sim ou Não.',
    creditos:[
      'Fotos do livro didático, p. 104 e 105 (uso escolar).',
      'Informações do quadro da p. 105 do livro (uso escolar).',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    rodadas:[
      { pergunta:'Em 1895, o cinema era mudo?',
        certa:'Sim', opcoes:['Sim', 'Não'],
        msg:'O filme de 1895 era mudo.',
        img:'../img/hga/cc/cinema-1895.jpg',
        alt:'Cena do filme A saída dos trabalhadores da fábrica, de 1895' },
      { pergunta:'Hoje os filmes são coloridos?',
        certa:'Sim', opcoes:['Sim', 'Não'],
        msg:'Hoje os filmes são coloridos.',
        img:'../img/hga/cc/branca-neve.jpg',
        alt:'Foto do desenho de 1937, Branca de Neve, já colorido' },
      { pergunta:'O 3-D já existia em 1895?',
        certa:'Não', opcoes:['Sim', 'Não'],
        msg:'O 3-D chegou em 1953, com Museu de cera.',
        img:'../img/hga/cc/museu-cera.jpg',
        alt:'Foto do filme de 1953, em 3-D' },
      { pergunta:'O primeiro filme com falas foi em 1927?',
        certa:'Sim', opcoes:['Sim', 'Não'],
        msg:'Em 1927 veio o primeiro filme com falas.',
        img:'../img/hga/cc/cinema-1927.jpg',
        alt:'Foto do filme de 1927, o primeiro com falas' }
    ],
    /* bloco final do jogo antigo: o quadro da p. 105 */
    extraFim:'<details class="detalhes"><summary>O que mudou no cinema</summary>' +
      '<ul class="quadro">' +
      '<li><b>mudo</b> → <b>sonoro</b></li>' +
      '<li><b>preto e branco</b> → <b>colorido</b></li>' +
      '<li><b>3-D não existia</b> → <b>existe</b></li>' +
      '</ul></details>'
  };

  /* ===== cc-filmes — quiz de 7 rodadas (era jogo-campo-cidade-filmes.html) ===== */
  J['cc-filmes'] = {
    id:'cc-filmes', topico:'campo-cidade', tipo:'quiz',
    icone:'🎥', titulo:'Os primeiros filmes',
    dica:'Toque na resposta. Ou ouça com 🔊.',
    apoio:'O filme A saída dos trabalhadores da fábrica era mudo e em preto e branco.',
    creditos:[
      'Ícones de emoji: Twemoji (CC BY 4.0).',
      'Fotos do livro didático de História do 3º ano, páginas 104 e 105 (uso escolar).'
    ],
    rodadas:[
      { pergunta:'Que diversão se tornou popular nas cidades brasileiras há cerca de 100 anos?',
        certa:'O cinema',
        opcoes:['O cinema', 'O passeio no Jardim da Luz', 'Os piqueniques'],
        msg:'O cinema ficou popular nas cidades brasileiras há cerca de 100 anos.' },
      { pergunta:'Em que país aconteceu a primeira exibição de cinema?',
        certa:'Na França',
        opcoes:['Na França', 'No Jardim da Luz', 'No Parque Antártica'],
        msg:'A primeira exibição foi na França, em 1895.',
        img:'../img/hga/cc/cinema-1895.jpg',
        alt:'Cena do filme A saída dos trabalhadores da fábrica, de 1895' },
      { pergunta:'Quem fez a primeira exibição de cinema?',
        certa:'Os irmãos Lumière',
        opcoes:['Os irmãos Lumière', 'Os trabalhadores da fábrica', 'O cantor de jazz'],
        msg:'Os irmãos Lumière fizeram a primeira exibição.' },
      { pergunta:'Qual filme de 1895 era mudo e preto e branco?',
        certa:'A saída dos trabalhadores da fábrica',
        opcoes:['A saída dos trabalhadores da fábrica', 'Branca de Neve e os Sete Anões', 'Museu de cera'],
        msg:'O filme A saída dos trabalhadores da fábrica era mudo e em preto e branco.' },
      { pergunta:'Qual filme de 1927 teve os primeiros diálogos falados?',
        certa:'O cantor de jazz',
        opcoes:['O cantor de jazz', 'Museu de cera', 'A saída dos trabalhadores da fábrica'],
        msg:'Em 1927, O cantor de jazz foi o primeiro filme com falas.',
        img:'../img/hga/cc/cinema-1927.jpg',
        alt:'O cantor de jazz em 1927' },
      { pergunta:'Qual desenho ganhou cor em 1937?',
        certa:'Branca de Neve e os Sete Anões',
        opcoes:['Branca de Neve e os Sete Anões', 'O cantor de jazz', 'Museu de cera'],
        msg:'Em 1937, uma técnica de colorização mais eficiente foi aplicada à animação Branca de Neve e os Sete Anões, lançada nos Estados Unidos.',
        img:'../img/hga/cc/branca-neve.jpg',
        alt:'Branca de Neve em 1937' },
      { pergunta:'Em 1953, qual grande produção usou a tecnologia 3-D?',
        certa:'Museu de cera',
        opcoes:['Museu de cera', 'Em um filme mudo', 'Em um desenho animado'],
        msg:'Antes usada em filmes curtos, a tecnologia 3-D foi aplicada à grande produção Museu de cera, lançada em 1953.',
        img:'../img/hga/cc/museu-cera.jpg',
        alt:'Cena do filme Museu de cera, de 1953' }
    ],
    /* bloco final do jogo antigo: o quadro da p. 105 */
    extraFim:'<details class="detalhes"><summary>O que mudou no cinema</summary>' +
      '<ul class="quadro">' +
      '<li><b>mudo</b> → <b>sonoro</b></li>' +
      '<li><b>preto e branco</b> → <b>colorido</b></li>' +
      '<li><b>3-D não existia</b> → <b>existe</b></li>' +
      '</ul></details>'
  };

  /* ===== mem-cc — memória dos 4 pares iguais (era jogo-campo-cidade-memoria.html) ===== */
  J['mem-cc'] = {
    id:'mem-cc', topico:'campo-cidade', tipo:'memoria',
    icone:'🎬', titulo:'Memória do cinema',
    instrucao:'Encontre os dois iguais.',
    dica:'Ache os 4 pares iguais.',
    colunas:4,
    pares:[
      { id:'1895', nome:'1895: cinema mudo',      ico:'../img/hga/cc/cinema-1895.jpg',
        frase:'1895: cinema mudo' },
      { id:'1927', nome:'1927: filme com falas',  ico:'../img/hga/cc/cinema-1927.jpg',
        frase:'1927: filme com falas' },
      { id:'1937', nome:'1937: filme colorido',   ico:'../img/hga/cc/branca-neve.jpg',
        frase:'1937: filme colorido' },
      { id:'1953', nome:'1953: cinema em 3-D',    ico:'../img/hga/cc/museu-cera.jpg',
        frase:'1953: cinema em 3-D' }
    ],
    /* o motor 'memoria' lê cfg.resumo (MOTORES.md documenta resumoFim) */
    resumo:'Você achou todos os pares!',
    lembrete:'1895: mudo e preto e branco. Hoje: sonoro e colorido.',
    creditos:['Fotos do livro didático, p. 102, 104 e 105; ícones Twemoji, CC-BY 4.0.']
  };

})(window.JOGOS = window.JOGOS || {});
