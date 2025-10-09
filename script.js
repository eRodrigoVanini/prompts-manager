// Seleção dos elementos por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  if (!element.textContent.trim()) {
    wrapper.classList.add("is-empty")
  } else {
    wrapper.classList.remove("is-empty")
  }
}

// Atualiza o estado de todos os elementos editáveis
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
  attachAllEditableHandlers()
}

// Executa a inicialização
init()
