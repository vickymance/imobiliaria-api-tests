console.log("📂 Iniciando execução do arquivo auth.test.js...");

import request from "supertest";
import { expect } from "chai";
import app from "file:///D:/Projetos/imobiliaria-api/src/app.js";

console.log("✅ Verificando importação do app.js...");
console.log("Tipo do app importado:", typeof app);

// ===============================================
// 🔹 Testes de login do CORRETOR
// ===============================================
describe("Login do corretor", () => {
  it("Deve retornar 200 para login válido", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "vicky@teste.com",
        senha: "123456"
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("token");
    expect(response.body.role).to.equal("corretor");
  });

  it("Deve retornar 401 e mensagem 'Email e/ou senha incorretos' para login inválido", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "emailerrado@teste.com",
        senha: "654321"
      });

    expect(response.status).to.equal(401);
    expect(response.body).to.have.property("message", "Email e/ou senha incorretos");
    expect(response.body).to.not.have.property("role");
  });
});

// ===============================================
// 🔹 Testes de login do CLIENTE
// ===============================================
describe("Login do cliente", () => {
  it("Deve retornar 200 para login válido", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "carlos.mendes@email.com",
        senha: "123456"
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("token");
    expect(response.body.role).to.equal("cliente");
  });

  it("Deve retornar 401 e mensagem 'Email e/ou senha incorretos' para login inválido", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "emailerrado@teste.com",
        senha: "654321"
      });

    expect(response.status).to.equal(401);
    expect(response.body).to.have.property("message", "Email e/ou senha incorretos");
    expect(response.body).to.not.have.property("role");
  });
});

