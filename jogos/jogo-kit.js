/* ===== Jogo Kit — utilidades e componentes web estáticos =====
   Script clássico (sem build, sem módulo): funciona em http:// e em file://
   Carregar no <head>:  <script src="jogo-kit.js"></script>

   O que tem aqui:
     JogoKit.esc / embaralhar / aplicarSkin / falar (TTS pt-BR)
     JogoKit.progresso.ler() .gravar(id, valor) .melhor(id, valor)   (localStorage)
     JogoKit.arrasto.ligar(peca, aoLargar, aoSelecionar)             (dedo + mouse + toque)
     JogoKit.arrasto.ligarAlvo(alvo, aoToque)
     <fala-botoes texto="...">            botões 🔊 Ouvir / 🐢 Devagar
     <barra-progresso valor="0" total="4">
     <jogo-topo icone="" titulo="" contador="" rotulo-voltar="">  → evento "voltar"
     <tela-fim icone="" titulo="" estrelas="2" total="3" resumo="" msg=""> → evento "fim" (detail.acao: 'denovo'|'outros')
*/
(function () {
  'use strict';
  const K = {};

  /* ---------- utilidades ---------- */
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

  /* herda a skin escolhida no treino (azul/rosa) — não é obrigatório */
  K.aplicarSkin = () => {
    try {
      const t = JSON.parse(localStorage.getItem('treino3ano.v1') || '{}');
      document.documentElement.dataset.skin = (t && t.skin) === 'rosa' ? 'rosa' : 'azul';
    } catch (e) { document.documentElement.dataset.skin = 'azul'; }
  };

  K.ouvir = (texto, taxa) => K.falar(texto, taxa || 0.85);

  /* ---------- progresso (recorde por jogo) ---------- */
  K.CHAVE = 'treino3ano.jogos.v1';
  K.progresso = {
    ler() { try { return JSON.parse(localStorage.getItem(K.CHAVE) || '{}') || {}; } catch (e) { return {}; } },
    gravar(id, valor) {
      try { const p = K.progresso.ler(); p[id] = valor; localStorage.setItem(K.CHAVE, JSON.stringify(p)); } catch (e) {}
    },
    melhor(id, valor) {                            // guarda o melhor resultado
      try {
        const p = K.progresso.ler();
        if (!(p[id] >= valor)) { p[id] = valor; localStorage.setItem(K.CHAVE, JSON.stringify(p)); }
        return p[id];
      } catch (e) { return valor; }
    }
  };

  /* ---------- arrastar e soltar (dedo + mouse) com modo toque ---------- */
  K.arrasto = (function () {
    let sel = null;
    const alvoEm = (x, y) => { const a = document.elementFromPoint(x, y); return a ? a.closest('.alvo') : null; };
    const limparQuase = () => document.querySelectorAll('.alvo.quase').forEach(a => a.classList.remove('quase'));
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

  K.pecaHtml = (p) =>                       // helper para montar uma peça
    '<div class="peca' + (p.foto ? ' foto' : '') + '" data-id="' + K.esc(p.id) + '" data-alvo="' + K.esc(p.alvo || '') +
    '" data-msg="' + K.esc(p.msg || '') + '" data-tent="0" role="button" tabindex="0" aria-label="' + K.esc(p.alt || p.nome || '') + '">' +
      '<img src="' + K.esc(p.ico || p.foto) + '" alt="">' +
      (p.alt ? '' : '<span class="nome">' + K.esc(p.nome || '') + '</span>') +
    '</div>';

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

  /* ---------- <jogo-topo ...> → evento "voltar" ---------- */
  class JogoTopo extends HTMLElement {
    connectedCallback() {
      const icone = this.getAttribute('icone') || '';
      const titulo = this.getAttribute('titulo') || '';
      const contador = this.getAttribute('contador') || '';
      const rotulo = this.getAttribute('rotulo-voltar') || '← Fases';
      this.innerHTML =
        '<header class="top small" style="display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;margin-bottom:10px">' +
          '<button type="button" class="mini" data-voltar>' + K.esc(rotulo) + '</button>' +
          '<span class="fase-nome" style="margin:0">' + K.esc(icone) + ' ' + K.esc(titulo) + '</span>' +
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
          '<h2 class="fase-nome">' + K.esc(icone) + ' ' + K.esc(titulo) + '</h2>' +
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

  /* ---------- <opcoes-resposta> → evento "resposta" (detail: {ok, indice, certa}) ----------
     Uso:
       const r = document.createElement('opcoes-resposta');
       r.montar({ pergunta:'...', opcoes:['a','b','c'], certa:1, msg:'A vida é assim.', icones:[url,url,url] });
     Feedback imediato: ao tocar, marca ✓/✗, mostra sempre a resposta certa e emite "resposta".
     Para sim/não, use opcoes:['Sim','Não'] e certa:'Sim' ou o índice. */
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

  /* ---------- <fichas-toque> → evento "conferido" (detail: {ok, escolhidas, certas}) ----------
     Uso:
       const f = document.createElement('fichas-toque');
       f.montar({ pergunta:'Toque nas 2 ...', fichas:[{nome:'a',ico:url},'b','c'], certas:['a','b'], msg:'...' });
     Toca para marcar (até o número de certas), um botão "Conferir" revela ✓/✗ e a resposta certa. */
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

  /* ---------- MOTORES DECLARATIVOS REUTILIZÁVEIS (DRY & Boas Práticas) ---------- */

  // Motor para Jogos de Memória (elimina ~180 linhas de duplicação por jogo)
  K.iniciarMemoria = function (cfg) {
    const app = document.getElementById('app') || document.body;
    const pares = cfg.pares || [];
    const total = pares.length;
    const idProg = cfg.id;
    const espera = cfg.espera || 850;
    let timer = null;
    let estado = { paresAcertados: 0, tentativas: 0, primeira: null, trava: false };

    function lerRecorde() {
      const p = K.progresso.ler();
      const r = p[idProg];
      return typeof r === 'number' && isFinite(r) ? r : null;
    }

    function renderPartida() {
      if (timer) { clearTimeout(timer); timer = null; }
      estado = { paresAcertados: 0, tentativas: 0, primeira: null, trava: false };
      const rec = lerRecorde();
      const cartas = K.embaralhar(pares.concat(pares));

      app.innerHTML =
        '<jogo-topo icone="' + K.esc(cfg.icone) + '" titulo="' + K.esc(cfg.titulo) + '" contador="0/' + total + '" rotulo-voltar="← Fases"></jogo-topo>' +
        '<barra-progresso valor="0" total="' + total + '"></barra-progresso>' +
        '<section class="card">' +
          '<p class="pergunta" id="instrucao">' + K.esc(cfg.instrucao || 'Encontre os dois iguais.') + '</p>' +
          '<fala-botoes texto="' + K.esc(cfg.instrucao || 'Encontre os dois iguais.') + '"></fala-botoes>' +
          '<div class="tabuleiro" id="tabuleiro" aria-label="Cartas do jogo" style="margin-top:16px">' +
            cartas.map(function (b) {
              return '<div class="carta" data-id="' + K.esc(b.id) + '" role="button" tabindex="0" aria-label="Carta fechada"><span class="verso">?</span></div>';
            }).join('') +
          '</div>' +
          '<p class="feed" id="feed" aria-live="polite"></p>' +
          '<p class="recorde" id="recorde">' +
            (rec == null ? 'Cada par aparece em duas cartas.' : 'Seu recorde: ' + rec + (rec === 1 ? ' tentativa.' : ' tentativas.')) +
          '</p>' +
        '</section>' +
        (cfg.creditos ? '<details class="detalhes"><summary>Créditos e Conteúdo</summary><p>' + K.esc(cfg.creditos) + '</p></details>' : '') +
        '<p class="rodape"><a href="../index.html">← Todos os jogos</a> · <a href="../../index.html">← Treino</a></p>';

      const topo = app.querySelector('jogo-topo');
      if (topo) topo.addEventListener('voltar', function () { location.href = cfg.voltarUrl || '../index.html'; });

      app.querySelectorAll('.carta').forEach(function (carta) {
        function acao() { tocarCarta(carta); }
        carta.addEventListener('click', acao);
        carta.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); acao(); }
        });
      });
      window.scrollTo(0, 0);
    }

    function tocarCarta(carta) {
      if (estado.trava || carta.classList.contains('virada') || carta.classList.contains('travada')) return;
      const b = pares.find(function (x) { return x.id === carta.dataset.id; });
      if (!b) return;

      carta.classList.add('virada');
      carta.innerHTML = '<img src="' + K.esc(b.ico || b.foto) + '" alt=""><span class="nome">' + K.esc(b.nome) + '</span>';
      carta.setAttribute('aria-label', b.nome);

      if (!estado.primeira) {
        estado.primeira = carta;
        if (b.frase) K.falar(b.nome);
        return;
      }

      estado.tentativas++;
      const p1 = estado.primeira;
      estado.primeira = null;

      if (p1.dataset.id === carta.dataset.id) {
        estado.paresAcertados++;
        p1.classList.add('travada');
        carta.classList.add('travada');
        const feed = app.querySelector('#feed');
        if (feed) { feed.className = 'feed ok'; feed.textContent = '✓ Par encontrado: ' + b.nome + '!'; }
        if (b.frase) K.falar(b.frase);
        const prog = app.querySelector('barra-progresso');
        if (prog) prog.setAttribute('valor', estado.paresAcertados);
        const topo = app.querySelector('jogo-topo');
        if (topo) topo.contador = estado.paresAcertados + '/' + total;

        if (estado.paresAcertados === total) {
          setTimeout(finalizar, 600);
        }
      } else {
        estado.trava = true;
        const feed = app.querySelector('#feed');
        if (feed) { feed.className = 'feed bad'; feed.textContent = 'Diferentes... tente memorizar!'; }
        timer = setTimeout(function () {
          p1.classList.remove('virada');
          p1.innerHTML = '<span class="verso">?</span>';
          carta.classList.remove('virada');
          carta.innerHTML = '<span class="verso">?</span>';
          estado.trava = false;
        }, espera);
      }
    }

    function finalizar() {
      const rec = lerRecorde();
      const bateu = rec == null || estado.tentativas < rec;
      if (bateu) K.progresso.gravar(idProg, estado.tentativas);

      const msg = 'Você completou em ' + estado.tentativas + ' tentativa' + (estado.tentativas > 1 ? 's' : '') + '.' +
        (bateu ? ' Novo recorde!' : (rec ? ' Recorde: ' + rec : ''));

      app.innerHTML =
        '<tela-fim icone="' + K.esc(cfg.icone) + '" titulo="' + K.esc(cfg.titulo) + '" estrelas="3" total="3" resumo="Parabéns!" msg="' + K.esc(msg) + '"></tela-fim>' +
        '<p class="rodape"><a href="../index.html">← Todos os jogos</a> · <a href="../../index.html">← Treino</a></p>';

      const fim = app.querySelector('tela-fim');
      if (fim) {
        fim.addEventListener('fim', function (e) {
          if (e.detail && e.detail.acao === 'denovo') renderPartida();
          else location.href = cfg.voltarUrl || '../index.html';
        });
      }
      K.falar('Parabéns! ' + msg);
    }

    renderPartida();
  };

  customElements.define('fala-botoes', FalaBotoes);
  customElements.define('barra-progresso', BarraProgresso);
  customElements.define('jogo-topo', JogoTopo);
  customElements.define('tela-fim', TelaFim);
  customElements.define('opcoes-resposta', OpcoesResposta);
  customElements.define('fichas-toque', FichasToque);

  window.JogoKit = K;
  K.aplicarSkin();
})();
