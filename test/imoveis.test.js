console.log("Iniciando execução do arquivo imoveis.test.js...");

import request from "supertest";
import { expect } from "chai";
import app from "file:///D:/Projetos/imobiliaria-api/src/app.js";

console.log("Verificando importação do app.js...");
console.log("Tipo do app importado:", typeof app);

let tokenCorretor;
let tokenCliente;

// ===============================================
// 🔹 Geração de tokens antes dos testes
// ===============================================
before(async () => {
  // Login como corretor
  const loginCorretor = await request(app)
    .post("/auth/login")
    .send({
      email: "vicky@teste.com",
      senha: "123456", // corrigido (antes estava "123446")
    });

  tokenCorretor = loginCorretor.body.token;

  // Login como cliente
  const loginCliente = await request(app)
    .post("/auth/login")
    .send({
      email: "carlos.mendes@email.com",
      senha: "123456",
    });

  tokenCliente = loginCliente.body.token;
});

// ===============================================
// 🔹 Testes de listagem de imóveis (GET /imoveis)
// ===============================================
describe("Listagem de imóveis", () => {
  it("Deve permitir que o corretor visualize todos os imóveis", async () => {
    const response = await request(app)
      .get("/imoveis") // ✅ corrigido — antes estava sem a barra inicial
      .set("Authorization", `Bearer ${tokenCorretor}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
  });

  it("Deve permitir que o cliente visualize todos os imóveis", async () => {
    const response = await request(app)
      .get("/imoveis") // ✅ corrigido — antes estava sem a barra inicial
      .set("Authorization", `Bearer ${tokenCliente}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
  });
});

// ===============================================
// 🔹 Testes de criação de imóvel (POST /imoveis)
// ===============================================
describe("Cadastro de imóveis", () => {
  it("Deve permitir que o corretor cadastre um novo imóvel", async () => {
    const novoImovel = {
      titulo: "Apartamento Teste",
      descricao: "Descrição do apartamento teste",
      endereco: "Rua Teste, 123 - São Paulo/SP",
      metragem: 75,
      preco: 350000,
    };

    const response = await request(app)
      .post("/imoveis")
      .set("Authorization", `Bearer ${tokenCorretor}`)
      .send(novoImovel);

    expect(response.status).to.equal(201);
    expect(response.body).to.include.keys(
      "id",
      "titulo",
      "descricao",
      "endereco",
      "metragem",
      "preco"
    );
  });

  it("Não deve permitir que o cliente cadastre um novo imóvel", async () => {
    const novoImovel = {
      titulo: "Cadastro de imóvel Teste Cliente",
      descricao: "Descrição do imóvel teste pelo cliente",
      endereco: "Avenida Cliente, 456 - Rio de Janeiro/RJ",
      metragem: 85,
      preco: 450000,
    };

    const response = await request(app)
      .post("/imoveis")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send(novoImovel);

    expect(response.status).to.be.oneOf([401, 403]);
  });

  it("Deve negar cadastro de imóvel sem token", async () => {
    const imovelSemToken = {
      titulo: "Imóvel Sem Token",
      descricao: "Descrição do imóvel sem token",
      endereco: "Rua Sem Token, 789 - Belo Horizonte/MG",
      metragem: 90,
      preco: 500000,
    };

    const response = await request(app).post("/imoveis").send(imovelSemToken);

    expect(response.status).to.equal(401);
  });
});
