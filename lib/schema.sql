CREATE TABLE Clientes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(20) UNIQUE,
    cnpj VARCHAR(20) UNIQUE,
    endereco TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE Equipamentos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    tipo VARCHAR(50),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    numero_serie VARCHAR(100) UNIQUE,
    voltagem ENUM('110V','220V','Bivolt'),
    CONSTRAINT fk_cliente_id FOREIGN KEY (client_id) REFERENCES Clientes(id)
);

CREATE TABLE Tecnicos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50)
);

CREATE TABLE Pecas(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    quant_estoque INT DEFAULT 0,
    preco_venda DECIMAL(10,2)
);

CREATE TABLE Ordens_Servico(
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT,
    tecnico_id INT,
    stat VARCHAR(50),
    defeito_relatado TEXT,
    laudo_tecnico TEXT,   
    acessorios TEXT,
    data_entrada TIMESTAMP DEFAULT,
    valor_total DECIMAL(10,2),
    CONSTRAINT fk_equipamento_id FOREIGN KEY (id) REFERENCES Equipamentos(id),
    CONSTRAINT fk_tecnicos_id FOREIGN key (id) REFERENCES Tecnicos(id)
);
