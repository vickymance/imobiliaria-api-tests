console.log("Iniciando execução do arquivo register.test.js...");

import request from "supertest";
import { expect } from "chai";
import app from "file:///D:/Projetos/imobiliaria-api/src/app.js";

console.log("Verificando importação do app.js...");
console.log("Tipo do app importado:", typeof app);

// ===============================================
// Testes de registro de novo CORRETOR
// ===============================================
describe("Registro de corretor", () => {
  it("Deve cadastrar um novo corretor com sucesso", async () => {
    const novoCorretor = {
      nome: "Corretor Teste",
      email: `corretor${Date.now()}@teste.com`, // Email único
      senha: "123456",
      role: "corretor"
    };

    const response = await request(app)
      .post("/auth/register")
      .send(novoCorretor);

    expect(response.status).to.equal(201);
    expect(response.body).to.include.keys("id", "nome", "email", "role");
    expect(response.body.role).to.equal("corretor");
  });

  it("Deve retornar 400 se o tipo de usuário for inválido", async () => {
    const usuarioInvalido = {
      nome: "Usuario Invalido",
      email: "invalido@teste.com",
      senha: "123456",
      role: "admin" // Tipo inválido
    };

    const response = await request(app)
      .post("/auth/register")
      .send(usuarioInvalido);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("message", "Tipo de usuário inválido.");
  });
});

// ===============================================
// Testes de registro de novo CLIENTE
// ===============================================
describe("Registro de cliente", () => {
  it("Deve cadastrar um novo cliente com sucesso", async () => {
    const novoCliente = {
      nome: "Cliente Teste",
      email: `cliente${Date.now()}@teste.com`, // Email único
      senha: "123456",
      role: "cliente"
    };

    const response = await request(app)
      .post("/auth/register")
      .send(novoCliente);

    expect(response.status).to.equal(201);
    expect(response.body).to.include.keys("id", "nome", "email", "role");
    expect(response.body.role).to.equal("cliente");
  });

  it("Deve retornar 400 se o email já estiver cadastrado", async () => {
    const usuarioExistente = {
      nome: "Usuario Existente",
      email: "existente@teste.com",
      senha: "123456",
      role: "cliente"
    };

    const response = await request(app)
      .post("/auth/register")
      .send(usuarioExistente);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("message", "Email já cadastrado");
  });

  it("Deve retornar 400 se faltar algum campo obrigatório", async () => {
    const clienteIncompleto = {
      nome: "Cliente Sem Senha",
      email: `cliente_sem_senha${Date.now()}@teste.com`,
      senha: "123456",
      role: "cliente",
    };

    const response = await request(app)
      .post("/auth/register")
      .send(clienteIncompleto);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("message", "Campos obrigatórios ausentes.");
  });
});
