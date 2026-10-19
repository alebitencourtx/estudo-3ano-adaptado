# 🌟 Projeto Estudo 3º Ano Adaptado (TEA)

Uma plataforma educacional web, interativa e inclusiva, especialmente desenhada para apoiar crianças neurodivergentes (com foco no Transtorno do Espectro Autista - TEA) no aprendizado dos conteúdos do 3º ano do Ensino Fundamental.

---

## 🎯 Propósito Pedagógico & Diretrizes TEA

O projeto foi construído respeitando as melhores práticas de design inclusivo e neurociência aplicada à educação:
- **Redução de Sobrecarga Sensorial:** Paletas de cores equilibradas, contrastes acessíveis e ausência de flashes ou ruídos estridentes.
- **Previsibilidade & Rotina:** Transições suaves entre fases, feedback imediato positivo e instruções claras sem ambiguidade.
- **Multissensorialidade Guiada:**
  - **Áudio Sintetizado Suave:** Efeitos sonoros gerados puramente via Web Audio API (sem dependência de arquivos externos pesados de som).
  - **Voz Fluida e Acolhedora:** Leitura assistida por voz neural/feminina via Web Speech Synthesis, filtrando emojis para manter a cadência natural e focar no significado das palavras.
  - **Experiências 3D Interativas:** Modelos lúdicos em Three.js onde a criança aprende explorando o espaço, girando cenários, descobrindo elementos e fixando o vocabulário temático.

---

## 🕹️ Funcionalidades & Módulos

### 1. Testes & Quizzes de Fixação
- Perguntas adaptadas com dicas visuais e reforço positivo.
- Foco curricular alinhado à Base Nacional Comum Curricular (BNCC), com destaque atual para **História e Geografia (Base Livro)**.

### 2. Jogos 3D Interativos (Three.js)
Mini-mundos interativos exploráveis:
- 🌾 **Agricultura 3D:** Ciclo do plantio, irrigação, colheita e respeito à terra.
- 🐄 **Pecuária 3D:** Criação de animais, pastagens, ordenha e cuidados com o bem-estar animal.
- 🏙️ **Campo e Cidade em Diferentes Tempos:** Evolução histórica, comparação campo x cidade, praça do coreto, cinema antigo, ferrovia e iluminação pública.
- 🌳 **Extrativismo 3D:** Coleta sustentável vegetal, mineral e animal.
- 🏭 **Indústria 3D:** Transformação da matéria-prima em produtos do cotidiano.
- 🗺️ **Pontos Cardeais 3D:** Orientação espacial, bússola e localização.

### 3. PWA (Progressive Web App)
- Funciona 100% offline após a primeira carga graças ao Service Worker (`sw.js`).
- Instalável no celular, tablet ou computador diretamente pelo navegador com ícone dedicado e experiência em tela cheia.

---

## 🚀 Como Executar Localmente

Como o projeto é estritamente estático (Vanilla HTML5, CSS3, ES6+ e Three.js r128 via CDN), você só precisa de um servidor HTTP simples:

```bash
# Inicie um servidor HTTP local (Python 3):
python -m http.server 8000
```

Abra em seu navegador:
- Painel Principal / Testes: `http://localhost:8000/index.html`
- Jogos 3D: `http://localhost:8000/jogos/`

---

## 📦 Pipeline de Build e Deploy

O projeto conta com um script de automação rigoroso em PowerShell: `publicar.ps1`.

Ele garante:
1. Validação estática de sintaxe de todos os arquivos JavaScript (`node --check`) e scripts embutidos no HTML.
2. Conferência de integridade de imagens referenciadas.
3. Bloqueio estrito de arquivos inesperados ou vazamento de rascunhos para a pasta pública.
4. Sincronização com o repositório de publicação (`publish-estudo-3ano-adaptado`) e deploy automático no GitHub Pages.

Para simular o deploy (Dry Run):
```powershell
.\publicar.ps1 -DryRun
```

Para publicar em produção:
```powershell
.\publicar.ps1 -Msg "Sua mensagem descritiva de commit"
```

---

## 🤝 Diretrizes para Desenvolvedores e Agentes de IA

Se você é um desenvolvedor ou um agente autônomo de IA colaborando neste projeto, consulte obrigatoriamente o arquivo [`AGENTS.md`](./AGENTS.md). Ele contém detalhes sobre a arquitetura de dados dos jogos, regras de acessibilidade e convenções de código.
