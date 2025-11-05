console.log("Iniciando execução do arquivo corretores.test.js...");

import request from "supertest";
import { expect } from "chai";
import app from "file:///D:/Projetos/imobiliaria-api/src/app.js";

console.log("Verificando importação do app.js...");
console.log("Tipo do app importado:", typeof app);

let tokenCorretor;
let tokenCliente;

// ===============================================
// Geração de tokens antes dos testes
// ===============================================
before(async () => {
  // Login como corretor
  const loginCorretor = await request(app)
    .post("/auth/login")
    .send({
      email: "vicky@teste.com",
      senha: "123456",
    });

  tokenCorretor = loginCorretor.body.token;

  // Login do cliente
  const loginCliente = await request(app)
    .post("/auth/login")
    .send({
      email: "carlos.mendes@email.com",
      senha: "123456",
    });

  tokenCliente = loginCliente.body.token;
});

// ===============================================
// Testes de listagem de corretores (GET /corretores)
// ===============================================
describe("Listagem de corretores", () => {
  it("Deve permitir que o corretor visualize todos os corretores", async () => {
    const response = await request(app)
      .get("/corretores")
      .set("Authorization", `Bearer ${tokenCorretor}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
    if (response.body.length > 0) {
      expect(response.body[0]).to.have.property("nome");
      expect(response.body[0]).to.have.property("email");
    }
  });

  it("Deve negar acesso à listagem de corretores para cliente", async () => {
    const response = await request(app)
      .get("/corretores")
      .set("Authorization", `Bearer ${tokenCliente}`);

    expect(response.status).to.be.oneOf([401, 403]);
  });

  it("Deve negar acesso sem token de autenticação", async () => {
    const response = await request(app).get("/corretores");
    expect(response.status).to.equal(401);
  });

  // ===============================================
  // Testes de criação de corretores (POST /corretores)
  // ===============================================
  describe("Criação de corretores", () => {
    it("Deve permitir que o corretor crie um novo corretor", async () => {
      const novoCorretor = {
        nome: "Corretor de Teste",
        email: `corretor${Date.now()}@teste.com`,
        senha: "123456",
        role: "corretor",
      };
  
      const response = await request(app)
        .post("/corretores")
        .set("Authorization", `Bearer ${tokenCorretor}`)
        .send(novoCorretor);
  
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("email", novoCorretor.email);
    });
  
    it("Deve negar criação sem token", async () => {
      const corretorSemToken = {
        nome: "Sem Token",
        email: `semtoken${Date.now()}@teste.com`,
        senha: "123456",
        role: "corretor",
      };
  
      const response = await request(app)
        .post("/corretores")
        .send(corretorSemToken);
  
      expect(response.status).to.equal(401);
    });
  
    it("Deve negar criação quando token for de cliente", async () => {
      const corretorComTokenCliente = {
        nome: "Token Cliente",
        email: `clientetentando${Date.now()}@teste.com`,
        senha: "123456",
        role: "corretor",
      };
  
      const response = await request(app)
        .post("/corretores")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send(corretorComTokenCliente);
  
      expect(response.status).to.be.oneOf([401, 403]);
    });
});
});

