# Clinical Data Privacy Rules

## Purpose

Estas regras protegem dados clínicos e dados pessoais utilizados no PsiqApp.

O MVP atual é destinado exclusivamente a desenvolvimento e validação com dados fictícios.

## Rule precedence

Privacidade e isolamento de dados têm precedência sobre conveniência de desenvolvimento, observabilidade e velocidade de implementação.

## MVP data restrictions

- O MVP deve utilizar exclusivamente dados fictícios.
- Nunca adicionar dados reais de pacientes em seed, fixture, mock, snapshot, teste, exemplo, documentação ou demo.
- Nunca utilizar prontuário real como massa de teste.
- A ausência de autenticação no MVP local não autoriza uso de dados reais.

## Logging

Nunca registrar em logs:

- conteúdo integral de pareceres;
- prontuário completo;
- resposta integral da IA contendo conteúdo clínico;
- CPF completo sem necessidade operacional explícita;
- chaves, tokens, cookies, secrets ou credenciais;
- dados clínicos sensíveis em mensagens de erro.

Logs devem priorizar identificadores técnicos, estados, duração, códigos de erro e metadados mínimos necessários para diagnóstico operacional.

## AI provider data minimization

- Enviar ao provedor de IA somente os dados necessários para a análise.
- Nunca enviar dados de outro paciente no mesmo contexto.
- Nunca concatenar históricos de pacientes diferentes.
- Não enviar campos cadastrais sem necessidade para a análise.
- Não enviar secrets, configurações internas ou dados de infraestrutura para o provider.
- O nome do paciente só deve ser enviado se existir necessidade explícita definida na TechSpec; preferir identificadores ou omissão quando possível.

## Patient isolation

Toda consulta, análise, evidência, job ou operação relacionada a prontuário deve respeitar isolamento por paciente.

É proibido:

- retornar parecer de outro paciente;
- usar parecer de outro paciente como contexto de IA;
- associar evidência a registro de outro paciente;
- associar análise ao paciente incorreto;
- reutilizar cache/contexto entre pacientes sem isolamento seguro.

## Secrets and configuration

- Nunca versionar `.env` contendo valores reais.
- Nunca versionar API keys, tokens ou credenciais.
- `.env.example` deve conter apenas placeholders.
- Secrets devem ser fornecidos por configuração externa apropriada.

## Future production use

Antes de permitir dados reais, o projeto deve ter decisão explícita e documentação atualizada sobre:

- LGPD;
- autenticação;
- autorização;
- criptografia;
- hospedagem;
- backup;
- retenção;
- auditoria;
- gestão de secrets;
- logs;
- fornecedores externos;
- processamento de dados por provedores de IA.

Nenhuma Task isolada pode considerar o produto pronto para dados reais sem esse processo explícito.
