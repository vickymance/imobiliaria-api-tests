console.log("Iniciando execução do arquivo imoveis-delete.test.js...");

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

describe("Deletar imóveis", () => {
    it("Deve permitir que o corretor delete um imóvel", async () => {
        // Primeiro, obtemos a lista de imóveis existentes
         const novoImovel = {
      cidade: "São Paulo",
      bairro: "Centro",
      rua: "Rua de Teste, 100",
      metragem: 80,
      descricao: "Apartamento para exclusão de teste",
      preco: 450000,
    };

    const cadatro = await request(app)
        .post("/imoveis")
        .set("Authorization", `Bearer ${tokenCorretor}`)
        .send(novoImovel);

    expect(cadatro.status).to.equal(201);

    const imovelId = cadatro.body.id;

        const response = await request(app)
            .delete(`/imoveis/${imovelId}`)
            .set("Authorization", `Bearer ${tokenCorretor}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("message", "Imóvel removido com sucesso.");

    });

    it("Deve retornar erro ao tentar excluir um imóvel inexistente", async () => {
        const response = await request(app)
            .delete(`/imoveis/99999`)
            .set("Authorization", `Bearer ${tokenCorretor}`);

        expect(response.status).to.equal(404);
    });

    it("Deve negar exclusão de imóvel para cliente comum", async () => {
        const response = await request(app).delete("/imoveis/1")
        expect(response.status).to.equal(401);
    });

    it("Deve negar exclusão quando token for de cliente", async () => {
        const response = await request(app)
            .delete(`/imoveis/1`)
            .set("Authorization", `Bearer ${tokenCliente}`);

        expect(response.status).to.be.oneOf([401, 403]);
    });
});
