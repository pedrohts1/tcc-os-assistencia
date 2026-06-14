CREATE TABLE IF NOT EXISTS Clientes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(20) UNIQUE,
    cnpj VARCHAR(20) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Equipamentos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    tipo VARCHAR(50),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    numero_serie VARCHAR(100) UNIQUE,
    voltagem TEXT,
    codigos_patrimonio TEXT,
    CONSTRAINT fk_cliente_id FOREIGN KEY (client_id) REFERENCES Clientes(id)
);

CREATE TABLE IF NOT EXISTS Tecnicos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Pecas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    quant_estoque INTEGER DEFAULT 0,
    preco_venda DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS Ordens_Servico(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipamento_id INTEGER,
    tecnico_id INTEGER,
    stat VARCHAR(50) CHECK (stat IN ('Aguardando Avaliação','Aguardando Autorização Orçamento','Autorizado, Aguardando Peça','Autorizado, Reparo em Andamento','Pronto, Avisar Cliente','Finalizado')),
    tipo_os VARCHAR(50),
    tipo_atendimento VARCHAR(50),
    defeito_relatado TEXT,
    laudo_tecnico TEXT,
    acessorios TEXT,
    aparencia TEXT,
    observacoes TEXT,
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2),
    CONSTRAINT fk_equipamento_id FOREIGN KEY (equipamento_id) REFERENCES Equipamentos(id),
    CONSTRAINT fk_tecnicos_id FOREIGN KEY (tecnico_id) REFERENCES Tecnicos(id)
);
