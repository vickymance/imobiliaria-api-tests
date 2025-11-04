console.log("Iniciando execução do arquivo clientes.test.js...");

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
// Testes de listagem de clientes (GET /clientes)
// ===============================================
describe("Listagem de clientes", () => {
  it("Deve permitir que o corretor visualize todos os clientes", async () => {
    const response = await request(app)
      .get("/clientes")
      .set("Authorization", `Bearer ${tokenCorretor}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
  });

  it("Não deve permitir que o cliente visualize todos os clientes", async () => {
    const response = await request(app)
      .get("/clientes")
      .set("Authorization", `Bearer ${tokenCliente}`);

    expect(response.status).to.be.oneOf([401, 403]);
  });
});

// ===============================================
// Testes de criação de cliente (POST /clientes)
// ===============================================
describe("Cadastro de cliente", () => {
  it("Deve permitir que o corretor cadastre um novo cliente", async () => {
    const novoCliente = {
      nome: "Cliente Teste Automatizado",
      telefone: "11999998888",
      email: `cliente.teste${Date.now()}@teste.com`,
      regiao: "São Paulo - SP",
      ultimaAtualizacao: "2025-11-04",
      proximaAtualizacao: "2025-12-04",
      anotacao: "Cliente criado automaticamente via teste"
    };

    const response = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${tokenCorretor}`)
      .send(novoCliente);

    // ✅ Verifica o status da resposta
    expect(response.status).to.equal(201);

    // ✅ Verifica se os campos esperados estão presentes
    expect(response.body).to.include.keys(
      "id",
      "nome",
      "telefone",
      "email",
      "regiao",
      "ultimaAtualizacao",
      "proximaAtualizacao",
      "anotacao"
    );

    // ✅ Verifica se os valores retornados batem com o que foi enviado
    expect(response.body.nome).to.equal(novoCliente.nome);
    expect(response.body.telefone).to.equal(novoCliente.telefone);
    expect(response.body.email).to.equal(novoCliente.email);
    expect(response.body.regiao).to.equal(novoCliente.regiao);

    // ✅ Confirma que o campo id foi gerado automaticamente
    expect(response.body.id).to.be.a("number").and.to.be.greaterThan(0);
  });

  it("Não deve permitir que o cliente cadastre um novo cliente", async () => {
    const novoCliente = {
      nome: "Cliente Teste - Restrição de Acesso",
      telefone: "11888887777",
      email: `cliente.restrito${Date.now()}@teste.com`,
      regiao: "Rio de Janeiro - RJ",
      ultimaAtualizacao: "2025-11-04",
      proximaAtualizacao: "2025-12-04",
      anotacao: "Teste de restrição de acesso para clientes"
    };

    const response = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send(novoCliente);

    expect(response.status).to.be.oneOf([401, 403]);
  });

  it("Deve negar cadastro de cliente sem token", async () => {
    const clienteSemToken = {
      nome: "Cliente Sem Token",
      telefone: "11777776666",
      email: `cliente.semtoken${Date.now()}@teste.com`,
      regiao: "Belo Horizonte - MG",
      ultimaAtualizacao: "2025-11-04",
      proximaAtualizacao: "2025-12-04",
      anotacao: "Tentativa sem token"
    };

    const response = await request(app)
      .post("/clientes")
      .send(clienteSemToken);

    expect(response.status).to.equal(401);
  });
});
