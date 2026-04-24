Create table Clientes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(20) UNIQUE,
    cnpj VARCHAR(20) UNIQUE,
    endereco TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);