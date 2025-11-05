console.log("Iniciando execução do arquivo clientes-update.test.js...");

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
// Testes de atualização de clientes (PUT /clientes/{id})
// ===============================================
describe("Atualização de clientes", () => {
  it("Deve permitir que o corretor atualize informações de um cliente existente", async () => {
    // Primeiro, obtemos a lista de clientes existentes
    const lista = await request(app)
      .get("/clientes")
      .set("Authorization", `Bearer ${tokenCorretor}`);

    expect(lista.status).to.equal(200);
    expect(lista.body).to.be.an("array").that.is.not.empty;

    const clienteExistente = lista.body[0]; // pega o primeiro da lista

    const clienteAtualizado = {
      ...clienteExistente,
      nome: "Cliente Atualizado via Teste",
      telefone: "11988887777",
      regiao: "Zona Sul",
      anotacao: "Atualização automatizada com sucesso",
    };

    const response = await request(app)
      .put(`/clientes/${clienteExistente.id}`)
      .set("Authorization", `Bearer ${tokenCorretor}`)
      .send(clienteAtualizado);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("nome", "Cliente Atualizado via Teste");
  });

  it("Deve retornar erro ao tentar atualizar um cliente inexistente", async () => {
    const clienteInexistente = {
      id: 99999,
      nome: "Cliente Inexistente",
      telefone: "11999999999",
      email: "inexistente@teste.com",
      regiao: "Norte",
      ultimaAtualizacao: "2025-11-05",
      proximaAtualizacao: "2025-12-05",
      anotacao: "Tentativa de atualizar cliente que não existe",
    };

    const response = await request(app)
      .put(`/clientes/${clienteInexistente.id}`)
      .set("Authorization", `Bearer ${tokenCorretor}`)
      .send(clienteInexistente);

    expect(response.status).to.equal(404);
  });

  it("Deve negar atualização sem token", async () => {
    const clienteSemToken = {
      id: 1,
      nome: "Cliente Sem Token",
      telefone: "11977776666",
      email: "sem.token@teste.com",
      regiao: "Centro",
      ultimaAtualizacao: "2025-11-05",
      proximaAtualizacao: "2025-12-05",
      anotacao: "Tentativa de atualizar sem autenticação",
    };

    const response = await request(app)
      .put(`/clientes/${clienteSemToken.id}`)
      .send(clienteSemToken);

    expect(response.status).to.equal(401);
  });

  it("Deve negar atualização quando o token for de cliente", async () => {
    const clienteTokenErrado = {
      id: 1,
      nome: "Cliente Token Errado",
      telefone: "11955554444",
      email: "token.errado@teste.com",
      regiao: "Leste",
      ultimaAtualizacao: "2025-11-05",
      proximaAtualizacao: "2025-12-05",
      anotacao: "Tentativa de cliente atualizar outro cliente",
    };

    const response = await request(app)
      .put(`/clientes/${clienteTokenErrado.id}`)
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send(clienteTokenErrado);

    expect(response.status).to.be.oneOf([401, 403]);
  });
});

