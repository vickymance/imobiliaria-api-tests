console.log("Iniciando execução do arquivo clientes-delete.test.js...");

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
// Testes de exclusão de clientes (DELETE /clientes/{id})
// ===============================================
describe("Exclusão de clientes", () => {
  it("Deve permitir que o corretor exclua um cliente existente", async () => {
    // Cria um cliente novo para depois excluir
    const novoCliente = {
      nome: "Cliente Teste Exclusão",
      telefone: "11988887777",
      email: `cliente.exclusao${Date.now()}@teste.com`,
      regiao: "Zona Sul",
      ultimaAtualizacao: "2025-11-05",
      proximaAtualizacao: "2025-12-05",
      anotacao: "Cliente criado para teste de exclusão",
    };

    const cadastro = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${tokenCorretor}`)
      .send(novoCliente);

    expect(cadastro.status).to.equal(201);
    const clienteId = cadastro.body.id;

    // Agora tenta excluir
    const response = await request(app)
      .delete(`/clientes/${clienteId}`)
      .set("Authorization", `Bearer ${tokenCorretor}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("message", "Cliente removido com sucesso");
  });

  it("Deve retornar erro ao tentar excluir um cliente inexistente", async () => {
    const response = await request(app)
      .delete("/clientes/999999")
      .set("Authorization", `Bearer ${tokenCorretor}`);

    expect(response.status).to.equal(404);
  });

  it("Deve negar exclusão sem token", async () => {
    const response = await request(app).delete("/clientes/1");
    expect(response.status).to.equal(401);
  });

  it("Deve negar exclusão quando o token for de cliente", async () => {
    const response = await request(app)
      .delete("/clientes/1")
      .set("Authorization", `Bearer ${tokenCliente}`);

    expect(response.status).to.be.oneOf([401, 403]);
  });
});
