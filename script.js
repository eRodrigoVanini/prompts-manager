// Key para identificar os dados salvos pela aplicação no navegador.
// Para indetificadr no navegador aonde estão os dados, recuperar, exibir na aplicação e direcionar onde salvar. Tem que ser uma constante.
const STORAGE_KEY = "prompts-storage"

//Estado para carregar os prompts salvos e exibi-los.
//Será um objeto vazio. An empty array.
const state = {
  prompts: [],
  selectedId: null, //Para identificar o prompt selecionado. Começará sem prompts selecionado. (null). Quando eu selecionar um prompt, o id dele será salvo aqui. É importante para mostrar o prompt correto na área de edição e quando eu quiser deletar ou salvar.
}

// Select elements by ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

// Funções para abrir e fechar a sidebar
function openSidebar() {
  elements.sidebar.classList.add("open")
  elements.sidebar.classList.remove("collapsed")
}

function closeSidebar() {
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.add("collapsed")
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
//O trim() remove espaços em branco do início e do fim do texto.
//O "!" é a negação.
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0

  wrapper.classList.toggle("is-empty", !hasText)
}

// Atualiza o estado de todos os elementos editáveis
//Quando uso elements. (elements ponto), significa que estou acessando o objeto (criado acima). Então ao usar elements.promptTitle, estou acessando o promptTitle que absorvi do html através do objeto criado no inicio deste código.
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de evento para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })
  elements.promptContent.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })

  // Atualiza o estado inicial
  updateAllEditableStates()
}

// Função de inicialização
function init() {
  load() //Carrega os prompts do localStorage
  renderList("") //Renderiza a lista de prompts na sidebar
  attachAllEditableHandlers() //Anexa os ouvintes de evento para os elementos editáveis
  updateAllEditableStates() //Atualiza o estado inicial dos wrappers
}

// Executa a inicialização
init()

//Função para salvar os prompts no localStorage
function save() {
  const title = elements.promptTitle.textContent.trim()
  // const content = elements.promptContent.textContent.trim() -> Caso eu utiliza-se essa função, o conteúdo do prompt seria salvo sem a formatação de texto. Ou seja, sem negrito, itálico, listas, etc.
  const content = elements.promptContent.innerHTML.trim() //Usando innerHTML, o conteúdo do prompt será salvo com a formatação de texto.
  const hasContent = elements.promptContent.textContent.trim() //Para verificar se há conteúdo no prompt, eu devo utilizar o texto sem formatação, pois se eu utilizar com formatação ele vai pegar algumas tags HTML que não são visíveis e considerar como texto digitado pelo usuário.

  if (!title || !hasContent) {
    alert("Título e conteúdo não podem estar vazios.")
    return
  }

  //Para saber se o usuário está criando um novo prompt ou editando (salvando) um existente, eu verifico se o selectedId no estado é nulo ou não.
  if (state.selectedId) {
    // Editando um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || "Sem conteúdo"
    }
  } else {
    // Criando um novo prompt, com um novo id e etc.
    const newPrompt = {
      id: Date.now().toString(36), //Gera um ID único baseado no timestamp atual.
      title,
      content,
    }

    state.prompts.unshift(newPrompt) //Adiciona o novo prompt no início do array. Se utiliza-se o "push", o prompt seria adicionado no final do array.
    state.selectedId = newPrompt.id //Define o novo prompt como o selecionado.
  }

  renderList()
  persist() //Salva o estado atualizado no localStorage.
  alert("Prompt salvo com sucesso!")
}

//Função com ESTRUTURA TRY CATCH, que tenta executar um código (try) e, se ocorrer um erro, captura o erro e posso manipulá-lo (catch).
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log("Erro ao salvar no localStorage:", error)
  }
}

// Função para carregar os prompts do localStorage. Para que não ocorra de ao digitar um novo prompt e atualizar a página, o prompt digitado anteriormente desapareça.
function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY) //Aqui estou pegando os dados do localStorage.
    state.prompts = storage ? JSON.parse(storage) : [] //Se houver dados no localStorage, eu faço o parse (conversão) dos dados de volta para um array de objetos. Se não houver dados, eu inicializo como um array vazio.
    state.selectedId = null //Ao carregar, nenhum prompt estará selecionado.

    console.log(state.prompts) //Para verificar se os dados foram carregados corretamente.
  } catch (error) {
    console.log("Erro ao carregar do localStorage:", error)
  }
} //Por fim, devo adicionar a função load() na inicialização do function init(), para que os dados sejam carregados assim que a aplicação iniciar.

//Aqui eu estou criando um template literal para criar o HTML de cada item da lista de prompts. Essa função recebe um objeto prompt como parâmetro e retorna uma string com o HTML formatado.
function createPromptItem(prompt) {
  const tmp = document.createElement("div")
  tmp.innerHTML = prompt.content

  return `
      <li class="prompt-item" data-id="${prompt.id}" data-action="select">
        <div class="prompt-item-content">
          <span class="prompt-item-title">${prompt.title}</span>
          <span class="prompt-item-description">${tmp.textContent}</span>
     
          </div>
        <button class="btn-icon" title="Remover" data-action="remove">
          <img src="./assets/remove.svg"alt="Remover"class="icon icon-trash" />
        </button>
      </li>
  `
}

//Aqui eu estou renderizando a lista de prompts na sidebar.
function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

function copySelected() {
  try {
    const content = elements.promptContent

    navigator.clipboard.writeText(content.innerText)
  } catch (error) {
    console.log("Erro ao copiar para a área de transferência:", error)
  }
}

// Eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)
elements.search.addEventListener("input", (e) => {
  renderList(e.target.value)
})

elements.list.addEventListener("click", (e) => {
  const removeBtn = e.target.closest("[data-action='remove']")
  const item = e.target.closest("[data-id]")

  if (!item) return //Se não clicar em um item da lista, não faz nada.

  const id = item.getAttribute("data-id")
  state.selectedId = id //Define o prompt clicado como o selecionado.

  if (removeBtn) {
    //Remover prompt
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value) //Re-renderiza a lista após a remoção
    persist() //Salva o estado atualizado no localStorage.
    return
  }

  if (e.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.innerHTML = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

elements.btnOpen.addEventListener("click", openSidebar)
elements.btnCollapse.addEventListener("click", closeSidebar)
