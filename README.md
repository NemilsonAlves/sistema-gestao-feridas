# 🏥 Sistema de Gestão de Feridas - Comissão de Pele

Sistema completo para gestão e acompanhamento de feridas desenvolvido para profissionais de saúde, com foco na documentação, tratamento e evolução de feridas.

## 🚀 Funcionalidades

### 👥 **Gestão de Usuários**
- Sistema de autenticação seguro
- Registro e login de profissionais
- Controle de acesso baseado em sessões

### 🏥 **Gestão de Pacientes**
- Cadastro completo de pacientes
- Histórico médico e informações de contato
- Busca e filtragem avançada
- Estatísticas de pacientes ativos

### 🩹 **Gestão de Feridas**
- Registro detalhado de feridas
- Classificação por tipo, localização e gravidade
- Acompanhamento da evolução
- Medições e observações clínicas
- Status de cicatrização

### 💊 **Gestão de Tratamentos**
- Planejamento de tratamentos personalizados
- Programação de frequência e duração
- Controle de produtos e materiais
- Acompanhamento de responsáveis
- Status de tratamentos (agendado, concluído, cancelado)

### 📸 **Sistema de Imagens**
- Upload de múltiplas imagens por ferida
- Suporte a câmera do dispositivo
- Galeria com visualização, zoom e rotação
- Descrições detalhadas para cada imagem
- Download e gerenciamento de arquivos
- Documentação visual da evolução

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones modernos

### **Backend**
- **Next.js API Routes** - APIs RESTful
- **Prisma ORM** - Gerenciamento de banco de dados
- **SQLite** - Banco de dados local
- **Zod** - Validação de schemas
- **bcryptjs** - Criptografia de senhas

### **Funcionalidades Avançadas**
- **Upload de Arquivos** - Sistema de imagens integrado
- **Autenticação JWT** - Sessões seguras
- **Middleware** - Proteção de rotas
- **Responsive Design** - Interface adaptável
- **Real-time Updates** - Atualizações dinâmicas

## 📋 Pré-requisitos

- **Node.js** 18.0 ou superior
- **npm** ou **yarn**
- **Git**

## 🚀 Instalação e Configuração

### 1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/sistema-gestao-feridas.git
cd sistema-gestao-feridas
```

### 2. **Instale as dependências**
```bash
npm install
```

### 3. **Configure o banco de dados**
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Visualizar banco de dados
npx prisma studio
```

### 4. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (gere uma chave segura)
JWT_SECRET="sua-chave-secreta-muito-segura-aqui"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="outra-chave-secreta-para-nextauth"
```

### 5. **Execute o projeto**
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # APIs RESTful
│   │   ├── auth/          # Autenticação
│   │   ├── patients/      # Gestão de pacientes
│   │   ├── wounds/        # Gestão de feridas
│   │   ├── treatments/    # Gestão de tratamentos
│   │   └── images/        # Sistema de imagens
│   ├── dashboard/         # Páginas do dashboard
│   │   ├── patients/      # Interface de pacientes
│   │   ├── wounds/        # Interface de feridas
│   │   └── treatments/    # Interface de tratamentos
│   ├── login/             # Página de login
│   └── register/          # Página de registro
├── components/            # Componentes reutilizáveis
│   └── ui/               # Componentes de interface
├── contexts/             # Contextos React
├── lib/                  # Utilitários e configurações
└── middleware.ts         # Middleware de autenticação

prisma/
├── schema.prisma         # Schema do banco de dados
└── migrations/           # Migrações do banco

public/
└── uploads/              # Arquivos de upload
    └── wounds/           # Imagens das feridas
```

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:
- Tokens armazenados em cookies httpOnly
- Middleware de proteção de rotas
- Sessões seguras com expiração automática

## 📊 Banco de Dados

### **Modelos Principais:**
- **User** - Usuários do sistema
- **Patient** - Pacientes cadastrados
- **Wound** - Feridas registradas
- **Treatment** - Tratamentos planejados
- **WoundImage** - Imagens das feridas

### **Relacionamentos:**
- Um paciente pode ter múltiplas feridas
- Uma ferida pode ter múltiplos tratamentos
- Uma ferida pode ter múltiplas imagens
- Todos os registros são associados ao usuário criador

## 🎨 Interface do Usuário

### **Design System:**
- **Cores:** Paleta médica profissional
- **Tipografia:** Inter font para legibilidade
- **Componentes:** Shadcn/ui para consistência
- **Responsividade:** Mobile-first approach
- **Acessibilidade:** Padrões WCAG implementados

### **Funcionalidades da Interface:**
- Dashboard com estatísticas em tempo real
- Formulários com validação em tempo real
- Tabelas com busca, filtros e paginação
- Modais para ações rápidas
- Feedback visual para todas as ações

## 📱 Recursos Mobile

- Interface totalmente responsiva
- Suporte à câmera do dispositivo
- Upload de imagens otimizado
- Navegação touch-friendly
- Performance otimizada para dispositivos móveis

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Linting
npm run lint

# Prisma Studio
npx prisma studio

# Reset do banco de dados
npx prisma migrate reset
```

## 🚀 Deploy

### **Vercel (Recomendado)**
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### **Outras Plataformas**
- **Netlify:** Suporte completo ao Next.js
- **Railway:** Deploy com banco PostgreSQL
- **Heroku:** Com add-on de banco de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

Desenvolvido pela equipe da Comissão de Pele para modernizar o cuidado e acompanhamento de feridas.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**Sistema de Gestão de Feridas** - Cuidado profissional, tecnologia moderna. 🏥✨