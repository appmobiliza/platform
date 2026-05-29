## Domínio

O pacote `@mobiliza/domain` concentra as regras de negócio do Mobiliza. Ele fica entre os contratos e a persistência, transformando os dados recebidos em ações e fluxos da aplicação.

### Responsabilidades

* implementar casos de uso
* aplicar regras de negócio
* coordenar contratos, banco e tempo real
* manter a lógica central fora das apps

### Dependências centrais

* `@mobiliza/contracts`
* `@mobiliza/db`
* `@mobiliza/realtime`

### Observação

Esse pacote não deve conhecer detalhes de interface. Ele deve permanecer independente de web, mobile e UI.