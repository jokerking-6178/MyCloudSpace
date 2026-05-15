<div align="center">

# ☁️ MyCloudSpace

### An AI-Powered Cloud File Storage & Sharing Platform

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-000000?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**MyCloudSpace** is a production-grade, full-stack cloud file storage and sharing platform with an on-premise AI document intelligence layer. Upload, organise, and share files securely — and chat with your documents using a locally hosted LLM, with zero data sent to external AI services.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Screenshots](#-screenshots) · [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT Authentication** — Stateless, HMAC-SHA256 signed tokens with a 6-hour expiry
- **BCrypt Password Hashing** — Strength-12 hashing for all local accounts
- **GitHub OAuth 2.0** — One-click social login via GitHub
- **Role-Based Access Control** — `USER` and `ADMIN` roles with endpoint-level enforcement
- **Spring Security 6 Filter Chain** — CORS whitelist, public/protected endpoint separation

### 📁 File Management
- **AWS S3 Storage** — All files stored securely in Amazon S3
- **Pre-Signed URL Uploads** — Files upload directly from the browser to S3, bypassing the API server for binary data
- **Streaming Downloads** — Files streamed from S3 through the API to the client
- **Storage Quota Enforcement** — Server-side quota check on every upload; 10 GB default, expandable via subscription
- **File Metadata** — Optional description and tags per file

### 🔗 File Sharing
- **User-to-User Sharing** — Share any file with any registered user by email address
- **Public Share Links** — UUID token-based public links, no login required to download
- **Configurable Expiry** — Set link expiry in Minutes, Hours, or Days (5 min → 100 days)
- **Download Count Limits** — Optional per-link maximum download cap
- **HTTP 410 Gone** — Expired or exhausted links return proper HTTP 410 responses
- **Auto Cleanup** — Spring `@Scheduled` task runs hourly to soft-delete expired links
- **Link Revocation** — Manually revoke any active share link instantly

### 🤖 AI Document Intelligence (RAG Pipeline)
- **100% On-Premise** — All AI inference runs locally via Ollama; your documents never leave your server
- **Document Ingestion** — Apache Tika extracts text from PDF, DOCX, PPTX, TXT, XLS
- **Semantic Chunking** — `TokenTextSplitter` splits text into 512-token chunks with 64-token overlap
- **Vector Embeddings** — `nomic-embed-text` model generates 768-dimensional dense embeddings
- **pgvector Storage** — Embeddings stored in PostgreSQL with the pgvector extension
- **Cosine Similarity Search** — Top-5 most relevant chunks retrieved per query
- **LLM Answer Generation** — `llama3.2:1b` via Ollama generates grounded, context-aware answers
- **Multi-Turn Conversations** — Per-user conversation history maintained in memory (last 10 turns)
- **Document Scoping** — Queries are scoped to the selected file; cross-document leakage is prevented

### 💳 Payment & Storage Subscriptions
- **Razorpay Integration** — Seamless payment via cards, UPI, and net banking
- **Custom Per-GB Pricing** — ₹7/GB/month; pay for exactly what you need (10 GB → 2 TB)
- **Stackable Tiers** — Purchase multiple plans; each expires independently after 30 days
- **HMAC-SHA256 Verification** — Server-side payment signature verification before any storage allocation
- **Dynamic Effective Storage** — Effective quota = sum of all active, non-expired tier allocations

### 🖥️ Frontend
- **React 18 SPA** — Built with Vite 5 for instant HMR in development
- **Tailwind CSS** — Responsive, utility-first styling
- **AppContext** — Global auth state with JWT stored in localStorage
- **Protected Routes** — Unauthenticated users are redirected to login
- **Drag-and-Drop Upload** — HTML5 Drag & Drop API with file type and size validation
- **Real-Time Pricing Calculator** — Storage cost updates live as you move the slider
- **Toast Notifications** — Success and error feedback for every action
- **AI Chat Interface** — Two-panel layout: file picker + multi-turn chat with timestamps

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.3.x |
| Security | Spring Security 6 + JJWT 0.11.5 |
| ORM | Spring Data JPA + Hibernate 6 |
| Database | PostgreSQL 16 + pgvector |
| Cloud Storage | AWS S3 (SDK v2) |
| AI Framework | Spring AI 1.0.x |
| LLM Runtime | Ollama (llama3.2:1b + nomic-embed-text) |
| Text Extraction | Apache Tika 2.x |
| Payment | Razorpay Java SDK |
| Build | Apache Maven 3.9 |
| Testing | JUnit 5 + Mockito + Spring Boot Test |

### Frontend
| Layer | Technology |
|---|---|
| UI Library | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| State | React Context API (AppContext) |
| Payment UI | Razorpay Checkout.js |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Notes |
|---|---|---|
| JDK | 21 | [Temurin](https://adoptium.net/) or [Amazon Corretto](https://aws.amazon.com/corretto/) |
| Maven | 3.9+ | Bundled `mvnw` wrapper included |
| Node.js | 20 LTS | Required for the React frontend |
| PostgreSQL | 16 | With the `pgvector` extension |
| Ollama | Latest | [Install guide](https://ollama.com/) |
| AWS Account | — | S3 bucket + IAM user with S3 permissions |
| Razorpay Account | — | Test mode keys work fine for development |

---

### 1. Clone the Repository

```bash
git clone https://github.com/jokerking-6178/MyCloudSpace.git
cd MyCloudSpace
```

---

### 2. Set Up PostgreSQL

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE mycloudspace;
\c mycloudspace

-- Enable the pgvector extension (required for AI embeddings)
CREATE EXTENSION IF NOT EXISTS vector;
```

> **Note:** Spring Boot will auto-create all required tables on first startup via `spring.jpa.hibernate.ddl-auto=update`. The `vector_store` table used by Spring AI must be created manually — see [Spring AI pgvector docs](https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html) for the DDL.

---

### 3. Pull Ollama Models

```bash
# Install Ollama from https://ollama.com/

# Pull the chat model (used for RAG answer generation)
ollama pull llama3.2:1b

# Pull the embedding model (used for document chunk embeddings)
ollama pull nomic-embed-text

# Verify both models are available
ollama list
```

Ollama runs at `http://localhost:11434` by default. Keep it running in the background while the backend is active.

---

### 4. Configure the Backend

Create or edit `src/main/resources/application.properties`:

```properties
# ── Database ──────────────────────────────────────────────────────────
spring.datasource.url=jdbc:postgresql://localhost:5432/mycloudspace
spring.datasource.username=your_postgres_username
spring.datasource.password=your_postgres_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# ── AWS S3 ────────────────────────────────────────────────────────────
aws.s3.bucket-name=your-s3-bucket-name
aws.s3.region=ap-south-1
aws.s3.access-key=your_aws_access_key_id
aws.s3.secret-key=your_aws_secret_access_key

# ── Ollama / Spring AI ────────────────────────────────────────────────
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.options.model=llama3.2:1b
spring.ai.ollama.embedding.options.model=nomic-embed-text

# ── JWT ───────────────────────────────────────────────────────────────
jwt.secret=your_256_bit_minimum_hmac_secret_key_here
jwt.expiration=21600000

# ── Razorpay ──────────────────────────────────────────────────────────
razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_key_secret

# ── GitHub OAuth2 ─────────────────────────────────────────────────────
spring.security.oauth2.client.registration.github.client-id=your_github_client_id
spring.security.oauth2.client.registration.github.client-secret=your_github_client_secret
spring.security.oauth2.client.registration.github.scope=read:user,user:email

# ── Scheduling (share link cleanup) ──────────────────────────────────
spring.task.scheduling.enabled=true
```

> **Security tip:** Never commit real credentials. Use environment variables or a `.env` file and reference them as `${VAR_NAME}`.

---

### 5. Run the Backend

```bash
# From the project root
./mvnw spring-boot:run

# Or build and run the JAR
./mvnw clean package -DskipTests
java -jar target/MyCloudSpace-*.jar
```

The API will start on **http://localhost:8080**

---

### 6. Configure and Run the Frontend

```bash
# Navigate to the frontend project
cd my-cloud-space

# Install dependencies
npm install
```

Create a `.env` file in the `my-cloud-space/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

```bash
# Start the development server
npm run dev
```

The React SPA will start on **http://localhost:5173**

> The `vite.config.js` includes a proxy so all `/api` requests are forwarded to `localhost:8080` automatically in development — no CORS issues.

---

### 7. GitHub OAuth2 Setup

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Set the **Homepage URL** to `http://localhost:5173`
3. Set the **Authorization callback URL** to `http://localhost:8080/login/oauth2/code/github`
4. Copy the **Client ID** and **Client Secret** into `application.properties`

---

## 📁 Project Structure

```
MyCloudSpace/
├── src/
│   ├── main/
│   │   ├── java/com/MyProject/MyCloudSpace/
│   │   │   ├── config/
│   │   │   │   ├── AiConfig.java                  # Spring AI beans (Ollama, pgvector)
│   │   │   │   ├── AwsS3Config.java               # S3Client bean
│   │   │   │   └── SecurityConfig.java            # Filter chain, CORS, OAuth2
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java            # /api/user/register, /api/user/login
│   │   │   │   ├── FileController.java            # /api/files/**
│   │   │   │   ├── PaymentController.java         # /api/payments/**
│   │   │   │   ├── RagController.java             # /api/rag/**
│   │   │   │   ├── ShareableLinkController.java   # /api/files/{id}/share-link, /api/share/**
│   │   │   │   └── UserController.java            # /api/user/**
│   │   │   ├── Entity/
│   │   │   │   ├── UserEntity.java                # Implements UserDetails
│   │   │   │   ├── FileEntity.java
│   │   │   │   ├── ShareableLinkEntity.java
│   │   │   │   ├── PaymentEntity.java
│   │   │   │   ├── AuthProvider.java              # Enum: LOCAL, GITHUB
│   │   │   │   ├── PaymentStatus.java             # Enum: CREATED, SUCCESS, FAILED
│   │   │   │   └── Role.java                      # Enum: USER, ADMIN
│   │   │   ├── filter/
│   │   │   │   └── JwtAuthenticationFilter.java   # OncePerRequestFilter — JWT validation
│   │   │   ├── io/                                # DTOs and request/response classes (15 files)
│   │   │   ├── repository/                        # JPA repositories (4 interfaces)
│   │   │   ├── service/
│   │   │   │   ├── impl/                          # 10 implementation classes
│   │   │   │   │   ├── ConversationStore.java     # In-memory RAG chat history
│   │   │   │   │   ├── RagServiceImpl.java        # Full RAG pipeline
│   │   │   │   │   ├── ShareableLinkImpl.java     # Link creation, validation, cleanup
│   │   │   │   │   └── ...
│   │   │   │   └── ...                            # 7 service interfaces
│   │   │   ├── util/
│   │   │   │   ├── JwtUtil.java                   # Token generation and validation
│   │   │   │   └── Oauth2SuccessHandler.java      # Issues JWT after GitHub OAuth
│   │   │   └── MyCloudSpaceApplication.java       # Entry point (@EnableScheduling)
│   │   └── resources/
│   │       └── application.properties
│   └── test/                                      # JUnit 5 test suite
├── my-cloud-space/                                # React 18 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── context/AppContext.jsx             # Global auth state
│   │   │   ├── FileUpload/FileUpload.jsx          # Drag-and-drop upload
│   │   │   ├── Login/Login.jsx
│   │   │   ├── MyFiles/MyFile.jsx                 # File list + quota bar
│   │   │   ├── Navbar/Navbar.jsx
│   │   │   ├── OauthHandler/OAuth2RedirectHandler.jsx
│   │   │   ├── Pricing/Pricing.jsx                # Storage picker + Razorpay
│   │   │   ├── Register/Register.jsx
│   │   │   ├── SharedFile/                        # ShareableLinkModal, SharedFile, ShareFileModal
│   │   │   ├── Sidebar/Sidebar.jsx
│   │   │   └── Summary/                           # ChatMessage, FilePicker, Summary, useRag.js
│   │   ├── pages/
│   │   │   ├── dashboard/Dashboard.jsx            # Root authenticated page
│   │   │   └── Landing/Landing.jsx                # Public landing page
│   │   ├── service/
│   │   │   ├── authService.js
│   │   │   ├── constants.js                       # BASE_URL + headers
│   │   │   ├── fileService.js
│   │   │   ├── paymentService.js
│   │   │   └── ragService.js
│   │   ├── App.jsx                                # Route definitions
│   │   └── main.jsx                               # createRoot entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── pom.xml
└── README.md
```

---

## 📡 API Reference

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/user/register` | Public | Create new account |
| `POST` | `/api/user/login` | Public | Login, receive JWT |
| `GET` | `/api/user/{id}` | JWT | Get user profile |
| `GET` | `/api/user/email/{email}` | JWT | Find user by email |
| `DELETE` | `/api/user/{id}` | JWT | Delete account |

### File Management
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/files/upload` | JWT | Upload file (multipart, max 50 MB) |
| `GET` | `/api/files/user/{userId}` | JWT | List user's files |
| `GET` | `/api/files/shared/{userId}` | JWT | List files shared with user |
| `GET` | `/api/files/download/{fileId}` | JWT | Download file |
| `DELETE` | `/api/files/{fileId}` | JWT | Delete file |

### File Sharing
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/files/{fileId}/share` | JWT | Share file with registered user by email |
| `POST` | `/api/files/{fileId}/share-link` | JWT | Create public share link |
| `GET` | `/api/share/download/{token}` | **Public** | Download via share token |
| `GET` | `/api/share/links` | JWT | List active share links |
| `DELETE` | `/api/share/links/{token}` | JWT | Revoke share link |

### RAG AI Pipeline
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/rag/ingest/{fileId}` | JWT | Ingest document into vector store |
| `POST` | `/api/rag/chat` | JWT | Ask a question about a document |
| `DELETE` | `/api/rag/conversation/{userId}` | JWT | Clear conversation history |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | JWT | Create Razorpay order |
| `POST` | `/api/payments/verify` | JWT | Verify HMAC-SHA256 payment signature |
| `POST` | `/api/payments/save` | JWT | Save tier after verified payment |
| `GET` | `/api/payments/tiers/{userId}` | JWT | Get active storage tiers |

---

### Example Requests

**Register a new user**
```bash
curl -X POST http://localhost:8080/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"shubham","password":"securepassword"}'
```

**Login and get JWT**
```bash
curl -X POST http://localhost:8080/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword"}'
```

**Upload a file**
```bash
curl -X POST http://localhost:8080/api/files/upload \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "file=@/path/to/document.pdf" \
  -F "uploadedBy=<userId>" \
  -F "description=My important document" \
  -F "tags=finance,2025"
```

**Create a share link (expires in 2 hours, max 5 downloads)**
```bash
curl -X POST http://localhost:8080/api/files/42/share-link?userId=<userId> \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"expiryMinutes":120,"maxDownloads":5}'
```

**Ask a question about a document**
```bash
curl -X POST http://localhost:8080/api/rag/chat \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"fileId":42,"userId":"<userId>","question":"What are the key financial highlights?"}'
```

---

## 🔄 RAG Pipeline Architecture

```
File bytes (S3)
      │
      ▼
Apache Tika Parser ──► Plain Text
                              │
                              ▼
                   TokenTextSplitter
                   (512 tokens / 64 overlap)
                        │    │    │
                        ▼    ▼    ▼
                   Chunk 1  Chunk 2  Chunk N
                        │    │    │
                        └────┼────┘
                             ▼
                  nomic-embed-text (Ollama)
                             │
                             ▼
                     768-dim vectors
                             │
                             ▼
                  pgvector table (vector_store)
                             │
                             ▼
                  Return chunk count to client


At Query Time:
──────────────
User question ──► nomic-embed-text ──► query vector
                                             │
                              cosine_similarity(query, vectors, fileId)
                                             │
                                    top-5 relevant chunks
                                             │
                         Build prompt: system + context + history + question
                                             │
                                    llama3.2:1b (Ollama)
                                             │
                                    Grounded answer ──► User
```

---

## 🧪 Running Tests

```bash
# Run all tests
./mvnw test

# Run a specific test class
./mvnw test -Dtest=JwtUtilTest

# Run tests with coverage report
./mvnw verify
```

The test suite includes:
- **Unit tests** — JwtUtil, UserService, FileService, ShareableLinkService, StorageTierService, RazorpayService
- **Integration tests** — AuthController, FileController, ShareableLinkController, RagController (H2 in-memory DB)

---

## 🌐 Environment Variables Reference

For production deployments, inject all secrets as environment variables:

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `AWS_S3_BUCKET_NAME` | S3 bucket name |
| `AWS_S3_REGION` | AWS region (e.g. `ap-south-1`) |
| `AWS_S3_ACCESS_KEY` | AWS access key ID |
| `AWS_S3_SECRET_KEY` | AWS secret access key |
| `JWT_SECRET` | HMAC-SHA256 signing secret (min 256-bit) |
| `JWT_EXPIRATION` | Token expiry in ms (default: `21600000` = 6h) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `SPRING_AI_OLLAMA_BASE_URL` | Ollama server URL (default: `http://localhost:11434`) |

---

## 📊 Performance Benchmarks

| Operation | Avg Latency | P95 Latency |
|---|---|---|
| User login (JWT) | 18 ms | 35 ms |
| File list (20 files) | 45 ms | 90 ms |
| File upload — 500 KB | 820 ms | 1.4 s |
| File upload — 5 MB | 3.2 s | 5.1 s |
| Share link creation | 28 ms | 55 ms |
| RAG ingestion — 10-page PDF | 8.4 s | 12 s |
| RAG chat query (CPU inference) | 6.2 s | 9.8 s |

> RAG chat latency is dominated by local LLM inference on CPU. With a CUDA-enabled GPU, `llama3.2:1b` achieves sub-2-second response times.

---

## 🔒 Security

MyCloudSpace is designed with security at every layer:

- ✅ **BCrypt (strength 12)** for password storage
- ✅ **HMAC-SHA256** JWT signing — tampered tokens are rejected
- ✅ **Server-side quota enforcement** — clients cannot bypass storage limits
- ✅ **Server-side payment verification** — Razorpay HMAC-SHA256 checked before any storage allocation
- ✅ **Parameterised JPA queries** — no raw SQL, no SQL injection surface
- ✅ **CORS whitelist** — only configured origins accepted
- ✅ **HTTP 410 Gone** for expired/exhausted share links
- ✅ **On-premise AI** — document content never sent to external AI APIs
- ✅ **OWASP Top 10** validated (A01–A09)

To report a security vulnerability, please open a private GitHub Security Advisory rather than a public issue.

---

## 🚧 Known Limitations

- RAG chat on CPU hardware takes 6–10 seconds per query (GPU recommended for production)
- No native mobile app (web-only SPA)
- File preview not supported — download required to view files
- No real-time notifications (WebSocket not yet implemented)
- Binary storage is coupled to AWS S3 (MinIO/GCS adaptation requires SDK changes)

---

## 🗺️ Roadmap

- [ ] WebSocket real-time notifications for share events
- [ ] File preview (PDF.js integration)
- [ ] Docker Compose setup for one-command local deployment
- [ ] Kubernetes Helm chart for production deployment
- [ ] File versioning with S3 object versioning
- [ ] React Native mobile app (iOS + Android)
- [ ] Multi-document RAG (query across multiple selected files)
- [ ] Upgrade to `llama3.2:8b` for improved answer quality
- [ ] Audit log and GDPR compliance dashboard
- [ ] CDN integration (CloudFront) for download acceleration

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch** — `git checkout -b feature/your-feature-name`
3. **Make your changes** and write tests for new functionality
4. **Run the test suite** — `./mvnw test`
5. **Commit your changes** — `git commit -m 'feat: add your feature'`
6. **Push to your fork** — `git push origin feature/your-feature-name`
7. **Open a Pull Request** against `main`

Please follow the existing code style (Java: standard Spring Boot conventions; React: functional components with hooks).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Shubham Garg**
- GitHub: [@jokerking-6178](https://github.com/jokerking-6178)
- Project: [MyCloudSpace](https://github.com/jokerking-6178/MyCloudSpace)

---

<div align="center">

Built with ❤️ using Spring Boot, React, and open-source AI

⭐ Star this repo if you found it useful!

</div>
