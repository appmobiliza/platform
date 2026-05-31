## Variáveis de ambiente

O pacote `@mobiliza/env` centraliza a validação e a organização das variáveis de ambiente do Mobiliza.

### Responsabilidades

* validar variáveis por contexto
* separar configuração de cliente e servidor
* manter aliases e exports previsíveis
* evitar acesso direto e espalhado a `process.env`

### Exportações públicas

* `@mobiliza/env`
* `@mobiliza/env/api`
* `@mobiliza/env/auth`
* `@mobiliza/env/realtime`
* `@mobiliza/env/shared`
* `@mobiliza/env/base-url`

### Observação

As aplicações devem importar as variáveis apenas pelos módulos públicos deste pacote, em vez de acessar o ambiente diretamente.