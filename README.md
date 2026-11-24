# Guia Docker 🐳

Curso de Docker em português, do zero ao avançado, organizado em **3 níveis + projetos + referência**. Vale para Linux, macOS e Windows (WSL2).

Cada aula explica o comando parte por parte (anatomia), mostra a saída real do terminal, várias formas de fazer e os erros mais comuns com a mensagem verdadeira. Toda saída foi conferida no **Docker Engine 27.x**.

Para pratiquer, as páginas trazem o **terminal simulado** (`.try`): uma máquina fictícia `ana@notebook` com imagens e containers de mentira, onde você digita comandos `docker` de verdade (simulados) e vê a resposta na hora, com missões verificadas automaticamente.

Site 100% estático (HTML + CSS + JS, sem build e sem dependências externas): abre direto no navegador e funciona no GitHub Pages.

## Estrutura

```
index.html                 página inicial
<tema>.html                uma aula por tema
assets/style.css           visual (tema claro/escuro automático, cor azul Docker)
assets/site.js             níveis/menu (lista NIVEIS), Anterior/Próximo, exercícios
assets/dockersim.js        o simulador de terminal Docker + interface das caixas .try
tools/                     ferramentas de teste (em breve)
CONTRIBUINDO.md            como escrever uma aula
```

## O que o simulador sabe

Comandos `docker`: `run` (-d, -it, --name, -p, -e, -v, --rm), `ps` (-a), `images`, `pull`, `stop/start/restart`, `rm`, `rmi`, `logs`, `exec`, `inspect`, `stats`, `build`, `tag`, `network`, `volume`, `system df/prune`, `compose`, `info`, `version`, `--help`.

Comandos de shell básicos: `clear`, `echo`, `help`, `exit`, `sudo docker …`.

## Limitações do simulador

- Não fala com a internet (pull/push/login são simulados).
- Não roda containers de verdade (exec -it mostra mensagem).
- IDs, tamanhos e stats são fictícios (mas no formato real).

## Publicar no GitHub Pages

Envie a pasta para um repositório e ative **Settings → Pages → Deploy from a branch → main / (root)**.
