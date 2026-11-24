# Como contribuir com o Guia Docker

## Adicionar uma aula

1. Crie o arquivo `<tema>.html` na raiz, copiando a estrutura de uma aula existente (head padrão, `<nav class="sidebar">`, `<div class="pager"></div>`, conteúdo, `<script src="assets/site.js">`).
2. Adicione a página na lista `NIVEIS` em `assets/site.js` (no nível e grupo certos). A lista gera o menu lateral, o selo de nível e os botões Anterior/Próximo.
3. Se a aula tiver missão no terminal simulado, use:

```html
<div class="try" data-goal="TEXTO QUE DEVE APARECER NA SAÍDA" data-solucao="comando">
<p class="try-task"><strong>Missão:</strong> …</p>
</div>
```

## Padrão de escrita

- Toda aula começa com `<p class="intro">` e uma caixa `<div class="note">` "Você vai aprender".
- Explique a ideia antes do comando; depois a anatomia (`<dl class="anatomy">`).
- Mostre a saída real em `<pre class="term">$ comando …</pre>`.
- Termine com `<div class="tip">` apontando a próxima aula.
- Erros reais em `<div class="warn">`.

## Testar local

Abra `index.html` no navegador. O simulador carrega `assets/dockersim.js` só nas páginas com `.try`.
