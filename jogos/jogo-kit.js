/* ===== Jogo Kit — design system + motores declarativos dos jogos =====
   Script clássico (sem build, sem módulo): funciona em http:// e em file://
   Carregar no <head>:  <script src="jogo-kit.js"></script>

   O kit tem 4 camadas:
     1. utilidades      JogoKit.esc / embaralhar / falar / aplicarSkin
     2. progresso       JogoKit.progresso.ler() .gravar(id, valor) .melhor(id, valor)
     3. componentes     <fala-botoes> <barra-progresso> <jogo-topo> <tela-fim>
                        <opcoes-resposta> <fichas-toque> + JogoKit.arrasto
     4. MOTORES         JogoKit.iniciar(cfg) escolhe o motor pelo cfg.tipo:
                          'memoria' 'quiz' 'toque' 'classificar' 'ligar' 'ordem' 'trilha'
   Cada jogo é só um objeto de configuração (ver jogos/<topico>/dados.js);
   o jogador é jogos/jogar.html?jogo=<id>.
*/
(function () {
  'use strict';
  const K = {};

  /* ========== 1. utilidades ========== */
  K.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  K.embaralhar = arr => {                       // Fisher-Yates; devolve nova lista
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  K.canSpeak = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

  K.falar = (texto, taxa) => {
    try {
      if (!K.canSpeak() || !texto) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR'; u.rate = taxa || 0.85;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  };

  K.ouvir = (texto, taxa) => K.falar(texto, taxa || 0.85);

  /* herda a skin escolhida no treino (azul/rosa) — não é obrigatório */
  K.aplicarSkin = () => {
    try {
      const t = JSON.parse(localStorage.getItem('treino3ano.v1') || '{}');
      document.documentElement.dataset.skin = (t && t.skin) === 'rosa' ? 'rosa' : 'azul';
    } catch (e) { document.documentElement.dataset.skin = 'azul'; }
  };

  /* ========== 2. progresso (recorde por jogo) ========== */
  K.CHAVE = 'treino3ano.jogos.v1';
  K.progresso = {
    ler() { try { return JSON.parse(localStorage.getItem(K.CHAVE) || '{}') || {}; } catch (e) { return {}; } },
    gravar(id, valor) {
      try { const p = K.progresso.ler(); p[id] = valor; localStorage.setItem(K.CHAVE, JSON.stringify(p)); } catch (e) {}
    },
    melhor(id, valor) {                            // guarda o melhor (quanto maior, melhor)
      try {
        const p = K.progresso.ler();
        if (!(p[id] >= valor)) { p[id] = valor; localStorage.setItem(K.CHAVE, JSON.stringify(p)); }
        return p[id];
      } catch (e) { return valor; }
    },
    menor(id, valor) {                             // guarda o melhor (quanto menor, melhor)
      try {
        const p = K.progresso.ler();
        const antigo = p[id];
        const bateu = typeof antigo !== 'number' || valor < antigo;
        if (bateu) { p[id] = valor; localStorage.setItem(K.CHAVE, JSON.stringify(p)); }
        return { gravou: bateu, antigo: typeof antigo === 'number' ? antigo : null };
      } catch (e) { return { gravou: true, antigo: null }; }
    }
  };

  /* ========== 3. componentes ========== */

  /* ---------- arrastar e soltar (dedo + mouse) com modo toque ---------- */
  K.alvoSel = '.alvo, .lixeira';                  // o que aceita soltar a peça
  K.arrasto = (function () {
    let sel = null;
    const alvoEm = (x, y) => { const a = document.elementFromPoint(x, y); return a ? a.closest(K.alvoSel) : null; };
    const limparQuase = () => document.querySelectorAll('.alvo.quase, .lixeira.quase').forEach(a => a.classList.remove('quase'));
    const pulso = el => { el.classList.add('pulso'); setTimeout(() => el.classList.remove('pulso'), 1400); };

    function selecionar(el, cb) {
      if (el.dataset.feita) return;
      if (sel === el) { el.classList.remove('sel'); sel = null; cb && cb(null); return; }
      if (sel) sel.classList.remove('sel');
      sel = el; el.classList.add('sel'); cb && cb(el);
    }

    /* liga uma peça. aoLargar(peca, alvo) e aoSelecionar(peca) */
    function ligar(peca, aoLargar, aoSelecionar) {
      let arr = null, movendo = false;
      peca.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionar(peca, aoSelecionar); }
      });
      peca.addEventListener('pointerdown', e => {
        if (peca.dataset.feita) return;
        e.preventDefault();
        try { peca.setPointerCapture(e.pointerId); } catch (_) {}
        arr = { id: e.pointerId, x0: e.clientX, y0: e.clientY }; movendo = false;
      });
      peca.addEventListener('pointermove', e => {
        if (!arr || arr.id !== e.pointerId) return;
        const dx = e.clientX - arr.x0, dy = e.clientY - arr.y0;
        if (!movendo && Math.hypot(dx, dy) < 8) return;
        movendo = true;
        peca.classList.add('arrastando');
        peca.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.05)';
        limparQuase();
        const a = alvoEm(e.clientX, e.clientY); if (a) a.classList.add('quase');
      });
      peca.addEventListener('pointerup', e => {
        if (!arr || arr.id !== e.pointerId) return;
        const foi = movendo;
        peca.classList.remove('arrastando'); peca.style.transform = '';
        arr = null; movendo = false; limparQuase();
        if (foi) { const a = alvoEm(e.clientX, e.clientY); if (a) aoLargar(peca, a); else pulso(peca); }
        else selecionar(peca, aoSelecionar);      // toque curto = seleciona (modo toque)
      });
      peca.addEventListener('pointercancel', () => {
        peca.classList.remove('arrastando'); peca.style.transform = '';
        arr = null; movendo = false; limparQuase();
      });
    }

    /* liga um destino. aoToque(pecaSelecionada, alvo) */
    function ligarAlvo(alvo, aoToque) {
      const tentar = () => { if (sel) aoToque(sel, alvo); };
      alvo.addEventListener('click', tentar);
      alvo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tentar(); } });
    }

    return {
      ligar, ligarAlvo,
      get selecionada() { return sel; },
      limpar() { if (sel) { sel.classList.remove('sel'); sel = null; } },
      limparQuase
    };
  })();

  K.pecaHtml = (p) => {                      // helper para montar uma peça (arrastável)
    const ico = p.ico || p.foto;
    return '<div class="peca' + (p.foto && !p.ico ? ' foto' : '') + (ico ? '' : ' texto') +
      '" data-id="' + K.esc(p.id) + '" data-alvo="' + K.esc(p.alvo || '') +
      '" data-msg="' + K.esc(p.msg || '') + '" data-tent="0" role="button" tabindex="0" aria-label="' + K.esc(p.alt || p.nome || '') + '">' +
      (ico ? (ehImagem(ico) ? '<img src="' + K.esc(ico) + '" alt="">' : '<span class="emoji" aria-hidden="true">' + K.esc(ico) + '</span>') : '') +
      (p.alt ? '' : '<span class="nome">' + K.esc(p.nome || '') + '</span>') +
    '</div>';
  };

  /* ---------- <fala-botoes> ---------- */
  class FalaBotoes extends HTMLElement {
    static get observedAttributes() { return ['texto']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const texto = this.getAttribute('texto') || '';
      this.classList.add('fala-botoes');
      this.innerHTML = '<button type="button" class="mini" data-a="0.85">🔊 Ouvir</button>' +
        '<button type="button" class="mini" data-a="0.55">🐢 Devagar</button>';
      this.querySelectorAll('[data-a]').forEach(b => b.onclick = () => K.falar(texto, +b.dataset.a));
      if (!K.canSpeak()) {
        const p = document.createElement('p');
        p.className = 'hint';
        p.textContent = 'Este aparelho não fala. Peça a um adulto para ler em voz alta.';
        this.appendChild(p);
      }
    }
  }

  /* ---------- <barra-progresso valor total> ---------- */
  class BarraProgresso extends HTMLElement {
    static get observedAttributes() { return ['valor', 'total']; }
    connectedCallback() { if (!this.querySelector('.bar')) this.render(); this.atualizar(); }
    attributeChangedCallback() { if (this.isConnected) this.atualizar(); }
    render() {
      this.innerHTML = '<div class="bar" role="progressbar" aria-label="Progresso" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0"><i></i></div>';
    }
    atualizar(v, t) {
      const valor = v == null ? +this.getAttribute('valor') || 0 : v;
      const total = t == null ? +this.getAttribute('total') || 1 : t;
      const bar = this.querySelector('.bar'); if (!bar) return;
      bar.setAttribute('aria-valuemax', total);
      bar.setAttribute('aria-valuenow', valor);
      const i = bar.querySelector('i');
      if (i) i.style.width = Math.round((total ? valor / total : 0) * 100) + '%';
    }
  }

  /* ---------- <jogo-topo ...> → evento "voltar" (o título é o <h1> da tela) ---------- */
  class JogoTopo extends HTMLElement {
    connectedCallback() {
      const icone = this.getAttribute('icone') || '';
      const titulo = this.getAttribute('titulo') || '';
      const contador = this.getAttribute('contador') || '';
      const rotulo = this.getAttribute('rotulo-voltar') || '← Fases';
      this.innerHTML =
        '<header class="top small" style="display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;margin-bottom:10px">' +
          '<button type="button" class="mini" data-voltar>' + K.esc(rotulo) + '</button>' +
          '<h1 class="fase-nome" style="margin:0">' + K.esc(icone) + ' ' + K.esc(titulo) + '</h1>' +
          '<span class="cont" data-contador>' + K.esc(contador) + '</span>' +
        '</header>';
      this.querySelector('[data-voltar]').onclick = () => this.dispatchEvent(new CustomEvent('voltar', { bubbles: true }));
    }
    set contador(v) { const c = this.querySelector('[data-contador]'); if (c) c.textContent = v; }
  }

  /* ---------- <tela-fim ...> → evento "fim" (detail.acao) ---------- */
  class TelaFim extends HTMLElement {
    connectedCallback() {
      const icone = this.getAttribute('icone') || '';
      const titulo = this.getAttribute('titulo') || '';
      const estrelas = +this.getAttribute('estrelas') || 0;
      const total = +this.getAttribute('total') || 0;
      const resumo = this.getAttribute('resumo') || '';
      const msg = this.getAttribute('msg') || '';
      const rotuloDenovo = this.getAttribute('rotulo-denovo') || 'Jogar de novo';
      const rotuloOutros = this.getAttribute('rotulo-outros') || 'Outras fases';
      this.innerHTML =
        '<section class="card fim">' +
          '<h1 class="fase-nome">' + K.esc(icone) + ' ' + K.esc(titulo) + '</h1>' +
          '<p class="estrelas" aria-hidden="true">' + '⭐'.repeat(estrelas) + '☆'.repeat(Math.max(0, total - estrelas)) + '</p>' +
          (resumo ? '<p class="resumo">' + K.esc(resumo) + '</p>' : '') +
          (msg ? '<p class="msg">' + K.esc(msg) + '</p>' : '') +
          '<div class="acoes">' +
            '<button type="button" class="btn" data-acao="denovo">' + K.esc(rotuloDenovo) + '</button>' +
            '<button type="button" class="btn" data-acao="outros">' + K.esc(rotuloOutros) + '</button>' +
          '</div>' +
        '</section>';
      this.querySelectorAll('[data-acao]').forEach(b => b.onclick = () =>
        this.dispatchEvent(new CustomEvent('fim', { bubbles: true, detail: { acao: b.dataset.acao } })));
    }
  }

  /* ---------- <opcoes-resposta> → evento "resposta" (detail: {ok, indice, certa}) ---------- */
  class OpcoesResposta extends HTMLElement {
    montar(cfg) {
      this._cfg = cfg;
      const certa = typeof cfg.certa === 'number' ? cfg.certa : cfg.opcoes.indexOf(cfg.certa);
      this.innerHTML =
        (cfg.pergunta ? '<p class="pergunta">' + K.esc(cfg.pergunta) + '</p>' : '') +
        '<div class="opcoes" role="group">' + cfg.opcoes.map((o, i) =>
          '<button type="button" class="btn opcao-btn" data-i="' + i + '">' +
            (cfg.icones && cfg.icones[i] ? '<img class="ico-b" src="' + K.esc(cfg.icones[i]) + '" alt="">' : '') +
            '<span>' + K.esc(o) + '</span>' +
          '</button>').join('') +
        '</div>' +
        '<p class="feed" aria-live="polite" data-feed></p>';
      this.dataset.certa = certa;
      this.querySelectorAll('[data-i]').forEach(b => b.onclick = () => this._responder(+b.dataset.i, certa, cfg));
      return this;
    }
    _responder(i, certa, cfg) {
      const botoes = [...this.querySelectorAll('[data-i]')];
      botoes.forEach(b => b.disabled = true);
      const ok = i === certa;
      botoes[i].classList.add(ok ? 'ok' : 'bad');
      if (!ok) botoes[certa].classList.add('ok');
      const feed = this.querySelector('[data-feed]');
      feed.className = 'feed ' + (ok ? 'ok' : 'bad');
      feed.textContent = ok ? ('✓ ' + (cfg.msg || 'Muito bem!'))
                            : ('✗ A resposta certa é: ' + cfg.opcoes[certa] + (cfg.msg ? ' ' + cfg.msg : ''));
      this.dispatchEvent(new CustomEvent('resposta', { bubbles: true, detail: { ok, indice: i, certa } }));
    }
    get respondida() { return !!this.querySelector('[data-i][disabled]'); }
  }

  /* ---------- <fichas-toque> → evento "conferido" (detail: {ok, escolhidas, certas}) ---------- */
  class FichasToque extends HTMLElement {
    montar(cfg) {
      this._cfg = cfg;
      const inter = (cfg.quantas || cfg.certas.length);
      this.innerHTML =
        (cfg.pergunta ? '<p class="pergunta">' + K.esc(cfg.pergunta) + '</p>' : '') +
        '<div class="fichas" role="group">' + cfg.fichas.map((f, i) => {
          const nome = typeof f === 'string' ? f : f.nome;
          const ico = typeof f === 'string' ? '' : (f.ico || '');
          return '<button type="button" class="ficha" data-id="' + K.esc(nome) + '" aria-pressed="false">' +
            (ico ? '<img src="' + K.esc(ico) + '" alt="">' : '') + '<span>' + K.esc(nome) + '</span></button>';
        }).join('') +
        '</div>' +
        '<p class="say"><button type="button" class="btn jogar" data-conferir disabled>Conferir</button></p>' +
        '<p class="feed" aria-live="polite" data-feed></p>';
      const conf = this.querySelector('[data-conferir]');
      this.querySelectorAll('.ficha').forEach(b => b.onclick = () => {
        if (this._feito) return;
        b.classList.toggle('sel');
        b.setAttribute('aria-pressed', b.classList.contains('sel'));
        const n = this.querySelectorAll('.ficha.sel').length;
        conf.disabled = n !== inter;
      });
      conf.onclick = () => this._conferir(cfg);
      return this;
    }
    _conferir(cfg) {
      this._feito = true;
      const certas = cfg.certas;
      const escolhidas = [...this.querySelectorAll('.ficha.sel')].map(b => b.dataset.id);
      const ok = escolhidas.length === certas.length && escolhidas.every(e => certas.includes(e));
      this.querySelectorAll('.ficha').forEach(b => {
        const id = b.dataset.id;
        b.classList.remove('sel');
        b.disabled = true;
        if (certas.includes(id)) b.classList.add('certa');
        else if (escolhidas.includes(id)) b.classList.add('errada');
      });
      const feed = this.querySelector('[data-feed]');
      feed.className = 'feed ' + (ok ? 'ok' : 'bad');
      feed.textContent = ok ? ('✓ ' + (cfg.msg || 'Muito bem!'))
                            : ('✗ Os certos são: ' + certas.join(', ') + '.' + (cfg.msg ? ' ' + cfg.msg : ''));
      this.dispatchEvent(new CustomEvent('conferido', { bubbles: true, detail: { ok, escolhidas, certas } }));
    }
    get conferido() { return !!this._feito; }
  }

  customElements.define('fala-botoes', FalaBotoes);
  customElements.define('barra-progresso', BarraProgresso);
  customElements.define('jogo-topo', JogoTopo);
  customElements.define('tela-fim', TelaFim);
  customElements.define('opcoes-resposta', OpcoesResposta);
  customElements.define('fichas-toque', FichasToque);

  /* ========== 4. motores declarativos ==========
     Cada motor devolve { reiniciar }. O JogoKit.iniciar() liga os eventos comuns
     (voltar → menu do tópico; fim.denovo → reiniciar; fim.outros → menu do tópico). */

  const app = () => document.getElementById('app');
  const topicoUrl = cfg => (cfg.topico ? cfg.topico + '/index.html' : 'index.html');

  K.rodape = cfg =>
    '<p class="rodape"><a href="' + K.esc(topicoUrl(cfg)) + '">← Todos os jogos do tópico</a> · ' +
    '<a href="index.html">← Todos os tópicos</a> · <a href="../index.html">← Treino</a></p>' +
    creditoHtml(cfg);

  function creditoHtml(cfg) {
    if (!cfg.creditos && !cfg.lembrete) return '';
    let h = '<details class="detalhes"><summary>Créditos das imagens</summary>';
    if (cfg.lembrete) h += '<p>' + K.esc(cfg.lembrete) + '</p>';
    if (cfg.creditos) h += '<ul>' + cfg.creditos.map(c => '<li>' + K.esc(c) + '</li>').join('') + '</ul>';
    return h + '</details>';
  }

  const topoHtml = (cfg, contador) =>
    '<jogo-topo icone="' + K.esc(cfg.icone || '') + '" titulo="' + K.esc(cfg.titulo || '') +
    '" contador="' + K.esc(contador || '') + '" rotulo-voltar="← Fases"></jogo-topo>';

  const barraHtml = (v, t) => '<barra-progresso valor="' + v + '" total="' + t + '"></barra-progresso>';
  const falaHtml = txt => '<fala-botoes texto="' + K.esc(txt) + '"></fala-botoes>';

  const fimHtml = (cfg, estrelas, total, resumo, msg) =>
    '<tela-fim icone="' + K.esc(cfg.icone || '') + '" titulo="' + K.esc(cfg.titulo || '') +
    '" estrelas="' + estrelas + '" total="' + total + '" resumo="' + K.esc(resumo) + '" msg="' + K.esc(msg) + '"></tela-fim>';

  /* componentes web criados por innerHTML às vezes não rodam o connectedCallback em
     navegadores antigos; esta chamada é idempotente (só age em quem ainda não desenhou). */
  const upgrade = root =>
    (root || document).querySelectorAll('jogo-topo,barra-progresso,tela-fim').forEach(el => {
      if (!el.firstElementChild && typeof el.connectedCallback === 'function') el.connectedCallback();
    });

  const subir = () => { try { window.scrollTo(0, 0); } catch (e) {} };

  /* ---- helpers usados por vários motores ---- */
  const ehFoto = src => src && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(src);
  const ehImagem = src => src && /\.(svg|png|jpe?g|webp|gif|avif)$/i.test(src);
  const iconeHtml = (ico, classe) => !ico ? '' : (ehImagem(ico)
    ? '<img class="' + classe + '" src="' + K.esc(ico) + '" alt="">'
    : '<span class="' + classe + ' emoji" aria-hidden="true">' + K.esc(ico) + '</span>');

  K.motores = {};

  /* ---------- MOTOR: memoria (pares iguais; recorde = MENOR nº de tentativas) ---------- */
  K.motores.memoria = {
    iniciar(cfg, host) {
      const pares = cfg.pares || [];
      const total = pares.length;
      const espera = cfg.espera || 900;
      const colunas = cfg.colunas || Math.min(total * 2, 4);
      const instrucao = cfg.instrucao || 'Encontre os dois iguais.';
      let S = null, timer = null;

      const recorde = () => { const r = K.progresso.ler()[cfg.id]; return (typeof r === 'number' && isFinite(r)) ? r : null; };
      const diz = (txt, tipo) => { const f = host.querySelector('#feed'); if (!f) return; f.textContent = txt; f.className = 'feed' + (tipo ? ' ' + tipo : ''); };
      const atualizar = () => {
        const t = host.querySelector('jogo-topo'); if (t) t.contador = S.pares + '/' + total;
        const b = host.querySelector('barra-progresso'); if (b) b.atualizar(S.pares, total);
      };
      const virar = (carta, b) => {
        carta.classList.add('virada');
        carta.innerHTML = '<img src="' + K.esc(b.ico || b.foto) + '" alt=""><span class="nome">' + K.esc(b.nome) + '</span>';
        carta.setAttribute('aria-label', b.nome);
      };
      const fechar = carta => { carta.classList.remove('virada'); carta.innerHTML = '<span class="verso">?</span>'; carta.setAttribute('aria-label', 'Carta fechada'); };

      function tocar(carta) {
        if (S.trava || carta.classList.contains('virada') || carta.classList.contains('travada')) return;
        const b = pares.filter(x => x.id === carta.dataset.bicho)[0];
        if (!b) return;
        virar(carta, b);
        if (!S.primeira) { S.primeira = carta; if (b.frase) K.falar(b.nome); return; }
        const p1 = S.primeira; S.primeira = null; S.tentativas++;
        if (p1.dataset.bicho === carta.dataset.bicho) {
          S.pares++;
          [p1, carta].forEach(c => { c.classList.add('travada'); c.setAttribute('aria-label', b.nome + ', igual'); });
          diz('✓ ' + (b.frase || b.nome), 'ok');
          if (b.frase) K.falar(b.frase, 0.85);
          atualizar();
          if (S.pares === total) { S.trava = true; timer = setTimeout(() => { timer = null; fim(); }, espera); }
        } else {
          S.trava = true;
          diz('As duas cartas são diferentes.', '');
          K.falar('As duas cartas são diferentes.', 0.85);
          timer = setTimeout(() => { timer = null; fechar(p1); fechar(carta); S.trava = false; }, espera);
        }
      }

      function render() {
        if (timer) { clearTimeout(timer); timer = null; }
        S = { pares: 0, tentativas: 0, primeira: null, trava: false };
        const rec = recorde();
        const cartas = K.embaralhar(pares.concat(pares));
        host.innerHTML =
          topoHtml(cfg, '0/' + total) + barraHtml(0, total) +
          '<section class="card">' +
            '<p class="pergunta">' + K.esc(instrucao) + '</p>' + falaHtml(instrucao) +
            (cfg.dica ? '<p class="hint">' + K.esc(cfg.dica) + '</p>' : '') +
            '<div class="tabuleiro" id="tabuleiro" aria-label="Cartas do jogo" style="margin-top:16px;grid-template-columns:repeat(' + colunas + ',1fr)">' +
              cartas.map(b => '<div class="carta" data-bicho="' + K.esc(b.id) + '" role="button" tabindex="0" aria-label="Carta fechada"><span class="verso">?</span></div>').join('') +
            '</div>' +
            '<p class="feed" id="feed" aria-live="polite"></p>' +
            '<p class="recorde" id="recorde">' + (rec == null ? K.esc(instrucao) : 'Seu recorde: ' + rec + (rec === 1 ? ' tentativa.' : ' tentativas.')) + '</p>' +
          '</section>' + K.rodape(cfg);
        upgrade(host);
        host.querySelectorAll('.carta').forEach(c => {
          const acao = () => tocar(c);
          c.addEventListener('click', acao);
          c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); acao(); } });
        });
        atualizar(); subir();
      }

      function fim() {
        const antigo = recorde();
        const r = K.progresso.menor(cfg.id, S.tentativas);
        const melhor = r.gravou ? S.tentativas : (antigo == null ? S.tentativas : antigo);
        const msg = (r.gravou && antigo != null ? 'Novo recorde! ' : '') +
          'Você fez os ' + total + ' pares em ' + S.tentativas + (S.tentativas === 1 ? ' tentativa. ' : ' tentativas. ') +
          'Seu recorde: ' + melhor + (melhor === 1 ? ' tentativa.' : ' tentativas.');
        host.innerHTML = fimHtml(cfg, total, total, cfg.resumoFim || cfg.resumo || 'Você achou os ' + total + ' pares!', msg) +
          (cfg.extraFim || '') + K.rodape(cfg);
        upgrade(host);
        K.falar((cfg.resumo || 'Parabéns!'), 0.85);
        subir();
      }

      render();
      return { reiniciar: render };
    }
  };

  /* ---------- MOTOR: quiz (pergunta de múltipla escolha; também serve sim/não) ---------- */
  K.motores.quiz = {
    iniciar(cfg, host) {
      const rodadas = cfg.rodadas || [];
      const total = rodadas.length;
      const dica = cfg.dica === undefined ? 'Toque na resposta. Ou ouça com 🔊.' : cfg.dica;
      let i = 0, acertos = 0;

      function tela() {
        const r = rodadas[i];
        host.innerHTML =
          topoHtml(cfg, (i + 1) + '/' + total) + barraHtml(i, total) +
          '<section class="card">' + falaHtml(r.pergunta) +
            (dica ? '<p class="hint">' + K.esc(dica) + '</p>' : '') +
            ((r.apoio || cfg.apoio) ? falaHtml(r.apoio || cfg.apoio) : '') +
            '<div data-quiz></div>' +
            '<button type="button" class="btn prox escondido" data-prox>Próxima →</button>' +
          '</section>' + K.rodape(cfg);
        upgrade(host);

        let opcoes, icones = null;
        if (r.opcoes) {
          const itens = r.opcoes.map((o, i) => ({ o: o, ico: r.icones ? (r.icones[i] || '') : '' }));
          const ordem = r.opcoes.length > 2 ? K.embaralhar(itens) : itens;
          opcoes = ordem.map(x => x.o);
          if (r.icones) icones = ordem.map(x => x.ico);
        } else if (r.errada != null) {
          opcoes = K.embaralhar([r.certa, r.errada]);
        } else {
          opcoes = ['Sim', 'Não'];
        }
        const op = document.createElement('opcoes-resposta');
        op.montar({ pergunta: r.pergunta, opcoes: opcoes, certa: r.certa, msg: r.msg, icones: icones });

        const foto = r.img || r.foto || r.ico;
        if (foto) {
          const img = document.createElement('img');
          img.className = ehFoto(foto) ? 'foto-rodada' : 'ico-rodada';
          img.src = foto; img.alt = r.alt || '';
          op.insertBefore(img, op.querySelector('.opcoes'));
        }
        host.querySelector('[data-quiz]').appendChild(op);

        const prox = host.querySelector('[data-prox]');
        prox.onclick = proxima;
        op.addEventListener('resposta', e => {
          const ok = !!(e.detail && e.detail.ok);
          if (ok) acertos++;
          prox.classList.remove('escondido');
          const b = host.querySelector('barra-progresso'); if (b) b.atualizar(i + 1, total);
          K.falar(ok ? ('✓ ' + r.msg) : ('✗ A resposta certa é: ' + r.certa + '. ' + r.msg));
        });
        subir();
      }

      function proxima() { if (i + 1 < total) { i++; tela(); } else { fim(); } }

      function fim() {
        K.progresso.melhor(cfg.id, acertos);
        const msg = acertos === total ? 'Muito bem! Você acertou tudo de primeira.'
          : 'Você acertou ' + acertos + ' de ' + total + '. Pode jogar de novo.';
        host.innerHTML = fimHtml(cfg, acertos, total, cfg.resumoFim || 'Você respondeu tudo!', msg) + (cfg.extraFim || '') + K.rodape(cfg);
        upgrade(host);
        K.falar('Você acertou ' + acertos + ' de ' + total + '.');
        subir();
      }

      function reiniciar() { i = 0; acertos = 0; tela(); }
      reiniciar();
      return { reiniciar };
    }
  };

  /* ---------- MOTOR: toque (marcar N fichas certas; várias telas) ---------- */
  K.motores.toque = {
    iniciar(cfg, host) {
      const telas = cfg.telas || [];
      const total = telas.length;
      const fichas = cfg.fichas || [];
      let i = 0, acertos = 0;

      function tela() {
        const t = telas[i];
        const dica = t.hint !== undefined ? t.hint : (cfg.hint || '');
        const apoio = t.apoio !== undefined ? t.apoio : (cfg.apoio || '');
        host.innerHTML =
          topoHtml(cfg, (i + 1) + '/' + total) + barraHtml(i, total) +
          '<section class="card">' +
            (t.titulo ? '<h2 class="titulo-tela">' + K.esc(t.titulo) + '</h2>' : '') +
            falaHtml(t.pergunta) + (dica ? '<p class="hint">' + K.esc(dica) + '</p>' : '') +
            (apoio ? falaHtml(apoio) : '') +
            '<div data-toque></div>' +
            '<button type="button" class="btn prox escondido" data-prox>Próxima →</button>' +
          '</section>' + K.rodape(cfg);
        upgrade(host);

        const ft = document.createElement('fichas-toque');
        ft.montar({ pergunta: t.pergunta, fichas: K.embaralhar(t.fichas || fichas), certas: t.certas, msg: t.msg });
        if (t.img) {
          const img = document.createElement('img');
          img.className = 'apoio'; img.src = t.img; img.alt = t.alt || '';
          ft.insertBefore(img, ft.querySelector('.fichas'));
        }
        host.querySelector('[data-toque]').appendChild(ft);

        const prox = host.querySelector('[data-prox]');
        prox.onclick = proxima;
        ft.addEventListener('conferido', e => {
          const ok = !!(e.detail && e.detail.ok);
          if (ok) acertos++;
          prox.classList.remove('escondido');
          const b = host.querySelector('barra-progresso'); if (b) b.atualizar(i + 1, total);
          K.falar(ok ? ('✓ ' + t.msg) : ('✗ Os certos são: ' + t.certas.join(', ') + '. ' + t.msg));
        });
        subir();
      }

      function proxima() { if (i + 1 < total) { i++; tela(); } else { fim(); } }

      function fim() {
        K.progresso.melhor(cfg.id, acertos);
        const msg = acertos === total ? 'Muito bem! Você acertou tudo de primeira.'
          : 'Você acertou ' + acertos + ' de ' + total + '. Pode jogar de novo.';
        host.innerHTML = fimHtml(cfg, acertos, total, cfg.resumoFim || 'Você tocou nos certos!', msg) + (cfg.extraFim || '') + K.rodape(cfg);
        upgrade(host);
        K.falar('Você acertou ' + acertos + ' de ' + total + '.');
        subir();
      }

      function reiniciar() { i = 0; acertos = 0; tela(); }
      reiniciar();
      return { reiniciar };
    }
  };

  /* ---------- MOTOR: classificar (arrastar/tocar a peça até a caixa certa) ---------- */
  K.motores.classificar = {
    iniciar(cfg, host) {
      const alvos = cfg.alvos || [];
      const pecas = cfg.pecas || [];
      const total = pecas.length;
      const rodadas = cfg.rodadas || [pecas.map(p => p.id)];
      const porRodada = cfg.porRodada || (rodadas[0] ? rodadas[0].length : total);
      const layout = cfg.layout || 'caixas';     // 'caixas' | 'lixeiras'
      const nomeAlvo = id => (alvos.filter(a => a.id === id)[0] || {}).nome || '';
      let rodada = 0, S = null;

      const diz = (txt, ok) => { const f = host.querySelector('#feed'); if (!f) return; f.textContent = txt; f.className = 'feed ' + (ok ? 'ok' : 'bad'); };
      const pulso = el => { el.classList.add('pulso'); setTimeout(() => el.classList.remove('pulso'), 1400); };
      const atualizar = () => {
        const c = host.querySelector('jogo-topo [data-contador]'); if (c) c.textContent = S.colocadas + '/' + total;
        const b = host.querySelector('barra-progresso'); if (b) { if (!b.querySelector('.bar') && b.render) b.render(); if (b.atualizar) b.atualizar(S.colocadas, total); }
      };
      const alvoHtml = a => layout === 'lixeiras'
        ? '<div class="lixeira alvo ' + K.esc(a.classe || a.id) + '" data-id="' + K.esc(a.id) + '" role="button" tabindex="0" aria-label="Lixeira: ' + K.esc(a.nome) + '">' +
            '<div class="tampa" aria-hidden="true"></div>' +
            '<div class="nome">' + K.esc(a.nome) + '</div>' +
            (a.cor ? '<div class="cor">' + K.esc(a.cor) + '</div>' : '') +
            '<div class="encaixados"></div></div>'
        : '<div class="alvo" data-id="' + K.esc(a.id) + '" role="button" tabindex="0" aria-label="Grupo: ' + K.esc(a.nome) + '">' +
            (a.foto ? '<img class="foto" src="' + K.esc(a.foto) + '" alt="' + K.esc(a.alt || '') + '">'
                    : iconeHtml(a.ico, 'ico')) +
            '<span class="nome">' + K.esc(a.nome) + '</span>' +
            '<span class="encaixados"></span></div>';

      function soltar(peca, alvo) {
        if (!peca || !alvo || peca.dataset.feita) return;
        const tent = +peca.dataset.tent || 0;
        if (peca.dataset.alvo === alvo.dataset.id) {
          peca.dataset.feita = '1';
          if (tent === 0) S.primeiras++;
          peca.classList.add('encaixada');
          if (layout === 'lixeiras') alvo.classList.add('feita');
          const caixa = alvo.querySelector('.encaixados'); if (caixa) caixa.appendChild(peca);
          K.arrasto.limpar();
          S.colocadas++; S.naRodada++;
          diz('✓ ' + peca.dataset.msg, true);
          K.falar(peca.dataset.msg, 0.85);
          atualizar();
          if (S.colocadas === total) setTimeout(fim, 900);
          else if (S.naRodada >= porRodada && S.colocadas < total) setTimeout(proximaRodada, 1500);
        } else {
          peca.dataset.tent = tent + 1;
          const aviso = (cfg.erroComDestino === false ? '' : 'Vai na ' + (layout === 'lixeiras' ? 'lixeira ' : 'caixa ') + nomeAlvo(peca.dataset.alvo) + '. ') + peca.dataset.msg;
          diz('✗ ' + aviso, false);
          K.falar(aviso, 0.85);
          pulso(peca);
          const bom = host.querySelector('[data-id="' + peca.dataset.alvo + '"]');
          if (bom) { bom.classList.add('brilho'); setTimeout(() => bom.classList.remove('brilho'), 2200); }
        }
      }

      function renderRodada() {
        K.arrasto.limpar();
        S.naRodada = 0;
        const ids = rodadas[rodada] || [];
        const daVez = K.embaralhar(ids.map(id => pecas.filter(p => p.id === id)[0]).filter(Boolean));
        host.innerHTML =
          topoHtml(cfg, S.colocadas + '/' + total) + barraHtml(S.colocadas, total) +
          '<section class="card">' +
            '<p class="pergunta">' + K.esc(cfg.instrucao) + '</p>' +
            (cfg.apoio ? falaHtml(cfg.apoio) : '') +
            (cfg.hint ? '<p class="hint">' + K.esc(cfg.hint) + '</p>' : '') +
            (cfg.detalhes ? '<details class="detalhes"><summary>' + K.esc(cfg.detalhes.titulo) + '</summary><p>' + K.esc(cfg.detalhes.texto) + '</p>' + falaHtml(cfg.detalhes.texto) + '</details>' : '') +
            '<div class="' + (layout === 'lixeiras' ? 'lixeiras' : 'alvos') + '" style="margin-top:16px">' + alvos.map(alvoHtml).join('') + '</div>' +
            '<div class="bandeja">' + daVez.map(p => K.pecaHtml(p)).join('') + '</div>' +
            '<p class="feed" id="feed" aria-live="polite"></p>' +
          '</section>' + K.rodape(cfg);
        upgrade(host); atualizar();
        host.querySelectorAll('.peca').forEach(p => K.arrasto.ligar(p, soltar, q => { const n = q && q.querySelector('.nome'); if (n) K.falar(n.textContent, 0.85); }));
        host.querySelectorAll('.alvo, .lixeira').forEach(a => K.arrasto.ligarAlvo(a, soltar));
        subir();
      }

      function proximaRodada() { rodada++; renderRodada(); }

      function fim() {
        K.arrasto.limpar();
        const a = S.primeiras, n = total;
        K.progresso.melhor(cfg.id, a);
        const estrelas = Math.max(1, a);
        const msg = a === n ? 'Você acertou tudo de primeira! Muito bem!'
          : (a === n - 1 ? 'Muito bem! Quase tudo de primeira.'
          : 'Você acertou ' + a + ' de ' + n + ' de primeira. Pode jogar de novo.');
        host.innerHTML = fimHtml(cfg, estrelas, n, cfg.resumoFim || 'Tudo no lugar!', msg) + (cfg.extraFim || '') + K.rodape(cfg);
        upgrade(host);
        K.falar((cfg.resumoFim || 'Tudo no lugar!') + ' Você acertou ' + a + ' de ' + n + ' de primeira.', 0.85);
        subir();
      }

      function reiniciar() { rodada = 0; S = { colocadas: 0, naRodada: 0, primeiras: 0 }; renderRodada(); }
      reiniciar();
      return { reiniciar };
    }
  };

  /* ---------- MOTOR: ligar (palavra → foto/fato) ---------- */
  K.motores.ligar = {
    iniciar(cfg, host) {
      const pares = cfg.pares || [];
      const total = pares.length;
      const dado = id => pares.filter(p => p.id === id)[0];
      let sel = null, S = null;

      const diz = (txt, ok) => { const f = host.querySelector('#feed'); if (!f) return; f.textContent = txt; f.className = 'feed ' + (ok ? 'ok' : 'bad'); };
      const atualizar = () => {
        const b = host.querySelector('barra-progresso'); if (b && b.atualizar) b.atualizar(S.feitos, total);
        const t = host.querySelector('jogo-topo'); if (t) { t.contador = S.feitos + '/' + total; t.setAttribute('contador', S.feitos + '/' + total); }
      };

      function tocarPalavra(el) {
        if (el.classList.contains('feito')) return;
        if (sel === el) { el.classList.remove('sel'); sel = null; return; }
        if (sel) sel.classList.remove('sel');
        sel = el; el.classList.add('sel');
        const d = dado(el.dataset.min);
        K.falar(d && d.audio ? d.audio : el.textContent.trim(), 0.85);
      }

      function tocarFoto(el) {
        if (el.classList.contains('feito')) return;
        if (!sel) { const aviso = cfg.dica || 'Toque primeiro na palavra.'; diz(aviso, false); K.falar(aviso, 0.85); return; }
        const id = sel.dataset.min;
        const d = dado(id);
        if (id === el.dataset.id) {
          el.classList.add('feito'); sel.classList.add('feito'); sel.classList.remove('sel'); sel = null;
          S.feitos++; if (!S.errou[id]) S.primeiras++;
          diz('✓ ' + d.msg, true);
          K.falar(d.msg, 0.85);
          atualizar();
          if (S.feitos === total) setTimeout(fim, 900);
        } else {
          S.errou[id] = true;
          diz('✗ ' + (cfg.erroMsg ? cfg.erroMsg(id, d) : ('Tente outra foto. ' + d.msg)), false);
          K.falar(d.msg, 0.85);
          const certa = host.querySelector('.opcao.foto[data-id="' + id + '"]');
          if (certa) { certa.classList.add('brilho'); setTimeout(() => certa.classList.remove('brilho'), 1900); }
        }
      }

      function render() {
        sel = null; S = { feitos: 0, primeiras: 0, errou: {} };
        const fotos = K.embaralhar(pares);
        host.innerHTML =
          topoHtml(cfg, '0/' + total) + barraHtml(0, total) +
          '<section class="card">' +
            (cfg.instrucao ? '<p class="pergunta">' + K.esc(cfg.instrucao) + '</p>' : '') +
            (cfg.fala ? falaHtml(cfg.fala) : '') +
            (cfg.dica ? '<p class="hint">' + K.esc(cfg.dica) + '</p>' : '') +
            (cfg.apoio ? '<p class="hint">' + K.esc(cfg.apoio) + '</p>' : '') +
            '<div class="ligar">' +
              '<div class="coluna">' + pares.map(p =>
                '<div class="opcao palavra' + (cfg.palavrasGrandes ? ' grande' : '') + '" data-min="' + K.esc(p.id) + '" role="button" tabindex="0" aria-label="' + K.esc(p.palavra) + '">' + K.esc(p.palavra) + '</div>').join('') + '</div>' +
              '<div class="coluna">' + fotos.map(p =>
                '<div class="opcao foto" data-id="' + K.esc(p.id) + '" role="button" tabindex="0" aria-label="' + K.esc(p.alt || p.nome || p.palavra) + '">' +
                  (p.foto ? '<img src="' + K.esc(p.foto) + '" alt="">' : '') +
                  '<span class="' + (p.foto ? 'nome' : 'fato') + '">' + K.esc(p.nome || p.fato || '') + '</span>' +
                  (p.nota ? '<span class="nota">' + K.esc(p.nota) + '</span>' : '') +
                '</div>').join('') + '</div>' +
            '</div>' +
            '<p class="feed" id="feed" aria-live="polite"></p>' +
          '</section>' + K.rodape(cfg);
        upgrade(host);
        host.querySelectorAll('.opcao.palavra').forEach(el => {
          el.addEventListener('click', () => tocarPalavra(el));
          el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocarPalavra(el); } });
        });
        host.querySelectorAll('.opcao.foto').forEach(el => {
          el.addEventListener('click', () => tocarFoto(el));
          el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocarFoto(el); } });
        });
        subir();
      }

      function fim() {
        const n = S.primeiras;
        K.progresso.melhor(cfg.id, n);
        const msg = cfg.msgFim || (n === total ? 'Você acertou tudo de primeira!'
          : (n === total - 1 ? 'Muito bem! Quase tudo de primeira.'
          : 'Você acertou ' + n + ' de ' + total + '. Jogue de novo.'));
        host.innerHTML = fimHtml(cfg, n, total, cfg.resumoFim || 'Você ligou tudo!', msg) + (cfg.extraFim || '') + K.rodape(cfg);
        upgrade(host);
        K.falar('Você ligou tudo! ' + n + ' de ' + total + ' de primeira.', 0.85);
        subir();
      }

      render();
      return { reiniciar: render };
    }
  };

  /* ---------- MOTOR: ordem (encaixar cada passo no número certo) ---------- */
  K.motores.ordem = {
    iniciar(cfg, host) {
      const passos = cfg.passos || [];
      const total = passos.length;
      let errados = {}, feitas = 0, primeiras = 0, brilhoTimer = null;

      const diz = (txt, ok) => { const f = host.querySelector('#feed'); if (!f) return; f.textContent = txt; f.className = 'feed ' + (ok ? 'ok' : 'bad'); };
      const atualizar = () => {
        const t = host.querySelector('jogo-topo'); if (t) t.contador = feitas + '/' + total;
        const b = host.querySelector('barra-progresso'); if (b) b.atualizar(feitas, total);
      };
      const alvoHtml = (p, k) =>
        '<div class="alvo" data-id="' + k + '" role="button" tabindex="0" aria-label="Passo ' + (k + 1) + '">' +
          '<span class="num" aria-hidden="true">' + (k + 1) + '</span>' +
          '<p class="frase" data-frase></p><div class="encaixados" data-encaixados></div></div>';
      const pecaHtml = (p, k) => K.pecaHtml({ id: String(k), alvo: String(k), foto: p.foto, nome: p.nome, msg: p.msg });

      function colocar(peca, alvo) {
        if (!peca || !alvo || peca.dataset.feita) return;
        if (alvo.dataset.id === peca.dataset.alvo) acertar(peca, alvo); else errar(peca, alvo);
      }

      function acertar(peca, alvo) {
        const p = passos[+peca.dataset.id];
        peca.dataset.feita = '1';
        peca.classList.remove('sel'); peca.classList.add('encaixada');
        K.arrasto.limpar();
        const caixa = alvo.querySelector('[data-encaixados]'); if (caixa) caixa.appendChild(peca);
        alvo.classList.remove('brilho'); alvo.classList.add('feito');
        const fr = alvo.querySelector('[data-frase]'); if (fr) fr.textContent = p.msg;
        alvo.setAttribute('aria-label', 'Passo ' + (alvo.dataset.id | 0) + ': ' + p.msg);
        feitas++; if (!errados[peca.dataset.id]) primeiras++;
        diz('✓ ' + p.msg, true); K.falar(p.msg, 0.85);
        atualizar();
        if (feitas >= total) setTimeout(fim, 700);
      }

      function errar(peca, alvo) {
        errados[peca.dataset.id] = true;
        peca.dataset.tent = String((+peca.dataset.tent || 0) + 1);
        const n = (+alvo.dataset.id) + 1;
        const p = passos[+peca.dataset.alvo];
        const certo = host.querySelector('.alvo[data-id="' + peca.dataset.alvo + '"]');
        if (certo) { certo.classList.add('brilho'); if (brilhoTimer) clearTimeout(brilhoTimer); brilhoTimer = setTimeout(() => certo.classList.remove('brilho'), 2000); }
        const msg = 'Aqui é o passo ' + n + ': ' + passos[n - 1].msg;
        diz('✗ ' + msg, false); K.falar(msg, 0.85);
      }

      function render() {
        errados = {}; feitas = 0; primeiras = 0;
        const ids = K.embaralhar(passos.map((p, k) => k));
        host.innerHTML =
          topoHtml(cfg, '0/' + total) + barraHtml(0, total) +
          '<section class="card">' + falaHtml(cfg.fala || cfg.instrucao) +
            (cfg.dica ? '<p class="hint">' + K.esc(cfg.dica) + '</p>' : '') +
            (cfg.apoio ? falaHtml(cfg.apoio) : '') +
            (cfg.detalhes ? '<details class="detalhes"><summary>' + K.esc(cfg.detalhes.titulo) + '</summary><p>' + K.esc(cfg.detalhes.texto) + '</p>' + falaHtml(cfg.detalhes.texto) + '</details>' : '') +
          '</section>' +
          '<section class="card">' +
            '<div class="alvos">' + passos.map(alvoHtml).join('') + '</div>' +
            '<div class="bandeja">' + ids.map(k => pecaHtml(passos[k], k)).join('') + '</div>' +
            '<p class="feed" id="feed" aria-live="polite"></p>' +
          '</section>' + K.rodape(cfg);
        upgrade(host);
        host.querySelectorAll('.peca').forEach(p => K.arrasto.ligar(p, colocar, q => { const pp = q && passos[+q.dataset.id]; if (pp) K.falar(pp.nome, 0.85); }));
        host.querySelectorAll('.alvo').forEach(a => K.arrasto.ligarAlvo(a, colocar));
        subir();
      }

      function fim() {
        K.progresso.melhor(cfg.id, primeiras);
        const msg = cfg.msgFim || (primeiras === total ? 'Muito bem! Você pôs tudo na ordem certa.'
          : 'Você pôs tudo na ordem. Pode jogar de novo.');
        host.innerHTML = fimHtml(cfg, primeiras, total, cfg.resumoFim || 'Tudo na ordem certa!', msg) + (cfg.extraFim || '') + K.rodape(cfg);
        upgrade(host); subir();
      }

      render();
      return { reiniciar: render };
    }
  };

  /* ---------- MOTOR: trilha (linha do tempo; só a parada destacada avança) ---------- */
  K.motores.trilha = {
    iniciar(cfg, host) {
      const paradas = cfg.paradas || [];
      const n = paradas.length;
      const instrucao = cfg.instrucao || 'Toque na parada destacada.';
      let i = 0;

      const diz = (txt, ok) => { const f = host.querySelector('#feed'); if (!f) return; f.textContent = txt; f.className = 'feed ' + (ok ? 'ok' : 'bad'); };
      const paradaHtml = (p, k) => {
        const feita = k < i, atual = k === i, vista = k <= i;
        return '<div class="parada' + (feita ? ' feita' : '') + (atual ? ' atual' : '') + '" data-i="' + k + '" role="button" tabindex="0" ' +
          'aria-label="' + K.esc(atual ? 'Parada de ' + p.ano + '. Toque aqui.' : 'Parada de ' + p.ano) + '">' +
          '<span class="ano">' + K.esc(p.ano) + '</span>' +
          (vista ? (p.foto ? '<img src="' + K.esc(p.foto) + '" alt="' + K.esc(p.alt || '') + '">' : '')
                 : (p.foto ? '<span class="oculta" aria-hidden="true">?</span>' : '')) +
          (feita ? '<span class="marca" aria-hidden="true">✓</span>' : '') +
          (feita ? '<p class="frase">' + K.esc(p.frase) + '</p>' : '') + '</div>';
      };
      const painelHtml = () => {
        const p = paradas[Math.min(i, n - 1)];
        const texto = p.ano + '. ' + p.frase + (p.completo ? ' ' + p.completo : '');
        return '<section class="card painel" aria-live="polite">' +
          (p.foto ? '<img class="foto painel-foto" src="' + K.esc(p.foto) + '" alt="' + K.esc(p.alt || '') + '">' : '') +
          '<div class="texto"><p class="ano">' + K.esc(p.ano) + '</p>' +
          '<p class="frase">' + K.esc(p.frase) + '</p>' +
          (p.completo ? '<p class="completo">' + K.esc(p.completo) + '</p>' : '') +
          falaHtml(texto) + '</div></section>';
      };

      function render() {
        host.innerHTML =
          topoHtml(cfg, i + '/' + n) + barraHtml(i, n) +
          '<section class="card">' + falaHtml(instrucao) + '<p class="hint">' + K.esc(cfg.dica || instrucao) + '</p>' +
            '<div class="trilha">' + paradas.map(paradaHtml).join('') + '</div>' +
            '<p class="feed" id="feed" aria-live="polite"></p>' +
          '</section>' + (cfg.painel ? painelHtml() : '') + K.rodape(cfg);
        upgrade(host);
        const cont = host.querySelector('jogo-topo [data-contador]'); if (cont) cont.setAttribute('aria-live', 'polite');
        host.querySelectorAll('.parada').forEach(el => {
          const k = +el.dataset.i;
          el.addEventListener('click', () => tocar(k));
          el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocar(k); } });
        });
        subir();
      }

      function tocar(k) {
        if (k !== i) { const ano = paradas[i].ano; diz('✗ Agora é a parada de ' + ano + '.', false); K.falar('Agora é a parada de ' + ano + '.', 0.85); return; }
        const p = paradas[i]; i++;
        render(); diz('✓ ' + p.frase, true); K.falar(p.frase, 0.85);
        if (i === n) setTimeout(fim, 700);
      }

      function fim() {
        K.progresso.melhor(cfg.id, n);
        host.innerHTML = fimHtml(cfg, n, n, cfg.resumoFim || 'Você visitou todas as paradas!', cfg.msgFim || 'Muito bem!') +
          (cfg.extraFim || '') + K.rodape(cfg);
        upgrade(host); subir();
      }

      function reiniciar() { i = 0; render(); }
      render();
      return { reiniciar };
    }
  };

  /* ========== ponto de entrada ========== */
  K.iniciar = function (cfg) {
    const host = app();
    const motor = cfg && K.motores[cfg.tipo];
    if (!host || !motor) {
      if (host) host.innerHTML = '<section class="card"><p class="pergunta">Jogo não encontrado.</p>' +
        '<p class="rodape"><a href="index.html">← Todos os tópicos</a></p></section>';
      return null;
    }
    let jogo = motor.iniciar(cfg, host);
    const irTopico = () => { try { location.href = topicoUrl(cfg); } catch (e) {} };
    document.addEventListener('voltar', irTopico);
    document.addEventListener('fim', e => {
      if (e.detail && e.detail.acao === 'denovo') jogo = motor.iniciar(cfg, host);
      else irTopico();
    });
    return jogo;
  };

  window.JogoKit = K;
  K.aplicarSkin();
})();
