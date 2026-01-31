# 🏛️ Ouvidoria Participa DF - Frontend

![React](https://img.shields.io/badge/React-19.2.1-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1.7-F24E1E?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.14-06B6D4?logo=tailwindcss)

**Interface web de alta performance para o sistema de Ouvidoria do Participa DF.**

**[Acessar Aplicação](https://ouvidoria.simplificagov.com)** | **[Documentação API](https://ouvidoria.simplificagov.com/docs)**

---

## 🎯 Visão Geral

Esta interface foi construída utilizando as tecnologias mais recentes do ecossistema Frontend para garantir velocidade, acessibilidade e uma experiência de usuário (UX) fluida. O projeto é um **PWA (Progressive Web App)** focado em cidadania digital.

## 💡 Funcionalidades Principais

- **Manifestações Multimídia**: Envio de relatos via texto, áudio, foto e vídeo (integrado com Lucide React e Framer Motion).
- **Geolocalização**: Seleção precisa do local do ocorrido via **Leaflet**.
- **Segurança e Privacidade**: Opção de anonimato e validação rigorosa de dados com **Zod** e **React Hook Form**.
- **Interface Inclusiva**: Componentes baseados em **Radix UI** garantindo total acessibilidade (WAI-ARIA).
- **Gráficos e Gestão**: Dashboards interativos utilizando **Recharts**.

## 🛠️ Stack Tecnológica

- **Core**: React 19 (v19.2.1) & Vite 7.
- **Estilização**: Tailwind CSS v4 & Framer Motion (animações).
- **UI Components**: Radix UI & Shadcn/UI.
- **Navegação**: Wouter (roteamento leve).
- **Mapas**: React Leaflet.
- **Gerenciador de Pacotes**: NPM.

---

## 🧑‍💻 Instalação e Execução

### 1. Requisitos

- Node.js (v20 ou superior)

### 2. Configuração inicial

```bash
# Clone o repositório
git clone [https://github.com/participadf/frontend.git](https://github.com/participadf/frontend.git)
cd frontend
```

# Instale as dependências

```bash
npm install
```

### 3. Scripts Disponíveis

- Desenvolvimento: pnpm dev (roda com suporte a rede --host)

- Build de Produção: `npm run build`

- Preview: `npm run preview` (testa o build localmente)

- Lint/Check: `npm run check` (validação de tipos TS)

- Formatação: `npm run format` (Prettier)

### 4. Configuração do ambiente

As configurações da API localizam-se em `src/lib/api.ts.` Certifique-se de atualizar a URL base conforme seu ambiente:

```api.ts
import.meta.env.VITE_API_BASE ?? "https://api.simplificagov.com";
```

Faça a alteração da URL também em **vite.config.ts**

## 🚀 Execução

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev

```

A aplicação estará disponível em **http://localhost:3000** para você testar localmente.

### Gerando o PWA (Progressive Web App)

A aplicação já está configurada como um PWA. Para testar o comportamento de PWA (offline e instalação):

1. Acesse o site no navegador.
2. Use a opção para **"Adicionar à tela inicial"** (disponível no Chrome e outros navegadores modernos).
3. Aplique a **experiência offline** ao desligar a conexão de internet e navegar pela interface.

## 💻 Estrutura do Projeto

```
CG_PARTICIPADF_OUVIDORIA/
├── client/                     # Raiz do projeto frontend
│   ├── public/                 # Arquivos públicos (assets estáticos globais)
│   ├── src/                    # Código-fonte principal
│   │   ├── components/         # Componentes reutilizáveis (UI)
│   │   ├── contexts/           # Gerenciamento de estado (Context API)
│   │   ├── hooks/              # Custom Hooks personalizados
│   │   ├── lib/                # Configurações de bibliotecas (ex: axios, prisma, shadcn)
│   │   ├── pages/              # Páginas/Rotas da aplicação
│   │   ├── App.tsx             # Componente raiz
│   │   ├── index.css           # Estilos globais
│   │   └── main.tsx            # Ponto de entrada do React (render)
│   ├── index.html              # HTML principal (entry point do Vite)
│   ├── node_modules/           # Dependências instaladas
│   ├── .gitignore              # Arquivos ignorados pelo Git
│   ├── .prettierrc             # Configuração de formatação de código
│   ├── components.json         # Configuração do shadcn/ui (provavelmente)
│   ├── package.json            # Scripts e dependências
│   ├── tsconfig.json           # Configuração do TypeScript
│   └── vite.config.ts          # Configuração do bundler Vite
└── ...                         # Outros arquivos de configuração (.prettierignore, etc)
```

## Video demo

Youtube: [Demo](https://github.com/Maysamkt)

## 🤝 Contribuindo

1. **Fork** o repositório
2. Crie uma **branch** (`git checkout -b feature/nova-feature`)
3. Faça o **commit** (`git commit -m 'Adicionar nova feature'`)
4. Envie a branch para o **seu fork** (`git push origin feature/nova-feature`)
5. Abra uma **pull request** para a branch principal

## 📜 Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🧑‍💻 Membros da Equipe

- **Maikon Santos** – Desenvolvedor Fullstack  
  GitHub: [@Maikon-sant](https://github.com/Maikon-sant)

- **Maysa Santos** – Tech Lead & Desenvolvedora Fullstack  
  GitHub: [@Maysamkt](https://github.com/Maysamkt)

## 🔗 Links úteis

- **API Participa DF (Documentação):** [https://api.simplificagov.com/docs](https://api.simplificagov.com/docs)
- **Frontend Participa DF (Este Repositório):** [https://github.com/participadf/frontend](https://github.com/participadf/frontend)
- **Deploy:** [https://ouvidoria.simplificagov.com](https://ouvidoria.simplificagov.com)

## 📞 Suporte

- Email: [suporte@participadf.com](mailto:suporte@participadf.com)
- 🐛 **Issues:** GitHub Issues
- 💬 **Discussões:** GitHub Discussions

## 🌍 Acessibilidade

A aplicação foi desenvolvida com foco em **acessibilidade** e **usabilidade**, proporcionando uma interface fácil de usar para gestores e analistas públicos. Se você tiver sugestões de melhorias, por favor, envie uma **issue** ou contribua diretamente no repositório.
