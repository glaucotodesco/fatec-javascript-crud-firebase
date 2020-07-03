/***************************  Modelos ***************************/
class Funcionario {
    constructor(key,codigo, nome, salario) {
        this.key = key;
        this.codigo = codigo;
        this.nome = nome;
        this.salario = salario;
    }

    
}

/*************************** Variaveis Globais ***************************/
var funcionarios = [];
var funcionarioEdicao = null;
var rowEdit = null;


/*************************** Variaveis Banco de Dados  ***************************/
const dbRef    = firebase.database().ref();
const funcsRef = dbRef.child('funcionarios');


/**************************** Load Funcionarios do DB **************************/
funcsRef.on("child_added", snap => {
    
    let f = snap.val();
    f.key = snap.key;
    funcionarios.push(f);
    addNovaLinhaTabelaFuncionarioGUI(f);
});


/*************************** Regras de Negocio ***************************/
/*
  Salva ou Atualiza um Objeto Funcionario
*/
function salvar() {
    //salva um novo funcionario
    if (funcionarioEdicao == null) {
        let codigo = parseInt(document.getElementById("idCodigo").value);
        if (pesquisaFuncionario(codigo) == null) {
            let funcionario = new Funcionario();
            funcionario.codigo = codigo;
            funcionario.nome = document.getElementById("idNome").value
            funcionario.salario = parseFloat(document.getElementById("idSalario").value);
            //funcionarios.push(funcionario);
            //addNovaLinhaTabelaFuncionarioGUI(funcionario);
            limpaFormularioGUI();
            
            //Salva no Banco de Dado, nao salva a key
            funcsRef.push({
                            "codigo"    : funcionario.codigo,
                            "nome"      : funcionario.nome,
                            "salario"   : funcionario.salario
                          });

            alert("Funcionario Cadastrado com Sucesso!");
        }
        else {
            alert("Código já cadastrado!");
        }
    }
    else { //Atualiza um funcionario ja existente
        funcionarioEdicao.nome = document.getElementById("idNome").value
        funcionarioEdicao.salario = parseFloat(document.getElementById("idSalario").value);
        
        //UpDate no Banco de Dados
        funcsRef.child(funcionarioEdicao.key).update(
            {
                "nome"      : funcionarioEdicao.nome,
                "salario"   : funcionarioEdicao.salario
              }
            );
        
        setStatusCadastroGUI();
        limpaFormularioGUI();
        funcionarioEdicao = null;
        alert("Funcionário Atualizado! ");
    }
}

/* 
   Funcao Editar Funcionario
*/
function editarFuncionario(row, funcionario) {
    funcionarioEdicao = funcionario;
    setStatusEdicaoGUI(row, funcionarioEdicao);
}

/*
   Pesquisa um funcionario pelo codigo
*/
function pesquisaFuncionario(codigo) {
    for (let i = 0; i < funcionarios.length; i++) {
        if (funcionarios[i].codigo == codigo) {
            return funcionarios[i];
        }
    }
    return null;
}

/* 
   Funcao Remover Funcionario
*/
function removerFuncionario(rowIndex, funcionario) {
    for (let i = 0; i < funcionarios.length; i++) {
        if (funcionarios[i].codigo == funcionario.codigo) {
            funcionarios.splice(i, 1);
        }
    }

    //Recupera referencia do funcionario no e remove
    funcsRef.child(funcionario.key).remove();
    
  
    removerFuncionarioRowGUI(rowIndex);
}


/*************************** Regras de GUI ***************************/
/*
   Funcao limpa formulario
*/
function limpaFormularioGUI() {
    document.getElementById("formCadastro").reset();
}

/*
    Remove Funcionario da Tabela
*/
function removerFuncionarioRowGUI(rowIndex) {
    document.getElementById("idFuncionariosTable").deleteRow(rowIndex);
}

/* 
   Funcao Adiciona Botoes na Linha da Tabela

   Parametros: Cell e Funcionario
*/
function addBotoesLinhaTableGUI(cell, funcionario) {

    var btnRemover = document.createElement("BUTTON");
    btnRemover.innerHTML = "Remover";
    btnRemover.name = "btnRemover";
    btnRemover.onclick = function () {
        removerFuncionario(cell.parentNode.rowIndex, funcionario);
    };

    cell.appendChild(btnRemover);

    cell.appendChild(document.createTextNode(" "));

    var btnEditar = document.createElement("BUTTON");

    btnEditar.innerHTML = "Editar";
    btnEditar.name = "btnEditar";
    btnEditar.onclick = function () {
        editarFuncionario(cell.parentNode, funcionario);
    };

    cell.appendChild(btnEditar);
}

/*
   Ajusta a interface grafica para o status de Cadastro de um novo funcionario
*/
function setStatusEdicaoGUI(row, funcionario) {
    document.getElementById("idCodigo").value = funcionario.codigo;
    document.getElementById("idNome").value = funcionario.nome;
    document.getElementById("idSalario").value = funcionario.salario;
    document.getElementById("idCodigo").readOnly = true;
    document.getElementById("idStatus").innerHTML = "Editando um Funcionário";

    rowEdit = row;
    let botoesRemover = document.getElementsByName("btnRemover");
    for (let i = 0; i < botoesRemover.length; i++) {
        botoesRemover[i].disabled = true;
    }

}


/*
   Adicionar um objeto funcionario em uma nova linha da tabela
*/
function addNovaLinhaTabelaFuncionarioGUI(funcionario) {
    let tabela = document.getElementById("idFuncionariosTable");
    let linha = tabela.insertRow(funcionarios.length);

    let celCodigo = linha.insertCell(0);
    let celNome = linha.insertCell(1);
    let celSalario = linha.insertCell(2);
    let celBotoes = linha.insertCell(3);

    celCodigo.innerHTML = funcionario.codigo;
    celNome.innerHTML = funcionario.nome;
    celSalario.innerHTML = funcionario.salario.toFixed(2);


    addBotoesLinhaTableGUI(celBotoes, funcionario);

}


/*
   Ajusta a interface grafica para o status de Cadastro de um novo funcionario
*/
function setStatusCadastroGUI() {
    rowEdit.cells[1].innerHTML = funcionarioEdicao.nome;
    rowEdit.cells[2].innerHTML = funcionarioEdicao.salario.toFixed(2);
    document.getElementById("idCodigo").readOnly = false;
    let botoesRemover = document.getElementsByName("btnRemover");
    for (let i = 0; i < botoesRemover.length; i++) {
        botoesRemover[i].disabled = false;
    }
    document.getElementById("idStatus").innerHTML = "Novo Funcionário";
    rowEdit = null;
}



