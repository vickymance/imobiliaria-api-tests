console.log("Iniciando execução do arquivo imoveis-update.test.js...");

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
// Testes de atualização de imóveis (PUT /imoveis/{id})
// ===============================================
describe("Atualização de imóveis", () => {
  it("Deve permitir que o corretor atualize informações de um imóvel existente", async () => {
    // Primeiro, obtemos a lista de imóveis existentes
    const lista = await request(app)
      .get("/imoveis")
      .set("Authorization", `Bearer ${tokenCorretor}`);

    expect(lista.status).to.equal(200);
    expect(lista.body).to.be.an("array").that.is.not.empty;

    const imovelExistente = lista.body[0]; // pega o primeiro da lista

    const imovelAtualizado = {
      ...imovelExistente,
      cidade: "São Paulo",
      bairro: "Centro",
      rua: "Rua Atualizada, 123",
      metragem: 90,
      descricao: "Apartamento reformado via teste automatizado",
      preco: 550000,
    };

    const response = await request(app)
      .put(`/imoveis/${imovelExistente.id}`)
      .set("Authorization", `Bearer ${tokenCorretor}`)
      .send(imovelAtualizado);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("bairro", "Centro");
  });

  it("Deve retornar erro ao tentar atualizar um imóvel inexistente", async () => {
    const imovelInexistente = {
      id: 99999,
      cidade: "São Paulo",
      bairro: "Centro",
      rua: "Rua Atualizada, 123",
      metragem: 90,
      descricao: "Apartamento reformado via teste automatizado",
      preco: 550000,
    };

    const response = await request(app)
      .put(`/imoveis/${imovelInexistente.id}`)
      .set("Authorization", `Bearer ${tokenCorretor}`)
      .send(imovelInexistente);

    expect(response.status).to.equal(404);
  });

  it("Deve negar atualização sem token", async () => {
    const imovelSemToken = {
      id: 1,
      cidade: "Campinas",
      bairro: "Taquaral",
      rua: "Rua Sem Token, 456",
      metragem: 80,
      descricao: "Tentativa de atualizar sem token",
      preco: 480000,
    };

    const response = await request(app)
      .put(`/imoveis/${imovelSemToken.id}`)
      .send(imovelSemToken);

    expect(response.status).to.equal(401);
  });

  it("Deve negar atualização quando o token for de cliente", async () => {
    const imovelTokenErrado = {
      id: 1,
      cidade: "Guarulhos",
      bairro: "Centro",
      rua: "Rua Token Errado, 789",
      metragem: 100,
      descricao: "Tentativa de cliente atualizar imóvel",
      preco: 500000,
    };

    const response = await request(app)
      .put(`/imoveis/${imovelTokenErrado.id}`)
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send(imovelTokenErrado);

    expect(response.status).to.be.oneOf([401, 403]);
  });
});



